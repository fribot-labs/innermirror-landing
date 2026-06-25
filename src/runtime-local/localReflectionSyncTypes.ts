export type LocalReflectionSyncResult = {
  recordId: string;
  status: "synced" | "failed";
  runtimeReflectionId?: string;
  errorMessage?: string;
};

export type OfflineSyncRecoveryState = {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  lastErrorMessage: string | null;
  results: LocalReflectionSyncResult[];
};