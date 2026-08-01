import type {
    RuntimeV2RecommendationChangeType,
    RuntimeV2RecommendationConfidence,
    RuntimeV2RecommendationDirection,
    RuntimeV2RecommendationEvolutionPattern,
    RuntimeV2RecommendationPriority,
} from "../types/runtimeV2Recommendation";

export type RuntimeV2RecommendationTimelineItemStatus =
  | "current"
  | "superseded"
  | "dismissed"
  | "unknown";

export type RuntimeV2RecommendationTimelineItemPresentation = {
  id: string;

  title: string;

  summary: string;

  direction:
    RuntimeV2RecommendationDirection;

  directionLabel:
    string;

  priority:
    RuntimeV2RecommendationPriority;

  confidence:
    RuntimeV2RecommendationConfidence;

  status:
    RuntimeV2RecommendationTimelineItemStatus;

  statusLabel:
    string;

  isCurrent:
    boolean;

  createdAt:
    string;

  createdAtLabel:
    string;
};

export type RuntimeV2RecommendationTimelineChangePresentation = {
  changeType:
    RuntimeV2RecommendationChangeType | null;

  changeLabel:
    string;

  summary:
    string | null;

  changedFields:
    string[];
};

export type RuntimeV2RecommendationTimelinePredictionPresentation = {
  direction:
    RuntimeV2RecommendationDirection;

  directionLabel:
    string;

  rationale:
    string;

  conditions:
    string[];

  confidence:
    RuntimeV2RecommendationConfidence;

  generatedAt:
    string;
};

export type RuntimeV2RecommendationTimelinePresentation = {
  projectId:
    string;

  headline:
    string;

  summary:
    string;

  items:
    RuntimeV2RecommendationTimelineItemPresentation[];

  currentRecommendationId:
    string | null;

  change:
    RuntimeV2RecommendationTimelineChangePresentation;

  evolutionPattern:
    RuntimeV2RecommendationEvolutionPattern | null;

  evolutionLabel:
    string | null;

  evolutionSummary:
    string | null;

  prediction:
    RuntimeV2RecommendationTimelinePredictionPresentation | null;

  recommendationCount:
    number;

  generatedAt:
    string | null;
};