import type {
    RuntimeRecommendationCandidate,
    RuntimeRecommendationResolutionType,
} from "./runtimeRecommendationCandidateTypes";

import type {
    RuntimeWhyExplanation,
} from "./runtimeWhyTypes";

export type CreateRuntimeWhyExplanationParams = {
  primary:
    RuntimeRecommendationCandidate;

  supporting:
    RuntimeRecommendationCandidate[];

  resolution:
    RuntimeRecommendationResolutionType;
};

/**
 * 최종 Recommendation resolution 결과를
 * 사용자 중심의 Why 설명으로 변환합니다.
 *
 * 이 함수는 Candidate score, 내부 ID,
 * Runtime payload와 같은 기술적 근거를
 * 사용자에게 직접 노출하지 않습니다.
 *
 * 구체적인 evidence 공개는
 * PR-044 Runtime Evidence Layer의 책임입니다.
 */
export function createRuntimeWhyExplanation({
  primary,
  supporting,
  resolution,
}: CreateRuntimeWhyExplanationParams):
  RuntimeWhyExplanation {
  return {
    summary:
      createWhySummary(
        primary,
        supporting,
        resolution
      ),

    context:
      createWhyContext(
        primary
      ),

    priorityReason:
      createWhyPriorityReason(
        primary,
        supporting,
        resolution
      ),

    expectedOutcome:
      createExpectedOutcome(
        primary
      ),

    priority:
      resolveWhyPriority(
        primary,
        resolution
      ),
  };
}

/* ------------------------------------------------------------------ */
/* Summary */
/* ------------------------------------------------------------------ */

function createWhySummary(
  primary:
    RuntimeRecommendationCandidate,
  supporting:
    RuntimeRecommendationCandidate[],
  resolution:
    RuntimeRecommendationResolutionType
): string {
  if (primary.isBlocking) {
    return createBlockingSummary(
      primary
    );
  }

  if (
    resolution === "merged" &&
    supporting.length > 0
  ) {
    return createReinforcedSummary(
      primary
    );
  }

  if (
    primary.category === "fallback"
  ) {
    return (
      "Runtime does not yet have a stronger specific signal, " +
      "so it is presenting the most useful action supported " +
      "by the current project context."
    );
  }

  return createPrimarySummary(
    primary
  );
}

function createBlockingSummary(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.id) {
    case "missing-github-snapshot":
      return (
        "Runtime needs current implementation evidence " +
        "before it can reliably guide the next project step."
      );

    case "missing-reflection":
      return (
        "Recent GitHub activity shows what changed, " +
        "but no Reflection currently explains why it changed."
      );

    case "missing-github-context":
      return (
        "Runtime has Reflection context, but it still needs " +
        "recent implementation evidence for comparison."
      );

    default:
      return primary.reason;
  }
}

function createReinforcedSummary(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.category) {
    case "reflection":
      return (
        "Multiple Runtime signals point to the same missing " +
        "reasoning context, so Reflection is the clearest next step."
      );

    case "project-stabilization":
      return (
        "Multiple Runtime signals indicate that the current layer " +
        "should be stabilized before the project expands."
      );

    case "project-review":
      return (
        "Multiple Runtime signals suggest reviewing the current " +
        "direction before making another implementation change."
      );

    case "project-direction":
      return (
        "Multiple Runtime signals support continuing work " +
        "in the same current project direction."
      );

    case "continuity":
      return (
        "Multiple Runtime signals support creating another " +
        "connected project and Reflection event."
      );

    case "context-recovery":
      return (
        "Multiple Runtime signals indicate that missing project " +
        "context should be restored before continuing."
      );

    case "fallback":
      return primary.reason;
  }
}

function createPrimarySummary(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.category) {
    case "context-recovery":
      return (
        "Runtime needs additional current project context " +
        "before it can make a more strategic recommendation."
      );

    case "reflection":
      return (
        "Runtime has identified missing reasoning that can be " +
        "clarified most directly through Reflection."
      );

    case "project-stabilization":
      return (
        "Runtime sees expansion pressure before the current " +
        "project layer has become sufficiently stable."
      );

    case "project-review":
      return (
        "Runtime recommends reviewing the current direction " +
        "before adding more implementation activity."
      );

    case "project-direction":
      return (
        "Runtime identified this direction as the most meaningful " +
        "current continuation of the project."
      );

    case "continuity":
      return (
        "Runtime can see an emerging connection between project " +
        "activity and Reflection, but repeated evidence is still limited."
      );

    case "fallback":
      return primary.reason;
  }
}

/* ------------------------------------------------------------------ */
/* Current Context */
/* ------------------------------------------------------------------ */

function createWhyContext(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.category) {
    case "context-recovery":
      return createContextRecoveryExplanation(
        primary
      );

    case "reflection":
      return createReflectionExplanation(
        primary
      );

    case "project-stabilization":
      return createStabilizationExplanation(
        primary
      );

    case "project-review":
      return createProjectReviewExplanation(
        primary
      );

    case "project-direction":
      return createProjectDirectionExplanation(
        primary
      );

    case "continuity":
      return createContinuityExplanation(
        primary
      );

    case "fallback":
      return createFallbackExplanation(
        primary
      );
  }
}

function createContextRecoveryExplanation(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.id) {
    case "missing-github-snapshot":
      return (
        "The project is connected to a repository, " +
        "but Runtime does not yet have a recent GitHub Snapshot."
      );

    case "missing-github-context":
      return (
        "Reflection history is available, but Runtime cannot yet " +
        "compare that reasoning with recent implementation activity."
      );

    default:
      return primary.reason;
  }
}

function createReflectionExplanation(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.id) {
    case "missing-reflection":
      return (
        "Recent commits or pull requests provide implementation " +
        "evidence, but the reasoning behind those changes is absent."
      );

    case "next-question":
      return (
        "Runtime has identified one unresolved question that would " +
        "improve its understanding of the current project direction."
      );

    case "decision-review":
      return (
        "A recent project decision remains insufficiently explained " +
        "in the current Reflection history."
      );

    case "recommended-focus-reflection":
      return (
        "The current Recommended Focus indicates that the reasoning " +
        "behind the project direction needs to be made more explicit."
      );

    case "reflection-draft-with-github":
      return (
        "A Reflection draft and connected repository are both " +
        "available for a combined analysis."
      );

    case "reflection-draft-only":
      return (
        "A Reflection draft is available, but no repository context " +
        "is currently available for combined analysis."
      );

    default:
      return primary.reason;
  }
}

function createStabilizationExplanation(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.id) {
    case "recommended-focus-stabilization":
      return (
        "Runtime sees a meaningful current project layer, " +
        "but its completion boundary is not yet stable enough " +
        "for safe expansion."
      );

    case "recommended-focus-clarification":
      return (
        "The current project direction is visible, but the conditions " +
        "that define completion are not yet sufficiently explicit."
      );

    default:
      return primary.reason;
  }
}

function createProjectReviewExplanation(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.id) {
    case "recommended-focus-review":
      return (
        "Recent project movement suggests that the current direction " +
        "should be checked before another implementation change."
      );

    case "next-interpretation":
      return (
        "Runtime has produced a likely next interpretation, " +
        "but it has not yet translated that interpretation " +
        "into one sufficiently specific implementation action."
      );

    default:
      return primary.reason;
  }
}

function createProjectDirectionExplanation(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.id) {
    case "recommended-focus-general":
      return (
        "Runtime has identified the current focus as the strongest " +
        "available direction for continued project work."
      );

    case "adaptive-coaching":
      return (
        "The current coaching signal reflects both project movement " +
        "and available Reflection context."
      );

    default:
      return primary.reason;
  }
}

function createContinuityExplanation(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.id) {
    case "early-project-continuity":
      return (
        "Runtime can see an initial connection between implementation " +
        "activity and written reasoning, but only a small number " +
        "of connected events are available."
      );

    default:
      return primary.reason;
  }
}

function createFallbackExplanation(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.id) {
    case "current-focus-fallback":
      return (
        "A current project focus is available, but Runtime does not " +
        "yet have enough stronger evidence for a more specific action."
      );

    case "insufficient-context":
      return (
        "Runtime currently lacks enough recent project or Reflection " +
        "evidence to identify one precise next step."
      );

    default:
      return primary.reason;
  }
}

/* ------------------------------------------------------------------ */
/* Why This Comes First */
/* ------------------------------------------------------------------ */

function createWhyPriorityReason(
  primary:
    RuntimeRecommendationCandidate,
  supporting:
    RuntimeRecommendationCandidate[],
  resolution:
    RuntimeRecommendationResolutionType
): string {
  if (primary.isBlocking) {
    return (
      "This missing context must be resolved before Runtime can " +
      "reliably recommend a more strategic next step."
    );
  }

  if (
    resolution === "merged" &&
    supporting.length > 0
  ) {
    return (
      "Multiple Runtime signals independently point toward the same " +
      "action, so this recommendation has priority."
    );
  }

  switch (primary.category) {
    case "project-stabilization":
      return (
        "Stabilizing the current layer is more important than adding " +
        "another visible capability before its boundaries are clear."
      );

    case "project-review":
      return (
        "Reviewing direction now can prevent additional work from " +
        "reinforcing an unclear or unsuitable project decision."
      );

    case "reflection":
      return (
        "Clarifying the missing reasoning now will make later Runtime " +
        "interpretation and project coaching more reliable."
      );

    case "project-direction":
      return (
        "This is the strongest actionable direction currently supported " +
        "by the available project and Runtime context."
      );

    case "continuity":
      return (
        "Creating another connected event is more useful now than drawing " +
        "a strong long-term conclusion from limited evidence."
      );

    case "context-recovery":
      return (
        "Recovering missing context takes priority because later " +
        "recommendations depend on that evidence."
      );

    case "fallback":
      return (
        "No stronger Runtime recommendation is currently available, " +
        "so the most useful supported project action is shown."
      );
  }
}

/* ------------------------------------------------------------------ */
/* Expected Outcome */
/* ------------------------------------------------------------------ */

function createExpectedOutcome(
  primary:
    RuntimeRecommendationCandidate
): string {
  switch (primary.kind) {
    case "analyze-github":
      return (
        "Runtime will gain current implementation evidence " +
        "for the next recommendation."
      );

    case "write-reflection":
      return (
        "Runtime will gain clearer reasoning context about " +
        "the recent project decision."
      );

    case "analyze-reflection-with-github":
      return (
        "Runtime will be able to compare recent implementation activity " +
        "with the reasoning behind it."
      );

    case "stabilize-current-focus":
      return (
        "The completion boundary of the current project layer " +
        "will become clearer before expansion."
      );

    case "review-project-direction":
      return (
        "The next implementation step can be selected with less risk " +
        "of reinforcing the wrong project direction."
      );

    case "continue-project-work":
      return (
        "The project will generate another meaningful event that Runtime " +
        "can connect to the learner’s reasoning and continuity."
      );

    case "insufficient-context":
      return (
        "A new project or Reflection event will give Runtime enough " +
        "context to produce a more precise recommendation."
      );

    default:
      return (
        "Runtime will gain stronger context for producing " +
        "the next meaningful recommendation."
      );
  }
}

/* ------------------------------------------------------------------ */
/* Why Priority */
/* ------------------------------------------------------------------ */

function resolveWhyPriority(
  primary:
    RuntimeRecommendationCandidate,
  resolution:
    RuntimeRecommendationResolutionType
): RuntimeWhyExplanation["priority"] {
  if (primary.isBlocking) {
    return "blocking";
  }

  if (
    primary.category === "fallback"
  ) {
    return "fallback";
  }

  if (
    resolution === "merged"
  ) {
    return "reinforced";
  }

  return "primary";
}