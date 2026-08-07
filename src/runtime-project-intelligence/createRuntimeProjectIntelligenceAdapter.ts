import type {
    RuntimeProjectIntelligence,
} from "../project-intelligence/runtimeProjectIntelligenceTypes";

import type {
    RuntimeProjectRecommendationInput,
} from "./runtimeProjectIntelligenceAdapterTypes";

export type CreateRuntimeProjectIntelligenceAdapterInput = {
  intelligence:
    RuntimeProjectIntelligence;
};

export function createRuntimeProjectIntelligenceAdapter({
  intelligence,
}: CreateRuntimeProjectIntelligenceAdapterInput):
  RuntimeProjectRecommendationInput {
  return {
    adapterVersion:
      "v1",

    projectId:
      intelligence.projectId,

    projectTitle:
      intelligence.title,

    projectKind:
      intelligence.projectKind,

    metadataSource:
      intelligence.source,

    readiness:
      intelligence.readiness,

    currentFocus:
      intelligence.currentFocus,

    projectSummary:
      intelligence.summary,

    difficulty:
      intelligence.difficulty,

    estimatedWeeks:
      intelligence.estimatedWeeks,

    learningGoal:
      intelligence.learningGoal,
  };
}