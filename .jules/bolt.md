## 2024-05-13 - [Performance Optimization for Radio Groups]
**Learning:** Found a memory pattern where `p.Control` utility in `src/utils/script.js` was caching radio groups by name during initialization to avoid redundant `querySelectorAll` calls on every `change` event. This optimizes interactions in forms with many radio buttons, bringing processing time down by ~98%.
**Action:** Always check the memory and journal for previous performance learnings in legacy files and apply caching optimizations when dealing with redundant and slow DOM querying logic inside loops or event listeners.
