export type LocalReflectionSyncStatus =
  | "local-only"
  | "sync-pending"
  | "syncing"
  | "synced"
  | "sync-failed";

export type LocalReflectionRecord = {
  id: string;
  content: string;
  createdAt: string;
  savedAt: string;
  source: "landing-local";
  syncStatus: LocalReflectionSyncStatus;
  syncAttemptedAt?: string;
  syncedAt?: string;
  syncErrorMessage?: string;
};

export type LocalReflectionPersistenceSnapshot = {
  records: LocalReflectionRecord[];
  totalCount: number;
  pendingCount: number;
  syncingCount: number;
  syncedCount: number;
  failedCount: number;
  latestSavedAt: string | null;
};