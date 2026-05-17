## 2024-05-17 - React Route Code Splitting
**Learning:** Initial application load can be slow due to large component bundles (like `Attendence.jsx` at ~39KB and `Salary.jsx` at ~31KB) being loaded synchronously in `src/App.jsx`.
**Action:** Always implement code splitting with `React.lazy` and `Suspense` for top-level route components to reduce the initial JavaScript bundle size and defer loading until the routes are actually visited.

## 2024-05-17 - Workspace Hygiene
**Learning:** Running `npm` commands or installing new tools (like updating eslint via npm) can inadvertently modify `package.json`, `package-lock.json`, and introduce conflicting lockfiles (e.g., `pnpm-lock.yaml`), violating the constraint to never modify `package.json` without instruction.
**Action:** Always meticulously check `git status` and use `git restore` or `git reset HEAD` to revert any unauthorized changes to configuration files or lockfiles before committing code changes. Ensure tests and linting steps do not leave behind artifacts or unwanted file modifications.
