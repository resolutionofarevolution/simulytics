// SESSION
let session_id = localStorage.getItem("session_id");
if (!session_id) {
    session_id = "S_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("session_id", session_id);
}

// UTM
const urlParams = new URLSearchParams(window.location.search);
const utm_source = urlParams.get('utm_source') || "direct";
const utm_campaign = urlParams.get('utm_campaign') || "none";

localStorage.setItem("utm_source", utm_source);
localStorage.setItem("utm_campaign", utm_campaign);

// TRACK
function trackEvent(event_type, product="") {
    fetch('/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id,
            utm_source,
            utm_campaign,
            event_type,
            product
        })
    });
}

trackEvent("page_view");

// FILTER
function filterProducts(e, category) {
    trackEvent("filter_click", category);

    const cards = document.querySelectorAll('.card');
    const buttons = document.querySelectorAll('.filters button');

    buttons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    cards.forEach(card => {
        if (category === 'all' || card.classList.contains(category)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// CART WITH QUANTITY
let cart = [];

function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }

    trackEvent("add_to_cart", name);
    updateCartUI();
}

function updateCartUI() {
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cartTotal");

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.qty;
        count += item.qty;

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <div class="cart-left">
                <span class="item-name">${item.name}</span>
                <span class="item-price">₹${item.price}</span>
            </div>
            <div class="cart-right">
                <button onclick="changeQty('${item.name}', -1)">−</button>
                <span class="qty">${item.qty}</span>
                <button onclick="changeQty('${item.name}', 1)">+</button>
            </div>
        `;

        cartItems.appendChild(div);
    });

    cartCount.innerText = count;
    cartTotal.innerText = total;
}

function changeQty(name, change) {
    const item = cart.find(i => i.name === name);
    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
        cart = cart.filter(i => i.name !== name);
    }

    updateCartUI();
}

// DRAWER
function toggleCart() {
    trackEvent("cart_open");
    document.getElementById("cartDrawer").classList.toggle("open");
}

// CHECKOUT
function checkout() {
    trackEvent("checkout");
    alert("Checkout successful!");
}