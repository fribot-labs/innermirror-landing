export type RuntimeV2RecommendationConfidence =
  | "low"
  | "medium"
  | "high";

export type RuntimeV2RecommendationPriority =
  | "low"
  | "medium"
  | "high";

export type RuntimeV2RecommendationDirection =
  | "reflection-strengthening"
  | "runtime-stabilization"
  | "ux-stabilization"
  | "knowledge-compression"
  | "project-identity-stabilization"
  | "architecture-stabilization"
  | "implementation-progress"
  | "signal-collection"
  | "unknown";

export type RuntimeV2RecommendationInsightPattern =
  | "early-understanding"
  | "stable-but-under-evidenced"
  | "stable-and-aligned"
  | "progressing"
  | "strategic-transition"
  | "direction-conflict"
  | "uncertain";

export type RuntimeV2RecommendationEvidence = {
  id: string;
  source: string;
  label: string;
  summary: string;
  confidence: RuntimeV2RecommendationConfidence;
};

export type RuntimeV2RecommendationOrigin = {
  source: string;
  generator: string;
  trigger: string;
  analysisId?: string;
};

export type RuntimeV2Recommendation = {
  id: string;
  projectId: string;
  direction: RuntimeV2RecommendationDirection;
  title: string;
  summary: string;
  recommendedAction: string;
  recommendedSteps: string[];
  rationale: string;
  priority: RuntimeV2RecommendationPriority;
  confidence: RuntimeV2RecommendationConfidence;
  evidence: RuntimeV2RecommendationEvidence[];
  origin: RuntimeV2RecommendationOrigin;
  createdAt: string;
};

export type RuntimeV2RecommendationState = {
  recommendationId: string;
  projectId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  supersededAt?: string;
  stateReason?: string;
};

export type RuntimeV2RecommendationTimelineEntry = {
  recommendation: RuntimeV2Recommendation;
  state: RuntimeV2RecommendationState;
};

export type RuntimeV2RecommendationTimeline = {
  projectId: string;
  entries: RuntimeV2RecommendationTimelineEntry[];
  currentRecommendationId?: string;
  generatedAt: string;
};

export type RuntimeV2RecommendationChangeType =
  | "initial"
  | "repeated"
  | "refined"
  | "shifted"
  | "intensified"
  | "deprioritized";

export type RuntimeV2RecommendationComparison = {
  previousRecommendationId?: string;
  currentRecommendationId: string;
  changeType: RuntimeV2RecommendationChangeType;
  previousDirection?: RuntimeV2RecommendationDirection;
  currentDirection: RuntimeV2RecommendationDirection;
  summary: string;
  changedFields: string[];
  evidence: RuntimeV2RecommendationEvidence[];
  confidence: RuntimeV2RecommendationConfidence;
};

export type RuntimeV2RecommendationAlignment =
  | "aligned"
  | "partially-aligned"
  | "not-yet-visible"
  | "diverged"
  | "insufficient-evidence";

export type RuntimeV2RecommendationObservation = {
  recommendationId: string;
  alignment: RuntimeV2RecommendationAlignment;
  summary: string;
  alignedEvidence: RuntimeV2RecommendationEvidence[];
  conflictingEvidence: RuntimeV2RecommendationEvidence[];
  missingEvidence: string[];
  confidence: RuntimeV2RecommendationConfidence;
  observedAt: string;
};

export type RuntimeV2RecommendationEvolutionPattern =
  | "stable-direction"
  | "progressive-refinement"
  | "strategic-shift"
  | "oscillation"
  | "early-formation"
  | "unclear";

export type RuntimeV2RecommendationEvolution = {
  projectId: string;
  pattern: RuntimeV2RecommendationEvolutionPattern;
  summary: string;
  previousDirection?: RuntimeV2RecommendationDirection;
  currentDirection: RuntimeV2RecommendationDirection;
  emergingDirection?: RuntimeV2RecommendationDirection;
  transitionCount: number;
  evidence: RuntimeV2RecommendationEvidence[];
  confidence: RuntimeV2RecommendationConfidence;
};

export type RuntimeV2RecommendationPrediction = {
  projectId: string;
  currentRecommendationId: string;
  likelyNextDirection: RuntimeV2RecommendationDirection;
  likelyNextDirectionLabel: string;
  rationale: string;
  conditions: string[];
  evidence: RuntimeV2RecommendationEvidence[];
  confidence: RuntimeV2RecommendationConfidence;
  generatedAt: string;
};

export type RuntimeV2RecommendationIntegrationResult = {
  currentRecommendation: RuntimeV2Recommendation;
  state: RuntimeV2RecommendationState;
  timeline?: RuntimeV2RecommendationTimeline;
  comparison?: RuntimeV2RecommendationComparison;
  observation?: RuntimeV2RecommendationObservation;
  evolution?: RuntimeV2RecommendationEvolution;
  predictiveIntelligenceResult?: RuntimeV2RecommendationPrediction;
  insight?: RuntimeV2RecommendationInsight;
};

export type RuntimeV2RecommendationInsight = {
  projectId: string;
  currentRecommendationId: string;
  pattern:
    RuntimeV2RecommendationInsightPattern;
  headline: string;
  summary: string;
  keyInsight: string;
  supportingReasons: string[];
  currentDirection:
    RuntimeV2RecommendationDirection;
  confidence:
    RuntimeV2RecommendationConfidence;
  evidence:
    RuntimeV2RecommendationEvidence[];
  generatedAt: string;
};