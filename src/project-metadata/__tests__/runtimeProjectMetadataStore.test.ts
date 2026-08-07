import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";

import {
    clearRuntimeProjectMetadata,
    loadRuntimeProjectMetadata,
    saveRuntimeProjectMetadata,
} from "../runtimeProjectMetadataStore";

import type {
    RuntimeProjectMetadata,
} from "../runtimeProjectMetadataTypes";

const STORAGE_KEY =
  "innermirror.runtimeProjectMetadata";

function createProjectMetadata(
  overrides: Partial<RuntimeProjectMetadata> = {}
): RuntimeProjectMetadata {
  return {
    metadataVersion:
      "v1",

    projectId:
      "github:fribot-labs:fribot-learning",

    templateId:
      null,

    courseId:
      null,

    title:
      "fribot-learning",

    difficulty:
      null,

    estimatedWeeks:
      null,

    learningGoal:
      null,

    source:
      "repository-derived",

    discoveredAt:
      "2026-08-07T08:00:00.000Z",

    updatedAt:
      "2026-08-07T08:00:00.000Z",

    ...overrides,
  };
}

describe(
  "runtimeProjectMetadataStore",
  () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    afterEach(() => {
      window.localStorage.clear();
    });

    it(
      "returns null when no Project Metadata is stored",
      () => {
        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();
      }
    );

    it(
      "saves Runtime Project Metadata to localStorage",
      () => {
        const metadata =
          createProjectMetadata();

        saveRuntimeProjectMetadata(
          metadata
        );

        const storedValue =
          window.localStorage.getItem(
            STORAGE_KEY
          );

        expect(
          storedValue
        ).not.toBeNull();

        expect(
          JSON.parse(
            storedValue as string
          )
        ).toEqual(
          metadata
        );
      }
    );

    it(
      "loads valid Runtime Project Metadata",
      () => {
        const metadata =
          createProjectMetadata();

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            metadata
          )
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toEqual(
          metadata
        );
      }
    );

    it(
      "preserves discovered PBL manifest metadata",
      () => {
        const metadata =
          createProjectMetadata({
            templateId:
              "robotics-foundation",

            courseId:
              "fribot-robotics-001",

            title:
              "Fribot Robotics Foundation",

            difficulty:
              "beginner",

            estimatedWeeks:
              6,

            learningGoal:
              "Build and understand a project-based robotics system.",

            source:
              "pbl-manifest",
          });

        saveRuntimeProjectMetadata(
          metadata
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toEqual(
          metadata
        );
      }
    );

    it(
      "allows nullable metadata fields",
      () => {
        const metadata =
          createProjectMetadata({
            templateId:
              null,

            courseId:
              null,

            title:
              null,

            difficulty:
              null,

            estimatedWeeks:
              null,

            learningGoal:
              null,
          });

        saveRuntimeProjectMetadata(
          metadata
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toEqual(
          metadata
        );
      }
    );

    it(
      "clears stored Runtime Project Metadata",
      () => {
        saveRuntimeProjectMetadata(
          createProjectMetadata()
        );

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).not.toBeNull();

        clearRuntimeProjectMetadata();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();
      }
    );

    it(
      "removes malformed JSON and returns null",
      () => {
        window.localStorage.setItem(
          STORAGE_KEY,
          "{invalid-json"
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes stored values that are not objects",
      () => {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            "invalid-metadata"
          )
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes stored values with an invalid metadataVersion",
      () => {
        const invalidMetadata = {
          ...createProjectMetadata(),

          metadataVersion:
            "v2",
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidMetadata
          )
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes stored values with an empty projectId",
      () => {
        const invalidMetadata = {
          ...createProjectMetadata(),

          projectId:
            "   ",
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidMetadata
          )
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes stored values with an invalid source",
      () => {
        const invalidMetadata = {
          ...createProjectMetadata(),

          source:
            "unknown-source",
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidMetadata
          )
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "accepts repository-derived metadata source",
      () => {
        const metadata =
          createProjectMetadata({
            source:
              "repository-derived",
          });

        saveRuntimeProjectMetadata(
          metadata
        );

        expect(
          loadRuntimeProjectMetadata()
            ?.source
        ).toBe(
          "repository-derived"
        );
      }
    );

    it(
      "accepts pbl-manifest metadata source",
      () => {
        const metadata =
          createProjectMetadata({
            source:
              "pbl-manifest",
          });

        saveRuntimeProjectMetadata(
          metadata
        );

        expect(
          loadRuntimeProjectMetadata()
            ?.source
        ).toBe(
          "pbl-manifest"
        );
      }
    );

    it(
      "removes metadata when estimatedWeeks is negative",
      () => {
        const invalidMetadata = {
          ...createProjectMetadata(),

          estimatedWeeks:
            -1,
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidMetadata
          )
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "rejects metadata when estimatedWeeks is not finite",
      () => {
        const invalidMetadata:
          RuntimeProjectMetadata = {
            ...createProjectMetadata(),

            estimatedWeeks:
              Number.POSITIVE_INFINITY,
          };

        expect(() =>
          saveRuntimeProjectMetadata(
            invalidMetadata
          )
        ).toThrow(
          "Runtime Project Metadata is invalid."
        );

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "accepts zero estimatedWeeks under the current v1 contract",
      () => {
        const metadata =
          createProjectMetadata({
            estimatedWeeks:
              0,
          });

        saveRuntimeProjectMetadata(
          metadata
        );

        expect(
          loadRuntimeProjectMetadata()
            ?.estimatedWeeks
        ).toBe(
          0
        );
      }
    );

    it(
      "accepts positive estimatedWeeks",
      () => {
        const metadata =
          createProjectMetadata({
            estimatedWeeks:
              6,
          });

        saveRuntimeProjectMetadata(
          metadata
        );

        expect(
          loadRuntimeProjectMetadata()
            ?.estimatedWeeks
        ).toBe(
          6
        );
      }
    );

    it(
      "removes metadata when discoveredAt is invalid",
      () => {
        const invalidMetadata = {
          ...createProjectMetadata(),

          discoveredAt:
            "not-a-valid-date",
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidMetadata
          )
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes metadata when discoveredAt is valid but not normalized ISO",
      () => {
        const invalidMetadata = {
          ...createProjectMetadata(),

          discoveredAt:
            "2026-08-07T17:00:00+09:00",
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidMetadata
          )
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes metadata when updatedAt is invalid",
      () => {
        const invalidMetadata = {
          ...createProjectMetadata(),

          updatedAt:
            "invalid-updated-at",
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidMetadata
          )
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes metadata when a nullable string field has the wrong type",
      () => {
        const invalidMetadata = {
          ...createProjectMetadata(),

          difficulty:
            123,
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidMetadata
          )
        );

        expect(
          loadRuntimeProjectMetadata()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );
  }
);