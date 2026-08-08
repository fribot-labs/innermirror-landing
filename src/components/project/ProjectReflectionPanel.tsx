import type {
  ActionAvailability,
  GuidedActionPresentation,
} from "../../project-actions/projectActionGuidanceTypes";

import {
  PROJECT_ACTION_DESCRIPTIONS,
  PROJECT_ACTION_LABELS,
} from "../../constants/projectActionLabels";

import type {
  GitHubRepositorySummary,
} from "../../types/githubLearningEntry";

import type {
  PblProject,
} from "../../types/pblProject";

type ProjectReflectionPanelProps = {
  project: PblProject | null;
  selectedRepository: GitHubRepositorySummary | null;
  content: string;

  onChangeContent: (value: string) => void;
  onSaveThought: () => void;
  onThoughtAndProjectAnalyze: () => void;

  isSavingThought?: boolean;
  isCombinedAnalyzing?: boolean;
  isActionLocked?: boolean;

  saveAction: GuidedActionPresentation;
  combinedAction: GuidedActionPresentation;
};

export function ProjectReflectionPanel({
  project,
  selectedRepository,
  content,
  onChangeContent,
  onSaveThought,
  onThoughtAndProjectAnalyze,
  isSavingThought = false,
  isCombinedAnalyzing = false,
  isActionLocked = false,
  saveAction,
  combinedAction,
}: ProjectReflectionPanelProps) {
  const hasReflection =
    content.trim().length > 0;

  const hasActiveProject =
    project !== null;

  const hasSelectedRepository =
    selectedRepository !== null;

  const isAnyReflectionActionRunning =
    isSavingThought ||
    isCombinedAnalyzing ||
    isActionLocked;

  const isReflectionOnlyDisabled =
    saveAction.availability === "disabled" ||
    isAnyReflectionActionRunning;

  const isReflectionWithGitHubDisabled =
    combinedAction.availability === "disabled" ||
    isAnyReflectionActionRunning;

  return (
    <section
      className="project-reflection-panel"
      aria-busy={isAnyReflectionActionRunning}
    >
      <div className="project-reflection-panel-header">
        <span className="project-reflection-panel-eyebrow">
          Project Reflection
        </span>

        <h2>Capture your thinking</h2>

        <p>
          Record your decisions, discoveries, questions, or uncertainty.
        </p>
      </div>

      <label className="project-reflection-panel-field">
        <div className="project-reflection-panel-field-heading">
          <span>Reflection</span>

          <small className="project-field-optional">
            Optional
          </small>
        </div>

        <small className="project-reflection-panel-help">
          Add context so Runtime can understand why the project changed.
        </small>

        <textarea
          value={content}
          onChange={(event) =>
            onChangeContent(event.target.value)
          }
          placeholder="Example: I am not sure whether the Runtime result screen is still too complex."
          disabled={isAnyReflectionActionRunning}
        />
      </label>

      {hasActiveProject && hasReflection ? (
        <p className="project-reflection-choice-help">
          Choose one analysis scope for this Reflection.
        </p>
      ) : null}

      <div className="project-reflection-panel-actions">
        <div
          className={createGuidedActionClassName(
            saveAction.availability
          )}
        >
          <ActionAvailabilityLabel
            availability={saveAction.availability}
          />

          <button
            type="button"
            className={createReflectionActionButtonClassName(
              saveAction.availability
            )}
            onClick={onSaveThought}
            disabled={isReflectionOnlyDisabled}
            aria-describedby="reflection-only-description"
          >
            {isSavingThought
              ? "Analyzing Reflection..."
              : PROJECT_ACTION_LABELS.reflectionOnly}
          </button>

          <div
            id="reflection-only-description"
            className="project-action-description"
          >
            <strong>
              {
                PROJECT_ACTION_DESCRIPTIONS
                  .reflectionOnly.primary
              }
            </strong>

            <span>
              {
                PROJECT_ACTION_DESCRIPTIONS
                  .reflectionOnly.secondary
              }
            </span>
          </div>

          {saveAction.availability === "disabled" ? (
            <small className="project-action-disabled-reason">
              {saveAction.reason}
            </small>
          ) : null}
        </div>

        <div
          className={createGuidedActionClassName(
            combinedAction.availability
          )}
        >
          <ActionAvailabilityLabel
            availability={combinedAction.availability}
          />

          <button
            type="button"
            className={createReflectionActionButtonClassName(
              combinedAction.availability
            )}
            onClick={onThoughtAndProjectAnalyze}
            disabled={isReflectionWithGitHubDisabled}
            aria-describedby="reflection-github-description"
          >
            {isCombinedAnalyzing
              ? "Analyzing Reflection + GitHub..."
              : PROJECT_ACTION_LABELS.reflectionWithGitHub}
          </button>

          <div
            id="reflection-github-description"
            className="project-action-description"
          >
            <strong>
              {
                PROJECT_ACTION_DESCRIPTIONS
                  .reflectionWithGitHub.primary
              }
            </strong>

            <span>
              {
                PROJECT_ACTION_DESCRIPTIONS
                  .reflectionWithGitHub.secondary
              }
            </span>
          </div>

          {combinedAction.availability === "disabled" ? (
            <small className="project-action-disabled-reason">
              {combinedAction.reason}
            </small>
          ) : null}
        </div>
      </div>

      {!hasActiveProject ? (
        <small className="project-reflection-panel-status">
          Start the project before analyzing a Reflection.
        </small>
      ) : !hasReflection ? (
        <small className="project-reflection-panel-status">
          Add a Reflection to choose an analysis scope.
        </small>
      ) : !hasSelectedRepository ? (
        <small className="project-reflection-panel-status">
          Select a repository before using Reflection + GitHub.
        </small>
      ) : null}
    </section>
  );
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

function createGuidedActionClassName(
  availability: ActionAvailability
): string {
  return [
    "project-guided-action",
    `project-guided-action-${availability}`,
  ].join(" ");
}

function createReflectionActionButtonClassName(
  availability: ActionAvailability
): string {
  return [
    "project-reflection-button",
    "project-action-button",
    `project-action-button-${availability}`,
  ].join(" ");
}