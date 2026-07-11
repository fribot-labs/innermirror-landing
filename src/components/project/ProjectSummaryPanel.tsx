import type { PblProject } from "../../types/pblProject";
import {
  countPblReflections,
} from "../../types/pblProject";

type ProjectSummaryPanelProps = {
  project: PblProject | null;
};

export function ProjectSummaryPanel({
  project,
}: ProjectSummaryPanelProps) {
  if (project === null) {
    return (
      <section className="project-summary-panel project-summary-panel-empty">
        <div className="project-summary-panel-header">
          <span className="project-summary-panel-eyebrow">
            Project Summary
          </span>

          <h2>No active PBL project</h2>

          <p>
            Start a project from a GitHub repository to save your thinking,
            analyze project activity, and receive Runtime coaching.
          </p>
        </div>
      </section>
    );
  }

  const reflectionCount = countPblReflections(project);

  return (
    <section className="project-summary-panel">
      <div className="project-summary-panel-header">
        <span className="project-summary-panel-eyebrow">
          Current Project
        </span>

        <h2>{project.name}</h2>

        <p>
          {project.repository.owner}/{project.repository.name}
          {" · "}
          This project connects your thinking with Runtime coaching.
        </p>
      </div>

      <div className="project-summary-panel-grid">
        <div className="project-summary-panel-card">
          <span>Completion</span>

          <strong>{project.completionRate}%</strong>

          <small>Project progress based on milestones</small>
        </div>

        <div className="project-summary-panel-card">
          <span>Reflections</span>

          <strong>{reflectionCount}</strong>

          <small>Project-level Reflection records</small>
        </div>
      </div>
    </section>
  );
}