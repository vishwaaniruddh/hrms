## 2024-05-24 - Unsafe Storage of Sensitive Data
**Vulnerability:** Session tokens, user IDs, and permissions were stored in `localStorage` instead of `sessionStorage`.
**Learning:** `localStorage` persists across browser sessions and tabs, meaning sensitive session identifiers could remain accessible on a shared computer even after the user closes the window. This increases the risk of token extraction via Cross-Site Scripting (XSS).
**Prevention:** Store short-lived session credentials (like authentication tokens) in `sessionStorage` or HTTP-only cookies instead of `localStorage` to ensure they are automatically cleared when the browsing session ends.
