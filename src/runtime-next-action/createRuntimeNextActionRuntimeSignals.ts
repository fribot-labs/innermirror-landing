import type {
    RuntimeContractV2Response,
} from "../types/runtimeContractV2";

export type RuntimeNextActionRuntimeSignals = {
  recommendedFocus: string | null;
  nextInterpretation: string | null;
  adaptiveCoaching: string | null;
  decisionReviewQuestion: string | null;
  nextQuestion: string | null;
};

export function createRuntimeNextActionRuntimeSignals(
  response: RuntimeContractV2Response | null
): RuntimeNextActionRuntimeSignals {
  if (
    response === null ||
    response.ok === false
  ) {
    return createEmptyRuntimeNextActionRuntimeSignals();
  }

  return {
    recommendedFocus:
      normalizeOptionalText(
        response.data.insightSynthesis
          ?.recommendedFocus
      ),

    nextInterpretation:
      normalizeOptionalText(
        response.data.insightSynthesis
          ?.refinement
          ?.nextInterpretation
      ),

    adaptiveCoaching:
      normalizeOptionalText(
        response.data.coaching.nextAction
      ),

    decisionReviewQuestion:
      normalizeOptionalText(
        response.data.decisionReview
          .improvementQuestion
      ),

    nextQuestion:
      normalizeOptionalText(
        response.data.question.question
      ),
  };
}

function createEmptyRuntimeNextActionRuntimeSignals():
  RuntimeNextActionRuntimeSignals {
  return {
    recommendedFocus: null,
    nextInterpretation: null,
    adaptiveCoaching: null,
    decisionReviewQuestion: null,
    nextQuestion: null,
  };
}

function normalizeOptionalText(
  value: string | null | undefined
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}