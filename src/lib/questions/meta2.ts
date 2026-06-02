import { Question } from '../questions-type';

export const META2_QUESTIONS: Question[] = [
  {
    id: "2-1",
    text: "O que constitui a técnica do 'read-back' (repetição e confirmação) na Meta 2?",
    options: [
      "O receptor anota a ordem, lê de volta para o emissor e este confirma se está correto.",
      "O médico escreve a ordem duas vezes seguidas no prontuário físico.",
      "O profissional repete a ordem para si mesmo mentalmente antes de aplicar.",
      "O enfermeiro liga para o laboratório para ler o manual de exames antigos."
    ],
    correctIndex: 0,
    feedback: "O read-back garante que o entendimento da mensagem verbal foi perfeito, eliminando ruídos de comunicação e ambiguidades."
  },
  {
    id: "2-2",
    text: "Quando são permitidas ordens verbais de tratamento segundo as boas práticas?",
    options: [
      "Apenas em situações de emergência ou durante procedimentos estéreis em que o médico não pode escrever.",
      "Sempre que o médico estiver muito cansado ou ocupado para digitar.",
      "Em consultas eletivas de rotina no ambulatório de especialidades.",
      "Para a prescrição de rotina de medicamentos de uso contínuo comuns."
    ],
    correctIndex: 0,
    feedback: "As ordens verbais devem ser restritas ao mínimo possível devido ao alto risco de erro, sendo justificadas apenas em emergências críticas."
  },
  {
    id: "2-3",
    text: "Qual a conduta correta do laboratório ao identificar um valor crítico de exame?",
    options: [
      "Comunicar o resultado imediatamente ao profissional responsável pelo paciente e registrar a ação.",
      "Aguardar a rotina de envio de relatórios impressos no final do dia útil.",
      "Enviar um e-mail padrão para a ouvidoria geral do complexo hospitalar.",
      "Ligar para o paciente diretamente na sua residência para avisá-lo do perigo."
    ],
    correctIndex: 0,
    feedback: "Valores críticos significam ameaça iminente à vida e exigem comunicação ativa e veloz para intervenção terapêutica imediata."
  },
  {
    id: "2-4",
    text: "O que significa a sigla SBAR na padronização da comunicação clínica?",
    options: [
      "Situação, Histórico (Background), Avaliação e Recomendação.",
      "Sintomas, Biometria, Alergias e Riscos cirúrgicos.",
      "Setor, Bloco, Ala e Registro de internação.",
      "Segurança, Barreiras, Ações e Resultados assistenciais."
    ],
    correctIndex: 0,
    feedback: "O SBAR é uma ferramenta mnemônica estruturada que organiza a transmissão de informações clínicas críticas de forma clara e objetiva."
  },
  {
    id: "2-5",
    text: "Por que as abreviações perigosas devem ser banidas dos registros de saúde?",
    options: [
      "Porque podem ser facilmente mal interpretadas, gerando erros de dosagem ou de via de administração.",
      "Porque ocupam espaço excessivo na memória dos servidores digitais.",
      "Porque contrariam as regras gramaticais da língua portuguesa culta.",
      "Porque atrasam a leitura dos prontuários pelos auditores externos."
    ],
    correctIndex: 0,
    feedback: "Abreviações ambíguas (como 'U' para unidades, que pode parecer um zero) são causas históricas documentadas de eventos adversos graves."
  },
  {
    id: "2-6",
    text: "Como deve ser feita a documentação de uma comunicação de resultado crítico?",
    options: [
      "Registrar em prontuário o valor, o horário, o nome do profissional notificado e as condutas propostas.",
      "Anotar o valor em um bloco de notas autoadesivo fixado no balcão da enfermagem.",
      "Não há necessidade de registro se a comunicação tiver sido realizada por telefone.",
      "Registrar apenas se o paciente apresentar piora clínica visível nas próximas horas."
    ],
    correctIndex: 0,
    feedback: "O registro formal resguarda a segurança do paciente e serve como evidência legal do cumprimento do protocolo institucional."
  },
  {
    id: "2-7",
    text: "Qual o maior risco associado a uma passagem de plantão desestruturada?",
    options: [
      "A omissão de informações clínicas vitais, levando a atrasos diagnósticos ou terapêuticos.",
      "O aumento do consumo de materiais de escritório e folhas de papel.",
      "A extensão excessiva do horário de permanência da equipe que está saindo.",
      "A desorganização das escalas de férias anuais dos colaboradores do setor."
    ],
    correctIndex: 0,
    feedback: "A transição de cuidados sem um roteiro claro favorece o esquecimento de pendências e o desconhecimento de riscos do paciente."
  },
  {
    id: "2-8",
    text: "Em um ambiente hospitalar, o que define uma comunicação efeciva?",
    options: [
      "Transmitir a informação certa, para a pessoa certa, no momento certo e com o devido registro.",
      "Falar o máximo de tempo possível durante as reuniões multidisciplinares semanais.",
      "Utilizar termos técnicos complexos em inglês para demonstrar conhecimento.",
      "Escrever relatórios longos e detalhados com informações pessoais do paciente."
    ],
    correctIndex: 0,
    feedback: "A eficácia da comunicação está na clareza, exatidão, oportunidade e confirmação do recebimento da mensagem útil."
  },
  {
    id: "2-9",
    text: "Ao receber uma prescrição verbal em caso de emergência, qual a responsabilidade do enfermeiro?",
    options: [
      "Ouvir atentamente, repetir o nome e a dose do medicamento em voz alta e anotar assim que possível.",
      "Recusar o atendimento até que o médico assine a folha de prescrição física.",
      "Delegar a administração imediatamente para um estagiário sem fazer dupla checagem.",
      "Executar a ordem em silêncio para não atrapalhar o foco da equipe de reanimação."
    ],
    correctIndex: 0,
    feedback: "A validação em voz alta no momento da emergência serve como um double-check verbal imediato antes da execução do fármaco."
  },
  {
    id: "2-10",
    text: "Por que mensagens de texto em aplicativos informais (ex: WhatsApp) para prescrições de rotina ferem a Meta 2?",
    options: [
      "Porque não garantem o registro oficial no prontuário, carecem de autenticação e propiciam dispersão da informação.",
      "Porque consomem dados móveis da rede de internet particular do colaborador.",
      "Porque os aplicativos informais possuem limites de caracteres para mensagens enviadas.",
      "Porque o médico é obrigado por lei a utilizar apenas canetas de tinta azul."
    ],
    correctIndex: 0,
    feedback: "Canais informais não auditáveis quebram o fluxo de segurança documental e aumentam a margem de erros por falta de rastreabilidade."
  },
  {
    id: "2-11",
    text: "Se o médico prescrever um medicamento com caligrafia ilegível na receita física, o que a enfermagem deve fazer?",
    options: [
      "Não administrar o medicamento e entrar em contato com o prescritor para esclarecer e retificar a escrita.",
      "Tentar adivinhar o nome do fármaco com base nos sintomas mais prováveis do paciente.",
      "Substituir o medicamento por outro de efeito similar que tenha escrita compreensível.",
      "Encaminhar a receita diretamente para a farmácia para que eles decidam o que dispensar."
    ],
    correctIndex: 0,
    feedback: "A dúvida ou ilegibilidade proíbe a execução do item. O esclarecimento direto com o emissor é a única conduta segura."
  },
  {
    id: "2-12",
    text: "O que é um resultado de exame considerado 'crítico'?",
    options: [
      "Aquele que aponta uma alteração laboratorial ou de imagem que coloca a vida do paciente em risco iminente caso não seja tratada.",
      "Aquele cujo resultado demora mais de 48 horas para ser liberado pelo sistema central.",
      "Aquele que exige o uso de reagentes importados de alto custo financeiro para o hospital.",
      "Aquele que contradiz frontalmente o diagnóstico inicial estabelecido na admissão."
    ],
    correctIndex: 0,
    feedback: "Resultados críticos demandam ações de emergência (ex: potássio muito elevado ou hemoglobina em níveis de choque)."
  },
  {
    id: "2-13",
    text: "Como o método SBAR melhora a comunicação na transferência de um paciente para a UTI?",
    options: [
      "Organiza as informações em blocos lógicos: o problema atual, o histórico, o estado atual e as necessidades imediatas.",
      "Reduz o tempo de transporte físico do paciente dentro dos elevadores hospitalares.",
      "Permite que a transferência ocorra sem a necessidade de prontuário ou exames impressos.",
      "Exime a equipe de enfermagem de registrar a evolução do paciente no dia da mudança."
    ],
    correctIndex: 0,
    feedback: "A estrutura lógica do SBAR permite que a equipe receptora compreenda o cenário completo do paciente em poucos minutos e sem ruídos."
  },
  {
    id: "2-14",
    text: "O que deve ser evitado durante a passagem de plantão para garantir o foco na Meta 2?",
    options: [
      "Interrupções frequentes por motivos não urgentes e conversas paralelas alheias ao quadro clínico.",
      "O uso de computadores para a visualização de exames de imagem recentes.",
      "A presença do enfermeiro supervisor do setor durante a leitura do relatório.",
      "A citação de medicamentos de alta vigilância que estão instalados no paciente."
    ],
    correctIndex: 0,
    feedback: "O ambiente para transição de cuidados deve ser controlado e focado para evitar a perda de informações por distração."
  },
  {
    id: "2-15",
    text: "Qual a importância de confirmar o recebimento de mensagens eletrônicas de alertas de segurança no sistema do hospital?",
    options: [
      "Garantir que a equipe assistencial tomou ciência de uma alteração importante no fluxo de atendimento daquele paciente.",
      "Permitir que o setor de TI compute as horas de acesso à internet de cada funcionário.",
      "Evitar que o sistema operacional do computador sofra travamentos ou lentidão.",
      "Gerar relatórios de produtividade para o cálculo de bônus salariais."
    ],
    correctIndex: 0,
    feedback: "Alertas em sistemas eletrônicos só são eficazes se houver uma leitura ativa e uma resposta assistencial correspondente."
  },
  {
    id: "2-16",
    text: "Como a Meta 2 se aplica na relação com o paciente?",
    options: [
      "Explicando os cuidados de forma clara, em linguagem acessível e confirmando se o paciente compreendeu as orientações.",
      "Utilizando jargões médicos complexos para transmitir maior autoridade científica.",
      "Evitando responder às perguntas feitas pelos familiares para não gerar ansiedade.",
      "Entregando manuais técnicos densos para o paciente ler sozinho durante a noite."
    ],
    correctIndex: 0,
    feedback: "A comunicação efetiva estende-se ao paciente e familiares, garantindo que eles compreendam o tratamento e colaborem com a segurança."
  },
  {
    id: "2-17",
    text: "O que caracteriza uma falha de comunicação na transição de cuidados do centro cirúrgico para a enfermaria?",
    options: [
      "Não informar à enfermaria que o paciente possui uma via aérea difícil ou que recebeu doses de opioides potentes.",
      "Esquecer de enviar os pertences pessoais do paciente, como chinelos ou roupas civis.",
      "Realizar o transporte do paciente utilizando uma maca com grades elevadas e travadas.",
      "Notificar a transferência com 15 minutos de antecedência ao setor de destino."
    ],
    correctIndex: 0,
    feedback: "Ocultar ou omitir dados de estabilidade clínica ou medicações administradas coloca o paciente em risco de complicações graves sem monitoramento adequado."
  },
  {
    id: "2-18",
    text: "Qual a recomendação sobre ordens verbais para medicamentos psicotrópicos ou controlados?",
    options: [
      "Estão proibidas, exceto em situações de extrema emergência com risco de morte eminente.",
      "São liberadas a qualquer momento para facilitar o sono do paciente agitado.",
      "Podem ser aceitas desde que o médico confirme por mensagem de áudio depois.",
      "São permitidas caso a farmácia hospitalar possua o item em estoque de livre acesso."
    ],
    correctIndex: 0,
    feedback: "Medicamentos de controle especial possuem regras rígidas e alto potencial de dano, vedando ordens verbais rotineiras."
  },
  {
    id: "2-19",
    text: "Em equipes multidisciplinares, como a Meta 2 previne conflitos que afetam o paciente?",
    options: [
      "Padronizando os canais e registros de informação, garantindo que médicos, enfermeiros e fisioterapeutas alinhem as condutas.",
      "Determinando que apenas um profissional tenha o direito de falar sobre o paciente.",
      "Substituindo todas as discussões clínicas por mensagens gravadas em sistemas centrais.",
      "Obrigando todos os profissionais a assinarem os mesmos relatórios textuais idênticos."
    ],
    correctIndex: 0,
    feedback: "A clareza nos registros compartilhados reduz divergências de conduta e garante que todos sigam o mesmo plano terapêutico seguro."
  },
  {
    id: "2-20",
    text: "Diante de uma dúvida sobre a dosagem de um medicamento prescrito via telefone em uma urgência, o que o profissional deve fazer?",
    options: [
      "Solicitar que o médico soletre os números ou repita a dosagem detalhadamente até afastar qualquer incerteza.",
      "Administrar a menor dose possível disponível na unidade por segurança própria.",
      "Pedir a opinião do paciente ou do acompanhante sobre qual dosagem costumam usar.",
      "Aguardar o término da urgência para verificar o que deveria ter sido feito."
    ],
    correctIndex: 0,
    feedback: "O read-back com detalhamento de numerais (ex: 'cinco miligramas' e não apenas 'cinco') previne erros catastróficos de dosagem em ordens telefônicas."
  }
];
