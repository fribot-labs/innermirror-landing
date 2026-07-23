import type {
    RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

/* ------------------------------------------------------------------ */
/* Candidate Priority */
/* ------------------------------------------------------------------ */

/**
 * Recommendation의 우선순위 계층입니다.
 *
 * blocking:
 * Runtime이 즉시 사용자에게 알려야 하는 Recommendation
 *
 * normal:
 * Stability 정책을 적용할 Recommendation
 */
export type RuntimeRecommendationPriorityClass =
  | "blocking"
  | "normal";

/* ------------------------------------------------------------------ */
/* Stability Candidate */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Resolver가 Stability Layer에 전달하는 Candidate입니다.
 *
 * PR-046B에서는 base score만 사용합니다.
 *
 * Adaptive Score는 PR-046C에서 추가됩니다.
 */
export type RuntimeRecommendationStabilityCandidate = {
  /**
   * Runtime Recommendation
   */
  action:
    RuntimeNextAction;

  /**
   * Recommendation Resolver가 계산한
   * 현재 Recommendation 점수
   */
  score:
    number;

  /**
   * blocking Recommendation 여부
   */
  priorityClass:
    RuntimeRecommendationPriorityClass;

  /**
   * 동일 Runtime Context를 식별하기 위한 Revision입니다.
   *
   * React rerender만으로 observationCount가 증가하지 않도록
   * 사용됩니다.
   */
  contextRevision:
    string;
};

/* ------------------------------------------------------------------ */
/* Stable Recommendation */
/* ------------------------------------------------------------------ */

/**
 * 현재 Runtime이 사용자에게 보여주고 있는
 * Stable Recommendation입니다.
 */
export type RuntimeStableRecommendationSnapshot = {
  key:
    string;

  action:
    RuntimeNextAction;

  score:
    number;

  /**
   * Stable Recommendation으로 최초 채택된 시각
   */
  acceptedAt:
    string;

  /**
   * 동일 Recommendation이 다시 확인된 가장 최근 시각
   */
  lastConfirmedAt:
    string;

  /**
   * Stable Recommendation으로
   * 몇 번 확인되었는지
   */
  observationCount:
    number;
};

/* ------------------------------------------------------------------ */
/* Challenger */
/* ------------------------------------------------------------------ */

/**
 * Stable Recommendation을 대체하려는
 * Candidate입니다.
 *
 * 아직 사용자에게 표시되지 않습니다.
 */
export type RuntimeRecommendationChallengerState = {
  key:
    string;

  action:
    RuntimeNextAction;

  score:
    number;

  /**
   * Challenger가 최초 등장한 시각
   */
  firstObservedAt:
    string;

  /**
   * Challenger가 마지막으로 확인된 시각
   */
  lastObservedAt:
    string;

  /**
   * 동일 Challenger가
   * 몇 번 연속 확인되었는지
   */
  observationCount:
    number;

  /**
   * Stable Recommendation과의
   * 점수 차이
   */
  scoreMargin:
    number;
};

/* ------------------------------------------------------------------ */
/* Stability State */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Stability 전체 상태입니다.
 */
export type RuntimeRecommendationStabilityState = {
  /**
   * 현재 Runtime이 표시 중인 Recommendation
   */
  stable:
    RuntimeStableRecommendationSnapshot | null;

  /**
   * Stable Recommendation을
   * 대체하려는 Challenger
   */
  challenger:
    RuntimeRecommendationChallengerState | null;

  /**
   * 마지막 Stability 계산 시각
   */
  lastEvaluatedAt:
    string | null;

  /**
   * Stable Recommendation이
   * 실제로 변경된 횟수
   */
  transitionCount:
    number;
};

/* ------------------------------------------------------------------ */
/* Stability Decision */
/* ------------------------------------------------------------------ */

/**
 * Stability Engine이 어떤 결정을 내렸는지를
 * Diagnostics에서 설명하기 위한 값입니다.
 */
export type RuntimeRecommendationStabilityDecision =
  | "initialize"
  | "confirm-stable"
  | "keep-stable"
  | "observe-challenger"
  | "promote-challenger"
  | "replace-by-blocking"
  | "clear";

/* ------------------------------------------------------------------ */
/* Diagnostics */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Stability 내부 상태입니다.
 *
 * 사용자 UI에는 노출하지 않고
 * Runtime Diagnostics에서만 사용합니다.
 */
export type RuntimeRecommendationStabilityDiagnostics = {
  stableKey:
    string | null;

  challengerKey:
    string | null;

  stableScore:
    number | null;

  challengerScore:
    number | null;

  scoreMargin:
    number | null;

  challengerObservationCount:
    number;

  challengerAgeMilliseconds:
    number | null;

  thresholdSatisfied:
    boolean;

  dwellSatisfied:
    boolean;

  marginSatisfied:
    boolean;

  blockingBypass:
    boolean;
};

/* ------------------------------------------------------------------ */
/* Stability Result */
/* ------------------------------------------------------------------ */

/**
 * Stability Resolver의 최종 결과입니다.
 */
export type RuntimeRecommendationStabilityResult = {
  /**
   * 새 Stability 상태
   */
  state:
    RuntimeRecommendationStabilityState;

  /**
   * 사용자에게 실제 표시할 Recommendation
   */
  stableAction:
    RuntimeNextAction | null;

  /**
   * Stability 판단 결과
   */
  decision:
    RuntimeRecommendationStabilityDecision;

  /**
   * 사람이 읽을 수 있는 Diagnostics 설명
   */
  reason:
    string;

  diagnostics:
    RuntimeRecommendationStabilityDiagnostics;
};

/* ------------------------------------------------------------------ */
/* Stability Resolver Input */
/* ------------------------------------------------------------------ */

/**
 * 순수 Stability Resolver 입력입니다.
 */
export type StabilizeRuntimeRecommendationInput = {
  previousState:
    RuntimeRecommendationStabilityState;

  /**
   * 새 Candidate
   *
   * null이면
   * Recommendation이 계산되지 않은 상태입니다.
   */
  candidate:
    RuntimeRecommendationStabilityCandidate | null;

  /**
   * 프로젝트 종료 등으로
   * Stability State를 제거해야 하는 경우
   */
  shouldClear:
    boolean;

  evaluatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Observation */
/* ------------------------------------------------------------------ */

/**
 * Hook 내부에서 React rerender를
 * 중복 관찰하지 않기 위한 Key입니다.
 */
export type RuntimeRecommendationObservationKey =
  string;

/* ------------------------------------------------------------------ */
/* Reducer */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationStabilityAction =
  | {
      type:
        "observe";

      candidate:
        RuntimeRecommendationStabilityCandidate | null;

      evaluatedAt:
        string;
    }
  | {
      type:
        "clear";
    }
  | {
      type:
        "reset";

      candidate:
        RuntimeRecommendationStabilityCandidate | null;

      evaluatedAt:
        string;
    };