export type LocalReflectionSyncStatus =
  | "local-only"
  | "sync-pending"
  | "synced"
  | "sync-failed";

export type LocalReflectionRecord = {
  id: string;
  content: string;
  createdAt: string;
  savedAt: string;
  source: "landing-local";
  syncStatus: LocalReflectionSyncStatus;
};

export type LocalReflectionPersistenceSnapshot = {
  records: LocalReflectionRecord[];
  totalCount: number;
  pendingCount: number;
  latestSavedAt: string | null;
};