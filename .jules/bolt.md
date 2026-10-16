## 2024-10-18 - Prevent full re-renders from digital clocks
**Learning:** Placing a `setInterval` that updates state every second inside a large, data-heavy dashboard component (like `EmployeeSelfService`) forces the entire component tree to re-render on every tick.
**Action:** Always extract continuously updating UI elements (like live clocks or timers) into their own small, isolated components to prevent unnecessary re-renders of the parent layout.
