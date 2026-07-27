import type {
    RecommendationEvolutionGuidanceTone,
    RecommendationEvolutionIntelligenceResult,
    RecommendationEvolutionIntelligenceScores,
    RecommendationEvolutionIntelligenceSignalConfidence,
    RecommendationEvolutionIntelligenceSignalType,
    RecommendationEvolutionIntelligenceState,
    RecommendationEvolutionIntelligenceVersion,
    RecommendationEvolutionRuntimeDecisionType,
    RecommendationEvolutionStrategyDecisions,
    RecommendationEvolutionStrategyPriority,
    RecommendationEvolutionStrategyType,
} from "./recommendationEvolutionIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Memory Version                                                     */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemoryVersion =
  1;

/* ------------------------------------------------------------------ */
/* Memory Entry                                                       */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemoryEntry = {
  id:
    string;

  intelligenceVersion:
    RecommendationEvolutionIntelligenceVersion;

  historyId:
    string;

  sourceEvolutionAnalyzedAt:
    string;

  intelligenceAnalyzedAt:
    string;

  state:
    RecommendationEvolutionIntelligenceState;

  assessmentConfidence:
    RecommendationEvolutionIntelligenceSignalConfidence;

  scores:
    RecommendationEvolutionIntelligenceScores;

  primarySignalType:
    RecommendationEvolutionIntelligenceSignalType | null;

  signalTypes:
    RecommendationEvolutionIntelligenceSignalType[];

  strategyType:
    RecommendationEvolutionStrategyType;

  strategyPriority:
    RecommendationEvolutionStrategyPriority;

  decisions:
    RecommendationEvolutionStrategyDecisions;

  enabledRuntimeDecisionTypes:
    RecommendationEvolutionRuntimeDecisionType[];

  guidanceTone:
    RecommendationEvolutionGuidanceTone;

  warningCount:
    number;

  observationCount:
    number;

  recordedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Memory                                                             */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemory = {
  version:
    RecommendationEvolutionMemoryVersion;

  id:
    string;

  historyId:
    string;

  entries:
    RecommendationEvolutionMemoryEntry[];

  createdAt:
    string;

  updatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Memory Entry Creation                                              */
/* ------------------------------------------------------------------ */

export type CreateRecommendationEvolutionMemoryEntryParams = {
  intelligence:
    RecommendationEvolutionIntelligenceResult;

  recordedAt:
    string;

  createEntryId:
    () => string;
};

/* ------------------------------------------------------------------ */
/* Memory Append                                                      */
/* ------------------------------------------------------------------ */

export type AppendRecommendationEvolutionMemoryParams = {
  memory:
    RecommendationEvolutionMemory | null;

  entry:
    RecommendationEvolutionMemoryEntry;

  memoryId:
    string;

  updatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Memory Score Changes                                               */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemoryScoreChanges = {
  stability:
    number;

  progress:
    number;

  repetitionRisk:
    number;

  redirectionRisk:
    number;

  completionMomentum:
    number;
};

/* ------------------------------------------------------------------ */
/* Memory Decision Changes                                            */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemoryDecisionChanges = {
  newlyEnabled:
    RecommendationEvolutionRuntimeDecisionType[];

  newlyDisabled:
    RecommendationEvolutionRuntimeDecisionType[];

  unchangedEnabled:
    RecommendationEvolutionRuntimeDecisionType[];
};

/* ------------------------------------------------------------------ */
/* Memory Comparison                                                  */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemoryComparisonType =
  | "initial"
  | "unchanged"
  | "stabilized"
  | "progressed"
  | "advanced"
  | "stalled"
  | "fragmented"
  | "recovered"
  | "regressed"
  | "strategy-shifted"
  | "confidence-improved"
  | "confidence-declined"
  | "mixed";

export type RecommendationEvolutionMemoryComparisonSignalType =
  | "state-unchanged"
  | "state-changed"
  | "strategy-unchanged"
  | "strategy-changed"
  | "stability-increased"
  | "stability-decreased"
  | "progress-increased"
  | "progress-decreased"
  | "repetition-risk-increased"
  | "repetition-risk-decreased"
  | "redirection-risk-increased"
  | "redirection-risk-decreased"
  | "completion-momentum-increased"
  | "completion-momentum-decreased"
  | "confidence-increased"
  | "confidence-decreased"
  | "new-warning-pressure"
  | "warning-pressure-reduced";

export type RecommendationEvolutionMemoryComparisonSignal = {
  type:
    RecommendationEvolutionMemoryComparisonSignalType;

  description:
    string;

  value:
    number | string | boolean | null;
};

export type RecommendationEvolutionMemoryComparison = {
  id:
    string;

  previous:
    RecommendationEvolutionMemoryEntry | null;

  current:
    RecommendationEvolutionMemoryEntry;

  type:
    RecommendationEvolutionMemoryComparisonType;

  stateChanged:
    boolean;

  strategyChanged:
    boolean;

  confidenceChanged:
    boolean;

  primarySignalChanged:
    boolean;

  scoreChanges:
    RecommendationEvolutionMemoryScoreChanges;

  decisionChanges:
    RecommendationEvolutionMemoryDecisionChanges;

  signals:
    RecommendationEvolutionMemoryComparisonSignal[];

  comparedAt:
    string;
};

export type CompareRecommendationEvolutionMemoryEntriesParams = {
  previous:
    RecommendationEvolutionMemoryEntry | null;

  current:
    RecommendationEvolutionMemoryEntry;

  comparedAt:
    string;

  createComparisonId:
    () => string;
};

/* ------------------------------------------------------------------ */
/* Memory Analysis State                                              */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemoryState =
  | "unavailable"
  | "insufficient"
  | "stable"
  | "improving"
  | "advancing"
  | "stagnant"
  | "oscillating"
  | "regressing"
  | "recovering";

/* ------------------------------------------------------------------ */
/* Memory Statistics                                                  */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemoryStateCounts = Record<
  RecommendationEvolutionIntelligenceState,
  number
>;

export type RecommendationEvolutionMemoryStrategyCounts = Record<
  RecommendationEvolutionStrategyType,
  number
>;

export type RecommendationEvolutionMemoryStatistics = {
  entryCount:
    number;

  comparisonCount:
    number;

  stateCounts:
    RecommendationEvolutionMemoryStateCounts;

  strategyCounts:
    RecommendationEvolutionMemoryStrategyCounts;

  stateChangeCount:
    number;

  strategyChangeCount:
    number;

  observeStreak:
    number;

  maintainStreak:
    number;

  stalledStreak:
    number;

  fragmentedStreak:
    number;

  advancingStreak:
    number;

  averageScores:
    RecommendationEvolutionIntelligenceScores;

  latestScoreChanges:
    RecommendationEvolutionMemoryScoreChanges | null;
};

/* ------------------------------------------------------------------ */
/* Memory Scores                                                      */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemoryScores = {
  longTermStability:
    number;

  longTermProgress:
    number;

  longTermRisk:
    number;

  recovery:
    number;
};

/* ------------------------------------------------------------------ */
/* Memory Signals                                                     */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemorySignalType =
  | "persistent-observation"
  | "persistent-stability"
  | "persistent-stall"
  | "persistent-fragmentation"
  | "strategy-oscillation"
  | "state-oscillation"
  | "confidence-degradation"
  | "confidence-recovery"
  | "risk-accumulation"
  | "risk-reduction"
  | "long-term-progression"
  | "long-term-advancement"
  | "recovery-pattern"
  | "insufficient-memory";

export type RecommendationEvolutionMemorySignalSeverity =
  | "info"
  | "low"
  | "moderate"
  | "high";

export type RecommendationEvolutionMemorySignal = {
  id:
    string;

  type:
    RecommendationEvolutionMemorySignalType;

  severity:
    RecommendationEvolutionMemorySignalSeverity;

  confidence:
    RecommendationEvolutionIntelligenceSignalConfidence;

  score:
    number;

  description:
    string;

  relatedEntryIds:
    string[];

  relatedComparisonIds:
    string[];

  detectedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Memory Analysis                                                    */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemoryAnalysis = {
  version:
    RecommendationEvolutionMemoryVersion;

  memoryId:
    string;

  historyId:
    string;

  state:
    RecommendationEvolutionMemoryState;

  confidence:
    RecommendationEvolutionIntelligenceSignalConfidence;

  statistics:
    RecommendationEvolutionMemoryStatistics;

  scores:
    RecommendationEvolutionMemoryScores;

  signals:
    RecommendationEvolutionMemorySignal[];

  comparisons:
    RecommendationEvolutionMemoryComparison[];

  primarySignalType:
    RecommendationEvolutionMemorySignalType | null;

  reasoning:
    string[];

  analyzedAt:
    string;
};

export type AnalyzeRecommendationEvolutionMemoryParams = {
  memory:
    RecommendationEvolutionMemory;

  analyzedAt:
    string;

  createComparisonId:
    (
      index:
        number,
    ) => string;

  createSignalId:
    (
      type:
        RecommendationEvolutionMemorySignalType,
      index:
        number,
    ) => string;
};

/* ------------------------------------------------------------------ */
/* Memory Presentation                                                */
/* ------------------------------------------------------------------ */

export type RecommendationEvolutionMemoryPresentationTone =
  | "unavailable"
  | "neutral"
  | "stable"
  | "progressing"
  | "attention"
  | "recovering";

export type RecommendationEvolutionMemoryPresentation = {
  tone:
    RecommendationEvolutionMemoryPresentationTone;

  headline:
    string;

  summary:
    string;

  trendDescription:
    string;

  latestChange:
    string | null;

  longTermObservation:
    string | null;

  warnings:
    string[];

  evidence:
    string[];

  createdAt:
    string;
};

export type CreateRecommendationEvolutionMemoryPresentationParams = {
  memory:
    RecommendationEvolutionMemory;

  analysis:
    RecommendationEvolutionMemoryAnalysis;

  createdAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Memory Update Orchestrator                                         */
/* ------------------------------------------------------------------ */

export type UpdateRecommendationEvolutionMemoryParams = {
  memory:
    RecommendationEvolutionMemory | null;

  intelligence:
    RecommendationEvolutionIntelligenceResult;

  updatedAt:
    string;

  memoryId:
    string;

  createEntryId:
    () => string;

  createComparisonId:
    (
      index:
        number,
    ) => string;

  createSignalId:
    (
      type:
        RecommendationEvolutionMemorySignalType,
      index:
        number,
    ) => string;
};

export type RecommendationEvolutionMemoryUpdateResult = {
  memory:
    RecommendationEvolutionMemory;

  entry:
    RecommendationEvolutionMemoryEntry;

  latestComparison:
    RecommendationEvolutionMemoryComparison;

  analysis:
    RecommendationEvolutionMemoryAnalysis;

  presentation:
    RecommendationEvolutionMemoryPresentation;

  updatedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Query Types                                                        */
/* ------------------------------------------------------------------ */

export type FindRecommendationEvolutionMemoryEntryParams = {
  memory:
    RecommendationEvolutionMemory;

  entryId:
    string;
};

export type HasRecommendationEvolutionMemorySignalParams = {
  analysis:
    RecommendationEvolutionMemoryAnalysis;

  type:
    RecommendationEvolutionMemorySignalType;
};

export type GetRecommendationEvolutionMemoryLatestEntryParams = {
  memory:
    RecommendationEvolutionMemory;
};

/* ------------------------------------------------------------------ */
/* Validation Parameter Types                                         */
/* ------------------------------------------------------------------ */

export type ValidateRecommendationEvolutionMemoryEntryParams = {
  entry:
    RecommendationEvolutionMemoryEntry;
};

export type ValidateRecommendationEvolutionMemoryParams = {
  memory:
    RecommendationEvolutionMemory;
};

export type ValidateRecommendationEvolutionMemoryComparisonParams = {
  comparison:
    RecommendationEvolutionMemoryComparison;
};

export type ValidateRecommendationEvolutionMemoryAnalysisParams = {
  memory:
    RecommendationEvolutionMemory;

  analysis:
    RecommendationEvolutionMemoryAnalysis;
};

/* ------------------------------------------------------------------ */
/* Type Guards                                                        */
/* ------------------------------------------------------------------ */

export function isRecommendationEvolutionMemoryVersion(
  value:
    unknown,
): value is RecommendationEvolutionMemoryVersion {
  return value === 1;
}

export function isRecommendationEvolutionMemoryComparisonType(
  value:
    unknown,
): value is RecommendationEvolutionMemoryComparisonType {
  return (
    value === "initial" ||
    value === "unchanged" ||
    value === "stabilized" ||
    value === "progressed" ||
    value === "advanced" ||
    value === "stalled" ||
    value === "fragmented" ||
    value === "recovered" ||
    value === "regressed" ||
    value === "strategy-shifted" ||
    value === "confidence-improved" ||
    value === "confidence-declined" ||
    value === "mixed"
  );
}

export function isRecommendationEvolutionMemoryComparisonSignalType(
  value:
    unknown,
): value is RecommendationEvolutionMemoryComparisonSignalType {
  return (
    value === "state-unchanged" ||
    value === "state-changed" ||
    value === "strategy-unchanged" ||
    value === "strategy-changed" ||
    value === "stability-increased" ||
    value === "stability-decreased" ||
    value === "progress-increased" ||
    value === "progress-decreased" ||
    value === "repetition-risk-increased" ||
    value === "repetition-risk-decreased" ||
    value === "redirection-risk-increased" ||
    value === "redirection-risk-decreased" ||
    value === "completion-momentum-increased" ||
    value === "completion-momentum-decreased" ||
    value === "confidence-increased" ||
    value === "confidence-decreased" ||
    value === "new-warning-pressure" ||
    value === "warning-pressure-reduced"
  );
}

export function isRecommendationEvolutionMemoryState(
  value:
    unknown,
): value is RecommendationEvolutionMemoryState {
  return (
    value === "unavailable" ||
    value === "insufficient" ||
    value === "stable" ||
    value === "improving" ||
    value === "advancing" ||
    value === "stagnant" ||
    value === "oscillating" ||
    value === "regressing" ||
    value === "recovering"
  );
}

export function isRecommendationEvolutionMemorySignalType(
  value:
    unknown,
): value is RecommendationEvolutionMemorySignalType {
  return (
    value === "persistent-observation" ||
    value === "persistent-stability" ||
    value === "persistent-stall" ||
    value === "persistent-fragmentation" ||
    value === "strategy-oscillation" ||
    value === "state-oscillation" ||
    value === "confidence-degradation" ||
    value === "confidence-recovery" ||
    value === "risk-accumulation" ||
    value === "risk-reduction" ||
    value === "long-term-progression" ||
    value === "long-term-advancement" ||
    value === "recovery-pattern" ||
    value === "insufficient-memory"
  );
}

export function isRecommendationEvolutionMemorySignalSeverity(
  value:
    unknown,
): value is RecommendationEvolutionMemorySignalSeverity {
  return (
    value === "info" ||
    value === "low" ||
    value === "moderate" ||
    value === "high"
  );
}

export function isRecommendationEvolutionMemoryPresentationTone(
  value:
    unknown,
): value is RecommendationEvolutionMemoryPresentationTone {
  return (
    value === "unavailable" ||
    value === "neutral" ||
    value === "stable" ||
    value === "progressing" ||
    value === "attention" ||
    value === "recovering"
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

export function getRecommendationEvolutionMemoryLatestEntry(
  params:
    GetRecommendationEvolutionMemoryLatestEntryParams,
): RecommendationEvolutionMemoryEntry | null {
  const {
    entries,
  } = params.memory;

  if (entries.length === 0) {
    return null;
  }

  return entries[
    entries.length - 1
  ] ??
    null;
}

export function findRecommendationEvolutionMemoryEntry(
  params:
    FindRecommendationEvolutionMemoryEntryParams,
): RecommendationEvolutionMemoryEntry | null {
  return (
    params.memory.entries.find(
      (
        entry,
      ) =>
        entry.id ===
        params.entryId,
    ) ??
    null
  );
}

export function hasRecommendationEvolutionMemorySignal(
  params:
    HasRecommendationEvolutionMemorySignalParams,
): boolean {
  return params.analysis.signals.some(
    (
      signal,
    ) =>
      signal.type ===
      params.type,
  );
}

export function createEmptyRecommendationEvolutionMemoryStateCounts():
  RecommendationEvolutionMemoryStateCounts {
  return {
    unavailable:
      0,

    observing:
      0,

    stable:
      0,

    progressing:
      0,

    stalled:
      0,

    fragmented:
      0,

    advancing:
      0,
  };
}

export function createEmptyRecommendationEvolutionMemoryStrategyCounts():
  RecommendationEvolutionMemoryStrategyCounts {
  return {
    observe:
      0,

    maintain:
      0,

    clarify:
      0,

    narrow:
      0,

    "confirm-completion":
      0,

    advance:
      0,

    stabilize:
      0,

    reconsider:
      0,
  };
}