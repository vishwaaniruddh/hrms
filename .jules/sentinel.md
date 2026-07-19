## 2026-07-19 - Fix Insecure Session Management
**Vulnerability:** Authentication tokens and user roles were stored in `localStorage`, violating secure session management practices.
**Learning:** Developers often use `localStorage` for convenience (persisting login state across tabs/restarts), even when comments explicitly say "session storage". This creates a persistent XSS target.
**Prevention:** Always use `sessionStorage` for sensitive session-bound data like auth tokens, and ensure code implementation matches intended security comments.
