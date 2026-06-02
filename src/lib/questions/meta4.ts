import { Question } from '../questions-type';

export const META4_QUESTIONS: Question[] = [
  {
    id: "4-1",
    text: "Quais são as três etapas sequenciais obrigatórias recomendadas para garantir uma cirurgia segura?",
    options: [
      "Verificação pré-procedimento, marcação do local cirúrgico e pausa cirúrgica (Time Out).",
      "Anestesia geral, incisão cirúrgica e sutura de fechamento de pele.",
      "Internação hospitalar, pagamento da franquia e agendamento da sala de cirurgia.",
      "Triagem de enfermagem, lavagem de roupas cirúrgicas e alta pós-anestésica."
    ],
    correctIndex: 0,
    feedback: "Estas três etapas estruturadas criam verificações sucessivas em momentos diferentes do fluxo cirúrgico para evitar desvios graves."
  },
  {
    id: "4-2",
    text: "Qual o momento exato em que deve ocorrer a 'pausa cirúrgica' (Time out)?",
    options: [
      "Imediatamente antes de realizar a incisão cirúrgica ou iniciar o procedimento invasivo.",
      "Logo após a indução anestésica, enquanto a equipe médica ainda está fora da sala.",
      "Na recepção do centro cirúrgico, assim que o paciente cruza a porta de entrada.",
      "Ao término do procedimento, antes de encaminhar o paciente para a sala de recuperação."
    ],
    correctIndex: 0,
    feedback: "O Time Out é a última barreira coletiva realizada com toda a equipe acordada e presente em sala antes do início de qualquer ato invasivo irreversível."
  },
  {
    id: "4-3",
    text: "Quem deve participar ativamente da pausa cirúrgica (Time Out) conforme as diretrizes?",
    options: [
      "Toda a equipe assistencial presente em sala: cirurgiões, anestesistas, enfermeiros e instrumentadores.",
      "Exclusivamente o cirurgião principal que irá comandar o procedimento operatório.",
      "Apenas o técnico de enfermagem circulante de sala e o instrumentador cirúrgico.",
      "O paciente e o anestesista, dispensando a atenção do restante da equipe médica."
    ],
    correctIndex: 0,
    feedback: "O envolvimento de toda a equipe em voz alta garante que qualquer discrepância de informação seja levantada e resolvida antes da incisão."
  },
  {
    id: "4-4",
    text: "Em quais situações a marcação do local cirúrgico (sítio cirúrgico) é estritamente obrigatória?",
    options: [
      "Em procedimentos que envolvem lateralidade (direito/esquerdo), múltiplas estruturas ou locais anatômicos semelhantes.",
      "Em todas as cirurgias de urgência extrema com risco iminente de morte do paciente.",
      "Apenas em cirurgias plásticas de face para fins de simetria puramente estética.",
      "Exclusivamente quando o cirurgião principal possuir menos de 5 anos de experiência prática."
    ],
    correctIndex: 0,
    feedback: "A demarcação física elimina a ambiguidade visual sobre qual estrutura ou membro correto deve sofrer a intervenção cirúrgica."
  },
  {
    id: "4-5",
    text: "Como deve ser realizada a marcação do local cirúrgico em relação à participação do paciente?",
    options: [
      "Deve ser feita, sempre que possível, com o paciente acordado e consciente, confirmando o local exato com ele.",
      "Deve ser realizada com o paciente já sob anestesia geral profunda dentro da sala operatória.",
      "Deve ser desenhada à revelia do paciente, utilizando apenas dados obtidos por telefone com a recepção.",
      "O próprio paciente deve desenhar o local anatômico utilizando caneta comum em sua residência antes da internação."
    ],
    correctIndex: 0,
    feedback: "A concordância ativa do paciente acordado valida a marcação e evita falhas de interpretação documental no pré-operatório."
  },
  {
    id: "4-6",
    text: "Qual o tipo de marcador/tinta recomendado para realizar a demarcação do sítio cirúrgico?",
    options: [
      "Caneta com tinta indelével (resistente à água) que permaneça visível após a antissepsia da pele.",
      "Caneta esferográfica comum que saia facilmente com a aplicação de álcool 70%.",
      "Lápis de maquiagem comum que possa ser apagado com o toque dos dedos da equipe.",
      "Tintura de iodo aplicada com gaze apenas alguns segundos antes da cirurgia começar."
    ],
    correctIndex: 0,
    feedback: "A tinta deve resistir ao preparo cirúrgico de pele com antissépticos para que a marcação cumpra seu papel protetor no momento do Time Out."
  },
  {
    id: "4-7",
    text: "O que deve ser verificado na etapa de verificação pré-procedimento?",
    options: [
      "Confirmação da identidade do paciente, do procedimento proposto, da lateralidade, do consentimento informado e exames necessários.",
      "Apenas a conferência do valor dos honorários médicos e taxas da sala cirúrgica.",
      "Se o paciente prefere um quarto com televisão ou com ar-condicionado na enfermaria.",
      "A validação da limpeza de todas as janelas e aparelhos de ar-condicionado do bloco."
    ],
    correctIndex: 0,
    feedback: "Esta verificação documental e clínica inicial assegura que todos os pré-requisitos de segurança e autorização legal estão prontos e corretos."
  },
  {
    id: "4-8",
    text: "Se houver uma discrepância de informações durante a pausa cirúrgica, qual a conduta da equipe?",
    options: [
      "O procedimento não deve ser iniciado até que a dúvida seja completamente esclarecida e resolvida por todos.",
      "A cirurgia deve continuar normalmente, confiando na memória do cirurgião assistente sênior.",
      "A equipe deve realizar uma votação por maioria simples para decidir qual lado operar.",
      "O procedimento deve ser modificado no meio do caminho caso o erro seja confirmado após a abertura da pele."
    ],
    correctIndex: 0,
    feedback: "A pausa cirúrgica é uma barreira de parada; qualquer dúvida ou discordância paralisa o ato até a validação absoluta dos dados reais."
  },
  {
    id: "4-9",
    text: "Como a Meta 4 se aplica a procedimentos realizados fora do centro cirúrgico (ex: biópsia à beira do leito)?",
    options: [
      "Aplica-se com o mesmo rigor, exigindo verificação de dados, marcação de local (se aplicável) e realização da pausa antes do início.",
      "Não se aplica a procedimentos fora do bloco cirúrgico, pois os riscos em enfermarias são considerados inexistentes.",
      "Aplica-se de forma simplificada, dispensando o uso de checklists escritos e assinaturas formais.",
      "Aplica-se apenas se o procedimento for realizado por um médico residente em treinamento."
    ],
    correctIndex: 0,
    feedback: "Erros de local e procedimento correto também ocorrem em biópsias, punções profundas e endoscopias, demandando as mesmas barreiras de segurança."
  },
  {
    id: "4-10",
    text: "O que deve ser feito em relação à contagem de compressas e agulhas no Time Out e Sign-Out?",
    options: [
      "Confirmar a disponibilidade e realizar a contagem inicial e final para evitar o esquecimento de corpos estranhos na cavidade.",
      "A contagem é dispensável caso a cirurgia seja realizada de forma rápida em menos de uma hora.",
      "A contagem deve ser feita visualmente por estimativa rápida pelo cirurgião ao final da sutura.",
      "Apenas registrar o peso das compressas sujas em balança comercial após a saída do paciente da sala."
    ],
    correctIndex: 0,
    feedback: "A contagem rigorosa de materiais previne o evento adverso grave de retenção acidental de objetos dentro do corpo do paciente."
  },
  {
    id: "4-11",
    text: "Em cirurgias de órgãos únicos não bilaterais (ex: cirurgia cardíaca), a marcação do sítio cirúrgico é necessária?",
    options: [
      "A marcação pode ser dispensada conforme protocolo institucional para órgãos únicos centrais sem lateralidade.",
      "É obrigatória e deve ser feita desenhando um coração estilizado diretamente na testa do paciente.",
      "É obrigatória para fins de faturamento estético, mesmo não havendo risco de erro de lateralidade.",
      "Deve ser substituída por uma tatuagem temporária com a logo do hospital regulador."
    ],
    correctIndex: 0,
    feedback: "Procedimentos em linha média ou estruturas únicas não anatômicas bilaterais podem ter a marcação dispensada desde que o procedimento e paciente estejam certos."
  },
  {
    id: "4-12",
    text: "Qual a conduta recomendada se o paciente recusar categoricamente a realização da marcação na pele por motivos religiosos ou pessoais?",
    options: [
      "Registrar a recusa em prontuário, notificar a equipe e adotar métodos alternativos de dupla checagem visual documentada rígida.",
      "Realizar a marcação à força enquanto o paciente estiver contido mecanicamente na maca.",
      "Cancelar a cirurgia permanentemente e dar alta hospitalar imediata por insubordinação do paciente.",
      "Fazer a marcação em uma folha de papel e colá-la na parede do quarto do paciente."
    ],
    correctIndex: 0,
    feedback: "O respeito à autonomia do paciente é fundamental; a recusa deve ser documentada e as barreiras alternativas de segurança reforçadas."
  },
  {
    id: "4-13",
    text: "Por que tratar o checklist de cirurgia segura como mera formalidade burocrática ('marcar X no papel' sem falar) anula o efeito da Meta 4?",
    options: [
      "Porque a segurança reside na comunicação ativa e na conferência real em equipe, e não no preenchimento passivo de um papel.",
      "Porque o papel do checklist consome recursos de celulose que poluem o meio ambiente institucional.",
      "Porque o preenchimento incorreto gera multas automáticas aplicadas pelos conselhos de medicina.",
      "Porque os computadores do bloco cirúrgico não conseguem ler documentos digitalizados à mão."
    ],
    correctIndex: 0,
    feedback: "A eficácia do checklist depende da cultura de segurança da equipe em validar verbalmente cada item com seriedade clínica."
  },
  {
    id: "4-14",
    text: "Antes de iniciar a anestesia, qual checagem específica da Meta 4 deve ser executada?",
    options: [
      "Verificação de segurança dos equipamentos de anestesia, medicamentos, oxigênio e confirmação de dados do paciente.",
      "Apenas conferir se o paciente possui plano de saúde ativo com cobertura para anestésicos caros.",
      "Perguntar ao paciente se ele prefere acordar imediatamente ou dormir por várias horas após o procedimento.",
      "Nenhuma checagem é feita antes da anestesia, apenas após a intubação orotraqueal bem-sucedida."
    ],
    correctIndex: 0,
    feedback: "A segurança anestésica é um pilar da Meta 4 que previne falhas de via aérea e trocas de drogas indutoras críticas."
  },
  {
    id: "4-15",
    text: "O que caracteriza a etapa do 'Sign-out' (saída) no protocolo de cirurgia segura?",
    options: [
      "Uma revisão realizada com a equipe antes do paciente sair da sala cirúrgica, checando contagens, amostras e intercorrências.",
      "A assinatura do termo de quitação de débitos financeiros na recepção do bloco operatório.",
      "O momento em que o cirurgião principal se desparamenta e retira as luvas cirúrgicas.",
      "A entrega do relatório cirúrgico impresso diretamente nas mãos dos familiares na sala de espera."
    ],
    correctIndex: 0,
    feedback: "O Sign-out valida se as amostras de biópsia foram identificadas corretamente, se os materiais estão completos e quais os focos na recuperação pós-anestésica."
  },
  {
    id: "4-16",
    text: "Quem tem a autoridade para interromper o fluxo de uma cirurgia caso perceba um erro de lateralidade antes da incisão?",
    options: [
      "Qualquer membro da equipe assistencial presente na sala cirúrgica, independente do cargo ou hierarquia profissional.",
      "Exclusivamente o cirurgião-chefe titular que possui o maior tempo de formação médica da equipe.",
      "Apenas o diretor técnico do hospital caso ele esteja visitando o bloco cirúrgico naquele momento.",
      "O enfermeiro supervisor administrativo do hospital por meio de uma ordem por escrito via sistema."
    ],
    correctIndex: 0,
    feedback: "A cultura de segurança confere 'autoridade de parada' a qualquer colaborador para proteger a vida do paciente contra erros catastróficos iminentes."
  },
  {
    id: "4-17",
    text: "Ao realizar a marcação do sítio cirúrgico em lesões de pele múltiplas (ex: retirada de vários sinais), qual a conduta?",
    options: [
      "Demarcar individualmente cada uma das lesões propostas para exrese conforme planejado na consulta prévia.",
      "Marcar apenas a maior lesão e deixar que o cirurgião lembre-se das demais visualmente.",
      "Desenhar um círculo gigante englobando todo o membro do paciente para economizar tempo.",
      "Dispensar a marcação de todas as lesões e guiar-se apenas pela descrição verbal do acompanhante."
    ],
    correctIndex: 0,
    feedback: "Lesões múltiplas exigem marcações específicas e pontuais para garantir que nenhuma estrutura patológica planejada seja esquecida ou negligenciada."
  },
  {
    id: "4-18",
    text: "O que fazer se os exames de imagem (ex: radiografia) do paciente estiverem sem identificação clara na sala cirúrgica?",
    options: [
      "Os exames não devem ser utilizados para guiar a lateralidade da cirurgia até a confirmação inequívoca de sua propriedade.",
      "O cirurgião deve olhar contra a luz e tentar adivinhar se as estruturas anatômicas combinam com o paciente.",
      "Utilizar o exame normalmente caso a secretária do consultório garanta por telefone que o exame é o correto.",
      "Suspender a lavagem cirúrgica das mãos e cancelar a cirurgia sem buscar novas confirmações."
    ],
    correctIndex: 0,
    feedback: "Exames sem identificação clara geram erros de lateralidade reflexos, operando-se o lado errado baseando-se no exame de outra pessoa."
  },
  {
    id: "4-19",
    text: "Em procedimentos oftalmológicos (ex: cirurgia de catarata), onde deve ser feita a marcação do local cirúrgico?",
    options: [
      "Na região cutânea supraciliar (acima da sobrancelha) correspondente ao olho correto a ser operado.",
      "Diretamente sobre a córnea do paciente utilizando uma caneta hidrográfica permanente comum.",
      "No braço ou na perna do paciente correspondente ao lado do olho afetado pela doença.",
      "Apenas na ficha de papel do prontuário, sendo proibido fazer qualquer marca física na face do indivíduo."
    ],
    correctIndex: 0,
    feedback: "A marcação na pele acima da sobrancelha serve de guia visual direto para o cirurgião posicionado na cabeceira após a colocação dos campos estéreis."
  },
  {
    id: "4-20",
    text: "Qual o impacto do cumprimento estrito da Meta 4 na redução de processos judiciais de erro médico?",
    options: [
      "Reduz drasticamente a ocorrência de eventos adversos graves (Never Events), eliminando as principais causas de litígios cirúrgicos.",
      "Apenas diminui o valor das custas processuais sem alterar o número de processos abertos ao ano.",
      "Garante imunidade jurídica automática vitalícia para todos os cirurgiões que assinam o checklist.",
      "Não possui impacto legal, pois os juízes não reconhecem checklists hospitalares como documentos válidos."
    ],
    correctIndex: 0,
    feedback: "A erradicação de erros de local, procedimento ou paciente errados elimina os cenários mais graves de negligência e imperícia institucional."
  }
];
