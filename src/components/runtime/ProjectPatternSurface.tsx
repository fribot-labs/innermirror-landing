import type { ProjectPatternInsight } from "../../types/projectPattern";

type ProjectPatternSurfaceProps = {
  insight: ProjectPatternInsight | null;
};

export function ProjectPatternSurface({
  insight,
}: ProjectPatternSurfaceProps) {
  if (insight === null) {
    return null;
  }

  return (
    <section className="project-pattern-surface">
      <div className="project-pattern-surface-header">
        <span>Project Pattern</span>

        <h2>{insight.title}</h2>

        <p>{insight.summary}</p>
      </div>

      <div className="project-pattern-surface-grid">
        <div>
          <span>Pattern</span>
          <strong>{formatPatternType(insight.type)}</strong>
        </div>

        <div>
          <span>Strength</span>
          <strong>{formatPatternStrength(insight.strength)}</strong>
        </div>

        <div>
          <span>Events reviewed</span>
          <strong>{insight.eventCount}</strong>
        </div>
      </div>

      {insight.dominantTags.length > 0 ? (
        <div className="project-pattern-tags">
          {insight.dominantTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      <div className="project-pattern-next-action">
        <span>Suggested next action</span>
        <p>{insight.suggestedAction}</p>
      </div>
    </section>
  );
}

function formatPatternType(
  type: ProjectPatternInsight["type"]
): string {
  if (type === "thought-connected") {
    return "Thought-connected";
  }

  if (type === "project-only") {
    return "Project-only";
  }

  if (type === "repository-stable") {
    return "Repository-stable";
  }

  return "Mixed";
}

function formatPatternStrength(
  strength: ProjectPatternInsight["strength"]
): string {
  if (strength === "clear") {
    return "Clear";
  }

  if (strength === "forming") {
    return "Forming";
  }

  return "Weak";
}