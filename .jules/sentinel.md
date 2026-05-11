## 2024-05-11 - Incomplete Session Clearance
**Vulnerability:** Session data (roleid, rolename, perm, role_permission) was left in localStorage after logout.
**Learning:** Only basic user details (id, username, token) were being cleared on logout, while sensitive authorization details remained, potentially leading to authorization bypass or sensitive data exposure if the device is shared.
**Prevention:** Always ensure `removeUserSession` completely clears all session keys that are set in `setUserSession`.
