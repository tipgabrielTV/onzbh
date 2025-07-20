document.addEventListener('DOMContentLoaded', () => {
    const busLinesContainer = document.getElementById('busLinesContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const navLinks = document.querySelectorAll('header nav ul li a');

    let allBusLines = [];
    let currentFilter = 'all';

    // Função para carregar os dados das linhas de ônibus
    async function loadBusLines() {
        try {
            const conventionalResponse = await fetch('./data/tempo_real_convencional_json_200725121153.json');
            if (!conventionalResponse.ok) {
                throw new Error(`HTTP error! status: ${conventionalResponse.status}`);
            }
            const conventionalLines = await conventionalResponse.json();

            // Atribuindo 'conventional' para o tipo, já que o JSON não o define
            allBusLines = conventionalLines.map(line => ({ ...line, type: 'conventional' }));

            console.log('Dados carregados:', allBusLines);
            filterAndSearchBusLines();
        } catch (error) {
            console.error('Erro ao carregar os dados das linhas de ônibus:', error);
            busLinesContainer.innerHTML = '<p>Erro ao carregar as linhas de ônibus. Por favor, tente novamente mais tarde.</p>';
        }
    }

    // Função para renderizar as linhas de ônibus
    function renderBusLines(lines) {
        busLinesContainer.innerHTML = '';
        if (lines.length === 0) {
            busLinesContainer.innerHTML = '<p>Nenhuma linha encontrada para o filtro ou busca atual.</p>';
            return;
        }
        lines.forEach(line => {
            // --- Lógica para formatar a data/hora (HR) de forma mais robusta ---
            let lastPositionDisplay = 'N/A';
            if (line.HR && typeof line.HR === 'string' && line.HR.length === 14) {
                try {
                    const year = parseInt(line.HR.substring(0, 4));
                    const month = parseInt(line.HR.substring(4, 6)) - 1; // Mês é 0-indexado
                    const day = parseInt(line.HR.substring(6, 8));
                    const hour = parseInt(line.HR.substring(8, 10));
                    const minute = parseInt(line.HR.substring(10, 12));
                    const second = parseInt(line.HR.substring(12, 14));
                    const date = new Date(year, month, day, hour, minute, second);

                    // Verifica se a data é válida (por exemplo, se não resultou em "Invalid Date")
                    if (!isNaN(date.getTime())) {
                        lastPositionDisplay = date.toLocaleString('pt-BR');
                    }
                } catch (e) {
                    console.error("Erro ao parsear data HR para linha NL:", line.NL, line.HR, e);
                    // lastPositionDisplay permanece 'N/A'
                }
            }
            // --- Fim da lógica de formatação de data/hora ---

            const busCard = document.createElement('div');
            busCard.classList.add('bus-card');
            busCard.innerHTML = `
                <h4>Linha: ${line.NL || 'N/A'}</h4> {/* NL deve sempre existir, mas para segurança */}
                <p><strong>Número do Veículo:</strong> ${line.NV || 'N/A'}</p>
                <p><strong>Latitude:</strong> ${line.LT || 'N/A'}</p>
                <p><strong>Longitude:</strong> ${line.LG || 'N/A'}</p>
                <p><strong>Última Posição:</strong> ${lastPositionDisplay}</p> {/* Usando a variável formatada */}
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

        if (currentFilter !== 'all') {
            filteredLines = filteredLines.filter(line => line.type === currentFilter);
        }

        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredLines = filteredLines.filter(line =>
                String(line.NL || '').toLowerCase().includes(searchTerm) // Adicionado || '' para NL
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
        } else if (searchInput.value.length === 0) {
            filterAndSearchBusLines();
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
                        btn.click();
                    }
                });
            });
        }
    });

    loadBusLines();
});