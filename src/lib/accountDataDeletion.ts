import {
  supabaseClient,
} from "./supabaseClient";


/**
 * Runtime API Base URL
 *
 * Local development:
 *
 *   http://localhost:4000
 *
 * Production can override this value using:
 *
 *   VITE_RUNTIME_API_URL
 */
const RUNTIME_API_BASE_URL =
  import.meta.env.VITE_RUNTIME_API_URL ??
  "http://localhost:4000";


/**
 * Stable Runtime account-deletion success response.
 *
 * Private Product Observation identity is intentionally not exposed.
 */
type RuntimeAccountDeletionSuccessResponse = {
  ok:
    true;

  data: {
    contractVersion:
      "v1";

    productObservationDeleted:
      boolean;

    canonicalDataDeleted:
      true;

    deletedAt:
      string;
  };
};


/**
 * Stable Runtime account-deletion error response.
 */
type RuntimeAccountDeletionErrorResponse = {
  ok:
    false;

  error: {
    code:
      string;

    message:
      string;
  };
};


type RuntimeAccountDeletionResponse =
  | RuntimeAccountDeletionSuccessResponse
  | RuntimeAccountDeletionErrorResponse;


/**
 * Deletes the currently authenticated learner's InnerMirror data.
 *
 * PO-10F — Subject-linked Deletion Integration
 *
 * The browser does not select deletion ownership using:
 *
 * - userId
 * - subjectRef
 * - GitHub identity
 *
 * Instead:
 *
 *   Supabase session
 *        ↓
 *   learner access token
 *        ↓
 *   private Runtime
 *        ↓
 *   Runtime verifies account identity
 *        ↓
 *   Product Observation deletion
 *        ↓
 *   canonical InnerMirror deletion
 *
 * The authenticated Supabase account itself remains preserved.
 */
export async function deleteMyInnerMirrorData():
Promise<void> {
  const {
    data: {
      session,
    },
    error:
      sessionError,
  } =
    await supabaseClient.auth.getSession();


  if (
    sessionError
  ) {
    throw sessionError;
  }


  if (
    session ===
      null
  ) {
    throw new Error(
      "An authenticated user is required to delete InnerMirror data."
    );
  }


  const accessToken =
    session.access_token?.trim();


  if (
    typeof accessToken !==
      "string" ||
    accessToken.length ===
      0
  ) {
    throw new Error(
      "An authenticated user is required to delete InnerMirror data."
    );
  }


  let response:
    Response;


  try {
    response =
      await fetch(
        `${RUNTIME_API_BASE_URL}/runtime/account/data/delete`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${accessToken}`,
          },

          body:
            JSON.stringify(
              {}
            ),
        }
      );
  } catch {
    throw new Error(
      "Unable to reach the private Runtime deletion service."
    );
  }


  let result:
    RuntimeAccountDeletionResponse;


  try {
    result =
      (await response.json()) as
        RuntimeAccountDeletionResponse;
  } catch {
    throw new Error(
      "The private Runtime returned an invalid deletion response."
    );
  }


  if (
    !response.ok
  ) {
    if (
      result.ok ===
        false &&
      typeof result.error.message ===
        "string" &&
      result.error.message.trim().length >
        0
    ) {
      throw new Error(
        result.error.message
      );
    }


    throw new Error(
      `Unable to delete InnerMirror data (${response.status}).`
    );
  }


  if (
    result.ok ===
      false
  ) {
    throw new Error(
      result.error.message.trim().length >
        0
        ? result.error.message
        : "Unable to delete InnerMirror data."
    );
  }


  if (
    result.data.contractVersion !==
      "v1" ||
    result.data.canonicalDataDeleted !==
      true ||
    typeof result.data.productObservationDeleted !==
      "boolean" ||
    typeof result.data.deletedAt !==
      "string" ||
    result.data.deletedAt.trim().length ===
      0
  ) {
    throw new Error(
      "The private Runtime returned an invalid deletion response."
    );
  }
}
