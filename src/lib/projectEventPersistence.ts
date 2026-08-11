import {
    supabaseClient,
} from "./supabaseClient";


export type ProjectEventType =
  | "project_created"
  | "project_started"
  | "focus_updated"
  | "project_completed";


export type CreateProjectEventInput = {
  projectId:
    string;

  eventType:
    ProjectEventType;

  eventData?:
    Record<string, unknown>;

  occurredAt?:
    string;
};


export type ProjectEventRecord = {
  id:
    string;

  userId:
    string;

  projectId:
    string;

  eventType:
    ProjectEventType;

  eventData:
    Record<string, unknown>;

  occurredAt:
    string;

  createdAt:
    string;
};


type ProjectEventRow = {
  id:
    string;

  user_id:
    string;

  project_id:
    string;

  event_type:
    string;

  event_data:
    Record<string, unknown>;

  occurred_at:
    string;

  created_at:
    string;
};


type ProjectEventInsertPayload = {
  user_id:
    string;

  project_id:
    string;

  event_type:
    ProjectEventType;

  event_data:
    Record<string, unknown>;

  occurred_at?:
    string;
};


function toProjectEventRecord(
  row:
    ProjectEventRow
): ProjectEventRecord {
  return {
    id:
      row.id,

    userId:
      row.user_id,

    projectId:
      row.project_id,

    eventType:
      row.event_type as ProjectEventType,

    eventData:
      row.event_data,

    occurredAt:
      row.occurred_at,

    createdAt:
      row.created_at,
  };
}


export async function createProjectEvent(
  input:
    CreateProjectEventInput
): Promise<ProjectEventRecord> {
  const projectId =
    input.projectId.trim();

  if (
    projectId.length ===
    0
  ) {
    throw new Error(
      "A canonical project identity is required to create a Project Event."
    );
  }

  const {
    data:
      authData,
    error:
      authError,
  } =
    await supabaseClient.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (
    !authData.user
  ) {
    throw new Error(
      "An authenticated user is required to create a Project Event."
    );
  }

  const insertPayload:
    ProjectEventInsertPayload = {
      user_id:
        authData.user.id,

      project_id:
        projectId,

      event_type:
        input.eventType,

      event_data:
        input.eventData ?? {},
    };

  if (
    input.occurredAt !==
    undefined
  ) {
    insertPayload.occurred_at =
      input.occurredAt;
  }

  const {
    data,
    error,
  } =
    await supabaseClient
      .from(
        "project_events"
      )
      .insert(
        insertPayload
      )
      .select(
        `
          id,
          user_id,
          project_id,
          event_type,
          event_data,
          occurred_at,
          created_at
        `
      )
      .single();

  if (error) {
    throw error;
  }

  return toProjectEventRecord(
    data as ProjectEventRow
  );
}


export async function listProjectEventsByProject(
  projectId:
    string
): Promise<ProjectEventRecord[]> {
  const normalizedProjectId =
    projectId.trim();

  if (
    normalizedProjectId.length ===
    0
  ) {
    throw new Error(
      "A canonical project identity is required to read Project Events."
    );
  }

  const {
    data:
      authData,
    error:
      authError,
  } =
    await supabaseClient.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (
    !authData.user
  ) {
    throw new Error(
      "An authenticated user is required to read Project Events."
    );
  }

  const {
    data,
    error,
  } =
    await supabaseClient
      .from(
        "project_events"
      )
      .select(
        `
          id,
          user_id,
          project_id,
          event_type,
          event_data,
          occurred_at,
          created_at
        `
      )
      .eq(
        "project_id",
        normalizedProjectId
      )
      .order(
        "occurred_at",
        {
          ascending:
            true,
        }
      );

  if (error) {
    throw error;
  }

  return (
    data as ProjectEventRow[]
  ).map(
    toProjectEventRecord
  );
}