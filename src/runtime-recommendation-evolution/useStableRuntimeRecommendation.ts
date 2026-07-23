import {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
} from "react";

import type {
    RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

import {
    createRuntimeRecommendationStabilityKey,
} from "./createRuntimeRecommendationStabilityKey";

import {
    createEmptyRuntimeRecommendationStabilityState,
    stabilizeRuntimeRecommendation,
} from "./stabilizeRuntimeRecommendation";

import {
    DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY,
    normalizeRuntimeRecommendationStabilityPolicy,
} from "./runtimeRecommendationStabilityPolicy";

import type {
    RuntimeRecommendationStabilityPolicy,
} from "./runtimeRecommendationStabilityPolicy";

import type {
    RuntimeRecommendationChallengerState,
    RuntimeRecommendationObservationKey,
    RuntimeRecommendationStabilityCandidate,
    RuntimeRecommendationStabilityDecision,
    RuntimeRecommendationStabilityDiagnostics,
    RuntimeRecommendationStabilityResult,
    RuntimeRecommendationStabilityState,
    RuntimeStableRecommendationSnapshot,
} from "./runtimeRecommendationStabilityTypes";

/* ------------------------------------------------------------------ */
/* Public Input */
/* ------------------------------------------------------------------ */

export type UseStableRuntimeRecommendationParams = {
  /**
   * 현재 활성 프로젝트 ID입니다.
   *
   * null이면 Stability State를 모두 제거합니다.
   */
  projectId:
    string | null;

  /**
   * 현재 Recommendation Resolver가 선택한 Candidate입니다.
   *
   * 이 Candidate가 곧바로 사용자에게 표시되는 것은 아닙니다.
   * Stability Resolver의 검증을 통과한 Stable Recommendation만
   * 최종적으로 노출됩니다.
   */
  candidate:
    RuntimeRecommendationStabilityCandidate | null;

  /**
   * Stability 정책입니다.
   *
   * 생략하면 기본 정책을 사용합니다.
   */
  policy?:
    RuntimeRecommendationStabilityPolicy;
};

/* ------------------------------------------------------------------ */
/* Public Result */
/* ------------------------------------------------------------------ */

export type UseStableRuntimeRecommendationResult = {
  /**
   * 사용자에게 실제로 표시할 Runtime Recommendation입니다.
   */
  stableAction:
    RuntimeNextAction | null;

  /**
   * 현재 Stable Recommendation의 전체 Snapshot입니다.
   */
  stableRecommendation:
    RuntimeStableRecommendationSnapshot | null;

  /**
   * 현재 Stable Recommendation을 대체하려고 관찰 중인
   * Challenger입니다.
   *
   * Challenger는 아직 사용자에게 표시되지 않습니다.
   */
  challenger:
    RuntimeRecommendationChallengerState | null;

  /**
   * Stability Engine 전체 상태입니다.
   */
  stabilityState:
    RuntimeRecommendationStabilityState;

  /**
   * 마지막 Stability 판단 결과입니다.
   */
  decision:
    RuntimeRecommendationStabilityDecision | null;

  /**
   * 마지막 판단의 개발자용 설명입니다.
   */
  reason:
    string | null;

  /**
   * 내부 검증용 Diagnostics입니다.
   */
  diagnostics:
    RuntimeRecommendationStabilityDiagnostics | null;

  /**
   * 현재 프로젝트의 Stability State를 다시 초기화합니다.
   *
   * Candidate가 존재하면 해당 Candidate가 즉시 첫 Stable
   * Recommendation으로 초기화됩니다.
   */
  reset:
    () => void;

  /**
   * 현재 Stable Recommendation과 Challenger를 모두 제거합니다.
   *
   * 일반적인 프로젝트 전환은 Hook가 자동 처리하므로,
   * 명시적인 Runtime 초기화가 필요한 경우에만 사용합니다.
   */
  clear:
    () => void;
};

/* ------------------------------------------------------------------ */
/* Internal Machine State */
/* ------------------------------------------------------------------ */

type RuntimeRecommendationStabilityMachineState = {
  /**
   * 현재 Stability State가 속한 프로젝트입니다.
   */
  projectId:
    string | null;

  stabilityState:
    RuntimeRecommendationStabilityState;

  decision:
    RuntimeRecommendationStabilityDecision | null;

  reason:
    string | null;

  diagnostics:
    RuntimeRecommendationStabilityDiagnostics | null;

  /**
   * 마지막으로 처리한 Observation Key입니다.
   *
   * 동일 React rerender가 Challenger observationCount를
   * 반복 증가시키지 않도록 사용합니다.
   */
  lastObservationKey:
    RuntimeRecommendationObservationKey | null;
};

/* ------------------------------------------------------------------ */
/* Internal Reducer Actions */
/* ------------------------------------------------------------------ */

type RuntimeRecommendationStabilityMachineAction =
  | {
      type:
        "synchronize";

      projectId:
        string | null;

      candidate:
        RuntimeRecommendationStabilityCandidate | null;

      policy:
        RuntimeRecommendationStabilityPolicy;

      observationKey:
        RuntimeRecommendationObservationKey;

      evaluatedAt:
        string;
    }
  | {
      type:
        "reset";

      projectId:
        string | null;

      candidate:
        RuntimeRecommendationStabilityCandidate | null;

      policy:
        RuntimeRecommendationStabilityPolicy;

      observationKey:
        RuntimeRecommendationObservationKey;

      evaluatedAt:
        string;
    }
  | {
      type:
        "clear";

      evaluatedAt:
        string;
    };

/* ------------------------------------------------------------------ */
/* Initial State */
/* ------------------------------------------------------------------ */

function createInitialRuntimeRecommendationStabilityMachineState():
  RuntimeRecommendationStabilityMachineState {
  return {
    projectId:
      null,

    stabilityState:
      createEmptyRuntimeRecommendationStabilityState(),

    decision:
      null,

    reason:
      null,

    diagnostics:
      null,

    lastObservationKey:
      null,
  };
}

/* ------------------------------------------------------------------ */
/* Reducer */
/* ------------------------------------------------------------------ */

function runtimeRecommendationStabilityMachineReducer(
  state:
    RuntimeRecommendationStabilityMachineState,
  action:
    RuntimeRecommendationStabilityMachineAction
): RuntimeRecommendationStabilityMachineState {
  switch (action.type) {
    case "synchronize":
      return synchronizeStabilityMachine(
        state,
        action
      );

    case "reset":
      return resetStabilityMachine(
        action
      );

    case "clear":
      return clearStabilityMachine(
        state,
        action.evaluatedAt
      );
  }
}

/* ------------------------------------------------------------------ */
/* Synchronization */
/* ------------------------------------------------------------------ */

type SynchronizeStabilityMachineAction =
  Extract<
    RuntimeRecommendationStabilityMachineAction,
    {
      type:
        "synchronize";
    }
  >;

function synchronizeStabilityMachine(
  state:
    RuntimeRecommendationStabilityMachineState,
  action:
    SynchronizeStabilityMachineAction
): RuntimeRecommendationStabilityMachineState {
  /*
   * 활성 프로젝트가 없으면 모든 Stability State를 제거합니다.
   */
  if (
    action.projectId === null
  ) {
    if (
      state.projectId === null &&
      state.stabilityState.stable === null &&
      state.stabilityState.challenger === null
    ) {
      return state;
    }

    return createMachineStateFromResolverResult({
      projectId:
        null,

      observationKey:
        action.observationKey,

      result:
        stabilizeRuntimeRecommendation({
          previousState:
            state.stabilityState,

          candidate:
            null,

          shouldClear:
            true,

          evaluatedAt:
            action.evaluatedAt,

          policy:
            action.policy,
        }),
    });
  }

  const projectChanged =
    state.projectId !==
    action.projectId;

  /*
   * 프로젝트가 변경되면 이전 프로젝트의 Stable Recommendation과
   * Challenger를 절대로 이어받지 않습니다.
   */
  if (
    projectChanged
  ) {
    return createMachineStateFromResolverResult({
      projectId:
        action.projectId,

      observationKey:
        action.observationKey,

      result:
        stabilizeRuntimeRecommendation({
          previousState:
            createEmptyRuntimeRecommendationStabilityState(),

          candidate:
            action.candidate,

          shouldClear:
            false,

          evaluatedAt:
            action.evaluatedAt,

          policy:
            action.policy,
        }),
    });
  }

  /*
   * 같은 Runtime Context가 React rerender 때문에 다시 전달된 경우
   * Resolver를 실행하지 않습니다.
   */
  if (
    state.lastObservationKey ===
    action.observationKey
  ) {
    return state;
  }

  const result =
    stabilizeRuntimeRecommendation({
      previousState:
        state.stabilityState,

      candidate:
        action.candidate,

      shouldClear:
        false,

      evaluatedAt:
        action.evaluatedAt,

      policy:
        action.policy,
    });

  return createMachineStateFromResolverResult({
    projectId:
      action.projectId,

    observationKey:
      action.observationKey,

    result,
  });
}

/* ------------------------------------------------------------------ */
/* Reset */
/* ------------------------------------------------------------------ */

type ResetStabilityMachineAction =
  Extract<
    RuntimeRecommendationStabilityMachineAction,
    {
      type:
        "reset";
    }
  >;

function resetStabilityMachine(
  action:
    ResetStabilityMachineAction
): RuntimeRecommendationStabilityMachineState {
  if (
    action.projectId === null
  ) {
    return {
      projectId:
        null,

      stabilityState:
        createEmptyRuntimeRecommendationStabilityState(),

      decision:
        "clear",

      reason:
        "Recommendation Stability was reset without an active project.",

      diagnostics:
        null,

      lastObservationKey:
        action.observationKey,
    };
  }

  const result =
    stabilizeRuntimeRecommendation({
      previousState:
        createEmptyRuntimeRecommendationStabilityState(),

      candidate:
        action.candidate,

      shouldClear:
        false,

      evaluatedAt:
        action.evaluatedAt,

      policy:
        action.policy,
    });

  return createMachineStateFromResolverResult({
    projectId:
      action.projectId,

    observationKey:
      action.observationKey,

    result,
  });
}

/* ------------------------------------------------------------------ */
/* Clear */
/* ------------------------------------------------------------------ */

function clearStabilityMachine(
  state:
    RuntimeRecommendationStabilityMachineState,
  evaluatedAt:
    string
): RuntimeRecommendationStabilityMachineState {
  const result =
    stabilizeRuntimeRecommendation({
      previousState:
        state.stabilityState,

      candidate:
        null,

      shouldClear:
        true,

      evaluatedAt,

      policy:
        DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY,
    });

  return createMachineStateFromResolverResult({
    projectId:
      null,

    observationKey:
      createClearObservationKey(
        evaluatedAt
      ),

    result,
  });
}

/* ------------------------------------------------------------------ */
/* Machine State Builder */
/* ------------------------------------------------------------------ */

type CreateMachineStateFromResolverResultParams = {
  projectId:
    string | null;

  observationKey:
    RuntimeRecommendationObservationKey;

  result:
    RuntimeRecommendationStabilityResult;
};

function createMachineStateFromResolverResult({
  projectId,
  observationKey,
  result,
}: CreateMachineStateFromResolverResultParams):
  RuntimeRecommendationStabilityMachineState {
  return {
    projectId,

    stabilityState:
      result.state,

    decision:
      result.decision,

    reason:
      result.reason,

    diagnostics:
      result.diagnostics,

    lastObservationKey:
      observationKey,
  };
}

/* ------------------------------------------------------------------ */
/* Public Hook */
/* ------------------------------------------------------------------ */

export function useStableRuntimeRecommendation({
  projectId,
  candidate,
  policy =
    DEFAULT_RUNTIME_RECOMMENDATION_STABILITY_POLICY,
}: UseStableRuntimeRecommendationParams):
  UseStableRuntimeRecommendationResult {
  const normalizedProjectId =
    normalizeProjectId(
      projectId
    );

  /*
   * Policy 객체가 매 렌더마다 새로 만들어지더라도,
   * 실제 정책값이 같으면 동일한 normalizedPolicy가 유지됩니다.
   */
  const normalizedPolicy =
    useMemo(
      () =>
        normalizeRuntimeRecommendationStabilityPolicy(
          policy
        ),
      [
        policy.minimumScoreMargin,
        policy.requiredChallengerObservations,
        policy.minimumChallengerDwellMilliseconds,
        policy.minimumStableDwellMilliseconds,
        policy.blockingActionsBypassStability,
        policy.sameRecommendationRefreshesStableState,
        policy.preserveStableWhenCandidateMissing,
      ]
    );

  const normalizedCandidate =
    useMemo(
      () =>
        normalizeHookCandidate(
          candidate
        ),
      [
        candidate,
      ]
    );

  const policyKey =
    useMemo(
      () =>
        createPolicyKey(
          normalizedPolicy
        ),
      [
        normalizedPolicy,
      ]
    );

  const observationKey =
    useMemo(
      () =>
        createRuntimeRecommendationObservationKey({
          projectId:
            normalizedProjectId,

          candidate:
            normalizedCandidate,

          policyKey,
        }),
      [
        normalizedProjectId,
        normalizedCandidate,
        policyKey,
      ]
    );

  const [
    machineState,
    dispatch,
  ] =
    useReducer(
      runtimeRecommendationStabilityMachineReducer,
      undefined,
      createInitialRuntimeRecommendationStabilityMachineState
    );

  /*
   * 프로젝트, Candidate Context 또는 정책이 실제로 변경된 경우에만
   * Stability Resolver를 실행합니다.
   */
  useEffect(
    () => {
      dispatch({
        type:
          "synchronize",

        projectId:
          normalizedProjectId,

        candidate:
          normalizedCandidate,

        policy:
          normalizedPolicy,

        observationKey,

        evaluatedAt:
          new Date().toISOString(),
      });
    },
    [
      normalizedProjectId,
      normalizedCandidate,
      normalizedPolicy,
      observationKey,
    ]
  );

  const reset =
    useCallback(
      () => {
        dispatch({
          type:
            "reset",

          projectId:
            normalizedProjectId,

          candidate:
            normalizedCandidate,

          policy:
            normalizedPolicy,

          observationKey:
            createForcedObservationKey({
              prefix:
                "reset",

              baseObservationKey:
                observationKey,
            }),

          evaluatedAt:
            new Date().toISOString(),
        });
      },
      [
        normalizedProjectId,
        normalizedCandidate,
        normalizedPolicy,
        observationKey,
      ]
    );

  const clear =
    useCallback(
      () => {
        dispatch({
          type:
            "clear",

          evaluatedAt:
            new Date().toISOString(),
        });
      },
      []
    );

  return {
    stableAction:
      machineState
        .stabilityState
        .stable
        ?.action ??
      null,

    stableRecommendation:
      machineState
        .stabilityState
        .stable,

    challenger:
      machineState
        .stabilityState
        .challenger,

    stabilityState:
      machineState.stabilityState,

    decision:
      machineState.decision,

    reason:
      machineState.reason,

    diagnostics:
      machineState.diagnostics,

    reset,

    clear,
  };
}

/* ------------------------------------------------------------------ */
/* Observation Key */
/* ------------------------------------------------------------------ */

type CreateRuntimeRecommendationObservationKeyParams = {
  projectId:
    string | null;

  candidate:
    RuntimeRecommendationStabilityCandidate | null;

  policyKey:
    string;
};

/**
 * 동일 Runtime Context가 React rerender로 반복 전달되는 것을
 * 구분하기 위한 Observation Key를 생성합니다.
 *
 * 시간값은 포함하지 않습니다.
 * 시간을 포함하면 모든 렌더가 새로운 Observation으로 처리됩니다.
 */
function createRuntimeRecommendationObservationKey({
  projectId,
  candidate,
  policyKey,
}: CreateRuntimeRecommendationObservationKeyParams):
  RuntimeRecommendationObservationKey {
  if (
    projectId === null
  ) {
    return [
      "runtime-recommendation-observation-v1",
      "no-project",
      policyKey,
    ].join("::");
  }

  if (
    candidate === null
  ) {
    return [
      "runtime-recommendation-observation-v1",
      normalizeObservationPart(
        projectId
      ),
      "no-candidate",
      policyKey,
    ].join("::");
  }

  return [
    "runtime-recommendation-observation-v1",

    normalizeObservationPart(
      projectId
    ),

    createRuntimeRecommendationStabilityKey(
      candidate.action
    ),

    normalizeScoreForKey(
      candidate.score
    ),

    candidate.priorityClass,

    normalizeObservationPart(
      candidate.contextRevision
    ),

    policyKey,
  ].join("::");
}

/* ------------------------------------------------------------------ */
/* Policy Key */
/* ------------------------------------------------------------------ */

function createPolicyKey(
  policy:
    RuntimeRecommendationStabilityPolicy
): string {
  return [
    "stability-policy-v1",

    normalizeScoreForKey(
      policy.minimumScoreMargin
    ),

    String(
      policy.requiredChallengerObservations
    ),

    String(
      policy.minimumChallengerDwellMilliseconds
    ),

    String(
      policy.minimumStableDwellMilliseconds
    ),

    policy.blockingActionsBypassStability
      ? "blocking-bypass"
      : "blocking-stabilized",

    policy.sameRecommendationRefreshesStableState
      ? "refresh-stable"
      : "preserve-stable-snapshot",

    policy.preserveStableWhenCandidateMissing
      ? "preserve-on-missing"
      : "clear-on-missing",
  ].join("::");
}

/* ------------------------------------------------------------------ */
/* Forced Observation Key */
/* ------------------------------------------------------------------ */

type CreateForcedObservationKeyParams = {
  prefix:
    string;

  baseObservationKey:
    string;
};

/**
 * reset처럼 동일 Context에서도 강제로 Reducer가 실행되어야 하는
 * 명령을 위한 Key입니다.
 */
function createForcedObservationKey({
  prefix,
  baseObservationKey,
}: CreateForcedObservationKeyParams):
  RuntimeRecommendationObservationKey {
  return [
    normalizeObservationPart(
      prefix
    ),

    baseObservationKey,

    String(
      Date.now()
    ),
  ].join("::");
}

function createClearObservationKey(
  evaluatedAt:
    string
): RuntimeRecommendationObservationKey {
  return [
    "clear",
    normalizeObservationPart(
      evaluatedAt
    ),
  ].join("::");
}

/* ------------------------------------------------------------------ */
/* Candidate Normalization */
/* ------------------------------------------------------------------ */

function normalizeHookCandidate(
  candidate:
    RuntimeRecommendationStabilityCandidate | null
): RuntimeRecommendationStabilityCandidate | null {
  if (
    candidate === null
  ) {
    return null;
  }

  return {
    action:
      candidate.action,

    score:
      normalizeFiniteNumber(
        candidate.score
      ),

    priorityClass:
      candidate.priorityClass ===
      "blocking"
        ? "blocking"
        : "normal",

    contextRevision:
      normalizeContextRevision(
        candidate.contextRevision
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Project Normalization */
/* ------------------------------------------------------------------ */

function normalizeProjectId(
  value:
    string | null
): string | null {
  if (
    value === null
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

/* ------------------------------------------------------------------ */
/* Value Helpers */
/* ------------------------------------------------------------------ */

function normalizeContextRevision(
  value:
    string
): string {
  const normalized =
    value
      .trim()
      .replace(
        /\s+/g,
        " "
      );

  return normalized.length > 0
    ? normalized
    : "unknown-context";
}

function normalizeObservationPart(
  value:
    string
): string {
  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /:+/g,
        "-"
      );

  return normalized.length > 0
    ? normalized
    : "unknown";
}

function normalizeFiniteNumber(
  value:
    number
): number {
  return Number.isFinite(
    value
  )
    ? value
    : 0;
}

function normalizeScoreForKey(
  value:
    number
): string {
  return normalizeFiniteNumber(
    value
  ).toFixed(
    4
  );
}