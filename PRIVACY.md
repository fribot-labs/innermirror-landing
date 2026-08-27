# PRIVACY.md

# InnerMirror Privacy Policy

Effective for the current InnerMirror MVP.

InnerMirror is operated by:

```text
Fribot Co., Ltd.
주식회사 프라이봇
```

Privacy Officer:

```text
Wookjin Chung
정욱진
```

Contact:

```text
mail@fribot.com
```

Business Address:

```text
대한민국
경상북도 경주시 강동면 동해대로 166-11, 7층
```

---

# 1. Our Privacy Principle

InnerMirror is an online Reflection and Project Continuity service.

The service is designed around the following principles:

```text
Your projects remain yours.

Analysis begins only when you choose.

InnerMirror stores only the information
required to provide its own service.
```

InnerMirror does not become the owner of your GitHub repositories.

InnerMirror does not modify or delete GitHub repositories as part of the current MVP workflow.

---

# 2. Current MVP Service Boundary

The current MVP provides the following workflow:

```text
GitHub Authentication

↓

Repository Selection

↓

Project Context

↓

Reflection or Explicit Analysis Request

↓

InnerMirror Runtime

↓

Result Presentation
```

The current MVP:

- does not continuously monitor GitHub activity,
- does not perform automatic background analysis,
- does not connect learner information to an external LLM analysis service.

Analysis begins only when the learner explicitly requests it.

Examples include:

- Analyze GitHub Project
- Reflect
- Reflect + GitHub

---

# 3. Personal Information We Process

InnerMirror processes only information necessary to provide the current service.

## 3.1 Authentication Information

The current MVP may process:

- Supabase authenticated user identifier
- GitHub provider identifier
- GitHub username

GitHub email addresses are not intended to be stored as persistent InnerMirror user identifiers in the current MVP.

InnerMirror does not require a separate InnerMirror password.

---

## 3.2 GitHub Project Information

When the learner explicitly connects GitHub and requests project analysis,
InnerMirror may process information including:

- repository owner
- repository name
- repository identifier
- repository default branch
- repository metadata
- recent commit information
- recent pull request information

The specific scope may be adjusted to the minimum information required for the service.

InnerMirror does not permanently copy complete GitHub repositories as part of the current MVP design.

---

## 3.3 Learner-Created Information

The learner may voluntarily provide:

- Reflection
- project focus
- questions
- decisions
- project-related thoughts
- learning journey information
- project events

These records may be used to provide project continuity and Reflection services.

---

## 3.4 Fribot Learning Information

For projects originating from Fribot Learning templates,
InnerMirror may process template-related context including:

- template identifier
- course identifier
- learning goal
- difficulty
- estimated duration
- project metadata

This information is used to understand the starting context of the learner's project.

---

## 3.5 Internal Product Observation Derived Information

InnerMirror may process a limited set of internal Product Observation information
to review whether the service structure and continuity experience are functioning
as intended.

Product Observation is used for internal product and service review.

It is not a learner evaluation or ranking system.

Product Observation may include internal representations such as:

```text
pseudonymous subjectRef

evidence references

Derived Observations

Growth Trace recomputation results

Cohort recomputation results

Service Review Signals
```

Where practical for the approved Product Observation purpose, InnerMirror uses
the pseudonymous internal reference `subjectRef` rather than requiring direct
learner account identity on the normal internal Admin read surface.

Product Observation is not used in the current MVP to create:

```text
learner scores

learner rankings

Growth Scores

mastery scores

risk scores

ability scores

performance scores

behavior scores

personality or psychological inferences
```

The current Product Observation Admin is an internal restricted read-only
surface.

Raw Reflection and Raw Question are not exposed by default through that Admin
surface.

User-linkable Product Observation information follows the InnerMirror
service-data deletion lifecycle described in this Privacy Policy.

---

# 4. Purpose of Processing

InnerMirror processes personal information for the following purposes:

- user authentication,
- identification of the learner's InnerMirror record,
- connection of GitHub project context,
- Reflection recording,
- project continuity,
- learning journey continuity,
- learner-requested analysis,
- service security,
- account deletion and privacy-right handling,
- limited internal Product Observation for service quality and structural review.

Personal information is not used beyond the purposes reasonably necessary to provide the service unless a separate lawful basis exists.

---

# 5. User Identity and Continuity

InnerMirror does not attempt to infer that different authenticated identities belong to the same person.

The authenticated identity presented by the learner defines the InnerMirror user boundary.

If a learner signs in using a different supported authentication identity,
InnerMirror treats that identity as a different user.

InnerMirror does not automatically merge identities based on:

- name,
- email similarity,
- repository similarity,
- project similarity,
- or inferred personal characteristics.

A learner who wishes to maintain long-term continuity should continue using the same supported authentication identity.

---

# 6. Minimum Age

InnerMirror is intended only for users who are:

```text
14 years of age or older
```

The current MVP is not intended for children under the age of 14.

InnerMirror does not intentionally provide the current service to children under 14.

---

# 7. Retention Period

InnerMirror retains information only for as long as necessary to provide the service.

## Active Users

Records required for Reflection and Project Continuity may remain available while the learner actively uses the service.

## Inactive Users

If an InnerMirror account remains inactive for:

```text
3 years
```

the associated InnerMirror user records are scheduled for deletion under the service retention policy, unless retention is required by applicable law.

The three-year period is an InnerMirror service policy and is not represented as a statutory retention period.

---

# 8. User-Requested Deletion

A learner may use the current:

```text
Delete InnerMirror Data
```

function to delete the InnerMirror service data covered by the current MVP
deletion contract.

The current operation deletes:

```text
Projects

Reflections

Project Events

Policy Acceptance records
```

User-linkable Product Observation derived information and the associated
Product Observation subject mapping are also removed according to the current
service-data deletion architecture.

The current `Delete InnerMirror Data` function is not full login-account
deletion.

The following may remain after the service-data deletion operation:

```text
Supabase Auth user

InnerMirror Profile

GitHub account
```

If deletion of the login account itself is required, the learner may contact
InnerMirror through the service contact channel.

The current MVP does not provide selective deletion by:

```text
individual Reflection

project

repository

date range

analysis type
```

Deleting InnerMirror service data does not delete data independently held by
GitHub.

After deletion of the Product Observation subject mapping, a future new
Product Observation lifecycle may receive a new `subjectRef`.

---

# 9. GitHub Data Is Not Deleted

Deleting InnerMirror data does not delete information stored independently by GitHub.

InnerMirror deletion does not delete:

- GitHub repositories
- GitHub commits
- GitHub pull requests
- GitHub branches
- GitHub organizations
- GitHub accounts

Your GitHub repositories remain under your ownership.

GitHub remains independent from InnerMirror.

---

# 10. GitHub Connection

Connecting GitHub authorizes the technical connection required for the selected service workflow.

GitHub authorization does not transfer ownership of GitHub information to InnerMirror.

GitHub OAuth authorization and InnerMirror personal-information processing are separate concepts.

InnerMirror processes GitHub-derived information only within the scope required for the service and the permissions available through the connected account.

---

# 11. Third-Party Provision

The current MVP does not intentionally sell learner personal information.

The current MVP does not intentionally provide learner records to unrelated third parties for their own independent marketing purposes.

Where personal information is provided to a third party in the future,
InnerMirror will review and disclose the applicable legal basis and required information before such processing begins.

---

# 12. Processing by Service Providers

InnerMirror currently uses or plans to use technical service providers necessary to operate the service.

These may include:

- GitHub
- Supabase
- web hosting and deployment infrastructure
- infrastructure used to operate the private InnerMirror Runtime

The exact production infrastructure, processing location, contractual role,
and international-transfer status must be finalized before long-term production persistence is enabled.

InnerMirror will update this Privacy Policy to reflect the actual production architecture.

---

# 13. International Data Transfers

The current production architecture has been reviewed for its principal
processing locations and external infrastructure relationships.

The canonical learner database and primary Runtime workloads are configured in
Seoul, Republic of Korea.

However, some processing or technical information may be handled internationally
through services including:

```text
GitHub

Vercel

some Google Cloud management services

provider and subprocessor support operations
```

The service must not be represented as if all information remains exclusively
within the Republic of Korea.

Where required, international processing and transfer information is disclosed
through the applicable production privacy notice and related service-provider
information.

---

# 14. Current Supabase Status

The current production MVP uses Supabase for authentication and canonical
InnerMirror application persistence.

Current production status:

```text
Supabase Auth
IMPLEMENTED

Production Learner Database
IMPLEMENTED

Production RLS
VERIFIED

Production Reflection Persistence
IMPLEMENTED

Production Service Data Deletion
IMPLEMENTED

Production Product Observation Persistence
IMPLEMENTED
```

The canonical production project is separate from development and integration
projects.

The current `Delete InnerMirror Data` operation deletes the InnerMirror service
data described in this policy.

It does not itself delete:

```text
Supabase Auth user

InnerMirror Profile

GitHub account
```

Account deletion remains a separate request process where required.

Production learner persistence must not silently fall back to local JSONL,
temporary browser storage, or non-canonical development persistence.

---

# 15. Sensitive Information

Reflection is free-form text.

A learner may voluntarily enter information that could be highly personal or potentially sensitive.

InnerMirror does not require learners to submit sensitive information in order to use the current MVP.

Learners should avoid submitting sensitive information that is not necessary for the project or Reflection purpose.

Before long-term production persistence of Reflection is enabled,
InnerMirror will review the treatment of sensitive information separately.

---

# 16. Security

InnerMirror will implement reasonable technical and organizational safeguards appropriate to the information being processed.

Before production persistence of learner records is enabled, the service will review at least:

- authentication boundaries,
- database access controls,
- Row Level Security,
- user-level data isolation,
- encrypted transport,
- credentials and secret management,
- logging,
- deletion procedures,
- backup behavior,
- administrative access,
- and incident-response procedures.

Production storage must not be considered ready until these safeguards are verified.

---

# 17. Rights of Learners

Subject to applicable law, learners may request actions concerning their personal information.

These may include requests relating to:

- access,
- correction,
- deletion,
- suspension of processing,
- and withdrawal of consent where applicable.

Requests may be sent to:

```text
mail@fribot.com
```

InnerMirror will process valid requests in accordance with applicable law.

---

# 18. Privacy Officer

Privacy Officer:

```text
Wookjin Chung
정욱진
```

Operator:

```text
Fribot Co., Ltd.
주식회사 프라이봇
```

Email:

```text
mail@fribot.com
```

Address:

```text
경상북도 경주시 강동면 동해대로 166-11, 7층
대한민국
```

---

# 19. Service Transparency

The current MVP follows these public service principles:

```text
YOUR OWNERSHIP

✓ GitHub repositories remain under your ownership.

✓ InnerMirror never modifies GitHub repositories.


SERVICE TRANSPARENCY

✓ Analysis begins only when you explicitly request it.

✓ Analysis never starts automatically.


CURRENT MVP

✓ No continuous monitoring

✓ No automatic background analysis

✓ No external LLM analysis
```

The public Landing may present these principles in a shortened Trust Layer.

---

# 20. Future AI or LLM Processing

The current MVP does not send learner information to an external LLM for analysis.

If future versions introduce external AI or LLM processing,
InnerMirror will review before activation:

- the processing purpose,
- information transmitted,
- service provider,
- processing location,
- retention,
- international transfer,
- user disclosure,
- consent or other lawful basis,
- AI-related legal requirements,
- and changes required to this Privacy Policy.

Future AI functionality must not be silently introduced under the current MVP disclosure.

---

# 21. Changes to This Privacy Policy

This Privacy Policy may be updated as InnerMirror develops.

Material changes affecting the processing of personal information will be disclosed before or when they become effective as required by applicable law.

The effective date and revision history should be maintained when the production service begins.

---

# 22. Relationship to Other InnerMirror Documents

This Privacy Policy is based on:

```text
LEGAL_FOUNDATION.md

↓

PRIVACY.md
```

Related documents include:

```text
DATA_OWNERSHIP.md

LEGAL_READINESS.md

Future TERMS.md

Future ACCOUNT_DELETION.md

Future SECURITY_POLICY.md
```

These documents should remain consistent with the actual behavior of the service.

---

# Privacy Foundation

Your projects remain yours.

Analysis begins only when you choose.

InnerMirror processes only the information necessary to provide the service.

The learner remains in control of their InnerMirror history.

Deleting InnerMirror data never deletes the learner's GitHub repositories.

Trust comes before intelligence.