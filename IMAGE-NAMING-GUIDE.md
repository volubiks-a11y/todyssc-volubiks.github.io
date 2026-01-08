# Image Naming Convention Guide

## Overview
All product images now follow a standardized naming convention with category prefixes:

- **J** = Jewelries (Gold theme - #c9a961)
- **C** = Clothing (Blue theme - #4a90e2)  
- **D** = Drinks (Red theme - #e74c3c)

## Image Structure

### Product Images
Located in: `/public/data/images/`

Format: `{PREFIX}{NUMBER}.jpg`

Examples:
- `J1.jpg` - First Jewelry item
- `J10.jpg` - Tenth Jewelry item
- `C1.jpg` - First Clothing item
- `C10.jpg` - Tenth Clothing item
- `D1.jpg` - First Drink item
- `D10.jpg` - Tenth Drink item

### Landing Page Hero Images
Located in: `/public/data/images/hero/`

Special large-format images (1200x600) designed for landing page categories:
- `jewelries-hero.jpg` - Jewelries category hero image
- `clothings-hero.jpg` - Clothing category hero image
- `drinks-hero.jpg` - Drinks category hero image

## Color Scheme

| Category | Prefix | Primary Color | Accent Color | Theme |
|----------|--------|---------------|--------------|-------|
| Jewelries | J | #c9a961 | #d4af37 | Gold luxury |
| Clothing | C | #4a90e2 | #357abd | Professional blue |
| Drinks | D | #e74c3c | #c0392b | Vibrant red |

## Product Data
All products in `public/data/products.json` are updated with:
- 10 Jewelries (J1-J10)
- 10 Clothing items (C1-C10)
- 10 Drink items (D1-D10)

Each product includes:
- Category designation (jewelries, clothings, drinks)
- Proper image path with naming convention
- Color-themed names and descriptions

## Landing Page Updates

The Landing page (`Landing.jsx`) now uses dedicated hero images for each category:
- **Before**: Used first product image as category thumbnail
- **After**: Uses special hero images (`jewelries-hero.jpg`, `clothings-hero.jpg`, `drinks-hero.jpg`)

This creates a cohesive visual experience with custom designs for each product category.

## Using the Image Generator

To regenerate images with updated styling or add more products:

```bash
npm run generate:images
```

This will:
1. Create/update product images (J1-J10, C1-C10, D1-D10)
2. Generate hero images for landing page
3. Update products.json with correct image paths
