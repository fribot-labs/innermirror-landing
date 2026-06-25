export type ServerRuntimeMemoryTimelineItem = {
  id: string;
  content: string;
  summaryText?: string;
  source: string;
  createdAt: string;
  persistedAt: string;
  continuityStatus?: string;
  continuityStrength?: number;
  sequenceIndex: number;
  dayKey: string;
  timeLabel: string;
  continuityLabel: string;
  importanceScore?: number;
  importanceLabel?: string;
  importanceReasons?: string[];
  importanceLabelText?: string;
};

export type ServerRuntimeMemoryTimelineResult = {
  userId: string;
  items: ServerRuntimeMemoryTimelineItem[];
  totalCount: number;
  latestCreatedAt: string | null;
  firstCreatedAt: string | null;
  generatedAt: string;
};

export type ServerRuntimeMemoryTimelineResponse = {
  ok: boolean;
  result?: ServerRuntimeMemoryTimelineResult;
  error?: {
    code?: string;
    message?: string;
  };
};