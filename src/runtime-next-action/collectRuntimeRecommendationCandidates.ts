import type {
    RuntimeRecommendationCandidate,
} from "./runtimeRecommendationCandidateTypes";

import type {
    RuntimeNextActionRuleParams,
} from "./runtimeNextActionRules";

import {
    createAdaptiveCoachingCandidate,
    createContinuityCandidate,
    createCurrentFocusFallbackCandidate,
    createDecisionReviewCandidate,
    createInsufficientContextCandidate,
    createMissingGitHubContextCandidate,
    createMissingGitHubSnapshotCandidate,
    createMissingReflectionCandidate,
    createNextInterpretationCandidate,
    createNextQuestionCandidate,
    createRecommendedFocusCandidate,
    createReflectionDraftOnlyCandidate,
    createReflectionDraftWithGitHubCandidate,
} from "./runtimeNextActionRules";

export function collectRuntimeRecommendationCandidates(
  params: RuntimeNextActionRuleParams
): RuntimeRecommendationCandidate[] {
  const candidates = [
    createMissingGitHubSnapshotCandidate(
      params
    ),

    createMissingReflectionCandidate(
      params
    ),

    createMissingGitHubContextCandidate(
      params
    ),

    createReflectionDraftWithGitHubCandidate(
      params
    ),

    createReflectionDraftOnlyCandidate(
      params
    ),

    createRecommendedFocusCandidate(
      params
    ),

    createAdaptiveCoachingCandidate(
      params
    ),

    createNextQuestionCandidate(
      params
    ),

    createDecisionReviewCandidate(
      params
    ),

    createNextInterpretationCandidate(
      params
    ),

    createContinuityCandidate(
      params
    ),
  ];

  const meaningfulCandidates =
    candidates.filter(
      (
        candidate
      ): candidate is RuntimeRecommendationCandidate =>
        candidate !== null
    );

  /*
   * 실제 Recommendation 후보가 하나 이상 있으면
   * fallback은 후보 목록에 넣지 않습니다.
   */
  if (meaningfulCandidates.length > 0) {
    return meaningfulCandidates;
  }

  const currentFocusFallback =
    createCurrentFocusFallbackCandidate(
      params
    );

  if (currentFocusFallback !== null) {
    return [
      currentFocusFallback,
    ];
  }

  return [
    createInsufficientContextCandidate(
      params
    ),
  ];
}