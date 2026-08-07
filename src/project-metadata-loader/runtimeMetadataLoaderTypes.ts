export type RepositoryMetadataManifestVersion =
  | "v1";

export type RepositoryMetadataManifest = {
  schemaVersion:
    RepositoryMetadataManifestVersion;

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
};

export type RepositoryMetadataLoadResult =
  | {
      status: "found";
      manifest:
        RepositoryMetadataManifest;
    }
  | {
      status: "missing";
    }
  | {
      status: "invalid";
      message: string;
    };