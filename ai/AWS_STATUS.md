# Scope Creep Ledger — AWS Status

| Service | Purpose | Status | Region | Configured | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Amazon S3** | Raw conversation file storage | Documented | us-east-1 | Optional | Private bucket `scope-creep-ledger-conversations-dev`. Service built in `services/analyze/src/s3-storage.ts`. AWS guide at `docs/aws/s3.md`. Offline fallback active. |
| **Amazon DynamoDB** | Project & verified ledger storage | Documented | us-east-1 | Optional | Tables: `scope-creep-ledger-projects-dev` and `scope-creep-ledger-items-dev`. Service built in `services/ledger/src/ledger-service.ts`. AWS guide at `docs/aws/dynamodb.md`. Offline fallback active. |
| **AWS Lambda** | Serverless backend execution | Documented | us-east-1 | Optional | Handlers built in `services/analyze` and `services/ledger`. Direct deployment ready. |
| **Amazon API Gateway**| HTTP REST API routing | Documented | us-east-1 | Optional | API Routes exposed under `/api/analyze` and `/api/change-order`. |
| **Amazon Bedrock** | AI classification & email generation | Documented | us-east-1 | Optional | Integrated in `services/analyze/src/classifier.ts` and `services/change-order`. AWS guide at `docs/aws/bedrock.md`. Offline fallback active. |
| **AWS Amplify** | Next.js frontend hosting | Documented | ap-southeast-2 | Optional | Next.js App Router app (`apps/web`). AWS guide at `docs/aws/amplify.md` (Sydney region). Clean build verified. |
| **Amazon CloudWatch** | Structured backend logging & metrics| Documented | us-east-1 | Optional | Structured JSON logging module in `services/analyze/src/logger.ts`. AWS guide at `docs/aws/cloudwatch.md`. |
