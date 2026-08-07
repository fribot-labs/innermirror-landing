# Repository Metadata Loader Contract

## Purpose

The Repository Metadata Loader Contract defines the machine-readable boundary between a PBL repository and InnerMirror Landing.

This layer establishes how a repository declares project metadata before any GitHub repository file loading or Runtime transport is introduced.

The primary metadata entry point is:

```text
pbl/manifest.json
```

PR-LA12A defines the contract for that manifest and the normalization boundary that converts repository-defined metadata into `RuntimeProjectMetadata`.

---

## Architecture

```text
PBL Repository

↓

pbl/manifest.json

↓

Repository Metadata Manifest

↓

Manifest Parser

↓

Normalized Repository Metadata

↓

Runtime Project Metadata
```

PR-LA12A establishes the contract portion of this flow.

It does not yet fetch `manifest.json` from GitHub.

---

## Why a Manifest

README files are primarily written for humans.

Runtime metadata requires a stable machine-readable contract.

Therefore PBL repositories expose structured metadata through:

```text
pbl/manifest.json
```

instead of requiring Landing or Runtime to interpret arbitrary README content.

This separation allows documentation to evolve independently from application contracts.

---

## Repository Structure

Recommended PBL repository structure:

```text
repository/
├─ README.md
└─ pbl/
   └─ manifest.json
```

`README.md` remains human-facing documentation.

`pbl/manifest.json` becomes the machine-readable PBL metadata entry point.

---

## Manifest Contract

The current manifest contract is versioned as:

```text
schemaVersion: v1
```

Example:

```json
{
  "schemaVersion": "v1",
  "templateId": "fribot-learning",
  "courseId": "fribot-learning-core",
  "title": "Fribot Learning",
  "difficulty": "beginner",
  "estimatedWeeks": 6,
  "learningGoal": "Complete a project-based coding and robotics learning flow."
}
```

---

## Manifest Fields

### schemaVersion

Defines the version of the repository manifest contract.

Current supported value:

```text
v1
```

This version is independent from `RuntimeProjectMetadata.metadataVersion`.

---

### templateId

Identifies the PBL template associated with the repository.

Example:

```text
dual-mcu-starter
```

The value may be `null` when no template has been declared.

---

### courseId

Identifies the learning course or program.

Example:

```text
robotics-foundation
```

The value may be `null`.

---

### title

Human-readable project or course title.

Example:

```text
Dual MCU Robotics
```

When the manifest title is unavailable, later normalization may fall back to the repository name.

---

### difficulty

Repository-declared difficulty.

Example:

```text
beginner
```

The current v1 contract intentionally treats this as a string rather than introducing a fixed difficulty taxonomy.

A stronger enum may be introduced after the PBL curriculum model stabilizes.

---

### estimatedWeeks

Repository-declared expected learning duration.

Example:

```text
6
```

Current v1 rules:

```text
null
or
finite number >= 0
```

The contract may later become stricter when course duration semantics are finalized.

---

### learningGoal

The repository-declared learning objective.

Example:

```text
Design and understand a dual-controller robotics system.
```

This is repository metadata.

It is not a Runtime-generated recommendation or inferred learner state.

---

## Nullable Fields

The following fields may be `null`:

```text
templateId
courseId
title
difficulty
estimatedWeeks
learningGoal
```

Unknown information must remain unknown.

The parser must not invent missing metadata.

```text
unknown
≠
inferred
```

This principle keeps repository-declared facts separate from Runtime interpretation.

---

## Manifest Parsing

`parseRepositoryMetadataManifest()` validates unknown input and converts it into a trusted `RepositoryMetadataManifest`.

Conceptual flow:

```text
unknown JSON value

↓

validate object

↓

validate schemaVersion

↓

validate fields

↓

normalize strings

↓

RepositoryMetadataManifest
```

---

## String Normalization

String fields are normalized during parsing.

Example:

```text
"  beginner  "
```

becomes:

```text
"beginner"
```

Whitespace-only values:

```text
"   "
```

become:

```text
null
```

This prevents semantically empty strings from entering the metadata layer.

---

## Invalid Manifest

A manifest is invalid when, for example:

```text
schemaVersion is unsupported

templateId is not string/null

courseId is not string/null

title is not string/null

difficulty is not string/null

learningGoal is not string/null

estimatedWeeks is negative

estimatedWeeks is NaN

estimatedWeeks is infinite
```

Invalid manifest content is rejected by the parser.

Transport-level handling of invalid manifests belongs to a later PR.

---

## Metadata Normalization

`normalizeRepositoryMetadata()` converts a validated `RepositoryMetadataManifest` into the existing `RuntimeProjectMetadata` contract.

```text
RepositoryMetadataManifest

+

RuntimeProjectIdentity

↓

RuntimeProjectMetadata
```

---

## Normalization Responsibilities

Normalization is responsible for:

- preserving `projectId`
- transferring manifest fields
- applying repository-name title fallback
- assigning Runtime metadata version
- assigning metadata source
- generating normalized timestamps

Normalized manifest metadata uses:

```text
source: pbl-manifest
```

---

## Title Fallback

If:

```text
manifest.title = null
```

normalization uses:

```text
projectIdentity.repository.name
```

Example:

```text
manifest.title
null

repository.name
fribot-learning

↓

RuntimeProjectMetadata.title
fribot-learning
```

The fallback uses a known repository fact rather than inferred content.

---

## Contract Version Separation

Two version boundaries intentionally exist.

Repository manifest:

```text
schemaVersion
```

Runtime metadata:

```text
metadataVersion
```

For PR-LA12A both currently use:

```text
v1
```

but they represent different contracts.

Future example:

```text
manifest schemaVersion
v2

Runtime metadataVersion
v1
```

could be valid if a normalization adapter supports that transformation.

The two version fields must therefore remain independent.

---

## Relationship with Project Layers

The project architecture is now:

```text
GitHub Repository

↓

Runtime Project Identity

↓

Repository Metadata Manifest

↓

Runtime Project Metadata

↓

Runtime Project Context
```

Each layer answers a different question.

### Project Identity

```text
Which project is this?
```

### Repository Metadata Manifest

```text
What does the repository explicitly declare?
```

### Runtime Project Metadata

```text
How are those repository facts represented inside Landing?
```

### Runtime Project Context

```text
What does Runtime currently understand about the project?
```

---

## Contract Boundary

PR-LA12A intentionally stops before transport.

Included:

```text
Manifest types
Manifest parser
Metadata normalization
Contract tests
```

Not included:

```text
GitHub Contents API
Runtime repository-file endpoint
HTTP fetch loader
Repository selection integration
Metadata persistence integration
Context enrichment
Reflection integration
Recommendation changes
```

---

## PR-LA12A Files

```text
src/project-metadata-loader/
├─ __tests__/
│  ├─ parseRepositoryMetadataManifest.test.ts
│  └─ normalizeRepositoryMetadata.test.ts
├─ runtimeMetadataLoaderTypes.ts
├─ parseRepositoryMetadataManifest.ts
├─ normalizeRepositoryMetadata.ts
└─ README.md
```

`loadRepositoryMetadata.ts` is intentionally deferred from PR-LA12A.

---

## Testing

PR-LA12A tests verify the contract without requiring a running Runtime server or GitHub API.

### Manifest Parser Tests

Coverage includes:

```text
valid v1 manifest
nullable fields
string trimming
empty string normalization
unsupported schemaVersion
invalid field types
negative estimatedWeeks
NaN estimatedWeeks
infinite estimatedWeeks
```

### Metadata Normalization Tests

Coverage includes:

```text
manifest → RuntimeProjectMetadata
projectId preservation
manifest field transfer
pbl-manifest source
repository title fallback
nullable values
timestamp normalization
invalid timestamp rejection
contract version separation
```

---

## Next Boundary

PR-LA12B will introduce the transport layer.

Planned flow:

```text
Landing

↓

loadRepositoryMetadata()

↓

Private Runtime

↓

GitHub Repository File Endpoint

↓

GitHub Contents API

↓

pbl/manifest.json

↓

PR-LA12A Contract
```

The Runtime will remain responsible for authenticated GitHub access.

Landing should not receive or manage the GitHub OAuth provider token directly.

---

## Missing Manifest Behavior

The future loader must distinguish between:

```text
manifest found
manifest missing
manifest invalid
```

A missing manifest must not automatically be treated as an application error.

General repositories may legitimately contain no:

```text
pbl/manifest.json
```

The later loader can fall back to existing:

```text
repository-derived
```

metadata.

---

## Future Flow

After PR-LA12B:

```text
Repository

↓

pbl/manifest.json

↓

Repository Metadata Loader

↓

Runtime Project Metadata
```

After PR-LA13:

```text
Runtime Project Metadata

↓

Project Context Enrichment
```

Later:

```text
Project Metadata
+
Project Context
+
Reflection

↓

Runtime Recommendation

↓

Adaptive Coaching
```

---

## Design Principle

Repository-declared facts and Runtime interpretation must remain separate.

```text
Manifest
=
repository declaration

Metadata
=
normalized repository facts

Context
=
Runtime interpretation
```

PR-LA12A establishes the contract that keeps these responsibilities independent.

This allows PBL repository formats to evolve without coupling repository structure directly to Runtime intelligence.