#!/usr/bin/env node
// Run the import script on an interval (default: 2 minutes)
const { exec } = require('child_process');
const path = require('path');

const inFile = process.argv[2] || 'public/data/products.csv';
const intervalMs = Number(process.argv[3]) || 120000; // 2 minutes
const flags = ['--copy-images', '--overwrite-images'];

console.log(`Interval importer starting for ${inFile}, every ${intervalMs}ms`);

function runImport() {
  const cmd = `node scripts/import-products.js ${inFile} ${flags.join(' ')}`;
  const start = Date.now();
  exec(cmd, (err, stdout, stderr) => {
    const took = Date.now() - start;
    if (err) console.error('Import error:', err);
    else console.log(`Import finished in ${took}ms`);
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  });
}

// run immediately, then on interval
runImport();
setInterval(runImport, intervalMs);
