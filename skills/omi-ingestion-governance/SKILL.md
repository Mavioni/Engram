---
name: omi-ingestion-governance
version: 0.1.0
status: specification
---

# OMI Ingestion Governance

## Purpose
Bridge OMI-derived capture sources into Engram while preserving consent, source provenance, and user control.

## Trigger
Use when designing or implementing wearable, audio, video, screen, Bluetooth, mobile, or desktop capture ingestion.

## Required inputs
- Source/device and capture modality.
- User consent state and capture purpose.
- Event and ingestion timestamps.
- Source payload reference and integrity metadata.
- Retention and deletion policy.

## Procedure
1. Confirm explicit opt-in for the exact capture modality.
2. Display or expose visible capture state and a clear stop control.
3. Minimize payloads before transmission.
4. Attach source, timestamp, device, consent, and integrity metadata.
5. Separate verbatim capture, transcription, summaries, and model inferences.
6. Send data through an authenticated ingestion adapter.
7. Keep raw capture and canonical memory as separate lifecycle objects.
8. Apply export, correction, retention, and deletion policies.
9. Test bystander, shared-device, revocation, and offline/retry cases.

## Output
A validated ingestion envelope and a record of consent, provenance, and processing steps.

## Invariants
- No always-on capture by default.
- No hidden recording or screen capture.
- No automatic promotion of inferred content into identity memory.
- No unapproved third-party model processing.
- OMI-derived components do not become Engram's canonical identity or memory authority.
