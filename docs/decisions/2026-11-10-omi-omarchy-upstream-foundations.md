# 2026-11-10 — OMI and Omarchy as Upstream Foundations

**Status:** Accepted architectural direction; implementation audit in progress  
**Decision owner:** Revenant A.I. / Engram  
**Scope:** Product lineage, source reuse, integration boundaries, and upstream synchronization

## Decision

Engram will be developed as an independent cognitive platform with an explicit OMI-derived product and engineering lineage, while selectively adopting OMI and Omarchy capabilities wherever they materially accelerate the product.

This does not mean Engram is merely an OMI configuration, hosted OMI account, or renamed OMI client. Engram's purpose is to build a persistent computational model of an individual and serve as a cognitive co-pilot throughout life. OMI supplies a substantial experience-capture and device ecosystem; Engram supplies the cognitive architecture that organizes, models, and reasons over those experiences.

Omarchy is an upstream workstation foundation for an optional Engram Workstation endpoint. It is not a dependency of Engram Cloud and must not make the cloud platform dependent on a particular Linux distribution.

## Responsibility boundaries

### OMI-derived capture and experience layer

Reuse or adapt, subject to code-level review:

- Wearable, Bluetooth, and connected-device protocols and integrations.
- Mobile and desktop capture workflows.
- Audio ingestion, streaming, transcription, diarization, and related processing.
- Screen/context capture where explicitly enabled by the user.
- Conversation segmentation, summaries, action items, and capture APIs.
- SDKs, developer APIs, webhooks, and MCP integrations.
- Hardware designs and firmware where useful and compatible.

Engram must add its own consent, source attribution, identity binding, retention, deletion, and ingestion controls. Captured content is not automatically canonical memory.

### Engram-owned cognitive architecture

Engram remains authoritative for:

- User and agent identity and continuity.
- Autobiographical and semantic memory, provenance, confidence, and temporal history.
- ERS entities, relationships, events, context, and authority.
- Self-model construction, correction, and versioning.
- Reasoning, reflection, contradiction detection, and synthesis.
- Goals, tasks, orchestration, approvals, and agent authority.
- Provider selection, cost policy, audit history, and user-facing experience.

The product objective is a useful computational model of a person's cognitive identity and a persistent life co-pilot. Whether such a system has subjective consciousness is an open scientific question and is not an implementation claim.

### Omarchy-derived workstation layer

Reuse or adapt, subject to code-level review:

- Arch Linux and system provisioning patterns.
- Desktop environment, window management, themes, and interaction conventions.
- Developer tooling, terminal workflows, and application setup.
- System automation, hotkeys, clipboard/history, dictation, and desktop utilities.
- Agent-friendly workstation conventions.

Engram-specific services must run with explicit user-granted permissions, scoped filesystem and network access, visible execution state, revocation, and audit. Omarchy remains an optional endpoint profile, not the source of Engram's identity, memory, or authority.

## Integration strategy

1. Keep Engram's current repository and product identity independent.
2. Maintain a documented upstream source map for each adopted OMI and Omarchy component.
3. Prefer upstream APIs, SDKs, and adapters where they provide a stable boundary.
4. For substantial code reuse, evaluate selective vendoring, subtree/submodule, or a maintained fork per component; do not choose a repository-wide fork mechanism before mapping the code and release cadence.
5. Preserve upstream copyright and license notices, record source commit/tag and local modifications, and audit dependency and asset licenses individually.
6. Avoid copying entire repositories when a narrow component or API is sufficient.
7. Keep upstream-specific code behind Engram-owned interfaces so Engram can evolve independently and upstream changes can be merged deliberately.
8. Never treat external capture stores, model context, or workstation files as canonical Engram memory without validated ingestion.

## License and compliance notes

The reviewed OMI root README and LICENSE identify the repository code as MIT. The reviewed Omarchy README and LICENSE also identify the repository code as MIT. MIT permits broad reuse subject to retaining required copyright and permission notices. This root-level review is not a substitute for checking each selected component, bundled asset, dependency, firmware component, or third-party service.

Engram's existing repository license is AGPL-3.0-only. Before importing or distributing derived components, maintain their required notices and document how the combined distribution satisfies all applicable license terms. Hosted OMI services, paid features, trademarks, hardware availability, and external APIs are separate from the license on the repository code.

## Security and privacy gates

Before any capture source is enabled by default:

- Clear, granular opt-in and visible recording/capture state.
- Separate controls for audio, screen, wearable, and other sensor inputs.
- Consent and lawful-basis review for bystanders and shared environments.
- Encryption in transit and at rest, tenant isolation, and least privilege.
- Retention limits, export, correction, deletion, and auditability.
- Explicit distinction between verbatim observations, user-stated facts, and model-generated inferences.
- No automatic promotion of model inferences into the user's identity or autobiographical memory.
- Provider-specific data policy and budget checks before sending captured content to an external model.

## Initial implementation sequence

1. Inventory OMI repository structure, app/backend boundaries, protocols, SDKs, data model, deployment assumptions, and licenses.
2. Inventory Omarchy installation, configuration, automation, desktop-agent, and security boundaries.
3. Produce a component-by-component reuse matrix: adopt, adapt, wrap, replace, or reject.
4. Define an OMI capture adapter and canonical Engram ingestion envelope with provenance and consent metadata.
5. Prototype one end-to-end capture-to-ERS path without changing production infrastructure.
6. Define an optional Engram Workstation profile that connects to Engram Cloud through authenticated, scoped APIs.
7. Add integration tests, threat models, and upstream synchronization procedures before broad code import.

## Current implementation status

This ADR records the approved direction, not completed integration. No OMI or Omarchy source code has yet been imported into Engram as part of this decision. No upstream fork, external account, device purchase, or infrastructure deployment has been created. The current Engram client and Cloudflare Worker remain the existing application foundation while the reuse audit proceeds.

## References

- OMI source: https://github.com/BasedHardware/omi
- OMI documentation: https://docs.omi.me/
- Omarchy source: https://github.com/omacom/omarchy
- Omarchy manual: https://omarchy.org/
