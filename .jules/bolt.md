## 2024-05-18 - Route Code Splitting
**Learning:** Static imports of large route components (like Member, Salary, Attendence) in App.jsx cause the initial JavaScript bundle size to be unnecessarily large, leading to slower Time to Interactive (TTI). This is a common bottleneck in React SPA architectures.
**Action:** Always check the main routing file for static imports and replace them with React.lazy() combined with a Suspense boundary to dynamically load chunks only when users navigate to those specific routes.
