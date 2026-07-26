import type {
    RuntimeRecommendationIntegrationResult,
} from "../runtime-recommendation-integration/runtimeRecommendationIntegrationTypes";

/* ------------------------------------------------------------------ */
/* Presentation Types */
/* ------------------------------------------------------------------ */

export type RuntimeRecommendationPresentationTone =
  | "stable"
  | "changing"
  | "caution"
  | "unavailable";

export type RuntimeRecommendationPresentation = {
  headline: string;
  overview: string;

  recommendationStateLabel: string;
  recommendationChanged: boolean;
  recommendationChangeMessage: string;

  confidenceLabel: string;
  stabilityLabel: string;
  driftLabel: string;

  nextFocus: string | null;

  baseRecommendationLabel: string | null;
  adaptiveRecommendationLabel: string | null;

  observationCount: number | null;
  comparableObservationCount: number | null;
  observationCountLabel: string;

  primarySignalTitle: string | null;
  primarySignalDescription: string | null;

  primaryRiskTitle: string | null;
  primaryRiskDescription: string | null;

  integrationStatusLabel: string;
  integrationReasonLabel: string;

  completedStageCount: number;
  totalStageCount: number;
  completedStageLabel: string;

  warnings: string[];

  tone:
    RuntimeRecommendationPresentationTone;
};

/* ------------------------------------------------------------------ */
/* Presentation Creation */
/* ------------------------------------------------------------------ */

/**
 * Runtime Recommendation Integration Result를 사용자 화면에서 사용할
 * Presentation Model로 변환합니다.
 *
 * 이 함수는 내부 enum과 nullable 값을 사용자 친화적인 표시 값으로
 * 변환하며, 원본 Integration Result를 변경하지 않습니다.
 */
export function createRuntimeRecommendationPresentation(
  integration:
    RuntimeRecommendationIntegrationResult
): RuntimeRecommendationPresentation {
  const executiveSummary =
    integration
      .executiveSummaryResult
      .executiveSummary;

  const integrationDiagnostics =
    integration.diagnostics;

  const recommendationComparison =
    integration.recommendationComparison;

  /*
   * Runtime Executive Summary에서는 Recommendation 변화 여부를
   * 아직 판단할 수 없는 경우 null을 반환할 수 있습니다.
   *
   * Presentation의 boolean 필드는 명시적인 true일 때만 true로
   * 정규화합니다.
   */
  const recommendationChanged =
    executiveSummary
      .recommendationChanged === true;

  const observationCount =
    normalizeNullableCount(
      executiveSummary
        .observationCount
    );

  const comparableObservationCount =
    normalizeNullableCount(
      executiveSummary
        .comparableObservationCount
    );

  return {
    headline:
      normalizeDisplayText(
        executiveSummary.headline,
        createFallbackHeadline(
          integrationDiagnostics.status
        )
      ),

    overview:
      normalizeDisplayText(
        executiveSummary.overview,
        createFallbackOverview(
          integrationDiagnostics.status
        )
      ),

    recommendationStateLabel:
      formatRecommendationState(
        executiveSummary
          .recommendationState
      ),

    recommendationChanged,

    recommendationChangeMessage:
      createRecommendationChangeMessage(
        executiveSummary
          .recommendationChanged,
        executiveSummary
          .baseRecommendationId,
        executiveSummary
          .adaptiveRecommendationId
      ),

    confidenceLabel:
      formatConfidenceLevel(
        executiveSummary
          .confidenceLevel
      ),

    stabilityLabel:
      formatStabilityLevel(
        executiveSummary
          .stabilityLevel
      ),

    driftLabel:
      formatDriftLevel(
        executiveSummary
          .driftLevel
      ),

    nextFocus:
      normalizeNullableText(
        executiveSummary.nextFocus
      ),

    baseRecommendationLabel:
      resolveBaseRecommendationLabel(
        executiveSummary
          .baseRecommendationId,
        recommendationComparison
      ),

    adaptiveRecommendationLabel:
      resolveAdaptiveRecommendationLabel(
        executiveSummary
          .adaptiveRecommendationId,
        recommendationComparison
      ),

    observationCount,

    comparableObservationCount,

    observationCountLabel:
      createObservationCountLabel(
        observationCount,
        comparableObservationCount
      ),

    primarySignalTitle:
      normalizeNullableText(
        executiveSummary
          .primarySignal
          ?.title
      ),

    primarySignalDescription:
      normalizeNullableText(
        executiveSummary
          .primarySignal
          ?.description
      ),

    primaryRiskTitle:
      normalizeNullableText(
        executiveSummary
          .primaryRisk
          ?.title
      ),

    primaryRiskDescription:
      normalizeNullableText(
        executiveSummary
          .primaryRisk
          ?.description
      ),

    integrationStatusLabel:
      formatIntegrationStatus(
        integrationDiagnostics.status
      ),

    integrationReasonLabel:
      formatIntegrationReason(
        integrationDiagnostics.reason
      ),

    completedStageCount:
      normalizeCount(
        integrationDiagnostics
          .completedStageCount
      ),

    totalStageCount:
      normalizeCount(
        integrationDiagnostics
          .totalStageCount
      ),

    completedStageLabel:
      createCompletedStageLabel(
        integrationDiagnostics
          .completedStageCount,
        integrationDiagnostics
          .totalStageCount
      ),

    warnings: [
      ...integrationDiagnostics
        .warnings,
    ],

    tone:
      resolvePresentationTone(
        integration
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Recommendation Labels */
/* ------------------------------------------------------------------ */

function resolveBaseRecommendationLabel(
  executiveSummaryId:
    string | null,
  comparison:
    RuntimeRecommendationIntegrationResult[
      "recommendationComparison"
    ]
): string | null {
  return (
    normalizeNullableText(
      executiveSummaryId
    ) ??
    normalizeNullableText(
      comparison
        ?.baseWinnerSnapshot
        ?.candidateId
    )
  );
}

function resolveAdaptiveRecommendationLabel(
  executiveSummaryId:
    string | null,
  comparison:
    RuntimeRecommendationIntegrationResult[
      "recommendationComparison"
    ]
): string | null {
  return (
    normalizeNullableText(
      executiveSummaryId
    ) ??
    normalizeNullableText(
      comparison
        ?.adaptiveWinnerSnapshot
        ?.candidateId
    )
  );
}

/**
 * recommendationChanged가 null이면 변화 여부를 아직 판단할 수 없는
 * 상태입니다.
 *
 * null을 false와 동일하게 처리하면 Recommendation이 정렬되어 있다는
 * 잘못된 의미를 전달할 수 있으므로 별도 문구를 반환합니다.
 */
function createRecommendationChangeMessage(
  recommendationChanged:
    boolean | null,
  baseRecommendationId:
    string | null,
  adaptiveRecommendationId:
    string | null
): string {
  if (
    recommendationChanged === null
  ) {
    return (
      "The available evidence is not yet sufficient " +
      "to determine whether the recommendation changed."
    );
  }

  if (
    recommendationChanged
  ) {
    if (
      normalizeNullableText(
        baseRecommendationId
      ) !== null &&
      normalizeNullableText(
        adaptiveRecommendationId
      ) !== null
    ) {
      return (
        "The adaptive recommendation differs from " +
        "the base recommendation."
      );
    }

    return (
      "The recommendation direction changed after " +
      "adaptive analysis."
    );
  }

  return (
    "The adaptive recommendation remains aligned " +
    "with the base recommendation."
  );
}

/* ------------------------------------------------------------------ */
/* Observation Labels */
/* ------------------------------------------------------------------ */

function createObservationCountLabel(
  observationCount: number | null,
  comparableObservationCount:
    number | null
): string {
  if (
    observationCount === null
  ) {
    return (
      "Observation history is not available yet."
    );
  }

  if (
    comparableObservationCount === null
  ) {
    return createPluralizedObservationLabel(
      observationCount
    );
  }

  return (
    `${comparableObservationCount} of ` +
    `${observationCount} observations were comparable.`
  );
}

function createPluralizedObservationLabel(
  observationCount: number
): string {
  if (
    observationCount === 1
  ) {
    return "1 observation analyzed.";
  }

  return (
    `${observationCount} observations analyzed.`
  );
}

/* ------------------------------------------------------------------ */
/* Diagnostics Labels */
/* ------------------------------------------------------------------ */

function createCompletedStageLabel(
  completedStageCount: number,
  totalStageCount: number
): string {
  const safeCompletedCount =
    normalizeCount(
      completedStageCount
    );

  const safeTotalCount =
    normalizeCount(
      totalStageCount
    );

  if (
    safeTotalCount === 0
  ) {
    return (
      "No integration stages were available."
    );
  }

  return (
    `${safeCompletedCount} of ` +
    `${safeTotalCount} integration stages completed.`
  );
}

/* ------------------------------------------------------------------ */
/* Tone Resolution */
/* ------------------------------------------------------------------ */

function resolvePresentationTone(
  integration:
    RuntimeRecommendationIntegrationResult
): RuntimeRecommendationPresentationTone {
  const status =
    normalizeEnumValue(
      integration
        .diagnostics
        .status
    );

  const executiveSummary =
    integration
      .executiveSummaryResult
      .executiveSummary;

  if (
    status === "unavailable"
  ) {
    return "unavailable";
  }

  if (
    status ===
      "insufficient-data" ||
    status === "partial" ||
    executiveSummary
      .primaryRisk !== null
  ) {
    return "caution";
  }

  if (
    executiveSummary
      .recommendationChanged === true ||
    isChangingRecommendationState(
      executiveSummary
        .recommendationState
    ) ||
    isMeaningfulDriftLevel(
      executiveSummary
        .driftLevel
    )
  ) {
    return "changing";
  }

  return "stable";
}

function isChangingRecommendationState(
  value: unknown
): boolean {
  const normalized =
    normalizeEnumValue(value);

  return (
    normalized.includes(
      "changing"
    ) ||
    normalized.includes(
      "changed"
    ) ||
    normalized.includes(
      "diverging"
    ) ||
    normalized.includes(
      "shift"
    )
  );
}

function isMeaningfulDriftLevel(
  value: unknown
): boolean {
  const normalized =
    normalizeEnumValue(value);

  return (
    normalized === "moderate" ||
    normalized === "strong" ||
    normalized === "high" ||
    normalized === "significant"
  );
}

/* ------------------------------------------------------------------ */
/* Enum Formatting */
/* ------------------------------------------------------------------ */

function formatRecommendationState(
  value: unknown
): string {
  const normalized =
    normalizeEnumValue(value);

  switch (normalized) {
    case "adaptive-stable":
      return (
        "Adaptive recommendation is stable"
      );

    case "adaptive-changing":
      return (
        "Recommendation direction is changing"
      );

    case "adaptive-emerging":
      return (
        "Adaptive recommendation is emerging"
      );

    case "base-stable":
      return (
        "Base recommendation remains stable"
      );

    case "aligned":
      return (
        "Base and adaptive recommendations are aligned"
      );

    case "changed":
      return (
        "Recommendation direction changed"
      );

    case "unavailable":
      return (
        "Recommendation state is unavailable"
      );

    default:
      return formatUnknownEnumValue(
        normalized,
        "Recommendation state is forming"
      );
  }
}

function formatConfidenceLevel(
  value: unknown
): string {
  const normalized =
    normalizeEnumValue(value);

  switch (normalized) {
    case "none":
    case "unavailable":
      return "Not yet available";

    case "low":
      return "Low confidence";

    case "emerging":
      return "Emerging confidence";

    case "developing":
      return "Developing confidence";

    case "moderate":
      return "Moderate confidence";

    case "established":
      return "Established confidence";

    case "high":
      return "High confidence";

    default:
      return formatUnknownEnumValue(
        normalized,
        "Confidence is forming"
      );
  }
}

function formatStabilityLevel(
  value: unknown
): string {
  const normalized =
    normalizeEnumValue(value);

  switch (normalized) {
    case "none":
    case "unavailable":
      return "Not yet available";

    case "unstable":
      return "Still changing";

    case "emerging":
      return "Early pattern";

    case "forming":
      return "Pattern forming";

    case "moderate":
      return "Moderately stable";

    case "stable":
      return "Stable pattern";

    case "strong":
      return "Strongly stable pattern";

    default:
      return formatUnknownEnumValue(
        normalized,
        "Stability is forming"
      );
  }
}

function formatDriftLevel(
  value: unknown
): string {
  const normalized =
    normalizeEnumValue(value);

  switch (normalized) {
    case "none":
    case "stable":
      return "No meaningful drift";

    case "minor":
    case "low":
      return "Minor directional change";

    case "moderate":
      return (
        "Noticeable directional change"
      );

    case "strong":
    case "high":
    case "significant":
      return (
        "Strong directional change"
      );

    case "unavailable":
      return (
        "Drift is not yet available"
      );

    default:
      return formatUnknownEnumValue(
        normalized,
        "Drift is still being observed"
      );
  }
}

function formatIntegrationStatus(
  value: unknown
): string {
  const normalized =
    normalizeEnumValue(value);

  switch (normalized) {
    case "complete":
      return "Analysis complete";

    case "partial":
      return (
        "Partial analysis available"
      );

    case "insufficient-data":
      return (
        "More reflection history is needed"
      );

    case "unavailable":
      return (
        "Analysis is not available"
      );

    default:
      return formatUnknownEnumValue(
        normalized,
        "Analysis status is forming"
      );
  }
}

function formatIntegrationReason(
  value: unknown
): string {
  const normalized =
    normalizeEnumValue(value);

  switch (normalized) {
    case "recommendation-integration-complete":
      return (
        "All available recommendation analysis stages completed."
      );

    case "recommendation-integration-partial":
      return (
        "Some recommendation analysis stages produced limited results."
      );

    case "recommendation-integration-insufficient-data":
      return (
        "The analysis completed, but more observation history is required."
      );

    case "recommendation-integration-unavailable":
      return (
        "The required recommendation inputs were not available."
      );

    case "missing-runtime-next-action":
      return (
        "A Runtime next action was not available for integration."
      );

    case "missing-recommendation-comparison":
      return (
        "Recommendation comparison information was not available."
      );

    case "missing-observation-summary":
      return (
        "Observation history was not sufficient to create a summary."
      );

    default:
      return formatUnknownEnumValue(
        normalized,
        "The Runtime completed the available recommendation analysis."
      );
  }
}

/* ------------------------------------------------------------------ */
/* Fallback Text */
/* ------------------------------------------------------------------ */

function createFallbackHeadline(
  status: unknown
): string {
  const normalized =
    normalizeEnumValue(status);

  switch (normalized) {
    case "complete":
      return (
        "Runtime recommendation analysis is complete."
      );

    case "partial":
      return (
        "Runtime recommendation analysis is partially available."
      );

    case "insufficient-data":
      return (
        "More Reflection history is needed."
      );

    case "unavailable":
      return (
        "Runtime recommendation analysis is not available."
      );

    default:
      return (
        "Runtime recommendation analysis is forming."
      );
  }
}

function createFallbackOverview(
  status: unknown
): string {
  const normalized =
    normalizeEnumValue(status);

  switch (normalized) {
    case "complete":
      return (
        "The Runtime combined the current action, " +
        "recommendation comparison, and observation evidence."
      );

    case "partial":
      return (
        "The Runtime completed the available analysis, " +
        "but some supporting information remains limited."
      );

    case "insufficient-data":
      return (
        "The Runtime completed the analysis path, " +
        "but the current observation history is still limited."
      );

    case "unavailable":
      return (
        "The Runtime did not receive enough input to " +
        "construct a recommendation summary."
      );

    default:
      return (
        "The Runtime is organizing the current " +
        "recommendation evidence."
      );
  }
}

/* ------------------------------------------------------------------ */
/* Primitive Normalization */
/* ------------------------------------------------------------------ */

function normalizeDisplayText(
  value: unknown,
  fallback: string
): string {
  const normalized =
    normalizeNullableText(value);

  return normalized ??
    fallback;
}

function normalizeNullableText(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  if (
    trimmed.length === 0
  ) {
    return null;
  }

  return trimmed;
}

function normalizeNullableCount(
  value: unknown
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return normalizeCount(value);
}

function normalizeCount(
  value: number
): number {
  return Math.max(
    0,
    Math.trunc(value)
  );
}

/**
 * replaceAll()은 현재 프로젝트의 TypeScript target에 따라 지원되지
 * 않을 수 있으므로 정규식 기반 replace()를 사용합니다.
 */
function normalizeEnumValue(
  value: unknown
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(
      /_/g,
      "-"
    )
    .replace(
      /\s+/g,
      "-"
    );
}

function formatUnknownEnumValue(
  normalizedValue: string,
  fallback: string
): string {
  if (
    normalizedValue.length === 0
  ) {
    return fallback;
  }

  return normalizedValue
    .split("-")
    .filter(
      (segment) =>
        segment.length > 0
    )
    .map(
      capitalizeFirstLetter
    )
    .join(" ");
}

function capitalizeFirstLetter(
  value: string
): string {
  if (
    value.length === 0
  ) {
    return value;
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}