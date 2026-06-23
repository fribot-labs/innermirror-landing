export type RuntimeStreamingMergeStage =
  | "idle"
  | "recorded"
  | "fast-result"
  | "memory-query"
  | "continuity-merged"
  | "completed"
  | "failed";

export type RuntimeStreamingMergeEvent = {
  stage: RuntimeStreamingMergeStage;
  title: string;
  message: string;
  createdAt: string;
};

export type RuntimeMemoryTimelineItem = {
  id: string;
  content: string;
  summaryText: string;
  source: string;
  createdAt: string;
  persistedAt: string;
  continuityStatus: string;
  continuityStrength: number;
  sequenceIndex: number;
  dayKey: string;
  timeLabel: string;
  continuityLabel: string;
};

export type RuntimeMemoryTimelineResponse = {
  ok: boolean;
  result?: {
    userId: string;
    items: RuntimeMemoryTimelineItem[];
    totalCount: number;
    latestCreatedAt: string | null;
    firstCreatedAt: string | null;
    generatedAt: string;
  };
  error?: {
    code?: string;
    message?: string;
  };
};