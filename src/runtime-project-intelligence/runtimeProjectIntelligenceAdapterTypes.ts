export type RuntimeProjectRecommendationInputVersion =
  | "v1";

export type RuntimeProjectRecommendationProjectKind =
  | "general"
  | "pbl";

export type RuntimeProjectRecommendationReadiness =
  | "unfocused"
  | "ready";

export type RuntimeProjectRecommendationMetadataSource =
  | "repository-derived"
  | "pbl-manifest";

export type RuntimeProjectRecommendationInput = {
  adapterVersion:
    RuntimeProjectRecommendationInputVersion;

  projectId:
    string;

  projectTitle:
    string;

  projectKind:
    RuntimeProjectRecommendationProjectKind;

  metadataSource:
    RuntimeProjectRecommendationMetadataSource;

  readiness:
    RuntimeProjectRecommendationReadiness;

  currentFocus:
    string | null;

  projectSummary:
    string;

  difficulty:
    string | null;

  estimatedWeeks:
    number | null;

  learningGoal:
    string | null;
};