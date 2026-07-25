import {
  createAdaptiveRecommendationObservationStability,
} from "../createAdaptiveRecommendationObservationStability";

import type {
  RuntimeRecommendationAdaptiveObservation,
} from "../createAdaptiveRecommendationObservation";

import type {
  RuntimeRecommendationAdaptiveObservationHistory,
} from "../createAdaptiveRecommendationObservationHistory";

/* ------------------------------------------------------------------ */
/* Test Data Helpers */
/* ------------------------------------------------------------------ */

function createObservation(
  candidateId:
    string | null,
  generatedAt:
    string,
  index:
    number
): RuntimeRecommendationAdaptiveObservation {
  /*
   * Stability 테스트에 필요한 핵심 필드만 생성합니다.
   *
   * Observation Contract에 다른 필수 필드가 존재할 수 있으므로,
   * 테스트용 최소 객체를 최종 타입으로 변환합니다.
   */
  return {
    observationId:
      `observation-${index}`,

    adaptiveCandidateId:
      candidateId,

    generatedAt,
  } as unknown as
    RuntimeRecommendationAdaptiveObservation;
}

function createHistory(
  observations:
    RuntimeRecommendationAdaptiveObservation[]
): RuntimeRecommendationAdaptiveObservationHistory {
  /*
   * Stability 함수가 직접 사용하는 핵심 필드는
   * observationCount와 observations입니다.
   */
  return {
    observationCount:
      observations.length,

    observations,
  } as unknown as
    RuntimeRecommendationAdaptiveObservationHistory;
}

/* ------------------------------------------------------------------ */
/* Assertion Helpers */
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
    actual !== expected
  ) {
    throw new Error(
      [
        message,
        `Expected: ${String(expected)}`,
        `Actual: ${String(actual)}`,
      ].join("\n")
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
      message
    );
  }
}

function logTestPassed(
  testName:
    string
): void {
  console.log(
    `✅ PASS: ${testName}`
  );
}

/* ------------------------------------------------------------------ */
/* Test 1: A A A */
/* ------------------------------------------------------------------ */

function testStableSequence():
  void {
  const history =
    createHistory([
      createObservation(
        "A",
        "2026-01-01T00:00:00.000Z",
        1
      ),

      createObservation(
        "A",
        "2026-01-02T00:00:00.000Z",
        2
      ),

      createObservation(
        "A",
        "2026-01-03T00:00:00.000Z",
        3
      ),
    ]);

  const result =
    createAdaptiveRecommendationObservationStability({
      history,

      generatedAt:
        "2026-01-04T00:00:00.000Z",
    });

  const stability =
    result.stability;

  assertEqual(
    stability.adaptiveWinnerRepeatCount,
    2,
    "A A A repeat count should be 2."
  );

  assertEqual(
    stability.adaptiveWinnerSwitchCount,
    0,
    "A A A switch count should be 0."
  );

  assertEqual(
    stability.adaptiveWinnerTransitionCount,
    2,
    "A A A transition count should be 2."
  );

  assertEqual(
    stability.adaptiveWinnerRepeatRate,
    1,
    "A A A repeat rate should be 1."
  );

  assertEqual(
    stability.adaptiveWinnerSwitchRate,
    0,
    "A A A switch rate should be 0."
  );

  assertEqual(
    stability.longestAdaptiveWinnerStreak,
    3,
    "A A A longest streak should be 3."
  );

  assertEqual(
    stability.currentAdaptiveWinnerStreak,
    3,
    "A A A current streak should be 3."
  );

  assertEqual(
    stability.currentAdaptiveWinnerCandidateId,
    "A",
    "A A A current Candidate should be A."
  );

  assertEqual(
    stability.longestStreakCandidateId,
    "A",
    "A A A longest-streak Candidate should be A."
  );

  assertEqual(
    stability.level,
    "stable",
    "A A A Stability level should be stable."
  );

  assertEqual(
    stability.status,
    "calculated",
    "A A A Stability status should be calculated."
  );

  logTestPassed(
    "A A A stable sequence"
  );
}

/* ------------------------------------------------------------------ */
/* Test 2: A B A */
/* ------------------------------------------------------------------ */

function testUnstableSequence():
  void {
  const history =
    createHistory([
      createObservation(
        "A",
        "2026-02-01T00:00:00.000Z",
        1
      ),

      createObservation(
        "B",
        "2026-02-02T00:00:00.000Z",
        2
      ),

      createObservation(
        "A",
        "2026-02-03T00:00:00.000Z",
        3
      ),
    ]);

  const result =
    createAdaptiveRecommendationObservationStability({
      history,
    });

  const stability =
    result.stability;

  assertEqual(
    stability.adaptiveWinnerRepeatCount,
    0,
    "A B A repeat count should be 0."
  );

  assertEqual(
    stability.adaptiveWinnerSwitchCount,
    2,
    "A B A switch count should be 2."
  );

  assertEqual(
    stability.adaptiveWinnerTransitionCount,
    2,
    "A B A transition count should be 2."
  );

  assertEqual(
    stability.adaptiveWinnerRepeatRate,
    0,
    "A B A repeat rate should be 0."
  );

  assertEqual(
    stability.adaptiveWinnerSwitchRate,
    1,
    "A B A switch rate should be 1."
  );

  assertEqual(
    stability.longestAdaptiveWinnerStreak,
    1,
    "A B A longest streak should be 1."
  );

  assertEqual(
    stability.currentAdaptiveWinnerStreak,
    1,
    "A B A current streak should be 1."
  );

  assertEqual(
    stability.currentAdaptiveWinnerCandidateId,
    "A",
    "A B A current Candidate should be A."
  );

  assertEqual(
    stability.level,
    "unstable",
    "A B A Stability level should be unstable."
  );

  logTestPassed(
    "A B A unstable sequence"
  );
}

/* ------------------------------------------------------------------ */
/* Test 3: A A B B */
/* ------------------------------------------------------------------ */

function testEmergingSequence():
  void {
  const history =
    createHistory([
      createObservation(
        "A",
        "2026-03-01T00:00:00.000Z",
        1
      ),

      createObservation(
        "A",
        "2026-03-02T00:00:00.000Z",
        2
      ),

      createObservation(
        "B",
        "2026-03-03T00:00:00.000Z",
        3
      ),

      createObservation(
        "B",
        "2026-03-04T00:00:00.000Z",
        4
      ),
    ]);

  const result =
    createAdaptiveRecommendationObservationStability({
      history,
    });

  const stability =
    result.stability;

  assertEqual(
    stability.adaptiveWinnerRepeatCount,
    2,
    "A A B B repeat count should be 2."
  );

  assertEqual(
    stability.adaptiveWinnerSwitchCount,
    1,
    "A A B B switch count should be 1."
  );

  assertEqual(
    stability.adaptiveWinnerTransitionCount,
    3,
    "A A B B transition count should be 3."
  );

  assertEqual(
    stability.adaptiveWinnerRepeatRate,
    0.6667,
    "A A B B repeat rate should be 0.6667."
  );

  assertEqual(
    stability.adaptiveWinnerSwitchRate,
    0.3333,
    "A A B B switch rate should be 0.3333."
  );

  assertEqual(
    stability.longestAdaptiveWinnerStreak,
    2,
    "A A B B longest streak should be 2."
  );

  assertEqual(
    stability.currentAdaptiveWinnerStreak,
    2,
    "A A B B current streak should be 2."
  );

  assertEqual(
    stability.currentAdaptiveWinnerCandidateId,
    "B",
    "A A B B current Candidate should be B."
  );

  /*
   * 동일 길이의 Streak에서는 먼저 최장 길이에 도달한
   * Candidate A가 유지되어야 합니다.
   */
  assertEqual(
    stability.longestStreakCandidateId,
    "A",
    "A A B B longest-streak Candidate should be A."
  );

  assertEqual(
    stability.level,
    "emerging",
    "A A B B Stability level should be emerging."
  );

  logTestPassed(
    "A A B B emerging sequence"
  );
}

/* ------------------------------------------------------------------ */
/* Test 4: Complex Streak */
/* ------------------------------------------------------------------ */

function testComplexStreakSequence():
  void {
  const history =
    createHistory([
      createObservation(
        "A",
        "2026-04-01T00:00:00.000Z",
        1
      ),

      createObservation(
        "A",
        "2026-04-02T00:00:00.000Z",
        2
      ),

      createObservation(
        "B",
        "2026-04-03T00:00:00.000Z",
        3
      ),

      createObservation(
        "A",
        "2026-04-04T00:00:00.000Z",
        4
      ),

      createObservation(
        "A",
        "2026-04-05T00:00:00.000Z",
        5
      ),

      createObservation(
        "A",
        "2026-04-06T00:00:00.000Z",
        6
      ),

      createObservation(
        "B",
        "2026-04-07T00:00:00.000Z",
        7
      ),
    ]);

  const result =
    createAdaptiveRecommendationObservationStability({
      history,
    });

  const stability =
    result.stability;

  assertEqual(
    stability.longestAdaptiveWinnerStreak,
    3,
    "Complex sequence longest streak should be 3."
  );

  assertEqual(
    stability.currentAdaptiveWinnerCandidateId,
    "B",
    "Complex sequence current Candidate should be B."
  );

  assertEqual(
    stability.currentAdaptiveWinnerStreak,
    1,
    "Complex sequence current streak should be 1."
  );

  assertEqual(
    stability.longestStreakCandidateId,
    "A",
    "Complex sequence longest-streak Candidate should be A."
  );

  const candidateA =
    stability.candidateFrequencies.find(
      (frequency) =>
        frequency.candidateId ===
        "A"
    );

  const candidateB =
    stability.candidateFrequencies.find(
      (frequency) =>
        frequency.candidateId ===
        "B"
    );

  assertTrue(
    candidateA !== undefined,
    "Candidate A frequency should exist."
  );

  assertTrue(
    candidateB !== undefined,
    "Candidate B frequency should exist."
  );

  assertEqual(
    candidateA?.occurrenceCount,
    5,
    "Candidate A occurrence count should be 5."
  );

  assertEqual(
    candidateA?.longestStreak,
    3,
    "Candidate A longest streak should be 3."
  );

  assertEqual(
    candidateA?.latestStreak,
    3,
    "Candidate A latest streak should be 3."
  );

  assertEqual(
    candidateB?.occurrenceCount,
    2,
    "Candidate B occurrence count should be 2."
  );

  assertEqual(
    candidateB?.longestStreak,
    1,
    "Candidate B longest streak should be 1."
  );

  assertEqual(
    candidateB?.latestStreak,
    1,
    "Candidate B latest streak should be 1."
  );

  logTestPassed(
    "A A B A A A B complex streak"
  );
}

/* ------------------------------------------------------------------ */
/* Test 5: Empty History */
/* ------------------------------------------------------------------ */

function testEmptyHistory():
  void {
  const history =
    createHistory([]);

  const result =
    createAdaptiveRecommendationObservationStability({
      history,
    });

  assertEqual(
    result.stability.status,
    "insufficient-data",
    "Empty History status should be insufficient-data."
  );

  assertEqual(
    result.stability.reason,
    "no-observations",
    "Empty History reason should be no-observations."
  );

  assertEqual(
    result.stability.level,
    "insufficient-data",
    "Empty History level should be insufficient-data."
  );

  assertTrue(
    result.diagnostics.warnings.includes(
      "Adaptive Recommendation Observation History is empty."
    ),
    "Empty History should produce a warning."
  );

  logTestPassed(
    "Empty History"
  );
}

/* ------------------------------------------------------------------ */
/* Test 6: Invalid Candidate and Date */
/* ------------------------------------------------------------------ */

function testInvalidObservation():
  void {
  const history =
    createHistory([
      createObservation(
        "",
        "2026-05-01T00:00:00.000Z",
        1
      ),

      createObservation(
        "A",
        "invalid-date",
        2
      ),

      createObservation(
        null,
        "2026-05-03T00:00:00.000Z",
        3
      ),
    ]);

  const result =
    createAdaptiveRecommendationObservationStability({
      history,
    });

  assertEqual(
    result.stability.observationCount,
    3,
    "Invalid test should retain total Observation count."
  );

  assertEqual(
    result.stability.comparableObservationCount,
    0,
    "Invalid Observations should not be comparable."
  );

  assertEqual(
    result.stability.incompleteObservationCount,
    3,
    "All invalid Observations should be incomplete."
  );

  assertEqual(
    result.stability.status,
    "insufficient-data",
    "Invalid Observation status should be insufficient-data."
  );

  assertEqual(
    result.stability.reason,
    "no-comparable-observations",
    "Invalid Observation reason should be no-comparable-observations."
  );

  assertTrue(
    result.diagnostics.warningCount >
      0,
    "Invalid Observations should produce warnings."
  );

  assertTrue(
    result.diagnostics.warnings.some(
      (warning) =>
        warning.includes(
          "empty adaptiveCandidateId"
        )
    ),
    "Empty Candidate ID warning should exist."
  );

  assertTrue(
    result.diagnostics.warnings.some(
      (warning) =>
        warning.includes(
          "invalid generatedAt"
        )
    ),
    "Invalid generatedAt warning should exist."
  );

  logTestPassed(
    "Invalid Candidate and generatedAt"
  );
}

/* ------------------------------------------------------------------ */
/* Test Runner */
/* ------------------------------------------------------------------ */

function runAdaptiveRecommendationObservationStabilityTests():
  void {
  console.log(
    "=== Adaptive Recommendation Observation Stability Tests ==="
  );

  testStableSequence();

  testUnstableSequence();

  testEmergingSequence();

  testComplexStreakSequence();

  testEmptyHistory();

  testInvalidObservation();

  console.log(
    "✅ All Adaptive Recommendation Observation Stability tests passed."
  );
}

runAdaptiveRecommendationObservationStabilityTests();