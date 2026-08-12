import type {
  ProjectRecord,
} from "../lib/projectPersistence";

import type {
  ReflectionRecord,
} from "../lib/reflectionPersistence";

import type {
  ProjectLifecycleHistoryEntry,
} from "../project-actions/projectLifecycleHistory";

import type {
  CanonicalProjectHistoryEvent,
  CanonicalProjectHistorySnapshot,
} from "./canonicalProjectHistoryTypes";


export type CreateCanonicalProjectHistorySnapshotInput = {
  project:
    ProjectRecord;

  reflections:
    ReflectionRecord[];

  lifecycleHistory:
    ProjectLifecycleHistoryEntry[];

  createdAt?:
    string;
};


export function createCanonicalProjectHistorySnapshot({
  project,
  reflections,
  lifecycleHistory,
  createdAt =
    new Date().toISOString(),
}: CreateCanonicalProjectHistorySnapshotInput):
CanonicalProjectHistorySnapshot {
  const projectId =
    project.id.trim();

  if (
    projectId.length ===
    0
  ) {
    throw new Error(
      "Canonical Project History Snapshot requires a canonical project identity."
    );
  }

  const repositoryId =
    project.repositoryId?.trim() ??
    "";

  if (
    repositoryId.length ===
    0
  ) {
    throw new Error(
      "Canonical Project History Snapshot requires a stable repository identity."
    );
  }

  const normalizedCreatedAt =
    new Date(
      createdAt
    );

  if (
    Number.isNaN(
      normalizedCreatedAt.getTime()
    )
  ) {
    throw new Error(
      "Canonical Project History Snapshot requires a valid createdAt value."
    );
  }


  const reflectionEvents =
    createReflectionEvents({
      projectId,
      reflections,
    });


  const lifecycleEvents =
    createLifecycleEvents({
      projectId,
      lifecycleHistory,
    });


  const events:
    CanonicalProjectHistoryEvent[] =
    [
      ...reflectionEvents,
      ...lifecycleEvents,
    ].sort(
      (a, b) =>
        Date.parse(
          a.occurredAt
        ) -
        Date.parse(
          b.occurredAt
        )
    );


  const firstEvent =
    events[0] ??
    null;

  const lastEvent =
    events[
      events.length - 1
    ] ??
    null;


  return {
    snapshotVersion:
      "v1",

    project: {
      projectId,
      repositoryId,
    },

    events,

    eventCount:
      events.length,

    timeRange: {
      startedAt:
        firstEvent?.occurredAt ??
        null,

      endedAt:
        lastEvent?.occurredAt ??
        null,
    },

    createdAt:
      normalizedCreatedAt.toISOString(),
  };
}


function createReflectionEvents({
  projectId,
  reflections,
}: {
  projectId:
    string;

  reflections:
    ReflectionRecord[];
}): CanonicalProjectHistoryEvent[] {
  return reflections.map(
    (reflection) => {
      if (
        reflection.projectId !==
        projectId
      ) {
        throw new Error(
          "Canonical Project History Snapshot cannot include a Reflection from another project."
        );
      }

      const occurredAt =
        normalizeTimestamp(
          reflection.createdAt,
          "Canonical Project History Snapshot requires valid Reflection timestamps."
        );

      const eventId =
        reflection.id.trim();

      if (
        eventId.length ===
        0
      ) {
        throw new Error(
          "Canonical Project History Snapshot requires every Reflection to have a stable identity."
        );
      }

      return {
        eventType:
          "reflection",

        eventId,

        content:
          reflection.content,

        source:
          reflection.source,

        occurredAt,
      };
    }
  );
}


function createLifecycleEvents({
  projectId,
  lifecycleHistory,
}: {
  projectId:
    string;

  lifecycleHistory:
    ProjectLifecycleHistoryEntry[];
}): CanonicalProjectHistoryEvent[] {
  return lifecycleHistory.map(
    (entry) => {
      if (
        entry.projectId !==
        projectId
      ) {
        throw new Error(
          "Canonical Project History Snapshot cannot include a lifecycle event from another project."
        );
      }

      const eventId =
        entry.eventId.trim();

      if (
        eventId.length ===
        0
      ) {
        throw new Error(
          "Canonical Project History Snapshot requires every lifecycle event to have a stable event identity."
        );
      }

      const occurredAt =
        normalizeTimestamp(
          entry.occurredAt,
          "Canonical Project History Snapshot requires valid lifecycle event timestamps."
        );

      if (
        entry.type ===
        "project-started"
      ) {
        return {
          eventType:
            "project-started",

          eventId,

          focus:
            normalizeOptionalString(
              entry.focus
            ),

          occurredAt,
        };
      }

      const nextFocus =
        entry.nextFocus.trim();

      if (
        nextFocus.length ===
        0
      ) {
        throw new Error(
          "Canonical Project History Snapshot requires focus-updated lifecycle events to have a next focus."
        );
      }

      return {
        eventType:
          "focus-updated",

        eventId,

        previousFocus:
          normalizeOptionalString(
            entry.previousFocus
          ),

        nextFocus,

        occurredAt,
      };
    }
  );
}


function normalizeOptionalString(
  value:
    string | null
): string | null {
  if (
    value ===
    null
  ) {
    return null;
  }

  const normalizedValue =
    value.trim();

  return normalizedValue.length ===
    0
    ? null
    : normalizedValue;
}


function normalizeTimestamp(
  value:
    string,
  errorMessage:
    string
): string {
  const timestamp =
    new Date(
      value
    );

  if (
    Number.isNaN(
      timestamp.getTime()
    )
  ) {
    throw new Error(
      errorMessage
    );
  }

  return timestamp.toISOString();
}