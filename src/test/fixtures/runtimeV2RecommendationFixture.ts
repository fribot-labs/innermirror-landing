import type {
    RuntimeV2Recommendation,
    RuntimeV2RecommendationComparison,
    RuntimeV2RecommendationEvolution,
    RuntimeV2RecommendationIntegrationResult,
    RuntimeV2RecommendationObservation,
    RuntimeV2RecommendationPrediction,
    RuntimeV2RecommendationState,
    RuntimeV2RecommendationTimeline,
} from "../../types/runtimeV2Recommendation";

export const RUNTIME_V2_RECOMMENDATION_FIXTURE_ID =
  "recommendation-ri11-001";

export const RUNTIME_V2_RECOMMENDATION_FIXTURE_PROJECT_ID =
  "innermirror-landing";

export const RUNTIME_V2_RECOMMENDATION_FIXTURE_ANALYSIS_ID =
  "analysis-ri11-001";

export const RUNTIME_V2_RECOMMENDATION_FIXTURE_CREATED_AT =
  "2026-08-01T09:00:00.000Z";

export const RUNTIME_V2_RECOMMENDATION_FIXTURE_OBSERVED_AT =
  "2026-08-01T09:30:00.000Z";

export const RUNTIME_V2_RECOMMENDATION_FIXTURE_PREDICTED_AT =
  "2026-08-01T10:00:00.000Z";

/**
 * Creates a complete Runtime V2 Recommendation fixture.
 */
export function createRuntimeV2RecommendationFixture(
  overrides:
    Partial<RuntimeV2Recommendation> = {}
): RuntimeV2Recommendation {
  const recommendation = {
    id:
      RUNTIME_V2_RECOMMENDATION_FIXTURE_ID,

    projectId:
      RUNTIME_V2_RECOMMENDATION_FIXTURE_PROJECT_ID,

    direction:
      "runtime-stabilization",

    title:
      "Stabilize Runtime Recommendation Integration",

    summary:
      "Connect the private Runtime Recommendation result to the Landing presentation boundary.",

    recommendedAction:
      "Bind Runtime V2 Recommendation data before expanding the visible interface.",

    recommendedSteps: [
      "Add the Runtime V2 Recommendation transport contract.",
      "Create a Landing presentation adapter.",
      "Bind the presentation to RuntimeV2ResultPanel.",
    ],

    rationale:
      "Recommendation Intelligence is now produced by Runtime V2 but is not yet visible through the Landing data path.",

    priority:
      "high",

    confidence:
      "high",

    evidence: [
      {
        id:
          "strategy-recommendation",

        source:
          "strategy",

        label:
          "Strategy Recommendation",

        summary:
          "Runtime recommends stabilizing the Recommendation integration boundary.",

        confidence:
          "high",
      },

      {
        id:
          "project-identity",

        source:
          "project-identity",

        label:
          "Project Identity",

        summary:
          "The project is currently building Runtime intelligence integration.",

        confidence:
          "high",
      },
    ],

    origin: {
      source:
        "runtime-v2",

      generator:
        "runtime-v2-recommendation-pipeline",

      trigger:
        "combined",

      analysisId:
        RUNTIME_V2_RECOMMENDATION_FIXTURE_ANALYSIS_ID,
    },

    createdAt:
      RUNTIME_V2_RECOMMENDATION_FIXTURE_CREATED_AT,

    ...overrides,
  } satisfies RuntimeV2Recommendation;

  return recommendation;
}

/**
 * Creates a Recommendation lifecycle State fixture.
 */
export function createRuntimeV2RecommendationStateFixture(
  overrides:
    Partial<RuntimeV2RecommendationState> = {}
): RuntimeV2RecommendationState {
  const state = {
    recommendationId:
      RUNTIME_V2_RECOMMENDATION_FIXTURE_ID,

    projectId:
      RUNTIME_V2_RECOMMENDATION_FIXTURE_PROJECT_ID,

    status:
      "current",

    createdAt:
      RUNTIME_V2_RECOMMENDATION_FIXTURE_CREATED_AT,

    updatedAt:
      RUNTIME_V2_RECOMMENDATION_FIXTURE_CREATED_AT,

    ...overrides,
  } satisfies RuntimeV2RecommendationState;

  return state;
}

/**
 * Creates a chronological Recommendation Timeline fixture.
 *
 * Recommendation and State may be supplied so that the Timeline
 * keeps the same IDs as an overridden Integration result.
 */
export function createRuntimeV2RecommendationTimelineFixture(
  overrides:
    Partial<RuntimeV2RecommendationTimeline> = {},

  recommendation:
    RuntimeV2Recommendation =
      createRuntimeV2RecommendationFixture(),

  state:
    RuntimeV2RecommendationState =
      createRuntimeV2RecommendationStateFixture({
        recommendationId:
          recommendation.id,

        projectId:
          recommendation.projectId,

        createdAt:
          recommendation.createdAt,

        updatedAt:
          recommendation.createdAt,
      })
): RuntimeV2RecommendationTimeline {
  const timeline = {
    projectId:
      recommendation.projectId,

    entries: [
      {
        recommendation,
        state,
      },
    ],

    currentRecommendationId:
      recommendation.id,

    generatedAt:
      recommendation.createdAt,

    ...overrides,
  } satisfies RuntimeV2RecommendationTimeline;

  return timeline;
}

/**
 * Creates a Recommendation Comparison fixture.
 */
export function createRuntimeV2RecommendationComparisonFixture(
  overrides:
    Partial<RuntimeV2RecommendationComparison> = {},

  recommendation:
    RuntimeV2Recommendation =
      createRuntimeV2RecommendationFixture()
): RuntimeV2RecommendationComparison {
  const comparison = {
    currentRecommendationId:
      recommendation.id,

    changeType:
      "initial",

    currentDirection:
      recommendation.direction,

    summary:
      "This is the first Recommendation in the current project Timeline.",

    changedFields:
      [],

    evidence:
      [],

    confidence:
      "high",

    ...overrides,
  } satisfies RuntimeV2RecommendationComparison;

  return comparison;
}

/**
 * Creates a Recommendation Observation fixture.
 */
export function createRuntimeV2RecommendationObservationFixture(
  overrides:
    Partial<RuntimeV2RecommendationObservation> = {},

  recommendation:
    RuntimeV2Recommendation =
      createRuntimeV2RecommendationFixture()
): RuntimeV2RecommendationObservation {
  const observation = {
    recommendationId:
      recommendation.id,

    alignment:
      "aligned",

    summary:
      "Recent project activity follows the Runtime stabilization direction.",

    alignedEvidence: [
      {
        id:
          "pull-request-ri11",

        source:
          "project-history",

        label:
          "PR-RI11",

        summary:
          "Landing Recommendation data binding is being implemented.",

        confidence:
          "high",
      },
    ],

    conflictingEvidence:
      [],

    missingEvidence:
      [],

    confidence:
      "high",

    observedAt:
      RUNTIME_V2_RECOMMENDATION_FIXTURE_OBSERVED_AT,

    ...overrides,
  } satisfies RuntimeV2RecommendationObservation;

  return observation;
}

/**
 * Creates a Recommendation Evolution fixture.
 */
export function createRuntimeV2RecommendationEvolutionFixture(
  overrides:
    Partial<RuntimeV2RecommendationEvolution> = {},

  recommendation:
    RuntimeV2Recommendation =
      createRuntimeV2RecommendationFixture()
): RuntimeV2RecommendationEvolution {
  const evolution = {
    projectId:
      recommendation.projectId,

    pattern:
      "early-formation",

    summary:
      "The Recommendation direction is beginning to form.",

    currentDirection:
      recommendation.direction,

    transitionCount:
      0,

    evidence:
      [],

    confidence:
      "medium",

    ...overrides,
  } satisfies RuntimeV2RecommendationEvolution;

  return evolution;
}

/**
 * Creates a Runtime V2 Recommendation Prediction fixture.
 */
export function createRuntimeV2RecommendationPredictionFixture(
  overrides:
    Partial<RuntimeV2RecommendationPrediction> = {},

  recommendation:
    RuntimeV2Recommendation =
      createRuntimeV2RecommendationFixture()
): RuntimeV2RecommendationPrediction {
  const prediction = {
    projectId:
      recommendation.projectId,

    currentRecommendationId:
      recommendation.id,

    likelyNextDirection:
      "ux-stabilization",

    likelyNextDirectionLabel:
      "UX Stabilization",

    rationale:
      "If the Runtime data boundary remains stable, the next likely concern is presentation quality.",

    conditions: [
      "Runtime Recommendation data remains available.",
      "Landing presentation continues to use the new transport contract.",
    ],

    evidence: [
      {
        id:
          "prediction-evidence-ri11",

        source:
          "recommendation-evolution",

        label:
          "Recommendation Evolution",

        summary:
          "Integration stabilization commonly precedes UX refinement.",

        confidence:
          "medium",
      },
    ],

    confidence:
      "medium",

    generatedAt:
      RUNTIME_V2_RECOMMENDATION_FIXTURE_PREDICTED_AT,

    ...overrides,
  } satisfies RuntimeV2RecommendationPrediction;

  return prediction;
}

export type CreateRuntimeV2RecommendationResultFixtureOptions = {
  recommendationOverrides?:
    Partial<RuntimeV2Recommendation>;

  stateOverrides?:
    Partial<RuntimeV2RecommendationState>;

  timelineOverrides?:
    Partial<RuntimeV2RecommendationTimeline>;

  comparisonOverrides?:
    Partial<RuntimeV2RecommendationComparison>;

  observationOverrides?:
    Partial<RuntimeV2RecommendationObservation>;

  evolutionOverrides?:
    Partial<RuntimeV2RecommendationEvolution>;

  predictionOverrides?:
    Partial<RuntimeV2RecommendationPrediction>;

  /**
   * Prediction is excluded by default because an initial
   * Recommendation does not normally produce Predictive Intelligence.
   */
  includePrediction?:
    boolean;

  /**
   * Allows optional intelligence layers to be omitted for
   * fallback and backward-compatibility tests.
   */
  includeTimeline?:
    boolean;

  includeComparison?:
    boolean;

  includeObservation?:
    boolean;

  includeEvolution?:
    boolean;
};

/**
 * Creates a complete Runtime V2 Recommendation Integration result.
 *
 * Defaults represent the first Recommendation:
 *
 * - current state
 * - one Timeline entry
 * - initial Comparison
 * - aligned Observation
 * - early-formation Evolution
 * - no Prediction
 */
export function createRuntimeV2RecommendationResultFixture(
  options:
    CreateRuntimeV2RecommendationResultFixtureOptions = {}
): RuntimeV2RecommendationIntegrationResult {
  const recommendation =
    createRuntimeV2RecommendationFixture(
      options.recommendationOverrides
    );

  const state =
    createRuntimeV2RecommendationStateFixture({
      recommendationId:
        recommendation.id,

      projectId:
        recommendation.projectId,

      createdAt:
        recommendation.createdAt,

      updatedAt:
        recommendation.createdAt,

      ...options.stateOverrides,
    });

  const timeline =
    createRuntimeV2RecommendationTimelineFixture(
      options.timelineOverrides,
      recommendation,
      state
    );

  const comparison =
    createRuntimeV2RecommendationComparisonFixture(
      options.comparisonOverrides,
      recommendation
    );

  const observation =
    createRuntimeV2RecommendationObservationFixture(
      options.observationOverrides,
      recommendation
    );

  const evolution =
    createRuntimeV2RecommendationEvolutionFixture(
      options.evolutionOverrides,
      recommendation
    );

  const prediction =
    createRuntimeV2RecommendationPredictionFixture(
      options.predictionOverrides,
      recommendation
    );

  return {
    currentRecommendation:
      recommendation,

    state,

    ...(
      options.includeTimeline ===
      false
        ? {}
        : {
            timeline,
          }
    ),

    ...(
      options.includeComparison ===
      false
        ? {}
        : {
            comparison,
          }
    ),

    ...(
      options.includeObservation ===
      false
        ? {}
        : {
            observation,
          }
    ),

    ...(
      options.includeEvolution ===
      false
        ? {}
        : {
            evolution,
          }
    ),

    ...(
      options.includePrediction
        ? {
            predictiveIntelligenceResult:
              prediction,
          }
        : {}
    ),
  };
}