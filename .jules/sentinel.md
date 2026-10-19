## 2024-10-19 - Unparameterized Queries with Request Payload Interpolation
**Vulnerability:** Direct string interpolation of `$body['user_id']` and other variables in `$db->query()` calls inside NotificationService hooks.
**Learning:** Even auxiliary queries (like fetching user details for notifications) must use parameterized prepared statements. Interpolating raw `$request->getBody()` values creates a CRITICAL SQL injection risk.
**Prevention:** Always use `$this->db->prepare()` and `$stmt->execute()` for any SQL query involving external data, regardless of the query's criticality or context.
