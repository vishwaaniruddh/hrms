## 2024-05-24 - Accessibility improvements for dialogs
**Learning:** Found that most modals across the application have icon-only close buttons lacking \`aria-label\`. Screen readers would announce these as just "button", providing no context. This seems to be a common pattern where "className="dialog-close-btn"" and "className="btn-icon"" are used in conjunction with `<X />` icons.
**Action:** Always add an `aria-label="Close dialog"` to all icon-only buttons like `<button><X /></button>`.
