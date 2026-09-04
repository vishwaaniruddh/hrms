## 2024-05-28 - Insecure Storage of Authentication Tokens
**Vulnerability:** Sensitive authentication data (tokens, user IDs) were being stored in localStorage.
**Learning:** Developers intended to use sessionStorage (as per comments) but inadvertently used localStorage, making tokens persistent across sessions and increasing exposure to XSS.
**Prevention:** Always use sessionStorage or secure HttpOnly cookies for session tokens to ensure they are cleared when the browser session ends.
