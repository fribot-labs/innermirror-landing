import type {
    ReflectionRecord,
} from "../../lib/reflectionPersistence";

type ReflectionHistoryPanelProps = {
  reflections: ReflectionRecord[];
  isLoading: boolean;
  error: string | null;
};

export function ReflectionHistoryPanel({
  reflections,
  isLoading,
  error,
}: ReflectionHistoryPanelProps) {
  return (
    <section className="project-panel reflection-history-panel">
      <div className="project-panel-header">
        <span className="project-panel-eyebrow">
          REFLECTION HISTORY
        </span>

        <h2>Saved Reflections</h2>

        <p>
          Your recently saved Reflections from InnerMirror.
        </p>
      </div>

      {isLoading ? (
        <p>Loading saved Reflections...</p>
      ) : null}

      {error !== null ? (
        <p className="runtime-error">
          {error}
        </p>
      ) : null}

      {!isLoading &&
      error === null &&
      reflections.length === 0 ? (
        <p>
          No saved Reflections yet.
        </p>
      ) : null}

      {reflections.length > 0 ? (
        <ol className="reflection-history-list">
          {reflections.map((reflection) => (
            <li
              key={reflection.id}
              className="reflection-history-item"
            >
              <p>
                {reflection.content}
              </p>

              <small>
                {formatReflectionDate(
                  reflection.createdAt
                )}
              </small>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

function formatReflectionDate(
  value: string
): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}