import {
    createEmptyRecommendationRuntimeAdjustment
} from "./recommendationAdaptiveLearningTypes";

import {
    validateRecommendationAdaptationRules,
} from "./createRecommendationAdaptationRules";

import type {
    CreateRecommendationRuntimeAdjustmentsParams,
    RecommendationAdaptationRule,
    RecommendationAdaptationRuleType,
    RecommendationAdaptiveLearningMemorySignalType,
    RecommendationAdaptiveLearningRuntimeDecisionType,
    RecommendationAdaptiveLearningStrategyType,
    RecommendationRuntimeAdjustment,
    ValidateRecommendationRuntimeAdjustmentParams,
} from "./recommendationAdaptiveLearningTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * 개별 Adjustment 필드가 가질 수 있는 최종 범위입니다.
 *
 * Adaptation Rule 자체는 더 작은 범위를 사용하지만,
 * 여러 Rule을 누적한 결과는 -1~1 범위에서 제한합니다.
 */
const MINIMUM_RUNTIME_ADJUSTMENT =
  -1;

const MAXIMUM_RUNTIME_ADJUSTMENT =
  1;

/**
 * 부동소수점 비교 허용 오차입니다.
 */
const NUMBER_EQUALITY_TOLERANCE =
  1e-10;

/* ------------------------------------------------------------------ */
/* Internal Types                                                     */
/* ------------------------------------------------------------------ */

type MutableRuntimeAdjustment = {
  strategyPreferenceAdjustments:
    Partial<
      Record<
        RecommendationAdaptiveLearningStrategyType,
        number
      >
    >;

  decisionPreferenceAdjustments:
    Partial<
      Record<
        RecommendationAdaptiveLearningRuntimeDecisionType,
        number
      >
    >;

  signalConfidenceAdjustments:
    Partial<
      Record<
        RecommendationAdaptiveLearningMemorySignalType,
        number
      >
    >;

  evidenceRequirementAdjustment:
    number;

  newRecommendationThresholdAdjustment:
    number;

  redirectionThresholdAdjustment:
    number;

  stabilizationPreferenceAdjustment:
    number;

  recoveryPreferenceAdjustment:
    number;
};

export type RecommendationRuntimeAdjustmentContribution = {
  ruleId:
    string;

  ruleType:
    RecommendationAdaptationRuleType;

  applied:
    boolean;

  target:
    string;

  value:
    number;

  reason:
    string;
};

export type RecommendationRuntimeAdjustmentDetailedResult = {
  adjustment:
    RecommendationRuntimeAdjustment;

  contributions:
    RecommendationRuntimeAdjustmentContribution[];

  appliedRuleIds:
    string[];

  ignoredRuleIds:
    string[];
};

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * active Adaptation Rule을 하나의 Runtime Adjustment로 집계합니다.
 *
 * 다음 상태의 Rule은 실제 조정값에 반영하지 않습니다.
 *
 * - proposed
 * - conflicted
 * - suppressed
 */
export function createRecommendationRuntimeAdjustments(
  params:
    CreateRecommendationRuntimeAdjustmentsParams,
): RecommendationRuntimeAdjustment {
  return createRecommendationRuntimeAdjustmentsDetailed(
    params,
  ).adjustment;
}

/**
 * Runtime Adjustment와 함께 각 Rule의 적용 여부 및 기여값을
 * 반환합니다.
 *
 * Analysis·Presentation·테스트에서 어떤 Rule이 최종 Adjustment에
 * 반영됐는지 설명할 때 사용할 수 있습니다.
 */
export function createRecommendationRuntimeAdjustmentsDetailed(
  params:
    CreateRecommendationRuntimeAdjustmentsParams,
): RecommendationRuntimeAdjustmentDetailedResult {
  validateCreateRecommendationRuntimeAdjustmentsParams(
    params,
  );

  const adjustment =
    createMutableRuntimeAdjustment();

  const contributions:
    RecommendationRuntimeAdjustmentContribution[] = [];

  const appliedRuleIds:
    string[] = [];

  const ignoredRuleIds:
    string[] = [];

  params.rules.forEach(
    (
      rule,
    ) => {
      if (
        rule.status !==
        "active"
      ) {
        ignoredRuleIds.push(
          rule.id,
        );

        contributions.push({
          ruleId:
            rule.id,

          ruleType:
            rule.type,

          applied:
            false,

          target:
            resolveRuleTargetLabel(
              rule,
            ),

          value:
            0,

          reason:
            `Rule status ${rule.status} is not applied to Runtime adjustments.`,
        });

        return;
      }

      applyRecommendationAdaptationRule({
        adjustment,
        rule,
      });

      appliedRuleIds.push(
        rule.id,
      );

      contributions.push({
        ruleId:
          rule.id,

        ruleType:
          rule.type,

        applied:
          true,

        target:
          resolveRuleTargetLabel(
            rule,
          ),

        value:
          rule.adjustment,

        reason:
          createRuleContributionReason(
            rule,
          ),
      });
    },
  );

  const finalizedAdjustment =
    finalizeRecommendationRuntimeAdjustment(
      adjustment,
    );

  validateRecommendationRuntimeAdjustment({
    adjustment:
      finalizedAdjustment,
  });

  return {
    adjustment:
      cloneRecommendationRuntimeAdjustment(
        finalizedAdjustment,
      ),

    contributions:
      contributions.map(
        cloneRecommendationRuntimeAdjustmentContribution,
      ),

    appliedRuleIds: [
      ...appliedRuleIds,
    ],

    ignoredRuleIds: [
      ...ignoredRuleIds,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Rule Application                                                   */
/* ------------------------------------------------------------------ */

type ApplyRecommendationAdaptationRuleParams = {
  adjustment:
    MutableRuntimeAdjustment;

  rule:
    RecommendationAdaptationRule;
};

function applyRecommendationAdaptationRule(
  params:
    ApplyRecommendationAdaptationRuleParams,
): void {
  const {
    adjustment,
    rule,
  } = params;

  switch (
    rule.type
  ) {
    case "increase-strategy-preference":
    case "decrease-strategy-preference":
      applyStrategyPreferenceRule(
        adjustment,
        rule,
      );
      return;

    case "increase-decision-preference":
    case "decrease-decision-preference":
      applyDecisionPreferenceRule(
        adjustment,
        rule,
      );
      return;

    case "lower-signal-confidence":
    case "raise-signal-confidence":
      applySignalConfidenceRule(
        adjustment,
        rule,
      );
      return;

    case "require-more-evidence":
    case "reduce-evidence-requirement":
      adjustment.evidenceRequirementAdjustment =
        addAdjustment(
          adjustment.evidenceRequirementAdjustment,
          rule.adjustment,
        );
      return;

    case "delay-new-recommendation":
      adjustment.newRecommendationThresholdAdjustment =
        addAdjustment(
          adjustment.newRecommendationThresholdAdjustment,
          normalizePositiveRuleValue(
            rule,
          ),
        );
      return;

    case "allow-earlier-recommendation":
      adjustment.newRecommendationThresholdAdjustment =
        addAdjustment(
          adjustment.newRecommendationThresholdAdjustment,
          normalizeNegativeRuleValue(
            rule,
          ),
        );
      return;

    case "reduce-redirection":
      adjustment.redirectionThresholdAdjustment =
        addAdjustment(
          adjustment.redirectionThresholdAdjustment,
          normalizePositiveRuleValue(
            rule,
          ),
        );
      return;

    case "allow-redirection":
      adjustment.redirectionThresholdAdjustment =
        addAdjustment(
          adjustment.redirectionThresholdAdjustment,
          normalizeNegativeRuleValue(
            rule,
          ),
        );
      return;

    case "prefer-stabilization":
      adjustment.stabilizationPreferenceAdjustment =
        addAdjustment(
          adjustment.stabilizationPreferenceAdjustment,
          normalizePositiveRuleValue(
            rule,
          ),
        );
      return;

    case "prefer-recovery":
      adjustment.recoveryPreferenceAdjustment =
        addAdjustment(
          adjustment.recoveryPreferenceAdjustment,
          normalizePositiveRuleValue(
            rule,
          ),
        );
      return;
  }
}

/* ------------------------------------------------------------------ */
/* Strategy Preference                                                */
/* ------------------------------------------------------------------ */

function applyStrategyPreferenceRule(
  adjustment:
    MutableRuntimeAdjustment,
  rule:
    RecommendationAdaptationRule,
): void {
  const strategyType =
    rule.targetStrategyType;

  if (
    strategyType ===
    null
  ) {
    throw new Error(
      `Active Recommendation Adaptation Rule ${rule.id} requires targetStrategyType.`,
    );
  }

  const currentValue =
    adjustment.strategyPreferenceAdjustments[
      strategyType
    ] ??
    0;

  adjustment.strategyPreferenceAdjustments[
    strategyType
  ] =
    addAdjustment(
      currentValue,
      rule.adjustment,
    );
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Preference                                        */
/* ------------------------------------------------------------------ */

function applyDecisionPreferenceRule(
  adjustment:
    MutableRuntimeAdjustment,
  rule:
    RecommendationAdaptationRule,
): void {
  const decisionType =
    rule.targetDecisionType;

  if (
    decisionType ===
    null
  ) {
    throw new Error(
      `Active Recommendation Adaptation Rule ${rule.id} requires targetDecisionType.`,
    );
  }

  const currentValue =
    adjustment.decisionPreferenceAdjustments[
      decisionType
    ] ??
    0;

  adjustment.decisionPreferenceAdjustments[
    decisionType
  ] =
    addAdjustment(
      currentValue,
      rule.adjustment,
    );
}

/* ------------------------------------------------------------------ */
/* Signal Confidence                                                  */
/* ------------------------------------------------------------------ */

function applySignalConfidenceRule(
  adjustment:
    MutableRuntimeAdjustment,
  rule:
    RecommendationAdaptationRule,
): void {
  const signalType =
    rule.targetSignalType;

  if (
    signalType ===
    null
  ) {
    throw new Error(
      `Active Recommendation Adaptation Rule ${rule.id} requires targetSignalType.`,
    );
  }

  const currentValue =
    adjustment.signalConfidenceAdjustments[
      signalType
    ] ??
    0;

  adjustment.signalConfidenceAdjustments[
    signalType
  ] =
    addAdjustment(
      currentValue,
      rule.adjustment,
    );
}

/* ------------------------------------------------------------------ */
/* Direction Normalization                                            */
/* ------------------------------------------------------------------ */

/**
 * 의미상 증가해야 하는 Rule이 음수 Adjustment를 갖고 있더라도
 * Runtime 결과에서는 양수 방향으로 정규화합니다.
 *
 * Rule 생성기가 정상적으로 동작하면 보통 이미 양수입니다.
 * 이 처리는 외부 입력이나 오래된 저장 데이터에 대한 방어입니다.
 */
function normalizePositiveRuleValue(
  rule:
    RecommendationAdaptationRule,
): number {
  return Math.abs(
    rule.adjustment,
  );
}

/**
 * 의미상 완화 또는 허용 방향인 Rule은 음수로 정규화합니다.
 */
function normalizeNegativeRuleValue(
  rule:
    RecommendationAdaptationRule,
): number {
  return -Math.abs(
    rule.adjustment,
  );
}

/* ------------------------------------------------------------------ */
/* Mutable Adjustment Factory                                         */
/* ------------------------------------------------------------------ */

function createMutableRuntimeAdjustment():
  MutableRuntimeAdjustment {
  const empty =
    createEmptyRecommendationRuntimeAdjustment();

  return {
    strategyPreferenceAdjustments: {
      ...empty.strategyPreferenceAdjustments,
    },

    decisionPreferenceAdjustments: {
      ...empty.decisionPreferenceAdjustments,
    },

    signalConfidenceAdjustments: {
      ...empty.signalConfidenceAdjustments,
    },

    evidenceRequirementAdjustment:
      empty.evidenceRequirementAdjustment,

    newRecommendationThresholdAdjustment:
      empty.newRecommendationThresholdAdjustment,

    redirectionThresholdAdjustment:
      empty.redirectionThresholdAdjustment,

    stabilizationPreferenceAdjustment:
      empty.stabilizationPreferenceAdjustment,

    recoveryPreferenceAdjustment:
      empty.recoveryPreferenceAdjustment,
  };
}

/* ------------------------------------------------------------------ */
/* Finalization                                                       */
/* ------------------------------------------------------------------ */

/**
 * 누적된 Adjustment를 범위 제한·반올림·0값 제거한 최종 계약으로
 * 변환합니다.
 */
export function finalizeRecommendationRuntimeAdjustment(
  adjustment:
    RecommendationRuntimeAdjustment,
): RecommendationRuntimeAdjustment {
  validateRuntimeAdjustmentShape(
    adjustment,
  );

  const finalized:
    RecommendationRuntimeAdjustment = {
      strategyPreferenceAdjustments:
        finalizeAdjustmentRecord(
          adjustment.strategyPreferenceAdjustments,
        ),

      decisionPreferenceAdjustments:
        finalizeAdjustmentRecord(
          adjustment.decisionPreferenceAdjustments,
        ),

      signalConfidenceAdjustments:
        finalizeAdjustmentRecord(
          adjustment.signalConfidenceAdjustments,
        ),

      evidenceRequirementAdjustment:
        normalizeAdjustment(
          adjustment.evidenceRequirementAdjustment,
        ),

      newRecommendationThresholdAdjustment:
        normalizeAdjustment(
          adjustment.newRecommendationThresholdAdjustment,
        ),

      redirectionThresholdAdjustment:
        normalizeAdjustment(
          adjustment.redirectionThresholdAdjustment,
        ),

      stabilizationPreferenceAdjustment:
        normalizeAdjustment(
          adjustment.stabilizationPreferenceAdjustment,
        ),

      recoveryPreferenceAdjustment:
        normalizeAdjustment(
          adjustment.recoveryPreferenceAdjustment,
        ),
    };

  validateRecommendationRuntimeAdjustment({
    adjustment:
      finalized,
  });

  return finalized;
}

function finalizeAdjustmentRecord<
  TKey extends string,
>(
  record:
    Partial<
      Record<
        TKey,
        number
      >
    >,
): Partial<
  Record<
    TKey,
    number
  >
> {
  const finalized:
    Partial<
      Record<
        TKey,
        number
      >
    > = {};

  Object.keys(
    record,
  ).forEach(
    (
      rawKey,
    ) => {
      const key =
        rawKey as TKey;

      const value =
        record[
          key
        ];

      if (
        value ===
        undefined
      ) {
        return;
      }

      const normalized =
        normalizeAdjustment(
          value,
        );

      if (
        areNumbersApproximatelyEqual(
          normalized,
          0,
        )
      ) {
        return;
      }

      finalized[
        key
      ] =
        normalized;
    },
  );

  return finalized;
}

/* ------------------------------------------------------------------ */
/* Public Validation                                                  */
/* ------------------------------------------------------------------ */

export function validateRecommendationRuntimeAdjustment(
  params:
    ValidateRecommendationRuntimeAdjustmentParams,
): void {
  const {
    adjustment,
  } = params;

  validateRuntimeAdjustmentShape(
    adjustment,
  );

  validateAdjustmentRecord(
    adjustment.strategyPreferenceAdjustments,
    "strategyPreferenceAdjustments",
  );

  validateAdjustmentRecord(
    adjustment.decisionPreferenceAdjustments,
    "decisionPreferenceAdjustments",
  );

  validateAdjustmentRecord(
    adjustment.signalConfidenceAdjustments,
    "signalConfidenceAdjustments",
  );

  validateAdjustmentValue(
    adjustment.evidenceRequirementAdjustment,
    "evidenceRequirementAdjustment",
  );

  validateAdjustmentValue(
    adjustment.newRecommendationThresholdAdjustment,
    "newRecommendationThresholdAdjustment",
  );

  validateAdjustmentValue(
    adjustment.redirectionThresholdAdjustment,
    "redirectionThresholdAdjustment",
  );

  validateAdjustmentValue(
    adjustment.stabilizationPreferenceAdjustment,
    "stabilizationPreferenceAdjustment",
  );

  validateAdjustmentValue(
    adjustment.recoveryPreferenceAdjustment,
    "recoveryPreferenceAdjustment",
  );
}

/* ------------------------------------------------------------------ */
/* Shape Validation                                                   */
/* ------------------------------------------------------------------ */

function validateRuntimeAdjustmentShape(
  adjustment:
    RecommendationRuntimeAdjustment,
): void {
  if (
    typeof adjustment !==
      "object" ||
    adjustment ===
      null ||
    Array.isArray(
      adjustment,
    )
  ) {
    throw new Error(
      "Recommendation Runtime Adjustment must be an object.",
    );
  }

  validatePlainObject(
    adjustment.strategyPreferenceAdjustments,
    "strategyPreferenceAdjustments",
  );

  validatePlainObject(
    adjustment.decisionPreferenceAdjustments,
    "decisionPreferenceAdjustments",
  );

  validatePlainObject(
    adjustment.signalConfidenceAdjustments,
    "signalConfidenceAdjustments",
  );
}

function validatePlainObject(
  value:
    unknown,
  fieldName:
    string,
): asserts value is Record<
  string,
  unknown
> {
  if (
    typeof value !==
      "object" ||
    value ===
      null ||
    Array.isArray(
      value,
    )
  ) {
    throw new Error(
      `${fieldName} must be an object.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Record Validation                                                  */
/* ------------------------------------------------------------------ */

function validateAdjustmentRecord(
  record:
    Record<
      string,
      unknown
    >,
  fieldName:
    string,
): void {
  Object.entries(
    record,
  ).forEach(
    (
      [
        key,
        value,
      ],
    ) => {
      validateRequiredString(
        key,
        `${fieldName} key`,
      );

      validateAdjustmentValue(
        value,
        `${fieldName}.${key}`,
      );
    },
  );
}

function validateAdjustmentValue(
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

  if (
    value <
      MINIMUM_RUNTIME_ADJUSTMENT ||
    value >
      MAXIMUM_RUNTIME_ADJUSTMENT
  ) {
    throw new Error(
      `${fieldName} must be between ${MINIMUM_RUNTIME_ADJUSTMENT} and ${MAXIMUM_RUNTIME_ADJUSTMENT}.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateCreateRecommendationRuntimeAdjustmentsParams(
  params:
    CreateRecommendationRuntimeAdjustmentsParams,
): void {
  if (
    typeof params !==
      "object" ||
    params ===
      null ||
    Array.isArray(
      params,
    )
  ) {
    throw new Error(
      "Create Recommendation Runtime Adjustments params must be an object.",
    );
  }

  validateRecommendationAdaptationRules(
    params.rules,
  );
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationRuntimeAdjustment(
  adjustment:
    RecommendationRuntimeAdjustment,
): RecommendationRuntimeAdjustment {
  validateRecommendationRuntimeAdjustment({
    adjustment,
  });

  return {
    strategyPreferenceAdjustments: {
      ...adjustment.strategyPreferenceAdjustments,
    },

    decisionPreferenceAdjustments: {
      ...adjustment.decisionPreferenceAdjustments,
    },

    signalConfidenceAdjustments: {
      ...adjustment.signalConfidenceAdjustments,
    },

    evidenceRequirementAdjustment:
      adjustment.evidenceRequirementAdjustment,

    newRecommendationThresholdAdjustment:
      adjustment.newRecommendationThresholdAdjustment,

    redirectionThresholdAdjustment:
      adjustment.redirectionThresholdAdjustment,

    stabilizationPreferenceAdjustment:
      adjustment.stabilizationPreferenceAdjustment,

    recoveryPreferenceAdjustment:
      adjustment.recoveryPreferenceAdjustment,
  };
}

function cloneRecommendationRuntimeAdjustmentContribution(
  contribution:
    RecommendationRuntimeAdjustmentContribution,
): RecommendationRuntimeAdjustmentContribution {
  return {
    ...contribution,
  };
}

/* ------------------------------------------------------------------ */
/* Query Helpers                                                      */
/* ------------------------------------------------------------------ */

export function getRecommendationStrategyPreferenceAdjustment(
  params: {
    adjustment:
      RecommendationRuntimeAdjustment;

    strategyType:
      RecommendationAdaptiveLearningStrategyType;
  },
): number {
  validateRecommendationRuntimeAdjustment({
    adjustment:
      params.adjustment,
  });

  return (
    params.adjustment.strategyPreferenceAdjustments[
      params.strategyType
    ] ??
    0
  );
}

export function getRecommendationDecisionPreferenceAdjustment(
  params: {
    adjustment:
      RecommendationRuntimeAdjustment;

    decisionType:
      RecommendationAdaptiveLearningRuntimeDecisionType;
  },
): number {
  validateRecommendationRuntimeAdjustment({
    adjustment:
      params.adjustment,
  });

  return (
    params.adjustment.decisionPreferenceAdjustments[
      params.decisionType
    ] ??
    0
  );
}

export function getRecommendationSignalConfidenceAdjustment(
  params: {
    adjustment:
      RecommendationRuntimeAdjustment;

    signalType:
      RecommendationAdaptiveLearningMemorySignalType;
  },
): number {
  validateRecommendationRuntimeAdjustment({
    adjustment:
      params.adjustment,
  });

  return (
    params.adjustment.signalConfidenceAdjustments[
      params.signalType
    ] ??
    0
  );
}

/**
 * Adjustment에 실제 0이 아닌 변화가 하나라도 존재하는지
 * 확인합니다.
 */
export function hasRecommendationRuntimeAdjustments(
  adjustment:
    RecommendationRuntimeAdjustment,
): boolean {
  validateRecommendationRuntimeAdjustment({
    adjustment,
  });

  return (
    Object.keys(
      adjustment.strategyPreferenceAdjustments,
    ).length >
      0 ||
    Object.keys(
      adjustment.decisionPreferenceAdjustments,
    ).length >
      0 ||
    Object.keys(
      adjustment.signalConfidenceAdjustments,
    ).length >
      0 ||
    !areNumbersApproximatelyEqual(
      adjustment.evidenceRequirementAdjustment,
      0,
    ) ||
    !areNumbersApproximatelyEqual(
      adjustment.newRecommendationThresholdAdjustment,
      0,
    ) ||
    !areNumbersApproximatelyEqual(
      adjustment.redirectionThresholdAdjustment,
      0,
    ) ||
    !areNumbersApproximatelyEqual(
      adjustment.stabilizationPreferenceAdjustment,
      0,
    ) ||
    !areNumbersApproximatelyEqual(
      adjustment.recoveryPreferenceAdjustment,
      0,
    )
  );
}

/* ------------------------------------------------------------------ */
/* Adjustment Summary                                                 */
/* ------------------------------------------------------------------ */

export type RecommendationRuntimeAdjustmentSummary = {
  hasAdjustments:
    boolean;

  strategyAdjustmentCount:
    number;

  decisionAdjustmentCount:
    number;

  signalAdjustmentCount:
    number;

  globalAdjustmentCount:
    number;

  positiveAdjustmentCount:
    number;

  negativeAdjustmentCount:
    number;

  strongestAdjustment:
    number;

  strongestAdjustmentTarget:
    string | null;
};

export function summarizeRecommendationRuntimeAdjustment(
  adjustment:
    RecommendationRuntimeAdjustment,
): RecommendationRuntimeAdjustmentSummary {
  validateRecommendationRuntimeAdjustment({
    adjustment,
  });

  const entries =
    collectRecommendationRuntimeAdjustmentEntries(
      adjustment,
    );

  let positiveAdjustmentCount =
    0;

  let negativeAdjustmentCount =
    0;

  let strongestAdjustment =
    0;

  let strongestAdjustmentTarget:
    string | null =
      null;

  entries.forEach(
    (
      entry,
    ) => {
      if (
        entry.value >
        0
      ) {
        positiveAdjustmentCount +=
          1;
      }

      if (
        entry.value <
        0
      ) {
        negativeAdjustmentCount +=
          1;
      }

      if (
        Math.abs(
          entry.value,
        ) >
        Math.abs(
          strongestAdjustment,
        )
      ) {
        strongestAdjustment =
          entry.value;

        strongestAdjustmentTarget =
          entry.target;
      }
    },
  );

  const globalValues = [
    adjustment.evidenceRequirementAdjustment,
    adjustment.newRecommendationThresholdAdjustment,
    adjustment.redirectionThresholdAdjustment,
    adjustment.stabilizationPreferenceAdjustment,
    adjustment.recoveryPreferenceAdjustment,
  ];

  return {
    hasAdjustments:
      entries.length >
      0,

    strategyAdjustmentCount:
      Object.keys(
        adjustment.strategyPreferenceAdjustments,
      ).length,

    decisionAdjustmentCount:
      Object.keys(
        adjustment.decisionPreferenceAdjustments,
      ).length,

    signalAdjustmentCount:
      Object.keys(
        adjustment.signalConfidenceAdjustments,
      ).length,

    globalAdjustmentCount:
      globalValues.filter(
        (
          value,
        ) =>
          !areNumbersApproximatelyEqual(
            value,
            0,
          ),
      ).length,

    positiveAdjustmentCount,

    negativeAdjustmentCount,

    strongestAdjustment,

    strongestAdjustmentTarget,
  };
}

/* ------------------------------------------------------------------ */
/* Flattened Entries                                                  */
/* ------------------------------------------------------------------ */

type RecommendationRuntimeAdjustmentEntry = {
  target:
    string;

  value:
    number;
};

function collectRecommendationRuntimeAdjustmentEntries(
  adjustment:
    RecommendationRuntimeAdjustment,
): RecommendationRuntimeAdjustmentEntry[] {
  const entries:
    RecommendationRuntimeAdjustmentEntry[] = [];

  Object.entries(
    adjustment.strategyPreferenceAdjustments,
  ).forEach(
    (
      [
        strategyType,
        value,
      ],
    ) => {
      if (
        value ===
        undefined
      ) {
        return;
      }

      entries.push({
        target:
          `strategy:${strategyType}`,

        value,
      });
    },
  );

  Object.entries(
    adjustment.decisionPreferenceAdjustments,
  ).forEach(
    (
      [
        decisionType,
        value,
      ],
    ) => {
      if (
        value ===
        undefined
      ) {
        return;
      }

      entries.push({
        target:
          `decision:${decisionType}`,

        value,
      });
    },
  );

  Object.entries(
    adjustment.signalConfidenceAdjustments,
  ).forEach(
    (
      [
        signalType,
        value,
      ],
    ) => {
      if (
        value ===
        undefined
      ) {
        return;
      }

      entries.push({
        target:
          `signal:${signalType}`,

        value,
      });
    },
  );

  pushGlobalAdjustmentEntry(
    entries,
    "global:evidence-requirement",
    adjustment.evidenceRequirementAdjustment,
  );

  pushGlobalAdjustmentEntry(
    entries,
    "global:new-recommendation-threshold",
    adjustment.newRecommendationThresholdAdjustment,
  );

  pushGlobalAdjustmentEntry(
    entries,
    "global:redirection-threshold",
    adjustment.redirectionThresholdAdjustment,
  );

  pushGlobalAdjustmentEntry(
    entries,
    "global:stabilization-preference",
    adjustment.stabilizationPreferenceAdjustment,
  );

  pushGlobalAdjustmentEntry(
    entries,
    "global:recovery-preference",
    adjustment.recoveryPreferenceAdjustment,
  );

  return entries;
}

function pushGlobalAdjustmentEntry(
  entries:
    RecommendationRuntimeAdjustmentEntry[],
  target:
    string,
  value:
    number,
): void {
  if (
    areNumbersApproximatelyEqual(
      value,
      0,
    )
  ) {
    return;
  }

  entries.push({
    target,
    value,
  });
}

/* ------------------------------------------------------------------ */
/* Contribution Description                                           */
/* ------------------------------------------------------------------ */

function resolveRuleTargetLabel(
  rule:
    RecommendationAdaptationRule,
): string {
  if (
    rule.targetStrategyType !==
    null
  ) {
    return `strategy:${rule.targetStrategyType}`;
  }

  if (
    rule.targetDecisionType !==
    null
  ) {
    return `decision:${rule.targetDecisionType}`;
  }

  if (
    rule.targetSignalType !==
    null
  ) {
    return `signal:${rule.targetSignalType}`;
  }

  switch (
    rule.type
  ) {
    case "require-more-evidence":
    case "reduce-evidence-requirement":
      return "global:evidence-requirement";

    case "delay-new-recommendation":
    case "allow-earlier-recommendation":
      return "global:new-recommendation-threshold";

    case "reduce-redirection":
    case "allow-redirection":
      return "global:redirection-threshold";

    case "prefer-stabilization":
      return "global:stabilization-preference";

    case "prefer-recovery":
      return "global:recovery-preference";

    default:
      return `global:${rule.type}`;
  }
}

function createRuleContributionReason(
  rule:
    RecommendationAdaptationRule,
): string {
  return (
    rule.reasoning[
      0
    ] ??
    `Active rule ${rule.type} contributed to the Runtime adjustment.`
  );
}

/* ------------------------------------------------------------------ */
/* Number Helpers                                                     */
/* ------------------------------------------------------------------ */

function addAdjustment(
  current:
    number,
  additional:
    number,
): number {
  return normalizeAdjustment(
    current +
    additional,
  );
}

function normalizeAdjustment(
  value:
    number,
): number {
  return roundScore(
    clampRuntimeAdjustment(
      value,
    ),
  );
}

function clampRuntimeAdjustment(
  value:
    number,
): number {
  return Math.min(
    MAXIMUM_RUNTIME_ADJUSTMENT,
    Math.max(
      MINIMUM_RUNTIME_ADJUSTMENT,
      value,
    ),
  );
}

function roundScore(
  value:
    number,
): number {
  return Math.round(
    value *
      10000,
  ) /
    10000;
}

function areNumbersApproximatelyEqual(
  left:
    number,
  right:
    number,
): boolean {
  return (
    Math.abs(
      left -
        right,
    ) <=
    NUMBER_EQUALITY_TOLERANCE
  );
}

/* ------------------------------------------------------------------ */
/* String Validation                                                  */
/* ------------------------------------------------------------------ */

function validateRequiredString(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  if (
    typeof value !==
      "string" ||
    value.trim().length ===
      0
  ) {
    throw new Error(
      `${fieldName} must be a non-empty string.`,
    );
  }
}