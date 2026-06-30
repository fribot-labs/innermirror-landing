import type { GitHubRepositorySummary } from "../../types/githubLearningEntry";
import type { PblProject } from "../../types/pblProject";
import { getCurrentPblMilestone } from "../../types/pblProject";

type ProjectStartPanelProps = {
  selectedRepository: GitHubRepositorySummary | null;
  project: PblProject | null;
  currentStep: string;
  onChangeCurrentStep: (value: string) => void;
  onStartProject: () => void;
};

export function ProjectStartPanel({
  selectedRepository,
  project,
  currentStep,
  onChangeCurrentStep,
  onStartProject,
}: ProjectStartPanelProps) {
  const canStartProject =
    selectedRepository !== null && currentStep.trim().length > 0;

  const currentMilestone =
    project !== null ? getCurrentPblMilestone(project) : null;

  return (
    <section className="project-start-panel">
      <div className="project-start-panel-header">
        <span className="project-start-panel-eyebrow">Project Start</span>

        <h2>Start a PBL coding project</h2>

        <p>
          Create a learning project from the selected GitHub repository. 
          You can save your thinking, analyze project activity, or use both together.
        </p>
      </div>

      {selectedRepository === null ? (
        <div className="project-start-panel-empty">
          <strong>Select a repository first</strong>

          <p>
            A project can be started after choosing the GitHub repository that
            will become the learning record.
          </p>
        </div>
      ) : (
        <div className="project-start-panel-card">
          <div className="project-start-panel-repository">
            <span>Selected repository</span>

            <strong>
              {selectedRepository.owner}/{selectedRepository.name}
            </strong>

            <small>
              Default branch: {selectedRepository.defaultBranch ?? "main"}
            </small>
          </div>

          <label className="project-start-panel-field">
            <span>Current learning step</span>

            <input
              type="text"
              value={currentStep}
              onChange={(event) => onChangeCurrentStep(event.target.value)}
              placeholder="Example: PR-006 Project Domain Model"
            />
          </label>

          <button
            className="project-start-panel-button"
            type="button"
            onClick={onStartProject}
            disabled={!canStartProject}
          >
            {project === null ? "Start Project" : "Restart Project"}
          </button>
        </div>
      )}

      {project !== null ? (
        <div className="project-start-panel-result">
          <span className="project-start-panel-result-label">
            Active project
          </span>

          <strong>{project.name}</strong>

          <p>
            Current milestone:{" "}
            <b>{currentMilestone?.title ?? "No milestone selected"}</b>
          </p>

          <p>
            Completion: <b>{project.completionRate}%</b>
          </p>

          <small>
            Project ID: <code>{project.id}</code>
          </small>
        </div>
      ) : null}
    </section>
  );
}