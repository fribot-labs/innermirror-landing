import type {
    RuntimeBoundaryHealthResult,
} from "../../runtime-adapter/runtimeBoundaryTypes";

type Props = {
  health: RuntimeBoundaryHealthResult | null;
  isChecking: boolean;
  onRefresh: () => void;
};

export function RuntimeBoundaryStatusBanner({
  health,
  isChecking,
  onRefresh,
}: Props) {
  if (isChecking && health === null) {
    return (
      <section className="runtime-boundary-banner runtime-boundary-banner-checking">
        <strong>
          Runtime 상태를 확인하고 있습니다.
        </strong>
        <p>
          InnerMirror private runtime과 연결 상태를 점검 중입니다.
        </p>
      </section>
    );
  }

  if (health === null) {
    return null;
  }

  if (health.status === "healthy") {
    return (
      <section className="runtime-boundary-banner runtime-boundary-banner-healthy">
        <strong>
          Runtime 연결이 정상입니다.
        </strong>
        <p>
          빠른 분석, memory timeline, deep merge 기능을 사용할 수 있습니다.
        </p>
      </section>
    );
  }

  if (health.status === "degraded") {
    return (
      <section className="runtime-boundary-banner runtime-boundary-banner-degraded">
        <strong>
          깊은 분석이 지연될 수 있습니다.
        </strong>
        <p>
          기본 reflection은 가능하지만 memory merge 또는 deep queue가 지연될 수 있습니다.
        </p>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isChecking}
        >
          {isChecking ? "확인 중..." : "다시 확인"}
        </button>
      </section>
    );
  }

  return (
    <section className="runtime-boundary-banner runtime-boundary-banner-unavailable">
      <strong>
        Runtime 연결을 사용할 수 없습니다.
      </strong>
      <p>
        지금은 로컬 기록 중심으로 사용할 수 있습니다. Runtime이 복구되면 깊은 분석을 다시 연결할 수 있습니다.
      </p>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isChecking}
      >
        {isChecking ? "확인 중..." : "다시 연결"}
      </button>
    </section>
  );
}