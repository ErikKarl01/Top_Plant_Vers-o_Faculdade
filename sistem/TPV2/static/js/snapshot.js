let selectedSnapshot = null;

const tableBody = document.getElementById("snapshotsTableBody");

const editPanel = document.getElementById("editPanel");

const editCode = document.getElementById("editCode");
const editProduct = document.getElementById("editProduct");
const editPrice = document.getElementById("editPrice");
const editDiscount = document.getElementById("editDiscount");

window.onload = () => {

    loadSnapshots();

};

async function loadSnapshots() {

    selectedSnapshot = null;

    editPanel.style.display = "none";

    tableBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;padding:2rem;">
                Carregando snapshots...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            "snapshot/list/",
            {
                method: "GET"
            }
        );

        const data = await response.json();

        if (!data.sucess) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:2rem;">
                        Nenhum snapshot encontrado.
                    </td>
                </tr>
            `;

            return;

        }

        renderSnapshots(data.value);

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:2rem;">
                    Erro ao carregar snapshots.
                </td>
            </tr>
        `;

        showToast(
            "Erro interno ao carregar snapshots.",
            false
        );

    }

}

function renderSnapshots(list) {

    tableBody.innerHTML = "";

    if (!list || list.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:2rem;">
                    Nenhum snapshot encontrado.
                </td>
            </tr>
        `;

        return;

    }

    list.forEach(snapshot => {

        const tr = document.createElement("tr");

        tr.style.cursor = "pointer";

        tr.innerHTML = `
            <td>${snapshot.code}</td>
            <td>${snapshot.product_code}</td>
            <td>${snapshot.product_code_name}</td>
            <td>R$ ${Number(snapshot.price).toFixed(2)}</td>
            <td>R$ ${Number(snapshot.discount).toFixed(2)}</td>
        `;

        tr.onclick = () => {

            document
                .querySelectorAll("#snapshotsTableBody tr")
                .forEach(row => row.classList.remove("selected-row"));

            tr.classList.add("selected-row");

            selectedSnapshot = snapshot;

            fillEdition(snapshot);

        };

        tableBody.appendChild(tr);

    });

}

function fillEdition(snapshot) {

    editPanel.style.display = "block";

    editCode.value = snapshot.code;

    editProduct.value =
        `${snapshot.product_code} - ${snapshot.product_code_name}`;

    editPrice.value = snapshot.price;

    editDiscount.value = snapshot.discount;

    editPanel.scrollIntoView({

        behavior: "smooth",
        block: "start"

    });

}

function cancelEdition() {

    selectedSnapshot = null;

    editPanel.style.display = "none";

    document
        .querySelectorAll("#snapshotsTableBody tr")
        .forEach(row => row.classList.remove("selected-row"));

}

async function updateSnapshot() {

    if (!selectedSnapshot)
        return;

    const body = {

        code_snapshot: selectedSnapshot.code,

        price_product:
            editPrice.value.trim() === ""
                ? -1
                : parseFloat(editPrice.value),

        discount:
            editDiscount.value.trim() === ""
                ? 0
                : parseFloat(editDiscount.value)

    };

    try {

        const response = await fetch(

            "snapshot/update/",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(body)

            }

        );

        const data = await response.json();

        if (data.sucess) {

            showToast(

                data.mensage ||
                "Snapshot atualizado com sucesso.",

                true

            );

            cancelEdition();

            loadSnapshots();

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

            "Erro interno ao atualizar snapshot.",

            false

        );

    }

}

function showToast(message, success = true) {

    const container =
        document.getElementById("toastContainer");

    const toast =
        document.createElement("div");

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