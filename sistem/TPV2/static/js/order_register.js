let snapshots = [];
let selectedSnapshot = null;
let orderItems = [];
let selectedClient = null;

const snapshotsTable =
    document.getElementById("snapshotsTableBody");

const orderTable =
    document.getElementById("orderItemsTableBody");

window.onload = () => {

    loadSnapshots();

};

async function loadSnapshots() {

    selectedSnapshot = null;

    snapshotsTable.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;padding:2rem;">
                Carregando produtos...
            </td>
        </tr>
    `;

    try {

        const response = await fetch("snapshot/list/", {

            method: "GET"

        });

        const data = await response.json();

        if (!data.sucess) {

            snapshotsTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:2rem;">
                        Nenhum snapshot encontrado.
                    </td>
                </tr>
            `;

            showToast(data.mensage, false);

            return;

        }

        snapshots = data.value;

        renderSnapshots(snapshots);

    } catch (error) {

        console.error(error);

        snapshotsTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:2rem;">
                    Erro ao carregar snapshots.
                </td>
            </tr>
        `;

        showToast(
            "Erro interno ao carregar produtos.",
            false
        );

    }

}

function renderSnapshots(list) {

    snapshotsTable.innerHTML = "";

    if (!list || list.length === 0) {

        snapshotsTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:2rem;">
                    Nenhum produto encontrado.
                </td>
            </tr>
        `;

        return;

    }

    list.forEach(snapshot => {

        const tr = document.createElement("tr");

        tr.style.cursor = "pointer";

        tr.innerHTML = `
            <td>${snapshot.product_code}</td>
            <td>${snapshot.product_code_name}</td>
            <td>R$ ${Number(snapshot.price).toFixed(2)}</td>
            <td>R$ ${Number(snapshot.discount).toFixed(2)}</td>
            <td>${(Number(snapshot.price)-Number(snapshot.discount)).toFixed(2)}</td>
        `;

        tr.onclick = () => {

            document
                .querySelectorAll("#snapshotsTableBody tr")
                .forEach(row => row.classList.remove("selected-row"));

            tr.classList.add("selected-row");

            selectedSnapshot = snapshot;

        };

        snapshotsTable.appendChild(tr);

    });

}

async function searchTarget() {

    const target =
        parseFloat(
            document
                .getElementById("targetPrice")
                .value
        );

    if (isNaN(target) || target <= 0) {

        loadSnapshots();

        return;

    }

    snapshotsTable.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;padding:2rem;">
                Calculando melhor combinação...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            "snapshot/ordenated_by_target/",
            {

                method: "POST",

                headers: {
                    "Content-Type":"application/json"
                },

                body: JSON.stringify({

                    price_target: target

                })

            }
        );

        const data = await response.json();

        if (!data.sucess) {

            snapshotsTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:2rem;">
                        Nenhum resultado encontrado.
                    </td>
                </tr>
            `;

            showToast(data.mensage, false);

            return;

        }

        snapshots = data.value;

        renderSnapshots(snapshots);

    } catch (error) {

        console.error(error);

        showToast(
            "Erro ao calcular meta.",
            false
        );

    }

}

function clearTarget() {

    document
        .getElementById("targetPrice")
        .value = "";

    loadSnapshots();

}

function renderOrderItems() {

    orderTable.innerHTML = "";

    if (orderItems.length === 0) {

        orderTable.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:2rem;">
                    Nenhum item adicionado.
                </td>
            </tr>
        `;

        return;

    }

        orderItems.forEach((item, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.product_code}</td>
            <td>${item.product_name}</td>
            <td>${item.amount}</td>
            <td>R$ ${Number(item.price).toFixed(2)}</td>
            <td>R$ ${Number(item.discount).toFixed(2)}</td>
            <td>
                <button
                    class="btn btn-danger"
                    style="padding:.3rem .7rem;"
                    onclick="removeItem(${index})">

                    Remover

                </button>
            </td>
        `;

        orderTable.appendChild(tr);

    });

    document.getElementById("totalItems").innerText =
        orderItems.length;

}

function addItem() {

    if (!selectedSnapshot) {

        showToast(
            "Selecione um produto.",
            false
        );

        return;

    }

    const amount = parseInt(

        document
            .getElementById("itemAmount")
            .value

    );

    if (isNaN(amount) || amount <= 0) {

        showToast(
            "Quantidade inválida.",
            false
        );

        return;

    }

    const exists = orderItems.find(item =>
        item.product_code === selectedSnapshot.product_code
    );

    if (exists) {

        exists.amount += amount;

    } else {

        orderItems.push({

            product_code:
                selectedSnapshot.product_code,

            product_name:
                selectedSnapshot.product_code_name,

            amount: amount,

            price:
                Number(selectedSnapshot.price),

            discount:
                Number(selectedSnapshot.discount)

        });

    }

    renderOrderItems();

    document
        .getElementById("itemAmount")
        .value = "";

}

function removeItem(index) {

    orderItems.splice(index, 1);

    renderOrderItems();

}

function changeAmount(index, amount) {

    amount = parseInt(amount);

    if (isNaN(amount) || amount <= 0)
        return;

    orderItems[index].amount = amount;

    renderOrderItems();

}

async function searchClient() {

    const code =

        document
            .getElementById("clientCode")
            .value
            .trim();

    if (!code) {

        selectedClient = null;

        document
            .getElementById("clientName")
            .value = "";

        return;

    }

    try {

        const response = await fetch(

            "client/search/",

            {

                method: "POST",

                headers: {
                    "Content-Type":"application/json"
                },

                body: JSON.stringify({

                    code_client: code,
                    name: "",
                    doc: ""

                })

            }

        );

        const data = await response.json();

        if (!data.sucess) {

            selectedClient = null;

            document
                .getElementById("clientName")
                .value = "";

            showToast(
                data.mensage,
                false
            );

            return;

        }

        selectedClient = data.value.client;

        document
            .getElementById("clientName")
            .value =
                selectedClient.name;

    } catch (error) {

        console.error(error);

        showToast(
            "Erro ao localizar cliente.",
            false
        );

    }

}

function nextStep() {

    if (!selectedClient) {

        showToast(
            "Selecione um cliente válido.",
            false
        );

        return;

    }

    if (orderItems.length === 0) {

        showToast(
            "Adicione pelo menos um item ao pedido.",
            false
        );

        return;

    }

    sessionStorage.setItem(

        "newOrder",

        JSON.stringify({

            client: selectedClient,
            items: orderItems

        })

    );

    window.location.href = "confirm/";

}

function clearOrder() {

    selectedSnapshot = null;
    selectedClient = null;
    orderItems = [];

    document
        .getElementById("clientCode")
        .value = "";

    document
        .getElementById("clientName")
        .value = "";

    document
        .getElementById("itemAmount")
        .value = "";

    document
        .getElementById("targetPrice")
        .value = "";

    document
        .querySelectorAll("#snapshotsTableBody tr")
        .forEach(row => row.classList.remove("selected-row"));

    renderOrderItems();

    loadSnapshots();

}

document
    .getElementById("clientCode")
    .addEventListener("keypress", function (event) {

        if (event.key === "Enter")
            searchClient();

    });

document
    .getElementById("targetPrice")
    .addEventListener("keypress", function (event) {

        if (event.key === "Enter")
            searchTarget();

    });

document
    .getElementById("itemAmount")
    .addEventListener("keypress", function (event) {

        if (event.key === "Enter")
            addItem();

    });

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