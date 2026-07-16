import type {
  RuntimeReflectionResult,
} from "../runtime-adapter/runtimeAdapterTypes";

import type {
  IdentityDriftSurfaceData,
} from "../types/runtimeIdentityDrift";

export function createIdentityDriftSurfaceData(
  result: RuntimeReflectionResult | null
): IdentityDriftSurfaceData {
  if (result === null) {
    return createHiddenIdentityDriftSurfaceData();
  }

  const continuity =
    result.continuitySignal;

  const driftStrength =
    continuity.driftStrength ?? "none";

  const driftDirection =
    continuity.driftDirection ?? "stable";

  const shouldShow =
    driftStrength === "minor" ||
    driftStrength === "moderate" ||
    driftStrength === "strong" ||
    driftDirection === "branching" ||
    driftDirection === "fragmenting" ||
    driftDirection === "resetting";

  if (!shouldShow) {
    return createHiddenIdentityDriftSurfaceData();
  }

  return {
    visible: true,

    title:
      createIdentityDriftTitle(
        driftStrength,
        driftDirection
      ),

    message:
      createIdentityDriftMessage(
        driftStrength,
        driftDirection
      ),

    driftLabel:
      createDriftLabel(
        driftStrength,
        driftDirection
      ),

    fromLabel:
      normalizeDriftDisplayLabel(
        continuity.driftFromLabel,
        "Previous perspective"
      ),

    toLabel:
      normalizeDriftDisplayLabel(
        continuity.driftToLabel,
        createDefaultToLabel(
          driftDirection
        )
      ),

    driftCue:
      createDriftCue(
        driftDirection
      ),

    driftStrength:
      normalizeDriftStrength(
        driftStrength
      ),

    driftDirection:
      normalizeDriftDirection(
        driftDirection
      ),
  };
}

function createHiddenIdentityDriftSurfaceData():
  IdentityDriftSurfaceData {
  return {
    visible: false,
    title: "",
    message: "",
  };
}

function createIdentityDriftTitle(
  driftStrength: string,
  driftDirection: string
): string {
  if (driftDirection === "branching") {
    return "The thought is branching into a new direction.";
  }

  if (driftDirection === "fragmenting") {
    return "The thought flow is spreading across multiple directions.";
  }

  if (driftDirection === "resetting") {
    return "A movement to reorganize the earlier flow is emerging.";
  }

  if (
    driftStrength === "moderate" ||
    driftStrength === "strong"
  ) {
    return "The direction of thought is changing.";
  }

  return "A small change is appearing in the direction of thought.";
}

function createIdentityDriftMessage(
  driftStrength: string,
  driftDirection: string
): string {
  if (driftDirection === "branching") {
    return (
      "This Reflection continues the earlier flow while also opening " +
      "a new direction of judgment."
    );
  }

  if (driftDirection === "fragmenting") {
    return (
      "Several possibilities appear to be emerging at the same time, " +
      "rather than forming a single conclusion."
    );
  }

  if (driftDirection === "resetting") {
    return (
      "Instead of continuing the earlier direction as it is, " +
      "the current flow appears to be reorganizing and searching for a new standard."
    );
  }

  if (
    driftStrength === "moderate" ||
    driftStrength === "strong"
  ) {
    return (
      "The current Reflection is connected to the earlier flow, " +
      "but the direction of judgment is beginning to change."
    );
  }

  return (
    "The current Reflection remains connected to the earlier flow, " +
    "but it contains a small shift in perspective."
  );
}

function createDriftLabel(
  driftStrength: string,
  driftDirection: string
): string {
  if (driftDirection === "branching") {
    return "New direction";
  }

  if (driftDirection === "fragmenting") {
    return "Fragmented flow";
  }

  if (driftDirection === "resetting") {
    return "Reframing";
  }

  if (driftStrength === "strong") {
    return "Strong directional shift";
  }

  if (driftStrength === "moderate") {
    return "Moderate shift";
  }

  return "Minor shift";
}

function createDefaultToLabel(
  driftDirection: string
): string {
  if (driftDirection === "branching") {
    return "New possibility";
  }

  if (driftDirection === "fragmenting") {
    return "Multiple emerging flows";
  }

  if (driftDirection === "resetting") {
    return "Reorganized standard";
  }

  return "Changed perspective";
}

function normalizeDriftDisplayLabel(
  value: string | undefined,
  fallback: string
): string {
  if (!value) {
    return fallback;
  }

  if (
    value === "기존 생각 흐름" ||
    value === "Previous thought flow"
  ) {
    return "Previous perspective";
  }

  if (
    value === "현재 생각 흐름" ||
    value === "Current thought flow"
  ) {
    return "Current perspective";
  }

  return value;
}

function createDriftCue(
  driftDirection: string
): string {
  if (driftDirection === "fragmenting") {
    return (
      "Rather than forcing a single conclusion, first observe " +
      "the different directions that are emerging."
    );
  }

  if (driftDirection === "resetting") {
    return (
      "This may not be a rejection of the earlier judgment, " +
      "but a process of establishing a new standard."
    );
  }

  if (driftDirection === "branching") {
    return (
      "When a new direction appears, compare it slowly with the earlier flow " +
      "and notice what has changed."
    );
  }

  return (
    "When a directional shift appears, avoid rushing and observe " +
    "both the earlier and current perspectives."
  );
}

function normalizeDriftStrength(
  value: string
): IdentityDriftSurfaceData["driftStrength"] {
  if (
    value === "moderate" ||
    value === "strong"
  ) {
    return value;
  }

  return "minor";
}

function normalizeDriftDirection(
  value: string
): IdentityDriftSurfaceData["driftDirection"] {
  if (
    value === "branching" ||
    value === "fragmenting" ||
    value === "resetting"
  ) {
    return value;
  }

  return "stable";
}