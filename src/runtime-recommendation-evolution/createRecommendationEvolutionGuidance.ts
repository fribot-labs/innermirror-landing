import type {
    CreateRecommendationEvolutionGuidanceParams,
    RecommendationEvolutionGuidance,
    RecommendationEvolutionGuidanceObservation,
    RecommendationEvolutionGuidanceTone,
    RecommendationEvolutionGuidanceWarning,
    RecommendationEvolutionIntelligenceAssessment,
    RecommendationEvolutionIntelligenceSignal,
    RecommendationEvolutionIntelligenceSignalType,
    RecommendationEvolutionRuntimeDecision,
    RecommendationEvolutionStrategy,
    RecommendationEvolutionStrategyPriority
} from "./recommendationEvolutionIntelligenceTypes";

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Recommendation Evolution Assessment, Strategy, Runtime Decision,
 * Intelligence Signal을 사람이 읽을 수 있는 Guidance로 변환합니다.
 *
 * 이 함수는 입력값을 변경하지 않는 결정론적 순수 함수입니다.
 */
export function createRecommendationEvolutionGuidance(
  params:
    CreateRecommendationEvolutionGuidanceParams,
): RecommendationEvolutionGuidance {
  validateParams(
    params,
  );

  const {
    assessment,
    strategy,
    runtimeDecisions,
    signals,
    createdAt,
    createGuidanceId,
    createWarningId,
    createObservationId,
  } = params;

  const id =
    createGuidanceId();

  assertNonEmptyString(
    id,
    "createGuidanceId result",
  );

  const warnings =
    createWarnings({
      assessment,
      strategy,
      signals,
      createWarningId,
    });

  const observations =
    createObservations({
      assessment,
      strategy,
      signals,
      createObservationId,
    });

  const relatedSignalIds =
    resolveRelatedSignalIds({
      assessment,
      strategy,
      runtimeDecisions,
      signals,
      warnings,
      observations,
    });

  const guidance: RecommendationEvolutionGuidance = {
    id,

    tone:
      resolveGuidanceTone(
        assessment,
      ),

    headline:
      createHeadline(
        assessment,
        strategy,
      ),

    summary:
      createSummary(
        assessment,
        strategy,
        signals,
      ),

    runtimeInstruction:
      createRuntimeInstruction(
        strategy,
        runtimeDecisions,
      ),

    nextQuestion:
      createNextQuestion(
        assessment,
        strategy,
      ),

    rationale:
      createGuidanceRationale(
        assessment,
        strategy,
        signals,
      ),

    warnings,

    observations,

    sourceState:
      assessment.state,

    sourceStrategyType:
      strategy.type,

    primarySignalType:
      strategy.primarySignalType ??
      assessment.primarySignalType,

    relatedSignalIds,

    createdAt,
  };

  validateGuidanceConsistency(
    guidance,
    assessment,
    strategy,
  );

  return guidance;
}

/* ------------------------------------------------------------------ */
/* Tone                                                               */
/* ------------------------------------------------------------------ */

function resolveGuidanceTone(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
): RecommendationEvolutionGuidanceTone {
  switch (assessment.state) {
    case "unavailable":
      return "unavailable";

    case "observing":
      return "neutral";

    case "stable":
      return "stable";

    case "progressing":
    case "advancing":
      return "progressing";

    case "stalled":
    case "fragmented":
      return "attention";
  }
}

/* ------------------------------------------------------------------ */
/* Headline                                                           */
/* ------------------------------------------------------------------ */

function createHeadline(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
  strategy:
    RecommendationEvolutionStrategy,
): string {
  switch (strategy.type) {
    case "observe":
      return assessment.state ===
        "unavailable"
        ? "Recommendation 흐름을 판단할 수 있는 기록이 아직 없습니다."
        : "현재 흐름을 조금 더 관찰할 필요가 있습니다.";

    case "maintain":
      return "현재 Recommendation 방향을 유지하는 것이 적절합니다.";

    case "clarify":
      return "현재 Recommendation의 목표를 더 명확히 할 필요가 있습니다.";

    case "narrow":
      return "현재 방향을 유지하면서 실행 단위를 더 작게 좁힐 수 있습니다.";

    case "confirm-completion":
      return "새 Recommendation보다 현재 Recommendation의 완료 여부를 먼저 확인해야 합니다.";

    case "advance":
      return "이전 Recommendation의 진전을 바탕으로 다음 단계로 이동할 수 있습니다.";

    case "stabilize":
      return "새 방향을 추가하기보다 Recommendation 흐름을 먼저 안정화해야 합니다.";

    case "reconsider":
      return "현재 Recommendation의 전제와 교체 이유를 다시 검토할 필요가 있습니다.";
  }
}

/* ------------------------------------------------------------------ */
/* Summary                                                            */
/* ------------------------------------------------------------------ */

function createSummary(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
  strategy:
    RecommendationEvolutionStrategy,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): string {
  const primarySignal =
    findSignalByType(
      signals,
      strategy.primarySignalType ??
        assessment.primarySignalType,
    );

  switch (assessment.state) {
    case "unavailable":
      return "분석 가능한 Recommendation 이력이 없어 현재 흐름의 안정성이나 진전 상태를 판단할 수 없습니다.";

    case "observing":
      return primarySignal?.description ??
        "비교 가능한 Recommendation 기록이나 데이터 품질이 아직 충분하지 않아 추가 관찰이 필요합니다.";

    case "stable":
      return primarySignal?.description ??
        "큰 방향 전환 없이 현재 Recommendation의 연속성이 유지되고 있습니다.";

    case "progressing":
      return primarySignal?.description ??
        "Recommendation이 새로운 방향으로 교체되기보다 점차 실행 가능한 형태로 구체화되고 있습니다.";

    case "stalled":
      return primarySignal?.description ??
        "동일한 Recommendation이 반복되고 있지만 완료 또는 구체적인 진행 근거가 충분하지 않습니다.";

    case "fragmented":
      return primarySignal?.description ??
        "Recommendation 방향 변경이나 교체가 반복되어 하나의 연속된 흐름이 약해지고 있습니다.";

    case "advancing":
      return primarySignal?.description ??
        "완료된 Recommendation이 다음 단계의 Recommendation으로 이어지는 흐름이 나타나고 있습니다.";
  }
}

/* ------------------------------------------------------------------ */
/* Runtime Instruction                                                */
/* ------------------------------------------------------------------ */

function createRuntimeInstruction(
  strategy:
    RecommendationEvolutionStrategy,
  runtimeDecisions:
    readonly RecommendationEvolutionRuntimeDecision[],
): string {
  const enabledDecisionCount =
    runtimeDecisions.filter(
      (
        decision,
      ) =>
        decision.enabled,
    ).length;

  switch (strategy.type) {
    case "observe":
      return strategy.decisions
        .shouldGenerateNewRecommendation
        ? "초기 Recommendation을 생성하되 강한 장기 패턴 판단은 보류하세요."
        : "새 Recommendation 생성을 서두르지 말고 현재 행동과 변화 근거를 추가로 관찰하세요.";

    case "maintain":
      return "현재 Recommendation을 보존하고 불필요한 방향 변경이나 자동 교체를 피하세요.";

    case "clarify":
      return "현재 Recommendation을 교체하기 전에 목표, 완료 조건, 실행 대상을 더 명확하게 확인하세요.";

    case "narrow":
      return "현재 방향을 보존하면서 바로 실행할 수 있는 더 작은 행동 단위로 Recommendation을 좁히세요.";

    case "confirm-completion":
      return "새 Recommendation을 생성하기 전에 현재 Recommendation의 진행 증거, 완료 여부, 장애 요인을 확인하세요.";

    case "advance":
      return "이전 Recommendation의 완료 근거를 보존하고 그 결과와 연결되는 다음 단계 Recommendation을 생성하세요.";

    case "stabilize":
      return "새로운 방향 추가를 억제하고 현재 목표와 최근 방향 변경의 이유를 먼저 정리하세요.";

    case "reconsider":
      return enabledDecisionCount > 0
        ? "현재 Recommendation을 즉시 교체하지 말고 기존 전제, 실행 가능성, 반복된 교체 이유를 다시 검토하세요."
        : "현재 Recommendation의 전제와 방향을 다시 검토하세요.";
  }
}

/* ------------------------------------------------------------------ */
/* Next Question                                                      */
/* ------------------------------------------------------------------ */

function createNextQuestion(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
  strategy:
    RecommendationEvolutionStrategy,
): string | null {
  switch (strategy.type) {
    case "observe":
      return assessment.state ===
        "unavailable"
        ? "지금 가장 먼저 실행하거나 확인하고 싶은 행동은 무엇인가요?"
        : "현재 Recommendation과 관련해 새롭게 확인된 진행이나 변화가 있나요?";

    case "maintain":
      return "현재 Recommendation을 계속 유지해야 한다는 가장 분명한 근거는 무엇인가요?";

    case "clarify":
      return "이 Recommendation이 완료되었다고 판단할 수 있는 가장 분명한 조건은 무엇인가요?";

    case "narrow":
      return "현재 Recommendation을 바로 실행할 수 있는 가장 작은 행동은 무엇인가요?";

    case "confirm-completion":
      return "현재 Recommendation은 어디까지 실행되었고, 완료를 막는 가장 큰 조건은 무엇인가요?";

    case "advance":
      return "완료된 결과를 바탕으로 다음에 이어져야 할 가장 자연스러운 행동은 무엇인가요?";

    case "stabilize":
      return "최근 Recommendation의 방향이 바뀐 가장 중요한 이유는 무엇인가요?";

    case "reconsider":
      return "현재 Recommendation이 계속 교체되는 이유는 목표의 변화인가요, 실행 조건의 문제인가요?";
  }
}

/* ------------------------------------------------------------------ */
/* Warnings                                                           */
/* ------------------------------------------------------------------ */

type CreateWarningsParams = {
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  strategy:
    RecommendationEvolutionStrategy;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  createWarningId:
    (
      index:
        number,
    ) => string;
};

type GuidanceWarningDraft = Omit<
  RecommendationEvolutionGuidanceWarning,
  "id"
>;

function createWarnings(
  params:
    CreateWarningsParams,
): RecommendationEvolutionGuidanceWarning[] {
  const drafts:
    GuidanceWarningDraft[] = [];

  pushWarning(
    drafts,
    createWarningFromSignal(
      params.signals,
      "unresolved-repetition",
      "반복되는 Recommendation의 완료 상태가 확인되지 않았습니다.",
    ),
  );

  pushWarning(
    drafts,
    createWarningFromSignal(
      params.signals,
      "high-drift",
      "Recommendation 흐름의 방향 편차가 높습니다.",
    ),
  );

  pushWarning(
    drafts,
    createWarningFromSignal(
      params.signals,
      "frequent-redirection",
      "Recommendation 방향 변경이 반복되고 있습니다.",
    ),
  );

  pushWarning(
    drafts,
    createWarningFromSignal(
      params.signals,
      "premature-supersession",
      "Recommendation이 완료되기 전에 교체되는 패턴이 관찰됩니다.",
    ),
  );

  pushWarning(
    drafts,
    createWarningFromSignal(
      params.signals,
      "high-supersession-rate",
      "Recommendation 교체 비율이 높습니다.",
    ),
  );

  pushWarning(
    drafts,
    createWarningFromSignal(
      params.signals,
      "low-completion-rate",
      "Recommendation 완료 비율이 낮습니다.",
    ),
  );

  pushWarning(
    drafts,
    createWarningFromSignal(
      params.signals,
      "decreasing-confidence",
      "최근 Evolution 판단의 신뢰도가 낮아지고 있습니다.",
    ),
  );

  if (
    params.assessment.needsObservation &&
    drafts.length === 0
  ) {
    const observationSignal =
      findSignalByType(
        params.signals,
        "observation-needed",
      );

    drafts.push({
      severity:
        observationSignal?.severity ??
        "low",

      title:
        "추가 관찰이 필요합니다.",

      description:
        observationSignal?.description ??
        "현재 데이터만으로 강한 Recommendation 전략 변경을 결정하기 어렵습니다.",

      relatedSignalIds:
        observationSignal === null
          ? []
          : [
              observationSignal.id,
            ],
    });
  }

  return drafts.map(
    (
      draft,
      index,
    ) => {
      const id =
        params.createWarningId(
          index,
        );

      assertNonEmptyString(
        id,
        `createWarningId result at index ${index}`,
      );

      return {
        ...draft,
        id,
      };
    },
  );
}

function createWarningFromSignal(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
  type:
    RecommendationEvolutionIntelligenceSignalType,
  fallbackTitle:
    string,
): GuidanceWarningDraft | null {
  const signal =
    findSignalByType(
      signals,
      type,
    );

  if (signal === null) {
    return null;
  }

  return {
    severity:
      signal.severity,

    title:
      signal.title.trim().length >
        0
        ? signal.title
        : fallbackTitle,

    description:
      signal.description,

    relatedSignalIds: [
      signal.id,
    ],
  };
}

function pushWarning(
  warnings:
    GuidanceWarningDraft[],
  warning:
    GuidanceWarningDraft | null,
): void {
  if (warning !== null) {
    warnings.push(
      warning,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Observations                                                       */
/* ------------------------------------------------------------------ */

type CreateObservationsParams = {
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  strategy:
    RecommendationEvolutionStrategy;

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  createObservationId:
    (
      index:
        number,
    ) => string;
};

type GuidanceObservationDraft = Omit<
  RecommendationEvolutionGuidanceObservation,
  "id"
>;

function createObservations(
  params:
    CreateObservationsParams,
): RecommendationEvolutionGuidanceObservation[] {
  const drafts:
    GuidanceObservationDraft[] = [];

  if (
    params.assessment.needsObservation
  ) {
    drafts.push({
      subject:
        "Recommendation 진행 근거",

      reason:
        "현재 Recommendation이 실제 행동이나 완료 상태로 이어지는지 확인해야 합니다.",

      priority:
        resolveObservationPriority(
          params.strategy.priority,
        ),

      relatedSignalIds:
        getSignalIdsByTypes(
          params.signals,
          [
            "observation-needed",
            "decreasing-confidence",
            "insufficient-history",
          ],
        ),
    });
  }

  if (
    params.assessment
      .shouldConfirmCompletion
  ) {
    drafts.push({
      subject:
        "현재 Recommendation 완료 여부",

      reason:
        "새 Recommendation 생성 전에 현재 Recommendation의 완료 또는 미완료 상태를 구분해야 합니다.",

      priority:
        "high",

      relatedSignalIds:
        getSignalIdsByTypes(
          params.signals,
          [
            "unresolved-repetition",
            "persistent-repetition",
            "low-completion-rate",
          ],
        ),
    });
  }

  if (
    params.assessment
      .shouldStabilizeDirection
  ) {
    drafts.push({
      subject:
        "최근 Recommendation 방향 변경",

      reason:
        "방향 변경이 실제 목표 변화인지 일시적인 반응인지 확인해야 합니다.",

      priority:
        "high",

      relatedSignalIds:
        getSignalIdsByTypes(
          params.signals,
          [
            "high-drift",
            "frequent-redirection",
            "premature-supersession",
            "high-supersession-rate",
          ],
        ),
    });
  }

  if (
    params.assessment
      .shouldRefineRecommendation
  ) {
    drafts.push({
      subject:
        "실행 가능한 최소 행동",

      reason:
        "현재 Recommendation의 방향을 유지하면서 더 구체적인 실행 단위로 발전시킬 수 있습니다.",

      priority:
        "medium",

      relatedSignalIds:
        getSignalIdsByTypes(
          params.signals,
          [
            "productive-refinement",
            "increasing-confidence",
          ],
        ),
    });
  }

  if (
    params.assessment.state ===
    "advancing"
  ) {
    drafts.push({
      subject:
        "완료 결과와 다음 단계의 연결",

      reason:
        "이전 Recommendation의 완료 근거가 다음 Recommendation에 자연스럽게 이어지는지 확인해야 합니다.",

      priority:
        "medium",

      relatedSignalIds:
        getSignalIdsByTypes(
          params.signals,
          [
            "completion-momentum",
          ],
        ),
    });
  }

  return drafts.map(
    (
      draft,
      index,
    ) => {
      const id =
        params.createObservationId(
          index,
        );

      assertNonEmptyString(
        id,
        `createObservationId result at index ${index}`,
      );

      return {
        ...draft,
        id,
      };
    },
  );
}

function resolveObservationPriority(
  priority:
    RecommendationEvolutionStrategyPriority,
): RecommendationEvolutionStrategyPriority {
  if (priority === "high") {
    return "high";
  }

  return "medium";
}

/* ------------------------------------------------------------------ */
/* Rationale                                                          */
/* ------------------------------------------------------------------ */

function createGuidanceRationale(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
  strategy:
    RecommendationEvolutionStrategy,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): string[] {
  const rationale = [
    ...assessment.reasoning,
    ...strategy.rationale,
  ];

  const primarySignal =
    findSignalByType(
      signals,
      strategy.primarySignalType ??
        assessment.primarySignalType,
    );

  if (primarySignal !== null) {
    rationale.push(
      primarySignal.description,
    );
  }

  return uniqueNonEmptyStrings(
    rationale,
  );
}

/* ------------------------------------------------------------------ */
/* Related Signals                                                    */
/* ------------------------------------------------------------------ */

type ResolveRelatedSignalIdsParams = {
  assessment:
    RecommendationEvolutionIntelligenceAssessment;

  strategy:
    RecommendationEvolutionStrategy;

  runtimeDecisions:
    readonly RecommendationEvolutionRuntimeDecision[];

  signals:
    readonly RecommendationEvolutionIntelligenceSignal[];

  warnings:
    readonly RecommendationEvolutionGuidanceWarning[];

  observations:
    readonly RecommendationEvolutionGuidanceObservation[];
};

function resolveRelatedSignalIds(
  params:
    ResolveRelatedSignalIdsParams,
): string[] {
  const ids: string[] = [
    ...params.strategy.relatedSignalIds,
  ];

  for (
    const decision
    of params.runtimeDecisions
  ) {
    ids.push(
      ...decision.relatedSignalIds,
    );
  }

  for (
    const warning
    of params.warnings
  ) {
    ids.push(
      ...warning.relatedSignalIds,
    );
  }

  for (
    const observation
    of params.observations
  ) {
    ids.push(
      ...observation.relatedSignalIds,
    );
  }

  if (
    params.assessment.primarySignalType !==
    null
  ) {
    const signal =
      findSignalByType(
        params.signals,
        params.assessment
          .primarySignalType,
      );

    if (signal !== null) {
      ids.push(
        signal.id,
      );
    }
  }

  return uniqueStrings(
    ids,
  );
}

/* ------------------------------------------------------------------ */
/* Signal Helpers                                                     */
/* ------------------------------------------------------------------ */

function findSignalByType(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
  type:
    RecommendationEvolutionIntelligenceSignalType | null,
): RecommendationEvolutionIntelligenceSignal | null {
  if (type === null) {
    return null;
  }

  return (
    signals.find(
      (
        signal,
      ) =>
        signal.type ===
        type,
    ) ??
    null
  );
}

function getSignalIdsByTypes(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
  types:
    readonly RecommendationEvolutionIntelligenceSignalType[],
): string[] {
  return signals
    .filter(
      (
        signal,
      ) =>
        types.includes(
          signal.type,
        ),
    )
    .map(
      (
        signal,
      ) =>
        signal.id,
    );
}

/* ------------------------------------------------------------------ */
/* Consistency Validation                                             */
/* ------------------------------------------------------------------ */

function validateGuidanceConsistency(
  guidance:
    RecommendationEvolutionGuidance,
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
  strategy:
    RecommendationEvolutionStrategy,
): void {
  if (
    guidance.sourceState !==
    assessment.state
  ) {
    throw new Error(
      "Guidance sourceState must match assessment.state.",
    );
  }

  if (
    guidance.sourceStrategyType !==
    strategy.type
  ) {
    throw new Error(
      "Guidance sourceStrategyType must match strategy.type.",
    );
  }

  const expectedTone =
    resolveGuidanceTone(
      assessment,
    );

  if (
    guidance.tone !==
    expectedTone
  ) {
    throw new Error(
      `Guidance tone "${guidance.tone}" is inconsistent with assessment state "${assessment.state}".`,
    );
  }

  if (
    strategy.type ===
      "confirm-completion" &&
    guidance.nextQuestion ===
      null
  ) {
    throw new Error(
      'Guidance for "confirm-completion" must include a nextQuestion.',
    );
  }

  if (
    (
      assessment.state ===
        "stalled" ||
      assessment.state ===
        "fragmented"
    ) &&
    guidance.warnings.length ===
      0
  ) {
    throw new Error(
      `Guidance for assessment state "${assessment.state}" must include at least one warning.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Input Validation                                                   */
/* ------------------------------------------------------------------ */

function validateParams(
  params:
    CreateRecommendationEvolutionGuidanceParams,
): void {
  if (
    params === null ||
    typeof params !==
      "object"
  ) {
    throw new Error(
      "params must be a valid CreateRecommendationEvolutionGuidanceParams object.",
    );
  }

  validateAssessment(
    params.assessment,
  );

  validateStrategy(
    params.strategy,
  );

  if (
    !Array.isArray(
      params.runtimeDecisions,
    )
  ) {
    throw new Error(
      "runtimeDecisions must be an array.",
    );
  }

  if (
    !Array.isArray(
      params.signals,
    )
  ) {
    throw new Error(
      "signals must be an array.",
    );
  }

  validateSignals(
    params.signals,
  );

  validateRuntimeDecisions(
    params.runtimeDecisions,
    params.strategy,
  );

  validateSourceConsistency(
    params.assessment,
    params.strategy,
    params.signals,
  );

  assertValidIsoTimestamp(
    params.createdAt,
    "createdAt",
  );

  if (
    typeof params.createGuidanceId !==
    "function"
  ) {
    throw new Error(
      "createGuidanceId must be a function.",
    );
  }

  if (
    typeof params.createWarningId !==
    "function"
  ) {
    throw new Error(
      "createWarningId must be a function.",
    );
  }

  if (
    typeof params.createObservationId !==
    "function"
  ) {
    throw new Error(
      "createObservationId must be a function.",
    );
  }
}

function validateAssessment(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
): void {
  if (
    assessment === null ||
    typeof assessment !==
      "object"
  ) {
    throw new Error(
      "assessment must be a valid RecommendationEvolutionIntelligenceAssessment.",
    );
  }

  if (
    !Array.isArray(
      assessment.reasoning,
    )
  ) {
    throw new Error(
      "assessment.reasoning must be an array.",
    );
  }
}

function validateStrategy(
  strategy:
    RecommendationEvolutionStrategy,
): void {
  if (
    strategy === null ||
    typeof strategy !==
      "object"
  ) {
    throw new Error(
      "strategy must be a valid RecommendationEvolutionStrategy.",
    );
  }

  if (
    !Array.isArray(
      strategy.rationale,
    )
  ) {
    throw new Error(
      "strategy.rationale must be an array.",
    );
  }

  if (
    !Array.isArray(
      strategy.relatedSignalIds,
    )
  ) {
    throw new Error(
      "strategy.relatedSignalIds must be an array.",
    );
  }
}

function validateSignals(
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): void {
  const ids =
    new Set<string>();

  for (const signal of signals) {
    assertNonEmptyString(
      signal.id,
      "signal.id",
    );

    if (
      ids.has(
        signal.id,
      )
    ) {
      throw new Error(
        `Duplicate Recommendation Evolution Intelligence signal ID "${signal.id}".`,
      );
    }

    ids.add(
      signal.id,
    );
  }
}

function validateRuntimeDecisions(
  decisions:
    readonly RecommendationEvolutionRuntimeDecision[],
  strategy:
    RecommendationEvolutionStrategy,
): void {
  const ids =
    new Set<string>();

  for (const decision of decisions) {
    assertNonEmptyString(
      decision.id,
      "runtimeDecision.id",
    );

    if (
      ids.has(
        decision.id,
      )
    ) {
      throw new Error(
        `Duplicate Recommendation Evolution Runtime Decision ID "${decision.id}".`,
      );
    }

    ids.add(
      decision.id,
    );

    if (
      decision.sourceStrategyType !==
      strategy.type
    ) {
      throw new Error(
        `Runtime Decision "${decision.id}" sourceStrategyType must match strategy.type.`,
      );
    }
  }
}

function validateSourceConsistency(
  assessment:
    RecommendationEvolutionIntelligenceAssessment,
  strategy:
    RecommendationEvolutionStrategy,
  signals:
    readonly RecommendationEvolutionIntelligenceSignal[],
): void {
  if (
    strategy.sourceState !==
    assessment.state
  ) {
    throw new Error(
      "strategy.sourceState must match assessment.state.",
    );
  }

  const signalIds =
    new Set(
      signals.map(
        (
          signal,
        ) =>
          signal.id,
      ),
    );

  for (
    const signalId
    of strategy.relatedSignalIds
  ) {
    if (
      !signalIds.has(
        signalId,
      )
    ) {
      throw new Error(
        `Strategy references missing signal "${signalId}".`,
      );
    }
  }

  const primarySignalType =
    strategy.primarySignalType ??
    assessment.primarySignalType;

  if (
    primarySignalType !==
      null &&
    findSignalByType(
      signals,
      primarySignalType,
    ) ===
      null
  ) {
    throw new Error(
      `Primary signal type "${primarySignalType}" does not exist in signals.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* General Helpers                                                    */
/* ------------------------------------------------------------------ */

function uniqueStrings(
  values:
    readonly string[],
): string[] {
  return [
    ...new Set(
      values,
    ),
  ];
}

function uniqueNonEmptyStrings(
  values:
    readonly string[],
): string[] {
  return uniqueStrings(
    values.filter(
      (
        value,
      ) =>
        value.trim().length >
        0,
    ),
  );
}

function assertNonEmptyString(
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

function assertValidIsoTimestamp(
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
      Date.parse(
        value,
      ),
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid ISO 8601 timestamp.`,
    );
  }
}