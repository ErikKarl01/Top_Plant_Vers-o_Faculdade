let orderData = null;

const tableBody = document.getElementById("itemsTableBody"); // Ajustado para bater com o ID do HTML

window.onload = () => {
    const stored = sessionStorage.getItem("newOrder");

    if (!stored) {
        showToast("Nenhum pedido encontrado.", false);
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
    // Usando .value pois no HTML são tags <input>
    document.getElementById("clientCode").value = orderData.client.code || "-";
    document.getElementById("clientName").value = orderData.client.name || "Cliente não identificado";
}

function renderItems() {
    tableBody.innerHTML = "";

    if (!orderData.items || orderData.items.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:2rem;">
                    Nenhum item informado.
                </td>
            </tr>
        `;
        return;
    }

    orderData.items.forEach(item => {
        const tr = document.createElement("tr");

        const total = (Number(item.price) - Number(item.discount)) * Number(item.amount);

        tr.innerHTML = `
            <td>${item.product_name}</td>
            <td>${item.product_code}</td>
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
        const response = await fetch("/total_order/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                items: orderData.items
            })
        });

        const data = await response.json();

        if (!data.sucess) {
            showToast(
                Array.isArray(data.mensage) ? data.mensage.join("<br>") : data.mensage,
                false
            );
            return;
        }

        renderTotals(data.value);

    } catch (error) {
        console.error(error);
        showToast("Erro ao calcular o valor do pedido.", false);
    }
}

function renderTotals(totalData) {
    // Usando .value pois no HTML agora são tags <input>
    document.getElementById("totalProducts").value = totalData.total_products ?? orderData.items.length;
    
    document.getElementById("totalAmount").value = totalData.total_amount ?? orderData.items.reduce(
        (sum, item) => sum + Number(item.amount), 0
    );

    document.getElementById("subtotalValue").value = "R$ " + Number(totalData.subtotal || 0).toFixed(2);
    document.getElementById("discountValue").value = "R$ " + Number(totalData.discount || 0).toFixed(2);
    document.getElementById("totalValue").value = "R$ " + Number(totalData.total || 0).toFixed(2);
}

async function confirmOrder() {
    try {
        const response = await fetch("/order/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code_client: orderData.client.code,
                items: orderData.items
            })
        });

        const data = await response.json();

        if (data.sucess) {
            showToast(data.mensage || "Pedido criado com sucesso.", true);
            sessionStorage.removeItem("newOrder");
            
            setTimeout(() => {
                window.location.href = "../";
            }, 1500);
            return;
        }

        showToast(
            Array.isArray(data.mensage) ? data.mensage.join("<br>") : data.mensage,
            false
        );

    } catch (error) {
        console.error(error);
        showToast("Erro ao registrar pedido.", false);
    }
}

function cancelOrder() {
    window.location.href = "../register/";
}

function showToast(message, success = true) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");

    toast.className = success ? "toast toast-success" : "toast toast-error";

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