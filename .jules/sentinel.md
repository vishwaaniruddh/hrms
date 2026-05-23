## 2024-06-05 - [Fix insecure session management]
**Vulnerability:** Persistent XSS token extraction risk due to use of `localStorage` for authentication tokens. Additionally, `removeUserSession` failed to clear all stored authorization keys.
**Learning:** Legacy session management patterns relied on `localStorage` which persists tokens indefinitely, combined with incomplete cleanup during logout, leaving sensitive authorization data behind.
**Prevention:** Always use `sessionStorage` for short-lived session data and ensure logout functions clear all keys defined in the corresponding setter function.
