import type {
  GitHubRepositorySummary,
} from "../types/githubLearningEntry";

import {
  supabaseClient,
} from "./supabaseClient";

export type ProjectStatus =
  | "active"
  | "paused"
  | "completed";

export type ProjectRecord = {
  id: string;
  userId: string;
  name: string;

  repositoryId:
    string | null;

  repositoryOwner:
    string | null;

  repositoryName:
    string | null;

  templateId:
    string | null;

  courseId:
    string | null;

  currentFocus:
    string | null;

  status:
    ProjectStatus;

  startedAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};

export type MarkProjectStartedResult = {
  project:
    ProjectRecord;

  didStart:
    boolean;
};

export type UpdateProjectCurrentFocusInput = {
  projectId:
    string;

  currentFocus:
    string;
};

type ProjectRow = {
  id: string;
  user_id: string;
  name: string;

  repository_id:
    string | null;

  repository_owner:
    string | null;

  repository_name:
    string | null;

  template_id:
    string | null;

  course_id:
    string | null;

  current_focus:
    string | null;

  status:
    ProjectStatus;

  started_at:
    string | null;

  created_at:
    string;

  updated_at:
    string;
};


const PROJECT_SELECT = `
  id,
  user_id,
  name,
  repository_id,
  repository_owner,
  repository_name,
  template_id,
  course_id,
  current_focus,
  status,
  started_at,
  created_at,
  updated_at
`;

export async function findProjectByRepositoryId(
  repositoryId: string
): Promise<ProjectRecord | null> {
  const normalizedRepositoryId =
    normalizeRepositoryId(
      repositoryId
    );

  const userId =
    await requireAuthenticatedUserId();

  return findProjectByRepositoryIdForUser({
    userId,
    repositoryId:
      normalizedRepositoryId,
  });
}

async function findProjectByRepositoryIdForUser({
  userId,
  repositoryId,
}: {
  userId: string;
  repositoryId: string;
}): Promise<ProjectRecord | null> {
  const {
    data,
    error,
  } =
    await supabaseClient
      .from("projects")
      .select(
        PROJECT_SELECT
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "repository_id",
        repositoryId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (data === null) {
    return null;
  }

  return toProjectRecord(
    data as ProjectRow
  );
}

export async function ensureProjectForRepository(
  repository:
    GitHubRepositorySummary
): Promise<ProjectRecord> {
  const normalizedRepository =
    normalizeRepository(
      repository
    );

  const userId =
    await requireAuthenticatedUserId();

  const existingProject =
    await findProjectByRepositoryIdForUser({
      userId,
      repositoryId:
        normalizedRepository.repositoryId,
    });

  if (existingProject !== null) {
    return existingProject;
  }

  const {
    data,
    error,
  } =
    await supabaseClient
      .from("projects")
      .insert({
        user_id:
          userId,

        name:
          normalizedRepository.name,

        repository_id:
          normalizedRepository.repositoryId,

        repository_owner:
          normalizedRepository.owner,

        repository_name:
          normalizedRepository.name,

        status:
          "active",
      })
      .select(
        PROJECT_SELECT
      )
      .single();

  if (error) {
    if (
      error.code === "23505"
    ) {
      const concurrentProject =
        await findProjectByRepositoryIdForUser({
          userId,
          repositoryId:
            normalizedRepository.repositoryId,
        });

      if (
        concurrentProject !== null
      ) {
        return concurrentProject;
      }
    }

    throw error;
  }

  return toProjectRecord(
    data as ProjectRow
  );
}

export async function markProjectStarted(
  projectId:
    string
): Promise<MarkProjectStartedResult> {
  const normalizedProjectId =
    projectId.trim();

  if (
    normalizedProjectId.length ===
    0
  ) {
    throw new Error(
      "A canonical project identity is required to start an InnerMirror project."
    );
  }

  const userId =
    await requireAuthenticatedUserId();

  const timestamp =
    new Date().toISOString();

  const {
    data,
    error,
  } =
    await supabaseClient
      .from("projects")
      .update({
        started_at:
          timestamp,

        updated_at:
          timestamp,
      })
      .eq(
        "id",
        normalizedProjectId
      )
      .eq(
        "user_id",
        userId
      )
      .is(
        "started_at",
        null
      )
      .select(
        PROJECT_SELECT
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (data !== null) {
    return {
      project:
        toProjectRecord(
          data as ProjectRow
        ),

      didStart:
        true,
    };
  }

  const {
    data:
      existingData,
    error:
      existingError,
  } =
    await supabaseClient
      .from("projects")
      .select(
        PROJECT_SELECT
      )
      .eq(
        "id",
        normalizedProjectId
      )
      .eq(
        "user_id",
        userId
      )
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingData === null) {
    throw new Error(
      "The canonical InnerMirror project could not be found."
    );
  }

  return {
    project:
      toProjectRecord(
        existingData as ProjectRow
      ),

    didStart:
      false,
  };
}

export async function updateProjectCurrentFocus({
  projectId,
  currentFocus,
}: UpdateProjectCurrentFocusInput):
Promise<ProjectRecord> {
  const normalizedProjectId =
    projectId.trim();

  const normalizedCurrentFocus =
    currentFocus.trim();

  if (
    normalizedProjectId.length ===
    0
  ) {
    throw new Error(
      "A canonical project identity is required to update the InnerMirror project focus."
    );
  }

  if (
    normalizedCurrentFocus.length ===
    0
  ) {
    throw new Error(
      "A non-empty project focus is required."
    );
  }

  const userId =
    await requireAuthenticatedUserId();

  const timestamp =
    new Date().toISOString();

  const {
    data,
    error,
  } =
    await supabaseClient
      .from("projects")
      .update({
        current_focus:
          normalizedCurrentFocus,

        updated_at:
          timestamp,
      })
      .eq(
        "id",
        normalizedProjectId
      )
      .eq(
        "user_id",
        userId
      )
      .select(
        PROJECT_SELECT
      )
      .single();

  if (error) {
    throw error;
  }

  return toProjectRecord(
    data as ProjectRow
  );
}

function normalizeRepository(
  repository:
    GitHubRepositorySummary
): {
  repositoryId: string;
  owner: string;
  name: string;
} {
  const repositoryId =
    normalizeRepositoryId(
      repository.repositoryId
    );

  const owner =
    repository.owner.trim();

  const name =
    repository.name.trim();

  if (
    owner.length === 0 ||
    name.length === 0
  ) {
    throw new Error(
      "A valid GitHub repository is required to persist an InnerMirror project."
    );
  }

  return {
    repositoryId,
    owner,
    name,
  };
}


function normalizeRepositoryId(
  value: string
): string {
  const repositoryId =
    value.trim();

  if (
    repositoryId.length === 0
  ) {
    throw new Error(
      "A stable GitHub repository identity is required to persist an InnerMirror project."
    );
  }

  if (
    !/^\d+$/.test(
      repositoryId
    )
  ) {
    throw new Error(
      "GitHub repository identity must be a positive numeric identifier."
    );
  }

  const numericRepositoryId =
    Number(
      repositoryId
    );

  if (
    !Number.isSafeInteger(
      numericRepositoryId
    ) ||
    numericRepositoryId <= 0
  ) {
    throw new Error(
      "GitHub repository identity must be a positive safe integer."
    );
  }

  return repositoryId;
}


async function requireAuthenticatedUserId():
Promise<string> {
  const {
    data: authData,
    error: authError,
  } =
    await supabaseClient.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error(
      "An authenticated user is required to persist projects."
    );
  }

  return authData.user.id;
}


function toProjectRecord(
  row:
    ProjectRow
): ProjectRecord {
  return {
    id:
      row.id,

    userId:
      row.user_id,

    name:
      row.name,

    repositoryId:
      row.repository_id,

    repositoryOwner:
      row.repository_owner,

    repositoryName:
      row.repository_name,

    templateId:
      row.template_id,

    courseId:
      row.course_id,

    currentFocus:
      row.current_focus,

    status:
      row.status,

    startedAt:
      row.started_at,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}