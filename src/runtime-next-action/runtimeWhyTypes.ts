export type RuntimeWhyPriority =
  | "blocking"
  | "recommended"
  | "supporting"
  | "fallback";

export type RuntimeWhyExplanation = {
  /**
   * 사용자에게 가장 먼저 보여주는 한 문장 설명입니다.
   */
  summary: string;

  /**
   * 현재 프로젝트 상태와 추천 행동 사이의 관계입니다.
   */
  context: string;

  /**
   * 왜 이 행동이 지금 우선되는지 설명합니다.
   */
  priorityReason: string;

  /**
   * 이 행동을 수행했을 때 Runtime이 기대하는 변화입니다.
   */
  expectedOutcome: string;

  /**
   * 추천 우선순위의 성격입니다.
   */
  priority: RuntimeWhyPriority;
};