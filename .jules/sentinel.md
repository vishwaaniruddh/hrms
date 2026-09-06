## 2024-09-06 - Migrate local storage to session storage for tokens
**Vulnerability:** Sensitive authentication tokens and user info were stored in localStorage, which persists across sessions and is susceptible to XSS token theft over time.
**Learning:** Common pattern in React apps when not using HTTP-only cookies.
**Prevention:** Use sessionStorage instead for sensitive data to ensure it clears when the tab/window is closed.
