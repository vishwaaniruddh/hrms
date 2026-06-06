## 2024-05-24 - Insecure session storage
**Vulnerability:** Auth tokens stored in localStorage
**Learning:** localStorage unnecessarily exposes session data across browser tabs/restarts; missing key removals in logout left stale auth data.
**Prevention:** Use sessionStorage for auth data and clear all keys on logout.
