import type {
    RuntimeNextActionKind,
} from "../runtime-next-action/runtimeNextActionTypes";

import type {
    RuntimeActionCompletionEvidence,
    RuntimeActionHistoryEntry,
    RuntimeActionObservationSnapshot,
} from "./runtimeActionHistoryTypes";

export type EvaluateRuntimeActionCompletionParams = {
  /**
   * 현재 완료 여부를 평가할 History Entry입니다.
   *
   * entry.startedFrom에는 Recommendation이 처음 등장했을 때의
   * 프로젝트 상태가 저장되어 있어야 합니다.
   */
  entry:
    RuntimeActionHistoryEntry;

  /**
   * 현재 프로젝트 상태입니다.
   */
  current:
    RuntimeActionObservationSnapshot;

  /**
   * 완료 Evidence가 확인된 시각입니다.
   */
  occurredAt:
    string;
};

/**
 * Runtime Action이 실제로 완료되었는지 판단합니다.
 *
 * 중요한 원칙:
 *
 * - Navigation click만으로 완료 처리하지 않습니다.
 * - Recommendation 시작 당시 상태와 현재 상태를 비교합니다.
 * - 명확한 상태 변화가 확인될 때만 Completion Evidence를 반환합니다.
 * - 완료를 확신할 수 없으면 null을 반환합니다.
 */
export function evaluateRuntimeActionCompletion({
  entry,
  current,
  occurredAt,
}: EvaluateRuntimeActionCompletionParams):
  RuntimeActionCompletionEvidence | null {
  if (
    entry.status === "completed" ||
    entry.status === "superseded"
  ) {
    return null;
  }

  const startedFrom =
    normalizeObservationSnapshot(
      entry.startedFrom
    );

  const normalizedCurrent =
    normalizeObservationSnapshot(
      current
    );

  switch (entry.action.kind) {
    case "analyze-github":
      return evaluateGitHubAnalysisCompletion({
        startedFrom,
        current:
          normalizedCurrent,
        occurredAt,
      });

    case "write-reflection":
      return evaluateReflectionCompletion({
        startedFrom,
        current:
          normalizedCurrent,
        occurredAt,
      });

    case "analyze-reflection-with-github":
      return evaluateCombinedAnalysisCompletion({
        startedFrom,
        current:
          normalizedCurrent,
        occurredAt,
      });

    case "continue-project-work":
      return evaluateProjectWorkCompletion({
        startedFrom,
        current:
          normalizedCurrent,
        occurredAt,
      });

    case "stabilize-current-focus":
      return evaluateCurrentFocusCompletion({
        startedFrom,
        current:
          normalizedCurrent,
        occurredAt,
      });

    case "review-project-direction":
      return evaluateProjectDirectionReviewCompletion({
        startedFrom,
        current:
          normalizedCurrent,
        occurredAt,
      });

    case "insufficient-context":
      return evaluateFallbackCompletion({
        startedFrom,
        current:
          normalizedCurrent,
        occurredAt,
      });

    default:
      return evaluateUnknownActionCompletion({
        kind:
          entry.action.kind,
        startedFrom,
        current:
          normalizedCurrent,
        occurredAt,
      });
  }
}

/* ------------------------------------------------------------------ */
/* GitHub Analysis */
/* ------------------------------------------------------------------ */

type CompletionRuleParams = {
  startedFrom:
    RuntimeActionObservationSnapshot;

  current:
    RuntimeActionObservationSnapshot;

  occurredAt:
    string;
};

/**
 * GitHub Snapshot이 없던 상태에서 최초 Snapshot이 생성되었거나,
 * 기존 Snapshot revision이 새로운 revision으로 변경되면 완료입니다.
 */
function evaluateGitHubAnalysisCompletion({
  startedFrom,
  current,
  occurredAt,
}: CompletionRuleParams):
  RuntimeActionCompletionEvidence | null {
  const previousRevision =
    startedFrom.githubSnapshotRevision;

  const currentRevision =
    current.githubSnapshotRevision;

  if (
    previousRevision === null &&
    currentRevision !== null
  ) {
    return createCompletionEvidence({
      type:
        "github-snapshot-created",

      description:
        "A GitHub Snapshot was captured after Runtime recommended analyzing the latest project activity.",

      occurredAt,
    });
  }

  if (
    hasRevisionChanged(
      previousRevision,
      currentRevision
    )
  ) {
    return createCompletionEvidence({
      type:
        "github-snapshot-updated",

      description:
        "The GitHub Snapshot was refreshed after Runtime recommended updating the project evidence.",

      occurredAt,
    });
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Reflection */
/* ------------------------------------------------------------------ */

/**
 * Recommendation 시작 이후 Reflection count가 증가하면
 * Reflection 작성이 완료된 것으로 판단합니다.
 */
function evaluateReflectionCompletion({
  startedFrom,
  current,
  occurredAt,
}: CompletionRuleParams):
  RuntimeActionCompletionEvidence | null {
  if (
    current.reflectionCount >
    startedFrom.reflectionCount
  ) {
    return createCompletionEvidence({
      type:
        "reflection-recorded",

      description:
        "A new project Reflection was recorded after Runtime recommended adding reasoning context.",

      occurredAt,
    });
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Reflection + GitHub Combined Analysis */
/* ------------------------------------------------------------------ */

/**
 * Combined Analysis는 단순 Reflection 작성만으로 완료 처리하지 않습니다.
 *
 * 다음 조건 중 하나를 사용합니다.
 *
 * 1. Reflection이 증가하고 Runtime 분석 revision도 변경됨
 * 2. Reflection이 증가하고 GitHub Snapshot도 갱신됨
 *
 * 즉, Reflection이 실제 분석 흐름에 연결되었다는 근거가 필요합니다.
 */
function evaluateCombinedAnalysisCompletion({
  startedFrom,
  current,
  occurredAt,
}: CompletionRuleParams):
  RuntimeActionCompletionEvidence | null {
  const reflectionRecorded =
    current.reflectionCount >
    startedFrom.reflectionCount;

  const runtimeAnalysisUpdated =
    hasRevisionChanged(
      startedFrom.runtimeAnalysisRevision,
      current.runtimeAnalysisRevision
    );

  const githubSnapshotUpdated =
    hasRevisionChanged(
      startedFrom.githubSnapshotRevision,
      current.githubSnapshotRevision
    );

  if (
    reflectionRecorded &&
    runtimeAnalysisUpdated
  ) {
    return createCompletionEvidence({
      type:
        "runtime-analysis-completed",

      description:
        "A new Reflection was analyzed after Runtime recommended connecting it with the current project context.",

      occurredAt,
    });
  }

  if (
    reflectionRecorded &&
    githubSnapshotUpdated
  ) {
    return createCompletionEvidence({
      type:
        "runtime-analysis-completed",

      description:
        "A new Reflection and refreshed GitHub Snapshot were connected through combined project analysis.",

      occurredAt,
    });
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Continue Project Work */
/* ------------------------------------------------------------------ */

/**
 * 프로젝트 진행 추천은 다음 상태 변화로 완료를 판단합니다.
 *
 * - connected event 증가
 * - GitHub Snapshot revision 변경
 *
 * 단순 Runtime 분석 revision 변경만으로는 실제 프로젝트 작업이
 * 이루어졌다고 확신할 수 없으므로 완료 처리하지 않습니다.
 */
function evaluateProjectWorkCompletion({
  startedFrom,
  current,
  occurredAt,
}: CompletionRuleParams):
  RuntimeActionCompletionEvidence | null {
  if (
    current.connectedEventCount >
    startedFrom.connectedEventCount
  ) {
    return createCompletionEvidence({
      type:
        "connected-event-added",

      description:
        "A new connected project event was recorded after Runtime recommended continuing the current work.",

      occurredAt,
    });
  }

  if (
    hasRevisionChanged(
      startedFrom.githubSnapshotRevision,
      current.githubSnapshotRevision
    )
  ) {
    return createCompletionEvidence({
      type:
        "github-snapshot-updated",

      description:
        "New GitHub activity was captured after Runtime recommended continuing the project work.",

      occurredAt,
    });
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Stabilize Current Focus */
/* ------------------------------------------------------------------ */

/**
 * 안정화 추천의 완료 판정은 보수적으로 수행합니다.
 *
 * 다음 중 하나가 확인되어야 합니다.
 *
 * - Current Focus가 실제로 변경됨
 * - 같은 Focus를 유지하면서 새로운 Runtime 분석이 완료됨
 *
 * Focus 변경은 명확한 상태 변화이므로 우선 적용합니다.
 */
function evaluateCurrentFocusCompletion({
  startedFrom,
  current,
  occurredAt,
}: CompletionRuleParams):
  RuntimeActionCompletionEvidence | null {
  if (
    hasMeaningfulTextChanged(
      startedFrom.currentFocus,
      current.currentFocus
    )
  ) {
    return createCompletionEvidence({
      type:
        "current-focus-updated",

      description:
        "The current project focus changed after Runtime recommended clarifying or stabilizing the active direction.",

      occurredAt,
    });
  }

  if (
    current.currentFocus !== null &&
    hasRevisionChanged(
      startedFrom.runtimeAnalysisRevision,
      current.runtimeAnalysisRevision
    )
  ) {
    return createCompletionEvidence({
      type:
        "runtime-analysis-completed",

      description:
        "The current project focus was analyzed again after Runtime recommended stabilizing its boundaries.",

      occurredAt,
    });
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Review Project Direction */
/* ------------------------------------------------------------------ */

/**
 * 프로젝트 방향 검토는 다음 근거로 완료 처리합니다.
 *
 * - Reflection 추가
 * - Current Focus 변경
 * - Runtime 분석 revision 변경
 *
 * 단, Runtime revision 변경은 실제 Recommendation 시작 이후
 * 새로운 분석 결과가 도착한 경우에만 인정됩니다.
 */
function evaluateProjectDirectionReviewCompletion({
  startedFrom,
  current,
  occurredAt,
}: CompletionRuleParams):
  RuntimeActionCompletionEvidence | null {
  if (
    current.reflectionCount >
    startedFrom.reflectionCount
  ) {
    return createCompletionEvidence({
      type:
        "reflection-recorded",

      description:
        "A new Reflection was recorded after Runtime recommended reviewing the current project direction.",

      occurredAt,
    });
  }

  if (
    hasMeaningfulTextChanged(
      startedFrom.currentFocus,
      current.currentFocus
    )
  ) {
    return createCompletionEvidence({
      type:
        "current-focus-updated",

      description:
        "The project focus changed after Runtime recommended reviewing the current direction.",

      occurredAt,
    });
  }

  if (
    hasRevisionChanged(
      startedFrom.runtimeAnalysisRevision,
      current.runtimeAnalysisRevision
    )
  ) {
    return createCompletionEvidence({
      type:
        "runtime-analysis-completed",

      description:
        "A new Runtime analysis was completed after the project direction review recommendation.",

      occurredAt,
    });
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Fallback / Insufficient Context */
/* ------------------------------------------------------------------ */

/**
 * insufficient-context는 현재 Recommendation만 보고는
 * 더 구체적인 Recommendation 등장 여부를 알 수 없습니다.
 *
 * 대신 프로젝트 Context가 실질적으로 증가한 경우만
 * fallback이 해소된 것으로 판단합니다.
 */
function evaluateFallbackCompletion({
  startedFrom,
  current,
  occurredAt,
}: CompletionRuleParams):
  RuntimeActionCompletionEvidence | null {
  const reflectionAdded =
    current.reflectionCount >
    startedFrom.reflectionCount;

  const snapshotAddedOrUpdated =
    hasRevisionChanged(
      startedFrom.githubSnapshotRevision,
      current.githubSnapshotRevision
    );

  const connectedEventAdded =
    current.connectedEventCount >
    startedFrom.connectedEventCount;

  const focusAdded =
    startedFrom.currentFocus === null &&
    current.currentFocus !== null;

  const runtimeAnalysisUpdated =
    hasRevisionChanged(
      startedFrom.runtimeAnalysisRevision,
      current.runtimeAnalysisRevision
    );

  if (
    reflectionAdded ||
    snapshotAddedOrUpdated ||
    connectedEventAdded ||
    focusAdded ||
    runtimeAnalysisUpdated
  ) {
    return createCompletionEvidence({
      type:
        "fallback-resolved",

      description:
        "Additional project or reasoning context became available after Runtime reported insufficient context.",

      occurredAt,
    });
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Unknown Future Action */
/* ------------------------------------------------------------------ */

type EvaluateUnknownActionCompletionParams =
  CompletionRuleParams & {
    kind:
      RuntimeNextActionKind;
  };

/**
 * 새로운 RuntimeNextActionKind가 추가되었지만 명시적인 완료 규칙이
 * 아직 구현되지 않은 경우의 보수적인 fallback입니다.
 *
 * 실제 연결 이벤트가 증가한 경우에만 완료 처리합니다.
 */
function evaluateUnknownActionCompletion({
  kind,
  startedFrom,
  current,
  occurredAt,
}: EvaluateUnknownActionCompletionParams):
  RuntimeActionCompletionEvidence | null {
  if (
    current.connectedEventCount >
    startedFrom.connectedEventCount
  ) {
    return createCompletionEvidence({
      type:
        "connected-event-added",

      description:
        `A new connected project event was observed after the "${kind}" recommendation.`,

      occurredAt,
    });
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Completion Evidence Creation */
/* ------------------------------------------------------------------ */

type CreateCompletionEvidenceParams = {
  type:
    RuntimeActionCompletionEvidence["type"];

  description:
    string;

  occurredAt:
    string;
};

function createCompletionEvidence({
  type,
  description,
  occurredAt,
}: CreateCompletionEvidenceParams):
  RuntimeActionCompletionEvidence {
  return {
    type,

    description:
      description.trim(),

    occurredAt:
      normalizeTimestamp(
        occurredAt
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Observation Comparison */
/* ------------------------------------------------------------------ */

/**
 * null → 값 또는 값 A → 값 B 변화를 확인합니다.
 *
 * null → null은 변화가 아닙니다.
 * 같은 revision은 변화가 아닙니다.
 */
function hasRevisionChanged(
  previous:
    string | null,
  current:
    string | null
): boolean {
  const normalizedPrevious =
    normalizeNullableText(
      previous
    );

  const normalizedCurrent =
    normalizeNullableText(
      current
    );

  if (
    normalizedCurrent === null
  ) {
    return false;
  }

  return (
    normalizedPrevious !==
    normalizedCurrent
  );
}

/**
 * Current Focus처럼 사람이 입력하는 텍스트 비교에 사용합니다.
 *
 * 대소문자와 연속 공백 차이는 의미 있는 변경으로 보지 않습니다.
 */
function hasMeaningfulTextChanged(
  previous:
    string | null,
  current:
    string | null
): boolean {
  const normalizedPrevious =
    normalizeComparableText(
      previous
    );

  const normalizedCurrent =
    normalizeComparableText(
      current
    );

  if (
    normalizedCurrent === null
  ) {
    return false;
  }

  return (
    normalizedPrevious !==
    normalizedCurrent
  );
}

/* ------------------------------------------------------------------ */
/* Observation Normalization */
/* ------------------------------------------------------------------ */

function normalizeObservationSnapshot(
  observation:
    RuntimeActionObservationSnapshot
): RuntimeActionObservationSnapshot {
  return {
    reflectionCount:
      normalizeCount(
        observation.reflectionCount
      ),

    githubSnapshotRevision:
      normalizeNullableText(
        observation
          .githubSnapshotRevision
      ),

    currentFocus:
      normalizeNullableText(
        observation.currentFocus
      ),

    connectedEventCount:
      normalizeCount(
        observation.connectedEventCount
      ),

    runtimeAnalysisRevision:
      normalizeNullableText(
        observation
          .runtimeAnalysisRevision
      ),
  };
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

function normalizeNullableText(
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

function normalizeComparableText(
  value:
    string | null
): string | null {
  const normalized =
    normalizeNullableText(
      value
    );

  if (
    normalized === null
  ) {
    return null;
  }

  return normalized
    .toLowerCase()
    .replace(
      /\s+/g,
      " "
    );
}

function normalizeTimestamp(
  value:
    string
): string {
  const normalized =
    value.trim();

  if (
    normalized.length === 0
  ) {
    return new Date().toISOString();
  }

  const parsedTimestamp =
    Date.parse(
      normalized
    );

  if (
    Number.isNaN(
      parsedTimestamp
    )
  ) {
    return new Date().toISOString();
  }

  return new Date(
    parsedTimestamp
  ).toISOString();
}