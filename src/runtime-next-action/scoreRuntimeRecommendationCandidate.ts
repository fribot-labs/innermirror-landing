import type {
    RuntimeRecommendationCandidate,
    ScoredRuntimeRecommendationCandidate,
} from "./runtimeRecommendationCandidateTypes";

export function scoreRuntimeRecommendationCandidate(
  candidate: RuntimeRecommendationCandidate
): ScoredRuntimeRecommendationCandidate {
  let score =
    candidate.basePriority;

  const scoreReasons: string[] = [
    `Base priority: ${candidate.basePriority}`,
  ];

  if (candidate.isBlocking) {
    score += 300;
    scoreReasons.push(
      "Blocking project state: +300"
    );
  }

  if (candidate.isActionable) {
    score += 100;
    scoreReasons.push(
      "Immediately actionable: +100"
    );
  }

  switch (candidate.confidence) {
    case "high":
      score += 60;
      scoreReasons.push(
        "High confidence: +60"
      );
      break;

    case "medium":
      score += 30;
      scoreReasons.push(
        "Medium confidence: +30"
      );
      break;

    case "low":
      scoreReasons.push(
        "Low confidence: +0"
      );
      break;
  }

  switch (candidate.specificity) {
    case "high":
      score += 40;
      scoreReasons.push(
        "High specificity: +40"
      );
      break;

    case "medium":
      score += 20;
      scoreReasons.push(
        "Medium specificity: +20"
      );
      break;

    case "low":
      scoreReasons.push(
        "Low specificity: +0"
      );
      break;
  }

  if (candidate.category === "fallback") {
    score -= 200;
    scoreReasons.push(
      "Fallback penalty: -200"
    );
  }

  return {
    candidate,
    score,
    scoreReasons,
  };
}