import type { ProjectContinuityInsight } from "../../types/projectContinuity";
import type { ProjectPatternInsight } from "../../types/projectPattern";

type ProjectFlowSummaryPanelProps = {
  continuity?: ProjectContinuityInsight;
  pattern?: ProjectPatternInsight;
};

export function ProjectFlowSummaryPanel({
  continuity,
  pattern,
}: ProjectFlowSummaryPanelProps) {
  if (!continuity && !pattern) {
    return null;
  }

  const dominantTags =
    continuity?.dominantTags.length
      ? continuity.dominantTags
      : pattern?.dominantTags ?? [];

  const visibleTags = dominantTags.slice(0, 2);
  const hiddenTags = dominantTags.slice(2);

  return (
    <section className="project-flow-summary-panel">
      <div className="project-flow-summary-header">
        <span>Project Flow</span>

        <h3>
          {continuity?.title ??
            pattern?.title ??
            "Project flow is forming"}
        </h3>

        <p>
          {continuity?.summary ??
            pattern?.summary ??
            "Runtime is beginning to understand how project activity and thinking are connected."}
        </p>
      </div>

      {continuity?.suggestedNextAction ||
      pattern?.suggestedAction ? (
        <p className="project-flow-summary-action">
          <strong>Suggested next action:</strong>{" "}
          {continuity?.suggestedNextAction ??
            pattern?.suggestedAction}
        </p>
      ) : null}

      <details className="project-flow-summary-details">
        <summary>View flow details</summary>

        <div className="project-flow-summary-grid">
          {continuity ? (
            <div>
              <span>Continuity</span>
              <strong>{continuity.strength}</strong>
            </div>
          ) : null}

          {pattern ? (
            <div>
              <span>Pattern</span>
              <strong>{pattern.type}</strong>
            </div>
          ) : null}

          {pattern ? (
            <div>
              <span>Events Reviewed</span>
              <strong>{pattern.eventCount}</strong>
            </div>
          ) : null}
        </div>

        {dominantTags.length > 0 ? (
          <div className="project-flow-summary-tags">
            {visibleTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </details>
    </section>
  );
}