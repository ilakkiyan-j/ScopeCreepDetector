# Scope Creep Ledger — Development Rules

## 1. Code Quality & Conventions
- **TypeScript**: Strict mode enabled. No `any` types unless explicitly isolated with a documented reason.
- **Naming**:
  - `camelCase` for variables, functions, and properties.
  - `PascalCase` for React components, types, interfaces, and classes.
  - `kebab-case` for file names and API endpoints.
  - `UPPER_SNAKE_CASE` for global constants and environment variables.
- **Functions**: Small, single-responsibility functions with explicit return type annotations.

## 2. API Design & Validation
- Shared types must live under `/shared/types/`.
- Request and response contracts must be validated with Zod/JSON schemas under `/shared/schemas/`.
- Frontend and backend must use identical contract types from `/shared/types/`.

## 3. Error Handling
- Never silently swallow errors or return empty dummy fallbacks.
- External dependencies (Bedrock, DynamoDB, S3) must be wrapped with try/catch blocks and structured error logging.
- Error responses sent to the client must be safe, friendly, and free of sensitive infrastructure tracebacks or keys.

## 4. AI & Bedrock Integration Rules
- Never hardcode AI prompts inside Lambda or application source code.
- Prompts must be stored in `/ai/prompts/` and schemas in `/ai/schemas/`.
- All Bedrock outputs must pass schema validation before writing to any storage layer.
- If Bedrock output fails JSON parsing or schema validation, reject immediately and log to CloudWatch.

## 5. Security & Credentials
- **NEVER** hardcode AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) anywhere in code or commit them to Git.
- **NEVER** expose AWS SDK keys to client-side frontend code. All AWS operations must occur server-side inside Lambda.
- Use standard `.env.example` templates for local configuration. Never commit `.env` files.

## 6. AWS & Infrastructure
- Follow least-privilege IAM permissions.
- Document every AWS service addition or configuration change in `/docs/aws/<service-name>.md` and `/ai/AWS_STATUS.md`.
- Keep AWS Region consistent across services (e.g. `us-east-1` or `us-west-2` where Bedrock models are available).
