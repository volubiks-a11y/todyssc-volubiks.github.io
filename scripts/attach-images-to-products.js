const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/data/images');
const productsPath = path.join(__dirname, '../public/data/products.json');

if (!fs.existsSync(productsPath)) {
  console.error('products.json not found at', productsPath);
  process.exit(1);
}

const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const files = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];

// Helper: get files matching prefix (case-sensitive)
function matchingFiles(prefix) {
  const re = new RegExp('^' + prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '(?:$|[_\-].*)', 'i');
  // collect files that start with prefix (like C1, C1_1, C1-2, etc.) and common image extensions
  return files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) return false;
    return re.test(f);
  }).sort((a,b) => {
    // ensure base name (no underscore) comes first, then numeric/lexicographic
    const aScore = a.includes('_') || a.includes('-') ? 1 : 0;
    const bScore = b.includes('_') || b.includes('-') ? 1 : 0;
    if (aScore !== bScore) return aScore - bScore;
    return a.localeCompare(b, undefined, {numeric:true});
  });
}

let changed = false;
products.forEach(p => {
  // determine base prefix from p.image or p.slug
  let base = null;
  if (p.image) {
    const bn = path.basename(p.image);
    // e.g. C1.jpg or /data/images/C1.jpg
    base = bn.replace(path.extname(bn), '');
  }
  if (!base && p.slug) {
    base = p.slug.split('-')[1] || p.slug;
  }
  if (!base) return;

  const matched = matchingFiles(base);
  if (matched.length) {
    const mapped = matched.map(f => '/data/images/' + f);
    // only update if different
    const existing = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
    const equal = existing.length === mapped.length && existing.every((v,i)=>v===mapped[i]);
    if (!equal) {
      p.images = mapped;
      p.image = mapped[0] || p.image;
      changed = true;
      console.log(`Updated product ${p.id} images ->`, mapped.slice(0,4), mapped.length>4?('(+ '+(mapped.length-4)+' more)'): '');
    }
  } else {
    // no matched extras; ensure images array contains the single image path
    const existing = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
    if (existing.length === 0 && p.image) {
      p.images = [p.image];
      changed = true;
    }
  }
});

if (changed) {
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  console.log('\nSaved updated products.json with attached images.');
} else {
  console.log('No changes required - products already reference available images.');
}

process.exit(0);
