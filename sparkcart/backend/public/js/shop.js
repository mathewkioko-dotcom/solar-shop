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

window.addEventListener('load', function() {
    hidePageLoader();
    bindLoaderLinks();
});
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        hidePageLoader();
    }
});

function bindLoaderLinks(scope = document) {
    scope.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
        if (link.target === '_blank' || link.hasAttribute('download')) return;
        if (href.startsWith('/')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                navigateWithLoader(link.href);
            });
        }
    });

    scope.querySelectorAll('[data-nav-url]').forEach(navItem => {
        navItem.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.getAttribute('data-nav-url');
            if (url) navigateWithLoader(url);
        });
    });
}

window.bindShopLoader = bindLoaderLinks;

function getCsrfToken() {
    const el = document.querySelector('meta[name="csrf-token"]');
    return el ? el.getAttribute('content') : '';
}

async function postForm(url, body = {}) {
    const token = getCsrfToken();
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token,
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    });
    return res.json();
}

function updateCartBadge(count) {
    const badge = document.getElementById('badge-count-val');
    if (badge) badge.textContent = typeof count === 'number' ? count : badge.textContent;
}

function renderDrawerItems(cartItems) {
    const list = document.getElementById('drawer-items-list');
    const total = document.querySelector('.drawer-subtotal') || document.querySelector('.drawer-body .order-total');
    if (!list) return;
    list.innerHTML = '';
    if (!cartItems || Object.keys(cartItems).length === 0) {
        list.innerHTML = '<p class="drawer-empty">No products in the basket yet. Add items from the catalog to continue.</p>';
        return;
    }
    Object.entries(cartItems).forEach(([id, item]) => {
        const row = document.createElement('div');
        row.className = 'drawer-item-row';
        row.innerHTML = `
            <img src="${item.image_path || '/images/logo/images.jpg'}" alt="${item.name}" class="drawer-item-thumb">
            <div class="drawer-item-info">
                <strong>${item.name}</strong>
                <div class="drawer-item-meta">
                    <span>Ksh ${Number(item.price).toFixed(2)}</span>
                    <span id="item-line-total-${id}">${Number(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div class="drawer-item-actions">
                    <button class="item-action-btn" data-action="dec" data-id="${id}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="item-action-btn" data-action="inc" data-id="${id}">+</button>
                    <button class="item-action-btn" data-action="remove" data-id="${id}">Remove</button>
                </div>
            </div>`;
        list.appendChild(row);
    });
}

async function bindProductButtons(scope = document) {
    // Add to cart
    scope.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.removeEventListener('click', addToCartHandler);
        btn.addEventListener('click', addToCartHandler);
    });

    // Buy / Pay (adds to cart then goes to checkout)
    scope.querySelectorAll('.mpesa-pay-btn').forEach(btn => {
        btn.removeEventListener('click', mpesaPayHandler);
        btn.addEventListener('click', mpesaPayHandler);
    });

    // Quick view -> navigate to product page
    scope.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.removeEventListener('click', quickViewHandler);
        btn.addEventListener('click', quickViewHandler);
    });

    // Drawer quantity actions
    const drawer = document.getElementById('drawer-items-list');
    if (drawer) {
        drawer.addEventListener('click', async function(e) {
            const t = e.target.closest('button[data-action]');
            if (!t) return;
            e.stopPropagation();
            const id = t.getAttribute('data-id');
            const action = t.getAttribute('data-action');
            if (action === 'remove') {
                await postForm(`/cart/remove/${id}`);
            } else if (action === 'inc') {
                await postForm(`/cart/update/${id}`, { quantity: 1 });
            } else if (action === 'dec') {
                await postForm(`/cart/update/${id}`, { quantity: -1 });
            }
            // refresh cart badge by fetching a small endpoint or reloading
            window.location.reload();
        });
    }
}

async function addToCartHandler(e) {
    e.stopPropagation();
    const id = this.getAttribute('data-id');
    if (!id) return;
    showPageLoader();
    try {
        const res = await postForm(`/cart/add/${id}`);
        if (res && res.success) {
            updateCartBadge(res.cart_count || 0);
            renderDrawerItems(res.cart_items || {});
        }
    } catch (err) {
        console.error('Add to cart error', err);
    } finally {
        hidePageLoader();
    }
}

async function mpesaPayHandler(e) {
    e.stopPropagation();
    const id = this.getAttribute('data-id');
    if (!id) return;
    showPageLoader();
    try {
        await postForm(`/cart/add/${id}`);
        // navigate to checkout
        navigateWithLoader(`${window.location.origin}/checkout`);
    } catch (err) {
        console.error('Pay now error', err);
        hidePageLoader();
    }
}

function quickViewHandler(e) {
    e.stopPropagation();
    const url = this.getAttribute('data-url') || this.getAttribute('data-url');
    if (url) navigateWithLoader(url);
}

// initialize product button bindings on load
window.addEventListener('load', function() {
    bindProductButtons(document);
});

// Provide an exposed init hook in case parts of the page are re-rendered
window.bindProductButtons = bindProductButtons;
