# Engram

## Engram Notebook — live product direction

**The Notebook is the app. The Engram is the visualization of real, user-authored data.**

The current website redesign puts a genuinely usable Notebook first. It includes auto-saved local notes, journals, tasks, full mood check-ins, explicit tags, search, JSON export/import, a 3D perspective graph of real pages, and local-only IRIS recall. No sample memories, simulated users, or fabricated insights appear. See [Notebook-first product specification](docs/PRODUCT_NOTEBOOK_V2.md).

**Preview:** https://mavioni.github.io/Engram/ (GitHub Pages must complete its verification/deployment workflow before the new UI is served).

**Current limitations:** Browser storage is local to the current device, not encrypted or cloud-synced. D1 Notebook API and migration code exist, but production deployment, sign-in, migration application, cross-device sync, and AI inference are **not verified**. The site intentionally does not claim these services are live.


**Engram is a cloud-first intelligence and agent platform with persistent identity, memory, reasoning, governed execution, and a unified user experience.**

This repository contains the existing Engram mobile/web client and Cloudflare Worker backend, together with the evolving target platform architecture. The current application is a starting implementation, not the complete target platform.

## Canonical product domains

| Domain | Responsibility |
|---|---|
| Engram Intelligence | Conversational intelligence and user-facing reasoning |
| Engram Identity | Persistent user and agent identities, relationships, and authority |
| Engram Memory | Authoritative memory with provenance, consent, and lifecycle controls |
| Engram Knowledge | Structured entities, relationships, and evidence |
| Engram Reasoning | Provider-independent model access, routing, and coordination |
| Engram Orchestration | Planning, task state, delegation, approvals, and policy |
| Engram Runtime | Stable adapter boundary to execution engines |
| Engram Agents | First-party specialized agents |
| Engram Skills | Reviewed, versioned capability packages |
| Engram Integrations | External services, applications, channels, and devices |
| Engram Presence | Conversational and visual interaction |
| Engram Mobile / Web | Primary client applications |
| Engram Workstation | Optional desktop and engineering endpoint |
| Engram Cloud | Hosted infrastructure and authoritative services |

IRIS is a legacy implementation label. Its capability is now named **Engram Intelligence**. Existing route and source identifiers will be migrated incrementally with compatibility rather than through a blind rename.

## Cloud-first principles

- Core identity, memory, task state, orchestration, policy, and inference access are cloud-authoritative.
- The platform must continue operating when user devices are offline.
- Mobile, web, workstation, and wearable devices are clients or optional endpoints—not required execution servers.
- Model providers and agent runtimes are replaceable through explicit adapters.
- Engram owns canonical identity, memory, permissions, task history, and audit records.
- External tools and agents operate with scoped, revocable authority.
- Hosted inference is metered; routing, budgets, caching, and usage transparency are required. Unlimited hosted inference is not assumed.

## Candidate ecosystem

| Project | Candidate role | Boundary |
|---|---|---|
| OpenClaw | Agent runtime, gateway, tools, channels, device connectivity | Runtime adapter; not the Engram control plane |
| OpenCoven | Agent identity contracts, sessions, governance, coordination concepts | Evaluate patterns/components; cloud suitability and licenses require verification |
| OMI | Wearable capture and connected-device ecosystem | Device integration; Engram remains canonical memory owner |
| Omarchy | Arch/Hyprland desktop environment | Optional Engram Workstation; not a cloud dependency |
| Businesses-Manager / OSA | Existing workflows, orchestration, business logic, memory | Selective reuse after coupling, security, and license audit |
| Project-Engram | Existing product UX, assessment, reflection, and interface concepts | Product reference; not the architecture to retrofit |
| Sakana Fugu | Candidate multi-model reasoning coordinator | Experimental adapter pending API, cost, privacy, availability, and terms review |
| OpenRouter | Model/provider routing | Optional inference adapter with direct-provider fallback |
| Meta TRIBE v2 | Neuroscience research model | Research only; not an agent framework; license suitability requires review |
| BitNet | Low-bit inference optimization | Optional future optimization, not a core dependency |

These are candidates, not completed integrations. See docs/architecture/INTEGRATIONS.md.

## Current implementation

The existing application uses React, Vite, Capacitor, Cloudflare Workers, Hono, D1, Better Auth dependencies, and Anthropic as its currently wired inference provider.

The current Worker contains unfinished authentication and route wiring. The existing /api/iris endpoint and IRIS source files are legacy implementation names; they do not indicate that the target architecture is complete. See docs/architecture/CURRENT_STATE.md.

## Architecture documents

- docs/architecture/ENGRAM_PLATFORM.md — target platform architecture
- docs/architecture/CURRENT_STATE.md — source-grounded implementation assessment
- docs/architecture/INTEGRATIONS.md — candidate boundaries and evaluation requirements
- docs/architecture/AGENT_GOVERNANCE.md — agent authority and security
- docs/roadmap/PLATFORM_ROADMAP.md — staged implementation plan
- docs/decisions/ — architecture decision records

## Development

Client: npm install, npm run dev, npm run lint, npm run typecheck, npm run test:e2e, npm run build.

Worker: cd server, npm install, npm run dev, npm run typecheck.

Never commit secrets. See .env.example and server/wrangler.toml.

## Scope and status

These documents describe intended architecture and staged work. They do not imply that OpenClaw, OpenCoven, OMI, Omarchy, OSA, Fugu, or OpenRouter have been integrated, security-reviewed, or deployed. This documentation update does not change production dependencies, migrations, infrastructure, or runtime behavior.

## License

Engram is licensed under **GNU Affero General Public License v3.0 only (AGPL-3.0-only)**. See [LICENSE](LICENSE) for the complete terms. The project copyright notice is in [COPYRIGHT](COPYRIGHT).

If you deploy a modified version of Engram and users interact with it over a network, AGPL-3.0 requires you to offer those users the corresponding source code of the running version. Before operating a modified network deployment, ensure the application provides a clear, accessible source-code link. Third-party dependencies and integrations remain subject to their own licenses and terms.
