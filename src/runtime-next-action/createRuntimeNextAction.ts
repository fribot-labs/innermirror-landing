import type {
    CreateRuntimeNextActionParams,
    RuntimeNextAction,
} from "./runtimeNextActionTypes";

export function createRuntimeNextAction({
  hasProject,
  hasRepository,
  hasReflectionDraft,
  hasGitHubSnapshot,
  currentFocus,
  recommendedFocus,
  nextInterpretation,
  adaptiveCoaching,
  decisionReviewQuestion,
  nextQuestion,
  recentCommitCount,
  recentPullRequestCount,
  reflectionCount,
  connectedEventCount,
}: CreateRuntimeNextActionParams): RuntimeNextAction | null {
  if (!hasProject) {
    return null;
  }

  const normalizedCurrentFocus =
    normalizeOptionalText(currentFocus);

  const normalizedRecommendedFocus =
    normalizeOptionalText(recommendedFocus);

  const normalizedNextInterpretation =
    normalizeOptionalText(nextInterpretation);

  const normalizedAdaptiveCoaching =
    normalizeOptionalText(adaptiveCoaching);

  const normalizedDecisionReviewQuestion =
    normalizeOptionalText(decisionReviewQuestion);

  const normalizedNextQuestion =
    normalizeOptionalText(nextQuestion);

  const projectActivityCount =
    Math.max(0, recentCommitCount) +
    Math.max(0, recentPullRequestCount);

  const safeReflectionCount =
    Math.max(0, reflectionCount);

  const safeConnectedEventCount =
    Math.max(0, connectedEventCount);

  /*
   * Rule 1
   *
   * Runtime can see recent implementation activity,
   * but the learner has not yet recorded project reasoning.
   */
  if (
    hasGitHubSnapshot &&
    projectActivityCount > 0 &&
    safeReflectionCount === 0
  ) {
    return {
      kind: "write-reflection",
      title:
        "Write one Reflection explaining why the latest project change was necessary.",
      description:
        "Describe the decision, trade-off, or concern behind the most important recent change.",
      reason:
        "Runtime can see what changed in GitHub, but it still cannot explain why the change was made.",
      target: "reflection",
      confidence: "high",
      source: "project-state",
      sourceLabel: "Project activity without Reflection",
      isActionable: true,
    };
  }

  /*
   * Rule 2
   *
   * Reflection history exists, but no GitHub Snapshot
   * is available for comparison.
   *
   * The current MVP cannot reuse a previously saved
   * Reflection for combined analysis, so the recommendation
   * explicitly refers to the next Reflection.
   */
  if (
    safeReflectionCount > 0 &&
    !hasGitHubSnapshot
  ) {
    return {
      kind: "analyze-reflection-with-github",
      title:
        "Connect your next Reflection with current GitHub activity.",
      description:
        "After the next meaningful project change, write a new Reflection and use Reflection + GitHub.",
      reason:
        "Runtime has reasoning context, but it does not yet have implementation evidence to compare with it.",
      target: "combined-analysis",
      confidence: "high",
      source: "project-state",
      sourceLabel: "Reflection without GitHub context",
      isActionable:
        hasRepository,
    };
  }

  /*
   * Rule 3
   *
   * Prefer a concrete Runtime Recommended Focus when
   * it can be translated safely into an actionable step.
   */
  const recommendedFocusAction =
    createActionFromRecommendedFocus(
      normalizedRecommendedFocus,
      normalizedCurrentFocus
    );

  if (recommendedFocusAction !== null) {
    return recommendedFocusAction;
  }

  /*
   * Rule 4
   *
   * Adaptive Coaching can provide the next implementation
   * direction when no stronger state-based rule exists.
   */
  if (normalizedAdaptiveCoaching !== null) {
    return {
      kind: "continue-project-work",
      title:
        "Apply the current coaching focus to the next project change.",
      description:
        normalizedAdaptiveCoaching,
      reason:
        "Runtime selected this coaching direction from the current project and Reflection signals.",
      target: "current-focus",
      confidence: "medium",
      source: "adaptive-coaching",
      sourceLabel: "Adaptive Coaching",
      isActionable: true,
    };
  }

  /*
   * Rule 5
   *
   * Runtime Next Question becomes a concrete prompt
   * for the learner's next Reflection.
   */
  if (normalizedNextQuestion !== null) {
    return {
      kind: "write-reflection",
      title:
        "Answer Runtime’s next question in a new Reflection.",
      description:
        normalizedNextQuestion,
      reason:
        "This question addresses the most important missing reasoning in the current interpretation.",
      target: "reflection",
      confidence: "medium",
      source: "next-question",
      sourceLabel: "Next Question",
      isActionable: true,
    };
  }

  /*
   * Rule 6
   *
   * A connection between thinking and implementation
   * has started to form, but repeated evidence is limited.
   */
  if (
    safeConnectedEventCount > 0 &&
    safeConnectedEventCount < 3
  ) {
    return {
      kind: "continue-project-work",
      title:
        "Make one meaningful project change, then record why you made it.",
      description:
        "Use Reflection + GitHub after the change so Runtime can compare implementation and reasoning again.",
      reason:
        "The connection between project activity and Reflection is visible, but repeated evidence is still limited.",
      target: "combined-analysis",
      confidence: "medium",
      source: "project-state",
      sourceLabel: "Early project continuity",
      isActionable:
        hasRepository,
    };
  }

  return createFallbackNextAction({
    hasRepository,
    hasReflectionDraft,
    hasGitHubSnapshot,
    currentFocus:
      normalizedCurrentFocus,
    nextInterpretation:
      normalizedNextInterpretation,
    decisionReviewQuestion:
      normalizedDecisionReviewQuestion,
  });
}

type CreateRecommendedFocusActionParams = {
  recommendedFocus: string;
  currentFocus: string | null;
};

function createActionFromRecommendedFocus(
  recommendedFocus: string | null,
  currentFocus: string | null
): RuntimeNextAction | null {
  if (recommendedFocus === null) {
    return null;
  }

  const params: CreateRecommendedFocusActionParams = {
    recommendedFocus,
    currentFocus,
  };

  const normalizedFocus =
    recommendedFocus.toLowerCase();

  if (
    normalizedFocus.includes("stabilize") ||
    normalizedFocus.includes("stabilizing")
  ) {
    return createStabilizationAction(params);
  }

  if (
    normalizedFocus.includes("clarify") ||
    normalizedFocus.includes("define")
  ) {
    return {
      kind: "stabilize-current-focus",
      title:
        "Clarify the completion criteria for the current project focus.",
      description:
        recommendedFocus,
      reason:
        "Runtime sees an important direction, but the next completion boundary is not yet explicit.",
      target: "current-focus",
      confidence: "medium",
      source: "recommended-focus",
      sourceLabel: "Recommended Focus",
      isActionable: true,
    };
  }

  if (
    normalizedFocus.includes("review") ||
    normalizedFocus.includes("revisit")
  ) {
    return {
      kind: "review-project-direction",
      title:
        "Review the recent project direction before making the next change.",
      description:
        recommendedFocus,
      reason:
        "Runtime recommends checking the current direction before adding more implementation activity.",
      target: "project-timeline",
      confidence: "medium",
      source: "recommended-focus",
      sourceLabel: "Recommended Focus",
      isActionable: true,
    };
  }

  if (
    normalizedFocus.includes("reflect") ||
    normalizedFocus.includes("explain why") ||
    normalizedFocus.includes("reason")
  ) {
    return {
      kind: "write-reflection",
      title:
        "Write a Reflection that explains the reasoning behind the current project direction.",
      description:
        recommendedFocus,
      reason:
        "Runtime needs clearer reasoning evidence to interpret why the project is changing.",
      target: "reflection",
      confidence: "medium",
      source: "recommended-focus",
      sourceLabel: "Recommended Focus",
      isActionable: true,
    };
  }

  /*
   * Do not convert an unclear Recommended Focus into
   * an artificial action. The original Runtime text can
   * still be used safely as supporting description.
   */
  return {
    kind: "continue-project-work",
    title:
      currentFocus !== null
        ? `Continue the next meaningful step in "${currentFocus}".`
        : "Continue the next meaningful project step.",
    description:
      recommendedFocus,
    reason:
      "Runtime identified this direction as the most relevant current focus.",
    target: "current-focus",
    confidence: "low",
    source: "recommended-focus",
    sourceLabel: "Recommended Focus",
    isActionable: true,
  };
}

function createStabilizationAction({
  recommendedFocus,
  currentFocus,
}: CreateRecommendedFocusActionParams): RuntimeNextAction {
  return {
    kind: "stabilize-current-focus",
    title:
      currentFocus !== null
        ? `Define what must be stable in "${currentFocus}" before expanding the project.`
        : "Define what must be stable before adding the next capability.",
    description:
      recommendedFocus,
    reason:
      "Runtime sees expansion pressure before the current layer has become sufficiently stable.",
    target: "current-focus",
    confidence: "medium",
    source: "recommended-focus",
    sourceLabel: "Recommended Focus",
    isActionable: true,
  };
}

type CreateFallbackNextActionParams = {
  hasRepository: boolean;
  hasReflectionDraft: boolean;
  hasGitHubSnapshot: boolean;
  currentFocus: string | null;
  nextInterpretation: string | null;
  decisionReviewQuestion: string | null;
};

function createFallbackNextAction({
  hasRepository,
  hasReflectionDraft,
  hasGitHubSnapshot,
  currentFocus,
  nextInterpretation,
  decisionReviewQuestion,
}: CreateFallbackNextActionParams): RuntimeNextAction {
  if (hasReflectionDraft && hasRepository) {
    return {
      kind: "analyze-reflection-with-github",
      title:
        "Analyze the current Reflection with the latest GitHub activity.",
      description:
        "Use Reflection + GitHub to connect the current reasoning with recent implementation evidence.",
      reason:
        "A Reflection draft is ready, and Runtime can compare it with the current project state.",
      target: "combined-analysis",
      confidence: "high",
      source: "fallback",
      sourceLabel: "Current Landing state",
      isActionable: true,
    };
  }

  if (hasReflectionDraft) {
    return {
      kind: "write-reflection",
      title:
        "Analyze the current Reflection.",
      description:
        "Use Reflection Only to record and interpret the current thought.",
      reason:
        "A Reflection draft is ready, but no repository is available for combined analysis.",
      target: "reflection",
      confidence: "high",
      source: "fallback",
      sourceLabel: "Current Reflection draft",
      isActionable: true,
    };
  }

  if (decisionReviewQuestion !== null) {
    return {
      kind: "write-reflection",
      title:
        "Reflect on the most important unresolved project decision.",
      description:
        decisionReviewQuestion,
      reason:
        "Runtime identified this decision as the clearest unresolved reasoning gap.",
      target: "reflection",
      confidence: "medium",
      source: "decision-review",
      sourceLabel: "Decision Review",
      isActionable: true,
    };
  }

  if (nextInterpretation !== null) {
    return {
      kind: "review-project-direction",
      title:
        "Review the next Runtime interpretation before changing project direction.",
      description:
        nextInterpretation,
      reason:
        "Runtime has identified a likely next interpretation, but not yet a sufficiently specific implementation action.",
      target: "runtime-details",
      confidence: "low",
      source: "next-interpretation",
      sourceLabel: "Next Interpretation",
      isActionable: true,
    };
  }

  if (!hasGitHubSnapshot && hasRepository) {
    return {
      kind: "analyze-github",
      title:
        "Capture the latest GitHub activity.",
      description:
        "Use Analyze GitHub Project to give Runtime current implementation evidence.",
      reason:
        "Runtime does not yet have a current GitHub Snapshot for this project.",
      target: "github-analysis",
      confidence: "high",
      source: "project-state",
      sourceLabel: "Missing GitHub Snapshot",
      isActionable: true,
    };
  }

  if (currentFocus !== null) {
    return {
      kind: "continue-project-work",
      title:
        `Complete one meaningful step in "${currentFocus}".`,
      description:
        "After the project changes, return and record why the change was made.",
      reason:
        "Runtime has enough context to recommend continued project work, but not enough evidence for a more specific action.",
      target: "current-focus",
      confidence: "low",
      source: "fallback",
      sourceLabel: "Current Focus",
      isActionable: true,
    };
  }

  return {
    kind: "insufficient-context",
    title:
      "Add one meaningful project or Reflection event.",
    description:
      "Continue the project, capture GitHub activity, or record a Reflection so Runtime can produce a more specific recommendation.",
    reason:
      "Runtime does not yet have enough current evidence to recommend one precise next action.",
    target: "runtime-details",
    confidence: "low",
    source: "fallback",
    sourceLabel: "Insufficient context",
    isActionable: false,
  };
}

function normalizeOptionalText(
  value: string | null | undefined
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue.length > 0
    ? normalizedValue
    : null;
}