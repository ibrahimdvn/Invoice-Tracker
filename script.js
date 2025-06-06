document.addEventListener('DOMContentLoaded', () => {
    // Olay dinleyicilerini ayarla
    document.getElementById('invoice-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('search').addEventListener('input', renderTable);

    // Kayıtlı işlemleri yükle
    loadInvoices();
});

/**
 * Form gönderildiğinde çalışır, yeni işlem ekler.
 * @param {Event} e - Formun submit olayı.
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const newInvoice = {
        id: Date.now(),
        date: document.getElementById('date').value,
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value,
    };

    if (!newInvoice.date || !newInvoice.description || isNaN(newInvoice.amount) || newInvoice.amount <= 0) {
        alert("Please fill out all fields with valid data.");
        return;
    }

    const invoices = getInvoicesFromStorage();
    invoices.push(newInvoice);
    saveInvoicesToStorage(invoices);

    renderTable();
    document.getElementById('invoice-form').reset();
}

/**
 * Bir işlemi ID'sine göre siler.
 * @param {number} id - Silinecek işlemin ID'si.
 */
function deleteInvoice(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        let invoices = getInvoicesFromStorage();
        invoices = invoices.filter(inv => inv.id !== id);
        saveInvoicesToStorage(invoices);
        renderTable();
    }
}

/**
 * Sayfa yüklendiğinde veya veri değiştiğinde arayüzü başlatır/günceller.
 */
function loadInvoices() {
    renderTable();
}

/**
 * Tabloyu ve özet kartlarını en güncel verilere göre yeniden çizer.
 */
function renderTable() {
    const invoices = getInvoicesFromStorage();
    const tableBody = document.getElementById('invoice-table-body');
    const searchFilter = document.getElementById('search').value.toLowerCase();
    
    tableBody.innerHTML = "";
    let income = 0, expense = 0;

    const filteredInvoices = invoices.filter(inv => 
        inv.description.toLowerCase().includes(searchFilter) ||
        inv.category.toLowerCase().includes(searchFilter)
    );

    filteredInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Liste boşsa mesaj göster/gizle
    document.getElementById('empty-state').classList.toggle('hidden', filteredInvoices.length > 0);

    filteredInvoices.forEach(inv => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div class="details-cell">
                    <span class="description">${htmlspecialchars(inv.description)}</span>
                    <span class="category">${htmlspecialchars(inv.date)} - ${htmlspecialchars(inv.category)}</span>
                </div>
            </td>
            <td class="text-right amount ${inv.type}">
                ${inv.type === 'expense' ? '−' : ''}$${inv.amount.toFixed(2)}
            </td>
            <td class="text-center actions-cell">
                <button onclick="deleteInvoice(${inv.id})" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    // Toplamları hesapla
    invoices.forEach(inv => {
        if (inv.type === "income") income += inv.amount;
        else expense += inv.amount;
    });

    document.getElementById('income-total').textContent = `$${income.toFixed(2)}`;
    document.getElementById('expense-total').textContent = `$${expense.toFixed(2)}`;
    const balance = income - expense;
    const balanceEl = document.getElementById('balance');
    balanceEl.textContent = `$${balance.toFixed(2)}`;
    balanceEl.style.color = balance < 0 ? 'var(--danger-color)' : 'var(--text-color)';
}


// --- YARDIMCI (HELPER) FONKSİYONLAR ---

function getInvoicesFromStorage() {
    return JSON.parse(localStorage.getItem('invoicifyApp') || '[]');
}

function saveInvoicesToStorage(invoices) {
    localStorage.setItem('invoicifyApp', JSON.stringify(invoices));
}

function htmlspecialchars(str) {
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, m => map[m]);
}
