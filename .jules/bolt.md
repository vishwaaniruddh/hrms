## 2024-05-29 - Code Splitting Implementation
**Learning:** The React application in this codebase lacked route-level code splitting, causing all route components to be bundled together. However, implementing `React.lazy` and `<Suspense>` is highly effective and simple for Vite/React 18 setups, successfully creating multiple lightweight chunks out-of-the-box.
**Action:** Always check for `React.lazy` usage in top-level routing (like `App.jsx`) when encountering large React applications, as it provides a low-risk, high-reward reduction in initial load time.
