const productId = Number(new URLSearchParams(window.location.search).get('id'));
const productDetail = document.getElementById('product-detail');
const formatRupees = amount => `₹${amount.toLocaleString('en-IN')}`;

function renderProduct(product) {
  const description = `${product.name} in ${product.colour}. Designed as an effortless everyday piece, with considered details and a comfortable, lasting finish.`;
  document.title = `${product.name} | Nexora`;
  productDetail.innerHTML = `<section class="product-view"><div class="product-view-image"><img src="${product.image_url}" alt="${product.alt_text}" /></div><div class="product-view-copy"><p class="eyebrow">${product.category} / ${product.badge || 'Nexora essentials'}</p><h1>${product.name}</h1><strong class="product-price">${formatRupees(product.price)}</strong><p class="product-description">${description}</p><div class="product-meta"><div><span>Colour</span><strong>${product.colour}</strong></div><div><span>Availability</span><strong>In stock</strong></div><div><span>Shipping</span><strong>Complimentary over ₹2,000</strong></div></div><button class="button button-dark detail-add" data-name="${product.name}">Add to bag <span>+</span></button><p class="detail-message" aria-live="polite"></p></div></section>`;
  productDetail.querySelector('.detail-add').addEventListener('click', event => {
    const button = event.currentTarget;
    button.textContent = 'Added to bag';
    button.disabled = true;
    productDetail.querySelector('.detail-message').textContent = `${button.dataset.name} has been added to your bag.`;
  });
}

async function loadProduct() {
  try {
    if (!Number.isInteger(productId) || productId < 1) throw new Error('Invalid product.');
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Unable to load product.');
    const product = (await response.json()).find(item => item.id === productId);
    if (!product) throw new Error('Product not found.');
    renderProduct(product);
  } catch {
    productDetail.innerHTML = '<p class="product-error">This product could not be found. <a href="/#shop">Return to the collection.</a></p>';
  }
}

loadProduct();
