export type CanonicalProjectHistorySnapshotVersion =
  "v1";


export type CanonicalProjectHistoryReflectionEvent = {
  eventType:
    "reflection";

  eventId:
    string;

  content:
    string;

  source:
    string | null;

  occurredAt:
    string;
};


export type CanonicalProjectHistoryProjectStartedEvent = {
  eventType:
    "project-started";

  eventId:
    string;

  focus:
    string | null;

  occurredAt:
    string;
};


export type CanonicalProjectHistoryFocusUpdatedEvent = {
  eventType:
    "focus-updated";

  eventId:
    string;

  previousFocus:
    string | null;

  nextFocus:
    string;

  occurredAt:
    string;
};


export type CanonicalProjectHistoryEvent =
  | CanonicalProjectHistoryReflectionEvent
  | CanonicalProjectHistoryProjectStartedEvent
  | CanonicalProjectHistoryFocusUpdatedEvent;


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