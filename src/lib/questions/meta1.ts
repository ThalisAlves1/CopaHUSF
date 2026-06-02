import { Question } from '../questions-type';

export const META1_QUESTIONS: Question[] = [
  {
    id: "1-1",
    text: "Qual a combinação correta de indicadores primários para identificação conforme o protocolo?",
    options: [
      "Nome completo, nome da mãe e data de nascimento.",
      "Número do leito, nome completo e registro geral.",
      "Iniciais do nome, número do quarto e data de internação.",
      "Nome completo, diagnóstico e número do leito."
    ],
    correctIndex: 0,
    feedback: "A combinação de nome completo, nome da mãe e data de nascimento utiliza dados pessoais fixos que evitam erros causados por homônimos ou mudanças de leito."
  },
  {
    id: "1-2",
    text: "Por que o número do leito é proibido como identificador isolado?",
    options: [
      "Porque o paciente pode ser transferido de leito sem atualização imediata da placa.",
      "Porque viola as leis de sigilo financeiro do plano de saúde.",
      "Porque muda a cada administração de medicamento por via endovenosa.",
      "Porque os leitos não possuem numeração sequencial padronizada."
    ],
    correctIndex: 0,
    feedback: "O leito é uma variável geográfica e não individual, o que pode induzir a erros graves caso haja remanejamento de pacientes no setor."
  },
  {
    id: "1-3",
    text: "Como deve ser feita a abordagem de identificação ativa antes de um procedimento?",
    options: [
      "Pedir para o paciente dizer seu nome completo, nome da mãe e data de nascimento.",
      "Perguntar ao paciente: 'O senhor é o Sr. Carlos de Souza?'",
      "Olhar apenas o prontuário eletrônico e conferir a fisionomia.",
      "Confirmar os dados exclusivamente com o colega que passou o plantão."
    ],
    correctIndex: 0,
    feedback: "A identificação ativa obriga o paciente a verbalizar seus próprios dados, impedindo que ele confirme passivamente um nome incorreto sugerido pelo profissional."
  },
  {
    id: "1-4",
    text: "Qual conduta adotar se houver divergência entre os dados da pulseira e do prontuário?",
    options: [
      "Interromper o atendimento e confirmar os dados com o setor de admissão/cadastro antes do procedimento.",
      "Administrar o cuidado considerando os dados do prontuário por ser um documento oficial.",
      "Rasurar a pulseira manualmente e realizar o procedimento com cautela.",
      "Seguir com o procedimento caso o paciente confirme verbalmente seu nome de forma simples."
    ],
    correctIndex: 0,
    feedback: "Qualquer discrepância em dados de identificação deve paralisar o atendimento até que a identidade real seja formalmente esclarecida e corrigida."
  },
  {
    id: "1-5",
    text: "Qual o protocolo para identificar recém-nascidos gêmeos na maternidade?",
    options: [
      "Utilizar o nome da mãe acrescido dos termos 'Gêmeo 1' e 'Gêmeo 2', além da data/hora e dados da mãe.",
      "Utilizar apenas o nome do pai para diferenciar as crianças.",
      "Identificar apenas pelo sexo biológico e peso aferido ao nascer.",
      "Aguardar o registro civil definitivo cartorial para fixar as pulseiras."
    ],
    correctIndex: 0,
    feedback: "Gêmeos exigem distinção explícita atrelada ao nome materno e indicadores sequenciais claros para afastar trocas acidentais."
  },
  {
    id: "1-6",
    text: "Em pacientes inconscientes ou sedados, como é feita a checagem de segurança da Meta 1?",
    options: [
      "Conferência rígida da pulseira física com o prontuário de cabeceira e validação com acompanhante, se houver.",
      "Confiança cega na placa de identificação do leito hospitalar.",
      "Aguardar o paciente acordar para realizar qualquer tipo de exame.",
      "Perguntar os dados para o paciente vizinho de enfermaria."
    ],
    correctIndex: 0,
    feedback: "A ausência de resposta verbal exige verificação física minuciosa dos dispositivos de identificação com os registros formais de prescrição."
  },
  {
    id: "1-7",
    text: "Qual o momento correto para verificar a identificação do paciente?",
    options: [
      "Antes de administrar medicamentos, colher exames, realizar procedimentos, dietas ou transportes.",
      "Apenas no momento da admissão e no dia da alta hospitalar.",
      "Imediatamente após a conclusão de procedimentos invasivos complexos.",
      "Apenas quando o paciente solicitar a verificação por livre iniciativa."
    ],
    correctIndex: 0,
    feedback: "A checagem deve ser estritamente preventiva, realizada antes de qualquer ato assistencial para funcionar como uma barreira de erro."
  },
  {
    id: "1-8",
    text: "Por que o uso de iniciais do nome não é recomendado na pulseira de identificação?",
    options: [
      "Porque aumenta expressivamente o risco de erro devido à alta probabilidade de homônimos no mesmo setor.",
      "Porque dificulta o faturamento das contas hospitalares no final do mês.",
      "Porque as iniciais violam as regras básicas de legibilidade do prontuário.",
      "Porque o sistema de impressão não reconhece caracteres isolados."
    ],
    correctIndex: 0,
    feedback: "Nomes abreviados ou apenas iniciais reduzem a especificidade da informação, elevando a chance de confusão entre pacientes diferentes."
  },
  {
    id: "1-9",
    text: "O que fazer se um paciente for internado sem identificação (sem documentos) e inconsciente no pronto-socorro?",
    options: [
      "Utilizar um código numérico institucional provisório padrão até a identificação civil.",
      "Deixar o paciente sem pulseira até que um familiar chegue com os documentos.",
      "Inventar um nome fictício aleatório para preencher o sistema eletrônico temporariamente.",
      "Identificá-lo apenas pelo nome do socorrista ou número da ambulância."
    ],
    correctIndex: 0,
    feedback: "Protocolos de emergência preveem códigos padronizados temporários para garantir o rastreamento seguro de exames e condutas até a identificação real."
  },
  {
    id: "1-10",
    text: "Qual o papel do paciente e da família na Meta 1 conforme as diretrizes?",
    options: [
      "Devem ser orientados a exigir a checagem dos dados antes de qualquer medicação ou procedimento.",
      "Devem assinar um termo assumindo toda a responsabilidade por erros de identificação.",
      "Ficam proibidos de manusear ou olhar a pulseira de identificação.",
      "Devem preencher manualmente os dados da pulseira na ausência da enfermagem."
    ],
    correctIndex: 0,
    feedback: "O engajamento do paciente e da família atua como uma camada adicional de segurança no processo assistencial."
  },
  {
    id: "1-11",
    text: "Se a pulseira de identificação estiver danificada ou ilegível, qual a conduta imediata?",
    options: [
      "Substituir a pulseira imediatamente imprimindo uma nova com os dados validados.",
      "Cobrir a parte ilegível com fita adesiva e continuar o plantão.",
      "Utilizar caneta esferográfica comum para reescrever por cima do plástico.",
      "Manter o paciente sem a pulseira até a próxima revisão setorial diária."
    ],
    correctIndex: 0,
    feedback: "Dispositivos de segurança ilegíveis perdem totalmente sua função protetora e devem ser trocados sem atrasos."
  },
  {
    id: "1-12",
    text: "Por que o diagnóstico médico não deve figurar na pulseira de identificação principal?",
    options: [
      "Porque o diagnóstico pode mudar e expõe desnecessariamente a privacidade do paciente.",
      "Porque o espaço físico da pulseira é reservado apenas para carimbos médicos.",
      "Porque os sistemas de saúde proíbem o registro de doenças em materiais plásticos.",
      "Porque o diagnóstico impede a leitura correta de códigos de barras."
    ],
    correctIndex: 0,
    feedback: "Identificadores devem ser dados pessoais estáveis; além disso, informações clínicas expostas infringem o sigilo do paciente."
  },
  {
    id: "1-13",
    text: "Ao transportar um paciente para a realização de um exame de imagem, quem deve checar a identidade?",
    options: [
      "Tanto a equipe que transporta quanto a equipe que recebe o paciente no setor de imagem.",
      "Exclusivamente o motorista da ambulância ou o maqueiro terceirizado.",
      "Apenas o médico radiologista no momento do laudo final.",
      "Ninguém, pois o prontuário já acompanha o paciente na maca."
    ],
    correctIndex: 0,
    feedback: "A segurança na transição de cuidados exige responsabilidade compartilhada de conferência em ambas as pontas do processo."
  },
  {
    id: "1-14",
    text: "Em pediatria, qual cuidado especial deve ser tomado quanto ao uso de pulseiras?",
    options: [
      "Garantir o ajuste correto ao tamanho do membro e conferência contínua, pois crianças perdem a pulseira facilmente.",
      "Utilizar apenas fitas adesivas comuns de papel para evitar alergias cutâneas severas.",
      "Fixar a pulseira na roupa da criança para evitar que ela a coloque na boca.",
      "Dispensar o uso de pulseiras se os pais estiverem presentes no quarto no momento."
    ],
    correctIndex: 0,
    feedback: "A anatomia infantil e a mobilidade favorecem o desprendimento acidental do dispositivo, demandando monitoramento constante da enfermagem."
  },
  {
    id: "1-15",
    text: "Qual a utilidade do uso de tecnologia de código de barras aliada à Meta 1?",
    options: [
      "Automatizar a checagem cruzada entre a pulseira do paciente e o item a ser administrado.",
      "Substituir completamente a necessidade de comunicação verbal com o paciente orientado.",
      "Diminuir o tempo de internação geral por meio do rastreamento por satélite.",
      "Eliminar a necessidade de registro das condutas no prontuário físico."
    ],
    correctIndex: 0,
    feedback: "O código de barras funciona como uma barreira tecnológica que valida eletronicamente se o paciente correto está recebendo o item correto."
  },
  {
    id: "1-16",
    text: "Em um mutirão de exames laboratoriais, qual o maior risco associado à Meta 1?",
    options: [
      "A troca de etiquetas de tubos de coleta entre pacientes com nomes semelhantes.",
      "A falta de insumos básicos como algodão e álcool 70% no setor.",
      "O aumento do tempo de espera na fila de triagem inicial.",
      "A escolha inadequada do calibre da agulha de coleta venosa."
    ],
    correctIndex: 0,
    feedback: "O volume alto de atendimentos simultâneos propicia erros de troca de amostras caso os indicadores fixos não sejam checados a cada indivíduo."
  },
  {
    id: "1-17",
    text: "O que caracteriza uma falha na Meta 1 durante a entrega de refeições (dietas)?",
    options: [
      "Entregar uma bandeja de dieta pastosa para um paciente que deveria receber dieta zero pré-operatória.",
      "Servir a refeição morna ou com atraso em relação ao horário padrão da copa.",
      "Mudar os talheres descartáveis por talheres de metal sem autorização.",
      "Entregar a refeição sem a presença do nutricionista clínico no quarto."
    ],
    correctIndex: 0,
    feedback: "A entrega de dietas incorretas por erro de identificação do leito/paciente pode causar aspirações ou quebras de jejum cirúrgico."
  },
  {
    id: "1-18",
    text: "Onde deve estar localizada a informação dos três indicadores em instituições que não usam pulseiras por restrições clínicas (ex: queimados graves)?",
    options: [
      "Em prontuários de cabeceira e fichas de identificação visual padronizadas junto ao leito.",
      "Apenas no sistema de computador central da recepção do hospital.",
      "Na memória verbal dos profissionais escalados para o plantão daquele dia.",
      "Gravada em uma placa metálica fixada no chão abaixo do leito."
    ],
    correctIndex: 0,
    feedback: "Na impossibilidade do uso do dispositivo no corpo do paciente, barreiras visuais e documentais locais rígidas devem ser estruturadas."
  },
  {
    id: "1-19",
    text: "Qual o impacto a longo prazo de um erro de identificação do paciente logo na triagem do pronto-socorro?",
    options: [
      "Pode desencadear uma cascata de erros, incluindo exames, diagnósticos e tratamentos errados inseridos no prontuário de outra pessoa.",
      "Apenas uma advertência verbal simples ao digitador da recepção.",
      "O cancelamento automático de todas as consultas ambulatoriais do hospital naquele dia.",
      "Nenhum impacto, pois os erros são apagados automaticamente ao final de 24 horas."
    ],
    correctIndex: 0,
    feedback: "A identificação é a base da assistência; um erro inicial corrompe todos os fluxos subsequentes de cuidados e exames."
  },
  {
    id: "1-20",
    text: "Ao realizar a dupla checagem para transfusão de sangue, o que deve ser confrontado em relação à Meta 1?",
    options: [
      "Os dados da bolsa de sangue, a tipagem sanguínea, a prescrição e os três indicadores da pulseira do paciente.",
      "Apenas o nome do médico que indicou a transfusão de hemoderivados.",
      "O valor pago pela bolsa de sangue e o código de faturamento do plano.",
      "A cor do rótulo da bolsa com a cor da parede do quarto de internação."
    ],
    correctIndex: 0,
    feedback: "A hemoterapia é um procedimento de altíssimo risco e exige validação absoluta da compatibilidade de dados entre o receptor e o insumo."
  }
];
