export type RuntimeGitHubSessionState =
  | "idle"
  | "creating"
  | "ready"
  | "unavailable"
  | "expired"
  | "error";

export type RuntimeGitHubSessionStatus = {
  state: RuntimeGitHubSessionState;
  sessionId: string | null;
  message: string | null;
};