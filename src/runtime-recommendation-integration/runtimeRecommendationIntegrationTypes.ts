import type { RuntimeNextAction } from "../runtime-next-action/runtimeNextActionTypes";

import type {
    CompareBaseAndAdaptiveRuntimeRecommendationsResult,
} from "../runtime-recommendation-evolution/compareBaseAndAdaptiveRuntimeRecommendations";

import type {
    RuntimeRecommendationAdaptiveObservationSummary,
} from "../runtime-recommendation-evolution/createAdaptiveRecommendationObservationSummary";

import type {
    CreateRuntimeExecutiveSummaryResult,
} from "../runtime-recommendation-evolution/createRuntimeExecutiveSummary";

/**
 * Describes the overall completeness of the Runtime Recommendation
 * Integration result.
 *
 * complete:
 * Every required Recommendation Evolution source is available and the
 * Executive Summary is complete.
 *
 * partial:
 * At least one useful source is available, but one or more required
 * integration sources are missing or the Executive Summary is partial.
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
 * PR-RI01 defines only the contract for these stages.
 * It does not execute the stages. Pipeline execution is introduced
 * separately by PR-RI02.
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
 */
export type RuntimeRecommendationIntegrationResult = {
  runtimeNextAction: RuntimeNextAction | null;

  recommendationComparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult | null;

  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;

  executiveSummaryResult: CreateRuntimeExecutiveSummaryResult;

  diagnostics: RuntimeRecommendationIntegrationDiagnostics;
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
 * - persist Recommendation observations.
 *
 * Those orchestration responsibilities belong to later integration
 * stages.
 */
export type CreateRuntimeRecommendationIntegrationResultParams = {
  runtimeNextAction: RuntimeNextAction | null;

  recommendationComparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult | null;

  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;

  executiveSummaryResult: CreateRuntimeExecutiveSummaryResult;

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
   * Summary diagnostics, remove blank values, and remove duplicates.
   */
  warnings?: string[];
};