## $(date +%Y-%m-%d) - Insecure local storage of session tokens
**Vulnerability:** User session data (IDs, tokens, roles) was stored in `localStorage`.
**Learning:** `localStorage` persists across sessions and tabs, making sensitive data vulnerable to extraction via XSS for extended periods. `sessionStorage` provides a natural lifespan limit tied to the browser tab session.
**Prevention:** Always use `sessionStorage` (or secure HTTP-only cookies) for session-based authentication tokens to minimize the window of opportunity for XSS-based exfiltration.
