import type {
    RuntimeV2RecommendationAlignment,
    RuntimeV2RecommendationChangeType,
    RuntimeV2RecommendationConfidence,
    RuntimeV2RecommendationDirection,
    RuntimeV2RecommendationEvolutionPattern,
    RuntimeV2RecommendationPriority,
} from "../types/runtimeV2Recommendation";

export type RuntimeV2RecommendationPresentation = {
  id: string;

  title: string;
  summary: string;
  action: string;
  rationale: string;
  steps: string[];

  direction: RuntimeV2RecommendationDirection;
  directionLabel: string;

  priority: RuntimeV2RecommendationPriority;
  confidence: RuntimeV2RecommendationConfidence;

  changeType: RuntimeV2RecommendationChangeType | null;
  changeLabel: string;

  alignment: RuntimeV2RecommendationAlignment | null;
  alignmentLabel: string;
  observationSummary: string | null;

  evolutionPattern:
    RuntimeV2RecommendationEvolutionPattern | null;

  evolutionLabel: string | null;
  evolutionSummary: string | null;

  predictedDirection: RuntimeV2RecommendationDirection | null;
  predictedDirectionLabel: string | null;
  predictionRationale: string | null;
  predictionConditions: string[];

  timelineEntryCount: number;
  evidenceCount: number;
  createdAt: string;
};