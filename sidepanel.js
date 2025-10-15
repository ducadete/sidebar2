document.addEventListener('DOMContentLoaded', () => {
  // --------- Controle das abas ---------
  const tabLinks = Array.from(document.querySelectorAll('.tab-link'));
  const tabContents = Array.from(document.querySelectorAll('.tab-content'));

  tabLinks.forEach(link => {
    link.addEventListener('click', () => {
      const tabId = link.getAttribute('data-tab');

      tabLinks.forEach(item => {
        const isActive = item === link;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
      });
    });
  });

  // --------- Dados de protocolos ---------
  const PROTOCOL_SOURCE_URL = 'https://www2.bauru.sp.gov.br/saude/protocolos_saude.aspx';
  const protocoloSearchInput = document.getElementById('protocolo-search');
  const protocolosListContainer = document.getElementById('protocolos-list');
  const protocoloContentDisplay = document.getElementById('protocolo-content-display');
  const searchPlaceholder = protocoloSearchInput.getAttribute('placeholder');
  let protocolosData = [];

  const normalizarTexto = valor =>
    String(valor ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const mostrarMensagem = (mensagem, destino = protocolosListContainer) => {
    destino.innerHTML = '';
    const texto = document.createElement('p');
    texto.className = 'placeholder-text';
    texto.textContent = mensagem;
    destino.appendChild(texto);
  };

  function renderProtocolList(items) {
    protocolosListContainer.innerHTML = '';

    if (!items.length) {
      mostrarMensagem('Nenhum protocolo encontrado para a busca informada.');
      return;
    }

    items.forEach(protocol => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'list-item';

      const title = document.createElement('span');
      title.className = 'list-item-title';
      title.textContent = protocol.nome;

      const subtitle = document.createElement('span');
      subtitle.className = 'list-item-subtitle';
      subtitle.textContent = protocol.categoria;

      button.append(title, subtitle);
      button.dataset.id = protocol.id;
      button.setAttribute('aria-label', `Abrir detalhes do protocolo ${protocol.nome}, categoria ${protocol.categoria}`);
      protocolosListContainer.appendChild(button);
    });
  }

  function renderProtocolDetails(protocol) {
    const detalhes = document.createElement('article');
    detalhes.className = 'protocolo-detalhe';

    const titulo = document.createElement('h3');
    titulo.textContent = protocol.nome;

    const categoria = document.createElement('p');
    categoria.className = 'protocolo-meta';
    const categoriaStrong = document.createElement('strong');
    categoriaStrong.textContent = 'Categoria: ';
    categoria.append(categoriaStrong, document.createTextNode(protocol.categoria));

    const linkWrapper = document.createElement('p');
    const link = document.createElement('a');
    link.href = protocol.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'protocolo-link';
    link.textContent = 'Abrir PDF oficial';
    linkWrapper.appendChild(link);

    detalhes.append(titulo, categoria);
    if (protocol.info) {
      const info = document.createElement('p');
      info.className = 'protocolo-meta';
      const infoStrong = document.createElement('strong');
      infoStrong.textContent = 'Formato e observações: ';
      info.append(infoStrong, document.createTextNode(protocol.info));
      detalhes.appendChild(info);
    }
    detalhes.appendChild(linkWrapper);

    protocoloContentDisplay.innerHTML = '';
    protocoloContentDisplay.appendChild(detalhes);
  }

  function extrairProtocolos(documento) {
    const accordion = documento.querySelector('#accordion');
    if (!accordion) return [];

    const baseUrl = new URL(PROTOCOL_SOURCE_URL);
    const itens = Array.from(accordion.querySelectorAll('.accordion-item'));
    const encontrados = [];
    const vistos = new Set();

    itens.forEach(item => {
      const categoria = (item.getAttribute('title') || item.querySelector('.accordion-button')?.textContent || 'Categoria não informada').trim();
      const linhas = Array.from(item.querySelectorAll('li'));

      linhas.forEach(li => {
        const anchor = li.querySelector('a[href]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (!href) return;

        const absoluteUrl = new URL(href, baseUrl).toString();
        if (!absoluteUrl.toLowerCase().endsWith('.pdf')) return;

        const nome = anchor.textContent.replace(/\s+/g, ' ').trim();
        if (!nome) return;

        const infoText = Array.from(li.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent)
          .join(' ')
          .replace(/\s+/g, ' ')
          .replace(/^\s*-\s*/, '')
          .trim();

        const chave = `${nome}|${absoluteUrl}`;
        if (vistos.has(chave)) return;
        vistos.add(chave);

        encontrados.push({ nome, categoria, url: absoluteUrl, info: infoText });
      });
    });

    return encontrados;
  }

  async function carregarProtocolos() {
    protocoloSearchInput.disabled = true;
    mostrarMensagem('Carregando protocolos oficiais da Prefeitura de Bauru...');
    protocoloContentDisplay.innerHTML = '<p class="placeholder-text">Carregando dados do portal oficial...</p>';

    try {
      const resposta = await fetch(PROTOCOL_SOURCE_URL, { cache: 'no-store' });
      if (!resposta.ok) throw new Error(`Falha ao buscar protocolos: ${resposta.status}`);

      const html = await resposta.text();
      const parser = new DOMParser();
      const documento = parser.parseFromString(html, 'text/html');
      const extraidos = extrairProtocolos(documento);

      if (!extraidos.length) {
        mostrarMensagem('Nenhum protocolo oficial foi encontrado no momento.');
        protocoloContentDisplay.innerHTML = '<p class="placeholder-text">Tente novamente mais tarde.</p>';
        return;
      }

      extraidos.sort((a, b) => {
        const categoriaComparacao = a.categoria.localeCompare(b.categoria, 'pt-BR');
        if (categoriaComparacao !== 0) return categoriaComparacao;
        return a.nome.localeCompare(b.nome, 'pt-BR');
      });

      protocolosData = extraidos.map((item, index) => ({ ...item, id: String(index) }));
      renderProtocolList(protocolosData);
      protocoloContentDisplay.innerHTML = '<p class="placeholder-text">Selecione um protocolo para ver os detalhes.</p>';
    } catch (erro) {
      console.error('Erro ao carregar protocolos oficiais:', erro);
      mostrarMensagem('Não foi possível carregar os protocolos oficiais. Verifique sua conexão e tente novamente.');
      protocoloContentDisplay.innerHTML = '<p class="placeholder-text">Os dados do portal não puderam ser carregados.</p>';
    } finally {
      const possuiDados = protocolosData.length > 0;
      protocoloSearchInput.disabled = !possuiDados;
      const placeholderAtivo = possuiDados
        ? searchPlaceholder || 'Buscar por nome, tema ou CID'
        : 'Busca indisponível no momento';
      protocoloSearchInput.setAttribute('placeholder', placeholderAtivo);
    }
  }

  protocolosListContainer.addEventListener('click', event => {
    const target = event.target instanceof HTMLElement ? event.target.closest('.list-item') : null;
    if (!target) return;

    document.querySelectorAll('#protocolos-list .list-item').forEach(item => item.classList.remove('active'));
    target.classList.add('active');

    const protocoloSelecionado = protocolosData.find(item => item.id === target.dataset.id);
    if (protocoloSelecionado) {
      renderProtocolDetails(protocoloSelecionado);
    }
  });

  protocoloSearchInput.addEventListener('input', event => {
    const termo = event.target.value.trim();
    if (!termo) {
      renderProtocolList(protocolosData);
      protocoloContentDisplay.innerHTML = '<p class="placeholder-text">Selecione um protocolo para ver os detalhes.</p>';
      return;
    }

    const termoNormalizado = normalizarTexto(termo);
    const filtrados = protocolosData.filter(protocol => {
      const campos = [protocol.nome, protocol.categoria, protocol.info ?? '', protocol.url];
      return campos.some(valor => normalizarTexto(valor).includes(termoNormalizado));
    });

    renderProtocolList(filtrados);
    protocoloContentDisplay.innerHTML = '<p class="placeholder-text">Selecione um protocolo para ver os detalhes.</p>';
  });

  carregarProtocolos();

  // --------- Guia de Consulta com geração SOAP ---------
  const atendimentos = {
    'Consulta Clínica Geral': [
      {
        name: 'queixaPrincipal',
        label: 'Queixa principal',
        placeholder: 'Paciente refere dor torácica há 2 dias... ',
        section: 'S'
      },
      {
        name: 'historia',
        label: 'História da doença atual',
        placeholder: 'Relatar evolução, fatores de melhora/piora, tratamentos prévios...',
        section: 'S'
      },
      {
        name: 'sinaisVitais',
        label: 'Sinais vitais e dados objetivos',
        placeholder: 'PA 120x80 mmHg, FC 78 bpm, SpO₂ 97%... ',
        section: 'O'
      },
      {
        name: 'exameFisico',
        label: 'Exame físico',
        placeholder: 'Descrever achados relevantes por sistemas...',
        section: 'O'
      },
      {
        name: 'hipoteses',
        label: 'Hipóteses diagnósticas',
        placeholder: 'Hipótese principal e diferenciais...',
        section: 'A'
      },
      {
        name: 'plano',
        label: 'Plano terapêutico',
        placeholder: 'Condutas, exames solicitados, medicações...',
        section: 'P'
      },
      {
        name: 'orientacoes',
        label: 'Orientações e acompanhamento',
        placeholder: 'Educação em saúde, sinais de alarme, retorno...',
        section: 'P'
      }
    ],
    'Puericultura': [
      {
        name: 'motivoConsulta',
        label: 'Motivo da consulta',
        placeholder: 'Acompanhamento de rotina, dúvidas da família...',
        section: 'S'
      },
      {
        name: 'alimentacaoSono',
        label: 'Alimentação e sono',
        placeholder: 'Padrões alimentares, aleitamento, acordares noturnos...',
        section: 'S'
      },
      {
        name: 'desenvolvimento',
        label: 'Marcos do desenvolvimento',
        placeholder: 'Sustenta a cabeça, rola, balbucia... ',
        section: 'O'
      },
      {
        name: 'exameFisicoPediatrico',
        label: 'Exame físico',
        placeholder: 'Peso, estatura, perímetro cefálico, achados gerais...',
        section: 'O'
      },
      {
        name: 'avaliacaoCrescimento',
        label: 'Avaliação do crescimento e riscos',
        placeholder: 'Percentis, curva de crescimento, fatores de risco identificados...',
        section: 'A'
      },
      {
        name: 'planoPuericultura',
        label: 'Plano e orientações',
        placeholder: 'Vacinas, suplementações, orientações para família, retorno...',
        section: 'P'
      }
    ],
    'Pré-Natal': [
      {
        name: 'queixaPrenatal',
        label: 'Queixa ou motivo da consulta',
        placeholder: 'Acompanhamento gestacional, sintomas atuais...',
        section: 'S'
      },
      {
        name: 'antecedentesObstetricos',
        label: 'Antecedentes obstétricos',
        placeholder: 'Gestações prévias, partos, intercorrências...',
        section: 'S'
      },
      {
        name: 'avaliacaoClinica',
        label: 'Avaliação clínica e obstétrica',
        placeholder: 'PA, altura uterina, BCF, edema, exames recentes...',
        section: 'O'
      },
      {
        name: 'riscoGestacional',
        label: 'Estratificação de risco',
        placeholder: 'Classificação do risco gestacional e justificativas...',
        section: 'A'
      },
      {
        name: 'condutasPrenatal',
        label: 'Plano e condutas',
        placeholder: 'Solicitação de exames, suplementação, encaminhamentos...',
        section: 'P'
      },
      {
        name: 'orientacoesPrenatal',
        label: 'Orientações e sinais de alerta',
        placeholder: 'Educação em saúde, sinais de alarme, retorno programado...',
        section: 'P'
      }
    ]
  };

  const atendimentoSelect = document.getElementById('atendimento-select');
  const formFieldsContainer = document.getElementById('form-fields');
  const atendimentoForm = document.getElementById('atendimento-form');
  const soapOutput = document.getElementById('soap-output');
  const copyButton = document.getElementById('copy-soap');

  function popularSelect() {
    Object.keys(atendimentos).forEach((tipo, index) => {
      const option = document.createElement('option');
      option.value = tipo;
      option.textContent = tipo;
      if (index === 0) option.selected = true;
      atendimentoSelect.appendChild(option);
    });
  }

  function renderFormFields(tipo) {
    formFieldsContainer.innerHTML = '';
    const campos = atendimentos[tipo];

    campos.forEach(campo => {
      const wrapper = document.createElement('div');
      wrapper.className = 'field-group';

      const label = document.createElement('label');
      label.htmlFor = campo.name;
      label.textContent = campo.label;

      const textarea = document.createElement('textarea');
      textarea.id = campo.name;
      textarea.name = campo.name;
      textarea.placeholder = campo.placeholder;
      textarea.dataset.section = campo.section;

      wrapper.append(label, textarea);
      formFieldsContainer.appendChild(wrapper);
    });
  }

  atendimentoSelect.addEventListener('change', event => {
    const tipo = event.target.value;
    renderFormFields(tipo);
    soapOutput.innerHTML = '<p class="placeholder-text">Preencha o formulário e clique em "Gerar texto SOAP" para visualizar o resultado.</p>';
    copyButton.disabled = true;
  });

  atendimentoForm.addEventListener('submit', event => {
    event.preventDefault();

    const campos = Array.from(formFieldsContainer.querySelectorAll('textarea'));
    const secoes = { S: [], O: [], A: [], P: [] };

    campos.forEach(textarea => {
      const valor = textarea.value.trim();
      if (!valor) return;

      const section = textarea.dataset.section;
      const label = formFieldsContainer.querySelector(`label[for="${textarea.id}"]`).textContent;
      secoes[section].push(`${label}: ${valor}`);
    });

    const soapText = [
      `S: ${secoes.S.join(' | ') || 'Sem dados informados.'}`,
      `O: ${secoes.O.join(' | ') || 'Sem dados informados.'}`,
      `A: ${secoes.A.join(' | ') || 'Sem dados informados.'}`,
      `P: ${secoes.P.join(' | ') || 'Sem dados informados.'}`
    ].join('\n\n');

    soapOutput.textContent = soapText;
    copyButton.disabled = !soapText.trim();
  });

  copyButton.addEventListener('click', async () => {
    const texto = soapOutput.textContent?.trim();
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(texto);
      copyButton.textContent = 'Copiado!';
      copyButton.disabled = true;
      setTimeout(() => {
        copyButton.textContent = 'Copiar texto';
        copyButton.disabled = false;
      }, 1500);
    } catch (error) {
      console.error('Não foi possível copiar o texto', error);
      copyButton.textContent = 'Erro ao copiar';
      setTimeout(() => {
        copyButton.textContent = 'Copiar texto';
        copyButton.disabled = false;
      }, 2000);
    }
  });

  popularSelect();
  renderFormFields(atendimentoSelect.value);
});
