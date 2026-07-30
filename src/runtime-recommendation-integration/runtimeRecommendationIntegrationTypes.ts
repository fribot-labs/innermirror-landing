import type {
  RuntimeNextAction,
} from "../runtime-next-action/runtimeNextActionTypes";

import type {
  CompareBaseAndAdaptiveRuntimeRecommendationsResult,
} from "../runtime-recommendation-evolution/compareBaseAndAdaptiveRuntimeRecommendations";

import type {
  RuntimeRecommendationAdaptiveObservationSummary,
} from "../runtime-recommendation-evolution/createAdaptiveRecommendationObservationSummary";

import type {
  CreateRuntimeExecutiveSummaryResult,
} from "../runtime-recommendation-evolution/createRuntimeExecutiveSummary";

import type {
  RecommendationPredictiveIntelligenceUpdateResult,
} from "../runtime-recommendation-evolution";

/**
 * Describes the overall completeness of the Runtime Recommendation
 * Integration result.
 *
 * complete:
 * Every required Recommendation Evolution source is available, the
 * Executive Summary is complete, and Predictive Intelligence is available.
 *
 * partial:
 * At least one useful source is available, but one or more required
 * integration sources are missing, the Executive Summary is partial,
 * or Predictive Intelligence is unavailable.
 *
 * insufficient-data:
 * No meaningful Runtime Recommendation Integration evidence is available.
 */
export type RuntimeRecommendationIntegrationStatus =
  | "complete"
  | "partial"
  | "insufficient-data";

/**
 * Explains why the Integration result received its current status.
 *
 * The reason is resolved according to the earliest unavailable stage:
 *
 * Runtime Next Action
 * → Recommendation Comparison
 * → Observation Summary
 * → Executive Summary
 * → Predictive Intelligence
 */
export type RuntimeRecommendationIntegrationReason =
  | "recommendation-integration-complete"
  | "runtime-next-action-unavailable"
  | "recommendation-comparison-unavailable"
  | "observation-summary-unavailable"
  | "executive-summary-partial"
  | "no-recommendation-integration-evidence";

/**
 * Identifies each major stage represented by the Integration Contract.
 *
 * The contract records completed domain stages without executing them.
 * Pipeline execution remains the responsibility of the Integration
 * Pipeline.
 */
export type RuntimeRecommendationIntegrationStage =
  | "runtime-next-action"
  | "recommendation-comparison"
  | "observation-summary"
  | "executive-summary";

/**
 * Describes which Recommendation Integration sources are available.
 *
 * Base and Adaptive Recommendation availability is derived from the
 * Recommendation Comparison snapshots rather than candidate identifiers
 * alone.
 *
 * Predictive Intelligence availability represents the presence of a
 * validated Predictive Intelligence Update Result. The semantic state
 * of that Prediction remains part of the Predictive domain result.
 */
export type RuntimeRecommendationIntegrationAvailability = {
  runtimeNextActionAvailable: boolean;
  recommendationComparisonAvailable: boolean;
  observationSummaryAvailable: boolean;
  executiveSummaryAvailable: boolean;
  baseRecommendationAvailable: boolean;
  adaptiveRecommendationAvailable: boolean;
};

/**
 * Diagnostics describing the state and completeness of the assembled
 * Runtime Recommendation Integration result.
 *
 * Diagnostics are kept separate from domain results so Runtime
 * orchestration and developer tooling can inspect integration health
 * without modifying Recommendation Evolution domain objects.
 */
export type RuntimeRecommendationIntegrationDiagnostics = {
  generatedAt: string;

  status: RuntimeRecommendationIntegrationStatus;
  reason: RuntimeRecommendationIntegrationReason;

  availability: RuntimeRecommendationIntegrationAvailability;

  completedStages: RuntimeRecommendationIntegrationStage[];
  completedStageCount: number;
  totalStageCount: number;

  warningCount: number;
  warnings: string[];
};

/**
 * Official Integration Contract between the Runtime execution layer
 * and Recommendation Evolution.
 *
 * This result preserves the existing domain result types rather than
 * redefining or flattening their fields.
 *
 * executiveSummaryResult is intentionally non-null. The Executive
 * Summary generator can represent partial and insufficient-data states
 * as valid summary results even when earlier sources are unavailable.
 *
 * predictiveIntelligenceResult is nullable because Predictive
 * Intelligence may not yet have enough historical evidence or may not
 * have been executed by the current Integration Pipeline.
 */
export type RuntimeRecommendationIntegrationResult = {
  runtimeNextAction: RuntimeNextAction | null;

  recommendationComparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult | null;

  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;

  executiveSummaryResult:
    CreateRuntimeExecutiveSummaryResult;

  predictiveIntelligenceResult:
    RecommendationPredictiveIntelligenceUpdateResult | null;

  diagnostics:
    RuntimeRecommendationIntegrationDiagnostics;
};

/**
 * Parameters accepted by the Integration Result assembler.
 *
 * This contract accepts results that have already been produced by
 * their respective Recommendation Evolution stages.
 *
 * It does not:
 *
 * - create a Runtime Next Action;
 * - calculate Base or Adaptive Recommendations;
 * - compare Recommendation Winners;
 * - create an Observation Summary;
 * - create an Executive Summary;
 * - create Predictive Intelligence;
 * - persist Recommendation observations.
 *
 * Those orchestration responsibilities belong to the Integration
 * Pipeline.
 */
export type CreateRuntimeRecommendationIntegrationResultParams = {
  runtimeNextAction: RuntimeNextAction | null;

  recommendationComparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult | null;

  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;

  executiveSummaryResult:
    CreateRuntimeExecutiveSummaryResult;

  predictiveIntelligenceResult:
    RecommendationPredictiveIntelligenceUpdateResult | null;

  /**
   * Optional deterministic timestamp used by tests or callers.
   *
   * When omitted, the result assembler should normalize the current
   * generation time through the existing normalizeGeneratedAt helper.
   */
  generatedAt?: string;

  /**
   * Optional warnings produced by the caller or an earlier integration
   * boundary.
   *
   * The result assembler should combine these warnings with Executive
   * Summary and Predictive Intelligence diagnostics, remove blank
   * values, and remove duplicates.
   */
  warnings?: string[];
};