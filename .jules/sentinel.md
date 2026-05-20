## 2024-05-24 - Frontend Session Data Persistence
**Vulnerability:** Sensitive user data (tokens, IDs, roles) was stored in `localStorage`, making it persist across browser sessions.
**Learning:** `localStorage` does not clear when the browser closes, increasing the risk of unauthorized access on shared devices or via persistent XSS compared to `sessionStorage`. Additionally, the logout function failed to clear all stored role/permission keys.
**Prevention:** Always use `sessionStorage` for frontend-only auth tokens if `HttpOnly` cookies are unavailable, and maintain a strict list of all session keys to ensure complete removal on logout.
