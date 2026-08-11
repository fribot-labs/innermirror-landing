import type {
    ProjectRecord,
} from "../lib/projectPersistence";

import type {
    ReflectionRecord,
} from "../lib/reflectionPersistence";

import type {
    CanonicalProjectHistoryEvent,
    CanonicalProjectHistorySnapshot,
} from "./canonicalProjectHistoryTypes";

export type CreateCanonicalProjectHistorySnapshotInput = {
  project:
    ProjectRecord;

  reflections:
    ReflectionRecord[];

  createdAt?:
    string;
};

export function createCanonicalProjectHistorySnapshot({
  project,
  reflections,
  createdAt =
    new Date().toISOString(),
}: CreateCanonicalProjectHistorySnapshotInput):
CanonicalProjectHistorySnapshot {
  const projectId =
    project.id.trim();

  if (
    projectId.length === 0
  ) {
    throw new Error(
      "Canonical Project History Snapshot requires a canonical project identity."
    );
  }

  const repositoryId =
    project.repositoryId?.trim() ??
    "";

  if (
    repositoryId.length === 0
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

  for (
    const reflection of
    reflections
  ) {
    if (
      reflection.projectId !==
      projectId
    ) {
      throw new Error(
        "Canonical Project History Snapshot cannot include a Reflection from another project."
      );
    }

    const reflectionTimestamp =
      Date.parse(
        reflection.createdAt
      );

    if (
      Number.isNaN(
        reflectionTimestamp
      )
    ) {
      throw new Error(
        "Canonical Project History Snapshot requires valid Reflection timestamps."
      );
    }
  }

  const orderedReflections =
    [
      ...reflections,
    ].sort(
      (a, b) =>
        Date.parse(
          a.createdAt
        ) -
        Date.parse(
          b.createdAt
        )
    );

  const events:
    CanonicalProjectHistoryEvent[] =
    orderedReflections.map(
      (reflection) => ({
        reflectionId:
          reflection.id,

        content:
          reflection.content,

        source:
          reflection.source,

        createdAt:
          new Date(
            reflection.createdAt
          ).toISOString(),
      })
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
        firstEvent?.createdAt ??
        null,

      endedAt:
        lastEvent?.createdAt ??
        null,
    },

    createdAt:
      normalizedCreatedAt.toISOString(),
  };
}