
## 2024-05-24 - Insecure Session Management and Incomplete Invalidation
**Vulnerability:** User session and authentication data (including tokens, IDs, and permissions) were stored in `localStorage` rather than `sessionStorage`, making them persistent across browser sessions and vulnerable to theft if the device is shared or compromised. Furthermore, the logout function `removeUserSession` only cleared a subset of session variables, leaving critical security data like roles and permissions active in storage.
**Learning:** Legacy utility files frequently neglect clearing all added state keys. `localStorage` should not be used for sensitive authentication data unless strictly necessary.
**Prevention:** Always use `sessionStorage` for temporary authentication credentials when HttpOnly cookies are not viable, and ensure logout functions clear every single session key that the login function sets.
