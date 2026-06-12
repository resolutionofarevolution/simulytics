let cart = [];

/* =========================
   SESSION MANAGEMENT
========================= */

function getSessionId() {

    let sessionId = localStorage.getItem("session_id");

    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("session_id", sessionId);
    }

    return sessionId;
}

/* =========================
   UTM PARAMETERS
========================= */

function getUTMParameters() {

    const params = new URLSearchParams(window.location.search);

    return {
        utm_source: params.get("utm_source") || "direct",
        utm_campaign: params.get("utm_campaign") || "organic"
    };
}

/* =========================
   EVENT TRACKING
========================= */

function trackEvent(
    eventType,
    product = "",
    customerName = "",
    quantity = 0,
    revenue = 0
) {

    const utm = getUTMParameters();

    fetch("/track", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            session_id: getSessionId(),
            utm_source: utm.utm_source,
            utm_campaign: utm.utm_campaign,
            event_type: eventType,
            product: product,
            customer_name: customerName,
            quantity: quantity,
            revenue: revenue
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Tracked:", eventType);
    })
    .catch(error => {
        console.error("Tracking Error:", error);
    });
}

/* =========================
   PRODUCT FILTER
========================= */

function filterProducts(e, category) {

    const cards = document.querySelectorAll(".card");

    document
        .querySelectorAll(".filters button")
        .forEach(btn => btn.classList.remove("active"));

    e.target.classList.add("active");

    cards.forEach(card => {

        card.style.display =
            category === "all" ||
            card.classList.contains(category)
                ? "block"
                : "none";
    });

    trackEvent("category_filter", category);
}

/* =========================
   ADD TO CART
========================= */

function addToCart(name, price) {

    trackEvent("add_to_cart", name);

    const item = cart.find(i => i.name === name);

    if (item) {
        item.qty++;
    } else {
        cart.push({
            name: name,
            price: price,
            qty: 1
        });
    }

    updateCart();
}

/* =========================
   UPDATE CART
========================= */

function updateCart() {

    const itemsDiv = document.getElementById("cartItems");
    const countDiv = document.getElementById("cart-count");
    const totalDiv = document.getElementById("cartTotal");

    itemsDiv.innerHTML = "";

    if (cart.length === 0) {

        itemsDiv.innerHTML =
            "<p style='text-align:center;'>Your cart is empty</p>";
    }

    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {

        total += item.price * item.qty;
        totalItems += item.qty;

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

            </div>
        `;
    });

    countDiv.innerText = totalItems;
    totalDiv.innerText = total;
}

/* =========================
   CHANGE QUANTITY
========================= */

function changeQty(name, change) {

    const item = cart.find(i => i.name === name);

    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
        cart = cart.filter(i => i.name !== name);
    }

    updateCart();
}

/* =========================
   VIEW CART
========================= */

function toggleCart() {

    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("overlay");

    const isOpening =
        !drawer.classList.contains("open");

    drawer.classList.toggle("open");
    overlay.classList.toggle("show");

    if (isOpening) {
        trackEvent("view_cart");
    }
}

/* =========================
   PURCHASE / CONVERSION
========================= */

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty");
        return;
    }

    const customerName =
        prompt("Enter Your Name");

    if (
        customerName === null ||
        customerName.trim() === ""
    ) {

        alert("Name is required");
        return;
    }

    let totalRevenue = 0;
    let totalQty = 0;

    cart.forEach(item => {

        totalRevenue += item.price * item.qty;
        totalQty += item.qty;
    });

    trackEvent(
        "purchase",
        "Order",
        customerName.trim(),
        totalQty,
        totalRevenue
    );

    alert(
        `Purchase Successful!

Thank You, ${customerName}

Items Purchased: ${totalQty}
Order Value: ₹${totalRevenue}`
    );

    cart = [];

    updateCart();
}

/* =========================
   PAGE VIEW
========================= */

window.onload = function () {

    trackEvent("page_view");

    document
        .querySelectorAll(".card")
        .forEach(card => {

            card.addEventListener(
                "click",
                function (e) {

                    if (
                        e.target.classList.contains("add-btn") ||
                        e.target.tagName === "BUTTON"
                    ) {
                        return;
                    }

                    const productName =
                        card.querySelector("h3").innerText;

                    trackEvent(
                        "product_view",
                        productName
                    );
                }
            );
        });
};
