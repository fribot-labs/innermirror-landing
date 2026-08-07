export type RuntimeProjectIntelligenceVersion =
  | "v1";

export type RuntimeProjectIntelligenceSource =
  | "repository-derived"
  | "pbl-manifest";

export type RuntimeProjectIntelligenceProjectKind =
  | "general"
  | "pbl";

export type RuntimeProjectIntelligenceReadiness =
  | "unfocused"
  | "ready";

export type RuntimeProjectIntelligence = {
  intelligenceVersion:
    RuntimeProjectIntelligenceVersion;

  projectId:
    string;

  title:
    string;

  source:
    RuntimeProjectIntelligenceSource;

  projectKind:
    RuntimeProjectIntelligenceProjectKind;

  difficulty:
    string | null;

  estimatedWeeks:
    number | null;

  learningGoal:
    string | null;

  currentFocus:
    string | null;

  readiness:
    RuntimeProjectIntelligenceReadiness;

  summary:
    string;

  createdAt:
    string;
};