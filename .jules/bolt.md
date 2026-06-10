## 2024-06-10 - Route Components Code Splitting

**Learning:** Route components in `src/App.jsx` (such as `Member`, `MemberProfile`, `Attendence`, `Salary`) have been refactored to use `React.lazy()` and `<Suspense>` for code splitting. This is a crucial architectural pattern for maintaining initial bundle performance.

**Action:** Ensure any future routes added to `App.jsx` follow this dynamic loading pattern rather than static imports to prevent regressions in bundle size.
