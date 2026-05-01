# PR-017: Record Merge & Archive Schema

## 🚀 핵심

기록 삭제 대신  
**“숨김 + 통합” 구조**를 지원하기 위한 DB 스키마를 추가했습니다.

InnerMirror는 판단 흐름을 보존하는 시스템이므로  
기록을 삭제하지 않고 관리할 수 있는 기반을 마련합니다.

---

## 🧱 추가된 컬럼

```sql
alter table public.decision_versions
add column if not exists status text not null default 'active';

alter table public.decision_versions
add column if not exists merged_into uuid references public.decision_versions(id) on delete set null;

alter table public.decision_versions
add column if not exists archived_at timestamptz;

alter table public.decision_versions
add column if not exists merged_at timestamptz;
```

---

## 🧠 상태 구조
```
active   = 기본 표시 기록
archived = 숨김 처리된 기록
merged   = 다른 기록으로 통합된 기록
```

---

## 🔗 컬럼 의미
status
- 기록의 현재 상태
- UI 표시 여부 제어 기준

merged_into
- 이 기록이 어떤 기록으로 통합되었는지 참조
- 원본 흐름 유지

archived_at
- 숨김 처리 시점 기록

merged_at
- 통합 시점 기록

---

## 🎯 설계 의도
```
삭제하지 않는다.
숨기고, 통합하고, 흐름을 보존한다.
```

기존 CRUD 방식이 아니라
Git과 유사한 기록 관리 철학을 따릅니다.


---

## 🧩 향후 확장

이 구조는 아래 기능의 기반이 됩니다:

- 기록 숨김 처리 (archive)
- 기록 통합 (merge)
- multi-select 기록 선택
- merged 기록 출처 추적
- 기록 흐름 시각화

---

## 🔥 한 줄 정의

👉 “삭제 없는 기록 관리를 위한 구조적 기반 PR”