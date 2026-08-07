let products = JSON.parse(localStorage.getItem('one_clothing_stock')) || [];

function openModal() {
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-color').value = '';
    document.getElementById('prod-price').value = '';
    document.getElementById('prod-stock').value = '';
    document.getElementById('product-modal').classList.add('open');
}

function closeModal() {
    document.getElementById('product-modal').classList.remove('open');
}

function saveProduct() {
    let name = document.getElementById('prod-name').value.trim();
    let size = document.getElementById('prod-size').value;
    let color = document.getElementById('prod-color').value.trim() || 'Standard';
    let price = parseFloat(document.getElementById('prod-price').value);
    let stock = parseInt(document.getElementById('prod-stock').value);

    if(!name || isNaN(price) || isNaN(stock)) {
        alert("Kripya Naam, Price aur Stock sahi se bharein!");
        return;
    }

    let newProduct = {
        id: Date.now(),
        name: name,
        size: size,
        color: color,
        price: price,
        stock: stock
    };

    products.push(newProduct);
    saveAndRender();
    closeModal();
}

function updateStock(id, change) {
    let prod = products.find(p => p.id === id);
    if(prod) {
        prod.stock += change;
        if(prod.stock < 0) prod.stock = 0;
        saveAndRender();
    }
}

function saveAndRender() {
    localStorage.setItem('one_clothing_stock', JSON.stringify(products));
    renderApp();
}

function clearAllData() {
    if(confirm("Kya aap saara data delete karna chahte hain?")) {
        products = [];
        saveAndRender();
    }
}

function renderApp() {
    const container = document.getElementById('product-container');
    container.innerHTML = '';

    let totalItems = products.length;
    let totalStockQty = products.reduce((sum, p) => sum + p.stock, 0);

    document.getElementById('total-items').innerText = totalItems;
    document.getElementById('total-stock').innerText = totalStockQty;

    if(products.length === 0) {
        container.innerHTML = `<div class="empty-msg">Abhi koi clothing item nahi hai.<br>Neeche diye gaye (+) button se naya product add karein.</div>`;
        return;
    }

    products.forEach(p => {
        let card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="prod-details">
                <h4>${p.name}</h4>
                <div class="prod-tags">
                    <span class="tag">Size: ${p.size}</span>
                    <span class="tag">Color: ${p.color}</span>
                </div>
            </div>
            <div class="prod-right">
                <div class="prod-price">₹${p.price}</div>
                <div class="stock-control">
                    <button onclick="updateStock(${p.id}, -1)">-</button>
                    <span class="stock-count">${p.stock} pcs</span>
                    <button onclick="updateStock(${p.id}, 1)">+</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

renderApp();
