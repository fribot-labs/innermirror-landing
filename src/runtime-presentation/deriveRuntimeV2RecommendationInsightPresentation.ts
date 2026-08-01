import type {
    RuntimeV2RecommendationConfidence,
    RuntimeV2RecommendationInsight,
    RuntimeV2RecommendationInsightPattern,
} from "../types/runtimeV2Recommendation";

import type {
    RuntimeV2RecommendationInsightPresentation,
    RuntimeV2RecommendationInsightTone,
} from "./runtimeV2RecommendationInsightPresentationTypes";

/**
 * Converts Runtime V2 Recommendation Insight into a
 * Landing-specific presentation model.
 *
 * This function does not:
 *
 * - create Recommendation Insight
 * - resolve Insight patterns
 * - calculate confidence
 * - interpret Runtime Evidence
 * - modify the Runtime response
 *
 * It only converts existing Runtime output into display-safe values.
 */
export function deriveRuntimeV2RecommendationInsightPresentation(
  insight:
    RuntimeV2RecommendationInsight | null | undefined
): RuntimeV2RecommendationInsightPresentation | null {
  if (!insight) {
    return null;
  }

  return {
    headline:
      insight.headline,

    summary:
      insight.summary,

    keyInsight:
      insight.keyInsight,

    supportingReasons: [
      ...insight.supportingReasons,
    ],

    pattern:
      insight.pattern,

    patternLabel:
      formatRecommendationInsightPattern(
        insight.pattern
      ),

    confidence:
      insight.confidence,

    confidenceLabel:
      formatRecommendationInsightConfidence(
        insight.confidence
      ),

    tone:
      resolveRecommendationInsightTone(
        insight.pattern
      ),

    evidenceCount:
      insight.evidence.length,

    generatedAt:
      insight.generatedAt,

    generatedAtLabel:
      formatRecommendationInsightDateTime(
        insight.generatedAt
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Insight Pattern                                                    */
/* ------------------------------------------------------------------ */

function formatRecommendationInsightPattern(
  pattern:
    RuntimeV2RecommendationInsightPattern
): string {
  switch (pattern) {
    case "early-understanding":
      return "Early understanding";

    case "stable-but-under-evidenced":
      return "Stable, limited evidence";

    case "stable-and-aligned":
      return "Stable and aligned";

    case "progressing":
      return "Progressive refinement";

    case "strategic-transition":
      return "Strategic transition";

    case "direction-conflict":
      return "Direction conflict";

    case "uncertain":
    default:
      return "Uncertain interpretation";
  }
}

/* ------------------------------------------------------------------ */
/* Insight Confidence                                                 */
/* ------------------------------------------------------------------ */

function formatRecommendationInsightConfidence(
  confidence:
    RuntimeV2RecommendationConfidence
): string {
  switch (confidence) {
    case "high":
      return "High confidence";

    case "medium":
      return "Medium confidence";

    case "low":
    default:
      return "Low confidence";
  }
}

/* ------------------------------------------------------------------ */
/* Insight Tone                                                       */
/* ------------------------------------------------------------------ */

/**
 * Maps a Runtime Insight pattern to a presentation-only tone.
 *
 * Tone is used only for Landing CSS and does not alter Runtime meaning.
 */
function resolveRecommendationInsightTone(
  pattern:
    RuntimeV2RecommendationInsightPattern
): RuntimeV2RecommendationInsightTone {
  switch (pattern) {
    case "early-understanding":
    case "stable-but-under-evidenced":
      return "forming";

    case "stable-and-aligned":
      return "stable";

    case "progressing":
      return "progressing";

    case "strategic-transition":
      return "transition";

    case "direction-conflict":
      return "warning";

    case "uncertain":
    default:
      return "uncertain";
  }
}

/* ------------------------------------------------------------------ */
/* Insight Timestamp                                                  */
/* ------------------------------------------------------------------ */

function formatRecommendationInsightDateTime(
  value:
    string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(date);
}