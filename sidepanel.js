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
  const protocolosData = [
    {
      nome: 'CEO - Cirurgia Oral Menor',
      resumo:
        'Critérios de encaminhamento e fluxo assistencial para cirurgias orais de maior complexidade no CEO.',
      pontosChave: [
        'Priorizar casos sintomáticos com dentes inclusos ou impactados.',
        'Garantir adequação do meio bucal antes do encaminhamento.',
        'Exodontias simples permanecem na Atenção Básica.'
      ],
      fluxo: [
        'Avaliação e adequação do meio bucal na APS.',
        'Encaminhamento com critérios preenchidos e documentação anexada.',
        'Procedimento especializado realizado no CEO.',
        'Retorno para acompanhamento pós-operatório quando indicado.'
      ],
      cids: ['K01.1', 'K04.6', 'K04.8', 'K10.8'],
      temas: ['Saúde Bucal', 'Procedimentos Cirúrgicos']
    },
    {
      nome: 'CER - Estimulação Precoce',
      resumo:
        'Fluxo de regulação e critérios para encaminhar crianças de 0 a 2 anos e 11 meses ao programa de estimulação precoce.',
      pontosChave: [
        'Encaminhamento exclusivo para residentes com checklist completo.',
        'Exclusão de pacientes já em reabilitação ou com alta recente.',
        'DASCR realiza a regulação das vagas disponíveis na rede conveniada.'
      ],
      fluxo: [
        'Profissional de saúde avalia critérios clínicos.',
        'Preenchimento dos checklists e anexos obrigatórios.',
        'Solicitação registrada no prontuário com CID elegível.',
        'Regulação médica agenda o atendimento conforme prioridade.'
      ],
      cids: ['F82', 'F84.0', 'G80.0', 'Q02'],
      temas: ['Reabilitação', 'Saúde da Criança']
    },
    {
      nome: 'Pré-Natal de Risco Habitual',
      resumo: 'Etapas essenciais do acompanhamento pré-natal de baixo risco na APS.',
      pontosChave: [
        'Primeira consulta com anamnese completa e solicitação de exames básicos.',
        'Acompanhamento mensal até a 28ª semana e quinzenal até a 36ª.',
        'Acolher sinais de alerta para encaminhamento ao alto risco.'
      ],
      fluxo: [
        'Captação precoce e confirmação da gestação.',
        'Consultas de enfermagem e medicina alternadas.',
        'Educação em saúde, atualização vacinal e planejamento do parto.',
        'Encaminhamento para maternidade de referência.'
      ],
      cids: ['Z34.0', 'Z34.8'],
      temas: ['Saúde da Mulher', 'Pré-Natal']
    }
  ];

  const protocoloSearchInput = document.getElementById('protocolo-search');
  const protocolosListContainer = document.getElementById('protocolos-list');
  const protocoloContentDisplay = document.getElementById('protocolo-content-display');

  function renderProtocolList(items) {
    protocolosListContainer.innerHTML = '';

    if (!items.length) {
      const emptyState = document.createElement('p');
      emptyState.className = 'placeholder-text';
      emptyState.textContent = 'Nenhum protocolo encontrado para a busca informada.';
      protocolosListContainer.appendChild(emptyState);
      return;
    }

    items.forEach(protocol => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'list-item';
      button.textContent = `${protocol.nome}`;
      button.dataset.nome = protocol.nome;
      button.setAttribute('aria-label', `Abrir detalhes do protocolo ${protocol.nome}`);
      protocolosListContainer.appendChild(button);
    });
  }

  function renderProtocolDetails(protocol) {
    const detalhes = document.createElement('article');
    detalhes.className = 'protocolo-detalhe';

    const header = document.createElement('div');
    header.innerHTML = `
      <h3>${protocol.nome}</h3>
      <p><strong>Temas:</strong> ${protocol.temas.join(', ')}</p>
      <p><strong>CIDs associados:</strong> ${protocol.cids.join(', ')}</p>
    `;

    const resumo = document.createElement('p');
    resumo.innerHTML = `<strong>Resumo:</strong> ${protocol.resumo}`;

    const pontos = document.createElement('div');
    pontos.innerHTML = `
      <strong>Pontos-chave</strong>
      <ul>${protocol.pontosChave.map(item => `<li>${item}</li>`).join('')}</ul>
    `;

    const fluxo = document.createElement('div');
    fluxo.innerHTML = `
      <strong>Fluxo recomendado</strong>
      <ol>${protocol.fluxo.map(item => `<li>${item}</li>`).join('')}</ol>
    `;

    detalhes.append(header, resumo, pontos, fluxo);
    protocoloContentDisplay.innerHTML = '';
    protocoloContentDisplay.appendChild(detalhes);
  }

  protocolosListContainer.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains('list-item')) return;

    document.querySelectorAll('#protocolos-list .list-item').forEach(item => item.classList.remove('active'));
    target.classList.add('active');

    const protocoloSelecionado = protocolosData.find(item => item.nome === target.dataset.nome);
    if (protocoloSelecionado) {
      renderProtocolDetails(protocoloSelecionado);
    }
  });

  protocoloSearchInput.addEventListener('input', event => {
    const termo = event.target.value.toLowerCase().trim();
    if (!termo) {
      renderProtocolList(protocolosData);
      protocoloContentDisplay.innerHTML = '<p class="placeholder-text">Selecione um protocolo para ver os detalhes.</p>';
      return;
    }

    const filtrados = protocolosData.filter(protocol => {
      const campos = [
        protocol.nome,
        protocol.resumo,
        ...protocol.pontosChave,
        ...protocol.fluxo,
        ...protocol.cids,
        ...protocol.temas
      ];
      return campos.some(valor => valor.toLowerCase().includes(termo));
    });

    renderProtocolList(filtrados);
    protocoloContentDisplay.innerHTML = '<p class="placeholder-text">Selecione um protocolo para ver os detalhes.</p>';
  });

  renderProtocolList(protocolosData);

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
