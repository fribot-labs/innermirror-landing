import type {
    RuntimeProjectMetadata,
} from "../../project-metadata/runtimeProjectMetadataTypes";

type RepositoryMetadataPanelProps = {
  metadata:
    RuntimeProjectMetadata | null;
};

export function RepositoryMetadataPanel({
  metadata,
}: RepositoryMetadataPanelProps) {
  if (
    metadata === null
  ) {
    return null;
  }

  const sourceLabel =
    metadata.source ===
    "pbl-manifest"
      ? "PBL Manifest"
      : "Repository";

  const difficultyLabel =
    metadata.difficulty ??
    "Not specified";

  const durationLabel =
    metadata.estimatedWeeks !==
    null
      ? `${metadata.estimatedWeeks} weeks`
      : "Not specified";

  const learningGoal =
    metadata.learningGoal ??
    "No learning goal provided.";

  return (
    <section className="repository-metadata-panel">
      <div className="repository-metadata-header">
        <div>
          <div className="repository-metadata-eyebrow">
            Project
          </div>

          <h2>
            {metadata.title ??
              "Untitled project"}
          </h2>
        </div>

        <span
          className={`repository-metadata-source repository-metadata-source-${metadata.source}`}
        >
          {sourceLabel}
        </span>
      </div>

      <div className="repository-metadata-grid">
        <div className="repository-metadata-item">
          <span>
            Difficulty
          </span>

          <strong>
            {difficultyLabel}
          </strong>
        </div>

        <div className="repository-metadata-item">
          <span>
            Duration
          </span>

          <strong>
            {durationLabel}
          </strong>
        </div>
      </div>

      <div className="repository-metadata-goal">
        <span>
          Learning Goal
        </span>

        <p>
          {learningGoal}
        </p>
      </div>
    </section>
  );
}