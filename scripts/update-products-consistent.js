const fs = require('fs');
const path = require('path');

/**
 * Update products.json with consistent C-prefix naming
 * All images use C prefix (since all are clothing images)
 * But organized by ranges for different categories:
 * C1-C10: Jewelry
 * C11-C20: Clothing
 * C21-C30: Drinks
 */

const products = [];
let id = 1;

// Jewelry products (C1-C10)
for (let i = 1; i <= 10; i++) {
  products.push({
    id: String(id),
    name: `Jewelry Item #${i}`,
    slug: `jewelry-${i}`,
    price: 15000 + (i * 500),
    currency: "NGN",
    image: `/data/images/C${i}.jpg`,
    images: [`/data/images/C${i}.jpg`],
    description: `Exclusive premium jewelry collection item ${i}. Delicate and timeless pieces perfect for any occasion.`,
    category: "jewelries",
    featured: i % 3 === 0,
    inventory: 10 + i,
    tags: ["premium", "handcrafted", "quality", "jewelry", "luxury"]
  });
  id++;
}

// Clothing products (C11-C20)
for (let i = 1; i <= 10; i++) {
  const imgNum = i + 10;
  products.push({
    id: String(id),
    name: `Clothing Item #${i}`,
    slug: `clothing-${i}`,
    price: 5000 + (i * 300),
    currency: "NGN",
    image: `/data/images/C${imgNum}.jpg`,
    images: [`/data/images/C${imgNum}.jpg`],
    description: `Comfortable and stylish clothing collection item ${i}. Premium quality fabrics for everyday wear.`,
    category: "clothings",
    featured: i % 3 === 0,
    inventory: 15 + i,
    tags: ["clothing", "comfortable", "stylish", "quality", "wear"]
  });
  id++;
}

// Drinks products (C21-C30)
for (let i = 1; i <= 10; i++) {
  const imgNum = i + 20;
  products.push({
    id: String(id),
    name: `Beverage Item #${i}`,
    slug: `drinks-${i}`,
    price: 3000 + (i * 200),
    currency: "NGN",
    image: `/data/images/C${imgNum}.jpg`,
    images: [`/data/images/C${imgNum}.jpg`],
    description: `Refreshing and curated beverages collection item ${i}. Premium quality drinks for all occasions.`,
    category: "drinks",
    featured: i % 3 === 0,
    inventory: 20 + i,
    tags: ["drinks", "beverages", "premium", "refreshing", "curated"]
  });
  id++;
}

const outputPath = path.join(__dirname, '../public/data/products.json');
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

console.log(`✅ Updated products.json with consistent C naming convention`);
console.log(`   - Jewelry (C1-C10): 10 products`);
console.log(`   - Clothing (C11-C20): 10 products`);
console.log(`   - Drinks (C21-C30): 10 products`);
console.log(`\nNote: All images use C prefix for consistency`);
console.log(`      but categories are assigned by image number ranges`);
