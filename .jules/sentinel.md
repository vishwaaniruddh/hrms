## 2026-06-22 - LocalStorage vs SessionStorage Mismatch
**Vulnerability:** Sensitive session data (tokens, role info) was stored in localStorage despite comments indicating sessionStorage.
**Learning:** In this codebase, the intent to use sessionStorage was documented in comments, but the implementation mistakenly used localStorage, increasing the XSS vulnerability window.
**Prevention:** Regularly audit storage mechanisms for sensitive data and ensure implementation matches security-focused documentation.
