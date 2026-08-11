import { supabaseClient } from "./supabaseClient";

export type CreateReflectionInput = {
  projectId?: string | null;
  content: string;
  source?: string | null;
};

export type ReflectionRecord = {
  id: string;
  userId: string;
  projectId: string | null;
  content: string;
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

type ReflectionRow = {
  id: string;
  user_id: string;
  project_id: string | null;
  content: string;
  source: string | null;
  created_at: string;
  updated_at: string;
};

function toReflectionRecord(row: ReflectionRow): ReflectionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    content: row.content,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createReflection(
  input: CreateReflectionInput,
): Promise<ReflectionRecord> {
  const { data: authData, error: authError } =
    await supabaseClient.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error(
      "An authenticated user is required to create a reflection.",
    );
  }

  const { data, error } = await supabaseClient
    .from("reflections")
    .insert({
      user_id: authData.user.id,
      project_id: input.projectId ?? null,
      content: input.content,
      source: input.source ?? null,
    })
    .select(
      `
        id,
        user_id,
        project_id,
        content,
        source,
        created_at,
        updated_at
      `,
    )
    .single();

  if (error) {
    throw error;
  }

  return toReflectionRecord(data as ReflectionRow);
}

export async function listReflectionsByProject(
  projectId: string,
): Promise<ReflectionRecord[]> {
  const normalizedProjectId =
    projectId.trim();

  if (
    normalizedProjectId.length === 0
  ) {
    throw new Error(
      "A canonical project identity is required to read project Reflections."
    );
  }

  const { data: authData, error: authError } =
    await supabaseClient.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error(
      "An authenticated user is required to read reflections.",
    );
  }

  const { data, error } = await supabaseClient
    .from("reflections")
    .select(
      `
        id,
        user_id,
        project_id,
        content,
        source,
        created_at,
        updated_at
      `,
    )
    .eq(
      "project_id",
      normalizedProjectId
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data as ReflectionRow[]).map(toReflectionRecord);
}

export async function listReflectionsForCurrentUser(
  limit = 10
): Promise<ReflectionRecord[]> {
  const { data: authData, error: authError } =
    await supabaseClient.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error(
      "An authenticated user is required to read reflections.",
    );
  }

  const { data, error } = await supabaseClient
    .from("reflections")
    .select(
      `
        id,
        user_id,
        project_id,
        content,
        source,
        created_at,
        updated_at
      `
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data as ReflectionRow[]).map(
    toReflectionRecord
  );
}
