import type {
    LocalReflectionPersistenceSnapshot,
} from "../../runtime-local/localReflectionTypes";

import type {
    OfflineSyncRecoveryState,
} from "../../runtime-local/localReflectionSyncTypes";

type Props = {
  snapshot: LocalReflectionPersistenceSnapshot;
  syncState: OfflineSyncRecoveryState;
  canSync: boolean;
  onSync: () => void;
};

export function OfflineSyncRecoveryPanel({
  snapshot,
  syncState,
  canSync,
  onSync,
}: Props) {
  if (
    snapshot.pendingCount === 0 &&
    snapshot.syncedCount === 0 &&
    syncState.results.length === 0
  ) {
    return null;
  }

  return (
    <section className="offline-sync-recovery-panel">
      <div className="offline-sync-recovery-header">
        <div>
          <div className="offline-sync-recovery-eyebrow">
            Offline Sync
          </div>

          <h2>
            로컬 reflection 동기화
          </h2>
        </div>

        {snapshot.pendingCount > 0 ? (
          <button
            type="button"
            onClick={onSync}
            disabled={
              !canSync ||
              syncState.isSyncing
            }
          >
            {syncState.isSyncing
              ? "동기화 중..."
              : "지금 동기화"}
          </button>
        ) : null}
      </div>

      <p>
        {createSyncMessage(
          snapshot,
          syncState,
          canSync
        )}
      </p>
    </section>
  );
}

function createSyncMessage(
  snapshot: LocalReflectionPersistenceSnapshot,
  syncState: OfflineSyncRecoveryState,
  canSync: boolean
): string {
  if (syncState.isSyncing) {
    return "로컬 reflection을 runtime memory로 동기화하고 있습니다.";
  }

  if (!canSync && snapshot.pendingCount > 0) {
    return `${snapshot.pendingCount}개의 reflection이 runtime 복구를 기다리고 있습니다.`;
  }

  if (snapshot.pendingCount > 0) {
    return `${snapshot.pendingCount}개의 reflection을 runtime memory로 동기화할 수 있습니다.`;
  }

  if (snapshot.syncedCount > 0) {
    return "로컬 reflection이 runtime memory와 동기화되었습니다.";
  }

  return "동기화할 local reflection이 없습니다.";
}