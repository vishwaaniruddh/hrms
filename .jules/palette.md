## 2024-03-24 - Missing ARIA Labels on Dialog Close Buttons
**Learning:** Dialog close buttons missing aria-labels. Found the pattern `<button className="dialog-close-btn"><X/></button>` repeated 37 times in HRMS components.
**Action:** Applied generic `aria-label="Close"` to all standard modal and dialogue close buttons.
