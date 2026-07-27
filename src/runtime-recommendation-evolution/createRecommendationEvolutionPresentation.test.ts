import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createRecommendationEvolutionPresentation,
} from "./createRecommendationEvolutionPresentation";

import type {
    RecommendationEvolutionResult,
    RecommendationEvolutionSignal,
    RecommendationEvolutionSnapshot,
    RecommendationLifecycleComparison,
} from "./recommendationEvolutionTypes";

/* ------------------------------------------------------------------ */
/* Test Constants                                                     */
/* ------------------------------------------------------------------ */

const ANALYZED_AT =
  "2026-07-27T01:00:00.000Z";

const FIRST_CREATED_AT =
  "2026-07-27T00:00:00.000Z";

const SECOND_CREATED_AT =
  "2026-07-27T00:10:00.000Z";

/* ------------------------------------------------------------------ */
/* Snapshot Fixture                                                   */
/* ------------------------------------------------------------------ */

function createSnapshot(
  lifecycleId:
    string,
  recommendationId:
    string,
  fingerprint:
    string,
  overrides:
    Partial<
      RecommendationEvolutionSnapshot
    > = {},
): RecommendationEvolutionSnapshot {
  return {
    lifecycleId,

    recommendationId,

    fingerprint,

    kind:
      (
        overrides.kind ??
        "reflect"
      ) as RecommendationEvolutionSnapshot["kind"],

    title:
      overrides.title ??
      "Review the current implementation",

    description:
      overrides.description ??
      "Review the implementation and record the next observation.",

    target:
      (
        overrides.target ??
        "runtime"
      ) as RecommendationEvolutionSnapshot["target"],

    confidence:
      (
        overrides.confidence ??
        "medium"
      ) as RecommendationEvolutionSnapshot["confidence"],

    source:
      (
        overrides.source ??
        "runtime"
      ) as RecommendationEvolutionSnapshot["source"],

    sourceLabel:
      overrides.sourceLabel ??
      "Runtime analysis",

    whySummary:
      overrides.whySummary ??
      "The current implementation needs another observation.",

    evidenceSummary:
      overrides.evidenceSummary ??
      "The latest Lifecycle provides supporting evidence.",

    signalCount:
      overrides.signalCount ??
      2,

    createdAt:
      overrides.createdAt ??
      FIRST_CREATED_AT,

    activatedAt:
      overrides.activatedAt ??
      FIRST_CREATED_AT,

    resolvedAt:
      overrides.resolvedAt ??
      null,

    resolution:
      overrides.resolution ??
      null,
  };
}

/* ------------------------------------------------------------------ */
/* Signal Fixture                                                     */
/* ------------------------------------------------------------------ */

function createSignal(
  type:
    RecommendationEvolutionSignal["type"],
  weight:
    number,
  description:
    string = "Test signal.",
): RecommendationEvolutionSignal {
  return {
    type,
    weight,
    description,
  };
}

/* ------------------------------------------------------------------ */
/* Comparison Fixture                                                 */
/* ------------------------------------------------------------------ */

function createInitialComparison():
  RecommendationLifecycleComparison {
  return {
    id:
      "comparison-initial",

    previous:
      null,

    current:
      createSnapshot(
        "lifecycle-1",
        "recommendation-1",
        "fingerprint-1",
      ),

    type:
      "initial",

    magnitude:
      "none",

    direction:
      "unresolved",

    confidence:
      "low",

    dataQuality:
      "partial",

    isRepeated:
      false,

    isCompletionAdvance:
      false,

    isSupersession:
      false,

    targetChanged:
      false,

    kindChanged:
      false,

    confidenceChanged:
      false,

    fieldChanges:
      [],

    signals:
      [
        createSignal(
          "missing-comparison-data",
          0,
          "No previous Recommendation is available.",
        ),
      ],

    comparedAt:
      ANALYZED_AT,
  };
}

function createComparableComparison(
  overrides:
    Partial<
      RecommendationLifecycleComparison
    > = {},
): RecommendationLifecycleComparison {
  const previous =
    createSnapshot(
      "lifecycle-1",
      "recommendation-1",
      "fingerprint-1",
    );

  const current =
    createSnapshot(
      "lifecycle-2",
      "recommendation-2",
      "fingerprint-2",
      {
        createdAt:
          SECOND_CREATED_AT,

        activatedAt:
          SECOND_CREATED_AT,
      },
    );

  return {
    id:
      overrides.id ??
      "comparison-1-2",

    previous:
      overrides.previous ??
      previous,

    current:
      overrides.current ??
      current,

    type:
      overrides.type ??
      "refined",

    magnitude:
      overrides.magnitude ??
      "moderate",

    direction:
      overrides.direction ??
      "narrowing",

    confidence:
      overrides.confidence ??
      "high",

    dataQuality:
      overrides.dataQuality ??
      "sufficient",

    isRepeated:
      overrides.isRepeated ??
      false,

    isCompletionAdvance:
      overrides.isCompletionAdvance ??
      false,

    isSupersession:
      overrides.isSupersession ??
      false,

    targetChanged:
      overrides.targetChanged ??
      false,

    kindChanged:
      overrides.kindChanged ??
      false,

    confidenceChanged:
      overrides.confidenceChanged ??
      false,

    fieldChanges:
      overrides.fieldChanges ??
      [],

    signals:
      overrides.signals ??
      [
        createSignal(
          "title-changed",
          2,
        ),
      ],

    comparedAt:
      overrides.comparedAt ??
      ANALYZED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Result Fixture                                                     */
/* ------------------------------------------------------------------ */

function createResult(
  overrides:
    Partial<
      RecommendationEvolutionResult
    > = {},
): RecommendationEvolutionResult {
  const comparisons =
    overrides.comparisons ??
    [
      createInitialComparison(),
      createComparableComparison(),
    ];

  return {
    version:
      1,

    historyId:
      overrides.historyId ??
      "history-1",

    comparisons,

    statistics:
      overrides.statistics ??
      {
        totalRecommendationCount:
          comparisons.length,

        comparableRecommendationCount:
          comparisons.filter(
            (
              comparison,
            ) =>
              comparison.previous !== null,
          ).length,

        transitionCount:
          comparisons.filter(
            (
              comparison,
            ) =>
              comparison.previous !== null,
          ).length,

        activeCount:
          1,

        completedCount:
          0,

        supersededCount:
          0,

        archivedCount:
          0,

        repeatedTransitionCount:
          0,

        changedTransitionCount:
          1,

        refinedTransitionCount:
          1,

        redirectedTransitionCount:
          0,

        completionAdvanceCount:
          0,

        completionRate:
          0,

        supersessionRate:
          0,

        repetitionRate:
          0,

        averageActiveDurationMs:
          null,
      },

    summary:
      overrides.summary ??
      {
        stability:
          "developing",

        drift:
          "low",

        repeatPattern:
          "none",

        dominantType:
          "refined",

        dominantDirection:
          "narrowing",

        latestType:
          "refined",

        latestDirection:
          "narrowing",

        latestMagnitude:
          "moderate",

        recommendationChanged:
          true,

        hasMeaningfulEvolution:
          true,

        hasSufficientHistory:
          false,
      },

    dataQuality:
      overrides.dataQuality ??
      "sufficient",

    confidence:
      overrides.confidence ??
      "high",

    analyzedAt:
      overrides.analyzedAt ??
      ANALYZED_AT,
  };
}

/* ------------------------------------------------------------------ */
/* Tests                                                              */
/* ------------------------------------------------------------------ */

describe(
  "createRecommendationEvolutionPresentation",
  () => {
    it(
      "creates an unavailable presentation when no Recommendation exists",
      () => {
        const result =
          createResult({
            comparisons:
              [],

            statistics: {
              totalRecommendationCount:
                0,

              comparableRecommendationCount:
                0,

              transitionCount:
                0,

              activeCount:
                0,

              completedCount:
                0,

              supersededCount:
                0,

              archivedCount:
                0,

              repeatedTransitionCount:
                0,

              changedTransitionCount:
                0,

              refinedTransitionCount:
                0,

              redirectedTransitionCount:
                0,

              completionAdvanceCount:
                0,

              completionRate:
                0,

              supersessionRate:
                0,

              repetitionRate:
                0,

              averageActiveDurationMs:
                null,
            },

            summary: {
              stability:
                "unknown",

              drift:
                "unknown",

              repeatPattern:
                "unknown",

              dominantType:
                null,

              dominantDirection:
                null,

              latestType:
                null,

              latestDirection:
                null,

              latestMagnitude:
                null,

              recommendationChanged:
                false,

              hasMeaningfulEvolution:
                false,

              hasSufficientHistory:
                false,
            },

            dataQuality:
              "insufficient",

            confidence:
              "low",
          });

        const presentation =
          createRecommendationEvolutionPresentation({
            result,
          });

        expect(
          presentation.tone,
        ).toBe(
          "unavailable",
        );

        expect(
          presentation.headline,
        ).toBe(
          "Recommendation 변화를 아직 충분히 읽을 수 없습니다.",
        );

        expect(
          presentation.totalRecommendationLabel,
        ).toBe(
          "Recommendation 기록 없음",
        );

        expect(
          presentation.warnings,
        ).toContain(
          "Evolution 분석에 사용할 Recommendation 기록이 없습니다.",
        );
      },
    );

    it(
      "creates a first-Recommendation presentation when only an initial comparison exists",
      () => {
        const initial =
          createInitialComparison();

        const result =
          createResult({
            comparisons:
              [
                initial,
              ],

            statistics: {
              totalRecommendationCount:
                1,

              comparableRecommendationCount:
                0,

              transitionCount:
                0,

              activeCount:
                1,

              completedCount:
                0,

              supersededCount:
                0,

              archivedCount:
                0,

              repeatedTransitionCount:
                0,

              changedTransitionCount:
                0,

              refinedTransitionCount:
                0,

              redirectedTransitionCount:
                0,

              completionAdvanceCount:
                0,

              completionRate:
                0,

              supersessionRate:
                0,

              repetitionRate:
                0,

              averageActiveDurationMs:
                null,
            },

            summary: {
              stability:
                "unknown",

              drift:
                "unknown",

              repeatPattern:
                "unknown",

              dominantType:
                null,

              dominantDirection:
                null,

              latestType:
                null,

              latestDirection:
                null,

              latestMagnitude:
                null,

              recommendationChanged:
                false,

              hasMeaningfulEvolution:
                false,

              hasSufficientHistory:
                false,
            },

            dataQuality:
              "partial",

            confidence:
              "low",
          });

        const presentation =
          createRecommendationEvolutionPresentation({
            result,
          });

        expect(
          presentation.headline,
        ).toBe(
          "첫 Recommendation이 기록되었습니다.",
        );

        expect(
          presentation.latestChangeLabel,
        ).toBe(
          "첫 Recommendation",
        );

        expect(
          presentation.primarySignalTitle,
        ).toBe(
          "비교 가능한 이전 Recommendation 없음",
        );

        expect(
          presentation.totalRecommendationLabel,
        ).toBe(
          "Recommendation 1개",
        );
      },
    );

    it(
      "creates a stable presentation for a repeated Recommendation",
      () => {
        const repeated =
          createComparableComparison({
            previous:
              createSnapshot(
                "lifecycle-1",
                "recommendation-1",
                "same-fingerprint",
              ),

            current:
              createSnapshot(
                "lifecycle-2",
                "recommendation-2",
                "same-fingerprint",
                {
                  createdAt:
                    SECOND_CREATED_AT,

                  activatedAt:
                    SECOND_CREATED_AT,
                },
              ),

            type:
              "repeated",

            magnitude:
              "none",

            direction:
              "stable",

            isRepeated:
              true,

            signals:
              [
                createSignal(
                  "same-fingerprint",
                  3,
                ),
              ],
          });

        const result =
          createResult({
            comparisons:
              [
                createInitialComparison(),
                repeated,
              ],

            statistics: {
              ...createResult().statistics,

              repeatedTransitionCount:
                1,

              changedTransitionCount:
                0,

              refinedTransitionCount:
                0,

              repetitionRate:
                1,
            },

            summary: {
              ...createResult().summary,

              stability:
                "stable",

              drift:
                "none",

              repeatPattern:
                "occasional",

              dominantType:
                "repeated",

              dominantDirection:
                "stable",

              latestType:
                "repeated",

              latestDirection:
                "stable",

              latestMagnitude:
                "none",

              recommendationChanged:
                false,
            },
          });

        const presentation =
          createRecommendationEvolutionPresentation({
            result,
          });

        expect(
          presentation.tone,
        ).toBe(
          "stable",
        );

        expect(
          presentation.headline,
        ).toBe(
          "현재 Recommendation 방향이 계속 유지되고 있습니다.",
        );

        expect(
          presentation.latestChangeLabel,
        ).toBe(
          "동일 방향 유지",
        );

        expect(
          presentation.primarySignalTitle,
        ).toBe(
          "동일 Recommendation 반복",
        );

        expect(
          presentation.repetitionRateLabel,
        ).toBe(
          "반복률 100% (1/1)",
        );
      },
    );

    it(
      "creates a progressing presentation for a refined Recommendation",
      () => {
        const result =
          createResult();

        const presentation =
          createRecommendationEvolutionPresentation({
            result,
          });

        expect(
          presentation.tone,
        ).toBe(
          "progressing",
        );

        expect(
          presentation.headline,
        ).toBe(
          "현재 Recommendation이 더 구체적인 형태로 발전했습니다.",
        );

        expect(
          presentation.latestChangeLabel,
        ).toContain(
          "Recommendation 구체화",
        );

        expect(
          presentation.primarySignalTitle,
        ).toBe(
          "Recommendation 표현 변경",
        );

        expect(
          presentation.confidenceLabel,
        ).toBe(
          "높은 분석 신뢰도",
        );

        expect(
          presentation.dataQualityLabel,
        ).toBe(
          "충분한 비교 데이터",
        );
      },
    );

    it(
      "uses the highest-weight signal as the primary signal",
      () => {
        const comparison =
          createComparableComparison({
            signals:
              [
                createSignal(
                  "title-changed",
                  1,
                ),

                createSignal(
                  "evidence-changed",
                  5,
                ),

                createSignal(
                  "confidence-increased",
                  3,
                ),
              ],
          });

        const result =
          createResult({
            comparisons:
              [
                createInitialComparison(),
                comparison,
              ],
          });

        const presentation =
          createRecommendationEvolutionPresentation({
            result,
          });

        expect(
          presentation.primarySignalTitle,
        ).toBe(
          "Recommendation 근거 변경",
        );

        expect(
          presentation.primarySignalDescription,
        ).toBe(
          "Recommendation을 뒷받침하는 근거가 변경되었습니다.",
        );
      },
    );

    it(
      "creates an attention presentation and warnings for unstable persistent repetition",
      () => {
        const repeated =
          createComparableComparison({
            previous:
              createSnapshot(
                "lifecycle-1",
                "recommendation-1",
                "same-fingerprint",
              ),

            current:
              createSnapshot(
                "lifecycle-2",
                "recommendation-2",
                "same-fingerprint",
                {
                  createdAt:
                    SECOND_CREATED_AT,

                  activatedAt:
                    SECOND_CREATED_AT,
                },
              ),

            type:
              "repeated",

            magnitude:
              "none",

            direction:
              "stable",

            isRepeated:
              true,

            signals:
              [
                createSignal(
                  "same-fingerprint",
                  3,
                ),
              ],
          });

        const base =
          createResult();

        const result =
          createResult({
            comparisons:
              [
                createInitialComparison(),
                repeated,
              ],

            statistics: {
              ...base.statistics,

              repeatedTransitionCount:
                1,

              changedTransitionCount:
                0,

              refinedTransitionCount:
                0,

              repetitionRate:
                1,
            },

            summary: {
              ...base.summary,

              stability:
                "unstable",

              drift:
                "high",

              repeatPattern:
                "persistent",

              dominantType:
                "repeated",

              dominantDirection:
                "stable",

              latestType:
                "repeated",

              latestDirection:
                "stable",

              latestMagnitude:
                "none",

              recommendationChanged:
                false,
            },
          });

        const presentation =
          createRecommendationEvolutionPresentation({
            result,
          });

        expect(
          presentation.tone,
        ).toBe(
          "attention",
        );

        expect(
          presentation.warnings,
        ).toEqual(
          expect.arrayContaining([
            "Recommendation 방향 전환이 반복적으로 관찰되고 있습니다.",
            "최근 Recommendation 흐름에서 큰 방향 변화가 자주 나타납니다.",
            "동일한 Recommendation이 여러 번 반복되고 있습니다.",
          ]),
        );

        expect(
          presentation.nextObservationFocus,
        ).toContain(
          "완료를 막는 조건",
        );
      },
    );

    it(
      "rejects an invalid empty signal list",
      () => {
        const invalidComparison =
          createComparableComparison({
            signals:
              [],
          });

        const result =
          createResult({
            comparisons:
              [
                createInitialComparison(),
                invalidComparison,
              ],
          });

        expect(
          () =>
            createRecommendationEvolutionPresentation({
              result,
            }),
        ).toThrow(
          "result.comparisons[1].signals must contain at least one signal.",
        );
      },
    );
  },
);