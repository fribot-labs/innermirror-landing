import type {
  CanonicalProjectHistorySnapshot,
} from "../project-history/canonicalProjectHistoryTypes";

import type {
  RuntimeProjectHistoryInputV1,
} from "./projectHistoryRuntimeContractTypes";


export type CreateProjectHistoryRuntimeInput = {
  snapshot:
    CanonicalProjectHistorySnapshot;
};


export function createProjectHistoryRuntimeInput({
  snapshot,
}: CreateProjectHistoryRuntimeInput):
RuntimeProjectHistoryInputV1 {
  if (
    snapshot.snapshotVersion !==
    "v1"
  ) {
    throw new Error(
      "Project History Runtime Input requires Canonical Project History Snapshot v1."
    );
  }

  const projectId =
    snapshot.project.projectId.trim();

  if (
    projectId.length ===
    0
  ) {
    throw new Error(
      "Project History Runtime Input requires a canonical project identity."
    );
  }

  const repositoryId =
    snapshot.project.repositoryId.trim();

  if (
    repositoryId.length ===
    0
  ) {
    throw new Error(
      "Project History Runtime Input requires a stable repository identity."
    );
  }

  if (
    snapshot.eventCount !==
    snapshot.events.length
  ) {
    throw new Error(
      "Project History Runtime Input requires eventCount to match the number of history events."
    );
  }

  validateTimeRange(
    snapshot
  );

  const events =
    snapshot.events.map(
      (event) => {
        const eventId =
          event.eventId.trim();

        if (
          eventId.length ===
          0
        ) {
          throw new Error(
            "Project History Runtime Input requires every history event to have a stable event identity."
          );
        }

        const occurredAt =
          normalizeTimestamp(
            event.occurredAt,
            "Project History Runtime Input requires valid event timestamps."
          );

        if (
          event.eventType ===
          "reflection"
        ) {
          return {
            eventId,

            eventType:
              "reflection" as const,

            content:
              event.content,

            source:
              event.source,

            occurredAt,
          };
        }

        if (
          event.eventType ===
          "project-started"
        ) {
          return {
            eventId,

            eventType:
              "project-started" as const,

            focus:
              event.focus,

            occurredAt,
          };
        }

        return {
          eventId,

          eventType:
            "focus-updated" as const,

          previousFocus:
            event.previousFocus,

          nextFocus:
            event.nextFocus,

          occurredAt,
        };
      }
    );

  const snapshotCreatedAt =
    normalizeTimestamp(
      snapshot.createdAt,
      "Project History Runtime Input requires a valid snapshot creation timestamp."
    );

  return {
    contractVersion:
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
        snapshot.timeRange.startedAt,

      endedAt:
        snapshot.timeRange.endedAt,
    },

    snapshotCreatedAt,
  };
}


function validateTimeRange(
  snapshot:
    CanonicalProjectHistorySnapshot
): void {
  const {
    events,
    timeRange,
  } =
    snapshot;

  if (
    events.length ===
    0
  ) {
    if (
      timeRange.startedAt !==
        null ||
      timeRange.endedAt !==
        null
    ) {
      throw new Error(
        "Project History Runtime Input requires an empty history to have a null time range."
      );
    }

    return;
  }

  if (
    timeRange.startedAt ===
      null ||
    timeRange.endedAt ===
      null
  ) {
    throw new Error(
      "Project History Runtime Input requires a non-empty history to have a complete time range."
    );
  }

  const normalizedStartedAt =
    normalizeTimestamp(
      timeRange.startedAt,
      "Project History Runtime Input requires a valid history start timestamp."
    );

  const normalizedEndedAt =
    normalizeTimestamp(
      timeRange.endedAt,
      "Project History Runtime Input requires a valid history end timestamp."
    );

  const firstEvent =
    events[0];

  const lastEvent =
    events[
      events.length - 1
    ];

  if (
    firstEvent ===
      undefined ||
    lastEvent ===
      undefined
  ) {
    throw new Error(
      "Project History Runtime Input could not resolve the history boundaries."
    );
  }

  const firstEventOccurredAt =
    normalizeTimestamp(
      firstEvent.occurredAt,
      "Project History Runtime Input requires valid event timestamps."
    );

  const lastEventOccurredAt =
    normalizeTimestamp(
      lastEvent.occurredAt,
      "Project History Runtime Input requires valid event timestamps."
    );

  if (
    normalizedStartedAt !==
    firstEventOccurredAt ||
    normalizedEndedAt !==
    lastEventOccurredAt
  ) {
    throw new Error(
      "Project History Runtime Input time range must match the first and last history events."
    );
  }
}


function normalizeTimestamp(
  value: string,
  errorMessage: string
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