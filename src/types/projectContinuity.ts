export type ProjectContinuityStrength =
  | "weak"
  | "forming"
  | "stable"
  | "strong";

export type ProjectContinuityInsight = {
  strength: ProjectContinuityStrength;
  title: string;
  summary: string;
  projectEventCount: number;
  combinedEventCount: number;
  recentRepositoryName?: string;
  dominantTags: string[];
  suggestedNextAction: string;
};