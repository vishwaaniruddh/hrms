## 2024-05-17 - Insecure Session Management
**Vulnerability:** Sensitive user data (token, id, role) stored in localStorage.
**Learning:** localStorage persists indefinitely across browser sessions, posing a risk on shared devices. Also, logout did not clear all stored keys.
**Prevention:** Use sessionStorage for authentication tokens and ensure logout clears all relevant keys.
