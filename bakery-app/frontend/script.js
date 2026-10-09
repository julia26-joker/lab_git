const API_URL = "/api/products";

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let profile = JSON.parse(localStorage.getItem("profile") || '{"name":"","email":""}');
let orders = JSON.parse(localStorage.getItem("orders") || "[]");
let allProducts = [];

// === Загрузка товаров ===
async function loadProducts() {
    const container = document.getElementById("product-list");
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        allProducts = data.products;
        renderProducts(allProducts);
    } catch (err) {
        container.innerHTML = '<p class="loading">Ошибка загрузки товаров</p>';
        console.error(err);
    }
}

function renderProducts(products) {
    const container = document.getElementById("product-list");
    container.innerHTML = "";
    products.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-image">${p.image}</div>
            <div class="product-category">${p.category}</div>
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <div class="product-price">${p.price} ₽</div>
            <button class="add-btn" onclick="addToCart(${p.id})">Добавить</button>
        `;
        container.appendChild(card);
    });
}

// === Корзина ===
function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveCart();
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("cart-count").textContent = count;
}

function renderCart() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty">Корзина пуста</p>';
        totalEl.textContent = "0 ₽";
        updateCartBadge();
        return;
    }
    container.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.image} ${item.name} × ${item.qty}</div>
                <div class="cart-item-price">${item.price * item.qty} ₽</div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
        `;
        container.appendChild(div);
    });
    totalEl.textContent = total + " ₽";
    updateCartBadge();
}

// === Оформление заказа ===
document.getElementById("checkout-btn").addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Корзина пуста");
        return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const order = {
        date: new Date().toLocaleString("ru-RU"),
        items: [...cart],
        sum: total
    };
    orders.unshift(order);
    localStorage.setItem("orders", JSON.stringify(orders));
    alert(`Спасибо за заказ! Сумма: ${total} ₽`);
    cart = [];
    saveCart();
    renderCart();
    renderOrders();
});

// === Профиль ===
function loadProfile() {
    document.getElementById("user-name").value = profile.name || "";
    document.getElementById("user-email").value = profile.email || "";
}

document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    profile.name = document.getElementById("user-name").value;
    profile.email = document.getElementById("user-email").value;
    localStorage.setItem("profile", JSON.stringify(profile));
    alert("Профиль сохранён!");
});

// === История заказов ===
function renderOrders() {
    const container = document.getElementById("order-history");
    if (orders.length === 0) {
        container.innerHTML = '<p class="empty">Заказов пока нет</p>';
        return;
    }
    container.innerHTML = "";
    orders.forEach(o => {
        const div = document.createElement("div");
        div.className = "order-item";
        div.innerHTML = `
            <div class="order-date">${o.date}</div>
            <div>${o.items.map(i => `${i.image} ${i.name} × ${i.qty}`).join(", ")}</div>
            <div class="order-sum">Итого: ${o.sum} ₽</div>
        `;
        container.appendChild(div);
    });
}

// === Переключение вкладок ===
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("tab-" + tab).classList.add("active");
    });
});

// === Инициализация ===
loadProducts();
renderCart();
loadProfile();
renderOrders();
