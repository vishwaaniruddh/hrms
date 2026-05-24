## 2025-02-28 - [Session Persistent Storage Bug]
**Vulnerability:** User session information (tokens, permissions, user ID, role info) was stored in `localStorage` rather than `sessionStorage`, persisting across browser sessions and on disk. Furthermore, `removeUserSession` missed several keys (like `roleid`, `rolename`, `perm`, etc.), causing session data leakage.
**Learning:** Legacy session management patterns might partially clear sensitive data but leave other important authorization/role data behind, creating a risk if users log out but their role information persists.
**Prevention:** Store session tokens in `sessionStorage` (so they clear on browser close) or use `HttpOnly` cookies, and ensure any clear/logout functions explicitly remove *all* related keys.
