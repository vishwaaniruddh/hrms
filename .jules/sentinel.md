## $(date +%Y-%m-%d) - Insecure Session Management in Common.jsx
**Vulnerability:** Authentication tokens and user data were stored in `localStorage`, causing them to persist indefinitely across browser sessions and tabs, increasing susceptibility to theft via physical access to a shared device or XSS attacks.
**Learning:** The original code comments incorrectly assumed `session storage` was being used while actually invoking `localStorage`, indicating a likely developer oversight rather than a deliberate architectural choice.
**Prevention:** Ensure sensitive session data is stored in `sessionStorage` (or HttpOnly cookies, when feasible) so it is automatically cleared upon session termination, limiting the exposure window.
