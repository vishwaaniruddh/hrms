## 2024-05-09 - Initialization
**Learning:** The project is using vite. When doing the build, I found some script files embedded in index.html like `src/utils/bundle.js` missing type="module" which blocked the build, so I added it to let build pass.
**Action:** Check index.html imports before running vite build if build fails.
## 2024-05-09 - Code Splitting Routes
**Learning:** The initial bundle size was very large (1.3MB) because all components were bundled together into index.js. Using dynamic import() to lazy load route components significantly reduced the main bundle size.
**Action:** Use React.lazy() and Suspense for code splitting route components to improve initial load performance.
