import type {
    CreateRecommendationEvolutionPresentationParams,
    RecommendationEvolutionPresentation,
    RecommendationEvolutionPresentationTone,
    RecommendationEvolutionResult,
    RecommendationEvolutionSignal,
    RecommendationLifecycleComparison,
} from "./recommendationEvolutionTypes";

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution 분석 결과를
 * 사용자에게 전달 가능한 Presentation 형태로 변환합니다.
 *
 * 이 함수는 분석 결과를 다시 계산하지 않습니다.
 *
 * 역할:
 *
 * RecommendationEvolutionResult
 *        ↓
 * 의미 우선순위 해석
 *        ↓
 * 사용자용 문구 생성
 *        ↓
 * RecommendationEvolutionPresentation
 *
 * 사용자에게 특정 행동을 강요하거나 방향을 지시하지 않고,
 * 현재 Recommendation 흐름에서 관찰되는 상태를 설명합니다.
 */
export function createRecommendationEvolutionPresentation(
  params: CreateRecommendationEvolutionPresentationParams,
): RecommendationEvolutionPresentation {
  validateParams(params);

  const {
    result,
  } = params;

  const latestComparison =
    getLatestComparableComparison(
      result,
    );

  const primarySignal =
    selectPrimarySignal(
      latestComparison,
    );

  const warnings =
    createWarnings(
      result,
    );

  const tone =
    resolvePresentationTone(
      result,
    );

  return {
    headline:
      createHeadline(
        result,
        latestComparison,
      ),

    overview:
      createOverview(
        result,
        latestComparison,
      ),

    stabilityLabel:
      createStabilityLabel(
        result,
      ),

    driftLabel:
      createDriftLabel(
        result,
      ),

    repeatPatternLabel:
      createRepeatPatternLabel(
        result,
      ),

    latestChangeLabel:
      createLatestChangeLabel(
        result,
        latestComparison,
      ),

    confidenceLabel:
      createConfidenceLabel(
        result,
      ),

    dataQualityLabel:
      createDataQualityLabel(
        result,
      ),

    totalRecommendationLabel:
      createTotalRecommendationLabel(
        result,
      ),

    completionRateLabel:
      createCompletionRateLabel(
        result,
      ),

    repetitionRateLabel:
      createRepetitionRateLabel(
        result,
      ),

    primarySignalTitle:
      createPrimarySignalTitle(
        primarySignal,
        latestComparison,
      ),

    primarySignalDescription:
      createPrimarySignalDescription(
        primarySignal,
        latestComparison,
      ),

    nextObservationFocus:
      createNextObservationFocus(
        result,
        latestComparison,
      ),

    warnings,

    tone,
  };
}

/* ------------------------------------------------------------------ */
/* Latest Comparison */
/* ------------------------------------------------------------------ */

/**
 * initial comparison은 이전 Recommendation이 없으므로
 * 실제 변화 비교에서 제외합니다.
 */
function getLatestComparableComparison(
  result:
    RecommendationEvolutionResult,
): RecommendationLifecycleComparison | null {
  for (
    let index =
      result.comparisons.length - 1;
    index >= 0;
    index -= 1
  ) {
    const comparison =
      result.comparisons[index];

    if (
      comparison !== undefined &&
      comparison.previous !== null
    ) {
      return comparison;
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Headline */
/* ------------------------------------------------------------------ */

function createHeadline(
  result:
    RecommendationEvolutionResult,
  latestComparison:
    RecommendationLifecycleComparison | null,
): string {
  if (
    result.dataQuality ===
    "insufficient"
  ) {
    return "Recommendation 변화를 아직 충분히 읽을 수 없습니다.";
  }

  if (
    latestComparison === null
  ) {
    return "첫 Recommendation이 기록되었습니다.";
  }

  switch (
    latestComparison.type
  ) {
    case "repeated":
      return "현재 Recommendation 방향이 계속 유지되고 있습니다.";

    case "refined":
      return "현재 Recommendation이 더 구체적인 형태로 발전했습니다.";

    case "expanded":
      return "현재 Recommendation의 범위가 확장되었습니다.";

    case "redirected":
      return "Recommendation의 방향이 새롭게 전환되었습니다.";

    case "completed-and-advanced":
      return "이전 Recommendation을 마치고 다음 단계로 이동했습니다.";

    case "superseded":
      return "이전 Recommendation이 새로운 방향으로 교체되었습니다.";

    case "initial":
      return "첫 Recommendation이 기록되었습니다.";

    default:
      return "Recommendation의 변화 흐름이 기록되었습니다.";
  }
}

/* ------------------------------------------------------------------ */
/* Overview */
/* ------------------------------------------------------------------ */

function createOverview(
  result:
    RecommendationEvolutionResult,
  latestComparison:
    RecommendationLifecycleComparison | null,
): string {
  const {
    statistics,
    summary,
  } = result;

  if (
    statistics.totalRecommendationCount ===
    0
  ) {
    return (
      "아직 Evolution 분석에 사용할 수 있는 " +
      "Recommendation Lifecycle 기록이 없습니다."
    );
  }

  if (
    latestComparison === null
  ) {
    return (
      "현재는 하나의 Recommendation만 기록되어 있어 " +
      "이전 Recommendation과의 변화는 아직 비교할 수 없습니다."
    );
  }

  const latestChange =
    createLatestChangeOverview(
      latestComparison,
    );

  const stability =
    createStabilityOverview(
      result,
    );

  const history =
    createHistoryOverview(
      result,
    );

  const parts =
    [
      latestChange,
      stability,
      history,
    ].filter(
      (
        part,
      ): part is string =>
        part.trim().length > 0,
    );

  if (
    parts.length === 0
  ) {
    return (
      "Recommendation History가 기록되고 있지만, " +
      "현재 흐름을 설명할 만큼 충분한 비교 신호는 아직 없습니다."
    );
  }

  if (
    !summary.hasSufficientHistory
  ) {
    parts.push(
      "장기적인 흐름을 판단하려면 Recommendation 기록이 더 필요합니다.",
    );
  }

  return parts.join(" ");
}

function createLatestChangeOverview(
  comparison:
    RecommendationLifecycleComparison,
): string {
  switch (
    comparison.type
  ) {
    case "repeated":
      return (
        "최근 Recommendation은 이전과 동일한 핵심 방향을 " +
        "유지하고 있습니다."
      );

    case "refined":
      return (
        "최근 Recommendation은 기존 방향을 유지하면서 " +
        "행동 범위나 근거가 더 구체화되었습니다."
      );

    case "expanded":
      return (
        "최근 Recommendation은 기존 방향을 유지하면서 " +
        "새로운 범위나 근거를 포함하기 시작했습니다."
      );

    case "redirected":
      return (
        "최근 Recommendation은 이전과 다른 대상이나 " +
        "행동 종류를 향하고 있습니다."
      );

    case "completed-and-advanced":
      return (
        "이전 Recommendation의 완료가 기록되었고, " +
        "그 다음 Recommendation으로 흐름이 이어졌습니다."
      );

    case "superseded":
      return (
        "이전 Recommendation은 완료되기 전에 종료되고, " +
        "새로운 Recommendation이 그 자리를 이어받았습니다."
      );

    case "initial":
      return (
        "현재 Recommendation은 Evolution History의 " +
        "첫 기록입니다."
      );

    default:
      return "";
  }
}

function createStabilityOverview(
  result:
    RecommendationEvolutionResult,
): string {
  switch (
    result.summary.stability
  ) {
    case "highly-stable":
      return (
        "여러 전환에서 Recommendation의 핵심 방향이 " +
        "매우 안정적으로 유지되고 있습니다."
      );

    case "stable":
      return (
        "Recommendation의 전체 방향은 비교적 안정적으로 " +
        "유지되고 있습니다."
      );

    case "developing":
      return (
        "Recommendation 방향은 아직 형성되는 과정에 있습니다."
      );

    case "unstable":
      return (
        "최근 기록에서는 Recommendation 방향의 전환이 " +
        "상대적으로 자주 나타납니다."
      );

    case "unknown":
    default:
      return "";
  }
}

function createHistoryOverview(
  result:
    RecommendationEvolutionResult,
): string {
  const {
    statistics,
  } = result;

  const total =
    statistics.totalRecommendationCount;

  const transitions =
    statistics.transitionCount;

  if (
    total <= 1
  ) {
    return (
      `현재 ${total}개의 Recommendation 기록이 분석에 포함되었습니다.`
    );
  }

  return (
    `총 ${total}개의 Recommendation과 ` +
    `${transitions}개의 변화 관계가 분석되었습니다.`
  );
}

/* ------------------------------------------------------------------ */
/* Primary Signal */
/* ------------------------------------------------------------------ */

/**
 * 최신 비교에서 사용자에게 가장 설명 가치가 높은 신호를 선택합니다.
 *
 * signal.weight가 높을수록 우선하지만,
 * 같은 weight에서는 원래 배열 순서를 유지합니다.
 */
function selectPrimarySignal(
  latestComparison:
    RecommendationLifecycleComparison | null,
): RecommendationEvolutionSignal | null {
  if (
    latestComparison === null ||
    latestComparison.signals.length === 0
  ) {
    return null;
  }

  let selected:
    RecommendationEvolutionSignal | null =
      null;

  for (
    const candidate of
    latestComparison.signals
  ) {
    if (
      selected === null ||
      candidate.weight >
        selected.weight
    ) {
      selected =
        candidate;
    }
  }

  return selected;
}

function createPrimarySignalTitle(
  signal:
    RecommendationEvolutionSignal | null,
  latestComparison:
    RecommendationLifecycleComparison | null,
): string {
  if (
    latestComparison === null
  ) {
    return "비교 가능한 이전 Recommendation 없음";
  }

  if (
    signal === null
  ) {
    return "주요 변화 신호 없음";
  }

  switch (
    signal.type
  ) {
    case "same-fingerprint":
      return "동일 Recommendation 반복";

    case "kind-changed":
      return "Recommendation 종류 변경";

    case "target-changed":
      return "Recommendation 대상 변경";

    case "title-changed":
      return "Recommendation 표현 변경";

    case "description-changed":
      return "Recommendation 설명 변경";

    case "confidence-increased":
      return "Recommendation 신뢰도 상승";

    case "confidence-decreased":
      return "Recommendation 신뢰도 하락";

    case "source-changed":
      return "Recommendation 출처 변경";

    case "why-changed":
      return "Recommendation 이유 변경";

    case "evidence-changed":
      return "Recommendation 근거 변경";

    case "signal-count-increased":
      return "근거 신호 증가";

    case "signal-count-decreased":
      return "근거 신호 감소";

    case "previous-completed":
      return "이전 Recommendation 완료";

    case "previous-superseded":
      return "이전 Recommendation 교체";

    case "lifecycle-linked":
      return "Lifecycle 연속성 확인";

    case "missing-comparison-data":
      return "비교 데이터 부족";

    default:
      return "Recommendation 변화 신호";
  }
}

function createPrimarySignalDescription(
  signal:
    RecommendationEvolutionSignal | null,
  latestComparison:
    RecommendationLifecycleComparison | null,
): string {
  if (
    latestComparison === null
  ) {
    return (
      "첫 Recommendation만 존재하므로 " +
      "이전 기록과의 차이를 아직 비교할 수 없습니다."
    );
  }

  if (
    signal === null
  ) {
    return (
      "최신 Recommendation에서 사용자에게 강조할 만큼 " +
      "명확한 변화 신호가 발견되지 않았습니다."
    );
  }

  return translateSignalDescription(
    signal,
  );
}

function translateSignalDescription(
  signal:
    RecommendationEvolutionSignal,
): string {
  switch (
    signal.type
  ) {
    case "same-fingerprint":
      return (
        "현재 Recommendation의 핵심 fingerprint가 " +
        "이전 Recommendation과 동일합니다."
      );

    case "kind-changed":
      return (
        "현재 Recommendation의 행동 종류가 " +
        "이전 기록과 달라졌습니다."
      );

    case "target-changed":
      return (
        "현재 Recommendation이 향하는 대상이 " +
        "이전 기록과 달라졌습니다."
      );

    case "title-changed":
      return (
        "Recommendation을 표현하는 제목이 변경되었습니다."
      );

    case "description-changed":
      return (
        "Recommendation의 구체적인 설명이 변경되었습니다."
      );

    case "confidence-increased":
      return (
        "현재 Recommendation은 이전보다 더 높은 " +
        "confidence로 생성되었습니다."
      );

    case "confidence-decreased":
      return (
        "현재 Recommendation의 confidence가 " +
        "이전보다 낮아졌습니다."
      );

    case "source-changed":
      return (
        "Recommendation을 생성한 주요 분석 출처가 변경되었습니다."
      );

    case "why-changed":
      return (
        "Recommendation을 제시한 이유가 이전과 달라졌습니다."
      );

    case "evidence-changed":
      return (
        "Recommendation을 뒷받침하는 근거가 변경되었습니다."
      );

    case "signal-count-increased":
      return (
        "현재 Recommendation을 뒷받침하는 근거 신호가 증가했습니다."
      );

    case "signal-count-decreased":
      return (
        "현재 Recommendation을 뒷받침하는 근거 신호가 감소했습니다."
      );

    case "previous-completed":
      return (
        "이전 Recommendation이 완료된 뒤 " +
        "현재 Recommendation으로 흐름이 이어졌습니다."
      );

    case "previous-superseded":
      return (
        "이전 Recommendation이 완료되기 전에 종료되고 " +
        "현재 Recommendation으로 교체되었습니다."
      );

    case "lifecycle-linked":
      return (
        "이전 Lifecycle과 현재 Lifecycle의 연결 관계가 " +
        "명시적으로 확인되었습니다."
      );

    case "missing-comparison-data":
      return (
        "현재 변화의 의미를 판단하기 위한 비교 정보가 충분하지 않습니다."
      );

    default:
      return signal.description;
  }
}

/* ------------------------------------------------------------------ */
/* Next Observation Focus */
/* ------------------------------------------------------------------ */

/**
 * 다음 행동을 지시하는 것이 아니라,
 * 다음 분석에서 관찰 가치가 높은 지점을 설명합니다.
 */
function createNextObservationFocus(
  result:
    RecommendationEvolutionResult,
  latestComparison:
    RecommendationLifecycleComparison | null,
): string | null {
  if (
    result.dataQuality ===
    "insufficient"
  ) {
    return (
      "다음 Recommendation이 활성화될 때 " +
      "Lifecycle 연결과 근거 신호가 함께 기록되는지 관찰합니다."
    );
  }

  if (
    latestComparison === null
  ) {
    return (
      "다음 Recommendation이 생성된 뒤 " +
      "현재 Recommendation과 어떤 관계를 형성하는지 관찰합니다."
    );
  }

  if (
    latestComparison.type ===
    "repeated"
  ) {
    if (
      result.summary.repeatPattern ===
      "persistent"
    ) {
      return (
        "같은 Recommendation이 계속 반복되는 이유와 " +
        "완료를 막는 조건이 존재하는지 관찰합니다."
      );
    }

    return (
      "현재 방향이 다음 Recommendation에서도 유지되는지 관찰합니다."
    );
  }

  if (
    latestComparison.type ===
      "redirected" ||
    latestComparison.type ===
      "superseded"
  ) {
    return (
      "새로운 방향이 일시적인 전환인지, " +
      "이후 Recommendation에서도 지속되는지 관찰합니다."
    );
  }

  if (
    latestComparison.type ===
    "refined"
  ) {
    return (
      "구체화된 Recommendation이 실제 완료 상태로 " +
      "이어지는지 관찰합니다."
    );
  }

  if (
    latestComparison.type ===
    "expanded"
  ) {
    return (
      "확장된 범위가 핵심 방향을 유지하는지, " +
      "새로운 분기로 이어지는지 관찰합니다."
    );
  }

  if (
    latestComparison.type ===
    "completed-and-advanced"
  ) {
    return (
      "새 Recommendation이 이전 완료 결과를 바탕으로 " +
      "자연스럽게 이어지는지 관찰합니다."
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Warnings */
/* ------------------------------------------------------------------ */

function createWarnings(
  result:
    RecommendationEvolutionResult,
): string[] {
  const warnings:
    string[] = [];

  if (
    result.statistics.totalRecommendationCount ===
    0
  ) {
    warnings.push(
      "Evolution 분석에 사용할 Recommendation 기록이 없습니다.",
    );
  }

  if (
    result.statistics.comparableRecommendationCount ===
    0 &&
    result.statistics.totalRecommendationCount >
    0
  ) {
    warnings.push(
      "이전 Recommendation과 비교 가능한 변화 기록이 아직 없습니다.",
    );
  }

  if (
    result.dataQuality ===
    "insufficient"
  ) {
    warnings.push(
      "일부 Lifecycle 또는 Recommendation 데이터가 부족해 분석 신뢰도가 낮습니다.",
    );
  }

  if (
    result.summary.stability ===
    "unstable"
  ) {
    warnings.push(
      "Recommendation 방향 전환이 반복적으로 관찰되고 있습니다.",
    );
  }

  if (
    result.summary.drift ===
      "high"
  ) {
    warnings.push(
      "최근 Recommendation 흐름에서 큰 방향 변화가 자주 나타납니다.",
    );
  }

  if (
    result.summary.repeatPattern ===
    "persistent"
  ) {
    warnings.push(
      "동일한 Recommendation이 여러 번 반복되고 있습니다.",
    );
  }

  if (
    result.statistics.supersessionRate >=
      0.5 &&
    result.statistics.supersededCount >=
      2
  ) {
    warnings.push(
      "완료되기 전에 교체된 Recommendation의 비율이 높습니다.",
    );
  }

  return warnings;
}

/* ------------------------------------------------------------------ */
/* Presentation Tone */
/* ------------------------------------------------------------------ */

function resolvePresentationTone(
  result:
    RecommendationEvolutionResult,
): RecommendationEvolutionPresentationTone {
  if (
    result.statistics.totalRecommendationCount ===
      0 ||
    result.dataQuality ===
      "insufficient"
  ) {
    return "unavailable";
  }

  if (
    result.summary.drift ===
      "high" ||
    result.summary.stability ===
      "unstable" ||
    result.summary.repeatPattern ===
      "persistent"
  ) {
    return "attention";
  }

  if (
    result.summary.latestType ===
      "completed-and-advanced" ||
    result.summary.latestType ===
      "refined" ||
    result.summary.latestType ===
      "expanded"
  ) {
    return "progressing";
  }

  if (
    result.summary.stability ===
      "stable" ||
    result.summary.stability ===
      "highly-stable" ||
    result.summary.latestType ===
      "repeated"
  ) {
    return "stable";
  }

  return "neutral";
}

/* ------------------------------------------------------------------ */
/* Stability Label */
/* ------------------------------------------------------------------ */

function createStabilityLabel(
  result:
    RecommendationEvolutionResult,
): string {
  switch (
    result.summary.stability
  ) {
    case "highly-stable":
      return "매우 안정적";

    case "stable":
      return "안정적";

    case "developing":
      return "형성 중";

    case "unstable":
      return "변화가 잦음";

    case "unknown":
    default:
      return "판단할 기록 부족";
  }
}

/* ------------------------------------------------------------------ */
/* Drift Label */
/* ------------------------------------------------------------------ */

function createDriftLabel(
  result:
    RecommendationEvolutionResult,
): string {
  switch (
    result.summary.drift
  ) {
    case "none":
      return "방향 변화 없음";

    case "low":
      return "낮은 방향 변화";

    case "moderate":
      return "중간 수준의 방향 변화";

    case "high":
      return "큰 방향 변화";

    case "unknown":
    default:
      return "판단할 기록 부족";
  }
}

/* ------------------------------------------------------------------ */
/* Repeat Pattern Label */
/* ------------------------------------------------------------------ */

function createRepeatPatternLabel(
  result:
    RecommendationEvolutionResult,
): string {
  switch (
    result.summary.repeatPattern
  ) {
    case "none":
      return "반복 없음";

    case "occasional":
      return "간헐적 반복";

    case "persistent":
      return "지속적 반복";

    case "unknown":
    default:
      return "판단할 기록 부족";
  }
}

/* ------------------------------------------------------------------ */
/* Latest Change Label */
/* ------------------------------------------------------------------ */

function createLatestChangeLabel(
  result:
    RecommendationEvolutionResult,
  latestComparison:
    RecommendationLifecycleComparison | null,
): string {
  if (
    result.statistics
      .totalRecommendationCount ===
    0
  ) {
    return "기록 없음";
  }

  if (
    latestComparison === null
  ) {
    return "첫 Recommendation";
  }

  const magnitudeLabel =
    createMagnitudeLabel(
      latestComparison.magnitude,
    );

  switch (
    latestComparison.type
  ) {
    case "repeated":
      return "동일 방향 유지";

    case "refined":
      return appendMagnitude(
        "Recommendation 구체화",
        magnitudeLabel,
      );

    case "expanded":
      return appendMagnitude(
        "Recommendation 범위 확장",
        magnitudeLabel,
      );

    case "redirected":
      return appendMagnitude(
        "Recommendation 방향 전환",
        magnitudeLabel,
      );

    case "completed-and-advanced":
      return appendMagnitude(
        "완료 후 다음 단계 이동",
        magnitudeLabel,
      );

    case "superseded":
      return appendMagnitude(
        "이전 Recommendation 교체",
        magnitudeLabel,
      );

    case "initial":
      return "첫 Recommendation";

    default:
      return "변화 기록됨";
  }
}

function createMagnitudeLabel(
  magnitude:
    RecommendationLifecycleComparison["magnitude"],
): string | null {
  switch (magnitude) {
    case "minor":
      return "작은 변화";

    case "moderate":
      return "중간 변화";

    case "major":
      return "큰 변화";

    case "none":
    default:
      return null;
  }
}

function appendMagnitude(
  label:
    string,
  magnitudeLabel:
    string | null,
): string {
  if (
    magnitudeLabel === null
  ) {
    return label;
  }

  return (
    `${label} · ${magnitudeLabel}`
  );
}

/* ------------------------------------------------------------------ */
/* Confidence Label */
/* ------------------------------------------------------------------ */

function createConfidenceLabel(
  result:
    RecommendationEvolutionResult,
): string {
  switch (
    result.confidence
  ) {
    case "high":
      return "높은 분석 신뢰도";

    case "medium":
      return "중간 분석 신뢰도";

    case "low":
    default:
      return "낮은 분석 신뢰도";
  }
}

/* ------------------------------------------------------------------ */
/* Data Quality Label */
/* ------------------------------------------------------------------ */

function createDataQualityLabel(
  result:
    RecommendationEvolutionResult,
): string {
  switch (
    result.dataQuality
  ) {
    case "sufficient":
      return "충분한 비교 데이터";

    case "partial":
      return "일부 비교 데이터";

    case "insufficient":
    default:
      return "비교 데이터 부족";
  }
}

/* ------------------------------------------------------------------ */
/* Total Recommendation Label */
/* ------------------------------------------------------------------ */

function createTotalRecommendationLabel(
  result:
    RecommendationEvolutionResult,
): string {
  const {
    totalRecommendationCount,
    transitionCount,
  } = result.statistics;

  if (
    totalRecommendationCount === 0
  ) {
    return "Recommendation 기록 없음";
  }

  if (
    totalRecommendationCount === 1
  ) {
    return "Recommendation 1개";
  }

  return (
    `Recommendation ${totalRecommendationCount}개 · ` +
    `변화 관계 ${transitionCount}개`
  );
}

/* ------------------------------------------------------------------ */
/* Completion Rate Label */
/* ------------------------------------------------------------------ */

function createCompletionRateLabel(
  result:
    RecommendationEvolutionResult,
): string {
  const {
    completedCount,
    supersededCount,
    completionRate,
  } = result.statistics;

  const resolvedCount =
    completedCount +
    supersededCount;

  if (
    resolvedCount === 0
  ) {
    return "완료율 계산 전";
  }

  return (
    `완료율 ${formatPercentage(completionRate)} ` +
    `(${completedCount}/${resolvedCount})`
  );
}

/* ------------------------------------------------------------------ */
/* Repetition Rate Label */
/* ------------------------------------------------------------------ */

function createRepetitionRateLabel(
  result:
    RecommendationEvolutionResult,
): string {
  const {
    comparableRecommendationCount,
    repeatedTransitionCount,
    repetitionRate,
  } = result.statistics;

  if (
    comparableRecommendationCount ===
    0
  ) {
    return "반복률 계산 전";
  }

  return (
    `반복률 ${formatPercentage(repetitionRate)} ` +
    `(${repeatedTransitionCount}/${comparableRecommendationCount})`
  );
}

/* ------------------------------------------------------------------ */
/* Percentage Formatting */
/* ------------------------------------------------------------------ */

function formatPercentage(
  ratio:
    number,
): string {
  const percentage =
    ratio *
    100;

  if (
    Number.isInteger(percentage)
  ) {
    return `${percentage}%`;
  }

  return (
    `${percentage.toFixed(1)}%`
  );
}

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

function validateParams(
  params:
    CreateRecommendationEvolutionPresentationParams,
): void {
  if (
    params === null ||
    typeof params !== "object"
  ) {
    throw new Error(
      "params must be a valid CreateRecommendationEvolutionPresentationParams object.",
    );
  }

  validateResult(
    params.result,
  );
}

function validateResult(
  result:
    RecommendationEvolutionResult,
): void {
  if (
    result === null ||
    typeof result !== "object"
  ) {
    throw new Error(
      "result must be a valid RecommendationEvolutionResult.",
    );
  }

  if (
    result.version !== 1
  ) {
    throw new Error(
      "result.version must be 1.",
    );
  }

  assertNonEmptyString(
    result.historyId,
    "result.historyId",
  );

  assertParsableTimestamp(
    result.analyzedAt,
    "result.analyzedAt",
  );

  validateComparisons(
    result.comparisons,
  );

  validateStatistics(
    result.statistics,
  );

  validateSummary(
    result.summary,
  );

  validateResultEnums(
    result,
  );

  validateResultConsistency(
    result,
  );
}

/* ------------------------------------------------------------------ */
/* Comparison Validation */
/* ------------------------------------------------------------------ */

function validateComparisons(
  comparisons:
    RecommendationEvolutionResult["comparisons"],
): void {
  if (
    !Array.isArray(
      comparisons,
    )
  ) {
    throw new Error(
      "result.comparisons must be an array.",
    );
  }

  const comparisonIds =
    new Set<string>();

  for (
    let index = 0;
    index < comparisons.length;
    index += 1
  ) {
    const comparison =
      comparisons[index];

    if (
      comparison === undefined
    ) {
      throw new Error(
        `result.comparisons[${index}] is missing.`,
      );
    }

    validateComparison(
      comparison,
      index,
    );

    if (
      comparisonIds.has(
        comparison.id,
      )
    ) {
      throw new Error(
        `Duplicate comparison ID "${comparison.id}".`,
      );
    }

    comparisonIds.add(
      comparison.id,
    );
  }

  validateComparisonSequence(
    comparisons,
  );
}

function validateComparison(
  comparison:
    RecommendationLifecycleComparison,
  index:
    number,
): void {
  if (
    comparison === null ||
    typeof comparison !== "object"
  ) {
    throw new Error(
      `result.comparisons[${index}] must be a valid comparison object.`,
    );
  }

  assertNonEmptyString(
    comparison.id,
    `result.comparisons[${index}].id`,
  );

  assertParsableTimestamp(
    comparison.comparedAt,
    `result.comparisons[${index}].comparedAt`,
  );

  validateEvolutionType(
    comparison.type,
    `result.comparisons[${index}].type`,
  );

  validateMagnitude(
    comparison.magnitude,
    `result.comparisons[${index}].magnitude`,
  );

  validateDirection(
    comparison.direction,
    `result.comparisons[${index}].direction`,
  );

  validateConfidence(
    comparison.confidence,
    `result.comparisons[${index}].confidence`,
  );

  validateDataQuality(
    comparison.dataQuality,
    `result.comparisons[${index}].dataQuality`,
  );

  assertBoolean(
    comparison.isRepeated,
    `result.comparisons[${index}].isRepeated`,
  );

  assertBoolean(
    comparison.isCompletionAdvance,
    `result.comparisons[${index}].isCompletionAdvance`,
  );

  assertBoolean(
    comparison.isSupersession,
    `result.comparisons[${index}].isSupersession`,
  );

  assertBoolean(
    comparison.targetChanged,
    `result.comparisons[${index}].targetChanged`,
  );

  assertBoolean(
    comparison.kindChanged,
    `result.comparisons[${index}].kindChanged`,
  );

  assertBoolean(
    comparison.confidenceChanged,
    `result.comparisons[${index}].confidenceChanged`,
  );

  if (
    !Array.isArray(
      comparison.fieldChanges,
    )
  ) {
    throw new Error(
      `result.comparisons[${index}].fieldChanges must be an array.`,
    );
  }

  if (
    !Array.isArray(
      comparison.signals,
    )
  ) {
    throw new Error(
      `result.comparisons[${index}].signals must be an array.`,
    );
  }

  validateSignals(
    comparison.signals,
    `result.comparisons[${index}].signals`,
  );

  validateComparisonSnapshots(
    comparison,
    index,
  );

  validateComparisonFlags(
    comparison,
    index,
  );

  validateComparisonSignalConsistency(
    comparison,
    index,
  );
}

function validateComparisonSnapshots(
  comparison:
    RecommendationLifecycleComparison,
  index:
    number,
): void {
  validateSnapshot(
    comparison.current,
    `result.comparisons[${index}].current`,
  );

  if (
    comparison.previous !== null
  ) {
    validateSnapshot(
      comparison.previous,
      `result.comparisons[${index}].previous`,
    );
  }

  if (
    comparison.type === "initial" &&
    comparison.previous !== null
  ) {
    throw new Error(
      `result.comparisons[${index}] with type "initial" must have previous=null.`,
    );
  }

  if (
    comparison.type !== "initial" &&
    comparison.previous === null
  ) {
    throw new Error(
      `result.comparisons[${index}] without a previous snapshot must use type "initial".`,
    );
  }
}

function validateSnapshot(
  snapshot:
    RecommendationLifecycleComparison["current"],
  fieldName:
    string,
): void {
  if (
    snapshot === null ||
    typeof snapshot !== "object"
  ) {
    throw new Error(
      `${fieldName} must be a valid RecommendationEvolutionSnapshot.`,
    );
  }

  assertNonEmptyString(
    snapshot.lifecycleId,
    `${fieldName}.lifecycleId`,
  );

  assertNonEmptyString(
    snapshot.recommendationId,
    `${fieldName}.recommendationId`,
  );

  assertNonEmptyString(
    snapshot.fingerprint,
    `${fieldName}.fingerprint`,
  );

  assertNonEmptyString(
    snapshot.title,
    `${fieldName}.title`,
  );

  assertNonEmptyString(
    snapshot.description,
    `${fieldName}.description`,
  );

  assertNonEmptyString(
    snapshot.sourceLabel,
    `${fieldName}.sourceLabel`,
  );

  assertParsableTimestamp(
    snapshot.createdAt,
    `${fieldName}.createdAt`,
  );

  assertOptionalIsoTimestamp(
    snapshot.activatedAt,
    `${fieldName}.activatedAt`,
  );

  assertOptionalIsoTimestamp(
    snapshot.resolvedAt,
    `${fieldName}.resolvedAt`,
  );

  assertNonNegativeInteger(
    snapshot.signalCount,
    `${fieldName}.signalCount`,
  );
}

function validateComparisonFlags(
  comparison:
    RecommendationLifecycleComparison,
  index:
    number,
): void {
  if (
    comparison.type === "repeated" &&
    !comparison.isRepeated
  ) {
    throw new Error(
      `result.comparisons[${index}] with type "repeated" must have isRepeated=true.`,
    );
  }

  if (
    comparison.isRepeated &&
    comparison.type !==
      "repeated"
  ) {
    throw new Error(
      `result.comparisons[${index}] with isRepeated=true must use type "repeated".`,
    );
  }

  if (
    comparison.isRepeated &&
    comparison.previous !== null &&
    comparison.previous.fingerprint !==
      comparison.current.fingerprint
  ) {
    throw new Error(
      `result.comparisons[${index}] marked as repeated must have matching fingerprints.`,
    );
  }

  if (
    comparison.type ===
      "completed-and-advanced" &&
    !comparison.isCompletionAdvance
  ) {
    throw new Error(
      `result.comparisons[${index}] with type "completed-and-advanced" must have isCompletionAdvance=true.`,
    );
  }

  if (
    comparison.type ===
      "superseded" &&
    !comparison.isSupersession
  ) {
    throw new Error(
      `result.comparisons[${index}] with type "superseded" must have isSupersession=true.`,
    );
  }

  if (
    comparison.type ===
      "redirected" &&
    !comparison.targetChanged &&
    !comparison.kindChanged
  ) {
    throw new Error(
      `result.comparisons[${index}] with type "redirected" must change target or kind.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Comparison Sequence Validation */
/* ------------------------------------------------------------------ */

function validateComparisonSequence(
  comparisons:
    RecommendationLifecycleComparison[],
): void {
  if (
    comparisons.length === 0
  ) {
    return;
  }

  const first =
    comparisons[0];

  if (
    first === undefined
  ) {
    throw new Error(
      "The first comparison is missing.",
    );
  }

  if (
    first.previous !== null ||
    first.type !== "initial"
  ) {
    throw new Error(
      "The first comparison must be an initial comparison with previous=null.",
    );
  }

  for (
    let index = 1;
    index < comparisons.length;
    index += 1
  ) {
    const previousComparison =
      comparisons[index - 1];

    const currentComparison =
      comparisons[index];

    if (
      previousComparison === undefined ||
      currentComparison === undefined
    ) {
      throw new Error(
        `Comparison sequence is incomplete at index ${index}.`,
      );
    }

    if (
      currentComparison.previous === null
    ) {
      throw new Error(
        `result.comparisons[${index}] must include a previous snapshot.`,
      );
    }

    if (
      currentComparison.previous.lifecycleId !==
      previousComparison.current.lifecycleId
    ) {
      throw new Error(
        `result.comparisons[${index}] is not connected to the preceding comparison.`,
      );
    }

    const previousCreatedAt =
      Date.parse(
        previousComparison.current.createdAt,
      );

    const currentCreatedAt =
      Date.parse(
        currentComparison.current.createdAt,
      );

    if (
      currentCreatedAt <
      previousCreatedAt
    ) {
      throw new Error(
        `result.comparisons[${index}] is ordered before the preceding lifecycle.`,
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Statistics Validation */
/* ------------------------------------------------------------------ */

function validateStatistics(
  statistics:
    RecommendationEvolutionResult["statistics"],
): void {
  if (
    statistics === null ||
    typeof statistics !== "object"
  ) {
    throw new Error(
      "result.statistics must be a valid object.",
    );
  }

  assertNonNegativeInteger(
    statistics.totalRecommendationCount,
    "result.statistics.totalRecommendationCount",
  );

  assertNonNegativeInteger(
    statistics.comparableRecommendationCount,
    "result.statistics.comparableRecommendationCount",
  );

  assertNonNegativeInteger(
    statistics.transitionCount,
    "result.statistics.transitionCount",
  );

  assertNonNegativeInteger(
    statistics.activeCount,
    "result.statistics.activeCount",
  );

  assertNonNegativeInteger(
    statistics.completedCount,
    "result.statistics.completedCount",
  );

  assertNonNegativeInteger(
    statistics.supersededCount,
    "result.statistics.supersededCount",
  );

  assertNonNegativeInteger(
    statistics.archivedCount,
    "result.statistics.archivedCount",
  );

  assertNonNegativeInteger(
    statistics.repeatedTransitionCount,
    "result.statistics.repeatedTransitionCount",
  );

  assertNonNegativeInteger(
    statistics.changedTransitionCount,
    "result.statistics.changedTransitionCount",
  );

  assertNonNegativeInteger(
    statistics.refinedTransitionCount,
    "result.statistics.refinedTransitionCount",
  );

  assertNonNegativeInteger(
    statistics.redirectedTransitionCount,
    "result.statistics.redirectedTransitionCount",
  );

  assertNonNegativeInteger(
    statistics.completionAdvanceCount,
    "result.statistics.completionAdvanceCount",
  );

  assertRatio(
    statistics.completionRate,
    "result.statistics.completionRate",
  );

  assertRatio(
    statistics.supersessionRate,
    "result.statistics.supersessionRate",
  );

  assertRatio(
    statistics.repetitionRate,
    "result.statistics.repetitionRate",
  );

  if (
    statistics.averageActiveDurationMs !==
    null
  ) {
    assertNonNegativeFiniteNumber(
      statistics.averageActiveDurationMs,
      "result.statistics.averageActiveDurationMs",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Summary Validation */
/* ------------------------------------------------------------------ */

function validateSummary(
  summary:
    RecommendationEvolutionResult["summary"],
): void {
  if (
    summary === null ||
    typeof summary !== "object"
  ) {
    throw new Error(
      "result.summary must be a valid object.",
    );
  }

  validateStability(
    summary.stability,
    "result.summary.stability",
  );

  validateDrift(
    summary.drift,
    "result.summary.drift",
  );

  validateRepeatPattern(
    summary.repeatPattern,
    "result.summary.repeatPattern",
  );

  if (
    summary.dominantType !== null
  ) {
    validateEvolutionType(
      summary.dominantType,
      "result.summary.dominantType",
    );
  }

  if (
    summary.dominantDirection !==
    null
  ) {
    validateDirection(
      summary.dominantDirection,
      "result.summary.dominantDirection",
    );
  }

  if (
    summary.latestType !== null
  ) {
    validateEvolutionType(
      summary.latestType,
      "result.summary.latestType",
    );
  }

  if (
    summary.latestDirection !==
    null
  ) {
    validateDirection(
      summary.latestDirection,
      "result.summary.latestDirection",
    );
  }

  if (
    summary.latestMagnitude !==
    null
  ) {
    validateMagnitude(
      summary.latestMagnitude,
      "result.summary.latestMagnitude",
    );
  }

  assertBoolean(
    summary.recommendationChanged,
    "result.summary.recommendationChanged",
  );

  assertBoolean(
    summary.hasMeaningfulEvolution,
    "result.summary.hasMeaningfulEvolution",
  );

  assertBoolean(
    summary.hasSufficientHistory,
    "result.summary.hasSufficientHistory",
  );
}

/* ------------------------------------------------------------------ */
/* Result Enum Validation */
/* ------------------------------------------------------------------ */

function validateResultEnums(
  result:
    RecommendationEvolutionResult,
): void {
  validateDataQuality(
    result.dataQuality,
    "result.dataQuality",
  );

  validateConfidence(
    result.confidence,
    "result.confidence",
  );
}

/* ------------------------------------------------------------------ */
/* Result Consistency */
/* ------------------------------------------------------------------ */

function validateResultConsistency(
  result:
    RecommendationEvolutionResult,
): void {
  const {
    comparisons,
    statistics,
    summary,
  } = result;

  const comparableComparisons =
    comparisons.filter(
      (comparison) =>
        comparison.previous !== null,
    );

  if (
    statistics.totalRecommendationCount !==
    comparisons.length
  ) {
    throw new Error(
      "statistics.totalRecommendationCount must match comparisons.length.",
    );
  }

  if (
    statistics.comparableRecommendationCount !==
    comparableComparisons.length
  ) {
    throw new Error(
      "statistics.comparableRecommendationCount must match the number of comparable comparisons.",
    );
  }

  if (
    statistics.transitionCount !==
    comparableComparisons.length
  ) {
    throw new Error(
      "statistics.transitionCount must match the number of comparable comparisons.",
    );
  }

  const repeatedCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.type === "repeated",
    ).length;

  if (
    statistics.repeatedTransitionCount !==
    repeatedCount
  ) {
    throw new Error(
      "statistics.repeatedTransitionCount does not match comparison data.",
    );
  }

  const changedCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.type !== "repeated",
    ).length;

  if (
    statistics.changedTransitionCount !==
    changedCount
  ) {
    throw new Error(
      "statistics.changedTransitionCount does not match comparison data.",
    );
  }

  const refinedCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.type === "refined",
    ).length;

  if (
    statistics.refinedTransitionCount !==
    refinedCount
  ) {
    throw new Error(
      "statistics.refinedTransitionCount does not match comparison data.",
    );
  }

  const redirectedCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.type === "redirected",
    ).length;

  if (
    statistics.redirectedTransitionCount !==
    redirectedCount
  ) {
    throw new Error(
      "statistics.redirectedTransitionCount does not match comparison data.",
    );
  }

  const completionAdvanceCount =
    comparableComparisons.filter(
      (comparison) =>
        comparison.type ===
        "completed-and-advanced",
    ).length;

  if (
    statistics.completionAdvanceCount !==
    completionAdvanceCount
  ) {
    throw new Error(
      "statistics.completionAdvanceCount does not match comparison data.",
    );
  }

  validateRateConsistency(
    result,
  );

  validateLatestSummaryConsistency(
    result,
  );

  validateHistorySufficiency(
    summary.hasSufficientHistory,
    statistics.comparableRecommendationCount,
  );
}

function validateRateConsistency(
  result:
    RecommendationEvolutionResult,
): void {
  const {
    statistics,
  } = result;

  const expectedRepetitionRate =
    statistics.comparableRecommendationCount ===
    0
      ? 0
      : statistics.repeatedTransitionCount /
        statistics.comparableRecommendationCount;

  assertApproximatelyEqual(
    statistics.repetitionRate,
    expectedRepetitionRate,
    "result.statistics.repetitionRate",
  );

  const resolvedCount =
    statistics.completedCount +
    statistics.supersededCount;

  const expectedCompletionRate =
    resolvedCount === 0
      ? 0
      : statistics.completedCount /
        resolvedCount;

  const expectedSupersessionRate =
    resolvedCount === 0
      ? 0
      : statistics.supersededCount /
        resolvedCount;

  assertApproximatelyEqual(
    statistics.completionRate,
    expectedCompletionRate,
    "result.statistics.completionRate",
  );

  assertApproximatelyEqual(
    statistics.supersessionRate,
    expectedSupersessionRate,
    "result.statistics.supersessionRate",
  );
}

function validateLatestSummaryConsistency(
  result:
    RecommendationEvolutionResult,
): void {
  const latestComparison =
    getLatestComparableComparison(
      result,
    );

  const {
    summary,
  } = result;

  if (
    latestComparison === null
  ) {
    if (
      summary.latestType !== null ||
      summary.latestDirection !== null ||
      summary.latestMagnitude !== null
    ) {
      throw new Error(
        "Latest summary fields must be null when no comparable comparison exists.",
      );
    }

    if (
      summary.recommendationChanged
    ) {
      throw new Error(
        "summary.recommendationChanged must be false when no comparable comparison exists.",
      );
    }

    return;
  }

  if (
    summary.latestType !==
    latestComparison.type
  ) {
    throw new Error(
      "summary.latestType must match the latest comparable comparison.",
    );
  }

  if (
    summary.latestDirection !==
    latestComparison.direction
  ) {
    throw new Error(
      "summary.latestDirection must match the latest comparable comparison.",
    );
  }

  if (
    summary.latestMagnitude !==
    latestComparison.magnitude
  ) {
    throw new Error(
      "summary.latestMagnitude must match the latest comparable comparison.",
    );
  }

  const expectedRecommendationChanged =
    latestComparison.type !==
    "repeated";

  if (
    summary.recommendationChanged !==
    expectedRecommendationChanged
  ) {
    throw new Error(
      "summary.recommendationChanged does not match the latest comparison.",
    );
  }
}

function validateHistorySufficiency(
  hasSufficientHistory:
    boolean,
  comparableRecommendationCount:
    number,
): void {
  const expected =
    comparableRecommendationCount >=
    2;

  if (
    hasSufficientHistory !==
    expected
  ) {
    throw new Error(
      "summary.hasSufficientHistory must be true when at least two comparable transitions exist.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Enum Validators */
/* ------------------------------------------------------------------ */

function validateEvolutionType(
  value:
    unknown,
  fieldName:
    string,
): void {
  const validValues = [
    "initial",
    "repeated",
    "refined",
    "expanded",
    "redirected",
    "completed-and-advanced",
    "superseded",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

function validateMagnitude(
  value:
    unknown,
  fieldName:
    string,
): void {
  const validValues = [
    "none",
    "minor",
    "moderate",
    "major",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

function validateDirection(
  value:
    unknown,
  fieldName:
    string,
): void {
  const validValues = [
    "stable",
    "narrowing",
    "broadening",
    "advancing",
    "redirecting",
    "unresolved",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

function validateConfidence(
  value:
    unknown,
  fieldName:
    string,
): void {
  const validValues = [
    "low",
    "medium",
    "high",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

function validateDataQuality(
  value:
    unknown,
  fieldName:
    string,
): void {
  const validValues = [
    "insufficient",
    "partial",
    "sufficient",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

function validateStability(
  value:
    unknown,
  fieldName:
    string,
): void {
  const validValues = [
    "unknown",
    "unstable",
    "developing",
    "stable",
    "highly-stable",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

function validateDrift(
  value:
    unknown,
  fieldName:
    string,
): void {
  const validValues = [
    "unknown",
    "none",
    "low",
    "moderate",
    "high",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

function validateRepeatPattern(
  value:
    unknown,
  fieldName:
    string,
): void {
  const validValues = [
    "unknown",
    "none",
    "occasional",
    "persistent",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

/* ------------------------------------------------------------------ */
/* General Validation Helpers */
/* ------------------------------------------------------------------ */

function assertAllowedValue(
  value:
    unknown,
  validValues:
    string[],
  fieldName:
    string,
): void {
  if (
    typeof value !== "string" ||
    !validValues.includes(value)
  ) {
    throw new Error(
      `${fieldName} must be one of: ${validValues.join(", ")}.`,
    );
  }
}

function assertNonEmptyString(
  value:
    unknown,
  fieldName:
    string,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(
      `${fieldName} must be a non-empty string.`,
    );
  }
}

function assertBoolean(
  value:
    unknown,
  fieldName:
    string,
): asserts value is boolean {
  if (
    typeof value !== "boolean"
  ) {
    throw new Error(
      `${fieldName} must be a boolean.`,
    );
  }
}

function assertParsableTimestamp(
  value:
    string,
  fieldName:
    string,
): void {
  assertNonEmptyString(
    value,
    fieldName,
  );

  if (
    Number.isNaN(
      Date.parse(value),
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid parsable timestamp.`,
    );
  }
}

function assertOptionalIsoTimestamp(
  value:
    string | null,
  fieldName:
    string,
): void {
  if (
    value === null
  ) {
    return;
  }

  assertParsableTimestamp(
    value,
    fieldName,
  );
}

function assertNonNegativeInteger(
  value:
    number,
  fieldName:
    string,
): void {
  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `${fieldName} must be a non-negative integer.`,
    );
  }
}

function assertNonNegativeFiniteNumber(
  value:
    number,
  fieldName:
    string,
): void {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new Error(
      `${fieldName} must be a non-negative finite number.`,
    );
  }
}

function assertRatio(
  value:
    number,
  fieldName:
    string,
): void {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      `${fieldName} must be a finite number between 0 and 1.`,
    );
  }
}

function assertApproximatelyEqual(
  actual:
    number,
  expected:
    number,
  fieldName:
    string,
): void {
  const tolerance =
    0.000001;

  if (
    Math.abs(
      actual -
      expected,
    ) >
    tolerance
  ) {
    throw new Error(
      `${fieldName} is inconsistent with its source counts.`,
    );
  }
}

function validateSignalType(
  value:
    unknown,
  fieldName:
    string,
): void {
  const validValues = [
    "same-fingerprint",
    "kind-changed",
    "target-changed",
    "title-changed",
    "description-changed",
    "confidence-increased",
    "confidence-decreased",
    "source-changed",
    "why-changed",
    "evidence-changed",
    "signal-count-increased",
    "signal-count-decreased",
    "previous-completed",
    "previous-superseded",
    "lifecycle-linked",
    "missing-comparison-data",
  ];

  assertAllowedValue(
    value,
    validValues,
    fieldName,
  );
}

function validateSignals(
  signals:
    RecommendationEvolutionSignal[],
  fieldName:
    string,
): void {
  if (
    signals.length === 0
  ) {
    throw new Error(
      `${fieldName} must contain at least one signal.`,
    );
  }

  const signalTypes =
    new Set<
      RecommendationEvolutionSignal["type"]
    >();

  for (
    let index = 0;
    index < signals.length;
    index += 1
  ) {
    const signal =
      signals[index];

    if (
      signal === undefined ||
      signal === null ||
      typeof signal !== "object"
    ) {
      throw new Error(
        `${fieldName}[${index}] must be a valid signal object.`,
      );
    }

    validateSignalType(
      signal.type,
      `${fieldName}[${index}].type`,
    );

    assertNonEmptyString(
      signal.description,
      `${fieldName}[${index}].description`,
    );

    assertNonNegativeFiniteNumber(
      signal.weight,
      `${fieldName}[${index}].weight`,
    );

    if (
      signalTypes.has(
        signal.type,
      )
    ) {
      throw new Error(
        `${fieldName} contains duplicate signal type "${signal.type}".`,
      );
    }

    signalTypes.add(
      signal.type,
    );
  }
}

function validateComparisonSignalConsistency(
  comparison:
    RecommendationLifecycleComparison,
  index:
    number,
): void {
  const signalTypes =
    new Set(
      comparison.signals.map(
        (signal) =>
          signal.type,
      ),
    );

  /* -------------------------------------------------------------- */
  /* Missing Comparison Data                                        */
  /* -------------------------------------------------------------- */

  if (
    comparison.type ===
      "initial" &&
    !signalTypes.has(
      "missing-comparison-data",
    )
  ) {
    throw new Error(
      `result.comparisons[${index}] with type "initial" must include a "missing-comparison-data" signal.`,
    );
  }

  /*
   * missing-comparison-data는 fallback Signal이므로
   * 다른 의미 Signal과 함께 존재해서는 안 됩니다.
   *
   * 다만 initial이 아닌 일반 비교에서도,
   * 비교 가능한 의미 신호가 발견되지 않으면 사용할 수 있습니다.
   */
  if (
    signalTypes.has(
      "missing-comparison-data",
    ) &&
    comparison.signals.length > 1
  ) {
    throw new Error(
      `result.comparisons[${index}] must not combine "missing-comparison-data" with other signals.`,
    );
  }

  /* -------------------------------------------------------------- */
  /* Repeated Recommendation                                        */
  /* -------------------------------------------------------------- */

  if (
    comparison.isRepeated &&
    !signalTypes.has(
      "same-fingerprint",
    )
  ) {
    throw new Error(
      `result.comparisons[${index}] marked as repeated must include a "same-fingerprint" signal.`,
    );
  }

  if (
    signalTypes.has(
      "same-fingerprint",
    ) &&
    !comparison.isRepeated
  ) {
    throw new Error(
      `result.comparisons[${index}] includes a "same-fingerprint" signal but isRepeated is false.`,
    );
  }

  /* -------------------------------------------------------------- */
  /* Target Change                                                  */
  /* -------------------------------------------------------------- */

  if (
    comparison.targetChanged &&
    !signalTypes.has(
      "target-changed",
    )
  ) {
    throw new Error(
      `result.comparisons[${index}] with targetChanged=true must include a "target-changed" signal.`,
    );
  }

  if (
    signalTypes.has(
      "target-changed",
    ) &&
    !comparison.targetChanged
  ) {
    throw new Error(
      `result.comparisons[${index}] includes a "target-changed" signal but targetChanged is false.`,
    );
  }

  /* -------------------------------------------------------------- */
  /* Kind Change                                                    */
  /* -------------------------------------------------------------- */

  if (
    comparison.kindChanged &&
    !signalTypes.has(
      "kind-changed",
    )
  ) {
    throw new Error(
      `result.comparisons[${index}] with kindChanged=true must include a "kind-changed" signal.`,
    );
  }

  if (
    signalTypes.has(
      "kind-changed",
    ) &&
    !comparison.kindChanged
  ) {
    throw new Error(
      `result.comparisons[${index}] includes a "kind-changed" signal but kindChanged is false.`,
    );
  }

  /* -------------------------------------------------------------- */
  /* Completion Advance                                             */
  /* -------------------------------------------------------------- */

  if (
    comparison.isCompletionAdvance &&
    !signalTypes.has(
      "previous-completed",
    )
  ) {
    throw new Error(
      `result.comparisons[${index}] marked as completion advance must include a "previous-completed" signal.`,
    );
  }

  if (
    signalTypes.has(
      "previous-completed",
    ) &&
    !comparison.isCompletionAdvance
  ) {
    throw new Error(
      `result.comparisons[${index}] includes a "previous-completed" signal but isCompletionAdvance is false.`,
    );
  }

  /* -------------------------------------------------------------- */
  /* Supersession                                                   */
  /* -------------------------------------------------------------- */

  if (
    comparison.isSupersession &&
    !signalTypes.has(
      "previous-superseded",
    )
  ) {
    throw new Error(
      `result.comparisons[${index}] marked as superseded must include a "previous-superseded" signal.`,
    );
  }

  if (
    signalTypes.has(
      "previous-superseded",
    ) &&
    !comparison.isSupersession
  ) {
    throw new Error(
      `result.comparisons[${index}] includes a "previous-superseded" signal but isSupersession is false.`,
    );
  }
}