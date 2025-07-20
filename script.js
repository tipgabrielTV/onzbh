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
            // Carrega linhas convencionais
            const conventionalResponse = await fetch('./data/tempo_real_convencional_json_200725121153.json');
            if (!conventionalResponse.ok) {
                throw new Error(`HTTP error! status: ${conventionalResponse.status}`);
            }
            const conventionalLines = await conventionalResponse.json();

            // Para um site completo, você faria o mesmo para linhas metropolitanas
            // Exemplo:
            // const metropolitanResponse = await fetch('./data/linhas_metropolitanas.json');
            // const metropolitanLines = await metropolitanResponse.json();
            // allBusLines = [...conventionalLines, ...metropolitanLines];

            allBusLines = conventionalLines; // Por enquanto, só as convencionais

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
                <h4>${line.id} - ${line.name}</h4>
                <p><strong>Rota:</strong> ${line.route || 'Rota não disponível'}</p>
                <p class="type">Tipo: ${line.type === 'metropolitan' ? 'Metropolitana' : 'Convencional'}</p>
                ${line.status ? `<p><strong>Status:</strong> <span class="bus-status status-${line.status.toLowerCase()}">${line.status}</span></p>` : ''}
                ${line.last_update ? `<p class="last-update">Última atualização: ${new Date(line.last_update).toLocaleString('pt-BR')}</p>` : ''}
            `;
            busLinesContainer.appendChild(busCard);
        });
    }

    // Função para filtrar e buscar as linhas
    function filterAndSearchBusLines() {
        let filteredLines = allBusLines;

        // Aplica o filtro de tipo
        if (currentFilter !== 'all') {
            filteredLines = filteredLines.filter(line => line.type === currentFilter);
        }

        // Aplica a busca por texto
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredLines = filteredLines.filter(line =>
                line.id.toLowerCase().includes(searchTerm) ||
                line.name.toLowerCase().includes(searchTerm) ||
                (line.route && line.route.toLowerCase().includes(searchTerm))
            );
        }

        renderBusLines(filteredLines);
    }

    // Event Listeners para os botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            filterAndSearchBusLines();
        });
    });

    // Event Listener para o botão de busca
    searchButton.addEventListener('click', filterAndSearchBusLines);

    // Event Listener para a busca ao digitar
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            filterAndSearchBusLines();
        } else if (searchInput.value.length === 0 && currentFilter === 'all') {
             renderBusLines(allBusLines);
        } else {
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
                const type = link.dataset.busType;
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