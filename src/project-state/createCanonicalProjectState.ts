import type {
    ProjectRecord,
} from "../lib/projectPersistence";


export type CanonicalProjectState = {
  projectId:
    string;

  isStarted:
    boolean;

  currentFocus:
    string;
};


export function createCanonicalProjectState(
  project:
    ProjectRecord
): CanonicalProjectState {
  return {
    projectId:
      project.id,

    isStarted:
      project.startedAt !==
      null,

    currentFocus:
      normalizeCurrentFocus(
        project.currentFocus
      ),
  };
}


function normalizeCurrentFocus(
  value:
    string | null
): string {
  if (
    value ===
    null
  ) {
    return "";
  }

  return value.trim();
}