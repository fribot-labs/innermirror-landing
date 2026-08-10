import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";

import {
    clearRuntimeProjectIdentity,
    loadRuntimeProjectIdentity,
    saveRuntimeProjectIdentity,
} from "../runtimeProjectIdentityStore";

import type {
    RuntimeProjectIdentity,
} from "../runtimeProjectIdentityTypes";


const STORAGE_KEY =
  "innermirror.runtimeProjectIdentity";


function createProjectIdentity(
  overrides:
    Partial<RuntimeProjectIdentity> = {}
): RuntimeProjectIdentity {
  return {
    projectId:
      "github:fribot-labs:innermirror-landing",

    source:
      "github-repository",

    kind:
      "general",

    repository: {
      repositoryId:
        "123456789",

      owner:
        "fribot-labs",

      name:
        "innermirror-landing",

      fullName:
        "fribot-labs/innermirror-landing",

      defaultBranch:
        "main",

      htmlUrl:
        "https://github.com/fribot-labs/innermirror-landing",
    },

    createdAt:
      "2026-08-10T00:00:00.000Z",

    ...overrides,
  };
}


describe(
  "runtimeProjectIdentityStore",
  () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    afterEach(() => {
      window.localStorage.clear();
    });


    it(
      "returns null when no Runtime Project Identity is stored",
      () => {
        expect(
          loadRuntimeProjectIdentity()
        ).toBeNull();
      }
    );


    it(
      "saves Runtime Project Identity with the stable repositoryId",
      () => {
        const identity =
          createProjectIdentity();

        saveRuntimeProjectIdentity(
          identity
        );

        const storedValue =
          window.localStorage.getItem(
            STORAGE_KEY
          );

        expect(
          storedValue
        ).not.toBeNull();

        const parsedValue =
          JSON.parse(
            storedValue as string
          ) as RuntimeProjectIdentity;

        expect(
          parsedValue.repository.repositoryId
        ).toBe(
          "123456789"
        );
      }
    );


    it(
      "loads a valid stored Runtime Project Identity",
      () => {
        const identity =
          createProjectIdentity();

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            identity
          )
        );

        expect(
          loadRuntimeProjectIdentity()
        ).toEqual(
          identity
        );
      }
    );


    it(
      "preserves the stable repositoryId during save and load",
      () => {
        const identity =
          createProjectIdentity({
            repository: {
              repositoryId:
                "987654321",

              owner:
                "fribot-labs",

              name:
                "innermirror-landing",

              fullName:
                "fribot-labs/innermirror-landing",

              defaultBranch:
                "main",

              htmlUrl:
                "https://github.com/fribot-labs/innermirror-landing",
            },
          });

        saveRuntimeProjectIdentity(
          identity
        );

        const loadedIdentity =
          loadRuntimeProjectIdentity();

        expect(
          loadedIdentity?.repository.repositoryId
        ).toBe(
          "987654321"
        );
      }
    );


    it(
      "normalizes repositoryId whitespace when loading",
      () => {
        const identity =
          createProjectIdentity();

        const storedIdentity = {
          ...identity,

          repository: {
            ...identity.repository,

            repositoryId:
              "  123456789  ",
          },
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            storedIdentity
          )
        );

        expect(
          loadRuntimeProjectIdentity()
            ?.repository.repositoryId
        ).toBe(
          "123456789"
        );
      }
    );


    it(
      "clears the stored Runtime Project Identity",
      () => {
        saveRuntimeProjectIdentity(
          createProjectIdentity()
        );

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).not.toBeNull();

        clearRuntimeProjectIdentity();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();

        expect(
          loadRuntimeProjectIdentity()
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
          loadRuntimeProjectIdentity()
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
            "invalid-identity"
          )
        );

        expect(
          loadRuntimeProjectIdentity()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );


    it(
      "removes legacy stored identities without repositoryId",
      () => {
        const identity =
          createProjectIdentity();

        const {
          repositoryId:
            _repositoryId,
          ...legacyRepository
        } =
          identity.repository;

        const legacyIdentity = {
          ...identity,

          repository:
            legacyRepository,
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            legacyIdentity
          )
        );

        expect(
          loadRuntimeProjectIdentity()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );


    it(
      "removes stored identities with an empty repositoryId",
      () => {
        const identity =
          createProjectIdentity();

        const invalidIdentity = {
          ...identity,

          repository: {
            ...identity.repository,

            repositoryId:
              "   ",
          },
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidIdentity
          )
        );

        expect(
          loadRuntimeProjectIdentity()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );


    it(
      "removes stored identities with a non-numeric repositoryId",
      () => {
        const identity =
          createProjectIdentity();

        const invalidIdentity = {
          ...identity,

          repository: {
            ...identity.repository,

            repositoryId:
              "not-a-github-id",
          },
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidIdentity
          )
        );

        expect(
          loadRuntimeProjectIdentity()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );


    it(
      "removes stored identities with a non-positive repositoryId",
      () => {
        const identity =
          createProjectIdentity();

        const invalidIdentity = {
          ...identity,

          repository: {
            ...identity.repository,

            repositoryId:
              "0",
          },
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidIdentity
          )
        );

        expect(
          loadRuntimeProjectIdentity()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );


    it(
      "removes stored identities when projectId does not match repository metadata",
      () => {
        const invalidIdentity =
          createProjectIdentity({
            projectId:
              "github:other-owner:other-project",
          });

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidIdentity
          )
        );

        expect(
          loadRuntimeProjectIdentity()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );


    it(
      "removes stored identities with inconsistent fullName",
      () => {
        const identity =
          createProjectIdentity();

        const invalidIdentity = {
          ...identity,

          repository: {
            ...identity.repository,

            fullName:
              "different-owner/different-project",
          },
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidIdentity
          )
        );

        expect(
          loadRuntimeProjectIdentity()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );


    it(
      "removes stored identities with an invalid GitHub repository URL",
      () => {
        const identity =
          createProjectIdentity();

        const invalidIdentity = {
          ...identity,

          repository: {
            ...identity.repository,

            htmlUrl:
              "https://example.com/fribot-labs/innermirror-landing",
          },
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidIdentity
          )
        );

        expect(
          loadRuntimeProjectIdentity()
        ).toBeNull();

        expect(
          window.localStorage.getItem(
            STORAGE_KEY
          )
        ).toBeNull();
      }
    );


    it(
      "removes stored identities with an invalid createdAt value",
      () => {
        const invalidIdentity =
          createProjectIdentity({
            createdAt:
              "not-a-valid-date",
          });

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            invalidIdentity
          )
        );

        expect(
          loadRuntimeProjectIdentity()
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