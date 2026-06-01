## 2024-05-24 - Migrate auth tokens to sessionStorage
**Vulnerability:** User auth tokens and IDs are stored in localStorage which persists across sessions and tabs, increasing the attack surface.
**Learning:** Legacy codebase used localStorage for all state persistence rather than just what needed to outlive a browser session.
**Prevention:** Always default to sessionStorage for authentication credentials so they are cleared when the browser window closes.
