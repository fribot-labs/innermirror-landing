import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createRuntimeContractV2Payload,
} from "../createRuntimeContractV2Payload";

import type {
    RuntimeProjectRecommendationInput,
} from "../../runtime-project-intelligence/runtimeProjectIntelligenceAdapterTypes";

import type {
    GitHubSnapshot,
} from "../../types/githubSnapshot";

import type {
    RuntimeProjectHistory,
} from "../../types/runtimeContractV2";

function createProject() {
  return {
    projectId:
      "github:fribot-labs:fribot-learning",

    name:
      "fribot-learning",

    currentStep:
      "Runtime Metadata UI",
  };
}

function createRepository() {
  return {
    owner:
      "fribot-labs",

    name:
      "fribot-learning",

    defaultBranch:
      "main",
  };
}

function createSnapshot(): GitHubSnapshot {
  return {
    repository: {
      owner:
        "fribot-labs",

      name:
        "fribot-learning",

      defaultBranch:
        "main",
    },

    recentCommits: [],

    recentPullRequests: [],

    capturedAt:
      "2026-08-08T00:00:00.000Z",
  };
}

function createRecommendationInput():
  RuntimeProjectRecommendationInput {
  return {
    adapterVersion:
      "v1",

    projectId:
      "github:fribot-labs:fribot-learning",

    projectTitle:
      "fribot-learning",

    projectKind:
      "pbl",

    metadataSource:
      "repository-derived",

    readiness:
      "ready",

    currentFocus:
      "Runtime Metadata UI",

    projectSummary:
      "Current project is ready.",

    difficulty:
      null,

    estimatedWeeks:
      null,

    learningGoal:
      null,
  };
}

describe(
  "createRuntimeContractV2Payload",
  () => {

    it(
      "creates a payload with reflection",
      () => {

        const payload =
          createRuntimeContractV2Payload({

            reflectionText:
              " Reflection ",

            reflectionCreatedAt:
              "2026-08-08T00:00:00.000Z",

            project:
              createProject(),

            repository:
              createRepository(),
          });

        expect(
          payload.reflection
        ).toEqual({

          text:
            "Reflection",

          createdAt:
            "2026-08-08T00:00:00.000Z",
        });

      }
    );

    it(
      "omits reflection when text is empty",
      () => {

        const payload =
          createRuntimeContractV2Payload({

            reflectionText:
              "   ",

            project:
              createProject(),

            repository:
              createRepository(),
          });

        expect(
          payload.reflection
        ).toBeUndefined();

      }
    );

    it(
      "copies project",
      () => {

        const project =
          createProject();

        const payload =
          createRuntimeContractV2Payload({

            project,

            repository:
              createRepository(),
          });

        expect(
          payload.project
        ).toEqual(
          project
        );

      }
    );

    it(
      "copies repository",
      () => {

        const repository =
          createRepository();

        const payload =
          createRuntimeContractV2Payload({

            project:
              createProject(),

            repository,
          });

        expect(
          payload.repository
        ).toEqual(
          repository
        );

      }
    );

    it(
      "includes GitHub Snapshot",
      () => {

        const snapshot =
          createSnapshot();

        const payload =
          createRuntimeContractV2Payload({

            project:
              createProject(),

            repository:
              createRepository(),

            githubSnapshot:
              snapshot,
          });

        expect(
          payload.githubSnapshot
        ).toEqual(
          snapshot
        );

      }
    );

    it(
      "includes Project Recommendation Input",
      () => {

        const recommendation =
          createRecommendationInput();

        const payload =
          createRuntimeContractV2Payload({

            project:
              createProject(),

            repository:
              createRepository(),

            projectRecommendationInput:
              recommendation,
          });

        expect(
          payload.projectRecommendationInput
        ).toEqual(
          recommendation
        );

      }
    );

    it(
      "supports reflection and project recommendation together",
      () => {

        const payload =
          createRuntimeContractV2Payload({

            reflectionText:
              "Reflection",

            project:
              createProject(),

            repository:
              createRepository(),

            projectRecommendationInput:
              createRecommendationInput(),
          });

        expect(
          payload.reflection
        ).toBeDefined();

        expect(
          payload.projectRecommendationInput
        ).toBeDefined();

      }
    );

    it(
      "supports github snapshot and project recommendation together",
      () => {

        const payload =
          createRuntimeContractV2Payload({

            project:
              createProject(),

            repository:
              createRepository(),

            githubSnapshot:
              createSnapshot(),

            projectRecommendationInput:
              createRecommendationInput(),
          });

        expect(
          payload.githubSnapshot
        ).toBeDefined();

        expect(
          payload.projectRecommendationInput
        ).toBeDefined();

      }
    );

    it(
      "supports reflection github snapshot and recommendation together",
      () => {

        const payload =
          createRuntimeContractV2Payload({

            reflectionText:
              "Reflection",

            project:
              createProject(),

            repository:
              createRepository(),

            githubSnapshot:
              createSnapshot(),

            projectRecommendationInput:
              createRecommendationInput(),

            trigger:
              "combined",
          });

        expect(
          payload.reflection
        ).toBeDefined();

        expect(
          payload.githubSnapshot
        ).toBeDefined();

        expect(
          payload.projectRecommendationInput
        ).toBeDefined();

        expect(
          payload.trigger
        ).toBe(
          "combined"
        );

      }
    );

    it(
      "inherits currentStep into learningContext",
      () => {

        const payload =
          createRuntimeContractV2Payload({

            project:
              createProject(),

            repository:
              createRepository(),
          });

        expect(
          payload.learningContext.currentStep
        ).toBe(
          "Runtime Metadata UI"
        );

      }
    );

    it(
      "defaults learner level to junior",
      () => {

        const payload =
          createRuntimeContractV2Payload({

            project:
              createProject(),

            repository:
              createRepository(),
          });

        expect(
          payload.learningContext.learnerLevel
        ).toBe(
          "junior"
        );

      }
    );

    it(
      "preserves project history",
      () => {
        const history:
          RuntimeProjectHistory = {
          events: [
            {
            source:
              "project",

            title:
              "Analyze",

            summary:
              "Runtime",

            tags: [],

            createdAt:
              "2026-08-08T00:00:00.000Z",
            },
          ],
        };

        const payload =
          createRuntimeContractV2Payload({
            project:
              createProject(),

            repository:
              createRepository(),

            projectHistory:
              history,
          });

        expect(
          payload.projectHistory
        ).toEqual(
          history
        );
      }
    );

    it(
      "does not mutate source objects",
      () => {

        const recommendation =
          createRecommendationInput();

        const snapshot =
          createSnapshot();

        const project =
          createProject();

        const repository =
          createRepository();

        const recommendationCopy =
          structuredClone(
            recommendation
          );

        const snapshotCopy =
          structuredClone(
            snapshot
          );

        createRuntimeContractV2Payload({

          project,

          repository,

          githubSnapshot:
            snapshot,

          projectRecommendationInput:
            recommendation,
        });

        expect(
          recommendation
        ).toEqual(
          recommendationCopy
        );

        expect(
          snapshot
        ).toEqual(
          snapshotCopy
        );

      }
    );

    it(
      "creates a new payload object",
      () => {

        const payload =
          createRuntimeContractV2Payload({

            project:
              createProject(),

            repository:
              createRepository(),
          });

        expect(
          payload
        ).not.toBe(
          createProject()
        );

      }
    );

  }
);