# Math Lovers - Production Checklist

## 1. Environment Variables & Secrets
- [ ] **Local Development**: Ensure `.env.local` exists with all values from `.env.example`.
- [ ] **Vercel Production**: Add all variables from `.env.example` to Vercel Project Settings > Environment Variables.
- [ ] **Vercel Preview**: Add variables to the "Preview" environment as well if needed.
- [ ] **Validation**: Verify that running `npm run dev` or `npm run build` triggers the environment validation check (it should error if keys are missing).

## 2. Firebase Security (Console)
- [ ] **Authorized Domains**: Go to Firebase Console > Authentication > Settings > Authorized Domains.
      - Add your production domain (e.g., `math-lovers.vercel.app`).
      - Keep `localhost` for development.
- [ ] **Firestore Rules**: Ensure your Firestore Security Rules (`firestore.rules`) are deployed and not set to "test mode" (allow all).
      - Example strict rule: `allow read, write: if request.auth != null;` (Adjust per collection).
- [ ] **Google Sign-In**:
      - If using Firebase Auth, ensure Google provider is enabled.
      - If using custom OAuth, ensure "Authorized redirect URIs" in Google Cloud Console matches your production URL (`https://.../api/auth/google/callback`).

## 3. Deployment Verification
- [ ] **Build Check**: Run `npm run build` locally to ensure no TypeScript errors or missing server validations.
- [ ] **Case Sensitivity**: Verify all imports match filenames exactly (already checked `User`, `db`, `env`).
- [ ] **Runtime Crash Test**: Visit a non-existent route to test `not-found.tsx`.
- [ ] **Error Boundary**: Temporarily throw an error in a component to test `error.tsx`.

## 4. Codebase Hygiene
- [ ] **Secrets**: Verify no secrets are hardcoded in `lib/` or `app/`.
- [ ] **Git Ignore**: Confirm `.env` files are ignored (checked `.gitignore`).
- [ ] **Browser APIs**: Ensure no `window` or `localStorage` usage in Server Components (checked `app/` directory).

## 5. Next Steps
- Deploy to Vercel.
- Watch build logs for "Missing environment variables" errors (our validation script will catch them).
- Test Google Sign-In in production immediately.
