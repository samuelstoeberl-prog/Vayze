/**
 * DecisionWeights
 *
 * Ermöglicht gewichtete Entscheidungen basierend auf Kontext-Presets.
 * User kann den Fokus der Entscheidung verschieben (rational, emotional, etc.)
 */

/**
 * Gewichtungs-Presets für verschiedene Entscheidungstypen
 */
export const WEIGHT_PRESETS = {
  balanced: {
    name: 'Ausgewogen',
    description: 'Alle Faktoren gleichmäßig berücksichtigt',
    icon: '⚖️',
    weights: {
      intuition: 1.0,      // Bauchgefühl (Step 1)
      risk: 1.0,           // Chancen vs Risiken (Step 2)
      consequences: 1.0,   // Konsequenzen (Step 3)
      values: 1.0,         // Ziele & Werte (Step 4)
      external: 1.0,       // Dritte Meinung (Step 5)
      headHeart: 1.0       // Kopf vs Herz (Step 6)
    }
  },

  rational: {
    name: 'Rational',
    description: 'Fokus auf Logik, Fakten und langfristige Konsequenzen',
    icon: '🧠',
    weights: {
      intuition: 0.5,      // Bauchgefühl weniger wichtig
      risk: 1.5,           // Chancen/Risiken wichtiger
      consequences: 1.8,   // Konsequenzen sehr wichtig
      values: 1.2,         // Ziele wichtig
      external: 1.3,       // Außenmeinung zählt
      headHeart: 0.7       // Kopf wichtiger als Herz
    }
  },

  emotional: {
    name: 'Emotional',
    description: 'Fokus auf Bauchgefühl und innere Werte',
    icon: '❤️',
    weights: {
      intuition: 1.8,      // Bauchgefühl sehr wichtig
      risk: 0.7,           // Risiken weniger wichtig
      consequences: 0.8,   // Konsequenzen weniger wichtig
      values: 1.5,         // Werte sehr wichtig
      external: 0.5,       // Außenmeinung unwichtig
      headHeart: 1.6       // Herz wichtiger
    }
  },

  career: {
    name: 'Karriere',
    description: 'Optimiert für berufliche Entscheidungen',
    icon: '💼',
    weights: {
      intuition: 0.8,
      risk: 1.4,           // Chancen wichtig für Karriere
      consequences: 1.6,   // Langfristige Auswirkungen
      values: 1.3,         // Passt es zu meinen Zielen?
      external: 1.2,       // Mentor/Kollegen-Meinung
      headHeart: 0.9
    }
  },

  relationship: {
    name: 'Beziehung',
    description: 'Optimiert für zwischenmenschliche Entscheidungen',
    icon: '💕',
    weights: {
      intuition: 1.6,      // Bauchgefühl wichtig
      risk: 0.8,
      consequences: 1.2,
      values: 1.5,         // Werte sehr wichtig
      external: 0.6,       // Weniger Außenmeinung
      headHeart: 1.7       // Herz sehr wichtig
    }
  },

  financial: {
    name: 'Finanziell',
    description: 'Optimiert für Geld- und Investitionsentscheidungen',
    icon: '💰',
    weights: {
      intuition: 0.6,
      risk: 1.8,           // Risiko/Chancen sehr wichtig
      consequences: 1.7,   // Langfristige Folgen
      values: 1.1,
      external: 1.4,       // Experten-Meinung wichtig
      headHeart: 0.5       // Kopf dominiert
    }
  }
};

/**
 * Wendet Gewichtungen auf eine Entscheidung an
 */
export function applyWeights(answers, mode, preset = 'balanced') {
  const weights = WEIGHT_PRESETS[preset]?.weights || WEIGHT_PRESETS.balanced.weights;

  if (mode === 'full') {
    return applyWeightsFull(answers, weights);
  } else if (mode === 'quick') {
    return applyWeightsQuick(answers, preset);
  }

  return 50; // Fallback
}

/**
 * Gewichtung für Full Mode (6 Steps)
 */
function applyWeightsFull(answers, weights) {
  let weightedScore = 0;
  let totalWeight = 0;

  // Step 1: Bauchgefühl (0-10)
  if (answers.step1) {
    const gut = answers.step1.gut || 5;
    const normalized = (gut / 10) * 100; // 0-100
    weightedScore += normalized * weights.intuition;
    totalWeight += weights.intuition;
  }

  // Step 2: Chancen vs Risiken
  if (answers.step2) {
    const { opportunities = [], risks = [] } = answers.step2;
    const balance = opportunities.length - risks.length;
    const normalized = ((balance + 5) / 10) * 100; // -5 bis +5 → 0-100
    weightedScore += Math.max(0, Math.min(100, normalized)) * weights.risk;
    totalWeight += weights.risk;
  }

  // Step 3: Konsequenzen
  if (answers.step3) {
    const { positiveConsequences = [], negativeConsequences = [] } = answers.step3;
    const balance = positiveConsequences.length - negativeConsequences.length;
    const normalized = ((balance + 5) / 10) * 100;
    weightedScore += Math.max(0, Math.min(100, normalized)) * weights.consequences;
    totalWeight += weights.consequences;
  }

  // Step 4: Ziele & Werte (0-10)
  if (answers.step4) {
    const alignment = answers.step4.alignment || 5;
    const normalized = (alignment / 10) * 100;
    weightedScore += normalized * weights.values;
    totalWeight += weights.values;
  }

  // Step 5: Dritte Meinung (0-10)
  if (answers.step5) {
    const externalOpinion = answers.step5.externalOpinion || 5;
    const normalized = (externalOpinion / 10) * 100;
    weightedScore += normalized * weights.external;
    totalWeight += weights.external;
  }

  // Step 6: Kopf vs Herz
  if (answers.step6) {
    const { headDecision, heartDecision } = answers.step6;
    let score = 50; // Neutral

    if (headDecision === 'yes' && heartDecision === 'yes') {
      score = 100;
    } else if (headDecision === 'no' && heartDecision === 'no') {
      score = 0;
    } else if (headDecision === 'yes' && heartDecision === 'no') {
      score = 60; // Leicht positiv
    } else if (headDecision === 'no' && heartDecision === 'yes') {
      score = 40; // Leicht negativ
    }

    weightedScore += score * weights.headHeart;
    totalWeight += weights.headHeart;
  }

  // Normalisieren auf 0-100
  const percentage = totalWeight > 0 ? (weightedScore / totalWeight) : 50;
  return Math.round(percentage);
}

/**
 * Gewichtung für Quick Mode (2 Steps)
 */
function applyWeightsQuick(answers, preset) {
  let weightedScore = 0;
  let totalWeight = 0;

  // Quick Mode hat nur 2 Faktoren, Preset bestimmt Gewichtung
  const isEmotional = preset === 'emotional' || preset === 'relationship';
  const gutWeight = isEmotional ? 1.5 : 1.0;
  const proConWeight = isEmotional ? 0.8 : 1.2;

  // Bauchgefühl (0-10)
  if (answers.quickGut !== undefined) {
    const gut = answers.quickGut;
    const normalized = (gut / 10) * 100;
    weightedScore += normalized * gutWeight;
    totalWeight += gutWeight;
  }

  // Pro/Contra
  if (answers.quickProCon) {
    const { pros = [], cons = [] } = answers.quickProCon;
    const balance = pros.length - cons.length;
    const normalized = ((balance + 5) / 10) * 100; // -5 bis +5 → 0-100
    weightedScore += Math.max(0, Math.min(100, normalized)) * proConWeight;
    totalWeight += proConWeight;
  }

  const percentage = totalWeight > 0 ? (weightedScore / totalWeight) : 50;
  return Math.round(percentage);
}

/**
 * Empfiehlt ein Preset basierend auf dem Entscheidungstext
 */
export function recommendPreset(decisionText) {
  if (!decisionText) return 'balanced';

  const text = decisionText.toLowerCase();

  // Karriere-Keywords
  if (text.includes('job') || text.includes('karriere') || text.includes('arbeit') ||
      text.includes('stelle') || text.includes('bewerb') || text.includes('chef')) {
    return 'career';
  }

  // Beziehungs-Keywords
  if (text.includes('beziehung') || text.includes('freund') || text.includes('partner') ||
      text.includes('liebe') || text.includes('heirat') || text.includes('trennung')) {
    return 'relationship';
  }

  // Finanz-Keywords
  if (text.includes('kauf') || text.includes('geld') || text.includes('invest') ||
      text.includes('kredit') || text.includes('finanz') || text.includes('€') ||
      text.includes('euro') || text.includes('dollar')) {
    return 'financial';
  }

  // Emotional-Keywords
  if (text.includes('gefühl') || text.includes('herz') || text.includes('lieb') ||
      text.includes('glück') || text.includes('traum')) {
    return 'emotional';
  }

  // Rational-Keywords
  if (text.includes('logisch') || text.includes('vernünft') || text.includes('rational') ||
      text.includes('fakt')) {
    return 'rational';
  }

  return 'balanced';
}

/**
 * Gibt eine Erklärung, warum dieses Preset empfohlen wurde
 */
export function getPresetRecommendationReason(preset) {
  const reasons = {
    career: 'Diese Entscheidung scheint beruflich zu sein. Wir fokussieren auf langfristige Karrierechancen.',
    relationship: 'Diese Entscheidung scheint zwischenmenschlich zu sein. Wir berücksichtigen deine Gefühle stärker.',
    financial: 'Diese Entscheidung scheint finanziell zu sein. Wir fokussieren auf Risiken und Expertenmeinungen.',
    emotional: 'Diese Entscheidung scheint persönlich zu sein. Wir hören auf dein Bauchgefühl.',
    rational: 'Diese Entscheidung erfordert logisches Denken. Wir fokussieren auf Fakten und Konsequenzen.',
    balanced: 'Wir berücksichtigen alle Faktoren gleichmäßig.'
  };

  return reasons[preset] || reasons.balanced;
}
