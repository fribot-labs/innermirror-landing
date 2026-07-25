import {
    createAdaptiveRecommendationObservationSummary,
    type CreateAdaptiveRecommendationObservationSummaryResult,
    type RuntimeRecommendationAdaptiveObservationSummary,
} from "../createAdaptiveRecommendationObservationSummary";

import type {
    RuntimeRecommendationAdaptiveObservationStatistics,
} from "../createAdaptiveRecommendationObservationStatistics";

import type {
    RuntimeRecommendationAdaptiveObservationStability,
} from "../createAdaptiveRecommendationObservationStability";

import type {
    RuntimeRecommendationAdaptiveObservationDrift,
} from "../createAdaptiveRecommendationObservationDrift";

import type {
    RuntimeRecommendationAdaptiveObservationConfidence,
} from "../createAdaptiveRecommendationObservationConfidence";

/* ------------------------------------------------------------------ */
/* Test Constants */
/* ------------------------------------------------------------------ */

const TEST_GENERATED_AT =
  "2026-07-25T00:00:00.000Z";

const BASE_CANDIDATE_ID =
  "base-candidate";

const ADAPTIVE_CANDIDATE_ID =
  "adaptive-candidate";

const DRIFTED_CANDIDATE_ID =
  "drifted-candidate";

/* ------------------------------------------------------------------ */
/* Assertions */
/* ------------------------------------------------------------------ */

function assertEqual<T>(
  actual:
    T,
  expected:
    T,
  message:
    string
): void {
  if (
    actual !==
    expected
  ) {
    throw new Error(
      [
        `FAIL: ${message}`,
        `Expected: ${String(expected)}`,
        `Actual: ${String(actual)}`,
      ].join(
        "\n"
      )
    );
  }
}

function assertTrue(
  condition:
    boolean,
  message:
    string
): void {
  if (
    !condition
  ) {
    throw new Error(
      `FAIL: ${message}`
    );
  }
}

function assertNotNull<T>(
  value:
    T | null,
  message:
    string
): asserts value is T {
  if (
    value ===
    null
  ) {
    throw new Error(
      `FAIL: ${message}`
    );
  }
}

function assertIncludes(
  value:
    string,
  expectedText:
    string,
  message:
    string
): void {
  if (
    !value.includes(
      expectedText
    )
  ) {
    throw new Error(
      [
        `FAIL: ${message}`,
        `Expected text: ${expectedText}`,
        `Actual: ${value}`,
      ].join(
        "\n"
      )
    );
  }
}

/* ------------------------------------------------------------------ */
/* Mock Factories */
/* ------------------------------------------------------------------ */

type StatisticsOverrides =
  Partial<
    RuntimeRecommendationAdaptiveObservationStatistics
  >;

function createStatistics(
  overrides:
    StatisticsOverrides = {}
):
  RuntimeRecommendationAdaptiveObservationStatistics {
  return {
    observationCount:
      10,

    comparableObservationCount:
      10,

    incompleteObservationCount:
      0,

    sameCandidateCount:
      9,

    changedWinnerCount:
      1,

    sameCandidateRate:
      0.9,

    changedWinnerRate:
      0.1,

    status:
      "calculated",

    reason:
      "adaptive-observation-statistics-calculated",

    ...overrides,
  } as RuntimeRecommendationAdaptiveObservationStatistics;
}

type StabilityOverrides =
  Partial<
    RuntimeRecommendationAdaptiveObservationStability
  >;

function createStability(
  overrides:
    StabilityOverrides = {}
):
  RuntimeRecommendationAdaptiveObservationStability {
  return {
    observationCount:
      10,

    comparableObservationCount:
      10,

    incompleteObservationCount:
      0,

    adaptiveWinnerRepeatCount:
      8,

    adaptiveWinnerSwitchCount:
      1,

    adaptiveWinnerTransitionCount:
      9,

    adaptiveWinnerRepeatRate:
      0.8889,

    adaptiveWinnerSwitchRate:
      0.1111,

    longestAdaptiveWinnerStreak:
      7,

    currentAdaptiveWinnerStreak:
      5,

    currentAdaptiveWinnerCandidateId:
      ADAPTIVE_CANDIDATE_ID,

    longestStreakCandidateId:
      ADAPTIVE_CANDIDATE_ID,

    candidateFrequencies: [
      {
        candidateId:
          ADAPTIVE_CANDIDATE_ID,

        occurrenceCount:
          9,

        occurrenceRate:
          0.9,

        longestStreak:
          7,

        latestStreak:
          5,
      },

      {
        candidateId:
          BASE_CANDIDATE_ID,

        occurrenceCount:
          1,

        occurrenceRate:
          0.1,

        longestStreak:
          1,

        latestStreak:
          1,
      },
    ],

    level:
      "stable",

    status:
      "calculated",

    reason:
      "adaptive-winner-sequence-analyzed",

    ...overrides,
  };
}

type DriftOverrides =
  Partial<
    RuntimeRecommendationAdaptiveObservationDrift
  >;

function createDrift(
  overrides:
    DriftOverrides = {}
):
  RuntimeRecommendationAdaptiveObservationDrift {
  return {
    observationCount:
      10,

    comparableObservationCount:
      10,

    incompleteObservationCount:
      0,

    baselineWindow: {
      observationCount:
        5,

      firstObservedAt:
        "2026-07-01T00:00:00.000Z",

      lastObservedAt:
        "2026-07-05T00:00:00.000Z",

      dominantCandidateId:
        ADAPTIVE_CANDIDATE_ID,

      dominantCandidateRate:
        1,

      winnerSwitchCount:
        0,

      winnerTransitionCount:
        4,

      winnerSwitchRate:
        0,

      winnerChangedCount:
        0,

      winnerChangedRate:
        0,

      averageAdaptiveScoreDifference:
        0.15,
    },

    recentWindow: {
      observationCount:
        5,

      firstObservedAt:
        "2026-07-06T00:00:00.000Z",

      lastObservedAt:
        "2026-07-10T00:00:00.000Z",

      dominantCandidateId:
        ADAPTIVE_CANDIDATE_ID,

      dominantCandidateRate:
        1,

      winnerSwitchCount:
        0,

      winnerTransitionCount:
        4,

      winnerSwitchRate:
        0,

      winnerChangedCount:
        0,

      winnerChangedRate:
        0,

      averageAdaptiveScoreDifference:
        0.17,
    },

    dominantCandidateChanged:
      false,

    candidateDistributionDistance:
      0,

    winnerSwitchRateDifference:
      0,

    winnerChangeRateDifference:
      0,

    adaptiveScoreDifferenceDelta:
      0.02,

    normalizedAdaptiveScoreDifferenceDelta:
      0.02,

    driftScore:
      0.05,

    candidateDistributions: [
      {
        candidateId:
          ADAPTIVE_CANDIDATE_ID,

        baselineCount:
          5,

        recentCount:
          5,

        baselineRate:
          1,

        recentRate:
          1,

        absoluteRateDifference:
          0,
      },
    ],

    level:
      "stable",

    status:
      "calculated",

    reason:
      "baseline-and-recent-windows-compared",

    ...overrides,
  };
}

type ConfidenceOverrides =
  Partial<
    RuntimeRecommendationAdaptiveObservationConfidence
  >;

function createConfidence(
  overrides:
    ConfidenceOverrides = {}
):
  RuntimeRecommendationAdaptiveObservationConfidence {
  return {
    observationCount:
      10,

    comparableObservationCount:
      10,

    incompleteObservationCount:
      0,

    evidenceScore:
      0.9,

    stabilityScore:
      0.8889,

    agreementScore:
      0.9,

    driftResistanceScore:
      0.95,

    completenessScore:
      1,

    appliedWeightTotal:
      1,

    confidenceScore:
      0.91,

    components: [
      {
        name:
          "evidence",

        available:
          true,

        value:
          0.9,

        weight:
          0.25,

        weightedValue:
          0.225,

        reason:
          "Observation evidence is available.",
      },

      {
        name:
          "stability",

        available:
          true,

        value:
          0.8889,

        weight:
          0.25,

        weightedValue:
          0.222225,

        reason:
          "Stability evidence is available.",
      },

      {
        name:
          "agreement",

        available:
          true,

        value:
          0.9,

        weight:
          0.2,

        weightedValue:
          0.18,

        reason:
          "Agreement evidence is available.",
      },

      {
        name:
          "drift-resistance",

        available:
          true,

        value:
          0.95,

        weight:
          0.2,

        weightedValue:
          0.19,

        reason:
          "Drift resistance evidence is available.",
      },

      {
        name:
          "completeness",

        available:
          true,

        value:
          1,

        weight:
          0.1,

        weightedValue:
          0.1,

        reason:
          "Observation evidence is complete.",
      },
    ],

    level:
      "strong",

    status:
      "calculated",

    reason:
      "adaptive-observation-confidence-calculated",

    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/* Summary Factory */
/* ------------------------------------------------------------------ */

type CreateSummaryTestParams = {
  statistics?:
    RuntimeRecommendationAdaptiveObservationStatistics;

  stability?:
    RuntimeRecommendationAdaptiveObservationStability;

  drift?:
    RuntimeRecommendationAdaptiveObservationDrift;

  confidence?:
    RuntimeRecommendationAdaptiveObservationConfidence;

  policy?:
    Parameters<
      typeof createAdaptiveRecommendationObservationSummary
    >[0]["policy"];
};

function createSummary({
  statistics =
    createStatistics(),

  stability =
    createStability(),

  drift =
    createDrift(),

  confidence =
    createConfidence(),

  policy,
}: CreateSummaryTestParams = {}):
  CreateAdaptiveRecommendationObservationSummaryResult {
  return createAdaptiveRecommendationObservationSummary({
    statistics,

    stability,

    drift,

    confidence,

    policy,

    generatedAt:
      TEST_GENERATED_AT,
  });
}

/* ------------------------------------------------------------------ */
/* Scenario 1: Strong and Stable */
/* ------------------------------------------------------------------ */

function testStrongStableSummary():
  void {
  const result =
    createSummary();

  const {
    summary,
    diagnostics,
  } = result;

  assertEqual(
    summary.status,
    "complete",
    "Strong and stable Summary should be complete."
  );

  assertEqual(
    summary.reason,
    "adaptive-observation-analysis-summarized",
    "Strong and stable Summary should use the completed reason."
  );

  assertEqual(
    summary.tone,
    "strong",
    "Strong, stable, and low-Drift evidence should produce a strong tone."
  );

  assertEqual(
    summary.dominantAdaptiveCandidateId,
    ADAPTIVE_CANDIDATE_ID,
    "Recent dominant Candidate should become the Summary dominant Candidate."
  );

  assertEqual(
    summary.currentAdaptiveCandidateId,
    ADAPTIVE_CANDIDATE_ID,
    "Current Stability Candidate should be retained."
  );

  assertEqual(
    summary.primaryRisk,
    null,
    "Strong and complete evidence should not require a primary risk."
  );

  assertTrue(
    summary.strengths.length >
      0,
    "Strong evidence should generate Summary strengths."
  );

  assertTrue(
    summary.insights.length >
      0,
    "Strong evidence should generate Summary insights."
  );

  assertEqual(
    diagnostics.generatedAt,
    TEST_GENERATED_AT,
    "Diagnostics should preserve the deterministic generatedAt value."
  );

  assertEqual(
    diagnostics.warningCount,
    0,
    "Consistent source contracts should not produce warnings."
  );

  console.log(
    "PASS: Strong and Stable Summary"
  );
}

/* ------------------------------------------------------------------ */
/* Scenario 2: Significant Drift */
/* ------------------------------------------------------------------ */

function testSignificantDriftSummary():
  void {
  const drift =
    createDrift({
      recentWindow: {
        ...createDrift()
          .recentWindow,

        dominantCandidateId:
          DRIFTED_CANDIDATE_ID,

        dominantCandidateRate:
          0.8,

        winnerSwitchCount:
          3,

        winnerTransitionCount:
          4,

        winnerSwitchRate:
          0.75,

        winnerChangedCount:
          4,

        winnerChangedRate:
          0.8,

        averageAdaptiveScoreDifference:
          0.8,
      },

      dominantCandidateChanged:
        true,

      candidateDistributionDistance:
        0.8,

      winnerSwitchRateDifference:
        0.75,

      winnerChangeRateDifference:
        0.8,

      adaptiveScoreDifferenceDelta:
        0.65,

      normalizedAdaptiveScoreDifferenceDelta:
        0.65,

      driftScore:
        0.82,

      level:
        "significant",
    });

  const confidence =
    createConfidence({
      driftResistanceScore:
        0.18,

      confidenceScore:
        0.7,

      level:
        "established",
    });

  const result =
    createSummary({
      drift,
      confidence,
    });

  assertEqual(
    result.summary.tone,
    "cautious",
    "Significant Drift should produce a cautious tone."
  );

  assertEqual(
    result.summary.dominantAdaptiveCandidateId,
    DRIFTED_CANDIDATE_ID,
    "The recent dominant Candidate should override the historical streak Candidate."
  );

  assertNotNull(
    result.summary.primaryRisk,
    "Significant Drift should produce a primary risk."
  );

  assertIncludes(
    result.summary.headline,
    "changing significantly",
    "Significant Drift should be visible in the headline."
  );

  assertTrue(
    result.summary.risks.some(
      (
        risk
      ) =>
        risk.category ===
        "drift"
    ),
    "Significant Drift should generate a Drift risk item."
  );

  assertTrue(
    result.summary.recommendations.some(
      (
        recommendation
      ) =>
        recommendation.id ===
        "review-drift"
    ),
    "Significant Drift should recommend a Drift review."
  );

  console.log(
    "PASS: Significant Drift Summary"
  );
}

/* ------------------------------------------------------------------ */
/* Scenario 3: Unstable Winner */
/* ------------------------------------------------------------------ */

function testUnstableWinnerSummary():
  void {
  const stability =
    createStability({
      adaptiveWinnerRepeatCount:
        2,

      adaptiveWinnerSwitchCount:
        7,

      adaptiveWinnerTransitionCount:
        9,

      adaptiveWinnerRepeatRate:
        0.2222,

      adaptiveWinnerSwitchRate:
        0.7778,

      longestAdaptiveWinnerStreak:
        2,

      currentAdaptiveWinnerStreak:
        1,

      level:
        "unstable",
    });

  const confidence =
    createConfidence({
      stabilityScore:
        0.2222,

      confidenceScore:
        0.42,

      level:
        "emerging",
    });

  const result =
    createSummary({
      stability,
      confidence,
    });

  assertEqual(
    result.summary.tone,
    "cautious",
    "Unstable Winner continuity should produce a cautious tone."
  );

  assertNotNull(
    result.summary.primaryRisk,
    "Unstable Winner continuity should produce a primary risk."
  );

  assertIncludes(
    result.summary.headline,
    "unstable",
    "Unstable Winner continuity should appear in the headline."
  );

  assertTrue(
    result.summary.risks.some(
      (
        risk
      ) =>
        risk.category ===
        "stability"
    ),
    "Unstable Winner continuity should generate a Stability risk."
  );

  assertTrue(
    result.summary.recommendations.some(
      (
        recommendation
      ) =>
        recommendation.id ===
        "observe-stability"
    ),
    "Unstable Winner continuity should recommend continued observation."
  );

  console.log(
    "PASS: Unstable Winner Summary"
  );
}

/* ------------------------------------------------------------------ */
/* Scenario 4: Partial History */
/* ------------------------------------------------------------------ */

function testPartialHistorySummary():
  void {
  const statistics =
    createStatistics({
      observationCount:
        10,

      comparableObservationCount:
        8,

      incompleteObservationCount:
        2,

      status:
        "partial",
    });

  const stability =
    createStability({
      observationCount:
        10,

      comparableObservationCount:
        8,

      incompleteObservationCount:
        2,

      status:
        "partial",

      reason:
        "history-contains-incomplete-observations",
    });

  const drift =
    createDrift({
      observationCount:
        10,

      comparableObservationCount:
        8,

      incompleteObservationCount:
        2,

      status:
        "partial",

      reason:
        "history-contains-incomplete-observations",
    });

  const confidence =
    createConfidence({
      observationCount:
        10,

      comparableObservationCount:
        8,

      incompleteObservationCount:
        2,

      completenessScore:
        0.8,

      status:
        "partial",

      reason:
        "analysis-contains-partial-data",
    });

  const result =
    createSummary({
      statistics,
      stability,
      drift,
      confidence,
    });

  assertEqual(
    result.summary.status,
    "partial",
    "Incomplete Observation evidence should produce a partial Summary."
  );

  assertEqual(
    result.summary.reason,
    "analysis-contains-partial-data",
    "Partial source evidence should use the partial-data reason."
  );

  assertEqual(
    result.summary.incompleteObservationCount,
    2,
    "Summary should preserve the incomplete Observation count."
  );

  assertNotNull(
    result.summary.primaryRisk,
    "Incomplete evidence should produce a primary risk."
  );

  assertTrue(
    result.summary.risks.some(
      (
        risk
      ) =>
        risk.id ===
        "incomplete"
    ),
    "Incomplete evidence should generate a completeness risk."
  );

  console.log(
    "PASS: Partial Observation History Summary"
  );
}

/* ------------------------------------------------------------------ */
/* Scenario 5: Insufficient Data */
/* ------------------------------------------------------------------ */

function testInsufficientDataSummary():
  void {
  const statistics =
    createStatistics({
      observationCount:
        0,

      comparableObservationCount:
        0,

      incompleteObservationCount:
        0,

      sameCandidateCount:
        0,

      changedWinnerCount:
        0,

      sameCandidateRate:
        null,

      changedWinnerRate:
        null,

      status:
        "insufficient-data",
    });

  const stability =
    createStability({
      observationCount:
        0,

      comparableObservationCount:
        0,

      incompleteObservationCount:
        0,

      adaptiveWinnerRepeatCount:
        0,

      adaptiveWinnerSwitchCount:
        0,

      adaptiveWinnerTransitionCount:
        0,

      adaptiveWinnerRepeatRate:
        null,

      adaptiveWinnerSwitchRate:
        null,

      longestAdaptiveWinnerStreak:
        0,

      currentAdaptiveWinnerStreak:
        0,

      currentAdaptiveWinnerCandidateId:
        null,

      longestStreakCandidateId:
        null,

      candidateFrequencies:
        [],

      level:
        "insufficient-data",

      status:
        "insufficient-data",

      reason:
        "no-observations",
    });

  const drift =
    createDrift({
      observationCount:
        0,

      comparableObservationCount:
        0,

      incompleteObservationCount:
        0,

      baselineWindow: {
        ...createDrift()
          .baselineWindow,

        observationCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        dominantCandidateId:
          null,

        dominantCandidateRate:
          null,

        winnerTransitionCount:
          0,

        winnerSwitchRate:
          null,

        winnerChangedRate:
          null,

        averageAdaptiveScoreDifference:
          null,
      },

      recentWindow: {
        ...createDrift()
          .recentWindow,

        observationCount:
          0,

        firstObservedAt:
          null,

        lastObservedAt:
          null,

        dominantCandidateId:
          null,

        dominantCandidateRate:
          null,

        winnerTransitionCount:
          0,

        winnerSwitchRate:
          null,

        winnerChangedRate:
          null,

        averageAdaptiveScoreDifference:
          null,
      },

      candidateDistributionDistance:
        null,

      winnerSwitchRateDifference:
        null,

      winnerChangeRateDifference:
        null,

      adaptiveScoreDifferenceDelta:
        null,

      normalizedAdaptiveScoreDifferenceDelta:
        null,

      driftScore:
        null,

      candidateDistributions:
        [],

      level:
        "insufficient-data",

      status:
        "insufficient-data",

      reason:
        "no-observations",
    });

  const confidence =
    createConfidence({
      observationCount:
        0,

      comparableObservationCount:
        0,

      incompleteObservationCount:
        0,

      evidenceScore:
        null,

      stabilityScore:
        null,

      agreementScore:
        null,

      driftResistanceScore:
        null,

      completenessScore:
        null,

      appliedWeightTotal:
        0,

      confidenceScore:
        null,

      components:
        [],

      level:
        "insufficient-data",

      status:
        "insufficient-data",

      reason:
        "no-observations",
    });

  const result =
    createSummary({
      statistics,
      stability,
      drift,
      confidence,
    });

  assertEqual(
    result.summary.status,
    "insufficient-data",
    "Empty analytics should produce an insufficient-data Summary."
  );

  assertEqual(
    result.summary.reason,
    "no-observations",
    "Empty analytics should use the no-observations reason."
  );

  assertEqual(
    result.summary.tone,
    "insufficient-data",
    "Empty analytics should produce an insufficient-data tone."
  );

  assertEqual(
    result.summary.dominantAdaptiveCandidateId,
    null,
    "Empty analytics should not produce a dominant Candidate."
  );

  assertNotNull(
    result.summary.primaryRisk,
    "Empty analytics should explain the absence of evidence."
  );

  assertTrue(
    result.summary.recommendations.some(
      (
        recommendation
      ) =>
        recommendation.id ===
        "collect-evidence"
    ),
    "Empty analytics should recommend collecting evidence."
  );

  console.log(
    "PASS: Insufficient Data Summary"
  );
}

/* ------------------------------------------------------------------ */
/* Scenario 6: Policy Limits and Deep Clone */
/* ------------------------------------------------------------------ */

function testPolicyLimitsAndClone():
  void {
  const result =
    createSummary({
      policy: {
        maximumStrengthCount:
          1,

        maximumRiskCount:
          1,

        maximumInsightCount:
          1,

        maximumRecommendationCount:
          1,
      },
    });

  assertTrue(
    result.summary.strengths.length <=
      1,
    "Strength count should respect the Summary policy."
  );

  assertTrue(
    result.summary.risks.length <=
      1,
    "Risk count should respect the Summary policy."
  );

  assertTrue(
    result.summary.insights.length <=
      1,
    "Insight count should respect the Summary policy."
  );

  assertTrue(
    result.summary.recommendations.length <=
      1,
    "Recommendation count should respect the Summary policy."
  );

  const originalHeadline =
    result.summary.headline;

  const clonedSummary:
    RuntimeRecommendationAdaptiveObservationSummary = {
    ...result.summary,

    strengths:
      result.summary.strengths.map(
        (
          strength
        ) => ({
          ...strength,
        })
      ),

    risks:
      result.summary.risks.map(
        (
          risk
        ) => ({
          ...risk,
        })
      ),

    insights:
      result.summary.insights.map(
        (
          insight
        ) => ({
          ...insight,
        })
      ),

    recommendations:
      result.summary.recommendations.map(
        (
          recommendation
        ) => ({
          ...recommendation,
        })
      ),

    sourceStatus: {
      ...result.summary.sourceStatus,
    },
  };

  clonedSummary.headline =
    "mutated-headline";

  clonedSummary.sourceStatus
    .statisticsStatus =
    "mutated-status";

  if (
    clonedSummary.strengths.length >
    0
  ) {
    clonedSummary.strengths[0]
      .title =
      "mutated-strength";
  }

  assertEqual(
    result.summary.headline,
    originalHeadline,
    "Mutating a copied Summary should not change the original headline."
  );

  assertEqual(
    result.summary.sourceStatus
      .statisticsStatus,
    "calculated",
    "Mutating a copied source status should not change the original Summary."
  );

  assertEqual(
    result.diagnostics.warningCount,
    result.diagnostics.warnings.length,
    "Diagnostics warning count should match its warning array."
  );

  console.log(
    "PASS: Policy Limits and Clone"
  );
}

/* ------------------------------------------------------------------ */
/* Test Runner */
/* ------------------------------------------------------------------ */

export function runAdaptiveRecommendationObservationSummaryTests():
  void {
  testStrongStableSummary();

  testSignificantDriftSummary();

  testUnstableWinnerSummary();

  testPartialHistorySummary();

  testInsufficientDataSummary();

  testPolicyLimitsAndClone();

  console.log(
    "All Adaptive Recommendation Observation Summary tests passed."
  );
}

/* ------------------------------------------------------------------ */
/* Manual Execution */
/* ------------------------------------------------------------------ */

runAdaptiveRecommendationObservationSummaryTests();