# Scope Creep Ledger
### First Commit Hackathon — Project Spec

---

## 1. The Problem

Freelancers and small agencies rarely lose money because a client refuses to pay an invoice. They lose money because scope quietly expands inside casual conversation:

- "Oh can you also just add a login page while you're in there"
- "Can we tweak the colors a bit"
- "One more small thing..."

None of this gets tracked against what was actually agreed to. By the time a project wraps, 20–40% more work has been done than was scoped — and there's no clean, defensible record to point to when invoicing or requesting a change order. The only current fix is manually re-reading the entire chat history, which nobody does. The work just gets absorbed for free.

**This is real, recurring, and currently pure manual re-reading** — the textbook conditions for an AI + reasoning tool.

---

## 2. Why This Is Different (Not Another Document-Risk-Flagger)

Most "AI reads your documents and flags risk" tools follow the same shape: single document in → extract → check against rules → flag. This project is structurally different:

> It's **cumulative state tracking over an unstructured, chronological, multi-topic stream**, anchored against one reference document (the original scope).

The hard part isn't reading one thing carefully — it's holding a moving target (a running ledger of "what's been agreed to so far") while wading through noise, and updating that target message by message. This is exactly why "just paste it into ChatGPT" doesn't work well: ChatGPT will summarize the *vibe* of a conversation but won't reliably produce a precise, auditable, running ledger with cost attached.

**Existing tools do X (single-document scope/contract review). We do Y (continuous scope-drift accounting across a live, messy conversation).**

---

## 3. Core Mechanic

### Input 1 — Original Scope (once, at setup)
A proposal, SOW, or even a rough typed bullet list:
> "Redesign homepage, 3 pages, no backend work, $2,000, 2 weeks."

### Input 2 — The Messy Part
Exported chat/email thread for the project (WhatsApp export, email chain, Slack export) — pasted or uploaded as `.txt`/`.csv`.

### Pipeline

1. **Bedrock — per-message classification**
   Each message (or small batch) is classified against the original scope into:
   - `in-scope`
   - `new-ask / scope-expansion`
   - `clarification`
   - `off-topic`

   This is the part that needs judgment — "can we just tweak the button color" reads differently depending on whether styling was ever in scope.

2. **Deterministic code — the ledger**
   Every message flagged `new-ask` is appended to a running list: timestamp, quoted request, requester. This is the audit trail — it must be exact and reproducible, so it's plain code, **not** another LLM summarization pass.

3. **Deterministic code — cost estimate**
   User provides an hourly/day rate once. Each new-ask item gets a rough time estimate (Bedrock can suggest one, but the arithmetic and running total are code, not model output). Ledger totals to: *"X hours / $Y of unbilled scope expansion."*

4. **Output — the ledger view**
   Two-panel UI: **Original Scope** (static, left) vs. **Scope Creep Log** (growing, right), with a running total and a one-click **"Generate change-order email"** (Bedrock drafts the ask from the ledger).

---

## 4. The Killer Demo Moment

Paste in a real (or realistic sample) 200-message WhatsApp export. In seconds:

```
Original scope: 3-page redesign, $2,000, 2 weeks

Scope creep detected — 6 items:
  • Login flow added            (Mar 4)
  • Extra revision round #2     (Mar 9)
  • Extra revision round #3     (Mar 15)
  • Mobile-specific redesign    (Mar 12)
  • New logo variant            (Mar 18)
  • Analytics integration       (Mar 20)

Estimated unbilled work: 11.5 hours (~$690 at your rate)
```

That's a 30-second "oh no, that's literally my life" reaction from any judge who has freelanced — and it's a precise, defensible artifact, not a vague "scope grew a bit" summary.

---

## 5. AWS Architecture (Lean, Nothing Forced)

| Layer | Service | Why |
|---|---|---|
| Frontend | Next.js + Tailwind, hosted on **Amplify** | Two-panel UI (scope vs. creep ledger), chat export upload |
| API | **API Gateway → Lambda** | One endpoint: ingest + batch-classify via Bedrock. One endpoint: ledger/cost calc (pure Lambda, no Bedrock) |
| AI | **Amazon Bedrock** | Structured JSON classification per message batch |
| Raw storage | **S3** | Raw chat export files |
| Structured storage | **DynamoDB** | Ledger items: message, date, classification, estimated hours — reloading a project is instant |
| Monitoring | **CloudWatch** | Logs classification confidence; low-confidence messages surfaced to the user instead of silently guessed |

**Explicitly skipped, and why:**
- **Cognito** — a session-keyed project ID is enough for a hackathon demo; no real auth need.
- **Step Functions** — this is a 2-endpoint pipeline, not a genuinely multi-stage workflow.
- **EventBridge** — nothing here is naturally scheduled; a chat thread isn't a periodic check.

---

## 6. Build Plan (4 Days)

| Day | Focus |
|---|---|
| **Day 1** | Core foundation: scope-input UI, chat upload, Bedrock classification returning JSON on a small sample thread. Prove message → classification works. |
| **Day 2** | Main intelligence/workflow: DynamoDB ledger persistence, cost math, two-panel comparison UI. This is the core deliverable — get it rock solid. |
| **Day 3** | AWS + reliability + deployment: deploy Amplify + API Gateway + Lambda for real. Handle messier real-world exports (emojis, multi-person threads, forwarded messages). Add low-confidence flagging backed by CloudWatch. |
| **Day 4** | Testing + polish + demo: "Generate change-order email" button, visual polish on the two-panel view, prep a realistic 200+ message sample thread for the live demo (don't rely on live parsing of a judge's own upload), rehearse the 3-minute script. |

---

## 7. Reliability Story

Classification accuracy on ambiguous messages is the real risk — e.g. "can we chat about the homepage again?" could be a new ask *or* just a clarification.

**Mitigation:** anything below a confidence threshold is never silently auto-classified. It goes into a **"flagged for your review"** bucket instead, shown explicitly in the UI. This becomes a feature, not a hidden failure mode — it's the demo's trust/reliability beat (judging rubric item: *"evidence, confidence, validation, error handling, or human approval where necessary"*).

---

## 8. Measurable Impact (for the demo close)

> "Reviewed a 200-message client thread, found 6 scope-expansion items a freelancer would likely have missed or forgotten to bill, and quantified $690 of unbilled work — in under 10 seconds, versus never (because nobody re-reads 200 messages)."

---

## 9. 3-Minute Demo Structure

| Time | Beat |
|---|---|
| 0:00–0:20 | The painful problem: every freelancer has absorbed free work from "just one more small thing" |
| 0:20–0:40 | Why existing tools fail: contract/document reviewers check one document once; nobody tracks drift across a live, messy conversation |
| 0:40–2:00 | Live product: paste original scope → paste 200-message thread → ledger populates → total appears → generate change-order email |
| 2:00–2:30 | AWS architecture walkthrough (Bedrock for judgment, deterministic Lambda for the ledger/math, CloudWatch for confidence flagging) |
| 2:30–2:50 | Impact: "$690 of unbilled work found in under 10 seconds" |
| 2:50–3:00 | Closing line: *"Every freelancer has a scope creep problem. Now they have a receipt for it."* |

---

## 10. Open Items Before Building

- [ ] Draft the Bedrock classification prompt + JSON schema (message → category + confidence)
- [ ] Decide batch size for classification calls (cost/latency tradeoff)
- [ ] Source or write 1–2 realistic sample chat threads for the demo (don't rely on live judge uploads)
- [ ] Define the confidence threshold for the "flagged for review" bucket
- [ ] Design the change-order email prompt (ledger → drafted email)
