let currentOrderCode = null;
let orderItemsList = []; 

window.onload = () => {
    currentOrderCode = sessionStorage.getItem("orderToUpdate");
    
    if (!currentOrderCode) {
        alert("Nenhum pedido foi selecionado. Voltando para a listagem.");
        goToHome();
        return;
    }
    
    fetchOrderDetails();
};

/* =======================================================
   BUSCA DOS DADOS DO PEDIDO (GET)
   ======================================================= */
async function fetchOrderDetails() {
    try {
        const response = await fetch("/order/order/get/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ code_order: currentOrderCode })
        });

        const data = await response.json();

        if (!data.sucess) {
            showInitialError(data.mensage || "Erro ao carregar detalhes do pedido.");
            return;
        }

        populateOrderData(data.value);

    } catch (error) {
        showInitialError("Erro de conexão ao carregar o pedido.");
    }
}

/* =======================================================
   PREENCHIMENTO DOS CAMPOS NA TELA (ATUALIZADA)
   ======================================================= */
function populateOrderData(dataValue) {
    const orderData = Array.isArray(dataValue) ? dataValue[0] : dataValue;
    
    if (!orderData || !orderData.order) {
        showInitialError("Dados do pedido não encontrados ou formato inválido.");
        return;
    }

    const order = orderData.order;
    const items = orderData.order_items || [];
    orderItemsList = items;

    document.getElementById("infoOrderCode").textContent = order.code || "N/A";
    document.getElementById("infoOrderDate").textContent = formatarDataDoBanco(order.date);
    document.getElementById("infoOrderClient").textContent = `[${order.client_code || '-'}] ${order.client_name || 'Cliente não identificado'}`;
    
    const statusBadge = document.getElementById("infoOrderStatus");
    statusBadge.textContent = order.status || "PENDENTE";
    statusBadge.className = `status-badge ${getStatusBadgeClass(order.status)}`;

    const tbody = document.getElementById("itemsTableBody");
    tbody.innerHTML = ""; 

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2.5rem; color: #777; font-style: italic;">
                    Não há itens pendentes para este pedido.
                </td>
            </tr>
        `;
        document.getElementById("btnSubmitUpdate").disabled = true;
    } else {
        items.forEach(item => {
            const maxAllowed = item.amount;
            const isZero = maxAllowed === 0;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${item.product_name || 'Produto sem Nome'}</strong></td>
                <td><code>${item.product_code || '-'}</code></td>
                <td>${item.measure || '-'}</td>
                <td style="text-align: center;">${item.original_amount || 0}</td>
                <td style="text-align: center; font-weight: bold; color: var(--color-positive, #28a745);">${maxAllowed}</td>
                <td>R$ ${Number(item.price).toFixed(2)}</td>
                <td>R$ ${Number(item.discount).toFixed(2)}</td>
                <td style="text-align: center;">
                    <input 
                        type="number" 
                        id="provided_${item.product_code}" 
                        class="form-control provided-field" 
                        min="0" 
                        max="${maxAllowed}" 
                        value="0"
                        ${isZero ? 'disabled' : ''}
                        oninput="validateRowInput(this, ${maxAllowed})"
                    >
                    <span id="err_${item.product_code}" class="error-span"></span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    document.getElementById("loadingView").style.display = "none";
    document.getElementById("mainContentView").style.display = "block";
}

/* =======================================================
   ENVIO DA BAIXA DE ESTOQUE (POST)
   ======================================================= */
async function submitUpdate() {
    clearErrors();
    const btnSubmit = document.getElementById("btnSubmitUpdate");
    btnSubmit.disabled = true;

    const itemsToDiscount = [];
    let hasValidationError = false;
    let totalItemsToDeliver = 0;

    orderItemsList.forEach(item => {
        const inputField = document.getElementById(`provided_${item.product_code}`);
        if (!inputField) return;

        const typedValue = parseInt(inputField.value) || 0;
        const maxLimit = item.amount;

        if (typedValue < 0 || typedValue > maxLimit) {
            showInputError(inputField, `Limite inválido (máx: ${maxLimit})`);
            hasValidationError = true;
        }

        if (typedValue > 0) {
            itemsToDiscount.push({
                code_product: item.product_code,
                provided: typedValue
            });
            totalItemsToDeliver += typedValue;
        }
    });

    if (hasValidationError) {
        btnSubmit.disabled = false;
        showGlobalError("Ajuste as quantidades incorretas antes de prosseguir.");
        return;
    }

    if (totalItemsToDeliver === 0) {
        btnSubmit.disabled = false;
        showGlobalError("Informe pelo menos 1 item com quantidade maior que zero para fazer a baixa.");
        return;
    }

    try {
        const response = await fetch("/order/order/update/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code_order: currentOrderCode,
                items_to_discount: itemsToDiscount
            })
        });

        const data = await response.json();

        if (!data.sucess) {
            btnSubmit.disabled = false;
            showGlobalError(data.mensage || "Erro ao atualizar pedido no estoque.");
            return;
        }

        alert("Baixa de estoque realizada com sucesso!");
        sessionStorage.removeItem("orderToUpdate"); 
        goToHome();

    } catch (error) {
        btnSubmit.disabled = false;
        showGlobalError("Erro de comunicação com o servidor ao salvar as alterações.");
    }
}

/* =======================================================
   AUXILIARES E VALIDAÇÕES EM TEMPO REAL
   ======================================================= */

function validateRowInput(input, maxVal) {
    const value = parseInt(input.value) || 0;
    
    if (value < 0) {
        input.value = 0;
        showInputError(input, "Mínimo: 0");
    } else if (value > maxVal) {
        input.value = maxVal;
        showInputError(input, `Máximo: ${maxVal}`);
    } else {
        clearInputError(input);
    }
}

function showInputError(input, message) {
    input.classList.add("input-error");
    const errSpan = document.getElementById(input.id.replace("provided_", "err_"));
    if (errSpan) {
        errSpan.textContent = message;
        errSpan.style.display = "block";
    }
}

function clearInputError(input) {
    input.classList.remove("input-error");
    const errSpan = document.getElementById(input.id.replace("provided_", "err_"));
    if (errSpan) {
        errSpan.textContent = "";
        errSpan.style.display = "none";
    }
}

function showGlobalError(message) {
    const errorBlock = document.getElementById("globalErrorBlock");
    if (errorBlock) {
        errorBlock.textContent = message;
        errorBlock.style.display = "block";
    }
}

function showInitialError(message) {
    const loadingView = document.getElementById("loadingView");
    if (loadingView) {
        loadingView.innerHTML = `
            <div style="color: var(--color-danger, #d9534f); font-weight: bold; margin-bottom: 1.5rem;">
                ⚠️ ${message}
            </div>
            <button class="btn btn-cancel" onclick="goToHome()">Voltar para a Gestão</button>
        `;
    }
}

function clearErrors() {
    const errorBlock = document.getElementById("globalErrorBlock");
    if (errorBlock) {
        errorBlock.style.display = "none";
        errorBlock.textContent = "";
    }
    document.querySelectorAll(".provided-field").forEach(input => clearInputError(input));
}

function formatarDataDoBanco(dataString) {
    if (!dataString) return "Data N/A";
    try {
        const apenasData = dataString.split("T")[0];
        const [ano, mes, dia] = apenasData.split("-");
        if (ano && mes && dia) {
            return `${dia}/${mes}/${ano}`;
        }
        return dataString;
    } catch (e) {
        return dataString;
    }
}

function getStatusBadgeClass(status) {
    if (!status) return "status-desconhecido";
    const s = status.toUpperCase();
    if (s === "PENDENTE") return "status-pendente";
    if (s === "PARCIALMENTE ATENDIDO" || s === "PARCIAL") return "status-parcial";
    if (s === "FINALIZADO") return "status-finalizado";
    return "status-desconhecido";
}

function goToHome() {
    window.location.href = "/order/";
}