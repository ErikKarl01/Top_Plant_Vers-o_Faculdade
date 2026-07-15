let selectedOrder = null;

const tableBody = document.getElementById("ordersTableBody");
const btnUpdate = document.getElementById("btnUpdate");
const btnDelete = document.getElementById("btnDelete");

window.onload = () => {
    loadOrders();
    setupModalListeners();
};

/* =======================================================
   CARREGAMENTO E RENDERIZAÇÃO
   ======================================================= */

async function loadOrders(filters = { code_client: "", status: "", time_interval: {} }) {
    selectedOrder = null;
    btnUpdate.disabled = true;
    btnDelete.disabled = true;
    clearErrors();

    tableBody.innerHTML = `
        <div style="text-align:center; padding:2rem; color:#555;">
            Carregando pedidos...
        </div>
    `;

    try {
        const response = await fetch("/order/order/return/", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filters)
        });

        const data = await response.json();

        if (!data.sucess) {
            tableBody.innerHTML = `
                <div style="text-align:center; padding:2rem; color:var(--color-danger, red); font-weight:bold;">
                    Verifique os erros nos filtros acima.
                </div>
            `;
            
            const errMsg = data.mensage || "Erro ao buscar pedidos.";
            const errMsgLower = errMsg.toLowerCase();

            if (errMsgLower.includes("código") || errMsgLower.includes("cliente") || errMsgLower.includes("not found")) {
                showError("errFilterClient", errMsg);
            } else if (errMsgLower.includes("tempo") || errMsgLower.includes("data")) {
                showError("errFilterStart", errMsg);
                showError("errFilterEnd", errMsg);
            } else if (errMsgLower.includes("status")) {
                showError("errFilterStatus", errMsg);
            } else {
                showError("errFilterClient", errMsg);
            }
            return;
        }

        if (!Array.isArray(data.value) || data.value.length === 0) {
            tableBody.innerHTML = `
                <div style="text-align:center; padding:2rem; color:#555; font-weight:bold;">
                    Nenhum pedido encontrado.
                </div>
            `;
            return;
        }

        renderOrders(data.value);

    } catch (error) {
        tableBody.innerHTML = `
            <div style="text-align:center; padding:2rem; color:red;">
                Erro de conexão ao carregar pedidos.
            </div>
        `;
    }
}

function getStatusBadgeClass(status) {
    if (!status) return "status-desconhecido";
    const s = status.toUpperCase();
    if (s === "PENDENTE") return "status-pendente";
    if (s === "PARCIALMENTE ATENDIDO") return "status-parcial";
    if (s === "FINALIZADO") return "status-finalizado";
    return "status-desconhecido";
}

function formatarDataDoBanco(dataString) {
    if (!dataString) return "Data N/A";
    try {
        const apenasData = dataString.split("T")[0];
        const [ano, mes, dia] = apenasData.split("-");
        if(ano && mes && dia) {
            return `${dia}/${mes}/${ano}`;
        }
        return dataString;
    } catch (e) {
        return dataString;
    }
}

function renderOrders(ordersData) {
    tableBody.innerHTML = "";

    ordersData.forEach(data => {
        const order = data.order;
        const items = data.order_items || [];

        const orderCode = order.code || "N/A";
        const orderDate = formatarDataDoBanco(order.date);
        const clientCode = order.client_code || "-";
        const clientName = order.client_name || "Cliente não informado";
        const orderStatus = order.status || "PENDENTE";
        const badgeClass = getStatusBadgeClass(orderStatus);

        let itemsHTML = "";
        if (items.length === 0) {
            itemsHTML = `
                <tr>
                    <td colspan="7" class="item-empty">Nenhum item neste pedido.</td>
                </tr>
            `;
        } else {
            items.forEach(item => {
                itemsHTML += `
                    <tr>
                        <td>${item.product_name || 'Produto sem nome'}</td>
                        <td>${item.product_code || '-'}</td>
                        <td>${item.measure || '-'}</td>
                        <td>${item.original_amount}</td>
                        <td style="font-weight: bold; color: var(--color-positive, #28a745);">${item.amount}</td>
                        <td>R$ ${Number(item.price).toFixed(2)}</td>
                        <td>R$ ${Number(item.discount).toFixed(2)}</td>
                    </tr>
                `;
            });
        }

        const card = document.createElement("div");
        card.className = "order-card"; 
        card.id = `card_${orderCode}`;

        card.innerHTML = `
            <div class="order-header-container">
                <div class="order-header-row">
                    <span class="order-header-title">Pedido: ${orderCode}</span>
                    <span class="order-header-date">📅 Criado em: ${orderDate}</span>
                </div>
                <div class="order-header-row">
                    <span class="order-header-client">👤 Cliente: <strong>[${clientCode}]</strong> ${clientName}</span>
                    <span class="status-badge ${badgeClass}">${orderStatus}</span>
                </div>
            </div>
            
            <div class="items-title">Itens do Pedido</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Código</th>
                        <th>Unid.</th>
                        <th>Qtd. Solicitada</th>
                        <th>Qtd. Pendente</th>
                        <th>Preço</th>
                        <th>Desconto</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        `;

        card.onclick = () => {
            document.querySelectorAll(".order-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            
            selectedOrder = orderCode; 
            btnUpdate.disabled = false;
            btnDelete.disabled = false;
        };

        tableBody.appendChild(card);
    });
}

/* =======================================================
   FILTROS E DATAS
   ======================================================= */

function formatarDataParaBR(dataString) {
    if (!dataString) return "";
    const [year, month, day] = dataString.split("-");
    return `${day}/${month}/${year}`;
}

function filterOrders() {
    clearErrors();
    let hasError = false;

    const client = document.getElementById("filterClient").value.trim();
    const status = document.getElementById("filterStatus").value;
    const startRaw = document.getElementById("filterStart").value; 
    const endRaw = document.getElementById("filterEnd").value;     

    if ((startRaw && !endRaw) || (!startRaw && endRaw)) {
        showError("errFilterStart", "Preencha ambas as datas.");
        showError("errFilterEnd", "Preencha ambas as datas.");
        hasError = true;
    }

    if (startRaw && endRaw && new Date(startRaw) > new Date(endRaw)) {
        showError("errFilterStart", "A data inicial não pode ser maior que a final.");
        hasError = true;
    }

    if (hasError) return;

    const filters = {
        code_client: client,
        status: status,
        time_interval: (startRaw && endRaw) ? { 
            start: formatarDataParaBR(startRaw), 
            end: formatarDataParaBR(endRaw) 
        } : {}
    };

    loadOrders(filters);
}

function clearFilters() {
    document.getElementById("filterClient").value = "";
    document.getElementById("filterStatus").value = "";
    document.getElementById("filterStart").value = "";
    document.getElementById("filterEnd").value = "";
    
    clearErrors();
    loadOrders();
}

/* =======================================================
   ROTEAMENTO (NAVEGAÇÃO)
   ======================================================= */

function goToRegister() {
    window.location.href = "/order/register/";
}

function goToUpdate() {
    if (!selectedOrder) return;
    sessionStorage.setItem("orderToUpdate", selectedOrder); 
    window.location.href = "/order/update/";
}

function goToSnapshots() {
    window.location.href = "/order/snapshots/";
}

/* =======================================================
   EXCLUSÃO E MODAL
   ======================================================= */

function openDeleteModal() {
    if (!selectedOrder) {
        alert("Nenhum pedido selecionado. Clique em um pedido na tabela primeiro.");
        return;
    }

    const modal = document.getElementById("securityModal");
    if (modal) {
        modal.style.display = "flex";
        document.getElementById("confirmInput").value = "";
        document.getElementById("btnConfirmAction").disabled = true;
        clearErrors();
    }
}

function closeModal() {
    document.getElementById("securityModal").style.display = "none";
}

function setupModalListeners() {
    const input = document.getElementById("confirmInput");
    const btnConfirm = document.getElementById("btnConfirmAction");
    
    if (input && btnConfirm) {
        input.addEventListener("input", (e) => {
            btnConfirm.disabled = e.target.value.toLowerCase() !== "confirmar";
        });
    }
}

async function deleteOrder() {
    const inputVal = document.getElementById("confirmInput").value.toLowerCase();
    
    if (inputVal !== "confirmar") {
        showError("errConfirm", "A palavra-chave está incorreta.");
        return;
    }

    try {
        const res = await fetch("/order/order/delete/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 'code_order': selectedOrder })
        });

        if (!res.ok) {
            throw new Error(`Erro HTTP ${res.status}`);
        }

        const data = await res.json();
        
        if (data.sucess) { 
            closeModal();
            loadOrders(); 
        } else {
            showError("errConfirm", data.mensage || "Ocorreu um erro ao tentar excluir.");
        }
    } catch (e) {
        showError("errConfirm", "Erro de conexão ou resposta inválida.");
    }
}

/* =======================================================
   UTILITÁRIOS (MENSAGENS DE ERRO)
   ======================================================= */

function showError(elementId, message) {
    const errSpan = document.getElementById(elementId);
    if (errSpan) {
        errSpan.innerText = message;
        errSpan.style.display = "block";
        
        const inputId = elementId.replace("err", "filter");
        const input = document.getElementById(inputId) || document.getElementById("confirmInput");
        if (input) {
            input.classList.add("input-error");
        }
    }
}

function clearErrors() {
    document.querySelectorAll(".error-message").forEach(span => {
        span.innerText = "";
        span.style.display = "none";
    });
    document.querySelectorAll(".form-control").forEach(input => {
        input.classList.remove("input-error");
    });
}