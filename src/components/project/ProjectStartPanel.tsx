import type {
  ActionAvailability,
  GuidedActionPresentation,
} from "../../project-actions/projectActionGuidanceTypes";

import type {
  GitHubRepositorySummary,
} from "../../types/githubLearningEntry";

import type {
  PblProject,
} from "../../types/pblProject";

type ProjectStartPanelProps = {
  selectedRepository: GitHubRepositorySummary | null;
  project: PblProject | null;
  currentStep: string;

  onChangeCurrentStep: (value: string) => void;
  onApplyProjectFocus: () => void;
  onAnalyzeGitHubProject: () => void;

  isProjectSubmitting?: boolean;
  isGitHubAnalyzing?: boolean;
  isActionLocked?: boolean;

  startAction: GuidedActionPresentation;
  analyzeAction: GuidedActionPresentation;
};

export function ProjectStartPanel({
  selectedRepository,
  project,
  currentStep,
  onChangeCurrentStep,
  onApplyProjectFocus,
  onAnalyzeGitHubProject,
  isProjectSubmitting = false,
  isGitHubAnalyzing = false,
  isActionLocked = false,
  startAction,
  analyzeAction,
}: ProjectStartPanelProps) {
  const isAnyProjectActionRunning =
    isProjectSubmitting ||
    isGitHubAnalyzing ||
    isActionLocked;

  const isStartActionDisabled =
    startAction.availability === "disabled" ||
    isAnyProjectActionRunning;

  const isAnalyzeActionDisabled =
    analyzeAction.availability === "disabled" ||
    isAnyProjectActionRunning;

  const startActionLabel =
    project === null
      ? "Start Project"
      : "Update Project Focus";

  return (
    <section
      className="project-start-panel"
      aria-busy={isAnyProjectActionRunning}
    >
      <div className="project-start-panel-header">
        <span className="project-start-panel-eyebrow">
          PROJECT FOCUS
        </span>

        <h2>What are you working on today?</h2>

        <p>
          Tell InnerMirror what you are currently
          trying to understand, change, or build.
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
            <div
              className={[
                "project-guided-action",
                `project-guided-action-${startAction.availability}`,
              ].join(" ")}
            >
              <ActionAvailabilityLabel
                availability={startAction.availability}
              />

              <button
                className={createActionButtonClassName(
                  startAction.availability
                )}
                type="button"
                onClick={onApplyProjectFocus}
                disabled={isStartActionDisabled}
                aria-describedby="project-start-action-reason"
              >
                {isProjectSubmitting
                  ? "Saving Project..."
                  : startActionLabel}
              </button>

              <small
                id="project-start-action-reason"
                className="project-action-reason"
              >
                {startAction.reason}
              </small>
            </div>

            <div
              className={[
                "project-guided-action",
                `project-guided-action-${analyzeAction.availability}`,
              ].join(" ")}
            >
              <ActionAvailabilityLabel
                availability={analyzeAction.availability}
              />

              <button
                className={createActionButtonClassName(
                  analyzeAction.availability
                )}
                type="button"
                onClick={onAnalyzeGitHubProject}
                disabled={isAnalyzeActionDisabled}
                aria-describedby="project-analyze-action-reason"
              >
                {isGitHubAnalyzing
                  ? "Analyzing GitHub..."
                  : "Analyze GitHub Project"}
              </button>

              <small
                id="project-analyze-action-reason"
                className="project-action-reason"
              >
                {analyzeAction.reason}
              </small>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function createActionButtonClassName(
  availability: ActionAvailability
): string {
  return [
    "project-start-panel-button",
    "project-action-button",
    `project-action-button-${availability}`,
  ].join(" ");
}

type ActionAvailabilityLabelProps = {
  availability: ActionAvailability;
};

function ActionAvailabilityLabel({
  availability,
}: ActionAvailabilityLabelProps) {
  if (availability === "recommended") {
    return (
      <span className="project-action-recommendation">
        <span aria-hidden="true">★</span>
        Recommended
      </span>
    );
  }

  if (availability === "available") {
    return (
      <span className="project-action-availability">
        Available
      </span>
    );
  }

  return null;
}