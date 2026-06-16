## 2026-06-16 - Added ARIA Labels to Icon-Only Buttons
**Learning:** Icon-only buttons relying purely on visual context (e.g., classes like '.btn-icon') are natively inaccessible to screen readers, a common pattern found in this application's custom UI.
**Action:** Consistently audit `.btn-icon` instances across all components and inject semantic `aria-label` attributes to ensure functional parity for assistive technologies.
