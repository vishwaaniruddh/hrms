## 2023-10-26 - SQL Injection in ShiftModel & HelpdeskModel
**Vulnerability:** Found direct string concatenation of user-supplied or ID variables within `$this->db->query()` calls, leading to potential SQL injection.
**Learning:** In PHP backend, ensure that `$this->db->prepare()` with bindings is always used when user input or dynamic variables are passed into SQL queries, rather than `$this->db->query()`.
**Prevention:** Review all instances of `$this->db->query("SELECT ... {$var} ...")` and replace them with parameterized statements.
