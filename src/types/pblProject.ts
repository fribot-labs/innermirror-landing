/**
 * PBL Project Domain Model
 *
 * This file defines the Landing-side Project domain model
 * for the PBL Coding Education MVP.
 *
 * The structure follows:
 *
 * Project
 * ↓
 * Milestone
 * ↓
 * Pull Request
 * ↓
 * Completion
 *
 * Reflection belongs to Project.
 */

export type PblProjectStatus = "not-started" | "active" | "completed";

export type PblMilestoneStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export type PblPullRequestStatus = "open" | "merged" | "closed";

export type PblReflectionStatus = "draft" | "submitted" | "analyzed";

export type PblRepositoryProvider = "github";

export type PblRepositoryRef = {
  provider: PblRepositoryProvider;
  owner: string;
  name: string;
  defaultBranch?: string;
};

export type PblPullRequestRef = {
  id: string;
  number?: number;
  title: string;
  status: PblPullRequestStatus;
  url?: string;
  createdAt?: string;
  mergedAt?: string;
};

export type PblReflectionRef = {
  id: string;
  projectId: string;
  milestoneId?: string;
  pullRequestId?: string;
  content: string;
  status: PblReflectionStatus;
  createdAt: string;
  analyzedAt?: string;
};

export type PblMilestone = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: PblMilestoneStatus;
  pullRequests: PblPullRequestRef[];
  reflections: PblReflectionRef[];
  completionRate: number;
  createdAt: string;
  updatedAt: string;
};

export type PblProject = {
  id: string;
  name: string;
  repository: PblRepositoryRef;
  status: PblProjectStatus;
  currentMilestoneId?: string;
  milestones: PblMilestone[];
  reflections: PblReflectionRef[];
  completionRate: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatePblProjectParams = {
  name: string;
  repository: PblRepositoryRef;
  currentStep: string;
};

export type AddPblReflectionParams = {
  project: PblProject;
  content: string;
  milestoneId?: string;
  pullRequestId?: string;
};

export function createPblProject(
  params: CreatePblProjectParams
): PblProject {
  const now = new Date().toISOString();
  const projectId = crypto.randomUUID();
  const milestoneId = crypto.randomUUID();

  const initialMilestone: PblMilestone = {
    id: milestoneId,
    projectId,
    title: params.currentStep,
    description:
      "Initial milestone created from the current learning step.",
    status: "in-progress",
    pullRequests: [],
    reflections: [],
    completionRate: 0,
    createdAt: now,
    updatedAt: now,
  };

  return {
    id: projectId,
    name: params.name,
    repository: params.repository,
    status: "active",
    currentMilestoneId: milestoneId,
    milestones: [initialMilestone],
    reflections: [],
    completionRate: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function addPblReflection(
  params: AddPblReflectionParams
): PblProject {
  const now = new Date().toISOString();
  const milestoneId =
    params.milestoneId ?? params.project.currentMilestoneId;

  const reflection: PblReflectionRef = {
    id: crypto.randomUUID(),
    projectId: params.project.id,
    milestoneId,
    pullRequestId: params.pullRequestId,
    content: params.content,
    status: "submitted",
    createdAt: now,
  };

  const milestones = params.project.milestones.map((milestone) => {
    if (milestone.id !== milestoneId) {
      return milestone;
    }

    return {
      ...milestone,
      reflections: [...milestone.reflections, reflection],
      updatedAt: now,
    };
  });

  const nextProject: PblProject = {
    ...params.project,
    milestones,
    reflections: [...params.project.reflections, reflection],
    updatedAt: now,
  };

  return {
    ...nextProject,
    completionRate: calculatePblProjectCompletion(nextProject),
  };
}

export function calculatePblProjectCompletion(
  project: PblProject
): number {
  if (project.milestones.length === 0) {
    return 0;
  }

  const totalCompletion = project.milestones.reduce(
    (sum, milestone) => sum + milestone.completionRate,
    0
  );

  return Math.round(totalCompletion / project.milestones.length);
}

export function getCurrentPblMilestone(
  project: PblProject
): PblMilestone | null {
  if (!project.currentMilestoneId) {
    return null;
  }

  return (
    project.milestones.find(
      (milestone) => milestone.id === project.currentMilestoneId
    ) ?? null
  );
}

export function countPblPullRequests(project: PblProject): number {
  return project.milestones.reduce(
    (count, milestone) => count + milestone.pullRequests.length,
    0
  );
}

export function countPblReflections(project: PblProject): number {
  return project.reflections.length;
}