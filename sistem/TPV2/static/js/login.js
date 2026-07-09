document.addEventListener("DOMContentLoaded", () => {
    // Dá foco no campo de nome assim que a página carrega
    document.getElementById('loginName').focus();

    // Permite fazer login apertando 'Enter' no campo de senha
    document.getElementById('loginPassword').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            executeLogin();
        }
    });
});

// ==================== SISTEMA DE NOTIFICAÇÕES ====================
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

// ==================== LIMPEZA DE ERROS ====================
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.style.display = 'none';
        msg.innerText = '';
    });

    document.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('input-error');
    });
}

// ==================== MOSTRAR ERRO NO CAMPO ====================
function showFieldError(fieldId, errorId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(errorId);

    if (input && errorSpan) {
        input.classList.add('input-error');
        errorSpan.innerText = message;
        errorSpan.style.display = 'block';
    }
}

// ==================== AÇÃO DE LOGIN ====================
async function executeLogin() {
    clearErrors();

    const nameInput = document.getElementById('loginName').value.trim();
    const passwordInput = document.getElementById('loginPassword').value.trim();

    let hasFrontError = false;

    // Validação de Front-End
    if (!nameInput) {
        showFieldError('loginName', 'errName', 'O nome é obrigatório.');
        hasFrontError = true;
    }
    
    if (!passwordInput) {
        showFieldError('loginPassword', 'errPassword', 'A senha é obrigatória.');
        hasFrontError = true;
    }

    if (hasFrontError) {
        return;
    }

    // Requisição para a API de Login
    try {
        // ATENÇÃO: Ajuste a rota '/api/login/' para a URL real de autenticação do seu back-end Django
        const response = await fetch('/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: nameInput, 
                password: passwordInput 
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Login realizado com sucesso!", 'success');
            
            // Redireciona para a Home / Listagem após sucesso
            setTimeout(() => {
                window.location.href = '/product/list/';
            }, 1000);

        } else {
            // Tratamento de erros vindos do Back-End
            let errorList = data.menssage || data.mensage || "Credenciais inválidas.";
            
            if (Array.isArray(errorList)) {
                errorList.forEach(err => {
                    let errLower = err.toLowerCase();
                    
                    if (errLower.includes('nome') || errLower.includes('name') || errLower.includes('funcionário')) {
                        showFieldError('loginName', 'errName', err);
                    } else if (errLower.includes('senha') || errLower.includes('password')) {
                        showFieldError('loginPassword', 'errPassword', err);
                    } else {
                        showToast(err, 'error');
                    }
                });
            } else {
                // Caso seja uma string simples (Ex: "Usuário ou senha incorretos")
                showToast(errorList, 'error');
                
                // Em erros genéricos de login, é comum limpar a senha e dar foco nela novamente
                document.getElementById('loginPassword').value = '';
                document.getElementById('loginPassword').focus();
            }
        }
    } catch (error) {
        showToast("Erro de conexão ao tentar fazer login.", 'error');
    }
}