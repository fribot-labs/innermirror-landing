export type RuntimeMemoryFlowState =
  | "forming"
  | "deepening"
  | "branching"
  | "returning"
  | "stable";

export type RuntimeMemoryTimelineItem = {
  id: string;
  summary: string;
  createdAt: string;
  timeLabel: string;

  flowState?: RuntimeMemoryFlowState;
  topicLabel?: string;
  repositoryLabel?: string;
};

export type RuntimeMemoryTimelineData = {
  visible: boolean;
  title: string;
  subtitle: string;
  items: RuntimeMemoryTimelineItem[];
};