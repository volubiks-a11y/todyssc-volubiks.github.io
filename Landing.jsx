import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PromoPopup from './components/PromoPopup';
import ChatBot from './components/ChatBot';
import PromoEngine from './components/PromoEngine';
import Footer from './components/Footer';

const CATEGORIES = [
  { key: 'jewelries', label: 'Jewelries', subtitle: 'Delicate & timeless pieces' },
  { key: 'clothings', label: 'Clothings', subtitle: 'Comfortable, stylish wear' },
  { key: 'drinks', label: 'Drinks', subtitle: 'Refreshing & curated beverages' }
];

export default function Landing() {
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch('/data/products.json?t=' + Date.now(), { cache: 'no-cache' });
        const data = await res.json();
        if (mounted) setProductsData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Could not load products', err);
        if (mounted) setProductsData([]);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  // Show clothing images only (all available images are clothing)
  const thumbByCategory = (cat) => {
    // Map each category to a C-prefixed image (existing clothing assets)
    const mapping = {
      jewelries: '/data/images/C1.jpg',
      clothings: '/data/images/C2.jpg',
      drinks: '/data/images/C3.jpg'
    };
    // If products data contains clothings, prefer the first product image
    const p = productsData.find(x => x.category === 'clothings' && x.images && x.images.length);
    return mapping[cat] || (p ? p.images[0] : '/data/images/C1.jpg');
  };

  return (
    <>
      <Helmet>
        <title>Welcome — Volubiks Collections</title>
        <meta name="description" content="Subtle, welcoming entry to Volubiks — explore jewelries, clothings and drinks." />
      </Helmet>

      <main className="landing landing-minimal" aria-labelledby="landing-title">
        <header className="landing-hero">
          <div className="landing-hero-inner">
            <h1 id="landing-title" className="hero-ojaja">
              <span className="hero-crown" aria-hidden="true"><svg width="36" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 8l3 8 4-6 4 6 4-8 3 8H2z" fill="#b8860b"/></svg></span>
              Ojaja
            </h1>
            <h2 className="hero-royal">Royal Volubiks Stores</h2>
            <p className="hero-desc" aria-label="Categories">Jewelry <span className="sep">|</span> Clothing <span className="sep">|</span> Drinks</p>
            <p className="landing-tag">Curated pieces — quietly exquisite.</p>
            <div className="hero-ctas">
              <Link to="/shop?collection=new" className="button primary" aria-label="Shop new arrivals">Shop New Arrivals</Link>
              <Link to="/shop" className="button ghost" aria-label="Browse all products">Browse All</Link>
            </div>
          </div>
        </header>

        <div className="testimonial" role="region" aria-label="Customer testimonial">
          <p>“I felt so special wearing their pieces — delicate, high-quality and perfect for gifting.”</p>
          <div className="author">— Amina, Lagos</div>
        </div>

        <section className="category-grid" role="navigation" aria-label="Product categories">
          {CATEGORIES.map(cat => (
            <article key={cat.key} className="category-card" aria-labelledby={`cat-${cat.key}`}>
              <div className="category-image" role="img" aria-label={cat.label}>
                <img loading="lazy" src={thumbByCategory(cat.key)} alt={`${cat.label} thumbnail`} />
              </div>
              <div className="category-body">
                <h3 id={`cat-${cat.key}`} className="category-title">{cat.label}</h3>
                <p className="category-sub">{cat.subtitle}</p>
                <div className="landing-cta">
                  <Link to={`/shop?category=${encodeURIComponent(cat.key)}`} className="button primary" aria-label={`Browse ${cat.label}`}>Browse</Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        <div style={{textAlign:'center',marginTop:18}}>
          <Link to="/shop" className="button ghost">See all products</Link>
        </div>

        <Footer />
        <PromoPopup />
        <ChatBot />
        <PromoEngine onMessage={(m)=>{ /* headless emitter — could be used to sync UI */ console.debug('promo:',m)}} />
      </main>
    </>
  );
}
