## 2024-05-24 - [SQL Injection in HelpdeskController]
**Vulnerability:** Unsanitized user input `$body['user_id']` was directly interpolated into a SQL query in `HelpdeskController.php` during urgent notification dispatch, leading to a critical SQL injection vulnerability.
**Learning:** Even within secondary conditional logic (like firing notifications), raw database queries must not interpolate request body parameters.
**Prevention:** Always use prepared statements (`$db->prepare`) with bound parameters instead of `$db->query` with string interpolation.
