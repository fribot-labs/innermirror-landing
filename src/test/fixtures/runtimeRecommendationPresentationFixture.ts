import type {
    RuntimeRecommendationPresentation,
} from "../../components/runtimeRecommendationPresentation";

export function createRuntimeRecommendationPresentationFixture(
  overrides: Partial<
    RuntimeRecommendationPresentation
  > = {}
): RuntimeRecommendationPresentation {
  const presentation:
    RuntimeRecommendationPresentation = {
      headline:
        "Runtime recommendation context is available.",

      overview:
        "Runtime integrated the current recommendation state, observation history, and supporting signals.",

      recommendationStateLabel:
        "The current recommendation remains stable.",

      recommendationChanged:
        false,

      recommendationChangeMessage:
        "The adaptive recommendation remains aligned with the base recommendation.",

      confidenceLabel:
        "High confidence",

      stabilityLabel:
        "Stable pattern",

      driftLabel:
        "No meaningful drift",

      nextFocus:
        "Continue the current implementation path.",

      baseRecommendationLabel:
        "continue-project-work",

      adaptiveRecommendationLabel:
        "continue-project-work",

      observationCount:
        5,

      comparableObservationCount:
        4,

      observationCountLabel:
        "4 of 5 observations were comparable.",

      primarySignalTitle:
        "Stable implementation direction",

      primarySignalDescription:
        "Recent Runtime observations continue to support the current implementation direction.",

      primaryRiskTitle:
        null,

      primaryRiskDescription:
        null,

      integrationStatusLabel:
        "Analysis complete",

      integrationReasonLabel:
        "All available recommendation analysis stages completed.",

      completedStageCount:
        5,

      totalStageCount:
        5,

      completedStageLabel:
        "5 of 5 integration stages completed.",

      warnings: [],

      tone:
        "stable",

      ...overrides,
    };

  return presentation;
}