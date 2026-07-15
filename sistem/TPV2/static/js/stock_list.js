//====================================================
// Top Plant V2
// stock_list.js
//====================================================

const STOCK_URL = "/stock/stockReturnForCategory/";
const ADD_URL = "/stock/addAmount/";
const REMOVE_URL = "/stock/removeAmount/";

let hortStock = [];
let ornStock = [];

let selectedOperation = "";
let selectedProduct = null;

//====================================================
// Inicialização
//====================================================

document.addEventListener("DOMContentLoaded", async () => {
    await loadStock("Hortaliças");
    await loadStock("Ornamentais");
});

//====================================================
// Carrega estoque da categoria (Refatorado)
//====================================================

async function loadStock(category) {
    try {
        // Dispara as requisições em sequência para evitar colisões/travamentos no banco de dados local
        const resLicensed = await fetch(STOCK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: category, products_licensed: true })
        });
        const dataLicensed = await resLicensed.json();

        const resNotLicensed = await fetch(STOCK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: category, products_licensed: false })
        });
        const dataNotLicensed = await resNotLicensed.json();

        let combinedItems = [];

        // Logs de diagnóstico no console (F12) para validar a resposta do servidor
        console.log(`[${category}] Retorno de Licenciados:`, dataLicensed);
        console.log(`[${category}] Retorno de Não Licenciados:`, dataNotLicensed);

        // Validação de Licenciados
        if (dataLicensed.sucess && dataLicensed.value && dataLicensed.value.items) {
            combinedItems = combinedItems.concat(dataLicensed.value.items);
        } else if (!dataLicensed.sucess) {
            console.warn(`[${category}] Erro ao buscar Licenciados:`, dataLicensed.mensage);
        }

        // Validação de Não Licenciados
        if (dataNotLicensed.sucess && dataNotLicensed.value && dataNotLicensed.value.items) {
            combinedItems = combinedItems.concat(dataNotLicensed.value.items);
        } else if (!dataNotLicensed.sucess) {
            console.warn(`[${category}] Erro ao buscar Não Licenciados:`, dataNotLicensed.mensage);
        }

        // Se ambos falharem de verdade, exibe o erro em tela
        if (!dataLicensed.sucess && !dataNotLicensed.sucess) {
            const mensagensErro = dataLicensed.mensage || dataNotLicensed.mensage;
            if (Array.isArray(mensagensErro)) {
                mensagensErro.forEach(msg => showToast(msg, "error"));
            } else if (mensagensErro) {
                showToast(mensagensErro, "error");
            }
        }

        // Atualiza o estoque global correto e renderiza na tabela correspondente
        if (category === "Hortaliças") {
            hortStock = combinedItems;
            renderTable(hortStock, "tableHort");
        } else {
            ornStock = combinedItems;
            renderTable(ornStock, "tableOrn");
        }

    } catch (error) {
        console.error("Erro na comunicação com o servidor:", error);
        showToast("Erro ao comunicar com o servidor.", "error");
    }
}

//====================================================
// Renderiza tabela
//====================================================

function renderTable(stock, idTable) {
    const tbody = document.getElementById(idTable);
    tbody.innerHTML = "";

    if (!Array.isArray(stock) || stock.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center">
                    Nenhum produto encontrado.
                </td>
            </tr>
        `;
        return;
    }

    stock.forEach(item => {
        // Log de diagnóstico: mostra exatamente o que está chegando na variável "licensed" para cada item
        console.log(`Renderizando -> Produto: ${item.product_name} | licensed:`, item.licensed);

        // Verificação robusta: aceita booleano real, string "true" ou número 1
        const isLicensed = (item.licensed === true || item.licensed === "true" || item.licensed === 1);

        tbody.innerHTML += `
            <tr>
                <td>${item.product_code}</td>
                <td>${item.product_name}</td>
                <td>
                    ${
                        isLicensed
                        ? '<span class="badge badge-success">Sim</span>'
                        : '<span class="badge badge-warning">Não</span>'
                    }
                </td>
                <td>
                    <strong>${item.amount}</strong>
                </td>
                <td>
                    <div style="display:flex;gap:.5rem">
                        <button
                            class="btn btn-positive btn-small"
                            onclick="openAddModal('${item.product_code}','${item.product_name}')">
                            + Quantidade
                        </button>
                        <button
                            class="btn btn-danger btn-small"
                            onclick="openRemoveModal('${item.product_code}','${item.product_name}')">
                            - Quantidade
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

//====================================================
// Filtros
//====================================================

function filterStock(category) {
    const isHort = category === "Hortaliças";

    const code = (
        isHort
            ? document.getElementById("filterCodeH")
            : document.getElementById("filterCodeO")
    ).value.trim().toLowerCase();

    const name = (
        isHort
            ? document.getElementById("filterNameH")
            : document.getElementById("filterNameO")
    ).value.trim().toLowerCase();

    const source = isHort ? hortStock : ornStock;

    const filtered = source.filter(item => {
        return (
            item.product_code.toLowerCase().includes(code)
            &&
            item.product_name.toLowerCase().includes(name)
        );
    });

    renderTable(
        filtered,
        isHort ? "tableHort" : "tableOrn"
    );
}

//====================================================
// Modal
//====================================================

function openAddModal(code, name) {
    selectedOperation = "add";
    selectedProduct = code;

    document.getElementById("modalTitle").innerText = "Adicionar quantidade";
    document.getElementById("modalDescription").innerText = `Produto: ${name}`;
    document.getElementById("amountInput").value = "";
    document.getElementById("amountModal").classList.add("active");
}

function openRemoveModal(code, name) {
    selectedOperation = "remove";
    selectedProduct = code;

    document.getElementById("modalTitle").innerText = "Remover quantidade";
    document.getElementById("modalDescription").innerText = `Produto: ${name}`;
    document.getElementById("amountInput").value = "";
    document.getElementById("amountModal").classList.add("active");
}

function closeModal() {
    document.getElementById("amountModal").classList.remove("active");
}

//====================================================
// Confirma operação 
//====================================================

document.getElementById("confirmButton").addEventListener("click", confirmOperation);

async function confirmOperation() {
    const amount = parseInt(document.getElementById("amountInput").value);

    if (isNaN(amount) || amount <= 0) {
        showToast("Informe uma quantidade válida.", "error");
        return;
    }

    const url = selectedOperation === "add" ? ADD_URL : REMOVE_URL;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code_product: selectedProduct,
                amount: amount
            })
        });

        const data = await response.json();

        if (data.sucess) {
            showToast(data.mensage, "success");
            closeModal();
            await loadStock("Hortaliças");
            await loadStock("Ornamentais");
        } else {
            if (Array.isArray(data.mensage)) {
                data.mensage.forEach(msg => {
                    showToast(msg, "error");
                });
            } else {
                showToast(data.mensage, "error");
            }
        }
    } catch (error) {
        console.error(error);
        showToast("Erro ao comunicar com o servidor.", "error");
    }
}

//====================================================
// Toast
//====================================================

function showToast(message, type) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");

    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}