import {
    describe,
    expect,
    it,
} from "vitest";

import type {
    ProjectRecord,
} from "../../lib/projectPersistence";

import {
    createCanonicalProjectState,
} from "../createCanonicalProjectState";


function createProjectRecord(
  overrides:
    Partial<ProjectRecord> = {}
): ProjectRecord {
  return {
    id:
      "375880f2-5a87-4f60-8144-e91ea469ef04",

    userId:
      "945b3454-3d6c-4433-af37-40e3fa227776",

    name:
      "class-concept-robot",

    repositoryId:
      "1327565641",

    repositoryOwner:
      "fribot-labs",

    repositoryName:
      "class-concept-robot",

    templateId:
      null,

    courseId:
      null,

    currentFocus:
      null,

    status:
      "active",

    startedAt:
      null,

    createdAt:
      "2026-08-12T00:00:00.000Z",

    updatedAt:
      "2026-08-12T00:00:00.000Z",

    ...overrides,
  };
}


describe(
  "createCanonicalProjectState",
  () => {
    it(
      "preserves the canonical Project identity",
      () => {
        const project =
          createProjectRecord();

        const result =
          createCanonicalProjectState(
            project
          );

        expect(
          result.projectId
        ).toBe(
          project.id
        );
      }
    );


    it(
      "marks a Project as started when startedAt exists",
      () => {
        const project =
          createProjectRecord({
            startedAt:
              "2026-08-12T00:50:57.906Z",
          });

        const result =
          createCanonicalProjectState(
            project
          );

        expect(
          result.isStarted
        ).toBe(
          true
        );
      }
    );


    it(
      "marks a Project as not started when startedAt is null",
      () => {
        const project =
          createProjectRecord({
            startedAt:
              null,
          });

        const result =
          createCanonicalProjectState(
            project
          );

        expect(
          result.isStarted
        ).toBe(
          false
        );
      }
    );


    it(
      "restores the canonical current focus",
      () => {
        const project =
          createProjectRecord({
            currentFocus:
              "class abstraction",
          });

        const result =
          createCanonicalProjectState(
            project
          );

        expect(
          result.currentFocus
        ).toBe(
          "class abstraction"
        );
      }
    );


    it(
      "normalizes the canonical current focus",
      () => {
        const project =
          createProjectRecord({
            currentFocus:
              "  class relationships  ",
          });

        const result =
          createCanonicalProjectState(
            project
          );

        expect(
          result.currentFocus
        ).toBe(
          "class relationships"
        );
      }
    );


    it(
      "uses an empty current focus when the canonical focus is null",
      () => {
        const project =
          createProjectRecord({
            currentFocus:
              null,
          });

        const result =
          createCanonicalProjectState(
            project
          );

        expect(
          result.currentFocus
        ).toBe(
          ""
        );
      }
    );


    it(
      "uses an empty current focus when the canonical focus contains only whitespace",
      () => {
        const project =
          createProjectRecord({
            currentFocus:
              "   ",
          });

        const result =
          createCanonicalProjectState(
            project
          );

        expect(
          result.currentFocus
        ).toBe(
          ""
        );
      }
    );


    it(
      "creates the complete canonical Project state",
      () => {
        const project =
          createProjectRecord({
            currentFocus:
              "canonical restoration test",

            startedAt:
              "2026-08-12T00:50:57.906Z",
          });

        const result =
          createCanonicalProjectState(
            project
          );

        expect(
          result
        ).toEqual({
          projectId:
            project.id,

          isStarted:
            true,

          currentFocus:
            "canonical restoration test",
        });
      }
    );
  }
);