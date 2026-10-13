## 2024-10-24 - Fix SQL Injection via String Interpolation
**Vulnerability:** SQL Injection in backend models (`HelpdeskModel.php`, `ShiftModel.php`) due to direct variable interpolation (`{$year}`, `{$ticketId}`, `{$swapId}`, `{$date}`) in `$this->db->query` and `$this->db->exec` methods.
**Learning:** Even internal variables or integers should be parameterized to prevent any possible injection vectors, especially when parameters come from user inputs down the line. Direct string interpolation in SQL queries bypasses PDO's built-in protections.
**Prevention:** Always use `$this->db->prepare()` with named or positional parameters and execute them with an array of values instead of direct string concatenation or interpolation in `query()` or `exec()`.
