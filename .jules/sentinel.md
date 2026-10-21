## 2024-05-24 - SQL Injection Risk via Direct Interpolation in PDO query()
**Vulnerability:** Found direct interpolation of user input variables (e.g. `{$body['user_id']}`) in `PDO->query()` statements across multiple controllers (HelpdeskController, ShiftController).
**Learning:** Using PDO's `query()` method with string interpolation completely bypasses parameter binding, leading to SQL injection. It seems to have been used for shorthand syntax instead of the verbose prepare/execute.
**Prevention:** Always use `prepare()` with named or positional placeholders (e.g., `:id`) and pass variables in the `execute()` array for dynamic data.
