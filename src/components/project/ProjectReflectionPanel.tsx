import type { GitHubRepositorySummary } from "../../types/githubLearningEntry";
import type { PblProject } from "../../types/pblProject";

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

  const canSaveThought =
    hasActiveProject &&
    hasReflection &&
    !isAnyReflectionActionRunning;

  const canRunCombinedAnalysis =
    hasActiveProject &&
    hasSelectedRepository &&
    hasReflection &&
    !isAnyReflectionActionRunning;

  return (
    <section
      className="project-reflection-panel"
      aria-busy={isAnyReflectionActionRunning}
    >
      <div className="project-reflection-panel-header">
        <span className="project-reflection-panel-eyebrow">
          Project Reflection
        </span>

        <h2>Add a thought about this project</h2>

        <p>
          Record an unfinished thought, decision, question,
          or concern about your current project.
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
          Reflection is optional for project setup, but required
          when saving a thought or analyzing thought together
          with GitHub activity.
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

      <div className="project-reflection-panel-actions">
        <button
          type="button"
          className="project-reflection-button"
          onClick={onSaveThought}
          disabled={!canSaveThought}
        >
          {isSavingThought
            ? "Saving Thought..."
            : "Save Thought"}
        </button>

        <button
          type="button"
          className="project-reflection-button project-reflection-button-primary"
          onClick={onThoughtAndProjectAnalyze}
          disabled={!canRunCombinedAnalysis}
        >
          {isCombinedAnalyzing
            ? "Analyzing Thought + Project..."
            : "Thought + Project Analyze"}
        </button>
      </div>

      {!hasActiveProject ? (
        <small className="project-reflection-panel-status">
          Start the project before saving or analyzing a Reflection.
        </small>
      ) : !hasReflection ? (
        <small className="project-reflection-panel-status">
          Add a Reflection to activate these actions.
        </small>
      ) : !hasSelectedRepository ? (
        <small className="project-reflection-panel-status">
          Select a repository before running Thought + Project Analyze.
        </small>
      ) : (
        <div className="project-reflection-panel-action-help">
          <p>
            <strong>Save Thought</strong>{" "}
            stores and analyzes your Reflection without fetching
            new GitHub activity.
          </p>

          <p>
            <strong>Thought + Project Analyze</strong>{" "}
            connects this Reflection with the latest GitHub activity.
          </p>
        </div>
      )}
    </section>
  );
}