/**
 * DecisionProfile Model
 *
 * Erstellt ein Persönlichkeitsprofil basierend auf dem Entscheidungsverhalten.
 * Kategorisiert User in Archetypen und zeigt Stärken/Schwächen.
 */

import { calculateAverageSuccessScore } from './DecisionReview';

export class DecisionProfile {
  constructor(decisions = [], reviews = []) {
    this.decisions = decisions;
    this.reviews = reviews;

    // Berechne Metriken
    this.metrics = this._calculateMetrics();

    // Bestimme Archetyp
    this.archetype = this._determineArchetype(this.metrics);

    // Identifiziere Stärken
    this.strengths = this._identifyStrengths(this.metrics);

    // Identifiziere Wachstumsbereiche
    this.growthAreas = this._identifyGrowthAreas(this.metrics);

    // Generiere Empfehlungen
    this.recommendations = this._generateRecommendations(this.archetype, this.metrics);

    // Metadata
    this.generatedAt = new Date().toISOString();
  }

  /**
   * Berechnet alle Metriken
   */
  _calculateMetrics() {
    const total = this.decisions.length;

    if (total === 0) {
      return this._getEmptyMetrics();
    }

    // 1. Durchschnittliche Confidence
    const avgConfidence = this.decisions.reduce((sum, d) => sum + (d.finalScore || 50), 0) / total;

    // 2. Modus-Präferenz
    const quickCount = this.decisions.filter(d => d.mode === 'quick').length;
    const modePreference = (quickCount / total) * 100; // % Quick Mode

    // 3. Entscheidungs-Balance
    const yesCount = this.decisions.filter(d => d.recommendation === 'yes').length;
    const decisionBalance = (yesCount / total) * 100; // % Ja-Entscheidungen

    // 4. Kategorie-Verteilung
    const categoryDistribution = this._getCategoryDistribution();

    // 5. Durchschnittlicher Success Score (aus Reviews)
    const avgSuccessScore = calculateAverageSuccessScore(this.reviews);

    // 6. Preset-Präferenz
    const presetPreference = this._getPresetPreference();

    // 7. Consistency Score (wie konsistent sind die Entscheidungen?)
    const consistency = this._calculateConsistency();

    // 8. Geschwindigkeit (Durchschnittszeit pro Entscheidung)
    const avgDecisionTime = this._calculateAverageDecisionTime();

    // 9. Clarity Trend (werden Entscheidungen klarer über Zeit?)
    const clarityTrend = this._calculateClarityTrend();

    return {
      avgConfidence: Math.round(avgConfidence),
      modePreference: Math.round(modePreference),
      decisionBalance: Math.round(decisionBalance),
      categoryDistribution,
      avgSuccessScore: Math.round(avgSuccessScore),
      presetPreference,
      consistency: Math.round(consistency),
      avgDecisionTimeMinutes: Math.round(avgDecisionTime),
      clarityTrend,
      totalDecisions: total,
      totalReviews: this.reviews.length
    };
  }

  /**
   * Bestimmt den User-Archetyp
   */
  _determineArchetype(metrics) {
    const { avgConfidence, modePreference, decisionBalance, avgSuccessScore, consistency } = metrics;

    // Archetyp 1: "Der Sichere Entscheider"
    if (avgConfidence >= 70 && avgSuccessScore >= 70 && consistency >= 70) {
      return {
        id: 'confident_decider',
        name: 'Der Sichere Entscheider',
        icon: '🎯',
        description: 'Du triffst klare Entscheidungen mit hoher Erfolgsquote.',
        traits: ['Selbstsicher', 'Konsistent', 'Erfolgreich'],
        color: '#10b981' // Green
      };
    }

    // Archetyp 2: "Der Vorsichtige Analytiker"
    if (avgConfidence < 60 && modePreference < 30 && decisionBalance < 40) {
      return {
        id: 'cautious_analyst',
        name: 'Der Vorsichtige Analytiker',
        icon: '🔍',
        description: 'Du analysierst gründlich und entscheidest bedacht.',
        traits: ['Analytisch', 'Vorsichtig', 'Gründlich'],
        color: '#3b82f6' // Blue
      };
    }

    // Archetyp 3: "Der Intuitive Macher"
    if (modePreference >= 70 && avgConfidence >= 60 && decisionBalance >= 60) {
      return {
        id: 'intuitive_doer',
        name: 'Der Intuitive Macher',
        icon: '⚡',
        description: 'Du vertraust deinem Bauchgefühl und handelst schnell.',
        traits: ['Intuitiv', 'Schnell', 'Risikofreudig'],
        color: '#f59e0b' // Orange
      };
    }

    // Archetyp 4: "Der Wachsende Lerner"
    if (metrics.clarityTrend === 'improving' && metrics.totalDecisions >= 5) {
      return {
        id: 'growing_learner',
        name: 'Der Wachsende Lerner',
        icon: '📈',
        description: 'Du wirst immer besser im Entscheiden.',
        traits: ['Lernbereit', 'Wachsend', 'Reflektiert'],
        color: '#8b5cf6' // Purple
      };
    }

    // Archetyp 5: "Der Ausgewogene Denker"
    if (avgConfidence >= 50 && avgConfidence <= 70 && Math.abs(decisionBalance - 50) <= 20) {
      return {
        id: 'balanced_thinker',
        name: 'Der Ausgewogene Denker',
        icon: '⚖️',
        description: 'Du wägst Chancen und Risiken fair ab.',
        traits: ['Ausgewogen', 'Fair', 'Bedacht'],
        color: '#06b6d4' // Cyan
      };
    }

    // Archetyp 6: "Der Suchende" (niedrige Confidence, inkonsistent)
    if (avgConfidence < 50 && consistency < 50) {
      return {
        id: 'searcher',
        name: 'Der Suchende',
        icon: '🧭',
        description: 'Du bist auf der Suche nach deinem Weg.',
        traits: ['Suchend', 'Offen', 'Experimentierfreudig'],
        color: '#ec4899' // Pink
      };
    }

    // Default: Balanced
    return {
      id: 'balanced_thinker',
      name: 'Der Ausgewogene Denker',
      icon: '⚖️',
      description: 'Du wägst Chancen und Risiken fair ab.',
      traits: ['Ausgewogen', 'Fair', 'Bedacht'],
      color: '#06b6d4'
    };
  }

  /**
   * Identifiziert Stärken
   */
  _identifyStrengths(metrics) {
    const strengths = [];

    if (metrics.avgConfidence >= 70) {
      strengths.push({
        icon: '💪',
        title: 'Hohe Klarheit',
        description: `Du erreichst durchschnittlich ${metrics.avgConfidence}% Klarheit bei deinen Entscheidungen.`
      });
    }

    if (metrics.avgSuccessScore >= 70) {
      strengths.push({
        icon: '🎯',
        title: 'Hohe Erfolgsquote',
        description: `${metrics.avgSuccessScore}% deiner Entscheidungen verlaufen positiv.`
      });
    }

    if (metrics.consistency >= 70) {
      strengths.push({
        icon: '🔒',
        title: 'Konsistenz',
        description: 'Du bleibst deinen Werten treu und entscheidest konsistent.'
      });
    }

    if (metrics.clarityTrend === 'improving') {
      strengths.push({
        icon: '📈',
        title: 'Wachstum',
        description: 'Deine Entscheidungen werden zunehmend klarer.'
      });
    }

    if (metrics.modePreference >= 70) {
      strengths.push({
        icon: '⚡',
        title: 'Schnelligkeit',
        description: 'Du kannst schnell und intuitiv entscheiden.'
      });
    }

    if (metrics.totalReviews / metrics.totalDecisions >= 0.5) {
      strengths.push({
        icon: '🔄',
        title: 'Reflexion',
        description: 'Du nimmst dir Zeit, deine Entscheidungen zu reflektieren.'
      });
    }

    return strengths.slice(0, 4); // Max 4 Stärken
  }

  /**
   * Identifiziert Wachstumsbereiche
   */
  _identifyGrowthAreas(metrics) {
    const growthAreas = [];

    if (metrics.avgConfidence < 50) {
      growthAreas.push({
        icon: '🎯',
        title: 'Klarheit steigern',
        description: 'Nutze öfter den Full Mode, um mehr Sicherheit zu gewinnen.',
        actionable: true
      });
    }

    if (metrics.avgSuccessScore < 50 && metrics.totalReviews >= 3) {
      growthAreas.push({
        icon: '🔍',
        title: 'Entscheidungsqualität',
        description: 'Nimm dir mehr Zeit für wichtige Entscheidungen.',
        actionable: true
      });
    }

    if (metrics.consistency < 40) {
      growthAreas.push({
        icon: '🧭',
        title: 'Konsistenz aufbauen',
        description: 'Überlege dir deine Kernwerte und bleibe ihnen treu.',
        actionable: true
      });
    }

    if (metrics.clarityTrend === 'declining') {
      growthAreas.push({
        icon: '⚠️',
        title: 'Klarheit nimmt ab',
        description: 'Du wirkst unsicherer. Ist gerade viel los? Nimm dir eine Pause.',
        actionable: true
      });
    }

    if (metrics.totalReviews === 0 && metrics.totalDecisions >= 5) {
      growthAreas.push({
        icon: '🔄',
        title: 'Reflexion fehlt',
        description: 'Nutze die Review-Funktion, um aus Entscheidungen zu lernen.',
        actionable: true
      });
    }

    if (metrics.decisionBalance >= 80 || metrics.decisionBalance <= 20) {
      const tendency = metrics.decisionBalance >= 80 ? 'JA' : 'NEIN';
      growthAreas.push({
        icon: '⚖️',
        title: 'Einseitigkeit',
        description: `Du sagst fast immer ${tendency}. Hinterfrage deine Muster.`,
        actionable: true
      });
    }

    return growthAreas.slice(0, 3); // Max 3 Wachstumsbereiche
  }

  /**
   * Generiert personalisierte Empfehlungen
   */
  _generateRecommendations(archetype, metrics) {
    const recommendations = [];

    // Archetyp-spezifische Empfehlungen
    if (archetype.id === 'confident_decider') {
      recommendations.push({
        text: 'Teile deine Entscheidungen mit anderen, um ihnen zu helfen.',
        priority: 'low'
      });
    } else if (archetype.id === 'cautious_analyst') {
      recommendations.push({
        text: 'Probiere auch mal Quick Mode - vertraue deinem Bauchgefühl.',
        priority: 'medium'
      });
    } else if (archetype.id === 'intuitive_doer') {
      recommendations.push({
        text: 'Bei wichtigen Entscheidungen: Nutze Full Mode für mehr Tiefe.',
        priority: 'high'
      });
    } else if (archetype.id === 'searcher') {
      recommendations.push({
        text: 'Definiere deine Kernwerte in den Einstellungen.',
        priority: 'high'
      });
    }

    // Metriken-basierte Empfehlungen
    if (metrics.totalReviews === 0) {
      recommendations.push({
        text: 'Nutze Reviews, um aus vergangenen Entscheidungen zu lernen.',
        priority: 'high'
      });
    }

    if (metrics.avgConfidence < 60) {
      recommendations.push({
        text: 'Mehr Zeit nehmen kann helfen - nutze Full Mode häufiger.',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  // ========== HELPER METHODS ==========

  _getCategoryDistribution() {
    const distribution = {};
    this.decisions.forEach(d => {
      const cat = d.category || 'other';
      distribution[cat] = (distribution[cat] || 0) + 1;
    });
    return distribution;
  }

  _getPresetPreference() {
    const presets = {};
    this.decisions.forEach(d => {
      const preset = d.weightPreset || 'balanced';
      presets[preset] = (presets[preset] || 0) + 1;
    });

    const topPreset = Object.entries(presets)
      .sort(([, a], [, b]) => b - a)[0];

    return topPreset ? topPreset[0] : 'balanced';
  }

  _calculateConsistency() {
    if (this.decisions.length < 3) return 50;

    // Berechne Standardabweichung der finalScores
    const scores = this.decisions.map(d => d.finalScore || 50);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Niedrige Standardabweichung = hohe Konsistenz
    // stdDev 0-10 = 100%, 10-20 = 80%, 20-30 = 60%, etc.
    const consistency = Math.max(0, 100 - (stdDev * 2));
    return consistency;
  }

  _calculateAverageDecisionTime() {
    const decisionsWithTime = this.decisions.filter(d => d.createdAt && d.completedAt);
    if (decisionsWithTime.length === 0) return 0;

    const totalMinutes = decisionsWithTime.reduce((sum, d) => {
      const start = new Date(d.createdAt);
      const end = new Date(d.completedAt);
      const minutes = (end - start) / 1000 / 60;
      return sum + minutes;
    }, 0);

    return totalMinutes / decisionsWithTime.length;
  }

  _calculateClarityTrend() {
    if (this.decisions.length < 5) return 'neutral';

    const sorted = [...this.decisions].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    const avgFirst = firstHalf.reduce((sum, d) => sum + (d.finalScore || 50), 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, d) => sum + (d.finalScore || 50), 0) / secondHalf.length;

    const difference = avgSecond - avgFirst;

    if (difference > 10) return 'improving';
    if (difference < -10) return 'declining';
    return 'stable';
  }

  _getEmptyMetrics() {
    return {
      avgConfidence: 0,
      modePreference: 0,
      decisionBalance: 0,
      categoryDistribution: {},
      avgSuccessScore: 0,
      presetPreference: 'balanced',
      consistency: 0,
      avgDecisionTimeMinutes: 0,
      clarityTrend: 'neutral',
      totalDecisions: 0,
      totalReviews: 0
    };
  }

  /**
   * Konvertiert zu JSON für Storage
   */
  toJSON() {
    return {
      metrics: this.metrics,
      archetype: this.archetype,
      strengths: this.strengths,
      growthAreas: this.growthAreas,
      recommendations: this.recommendations,
      generatedAt: this.generatedAt
    };
  }

  /**
   * Lädt von JSON
   */
  static fromJSON(data) {
    const profile = Object.create(DecisionProfile.prototype);
    Object.assign(profile, data);
    return profile;
  }
}
