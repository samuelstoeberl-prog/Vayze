/**
 * DecisionExplainer
 *
 * Macht Entscheidungen transparent und nachvollziehbar.
 * Zeigt dem User WARUM eine Empfehlung gegeben wurde.
 */

export class DecisionExplainer {
  /**
   * Hauptfunktion: Analysiert eine Entscheidung und generiert eine Erklärung
   */
  static explainDecision(answers, mode, finalScore, recommendation) {
    const factors = this._analyzeFactors(answers, mode);
    const summary = this._generateSummary(factors, recommendation);
    const insights = this._generateInsights(factors, finalScore);

    return {
      summary,
      factors,
      insights,
      confidence: finalScore
    };
  }

  /**
   * Analysiert alle Antworten und kategorisiert sie nach Stärke
   */
  static _analyzeFactors(answers, mode) {
    const factors = {
      positive: [],
      negative: [],
      neutral: []
    };

    if (mode === 'full') {
      // Step 1: Bauchgefühl (Weight: 2)
      if (answers.step1) {
        const gut = answers.step1.gut;
        if (gut > 6) {
          factors.positive.push({
            label: 'Bauchgefühl',
            description: 'Dein Bauchgefühl war positiv',
            strength: this._calculateStrength(gut, 10, 2),
            icon: '💚'
          });
        } else if (gut < 4) {
          factors.negative.push({
            label: 'Bauchgefühl',
            description: 'Dein Bauchgefühl war negativ',
            strength: this._calculateStrength(10 - gut, 10, 2),
            icon: '💔'
          });
        } else {
          factors.neutral.push({
            label: 'Bauchgefühl',
            description: 'Dein Bauchgefühl war neutral',
            strength: 1,
            icon: '😐'
          });
        }
      }

      // Step 2: Chancen vs Risiken (Weight: 4)
      if (answers.step2) {
        const { opportunities = [], risks = [] } = answers.step2;
        const balance = opportunities.length - risks.length;

        if (balance > 0) {
          factors.positive.push({
            label: 'Chancen überwiegen',
            description: `${opportunities.length} Chancen vs ${risks.length} Risiken`,
            strength: Math.min(balance * 2, 10) * 0.4,
            icon: '📈'
          });
        } else if (balance < 0) {
          factors.negative.push({
            label: 'Risiken überwiegen',
            description: `${risks.length} Risiken vs ${opportunities.length} Chancen`,
            strength: Math.min(Math.abs(balance) * 2, 10) * 0.4,
            icon: '⚠️'
          });
        } else if (opportunities.length > 0) {
          factors.neutral.push({
            label: 'Ausgeglichene Chancen/Risiken',
            description: `${opportunities.length} Chancen und Risiken`,
            strength: 2,
            icon: '⚖️'
          });
        }
      }

      // Step 3: Konsequenzen (Weight: 3)
      if (answers.step3) {
        const { positiveConsequences = [], negativeConsequences = [] } = answers.step3;
        const balance = positiveConsequences.length - negativeConsequences.length;

        if (balance > 0) {
          factors.positive.push({
            label: 'Positive Konsequenzen',
            description: `${positiveConsequences.length} positive vs ${negativeConsequences.length} negative`,
            strength: Math.min(balance * 2, 10) * 0.3,
            icon: '✨'
          });
        } else if (balance < 0) {
          factors.negative.push({
            label: 'Negative Konsequenzen',
            description: `${negativeConsequences.length} negative vs ${positiveConsequences.length} positive`,
            strength: Math.min(Math.abs(balance) * 2, 10) * 0.3,
            icon: '⛔'
          });
        }
      }

      // Step 4: Ziele & Werte (Weight: 4)
      if (answers.step4) {
        const { alignment = 5 } = answers.step4;
        if (alignment > 6) {
          factors.positive.push({
            label: 'Passt zu deinen Zielen',
            description: 'Hohe Übereinstimmung mit deinen Werten',
            strength: this._calculateStrength(alignment, 10, 4),
            icon: '🎯'
          });
        } else if (alignment < 4) {
          factors.negative.push({
            label: 'Widerspricht deinen Zielen',
            description: 'Geringe Übereinstimmung mit deinen Werten',
            strength: this._calculateStrength(10 - alignment, 10, 4),
            icon: '🚫'
          });
        }
      }

      // Step 5: Dritte Meinung (Weight: 2)
      if (answers.step5) {
        const { externalOpinion = 5 } = answers.step5;
        if (externalOpinion > 6) {
          factors.positive.push({
            label: 'Positive Außenmeinungen',
            description: 'Andere raten dir dazu',
            strength: this._calculateStrength(externalOpinion, 10, 2),
            icon: '👥'
          });
        } else if (externalOpinion < 4) {
          factors.negative.push({
            label: 'Negative Außenmeinungen',
            description: 'Andere raten dir ab',
            strength: this._calculateStrength(10 - externalOpinion, 10, 2),
            icon: '👎'
          });
        }
      }

      // Step 6: Kopf vs Herz (Weight: 6)
      if (answers.step6) {
        const { headDecision, heartDecision } = answers.step6;
        if (headDecision === 'yes' && heartDecision === 'yes') {
          factors.positive.push({
            label: 'Kopf & Herz stimmen zu',
            description: 'Vollständige innere Übereinstimmung',
            strength: 6,
            icon: '💯'
          });
        } else if (headDecision === 'no' && heartDecision === 'no') {
          factors.negative.push({
            label: 'Kopf & Herz lehnen ab',
            description: 'Vollständige innere Ablehnung',
            strength: 6,
            icon: '🚷'
          });
        } else {
          factors.neutral.push({
            label: 'Innerer Konflikt',
            description: headDecision === 'yes' ? 'Kopf ja, Herz nein' : 'Herz ja, Kopf nein',
            strength: 3,
            icon: '🤔'
          });
        }
      }

    } else if (mode === 'quick') {
      // Quick Mode: Nur 2 Steps

      // Step 1: Bauchgefühl
      if (answers.quickGut) {
        const gut = answers.quickGut;
        if (gut > 6) {
          factors.positive.push({
            label: 'Bauchgefühl',
            description: 'Dein Bauchgefühl war positiv',
            strength: this._calculateStrength(gut, 10, 5),
            icon: '💚'
          });
        } else if (gut < 4) {
          factors.negative.push({
            label: 'Bauchgefühl',
            description: 'Dein Bauchgefühl war negativ',
            strength: this._calculateStrength(10 - gut, 10, 5),
            icon: '💔'
          });
        } else {
          factors.neutral.push({
            label: 'Bauchgefühl',
            description: 'Dein Bauchgefühl war neutral',
            strength: 2,
            icon: '😐'
          });
        }
      }

      // Step 2: Pro/Contra
      if (answers.quickProCon) {
        const { pros = [], cons = [] } = answers.quickProCon;
        const balance = pros.length - cons.length;

        if (balance > 0) {
          factors.positive.push({
            label: 'Mehr Pro-Argumente',
            description: `${pros.length} Pro vs ${cons.length} Contra`,
            strength: Math.min(balance * 2, 10) * 0.5,
            icon: '✅'
          });
        } else if (balance < 0) {
          factors.negative.push({
            label: 'Mehr Contra-Argumente',
            description: `${cons.length} Contra vs ${pros.length} Pro`,
            strength: Math.min(Math.abs(balance) * 2, 10) * 0.5,
            icon: '❌'
          });
        } else if (pros.length > 0) {
          factors.neutral.push({
            label: 'Ausgeglichene Argumente',
            description: `${pros.length} Pro und Contra`,
            strength: 2,
            icon: '⚖️'
          });
        }
      }
    }

    // Sortiere nach Stärke
    factors.positive.sort((a, b) => b.strength - a.strength);
    factors.negative.sort((a, b) => b.strength - a.strength);

    return factors;
  }

  /**
   * Berechnet die Stärke eines Faktors (0-10)
   */
  static _calculateStrength(value, maxValue, weight) {
    return (value / maxValue) * weight;
  }

  /**
   * Generiert eine menschenlesbare Zusammenfassung
   */
  static _generateSummary(factors, recommendation) {
    const { positive, negative, neutral } = factors;

    let summary = '';

    if (recommendation === 'yes') {
      summary = `Wir empfehlen **JA**, weil:\n\n`;

      // Top 3 positive Faktoren
      const topPositive = positive.slice(0, 3);
      topPositive.forEach(factor => {
        summary += `${factor.icon} **${factor.label}**: ${factor.description}\n`;
      });

      // Warnungen bei negativen Faktoren
      if (negative.length > 0) {
        summary += `\n⚠️ **Beachte aber**: ${negative[0].description}`;
      }

    } else if (recommendation === 'no') {
      summary = `Wir empfehlen **NEIN**, weil:\n\n`;

      // Top 3 negative Faktoren
      const topNegative = negative.slice(0, 3);
      topNegative.forEach(factor => {
        summary += `${factor.icon} **${factor.label}**: ${factor.description}\n`;
      });

      // Hinweis bei positiven Faktoren
      if (positive.length > 0) {
        summary += `\n💡 **Aber**: ${positive[0].description}`;
      }

    } else {
      // Neutral
      summary = `Die Entscheidung ist **UNKLAR**:\n\n`;
      summary += `Es gibt ${positive.length} Argumente dafür und ${negative.length} dagegen.\n\n`;

      if (neutral.length > 0) {
        summary += `${neutral[0].icon} ${neutral[0].description}`;
      }

      summary += `\n\n💭 Nimm dir mehr Zeit oder sammle mehr Informationen.`;
    }

    return summary;
  }

  /**
   * Generiert Meta-Insights über die Entscheidung
   */
  static _generateInsights(factors, finalScore) {
    const insights = [];
    const { positive, negative, neutral } = factors;

    // Insight 1: Klarheit der Entscheidung
    if (finalScore >= 70 || finalScore <= 30) {
      insights.push({
        type: 'clarity',
        icon: '🎯',
        text: 'Die Entscheidung ist sehr klar.',
        detail: finalScore >= 70
          ? 'Alle Faktoren zeigen in die gleiche Richtung.'
          : 'Die Faktoren sprechen deutlich dagegen.'
      });
    } else if (finalScore >= 45 && finalScore <= 55) {
      insights.push({
        type: 'uncertainty',
        icon: '🤔',
        text: 'Die Entscheidung ist unsicher.',
        detail: 'Die Pro- und Contra-Argumente halten sich die Waage. Sammle mehr Informationen oder höre auf dein Bauchgefühl.'
      });
    }

    // Insight 2: Innerer Konflikt
    if (neutral.some(f => f.label.includes('Konflikt'))) {
      insights.push({
        type: 'conflict',
        icon: '⚡',
        text: 'Kopf und Herz sind sich uneinig.',
        detail: 'Das ist normal bei schwierigen Entscheidungen. Frage dich: Was wiegt langfristig schwerer?'
      });
    }

    // Insight 3: Dominanter Faktor
    if (positive.length > 0 && positive[0].strength >= 5) {
      insights.push({
        type: 'dominant',
        icon: positive[0].icon,
        text: `${positive[0].label} ist der Hauptgrund.`,
        detail: positive[0].description
      });
    } else if (negative.length > 0 && negative[0].strength >= 5) {
      insights.push({
        type: 'dominant',
        icon: negative[0].icon,
        text: `${negative[0].label} ist das Hauptproblem.`,
        detail: negative[0].description
      });
    }

    // Maximal 3 Insights zurückgeben
    return insights.slice(0, 3);
  }

  /**
   * Generiert einen kurzen 1-Satz-Summary für Listen
   */
  static getShortSummary(explanation) {
    if (!explanation) return 'Keine Erklärung verfügbar';

    const lines = explanation.summary.split('\n');
    return lines[0] || 'Entscheidung analysiert';
  }
}
