## 2025-02-12 - Migrate Session State to sessionStorage
**Vulnerability:** Authentication tokens and user roles were being stored persistently in `localStorage`, making them vulnerable to extraction via Cross-Site Scripting (XSS) across browser sessions.
**Learning:** Storing sensitive session data in `localStorage` allows it to persist indefinitely until explicitly cleared, increasing the window of opportunity for an attacker. The application's architecture requires this data to only live as long as the browser tab/window is open.
**Prevention:** Use `sessionStorage` for session-specific state, ensuring that data is automatically cleared when the session (tab/window) is closed.
