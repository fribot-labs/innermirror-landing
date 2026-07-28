import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createRecommendationAdaptiveLearningPresentationView,
    summarizeRecommendationAdaptiveLearningUpdate,
    updateRecommendationAdaptiveLearning,
} from "./index";

describe(
  "runtime-recommendation-evolution public boundary",
  () => {
    it(
      "exports the supported Adaptive Learning public API",
      () => {
        expect(
          updateRecommendationAdaptiveLearning,
        ).toBeTypeOf(
          "function",
        );

        expect(
          summarizeRecommendationAdaptiveLearningUpdate,
        ).toBeTypeOf(
          "function",
        );

        expect(
          createRecommendationAdaptiveLearningPresentationView,
        ).toBeTypeOf(
          "function",
        );
      },
    );
  },
);