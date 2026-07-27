import type {
    RuntimeNextActionConfidence,
} from "../runtime-next-action/runtimeNextActionTypes";

import type {
    RuntimeRecommendationLifecycleRecord,
} from "../runtime-recommendation-lifecycle/runtimeRecommendationLifecycleTypes";

import type {
    CompareRecommendationLifecycleParams,
    RecommendationEvolutionConfidence,
    RecommendationEvolutionDataQuality,
    RecommendationEvolutionDirection,
    RecommendationEvolutionFieldChange,
    RecommendationEvolutionMagnitude,
    RecommendationEvolutionSignal,
    RecommendationEvolutionSignalType,
    RecommendationEvolutionSnapshot,
    RecommendationEvolutionType,
    RecommendationLifecycleComparison,
} from "./recommendationEvolutionTypes";

/* ------------------------------------------------------------------ */
/* Public API */
/* ------------------------------------------------------------------ */

/**
 * 이전 Recommendation Lifecycle과 현재 Lifecycle을 비교합니다.
 *
 * 최초 Recommendation은 previous가 null이므로 initial로 분류합니다.
 *
 * 비교 우선순위:
 *
 * 1. initial
 * 2. repeated
 * 3. completed-and-advanced
 * 4. superseded
 * 5. redirected
 * 6. refined
 * 7. expanded
 *
 * completed / superseded는 이전 Lifecycle의 실제 resolution을
 * 기반으로 판단합니다.
 */
export function compareRecommendationLifecycle(
  params: CompareRecommendationLifecycleParams,
): RecommendationLifecycleComparison {
  validateParams(params);

  const {
    previous,
    current,
    previousFingerprint,
    currentFingerprint,
    createSnapshot,
    comparisonId,
    comparedAt,
  } = params;

  const currentSnapshot =
    createValidatedSnapshot({
      lifecycle:
        current,
      fingerprint:
        currentFingerprint,
      createSnapshot,
      label:
        "current",
    });

  if (previous === null) {
    return createInitialComparison({
      comparisonId,
      current:
        currentSnapshot,
      comparedAt,
    });
  }

  assertNonEmptyString(
    previousFingerprint,
    "previousFingerprint",
  );

  validateLifecycleOrder(
    previous,
    current,
  );

  const previousSnapshot =
    createValidatedSnapshot({
      lifecycle:
        previous,
      fingerprint:
        previousFingerprint,
      createSnapshot,
      label:
        "previous",
    });

  const fieldChanges =
    createFieldChanges(
      previousSnapshot,
      currentSnapshot,
    );

  const targetChanged =
    previousSnapshot.target !==
    currentSnapshot.target;

  const kindChanged =
    previousSnapshot.kind !==
    currentSnapshot.kind;

  const confidenceChanged =
    previousSnapshot.confidence !==
    currentSnapshot.confidence;

  const isRepeated =
    previousSnapshot.fingerprint ===
    currentSnapshot.fingerprint;

  const isCompletionAdvance =
    previous.resolution === "completed";

  const isSupersession =
    previous.resolution === "superseded";

  const lifecycleLinked =
    isLifecyclePairLinked(
      previous,
      current,
    );

  const signals =
    createComparisonSignals({
      previous:
        previousSnapshot,
      current:
        currentSnapshot,
      fieldChanges,
      isRepeated,
      isCompletionAdvance,
      isSupersession,
      lifecycleLinked,
    });

  const type =
    resolveEvolutionType({
      previous:
        previousSnapshot,
      current:
        currentSnapshot,
      isRepeated,
      isCompletionAdvance,
      isSupersession,
      targetChanged,
      kindChanged,
      fieldChanges,
    });

  const magnitude =
    resolveEvolutionMagnitude({
      type,
      targetChanged,
      kindChanged,
      fieldChanges,
    });

  const direction =
    resolveEvolutionDirection({
      type,
      targetChanged,
      kindChanged,
      fieldChanges,
    });

  const dataQuality =
    resolveDataQuality({
      previous:
        previousSnapshot,
      current:
        currentSnapshot,
      lifecycleLinked,
    });

  const confidence =
    resolveComparisonConfidence({
      type,
      dataQuality,
      lifecycleLinked,
      signals,
    });

  return {
    id:
      comparisonId,

    previous:
      previousSnapshot,

    current:
      currentSnapshot,

    type,
    magnitude,
    direction,
    confidence,
    dataQuality,

    isRepeated,
    isCompletionAdvance,
    isSupersession,
    targetChanged,
    kindChanged,
    confidenceChanged,

    fieldChanges,
    signals,

    comparedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Initial Comparison */
/* ------------------------------------------------------------------ */

type CreateInitialComparisonParams = {
  comparisonId:
    string;

  current:
    RecommendationEvolutionSnapshot;

  comparedAt:
    string;
};

function createInitialComparison(
  params: CreateInitialComparisonParams,
): RecommendationLifecycleComparison {
  const {
    comparisonId,
    current,
    comparedAt,
  } = params;

  return {
    id:
      comparisonId,

    previous:
      null,

    current,

    type:
      "initial",

    magnitude:
      "none",

    direction:
      "unresolved",

    confidence:
      "high",

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

    signals: [
      {
        type:
          "missing-comparison-data",

        description:
          "This is the first recommendation, so no previous recommendation is available for comparison.",

        weight:
          0,
      },
    ],

    comparedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Snapshot Creation */
/* ------------------------------------------------------------------ */

type CreateValidatedSnapshotParams = {
  lifecycle:
    RuntimeRecommendationLifecycleRecord;

  fingerprint:
    string;

  createSnapshot:
    CompareRecommendationLifecycleParams["createSnapshot"];

  label:
    "previous" | "current";
};

function createValidatedSnapshot(
  params: CreateValidatedSnapshotParams,
): RecommendationEvolutionSnapshot {
  const {
    lifecycle,
    fingerprint,
    createSnapshot,
    label,
  } = params;

  const snapshot =
    createSnapshot(
      lifecycle,
      fingerprint,
    );

  validateSnapshot(
    snapshot,
    lifecycle,
    fingerprint,
    label,
  );

  return snapshot;
}

/* ------------------------------------------------------------------ */
/* Field Changes */
/* ------------------------------------------------------------------ */

function createFieldChanges(
  previous:
    RecommendationEvolutionSnapshot,
  current:
    RecommendationEvolutionSnapshot,
): RecommendationEvolutionFieldChange[] {
  return [
    createFieldChange(
      "fingerprint",
      previous.fingerprint,
      current.fingerprint,
    ),

    createFieldChange(
      "kind",
      previous.kind,
      current.kind,
    ),

    createFieldChange(
      "title",
      previous.title,
      current.title,
    ),

    createFieldChange(
      "description",
      previous.description,
      current.description,
    ),

    createFieldChange(
      "target",
      normalizeNullableValue(
        previous.target,
      ),
      normalizeNullableValue(
        current.target,
      ),
    ),

    createFieldChange(
      "confidence",
      previous.confidence,
      current.confidence,
    ),

    createFieldChange(
      "source",
      previous.source,
      current.source,
    ),

    createFieldChange(
      "why",
      previous.whySummary,
      current.whySummary,
    ),

    createFieldChange(
      "evidence",
      previous.evidenceSummary,
      current.evidenceSummary,
    ),

    createFieldChange(
      "signal-count",
      previous.signalCount,
      current.signalCount,
    ),
  ];
}

function createFieldChange(
  field:
    RecommendationEvolutionFieldChange["field"],
  previousValue:
    string | number | null,
  currentValue:
    string | number | null,
): RecommendationEvolutionFieldChange {
  return {
    field,
    changed:
      previousValue !== currentValue,
    previousValue,
    currentValue,
  };
}

function normalizeNullableValue(
  value:
    unknown,
): string | number | null {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return value;
  }

  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

/* ------------------------------------------------------------------ */
/* Signals */
/* ------------------------------------------------------------------ */

type CreateComparisonSignalsParams = {
  previous:
    RecommendationEvolutionSnapshot;

  current:
    RecommendationEvolutionSnapshot;

  fieldChanges:
    RecommendationEvolutionFieldChange[];

  isRepeated:
    boolean;

  isCompletionAdvance:
    boolean;

  isSupersession:
    boolean;

  lifecycleLinked:
    boolean;
};

function createComparisonSignals(
  params: CreateComparisonSignalsParams,
): RecommendationEvolutionSignal[] {
  const {
    previous,
    current,
    fieldChanges,
    isRepeated,
    isCompletionAdvance,
    isSupersession,
    lifecycleLinked,
  } = params;

  const signals:
    RecommendationEvolutionSignal[] = [];

  if (isRepeated) {
    signals.push(
      createSignal(
        "same-fingerprint",
        "The current recommendation has the same fingerprint as the previous recommendation.",
        1,
      ),
    );
  }

  appendChangedFieldSignal({
    signals,
    fieldChanges,
    field:
      "kind",
    type:
      "kind-changed",
    description:
      "The recommendation kind changed.",
    weight:
      3,
  });

  appendChangedFieldSignal({
    signals,
    fieldChanges,
    field:
      "target",
    type:
      "target-changed",
    description:
      "The recommendation target changed.",
    weight:
      4,
  });

  appendChangedFieldSignal({
    signals,
    fieldChanges,
    field:
      "title",
    type:
      "title-changed",
    description:
      "The recommendation title changed.",
    weight:
      1,
  });

  appendChangedFieldSignal({
    signals,
    fieldChanges,
    field:
      "description",
    type:
      "description-changed",
    description:
      "The recommendation description changed.",
    weight:
      1,
  });

  appendChangedFieldSignal({
    signals,
    fieldChanges,
    field:
      "source",
    type:
      "source-changed",
    description:
      "The recommendation source changed.",
    weight:
      2,
  });

  appendChangedFieldSignal({
    signals,
    fieldChanges,
    field:
      "why",
    type:
      "why-changed",
    description:
      "The recommendation reasoning changed.",
    weight:
      1,
  });

  appendChangedFieldSignal({
    signals,
    fieldChanges,
    field:
      "evidence",
    type:
      "evidence-changed",
    description:
      "The recommendation evidence changed.",
    weight:
      1,
  });

  appendConfidenceSignal(
    signals,
    previous.confidence,
    current.confidence,
  );

  appendSignalCountSignal(
    signals,
    previous.signalCount,
    current.signalCount,
  );

  if (isCompletionAdvance) {
    signals.push(
      createSignal(
        "previous-completed",
        "The previous recommendation was completed before the current recommendation became active.",
        4,
      ),
    );
  }

  if (isSupersession) {
    signals.push(
      createSignal(
        "previous-superseded",
        "The previous recommendation was superseded before completion.",
        4,
      ),
    );
  }

  if (lifecycleLinked) {
    signals.push(
      createSignal(
        "lifecycle-linked",
        "The previous and current lifecycle records are explicitly linked.",
        1,
      ),
    );
  }

  if (
    signals.length === 0
  ) {
    signals.push(
      createSignal(
        "missing-comparison-data",
        "No meaningful comparison signal was detected.",
        0,
      ),
    );
  }

  return signals;
}

type AppendChangedFieldSignalParams = {
  signals:
    RecommendationEvolutionSignal[];

  fieldChanges:
    RecommendationEvolutionFieldChange[];

  field:
    RecommendationEvolutionFieldChange["field"];

  type:
    RecommendationEvolutionSignalType;

  description:
    string;

  weight:
    number;
};

function appendChangedFieldSignal(
  params: AppendChangedFieldSignalParams,
): void {
  const {
    signals,
    fieldChanges,
    field,
    type,
    description,
    weight,
  } = params;

  if (
    hasFieldChanged(
      fieldChanges,
      field,
    )
  ) {
    signals.push(
      createSignal(
        type,
        description,
        weight,
      ),
    );
  }
}

function appendConfidenceSignal(
  signals:
    RecommendationEvolutionSignal[],
  previousConfidence:
    RuntimeNextActionConfidence,
  currentConfidence:
    RuntimeNextActionConfidence,
): void {
  const previousRank =
    getConfidenceRank(
      previousConfidence,
    );

  const currentRank =
    getConfidenceRank(
      currentConfidence,
    );

  if (
    currentRank >
    previousRank
  ) {
    signals.push(
      createSignal(
        "confidence-increased",
        "Recommendation confidence increased.",
        1,
      ),
    );

    return;
  }

  if (
    currentRank <
    previousRank
  ) {
    signals.push(
      createSignal(
        "confidence-decreased",
        "Recommendation confidence decreased.",
        1,
      ),
    );
  }
}

function appendSignalCountSignal(
  signals:
    RecommendationEvolutionSignal[],
  previousCount:
    number,
  currentCount:
    number,
): void {
  if (
    currentCount >
    previousCount
  ) {
    signals.push(
      createSignal(
        "signal-count-increased",
        "The number of recommendation evidence signals increased.",
        1,
      ),
    );

    return;
  }

  if (
    currentCount <
    previousCount
  ) {
    signals.push(
      createSignal(
        "signal-count-decreased",
        "The number of recommendation evidence signals decreased.",
        1,
      ),
    );
  }
}

function createSignal(
  type:
    RecommendationEvolutionSignalType,
  description:
    string,
  weight:
    number,
): RecommendationEvolutionSignal {
  return {
    type,
    description,
    weight,
  };
}

/* ------------------------------------------------------------------ */
/* Evolution Type */
/* ------------------------------------------------------------------ */

type ResolveEvolutionTypeParams = {
  previous:
    RecommendationEvolutionSnapshot;

  current:
    RecommendationEvolutionSnapshot;

  isRepeated:
    boolean;

  isCompletionAdvance:
    boolean;

  isSupersession:
    boolean;

  targetChanged:
    boolean;

  kindChanged:
    boolean;

  fieldChanges:
    RecommendationEvolutionFieldChange[];
};

function resolveEvolutionType(
  params: ResolveEvolutionTypeParams,
): RecommendationEvolutionType {
  const {
    previous,
    current,
    isRepeated,
    isCompletionAdvance,
    isSupersession,
    targetChanged,
    kindChanged,
    fieldChanges,
  } = params;

  if (isRepeated) {
    return "repeated";
  }

  if (isCompletionAdvance) {
    return "completed-and-advanced";
  }

  if (isSupersession) {
    return "superseded";
  }

  if (
    targetChanged ||
    kindChanged
  ) {
    return "redirected";
  }

  if (
    isRefinement(
      previous,
      current,
      fieldChanges,
    )
  ) {
    return "refined";
  }

  return "expanded";
}

/* ------------------------------------------------------------------ */
/* Refinement Heuristic */
/* ------------------------------------------------------------------ */

/**
 * MVP refinement heuristic입니다.
 *
 * 동일 kind / target을 유지하면서 다음 중 하나 이상이면 refined:
 *
 * - title 또는 description이 더 구체적으로 길어짐
 * - confidence가 상승함
 * - evidence signal 수가 증가함
 *
 * target 또는 kind가 변경되면 refinement로 보지 않습니다.
 */
function isRefinement(
  previous:
    RecommendationEvolutionSnapshot,
  current:
    RecommendationEvolutionSnapshot,
  fieldChanges:
    RecommendationEvolutionFieldChange[],
): boolean {
  if (
    previous.kind !== current.kind ||
    previous.target !== current.target
  ) {
    return false;
  }

  const titleBecameMoreSpecific =
    hasFieldChanged(
      fieldChanges,
      "title",
    ) &&
    normalizedTextLength(
      current.title,
    ) >
    normalizedTextLength(
      previous.title,
    );

  const descriptionBecameMoreSpecific =
    hasFieldChanged(
      fieldChanges,
      "description",
    ) &&
    normalizedTextLength(
      current.description,
    ) >
    normalizedTextLength(
      previous.description,
    );

  const confidenceIncreased =
    getConfidenceRank(
      current.confidence,
    ) >
    getConfidenceRank(
      previous.confidence,
    );

  const signalCountIncreased =
    current.signalCount >
    previous.signalCount;

  return (
    titleBecameMoreSpecific ||
    descriptionBecameMoreSpecific ||
    confidenceIncreased ||
    signalCountIncreased
  );
}

/* ------------------------------------------------------------------ */
/* Magnitude */
/* ------------------------------------------------------------------ */

type ResolveEvolutionMagnitudeParams = {
  type:
    RecommendationEvolutionType;

  targetChanged:
    boolean;

  kindChanged:
    boolean;

  fieldChanges:
    RecommendationEvolutionFieldChange[];
};

function resolveEvolutionMagnitude(
  params: ResolveEvolutionMagnitudeParams,
): RecommendationEvolutionMagnitude {
  const {
    type,
    targetChanged,
    kindChanged,
    fieldChanges,
  } = params;

  if (
    type === "initial" ||
    type === "repeated"
  ) {
    return "none";
  }

  if (
    targetChanged &&
    kindChanged
  ) {
    return "major";
  }

  if (
    targetChanged ||
    kindChanged ||
    type === "superseded"
  ) {
    return "moderate";
  }

  const changedFieldCount =
    fieldChanges.filter(
      (change) =>
        change.changed &&
        change.field !== "fingerprint",
    ).length;

  if (
    type === "completed-and-advanced"
  ) {
    return changedFieldCount >= 4
      ? "moderate"
      : "minor";
  }

  if (changedFieldCount >= 5) {
    return "moderate";
  }

  return "minor";
}

/* ------------------------------------------------------------------ */
/* Direction */
/* ------------------------------------------------------------------ */

type ResolveEvolutionDirectionParams = {
  type:
    RecommendationEvolutionType;

  targetChanged:
    boolean;

  kindChanged:
    boolean;

  fieldChanges:
    RecommendationEvolutionFieldChange[];
};

function resolveEvolutionDirection(
  params: ResolveEvolutionDirectionParams,
): RecommendationEvolutionDirection {
  const {
    type,
    targetChanged,
    kindChanged,
    fieldChanges,
  } = params;

  if (type === "repeated") {
    return "stable";
  }

  if (
    type === "completed-and-advanced"
  ) {
    return "advancing";
  }

  if (
    type === "redirected" ||
    type === "superseded" ||
    targetChanged ||
    kindChanged
  ) {
    return "redirecting";
  }

  if (type === "refined") {
    return "narrowing";
  }

  if (type === "expanded") {
    const evidenceExpanded =
      hasFieldChanged(
        fieldChanges,
        "evidence",
      ) ||
      hasFieldChanged(
        fieldChanges,
        "signal-count",
      );

    return evidenceExpanded
      ? "broadening"
      : "stable";
  }

  return "unresolved";
}

/* ------------------------------------------------------------------ */
/* Data Quality */
/* ------------------------------------------------------------------ */

type ResolveDataQualityParams = {
  previous:
    RecommendationEvolutionSnapshot;

  current:
    RecommendationEvolutionSnapshot;

  lifecycleLinked:
    boolean;
};

function resolveDataQuality(
  params: ResolveDataQualityParams,
): RecommendationEvolutionDataQuality {
  const {
    previous,
    current,
    lifecycleLinked,
  } = params;

  const previousCoreComplete =
    hasCoreSnapshotData(
      previous,
    );

  const currentCoreComplete =
    hasCoreSnapshotData(
      current,
    );

  if (
    !previousCoreComplete ||
    !currentCoreComplete
  ) {
    return "insufficient";
  }

  const hasSupportingMeaning =
    previous.whySummary !== null ||
    previous.evidenceSummary !== null ||
    previous.signalCount > 0 ||
    current.whySummary !== null ||
    current.evidenceSummary !== null ||
    current.signalCount > 0;

  if (
    lifecycleLinked &&
    hasSupportingMeaning
  ) {
    return "sufficient";
  }

  return "partial";
}

function hasCoreSnapshotData(
  snapshot:
    RecommendationEvolutionSnapshot,
): boolean {
  return (
    snapshot.lifecycleId.trim().length > 0 &&
    snapshot.recommendationId.trim().length > 0 &&
    snapshot.fingerprint.trim().length > 0 &&
    snapshot.title.trim().length > 0 &&
    snapshot.description.trim().length > 0
  );
}

/* ------------------------------------------------------------------ */
/* Comparison Confidence */
/* ------------------------------------------------------------------ */

type ResolveComparisonConfidenceParams = {
  type:
    RecommendationEvolutionType;

  dataQuality:
    RecommendationEvolutionDataQuality;

  lifecycleLinked:
    boolean;

  signals:
    RecommendationEvolutionSignal[];
};

function resolveComparisonConfidence(
  params: ResolveComparisonConfidenceParams,
): RecommendationEvolutionConfidence {
  const {
    type,
    dataQuality,
    lifecycleLinked,
    signals,
  } = params;

  if (
    dataQuality === "insufficient"
  ) {
    return "low";
  }

  const weightedSignalTotal =
    signals.reduce(
      (total, signal) =>
        total + signal.weight,
      0,
    );

  if (
    dataQuality === "sufficient" &&
    lifecycleLinked &&
    (
      type === "repeated" ||
      type === "completed-and-advanced" ||
      type === "superseded" ||
      weightedSignalTotal >= 4
    )
  ) {
    return "high";
  }

  if (
    weightedSignalTotal >= 2 ||
    lifecycleLinked
  ) {
    return "medium";
  }

  return "low";
}

/* ------------------------------------------------------------------ */
/* Lifecycle Link */
/* ------------------------------------------------------------------ */

function isLifecyclePairLinked(
  previous:
    RuntimeRecommendationLifecycleRecord,
  current:
    RuntimeRecommendationLifecycleRecord,
): boolean {
  const forwardLinked =
    previous.nextLifecycleId ===
    current.id;

  const backwardLinked =
    current.previousLifecycleId ===
    previous.id;

  return (
    forwardLinked &&
    backwardLinked
  );
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function hasFieldChanged(
  fieldChanges:
    RecommendationEvolutionFieldChange[],
  field:
    RecommendationEvolutionFieldChange["field"],
): boolean {
  return (
    fieldChanges.find(
      (change) =>
        change.field === field,
    )?.changed ?? false
  );
}

function normalizedTextLength(
  value:
    string,
): number {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .length;
}

/**
 * confidence가 프로젝트에서 문자열 union으로 정의되어 있으므로
 * MVP에서는 알려진 값을 순위로 정규화합니다.
 *
 * unknown 값은 가장 낮은 순위로 처리합니다.
 */
function getConfidenceRank(
  confidence:
    RuntimeNextActionConfidence,
): number {
  switch (confidence) {
    case "high":
      return 3;

    case "medium":
      return 2;

    case "low":
      return 1;

    default:
      return 0;
  }
}

/* ------------------------------------------------------------------ */
/* Validation */
/* ------------------------------------------------------------------ */

function validateParams(
  params:
    CompareRecommendationLifecycleParams,
): void {
  assertNonEmptyString(
    params.comparisonId,
    "comparisonId",
  );

  assertNonEmptyString(
    params.currentFingerprint,
    "currentFingerprint",
  );

  assertValidIsoTimestamp(
    params.comparedAt,
    "comparedAt",
  );

  assertValidLifecycle(
    params.current,
    "current",
  );

  if (
    typeof params.createSnapshot !==
    "function"
  ) {
    throw new Error(
      "createSnapshot must be a function.",
    );
  }

  if (params.previous === null) {
    if (
      params.previousFingerprint !==
      null
    ) {
      throw new Error(
        "previousFingerprint must be null when previous is null.",
      );
    }

    return;
  }

  assertValidLifecycle(
    params.previous,
    "previous",
  );

  assertNonEmptyString(
    params.previousFingerprint,
    "previousFingerprint",
  );

  if (
    params.previous.id ===
    params.current.id
  ) {
    throw new Error(
      "previous and current lifecycle IDs must be different.",
    );
  }

  if (
    params.previous.recommendationId ===
    params.current.recommendationId
  ) {
    throw new Error(
      "previous and current recommendation IDs must be different.",
    );
  }
}

function validateLifecycleOrder(
  previous:
    RuntimeRecommendationLifecycleRecord,
  current:
    RuntimeRecommendationLifecycleRecord,
): void {
  const previousCreatedAt =
    Date.parse(
      previous.createdAt,
    );

  const currentCreatedAt =
    Date.parse(
      current.createdAt,
    );

  if (
    currentCreatedAt <
    previousCreatedAt
  ) {
    throw new Error(
      "current lifecycle must not be created earlier than previous lifecycle.",
    );
  }

  if (
    previous.nextLifecycleId !== null &&
    previous.nextLifecycleId !== current.id
  ) {
    throw new Error(
      `previous.nextLifecycleId "${previous.nextLifecycleId}" ` +
        `does not reference current lifecycle "${current.id}".`,
    );
  }

  if (
    current.previousLifecycleId !== null &&
    current.previousLifecycleId !==
      previous.id
  ) {
    throw new Error(
      `current.previousLifecycleId "${current.previousLifecycleId}" ` +
        `does not reference previous lifecycle "${previous.id}".`,
    );
  }
}

function validateSnapshot(
  snapshot:
    RecommendationEvolutionSnapshot,
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
  fingerprint:
    string,
  label:
    "previous" | "current",
): void {
  if (
    snapshot === null ||
    typeof snapshot !== "object"
  ) {
    throw new Error(
      `${label} snapshot must be a valid RecommendationEvolutionSnapshot.`,
    );
  }

  assertNonEmptyString(
    snapshot.lifecycleId,
    `${label} snapshot.lifecycleId`,
  );

  assertNonEmptyString(
    snapshot.recommendationId,
    `${label} snapshot.recommendationId`,
  );

  assertNonEmptyString(
    snapshot.fingerprint,
    `${label} snapshot.fingerprint`,
  );

  assertNonEmptyString(
    snapshot.title,
    `${label} snapshot.title`,
  );

  assertNonEmptyString(
    snapshot.description,
    `${label} snapshot.description`,
  );

  assertNonEmptyString(
    snapshot.sourceLabel,
    `${label} snapshot.sourceLabel`,
  );

  assertValidIsoTimestamp(
    snapshot.createdAt,
    `${label} snapshot.createdAt`,
  );

  if (
    snapshot.lifecycleId !==
    lifecycle.id
  ) {
    throw new Error(
      `${label} snapshot.lifecycleId must match lifecycle.id.`,
    );
  }

  if (
    snapshot.recommendationId !==
    lifecycle.recommendationId
  ) {
    throw new Error(
      `${label} snapshot.recommendationId must match lifecycle.recommendationId.`,
    );
  }

  if (
    snapshot.fingerprint !==
    fingerprint
  ) {
    throw new Error(
      `${label} snapshot.fingerprint must match the supplied fingerprint.`,
    );
  }

  if (
    !Number.isInteger(
      snapshot.signalCount,
    ) ||
    snapshot.signalCount < 0
  ) {
    throw new Error(
      `${label} snapshot.signalCount must be a non-negative integer.`,
    );
  }

  assertOptionalIsoTimestamp(
    snapshot.activatedAt,
    `${label} snapshot.activatedAt`,
  );

  assertOptionalIsoTimestamp(
    snapshot.resolvedAt,
    `${label} snapshot.resolvedAt`,
  );
}

function assertValidLifecycle(
  lifecycle:
    RuntimeRecommendationLifecycleRecord,
  fieldName:
    string,
): void {
  if (
    lifecycle === null ||
    typeof lifecycle !== "object"
  ) {
    throw new Error(
      `${fieldName} must be a valid RuntimeRecommendationLifecycleRecord.`,
    );
  }

  assertNonEmptyString(
    lifecycle.id,
    `${fieldName}.id`,
  );

  assertNonEmptyString(
    lifecycle.recommendationId,
    `${fieldName}.recommendationId`,
  );

  assertValidIsoTimestamp(
    lifecycle.createdAt,
    `${fieldName}.createdAt`,
  );
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
      Date.parse(value),
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid ISO 8601 timestamp.`,
    );
  }
}

function assertOptionalIsoTimestamp(
  value:
    string | null,
  fieldName:
    string,
): void {
  if (value === null) {
    return;
  }

  assertValidIsoTimestamp(
    value,
    fieldName,
  );
}