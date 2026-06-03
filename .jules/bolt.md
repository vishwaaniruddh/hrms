## 2024-06-03 - Lazy Loading React Router Components
**Learning:** Large route components like `Attendence`, `Salary`, and `MemberProfile` in `src/App.jsx` were imported synchronously, bloating the initial JS bundle size.
**Action:** Use `React.lazy()` and `<Suspense>` wrapper around React Router `<Routes>` to lazily load route chunks only when navigated to, reducing initial TTFB and load times.
