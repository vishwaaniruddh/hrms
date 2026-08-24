const fs = require('fs');

function addLazyLoadingToImages(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Use a regular expression to match <img> tags
    // We only want to add loading="lazy" if it doesn't already have it
    // Note: We need to be careful about not adding lazy loading to above-the-fold images (like logos).

    // For Header.jsx, logo images should NOT be lazy-loaded.
    // The dropdown flags and avatar images are below the fold (or hidden initially in a dropdown)
    // so they are good candidates for lazy loading.

    if (filePath.includes('Header.jsx')) {
        // Avatars and flags in header
        content = content.replace(/<img([^>]*)src={B_avatarImage}([^>]*)>/g, (match, p1, p2) => {
            if (!match.includes('loading="lazy"')) { changed = true; return `<img${p1}src={B_avatarImage} loading="lazy"${p2}>`; } return match;
        });
        content = content.replace(/<img([^>]*)src={C_avatarImage}([^>]*)>/g, (match, p1, p2) => {
            if (!match.includes('loading="lazy"')) { changed = true; return `<img${p1}src={C_avatarImage} loading="lazy"${p2}>`; } return match;
        });
        content = content.replace(/<img([^>]*)src={A_avatarImage}([^>]*)>/g, (match, p1, p2) => {
            if (!match.includes('loading="lazy"')) { changed = true; return `<img${p1}src={A_avatarImage} loading="lazy"${p2}>`; } return match;
        });

        // Don't lazy load english_sq as it's the main quick icon that might be visible immediately.
        // The ones inside the dropdown menu can be lazy loaded
        content = content.replace(/<img([^>]*)src={english}([^>]*)>/g, (match, p1, p2) => {
            if (!match.includes('loading="lazy"')) { changed = true; return `<img${p1}src={english} loading="lazy"${p2}>`; } return match;
        });
        content = content.replace(/<img([^>]*)src={spanish}([^>]*)>/g, (match, p1, p2) => {
            if (!match.includes('loading="lazy"')) { changed = true; return `<img${p1}src={spanish} loading="lazy"${p2}>`; } return match;
        });
        content = content.replace(/<img([^>]*)src={french}([^>]*)>/g, (match, p1, p2) => {
            if (!match.includes('loading="lazy"')) { changed = true; return `<img${p1}src={french} loading="lazy"${p2}>`; } return match;
        });
        content = content.replace(/<img([^>]*)src={turkey}([^>]*)>/g, (match, p1, p2) => {
            if (!match.includes('loading="lazy"')) { changed = true; return `<img${p1}src={turkey} loading="lazy"${p2}>`; } return match;
        });
    }

    if (filePath.includes('Attendence.jsx') || filePath.includes('Salary.jsx')) {
        // We will leave the logo image as is, but we will lazy load the avatars.
        // Let's replace the avatars.

        content = content.replace(/<img src="\/demo7\/images\/avatar\/b-sm\.jpg" alt="" \/>/g,
                                 '<img src="/demo7/images/avatar/b-sm.jpg" alt="" loading="lazy" />');
        content = content.replace(/<img src="\/demo7\/images\/avatar\/c-sm\.jpg" alt="" \/>/g,
                                 '<img src="/demo7/images/avatar/c-sm.jpg" alt="" loading="lazy" />');
        content = content.replace(/<img src="\/demo7\/images\/avatar\/a-sm\.jpg" alt="" \/>/g,
                                 '<img src="/demo7/images/avatar/a-sm.jpg" alt="" loading="lazy" />');

        changed = true; // We can assume it changed if we are here for these files.
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

addLazyLoadingToImages('src/components/header/Header.jsx');
addLazyLoadingToImages('src/components/hrms/Attendence.jsx');
addLazyLoadingToImages('src/components/hrms/Salary.jsx');
