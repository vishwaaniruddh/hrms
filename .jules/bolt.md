## 2024-05-18 - Image Optimization
**Learning:** Native `pnpm build` fails because `react-dom/client` cannot be resolved in `src/main.jsx`.
**Action:** When evaluating changes for performance like adding `loading="lazy"` to `<img>` tags, fallback to `esbuild` for syntax checking since full vite build fails due to setup issues.
## 2024-05-18 - Lazy Loading Optimization Issue
**Learning:** Applying lazy loading to above-the-fold assets (like logos) is a performance anti-pattern because it delays LCP (Largest Contentful Paint).
**Action:** When adding `loading="lazy"`, carefully target only below-the-fold assets, like avatars or lists further down the page.
