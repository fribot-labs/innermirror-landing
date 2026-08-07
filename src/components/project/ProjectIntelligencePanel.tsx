import type {
    RuntimeProjectIntelligence,
} from "../../project-intelligence/runtimeProjectIntelligenceTypes";

type ProjectIntelligencePanelProps = {
  intelligence:
    RuntimeProjectIntelligence | null;
};

export function ProjectIntelligencePanel({
  intelligence,
}: ProjectIntelligencePanelProps) {
  if (
    intelligence ===
    null
  ) {
    return null;
  }

  const projectTypeLabel =
    intelligence.projectKind ===
    "pbl"
      ? "PBL"
      : "General";

  const readinessLabel =
    intelligence.readiness ===
    "ready"
      ? "Ready"
      : "Unfocused";

  const currentFocusLabel =
    intelligence.currentFocus ??
    "Not defined";

  return (
    <section className="project-intelligence-panel">
      <div className="project-intelligence-header">
        <div>
          <div className="project-intelligence-eyebrow">
            Project Intelligence
          </div>

          <h2>
            {intelligence.title}
          </h2>
        </div>

        <span
          className={`project-intelligence-readiness project-intelligence-readiness-${intelligence.readiness}`}
        >
          {readinessLabel}
        </span>
      </div>

      <div className="project-intelligence-grid">
        <div className="project-intelligence-item">
          <span>
            Project Type
          </span>

          <strong>
            {projectTypeLabel}
          </strong>
        </div>

        <div className="project-intelligence-item">
          <span>
            Current Focus
          </span>

          <strong>
            {currentFocusLabel}
          </strong>
        </div>
      </div>

      <div className="project-intelligence-summary">
        <span>
          Summary
        </span>

        <p>
          {intelligence.summary}
        </p>
      </div>
    </section>
  );
}