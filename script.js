document.addEventListener('DOMContentLoaded', () => {
    const busLinesContainer = document.getElementById('busLinesContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const navLinks = document.querySelectorAll('header nav ul li a');

    let allBusLines = []; // Esta variável agora será preenchida pelos dados carregados
    let currentFilter = 'all'; // Manteremos 'all' como padrão, mas os filtros de tipo podem não ter efeito total sem o campo 'type' no JSON

    // Função para carregar os dados das linhas de ônibus
    async function loadBusLines() {
        try {
            // Carrega linhas convencionais
            // Certifique-se de que o arquivo JSON está na pasta 'data' na raiz do seu projeto
            const conventionalResponse = await fetch('./data/tempo_real_convencional_json_200725121153.json');
            if (!conventionalResponse.ok) {
                throw new Error(`HTTP error! status: ${conventionalResponse.status}`);
            }
            const conventionalLines = await conventionalResponse.json();

            // O JSON fornecido parece ser apenas para linhas 'convencionais' e não tem um campo 'type'.
            // Para fins de demonstração, vamos atribuir 'conventional' a todas elas.
            // Se você tiver um JSON de metropolitanas, precisará carregar e combinar.
            allBusLines = conventionalLines.map(line => ({ ...line, type: 'conventional' }));


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
                <h4>Linha: ${line.NL}</h4> {/* Usando NL para o número da linha */}
                <p><strong>Número do Veículo:</strong> ${line.NV || 'N/A'}</p> {/* Exemplo de outro campo disponível */}
                <p><strong>Latitude:</strong> ${line.LT || 'N/A'}</p>
                <p><strong>Longitude:</strong> ${line.LG || 'N/A'}</p>
                <p><strong>Última Posição:</strong> ${line.HR ? new Date(line.HR.substring(0, 4), line.HR.substring(4, 6) - 1, line.HR.substring(6, 8), line.HR.substring(8, 10), line.HR.substring(10, 12), line.HR.substring(12, 14)).toLocaleString('pt-BR') : 'N/A'}</p>
                <p class="type">Tipo: ${line.type === 'metropolitan' ? 'Metropolitana' : 'Convencional'}</p>
                ${
