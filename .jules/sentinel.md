## 2024-09-20 - Replace local storage with session storage for token storage
**Vulnerability:** Sensitive authentication tokens and user IDs were stored in local storage, which is persistent across sessions and increases the risk of exposure to XSS attacks.
**Learning:** The code comments indicated "session storage", but local storage was used instead, likely due to a copy-paste error or misunderstanding of the API differences.
**Prevention:** Always use at least session storage for temporary authentication tokens on the client side, or preferably HttpOnly secure cookies to completely mitigate XSS token theft.
