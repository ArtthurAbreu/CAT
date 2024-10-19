async function carregarServidores() {
    try {
        // Faz uma requisição para buscar os servidores
        const response = await fetch('http://localhost:3000/servidores');
        const servidores = await response.json();

        // Seleciona a tabela de servidores
        const tabelaServidores = document.querySelector('#servidores-table tbody');

        tabelaServidores.innerHTML = '';

        // Preenche a tabela com os servidores
        servidores.forEach((servidor) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${servidor.id}</td>
                <td>${servidor.nome}</td>
                <td>${servidor.cargo}</td>
                <td>${servidor.setor}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="excluirServidor(${servidor.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tabelaServidores.appendChild(row);
        });

        carregarServidoresParaAvaliacao(servidores);
    } catch (error) {
        console.error('Erro ao carregar servidores:', error);
    }
}

// Função para excluir servidores
async function excluirServidor(id) {
    if (confirm('Tem certeza que deseja excluir este servidor?')) {
        try {
            const response = await fetch(`http://localhost:3000/servidores/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Servidor excluído com sucesso!");
                carregarServidores(); // Recarrega a lista de servidores
            } else {
                alert("Erro ao excluir servidor");
            }
        } catch (error) {
            console.error('Erro ao excluir servidor:', error);
        }
    }
}


// Função para preencher o dropdown de servidores no formulário de avaliação
function carregarServidoresParaAvaliacao(servidores) {
    const selectServidor = document.getElementById('servidor-select');
    
    selectServidor.innerHTML = '<option value="">Selecione um servidor</option>';

    servidores.forEach((servidor) => {
        const option = document.createElement('option');
        option.value = servidor.id;
        option.textContent = servidor.nome;
        selectServidor.appendChild(option);
    });
}

// Função para cadastrar servidores
document.getElementById('servidor-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const cargo = document.getElementById('cargo').value;
    const setor = document.getElementById('setor').value;

    try {
        const response = await fetch('http://localhost:3000/servidores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, cargo, setor })
        });
        const novoServidor = await response.json();

        // Recarrega a lista de servidores após o cadastro
        carregarServidores();
    } catch (error) {
        console.error('Erro ao cadastrar servidor:', error);
    }
});

// Função para cadastrar avaliações
document.getElementById('avaliacao-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const servidorId = document.getElementById('servidor-select').value;
    const nota = document.getElementById('nota').value;
    const comentarios = document.getElementById('comentarios').value;

    if (!servidorId) {
        alert("Selecione um servidor para avaliar");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/avaliacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ servidorId, nota, comentarios })
        });

        if (response.ok) {
            alert("Avaliação cadastrada com sucesso!");
            carregarAvaliacoes(); 
        } else {
            alert("Erro ao cadastrar avaliação");
        }
    } catch (error) {
        console.error('Erro ao cadastrar avaliação:', error);
    }
});

// Função para carregar e exibir as avaliações no relatório
async function carregarAvaliacoes() {
    try {
        const response = await fetch('http://localhost:3000/avaliacoes');
        const avaliacoes = await response.json();

        console.log(avaliacoes); // Para verificar o que está sendo retornado

        const tabelaAvaliacoes = document.querySelector('#avaliacoes-table tbody');
        tabelaAvaliacoes.innerHTML = '';

        avaliacoes.forEach((avaliacao) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${avaliacao.id}</td>
                <td>${avaliacao.servidor_nome}</td>
                <td>${avaliacao.nota}</td>
                <td>${avaliacao.comentarios}</td>
            `;
            tabelaAvaliacoes.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
    }
}

window.onload = function() {
    carregarServidores();
    carregarAvaliacoes(); 
};
