//====================================================
// Top Plant V2
// stock_list.js
//====================================================

const STOCK_URL = "/stock/stockReturnForCategory/";
const ADD_URL = "/stock/addAmount/";
const REMOVE_URL = "/stock/removeAmount/";

let hortStock = [];
let ornStock = [];

let selectedOperation = "";
let selectedProduct = null;

//====================================================
// Inicialização
//====================================================

document.addEventListener("DOMContentLoaded", async () => {

    await loadStock("Hortaliças");
    await loadStock("Ornamentais");

});

//====================================================
// Carrega estoque da categoria
//====================================================

async function loadStock(category) {
    try {
        // Dispara duas requisições ao mesmo tempo: uma para True e outra para False
        const [resLicensed, resNotLicensed] = await Promise.all([
            fetch(STOCK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: category, products_licensed: true })
            }),
            fetch(STOCK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: category, products_licensed: false })
            })
        ]);

        const dataLicensed = await resLicensed.json();
        const dataNotLicensed = await resNotLicensed.json();

        let combinedItems = [];

        // Se encontrou produtos licenciados, adiciona na nossa lista combinada
        if (dataLicensed.sucess && dataLicensed.value && dataLicensed.value.items) {
            combinedItems = combinedItems.concat(dataLicensed.value.items);
        }

        // Se encontrou produtos NÃO licenciados, adiciona na mesma lista
        if (dataNotLicensed.sucess && dataNotLicensed.value && dataNotLicensed.value.items) {
            combinedItems = combinedItems.concat(dataNotLicensed.value.items);
        }

        // Se os DOIS estoques não existirem, aí sim mostramos o erro original do back-end
        if (!dataLicensed.sucess && !dataNotLicensed.sucess) {
            const mensagensErro = dataLicensed.mensage || dataNotLicensed.mensage;
            
            if (Array.isArray(mensagensErro)) {
                mensagensErro.forEach(msg => showToast(msg, "error"));
            } else if (mensagensErro) {
                showToast(mensagensErro, "error");
            }
        }

        // Agora salvamos a lista combinada na variável global certa e renderizamos
        if (category === "Hortaliças") {
            hortStock = combinedItems;
            renderTable(hortStock, "tableHort");
        } else {
            ornStock = combinedItems;
            renderTable(ornStock, "tableOrn");
        }

    } catch (error) {
        console.error(error);
        showToast("Erro ao comunicar com o servidor.", "error");
    }
}

//====================================================
// Renderiza tabela
//====================================================

function renderTable(stock,idTable){

    const tbody=document.getElementById(idTable);

    tbody.innerHTML="";

    if(!Array.isArray(stock) || stock.length===0){

        tbody.innerHTML=`

            <tr>

                <td colspan="5"
                    style="text-align:center">

                    Nenhum produto encontrado.

                </td>

            </tr>

        `;

        return;

    }

    stock.forEach(item=>{

        tbody.innerHTML+=`

            <tr>

                <td>${item.product_code}</td>

                <td>${item.product_name}</td>

                <td>

                    ${
                        item.licensed

                        ?

                        '<span class="badge badge-success">Sim</span>'

                        :

                        '<span class="badge badge-warning">Não</span>'
                    }

                </td>

                <td>

                    <strong>

                        ${item.amount}

                    </strong>

                </td>

                <td>

                    <div
                        style="display:flex;gap:.5rem">

                        <button
                            class="btn btn-positive btn-small"
                            onclick="openAddModal('${item.product_code}','${item.product_name}')">

                            + Quantidade

                        </button>

                        <button
                            class="btn btn-danger btn-small"
                            onclick="openRemoveModal('${item.product_code}','${item.product_name}')">

                            - Quantidade

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });

}

//====================================================
// Filtros
//====================================================

function filterStock(category){

    const isHort = category === "Hortaliças";

    const code = (
        isHort
            ? document.getElementById("filterCodeH")
            : document.getElementById("filterCodeO")
    ).value.trim().toLowerCase();

    const name = (
        isHort
            ? document.getElementById("filterNameH")
            : document.getElementById("filterNameO")
    ).value.trim().toLowerCase();

    const source = isHort ? hortStock : ornStock;

    const filtered = source.filter(item => {

        return (

            item.product_code.toLowerCase().includes(code)

            &&

            item.product_name.toLowerCase().includes(name)

        );

    });

    renderTable(
        filtered,
        isHort ? "tableHort" : "tableOrn"
    );

}

//====================================================
// Modal
//====================================================

function openAddModal(code,name){

    selectedOperation = "add";

    selectedProduct = code;

    document.getElementById("modalTitle").innerText =
        "Adicionar quantidade";

    document.getElementById("modalDescription").innerText =
        `Produto: ${name}`;

    document.getElementById("amountInput").value="";

    document
        .getElementById("amountModal")
        .classList
        .add("active");

}

function openRemoveModal(code,name){

    selectedOperation = "remove";

    selectedProduct = code;

    document.getElementById("modalTitle").innerText =
        "Remover quantidade";

    document.getElementById("modalDescription").innerText =
        `Produto: ${name}`;

    document.getElementById("amountInput").value="";

    document
        .getElementById("amountModal")
        .classList
        .add("active");

}

function closeModal(){

    document
        .getElementById("amountModal")
        .classList
        .remove("active");

}

//====================================================
// Confirma operação 
//====================================================

document
    .getElementById("confirmButton")
    .addEventListener("click",confirmOperation);

async function confirmOperation(){

    const amount = parseInt(

        document.getElementById("amountInput").value

    );

    if(isNaN(amount) || amount<=0){

        showToast(
            "Informe uma quantidade válida.",
            "error"
        );

        return;

    }

    const url =

        selectedOperation==="add"

        ?

        ADD_URL

        :

        REMOVE_URL;

    try{

        const response = await fetch(url,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                code_product:selectedProduct,

                amount:amount

            })

        });

        const data = await response.json();

        if(data.sucess){

            showToast(data.mensage,"success");

            closeModal();

            await loadStock("Hortaliças");

            await loadStock("Ornamentais");

        }

        else{

            if(Array.isArray(data.mensage)){

                data.mensage.forEach(msg=>{

                    showToast(msg,"error");

                });

            }

            else{

                showToast(data.mensage,"error");

            }

        }

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
// Toast
//====================================================

function showToast(message,type){

    const container = document.getElementById(

        "toastContainer"

    );

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(()=>{

        toast.remove();

    },3000);

}