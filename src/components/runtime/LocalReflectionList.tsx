import type {
    LocalReflectionPersistenceSnapshot,
} from "../../runtime-local/localReflectionTypes";

type Props = {
  snapshot: LocalReflectionPersistenceSnapshot;
  onClear: () => void;
};

export function LocalReflectionList({
  snapshot,
  onClear,
}: Props) {
  if (snapshot.totalCount === 0) {
    return null;
  }

  return (
    <section className="local-reflection-list">
      <div className="local-reflection-list-header">
        <div>
          <div className="local-reflection-list-eyebrow">
            Local Reflection Memory
          </div>

          <h2>
            로컬에 보관된 생각
          </h2>
        </div>

        <button
          type="button"
          onClick={onClear}
        >
          모두 지우기
        </button>
      </div>

      <div className="local-reflection-list-items">
        {snapshot.records.slice(0, 5).map((record) => (
          <article
            key={record.id}
            className="local-reflection-list-item"
          >
            <strong>
              {record.content}
            </strong>

            <span>
              {createStatusText(
                record.syncStatus
              )}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function createStatusText(
  status: string
): string {
  if (status === "synced") {
    return "동기화 완료";
  }

  if (status === "sync-failed") {
    return "동기화 실패";
  }

  if (status === "sync-pending") {
    return "동기화 대기";
  }

  return "로컬 저장";
}