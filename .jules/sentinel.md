## 2024-05-24 - Persistent Storage of Session Data
**Vulnerability:** Session tokens, user roles, and permissions were stored in `localStorage` in `src/utils/Common.jsx`.
**Learning:** This codebase incorrectly relied on `localStorage` for session management instead of `sessionStorage`. Even the original comments stated `// return the user data from the session storage`, indicating a developer oversight. Storing sensitive session data in `localStorage` exposes it to persistent XSS attacks and physical device access.
**Prevention:** Always use `sessionStorage` for session-scoped data unless explicitly implementing a secure "Remember Me" mechanism with short-lived tokens and refresh logic.
