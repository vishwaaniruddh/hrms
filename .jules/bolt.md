## 2024-05-18 - Extracted LiveClock component
**Learning:** Extracting components that update very frequently (like a live clock with `setInterval` every second) from massive parent components prevents the entire parent from unnecessarily re-rendering on every tick.
**Action:** Extract rapidly updating state into isolated, smaller components when the state doesn't need to be shared broadly.
