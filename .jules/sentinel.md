## 2024-05-24 - Insecure Local Storage and Incomplete Session Cleanup
**Vulnerability:** Authentication tokens and permissions were stored in localStorage (persisting across sessions) and removeUserSession failed to clear role/permission keys on logout.
**Learning:** Code comments may falsely indicate secure storage while using persistent storage. Partial session cleanup leaves stale privileged data in the browser.
**Prevention:** Consistently use sessionStorage for auth tokens when HttpOnly cookies are unavailable, and ensure logout routines clear all keys set during login.
