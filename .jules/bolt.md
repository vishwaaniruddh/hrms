## 2025-05-10 - Route Code Splitting Optimization
**Learning:** The application bundle was significantly large due to all route components being imported statically in `App.jsx`, preventing efficient initial load.
**Action:** Implemented React's lazy loading and Suspense for route components in `App.jsx`. This successfully split the main bundle, reducing it from 271K to 206K, and generated smaller, separate chunks for `Member`, `MemberProfile`, `Attendence`, and `Salary`. Next time, apply dynamic imports for large route components by default.
