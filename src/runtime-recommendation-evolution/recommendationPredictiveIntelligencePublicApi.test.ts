import {
    describe,
    expect,
    it,
} from "vitest";

import {
    updateRecommendationPredictiveIntelligence,
} from "./index";

import type {
    RecommendationPredictiveIntelligence,
    RecommendationPredictiveIntelligenceUpdateResult,
    RecommendationPredictivePresentation,
    UpdateRecommendationPredictiveIntelligenceParams,
} from "./index";

type PredictivePublicContracts = {
    analysis:
        RecommendationPredictiveIntelligence;

    presentation:
        RecommendationPredictivePresentation;

    result:
        RecommendationPredictiveIntelligenceUpdateResult;

    params:
        UpdateRecommendationPredictiveIntelligenceParams;
};

describe(
    "Recommendation Predictive Intelligence Public API",
    () => {
        it(
            "exports the Predictive Intelligence update orchestrator",
            () => {
                expect(
                    updateRecommendationPredictiveIntelligence,
                ).toBeTypeOf(
                    "function",
                );
            },
        );

        it(
            "keeps the Predictive Intelligence public contracts available",
            () => {
                const contracts:
                    PredictivePublicContracts | null =
                    null;

                expect(
                    contracts,
                ).toBeNull();
            },
        );
    },
);