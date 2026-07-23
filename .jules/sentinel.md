## 2024-06-25 - Using sessionStorage over localStorage for authentication
**Vulnerability:** The application stored authentication tokens, user IDs, and role permissions using `localStorage`, which persists data indefinitely across browser sessions.
**Learning:** This architectural choice increases the window of exposure for Cross-Site Scripting (XSS) attacks. If an attacker successfully executes XSS, they can exfiltrate long-lived tokens from `localStorage`, maintaining access long after the user has left the site.
**Prevention:** Use `sessionStorage` instead for sensitive authentication data to limit token lifespan to the active browser tab session, reducing the risk of persistent token theft.
