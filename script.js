const productsPerPage = 24;
const totalPages = Math.ceil(461 / productsPerPage);
let currentPage = 1;
const productContainer = document.getElementById('product-container');
const cartItems = document.getElementById('cart-items');
const totalAmount = document.getElementById('totalAmount');

function toggleText(element, originalText, newText) {
  element.textContent = element.textContent === originalText ? newText : originalText;
}

function renderProductCard(product) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.style = 'position: relative';

  const productImage = product.images[0] ? product.images[0].src : './assets/no-image.jpg';
  let title = product.title;

  if (window.innerWidth > 767) {
    if (title.length > 11) {
      title = title.slice(0, 11) + '...';
    } else {
      title = product.title;
    }
  }

  card.innerHTML = `
        <a href="#" onclick="document.querySelectorAll('.disclosure').forEach((element) => element.classList.add('hidden')); this.nextElementSibling.classList.toggle('hidden')">
          <img style="aspect-ratio: 1; width: 100%;" src="${productImage}" alt="${product.title}" class="mb-3 rounded">
        </a>
        <div class="disclosure fixed w-full md:w-96 z-50 top-1/2 left-1/2 bg-black text-white text-md p-3 rounded hidden" style="transform: translate(-50%, -50%)">
        <button class="mb-3 w-full flex justify-end"><img class="cursor-pointer" src="./assets/close.svg" onclick="document.querySelectorAll('.disclosure').forEach((element) => element.classList.add('hidden'))" alt="close" /></button>
        <div class="flex justify-center mb-5">
          ${
            product.images && product.images.length
              ? product.images
                  .map((image) => {
                    return `<img style="aspect-ratio: 1" src="${image.src}" alt="${product.title}" class="mb-3 mx-4 w-32 h-32 rounded">`;
                  })
                  .join('')
              : `<img style="aspect-ratio: 1" src="./assets/no-image.jpg" alt="${product.title}" class="mb-3 mx-4 w-32 h-32 rounded">`
          }
        </div>
          <p class="mb-3">${product.title}</p>
          ${product.vendor ? `<p class="mb-3">Vendor: ${product.vendor}</p>` : ''}
          ${product.product_type ? `<p class="mb-3">Type: ${product.product_type}</p>` : ''}
          ${product.tags && product.tags.length ? `<p class="mb-3">Tags: ${product.tags.join(', ')}</p>` : ''}
          ${product.sku ? `<p class="mb-3">SKU: ${product.sku}</p>` : ''}
          ${product.status ? `<p class="mb-3">Status: ${product.status}</p>` : ''}
          ${product.handle ? `<p class="mb-3">Handle: ${product.handle}</p>` : ''}
          ${product.body_html ? `<p class="mb-3">Description: ${product.body_html}</p>` : ''}
          <p class="text-sm">Price: ${product.variants[0].price} KR.</p>
          <button class="add-to-cart-btn bg-white hover:bg-gray-700 text-black text-sm font-bold p-2 w-full mt-3 mb-6 rounded" onclick="cart.addToCart({ id: ${
            product.id
          }, image: '${productImage}', title: '${product.title}', price: ${product.variants[0].price}, quantity: 1 })">ADD TO CART</button>
        </div>
        <button style="position: absolute; top: 12px; left: 12px" class="bg-black text-white text-xs fw-400 py-2 px-2 rounded">USED</button>
        <div class="flex place-content-between mb-3">
          <div class="w-1/2">
            <p class="text-sm" onclick="toggleText(this, '${title}', '${product.title}')">${title}</p>
            <p class="text-sm">${product.variants[0].price} KR.</p>
          </div>
          <div class="text-right">
            <p class="text-sm fw-500">Condition</p>
            <p class="text-sm fw-400">Slightly used</p>
          </div>
        </div>
        <button class="add-to-cart-btn bg-black hover:bg-gray-700 text-white text-sm w-full font-bold py-4 mb-6 rounded" onclick="cart.addToCart({ id: ${
          product.id
        }, image: '${productImage}', title: '${product.title}', price: ${product.variants[0].price}, quantity: 1 })">
            ADD TO CART
        </button>
    `;

  productContainer.appendChild(card);
}

function fetchProducts(page) {
  productContainer.innerHTML = '';
  const apiUrl = `https://voodoo-sandbox.myshopify.com/products.json?limit=${productsPerPage}&page=${page}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      data.products.forEach((product) => {
        renderProductCard(product);
      });
    })
    .catch((error) => {
      console.error('Error fetching products:', error);
    });
}

fetchProducts(currentPage);

class Cart {
  constructor() {
    this.cartContainer = cartItems;
    this.products = [];
  }

  addToCart(product) {
    this.products.push(product);
    this.renderCart();
    localStorage.setItem('cart', JSON.stringify(this.products));
  }

  renderCart() {
    this.cartContainer.innerHTML = this.products.map((product) => this.renderCartItem(product)).join('');
    this.calculateTotal();
  }

  renderCartItem(product) {
    return `
      <div class="cart-item flex items-start place-content-between mt-10">
        <div class="flex">
          <img style="aspect-ratio: 1" src="${product.image}" alt="${product.title}" class="w-16 h-16 mr-4 rounded">
          <div class="flex flex-col place-content-between">
            <p class="text-sm">${product.title}</p>
            <p class="text-sm">${product.price * product.quantity} KR.</p>
            <div class="flex text-sm">
              <button class="quantity-btn w-5 h-5" onclick="cart.changeQuantity(${product.id}, ${product.quantity > 1 ? -1 : 0})">-</button>
              <span class="quantity w-5 h-5 text-center">${product.quantity}</span>
              <button class="quantity-btn w-5 h-5" onclick="cart.changeQuantity(${product.id}, 1)">+</button>
            </div>
          </div>
        </div>
        <button onclick="cart.removeFromCart(${product.id})"><img src="./assets/delete.svg" alt="delete"></button>
      </div>
    `;
  }

  removeFromCart(productId) {
    this.products = this.products.filter((product) => product.id !== productId);
    this.renderCart();
    localStorage.setItem('cart', JSON.stringify(this.products));
  }

  changeQuantity(productId, newQuantity) {
    const product = this.products.find((product) => product.id === productId);
    if (product) {
      product.quantity += newQuantity;
      this.renderCart();
      localStorage.setItem('cart', JSON.stringify(this.products));
    }
  }

  calculateTotal() {
    totalAmount.textContent = this.products.reduce((total, product) => total + product.price * product.quantity, 0) + ' KR.';
  }
}

const cart = new Cart();

const paginationContainer = document.getElementById('pagination');

function renderPagination(totalPages, currentPage) {
  paginationContainer.innerHTML = '';

  const MAX_PAGES = 5;
  const MIN_PAGES = 2;
  const MAX_DOTS = 3;

  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > MAX_PAGES) {
    if (currentPage <= MIN_PAGES) {
      endPage = MAX_PAGES;
    } else if (currentPage >= totalPages - MIN_PAGES + 1) {
      startPage = totalPages - MAX_PAGES + 1;
    } else {
      startPage = currentPage - Math.floor(MAX_PAGES / 2);
      endPage = startPage + MAX_PAGES - 1;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageNumber = document.createElement('div');
    pageNumber.textContent = i;
    pageNumber.classList.add('page-number');

    if (i === currentPage) {
      pageNumber.classList.add('active');
    }

    pageNumber.addEventListener('click', function () {
      currentPage = i;
      fetchProducts(i);
      renderPagination(totalPages, currentPage);
    });

    paginationContainer.appendChild(pageNumber);
  }
  if (endPage < totalPages - 1) {
    const dots = document.createElement('div');
    dots.style = 'width: 39px; height: 39px; border: 1px solid #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 5px';
    dots.textContent = '...';
    paginationContainer.appendChild(dots);
  }

  if (endPage < totalPages) {
    const lastPage = document.createElement('div');
    lastPage.textContent = totalPages;
    lastPage.classList.add('page-number');
    lastPage.addEventListener('click', function () {
      currentPage = totalPages;
      fetchProducts(totalPages);
      renderPagination(totalPages, currentPage);
    });
    paginationContainer.appendChild(lastPage);
  }
}

renderPagination(totalPages, currentPage);

const storedCart = localStorage.getItem('cart');
if (storedCart) {
  cart.products = JSON.parse(storedCart);
}
