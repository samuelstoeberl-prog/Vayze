/**
 * ConfidenceScoreCalculator
 *
 * Berechnet einen persönlichen "Decision Confidence Score" (0-100)
 * Der Score misst: Wie gut bist DU im Entscheiden?
 */

import { calculateAverageSuccessScore } from '../models/DecisionReview';

export class ConfidenceScoreCalculator {
  /**
   * Hauptfunktion: Berechnet Confidence Score
   *
   * @param {Array} decisions - Alle Entscheidungen des Users
   * @param {Array} reviews - Alle Reviews des Users
   * @returns {Object} - { score, trend, factors, insights }
   */
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

    // Berechne die 4 Faktoren
    const clarity = this._clarityScore(decisions);
    const success = this._successScore(decisions, reviews);
    const consistency = this._consistencyScore(decisions);
    const growth = this._growthScore(decisions);

    // Gewichtete Berechnung
    // Clarity: 30%, Success: 40%, Consistency: 20%, Growth: 10%
    const score = Math.round(
      (clarity * 0.30) +
      (success * 0.40) +
      (consistency * 0.20) +
      (growth * 0.10)
    );

    // Trend berechnen (letzten 30 Tage vs vorherige 30 Tage)
    const trend = this._calculateTrend(decisions, reviews);

    // Insights generieren
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

  // ========== FACTOR CALCULATORS ==========

  /**
   * Factor 1: Clarity Score
   * Wie klar sind deine Entscheidungen? (basierend auf finalScore)
   */
  static _clarityScore(decisions) {
    if (decisions.length === 0) return 0;

    // Durchschnittliche Distanz von 50 (neutral)
    // Je weiter von 50, desto klarer die Entscheidung
    const clarityScores = decisions.map(d => {
      const finalScore = d.finalScore || 50;
      const distanceFrom50 = Math.abs(finalScore - 50);
      // 0 = unklar (50), 50 = sehr klar (0 oder 100)
      return distanceFrom50 * 2; // Normalisiert auf 0-100
    });

    const avgClarity = clarityScores.reduce((sum, s) => sum + s, 0) / clarityScores.length;
    return avgClarity;
  }

  /**
   * Factor 2: Success Score
   * Wie erfolgreich sind deine Entscheidungen? (basierend auf Reviews)
   */
  static _successScore(decisions, reviews) {
    if (reviews.length === 0) {
      // Wenn keine Reviews: Berechne basierend auf Confidence
      // Hohe Confidence = potenziell hoher Success
      const avgConfidence = decisions.reduce((sum, d) => {
        const finalScore = d.finalScore || 50;
        const distanceFrom50 = Math.abs(finalScore - 50);
        return sum + distanceFrom50 * 2;
      }, 0) / decisions.length;

      return avgConfidence * 0.7; // 70% Gewichtung ohne Reviews
    }

    // Mit Reviews: Nutze tatsächlichen Success Score
    return calculateAverageSuccessScore(reviews);
  }

  /**
   * Factor 3: Consistency Score
   * Wie konsistent sind deine Entscheidungen?
   */
  static _consistencyScore(decisions) {
    if (decisions.length < 3) return 50; // Default bei wenig Daten

    // Berechne Standardabweichung der finalScores
    const scores = decisions.map(d => d.finalScore || 50);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Niedrige Standardabweichung = hohe Konsistenz
    // stdDev 0-10 = 100%, 10-20 = 80%, 20-30 = 60%, etc.
    const consistency = Math.max(0, 100 - (stdDev * 2));
    return consistency;
  }

  /**
   * Factor 4: Growth Score
   * Werden deine Entscheidungen besser über Zeit?
   */
  static _growthScore(decisions) {
    if (decisions.length < 5) return 50; // Neutral bei wenig Daten

    // Sortiere nach Datum
    const sorted = [...decisions].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Vergleiche erste Hälfte mit zweiter Hälfte
    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    const avgFirst = this._clarityScore(firstHalf);
    const avgSecond = this._clarityScore(secondHalf);

    const improvement = avgSecond - avgFirst;

    // Konvertiere zu 0-100 Score
    // +20 oder mehr = 100%, 0 = 50%, -20 oder weniger = 0%
    const growthScore = 50 + (improvement * 2.5);
    return Math.max(0, Math.min(100, growthScore));
  }

  // ========== TREND CALCULATION ==========

  /**
   * Berechnet Trend: improving, stable, declining
   */
  static _calculateTrend(decisions, reviews) {
    if (decisions.length < 5) return 'neutral';

    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    // Letzte 30 Tage
    const recent = decisions.filter(d => new Date(d.createdAt) >= thirtyDaysAgo);

    // 30-60 Tage zurück
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

  // ========== INSIGHTS GENERATION ==========

  /**
   * Generiert personalisierte Insights basierend auf Score
   */
  static _generateInsights(score, factors, trend) {
    const insights = [];

    // Insight basierend auf Gesamtscore
    if (score >= 80) {
      insights.push('🎯 Exzellent! Du triffst sehr klare und erfolgreiche Entscheidungen.');
    } else if (score >= 60) {
      insights.push('👍 Gut! Du bist auf dem richtigen Weg.');
    } else if (score >= 40) {
      insights.push('💪 Solide Basis. Mit mehr Übung wirst du noch besser.');
    } else {
      insights.push('🌱 Du bist am Anfang. Jede Entscheidung macht dich stärker.');
    }

    // Insight basierend auf Trend
    if (trend === 'improving') {
      insights.push('📈 Dein Score steigt - du wirst besser!');
    } else if (trend === 'declining') {
      insights.push('📉 Dein Score sinkt. Nimm dir mehr Zeit oder nutze Full Mode.');
    }

    // Insight basierend auf schwächstem Faktor
    const weakestFactor = this._getWeakestFactor(factors);
    if (weakestFactor) {
      insights.push(weakestFactor.insight);
    }

    // Insight basierend auf stärkstem Faktor
    const strongestFactor = this._getStrongestFactor(factors);
    if (strongestFactor && strongestFactor.score >= 80) {
      insights.push(strongestFactor.insight);
    }

    return insights.slice(0, 3); // Max 3 Insights
  }

  /**
   * Findet den schwächsten Faktor
   */
  static _getWeakestFactor(factors) {
    const entries = Object.entries(factors);
    const weakest = entries.reduce((min, [key, value]) =>
      value < min.value ? { key, value } : min
    , { key: null, value: 100 });

    if (weakest.value >= 60) return null; // Kein schwacher Faktor

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

  /**
   * Findet den stärksten Faktor
   */
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

  /**
   * Gibt eine Message basierend auf Score
   */
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

  /**
   * Empty factors for initialization
   */
  static _getEmptyFactors() {
    return {
      clarity: 0,
      success: 0,
      consistency: 0,
      growth: 0
    };
  }

  /**
   * Gibt eine detaillierte Erklärung der Faktoren
   */
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
