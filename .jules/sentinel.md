## 2026-07-10 - Unhandled JSON parsing from localStorage
**Vulnerability:** Unhandled `JSON.parse` from `localStorage` in `src/utils/Common.jsx` could lead to application crashes.
**Learning:** `localStorage` can be modified by the user or malicious scripts (XSS). If the stored value is an invalid JSON string, `JSON.parse` will throw an error, potentially crashing the application or exposing an unhandled exception.
**Prevention:** Always wrap `JSON.parse` calls involving data from potentially untrusted or modifiable sources (like `localStorage` or `sessionStorage`) in a `try...catch` block.
