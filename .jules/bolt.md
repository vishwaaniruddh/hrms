## 2024-06-12 - Layout Rendering Quirk
**Learning:** In src/App.jsx, MainLayout is used as a self-closing sibling to Routes rather than a wrapper.
**Action:** When adding code splitting, wrap only Routes with Suspense and leave MainLayout as a sibling.
