## 2024-10-23 - Widespread missing ARIA labels on icon-only buttons
**Learning:** Found multiple instances of `<button>` elements across the HRMS component suite (e.g., in dialog closes and data grids) that contained only an icon without any text or aria-labels. This makes the interface inaccessible for screen reader users as they receive no context about the button's action.
**Action:** When adding icon-only buttons (like 'X' to close modals, or trash cans to delete rows), ensure they have an `aria-label` attribute describing their function to guarantee accessibility.
