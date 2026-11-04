## 2024-12-10 - SQL Injection via string interpolation in DB queries
**Vulnerability:** Several queries in `backend/models/HelpdeskModel.php` and `backend/models/ShiftModel.php` directly embed PHP variables into SQL queries rather than using parameterized preparation, posing SQL Injection risk.
**Learning:** Legacy style models in PHP may still rely on string concatenation or interpolation when dealing with seemingly safe integers, but parameterization should be used universally.
**Prevention:** Always use `$this->db->prepare()` with `->execute()` parameters over `$this->db->query()` or `$this->db->exec()` with embedded variables.
