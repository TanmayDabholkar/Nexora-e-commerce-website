const searchToggle = document.querySelector('.search-toggle');
const searchPanel = document.querySelector('.search-panel');
const searchInput = document.querySelector('#search-input');
const closeSearch = document.querySelector('.close-search');
const filters = document.querySelectorAll('.filter');
const noResults = document.querySelector('.no-results');
const cartDrawer = document.querySelector('.cart-drawer');
const cartButton = document.querySelector('.cart-button');
const closeCart = document.querySelector('.close-cart');
const overlay = document.querySelector('.overlay');
const cartItems = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const drawerCount = document.querySelector('#drawer-count');
const cartTotal = document.querySelector('#cart-total');
let selectedFilter = 'all';
let products = [];
let cart = [];
const formatRupees = amount => `₹${amount.toLocaleString('en-IN')}`;

function filterProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;
  products.forEach(product => {
    const show = (selectedFilter === 'all' || product.dataset.category === selectedFilter) && (product.dataset.name.toLowerCase().includes(query) || product.dataset.category.includes(query));
    product.hidden = !show;
    if (show) visible++;
  });
  noResults.hidden = visible !== 0;
}

function productCard(product) {
  const badge = product.badge ? `<span class="tag ${product.badge === 'Limited' ? 'soft' : ''}">${product.badge}</span>` : '';
  return `<article class="product-card" data-category="${product.category}" data-name="${product.name}">
    <div class="product-image">${badge}<button class="heart" aria-label="Save ${product.name}">♡</button><a class="product-link" href="product.html?id=${product.id}" aria-label="View ${product.name}"><img src="${product.image_url}" alt="${product.alt_text}" /></a></div>
    <a class="product-details" href="product.html?id=${product.id}"><div><h3>${product.name}</h3><p>${product.colour}</p></div><strong>${formatRupees(product.price)}</strong></a>
    <button class="add-button" data-product="${product.name}" data-price="${product.price}">Add to bag <span>+</span></button>
  </article>`;
}

async function loadProducts() {
  const productGrid = document.querySelector('.product-grid');
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Unable to load products.');
    productGrid.innerHTML = (await response.json()).map(productCard).join('');
    products = document.querySelectorAll('.product-card');
    filterProducts();
  } catch {
    productGrid.innerHTML = '<p class="loading-products">Could not load products. Please start the Nexora server and refresh.</p>';
  }
}

function updateCart() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartCount.textContent = cart.length; drawerCount.textContent = cart.length; cartTotal.textContent = formatRupees(total);
  cartItems.innerHTML = cart.length ? cart.map((item, index) => `<div class="cart-item"><div><p>${item.name}</p><button class="remove-item" data-index="${index}">Remove</button></div><strong>${formatRupees(item.price)}</strong></div>`).join('') : '<p class="empty-cart">Your bag is waiting for something special.</p>';
  document.querySelectorAll('.remove-item').forEach(button => button.addEventListener('click', () => { cart.splice(button.dataset.index, 1); updateCart(); }));
}
function openCart() { cartDrawer.classList.add('open'); overlay.classList.add('visible'); document.body.classList.add('drawer-open'); cartDrawer.setAttribute('aria-hidden', 'false'); }
function hideCart() { cartDrawer.classList.remove('open'); overlay.classList.remove('visible'); document.body.classList.remove('drawer-open'); cartDrawer.setAttribute('aria-hidden', 'true'); }

searchToggle.addEventListener('click', () => { searchPanel.classList.add('open'); searchInput.focus(); });
closeSearch.addEventListener('click', () => searchPanel.classList.remove('open'));
searchInput.addEventListener('input', filterProducts);
filters.forEach(filter => filter.addEventListener('click', () => { filters.forEach(item => item.classList.remove('active')); filter.classList.add('active'); selectedFilter = filter.dataset.filter; filterProducts(); }));
document.querySelector('.product-grid').addEventListener('click', event => {
  const addButton = event.target.closest('.add-button');
  if (addButton) { cart.push({ name: addButton.dataset.product, price: Number(addButton.dataset.price) }); updateCart(); openCart(); }
  const heart = event.target.closest('.heart');
  if (heart) { heart.classList.toggle('liked'); heart.textContent = heart.classList.contains('liked') ? '♥' : '♡'; }
});
cartButton.addEventListener('click', openCart); closeCart.addEventListener('click', hideCart); overlay.addEventListener('click', hideCart);
document.addEventListener('keydown', event => { if (event.key === 'Escape') { searchPanel.classList.remove('open'); hideCart(); } });
loadProducts();
