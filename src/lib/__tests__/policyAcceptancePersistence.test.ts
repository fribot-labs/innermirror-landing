import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    acceptCurrentPrivacyPolicy,
    createPolicyAcceptance,
    CURRENT_PRIVACY_POLICY,
    hasAcceptedCurrentPrivacyPolicy,
    hasPolicyAcceptance,
    listPolicyAcceptances,
} from "../policyAcceptancePersistence";



const getUserMock =
  vi.fn();

const fromMock =
  vi.fn();


vi.mock(
  "../supabaseClient",
  () => ({
    supabaseClient: {
      auth: {
        getUser:
          (...args: unknown[]) =>
            getUserMock(
              ...args
            ),
      },

      from:
        (...args: unknown[]) =>
          fromMock(
            ...args
          ),
    },
  })
);


type MockQueryResult = {
  data:
    unknown;

  error:
    unknown;
};


function createAuthenticatedUserResult() {
  return {
    data: {
      user: {
        id:
          "user-123",
      },
    },

    error:
      null,
  };
}


function createPolicyAcceptanceRow() {
  return {
    id:
      "acceptance-1",

    user_id:
      "user-123",

    policy_type:
      "privacy",

    policy_version:
      "2026-08-v1",

    accepted_at:
      "2026-08-13T00:00:00.000Z",

    created_at:
      "2026-08-13T00:00:01.000Z",
  };
}


function createListQuery(
  result:
    MockQueryResult
) {
  const orderMock =
    vi.fn()
      .mockResolvedValue(
        result
      );

  const eqUserMock =
    vi.fn()
      .mockReturnValue({
        order:
          orderMock,
      });

  const selectMock =
    vi.fn()
      .mockReturnValue({
        eq:
          eqUserMock,
      });

  return {
    query: {
      select:
        selectMock,
    },

    selectMock,
    eqUserMock,
    orderMock,
  };
}


function createHasAcceptanceQuery(
  result:
    MockQueryResult
) {
  const maybeSingleMock =
    vi.fn()
      .mockResolvedValue(
        result
      );

  const eqPolicyVersionMock =
    vi.fn()
      .mockReturnValue({
        maybeSingle:
          maybeSingleMock,
      });

  const eqPolicyTypeMock =
    vi.fn()
      .mockReturnValue({
        eq:
          eqPolicyVersionMock,
      });

  const eqUserMock =
    vi.fn()
      .mockReturnValue({
        eq:
          eqPolicyTypeMock,
      });

  const selectMock =
    vi.fn()
      .mockReturnValue({
        eq:
          eqUserMock,
      });

  return {
    query: {
      select:
        selectMock,
    },

    selectMock,
    eqUserMock,
    eqPolicyTypeMock,
    eqPolicyVersionMock,
    maybeSingleMock,
  };
}


function createInsertQuery(
  result:
    MockQueryResult
) {
  const singleMock =
    vi.fn()
      .mockResolvedValue(
        result
      );

  const selectAfterInsertMock =
    vi.fn()
      .mockReturnValue({
        single:
          singleMock,
      });

  const insertMock =
    vi.fn()
      .mockReturnValue({
        select:
          selectAfterInsertMock,
      });

  return {
    query: {
      insert:
        insertMock,
    },

    insertMock,
    selectAfterInsertMock,
    singleMock,
  };
}


describe(
  "policyAcceptancePersistence",
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();

        getUserMock
          .mockResolvedValue(
            createAuthenticatedUserResult()
          );
      }
    );


    it(
      "uses the expected current privacy policy",
      () => {
        expect(
          CURRENT_PRIVACY_POLICY
        ).toEqual({
          type:
            "privacy",

          version:
            "2026-08-v1",
        });
      }
    );


    it(
      "loads Policy Acceptances for the authenticated user",
      async () => {
        const row =
          createPolicyAcceptanceRow();

        const {
          query,
          selectMock,
          eqUserMock,
          orderMock,
        } =
          createListQuery({
            data: [
              row,
            ],

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        const result =
          await listPolicyAcceptances();

        expect(
          fromMock
        ).toHaveBeenCalledWith(
          "policy_acceptances"
        );

        expect(
          selectMock
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          eqUserMock
        ).toHaveBeenCalledWith(
          "user_id",
          "user-123"
        );

        expect(
          orderMock
        ).toHaveBeenCalledWith(
          "accepted_at",
          {
            ascending:
              false,
          }
        );

        expect(
          result
        ).toEqual([
          {
            id:
              "acceptance-1",

            userId:
              "user-123",

            policyType:
              "privacy",

            policyVersion:
              "2026-08-v1",

            acceptedAt:
              "2026-08-13T00:00:00.000Z",

            createdAt:
              "2026-08-13T00:00:01.000Z",
          },
        ]);
      }
    );


    it(
      "returns an empty Policy Acceptance list",
      async () => {
        const {
          query,
        } =
          createListQuery({
            data:
              [],

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        const result =
          await listPolicyAcceptances();

        expect(
          result
        ).toEqual(
          []
        );
      }
    );


    it(
      "normalizes a null Policy Acceptance list to an empty array",
      async () => {
        const {
          query,
        } =
          createListQuery({
            data:
              null,

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        const result =
          await listPolicyAcceptances();

        expect(
          result
        ).toEqual(
          []
        );
      }
    );


    it(
      "propagates Policy Acceptance list errors",
      async () => {
        const databaseError =
          new Error(
            "list failed"
          );

        const {
          query,
        } =
          createListQuery({
            data:
              null,

            error:
              databaseError,
          });

        fromMock
          .mockReturnValue(
            query
          );

        await expect(
          listPolicyAcceptances()
        ).rejects.toBe(
          databaseError
        );
      }
    );


    it(
      "returns true when the requested Policy Acceptance exists",
      async () => {
        const {
          query,
          selectMock,
          eqUserMock,
          eqPolicyTypeMock,
          eqPolicyVersionMock,
          maybeSingleMock,
        } =
          createHasAcceptanceQuery({
            data: {
              id:
                "acceptance-1",
            },

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        const result =
          await hasPolicyAcceptance({
            policyType:
              "privacy",

            policyVersion:
              "2026-08-v1",
          });

        expect(
          selectMock
        ).toHaveBeenCalledWith(
          "id"
        );

        expect(
          eqUserMock
        ).toHaveBeenCalledWith(
          "user_id",
          "user-123"
        );

        expect(
          eqPolicyTypeMock
        ).toHaveBeenCalledWith(
          "policy_type",
          "privacy"
        );

        expect(
          eqPolicyVersionMock
        ).toHaveBeenCalledWith(
          "policy_version",
          "2026-08-v1"
        );

        expect(
          maybeSingleMock
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          result
        ).toBe(
          true
        );
      }
    );


    it(
      "returns false when the requested Policy Acceptance does not exist",
      async () => {
        const {
          query,
        } =
          createHasAcceptanceQuery({
            data:
              null,

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        const result =
          await hasPolicyAcceptance({
            policyType:
              "privacy",

            policyVersion:
              "2026-08-v1",
          });

        expect(
          result
        ).toBe(
          false
        );
      }
    );


    it(
      "trims the Policy version before checking acceptance",
      async () => {
        const {
          query,
          eqPolicyVersionMock,
        } =
          createHasAcceptanceQuery({
            data:
              null,

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        await hasPolicyAcceptance({
          policyType:
            "privacy",

          policyVersion:
            " 2026-08-v1 ",
        });

        expect(
          eqPolicyVersionMock
        ).toHaveBeenCalledWith(
          "policy_version",
          "2026-08-v1"
        );
      }
    );


    it(
      "rejects an empty Policy version before checking acceptance",
      async () => {
        await expect(
          hasPolicyAcceptance({
            policyType:
              "privacy",

            policyVersion:
              "   ",
          })
        ).rejects.toThrow(
          "A policy version is required to check Policy Acceptance."
        );

        expect(
          fromMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates Policy Acceptance lookup errors",
      async () => {
        const databaseError =
          new Error(
            "lookup failed"
          );

        const {
          query,
        } =
          createHasAcceptanceQuery({
            data:
              null,

            error:
              databaseError,
          });

        fromMock
          .mockReturnValue(
            query
          );

        await expect(
          hasPolicyAcceptance({
            policyType:
              "privacy",

            policyVersion:
              "2026-08-v1",
          })
        ).rejects.toBe(
          databaseError
        );
      }
    );


    it(
      "checks the current privacy policy",
      async () => {
        const {
          query,
          eqPolicyTypeMock,
          eqPolicyVersionMock,
        } =
          createHasAcceptanceQuery({
            data: {
              id:
                "acceptance-1",
            },

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        const result =
          await hasAcceptedCurrentPrivacyPolicy();

        expect(
          eqPolicyTypeMock
        ).toHaveBeenCalledWith(
          "policy_type",
          CURRENT_PRIVACY_POLICY.type
        );

        expect(
          eqPolicyVersionMock
        ).toHaveBeenCalledWith(
          "policy_version",
          CURRENT_PRIVACY_POLICY.version
        );

        expect(
          result
        ).toBe(
          true
        );
      }
    );


    it(
      "creates Policy Acceptance for the authenticated user",
      async () => {
        const row =
          createPolicyAcceptanceRow();

        const {
          query,
          insertMock,
          selectAfterInsertMock,
          singleMock,
        } =
          createInsertQuery({
            data:
              row,

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        const result =
          await createPolicyAcceptance({
            policyType:
              "privacy",

            policyVersion:
              "2026-08-v1",
          });

        expect(
          fromMock
        ).toHaveBeenCalledWith(
          "policy_acceptances"
        );

        expect(
          insertMock
        ).toHaveBeenCalledWith({
          user_id:
            "user-123",

          policy_type:
            "privacy",

          policy_version:
            "2026-08-v1",
        });

        expect(
          selectAfterInsertMock
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          singleMock
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          result
        ).toEqual({
          id:
            "acceptance-1",

          userId:
            "user-123",

          policyType:
            "privacy",

          policyVersion:
            "2026-08-v1",

          acceptedAt:
            "2026-08-13T00:00:00.000Z",

          createdAt:
            "2026-08-13T00:00:01.000Z",
        });
      }
    );


    it(
      "trims the Policy version before creating acceptance",
      async () => {
        const {
          query,
          insertMock,
        } =
          createInsertQuery({
            data:
              createPolicyAcceptanceRow(),

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        await createPolicyAcceptance({
          policyType:
            "privacy",

          policyVersion:
            " 2026-08-v1 ",
        });

        expect(
          insertMock
        ).toHaveBeenCalledWith({
          user_id:
            "user-123",

          policy_type:
            "privacy",

          policy_version:
            "2026-08-v1",
        });
      }
    );


    it(
      "persists an explicit acceptedAt timestamp",
      async () => {
        const {
          query,
          insertMock,
        } =
          createInsertQuery({
            data:
              createPolicyAcceptanceRow(),

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        await createPolicyAcceptance({
          policyType:
            "privacy",

          policyVersion:
            "2026-08-v1",

          acceptedAt:
            "2026-08-13T09:00:00+09:00",
        });

        expect(
          insertMock
        ).toHaveBeenCalledWith({
          user_id:
            "user-123",

          policy_type:
            "privacy",

          policy_version:
            "2026-08-v1",

          accepted_at:
            "2026-08-13T00:00:00.000Z",
        });
      }
    );


    it(
      "rejects an invalid acceptedAt timestamp",
      async () => {
        await expect(
          createPolicyAcceptance({
            policyType:
              "privacy",

            policyVersion:
              "2026-08-v1",

            acceptedAt:
              "invalid-date",
          })
        ).rejects.toThrow(
          "Policy Acceptance requires a valid acceptedAt value."
        );

        expect(
          fromMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "rejects an empty Policy version before creating acceptance",
      async () => {
        await expect(
          createPolicyAcceptance({
            policyType:
              "privacy",

            policyVersion:
              "   ",
          })
        ).rejects.toThrow(
          "A policy version is required to create Policy Acceptance."
        );

        expect(
          fromMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates Policy Acceptance insert errors",
      async () => {
        const databaseError =
          new Error(
            "insert failed"
          );

        const {
          query,
        } =
          createInsertQuery({
            data:
              null,

            error:
              databaseError,
          });

        fromMock
          .mockReturnValue(
            query
          );

        await expect(
          createPolicyAcceptance({
            policyType:
              "privacy",

            policyVersion:
              "2026-08-v1",
          })
        ).rejects.toBe(
          databaseError
        );
      }
    );


    it(
      "creates the current privacy Policy Acceptance",
      async () => {
        const {
          query,
          insertMock,
        } =
          createInsertQuery({
            data:
              createPolicyAcceptanceRow(),

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        await acceptCurrentPrivacyPolicy();

        expect(
          insertMock
        ).toHaveBeenCalledWith({
          user_id:
            "user-123",

          policy_type:
            CURRENT_PRIVACY_POLICY.type,

          policy_version:
            CURRENT_PRIVACY_POLICY.version,
        });
      }
    );


    it(
      "rejects Policy Acceptance access for an unauthenticated user",
      async () => {
        getUserMock
          .mockResolvedValue({
            data: {
              user:
                null,
            },

            error:
              null,
          });

        await expect(
          listPolicyAcceptances()
        ).rejects.toThrow(
          "An authenticated user is required to access Policy Acceptances."
        );

        expect(
          fromMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "rejects Policy Acceptance creation for an unauthenticated user",
      async () => {
        getUserMock
          .mockResolvedValue({
            data: {
              user:
                null,
            },

            error:
              null,
          });

        await expect(
          createPolicyAcceptance({
            policyType:
              "privacy",

            policyVersion:
              "2026-08-v1",
          })
        ).rejects.toThrow(
          "An authenticated user is required to access Policy Acceptances."
        );

        expect(
          fromMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates authentication errors while reading Policy Acceptances",
      async () => {
        const authError =
          new Error(
            "auth failed"
          );

        getUserMock
          .mockResolvedValue({
            data: {
              user:
                null,
            },

            error:
              authError,
          });

        await expect(
          listPolicyAcceptances()
        ).rejects.toBe(
          authError
        );

        expect(
          fromMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates authentication errors while creating Policy Acceptance",
      async () => {
        const authError =
          new Error(
            "auth failed"
          );

        getUserMock
          .mockResolvedValue({
            data: {
              user:
                null,
            },

            error:
              authError,
          });

        await expect(
          createPolicyAcceptance({
            policyType:
              "privacy",

            policyVersion:
              "2026-08-v1",
          })
        ).rejects.toBe(
          authError
        );

        expect(
          fromMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "always resolves the authenticated user before reading Policy Acceptances",
      async () => {
        const {
          query,
        } =
          createListQuery({
            data:
              [],

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        await listPolicyAcceptances();

        expect(
          getUserMock
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );


    it(
      "always resolves the authenticated user before checking Policy Acceptance",
      async () => {
        const {
          query,
        } =
          createHasAcceptanceQuery({
            data:
              null,

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        await hasPolicyAcceptance({
          policyType:
            "privacy",

          policyVersion:
            "2026-08-v1",
        });

        expect(
          getUserMock
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );


    it(
      "always resolves the authenticated user before creating Policy Acceptance",
      async () => {
        const {
          query,
        } =
          createInsertQuery({
            data:
              createPolicyAcceptanceRow(),

            error:
              null,
          });

        fromMock
          .mockReturnValue(
            query
          );

        await createPolicyAcceptance({
          policyType:
            "privacy",

          policyVersion:
            "2026-08-v1",
        });

        expect(
          getUserMock
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );
  }
);