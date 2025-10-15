document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA GLOBAL PARA CONTROLE DAS ABAS ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            const tabId = link.getAttribute('data-tab');
            const activeTabContent = document.getElementById(tabId);
            link.classList.add('active');
            activeTabContent.classList.add('active');
        });
    });

    // --- BASE DE DADOS DOS PROTOCOLOS ---
    const protocolosData = [
        {
            nome: "CEO - Cirurgia Oral Menor",
            tema: ["Saúde Bucal", "Procedimentos Cirúrgicos"],
            resumo: "Este protocolo estabelece os critérios para a realização de cirurgias orais menores no Centro de Especialidades Odontológicas (CEO), definindo os procedimentos de maior complexidade que são elegíveis para o serviço.",
            descricao: "O escopo abrange a triagem, elegibilidade e encaminhamento de pacientes da Atenção Primária para o CEO para procedimentos como extração de dentes impactados, cirurgias periapicais e remoção de lesões patológicas, garantindo o fluxo correto entre os níveis de atenção.",
            principaisPontos: ["Priorização de casos com sintomatologia para dentes retidos ou impactados.", "Exclusão de pacientes com condições de saúde que impeçam o procedimento cirúrgico.", "Necessidade de encaminhamento com adequação prévia do meio bucal.", "Exodontias simples e múltiplas de baixa complexidade permanecem na Atenção Básica."],
            fluxo: ["Paciente é avaliado e tem o meio bucal adequado na Atenção Primária (APS, SOPC, CRMI).", "Se atender aos critérios de inclusão, o paciente é encaminhado ao CEO.", "O CEO realiza o procedimento cirúrgico especializado.", "Acompanhamento pós-operatório é realizado no CEO para casos específicos, como lesões com potencial de recidiva."],
            cids: ["K01.1", "K04.6", "K04.8", "K10.8"],
            doencas: ["Dentes Inclusos", "Abscesso periapical com fístula", "Cisto radicular", "Outras doenças especificadas dos maxilares (Tórus)"],
            idades: "Todas as faixas etárias",
            anexos: [{ nome: "Formulário de Encaminhamento CEO", url: "#" }],
            palavrasChave: ["ceo", "dente", "siso", "exodontia", "cirurgia"]
        },
        {
            nome: "CER - Estimulação Precoce",
            tema: [
                "Reabilitação",
                "Atenção Especializada",
                "Saúde da Criança",
                "Neurologia Infantil"
            ],
            resumo: "Este protocolo destina-se a orientar o encaminhamento de crianças de 0 a 2 anos e 11 meses para o serviço de estimulação precoce, visando favorecer o desenvolvimento de habilidades motoras, sensoriais, cognitivas e de linguagem com a participação da família.",
            descricao: "O protocolo estabelece o fluxo para que profissionais de saúde de nível superior encaminhem crianças de 0 a 2 anos e 11 meses, residentes em Bauru, para o programa de Estimulação Precoce na rede CER (APAE/SORRI). Detalha os critérios de inclusão e exclusão, o processo de solicitação via prontuário eletrônico com preenchimento de checklists obrigatórios, e o método de regulação de vagas para Neurologia Reabilitação Estimulação Precoce, que são centralizadas e agendadas pela DASCR conforme prioridade e disponibilidade.",
            principaisPontos: [
                "Público-alvo exclusivo: Crianças de 0 a 2 anos e 11 meses.",
                "Objetivo: Promover o desenvolvimento global da criança (motor, sensorial, cognitivo, linguagem) com envolvimento familiar.",
                "Apenas vagas de Neurologia Reabilitação Estimulação Precoce são reguladas pela DASCR para residentes de Bauru.",
                "O encaminhamento deve ser feito por profissional de saúde de nível superior, com preenchimento de checklist (anexos 1 a 6) e CID coerente (anexo 7).",
                "Critérios de exclusão incluem: alta recente (últimos 6 meses), já estar em reabilitação, CIDs fora da lista, TDAH, Transtornos de Aprendizagem, Dislexia e transtornos psiquiátricos ou de fala isolados."
            ],
            fluxo: [
                "1. O profissional de saúde de nível superior identifica a necessidade de reabilitação e avalia os critérios de inclusão.",
                "2. O profissional preenche a ficha/checklist correspondente ao caso (disponível no site da prefeitura).",
                "3. É confeccionado o encaminhamento no prontuário eletrônico, inserindo os dados clínicos e o CID pertinente da lista do Anexo 7.",
                "4. O encaminhamento e o checklist são impressos e entregues ao responsável, que deve aguardar o contato da unidade de saúde.",
                "5. Os encaminhamentos são submetidos à regulação médica da DASCR/SMS.",
                "6. A DASCR agenda as vagas disponibilizadas pela APAE ou SORRI, seguindo critérios de prioridade e tempo de espera.",
                "7. A unidade solicitante é comunicada do agendamento via e-mail institucional para que informe ao paciente."
            ],
            cids: [
                "A504", "A521", "A811", "A812", "A818", "E740", "E750", "E751", "F82", "F83", "F840", "F841", "F842", "F843", "F844", "F848", "F849", "G09", "G110", "G119", "G120", "G121", "G122", "G128", "G129", "G230", "G239", "G360", "G361", "G368", "G369", "G404", "G540", "G545", "G609", "G610", "G619", "G622", "G710", "G711", "G712", "G713", "G800", "G809", "G810", "G811", "G819", "G820", "G821", "G822", "G823", "G824", "G825", "G830", "G831", "G832", "G833", "G834", "G839", "G900", "G901", "G902", "G910", "G911", "G912", "G913", "G918", "G919", "G933", "G934", "G935", "G938", "G959", "I672", "I673", "I674", "I675", "I690", "I694", "I698", "M339", "P140", "P219", "P284", "P910", "P941", "P942", "Q02", "Q03", "Q038", "Q039", "Q070", "Q079", "Q281", "Q282", "Q750", "Q760", "Q850", "Q860", "Q900", "R258", "R260", "R262", "R268", "R270", "R278"
            ],
            "doencas": [
                "Neurossífilis Congênita Tardia (Neurossífilis Juvenil)",
                "Neurossífilis sintomática",
                "Panencefalite esclerosante subaguda",
                "Leucoencefalopatia multifocal progressiva",
                "Outras infecções por vírus atípicos do sistema nervoso central",
                "Doença de depósito de glicogênio",
                "Gangliosidose GM2",
                "Outras gangliosidoses",
                "Transtorno específico do desenvolvimento motor",
                "Transtornos específicos misto do desenvolvimento",
                "Autismo infantil",
                "Autismo atípico",
                "Síndrome de Rett",
                "Outro transtorno desintegrativo da infância",
                "Transtorno com hipercinesia associada a retardo mental e a movimentos estereotipados",
                "Outros transtornos globais do desenvolvimento",
                "Transtornos globais não especificados do desenvolvimento",
                "Sequelas de doenças inflamatórias do sistema nervoso central",
                "Ataxia congênita não-progressiva",
                "Ataxia hereditária não especificada",
                "Atrofia muscular espinal infantil tipo I (Werdnig-Hoffman)",
                "Outras atrofias musculares espinais hereditárias",
                "Doença do neurônio motor",
                "Outras atrofias musculares espinais e síndromes musculares correlatas",
                "Atrofia muscular espinal não especificada",
                "Doença de Hallervorden-Spatz",
                "Doença degenerativa dos gânglios da base não especificada",
                "Neuromielite óptica (Doença de Devic)",
                "Leucoencefalite hemorrágica aguda e subaguda (Hurst)",
                "Outras desmielinizações disseminadas agudas especificadas",
                "Desmielinização disseminada aguda não especificada",
                "Outras epilepsias e síndromes epilépticas generalizadas",
                "Transtornos do plexo braquial",
                "Amiotrofia nevrálgica",
                "Neuropatia hereditária e idiopática não especificada",
                "Síndrome de Guillain-Barré",
                "Polineuropatia inflamatória não especificada",
                "Polineuropatia devida a outros agentes tóxicos",
                "Distrofia muscular",
                "Transtornos miotônicos",
                "Miopatias congênitas",
                "Miopatia mitocondrial não classificada em outra parte",
                "Paralisia cerebral espástica",
                "Paralisia cerebral infantil não especificada",
                "Hemiplegia flácida",
                "Hemiplegia espástica",
                "Hemiplegia não especificada",
                "Paraplegia flácida",
                "Paraplegia espástica",
                "Paraplegia não especificada",
                "Tetraplegia flácida",
                "Tetraplegia espástica",
                "Tetraplegia não especificada",
                "Diplegia dos membros superiores",
                "Monoplegia do membro inferior",
                "Monoplegia do membro superior",
                "Monoplegia não especificada",
                "Síndrome da cauda equina",
                "Síndrome paralítica não especificada",
                "Neuropatia autonômica periférica idiopática",
                "Disautonomia familiar (Síndrome de Riley-Day)",
                "Síndrome de Horner",
                "Hidrocefalia comunicante",
                "Hidrocefalia obstrutiva",
                "Hidrocefalia de pressão normal",
                "Hidrocefalia pós-traumática não especificada",
                "Outras formas de hidrocefalia",
                "Hidrocefalia não especificada",
                "Síndrome da fadiga pós-viral",
                "Encefalopatia não especificada",
                "Compressão do encéfalo",
                "Transtornos especificados do encéfalo",
                "Doença não especificada da medula espinal",
                "Aterosclerose cerebral",
                "Leucoencefalopatia vascular progressiva",
                "Encefalopatia hipertensiva",
                "Doença de Moyamoya",
                "Sequelas de hemorragia subaracnóidea",
                "Sequelas de acidente vascular cerebral não especificado como hemorrágico ou isquêmico",
                "Doenças cerebrovasculares e das não especificadas",
                "Dermatopoliomiosite não especificada",
                "Paralisia de Erb devida a traumatismo de parto",
                "Asfixia ao nascer não especificada",
                "Outras apneias do recém-nascido",
                "Isquemia cerebral neonatal",
                "Hipertonia congênita",
                "Hipotonia congênita",
                "Microcefalia",
                "Hidrocefalia congênita",
                "Outra hidrocefalia congênita",
                "Hidrocefalia congênita não especificada",
                "Síndrome de Arnold-Chiari",
                "Malformação congênita não especificada do sistema nervoso",
                "Outras malformações dos vasos pré-cerebrais",
                "Malformação arteriovenosa dos vasos cerebrais",
                "Craniossinostose",
                "Espinha bífida oculta",
                "Neurofibromatose (não-maligna)",
                "Síndrome fetal alcoólico (dismórfico)",
                "Trissomia 21, não-disjunção meiótica",
                "Outros movimentos involuntários anormais e os não especificados",
                "Marcha atáxica",
                "Dificuldade para andar não classificada em outra parte",
                "Outras anormalidades da marcha e da mobilidade e as não especificadas",
                "Ataxia não especificada",
                "Outros distúrbios da coordenação"
            ],
            "idades": "0 a 2 anos e 11 meses",
            anexos: [
                {
                    "nome": "Anexos 1 a 6 - Ficha/Checklist",
                    "url": "#"
                },
                {
                    "nome": "Anexo 7 - Lista de CIDs",
                    "url": "#"
                },
                {
                    "nome": "M-CHAT-R",
                    "url": "#"
                }
            ],
            palavrasChave: [
                "estimulação precoce",
                "reabilitação infantil",
                "desenvolvimento infantil",
                "cer",
                "apae",
                "sorri",
                "neurologia",
                "regulação",
                "protocolo",
                "bauru"
            ]
        }
    ];

    // --- LÓGICA PARA A ABA DE PROTOCOLOS COM TOGGLE ---
    const protocoloSearchBar = document.getElementById('protocolo-search-bar');
    const protocolosListContainer = document.getElementById('protocolos-list');
    const protocoloContentDisplay = document.getElementById('protocolo-content-display');

    function renderProtocols(protocolosParaRenderizar) {
        protocolosListContainer.innerHTML = '';
        if (protocolosParaRenderizar.length === 0) {
            protocolosListContainer.innerHTML = '<p class="placeholder-text">Nenhum protocolo encontrado.</p>';
            return;
        }
        protocolosParaRenderizar.forEach(protocolo => {
            const protocoloItem = document.createElement('div');
            protocoloItem.className = 'protocolo-item';
            protocoloItem.textContent = protocolo.nome;
            protocoloItem.dataset.nome = protocolo.nome;
            protocolosListContainer.appendChild(protocoloItem);
        });
    }

    function displayProtocoloDetalhado(protocolo) { /* ...código da função... */ } // A função que cria o HTML detalhado permanece a mesma.

    protocoloSearchBar.addEventListener('input', (event) => { /* ...código da busca... */ }); // O código da busca permanece o mesmo.

    protocolosListContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('protocolo-item')) {
            const isActive = target.classList.contains('active');

            // Retrai qualquer item que já esteja ativo
            document.querySelectorAll('.protocolo-item.active').forEach(item => {
                item.classList.remove('active');
            });

            // Se o item clicado não estava ativo, ele se torna o novo item ativo
            if (!isActive) {
                target.classList.add('active');
                const nome = target.dataset.nome;
                const protocoloEncontrado = protocolosData.find(p => p.nome === nome);
                if (protocoloEncontrado) {
                    displayProtocoloDetalhado(protocoloEncontrado);
                }
            } else {
                // Se já estava ativo, apenas retrai, limpando a tela de conteúdo
                protocoloContentDisplay.innerHTML = '<p class="placeholder-text">Selecione um protocolo para ver o conteúdo.</p>';
            }
        }
    });


    // --- BASE DE DADOS E LÓGICA PARA ABA ASSISTENTE DE CONSULTA COM TOGGLE ---
    const consultaSkeletons = { "Puericultura": { "2 Meses": "...", "4 Meses": "..." }, "Pré-Natal": { "1º Trimestre": "..." } };
    const topicsContainer = document.getElementById('topics-container');
    const contentDisplay = document.getElementById('content-display');

    function renderTopics() { /* ...código de renderTopics... */ }

    topicsContainer.addEventListener('click', (event) => {
        const target = event.target;

        // Lógica para o Tópico Principal (ex: Puericultura)
        if (target.classList.contains('topic-button')) {
            const subtopics = target.nextElementSibling;
            const isActive = target.classList.contains('active');

            // Fecha todos os outros tópicos
            document.querySelectorAll('.topic-button').forEach(button => {
                if (button !== target) {
                    button.classList.remove('active');
                    button.nextElementSibling.style.display = 'none';
                }
            });

            // Alterna (toggle) o tópico clicado
            if (isActive) {
                target.classList.remove('active');
                subtopics.style.display = 'none';
            } else {
                target.classList.add('active');
                subtopics.style.display = 'block';
            }
        }

        // Lógica para o Sub-tópico (ex: 2 Meses)
        if (target.classList.contains('subtopic-button')) {
            const isActive = target.classList.contains('active');

            // Remove a seleção de todos os sub-tópicos
            document.querySelectorAll('.subtopic-button').forEach(button => button.classList.remove('active'));

            if (!isActive) {
                target.classList.add('active'); // Marca o sub-tópico clicado
                const topic = target.dataset.topic;
                const subtopic = target.dataset.subtopic;
                contentDisplay.innerHTML = `<p>${consultaSkeletons[topic][subtopic]}</p>`;
            } else {
                // Se já estava ativo, limpa a tela de conteúdo
                contentDisplay.innerHTML = '<p class="placeholder-text">Selecione um tópico para ver o esqueleto.</p>';
            }
        }
    });

    // --- INICIALIZAÇÃO E CÓDIGOS NÃO MODIFICADOS ---
    // (Colei o resto do código aqui para garantir que esteja completo)

    function fullDisplayProtocoloDetalhado(protocolo) {
        let html = `<div class="protocolo-detalhe"><h2>${protocolo.nome}</h2><span class="tema-badge">${protocolo.tema.join('; ')}</span><h4>Resumo</h4><p>${protocolo.resumo}</p><h4>Descrição</h4><p>${protocolo.descricao}</p><h4>Pontos Principais</h4><ul>${protocolo.principaisPontos.map(ponto => `<li>${ponto}</li>`).join('')}</ul><h4>Fluxo do Protocolo</h4><ul>${protocolo.fluxo.map(passo => `<li>${passo}</li>`).join('')}</ul><h4>Faixa Etária e Doenças/CIDs</h4><p><strong>Idades:</strong> ${protocolo.idades}</p><ul>${protocolo.doencas.map((doenca, index) => `<li><strong>${doenca}</strong> (${protocolo.cids[index]})</li>`).join('')}</ul>`;
        if (protocolo.anexos && protocolo.anexos.length > 0) { html += `<h4>Anexos</h4><div class="anexos-container">${protocolo.anexos.map(anexo => `<a href="${anexo.url}" target="_blank" class="anexo-link">${anexo.nome}</a>`).join('')}</div>`; }
        html += `</div>`;
        protocoloContentDisplay.innerHTML = html;
    }
    // Reatribuindo para a função correta
    displayProtocoloDetalhado = fullDisplayProtocoloDetalhado;

    protocoloSearchBar.addEventListener('input', (event) => {
        const termoBusca = event.target.value.toLowerCase().trim();
        if (!termoBusca) { renderProtocols(protocolosData); return; }
        const resultados = protocolosData.filter(p => p.nome.toLowerCase().includes(termoBusca) || p.tema.some(t => t.toLowerCase().includes(termoBusca)) || p.cids.some(cid => cid.toLowerCase().includes(termoBusca)) || p.doencas.some(d => d.toLowerCase().includes(termoBusca)) || p.palavrasChave.some(kw => kw.toLowerCase().includes(termoBusca)));
        renderProtocols(resultados);
    });

    function fullRenderTopics() { topicsContainer.innerHTML = ''; for (const topic in consultaSkeletons) { const topicButton = document.createElement('button'); topicButton.className = 'topic-button'; topicButton.textContent = topic; topicsContainer.appendChild(topicButton); const subtopicsContainer = document.createElement('div'); subtopicsContainer.style.display = 'none'; for (const subtopic in consultaSkeletons[topic]) { const subtopicButton = document.createElement('button'); subtopicButton.className = 'subtopic-button'; subtopicButton.textContent = subtopic; subtopicButton.dataset.topic = topic; subtopicButton.dataset.subtopic = subtopic; subtopicsContainer.appendChild(subtopicButton); } topicsContainer.appendChild(subtopicsContainer); } }
    renderTopics = fullRenderTopics;

    renderProtocols(protocolosData);
    renderTopics();
});