import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import * as XLSX from 'xlsx';
import { Helmet } from 'react-helmet-async';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') || '').trim().toLowerCase().replace(/[<>\"'&]/g, '');
  const category = searchParams.get('category') || '';
  const [products, setProducts] = React.useState([]);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/data/products.json?t=' + Date.now());
        const data = await response.json();
        console.log('Fetched products from JSON:', data);
        
        // Ensure each product has images; expand grouped image sets (e.g. C1_1..C1_6)
        const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjgiIGhlaWdodD0iNjgiIHZpZXdCb3g9IjAgMCA2OCA2OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

        async function urlExists(url) {
          try {
            const res = await fetch(url, { method: 'HEAD' });
            return res && res.ok;
          } catch (e) {
            return false;
          }
        }

        // For each product try to expand image sets when filenames follow a numbered pattern
        const normalizedBase = data.map(p => ({ ...p, images: p.images || [], image: p.image || '' }));

        const expanded = await Promise.all(normalizedBase.map(async (product) => {
          const imgs = Array.isArray(product.images) ? [...product.images] : [];

          // If primary image exists and looks like '.../C1_1.jpg' or '.../name_1.jpg'
          const match = (product.image || imgs[0] || '').match(/(\/data\/images\/)([A-Za-z0-9\-]+?)_(\d+)\.(jpg|jpeg|png|webp)$/i);
          if (match) {
            const prefix = match[1];
            const base = match[2];
            const ext = match[4] || 'jpg';

            // probe up to 6 variants and collect those that exist
            for (let i = 1; i <= 6; i++) {
              const candidate = `${prefix}${base}_${i}.${ext}`;
              if (!imgs.includes(candidate) && await urlExists(candidate)) {
                imgs.push(candidate);
              }
            }
          }

          // Ensure at least 4 images (fill with placeholder)
          while (imgs.length < 4) imgs.push(placeholder);

          return { ...product, images: imgs };
        }));

        console.log('Normalized products:', expanded.length);
        setProducts(expanded);
      } catch (error) {
        console.error('Failed to fetch products from JSON:', error);
      }
    };

    fetchProducts();
    const interval = setInterval(fetchProducts, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Improved search: token matching + simple fuzzy (Levenshtein) scoring and ranking
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  function scoreForProduct(p, query) {
    if (!query) return 0;
    const name = p.name.toLowerCase();
    const id = (p.id || '').toLowerCase();
    let score = 0;

    // Exact contains -> strong score
    if (name.includes(query) || id.includes(query)) score += 100;

    // Token matching: give points for each token found
    const tokens = query.split(/\s+/).filter(Boolean);
    for (const t of tokens) {
      if (name.includes(t)) score += 12;
      if (id.includes(t)) score += 8;
    }

    // Fuzzy similarity between query and name (normalized)
    const dist = levenshtein(query, name);
    const maxLen = Math.max(query.length, name.length, 1);
    const similarity = 1 - dist / maxLen; // 0..1 (may be negative for very different strings)
    if (similarity > 0) score += Math.round(similarity * 50);

    return score;
  }

  let results = products;
  if (category) {
    results = results.filter(p => p.category === category);
  }
  if (q) {
    const scored = results.map((p) => ({ p, score: scoreForProduct(p, q) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.p);
    // If no scored results, fall back to substring search (so user still sees something)
    results = scored.length ? scored : results.filter(p => p.name.toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q));
  }

  const [preview, setPreview] = React.useState(null);

  const onAdd = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('rv_cart') || '[]');
      cart.push(product);
      localStorage.setItem('rv_cart', JSON.stringify(cart));
      // trigger storage listener (also used by Header) so cart count updates
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      // ignore
    }
  };

  const onPreview = (product) => setPreview(product);
  const closePreview = () => setPreview(null);

  return (
    <>
      <Helmet>
        <title>{category ? `${category.charAt(0).toUpperCase() + category.slice(1)} - Volubiks Jewelry` : 'Shop - Volubiks Jewelry'}</title>
        <meta name="description" content={category ? `Browse our ${category} collection at Volubiks. Find quality ${category} with fast shipping.` : 'Browse our complete collection of exquisite jewelry at Volubiks. Find rings, necklaces, earrings, and more with fast shipping.'} />
        <meta name="keywords" content={category ? `${category}, buy ${category} online, Volubiks` : 'jewelry shop, buy jewelry online, rings, necklaces, earrings, Volubiks'} />
        <meta property="og:title" content={category ? `${category.charAt(0).toUpperCase() + category.slice(1)} - Volubiks Jewelry` : 'Shop - Volubiks Jewelry'} />
        <meta property="og:description" content={category ? `Browse our ${category} collection at Volubiks.` : 'Browse our complete collection of exquisite jewelry at Volubiks.'} />
        <meta property="og:url" content={`${window.location.origin}/shop${category ? `?category=${category}` : ''}`} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div style={{ padding: 20 }}>
        <h2>{category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'Shop'}</h2>
        {q ? <p>Showing results for <strong>{q}</strong> — {results.length} found</p> : <p>{category ? `All ${category}` : 'All products'}</p>}

        {results.length === 0 ? (
          <p>No products found. Try a different search.</p>
        ) : (
          <div className="product-grid dense">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAdd} onPreview={onPreview} />
            ))}
          </div>
        )}

        <ProductModal product={preview} open={Boolean(preview)} onClose={closePreview} onAdd={(p) => { onAdd(p); closePreview(); }} />
      </div>
    </>
  );
}
