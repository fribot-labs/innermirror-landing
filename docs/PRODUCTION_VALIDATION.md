# InnerMirror MVP Production Validation

**Validation baseline:** 2026-08-15 KST  
**Status:** RELEASE BASELINE VERIFIED  
**Scope:** production infrastructure, persistence, GitHub boundary, privacy-sensitive transport, deletion and legal-lock prerequisites

---

## 1. Production endpoints and core providers

| Area | Production state |
| --- | --- |
| Landing | `https://innermirror.net` on Vercel Pro |
| Canonical DB/Auth | Supabase `innermirror-production`, Fribot Production / Pro, Seoul `ap-northeast-2` |
| Runtime | Google Cloud Run `innermirror-runtime`, Seoul `asia-northeast3` |
| GitHub | Supabase GitHub OAuth + user-triggered GitHub API access |

---

## 2. Vercel validation

- Plan: Pro
- Project: `innermirror-landing`
- Production domain: `innermirror.net`
- Billing company: 주식회사 프라이봇
- Web Analytics Plus: disabled
- Speed Insights: disabled
- Observability Plus: disabled
- External drains: none observed
- Paid add-ons: none currently enabled
- Included credit: USD 20/month
- On-Demand Budget: USD 60
- Spend notifications: on
- Automatic production pause: off

Current MVP usage remains far below included production limits at the validation baseline.

---

## 3. Supabase validation

### Organization separation

- `Fribot Production / Pro`
  - `innermirror-production`
- `Fribot Development / Free`
  - `pbl-coaching-judgment-v1`

Production learner data must not be copied into the development project.

### Production persistence

Canonical production records include:

- `profiles`
- `projects`
- `reflections`
- `project_events`
- `policy_acceptances`

RLS ownership boundaries have been validated for the production schema.

### Production backups

- Pro daily backup is active.
- Dashboard displayed a recent backup after the Pro upgrade.
- Current Pro backup policy: daily backups stored for 7 days.

### Privacy settings

- Supabase Assistant organization data-sharing opt-in: Disabled
- Spend Cap: Enabled
- Organization Audit Logs: not available on current Pro plan
- Audit Log Drains: not configured
- Auth DB `audit_log_entries`: disabled

---

## 4. Runtime deployment validation

- GCP project: `innermirror-494706`
- Service: `innermirror-runtime`
- Region: `asia-northeast3`
- CPU: 1 vCPU
- Memory: 1 GiB
- Service scaling: min 0 / max 1
- `RUNTIME_ENV=production`
- `LANDING_APP_URL=https://innermirror.net`
- GitHub client secret supplied from Secret Manager

Latest validated production revision after Runtime session cleanup:

- `innermirror-runtime-00007-t8z`
- 100% traffic

`/health` returned HTTP 200 after deployment.

---

## 5. Runtime production boundary

Production configuration has been validated to enforce:

- public `/health`
- production internal/diagnostic route restrictions
- production memory timeline disabled
- production local JSONL learner persistence disabled
- file-backed/deep-path persistence not used as canonical learner memory
- Supabase as canonical learner persistence

---

## 6. GitHub OAuth and repository boundary

### OAuth scope

Validated production code paths:

- initial connect: `read:org`
- renewal: `read:user user:email read:org`
- `repo` scope: not requested

MVP repository discovery is public-repository-oriented.

### GitHub ownership

InnerMirror does not delete or take ownership of the user's GitHub repository, commits, pull requests, branches or GitHub account.

### User-triggered access

GitHub repository discovery/snapshot analysis occurs after explicit user action. No continuous webhook monitoring or background polling sync is part of the current MVP.

---

## 7. Runtime GitHub session privacy migration

### Landing

Production Landing was changed to send the Runtime GitHub session identifier using:

`X-InnerMirror-Runtime-Session`

The session identifier is no longer included in normal GitHub request URLs.

### Runtime

Runtime accepts the custom header only.

Legacy `?sessionId=` query transport was removed.

### Production acceptance

Validated normal flow:

- `/github/snapshot?owner=...&name=...` → HTTP 200
- `/runtime/v2/analyze` → HTTP 200
- request URL contains no Runtime session ID
- request header contains `X-InnerMirror-Runtime-Session`

Validated negative contract:

- query-only request with `?sessionId=fake` → HTTP 400
- error code: `GITHUB_SESSION_ID_MISSING`

This establishes the custom header as the sole supported production session transport.

---

## 8. GitHub log privacy hardening

Removed production logging of the full GitHub organization membership response.

Production log searches after the hardening deployment showed no new membership response fields such as `organization_url` or `followers_url` in the tested window.

Future screenshots must mask any actual Runtime session header value, OAuth token, client secret or service-role key.

---

## 9. Google Cloud data-location and logging validation

### Seoul resources

Validated in `asia-northeast3` / Seoul:

- Cloud Run Runtime
- Cloud Build
- Cloud Build source storage bucket
- Artifact Registry `cloud-run-source-deploy`
- Artifact Registry `innermirror-runtime`

### Build source bucket

`run-sources-innermirror-494706-asia-northeast3`

- location: `ASIA-NORTHEAST3`
- location type: regional
- storage class: Standard
- uniform bucket-level access: enabled
- deleted-object soft-delete: 7 days

### Artifact Registry

Both Docker repositories:

- location: `asia-northeast3`
- encryption: Google-managed key
- vulnerability scanning: disabled

### Secret Manager

`github-client-secret`

- replication policy: automatic
- not represented as Seoul-only
- secret value was not inspected during privacy review

### Cloud Logging

- `_Default`: global / 30 days
- `_Required`: global / 400 days
- only default `_Default` and `_Required` sinks observed
- no custom export to BigQuery, Cloud Storage, Pub/Sub or another project

### Cloud Build logging

- `CLOUD_LOGGING_ONLY`
- no dedicated build log bucket in the validated build

---

## 10. Reflection and project production flow

Validated production flow includes:

1. GitHub OAuth login
2. repository discovery
3. repository selection and canonical Project linkage
4. Project start / Current Focus persistence
5. refresh restoration of active project
6. GitHub Snapshot
7. Runtime V2 Analyze
8. Reflection Only
9. Reflection + GitHub
10. canonical reflection count from Supabase

Production validation confirmed that Reflection persistence is in Supabase rather than Runtime local files.

---

## 11. Delete InnerMirror Data validation

Current production deletion scope:

Deletes:

- Projects
- Reflections
- Project Events
- Policy Acceptance records

Preserves:

- Supabase Auth user
- InnerMirror Profile
- GitHub account and GitHub-origin data

The legal documents must describe this as InnerMirror service-data deletion, not full account deletion.

---

## 12. External AI/LLM boundary

The current production Reflection/GitHub analysis path does not send Reflection or GitHub project data to an external generative AI/LLM provider.

Adding an external LLM is a legal-lock change trigger and requires privacy, terms and external-provider review before production use.

---

## 13. Known non-blocking MVP constraints

- Runtime GitHub session state remains process-local.
- Cloud Run max instances remains 1 to preserve the current session contract.
- Three-year inactivity auto-deletion is not implemented.
- Automated full-account deletion is not implemented; account deletion is handled through contact workflow.
- Container vulnerability scanning is disabled.
- Google Cloud Logging uses global locations.
- Secret Manager replication is automatic.

These are documented constraints and are not represented to users as already-completed features.

---

## 14. Legal release validation

Before release, confirm that the following files are committed as one consistent set:

- `PRIVACY_KO.md`
- `TERMS_KO.md`
- `docs/legal/LEGAL_FOUNDATION.md`
- `docs/PRODUCTION_VALIDATION.md`

Required release facts:

- Vercel remains Pro
- Supabase production remains Pro / Seoul
- Runtime remains Cloud Run Seoul
- no external LLM is introduced
- no `repo` scope is introduced
- Runtime session remains header-only
- deletion semantics remain unchanged

---

## 15. Recommended release tag

`legal-mvp-2026-08-v1`
