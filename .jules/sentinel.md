## 2024-05-15 - [Session Storage Migration]
**Vulnerability:** Persistent session tokens in localStorage
**Learning:** Tokens stored in localStorage persist after the browser tab is closed, increasing the risk of unauthorized access.
**Prevention:** Use sessionStorage for sensitive data to ensure it is cleared when the session ends.
