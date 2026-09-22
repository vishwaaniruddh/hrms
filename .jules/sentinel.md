## 2024-05-18 - Insecure Session Management
**Vulnerability:** Sensitive tokens and user information stored in `localStorage`.
**Learning:** `localStorage` is vulnerable to XSS attacks, making it easy for malicious scripts to steal authentication tokens and user data. This is a common pattern when developers prioritize convenience over security.
**Prevention:** Use `sessionStorage` instead of `localStorage` for temporary session data, or even better, HTTP-only secure cookies for authentication tokens to mitigate XSS risks.
