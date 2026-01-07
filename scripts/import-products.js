#!/usr/bin/env node
// Simple import script: reads CSV or Excel file and outputs data/products.json
// Usage: node scripts/import-products.js <path-to-file> [--copy-images]

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const http = require('http');
const https = require('https');

const inFile = process.argv[2];
if (!inFile) {
  console.error('Usage: node scripts/import-products.js <path-to-file> [--copy-images]');
  process.exit(1);
}

const root = process.cwd();
const outFile = path.join(root, 'public', 'data', 'products.json');

function parseCSVorXLSX(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') {
    // Read CSV via XLSX for simplicity
    const wb = XLSX.readFile(filePath, { type: 'file' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { defval: '' });
  }
  if (ext === '.xlsx' || ext === '.xls') {
    const wb = XLSX.readFile(filePath);
    console.log('Sheet names:', wb.SheetNames);
    const categories = ['jewelries', 'clothings', 'drinks'];
    let allRows = [];
    wb.SheetNames.forEach((sheetName, index) => {
      if (index < categories.length) {
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const categorizedRows = rows.map(row => ({ ...row, category: categories[index] }));
        allRows = allRows.concat(categorizedRows);
      }
    });
    return allRows;
  }
  throw new Error('Unsupported file type: ' + ext);
}

async function main() {
  try {
    const rows = parseCSVorXLSX(path.resolve(inFile));
    console.log('Parsed', rows.length, 'rows from', inFile);
    console.log('First few rows:', rows.slice(0, 5).map(r => ({ id: r.id, name: r.name })));

    const copyImages = process.argv.includes('--copy-images');
    const overwriteImages = process.argv.includes('--overwrite-images');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const importDir = path.join(root, 'data', 'imports', timestamp);
    const imagesDir = path.join(importDir, 'images');

    if (copyImages) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // directory where images will be copied so the app can serve them
    // Centralized in public/data/images for easier management
    const publicImagesDir = path.join(root, 'public', 'data', 'images');
    if (copyImages) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }

    // helper to avoid overwriting existing files in public/images (unless overwriteImages is set)
    function uniqueDest(dir, name) {
      let dest = path.join(dir, name);
      if (!fs.existsSync(dest)) return dest;
      const ext = path.extname(name);
      const base = path.basename(name, ext);
      let i = 1;
      while (fs.existsSync(path.join(dir, `${base}-${i}${ext}`))) i++;
      return path.join(dir, `${base}-${i}${ext}`);
    }

    // Normalize fields: ensure expected columns, convert types
    const normalized = await Promise.all(rows.map(async (r, i) => {
      const id = r.id || (i + 1);
      const product = {
        id: String(id),
        name: (r.name || '').trim(),
        slug: (r.slug || '').trim() || (r.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        price: Number(r.price || 0),
        currency: (r.currency || 'NGN').toUpperCase(),
        image: '', // primary image (backwards-compatible)
        images: [], // ordered list of images for product gallery
        description: (r.description || '').trim(),
        category: (r.category || '').trim(),
        featured: String(r.featured || '').toLowerCase() === 'true',
        inventory: Number(r.inventory || 0),
        tags: (typeof r.tags === 'string' && r.tags.length) ? r.tags.split(/[,;]+/).map(s => s.trim()) : []
      };

      // helpers to find local images in the input file directory that belong to this product
      const inputDir = path.dirname(path.resolve(inFile));
      function findLocalImagesByBase(base) {
        const results = [];
        const searchDirs = [inputDir, publicImagesDir];
        for (const dir of searchDirs) {
          try {
            const files = fs.readdirSync(dir);
            files.forEach(n => {
              const ext = path.extname(n).toLowerCase();
              if (!['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) return;
              const bn = path.basename(n, ext);
              if (bn === base || bn.startsWith(`${base}(`) || bn.startsWith(`${base}-`) || bn.startsWith(`${base}_`)) {
                results.push(path.join(dir, n));
              }
            });
          } catch (e) {
            // ignore unreadable directories
          }
        }
        return Array.from(new Set(results));
      }

      // collect image sources: can be comma-separated list, URLs, or local files matching product id/base
      function collectImageSources() {
        const raw = (r.image || '').trim();
        if (raw.length) {
          const parts = raw.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
          const out = [];
          for (const p of parts) {
            if (/^https?:\/\//i.test(p)) {
              out.push(p);
            } else {
              const resolved = path.resolve(inputDir, p);
              if (fs.existsSync(resolved)) {
                out.push(resolved);
                const base = path.basename(p, path.extname(p));
                const extras = findLocalImagesByBase(base).filter(x => x !== resolved);
                out.push(...extras);
              } else {
                // check if p references the project's public images (e.g., '/images/foo.jpg') or an absolute path
                if (p.startsWith('/images') || path.isAbsolute(p)) {
                  const alt = p.startsWith('/images') ? path.join(publicImagesDir, path.basename(p)) : p;
                  if (fs.existsSync(alt)) {
                    out.push(alt);
                    const base = path.basename(alt, path.extname(alt));
                    const extras = findLocalImagesByBase(base).filter(x => x !== alt);
                    out.push(...extras);
                    continue;
                  }
                }
                // try treating p as base name (without extension)
                const extras = findLocalImagesByBase(p);
                if (extras.length) out.push(...extras);
                else out.push(p); // keep as-is (might be a remote URL without scheme, or missing)
              }
            }
          }
          return out;
        } else {
          // no image field: try to find images by product id in input dir
          return findLocalImagesByBase(String(id));
        }
      }

      const sources = collectImageSources();

      if (copyImages && sources.length > 0) {
        const savedPublicPaths = [];
        for (let idx = 0; idx < sources.length; idx++) {
          const src = sources[idx];
          try {
            // determine extension
            let ext = path.extname(src);
            if (!ext && /^https?:\/\//i.test(src)) {
              try { ext = path.extname(new URL(src).pathname) || '.jpg'; } catch (e) { ext = '.jpg'; }
            }
            // build basename: use slug (fallback to id) for readable filenames
            const baseForFilename = (product.slug || product.id || String(id)).toString()
              .toLowerCase()
              .replace(/[^a-z0-9-_]+/g, '-')
              .replace(/(^-|-$)/g, '') || String(product.id);
            const suffix = idx === 0 ? '' : `(${idx})`;
            const filename = `${baseForFilename}${suffix}${ext || '.jpg'}`;
            const destPath = path.join(imagesDir, filename);

            if (/^https?:\/\//i.test(src)) {
              await downloadImage(src, destPath);
              const publicDest = overwriteImages ? path.join(publicImagesDir, filename) : uniqueDest(publicImagesDir, filename);
              fs.copyFileSync(destPath, publicDest);
              savedPublicPaths.push(path.posix.join('/data/images', path.basename(publicDest)));
            } else {
              const resolved = path.resolve(src);
              if (fs.existsSync(resolved)) {
                fs.copyFileSync(resolved, destPath);
                const publicDest = overwriteImages ? path.join(publicImagesDir, filename) : uniqueDest(publicImagesDir, filename);
                fs.copyFileSync(resolved, publicDest);
                  savedPublicPaths.push(path.posix.join('/data/images', path.basename(publicDest)));
              } else {
                console.warn(`Image not found for product id=${product.id}: ${src}`);
              }
            }
          } catch (e) {
            console.warn(`Failed to copy/download image for product id=${product.id}: ${e.message}`);
          }
        }
        product.images = savedPublicPaths;
        product.image = product.images[0] || '';
      } else {
        // not copying images: just set images array to URLs or local paths if present
        const out = [];
        for (const s of sources) {
          if (/^https?:\/\//i.test(s)) out.push(s);
          else if (fs.existsSync(s)) out.push(s);
        }
        product.images = out;
        product.image = product.images[0] || (typeof r.image === 'string' ? r.image.trim() : '');
      }

      return product;
    }));

    // Write the global products.json (existing behavior)
    fs.writeFileSync(outFile, JSON.stringify(normalized, null, 2), 'utf8');
    console.log('Wrote', outFile, 'with', normalized.length, 'products');

    // If images were copied, also write a copy of the JSON into the import folder
    if (copyImages) {
      const importOut = path.join(importDir, 'products.json');
      fs.writeFileSync(importOut, JSON.stringify(normalized, null, 2), 'utf8');
      console.log('Also wrote import JSON and images to', importDir);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// small helper to download remote images when needed
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('Failed to download image, status ' + res.statusCode));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', (err) => reject(err));
    });
    req.on('error', reject);
  });
}

main();
