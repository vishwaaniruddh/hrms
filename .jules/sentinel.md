## 2026-06-23 - [Replace localStorage with sessionStorage]
**Vulnerability:** User session data, including tokens and role information, was stored in `localStorage`, which exposes it to cross-site scripting (XSS) attacks.
**Learning:** Session data must be stored securely using `sessionStorage` rather than `localStorage` to reduce the window of vulnerability, as session storage is cleared when the page session ends.
**Prevention:** Use `sessionStorage` for storing tokens and sensitive data in the application's auth functions.
