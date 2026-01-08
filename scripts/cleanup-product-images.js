#!/usr/bin/env node

/**
 * Remove extra image placeholders from products, keeping only the hero image
 */

const fs = require('fs');
const path = require('path');

function cleanupProductImages() {
  const files = [
    'public/data/products.json',
    'data/imports/2026-01-06T14-21-16-691Z/products.json',
    'data/imports/2026-01-06T14-26-26-810Z/products.json',
    'data/imports/2026-01-06T14-33-20-488Z/products.json',
    'data/imports/2026-01-06T14-35-03-484Z/products.json'
  ];

  files.forEach(filePath => {
    try {
      const fullPath = path.join(__dirname, '..', filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⏭️  Skipping (not found): ${filePath}`);
        return;
      }

      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      let cleaned = 0;

      data.forEach(product => {
        if (product.images && product.images.length > 1) {
          // Keep only the first image (hero image)
          const heroImage = product.images[0];
          product.images = [heroImage];
          // Ensure the image field matches
          product.image = heroImage;
          cleaned++;
        } else if (product.images && product.images.length === 1) {
          // Ensure the image field matches
          product.image = product.images[0];
        }
      });

      if (cleaned > 0) {
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n');
        console.log(`✓ ${filePath}: Cleaned ${cleaned} products`);
      } else {
        console.log(`✓ ${filePath}: Already clean (no products with multiple images)`);
      }
    } catch (error) {
      console.error(`✗ Error processing ${filePath}:`, error.message);
    }
  });

  console.log('\n✓ Image cleanup complete!');
}

cleanupProductImages();
