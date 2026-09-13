# AWS Amplify Service Guide

## 1. Why We Need It
AWS Amplify provides fast, global hosting for our Next.js frontend application (`apps/web`), offering automatic SSL certificates, continuous deployment from Git, and zero server maintenance.

## 2. What It Does
AWS Amplify builds and hosts full-stack Next.js applications (App Router) on AWS global edge locations with server-side rendering (SSR) and API routes support.

## 3. What We Need to Create
An AWS Amplify App linked to your GitHub repository or deployed via AWS CLI in region `ap-southeast-2` (Sydney).

## 4. AWS Console Steps
1. Log into your AWS Management Console.
2. Ensure your region selector in the top navigation bar is set to **Asia Pacific (Sydney) `ap-southeast-2`**.
3. Search for **AWS Amplify** in the top search bar and open the Amplify console.
4. Click **Host an app** / **New app** -> **Host web app**.
5. Select **GitHub** (or your Git provider) -> Click **Continue**.
6. Authorize AWS Amplify to access your repository `ScopeCreepDetector`.
7. Select repository branch (`main`).
8. **App settings**:
   - App name: `scope-creep-ledger-web`.
   - Monorepo directory: `apps/web`.
   - Build settings: Amplify auto-detects Next.js build command (`npm run build`).
9. **Environment Variables**:
   Add environment variables in Amplify Console -> App settings -> Environment variables:
   - `AWS_REGION` = `ap-southeast-2`
   - `BEDROCK_MODEL_ID` = `anthropic.claude-3-haiku-20240307-v1:0` (or `us.anthropic.claude-3-5-haiku-20241022-v1:0`)
   - `CONFIDENCE_THRESHOLD` = `0.70`
10. Click **Save and deploy**.

## 5. Configuration
In `apps/web/package.json`, Next.js build scripts are standard:
```json
"scripts": {
  "build": "next build"
}
```

## 6. IAM / Permissions
Amplify creates a service role with permission to build and deploy your app.

## 7. Environment Variables
- `AWS_REGION`: `ap-southeast-2` (Sydney).
- `BEDROCK_MODEL_ID`: Anthropic Claude model ID.
- `CONFIDENCE_THRESHOLD`: Confidence score threshold (`0.70`).

## 8. Local Development
For local development, run:
```bash
npm run dev --workspace=apps/web
```
App runs locally on `http://localhost:3000`.

## 9. Verification
Once deployment completes in Amplify Console, click the provided domain URL (e.g. `https://main.d1234567.amplifyapp.com`).

## 10. Common Errors
- `Build failed`: Ensure `apps/web` root directory is specified in Amplify build settings for monorepos.

## 11. Security Notes
- Amplify environment variables are kept encrypted and isolated server-side.

## 12. Project Integration
- Hosts the Next.js App Router application (`apps/web`).

## 13. Cleanup
To stop hosting: Amplify Console -> App settings -> Delete app.
