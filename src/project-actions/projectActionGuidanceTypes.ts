export type ActionAvailability =
  | "recommended"
  | "available"
  | "disabled";

export type GuidedProjectAction =
  | "start-project"
  | "update-project-focus"
  | "analyze-github-project"
  | "save-thought"
  | "thought-project-analyze";

export type GuidedActionPresentation = {
  action: GuidedProjectAction;
  availability: ActionAvailability;
  reason: string;
};

export type ProjectActionGuidance = {
  startProject: GuidedActionPresentation;
  updateProjectFocus: GuidedActionPresentation;
  analyzeGitHubProject: GuidedActionPresentation;
  saveThought: GuidedActionPresentation;
  thoughtProjectAnalyze: GuidedActionPresentation;
};