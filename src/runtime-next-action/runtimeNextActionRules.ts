import type {
  RuntimeCandidateEvidence,
} from "./runtimeEvidenceTypes";
import type {
  RuntimeRecommendationCandidate,
  RuntimeRecommendationSpecificity,
} from "./runtimeRecommendationCandidateTypes";

export type RuntimeNextActionRuleParams = {
  hasRepository: boolean;
  hasReflectionDraft: boolean;
  hasGitHubSnapshot: boolean;

  currentFocus: string | null;
  recommendedFocus: string | null;
  nextInterpretation: string | null;
  adaptiveCoaching: string | null;
  decisionReviewQuestion: string | null;
  nextQuestion: string | null;

  recentCommitCount: number;
  recentPullRequestCount: number;
  reflectionCount: number;
  connectedEventCount: number;
};

/* ------------------------------------------------------------------ */
/* Context Recovery */
/* ------------------------------------------------------------------ */

export function createMissingGitHubSnapshotCandidate({
  hasRepository,
  hasGitHubSnapshot,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  if (
    !hasRepository ||
    hasGitHubSnapshot
  ) {
    return null;
  }

  return {
    id: "missing-github-snapshot",

    kind: "analyze-github",
    category: "context-recovery",

    title:
      "Capture the latest GitHub activity.",
    description:
      "Use Analyze GitHub Project to give Runtime current implementation evidence.",
    reason:
      "Runtime does not yet have a current GitHub Snapshot for this project.",

    target: "github-analysis",
    confidence: "high",

    source: "project-state",
    sourceLabel:
      "Missing GitHub Snapshot",

    isActionable: true,
    isBlocking: true,

    basePriority: 1000,
    specificity: "high",

    evidence: [
      {
        id: "repository-connected",
        label: "Repository connected",
        value: hasRepository,
        description:
          "The project has a selected GitHub repository.",
        source: "project-state",
      },
      {
        id: "github-snapshot-available",
        label: "GitHub Snapshot",
        value: hasGitHubSnapshot,
        description:
          "No current implementation Snapshot is available.",
        source: "github-snapshot",
      },
    ],
  };
}

export function createMissingReflectionCandidate({
  hasGitHubSnapshot,
  recentCommitCount,
  recentPullRequestCount,
  reflectionCount,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  const projectActivityCount =
    Math.max(0, recentCommitCount) +
    Math.max(0, recentPullRequestCount);

  const safeReflectionCount =
    Math.max(0, reflectionCount);

  if (
    !hasGitHubSnapshot ||
    projectActivityCount === 0 ||
    safeReflectionCount > 0
  ) {
    return null;
  }

  return {
    id: "missing-reflection",

    kind: "write-reflection",
    category: "reflection",

    title:
      "Write one Reflection explaining why the latest project change was necessary.",
    description:
      "Describe the decision, trade-off, or concern behind the most important recent change.",
    reason:
      "Runtime can see what changed in GitHub, but it still cannot explain why the change was made.",

    target: "reflection",
    confidence: "high",

    source: "project-state",
    sourceLabel:
      "Project activity without Reflection",

    isActionable: true,
    isBlocking: true,

    basePriority: 950,
    specificity: "high",

    evidence: [
      {
        id: "github-snapshot-available",
        label: "GitHub Snapshot",
        value: hasGitHubSnapshot,
        description:
          "A current GitHub Snapshot is available for the project.",
        source: "github-snapshot",
      },
      {
        id: "recent-commit-count",
        label: "Recent commits",
        value:
          Math.max(0, recentCommitCount),
        description:
          "Recent implementation activity was captured from GitHub.",
        source: "github-snapshot",
      },
      {
        id: "recent-pull-request-count",
        label: "Recent pull requests",
        value:
          Math.max(
            0,
            recentPullRequestCount
          ),
        description:
          "Recent pull request activity was included in the Snapshot.",
        source: "github-snapshot",
      },
      {
        id: "reflection-count",
        label: "Reflection records",
        value:
          safeReflectionCount,
        description:
          "No project-level Reflection currently explains the recent changes.",
        source: "reflection-state",
      },
    ],
  };
}

export function createMissingGitHubContextCandidate({
  hasRepository,
  hasGitHubSnapshot,
  reflectionCount,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  const safeReflectionCount =
    Math.max(0, reflectionCount);

  if (
    safeReflectionCount === 0 ||
    hasGitHubSnapshot
  ) {
    return null;
  }

  return {
    id: "missing-github-context",

    kind: "analyze-reflection-with-github",
    category: "context-recovery",

    title:
      "Connect your next Reflection with current GitHub activity.",
    description:
      "After the next meaningful project change, write a new Reflection and use Reflection + GitHub.",
    reason:
      "Runtime has reasoning context, but it does not yet have implementation evidence to compare with it.",

    target: "combined-analysis",
    confidence: "high",

    source: "project-state",
    sourceLabel:
      "Reflection without GitHub context",

    isActionable:
      hasRepository,
    isBlocking: true,

    basePriority: 900,
    specificity: "high",

    evidence: [
      {
        id: "reflection-count",
        label: "Reflection records",
        value:
          safeReflectionCount,
        description:
          "Reflection context is available for the project.",
        source: "reflection-state",
      },
      {
        id: "repository-connected",
        label: "Repository connected",
        value:
          hasRepository,
        description:
          hasRepository
            ? "A GitHub repository is connected to the project."
            : "No GitHub repository is currently connected.",
        source: "project-state",
      },
      {
        id: "github-snapshot-available",
        label: "GitHub Snapshot",
        value:
          hasGitHubSnapshot,
        description:
          "No current GitHub Snapshot is available for comparison.",
        source: "github-snapshot",
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Runtime Recommendations */
/* ------------------------------------------------------------------ */

export function createRecommendedFocusCandidate({
  currentFocus,
  recommendedFocus,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  if (recommendedFocus === null) {
    return null;
  }

  const recommendedFocusEvidence:
    RuntimeCandidateEvidence[] = [
      {
        id: "recommended-focus",
        label: "Recommended Focus",
        value:
          recommendedFocus,
        description:
          "Runtime identified this as the most relevant current direction.",
        source: "recommended-focus",
      },
      {
        id: "current-focus",
        label: "Current project focus",
        value:
          currentFocus ??
          "Not specified",
        description:
          "The Runtime recommendation was interpreted against the active project focus.",
        source: "project-state",
      },
    ];

  const normalizedFocus =
    recommendedFocus.toLowerCase();

  const specificity =
    resolveRecommendationSpecificity(
      recommendedFocus
    );

  if (
    normalizedFocus.includes("stabilize") ||
    normalizedFocus.includes("stabilizing")
  ) {
    return {
      id: "recommended-focus-stabilization",

      kind: "stabilize-current-focus",
      category: "project-stabilization",

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
      isBlocking: false,

      basePriority: 700,
      specificity,

      evidence: [
        ...recommendedFocusEvidence,
        {
          id: "recommendation-direction",
          label: "Recommendation direction",
          value: "Stabilization",
          description:
            "The Recommended Focus was interpreted as a stabilization action.",
          source: "recommended-focus",
        },
      ],
    };
  }

  if (
    normalizedFocus.includes("clarify") ||
    normalizedFocus.includes("define")
  ) {
    return {
      id: "recommended-focus-clarification",

      kind: "stabilize-current-focus",
      category: "project-stabilization",

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
      isBlocking: false,

      basePriority: 690,
      specificity,

      evidence: [
        ...recommendedFocusEvidence,
        {
          id: "recommendation-direction",
          label: "Recommendation direction",
          value: "Stabilization",
          description:
            "The Recommended Focus was interpreted as a stabilization action.",
          source: "recommended-focus",
        },
      ],
    };
  }

  if (
    normalizedFocus.includes("review") ||
    normalizedFocus.includes("revisit")
  ) {
    return {
      id: "recommended-focus-review",

      kind: "review-project-direction",
      category: "project-review",

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
      isBlocking: false,

      basePriority: 680,
      specificity,

      evidence: [
        ...recommendedFocusEvidence,
        {
          id: "recommendation-direction",
          label: "Recommendation direction",
          value: "Stabilization",
          description:
            "The Recommended Focus was interpreted as a stabilization action.",
          source: "recommended-focus",
        },
      ],
    };
  }

  if (
    normalizedFocus.includes("reflect") ||
    normalizedFocus.includes("explain why") ||
    normalizedFocus.includes("reason")
  ) {
    return {
      id: "recommended-focus-reflection",

      kind: "write-reflection",
      category: "reflection",

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
      isBlocking: false,

      basePriority: 670,
      specificity,

      evidence: [
        ...recommendedFocusEvidence,
        {
          id: "recommendation-direction",
          label: "Recommendation direction",
          value: "Stabilization",
          description:
            "The Recommended Focus was interpreted as a stabilization action.",
          source: "recommended-focus",
        },
      ],
    };
  }

  return {
    id: "recommended-focus-general",

    kind: "continue-project-work",
    category: "project-direction",

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
    isBlocking: false,

    basePriority: 650,
    specificity,

      evidence: [
        ...recommendedFocusEvidence,
        {
          id: "recommendation-direction",
          label: "Recommendation direction",
          value: "Stabilization",
          description:
            "The Recommended Focus was interpreted as a stabilization action.",
          source: "recommended-focus",
        },
      ],
  };
}

export function createAdaptiveCoachingCandidate({
  adaptiveCoaching,
  currentFocus,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  if (adaptiveCoaching === null) {
    return null;
  }

  return {
    id: "adaptive-coaching",

    kind: "continue-project-work",
    category: "project-direction",

    title:
      "Apply the current coaching focus to the next project change.",
    description:
      adaptiveCoaching,
    reason:
      "Runtime selected this coaching direction from the current project and Reflection signals.",

    target: "current-focus",
    confidence: "medium",

    source: "adaptive-coaching",
    sourceLabel: "Adaptive Coaching",

    isActionable: true,
    isBlocking: false,

    basePriority: 600,
    specificity:
      resolveRecommendationSpecificity(
        adaptiveCoaching
      ),

    evidence: [
      {
        id: "adaptive-coaching",
        label: "Adaptive Coaching",
        value:
          adaptiveCoaching,
        description:
          "Runtime generated this coaching direction from the current project and Reflection signals.",
        source: "adaptive-coaching",
      },
      {
        id: "current-focus",
        label: "Current project focus",
        value:
          currentFocus ??
          "Not specified",
        description:
          "The coaching signal was interpreted against the active project focus.",
        source: "project-state",
      },
    ],
  };
}

export function createNextQuestionCandidate({
  nextQuestion,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  if (nextQuestion === null) {
    return null;
  }

  return {
    id: "next-question",

    kind: "write-reflection",
    category: "reflection",

    title:
      "Answer Runtime’s next question in a new Reflection.",
    description:
      nextQuestion,
    reason:
      "This question addresses the most important missing reasoning in the current interpretation.",

    target: "reflection",
    confidence: "medium",

    source: "next-question",
    sourceLabel: "Next Question",

    isActionable: true,
    isBlocking: false,

    basePriority: 500,
    specificity:
      resolveRecommendationSpecificity(
        nextQuestion
      ),

    evidence: [
      {
        id: "next-question",
        label: "Next Question",
        value:
          nextQuestion,
        description:
          "Runtime identified this question as the most relevant unresolved reasoning gap.",
        source: "next-question",
      },
    ],
  };
}

export function createDecisionReviewCandidate({
  decisionReviewQuestion,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  if (decisionReviewQuestion === null) {
    return null;
  }

  return {
    id: "decision-review",

    kind: "write-reflection",
    category: "reflection",

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
    isBlocking: false,

    basePriority: 480,
    specificity:
      resolveRecommendationSpecificity(
        decisionReviewQuestion
      ),

    evidence: [
      {
        id: "decision-review-question",
        label: "Decision Review",
        value:
          decisionReviewQuestion,
        description:
          "Runtime identified this unresolved decision as requiring further Reflection.",
        source: "decision-review",
      },
    ],
  };
}

export function createNextInterpretationCandidate({
  nextInterpretation,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  if (nextInterpretation === null) {
    return null;
  }

  return {
    id: "next-interpretation",

    kind: "review-project-direction",
    category: "project-review",

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
    isBlocking: false,

    basePriority: 460,
    specificity:
      resolveRecommendationSpecificity(
        nextInterpretation
      ),

    evidence: [
      {
        id: "next-interpretation",
        label: "Next Interpretation",
        value:
          nextInterpretation,
        description:
          "Runtime generated this as the likely next interpretation of the project direction.",
        source: "next-interpretation",
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Continuity */
/* ------------------------------------------------------------------ */

export function createContinuityCandidate({
  hasRepository,
  connectedEventCount,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  const safeConnectedEventCount =
    Math.max(0, connectedEventCount);

  if (
    safeConnectedEventCount === 0 ||
    safeConnectedEventCount >= 3
  ) {
    return null;
  }

  return {
    id: "early-project-continuity",

    kind: "continue-project-work",
    category: "continuity",

    title:
      "Make one meaningful project change, then record why you made it.",
    description:
      "Use Reflection + GitHub after the change so Runtime can compare implementation and reasoning again.",
    reason:
      "The connection between project activity and Reflection is visible, but repeated evidence is still limited.",

    target: "combined-analysis",
    confidence: "medium",

    source: "project-state",
    sourceLabel:
      "Early project continuity",

    isActionable:
      hasRepository,
    isBlocking: false,

    basePriority: 400,
    specificity: "high",

    evidence: [
      {
        id: "connected-event-count",
        label: "Connected events",
        value:
          safeConnectedEventCount,
        description:
          "This many project and Reflection events are currently connected.",
        source: "continuity",
      },
      {
        id: "repository-connected",
        label: "Repository connected",
        value:
          hasRepository,
        description:
          "A connected repository allows Runtime to compare project activity with Reflection.",
        source: "project-state",
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Current Landing State */
/* ------------------------------------------------------------------ */

export function createReflectionDraftWithGitHubCandidate({
  hasRepository,
  hasReflectionDraft,
  hasGitHubSnapshot,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  if (
    !hasReflectionDraft ||
    !hasRepository
  ) {
    return null;
  }

  return {
    id: "reflection-draft-with-github",

    kind: "analyze-reflection-with-github",
    category: "reflection",

    title:
      "Analyze the current Reflection with the latest GitHub activity.",
    description:
      "Use Reflection + GitHub to connect the current reasoning with recent implementation evidence.",
    reason:
      "A Reflection draft is ready, and Runtime can compare it with the current project state.",

    target: "combined-analysis",
    confidence: "high",

    source: "fallback",
    sourceLabel:
      "Current Landing state",

    isActionable: true,
    isBlocking: false,

    basePriority: 850,
    specificity: "high",

    evidence: [
      {
        id: "reflection-draft-available",
        label: "Reflection draft",
        value:
          hasReflectionDraft,
        description:
          "A Reflection draft is ready for analysis.",
        source: "reflection-state",
      },
      {
        id: "repository-connected",
        label: "Repository connected",
        value:
          hasRepository,
        description:
          "A repository is available for combined analysis.",
        source: "project-state",
      },
      {
        id: "github-snapshot-available",
        label: "GitHub Snapshot",
        value:
          hasGitHubSnapshot,
        description:
          hasGitHubSnapshot
            ? "A current GitHub Snapshot is available."
            : "A fresh GitHub Snapshot will be captured during combined analysis.",
        source: "github-snapshot",
      },
    ],
  };
}

export function createReflectionDraftOnlyCandidate({
  hasRepository,
  hasReflectionDraft,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  if (
    !hasReflectionDraft ||
    hasRepository
  ) {
    return null;
  }

  return {
    id: "reflection-draft-only",

    kind: "write-reflection",
    category: "reflection",

    title:
      "Analyze the current Reflection.",
    description:
      "Use Reflection Only to record and interpret the current thought.",
    reason:
      "A Reflection draft is ready, but no repository is available for combined analysis.",

    target: "reflection",
    confidence: "high",

    source: "fallback",
    sourceLabel:
      "Current Reflection draft",

    isActionable: true,
    isBlocking: false,

    basePriority: 840,
    specificity: "high",

    evidence: [
      {
        id: "reflection-draft-available",
        label: "Reflection draft",
        value:
          hasReflectionDraft,
        description:
          "A Reflection draft is ready for analysis.",
        source: "reflection-state",
      },
      {
        id: "repository-connected",
        label: "Repository connected",
        value:
          hasRepository,
        description:
          "No repository is available for combined analysis.",
        source: "project-state",
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Fallback */
/* ------------------------------------------------------------------ */

export function createCurrentFocusFallbackCandidate({
  currentFocus,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate | null {
  if (currentFocus === null) {
    return null;
  }

  return {
    id: "current-focus-fallback",

    kind: "continue-project-work",
    category: "fallback",

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
    isBlocking: false,

    basePriority: 100,
    specificity:
      resolveRecommendationSpecificity(
        currentFocus
      ),

    evidence: [
      {
        id: "current-focus",
        label: "Current project focus",
        value:
          currentFocus,
        description:
          "The current focus is the strongest available project direction.",
        source: "project-state",
      },
      {
        id: "stronger-runtime-signal-available",
        label: "Stronger Runtime signal",
        value: false,
        description:
          "No more specific Runtime recommendation is currently available.",
        source: "fallback",
      },
    ],
  };
}

export function createInsufficientContextCandidate({
  hasRepository,
  hasGitHubSnapshot,
  currentFocus,
  reflectionCount,
  connectedEventCount,
}: RuntimeNextActionRuleParams):
  RuntimeRecommendationCandidate {
  const safeReflectionCount =
    Math.max(0, reflectionCount);

  const safeConnectedEventCount =
    Math.max(0, connectedEventCount);

  return {
    id: "insufficient-context",

    kind: "insufficient-context",
    category: "fallback",

    title:
      "Add one meaningful project or Reflection event.",
    description:
      "Continue the project, capture GitHub activity, or record a Reflection so Runtime can produce a more specific recommendation.",
    reason:
      "Runtime does not yet have enough current evidence to recommend one precise next action.",

    target: "runtime-details",
    confidence: "low",

    source: "fallback",
    sourceLabel:
      "Insufficient context",

    isActionable: false,
    isBlocking: false,

    basePriority: 0,
    specificity: "low",

    evidence: [
      {
        id: "repository-connected",
        label: "Repository connected",
        value:
          hasRepository,
        description:
          "Indicates whether implementation context is currently available.",
        source: "project-state",
      },
      {
        id: "github-snapshot-available",
        label: "GitHub Snapshot",
        value:
          hasGitHubSnapshot,
        description:
          "Indicates whether recent GitHub activity has been captured.",
        source: "github-snapshot",
      },
      {
        id: "reflection-count",
        label: "Reflection records",
        value:
          safeReflectionCount,
        description:
          "The number of available project-level Reflection records.",
        source: "reflection-state",
      },
      {
        id: "connected-event-count",
        label: "Connected events",
        value:
          safeConnectedEventCount,
        description:
          "The number of project events currently connected to Reflection.",
        source: "continuity",
      },
      {
        id: "current-focus",
        label: "Current project focus",
        value:
          currentFocus ??
          "Not specified",
        description:
          "The current project focus available to Runtime.",
        source: "project-state",
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function resolveRecommendationSpecificity(
  value: string
): RuntimeRecommendationSpecificity {
  const normalizedValue =
    value.trim();

  if (normalizedValue.length === 0) {
    return "low";
  }

  const wordCount =
    normalizedValue
      .split(/\s+/)
      .filter(Boolean)
      .length;

  if (
    wordCount <= 2 ||
    normalizedValue.length < 12
  ) {
    return "low";
  }

  if (
    wordCount <= 7 ||
    normalizedValue.length < 48
  ) {
    return "medium";
  }

  return "high";
}