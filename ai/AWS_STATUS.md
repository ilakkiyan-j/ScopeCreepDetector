# AWS Infrastructure Status Matrix — Scope Creep Ledger

| AWS Service | Product Purpose | Status | Configured | Tested | Notes / Resource Name |
|---|---|---|---|---|---|
| **AWS Amplify** | Web Hosting & CI/CD | ✅ Active | Yes | Yes | `https://master.d2ctutlbtt1yhj.amplifyapp.com/` |
| **Amazon Bedrock** | AI Message Classification | ✅ Active | Yes | Yes | `anthropic.claude-3-haiku-20240307-v1:0` (`ap-southeast-2`) |
| **Amazon S3** | Raw Conversation Storage | ✅ Active | Yes | Yes | `scope-creep-ledger-conversations-dev` |
| **Amazon DynamoDB** | Project & Ledger Data | ✅ Active | Yes | Yes | `scope-creep-ledger-projects-dev` & `items-dev` |
| **Amazon CloudWatch** | Monitoring & Logging | ✅ Active | Yes | Yes | Backend logs monitoring |
| **Amazon Cognito** | Authentication & Roles | ⏳ Planned | No | No | Target for Phase 8 (User Pool & App Client) |
| **AWS Lambda** | Serverless Microservices | ⏳ Planned | No | No | Next.js API routes currently running on Amplify |
| **API Gateway** | REST API Gateway | ⏳ Planned | No | No | Next.js route handlers currently manage endpoints |
