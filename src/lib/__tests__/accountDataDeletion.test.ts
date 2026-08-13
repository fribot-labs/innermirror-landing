import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import {
    deleteMyInnerMirrorData,
} from "../accountDataDeletion";


const getUserMock =
  vi.fn();

const rpcMock =
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

      rpc:
        (...args: unknown[]) =>
          rpcMock(
            ...args
          ),
    },
  })
);


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


describe(
  "accountDataDeletion",
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();

        getUserMock
          .mockResolvedValue(
            createAuthenticatedUserResult()
          );

        rpcMock
          .mockResolvedValue({
            data:
              null,

            error:
              null,
          });
      }
    );


    it(
      "deletes InnerMirror data for an authenticated user",
      async () => {
        await expect(
          deleteMyInnerMirrorData()
        ).resolves.toBeUndefined();

        expect(
          getUserMock
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          rpcMock
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          rpcMock
        ).toHaveBeenCalledWith(
          "delete_my_inner_mirror_data"
        );
      }
    );


    it(
      "checks authentication before calling the deletion RPC",
      async () => {
        await deleteMyInnerMirrorData();

        const getUserInvocationOrder =
          getUserMock.mock
            .invocationCallOrder[0];

        const rpcInvocationOrder =
          rpcMock.mock
            .invocationCallOrder[0];

        expect(
          getUserInvocationOrder
        ).toBeDefined();

        expect(
          rpcInvocationOrder
        ).toBeDefined();

        expect(
          getUserInvocationOrder
        ).toBeLessThan(
          rpcInvocationOrder as number
        );
      }
    );


    it(
      "does not pass a user id to the deletion RPC",
      async () => {
        await deleteMyInnerMirrorData();

        expect(
          rpcMock
        ).toHaveBeenCalledWith(
          "delete_my_inner_mirror_data"
        );

        expect(
          rpcMock.mock.calls[0]
        ).toHaveLength(
          1
        );
      }
    );


    it(
      "rejects deletion for an unauthenticated user",
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
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "An authenticated user is required to delete InnerMirror data."
        );

        expect(
          rpcMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates authentication errors",
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
          deleteMyInnerMirrorData()
        ).rejects.toBe(
          authError
        );

        expect(
          rpcMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates deletion RPC errors",
      async () => {
        const rpcError =
          new Error(
            "deletion failed"
          );

        rpcMock
          .mockResolvedValue({
            data:
              null,

            error:
              rpcError,
          });

        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toBe(
          rpcError
        );

        expect(
          getUserMock
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          rpcMock
        ).toHaveBeenCalledWith(
          "delete_my_inner_mirror_data"
        );
      }
    );


    it(
      "does not call the deletion RPC when authentication lookup fails",
      async () => {
        const authError =
          new Error(
            "unable to resolve user"
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
          deleteMyInnerMirrorData()
        ).rejects.toBe(
          authError
        );

        expect(
          rpcMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "does not expose ownership selection through function arguments",
      () => {
        expect(
          deleteMyInnerMirrorData.length
        ).toBe(
          0
        );
      }
    );
  }
);