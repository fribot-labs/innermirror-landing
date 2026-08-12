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
  RuntimeProjectHistoryInputV1,
} from "../../project-history-runtime/projectHistoryRuntimeContractTypes";

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


function createCanonicalProjectHistory():
  RuntimeProjectHistoryInputV1 {
  return {
    contractVersion:
      "v1",

    project: {
      projectId:
        "375880f2-5a87-4f60-8144-e91ea469ef04",

      repositoryId:
        "123456789",
    },

    events: [
      {
        eventId:
          "project-start-event-1",

        eventType:
          "project-started",

        focus:
          "Class abstraction",

        occurredAt:
          "2026-08-12T00:50:58.000Z",
      },

      {
        eventId:
          "focus-update-event-1",

        eventType:
          "focus-updated",

        previousFocus:
          "Class abstraction",

        nextFocus:
          "Class relationships",

        occurredAt:
          "2026-08-12T00:53:21.000Z",
      },

      {
        eventId:
          "reflection-1",

        eventType:
          "reflection",

        content:
          "I am beginning to understand how class relationships organize state and behavior.",

        source:
          "landing",

        occurredAt:
          "2026-08-12T01:00:00.000Z",
      },
    ],

    eventCount:
      3,

    timeRange: {
      startedAt:
        "2026-08-12T00:50:58.000Z",

      endedAt:
        "2026-08-12T01:00:00.000Z",
    },

    snapshotCreatedAt:
      "2026-08-12T01:05:00.000Z",
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
      "preserves canonical project history",
      () => {
        const canonicalHistory =
          createCanonicalProjectHistory();

        const payload =
          createRuntimeContractV2Payload({
            project:
              createProject(),

            repository:
              createRepository(),

            canonicalProjectHistory:
              canonicalHistory,
          });

        expect(
          payload.canonicalProjectHistory
        ).toEqual(
          canonicalHistory
        );
      }
    );


    it(
      "omits canonical project history when it is not provided",
      () => {
        const payload =
          createRuntimeContractV2Payload({
            project:
              createProject(),

            repository:
              createRepository(),
          });

        expect(
          payload.canonicalProjectHistory
        ).toBeUndefined();
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

        const canonicalHistory =
          createCanonicalProjectHistory();

        const recommendationCopy =
          structuredClone(
            recommendation
          );

        const snapshotCopy =
          structuredClone(
            snapshot
          );

        const projectCopy =
          structuredClone(
            project
          );

        const repositoryCopy =
          structuredClone(
            repository
          );

        const canonicalHistoryCopy =
          structuredClone(
            canonicalHistory
          );

        createRuntimeContractV2Payload({
          project,

          repository,

          githubSnapshot:
            snapshot,

          projectRecommendationInput:
            recommendation,

          canonicalProjectHistory:
            canonicalHistory,
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

        expect(
          project
        ).toEqual(
          projectCopy
        );

        expect(
          repository
        ).toEqual(
          repositoryCopy
        );

        expect(
          canonicalHistory
        ).toEqual(
          canonicalHistoryCopy
        );
      }
    );


    it(
      "preserves PBL metadata in the Runtime V2 project recommendation input",
      () => {
        const recommendation:
          RuntimeProjectRecommendationInput = {
          adapterVersion:
            "v1",

          projectId:
            "github:fribot-labs:class-concept-robot",

          projectTitle:
            "Class Concept Robot",

          projectKind:
            "pbl",

          metadataSource:
            "pbl-manifest",

          readiness:
            "ready",

          currentFocus:
            "Class responsibility",

          projectSummary:
            "Class Concept Robot is currently focused on understanding class responsibility.",

          difficulty:
            "beginner",

          estimatedWeeks:
            4,

          learningGoal:
            "Understand why related state and behavior can be organized together through a class in robot programming.",
        };

        const payload =
          createRuntimeContractV2Payload({
            project: {
              projectId:
                "github:fribot-labs:class-concept-robot",

              name:
                "Class Concept Robot",

              currentStep:
                "Understand",
            },

            repository: {
              owner:
                "fribot-labs",

              name:
                "class-concept-robot",

              defaultBranch:
                "main",
            },

            projectRecommendationInput:
              recommendation,

            learningContext: {
              currentStep:
                "Understand",

              learnerLevel:
                "beginner",
            },

            trigger:
              "github-snapshot",
          });

        expect(
          payload.projectRecommendationInput
        ).toEqual({
          adapterVersion:
            "v1",

          projectId:
            "github:fribot-labs:class-concept-robot",

          projectTitle:
            "Class Concept Robot",

          projectKind:
            "pbl",

          metadataSource:
            "pbl-manifest",

          readiness:
            "ready",

          currentFocus:
            "Class responsibility",

          projectSummary:
            "Class Concept Robot is currently focused on understanding class responsibility.",

          difficulty:
            "beginner",

          estimatedWeeks:
            4,

          learningGoal:
            "Understand why related state and behavior can be organized together through a class in robot programming.",
        });

        expect(
          payload.project.projectId
        ).toBe(
          "github:fribot-labs:class-concept-robot"
        );

        expect(
          payload.repository.name
        ).toBe(
          "class-concept-robot"
        );

        expect(
          payload.learningContext.currentStep
        ).toBe(
          "Understand"
        );

        expect(
          payload.learningContext.learnerLevel
        ).toBe(
          "beginner"
        );

        expect(
          payload.trigger
        ).toBe(
          "github-snapshot"
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