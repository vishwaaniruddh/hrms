## 2024-05-24 - Lazy loading images in Header and dropdowns
**Learning:** Adding loading="lazy" to above-the-fold images like the main logo is a performance anti-pattern that delays the Largest Contentful Paint (LCP). It's crucial to only target below-the-fold assets, such as avatars in dropdown menus or lists further down the page.
**Action:** Always manually check the location of images before applying `loading="lazy"`. In this codebase, the avatars within dropdowns in the Header, Attendence, and Salary components are perfect candidates, while the main logo is not.
