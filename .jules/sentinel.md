## 2024-09-25 - SQL Injection in Database Query and Exec calls
**Vulnerability:** Direct string interpolation of variables into `$this->db->query()` and `$this->db->exec()` statements (e.g. `WHERE id = {$ticketId}`) creates SQL injection vulnerabilities.
**Learning:** PDO methods like `query()` and `exec()` do not sanitize inputs. Even variables that are seemingly integers (like `$ticketId`) can be manipulated if their type isn't strictly enforced before interpolation.
**Prevention:** Always use parameterized queries with `$this->db->prepare()` and `$stmt->execute()` for any query that includes variable data, regardless of the expected data type.
