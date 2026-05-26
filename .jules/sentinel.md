## 2024-05-24 - [Incomplete Session Logout in Common.jsx]
**Vulnerability:** The `removeUserSession` function only cleared 4 session keys (`token`, `id`, `username`, `userid`), leaving 4 authorization-related keys (`roleid`, `rolename`, `perm`, `role_permission`) in storage after logout.
**Learning:** `setUserSession` explicitly set 8 keys, but the cleanup function wasn't updated symmetrically, allowing stale permission data to persist across user sessions. This could lead to privilege escalation if multiple users log in on the same machine.
**Prevention:** Always ensure session cleanup functions symmetrically clear all keys that the session initialization functions set.
