# Engram Ternary Compute Bridge

**Status:** Research and interface design only  
**Decision:** Keep Engram's cognitive architecture hardware-neutral; treat ternary hardware as an experimental compute target, not a replacement for the cloud platform.

## Objective

Investigate whether balanced-ternary or other multi-valued compute can provide measurable benefits to selected Engram workloads. The goal is not to move a proprietary ChatGPT instance or assume that ternary hardware creates consciousness. The goal is a portable bridge between Engram's software architecture and non-binary compute.

## Current baseline

Engram is cloud-first. Identity, ERS, canonical memory, authority, task state, and audit history remain cloud-authoritative. Mobile, wearable, and workstation devices are clients or bounded execution endpoints.

The 5500FP is publicly described as a 24-trit balanced-ternary RISC processor implemented on FPGA. Public reporting describes it as an experimental platform rather than a high-performance general-purpose AI accelerator. Its existence demonstrates a concrete hardware/software research target; it does not establish that contemporary large language models can run efficiently on it.

## Proposed layered bridge

1. **Engram workload interface** — define typed tasks independent of processor representation: retrieval, graph traversal, finite-state evaluation, constraint solving, routing, selected vector/quantized kernels, and orchestration metadata.
2. **Ternary execution adapter** — translate only approved workload contracts into a target-specific ABI; return typed results, provenance, timing, and resource telemetry.
3. **Toolchain layer** — compiler, assembler, linker, debugger, emulator, test harness, and reproducible build definitions for the target ISA.
4. **Runtime layer** — scheduling, memory management, I/O, fault handling, isolation, and remote invocation. Do not assume Linux compatibility or a complete operating system without evidence.
5. **Hardware layer** — FPGA prototype or later hardware, with verified electrical/logic semantics, clock, memory, throughput, power, and reliability.
6. **Cloud control plane** — Engram authenticates the node, grants narrow task authority, sends minimized payloads, validates outputs, and records audit events. The node never becomes the authority for identity or memory.

## First workloads to benchmark

Start with small, deterministic workloads where ternary representations may be natural:
- three-valued logic and unknown/true/false policy evaluation;
- finite-state machines and routing;
- graph/relationship traversal primitives;
- constraint and SAT/SMT-adjacent experiments;
- compact state encodings and selected probabilistic/optimization experiments.

Do not begin with full LLM inference. Model inference requires a compatible runtime, memory capacity, numeric kernels, weight storage, and measured throughput. First establish a reproducible baseline on a binary CPU/GPU and compare it with the ternary target.

## Admission gates

A workload is eligible only after:
- the ISA and toolchain are documented and reproducibly buildable;
- simulator and hardware outputs agree against reference test vectors;
- numerical semantics and overflow behavior are explicit;
- performance, latency, energy, memory, and reliability are measured;
- security boundaries and data handling are documented;
- the workload beats or materially complements a binary baseline on a defined metric.

## Explicit non-goals

- Do not claim ternary is inherently faster, more intelligent, more conscious, or universally more energy-efficient.
- Do not replace the cloud-first architecture with a single local computer.
- Do not send personal memory to experimental hardware without explicit consent and a threat model.
- Do not move or claim to move ChatGPT's proprietary model weights. A hosted model API remains hosted; separately licensed open-weight models are distinct models.
- Do not make hardware purchases, preorder commitments, external accounts, or infrastructure changes without approval.

## Initial engineering sequence

1. Obtain and archive the official 5500FP ISA/specification, toolchain, emulator, and hardware documentation.
2. Build a target capability matrix: instruction set, word/trit representation, memory, I/O, interrupts, concurrency, toolchain maturity, and licensing.
3. Reproduce at least one published/reference workload in emulator and on hardware if access is available.
4. Define a hardware-neutral Engram task ABI and a mock adapter.
5. Benchmark two or three small candidate workloads against a conventional baseline.
6. Decide whether a real adapter is justified. Keep the adapter experimental until it passes the gates above.

## Research references

- 5500FP project: https://www.ternary-computing.com/
- Independent reporting on the FPGA implementation and its current performance limitations: https://www.theregister.com/on-prem/2026/03/18/its-not-a-binary-choice-boffin-builds-ternary-cpu/
- OpenAI open-weight model distinction: https://help.openai.com/en/articles/11870455-openai-open-weight-models

This document is a research plan, not evidence of a working ternary runtime or Engram integration.
