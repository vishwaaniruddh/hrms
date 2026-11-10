## 2024-05-15 - Unparameterized SQL Queries in Models
**Vulnerability:** Found unparameterized variable interpolation in SQL queries within the PHP models (e.g., `HelpdeskModel.php` using `{$ticketId}` directly in `query()`).
**Learning:** This is a clear SQL injection vulnerability where untrusted input could manipulate the queries. In PHP backend, it is critical to always use parameterized queries with PDO `prepare()` and `execute()`.
**Prevention:** Avoid string interpolation or concatenation in SQL statements. Always use parameterized queries for dynamic values.
