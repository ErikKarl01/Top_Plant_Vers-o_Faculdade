let currentClientCode = "";

document.addEventListener("DOMContentLoaded", () => {

    currentClientCode = sessionStorage.getItem("adressClientCode");

    if (!currentClientCode) {

        showToast("Nenhum cliente selecionado.", "error");

        setTimeout(() => {
            window.location.href = "/client/";
        }, 1500);

        return;
    }

    loadClient();

});

function showToast(message, type = "error") {

    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    if (Array.isArray(message))
        toast.innerHTML = message.join("<br>");
    else
        toast.innerText = message || "Erro inesperado.";

    container.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";

        setTimeout(() => toast.remove(), 300);

    }, 4000);

}

function clearErrors() {

    document.querySelectorAll(".error-message").forEach(error => {

        error.innerText = "";
        error.style.display = "none";

    });

    document.querySelectorAll(".form-control").forEach(input => {

        input.classList.remove("input-error");

    });

}

function showFieldError(fieldId, errorId, message) {

    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);

    if (!field || !error)
        return;

    field.classList.add("input-error");
    error.innerText = message;
    error.style.display = "block";

}

async function loadClient() {

    try {

        const response = await fetch("/client/search/", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                code_client: currentClientCode
            })

        });

        const data = await response.json();

        if (!data.sucess) {

            showToast(data.mensage, "error");

            setTimeout(() => {
                window.location.href = "/client/";
            }, 1500);

            return;
        }

        document.getElementById("clientCode").value =
            data.value.client.code;

        document.getElementById("clientName").value =
            data.value.client.name;

    }

    catch {

        showToast(
            "Erro ao recuperar os dados do cliente.",
            "error"
        );

    }

}

async function submitAdress() {

    clearErrors();

    const payload = {

        code_client: currentClientCode,

        adress: {

            code_zone:
                document.getElementById("regCodeZone").value,

            city:
                document.getElementById("regCity").value,

            people_place:
                document.getElementById("regPeoplePlace").value,

            neig_b:
                document.getElementById("regNeigB").value,

            number:
                document.getElementById("regNumber").value,

            type:
                document.getElementById("regType").value

        }

    };

    try {

        const response = await fetch("/client/save-adress/", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)

        });

        const data = await response.json();

        if (data.sucess) {

            showToast(data.mensage, "success");

            sessionStorage.removeItem("adressClientCode");

            setTimeout(() => {

                window.location.href = "/client/";

            }, 1500);

            return;

        }

        const errorSource = data.mensage;

        if (
            errorSource &&
            typeof errorSource === "object" &&
            !Array.isArray(errorSource)
        ) {

            if (errorSource.mens_code_zone)
                showFieldError(
                    "regCodeZone",
                    "errCodeZone",
                    errorSource.mens_code_zone
                );

            if (errorSource.mens_city)
                showFieldError(
                    "regCity",
                    "errCity",
                    errorSource.mens_city
                );

            if (errorSource.mens_people_place)
                showFieldError(
                    "regPeoplePlace",
                    "errPeoplePlace",
                    errorSource.mens_people_place
                );

            if (errorSource.mens_neig_b)
                showFieldError(
                    "regNeigB",
                    "errNeigB",
                    errorSource.mens_neig_b
                );

            if (errorSource.mens_number)
                showFieldError(
                    "regNumber",
                    "errNumber",
                    errorSource.mens_number
                );

            if (errorSource.mens_type)
                showFieldError(
                    "regType",
                    "errType",
                    errorSource.mens_type
                );

        }
        else {

            showToast(errorSource, "error");

        }

    }

    catch {

        showToast(
            "Erro de comunicação com o servidor.",
            "error"
        );

    }

}