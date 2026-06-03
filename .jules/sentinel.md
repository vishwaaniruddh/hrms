## 2025-02-23 - Session State Privilege Escalation Prevention
**Vulnerability:** Incomplete clearing of session authorization objects (roles, perms) on logout.
**Learning:** Hardcoding token cleanup but forgetting other auth-sensitive objects lets subsequent users inherit permissions if re-authenticating on same tab/machine.
**Prevention:** Unify session read/write keys in a single array/constant so clearing automatically iterates and wipes everything identically.
