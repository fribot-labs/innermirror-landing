import type {
  ProjectActionGuidance,
} from "./projectActionGuidanceTypes";

type ResolveProjectActionGuidanceParams = {
  hasRepository: boolean;
  hasProject: boolean;
  hasCurrentFocus: boolean;
  hasReflectionDraft: boolean;
  hasProjectSnapshot: boolean;
  isActionRunning: boolean;
};

export function resolveProjectActionGuidance({
  hasRepository,
  hasProject,
  hasCurrentFocus,
  hasReflectionDraft,
  hasProjectSnapshot,
  isActionRunning,
}: ResolveProjectActionGuidanceParams): ProjectActionGuidance {
  if (isActionRunning) {
    return createAllDisabledGuidance(
      "Another project action is currently running."
    );
  }

  if (!hasRepository) {
    return createAllDisabledGuidance(
      "Select a repository first."
    );
  }

  if (!hasProject) {
    return {
      startProject: {
        action:
          "start-project",

        availability:
          hasCurrentFocus
            ? "recommended"
            : "disabled",

        reason:
          hasCurrentFocus
            ? "Start the selected repository as a learning project."
            : "Enter a Current Focus first.",
      },

      updateProjectFocus: {
        action:
          "update-project-focus",

        availability:
          "disabled",

        reason:
          "Start the project first.",
      },

      analyzeGitHubProject: {
        action:
          "analyze-github-project",

        availability:
          "disabled",

        reason:
          "Start the project before analyzing GitHub activity.",
      },

      saveThought: {
        action:
          "save-thought",

        availability:
          "disabled",

        reason:
          "Start the project before saving a Reflection.",
      },

      thoughtProjectAnalyze: {
        action:
          "thought-project-analyze",

        availability:
          "disabled",

        reason:
          "Start the project before running combined analysis.",
      },
    };
  }

  return {
    startProject: {
      action:
        "start-project",

      availability:
        "disabled",

      reason:
        "The project has already been started.",
    },

    updateProjectFocus: {
      action:
        "update-project-focus",

      availability:
        hasCurrentFocus
          ? "available"
          : "disabled",

      reason:
        hasCurrentFocus
          ? "Update the current project focus."
          : "Enter a Current Focus first.",
    },

    analyzeGitHubProject: {
      action:
        "analyze-github-project",

      availability:
        hasReflectionDraft
          ? "available"
          : "recommended",

      reason:
        hasProjectSnapshot
          ? "Refresh recent GitHub activity without saving a Reflection."
          : "Capture recent GitHub activity without saving a Reflection.",
    },

    saveThought: {
      action:
        "save-thought",

      availability:
        hasReflectionDraft
          ? "available"
          : "disabled",

      reason:
        hasReflectionDraft
          ? "Available for the current Reflection."
          : "Enter a Reflection first.",
    },

    thoughtProjectAnalyze: {
      action:
        "thought-project-analyze",

      availability:
        hasReflectionDraft
          ? "recommended"
          : "disabled",

      reason:
        hasReflectionDraft
          ? "Recommended for connecting Reflection with current project activity."
          : "Enter a Reflection first.",
    },
  };
}

function createAllDisabledGuidance(
  reason: string
): ProjectActionGuidance {
  return {
    startProject: {
      action:
        "start-project",

      availability:
        "disabled",

      reason,
    },

    updateProjectFocus: {
      action:
        "update-project-focus",

      availability:
        "disabled",

      reason,
    },

    analyzeGitHubProject: {
      action:
        "analyze-github-project",

      availability:
        "disabled",

      reason,
    },

    saveThought: {
      action:
        "save-thought",

      availability:
        "disabled",

      reason,
    },

    thoughtProjectAnalyze: {
      action:
        "thought-project-analyze",

      availability:
        "disabled",

      reason,
    },
  };
}