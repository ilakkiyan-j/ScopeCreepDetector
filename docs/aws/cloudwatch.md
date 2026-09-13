# Amazon CloudWatch Service Guide

## 1. Why We Need It
Scope Creep Ledger uses Amazon CloudWatch for backend observability. It tracks execution latency, Bedrock call metrics, error tracebacks, and flagged low-confidence classifications (< 0.70) to ensure high reliability.

## 2. What It Does
Amazon CloudWatch collects operational logs, metrics, and events from AWS Lambda, Bedrock, and API Gateway.

## 3. Key Metrics Logged
Our application outputs structured JSON logs containing:
- `project_id`: Unique project identifier.
- `request_id`: API request ID.
- `message_count`: Total parsed messages in chat export.
- `classification_count`: Breakdown of `in-scope`, `new-ask`, `clarification`, `off-topic`.
- `new_ask_count`: Total scope expansion items detected.
- `low_confidence_count`: Number of items flagged for review (< 0.70 confidence).
- `bedrock_latency_ms`: Duration of Amazon Bedrock inference call in milliseconds.
- `error_type`: Error category if API request fails.

## 4. AWS Console Steps
1. Log into your AWS Management Console.
2. Search for **CloudWatch** in the top search bar and open the CloudWatch console.
3. In the left menu, click **Logs** -> **Log groups**.
4. Log groups for your Lambda functions (e.g. `/aws/lambda/scope-creep-analyze`) appear automatically.
5. Click on a log stream to inspect live structured JSON events.

## 5. Configuration
No separate installation required. Node.js `console.log(JSON.stringify(logPayload))` inside Lambda automatically streams structured logs directly into CloudWatch Log Groups.

## 6. IAM / Permissions
Lambda execution role automatically receives:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## 7. Verification
View application logs locally or in CloudWatch Log Stream.

## 8. Security Notes
- **DO NOT** log sensitive PII, raw passwords, or AWS secret access keys into CloudWatch logs.

## 9. Cleanup
CloudWatch log streams expire according to your retention policy (e.g. 7 days or 30 days).
