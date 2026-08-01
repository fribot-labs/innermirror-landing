import type {
    RuntimeV2RecommendationAlignment,
    RuntimeV2RecommendationChangeType,
    RuntimeV2RecommendationDirection,
    RuntimeV2RecommendationEvolutionPattern,
    RuntimeV2RecommendationIntegrationResult,
} from "../types/runtimeV2Recommendation";

import type {
    RuntimeV2RecommendationPresentation,
} from "./runtimeV2RecommendationPresentationTypes";

export function deriveRuntimeV2RecommendationPresentation(
  result:
    RuntimeV2RecommendationIntegrationResult | null | undefined
): RuntimeV2RecommendationPresentation | null {
  if (!result) {
    return null;
  }

  const recommendation =
    result.currentRecommendation;

  const prediction =
    result.predictiveIntelligenceResult;

  return {
    id:
      recommendation.id,

    title:
      recommendation.title,

    summary:
      recommendation.summary,

    action:
      recommendation.recommendedAction,

    rationale:
      recommendation.rationale,

    steps: [
      ...recommendation.recommendedSteps,
    ],

    direction:
      recommendation.direction,

    directionLabel:
      formatDirection(
        recommendation.direction
      ),

    priority:
      recommendation.priority,

    confidence:
      recommendation.confidence,

    changeType:
      result.comparison?.changeType ??
      null,

    changeLabel:
      formatChangeType(
        result.comparison?.changeType
      ),

    alignment:
      result.observation?.alignment ??
      null,

    alignmentLabel:
      formatAlignment(
        result.observation?.alignment
      ),

    observationSummary:
      result.observation?.summary ??
      null,

    evolutionPattern:
      result.evolution?.pattern ??
      null,

    evolutionLabel:
      formatEvolutionPattern(
        result.evolution?.pattern
      ),

    evolutionSummary:
      result.evolution?.summary ??
      null,

    predictedDirection:
      prediction?.likelyNextDirection ??
      null,

    predictedDirectionLabel:
      prediction?.likelyNextDirectionLabel ??
      null,

    predictionRationale:
      prediction?.rationale ??
      null,

    predictionConditions: [
      ...(prediction?.conditions ?? []),
    ],

    timelineEntryCount:
      result.timeline?.entries.length ??
      0,

    evidenceCount:
      recommendation.evidence.length,

    createdAt:
      recommendation.createdAt,
  };
}

function formatDirection(
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

function formatChangeType(
  changeType:
    RuntimeV2RecommendationChangeType | undefined
): string {
  switch (changeType) {
    case "repeated":
      return "Recommendation continues";

    case "refined":
      return "Recommendation became more specific";

    case "shifted":
      return "Recommendation direction changed";

    case "intensified":
      return "Recommendation priority increased";

    case "deprioritized":
      return "Recommendation priority decreased";

    case "initial":
    default:
      return "Initial recommendation";
  }
}

function formatAlignment(
  alignment:
    RuntimeV2RecommendationAlignment | undefined
): string {
  switch (alignment) {
    case "aligned":
      return "Current project activity follows this direction.";

    case "partially-aligned":
      return "Some project activity follows this direction.";

    case "not-yet-visible":
      return "This direction is not yet visible in recent activity.";

    case "diverged":
      return "Recent activity is moving in another direction.";

    case "insufficient-evidence":
    default:
      return "More project evidence is needed.";
  }
}

function formatEvolutionPattern(
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
      return "Early direction formation";

    case "unclear":
      return "Unclear direction";

    default:
      return null;
  }
}