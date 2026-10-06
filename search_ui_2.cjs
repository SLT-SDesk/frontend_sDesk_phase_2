const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    // looking for > Technician < or similar visible UI texts
    if (/>[^<]*[Tt]echnician.*\b/.test(line)) {
      console.log(`${file}:${i + 1}: ${line.trim()}`);
    }
    // look for placeholders, labels, titles
    else if (/(placeholder|label|title)=["'][^"']*[Tt]echnician[^"']*["']/.test(line)) {
      console.log(`${file}:${i + 1}: ${line.trim()}`);
    }
    // look for visible strings in objects like { title: 'Technician ...' }
    else if (/(title|label|name|text):\s*["'][^"']*[Tt]echnician[^"']*["']/.test(line)) {
      console.log(`${file}:${i + 1}: ${line.trim()}`);
    }
    // any loose string containing Technician that is not a standard camel/pascal casing usage like TechnicianLayout
    else if (/\{\s*["'][^"']*[Tt]echnician[^"']*["']/.test(line)) {
      if(!line.includes('technicianSlice') && !line.includes('TechnicianLayout')) {
        console.log(`${file}:${i + 1}: ${line.trim()}`);
      }
    }
  });
});
