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


const getSessionMock =
  vi.fn();

const fetchMock =
  vi.fn();


vi.mock(
  "../supabaseClient",
  () => ({
    supabaseClient: {
      auth: {
        getSession:
          (...args: unknown[]) =>
            getSessionMock(
              ...args
            ),
      },
    },
  })
);


function createAuthenticatedSessionResult(
  accessToken:
    string = "access-token-123"
) {
  return {
    data: {
      session: {
        access_token:
          accessToken,
      },
    },

    error:
      null,
  };
}


function createSuccessRuntimeResponse() {
  return {
    ok:
      true,

    data: {
      contractVersion:
        "v1",

      productObservationDeleted:
        true,

      canonicalDataDeleted:
        true,

      deletedAt:
        "2026-08-22T12:00:00.000Z",
    },
  };
}


function createFetchResponse(
  options: {
    ok:
      boolean;

    status:
      number;

    json:
      unknown;
  }
): Response {
  return {
    ok:
      options.ok,

    status:
      options.status,

    json:
      vi.fn().mockResolvedValue(
        options.json
      ),
  } as unknown as Response;
}


describe(
  "accountDataDeletion",
  () => {
    beforeEach(
      () => {
        vi.clearAllMocks();


        getSessionMock
          .mockResolvedValue(
            createAuthenticatedSessionResult()
          );


        fetchMock
          .mockResolvedValue(
            createFetchResponse({
              ok:
                true,

              status:
                200,

              json:
                createSuccessRuntimeResponse(),
            })
          );


        vi.stubGlobal(
          "fetch",
          fetchMock
        );
      }
    );


    it(
      "deletes InnerMirror data through the private Runtime",
      async () => {
        await expect(
          deleteMyInnerMirrorData()
        ).resolves.toBeUndefined();


        expect(
          getSessionMock
        ).toHaveBeenCalledTimes(
          1
        );


        expect(
          fetchMock
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );


    it(
      "checks the Supabase session before calling the Runtime deletion endpoint",
      async () => {
        await deleteMyInnerMirrorData();


        const sessionInvocationOrder =
          getSessionMock.mock
            .invocationCallOrder[0];


        const fetchInvocationOrder =
          fetchMock.mock
            .invocationCallOrder[0];


        expect(
          sessionInvocationOrder
        ).toBeDefined();


        expect(
          fetchInvocationOrder
        ).toBeDefined();


        expect(
          sessionInvocationOrder
        ).toBeLessThan(
          fetchInvocationOrder as number
        );
      }
    );


    it(
      "calls the Runtime account deletion endpoint with POST",
      async () => {
        await deleteMyInnerMirrorData();


        expect(
          fetchMock
        ).toHaveBeenCalledWith(
          expect.stringContaining(
            "/runtime/account/data/delete"
          ),
          expect.objectContaining({
            method:
              "POST",
          })
        );
      }
    );


    it(
      "uses VITE_RUNTIME_API_URL-compatible Runtime endpoint construction",
      async () => {
        await deleteMyInnerMirrorData();


        const url =
          fetchMock.mock.calls[0]?.[0];


        expect(
          typeof url
        ).toBe(
          "string"
        );


        expect(
          url
        ).toContain(
          "/runtime/account/data/delete"
        );
      }
    );


    it(
      "sends the Supabase learner access token as a Bearer Authorization header",
      async () => {
        await deleteMyInnerMirrorData();


        const requestOptions =
          fetchMock.mock.calls[0]?.[1] as
            RequestInit;


        expect(
          requestOptions.headers
        ).toEqual(
          expect.objectContaining({
            Authorization:
              "Bearer access-token-123",
          })
        );
      }
    );


    it(
      "sends JSON content type to the Runtime deletion endpoint",
      async () => {
        await deleteMyInnerMirrorData();


        const requestOptions =
          fetchMock.mock.calls[0]?.[1] as
            RequestInit;


        expect(
          requestOptions.headers
        ).toEqual(
          expect.objectContaining({
            "Content-Type":
              "application/json",
          })
        );
      }
    );


    it(
      "sends an empty request body and does not select deletion ownership in the browser",
      async () => {
        await deleteMyInnerMirrorData();


        const requestOptions =
          fetchMock.mock.calls[0]?.[1] as
            RequestInit;


        expect(
          requestOptions.body
        ).toBe(
          JSON.stringify(
            {}
          )
        );


        const parsedBody =
          JSON.parse(
            requestOptions.body as string
          ) as Record<
            string,
            unknown
          >;


        expect(
          parsedBody
        ).toEqual(
          {}
        );


        expect(
          "userId" in parsedBody
        ).toBe(
          false
        );


        expect(
          "subjectRef" in parsedBody
        ).toBe(
          false
        );
      }
    );


    it(
      "does not call the old browser-side deletion RPC",
      async () => {
        await deleteMyInnerMirrorData();


        expect(
          fetchMock
        ).toHaveBeenCalledTimes(
          1
        );


        expect(
          getSessionMock
        ).toHaveBeenCalledTimes(
          1
        );
      }
    );


    it(
      "rejects deletion when no authenticated Supabase session exists",
      async () => {
        getSessionMock
          .mockResolvedValue({
            data: {
              session:
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
          fetchMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "propagates Supabase session lookup errors",
      async () => {
        const sessionError =
          new Error(
            "session lookup failed"
          );


        getSessionMock
          .mockResolvedValue({
            data: {
              session:
                null,
            },

            error:
              sessionError,
          });


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toBe(
          sessionError
        );


        expect(
          fetchMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "rejects a session with an empty access token before calling Runtime",
      async () => {
        getSessionMock
          .mockResolvedValue(
            createAuthenticatedSessionResult(
              "   "
            )
          );


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "An authenticated user is required to delete InnerMirror data."
        );


        expect(
          fetchMock
        ).not.toHaveBeenCalled();
      }
    );


    it(
      "trims the Supabase access token before sending it to Runtime",
      async () => {
        getSessionMock
          .mockResolvedValue(
            createAuthenticatedSessionResult(
              "  access-token-123  "
            )
          );


        await deleteMyInnerMirrorData();


        const requestOptions =
          fetchMock.mock.calls[0]?.[1] as
            RequestInit;


        expect(
          requestOptions.headers
        ).toEqual(
          expect.objectContaining({
            Authorization:
              "Bearer access-token-123",
          })
        );
      }
    );


    it(
      "maps Runtime network failures to a controlled Landing error",
      async () => {
        fetchMock
          .mockRejectedValue(
            new Error(
              "network details"
            )
          );


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "Unable to reach the private Runtime deletion service."
        );
      }
    );


    it(
      "does not expose raw network failure details",
      async () => {
        const rawMessage =
          "sensitive network details";


        fetchMock
          .mockRejectedValue(
            new Error(
              rawMessage
            )
          );


        try {
          await deleteMyInnerMirrorData();


          throw new Error(
            "Expected deletion request to fail."
          );
        } catch (error) {
          expect(
            error
          ).toBeInstanceOf(
            Error
          );


          expect(
            (error as Error).message
          ).not.toContain(
            rawMessage
          );
        }
      }
    );


    it(
      "propagates the stable Runtime error message for a failed HTTP response",
      async () => {
        fetchMock
          .mockResolvedValue(
            createFetchResponse({
              ok:
                false,

              status:
                503,

              json: {
                ok:
                  false,

                error: {
                  code:
                    "INNERMIRROR_ACCOUNT_DELETION_PRODUCT_OBSERVATION_FAILED",

                  message:
                    "Unable to delete Product Observation data.",
                },
              },
            })
          );


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "Unable to delete Product Observation data."
        );
      }
    );


    it(
      "uses a generic HTTP failure when Runtime returns no usable error message",
      async () => {
        fetchMock
          .mockResolvedValue(
            createFetchResponse({
              ok:
                false,

              status:
                503,

              json: {
                ok:
                  false,

                error: {
                  code:
                    "INNERMIRROR_ACCOUNT_DELETION_FAILED",

                  message:
                    "   ",
                },
              },
            })
          );


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "Unable to delete InnerMirror data (503)."
        );
      }
    );


    it(
      "rejects an invalid JSON response from Runtime",
      async () => {
        const response = {
          ok:
            true,

          status:
            200,

          json:
            vi.fn().mockRejectedValue(
              new Error(
                "invalid json"
              )
            ),
        } as unknown as Response;


        fetchMock
          .mockResolvedValue(
            response
          );


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "The private Runtime returned an invalid deletion response."
        );
      }
    );


    it(
      "rejects an ok false payload even when HTTP status is successful",
      async () => {
        fetchMock
          .mockResolvedValue(
            createFetchResponse({
              ok:
                true,

              status:
                200,

              json: {
                ok:
                  false,

                error: {
                  code:
                    "INNERMIRROR_ACCOUNT_DELETION_FAILED",

                  message:
                    "Unable to delete InnerMirror data.",
                },
              },
            })
          );


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "Unable to delete InnerMirror data."
        );
      }
    );


    it(
      "rejects a success payload with the wrong contract version",
      async () => {
        fetchMock
          .mockResolvedValue(
            createFetchResponse({
              ok:
                true,

              status:
                200,

              json: {
                ok:
                  true,

                data: {
                  contractVersion:
                    "v2",

                  productObservationDeleted:
                    true,

                  canonicalDataDeleted:
                    true,

                  deletedAt:
                    "2026-08-22T12:00:00.000Z",
                },
              },
            })
          );


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "The private Runtime returned an invalid deletion response."
        );
      }
    );


    it(
      "rejects a success payload without confirmed canonical deletion",
      async () => {
        fetchMock
          .mockResolvedValue(
            createFetchResponse({
              ok:
                true,

              status:
                200,

              json: {
                ok:
                  true,

                data: {
                  contractVersion:
                    "v1",

                  productObservationDeleted:
                    true,

                  canonicalDataDeleted:
                    false,

                  deletedAt:
                    "2026-08-22T12:00:00.000Z",
                },
              },
            })
          );


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "The private Runtime returned an invalid deletion response."
        );
      }
    );


    it(
      "rejects a success payload with an invalid Product Observation deletion flag",
      async () => {
        fetchMock
          .mockResolvedValue(
            createFetchResponse({
              ok:
                true,

              status:
                200,

              json: {
                ok:
                  true,

                data: {
                  contractVersion:
                    "v1",

                  productObservationDeleted:
                    "yes",

                  canonicalDataDeleted:
                    true,

                  deletedAt:
                    "2026-08-22T12:00:00.000Z",
                },
              },
            })
          );


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "The private Runtime returned an invalid deletion response."
        );
      }
    );


    it(
      "rejects a success payload with an empty deletedAt value",
      async () => {
        fetchMock
          .mockResolvedValue(
            createFetchResponse({
              ok:
                true,

              status:
                200,

              json: {
                ok:
                  true,

                data: {
                  contractVersion:
                    "v1",

                  productObservationDeleted:
                    false,

                  canonicalDataDeleted:
                    true,

                  deletedAt:
                    "   ",
                },
              },
            })
          );


        await expect(
          deleteMyInnerMirrorData()
        ).rejects.toThrow(
          "The private Runtime returned an invalid deletion response."
        );
      }
    );


    it(
      "accepts success when no Product Observation subject needed deletion",
      async () => {
        fetchMock
          .mockResolvedValue(
            createFetchResponse({
              ok:
                true,

              status:
                200,

              json: {
                ok:
                  true,

                data: {
                  contractVersion:
                    "v1",

                  productObservationDeleted:
                    false,

                  canonicalDataDeleted:
                    true,

                  deletedAt:
                    "2026-08-22T12:00:00.000Z",
                },
              },
            })
          );


        await expect(
          deleteMyInnerMirrorData()
        ).resolves.toBeUndefined();
      }
    );


    it(
      "accepts success when Product Observation and canonical data were both deleted",
      async () => {
        fetchMock
          .mockResolvedValue(
            createFetchResponse({
              ok:
                true,

              status:
                200,

              json:
                createSuccessRuntimeResponse(),
            })
          );


        await expect(
          deleteMyInnerMirrorData()
        ).resolves.toBeUndefined();
      }
    );


    it(
      "does not expose deletion ownership through function arguments",
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
