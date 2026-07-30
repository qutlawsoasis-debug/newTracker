const fs = require('fs');
const code = fs.readFileSync('C:/Users/magne/Documents/GitHub/newTracker/server.js', 'utf8');

const matches = [...code.matchAll(/\.from\(['"]([^'"]+)['"]\)/g)];
const tables = [...new Set(matches.map(m => m[1]))];
console.log('Tables found in server.js:', tables);
