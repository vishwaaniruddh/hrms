## 2024-05-16 - Route Code Splitting Optimization
**Learning:** The React app's main entrypoint `src/App.jsx` originally synchronously loaded all main components (`Member`, `MemberProfile`, `Attendence`, `Salary`), resulting in a larger monolithic initial load.
**Action:** Implemented dynamic route loading using `React.lazy()` and `<Suspense>` for top-level routes to defer loading heavy chunked components until navigation occurs, enhancing the initial time-to-interactive metric.
