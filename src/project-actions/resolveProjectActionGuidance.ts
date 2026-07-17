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
        availability: "disabled",
        reason: "Start the project first.",
      },

      analyzeGitHubProject: {
        availability: "disabled",
        reason:
          "Start the project before analyzing GitHub activity.",
      },

      saveThought: {
        availability: "disabled",
        reason:
          "Start the project before saving a Reflection.",
      },

      thoughtProjectAnalyze: {
        availability: "disabled",
        reason:
          "Start the project before running combined analysis.",
      },
    };
  }

  return {
    startProject: {
      availability: "disabled",
      reason: "The project has already been started.",
    },

    updateProjectFocus: {
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
      availability: "disabled",
      reason,
    },

    updateProjectFocus: {
      availability: "disabled",
      reason,
    },

    analyzeGitHubProject: {
      availability: "disabled",
      reason,
    },

    saveThought: {
      availability: "disabled",
      reason,
    },

    thoughtProjectAnalyze: {
      availability: "disabled",
      reason,
    },
  };
}