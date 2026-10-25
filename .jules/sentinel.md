## 2025-01-20 - Unsafe parameter interpolation
**Vulnerability:** Found direct string interpolation of parameters in PDO queries.
**Learning:** PDO provides parameterized queries, but legacy PHP code often constructs raw strings, assuming variables are safe, leading to injection vulnerabilities.
**Prevention:** Always use `$this->db->prepare()` with `execute()` instead of `$this->db->query()` with inline parameters, even when the parameter seems perfectly safe or has a strongly typed definition.
