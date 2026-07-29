import {
    describe,
    expect,
    it,
} from "vitest";

import {
    updateRecommendationPredictiveIntelligence,
    validateRecommendationPredictiveUpdateResult,
} from "./updateRecommendationPredictiveIntelligence";

import {
    createRecommendationPredictiveInsufficientFixture,
    createRecommendationPredictiveIntegrationFixture,
} from "./recommendationPredictiveIntelligenceTestFixtures";

import type {
    RecommendationPredictedOpportunity,
    RecommendationPredictedRisk,
    RecommendationPredictedRuntimeDecision,
    RecommendationPredictedState,
    RecommendationPredictedStrategy,
    RecommendationPredictionConflictType,
    RecommendationPredictionOpportunityType,
    RecommendationPredictionRiskType,
    RecommendationPredictionSignalType,
    RecommendationPredictiveEntryState,
    RecommendationPredictiveRuntimeDecisionType,
    RecommendationPredictiveStrategyType,
    UpdateRecommendationPredictiveIntelligenceParams,
} from "./recommendationPredictiveIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Shared Types                                                       */
/* ------------------------------------------------------------------ */

type RankedPrediction = {
  rank:
    number;

  scores: {
    probability:
      number;

    confidence:
      number;
  };

  predictedAt:
    string;
};

/* ------------------------------------------------------------------ */
/* Update Params                                                      */
/* ------------------------------------------------------------------ */

function createUpdateParams(
  fixture:
    ReturnType<
      typeof createRecommendationPredictiveIntegrationFixture
    >,
): UpdateRecommendationPredictiveIntelligenceParams {
  return {
    memory:
      fixture.memory,

    memoryAnalysis:
      fixture.memoryAnalysis,

    adaptiveLearningAnalysis:
      fixture.adaptiveLearningAnalysis,

    horizon:
      "next-recommendation",

    predictedAt:
      fixture.predictedAt,

    recentEntryLimit:
      5,

    recentComparisonLimit:
      5,

    maximumStateCandidateCount:
      5,

    maximumStrategyCandidateCount:
      5,

    maximumDecisionCandidateCount:
      5,

    minimumCandidateProbability:
      0,

    createStatePredictionId:
      (
        state:
          RecommendationPredictiveEntryState,
        index:
          number,
      ) =>
        `integration-state-${index}-${state}`,

    createStrategyPredictionId:
      (
        strategyType:
          RecommendationPredictiveStrategyType,
        index:
          number,
      ) =>
        `integration-strategy-${index}-${strategyType}`,

    createDecisionPredictionId:
      (
        decisionType:
          RecommendationPredictiveRuntimeDecisionType,
        index:
          number,
      ) =>
        `integration-decision-${index}-${decisionType}`,

    createRiskPredictionId:
      (
        type:
          RecommendationPredictionRiskType,
        index:
          number,
      ) =>
        `integration-risk-${index}-${type}`,

    createOpportunityPredictionId:
      (
        type:
          RecommendationPredictionOpportunityType,
        index:
          number,
      ) =>
        `integration-opportunity-${index}-${type}`,

    createConflictId:
      (
        type:
          RecommendationPredictionConflictType,
        index:
          number,
      ) =>
        `integration-conflict-${index}-${type}`,

    createSignalId:
      (
        type:
          RecommendationPredictionSignalType,
        index:
          number,
      ) =>
        `integration-signal-${index}-${type}`,
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function expectValidRankedPredictions(
  predictions:
    readonly RankedPrediction[],
  predictedAt:
    string,
): void {
  predictions.forEach(
    (
      prediction,
      index,
    ) => {
      expect(
        prediction.rank,
      ).toBe(
        index +
          1,
      );

      expect(
        prediction.scores.probability,
      ).toBeGreaterThanOrEqual(
        0,
      );

      expect(
        prediction.scores.probability,
      ).toBeLessThanOrEqual(
        1,
      );

      expect(
        prediction.scores.confidence,
      ).toBeGreaterThanOrEqual(
        0,
      );

      expect(
        prediction.scores.confidence,
      ).toBeLessThanOrEqual(
        1,
      );

      expect(
        prediction.predictedAt,
      ).toBe(
        predictedAt,
      );
    },
  );
}

function expectProbabilityDistribution(
  predictions:
    readonly RankedPrediction[],
): void {
  if (
    predictions.length ===
    0
  ) {
    return;
  }

  const totalProbability =
    predictions.reduce(
      (
        total,
        prediction,
      ) =>
        total +
        prediction.scores.probability,
      0,
    );

  expect(
    totalProbability,
  ).toBeGreaterThanOrEqual(
    0.999,
  );

  expect(
    totalProbability,
  ).toBeLessThanOrEqual(
    1.001,
  );
}

function expectPrimaryStateConsistency(
  predictions:
    readonly RecommendationPredictedState[],
  primaryState:
    RecommendationPredictiveEntryState | null,
): void {
  expect(
    primaryState,
  ).toBe(
    predictions[0]?.state ??
      null,
  );
}

function expectPrimaryStrategyConsistency(
  predictions:
    readonly RecommendationPredictedStrategy[],
  primaryStrategyType:
    RecommendationPredictiveStrategyType | null,
): void {
  expect(
    primaryStrategyType,
  ).toBe(
    predictions[0]?.strategyType ??
      null,
  );
}

function expectPrimaryDecisionConsistency(
  predictions:
    readonly RecommendationPredictedRuntimeDecision[],
  primaryRuntimeDecisionType:
    RecommendationPredictiveRuntimeDecisionType | null,
): void {
  expect(
    primaryRuntimeDecisionType,
  ).toBe(
    predictions[0]?.decisionType ??
      null,
  );
}

function expectPrimaryRiskConsistency(
  predictions:
    readonly RecommendationPredictedRisk[],
  primaryRiskType:
    RecommendationPredictionRiskType | null,
): void {
  expect(
    primaryRiskType,
  ).toBe(
    predictions[0]?.type ??
      null,
  );
}

function expectPrimaryOpportunityConsistency(
  predictions:
    readonly RecommendationPredictedOpportunity[],
  primaryOpportunityType:
    RecommendationPredictionOpportunityType | null,
): void {
  expect(
    primaryOpportunityType,
  ).toBe(
    predictions[0]?.type ??
      null,
  );
}

function collectReferencedObservationIds(
  analysis:
    ReturnType<
      typeof updateRecommendationPredictiveIntelligence
    >["analysis"],
): string[] {
  const observationIds = [
    ...analysis.predictedStates.flatMap(
      (
        prediction,
      ) =>
        prediction.evidence.relatedObservationIds,
    ),

    ...analysis.predictedStrategies.flatMap(
      (
        prediction,
      ) =>
        prediction.evidence.relatedObservationIds,
    ),

    ...analysis.predictedRuntimeDecisions.flatMap(
      (
        prediction,
      ) =>
        prediction.evidence.relatedObservationIds,
    ),

    ...analysis.predictedRisks.flatMap(
      (
        prediction,
      ) =>
        prediction.evidence.relatedObservationIds,
    ),

    ...analysis.predictedOpportunities.flatMap(
      (
        prediction,
      ) =>
        prediction.evidence.relatedObservationIds,
    ),
  ];

  return Array.from(
    new Set(
      observationIds,
    ),
  );
}

function expectNullableNonEmptyString(
  value:
    string | null,
): void {
  if (
    value ===
    null
  ) {
    return;
  }

  expect(
    value.trim().length,
  ).toBeGreaterThan(
    0,
  );
}

function cloneJsonValue<
  TValue,
>(
  value:
    TValue,
): TValue {
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as TValue;
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "Recommendation Predictive Intelligence integration",
  () => {
    it(
      "runs the complete predictive pipeline without mocks",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const result =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expect(
          result.analysis,
        ).toBeDefined();

        expect(
          result.presentation,
        ).toBeDefined();

        expect(
          result.predictedAt,
        ).toBe(
          fixture.predictedAt,
        );
      },
    );

    it(
      "preserves Memory and History identity across the pipeline",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const result =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expect(
          result.analysis.memoryId,
        ).toBe(
          fixture.memory.id,
        );

        expect(
          result.analysis.historyId,
        ).toBe(
          fixture.memory.historyId,
        );

        expect(
          result.analysis.historyId,
        ).toBe(
          fixture.memoryAnalysis.historyId,
        );

        expect(
          result.analysis.historyId,
        ).toBe(
          fixture.adaptiveLearningAnalysis.historyId,
        );
      },
    );

    it(
      "preserves source analysis timestamps",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const result =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expect(
          result.analysis.sourceMemoryAnalyzedAt,
        ).toBe(
          fixture.memoryAnalysis.analyzedAt,
        );

        expect(
          result.analysis.sourceAdaptiveLearningAnalyzedAt,
        ).toBe(
          fixture.adaptiveLearningAnalysis.analyzedAt,
        );
      },
    );

    it(
      "uses one prediction timestamp across Analysis and Presentation",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const result =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expect(
          result.predictedAt,
        ).toBe(
          fixture.predictedAt,
        );

        expect(
          result.analysis.predictedAt,
        ).toBe(
          fixture.predictedAt,
        );

        expect(
          result.presentation.createdAt,
        ).toBe(
          fixture.predictedAt,
        );
      },
    );

    it(
      "passes the public Update Result validator",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const result =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expect(
          () =>
            validateRecommendationPredictiveUpdateResult({
              memory:
                fixture.memory,

              memoryAnalysis:
                fixture.memoryAnalysis,

              adaptiveLearningAnalysis:
                fixture.adaptiveLearningAnalysis,

              result,
            }),
        ).not.toThrow();
      },
    );

    it(
      "returns ranked predictions with valid probability and confidence values",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const {
          analysis,
        } =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expectValidRankedPredictions(
          analysis.predictedStates,
          fixture.predictedAt,
        );

        expectValidRankedPredictions(
          analysis.predictedStrategies,
          fixture.predictedAt,
        );

        expectValidRankedPredictions(
          analysis.predictedRuntimeDecisions,
          fixture.predictedAt,
        );

        expectValidRankedPredictions(
          analysis.predictedRisks,
          fixture.predictedAt,
        );

        expectValidRankedPredictions(
          analysis.predictedOpportunities,
          fixture.predictedAt,
        );
      },
    );

    it(
      "normalizes candidate probabilities within each prediction group",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const {
          analysis,
        } =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expectProbabilityDistribution(
          analysis.predictedStates,
        );

        expectProbabilityDistribution(
          analysis.predictedStrategies,
        );

        expectProbabilityDistribution(
          analysis.predictedRuntimeDecisions,
        );

        expectProbabilityDistribution(
          analysis.predictedRisks,
        );

        expectProbabilityDistribution(
          analysis.predictedOpportunities,
        );
      },
    );

    it(
      "keeps primary predictions consistent with rank-one candidates",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const {
          analysis,
        } =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expectPrimaryStateConsistency(
          analysis.predictedStates,
          analysis.primaryState,
        );

        expectPrimaryStrategyConsistency(
          analysis.predictedStrategies,
          analysis.primaryStrategyType,
        );

        expectPrimaryDecisionConsistency(
          analysis.predictedRuntimeDecisions,
          analysis.primaryRuntimeDecisionType,
        );

        expectPrimaryRiskConsistency(
          analysis.predictedRisks,
          analysis.primaryRiskType,
        );

        expectPrimaryOpportunityConsistency(
          analysis.predictedOpportunities,
          analysis.primaryOpportunityType,
        );
      },
    );

    it(
      "reports statistics consistent with generated collections",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const {
          analysis,
        } =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expect(
          analysis.statistics.memoryEntryCount,
        ).toBe(
          fixture.memory.entries.length,
        );

        expect(
          analysis.statistics.comparisonCount,
        ).toBe(
          fixture.memoryAnalysis.comparisons.length,
        );

        const referencedObservationIds =
          collectReferencedObservationIds(
            analysis,
          );

        expect(
          analysis.statistics.learningObservationCount,
        ).toBe(
          referencedObservationIds.length,
        );

        expect(
          analysis.statistics.predictedStateCount,
        ).toBe(
          analysis.predictedStates.length,
        );

        expect(
          analysis.statistics.predictedStrategyCount,
        ).toBe(
          analysis.predictedStrategies.length,
        );

        expect(
          analysis.statistics.predictedRuntimeDecisionCount,
        ).toBe(
          analysis.predictedRuntimeDecisions.length,
        );

        expect(
          analysis.statistics.predictedRiskCount,
        ).toBe(
          analysis.predictedRisks.length,
        );

        expect(
          analysis.statistics.predictedOpportunityCount,
        ).toBe(
          analysis.predictedOpportunities.length,
        );

        expect(
          analysis.statistics.conflictCount,
        ).toBe(
          analysis.conflicts.length,
        );

        expect(
          analysis.statistics.signalCount,
        ).toBe(
          analysis.signals.length,
        );
      },
    );

    it(
      "creates a presentation consistent with available predictions",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const result =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expect(
          result.presentation.headline.trim().length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          result.presentation.summary.trim().length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          result.presentation.confidenceDisclosure.trim().length,
        ).toBeGreaterThan(
          0,
        );

        expectNullableNonEmptyString(
          result.presentation.statePrediction,
        );

        expectNullableNonEmptyString(
          result.presentation.strategyPrediction,
        );

        expectNullableNonEmptyString(
          result.presentation.decisionPrediction,
        );

        expectNullableNonEmptyString(
          result.presentation.riskDescription,
        );

        expectNullableNonEmptyString(
          result.presentation.opportunityDescription,
        );

        expect(
          Array.isArray(
            result.presentation.warnings,
          ),
        ).toBe(
          true,
        );

        expect(
          Array.isArray(
            result.presentation.evidence,
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      "handles insufficient predictive evidence without throwing",
      () => {
        const fixture =
          createRecommendationPredictiveInsufficientFixture();

        const result =
          updateRecommendationPredictiveIntelligence(
            createUpdateParams(
              fixture,
            ),
          );

        expect([
          "unavailable",
          "insufficient",
          "observing",
        ]).toContain(
          result.analysis.state,
        );

        expect([
          "unavailable",
          "neutral",
          "observing",
        ]).toContain(
          result.presentation.tone,
        );

        expect(
          result.presentation.headline.trim().length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          result.presentation.summary.trim().length,
        ).toBeGreaterThan(
          0,
        );
      },
    );

    it(
      "does not mutate Memory, Memory Analysis, or Adaptive Learning inputs",
      () => {
        const fixture =
          createRecommendationPredictiveIntegrationFixture();

        const originalMemory =
          cloneJsonValue(
            fixture.memory,
          );

        const originalMemoryAnalysis =
          cloneJsonValue(
            fixture.memoryAnalysis,
          );

        const originalAdaptiveLearningAnalysis =
          cloneJsonValue(
            fixture.adaptiveLearningAnalysis,
          );

        updateRecommendationPredictiveIntelligence(
          createUpdateParams(
            fixture,
          ),
        );

        expect(
          fixture.memory,
        ).toEqual(
          originalMemory,
        );

        expect(
          fixture.memoryAnalysis,
        ).toEqual(
          originalMemoryAnalysis,
        );

        expect(
          fixture.adaptiveLearningAnalysis,
        ).toEqual(
          originalAdaptiveLearningAnalysis,
        );
      },
    );
  },
);