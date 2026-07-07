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

  projectHistory?: RuntimeProjectHistory;

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

export type RuntimeCoachingMode =
  | "reflection-needed"
  | "project-review"
  | "evolution-review"
  | "next-implementation"
  | "stabilization";

export type RuntimeCoaching = {
  nextAction: string;
  rationale: string;
  suggestedFocus: string;

  mode?: RuntimeCoachingMode;
  adaptiveReason?: string;
  confidence?: "low" | "medium" | "high";
};

export type RuntimeDecisionReview = {
  decisionSummary: string;
  strength: string;
  risk: string;
  improvementQuestion: string;
};

/* ------------------------------------------------------------------ */
/* Project Response */
/* ------------------------------------------------------------------ */

export type RuntimeProjectHistoryEvent = {
  source: "project" | "combined" | "thought";
  title: string;
  summary: string;
  repositoryName?: string;
  commitCount?: number;
  pullRequestCount?: number;
  tags: string[];
  createdAt: string;
};

export type RuntimeProjectHistory = {
  events: RuntimeProjectHistoryEvent[];
};

export type RuntimeProjectEvolution = {
  title: string;
  summary: string;
  shift?: string;
  evidence: string[];
  suggestedNextFocus?: string;
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
  projectEvolution?: RuntimeProjectEvolution;
  decisionEvolution?: RuntimeDecisionEvolution;
  projectIdentity?: RuntimeProjectIdentity;
  knowledgeCompression?: RuntimeKnowledgeCompression;
  insightSynthesis?: RuntimeInsightSynthesis;
};

export type RuntimeContractV2Response = {
  ok: boolean;

  meta: RuntimeResponseMeta;

  data: RuntimeContractV2Output;
};

export type RuntimeDecisionEvolutionStage =
  | "implementation-centered"
  | "structure-centered"
  | "user-experience-centered"
  | "runtime-intelligence-centered"
  | "unclear";

export type RuntimeDecisionEvolution = {
  title: string;
  summary: string;
  earlierStage: RuntimeDecisionEvolutionStage;
  recentStage: RuntimeDecisionEvolutionStage;
  currentStage: RuntimeDecisionEvolutionStage;
  shift?: string;
  evidence: string[];
  suggestedReflection?: string;
};

export type RuntimeCompressedConcept = {
  concept: string;
  weight: number;
  sourceCount: number;
  evidence: string[];
};

export type RuntimeKnowledgeCompression = {
  title: string;
  summary: string;
  compressionRatio: string;
  concepts: RuntimeCompressedConcept[];
  suggestedReflection?: string;
};

export type RuntimeProjectIdentityStage =
  | "implementation-building"
  | "ux-stabilization"
  | "runtime-intelligence-building"
  | "knowledge-compression"
  | "project-structure-formation"
  | "early-formation"
  | "unclear";

export type RuntimeProjectIdentity = {
  title: string;
  summary: string;
  stage: RuntimeProjectIdentityStage;
  confidence: "low" | "medium" | "high";
  identitySignals: string[];
  identityStatement: string;
  suggestedNextIdentityAction?: string;
};

export type RuntimeInsightSynthesis = {
  title: string;
  summary: string;
  primaryInsight: string;
  supportingSignals: string[];
  recommendedFocus: string;
  confidence: "low" | "medium" | "high";
  strategyRecommendation?: RuntimeStrategyRecommendation;
};

export type RuntimeStrategyRecommendation = {
  title: string;
  summary: string;
  recommendedPrDirection: string;
  recommendedNextPrs: string[];
  rationale: string;
  priority: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
};