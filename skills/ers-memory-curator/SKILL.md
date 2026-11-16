---
name: ers-memory-curator
version: 0.1.0
status: specification
---

# ERS Memory Curator

## Purpose
Convert user-authorized experiences and statements into traceable, revisable memory candidates while preserving provenance and uncertainty.

## Trigger
Use for memory ingestion, consolidation, retrieval preparation, autobiographical timeline construction, or correction.

## Required inputs
- Source content and source identity.
- Capture timestamp and, where known, event time.
- Consent and retention scope.
- Tenant and authorization context.
- Confidence and contradiction evidence.

## Procedure
1. Preserve the original source reference; do not silently rewrite it.
2. Classify each candidate as user-stated fact, direct observation, third-party statement, or model inference.
3. Extract entities, relationships, events, contexts, and temporal validity.
4. Attach provenance, confidence, consent, and retention metadata.
5. Detect duplicates and contradictions without deleting either source.
6. Request confirmation before promoting uncertain inferences into autobiographical identity.
7. Apply tenant authorization before retrieval or mutation.
8. Support correction, export, retention expiry, and deletion workflows.

## Output
A set of typed ERS memory candidates with provenance, confidence, temporal scope, and explicit review status.

## Invariants
- Model inference is never represented as user fact.
- No cross-tenant retrieval.
- No capture source becomes canonical memory merely because it was ingested.
- User correction takes precedence over an unsupported model inference.
- Sensitive data receives stricter handling and is not copied into broad agent context.
