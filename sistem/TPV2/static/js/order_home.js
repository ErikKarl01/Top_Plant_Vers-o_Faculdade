let selectedOrder = null;

const tableBody = document.getElementById("ordersTableBody");

const btnUpdate = document.getElementById("btnUpdate");
const btnDelete = document.getElementById("btnDelete");

window.onload = () => {
    loadOrders();
};

async function loadOrders() {

    selectedOrder = null;

    btnUpdate.disabled = true;
    btnDelete.disabled = true;

    tableBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;padding:2rem;">
                Carregando...
            </td>
        </tr>
    `;

    try {

        const response = await fetch("order/return/", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                code_client: "",
                status: "",
                time_interval: {}

            })

        });

        const data = await response.json();

        if (
            !data.sucess ||
            !Array.isArray(data.value) ||
            data.value.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5"
                        style="text-align:center;padding:2rem;">
                        Nenhum pedido encontrado.
                    </td>
                </tr>
            `;

            return;

        }

        renderOrders(data.value);

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;padding:2rem;">
                    Erro ao carregar pedidos.
                </td>
            </tr>
        `;

    }

}

function renderOrders(orders) {

    tableBody.innerHTML = "";

    if (!orders.length) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;padding:2rem;">
                    Nenhum pedido encontrado.
                </td>
            </tr>
        `;

        return;

    }

    orders.forEach(orderData => {

        const order = orderData.order;

        const items = orderData.order_items || [];

        const wrapper = document.createElement("tr");

        wrapper.innerHTML = `
            <td colspan="5" class="order-wrapper">

                <table class="order-card">

                    <thead>

                        <tr class="order-header">

                            <th>Código</th>
                            <th>Cliente</th>
                            <th>Nome do Cliente</th>
                            <th>Data</th>
                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        <tr
                            class="order-row"
                            data-order="${order.code}">

                            <td><strong>${order.code}</strong></td>
                            <td>${order.client_code}</td>
                            <td>${order.client_name}</td>
                            <td>${order.date}</td>
                            <td>${order.status}</td>

                        </tr>

                    </tbody>

                </table>

                <table class="items-card">

                    <thead>

                        <tr class="items-header">

                            <th>Produto</th>
                            <th>Código</th>
                            <th>Quantidade</th>
                            <th>Preço</th>
                            <th>Desconto</th>

                        </tr>

                    </thead>

                    <tbody id="items_${order.code}">

                    </tbody>

                </table>

            </td>
        `;

        tableBody.appendChild(wrapper);

        const orderRow =
            wrapper.querySelector(".order-row");

        orderRow.onclick = () => {

            document
                .querySelectorAll(".order-row")
                .forEach(row =>
                    row.classList.remove("selected-row"));

            orderRow.classList.add("selected-row");

            selectedOrder = order.code;

            btnUpdate.disabled = false;
            btnDelete.disabled = false;

        };

        const itemsBody =
            wrapper.querySelector(`#items_${order.code}`);
                    const trItems = document.createElement("tr");

        trItems.innerHTML = `
            <td colspan="5" class="items-container">

                <table class="items-table">

                    <thead>

                        <tr class="items-header">

                            <th>Produto</th>
                            <th>Código</th>
                            <th>Quantidade</th>
                            <th>Preço</th>
                            <th>Desconto</th>

                        </tr>

                    </thead>

                    <tbody id="items_${order.code}"></tbody>

                </table>

            </td>
        `;

        tableBody.appendChild(trItems);

        const itemsBody = trItems.querySelector(
            `#items_${order.code}`
        );

        if (orderItems.length === 0) {

            itemsBody.innerHTML = `
                <tr>

                    <td
                        colspan="5"
                        style="
                            text-align:center;
                            padding:1rem;
                            color:#777;
                        ">

                        Nenhum item neste pedido.

                    </td>

                </tr>
            `;

        } else {

            orderItems.forEach(item => {

                const trItem = document.createElement("tr");

                trItem.innerHTML = `
                    <td>${item.product_name}</td>

                    <td>${item.product_code}</td>

                    <td style="text-align:center;">
                        ${item.amount}
                    </td>

                    <td style="text-align:right;">
                        R$ ${Number(item.price).toFixed(2)}
                    </td>

                    <td style="text-align:right;">
                        R$ ${Number(item.discount).toFixed(2)}
                    </td>
                `;

                itemsBody.appendChild(trItem);

            });

        }

        const separator = document.createElement("tr");

        separator.innerHTML = `
            <td
                colspan="5"
                style="
                    border:none;
                    padding:10px;
                    background:transparent;
                ">
            </td>
        `;

        tableBody.appendChild(separator);

    });

}