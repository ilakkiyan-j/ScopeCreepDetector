# AWS Amplify Build Specification (`amplify.yml`)

For Next.js App Router monorepos, ensure your **Build settings** (`amplify.yml`) in AWS Amplify Console look like this:

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build --workspace=apps/web
      artifacts:
        baseDirectory: apps/web/.next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - apps/web/.next/cache/**/*
    appRoot: apps/web
```

## Deployment Verification Steps
1. Watch the **Build & Deploy** progress bar in your AWS Amplify Console.
2. The initial build takes approximately **2 to 3 minutes** to complete.
3. Once all 3 stages (**Provision**, **Build**, **Deploy**) display green checkmarks (✓), refresh the live URL:
   `https://master.d2ctutlbtt1yhj.amplifyapp.com/`
