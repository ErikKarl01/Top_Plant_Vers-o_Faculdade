let selectedClient = null;

const tableBody = document.getElementById("clientsTableBody");

const btnEdit = document.getElementById("btnEdit");
const btnDelete = document.getElementById("btnDelete");
const btnAdress = document.getElementById("btnAdress");
const btnEditAdress = document.getElementById("btnEditAdress");

window.onload = () => {
    loadClients();
};

async function loadClients() {

    selectedClient = null;

    btnEdit.disabled = true;
    btnDelete.disabled = true;
    btnAdress.disabled = true;
    btnEditAdress.disabled = true;

    // Ajustado para colspan="7" para alinhar perfeitamente com o novo HTML
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;padding:2rem;">
                Carregando...
            </td>
        </tr>
    `;

    try {

        const response = await fetch("list/", {
            method: "GET"
        });

        const data = await response.json();

        if (!data.sucess) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:2rem;">
                        Nenhum cliente encontrado.
                    </td>
                </tr>
            `;

            return;
        }

        renderClients(data.value);

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:2rem;">
                    Erro ao carregar clientes.
                </td>
            </tr>
        `;

    }

}

function renderClients(clients) {
    tableBody.innerHTML = "";

    if (!clients || clients.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:2rem;">
                    Nenhum cliente encontrado.
                </td>
            </tr>
        `;
        return;
    }

    clients.forEach(item => {
        const client = item.client;
        const adress = item.adress;

        // ==========================================
        // 1. LINHA DE DADOS DO CLIENTE
        // ==========================================
        const trClient = document.createElement("tr");
        trClient.style.cursor = "pointer";
        trClient.setAttribute("data-id", client.code);
        trClient.className = "client-row";

        trClient.innerHTML = `
            <td>${client.code}</td>
            <td>${client.name}</td>
            <td>${client.doc_type}</td>
            <td>${client.doc}</td>
            <td>${client.state_register || "-"}</td>
            <td>${client.contact}</td>
            <td>${client.email}</td>
        `;

        // ==========================================
        // 2. CABEÇALHO DO ENDEREÇO (Agora usando TD para não sumir)
        // ==========================================
        const trAddressHeader = document.createElement("tr");
        trAddressHeader.style.cursor = "pointer";
        trAddressHeader.setAttribute("data-id", client.code);
        trAddressHeader.className = "address-header-row";

        trAddressHeader.innerHTML = `
            <td class="inner-header">Cidade</td>
            <td class="inner-header">Bairro</td>
            <td class="inner-header">CEP</td>
            <td class="inner-header">Logradouro</td>
            <td class="inner-header">Número</td>
            <td class="inner-header" colspan="2">Tipo de Endereço</td>
        `;

        // ==========================================
        // 3. LINHA DE DADOS DO ENDEREÇO DESTE CLIENTE
        // ==========================================
        const trAddressData = document.createElement("tr");
        trAddressData.style.cursor = "pointer";
        trAddressData.setAttribute("data-id", client.code);
        trAddressData.className = "address-data-row";

        trAddressData.innerHTML = `
            <td>${adress ? adress.city : "-"}</td>
            <td>${adress ? adress.neig_b : "-"}</td>
            <td>${adress ? adress.code_zone : "-"}</td>
            <td>${adress ? adress.people_place : "-"}</td>
            <td>${adress ? adress.number : "-"}</td>
            <td colspan="2">${adress ? adress.type : "-"}</td>
        `;

        // ==========================================
        // LÓGICA DE SELEÇÃO UNIFICADA
        // ==========================================
        const handleSelect = () => {
            document.querySelectorAll("#clientsTableBody tr")
                .forEach(row => row.classList.remove("selected-row"));

            document.querySelectorAll(`#clientsTableBody tr[data-id="${client.code}"]`)
                .forEach(row => row.classList.add("selected-row"));

            selectedClient = client.code;
            btnEdit.disabled = false;
            btnDelete.disabled = false;
            btnAdress.disabled = false;
            btnEditAdress.disabled = false;
        };

        trClient.onclick = handleSelect;
        trAddressHeader.onclick = handleSelect;
        trAddressData.onclick = handleSelect;

        // Injeta as 3 linhas no HTML
        tableBody.appendChild(trClient);
        tableBody.appendChild(trAddressHeader);
        tableBody.appendChild(trAddressData);
    });
}

async function filterClients() {

    const code = document.getElementById("filterCode").value.trim();
    const name = document.getElementById("filterName").value.trim();

    if (!code && !name) {
        loadClients();
        return;
    }

    selectedClient = null;

    btnEdit.disabled = true;
    btnDelete.disabled = true;
    btnAdress.disabled = true;
    btnEditAdress.disabled = true;

    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;padding:2rem;">
                Pesquisando...
            </td>
        </tr>
    `;

    try {

        const response = await fetch("search/", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                code_client: code,
                name: name,
                doc: ""
            })

        });

        const data = await response.json();

        if (!data.sucess) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:2rem;">
                        Nenhum cliente encontrado.
                    </td>
                </tr>
            `;

            showToast(
                Array.isArray(data.mensage)
                    ? data.mensage.join("<br>")
                    : data.mensage,
                false
            );

            return;

        }

        if (Array.isArray(data.value)) {
            renderClients(data.value);
        } else {
            renderClients([data.value]);
        }

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:2rem;">
                    Erro ao consultar clientes.
                </td>
            </tr>
        `;

        showToast("Erro interno ao consultar clientes.", false);

    }

}

function clearFilters() {

    document.getElementById("filterCode").value = "";
    document.getElementById("filterName").value = "";

    loadClients();

}

function goToEdit() {

    if (!selectedClient)
        return;

    sessionStorage.setItem(
        "editClientCode",
        selectedClient
    );

    window.location.href = "client/edit/";

}

function goToAdressRegister() {

    if (!selectedClient)
        return;

    sessionStorage.setItem(
        "adressClientCode",
        selectedClient
    );

    window.location.href = "adress/register/";

}

function goToAdressEdit() {

    if (!selectedClient)
        return;

    sessionStorage.setItem(
        "adressClientCode",
        selectedClient
    );

    window.location.href = "adress/edit/";

}

document
    .getElementById("filterCode")
    .addEventListener("keypress", function (event) {

        if (event.key === "Enter")
            filterClients();

    });

document
    .getElementById("filterName")
    .addEventListener("keypress", function (event) {

        if (event.key === "Enter")
            filterClients();

    });

const securityModal = document.getElementById("securityModal");
const confirmInput = document.getElementById("confirmInput");
const btnConfirmAction = document.getElementById("btnConfirmAction");

function openDeleteModal() {

    if (!selectedClient)
        return;

    confirmInput.value = "";
    btnConfirmAction.disabled = true;

    securityModal.style.display = "flex";

}

function closeModal() {

    securityModal.style.display = "none";
    confirmInput.value = "";
    btnConfirmAction.disabled = true;

}

confirmInput.addEventListener("input", function () {

    btnConfirmAction.disabled =
        confirmInput.value.trim().toLowerCase() !== "confirmar";

});

btnConfirmAction.addEventListener("click", async function () {

    if (!selectedClient)
        return;

    try {

        const response = await fetch("delete/", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                code_client: selectedClient
            })

        });

        const data = await response.json();

        if (data.sucess) {

            showToast(
                data.mensage || "Cliente excluído com sucesso.",
                true
            );

            closeModal();

            selectedClient = null;

            btnEdit.disabled = true;
            btnDelete.disabled = true;
            btnAdress.disabled = true;
            btnEditAdress.disabled = true;

            loadClients();

            return;
        }

        showToast(
            Array.isArray(data.mensage)
                ? data.mensage.join("<br>")
                : data.mensage,
            false
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Erro interno ao excluir cliente.",
            false
        );

    }

});

window.onclick = function (event) {

    if (event.target === securityModal)
        closeModal();

};

function showToast(message, success = true) {

    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");

    toast.className =
        success
            ? "toast toast-success"
            : "toast toast-error";

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

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);

}