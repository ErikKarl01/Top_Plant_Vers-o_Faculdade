let originalClientCode = "";

document.addEventListener("DOMContentLoaded", () => {

    originalClientCode =
        sessionStorage.getItem("editClientCode");

    if (originalClientCode) {

        loadClient(originalClientCode);

    } else {

        showToast(
            "Nenhum cliente selecionado para edição.",
            "error"
        );

        setTimeout(() => {

            window.location.href = "/client/";

        }, 1500);

    }

});

function showToast(message, type = "error") {

    const container =
        document.getElementById("toastContainer");

    const toast =
        document.createElement("div");

    toast.className = `toast ${type}`;

    if (Array.isArray(message)) {

        toast.innerHTML = message.join("<br>");

    } else {

        toast.innerText =
            message || "Erro inesperado.";

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

    document
        .querySelectorAll(".error-message")
        .forEach(span => {

            span.innerText = "";
            span.style.display = "none";

        });

    document
        .querySelectorAll(".form-control")
        .forEach(input => {

            input.classList.remove("input-error");

        });

}

function showFieldError(fieldId, errorId, message) {

    const field =
        document.getElementById(fieldId);

    const error =
        document.getElementById(errorId);

    if (!field || !error)
        return;

    field.classList.add("input-error");

    error.innerText = message;

    error.style.display = "block";

}

async function loadClient(code) {
    try {
        // CORREÇÃO: "voltar duas pastas" para achar a raiz do app onde está o search/
        const response = await fetch("../../search/", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code_client: code,
                name: "",
                doc: ""
            })
        });

        const data = await response.json();

        if (!response.ok || !data.sucess) {
            showToast(data.mensage || "Cliente não encontrado.");
            return;
        }

        const client = data.value.client;

        document.getElementById("editCode").value = client.code || "";
        document.getElementById("editName").value = client.name || "";
        document.getElementById("editDocType").value = client.doc_type || "";
        document.getElementById("editDoc").value = client.doc || "";
        document.getElementById("editContact").value = client.contact || "";
        document.getElementById("editEmail").value = client.email || "";
        document.getElementById("editStateRegister").value = client.state_register || "";

    } catch {
        showToast("Falha ao carregar os dados do cliente.");
    }
}


async function updateClient(event) {
    
    if (event) {
        event.preventDefault(); 
    }

    try {
        document.querySelectorAll('.error-message').forEach(el => { el.style.display = 'none'; });
        document.querySelectorAll('.form-control').forEach(el => { el.classList.remove('input-error'); });

        let safeOriginalCode = sessionStorage.getItem("editClientCode");
        
        // Verifica se a variável global existe antes de tentar acessá-la para não quebrar
        if (!safeOriginalCode && typeof originalClientCode !== "undefined") {
            safeOriginalCode = originalClientCode;
        }

        if (!safeOriginalCode) {
            console.error("ERRO: Código do cliente não encontrado.");
            alert("Erro: Código do cliente não encontrado na memória da tela.");
            return;
        }

        const payload = {
            code_client: isNaN(safeOriginalCode) ? safeOriginalCode.trim() : Number(safeOriginalCode),
            client: {
                code: document.getElementById("editCode").value.trim(),
                name: document.getElementById("editName").value.trim(),
                doc_type: document.getElementById("editDocType").value.trim(),
                doc: document.getElementById("editDoc").value.trim(),
                contact: document.getElementById("editContact").value.trim(),
                email: document.getElementById("editEmail").value.trim(),
                state_register: document.getElementById("editStateRegister").value.trim()
            },
            adress: {}
        };
        console.log("Payload montado:", payload);
        const response = await fetch("../../modifyClient/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log("Resposta do backend recebida:", data);

        if (data.sucess === true || data.sucess === "True" || data.sucess === "true") {
            alert(data.mensage || "Cliente atualizado com sucesso!");
            
            sessionStorage.removeItem("editClientCode");

            setTimeout(() => {
                window.location.href = "/client/";
            }, 1000);
            return; 
        }

        const errors = data.mensage;
        if (errors && typeof errors === "object" && !Array.isArray(errors)) {
            const fieldsMap = {
                mens_code: { input: "editCode", err: "errCode" },
                mens_name: { input: "editName", err: "errName" },
                mens_doc: { input: "editDoc", err: "errDoc" },
                mens_doc_type: { input: "editDocType", err: "errDocType" },
                mens_contact: { input: "editContact", err: "errContact" },
                mens_email: { input: "editEmail", err: "errEmail" },
                mens_state_register: { input: "editStateRegister", err: "errStateRegister" }
            };

            for (const key in errors) {
                if (fieldsMap[key] && errors[key]) {
                    const inputEl = document.getElementById(fieldsMap[key].input);
                    const errEl = document.getElementById(fieldsMap[key].err);
                    if (inputEl && errEl) {
                        inputEl.classList.add("input-error");
                        errEl.innerText = errors[key];
                        errEl.style.display = "block";
                    }
                }
            }
        } else {
            alert(typeof errors === "string" ? errors : "Erro ao processar retorno.");
        }

    } catch (error) {
        console.error("ERRO CRÍTICO NO JAVASCRIPT:", error);
        alert("O JS quebrou. Olhe o console.");
    }
}