const fs = require('fs');
const path = require('path');

const directoriesToScan = ['app', 'components'];

const replacements = [
    // Fix the broken $2 interpolations from the previous run
    { regex: /bg-slate-100\/\$2 dark:(bg-slate-900\/([0-9]+))/g, replace: 'bg-slate-100/$2 dark:$1' },
    { regex: /bg-slate-200\/\$2 dark:(bg-slate-800\/([0-9]+))/g, replace: 'bg-slate-200/$2 dark:$1' },
    { regex: /bg-slate-300\/\$2 dark:(bg-slate-700\/([0-9]+))/g, replace: 'bg-slate-300/$2 dark:$1' },
];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    replacements.forEach(({ regex, replace }) => {
        content = content.replace(regex, replace);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath}`);
    }
}

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

directoriesToScan.forEach(dir => scanDir(path.join(__dirname, dir)));
console.log("Fix complete!");
