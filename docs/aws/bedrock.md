# Amazon Bedrock Service Guide

## 1. Why We Need It
Scope Creep Ledger needs to analyze complex human conversations and compare them against an agreed project scope contract. Client messages are informal, messy, and context-dependent. Amazon Bedrock provides foundation AI models (like Claude 3 Haiku/Sonnet) that can understand natural language intent, judge scope boundaries, and estimate required extra effort.

## 2. What It Does
Amazon Bedrock is a fully managed AWS service that offers high-performing foundation models via a unified API. In our application:
- It acts as the **Language Judgment Engine**.
- It evaluates chronological message batches against baseline project scope.
- It outputs strict JSON containing categories (`in-scope`, `new-ask`, `clarification`, `off-topic`), confidence scores (0.0 to 1.0), and estimated hours.

## 3. What We Need to Create
1. Verify model availability in AWS Console (Bedrock models are now **automatically enabled** on first invocation across all AWS commercial regions).
2. For Anthropic models (Claude), submit initial use-case details if prompted by AWS upon first use.
3. An IAM Policy / User permissions allowing `bedrock:InvokeModel`.

## 4. AWS Console Steps (Updated AWS Behavior)
> **Note on AWS UI Update**: AWS retired the legacy "Model access" page. Foundation models are now automatically enabled across commercial regions upon first invocation.

1. Log into your AWS Management Console.
2. Set your console region to `us-east-1` (N. Virginia) or `us-west-2` (Oregon).
3. Search for **Bedrock** in the top search bar and open the Amazon Bedrock console.
4. In the left navigation menu under **Foundation models**, click **Model catalog** or **Playgrounds** -> **Text**.
5. Select **Anthropic** -> **Claude 3 Haiku** (or **Claude 3.5 Haiku**).
6. If AWS displays a one-time prompt asking for use-case details (Company Name / Intended Use), fill out the short form and submit.
7. You can test a quick prompt in the Playground to verify model response.

## 5. Configuration
In your `.env` file (copied from `.env.example`):
```env
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

## 6. IAM / Permissions
Your AWS IAM User or Lambda Execution Role requires the following minimal policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    }
  ]
}
```

## 7. Environment Variables
- `AWS_REGION`: AWS datacenter region (e.g. `us-east-1`).
- `BEDROCK_MODEL_ID`: Anthropic Claude model ID.
- `CONFIDENCE_THRESHOLD`: Threshold for low-confidence flagging (default: `0.70`).
- `MOCK_BEDROCK`: (Optional) Set to `true` to run offline without calling live AWS Bedrock.

## 8. Local Development
For local testing:
- **Offline / Mock Mode**: Set `MOCK_BEDROCK=true` or run tests without AWS keys. The classifier will use local deterministic mock classification heuristics.
- **Live AWS Mode**: Configure local AWS credentials using AWS CLI (`aws configure`) or standard environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

## 9. Verification
Run the automated classifier test:
```bash
npx tsx services/analyze/src/classifier.test.ts
```

## 10. Common Errors
- `AccessDeniedException`: Your IAM user lacks `bedrock:InvokeModel` permissions.
- `ValidationException`: Incorrect `BEDROCK_MODEL_ID` format or unsupported model in selected region.
- `ResourceNotFoundException`: Model not available in the specified `AWS_REGION`.

## 11. Security Notes
- **NEVER** expose AWS credentials to browser code.
- Bedrock API calls must strictly be invoked server-side inside AWS Lambda or backend services.

## 12. Project Integration
- Used by `services/analyze/src/classifier.ts` during conversation analysis.
- Used by `services/change-order` during change-order email generation.

## 13. Cleanup
Amazon Bedrock is pay-per-request (serverless inference). There are no hourly infrastructure costs when idle.
