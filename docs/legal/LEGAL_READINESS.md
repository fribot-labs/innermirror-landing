# Legal & Compliance Readiness

> Internal governance document.
>
> This document tracks the legal and operational readiness of the current
> InnerMirror production MVP.
>
> It is not a substitute for individualized legal advice.

---

# Current Service Status

Current production MVP:

```text
Public Landing
        ↓
GitHub OAuth
        ↓
Repository Selection
        ↓
Project / Reflection
        ↓
Runtime
        ↓
Result Presentation
```

Current production infrastructure:

```text
Landing
→ https://innermirror.net

Admin
→ https://admin.innermirror.net

Runtime
→ Google Cloud Run
→ asia-northeast3 / Seoul

Canonical learner persistence
→ Supabase
→ innermirror-production
→ ap-northeast-2 / Seoul
```

Current MVP:

```text
No payment

No subscription

No continuous GitHub monitoring

No automatic background analysis

No external LLM analysis

Product Observation Admin
→ internal
→ restricted
→ read-only
```

---

# 1. Privacy Policy

Status:

```text
PRODUCTION ALIGNMENT IN PROGRESS
```

Current public policy documents:

```text
PRIVACY_KO.md

PRIVACY.md
```

The current production Privacy Policy set covers:

```text
GitHub OAuth

GitHub repository metadata

Projects

Reflections

Project Events

Policy Acceptance records

Supabase production persistence

Google Cloud Runtime

Vercel hosting

international processing

service-provider relationships

data deletion

Product Observation derived information
```

Product Observation disclosure must preserve:

```text
internal product/service observation

pseudonymous subjectRef

no learner scoring

no learner ranking

no psychological inference

Raw Reflection / Raw Question
→ not exposed by default in Admin

user-linkable Product Observation data
→ deleted with InnerMirror service data
```

Final status requires consistency review after the current production-policy
alignment change is merged.

---

# 2. Terms of Service

Status:

```text
PRODUCTION ALIGNMENT IN PROGRESS
```

Current public Terms:

```text
TERMS_KO.md
```

The Terms currently cover:

```text
GitHub OAuth dependency

GitHub ownership boundary

user-triggered analysis

Reflection processing

Runtime analysis

no external LLM analysis

service-result limitations

InnerMirror service-data deletion

account deletion separation

internal Product Observation purpose
```

Product Observation must remain a service-review mechanism rather than a learner
evaluation or ranking mechanism.

---

# 3. Service Provider Disclosure

Status:

```text
CONFIRMED
```

Current disclosed operator:

```text
주식회사 프라이봇
```

Current disclosed contact:

```text
mail@fribot.com
```

Current disclosed service address:

```text
경북 경주시 강동면 동해대로 166-11, 7층
```

Current principal infrastructure relationships disclosed include:

```text
Supabase

Google Cloud

Vercel

GitHub
```

---

# 4. GitHub OAuth Compliance

Status:

```text
PRODUCTION VERIFIED
```

Current production behavior:

```text
GitHub OAuth
→ implemented

public-repository-oriented MVP
→ active

repo scope
→ not requested

user-triggered repository analysis
→ active

continuous GitHub monitoring
→ not used

background webhook / scheduler / polling sync
→ not used
```

GitHub remains an independent external service.

InnerMirror does not acquire ownership of GitHub repositories or GitHub-origin
data.

---

# 5. AI / LLM Transparency

Status:

```text
CURRENT MVP VERIFIED
```

Current production behavior:

```text
External generative AI / LLM analysis
→ not used

Continuous analysis
→ not used

Automatic background analysis
→ not used

User-triggered Runtime analysis
→ used
```

Any future external AI or LLM processing requires separate review before
production use.

Required future review includes:

```text
processing purpose

information transmitted

provider

processing location

retention

international processing

privacy disclosure

security review

vendor review
```

---

# 6. Data Ownership

Status:

```text
PRODUCTION ALIGNED
```

Current principle:

```text
GitHub repositories remain under the learner's ownership.

InnerMirror stores only information required for its own service.

Product Observation does not transfer ownership of learner or GitHub content.
```

InnerMirror service records and GitHub-origin records remain separate.

---

# 7. Product Observation

Status:

```text
PRODUCTION IMPLEMENTED
POLICY ALIGNMENT IN PROGRESS
```

Current purpose:

```text
internal product/service observation
```

Current Product Observation architecture includes:

```text
pseudonymous subjectRef

evidence references

Derived Observations

Observation ↔ Evidence relationships

Growth Trace recomputation

Cohort recomputation

Service Review Signals

Signal ↔ Evidence relationships
```

Current Product Observation Admin:

```text
Internal

Restricted

Read-only

Runtime-authorized
```

The current system must not introduce:

```text
Growth Score

learner scoring

learner ranking

mastery scoring

risk scoring

ability scoring

performance scoring

behavior scoring

psychological inference
```

Raw Reflection and Raw Question are not exposed by default through the Product
Observation Admin surface.

---

# 8. Data Deletion

Status:

```text
PRODUCTION IMPLEMENTED
```

Current:

```text
Delete InnerMirror Data
```

deletes:

```text
Projects

Reflections

Project Events

Policy Acceptance records

user-linkable Product Observation state

Product Observation subject mapping and linked history
```

The operation does not itself delete:

```text
Supabase Auth user

InnerMirror Profile

GitHub account

GitHub repository data
```

Therefore:

```text
Delete InnerMirror Data
!=
account deletion
```

Account deletion currently remains a separate request workflow.

After Product Observation subject mapping deletion, a future new observation
lifecycle may receive a new:

```text
subjectRef
```

---

# 9. Supabase Production Persistence

Status:

```text
PRODUCTION IMPLEMENTED
```

Current production project:

```text
innermirror-production
```

Current production region:

```text
ap-northeast-2
Seoul
```

Current production capabilities include:

```text
Supabase Authentication

canonical learner persistence

Projects

Reflections

Project Events

Policy Acceptance records

RLS-backed user data isolation

Product Observation persistence

authenticated InnerMirror service-data deletion
```

Development and integration projects are not authoritative production learner
persistence.

Current canonical database migration authority:

```text
innermirror-runtime-private
```

Current migration sequence:

```text
001–016
→ applied
```

---

# 10. Production Backup / Recovery

Status:

```text
REVIEW REQUIRED
```

Current documented production backup baseline:

```text
Supabase Pro

daily backup

7-day retention
```

Production activation readiness still requires operational confirmation of:

```text
actual backup capability

recovery procedure

recovery control / procedure location

production-owned recovery path

recovery responsibility
```

A paid plan or documented backup policy alone is not sufficient evidence of
operational recovery readiness.

---

# 11. Security Review

Status:

```text
TECHNICAL PRODUCTION VALIDATION
→ PASS
```

Current production security/privacy boundaries include:

```text
Supabase Authentication

RLS-backed user ownership

separate production Supabase project

server-side secret management

dedicated Runtime service account

restricted internal / diagnostic endpoints

no GitHub repo scope

user-triggered analysis only

no whole-repository permanent copy

memory-only Product Observation Admin session

no reusable Runtime Admin session in URL

direct browser Product Observation database access
→ prohibited

unknown production CORS origin
→ denied
```

Production deployment validation has passed.

Security validation does not itself authorize production activation.

---

# 12. International Processing

Status:

```text
PRODUCTION DISCLOSURE IMPLEMENTED
```

Primary production workload/data locations include:

```text
Supabase canonical learner database
→ Seoul

Google Cloud Run
→ Seoul

Cloud Build
→ Seoul

Artifact Registry
→ Seoul
```

The service must not be described as if all processing remains only in Korea.

International or global processing may occur through:

```text
GitHub

Vercel

Google Cloud global management services

provider / subprocessor operations
```

The current Korean Privacy Policy contains the principal production
international-processing disclosure.

---

# 13. Retention

Status:

```text
PRODUCTION BASELINE DEFINED
```

Current production baseline includes:

```text
canonical learner service records
→ retained as required for service continuity until applicable deletion

Supabase production backup
→ daily / 7 days under current production plan

Google Cloud _Default logs
→ 30 days

Google Cloud _Required logs
→ 400 days
```

Three-year inactivity automatic deletion:

```text
NOT IMPLEMENTED
```

It must not be represented as an active production feature.

---

# 14. Operational Responsibility

Status:

```text
REVIEW REQUIRED
```

Explicit production ownership must be confirmed for:

```text
Runtime deployment

Runtime rollback

Admin deployment

Landing deployment

Supabase configuration

Supabase migrations

GitHub OAuth configuration

Secret Manager

secret rotation

DNS

TLS

backup / recovery

production validation

production incident response
```

A single operator may own multiple responsibilities.

The requirement is explicit ownership rather than organizational size.

---

# 15. Legal Foundation

Current document:

```text
docs/legal/LEGAL_FOUNDATION.md
```

Current status:

```text
PRODUCTION LEGAL LOCK CANDIDATE
```

The Legal Foundation now includes the current Product Observation production
boundary.

Final legal-lock status must not be declared until the current public policy
alignment change is reviewed and merged.

---

# 16. Current Legal / Policy Alignment

Current document-level state:

```text
PRIVACY_KO.md
→ PRODUCTION ALIGNMENT UPDATE IN PROGRESS

TERMS_KO.md
→ PRODUCTION ALIGNMENT UPDATE IN PROGRESS

PRIVACY.md
→ PRODUCTION ALIGNMENT UPDATE IN PROGRESS

LEGAL_FOUNDATION.md
→ PRODUCTION ALIGNMENT UPDATE IN PROGRESS

LEGAL_READINESS.md
→ PRODUCTION ALIGNMENT UPDATE IN PROGRESS

Service Provider Disclosure
→ CONFIRMED
```

Current overall result:

```text
Legal / Policy Alignment
→ REVIEW REQUIRED
```

The result remains `REVIEW REQUIRED` until the current Landing policy alignment
change is merged and re-reviewed from the Runtime activation-readiness process.

---

# 17. Production Activation Readiness

Current technical production state:

```text
Production Infrastructure
→ READY

Production Deployment Validation
→ PASS

Production Validation Evidence
→ RECORDED
```

Current activation-readiness state:

```text
Legal / Policy Alignment
→ REVIEW REQUIRED

Production Backup / Recovery
→ REVIEW REQUIRED

Operational Responsibility
→ REVIEW REQUIRED
```

Therefore:

```text
PO-11A16 Production Activation Readiness
→ BLOCKED
```

and:

```text
Production Activation
→ NOT AUTHORIZED
```

remain correct.

---

# 18. Launch Gate

Current launch-gate state:

```text
Privacy
→ ALIGNMENT IN PROGRESS

Terms
→ ALIGNMENT IN PROGRESS

Data Ownership
→ READY

Service Data Deletion
→ READY

GitHub OAuth Compliance
→ VERIFIED

AI / LLM Transparency
→ VERIFIED FOR CURRENT MVP

Supabase Persistence
→ READY

Technical Security Validation
→ PASS

Production Backup / Recovery
→ REVIEW REQUIRED

Operational Responsibility
→ REVIEW REQUIRED

Legal / Policy Alignment
→ REVIEW REQUIRED

Production Activation
→ NOT AUTHORIZED
```

---

# 19. Change Triggers

Legal and policy alignment must be reopened before production use of material
changes including:

```text
new external AI / LLM processing

new analytics or monitoring provider

private-repository GitHub scope

GitHub OAuth scope expansion

new persistent learner-data category

Product Observation scope expansion

Product Observation write workflows

expanded Product Observation Admin audience

learner-facing Product Observation

new retention behavior

new deletion behavior

production database / region change

new external data processor

automatic GitHub monitoring or synchronization
```

---

# 20. Final Readiness Principle

The following distinction remains mandatory:

```text
Production Infrastructure READY
!=
Production Deployment Validation PASS
!=
Production Activation Readiness READY
!=
Production Activation AUTHORIZED
```

Technical success does not automatically create legal, operational, or
activation authority.

---

# Current Result

```text
Legal / Policy Alignment
→ REVIEW REQUIRED

Production Backup / Recovery
→ REVIEW REQUIRED

Operational Responsibility
→ REVIEW REQUIRED

PO-11A16 Production Activation Readiness
→ BLOCKED

Production Activation
→ NOT AUTHORIZED
```

Trust comes before intelligence.

Ownership comes before analysis.

Compliance comes before production activation.
