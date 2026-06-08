## 2025-02-14 - Incomplete Session Cleanup
**Vulnerability:** The `removeUserSession` function in `src/utils/Common.jsx` failed to clear all session variables upon logout, leaving sensitive role and permission data (`roleid`, `rolename`, `perm`, `role_permission`) in storage.
**Learning:** This occurred because new session keys were added to the login flow (`setUserSession`) over time, but the logout flow was not correspondingly updated to wipe them, creating a risk of unauthorized data access or privilege escalation if the browser session was reused.
**Prevention:** Whenever adding new state to a session during authentication, always audit and update the corresponding logout or session termination functions to ensure complete cleanup.
