import type {
  PblProject,
} from "../../types/pblProject";

type ProjectSummaryPanelProps = {
  project: PblProject | null;
  reflectionCount: number;
};

export function ProjectSummaryPanel({
  project,
  reflectionCount,
}: ProjectSummaryPanelProps) {
  if (project === null) {
    return (
      <section className="project-summary-panel project-summary-panel-empty">
        <div className="project-summary-panel-header">
          <span className="project-summary-panel-eyebrow">
            Project Summary
          </span>

          <h2>
            No active PBL project
          </h2>

          <p>
            Select a repository and start a project to continue.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="project-summary-panel">
      <div className="project-summary-panel-header">
        <span className="project-summary-panel-eyebrow">
          Current Project
        </span>

        <h2>
          {project.name}
        </h2>

        <p>
          Active learning project connected to Runtime coaching.
        </p>
      </div>

      <div className="project-summary-panel-grid">
        <div className="project-summary-panel-card">
          <span>
            Completion
          </span>

          <strong>
            {project.completionRate}%
          </strong>

          <small>
            Project progress based on milestones
          </small>
        </div>

        <div className="project-summary-panel-card">
          <span>
            Reflections
          </span>

          <strong>
            {reflectionCount}
          </strong>

          <small>
            Project-level Reflection records
          </small>
        </div>
      </div>
    </section>
  );
}