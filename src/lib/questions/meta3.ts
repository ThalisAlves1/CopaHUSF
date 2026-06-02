import { Question } from '../questions-type';

export const META3_QUESTIONS: Question[] = [
  {
    id: "3-1",
    text: "O que define os medicamentos de alta vigilância (MAV) conforme a Meta 3?",
    options: [
      "Fármacos que possuem risco elevado de causar danos graves ou fatais aos pacientes caso ocorra um erro na sua utilização.",
      "Medicamentos que exigem vigilância armada contínua no estoque central por serem caros.",
      "Substâncias que perdem o efeito terapêutico rapidamente quando expostas à luz solar.",
      "Medicamentos que provocam reações alérgicas leves na maioria dos indivíduos."
    ],
    correctIndex: 0,
    feedback: "Os MAVs (ou medicamentos potencialmente perigosos) exigem barreiras extras porque as consequências de seus erros são devastadoras."
  },
  {
    id: "3-2",
    text: "O que consiste o processo de 'dupla checagem independente' na administração de MAVs?",
    options: [
      "Dois profissionais conferem a prescrição e o preparo de forma separada e sequencial, sem induzir o resultado do outro.",
      "O mesmo profissional lê a receita duas vezes seguidas antes de aplicar a injeção.",
      "O profissional de saúde confere o dados junto com o paciente e depois com o maqueiro.",
      "Deixar o medicamento na bancada para que o médico valide visualmente quando passar pelo setor."
    ],
    correctIndex: 0,
    feedback: "A independência no processo de checagem garante que se o primeiro profissional cometer um erro de cálculo ou leitura, o segundo possa detectar de forma isenta."
  },
  {
    id: "3-3",
    text: "Qual a prática recomendada para evitar a troca de medicamentos com nomes ou embalagens parecidas (Look-Alike / Sound-Alike)?",
    options: [
      "Uso de etiquetas coloridas diferenciadas, separação física no estoque e escrita com letras maiúsculas em partes críticas do nome.",
      "Misturar todos os frascos em uma única caixa para economizar espaço físico nas prateleiras.",
      "Armazenar os medicamentos em ordem estritamente cronológica de validade em gavetas fechadas.",
      "Substituir todos os rótulos de fábrica por etiquetas manuscritas a lápis pela equipe."
    ],
    correctIndex: 0,
    feedback: "A diferenciação visual (como a técnica de Tall Man Lettering, ex: epeDRINA vs epiNEFRINA) e barreiras físicas impedem trocas automáticas de ampolas semelhantes."
  },
  {
    id: "3-4",
    text: "Qual destes exemplos faz parte do grupo de medicamentos de alta vigilância citado no material?",
    options: [
      "Insulinas, anticoagulantes e eletrólitos concentrados.",
      "Dipirona sódica, soro fisiológico 0,9% e xaropes comuns.",
      "Cremes dermatológicos hidratantes e colírios lubrificantes de rotina.",
      "Vitamina C efervescente e pastilhas para a garganta de baixa concentração."
    ],
    correctIndex: 0,
    feedback: "Insulinas, anticoagulantes e eletrólitos concentrados (como cloreto de potássio 19.1%) são MAVs clássicos devido ao alto potencial de letalidade em dosagens incorretas."
  },
  {
    id: "3-5",
    text: "Qual o perigo associado ao armazenamento inadequado de eletrólitos concentrados nas enfermarias?",
    options: [
      "A administração acidental de ampolas concentradas por via endovenosa direta, causando parada cardíaca fatal.",
      "A evaporação rápida do líquido de dentro das ampolas de plástico lacradas.",
      "O aumento do risco de contaminação bacteriana por exposição ao oxigênio do ambiente.",
      "A perda de validade do produto antes do prazo estipulado pelo fabricante."
    ],
    correctIndex: 0,
    feedback: "Eletrólitos concentrados nunca devem ser mantidos em estoques livres de enfermarias comuns sem restrição de acesso e identificação clara de perigo."
  },
  {
    id: "3-6",
    text: "Antes de infundir uma solução de quimioterapia, qual o papel do monitoramento na Meta 3?",
    options: [
      "Verificar continuamente os sinais vitais, o fluxo da infusão e atentar para sinais de toxicidade ou reações adversas.",
      "Apenas checar o funcionamento mecânico da bomba de infusão uma vez a cada 12 horas.",
      "Garantir que o paciente permaneça em jejum absoluto durante toda a sessão terapêutica.",
      "Delegar o acompanhamento clínico integral do paciente aos familiares acompanhantes."
    ],
    correctIndex: 0,
    feedback: "O monitoramento clínico pós-administração é parte integrante da segurança de medicamentos perigosos, mitigando danos rapidamente."
  },
  {
    id: "3-7",
    text: "O que deve ser verificado na etapa de prescrição de um medicamento de alta vigilância?",
    options: [
      "Se a dose, via, diluição e velocidade de infusão estão descritas de forma clara, sem rasuras ou abreviações perigosas.",
      "Se o medicamento foi fabricado por um laboratório nacional ou multinacional parceiro.",
      "Apenas a assinatura digital do médico, dispensando a leitura do corpo do texto prescrito.",
      "Se o valor da medicação está dentro do orçamento mensal pré-estabelecido pelo paciente."
    ],
    correctIndex: 0,
    feedback: "A clareza na prescrição elimina a necessidade de suposições pela equipe de enfermagem e farmácia no momento do preparo."
  },
  {
    id: "3-8",
    text: "Por que a insulina exige dupla checagem obrigatória antes da aplicação?",
    options: [
      "Porque pequenos erros de dosagem (em unidades) podem causar hipoglicemia severa, coma ou óbito do paciente.",
      "Porque a insulina pode perder o efeito caso seja administrada por profissionais diferentes.",
      "Porque o frasco de insulina exige manuseio com luvas estéreis cirúrgicas de alta espessura.",
      "Porque o descarte da seringa usada precisa ser homologado por dois supervisores."
    ],
    correctIndex: 0,
    feedback: "A insulina possui uma janela terapêutica estreita, e erros de leitura de escala de seringas são frequentes e perigosos."
  },
  {
    id: "3-9",
    text: "Qual a conduta correta na farmácia hospitalar ao dispensar um medicamento potencialmente perigoso?",
    options: [
      "Identificar o item com etiquetas de alerta coloridas (ex: vermelhas ou laranjas) bem visíveis no frasco.",
      "Dispensar o medicamento misturado com os itens de uso comum sem nenhuma marcação especial.",
      "Exigir que o próprio paciente compareça à farmácia para retirar o insumo injetável.",
      "Alterar a dosagem prescrita caso o estoque esteja com poucas unidades da apresentação correta."
    ],
    correctIndex: 0,
    feedback: "A identificação visual na dispensação alerta o profissional que irá preparar o fármaco na beira do leito sobre a necessidade de atenção redobrada."
  },
  {
    id: "3-10",
    text: "O que caracteriza um erro de via de administração na Meta 3?",
    options: [
      "Injetar Cloreto de Potássio concentrado por via endovenosa direta sem a devida diluição prévia em soro.",
      "Administrar um comprimido por via oral com água ao invés de suco de frutas cítricas.",
      "Aplicar uma injeção subcutânea no abdômen ao invés de aplicar na região deltoide do braço.",
      "Realizar a troca do horário da medicação das 22h para as 23h por atraso do setor."
    ],
    correctIndex: 0,
    feedback: "A infusão de eletrólitos concentrados sem diluição adequada destrói o potencial de membrana celular e causa eventos cardíacos fatais imediatos."
  },
  {
    id: "3-11",
    text: "Por que os opioides (como a morfina) entram na classificação da Meta 3?",
    options: [
      "Porque em doses excessivas ou taxas de infusão rápidas provocam depressão respiratória grave e parada respiratória.",
      "Porque causam reações alérgicas cutâneas severas em 100% dos indivíduos expostos.",
      "Porque perdem a estabilidade molecular quando diluídos em soro glicosado 5%.",
      "Porque são medicamentos de uso restrito ao ambiente do bloco cirúrgico apenas."
    ],
    correctIndex: 0,
    feedback: "A monitorização do padrão respiratório e do nível de consciência é mandatória ao usar opioides potentes devido ao risco de apneia."
  },
  {
    id: "3-12",
    text: "Em relação aos anticoagulantes injetáveis (como a heparina), qual o principal risco de um erro de superdosagem?",
    options: [
      "Provocar hemorragias graves e sangramentos internos incontroláveis que ameaçam a vida.",
      "Causar trombose venosa profunda imediata generalizada em todos os membros.",
      "Elevar abruptamente a pressão arterial sistêmica para níveis de crise hipotensiva.",
      "Reduzir a taxa de filtração glomerular renal de forma permanente em poucas horas."
    ],
    correctIndex: 0,
    feedback: "Anticoagulantes alteram os fatores de coagulação e a superdosagem rompe a homeostasia hemorrágica, expondo o paciente a choques hipovolêmicos por sangramento."
  },
  {
    id: "3-13",
    text: "O que a equipe deve fazer ao se deparar com uma ampola de MAV cujo rótulo está parcialmente apagado?",
    options: [
      "Descartar a ampola imediatamente no coletor de perfurocortantes/químicos e solicitar outra legível à farmácia.",
      "Utilizar a ampola baseando-se no formato físico do frasco e na cor do líquido interno.",
      "Cheirar o conteúdo da ampola após a abertura para tentar identificar a substância química.",
      "Perguntar aos colegas de setor se alguém se lembra de qual medicação estava naquela gaveta."
    ],
    correctIndex: 0,
    feedback: "Rótulos ilegíveis invalidam o uso seguro de qualquer substância, sendo o descarte e a substituição as únicas condutas toleradas."
  },
  {
    id: "3-14",
    text: "Qual a recomendação para o preparo de medicamentos de alta vigilância em ambientes barulhentos ou com muitas interrupções?",
    options: [
      "Deve-se buscar um ambiente calmo e isolado, focando totalmente no preparo sem distrações para evitar erros de cálculo.",
      "O profissional deve acelerar o preparo para sair logo daquele ambiente estressante.",
      "Deve-se delegar o preparo de múltiplos MAVs simultaneamente para otimizar o tempo coletivo.",
      "Não há restrições, pois os profissionais de saúde estão acostumados a trabalhar sob pressão intensa."
    ],
    correctIndex: 0,
    feedback: "As distrações durante o preparo de MAVs sabotam processos mentais de cálculo de doses e diluições, gerando eventos adversos graves."
  },
  {
    id: "3-15",
    text: "Ao programar uma bomba de infusão com um sedativo de alta vigilância, qual cuidado técnico é exigido?",
    options: [
      "Confirmar a taxa de infusão, a concentração da solução e o volume total com dupla checagem dos parâmetros na tela da bomba.",
      "Ligar o equipamento na tomada sem conferir a velocidade de gotejamento programada anteriormente.",
      "Dispensar o uso da bomba e realizar a infusão por gravidade simples em gotejamento livre.",
      "Programar a bomba utilizando valores aproximados arredondados para facilitar a passagem de plantão."
    ],
    correctIndex: 0,
    feedback: "Erros de digitação de pontos decimais em bombas de infusão (ex: infundir 50 ml/h em vez de 5,0 ml/h) causam superdosagens massivas imediatas."
  },
  {
    id: "3-16",
    text: "Qual a importância de manter um inventário atualizado e restrito dos MAVs no carrinho de emergência?",
    options: [
      "Garantir que apenas as quantidades estritamente necessárias estejam disponíveis, evitando desvios ou captações errôneas no desespero do atendimento.",
      "Atender às exigências de estética e simetria visual do layout interno das gavetas de emergência.",
      "Reduzir o peso físico do carrinho para facilitar o deslocamento rápido pelos corredores hospitalares.",
      "Permitir que a equipe de auditoria faça conferências financeiras diárias automáticas."
    ],
    correctIndex: 0,
    feedback: "O excesso de ampolas e a desorganização no carrinho de parada aumentam a chance de troca de substâncias durante uma reanimação cardiopulmonar."
  },
  {
    id: "3-17",
    text: "O que significa a prática de 'conciliação medicamentosa' aliada à Meta 3 na admissão hospitalar?",
    options: [
      "Comparar os medicamentos de alta vigilância que o paciente já usava em casa com as novas prescrições hospitalares para evitar omissões ou duplicidades.",
      "Negociar com o paciente a substituição de medicamentos caros por genéricos mais baratos disponíveis no SUS.",
      "Suspender todos os medicamentos de uso contínuo do paciente durante os primeiros 10 dias de internação.",
      "Pedir para o paciente assinar uma lista de medicamentos que ele promete não tomar sem autorização."
    ],
    correctIndex: 0,
    feedback: "A conciliação protege o paciente contra a interrupção abrupta ou a sobreposição perigosa de tratamentos ambulatoriais com os hospitalares."
  },
  {
    id: "3-18",
    text: "Se o protocolo institucional exige dupla checagem para MAVs, mas o setor está com falta de pessoal em um momento crítico, o que deve ser feito?",
    options: [
      "A dupla checagem deve ser mantida, solicitando o apoio temporário de um profissional de um setor vizinho ou supervisor para validar a medicação.",
      "A checagem pode ser totalmente dispensada, registrando em prontuário a falta de funcionários como justificativa legal.",
      "O profissional deve aplicar a medicação e pedir para um colega assinar a checagem mais tarde sem ter visto o preparo.",
      "O tratamento deve ser suspenso indefinidamente até a contratação de novos colaboradores permanentes."
    ],
    correctIndex: 0,
    feedback: "A escassez de pessoal aumenta o risco intrínseco de erro, tornando barreiras de segurança como a dupla checagem ainda mais necessárias e inegociáveis."
  },
  {
    id: "3-19",
    text: "Qual a conduta esperada caso ocorra uma suspeita de reação adversa grave a um medicamento de alta vigilância?",
    options: [
      "Interromper a infusão imediatamente, avaliar o estado clínico do paciente, notificar o médico responsável e registrar o evento.",
      "Aumentar a velocidade da infusão para terminar o frasco rapidamente e eliminar o problema.",
      "Aguardar o término do plantão de 12 horas para avisar a equipe médica de forma discreta.",
      "Esconder a ocorrência no prontuário para evitar auditorias ou punições administrativas à equipe."
    ],
    correctIndex: 0,
    feedback: "A detecção precoce e a interrupção imediata da exposição ao fármaco limitam a gravidade do dano e protegem a integridade do paciente."
  },
  {
    id: "3-20",
    text: "Qual o papel dos direitos ou protocolos clínicos gerenciados no uso de anticoagulantes na Meta 3?",
    options: [
      "Padronizar exames de controle (como o TAP/RNI ou TTPA) e definir tabelas de doses exatas para guiar condutas seguras.",
      "Limitar o acesso a exames laboratoriais para economizar recursos do teto financeiro do hospital.",
      "Garantir que todos os pacientes internados recebam a mesma dosagem idêntica de heparina, independente do peso corporal.",
      "Transferir o monitoramento dos sangramentos inteiramente para laboratórios terceirizados externos."
    ],
    correctIndex: 0,
    feedback: "Protocolos baseados em evidências associados a exames de controle frequentes guiam o ajuste fino de doses, evitando tanto a subdosagem (trombose) quanto a superdosagem (sangramento)."
  }
];
