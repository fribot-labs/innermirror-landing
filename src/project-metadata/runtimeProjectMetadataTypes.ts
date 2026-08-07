export type RuntimeProjectMetadataVersion =
  | "v1";

export type RuntimeProjectMetadataSource =
  | "repository-derived"
  | "pbl-manifest";

export type RuntimeProjectMetadata = {
  metadataVersion:
    RuntimeProjectMetadataVersion;

  projectId:
    string;

  templateId:
    string | null;

  courseId:
    string | null;

  title:
    string | null;

  difficulty:
    string | null;

  estimatedWeeks:
    number | null;

  learningGoal:
    string | null;

  source:
    RuntimeProjectMetadataSource;

  discoveredAt:
    string;

  updatedAt:
    string;
};