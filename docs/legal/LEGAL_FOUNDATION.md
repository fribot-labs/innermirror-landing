# InnerMirror MVP Legal Foundation

> Internal governance document. This document records the production facts and legal assumptions used to lock `PRIVACY_KO.md` and `TERMS_KO.md` for the initial InnerMirror MVP release. It is not a substitute for individualized legal advice.

**Status:** PRODUCTION LEGAL LOCK CANDIDATE  
**Baseline date:** 2026-08-15 KST  
**Operator:** 주식회사 프라이봇  
**Service:** InnerMirror MVP

---

## 1. Legal lock objective

The legal lock must describe the system that actually exists in production rather than an earlier local/private Runtime design.

The following documents are treated as one consistency set:

- `PRIVACY_KO.md`
- `TERMS_KO.md`
- `docs/legal/LEGAL_FOUNDATION.md`
- `docs/PRODUCTION_VALIDATION.md`

A change to production data flow, external provider, authentication scope, persistent storage, analytics, AI/LLM processing, or deletion behavior requires review of this set.

---

## 2. Production operator and contact

- Operator: 주식회사 프라이봇
- Address: 경북 경주시 강동면 동해대로 166-11, 7층
- Privacy officer: 정욱진
- Contact: mail@fribot.com
- Minimum MVP age: 14+

---

## 3. Current production topology

### Landing

- Provider: Vercel Inc.
- Project: `innermirror-landing`
- Production domain: `https://innermirror.net`
- Plan: Pro
- Web Analytics Plus: Disabled
- Speed Insights: Disabled
- Observability Plus: Disabled
- External log drains: none observed
- Paid add-ons: none currently enabled
- Spend Management: On-Demand Budget USD 60, notifications on, automatic production pause off

### Canonical learner persistence

- Provider: Supabase Pte. Ltd.
- Organization: Fribot Production
- Plan: Pro
- Project: `innermirror-production`
- Region: AWS `ap-northeast-2` / Seoul
- Canonical tables/records: Profiles, Projects, Reflections, Project Events, Policy Acceptances
- Daily backup: enabled; Pro policy 7-day retention
- Spend Cap: enabled
- Supabase Assistant organization data sharing: disabled

### Development separation

- Organization: Fribot Development
- Plan: Free
- Project: `pbl-coaching-judgment-v1`
- Region: `ap-southeast-2`
- Policy: production learner personal data must not be stored in this development project

### Runtime

- Provider: Google Cloud
- GCP project: `innermirror-494706`
- Cloud Run service: `innermirror-runtime`
- Region: `asia-northeast3` / Seoul
- Capacity: 1 vCPU, 1 GiB, min instances 0, max instances 1
- Production local file-backed learner persistence: disabled
- Canonical persistence: Supabase only

### Build and server-side infrastructure

- Cloud Build: `asia-northeast3` / Seoul
- Build source bucket: `run-sources-innermirror-494706-asia-northeast3`, regional Seoul
- Source bucket soft-delete: 7 days
- Artifact Registry: `cloud-run-source-deploy` and `innermirror-runtime`, both Seoul
- Artifact encryption: Google-managed key
- Container vulnerability scanning: disabled
- Secret Manager `github-client-secret`: automatic replication
- Cloud Logging `_Default`: global / 30 days
- Cloud Logging `_Required`: global / 400 days
- Custom external Cloud Logging sink: none

### GitHub

- Primary login path: Supabase GitHub OAuth
- Repository discovery: public-repository-oriented MVP
- `repo` scope: not requested
- `handleConnectGitHub`: `read:org`
- renewal path: `read:user user:email read:org`
- Runtime GitHub session transport: `X-InnerMirror-Runtime-Session` header only
- URL query session contract: rejected
- Organization membership full-response console logging: removed

---

## 4. Service behavior fixed for the MVP

- GitHub activity is not continuously monitored.
- No background webhook/scheduler/polling sync is part of the current MVP.
- GitHub repository or full Git history is not copied into the InnerMirror canonical database as a whole.
- GitHub analysis runs only after explicit user action.
- Reflection Only and Reflection + GitHub are supported production analysis paths.
- External generative AI/LLM is not used in the current Reflection/GitHub analysis path.
- Runtime JSONL/Deep Path file persistence is not the production canonical learner memory.

---

## 5. Data ownership and content model

### User/GitHub side

The user retains ownership or control of the GitHub repository and its original GitHub data, subject to GitHub's own terms.

InnerMirror does not acquire ownership of GitHub repositories, commits, pull requests or branches.

### InnerMirror side

The following are InnerMirror service records:

- Projects
- Reflections
- Project Events
- Policy Acceptance records
- Profile/account state necessary for service operation

The public Terms grant the company only the service-operation processing permission necessary to store, transmit, display and analyze user-provided content.

---

## 6. Minimum deletion boundary

`Delete InnerMirror Data` currently deletes:

- Projects
- Reflections
- Project Events
- Policy Acceptance records

It preserves:

- Supabase Auth user
- InnerMirror Profile
- GitHub account and GitHub-origin data

Account deletion is handled separately by user request to `mail@fribot.com` until an automated account deletion workflow exists.

The privacy policy must not represent `Delete InnerMirror Data` as full account deletion.

---

## 7. Retention baseline

- Canonical learner records: retained while needed for service continuity, until the user invokes the applicable deletion function or account deletion is completed, subject to legal retention.
- Supabase production backups: daily, 7 days under the current Pro plan.
- Google Cloud `_Default` logs: 30 days.
- Google Cloud `_Required` logs: 400 days.
- Build source bucket deleted-object soft-delete: 7 days; no separate live-object lifecycle rule was observed in the production metadata review.
- GitHub-origin records remain subject to GitHub's own retention because InnerMirror does not own or delete the source account/repository.

Three-year inactivity auto-deletion is not implemented and must not be promised as current behavior.

---

## 8. Processing by external providers

### Processor/infrastructure relationships

The public privacy notice discloses the main processing/infrastructure relationships:

- Supabase Pte. Ltd. — authentication, database, backup and RLS-backed data access
- Google Cloud — Runtime, server-side analysis, build, artifact, logging and secret infrastructure
- Vercel Inc. — web hosting, delivery, security and included operational observability

### Independent external service

GitHub is described separately as an independent external service used for OAuth and user-requested repository access. GitHub's own privacy terms apply to its service.

---

## 9. International processing position

The service must not be described as "all data stays in Korea."

### Domestic primary workload/data facts

- Supabase canonical learner DB: Seoul (`ap-northeast-2`)
- Google Cloud Run Runtime: Seoul (`asia-northeast3`)
- Cloud Build: Seoul
- Build source bucket: Seoul regional
- Artifact Registry: Seoul

### International/global facts

- Vercel Pro processing uses Vercel infrastructure with primary processing facilities in the United States and may process data in other Vercel/subprocessor locations.
- GitHub processes personal data internationally, including in the United States and other GitHub/affiliate/subprocessor locations.
- Google Cloud Logging uses `global` buckets in this production project.
- Secret Manager `github-client-secret` uses automatic replication.
- Provider support/subprocessor operations are not guaranteed to be Korea-only.

`PRIVACY_KO.md` therefore includes a specific international-processing section rather than a placeholder.

---

## 10. Legal basis notes for Korean privacy compliance

The public privacy notice is structured to address the following Korean Personal Information Protection Act concepts:

- processing purpose and categories of personal information
- retention/destruction
- processor/outsourcing and re-subprocessor transparency
- data subject rights and privacy officer contact
- international transfer/processing disclosure
- security measures

For international processing that is necessary to perform the service contract, the policy relies on the statutory framework allowing necessary overseas outsourcing/storage when the required transfer information is disclosed in the privacy policy.

Because vendor subprocessors and processing countries can change, the company must review material provider changes and update the policy when necessary. The public policy links to applicable official subprocessor materials as an operational supplement while retaining direct-provider disclosure in the main table.

---

## 11. Vendor contract baseline

### Supabase

- Production plan: Pro
- DPA baseline: Supabase DPA incorporated into Supabase Terms and applicable to customer organizations under the confirmed account/legal-document flow
- DPA company: Supabase Pte. Ltd.
- TIA available
- Supabase Assistant data-sharing opt-in: disabled

### Vercel

- Production plan: Pro
- Vercel DPA applies to Pro and Enterprise customers for processor processing of Customer Data
- Current DPA effective date: March 31, 2026 (last updated March 17, 2026)
- Web Analytics Plus, Speed Insights, Observability Plus: disabled

### Google Cloud

- Billing country: Republic of Korea
- Organization: 주식회사 프라이봇
- Cloud DPA and service-specific data-location/subprocessor terms apply to the cloud relationship

### GitHub

- GitHub Terms/Privacy apply to the user-facing GitHub service
- Production OAuth and permission boundary validated
- GitHub is not represented as a simple InnerMirror database processor in the public policy

---

## 12. Security baseline

The current production security/privacy boundary includes:

- Supabase Authentication
- per-user RLS ownership
- production-only Supabase project separation
- server-side secret storage
- production internal/diagnostic endpoint restriction
- public repository-oriented GitHub scope boundary
- no `repo` scope
- user-triggered analysis only
- no whole-repository permanent copy
- Runtime session ID removed from URL query strings
- Runtime session custom-header-only contract
- GitHub organization membership full JSON logging removed
- Cloud Run max instances = 1 while Runtime GitHub session state is process-local
- no custom external Google Cloud log sink
- no Vercel external drain
- Vercel optional analytics/observability add-ons disabled

---

## 13. Known MVP constraints that must remain visible internally

- Supabase Auth/Profile are not deleted by `Delete InnerMirror Data`.
- Account deletion currently requires contact workflow.
- Three-year inactivity auto-delete is not implemented.
- Runtime GitHub session remains process-local; Cloud Run max instances must remain 1 until session state is externalized.
- Container vulnerability scanning is currently disabled.
- Google Cloud Secret Manager replication is automatic rather than Seoul-only.
- Google Cloud Logging is global for the current buckets.
- External AI/LLM is not part of the current analysis path; adding one requires privacy/terms review before production use.

---

## 14. Legal lock change triggers

Re-open the legal lock before production if any of the following occurs:

- new analytics, error monitoring, email, payment or marketing SDK
- external AI/LLM added to Reflection or GitHub analysis
- private-repository scope added
- GitHub OAuth scope expansion
- Runtime persistence changes
- new canonical database or region change
- Vercel/Supabase/GCP plan or processing relationship changes
- custom logging drain/export added
- automatic background GitHub sync added
- account deletion or inactivity deletion behavior changes
- new user-generated content sharing/publication feature

---

## 15. Official reference baseline

Legal/vendor references checked for the 2026-08-15 lock:

- Korean Personal Information Protection Act, Article 26 (outsourcing) and Article 28-8 (international transfer): National Law Information Center
- Vercel Data Processing Addendum, last updated March 17, 2026, effective March 31, 2026
- Vercel Privacy Notice, last updated June 1, 2026
- GitHub General Privacy Statement, effective April 27, 2026
- GitHub Subprocessors list
- Google Cloud Data Processing Addendum and Google Cloud Platform Subprocessors list
- Supabase DPA, Version 1 — August 1, 2026, company-held copy

---

## 16. Lock decision

As of the baseline date, the legal documents may be locked for the initial MVP release if:

1. `PRIVACY_KO.md`, `TERMS_KO.md`, this document, and `PRODUCTION_VALIDATION.md` are committed together;
2. the production topology described above remains unchanged through release;
3. Vercel remains Pro and optional paid analytics/observability add-ons remain disabled unless separately reviewed;
4. no external LLM or new external SDK is introduced before launch.

**Recommended lock label:** `legal-mvp-2026-08-v1`
