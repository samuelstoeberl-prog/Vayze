export const WEIGHT_PRESETS = {
  balanced: {
    name: 'Ausgewogen',
    description: 'Alle Faktoren gleichmäßig berücksichtigt',
    icon: '⚖️',
    weights: {
      intuition: 1.0,      
      risk: 1.0,           
      consequences: 1.0,   
      values: 1.0,         
      external: 1.0,       
      headHeart: 1.0       
    }
  },

  rational: {
    name: 'Rational',
    description: 'Fokus auf Logik, Fakten und langfristige Konsequenzen',
    icon: '🧠',
    weights: {
      intuition: 0.5,      
      risk: 1.5,           
      consequences: 1.8,   
      values: 1.2,         
      external: 1.3,       
      headHeart: 0.7       
    }
  },

  emotional: {
    name: 'Emotional',
    description: 'Fokus auf Bauchgefühl und innere Werte',
    icon: '❤️',
    weights: {
      intuition: 1.8,      
      risk: 0.7,           
      consequences: 0.8,   
      values: 1.5,         
      external: 0.5,       
      headHeart: 1.6       
    }
  },

  career: {
    name: 'Karriere',
    description: 'Optimiert für berufliche Entscheidungen',
    icon: '💼',
    weights: {
      intuition: 0.8,
      risk: 1.4,           
      consequences: 1.6,   
      values: 1.3,         
      external: 1.2,       
      headHeart: 0.9
    }
  },

  relationship: {
    name: 'Beziehung',
    description: 'Optimiert für zwischenmenschliche Entscheidungen',
    icon: '💕',
    weights: {
      intuition: 1.6,      
      risk: 0.8,
      consequences: 1.2,
      values: 1.5,         
      external: 0.6,       
      headHeart: 1.7       
    }
  },

  financial: {
    name: 'Finanziell',
    description: 'Optimiert für Geld- und Investitionsentscheidungen',
    icon: '💰',
    weights: {
      intuition: 0.6,
      risk: 1.8,           
      consequences: 1.7,   
      values: 1.1,
      external: 1.4,       
      headHeart: 0.5       
    }
  }
};

export function applyWeights(answers, mode, preset = 'balanced') {
  const weights = WEIGHT_PRESETS[preset]?.weights || WEIGHT_PRESETS.balanced.weights;

  if (mode === 'full') {
    return applyWeightsFull(answers, weights);
  } else if (mode === 'quick') {
    return applyWeightsQuick(answers, preset);
  }

  return 50; 
}

function applyWeightsFull(answers, weights) {
  let weightedScore = 0;
  let totalWeight = 0;

  if (answers.step1) {
    const gut = answers.step1.gut || 5;
    const normalized = (gut / 10) * 100; 
    weightedScore += normalized * weights.intuition;
    totalWeight += weights.intuition;
  }

  if (answers.step2) {
    const { opportunities = [], risks = [] } = answers.step2;
    const balance = opportunities.length - risks.length;
    const normalized = ((balance + 5) / 10) * 100; 
    weightedScore += Math.max(0, Math.min(100, normalized)) * weights.risk;
    totalWeight += weights.risk;
  }

  if (answers.step3) {
    const { positiveConsequences = [], negativeConsequences = [] } = answers.step3;
    const balance = positiveConsequences.length - negativeConsequences.length;
    const normalized = ((balance + 5) / 10) * 100;
    weightedScore += Math.max(0, Math.min(100, normalized)) * weights.consequences;
    totalWeight += weights.consequences;
  }

  if (answers.step4) {
    const alignment = answers.step4.alignment || 5;
    const normalized = (alignment / 10) * 100;
    weightedScore += normalized * weights.values;
    totalWeight += weights.values;
  }

  if (answers.step5) {
    const externalOpinion = answers.step5.externalOpinion || 5;
    const normalized = (externalOpinion / 10) * 100;
    weightedScore += normalized * weights.external;
    totalWeight += weights.external;
  }

  if (answers.step6) {
    const { headDecision, heartDecision } = answers.step6;
    let score = 50; 

    if (headDecision === 'yes' && heartDecision === 'yes') {
      score = 100;
    } else if (headDecision === 'no' && heartDecision === 'no') {
      score = 0;
    } else if (headDecision === 'yes' && heartDecision === 'no') {
      score = 60; 
    } else if (headDecision === 'no' && heartDecision === 'yes') {
      score = 40; 
    }

    weightedScore += score * weights.headHeart;
    totalWeight += weights.headHeart;
  }

  const percentage = totalWeight > 0 ? (weightedScore / totalWeight) : 50;
  return Math.round(percentage);
}

function applyWeightsQuick(answers, preset) {
  let weightedScore = 0;
  let totalWeight = 0;

  const isEmotional = preset === 'emotional' || preset === 'relationship';
  const gutWeight = isEmotional ? 1.5 : 1.0;
  const proConWeight = isEmotional ? 0.8 : 1.2;

  if (answers.quickGut !== undefined) {
    const gut = answers.quickGut;
    const normalized = (gut / 10) * 100;
    weightedScore += normalized * gutWeight;
    totalWeight += gutWeight;
  }

  if (answers.quickProCon) {
    const { pros = [], cons = [] } = answers.quickProCon;
    const balance = pros.length - cons.length;
    const normalized = ((balance + 5) / 10) * 100; 
    weightedScore += Math.max(0, Math.min(100, normalized)) * proConWeight;
    totalWeight += proConWeight;
  }

  const percentage = totalWeight > 0 ? (weightedScore / totalWeight) : 50;
  return Math.round(percentage);
}

export function recommendPreset(decisionText) {
  if (!decisionText) return 'balanced';

  const text = decisionText.toLowerCase();

  if (text.includes('job') || text.includes('karriere') || text.includes('arbeit') ||
      text.includes('stelle') || text.includes('bewerb') || text.includes('chef')) {
    return 'career';
  }

  if (text.includes('beziehung') || text.includes('freund') || text.includes('partner') ||
      text.includes('liebe') || text.includes('heirat') || text.includes('trennung')) {
    return 'relationship';
  }

  if (text.includes('kauf') || text.includes('geld') || text.includes('invest') ||
      text.includes('kredit') || text.includes('finanz') || text.includes('€') ||
      text.includes('euro') || text.includes('dollar')) {
    return 'financial';
  }

  if (text.includes('gefühl') || text.includes('herz') || text.includes('lieb') ||
      text.includes('glück') || text.includes('traum')) {
    return 'emotional';
  }

  if (text.includes('logisch') || text.includes('vernünft') || text.includes('rational') ||
      text.includes('fakt')) {
    return 'rational';
  }

  return 'balanced';
}

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
