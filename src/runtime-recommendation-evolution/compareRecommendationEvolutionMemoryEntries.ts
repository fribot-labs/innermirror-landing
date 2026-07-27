import type {
    RecommendationEvolutionIntelligenceSignalConfidence,
    RecommendationEvolutionIntelligenceState,
    RecommendationEvolutionRuntimeDecisionType,
} from "./recommendationEvolutionIntelligenceTypes";

import type {
    CompareRecommendationEvolutionMemoryEntriesParams,
    RecommendationEvolutionMemoryComparison,
    RecommendationEvolutionMemoryComparisonSignal,
    RecommendationEvolutionMemoryComparisonType,
    RecommendationEvolutionMemoryDecisionChanges,
    RecommendationEvolutionMemoryEntry,
    RecommendationEvolutionMemoryScoreChanges,
    ValidateRecommendationEvolutionMemoryComparisonParams,
} from "./recommendationEvolutionMemoryTypes";

import {
    isRecommendationEvolutionMemoryComparisonSignalType,
    isRecommendationEvolutionMemoryComparisonType,
} from "./recommendationEvolutionMemoryTypes";

import {
    validateRecommendationEvolutionMemoryEntry,
} from "./createRecommendationEvolutionMemoryEntry";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * Score 변화가 이 값보다 클 때만 의미 있는 변화 Signal로 기록합니다.
 *
 * 부동소수점 계산의 미세한 차이가 변화로 분류되는 것을 방지합니다.
 */
const SCORE_CHANGE_THRESHOLD =
  0.01;

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * 이전 Recommendation Evolution Memory Entry와 현재 Entry를 비교해
 * Runtime 판단의 변화 구조를 생성합니다.
 *
 * 이전 Entry가 null이면 최초 Memory Entry에 대한 initial 비교를
 * 생성합니다.
 */
export function compareRecommendationEvolutionMemoryEntries(
  params:
    CompareRecommendationEvolutionMemoryEntriesParams,
): RecommendationEvolutionMemoryComparison {
  const {
    previous,
    current,
    comparedAt,
    createComparisonId,
  } = params;

  if (
    previous !==
    null
  ) {
    validateRecommendationEvolutionMemoryEntry({
      entry:
        previous,
    });
  }

  validateRecommendationEvolutionMemoryEntry({
    entry:
      current,
  });

  validateComparisonInputConsistency({
    previous,
    current,
    comparedAt,
  });

  const comparisonId =
    createComparisonId();

  validateRequiredIdentifier(
    comparisonId,
    "Recommendation Evolution Memory Comparison id",
  );

  const scoreChanges =
    calculateMemoryScoreChanges(
      previous,
      current,
    );

  const decisionChanges =
    calculateMemoryDecisionChanges(
      previous,
      current,
    );

  const stateChanged =
    previous !==
      null &&
    previous.state !==
      current.state;

  const strategyChanged =
    previous !==
      null &&
    previous.strategyType !==
      current.strategyType;

  const confidenceChanged =
    previous !==
      null &&
    previous.assessmentConfidence !==
      current.assessmentConfidence;

  const primarySignalChanged =
    previous !==
      null &&
    previous.primarySignalType !==
      current.primarySignalType;

  const signals =
    createMemoryComparisonSignals({
      previous,
      current,
      scoreChanges,
      stateChanged,
      strategyChanged,
      confidenceChanged,
    });

  const type =
    resolveMemoryComparisonType({
      previous,
      current,
      scoreChanges,
      stateChanged,
      strategyChanged,
      confidenceChanged,
    });

  const comparison:
    RecommendationEvolutionMemoryComparison = {
      id:
        comparisonId,

      previous:
        previous ===
        null
          ? null
          : cloneRecommendationEvolutionMemoryEntry(
              previous,
            ),

      current:
        cloneRecommendationEvolutionMemoryEntry(
          current,
        ),

      type,

      stateChanged,

      strategyChanged,

      confidenceChanged,

      primarySignalChanged,

      scoreChanges,

      decisionChanges,

      signals,

      comparedAt,
    };

  validateRecommendationEvolutionMemoryComparison({
    comparison,
  });

  return comparison;
}

/* ------------------------------------------------------------------ */
/* Comparison Type Resolution                                         */
/* ------------------------------------------------------------------ */

type ResolveMemoryComparisonTypeParams = {
  previous:
    RecommendationEvolutionMemoryEntry | null;

  current:
    RecommendationEvolutionMemoryEntry;

  scoreChanges:
    RecommendationEvolutionMemoryScoreChanges;

  stateChanged:
    boolean;

  strategyChanged:
    boolean;

  confidenceChanged:
    boolean;
};

function resolveMemoryComparisonType(
  params:
    ResolveMemoryComparisonTypeParams,
): RecommendationEvolutionMemoryComparisonType {
  const {
    previous,
    current,
    scoreChanges,
    stateChanged,
    strategyChanged,
    confidenceChanged,
  } = params;

  if (
    previous ===
    null
  ) {
    return "initial";
  }

  const stateTransitionType =
    classifyStateTransition(
      previous.state,
      current.state,
    );

  if (
    stateTransitionType !==
    null
  ) {
    return stateTransitionType;
  }

  if (
    !stateChanged &&
    strategyChanged
  ) {
    return "strategy-shifted";
  }

  if (
    !stateChanged &&
    !strategyChanged &&
    confidenceChanged
  ) {
    const confidenceDirection =
      compareConfidence(
        previous.assessmentConfidence,
        current.assessmentConfidence,
      );

    if (
      confidenceDirection >
      0
    ) {
      return "confidence-improved";
    }

    if (
      confidenceDirection <
      0
    ) {
      return "confidence-declined";
    }
  }

  if (
    !stateChanged &&
    !strategyChanged &&
    !confidenceChanged &&
    !hasMeaningfulScoreChange(
      scoreChanges,
    )
  ) {
    return "unchanged";
  }

  return "mixed";
}

/* ------------------------------------------------------------------ */
/* State Transition Classification                                    */
/* ------------------------------------------------------------------ */

/**
 * Intelligence State를 단순한 숫자 순위로 처리하지 않고
 * 명시적인 상태 전이 규칙으로 분류합니다.
 */
function classifyStateTransition(
  previous:
    RecommendationEvolutionIntelligenceState,
  current:
    RecommendationEvolutionIntelligenceState,
): RecommendationEvolutionMemoryComparisonType | null {
  if (
    previous ===
    current
  ) {
    return null;
  }

  if (
    current ===
    "fragmented"
  ) {
    return "fragmented";
  }

  if (
    current ===
    "stalled"
  ) {
    return "stalled";
  }

  if (
    isRecoveryTransition(
      previous,
      current,
    )
  ) {
    return "recovered";
  }

  if (
    isRegressionTransition(
      previous,
      current,
    )
  ) {
    return "regressed";
  }

  if (
    current ===
      "advancing" &&
    (
      previous ===
        "stable" ||
      previous ===
        "progressing" ||
      previous ===
        "observing"
    )
  ) {
    return "advanced";
  }

  if (
    current ===
      "progressing" &&
    (
      previous ===
        "observing" ||
      previous ===
        "stable" ||
      previous ===
        "unavailable"
    )
  ) {
    return "progressed";
  }

  if (
    current ===
      "stable" &&
    (
      previous ===
        "observing" ||
      previous ===
        "unavailable"
    )
  ) {
    return "stabilized";
  }

  return "mixed";
}

function isRecoveryTransition(
  previous:
    RecommendationEvolutionIntelligenceState,
  current:
    RecommendationEvolutionIntelligenceState,
): boolean {
  const previousWasAtRisk =
    previous ===
      "stalled" ||
    previous ===
      "fragmented";

  const currentIsRecovered =
    current ===
      "stable" ||
    current ===
      "progressing" ||
    current ===
      "advancing";

  return (
    previousWasAtRisk &&
    currentIsRecovered
  );
}

function isRegressionTransition(
  previous:
    RecommendationEvolutionIntelligenceState,
  current:
    RecommendationEvolutionIntelligenceState,
): boolean {
  const previousWasConstructive =
    previous ===
      "stable" ||
    previous ===
      "progressing" ||
    previous ===
      "advancing";

  const currentIsWeaker =
    current ===
      "observing" ||
    current ===
      "unavailable";

  return (
    previousWasConstructive &&
    currentIsWeaker
  );
}

/* ------------------------------------------------------------------ */
/* Score Changes                                                      */
/* ------------------------------------------------------------------ */

function calculateMemoryScoreChanges(
  previous:
    RecommendationEvolutionMemoryEntry | null,
  current:
    RecommendationEvolutionMemoryEntry,
): RecommendationEvolutionMemoryScoreChanges {
  if (
    previous ===
    null
  ) {
    return {
      stability:
        0,

      progress:
        0,

      repetitionRisk:
        0,

      redirectionRisk:
        0,

      completionMomentum:
        0,
    };
  }

  return {
    stability:
      normalizeScoreDelta(
        current.scores.stability -
        previous.scores.stability,
      ),

    progress:
      normalizeScoreDelta(
        current.scores.progress -
        previous.scores.progress,
      ),

    repetitionRisk:
      normalizeScoreDelta(
        current.scores.repetitionRisk -
        previous.scores.repetitionRisk,
      ),

    redirectionRisk:
      normalizeScoreDelta(
        current.scores.redirectionRisk -
        previous.scores.redirectionRisk,
      ),

    completionMomentum:
      normalizeScoreDelta(
        current.scores.completionMomentum -
        previous.scores.completionMomentum,
      ),
  };
}

/**
 * 부동소수점 연산 오차를 줄이기 위해 소수점 여섯 자리까지
 * 정규화합니다.
 */
function normalizeScoreDelta(
  value:
    number,
): number {
  const normalized =
    Number(
      value.toFixed(
        6,
      ),
    );

  return Object.is(
    normalized,
    -0,
  )
    ? 0
    : normalized;
}

function hasMeaningfulScoreChange(
  changes:
    RecommendationEvolutionMemoryScoreChanges,
): boolean {
  return (
    Math.abs(
      changes.stability,
    ) >=
      SCORE_CHANGE_THRESHOLD ||
    Math.abs(
      changes.progress,
    ) >=
      SCORE_CHANGE_THRESHOLD ||
    Math.abs(
      changes.repetitionRisk,
    ) >=
      SCORE_CHANGE_THRESHOLD ||
    Math.abs(
      changes.redirectionRisk,
    ) >=
      SCORE_CHANGE_THRESHOLD ||
    Math.abs(
      changes.completionMomentum,
    ) >=
      SCORE_CHANGE_THRESHOLD
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Changes                                           */
/* ------------------------------------------------------------------ */

function calculateMemoryDecisionChanges(
  previous:
    RecommendationEvolutionMemoryEntry | null,
  current:
    RecommendationEvolutionMemoryEntry,
): RecommendationEvolutionMemoryDecisionChanges {
  if (
    previous ===
    null
  ) {
    return {
      newlyEnabled: [
        ...current.enabledRuntimeDecisionTypes,
      ],

      newlyDisabled:
        [],

      unchangedEnabled:
        [],
    };
  }

  const previousTypes =
    new Set<
      RecommendationEvolutionRuntimeDecisionType
    >(
      previous.enabledRuntimeDecisionTypes,
    );

  const currentTypes =
    new Set<
      RecommendationEvolutionRuntimeDecisionType
    >(
      current.enabledRuntimeDecisionTypes,
    );

  const newlyEnabled =
    current.enabledRuntimeDecisionTypes.filter(
      (
        type,
      ) =>
        !previousTypes.has(
          type,
        ),
    );

  const newlyDisabled =
    previous.enabledRuntimeDecisionTypes.filter(
      (
        type,
      ) =>
        !currentTypes.has(
          type,
        ),
    );

  const unchangedEnabled =
    current.enabledRuntimeDecisionTypes.filter(
      (
        type,
      ) =>
        previousTypes.has(
          type,
        ),
    );

  return {
    newlyEnabled,
    newlyDisabled,
    unchangedEnabled,
  };
}

/* ------------------------------------------------------------------ */
/* Comparison Signals                                                 */
/* ------------------------------------------------------------------ */

type CreateMemoryComparisonSignalsParams = {
  previous:
    RecommendationEvolutionMemoryEntry | null;

  current:
    RecommendationEvolutionMemoryEntry;

  scoreChanges:
    RecommendationEvolutionMemoryScoreChanges;

  stateChanged:
    boolean;

  strategyChanged:
    boolean;

  confidenceChanged:
    boolean;
};

function createMemoryComparisonSignals(
  params:
    CreateMemoryComparisonSignalsParams,
): RecommendationEvolutionMemoryComparisonSignal[] {
  const {
    previous,
    current,
    scoreChanges,
    stateChanged,
    strategyChanged,
    confidenceChanged,
  } = params;

  if (
    previous ===
    null
  ) {
    return [];
  }

  const signals:
    RecommendationEvolutionMemoryComparisonSignal[] =
      [];

  signals.push({
    type:
      stateChanged
        ? "state-changed"
        : "state-unchanged",

    description:
      stateChanged
        ? `Intelligence state changed from ${previous.state} to ${current.state}.`
        : `Intelligence state remained ${current.state}.`,

    value:
      stateChanged,
  });

  signals.push({
    type:
      strategyChanged
        ? "strategy-changed"
        : "strategy-unchanged",

    description:
      strategyChanged
        ? `Recommendation strategy changed from ${previous.strategyType} to ${current.strategyType}.`
        : `Recommendation strategy remained ${current.strategyType}.`,

    value:
      strategyChanged,
  });

  appendScoreChangeSignal({
    signals,
    value:
      scoreChanges.stability,
    increasedType:
      "stability-increased",
    decreasedType:
      "stability-decreased",
    label:
      "Stability",
  });

  appendScoreChangeSignal({
    signals,
    value:
      scoreChanges.progress,
    increasedType:
      "progress-increased",
    decreasedType:
      "progress-decreased",
    label:
      "Progress",
  });

  appendScoreChangeSignal({
    signals,
    value:
      scoreChanges.repetitionRisk,
    increasedType:
      "repetition-risk-increased",
    decreasedType:
      "repetition-risk-decreased",
    label:
      "Repetition risk",
  });

  appendScoreChangeSignal({
    signals,
    value:
      scoreChanges.redirectionRisk,
    increasedType:
      "redirection-risk-increased",
    decreasedType:
      "redirection-risk-decreased",
    label:
      "Redirection risk",
  });

  appendScoreChangeSignal({
    signals,
    value:
      scoreChanges.completionMomentum,
    increasedType:
      "completion-momentum-increased",
    decreasedType:
      "completion-momentum-decreased",
    label:
      "Completion momentum",
  });

  if (
    confidenceChanged
  ) {
    const confidenceDirection =
      compareConfidence(
        previous.assessmentConfidence,
        current.assessmentConfidence,
      );

    if (
      confidenceDirection >
      0
    ) {
      signals.push({
        type:
          "confidence-increased",

        description:
          `Assessment confidence increased from ${previous.assessmentConfidence} to ${current.assessmentConfidence}.`,

        value:
          current.assessmentConfidence,
      });
    } else if (
      confidenceDirection <
      0
    ) {
      signals.push({
        type:
          "confidence-decreased",

        description:
          `Assessment confidence decreased from ${previous.assessmentConfidence} to ${current.assessmentConfidence}.`,

        value:
          current.assessmentConfidence,
      });
    }
  }

  const warningChange =
    current.warningCount -
    previous.warningCount;

  if (
    warningChange >
    0
  ) {
    signals.push({
      type:
        "new-warning-pressure",

      description:
        `Guidance warning count increased by ${warningChange}.`,

      value:
        warningChange,
    });
  } else if (
    warningChange <
    0
  ) {
    signals.push({
      type:
        "warning-pressure-reduced",

      description:
        `Guidance warning count decreased by ${Math.abs(
          warningChange,
        )}.`,

      value:
        warningChange,
    });
  }

  return signals;
}

type AppendScoreChangeSignalParams = {
  signals:
    RecommendationEvolutionMemoryComparisonSignal[];

  value:
    number;

  increasedType:
    RecommendationEvolutionMemoryComparisonSignal["type"];

  decreasedType:
    RecommendationEvolutionMemoryComparisonSignal["type"];

  label:
    string;
};

function appendScoreChangeSignal(
  params:
    AppendScoreChangeSignalParams,
): void {
  const {
    signals,
    value,
    increasedType,
    decreasedType,
    label,
  } = params;

  if (
    value >=
    SCORE_CHANGE_THRESHOLD
  ) {
    signals.push({
      type:
        increasedType,

      description:
        `${label} increased by ${formatScoreDelta(
          value,
        )}.`,

      value,
    });

    return;
  }

  if (
    value <=
    -SCORE_CHANGE_THRESHOLD
  ) {
    signals.push({
      type:
        decreasedType,

      description:
        `${label} decreased by ${formatScoreDelta(
          Math.abs(
            value,
          ),
        )}.`,

      value,
    });
  }
}

function formatScoreDelta(
  value:
    number,
): string {
  return value.toFixed(
    3,
  );
}

/* ------------------------------------------------------------------ */
/* Confidence Comparison                                              */
/* ------------------------------------------------------------------ */

/**
 * 반환값:
 *
 *  1: 현재 Confidence가 높아짐
 *  0: 동일하거나 비교 불가능
 * -1: 현재 Confidence가 낮아짐
 */
function compareConfidence(
  previous:
    RecommendationEvolutionIntelligenceSignalConfidence,
  current:
    RecommendationEvolutionIntelligenceSignalConfidence,
): number {
  const previousRank =
    getConfidenceRank(
      previous,
    );

  const currentRank =
    getConfidenceRank(
      current,
    );

  if (
    previousRank ===
      null ||
    currentRank ===
      null
  ) {
    return 0;
  }

  if (
    currentRank >
    previousRank
  ) {
    return 1;
  }

  if (
    currentRank <
    previousRank
  ) {
    return -1;
  }

  return 0;
}

function getConfidenceRank(
  confidence:
    RecommendationEvolutionIntelligenceSignalConfidence,
): number | null {
  switch (
    confidence
  ) {
    case "low":
      return 1;

    case "medium":
      return 2;

    case "high":
      return 3;

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Public Validation API                                              */
/* ------------------------------------------------------------------ */

/**
 * 생성된 Recommendation Evolution Memory Comparison의
 * 구조와 교차 필드 일관성을 검증합니다.
 */
export function validateRecommendationEvolutionMemoryComparison(
  params:
    ValidateRecommendationEvolutionMemoryComparisonParams,
): void {
  const {
    comparison,
  } = params;

  validateRequiredIdentifier(
    comparison.id,
    "Recommendation Evolution Memory Comparison id",
  );

  if (
    !isRecommendationEvolutionMemoryComparisonType(
      comparison.type,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory Comparison type is invalid.",
    );
  }

  validateTimestamp(
    comparison.comparedAt,
    "comparedAt",
  );

  validateRecommendationEvolutionMemoryEntry({
    entry:
      comparison.current,
  });

  if (
    comparison.previous !==
    null
  ) {
    validateRecommendationEvolutionMemoryEntry({
      entry:
        comparison.previous,
    });

    if (
      comparison.previous.historyId !==
      comparison.current.historyId
    ) {
      throw new Error(
        "Recommendation Evolution Memory Comparison entries must have the same historyId.",
      );
    }

    validateTimestampOrder(
      comparison.previous.intelligenceAnalyzedAt,
      comparison.current.intelligenceAnalyzedAt,
      "previous.intelligenceAnalyzedAt",
      "current.intelligenceAnalyzedAt",
      false,
    );
  }

  validateComparisonInitialConsistency(
    comparison,
  );

  validateComparisonFlags(
    comparison,
  );

  validateScoreChanges(
    comparison.scoreChanges,
  );

  validateDecisionChanges(
    comparison.decisionChanges,
  );

  validateComparisonSignals(
    comparison.signals,
  );

  validateTimestampOrder(
    comparison.current.recordedAt,
    comparison.comparedAt,
    "current.recordedAt",
    "comparedAt",
    true,
  );
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

type ValidateComparisonInputConsistencyParams = {
  previous:
    RecommendationEvolutionMemoryEntry | null;

  current:
    RecommendationEvolutionMemoryEntry;

  comparedAt:
    string;
};

function validateComparisonInputConsistency(
  params:
    ValidateComparisonInputConsistencyParams,
): void {
  const {
    previous,
    current,
    comparedAt,
  } = params;

  validateTimestamp(
    comparedAt,
    "comparedAt",
  );

  if (
    previous !==
    null
  ) {
    if (
      previous.historyId !==
      current.historyId
    ) {
      throw new Error(
        "Previous and current Recommendation Evolution Memory Entries must have the same historyId.",
      );
    }

    if (
      previous.id ===
      current.id
    ) {
      throw new Error(
        "Previous and current Recommendation Evolution Memory Entries must have different ids.",
      );
    }

    validateTimestampOrder(
      previous.intelligenceAnalyzedAt,
      current.intelligenceAnalyzedAt,
      "previous.intelligenceAnalyzedAt",
      "current.intelligenceAnalyzedAt",
      false,
    );
  }

  validateTimestampOrder(
    current.recordedAt,
    comparedAt,
    "current.recordedAt",
    "comparedAt",
    true,
  );
}

/* ------------------------------------------------------------------ */
/* Comparison Consistency                                             */
/* ------------------------------------------------------------------ */

function validateComparisonInitialConsistency(
  comparison:
    RecommendationEvolutionMemoryComparison,
): void {
  if (
    comparison.type ===
    "initial"
  ) {
    if (
      comparison.previous !==
      null
    ) {
      throw new Error(
        "Initial Recommendation Evolution Memory Comparison must not have a previous Entry.",
      );
    }

    if (
      comparison.stateChanged ||
      comparison.strategyChanged ||
      comparison.confidenceChanged ||
      comparison.primarySignalChanged
    ) {
      throw new Error(
        "Initial Recommendation Evolution Memory Comparison change flags must be false.",
      );
    }

    return;
  }

  if (
    comparison.previous ===
    null
  ) {
    throw new Error(
      "Non-initial Recommendation Evolution Memory Comparison must have a previous Entry.",
    );
  }
}

function validateComparisonFlags(
  comparison:
    RecommendationEvolutionMemoryComparison,
): void {
  if (
    comparison.previous ===
    null
  ) {
    return;
  }

  const expectedStateChanged =
    comparison.previous.state !==
    comparison.current.state;

  const expectedStrategyChanged =
    comparison.previous.strategyType !==
    comparison.current.strategyType;

  const expectedConfidenceChanged =
    comparison.previous.assessmentConfidence !==
    comparison.current.assessmentConfidence;

  const expectedPrimarySignalChanged =
    comparison.previous.primarySignalType !==
    comparison.current.primarySignalType;

  if (
    comparison.stateChanged !==
    expectedStateChanged
  ) {
    throw new Error(
      "Recommendation Evolution Memory Comparison stateChanged is inconsistent.",
    );
  }

  if (
    comparison.strategyChanged !==
    expectedStrategyChanged
  ) {
    throw new Error(
      "Recommendation Evolution Memory Comparison strategyChanged is inconsistent.",
    );
  }

  if (
    comparison.confidenceChanged !==
    expectedConfidenceChanged
  ) {
    throw new Error(
      "Recommendation Evolution Memory Comparison confidenceChanged is inconsistent.",
    );
  }

  if (
    comparison.primarySignalChanged !==
    expectedPrimarySignalChanged
  ) {
    throw new Error(
      "Recommendation Evolution Memory Comparison primarySignalChanged is inconsistent.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Score Change Validation                                            */
/* ------------------------------------------------------------------ */

function validateScoreChanges(
  changes:
    RecommendationEvolutionMemoryScoreChanges,
): void {
  validateFiniteNumber(
    changes.stability,
    "scoreChanges.stability",
  );

  validateFiniteNumber(
    changes.progress,
    "scoreChanges.progress",
  );

  validateFiniteNumber(
    changes.repetitionRisk,
    "scoreChanges.repetitionRisk",
  );

  validateFiniteNumber(
    changes.redirectionRisk,
    "scoreChanges.redirectionRisk",
  );

  validateFiniteNumber(
    changes.completionMomentum,
    "scoreChanges.completionMomentum",
  );
}

/* ------------------------------------------------------------------ */
/* Decision Change Validation                                         */
/* ------------------------------------------------------------------ */

function validateDecisionChanges(
  changes:
    RecommendationEvolutionMemoryDecisionChanges,
): void {
  validateUniqueStringArray(
    changes.newlyEnabled,
    "decisionChanges.newlyEnabled",
  );

  validateUniqueStringArray(
    changes.newlyDisabled,
    "decisionChanges.newlyDisabled",
  );

  validateUniqueStringArray(
    changes.unchangedEnabled,
    "decisionChanges.unchangedEnabled",
  );

  validateNoArrayOverlap(
    changes.newlyEnabled,
    changes.newlyDisabled,
    "newlyEnabled",
    "newlyDisabled",
  );

  validateNoArrayOverlap(
    changes.newlyEnabled,
    changes.unchangedEnabled,
    "newlyEnabled",
    "unchangedEnabled",
  );

  validateNoArrayOverlap(
    changes.newlyDisabled,
    changes.unchangedEnabled,
    "newlyDisabled",
    "unchangedEnabled",
  );
}

function validateNoArrayOverlap(
  first:
    readonly string[],
  second:
    readonly string[],
  firstName:
    string,
  secondName:
    string,
): void {
  const secondValues =
    new Set(
      second,
    );

  const overlap =
    first.find(
      (
        value,
      ) =>
        secondValues.has(
          value,
        ),
    );

  if (
    overlap !==
    undefined
  ) {
    throw new Error(
      `${firstName} and ${secondName} must not overlap: ${overlap}.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Signal Validation                                                  */
/* ------------------------------------------------------------------ */

function validateComparisonSignals(
  signals:
    RecommendationEvolutionMemoryComparisonSignal[],
): void {
  if (
    !Array.isArray(
      signals,
    )
  ) {
    throw new Error(
      "Recommendation Evolution Memory Comparison signals must be an array.",
    );
  }

  const observedTypes =
    new Set<string>();

  signals.forEach(
    (
      signal,
      index,
    ) => {
      if (
        typeof signal !==
          "object" ||
        signal ===
          null ||
        Array.isArray(
          signal,
        )
      ) {
        throw new Error(
          `Comparison signal at index ${index} must be an object.`,
        );
      }

      if (
        !isRecommendationEvolutionMemoryComparisonSignalType(
          signal.type,
        )
      ) {
        throw new Error(
          `Comparison signal at index ${index} has an invalid type.`,
        );
      }

      validateRequiredString(
        signal.description,
        `signals[${index}].description`,
      );

      validateComparisonSignalValue(
        signal.value,
        `signals[${index}].value`,
      );

      if (
        observedTypes.has(
          signal.type,
        )
      ) {
        throw new Error(
          `Recommendation Evolution Memory Comparison signals must not contain duplicate type: ${signal.type}.`,
        );
      }

      observedTypes.add(
        signal.type,
      );
    },
  );
}

function validateComparisonSignalValue(
  value:
    unknown,
  fieldName:
    string,
): void {
  if (
    value ===
    null
  ) {
    return;
  }

  if (
    typeof value ===
    "string"
  ) {
    return;
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return;
  }

  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return;
  }

  throw new Error(
    `${fieldName} must be a finite number, string, boolean, or null.`,
  );
}

/* ------------------------------------------------------------------ */
/* Entry Cloning                                                      */
/* ------------------------------------------------------------------ */

function cloneRecommendationEvolutionMemoryEntry(
  entry:
    RecommendationEvolutionMemoryEntry,
): RecommendationEvolutionMemoryEntry {
  return {
    ...entry,

    scores: {
      ...entry.scores,
    },

    signalTypes: [
      ...entry.signalTypes,
    ],

    decisions: {
      ...entry.decisions,
    },

    enabledRuntimeDecisionTypes: [
      ...entry.enabledRuntimeDecisionTypes,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Generic Validation Helpers                                         */
/* ------------------------------------------------------------------ */

function validateRequiredIdentifier(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  validateRequiredString(
    value,
    fieldName,
  );

  if (
    value.length >
    256
  ) {
    throw new Error(
      `${fieldName} must not exceed 256 characters.`,
    );
  }
}

function validateRequiredString(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  if (
    typeof value !==
    "string"
  ) {
    throw new Error(
      `${fieldName} must be a string.`,
    );
  }

  if (
    value.trim().length ===
    0
  ) {
    throw new Error(
      `${fieldName} must not be empty.`,
    );
  }
}

function validateFiniteNumber(
  value:
    unknown,
  fieldName:
    string,
): asserts value is number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    throw new Error(
      `${fieldName} must be a finite number.`,
    );
  }
}

function validateUniqueStringArray(
  values:
    readonly unknown[],
  fieldName:
    string,
): void {
  if (
    !Array.isArray(
      values,
    )
  ) {
    throw new Error(
      `${fieldName} must be an array.`,
    );
  }

  const observedValues =
    new Set<string>();

  values.forEach(
    (
      value,
      index,
    ) => {
      validateRequiredString(
        value,
        `${fieldName}[${index}]`,
      );

      if (
        observedValues.has(
          value,
        )
      ) {
        throw new Error(
          `${fieldName} must not contain duplicate value: ${value}.`,
        );
      }

      observedValues.add(
        value,
      );
    },
  );
}

/* ------------------------------------------------------------------ */
/* Timestamp Validation                                               */
/* ------------------------------------------------------------------ */

function validateTimestamp(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  validateRequiredString(
    value,
    fieldName,
  );

  const parsed =
    Date.parse(
      value,
    );

  if (
    Number.isNaN(
      parsed,
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid timestamp.`,
    );
  }
}

/**
 * allowEqual=true이면 동일 시각을 허용합니다.
 */
function validateTimestampOrder(
  earlier:
    string,
  later:
    string,
  earlierFieldName:
    string,
  laterFieldName:
    string,
  allowEqual:
    boolean,
): void {
  const earlierTimestamp =
    Date.parse(
      earlier,
    );

  const laterTimestamp =
    Date.parse(
      later,
    );

  const invalid =
    allowEqual
      ? earlierTimestamp >
        laterTimestamp
      : earlierTimestamp >=
        laterTimestamp;

  if (
    invalid
  ) {
    const relation =
      allowEqual
        ? "must not be later than"
        : "must be earlier than";

    throw new Error(
      `${earlierFieldName} ${relation} ${laterFieldName}.`,
    );
  }
}