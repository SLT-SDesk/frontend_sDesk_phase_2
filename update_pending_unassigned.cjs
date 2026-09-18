const fs = require('fs');
const path = require('path');

function getAllGls(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllGls(filePath, fileList);
        } else if (filePath.endsWith('.jsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const files = getAllGls('src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    content = content.replace(/if\s*\(!serviceNumber\s*\|\|\s*String\(serviceNumber\)\.trim\(\)\s*===\s*['"]{2}\)\s*(?:return\s*['"]Unassigned['"];\s*)/g,
        `if (!serviceNumber || String(serviceNumber).trim() === '') {\n      if (status === "Pending Tier2 Assignment") return "Tier 2 Support";\n      if (status === "Pending Tier3 Assignment") return "Tier 3 Support";\n      return "Unassigned";\n    }\n    `
    );

    content = content.replace(/const getUserName = \(\s*serviceNumber\s*\) => {/g, 'const getUserName = (serviceNumber, status = null) => {');

    // We should also replace the specific usages in the map function or assignment block.
    // There are two common patterns for assignments:
    // 1: affectedUser: getUserName(item.informant) => getUserName(item.informant)
    // 2: assignedTo: getUserName(item.handler) => getUserName(item.handler, item.status)
    content = content.replace(/getUserName\((item|incident|currentIncident|row|item_temp|data)\.(handler|assignedTo)\)/g, 'getUserName($1.$2, $1.status)');

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log('Patched', file);
    }
});
