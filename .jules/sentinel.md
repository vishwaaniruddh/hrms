## 2026-06-02 - Insecure Session Storage
**Vulnerability:** Sensitive tokens stored in localStorage and incomplete session clearing on logout.
**Learning:** localStorage persists beyond browser sessions. Logout failed to clear all variables.
**Prevention:** Use sessionStorage and ensure all keys are cleared.
