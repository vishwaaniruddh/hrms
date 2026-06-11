## 2024-05-24 - Incomplete Session Clearing and Persistent Storage
**Vulnerability:** Session tokens and user data were stored in localStorage (persisting across browser restarts) and partial data was left behind during logout.
**Learning:** Using localStorage for authentication data increases exposure time for XSS attacks, and incomplete removal functions leave stale privilege data in the browser.
**Prevention:** Use sessionStorage for token storage when HttpOnly cookies are unavailable and ensure all set keys are explicitly removed during session termination.
