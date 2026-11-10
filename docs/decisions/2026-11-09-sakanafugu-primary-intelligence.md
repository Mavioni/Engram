# Superseded ADR: Incorrectly Named Primary Intelligence Presence

- **Original date:** 2026-11-09
- **Superseded:** 2026-11-10
- **Status:** Superseded; do not implement
- **Replacement:** [Engram Intelligence as the primary intelligence capability](2026-11-10-engram-intelligence-primary.md)

## Correction

The earlier name "Sakanafugu" was an erroneous conflation of the user's reference to the Japanese AI company Sakana AI and its Fugu product. It is not an Engram product name, agent identity, principal, service, or architectural concept.

The canonical Engram concept is **Engram Intelligence**. Sakana AI and Fugu are external provider/product names and may be evaluated only as an optional, replaceable integration behind Engram Reasoning.

No implementation should create or retain a product identity named "Sakanafugu". Existing database migration history is handled by the follow-on migration described in the replacement decision.
