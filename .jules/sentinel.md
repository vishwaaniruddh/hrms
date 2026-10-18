## 2024-10-18 - Fix SQL Injection Vulnerabilities
**Vulnerability:** SQL Injection in $db->query via user input string concatenations in ShiftController.php and HelpdeskController.php.
**Learning:** Hardcoded `$db->query` calls with variable string interpolations open up application to SQL injection vulnerabilities.
**Prevention:** Always use parameterized `$db->prepare` and `execute` statements for database queries handling variable input.
