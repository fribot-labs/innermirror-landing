# Runtime Recommendation Integration

## Purpose

`runtime-recommendation-integration`은 Runtime의 여러 Recommendation 분석 결과를 하나의 공식 통합 결과로 조립하는 경계 모듈입니다.

이 모듈은 다음 결과를 연결합니다.

```text
Runtime Next Action
        ↓
Base / Adaptive Recommendation Comparison
        ↓
Adaptive Recommendation Observation Summary
        ↓
Runtime Executive Summary
        ↓
Runtime Recommendation Integration Result
```

각 분석 모듈은 자신의 책임에 집중합니다.

Integration 계층은 이 결과들을 정해진 순서로 실행하고, 최종 Runtime 응답과 Landing Adapter가 사용할 수 있는 하나의 안정적인 계약으로 조립합니다.

---

## Core Principle

이 모듈의 핵심 원칙은 다음과 같습니다.

```text
Runtime이 행동 후보를 결정한다.

Recommendation 계층이 후보를 비교하고 관찰한다.

Integration 계층이 결과를 조립한다.

Adapter 계층이 결과를 전달하고 정규화한다.

Presentation 계층이 사용자에게 필요한 정보만 표시한다.
```

Integration Pipeline은 새로운 `RuntimeNextAction`을 생성하지 않습니다.

`RuntimeNextAction`은 반드시 상위 Runtime 계층에서 전달되어야 합니다.

이 결정은 Recommendation Integration이 Runtime의 행동 결정 권한을 침범하지 않도록 보호합니다.

---

## Responsibilities

이 모듈은 다음 책임을 가집니다.

1. Runtime에서 제공된 `RuntimeNextAction`을 입력으로 받습니다.
2. Base Recommendation과 Adaptive Recommendation을 비교합니다.
3. 누적 관찰 통계로부터 Observation Summary를 생성합니다.
4. Runtime 상태와 Recommendation 상태를 Executive Summary로 압축합니다.
5. 각 단계의 실행 여부와 가용성을 Diagnostics에 기록합니다.
6. 모든 결과를 `RuntimeRecommendationIntegrationResult`로 조립합니다.
7. 동일한 `generatedAt` 값을 전체 Pipeline에 전달합니다.
8. 생성 결과를 방어적으로 복제하여 외부 변조를 방지합니다.

---

## Non-responsibilities

이 모듈은 다음 작업을 수행하지 않습니다.

```text
RuntimeNextAction 생성
Recommendation Candidate 생성
Base Recommendation 선택
Adaptive Recommendation 자체 계산
Observation History 저장
Runtime Memory 관리
HTTP 요청 처리
Landing UI 렌더링
사용자 행동 자동 실행
```

특히 Integration 결과는 Recommendation을 설명하고 관찰하기 위한 데이터입니다.

이 결과가 자동으로 Runtime의 행동을 변경하거나 사용자에게 특정 행동을 강제해서는 안 됩니다.

---

## Runtime Boundary

Runtime 계층은 Integration Pipeline에 다음 정보를 제공합니다.

```text
RuntimeNextAction
Base Winner
Adaptive Resolution
Observation Statistics
Stability Analysis
Drift Analysis
Confidence Analysis
Observation Policy
Executive Summary Policy
generatedAt
```

Integration 계층은 이 입력으로부터 다음 결과를 생성합니다.

```text
Recommendation Comparison
Observation Summary
Executive Summary
Integration Diagnostics
```

---

## Pipeline

Pipeline 실행 순서는 고정되어 있습니다.

```text
1. Recommendation Comparison

2. Observation Summary

3. Runtime Executive Summary

4. Integration Result
```

구조적으로 표현하면 다음과 같습니다.

```text
Runtime Inputs
      │
      ▼
compareBaseAndAdaptiveRuntimeRecommendations()
      │
      ▼
createAdaptiveRecommendationObservationSummary()
      │
      ▼
createRuntimeExecutiveSummary()
      │
      ▼
createRuntimeRecommendationIntegrationResult()
      │
      ▼
RuntimeRecommendationIntegrationResult
```

각 단계는 이전 단계의 결과와 Runtime에서 전달된 원본 분석 결과를 조합합니다.

---

## Observation Summary Projection

Observation Summary는 Recommendation Comparison 객체를 직접 입력으로 사용하지 않습니다.

실제 입력 계약은 다음과 같습니다.

```ts
createAdaptiveRecommendationObservationSummary({
  statistics,
  stability,
  drift,
  confidence,
  policy,
  generatedAt,
});
```

즉, Observation Summary는 누적 관찰 결과를 설명하는 계층입니다.

Recommendation Comparison은 현재 Base Winner와 Adaptive Winner의 차이를 설명하는 별도 계층입니다.

두 결과는 Runtime Executive Summary 단계에서 함께 통합됩니다.

```text
Recommendation Comparison
→ 현재 Recommendation 선택 변화

Observation Summary
→ 누적 Observation 패턴

Executive Summary
→ 현재 상태와 누적 흐름을 함께 압축
```

이 경계를 유지하면 현재 선택과 장기 관찰을 혼동하지 않게 됩니다.

---

## Shared `generatedAt`

Pipeline은 시작 시점에 하나의 `generatedAt`을 확정합니다.

```ts
const generatedAt =
  input.generatedAt ??
  new Date().toISOString();
```

이 값은 다음 모든 단계로 전달됩니다.

```text
Recommendation Comparison Diagnostics
Observation Summary
Runtime Executive Summary Diagnostics
Integration Diagnostics
```

따라서 하나의 Pipeline 실행에서 생성된 결과는 동일한 시간 기준을 공유합니다.

```text
하나의 실행
→ 하나의 generatedAt
→ 모든 하위 결과의 시간 일관성 유지
```

각 하위 함수가 독립적으로 현재 시간을 생성하게 해서는 안 됩니다.

---

## Dependency Injection

Pipeline은 기본 의존성을 제공하지만 테스트와 향후 확장을 위해 의존성 주입을 허용합니다.

```ts
export const
DEFAULT_RUNTIME_RECOMMENDATION_INTEGRATION_DEPENDENCIES = {
  compareRecommendations:
    compareBaseAndAdaptiveRuntimeRecommendations,

  createObservationSummary:
    createAdaptiveRecommendationObservationSummary,

  createExecutiveSummary:
    createRuntimeExecutiveSummary,

  createIntegrationResult:
    createRuntimeRecommendationIntegrationResult,
};
```

호출자는 필요한 경우 일부 또는 전체 의존성을 대체할 수 있습니다.

```ts
runRuntimeRecommendationIntegration(
  input,
  {
    compareRecommendations:
      customComparisonFunction,
  }
);
```

의존성 주입은 다음 테스트를 가능하게 합니다.

```text
실행 순서 검증
각 단계의 호출 횟수 검증
인자 전달 검증
generatedAt 전달 검증
오류 전파 검증
최종 결과 passthrough 검증
```

---

## Error Policy

Pipeline은 하위 단계에서 발생한 오류를 임의로 숨기거나 성공 결과로 변환하지 않습니다.

```text
하위 분석 오류
→ Pipeline 밖으로 그대로 전파
```

Integration 계층은 정상적으로 생성된 부분 결과만 조립합니다.

잘못된 의존성이나 실행 불가능한 구성은 명확한 오류로 거부합니다.

이 정책은 다음 문제를 방지합니다.

```text
분석 실패를 성공으로 오인
부분 결과를 완전한 결과로 오인
Runtime Diagnostics와 실제 실행 상태 불일치
```

복구 가능 여부와 사용자 표시 방식은 상위 Runtime 또는 Adapter 계층이 결정합니다.

---

## Integration Result Contract

최종 결과는 `RuntimeRecommendationIntegrationResult` 계약을 따릅니다.

주요 구조는 다음과 같습니다.

```ts
type RuntimeRecommendationIntegrationResult = {
  runtimeNextAction:
    RuntimeNextAction;

  recommendationComparison:
    RecommendationComparisonResult | null;

  observationSummary:
    AdaptiveRecommendationObservationSummary | null;

  executiveSummaryResult:
    RuntimeExecutiveSummaryResult;

  diagnostics:
    RuntimeRecommendationIntegrationDiagnostics;
};
```

이 결과에는 원본 Runtime 행동, Recommendation 비교, 누적 관찰 요약, Executive Summary 및 Pipeline 실행 상태가 함께 포함됩니다.

---

## Integration Status

Integration Diagnostics는 Pipeline의 최종 상태를 설명합니다.

대표적인 상태는 다음과 같습니다.

```text
complete
partial
insufficient-data
unavailable
```

상태는 Pipeline 실행 여부와 입력 결과의 가용성에 따라 결정됩니다.

### `complete`

필요한 주요 단계가 모두 실행되고 결과가 사용 가능한 상태입니다.

### `partial`

Pipeline은 실행되었지만 일부 분석 결과가 제한되거나 누락된 상태입니다.

### `insufficient-data`

Pipeline은 실행되었으나 충분한 Observation Evidence가 아직 축적되지 않은 상태입니다.

### `unavailable`

핵심 입력 또는 실행 조건이 없어 Integration 결과를 구성할 수 없는 상태입니다.

---

## `null` and `insufficient-data`

`null`과 `insufficient-data`는 서로 다른 의미입니다.

```text
recommendationIntegration: null

→ Recommendation Integration Pipeline이 실행되지 않음
```

반면 다음 상태는 Pipeline이 실행된 것입니다.

```text
recommendationIntegration: {
  diagnostics: {
    status: "insufficient-data"
  }
}

→ Pipeline은 실행됨
→ 하지만 분석에 필요한 증거가 부족함
```

두 상태를 구분해야 Runtime 실행 여부와 분석 증거 부족을 혼동하지 않습니다.

---

## Defensive Cloning

Integration Result 생성기는 전달받은 객체와 배열을 방어적으로 복제합니다.

복제 대상에는 다음과 같은 값이 포함됩니다.

```text
Runtime Next Action
Recommendation Comparison
Observation Summary
Executive Summary Result
Diagnostics
Availability
Completed Stages
Warnings
중첩 Summary 및 Signal 객체
```

따라서 생성된 Integration Result를 수정해도 입력으로 전달된 원본 분석 결과가 변경되지 않아야 합니다.

```ts
const result =
  createRuntimeRecommendationIntegrationResult(
    input
  );

result.diagnostics.warnings.push(
  "external warning"
);

// input diagnostics는 변경되지 않아야 함
```

이 규칙은 Runtime 결과가 여러 계층에서 공유될 때 참조 변조가 확산되는 것을 방지합니다.

---

## Runtime Reflection Result Extension

PR-RI03부터 Landing의 정규화된 Runtime 결과에는 다음 필드가 포함됩니다.

```ts
recommendationIntegration:
  RuntimeRecommendationIntegrationResult | null;
```

전체 Landing 내부 결과 구조는 다음과 같습니다.

```ts
type RuntimeReflectionResult = {
  contractVersion:
    RuntimeContractVersion;

  reflectionId:
    string;

  summary:
    RuntimeSummary;

  pacing:
    RuntimePacing;

  nextQuestion:
    RuntimeNextQuestion;

  continuitySignal:
    RuntimeContinuitySignal;

  recommendationIntegration:
    RuntimeRecommendationIntegrationResult | null;
};
```

이 확장으로 Recommendation Integration 결과가 기존 Reflection 결과와 함께 Landing 내부 상태로 전달될 수 있습니다.

---

## Transport and Normalized Result

Private Runtime 서버에서 전달되는 원시 응답과 Landing 내부에서 사용하는 결과는 서로 다른 타입으로 관리합니다.

### Transport Result

```ts
type RuntimeReflectionTransportResult =
  RuntimeReflectionResultBase & {
    recommendationIntegration?:
      RuntimeRecommendationIntegrationResult | null;
  };
```

Transport 계층에서는 `recommendationIntegration`이 선택적입니다.

이는 아직 새 Integration 필드를 제공하지 않는 이전 Runtime 서버와의 호환성을 유지하기 위한 설계입니다.

### Normalized Result

```ts
type RuntimeReflectionResult =
  RuntimeReflectionResultBase & {
    recommendationIntegration:
      RuntimeRecommendationIntegrationResult | null;
  };
```

Landing 내부에서는 해당 필드가 항상 존재합니다.

```text
Transport
recommendationIntegration?: ...

        ↓ normalize

Landing Internal Result
recommendationIntegration: ...
```

Landing 내부 코드에서는 `undefined` 상태를 별도로 처리할 필요가 없습니다.

---

## Adapter Normalization

다음 모듈이 Transport Result를 Landing 내부 Result로 변환합니다.

```text
src/runtime-adapter/
normalizeRuntimeReflectionResult.ts
```

핵심 동작은 다음과 같습니다.

```text
field missing
→ null

explicit null
→ null 유지

non-null Integration Result
→ 방어적으로 복제하여 전달
```

정규화 흐름은 다음과 같습니다.

```text
Private Runtime JSON
        ↓
RuntimeReflectionTransportResult
        ↓
validateRuntimeReflectionResult()
        ↓
normalizeRuntimeReflectionResult()
        ↓
RuntimeReflectionResult
```

Recommendation Integration 외에도 기존 Continuity Signal 기본값과 과거 Drift 라벨 정규화 동작을 유지합니다.

---

## Backward Compatibility

Private Runtime이 아직 다음 필드를 보내지 않는 경우도 허용됩니다.

```json
{
  "contractVersion": "v1",
  "reflectionId": "reflection-001",
  "summary": {},
  "pacing": {},
  "nextQuestion": {},
  "continuitySignal": {}
}
```

Adapter는 필드 누락을 다음과 같이 정규화합니다.

```ts
recommendationIntegration: null
```

따라서 Recommendation Integration 배포가 Landing과 private Runtime에서 동시에 이루어지지 않아도 기존 Reflection 경로는 계속 동작할 수 있습니다.

---

## Adapter Validation Boundary

Public Runtime Adapter는 Recommendation Integration의 전체 내부 계약을 다시 검증하지 않습니다.

Adapter가 확인하는 최소 경계는 다음과 같습니다.

```text
undefined 허용
null 허용
non-null 값은 object
executiveSummaryResult는 object
diagnostics는 object
```

세부 Integration 계약과 상태 조립 책임은 `runtime-recommendation-integration` 모듈에 있습니다.

이 방식은 동일한 검증 로직이 Integration 계층과 Adapter 계층에 중복되는 것을 방지합니다.

---

## Optimistic Runtime Result

다음 모듈은 private Runtime 응답을 기다리는 동안 임시 결과를 생성합니다.

```text
src/runtime/
createOptimisticReflectionResult.ts
```

Optimistic Result에서는 Recommendation Integration Pipeline이 아직 실행되지 않았습니다.

따라서 항상 다음 값을 사용합니다.

```ts
recommendationIntegration: null
```

의미는 다음과 같습니다.

```text
Reflection 입력 완료
        ↓
Optimistic Result 생성
        ↓
Private Runtime 분석 대기
        ↓
Recommendation Integration 미실행
        ↓
recommendationIntegration: null
```

private Runtime의 실제 응답이 도착하면 이 임시 결과는 정규화된 Runtime 결과로 교체됩니다.

---

## Landing Presentation Boundary

PR-RI04부터 Recommendation Integration 결과는 Landing 내부 상태에 정규화된 뒤, 전용 Presentation Model을 통해 Reflection Runtime 화면에 표시됩니다.

현재 Presentation 흐름은 다음과 같습니다.

```text
RuntimeReflectionResult
        ↓
recommendationIntegration
        ↓
createRuntimeRecommendationPresentation()
        ↓
RuntimeRecommendationPresentation
        ↓
RuntimeRecommendationSummary

and

RuntimeRecommendationDetails
```

UI는 `RuntimeRecommendationIntegrationResult`를 직접 해석하지 않습니다.

대신 다음 Presentation Model을 단일 UI 계약으로 사용합니다.

```ts
RuntimeRecommendationPresentation
```

이 경계는 다음 책임을 분리합니다.

```text
Runtime Integration
→ 분석 결과와 진단 상태를 제공

Runtime Adapter
→ Transport 결과를 검증하고 정규화

Presentation Model
→ Runtime 값을 사용자 표시용 정보로 변환

Presentation Components
→ 변환된 정보를 화면에 렌더링
```

`recommendationIntegration`이 `null`인 경우 Recommendation UI는 렌더링되지 않으며, 기존 Reflection UI는 그대로 유지됩니다.

현재 Recommendation Presentation은 App에서 공유 Runtime Reflection Result로부터 파생됩니다.

Presentation 흐름은 다음과 같습니다.

```text
useRuntimeReflection()

        ↓

RuntimeReflectionResult

        ↓

deriveRuntimeRecommendationPresentation()

        ↓

RuntimeRecommendationPresentation

        ├─ RuntimeReflectionResultView
        ├─ RuntimeNextActionPanel
        └─ RuntimeActionHistoryPanel
```

Presentation은 Runtime Result로부터 매번 새로 계산되며 별도의 mutable state로 저장되지 않습니다.

이 구조는 Recommendation Presentation이 Runtime UI 전체에서 일관된 의미를 유지하도록 합니다.

현재 RuntimeNextActionPanel과 RuntimeActionHistoryPanel은 동일한 Presentation을 전달받을 수 있지만, Recommendation Context를 화면에 표시하는 작업은 다음 단계에서 수행됩니다.

---

## Public API

### Integration Result 생성

```ts
createRuntimeRecommendationIntegrationResult(
  params
)
```

각 하위 분석 결과를 하나의 Integration Result로 조립합니다.

### Integration Pipeline 실행

```ts
runRuntimeRecommendationIntegration(
  input,
  dependencies?
)
```

전체 Pipeline을 정해진 순서로 실행합니다.

### Runtime Reflection 정규화

```ts
normalizeRuntimeReflectionResult(
  transportResult
)
```

Transport Result를 Landing 내부 Runtime Result로 변환합니다.

---

## Module Structure

```text
src/
├─ runtime-recommendation-integration/
│  ├─ README.md
│  ├─ runtimeRecommendationIntegrationTypes.ts
│  ├─ runtimeRecommendationIntegrationPipelineTypes.ts
│  ├─ createRuntimeRecommendationIntegrationResult.ts
│  ├─ runRuntimeRecommendationIntegration.ts
│  └─ __tests__/
│     ├─ createRuntimeRecommendationIntegrationResult.test.ts
│     └─ runRuntimeRecommendationIntegration.test.ts
│
├─ runtime-recommendation-evolution/
│  ├─ createRuntimeExecutiveSummary.ts
│  └─ __tests__/
│     └─ createRuntimeExecutiveSummary.test.ts
│
├─ runtime-adapter/
│  ├─ runtimeAdapterTypes.ts
│  ├─ runtimeAdapterErrors.ts
│  ├─ publicRuntimeAdapter.ts
│  ├─ normalizeRuntimeReflectionResult.ts
│  └─ __tests__/
│     └─ normalizeRuntimeReflectionResult.test.ts
│
├─ runtime/
│  └─ createOptimisticReflectionResult.ts
│
└─ components/
  ├─ runtimeRecommendationPresentation.ts
  ├─ deriveRuntimeRecommendationPresentation.ts
  ├─ RuntimeRecommendationSummary.tsx
  ├─ RuntimeRecommendationDetails.tsx
  ├─ ReflectionRuntimePanel.tsx
  └─ __tests__/
    ├─ runtimeRecommendationPresentation.test.ts
    └─ deriveRuntimeRecommendationPresentation.test.ts
```

---

## Validation

### Recommendation Integration Contract

```bash
npx vitest run \
  src/runtime-recommendation-integration/__tests__/createRuntimeRecommendationIntegrationResult.test.ts
```

Expected:

```text
20 tests passed
```

### Recommendation Integration Pipeline

```bash
npx vitest run \
  src/runtime-recommendation-integration/__tests__/runRuntimeRecommendationIntegration.test.ts
```

Expected:

```text
17 tests passed
```

### Runtime Executive Summary

```bash
npx vitest run \
  src/runtime-recommendation-evolution/__tests__/createRuntimeExecutiveSummary.test.ts
```

Expected:

```text
22 tests passed
```

### Runtime Adapter Normalization

```bash
npx vitest run \
  src/runtime-adapter/__tests__/normalizeRuntimeReflectionResult.test.ts
```

Expected:

```text
13 tests passed
```

### Runtime Recommendation Presentation

```bash
npx vitest run \
  src/components/__tests__/runtimeRecommendationPresentation.test.ts
```

Expected:

```text
18 tests passed
```

### Full Test Suite

```bash
npm test
```

Current expected result:

```text
### Shared Recommendation Presentation

```bash
npx vitest run \
  src/components/__tests__/deriveRuntimeRecommendationPresentation.test.ts
```

Expected:

```text
5 tests passed
```

---

### Full Test Suite

```bash
npm test
```

Expected:

```text
Test Files  6 passed

Tests       95 passed
```
```

### Production Build

```bash
npm run build
```

Current expected result:

```text
Build completed successfully
```

---

## Current Completion State

현재 구현 상태는 다음과 같습니다.

```text
Runtime Executive Summary
22 tests passed

Runtime Recommendation Integration Contract
20 tests passed

Runtime Recommendation Integration Pipeline
17 tests passed

Runtime Adapter Normalization
13 tests passed

Runtime Recommendation Presentation
18 tests passed

Shared Recommendation Presentation
5 tests passed

Total
95 tests passed

Production Build
passed
```

이 상태에서 Recommendation Integration 결과는 다음 전체 흐름을 통과할 수 있습니다.

```text
생성
→ 조립
→ 검증
→ Transport 전달
→ Adapter 정규화
→ Presentation 변환
→ Reflection Runtime 렌더링
```

Recommendation Integration의 Contract, Pipeline, Adapter, Presentation 경계가 각각 독립적으로 검증된 상태입니다.

---

## Architecture Summary

전체 연결 구조는 다음과 같습니다.

```text
Private Runtime
      │
      ├─ RuntimeNextAction
      ├─ Base Recommendation
      ├─ Adaptive Recommendation
      ├─ Observation Statistics
      ├─ Stability
      ├─ Drift
      └─ Confidence
      │
      ▼
Runtime Recommendation Integration Pipeline
      │
      ├─ Recommendation Comparison
      ├─ Observation Summary
      ├─ Executive Summary
      └─ Integration Diagnostics
      │
      ▼
RuntimeRecommendationIntegrationResult
      │
      ▼
RuntimeReflectionTransportResult
      │
      ▼
Public Runtime Adapter
      │
      ├─ Transport validation
      └─ Result normalization
      │
      ▼
RuntimeReflectionResult
      │
      ▼
App Shared Runtime State
      │
      ▼
deriveRuntimeRecommendationPresentation()
      │
      ▼
RuntimeRecommendationPresentation
      │
      ├─ RuntimeReflectionResultView
      │     ├─ RuntimeRecommendationSummary
      │     └─ RuntimeRecommendationDetails
      │
      ├─ RuntimeNextActionPanel
      │
      └─ RuntimeActionHistoryPanel
      │
      ▼
Runtime UI
```

Recommendation Integration 결과는 Runtime 계약 그대로 렌더링되지 않습니다.

Presentation Model이 Runtime 데이터를 사용자 표시용 구조로 변환하고, Presentation Components가 이를 화면에 표시합니다.

현재 Recommendation Presentation은 Reflection Runtime 화면에 연결되어 있습니다.

다만 `RuntimeNextActionPanel`과는 아직 shared application state를 사용하지 않으므로 직접 연결되어 있지 않습니다.

---

## Runtime Recommendation Presentation

PR-RI04 introduces a dedicated Presentation Layer for Recommendation Integration.

The Runtime Recommendation Integration Result is intentionally not rendered directly.

Instead, it is transformed into a Presentation Model.

```text
RuntimeRecommendationIntegrationResult
        ↓
RuntimeRecommendationPresentation
        ↓
Summary Component

and

Details Component
```

This separation provides several benefits.

```text
Runtime contracts remain stable.

Presentation wording can evolve independently.

UI components no longer depend on Runtime enums.

Presentation testing becomes independent from Runtime logic.
```

The Presentation Model becomes the only UI-facing interpretation of Recommendation Integration.

PR-RI05 further separates Presentation creation from Presentation consumption.

The Presentation Model is now derived once from the shared Runtime Reflection Result and reused across multiple Runtime UI surfaces.

This prevents duplicated Presentation logic while ensuring consistent Recommendation interpretation throughout the Runtime experience.

---

## Reflection Runtime Integration

The Reflection Runtime screen now creates a Recommendation Presentation whenever Recommendation Integration is available.

Current flow:

```text
Private Runtime

↓

Runtime Recommendation Integration

↓

Runtime Adapter

↓

Runtime Reflection Result

↓

Recommendation Presentation

↓

Reflection Runtime Screen
```

Recommendation Presentation is rendered only when:

`recommendationIntegration`

is available.

When Recommendation Integration is absent:

`recommendationIntegration: null`

the Reflection screen continues using the existing Reflection UI without placeholders.

---

## Presentation Boundary

The Recommendation Presentation Layer intentionally stops at the Reflection Runtime screen.

Current Runtime architecture consists of two independent Runtime flows.

```text
Reflection Runtime

↓

RuntimeReflectionResult

↓

Recommendation Integration

↓

Presentation
```

and

```text
Runtime Next Action

↓

RuntimeNextAction
```

These Runtime paths currently do not share application-level state.

As a result:

```text
Recommendation Summary

Recommendation Details
```

are currently rendered only inside the Reflection Runtime experience.

Sharing Recommendation Presentation with Runtime Next Action requires introducing shared Runtime state.

This responsibility intentionally belongs to a future architectural step.

Keeping Presentation separate from state ownership prevents coupling between UI rendering and Runtime orchestration.

---

## Next Step

The next architectural milestone is Recommendation Context Presentation.

Planned direction:

```text
Runtime Recommendation Presentation

↓

Recommendation Context

↓

RuntimeNextActionPanel

↓

RuntimeActionHistoryPanel

↓

Shared Recommendation UX
```

Future work will expose Recommendation change explanation, Confidence, Stability, Drift, and Next Focus directly inside Runtime navigation surfaces while continuing to use the shared Presentation Model introduced in PR-RI05.