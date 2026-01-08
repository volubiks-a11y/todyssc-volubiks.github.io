import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function getCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('rv_cart') || '[]');
    return cart.length;
  } catch {
    return 0;
  }
}

export default function Header() {
  const navigate = useNavigate();
  const [count, setCount] = useState(getCartCount());
  const [q, setQ] = useState('');

  useEffect(() => {
    const onStorage = () => setCount(getCartCount());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // keep header search input in sync with the URL ?q= parameter
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQ(params.get('q') || '');
  }, [location.search]);

  const onSearch = (e) => {
    e.preventDefault();
    const trimmed = (q || '').trim();
    const path = trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : '/shop';
    navigate(path);
  };


  return (
    <header className="site-header">
      <div className="brand" onClick={() => navigate('/') }>
        <div className="logo-image">
          <img
            src="/data/images/logo.jpg"
            alt="Royal Volubiks Jewelries"
            onError={(e) => {
              // Try SVG fallback once; hide image if both missing
              if (!e.currentTarget.dataset.fallback) {
                e.currentTarget.dataset.fallback = 'true';
                e.currentTarget.src = '/data/images/logo.svg';
              } else {
                e.currentTarget.style.display = 'none';
              }
            }}
          />
        </div>
        <div>
          <div className="brand-title">Royal Volubiks</div>
          <div className="brand-sub">Jewelries</div>
        </div>
      </div>

      <form className="search-form" onSubmit={onSearch}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input search-input"
          placeholder="Search products..."
          aria-label="Search products"
        />
        <button type="submit" className="search-btn" aria-label="Search">🔍</button>
        {q && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={() => { setQ(''); navigate('/shop'); }}
          >
            ✖
          </button>
        )}
      </form>

      <nav className="nav">
        <Link to="/shop" className="nav-link">Shop</Link>
        <Link to="/checkout" className="nav-link">Checkout</Link>
        <button className="cart-btn" onClick={() => navigate('/checkout')} aria-label="Open cart">
          🛒
          {count > 0 && <span className="cart-badge">{count}</span>}
        </button>
      </nav>
    </header>
  );
}
