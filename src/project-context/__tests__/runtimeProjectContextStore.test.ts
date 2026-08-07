import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";

import {
    clearRuntimeProjectContext,
    loadRuntimeProjectContext,
    saveRuntimeProjectContext,
} from "../runtimeProjectContextStore";

import type {
    RuntimeProjectContext,
} from "../runtimeProjectContextTypes";

const STORAGE_KEY =
  "innermirror.runtimeProjectContext";

function createProjectContext(
  overrides: Partial<RuntimeProjectContext> = {}
): RuntimeProjectContext {
  return {
    contextVersion:
      "v1",

    projectId:
      "github:fribot-labs:fribot-learning",

    kind:
      "pbl",

    learningMode:
      "project-based-learning",

    learningStage:
      "not-defined",

    goal:
      null,

    currentMilestone:
      null,

    source:
      "repository-derived",

    createdAt:
      "2026-08-07T00:00:00.000Z",

    updatedAt:
      "2026-08-07T00:00:00.000Z",

    ...overrides,
  };
}

describe(
  "runtimeProjectContextStore",
  () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    afterEach(() => {
      window.localStorage.clear();
    });

    it(
      "returns null when no Project Context is stored",
      () => {
        expect(
          loadRuntimeProjectContext()
        ).toBeNull();
      }
    );

    it(
      "saves Runtime Project Context to localStorage",
      () => {
        const context =
          createProjectContext();

        saveRuntimeProjectContext(
          context
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
          context
        );
      }
    );

    it(
      "loads a valid stored Runtime Project Context",
      () => {
        const context =
          createProjectContext();

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            context
          )
        );

        expect(
          loadRuntimeProjectContext()
        ).toEqual(
          context
        );
      }
    );

    it(
      "preserves general project contexts",
      () => {
        const context =
          createProjectContext({
            projectId:
              "github:wookjin-chung:tandem-robotics",

            kind:
              "general",

            learningMode:
              "general-project",
          });

        saveRuntimeProjectContext(
          context
        );

        expect(
          loadRuntimeProjectContext()
        ).toEqual(
          context
        );
      }
    );

    it(
      "clears the stored Runtime Project Context",
      () => {
        saveRuntimeProjectContext(
          createProjectContext()
        );

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).not.toBeNull();

        clearRuntimeProjectContext();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();

        expect(
          loadRuntimeProjectContext()
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
          loadRuntimeProjectContext()
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
            "invalid-context"
          )
        );

        expect(
          loadRuntimeProjectContext()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes stored values with an invalid contextVersion",
      () => {
        const invalidContext = {
          ...createProjectContext(),

          contextVersion:
            "v2",
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidContext
          )
        );

        expect(
          loadRuntimeProjectContext()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes stored values with an invalid project kind",
      () => {
        const invalidContext = {
          ...createProjectContext(),

          kind:
            "unknown-project",
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidContext
          )
        );

        expect(
          loadRuntimeProjectContext()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes stored values with an invalid learning mode",
      () => {
        const invalidContext = {
          ...createProjectContext(),

          learningMode:
            "unknown-learning-mode",
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidContext
          )
        );

        expect(
          loadRuntimeProjectContext()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes stored values when projectId is missing",
      () => {
        const {
          projectId: _projectId,
          ...invalidContext
        } =
          createProjectContext();

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidContext
          )
        );

        expect(
          loadRuntimeProjectContext()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes stored values when createdAt is missing",
      () => {
        const {
          createdAt: _createdAt,
          ...invalidContext
        } =
          createProjectContext();

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidContext
          )
        );

        expect(
          loadRuntimeProjectContext()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );

    it(
      "removes stored values when updatedAt is missing",
      () => {
        const {
          updatedAt: _updatedAt,
          ...invalidContext
        } =
          createProjectContext();

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidContext
          )
        );

        expect(
          loadRuntimeProjectContext()
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