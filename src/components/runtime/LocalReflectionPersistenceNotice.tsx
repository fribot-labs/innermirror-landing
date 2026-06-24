import type {
    LocalReflectionPersistenceSnapshot,
} from "../../runtime-local/localReflectionTypes";

type Props = {
  snapshot: LocalReflectionPersistenceSnapshot;
  isLocalOnlyMode: boolean;
};

export function LocalReflectionPersistenceNotice({
  snapshot,
  isLocalOnlyMode,
}: Props) {
  if (
    !isLocalOnlyMode &&
    snapshot.pendingCount === 0
  ) {
    return null;
  }

  return (
    <section className="local-reflection-persistence-notice">
      <strong>
        {isLocalOnlyMode
          ? "Reflection이 로컬에 저장됩니다."
          : "동기화 대기 중인 reflection이 있습니다."}
      </strong>

      <p>
        {snapshot.pendingCount > 0
          ? `${snapshot.pendingCount}개의 reflection이 runtime 복구 후 동기화될 수 있습니다.`
          : "Runtime을 사용할 수 없어도 입력한 생각은 브라우저에 보관됩니다."}
      </p>
    </section>
  );
}