<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baraka Solar Shop - Premium Power Marketplace</title>
    <meta name="description" content="Baraka Solar Shop: premium solar panels, batteries, inverters and energy systems with a polished purple marketplace experience.">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('css/shop.css') }}">
    <script src="{{ asset('js/shop.js') }}" defer></script>
    @php
        $heroImage = optional($products->first())->image_path ?? 'images/hero-default.png';
        $tickerUpdates = [
            'Solar panels available now',
            'Batteries ready to ship',
            'Inverters with backup power',
            'CCTV security kits live',
            'Charge controllers in stock',
            'Lighting bundles for every roof',
            'Free delivery on first order',
            'Local installation support',
            '24/7 customer care',
            'MPESA pay ready',
            'Eco-friendly solar options',
            'Latest rooftop essentials',
            'Smart energy monitoring',
            'Generator replacements',
            'Roof-ready solar arrays',
            'Discounted panel kits',
            'Home power upgrades',
            'Business energy bundles',
            'Backup power solutions',
            'Rapid order turnaround',
            'Battery bank specialists',
            'High-efficiency modules',
            'Off-grid system packages',
            'Pre-built solar kits',
            'Hybrid inverter deals',
            'Wholesale pricing available',
            'Expert solar advice',
            'Modular power systems',
            'Solar lighting innovations',
            'Secure checkout experience',
        ];
        $heroLoopItems = [
            'solar panels',
            'storage batteries',
            'hybrid inverters',
            'CCTV cameras',
            'smart lighting',
            'power accessories',
            'backup systems',
            'roof kits',
            'MPPT controllers',
            'home energy bundles',
            'off-grid backups',
            'remote solar monitors',
        ];
        $categoryQuickFilters = collect($categories ?? [])->mapWithKeys(function ($category) {
            return [$category->slug => $category->name];
        })->toArray();
        $categoryQuickFilters = array_merge(['all' => 'Home'], $categoryQuickFilters);
    @endphp
    <style>
        :root {
            color-scheme: dark;
            --text: #f8f4ff;
            --muted: #c9c0c8;
            --accent-1: #ff2b3b;
            --accent-2: #ff5f45;
            --accent-3: #d33b4d;
            --bg-1: #070309;
            --bg-2: #12090f;
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 16px;
            line-height: 1.6;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            min-height: 100vh;
            background: radial-gradient(circle at top right, rgba(255, 43, 59, 0.12), transparent 20%),
                linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 100%);
            color: var(--text);
            background-attachment: fixed;
            background-size: cover;
        }

        body.dark-mode {
            background: #06030b;
            color: #f8f4ff;
        }

        body.dark-mode .site-nav,
        body.dark-mode .hero-banner,
        body.dark-mode .category-block,
        body.dark-mode .card,
        body.dark-mode .modal-content,
        body.dark-mode .cart-drawer,
        body.dark-mode .auth-modal-content,
        body.dark-mode .site-footer {
            background: #0f0b17;
            border-color: rgba(134, 100, 255, 0.18);
        }

        a,
        button {
            font: inherit;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        .site-nav {
            position: sticky;
            top: 0;
            z-index: 60;
            padding: 0.25rem 0;
            background: linear-gradient(180deg, rgba(8, 8, 24, 0.98), rgba(15, 8, 35, 0.96));
            backdrop-filter: blur(22px);
            border-bottom: 1px solid rgba(255, 43, 59, 0.14);
            box-shadow: 0 18px 34px rgba(0, 0, 0, 0.16);
            overflow: visible;
        }

        .nav-container {
            width: min(1240px, 100%);
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.6rem;
            padding: 0 0.65rem;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin-left: 0.65rem;
            flex-wrap: wrap;
        }

        .nav-links a {
            color: rgba(255, 255, 255, 0.72);
            text-decoration: none;
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.01em;
            padding: 0.35rem 0.6rem;
            border-radius: 999px;
            transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }

        .nav-links a:hover,
        .nav-links a.active {
            color: #ffffff;
            background: rgba(255, 43, 59, 0.12);
            transform: translateY(-1px);
        }

        .nav-left {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
        }

        .header-ticker {
            width: min(1080px, 100%);
            margin: 0.15rem auto 0;
            padding: 0.35rem 0.65rem;
            border-radius: 999px;
            background: rgba(255, 43, 59, 0.08);
            border: 1px solid rgba(255, 43, 59, 0.12);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: rgba(255, 255, 255, 0.92);
            font-size: 0.78rem;
            letter-spacing: 0.01em;
            box-shadow: 0 10px 18px rgba(0, 0, 0, 0.12);
            position: relative;
            overflow: hidden;
            z-index: 55;
        }

        .header-ticker .ticker-label {
            font-weight: 800;
            color: #ffffff;
            text-transform: uppercase;
            font-size: 0.68rem;
            letter-spacing: 0.18em;
            padding-right: 0.7rem;
            border-right: 1px solid rgba(255,255,255,0.14);
        }

        .ticker-track {
            display: inline-flex;
            align-items: center;
            gap: 0.9rem;
            white-space: nowrap;
            animation: ticker-scroll 20s linear infinite;
            padding-left: 1rem;
        }

        .header-ticker .ticker-item {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.6rem;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
            color: rgba(255, 255, 255, 0.88);
            opacity: 0.92;
            font-size: 0.78rem;
            border: 1px solid rgba(255,255,255,0.08);
        }

        @keyframes ticker-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
        }

        .category-tabs {
            width: min(1120px, 100%);
            margin: 0.75rem auto 0.25rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.45rem;
            justify-content: center;
            padding: 0.42rem 0.85rem 0.2rem;
        }

        .category-tab {
            border: 1px solid rgba(255, 255, 255, 0.14);
            background: rgba(255, 255, 255, 0.06);
            color: rgba(255, 255, 255, 0.86);
            padding: 0.42rem 0.72rem;
            border-radius: 999px;
            font-weight: 700;
            font-size: 0.78rem;
            cursor: pointer;
            transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }

        .category-tab:hover,
        .category-tab.active {
            background: rgba(255, 43, 59, 0.18);
            border-color: rgba(255, 43, 59, 0.28);
            color: #ffffff;
            transform: translateY(-1px);
        }

        .filter-notice {
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.78rem;
            padding: 0.35rem 0.65rem 0.55rem;
            width: min(1080px, 100%);
            margin: 0 auto 0.25rem;
            letter-spacing: 0.02em;
        }

        .hero-loop-text {
            display: flex;
            flex-wrap: wrap;
            gap: 0.65rem;
            align-items: center;
            margin-top: 1rem;
            position: relative;
            z-index: 2;
            padding: 0.85rem 1rem;
            border-radius: 1rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
        }

        .hero-loop-text .loop-label {
            color: rgba(255, 255, 255, 0.88);
            font-size: 0.92rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            min-width: max-content;
        }

        .hero-loop-text .loop-item {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.65rem 0.95rem;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
            color: rgba(255, 255, 255, 0.82);
            border: 1px solid rgba(255, 255, 255, 0.1);
            font-weight: 700;
            transition: transform 0.25s ease, opacity 0.25s ease, background 0.25s ease;
        }

        .hero-loop-text .loop-item.active {
            background: rgba(255, 43, 59, 0.24);
            color: #ffffff;
            opacity: 1;
            transform: translateY(-1px);
        }

        html {
            scroll-behavior: smooth;
        }

        .nav-logo {
            display: inline-flex;
            align-items: center;
            gap: 0.65rem;
            color: #ffffff;
            font-size: 1rem;
            font-weight: 900;
            text-decoration: none;
            min-width: 0;
        }

        .nav-logo img {
            width: 34px;
            height: 34px;
            object-fit: cover;
            border-radius: 8px;
            background: linear-gradient(135deg, rgba(255, 43, 59, 0.16), rgba(255, 95, 69, 0.12));
            padding: 0.15rem;
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
        }

        .nav-brand {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            line-height: 1.1;
        }

        .nav-brand span {
            display: inline-block;
            font-size: 1rem;
            font-weight: 900;
        }

        .nav-brand .brand-accent1 { color: var(--accent-1); }
        .nav-brand .brand-accent2 { color: var(--accent-2); }
        .nav-brand .brand-accent3 { color: #6aa07a; }
        .nav-brand .brand-accent4 { color: #8a5a3b; }

        .search-form {
            flex: 1;
            position: relative;
            max-width: 44rem;
        }

        .search-input {
            width: 100%;
            padding: 0.9rem 1rem 0.9rem 3rem;
            border-radius: 999px;
            border: 1px solid rgba(255, 43, 59, 0.24);
            background: rgba(255, 43, 59, 0.08);
            color: #ffffff;
            outline: none;
        }

        .search-input::placeholder {
            color: rgba(255, 255, 255, 0.55);
        }

        .search-input:focus {
            border-color: rgba(255, 95, 69, 0.9);
            background: rgba(255, 43, 59, 0.14);
        }

        .search-dropdown {
            position: absolute;
            top: calc(100% + 0.55rem);
            left: 0;
            right: 0;
            width: 100%;
            max-height: 18rem;
            overflow-y: auto;
            background: rgba(8, 8, 24, 0.98);
            border: 1px solid rgba(255, 43, 59, 0.24);
            border-radius: 1rem;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
            z-index: 52;
            display: none;
        }

        .search-dropdown.active {
            display: block;
        }

        .search-suggestion-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.9rem 1rem;
            color: #f5f1ff;
            cursor: pointer;
            transition: background 0.18s ease;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .search-suggestion-item:hover {
            background: rgba(255, 43, 59, 0.12);
        }

        .search-no-results {
            padding: 0.95rem 1rem;
            color: #ffb2b8;
            font-weight: 700;
            text-align: center;
        }

        .search-feedback {
            margin-top: 0.35rem;
            color: #ff9aa2;
            font-size: 0.92rem;
            min-height: 1.2rem;
        }

        .search-icon-label {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.95rem;
        }

        .search-btn {
            position: absolute;
            right: 0.35rem;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            border-radius: 999px;
            padding: 0.8rem 1.3rem;
            background: linear-gradient(135deg, #ff2b3b, #b3001b);
            color: white;
            font-weight: 700;
            cursor: pointer;
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 0.85rem;
            position: relative;
        }

        .nav-button,
        .basket-trigger-badge,
        .setting-menu-item,
        .btn {
            border: none;
            cursor: pointer;
            font-weight: 700;
            transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.45rem;
            padding: 0.8rem 1.15rem;
            border-radius: 999px;
            min-height: 3rem;
            letter-spacing: 0.01em;
        }

        .btn-primary {
            background: linear-gradient(135deg, #ff2b3b, #b3001b);
            color: #ffffff;
            border: 1px solid rgba(255, 43, 59, 0.45);
        }

        .btn-secondary {
            background: rgba(255, 43, 59, 0.12);
            color: #ffffff;
            border: 1px solid rgba(255, 43, 59, 0.28);
        }

        .btn-card,
        .btn-add {
            background: rgba(255, 43, 59, 0.16);
            color: #ffffff;
            border: 1px solid rgba(255, 43, 59, 0.25);
        }

        .btn-pay {
            background: linear-gradient(135deg, #e3181f, #9e000d);
            color: #ffffff;
        }

        .btn-buy {
            background: rgba(0, 0, 0, 0.68);
            color: #ffb2b8;
            border: 1px solid rgba(255, 43, 59, 0.28);
        }

        .btn:hover {
            transform: translateY(-1px);
        }

        .nav-button,
        .basket-trigger-badge {
            border-radius: 999px;
            padding: 0.8rem 1rem;
            background: rgba(255, 43, 59, 0.1);
            color: #f8f4ff;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .nav-button:hover,
        .basket-trigger-badge:hover {
            background: rgba(255, 43, 59, 0.2);
        }

        .setting-menu-panel {
            position: absolute;
            top: 4.5rem;
            right: 0;
            width: 18rem;
            background: rgba(255, 43, 59, 0.12);
            border: 1px solid rgba(255, 43, 59, 0.25);
            border-radius: 1rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
            display: none;
            flex-direction: column;
            padding: 0.5rem 0;
            backdrop-filter: blur(18px);
        }

        .setting-menu-panel.open {
            display: flex;
        }

        .setting-menu-item {
            background: transparent;
            color: #f5e9ff;
            width: 100%;
            text-align: left;
            padding: 0.85rem 1rem;
            transition: background 0.2s ease;
        }

        .setting-menu-item:hover {
            background: rgba(255, 43, 59, 0.14);
        }

        .site-header,
        .hero-banner,
        .category-block,
        .card,
        .modal-content,
        .cart-drawer,
        .auth-modal-content,
        .site-footer {
            border: 1px solid rgba(255, 43, 59, 0.22);
            background: rgba(12, 6, 25, 0.92);
        }

        .hero-banner {
            width: min(960px, 100%);
            margin: 0.65rem auto 0;
            display: grid;
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
            gap: 0.85rem;
            padding: 0.85rem;
            border-radius: 24px;
            background: linear-gradient(180deg, rgba(20, 8, 16, 0.98), rgba(12, 5, 14, 0.96));
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 43, 59, 0.16);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.34);
        }

        .hero-banner::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top left, rgba(255, 43, 59, 0.14), transparent 24%),
                radial-gradient(circle at bottom right, rgba(255, 95, 69, 0.08), transparent 28%);
            pointer-events: none;
        }

        .hero-banner::after {
            content: '';
            position: absolute;
            inset: 0;
            background-image: linear-gradient(135deg, rgba(255, 43, 59, 0.1) 0%, transparent 48%);
            opacity: 0.18;
            pointer-events: none;
        }

        .hero-copy {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.75rem;
        }

        .eyebrow {
            display: inline-flex;
            margin-bottom: 0.55rem;
            color: #9b5a34;
            letter-spacing: 0.18em;
            font-size: 0.72rem;
            text-transform: uppercase;
            font-weight: 800;
        }

        .hero-copy h1 {
            font-size: clamp(2rem, 3.2vw, 2.8rem);
            line-height: 1.1;
            max-width: 11ch;
            margin-bottom: 0.6rem;
            color: #ffffff;
        }

        .hero-copy p {
            color: rgba(248, 244, 255, 0.78);
            max-width: 38rem;
            font-size: 0.96rem;
            margin-bottom: 0;
        }

        .hero-actions {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.55rem;
            margin-top: 0.65rem;
        }

        .hero-highlights {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.6rem;
            margin-top: 0.9rem;
        }

        .hero-highlights div {
            padding: 0.7rem 0.85rem;
            border-radius: 20px;
            background: rgba(255, 43, 59, 0.12);
            color: #ffe7e9;
            font-weight: 700;
            border: 1px solid rgba(255, 43, 59, 0.18);
            box-shadow: 0 10px 24px rgba(255, 43, 59, 0.08);
        }

        .hero-image {
            position: relative;
            min-height: 340px;
            border-radius: 24px;
            overflow: hidden;
            background: radial-gradient(circle at center, rgba(255, 22, 39, 0.12), transparent 52%);
            display: grid;
            align-items: center;
            justify-items: center;
            padding: 0.75rem;
        }

        .hero-image::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(12, 4, 12, 0.4), transparent 35%),
                radial-gradient(circle at top right, rgba(255, 43, 59, 0.18), transparent 28%);
            z-index: 1;
        }

        .hero-image::after {
            display: none;
        }

        .hero-image {
            position: relative;
            z-index: 3;
        }

        .featured-carousel {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            display: grid;
            place-items: center;
            z-index: 4;
        }

        .site-footer {
            position: relative;
            z-index: 1;
        }

        .carousel-slide {
            position: absolute;
            inset: 0;
            opacity: 0;
            transform: scale(0.97);
            transition: opacity 0.6s ease, transform 0.6s ease;
            display: grid;
            align-items: center;
            justify-items: center;
        }

        .carousel-slide.active {
            opacity: 1;
            transform: scale(1);
        }

        .carousel-slide img {
            width: auto;
            max-width: 100%;
            max-height: 100%;
            border-radius: 24px;
            object-fit: contain;
            box-shadow: 0 38px 80px rgba(0, 0, 0, 0.28);
        }

        .carousel-meta {
            position: absolute;
            left: 1.25rem;
            bottom: 1.25rem;
            padding: 1rem 1.15rem;
            border-radius: 18px;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            z-index: 3;
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
            max-width: calc(100% - 2.5rem);
        }

        .carousel-title {
            font-weight: 800;
            font-size: 1.05rem;
        }

        .carousel-price {
            font-size: 0.95rem;
            color: #ff9aa2;
        }

        .carousel-controls {
            position: absolute;
            inset: auto 1rem 1rem auto;
            display: flex;
            gap: 0.8rem;
            z-index: 3;
        }

        .carousel-nav {
            border: none;
            background: rgba(255, 43, 59, 0.78);
            color: #fff;
            width: 2.8rem;
            height: 2.8rem;
            border-radius: 50%;
            font-size: 1.3rem;
            line-height: 1;
            cursor: pointer;
            display: grid;
            place-items: center;
        }

        .carousel-nav:hover {
            background: rgba(255, 43, 59, 0.96);
        }

        .hero-banner .hero-copy .btn {
            min-width: 10rem;
        }

        .category-panel-list {
            width: min(1120px, 100%);
            margin: 1.5rem auto 0;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
            padding: 0 1rem;
        }

        .category-panel {
            display: grid;
            grid-template-rows: repeat(3, auto);
            gap: 0.45rem;
            padding: 1.1rem 1rem;
            border-radius: 1.35rem;
            border: 1px solid rgba(255, 43, 59, 0.12);
            background: rgba(255, 43, 59, 0.05);
            color: #f3edff;
            text-align: left;
            cursor: pointer;
            transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .product-detail-page {
            width: min(1120px, 100%);
            margin: 2rem auto;
            padding: 1.5rem;
            border-radius: 28px;
            background: rgba(255, 43, 59, 0.08);
            border: 1px solid rgba(255, 43, 59, 0.2);
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 1.5rem;
            align-items: start;
        }

        .detail-image {
            border-radius: 28px;
            overflow: hidden;
            background: rgba(0, 0, 0, 0.38);
            padding: 1rem;
        }

        .detail-image img {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 1.5rem;
        }

        .detail-summary {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }

        .detail-summary h2 {
            color: #ffffff;
            font-size: clamp(2rem, 2.8vw, 2.6rem);
            margin-bottom: 0.25rem;
        }

        .detail-summary .detail-meta {
            color: rgba(245, 233, 255, 0.72);
            font-size: 0.95rem;
            line-height: 1.8;
        }

        .detail-summary .detail-price {
            color: #ffd86a;
            font-size: 2rem;
            font-weight: 900;
        }

        .detail-actions {
            display: flex;
            gap: 0.85rem;
            flex-wrap: wrap;
            align-items: center;
        }

        .detail-actions .btn {
            flex: 1 1 auto;
            min-width: 12rem;
        }

        .card-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
            align-items: center;
            justify-content: flex-end;
        }

        .category-panel:hover {
            transform: translateY(-2px);
            border-color: rgba(255, 43, 59, 0.4);
            background: rgba(255, 43, 59, 0.12);
        }

        .panel-line {
            display: block;
            line-height: 1.25;
        }

        .panel-line-title {
            font-size: 0.98rem;
            font-weight: 800;
            color: #ffffff;
        }

        .panel-line-subtitle {
            font-size: 0.86rem;
            color: rgba(245, 233, 255, 0.7);
        }

        .panel-line-cta {
            font-size: 0.82rem;
            color: #d5b2ff;
            font-weight: 700;
        }

        .show-more-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            margin-top: 1rem;
            padding: 0.95rem 1rem;
            border-radius: 999px;
            border: 1px solid rgba(255, 43, 59, 0.25);
            background: rgba(255, 43, 59, 0.12);
            color: #ffffff;
            font-weight: 800;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.2s ease;
        }

        .show-more-btn:hover {
            background: rgba(255, 43, 59, 0.2);
            transform: translateY(-1px);
        }

        .product-hidden {
            display: none;
        }

        .card {
            cursor: pointer;
        }

        main {
            width: min(1120px, 100%);
            margin: 0 auto;
            padding: 2.5rem 1.5rem 4rem;
        }

        .category-block {
            margin-bottom: 3rem;
            border-radius: 32px;
            background: rgba(255, 255, 255, 0.04);
            padding: 2rem;
        }

        .category-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            color: #f5e9ff;
            margin-bottom: 1.75rem;
            font-size: 1.15rem;
            font-weight: 800;
        }

        .badge {
            padding: 0.6rem 1rem;
            border-radius: 999px;
            background: rgba(121, 66, 255, 0.14);
            color: #d8bfff;
            font-size: 0.85rem;
            font-weight: 700;
        }

        .grid-container {
            display: grid;
            gap: 1.5rem;
        }

        @media (min-width: 640px) {
            .grid-container { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (min-width: 1024px) {
            .grid-container { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        .card {
            display: flex;
            flex-direction: column;
            background: rgba(18, 8, 14, 0.95);
            border-radius: 14px;
            border: 1px solid rgba(255, 43, 59, 0.15);
            overflow: hidden;
            transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
            padding: 0.45rem;
            gap: 0.4rem;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
        }

        .card:hover {
            transform: translateY(-6px);
            border-color: rgba(255, 43, 59, 0.35);
            background: rgba(255, 43, 59, 0.08);
        }

        .card-body {
            padding: 0.85rem 0.75rem;
            flex: 1;
        }

        .product-title {
            margin-bottom: 0.45rem;
            font-size: 0.95rem;
            line-height: 1.2;
            color: #ffffff;
            min-height: 2.4rem;
        }

        .product-desc {
            color: rgba(245, 233, 255, 0.72);
            font-size: 0.9rem;
            line-height: 1.45;
        }

        .card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.6rem;
            padding: 0.6rem 0.8rem;
            border-top: 1px solid rgba(255, 43, 59, 0.18);
            background: rgba(255, 43, 59, 0.08);
        }

        .product-card-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.6rem;
            align-items: center;
            width: 100%;
            margin-top: 0.75rem;
        }

        .compare-toggle {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            color: rgba(255, 255, 255, 0.85);
            font-size: 0.84rem;
            cursor: pointer;
        }

        .compare-toggle input {
            width: 1rem;
            height: 1rem;
            accent-color: #ff2b3b;
        }

        .compare-drawer {
            position: fixed;
            right: 1rem;
            bottom: 1rem;
            width: min(420px, calc(100% - 2rem));
            background: rgba(12, 6, 16, 0.96);
            border: 1px solid rgba(255, 43, 59, 0.24);
            border-radius: 1.15rem;
            box-shadow: 0 28px 80px rgba(0, 0, 0, 0.35);
            padding: 1rem;
            display: none;
            z-index: 150;
        }

        .compare-drawer.open {
            display: block;
        }

        .compare-drawer h4 {
            margin-bottom: 0.85rem;
            font-size: 1rem;
            font-weight: 900;
            color: #ffffff;
        }

        .compare-list {
            display: grid;
            gap: 0.7rem;
            margin-bottom: 1rem;
        }

        .compare-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: rgba(255, 255, 255, 0.04);
            padding: 0.8rem 0.85rem;
            border-radius: 1rem;
            border: 1px solid rgba(255, 43, 59, 0.12);
        }

        .compare-item img {
            width: 44px;
            height: 44px;
            object-fit: cover;
            border-radius: 0.85rem;
        }

        .compare-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
            align-items: center;
        }

        .spec-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
            color: #f5e9ff;
        }

        .spec-table th,
        .spec-table td {
            padding: 0.75rem 0.85rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            font-size: 0.92rem;
        }

        .spec-table th {
            text-align: left;
            color: #d6c7ff;
            width: 36%;
            white-space: nowrap;
        }

        .detail-extra {
            display: grid;
            gap: 2rem;
            margin-top: 2rem;
        }

        .detail-recommendations {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 43, 59, 0.12);
            border-radius: 1.25rem;
            padding: 1.3rem;
        }

        .cross-sell-grid {
            display: grid;
            gap: 1rem;
            margin-top: 1rem;
        }

        .compare-spec-table {
            min-width: 30rem;
        }

        @media (min-width: 860px) {
            .cross-sell-grid {
                grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .quick-view-grid {
                grid-template-columns: 1.1fr 0.9fr;
            }
        }

        .quick-view-grid {
            display: grid;
            gap: 1.4rem;
        }

        .quick-view-image {
            border-radius: 1.25rem;
            background: rgba(255, 255, 255, 0.04);
            overflow: hidden;
            min-height: 320px;
            display: grid;
            place-items: center;
        }

        .quick-view-image img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .quick-view-copy h3 {
            margin-top: 0.4rem;
            margin-bottom: 0.6rem;
            font-size: 1.55rem;
            line-height: 1.1;
            color: #fff;
        }

        .compare-modal-content {
            max-width: 980px;
            width: min(100%, 98vw);
        }

        .compare-modal-content .spec-table th,
        .compare-modal-content .spec-table td {
            color: rgba(255, 255, 255, 0.92);
        }

        .compare-modal-content .spec-table th {
            background: rgba(255, 255, 255, 0.04);
        }

        .compare-summary {
            color: rgba(245, 233, 255, 0.75);
            margin-bottom: 1rem;
        }

        .product-price {
            font-size: 1.2rem;
            font-weight: 900;
            color: #ffcc6c;
        }

        .btn-card {
            background: linear-gradient(135deg, #ff2b3b, #b3001b);
            color: #ffffff;
            padding: 0.75rem 1rem;
            border-radius: 999px;
            border: none;
        }

        .image-frame { display:block; width:100%; position:relative; cursor: pointer; }
        .image-frame img { width:100%; height:auto; object-fit:contain; border-radius:10px; display:block; transition:transform 0.18s ease, filter 0.18s ease; filter: contrast(1.05) saturate(1.06); }
        .image-frame button,
        .image-view-btn { all: unset; display:block; width:100%; cursor: pointer; }
        .image-frame:hover img { transform: scale(1.03); }
        .image-overlay {
            position:absolute; inset:0; display:flex; align-items:center; justify-content:center; border-radius:12px; pointer-events:none;
        }
        .image-overlay .overlay-label {
            pointer-events:auto; background:rgba(255, 43, 59, 0.9); color:#ffffff; padding:0.45rem 0.85rem; border-radius:999px; font-weight:800; font-size:0.85rem;
            backdrop-filter: blur(6px);
            opacity:0; transform:translateY(8px); transition:opacity 0.18s ease, transform 0.18s ease;
        }
        .image-frame:hover .image-overlay .overlay-label { opacity:1; transform:translateY(0); }

        .drawer-header,
        .drawer-footer,
        .auth-modal-content,
        .drawer-body,
        .footer-grid {
            width: min(1120px, 100%);
        }

        .cart-drawer {
            position: fixed;
            top: 0;
            right: -100%;
            width: min(28rem, 100%);
            max-width: 28rem;
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            gap: 1rem;
            background: rgba(11, 6, 20, 0.98);
            box-shadow: -20px 0 60px rgba(0, 0, 0, 0.35);
            transition: right 0.3s ease;
            z-index: 130;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
        }

        .cart-drawer.open {
            right: 0;
        }

        .drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }

        .drawer-title {
            font-size: 1.2rem;
            font-weight: 800;
            color: #ffffff;
        }

        .drawer-subtitle {
            color: rgba(245, 233, 255, 0.68);
            font-size: 0.95rem;
        }

        .drawer-close {
            border: none;
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 14px;
            font-size: 1.45rem;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .drawer-close:hover {
            background: rgba(255, 43, 59, 0.18);
        }

        .drawer-share-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            padding: 0.85rem 0 0;
            color: rgba(255, 255, 255, 0.76);
            font-size: 0.94rem;
        }

        .drawer-share-btn {
            padding: 0.75rem 1rem;
            min-width: 8rem;
            border-radius: 0.95rem;
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.12);
            cursor: pointer;
            transition: background 0.2s ease, border-color 0.2s ease;
        }

        .drawer-share-btn:hover {
            background: rgba(255, 43, 59, 0.16);
            border-color: rgba(255, 43, 59, 0.28);
        }

        .drawer-body {
            flex: 1;
            overflow-y: auto;
            padding-right: 0.25rem;
        }

        .drawer-items-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            min-height: 40vh;
        }

        .drawer-empty {
            color: rgba(245, 233, 255, 0.72);
            font-size: 0.98rem;
        }

        .drawer-item-row {
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
            padding: 1rem;
            border-radius: 1.2rem;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.03);
            cursor: pointer;
            transition: background 0.2s ease, border-color 0.2s ease;
        }

        .drawer-item-row:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 43, 59, 0.18);
        }

        .drawer-item-thumb {
            width: 3.8rem;
            height: 3.8rem;
            object-fit: cover;
            border-radius: 1rem;
            background: rgba(255, 255, 255, 0.06);
        }

        .drawer-item-info {
            flex: 1;
            display: grid;
            gap: 0.55rem;
        }

        .drawer-item-meta {
            display: flex;
            justify-content: space-between;
            gap: 0.5rem;
            color: rgba(255, 255, 255, 0.75);
            font-size: 0.92rem;
        }

        .drawer-item-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 0.45rem;
            align-items: center;
        }

        .drawer-item-actions button {
            border: none;
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
            border-radius: 0.85rem;
            min-width: 2.3rem;
            min-height: 2.3rem;
            padding: 0 0.7rem;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .drawer-item-actions button:hover {
            background: rgba(255, 43, 59, 0.18);
        }

        .drawer-item-actions .quantity-value {
            min-width: 2rem;
            text-align: center;
            font-weight: 700;
            color: #fff;
        }

        .drawer-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 43, 59, 0.18);
        }

        .drawer-total-label {
            color: rgba(245, 233, 255, 0.68);
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 0.35rem;
        }

        .drawer-total-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: #fff5c4;
        }

        @media (max-width: 640px) {
            .cart-drawer {
                width: 100%;
                max-width: 100%;
            }

            .drawer-item-row {
                flex-direction: column;
            }
        }

        .modal-overlay {
            position: fixed;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.62);
            z-index: 200;
            padding: 1.5rem;
        }

        .modal-content {
            width: 100%;
            max-width: 44rem;
            border-radius: 30px;
            overflow: hidden;
            display: grid;
            grid-template-columns: 1fr;
            border: 1px solid rgba(255, 43, 59, 0.2);
            background: rgba(12, 6, 25, 0.98);
            box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45);
        }

        @media (min-width: 640px) {
            .modal-content { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        .modal-img-frame,
        .auth-modal-content {
            background: rgba(255, 43, 59, 0.06);
        }

        .modal-img-frame {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            border-right: 1px solid rgba(255, 43, 59, 0.18);
        }

        .modal-img-frame img {
            width: 100%;
            max-height: 16rem;
            object-fit: contain;
            border-radius: 1.5rem;
        }

        .modal-details-pane {
            padding: 2rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 1.5rem;
        }

        .auth-modal-content {
            max-width: 26rem;
            padding: 2rem;
            border-radius: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .auth-error-log {
            display: none;
            background: #38141f;
            color: #ffcdca;
            padding: 0.85rem 1rem;
            border-radius: 0.9rem;
            font-size: 0.9rem;
            font-weight: 700;
            text-align: center;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }

        .form-group label {
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: rgba(245, 233, 255, 0.85);
            text-transform: uppercase;
        }

        .auth-input {
            width: 100%;
            padding: 0.85rem 1rem;
            border-radius: 1rem;
            border: 1px solid rgba(255, 43, 59, 0.24);
            background: rgba(255, 43, 59, 0.08);
            color: #f5e9ff;
            outline: none;
        }

        .auth-input.invalid {
            border-color: #ff6c7f;
        }

        .auth-input::placeholder {
            color: rgba(255, 255, 255, 0.45);
        }

        .auth-input-group {
            position: relative;
        }

        .password-toggle-btn {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: transparent;
            color: #d6b9ff;
            cursor: pointer;
            font-size: 0.92rem;
            padding: 0.25rem 0.35rem;
        }

        .auth-form-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-top: 0.5rem;
            flex-wrap: wrap;
        }

        .auth-form-footer label {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: rgba(245, 233, 255, 0.78);
            font-size: 0.9rem;
        }

        .auth-helper-link {
            color: #d6b9ff;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 700;
        }

        .auth-helper-link:hover {
            text-decoration: underline;
        }

        .auth-feedback {
            font-size: 0.88rem;
            color: rgba(245, 233, 255, 0.72);
            margin-top: 0.35rem;
        }

        .auth-feedback.strong {
            color: #7de2a5;
        }

        .auth-guest-btn {
            width: 100%;
            margin-top: 1rem;
        }

        .auth-submit-btn,
        .auth-alt-btn {
            width: 100%;
        }

        .auth-divider {
            text-align: center;
            color: rgba(245, 233, 255, 0.62);
            font-size: 0.82rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }

        .footer-grid {
            width: min(1120px, 100%);
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 3rem 1.5rem 4rem;
            border-top: 1px solid rgba(255, 43, 59, 0.18);
        }

        .site-footer {
            margin-top: 4rem;
            color: rgba(245, 233, 255, 0.72);
        }

        .site-footer h3 {
            margin-bottom: 1rem;
            font-size: 1rem;
            color: #ffffff;
            letter-spacing: 0.02em;
        }

        .site-footer p {
            color: rgba(245, 233, 255, 0.68);
            line-height: 1.8;
        }

        .footer-links {
            list-style: none;
            padding: 0;
            display: grid;
            gap: 0.75rem;
        }

        .footer-logo {
            display: inline-flex;
            align-items: center;
            gap: 0.85rem;
            margin-bottom: 1rem;
            text-decoration: none;
            color: #ffffff;
            font-weight: 900;
            font-size: 1.1rem;
        }

        .footer-logo img {
            width: 42px;
            height: 42px;
            object-fit: contain;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.06);
            padding: 0.35rem;
        }

        .footer-section {
            display: flex;
            flex-direction: column;
            gap: 0.95rem;
        }

        .footer-link,
        .footer-links a {
            color: rgba(245, 233, 255, 0.78);
            text-decoration: none;
            font-weight: 700;
            transition: color 0.2s ease;
        }

        .footer-link:hover,
        .footer-links a:hover {
            color: #d6b9ff;
        }

        .footer-bottom {
            width: min(1120px, 100%);
            margin: 0 auto;
            padding: 1rem 1.5rem 2rem;
            border-top: 1px solid rgba(255, 43, 59, 0.12);
            color: rgba(245, 233, 255, 0.6);
            font-size: 0.92rem;
            text-align: center;
        }

        .contact-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.85rem 1rem;
            border-radius: 999px;
            background: rgba(255, 43, 59, 0.14);
            color: #ffe7e9;
            font-weight: 700;
            text-decoration: none;
        }

        .page-loader {
            position: fixed;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.55);
            z-index: 999;
        }

        .page-loader.active {
            display: flex;
        }

        .page-loader-ring {
            width: 4.2rem;
            height: 4.2rem;
            border-radius: 50%;
            border: 4px solid rgba(255, 255, 255, 0.12);
            border-top-color: #ff2b3b;
            animation: page-loader-rotate 1.1s linear infinite;
            box-shadow: 0 0 0 4px rgba(255, 43, 59, 0.08);
        }

        .page-loader-label {
            margin-top: 1rem;
            color: #ffffff;
            font-weight: 700;
            font-size: 0.95rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            opacity: 0.95;
        }

        @keyframes page-loader-rotate {
            to { transform: rotate(360deg); }
        }

        @media (min-width: 1024px) {
            .footer-grid {
                grid-template-columns: repeat(4, minmax(0, 1fr));
            }
        }

        @media (max-width: 1024px) {
            .hero-banner {
                grid-template-columns: 1fr;
            }

            .nav-container {
                flex-direction: column;
                align-items: stretch;
            }

            .search-form {
                max-width: 100%;
            }

            .hero-image {
                min-height: 320px;
            }
        }

        @media (max-width: 640px) {
            .nav-container {
                padding: 0 1rem;
            }

            .hero-banner {
                padding: 2rem 1.25rem;
            }

            .category-heading {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.75rem;
            }

            .drawer-footer {
                flex-direction: column;
                align-items: stretch;
            }
        }
    </style>
</head>
<body>
    <div id="drawer-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.48); z-index: 95; display: none;"></div>
    <div id="page-loader" class="page-loader" aria-hidden="true">
        <div class="page-loader-ring"></div>
        <div class="page-loader-label">Loading</div>
    </div>
    <nav class="site-nav">
        <div class="nav-container">
            <div class="nav-left">
                <a href="{{ route('shop.index') }}" class="nav-logo">
                    <img src="{{ asset('images/logo/images.jpg') }}" alt="Baraka Solar Shop Logo" onerror="this.style.display='none'">
                    <span class="nav-brand">
                        <span class="brand-accent1">Baraka</span>
                        <span class="brand-accent2">Solar</span>
                        <span class="brand-accent3">Shop</span>
                    </span>
                </a>
                <div class="nav-links">
                    <a href="{{ route('shop.index') }}" class="nav-home-link">Home</a>
                    <a href="{{ route('shop.index') }}">Products</a>
                    <a href="#support">Support</a>
                </div>
            </div>
            <form action="{{ route('shop.index') }}" method="GET" class="search-form">
                <label class="sr-only" for="search-field">Search inventory</label>
                <span class="search-icon-label">🔍</span>
                <input id="search-field" type="text" name="search" value="{{ $searchQuery ?? '' }}" placeholder="Search inventory..." class="search-input" autocomplete="off" aria-autocomplete="list" aria-controls="search-dropdown" aria-expanded="false">
                <button type="submit" class="search-btn">Search</button>
                <div id="search-dropdown" class="search-dropdown" role="listbox" aria-label="Search suggestions"></div>
            </form>
            <div class="nav-actions">
                <button id="settings-trigger" class="nav-button">⚙️ Settings ▾</button>
                <div id="setting-menu-panel" class="setting-menu-panel">
                    <button class="setting-menu-item" id="theme-toggle-btn"><span>🌗 Toggle Theme</span> <b id="theme-status-lbl" style="font-size:0.75rem; color:#d6b9ff;">LIGHT</b></button>
                    <hr style="border:none; border-top:1px solid rgba(255,255,255,0.08); margin:0.35rem 0;">
                    @if(session()->has('customer_user'))
                        <button class="setting-menu-item" onclick="alert('👤 Account Status:\nName: {{ session()->get('customer_user')['name'] }}\nEmail: {{ session()->get('customer_user')['email'] }}')"><span>📋 View Account</span></button>
                        <button class="setting-menu-item" style="color:#ff8ea1;" onclick="document.getElementById('logout-form').submit();"><span>🚪 Log Out</span></button>
                        <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">@csrf</form>
                    @else
                        <button class="setting-menu-item" onclick="openAuthModal('login')"><span>🔑 Sign In</span></button>
                        <button class="setting-menu-item" onclick="openAuthModal('register')"><span>📝 Register</span></button>
                    @endif
                </div>
                <button id="cart-trigger" type="button" class="basket-trigger-badge">
                    <span>🛒</span>
                    Basket (<span id="badge-count-val">{{ $cartCount ?? 0 }}</span>)
                </button>
            </div>
        </div>
        <div class="header-ticker">
            <span class="ticker-label">Top picks</span>
            <div class="ticker-track" aria-hidden="true">
                @foreach($tickerUpdates as $update)
                    <span class="ticker-item">{{ $update }}</span>
                @endforeach
                @foreach($tickerUpdates as $update)
                    <span class="ticker-item">{{ $update }}</span>
                @endforeach
            </div>
        </div>
        <div class="category-tabs" aria-label="Shop quick filters">
            @foreach($categoryQuickFilters as $filter => $label)
                <a href="{{ $filter === 'all' ? route('shop.index') : route('shop.category', ['slug' => $filter]) }}" class="category-tab{{ (isset($selectedCategorySlug) && $selectedCategorySlug === $filter) || (!isset($selectedCategorySlug) && $filter === 'all') ? ' active' : '' }}">{{ $label }}</a>
            @endforeach
        </div>
        <div id="filter-notice" class="filter-notice">{{ isset($selectedCategoryName) ? 'Showing ' . $selectedCategoryName . ' only' : 'Showing all products' }}</div>
    </nav>

    @php
        $allProducts = collect($products ?? []);
        $displayCategories = collect($categories ?? [])->filter(function ($category) use ($allProducts) {
            return $allProducts->contains(function ($product) use ($category) {
                return optional($product->category)->slug === $category->slug;
            });
        })->mapWithKeys(function ($category) {
            return [$category->slug => ['title' => $category->name, 'slug' => $category->slug]];
        });

        if ($displayCategories->isEmpty() && $allProducts->isNotEmpty()) {
            $displayCategories = collect(['all' => ['title' => 'All Products', 'slug' => 'all']]);
        }

        $displayCategories = $displayCategories->toArray();
        $categoryCounts = [];
        $searchProducts = $allProducts->map(function($product) {
            return [
                'name' => $product->name ?? '',
                'url' => route('product.show', ['id' => $product->id]),
                'category' => optional($product->category)->name ?? 'Uncategorized',
                'description' => $product->description ?? '',
            ];
        })->values();

        foreach($displayCategories as $slug => $meta) {
            if ($slug === 'all') {
                $categoryCounts[$slug] = $allProducts->count();
                continue;
            }
            $categoryCounts[$slug] = $allProducts->filter(function($p) use ($slug) {
                return isset($p->category) && $p->category->slug === $slug;
            })->count();
        }
    @endphp

    <section class="hero-banner">
        <div class="hero-copy">
            <span class="eyebrow">Baraka Solar Shop</span>
            <h1>Power your home with smarter solar gear and seamless checkout.</h1>
            <p>Shop premium products with clear specs, local M-Pesa pay, and curated bundles for every installation.</p>
            <div class="hero-search-panel">
                <form action="{{ route('shop.index') }}" method="GET" class="hero-search-form">
                    <input type="search" name="search" value="{{ $searchQuery ?? '' }}" placeholder="Search devices by name, brand, or feature" aria-label="Search products" />
                    <button type="submit" class="btn btn-primary">Search inventory</button>
                </form>
                <div class="trust-badges">
                    <span>Secure checkout</span>
                    <span>Fast local delivery</span>
                    <span>12-month warranty</span>
                    <span>30-day returns</span>
                </div>
            </div>
            <div class="hero-actions">
                <button type="button" class="btn btn-primary" onclick="document.getElementById('shop-products').scrollIntoView({ behavior: 'smooth' });">Browse products</button>
                <button type="button" class="btn btn-secondary" onclick="openAuthModal();">Sign in / checkout</button>
            </div>
            <div class="hero-highlights">
                <div>
                    <strong>Fast M-Pesa pay</strong>
                    <span>Checkout instantly with STK push from every product.</span>
                </div>
                <div>
                    <strong>Smart category hub</strong>
                    <span>Find solar, batteries, security, and accessories quickly.</span>
                </div>
                <div>
                    <strong>Device-grade specs</strong>
                    <span>Search and compare items across performance, battery, and price.</span>
                </div>
            </div>
            <div class="hero-loop-text" aria-live="polite">
                <span class="loop-label">Trending now</span>
                @foreach($heroLoopItems as $index => $item)
                    <span class="loop-item{{ $index === 0 ? ' active' : '' }}">{{ $item }}</span>
                @endforeach
            </div>
        </div>
        <div class="hero-image">
            @if(isset($products) && count($products) > 0)
                <div class="featured-carousel" id="featured-carousel">
                    @foreach(collect($products)->take(6) as $slide)
                        <div class="carousel-slide{{ $loop->first ? ' active' : '' }}">
                            <img src="{{ asset($slide->image_path ?: 'images/hero-default.png') }}" alt="{{ $slide->name }}" loading="lazy" onerror="this.onerror=null;this.src='{{ asset('images/hero-default.png') }}'">
                            <div class="carousel-meta">
                                <span class="carousel-title">{{ $slide->name }}</span>
                                <span class="carousel-price">Ksh {{ number_format($slide->price, 2) }}</span>
                            </div>
                        </div>
                    @endforeach
                    <div class="carousel-controls" aria-label="Carousel navigation">
                        <button type="button" class="carousel-nav prev" aria-label="Previous item">‹</button>
                        <button type="button" class="carousel-nav next" aria-label="Next item">›</button>
                    </div>
                </div>
            @else
                <img src="{{ asset($heroImage) }}" alt="Featured solar product">
            @endif
        </div>
    </section>

    <section class="category-hub">
        @foreach($displayCategories as $slug => $meta)
            @php $count = $categoryCounts[$slug] ?? 0; @endphp
            <a href="{{ $slug === 'all' ? route('shop.index') : route('shop.category', ['slug' => $slug]) }}" class="category-block">
                <span class="icon">{{ $meta['icon'] }}</span>
                <div>
                    <strong>{{ strip_tags($meta['title']) }}</strong>
                    <span>{{ $count }} items</span>
                </div>
            </a>
        @endforeach
    </section>

    <section class="filter-bar">
        <div class="filter-pill">Brand</div>
        <div class="filter-pill">Price</div>
        <div class="filter-pill">Battery</div>
        <div class="filter-pill">Performance</div>
        <div class="filter-pill">Popular</div>
        <button type="button" class="btn btn-secondary">Advanced filters</button>
    </section>

    @if(isset($productDetail))
        <section class="product-detail-page" id="product-detail-page">
            <a href="{{ route('shop.index') }}" class="btn btn-secondary" style="margin-bottom:1rem; width:auto;">← Back to shop</a>
            <div class="detail-grid">
                <div class="detail-image">
                    <img src="{{ asset($productDetail->image_path) }}" alt="{{ $productDetail->name }}">
                </div>
                <div class="detail-summary">
                    <span class="eyebrow">Product details</span>
                    <h2>{{ $productDetail->name }}</h2>
                    <div class="detail-meta">Category: {{ optional($productDetail->category)->name ?? 'General' }}</div>
                    <div class="detail-price">Ksh {{ number_format($productDetail->price, 2) }}</div>
                    <p class="detail-meta">{{ $productDetail->description }}</p>
                    <div class="detail-actions">
                        <button type="button" class="btn btn-primary" id="detail-add-cart-btn" data-id="{{ $productDetail->id }}" data-name="{{ $productDetail->name }}" data-price="{{ $productDetail->price }}">Add to cart</button>
                        <button type="button" class="btn btn-secondary" id="detail-buy-now-btn" data-id="{{ $productDetail->id }}" data-name="{{ $productDetail->name }}" data-price="{{ $productDetail->price }}">Pay with M-Pesa</button>
                    </div>
                </div>
            </div>
        </section>
    @endif

    <main id="shop-products">
        @if(empty($products) || count($products) === 0)
            <div style="text-align:center; padding:4rem 1.5rem; background: rgba(255, 43, 59, 0.12); border:1px dashed rgba(255, 43, 59, 0.24); border-radius: 28px; margin: 2rem auto; max-width: 44rem; color: rgba(255,255,255,0.9);">
                <p style="font-weight:700; margin-bottom:1rem;">No items are currently available in this shop.</p>
                <a href="{{ route('shop.index') }}" style="display:inline-flex; align-items:center; justify-content:center; padding:0.85rem 1.4rem; border-radius:999px; background: linear-gradient(135deg,#ff2b3b,#b3001b); color:#fff; font-weight:700;">Back to home</a>
            </div>
        @else
            @php
                $uncategorizedProducts = collect($products)->filter(function($p) use ($displayCategories) {
                    return !isset($p->category) || !array_key_exists($p->category->slug, $displayCategories);
                });
            @endphp

            @foreach($displayCategories as $slug => $meta)
                @php
                    $catProducts = collect($products);
                    if ($slug !== 'all') {
                        $catProducts = $catProducts->filter(function($p) use ($slug) {
                            return isset($p->category) && $p->category->slug === $slug;
                        });
                    }
                @endphp
                @if($catProducts->count() > 0)
                    <section class="category-showcase" id="{{ $slug }}">
                        <div class="category-heading">
                            <span>{{ $meta['title'] }}</span>
                            <span class="badge">{{ $catProducts->count() }} items</span>
                        </div>
                        <div class="section-intro">Browse the {{ $meta['title'] }} collection and pay with M-Pesa in a few taps.</div>
                        <div class="grid-container">
                            @foreach($catProducts as $product)
                                <article class="card product-card" data-product-url="{{ route('product.show', ['id' => $product->id]) }}">
                                    <div class="image-frame">
                                        <img src="{{ asset($product->image_path) }}" alt="{{ $product->name }}">
                                    </div>
                                    <div class="card-body">
                                        <span class="badge" style="display:inline-flex; margin-bottom:0.85rem; background: rgba(255, 43, 59, 0.12); color:#fff; font-size:0.78rem; padding:0.35rem 0.8rem; border-radius:999px;">M-Pesa Ready</span>
                                        <h3 class="product-title">{{ $product->name }}</h3>
                                        <p class="product-desc">{{ Str::limit($product->description, 90) }}</p>
                                    </div>
                                    <div class="card-footer">
                                        <div>
                                            <span class="price-lbl">Price</span>
                                            <div class="product-price">Ksh {{ number_format($product->price, 2) }}</div>
                                            <label class="compare-toggle">
                                                <input type="checkbox" class="compare-checkbox" data-product-id="{{ $product->id }}" data-product-name="{{ $product->name }}" data-product-image="{{ asset($product->image_path) }}" data-product-price="{{ $product->price }}" data-product-category="{{ optional($product->category)->name ?? 'Uncategorized' }}" data-product-wattage="{{ $product->wattage }}" data-product-capacity="{{ $product->capacity_ah }}" data-product-voltage="{{ $product->voltage }}" data-product-url="{{ route('product.show', ['id' => $product->id]) }}" />
                                                Compare
                                            </label>
                                        </div>
                                        <div class="card-actions">
                                            <button type="button" class="btn btn-add add-to-cart-btn" data-id="{{ $product->id }}" onclick="event.stopPropagation();">Add</button>
                                            <button type="button" class="btn btn-pay mpesa-pay-btn" data-id="{{ $product->id }}" data-price="{{ $product->price }}" onclick="event.stopPropagation();">Pay</button>
                                            <button type="button" class="btn btn-secondary quick-view-btn" data-id="{{ $product->id }}" data-name="{{ $product->name }}" data-image="{{ asset($product->image_path) }}" data-price="{{ $product->price }}" data-description="{{ $product->description }}" data-category="{{ optional($product->category)->name ?? 'Uncategorized' }}" data-wattage="{{ $product->wattage }}" data-capacity="{{ $product->capacity_ah }}" data-voltage="{{ $product->voltage }}" data-url="{{ route('product.show', ['id' => $product->id]) }}" onclick="event.stopPropagation();">Quick view</button>
                                        </div>
                                    </div>
                                </article>
                            @endforeach
                        </div>
                    </section>
                @endif
            @endforeach

            @if($uncategorizedProducts->count() > 0)
                <section class="category-showcase category-showcase-uncategorized">
                    <div class="category-heading">
                        <span>Other products</span>
                        <span class="badge">{{ $uncategorizedProducts->count() }} items</span>
                    </div>
                    <div class="section-intro">Products without a category were placed here so nothing is lost.</div>
                    <div class="grid-container">
                        @foreach($uncategorizedProducts as $product)
                            <article class="card product-card" data-product-url="{{ route('product.show', ['id' => $product->id]) }}">
                                <div class="image-frame">
                                    <img src="{{ asset($product->image_path) }}" alt="{{ $product->name }}">
                                </div>
                                <div class="card-body">
                                    <span class="badge" style="display:inline-flex; margin-bottom:0.85rem; background: rgba(255, 43, 59, 0.12); color:#fff; font-size:0.78rem; padding:0.35rem 0.8rem; border-radius:999px;">M-Pesa Ready</span>
                                    <h3 class="product-title">{{ $product->name }}</h3>
                                    <p class="product-desc">{{ Str::limit($product->description, 90) }}</p>
                                </div>
                                <div class="card-footer">
                                    <div>
                                        <span class="price-lbl">Price</span>
                                        <div class="product-price">Ksh {{ number_format($product->price, 2) }}</div>
                                        <label class="compare-toggle">
                                            <input type="checkbox" class="compare-checkbox" data-product-id="{{ $product->id }}" data-product-name="{{ $product->name }}" data-product-image="{{ asset($product->image_path) }}" data-product-price="{{ $product->price }}" data-product-category="{{ optional($product->category)->name ?? 'Uncategorized' }}" data-product-wattage="{{ $product->wattage }}" data-product-capacity="{{ $product->capacity_ah }}" data-product-voltage="{{ $product->voltage }}" data-product-url="{{ route('product.show', ['id' => $product->id]) }}" />
                                            Compare
                                        </label>
                                    </div>
                                    <div class="card-actions">
                                        <button type="button" class="btn btn-add add-to-cart-btn" data-id="{{ $product->id }}" onclick="event.stopPropagation();">Add</button>
                                        <button type="button" class="btn btn-pay mpesa-pay-btn" data-id="{{ $product->id }}" data-price="{{ $product->price }}" onclick="event.stopPropagation();">Pay</button>
                                        <button type="button" class="btn btn-secondary quick-view-btn" data-id="{{ $product->id }}" data-name="{{ $product->name }}" data-image="{{ asset($product->image_path) }}" data-price="{{ $product->price }}" data-description="{{ $product->description }}" data-category="{{ optional($product->category)->name ?? 'Uncategorized' }}" data-wattage="{{ $product->wattage }}" data-capacity="{{ $product->capacity_ah }}" data-voltage="{{ $product->voltage }}" data-url="{{ route('product.show', ['id' => $product->id]) }}" onclick="event.stopPropagation();">Quick view</button>
                                    </div>
                                </div>
                            </article>
                        @endforeach
                    </div>
                </section>
            @endif
        @endif
    </main>

    <aside id="cart-drawer" class="cart-drawer">
        <div class="drawer-header">
            <div>
                <p class="drawer-title">Shopping Basket</p>
                <p class="drawer-subtitle">Review items and complete your order.</p>
            </div>
            <button id="close-drawer" class="drawer-close">&times;</button>
        </div>
        <div class="drawer-share-row">
            <span>Need help with your order? Share your basket.</span>
            <button id="drawer-share-btn" class="drawer-share-btn">Share</button>
        </div>
        <div class="drawer-body">
            <div id="drawer-items-list" class="drawer-items-list">
                @if(!empty($cart) && count($cart) > 0)
                    @foreach($cart as $itemId => $item)
                        <div class="drawer-item-row" id="drawer-item-{{ $itemId }}" data-nav-url="{{ route('product.show', ['id' => $itemId]) }}">
                            <img src="{{ asset($item['image_path'] ?? 'images/logo/images.jpg') }}" alt="{{ $item['name'] }}" class="drawer-item-thumb">
                            <div class="drawer-item-info">
                                <strong>{{ $item['name'] }}</strong>
                                <div class="drawer-item-meta">
                                    <span>Ksh {{ number_format($item['price'], 2) }}</span>
                                    <span id="item-line-total-{{ $itemId }}">{{ number_format($item['price'] * $item['quantity'], 2) }}</span>
                                </div>
                                <div class="drawer-item-actions">
                                    <button class="item-action-btn" onclick="event.stopPropagation(); adjustBasketQty('{{ $itemId }}', -1)">-</button>
                                    <span id="qty-display-{{ $itemId }}" class="quantity-value">{{ $item['quantity'] }}</span>
                                    <button class="item-action-btn" onclick="event.stopPropagation(); adjustBasketQty('{{ $itemId }}', 1)">+</button>
                                    <button class="item-action-btn" onclick="event.stopPropagation(); killBasketItem('{{ $itemId }}')">Remove</button>
                                </div>
                            </div>
                        </div>
                    @endforeach
                @else
                    <p class="drawer-empty">No products in the basket yet. Add items from the catalog to continue.</p>
                @endif
            </div>
        </div>
        <div class="drawer-footer">
            <div>
                <p class="drawer-total-label">Order total</p>
                <p id="drawer-total-val" class="drawer-total-value">Ksh {{ number_format($cartTotal ?? 0, 2) }}</p>
            </div>
            <button id="drawer-checkout-btn" class="btn btn-primary">Checkout</button>
        </div>
    </aside>

    <aside id="compare-drawer" class="compare-drawer" aria-live="polite">
        <h4>Compare products</h4>
        <p class="compare-summary">Select up to 3 items to compare specs side by side.</p>
        <div id="compare-items" class="compare-list">No items selected yet.</div>
        <div id="compare-table-container" class="compare-table-container" style="display:none; margin-top:1rem;"></div>
        <div class="compare-actions">
            <button id="compare-clear-btn" type="button" class="btn btn-secondary">Clear all</button>
            <button id="compare-toggle-btn" type="button" class="btn btn-primary">Show comparison</button>
        </div>
    </aside>

    <div id="quick-view-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content compare-modal-content" onclick="event.stopPropagation();">
            <button class="close-modal-x" onclick="closeQuickView()" style="position:absolute; right:1rem; top:1rem; font-size:1.4rem;">&times;</button>
            <div class="quick-view-grid">
                <div class="quick-view-image">
                    <img id="quick-view-image" src="" alt="Quick view product image">
                </div>
                <div class="quick-view-copy">
                    <span class="eyebrow">Quick View</span>
                    <h3 id="quick-view-title"></h3>
                    <p id="quick-view-category" class="detail-meta" style="margin-top:0.25rem;"></p>
                    <div class="detail-price" id="quick-view-price" style="margin-top:0.75rem; font-size:1.6rem;"></div>
                    <p id="quick-view-desc" class="product-desc" style="margin-top:1rem;"></p>
                    <table class="spec-table" id="quick-view-specs">
                        <tbody></tbody>
                    </table>
                    <div class="detail-actions" style="margin-top:1rem;">
                        <button id="quick-view-add-btn" type="button" class="btn btn-primary">Add to cart</button>
                        <button id="quick-view-pay-btn" type="button" class="btn btn-pay">Pay with M-Pesa</button>
                        <button id="quick-view-detail-btn" type="button" class="btn btn-secondary">View details</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="auth-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content auth-modal-content" style="max-width:900px; display:grid; grid-template-columns:1fr 1fr; gap:1rem; padding:1rem;" onclick="event.stopPropagation()">
            <button class="close-modal-x" onclick="closeAuthModal()" style="position:absolute; right:1rem; top:1rem; font-size:1.4rem;">&times;</button>
            <div style="padding:1rem;">
                <h3 style="margin-bottom:0.5rem;">Sign In</h3>
                <div id="auth-error-log" class="auth-error-log" style="display:none;"></div>
                <div class="form-group">
                    <label>Email or Phone</label>
                    <input type="text" id="auth-input-email" class="auth-input" placeholder="name@example.com or 0712345678">
                </div>
                <div class="form-group auth-input-group">
                    <label>Password</label>
                    <input type="password" id="auth-input-password" class="auth-input" placeholder="••••••••">
                    <button type="button" id="auth-password-toggle" class="password-toggle-btn">Show</button>
                </div>
                <div class="auth-form-footer">
                    <label><input type="checkbox" id="auth-remember-checkbox"> Remember me</label>
                    <a href="javascript:void(0)" id="auth-forgot-password-link" class="auth-helper-link">Forgot password?</a>
                </div>
                <div style="display:flex; gap:0.6rem; margin-top:0.75rem;">
                    <button id="auth-login-btn" class="btn btn-primary" style="flex:1;">Sign In</button>
                </div>
            </div>
            <div style="padding:1rem; border-left:1px solid rgba(0,0,0,0.04);">
                <h3 style="margin-bottom:0.5rem;">Create Account</h3>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="auth-input-name" class="auth-input" placeholder="Full name">
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="auth-input-email-register" class="auth-input" placeholder="name@example.com">
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="auth-input-phone" class="auth-input" placeholder="0712345678">
                    <span class="auth-feedback">Enter a Kenya number for M-Pesa checkout.</span>
                </div>
                <div class="form-group auth-input-group">
                    <label>Password</label>
                    <input type="password" id="auth-input-password-register" class="auth-input" placeholder="••••••••">
                    <button type="button" id="auth-password-toggle-register" class="password-toggle-btn">Show</button>
                </div>
                <div class="form-group auth-input-group">
                    <label>Confirm Password</label>
                    <input type="password" id="auth-input-password-confirm" class="auth-input" placeholder="••••••••">
                    <button type="button" id="auth-password-toggle-confirm" class="password-toggle-btn">Show</button>
                </div>
                <div id="password-strength-indicator" class="auth-feedback">Password must be at least 8 characters.</div>
                <div style="display:flex; gap:0.6rem; margin-top:0.75rem;">
                    <button id="auth-register-btn" class="btn btn-primary" style="flex:1;">Create Account</button>
                </div>
            </div>
            <div style="grid-column:1 / -1; text-align:center; margin-top:0.5rem;">
                <button type="button" id="auth-guest-btn" class="btn btn-secondary auth-guest-btn">Checkout as Guest</button>
                <p style="color:rgba(255,255,255,0.72); font-weight:700; margin-top:0.75rem;">Guest checkout keeps the purchase flow moving without forcing account creation.</p>
            </div>
        </div>
    </div>

    <!-- M-Pesa Payment Modal -->
    <div id="mpesa-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content" onclick="event.stopPropagation();">
            <button class="close-modal-x" onclick="closeMpesaModal()" style="position:absolute;right:1rem;top:1rem;font-size:1.4rem;">&times;</button>
            <div style="padding:2rem;">
                <h3 style="margin-bottom:0.5rem;">Pay with M-Pesa</h3>
                <p style="color:rgba(245,233,255,0.7); margin-bottom:1rem;">Enter your phone number to receive an STK Push. This demo simulates the request unless Daraja credentials are configured.</p>
                <div class="form-group">
                    <label for="mpesa-phone">Phone (MSISDN)</label>
                    <input id="mpesa-phone" type="tel" inputmode="tel" pattern="^2547[0-9]{8}$" maxlength="12" class="auth-input" placeholder="2547XXXXXXXX" autocomplete="tel" />
                    <span class="auth-feedback">Use Kenyan format: 2547XXXXXXXX. We’ll normalize 0712345678 or +254712345678 automatically.</span>
                </div>
                <div class="form-group">
                    <label>Amount</label>
                    <input id="mpesa-amount" class="auth-input" readonly />
                </div>
                <div style="display:flex; gap:0.6rem; margin-top:1rem;">
                    <button id="mpesa-send-btn" class="btn btn-primary">Send STK Push</button>
                    <button class="btn btn-secondary" onclick="closeMpesaModal()">Cancel</button>
                </div>
                <div id="mpesa-feedback" style="margin-top:1rem; color: #d6b9ff; font-weight:700;"></div>
            </div>
        </div>
    </div>

    <!-- Payment Processing Modal -->
    <div id="payment-processing-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content" style="max-width:28rem; width:100%;" onclick="event.stopPropagation();">
            <button class="close-modal-x" onclick="closeProcessingModal()" style="position:absolute;right:1rem;top:1rem;font-size:1.4rem;">&times;</button>
            <div style="padding:2rem; text-align:center; min-width:20rem;">
                <h3 id="processing-title" style="margin-bottom:0.75rem;">Sending payment request</h3>
                <p id="processing-message" style="margin-bottom:1rem; color:rgba(245,233,255,0.82);">Preparing your payment. Please keep your phone nearby.</p>
                <div class="page-loader-ring" style="margin:1.25rem auto 0;"></div>
                <button id="processing-retry-btn" type="button" class="btn btn-secondary" style="margin-top:1.25rem; display:none;">Try again</button>
            </div>
        </div>
    </div>

    <!-- Payment Chooser Modal (opened from product image) -->
    <div id="payment-chooser-modal" class="modal-overlay" style="display:none;">
        <div class="modal-content" onclick="event.stopPropagation();">
            <button class="close-modal-x" onclick="closePaymentChooser()" style="position:absolute;right:1rem;top:1rem;font-size:1.2rem;">&times;</button>
            <div style="padding:1.25rem; text-align:center;">
                <h3 style="margin-bottom:0.25rem;">Choose payment method</h3>
                <div style="color:rgba(245,233,255,0.72); margin-bottom:0.75rem;">Amount: Ksh <span class="chooser-amount">0.00</span></div>
                <div style="display:flex; gap:0.6rem; justify-content:center; flex-wrap:wrap;">
                    <button id="chooser-mpesa-btn" class="btn btn-primary" style="min-width:10rem;">Pay with M-Pesa</button>
                    <button id="chooser-whatsapp-btn" class="btn btn-secondary" style="min-width:10rem;">Order via WhatsApp</button>
                    <button id="chooser-card-btn" class="btn btn-secondary" style="min-width:10rem;">Card (Not configured)</button>
                </div>
                <p id="chooser-feedback" style="margin-top:0.9rem; color:#d6b9ff; font-weight:700;"></p>
            </div>
        </div>
    </div>

    <footer class="site-footer">
        <div class="footer-grid">
            <div class="footer-section">
                <a href="{{ route('shop.index') }}" class="footer-logo">
                    <img src="{{ asset('images/logo/images.jpg') }}" alt="Baraka Solar Shop Logo" onerror="this.style.display='none'">
                    <span>Baraka Solar Shop</span>
                </a>
                <p>Premier corporate technology distribution hub supplying high-capacity monocrystalline arrays across East Africa.</p>
            </div>
            <div class="footer-section">
                <h3>SHOP CATEGORIES</h3>
                <ul class="footer-links">
                    <li><a href="#solar-panels" class="footer-link">Solar Panels</a></li>
                    <li><a href="#solar-batteries" class="footer-link">Batteries</a></li>
                    <li><a href="#hybrid-inverters" class="footer-link">Hybrid Inverters</a></li>
                    <li><a href="#cctv-cameras" class="footer-link">Security Cameras</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3 id="support">HELP & SUPPORT</h3>
                <ul class="footer-links">
                    <li><a href="https://wa.me/254727940136" target="_blank" rel="noreferrer" class="footer-link">WhatsApp Support</a></li>
                    <li><a href="tel:+254727940136" class="footer-link">Call Sales</a></li>
                    <li><a href="javascript:void(0)" onclick="document.getElementById('cart-trigger').click()" class="footer-link">Open Basket</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>LEGAL & POLICY</h3>
                <ul class="footer-links">
                    <li><a href="#" class="footer-link">📋 Terms of Service</a></li>
                    <li><a href="#" class="footer-link">🛡️ Privacy Policy</a></li>
                    <li><a href="#" class="footer-link">🔄 Return Policy</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© {{ date('Y') }} Baraka Solar Shop — powering durable energy solutions across East Africa.</p>
        </div>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const settingsTrigger = document.getElementById('settings-trigger');
            const settingMenuPanel = document.getElementById('setting-menu-panel');
            const themeToggleBtn = document.getElementById('theme-toggle-btn');
            const themeStatusLbl = document.getElementById('theme-status-lbl');
            const cartTrigger = document.getElementById('cart-trigger');
            const closeDrawer = document.getElementById('close-drawer');
            const cartDrawer = document.getElementById('cart-drawer');
            const drawerOverlay = document.getElementById('drawer-overlay');
            const badgeCountVal = document.getElementById('badge-count-val');
            const drawerTotalVal = document.getElementById('drawer-total-val');
            const checkoutBtn = document.getElementById('drawer-checkout-btn');
            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';
            const dashboardRoute = "{{ route('dashboard') }}";
            const checkoutRoute = "{{ route('checkout') }}";
            let authIntendedRoute = dashboardRoute;

            if (settingsTrigger && settingMenuPanel) {
                settingsTrigger.addEventListener('click', (e) => { e.stopPropagation(); settingMenuPanel.classList.toggle('open'); });
                document.addEventListener('click', () => settingMenuPanel.classList.remove('open'));
            }

            const searchField = document.getElementById('search-field');
            const searchDropdown = document.getElementById('search-dropdown');
            const searchProducts = @json($searchProducts);

            function updateSearchDropdown() {
                if (!searchField || !searchDropdown) return;
                const query = searchField.value.trim().toLowerCase();
                searchDropdown.innerHTML = '';
                searchField.setAttribute('aria-expanded', query.length > 0 ? 'true' : 'false');

                if (!query) {
                    searchDropdown.classList.remove('active');
                    return;
                }

                const matches = searchProducts.filter(item => {
                    return item.name.toLowerCase().includes(query)
                        || item.category.toLowerCase().includes(query)
                        || item.description.toLowerCase().includes(query);
                });

                if (matches.length === 0) {
                    const noResult = document.createElement('div');
                    noResult.className = 'search-no-results';
                    noResult.textContent = 'No matching products found';
                    searchDropdown.appendChild(noResult);
                    searchDropdown.classList.add('active');
                    return;
                }

                function formatSuggestion(name, query) {
                    const normalized = name.toLowerCase();
                    const startIndex = normalized.indexOf(query);
                    if (startIndex === -1) {
                        return name;
                    }
                    const endIndex = Math.min(name.length, startIndex + query.length + 5);
                    let snippet = name.slice(startIndex, endIndex);
                    if (startIndex > 0) {
                        snippet = '…' + snippet;
                    }
                    if (endIndex < name.length) {
                        snippet += '…';
                    }
                    return snippet;
                }

                matches.slice(0, 8).forEach(item => {
                    const option = document.createElement('button');
                    option.type = 'button';
                    option.className = 'search-suggestion-item';
                    option.setAttribute('role', 'option');
                    option.textContent = formatSuggestion(item.name, query);
                    option.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!item.url) return;
                        showPageLoader();
                        window.location.href = item.url;
                    });
                    searchDropdown.appendChild(option);
                });

                searchDropdown.classList.add('active');
            }

            if (searchField) {
                searchField.addEventListener('input', updateSearchDropdown);
                searchField.addEventListener('focus', updateSearchDropdown);
                document.addEventListener('click', function(event) {
                    if (!searchDropdown.contains(event.target) && event.target !== searchField) {
                        searchDropdown.classList.remove('active');
                        searchField.setAttribute('aria-expanded', 'false');
                    }
                });
            }

            if(localStorage.getItem('dark-theme') === 'true') { document.body.classList.add('dark-mode'); if(themeStatusLbl) themeStatusLbl.textContent = 'DARK'; }
            if (themeToggleBtn) {
                themeToggleBtn.addEventListener('click', () => {
                    const isDark = document.body.classList.toggle('dark-mode');
                    localStorage.setItem('dark-theme', isDark);
                    if(themeStatusLbl) themeStatusLbl.textContent = isDark ? 'DARK' : 'LIGHT';
                });
            }

            function openCartDrawer() {
                cartDrawer.classList.add('open');
                drawerOverlay.style.display = 'block';
            }

            function closeCartDrawer() {
                cartDrawer.classList.remove('open');
                if (drawerOverlay) drawerOverlay.style.display = 'none';
            }

            if(cartTrigger) cartTrigger.addEventListener('click', () => openCartDrawer());
            if(closeDrawer) closeDrawer.addEventListener('click', () => closeCartDrawer());
            if(drawerOverlay) drawerOverlay.addEventListener('click', () => { closeCartDrawer(); closeAuthModal(); });

            const drawerShareBtn = document.getElementById('drawer-share-btn');
            if (drawerShareBtn) {
                drawerShareBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const drawerTotalText = drawerTotalVal ? drawerTotalVal.textContent : 'Ksh 0.00';
                    const messageString = `Hello Baraka Solar Shop, I want to share my basket. Current total is ${drawerTotalText}.`;
                    window.open('https://wa.me/?text=' + encodeURIComponent(messageString), '_blank');
                });
            }

            if(checkoutBtn) {
                checkoutBtn.onclick = function() {
                    if (userIsAuthenticated) {
                        window.location.href = checkoutRoute;
                        return;
                    }
                    authIntendedRoute = checkoutRoute;
                    openAuthModal('login', checkoutRoute);
                };
            }


            window.adjustBasketQty = function(id, directionCode) {
                const qtyTxtSpan = document.getElementById(`qty-display-${id}`);
                const linePriceSpan = document.getElementById(`item-line-total-${id}`);
                let currentItemCountVal = parseInt(qtyTxtSpan.textContent) + directionCode;
                if (currentItemCountVal <= 0) { killBasketItem(id); return; }

                qtyTxtSpan.textContent = currentItemCountVal;
                fetch(`/cart/update/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ quantity: currentItemCountVal })
                }).then(res => res.json()).then(data => {
                    if(data.success) {
                        badgeCountVal.textContent = data.cart_count; drawerTotalVal.textContent = 'Ksh ' + data.cart_total;
                        const targetItemMeta = data.cart_items[id];
                        if(targetItemMeta) linePriceSpan.textContent = Number(targetItemMeta.price * targetItemMeta.quantity).toLocaleString(undefined, {minimumFractionDigits: 2});
                    }
                });
            };

            window.killBasketItem = function(id) {
                const targetCardRow = document.getElementById(`drawer-item-${id}`);
                fetch(`/cart/remove/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken } }).then(res => res.json()).then(data => {
                    if(data.success) {
                        badgeCountVal.textContent = data.cart_count; drawerTotalVal.textContent = 'Ksh ' + data.cart_total;
                        if(targetCardRow) targetCardRow.remove();
                        if(data.cart_count === 0) window.location.reload();
                    }
                });
            };

            document.querySelectorAll('.card-footer').forEach(footer => footer.addEventListener('click', e => e.stopPropagation()));

            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation(); const id = this.getAttribute('data-id');
                    fetch(`/cart/add/${id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                        },
                        body: JSON.stringify({})
                    }).then(res => res.json()).then(data => { if(data.success) window.location.reload(); });
                });
            });

            const detailAddBtn = document.getElementById('detail-add-cart-btn');
            if (detailAddBtn) {
                detailAddBtn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    fetch(`/cart/add/${id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                        },
                        body: JSON.stringify({})
                    }).then(res => res.json()).then(data => { if(data.success) window.location.reload(); });
                });
            }

            const detailBuyBtn = document.getElementById('detail-buy-now-btn');
            if (detailBuyBtn) {
                detailBuyBtn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const price = this.getAttribute('data-price');
                    openMpesaModal(id, price);
                });
            }

            document.querySelectorAll('.show-more-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const targetSlug = this.getAttribute('data-target');
                    const hiddenItems = document.querySelectorAll(`section#${targetSlug} .product-hidden`);
                    hiddenItems.forEach(item => item.classList.remove('product-hidden'));
                    this.textContent = 'Showing all items';
                    this.disabled = true;
                });
            });

            function hidePageLoader() {
                const loader = document.getElementById('page-loader');
                if (!loader) return;
                loader.classList.remove('active');
                document.body.style.pointerEvents = '';
                document.body.style.cursor = '';
                loader.setAttribute('aria-hidden', 'true');
            }

            function showPageLoader() {
                const loader = document.getElementById('page-loader');
                if (!loader) return;
                loader.classList.add('active');
                document.body.style.pointerEvents = 'none';
                document.body.style.cursor = 'progress';
                loader.setAttribute('aria-hidden', 'false');
            }

            function navigateWithLoader(url) {
                if (!url) return;
                showPageLoader();
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        window.location.href = url;
                    }, 35);
                });
            }

            window.addEventListener('pageshow', function(event) {
                if (event.persisted) {
                    hidePageLoader();
                }
            });
            window.addEventListener('load', hidePageLoader);

            document.querySelectorAll('.card').forEach(card => {
                const productUrl = card.getAttribute('data-product-url');
                if (!productUrl) return;
                card.addEventListener('click', (e) => {
                    if (e.target.closest('button, a')) return;
                    navigateWithLoader(productUrl);
                });
            });

            document.querySelectorAll('[data-nav-url]').forEach(navItem => {
                navItem.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const url = this.getAttribute('data-nav-url');
                    if (url) navigateWithLoader(url);
                });
            });

            document.querySelectorAll('.drawer-item-row').forEach(itemRow => {
                itemRow.addEventListener('click', function(e) {
                    if (e.target.closest('button')) return;
                    const itemUrl = this.getAttribute('data-nav-url');
                    if (itemUrl) navigateWithLoader(itemUrl);
                });
            });

            document.querySelectorAll('a[href]').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
                if (link.target === '_blank' || link.hasAttribute('download')) return;
                const url = link.href;
                if (!url.startsWith(window.location.origin) && !href.startsWith('/')) return;

                link.addEventListener('click', function(e) {
                    if (href.startsWith('/')) {
                        e.preventDefault();
                        navigateWithLoader(url);
                    }
                });
            });

            window.openAuthModal = function(mode = 'login') {
                const modal = document.getElementById('auth-modal'); if(!modal) return;
                modal.style.display = 'flex';
                drawerOverlay.style.display = 'block';
                const errLog = document.getElementById('auth-error-log'); if(errLog) { errLog.style.display = 'none'; errLog.textContent = ''; }
                document.querySelectorAll('.auth-input').forEach(el => el.classList.remove('invalid'));
                if (mode === 'register') {
                    document.getElementById('auth-input-name')?.focus();
                } else {
                    document.getElementById('auth-input-email')?.focus();
                }
            };

            window.closeAuthModal = function() { const modal = document.getElementById('auth-modal'); if(modal) modal.style.display = 'none'; if (!cartDrawer.classList.contains('open')) drawerOverlay.style.display = 'none'; };

            function showAuthError(message, invalidIds = []) {
                const errLog = document.getElementById('auth-error-log');
                if (errLog) { errLog.style.display = 'block'; errLog.textContent = message; }
                document.querySelectorAll('.auth-input').forEach(el => el.classList.remove('invalid'));
                invalidIds.forEach(id => {
                    const field = document.getElementById(id);
                    if (field) field.classList.add('invalid');
                });
            }

            const loginBtn = document.getElementById('auth-login-btn');
            const rememberCheckbox = document.getElementById('auth-remember-checkbox');
            const passwordToggleLogin = document.getElementById('auth-password-toggle');
            const passwordToggleRegister = document.getElementById('auth-password-toggle-register');
            const passwordToggleConfirm = document.getElementById('auth-password-toggle-confirm');
            const registerPasswordInput = document.getElementById('auth-input-password-register');
            const passwordStrengthIndicator = document.getElementById('password-strength-indicator');
            const guestCheckoutBtn = document.getElementById('auth-guest-btn');

            function togglePasswordVisibility(input, button) {
                if (!input || !button) return;
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                button.textContent = isPassword ? 'Hide' : 'Show';
            }

            if (passwordToggleLogin) {
                passwordToggleLogin.addEventListener('click', () => {
                    togglePasswordVisibility(document.getElementById('auth-input-password'), passwordToggleLogin);
                });
            }

            if (passwordToggleRegister) {
                passwordToggleRegister.addEventListener('click', () => {
                    togglePasswordVisibility(registerPasswordInput, passwordToggleRegister);
                });
            }

            if (passwordToggleConfirm) {
                passwordToggleConfirm.addEventListener('click', () => {
                    togglePasswordVisibility(document.getElementById('auth-input-password-confirm'), passwordToggleConfirm);
                });
            }

            if (registerPasswordInput && passwordStrengthIndicator) {
                registerPasswordInput.addEventListener('input', function() {
                    const valid = this.value.length >= 8;
                    passwordStrengthIndicator.textContent = valid ? 'Strong enough password.' : 'Password must be at least 8 characters.';
                    passwordStrengthIndicator.classList.toggle('strong', valid);
                });
            }

            if (loginBtn) loginBtn.addEventListener('click', function() {
                const emailOrPhone = document.getElementById('auth-input-email').value.trim();
                const pass = document.getElementById('auth-input-password').value;
                const remember = rememberCheckbox ? rememberCheckbox.checked : false;
                if (!emailOrPhone || !pass) {
                    showAuthError('Please enter your email or phone and password.', ['auth-input-email', 'auth-input-password']);
                    return;
                }
                fetch('/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken }, body: JSON.stringify({ email: emailOrPhone, password: pass, remember: remember }) })
                .then(res => res.json()).then(data => {
                    if(data.success) {
                        window.location.reload();
                    } else {
                        showAuthError(data.message || 'Invalid email or password.', ['auth-input-email', 'auth-input-password']);
                    }
                }).catch(() => { showAuthError('Network error. Please try again.'); });
            });

            if (guestCheckoutBtn) {
                guestCheckoutBtn.addEventListener('click', function() {
                    const phone = document.getElementById('auth-input-phone')?.value.trim() || '';
                    const email = document.getElementById('auth-input-email')?.value.trim() || document.getElementById('auth-input-email-register')?.value.trim() || '';
                    if (!phone) {
                        showAuthError('Please enter a phone number to continue as guest.', ['auth-input-phone']);
                        return;
                    }
                    fetch('/guest-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken }, body: JSON.stringify({ phone: phone, email: email }) })
                    .then(res => res.json()).then(data => {
                        if(data.success) {
                            window.location.reload();
                        } else {
                            showAuthError(data.message || 'Unable to start guest checkout.');
                        }
                    }).catch(() => { showAuthError('Network error. Please try again.'); });
                });
            }

            const registerBtn = document.getElementById('auth-register-btn');
            if (registerBtn) registerBtn.addEventListener('click', function() {
                const name = document.getElementById('auth-input-name').value.trim();
                const email = document.getElementById('auth-input-email-register').value.trim();
                const phone = document.getElementById('auth-input-phone').value.trim();
                const pass = document.getElementById('auth-input-password-register').value;
                const confirmPass = document.getElementById('auth-input-password-confirm').value;
                if (!name || !email || !phone || !pass || !confirmPass) {
                    showAuthError('Please fill in all registration fields.', ['auth-input-name', 'auth-input-email-register', 'auth-input-phone', 'auth-input-password-register', 'auth-input-password-confirm']);
                    return;
                }
                if (pass !== confirmPass) {
                    showAuthError('Passwords do not match.', ['auth-input-password-register', 'auth-input-password-confirm']);
                    return;
                }
                if (pass.length < 8) {
                    showAuthError('Password must be at least 8 characters long.', ['auth-input-password-register']);
                    return;
                }
                fetch('/register', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken }, body: JSON.stringify({ name: name, email: email, phone: phone, password: pass, password_confirmation: confirmPass, remember: rememberCheckbox ? rememberCheckbox.checked : false, intended_route: authIntendedRoute }) })
                .then(res => res.json()).then(data => {
                    if(data.success) {
                        window.location.href = data.redirect || dashboardRoute;
                    } else {
                        if (data.errors) {
                            const fieldMap = {
                                name: 'auth-input-name',
                                email: 'auth-input-email-register',
                                phone: 'auth-input-phone',
                                password: 'auth-input-password-register',
                                password_confirmation: 'auth-input-password-confirm'
                            };
                            const invalidIds = [];
                            const messages = [];
                            Object.keys(data.errors).forEach(key => {
                                if (fieldMap[key]) invalidIds.push(fieldMap[key]);
                                messages.push(Array.isArray(data.errors[key]) ? data.errors[key].join(' ') : data.errors[key]);
                            });
                            showAuthError(messages.join(' '), invalidIds);
                        } else {
                            showAuthError(data.message || 'Registration failed.');
                        }
                    }
                }).catch(() => { showAuthError('Network error. Please try again.'); });
            });

            window.openAuthModal = function(mode = 'login', intended = dashboardRoute) {
                authIntendedRoute = intended || dashboardRoute;
                const modal = document.getElementById('auth-modal'); if(!modal) return;
                modal.style.display = 'flex';
                drawerOverlay.style.display = 'block';
                const errLog = document.getElementById('auth-error-log'); if(errLog) { errLog.style.display = 'none'; errLog.textContent = ''; }
                document.querySelectorAll('.auth-input').forEach(el => el.classList.remove('invalid'));
                if (mode === 'register') {
                    document.getElementById('auth-input-name')?.focus();
                } else {
                    document.getElementById('auth-input-email')?.focus();
                }
            };

            window.closeAuthModal = function() { const modal = document.getElementById('auth-modal'); if(modal) modal.style.display = 'none'; if (!cartDrawer.classList.contains('open')) drawerOverlay.style.display = 'none'; };

            // M-Pesa modal handlers
            function openMpesaModal(id, price) {
                document.getElementById('mpesa-modal').style.display = 'flex';
                drawerOverlay.style.display = 'block';
                document.getElementById('mpesa-phone').value = '';
                document.getElementById('mpesa-amount').value = Number(price).toFixed(2);
                document.getElementById('mpesa-feedback').textContent = '';
                document.getElementById('mpesa-send-btn').setAttribute('data-id', id);
            }

            function closeMpesaModal() {
                document.getElementById('mpesa-modal').style.display = 'none';
                if (!cartDrawer.classList.contains('open')) drawerOverlay.style.display = 'none';
            }

            function openPaymentOptions(id, price) {
                const chooser = document.getElementById('payment-chooser-modal');
                if (!chooser) { openMpesaModal(id, price); return; }
                chooser.style.display = 'flex'; drawerOverlay.style.display = 'block';
                chooser.setAttribute('data-id', id); chooser.setAttribute('data-price', price);
                // set amount preview
                const amt = chooser.querySelector('.chooser-amount'); if(amt) amt.textContent = Number(price).toFixed(2);
            }

            function closePaymentChooser() {
                const chooser = document.getElementById('payment-chooser-modal');
                if (chooser) chooser.style.display = 'none';
                if (!cartDrawer.classList.contains('open')) drawerOverlay.style.display = 'none';
            }

            document.querySelectorAll('.mpesa-pay-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = this.getAttribute('data-id');
                    const price = this.getAttribute('data-price');
                    openMpesaModal(id, price);
                });
            });

            document.querySelectorAll('.product-buy-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = this.getAttribute('data-id');
                    const price = this.getAttribute('data-price');
                    openPaymentOptions(id, price);
                });
            });

            const compareDrawer = document.getElementById('compare-drawer');
            const compareItemsContainer = document.getElementById('compare-items');
            const compareTableContainer = document.getElementById('compare-table-container');
            const compareClearBtn = document.getElementById('compare-clear-btn');
            const compareToggleBtn = document.getElementById('compare-toggle-btn');
            const quickViewModal = document.getElementById('quick-view-modal');
            const quickViewImage = document.getElementById('quick-view-image');
            const quickViewTitle = document.getElementById('quick-view-title');
            const quickViewCategory = document.getElementById('quick-view-category');
            const quickViewPrice = document.getElementById('quick-view-price');
            const quickViewDesc = document.getElementById('quick-view-desc');
            const quickViewSpecsBody = document.querySelector('#quick-view-specs tbody');
            const quickViewAddBtn = document.getElementById('quick-view-add-btn');
            const quickViewPayBtn = document.getElementById('quick-view-pay-btn');
            const quickViewDetailBtn = document.getElementById('quick-view-detail-btn');
            let compareSelection = {};
            let currentQuickView = null;

            function renderCompareItems() {
                const selected = Object.values(compareSelection);
                compareItemsContainer.innerHTML = '';
                compareTableContainer.innerHTML = '';

                if (selected.length === 0) {
                    compareItemsContainer.textContent = 'No items selected yet. Tick Compare on product cards to start.';
                    compareTableContainer.style.display = 'none';
                    return;
                }

                selected.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'compare-item';
                    row.innerHTML = `
                        <img src="${item.image}" alt="${item.name}">
                        <div style="flex:1; min-width:0;">
                            <strong>${item.name}</strong>
                            <div style="font-size:0.87rem; color:rgba(255,255,255,0.72); margin-top:0.35rem;">${item.category}</div>
                        </div>
                        <button type="button" class="btn btn-secondary" style="min-width:7rem;" data-remove-id="${item.id}">Remove</button>
                    `;
                    const removeButton = row.querySelector('[data-remove-id]');
                    removeButton.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const removeId = this.getAttribute('data-remove-id');
                        const checkbox = document.querySelector(`.compare-checkbox[data-product-id="${removeId}"]`);
                        if (checkbox) checkbox.checked = false;
                        delete compareSelection[removeId];
                        renderCompareItems();
                    });
                    compareItemsContainer.appendChild(row);
                });

                if (selected.length > 1) {
                    compareTableContainer.style.display = 'block';
                    compareTableContainer.innerHTML = '';
                    const table = document.createElement('table');
                    table.className = 'spec-table compare-spec-table';
                    const head = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    headerRow.innerHTML = '<th>Feature</th>' + selected.map(item => `<th>${item.name}</th>`).join('');
                    head.appendChild(headerRow);
                    table.appendChild(head);
                    const rows = [
                        ['Price', ...selected.map(item => `Ksh ${Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`)],
                        ['Wattage', ...selected.map(item => item.wattage || '—')],
                        ['Capacity', ...selected.map(item => item.capacity || '—')],
                        ['Voltage', ...selected.map(item => item.voltage || '—')],
                        ['Category', ...selected.map(item => item.category || '—')],
                        ['Link', ...selected.map(item => `<a href="${item.url}" class="footer-link" style="color:#d6b9ff;">View</a>`)]
                    ];
                    const tbody = document.createElement('tbody');
                    rows.forEach(rowData => {
                        const rowEl = document.createElement('tr');
                        rowEl.innerHTML = '<th>' + rowData[0] + '</th>' + rowData.slice(1).map(value => `<td>${value}</td>`).join('');
                        tbody.appendChild(rowEl);
                    });
                    table.appendChild(tbody);
                    compareTableContainer.appendChild(table);
                } else {
                    compareTableContainer.style.display = 'none';
                }
            }

            function toggleCompareCheckbox(checkbox) {
                const id = checkbox.getAttribute('data-product-id');
                if (!id) return;
                if (checkbox.checked) {
                    if (Object.keys(compareSelection).length >= 3) {
                        checkbox.checked = false;
                        alert('Compare up to 3 items only. Remove one from the compare drawer to add another.');
                        return;
                    }
                    compareSelection[id] = {
                        id,
                        name: checkbox.getAttribute('data-product-name') || 'Product',
                        image: checkbox.getAttribute('data-product-image') || '',
                        price: checkbox.getAttribute('data-product-price') || '0.00',
                        category: checkbox.getAttribute('data-product-category') || 'Uncategorized',
                        wattage: checkbox.getAttribute('data-product-wattage'),
                        capacity: checkbox.getAttribute('data-product-capacity'),
                        voltage: checkbox.getAttribute('data-product-voltage'),
                        url: checkbox.getAttribute('data-product-url') || '#'
                    };
                } else {
                    delete compareSelection[id];
                }
                renderCompareItems();
            }

            function openQuickView(product) {
                if (!quickViewModal) return;
                currentQuickView = product;
                quickViewImage.src = product.image || '';
                quickViewImage.alt = product.name || 'Product preview';
                quickViewTitle.textContent = product.name || 'Product preview';
                quickViewCategory.textContent = `Category: ${product.category || 'General'}`;
                quickViewPrice.textContent = `Ksh ${Number(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                quickViewDesc.textContent = product.description || 'No description available.';
                const specs = [
                    ['Wattage', product.wattage || '—'],
                    ['Capacity', product.capacity || '—'],
                    ['Voltage', product.voltage || '—'],
                    ['Stock', product.stock || 'N/A']
                ];
                quickViewSpecsBody.innerHTML = specs.map(spec => `<tr><th>${spec[0]}</th><td>${spec[1]}</td></tr>`).join('');
                quickViewModal.style.display = 'flex';
                drawerOverlay.style.display = 'block';
            }

            function closeQuickView() {
                if (!quickViewModal) return;
                quickViewModal.style.display = 'none';
                if (!cartDrawer.classList.contains('open')) drawerOverlay.style.display = 'none';
            }

            document.querySelectorAll('.compare-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function(e) {
                    e.stopPropagation();
                    toggleCompareCheckbox(this);
                });
            });

            compareClearBtn?.addEventListener('click', function() {
                compareSelection = {};
                document.querySelectorAll('.compare-checkbox').forEach(checkbox => checkbox.checked = false);
                renderCompareItems();
            });

            compareToggleBtn?.addEventListener('click', function() {
                if (!compareDrawer) return;
                compareDrawer.classList.toggle('open');
            });

            document.querySelectorAll('.quick-view-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openQuickView({
                        id: this.getAttribute('data-id'),
                        name: this.getAttribute('data-name'),
                        image: this.getAttribute('data-image'),
                        price: this.getAttribute('data-price'),
                        description: this.getAttribute('data-description'),
                        category: this.getAttribute('data-category'),
                        wattage: this.getAttribute('data-wattage'),
                        capacity: this.getAttribute('data-capacity'),
                        voltage: this.getAttribute('data-voltage'),
                        url: this.getAttribute('data-url')
                    });
                });
            });

            if (quickViewAddBtn) {
                quickViewAddBtn.addEventListener('click', function() {
                    if (!currentQuickView) return;
                    fetch(`/cart/add/${currentQuickView.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                        body: JSON.stringify({})
                    }).then(res => res.json()).then(data => {
                        if (data.success) {
                            badgeCountVal.textContent = data.cart_count;
                            closeQuickView();
                        }
                    });
                });
            }

            if (quickViewPayBtn) {
                quickViewPayBtn.addEventListener('click', function() {
                    if (!currentQuickView) return;
                    openMpesaModal(currentQuickView.id, currentQuickView.price);
                });
            }

            if (quickViewDetailBtn) {
                quickViewDetailBtn.addEventListener('click', function() {
                    if (!currentQuickView) return;
                    closeQuickView();
                    navigateWithLoader(currentQuickView.url);
                });
            }

            if (quickViewModal) {
                quickViewModal.addEventListener('click', function() {
                    closeQuickView();
                });
            }

            renderCompareItems();

            const featuredCarousel = document.getElementById('featured-carousel');
            if (featuredCarousel) {
                const slides = Array.from(featuredCarousel.querySelectorAll('.carousel-slide'));
                if (slides.length > 0) {
                    let slideIndex = slides.findIndex(slide => slide.classList.contains('active'));
                    if (slideIndex < 0) slideIndex = 0;
                    slides.forEach((slide, index) => {
                        if (index !== slideIndex) {
                            slide.classList.remove('active');
                        } else {
                            slide.classList.add('active');
                        }
                    });

                    const changeSlide = (nextIndex) => {
                        if (!slides[slideIndex] || !slides[nextIndex]) return;
                        slides[slideIndex].classList.remove('active');
                        slideIndex = nextIndex;
                        slides[slideIndex].classList.add('active');
                    };

                    const nextSlide = () => changeSlide((slideIndex + 1) % slides.length);
                    const prevSlide = () => changeSlide((slideIndex - 1 + slides.length) % slides.length);

                    if (slides.length > 1) {
                        let carouselTimer = setInterval(nextSlide, 3800);
                        const resetCarouselTimer = () => {
                            clearInterval(carouselTimer);
                            carouselTimer = setInterval(nextSlide, 3800);
                        };

                        featuredCarousel.querySelectorAll('.carousel-nav').forEach(control => {
                            control.addEventListener('click', (e) => {
                                e.stopPropagation();
                                if (control.classList.contains('next')) nextSlide();
                                else prevSlide();
                                resetCarouselTimer();
                            });
                        });
                    }
                }
            }

            const heroLoopText = document.querySelectorAll('.hero-loop-text .loop-item');
            if (heroLoopText.length) {
                let heroLoopIndex = 0;
                setInterval(() => {
                    heroLoopText[heroLoopIndex].classList.remove('active');
                    heroLoopIndex = (heroLoopIndex + 1) % heroLoopText.length;
                    heroLoopText[heroLoopIndex].classList.add('active');
                }, 2800);
            }

                function normalizeMpesaPhone(input) {
                    let normalized = input.trim().replace(/[^0-9+]/g, '');
                    if (normalized.startsWith('+')) {
                        normalized = normalized.slice(1);
                    }
                    if (normalized.startsWith('0')) {
                        normalized = '254' + normalized.slice(1);
                    }
                    if (normalized.startsWith('7')) {
                        normalized = '254' + normalized;
                    }
                    return normalized;
                }

                document.getElementById('mpesa-send-btn').addEventListener('click', function() {
                const sendButton = this;
                const id = sendButton.getAttribute('data-id');
                const rawPhone = document.getElementById('mpesa-phone').value;
                const phone = normalizeMpesaPhone(rawPhone);
                const amount = document.getElementById('mpesa-amount').value;
                const feedback = document.getElementById('mpesa-feedback');
                if (!phone.match(/^2547[0-9]{8}$/)) {
                    feedback.textContent = 'Enter a valid Kenyan number in 2547XXXXXXXX format.';
                    return;
                }
                sendButton.disabled = true;
                sendButton.textContent = 'Sending...';
                feedback.textContent = '';
                openProcessingModal('Sending payment request... Please check your phone for an M-Pesa prompt.');

                fetch('/mpesa/pay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ phone: phone, amount: amount, product_id: id })
                }).then(res => res.json()).then(data => {
                    if (data.success) {
                        setProcessingStatus('STK Push sent successfully.', false, false);
                        feedback.textContent = 'STK Push requested. Please check your phone.';
                    } else {
                        setProcessingStatus('Transaction failed: ' + (data.message || 'Unable to send STK Push'), true, true);
                        sendButton.disabled = false;
                        sendButton.textContent = 'Send STK Push';
                    }
                }).catch(() => {
                    setProcessingStatus('Network error. Please try again.', true, true);
                    sendButton.disabled = false;
                    sendButton.textContent = 'Send STK Push';
                });
            });

            // Payment chooser wiring
            const chooserMpesaBtn = document.getElementById('chooser-mpesa-btn');
            const chooserWhatsappBtn = document.getElementById('chooser-whatsapp-btn');
            const chooserCardBtn = document.getElementById('chooser-card-btn');
            const chooserFeedback = document.getElementById('chooser-feedback');

            function getChooserMeta() {
                const chooser = document.getElementById('payment-chooser-modal');
                if(!chooser) return null; return { id: chooser.getAttribute('data-id'), price: chooser.getAttribute('data-price') };
            }

            if (chooserMpesaBtn) chooserMpesaBtn.addEventListener('click', function() {
                const meta = getChooserMeta(); if(!meta) return; closePaymentChooser(); openMpesaModal(meta.id, meta.price);
            });

            if (chooserWhatsappBtn) chooserWhatsappBtn.addEventListener('click', function() {
                const meta = getChooserMeta(); if(!meta) return; const msg = `Hello Baraka Solar Shop, I want to order product id ${meta.id} totaling Ksh ${Number(meta.price).toLocaleString()}. Please advise.`; window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank'); chooserFeedback.textContent = 'Opened WhatsApp.'; setTimeout(() => chooserFeedback.textContent = '', 2000);
            });

            if (chooserCardBtn) chooserCardBtn.addEventListener('click', function() {
                chooserFeedback.textContent = 'Card payments are not configured in this demo.'; setTimeout(() => chooserFeedback.textContent = '', 2500);
            });

            // Close chooser when clicking overlay
            document.getElementById('payment-chooser-modal').addEventListener('click', function() { closePaymentChooser(); });

            function openProcessingModal(message) {
                const modal = document.getElementById('payment-processing-modal');
                const title = document.getElementById('processing-title');
                const messageEl = document.getElementById('processing-message');
                const retryBtn = document.getElementById('processing-retry-btn');
                if (!modal || !title || !messageEl || !retryBtn) return;
                title.textContent = 'Sending payment request';
                messageEl.textContent = message;
                messageEl.style.color = 'rgba(245,233,255,0.82)';
                retryBtn.style.display = 'none';
                modal.style.display = 'flex';
            }

            function closeProcessingModal() {
                const modal = document.getElementById('payment-processing-modal');
                if (modal) modal.style.display = 'none';
            }

            function setProcessingStatus(message, isError = false, retry = false) {
                const title = document.getElementById('processing-title');
                const messageEl = document.getElementById('processing-message');
                const retryBtn = document.getElementById('processing-retry-btn');
                if (!title || !messageEl || !retryBtn) return;
                title.textContent = isError ? 'Payment failed' : 'Payment request sent';
                messageEl.textContent = message;
                messageEl.style.color = isError ? '#ff9aa2' : '#7de2a5';
                retryBtn.style.display = retry ? 'inline-flex' : 'none';
            }

            const processingRetryBtn = document.getElementById('processing-retry-btn');
            if (processingRetryBtn) {
                processingRetryBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeProcessingModal();
                });
            }
        });
    </script>
</body>
</html>
