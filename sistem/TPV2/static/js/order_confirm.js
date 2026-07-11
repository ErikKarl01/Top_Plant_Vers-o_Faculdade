let orderData = null;

const tableBody =
    document.getElementById("orderItemsTableBody");

window.onload = () => {

    const stored =
        sessionStorage.getItem("newOrder");

    if (!stored) {

        showToast(
            "Nenhum pedido encontrado.",
            false
        );

        setTimeout(() => {

            window.location.href = "../register/";

        }, 1500);

        return;

    }

    orderData = JSON.parse(stored);

    renderClient();

    renderItems();

    calculateTotal();

};

function renderClient() {

    document.getElementById("clientCode").innerText =
        orderData.client.code;

    document.getElementById("clientName").innerText =
        orderData.client.name;

}

function renderItems() {

    tableBody.innerHTML = "";

    if (orderData.items.length === 0) {

        tableBody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    style="text-align:center;padding:2rem;">

                    Nenhum item informado.

                </td>

            </tr>
        `;

        return;

    }

    orderData.items.forEach(item => {

        const tr = document.createElement("tr");

        const total =
            (Number(item.price) - Number(item.discount))
            * Number(item.amount);

        tr.innerHTML = `

            <td>${item.product_code}</td>

            <td>${item.product_name}</td>

            <td>${item.amount}</td>

            <td>R$ ${Number(item.price).toFixed(2)}</td>

            <td>R$ ${Number(item.discount).toFixed(2)}</td>

            <td>R$ ${total.toFixed(2)}</td>

        `;

        tableBody.appendChild(tr);

    });

}

async function calculateTotal() {

    try {

        const response = await fetch(

            "total_order/",

            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    items: orderData.items

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

        renderTotals(data.value);

    } catch (error) {

        console.error(error);

        showToast(

            "Erro ao calcular o valor do pedido.",

            false

        );

    }

}

function renderTotals(totalData) {

    document.getElementById("totalProducts").innerText =
        totalData.total_products ?? orderData.items.length;

    document.getElementById("totalAmount").innerText =
        totalData.total_amount ?? orderData.items.reduce(

            (sum, item) => sum + Number(item.amount),

            0

        );

    document.getElementById("subtotalValue").innerText =
        "R$ " + Number(totalData.subtotal).toFixed(2);

    document.getElementById("discountValue").innerText =
        "R$ " + Number(totalData.discount).toFixed(2);

    document.getElementById("totalValue").innerText =
        "R$ " + Number(totalData.total).toFixed(2);

}

async function confirmOrder() {

    try {

        const response = await fetch(

            "order/create/",

            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    code_client: orderData.client.code,

                    items: orderData.items

                })

            }

        );

        const data = await response.json();

        if (data.sucess) {

            showToast(

                data.mensage ||
                "Pedido criado com sucesso.",

                true

            );

            sessionStorage.removeItem("newOrder");

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

            "Erro ao registrar pedido.",

            false

        );

    }

}

function cancelOrder() {

    window.location.href = "../register/";

}

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

window.onload = () => {

    loadOrder();

};