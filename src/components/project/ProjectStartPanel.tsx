import type {
    GitHubRepositorySummary,
    LandingProjectDraft,
} from "../../types/githubLearningEntry";

type ProjectStartPanelProps = {
  selectedRepository: GitHubRepositorySummary | null;
  projectDraft: LandingProjectDraft | null;
  currentStep: string;
  onChangeCurrentStep: (value: string) => void;
  onStartProject: () => void;
};

export function ProjectStartPanel({
  selectedRepository,
  projectDraft,
  currentStep,
  onChangeCurrentStep,
  onStartProject,
}: ProjectStartPanelProps) {
  const canStartProject =
    selectedRepository !== null && currentStep.trim().length > 0;

  return (
    <section className="project-start-panel">
      <div className="project-start-panel-header">
        <span className="project-start-panel-eyebrow">Project Start</span>

        <h2>Start a PBL coding project</h2>

        <p>
          Create a learning project from the selected GitHub repository. This
          project will connect Reflection, GitHub activity, and Runtime coaching.
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
              placeholder="Example: PR-005 GitHub Learning Entry"
            />
          </label>

          <button
            className="project-start-panel-button"
            type="button"
            onClick={onStartProject}
            disabled={!canStartProject}
          >
            Start Project
          </button>
        </div>
      )}

      {projectDraft !== null ? (
        <div className="project-start-panel-result">
          <span className="project-start-panel-result-label">
            Active project
          </span>

          <strong>{projectDraft.name}</strong>

          <p>
            Current step: <b>{projectDraft.currentStep}</b>
          </p>

          <small>
            Project ID: <code>{projectDraft.projectId}</code>
          </small>
        </div>
      ) : null}
    </section>
  );
}