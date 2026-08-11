export type RuntimeProjectHistoryContractVersion =
  "v1";

export type RuntimeProjectHistoryEventV1 = {
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