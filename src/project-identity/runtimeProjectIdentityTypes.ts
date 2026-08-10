export type RuntimeProjectSource =
  | "github-repository";

export type RuntimeProjectKind =
  | "general"
  | "pbl";

export type RuntimeProjectRepositoryIdentity = {
  repositoryId: string;
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  htmlUrl: string;
};

export type RuntimeProjectIdentity = {
  projectId: string;
  source: RuntimeProjectSource;
  kind: RuntimeProjectKind;
  repository:
    RuntimeProjectRepositoryIdentity;
  createdAt: string;
};