document.addEventListener('DOMContentLoaded', () => {
    const busLinesContainer = document.getElementById('busLinesContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const navLinks = document.querySelectorAll('header nav ul li a');

    let allBusLines = []; // Esta variável agora será preenchida pelos dados carregados
    let currentFilter = 'all';

    // Função para carregar os dados das linhas de ônibus
    async function loadBusLines() {
        try {
            // Caminho para o seu novo arquivo JSON (assumindo que está na mesma pasta do script.js e index.html)
            const response = await fetch('linhas.json'); 
            // Se você colocou o 'linhas.json' em uma pasta 'data', use: await fetch('./data/linhas.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // O JSON já tem os campos 'numero', 'nome' e 'tipo', então não precisamos mais do .map para adicionar 'type'
            allBusLines = await response.json();

            console.log('Dados carregados:', allBusLines); // Para depuração
            filterAndSearchBusLines(); // Renderiza as linhas após o carregamento
        } catch (error) {
            console.error('Erro ao carregar os dados das linhas de ônibus:', error);
            busLinesContainer.innerHTML = '<p>Erro ao carregar as linhas de ônibus. Por favor, tente novamente mais tarde.</p>';
        }
    }

    // Função para renderizar as linhas de ônibus
    function renderBusLines(lines) {
        busLinesContainer.innerHTML = ''; // Limpa o container
        if (lines.length === 0) {
            busLinesContainer.innerHTML = '<p>Nenhuma linha encontrada para o filtro ou busca atual.</p>';
            return;
        }
        lines.forEach(line => {
            const busCard = document.createElement('div');
            busCard.classList.add('bus-card');
            busCard.innerHTML = `
                <h4>Linha: ${line.numero}</h4> {/* Usando 'numero' para o número da linha */}
                <p><strong>Nome:</strong> ${line.nome || 'N/A'}</p> {/* Usando 'nome' para o nome da linha */}
                <p class="type">Tipo: ${line.tipo || 'N/A'}</p> {/* Usando 'tipo' para o tipo de linha */}
                `;
            busLinesContainer.appendChild(busCard);
        });
    }

    // Função para filtrar e buscar as linhas
    function filterAndSearchBusLines() {
        let filteredLines = allBusLines;

        // Aplica o filtro de tipo (agora usamos line.tipo e convertemos para minúsculas)
        if (currentFilter !== 'all') {
            filteredLines = filteredLines.filter(line => line.tipo.toLowerCase() === currentFilter);
        }

        // Aplica a busca por texto
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredLines = filteredLines.filter(line =>
                // Pesquisamos AGORA pelo número (numero) OU pelo nome da linha (nome)
                String(line.numero).toLowerCase().includes(searchTerm) ||
                String(line.nome).toLowerCase().includes(searchTerm)
            );
        }

        renderBusLines(filteredLines);
    }

    // Event Listeners para os botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter; // 'conventional' ou 'metropolitan'
            filterAndSearchBusLines();
        });
    });

    // Event Listener para o botão de busca
    searchButton.addEventListener('click', filterAndSearchBusLines);

    // Event Listener para a busca ao digitar
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            filterAndSearchBusLines();
        } else if (searchInput.value.length === 0) {
            // Quando a busca é limpa, filtra e renderiza com o filtro atual
            filterAndSearchBusLines();
        } else {
            // Pesquisa em tempo real se a string tiver 2 ou mais caracteres,
            // ou se estiver apagando caracteres.
            if (searchInput.value.length >= 2 || event.key === 'Backspace' || event.key === 'Delete') {
                filterAndSearchBusLines();
            }
        }
    });

    // Event Listener para os links de navegação (para filtrar)
    navLinks.forEach(link => {
        if (link.dataset.busType) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const type = link.dataset.busType; // 'conventional' ou 'metropolitan'
                filterButtons.forEach(btn => {
                    if (btn.dataset.filter === type) {
                        btn.click(); // Simula o clique no botão de filtro correspondente
                    }
                });
            });
        }
    });

    // Inicia o carregamento dos dados quando a página é carregada
    loadBusLines();
});
