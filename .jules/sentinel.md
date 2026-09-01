## 2024-05-18 - Insecure Storage of Authentication Tokens
**Vulnerability:** Authentication tokens and user roles were stored in `localStorage`, which persists indefinitely and is accessible across tabs and sessions.
**Learning:** Using `localStorage` for sensitive session data increases the risk of XSS attacks stealing long-lived tokens and leaves sessions active on shared computers.
**Prevention:** Always use `sessionStorage` for temporary session data, or ideally HTTP-only cookies for tokens. For this client-side architecture, `sessionStorage` is the immediate, secure alternative.
