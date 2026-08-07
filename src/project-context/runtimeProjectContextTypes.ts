export type RuntimeProjectContextVersion =
  | "v1";

export type RuntimeProjectLearningMode =
  | "general-project"
  | "project-based-learning";

export type RuntimeProjectLearningStage =
  | "not-defined"
  | "starting"
  | "exploring"
  | "building"
  | "reviewing"
  | "completed";

export type RuntimeProjectContextSource =
  | "repository-derived"
  | "pbl-metadata";

export type RuntimeProjectContext = {
  contextVersion:
    RuntimeProjectContextVersion;

  projectId:
    string;

  kind:
    "general" | "pbl";

  learningMode:
    RuntimeProjectLearningMode;

  learningStage:
    RuntimeProjectLearningStage;

  goal:
    string | null;

  currentMilestone:
    string | null;

  source:
    RuntimeProjectContextSource;

  createdAt:
    string;

  updatedAt:
    string;
};