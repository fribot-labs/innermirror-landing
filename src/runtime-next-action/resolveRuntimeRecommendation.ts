import type {
    RuntimeNextAction,
    RuntimeNextActionConfidence,
    RuntimeNextActionKind,
} from "./runtimeNextActionTypes";

import type {
    RuntimeRecommendationCandidate,
    RuntimeRecommendationResolution,
    ScoredRuntimeRecommendationCandidate,
} from "./runtimeRecommendationCandidateTypes";

import {
    scoreRuntimeRecommendationCandidate,
} from "./scoreRuntimeRecommendationCandidate";

type RuntimeRecommendationConflictGroup =
  | "project-movement"
  | "reflection-action"
  | "context-recovery"
  | "none";

export function resolveRuntimeRecommendation(
  candidates: RuntimeRecommendationCandidate[]
): RuntimeRecommendationResolution | null {
  if (candidates.length === 0) {
    return null;
  }

  /*
   * 모든 후보를 점수화합니다.
   */
  const scoredCandidates =
    candidates.map(
      scoreRuntimeRecommendationCandidate
    );

  /*
   * Blocking 후보가 존재하면
   * 일반 전략 Recommendation은 일시적으로
   * 최종 선택 대상에서 제외합니다.
   */
  const eligibleCandidates =
    selectEligibleCandidates(
      scoredCandidates
    );

  /*
   * 가장 높은 점수의 후보를 선택합니다.
   *
   * 점수가 동일하면 basePriority가 높은 후보,
   * 그마저 동일하면 id 순서로 결정하여
   * 결과가 실행할 때마다 달라지지 않게 합니다.
   */
  const sortedCandidates =
    [...eligibleCandidates].sort(
      (left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (
          right.candidate.basePriority !==
          left.candidate.basePriority
        ) {
          return (
            right.candidate.basePriority -
            left.candidate.basePriority
          );
        }

        return left.candidate.id.localeCompare(
          right.candidate.id
        );
      }
    );

  const selected =
    sortedCandidates[0];

  if (selected === undefined) {
    return null;
  }

  /*
   * 전체 후보 중 selected와 같은 방향을
   * 지원하는 후보만 supporting으로 사용합니다.
   *
   * Blocking 필터에서 제외된 일반 후보도
   * blocking Recommendation의 supporting 근거가
   * 되어서는 안 되므로 eligibleCandidates를
   * 기준으로 탐색합니다.
   */
  const supportingCandidates =
    eligibleCandidates
      .filter(
        ({ candidate }) =>
          candidate.id !==
          selected.candidate.id
      )
      .filter(
        ({ candidate }) =>
          canSupportSelectedCandidate(
            selected.candidate,
            candidate
          )
      )
      .sort(
        (left, right) =>
          right.score - left.score
      )
      .slice(0, 2)
      .map(
        ({ candidate }) =>
          candidate
      );

  const action =
    createFinalRuntimeNextAction(
      selected.candidate,
      supportingCandidates
    );

  return {
    action,

    selectedCandidateId:
      selected.candidate.id,

    candidateCount:
      candidates.length,

    supportingCandidateIds:
      supportingCandidates.map(
        (candidate) =>
          candidate.id
      ),

    resolution:
      resolveResolutionType(
        candidates,
        selected.candidate,
        supportingCandidates
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Blocking Selection */
/* ------------------------------------------------------------------ */

function selectEligibleCandidates(
  candidates: ScoredRuntimeRecommendationCandidate[]
): ScoredRuntimeRecommendationCandidate[] {
  const blockingCandidates =
    candidates.filter(
      ({ candidate }) =>
        candidate.isBlocking
    );

  return blockingCandidates.length > 0
    ? blockingCandidates
    : candidates;
}

/* ------------------------------------------------------------------ */
/* Supporting Recommendation */
/* ------------------------------------------------------------------ */

function canSupportSelectedCandidate(
  selected: RuntimeRecommendationCandidate,
  supporting: RuntimeRecommendationCandidate
): boolean {
  /*
   * fallback은 실제 Runtime Recommendation의
   * supporting evidence로 사용하지 않습니다.
   */
  if (
    selected.category === "fallback" ||
    supporting.category === "fallback"
  ) {
    return false;
  }

  /*
   * Blocking Recommendation과 일반 Recommendation은
   * 서로 병합하지 않습니다.
   */
  if (
    selected.isBlocking !==
    supporting.isBlocking
  ) {
    return false;
  }

  /*
   * 목표 지점이 다르면 같은 행동으로 보지 않습니다.
   *
   * 예:
   * current-focus
   * reflection
   * project-timeline
   */
  if (
    selected.target !==
    supporting.target
  ) {
    return false;
  }

  const selectedConflictGroup =
    resolveConflictGroup(
      selected.kind
    );

  const supportingConflictGroup =
    resolveConflictGroup(
      supporting.kind
    );

  /*
   * 같은 충돌 그룹인데 kind가 다르면
   * 서로 반대되거나 구분되는 행동일 수 있으므로
   * 병합하지 않습니다.
   *
   * 예:
   * continue-project-work
   * review-project-direction
   */
  if (
    selectedConflictGroup !== "none" &&
    selectedConflictGroup ===
      supportingConflictGroup &&
    selected.kind !== supporting.kind
  ) {
    return false;
  }

  /*
   * 가장 안전한 MVP 병합 기준입니다.
   *
   * kind와 target이 같으면
   * 같은 행동을 서로 다른 Runtime 신호가
   * 지지하는 것으로 봅니다.
   */
  return (
    selected.kind === supporting.kind &&
    selected.target === supporting.target
  );
}

/* ------------------------------------------------------------------ */
/* Conflict Group */
/* ------------------------------------------------------------------ */

function resolveConflictGroup(
  kind: RuntimeNextActionKind
): RuntimeRecommendationConflictGroup {
  switch (kind) {
    case "continue-project-work":
    case "review-project-direction":
    case "stabilize-current-focus":
      return "project-movement";

    case "write-reflection":
    case "analyze-reflection-with-github":
      return "reflection-action";

    case "analyze-github":
    case "insufficient-context":
      return "context-recovery";

    default:
      return "none";
  }
}

/* ------------------------------------------------------------------ */
/* Final Action Creation */
/* ------------------------------------------------------------------ */

function createFinalRuntimeNextAction(
  primary: RuntimeRecommendationCandidate,
  supporting: RuntimeRecommendationCandidate[]
): RuntimeNextAction {
  const supportingReasons =
    supporting
      .map(
        (candidate) =>
          candidate.reason.trim()
      )
      .filter(
        (reason) =>
          reason.length > 0 &&
          reason !== primary.reason
      )
      .slice(0, 2);

  const combinedReason =
    supportingReasons.length === 0
      ? primary.reason
      : [
          primary.reason,
          ...supportingReasons,
        ].join(" ");

  return {
    kind:
      primary.kind,

    title:
      primary.title,

    description:
      primary.description,

    reason:
      combinedReason,

    target:
      primary.target,

    confidence:
      resolveCombinedConfidence(
        primary,
        supporting
      ),

    source:
      primary.source,

    sourceLabel:
      primary.sourceLabel,

    isActionable:
      primary.isActionable,
  };
}

/* ------------------------------------------------------------------ */
/* Confidence Resolution */
/* ------------------------------------------------------------------ */

function resolveCombinedConfidence(
  primary: RuntimeRecommendationCandidate,
  supporting: RuntimeRecommendationCandidate[]
): RuntimeNextActionConfidence {
  if (
    primary.confidence === "high"
  ) {
    return "high";
  }

  if (
    primary.confidence === "medium" &&
    supporting.length >= 2
  ) {
    return "high";
  }

  if (
    primary.confidence === "low" &&
    supporting.length >= 1
  ) {
    return "medium";
  }

  return primary.confidence;
}

/* ------------------------------------------------------------------ */
/* Resolution Type */
/* ------------------------------------------------------------------ */

function resolveResolutionType(
  candidates: RuntimeRecommendationCandidate[],
  selected: RuntimeRecommendationCandidate,
  supporting: RuntimeRecommendationCandidate[]
): RuntimeRecommendationResolution["resolution"] {
  if (
    selected.category === "fallback"
  ) {
    return "fallback";
  }

  if (
    supporting.length > 0
  ) {
    return "merged";
  }

  if (
    candidates.length === 1
  ) {
    return "single";
  }

  return "selected";
}