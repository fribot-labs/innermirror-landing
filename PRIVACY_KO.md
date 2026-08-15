# InnerMirror 개인정보 처리방침

주식회사 프라이봇(이하 "회사")은 InnerMirror 서비스(이하 "서비스")를 제공하면서 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련 법령에 따라 개인정보를 보호하기 위해 노력합니다.

본 개인정보 처리방침은 현재 제공되는 InnerMirror MVP 서비스의 개인정보 처리 기준을 설명합니다.

---

## 1. 개인정보처리자

**서비스 제공자:** 주식회사 프라이봇  
**주소:** 경북 경주시 강동면 동해대로 166-11, 7층  
**이메일:** [mail@fribot.com](mailto:mail@fribot.com)  
**개인정보 보호책임자:** 정욱진

개인정보 처리와 관련한 문의, 열람, 정정, 삭제, 처리정지 등의 요청은 위 이메일을 통해 할 수 있습니다.

---

## 2. 서비스의 성격

InnerMirror는 이용자가 자신의 프로젝트, 학습 과정 및 생각의 변화를 기록하고 이해할 수 있도록 돕는 온라인 Reflection 및 Project Continuity 서비스입니다.

현재 MVP에서는 GitHub 계정을 이용하여 로그인하고, 이용자가 선택한 GitHub 저장소와 InnerMirror 프로젝트를 연결할 수 있습니다.

GitHub 저장소의 소유권은 이용자에게 있으며 InnerMirror는 이용자의 GitHub 저장소를 소유하지 않습니다.

현재 MVP는 이용자의 GitHub 활동을 지속적으로 모니터링하지 않습니다. 프로젝트 분석은 이용자가 명시적으로 분석 기능을 실행한 경우에 수행됩니다.

---

## 3. 서비스 이용 연령

현재 InnerMirror MVP는 만 14세 이상의 이용자를 대상으로 하며, 만 14세 미만 이용자의 이용을 허용하지 않는 것을 원칙으로 합니다.

---

## 4. 처리하는 개인정보

회사는 현재 MVP 서비스 제공을 위해 필요한 범위에서 다음 정보를 처리할 수 있습니다.

### 4.1 회원 인증 정보

GitHub OAuth 및 Supabase Authentication을 통해 다음 정보가 처리될 수 있습니다.

- Supabase Auth 사용자 식별자
- GitHub Provider ID
- GitHub 사용자 이름
- GitHub 이메일 주소(인증 과정에서 제공되는 경우)
- OAuth 인증 및 세션 관련 정보
- 서비스 세션 및 인증 상태 유지를 위한 식별정보

회사는 현재 MVP에서 이용자를 식별하기 위한 목적으로 GitHub 비밀번호를 요청하거나 저장하지 않습니다.

GitHub 이메일 주소는 OAuth 과정에서 처리될 수 있으나, 현재 MVP에서는 이를 영구적인 InnerMirror 사용자 식별자로 사용하는 것을 목적으로 하지 않습니다.

GitHub OAuth 인증정보는 이용자 인증 외에도 이용자가 명시적으로 요청한 GitHub 저장소 확인 및 프로젝트 분석을 위해 필요한 범위에서 사용될 수 있습니다.

### 4.2 프로젝트 정보

이용자가 GitHub 저장소를 InnerMirror 프로젝트와 연결하는 경우 다음 정보가 처리될 수 있습니다.

- 프로젝트 식별자
- 프로젝트 이름
- GitHub Repository ID
- Repository Owner
- Repository Name
- 프로젝트 상태
- 프로젝트 시작 시각
- 현재 프로젝트 Focus
- Fribot Learning Template 또는 Course 관련 식별정보가 있는 경우 해당 정보

### 4.3 Reflection 및 프로젝트 기록

이용자가 직접 입력하거나 프로젝트를 진행하면서 생성되는 다음 정보가 저장될 수 있습니다.

- Reflection 내용
- Reflection 작성 시각
- Current Focus
- Project Event
- 프로젝트 진행 및 연속성을 이해하기 위해 필요한 기록

Reflection은 이용자가 자유롭게 입력하는 정보입니다. 서비스는 민감정보 입력을 요구하지 않으며, 서비스 이용에 필요하지 않은 민감하거나 지나치게 개인적인 정보는 Reflection에 입력하지 않는 것을 권장합니다.

### 4.4 GitHub 프로젝트 분석 정보

이용자가 GitHub 프로젝트 분석을 명시적으로 요청하는 경우 다음 정보가 일시적으로 조회 또는 처리될 수 있습니다.

- Repository metadata
- Default Branch
- 최근 Commit 정보
- 최근 Pull Request 정보
- 프로젝트 분석에 필요한 최소한의 GitHub 정보

현재 MVP는 GitHub 저장소 전체 또는 전체 Git history를 InnerMirror 데이터베이스에 복제하여 보관하는 것을 목적으로 하지 않습니다.

### 4.5 서비스 이용 및 운영 과정에서 생성되는 정보

서비스 이용 과정에서 다음과 같은 기술정보가 자동으로 생성·처리될 수 있습니다.

- IP 주소
- 접속 시각 및 HTTP 요청 관련 정보
- 브라우저, 기기 및 접속환경 관련 정보
- 오류, 보안 및 서비스 운영 로그
- 인증 또는 Runtime 연결을 위한 브라우저 저장소(localStorage 등)의 세션 관련 정보

회사는 현재 MVP에서 광고 또는 행동기반 마케팅을 위한 별도 분석 도구를 운영하지 않습니다. Web Analytics Plus, Speed Insights 및 Observability Plus는 현재 Vercel production에서 사용하지 않습니다.

---

## 5. 개인정보의 처리 목적

회사는 개인정보를 다음 목적을 위해 처리합니다.

- 이용자 인증
- InnerMirror 프로젝트 생성 및 유지
- Reflection 저장 및 조회
- 프로젝트 진행 상태와 Current Focus 유지
- 프로젝트 및 학습 과정의 연속성 제공
- 이용자가 요청한 GitHub 프로젝트 분석
- 이용자가 요청한 Runtime 분석
- 개인정보 처리방침 동의 기록 관리
- 이용자가 요청한 InnerMirror 데이터 삭제
- 서비스 보안, 오류 대응 및 정상적인 서비스 운영

개인정보는 위 목적과 무관한 목적으로 이용하지 않는 것을 원칙으로 합니다.

---

## 6. GitHub와의 관계

GitHub는 InnerMirror와 독립적인 외부 서비스입니다.

InnerMirror와 GitHub를 연결하더라도 GitHub 저장소의 소유권은 이용자에게 그대로 유지됩니다.

InnerMirror는 현재 MVP에서 이용자의 GitHub 저장소, Commit, Pull Request 또는 GitHub 계정을 삭제하지 않습니다.

InnerMirror 데이터 삭제 기능을 실행하더라도 GitHub에 존재하는 이용자의 원본 데이터에는 영향을 주지 않습니다.

GitHub 서비스 자체의 개인정보 처리는 GitHub의 정책에 따릅니다.

---

## 7. 개인정보의 보유 및 이용기간

회사는 서비스 제공 목적에 필요한 범위에서 개인정보를 보유하며, 목적이 달성되거나 이용자가 삭제를 요청하는 경우 관련 법령과 서비스 구조에 따라 삭제합니다.

| 구분 | 보유 기준 |
| --- | --- |
| Projects, Reflections, Project Events | 서비스 이용 중 또는 이용자가 Delete InnerMirror Data 기능을 실행할 때까지 |
| Policy Acceptance records | 서비스 이용 중 또는 Delete InnerMirror Data 기능을 실행할 때까지 |
| Supabase Auth 사용자 및 InnerMirror Profile | 로그인 계정 유지 기간. 계정 삭제 요청이 있는 경우 관련 법령상 보존이 필요한 정보를 제외하고 삭제 절차를 진행 |
| GitHub 원본 데이터 | InnerMirror가 보유기간을 정하지 않으며 GitHub의 정책에 따름 |
| Google Cloud 일반 workload 로그 | 현재 production `_Default` 로그 버킷 기준 30일 |
| Google Cloud 필수 감사계열 로그 | 현재 production `_Required` 로그 버킷 기준 400일 |
| Supabase production 백업 | 현재 Pro 정책에 따라 일일 백업, 7일 보관 |

백업, 보안로그 또는 법령상 보존이 필요한 정보는 서비스 데이터베이스에서 삭제된 이후에도 해당 보존기간 동안 제한적으로 남을 수 있으며, 보존 목적이 종료되면 공급자의 정책 및 관련 법령에 따라 삭제됩니다.

현재 MVP에서는 3년 미사용에 따른 자동 삭제 기능이 구현되어 있지 않습니다. 장기 미사용 이용자에 대한 자동 보유기간 및 자동 삭제 정책은 향후 서비스 운영 및 관련 법령을 검토하여 별도로 적용할 수 있습니다.

---

## 8. InnerMirror 데이터 삭제

이용자는 서비스에서 제공하는 **Delete InnerMirror Data** 기능을 통해 자신의 InnerMirror 서비스 데이터를 삭제할 수 있습니다.

현재 MVP에서 해당 기능을 실행하면 다음 데이터가 삭제됩니다.

- Projects
- Reflections
- Project Events
- Policy Acceptance records

현재 MVP의 **Delete InnerMirror Data** 기능은 InnerMirror 서비스 데이터 삭제 기능이며 로그인 계정 자체를 삭제하는 기능은 아닙니다.

따라서 다음 정보는 현재 MVP의 데이터 삭제 기능 실행 후에도 유지될 수 있습니다.

- Supabase Auth 사용자
- InnerMirror Profile
- GitHub 계정 자체

InnerMirror 데이터 삭제는 이용자의 GitHub 저장소, Commit, Pull Request, Branch 또는 GitHub 계정을 삭제하지 않습니다.

로그인 계정 자체의 삭제가 필요한 경우 회사에 문의할 수 있습니다.

---

## 9. 개인정보의 파기 절차 및 방법

회사는 개인정보의 보유기간이 경과하거나 처리 목적이 달성되어 개인정보가 더 이상 필요하지 않게 된 경우 관련 법령에 따라 해당 개인정보를 지체 없이 파기합니다.

### 파기 절차

개인정보의 보유 필요성이 종료된 경우 회사는 해당 정보가 계속 보관되어야 하는 법적 또는 서비스상 근거가 있는지 확인한 후 파기합니다.

다른 법령에 따라 일정 기간 보존해야 하는 정보가 있는 경우 해당 정보는 필요한 범위에서 별도로 관리할 수 있습니다.

### 파기 방법

전자적 파일 또는 데이터베이스 형태로 저장된 개인정보는 복구 또는 재생이 어렵도록 삭제하는 방법으로 파기합니다.

종이 문서가 존재하는 경우에는 분쇄 또는 이에 준하는 방법으로 파기합니다.

현재 MVP의 서비스 내 **Delete InnerMirror Data** 기능을 통해 삭제되는 데이터의 범위는 본 처리방침의 「InnerMirror 데이터 삭제」 항목에 따릅니다.

---

## 10. 개인정보 처리방침 동의 기록

회사는 이용자에게 적용된 개인정보 처리방침을 확인하기 위해 다음 정보를 저장할 수 있습니다.

- 정책 종류
- 정책 버전
- 동의 시각

이 기록은 이용자가 어떤 버전의 개인정보 처리방침에 동의했는지 확인하기 위한 목적으로 사용됩니다.

InnerMirror 데이터 삭제 기능을 실행하면 현재 MVP에서는 해당 Policy Acceptance 기록도 함께 삭제됩니다. 이후 서비스를 계속 이용하려면 현재 개인정보 처리방침에 다시 동의해야 할 수 있습니다.

---

## 11. 개인정보의 제3자 제공

회사는 이용자의 개인정보를 판매하지 않습니다.

현재 MVP에서는 이용자의 개인정보를 독립적인 제3자의 고유한 목적을 위해 제공하는 별도의 기능을 운영하지 않습니다.

서비스 제공을 위해 이용하는 클라우드, 인증, 저장 및 호스팅 사업자와의 개인정보 처리 관계는 제3자 제공과 구별하여 개인정보 처리업무의 위탁, 국외 처리 또는 각 외부 서비스의 법적 지위에 따라 관리합니다.

법령에 근거하거나 이용자의 별도 동의 등 적법한 근거가 있는 경우에는 필요한 범위에서 개인정보를 제3자에게 제공할 수 있으며, 해당되는 경우 관련 법령에 따라 필요한 사항을 안내합니다.

---

## 12. 서비스 제공을 위해 이용하는 외부 서비스

현재 InnerMirror MVP는 다음 외부 서비스를 이용합니다.

### Supabase

- **사업자:** Supabase Pte. Ltd.
- **주요 용도:** 사용자 인증, InnerMirror 서비스 데이터 저장, 사용자별 데이터 접근 통제
- **Production:** Fribot Production / Pro
- **Production database region:** `ap-northeast-2` / Northeast Asia (Seoul)
- **Production backup:** 일일 백업, 7일 보관 정책

### Google Cloud

- **주요 용도:** InnerMirror production Runtime 운영, 이용자가 요청한 프로젝트 및 Reflection 분석 처리, production build 및 서버측 운영
- **Cloud Run Runtime:** `asia-northeast3` / Seoul, Republic of Korea
- **Cloud Build / build source storage / Artifact Registry:** 서울 리전
- **Cloud Logging:** 일부 로그 버킷은 `global`
- **Secret Manager:** 일부 secret은 automatic replication 정책 사용

### Vercel

- **사업자:** Vercel Inc.
- **주요 용도:** InnerMirror 웹 Landing 및 프론트엔드 서비스 제공
- **Production plan:** Pro
- **Web Analytics Plus:** 사용하지 않음
- **Speed Insights:** 사용하지 않음
- **Observability Plus:** 사용하지 않음
- **외부 Log Drain:** 현재 설정하지 않음

### GitHub

- **사업자:** GitHub, Inc.
- **주요 용도:** GitHub OAuth 인증, 이용자가 선택한 GitHub 저장소 확인, 이용자가 명시적으로 요청한 프로젝트 분석에 필요한 GitHub 정보 조회
- 현재 MVP는 `repo` scope를 요청하지 않으며 public repository 중심으로 동작합니다.

GitHub는 InnerMirror와 독립적인 외부 서비스이며 GitHub 서비스 자체의 개인정보 처리는 GitHub의 정책에 따릅니다.

---

## 13. 개인정보 처리업무의 위탁 및 외부 인프라 이용

회사는 서비스 제공을 위해 개인정보 처리업무의 일부를 외부 사업자에게 위탁하거나 외부 인프라를 이용합니다.

현재 production 서비스의 주요 수탁 또는 인프라 사업자는 다음과 같습니다.

| 수탁자 또는 인프라 사업자 | 위탁 또는 이용 업무 |
| --- | --- |
| Supabase Pte. Ltd. | 사용자 인증, 데이터베이스 저장, 백업 및 데이터 접근 통제 |
| Google Cloud | production Runtime, 서버측 분석 처리, build·artifact·logging·secret 관리 등 cloud infrastructure 제공 |
| Vercel Inc. | 웹 애플리케이션 호스팅, 전송, 보안 및 기본 운영 관측 기능 제공 |

GitHub는 이용자가 보유한 GitHub 계정과 저장소를 기반으로 인증 및 API 기능을 제공하는 독립 외부 서비스로서, 위 표의 단순 처리위탁 관계와 구별하여 관리합니다.

회사는 개인정보 처리업무를 위탁하는 경우 관련 법령에 따라 위탁 목적 외 처리 금지, 안전성 확보조치, 재위탁 관리 등 필요한 사항을 계약 또는 이에 준하는 방법으로 관리합니다.

### 13.1 재수탁자(하위처리자) 확인

위 수탁자들이 서비스 운영을 위해 다시 개인정보 처리업무의 일부를 맡기는 경우가 있을 수 있습니다. 재수탁자 수가 많거나 수시로 변경되는 cloud/SaaS 특성을 고려하여 회사는 적용 가능한 계약과 각 수탁자의 공식 하위처리자 목록을 통해 재수탁 현황을 관리합니다. 이용자는 다음 공식 자료에서 최신 목록을 확인할 수 있습니다.

- **Supabase:** Supabase DPA Schedule 3의 Subprocessors 목록
- **Google Cloud:** https://cloud.google.com/terms/subprocessors
- **Vercel:** https://vercel.com/legal/dpa 의 Subprocessors 항목

회사는 실제 InnerMirror production 데이터 흐름과 관련성이 있는 재수탁 구조를 정기적으로 확인하고, 중요한 변경이 있는 경우 본 개인정보 처리방침의 변경 필요성을 검토합니다.

수탁자, 재수탁자, 위탁 업무 또는 외부 처리 구조가 변경되는 경우 관련 법령에 따라 필요한 사항을 본 개인정보 처리방침 또는 쉽게 확인할 수 있는 연결된 공개자료에 반영합니다.

---

## 14. Runtime 및 외부 AI/LLM 처리

InnerMirror는 이용자가 요청한 프로젝트 및 Reflection 분석을 처리하기 위해 별도의 Runtime을 사용합니다.

현재 MVP의 production Runtime은 다음 환경에서 운영됩니다.

```text
Google Cloud Run
asia-northeast3
Seoul, Republic of Korea
```

Runtime은 이용자가 명시적으로 요청한 분석 작업을 처리합니다. 예를 들어 다음 기능 실행 시 Runtime이 이용될 수 있습니다.

- Analyze GitHub Project
- Reflection Only
- Reflection + GitHub

현재 MVP에서 이용자의 프로젝트 및 Reflection에 관한 영속적인 주요 기록은 Supabase 프로덕션 데이터베이스에 저장됩니다.

현재 production Runtime은 로컬 JSONL 파일을 이용자의 영속적인 기존 Reflection 저장소로 사용하지 않습니다.

현재 MVP에서는 이용자의 Reflection이나 GitHub 프로젝트 정보를 분석하기 위해 외부 생성형 AI 또는 외부 LLM 서비스로 전송하지 않습니다.

향후 외부 AI 또는 LLM 서비스를 사용하거나 개인정보 처리 구조가 변경되는 경우 관련 법령을 검토하고 필요한 안내, 동의 또는 기타 절차를 적용합니다.

---

## 15. 개인정보의 안전성 확보

회사는 개인정보 보호를 위해 현재 서비스 구조에서 다음과 같은 보호조치를 적용합니다.

- Supabase Authentication을 통한 사용자 인증
- 사용자별 데이터 소유권 구분
- Row Level Security(RLS)를 이용한 데이터 접근 통제
- 인증된 사용자 기준의 데이터 접근
- production Runtime의 내부 및 진단용 endpoint 접근 제한
- production Runtime secret의 서버 측 관리
- 필요한 범위로 제한된 GitHub 정보 조회
- GitHub `repo` scope 미요청 및 public repository 중심 MVP 운영
- 이용자가 명시적으로 요청한 경우에만 프로젝트 분석 수행
- GitHub 전체 저장소의 불필요한 영구 복제 제한
- production Runtime에서 local file-backed learner persistence 비활성화
- Runtime GitHub session ID를 URL query가 아닌 전용 request header로 전달
- GitHub organization membership 응답 전체를 production log에 기록하지 않도록 제한
- Google Cloud Logging의 별도 custom external sink 미사용
- Vercel production의 Web Analytics Plus, Speed Insights, Observability Plus 및 외부 Log Drain 미사용

서비스 구조가 변경되는 경우 필요한 보안조치를 함께 검토합니다.

---

## 16. 이용자의 권리

이용자는 자신의 개인정보와 관련하여 관련 법령에서 정하는 범위에서 다음과 같은 권리를 행사할 수 있습니다.

- 개인정보 처리 여부 확인
- 개인정보 열람 요청
- 개인정보 정정 요청
- 개인정보 삭제 요청
- 개인정보 처리정지 요청
- 동의 철회

서비스에서 직접 제공되지 않는 개인정보 관련 요청은 아래 이메일을 통해 문의할 수 있습니다.

**[mail@fribot.com](mailto:mail@fribot.com)**

회사는 관련 법령에 따라 요청 내용을 확인하고 필요한 조치를 수행합니다.

---

## 17. 개인정보의 국외 이전 및 처리

InnerMirror의 canonical learner database와 주요 production Runtime workload는 대한민국 서울 리전에 구성되어 있습니다. 다만 서비스 제공 과정에서 GitHub, Vercel 및 일부 Google Cloud 관리서비스를 통해 개인정보 또는 접속·기술정보가 국외에서 조회·보관·처리될 수 있습니다.

회사는 서비스 이용계약의 체결 및 이행을 위해 필요한 처리위탁·보관에 해당하는 국외 이전에 대해서는 「개인정보 보호법」 제28조의8에 따라 본 처리방침에 관련 사항을 공개하고 관리합니다.

### 17.1 Vercel Inc.

- **이전되는 개인정보 항목:** IP 주소, 접속 시각, HTTP 요청 관련 정보, 브라우저·기기·접속환경 관련 정보, 서비스 전송 및 보안 과정에서 생성되는 기술정보
- **이전 국가:** 미국을 포함하여 Vercel 또는 그 하위처리자가 데이터 처리시설을 운영하는 국가
- **이전 시기 및 방법:** 이용자가 `innermirror.net`에 접속하거나 웹 서비스를 이용할 때 암호화된 네트워크 통신을 통해 처리
- **이전받는 자:** Vercel Inc. (privacy@vercel.com, 440 N Barranca Avenue #4133, Covina, CA 91723, United States)
- **이용 목적:** 웹 애플리케이션 호스팅·전송, 보안, 서비스 운영 및 기본 관측 기능 제공
- **국외 이전 근거:** 서비스 이용계약의 체결 및 이행을 위해 필요한 처리위탁·보관에 해당하는 범위에서 「개인정보 보호법」 제28조의8 제1항 제3호
- **보유·이용기간:** 서비스 제공에 필요한 기간 및 Vercel의 적용 가능한 보유정책에 따름
- **거부 방법 및 효과:** 이용자는 서비스 접속을 하지 않는 방법으로 해당 처리를 거부할 수 있으나, 이 경우 InnerMirror 웹 서비스를 이용할 수 없습니다.

### 17.2 GitHub, Inc.

- **이전·처리되는 개인정보 항목:** GitHub 사용자 이름, Provider ID, OAuth 및 세션 관련 정보, 이용자가 요청한 repository metadata, default branch, 최근 commit 및 Pull Request 정보
- **이전 국가:** 미국을 포함하여 GitHub, 계열사 또는 하위처리자가 서비스를 운영하는 국가
- **이전 시기 및 방법:** GitHub OAuth 인증 또는 이용자가 GitHub 저장소 확인·분석 기능을 실행할 때 암호화된 네트워크 통신을 통해 조회·처리
- **이전받는 자:** GitHub, Inc. (dpo@github.com, 88 Colin P. Kelly Jr. St., San Francisco, CA 94107, United States)
- **이용 목적:** GitHub 인증, repository 확인 및 이용자가 요청한 프로젝트 분석
- **처리 관계:** GitHub는 이용자가 직접 보유한 계정과 저장소를 제공하는 독립 외부 서비스입니다. 본 항목은 GitHub OAuth/API 이용 과정에서 발생하는 국외 조회·처리를 투명하게 알리기 위한 것이며, GitHub 자체의 개인정보 처리는 GitHub 정책에 따릅니다.
- **보유·이용기간:** GitHub의 서비스 제공 및 법적 의무에 필요한 기간과 InnerMirror의 해당 처리 목적 달성 시까지
- **거부 방법 및 효과:** GitHub 연동 또는 GitHub 분석 기능을 이용하지 않는 방법으로 일부 처리를 거부할 수 있습니다. 다만 현재 MVP는 GitHub OAuth를 주요 로그인 수단으로 사용하므로 GitHub 인증을 거부하면 서비스 이용이 제한될 수 있습니다.

### 17.3 Google Cloud의 일부 관리서비스

- **이전·처리되는 개인정보 항목:** Runtime 요청과 관련된 IP·HTTP metadata, 오류·보안·운영 로그, 서비스 운영을 위한 secret 및 technical metadata
- **주요 국내 처리 위치:** Cloud Run, Cloud Build, build source storage 및 Artifact Registry는 서울(`asia-northeast3`) 리전
- **국외 처리 가능 범위:** Cloud Logging의 `global` location, Secret Manager의 automatic replication 및 Google·하위처리자의 운영·지원 과정
- **이전 국가:** Google 또는 관련 하위처리자가 해당 서비스를 운영하는 국가
- **이전 시기 및 방법:** Runtime 요청, logging, secret 관리 및 cloud service 운영 시 암호화된 네트워크 또는 cloud infrastructure를 통해 처리
- **이전받는 자:** Google Cloud 및 관련 Google 계열사·하위처리자
- **이용 목적:** production Runtime 운영, 보안, logging, secret 관리 및 cloud infrastructure 제공
- **국외 이전 근거:** 서비스 이용계약의 체결 및 이행을 위해 필요한 처리위탁·보관에 해당하는 범위에서 「개인정보 보호법」 제28조의8 제1항 제3호
- **보유·이용기간:** 각 서비스의 production 설정 및 Google Cloud의 적용 가능한 보유정책에 따름. 현재 `_Default` 로그는 30일, `_Required` 로그는 400일로 설정되어 있습니다.
- **거부 방법 및 효과:** 이러한 처리는 production Runtime 제공에 필요한 범위에서 발생하므로 거부하는 경우 Runtime 기반 분석 기능을 제공하기 어려울 수 있습니다.

Supabase production의 canonical learner database는 현재 서울(`ap-northeast-2`) 리전에 구성되어 있습니다. Supabase의 지원·보안·하위처리 구조에 따라 예외적인 국외 처리가 발생할 수 있는 경우에는 Supabase의 적용 가능한 계약 및 처리조건에 따라 관리합니다.

외부 사업자의 하위처리자 및 처리국가는 서비스 운영에 따라 변경될 수 있으며, 회사는 주요 변경사항을 정기적으로 확인하고 본 처리방침의 변경이 필요한 경우 반영합니다.

---

## 18. 개인정보 보호책임자 및 문의

**개인정보 보호책임자:** 정욱진  
**서비스 제공자:** 주식회사 프라이봇  
**주소:** 경북 경주시 강동면 동해대로 166-11, 7층  
**이메일:** [mail@fribot.com](mailto:mail@fribot.com)

---

## 19. 개인정보 처리방침의 변경

서비스 기능, 개인정보 처리 방식 또는 관련 법령이 변경되는 경우 본 개인정보 처리방침도 변경될 수 있습니다.

중요한 변경이 있는 경우 서비스 또는 적절한 방법을 통해 이용자가 확인할 수 있도록 안내합니다.

회사는 개인정보 처리방침의 버전과 시행일을 관리하고, 변경된 개인정보 처리방침을 이용자가 확인할 수 있도록 공개합니다.

---

## 20. 시행일

본 개인정보 처리방침은 InnerMirror MVP의 production 공개 시점부터 적용합니다.

**현재 정책 버전:** 2026-08-v1  
**시행일:** 2026.08.15.
