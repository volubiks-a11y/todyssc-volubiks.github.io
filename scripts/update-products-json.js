const fs = require('fs');
const path = require('path');

/**
 * Update products.json with reorganized images
 * J1-J10: Jewelry
 * C1-C10: Clothing  
 * D1-D10: Drinks
 */

const products = [];
let id = 1;

// Jewelry products (J1-J10)
for (let i = 1; i <= 10; i++) {
  products.push({
    id: String(id),
    name: `J Premium Jewelry #${i}`,
    slug: `j-jewelry-${i}`,
    price: 15000 + (i * 500),
    currency: "NGN",
    image: `/data/images/J${i}.jpg`,
    images: [`/data/images/J${i}.jpg`],
    description: `Exclusive premium jewelry collection item ${i}. Delicate and timeless pieces perfect for any occasion.`,
    category: "jewelries",
    featured: i % 3 === 0,
    inventory: 10 + i,
    tags: ["premium", "handcrafted", "quality", "jewelry", "luxury"]
  });
  id++;
}

// Clothing products (C1-C10)
for (let i = 1; i <= 10; i++) {
  products.push({
    id: String(id),
    name: `C Comfort Wear #${i}`,
    slug: `c-clothing-${i}`,
    price: 5000 + (i * 300),
    currency: "NGN",
    image: `/data/images/C${i}.jpg`,
    images: [`/data/images/C${i}.jpg`],
    description: `Comfortable and stylish clothing collection item ${i}. Premium quality fabrics for everyday wear.`,
    category: "clothings",
    featured: i % 3 === 0,
    inventory: 15 + i,
    tags: ["clothing", "comfortable", "stylish", "quality", "wear"]
  });
  id++;
}

// Drinks products (D1-D10)
for (let i = 1; i <= 10; i++) {
  products.push({
    id: String(id),
    name: `D Premium Beverage #${i}`,
    slug: `d-drink-${i}`,
    price: 3000 + (i * 200),
    currency: "NGN",
    image: `/data/images/D${i}.jpg`,
    images: [`/data/images/D${i}.jpg`],
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

console.log(`✅ Updated products.json with ${products.length} products`);
console.log(`   - Jewelry (J): 10 products`);
console.log(`   - Clothing (C): 10 products`);
console.log(`   - Drinks (D): 10 products`);
