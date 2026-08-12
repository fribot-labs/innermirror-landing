export type RuntimeProjectHistoryContractVersion =
  "v1";


export type RuntimeProjectHistoryReflectionEventV1 = {
  eventId:
    string;

  eventType:
    "reflection";

  content:
    string;

  source:
    string | null;

  occurredAt:
    string;
};


export type RuntimeProjectHistoryProjectStartedEventV1 = {
  eventId:
    string;

  eventType:
    "project-started";

  focus:
    string | null;

  occurredAt:
    string;
};


export type RuntimeProjectHistoryFocusUpdatedEventV1 = {
  eventId:
    string;

  eventType:
    "focus-updated";

  previousFocus:
    string | null;

  nextFocus:
    string;

  occurredAt:
    string;
};


export type RuntimeProjectHistoryEventV1 =
  | RuntimeProjectHistoryReflectionEventV1
  | RuntimeProjectHistoryProjectStartedEventV1
  | RuntimeProjectHistoryFocusUpdatedEventV1;


export type RuntimeProjectHistoryInputV1 = {
  contractVersion:
    RuntimeProjectHistoryContractVersion;

  project: {
    projectId:
      string;

    repositoryId:
      string;
  };

  events:
    RuntimeProjectHistoryEventV1[];

  eventCount:
    number;

  timeRange: {
    startedAt:
      string | null;

    endedAt:
      string | null;
  };

  snapshotCreatedAt:
    string;
};