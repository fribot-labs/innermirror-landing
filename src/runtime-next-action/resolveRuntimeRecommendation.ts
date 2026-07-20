import type {
  RuntimeNextAction,
  RuntimeNextActionConfidence,
  RuntimeNextActionKind,
} from "./runtimeNextActionTypes";

import type {
  RuntimeRecommendationCandidate,
  RuntimeRecommendationResolution,
  RuntimeRecommendationResolutionType,
  ScoredRuntimeRecommendationCandidate,
} from "./runtimeRecommendationCandidateTypes";

import {
  createRuntimeWhyExplanation,
} from "./createRuntimeWhyExplanation";

import {
  scoreRuntimeRecommendationCandidate,
} from "./scoreRuntimeRecommendationCandidate";

type RuntimeRecommendationConflictGroup =
  | "project-movement"
  | "reflection-action"
  | "context-recovery"
  | "none";

export function resolveRuntimeRecommendation(
  candidates:
    RuntimeRecommendationCandidate[]
): RuntimeRecommendationResolution | null {
  if (candidates.length === 0) {
    return null;
  }

  const scoredCandidates =
    candidates.map(
      scoreRuntimeRecommendationCandidate
    );

  const eligibleCandidates =
    selectEligibleCandidates(
      scoredCandidates
    );

  const sortedCandidates =
    [...eligibleCandidates].sort(
      (left, right) => {
        if (
          right.score !== left.score
        ) {
          return (
            right.score - left.score
          );
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

        return (
          left.candidate.id.localeCompare(
            right.candidate.id
          )
        );
      }
    );

  const selected =
    sortedCandidates[0];

  if (selected === undefined) {
    return null;
  }

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

  /*
   * Why 설명을 만들기 전에
   * 최종 resolution type을 먼저 확정합니다.
   */
  const resolutionType =
    resolveResolutionType(
      candidates,
      selected.candidate,
      supportingCandidates
    );

  const action =
    createFinalRuntimeNextAction(
      selected.candidate,
      supportingCandidates,
      resolutionType
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
      resolutionType,
  };
}

/* ------------------------------------------------------------------ */
/* Blocking Selection */
/* ------------------------------------------------------------------ */

function selectEligibleCandidates(
  candidates:
    ScoredRuntimeRecommendationCandidate[]
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
  selected:
    RuntimeRecommendationCandidate,
  supporting:
    RuntimeRecommendationCandidate
): boolean {
  if (
    selected.category === "fallback" ||
    supporting.category === "fallback"
  ) {
    return false;
  }

  if (
    selected.isBlocking !==
    supporting.isBlocking
  ) {
    return false;
  }

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

  if (
    selectedConflictGroup !== "none" &&
    selectedConflictGroup ===
      supportingConflictGroup &&
    selected.kind !== supporting.kind
  ) {
    return false;
  }

  return (
    selected.kind ===
      supporting.kind &&
    selected.target ===
      supporting.target
  );
}

/* ------------------------------------------------------------------ */
/* Conflict Group */
/* ------------------------------------------------------------------ */

function resolveConflictGroup(
  kind:
    RuntimeNextActionKind
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
  primary:
    RuntimeRecommendationCandidate,
  supporting:
    RuntimeRecommendationCandidate[],
  resolution:
    RuntimeRecommendationResolutionType
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

    /*
     * 기존 UI 호환을 위해 reason은 유지합니다.
     */
    reason:
      combinedReason,

    /*
     * PR-043B에서 추가되는
     * 구조화된 사용자 설명입니다.
     */
    why:
      createRuntimeWhyExplanation({
        primary,
        supporting,
        resolution,
      }),

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
  primary:
    RuntimeRecommendationCandidate,
  supporting:
    RuntimeRecommendationCandidate[]
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
  candidates:
    RuntimeRecommendationCandidate[],
  selected:
    RuntimeRecommendationCandidate,
  supporting:
    RuntimeRecommendationCandidate[]
): RuntimeRecommendationResolutionType {
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