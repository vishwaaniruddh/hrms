## 2024-05-18 - Avoid unnecessary array recreation on renders
**Learning:** Returning static arrays (like breadcrumbs config) directly inside a component's render function body causes array reference recreation on every re-render, which can lead to expensive DOM diffing if passed to pure children.
**Action:** Use `useMemo` to memoize derived structured configurations based on state (like URL path), or hoist them out of the component if completely static.
