// Web Audio Synthesizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(frequency = 1000, duration = 0.08, type = 'sine') {
    try {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Audio Context blocked.");
    }
}

// Transaction Cart & Terminal State
let cart = [];
let selectedIndex = -1;
let invoiceNumber = 119;
let activeUser = userDb[0];

// Application Initialization
window.addEventListener('DOMContentLoaded', () => {
    cart.push({ code: "CS73711", description: "RED DHAL BULK", price: 224.00, qty: 2.004, value: 448.90 });
    cart.push({ code: "FF30003", description: "GOLDI SUPREME CHICKEN SAUSAGES", price: 1250.00, qty: 1.000, value: 1250.00 });
    
    updateGrid();
    initClock();
    initCatalog();
    renderInventoryTable();
    renderUserTable();
    renderReports();

    document.getElementById('itemCode').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleScan();
    });
    document.getElementById('quantity').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleScan();
    });
    document.getElementById('pinInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') unlockTerminal();
    });

    document.getElementById('itemCode').focus();
});

// Real-Time Clock Function
function initClock() {
    const timeEl = document.getElementById('meta-time');
    setInterval(() => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const hoursStr = String(hours).padStart(2, '0');
        timeEl.textContent = `${hoursStr}:${minutes}:${seconds} ${ampm}`;
    }, 1000);
}

// Modal Tab Switcher helper
function switchTab(tabId, btnElement) {
    playBeep(800, 0.05);
    const parentModal = btnElement.closest('.modal-body');
    parentModal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    parentModal.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    btnElement.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Item Catalog Listing
function initCatalog() {
    const list = document.getElementById('catalog-list');
    list.innerHTML = '';
    Object.entries(productDb).forEach(([code, item]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="code-col">${code}</td>
            <td>${item.description}</td>
            <td class="num-col">${item.stock.toFixed(3)}</td>
            <td class="num-col">${item.price.toFixed(2)}</td>
        `;
        tr.addEventListener('dblclick', () => {
            document.getElementById('itemCode').value = code;
            document.getElementById('quantity').value = "1.000";
            closeModal('inquiry-modal');
            playBeep(880, 0.05);
            document.getElementById('itemCode').focus();
        });
        list.appendChild(tr);
    });
}

// Inventory Management Module Functions
function renderInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = '';
    Object.entries(productDb).forEach(([code, item]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="code-col">${code}</td>
            <td>${item.description}</td>
            <td class="num-col">${item.stock.toFixed(3)}</td>
            <td class="num-col">${formatCurrency(item.price)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filterInventoryList() {
    const query = document.getElementById('inventorySearchQuery').value.toLowerCase();
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = '';
    
    Object.entries(productDb).forEach(([code, item]) => {
        if (code.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="code-col">${code}</td>
                <td>${item.description}</td>
                <td class="num-col">${item.stock.toFixed(3)}</td>
                <td class="num-col">${formatCurrency(item.price)}</td>
            `;
            tbody.appendChild(tr);
        }
    });
}

function handleAddNewItem(event) {
    event.preventDefault();
    const code = document.getElementById('newCode').value.trim().toUpperCase();
    const desc = document.getElementById('newDesc').value.trim().toUpperCase();
    const price = parseFloat(document.getElementById('newPrice').value);
    const stock = parseFloat(document.getElementById('newStock').value);

    if (!code || !desc || isNaN(price) || isNaN(stock)) {
        playBeep(400, 0.2, 'triangle');
        alert("Please fill in valid item details.");
        return;
    }

    productDb[code] = { description: desc, price: price, stock: stock };
    playBeep(1200, 0.1, 'sine');
    alert(`Product [${code}] added successfully to stock inventory!`);

    document.getElementById('addItemForm').reset();
    renderInventoryTable();
    initCatalog();
    switchTab('inv-list-tab', document.querySelectorAll('#inventory-modal .tab-btn')[0]);
}

// User Management Module Functions
function renderUserTable() {
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = '';
    userDb.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.username}</td>
            <td><strong>${u.role}</strong></td>
            <td class="code-col">••••</td>
            <td><span style="color:var(--accent); font-weight:700;">${u.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function handleAddNewUser(event) {
    event.preventDefault();
    const username = document.getElementById('newUsername').value.trim().toUpperCase();
    const role = document.getElementById('newUserRole').value;
    const pin = document.getElementById('newUserPin').value.trim();

    if (!username || pin.length !== 4) {
        playBeep(400, 0.2, 'triangle');
        alert("Please provide a valid username and 4-digit PIN.");
        return;
    }

    userDb.push({ username, role, pin, status: "Active" });
    playBeep(1200, 0.1, 'sine');
    alert(`User operator ${username} registered successfully!`);

    document.getElementById('addUserForm').reset();
    renderUserTable();
    switchTab('user-list-tab', document.querySelectorAll('#user-mgmt-modal .tab-btn')[0]);
}

// Financial & Sales Reports Dashboard Module
function renderReports() {
    const grossSales = salesLedger.reduce((sum, b) => sum + b.total, 0);
    const totalBills = salesLedger.length;
    const totalQty = salesLedger.reduce((sum, b) => sum + b.totalItems, 0);

    document.getElementById('rpt-total-sales').textContent = `LKR ${formatCurrency(grossSales)}`;
    document.getElementById('rpt-bills-count').textContent = totalBills;
    document.getElementById('rpt-items-sold').textContent = totalQty.toFixed(3);

    const tbody = document.getElementById('sales-history-body');
    tbody.innerHTML = '';
    salesLedger.slice().reverse().forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="code-col">#${inv.id}</td>
            <td>${inv.time}</td>
            <td class="num-col">${inv.lines}</td>
            <td class="num-col">${formatCurrency(inv.total)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function exportReportSummary() {
    playBeep(1000, 0.15);
    alert(`Z-REPORT SUMMARY GENERATED\n-------------------------------\nGross Terminal Sales: LKR ${document.getElementById('rpt-total-sales').textContent}\nTotal Transactions: ${salesLedger.length}\nTerminal Status: BALANCED`);
}

// POS Main Transaction Grid Render
function updateGrid() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    let linesCount = cart.length;
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const tr = document.createElement('tr');
        if (index === selectedIndex) {
            tr.classList.add('selected');
        }
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td class="code-col">${item.code}</td>
            <td>${item.description}</td>
            <td class="num-col">${formatCurrency(item.price)}</td>
            <td class="num-col">${item.qty.toFixed(3)}</td>
            <td class="num-col">${formatCurrency(item.value)}</td>
        `;
        tr.addEventListener('click', () => selectRow(index));
        tbody.appendChild(tr);
        grandTotal += item.value;
    });

    const minRows = 8;
    if (cart.length < minRows) {
        for (let i = cart.length; i < minRows; i++) {
            const tr = document.createElement('tr');
            tr.classList.add('empty-row');
            tr.innerHTML = `<td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td>`;
            tbody.appendChild(tr);
        }
    }

    document.getElementById('lines-count').textContent = linesCount;
    document.getElementById('grand-total').textContent = formatCurrency(grandTotal);
}

function selectRow(index) {
    selectedIndex = index;
    updateGrid();
}

function formatCurrency(val) {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Barcode Scanner Handler
function handleScan() {
    const codeInput = document.getElementById('itemCode');
    const qtyInput = document.getElementById('quantity');
    
    const code = codeInput.value.trim().toUpperCase();
    let qty = parseFloat(qtyInput.value);

    if (!code) {
        playBeep(400, 0.25, 'triangle');
        alert("Please scan or enter a product code.");
        return;
    }

    if (isNaN(qty) || qty <= 0) qty = 1.000;

    let product = productDb[code];
    
    if (!product) {
        product = { description: `GENERIC PRODUCT (${code})`, price: 250.00, stock: 99.000 };
    }

    if (product.stock < qty) {
        playBeep(300, 0.2, 'sawtooth');
        if (!confirm(`Warning: Insufficient stock (${product.stock.toFixed(3)} available). Proceed anyway?`)) {
            return;
        }
    }

    const val = parseFloat((product.price * qty).toFixed(2));
    playBeep(1200, 0.08, 'sine');
    
    const scanner = document.getElementById('scanner-container');
    scanner.classList.add('flash-success');
    setTimeout(() => scanner.classList.remove('flash-success'), 600);

    cart.push({
        code: code,
        description: product.description,
        price: product.price,
        qty: qty,
        value: val
    });

    selectedIndex = cart.length - 1;
    updateGrid();

    codeInput.value = '';
    qtyInput.value = '1.000';
    
    const container = document.querySelector('.grid-container');
    container.scrollTop = container.scrollHeight;
    codeInput.focus();
}

// Void selected row
function deleteSelectedRow() {
    if (selectedIndex >= 0 && selectedIndex < cart.length) {
        playBeep(350, 0.15, 'sawtooth');
        cart.splice(selectedIndex, 1);
        selectedIndex = cart.length - 1;
        updateGrid();
    } else {
        playBeep(400, 0.25, 'triangle');
    }
    document.getElementById('itemCode').focus();
}

// Customer Search
function lookupCustomer() {
    const phone = document.getElementById('custPhone').value.trim();
    const detailsDiv = document.getElementById('custDetails');
    const nameEl = document.getElementById('custName');
    const pointsEl = document.getElementById('custPoints');

    const customer = customerDb[phone];
    if (customer) {
        playBeep(880, 0.08);
        nameEl.textContent = customer.name;
        pointsEl.textContent = customer.points;
        detailsDiv.style.display = 'block';
    } else {
        playBeep(400, 0.25, 'triangle');
        alert("Customer loyalty profile not found.");
        detailsDiv.style.display = 'none';
    }
}

// Cash Drawer Toggle Function
let drawerOpen = false;
function toggleDrawerState() {
    const visual = document.getElementById('drawer-visual');
    const status = document.getElementById('drawer-status');
    const btn = document.getElementById('drawer-action-btn');

    if (!drawerOpen) {
        playBeep(600, 0.1, 'sine');
        setTimeout(() => playBeep(800, 0.12, 'sine'), 50);
        visual.classList.add('open');
        status.textContent = "DRAWER OPENED";
        status.style.color = "var(--accent)";
        btn.textContent = "Close Drawer";
        drawerOpen = true;
    } else {
        playBeep(250, 0.15, 'triangle');
        visual.classList.remove('open');
        status.textContent = "DRAWER LOCKED";
        status.style.color = "var(--danger)";
        btn.textContent = "Open Drawer";
        drawerOpen = false;
    }
}

// Sub Total Summary
function triggerSubTotal() {
    if (cart.length === 0) {
        playBeep(400, 0.25, 'triangle');
        alert("No items in transaction cart.");
        return;
    }
    playBeep(980, 0.12);
    let total = cart.reduce((sum, item) => sum + item.value, 0);
    alert(`Transaction Summary:\n-----------------------------\nTotal Lines: ${cart.length}\nGrand Total: LKR ${formatCurrency(total)}\n\nPress F8 to checkout.`);
}

// Tender / Complete Checkout Sale
function triggerTender() {
    if (cart.length === 0) {
        playBeep(400, 0.25, 'triangle');
        alert("Transaction cart is empty.");
        return;
    }

    let total = cart.reduce((sum, item) => sum + item.value, 0);
    let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    cart.forEach(item => {
        if (productDb[item.code]) {
            productDb[item.code].stock = Math.max(0, productDb[item.code].stock - item.qty);
        }
    });

    salesLedger.push({
        id: invoiceNumber,
        time: new Date().toLocaleTimeString(),
        lines: cart.length,
        totalItems: totalQty,
        total: total
    });

    playBeep(523, 0.1, 'sine');
    setTimeout(() => playBeep(659, 0.1, 'sine'), 80);
    setTimeout(() => playBeep(784, 0.12, 'sine'), 160);
    setTimeout(() => playBeep(1046, 0.25, 'sine'), 240);

    alert(`Checkout Successful!\n-------------------------\nLKR ${formatCurrency(total)} Paid.\n\nReceipt Printed for Invoice #${invoiceNumber}.`);

    invoiceNumber++;
    document.getElementById('invoice-number').textContent = invoiceNumber;

    cart = [];
    selectedIndex = -1;
    updateGrid();
    renderInventoryTable();
    renderReports();

    document.getElementById('itemCode').focus();
}

// Refund Simulation
function triggerRefund() {
    playBeep(600, 0.1);
    let code = prompt("Enter Item Code for refund:");
    if (code) {
        let product = productDb[code.toUpperCase()];
        if (product) {
            let qty = parseFloat(prompt("Enter quantity to return:", "1.000"));
            if (!isNaN(qty) && qty > 0) {
                playBeep(1200, 0.08);
                cart.push({
                    code: code.toUpperCase(),
                    description: `REFUND: ${product.description}`,
                    price: -product.price,
                    qty: qty,
                    value: parseFloat((-product.price * qty).toFixed(2))
                });
                updateGrid();
            }
        } else {
            alert("Product code not found in inventory registry.");
        }
    }
}

function triggerLoyalty() {
    openModal('customer-modal');
}

// Lockscreen & Security PIN Validation
function lockTerminal() {
    playBeep(350, 0.15);
    document.getElementById('lockscreen').classList.add('active');
    document.getElementById('pinInput').value = '';
    document.getElementById('pinInput').focus();
}

function unlockTerminal() {
    const input = document.getElementById('pinInput').value;
    const user = userDb.find(u => u.pin === input);

    if (user) {
        activeUser = user;
        document.getElementById('cashier-name').textContent = `${user.username} (${user.role})`;
        playBeep(980, 0.08);
        setTimeout(() => playBeep(1200, 0.08), 80);
        document.getElementById('lockscreen').classList.remove('active');
        document.getElementById('itemCode').focus();
    } else {
        playBeep(220, 0.3, 'sawtooth');
        alert("Incorrect PIN code.");
        document.getElementById('pinInput').value = '';
        document.getElementById('pinInput').focus();
    }
}

// Modal Dialog Management
function openModal(id) {
    playBeep(700, 0.05);
    const overlay = document.getElementById(id);
    overlay.classList.add('active');
    
    if (id === 'customer-modal') {
        document.getElementById('custPhone').focus();
    } else if (id === 'inventory-modal') {
        renderInventoryTable();
    } else if (id === 'user-mgmt-modal') {
        renderUserTable();
    } else if (id === 'reports-modal') {
        renderReports();
    }
}

function closeModal(id) {
    playBeep(450, 0.05);
    document.getElementById(id).classList.remove('active');
    document.getElementById('itemCode').focus();
}

// Theme Toggle
function toggleTheme() {
    playBeep(800, 0.05);
    const body = document.body;
    const sunIcon = document.getElementById('theme-sun-icon');
    const moonIcon = document.getElementById('theme-moon-icon');

    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        body.classList.add('dark-mode');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

function triggerFunction(action) {
    playBeep(900, 0.06);
    if (action === 'F1_Home') {
        alert("Mathalee POS Main Portal Active.");
    }
}

// Physical Keyboard Event Bindings
window.addEventListener('keydown', (e) => {
    if (document.getElementById('lockscreen').classList.contains('active')) {
        if (e.key === 'Escape') e.preventDefault();
        return;
    }

    let modalOpen = document.querySelector('.modal-overlay.active');

    if (e.key === 'Escape') {
        if (modalOpen) {
            e.preventDefault();
            closeModal(modalOpen.id);
        }
    } else if (e.key === 'Delete') {
        if (document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            deleteSelectedRow();
        }
    } else if (e.key === 'F1') {
        e.preventDefault(); openModal('help-modal');
    } else if (e.key === 'F2') {
        e.preventDefault(); openModal('drawer-modal');
    } else if (e.key === 'F3') {
        e.preventDefault(); openModal('inquiry-modal');
    } else if (e.key === 'F4') {
        e.preventDefault(); openModal('customer-modal');
    } else if (e.key === 'F5') {
        e.preventDefault(); openModal('inventory-modal');
    } else if (e.key === 'F6') {
        e.preventDefault(); openModal('user-mgmt-modal');
    } else if (e.key === 'F7') {
        e.preventDefault(); triggerSubTotal();
    } else if (e.key === 'F8') {
        e.preventDefault(); triggerTender();
    } else if (e.key === 'F9') {
        e.preventDefault(); triggerRefund();
    } else if (e.key === 'F10') {
        e.preventDefault(); openModal('reports-modal');
    } else if (e.key === 'F11') {
        e.preventDefault(); triggerLoyalty();
    } else if (e.key === 'F12') {
        e.preventDefault(); lockTerminal();
    }
});