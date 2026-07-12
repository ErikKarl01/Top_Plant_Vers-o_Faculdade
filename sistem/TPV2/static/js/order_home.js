let selectedOrder = null;

const tableBody = document.getElementById("ordersTableBody");
const btnUpdate = document.getElementById("btnUpdate");
const btnDelete = document.getElementById("btnDelete");

// Inicialização
window.onload = () => {
    loadOrders();
    setupModalListeners();
};

// =======================================================
// CARREGAMENTO E RENDERIZAÇÃO
// =======================================================

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

        // 1. Tratamento de Erros da API
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

        // 2. Sem resultados
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
        console.error(error);
        tableBody.innerHTML = `
            <div style="text-align:center; padding:2rem; color:red;">
                Erro de conexão ao carregar pedidos.
            </div>
        `;
    }
}

// Auxiliar para pegar o estilo correto da Badge de Status
function getStatusBadgeClass(status) {
    if (!status) return "status-desconhecido";
    const s = status.toUpperCase();
    if (s === "PENDENTE") return "status-pendente";
    if (s === "PARCIALMENTE ATENDIDO") return "status-parcial";
    if (s === "FINALIZADO") return "status-finalizado";
    return "status-desconhecido";
}

// Auxiliar para formatar a data vinda do Django (ISO ou string padrão) para formato BR
function formatarDataDoBanco(dataString) {
    if (!dataString) return "Data N/A";
    try {
        // Se a data vier completa do banco (ex: 2026-03-30T14:23:00) pega só os primeiros 10 caracteres (ano-mes-dia)
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

// >>> FUNÇÃO RENDERORDERS ATUALIZADA COM O NOVO HTML/CSS <<<
function renderOrders(ordersData) {
    tableBody.innerHTML = "";

    ordersData.forEach(data => {
        const order = data.order;
        const items = data.order_items || [];

        // Formatação das variáveis do dicionário Python do Django
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
                    <td colspan="5" class="item-empty">Nenhum item neste pedido.</td>
                </tr>
            `;
        } else {
            items.forEach(item => {
                itemsHTML += `
                    <tr>
                        <td>${item.product_name || 'Produto sem nome'}</td>
                        <td>${item.product_code || '-'}</td>
                        <td>${item.amount}</td>
                        <td>R$ ${Number(item.price).toFixed(2)}</td>
                        <td>R$ ${Number(item.discount).toFixed(2)}</td>
                    </tr>
                `;
            });
        }

        // Criando o elemento principal do Card
        const card = document.createElement("div");
        card.className = "order-card"; // Classe nova do CSS
        card.id = `card_${orderCode}`;

        // Estrutura HTML que bate com o novo CSS global
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
                        <th>Quantidade</th>
                        <th>Preço</th>
                        <th>Desconto</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        `;

        // Lógica de clique para selecionar o card e ativar botões
        card.onclick = () => {
            document.querySelectorAll(".order-card").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            
            selectedOrder = orderCode; // Salva para o Django saber qual excluir/atualizar
            btnUpdate.disabled = false;
            btnDelete.disabled = false;
        };

        tableBody.appendChild(card);
    });
}

// =======================================================
// FILTROS E DATAS
// =======================================================

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

// =======================================================
// ROTEAMENTO (NAVEGAÇÃO)
// =======================================================

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

// =======================================================
// EXCLUSÃO E MODAL
// =======================================================

function openDeleteModal() {
    console.log("1. Clicou no botão Excluir. Pedido selecionado:", selectedOrder);
    
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
        console.log("2. Modal aberto com sucesso.");
    } else {
        console.error("ERRO FATAL: A Div do modal (securityModal) não foi encontrada no HTML.");
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
            // Ativa o botão apenas se o usuário digitar exatamente "confirmar"
            btnConfirm.disabled = e.target.value.toLowerCase() !== "confirmar";
        });
    } else {
        console.error("Abas do modal não encontradas para monitorar o input.");
    }
}

async function deleteOrder() {
    const inputVal = document.getElementById("confirmInput").value.toLowerCase();
    
    if (inputVal !== "confirmar") {
        showError("errConfirm", "A palavra-chave está incorreta.");
        return;
    }

    try {
        console.log("3. Disparando POST para o Django. Pedido:", selectedOrder);
        
        const res = await fetch("/order/order/delete/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 'code_order': selectedOrder })
        });

        if (!res.ok) {
            console.error("Erro do servidor:", res.status);
            throw new Error(`Erro HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("4. Resposta do Django:", data);
        
        if (data.sucess) { 
            closeModal();
            loadOrders(); 
        } else {
            showError("errConfirm", data.mensage || "Ocorreu um erro ao tentar excluir.");
        }
    } catch (e) {
        console.error("5. Falha na requisição:", e);
        showError("errConfirm", "Erro de conexão ou resposta inválida. Veja o console (F12).");
    }
}

// =======================================================
// UTILITÁRIOS (MENSAGENS DE ERRO)
// =======================================================

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