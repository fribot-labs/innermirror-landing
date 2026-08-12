import type {
    ProjectEventRecord,
} from "../lib/projectEventPersistence";


export type ProjectLifecycleHistoryEntry =
  | {
      type:
        "project-started";

      eventId:
        string;

      projectId:
        string;

      focus:
        string | null;

      occurredAt:
        string;
    }
  | {
      type:
        "focus-updated";

      eventId:
        string;

      projectId:
        string;

      previousFocus:
        string | null;

      nextFocus:
        string;

      occurredAt:
        string;
    };


export function createProjectLifecycleHistory(
  events:
    ProjectEventRecord[]
): ProjectLifecycleHistoryEntry[] {
  return events.flatMap(
    (event) => {
      if (
        event.eventType ===
        "project_started"
      ) {
        return [
          createProjectStartedHistoryEntry(
            event
          ),
        ];
      }

      if (
        event.eventType ===
        "focus_updated"
      ) {
        const focusUpdatedEntry =
          createFocusUpdatedHistoryEntry(
            event
          );

        return focusUpdatedEntry ===
          null
          ? []
          : [
              focusUpdatedEntry,
            ];
      }

      return [];
    }
  );
}


function createProjectStartedHistoryEntry(
  event:
    ProjectEventRecord
): ProjectLifecycleHistoryEntry {
  return {
    type:
      "project-started",

    eventId:
      event.id,

    projectId:
      event.projectId,

    focus:
      readOptionalString(
        event.eventData,
        "focus"
      ),

    occurredAt:
      event.occurredAt,
  };
}


function createFocusUpdatedHistoryEntry(
  event:
    ProjectEventRecord
): ProjectLifecycleHistoryEntry | null {
  const nextFocus =
    readOptionalString(
      event.eventData,
      "nextFocus"
    );

  if (
    nextFocus ===
    null
  ) {
    return null;
  }

  return {
    type:
      "focus-updated",

    eventId:
      event.id,

    projectId:
      event.projectId,

    previousFocus:
      readOptionalString(
        event.eventData,
        "previousFocus"
      ),

    nextFocus,

    occurredAt:
      event.occurredAt,
  };
}


function readOptionalString(
  value:
    Record<string, unknown>,
  key:
    string
): string | null {
  const field =
    value[key];

  if (
    typeof field !==
    "string"
  ) {
    return null;
  }

  const normalizedValue =
    field.trim();

  if (
    normalizedValue.length ===
    0
  ) {
    return null;
  }

  return normalizedValue;
}