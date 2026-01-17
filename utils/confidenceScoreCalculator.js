import { calculateAverageSuccessScore } from '../models/DecisionReview';

export class ConfidenceScoreCalculator {
  
  static calculateScore(decisions = [], reviews = []) {
    if (decisions.length === 0) {
      return {
        score: 0,
        trend: 'neutral',
        factors: this._getEmptyFactors(),
        insights: ['Treffe deine erste Entscheidung, um deinen Score zu sehen!'],
        message: 'Noch keine Daten vorhanden'
      };
    }

    const clarity = this._clarityScore(decisions);
    const success = this._successScore(decisions, reviews);
    const consistency = this._consistencyScore(decisions);
    const growth = this._growthScore(decisions);

    const score = Math.round(
      (clarity * 0.30) +
      (success * 0.40) +
      (consistency * 0.20) +
      (growth * 0.10)
    );

    const trend = this._calculateTrend(decisions, reviews);

    const insights = this._generateInsights(score, { clarity, success, consistency, growth }, trend);

    return {
      score: Math.max(0, Math.min(100, score)),
      trend,
      factors: {
        clarity: Math.round(clarity),
        success: Math.round(success),
        consistency: Math.round(consistency),
        growth: Math.round(growth)
      },
      insights,
      message: this._getScoreMessage(score)
    };
  }

  static _clarityScore(decisions) {
    if (decisions.length === 0) return 0;

    const clarityScores = decisions.map(d => {
      const finalScore = d.finalScore || 50;
      const distanceFrom50 = Math.abs(finalScore - 50);
      
      return distanceFrom50 * 2; 
    });

    const avgClarity = clarityScores.reduce((sum, s) => sum + s, 0) / clarityScores.length;
    return avgClarity;
  }

  static _successScore(decisions, reviews) {
    if (reviews.length === 0) {

      const avgConfidence = decisions.reduce((sum, d) => {
        const finalScore = d.finalScore || 50;
        const distanceFrom50 = Math.abs(finalScore - 50);
        return sum + distanceFrom50 * 2;
      }, 0) / decisions.length;

      return avgConfidence * 0.7; 
    }

    return calculateAverageSuccessScore(reviews);
  }

  static _consistencyScore(decisions) {
    if (decisions.length < 3) return 50; 

    const scores = decisions.map(d => d.finalScore || 50);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    const consistency = Math.max(0, 100 - (stdDev * 2));
    return consistency;
  }

  static _growthScore(decisions) {
    if (decisions.length < 5) return 50; 

    const sorted = [...decisions].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    const avgFirst = this._clarityScore(firstHalf);
    const avgSecond = this._clarityScore(secondHalf);

    const improvement = avgSecond - avgFirst;

    const growthScore = 50 + (improvement * 2.5);
    return Math.max(0, Math.min(100, growthScore));
  }

  static _calculateTrend(decisions, reviews) {
    if (decisions.length < 5) return 'neutral';

    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    const recent = decisions.filter(d => new Date(d.createdAt) >= thirtyDaysAgo);

    const previous = decisions.filter(d => {
      const date = new Date(d.createdAt);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    if (recent.length === 0 || previous.length === 0) return 'neutral';

    const recentScore = this.calculateScore(recent, reviews.filter(r =>
      recent.some(d => d.id === r.decisionId)
    )).score;

    const previousScore = this.calculateScore(previous, reviews.filter(r =>
      previous.some(d => d.id === r.decisionId)
    )).score;

    const difference = recentScore - previousScore;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  static _generateInsights(score, factors, trend) {
    const insights = [];

    if (score >= 80) {
      insights.push('🎯 Exzellent! Du triffst sehr klare und erfolgreiche Entscheidungen.');
    } else if (score >= 60) {
      insights.push('👍 Gut! Du bist auf dem richtigen Weg.');
    } else if (score >= 40) {
      insights.push('💪 Solide Basis. Mit mehr Übung wirst du noch besser.');
    } else {
      insights.push('🌱 Du bist am Anfang. Jede Entscheidung macht dich stärker.');
    }

    if (trend === 'improving') {
      insights.push('📈 Dein Score steigt - du wirst besser!');
    } else if (trend === 'declining') {
      insights.push('📉 Dein Score sinkt. Nimm dir mehr Zeit oder nutze Full Mode.');
    }

    const weakestFactor = this._getWeakestFactor(factors);
    if (weakestFactor) {
      insights.push(weakestFactor.insight);
    }

    const strongestFactor = this._getStrongestFactor(factors);
    if (strongestFactor && strongestFactor.score >= 80) {
      insights.push(strongestFactor.insight);
    }

    return insights.slice(0, 3); 
  }

  static _getWeakestFactor(factors) {
    const entries = Object.entries(factors);
    const weakest = entries.reduce((min, [key, value]) =>
      value < min.value ? { key, value } : min
    , { key: null, value: 100 });

    if (weakest.value >= 60) return null; 

    const factorInsights = {
      clarity: {
        insight: '🎯 Fokus: Triff klarere Entscheidungen. Nutze Full Mode für mehr Sicherheit.',
        tip: 'Nimm dir mehr Zeit für die Analyse.'
      },
      success: {
        insight: '🔄 Fokus: Reflektiere deine Entscheidungen mit Reviews.',
        tip: 'Nutze die Review-Funktion nach 7 Tagen.'
      },
      consistency: {
        insight: '🧭 Fokus: Definiere deine Kernwerte und bleibe ihnen treu.',
        tip: 'Überlege dir, was dir wirklich wichtig ist.'
      },
      growth: {
        insight: '📚 Fokus: Lerne aus vergangenen Entscheidungen.',
        tip: 'Schau dir deine Historie an und erkenne Muster.'
      }
    };

    return factorInsights[weakest.key] || null;
  }

  static _getStrongestFactor(factors) {
    const entries = Object.entries(factors);
    const strongest = entries.reduce((max, [key, value]) =>
      value > max.value ? { key, value, score: value } : max
    , { key: null, value: 0, score: 0 });

    const factorInsights = {
      clarity: {
        insight: '✨ Stärke: Deine Entscheidungen sind sehr klar!',
        score: strongest.score
      },
      success: {
        insight: '🏆 Stärke: Deine Entscheidungen verlaufen erfolgreich!',
        score: strongest.score
      },
      consistency: {
        insight: '🔒 Stärke: Du bist sehr konsistent in deinen Entscheidungen!',
        score: strongest.score
      },
      growth: {
        insight: '🚀 Stärke: Du wächst kontinuierlich!',
        score: strongest.score
      }
    };

    return factorInsights[strongest.key] || null;
  }

  static _getScoreMessage(score) {
    if (score >= 90) return 'Meisterhaft';
    if (score >= 80) return 'Exzellent';
    if (score >= 70) return 'Sehr gut';
    if (score >= 60) return 'Gut';
    if (score >= 50) return 'Solide';
    if (score >= 40) return 'Ausbaufähig';
    if (score >= 30) return 'Entwicklungspotenzial';
    return 'Am Anfang';
  }

  static _getEmptyFactors() {
    return {
      clarity: 0,
      success: 0,
      consistency: 0,
      growth: 0
    };
  }

  static getFactorExplanations() {
    return {
      clarity: {
        name: 'Klarheit',
        icon: '🎯',
        description: 'Wie eindeutig sind deine Entscheidungen?',
        tip: 'Hohe Werte bei finalScore (weit weg von 50) = hohe Klarheit'
      },
      success: {
        name: 'Erfolg',
        icon: '🏆',
        description: 'Wie erfolgreich verlaufen deine Entscheidungen?',
        tip: 'Basierend auf Reviews: Outcome und "würde es wieder tun"'
      },
      consistency: {
        name: 'Konsistenz',
        icon: '🔒',
        description: 'Bleibst du deinen Werten treu?',
        tip: 'Niedrige Standardabweichung = hohe Konsistenz'
      },
      growth: {
        name: 'Wachstum',
        icon: '📈',
        description: 'Werden deine Entscheidungen besser?',
        tip: 'Vergleich zwischen alten und neuen Entscheidungen'
      }
    };
  }
}
