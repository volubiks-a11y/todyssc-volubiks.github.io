#!/bin/bash
# Reorganize existing images with J, C, D prefixes
cd /workspaces/todyssc-volubiks.github.io/public/data/images

echo "🎨 Reorganizing images with naming convention..."
echo "  J = Jewelry"
echo "  C = Clothing"
echo "  D = Drinks"
echo ""

# Get list of all real images
real_images=(C{1..41}_1.jpg)
real_count=0

# Count valid images
for img in C*_1.jpg; do
  if [ -f "$img" ] && [ $(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null) -gt 100 ]; then
    ((real_count++))
  fi
done

echo "Found $real_count real clothing images"
echo ""

# Reorganize: 
# J1-J10: Jewelry images (using first 10 real images)
# C1-C10: Clothing images (using next 10 real images)
# D1-D10: Drinks images (using next 10 real images)

counter=1
prefix_idx=1

echo "Creating Jewelry images (J)..."
for i in {1..10}; do
  src="C${counter}_1.jpg"
  dst="J${i}.jpg"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
    echo "  J${i}.jpg ← ${src}"
    ((counter++))
  fi
done

echo ""
echo "Creating Clothing images (C)..."
for i in {1..10}; do
  src="C${counter}_1.jpg"
  dst="C${i}.jpg"
  if [ -f "$src" ]; then
    # Remove old placeholder if exists
    rm -f "$dst" 2>/dev/null || true
    cp "$src" "$dst"
    echo "  C${i}.jpg ← ${src}"
    ((counter++))
  fi
done

echo ""
echo "Creating Drinks images (D)..."
for i in {1..10}; do
  src="C${counter}_1.jpg"
  dst="D${i}.jpg"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
    echo "  D${i}.jpg ← ${src}"
    ((counter++))
  fi
done

echo ""
echo "✅ Image reorganization complete!"
