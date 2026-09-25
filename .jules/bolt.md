## 2026-09-25 - Extracted toLowerCase() out of loops

**Learning:** Extracted `toLowerCase()` out of filter loops across codebase elements such as `ManagerApprovals` and `ShiftManagement` because repeated `toLowerCase()` conversions during array iterations (`.filter()`) unnecessarily block the main thread and impact frontend performance.

**Action:** Consistently lift single value string conversions outside iteration logic to limit O(n) rendering bottlenecks.
