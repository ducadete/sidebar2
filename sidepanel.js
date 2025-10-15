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
  const atendimentosConfigurados = [
    {
      id: 'consulta-clinica',
      label: 'Consulta Clínica Geral',
      arquivo: 'atendimentos/consulta-clinica.html'
    },
    {
      id: 'puericultura',
      label: 'Puericultura',
      arquivo: 'atendimentos/puericultura.html'
    },
    {
      id: 'pre-natal',
      label: 'Pré-Natal',
      arquivo: 'atendimentos/pre-natal.html'
    }
  ];

  const atendimentoSelect = document.getElementById('atendimento-select');
  const formFieldsContainer = document.getElementById('form-fields');
  const atendimentoForm = document.getElementById('atendimento-form');
  const soapOutput = document.getElementById('soap-output');
  const copyButton = document.getElementById('copy-soap');
  const formularioCache = new Map();

  function popularSelect() {
    atendimentoSelect.innerHTML = '';
    atendimentosConfigurados.forEach((configuracao, index) => {
      const option = document.createElement('option');
      option.value = configuracao.id;
      option.textContent = configuracao.label;
      if (index === 0) option.selected = true;
      atendimentoSelect.appendChild(option);
    });
  }

  function resolverCaminhoRecurso(caminhoRelativo) {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      return chrome.runtime.getURL(caminhoRelativo);
    }
    if (typeof browser !== 'undefined' && browser.runtime?.getURL) {
      return browser.runtime.getURL(caminhoRelativo);
    }
    return caminhoRelativo;
  }

  async function carregarFormulario(tipoId) {
    const configuracao = atendimentosConfigurados.find(item => item.id === tipoId);
    if (!configuracao) {
      formFieldsContainer.innerHTML = '<p class="placeholder-text">Tipo de atendimento não configurado.</p>';
      return;
    }

    if (formularioCache.has(configuracao.id)) {
      formFieldsContainer.innerHTML = formularioCache.get(configuracao.id);
      return;
    }

    formFieldsContainer.innerHTML = '<p class="placeholder-text">Carregando formulário personalizado...</p>';

    try {
      const resposta = await fetch(resolverCaminhoRecurso(configuracao.arquivo), { cache: 'no-store' });
      if (!resposta.ok) throw new Error(`Status ${resposta.status}`);

      const html = await resposta.text();
      formularioCache.set(configuracao.id, html);
      formFieldsContainer.innerHTML = html;
    } catch (erro) {
      console.error('Erro ao carregar formulário de atendimento:', erro);
      formFieldsContainer.innerHTML = '<p class="placeholder-text">Não foi possível carregar o formulário no momento.</p>';
    }
  }

  function extrairValorDoGrupo(grupo) {
    const valores = [];

    const selects = Array.from(grupo.querySelectorAll('select'));
    selects.forEach(select => {
      const selecionados = Array.from(select.selectedOptions)
        .map(option => option.dataset.display || option.textContent.trim())
        .filter(Boolean);
      if (!selecionados.length) return;
      const label = select.dataset.display
        || grupo.querySelector(`label[for="${select.id}"]`)?.textContent?.trim()
        || select.name;
      const descricao = selecionados.join(', ');
      valores.push(label ? `${label}: ${descricao}` : descricao);
    });

    const camposTexto = Array.from(
      grupo.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], input[type="time"], input[type="tel"]')
    );
    camposTexto.forEach(input => {
      const valor = input.value.trim();
      if (!valor) return;
      const label = input.dataset.display
        || grupo.querySelector(`label[for="${input.id}"]`)?.textContent?.trim()
        || input.name;
      const unidade = input.dataset.unit ? ` ${input.dataset.unit}` : '';
      valores.push(label ? `${label}: ${valor}${unidade}` : `${valor}${unidade}`);
    });

    const checkboxes = Array.from(grupo.querySelectorAll('input[type="checkbox"]'));
    if (checkboxes.length) {
      const selecionados = checkboxes
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.dataset.display || checkbox.closest('label')?.textContent?.trim() || checkbox.value)
        .filter(Boolean);
      if (selecionados.length) {
        valores.push(selecionados.join('; '));
      }
    }

    const radios = Array.from(grupo.querySelectorAll('input[type="radio"]'));
    if (radios.length) {
      const selecionado = radios.find(radio => radio.checked);
      const descricao = selecionado?.dataset.display || selecionado?.closest('label')?.textContent?.trim();
      if (descricao) valores.push(descricao);
    }

    const textareas = Array.from(grupo.querySelectorAll('textarea'));
    textareas.forEach(textarea => {
      const valor = textarea.value.trim();
      if (!valor) return;
      const label = textarea.dataset.display
        || grupo.querySelector(`label[for="${textarea.id}"]`)?.textContent?.trim()
        || textarea.name;
      valores.push(label ? `${label}: ${valor}` : valor);
    });

    return valores.join(' | ');
  }

  atendimentoSelect.addEventListener('change', async event => {
    const tipo = event.target.value;
    soapOutput.innerHTML = '<p class="placeholder-text">Preencha o formulário e clique em "Gerar texto SOAP" para visualizar o resultado.</p>';
    copyButton.disabled = true;
    await carregarFormulario(tipo);
  });

  atendimentoForm.addEventListener('submit', event => {
    event.preventDefault();

    const grupos = Array.from(formFieldsContainer.querySelectorAll('[data-section][data-label]'));
    const secoes = { S: [], O: [], A: [], P: [] };

    grupos.forEach(grupo => {
      const valor = extrairValorDoGrupo(grupo);
      if (!valor) return;

      const section = grupo.dataset.section?.toUpperCase();
      const label = grupo.dataset.label;
      if (section && secoes[section]) {
        secoes[section].push(`${label}: ${valor}`);
      }
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

  formFieldsContainer.addEventListener('input', event => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      copyButton.disabled = true;
    }
  });

  formFieldsContainer.addEventListener('change', event => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
      copyButton.disabled = true;
    }
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
  void carregarFormulario(atendimentoSelect.value);
});
