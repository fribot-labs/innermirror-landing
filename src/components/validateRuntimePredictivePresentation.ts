import type {
    RuntimePredictivePresentation,
    RuntimePredictivePresentationStatus,
} from "./runtimePredictivePresentationTypes";

/* ------------------------------------------------------------------ */
/* Runtime Predictive Presentation Validation                         */
/* ------------------------------------------------------------------ */

/**
 * Runtime Predictive Presentation의 구조적 일관성을 검증합니다.
 *
 * 이 검증은 Prediction 알고리즘의 정확성을 검사하지 않습니다.
 *
 * Recommendation Predictive Intelligence에서 이미 생성된 결과가
 * Runtime UI에서 안전하게 사용할 수 있는 Presentation 계약을
 * 만족하는지만 확인합니다.
 */
export function validateRuntimePredictivePresentation(
  presentation: RuntimePredictivePresentation,
): void {
  validateStatus(
    presentation.status,
  );

  validateRequiredText(
    presentation.headline,
    "headline",
  );

  validateRequiredText(
    presentation.summary,
    "summary",
  );

  validateOptionalText(
    presentation.primaryPrediction,
    "primaryPrediction",
  );

  validateConfidence(
    presentation,
  );

  validateIsoDate(
    presentation.predictedAt,
    "predictedAt",
  );

  validatePrimaryPredictionAvailability(
    presentation,
  );

  validateStringArray(
    presentation.evidence,
    "evidence",
  );

  validateStringArray(
    presentation.warnings,
    "warnings",
  );
}

/* ------------------------------------------------------------------ */
/* Status                                                             */
/* ------------------------------------------------------------------ */

function validateStatus(
  status: RuntimePredictivePresentationStatus,
): void {
  switch (status) {
    case "available":
    case "insufficient":
    case "unavailable":
      return;

    default:
      throw new Error(
        "Runtime Predictive Presentation status is invalid.",
      );
  }
}

/* ------------------------------------------------------------------ */
/* Required Text                                                      */
/* ------------------------------------------------------------------ */

function validateRequiredText(
  value: string,
  fieldName: string,
): void {
  if (
    value.trim().length === 0
  ) {
    throw new Error(
      `Runtime Predictive Presentation ${fieldName} must not be empty.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Optional Text                                                      */
/* ------------------------------------------------------------------ */

function validateOptionalText(
  value: string | null,
  fieldName: string,
): void {
  if (
    value !== null &&
    value.trim().length === 0
  ) {
    throw new Error(
      `Runtime Predictive Presentation ${fieldName} must not be an empty string.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Confidence                                                         */
/* ------------------------------------------------------------------ */

function validateConfidence(
  presentation: RuntimePredictivePresentation,
): void {
  const {
    score,
    percentage,
    disclosure,
  } =
    presentation.confidence;

  validateRequiredText(
    disclosure,
    "confidence.disclosure",
  );

  if (
    score !== null
  ) {
    if (
      !Number.isFinite(
        score,
      )
    ) {
      throw new Error(
        "Runtime Predictive Presentation confidence score must be finite.",
      );
    }

    if (
      score < 0 ||
      score > 1
    ) {
      throw new Error(
        "Runtime Predictive Presentation confidence score must be between 0 and 1.",
      );
    }
  }

  if (
    percentage !== null
  ) {
    if (
      !Number.isFinite(
        percentage,
      )
    ) {
      throw new Error(
        "Runtime Predictive Presentation confidence percentage must be finite.",
      );
    }

    if (
      percentage < 0 ||
      percentage > 100
    ) {
      throw new Error(
        "Runtime Predictive Presentation confidence percentage must be between 0 and 100.",
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Date                                                               */
/* ------------------------------------------------------------------ */

function validateIsoDate(
  value: string,
  fieldName: string,
): void {
  if (
    Number.isNaN(
      Date.parse(
        value,
      ),
    )
  ) {
    throw new Error(
      `Runtime Predictive Presentation ${fieldName} must be a valid ISO date.`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* Prediction Availability                                            */
/* ------------------------------------------------------------------ */

/**
 * Presentation이 available 상태라면 최소 하나 이상의 주요
 * Prediction이 존재해야 합니다.
 */
function validatePrimaryPredictionAvailability(
  presentation: RuntimePredictivePresentation,
): void {
  if (
    presentation.status !==
    "available"
  ) {
    return;
  }

  const hasPrediction =
    presentation.statePrediction !==
      null ||
    presentation.strategyPrediction !==
      null ||
    presentation.decisionPrediction !==
      null;

  if (
    !hasPrediction
  ) {
    throw new Error(
      "Runtime Predictive Presentation marked as available must contain at least one primary prediction.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* String Array                                                       */
/* ------------------------------------------------------------------ */

function validateStringArray(
  values: string[],
  fieldName: string,
): void {
  for (
    const value of values
  ) {
    if (
      value.trim().length === 0
    ) {
      throw new Error(
        `Runtime Predictive Presentation ${fieldName} must not contain empty strings.`,
      );
    }
  }

  const unique =
    new Set(
      values,
    );

  if (
    unique.size !==
    values.length
  ) {
    throw new Error(
      `Runtime Predictive Presentation ${fieldName} must not contain duplicate values.`,
    );
  }
}