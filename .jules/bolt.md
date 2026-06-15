## 2026-06-15 - Code Splitting Implementation
**Learning:** Found that `React.lazy()` and `<Suspense>` are highly effective for code splitting route components, reducing the initial JavaScript bundle size and improving initial page load times.
**Action:** Always consider route-based code splitting using `Suspense` when adding new routes to prevent bloat in the main bundle.
