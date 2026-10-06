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
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');
const patterns = [
  />([^<]*[Tt]echnician[^<]*)</g,
  /placeholder=["']([^"']*[Tt]echnician[^"']*)["']/g,
  /label=["']([^"']*[Tt]echnician[^"']*)["']/g,
  /title=["']([^"']*[Tt]echnician[^"']*)["']/g,
  /description=["']([^"']*[Tt]echnician[^"']*)["']/g,
  /["']([Tt]echnician)["']/g,
  /["']([Aa]dd [Tt]echnician)["']/g,
  /["']([Aa]ll [Tt]echnician)["']/g,
  /["']([Ss]elect [Tt]echnician)["']/g,
  />([^<]*[Tt]echnicians?[^<]*)</g,
  /Role:\s*[Tt]echnician/g
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (
      // filter out typical variable / import / component usages if possible
      !line.includes('import ') &&
      !line.includes('className') &&
      !line.includes('navigate(') &&
      !line.includes('technicianSlice')
    ) {
      // test against pattern
      let matched = false;
      for (const p of patterns) {
        if (p.test(line)) {
          matched = true;
          break;
        }
      }
      if (matched) {
        console.log(`${file}:${i + 1}: ${line.trim()}`);
      }
    }
  });
});
