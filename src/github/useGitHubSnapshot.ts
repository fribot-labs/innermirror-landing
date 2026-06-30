import { useCallback, useState } from "react";
import {
  createEmptyGitHubSnapshotState,
  type GitHubSnapshotRepository,
  type GitHubSnapshotState,
} from "../types/githubSnapshot";
import { fetchGitHubSnapshot } from "./fetchGitHubSnapshot";

/**
 * Manual GitHub Snapshot Hook
 *
 * MVP rule:
 *
 * GitHub Snapshot is captured only when the learner explicitly presses:
 *
 * Reflect + GitHub Analyze
 *
 * This hook must not perform:
 *
 * - webhook handling
 * - scheduler execution
 * - polling
 * - background synchronization
 * - automatic fetch on mount
 */
export function useGitHubSnapshot() {
  const [snapshotState, setSnapshotState] =
    useState<GitHubSnapshotState>(createEmptyGitHubSnapshotState);

  const captureSnapshot = useCallback(
    async (repository: GitHubSnapshotRepository) => {
      setSnapshotState({
        status: "loading",
        snapshot: null,
        error: null,
      });

      try {
        const snapshot = await fetchGitHubSnapshot(repository);

        setSnapshotState({
          status: "ready",
          snapshot,
          error: null,
        });

        return snapshot;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to capture GitHub snapshot.";

        setSnapshotState({
          status: "error",
          snapshot: null,
          error: message,
        });

        return null;
      }
    },
    []
  );

  const resetSnapshot = useCallback(() => {
    setSnapshotState(createEmptyGitHubSnapshotState());
  }, []);

  return {
    snapshotState,
    captureSnapshot,
    resetSnapshot,
  };
}