import {
    isRecommendationAdaptiveLearningPresentationTone,
} from "./recommendationAdaptiveLearningTypes";

import {
    validateRecommendationAdaptiveLearningAnalysis,
} from "./analyzeRecommendationAdaptiveLearning";

import {
    getPrimaryRecommendationLearningPattern
} from "./detectRecommendationLearningPatterns";

import {
    summarizeRecommendationRuntimeAdjustment,
} from "./createRecommendationRuntimeAdjustments";

import {
    validateRecommendationEvolutionMemory,
} from "./appendRecommendationEvolutionMemory";

import {
    validateRecommendationEvolutionMemoryAnalysis,
} from "./analyzeRecommendationEvolutionMemory";

import type {
    CreateRecommendationAdaptiveLearningPresentationParams,
    RecommendationAdaptiveLearningAnalysis,
    RecommendationAdaptiveLearningPresentation,
    RecommendationAdaptiveLearningPresentationTone,
    RecommendationLearningPattern,
    RecommendationLearningPatternType,
} from "./recommendationAdaptiveLearningTypes";

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const MAXIMUM_PRESENTATION_WARNING_COUNT =
  5;

const MAXIMUM_PRESENTATION_EVIDENCE_COUNT =
  6;

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Adaptive Learning Analysis를 사용자가 이해할 수 있는
 * Presentation Model로 변환합니다.
 *
 * 이 함수는 다음 원칙을 따릅니다.
 *
 * - 내부 분석 Enum을 사용자 친화적인 문장으로 변환합니다.
 * - 학습 결과를 사용자의 방향이나 의사결정으로 표현하지 않습니다.
 * - 실제 적용되지 않은 proposed/conflicted Rule을 적용된 변화처럼
 *   표현하지 않습니다.
 * - Evidence가 부족하면 학습 결과를 확정적으로 표현하지 않습니다.
 * - 원본 Memory, Memory Analysis, Adaptive Analysis를 변경하지 않습니다.
 */
export function createRecommendationAdaptiveLearningPresentation(
  params:
    CreateRecommendationAdaptiveLearningPresentationParams,
): RecommendationAdaptiveLearningPresentation {
  validateCreateRecommendationAdaptiveLearningPresentationParams(
    params,
  );

  const {
    analysis,
    createdAt,
  } = params;

  const primaryPattern =
    getPrimaryRecommendationLearningPattern(
      analysis.patterns,
    );

  const presentation:
    RecommendationAdaptiveLearningPresentation = {
      tone:
        resolveRecommendationAdaptiveLearningPresentationTone(
          analysis,
        ),

      headline:
        createRecommendationAdaptiveLearningHeadline(
          analysis,
        ),

      summary:
        createRecommendationAdaptiveLearningSummary(
          analysis,
        ),

      learnedObservation:
        createRecommendationAdaptiveLearningObservation({
          analysis,
          primaryPattern,
        }),

      adjustmentDescription:
        createRecommendationAdaptiveLearningAdjustmentDescription(
          analysis,
        ),

      confidenceDisclosure:
        createRecommendationAdaptiveLearningConfidenceDisclosure(
          analysis,
        ),

      warnings:
        createRecommendationAdaptiveLearningWarnings(
          analysis,
        ).slice(
          0,
          MAXIMUM_PRESENTATION_WARNING_COUNT,
        ),

      evidence:
        createRecommendationAdaptiveLearningEvidence({
          analysis,
          primaryPattern,
        }).slice(
          0,
          MAXIMUM_PRESENTATION_EVIDENCE_COUNT,
        ),

      createdAt,
    };

  validateRecommendationAdaptiveLearningPresentation({
    analysis,
    presentation,
  });

  return cloneRecommendationAdaptiveLearningPresentation(
    presentation,
  );
}

/* ------------------------------------------------------------------ */
/* Tone                                                               */
/* ------------------------------------------------------------------ */

/**
 * Presentation Tone은 개별 Pattern보다 전체 Learning State를
 * 우선하여 결정합니다.
 */
export function resolveRecommendationAdaptiveLearningPresentationTone(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): RecommendationAdaptiveLearningPresentationTone {
  switch (
    analysis.state
  ) {
    case "unavailable":
      return "unavailable";

    case "insufficient":
      return "observing";

    case "observing":
      return "observing";

    case "learning":
      return "learning";

    case "adapting":
      return "adapting";

    case "stable":
      return "stable";

    case "conflicted":
      return "attention";
  }
}

/* ------------------------------------------------------------------ */
/* Headline                                                           */
/* ------------------------------------------------------------------ */

export function createRecommendationAdaptiveLearningHeadline(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string {
  switch (
    analysis.state
  ) {
    case "unavailable":
      return "Adaptive learning is not available yet.";

    case "insufficient":
      return "More Recommendation history is needed for adaptive learning.";

    case "observing":
      return "Recommendation outcomes are still being observed.";

    case "learning":
      return "Recommendation learning patterns are beginning to emerge.";

    case "adapting":
      return "Recommendation learning is now influencing Runtime adjustments.";

    case "stable":
      return "Recommendation learning has become stable.";

    case "conflicted":
      return "Conflicting Recommendation evidence requires additional observation.";
  }
}

/* ------------------------------------------------------------------ */
/* Summary                                                            */
/* ------------------------------------------------------------------ */

export function createRecommendationAdaptiveLearningSummary(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string {
  const {
    statistics,
  } = analysis;

  if (
    analysis.state ===
      "unavailable"
  ) {
    return "No comparable Recommendation learning observations are currently available.";
  }

  if (
    statistics.observationCount ===
      0
  ) {
    return "Recommendation history exists, but no valid learning observations could be created.";
  }

  const observationDescription =
    createCountDescription(
      statistics.observationCount,
      "learning observation",
      "learning observations",
    );

  const patternDescription =
    createCountDescription(
      statistics.patternCount,
      "learning pattern",
      "learning patterns",
    );

  const ruleDescription =
    createCountDescription(
      statistics.adaptationRuleCount,
      "adaptation rule",
      "adaptation rules",
    );

  const activeRuleDescription =
    createCountDescription(
      statistics.activeAdaptationRuleCount,
      "active rule",
      "active rules",
    );

  return [
    `${observationDescription} were evaluated.`,
    `${patternDescription} and ${ruleDescription} were generated.`,
    `${activeRuleDescription} currently contribute to Runtime adaptation.`,
  ].join(
    " ",
  );
}

/* ------------------------------------------------------------------ */
/* Learned Observation                                                */
/* ------------------------------------------------------------------ */

/**
 * Adaptive Learning이 실제로 무엇을 학습했는지 압축합니다.
 *
 * Part A에서는 Primary Pattern을 중심으로 핵심 의미를 생성합니다.
 * Part B에서 Strategy·Decision·Signal별 구체적인 표현을 확장할 수
 * 있습니다.
 */
export function createRecommendationAdaptiveLearningObservation(
  params: {
    analysis:
      RecommendationAdaptiveLearningAnalysis;

    primaryPattern:
      RecommendationLearningPattern | null;
  },
): string | null {
  const {
    analysis,
    primaryPattern,
  } = params;

  if (
    analysis.state ===
      "unavailable"
  ) {
    return null;
  }

  if (
    analysis.state ===
      "insufficient"
  ) {
    return "The available history is being preserved, but no stable learning conclusion has been formed.";
  }

  if (
    primaryPattern ===
      null
  ) {
    if (
      analysis.state ===
        "stable"
    ) {
      return "The observed Recommendation behaviour is stable and does not currently show a dominant adjustment pattern.";
    }

    return "No single Recommendation learning pattern is dominant yet.";
  }

  return describeRecommendationLearningPattern(
    primaryPattern,
  );
}

/* ------------------------------------------------------------------ */
/* Primary Pattern Description                                        */
/* ------------------------------------------------------------------ */

function describeRecommendationLearningPattern(
  pattern:
    RecommendationLearningPattern,
): string {
  switch (
    pattern.type
  ) {
    case "strategy-success":
      return createTargetAwareDescription({
        base:
          "A Recommendation strategy was repeatedly associated with constructive outcomes.",

        targets:
          pattern.relatedStrategyTypes,

        prefix:
          "Strategy",
      });

    case "strategy-failure":
      return createTargetAwareDescription({
        base:
          "A Recommendation strategy was repeatedly associated with weak or negative outcomes.",

        targets:
          pattern.relatedStrategyTypes,

        prefix:
          "Strategy",
      });

    case "decision-success":
      return createTargetAwareDescription({
        base:
          "A Runtime decision was repeatedly associated with constructive Recommendation outcomes.",

        targets:
          pattern.relatedDecisionTypes,

        prefix:
          "Runtime decision",
      });

    case "decision-failure":
      return createTargetAwareDescription({
        base:
          "A Runtime decision was repeatedly associated with weak Recommendation outcomes.",

        targets:
          pattern.relatedDecisionTypes,

        prefix:
          "Runtime decision",
      });

    case "state-strategy-mismatch":
      return createTargetAwareDescription({
        base:
          "A Recommendation strategy appears to be less effective in the observed state context.",

        targets:
          pattern.relatedStrategyTypes,

        prefix:
          "Strategy",
      });

    case "repeated-premature-advance":
      return "Recommendation advancement repeatedly occurred before sufficient progress or completion evidence was available.";

    case "persistent-over-observation":
      return "Observation continued repeatedly without corresponding progress or completion momentum.";

    case "effective-stabilization":
      return "Stabilization behaviour repeatedly improved Recommendation stability or reduced risk.";

    case "effective-recovery":
      return "Recovery-oriented behaviour repeatedly moved the Recommendation flow away from stalled or fragmented states.";

    case "signal-overestimation":
      return createTargetAwareDescription({
        base:
          "A Memory signal appears to have been trusted more strongly than later outcomes supported.",

        targets:
          pattern.relatedSignalTypes,

        prefix:
          "Memory signal",
      });

    case "signal-underestimation":
      return createTargetAwareDescription({
        base:
          "A Memory signal appears to have been more reliable than its previous confidence suggested.",

        targets:
          pattern.relatedSignalTypes,

        prefix:
          "Memory signal",
      });

    case "confidence-degradation":
      return "Recommendation confidence repeatedly declined alongside weak or unresolved outcomes.";

    case "confidence-recovery":
      return "Recommendation confidence repeatedly recovered alongside improved or recovered outcomes.";

    case "conflicting-evidence":
      return "The same Recommendation behaviour produced opposing learning evidence, so a stable adaptation direction cannot yet be established.";

    case "insufficient-evidence":
      return "The current Recommendation history does not contain enough repeated evidence to establish a stable learning pattern.";
  }
}

/* ------------------------------------------------------------------ */
/* Adjustment Description                                             */
/* ------------------------------------------------------------------ */

export function createRecommendationAdaptiveLearningAdjustmentDescription(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string | null {
  const adjustmentSummary =
    summarizeRecommendationRuntimeAdjustment(
      analysis.runtimeAdjustment,
    );

  if (
    !adjustmentSummary.hasAdjustments
  ) {
    return createNoRuntimeAdjustmentDescription(
      analysis,
    );
  }

  const descriptions =
    createRecommendationRuntimeAdjustmentDescriptions(
      analysis,
    );

  if (
    descriptions.length ===
    0
  ) {
    return "Active adaptation rules produced a limited Runtime adjustment.";
  }

  const primaryDescriptions =
    descriptions.slice(
      0,
      3,
    );

  const remainingCount =
    descriptions.length -
    primaryDescriptions.length;

  const primaryDescription =
    primaryDescriptions.join(
      " ",
    );

  if (
    remainingCount <=
    0
  ) {
    return primaryDescription;
  }

  return `${primaryDescription} ${createCountDescription(
    remainingCount,
    "additional adjustment remains",
    "additional adjustments remain",
  )} active.`;
}

/* ------------------------------------------------------------------ */
/* Part B — Runtime Adjustment Presentation                           */
/* ------------------------------------------------------------------ */

type RuntimeAdjustmentDescriptionEntry = {
  target:
    string;

  value:
    number;

  magnitude:
    number;

  priority:
    number;

  description:
    string;
};

/**
 * Runtime Adjustment 전체를 사람이 읽을 수 있는 문장 배열로
 * 변환합니다.
 *
 * 강도가 큰 조정부터 반환하며, 동일 강도에서는 다음 우선순위를
 * 사용합니다.
 *
 * 1. Global Recommendation Behaviour
 * 2. Strategy
 * 3. Runtime Decision
 * 4. Memory Signal
 */
export function createRecommendationRuntimeAdjustmentDescriptions(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string[] {
  const entries =
    collectRuntimeAdjustmentDescriptionEntries(
      analysis,
    );

  return entries
    .sort(
      compareRuntimeAdjustmentDescriptionEntries,
    )
    .map(
      (
        entry,
      ) =>
        entry.description,
    );
}

/* ------------------------------------------------------------------ */
/* No Adjustment Description                                          */
/* ------------------------------------------------------------------ */

function createNoRuntimeAdjustmentDescription(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string | null {
  if (
    analysis.state ===
      "conflicted"
  ) {
    return "No Runtime adjustment was applied because the available learning evidence is conflicted.";
  }

  if (
    analysis.statistics.conflictedAdaptationRuleCount >
    0
  ) {
    return "Potential adaptations were detected, but conflicting rules were excluded from Runtime adjustment.";
  }

  if (
    analysis.statistics.adaptationRuleCount >
      0 &&
    analysis.statistics.activeAdaptationRuleCount ===
      0
  ) {
    return "Adaptation rules were identified, but none currently meet the requirements for active Runtime adjustment.";
  }

  if (
    analysis.state ===
      "insufficient"
  ) {
    return "No Runtime adjustment is applied while Recommendation evidence remains insufficient.";
  }

  if (
    analysis.state ===
      "observing"
  ) {
    return "Recommendation outcomes are still being observed, so Runtime behaviour remains unchanged.";
  }

  if (
    analysis.state ===
      "stable"
  ) {
    return "Recommendation learning is stable and does not currently require additional Runtime adjustment.";
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Adjustment Entry Collection                                        */
/* ------------------------------------------------------------------ */

function collectRuntimeAdjustmentDescriptionEntries(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): RuntimeAdjustmentDescriptionEntry[] {
  const entries:
    RuntimeAdjustmentDescriptionEntry[] = [];

  collectGlobalAdjustmentDescriptionEntries(
    analysis,
    entries,
  );

  collectStrategyAdjustmentDescriptionEntries(
    analysis,
    entries,
  );

  collectDecisionAdjustmentDescriptionEntries(
    analysis,
    entries,
  );

  collectSignalAdjustmentDescriptionEntries(
    analysis,
    entries,
  );

  return entries;
}

/* ------------------------------------------------------------------ */
/* Global Adjustment Descriptions                                     */
/* ------------------------------------------------------------------ */

function collectGlobalAdjustmentDescriptionEntries(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
  entries:
    RuntimeAdjustmentDescriptionEntry[],
): void {
  const {
    runtimeAdjustment,
  } = analysis;

  pushRuntimeAdjustmentDescriptionEntry({
    entries,

    target:
      "global:evidence-requirement",

    value:
      runtimeAdjustment
        .evidenceRequirementAdjustment,

    priority:
      400,

    createDescription:
      describeEvidenceRequirementAdjustment,
  });

  pushRuntimeAdjustmentDescriptionEntry({
    entries,

    target:
      "global:new-recommendation-threshold",

    value:
      runtimeAdjustment
        .newRecommendationThresholdAdjustment,

    priority:
      390,

    createDescription:
      describeNewRecommendationThresholdAdjustment,
  });

  pushRuntimeAdjustmentDescriptionEntry({
    entries,

    target:
      "global:redirection-threshold",

    value:
      runtimeAdjustment
        .redirectionThresholdAdjustment,

    priority:
      380,

    createDescription:
      describeRedirectionThresholdAdjustment,
  });

  pushRuntimeAdjustmentDescriptionEntry({
    entries,

    target:
      "global:stabilization-preference",

    value:
      runtimeAdjustment
        .stabilizationPreferenceAdjustment,

    priority:
      370,

    createDescription:
      describeStabilizationPreferenceAdjustment,
  });

  pushRuntimeAdjustmentDescriptionEntry({
    entries,

    target:
      "global:recovery-preference",

    value:
      runtimeAdjustment
        .recoveryPreferenceAdjustment,

    priority:
      360,

    createDescription:
      describeRecoveryPreferenceAdjustment,
  });
}

/* ------------------------------------------------------------------ */
/* Strategy Adjustment Descriptions                                   */
/* ------------------------------------------------------------------ */

function collectStrategyAdjustmentDescriptionEntries(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
  entries:
    RuntimeAdjustmentDescriptionEntry[],
): void {
  Object.entries(
    analysis.runtimeAdjustment
      .strategyPreferenceAdjustments,
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

      pushRuntimeAdjustmentDescriptionEntry({
        entries,

        target:
          `strategy:${strategyType}`,

        value,

        priority:
          300,

        createDescription:
          (
            adjustment,
          ) =>
            describeStrategyPreferenceAdjustment({
              strategyType,
              adjustment,
            }),
      });
    },
  );
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Adjustment Descriptions                           */
/* ------------------------------------------------------------------ */

function collectDecisionAdjustmentDescriptionEntries(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
  entries:
    RuntimeAdjustmentDescriptionEntry[],
): void {
  Object.entries(
    analysis.runtimeAdjustment
      .decisionPreferenceAdjustments,
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

      pushRuntimeAdjustmentDescriptionEntry({
        entries,

        target:
          `decision:${decisionType}`,

        value,

        priority:
          200,

        createDescription:
          (
            adjustment,
          ) =>
            describeDecisionPreferenceAdjustment({
              decisionType,
              adjustment,
            }),
      });
    },
  );
}

/* ------------------------------------------------------------------ */
/* Memory Signal Adjustment Descriptions                              */
/* ------------------------------------------------------------------ */

function collectSignalAdjustmentDescriptionEntries(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
  entries:
    RuntimeAdjustmentDescriptionEntry[],
): void {
  Object.entries(
    analysis.runtimeAdjustment
      .signalConfidenceAdjustments,
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

      pushRuntimeAdjustmentDescriptionEntry({
        entries,

        target:
          `signal:${signalType}`,

        value,

        priority:
          100,

        createDescription:
          (
            adjustment,
          ) =>
            describeSignalConfidenceAdjustment({
              signalType,
              adjustment,
            }),
      });
    },
  );
}

/* ------------------------------------------------------------------ */
/* Entry Factory                                                      */
/* ------------------------------------------------------------------ */

function pushRuntimeAdjustmentDescriptionEntry(
  params: {
    entries:
      RuntimeAdjustmentDescriptionEntry[];

    target:
      string;

    value:
      number;

    priority:
      number;

    createDescription:
      (
        adjustment:
          number,
      ) => string;
  },
): void {
  if (
    arePresentationNumbersApproximatelyEqual(
      params.value,
      0,
    )
  ) {
    return;
  }

  params.entries.push({
    target:
      params.target,

    value:
      params.value,

    magnitude:
      Math.abs(
        params.value,
      ),

    priority:
      params.priority,

    description:
      params.createDescription(
        params.value,
      ),
  });
}

/* ------------------------------------------------------------------ */
/* Strategy Description                                               */
/* ------------------------------------------------------------------ */

function describeStrategyPreferenceAdjustment(
  params: {
    strategyType:
      string;

    adjustment:
      number;
  },
): string {
  const strategyLabel =
    createStrategyDisplayLabel(
      params.strategyType,
    );

  const strength =
    describeAdjustmentStrength(
      params.adjustment,
    );

  if (
    params.adjustment >
    0
  ) {
    return `${strategyLabel} Strategy is now ${strength} preferred when future Recommendation strategies are compared.`;
  }

  return `${strategyLabel} Strategy is now ${strength} less preferred when future Recommendation strategies are compared.`;
}

/* ------------------------------------------------------------------ */
/* Decision Description                                               */
/* ------------------------------------------------------------------ */

function describeDecisionPreferenceAdjustment(
  params: {
    decisionType:
      string;

    adjustment:
      number;
  },
): string {
  const decisionLabel =
    createRuntimeDecisionDisplayLabel(
      params.decisionType,
    );

  const strength =
    describeAdjustmentStrength(
      params.adjustment,
    );

  if (
    params.adjustment >
    0
  ) {
    return `${decisionLabel} Runtime Decision is now ${strength} preferred.`;
  }

  return `${decisionLabel} Runtime Decision is now ${strength} less preferred.`;
}

/* ------------------------------------------------------------------ */
/* Signal Description                                                 */
/* ------------------------------------------------------------------ */

function describeSignalConfidenceAdjustment(
  params: {
    signalType:
      string;

    adjustment:
      number;
  },
): string {
  const signalLabel =
    createMemorySignalDisplayLabel(
      params.signalType,
    );

  const strength =
    describeAdjustmentStrength(
      params.adjustment,
    );

  if (
    params.adjustment >
    0
  ) {
    return `Confidence in the ${signalLabel} Memory Signal is ${strength} increased.`;
  }

  return `Confidence in the ${signalLabel} Memory Signal is ${strength} reduced.`;
}

/* ------------------------------------------------------------------ */
/* Evidence Requirement Description                                   */
/* ------------------------------------------------------------------ */

function describeEvidenceRequirementAdjustment(
  adjustment:
    number,
): string {
  const strength =
    describeThresholdStrength(
      adjustment,
    );

  if (
    adjustment >
    0
  ) {
    return `${strength} evidence is now required before the Runtime makes a stronger Recommendation change.`;
  }

  return `The Runtime may act with ${strength} supporting evidence when Recommendation outcomes remain consistent.`;
}

/* ------------------------------------------------------------------ */
/* New Recommendation Threshold Description                           */
/* ------------------------------------------------------------------ */

function describeNewRecommendationThresholdAdjustment(
  adjustment:
    number,
): string {
  const strength =
    describeAdjustmentStrength(
      adjustment,
    );

  if (
    adjustment >
    0
  ) {
    return `A new Recommendation will be introduced ${strength} more cautiously.`;
  }

  return `A new Recommendation may be introduced ${strength} earlier when supporting evidence is available.`;
}

/* ------------------------------------------------------------------ */
/* Redirection Threshold Description                                  */
/* ------------------------------------------------------------------ */

function describeRedirectionThresholdAdjustment(
  adjustment:
    number,
): string {
  const strength =
    describeAdjustmentStrength(
      adjustment,
    );

  if (
    adjustment >
    0
  ) {
    return `Recommendation redirection now requires ${strength} stronger evidence.`;
  }

  return `Recommendation redirection is now ${strength} easier when the current direction is no longer effective.`;
}

/* ------------------------------------------------------------------ */
/* Stabilization Description                                          */
/* ------------------------------------------------------------------ */

function describeStabilizationPreferenceAdjustment(
  adjustment:
    number,
): string {
  const strength =
    describeAdjustmentStrength(
      adjustment,
    );

  if (
    adjustment >
    0
  ) {
    return `Stabilizing the current Recommendation flow is now ${strength} preferred when instability is detected.`;
  }

  return `Stabilization is now ${strength} less preferred in future Recommendation evaluation.`;
}

/* ------------------------------------------------------------------ */
/* Recovery Description                                               */
/* ------------------------------------------------------------------ */

function describeRecoveryPreferenceAdjustment(
  adjustment:
    number,
): string {
  const strength =
    describeAdjustmentStrength(
      adjustment,
    );

  if (
    adjustment >
    0
  ) {
    return `Recovery-oriented behaviour is now ${strength} preferred when the Recommendation flow appears stalled or fragmented.`;
  }

  return `Recovery-oriented behaviour is now ${strength} less preferred in future Recommendation evaluation.`;
}

/* ------------------------------------------------------------------ */
/* Adjustment Strength                                                */
/* ------------------------------------------------------------------ */

/**
 * 선호도·신뢰도·Threshold 변화의 상대적 크기를 자연어로
 * 표현합니다.
 *
 * Runtime Adjustment 범위:
 *
 * 0.00–0.14  slightly
 * 0.15–0.34  moderately
 * 0.35–0.59  strongly
 * 0.60–1.00  substantially
 */
export function describeRecommendationAdjustmentStrength(
  adjustment:
    number,
): string {
  return describeAdjustmentStrength(
    adjustment,
  );
}

function describeAdjustmentStrength(
  adjustment:
    number,
): string {
  const magnitude =
    Math.abs(
      adjustment,
    );

  if (
    magnitude <
    0.15
  ) {
    return "slightly";
  }

  if (
    magnitude <
    0.35
  ) {
    return "moderately";
  }

  if (
    magnitude <
    0.6
  ) {
    return "strongly";
  }

  return "substantially";
}

/**
 * Evidence Requirement처럼 문장 안에서 명사 앞에 배치되는
 * 표현을 반환합니다.
 */
function describeThresholdStrength(
  adjustment:
    number,
): string {
  const magnitude =
    Math.abs(
      adjustment,
    );

  if (
    magnitude <
    0.15
  ) {
    return "slightly more";
  }

  if (
    magnitude <
    0.35
  ) {
    return "moderately more";
  }

  if (
    magnitude <
    0.6
  ) {
    return "considerably more";
  }

  return "substantially more";
}

/* ------------------------------------------------------------------ */
/* Human-readable Labels                                              */
/* ------------------------------------------------------------------ */

export function createStrategyDisplayLabel(
  strategyType:
    string,
): string {
  switch (
    strategyType
  ) {
    case "observe":
      return "Observe";

    case "maintain":
      return "Maintain";

    case "clarify":
      return "Clarify";

    case "narrow":
      return "Narrow";

    case "confirm-completion":
      return "Confirm Completion";

    case "advance":
      return "Advance";

    case "stabilize":
      return "Stabilize";

    case "reconsider":
      return "Reconsider";

    default:
      return createTitleCaseLabel(
        strategyType,
      );
  }
}

export function createRuntimeDecisionDisplayLabel(
  decisionType:
    string,
): string {
  return createTitleCaseLabel(
    decisionType,
  );
}

export function createMemorySignalDisplayLabel(
  signalType:
    string,
): string {
  switch (
    signalType
  ) {
    case "persistent-observation":
      return "Persistent Observation";

    case "persistent-stability":
      return "Persistent Stability";

    case "persistent-stall":
      return "Persistent Stall";

    case "persistent-fragmentation":
      return "Persistent Fragmentation";

    case "strategy-oscillation":
      return "Strategy Oscillation";

    case "state-oscillation":
      return "State Oscillation";

    case "confidence-degradation":
      return "Confidence Degradation";

    case "confidence-recovery":
      return "Confidence Recovery";

    case "risk-accumulation":
      return "Risk Accumulation";

    case "risk-reduction":
      return "Risk Reduction";

    case "long-term-progression":
      return "Long-term Progression";

    case "long-term-advancement":
      return "Long-term Advancement";

    case "recovery-pattern":
      return "Recovery Pattern";

    case "insufficient-memory":
      return "Insufficient Memory";

    default:
      return createTitleCaseLabel(
        signalType,
      );
  }
}

function createTitleCaseLabel(
  value:
    string,
): string {
  return value
    .split(
      "-",
    )
    .filter(
      (
        part,
      ) =>
        part.length >
        0,
    )
    .map(
      (
        part,
      ) =>
        part.charAt(
          0,
        ).toUpperCase() +
        part.slice(
          1,
        ),
    )
    .join(
      " ",
    );
}

/* ------------------------------------------------------------------ */
/* Adjustment Ordering                                                */
/* ------------------------------------------------------------------ */

function compareRuntimeAdjustmentDescriptionEntries(
  left:
    RuntimeAdjustmentDescriptionEntry,
  right:
    RuntimeAdjustmentDescriptionEntry,
): number {
  if (
    !arePresentationNumbersApproximatelyEqual(
      left.magnitude,
      right.magnitude,
    )
  ) {
    return right.magnitude -
      left.magnitude;
  }

  if (
    left.priority !==
    right.priority
  ) {
    return right.priority -
      left.priority;
  }

  return left.target.localeCompare(
    right.target,
  );
}

/* ------------------------------------------------------------------ */
/* Adjustment Query Helpers                                           */
/* ------------------------------------------------------------------ */

/**
 * 현재 Presentation에서 사용자에게 보여줄 수 있는 Runtime
 * Adjustment 문장이 존재하는지 확인합니다.
 */
export function hasRecommendationRuntimeAdjustmentDescriptions(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): boolean {
  return createRecommendationRuntimeAdjustmentDescriptions(
    analysis,
  ).length >
    0;
}

/**
 * 가장 강한 Runtime Adjustment 설명을 반환합니다.
 */
export function getPrimaryRecommendationRuntimeAdjustmentDescription(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string | null {
  return (
    createRecommendationRuntimeAdjustmentDescriptions(
      analysis,
    )[
      0
    ] ??
    null
  );
}

/**
 * 특정 Target의 Runtime Adjustment 설명을 반환합니다.
 */
export function findRecommendationRuntimeAdjustmentDescriptionByTarget(
  params: {
    analysis:
      RecommendationAdaptiveLearningAnalysis;

    target:
      string;
  },
): string | null {
  validateRequiredString(
    params.target,
    "target",
  );

  const entry =
    collectRuntimeAdjustmentDescriptionEntries(
      params.analysis,
    ).find(
      (
        candidate,
      ) =>
        candidate.target ===
        params.target,
    );

  return entry?.description ??
    null;
}

/* ------------------------------------------------------------------ */
/* Part B Number Helper                                               */
/* ------------------------------------------------------------------ */

function arePresentationNumbersApproximatelyEqual(
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
    1e-10
  );
}

/* ------------------------------------------------------------------ */
/* Confidence Disclosure                                              */
/* ------------------------------------------------------------------ */

/**
 * Confidence는 정확성 보증이 아니라 현재 Evidence 범위를 나타내는
 * Disclosure 문장으로 표현합니다.
 */
export function createRecommendationAdaptiveLearningConfidenceDisclosure(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string {
  const confidencePercent =
    formatPercentage(
      analysis.confidence,
    );

  const evidencePercent =
    formatPercentage(
      analysis.scores.evidenceStrength,
    );

  switch (
    analysis.state
  ) {
    case "unavailable":
      return "Learning confidence cannot be calculated because comparable Recommendation evidence is unavailable.";

    case "insufficient":
      return `Current learning confidence is ${confidencePercent}, but evidence coverage is only ${evidencePercent}; the result should remain observational.`;

    case "conflicted":
      return `Current learning confidence is ${confidencePercent}, but conflicting evidence limits automatic adaptation.`;

    case "adapting":
      return `Current learning confidence is ${confidencePercent}, with evidence coverage at ${evidencePercent}; only active and non-conflicted rules are applied.`;

    case "stable":
      return `Current learning confidence is ${confidencePercent}, supported by evidence coverage of ${evidencePercent}.`;

    case "learning":
    case "observing":
      return `Current learning confidence is ${confidencePercent}, with evidence coverage at ${evidencePercent}; conclusions may change as more outcomes are observed.`;
  }
}

/* ------------------------------------------------------------------ */
/* Warnings                                                           */
/* ------------------------------------------------------------------ */

export function createRecommendationAdaptiveLearningWarnings(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string[] {
  const warnings:
    string[] = [];

  if (
    analysis.state ===
      "unavailable"
  ) {
    warnings.push(
      "Comparable Recommendation outcome history is unavailable.",
    );
  }

  if (
    analysis.state ===
      "insufficient"
  ) {
    warnings.push(
      "The current observation sample is too small for stable adaptation.",
    );
  }

  if (
    analysis.state ===
      "conflicted"
  ) {
    warnings.push(
      "Conflicting learning evidence prevents automatic Runtime adaptation.",
    );
  }

  if (
    analysis.scores.conflictRisk >=
      0.4
  ) {
    warnings.push(
      `Learning conflict risk is elevated at ${formatPercentage(
        analysis.scores.conflictRisk,
      )}.`,
    );
  }

  if (
    analysis.statistics.conflictedAdaptationRuleCount >
      0
  ) {
    warnings.push(
      `${createCountDescription(
        analysis.statistics.conflictedAdaptationRuleCount,
        "adaptation rule contains",
        "adaptation rules contain",
      )} opposing evidence and ${
        analysis.statistics.conflictedAdaptationRuleCount ===
        1
          ? "is"
          : "are"
      } not applied automatically.`,
    );
  }

  if (
    analysis.scores.signalReliability <
      0.4 &&
    analysis.statistics.signalReliabilityProfileCount >
      0
  ) {
    warnings.push(
      "Memory signal reliability remains weak or unresolved.",
    );
  }

  if (
    analysis.statistics.negativeOutcomeCount >
    analysis.statistics.positiveOutcomeCount &&
    analysis.statistics.observationCount >
      0
  ) {
    warnings.push(
      "Negative Recommendation outcomes currently outnumber positive outcomes.",
    );
  }

  if (
    analysis.patterns.some(
      (
        pattern,
      ) =>
        pattern.type ===
        "repeated-premature-advance",
    )
  ) {
    warnings.push(
      "Recommendation advancement may be occurring before sufficient progress evidence is available.",
    );
  }

  if (
    analysis.patterns.some(
      (
        pattern,
      ) =>
        pattern.type ===
        "persistent-over-observation",
    )
  ) {
    warnings.push(
      "Observation may be continuing longer than necessary without corresponding progress.",
    );
  }

  return uniqueStrings(
    warnings,
  );
}

/* ------------------------------------------------------------------ */
/* Evidence                                                           */
/* ------------------------------------------------------------------ */

export function createRecommendationAdaptiveLearningEvidence(
  params: {
    analysis:
      RecommendationAdaptiveLearningAnalysis;

    primaryPattern:
      RecommendationLearningPattern | null;
  },
): string[] {
  const {
    analysis,
    primaryPattern,
  } = params;

  const evidence:
    string[] = [];

  evidence.push(
    `${createCountDescription(
      analysis.statistics.observationCount,
      "learning observation",
      "learning observations",
    )} ${
      analysis.statistics.observationCount ===
      1
        ? "was"
        : "were"
    } evaluated.`,
  );

  evidence.push(
    `${createCountDescription(
      analysis.statistics.positiveOutcomeCount,
      "positive outcome",
      "positive outcomes",
    )} and ${createCountDescription(
      analysis.statistics.negativeOutcomeCount,
      "negative outcome",
      "negative outcomes",
    )} were observed.`,
  );

  if (
    analysis.statistics.patternCount >
    0
  ) {
    evidence.push(
      `${createCountDescription(
        analysis.statistics.patternCount,
        "learning pattern",
        "learning patterns",
      )} ${
        analysis.statistics.patternCount ===
        1
          ? "was"
          : "were"
      } detected.`,
    );
  }

  if (
    primaryPattern !==
    null
  ) {
    evidence.push(
      `The primary learning pattern is ${formatIdentifier(
        primaryPattern.type,
      )} with ${formatPercentage(
        primaryPattern.confidence,
      )} confidence.`,
    );
  }

  if (
    analysis.statistics.activeAdaptationRuleCount >
    0
  ) {
    evidence.push(
      `${createCountDescription(
        analysis.statistics.activeAdaptationRuleCount,
        "adaptation rule is",
        "adaptation rules are",
      )} active.`,
    );
  }

  if (
    analysis.signalReliabilityProfiles.length >
    0
  ) {
    evidence.push(
      `Average Memory signal reliability is ${formatPercentage(
        analysis.scores.signalReliability,
      )}.`,
    );
  }

  const runtimeAdjustmentDescriptions =
    createRecommendationRuntimeAdjustmentDescriptions(
      analysis,
    );

  if (
    runtimeAdjustmentDescriptions.length >
    0
  ) {
    evidence.push(
      `${createCountDescription(
        runtimeAdjustmentDescriptions.length,
        "Runtime adjustment is",
        "Runtime adjustments are",
      )} currently derived from active adaptation rules.`,
    );
  }

  const strongestAdjustment =
    summarizeRecommendationRuntimeAdjustment(
      analysis.runtimeAdjustment,
    );

  if (
    strongestAdjustment.strongestAdjustmentTarget !==
      null
  ) {
    evidence.push(
      `The strongest current adjustment affects ${formatRuntimeAdjustmentTarget(
        strongestAdjustment.strongestAdjustmentTarget,
      )}.`,
    );
  }

  evidence.push(
    `Overall adaptive learning confidence is ${formatPercentage(
      analysis.confidence,
    )}.`,
  );

  return uniqueStrings(
    evidence,
  );
}

/* ------------------------------------------------------------------ */
/* Presentation Validation                                            */
/* ------------------------------------------------------------------ */

export function validateRecommendationAdaptiveLearningPresentation(
  params: {
    analysis:
      RecommendationAdaptiveLearningAnalysis;

    presentation:
      RecommendationAdaptiveLearningPresentation;
  },
): void {
  const {
    analysis,
    presentation,
  } = params;

  if (
    typeof presentation !==
      "object" ||
    presentation ===
      null ||
    Array.isArray(
      presentation,
    )
  ) {
    throw new Error(
      "Recommendation Adaptive Learning Presentation must be an object.",
    );
  }

  if (
    !isRecommendationAdaptiveLearningPresentationTone(
      presentation.tone,
    )
  ) {
    throw new Error(
      "Recommendation Adaptive Learning Presentation tone is invalid.",
    );
  }

  validateRequiredString(
    presentation.headline,
    "presentation.headline",
  );

  validateRequiredString(
    presentation.summary,
    "presentation.summary",
  );

  validateNullableString(
    presentation.learnedObservation,
    "presentation.learnedObservation",
  );

  validateNullableString(
    presentation.adjustmentDescription,
    "presentation.adjustmentDescription",
  );

  validateRequiredString(
    presentation.confidenceDisclosure,
    "presentation.confidenceDisclosure",
  );

  validateUniqueStringArray(
    presentation.warnings,
    "presentation.warnings",
  );

  validateUniqueStringArray(
    presentation.evidence,
    "presentation.evidence",
  );

  validateTimestamp(
    presentation.createdAt,
    "presentation.createdAt",
  );

  validateTimestampOrder(
    analysis.analyzedAt,
    presentation.createdAt,
    "analysis.analyzedAt",
    "presentation.createdAt",
  );

  validatePresentationStateConsistency({
    analysis,
    presentation,
  });

  validatePresentationSemanticConsistency({
    analysis,
    presentation,
  });
}

/* ------------------------------------------------------------------ */
/* Presentation State Consistency                                     */
/* ------------------------------------------------------------------ */

function validatePresentationStateConsistency(
  params: {
    analysis:
      RecommendationAdaptiveLearningAnalysis;

    presentation:
      RecommendationAdaptiveLearningPresentation;
  },
): void {
  const {
    analysis,
    presentation,
  } = params;

  const expectedTone =
    resolveRecommendationAdaptiveLearningPresentationTone(
      analysis,
    );

  if (
    presentation.tone !==
    expectedTone
  ) {
    throw new Error(
      "Recommendation Adaptive Learning Presentation tone must match the Analysis state.",
    );
  }

  if (
    analysis.state ===
      "unavailable" &&
    presentation.learnedObservation !==
      null
  ) {
    throw new Error(
      "Unavailable Adaptive Learning Presentation must not contain a learnedObservation.",
    );
  }

  if (
    analysis.state ===
      "conflicted" &&
    !presentation.warnings.some(
      (
        warning,
      ) =>
        warning.toLowerCase().includes(
          "conflict",
        ),
    )
  ) {
    throw new Error(
      "Conflicted Adaptive Learning Presentation must disclose conflicting evidence.",
    );
  }

  if (
    analysis.statistics.activeAdaptationRuleCount ===
      0 &&
    presentation.adjustmentDescription !==
      null &&
    !presentation.adjustmentDescription.includes(
      "none",
    ) &&
    !presentation.adjustmentDescription.includes(
      "No Runtime adjustment",
    ) &&
    !presentation.adjustmentDescription.includes(
      "but none currently",
    )
  ) {
    throw new Error(
      "Presentation must not describe active Runtime adjustment when no active adaptation rule exists.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateCreateRecommendationAdaptiveLearningPresentationParams(
  params:
    CreateRecommendationAdaptiveLearningPresentationParams,
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
      "Create Recommendation Adaptive Learning Presentation params must be an object.",
    );
  }

  validateRecommendationEvolutionMemory({
    memory:
      params.memory,
  });

  validateRecommendationEvolutionMemoryAnalysis({
    memory:
      params.memory,

    analysis:
      params.memoryAnalysis,
  });

  validateRecommendationAdaptiveLearningAnalysis({
    memory:
      params.memory,

    memoryAnalysis:
      params.memoryAnalysis,

    analysis:
      params.analysis,
  });

  if (
    params.analysis.memoryId !==
    params.memory.id
  ) {
    throw new Error(
      "Adaptive Learning Analysis memoryId must match Presentation Memory id.",
    );
  }

  if (
    params.analysis.historyId !==
      params.memory.historyId ||
    params.analysis.historyId !==
      params.memoryAnalysis.historyId
  ) {
    throw new Error(
      "Adaptive Learning Presentation input historyId values are inconsistent.",
    );
  }

  validateTimestamp(
    params.createdAt,
    "createdAt",
  );

  validateTimestampOrder(
    params.analysis.analyzedAt,
    params.createdAt,
    "analysis.analyzedAt",
    "createdAt",
  );
}

/* ------------------------------------------------------------------ */
/* Clone                                                              */
/* ------------------------------------------------------------------ */

export function cloneRecommendationAdaptiveLearningPresentation(
  presentation:
    RecommendationAdaptiveLearningPresentation,
): RecommendationAdaptiveLearningPresentation {
  return {
    ...presentation,

    warnings: [
      ...presentation.warnings,
    ],

    evidence: [
      ...presentation.evidence,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Basic Query Helpers                                                */
/* ------------------------------------------------------------------ */

export function hasRecommendationAdaptiveLearningPresentationWarnings(
  presentation:
    RecommendationAdaptiveLearningPresentation,
): boolean {
  return presentation.warnings.length >
    0;
}

export function hasRecommendationAdaptiveLearningPresentationEvidence(
  presentation:
    RecommendationAdaptiveLearningPresentation,
): boolean {
  return presentation.evidence.length >
    0;
}

export function getPrimaryRecommendationAdaptiveLearningWarning(
  presentation:
    RecommendationAdaptiveLearningPresentation,
): string | null {
  return presentation.warnings[
    0
  ] ??
    null;
}

export function getPrimaryRecommendationAdaptiveLearningEvidence(
  presentation:
    RecommendationAdaptiveLearningPresentation,
): string | null {
  return presentation.evidence[
    0
  ] ??
    null;
}

/* ------------------------------------------------------------------ */
/* Display Helpers                                                    */
/* ------------------------------------------------------------------ */

function createTargetAwareDescription(
  params: {
    base:
      string;

    targets:
      readonly string[];

    prefix:
      string;
  },
): string {
  if (
    params.targets.length ===
    0
  ) {
    return params.base;
  }

  const formattedTargets =
    params.targets.map(
      formatIdentifier,
    );

  if (
    formattedTargets.length ===
    1
  ) {
    return `${params.prefix} ${formattedTargets[0]} ${
      params.base.charAt(
        0,
      ).toLowerCase() +
      params.base.slice(
        1,
      )
    }`;
  }

  return `${params.prefix} values ${joinNaturalLanguageList(
    formattedTargets,
  )} are represented by this pattern. ${params.base}`;
}

function createCountDescription(
  count:
    number,
  singular:
    string,
  plural:
    string,
): string {
  return `${count} ${
    count ===
    1
      ? singular
      : plural
  }`;
}

function formatPercentage(
  value:
    number,
): string {
  const normalized =
    clampUnitInterval(
      value,
    );

  return `${Math.round(
    normalized *
    100,
  )}%`;
}

function formatIdentifier(
  value:
    string,
): string {
  return value
    .split(
      "-",
    )
    .filter(
      (
        part,
      ) =>
        part.length >
        0,
    )
    .join(
      " ",
    );
}

function joinNaturalLanguageList(
  values:
    readonly string[],
): string {
  if (
    values.length ===
    0
  ) {
    return "";
  }

  if (
    values.length ===
    1
  ) {
    return values[
      0
    ] ??
      "";
  }

  if (
    values.length ===
    2
  ) {
    return `${values[0]} and ${values[1]}`;
  }

  const finalValue =
    values[
      values.length -
      1
    ];

  const leadingValues =
    values.slice(
      0,
      values.length -
      1,
    );

  return `${leadingValues.join(
    ", ",
  )}, and ${finalValue}`;
}

/* ------------------------------------------------------------------ */
/* Generic Helpers                                                    */
/* ------------------------------------------------------------------ */

function uniqueStrings(
  values:
    readonly string[],
): string[] {
  return Array.from(
    new Set(
      values,
    ),
  );
}

function clampUnitInterval(
  value:
    number,
): number {
  return Math.min(
    1,
    Math.max(
      0,
      value,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Generic Validation Helpers                                         */
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

function validateNullableString(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string | null {
  if (
    value ===
    null
  ) {
    return;
  }

  validateRequiredString(
    value,
    fieldName,
  );
}

function validateUniqueStringArray(
  values:
    readonly string[],
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

  const observed =
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
        observed.has(
          value,
        )
      ) {
        throw new Error(
          `${fieldName} must not contain duplicate value: ${value}.`,
        );
      }

      observed.add(
        value,
      );
    },
  );
}

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

  if (
    Number.isNaN(
      Date.parse(
        value,
      ),
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid timestamp.`,
    );
  }
}

function validateTimestampOrder(
  earlier:
    string,
  later:
    string,
  earlierFieldName:
    string,
  laterFieldName:
    string,
): void {
  if (
    Date.parse(
      earlier,
    ) >
    Date.parse(
      later,
    )
  ) {
    throw new Error(
      `${earlierFieldName} must not be later than ${laterFieldName}.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Runtime Adjustment Target Formatting                               */
/* ------------------------------------------------------------------ */

function formatRuntimeAdjustmentTarget(
  target:
    string,
): string {
  if (
    target.startsWith(
      "strategy:",
    )
  ) {
    return `${createStrategyDisplayLabel(
      target.slice(
        "strategy:".length,
      ),
    )} Strategy preference`;
  }

  if (
    target.startsWith(
      "decision:",
    )
  ) {
    return `${createRuntimeDecisionDisplayLabel(
      target.slice(
        "decision:".length,
      ),
    )} Runtime Decision preference`;
  }

  if (
    target.startsWith(
      "signal:",
    )
  ) {
    return `${createMemorySignalDisplayLabel(
      target.slice(
        "signal:".length,
      ),
    )} Memory Signal confidence`;
  }

  switch (
    target
  ) {
    case "global:evidence-requirement":
      return "the Recommendation evidence requirement";

    case "global:new-recommendation-threshold":
      return "the new Recommendation threshold";

    case "global:redirection-threshold":
      return "the Recommendation redirection threshold";

    case "global:stabilization-preference":
      return "the stabilization preference";

    case "global:recovery-preference":
      return "the recovery preference";

    default:
      return createTitleCaseLabel(
        target.replace(
          ":",
          "-",
        ),
      );
  }
}

/* ------------------------------------------------------------------ */
/* Part C — Derived Presentation Intelligence                         */
/* ------------------------------------------------------------------ */

/**
 * 현재 Adaptive Learning 상태에서 다음으로 기대할 수 있는
 * 관찰·학습 방향을 반환합니다.
 *
 * 이 값은 사용자의 행동을 지시하지 않습니다.
 * Runtime이 다음 Evidence에서 무엇을 계속 확인하게 되는지를
 * 설명합니다.
 */
export function createRecommendationAdaptiveLearningNextExpectation(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string {
  switch (
    analysis.state
  ) {
    case "unavailable":
      return "The Runtime will wait until comparable Recommendation outcomes become available.";

    case "insufficient":
      return "Additional Recommendation outcomes will help determine whether the observed behaviour forms a repeatable learning pattern.";

    case "observing":
      return "The Runtime will continue comparing Recommendation outcomes before forming a stable adaptation rule.";

    case "learning":
      return createLearningStateNextExpectation(
        analysis,
      );

    case "adapting":
      return createAdaptingStateNextExpectation(
        analysis,
      );

    case "stable":
      return createStableStateNextExpectation(
        analysis,
      );

    case "conflicted":
      return "Additional Recommendation outcomes are needed to determine which of the conflicting learning patterns remains consistent.";
  }
}

/* ------------------------------------------------------------------ */
/* State-specific Next Expectation                                    */
/* ------------------------------------------------------------------ */

function createLearningStateNextExpectation(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string {
  const primaryPattern =
    getPrimaryRecommendationLearningPattern(
      analysis.patterns,
    );

  if (
    primaryPattern ===
    null
  ) {
    return "The Runtime will continue observing whether the emerging learning evidence becomes repeatable.";
  }

  switch (
    primaryPattern.type
  ) {
    case "strategy-success":
    case "effective-stabilization":
    case "effective-recovery":
      return "The Runtime will continue testing whether the observed Strategy effectiveness remains consistent across future Recommendation outcomes.";

    case "strategy-failure":
    case "state-strategy-mismatch":
      return "The Runtime will continue checking whether the observed Strategy weakness is specific to the current context or persists across later outcomes.";

    case "decision-success":
      return "The Runtime will continue testing whether the observed Runtime Decision remains effective across future Recommendation outcomes.";

    case "decision-failure":
      return "The Runtime will continue checking whether this Runtime Decision repeatedly produces weak outcomes.";

    case "repeated-premature-advance":
      return "The Runtime will continue observing whether stronger progress or completion evidence improves Recommendation advancement timing.";

    case "persistent-over-observation":
      return "The Runtime will continue observing whether reduced evidence pressure leads to clearer Recommendation progress.";

    case "signal-overestimation":
    case "signal-underestimation":
      return "The Runtime will continue comparing this Memory Signal with later Recommendation outcomes to refine its reliability.";

    case "confidence-degradation":
    case "confidence-recovery":
      return "The Runtime will continue comparing confidence changes with later Recommendation outcomes.";

    case "conflicting-evidence":
      return "The Runtime will wait for additional outcomes before selecting a stable adaptation direction.";

    case "insufficient-evidence":
      return "More repeated Recommendation outcomes are needed before a stable learning conclusion can be formed.";
  }
}

function createAdaptingStateNextExpectation(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string {
  const adjustmentDescriptions =
    createRecommendationRuntimeAdjustmentDescriptions(
      analysis,
    );

  if (
    adjustmentDescriptions.length ===
    0
  ) {
    return "The Runtime will continue evaluating whether active adaptation rules produce consistent Recommendation outcomes.";
  }

  const primaryAdjustment =
    adjustmentDescriptions[
      0
    ];

  if (
    primaryAdjustment ===
    undefined
  ) {
    return "The Runtime will continue evaluating whether active adaptation rules produce consistent Recommendation outcomes.";
  }

  return `The Runtime will continue observing whether this adjustment remains effective: ${primaryAdjustment}`;
}

function createStableStateNextExpectation(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string {
  if (
    analysis.statistics.patternCount ===
      0
  ) {
    return "The Runtime will continue observing for newly emerging Recommendation learning patterns.";
  }

  return "The Runtime will preserve the current learning balance while monitoring for meaningful changes in Recommendation outcomes.";
}

/* ------------------------------------------------------------------ */
/* Presentation Highlights                                            */
/* ------------------------------------------------------------------ */

/**
 * UI 상단에 표시할 수 있는 핵심 Highlight를 생성합니다.
 *
 * 가장 중요한 의미가 앞에 오며 최대 5개만 반환합니다.
 */
export function createRecommendationAdaptiveLearningHighlights(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string[] {
  const highlights:
    PresentationHighlightCandidate[] = [];

  addStateHighlight(
    highlights,
    analysis,
  );

  addRuntimeAdjustmentHighlight(
    highlights,
    analysis,
  );

  addPrimaryPatternHighlight(
    highlights,
    analysis,
  );

  addStrategyHighlight(
    highlights,
    analysis,
  );

  addDecisionHighlight(
    highlights,
    analysis,
  );

  addSignalReliabilityHighlight(
    highlights,
    analysis,
  );

  addConfidenceHighlight(
    highlights,
    analysis,
  );

  return highlights
    .sort(
      comparePresentationHighlightCandidates,
    )
    .map(
      (
        candidate,
      ) =>
        candidate.description,
    )
    .filter(
      (
        description,
        index,
        descriptions,
      ) =>
        descriptions.indexOf(
          description,
        ) ===
        index,
    )
    .slice(
      0,
      5,
    );
}

type PresentationHighlightCandidate = {
  priority:
    number;

  confidence:
    number;

  description:
    string;
};

/* ------------------------------------------------------------------ */
/* State Highlight                                                    */
/* ------------------------------------------------------------------ */

function addStateHighlight(
  highlights:
    PresentationHighlightCandidate[],
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): void {
  switch (
    analysis.state
  ) {
    case "unavailable":
      return;

    case "insufficient":
      highlights.push({
        priority:
          80,

        confidence:
          analysis.scores.evidenceStrength,

        description:
          "Recommendation learning evidence is still limited.",
      });
      return;

    case "observing":
      highlights.push({
        priority:
          70,

        confidence:
          analysis.confidence,

        description:
          "Recommendation outcomes are being observed for repeatable patterns.",
      });
      return;

    case "learning":
      highlights.push({
        priority:
          85,

        confidence:
          analysis.confidence,

        description:
          "Recommendation learning patterns are beginning to emerge.",
      });
      return;

    case "adapting":
      highlights.push({
        priority:
          100,

        confidence:
          analysis.scores.adaptationReadiness,

        description:
          "Runtime adaptation is active.",
      });
      return;

    case "stable":
      highlights.push({
        priority:
          100,

        confidence:
          analysis.confidence,

        description:
          "Recommendation learning is stable.",
      });
      return;

    case "conflicted":
      highlights.push({
        priority:
          100,

        confidence:
          analysis.scores.conflictRisk,

        description:
          "Conflicting Recommendation evidence is limiting automatic adaptation.",
      });
      return;
  }
}

/* ------------------------------------------------------------------ */
/* Runtime Adjustment Highlight                                       */
/* ------------------------------------------------------------------ */

function addRuntimeAdjustmentHighlight(
  highlights:
    PresentationHighlightCandidate[],
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): void {
  const adjustmentSummary =
    summarizeRecommendationRuntimeAdjustment(
      analysis.runtimeAdjustment,
    );

  if (
    !adjustmentSummary.hasAdjustments
  ) {
    return;
  }

  const totalAdjustmentCount =
    adjustmentSummary.strategyAdjustmentCount +
    adjustmentSummary.decisionAdjustmentCount +
    adjustmentSummary.signalAdjustmentCount +
    adjustmentSummary.globalAdjustmentCount;

  highlights.push({
    priority:
      95,

    confidence:
      analysis.scores.adaptationReadiness,

    description:
      `${createCountDescription(
        totalAdjustmentCount,
        "Runtime adjustment is",
        "Runtime adjustments are",
      )} currently active.`,
  });

  const primaryAdjustment =
    getPrimaryRecommendationRuntimeAdjustmentDescription(
      analysis,
    );

  if (
    primaryAdjustment !==
    null
  ) {
    highlights.push({
      priority:
        90,

      confidence:
        Math.abs(
          adjustmentSummary.strongestAdjustment,
        ),

      description:
        primaryAdjustment,
    });
  }
}

/* ------------------------------------------------------------------ */
/* Primary Pattern Highlight                                          */
/* ------------------------------------------------------------------ */

function addPrimaryPatternHighlight(
  highlights:
    PresentationHighlightCandidate[],
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): void {
  const primaryPattern =
    getPrimaryRecommendationLearningPattern(
      analysis.patterns,
    );

  if (
    primaryPattern ===
    null
  ) {
    return;
  }

  highlights.push({
    priority:
      getPatternHighlightPriority(
        primaryPattern.type,
      ),

    confidence:
      primaryPattern.confidence,

    description:
      describePrimaryPatternHighlight(
        primaryPattern,
      ),
  });
}

function describePrimaryPatternHighlight(
  pattern:
    RecommendationLearningPattern,
): string {
  switch (
    pattern.type
  ) {
    case "strategy-success":
      return "Strategy effectiveness was repeatedly confirmed.";

    case "strategy-failure":
      return "A Strategy weakness was repeatedly detected.";

    case "decision-success":
      return "Runtime Decision effectiveness was repeatedly confirmed.";

    case "decision-failure":
      return "A Runtime Decision weakness was repeatedly detected.";

    case "state-strategy-mismatch":
      return "A context-dependent Strategy mismatch was detected.";

    case "repeated-premature-advance":
      return "Recommendation advancement may be occurring too early.";

    case "persistent-over-observation":
      return "Observation may be continuing without sufficient progress.";

    case "effective-stabilization":
      return "Stabilization repeatedly improved Recommendation quality.";

    case "effective-recovery":
      return "Recovery-oriented behaviour repeatedly improved Recommendation quality.";

    case "signal-overestimation":
      return "A Memory Signal may currently be overestimated.";

    case "signal-underestimation":
      return "A Memory Signal may currently be underestimated.";

    case "confidence-degradation":
      return "Recommendation confidence degradation was repeatedly observed.";

    case "confidence-recovery":
      return "Recommendation confidence recovery was repeatedly observed.";

    case "conflicting-evidence":
      return "Opposing learning evidence was detected.";

    case "insufficient-evidence":
      return "A stable learning pattern has not yet been established.";
  }
}

function getPatternHighlightPriority(
  type:
    RecommendationLearningPatternType,
): number {
  switch (
    type
  ) {
    case "conflicting-evidence":
      return 98;

    case "repeated-premature-advance":
      return 94;

    case "persistent-over-observation":
      return 92;

    case "state-strategy-mismatch":
      return 90;

    case "strategy-failure":
    case "decision-failure":
      return 88;

    case "signal-overestimation":
    case "confidence-degradation":
      return 86;

    case "effective-recovery":
    case "effective-stabilization":
      return 84;

    case "strategy-success":
    case "decision-success":
      return 82;

    case "signal-underestimation":
    case "confidence-recovery":
      return 80;

    case "insufficient-evidence":
      return 60;
  }
}

/* ------------------------------------------------------------------ */
/* Strategy Highlight                                                 */
/* ------------------------------------------------------------------ */

function addStrategyHighlight(
  highlights:
    PresentationHighlightCandidate[],
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): void {
  if (
    analysis.strategyProfiles.length ===
    0
  ) {
    return;
  }

  const strongestProfile =
    [...analysis.strategyProfiles].sort(
      (
        left,
        right,
      ) => {
        const leftStrength =
          left.overall.effectivenessScore *
          left.overall.confidence;

        const rightStrength =
          right.overall.effectivenessScore *
          right.overall.confidence;

        return rightStrength -
          leftStrength;
      },
    )[
      0
    ];

  if (
    strongestProfile ===
    undefined ||
    strongestProfile.overall.sampleCount ===
      0 ||
    strongestProfile.overall.confidence <
      0.6
  ) {
    return;
  }

  if (
    strongestProfile.overall.effectivenessScore >=
      0.7
  ) {
    highlights.push({
      priority:
        76,

      confidence:
        strongestProfile.overall.confidence,

      description:
        `${createStrategyDisplayLabel(
          strongestProfile.strategyType,
        )} Strategy currently shows the strongest constructive outcome pattern.`,
    });

    return;
  }

  if (
    strongestProfile.overall.effectivenessScore <=
      0.3
  ) {
    highlights.push({
      priority:
        78,

      confidence:
        strongestProfile.overall.confidence,

      description:
        `${createStrategyDisplayLabel(
          strongestProfile.strategyType,
        )} Strategy currently shows weak outcome effectiveness.`,
    });
  }
}

/* ------------------------------------------------------------------ */
/* Runtime Decision Highlight                                         */
/* ------------------------------------------------------------------ */

function addDecisionHighlight(
  highlights:
    PresentationHighlightCandidate[],
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): void {
  if (
    analysis.runtimeDecisionProfiles.length ===
    0
  ) {
    return;
  }

  const strongestProfile =
    [...analysis.runtimeDecisionProfiles].sort(
      (
        left,
        right,
      ) => {
        const leftStrength =
          left.effectiveness.effectivenessScore *
          left.effectiveness.confidence;

        const rightStrength =
          right.effectiveness.effectivenessScore *
          right.effectiveness.confidence;

        return rightStrength -
          leftStrength;
      },
    )[
      0
    ];

  if (
    strongestProfile ===
    undefined ||
    strongestProfile.effectiveness.sampleCount ===
      0 ||
    strongestProfile.effectiveness.confidence <
      0.6
  ) {
    return;
  }

  if (
    strongestProfile.effectiveness.effectivenessScore >=
      0.7
  ) {
    highlights.push({
      priority:
        72,

      confidence:
        strongestProfile.effectiveness.confidence,

      description:
        `${createRuntimeDecisionDisplayLabel(
          strongestProfile.decisionType,
        )} Runtime Decision currently shows the strongest constructive outcome pattern.`,
    });

    return;
  }

  if (
    strongestProfile.effectiveness.effectivenessScore <=
      0.3
  ) {
    highlights.push({
      priority:
        74,

      confidence:
        strongestProfile.effectiveness.confidence,

      description:
        `${createRuntimeDecisionDisplayLabel(
          strongestProfile.decisionType,
        )} Runtime Decision currently shows weak outcome effectiveness.`,
    });
  }
}

/* ------------------------------------------------------------------ */
/* Signal Reliability Highlight                                       */
/* ------------------------------------------------------------------ */

function addSignalReliabilityHighlight(
  highlights:
    PresentationHighlightCandidate[],
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): void {
  if (
    analysis.signalReliabilityProfiles.length ===
    0
  ) {
    return;
  }

  const strongestProfile =
    [...analysis.signalReliabilityProfiles].sort(
      (
        left,
        right,
      ) => {
        const leftStrength =
          left.reliabilityScore *
          left.confidence;

        const rightStrength =
          right.reliabilityScore *
          right.confidence;

        return rightStrength -
          leftStrength;
      },
    )[
      0
    ];

  if (
    strongestProfile ===
    undefined ||
    strongestProfile.sampleCount ===
      0 ||
    strongestProfile.confidence <
      0.6
  ) {
    return;
  }

  if (
    strongestProfile.reliabilityScore >=
      0.75
  ) {
    highlights.push({
      priority:
        70,

      confidence:
        strongestProfile.confidence,

      description:
        `${createMemorySignalDisplayLabel(
          strongestProfile.signalType,
        )} Memory Signal reliability was confirmed.`,
    });

    return;
  }

  if (
    strongestProfile.reliabilityScore <=
      0.35
  ) {
    highlights.push({
      priority:
        73,

      confidence:
        strongestProfile.confidence,

      description:
        `${createMemorySignalDisplayLabel(
          strongestProfile.signalType,
        )} Memory Signal reliability remains weak.`,
    });
  }
}

/* ------------------------------------------------------------------ */
/* Confidence Highlight                                               */
/* ------------------------------------------------------------------ */

function addConfidenceHighlight(
  highlights:
    PresentationHighlightCandidate[],
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): void {
  if (
    analysis.state ===
      "unavailable"
  ) {
    return;
  }

  if (
    analysis.confidence >=
      0.8
  ) {
    highlights.push({
      priority:
        65,

      confidence:
        analysis.confidence,

      description:
        `Adaptive learning confidence is high at ${formatPercentage(
          analysis.confidence,
        )}.`,
    });

    return;
  }

  if (
    analysis.confidence <
      0.4
  ) {
    highlights.push({
      priority:
        68,

      confidence:
        1 -
        analysis.confidence,

      description:
        `Adaptive learning confidence remains limited at ${formatPercentage(
          analysis.confidence,
        )}.`,
    });
  }
}

/* ------------------------------------------------------------------ */
/* Highlight Ordering                                                 */
/* ------------------------------------------------------------------ */

function comparePresentationHighlightCandidates(
  left:
    PresentationHighlightCandidate,
  right:
    PresentationHighlightCandidate,
): number {
  if (
    left.priority !==
    right.priority
  ) {
    return right.priority -
      left.priority;
  }

  if (
    !arePresentationNumbersApproximatelyEqual(
      left.confidence,
      right.confidence,
    )
  ) {
    return right.confidence -
      left.confidence;
  }

  return left.description.localeCompare(
    right.description,
  );
}

/* ------------------------------------------------------------------ */
/* Compact Summary                                                    */
/* ------------------------------------------------------------------ */

/**
 * Dashboard Card나 API의 짧은 설명에 사용할 수 있는 압축 Summary를
 * 생성합니다.
 */
export function createRecommendationAdaptiveLearningCompactSummary(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string {
  const {
    statistics,
  } = analysis;

  const counts =
    [
      createCountDescription(
        statistics.observationCount,
        "observation",
        "observations",
      ),

      createCountDescription(
        statistics.patternCount,
        "pattern",
        "patterns",
      ),

      createCountDescription(
        statistics.adaptationRuleCount,
        "rule",
        "rules",
      ),
    ].join(
      ", ",
    );

  switch (
    analysis.state
  ) {
    case "unavailable":
      return "Adaptive learning is unavailable because no comparable Recommendation outcomes exist.";

    case "insufficient":
      return `${counts}. More evidence is needed before a stable adaptation can be formed.`;

    case "observing":
      return `${counts}. Recommendation outcomes are still being observed.`;

    case "learning":
      return `${counts}. Repeatable Recommendation learning patterns are beginning to emerge.`;

    case "adapting":
      return `${counts}. Learned evidence is actively adjusting Runtime behaviour.`;

    case "stable":
      return `${counts}. Recommendation learning is stable and currently requires no additional adjustment.`;

    case "conflicted":
      return `${counts}. Conflicting evidence currently prevents automatic Runtime adaptation.`;
  }
}

/* ------------------------------------------------------------------ */
/* Presentation View Model                                            */
/* ------------------------------------------------------------------ */

/**
 * 기존 Presentation 계약을 변경하지 않으면서 UI에서 함께 사용할
 * 수 있는 파생 정보를 제공합니다.
 */
export type RecommendationAdaptiveLearningPresentationView = {
  presentation:
    RecommendationAdaptiveLearningPresentation;

  compactSummary:
    string;

  highlights:
    string[];

  nextExpectation:
    string;

  hasActiveRuntimeAdjustment:
    boolean;

  hasConflict:
    boolean;

  isStable:
    boolean;
};

export function createRecommendationAdaptiveLearningPresentationView(
  params:
    CreateRecommendationAdaptiveLearningPresentationParams,
): RecommendationAdaptiveLearningPresentationView {
  const presentation =
    createRecommendationAdaptiveLearningPresentation(
      params,
    );

  return {
    presentation,

    compactSummary:
      createRecommendationAdaptiveLearningCompactSummary(
        params.analysis,
      ),

    highlights:
      createRecommendationAdaptiveLearningHighlights(
        params.analysis,
      ),

    nextExpectation:
      createRecommendationAdaptiveLearningNextExpectation(
        params.analysis,
      ),

    hasActiveRuntimeAdjustment:
      hasActiveRecommendationRuntimeAdjustmentPresentation(
        params.analysis,
      ),

    hasConflict:
      hasAdaptiveLearningConflictPresentation(
        params.analysis,
      ),

    isStable:
      hasStableAdaptiveLearningPresentation(
        params.analysis,
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Public Query Helpers                                               */
/* ------------------------------------------------------------------ */

export function hasActiveRecommendationRuntimeAdjustmentPresentation(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): boolean {
  return (
    analysis.statistics.activeAdaptationRuleCount >
      0 &&
    hasRecommendationRuntimeAdjustmentDescriptions(
      analysis,
    )
  );
}

export function hasAdaptiveLearningConflictPresentation(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): boolean {
  return (
    analysis.state ===
      "conflicted" ||
    analysis.scores.conflictRisk >=
      0.4 ||
    analysis.statistics.conflictedAdaptationRuleCount >
      0 ||
    analysis.patterns.some(
      (
        pattern,
      ) =>
        pattern.type ===
        "conflicting-evidence",
    )
  );
}

export function hasStableAdaptiveLearningPresentation(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): boolean {
  return (
    analysis.state ===
      "stable"
  );
}

export function hasRecommendationAdaptiveLearningHighlights(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): boolean {
  return createRecommendationAdaptiveLearningHighlights(
    analysis,
  ).length >
    0;
}

export function getPrimaryRecommendationAdaptiveLearningHighlight(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string | null {
  return (
    createRecommendationAdaptiveLearningHighlights(
      analysis,
    )[
      0
    ] ??
    null
  );
}

export function getRecommendationAdaptiveLearningNextExpectation(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
): string {
  return createRecommendationAdaptiveLearningNextExpectation(
    analysis,
  );
}

/* ------------------------------------------------------------------ */
/* Enhanced Semantic Validation                                       */
/* ------------------------------------------------------------------ */

/**
 * Presentation의 문자열이 Analysis 의미와 모순되지 않는지
 * 교차 검증합니다.
 */
function validatePresentationSemanticConsistency(
  params: {
    analysis:
      RecommendationAdaptiveLearningAnalysis;

    presentation:
      RecommendationAdaptiveLearningPresentation;
  },
): void {
  const {
    analysis,
    presentation,
  } = params;

  validateHeadlineSemanticConsistency(
    analysis,
    presentation,
  );

  validateAdjustmentSemanticConsistency(
    analysis,
    presentation,
  );

  validateLearningObservationSemanticConsistency(
    analysis,
    presentation,
  );

  validateWarningSemanticConsistency(
    analysis,
    presentation,
  );

  validateEvidenceSemanticConsistency(
    analysis,
    presentation,
  );
}

/* ------------------------------------------------------------------ */
/* Headline Consistency                                               */
/* ------------------------------------------------------------------ */

function validateHeadlineSemanticConsistency(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
  presentation:
    RecommendationAdaptiveLearningPresentation,
): void {
  const headline =
    presentation.headline.toLowerCase();

  switch (
    analysis.state
  ) {
    case "unavailable":
      if (
        !headline.includes(
          "not available",
        )
      ) {
        throw new Error(
          "Unavailable Adaptive Learning Presentation headline must disclose unavailability.",
        );
      }
      return;

    case "insufficient":
      if (
        !headline.includes(
          "needed",
        ) &&
        !headline.includes(
          "insufficient",
        )
      ) {
        throw new Error(
          "Insufficient Adaptive Learning Presentation headline must disclose limited evidence.",
        );
      }
      return;

    case "observing":
      if (
        !headline.includes(
          "observ",
        )
      ) {
        throw new Error(
          "Observing Adaptive Learning Presentation headline must describe observation.",
        );
      }
      return;

    case "learning":
      if (
        !headline.includes(
          "learning",
        ) &&
        !headline.includes(
          "pattern",
        )
      ) {
        throw new Error(
          "Learning Adaptive Learning Presentation headline must describe emerging learning.",
        );
      }
      return;

    case "adapting":
      if (
        !headline.includes(
          "adjust",
        ) &&
        !headline.includes(
          "influenc",
        )
      ) {
        throw new Error(
          "Adapting Adaptive Learning Presentation headline must describe Runtime adjustment.",
        );
      }
      return;

    case "stable":
      if (
        !headline.includes(
          "stable",
        )
      ) {
        throw new Error(
          "Stable Adaptive Learning Presentation headline must disclose stability.",
        );
      }
      return;

    case "conflicted":
      if (
        !headline.includes(
          "conflict",
        )
      ) {
        throw new Error(
          "Conflicted Adaptive Learning Presentation headline must disclose conflicting evidence.",
        );
      }
      return;
  }
}

/* ------------------------------------------------------------------ */
/* Adjustment Consistency                                             */
/* ------------------------------------------------------------------ */

function validateAdjustmentSemanticConsistency(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
  presentation:
    RecommendationAdaptiveLearningPresentation,
): void {
  const hasAdjustments =
    summarizeRecommendationRuntimeAdjustment(
      analysis.runtimeAdjustment,
    ).hasAdjustments;

  if (
    hasAdjustments &&
    presentation.adjustmentDescription ===
      null
  ) {
    throw new Error(
      "Presentation must include adjustmentDescription when active Runtime adjustments exist.",
    );
  }

  if (
    analysis.state ===
      "adapting" &&
    (
      analysis.statistics.activeAdaptationRuleCount ===
        0 ||
      !hasAdjustments
    )
  ) {
    throw new Error(
      "Adapting Analysis state requires at least one active Rule and one Runtime adjustment.",
    );
  }

  if (
    presentation.adjustmentDescription ===
      null
  ) {
    return;
  }

  if (
    analysis.statistics.activeAdaptationRuleCount ===
      0 &&
    hasAdjustments
  ) {
    throw new Error(
      "Runtime adjustments must not exist when no active adaptation rule exists.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Learned Observation Consistency                                    */
/* ------------------------------------------------------------------ */

function validateLearningObservationSemanticConsistency(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
  presentation:
    RecommendationAdaptiveLearningPresentation,
): void {
  if (
    analysis.state ===
      "unavailable"
  ) {
    return;
  }

  const meaningfulPatterns =
    analysis.patterns.filter(
      (
        pattern,
      ) =>
        pattern.type !==
        "insufficient-evidence",
    );

  if (
    meaningfulPatterns.length >
      0 &&
    presentation.learnedObservation ===
      null
  ) {
    throw new Error(
      "Presentation must include learnedObservation when meaningful learning patterns exist.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Warning Consistency                                                */
/* ------------------------------------------------------------------ */

function validateWarningSemanticConsistency(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
  presentation:
    RecommendationAdaptiveLearningPresentation,
): void {
  if (
    hasAdaptiveLearningConflictPresentation(
      analysis,
    ) &&
    presentation.warnings.length ===
      0
  ) {
    throw new Error(
      "Presentation must include at least one warning when Adaptive Learning evidence is conflicted.",
    );
  }

  if (
    analysis.state ===
      "insufficient" &&
    !presentation.warnings.some(
      (
        warning,
      ) => {
        const normalized =
          warning.toLowerCase();

        return (
          normalized.includes(
            "sample",
          ) ||
          normalized.includes(
            "evidence",
          ) ||
          normalized.includes(
            "insufficient",
          )
        );
      },
    )
  ) {
    throw new Error(
      "Insufficient Adaptive Learning Presentation must disclose limited evidence in warnings.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Evidence Consistency                                               */
/* ------------------------------------------------------------------ */

function validateEvidenceSemanticConsistency(
  analysis:
    RecommendationAdaptiveLearningAnalysis,
  presentation:
    RecommendationAdaptiveLearningPresentation,
): void {
  if (
    analysis.statistics.observationCount >
      0 &&
    presentation.evidence.length ===
      0
  ) {
    throw new Error(
      "Presentation must include evidence when learning observations exist.",
    );
  }

  if (
    analysis.signals.length >
      0 &&
    presentation.evidence.length ===
      0
  ) {
    throw new Error(
      "Presentation must include evidence when Adaptive Learning signals exist.",
    );
  }

  if (
    presentation.evidence.length >
      MAXIMUM_PRESENTATION_EVIDENCE_COUNT
  ) {
    throw new Error(
      `Presentation evidence must not exceed ${MAXIMUM_PRESENTATION_EVIDENCE_COUNT} items.`,
    );
  }

  if (
    presentation.warnings.length >
      MAXIMUM_PRESENTATION_WARNING_COUNT
  ) {
    throw new Error(
      `Presentation warnings must not exceed ${MAXIMUM_PRESENTATION_WARNING_COUNT} items.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Presentation View Clone                                            */
/* ------------------------------------------------------------------ */

export function cloneRecommendationAdaptiveLearningPresentationView(
  view:
    RecommendationAdaptiveLearningPresentationView,
): RecommendationAdaptiveLearningPresentationView {
  return {
    presentation:
      cloneRecommendationAdaptiveLearningPresentation(
        view.presentation,
      ),

    compactSummary:
      view.compactSummary,

    highlights: [
      ...view.highlights,
    ],

    nextExpectation:
      view.nextExpectation,

    hasActiveRuntimeAdjustment:
      view.hasActiveRuntimeAdjustment,

    hasConflict:
      view.hasConflict,

    isStable:
      view.isStable,
  };
}