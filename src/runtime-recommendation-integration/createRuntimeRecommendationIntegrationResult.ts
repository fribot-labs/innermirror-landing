import {
    cloneRuntimeExecutiveSummary,
    cloneRuntimeExecutiveSummaryDiagnostics,
    cloneRuntimeExecutiveSummaryPolicy,
} from "../runtime-recommendation-evolution/createRuntimeExecutiveSummary";

import { normalizeGeneratedAt } from "../runtime-recommendation-evolution/runtimeRecommendationMath";

import type {
    CreateRuntimeExecutiveSummaryResult,
    RuntimeExecutiveSummaryStatus,
} from "../runtime-recommendation-evolution/createRuntimeExecutiveSummary";

import type {
    CreateRuntimeRecommendationIntegrationResultParams,
    RuntimeRecommendationIntegrationAvailability,
    RuntimeRecommendationIntegrationDiagnostics,
    RuntimeRecommendationIntegrationReason,
    RuntimeRecommendationIntegrationResult,
    RuntimeRecommendationIntegrationStage,
    RuntimeRecommendationIntegrationStatus,
} from "./runtimeRecommendationIntegrationTypes";

export const RUNTIME_RECOMMENDATION_INTEGRATION_STAGES:
  readonly RuntimeRecommendationIntegrationStage[] = [
    "runtime-next-action",
    "recommendation-comparison",
    "observation-summary",
    "executive-summary",
  ];

export const TOTAL_RUNTIME_RECOMMENDATION_INTEGRATION_STAGE_COUNT =
  RUNTIME_RECOMMENDATION_INTEGRATION_STAGES.length;

/**
 * Assembles existing Runtime Recommendation Evolution results into the
 * official Runtime Recommendation Integration Contract.
 *
 * This function does not execute Recommendation Evolution algorithms.
 * It only:
 *
 * - resolves source availability;
 * - determines integration status and reason;
 * - records completed stages;
 * - combines and normalizes warnings;
 * - creates integration diagnostics;
 * - returns defensively cloned result values.
 */
export function createRuntimeRecommendationIntegrationResult({
  runtimeNextAction,
  recommendationComparison,
  observationSummary,
  executiveSummaryResult,
  generatedAt,
  warnings,
}: CreateRuntimeRecommendationIntegrationResultParams):
  RuntimeRecommendationIntegrationResult {
  const availability =
    resolveRuntimeRecommendationIntegrationAvailability({
      runtimeNextActionAvailable: runtimeNextAction !== null,
      recommendationComparison,
      observationSummaryAvailable: observationSummary !== null,
      executiveSummaryResult,
    });

  const status = resolveRuntimeRecommendationIntegrationStatus({
    availability,
    executiveSummaryStatus:
      executiveSummaryResult.executiveSummary.status,
  });

  const reason = resolveRuntimeRecommendationIntegrationReason({
    availability,
    status,
    executiveSummaryStatus:
      executiveSummaryResult.executiveSummary.status,
  });

  const completedStages =
    resolveRuntimeRecommendationIntegrationCompletedStages(
      availability
    );

  const normalizedWarnings =
    collectRuntimeRecommendationIntegrationWarnings({
      warnings,
      executiveSummaryResult,
    });

  const diagnostics: RuntimeRecommendationIntegrationDiagnostics = {
    generatedAt: normalizeGeneratedAt(generatedAt),
    status,
    reason,
    availability: {
      ...availability,
    },
    completedStages: [...completedStages],
    completedStageCount: completedStages.length,
    totalStageCount:
      TOTAL_RUNTIME_RECOMMENDATION_INTEGRATION_STAGE_COUNT,
    warningCount: normalizedWarnings.length,
    warnings: [...normalizedWarnings],
  };

  const result: RuntimeRecommendationIntegrationResult = {
    runtimeNextAction:
      cloneRuntimeRecommendationIntegrationValue(
        runtimeNextAction
      ),

    recommendationComparison:
      cloneRuntimeRecommendationIntegrationValue(
        recommendationComparison
      ),

    observationSummary:
      cloneRuntimeRecommendationIntegrationValue(
        observationSummary
      ),

    executiveSummaryResult:
      cloneCreateRuntimeExecutiveSummaryResult(
        executiveSummaryResult
      ),

    diagnostics:
      cloneRuntimeRecommendationIntegrationDiagnostics(
        diagnostics
      ),
  };

  return cloneRuntimeRecommendationIntegrationResult(result);
}

/**
 * Resolves the availability of each Integration Contract source.
 *
 * Base and Adaptive Recommendation availability is derived from Winner
 * snapshots rather than candidate IDs because a candidate identifier
 * alone does not guarantee that a usable Recommendation snapshot exists.
 */
export function resolveRuntimeRecommendationIntegrationAvailability({
  runtimeNextActionAvailable,
  recommendationComparison,
  observationSummaryAvailable,
  executiveSummaryResult,
}: {
  runtimeNextActionAvailable: boolean;
  recommendationComparison:
    CreateRuntimeRecommendationIntegrationResultParams["recommendationComparison"];
  observationSummaryAvailable: boolean;
  executiveSummaryResult: CreateRuntimeExecutiveSummaryResult;
}): RuntimeRecommendationIntegrationAvailability {
  return {
    runtimeNextActionAvailable,
    recommendationComparisonAvailable:
      recommendationComparison !== null,
    observationSummaryAvailable,
    executiveSummaryAvailable:
      executiveSummaryResult !== null,
    baseRecommendationAvailable:
      recommendationComparison?.baseWinnerSnapshot != null,
    adaptiveRecommendationAvailable:
      recommendationComparison?.adaptiveWinnerSnapshot != null,
  };
}

/**
 * Resolves the overall Integration status.
 *
 * Status rules:
 *
 * 1. When none of the three source stages is available, the result is
 *    insufficient-data.
 * 2. When any source stage is unavailable, the result is partial.
 * 3. When the Executive Summary is not complete, the result is partial.
 * 4. Otherwise, the Integration result is complete.
 */
export function resolveRuntimeRecommendationIntegrationStatus({
  availability,
  executiveSummaryStatus,
}: {
  availability: RuntimeRecommendationIntegrationAvailability;
  executiveSummaryStatus: RuntimeExecutiveSummaryStatus;
}): RuntimeRecommendationIntegrationStatus {
  const sourceEvidenceAvailable =
    availability.runtimeNextActionAvailable ||
    availability.recommendationComparisonAvailable ||
    availability.observationSummaryAvailable;

  if (!sourceEvidenceAvailable) {
    return "insufficient-data";
  }

  if (
    !availability.runtimeNextActionAvailable ||
    !availability.recommendationComparisonAvailable ||
    !availability.observationSummaryAvailable ||
    !availability.executiveSummaryAvailable ||
    executiveSummaryStatus !== "complete"
  ) {
    return "partial";
  }

  return "complete";
}

/**
 * Explains the Integration status according to the earliest unavailable
 * or incomplete stage.
 */
export function resolveRuntimeRecommendationIntegrationReason({
  availability,
  status,
  executiveSummaryStatus,
}: {
  availability: RuntimeRecommendationIntegrationAvailability;
  status: RuntimeRecommendationIntegrationStatus;
  executiveSummaryStatus: RuntimeExecutiveSummaryStatus;
}): RuntimeRecommendationIntegrationReason {
  if (status === "insufficient-data") {
    return "no-recommendation-integration-evidence";
  }

  if (!availability.runtimeNextActionAvailable) {
    return "runtime-next-action-unavailable";
  }

  if (!availability.recommendationComparisonAvailable) {
    return "recommendation-comparison-unavailable";
  }

  if (!availability.observationSummaryAvailable) {
    return "observation-summary-unavailable";
  }

  if (
    !availability.executiveSummaryAvailable ||
    executiveSummaryStatus !== "complete"
  ) {
    return "executive-summary-partial";
  }

  return "recommendation-integration-complete";
}

/**
 * Returns all Integration stages represented by available results.
 *
 * A stage is considered completed when its result object is available.
 * An Executive Summary with partial or insufficient-data status still
 * represents a completed Executive Summary stage because the summary
 * generator produced a valid interpretation result.
 */
export function resolveRuntimeRecommendationIntegrationCompletedStages(
  availability: RuntimeRecommendationIntegrationAvailability
): RuntimeRecommendationIntegrationStage[] {
  const completedStages:
    RuntimeRecommendationIntegrationStage[] = [];

  if (availability.runtimeNextActionAvailable) {
    completedStages.push("runtime-next-action");
  }

  if (availability.recommendationComparisonAvailable) {
    completedStages.push("recommendation-comparison");
  }

  if (availability.observationSummaryAvailable) {
    completedStages.push("observation-summary");
  }

  if (availability.executiveSummaryAvailable) {
    completedStages.push("executive-summary");
  }

  return completedStages;
}

/**
 * Combines caller warnings with Executive Summary diagnostics.
 *
 * Warning normalization:
 *
 * - trims surrounding whitespace;
 * - removes blank warnings;
 * - removes duplicates;
 * - preserves the first occurrence order.
 */
export function collectRuntimeRecommendationIntegrationWarnings({
  warnings,
  executiveSummaryResult,
}: {
  warnings?: string[];
  executiveSummaryResult: CreateRuntimeExecutiveSummaryResult;
}): string[] {
  const collectedWarnings = [
    ...(warnings ?? []),
    ...executiveSummaryResult.diagnostics.warnings,
  ];

  return [
    ...new Set(
      collectedWarnings
        .filter(
          (warning): warning is string =>
            typeof warning === "string"
        )
        .map((warning) => warning.trim())
        .filter((warning) => warning.length > 0)
    ),
  ];
}

/**
 * Creates a defensive clone of an Executive Summary result by reusing
 * the clone helpers defined by its owning module.
 */
export function cloneCreateRuntimeExecutiveSummaryResult(
  result: CreateRuntimeExecutiveSummaryResult
): CreateRuntimeExecutiveSummaryResult {
  return {
    executiveSummary:
      cloneRuntimeExecutiveSummary(result.executiveSummary),

    diagnostics:
      cloneRuntimeExecutiveSummaryDiagnostics(
        result.diagnostics
      ),

    policy:
      cloneRuntimeExecutiveSummaryPolicy(result.policy),
  };
}

/**
 * Creates a defensive clone of Integration diagnostics.
 */
export function cloneRuntimeRecommendationIntegrationDiagnostics(
  diagnostics: RuntimeRecommendationIntegrationDiagnostics
): RuntimeRecommendationIntegrationDiagnostics {
  return {
    ...diagnostics,

    availability: {
      ...diagnostics.availability,
    },

    completedStages: [
      ...diagnostics.completedStages,
    ],

    warnings: [
      ...diagnostics.warnings,
    ],
  };
}

/**
 * Creates a defensive clone of the complete Integration result.
 */
export function cloneRuntimeRecommendationIntegrationResult(
  result: RuntimeRecommendationIntegrationResult
): RuntimeRecommendationIntegrationResult {
  return {
    runtimeNextAction:
      cloneRuntimeRecommendationIntegrationValue(
        result.runtimeNextAction
      ),

    recommendationComparison:
      cloneRuntimeRecommendationIntegrationValue(
        result.recommendationComparison
      ),

    observationSummary:
      cloneRuntimeRecommendationIntegrationValue(
        result.observationSummary
      ),

    executiveSummaryResult:
      cloneCreateRuntimeExecutiveSummaryResult(
        result.executiveSummaryResult
      ),

    diagnostics:
      cloneRuntimeRecommendationIntegrationDiagnostics(
        result.diagnostics
      ),
  };
}

/**
 * Clones JSON-compatible Runtime Recommendation values without coupling
 * the Integration module to the internal fields of each domain result.
 *
 * Recommendation Evolution domain results are expected to contain plain
 * objects, arrays, primitives, and nullable values.
 */
function cloneRuntimeRecommendationIntegrationValue<T>(
  value: T
): T {
  if (
    value === null ||
    value === undefined ||
    typeof value !== "object"
  ) {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      cloneRuntimeRecommendationIntegrationValue(item)
    ) as T;
  }

  const source = value as Record<string, unknown>;
  const clone: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(source)) {
    clone[key] =
      cloneRuntimeRecommendationIntegrationValue(item);
  }

  return clone as T;
}