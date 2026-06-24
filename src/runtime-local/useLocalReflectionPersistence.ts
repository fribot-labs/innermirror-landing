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

  const saveLocalReflection =
    useCallback(
      (content: string): LocalReflectionRecord => {
        const record =
          appendLocalReflection(
            content
          );

        setSnapshot(
          getLocalReflectionSnapshot()
        );

        return record;
      },
      []
    );

  const clearLocalReflectionMemory =
    useCallback(() => {
      clearLocalReflections();

      setSnapshot(
        getLocalReflectionSnapshot()
      );
    }, []);

  const refreshLocalReflectionMemory =
    useCallback(() => {
      setSnapshot(
        getLocalReflectionSnapshot()
      );
    }, []);

  return {
    snapshot,
    saveLocalReflection,
    clearLocalReflectionMemory,
    refreshLocalReflectionMemory,
  };
}