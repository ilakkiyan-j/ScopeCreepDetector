# Complete AWS Backend & Cloud Services Deployment Guide

This step-by-step master guide walks you through setting up all backend AWS cloud services for **Scope Creep Ledger** and connecting them to your live AWS Amplify frontend.

---

## Architecture Checklist
- [x] **Frontend**: AWS Amplify (`ap-southeast-2`) — Already deployed!
- [x] **Storage**: Amazon S3 bucket (`scope-creep-ledger-conversations-dev`)
- [x] **Database**: Amazon DynamoDB tables (`scope-creep-ledger-projects-dev` & `scope-creep-ledger-items-dev`)
- [x] **AI Model**: Amazon Bedrock (Anthropic Claude 3 Haiku / Claude 3.5 Haiku)
- [ ] **Permissions**: IAM Policies
- [ ] **Environment Variables**: Configure Amplify env vars to switch from offline mock to live AWS cloud execution

---

## Step 1 — Amazon S3 (Raw Conversation Storage)

### Purpose
Stores original raw chat export files (`.txt`, `.csv`) as immutable evidence.

### Setup Instructions
1. Open the **AWS Console** and search for **S3**.
2. Click **Create bucket**.
3. **Bucket Name**: `scope-creep-ledger-conversations-dev` *(If name is taken, add a unique suffix like `scope-creep-ledger-conversations-alex`)*.
4. **Region**: `us-east-1` (or your preferred region).
5. **Block Public Access**: Keep **Block *all* public access** checked (Private bucket).
6. Click **Create bucket**.

---

## Step 2 — Amazon DynamoDB (Database Setup)

### Purpose
Stores baseline project contracts and authoritative verified scope-creep receipts.

### Table 1: Projects Table
1. Search for **DynamoDB** in the AWS Console -> Click **Create table**.
2. **Table name**: `scope-creep-ledger-projects-dev`
3. **Partition key (PK)**: `id` (Type: `String`)
4. **Table class**: DynamoDB Standard
5. **Capacity mode**: On-demand (Pay-per-request)
6. Click **Create table**.

### Table 2: Ledger Items Table
1. Click **Create table** again.
2. **Table name**: `scope-creep-ledger-items-dev`
3. **Partition key (PK)**: `projectId` (Type: `String`)
4. **Sort key (SK)**: `id` (Type: `String`)
5. **Capacity mode**: On-demand
6. Click **Create table**.

---

## Step 3 — Amazon Bedrock (AI Model Activation)

### Purpose
Analyzes client messages against baseline scope agreements and drafts change-order emails.

### Setup Instructions
1. Change region in top right corner to **`us-east-1` (N. Virginia)** or **`us-west-2` (Oregon)**.
2. Search for **Bedrock** in AWS Console.
3. In left navigation, click **Playgrounds** -> **Text**.
4. Select **Anthropic** -> **Claude 3 Haiku** (or **Claude 3.5 Haiku**).
5. If AWS displays a quick one-time form asking for use-case details (Company Name / Intended Use), fill it out and click submit.
6. Test a quick prompt in Playground to confirm model response.

---

## Step 4 — AWS IAM Permissions

### Purpose
Grants backend services permission to interact with S3, DynamoDB, Bedrock, and CloudWatch.

### Policy Configuration (`ScopeCreepLedgerPolicy`)
1. Search for **IAM** in AWS Console -> Click **Policies** -> **Create policy**.
2. Select **JSON** tab and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvoke",
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    },
    {
      "Sid": "S3Storage",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::scope-creep-ledger-conversations-dev/*"
    },
    {
      "Sid": "DynamoDBDatabase",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/scope-creep-ledger-projects-dev",
        "arn:aws:dynamodb:*:*:table/scope-creep-ledger-items-dev"
      ]
    },
    {
      "Sid": "CloudWatchLogs",
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
3. Name policy `ScopeCreepLedgerBackendPolicy` -> Click **Create policy**.

---

## Step 5 — Connecting Backend Services to AWS Amplify

### Purpose
Configures live environment variables in AWS Amplify to switch from local mock mode to live AWS Cloud execution.

### Setup Instructions
1. Open **AWS Amplify Console** in `ap-southeast-2`.
2. Select your app `scope-creep-ledger-web`.
3. In left navigation menu, click **App settings** -> **Environment variables**.
4. Click **Manage variables** / **Add variable** and enter:

| Key | Value | Description |
| :--- | :--- | :--- |
| `APP_AWS_REGION` | `us-east-1` | AWS region where Bedrock, S3, & DynamoDB reside |
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-haiku-20240307-v1:0` | Anthropic Claude model ID |
| `S3_BUCKET_NAME` | `scope-creep-ledger-conversations-dev` | Target S3 bucket name |
| `DYNAMODB_PROJECTS_TABLE` | `scope-creep-ledger-projects-dev` | Projects table name |
| `DYNAMODB_LEDGER_TABLE` | `scope-creep-ledger-items-dev` | Ledger items table name |
| `CONFIDENCE_THRESHOLD` | `0.70` | Review queue threshold (70%) |
| `MOCK_BEDROCK` | `false` | Switches to live Amazon Bedrock AI |
| `MOCK_DYNAMODB` | `false` | Switches to live DynamoDB database |
| `MOCK_S3` | `false` | Switches to live S3 bucket |

5. Click **Save**.
6. Go to **Deploys** / **Builds** in Amplify Console and click **Redeploy this version**.

---

## Step 6 — Final Verification

Once the deployment completes:

1. Open your live application URL:
   `https://master.d2ctutlbtt1yhj.amplifyapp.com/`
2. Click **"⚡ Load Benchmark Demo Thread"**.
3. Click **"Analyze Scope & Generate Ledger"**.
4. Verify results:
   - 18 messages parsed
   - 6 scope creep items detected
   - 11.5 total additional hours
   - **$690 unbilled cost**
5. Click **"Review Flagged"** to test human review queue.
6. Click **"Draft Change Order"** to view and copy generated email!
