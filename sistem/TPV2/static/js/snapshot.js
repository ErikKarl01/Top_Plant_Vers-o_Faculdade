let selectedSnapshot = null;

const tableBody = document.getElementById("snapshotsTableBody");
const editPanel = document.getElementById("editPanel");

// Elementos da ficha de leitura
const infoCode = document.getElementById("infoCode");
const infoProduct = document.getElementById("infoProduct");
const infoMeasure = document.getElementById("infoMeasure"); 

// Elementos de edição
const editPrice = document.getElementById("editPrice");
const editDiscount = document.getElementById("editDiscount");

window.onload = () => {
    loadSnapshots();
};

async function loadSnapshots() {
    selectedSnapshot = null;
    editPanel.style.display = "none";

    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;">Carregando snapshots...</td></tr>`;

    try {
        const response = await fetch("/order/snapshot/list/", { method: "GET" });
        const data = await response.json();

        if (!data.sucess) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;">Nenhum snapshot encontrado.</td></tr>`;
            return;
        }

        renderSnapshots(data.value);
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;">Erro ao carregar snapshots.</td></tr>`;
        showToast("Erro interno ao carregar snapshots.", false);
    }
}

function renderSnapshots(list) {
    tableBody.innerHTML = "";

    if (!list || list.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;">Nenhum snapshot encontrado.</td></tr>`;
        return;
    }

    list.forEach(snapshot => {
        const tr = document.createElement("tr");
        tr.style.cursor = "pointer";

        tr.innerHTML = `
            <td>${snapshot.code || "-"}</td>
            <td>${snapshot.product_code || "-"}</td>
            <td>${snapshot.product_code_name || "Sem Nome"}</td>
            <td><strong>${snapshot.measure || "-"}</strong></td>
            <td>R$ ${Number(snapshot.price || 0).toFixed(2)}</td>
            <td>R$ ${Number(snapshot.discount || 0).toFixed(2)}</td>
        `;

        tr.onclick = () => {
            document.querySelectorAll("#snapshotsTableBody tr").forEach(row => row.classList.remove("selected-row"));
            tr.classList.add("selected-row");
            selectedSnapshot = snapshot;
            fillEdition(snapshot);
        };

        tableBody.appendChild(tr);
    });
}

function fillEdition(snapshot) {
    editPanel.style.display = "block";

    // Preenche a ficha de leitura (texto simples)
    infoCode.innerText = snapshot.code || "-";
    infoProduct.innerText = `${snapshot.product_code || ""} - ${snapshot.product_code_name || ""}`;
    infoMeasure.innerText = snapshot.measure || "-"; 
    
    // Preenche os campos editáveis
    editPrice.value = snapshot.price || 0;
    editDiscount.value = snapshot.discount || 0;

    editPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelEdition() {
    selectedSnapshot = null;
    editPanel.style.display = "none";
    document.querySelectorAll("#snapshotsTableBody tr").forEach(row => row.classList.remove("selected-row"));
}

async function updateSnapshot() {
    if (!selectedSnapshot) return;

    const rawPrice = parseFloat(editPrice.value);
    const rawDiscount = parseFloat(editDiscount.value);

    const body = {
        code_snapshot: selectedSnapshot.code,
        price_product: isNaN(rawPrice) ? -1 : rawPrice,
        discount: isNaN(rawDiscount) ? 0 : rawDiscount
    };

    try {
        const response = await fetch("/order/snapshot/update/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        // O backend envia 'mensage' no sucesso e 'menssage' no erro. Essa linha resolve o problema:
        const responseMessage = data.menssage || data.mensage || data.message || "Erro desconhecido ao processar.";

        if (data.sucess) {
            showToast(responseMessage, true);
            cancelEdition();
            loadSnapshots();
            return;
        }

        // Se falhou, exibe as mensagens de erro pegando a string ou o array de erros
        showToast(
            Array.isArray(responseMessage) ? responseMessage.join("<br>") : responseMessage, 
            false
        );

    } catch (error) {
        console.error(error);
        showToast("Erro interno ao atualizar snapshot.", false);
    }
}

// Corrigido para as classes 'toast success' e 'toast error'
function showToast(message, success = true) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");

    toast.className = success ? "toast success" : "toast error";

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

function goBack() {
    window.history.back();
}