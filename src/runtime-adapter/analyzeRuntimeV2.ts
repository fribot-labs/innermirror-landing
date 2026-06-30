import type {
    RuntimeContractV2Input,
    RuntimeContractV2Response,
} from "../types/runtimeContractV2";

/**
 * Runtime API Base URL
 *
 * Local development:
 *
 * http://localhost:4000
 *
 * Production can override this value using:
 *
 * VITE_RUNTIME_API_BASE_URL
 */
const RUNTIME_API_BASE_URL =
  import.meta.env.VITE_RUNTIME_API_BASE_URL ??
  "http://localhost:4000";

/**
 * Runtime V2 Analyze
 *
 * Landing communicates with the private Runtime
 * exclusively through Runtime Contract V2.
 */
export async function analyzeRuntimeV2(
  payload: RuntimeContractV2Input
): Promise<RuntimeContractV2Response> {
  const response = await fetch(
    `${RUNTIME_API_BASE_URL}/runtime/v2/analyze`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Runtime request failed (${response.status})`
    );
  }

  const result =
    (await response.json()) as RuntimeContractV2Response;

  if (!result.ok) {
    throw new Error(
      "Runtime returned an unsuccessful response."
    );
  }

  return result;
}