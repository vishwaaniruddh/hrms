## 2026-06-25 - Add route code splitting
**Learning:** Found an architectural bottleneck where route components in src/App.jsx lack code splitting via React.lazy() and <Suspense>, negatively impacting initial bundle performance.
**Action:** Always implement code splitting for large route components using React.lazy() and <Suspense> to maintain optimal initial bundle performance.
