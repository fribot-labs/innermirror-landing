import {
  useCallback,
  useState,
} from "react";

import {
  appendLocalReflection,
  clearLocalReflections,
  getLocalReflectionSnapshot,
} from "./localReflectionStore";

import type {
  LocalReflectionPersistenceSnapshot,
  LocalReflectionRecord,
} from "./localReflectionTypes";

export function useLocalReflectionPersistence() {
  const [snapshot, setSnapshot] =
    useState<LocalReflectionPersistenceSnapshot>(
      () =>
        getLocalReflectionSnapshot()
    );

  const refreshLocalReflectionMemory =
    useCallback(() => {
      setSnapshot(
        getLocalReflectionSnapshot()
      );
    }, []);

  const saveLocalReflection =
    useCallback(
      (content: string): LocalReflectionRecord => {
        const record =
          appendLocalReflection(
            content
          );

        refreshLocalReflectionMemory();

        return record;
      },
      [refreshLocalReflectionMemory]
    );

  const clearLocalReflectionMemory =
    useCallback(() => {
      clearLocalReflections();

      refreshLocalReflectionMemory();
    }, [refreshLocalReflectionMemory]);

  return {
    snapshot,
    saveLocalReflection,
    clearLocalReflectionMemory,
    refreshLocalReflectionMemory,
  };
}