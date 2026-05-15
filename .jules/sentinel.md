
## 2024-05-15 - [High] Insecure Session Management Fix
**Vulnerability:** Application was storing authentication tokens and sensitive permission keys in `localStorage` indefinitely, and `removeUserSession` did not clear all stored items, leaving lingering keys in storage.
**Learning:** In the absence of `HttpOnly` cookies, using `sessionStorage` provides a defense-in-depth advantage over `localStorage` by ensuring data is automatically cleared when the browser tab is closed. Furthermore, partial session invalidation can lead to privilege escalation or session confusion, highlighting the importance of explicitly removing all authenticated session keys.
**Prevention:** Avoid `localStorage` for sensitive authentication state. Always audit logout/session invalidation routines to ensure all potentially sensitive keys are cleared.
