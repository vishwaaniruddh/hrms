## 2024-05-24 - SQL Injection Vulnerabilities Found

**Vulnerability:** Found multiple instances of SQL Injection due to concatenating unvalidated inputs into SQL queries instead of using prepared statements.
Examples:
- `HelpdeskModel.php`: `SELECT user_id, status FROM \`helpdesk_tickets\` WHERE id = {$ticketId}`
- `HelpdeskModel.php`: `UPDATE \`helpdesk_tickets\` SET \`status\` = 'In Progress', \`updated_at\` = NOW() WHERE id = {$ticketId}`
- `ShiftModel.php`: `SELECT * FROM \`shift_swaps\` WHERE id = {$swapId}`
- `ShiftModel.php`: `SELECT * FROM \`shift_rosters\` WHERE user_id = {$requesterId} AND date = '{$date}' LIMIT 1`
- `ShiftModel.php`: `SELECT * FROM \`shift_rosters\` WHERE user_id = {$receiverId} AND date = '{$date}' LIMIT 1`

**Learning:** PHP database layer is using unsafe string interpolation directly in SQL statements in some parts, bypassing PDO's parameterized queries.

**Prevention:** Ensure PDO prepared statements (`prepare()` and `execute()`) are consistently used throughout the codebase for all SQL statements, preventing SQL Injection vulnerabilities.
