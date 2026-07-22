import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type {
    RuntimeNextAction,
    RuntimeNextActionTarget,
} from "../runtime-next-action/runtimeNextActionTypes";

import {
    createRuntimeActionFingerprint,
} from "./createRuntimeActionFingerprint";

import {
    createRuntimeActionHistorySnapshot,
} from "./createRuntimeActionHistorySnapshot";

import {
    observeRuntimeAction,
    recordRuntimeActionNavigation,
} from "./runtimeActionHistoryReducer";

import {
    clearRuntimeActionHistory,
    clearRuntimeActionHistoryForProject,
    getActiveRuntimeActionHistoryEntry,
    getRuntimeActionHistoryEntriesForProject,
    getRuntimeActionTransitionsForProject,
    loadRuntimeActionHistory,
    saveRuntimeActionHistory,
} from "./runtimeActionHistoryStore";

import type {
    RuntimeActionHistoryEntry,
    RuntimeActionHistoryState,
    RuntimeActionObservationSnapshot,
    RuntimeActionTransition,
} from "./runtimeActionHistoryTypes";

export type UseRuntimeActionHistoryParams = {
  /**
   * 현재 활성 PBL 프로젝트의 ID입니다.
   *
   * 프로젝트가 아직 생성되지 않았다면 null을 전달합니다.
   */
  projectId:
    string | null;

  /**
   * 현재 Recommendation Engine이 선택한
   * Runtime Next Action입니다.
   *
   * 추천이 아직 존재하지 않으면 null입니다.
   */
  action:
    RuntimeNextAction | null;

  /**
   * Recommendation lifecycle 평가에 사용하는
   * 현재 프로젝트 상태 snapshot입니다.
   */
  observation:
    RuntimeActionObservationSnapshot;
};

export type UseRuntimeActionHistoryResult = {
  /**
   * 전체 프로젝트의 Runtime Action History 상태입니다.
   */
  history:
    RuntimeActionHistoryState;

  /**
   * 현재 프로젝트에 속한 History Entry입니다.
   *
   * 오래된 Entry에서 최신 Entry 순으로 반환됩니다.
   */
  projectEntries:
    RuntimeActionHistoryEntry[];

  /**
   * 현재 프로젝트에 속한 Recommendation Transition입니다.
   */
  projectTransitions:
    RuntimeActionTransition[];

  /**
   * 현재 활성 Recommendation History Entry입니다.
   */
  activeEntry:
    RuntimeActionHistoryEntry | null;

  /**
   * 현재 프로젝트에 History Entry가 존재하는지 나타냅니다.
   */
  hasHistory:
    boolean;

  /**
   * 사용자가 Recommendation navigation 버튼을 눌렀을 때
   * 호출합니다.
   *
   * 이 동작은 Recommendation을 completed로 처리하지 않습니다.
   */
  recordNavigation: (
    target:
      RuntimeNextActionTarget
  ) => void;

  /**
   * 모든 프로젝트의 Runtime Action History를 삭제합니다.
   */
  clearHistory: () => void;

  /**
   * 현재 프로젝트의 Runtime Action History만 삭제합니다.
   */
  clearProjectHistory: () => void;
};

export function useRuntimeActionHistory({
  projectId,
  action,
  observation,
}: UseRuntimeActionHistoryParams):
  UseRuntimeActionHistoryResult {
  /**
   * localStorage는 최초 mount 시 한 번만 읽습니다.
   */
  const [
    history,
    setHistory,
  ] = useState<
    RuntimeActionHistoryState
  >(
    () =>
      loadRuntimeActionHistory()
  );

  /**
   * 동일한 Recommendation과 동일한 프로젝트 상태가
   * React rerender로 반복 관찰되는 것을 차단합니다.
   */
  const lastObservationKeyRef =
    useRef<string | null>(
      null
    );

  /**
   * projectId와 RuntimeNextAction으로부터
   * 안정적인 Recommendation fingerprint를 생성합니다.
   */
  const actionFingerprint =
    useMemo(
      () => {
        if (
          projectId === null ||
          action === null
        ) {
          return null;
        }

        const normalizedProjectId =
          projectId.trim();

        if (
          normalizedProjectId.length ===
          0
        ) {
          return null;
        }

        return (
          createRuntimeActionFingerprint({
            projectId:
              normalizedProjectId,

            action,
          })
        );
      },
      [
        projectId,
        action,
      ]
    );

  /**
   * RuntimeNextAction 전체를 History에 저장하지 않고
   * 압축된 Snapshot으로 변환합니다.
   */
  const actionSnapshot =
    useMemo(
      () => {
        if (action === null) {
          return null;
        }

        return (
          createRuntimeActionHistorySnapshot(
            action
          )
        );
      },
      [
        action,
      ]
    );

  /**
   * 같은 Recommendation이라도 프로젝트의 실제 상태가
   * 달라졌다면 새로운 관찰로 처리해야 합니다.
   *
   * 따라서 fingerprint와 observation snapshot을 함께
   * 안정적인 observation key로 만듭니다.
   */
  const observationKey =
    useMemo(
      () => {
        if (
          projectId === null ||
          actionFingerprint === null ||
          actionSnapshot === null
        ) {
          return null;
        }

        return (
          createRuntimeActionObservationKey({
            projectId,
            fingerprint:
              actionFingerprint,
            observation,
          })
        );
      },
      [
        projectId,
        actionFingerprint,
        actionSnapshot,
        observation.reflectionCount,
        observation.githubSnapshotRevision,
        observation.currentFocus,
        observation.connectedEventCount,
        observation.runtimeAnalysisRevision,
      ]
    );

  /**
   * 현재 RuntimeNextAction과 프로젝트 상태를 관찰합니다.
   *
   * reducer는 다음을 판단합니다.
   *
   * - 동일 Recommendation 유지
   * - 새로운 Recommendation 생성
   * - 기존 Recommendation 완료
   * - 기존 Recommendation 대체
   * - Recommendation transition
   * - repeated / unresolved 상태
   */
  useEffect(
    () => {
      if (
        projectId === null ||
        actionFingerprint === null ||
        actionSnapshot === null ||
        observationKey === null
      ) {
        lastObservationKeyRef.current =
          null;

        return;
      }

      const normalizedProjectId =
        projectId.trim();

      if (
        normalizedProjectId.length ===
        0
      ) {
        lastObservationKeyRef.current =
          null;

        return;
      }

      /**
       * React rerender나 StrictMode로 같은 관찰이
       * 반복 실행되는 것을 막습니다.
       */
      if (
        lastObservationKeyRef.current ===
        observationKey
      ) {
        return;
      }

      lastObservationKeyRef.current =
        observationKey;

      const occurredAt =
        new Date().toISOString();

      setHistory(
        (currentHistory) =>
          observeRuntimeAction({
            state:
              currentHistory,

            projectId:
              normalizedProjectId,

            fingerprint:
              actionFingerprint,

            action:
              actionSnapshot,

            observation,

            observationKey,

            occurredAt,
          })
      );
    },
    [
      projectId,
      actionFingerprint,
      actionSnapshot,
      observationKey,
      observation,
    ]
  );

  /**
   * History 상태가 바뀔 때 localStorage에 저장합니다.
   *
   * Recommendation 계산 함수 내부에서 저장하지 않기 때문에
   * Recommendation Engine은 순수 함수로 유지됩니다.
   */
  useEffect(
    () => {
      saveRuntimeActionHistory(
        history
      );
    },
    [
      history,
    ]
  );

  /**
   * 사용자가 Recommendation navigation 버튼을 눌렀을 때
   * navigation event를 기록합니다.
   *
   * navigation click은 completed가 아닙니다.
   */
  const recordNavigation =
    useCallback(
      (
        target:
          RuntimeNextActionTarget
      ) => {
        if (
          projectId === null ||
          actionFingerprint === null
        ) {
          return;
        }

        const normalizedProjectId =
          projectId.trim();

        if (
          normalizedProjectId.length ===
          0
        ) {
          return;
        }

        const occurredAt =
          new Date().toISOString();

        setHistory(
          (currentHistory) =>
            recordRuntimeActionNavigation({
              state:
                currentHistory,

              projectId:
                normalizedProjectId,

              fingerprint:
                actionFingerprint,

              target,

              occurredAt,
            })
        );
      },
      [
        projectId,
        actionFingerprint,
      ]
    );

  /**
   * 전체 Runtime Action History를 삭제합니다.
   */
  const clearHistory =
    useCallback(
      () => {
        const emptyHistory =
          clearRuntimeActionHistory();

        lastObservationKeyRef.current =
          null;

        setHistory(
          emptyHistory
        );
      },
      []
    );

  /**
   * 현재 프로젝트의 Runtime Action History만 삭제합니다.
   */
  const clearProjectHistory =
    useCallback(
      () => {
        if (projectId === null) {
          return;
        }

        const normalizedProjectId =
          projectId.trim();

        if (
          normalizedProjectId.length ===
          0
        ) {
          return;
        }

        setHistory(
          (currentHistory) =>
            clearRuntimeActionHistoryForProject(
              currentHistory,
              normalizedProjectId
            )
        );

        lastObservationKeyRef.current =
          null;
      },
      [
        projectId,
      ]
    );

  /**
   * 현재 프로젝트의 Entry만 반환합니다.
   */
  const projectEntries =
    useMemo(
      () => {
        if (projectId === null) {
          return [];
        }

        return (
          getRuntimeActionHistoryEntriesForProject(
            history,
            projectId
          )
        );
      },
      [
        history,
        projectId,
      ]
    );

  /**
   * 현재 프로젝트의 Transition만 반환합니다.
   */
  const projectTransitions =
    useMemo(
      () => {
        if (projectId === null) {
          return [];
        }

        return (
          getRuntimeActionTransitionsForProject(
            history,
            projectId
          )
        );
      },
      [
        history,
        projectId,
      ]
    );

  /**
   * activeEntryId에 연결된 현재 Recommendation Entry입니다.
   */
  const activeEntry =
    useMemo(
      () =>
        getActiveRuntimeActionHistoryEntry(
          history
        ),
      [
        history,
      ]
    );

  return {
    history,

    projectEntries,

    projectTransitions,

    activeEntry,

    hasHistory:
      projectEntries.length > 0,

    recordNavigation,

    clearHistory,

    clearProjectHistory,
  };
}

type CreateRuntimeActionObservationKeyParams = {
  projectId:
    string;

  fingerprint:
    string;

  observation:
    RuntimeActionObservationSnapshot;
};

/**
 * Recommendation 관찰 중복을 방지하기 위한 안정적인 key입니다.
 *
 * 객체 reference를 사용하지 않고 실제 상태값만 사용합니다.
 */
function createRuntimeActionObservationKey({
  projectId,
  fingerprint,
  observation,
}: CreateRuntimeActionObservationKeyParams):
  string {
  return [
    normalizeObservationKeyPart(
      projectId
    ),

    normalizeObservationKeyPart(
      fingerprint
    ),

    String(
      normalizeCount(
        observation.reflectionCount
      )
    ),

    normalizeNullableObservationValue(
      observation.githubSnapshotRevision
    ),

    normalizeNullableObservationValue(
      observation.currentFocus
    ),

    String(
      normalizeCount(
        observation.connectedEventCount
      )
    ),

    normalizeNullableObservationValue(
      observation.runtimeAnalysisRevision
    ),
  ].join("::");
}

function normalizeCount(
  value:
    number
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value)
  );
}

function normalizeNullableObservationValue(
  value:
    string | null
): string {
  if (value === null) {
    return "none";
  }

  const normalized =
    normalizeObservationKeyPart(
      value
    );

  return normalized.length > 0
    ? normalized
    : "none";
}

function normalizeObservationKeyPart(
  value:
    string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    )
    .slice(
      0,
      240
    );
}