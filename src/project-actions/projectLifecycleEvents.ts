import {
    createProjectEvent,
} from "../lib/projectEventPersistence";


export type RecordProjectStartedEventInput = {
  projectId:
    string;

  wasAlreadyStarted:
    boolean;

  focus?:
    string | null;
};


export type RecordProjectFocusUpdatedEventInput = {
  projectId:
    string;

  previousFocus:
    string | null;

  nextFocus:
    string;
};


function normalizeOptionalText(
  value:
    string | null | undefined
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}


export async function recordProjectStartedEvent(
  input:
    RecordProjectStartedEventInput
): Promise<void> {
  if (
    input.wasAlreadyStarted
  ) {
    return;
  }

  const projectId =
    input.projectId.trim();

  if (
    projectId.length ===
    0
  ) {
    throw new Error(
      "A canonical project identity is required to record a Project start event."
    );
  }

  const normalizedFocus =
    normalizeOptionalText(
      input.focus
    );

  await createProjectEvent({
    projectId,

    eventType:
      "project_started",

    eventData:
      normalizedFocus === null
        ? {}
        : {
            focus:
              normalizedFocus,
          },
  });
}


export async function recordProjectFocusUpdatedEvent(
  input:
    RecordProjectFocusUpdatedEventInput
): Promise<void> {
  const projectId =
    input.projectId.trim();

  if (
    projectId.length ===
    0
  ) {
    throw new Error(
      "A canonical project identity is required to record a Project focus update event."
    );
  }

  const previousFocus =
    normalizeOptionalText(
      input.previousFocus
    );

  const nextFocus =
    normalizeOptionalText(
      input.nextFocus
    );

  if (
    nextFocus === null
  ) {
    throw new Error(
      "A Project focus update requires a non-empty next focus."
    );
  }

  if (
    previousFocus ===
    nextFocus
  ) {
    return;
  }

  await createProjectEvent({
    projectId,

    eventType:
      "focus_updated",

    eventData: {
      previousFocus,
      nextFocus,
    },
  });
}