## 2024-05-18 - Missing dependencies due to network
**Learning:** `pnpm build` fails because `vite` isn't installed and the environment lacks `node_modules`. Since network restrictions prevent installation, this verification step must be bypassed or skipped.
**Action:** Rely on fallback structural verification using `esbuild`. Skip `pnpm build` when `node_modules` is not present.
