//====================================================
// Top Plant V2
// operations_list.js
//====================================================

const OPERATIONS_URL = "/stock/operationsReturn/";

let operations = [];

//====================================================
// Inicialização
//====================================================

document.addEventListener("DOMContentLoaded", () => {
    loadOperations();
});

//====================================================
// Função Auxiliar: Converte YYYY-MM-DD para DD/MM/YYYY
//====================================================
function formatDateToBR(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-"); // Divide [YYYY, MM, DD]
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // Retorna DD/MM/YYYY
    }
    return dateStr;
}

//====================================================
// Consulta operações
//====================================================

async function loadOperations(){

    const stockCode =
        document.getElementById("filterStockCode").value.trim();

    const productCode =
        document.getElementById("filterProductCode").value.trim();

    const start =
        document.getElementById("filterStartDate").value;

    const end =
        document.getElementById("filterEndDate").value;

    const body = {};

    if(stockCode !== "")
        body.stock_code = stockCode;

    if(productCode !== "")
        body.code_product = productCode;

    if(start !== "" && end !== ""){
        // O Front converte para DD/MM/YYYY antes de mandar para o Back
        body.time_interval = {
            start: formatDateToBR(start),
            end: formatDateToBR(end)
        };
    }

    try{

        const response = await fetch(OPERATIONS_URL,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(body)

        });

        const data = await response.json();

        if(!data.sucess){

            operations=[];

            renderOperations();

            if(Array.isArray(data.mensage)){

                data.mensage.forEach(msg=>showToast(msg,"error"));

            }else{

                showToast(data.mensage,"error");

            }

            return;

        }

        operations = data.value || [];

        renderOperations();

    }

    catch(error){

        console.error(error);

        showToast(
            "Erro ao comunicar com o servidor.",
            "error"
        );

    }

}

//====================================================
// Renderização
//====================================================
function renderOperations(){
    const tbody = document.getElementById("operationsTable");
    tbody.innerHTML = "";

    if(operations.length === 0){
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center">
                    Nenhuma operação encontrada.
                </td>
            </tr>
        `;
        return;
    }

    operations.forEach(operation => {
        tbody.innerHTML += `
            <tr>
                <td>${operation.stock_code}</td>
                <td>${operation.code_product}</td>
                <td>${operation.name_product}</td>
                <td>${operation.type_operation}</td>
                <td>${operation.value_before}</td>
                <td>${operation.value_after}</td>
                <td>${formatDateTimeBR(operation.date_operation)}</td>
            </tr>
        `;
    });
}

//====================================================
// Função Auxiliar: Converte ISO/Data Completa para PT-BR
//====================================================
function formatDateTimeBR(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    
    // O toLocaleString com 'pt-BR' já cuida de deixar no formato: DD/MM/YYYY HH:MM:SS
    return date.toLocaleString('pt-BR'); 
}

//====================================================
// Limpar filtros
//====================================================

function clearFilters(){

    document.getElementById("filterStockCode").value="";

    document.getElementById("filterProductCode").value="";

    document.getElementById("filterStartDate").value="";

    document.getElementById("filterEndDate").value="";

    loadOperations();

}

//====================================================
// Voltar
//====================================================

function backStock(){

    window.location.href="/stock/";

}

//====================================================
// Toast
//====================================================

function showToast(message,type){

    const container =
        document.getElementById("toastContainer");

    const toast =
        document.createElement("div");

    toast.className=`toast ${type}`;

    toast.innerText=message;

    container.appendChild(toast);

    setTimeout(()=>{

        toast.remove();

    },3000);

}