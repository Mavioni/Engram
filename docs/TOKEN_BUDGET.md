# TOKEN_BUDGET.md — IRIS Cost Model (Kisame / Chakra Profiler)

## Verified Pricing: claude-sonnet-4-6

Source: docs.anthropic.com/en/docs/about-claude/models/overview (fetched 2026-05-01)

| Token class         | Rate (per MTok) | Notes                            |
|---------------------|-----------------|----------------------------------|
| Input (standard)    | $3.00           | VERIFIED live                    |
| Output              | $15.00          | VERIFIED live                    |
| Cache write         | $3.75           | 1.25x input — operator-confirmable at docs.anthropic.com/en/about-claude/pricing |
| Cache read          | $0.30           | 0.10x input — operator-confirmable at docs.anthropic.com/en/about-claude/pricing |

Cache write fires once per 5-min TTL window. Cache read applies on every subsequent turn within that window.

---

## Per-Turn Token Budget (IRIS)

| Component             | Tokens (low) | Tokens (high) | Tokens (nominal) |
|-----------------------|-------------|---------------|-----------------|
| System + IRIS persona | 1,000       | 1,000         | 1,000           |
| User message          | 50          | 200           | 125             |
| Conversation history  | 500         | 2,000         | 1,250           |
| Output                | 150         | 400           | 275             |
| **Total input**       | **1,550**   | **3,200**     | **2,375**       |
| **Total output**      | **150**     | **400**       | **275**         |

Conversation history capped at last 10 turns. System + persona always cached after first turn.

---

## Per-Turn Cost (USD)

### Cold Turn — first turn of each 5-min cycle (cache write fires)

Cached segment = 1,000 tokens (system + persona)
Non-cached input = 2,375 - 1,000 = 1,375 tokens

| Line item                      | Tokens | Rate          | Cost ($)    |
|-------------------------------|--------|---------------|-------------|
| Cache write (system+persona)  | 1,000  | $3.75/MTok    | $0.00000375 |
| Standard input (rest)         | 1,375  | $3.00/MTok    | $0.00000413 |
| Output (nominal 275)          | 275    | $15.00/MTok   | $0.00000413 |
| **Cold turn total (nominal)** |        |               | **~$0.00001200** |

### Warm Turn — cache hit (90% of turns within session)

| Line item                     | Tokens | Rate          | Cost ($)    |
|------------------------------|--------|---------------|-------------|
| Cache read (system+persona)  | 1,000  | $0.30/MTok    | $0.00000030 |
| Standard input (rest)        | 1,375  | $3.00/MTok    | $0.00000413 |
| Output (nominal 275)         | 275    | $15.00/MTok   | $0.00000413 |
| **Warm turn total (nominal)**|        |               | **~$0.00000856** |

### Blended cost per turn (10% cold, 90% warm)

  0.10 × $0.00001200 + 0.90 × $0.00000856 = **~$0.000009**

---

## Monthly Cost Projection (30 turns/day per active user)

| Scenario          | Turns/month | Cost/turn   | Monthly cost |
|-------------------|-------------|-------------|--------------|
| Blended (nominal) | 900         | $0.000009   | **$0.0081**  |
| High usage        | 900         | ~$0.000016  | **~$0.014**  |

At $9.99/mo subscription price (from EIDA spec):
- Gross margin at nominal: **~99.9%** — Anthropic API cost is negligible vs. subscription.
- Even at 10x usage spike: cost < $0.15/user/month → still >98% margin.

---

## Free Tier Daily Cap Recommendation

Target: free users cost < $0.002/day (leaves >$0.008 headroom vs. subscription break-even at 1% conversion).

At $0.000009/turn: **$0.002 / $0.000009 ≈ 222 turns/day max**.

Recommended free cap: **20 turns/day** (generous UX, ~$0.00018/day/free user).

At 1% free-to-paid conversion:
- 1,000 free users = 10 paid = $99.90 MRR
- Free-tier API cost = 1,000 × 20 × 30 × $0.000009 = **$5.40/month**
- Net after free-tier cost: $99.90 - $5.40 = **$94.50** gross on 1,000 MAU

At 5% conversion: ~$470 gross on 1,000 MAU — healthy unit economics at any reasonable scale.

---

## D1 + Cloudflare Workers Compute

Cloudflare free tier (as of 2026-05-01):
- Workers: 100,000 requests/day free, then $0.30/million
- D1: 5 million row reads/day free, then $0.001/million reads

At 30 turns/day × 1,000 MAU = 30,000 requests/day: **within free tier**.
At 10,000 MAU = 300,000 requests/day:
- Workers cost: (300,000 - 100,000) / 1,000,000 × $0.30 = **$0.06/day = ~$1.80/month**
- D1 reads: trivially within free tier at this scale

D1 + Workers cost is effectively $0 until ~50,000 MAU. Negligible vs. subscription revenue.

---

## Samehada's Summary

Heaviest contributor: OUTPUT tokens at $15/MTok. Keep IRIS responses tight (<300 tokens nominal).
Cache delivers ~29% cost reduction on warm turns. The real lever is keeping history window lean — every extra 500 tokens of history adds ~$0.0000015/turn.

At $9.99/mo and 20 turns/day free cap, this product runs at >98% gross margin even before caching benefits.

---

*Kisame — Chakra Profiler. All API rates operator-confirmable at docs.anthropic.com/en/about-claude/pricing.*
