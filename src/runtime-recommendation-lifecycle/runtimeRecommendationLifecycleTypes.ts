import type {
    RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

/* ------------------------------------------------------------------ */
/* Lifecycle State */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation 하나가 시간에 따라 가질 수 있는 상태입니다.
 *
 * created
 * Recommendation이 생성되었지만 아직 현재 행동으로 활성화되지 않은 상태
 *
 * active
 * 사용자에게 현재 Recommendation으로 제시된 상태
 *
 * completed
 * 사용자가 Recommendation이 제안한 행동을 수행한 상태
 *
 * superseded
 * 완료되기 전에 더 최신 Recommendation으로 교체된 상태
 *
 * archived
 * 활성 Lifecycle에서 제외되었지만 History에는 보존되는 상태
 */
export type RuntimeRecommendationLifecycleState =
  | "created"
  | "active"
  | "completed"
  | "superseded"
  | "archived";

/**
 * Recommendation Lifecycle 상태가 변경된 직접적인 원인입니다.
 */
export type RuntimeRecommendationLifecycleTransitionReason =
  | "recommendation-created"
  | "recommendation-activated"
  | "recommended-action-completed"
  | "new-recommendation-selected"
  | "recommendation-manually-archived"
  | "runtime-session-restored"
  | "lifecycle-reconciled";

/**
 * Lifecycle 상태 변경을 발생시킨 주체입니다.
 */
export type RuntimeRecommendationLifecycleTransitionActor =
  | "runtime"
  | "user"
  | "system";

/* ------------------------------------------------------------------ */
/* Lifecycle Resolution */
/* ------------------------------------------------------------------ */

/**
 * active Recommendation이 현재 상태에서 벗어난 결과입니다.
 *
 * completed
 * 사용자가 추천 행동을 수행함
 *
 * superseded
 * 다른 Recommendation이 현재 Recommendation을 교체함
 *
 * archived
 * Recommendation이 별도 종료 판단 없이 보관됨
 */
export type RuntimeRecommendationLifecycleResolution =
  | "completed"
  | "superseded"
  | "archived";

/* ------------------------------------------------------------------ */
/* Lifecycle Transition */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Lifecycle의 단일 상태 변경 기록입니다.
 *
 * Transition은 과거 상태를 덮어쓰지 않고 append-only 방식으로
 * 누적되어 Recommendation의 시간적 변화를 보존합니다.
 */
export type RuntimeRecommendationLifecycleTransition = {
  /**
   * Transition 자체를 식별하는 안정적인 ID입니다.
   */
  id: string;

  /**
   * 상태가 변경된 Recommendation Lifecycle Record ID입니다.
   */
  lifecycleId: string;

  /**
   * 변경 전 상태입니다.
   *
   * 최초 created Transition에서는 이전 상태가 없으므로 null입니다.
   */
  fromState:
    RuntimeRecommendationLifecycleState | null;

  /**
   * 변경 후 상태입니다.
   */
  toState:
    RuntimeRecommendationLifecycleState;

  /**
   * 상태 변경이 발생한 이유입니다.
   */
  reason:
    RuntimeRecommendationLifecycleTransitionReason;

  /**
   * 상태 변경을 발생시킨 주체입니다.
   */
  actor:
    RuntimeRecommendationLifecycleTransitionActor;

  /**
   * 상태 변경 시각입니다.
   *
   * ISO 8601 문자열을 사용합니다.
   */
  occurredAt: string;

  /**
   * Transition을 설명하는 선택적 내부 메모입니다.
   */
  note: string | null;
};

/* ------------------------------------------------------------------ */
/* Lifecycle Record */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation 하나의 전체 생명주기를 나타냅니다.
 *
 * Record는 Recommendation이 생성된 순간부터 현재 상태까지의
 * 시간 정보와 Transition History를 함께 보존합니다.
 */
export type RuntimeRecommendationLifecycleRecord = {
  /**
   * Lifecycle Record 자체의 안정적인 ID입니다.
   */
  id: string;

  /**
   * Recommendation을 식별하는 ID입니다.
   *
   * MVP에서는 RuntimeNextAction과 연결하는 내부 식별자로 사용합니다.
   */
  recommendationId: string;

  /**
   * Lifecycle이 관리하는 Runtime Recommendation 원본입니다.
   *
   * Recommendation 생성 당시의 행동, 이유, Evidence를 보존합니다.
   */
  recommendation:
    RuntimeNextAction;

  /**
   * 현재 Lifecycle 상태입니다.
   */
  state:
    RuntimeRecommendationLifecycleState;

  /**
   * Recommendation이 Runtime에서 생성된 시각입니다.
   */
  createdAt: string;

  /**
   * Recommendation이 현재 Recommendation으로 활성화된 시각입니다.
   */
  activatedAt: string | null;

  /**
   * Recommendation이 completed 또는 superseded 상태가 된 시각입니다.
   */
  resolvedAt: string | null;

  /**
   * Recommendation이 archived 상태가 된 시각입니다.
   */
  archivedAt: string | null;

  /**
   * Recommendation이 active 상태에서 벗어난 최종 결과입니다.
   *
   * created 또는 active 상태에서는 null입니다.
   */
  resolution:
    RuntimeRecommendationLifecycleResolution | null;

  /**
   * 이 Recommendation 이전에 활성 상태였던 Lifecycle Record ID입니다.
   */
  previousLifecycleId: string | null;

  /**
   * 이 Recommendation을 교체하거나 뒤이어 활성화된
   * Lifecycle Record ID입니다.
   */
  nextLifecycleId: string | null;

  /**
   * Recommendation이 교체된 경우 새 Recommendation의 ID입니다.
   */
  supersededByRecommendationId: string | null;

  /**
   * Recommendation Lifecycle에서 발생한 상태 변경 기록입니다.
   */
  transitions:
    RuntimeRecommendationLifecycleTransition[];

  /**
   * Lifecycle Record의 마지막 변경 시각입니다.
   */
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* Lifecycle History */
/* ------------------------------------------------------------------ */

/**
 * 하나의 Runtime Recommendation 흐름에 속한 Lifecycle History입니다.
 *
 * MVP에서는 메모리 또는 프로젝트 단위 상태에서 관리하며,
 * 이후 영속 저장소로 이전할 수 있도록 독립된 계약으로 정의합니다.
 */
export type RuntimeRecommendationLifecycleHistory = {
  /**
   * History 자체의 안정적인 ID입니다.
   */
  id: string;

  /**
   * 현재 active 상태인 Lifecycle Record ID입니다.
   *
   * 활성 Recommendation이 없으면 null입니다.
   */
  activeLifecycleId: string | null;

  /**
   * 생성 순서대로 보존된 Recommendation Lifecycle Records입니다.
   */
  records:
    RuntimeRecommendationLifecycleRecord[];

  /**
   * History가 최초로 생성된 시각입니다.
   */
  createdAt: string;

  /**
   * History가 마지막으로 변경된 시각입니다.
   */
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* Lifecycle Creation Parameters */
/* ------------------------------------------------------------------ */

/**
 * 새로운 Recommendation Lifecycle Record를 생성할 때 사용하는 입력입니다.
 */
export type CreateRuntimeRecommendationLifecycleParams = {
  /**
   * Lifecycle Record ID입니다.
   *
   * ID 생성 책임은 호출자 또는 별도 ID Factory가 가집니다.
   */
  lifecycleId: string;

  /**
   * Recommendation 식별 ID입니다.
   */
  recommendationId: string;

  /**
   * Lifecycle에서 관리할 Runtime Recommendation입니다.
   */
  recommendation:
    RuntimeNextAction;

  /**
   * 이전 Lifecycle Record ID입니다.
   */
  previousLifecycleId?: string | null;

  /**
   * Record 생성 시각입니다.
   */
  createdAt: string;

  /**
   * 생성과 동시에 active 상태로 전환할지 결정합니다.
   *
   * false이면 created 상태로 시작합니다.
   */
  activateImmediately?: boolean;

  /**
   * 최초 Transition ID입니다.
   */
  transitionId: string;
};

/* ------------------------------------------------------------------ */
/* Lifecycle Transition Parameters */
/* ------------------------------------------------------------------ */

/**
 * 기존 Recommendation Lifecycle Record의 상태를 변경할 때 사용하는
 * 공통 입력입니다.
 */
export type AdvanceRuntimeRecommendationLifecycleParams = {
  /**
   * 변경할 Lifecycle Record입니다.
   */
  lifecycle:
    RuntimeRecommendationLifecycleRecord;

  /**
   * 변경할 다음 상태입니다.
   */
  nextState:
    RuntimeRecommendationLifecycleState;

  /**
   * 상태 변경 이유입니다.
   */
  reason:
    RuntimeRecommendationLifecycleTransitionReason;

  /**
   * 상태 변경 주체입니다.
   */
  actor:
    RuntimeRecommendationLifecycleTransitionActor;

  /**
   * 새 Transition ID입니다.
   */
  transitionId: string;

  /**
   * 상태 변경 시각입니다.
   */
  occurredAt: string;

  /**
   * 새 Recommendation에 의해 교체되는 경우 연결할 ID입니다.
   */
  supersededByRecommendationId?: string | null;

  /**
   * 다음 Lifecycle Record가 이미 생성된 경우 연결할 ID입니다.
   */
  nextLifecycleId?: string | null;

  /**
   * 선택적 Transition 메모입니다.
   */
  note?: string | null;
};

/* ------------------------------------------------------------------ */
/* History Update Parameters */
/* ------------------------------------------------------------------ */

/**
 * Lifecycle Record를 History에 추가할 때 사용하는 입력입니다.
 */
export type AppendRuntimeRecommendationLifecycleParams = {
  history:
    RuntimeRecommendationLifecycleHistory;

  lifecycle:
    RuntimeRecommendationLifecycleRecord;

  updatedAt: string;
};

/**
 * History 안의 기존 Lifecycle Record를 교체할 때 사용하는 입력입니다.
 *
 * Record 배열의 순서는 유지하고, 동일한 ID를 가진 Record만 갱신합니다.
 */
export type ReplaceRuntimeRecommendationLifecycleParams = {
  history:
    RuntimeRecommendationLifecycleHistory;

  lifecycle:
    RuntimeRecommendationLifecycleRecord;

  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* Lifecycle Transition Rules */
/* ------------------------------------------------------------------ */

/**
 * 각 Lifecycle 상태에서 허용되는 다음 상태를 타입 계약 수준에서
 * 설명하기 위한 구조입니다.
 *
 * 실제 검증 로직은 이후 advanceRuntimeRecommendationLifecycle에서
 * 구현합니다.
 */
export type RuntimeRecommendationLifecycleTransitionMap = {
  created:
    | "active"
    | "archived";

  active:
    | "completed"
    | "superseded"
    | "archived";

  completed:
    "archived";

  superseded:
    "archived";

  archived:
    never;
};