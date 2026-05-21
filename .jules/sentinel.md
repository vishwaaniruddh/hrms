## 2026-05-21 - [Incomplete session cleanup]
**Vulnerability:** [Incomplete session removal and storage type]
**Learning:** [Using localStorage keeps session tokens permanently across browser instances, and removeUserSession left key auth attributes orphaned in storage]
**Prevention:** [Always clear ALL set variables during logout, and use sessionStorage for token/authorization storage whenever HttpOnly cookies are unavailable]
