export class DecisionReview {
  constructor(data = {}) {
    this.id = data.id || this._generateId();
    this.decisionId = data.decisionId; 
    this.reviewDate = data.reviewDate || new Date().toISOString();

    this.outcome = data.outcome || null; 

    this.wouldDecideAgain = data.wouldDecideAgain || null; 

    this.notes = data.notes || '';

    this.learnedLesson = data.learnedLesson || '';

    this.emotionalState = data.emotionalState || null; 

    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  isValid() {
    return (
      this.decisionId &&
      this.outcome &&
      this.wouldDecideAgain !== null
    );
  }

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

  static fromJSON(data) {
    return new DecisionReview(data);
  }

  getSuccessScore() {
    let score = 0;

    if (this.outcome === 'good') {
      score += 50;
    } else if (this.outcome === 'neutral') {
      score += 25;
    }

    if (this.wouldDecideAgain === true) {
      score += 50;
    } else if (this.wouldDecideAgain === false) {
      score += 0;
    } else {
      score += 25; 
    }

    return score; 
  }

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

  _generateId() {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export function calculateReviewDueDate(decisionDate) {
  const date = new Date(decisionDate);
  date.setDate(date.getDate() + 7); 
  return date.toISOString();
}

export function isReviewOverdue(reviewDueDate) {
  if (!reviewDueDate) return false;
  return new Date() > new Date(reviewDueDate);
}

export function isReviewDue(reviewDueDate) {
  if (!reviewDueDate) return false;
  const now = new Date();
  const due = new Date(reviewDueDate);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return due <= tomorrow;
}

export function findDueReviews(decisions) {
  if (!decisions) return [];

  return decisions.filter(decision => {
    
    if (decision.review) return false;

    if (!decision.reviewScheduledFor) return false;

    return isReviewDue(decision.reviewScheduledFor);
  });
}

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
