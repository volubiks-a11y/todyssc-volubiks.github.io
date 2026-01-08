const fs = require('fs');
const path = require('path');

/**
 * This script generates placeholder images with proper naming conventions:
 * J* = Jewelries
 * C* = Clothing
 * D* = Drinks
 * 
 * It also creates special hero images for the landing page
 */

const CATEGORIES = {
  jewelries: { prefix: 'J', color: '#c9a961', accent: '#d4af37' },
  clothings: { prefix: 'C', color: '#4a90e2', accent: '#357abd' },
  drinks: { prefix: 'D', color: '#e74c3c', accent: '#c0392b' }
};

// Create a simple SVG image generator
function generateSVGImage(prefix, number, isHero = false) {
  const cat = Object.values(CATEGORIES).find(c => c.prefix === prefix);
  const bgColor = cat.color;
  const accentColor = cat.accent;
  
  if (isHero) {
    // Large hero image with category theme
    const categoryMap = { J: 'Jewelries', C: 'Clothing', D: 'Drinks' };
    const categoryName = categoryMap[prefix];
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${prefix}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="600" fill="url(#grad-${prefix})"/>
  <circle cx="200" cy="150" r="80" fill="rgba(255,255,255,0.1)"/>
  <circle cx="1000" cy="450" r="120" fill="rgba(255,255,255,0.1)"/>
  <rect x="50" y="250" width="1100" height="150" fill="rgba(255,255,255,0.05)" rx="10"/>
  <text x="600" y="350" font-size="72" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">${categoryName}</text>
  <text x="600" y="420" font-size="28" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif">Curated Collection</text>
</svg>`;
  } else {
    // Product thumbnail
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="prod-${prefix}-${number}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#prod-${prefix}-${number})"/>
  <circle cx="100" cy="80" r="50" fill="rgba(255,255,255,0.15)"/>
  <circle cx="320" cy="320" r="70" fill="rgba(255,255,255,0.1)"/>
  <rect x="80" y="150" width="240" height="140" fill="rgba(255,255,255,0.1)" rx="8"/>
  <text x="200" y="235" font-size="48" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">${prefix}${number}</text>
  <text x="200" y="290" font-size="16" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif">Premium Product</text>
</svg>`;
  }
}

function createImagesDirectory() {
  const imagesDir = path.join(__dirname, '../public/data/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`✓ Created directory: ${imagesDir}`);
  }
  return imagesDir;
}

function generateProductImages() {
  const imagesDir = createImagesDirectory();
  let imageCount = 0;
  
  // Generate 30 product images: 10 per category (J1-J10, C1-C10, D1-D10)
  Object.entries(CATEGORIES).forEach(([category, config]) => {
    for (let i = 1; i <= 10; i++) {
      const filename = `${config.prefix}${i}.jpg`;
      const filepath = path.join(imagesDir, filename);
      
      // Using SVG as JPG placeholder
      const svg = generateSVGImage(config.prefix, i);
      fs.writeFileSync(filepath, svg);
      console.log(`✓ Generated: ${filename}`);
      imageCount++;
    }
  });
  
  return imageCount;
}

function generateHeroImages() {
  const imagesDir = createImagesDirectory();
  const heroDir = path.join(imagesDir, 'hero');
  
  if (!fs.existsSync(heroDir)) {
    fs.mkdirSync(heroDir, { recursive: true });
  }
  
  Object.entries(CATEGORIES).forEach(([category, config]) => {
    const filename = `${category}-hero.jpg`;
    const filepath = path.join(heroDir, filename);
    
    const svg = generateSVGImage(config.prefix, 0, true);
    fs.writeFileSync(filepath, svg);
    console.log(`✓ Generated hero image: ${filename}`);
  });
}

function generateProductsJSON() {
  const productsPath = path.join(__dirname, '../public/data/products.json');
  const products = [];
  let id = 1;
  
  Object.entries(CATEGORIES).forEach(([category, config]) => {
    for (let i = 1; i <= 10; i++) {
      products.push({
        id: String(id),
        name: `${config.prefix} Premium Item #${i}`,
        slug: `${config.prefix.toLowerCase()}-item-${i}`,
        price: 2000 + (id * 100),
        currency: "NGN",
        image: `/data/images/${config.prefix}${i}.jpg`,
        images: [
          `/data/images/${config.prefix}${i}.jpg`
        ],
        description: `Exclusive premium ${category} collection item ${i}`,
        category: category,
        featured: id % 5 === 0,
        inventory: 10 + id,
        tags: ["premium", "handcrafted", "quality", category.slice(0, -1)]
      });
      id++;
    }
  });
  
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
  console.log(`\n✓ Updated products.json with ${products.length} products`);
}

console.log('🎨 Generating images with naming convention...\n');
console.log('Naming convention:');
console.log('  J* = Jewelries (Gold theme)');
console.log('  C* = Clothing (Blue theme)');
console.log('  D* = Drinks (Red theme)\n');

try {
  const count = generateProductImages();
  console.log(`\n✓ Generated ${count} product images\n`);
  
  generateHeroImages();
  console.log(`\n✓ Generated 3 hero images for landing page\n`);
  
  generateProductsJSON();
  console.log(`\n✅ Image generation complete!`);
  console.log('\nImages location: public/data/images/');
  console.log('Hero images: public/data/images/hero/');
} catch (err) {
  console.error('❌ Error generating images:', err.message);
  process.exit(1);
}
