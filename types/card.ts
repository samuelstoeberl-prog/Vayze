/**
 * Type Definitions für Card Management System
 */

export type CardStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type CardPriority = 'low' | 'medium' | 'high' | 'urgent';
export type CardType = 'task' | 'decision' | 'idea' | 'note';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  edited?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  uri: string;
  type: string;
  size: number;
  createdAt: Date;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  createdAt: Date;
}

export interface Card {
  id: string;
  title: string;
  description: string;

  // Classification
  category: string;
  status: CardStatus;
  priority: CardPriority;
  type: CardType;
  tags: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;

  // Content
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: Attachment[];
  links: Link[];

  // Additional
  isFavorite: boolean;
  isArchived: boolean;

  // Legacy (for migration from old "decisions")
  recommendation?: string;
  percentage?: number;
  journal?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  cardLimit?: number;
}

export interface FilterState {
  searchQuery: string;
  categories: string[];
  statuses: CardStatus[];
  priorities: CardPriority[];
  types: CardType[];
  tags: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  showArchived: boolean;
  showFavorites: boolean;
}

export interface SortOption {
  field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  direction: 'asc' | 'desc';
}

export interface HistoryEntry {
  timestamp: Date;
  action: 'create' | 'update' | 'delete' | 'move';
  cardId: string;
  previousState?: Partial<Card>;
  newState?: Partial<Card>;
}
