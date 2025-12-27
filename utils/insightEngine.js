/**
 * InsightEngine
 *
 * Erkennt Muster im Entscheidungsverhalten des Users und generiert Meta-Insights.
 * Lernt aus der Historie und gibt personalisierte Tipps.
 */

export class InsightEngine {
  /**
   * Generiert User-Insights basierend auf allen Entscheidungen
   * Gibt maximal 3 Insights zurück, um User nicht zu überfordern
   */
  static generateUserInsights(decisions) {
    if (!decisions || decisions.length === 0) {
      return [];
    }

    const insights = [];

    // Pattern 1: Bevorzugter Modus
    const modeInsight = this._analyzeModePreference(decisions);
    if (modeInsight) insights.push(modeInsight);

    // Pattern 2: Confidence-Trend
    const confidenceInsight = this._analyzeConfidenceTrend(decisions);
    if (confidenceInsight) insights.push(confidenceInsight);

    // Pattern 3: Kategorie-Fokus
    const categoryInsight = this._analyzeCategoryFocus(decisions);
    if (categoryInsight) insights.push(categoryInsight);

    // Pattern 4: Entscheidungs-Balance (Ja vs Nein)
    const balanceInsight = this._analyzeDecisionBalance(decisions);
    if (balanceInsight) insights.push(balanceInsight);

    // Pattern 5: Schnelligkeit
    const speedInsight = this._analyzeDecisionSpeed(decisions);
    if (speedInsight) insights.push(speedInsight);

    // Maximal 3 Insights zurückgeben (die wichtigsten)
    return insights
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3);
  }

  /**
   * Generiert Insights für eine spezifische Entscheidung
   */
  static generateDecisionInsights(decision, userHistory) {
    if (!decision) return [];

    const insights = [];

    // Vergleich mit ähnlichen Entscheidungen
    const similarDecisions = this._findSimilarDecisions(decision, userHistory);
    if (similarDecisions.length > 0) {
      const avgScore = this._averageScore(similarDecisions);
      const currentScore = decision.finalScore;

      if (Math.abs(currentScore - avgScore) > 20) {
        insights.push({
          type: 'comparison',
          icon: '📊',
          text: currentScore > avgScore
            ? 'Du bist diesmal sicherer als sonst'
            : 'Du bist diesmal unsicherer als sonst',
          detail: `Bei ähnlichen Entscheidungen lagst du meist bei ${Math.round(avgScore)}%, jetzt bei ${currentScore}%.`,
          importance: 8
        });
      }
    }

    // Preset-Match
    if (decision.weightPreset && decision.weightPreset !== 'balanced') {
      const presetNames = {
        rational: 'rational',
        emotional: 'emotional',
        career: 'karriereorientiert',
        relationship: 'beziehungsorientiert',
        financial: 'finanziell'
      };

      insights.push({
        type: 'preset',
        icon: '🎯',
        text: `Du hast ${presetNames[decision.weightPreset]} entschieden`,
        detail: 'Diese Gewichtung hat deine Entscheidung beeinflusst.',
        importance: 6
      });
    }

    return insights.slice(0, 2);
  }

  // ========== PRIVATE HELPER METHODS ==========

  /**
   * Analysiert, welchen Modus der User bevorzugt
   */
  static _analyzeModePreference(decisions) {
    const quickCount = decisions.filter(d => d.mode === 'quick').length;
    const fullCount = decisions.filter(d => d.mode === 'full').length;
    const total = decisions.length;

    if (total < 3) return null; // Zu wenig Daten

    const quickPercentage = (quickCount / total) * 100;

    if (quickPercentage >= 80) {
      return {
        type: 'mode_preference',
        icon: '⚡',
        text: 'Du liebst schnelle Entscheidungen',
        detail: `${quickCount} von ${total} Entscheidungen im Quick Mode. Du vertraust deinem Bauchgefühl.`,
        importance: 7
      };
    } else if (quickPercentage <= 20) {
      return {
        type: 'mode_preference',
        icon: '🔍',
        text: 'Du analysierst gerne im Detail',
        detail: `${fullCount} von ${total} Entscheidungen im Full Mode. Du nimmst dir Zeit zum Nachdenken.`,
        importance: 7
      };
    }

    return null;
  }

  /**
   * Analysiert den Confidence-Trend über Zeit
   */
  static _analyzeConfidenceTrend(decisions) {
    if (decisions.length < 5) return null;

    // Sortiere nach Datum
    const sorted = [...decisions].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Berechne Durchschnitt erste Hälfte vs zweite Hälfte
    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    const avgFirst = this._averageScore(firstHalf);
    const avgSecond = this._averageScore(secondHalf);

    const difference = avgSecond - avgFirst;

    if (difference > 10) {
      return {
        type: 'confidence_trend',
        icon: '📈',
        text: 'Deine Klarheit steigt',
        detail: `Deine Entscheidungen werden sicherer. Von ${Math.round(avgFirst)}% auf ${Math.round(avgSecond)}%.`,
        importance: 9
      };
    } else if (difference < -10) {
      return {
        type: 'confidence_trend',
        icon: '📉',
        text: 'Du wirkst unsicherer',
        detail: `Deine Entscheidungen wurden weniger klar. Von ${Math.round(avgFirst)}% auf ${Math.round(avgSecond)}%. Nimm dir mehr Zeit.`,
        importance: 9
      };
    }

    return null;
  }

  /**
   * Analysiert, in welcher Kategorie User am meisten entscheidet
   */
  static _analyzeCategoryFocus(decisions) {
    if (decisions.length < 5) return null;

    const categories = {};
    decisions.forEach(d => {
      const cat = d.category || 'other';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const topCategory = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)[0];

    if (!topCategory) return null;

    const [category, count] = topCategory;
    const percentage = (count / decisions.length) * 100;

    if (percentage >= 40) {
      const categoryNames = {
        career: 'Karriere',
        relationship: 'Beziehungen',
        finance: 'Finanzen',
        lifestyle: 'Lifestyle',
        health: 'Gesundheit',
        other: 'verschiedene Bereiche'
      };

      return {
        type: 'category_focus',
        icon: '🎯',
        text: `${categoryNames[category] || category} ist dein Hauptthema`,
        detail: `${count} von ${decisions.length} Entscheidungen waren in diesem Bereich.`,
        importance: 6
      };
    }

    return null;
  }

  /**
   * Analysiert die Balance zwischen Ja/Nein-Entscheidungen
   */
  static _analyzeDecisionBalance(decisions) {
    if (decisions.length < 5) return null;

    const yesCount = decisions.filter(d => d.recommendation === 'yes').length;
    const noCount = decisions.filter(d => d.recommendation === 'no').length;
    const total = yesCount + noCount;

    if (total === 0) return null;

    const yesPercentage = (yesCount / total) * 100;

    if (yesPercentage >= 75) {
      return {
        type: 'decision_balance',
        icon: '✅',
        text: 'Du sagst meist JA',
        detail: `${yesCount} von ${total} Entscheidungen waren positiv. Du bist risikofreudig.`,
        importance: 5
      };
    } else if (yesPercentage <= 25) {
      return {
        type: 'decision_balance',
        icon: '🛡️',
        text: 'Du sagst meist NEIN',
        detail: `${noCount} von ${total} Entscheidungen waren negativ. Du bist vorsichtig.`,
        importance: 5
      };
    }

    return null;
  }

  /**
   * Analysiert wie schnell User entscheidet
   */
  static _analyzeDecisionSpeed(decisions) {
    // Berechne Durchschnittszeit zwischen Start und Ende
    const decisionsWithTime = decisions.filter(d => d.createdAt && d.completedAt);

    if (decisionsWithTime.length < 3) return null;

    const avgTimeMinutes = decisionsWithTime.reduce((sum, d) => {
      const start = new Date(d.createdAt);
      const end = new Date(d.completedAt);
      const minutes = (end - start) / 1000 / 60;
      return sum + minutes;
    }, 0) / decisionsWithTime.length;

    if (avgTimeMinutes < 2) {
      return {
        type: 'speed',
        icon: '⚡',
        text: 'Du entscheidest blitzschnell',
        detail: `Durchschnittlich nur ${Math.round(avgTimeMinutes)} Minuten pro Entscheidung.`,
        importance: 4
      };
    } else if (avgTimeMinutes > 10) {
      return {
        type: 'speed',
        icon: '🐢',
        text: 'Du nimmst dir viel Zeit',
        detail: `Durchschnittlich ${Math.round(avgTimeMinutes)} Minuten pro Entscheidung. Das ist gut!`,
        importance: 4
      };
    }

    return null;
  }

  /**
   * Findet ähnliche Entscheidungen basierend auf Kategorie und Preset
   */
  static _findSimilarDecisions(decision, userHistory) {
    if (!userHistory || userHistory.length === 0) return [];

    return userHistory.filter(d =>
      d.id !== decision.id &&
      (d.category === decision.category ||
       d.weightPreset === decision.weightPreset)
    );
  }

  /**
   * Berechnet den Durchschnittsscore einer Liste von Entscheidungen
   */
  static _averageScore(decisions) {
    if (!decisions || decisions.length === 0) return 0;

    const sum = decisions.reduce((acc, d) => acc + (d.finalScore || 50), 0);
    return sum / decisions.length;
  }

  /**
   * Generiert einen Insight-Text für Quick Mode basierend auf User-Historie
   */
  static generateQuickModeMetaInsight(answers, userHistory) {
    if (!userHistory || userHistory.length < 3) {
      return null;
    }

    // Finde Quick Mode Entscheidungen
    const quickDecisions = userHistory.filter(d => d.mode === 'quick');

    if (quickDecisions.length < 3) return null;

    const avgGut = quickDecisions.reduce((sum, d) => {
      return sum + (d.answers?.quickGut || 5);
    }, 0) / quickDecisions.length;

    const currentGut = answers.quickGut || 5;

    if (currentGut > avgGut + 2) {
      return {
        icon: '💚',
        text: 'Dein Bauchgefühl ist diesmal besonders positiv!',
        detail: `Normalerweise liegst du bei ${Math.round(avgGut)}/10, jetzt bei ${currentGut}/10.`
      };
    } else if (currentGut < avgGut - 2) {
      return {
        icon: '🤔',
        text: 'Dein Bauchgefühl ist unsicher.',
        detail: `Normalerweise liegst du bei ${Math.round(avgGut)}/10, jetzt nur bei ${currentGut}/10. Vielleicht Full Mode nutzen?`
      };
    }

    return null;
  }
}
