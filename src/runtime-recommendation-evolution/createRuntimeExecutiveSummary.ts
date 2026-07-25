import type { RuntimeNextAction } from "../runtime-next-action/runtimeNextActionTypes";
import type { CompareBaseAndAdaptiveRuntimeRecommendationsResult } from "./compareBaseAndAdaptiveRuntimeRecommendations";
import type {
    RuntimeRecommendationAdaptiveObservationSummary,
    RuntimeRecommendationAdaptiveObservationSummaryItem,
} from "./createAdaptiveRecommendationObservationSummary";
import { normalizeGeneratedAt } from "./runtimeRecommendationMath";

export type RuntimeExecutiveSummaryPolicy = {
  includeObservationMetrics: boolean;
  includeRecommendationComparison: boolean;
  maximumOverviewSentenceCount: number;
  decimalPlaces: number;
};

export type PartialRuntimeExecutiveSummaryPolicy =
  Partial<RuntimeExecutiveSummaryPolicy>;

export const DEFAULT_RUNTIME_EXECUTIVE_SUMMARY_POLICY:
  RuntimeExecutiveSummaryPolicy = {
    includeObservationMetrics: true,
    includeRecommendationComparison: true,
    maximumOverviewSentenceCount: 3,
    decimalPlaces: 2,
  };

export type RuntimeExecutiveSummaryStatus =
  | "complete"
  | "partial"
  | "insufficient-data";

export type RuntimeExecutiveSummaryReason =
  | "runtime-state-summarized"
  | "runtime-state-partially-summarized"
  | "runtime-next-action-unavailable"
  | "recommendation-comparison-unavailable"
  | "evolution-summary-unavailable"
  | "no-runtime-summary-evidence";

export type RuntimeExecutiveSummaryState =
  | "insufficient-data"
  | "observing"
  | "stable"
  | "changing"
  | "attention-required";

export type RuntimeExecutiveRecommendationState =
  | "unavailable"
  | "base-only"
  | "adaptive-only"
  | "aligned"
  | "adaptive-different"
  | "adaptive-emerging"
  | "adaptive-stable";

export type RuntimeExecutiveSummarySignalCategory =
  | "runtime"
  | "recommendation"
  | "stability"
  | "drift"
  | "confidence"
  | "evidence";

export type RuntimeExecutiveSummarySignalSeverity =
  | "info"
  | "positive"
  | "warning"
  | "critical";

export type RuntimeExecutiveSummarySignal = {
  category: RuntimeExecutiveSummarySignalCategory;
  severity: RuntimeExecutiveSummarySignalSeverity;
  title: string;
  description: string;
};

export type RuntimeExecutiveSummary = {
  headline: string;
  overview: string;
  runtimeState: RuntimeExecutiveSummaryState;
  recommendationState: RuntimeExecutiveRecommendationState;
  currentAction: string | null;
  baseRecommendationId: string | null;
  adaptiveRecommendationId: string | null;
  recommendationChanged: boolean | null;
  observationCount: number | null;
  comparableObservationCount: number | null;
  confidenceLevel: string | null;
  stabilityLevel: string | null;
  driftLevel: string | null;
  confidenceScore: number | null;
  stabilityRate: number | null;
  driftScore: number | null;
  primarySignal: RuntimeExecutiveSummarySignal | null;
  primaryRisk: RuntimeExecutiveSummarySignal | null;
  nextFocus: string;
  status: RuntimeExecutiveSummaryStatus;
  reason: RuntimeExecutiveSummaryReason;
};

export type RuntimeExecutiveSummaryDiagnostics = {
  generatedAt: string;
  runtimeNextActionAvailable: boolean;
  recommendationComparisonAvailable: boolean;
  baseRecommendationAvailable: boolean;
  adaptiveRecommendationAvailable: boolean;
  observationSummaryAvailable: boolean;
  observationSummaryStatus: string | null;
  warningCount: number;
  warnings: string[];
};

export type CreateRuntimeExecutiveSummaryResult = {
  executiveSummary: RuntimeExecutiveSummary;
  diagnostics: RuntimeExecutiveSummaryDiagnostics;
  policy: RuntimeExecutiveSummaryPolicy;
};

export type CreateRuntimeExecutiveSummaryParams = {
  runtimeNextAction: RuntimeNextAction | null;
  recommendationComparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult | null;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
  policy?: PartialRuntimeExecutiveSummaryPolicy;
  generatedAt?: string;
};

type RuntimeExecutiveSummaryAvailability = {
  runtimeNextActionAvailable: boolean;
  recommendationComparisonAvailable: boolean;
  baseRecommendationAvailable: boolean;
  adaptiveRecommendationAvailable: boolean;
  observationSummaryAvailable: boolean;
};

export function createRuntimeExecutiveSummary({
  runtimeNextAction,
  recommendationComparison,
  observationSummary,
  policy,
  generatedAt,
}: CreateRuntimeExecutiveSummaryParams):
  CreateRuntimeExecutiveSummaryResult {
  const normalizedPolicy =
    normalizeRuntimeExecutiveSummaryPolicy(policy);
  const warnings: string[] = [];

  const availability =
    resolveRuntimeExecutiveSummaryAvailability({
      runtimeNextAction,
      recommendationComparison,
      observationSummary,
    });

  validateRuntimeExecutiveSummaryInput({
    recommendationComparison,
    observationSummary,
    warnings,
  });

  const currentAction =
    resolveCurrentRuntimeAction(runtimeNextAction);

  const baseRecommendationId = normalizeCandidateId(
    recommendationComparison?.diagnostics.baseCandidateId ?? null
  );

  const adaptiveRecommendationId = normalizeCandidateId(
    recommendationComparison?.diagnostics.adaptiveCandidateId ?? null
  );

  const recommendationChanged =
    recommendationComparison === null
      ? null
      : recommendationComparison.diagnostics.winnerChanged;

  const recommendationState =
    resolveRuntimeExecutiveRecommendationState({
      baseRecommendationId,
      adaptiveRecommendationId,
      recommendationComparison,
      observationSummary,
    });

  const runtimeState = resolveRuntimeExecutiveSummaryState({
    availability,
    recommendationChanged,
    observationSummary,
  });

  const status = resolveRuntimeExecutiveSummaryStatus({
    availability,
    observationSummary,
  });

  const reason = resolveRuntimeExecutiveSummaryReason({
    availability,
    status,
  });

  const headline = createRuntimeExecutiveSummaryHeadline({
    runtimeState,
    recommendationState,
    observationSummary,
  });

  const overview = createRuntimeExecutiveSummaryOverview({
    currentAction,
    recommendationState,
    recommendationChanged,
    observationSummary,
    policy: normalizedPolicy,
  });

  const primarySignal = resolveRuntimeExecutivePrimarySignal({
    runtimeState,
    recommendationState,
    observationSummary,
  });

  const primaryRisk = resolveRuntimeExecutivePrimaryRisk({
    runtimeState,
    observationSummary,
  });

  const nextFocus = createRuntimeExecutiveSummaryNextFocus({
    runtimeState,
    recommendationState,
    observationSummary,
  });

  const executiveSummary: RuntimeExecutiveSummary = {
    headline,
    overview,
    runtimeState,
    recommendationState,
    currentAction,
    baseRecommendationId,
    adaptiveRecommendationId,
    recommendationChanged,
    observationCount: observationSummary?.observationCount ?? null,
    comparableObservationCount:
      observationSummary?.comparableObservationCount ?? null,
    confidenceLevel: resolveConfidenceLevel(observationSummary),
    stabilityLevel: resolveStabilityLevel(observationSummary),
    driftLevel: resolveDriftLevel(observationSummary),
    confidenceScore: normalizeNullableRate(
      observationSummary?.confidenceScore ?? null
    ),
    stabilityRate: normalizeNullableRate(
      observationSummary?.stabilityRate ?? null
    ),
    driftScore: normalizeNullableRate(
      observationSummary?.driftScore ?? null
    ),
    primarySignal,
    primaryRisk,
    nextFocus,
    status,
    reason,
  };

  validateRuntimeExecutiveSummaryResult({
    executiveSummary,
    warnings,
  });

  const diagnostics = createRuntimeExecutiveSummaryDiagnostics({
    generatedAt: normalizeGeneratedAt(generatedAt),
    availability,
    observationSummary,
    warnings,
  });

  return {
    executiveSummary:
      cloneRuntimeExecutiveSummary(executiveSummary),
    diagnostics:
      cloneRuntimeExecutiveSummaryDiagnostics(diagnostics),
    policy:
      cloneRuntimeExecutiveSummaryPolicy(normalizedPolicy),
  };
}

function resolveRuntimeExecutiveSummaryAvailability({
  runtimeNextAction,
  recommendationComparison,
  observationSummary,
}: {
  runtimeNextAction: RuntimeNextAction | null;
  recommendationComparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult | null;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
}): RuntimeExecutiveSummaryAvailability {
  return {
    runtimeNextActionAvailable: runtimeNextAction !== null,
    recommendationComparisonAvailable:
      recommendationComparison !== null,
    baseRecommendationAvailable:
      recommendationComparison?.baseWinnerSnapshot != null,
    adaptiveRecommendationAvailable:
      recommendationComparison?.adaptiveWinnerSnapshot != null,
    observationSummaryAvailable: observationSummary !== null,
  };
}

function resolveRuntimeExecutiveSummaryStatus({
  availability,
  observationSummary,
}: {
  availability: RuntimeExecutiveSummaryAvailability;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
}): RuntimeExecutiveSummaryStatus {
  const availableSourceCount = [
    availability.runtimeNextActionAvailable,
    availability.recommendationComparisonAvailable,
    availability.observationSummaryAvailable,
  ].filter(Boolean).length;

  if (availableSourceCount === 0) {
    return "insufficient-data";
  }

  if (
    observationSummary !== null &&
    observationSummary.status === "insufficient-data" &&
    !availability.runtimeNextActionAvailable &&
    !availability.recommendationComparisonAvailable
  ) {
    return "insufficient-data";
  }

  if (
    availableSourceCount < 3 ||
    observationSummary?.status === "partial" ||
    observationSummary?.status === "insufficient-data"
  ) {
    return "partial";
  }

  return "complete";
}

function resolveRuntimeExecutiveSummaryReason({
  availability,
  status,
}: {
  availability: RuntimeExecutiveSummaryAvailability;
  status: RuntimeExecutiveSummaryStatus;
}): RuntimeExecutiveSummaryReason {
  if (status === "insufficient-data") {
    return "no-runtime-summary-evidence";
  }
  if (!availability.runtimeNextActionAvailable) {
    return "runtime-next-action-unavailable";
  }
  if (!availability.recommendationComparisonAvailable) {
    return "recommendation-comparison-unavailable";
  }
  if (!availability.observationSummaryAvailable) {
    return "evolution-summary-unavailable";
  }
  if (status === "partial") {
    return "runtime-state-partially-summarized";
  }
  return "runtime-state-summarized";
}

function resolveRuntimeExecutiveSummaryState({
  availability,
  recommendationChanged,
  observationSummary,
}: {
  availability: RuntimeExecutiveSummaryAvailability;
  recommendationChanged: boolean | null;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
}): RuntimeExecutiveSummaryState {
  if (
    !availability.runtimeNextActionAvailable &&
    !availability.recommendationComparisonAvailable &&
    !availability.observationSummaryAvailable
  ) {
    return "insufficient-data";
  }

  if (
    observationSummary === null ||
    observationSummary.status === "insufficient-data"
  ) {
    return "observing";
  }

  if (
    hasCriticalObservationRisk(observationSummary) ||
    (
      observationSummary.tone === "cautious" &&
      (
        resolveDriftLevel(observationSummary) === "significant" ||
        resolveStabilityLevel(observationSummary) === "unstable"
      )
    )
  ) {
    return "attention-required";
  }

  if (
    resolveDriftLevel(observationSummary) === "emerging" ||
    recommendationChanged === true
  ) {
    return "changing";
  }

  if (
    (
      observationSummary.tone === "stable" ||
      observationSummary.tone === "strong"
    ) &&
    resolveDriftLevel(observationSummary) === "stable"
  ) {
    return "stable";
  }

  return "observing";
}

function resolveRuntimeExecutiveRecommendationState({
  baseRecommendationId,
  adaptiveRecommendationId,
  recommendationComparison,
  observationSummary,
}: {
  baseRecommendationId: string | null;
  adaptiveRecommendationId: string | null;
  recommendationComparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult | null;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
}): RuntimeExecutiveRecommendationState {
  if (baseRecommendationId === null && adaptiveRecommendationId === null) {
    return "unavailable";
  }
  if (baseRecommendationId !== null && adaptiveRecommendationId === null) {
    return "base-only";
  }
  if (baseRecommendationId === null && adaptiveRecommendationId !== null) {
    return "adaptive-only";
  }
  if (
    recommendationComparison?.diagnostics.sameCandidate === true ||
    baseRecommendationId === adaptiveRecommendationId
  ) {
    return "aligned";
  }

  const stabilityLevel = resolveStabilityLevel(observationSummary);
  if (stabilityLevel === "stable") {
    return "adaptive-stable";
  }
  if (stabilityLevel === "emerging") {
    return "adaptive-emerging";
  }
  return "adaptive-different";
}

function resolveCurrentRuntimeAction(
  runtimeNextAction: RuntimeNextAction | null
): string | null {
  if (runtimeNextAction === null) {
    return null;
  }

  const record = runtimeNextAction as unknown as Record<string, unknown>;
  const candidateKeys = [
    "action",
    "type",
    "nextAction",
    "recommendation",
    "id",
  ];

  for (const key of candidateKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function createRuntimeExecutiveSummaryHeadline({
  runtimeState,
  recommendationState,
  observationSummary,
}: {
  runtimeState: RuntimeExecutiveSummaryState;
  recommendationState: RuntimeExecutiveRecommendationState;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
}): string {
  switch (runtimeState) {
    case "insufficient-data":
      return "Runtime evidence is not yet sufficient for an executive summary.";
    case "attention-required":
      return "Runtime recommendation evolution requires attention.";
    case "changing":
      return "Runtime recommendation behavior is currently changing.";
    case "stable":
      if (recommendationState === "aligned") {
        return "Runtime and Adaptive Recommendation signals remain aligned and stable.";
      }
      if (recommendationState === "adaptive-stable") {
        return "A distinct Adaptive Recommendation pattern is remaining stable in Shadow Mode.";
      }
      return "Runtime recommendation behavior is stable across the available evidence.";
    case "observing":
    default:
      if (observationSummary?.status === "insufficient-data") {
        return "Runtime state is available, but Recommendation Evolution evidence remains limited.";
      }
      if (recommendationState === "base-only") {
        return "Runtime is operating on the Base Recommendation while Adaptive evidence is still unavailable.";
      }
      return "Runtime Recommendation Evolution remains under observation.";
  }
}

function createRuntimeExecutiveSummaryOverview({
  currentAction,
  recommendationState,
  recommendationChanged,
  observationSummary,
  policy,
}: {
  currentAction: string | null;
  recommendationState: RuntimeExecutiveRecommendationState;
  recommendationChanged: boolean | null;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
  policy: RuntimeExecutiveSummaryPolicy;
}): string {
  const sentences: string[] = [];

  sentences.push(
    currentAction !== null
      ? `The current Runtime action is "${currentAction}".`
      : "The current Runtime action is unavailable."
  );

  if (policy.includeRecommendationComparison) {
    sentences.push(
      createRecommendationStateSentence({
        recommendationState,
        recommendationChanged,
      })
    );
  }

  if (observationSummary !== null) {
    sentences.push(
      createObservationSummarySentence({
        observationSummary,
        policy,
      })
    );
  }

  return sentences
    .filter((sentence) => sentence.trim().length > 0)
    .slice(0, policy.maximumOverviewSentenceCount)
    .join(" ");
}

function createRecommendationStateSentence({
  recommendationState,
  recommendationChanged,
}: {
  recommendationState: RuntimeExecutiveRecommendationState;
  recommendationChanged: boolean | null;
}): string {
  switch (recommendationState) {
    case "aligned":
      return "Base and Adaptive Recommendation Winners are aligned.";
    case "adaptive-stable":
      return "The Adaptive Winner differs from the Base Winner but remains stable across accumulated observations.";
    case "adaptive-emerging":
      return "A different Adaptive Winner is beginning to emerge from the observation history.";
    case "adaptive-different":
      return recommendationChanged === true
        ? "Adaptive scoring selected a different Shadow Winner from the applied Base Winner."
        : "Base and Adaptive Recommendation outcomes differ.";
    case "base-only":
      return "Only the Base Recommendation is currently available.";
    case "adaptive-only":
      return "Only an Adaptive Shadow Winner is currently available.";
    case "unavailable":
    default:
      return "Recommendation comparison evidence is unavailable.";
  }
}

function createObservationSummarySentence({
  observationSummary,
  policy,
}: {
  observationSummary: RuntimeRecommendationAdaptiveObservationSummary;
  policy: RuntimeExecutiveSummaryPolicy;
}): string {
  if (!policy.includeObservationMetrics) {
    return observationSummary.primaryInsight;
  }

  const metricParts: string[] = [];
  if (observationSummary.stabilityRate !== null) {
    metricParts.push(
      `stability ${formatPercent({
        value: observationSummary.stabilityRate,
        decimalPlaces: policy.decimalPlaces,
      })}`
    );
  }
  if (observationSummary.driftScore !== null) {
    metricParts.push(
      `Drift ${formatNumber({
        value: observationSummary.driftScore,
        decimalPlaces: policy.decimalPlaces,
      })}`
    );
  }
  if (observationSummary.confidenceScore !== null) {
    metricParts.push(
      `Confidence ${formatNumber({
        value: observationSummary.confidenceScore,
        decimalPlaces: policy.decimalPlaces,
      })}`
    );
  }

  if (metricParts.length === 0) {
    return observationSummary.primaryInsight;
  }

  return (
    `${observationSummary.primaryInsight} ` +
    `Current analytics show ${joinTextParts(metricParts)}.`
  );
}

function resolveRuntimeExecutivePrimarySignal({
  runtimeState,
  recommendationState,
  observationSummary,
}: {
  runtimeState: RuntimeExecutiveSummaryState;
  recommendationState: RuntimeExecutiveRecommendationState;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
}): RuntimeExecutiveSummarySignal | null {
  const strongestObservationSignal =
    observationSummary?.strengths[0] ?? null;

  if (strongestObservationSignal !== null) {
    return mapObservationItemToExecutiveSignal(strongestObservationSignal);
  }

  if (runtimeState === "stable") {
    return {
      category: "runtime",
      severity: "positive",
      title: "Runtime state is stable",
      description:
        "The available Recommendation Evolution evidence does not show a material instability signal.",
    };
  }

  if (recommendationState === "aligned") {
    return {
      category: "recommendation",
      severity: "positive",
      title: "Base and Adaptive Winners are aligned",
      description:
        "Adaptive scoring preserved the same Winner selected by Base scoring.",
    };
  }

  if (observationSummary !== null) {
    return {
      category: "evidence",
      severity: "info",
      title: "Recommendation Evolution evidence is available",
      description: observationSummary.primaryInsight,
    };
  }

  return null;
}

function resolveRuntimeExecutivePrimaryRisk({
  runtimeState,
  observationSummary,
}: {
  runtimeState: RuntimeExecutiveSummaryState;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
}): RuntimeExecutiveSummarySignal | null {
  const highestObservationRisk = observationSummary?.risks[0] ?? null;
  if (highestObservationRisk !== null) {
    return mapObservationItemToExecutiveSignal(highestObservationRisk);
  }

  if (observationSummary?.primaryRisk != null) {
    return {
      category: "evidence",
      severity:
        runtimeState === "attention-required" ? "critical" : "warning",
      title: "Recommendation Evolution requires continued review",
      description: observationSummary.primaryRisk,
    };
  }

  if (runtimeState === "insufficient-data") {
    return {
      category: "evidence",
      severity: "warning",
      title: "Runtime evidence is insufficient",
      description:
        "The available Runtime and Recommendation Evolution sources are not sufficient for a complete executive interpretation.",
    };
  }

  return null;
}

function mapObservationItemToExecutiveSignal(
  item: RuntimeRecommendationAdaptiveObservationSummaryItem
): RuntimeExecutiveSummarySignal {
  return {
    category: mapObservationCategory(item.category),
    severity: item.severity,
    title: item.title,
    description: item.description,
  };
}

function mapObservationCategory(
  category: RuntimeRecommendationAdaptiveObservationSummaryItem["category"]
): RuntimeExecutiveSummarySignalCategory {
  switch (category) {
    case "agreement":
      return "recommendation";
    case "stability":
      return "stability";
    case "drift":
      return "drift";
    case "confidence":
      return "confidence";
    case "evidence":
    case "completeness":
    default:
      return "evidence";
  }
}

function createRuntimeExecutiveSummaryNextFocus({
  runtimeState,
  recommendationState,
  observationSummary,
}: {
  runtimeState: RuntimeExecutiveSummaryState;
  recommendationState: RuntimeExecutiveRecommendationState;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
}): string {
  if (observationSummary?.recommendations[0]?.description) {
    return observationSummary.recommendations[0].description;
  }

  switch (runtimeState) {
    case "insufficient-data":
      return "Collect more complete Runtime and Recommendation Evolution evidence.";
    case "attention-required":
      return "Review the primary Recommendation Evolution risk before drawing a broader Runtime conclusion.";
    case "changing":
      return "Continue observing whether the changing Adaptive Recommendation pattern persists.";
    case "stable":
      return "Continue monitoring the stable Recommendation pattern in Shadow Mode.";
    case "observing":
    default:
      if (recommendationState === "base-only") {
        return "Continue the current Base Runtime flow while collecting Adaptive observation evidence.";
      }
      return "Continue the current Runtime flow and observe Recommendation Evolution.";
  }
}

function resolveConfidenceLevel(
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null
): string | null {
  if (observationSummary === null) return null;
  if (observationSummary.confidenceScore === null) {
    return observationSummary.status === "insufficient-data"
      ? "insufficient-data"
      : null;
  }
  if (observationSummary.confidenceScore >= 0.85) return "strong";
  if (observationSummary.confidenceScore >= 0.65) return "established";
  if (observationSummary.confidenceScore >= 0.35) return "emerging";
  return "low";
}

function resolveStabilityLevel(
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null
): string | null {
  if (observationSummary === null) return null;
  if (observationSummary.stabilityRate === null) {
    return observationSummary.status === "insufficient-data"
      ? "insufficient-data"
      : null;
  }
  if (observationSummary.stabilityRate >= 0.75) return "stable";
  if (observationSummary.stabilityRate >= 0.4) return "emerging";
  return "unstable";
}

function resolveDriftLevel(
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null
): string | null {
  if (observationSummary === null) return null;
  if (observationSummary.driftScore === null) {
    return observationSummary.status === "insufficient-data"
      ? "insufficient-data"
      : null;
  }
  if (observationSummary.driftScore >= 0.6) return "significant";
  if (observationSummary.driftScore >= 0.25) return "emerging";
  return "stable";
}

function hasCriticalObservationRisk(
  observationSummary: RuntimeRecommendationAdaptiveObservationSummary
): boolean {
  return observationSummary.risks.some(
    (risk) => risk.severity === "critical"
  );
}

function createRuntimeExecutiveSummaryDiagnostics({
  generatedAt,
  availability,
  observationSummary,
  warnings,
}: {
  generatedAt: string;
  availability: RuntimeExecutiveSummaryAvailability;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
  warnings: string[];
}): RuntimeExecutiveSummaryDiagnostics {
  const uniqueWarnings = [...new Set(warnings)];
  return {
    generatedAt,
    runtimeNextActionAvailable:
      availability.runtimeNextActionAvailable,
    recommendationComparisonAvailable:
      availability.recommendationComparisonAvailable,
    baseRecommendationAvailable:
      availability.baseRecommendationAvailable,
    adaptiveRecommendationAvailable:
      availability.adaptiveRecommendationAvailable,
    observationSummaryAvailable:
      availability.observationSummaryAvailable,
    observationSummaryStatus: observationSummary?.status ?? null,
    warningCount: uniqueWarnings.length,
    warnings: [...uniqueWarnings],
  };
}

function validateRuntimeExecutiveSummaryInput({
  recommendationComparison,
  observationSummary,
  warnings,
}: {
  recommendationComparison:
    CompareBaseAndAdaptiveRuntimeRecommendationsResult | null;
  observationSummary:
    RuntimeRecommendationAdaptiveObservationSummary | null;
  warnings: string[];
}): void {
  if (
    recommendationComparison !== null &&
    recommendationComparison.diagnostics.winnerChanged !==
      (recommendationComparison.diagnostics.status === "changed")
  ) {
    warnings.push(
      "Recommendation Comparison winnerChanged does not match its status."
    );
  }

  if (
    observationSummary !== null &&
    observationSummary.comparableObservationCount +
      observationSummary.incompleteObservationCount !==
      observationSummary.observationCount
  ) {
    warnings.push("Observation Summary counts are inconsistent.");
  }

  if (observationSummary !== null) {
    validateNullableRate({
      name: "Observation Summary agreementRate",
      value: observationSummary.agreementRate,
      warnings,
    });
    validateNullableRate({
      name: "Observation Summary stabilityRate",
      value: observationSummary.stabilityRate,
      warnings,
    });
    validateNullableRate({
      name: "Observation Summary driftScore",
      value: observationSummary.driftScore,
      warnings,
    });
    validateNullableRate({
      name: "Observation Summary confidenceScore",
      value: observationSummary.confidenceScore,
      warnings,
    });
  }
}

function validateRuntimeExecutiveSummaryResult({
  executiveSummary,
  warnings,
}: {
  executiveSummary: RuntimeExecutiveSummary;
  warnings: string[];
}): void {
  if (executiveSummary.headline.trim().length === 0) {
    warnings.push("Runtime Executive Summary headline is empty.");
  }
  if (executiveSummary.overview.trim().length === 0) {
    warnings.push("Runtime Executive Summary overview is empty.");
  }
  if (executiveSummary.nextFocus.trim().length === 0) {
    warnings.push("Runtime Executive Summary nextFocus is empty.");
  }

  validateNullableRate({
    name: "Runtime Executive Summary stabilityRate",
    value: executiveSummary.stabilityRate,
    warnings,
  });
  validateNullableRate({
    name: "Runtime Executive Summary driftScore",
    value: executiveSummary.driftScore,
    warnings,
  });
  validateNullableRate({
    name: "Runtime Executive Summary confidenceScore",
    value: executiveSummary.confidenceScore,
    warnings,
  });
}

function validateNullableRate({
  name,
  value,
  warnings,
}: {
  name: string;
  value: number | null;
  warnings: string[];
}): void {
  if (
    value !== null &&
    (!Number.isFinite(value) || value < 0 || value > 1)
  ) {
    warnings.push(`${name} is outside the valid range.`);
  }
}

export function cloneRuntimeExecutiveSummary(
  executiveSummary: RuntimeExecutiveSummary
): RuntimeExecutiveSummary {
  return {
    ...executiveSummary,
    primarySignal:
      executiveSummary.primarySignal === null
        ? null
        : { ...executiveSummary.primarySignal },
    primaryRisk:
      executiveSummary.primaryRisk === null
        ? null
        : { ...executiveSummary.primaryRisk },
  };
}

export function cloneRuntimeExecutiveSummaryDiagnostics(
  diagnostics: RuntimeExecutiveSummaryDiagnostics
): RuntimeExecutiveSummaryDiagnostics {
  return {
    ...diagnostics,
    warnings: [...diagnostics.warnings],
  };
}

export function cloneRuntimeExecutiveSummaryPolicy(
  policy: RuntimeExecutiveSummaryPolicy
): RuntimeExecutiveSummaryPolicy {
  return { ...policy };
}

export function normalizeRuntimeExecutiveSummaryPolicy(
  policy?: PartialRuntimeExecutiveSummaryPolicy
): RuntimeExecutiveSummaryPolicy {
  const fallback = DEFAULT_RUNTIME_EXECUTIVE_SUMMARY_POLICY;
  return {
    includeObservationMetrics:
      typeof policy?.includeObservationMetrics === "boolean"
        ? policy.includeObservationMetrics
        : fallback.includeObservationMetrics,
    includeRecommendationComparison:
      typeof policy?.includeRecommendationComparison === "boolean"
        ? policy.includeRecommendationComparison
        : fallback.includeRecommendationComparison,
    maximumOverviewSentenceCount: normalizePositiveInteger(
      policy?.maximumOverviewSentenceCount,
      fallback.maximumOverviewSentenceCount
    ),
    decimalPlaces: normalizeDecimalPlaces(
      policy?.decimalPlaces,
      fallback.decimalPlaces
    ),
  };
}

function normalizeCandidateId(value: string | null): string | null {
  if (value === null) return null;
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeNullableRate(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return clampRate(value);
}

function clampRate(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function formatPercent({
  value,
  decimalPlaces,
}: {
  value: number;
  decimalPlaces: number;
}): string {
  return `${(clampRate(value) * 100).toFixed(decimalPlaces)}%`;
}

function formatNumber({
  value,
  decimalPlaces,
}: {
  value: number;
  decimalPlaces: number;
}): string {
  return Number.isFinite(value) ? value.toFixed(decimalPlaces) : "0";
}

function joinTextParts(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.floor(value))
    : fallback;
}

function normalizeDecimalPlaces(
  value: number | undefined,
  fallback: number
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(8, Math.floor(value)))
    : fallback;
}