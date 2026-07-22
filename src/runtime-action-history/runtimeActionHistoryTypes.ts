import type {
  RuntimeNextActionConfidence,
  RuntimeNextActionKind,
  RuntimeNextActionSource,
  RuntimeNextActionTarget,
} from "../runtime-next-action/runtimeNextActionTypes";

/* ------------------------------------------------------------------ */
/* History Lifecycle */
/* ------------------------------------------------------------------ */

/**
 * Runtime Action Entry의 현재 생명주기 상태입니다.
 *
 * unresolved는 lifecycle status가 아니라
 * RuntimeActionResolutionState에서 별도로 관리합니다.
 */
export type RuntimeActionHistoryStatus =
  | "active"
  | "navigated"
  | "completed"
  | "superseded";

/**
 * 동일 Recommendation이 다시 등장했는지를 나타냅니다.
 */
export type RuntimeActionResolutionState =
  | "new"
  | "repeated"
  | "unresolved";

/**
 * Recommendation 사이의 전환 유형입니다.
 */
export type RuntimeActionTransitionType =
  | "initial"
  | "changed"
  | "repeated"
  | "completed-and-advanced"
  | "superseded";

/* ------------------------------------------------------------------ */
/* Action Snapshot */
/* ------------------------------------------------------------------ */

/**
 * RuntimeNextAction 전체 객체를 저장하지 않고
 * History에 필요한 핵심 값만 보존합니다.
 */
export type RuntimeActionHistorySnapshot = {
  kind:
    RuntimeNextActionKind;

  title:
    string;

  description:
    string;

  target:
    RuntimeNextActionTarget;

  confidence:
    RuntimeNextActionConfidence;

  source:
    RuntimeNextActionSource;

  sourceLabel:
    string;

  whySummary:
    string | null;

  evidenceSummary:
    string | null;

  signalCount:
    number;
};

/* ------------------------------------------------------------------ */
/* Project Observation Snapshot */
/* ------------------------------------------------------------------ */

/**
 * Recommendation이 처음 등장했을 때와 이후 상태를 비교하여
 * 실제 완료 여부를 판단하기 위한 프로젝트 상태입니다.
 */
export type RuntimeActionObservationSnapshot = {
  reflectionCount:
    number;

  githubSnapshotRevision:
    string | null;

  currentFocus:
    string | null;

  connectedEventCount:
    number;

  runtimeAnalysisRevision:
    string | null;
};

/* ------------------------------------------------------------------ */
/* Navigation */
/* ------------------------------------------------------------------ */

/**
 * 사용자가 Recommendation의 이동 버튼을 클릭한 기록입니다.
 *
 * Navigation은 Recommendation 완료와 구분됩니다.
 */
export type RuntimeActionNavigationEvent = {
  id:
    string;

  target:
    RuntimeNextActionTarget;

  occurredAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Completion Evidence */
/* ------------------------------------------------------------------ */

/**
 * Recommendation이 실제 프로젝트 상태 변화로 완료되었다는
 * 근거를 보존합니다.
 */
export type RuntimeActionCompletionEvidence = {
  type:
    | "github-snapshot-created"
    | "github-snapshot-updated"
    | "reflection-recorded"
    | "current-focus-updated"
    | "runtime-analysis-completed"
    | "connected-event-added"
    | "fallback-resolved";

  description:
    string;

  occurredAt:
    string;
};

/* ------------------------------------------------------------------ */
/* History Entry */
/* ------------------------------------------------------------------ */

export type RuntimeActionHistoryEntry = {
  id:
    string;

  projectId:
    string;

  fingerprint:
    string;

  action:
    RuntimeActionHistorySnapshot;

  status:
    RuntimeActionHistoryStatus;

  /**
   * 같은 Recommendation의 과거 등장 여부입니다.
   */
  resolutionState:
    RuntimeActionResolutionState;

  firstObservedAt:
    string;

  lastObservedAt:
    string;

  observationCount:
    number;

  /**
   * 같은 fingerprint가 과거에 등장한 횟수입니다.
   */
  consecutiveRepeatCount:
    number;

  navigationEvents:
    RuntimeActionNavigationEvent[];

  completionEvidence:
    RuntimeActionCompletionEvidence[];

  completedAt:
    string | null;

  supersededAt:
    string | null;

  replacedByEntryId:
    string | null;

  /**
   * Recommendation이 처음 생성되었을 때의 프로젝트 상태입니다.
   */
  startedFrom:
    RuntimeActionObservationSnapshot;

  /**
   * 가장 최근에 관찰한 프로젝트 상태입니다.
   */
  lastObservedState:
    RuntimeActionObservationSnapshot;

  /**
   * 동일 Recommendation과 동일 상태의 중복 관찰을 방지합니다.
   */
  lastObservationKey:
    string;
};

/* ------------------------------------------------------------------ */
/* Transition */
/* ------------------------------------------------------------------ */

export type RuntimeActionTransition = {
  id:
    string;

  projectId:
    string;

  fromEntryId:
    string | null;

  toEntryId:
    string;

  type:
    RuntimeActionTransitionType;

  occurredAt:
    string;
};

/* ------------------------------------------------------------------ */
/* History State */
/* ------------------------------------------------------------------ */

export type RuntimeActionHistoryState = {
  version:
    1;

  entries:
    RuntimeActionHistoryEntry[];

  transitions:
    RuntimeActionTransition[];

  activeEntryId:
    string | null;
};