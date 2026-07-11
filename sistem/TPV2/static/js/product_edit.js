let currentProductCode = "";

document.addEventListener("DOMContentLoaded", () => {
    // Recupera o código que foi guardado na memória interna do navegador
    currentProductCode = sessionStorage.getItem('editProductCode');

    if (currentProductCode) {
        loadProductDetails(currentProductCode);
    } else {
        showToast("Nenhum produto selecionado para edição.", 'error');
        setTimeout(() => {
            window.location.href = '/product/';
        }, 1500);
    }
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

async function loadProductDetails(code) {
    try {
        const response = await fetch('/product/return/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code_product: code })
        });
        
        const data = await response.json();
        
        if (response.ok && data.sucess) {
            const prod = data.value;
            document.getElementById('editCode').value = prod.code || code;
            document.getElementById('editName').value = prod.name || '';
            // 1. Pega o valor do banco e força virar texto, sem espaços e tudo maiúsculo
            const bancoType = String(prod.type || '').trim().toUpperCase();
            
            // 2. Rastreador para vermos a verdade nua e crua no F12
            console.log("Tipo exato vindo do banco: [" + bancoType + "]");

            // 3. Seleção por aproximação (ignora se tem Ç ou se falta o S)
            const typeSelect = document.getElementById('editType');
            
            if (bancoType.includes('HORTALICA') || bancoType.includes('HORTALIÇA')) {
                typeSelect.value = 'Hortaliças';
            } else if (bancoType.includes('ORNAMENTA')) {
                typeSelect.value = 'Ornamentais';
            } else {
                // Se vier vazio ou um lixo qualquer, volta pro "Selecione..."
                typeSelect.value = ''; 
            }
            document.getElementById('editMeasure').value = prod.measure || '';
            document.getElementById('editLicensed').value = prod.licensed ? 'true' : 'false';
            document.getElementById('editDesc').value = prod.description || '';
        } else {
            showToast(data.menssage || data.mensage || "Não foi possível carregar o produto.", 'error');
        }
    } catch (error) {
        showToast("Falha ao conectar com o servidor para resgatar dados.", 'error');
    }
}

async function updateProduct() {
    clearErrors();

    // Pega o código que o usuário digitou no input (pode ser o mesmo ou um NOVO código)
    const newCode = document.getElementById('editCode').value;

    const payload = {
        // code_product: O CÓDIGO ORIGINAL USADO PARA BUSCAR NO BANCO
        code_product: currentProductCode, 
        
        // product: O DTO COMPLETO COM OS DADOS NOVOS
        product: {
            code: newCode, 
            name: document.getElementById('editName').value,
            price: 0, // Passado como 0 para satisfazer o DTO, ignorado pelo models.py
            description: document.getElementById('editDesc').value,
            type: document.getElementById('editType').value,
            measure: document.getElementById('editMeasure').value,
            licensed: document.getElementById('editLicensed').value === 'true'
        }
    };

    try {
        const response = await fetch('/product/update/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            showToast(data.mensage || "Alterações gravadas com sucesso!", 'success');
            sessionStorage.removeItem('editProductCode');
            setTimeout(() => {
                window.location.href = '/product/';
            }, 1500);
        } else {
            const errorSource = data.menssage || data.mensage;

            if (errorSource && typeof errorSource === 'object' && !Array.isArray(errorSource)) {
                if (errorSource.mens_code) showFieldError('editCode', 'errCode', errorSource.mens_code);
                if (errorSource.mens_name) showFieldError('editName', 'errName', errorSource.mens_name);
                if (errorSource.mens_type) showFieldError('editType', 'errType', errorSource.mens_type);
                if (errorSource.mens_measure) showFieldError('editMeasure', 'errMeasure', errorSource.mens_measure);
                if (errorSource.mens_licenced) showFieldError('editLicensed', 'errLicensed', errorSource.mens_licenced);
                if (errorSource.mens_description) showFieldError('editDesc', 'errDesc', errorSource.mens_description);
            } else {
                showToast(errorSource, 'error');
            }
        }
    } catch (error) {
        showToast("Falha crítica de comunicação com o servidor.", 'error');
    }
}