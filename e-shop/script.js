/* ===== Mock product data ===== */
const PRODUCTS = [];
const CATEGORIES = ['Electronics', 'Home', 'Beauty', 'Toys', 'Books', 'Garden'];
function seed() {
    for (let i = 1; i <= 36; i++) {
        const cat = CATEGORIES[i % CATEGORIES.length];
        PRODUCTS.push({
            id: 'p' + i,
            title: `${cat} Product ${i}`,
            brand: ['Acme', 'Novus', 'Glow', 'HomePro'][i % 4],
            price: +((Math.random() * 300 + 8).toFixed(2)),
            rating: +((Math.random() * 2 + 3).toFixed(1)),
            category: cat,
            images: [
                `https://picsum.photos/seed/${i}a/640/480`,
                `https://picsum.photos/seed/${i}b/640/480`,
                `https://picsum.photos/seed/${i}c/640/480`
            ],
            description: `This is a premium ${cat} product, designed for excellence and durability. Experience the best quality with our curated selection.`
        })
    }
}
seed();


/* ===== App state ===== */
let state = {
    query: '', category: null, sort: 'relevance', maxPrice: 1000, page: 1, perPage: 12
};


/* ===== Utilities ===== */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));


/* ===== Elements ===== */
const productGrid = $('#productGrid');
const searchInput = $('#searchInput');
const searchBtn = $('#searchBtn');
const categoryChips = $('#categoryChips');
const sortSelect = $('#sortSelect');
const maxPrice = $('#maxPrice');
const maxPriceVal = $('#maxPriceVal');
const resultsInfo = $('#resultsInfo');
const prevPage = $('#prevPage');
const nextPage = $('#nextPage');
const pageInfo = $('#pageInfo');


const cartBtn = $('#cartBtn');
const cartDrawer = $('#cartDrawer');
const cartItems = $('#cartItems');
const cartCount = $('#cartCount');
const cartTotal = $('#cartTotal');
const checkoutBtn = $('#checkoutBtn');
const closeCart = $('#closeCart');


const overlay = $('#overlay');
const productModal = $('#productModal');
const modalTitle = $('#modalTitle');
const modalDesc = $('#modalDesc');
const modalPrice = $('#modalPrice');
const modalBrand = $('#modalBrand');
const modalImageArea = $('#modalImageArea');
const modalThumbs = $('#modalThumbs');
const modalAdd = $('#modalAdd');
const modalClose = $('#modalClose');


/* ===== Cart (localStorage) ===== */
let CART = JSON.parse(localStorage.getItem('eshop_cart') || '{}');
function saveCart() { localStorage.setItem('eshop_cart', JSON.stringify(CART)); updateCartUI(); }
function cartCountTotal() {
    const count = Object.values(CART).reduce((s, i) => s + i.qty, 0);
    const total = Object.values(CART).reduce((s, i) => s + i.qty * i.price, 0);
    return { count, total };
}

/* ===== Render ===== */
function render() {
    // Filter
    let filtered = PRODUCTS.filter(p => {
        if (state.category && p.category !== state.category) return false;
        if (p.price > state.maxPrice) return false;
        if (state.query && !p.title.toLowerCase().includes(state.query.toLowerCase())) return false;
        return true;
    });

    // Sort
    if (state.sort === 'low') filtered.sort((a, b) => a.price - b.price);
    if (state.sort === 'high') filtered.sort((a, b) => b.price - a.price);
    if (state.sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    // Pagination
    const total = filtered.length;
    const start = (state.page - 1) * state.perPage;
    const end = start + state.perPage;
    const pageItems = filtered.slice(start, end);

    // UI
    resultsInfo.textContent = `Showing ${pageItems.length} of ${total} results`;
    pageInfo.textContent = state.page;

    productGrid.innerHTML = pageItems.map(p => `
    <div class="product-card" onclick="openModal('${p.id}')">
      <img src="${p.images[0]}" class="product-img" loading="lazy" alt="${p.title}">
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-title">${p.title}</div>
        <div class="product-price">$${p.price.toFixed(2)}</div>
        <div class="product-rating">★ ${p.rating}</div>
      </div>
    </div>
  `).join('');

    // Chips
    categoryChips.innerHTML = CATEGORIES.map(c => `
    <div class="chip ${state.category === c ? 'active' : ''}" onclick="setCategory('${c}')">${c}</div>
  `).join('') + `<div class="chip ${!state.category ? 'active' : ''}" onclick="setCategory(null)">All</div>`;
}

/* ===== Actions ===== */
function setCategory(c) { state.category = c; state.page = 1; render(); }
function setSort(s) { state.sort = s; render(); }
function setPrice(p) { state.maxPrice = p; maxPriceVal.textContent = p; render(); }
function setPage(d) {
    if (d === 1 && state.page * state.perPage < PRODUCTS.length) state.page++;
    if (d === -1 && state.page > 1) state.page--;
    render();
}

/* ===== Modal ===== */
function openModal(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    modalTitle.textContent = p.title;
    modalBrand.textContent = p.brand;
    modalPrice.textContent = '$' + p.price.toFixed(2);
    modalDesc.textContent = p.description;

    modalImageArea.innerHTML = `<img src="${p.images[0]}" />`;
    modalThumbs.innerHTML = p.images.map(img => `
    <img src="${img}" style="width:60px;height:60px;border-radius:8px;cursor:pointer;object-fit:cover" onclick="this.parentElement.previousElementSibling.innerHTML='<img src=\\'${img}\\' />'">
  `).join('');

    modalAdd.onclick = () => addToCart(p);

    overlay.classList.add('open');
}

function addToCart(p) {
    if (CART[p.id]) CART[p.id].qty++;
    else CART[p.id] = { ...p, qty: 1 };
    saveCart();
    overlay.classList.remove('open');
}

function updateCartUI() {
    const { count, total } = cartCountTotal();
    cartCount.textContent = count;
    cartTotal.textContent = '$' + total.toFixed(2);

    cartItems.innerHTML = Object.values(CART).map(item => `
    <div class="cart-item">
      <img src="${item.images[0]}" />
      <div>
        <div style="font-weight:600">${item.title}</div>
        <div>$${item.price} x ${item.qty}</div>
        <button onclick="removeFromCart('${item.id}')" style="color:red;background:none;border:none;cursor:pointer;padding:0;font-size:12px;margin-top:4px">Remove</button>
      </div>
    </div>
  `).join('');
}

function removeFromCart(id) {
    delete CART[id];
    saveCart();
}

/* ===== Events ===== */
searchInput.oninput = e => { state.query = e.target.value; state.page = 1; render(); }
sortSelect.onchange = e => setSort(e.target.value);
maxPrice.oninput = e => setPrice(e.target.value);
prevPage.onclick = () => setPage(-1);
nextPage.onclick = () => setPage(1);

cartBtn.onclick = () => cartDrawer.classList.add('open');
closeCart.onclick = () => cartDrawer.classList.remove('open');
modalClose.onclick = () => overlay.classList.remove('open');
overlay.onclick = e => { if (e.target === overlay) overlay.classList.remove('open'); }

/* ===== Init ===== */
render();
updateCartUI();