import type {
  CreateRuntimeNextActionParams,
  RuntimeNextAction,
} from "./runtimeNextActionTypes";

import {
  collectRuntimeRecommendationCandidates,
} from "./collectRuntimeRecommendationCandidates";

import {
  resolveRuntimeRecommendation,
} from "./resolveRuntimeRecommendation";

import type {
  RuntimeNextActionRuleParams,
} from "./runtimeNextActionRules";

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

  const candidates =
    collectRuntimeRecommendationCandidates(
      ruleParams
    );

  const resolution =
    resolveRuntimeRecommendation(
      candidates
    );

  return resolution?.action ?? null;
}

function normalizeOptionalText(
  value: string | null | undefined
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