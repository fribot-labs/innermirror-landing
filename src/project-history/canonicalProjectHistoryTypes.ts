export type CanonicalProjectHistorySnapshotVersion =
  "v1";

export type CanonicalProjectHistoryEvent = {
  reflectionId:
    string;

  content:
    string;

  source:
    string | null;

  createdAt:
    string;
};

export type CanonicalProjectHistoryTimeRange = {
  startedAt:
    string | null;

  endedAt:
    string | null;
};

export type CanonicalProjectHistoryProject = {
  projectId:
    string;

  repositoryId:
    string;
};

export type CanonicalProjectHistorySnapshot = {
  snapshotVersion:
    CanonicalProjectHistorySnapshotVersion;

  project:
    CanonicalProjectHistoryProject;

  events:
    CanonicalProjectHistoryEvent[];

  eventCount:
    number;

  timeRange:
    CanonicalProjectHistoryTimeRange;

  createdAt:
    string;
};