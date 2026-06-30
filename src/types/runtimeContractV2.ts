import type { GitHubSnapshot } from "./githubSnapshot";

/**
 * Runtime Contract V2
 *
 * Public contract shared conceptually with the private Runtime.
 *
 * The Landing owns this type definition so that it can prepare
 * Runtime requests without depending on private Runtime source code.
 */

/* ------------------------------------------------------------------ */
/* Execution */
/* ------------------------------------------------------------------ */

export type RuntimeExecutionTrigger =
  | "reflection"
  | "github-snapshot"
  | "combined";

/* ------------------------------------------------------------------ */
/* Reflection */
/* ------------------------------------------------------------------ */

export type RuntimeReflection = {
  text: string;
  createdAt: string;
};

/* ------------------------------------------------------------------ */
/* Project */
/* ------------------------------------------------------------------ */

export type RuntimeProjectContext = {
  projectId: string;
  name: string;
  currentStep: string;
};

/* ------------------------------------------------------------------ */
/* Repository */
/* ------------------------------------------------------------------ */

export type RuntimeRepositoryContext = {
  owner: string;
  name: string;
  defaultBranch?: string;
};

/* ------------------------------------------------------------------ */
/* Learning Context */
/* ------------------------------------------------------------------ */

export type RuntimeLearningContext = {
  currentStep?: string;
  currentGoal?: string;
  knownIssue?: string;
  learnerLevel?: "beginner" | "junior" | "intermediate";
};

/* ------------------------------------------------------------------ */
/* Runtime Contract V2 Input */
/* ------------------------------------------------------------------ */

export type RuntimeContractV2Input = {
  reflection?: RuntimeReflection;

  project: RuntimeProjectContext;

  repository: RuntimeRepositoryContext;

  githubSnapshot?: GitHubSnapshot;

  learningContext: RuntimeLearningContext;

  trigger?: RuntimeExecutionTrigger;
};

/* ------------------------------------------------------------------ */
/* Runtime Output */
/* ------------------------------------------------------------------ */

export type RuntimeSummary = {
  text: string;
  focus: string;
};

export type RuntimeQuestion = {
  question: string;
  reason: string;
};

export type RuntimeCoaching = {
  nextAction: string;
  rationale: string;
  suggestedFocus: string;
};

export type RuntimeDecisionReview = {
  decisionSummary: string;
  strength: string;
  risk: string;
  improvementQuestion: string;
};

/* ------------------------------------------------------------------ */
/* Runtime Response */
/* ------------------------------------------------------------------ */

export type RuntimeResponseMeta = {
  runtimeVersion: string;
  pipeline: string;
  generatedAt: string;
};

export type RuntimeContractV2Output = {
  version: string;

  summary: RuntimeSummary;

  question: RuntimeQuestion;

  coaching: RuntimeCoaching;

  decisionReview: RuntimeDecisionReview;
};

export type RuntimeContractV2Response = {
  ok: boolean;

  meta: RuntimeResponseMeta;

  data: RuntimeContractV2Output;
};