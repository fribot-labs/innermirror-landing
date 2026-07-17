/**
 * InnerMirror Landing user-facing project action labels.
 *
 * These labels describe actions the learner can execute.
 * They are separate from Runtime concept terminology.
 */
export const PROJECT_ACTION_LABELS = {
  startProject: "Start Project",
  updateProjectFocus: "Update Project Focus",
  analyzeGitHubProject: "Analyze GitHub Project",

  reflectionOnly: "Reflection Only",
  reflectionWithGitHub: "Reflection + GitHub",
} as const;

export const PROJECT_ACTION_DESCRIPTIONS = {
  reflectionOnly: {
    primary: "Runtime analyzes only this Reflection.",
    secondary: "No new GitHub activity is included.",
  },

  reflectionWithGitHub: {
    primary:
      "Runtime analyzes this Reflection with the latest GitHub activity.",
    secondary:
      "A fresh GitHub Snapshot will be captured.",
  },
} as const;