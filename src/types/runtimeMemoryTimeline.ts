export type RuntimeMemoryTimelineItem = {
  id: string;
  summary: string;
  createdAt: string;
  timeLabel: string;

  continuityLabel?: string;
  themeLabel?: string;
  driftLabel?: string;
};

export type RuntimeMemoryTimelineData = {
  visible: boolean;
  title: string;
  subtitle: string;
  items: RuntimeMemoryTimelineItem[];
};