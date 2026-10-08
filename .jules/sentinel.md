## 2024-05-18 - Fix SQL Injection via String Interpolation
**Vulnerability:** User-controlled inputs (`$year`, `$ticketId`, `$swapId`, `$requesterId`, `$date`) were directly interpolated into SQL query strings (e.g., `{$ticketId}`) in `HelpdeskModel.php` and `ShiftModel.php`, allowing SQL injection.
**Learning:** String interpolation in PHP double-quoted strings for SQL queries was a common pattern in the codebase, bypassing the safety of PDO.
**Prevention:** Always use parameterized queries (e.g., `$this->db->prepare(...)`) with bound parameters instead of string interpolation for variables in SQL queries.
