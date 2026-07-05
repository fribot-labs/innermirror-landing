export type ProjectPatternType =
  | "project-only"
  | "thought-connected"
  | "repository-stable"
  | "mixed";

export type ProjectPatternStrength =
  | "weak"
  | "forming"
  | "clear";

export type ProjectPatternInsight = {
  type: ProjectPatternType;
  strength: ProjectPatternStrength;
  title: string;
  summary: string;
  eventCount: number;
  projectOnlyCount: number;
  combinedCount: number;
  dominantRepositoryName?: string;
  dominantTags: string[];
  suggestedAction: string;
};