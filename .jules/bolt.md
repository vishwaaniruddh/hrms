## 2024-09-01 - Optimizing Images
**Learning:** Adding `loading="lazy"` to images (especially avatars in dropdowns, chats, lists) improves frontend performance significantly. Do not apply it to above-the-fold elements like logos.
**Action:** When acting as Bolt and optimizing images, add `loading="lazy"` only to below-the-fold images or avatars that don't need to load immediately.
