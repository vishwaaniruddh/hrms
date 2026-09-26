## 2024-05-24 - SQL Injection in Direct Variable Interpolation
**Vulnerability:** Direct variable interpolation (`{$id}`) inside `$db->query()` calls, even for variables that seemed "safe" because they were internal IDs, resulting in SQL injection vulnerabilities in `HelpdeskController.php` and `ShiftController.php`.
**Learning:** The codebase previously assumed that data from request bodies or existing database rows was safe to concatenate directly into queries. This is a dangerous pattern that can easily be overlooked.
**Prevention:** Always use PDO prepared statements with `$db->prepare()` and `$stmt->execute()` for any dynamic parameters, regardless of the data source.
