## 2023-10-24 - SQL Injection in HelpdeskModel
**Vulnerability:** A critical SQL injection vulnerability was found in backend/models/HelpdeskModel.php where $ticketId was interpolated directly into UPDATE queries.
**Learning:** The addMessage method lacked type hints for $ticketId, and interpolated the string directly into the query, causing a vulnerability even if the controller cast it.
**Prevention:** Always use parameterized statements like $this->db->prepare() and $stmt->execute() instead of string interpolation for user-supplied data, regardless of upstream type-casting.
