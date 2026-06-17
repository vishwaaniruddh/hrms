## 2026-06-17 - Incomplete Session Storage Migration
**Vulnerability:** Authentication tokens and user data were stored in `localStorage` instead of `sessionStorage`, increasing the risk of token theft and unauthorized access on shared devices.
**Learning:** Storing sensitive authentication state in `localStorage` means it persists indefinitely until explicitly cleared, even if the user closes their browser tab.
**Prevention:** Always use `sessionStorage` for sensitive authentication tokens and session data so that it is automatically cleared when the browser tab is closed, or use HttpOnly cookies if backend support is available.
