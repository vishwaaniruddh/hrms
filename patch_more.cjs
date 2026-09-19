const fs = require('fs');

const files = [
  'src/components/hrms/Attendence.jsx',
  'src/components/hrms/Member.jsx',
  'src/components/hrms/Salary.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Add member buttons
  content = content.replace(/<a href="\/demo7\/pharmacy\/add-member\.html" className="btn btn-icon btn-primary d-md-none">/g, '<a href="/demo7/pharmacy/add-member.html" className="btn btn-icon btn-primary d-md-none" aria-label="Add Member">');
  // Toggle search buttons
  content = content.replace(/<a href="#" className="btn btn-icon search-toggle toggle-search" data-target="search">/g, '<a href="#" className="btn btn-icon search-toggle toggle-search" data-target="search" aria-label="Toggle Search">');
  content = content.replace(/<a href="#" class="btn btn-icon search-toggle toggle-search" data-target="search">/g, '<a href="#" class="btn btn-icon search-toggle toggle-search" data-target="search" aria-label="Toggle Search">');
  // Search back buttons
  content = content.replace(/<a href="#" className="search-back btn btn-icon toggle-search" data-target="search">/g, '<a href="#" className="search-back btn btn-icon toggle-search" data-target="search" aria-label="Close Search">');
  content = content.replace(/<a href="#" class="search-back btn btn-icon toggle-search" data-target="search">/g, '<a href="#" class="search-back btn btn-icon toggle-search" data-target="search" aria-label="Close Search">');

  fs.writeFileSync(file, content);
});
console.log('Replaced more buttons.');
