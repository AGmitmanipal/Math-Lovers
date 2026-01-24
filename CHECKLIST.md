# Production Readiness & Security Checklist

## 1. Environment Variables & Secrets
- [ ] **.env.local populated:** Ensure `.env.local` contains all real secrets (not placeholders).
- [ ] **Vercel Config:** Add all variables from `.env.local` to Vercel Project Settings > Environment Variables.
- [ ] **Exposure Check:** Verify no `NEXT_PUBLIC_` prefix is used for secrets like `MONGODB_URI` or `JWT_SECRET`.
- [ ] **Git Ignore:** Confirm `.env*` is in `.gitignore` (Checked: YES).

## 2. Security Hardening
- [ ] **Google OAuth Audience:** The backend (`/api/auth/google/callback`) now verifies `aud` claim matches your Client ID.
- [ ] **Firebase Rules:** Go to Firebase Console > Firestore Database > Rules.
    - Set explicit read/write rules.
    - **Do NOT use `allow read, write: if true;` in production.**
    - Example: `allow read, write: if request.auth != null;` (Adjust as needed).
- [ ] **Domain Whitelisting:**
    - **Firebase Console:** Authentication > Settings > Authorized Domains. Add `math-lovers.vercel.app`.
    - **Google Cloud Console:** APIs & Services > Credentials > OAuth 2.0 Client IDs.
        - Add `https://math-lovers.vercel.app` to Authorized JavaScript origins.
        - Add `https://math-lovers.vercel.app/api/auth/callback/google` (if using next-auth/server flow) to Authorized redirect URIs.

## 3. Deployment & Build
- [ ] **Build Check:** Run `npm run build` locally to catch type errors before pushing.
- [ ] **"Use Client":** Verified browser-only code uses `'use client'` directive.
- [ ] **Error Boundaries:** `app/global-error.tsx` added to prevent white screen of death.

## 4. Final Validation Steps
1.  **Deploy to Vercel.**
2.  **Verify HTTPS:** Ensure Vercel provides a valid SSL certificate.
3.  **Test Login:** Sign up with a new Google account on the production URL.
4.  **Test Logic:** Verify questions load and interaction works without console errors.
5.  **Logs:** Check Vercel Function Logs for any "Environment variable missing" warnings.

## 5. Post-Launch
- [ ] **Monitoring:** Set up Firebase Analytics or Vercel Analytics.
- [ ] **Backups:** Configure MongoDB Atlas automated backups.
