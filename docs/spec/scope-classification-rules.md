# Scope Classification Rules

## Scope Creep Ledger
### First Commit Hackathon

---

## 1. Purpose

This document defines the rules the system uses to classify project conversation messages against the **original project scope**.

Every relevant message must be classified into exactly one of four categories:

1. **IN-SCOPE**
2. **NEW-ASK / SCOPE-EXPANSION**
3. **CLARIFICATION**
4. **OFF-TOPIC**

The classification is performed by Amazon Bedrock.

The purpose of these rules is to make classification consistent, explainable, and auditable rather than relying on vague interpretation.

---

# 2. Core Principle

The system must always evaluate a message **against the original agreed scope**.

The question is not:

> "Does this message sound like extra work?"

The question is:

> **"Does this message request work that was not included in the original scope?"**

The original scope is the baseline.

Conversation messages provide evidence of what was subsequently discussed or requested.

---

# 3. Classification Priority

When a message could appear to belong to multiple categories, apply the following priority:

```text
1. NEW-ASK / SCOPE-EXPANSION
2. CLARIFICATION
3. IN-SCOPE
4. OFF-TOPIC
```

However, priority alone must not override the actual meaning of the message.

The model must consider the surrounding conversation when necessary.

---

# 4. Category 1 — IN-SCOPE

## Definition

A message is **IN-SCOPE** when it discusses, requests, confirms, reviews, or modifies work that is already covered by the original project scope.

The message does not introduce a materially new deliverable or additional requirement.

---

## Examples

### Original scope

```text
Redesign homepage and 3 internal pages.
```

### Message

```text
Can you update the homepage layout?
```

### Classification

```text
IN-SCOPE
```

Reason:

The homepage redesign was already explicitly included.

---

### Example 2

Original scope:

```text
One revision round.
```

Message:

```text
Can you apply the changes from our revision notes?
```

Classification:

```text
IN-SCOPE
```

---

### Example 3

Original scope:

```text
Responsive design for the website.
```

Message:

```text
Can you fix the spacing on mobile?
```

Classification:

```text
IN-SCOPE
```

---

## IN-SCOPE Indicators

Messages are likely to be in-scope when they:

- Discuss existing deliverables
- Request changes within agreed requirements
- Ask about existing functionality
- Provide feedback on agreed work
- Confirm existing requirements
- Discuss implementation details of existing scope

---

# 5. Category 2 — NEW-ASK / SCOPE-EXPANSION

## Definition

A message is **NEW-ASK / SCOPE-EXPANSION** when it introduces a new deliverable, feature, requirement, revision, integration, platform, or other work that is not included in the original scope.

This is the primary category the product is designed to detect.

---

## Examples

### Example 1

Original scope:

```text
Redesign homepage and 3 internal pages.
No backend development.
```

Message:

```text
Can you also add a login system?
```

Classification:

```text
NEW-ASK / SCOPE-EXPANSION
```

Reason:

Backend/login functionality was explicitly outside the original scope.

---

### Example 2

Original scope:

```text
One revision round.
```

Conversation:

```text
Client:
Can we do another revision?
```

Classification:

```text
NEW-ASK / SCOPE-EXPANSION
```

Reason:

The original scope allows only one revision round.

---

### Example 3

Original scope:

```text
Website redesign.
```

Message:

```text
Can you also create a new logo for us?
```

Classification:

```text
NEW-ASK / SCOPE-EXPANSION
```

Reason:

Logo creation is a new deliverable not identified in the original scope.

---

### Example 4

Original scope:

```text
Website redesign.
```

Message:

```text
Can you integrate Google Analytics too?
```

Classification:

```text
NEW-ASK / SCOPE-EXPANSION
```

Reason:

The analytics integration introduces additional technical work.

---

# 6. Important Rule — Explicit Exclusions

If the original scope explicitly excludes something, a later request for that item is automatically strong evidence of scope expansion.

Example:

```text
Original Scope:
Website redesign.
No backend work.
```

Later:

```text
Can you add a login system?
```

Classification:

```text
NEW-ASK / SCOPE-EXPANSION
```

The model should give high confidence because the original agreement explicitly excluded backend work.

---

# 7. Important Rule — Scope Limits

A request can become scope expansion because it exceeds a quantitative limit in the original agreement.

Examples:

```text
Original:
1 revision round
```

Later:

```text
Can we have revision round #2?
```

→ **NEW-ASK**

---

```text
Original:
3 pages
```

Later:

```text
Can you create two additional pages?
```

→ **NEW-ASK**

---

```text
Original:
2 weeks
```

A request for substantial additional work outside the agreed deliverables should be treated as potential scope expansion even if the requested feature itself sounds related to the project.

---

# 8. Category 3 — CLARIFICATION

## Definition

A message is **CLARIFICATION** when it seeks information, confirmation, explanation, or clarification about existing scope without requesting additional work.

A clarification should not create a scope-creep ledger entry.

---

## Examples

### Example 1

Original scope:

```text
Redesign homepage.
```

Message:

```text
Does the homepage redesign include the hero section?
```

Classification:

```text
CLARIFICATION
```

---

### Example 2

Message:

```text
Which three internal pages are included?
```

Classification:

```text
CLARIFICATION
```

---

### Example 3

Message:

```text
Are we still using the design from the proposal?
```

Classification:

```text
CLARIFICATION
```

---

# 9. Clarification vs New Ask

This distinction is important.

### Clarification

```text
Does the homepage redesign include the hero section?
```

The user is asking what the existing scope means.

→ **CLARIFICATION**

### New Ask

```text
Can you also design a new hero section?
```

The user is requesting additional work.

→ **NEW-ASK / SCOPE-EXPANSION**

The model should distinguish between **asking about existing work** and **requesting new work**.

---

# 10. Category 4 — OFF-TOPIC

## Definition

A message is **OFF-TOPIC** when it does not contain information relevant to project scope, project requirements, or scope expansion.

Off-topic messages should not appear in the scope-creep ledger.

---

## Examples

```text
Are we still meeting tomorrow?
```

→ OFF-TOPIC

---

```text
Thanks, have a great weekend!
```

→ OFF-TOPIC

---

```text
I'll send the payment tomorrow.
```

→ OFF-TOPIC

---

```text
Sorry, I was in another meeting.
```

→ OFF-TOPIC

---

# 11. Context Matters

A message should not always be classified in isolation.

Conversation context can change the meaning of a request.

Example:

```text
Original Scope:
Redesign homepage.
```

Conversation:

```text
Client:
The button looks too large.

Freelancer:
I'll adjust it.

Client:
Can you make it blue instead?
```

The final message is likely:

```text
IN-SCOPE
```

because it is part of an existing design revision.

---

However:

```text
Original Scope:
Redesign homepage.
```

Conversation:

```text
Client:
Can you also build a mobile app?
```

→ **NEW-ASK / SCOPE-EXPANSION**

The request introduces a new deliverable.

---

# 12. Do Not Use Keywords Alone

Classification must not rely on individual keywords.

For example:

```text
"Can you change the color?"
```

does not automatically mean scope creep.

The system must determine whether visual styling was included in the original scope.

Similarly:

```text
"Can we add this?"
```

does not automatically mean scope creep.

The model needs enough context to understand what "this" refers to.

---

# 13. Evidence Requirement

Every **NEW-ASK / SCOPE-EXPANSION** classification must preserve the original message as evidence.

The system should retain:

```text
Message
Timestamp
Requester
Classification
Confidence
```

The AI should not replace the original message with only a generated summary.

---

# 14. Confidence Rules

Every classification should contain a confidence score.

Conceptually:

```text
0.00 ─────────────────────────── 1.00
Low                              High
```

The exact production threshold will be defined during the Bedrock prompt and JSON schema phase.

For the MVP:

```text
High confidence
→ Automatically classified

Low confidence
→ Flagged for human review
```

The system must never silently treat an uncertain classification as fact.

---

# 15. Human Review Rules

Messages should be flagged for review when:

- The classification confidence is below the configured threshold.
- The original scope is too vague to make a reliable decision.
- The message depends heavily on missing conversation context.
- The message could reasonably be interpreted as either clarification or new work.
- The requested work cannot clearly be mapped to an existing scope item.

Example:

```text
Original:
Homepage redesign.

Message:
Can we revisit the homepage again?
```

Possible interpretations:

```text
IN-SCOPE
```

or

```text
NEW-ASK
```

If the conversation does not provide enough evidence, the system should return:

```text
FLAGGED FOR REVIEW
```

rather than guessing.

---

# 16. Classification Decision Process

The model should conceptually follow this decision tree:

```text
                    MESSAGE
                       │
                       ▼
             Is it relevant to
                the project?
                /          \
              NO            YES
              │              │
              ▼              ▼
         OFF-TOPIC     Does it request
                       additional work?
                         /        \
                       YES         NO
                       │            │
                       ▼            ▼
                   NEW-ASK     Is it asking
                               for clarification?
                                /       \
                              YES        NO
                              │           │
                              ▼           ▼
                        CLARIFICATION  IN-SCOPE
```

Context should be consulted whenever the answer is ambiguous.

---

# 17. Special Cases

## Case A — Request already included in scope

```text
Original:
Responsive website.

Message:
Can you make the page work on mobile?
```

→ **IN-SCOPE**

---

## Case B — Request explicitly excluded

```text
Original:
No backend development.

Message:
Can you add user authentication?
```

→ **NEW-ASK / SCOPE-EXPANSION**

---

## Case C — Exceeding a limit

```text
Original:
One revision round.

Message:
Can we do another revision after this?
```

→ **NEW-ASK / SCOPE-EXPANSION**

---

## Case D — Asking about the limit

```text
How many revision rounds are included?
```

→ **CLARIFICATION**

---

## Case E — Existing work discussed casually

```text
The homepage button still looks too big.
```

→ Usually **IN-SCOPE** if the button belongs to the existing homepage redesign.

---

## Case F — Ambiguous request

```text
Can we add one more thing?
```

Without sufficient context:

→ **FLAGGED FOR REVIEW**

The system should not automatically classify this as scope creep.

---

# 18. Freelancer vs Client Messages

The system should retain the requester/sender when available.

A scope-expansion request may originate from:

- Client
- Freelancer
- Other project participant

The classification should primarily depend on **what the message means relative to scope**, not simply who sent it.

However, the requester must be preserved in the ledger because it is useful evidence.

---

# 19. Multiple Messages for One Request

A single scope expansion may span several messages.

Example:

```text
Client:
Can we add login?

Freelancer:
Do you mean email/password login?

Client:
Yes, exactly.
```

These messages describe one potential scope-expansion request.

The system should avoid creating three separate ledger items.

The implementation should group related messages where sufficient context exists.

The final ledger should represent the **scope-expansion item**, while retaining the relevant original message evidence.

---

# 20. Do Not Double-Count Scope Creep

If the same request appears repeatedly in a conversation, it should not automatically become multiple scope-creep items.

Example:

```text
Client:
Can we add analytics?

Later:

Client:
Any update on analytics?

Later:

Client:
Did you finish the analytics integration?
```

These refer to one scope-expansion item.

The ledger should ideally contain:

```text
Analytics integration
```

rather than:

```text
Analytics integration
Analytics integration
Analytics integration
```

The exact deduplication implementation will be defined during the backend design phase.

---

# 21. Classification Output Requirements

For each analyzed message or grouped request, the AI should provide enough information for the application to make a deterministic decision.

Minimum conceptual output:

```json
{
  "classification": "new-ask",
  "confidence": 0.94,
  "reason": "Login functionality was not included in the original scope."
}
```

For scope-expansion items, the system should additionally support an effort estimate:

```json
{
  "classification": "new-ask",
  "confidence": 0.94,
  "reason": "Login functionality was not included in the original scope.",
  "estimated_hours": 3
}
```

The exact production JSON schema will be finalized in the next deliverable.

---

# 22. Classification Examples

| Original Scope | Message | Classification |
|---|---|---|
| Homepage redesign | Update homepage spacing | IN-SCOPE |
| Homepage redesign | Can you also build an admin panel? | NEW-ASK |
| One revision | Can we have revision #2? | NEW-ASK |
| 3 pages | Which pages are included? | CLARIFICATION |
| Website redesign | Does mobile responsive work include tablets? | CLARIFICATION |
| Website redesign | Can you add Google Analytics? | NEW-ASK |
| No backend | Can you add login functionality? | NEW-ASK |
| Website redesign | Thanks, I'll review this tonight. | OFF-TOPIC |
| Homepage redesign | Can you revisit the homepage? | CONTEXT-DEPENDENT |
| Homepage redesign | Can we add one more thing? | FLAGGED FOR REVIEW |

---

# 23. What Creates a Ledger Entry?

Only a confirmed:

```text
NEW-ASK / SCOPE-EXPANSION
```

should create a scope-creep ledger item.

Therefore:

```text
IN-SCOPE
     ↓
No ledger entry

CLARIFICATION
     ↓
No ledger entry

OFF-TOPIC
     ↓
No ledger entry

NEW-ASK
     ↓
Ledger entry
```

Low-confidence NEW-ASK classifications should first go through human review.

---

# 24. Reliability Principle

The system should optimize for **trust over maximum detection**.

It is better to say:

> "This message needs your review."

than to incorrectly tell a freelancer:

> "Your client requested $500 of additional work."

Therefore, ambiguous classifications should be surfaced rather than silently guessed.

---

# 25. Definition of Done

The Scope Classification Rules deliverable is complete when:

- [ ] Four classification categories are clearly defined.
- [ ] IN-SCOPE rules are defined.
- [ ] NEW-ASK / SCOPE-EXPANSION rules are defined.
- [ ] CLARIFICATION rules are defined.
- [ ] OFF-TOPIC rules are defined.
- [ ] Explicit exclusions are handled.
- [ ] Scope limits are handled.
- [ ] Context-dependent messages are handled.
- [ ] Keyword-only classification is prohibited.
- [ ] Evidence requirements are defined.
- [ ] Confidence behavior is defined.
- [ ] Human review behavior is defined.
- [ ] Duplicate scope requests are addressed.
- [ ] Multiple-message requests are addressed.
- [ ] Classification output requirements are defined.
- [ ] Ledger-entry rules are defined.

---

## Core Rule to Carry Into Bedrock

> **Compare every request against the original scope, use conversation context when necessary, preserve the original evidence, and never guess when the available evidence is insufficient.**