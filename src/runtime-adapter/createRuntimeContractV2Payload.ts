import type { GitHubSnapshot } from "../types/githubSnapshot";
import type {
  RuntimeContractV2Input,
  RuntimeExecutionTrigger,
  RuntimeLearningContext,
  RuntimeProjectContext,
  RuntimeProjectHistory,
  RuntimeReflection,
  RuntimeRepositoryContext,
} from "../types/runtimeContractV2";

import type {
  RuntimeProjectRecommendationInput,
} from "../runtime-project-intelligence/runtimeProjectIntelligenceAdapterTypes";

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
  reflectionText?:
    string;

  reflectionCreatedAt?:
    string;

  project:
    RuntimeProjectContext;

  repository:
    RuntimeRepositoryContext;

  githubSnapshot?:
    GitHubSnapshot;

  projectRecommendationInput?:
    RuntimeProjectRecommendationInput;

  learningContext?:
    RuntimeLearningContext;

  projectHistory?:
    RuntimeProjectHistory;

  trigger?:
    RuntimeExecutionTrigger;
};

export function createRuntimeContractV2Payload(
  options: CreateRuntimeContractV2PayloadOptions
): RuntimeContractV2Input {
  const trimmedReflectionText =
    options.reflectionText?.trim() ?? "";

  const reflection: RuntimeReflection | undefined =
    trimmedReflectionText.length > 0
      ? {
          text: trimmedReflectionText,
          createdAt:
            options.reflectionCreatedAt ??
            new Date().toISOString(),
        }
      : undefined;

  const payload: RuntimeContractV2Input = {
    ...(reflection
      ? {
          reflection,
        }
      : {}),

    project:
      options.project,

    repository:
      options.repository,

    ...(options.githubSnapshot
      ? {
          githubSnapshot:
            options.githubSnapshot,
        }
      : {}),

    ...(options.projectRecommendationInput
      ? {
          projectRecommendationInput:
            options.projectRecommendationInput,
        }
      : {}),

    learningContext: {
      currentStep:
        options.learningContext?.currentStep ??
        options.project.currentStep,

      currentGoal:
        options.learningContext?.currentGoal,

      knownIssue:
        options.learningContext?.knownIssue,

      learnerLevel:
        options.learningContext?.learnerLevel ?? "junior",
    },

    trigger: options.trigger,
  };

  if (options.projectHistory !== undefined) {
    payload.projectHistory = options.projectHistory;
  }

  return payload;
}