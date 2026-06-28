import type { PblProject } from "../../types/pblProject";
import {
    countPblPullRequests,
    countPblReflections,
    getCurrentPblMilestone,
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
            Start a project from a GitHub repository to connect Reflection,
            Pull Requests, and Runtime coaching.
          </p>
        </div>
      </section>
    );
  }

  const currentMilestone = getCurrentPblMilestone(project);
  const pullRequestCount = countPblPullRequests(project);
  const reflectionCount = countPblReflections(project);

  return (
    <section className="project-summary-panel">
      <div className="project-summary-panel-header">
        <span className="project-summary-panel-eyebrow">
          Active PBL Project
        </span>

        <h2>{project.name}</h2>

        <p>
          This project connects GitHub development activity, Reflection, and
          Runtime coaching.
        </p>
      </div>

      <div className="project-summary-panel-grid">
        <div className="project-summary-panel-card">
          <span>Repository</span>

          <strong>
            {project.repository.owner}/{project.repository.name}
          </strong>

          <small>
            Default branch: {project.repository.defaultBranch ?? "main"}
          </small>
        </div>

        <div className="project-summary-panel-card">
          <span>Current milestone</span>

          <strong>
            {currentMilestone?.title ?? "No milestone selected"}
          </strong>

          <small>
            Status: {currentMilestone?.status ?? "not-started"}
          </small>
        </div>

        <div className="project-summary-panel-card">
          <span>Completion</span>

          <strong>{project.completionRate}%</strong>

          <small>Project progress based on milestones</small>
        </div>

        <div className="project-summary-panel-card">
          <span>Pull Requests</span>

          <strong>{pullRequestCount}</strong>

          <small>Linked PR records</small>
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