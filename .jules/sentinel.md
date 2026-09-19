## 2023-10-27 - Insecure Local Storage of Session Tokens
**Vulnerability:** Sensitive authentication tokens, user IDs, and role permissions were stored indefinitely in `localStorage`.
**Learning:** `localStorage` persists across sessions, increasing risk of exposure on shared devices. A bug in `removeUserSession` also failed to clear all stored role properties, creating a privilege leakage risk.
**Prevention:** Always use `sessionStorage` for temporary auth/session tokens, and rigorously ensure all related properties are cleared on logout.
