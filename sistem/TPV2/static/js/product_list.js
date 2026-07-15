let selectedProductCode = null;
let actionContext = null; 
let pendingPriceUpdate = { code: null, price: null };

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    setupModalLogic();
});

// ==================== SISTEMA DE NOTIFICAÇÕES ====================
function showToast(message, type = 'error') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    if (Array.isArray(message)) {
        toast.innerHTML = message.join('<br>');
    } else {
        toast.innerText = message || 'Ocorreu um erro inesperado.';
    }

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==================== REQUISIÇÕES (API) ====================
async function loadProducts(clearInputs = true) {
    if (clearInputs) {
        document.getElementById('filterCode').value = '';
        document.getElementById('filterName').value = '';
    }
    
    try {
        const response = await fetch('/product/list/');
        const data = await response.json();
        
        if (response.ok && data.value) {
            renderTable(data.value);
        } else {
            renderTable([]);
            showToast(data.menssage || data.mensage || "Erro ao carregar lista.", 'error');
        }
    } catch (error) {
        showToast("Erro de conexão com o servidor.", 'error');
    }
}

async function filterProducts() {
    const code = document.getElementById('filterCode').value.trim();
    const name = document.getElementById('filterName').value.trim();

    try {
        const response = await fetch('/product/return/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code_product: code, name: name })
        });
        const data = await response.json();
        
        if (response.ok && data.value) {
            renderTable(Array.isArray(data.value) ? data.value : [data.value]);
            showToast(data.mensage || "Produto encontrado.", 'success');
        } else {
            showToast(data.menssage || data.mensage || "Produto não encontrado.", 'error');
            
            if (!code && !name) {
                loadProducts(false);
            } else {
                renderTable([]);
            }
        }
    } catch (error) {
        showToast("Erro de conexão ao filtrar.", 'error');
    }
}

// ==================== RENDERIZAÇÃO DA TABELA ====================
function renderTable(products) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    resetSelection(); 

    if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #666;">Nenhum produto encontrado.</td></tr>`;
        return;
    }

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.onclick = (e) => {
            if(e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            selectRow(tr, p.code);
        };

        const licensedBadge = p.licensed 
            ? `<span class="badge badge-success">Sim</span>` 
            : `<span class="badge badge-warning">Não</span>`;

        tr.innerHTML = `
            <td>${p.code}</td>
            <td>${p.name}</td>
            <td>${p.type || '-'}</td>
            <td>${p.measure || '-'}</td>
            <td id="price-cell-${p.code}">
                <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 180px;">
                    <span>R$ ${parseFloat(p.price).toFixed(2)}</span>
                    <button class="btn btn-positive btn-small" onclick="enablePriceEdit('${p.code}', ${p.price})">Atualizar</button>
                </div>
            </td>
            <td>${p.description || '-'}</td>
            <td>${licensedBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

function selectRow(rowElement, code) {
    document.querySelectorAll('#productsTableBody tr').forEach(tr => tr.classList.remove('selected'));
    rowElement.classList.add('selected');
    selectedProductCode = code;

    document.getElementById('btnEdit').disabled = false;
    document.getElementById('btnDelete').disabled = false;
}

function resetSelection() {
    selectedProductCode = null;
    document.getElementById('btnEdit').disabled = true;
    document.getElementById('btnDelete').disabled = true;
}

function goToEdit() {
    if(selectedProductCode) {
        // Salva o código na memória temporária do navegador de forma segura
        sessionStorage.setItem('editProductCode', selectedProductCode);
        // Chama a rota exatamente como está no seu urls.py (sem parâmetros na URL)
        window.location.href = '/product/edit/';
    }
}

// ==================== EDIÇÃO DE PREÇO ====================
function enablePriceEdit(code, currentPrice) {
    const cell = document.getElementById(`price-cell-${code}`);
    cell.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 180px;">
            <input type="number" id="input-price-${code}" class="form-control" style="width: 80px; padding: 0.3rem;" step="0.01" value="${currentPrice}">
            <button class="btn btn-positive btn-small" onclick="requestPriceChange('${code}')">✔️</button>
            <button class="btn btn-cancel btn-small" onclick="cancelPriceEdit('${code}', ${currentPrice})">❌</button>
        </div>
    `;
    
    const input = document.getElementById(`input-price-${code}`);
    input.focus();
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') requestPriceChange(code);
    });
}

function cancelPriceEdit(code, currentPrice) {
    const cell = document.getElementById(`price-cell-${code}`);
    cell.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; min-width: 180px;">
            <span>R$ ${parseFloat(currentPrice).toFixed(2)}</span>
            <button class="btn btn-positive btn-small" onclick="enablePriceEdit('${code}', ${currentPrice})">Atualizar</button>
        </div>
    `;
}

function requestPriceChange(code) {
    const newPrice = document.getElementById(`input-price-${code}`).value;
    if(!newPrice || newPrice <= 0) {
        showToast("Insira um valor válido para o preço.", 'error');
        return;
    }

    pendingPriceUpdate = { code: code, price: parseFloat(newPrice) };
    
    actionContext = 'updatePrice';
    document.getElementById('modalTitle').innerText = 'Confirmar Novo Preço';
    document.getElementById('modalDesc').innerHTML = `Você está alterando o preço para <strong>R$ ${pendingPriceUpdate.price.toFixed(2)}</strong>.<br>Digite <strong>confirmar</strong> para aplicar.`;
    document.getElementById('btnConfirmAction').className = 'btn btn-positive';
    
    document.getElementById('securityModal').classList.add('active');
}

// ==================== MODAL E AÇÕES FINAIS ====================
function openDeleteModal() {
    if(!selectedProductCode) return;
    
    actionContext = 'delete';
    document.getElementById('modalTitle').innerText = 'Excluir Produto';
    document.getElementById('modalDesc').innerHTML = `Tem certeza que deseja excluir este produto?<br>Digite <strong>confirmar</strong> para apagar.`;
    document.getElementById('btnConfirmAction').className = 'btn btn-danger';
    
    document.getElementById('securityModal').classList.add('active');
}

function closeModal() {
    document.getElementById('securityModal').classList.remove('active');
    document.getElementById('confirmInput').value = '';
    document.getElementById('btnConfirmAction').disabled = true;
    actionContext = null;
}

function setupModalLogic() {
    const input = document.getElementById('confirmInput');
    const btn = document.getElementById('btnConfirmAction');

    input.addEventListener('input', (e) => {
        if(e.target.value.toLowerCase() === 'confirmar') {
            btn.disabled = false;
        } else {
            btn.disabled = true;
        }
    });

    btn.addEventListener('click', async () => {
        if(actionContext === 'delete') {
            await executeDelete();
        } else if(actionContext === 'updatePrice') {
            await executePriceUpdate();
        }
    });
}

async function executeDelete() {
    try {
        const response = await fetch('/product/delete/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code_product: selectedProductCode })
        });
        const data = await response.json();
        
        closeModal();
        
        if (response.ok) {
            showToast(data.mensage || "Produto excluído com sucesso.", 'success');
            loadProducts();
        } else {
            showToast(data.menssage || data.mensage || "Erro ao excluir produto.", 'error');
        }
    } catch (error) {
        closeModal();
        showToast("Erro de conexão ao deletar.", 'error');
    }
}

async function executePriceUpdate() {
    try {
        const response = await fetch('/product/update_price/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                code_product: pendingPriceUpdate.code, 
                price: pendingPriceUpdate.price 
            })
        });
        const data = await response.json();
        
        closeModal();
        
        if (response.ok) {
            showToast(data.mensage || "Preço atualizado com sucesso.", 'success');
            loadProducts();
        } else {
            showToast(data.menssage || data.mensage || "Erro ao atualizar preço.", 'error');
        }
    } catch (error) {
        closeModal();
        showToast("Erro de conexão ao atualizar preço.", 'error');
    }
}