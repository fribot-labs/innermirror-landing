export type PublicReflectionInput = {
  content: string;
  createdAt: string;
};

export type PublicReflectionResult = {
  summary: string;
  publicGuidance: string;
};

export async function analyzeReflectionPublicly(
  input: PublicReflectionInput
): Promise<PublicReflectionResult> {
  return {
    summary: "Your reflection has been captured.",
    publicGuidance:
      "This public adapter is a placeholder. Private cognitive orchestration remains outside this repository.",
  };
}