document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('regCode').focus();
});

function showToast(message, type = 'error') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    if (Array.isArray(message)) {
        toast.innerHTML = message.join('<br>');
    } else {
        toast.innerText = message || 'Ocorreu um erro inesperado.';
    }

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.style.display = 'none';
        msg.innerText = '';
    });
    document.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('input-error');
    });
}

function showFieldError(fieldId, errorId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(errorId);
    if (input && errorSpan) {
        input.classList.add('input-error');
        errorSpan.innerText = message;
        errorSpan.style.display = 'block';
    }
}

async function submitProduct() {
    clearErrors();

    const rawPrice = document.getElementById('regPrice').value;
    const numericPrice = rawPrice ? parseFloat(rawPrice) : 0;

    // Payload estruturado exatamente de acordo com o seu ProductDTO
    const payload = {
        product: {
            code: document.getElementById('regCode').value,
            name: document.getElementById('regName').value,
            type: document.getElementById('regType').value,
            measure: document.getElementById('regMeasure').value,
            price: numericPrice,
            licensed: document.getElementById('regLicensed').value === 'true',
            description: document.getElementById('regDesc').value
        }
    };

    try {
        const response = await fetch('/product/save/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();

        if (response.ok) {
            showToast(data.mensage || "Produto cadastrado com sucesso!", 'success');
            setTimeout(() => {
                window.location.href = '/product/';
            }, 1500);
        } else {
            // Captura o nó de erro enviado pelo seu self.response.erroMens
            const errorSource = data.menssage || data.mensage;

            // Tratamento estrito para o DICIONÁRIO vindo do seu forRegister
            if (errorSource && typeof errorSource === 'object' && !Array.isArray(errorSource)) {
                if (errorSource.mens_code) showFieldError('regCode', 'errCode', errorSource.mens_code);
                if (errorSource.mens_name) showFieldError('regName', 'errName', errorSource.mens_name);
                if (errorSource.mens_type) showFieldError('regType', 'errType', errorSource.mens_type);
                if (errorSource.mens_measure) showFieldError('regMeasure', 'errMeasure', errorSource.mens_measure);
                if (errorSource.mens_price) showFieldError('regPrice', 'errPrice', errorSource.mens_price);
                if (errorSource.mens_licenced) showFieldError('regLicensed', 'errLicensed', errorSource.mens_licenced);
                if (errorSource.mens_description) showFieldError('regDesc', 'errDesc', errorSource.mens_description);
            } else {
                // Caso o erro seja uma string única (ex: PRODUCT_ALREADY_EXISTS) ou lista de exceptions
                showToast(errorSource, 'error');
            }
        }
    } catch (error) {
        showToast("Erro de conexão ao comunicar com o servidor.", 'error');
    }
}