
export enum SegmentType {
  CONTENT = 'content',
  CONFLICT = 'conflict',
}

export interface MergeSegment {
  type: string; // "content" | "conflict"
  content?: string;
  optionA?: string;
  optionB?: string;
  reason?: string; // Reason for conflict
}

export interface MergeState {
  segments: MergeSegment[];
  decisions: Record<number, 'A' | 'B' | 'A+B' | 'B+A'>; // Index -> Choice
}
