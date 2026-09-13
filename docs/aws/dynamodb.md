# Amazon DynamoDB Service Guide

## 1. Why We Need It
Scope Creep Ledger needs a fast, reliable, serverless database to store project scope agreements and authoritative scope-creep ledger receipts. Amazon DynamoDB provides single-digit millisecond latency, zero server management, and instant reloading of project state.

## 2. What It Does
Amazon DynamoDB is a fully managed NoSQL key-value database. In our application:
- Stores **Project Metadata** (Project Name, Client, Original Scope text, Hourly Rate).
- Stores **Verified Ledger Items** (Quoted request text, requester name, classification, timestamp, estimated hours, calculated cost, verification status).
- Allows fast queries by `projectId`.

## 3. What We Need to Create
We create **two** DynamoDB tables in the AWS Console:

### Table 1: Projects Table (`scope-creep-ledger-projects-dev`)
- **Partition Key (PK)**: `id` (String)

### Table 2: Ledger Items Table (`scope-creep-ledger-items-dev`)
- **Partition Key (PK)**: `projectId` (String)
- **Sort Key (SK)**: `id` (String)

## 4. AWS Console Steps
1. Log into your AWS Management Console.
2. Ensure your region is set to `us-east-1` (N. Virginia) or your designated project region.
3. Search for **DynamoDB** in the top search bar and open the DynamoDB console.
4. Click **Create table**.
5. **Create Projects Table**:
   - Table name: `scope-creep-ledger-projects-dev`
   - Partition key: `id` (String)
   - Table class: **DynamoDB Standard**
   - Capacity mode: **On-demand** (Pay per request - cost-effective for hackathons)
   - Click **Create table**.
6. Click **Create table** again for **Ledger Items Table**:
   - Table name: `scope-creep-ledger-items-dev`
   - Partition key: `projectId` (String)
   - Sort key: `id` (String)
   - Capacity mode: **On-demand**
   - Click **Create table**.

## 5. Configuration
In your `.env` file (copied from `.env.example`):
```env
AWS_REGION=us-east-1
DYNAMODB_PROJECTS_TABLE=scope-creep-ledger-projects-dev
DYNAMODB_LEDGER_TABLE=scope-creep-ledger-items-dev
```

## 6. IAM / Permissions
Your AWS IAM User or Lambda Execution Role requires permissions for DynamoDB operations:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/scope-creep-ledger-projects-dev",
        "arn:aws:dynamodb:*:*:table/scope-creep-ledger-items-dev"
      ]
    }
  ]
}
```

## 7. Environment Variables
- `AWS_REGION`: AWS datacenter region.
- `DYNAMODB_PROJECTS_TABLE`: Name of project metadata table.
- `DYNAMODB_LEDGER_TABLE`: Name of ledger items table.
- `MOCK_DYNAMODB`: (Optional) Set to `true` to run offline with local in-memory persistence.

## 8. Local Development
- **Offline / Mock Mode**: Set `MOCK_DYNAMODB=true` or run without AWS keys. The application stores project and ledger state in local memory for testing.
- **Live AWS Mode**: Uses `@aws-sdk/lib-dynamodb` (`DynamoDBDocumentClient`) to persist data to real DynamoDB tables.

## 9. Verification
Run the automated ledger service test:
```bash
npx tsx services/ledger/src/ledger-service.test.ts
```

## 10. Common Errors
- `ResourceNotFoundException`: DynamoDB table name in `.env` does not match the created table name in AWS Console.
- `AccessDeniedException`: IAM policy lacks permissions for `dynamodb:PutItem` or `dynamodb:Query`.

## 11. Security Notes
- DynamoDB tables are private to your AWS account and protected by IAM permissions.

## 12. Project Integration
- Used by `services/ledger/src/ledger-service.ts` to manage authoritative receipts and project totals.

## 13. Cleanup
On-demand DynamoDB tables incur zero cost when empty and no requests are made. To delete, select table in Console -> click **Delete**.
