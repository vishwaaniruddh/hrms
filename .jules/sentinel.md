## 2024-05-14 - Incomplete Session Clearing
**Vulnerability:** Session data (including tokens and permissions) was being stored in `localStorage`, and `removeUserSession` failed to clear all stored keys upon logout, leaving sensitive data vulnerable.
**Learning:** `localStorage` persists across browser sessions and tabs, making it less secure for authentication tokens than `sessionStorage`. Additionally, incomplete logout functions can leave stale authorization data.
**Prevention:** Always use `sessionStorage` for sensitive session data when `HttpOnly` cookies aren't feasible, and ensure logout functions clear every single key that was set during login.
