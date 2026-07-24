import type {
  CreateRuntimeNextActionParams,
  RuntimeNextAction,
} from "./runtimeNextActionTypes";

import {
  collectRuntimeRecommendationCandidates,
} from "./collectRuntimeRecommendationCandidates";

import {
  createRuntimeRecommendationCandidateScores,
} from "../runtime-recommendation-evolution/createRuntimeRecommendationCandidateScore";

import {
  resolveBaseRuntimeRecommendationCandidate,
} from "../runtime-recommendation-evolution/resolveBaseRuntimeRecommendationCandidate";

import type {
  RuntimeNextActionRuleParams,
} from "./runtimeNextActionRules";

import {
  createAdaptiveRecommendationModifiers,
} from "../runtime-recommendation-evolution/createAdaptiveRecommendationModifier";

import {
  createAdaptiveRecommendationScores,
} from "../runtime-recommendation-evolution/createAdaptiveRecommendationScore";

import {
  resolveAdaptiveRuntimeRecommendationCandidate,
} from "../runtime-recommendation-evolution/resolveAdaptiveRuntimeRecommendationCandidate";

import {
  compareBaseAndAdaptiveRuntimeRecommendations,
} from "../runtime-recommendation-evolution/compareBaseAndAdaptiveRuntimeRecommendations";

export function createRuntimeNextAction({
  hasProject,
  hasRepository,
  hasReflectionDraft,
  hasGitHubSnapshot,
  currentFocus,
  recommendedFocus,
  nextInterpretation,
  adaptiveCoaching,
  decisionReviewQuestion,
  nextQuestion,
  recentCommitCount,
  recentPullRequestCount,
  reflectionCount,
  connectedEventCount,
}: CreateRuntimeNextActionParams):
  RuntimeNextAction | null {

  if (!hasProject) {
    return null;
  }

  const ruleParams:
    RuntimeNextActionRuleParams = {

    hasRepository,

    hasReflectionDraft,

    hasGitHubSnapshot,

    currentFocus:
      normalizeOptionalText(
        currentFocus
      ),

    recommendedFocus:
      normalizeOptionalText(
        recommendedFocus
      ),

    nextInterpretation:
      normalizeOptionalText(
        nextInterpretation
      ),

    adaptiveCoaching:
      normalizeOptionalText(
        adaptiveCoaching
      ),

    decisionReviewQuestion:
      normalizeOptionalText(
        decisionReviewQuestion
      ),

    nextQuestion:
      normalizeOptionalText(
        nextQuestion
      ),

    recentCommitCount:
      Math.max(
        0,
        recentCommitCount
      ),

    recentPullRequestCount:
      Math.max(
        0,
        recentPullRequestCount
      ),

    reflectionCount:
      Math.max(
        0,
        reflectionCount
      ),

    connectedEventCount:
      Math.max(
        0,
        connectedEventCount
      ),
  };

  /*
   * STEP 1
   *
   * Generate every valid Recommendation Candidate.
   */

  const candidates =
    collectRuntimeRecommendationCandidates(
      ruleParams
    );

  /*
   * STEP 2
   *
   * Apply deterministic Base Score.
   */

  const scoringResult =
    createRuntimeRecommendationCandidateScores({

      candidates,

    });

  /*
  * STEP 3
  *
  * Resolve Base Recommendation.
  *
  * Base Recommendation remains the only recommendation
  * applied to RuntimeNextAction in PR-046C.
  */

  const baseResolution =
    resolveBaseRuntimeRecommendationCandidate({
      scoredCandidates:
        scoringResult.scoredCandidates,

      scoringDiagnostics:
        scoringResult.diagnostics,
    });

  /*
  * STEP 4
  *
  * Create Adaptive Modifiers.
  *
  * PR-046C runs this layer in Shadow Mode only.
  *
  * Until the Quality Profile generation layer is connected,
  * an empty map produces null profiles for every Candidate.
  * The Adaptive Modifier policy should therefore return
  * neutral modifiers where no usable history exists.
  */

  const adaptiveModifierResult =
    createAdaptiveRecommendationModifiers({
      scoredCandidates:
        scoringResult.scoredCandidates,

      qualityProfileByCandidateId:
        {},
    });

  /*
  * STEP 5
  *
  * Combine Base Scores with Adaptive Modifiers.
  */

  const adaptiveScoreResult =
    createAdaptiveRecommendationScores({
      scoredCandidates:
        scoringResult.scoredCandidates,

      modifierResultByCandidateId:
        adaptiveModifierResult
          .resultByCandidateId,
    });

  /*
  * STEP 6
  *
  * Resolve the Adaptive Shadow Winner.
  *
  * This result must not replace the Base Winner
  * during PR-046C.
  */

  const adaptiveResolution =
    resolveAdaptiveRuntimeRecommendationCandidate({
      adaptiveScoreResults:
        adaptiveScoreResult.results,
    });

  /*
  * STEP 7
  *
  * Compare the applied Base Winner with the
  * Adaptive Shadow Winner.
  */

  compareBaseAndAdaptiveRuntimeRecommendations({
    baseWinner:
      baseResolution.winner,

    adaptiveResolution,
  });

  /*
  * Temporary PR-046C verification logs.
  *
  * These logs can be removed after the Runtime
  * integration has been verified.
  */

  /*
  * STEP 8
  *
  * Shadow Mode invariant:
  *
  * Only the Base Recommendation may determine
  * the returned RuntimeNextAction.
  */

  return (
    baseResolution.action ??
    null
  );
}

function normalizeOptionalText(
  value:
    string | null | undefined
): string | null {

  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}