# Amazon Cognito Setup Guide — Scope Creep Ledger

## 1. Why We Need It
Scope Creep Ledger is evolving from an unauthenticated single-page tool into a secure multi-tenant SaaS application. We need **Amazon Cognito** to:
- Authenticate users securely with email and password.
- Issue JSON Web Tokens (JWT) for API authorization.
- Assign role claims (`USER` vs `ADMIN`) to enforce project ownership and access controls.

## 2. Simple Explanation
Think of Amazon Cognito as an external digital security guard for our app. Instead of storing passwords in our database, Cognito manages user sign-ins, password resets, and identity tokens. Our app asks Cognito: *"Is this password correct?"*, and Cognito responds with an encrypted badge (JWT token) containing the user's ID, role, and email.

## 3. Technical Explanation
- **Cognito User Pool**: A user directory in AWS that stores identity profiles, handles password hashing, and issues OAuth 2.0 / OpenID Connect tokens (`id_token`, `access_token`, `refresh_token`).
- **Cognito App Client**: A public client ID that allows our Next.js web app to communicate with Cognito APIs without exposing private AWS secret keys.

## 4. AWS Resource We Need
- **User Pool Name**: `scope-creep-ledger-users-dev`
- **App Client Name**: `scope-creep-ledger-web-client`
- **AWS Region**: `ap-southeast-2` (Asia Pacific Sydney)

---

## 5. AWS Console Setup Steps (Step-by-Step for Beginners)

### Step 1: Open Cognito Service
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. In the top search bar, type `Cognito` and select **Amazon Cognito**.
3. In the top right header, ensure your region is set to **Sydney (ap-southeast-2)**.

### Step 2: Create User Pool
1. Click the orange **Create user pool** button.
2. Under **Configure sign-in experience**:
   - Select **Email** for User pool sign-in options.
   - Click **Next**.
3. Under **Configure security requirements**:
   - Password policy: Choose **Cognito defaults** (minimum 8 characters, numbers, symbols).
   - Multi-factor authentication (MFA): Select **No MFA** (for hackathon testing simplicity).
   - User account recovery: Select **Email only**.
   - Click **Next**.
4. Under **Configure sign-up experience**:
   - Self-service sign-up: Uncheck (accounts are created by Admin or Request Access flow).
   - Required attributes: Select `email` and `name`.
   - Custom attributes: Click **Add custom attribute** -> Name: `role` (Type: String) and `profession` (Type: String).
   - Click **Next**.
5. Under **Configure message delivery**:
   - Select **Send email with Cognito** (free tier testing quota).
   - Click **Next**.
6. Under **Integrate your app**:
   - User pool name: Enter `scope-creep-ledger-users-dev`.
   - App client name: Enter `scope-creep-ledger-web-client`.
   - Client secret: Select **Don't generate a client secret** (required for public web apps).
   - Click **Next**.
7. Review your settings and click **Create user pool**.

---

## 6. Environment Variables

Once created, copy the **User Pool ID** and **App Client ID** into your `.env.local` file:

```env
# AWS Cloud Credentials & Region
APP_AWS_REGION=ap-southeast-2

# Amazon Cognito Authentication
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-2_xxxxxxxxx
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

*(Note: If Cognito credentials are not set in `.env.local`, Scope Creep Ledger automatically falls back to local demo auth personas for offline execution!)*

---

## 7. How Our Code Connects to It

In `apps/web/context/AuthContext.tsx`:
- When credentials are present, the app calls Amazon Cognito endpoints via HTTPS fetch to authenticate the user and obtain the ID token.
- The ID token is attached to backend API calls in the `Authorization: Bearer <token>` header.
- Backend API routes (`/api/analyze`, `/api/change-order`) verify token signatures and extract the `sub` (userId) and `role` claims to enforce project ownership.

---

## 8. Verification & Common Errors

### How to Verify:
1. Open the app at `/auth/login`.
2. Enter email and password.
3. Verify successful redirect to `/dashboard` with your user profile badge visible in the top header.

### Common Errors:
- **`NotAuthorizedException`**: Incorrect email or password.
- **`UserNotFoundException`**: Account has not been invited/created yet.
- **`ResourceNotFoundException`**: Invalid `NEXT_PUBLIC_COGNITO_USER_POOL_ID` in `.env.local`.
