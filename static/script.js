let cart = [];

function filterProducts(e, category) {
    const cards = document.querySelectorAll('.card');

    document.querySelectorAll('.filters button')
        .forEach(b => b.classList.remove('active'));

    e.target.classList.add('active');

    cards.forEach(card => {
        card.style.display =
            category === 'all' || card.classList.contains(category)
            ? 'block' : 'none';
    });
}

function addToCart(name, price) {
    const item = cart.find(i => i.name === name);

    if (item) item.qty++;
    else cart.push({ name, price, qty: 1 });

    updateCart();
}

function updateCart() {
    const itemsDiv = document.getElementById("cartItems");
    const count = document.getElementById("cart-count");
    const totalDiv = document.getElementById("cartTotal");

    itemsDiv.innerHTML = "";

    if (cart.length === 0) {
        itemsDiv.innerHTML = "<p style='text-align:center;'>Your cart is empty</p>";
    }

    let total = 0;
    let c = 0;

    cart.forEach(item => {
        total += item.price * item.qty;
        c += item.qty;

        itemsDiv.innerHTML += `
        <div class="cart-item">
            <div>
                <strong>${item.name}</strong><br>
                ₹${item.price}
            </div>
            <div>
                <button onclick="changeQty('${item.name}', -1)">−</button>
                <span>${item.qty}</span>
                <button onclick="changeQty('${item.name}', 1)">+</button>
            </div>
        </div>`;
    });

    count.innerText = c;
    totalDiv.innerText = total;
}

function changeQty(name, change) {
    const item = cart.find(i => i.name === name);
    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
        cart = cart.filter(i => i.name !== name);
    }

    updateCart();
}

function toggleCart() {
    document.getElementById("cartDrawer").classList.toggle("open");
    document.getElementById("overlay").classList.toggle("show");
}

function checkout() {
    alert("Checkout complete");
}