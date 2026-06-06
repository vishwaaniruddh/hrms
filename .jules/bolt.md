## 2024-06-06 - Route-Based Code Splitting
**Learning:** Initial bundle size can be significantly reduced by dynamically importing route components. The static import structure previously used for `Member`, `MemberProfile`, `Attendence`, and `Salary` forced all their code to load upfront.
**Action:** Use `React.lazy()` and `<Suspense>` to load components only when their respective routes are visited.
