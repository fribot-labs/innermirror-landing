import type {
    RuntimeUxModeResult,
} from "../../runtime-adapter/runtimeUxModeTypes";

type Props = {
  uxMode: RuntimeUxModeResult;
};

export function RuntimeFallbackModeNotice({
  uxMode,
}: Props) {
  if (uxMode.mode === "full-runtime") {
    return null;
  }

  return (
    <section
      className={[
        "runtime-fallback-notice",
        `runtime-fallback-notice-${uxMode.mode}`,
      ].join(" ")}
    >
      <strong>
        {createFallbackTitle(uxMode)}
      </strong>

      <p>
        {uxMode.message}
      </p>
    </section>
  );
}

function createFallbackTitle(
  uxMode: RuntimeUxModeResult
): string {
  if (uxMode.reason === "runtime-checking") {
    return "Runtime 상태를 확인 중입니다.";
  }

  if (uxMode.mode === "partial-runtime") {
    return "일부 runtime 기능이 제한됩니다.";
  }

  return "로컬 기록 모드입니다.";
}