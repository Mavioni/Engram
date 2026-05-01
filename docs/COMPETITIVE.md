# Engram — Competitive Landscape (Senrigan Sweep)

> Eida / mythos-eida — OSINT pass on AI mental-health-companion + journal space.
> Verification date: 2026-05-01. Pricing volatile — re-verify before any launch
> commit. WebFetch denied this pass; all rows triangulated via WebSearch against
> 2026-dated review sources.

## 1. Competitor Matrix

| App | Free Tier | Paid Monthly (USD) | Paid Annual (USD) | What's Gated | iOS/Android Parity | App Store Category |
|---|---|---|---|---|---|---|
| **Replika** | Basic chat, friend mode | $19.99 | $69.99 (Pro), $299.99 lifetime | Voice calls, AR mode, romantic/coaching modes, advanced memory, avatar customization | Variance $7.99-$19.99 mo across iOS/Android/web due to store fees | Health & Fitness / Lifestyle |
| **Wysa** | CBT chatbot, basic exercises | $79.99 (coaching) | $74.99 (self-care) | Premium CBT packs, sleep, human coach ($19.99/session add-on) | Parity claimed; minor store-fee delta | Health & Fitness |
| **Youper** | 7-day trial, AI chat | — (annual-only) | $69.99 | Mood insights, advanced CBT, personalized interventions | iOS-led; Android lagging | Health & Fitness |
| **Pi (Inflection)** | Fully free, rate-limited | n/a | n/a | Nothing user-facing; pivoted to enterprise API | iOS + Android + web, free everywhere | Productivity / no consumer tier |
| **Headspace** | Few intro meditations | $12.99 (7-day trial) | $69.99 (14-day trial); Family $99.99/yr | Full meditation library, sleepcasts, courses | Parity | Health & Fitness |
| **Calm** | Daily Calm preview | ~$14.99 | $49.99 (14-day trial); ~$69.99 region-variant | Sleep stories, masterclasses, music | Parity | Health & Fitness |
| **Stoic** | Core journal, prompts | $9.99 | $89.99 (~$3.33/mo equiv via promos) | AI analysis of entries, guided journals, breathing, meditation | Parity | Health & Fitness |
| **Daylio** | Mood entries, basic stats | $4.99 | $35.99 (7-day trial) | Unlimited custom moods, exports, themes, advanced stats | Parity | Health & Fitness |
| **Reflectly** | Limited entries, ads | $9.99 (iOS) / $4.99 (Android) | $59.99 (iOS) / $19.99 (Android) | AI insights, full prompts, themes, exports | **Major Android/iOS delta** | Health & Fitness |
| **Finch** | Pet, daily check-in, basic reflections | $9.99 | $69.99 (Android) / **$14.99 (iOS)** | Themes, advanced pet customization, deeper reflections | **Severe iOS/Android delta — iOS 78% cheaper annual** | Health & Fitness |

## 2. Positioning Cluster Analysis

Engram's stated positioning: **"quiet companion for inner life,
archetype-driven, daily check-in."**

Three structural axes:
- **A. Companion-as-character** (vs. raw tool) — Replika, Pi, Finch, Engram
- **B. Daily-check-in cadence** (vs. on-demand) — Finch, Stoic, Reflectly, Daylio, Engram
- **C. Inner-life / reflective tone** (vs. clinical CBT) — Stoic, Reflectly, Pi, Engram

### Closest 3 (intersection ≥ 2 axes with Engram)

1. **Finch** — A + B. Pet archetype, daily check-in loop, gentle tone.
   Differs: cartoon pet vs. archetype framing. Strongest cadence overlap.
2. **Stoic** — B + C. Philosophical archetype, daily journal cadence, AI
   reflection. Differs: solo-author tone vs. companion presence. Strongest
   tone overlap.
3. **Reflectly** — B + C. AI diary, daily prompt rhythm, mood archetype.
   Differs: thinner companion layer. Strongest cadence-tone hybrid.

Replika is *adjacent* (A only) — too romantic/avatar-heavy to be a direct
positioning collision. Pi is *adjacent* (A + C) but free-forever and
post-pivot — not a pricing comp.

## 3. Pricing-Band Recommendation (for mythos-kisame token-budget cross-check)

**Recommended Engram pricing:**

- **Free tier:** 30 IRIS turns/day, 3 archetype check-ins/week, 30-day
  journal history, no export.
- **Paid monthly:** **$9.99** (matches Stoic, Reflectly-iOS, Finch).
- **Paid annual:** **$59.99** (matches Reflectly-iOS, undercuts Replika
  $69.99 / Headspace $69.99 / Finch-Android $69.99).
- **Trial:** 7-day free trial on annual.
- **Store category:** Health & Fitness (consistent with cluster).

### Rationale (first-principles, not by analogy)

- **Cluster floor: $4.99/mo** (Daylio, Reflectly-Android). These are
  utility-grade — Engram is companion-grade, should not anchor here.
- **Cluster ceiling: $19.99/mo / $79.99/mo** (Replika, Wysa-coaching).
  Includes voice/human-coach features Engram does not ship Phase 1.
- **Median companion-grade: $9.99/mo, $59-70/yr.** Engram fits this band.
- **Annual discount:** ~50% (industry norm: Replika 71%, Wysa ~80% off
  monthly-equiv, Stoic 25%, Finch 42%). $59.99/yr = 50% off monthly-equiv,
  middle of pack.

### Free-tier sizing (30 IRIS turns/day) — token-budget brief for kisame

- 30 turns × ~400 tokens output avg (Sonnet 4.6) = 12k output tok/user/day.
- 30 days = 360k tok/month/free user.
- At Sonnet 4.6 output rate, must validate ceiling per ARPU break-even.
- **kisame: cross-check that 30 turns/day is sustainable given expected
  free-to-paid conversion (industry baseline ~3-7% for wellness apps).**

## 4. Inflation / Hype Flags

- **Replika**: aggressive Black Friday discounting (50% off cited) — sticker
  price soft; effective ARPU likely lower than $69.99/yr.
- **Pi**: "free" not durable — Inflection pivoted to enterprise post-2024
  Microsoft talent move; consumer tier on borrowed time.
- **Wysa**: $79.99/mo coaching is human-therapist add-on, not pure-AI;
  apples-to-oranges with Engram.
- **Reflectly / Finch**: severe iOS/Android pricing asymmetry — likely
  policy-driven (Google Play vs. App Store fee structures + market-tier
  pricing). Engram should decide parity stance pre-launch.
- **Stoic $89.99/yr**: high annual but discounted to "$3.33/mo" via promos —
  list price is theatre.

## 5. Epistemic Boundary

This sweep ran without WebFetch (denied this pass) and without App Store /
Play Store API access. All numbers verified against 2026-dated review +
help-center sources via WebSearch. Re-verify pricing on the actual
purchase flow before locking in Engram's StoreKit / Play Billing config.
Senrigan sees the past-and-present surface; precognition is not in scope.

— Eida
