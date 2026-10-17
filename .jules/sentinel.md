## 2024-05-24 - SQL Injection via Variable Interpolation
**Vulnerability:** Unsanitized request variables (e.g., `$body['user_id']`) were directly interpolated into SQL query strings using `{$variable}`.
**Learning:** Even though some inputs like `user_id` are expected to be integers, when they originate from the request body without explicit casting, interpolating them directly allows critical SQL injection.
**Prevention:** Always use parameterized queries (`prepare()` and `execute()`) with bound parameters instead of variable interpolation, regardless of the expected data type.
