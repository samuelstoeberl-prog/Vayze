export class DecisionExplainer {
  
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

  static _analyzeFactors(answers, mode) {
    const factors = {
      positive: [],
      negative: [],
      neutral: []
    };

    if (mode === 'full') {
      
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

    factors.positive.sort((a, b) => b.strength - a.strength);
    factors.negative.sort((a, b) => b.strength - a.strength);

    return factors;
  }

  static _calculateStrength(value, maxValue, weight) {
    return (value / maxValue) * weight;
  }

  static _generateSummary(factors, recommendation) {
    const { positive, negative, neutral } = factors;

    let summary = '';

    if (recommendation === 'yes') {
      summary = `Wir empfehlen **JA**, weil:\n\n`;

      const topPositive = positive.slice(0, 3);
      topPositive.forEach(factor => {
        summary += `${factor.icon} **${factor.label}**: ${factor.description}\n`;
      });

      if (negative.length > 0) {
        summary += `\n⚠️ **Beachte aber**: ${negative[0].description}`;
      }

    } else if (recommendation === 'no') {
      summary = `Wir empfehlen **NEIN**, weil:\n\n`;

      const topNegative = negative.slice(0, 3);
      topNegative.forEach(factor => {
        summary += `${factor.icon} **${factor.label}**: ${factor.description}\n`;
      });

      if (positive.length > 0) {
        summary += `\n💡 **Aber**: ${positive[0].description}`;
      }

    } else {
      
      summary = `Die Entscheidung ist **UNKLAR**:\n\n`;
      summary += `Es gibt ${positive.length} Argumente dafür und ${negative.length} dagegen.\n\n`;

      if (neutral.length > 0) {
        summary += `${neutral[0].icon} ${neutral[0].description}`;
      }

      summary += `\n\n💭 Nimm dir mehr Zeit oder sammle mehr Informationen.`;
    }

    return summary;
  }

  static _generateInsights(factors, finalScore) {
    const insights = [];
    const { positive, negative, neutral } = factors;

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

    if (neutral.some(f => f.label.includes('Konflikt'))) {
      insights.push({
        type: 'conflict',
        icon: '⚡',
        text: 'Kopf und Herz sind sich uneinig.',
        detail: 'Das ist normal bei schwierigen Entscheidungen. Frage dich: Was wiegt langfristig schwerer?'
      });
    }

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

    return insights.slice(0, 3);
  }

  static getShortSummary(explanation) {
    if (!explanation) return 'Keine Erklärung verfügbar';

    const lines = explanation.summary.split('\n');
    return lines[0] || 'Entscheidung analysiert';
  }
}
