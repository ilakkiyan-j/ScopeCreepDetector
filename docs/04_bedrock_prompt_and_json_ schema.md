# Bedrock Prompt & JSON Schema

## Scope Creep Ledger
### First Commit Hackathon

---

# 1. Purpose

This document defines the Amazon Bedrock prompt, classification instructions, response structure, confidence handling, and effort-estimation requirements for **Scope Creep Ledger**.

The Bedrock service is responsible for interpreting natural-language project conversations and determining whether messages represent:

- `in-scope`
- `new-ask`
- `clarification`
- `off-topic`

Bedrock provides **judgment and interpretation**.

The application code remains responsible for:

- Maintaining the authoritative ledger
- Persisting data
- Calculating costs
- Applying confidence thresholds
- Handling user approval/rejection
- Producing final totals

---

# 2. AI Responsibility

The model receives:

```text
Original Project Scope
        +
Conversation Messages
        +
Relevant Conversation Context
```

The model returns:

```text
Classification
+
Confidence
+
Reason
+
Estimated Effort
```

The model must not:

- Invent project requirements
- Assume unstated scope
- Modify the original scope
- Calculate the authoritative financial total
- Silently resolve ambiguous cases

---

# 3. Classification Labels

The model must use exactly one of these four labels:

```text
in-scope
new-ask
clarification
off-topic
```

No other classification values should be returned.

---

# 4. Classification Definitions

## `in-scope`

Use when the message discusses, requests, reviews, confirms, or modifies work already included in the original project scope.

Example:

```text
Original Scope:
Redesign homepage.

Message:
Can you change the homepage button spacing?
```

Output:

```text
in-scope
```

---

## `new-ask`

Use when the message introduces work that is not included in the original scope.

Examples:

```text
Original Scope:
Website redesign.

Message:
Can you also add Google Analytics?
```

or:

```text
Original Scope:
One revision round.

Message:
Can we have another revision?
```

Output:

```text
new-ask
```

---

## `clarification`

Use when the message asks for clarification, confirmation, or explanation about existing scope without requesting additional work.

Example:

```text
Original Scope:
Redesign homepage and three pages.

Message:
Which three pages are included?
```

Output:

```text
clarification
```

---

## `off-topic`

Use when the message is unrelated to project requirements or scope.

Example:

```text
Are we still meeting tomorrow?
```

Output:

```text
off-topic
```

---

# 5. System Prompt

The following prompt is the baseline system instruction for the classification model.

```text
You are the scope analysis engine for Scope Creep Ledger.

Your task is to compare project conversation messages against the ORIGINAL PROJECT SCOPE and determine whether each message is:

1. in-scope
2. new-ask
3. clarification
4. off-topic

The ORIGINAL PROJECT SCOPE is the authoritative baseline.

A message is "new-ask" only when it requests work that is not included in the original scope, including work that violates an explicit exclusion or exceeds an explicit scope limit.

A message is "in-scope" when it concerns work already covered by the original scope.

A message is "clarification" when it asks about, confirms, or explains existing scope without requesting additional work.

A message is "off-topic" when it is unrelated to the project scope or requirements.

Use conversation context when necessary. Do not classify messages using keywords alone.

Do not assume that a request is scope creep simply because it sounds like a request.

Do not invent requirements that are not present in the original scope or conversation.

If the meaning of a message cannot be determined reliably from the available context, reduce the confidence score.

Preserve the meaning of the original message.

For messages classified as "new-ask", provide a concise explanation of why the request is outside the original scope.

For "new-ask" messages, provide a rough estimated number of additional work hours when reasonably possible.

The estimated hours are only an estimate. Do not calculate the project's authoritative total cost.

Return ONLY valid JSON matching the specified schema.
```

---

# 6. Input Structure

The Lambda should provide the model with clearly separated information.

Conceptually:

```text
ORIGINAL PROJECT SCOPE
----------------------
{original_scope}

CONVERSATION CONTEXT
--------------------
{context}

MESSAGES TO CLASSIFY
--------------------
{messages}
```

The original scope must be clearly identified as the baseline.

---

# 7. Batch Processing

Messages should be processed in batches rather than making one Bedrock request for every message.

Example:

```text
200 messages
     ↓
Batch 1 → 20 messages
Batch 2 → 20 messages
Batch 3 → 20 messages
...
     ↓
Bedrock
```

The actual batch size should be determined through testing based on:

- Context limits
- Classification accuracy
- Latency
- Token usage
- Cost

The application must ensure that enough surrounding context is provided for ambiguous messages.

---

# 8. Message Context

Each message should contain an identifier so the result can be matched back to the original conversation.

Example input:

```json
{
  "messages": [
    {
      "message_id": "msg_001",
      "timestamp": "2026-03-04T10:30:00Z",
      "sender": "Client",
      "text": "Can you also add a login page?"
    }
  ]
}
```

The model should return the same `message_id`.

---

# 9. JSON Response Schema

The expected response structure is:

```json
{
  "results": [
    {
      "message_id": "msg_001",
      "classification": "new-ask",
      "confidence": 0.94,
      "reason": "Login functionality was not included in the original project scope.",
      "estimated_hours": 3
    }
  ]
}
```

---

# 10. JSON Field Definitions

## `message_id`

Type:

```text
string
```

Purpose:

Identifies the original message being classified.

Requirement:

The value must exactly match the input message ID.

---

## `classification`

Type:

```text
string
```

Allowed values:

```text
in-scope
new-ask
clarification
off-topic
```

No other values are permitted.

---

## `confidence`

Type:

```text
number
```

Range:

```text
0.0 – 1.0
```

Meaning:

Represents the model's confidence in the classification.

Example:

```text
0.95 → high confidence
0.72 → moderate confidence
0.48 → low confidence
```

The application, not Bedrock, will determine the actual review threshold.

---

## `reason`

Type:

```text
string
```

Purpose:

Provides a concise explanation for the classification.

Example:

```text
"Analytics integration was not included in the original scope."
```

The reason should be based on available evidence.

The model should not invent missing contractual details.

---

## `estimated_hours`

Type:

```text
number | null
```

Purpose:

Provides a rough estimate of additional work.

For example:

```text
3
```

For messages where effort estimation is not applicable:

```json
null
```

Examples:

```text
in-scope → null
clarification → null
off-topic → null
new-ask → estimated value when possible
```

---

# 11. Recommended JSON Schema

The application should validate Bedrock responses against a strict schema equivalent to:

```json
{
  "type": "object",
  "required": ["results"],
  "additionalProperties": false,
  "properties": {
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "message_id",
          "classification",
          "confidence",
          "reason",
          "estimated_hours"
        ],
        "additionalProperties": false,
        "properties": {
          "message_id": {
            "type": "string"
          },
          "classification": {
            "type": "string",
            "enum": [
              "in-scope",
              "new-ask",
              "clarification",
              "off-topic"
            ]
          },
          "confidence": {
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "reason": {
            "type": "string"
          },
          "estimated_hours": {
            "type": ["number", "null"],
            "minimum": 0
          }
        }
      }
    }
  }
}
```

The Lambda should reject responses that do not conform to this structure.

---

# 12. Example — In-Scope

### Original Scope

```text
Redesign homepage and three internal pages.
```

### Message

```text
Can you adjust the homepage spacing?
```

### Expected Response

```json
{
  "results": [
    {
      "message_id": "msg_001",
      "classification": "in-scope",
      "confidence": 0.96,
      "reason": "The homepage redesign is explicitly included in the original scope.",
      "estimated_hours": null
    }
  ]
}
```

---

# 13. Example — New Ask

### Original Scope

```text
Redesign homepage and three internal pages.
No backend development.
```

### Message

```text
Can you also add a login system?
```

### Expected Response

```json
{
  "results": [
    {
      "message_id": "msg_002",
      "classification": "new-ask",
      "confidence": 0.98,
      "reason": "Login functionality requires backend work, which is explicitly excluded from the original scope.",
      "estimated_hours": 4
    }
  ]
}
```

---

# 14. Example — Revision Limit

### Original Scope

```text
One revision round.
```

### Message

```text
Can we do another revision after this?
```

### Expected Response

```json
{
  "results": [
    {
      "message_id": "msg_003",
      "classification": "new-ask",
      "confidence": 0.97,
      "reason": "The original scope includes only one revision round, while this request asks for an additional revision.",
      "estimated_hours": 1.5
    }
  ]
}
```

---

# 15. Example — Clarification

### Original Scope

```text
Redesign homepage and three internal pages.
```

### Message

```text
Which three internal pages are included?
```

### Expected Response

```json
{
  "results": [
    {
      "message_id": "msg_004",
      "classification": "clarification",
      "confidence": 0.98,
      "reason": "The message asks for clarification about the existing scope and does not request additional work.",
      "estimated_hours": null
    }
  ]
}
```

---

# 16. Example — Off-Topic

### Message

```text
Are we still meeting tomorrow?
```

### Expected Response

```json
{
  "results": [
    {
      "message_id": "msg_005",
      "classification": "off-topic",
      "confidence": 0.99,
      "reason": "The message does not concern project scope or requirements.",
      "estimated_hours": null
    }
  ]
}
```

---

# 17. Example — Ambiguous Message

### Original Scope

```text
Homepage redesign.
```

### Message

```text
Can we revisit the homepage again?
```

If context is insufficient:

```json
{
  "results": [
    {
      "message_id": "msg_006",
      "classification": "in-scope",
      "confidence": 0.52,
      "reason": "The message refers to the existing homepage but does not clearly indicate whether additional work beyond the agreed redesign is requested.",
      "estimated_hours": null
    }
  ]
}
```

The important point is the **low confidence**.

The application can then apply its review threshold:

```text
confidence < threshold
        ↓
Flag for Review
```

The model does not need a fifth classification called `review`.

---

# 18. Ambiguity Handling

The model should reduce confidence when:

- The original scope is vague.
- The message depends on missing context.
- A pronoun or reference is unclear.
- A request could reasonably be interpreted as either existing work or additional work.
- The conversation contains conflicting information.
- The model cannot establish whether the requested feature already exists in scope.

The system should prefer:

```text
Lower confidence + Human Review
```

over:

```text
False certainty
```

---

# 19. Effort Estimation Rules

The model may estimate effort for `new-ask` items.

Estimates should be:

- Rough
- Conservative
- Expressed in hours
- Based only on the described work
- Marked as uncertain through the classification confidence

The model should not pretend to know exact implementation effort when the request lacks sufficient detail.

Example:

```text
"Add Google Analytics"

estimated_hours:
1–3 hours
```

However, because the MVP schema uses a single numeric value, the model should provide a reasonable midpoint estimate when possible.

The UI should present these values as:

> **Estimated hours**

not guaranteed billing hours.

---

# 20. Cost Calculation Boundary

Bedrock must not calculate the authoritative financial total.

For example, if:

```text
estimated_hours = 3
billing_rate = $60
```

Bedrock may return:

```text
estimated_hours = 3
```

Lambda calculates:

```text
3 × 60 = $180
```

For multiple items:

```text
3 + 4 + 3 = 10 hours

10 × $60 = $600
```

The final total is therefore deterministic.

---

# 21. Response Validation

After receiving a Bedrock response, Lambda should validate:

### Structural validation

- Valid JSON
- `results` exists
- Every message has a result
- No unexpected fields

### Classification validation

Classification must be one of:

```text
in-scope
new-ask
clarification
off-topic
```

### Confidence validation

```text
0 ≤ confidence ≤ 1
```

### Effort validation

```text
estimated_hours >= 0
```

or:

```text
null
```

### Message ID validation

Returned message IDs must correspond to messages sent to Bedrock.

---

# 22. Invalid Response Handling

If Bedrock returns an invalid response:

```text
Bedrock
   ↓
Invalid JSON / Schema
   ↓
Lambda validation
   ↓
Reject response
   ↓
CloudWatch log
   ↓
Retry or return controlled error
```

The application must not insert an unvalidated AI response directly into the authoritative ledger.

---

# 23. Preventing Hallucinated Scope

The prompt must reinforce:

```text
Do not invent scope.
Do not assume scope.
Use only provided evidence.
```

For example, if the original scope says:

```text
Build a website.
```

and the client says:

```text
Can you add authentication?
```

The model should not assume:

> "Authentication is obviously included in a website."

It should evaluate the explicit information available.

If there is insufficient evidence, confidence should decrease.

---

# 24. Conversation Context Strategy

The model should receive enough context to resolve references.

Example:

```text
Message 1:
Client: Can you add analytics?

Message 2:
Freelancer: Sure, I'll check.

Message 3:
Client: And can you put it on the dashboard too?
```

Message 3 cannot reliably be interpreted without context.

The analysis pipeline should therefore provide relevant surrounding messages when required.

The exact context-window strategy will be finalized during implementation testing.

---

# 25. Duplicate Request Handling

Bedrock should focus on **classification and interpretation**.

Deduplication of repeated scope-expansion requests should primarily be handled by application logic.

Example:

```text
Message 1:
Can you add analytics?

Message 2:
Any update on analytics?

Message 3:
Is analytics finished?
```

These should not automatically create three separate financial ledger entries.

The application should determine whether multiple classified messages represent the same scope-expansion item.

---

# 26. Change-Order Email Prompt

A separate Bedrock prompt should be used for change-order generation.

Baseline instruction:

```text
You are a professional client-communication assistant.

Using the ORIGINAL PROJECT SCOPE and the VERIFIED SCOPE CREEP LEDGER, draft a concise and professional change-order email.

Only include scope-expansion items that have been verified by the user.

Do not invent work, costs, dates, or requirements.

Clearly distinguish the original agreement from the additional requested work.

Include the estimated additional effort and estimated additional cost when provided.

The tone should be professional, neutral, and collaborative.

The email should request confirmation or approval before treating the additional work as part of the agreed project scope.

Return only the email draft.
```

---

# 27. Change-Order Input

The change-order generation Lambda should provide:

```text
ORIGINAL PROJECT SCOPE
----------------------
{original_scope}

VERIFIED SCOPE CREEP ITEMS
--------------------------
{verified_ledger}

TOTAL ADDITIONAL HOURS
----------------------
{total_hours}

TOTAL ESTIMATED COST
--------------------
{total_cost}
```

Only verified ledger items should be passed into the final email prompt.

---

# 28. Change-Order Output Example

```text
Subject: Change Order — Additional Project Work

Hi John,

While reviewing the project requirements against our original scope, I identified a few additional items requested during the project:

• Login functionality
• Additional revision round
• Analytics integration

These items fall outside the original agreed scope.

The estimated additional effort is 7.5 hours, with an estimated additional cost of $450.

Please confirm if you'd like me to proceed with these items as additional project work.

Best,
Ilakkiyan
```

The generated email is a draft and must be reviewed by the user before being sent.

---

# 29. Model Behavior Principles

The model should follow these principles:

### Evidence over assumption

Use information present in the original scope and conversation.

### Context over keywords

Interpret the message based on its surrounding context.

### Conservative classification

Do not call something scope creep without sufficient evidence.

### Explainability

Every classification should include a concise reason.

### Uncertainty

Low-confidence decisions should be surfaced for human review.

### Separation of responsibilities

The model interprets language; application code manages authoritative state and calculations.

---

# 30. Definition of Done

The Bedrock Prompt & JSON Schema deliverable is complete when:

- [ ] System prompt is defined.
- [ ] Four classification labels are defined.
- [ ] Classification instructions are defined.
- [ ] Input structure is defined.
- [ ] Batch processing approach is defined.
- [ ] Context requirements are defined.
- [ ] JSON response structure is defined.
- [ ] JSON validation rules are defined.
- [ ] Confidence behavior is defined.
- [ ] Effort-estimation behavior is defined.
- [ ] Ambiguous-message handling is defined.
- [ ] Invalid-response handling is defined.
- [ ] Hallucination prevention rules are defined.
- [ ] Cost-calculation boundary is defined.
- [ ] Duplicate handling boundary is defined.
- [ ] Change-order generation prompt is defined.
- [ ] Example inputs and outputs are provided.

---

# 31. Final AI Architecture Principle

> **Bedrock interprets the conversation and provides structured judgments; Lambda validates those judgments, applies deterministic business rules, calculates the financial impact, and maintains the authoritative scope-creep ledger.**