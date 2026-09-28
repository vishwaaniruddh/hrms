## 2024-05-20 - SQL Injection via Unparameterized Queries
**Vulnerability:** Several instances of string interpolation were found inside SQL queries in `HelpdeskModel.php` and `ShiftModel.php` (e.g., `query("... {$var}")`), which exposes the application to SQL injection vulnerabilities.
**Learning:** Even internal or integer-casted variables should use parameterized statements for robust defense in depth and consistent code patterns.
**Prevention:** Always use `$this->db->prepare(...)` combined with `execute([...])` instead of string interpolation for any database queries involving dynamic variables.
