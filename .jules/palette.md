## 2024-05-15 - Command Palette Keyboard Navigation
**Learning:** Command palette doesn't have an ARIA role or keyboard navigation that announces the selected element. Wait, it might have it, but usually custom command palettes are missing aria roles.
**Action:** Ensure custom command palettes have aria-activedescendant or proper roles if they use arrow keys.
