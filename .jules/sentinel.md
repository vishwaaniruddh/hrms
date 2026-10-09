## 2025-02-19 - Critical SQL Injection Vulnerabilities in Dynamic Queries
**Vulnerability:** Found multiple instances of direct string interpolation (`{$ticketId}`, `{$swapId}`, `{$requesterId}`, `{$receiverId}`) in SQL queries via `$this->db->query()` and `$this->db->exec()` across `HelpdeskModel.php` and `ShiftModel.php`.
**Learning:** The application codebase has a pattern of using string interpolation for passing IDs into SQL strings rather than using PDO parameters, allowing malicious input to execute arbitrary SQL statements.
**Prevention:** Always use parameterized queries (`$this->db->prepare()` followed by `$stmt->execute()`) for all user-provided variables, regardless of expected type.
