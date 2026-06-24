import type {
    LocalReflectionPersistenceSnapshot,
    LocalReflectionRecord,
} from "./localReflectionTypes";

const LOCAL_REFLECTION_STORAGE_KEY =
  "innermirror.local.reflections.v1";

const MAX_LOCAL_REFLECTIONS = 50;

export function appendLocalReflection(
  content: string
): LocalReflectionRecord {
  const records =
    readLocalReflections();

  const record: LocalReflectionRecord = {
    id:
      createLocalReflectionId(),
    content,
    createdAt:
      new Date().toISOString(),
    savedAt:
      new Date().toISOString(),
    source:
      "landing-local",
    syncStatus:
      "sync-pending",
  };

  const nextRecords =
    [
      record,
      ...records,
    ].slice(0, MAX_LOCAL_REFLECTIONS);

  writeLocalReflections(
    nextRecords
  );

  return record;
}

export function readLocalReflections():
  LocalReflectionRecord[] {
  try {
    const raw =
      window.localStorage.getItem(
        LOCAL_REFLECTION_STORAGE_KEY
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw) as LocalReflectionRecord[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      isLocalReflectionRecord
    );
  } catch {
    return [];
  }
}

export function clearLocalReflections(): void {
  window.localStorage.removeItem(
    LOCAL_REFLECTION_STORAGE_KEY
  );
}

export function getLocalReflectionSnapshot():
  LocalReflectionPersistenceSnapshot {
  const records =
    readLocalReflections();

  return {
    records,
    totalCount:
      records.length,
    pendingCount:
      records.filter(
        (record) =>
          record.syncStatus === "sync-pending" ||
          record.syncStatus === "sync-failed"
      ).length,
    latestSavedAt:
      records[0]?.savedAt ?? null,
  };
}

function writeLocalReflections(
  records: LocalReflectionRecord[]
): void {
  window.localStorage.setItem(
    LOCAL_REFLECTION_STORAGE_KEY,
    JSON.stringify(records)
  );
}

function isLocalReflectionRecord(
  value: unknown
): value is LocalReflectionRecord {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const record =
    value as Partial<LocalReflectionRecord>;

  return (
    typeof record.id === "string" &&
    typeof record.content === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.savedAt === "string" &&
    record.source === "landing-local"
  );
}

function createLocalReflectionId(): string {
  return `local_reflection_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}