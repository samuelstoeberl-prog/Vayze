# 🎯 Vayze Evolution: Decision Tool → Decision Learning System

**Version**: 2.0 Roadmap
**Stand**: 18. Dezember 2025
**Architekt**: Senior Product Engineer

---

## 🧠 Vision

**Von**: "Ich treffe eine Entscheidung"
**Zu**: "Ich lerne, wie ich besser entscheide"

---

## 📐 Architektur-Übersicht

### Neue Module (Erweiterungen)

```
/utils
  ├── decisionAlgorithm.js       ← NEU: Zentrale Decision Logic
  ├── decisionExplainer.js       ← NEU: Explainability Layer
  ├── insightEngine.js           ← NEU: Pattern Recognition
  └── decisionWeights.js         ← NEU: Gewichtungs-Presets

/store
  ├── decisionStore.js           ← NEU: Decision State Management
  └── cardStore.js               ← ERWEITERT

/models
  ├── Decision.js                ← NEU: Datenmodell
  ├── DecisionReview.js          ← NEU: Review-System
  └── DecisionProfile.js         ← NEU: Nutzer-Profil
```

---

## 1️⃣ KERN-VERBESSERUNGEN (Quick Wins mit hohem Impact)

### 1.1 Explainability Layer 🔍

**Ziel**: Jede Empfehlung ist nachvollziehbar

#### Implementierung

**Datei**: `utils/decisionExplainer.js`

```javascript
/**
 * Decision Explainer
 * Generiert menschlich lesbare Erklärungen für Entscheidungsempfehlungen
 */

export class DecisionExplainer {
  /**
   * Analysiert Entscheidungsfaktoren und generiert Erklärung
   * @param {Object} answers - Antworten aus Decision Assistant
   * @param {string} mode - 'full' oder 'quick'
   * @param {number} finalScore - Konfidenz-Score (0-100)
   * @param {string} recommendation - 'JA', 'NEIN', 'UNENTSCHIEDEN'
   * @returns {Object} { summary, factors, insights }
   */
  static explainDecision(answers, mode, finalScore, recommendation) {
    const factors = this._analyzeFactors(answers, mode);
    const summary = this._generateSummary(factors, recommendation);
    const insights = this._generateInsights(factors, finalScore);

    return {
      summary,           // Haupterklärung (1-2 Sätze)
      factors,          // Positive/Negative Faktoren
      insights,         // Zusätzliche Erkenntnisse
      confidence: finalScore
    };
  }

  /**
   * Identifiziert stärkste Einflussfaktoren
   */
  static _analyzeFactors(answers, mode) {
    const factors = {
      positive: [],
      negative: [],
      neutral: []
    };

    if (mode === 'full') {
      // Schritt 1: Intuition (Gewicht: 2)
      if (answers.step1?.rating) {
        const rating = this._parseRating(answers.step1.rating);
        if (rating >= 1) {
          factors.positive.push({
            label: 'Bauchgefühl',
            strength: rating * 2,
            text: 'Dein Bauchgefühl war positiv'
          });
        } else if (rating <= -1) {
          factors.negative.push({
            label: 'Bauchgefühl',
            strength: Math.abs(rating) * 2,
            text: 'Dein Bauchgefühl war skeptisch'
          });
        }
      }

      // Schritt 2: Risiko (Gewicht: 4)
      if (answers.step2?.risk) {
        const risk = this._parseRating(answers.step2.risk);
        if (risk >= 2) {
          factors.positive.push({
            label: 'Risiko',
            strength: risk * 2,
            text: 'Das Risiko wurde als niedrig eingeschätzt'
          });
        } else if (risk <= -2) {
          factors.negative.push({
            label: 'Risiko',
            strength: Math.abs(risk) * 2,
            text: 'Das Risiko wurde als hoch eingeschätzt'
          });
        }
      }

      // Schritt 3: Reversibilität (Gewicht: 3)
      if (answers.step3?.reversibility) {
        const rev = this._parseRating(answers.step3.reversibility);
        if (rev >= 2) {
          factors.positive.push({
            label: 'Rückgängig machbar',
            strength: rev * 1.5,
            text: 'Die Entscheidung ist gut rückgängig machbar'
          });
        } else if (rev <= -2) {
          factors.negative.push({
            label: 'Irreversibel',
            strength: Math.abs(rev) * 1.5,
            text: 'Die Entscheidung ist schwer rückgängig zu machen'
          });
        }
      }

      // Schritt 4: Langfristiger Nutzen (Gewicht: 4)
      if (answers.step4?.longTerm) {
        const lt = this._parseRating(answers.step4.longTerm);
        if (lt >= 2) {
          factors.positive.push({
            label: 'Langfristiger Nutzen',
            strength: lt * 2,
            text: 'Der langfristige Nutzen überwiegt'
          });
        } else if (lt <= -2) {
          factors.negative.push({
            label: 'Langfristige Kosten',
            strength: Math.abs(lt) * 2,
            text: 'Langfristig könnten Nachteile überwiegen'
          });
        }
      }

      // Schritt 5: Objektivität
      if (answers.step5?.objectivity) {
        const obj = this._parseRating(answers.step5.objectivity);
        if (obj >= 1) {
          factors.positive.push({
            label: 'Objektivität',
            strength: obj,
            text: 'Du kannst objektiv entscheiden'
          });
        } else if (obj <= -1) {
          factors.neutral.push({
            label: 'Externe Einflüsse',
            strength: Math.abs(obj),
            text: 'Externe Einflüsse spielen eine Rolle'
          });
        }
      }

      // Schritt 6: Freundesrat (Gewicht: 6)
      if (answers.step6?.advice) {
        const adv = this._parseRating(answers.step6.advice);
        if (adv >= 3) {
          factors.positive.push({
            label: 'Externe Perspektive',
            strength: adv * 2,
            text: 'Aus externer Sicht würdest du dazu raten'
          });
        } else if (adv <= -3) {
          factors.negative.push({
            label: 'Externe Perspektive',
            strength: Math.abs(adv) * 2,
            text: 'Aus externer Sicht würdest du abraten'
          });
        }
      }
    } else {
      // Quick Mode
      if (answers.step1?.feeling) {
        const feeling = this._parseFeeling(answers.step1.feeling);
        if (feeling > 0) {
          factors.positive.push({
            label: 'Gefühl',
            strength: 3,
            text: 'Es fühlt sich richtig an'
          });
        } else if (feeling < 0) {
          factors.negative.push({
            label: 'Gefühl',
            strength: 3,
            text: 'Es fühlt sich falsch an'
          });
        }
      }

      if (answers.step2?.importance && answers.step2?.regret) {
        const importance = this._parseImportance(answers.step2.importance);
        const regret = this._parseRegret(answers.step2.regret);

        if (importance > 0 && regret > 0) {
          factors.positive.push({
            label: 'Langfristige Bedeutung',
            strength: 2,
            text: 'Du würdest es bereuen, es NICHT zu tun'
          });
        } else if (regret < 0) {
          factors.negative.push({
            label: 'Potenzielle Reue',
            strength: 2,
            text: 'Du würdest es bereuen, es zu tun'
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
   * Generiert Zusammenfassung
   */
  static _generateSummary(factors, recommendation) {
    const topPositive = factors.positive.slice(0, 2);
    const topNegative = factors.negative.slice(0, 2);

    let summary = '';

    if (recommendation === 'JA') {
      summary = `Wir empfehlen **JA**, weil:\n`;
      if (topPositive.length > 0) {
        topPositive.forEach(f => {
          summary += `• ${f.text}\n`;
        });
      }
      if (topNegative.length > 0 && topNegative[0].strength > 3) {
        summary += `\n⚠️ Beachte jedoch:\n• ${topNegative[0].text}`;
      }
    } else if (recommendation === 'NEIN') {
      summary = `Wir raten zur **Vorsicht**, weil:\n`;
      if (topNegative.length > 0) {
        topNegative.forEach(f => {
          summary += `• ${f.text}\n`;
        });
      }
      if (topPositive.length > 0 && topPositive[0].strength > 3) {
        summary += `\n✓ Positiv ist:\n• ${topPositive[0].text}`;
      }
    } else {
      summary = `Die Signale sind **gemischt**:\n`;
      if (topPositive.length > 0) {
        summary += `✓ ${topPositive[0].text}\n`;
      }
      if (topNegative.length > 0) {
        summary += `⚠️ ${topNegative[0].text}\n`;
      }
      summary += `\nSammle mehr Informationen, bevor du entscheidest.`;
    }

    return summary;
  }

  /**
   * Generiert zusätzliche Insights
   */
  static _generateInsights(factors, finalScore) {
    const insights = [];

    // Insight 1: Klarheit der Entscheidung
    if (finalScore >= 70 || finalScore <= 30) {
      insights.push({
        type: 'clarity',
        text: 'Die Analyse zeigt eine klare Tendenz. Das deutet auf eine gut durchdachte Entscheidung hin.'
      });
    } else if (finalScore >= 45 && finalScore <= 55) {
      insights.push({
        type: 'uncertainty',
        text: 'Die Faktoren sind nahezu ausgeglichen. Höre zusätzlich auf dein Bauchgefühl.'
      });
    }

    // Insight 2: Dominanter Faktor
    const allFactors = [...factors.positive, ...factors.negative];
    if (allFactors.length > 0) {
      const strongest = allFactors.reduce((max, f) => f.strength > max.strength ? f : max);
      if (strongest.strength >= 6) {
        insights.push({
          type: 'dominant',
          text: `Der wichtigste Faktor ist: ${strongest.label}. Das sollte deine Entscheidung stark beeinflussen.`
        });
      }
    }

    // Insight 3: Balancierte Entscheidung
    if (factors.positive.length > 0 && factors.negative.length > 0) {
      const posSum = factors.positive.reduce((sum, f) => sum + f.strength, 0);
      const negSum = factors.negative.reduce((sum, f) => sum + f.strength, 0);
      if (Math.abs(posSum - negSum) < 3) {
        insights.push({
          type: 'balanced',
          text: 'Du hast sowohl Pro- als auch Contra-Argumente gut abgewogen. Das spricht für eine reife Entscheidungsfindung.'
        });
      }
    }

    return insights;
  }

  // Helper methods
  static _parseRating(value) {
    const map = {
      'Stark dafür': 2,
      'Eher dafür': 1,
      'Neutral': 0,
      'Eher dagegen': -1,
      'Stark dagegen': -2,
      'Sehr niedrig': 4,
      'Niedrig': 2,
      'Mittel': 0,
      'Hoch': -2,
      'Sehr hoch': -4,
      'Vollständig': 4,
      'Größtenteils': 3,
      'Teilweise': 1,
      'Kaum': -1,
      'Irreversibel': -4,
      'Ja eindeutig': 4,
      'Eher ja': 2,
      'Unentschieden': 0,
      'Eher nein': -2,
      'Nein': -4,
      'Ja definitiv': 2,
      'Wahrscheinlich': 1,
      'Unsicher': 0,
      'Eher nein': -1,
      'Nein': -2,
      'Klar dafür': 6,
      'Eher dafür': 3,
      'Abwarten': 0,
      'Eher dagegen': -3,
      'Klar dagegen': -6
    };
    return map[value] || 0;
  }

  static _parseFeeling(value) {
    const map = {
      'Fühlt sich richtig an ✓': 3,
      'Bin unsicher ?': 0,
      'Fühlt sich falsch an ✕': -3
    };
    return map[value] || 0;
  }

  static _parseImportance(value) {
    const map = {
      'Ja, sehr wichtig': 2,
      'Mittelmäßig wichtig': 0,
      'Kaum noch relevant': -1
    };
    return map[value] || 0;
  }

  static _parseRegret(value) {
    const map = {
      'Bereue es zu tun': -2,
      'Egal': 0,
      'Bereue es NICHT zu tun': 2
    };
    return map[value] || 0;
  }
}

export default DecisionExplainer;
```

---

### 1.2 Gewichtungs-System (Decision Weights) ⚖️

**Datei**: `utils/decisionWeights.js`

```javascript
/**
 * Decision Weights
 * Ermöglicht unterschiedliche Gewichtung der Entscheidungsschritte
 */

export const WEIGHT_PRESETS = {
  balanced: {
    id: 'balanced',
    name: 'Ausgewogen',
    description: 'Alle Faktoren gleichgewichtet',
    icon: '⚖️',
    weights: {
      intuition: 1.0,      // Schritt 1
      risk: 1.0,           // Schritt 2
      reversibility: 1.0,  // Schritt 3
      longTerm: 1.0,       // Schritt 4
      objectivity: 1.0,    // Schritt 5
      advice: 1.0          // Schritt 6
    }
  },

  rational: {
    id: 'rational',
    name: 'Rational',
    description: 'Fokus auf Fakten & Risiko',
    icon: '🧠',
    weights: {
      intuition: 0.5,
      risk: 1.5,           // Höher
      reversibility: 1.3,  // Höher
      longTerm: 1.4,       // Höher
      objectivity: 1.2,
      advice: 0.8
    }
  },

  emotional: {
    id: 'emotional',
    name: 'Emotional',
    description: 'Fokus auf Gefühl & Intuition',
    icon: '❤️',
    weights: {
      intuition: 1.8,      // Höher
      risk: 0.7,
      reversibility: 0.8,
      longTerm: 0.9,
      objectivity: 0.6,
      advice: 1.5          // Höher
    }
  },

  career: {
    id: 'career',
    name: 'Karriere',
    description: 'Für berufliche Entscheidungen',
    icon: '💼',
    weights: {
      intuition: 0.8,
      risk: 1.4,
      reversibility: 1.2,
      longTerm: 1.6,       // Höher
      objectivity: 1.3,
      advice: 1.1
    }
  },

  relationship: {
    id: 'relationship',
    name: 'Beziehung',
    description: 'Für persönliche Beziehungen',
    icon: '👥',
    weights: {
      intuition: 1.5,      // Höher
      risk: 1.0,
      reversibility: 0.7,
      longTerm: 1.3,
      objectivity: 0.9,
      advice: 1.4          // Höher
    }
  },

  financial: {
    id: 'financial',
    name: 'Finanzen',
    description: 'Für finanzielle Entscheidungen',
    icon: '💰',
    weights: {
      intuition: 0.6,
      risk: 1.8,           // Sehr hoch
      reversibility: 1.4,
      longTerm: 1.5,
      objectivity: 1.3,
      advice: 1.0
    }
  },

  quick: {
    id: 'quick',
    name: 'Quick Decision',
    description: 'Für den Quick Mode',
    icon: '⚡',
    weights: {
      feeling: 1.0,
      consequence: 1.0,
      importance: 1.0,
      regret: 1.0
    }
  }
};

/**
 * Wendet Gewichtung auf Decision Score an
 */
export function applyWeights(answers, mode, preset = 'balanced') {
  const weights = WEIGHT_PRESETS[preset]?.weights || WEIGHT_PRESETS.balanced.weights;

  let weightedScore = 0;
  let totalWeight = 0;

  if (mode === 'full') {
    // Schritt 1: Intuition
    if (answers.step1?.rating) {
      const rawScore = parseRating(answers.step1.rating);
      weightedScore += rawScore * weights.intuition * 2;
      totalWeight += weights.intuition * 2;
    }

    // Schritt 2: Risiko
    if (answers.step2?.risk) {
      const rawScore = parseRating(answers.step2.risk);
      weightedScore += rawScore * weights.risk * 4;
      totalWeight += weights.risk * 4;
    }

    // Schritt 3: Reversibilität
    if (answers.step3?.reversibility) {
      const rawScore = parseRating(answers.step3.reversibility);
      weightedScore += rawScore * weights.reversibility * 4;
      totalWeight += weights.reversibility * 4;
    }

    // Schritt 4: Langfristiger Nutzen
    if (answers.step4?.longTerm) {
      const rawScore = parseRating(answers.step4.longTerm);
      weightedScore += rawScore * weights.longTerm * 4;
      totalWeight += weights.longTerm * 4;
    }

    // Schritt 5: Objektivität
    if (answers.step5?.objectivity) {
      const rawScore = parseRating(answers.step5.objectivity);
      weightedScore += rawScore * weights.objectivity * 2;
      totalWeight += weights.objectivity * 2;
    }

    // Schritt 6: Freundesrat
    if (answers.step6?.advice) {
      const rawScore = parseRating(answers.step6.advice);
      weightedScore += rawScore * weights.advice * 6;
      totalWeight += weights.advice * 6;
    }
  } else {
    // Quick Mode
    if (answers.step1?.feeling) {
      const rawScore = parseFeeling(answers.step1.feeling);
      weightedScore += rawScore * weights.feeling * 3;
      totalWeight += weights.feeling * 3;
    }

    if (answers.step2?.importance) {
      const rawScore = parseImportance(answers.step2.importance);
      weightedScore += rawScore * weights.importance * 2;
      totalWeight += weights.importance * 2;
    }

    if (answers.step2?.regret) {
      const rawScore = parseRegret(answers.step2.regret);
      weightedScore += rawScore * weights.regret * 2;
      totalWeight += weights.regret * 2;
    }
  }

  // Normalisiere auf 0-100
  const percentage = ((weightedScore / totalWeight) + 1) * 50;
  return Math.round(Math.max(0, Math.min(100, percentage)));
}

// Helper-Funktionen (gleich wie in DecisionExplainer)
function parseRating(value) {
  // ... (gleiche Implementierung)
}

function parseFeeling(value) {
  // ... (gleiche Implementierung)
}

function parseImportance(value) {
  // ... (gleiche Implementierung)
}

function parseRegret(value) {
  // ... (gleiche Implementierung)
}

export default WEIGHT_PRESETS;
```

---

### 1.3 Quick Mode - Meta Insights 📊

**Datei**: `utils/insightEngine.js`

```javascript
/**
 * Insight Engine
 * Erkennt Muster in Entscheidungsverhalten
 */

export class InsightEngine {
  /**
   * Analysiert Entscheidungsmuster eines Nutzers
   * @param {Array} decisions - Alle Entscheidungen des Nutzers
   * @returns {Array} Insights (max. 3)
   */
  static generateUserInsights(decisions) {
    if (decisions.length < 5) {
      return [{
        type: 'insufficient_data',
        text: 'Treffe noch ein paar Entscheidungen, um Muster zu erkennen.'
      }];
    }

    const insights = [];

    // Insight 1: Mode-Präferenz
    const quickCount = decisions.filter(d => d.mode === 'quick').length;
    const fullCount = decisions.filter(d => d.mode === 'full').length;

    if (quickCount > fullCount * 2) {
      insights.push({
        type: 'decision_style',
        text: 'Du entscheidest meist schnell und intuitiv. Das kann bei routinemäßigen Dingen gut sein, aber überlege bei wichtigen Entscheidungen den vollständigen Modus zu nutzen.'
      });
    } else if (fullCount > quickCount * 2) {
      insights.push({
        type: 'decision_style',
        text: 'Du analysierst Entscheidungen gründlich. Das ist wertvoll bei komplexen Themen, aber vertraue bei Alltäglichem ruhig auch deiner Intuition.'
      });
    }

    // Insight 2: Konfidenz-Trend
    const recentDecisions = decisions.slice(-10);
    const avgConfidence = recentDecisions.reduce((sum, d) => sum + d.percentage, 0) / recentDecisions.length;

    if (avgConfidence >= 70) {
      insights.push({
        type: 'confidence',
        text: 'Deine Entscheidungen zeigen hohe Klarheit. Du scheinst zu wissen, was du willst.'
      });
    } else if (avgConfidence <= 40) {
      insights.push({
        type: 'confidence',
        text: 'Viele deiner Entscheidungen sind im unklaren Bereich. Nimm dir mehr Zeit für die Analyse.'
      });
    }

    // Insight 3: Kategorien-Muster
    const categories = {};
    decisions.forEach(d => {
      if (d.category && d.category.length > 0) {
        d.category.forEach(cat => {
          categories[cat] = (categories[cat] || 0) + 1;
        });
      }
    });

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && topCategory[1] >= decisions.length * 0.3) {
      insights.push({
        type: 'focus_area',
        text: `Die meisten deiner Entscheidungen betreffen "${topCategory[0]}". Das scheint aktuell dein Fokus zu sein.`
      });
    }

    // Insight 4: Entscheidungs-Balance
    const yesCount = decisions.filter(d => d.recommendation === 'JA').length;
    const noCount = decisions.filter(d => d.recommendation === 'NEIN').length;

    if (yesCount > noCount * 3) {
      insights.push({
        type: 'tendency',
        text: 'Du tendierst meist zu "JA". Das kann mutig sein, aber achte darauf, Risiken nicht zu ignorieren.'
      });
    } else if (noCount > yesCount * 3) {
      insights.push({
        type: 'tendency',
        text: 'Du tendierst oft zu "NEIN". Vorsicht ist gut, aber verpasse keine Chancen.'
      });
    }

    // Maximal 3 Insights
    return insights.slice(0, 3);
  }

  /**
   * Generiert Insights für eine einzelne Entscheidung
   */
  static generateDecisionInsights(decision, userHistory) {
    const insights = [];

    // Vergleiche mit vergangenen Entscheidungen derselben Kategorie
    if (decision.category && decision.category.length > 0 && userHistory.length > 0) {
      const sameCategory = userHistory.filter(d =>
        d.category && d.category.some(c => decision.category.includes(c))
      );

      if (sameCategory.length >= 3) {
        const avgConf = sameCategory.reduce((sum, d) => sum + d.percentage, 0) / sameCategory.length;
        if (decision.percentage > avgConf + 15) {
          insights.push({
            type: 'comparison',
            text: `Diese Entscheidung ist klarer als deine bisherigen in dieser Kategorie.`
          });
        } else if (decision.percentage < avgConf - 15) {
          insights.push({
            type: 'comparison',
            text: `Bei dieser Entscheidung bist du unsicherer als sonst in dieser Kategorie.`
          });
        }
      }
    }

    return insights;
  }
}

export default InsightEngine;
```

---

## 2️⃣ NEUE FEATURES (High Impact für Premium)

### 2.1 Decision Review System 🔄

**Konzept**: Lernen durch Rückblick

#### Datenmodell

**Datei**: `models/DecisionReview.js`

```javascript
/**
 * Decision Review Model
 * Erfasst, wie eine Entscheidung ausgegangen ist
 */

export class DecisionReview {
  constructor(data) {
    this.id = data.id || `review_${Date.now()}`;
    this.decisionId = data.decisionId;           // Verknüpfung zur Decision
    this.reviewDate = data.reviewDate || new Date();
    this.outcome = data.outcome;                 // 'good', 'neutral', 'bad'
    this.notes = data.notes || '';               // Optional: Freitext
    this.wouldDecideAgain = data.wouldDecideAgain; // Boolean
    this.learnedLesson = data.learnedLesson || ''; // Was habe ich gelernt?
  }

  toJSON() {
    return {
      id: this.id,
      decisionId: this.decisionId,
      reviewDate: this.reviewDate.toISOString(),
      outcome: this.outcome,
      notes: this.notes,
      wouldDecideAgain: this.wouldDecideAgain,
      learnedLesson: this.learnedLesson
    };
  }

  static fromJSON(json) {
    return new DecisionReview({
      ...json,
      reviewDate: new Date(json.reviewDate)
    });
  }
}

export default DecisionReview;
```

#### Integration

**Erweiterung in App.js / DecisionStore**:

```javascript
// In completedDecisions Datenstruktur
{
  id: ...,
  decision: "...",
  recommendation: "JA",
  percentage: 72,
  date: "...",
  // NEU:
  reviewScheduledFor: null,  // Datum, wann Review vorgeschlagen wird
  review: null,              // DecisionReview-Objekt (wenn vorhanden)
  reviewReminded: false      // Flag: Wurde Nutzer schon erinnert?
}
```

#### UI-Flow

**1. Nach Speichern einer Entscheidung**:
```javascript
// In Result Screen, beim Klick auf "Neue Entscheidung"
const reviewDate = new Date();
reviewDate.setDate(reviewDate.getDate() + 7); // Nach 7 Tagen

const newDecision = {
  ...decisionData,
  reviewScheduledFor: reviewDate.toISOString(),
  review: null,
  reviewReminded: false
};
```

**2. Beim App-Start - Check für fällige Reviews**:
```javascript
useEffect(() => {
  checkForPendingReviews();
}, []);

const checkForPendingReviews = async () => {
  const decisions = await loadUserData(user.email, 'decisions', []);
  const now = new Date();

  const dueReviews = decisions.filter(d =>
    d.reviewScheduledFor &&
    new Date(d.reviewScheduledFor) <= now &&
    !d.review &&
    !d.reviewReminded
  );

  if (dueReviews.length > 0) {
    // Zeige Modal oder Benachrichtigung
    setShowReviewPrompt(dueReviews[0]); // Eins nach dem anderen
  }
};
```

**3. Review-Modal**:
```jsx
<Modal visible={showReviewPrompt !== null}>
  <View style={styles.reviewModal}>
    <Text style={styles.title}>Wie ist es ausgegangen?</Text>
    <Text style={styles.decisionTitle}>
      {showReviewPrompt?.decision}
    </Text>
    <Text style={styles.recommendation}>
      Empfehlung war: {showReviewPrompt?.recommendation}
    </Text>

    <Text style={styles.question}>Wie würdest du das Ergebnis bewerten?</Text>
    <View style={styles.outcomeButtons}>
      <TouchableOpacity onPress={() => handleReview('good')}>
        <Text>😊 Gut gelaufen</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleReview('neutral')}>
        <Text>😐 Neutral</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleReview('bad')}>
        <Text>😔 Schlecht gelaufen</Text>
      </TouchableOpacity>
    </View>

    <TextInput
      placeholder="Was hast du gelernt? (optional)"
      value={reviewNotes}
      onChangeText={setReviewNotes}
      multiline
    />

    <Button title="Später" onPress={() => remindLater()} />
  </View>
</Modal>
```

---

### 2.2 Decision Profile (Nutzer-Profil) 👤

**Konzept**: Automatisch generiertes Profil basierend auf Entscheidungsverhalten

#### Datenmodell

**Datei**: `models/DecisionProfile.js`

```javascript
/**
 * Decision Profile
 * Automatisch generiertes Nutzerprofil
 */

export class DecisionProfile {
  constructor(decisions, reviews) {
    this.generatedAt = new Date();
    this.totalDecisions = decisions.length;
    this.metrics = this._calculateMetrics(decisions, reviews);
    this.archetype = this._determineArchetype(this.metrics);
    this.strengths = this._identifyStrengths(this.metrics);
    this.growthAreas = this._identifyGrowthAreas(this.metrics);
  }

  _calculateMetrics(decisions, reviews) {
    return {
      avgConfidence: this._avgConfidence(decisions),
      modePreference: this._modePreference(decisions),
      categoryDistribution: this._categoryDistribution(decisions),
      decisionTendency: this._decisionTendency(decisions),
      reviewSuccessRate: this._reviewSuccessRate(decisions, reviews),
      consistencyScore: this._consistencyScore(decisions)
    };
  }

  _determineArchetype(metrics) {
    // Archetyp basierend auf Metriken
    if (metrics.avgConfidence >= 70 && metrics.reviewSuccessRate >= 0.7) {
      return {
        name: 'Der Sichere Entscheider',
        icon: '🎯',
        description: 'Du triffst klare Entscheidungen und liegst meist richtig. Dein Bauchgefühl und deine Analysen passen gut zusammen.'
      };
    } else if (metrics.avgConfidence >= 70 && metrics.reviewSuccessRate < 0.5) {
      return {
        name: 'Der Selbstbewusste Optimist',
        icon: '🚀',
        description: 'Du entscheidest selbstbewusst, aber nicht immer erfolgreich. Nimm dir mehr Zeit für die Risikoanalyse.'
      };
    } else if (metrics.avgConfidence <= 40 && metrics.modePreference === 'full') {
      return {
        name: 'Der Vorsichtige Analytiker',
        icon: '🔍',
        description: 'Du denkst Entscheidungen gründlich durch, bleibst aber oft unsicher. Vertraue mehr auf deine Analyse.'
      };
    } else if (metrics.modePreference === 'quick' && metrics.decisionTendency === 'yes') {
      return {
        name: 'Der Intuitive Macher',
        icon: '⚡',
        description: 'Du entscheidest schnell und optimistisch. Das ist wertvoll, aber achte auf Risiken.'
      };
    } else {
      return {
        name: 'Der Ausgewogene Entscheider',
        icon: '⚖️',
        description: 'Du wägst Pro und Contra gut ab. Dein Entscheidungsstil ist balanciert.'
      };
    }
  }

  _identifyStrengths(metrics) {
    const strengths = [];

    if (metrics.avgConfidence >= 60) {
      strengths.push('Klare Entscheidungen');
    }
    if (metrics.reviewSuccessRate >= 0.7) {
      strengths.push('Hohe Erfolgsquote');
    }
    if (metrics.consistencyScore >= 0.8) {
      strengths.push('Konsistent');
    }
    if (metrics.modePreference === 'full') {
      strengths.push('Gründliche Analyse');
    }

    return strengths;
  }

  _identifyGrowthAreas(metrics) {
    const areas = [];

    if (metrics.avgConfidence < 50) {
      areas.push('Mehr Vertrauen in deine Analysen entwickeln');
    }
    if (metrics.reviewSuccessRate < 0.5) {
      areas.push('Risikobewertung verbessern');
    }
    if (metrics.decisionTendency === 'yes' && metrics.reviewSuccessRate < 0.6) {
      areas.push('Kritischer bei "JA" sein');
    }

    return areas;
  }

  // Helper methods
  _avgConfidence(decisions) {
    if (decisions.length === 0) return 0;
    return decisions.reduce((sum, d) => sum + d.percentage, 0) / decisions.length;
  }

  _modePreference(decisions) {
    const quick = decisions.filter(d => d.mode === 'quick').length;
    const full = decisions.filter(d => d.mode === 'full').length;
    return quick > full ? 'quick' : 'full';
  }

  _categoryDistribution(decisions) {
    const dist = {};
    decisions.forEach(d => {
      if (d.category) {
        d.category.forEach(cat => {
          dist[cat] = (dist[cat] || 0) + 1;
        });
      }
    });
    return dist;
  }

  _decisionTendency(decisions) {
    const yes = decisions.filter(d => d.recommendation === 'JA').length;
    const no = decisions.filter(d => d.recommendation === 'NEIN').length;
    if (yes > no * 1.5) return 'yes';
    if (no > yes * 1.5) return 'no';
    return 'balanced';
  }

  _reviewSuccessRate(decisions, reviews) {
    if (!reviews || reviews.length === 0) return null;

    const successfulReviews = reviews.filter(r => {
      const decision = decisions.find(d => d.id === r.decisionId);
      if (!decision) return false;

      // Erfolg = Empfehlung stimmte mit Outcome überein
      if (decision.recommendation === 'JA' && r.outcome === 'good') return true;
      if (decision.recommendation === 'NEIN' && r.outcome === 'bad') return true;
      return false;
    }).length;

    return successfulReviews / reviews.length;
  }

  _consistencyScore(decisions) {
    // Misst, wie konsistent Konfidenz-Scores sind
    if (decisions.length < 5) return null;

    const confidences = decisions.map(d => d.percentage);
    const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / confidences.length;
    const stdDev = Math.sqrt(variance);

    // Niedrige Standardabweichung = hohe Konsistenz
    return 1 - (stdDev / 50); // Normalisiert auf 0-1
  }

  toJSON() {
    return {
      generatedAt: this.generatedAt.toISOString(),
      totalDecisions: this.totalDecisions,
      metrics: this.metrics,
      archetype: this.archetype,
      strengths: this.strengths,
      growthAreas: this.growthAreas
    };
  }
}

export default DecisionProfile;
```

---

### 2.3 Long-Term Confidence Score 📈

**Konzept**: Persönlicher Score, der sich über Zeit entwickelt

**Datei**: `utils/confidenceScoreCalculator.js`

```javascript
/**
 * Long-Term Confidence Score
 * Misst, wie gut du Entscheidungen triffst über Zeit
 */

export class ConfidenceScoreCalculator {
  /**
   * Berechnet persönlichen Confidence Score
   * @param {Array} decisions - Alle Entscheidungen
   * @param {Array} reviews - Alle Reviews
   * @returns {Object} { score, trend, insights }
   */
  static calculateScore(decisions, reviews) {
    if (decisions.length < 5) {
      return {
        score: null,
        trend: null,
        message: 'Noch nicht genug Daten (min. 5 Entscheidungen)'
      };
    }

    const factors = {
      clarity: this._clarityScore(decisions),
      success: this._successScore(decisions, reviews),
      consistency: this._consistencyScore(decisions),
      growth: this._growthScore(decisions)
    };

    // Gewichtete Gesamtberechnung
    const weights = {
      clarity: 0.3,
      success: 0.4,
      consistency: 0.2,
      growth: 0.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(factors).forEach(key => {
      if (factors[key] !== null) {
        totalScore += factors[key] * weights[key];
        totalWeight += weights[key];
      }
    });

    const finalScore = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : null;

    // Trend berechnen (letzte 30 Tage vs. vorherige 30 Tage)
    const trend = this._calculateTrend(decisions, reviews);

    return {
      score: finalScore,
      trend,
      factors,
      insights: this._generateInsights(factors, trend)
    };
  }

  static _clarityScore(decisions) {
    // Wie klar sind deine Entscheidungen? (basierend auf Konfidenz)
    const avgConfidence = decisions.reduce((sum, d) => sum + d.percentage, 0) / decisions.length;
    return avgConfidence / 100;
  }

  static _successScore(decisions, reviews) {
    if (!reviews || reviews.length === 0) return null;

    const successfulReviews = reviews.filter(r => {
      const decision = decisions.find(d => d.id === r.decisionId);
      if (!decision) return false;

      if (decision.recommendation === 'JA' && r.outcome === 'good') return true;
      if (decision.recommendation === 'NEIN' && r.outcome === 'bad') return true;
      if (decision.recommendation === 'UNENTSCHIEDEN' && r.outcome === 'neutral') return true;
      return false;
    }).length;

    return successfulReviews / reviews.length;
  }

  static _consistencyScore(decisions) {
    // Konsistenz in der Entscheidungsqualität
    const recentDecisions = decisions.slice(-10);
    const confidences = recentDecisions.map(d => d.percentage);
    const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / confidences.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, 1 - (stdDev / 50));
  }

  static _growthScore(decisions) {
    // Verbesserung über Zeit
    if (decisions.length < 10) return null;

    const firstHalf = decisions.slice(0, Math.floor(decisions.length / 2));
    const secondHalf = decisions.slice(Math.floor(decisions.length / 2));

    const avgFirst = firstHalf.reduce((sum, d) => sum + d.percentage, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, d) => sum + d.percentage, 0) / secondHalf.length;

    const improvement = (avgSecond - avgFirst) / 100;
    return Math.max(0, Math.min(1, 0.5 + improvement)); // 0-1 range
  }

  static _calculateTrend(decisions, reviews) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recent = decisions.filter(d => new Date(d.date) >= thirtyDaysAgo);
    const previous = decisions.filter(d => {
      const date = new Date(d.date);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    if (recent.length === 0 || previous.length === 0) return null;

    const recentAvg = recent.reduce((sum, d) => sum + d.percentage, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.percentage, 0) / previous.length;

    const diff = Math.round(recentAvg - previousAvg);

    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      change: Math.abs(diff),
      text: diff > 0
        ? `+${diff}% in den letzten 30 Tagen`
        : diff < 0
        ? `${diff}% in den letzten 30 Tagen`
        : 'Stabil'
    };
  }

  static _generateInsights(factors, trend) {
    const insights = [];

    if (factors.clarity !== null && factors.clarity >= 0.7) {
      insights.push('Deine Entscheidungen sind meist klar');
    }

    if (factors.success !== null && factors.success >= 0.7) {
      insights.push('Du triffst oft die richtige Wahl');
    }

    if (trend && trend.direction === 'up') {
      insights.push('Du verbesserst dich kontinuierlich');
    }

    if (factors.consistency !== null && factors.consistency >= 0.8) {
      insights.push('Deine Entscheidungsqualität ist stabil');
    }

    return insights;
  }
}

export default ConfidenceScoreCalculator;
```

---

## 3️⃣ ARCHITEKTUR & STATE MANAGEMENT

### Decision Store (Zustand)

**Datei**: `store/decisionStore.js`

```javascript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DecisionExplainer } from '../utils/decisionExplainer';
import { applyWeights, WEIGHT_PRESETS } from '../utils/decisionWeights';
import { InsightEngine } from '../utils/insightEngine';
import { DecisionProfile } from '../models/DecisionProfile';
import { ConfidenceScoreCalculator } from '../utils/confidenceScoreCalculator';

const getUserKey = (userId, key) => {
  if (!userId) return key;
  return `user_${userId}_${key}`;
};

export const useDecisionStore = create((set, get) => ({
  // State
  currentUserId: null,
  decisions: [],
  reviews: [],
  profile: null,
  confidenceScore: null,

  // Current decision in progress
  currentDecision: null,

  // Settings
  weightPreset: 'balanced',

  // Loading
  isLoading: false,

  // Actions
  setCurrentUser: (userId) => {
    set({ currentUserId: userId });
  },

  /**
   * Startet neue Entscheidung
   */
  startDecision: (data) => {
    set({
      currentDecision: {
        id: `decision_${Date.now()}`,
        title: data.title,
        category: data.category || [],
        mode: data.mode || 'full',
        startedAt: new Date(),
        answers: {},
        weightPreset: get().weightPreset
      }
    });
  },

  /**
   * Aktualisiert Antworten
   */
  updateAnswers: (stepKey, answer) => {
    const { currentDecision } = get();
    if (!currentDecision) return;

    set({
      currentDecision: {
        ...currentDecision,
        answers: {
          ...currentDecision.answers,
          [stepKey]: answer
        }
      }
    });

    // Auto-save
    get().saveCurrentDecision();
  },

  /**
   * Berechnet finale Empfehlung
   */
  calculateRecommendation: () => {
    const { currentDecision } = get();
    if (!currentDecision) return null;

    // 1. Berechne gewichteten Score
    const percentage = applyWeights(
      currentDecision.answers,
      currentDecision.mode,
      currentDecision.weightPreset
    );

    // 2. Bestimme Empfehlung
    let recommendation = 'UNENTSCHIEDEN';
    if (currentDecision.mode === 'full') {
      if (percentage >= 55) recommendation = 'JA';
      else if (percentage <= 44) recommendation = 'NEIN';
    } else {
      if (percentage >= 60) recommendation = 'JA';
      else if (percentage <= 39) recommendation = 'NEIN';
    }

    // 3. Generiere Erklärung
    const explanation = DecisionExplainer.explainDecision(
      currentDecision.answers,
      currentDecision.mode,
      percentage,
      recommendation
    );

    // 4. Generiere Insights (im Kontext der Historie)
    const decisionInsights = InsightEngine.generateDecisionInsights(
      { ...currentDecision, percentage, recommendation },
      get().decisions
    );

    return {
      percentage,
      recommendation,
      explanation,
      insights: decisionInsights
    };
  },

  /**
   * Speichert abgeschlossene Entscheidung
   */
  saveCompletedDecision: async (additionalData = {}) => {
    const { currentDecision, currentUserId, decisions } = get();
    if (!currentDecision || !currentUserId) return;

    const result = get().calculateRecommendation();

    const completedDecision = {
      ...currentDecision,
      ...result,
      ...additionalData,
      completedAt: new Date(),
      reviewScheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Tage
      review: null,
      reviewReminded: false
    };

    const newDecisions = [...decisions, completedDecision];
    set({ decisions: newDecisions, currentDecision: null });

    // Persist
    await AsyncStorage.setItem(
      getUserKey(currentUserId, 'decisions'),
      JSON.stringify(newDecisions)
    );

    // Update Profil & Confidence Score
    get().updateProfile();
    get().updateConfidenceScore();

    return completedDecision;
  },

  /**
   * Fügt Review hinzu
   */
  addReview: async (decisionId, reviewData) => {
    const { decisions, reviews, currentUserId } = get();

    const review = {
      id: `review_${Date.now()}`,
      decisionId,
      ...reviewData,
      createdAt: new Date()
    };

    // Update decision
    const updatedDecisions = decisions.map(d =>
      d.id === decisionId ? { ...d, review } : d
    );

    const newReviews = [...reviews, review];

    set({
      decisions: updatedDecisions,
      reviews: newReviews
    });

    // Persist
    await AsyncStorage.setItem(
      getUserKey(currentUserId, 'decisions'),
      JSON.stringify(updatedDecisions)
    );
    await AsyncStorage.setItem(
      getUserKey(currentUserId, 'reviews'),
      JSON.stringify(newReviews)
    );

    // Update Profile & Confidence
    get().updateProfile();
    get().updateConfidenceScore();
  },

  /**
   * Aktualisiert Profil
   */
  updateProfile: () => {
    const { decisions, reviews } = get();
    if (decisions.length < 5) {
      set({ profile: null });
      return;
    }

    const profile = new DecisionProfile(decisions, reviews);
    set({ profile });
  },

  /**
   * Aktualisiert Confidence Score
   */
  updateConfidenceScore: () => {
    const { decisions, reviews } = get();
    const score = ConfidenceScoreCalculator.calculateScore(decisions, reviews);
    set({ confidenceScore: score });
  },

  /**
   * Lädt Daten
   */
  loadData: async (userId) => {
    try {
      set({ isLoading: true, currentUserId: userId });

      const decisionsData = await AsyncStorage.getItem(getUserKey(userId, 'decisions'));
      const reviewsData = await AsyncStorage.getItem(getUserKey(userId, 'reviews'));
      const currentDecisionData = await AsyncStorage.getItem(getUserKey(userId, 'currentDecision'));

      const decisions = decisionsData ? JSON.parse(decisionsData) : [];
      const reviews = reviewsData ? JSON.parse(reviewsData) : [];
      const currentDecision = currentDecisionData ? JSON.parse(currentDecisionData) : null;

      set({ decisions, reviews, currentDecision });

      // Update derived data
      get().updateProfile();
      get().updateConfidenceScore();

    } catch (error) {
      console.error('Failed to load decision data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Auto-Save current decision
   */
  saveCurrentDecision: async () => {
    const { currentDecision, currentUserId } = get();
    if (!currentDecision || !currentUserId) return;

    try {
      await AsyncStorage.setItem(
        getUserKey(currentUserId, 'currentDecision'),
        JSON.stringify(currentDecision)
      );
    } catch (error) {
      console.error('Failed to save current decision:', error);
    }
  },

  /**
   * Setzt Gewichtungs-Preset
   */
  setWeightPreset: (presetId) => {
    set({ weightPreset: presetId });
  },

  /**
   * Generiert User Insights
   */
  getUserInsights: () => {
    const { decisions } = get();
    return InsightEngine.generateUserInsights(decisions);
  },

  /**
   * Exportiert alle Daten
   */
  exportData: () => {
    const { decisions, reviews, profile, confidenceScore } = get();
    return {
      decisions,
      reviews,
      profile: profile?.toJSON(),
      confidenceScore,
      exportedAt: new Date().toISOString()
    };
  },

  /**
   * Löscht alle Daten
   */
  clearAll: async () => {
    const { currentUserId } = get();
    if (!currentUserId) return;

    try {
      await AsyncStorage.removeItem(getUserKey(currentUserId, 'decisions'));
      await AsyncStorage.removeItem(getUserKey(currentUserId, 'reviews'));
      await AsyncStorage.removeItem(getUserKey(currentUserId, 'currentDecision'));

      set({
        decisions: [],
        reviews: [],
        currentDecision: null,
        profile: null,
        confidenceScore: null
      });
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
}));
```

---

## 4️⃣ UI/UX INTEGRATION

### Ergebnis-Screen mit Explainability

```jsx
// In Result Screen
const { explanation } = useDecisionStore(state => ({
  explanation: state.calculateRecommendation()?.explanation
}));

return (
  <ScrollView>
    {/* Bestehende Empfehlung */}
    <View style={styles.recommendationCard}>
      <Text style={styles.recommendation}>{recommendation}</Text>
      <Text style={styles.confidence}>{percentage}% Konfidenz</Text>
    </View>

    {/* NEU: Erklärung */}
    <View style={styles.explanationCard}>
      <Text style={styles.sectionTitle}>💡 Warum diese Empfehlung?</Text>
      <Text style={styles.summary}>{explanation.summary}</Text>

      {/* Positive Faktoren */}
      {explanation.factors.positive.length > 0 && (
        <View style={styles.factorSection}>
          <Text style={styles.factorTitle}>✓ Dafür spricht:</Text>
          {explanation.factors.positive.slice(0, 3).map((factor, i) => (
            <View key={i} style={styles.factor}>
              <View style={[styles.strengthBar, { width: `${factor.strength * 10}%` }]} />
              <Text>{factor.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Negative Faktoren */}
      {explanation.factors.negative.length > 0 && (
        <View style={styles.factorSection}>
          <Text style={styles.factorTitle}>⚠️ Dagegen spricht:</Text>
          {explanation.factors.negative.slice(0, 3).map((factor, i) => (
            <View key={i} style={styles.factor}>
              <View style={[styles.strengthBar, { width: `${factor.strength * 10}%`, backgroundColor: '#ef4444' }]} />
              <Text>{factor.text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Insights */}
      {explanation.insights.length > 0 && (
        <View style={styles.insightsSection}>
          {explanation.insights.map((insight, i) => (
            <Text key={i} style={styles.insight}>💭 {insight.text}</Text>
          ))}
        </View>
      )}
    </View>
  </ScrollView>
);
```

### Gewichtungs-Auswahl

```jsx
// Neuer Screen oder Modal
<View style={styles.weightPresetSelector}>
  <Text style={styles.title}>Entscheidungstyp wählen</Text>
  <Text style={styles.subtitle}>Unterschiedliche Typen gewichten Faktoren anders</Text>

  {Object.values(WEIGHT_PRESETS).map(preset => (
    <TouchableOpacity
      key={preset.id}
      style={[
        styles.presetButton,
        weightPreset === preset.id && styles.presetButtonActive
      ]}
      onPress={() => setWeightPreset(preset.id)}
    >
      <Text style={styles.presetIcon}>{preset.icon}</Text>
      <View style={styles.presetInfo}>
        <Text style={styles.presetName}>{preset.name}</Text>
        <Text style={styles.presetDescription}>{preset.description}</Text>
      </View>
    </TouchableOpacity>
  ))}
</View>
```

### Tracker mit Insights

```jsx
// In Tracker Screen
const userInsights = useDecisionStore(state => state.getUserInsights());
const confidenceScore = useDecisionStore(state => state.confidenceScore);

return (
  <View>
    {/* Bestehende Statistik-Boxen */}

    {/* NEU: Confidence Score */}
    {confidenceScore && confidenceScore.score !== null && (
      <View style={styles.confidenceCard}>
        <Text style={styles.title}>Deine Entscheidungskompetenz</Text>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{confidenceScore.score}%</Text>
          {confidenceScore.trend && (
            <Text style={styles.scoreTrend}>
              {confidenceScore.trend.direction === 'up' ? '↗' : '↘'} {confidenceScore.trend.text}
            </Text>
          )}
        </View>
        {confidenceScore.insights.map((insight, i) => (
          <Text key={i} style={styles.insightText}>• {insight}</Text>
        ))}
      </View>
    )}

    {/* NEU: User Insights */}
    {userInsights.length > 0 && (
      <View style={styles.insightsCard}>
        <Text style={styles.title}>📊 Deine Muster</Text>
        {userInsights.map((insight, i) => (
          <View key={i} style={styles.insightItem}>
            <Text style={styles.insightText}>{insight.text}</Text>
          </View>
        ))}
      </View>
    )}

    {/* Bestehender Kalender */}
  </View>
);
```

---

## 5️⃣ PREMIUM-FEATURES (Freemium-Strategie)

### Free Tier
- Decision Assistant (Vollständig & Quick)
- Basis-Empfehlung mit Konfidenz-Score
- Kanban Board (Basic)
- Tracker mit Kalender
- Max. 20 Entscheidungen gespeichert

### Premium Tier ($4.99/Monat oder $39.99/Jahr)
- ✅ **Explainability Layer** (volle Erklärungen)
- ✅ **Gewichtungs-Presets** (Rational, Emotional, etc.)
- ✅ **Decision Reviews** (Review-System)
- ✅ **Decision Profile** (automatisches Profil)
- ✅ **Long-Term Confidence Score**
- ✅ **Unbegrenzte Entscheidungen**
- ✅ **Erweiterte Insights**
- ✅ **Export/Import** (JSON, CSV)
- ✅ **Prioritäts-Support**

### Zukünftige Premium Features
- **AI-Powered Insights** (wenn sinnvoll)
- **Second Opinion** (Feedback von Freunden)
- **Decision Templates** (vorgefertigte Entscheidungstypen)
- **Habit Tracking** (Entscheidungsmuster über Wochen)

---

## 6️⃣ MIGRATIONS-STRATEGIE

### Phase 1: Foundation (Woche 1-2)
- [ ] Erstelle `utils/decisionExplainer.js`
- [ ] Erstelle `utils/decisionWeights.js`
- [ ] Erstelle `utils/insightEngine.js`
- [ ] Erstelle `store/decisionStore.js`
- [ ] Integriere in bestehende App (ohne UI zunächst)

### Phase 2: UI Integration (Woche 3-4)
- [ ] Explainability Layer im Result Screen
- [ ] Gewichtungs-Auswahl UI
- [ ] Insights in Tracker

### Phase 3: Review System (Woche 5-6)
- [ ] Erstelle `models/DecisionReview.js`
- [ ] Review-Prompt-Logik
- [ ] Review-UI

### Phase 4: Profile & Confidence (Woche 7-8)
- [ ] Erstelle `models/DecisionProfile.js`
- [ ] Erstelle `utils/confidenceScoreCalculator.js`
- [ ] Profil-Screen
- [ ] Confidence-Score-Visualisierung

### Phase 5: Premium & Polish (Woche 9-10)
- [ ] Premium-Paywall-Logik
- [ ] In-App-Purchase Integration
- [ ] Animations & Polish
- [ ] Testing & Bugfixes

---

## 7️⃣ TECHNICAL NOTES

### Datenstruktur-Änderungen

**Bestehend** (in App.js):
```javascript
const decision = {
  id: Date.now(),
  date: new Date().toISOString(),
  decision: "Titel",
  recommendation: "JA",
  percentage: 72,
  category: ["Leben"],
  isFavorite: false,
  journal: "",
  mode: "full"
};
```

**NEU** (erweitert):
```javascript
const decision = {
  // Bestehend
  id: Date.now(),
  date: new Date().toISOString(),
  decision: "Titel",
  recommendation: "JA",
  percentage: 72,
  category: ["Leben"],
  isFavorite: false,
  journal: "",
  mode: "full",

  // NEU
  answers: { step1: {...}, step2: {...}, ... },
  weightPreset: "balanced",
  explanation: {
    summary: "...",
    factors: { positive: [...], negative: [...] },
    insights: [...]
  },
  reviewScheduledFor: "2025-12-25T10:00:00.000Z",
  review: null,  // DecisionReview-Objekt
  reviewReminded: false
};
```

### Backward Compatibility

Alte Entscheidungen (ohne neue Felder) bleiben kompatibel:
```javascript
function migrateOldDecision(oldDecision) {
  return {
    ...oldDecision,
    answers: oldDecision.answers || {},
    weightPreset: 'balanced',
    explanation: null, // Wird nachträglich nicht generiert
    reviewScheduledFor: null,
    review: null,
    reviewReminded: false
  };
}
```

---

## 8️⃣ NEXT STEPS

**Sofort umsetzbar** (Quick Wins):
1. ✅ Erstelle `decisionExplainer.js` (2-3 Stunden)
2. ✅ Integriere Explainability im Result Screen (1-2 Stunden)
3. ✅ Teste mit bestehenden Entscheidungen

**Diese Woche**:
- Implementiere Gewichtungs-System
- Teste verschiedene Presets
- UI für Preset-Auswahl

**Nächste Woche**:
- Review-System (Datenmodell + Logik)
- Review-Prompt beim App-Start
- Review-UI

---

**Fragen? Feedback? Lass uns iterieren!** 🚀
