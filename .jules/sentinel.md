## 2024-11-05 - Fix SQL Injections in Helpdesk and Shift Models
**Vulnerability:** SQL injection via string concatenation in PDO query and exec methods (e.g., `WHERE id = {$ticketId}`). Even if some variables might be integers, string concatenation is an anti-pattern that can lead to SQL injection.
**Learning:** The codebase contained multiple instances of direct variable interpolation in SQL queries within the `HelpdeskModel` and `ShiftModel`.
**Prevention:** Always use parameterized statements (`$this->db->prepare()`) and bind parameters (`execute([...])`) instead of concatenating variables directly into query strings.
