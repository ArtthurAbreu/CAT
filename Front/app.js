const apiBaseUrl = "https://rb2j9yyqeg.execute-api.us-east-1.amazonaws.com/prod/catuser";

// Função para obter o próximo ID sequencial
function obterProximoId() {
    const ultimoId = localStorage.getItem('ultimoId');
    const proximoId = ultimoId ? parseInt(ultimoId) + 1 : 1;
    localStorage.setItem('ultimoId', proximoId);
    return proximoId;
}

// Função para carregar os servidores
async function carregarServidores() {
    try {
        const response = await fetch(apiBaseUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar servidores: ${response.status}`);
        }

        const servidores = await response.json();
        const tabelaServidores = document.querySelector('#servidores-table tbody');
        tabelaServidores.innerHTML = '';

        servidores.forEach((servidor) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${servidor.id}</td>
                <td>${servidor.nome}</td>
                <td>${servidor.nomeCargo}</td>
                <td>${servidor.nomeSetor}</td>
                <td>
                 <button class="btn btn-warning btn-sm" onclick="editarServidor(${servidor.id})">
                        <i class="bi bi-pencil"></i> 
                    </button>
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
            const response = await fetch(`${apiBaseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert("Servidor excluído com sucesso!");
                carregarServidores();
            } else {
                alert("Erro ao excluir servidor");
            }
        } catch (error) {
            console.error('Erro ao excluir servidor:', error);
        }
    }
}
async function editarServidor(id) {
    const response = await fetch(`${apiBaseUrl}/${id}`);
    const servidor = await response.json();

    // Preenche o formulário com os dados do servidor
    document.getElementById('nome').value = servidor.nome;
    document.getElementById('cargo').value = servidor.nomeCargo;
    document.getElementById('setor').value = servidor.nomeSetor;

    // Mude o comportamento do botão de cadastro para atualizar
    const form = document.getElementById('servidor-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await atualizarServidor(id);
    };
}

async function atualizarServidor(id) {
    const nome = document.getElementById('nome').value.trim();
    const nomeCargo = document.getElementById('cargo').value.trim();
    const nomeSetor = document.getElementById('setor').value.trim();

    if (!nome || !nomeCargo || !nomeSetor) {
        alert("Todos os campos são obrigatórios!");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, nome, nomeCargo, nomeSetor })
        });

        if (response.ok) {
            alert("Servidor atualizado com sucesso!");
            carregarServidores(); // Recarrega a lista de servidores
        } else {
            const errorDetails = await response.text();
            console.error('Erro detalhado ao atualizar servidor:', errorDetails);
            alert(`Erro ao atualizar servidor: ${errorDetails}`);
        }
    } catch (error) {
        console.error('Erro ao atualizar servidor:', error);
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

    const nome = document.getElementById('nome').value.trim();
    const nomeCargo = document.getElementById('cargo').value.trim();
    const nomeSetor = document.getElementById('setor').value.trim();
    const id = obterProximoId(); // Obter um novo ID sequencial

    if (!nome || !nomeCargo || !nomeSetor) {
        alert("Todos os campos são obrigatórios!");
        return;
    }

    console.log("Dados enviados para API:", { id, nome, nomeCargo, nomeSetor });

    try {
        const response = await fetch(apiBaseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, nome, nomeCargo, nomeSetor })
        });

        if (response.ok) {
            alert("Servidor cadastrado com sucesso!");
            carregarServidores();
        } else {
            const errorDetails = await response.text(); // Captura a mensagem detalhada de erro
            console.error('Erro detalhado ao cadastrar servidor:', errorDetails);
            alert(`Erro ao cadastrar servidor: ${errorDetails}`);
        }
    } catch (error) {
        console.error('Erro ao cadastrar servidor:', error);
    }
});

// Função para carregar e exibir as avaliações no relatório
async function carregarAvaliacoes() {
    try {
        const response = await fetch(`${apiBaseUrl}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar avaliações: ${response.status}`);
        }

        const avaliacoes = await response.json();
        const tabelaAvaliacoes = document.querySelector('#avaliacoes-table tbody');
        tabelaAvaliacoes.innerHTML = '';

        avaliacoes.forEach((avaliacao) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${avaliacao.id}</td>
                <td>${avaliacao.nome}</td>
                <td>${avaliacao.nota}</td>
                <td>${avaliacao.comentario}</td>
            `;
            tabelaAvaliacoes.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
    }
}
// Função para avaliar um servidor
document.getElementById('avaliacao-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const servidorId = document.getElementById('servidor-select').value;
    const nota = document.getElementById('nota').value;
    const comentarios = document.getElementById('comentario').value;

    if (!servidorId || !nota) {
        alert("Todos os campos são obrigatórios!");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                servidorId,
                nota,
                comentarios
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ao cadastrar avaliação: ${response.status}`);
        }

        const novaAvaliacao = await response.json();
        alert("Avaliação cadastrada com sucesso!");
        carregarAvaliacoes(); // Atualiza a tabela de avaliações
    } catch (error) {
        console.error('Erro ao cadastrar avaliação:', error);
        alert("Erro ao cadastrar avaliação. Verifique o console para mais detalhes.");
    }
});

window.onload = function() {
    carregarServidores();
    carregarAvaliacoes();
};






// async function carregarServidores() {
//     try {
//         // Faz uma requisição para buscar os servidores
//         const response = await fetch('http://localhost:3000/servidores');
//         const servidores = await response.json();

//         // Seleciona a tabela de servidores
//         const tabelaServidores = document.querySelector('#servidores-table tbody');

//         tabelaServidores.innerHTML = '';

//         // Preenche a tabela com os servidores
//         servidores.forEach((servidor) => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${servidor.id}</td>
//                 <td>${servidor.nome}</td>
//                 <td>${servidor.cargo}</td>
//                 <td>${servidor.setor}</td>
//                 <td>
//                     <button class="btn btn-danger btn-sm" onclick="excluirServidor(${servidor.id})">
//                         <i class="bi bi-trash"></i>
//                     </button>
//                 </td>
//             `;
//             tabelaServidores.appendChild(row);
//         });

//         carregarServidoresParaAvaliacao(servidores);
//     } catch (error) {
//         console.error('Erro ao carregar servidores:', error);
//     }
// }

// // Função para excluir servidores
// async function excluirServidor(id) {
//     if (confirm('Tem certeza que deseja excluir este servidor?')) {
//         try {
//             const response = await fetch(`http://localhost:3000/servidores/${id}`, {
//                 method: 'DELETE'
//             });

//             if (response.ok) {
//                 alert("Servidor excluído com sucesso!");
//                 carregarServidores(); // Recarrega a lista de servidores
//             } else {
//                 alert("Erro ao excluir servidor");
//             }
//         } catch (error) {
//             console.error('Erro ao excluir servidor:', error);
//         }
//     }
// }


// // Função para preencher o dropdown de servidores no formulário de avaliação
// function carregarServidoresParaAvaliacao(servidores) {
//     const selectServidor = document.getElementById('servidor-select');
    
//     selectServidor.innerHTML = '<option value="">Selecione um servidor</option>';

//     servidores.forEach((servidor) => {
//         const option = document.createElement('option');
//         option.value = servidor.id;
//         option.textContent = servidor.nome;
//         selectServidor.appendChild(option);
//     });
// }

// // Função para cadastrar servidores
// document.getElementById('servidor-form').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const nome = document.getElementById('nome').value;
//     const cargo = document.getElementById('cargo').value;
//     const setor = document.getElementById('setor').value;

//     try {
//         const response = await fetch('http://localhost:3000/servidores', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ nome, cargo, setor })
//         });
//         const novoServidor = await response.json();

//         // Recarrega a lista de servidores após o cadastro
//         carregarServidores();
//     } catch (error) {
//         console.error('Erro ao cadastrar servidor:', error);
//     }
// });

// // Função para cadastrar avaliações
// document.getElementById('avaliacao-form').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const servidorId = document.getElementById('servidor-select').value;
//     const nota = document.getElementById('nota').value;
//     const comentarios = document.getElementById('comentarios').value;

//     if (!servidorId) {
//         alert("Selecione um servidor para avaliar");
//         return;
//     }

//     try {
//         const response = await fetch('http://localhost:3000/avaliacoes', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ servidorId, nota, comentarios })
//         });

//         if (response.ok) {
//             alert("Avaliação cadastrada com sucesso!");
//             carregarAvaliacoes(); 
//         } else {
//             alert("Erro ao cadastrar avaliação");
//         }
//     } catch (error) {
//         console.error('Erro ao cadastrar avaliação:', error);
//     }
// });

// // Função para carregar e exibir as avaliações no relatório
// async function carregarAvaliacoes() {
//     try {
//         const response = await fetch('http://localhost:3000/avaliacoes');
//         const avaliacoes = await response.json();

//         console.log(avaliacoes); // Para verificar o que está sendo retornado

//         const tabelaAvaliacoes = document.querySelector('#avaliacoes-table tbody');
//         tabelaAvaliacoes.innerHTML = '';

//         avaliacoes.forEach((avaliacao) => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${avaliacao.id}</td>
//                 <td>${avaliacao.servidor_nome}</td>
//                 <td>${avaliacao.nota}</td>
//                 <td>${avaliacao.comentarios}</td>
//             `;
//             tabelaAvaliacoes.appendChild(row);
//         });
//     } catch (error) {
//         console.error('Erro ao carregar avaliações:', error);
//     }
// }

// window.onload = function() {
//     carregarServidores();
//     carregarAvaliacoes(); 
// };
// Função para login
// document.getElementById('login-form').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;

//     try {
//         const response = await fetch('http://localhost:3000/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, password })
//         });

//         if (response.ok) {
//             const data = await response.json();
            
//             // Salvar dados do usuário no localStorage ou cookies
//             localStorage.setItem('user', JSON.stringify(data.user));
            
//             // Redirecionar para a página principal
//             window.location.href = 'index.html';
//         } else {
//             const error = await response.json();
//             document.getElementById('error-message').textContent = error.error;
//         }
//     } catch (err) {
//         console.error('Erro ao efetuar login:', err);
//         document.getElementById('error-message').textContent = 'Erro ao efetuar login';
//     }
// });

// // Verificar se o usuário está autenticado
// function checkAuthentication() {
//     const user = localStorage.getItem('user');
//     if (!user) {
//         // Se não houver usuário, redireciona para a página de login
//         window.location.href = 'login.html';
//     }
// }

