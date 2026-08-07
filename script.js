import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB82Pj-Qcv05Wvdr941nnfAOwj1TU6FkUU",
  authDomain: "one-14aef.firebaseapp.com",
  projectId: "one-14aef",
  storageBucket: "one-14aef.firebasestorage.app",
  messagingSenderId: "570713727151",
  appId: "1:570713727151:web:0dae8e88a6ecdda3b3b45a",
  measurementId: "G-FBDVL0H7PJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isSignUp = false;
let currentUser = null;
let products = [];

// Auth State Check
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('app-screen').style.display = 'flex';
        document.getElementById('profile-icon-btn').style.display = 'none';
        document.getElementById('logout-icon-btn').style.display = 'block';
        closeAuthModal();
        loadProductsFromCloud();
    } else {
        currentUser = null;
        document.getElementById('lock-screen').style.display = 'flex';
        document.getElementById('app-screen').style.display = 'none';
        document.getElementById('profile-icon-btn').style.display = 'block';
        document.getElementById('logout-icon-btn').style.display = 'none';
    }
});

// Modal Open/Close Controls
window.openAuthModal = function() {
    document.getElementById('auth-modal').classList.add('open');
}

window.closeAuthModal = function() {
    document.getElementById('auth-modal').classList.remove('open');
}

window.toggleAuthMode = function() {
    isSignUp = !isSignUp;
    document.getElementById('auth-title').innerText = isSignUp ? "Naya Account Banayein" : "Account Login";
    document.getElementById('auth-submit-btn').innerText = isSignUp ? "Sign Up" : "Login";
    document.getElementById('toggle-text-info').innerText = isSignUp ? "Pehle se account hai?" : "Account nahi hai?";
    document.getElementById('toggle-action-btn').innerText = isSignUp ? "Login karein" : "Sign Up karein";
}

window.handleAuth = async function() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if(!email || password.length < 6) {
        alert("Kripya valid email aur kam se kam 6 akshar ka password daalein!");
        return;
    }

    try {
        if (isSignUp) {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Account safalpurvak ban gaya!");
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        alert("Error: " + error.message);
    }
}

window.logoutUser = function() {
    signOut(auth);
}

// Product Modal
window.openProductModal = function() {
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-color').value = '';
    document.getElementById('prod-price').value = '';
    document.getElementById('prod-stock').value = '';
    document.getElementById('product-modal').classList.add('open');
}

window.closeProductModal = function() {
    document.getElementById('product-modal').classList.remove('open');
}

// Cloud Database Operations
window.saveProduct = async function() {
    if(!currentUser) return;
    let name = document.getElementById('prod-name').value.trim();
    let size = document.getElementById('prod-size').value;
    let color = document.getElementById('prod-color').value.trim() || 'Standard';
    let price = parseFloat(document.getElementById('prod-price').value);
    let stock = parseInt(document.getElementById('prod-stock').value);

    if(!name || isNaN(price) || isNaN(stock)) {
        alert("Kripya Naam, Price aur Stock sahi se bharein!");
        return;
    }

    try {
        await addDoc(collection(db, "products"), {
            userId: currentUser.uid,
            name: name,
            size: size,
            color: color,
            price: price,
            stock: stock,
            createdAt: Date.now()
        });
        closeProductModal();
    } catch (error) {
        alert("Save karne me error aayi: " + error.message);
    }
}

window.updateStock = async function(docId, currentStock, change) {
    let newStock = currentStock + change;
    if(newStock < 0) newStock = 0;
    try {
        const prodRef = doc(db, "products", docId);
        await updateDoc(prodRef, { stock: newStock });
    } catch (error) {
        alert("Stock update error: " + error.message);
    }
}

function loadProductsFromCloud() {
    const q = query(collection(db, "products"), where("userId", "==", currentUser.uid));
    onSnapshot(q, (snapshot) => {
        products = [];
        snapshot.forEach((docSnap) => {
            products.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderApp();
    });
}

function renderApp() {
    const container = document.getElementById('product-container');
    container.innerHTML = '';

    let totalItems = products.length;
    let totalStockQty = products.reduce((sum, p) => sum + p.stock, 0);

    document.getElementById('total-items').innerText = totalItems;
    document.getElementById('total-stock').innerText = totalStockQty;

    if(products.length === 0) {
        container.innerHTML = `<div class="empty-msg">Abhi aapke account me koi item nahi hai.<br>Neeche diye gaye (+) button se naya product add karein.</div>`;
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
                    <button onclick="updateStock('${p.id}', ${p.stock}, -1)">-</button>
                    <span class="stock-count">${p.stock} pcs</span>
                    <button onclick="updateStock('${p.id}', ${p.stock}, 1)">+</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}
