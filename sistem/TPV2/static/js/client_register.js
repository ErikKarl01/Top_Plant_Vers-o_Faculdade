// ==========================================
// 1. FUNÇÕES AUXILIARES DE INTERFACE (UI)
// ==========================================

function clearErrors() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.classList.remove('input-error');
    });

    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
        msg.textContent = '';
        msg.style.display = 'none';
    });
}

function showFieldError(inputId, errorSpanId, message) {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(errorSpanId);

    if (input) {
        input.classList.add('input-error');
    }
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (toastContainer) {
        toastContainer.textContent = message;
        toastContainer.style.display = 'block';
        
        if (type === 'error') {
            toastContainer.style.backgroundColor = 'var(--color-danger, #dc3545)';
        } else {
            toastContainer.style.backgroundColor = 'var(--color-positive, #28a745)';
        }
        toastContainer.style.color = '#fff';
        toastContainer.style.padding = '1rem';
        toastContainer.style.borderRadius = '8px';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';

        setTimeout(() => {
            toastContainer.style.display = 'none';
        }, 3000);
    } else {
        alert(message);
    }
}

// ==========================================
// 2. FUNÇÃO PRINCIPAL DE CADASTRO
// ==========================================
async function submitClient() {
    clearErrors();

    const payload = {
        client: {
            code: document.getElementById('regCode').value,
            name: document.getElementById('regName').value,
            doc_type: document.getElementById('regDocType').value,
            doc: document.getElementById('regDoc').value,
            contact: document.getElementById('regContact').value,
            email: document.getElementById('regEmail').value,
            state_register: document.getElementById('regStateRegister').value
        }
    };

    try {
        const response = await fetch('/client/save-client/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.sucess) {
            showToast(data.mensage, 'success');

            setTimeout(() => {
                window.location.href = '/client/';
            }, 1500);

            return;
        }

        const errorSource = data.mensage;

        // --- CORREÇÃO AQUI: Tratando a lista de erros do backend ---
        if (Array.isArray(errorSource)) {
            errorSource.forEach(err => {
                const lowerErr = String(err).toLowerCase();
                
                // Direciona o erro de email para o input de email
                if (lowerErr.includes('email') || lowerErr.includes('e-mail')) {
                    showFieldError('regEmail', 'errEmail', err);
                } 
                // Direciona o erro de contato para o input de contato
                else if (lowerErr.includes('contato') || lowerErr.includes('número') || lowerErr.includes('telefone') || lowerErr.includes('contact')) {
                    showFieldError('regContact', 'errContact', err);
                } 
                // Caso apareça outro tipo de erro na lista, exibe no Toast individualmente
                else {
                    showToast(err, 'error');
                }
            });
        } 
        // Se for um dicionário de validações padrão do DTO
        else if (
            errorSource &&
            typeof errorSource === 'object'
        ) {
            if (errorSource.mens_code)
                showFieldError('regCode', 'errCode', errorSource.mens_code);

            if (errorSource.mens_name)
                showFieldError('regName', 'errName', errorSource.mens_name);

            if (errorSource.mens_doc_type)
                showFieldError('regDocType', 'errDocType', errorSource.mens_doc_type);

            if (errorSource.mens_doc)
                showFieldError('regDoc', 'errDoc', errorSource.mens_doc);

            if (errorSource.mens_contact)
                showFieldError('regContact', 'errContact', errorSource.mens_contact);

            if (errorSource.mens_email)
                showFieldError('regEmail', 'errEmail', errorSource.mens_email);

            if (errorSource.mens_state_register)
                showFieldError(
                    'regStateRegister',
                    'errStateRegister',
                    errorSource.mens_state_register
                );
        } 
        // Se for uma string de erro genérica
        else {
            showToast(errorSource, 'error');
        }

    } catch (error) {
        console.error("Erro na requisição:", error);
        showToast("Erro de comunicação com o servidor.", "error");
    }
}