## 2026-07-04 - Add ARIA labels to quick nav icon buttons
**Learning:** The custom UI patterns in this app rely heavily on `.nk-quick-nav-icon` and `.dropdown-toggle` links that only contain icons (e.g., `<em className="icon ...">`). These visually clean components natively lack accessibility context for screen readers.
**Action:** Always scan for elements using `.nk-quick-nav-icon` or `.btn-icon` classes and ensure they include descriptive `aria-label` attributes to provide context to assistive technologies.
