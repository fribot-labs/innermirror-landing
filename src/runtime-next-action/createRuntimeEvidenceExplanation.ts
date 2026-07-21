import type {
  RuntimeRecommendationCandidate,
  RuntimeRecommendationResolutionType,
} from "./runtimeRecommendationCandidateTypes";

import type {
  RuntimeCandidateEvidence,
  RuntimeEvidenceExplanation,
  RuntimeEvidenceGroup,
  RuntimeEvidenceImportance,
  RuntimeEvidenceItem,
} from "./runtimeEvidenceTypes";

export type CreateRuntimeEvidenceExplanationParams = {
  primary:
    RuntimeRecommendationCandidate;

  supporting:
    RuntimeRecommendationCandidate[];

  resolution:
    RuntimeRecommendationResolutionType;
};

export function createRuntimeEvidenceExplanation({
  primary,
  supporting,
  resolution,
}: CreateRuntimeEvidenceExplanationParams):
  RuntimeEvidenceExplanation {
  return {
    summary:
      createEvidenceSummary(
        primary,
        supporting,
        resolution
      ),

    primary:
      createCandidateEvidenceGroup(
        primary,
        "primary"
      ),

    supporting:
      supporting.map(
        (candidate) =>
          createCandidateEvidenceGroup(
            candidate,
            "supporting"
          )
      ),

    context:
      createContextEvidenceGroups(
        primary,
        supporting
      ),

    disclosure:
      "structured",
  };
}

function createEvidenceSummary(
  primary:
    RuntimeRecommendationCandidate,
  supporting:
    RuntimeRecommendationCandidate[],
  resolution:
    RuntimeRecommendationResolutionType
): string {
  if (primary.isBlocking) {
    return (
      "This recommendation is based on missing project " +
      "or reasoning context that must be restored first."
    );
  }

  if (
    resolution === "merged" &&
    supporting.length > 0
  ) {
    const signalCount =
      supporting.length + 1;

    return (
      `${signalCount} Runtime signal${
        signalCount > 1
          ? "s"
          : ""
      } support this recommendation.`
    );
  }

  if (
    primary.category === "fallback"
  ) {
    return (
      "This is the most useful action supported by " +
      "the currently available project context."
    );
  }

  return (
    "This recommendation is primarily supported by " +
    primary.sourceLabel +
    "."
  );
}

function createCandidateEvidenceGroup(
  candidate:
    RuntimeRecommendationCandidate,
  importance:
    RuntimeEvidenceImportance
): RuntimeEvidenceGroup {
  const evidence =
    candidate.evidence ?? [];

  return {
    id:
      `candidate-${candidate.id}`,

    title:
      candidate.sourceLabel,

    description:
      candidate.reason,

    items:
      evidence.map(
        (item) =>
          convertCandidateEvidence(
            item,
            importance
          )
      ),
  };
}

function convertCandidateEvidence(
  evidence:
    RuntimeCandidateEvidence,
  importance:
    RuntimeEvidenceImportance
): RuntimeEvidenceItem {
  return {
    ...evidence,
    importance,
  };
}

function createContextEvidenceGroups(
  primary:
    RuntimeRecommendationCandidate,
  supporting:
    RuntimeRecommendationCandidate[]
): RuntimeEvidenceGroup[] {
  const mergedEvidence =
    deduplicateEvidence([
      ...(primary.evidence ?? []),

      ...supporting.flatMap(
        (candidate) =>
          candidate.evidence ?? []
      ),
    ]);

  const contextEvidence =
    mergedEvidence.filter(
      (evidence) =>
        evidence.source === "project-state" ||
        evidence.source === "github-snapshot" ||
        evidence.source === "reflection-state"
    );

  if (contextEvidence.length === 0) {
    return [];
  }

  return [
    {
      id:
        "project-context",

      title:
        "Project Context",

      description:
        "Observable project, GitHub, and Reflection state used during recommendation evaluation.",

      items:
        contextEvidence.map(
          (evidence) =>
            convertCandidateEvidence(
              evidence,
              "context"
            )
        ),
    },
  ];
}

function deduplicateEvidence(
  evidence:
    RuntimeCandidateEvidence[]
): RuntimeCandidateEvidence[] {
  const evidenceById =
    new Map<
      string,
      RuntimeCandidateEvidence
    >();

  for (const item of evidence) {
    if (
      evidenceById.has(
        item.id
      )
    ) {
      continue;
    }

    evidenceById.set(
      item.id,
      item
    );
  }

  return [
    ...evidenceById.values(),
  ];
}