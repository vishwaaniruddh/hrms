## 2025-02-14 - Fix incomplete session clearance

**Vulnerability:** Session management via `sessionStorage` (previously `localStorage`) failed to clear critical authorization keys (`roleid`, `rolename`, `perm`, `role_permission`) upon logout, leaving lingering privileges.
**Learning:** Legacy logout procedures may only clear core keys (like `token` and `id`), forgetting to manage secondary or custom authorization keys added later.
**Prevention:** Ensure `removeUserSession` logic maps 1:1 with `setUserSession` keys, fully purging all authentication state when ending a session.
