## 2024-09-17 - Missing ARIA labels in HRMS Search Actions
**Learning:** In the HRMS module (Attendence, Member, Salary), icon-only search buttons (submit and toggle-back) lacked `aria-label`s, rendering them invisible to screen readers, although `data-bs-original-title` was used on some other actions like emails.
**Action:** When auditing toolbars or search groups in this component system, always look for `<button className="... btn-icon">` containing only `<em className="icon ..."></em>` and explicitly inject `aria-label` attributes to ensure keyboard and screen-reader accessibility.
