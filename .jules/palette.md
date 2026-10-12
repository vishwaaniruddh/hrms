## 2023-10-12 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** This application extensively uses Lucide-react icons within buttons across multiple modules (Salary, Reports, Notifications) without accompanying text or aria-labels. Screen readers will not be able to announce the purpose of these buttons.
**Action:** Implemented a targeted search to identify `<button>` elements missing `aria-label` tags and containing `<[Icon] />` components. Ensure all future icon-only interactive elements receive descriptive `aria-label` or `title` attributes.
