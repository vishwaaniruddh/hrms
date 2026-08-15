## 2024-08-15 - Icon-Only Buttons Missing ARIA Labels
**Learning:** Found a systemic pattern across HRMS components (Member, Attendence, Salary) where icon-only buttons (like search submits, search toggles, and dropdown triggers) are missing accessible names (aria-labels). This makes them completely invisible to screen readers, which is a critical accessibility failure.
**Action:** When adding or modifying interactive elements with only icons, always add an `aria-label` or `title` to ensure they are accessible. For existing components, incrementally add these labels when making other updates.
