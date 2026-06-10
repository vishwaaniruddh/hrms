## 2024-05-24 - Migrate localStorage to sessionStorage for Auth Tokens
**Vulnerability:** Insecure session management using localStorage.
**Learning:** Auth tokens and session state were persisted in localStorage, which persists across browser restarts and makes tokens vulnerable to physical access or local XSS.
**Prevention:** Store sensitive session data like authentication tokens and permissions in sessionStorage instead, ensuring they are cleared when the browser tab closes.
