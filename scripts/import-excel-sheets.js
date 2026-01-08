#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Usage: node scripts/import-excel-sheets.js path/to/file.xlsx
// This script reads all sheets in the workbook and maps them to categories:
// sheet name contains 'jewel' => category 'jewelries' prefix 'J'
// sheet name contains 'cloth' => category 'clothings' prefix 'C'
// sheet name contains 'drink' => category 'drinks' prefix 'D'
// It will create `public/data/products.import.json` (preview) and will NOT delete or rename any files.

const argv = process.argv.slice(2);
if (!argv[0]) {
  console.error('Usage: node scripts/import-excel-sheets.js path/to/file.xlsx');
  process.exit(1);
}

const workbookPath = path.resolve(argv[0]);
if (!fs.existsSync(workbookPath)) {
  console.error('File not found:', workbookPath);
  process.exit(1);
}

const wb = xlsx.readFile(workbookPath, { cellDates: true });
const sheets = wb.SheetNames;
const products = [];
let globalId = 1;

const normalize = (s) => (s || '').toString().trim().toLowerCase();

for (const sheetName of sheets) {
  const lower = normalize(sheetName);
  let category = null;
  let prefix = null;
  if (lower.includes('jewel')) {
    category = 'jewelries';
    prefix = 'J';
  } else if (lower.includes('cloth')) {
    category = 'clothings';
    prefix = 'C';
  } else if (lower.includes('drink')) {
    category = 'drinks';
    prefix = 'D';
  } else {
    // default to clothings if unknown — safe fallback because available images are clothing
    category = 'clothings';
    prefix = 'C';
  }

  const sheet = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  let idx = 1;
  for (const row of rows) {
    // expected columns: name, slug, price, currency, image(optional), description, inventory, tags
    const name = row.name || row.Name || row.Title || `Item ${globalId}`;
    const slug = row.slug || row.Slug || (name && name.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-')) || `item-${globalId}`;
    const price = Number(row.price || row.Price || row.cost) || 0;
    const currency = row.currency || row.Currency || 'NGN';
    const desc = row.description || row.Description || '';
    const inventory = Number(row.inventory || row.Inventory || 0) || 0;
    const tagsCell = row.tags || row.Tags || '';
    const tags = Array.isArray(tagsCell) ? tagsCell : (tagsCell ? tagsCell.toString().split(/[,;|]/).map(t=>t.trim()).filter(Boolean) : []);

    // Determine image path: prefer provided image cell, otherwise construct using prefix and index
    let imageCell = row.image || row.Image || '';
    let imagePath = '';
    if (imageCell) {
      imagePath = imageCell.toString();
      // ensure leading slash for web paths if not local file
      if (!imagePath.startsWith('/')) imagePath = '/data/images/' + imagePath;
    } else {
      imagePath = `/data/images/${prefix}${idx}.jpg`;
    }

    products.push({
      id: String(globalId),
      name: String(name),
      slug: String(slug),
      price: price,
      currency: currency,
      image: imagePath,
      images: [imagePath],
      description: String(desc),
      category: category,
      featured: !!(globalId % 5 === 0),
      inventory: inventory || (10 + idx),
      tags: tags.length ? tags : [category.slice(0, -1)]
    });

    globalId++;
    idx++;
  }
}

const outPath = path.join(__dirname, '../public/data/products.import.json');
fs.writeFileSync(outPath, JSON.stringify(products, null, 2));
console.log('✅ Import preview written to', outPath);
console.log('Review the file before replacing public/data/products.json. The script does NOT remove or rename any images.');
console.log('\nSummary:');
const counts = products.reduce((acc, p) => (acc[p.category] = (acc[p.category]||0)+1, acc), {});
console.log(counts, 'total:', products.length);

process.exit(0);
