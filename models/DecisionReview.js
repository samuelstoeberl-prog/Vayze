/**
 * DecisionReview Model
 *
 * Repräsentiert ein Follow-up Review einer vergangenen Entscheidung.
 * Ermöglicht dem User zu reflektieren: War die Entscheidung richtig?
 */

export class DecisionReview {
  constructor(data = {}) {
    this.id = data.id || this._generateId();
    this.decisionId = data.decisionId; // Referenz zur ursprünglichen Decision
    this.reviewDate = data.reviewDate || new Date().toISOString();

    // Outcome: Wie ist es gelaufen?
    this.outcome = data.outcome || null; // 'good', 'neutral', 'bad'

    // Würdest du es wieder so entscheiden?
    this.wouldDecideAgain = data.wouldDecideAgain || null; // true/false

    // Freitext-Notizen
    this.notes = data.notes || '';

    // Was hast du gelernt?
    this.learnedLesson = data.learnedLesson || '';

    // Optional: Emotionale Reaktion
    this.emotionalState = data.emotionalState || null; // 'happy', 'neutral', 'regret'

    // Metadata
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Validierung
   */
  isValid() {
    return (
      this.decisionId &&
      this.outcome &&
      this.wouldDecideAgain !== null
    );
  }

  /**
   * Konvertiert zu Plain Object für Storage
   */
  toJSON() {
    return {
      id: this.id,
      decisionId: this.decisionId,
      reviewDate: this.reviewDate,
      outcome: this.outcome,
      wouldDecideAgain: this.wouldDecideAgain,
      notes: this.notes,
      learnedLesson: this.learnedLesson,
      emotionalState: this.emotionalState,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Erstellt DecisionReview aus Plain Object
   */
  static fromJSON(data) {
    return new DecisionReview(data);
  }

  /**
   * Berechnet Success Score basierend auf Review
   * Wird für Confidence Score verwendet
   */
  getSuccessScore() {
    let score = 0;

    // Outcome-Score (0-50 Punkte)
    if (this.outcome === 'good') {
      score += 50;
    } else if (this.outcome === 'neutral') {
      score += 25;
    }
    // 'bad' = 0 Punkte

    // Würdest du es wieder so tun? (0-50 Punkte)
    if (this.wouldDecideAgain === true) {
      score += 50;
    } else if (this.wouldDecideAgain === false) {
      score += 0;
    } else {
      score += 25; // Neutral/Unsicher
    }

    return score; // 0-100
  }

  /**
   * Gibt einen menschenlesbaren Summary-Text
   */
  getSummary() {
    const outcomeText = {
      good: 'positiv verlaufen',
      neutral: 'neutral verlaufen',
      bad: 'negativ verlaufen'
    };

    const wouldDecideText = this.wouldDecideAgain
      ? 'würdest du wieder so entscheiden'
      : 'würdest du anders entscheiden';

    return `Die Entscheidung ist ${outcomeText[this.outcome] || 'noch offen'} und du ${wouldDecideText}.`;
  }

  /**
   * Generiert eine eindeutige ID
   */
  _generateId() {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Helper-Funktionen für Review-Management
 */

/**
 * Berechnet, wann ein Review fällig ist (7 Tage nach Entscheidung)
 */
export function calculateReviewDueDate(decisionDate) {
  const date = new Date(decisionDate);
  date.setDate(date.getDate() + 7); // 7 Tage später
  return date.toISOString();
}

/**
 * Prüft, ob ein Review überfällig ist
 */
export function isReviewOverdue(reviewDueDate) {
  if (!reviewDueDate) return false;
  return new Date() > new Date(reviewDueDate);
}

/**
 * Prüft, ob ein Review fällig ist (heute oder überfällig)
 */
export function isReviewDue(reviewDueDate) {
  if (!reviewDueDate) return false;
  const now = new Date();
  const due = new Date(reviewDueDate);

  // Fällig wenn innerhalb der nächsten 24 Stunden
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return due <= tomorrow;
}

/**
 * Findet alle fälligen Reviews in einer Liste von Entscheidungen
 */
export function findDueReviews(decisions) {
  if (!decisions) return [];

  return decisions.filter(decision => {
    // Hat noch kein Review
    if (decision.review) return false;

    // Hat ein Review-Datum
    if (!decision.reviewScheduledFor) return false;

    // Review ist fällig
    return isReviewDue(decision.reviewScheduledFor);
  });
}

/**
 * Gruppiert Reviews nach Outcome
 */
export function groupReviewsByOutcome(reviews) {
  const grouped = {
    good: [],
    neutral: [],
    bad: []
  };

  reviews.forEach(review => {
    if (review.outcome && grouped[review.outcome]) {
      grouped[review.outcome].push(review);
    }
  });

  return grouped;
}

/**
 * Berechnet durchschnittlichen Success Score aller Reviews
 */
export function calculateAverageSuccessScore(reviews) {
  if (!reviews || reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, review) => {
    const reviewObj = review instanceof DecisionReview
      ? review
      : new DecisionReview(review);
    return acc + reviewObj.getSuccessScore();
  }, 0);

  return Math.round(sum / reviews.length);
}
