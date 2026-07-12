let currentClientCode = "";

document.addEventListener("DOMContentLoaded", () => {
    currentClientCode = sessionStorage.getItem("adressClientCode");

    if (currentClientCode) {
        loadAdress(currentClientCode);
    } else {
        showToast("Nenhum cliente selecionado.", "error");
        setTimeout(() => {
            window.location.href = "/client/";
        }, 1500);
    }
});

function showToast(message, type = "error") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    
    toast.className = `toast ${type}`;

    if (Array.isArray(message)) {
        toast.innerHTML = message.join("<br>");
    } else {
        toast.innerText = message || "Erro inesperado.";
    }

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

function clearErrors() {
    document.querySelectorAll(".error-message").forEach(span => {
        span.innerText = "";
        span.style.display = "none";
    });

    document.querySelectorAll(".form-control").forEach(input => {
        input.classList.remove("input-error");
    });
}

function showFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);

    if (!field || !error) return;

    field.classList.add("input-error");
    error.innerText = message;
    error.style.display = "block";
}

async function loadAdress(code) {
    try {
        const response = await fetch("/client/search/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code_client: code
            })
        });

        const data = await response.json();

        if (!response.ok || !data.sucess) {
            showToast(data.mensage || "Erro ao carregar os dados do cliente.");
            return;
        }

        // Preenche os dados de leitura do cliente
        const client = data.value.client;
        if (client) {
            document.getElementById("clientCode").value = client.code || "";
            document.getElementById("clientName").value = client.name || "";
        }

        // Verifica se o endereço existe e preenche os inputs editáveis
        const adress = data.value.adress;
        if (!adress) {
            showToast("Este cliente não possui endereço cadastrado.");
            return;
        }

        document.getElementById("editCodeZone").value = adress.code_zone || "";
        document.getElementById("editCity").value = adress.city || "";
        document.getElementById("editNeigB").value = adress.neig_b || "";
        document.getElementById("editNumber").value = adress.number || "";
        document.getElementById("editType").value = adress.type || "";
        document.getElementById("editPeoplePlace").value = adress.people_place || "";

    } catch (err) {
        console.error("Erro no loadAdress:", err);
        showToast("Falha ao recuperar dados do servidor.");
    }
}

async function updateAdress() {
    clearErrors();

    const payload = {
        code_client: currentClientCode,
        adress: {
            code_zone: document.getElementById("editCodeZone").value,
            city: document.getElementById("editCity").value,
            neig_b: document.getElementById("editNeigB").value,
            number: document.getElementById("editNumber").value,
            type: document.getElementById("editType").value,
            people_place: document.getElementById("editPeoplePlace").value
        }
    };

    try {
        const response = await fetch("/client/modifyAdress/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.sucess) {
            showToast(data.mensage || "Endereço atualizado com sucesso.", "success");
            
            sessionStorage.removeItem("adressClientCode");
            
            setTimeout(() => {
                window.location.href = "/client/";
            }, 1500);
            return;
        }

        const errors = data.mensage;

        if (errors && typeof errors === "object" && !Array.isArray(errors)) {
            if (errors.mens_code_zone) showFieldError("editCodeZone", "errCodeZone", errors.mens_code_zone);
            if (errors.mens_city) showFieldError("editCity", "errCity", errors.mens_city);
            if (errors.mens_neig_b) showFieldError("editNeigB", "errNeigB", errors.mens_neig_b);
            if (errors.mens_number) showFieldError("editNumber", "errNumber", errors.mens_number);
            if (errors.mens_type) showFieldError("editType", "errType", errors.mens_type);
            if (errors.mens_people_place) showFieldError("editPeoplePlace", "errPeoplePlace", errors.mens_people_place);
            return;
        }

        showToast(data.mensage || "Erro ao atualizar endereço.");

    } catch (err) {
        console.error("Erro no updateAdress:", err);
        showToast("Erro de comunicação com o servidor.");
    }
}