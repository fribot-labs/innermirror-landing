import type { ProjectContinuityInsight } from "../../types/projectContinuity";

type ProjectContinuitySurfaceProps = {
  insight: ProjectContinuityInsight | null;
};

export function ProjectContinuitySurface({
  insight,
}: ProjectContinuitySurfaceProps) {
  if (insight === null) {
    return null;
  }

  return (
    <section className="project-continuity-surface">
      <div className="project-continuity-surface-header">
        <span>Project Continuity</span>

        <h2>{insight.title}</h2>

        <p>{insight.summary}</p>
      </div>

      <div className="project-continuity-surface-grid">
        <div>
          <span>Strength</span>
          <strong>{formatStrength(insight.strength)}</strong>
        </div>

        <div>
          <span>Project events</span>
          <strong>{insight.projectEventCount}</strong>
        </div>

        <div>
          <span>Combined events</span>
          <strong>{insight.combinedEventCount}</strong>
        </div>
      </div>

      {insight.dominantTags.length > 0 ? (
        <div className="project-continuity-tags">
          {insight.dominantTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      <div className="project-continuity-next-action">
        <span>Suggested next action</span>
        <p>{insight.suggestedNextAction}</p>
      </div>
    </section>
  );
}

function formatStrength(
  strength: ProjectContinuityInsight["strength"]
): string {
  if (strength === "strong") {
    return "Strong";
  }

  if (strength === "stable") {
    return "Stable";
  }

  if (strength === "forming") {
    return "Forming";
  }

  return "Starting";
}