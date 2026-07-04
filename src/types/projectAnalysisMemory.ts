export type ProjectAnalysisMemorySource =
  | "thought"
  | "project"
  | "combined";

export type ProjectAnalysisMemoryEvent = {
  id: string;
  source: ProjectAnalysisMemorySource;
  title: string;
  summary: string;
  projectName?: string;
  repositoryName?: string;
  commitCount?: number;
  pullRequestCount?: number;
  createdAt: string;
  tags: string[];
};