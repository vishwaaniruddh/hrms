## 2024-10-16 - Prevent SQL Injection via Request Body Properties
**Vulnerability:** SQL Injection in `HelpdeskController.php` where `$body['user_id']` (unsanitized JSON request body property) was interpolated directly into a raw SQL query.
**Learning:** Developers might assume `id` fields in JSON requests are always integers, leading them to use direct string interpolation in PDO `query()`. This bypasses PDO's protection.
**Prevention:** Always use parameterized queries (PDO `prepare` and `execute`) for any variable originating from the user input, even if it's expected to be an integer identifier.
