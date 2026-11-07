## 2024-11-07 - Fix SQL Injection in Shift and Helpdesk Modules
**Vulnerability:** Found multiple instances of unsanitized input concatenated into SQL queries, e.g., `$db->query("SELECT * FROM \`shift_swaps\` WHERE id = {$swapId}")->fetch()`. This leads to SQL injection.
**Learning:** This codebase uses `Database::getInstance()->query()` with string concatenation. We must use `prepare()` and `execute()` (or `fetch()`/`fetchAll()` after `execute()`) with parameters for all user-supplied data in SQL queries.
**Prevention:** Always use parameterized queries for database interactions involving variables, especially `id` fields coming from user input or requests.
