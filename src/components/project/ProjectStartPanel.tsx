import type { GitHubRepositorySummary } from "../../types/githubLearningEntry";
import type { PblProject } from "../../types/pblProject";

type ProjectStartPanelProps = {
  selectedRepository: GitHubRepositorySummary | null;
  project: PblProject | null;
  currentStep: string;

  onChangeCurrentStep: (value: string) => void;
  onApplyProjectFocus: () => void;
  onAnalyzeGitHubProject: () => void;

  isGitHubAnalyzing?: boolean;
  isActionLocked?: boolean;
};

export function ProjectStartPanel({
  selectedRepository,
  project,
  currentStep,
  onChangeCurrentStep,
  onApplyProjectFocus,
  onAnalyzeGitHubProject,
  isGitHubAnalyzing = false,
  isActionLocked = false,
}: ProjectStartPanelProps) {
  const hasRepository =
    selectedRepository !== null;

  const hasCurrentFocus =
    currentStep.trim().length > 0;

  const isAnyProjectActionRunning =
    isGitHubAnalyzing ||
    isActionLocked;

  const isSelectedRepositoryActiveProject =
    selectedRepository !== null &&
    project !== null &&
    project.repository.owner === selectedRepository.owner &&
    project.repository.name === selectedRepository.name;

  const canApplyProjectFocus =
    hasRepository &&
    hasCurrentFocus &&
    !isAnyProjectActionRunning;

  const canAnalyzeGitHubProject =
    isSelectedRepositoryActiveProject &&
    !isAnyProjectActionRunning;

  return (
    <section
      className="project-start-panel"
      aria-busy={isAnyProjectActionRunning}
    >
      <div className="project-start-panel-header">
        <span className="project-start-panel-eyebrow">
          Project Setup
        </span>

        <h2>Start a PBL coding project</h2>

        <p>
          Define the current focus, then analyze recent GitHub activity.
        </p>
      </div>

      {selectedRepository === null ? (
        <div className="project-start-panel-empty">
          <strong>Select a repository first</strong>

          <p>
            A project can be started after choosing the GitHub
            repository that will become the learning record.
          </p>
        </div>
      ) : (
        <div className="project-start-panel-card">
          <div className="project-start-panel-repository">
            <span>Selected repository</span>

            <strong>{selectedRepository.name}</strong>

            <small>
              {selectedRepository.owner}
              {" · "}
              {selectedRepository.defaultBranch ?? "main"}
            </small>
          </div>

          <label className="project-start-panel-field">
            <div className="project-start-panel-field-heading">
              <span>Current Focus</span>

              <small className="project-field-requirement">
                Required
              </small>
            </div>

            <small className="project-start-panel-help">
              Enter a keyword or short sentence.
            </small>

            <input
              type="text"
              value={currentStep}
              onChange={(event) =>
                onChangeCurrentStep(event.target.value)
              }
              placeholder="Examples: Runtime UI, Reflection memory, Simplify result screen"
              required
              aria-required="true"
              disabled={isAnyProjectActionRunning}
            />
          </label>

          <div className="project-start-panel-actions">
            <button
              className="project-start-panel-button"
              type="button"
              onClick={onApplyProjectFocus}
              disabled={!canApplyProjectFocus}
            >
              {project === null
                ? "Start Project"
                : "Update Project Focus"}
            </button>

            <button
              className="project-start-panel-button project-start-panel-button-secondary"
              type="button"
              onClick={onAnalyzeGitHubProject}
              disabled={!canAnalyzeGitHubProject}
            >
              {isGitHubAnalyzing
                ? "Analyzing GitHub..."
                : "Analyze GitHub Project"}
            </button>
          </div>

          {!hasCurrentFocus ? (
            <small className="project-start-panel-action-help">
              Describe your current focus first. Even a simple
              keyword is enough to help Runtime understand your
              project direction.
            </small>
          ) : !isSelectedRepositoryActiveProject ? (
            <small className="project-start-panel-action-help">
              Start this repository as a project before running
              GitHub analysis.
            </small>
          ) : (
            <small className="project-start-panel-action-help">
              GitHub activity only. No Reflection is saved.
            </small>
          )}
        </div>
      )}
    </section>
  );
}