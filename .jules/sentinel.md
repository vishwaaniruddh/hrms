## 2024-05-24 - SQL Injection in Controllers
**Vulnerability:** Unparameterized database queries using direct variable interpolation (e.g., `{$body['user_id']}`) in controllers such as `HelpdeskController.php` and `ShiftController.php`.
**Learning:** Even if data seems to be typed or expected as an integer, using direct string interpolation with user input from request bodies creates a severe SQL injection vulnerability.
**Prevention:** Always use parameterized queries (`prepare()` and `execute()`) with PDO instead of `query()` when incorporating variables into SQL statements.
