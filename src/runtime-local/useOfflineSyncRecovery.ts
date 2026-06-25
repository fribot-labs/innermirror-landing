import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    RuntimeUxModeResult,
} from "../runtime-adapter/runtimeUxModeTypes";

import {
    getLocalReflectionSnapshot,
    markLocalReflectionSyncFailed,
    markLocalReflectionSynced,
    markLocalReflectionSyncing,
    readPendingLocalReflections,
} from "./localReflectionStore";

import {
    syncLocalReflectionToRuntime,
} from "./syncLocalReflectionToRuntime";

import type {
    OfflineSyncRecoveryState,
} from "./localReflectionSyncTypes";

export function useOfflineSyncRecovery(params: {
  runtimeUxMode: RuntimeUxModeResult;
  onLocalSnapshotChanged: () => void;
}) {
  const [state, setState] =
    useState<OfflineSyncRecoveryState>({
      isSyncing: false,
      lastSyncedAt: null,
      lastErrorMessage: null,
      results: [],
    });

  const hasAutoSyncedRef =
    useRef(false);

  const syncPendingReflections =
    useCallback(async () => {
      if (
        params.runtimeUxMode.mode !==
        "full-runtime"
      ) {
        return;
      }

      const pending =
        readPendingLocalReflections();

      if (pending.length === 0) {
        return;
      }

      setState((current) => ({
        ...current,
        isSyncing: true,
        lastErrorMessage: null,
        results: [],
      }));

      const results:
        OfflineSyncRecoveryState["results"] =
        [];

      for (const record of pending) {
        try {
          markLocalReflectionSyncing(
            record.id
          );

          params.onLocalSnapshotChanged();

          const syncResult =
            await syncLocalReflectionToRuntime(
              record
            );

          markLocalReflectionSynced(
            record.id
          );

          results.push({
            recordId:
              record.id,
            status:
              "synced",
            runtimeReflectionId:
              syncResult.runtimeReflectionId,
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unknown sync error";

          markLocalReflectionSyncFailed(
            record.id,
            message
          );

          results.push({
            recordId:
              record.id,
            status:
              "failed",
            errorMessage:
              message,
          });
        }

        params.onLocalSnapshotChanged();
      }

      const hasFailure =
        results.some(
          (result) =>
            result.status === "failed"
        );

      setState({
        isSyncing: false,
        lastSyncedAt:
          new Date().toISOString(),
        lastErrorMessage:
          hasFailure
            ? "Some local reflections failed to sync."
            : null,
        results,
      });

      params.onLocalSnapshotChanged();
    }, [
      params,
    ]);

  useEffect(() => {
    if (
      params.runtimeUxMode.mode ===
        "full-runtime" &&
      !hasAutoSyncedRef.current &&
      getLocalReflectionSnapshot().pendingCount >
        0
    ) {
      hasAutoSyncedRef.current = true;

      void syncPendingReflections();
    }

    if (
      params.runtimeUxMode.mode !==
      "full-runtime"
    ) {
      hasAutoSyncedRef.current = false;
    }
  }, [
    params.runtimeUxMode.mode,
    syncPendingReflections,
  ]);

  return {
    ...state,
    syncPendingReflections,
  };
}