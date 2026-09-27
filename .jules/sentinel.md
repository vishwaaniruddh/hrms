## 2024-05-24 - Fix SQL Injection in Helpdesk and Shift Controllers and Models
**Vulnerability:** Several places in the Helpdesk and Shift controllers/models concatenated user input directly into SQL queries rather than using prepared statements.
**Learning:** Legacy codebase patterns often carry forward insecure practices like direct string concatenation in queries, even if PDO is available.
**Prevention:** Always use PDO prepared statements with bounded parameters (`:param` and `execute([':param' => $value])`) to prevent SQL injection, regardless of where the data came from.
