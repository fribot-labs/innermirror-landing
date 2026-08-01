import type {
    RuntimeV2RecommendationChangeType,
    RuntimeV2RecommendationDirection,
    RuntimeV2RecommendationEvolutionPattern,
    RuntimeV2RecommendationIntegrationResult,
    RuntimeV2RecommendationState,
} from "../types/runtimeV2Recommendation";

import type {
    RuntimeV2RecommendationTimelineItemStatus,
    RuntimeV2RecommendationTimelinePresentation,
} from "./runtimeV2RecommendationTimelinePresentationTypes";

/**
 * Converts Runtime V2 Recommendation History into a presentation model.
 *
 * This function does not:
 *
 * - create Recommendation History
 * - compare Recommendations
 * - infer Recommendation Evolution
 * - generate Predictive Intelligence
 * - sort or reinterpret the Runtime Timeline
 *
 * It only projects existing Runtime output into a Landing presentation.
 */
export function deriveRuntimeV2RecommendationTimelinePresentation(
  result:
    RuntimeV2RecommendationIntegrationResult | null | undefined
): RuntimeV2RecommendationTimelinePresentation | null {
  if (!result) {
    return null;
  }

  const currentRecommendation =
    result.currentRecommendation;

  /**
   * Runtime normally returns a Timeline.
   *
   * The fallback preserves presentation compatibility when an older
   * Runtime response contains only the current Recommendation and State.
   */
  const sourceEntries =
    result.timeline?.entries &&
    result.timeline.entries.length > 0
      ? result.timeline.entries
      : [
          {
            recommendation:
              currentRecommendation,

            state:
              result.state,
          },
        ];

  /**
   * Runtime owns Timeline order.
   *
   * Landing intentionally does not sort these entries because doing so
   * would reinterpret the Runtime result.
   */
  const items =
    sourceEntries.map(
      (entry) => {
        const recommendation =
          entry.recommendation;

        const isCurrent =
          recommendation.id ===
            currentRecommendation.id ||
          entry.state.status ===
            "current";

        const status =
          normalizeRecommendationStatus(
            entry.state.status,
            isCurrent
          );

        return {
          id:
            recommendation.id,

          title:
            recommendation.title,

          summary:
            recommendation.summary,

          direction:
            recommendation.direction,

          directionLabel:
            formatRecommendationDirection(
              recommendation.direction
            ),

          priority:
            recommendation.priority,

          confidence:
            recommendation.confidence,

          status,

          statusLabel:
            formatRecommendationStatus(
              status
            ),

          isCurrent,

          createdAt:
            recommendation.createdAt,

          createdAtLabel:
            formatRecommendationDateTime(
              recommendation.createdAt
            ),
        };
      }
    );

  const comparison =
    result.comparison;

  const evolution =
    result.evolution;

  const prediction =
    result.predictiveIntelligenceResult;

  const recommendationCount =
    items.length;

  return {
    projectId:
      currentRecommendation.projectId,

    headline:
      recommendationCount > 1
        ? "Recommendation direction over time"
        : "Recommendation history is beginning",

    summary:
      recommendationCount > 1
        ? `${recommendationCount} Runtime Recommendations are available for comparison.`
        : "The first Runtime Recommendation has been recorded.",

    items,

    currentRecommendationId:
      result.timeline
        ?.currentRecommendationId ??
      currentRecommendation.id ??
      null,

    change: {
      changeType:
        comparison?.changeType ??
        null,

      changeLabel:
        formatRecommendationChangeType(
          comparison?.changeType
        ),

      summary:
        createRecommendationChangeSummary(
          comparison?.changeType,
          comparison?.summary
        ),

      changedFields: [
        ...(comparison?.changedFields ?? []),
      ],
    },

    evolutionPattern:
      evolution?.pattern ??
      null,

    evolutionLabel:
      formatRecommendationEvolutionPattern(
        evolution?.pattern
      ),

    evolutionSummary:
      evolution?.summary ??
      null,

    prediction:
      prediction
        ? {
            direction:
              prediction.likelyNextDirection,

            directionLabel:
              prediction.likelyNextDirectionLabel,

            rationale:
              prediction.rationale,

            conditions: [
              ...prediction.conditions,
            ],

            confidence:
              prediction.confidence,

            generatedAt:
              prediction.generatedAt,
          }
        : null,

    recommendationCount,

    generatedAt:
      result.timeline?.generatedAt ??
      null,
  };
}

/* ------------------------------------------------------------------ */
/* Recommendation Direction                                           */
/* ------------------------------------------------------------------ */

function formatRecommendationDirection(
  direction:
    RuntimeV2RecommendationDirection
): string {
  switch (direction) {
    case "reflection-strengthening":
      return "Reflection Strengthening";

    case "runtime-stabilization":
      return "Runtime Stabilization";

    case "ux-stabilization":
      return "UX Stabilization";

    case "knowledge-compression":
      return "Knowledge Compression";

    case "project-identity-stabilization":
      return "Project Identity Stabilization";

    case "architecture-stabilization":
      return "Architecture Stabilization";

    case "implementation-progress":
      return "Implementation Progress";

    case "signal-collection":
      return "Signal Collection";

    case "unknown":
    default:
      return "Direction Exploration";
  }
}

/* ------------------------------------------------------------------ */
/* Recommendation State                                               */
/* ------------------------------------------------------------------ */

function normalizeRecommendationStatus(
  status:
    RuntimeV2RecommendationState["status"],
  isCurrent:
    boolean
): RuntimeV2RecommendationTimelineItemStatus {
  if (isCurrent) {
    return "current";
  }

  if (status === "superseded") {
    return "superseded";
  }

  if (status === "dismissed") {
    return "dismissed";
  }

  return "unknown";
}

function formatRecommendationStatus(
  status:
    RuntimeV2RecommendationTimelineItemStatus
): string {
  switch (status) {
    case "current":
      return "Current";

    case "superseded":
      return "Previous";

    case "dismissed":
      return "Dismissed";

    case "unknown":
    default:
      return "Historical";
  }
}

/* ------------------------------------------------------------------ */
/* Recommendation Comparison                                          */
/* ------------------------------------------------------------------ */

function formatRecommendationChangeType(
  changeType:
    RuntimeV2RecommendationChangeType | undefined
): string {
  switch (changeType) {
    case "initial":
      return "Initial recommendation";

    case "repeated":
      return "Direction maintained";

    case "refined":
      return "Recommendation refined";

    case "shifted":
      return "Direction changed";

    case "intensified":
      return "Priority increased";

    case "deprioritized":
      return "Priority decreased";

    default:
      return "No comparison is available yet";
  }
}

/* ------------------------------------------------------------------ */
/* Recommendation Evolution                                           */
/* ------------------------------------------------------------------ */

function formatRecommendationEvolutionPattern(
  pattern:
    RuntimeV2RecommendationEvolutionPattern | undefined
): string | null {
  switch (pattern) {
    case "stable-direction":
      return "Stable direction";

    case "progressive-refinement":
      return "Progressive refinement";

    case "strategic-shift":
      return "Strategic shift";

    case "oscillation":
      return "Direction oscillation";

    case "early-formation":
      return "Early formation";

    case "unclear":
      return "Unclear evolution";

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Date Presentation                                                   */
/* ------------------------------------------------------------------ */

function formatRecommendationDateTime(
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

function createRecommendationChangeSummary(
  changeType:
    RuntimeV2RecommendationChangeType | undefined,
  summary:
    string | undefined
): string | null {
  if (changeType === "initial") {
    return "This is the first recorded Recommendation for the current project.";
  }

  const normalizedSummary =
    summary?.trim();

  return normalizedSummary
    ? normalizedSummary
    : null;
}