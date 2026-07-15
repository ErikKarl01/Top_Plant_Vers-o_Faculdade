let snapshots = [];
let targetSnapshots = []; 
let selectedSnapshot = null;
let orderItems = [];
let clients = [];
let selectedClient = null;

const snapshotsTable = document.getElementById("snapshotsTableBody");
const targetSnapshotsTable = document.getElementById("targetSnapshotsTableBody"); 
const orderTable = document.getElementById("orderItemsTableBody");
const clientsTable = document.getElementById("clientsTableBody"); 

const confirmationModal = document.getElementById("confirmationModal");
const modalSummaryContainer = document.getElementById("modalSummaryContainer");
const modalTotalValueElem = document.getElementById("modalTotalValue");

window.onload = () => {
    loadSnapshots();
    loadClients();
};

/* ==========================================================================
   SNAPSHOTS LOGIC (TABELA PADRÃO COM ESTOQUE)
   ========================================================================= */

async function fetchStock(product_code) {
    try {
        const response = await fetch("/stock/itemAmountReturn/", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code_product: product_code })
        });
        
        const data = await response.json();

        if (!response.ok || data.sucess === false) {
            return 0;
        }

        return Number(data.value || 0);
    } catch (error) {
        return 0;
    }
}

async function loadSnapshots() {
    selectedSnapshot = null;

    if (snapshotsTable) {
        snapshotsTable.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;">Carregando produtos e estoques...</td></tr>`;
    }

    try {
        const response = await fetch("/order/snapshot/list/", { method: "GET" });
        const data = await response.json();

        if (!data.sucess) {
            if (snapshotsTable) snapshotsTable.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;">Nenhum snapshot encontrado.</td></tr>`;
            showToast(data.mensage, false);
            return;
        }

        let tempSnapshots = data.value;

        const stockPromises = tempSnapshots.map(async (snapshot) => {
            snapshot.stock_amount = await fetchStock(snapshot.product_code);
            return snapshot;
        });

        snapshots = await Promise.all(stockPromises);
        renderSnapshots(snapshots);
    } catch (error) {
        if (snapshotsTable) snapshotsTable.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;">Erro ao carregar snapshots.</td></tr>`;
        showToast("Erro interno ao carregar produtos.", false);
    }
}

function renderSnapshots(list) {
    if (!snapshotsTable) return;
    snapshotsTable.innerHTML = "";

    if (!list || list.length === 0) {
        snapshotsTable.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;">Nenhum produto encontrado.</td></tr>`;
        return;
    }

    list.forEach(snapshot => {
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";

        const price = Number(snapshot.price || 0);
        const discount = Number(snapshot.discount || 0);
        const finalPrice = price - discount;
        const stock = Number(snapshot.stock_amount || 0); 

        tr.innerHTML = `
            <td>${snapshot.product_code || "-"}</td>
            <td>${snapshot.product_code_name || "Sem Nome"}</td>
            <td><strong>${snapshot.measure || "-"}</strong></td>
            <td>R$ ${price.toFixed(2)}</td>
            <td>R$ ${discount.toFixed(2)}</td>
            <td>R$ ${finalPrice.toFixed(2)}</td>
            <td><strong>${stock}</strong></td>
        `;

        tr.onclick = () => {
            document.querySelectorAll("#snapshotsTableBody tr, #targetSnapshotsTableBody tr").forEach(row => row.classList.remove("selected-row"));
            tr.classList.add("selected-row");
            selectedSnapshot = snapshot;
        };

        snapshotsTable.appendChild(tr);
    });
}

/* ==========================================================================
   TARGET OPTIMIZATION LOGIC (TABELA EXTRA DE META)
   ========================================================================= */
async function searchTarget() {
    const targetPriceInput = document.getElementById("targetPrice").value;
    const target = parseFloat(targetPriceInput);

    if (isNaN(target) || target <= 0) {
        clearTarget();
        return;
    }

    if (targetSnapshotsTable) {
        targetSnapshotsTable.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;">Calculando melhor combinação...</td></tr>`;
    }

    try {
        const response = await fetch("/order/snapshot/ordenated_by_target/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price_target: target })
        });

        const data = await response.json();

        if (!data.sucess) {
            if (targetSnapshotsTable) targetSnapshotsTable.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;">Nenhum resultado encontrado.</td></tr>`;
            showToast(data.mensage, false);
            return;
        }

        targetSnapshots = data.value;
        renderTargetSnapshots(targetSnapshots);
        showToast("Itens listados em ordem de melhor preferência para fechar o valor do pedido.", true);
    } catch (error) {
        showToast("Erro ao calcular meta.", false);
    }
}

function renderTargetSnapshots(list) {
    if (!targetSnapshotsTable) return;
    targetSnapshotsTable.innerHTML = "";

    if (!list || list.length === 0) {
        targetSnapshotsTable.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;">Insira um valor alvo e clique em Ordenar.</td></tr>`;
        return;
    }

    list.forEach(item => {
        const snapshot = item.snap;
        const qtdSugerida = item.quantidade;
        const totalAcumulado = item.total_value;

        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";

        const price = Number(snapshot.price || 0);
        const discount = Number(snapshot.discount || 0);
        const finalPrice = price - discount;

        tr.innerHTML = `
            <td>${snapshot.product_code || "-"}</td>
            <td>${snapshot.product_code_name || "Sem Nome"}</td>
            <td><strong>${snapshot.measure || "-"}</strong></td>
            <td>R$ ${price.toFixed(2)}</td>
            <td>R$ ${discount.toFixed(2)}</td>
            <td>R$ ${finalPrice.toFixed(2)}</td>
            <td><strong>${qtdSugerida}x</strong></td>
            <td>R$ ${Number(totalAcumulado).toFixed(2)}</td>
        `;

        tr.onclick = () => {
            document.querySelectorAll("#snapshotsTableBody tr, #targetSnapshotsTableBody tr").forEach(row => row.classList.remove("selected-row"));
            tr.classList.add("selected-row");
            selectedSnapshot = snapshot;
        };

        targetSnapshotsTable.appendChild(tr);
    });
}

function clearTarget() {
    document.getElementById("targetPrice").value = "";
    targetSnapshots = [];
    if (targetSnapshotsTable) {
        targetSnapshotsTable.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:1.5rem;">Insira uma meta de preço para liberar as sugestões.</td></tr>`;
    }
    loadSnapshots();
}

/* ==========================================================================
   CLIENTS LOGIC (Listagem e Travamento de Seleção)
   ========================================================================= */
async function loadClients() {
    if (!clientsTable) return;
    clientsTable.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:2rem;">Carregando clientes...</td></tr>`;

    try {
        const response = await fetch("/client/list/", { method: "GET" });
        const data = await response.json();

        if (!data.sucess) {
            clientsTable.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:2rem;">Nenhum cliente encontrado.</td></tr>`;
            return;
        }

        clients = data.value;
        renderClients(clients);
    } catch (error) {
        clientsTable.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:2rem;">Erro ao carregar clientes.</td></tr>`;
        showToast("Erro interno ao carregar clientes.", false);
    }
}

function renderClients(list) {
    if (!clientsTable) return;
    clientsTable.innerHTML = "";

    if (!list || list.length === 0) {
        clientsTable.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:2rem;">Nenhum cliente disponível.</td></tr>`;
        return;
    }

    list.forEach(item => {
        const client = item.client ? item.client : item; 

        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";

        if (selectedClient && selectedClient.code === client.code) {
            tr.classList.add("selected-row");
        } else if (selectedClient) {
            tr.style.opacity = "0.5";
            tr.style.cursor = "not-allowed";
        }

        tr.innerHTML = `
            <td>${client.code || "-"}</td>
            <td>${client.name || "Sem Nome"}</td>
            <td>${client.doc || "-"}</td>
        `;

        tr.onclick = () => {
            if (selectedClient && selectedClient.code !== client.code) {
                showToast("Um cliente já foi selecionado. Desmarque o atual para escolher outro.", false);
                return;
            }

            if (selectedClient && selectedClient.code === client.code) {
                selectedClient = null;
                if (document.getElementById("clientName")) document.getElementById("clientName").value = "";
                if (document.getElementById("clientCode")) document.getElementById("clientCode").value = "";
                renderClients(clients);
                return;
            }

            selectedClient = client;
            if (document.getElementById("clientName")) document.getElementById("clientName").value = selectedClient.name;
            if (document.getElementById("clientCode")) document.getElementById("clientCode").value = selectedClient.code;
            
            renderClients(clients);
            showToast(`Cliente ${client.name} vinculado ao pedido.`, true);
        };

        clientsTable.appendChild(tr);
    });
}

async function searchClient() {
    const code = document.getElementById("clientCode").value.trim();

    if (!code) {
        selectedClient = null;
        document.getElementById("clientName").value = "";
        renderClients(clients);
        return;
    }

    try {
        const response = await fetch("/client/search/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code_client: code, name: "", doc: "" })
        });

        const data = await response.json();

        if (!data.sucess) {
            selectedClient = null;
            document.getElementById("clientName").value = "";
            renderClients(clients);
            showToast(data.mensage, false);
            return;
        }

        const clientResult = data.value.client ? data.value.client : data.value;
        selectedClient = clientResult;
        
        document.getElementById("clientName").value = selectedClient.name;
        renderClients(clients);
    } catch (error) {
        showToast("Erro ao localizar cliente.", false);
    }
}

/* ==========================================================================
   ORDER LOGIC
   ========================================================================= */
function renderOrderItems() {
    if (!orderTable) return;
    orderTable.innerHTML = "";

    if (orderItems.length === 0) {
        orderTable.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;">Nenhum item adicionado.</td></tr>`;
        const totalElem = document.getElementById("totalItems");
        if(totalElem) totalElem.innerText = "0";
        return;
    }

    orderItems.forEach((item, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.product_code}</td>
            <td>${item.product_name}</td>
            <td><strong>${item.measure}</strong></td>
            <td>${item.amount}</td>
            <td>R$ ${Number(item.price).toFixed(2)}</td>
            <td>R$ ${Number(item.discount).toFixed(2)}</td>
            <td>
                <button class="btn btn-danger" style="padding:.3rem .7rem;" onclick="removeItem(${index})">Remover</button>
            </td>
        `;

        orderTable.appendChild(tr);
    });

    const totalElem = document.getElementById("totalItems");
    if(totalElem) totalElem.innerText = orderItems.length;
}

function addItem() {
    if (!selectedSnapshot) {
        showToast("Selecione um produto de uma das tabelas de listagem.", false);
        return;
    }

    const amountInput = document.getElementById("itemAmount").value;
    const amount = parseInt(amountInput);
    const stockAvailable = Number(selectedSnapshot.stock_amount || 0); 

    if (isNaN(amount) || amount <= 0) {
        showToast("Quantidade inválida.", false);
        return;
    }

    const exists = orderItems.find(item => item.product_code === selectedSnapshot.product_code);
    const currentAmountInCart = exists ? exists.amount : 0;
    const totalAttempted = currentAmountInCart + amount;

    if (totalAttempted > stockAvailable) {
        showToast(`Estoque insuficiente! Você tentou adicionar ${totalAttempted}, mas só temos ${stockAvailable} unid. de ${selectedSnapshot.product_code_name}.`, false);
        return;
    }

    if (exists) {
        exists.amount += amount;
    } else {
        orderItems.push({
            product_code: selectedSnapshot.product_code,
            product_name: selectedSnapshot.product_code_name,
            measure: selectedSnapshot.measure || "-", 
            amount: amount,
            price: Number(selectedSnapshot.price),
            discount: Number(selectedSnapshot.discount)
        });
    }

    renderOrderItems();
    document.getElementById("itemAmount").value = "1";
}

function removeItem(index) {
    orderItems.splice(index, 1);
    renderOrderItems();
}

/* ==========================================================================
   MODAL DE CONFIRMAÇÃO & ENDPOINTS DE CÁLCULO / SALVAMENTO
   ========================================================================= */
async function nextStep() {
    if (!selectedClient) {
        showToast("Selecione um cliente válido na lista acima.", false);
        return;
    }

    if (orderItems.length === 0) {
        showToast("Adicione pelo menos um item ao pedido.", false);
        return;
    }

    const backendItemsPayload = orderItems.map(item => ({
        code_product: item.product_code,
        amount: item.amount
    }));

    try {
        const response = await fetch("/order/total_order/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: backendItemsPayload })
        });

        const data = await response.json();

        if (!data.sucess) {
            showToast(data.mensage, false);
            return;
        }

        buildOrderSummaryModal(data.value);
    } catch (error) {
        showToast("Erro ao processar cálculo totalizador no servidor.", false);
    }
}

function buildOrderSummaryModal(totalBackendValue) {
    if (!modalSummaryContainer || !confirmationModal) return;

    modalSummaryContainer.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <strong>Cliente:</strong> ${selectedClient.name} (${selectedClient.code})<br>
            <strong>Documento:</strong> ${selectedClient.doc || "-"}
        </div>
        <hr style="border:0; border-top:1px solid #eee; margin:1rem 0;">
        <div style="max-height: 200px; overflow-y: auto;">
            <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                <thead>
                    <tr style="border-bottom: 2px solid #eee; text-align:left;">
                        <th style="padding: 0.5rem 0;">Cód.</th>
                        <th>Produto</th>
                        <th>Unidade</th>
                        <th>Qtd.</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderItems.map(item => `
                        <tr style="border-bottom:1px solid #f9f9f9;">
                            <td style="padding: 0.5rem 0;">${item.product_code}</td>
                            <td>${item.product_name}</td>
                            <td>${item.measure}</td>
                            <td><strong>${item.amount}x</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    if (modalTotalValueElem) {
        modalTotalValueElem.innerText = `R$ ${Number(totalBackendValue).toFixed(2)}`;
    }

    confirmationModal.style.display = "flex";
}

function closeModal() {
    if (confirmationModal) confirmationModal.style.display = "none";
}

async function confirmAndSaveOrder() {
    closeModal();

    const backendItemsPayload = orderItems.map(item => ({
        code_product: item.product_code,
        amount: item.amount
    }));

    const orderDataPayload = {
        code_client: selectedClient.code,
        items: backendItemsPayload
    };

    try {
        const response = await fetch("/order/order/create/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderDataPayload)
        });

        const data = await response.json();

        if (data.sucess === false || !response.ok) {
            const errorMsg = data.menssage || data.mensage || data.message || "Erro na validação do pedido.";
            showToast(errorMsg, false);
            return;
        }

        showToast("Pedido salvo com sucesso no banco de dados!", true);
        sessionStorage.setItem("newOrder", JSON.stringify(orderDataPayload));
        
        setTimeout(() => {
            clearOrder(); 
        }, 1500);

    } catch (error) {
        showToast("Erro interno ao tentar salvar o pedido.", false);
    }
}

function clearOrder() {
    selectedSnapshot = null;
    selectedClient = null;
    orderItems = [];

    const clientCodeElem = document.getElementById("clientCode");
    const clientNameElem = document.getElementById("clientName");
    const itemAmountElem = document.getElementById("itemAmount");
    const targetPriceElem = document.getElementById("targetPrice");

    if(clientCodeElem) clientCodeElem.value = "";
    if(clientNameElem) clientNameElem.value = "";
    if(itemAmountElem) itemAmountElem.value = "1";
    if(targetPriceElem) targetPriceElem.value = "";

    document.querySelectorAll("#snapshotsTableBody tr, #targetSnapshotsTableBody tr").forEach(row => {
        row.classList.remove("selected-row");
    });

    renderOrderItems();
    clearTarget(); 
    renderClients(clients); 
    closeModal();
}

/* ==========================================================================
   EVENT LISTENERS & UTILS
   ========================================================================= */
const elClientCode = document.getElementById("clientCode");
if (elClientCode) {
    elClientCode.addEventListener("keypress", function (event) {
        if (event.key === "Enter") searchClient();
    });
}

const elTargetPrice = document.getElementById("targetPrice");
if (elTargetPrice) {
    elTargetPrice.addEventListener("keypress", function (event) {
        if (event.key === "Enter") searchTarget();
    });
}

const elItemAmount = document.getElementById("itemAmount");
if (elItemAmount) {
    elItemAmount.addEventListener("keypress", function (event) {
        if (event.key === "Enter") addItem();
    });
}

function showToast(message, success = true) {
    const container = document.getElementById("toastContainer");
    if (!container) return; 
    
    const toast = document.createElement("div");
    toast.className = success ? "toast toast-success" : "toast toast-error";

    if (Array.isArray(message)) {
        toast.innerHTML = message.join("<br>");
    } else {
        toast.innerHTML = message;
    }

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==========================================================================
   NAVEGAÇÃO
   ========================================================================= */
function goBack() {
    window.history.back();
}