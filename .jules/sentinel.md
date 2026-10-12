## 2024-05-24 - SQL Injection in HelpdeskController
**Vulnerability:** SQL injection vulnerability in `backend/controllers/HelpdeskController.php` due to direct string interpolation of `$body['user_id']` into the database query.
**Learning:** Even internal ID parameters from POST requests can be manipulated. Direct string interpolation into SQL queries should never be used, regardless of the expected data type.
**Prevention:** Always use parameterized queries (prepared statements) for all database interactions involving user-supplied input, ensuring strict separation of code and data.
