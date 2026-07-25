import type { RuntimeRecommendationAdaptiveObservationConfidence } from "./createAdaptiveRecommendationObservationConfidence";
import type { RuntimeRecommendationAdaptiveObservationDrift } from "./createAdaptiveRecommendationObservationDrift";
import type { RuntimeRecommendationAdaptiveObservationStability } from "./createAdaptiveRecommendationObservationStability";
import type { RuntimeRecommendationAdaptiveObservationStatistics } from "./createAdaptiveRecommendationObservationStatistics";
import { normalizeGeneratedAt } from "./runtimeRecommendationMath";

export type RuntimeRecommendationAdaptiveObservationSummaryPolicy = {
  maximumStrengthCount: number;
  maximumRiskCount: number;
  maximumInsightCount: number;
  maximumRecommendationCount: number;
  decimalPlaces: number;
  includeStatusExplanation: boolean;
  includeMetricEvidence: boolean;
};

export type PartialRuntimeRecommendationAdaptiveObservationSummaryPolicy =
  Partial<RuntimeRecommendationAdaptiveObservationSummaryPolicy>;

export const DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_SUMMARY_POLICY:
  RuntimeRecommendationAdaptiveObservationSummaryPolicy = {
    maximumStrengthCount: 3,
    maximumRiskCount: 3,
    maximumInsightCount: 4,
    maximumRecommendationCount: 3,
    decimalPlaces: 2,
    includeStatusExplanation: true,
    includeMetricEvidence: true,
  };

export type RuntimeRecommendationAdaptiveObservationSummaryStatus =
  | "complete"
  | "partial"
  | "insufficient-data";

export type RuntimeRecommendationAdaptiveObservationSummaryReason =
  | "adaptive-observation-analysis-summarized"
  | "analysis-contains-partial-data"
  | "no-observations"
  | "statistics-unavailable"
  | "stability-unavailable"
  | "drift-unavailable"
  | "confidence-unavailable"
  | "no-summary-evidence";

export type RuntimeRecommendationAdaptiveObservationSummaryTone =
  | "insufficient-data"
  | "cautious"
  | "developing"
  | "stable"
  | "strong";

export type RuntimeRecommendationAdaptiveObservationSummaryItemCategory =
  | "evidence"
  | "agreement"
  | "stability"
  | "drift"
  | "confidence"
  | "completeness";

export type RuntimeRecommendationAdaptiveObservationSummaryItemSeverity =
  | "info"
  | "positive"
  | "warning"
  | "critical";

export type RuntimeRecommendationAdaptiveObservationSummaryItem = {
  id: string;
  category: RuntimeRecommendationAdaptiveObservationSummaryItemCategory;
  severity: RuntimeRecommendationAdaptiveObservationSummaryItemSeverity;
  title: string;
  description: string;
  metricName: string | null;
  metricValue: number | string | null;
};

export type RuntimeRecommendationAdaptiveObservationSummaryRecommendation = {
  id: string;
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  rationale: string;
};

export type RuntimeRecommendationAdaptiveObservationSummarySourceStatus = {
  statisticsStatus: string;
  stabilityStatus: string;
  driftStatus: string;
  confidenceStatus: string;
  unavailableSourceCount: number;
  partialSourceCount: number;
};

export type RuntimeRecommendationAdaptiveObservationSummary = {
  observationCount: number;
  comparableObservationCount: number;
  incompleteObservationCount: number;
  headline: string;
  overview: string;
  primaryInsight: string;
  primaryRisk: string | null;
  dominantAdaptiveCandidateId: string | null;
  currentAdaptiveCandidateId: string | null;
  agreementRate: number | null;
  stabilityRate: number | null;
  driftScore: number | null;
  confidenceScore: number | null;
  strengths: RuntimeRecommendationAdaptiveObservationSummaryItem[];
  risks: RuntimeRecommendationAdaptiveObservationSummaryItem[];
  insights: RuntimeRecommendationAdaptiveObservationSummaryItem[];
  recommendations: RuntimeRecommendationAdaptiveObservationSummaryRecommendation[];
  sourceStatus: RuntimeRecommendationAdaptiveObservationSummarySourceStatus;
  tone: RuntimeRecommendationAdaptiveObservationSummaryTone;
  status: RuntimeRecommendationAdaptiveObservationSummaryStatus;
  reason: RuntimeRecommendationAdaptiveObservationSummaryReason;
};

export type RuntimeRecommendationAdaptiveObservationSummaryDiagnostics = {
  generatedAt: string;
  observationCount: number;
  comparableObservationCount: number;
  incompleteObservationCount: number;
  strengthCount: number;
  riskCount: number;
  insightCount: number;
  recommendationCount: number;
  sourceStatus: RuntimeRecommendationAdaptiveObservationSummarySourceStatus;
  warningCount: number;
  warnings: string[];
};

export type CreateAdaptiveRecommendationObservationSummaryResult = {
  summary: RuntimeRecommendationAdaptiveObservationSummary;
  diagnostics: RuntimeRecommendationAdaptiveObservationSummaryDiagnostics;
  policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy;
};

export type CreateAdaptiveRecommendationObservationSummaryParams = {
  statistics: RuntimeRecommendationAdaptiveObservationStatistics;
  stability: RuntimeRecommendationAdaptiveObservationStability;
  drift: RuntimeRecommendationAdaptiveObservationDrift;
  confidence: RuntimeRecommendationAdaptiveObservationConfidence;
  policy?: PartialRuntimeRecommendationAdaptiveObservationSummaryPolicy;
  generatedAt?: string;
};

type SummaryCounts = {
  observationCount: number;
  comparableObservationCount: number;
  incompleteObservationCount: number;
};

export function createAdaptiveRecommendationObservationSummary({
  statistics,
  stability,
  drift,
  confidence,
  policy,
  generatedAt,
}: CreateAdaptiveRecommendationObservationSummaryParams):
  CreateAdaptiveRecommendationObservationSummaryResult {
  const normalizedPolicy =
    normalizeRuntimeRecommendationAdaptiveObservationSummaryPolicy(policy);
  const warnings: string[] = [];
  const counts = resolveCounts(statistics, stability, drift, confidence, warnings);
  const sourceStatus = createSourceStatus(statistics, stability, drift, confidence);
  const status = resolveStatus(counts, sourceStatus);
  const reason = resolveReason(counts, statistics, stability, drift, confidence, sourceStatus);
  const tone = resolveTone(status, stability, drift, confidence);
  const agreementRate = resolveAgreementRate(statistics);
  const stabilityRate = normalizeNullableRate(stability.adaptiveWinnerRepeatRate);
  const driftScore = normalizeNullableRate(drift.driftScore);
  const confidenceScore = normalizeNullableRate(confidence.confidenceScore);
  const dominantAdaptiveCandidateId =
    normalizeCandidateId(drift.recentWindow.dominantCandidateId) ??
    normalizeCandidateId(stability.longestStreakCandidateId);
  const currentAdaptiveCandidateId =
    normalizeCandidateId(stability.currentAdaptiveWinnerCandidateId);

  const headline = createHeadline(status, statistics, stability, drift, confidence, normalizedPolicy);
  const overview = createOverview(counts, sourceStatus, agreementRate, stability, drift, confidence, normalizedPolicy);
  const primaryInsight = createPrimaryInsight(counts, status, agreementRate, stability, drift, confidence, normalizedPolicy);
  const primaryRisk = createPrimaryRisk(counts, status, sourceStatus, agreementRate, stability, drift, confidence, normalizedPolicy);
  const strengths = createStrengths(counts, agreementRate, stability, drift, confidence, normalizedPolicy)
    .slice(0, normalizedPolicy.maximumStrengthCount);
  const risks = createRisks(counts, sourceStatus, agreementRate, stability, drift, confidence, normalizedPolicy)
    .slice(0, normalizedPolicy.maximumRiskCount);
  const insights = createInsights(counts, agreementRate, stability, drift, confidence, normalizedPolicy)
    .slice(0, normalizedPolicy.maximumInsightCount);
  const recommendations = createRecommendations(counts, sourceStatus, stability, drift, confidence)
    .slice(0, normalizedPolicy.maximumRecommendationCount);

  const summary: RuntimeRecommendationAdaptiveObservationSummary = {
    ...counts,
    headline,
    overview,
    primaryInsight,
    primaryRisk,
    dominantAdaptiveCandidateId,
    currentAdaptiveCandidateId,
    agreementRate,
    stabilityRate,
    driftScore,
    confidenceScore,
    strengths,
    risks,
    insights,
    recommendations,
    sourceStatus,
    tone,
    status,
    reason,
  };

  validateSummary(summary, warnings);
  const uniqueWarnings = [...new Set(warnings)];

  return {
    summary: cloneRuntimeRecommendationAdaptiveObservationSummary(summary),
    diagnostics: {
      generatedAt: normalizeGeneratedAt(generatedAt),
      ...counts,
      strengthCount: strengths.length,
      riskCount: risks.length,
      insightCount: insights.length,
      recommendationCount: recommendations.length,
      sourceStatus: { ...sourceStatus },
      warningCount: uniqueWarnings.length,
      warnings: [...uniqueWarnings],
    },
    policy: cloneRuntimeRecommendationAdaptiveObservationSummaryPolicy(normalizedPolicy),
  };
}

function resolveCounts(
  statistics: RuntimeRecommendationAdaptiveObservationStatistics,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence,
  warnings: string[]
): SummaryCounts {
  const totals = [statistics.observationCount, stability.observationCount, drift.observationCount, confidence.observationCount]
    .map(normalizeCount);
  const comparables = [statistics.comparableObservationCount, stability.comparableObservationCount, drift.comparableObservationCount, confidence.comparableObservationCount]
    .map(normalizeCount);
  if (new Set(totals).size > 1) warnings.push("Summary sources contain different total Observation counts.");
  if (new Set(comparables).size > 1) warnings.push("Summary sources contain different comparable Observation counts.");
  const observationCount = Math.max(...totals);
  const comparableObservationCount = Math.max(0, Math.min(observationCount, ...comparables));
  return {
    observationCount,
    comparableObservationCount,
    incompleteObservationCount: Math.max(0, observationCount - comparableObservationCount),
  };
}

function createSourceStatus(
  statistics: RuntimeRecommendationAdaptiveObservationStatistics,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence
): RuntimeRecommendationAdaptiveObservationSummarySourceStatus {
  const statuses = [statistics.status, stability.status, drift.status, confidence.status];
  return {
    statisticsStatus: statistics.status,
    stabilityStatus: stability.status,
    driftStatus: drift.status,
    confidenceStatus: confidence.status,
    unavailableSourceCount: statuses.filter((status) => status === "insufficient-data" ).length,
    partialSourceCount: statuses.filter((status) => status === "partial").length,
  };
}

function resolveStatus(
  counts: SummaryCounts,
  sourceStatus: RuntimeRecommendationAdaptiveObservationSummarySourceStatus
): RuntimeRecommendationAdaptiveObservationSummaryStatus {
  if (counts.observationCount === 0 || counts.comparableObservationCount === 0 || sourceStatus.unavailableSourceCount === 4) {
    return "insufficient-data";
  }
  if (counts.incompleteObservationCount > 0 || sourceStatus.unavailableSourceCount > 0 || sourceStatus.partialSourceCount > 0) {
    return "partial";
  }
  return "complete";
}

function resolveReason(
  counts: SummaryCounts,
  statistics: RuntimeRecommendationAdaptiveObservationStatistics,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence,
  sourceStatus: RuntimeRecommendationAdaptiveObservationSummarySourceStatus
): RuntimeRecommendationAdaptiveObservationSummaryReason {
  if (counts.observationCount === 0) return "no-observations";
  if (statistics.status === "insufficient-data") return "statistics-unavailable";
  if (stability.status === "insufficient-data") return "stability-unavailable";
  if (drift.status === "insufficient-data") return "drift-unavailable";
  if (confidence.status === "insufficient-data") return "confidence-unavailable";
  if (counts.comparableObservationCount === 0 || sourceStatus.unavailableSourceCount === 4) return "no-summary-evidence";
  if (counts.incompleteObservationCount > 0 || sourceStatus.unavailableSourceCount > 0 || sourceStatus.partialSourceCount > 0) {
    return "analysis-contains-partial-data";
  }
  return "adaptive-observation-analysis-summarized";
}

function resolveTone(
  status: RuntimeRecommendationAdaptiveObservationSummaryStatus,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence
): RuntimeRecommendationAdaptiveObservationSummaryTone {
  if (status === "insufficient-data") return "insufficient-data";
  if (drift.level === "significant" || stability.level === "unstable" || confidence.level === "low") return "cautious";
  if (confidence.level === "strong" && stability.level === "stable" && drift.level === "stable") return "strong";
  if (stability.level === "stable" && (confidence.level === "established" || confidence.level === "strong")) return "stable";
  return "developing";
}

function createHeadline(
  status: RuntimeRecommendationAdaptiveObservationSummaryStatus,
  statistics: RuntimeRecommendationAdaptiveObservationStatistics,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence,
  policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy
): string {
  if (status === "insufficient-data") {
    return policy.includeStatusExplanation
      ? "More observations are needed before Adaptive Recommendation patterns can be summarized."
      : "Adaptive Recommendation evidence is insufficient.";
  }
  if (confidence.level === "strong" && stability.level === "stable" && drift.level !== "significant") {
    return "Adaptive Recommendation is supported by strong and stable observation evidence.";
  }
  if (drift.level === "significant") return "Adaptive Recommendation behavior is changing significantly.";
  if (stability.level === "unstable") return "Adaptive Recommendation remains unstable across observations.";
  if (drift.level === "emerging") return "A new Adaptive Recommendation pattern is beginning to emerge.";
  if (confidence.level === "established") return "Adaptive Recommendation has established analytical support.";
  if (statistics.status === "calculated") return "Adaptive Recommendation observation patterns have been analyzed.";
  return "Adaptive Recommendation analysis is partial.";
}

function createOverview(
  counts: SummaryCounts,
  sourceStatus: RuntimeRecommendationAdaptiveObservationSummarySourceStatus,
  agreementRate: number | null,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence,
  policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy
): string {
  if (counts.observationCount === 0) return "No Adaptive Recommendation observations are available.";
  const parts: string[] = [];
  parts.push(counts.incompleteObservationCount > 0
    ? `${counts.comparableObservationCount} of ${counts.observationCount} observations were comparable.`
    : `All ${counts.comparableObservationCount} available observations were comparable.`);
  if (agreementRate !== null) parts.push(`Base/Adaptive agreement was ${formatPercent(agreementRate, policy)}.`);
  if (stability.adaptiveWinnerRepeatRate !== null) parts.push(`Winner repeat rate was ${formatPercent(stability.adaptiveWinnerRepeatRate, policy)}.`);
  if (drift.driftScore !== null) parts.push(`Drift Score was ${formatNumber(drift.driftScore, policy)}.`);
  if (confidence.confidenceScore !== null) parts.push(`Confidence Score was ${formatNumber(confidence.confidenceScore, policy)}.`);
  if (policy.includeStatusExplanation && (sourceStatus.unavailableSourceCount > 0 || sourceStatus.partialSourceCount > 0)) {
    parts.push(`${sourceStatus.unavailableSourceCount} source(s) were unavailable and ${sourceStatus.partialSourceCount} source(s) were partial.`);
  }
  return parts.join(" ");
}

function createPrimaryInsight(
  counts: SummaryCounts,
  status: RuntimeRecommendationAdaptiveObservationSummaryStatus,
  agreementRate: number | null,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence,
  policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy
): string {
  if (status === "insufficient-data") return counts.observationCount === 0
    ? "The most important current finding is the absence of Observation evidence."
    : "Additional comparable observations are required before a primary pattern can be established.";
  if (drift.level === "significant") return drift.dominantCandidateChanged
    ? "The dominant Adaptive Candidate changed between the baseline and recent windows."
    : "Recent Adaptive Candidate distribution changed substantially from its baseline.";
  if (confidence.level === "strong" && stability.level === "stable") return "Adaptive Winner continuity is stable and supported by strong analytical evidence.";
  if (stability.level === "unstable") return "Adaptive Winners continue to change frequently, so the current pattern should not yet be treated as persistent.";
  if (drift.level === "emerging") return "Recent Adaptive Recommendation behavior is beginning to diverge from its baseline pattern.";
  if (confidence.level === "established") return "The accumulated observations now provide established analytical support.";
  if (agreementRate !== null) return `${describeAgreement(agreementRate)} Agreement was ${formatPercent(agreementRate, policy)}.`;
  return "The available observations reveal a pattern, but no single analytical signal is yet dominant.";
}

function createPrimaryRisk(
  counts: SummaryCounts,
  status: RuntimeRecommendationAdaptiveObservationSummaryStatus,
  sourceStatus: RuntimeRecommendationAdaptiveObservationSummarySourceStatus,
  agreementRate: number | null,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence,
  policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy
): string | null {
  if (counts.observationCount === 0) return "No Observation evidence is currently available.";
  if (counts.comparableObservationCount === 0) return "The Observation History contains no valid comparable evidence.";
  if (status === "insufficient-data") return "The current evidence is not yet sufficient for a reliable long-term interpretation.";
  if (drift.level === "significant") return `Recent behavior differs substantially from baseline${drift.driftScore === null ? "." : ` (Drift Score ${formatNumber(drift.driftScore, policy)}).`}`;
  if (stability.level === "unstable") return "Frequent Winner switching makes the current Candidate pattern vulnerable to short-term fluctuation.";
  if (confidence.level === "low") return "Analytical Confidence remains low, so the current Summary should remain provisional.";
  if (agreementRate !== null && agreementRate < 0.4) return "Adaptive Winners frequently differ from Base Winners and should be reviewed before production use.";
  if (drift.level === "emerging") return "Recent behavior is beginning to diverge from baseline and requires continued observation.";
  if (counts.incompleteObservationCount > 0) return `${counts.incompleteObservationCount} observation(s) were incomplete.`;
  if (sourceStatus.unavailableSourceCount > 0 || sourceStatus.partialSourceCount > 0) return "The combined Summary is limited by unavailable or partial analytical sources.";
  return null;
}

function createStrengths(
  counts: SummaryCounts,
  agreementRate: number | null,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence,
  policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy
): RuntimeRecommendationAdaptiveObservationSummaryItem[] {
  const items: RuntimeRecommendationAdaptiveObservationSummaryItem[] = [];
  if (counts.observationCount > 0 && counts.incompleteObservationCount === 0) items.push(item("complete-evidence", "completeness", "positive", "Complete observation evidence", "All available observations were comparable.", "comparableObservationCount", counts.comparableObservationCount));
  if (agreementRate !== null && agreementRate >= 0.65) items.push(item("agreement", "agreement", "positive", "Base and Adaptive Winners are aligned", describeAgreement(agreementRate), "agreementRate", formatPercent(agreementRate, policy)));
  if (stability.level === "stable") items.push(item("stability", "stability", "positive", "Adaptive Winner continuity is stable", "Winner switching remains limited across observations.", "adaptiveWinnerRepeatRate", stability.adaptiveWinnerRepeatRate === null ? null : formatPercent(stability.adaptiveWinnerRepeatRate, policy)));
  if (drift.level === "stable") items.push(item("low-drift", "drift", "positive", "Recent behavior remains close to baseline", "Recent Candidate distribution shows limited change.", "driftScore", drift.driftScore === null ? null : formatNumber(drift.driftScore, policy)));
  if (confidence.level === "strong" || confidence.level === "established") items.push(item("confidence", "confidence", "positive", "Confidence evidence is mature", "The combined analytical evidence supports interpretation.", "confidenceScore", confidence.confidenceScore === null ? null : formatNumber(confidence.confidenceScore, policy)));
  return items;
}

function createRisks(
  counts: SummaryCounts,
  sourceStatus: RuntimeRecommendationAdaptiveObservationSummarySourceStatus,
  agreementRate: number | null,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence,
  policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy
): RuntimeRecommendationAdaptiveObservationSummaryItem[] {
  const items: RuntimeRecommendationAdaptiveObservationSummaryItem[] = [];
  if (counts.observationCount === 0) return [item("no-evidence", "evidence", "critical", "Observation evidence is unavailable", "No Adaptive Recommendation observations are available.", "observationCount", 0)];
  if (counts.incompleteObservationCount > 0) items.push(item("incomplete", "completeness", "warning", "Observation History is incomplete", "Some observations were excluded from comparative analysis.", "incompleteObservationCount", counts.incompleteObservationCount));
  if (stability.level === "unstable") items.push(item("unstable", "stability", "critical", "Adaptive Winner continuity is unstable", "Frequent Winner switching limits long-term interpretation.", "adaptiveWinnerRepeatRate", stability.adaptiveWinnerRepeatRate === null ? null : formatPercent(stability.adaptiveWinnerRepeatRate, policy)));
  if (drift.level === "significant" || drift.level === "emerging") items.push(item("drift", "drift", drift.level === "significant" ? "critical" : "warning", "Adaptive behavior is changing", drift.dominantCandidateChanged ? "The dominant Candidate changed between windows." : "Recent Candidate distribution is diverging from baseline.", "driftScore", drift.driftScore === null ? null : formatNumber(drift.driftScore, policy)));
  if (confidence.level === "low" || confidence.level === "emerging") items.push(item("confidence-risk", "confidence", confidence.level === "low" ? "critical" : "warning", "Confidence evidence is limited", "The combined interpretation should remain provisional.", "confidenceScore", confidence.confidenceScore === null ? null : formatNumber(confidence.confidenceScore, policy)));
  if (agreementRate !== null && agreementRate < 0.4) items.push(item("low-agreement", "agreement", "warning", "Base and Adaptive Winners diverge", "Adaptive outcomes differ materially from Base outcomes.", "agreementRate", formatPercent(agreementRate, policy)));
  if (sourceStatus.unavailableSourceCount > 0 || sourceStatus.partialSourceCount > 0) items.push(item("source-risk", "evidence", "warning", "Summary sources are incomplete", `${sourceStatus.unavailableSourceCount} source(s) unavailable; ${sourceStatus.partialSourceCount} partial.`, "unavailableSourceCount", sourceStatus.unavailableSourceCount));
  return items;
}

function createInsights(
  counts: SummaryCounts,
  agreementRate: number | null,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence,
  policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy
): RuntimeRecommendationAdaptiveObservationSummaryItem[] {
  const items = [item("coverage", "evidence", "info", "Observation coverage", `${counts.comparableObservationCount} of ${counts.observationCount} observations were comparable.`, "comparableObservationCount", counts.comparableObservationCount)];
  if (agreementRate !== null) items.push(item("agreement-pattern", "agreement", agreementRate >= 0.65 ? "positive" : agreementRate < 0.4 ? "warning" : "info", "Base/Adaptive agreement pattern", describeAgreement(agreementRate), "agreementRate", formatPercent(agreementRate, policy)));
  if (stability.adaptiveWinnerRepeatRate !== null) items.push(item("continuity", "stability", stability.level === "stable" ? "positive" : stability.level === "unstable" ? "warning" : "info", "Winner continuity pattern", describeRepeatRate(stability.adaptiveWinnerRepeatRate), "adaptiveWinnerRepeatRate", formatPercent(stability.adaptiveWinnerRepeatRate, policy)));
  if (drift.driftScore !== null) items.push(item("drift-pattern", "drift", drift.level === "significant" ? "critical" : drift.level === "emerging" ? "warning" : "positive", "Recent Drift pattern", `Drift level is ${drift.level}.`, "driftScore", formatNumber(drift.driftScore, policy)));
  if (confidence.confidenceScore !== null) items.push(item("confidence-pattern", "confidence", confidence.level === "strong" || confidence.level === "established" ? "positive" : confidence.level === "low" ? "warning" : "info", "Confidence maturity", `Confidence level is ${confidence.level}.`, "confidenceScore", formatNumber(confidence.confidenceScore, policy)));
  return items;
}

function createRecommendations(
  counts: SummaryCounts,
  sourceStatus: RuntimeRecommendationAdaptiveObservationSummarySourceStatus,
  stability: RuntimeRecommendationAdaptiveObservationStability,
  drift: RuntimeRecommendationAdaptiveObservationDrift,
  confidence: RuntimeRecommendationAdaptiveObservationConfidence
): RuntimeRecommendationAdaptiveObservationSummaryRecommendation[] {
  const items: RuntimeRecommendationAdaptiveObservationSummaryRecommendation[] = [];
  if (counts.observationCount === 0 || counts.comparableObservationCount === 0) {
    return [recommendation("collect-evidence", "high", "Collect more comparable observations", "Continue recording valid Adaptive Recommendation observations.", "Summary analysis cannot mature without comparable history.")];
  }
  if (drift.level === "significant") items.push(recommendation("review-drift", "high", "Review significant Drift", "Compare recent inputs, scores, and Candidate distributions with baseline.", "Significant Drift may represent a real transition or data-quality change."));
  if (stability.level === "unstable") items.push(recommendation("observe-stability", "high", "Continue observing Winner continuity", "Delay promotion until Winner switching decreases.", "Unstable sequences are vulnerable to short-term fluctuation."));
  if (confidence.level === "low" || confidence.level === "emerging") items.push(recommendation("increase-confidence", confidence.level === "low" ? "high" : "medium", "Increase Confidence evidence", "Collect additional observations while monitoring completeness, agreement, Stability, and Drift.", "Confidence measures analytical maturity rather than correctness."));
  if (counts.incompleteObservationCount > 0) items.push(recommendation("improve-completeness", "medium", "Improve Observation completeness", "Review invalid Candidate identifiers, timestamps, and missing fields.", "Incomplete observations reduce representativeness."));
  if (sourceStatus.unavailableSourceCount > 0 || sourceStatus.partialSourceCount > 0) items.push(recommendation("restore-sources", "medium", "Restore complete analytics sources", "Resolve unavailable or partial Statistics, Stability, Drift, and Confidence outputs.", "Summary should explain complete analytics rather than compensate for missing analytics."));
  if (items.length === 0) items.push(recommendation("continue-shadow", "low", "Continue Shadow Mode observation", "Keep collecting observations and verify that Stability, Drift, and Confidence remain consistent.", "Stable evidence should be confirmed across a longer window before promotion."));
  return items;
}

function item(id: string, category: RuntimeRecommendationAdaptiveObservationSummaryItemCategory, severity: RuntimeRecommendationAdaptiveObservationSummaryItemSeverity, title: string, description: string, metricName: string | null, metricValue: number | string | null): RuntimeRecommendationAdaptiveObservationSummaryItem {
  return { id, category, severity, title, description, metricName, metricValue };
}

function recommendation(id: string, priority: "low" | "medium" | "high", title: string, description: string, rationale: string): RuntimeRecommendationAdaptiveObservationSummaryRecommendation {
  return { id, priority, title, description, rationale };
}

function resolveAgreementRate(statistics: RuntimeRecommendationAdaptiveObservationStatistics): number | null {
  if (statistics.sameCandidateRate !== null && Number.isFinite(statistics.sameCandidateRate)) return clamp(statistics.sameCandidateRate);
  if (statistics.changedWinnerRate !== null && Number.isFinite(statistics.changedWinnerRate)) return clamp(1 - statistics.changedWinnerRate);
  return null;
}

function describeAgreement(rate: number): string {
  if (rate >= 0.85) return "Base and Adaptive Winners remain highly aligned.";
  if (rate >= 0.65) return "Base and Adaptive Winners are generally aligned.";
  if (rate >= 0.4) return "Base and Adaptive Winners show mixed agreement.";
  return "Adaptive Winners frequently differ from Base Winners.";
}

function describeRepeatRate(rate: number): string {
  if (rate >= 0.8) return "Adaptive Winner continuity is strongly persistent.";
  if (rate >= 0.6) return "Adaptive Winner continuity is becoming established.";
  if (rate >= 0.4) return "Adaptive Winner continuity remains mixed.";
  return "Adaptive Winners continue to change frequently.";
}

function formatPercent(value: number, policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy): string {
  return `${(clamp(value) * 100).toFixed(policy.decimalPlaces)}%`;
}

function formatNumber(value: number, policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy): string {
  return Number.isFinite(value) ? value.toFixed(policy.decimalPlaces) : "0";
}

function normalizeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function normalizeNullableRate(value: number | null): number | null {
  return value !== null && Number.isFinite(value) ? clamp(value) : null;
}

function normalizeCandidateId(value: string | null): string | null {
  return value !== null && value.trim().length > 0 ? value : null;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function validateSummary(summary: RuntimeRecommendationAdaptiveObservationSummary, warnings: string[]): void {
  if (summary.comparableObservationCount + summary.incompleteObservationCount !== summary.observationCount) warnings.push("Summary counts are inconsistent.");
  if (summary.headline.trim().length === 0) warnings.push("Summary headline is empty.");
  if (summary.overview.trim().length === 0) warnings.push("Summary overview is empty.");
  if (summary.primaryInsight.trim().length === 0) warnings.push("Summary primary insight is empty.");
  for (const [name, value] of [["agreementRate", summary.agreementRate], ["stabilityRate", summary.stabilityRate], ["driftScore", summary.driftScore], ["confidenceScore", summary.confidenceScore]] as const) {
    if (value !== null && (!Number.isFinite(value) || value < 0 || value > 1)) warnings.push(`${name} is outside the valid range.`);
  }
}

export function cloneRuntimeRecommendationAdaptiveObservationSummary(summary: RuntimeRecommendationAdaptiveObservationSummary): RuntimeRecommendationAdaptiveObservationSummary {
  return {
    ...summary,
    strengths: summary.strengths.map((value) => ({ ...value })),
    risks: summary.risks.map((value) => ({ ...value })),
    insights: summary.insights.map((value) => ({ ...value })),
    recommendations: summary.recommendations.map((value) => ({ ...value })),
    sourceStatus: { ...summary.sourceStatus },
  };
}

export function cloneRuntimeRecommendationAdaptiveObservationSummaryDiagnostics(diagnostics: RuntimeRecommendationAdaptiveObservationSummaryDiagnostics): RuntimeRecommendationAdaptiveObservationSummaryDiagnostics {
  return { ...diagnostics, sourceStatus: { ...diagnostics.sourceStatus }, warnings: [...diagnostics.warnings] };
}

export function cloneRuntimeRecommendationAdaptiveObservationSummaryPolicy(policy: RuntimeRecommendationAdaptiveObservationSummaryPolicy): RuntimeRecommendationAdaptiveObservationSummaryPolicy {
  return { ...policy };
}

export function normalizeRuntimeRecommendationAdaptiveObservationSummaryPolicy(policy?: PartialRuntimeRecommendationAdaptiveObservationSummaryPolicy): RuntimeRecommendationAdaptiveObservationSummaryPolicy {
  const fallback = DEFAULT_RUNTIME_RECOMMENDATION_ADAPTIVE_OBSERVATION_SUMMARY_POLICY;
  return {
    maximumStrengthCount: normalizePositiveInteger(policy?.maximumStrengthCount, fallback.maximumStrengthCount),
    maximumRiskCount: normalizePositiveInteger(policy?.maximumRiskCount, fallback.maximumRiskCount),
    maximumInsightCount: normalizePositiveInteger(policy?.maximumInsightCount, fallback.maximumInsightCount),
    maximumRecommendationCount: normalizePositiveInteger(policy?.maximumRecommendationCount, fallback.maximumRecommendationCount),
    decimalPlaces: normalizeDecimalPlaces(policy?.decimalPlaces, fallback.decimalPlaces),
    includeStatusExplanation: typeof policy?.includeStatusExplanation === "boolean" ? policy.includeStatusExplanation : fallback.includeStatusExplanation,
    includeMetricEvidence: typeof policy?.includeMetricEvidence === "boolean" ? policy.includeMetricEvidence : fallback.includeMetricEvidence,
  };
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback;
}

function normalizeDecimalPlaces(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(8, Math.floor(value))) : fallback;
}