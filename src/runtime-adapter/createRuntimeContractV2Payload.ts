import type { GitHubSnapshot } from "../types/githubSnapshot";
import type {
    RuntimeContractV2Input,
    RuntimeLearningContext,
    RuntimeProjectContext,
    RuntimeReflection,
    RuntimeRepositoryContext,
} from "../types/runtimeContractV2";

/**
 * Runtime Contract V2 Payload Builder
 *
 * Landing prepares Runtime Contract V2.
 *
 * Runtime interprets Runtime Contract V2.
 *
 * This helper converts Landing state into the official
 * Runtime communication model.
 */

export type CreateRuntimeContractV2PayloadOptions = {
  reflectionText: string;

  reflectionCreatedAt?: string;

  project: RuntimeProjectContext;

  repository: RuntimeRepositoryContext;

  githubSnapshot: GitHubSnapshot;

  learningContext?: RuntimeLearningContext;
};

export function createRuntimeContractV2Payload(
  options: CreateRuntimeContractV2PayloadOptions
): RuntimeContractV2Input {
  const reflection: RuntimeReflection = {
    text: options.reflectionText.trim(),
    createdAt:
      options.reflectionCreatedAt ??
      new Date().toISOString(),
  };

  return {
    reflection,

    project: options.project,

    repository: options.repository,

    githubSnapshot: options.githubSnapshot,

    learningContext: {
      currentStep:
        options.learningContext?.currentStep ??
        options.project.currentStep,

      currentGoal:
        options.learningContext?.currentGoal,

      knownIssue:
        options.learningContext?.knownIssue,

      learnerLevel:
        options.learningContext?.learnerLevel ??
        "junior",
    },
  };
}