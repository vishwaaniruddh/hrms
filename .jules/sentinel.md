## 2026-06-15 - Migrate authentication tokens to sessionStorage
**Vulnerability:** Insecure storage of authentication tokens and session data in localStorage.
**Learning:** Storing tokens in localStorage leaves them vulnerable to persistent XSS attacks as the data remains across browser restarts.
**Prevention:** Use sessionStorage for sensitive temporary data so it is automatically cleared when the browser tab is closed. When possible, prefer HttpOnly cookies.
