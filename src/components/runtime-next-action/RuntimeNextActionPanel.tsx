import type {
    RuntimeNextAction,
    RuntimeNextActionTarget,
} from "../../runtime-next-action/runtimeNextActionTypes";

type RuntimeNextActionPanelProps = {
  action: RuntimeNextAction;

  onNavigate?: (
    target: RuntimeNextActionTarget
  ) => void;
};

function getConfidenceLabel(
  confidence: RuntimeNextAction["confidence"]
): string {
  switch (confidence) {
    case "high":
      return "Clear signal";

    case "medium":
      return "Developing signal";

    case "low":
      return "Early signal";
  }
}

function getConfidenceLevelLabel(
  confidence: RuntimeNextAction["confidence"]
): string {
  switch (confidence) {
    case "high":
      return "High";

    case "medium":
      return "Medium";

    case "low":
      return "Low";
  }
}

function getNavigationLabel(
  target: RuntimeNextActionTarget
): string {
  switch (target) {
    case "reflection":
      return "Go to Reflection";

    case "combined-analysis":
      return "Go to Reflection + GitHub";

    case "github-analysis":
      return "Go to GitHub Analysis";

    case "current-focus":
      return "Go to Current Focus";

    case "project-timeline":
      return "Go to Project Timeline";

    case "runtime-details":
      return "Explore Runtime Details";

    default:
      return "Go to recommended action";
  }
}

export function RuntimeNextActionPanel({
  action,
  onNavigate,
}: RuntimeNextActionPanelProps) {
  const canNavigate =
    action.isActionable &&
    action.target !== null &&
    onNavigate !== undefined;

  return (
    <section
      className="runtime-next-action-panel"
      aria-labelledby="runtime-next-action-title"
    >
      <header className="runtime-next-action-header">
        <div>
          <p className="runtime-next-action-eyebrow">
            WHAT TO DO NEXT
          </p>

          <p className="runtime-next-action-kicker">
            Runtime recommends this next step
          </p>
        </div>

        <div className="runtime-next-action-confidence-group">
          <span className="runtime-next-action-confidence">
            {getConfidenceLabel(action.confidence)}
          </span>

          <span className="runtime-next-action-confidence-level">
            Runtime confidence:{" "}
            {getConfidenceLevelLabel(action.confidence)}
          </span>
        </div>
      </header>

      <h2
        id="runtime-next-action-title"
        className="runtime-next-action-title"
      >
        {action.title}
      </h2>

      <p className="runtime-next-action-description">
        {action.description}
      </p>

      <div className="runtime-next-action-reason">
        <p className="runtime-next-action-reason-label">
          WHY RUNTIME RECOMMENDS THIS
        </p>

        <p className="runtime-next-action-reason-text">
          {action.reason}
        </p>
      </div>

      {canNavigate ? (
        <button
          type="button"
          className="runtime-next-action-navigation"
          onClick={() => {
            if (
              action.target !== null &&
              onNavigate !== undefined
            ) {
              onNavigate(action.target);
            }
          }}
        >
          {getNavigationLabel(action.target)}
        </button>
      ) : null}

      <p className="runtime-next-action-source">
        Based on {action.sourceLabel}
      </p>
    </section>
  );
}