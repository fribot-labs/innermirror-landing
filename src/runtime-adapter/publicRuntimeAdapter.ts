import type {
  LandingReflectionInput,
  RuntimeApiResponse,
  RuntimeReflectionResult,
} from "./runtimeAdapterTypes";

const RUNTIME_BASE_URL =
  import.meta.env.VITE_INNERMIRROR_RUNTIME_URL ??
  "http://localhost:4000";

export async function submitReflectionToRuntime(
  content: string
): Promise<RuntimeApiResponse<RuntimeReflectionResult>> {
  const input: LandingReflectionInput = {
    content,
    createdAt: new Date().toISOString(),
    source: "landing",
  };

  const response = await fetch(
    `${RUNTIME_BASE_URL}/runtime/reflection`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  const data =
    (await response.json()) as RuntimeApiResponse<RuntimeReflectionResult>;

  if (!response.ok) {
    return data;
  }

  return data;
}