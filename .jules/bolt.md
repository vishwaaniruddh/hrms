## 2024-05-24 - [N+1 queries in ReportModel]
**Learning:** Found N+1 queries in `ReportModel.php` within `getPayrollReport` and `getLeaveLiabilityReport`. In `getPayrollReport`, `salary_items` are fetched in a loop for each salary. In `getLeaveLiabilityReport`, `leave_balances` are fetched in a loop for each user.
**Action:** Replace N+1 loops with a single query using `IN (...)` and hash maps to associate records.
