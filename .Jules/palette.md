## 2024-05-07 - React Version Mismatch in Package.json
**Learning:** Adding new dependencies with `pnpm add <package>` without specifying the exact version might lead to unintended updates. In this case, `react-dom` was updated to `^19.2.6` while `react` remained at `^18.2.0`, causing a critical version mismatch issue that breaks the app.
**Action:** Always avoid updating or adding new UI dependencies unless explicitly required. If you must add a dependency, check existing matching packages (like `react`) to make sure versions align strictly.
