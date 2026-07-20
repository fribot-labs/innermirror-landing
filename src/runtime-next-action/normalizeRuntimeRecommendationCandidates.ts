import type {
    RuntimeRecommendationCandidate,
} from "./runtimeRecommendationCandidateTypes";

export type NormalizedRuntimeRecommendationGroup = {
  key: string;
  primary: RuntimeRecommendationCandidate;
  supporting: RuntimeRecommendationCandidate[];
};

export function normalizeRuntimeRecommendationCandidates(
  candidates: RuntimeRecommendationCandidate[]
): NormalizedRuntimeRecommendationGroup[] {
  const groups = new Map<
    string,
    RuntimeRecommendationCandidate[]
  >();

  for (const candidate of candidates) {
    const key = [
      candidate.category,
      candidate.kind,
      candidate.target ?? "none",
    ].join(":");

    const currentGroup =
      groups.get(key) ?? [];

    currentGroup.push(candidate);
    groups.set(key, currentGroup);
  }

  return Array.from(groups.entries()).map(
    ([key, groupedCandidates]) => {
      const sortedCandidates =
        [...groupedCandidates].sort(
          (left, right) =>
            right.basePriority -
            left.basePriority
        );

      const [primary, ...supporting] =
        sortedCandidates;

      return {
        key,
        primary,
        supporting,
      };
    }
  );
}