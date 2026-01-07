const fs = require('fs');
const path = require('path');

/**
 * Products for Clothing only
 * 10 clothing items using C1-C10 images
 */

const products = [];

for (let i = 1; i <= 10; i++) {
  products.push({
    id: String(i),
    name: `Clothing Item #${i}`,
    slug: `clothing-${i}`,
    price: 5000 + (i * 300),
    currency: "NGN",
    image: `/data/images/C${i}.jpg`,
    images: [`/data/images/C${i}.jpg`],
    description: `Premium clothing collection item ${i}. Comfortable and stylish wear for everyday occasions.`,
    category: "clothings",
    featured: i % 3 === 0,
    inventory: 15 + i,
    tags: ["clothing", "comfortable", "stylish", "quality", "wear"]
  });
}

const outputPath = path.join(__dirname, '../public/data/products.json');
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

console.log(`✅ Products updated for Clothing only`);
console.log(`   - Total: 10 clothing items`);
console.log(`   - Images: C1.jpg - C10.jpg`);
console.log(`   - Category: clothings`);
