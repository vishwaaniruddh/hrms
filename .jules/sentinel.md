## 2024-11-02 - SQL Injection Vulnerabilities in Models
**Vulnerability:** SQL injection vulnerabilities using `$this->db->query("SELECT ... WHERE id = {$variable}")` found in models `backend/models/HelpdeskModel.php` and `backend/models/ShiftModel.php`.
**Learning:** Even internal variables shouldn't be directly interpolated into SQL queries. The codebase was not using parameterized statements consistently.
**Prevention:** Use prepared statements `prepare()` and `execute()` instead of direct interpolation `{$variable}`.
