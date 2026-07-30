import type {
    RecommendationPredictiveIntelligenceUpdateResult,
} from "../runtime-recommendation-evolution";

import {
    cloneRuntimePredictivePresentation,
} from "./cloneRuntimePredictivePresentation";

import type {
    RuntimePredictiveEmphasis,
    RuntimePredictiveInsight,
    RuntimePredictivePresentation,
    RuntimePredictivePresentationStatus,
    RuntimePredictivePrimaryItem,
} from "./runtimePredictivePresentationTypes";

import {
    validateRuntimePredictivePresentation,
} from "./validateRuntimePredictivePresentation";

/* ------------------------------------------------------------------ */
/* Status Mapping                                                     */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Predictive Intelligence 상태를
 * Runtime Presentation 상태로 변환합니다.
 */
function deriveRuntimePredictiveStatus(
  result:
    RecommendationPredictiveIntelligenceUpdateResult,
): RuntimePredictivePresentationStatus {
  switch (
    result.analysis.state
  ) {
    case "predicting":
      return "available";

    case "insufficient":
      return "insufficient";

    case "unavailable":
      return "unavailable";

    default:
      return "unavailable";
  }
}

/* ------------------------------------------------------------------ */
/* Formatting                                                         */
/* ------------------------------------------------------------------ */

/**
 * 내부 enum 문자열을 Runtime UI용 문자열로 변환합니다.
 *
 * preserve-current-recommendation
 *
 * →
 *
 * Preserve Current Recommendation
 */
function formatPredictiveLabel(
  value:
    string,
): string {
  return value
    .split("-")
    .filter(Boolean)
    .map(
      part =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

/* ------------------------------------------------------------------ */
/* Text Normalization                                                 */
/* ------------------------------------------------------------------ */

function normalizeOptionalText(
  value:
    string | null | undefined,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length >
    0
    ? normalized
    : null;
}

function normalizeTextList(
  values:
    string[],
): string[] {
  return Array.from(
    new Set(
      values
        .map(
          value =>
            value.trim(),
        )
        .filter(Boolean),
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Confidence                                                         */
/* ------------------------------------------------------------------ */

function normalizeConfidence(
  value:
    number | null | undefined,
): number | null {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return null;
  }

  return Math.min(
    1,
    Math.max(
      0,
      value,
    ),
  );
}

function toConfidencePercentage(
  value:
    number | null,
): number | null {
  if (
    value ===
    null
  ) {
    return null;
  }

  return Math.round(
    value * 100,
  );
}

/* ------------------------------------------------------------------ */
/* Severity                                                           */
/* ------------------------------------------------------------------ */

function mapSeverityToEmphasis(
  severity:
    string,
): RuntimePredictiveEmphasis {
  switch (
    severity
  ) {
    case "critical":
    case "high":
      return "high";

    case "moderate":
      return "moderate";

    default:
      return "low";
  }
}

/* ------------------------------------------------------------------ */
/* Primary Candidate                                                  */
/* ------------------------------------------------------------------ */

/**
 * rank=1 후보를 우선 사용합니다.
 *
 * rank가 없는 경우 첫 번째 후보를 사용합니다.
 */
function findPrimaryByRank<
  TItem extends {
    rank:
      number;
  },
>(
  items:
    TItem[],
): TItem | null {
  return (
    items.find(
      item =>
        item.rank ===
        1,
    ) ??
    items[0] ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Primary Item                                                       */
/* ------------------------------------------------------------------ */

function createPrimaryItem(
  label:
    string,

  value:
    string,

  confidence:
    number | null,
): RuntimePredictivePrimaryItem {
  return {
    label,

    value:
      formatPredictiveLabel(
        value,
      ),

    confidence:
      normalizeConfidence(
        confidence,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Insight                                                            */
/* ------------------------------------------------------------------ */

function createInsight(
  title:
    string,

  description:
    string,

  severity:
    string,
): RuntimePredictiveInsight {
  return {
    title:
      formatPredictiveLabel(
        title,
      ),

    description,

    emphasis:
      mapSeverityToEmphasis(
        severity,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Predictive Result Structural View                                  */
/* ------------------------------------------------------------------ */

/**
 * Presentation 계층이 필요한 최소 데이터만 읽기 위한 내부 구조입니다.
 *
 * Runtime Domain Result 전체 계약을 다시 정의하지 않고,
 * Presentation 생성에 필요한 필드만 선택적으로 참조합니다.
 */
type PredictiveCandidateView = {
  rank:
    number;

  value:
    string;

  confidence:
    number | null;
};

type PredictiveInsightView = {
  title:
    string;

  description:
    string;

  severity:
    string;
};

type PredictiveAnalysisView = {
  headline?:
    unknown;

  summary?:
    unknown;

  primaryPrediction?:
    unknown;

  confidence?:
    unknown;

  predictedAt?:
    unknown;

  stateCandidates?:
    unknown;

  predictedStateCandidates?:
    unknown;

  strategyCandidates?:
    unknown;

  predictedStrategyCandidates?:
    unknown;

  decisionCandidates?:
    unknown;

  predictedDecisionCandidates?:
    unknown;

  risks?:
    unknown;

  opportunities?:
    unknown;

  evidence?:
    unknown;

  warnings?:
    unknown;
};

type PredictiveResultView = {
  analysis?:
    PredictiveAnalysisView;

  predictedAt?:
    unknown;

  updatedAt?:
    unknown;
};

/* ------------------------------------------------------------------ */
/* Unknown Value Readers                                              */
/* ------------------------------------------------------------------ */

function isRecord(
  value:
    unknown,
): value is Record<string, unknown> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  );
}

function readString(
  value:
    unknown,
): string | null {
  return typeof value ===
    "string"
    ? normalizeOptionalText(
        value,
      )
    : null;
}

function readFiniteNumber(
  value:
    unknown,
): number | null {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : null;
}

function readUnknownArray(
  value:
    unknown,
): unknown[] {
  return Array.isArray(
    value,
  )
    ? value
    : [];
}

function readStringArray(
  value:
    unknown,
): string[] {
  return normalizeTextList(
    readUnknownArray(
      value,
    )
      .map(
        item =>
          readString(
            item,
          ),
      )
      .filter(
        (
          item,
        ): item is string =>
          item !== null,
      ),
  );
}

/* ------------------------------------------------------------------ */
/* Candidate Normalization                                            */
/* ------------------------------------------------------------------ */

function readCandidateValue(
  candidate:
    Record<string, unknown>,
): string | null {
  const possibleValues = [
    candidate.value,
    candidate.state,
    candidate.strategy,
    candidate.decision,
    candidate.name,
    candidate.kind,
    candidate.type,
    candidate.label,
  ];

  for (
    const possibleValue of possibleValues
  ) {
    const value =
      readString(
        possibleValue,
      );

    if (
      value !==
      null
    ) {
      return value;
    }
  }

  return null;
}

function readCandidateConfidence(
  candidate:
    Record<string, unknown>,
): number | null {
  const possibleValues = [
    candidate.confidence,
    candidate.probability,
    candidate.score,
  ];

  for (
    const possibleValue of possibleValues
  ) {
    const value =
      readFiniteNumber(
        possibleValue,
      );

    if (
      value !==
      null
    ) {
      return normalizeConfidence(
        value,
      );
    }
  }

  return null;
}

function normalizeCandidateList(
  value:
    unknown,
): PredictiveCandidateView[] {
  return readUnknownArray(
    value,
  )
    .map(
      (
        candidate,
        index,
      ): PredictiveCandidateView | null => {
        if (
          !isRecord(
            candidate,
          )
        ) {
          return null;
        }

        const candidateValue =
          readCandidateValue(
            candidate,
          );

        if (
          candidateValue ===
          null
        ) {
          return null;
        }

        const candidateRank =
          readFiniteNumber(
            candidate.rank,
          );

        return {
          rank:
            candidateRank ===
            null
              ? index + 1
              : Math.max(
                  1,
                  Math.round(
                    candidateRank,
                  ),
                ),

          value:
            candidateValue,

          confidence:
            readCandidateConfidence(
              candidate,
            ),
        };
      },
    )
    .filter(
      (
        candidate,
      ): candidate is PredictiveCandidateView =>
        candidate !==
        null,
    );
}

function derivePrimaryItemFromCandidates(
  label:
    string,

  values:
    unknown,
): RuntimePredictivePrimaryItem | null {
  const candidates =
    normalizeCandidateList(
      values,
    );

  const primaryCandidate =
    findPrimaryByRank(
      candidates,
    );

  if (
    primaryCandidate ===
    null
  ) {
    return null;
  }

  return createPrimaryItem(
    label,
    primaryCandidate.value,
    primaryCandidate.confidence,
  );
}

/* ------------------------------------------------------------------ */
/* Insight Normalization                                              */
/* ------------------------------------------------------------------ */

function readInsightTitle(
  value:
    Record<string, unknown>,
): string | null {
  const possibleValues = [
    value.title,
    value.label,
    value.name,
    value.type,
    value.kind,
  ];

  for (
    const possibleValue of possibleValues
  ) {
    const title =
      readString(
        possibleValue,
      );

    if (
      title !==
      null
    ) {
      return title;
    }
  }

  return null;
}

function readInsightDescription(
  value:
    Record<string, unknown>,
): string | null {
  const possibleValues = [
    value.description,
    value.summary,
    value.message,
    value.reason,
    value.detail,
  ];

  for (
    const possibleValue of possibleValues
  ) {
    const description =
      readString(
        possibleValue,
      );

    if (
      description !==
      null
    ) {
      return description;
    }
  }

  return null;
}

function readInsightSeverity(
  value:
    Record<string, unknown>,
): string {
  return (
    readString(
      value.severity,
    ) ??
    readString(
      value.emphasis,
    ) ??
    readString(
      value.level,
    ) ??
    "low"
  );
}

function normalizeInsightList(
  value:
    unknown,
): PredictiveInsightView[] {
  return readUnknownArray(
    value,
  )
    .map(
      (
        insight,
      ): PredictiveInsightView | null => {
        if (
          !isRecord(
            insight,
          )
        ) {
          return null;
        }

        const title =
          readInsightTitle(
            insight,
          );

        const description =
          readInsightDescription(
            insight,
          );

        if (
          title ===
            null &&
          description ===
            null
        ) {
          return null;
        }

        return {
          title:
            title ??
            "Predictive Insight",

          description:
            description ??
            title ??
            "Predictive insight is available.",

          severity:
            readInsightSeverity(
              insight,
            ),
        };
      },
    )
    .filter(
      (
        insight,
      ): insight is PredictiveInsightView =>
        insight !==
        null,
    );
}

function derivePrimaryInsight(
  value:
    unknown,
): RuntimePredictiveInsight | null {
  const primaryInsight =
    normalizeInsightList(
      value,
    )[0] ??
    null;

  if (
    primaryInsight ===
    null
  ) {
    return null;
  }

  return createInsight(
    primaryInsight.title,
    primaryInsight.description,
    primaryInsight.severity,
  );
}

/* ------------------------------------------------------------------ */
/* Candidate Source Selection                                         */
/* ------------------------------------------------------------------ */

function selectFirstAvailableCandidateSource(
  ...sources:
    unknown[]
): unknown {
  for (
    const source of sources
  ) {
    if (
      Array.isArray(
        source,
      ) &&
      source.length >
        0
    ) {
      return source;
    }
  }

  return [];
}

/* ------------------------------------------------------------------ */
/* Presentation Text                                                  */
/* ------------------------------------------------------------------ */

function deriveHeadline(
  status:
    RuntimePredictivePresentationStatus,

  sourceHeadline:
    unknown,
): string {
  const normalizedHeadline =
    readString(
      sourceHeadline,
    );

  if (
    normalizedHeadline !==
    null
  ) {
    return normalizedHeadline;
  }

  switch (
    status
  ) {
    case "available":
      return "Likely Recommendation Evolution";

    case "insufficient":
      return "Prediction Needs More Evidence";

    case "unavailable":
      return "Prediction Is Currently Unavailable";
  }
}

function deriveSummary(
  status:
    RuntimePredictivePresentationStatus,

  sourceSummary:
    unknown,
): string {
  const normalizedSummary =
    readString(
      sourceSummary,
    );

  if (
    normalizedSummary !==
    null
  ) {
    return normalizedSummary;
  }

  switch (
    status
  ) {
    case "available":
      return "The runtime has identified a likely next direction from the current recommendation evidence.";

    case "insufficient":
      return "The current evidence is not yet sufficient to produce a reliable recommendation prediction.";

    case "unavailable":
      return "A recommendation prediction could not be produced from the current runtime result.";
  }
}

/* ------------------------------------------------------------------ */
/* Primary Prediction                                                 */
/* ------------------------------------------------------------------ */

function derivePrimaryPrediction(
  sourcePrimaryPrediction:
    unknown,

  statePrediction:
    RuntimePredictivePrimaryItem | null,

  strategyPrediction:
    RuntimePredictivePrimaryItem | null,

  decisionPrediction:
    RuntimePredictivePrimaryItem | null,
): string | null {
  const normalizedPrimaryPrediction =
    readString(
      sourcePrimaryPrediction,
    );

  if (
    normalizedPrimaryPrediction !==
    null
  ) {
    return normalizedPrimaryPrediction;
  }

  return (
    decisionPrediction?.value ??
    strategyPrediction?.value ??
    statePrediction?.value ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Overall Confidence                                                 */
/* ------------------------------------------------------------------ */

function readOverallConfidence(
  value:
    unknown,
): number | null {
  const directValue =
    readFiniteNumber(
      value,
    );

  if (
    directValue !==
    null
  ) {
    return normalizeConfidence(
      directValue,
    );
  }

  if (
    !isRecord(
      value,
    )
  ) {
    return null;
  }

  const possibleValues = [
    value.score,
    value.value,
    value.confidence,
    value.probability,
  ];

  for (
    const possibleValue of possibleValues
  ) {
    const confidence =
      readFiniteNumber(
        possibleValue,
      );

    if (
      confidence !==
      null
    ) {
      return normalizeConfidence(
        confidence,
      );
    }
  }

  return null;
}

function deriveConfidenceDisclosure(
  status:
    RuntimePredictivePresentationStatus,

  confidence:
    number | null,
): string {
  if (
    status ===
    "unavailable"
  ) {
    return "No reliable predictive confidence is currently available.";
  }

  if (
    status ===
    "insufficient"
  ) {
    return "This prediction is withheld because the current evidence is not yet sufficient.";
  }

  if (
    confidence ===
    null
  ) {
    return "This is a conditional prediction based on currently available recommendation evidence.";
  }

  return "This confidence represents a conditional estimate, not a guaranteed future outcome.";
}

/* ------------------------------------------------------------------ */
/* Prediction Date                                                    */
/* ------------------------------------------------------------------ */

function derivePredictedAt(
  ...values:
    unknown[]
): string {
  for (
    const value of values
  ) {
    const candidate =
      readString(
        value,
      );

    if (
      candidate !==
        null &&
      !Number.isNaN(
        Date.parse(
          candidate,
        ),
      )
    ) {
      return new Date(
        candidate,
      ).toISOString();
    }
  }

  return new Date().toISOString();
}

/* ------------------------------------------------------------------ */
/* Main Derivation                                                    */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Predictive Intelligence의 도메인 결과를
 * Runtime UI용 Presentation 계약으로 변환합니다.
 *
 * 이 함수는 새로운 Prediction을 계산하지 않습니다.
 *
 * 기존 도메인 결과에서 사용자에게 필요한 정보만 선택하고,
 * 표시 가능한 형태로 정규화합니다.
 */
export function deriveRuntimePredictivePresentation(
  result:
    RecommendationPredictiveIntelligenceUpdateResult | null,
): RuntimePredictivePresentation | null {
  if (
    result ===
    null
  ) {
    return null;
  }

  const resultView =
    result as unknown as PredictiveResultView;

  const analysis =
    resultView.analysis ??
    {};

  const status =
    deriveRuntimePredictiveStatus(
      result,
    );

  const stateCandidateSource =
    selectFirstAvailableCandidateSource(
      analysis.predictedStateCandidates,
      analysis.stateCandidates,
    );

  const strategyCandidateSource =
    selectFirstAvailableCandidateSource(
      analysis.predictedStrategyCandidates,
      analysis.strategyCandidates,
    );

  const decisionCandidateSource =
    selectFirstAvailableCandidateSource(
      analysis.predictedDecisionCandidates,
      analysis.decisionCandidates,
    );

  const statePrediction =
    derivePrimaryItemFromCandidates(
      "Likely State",
      stateCandidateSource,
    );

  const strategyPrediction =
    derivePrimaryItemFromCandidates(
      "Likely Strategy",
      strategyCandidateSource,
    );

  const decisionPrediction =
    derivePrimaryItemFromCandidates(
      "Likely Runtime Decision",
      decisionCandidateSource,
    );

  const overallConfidence =
    readOverallConfidence(
      analysis.confidence,
    );

  const presentation:
    RuntimePredictivePresentation = {
      status,

      headline:
        deriveHeadline(
          status,
          analysis.headline,
        ),

      summary:
        deriveSummary(
          status,
          analysis.summary,
        ),

      primaryPrediction:
        derivePrimaryPrediction(
          analysis.primaryPrediction,
          statePrediction,
          strategyPrediction,
          decisionPrediction,
        ),

      statePrediction,

      strategyPrediction,

      decisionPrediction,

      risk:
        derivePrimaryInsight(
          analysis.risks,
        ),

      opportunity:
        derivePrimaryInsight(
          analysis.opportunities,
        ),

      confidence: {
        score:
          overallConfidence,

        percentage:
          toConfidencePercentage(
            overallConfidence,
          ),

        disclosure:
          deriveConfidenceDisclosure(
            status,
            overallConfidence,
          ),
      },

      evidence:
        readStringArray(
          analysis.evidence,
        ),

      warnings:
        readStringArray(
          analysis.warnings,
        ),

      predictedAt:
        derivePredictedAt(
          analysis.predictedAt,
          resultView.predictedAt,
          resultView.updatedAt,
        ),
    };

  validateRuntimePredictivePresentation(
    presentation,
  );

  return cloneRuntimePredictivePresentation(
    presentation,
  );
}