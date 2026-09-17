const fs = require('fs');

function patchFile(filepath, replacements) {
    let content = fs.readFileSync(filepath, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filepath, content, 'utf8');
}

patchFile('src/components/hrms/Member.jsx', [
    { search: '<button className="search-submit btn btn-icon"><em className="icon ni ni-search"></em></button>', replace: '<button className="search-submit btn btn-icon" aria-label="Submit search"><em className="icon ni ni-search"></em></button>' },
    { search: '<a href="#" className="search-back btn btn-icon toggle-search" data-target="search"><em className="icon ni ni-arrow-left"></em></a>', replace: '<a href="#" className="search-back btn btn-icon toggle-search" data-target="search" aria-label="Close search"><em className="icon ni ni-arrow-left"></em></a>' }
]);

patchFile('src/components/hrms/Attendence.jsx', [
    { search: '<button class="search-submit btn btn-icon"><em class="icon ni ni-search"></em></button>', replace: '<button class="search-submit btn btn-icon" aria-label="Submit search"><em class="icon ni ni-search"></em></button>' },
    { search: '<a href="#" class="search-back btn btn-icon toggle-search" data-target="search"><em class="icon ni ni-arrow-left"></em></a>', replace: '<a href="#" class="search-back btn btn-icon toggle-search" data-target="search" aria-label="Close search"><em class="icon ni ni-arrow-left"></em></a>' }
]);

patchFile('src/components/hrms/Salary.jsx', [
    { search: '<button class="search-submit btn btn-icon"><em class="icon ni ni-search"></em></button>', replace: '<button class="search-submit btn btn-icon" aria-label="Submit search"><em class="icon ni ni-search"></em></button>' },
    { search: '<a href="#" class="search-back btn btn-icon toggle-search" data-target="search"><em class="icon ni ni-arrow-left"></em></a>', replace: '<a href="#" class="search-back btn btn-icon toggle-search" data-target="search" aria-label="Close search"><em class="icon ni ni-arrow-left"></em></a>' }
]);

console.log("Patched successfully");
