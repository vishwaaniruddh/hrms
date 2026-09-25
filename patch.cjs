const fs = require('fs');
const path = require('path');
const dir = 'src/components/hrms/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  let newContent = content;

  // Add aria-label to dialog-close-btn
  newContent = newContent.replace(/<button([^>]*)className=\"dialog-close-btn\"(?!.*aria-label)([^>]*)>/g, '<button$1className=\"dialog-close-btn\" aria-label=\"Close dialog\"$2>');

  // Add aria-label to btn-icon buttons with title, but only if they don't already have one
  newContent = newContent.replace(/<button([^>]*)className=\"([^\"]*btn-icon[^\"]*)\"([^>]*)title=\"([^\"]+)\"(?!.*aria-label)([^>]*)>/g, '<button$1className=\"$2\" aria-label=\"$4\" title=\"$4\"$3$5>');

  if (newContent !== content) {
    fs.writeFileSync(path.join(dir, file), newContent);
    console.log('Patched: ' + file);
  }
});
