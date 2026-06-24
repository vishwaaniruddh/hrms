## $(date +%Y-%m-%d) - Insecure Session Storage
**Vulnerability:** User session data, including tokens, IDs, and roles, was stored in `localStorage`.
**Learning:** `localStorage` persists data indefinitely across browser sessions, significantly increasing the window of vulnerability for Cross-Site Scripting (XSS) attacks to steal authentication tokens and cause account takeovers.
**Prevention:** Use `sessionStorage` instead of `localStorage` for sensitive authentication and authorization data so that the data is automatically cleared when the page session (tab) is closed.
