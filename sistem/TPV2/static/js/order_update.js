let currentOrderCode = null;
let orderItems = [];
let selectedItem = null;

const tableBody =
    document.getElementById("orderItemsTableBody");

window.onload = () => {

    currentOrderCode =
        sessionStorage.getItem("updateOrderCode");

    if (!currentOrderCode) {

        showToast(
            "Nenhum pedido selecionado.",
            false
        );

        setTimeout(() => {

            window.location.href = "../";

        }, 1500);

        return;

    }

    loadOrder();

};

async function loadOrder() {

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;padding:2rem;">
                Carregando...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(

            "order/get/",

            {

                method: "POST",

                headers: {
                    "Content-Type":"application/json"
                },

                body: JSON.stringify({

                    code_order: currentOrderCode

                })

            }

        );

        const data = await response.json();

        if (!data.sucess) {

            showToast(

                Array.isArray(data.mensage)
                    ? data.mensage.join("<br>")
                    : data.mensage,

                false

            );

            return;

        }

        document.getElementById("orderCode").value =
            data.value.order.code;

        document.getElementById("clientCode").value =
            data.value.order.client_code;

        document.getElementById("clientName").value =
            data.value.order.client_name;

        document.getElementById("orderStatus").value =
            data.value.order.status;

        orderItems = data.value.items;

        renderItems();

    } catch (error) {

        console.error(error);

        showToast(
            "Erro ao carregar pedido.",
            false
        );

    }

}

function renderItems() {

    tableBody.innerHTML = "";

    if (!orderItems || orderItems.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:2rem;">
                    Nenhum item encontrado.
                </td>
            </tr>
        `;

        return;

    }

    orderItems.forEach(item => {

        const tr = document.createElement("tr");

        tr.style.cursor = "pointer";

        tr.innerHTML = `

            <td>${item.product_code}</td>

            <td>${item.product_name}</td>

            <td>${item.amount}</td>

            <td>R$ ${Number(item.price).toFixed(2)}</td>

            <td>R$ ${Number(item.discount).toFixed(2)}</td>

            <td>
                R$ ${((Number(item.price)-Number(item.discount))*Number(item.amount)).toFixed(2)}
            </td>

        `;

        tr.onclick = () => {

            document
                .querySelectorAll("#orderItemsTableBody tr")
                .forEach(row => row.classList.remove("selected-row"));

            tr.classList.add("selected-row");

            selectedItem = item;

            document.getElementById("selectedProduct").value =
                item.product_name;

            document.getElementById("currentAmount").value =
                item.amount;

            document.getElementById("removeAmount").value = "";

        };

        tableBody.appendChild(tr);

    });

}

let itemsToDiscount = [];

function addUpdate() {

    if (!selectedItem) {

        showToast(
            "Selecione um item do pedido.",
            false
        );

        return;

    }

    const amount = parseInt(

        document
            .getElementById("removeAmount")
            .value

    );

    if (isNaN(amount) || amount <= 0) {

        showToast(
            "Quantidade inválida.",
            false
        );

        return;

    }

    if (amount > Number(selectedItem.amount)) {

        showToast(
            "Quantidade maior que a existente no pedido.",
            false
        );

        return;

    }

    const exists = itemsToDiscount.find(item =>
        item.code_product === selectedItem.product_code
    );

    if (exists) {

        exists.provided += amount;

    } else {

        itemsToDiscount.push({

            code_product: selectedItem.product_code,

            provided: amount

        });

    }

    updatePreview();

    document.getElementById("removeAmount").value = "";

}

function updatePreview() {

    orderItems.forEach(item => {

        const update = itemsToDiscount.find(i =>
            i.code_product === item.product_code
        );

        if (!update) {

            item.new_amount = item.amount;

            return;

        }

        item.new_amount =
            Number(item.amount) - Number(update.provided);

    });

    renderPreview();

}

function renderPreview() {

    tableBody.innerHTML = "";

    orderItems.forEach(item => {

        const tr = document.createElement("tr");

        const changed =
            item.new_amount !== undefined &&
            Number(item.new_amount) !== Number(item.amount);

        tr.innerHTML = `

            <td>${item.product_code}</td>

            <td>${item.product_name}</td>

            <td>${item.amount}</td>

            <td>

                ${changed
                    ? `<strong style="color:var(--color-danger)">
                        ${item.new_amount}
                       </strong>`
                    : item.amount}

            </td>

            <td>

                R$ ${Number(item.price).toFixed(2)}

            </td>

            <td>

                R$ ${Number(item.discount).toFixed(2)}

            </td>

        `;

        tr.style.cursor = "pointer";

        tr.onclick = () => {

            document
                .querySelectorAll("#orderItemsTableBody tr")
                .forEach(row => row.classList.remove("selected-row"));

            tr.classList.add("selected-row");

            selectedItem = item;

            document.getElementById("selectedProduct").value =
                item.product_name;

            document.getElementById("currentAmount").value =
                item.amount;

            document.getElementById("removeAmount").value = "";

        };

        tableBody.appendChild(tr);

    });

}

async function updateOrder() {

    if (itemsToDiscount.length === 0) {

        showToast(
            "Nenhuma alteração foi realizada.",
            false
        );

        return;

    }

    try {

        const response = await fetch(

            "order/update/",

            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    code_order: currentOrderCode,

                    items_to_discount: itemsToDiscount

                })

            }

        );

        const data = await response.json();

        if (data.sucess) {

            showToast(

                data.mensage ||
                "Pedido atualizado com sucesso.",

                true

            );

            sessionStorage.removeItem(
                "updateOrderCode"
            );

            setTimeout(() => {

                window.location.href = "../";

            }, 1500);

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
            "Erro ao atualizar pedido.",
            false
        );

    }

}

function cancelUpdate() {

    sessionStorage.removeItem(
        "updateOrderCode"
    );

    window.location.href = "../";

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

        toast.innerHTML =
            message.join("<br>");

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