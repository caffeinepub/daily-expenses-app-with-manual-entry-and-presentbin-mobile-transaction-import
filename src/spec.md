# Specification

## Summary
**Goal:** Fix the Internet Identity login and post-login authorization flow so authentication reliably completes, the app transitions into the authenticated experience, and users can use core features without requiring an admin token.

**Planned changes:**
- Make the Internet Identity login button reliably complete authentication, set a non-anonymous identity in auth state, and transition the UI past the login screen after success.
- Add clear, user-facing authentication error messages on the login screen and near the header Login button; ensure errors clear on retry or successful login.
- Adjust authenticated actor initialization and authorization so normal authenticated users can access their own profile and expense operations without a `caffeineAdminToken`, and ensure any admin-only initialization is safely skipped/handled when no token is present.

**User-visible outcome:** Users can click Login to successfully authenticate with Internet Identity and enter the app; if login fails or configuration is missing/invalid, they see a clear error message; logged-in users can access their profile and expense features without needing an admin token.
