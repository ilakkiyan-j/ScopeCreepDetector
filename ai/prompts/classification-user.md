# User Prompt Template: Scope Creep Message Classifier

## Baseline Project Scope Agreement
```text
{{ORIGINAL_SCOPE}}
```

## Messages to Analyze
Below is a batch of chronological messages from the client conversation.

```json
{{MESSAGES_JSON}}
```

## Expected Response Format
Respond ONLY with a raw JSON object conforming to this structure:
{
  "results": [
    {
      "message_id": "msg_001",
      "classification": "new-ask",
      "confidence": 0.95,
      "reason": "Explicit explanation comparing the request against baseline scope",
      "estimated_hours": 3.0
    }
  ]
}
