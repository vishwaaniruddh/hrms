## 2026-07-04 - Code Splitting Route Components
**Learning:** Initial bundle sizes can grow rapidly in single-page applications. Implementing React.lazy and Suspense for route components splits them into separate chunks, loading them only when the user navigates to those paths, dramatically improving initial load performance.
**Action:** Always consider code splitting route-level components in React applications, particularly when components contain heavy logic or large dependencies.
