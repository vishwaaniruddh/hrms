## 2026-06-16 - Insecure Session Storage and Incomplete Logout
**Vulnerability:** Session tokens and sensitive data (roles/permissions) were stored in persistent localStorage and not completely cleared on logout.
**Learning:** Relying on localStorage for auth tokens increases exposure time for XSS token theft. Failing to clear all session keys leaves residual privileged data that could be abused on shared devices.
**Prevention:** Use sessionStorage for sensitive auth data to ensure it clears when the browser tab closes, and centralize session cleanup to ensure all keys are explicitly removed on logout.
