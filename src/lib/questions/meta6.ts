import { Question } from '../questions-type';

export const META6_QUESTIONS: Question[] = [
  {
    id: "6-1",
    text: "O que estabelece o objetivo principal da Meta 6 Internacional de Segurança do Paciente?",
    options: [
      "Reduzir o risco de lesões e danos ao paciente decorrentes de quedas no ambiente hospitalar.",
      "Garantir a correta identificação dos pacientes com risco de infecção cruzada.",
      "Padronizar o uso de medicamentos de alta vigilância em setores críticos.",
      "Assegurar que todos os pacientes permaneçam acamados para evitar acidentes."
    ],
    correctIndex: 0,
    feedback: "A Meta 6 foca na redução do risco de quedas e dos danos associados a elas, implementando medidas preventivas para pacientes vulneráveis."
  },
  {
    id: "6-2",
    text: "Qual é o momento correto para realizar a avaliação do risco de quedas do paciente?",
    options: [
      "Na admissão, diariamente, após a mudança de setor, alteração do quadro clínico ou após um episódio de queda.",
      "Apenas na admissão do paciente, sendo desnecessária a reavaliação caso ele apresente melhora.",
      "Somente quando o paciente for idoso ou estiver desacompanhado.",
      "No momento da alta hospitalar para fornecer orientações domiciliares."
    ],
    correctIndex: 0,
    feedback: "A avaliação deve ser contínua e dinâmica. O risco de queda muda conforme a evolução clínica, medicações administradas e transferências de setor."
  },
  {
    id: "6-3",
    text: "Na prática hospitalar, quais são as escalas mais utilizadas para estratificar o risco de queda em adultos e em pediatria, respectivamente?",
    options: [
      "Escala de Braden e Escala de Glasgow.",
      "Escala de Morse e Escala de Humpty Dumpty.",
      "Escala de Fugl-Meyer e Escala de Apgar.",
      "Escala Analógica de Dor e Escala de MEWS."
    ],
    correctIndex: 1,
    feedback: "A Escala de Morse é o padrão-ouro para classificar o risco de queda em adultos, enquanto a Humpty Dumpty é a ferramenta validada para a avaliação pediátrica."
  },
  {
    id: "6-4",
    text: "Qual das opções abaixo representa um fator de risco INTRÍNSECO (ligado ao paciente) para quedas?",
    options: [
      "Piso molhado e escorregadio no corredor da enfermaria.",
      "Fios e cabos de equipamentos espalhados pelo chão do leito.",
      "Hipotensão postural, fraqueza muscular e episódios de confusão mental.",
      "Iluminação inadequada durante o período noturno no quarto."
    ],
    correctIndex: 2,
    feedback: "Fatores intrínsecos estão diretamente relacionados às condições biológicas, fisiológicas e clínicas do paciente, como fraqueza, vertigem ou confusão mental."
  },
  {
    id: "6-5",
    text: "Qual alternativa descreve adequadamente uma medida preventiva UNIVERSAL de quedas (aplicável a todos os pacientes)?",
    options: [
      "Amarrar todos os pacientes às camas utilizando restrição mecânica no período noturno.",
      "Proibir que pacientes tomem banho sozinhos, independentemente da sua capacidade motora.",
      "Manter a cama na posição mais baixa, com as rodas travadas e a campainha ao alcance da mão.",
      "Manter a luz do quarto acesa 24 horas por dia para evitar tropeços."
    ],
    correctIndex: 2,
    feedback: "Manter a cama baixa, rodas travadas e a campainha acessível são medidas universais básicas que reduzem drasticamente o risco de acidentes ao levantar."
  },
  {
    id: "6-6",
    text: "Quando o paciente é classificado como 'Alto Risco para Quedas', qual ação visual é fortemente recomendada?",
    options: [
      "Utilizar uma identificação visual específica (como pulseira amarela, placa no leito ou no prontuário) para alertar toda a equipe.",
      "Colocar o paciente obrigatoriamente no quarto mais distante do posto de enfermagem para mantê-lo tranquilo.",
      "Remover todos os móveis do quarto, deixando apenas o leito.",
      "Suspender todos os medicamentos do paciente até que o risco de queda diminua."
    ],
    correctIndex: 0,
    feedback: "Sinalizadores visuais (como a pulseira amarela ou adesivos de risco) comunicam imediatamente a qualquer profissional ou acompanhante que aquele paciente requer vigilância redobrada."
  },
  {
    id: "6-7",
    text: "Quais classes de medicamentos estão diretamente associadas ao AUMENTO do risco de quedas em pacientes internados?",
    options: [
      "Vitaminas, repositores de eletrólitos e suplementos alimentares.",
      "Sedativos, hipnóticos, diuréticos, laxantes e anti-hipertensivos.",
      "Antibióticos de amplo espectro e pomadas tópicas.",
      "Antitérmicos comuns e analgésicos leves, como dipirona."
    ],
    correctIndex: 1,
    feedback: "Medicamentos que causam sonolência, hipotensão, ou que aumentam a urgência urinária/intestinal (diuréticos e laxantes) elevam significativamente o risco de quedas."
  },
  {
    id: "6-8",
    text: "Sobre o uso do banheiro, que é um dos locais de maior incidência de quedas, qual é a orientação mais segura?",
    options: [
      "Sugerir que o paciente tranque sempre a porta para garantir sua total privacidade.",
      "Remover as barras de apoio, pois elas podem machucar o paciente.",
      "Avaliar o grau de independência do paciente, acompanhar se necessário, orientar a não trancar a porta e como usar a campainha do banheiro.",
      "Proibir o uso do banheiro e instalar sondas vesicais em todos os idosos para prevenir acidentes."
    ],
    correctIndex: 2,
    feedback: "O banheiro é um ambiente crítico. É vital não trancar a porta (para acesso rápido em emergências) e avaliar a real necessidade de assistência ao paciente durante a eliminação e higiene."
  },
  {
    id: "6-9",
    text: "Qual é a atitude correta e imediata que um colaborador deve tomar se presenciar ou encontrar um paciente após uma queda?",
    options: [
      "Levantar o paciente rapidamente do chão e colocá-lo na cama antes que alguém veja.",
      "Avaliar a integridade física do paciente antes de movê-lo, chamar ajuda da equipe assistencial (médico/enfermeiro) e só então mobilizá-lo.",
      "Informar o paciente de que a culpa pela queda é dele por não ter chamado a enfermagem.",
      "Dar alta imediatamente ao paciente para evitar problemas judiciais para o hospital."
    ],
    correctIndex: 1,
    feedback: "Nunca se deve movimentar um paciente caído antes de avaliar potenciais fraturas ou traumas cranianos. A comunicação imediata à equipe assistencial e avaliação médica são essenciais."
  },
  {
    id: "6-10",
    text: "Qual é o papel fundamental do acompanhante familiar na prevenção de quedas (Meta 6)?",
    options: [
      "Ele deve realizar os procedimentos de enfermagem caso a equipe demore.",
      "Ele deve ser orientado sobre o risco de queda do paciente, engajar-se nas medidas preventivas e solicitar ajuda antes de levantar o paciente.",
      "Ele não possui nenhum papel, pois a segurança é responsabilidade exclusiva dos funcionários do hospital.",
      "Ele deve amarrar o paciente à cama sempre que precisar sair do quarto."
    ],
    correctIndex: 1,
    feedback: "A estratégia de segurança envolve a família. Orientar o acompanhante sobre o não levantamento abrupto do paciente e a pedir ajuda garante uma assistência muito mais segura."
  },
  {
    id: "6-11",
    text: "Para a mobilização e deambulação de um paciente internado, como deve ser o calçado ideal utilizado?",
    options: [
      "Meias comuns de algodão para garantir o conforto térmico.",
      "Chinelos abertos e lisos, por serem fáceis de calçar.",
      "Calçados fechados, bem ajustados aos pés e com solado antiderrapante.",
      "De preferência, o paciente deve caminhar descalço para sentir o chão."
    ],
    correctIndex: 2,
    feedback: "O uso de calçados antiderrapantes e bem fixados ao pé (ou meias com solado emborrachado) previne escorregões e tropeços durante a marcha."
  },
  {
    id: "6-12",
    text: "No contexto da notificação de incidentes, se um paciente cai da cama, mas não sofre nenhuma lesão aparente, o que a equipe deve fazer?",
    options: [
      "Ignorar o fato, já que não houve nenhum dano físico ou queixa do paciente.",
      "Notificar o evento no sistema de segurança do paciente, pois toda queda (com ou sem dano) deve ser registrada para investigação e melhoria.",
      "Punir severamente o técnico de enfermagem responsável pelo setor.",
      "Notificar apenas a família e deixar o fato fora do prontuário."
    ],
    correctIndex: 1,
    feedback: "A notificação de incidentes, independentemente do dano, permite mapear falhas no processo (ex: falta de grades, campainha quebrada) e agir preventivamente para o futuro."
  },
  {
    id: "6-13",
    text: "Ao levantar-se rapidamente, muitos pacientes sofrem uma queda repentina devido a uma condição clínica comum após longos períodos deitados. Qual é o nome dessa condição e a medida corretiva?",
    options: [
      "Hipotermia. A medida é cobrir o paciente com cobertores extras.",
      "Hiperglicemia. A medida é aplicar insulina rápida.",
      "Hipotensão postural (ou ortostática). A medida é orientar o paciente a sentar na beira da cama por alguns minutos antes de ficar em pé.",
      "Narcolepsia. A medida é dar café forte ao paciente antes dele levantar."
    ],
    correctIndex: 2,
    feedback: "A hipotensão postural causa tontura e síncope quando a transição de deitado para em pé é rápida. Orientar a elevação gradual é a melhor prevenção técnica."
  },
  {
    id: "6-14",
    text: "A equipe de higienização do hospital tem papel ativo na Meta 6. Qual atitude abaixo exemplifica a atuação da higiene na prevenção de quedas?",
    options: [
      "Sinalizar de forma clara as áreas com piso molhado e garantir que corredores estejam secos e desobstruídos.",
      "Aplicar ceras altamente polidoras para garantir a estética brilhante do chão da emergência.",
      "Desligar as luzes dos corredores à noite para economizar energia do hospital.",
      "Deixar baldes de água no meio dos quartos para facilitar a limpeza ao longo do dia."
    ],
    correctIndex: 0,
    feedback: "Fatores ambientais (extrínsecos) causam muitas quedas. A limpeza imediata de fluidos no chão e a sinalização visual de piso molhado salvam os pacientes (e a equipe) de acidentes."
  },
  {
    id: "6-15",
    text: "O uso de contenção/restrição mecânica no leito é uma ação padrão ou recomendada primariamente para evitar que pacientes caiam?",
    options: [
      "Sim, todos os idosos devem ser restringidos profilaticamente durante a noite.",
      "Sim, é a primeira medida a ser tomada antes de usar grades ou rebaixar o leito.",
      "Não, a contenção só deve ser usada em último caso, sob estrita indicação e prescrição médica, pois pode gerar agitação e danos mais severos.",
      "Não, porque a contenção é ilegal em qualquer situação médica no Brasil."
    ],
    correctIndex: 2,
    feedback: "A restrição física é uma medida de exceção (não uma regra para prevenção de quedas), exige protocolo próprio, monitoramento rigoroso e pode piorar o delírio e a agitação."
  },
  {
    id: "6-16",
    text: "Qual das seguintes situações requer extremo cuidado da equipe multiprofissional quanto à manutenção das grades do leito?",
    options: [
      "Transporte de pacientes em macas entre setores (ex: enfermaria para o raio-x) - as grades devem estar sempre elevadas e travadas.",
      "Durante o banho de aspersão (no chuveiro) do paciente.",
      "Quando o paciente estiver almoçando sentado em uma poltrona.",
      "Quando o fisioterapeuta estiver deambulando com o paciente pelo corredor."
    ],
    correctIndex: 0,
    feedback: "As macas e camas, durante qualquer modalidade de transporte, devem estar com as grades laterais elevadas, assegurando proteção contra movimentos bruscos ou perda de equilíbrio em trânsito."
  },
  {
    id: "6-17",
    text: "O que deve ser registrado de forma clara no prontuário pela equipe de enfermagem em relação à Meta 6?",
    options: [
      "O horário em que os visitantes trouxeram comida de fora.",
      "Apenas as quedas que geraram fraturas cranianas graves.",
      "A classificação do risco, as medidas preventivas adotadas (como orientação, elevação de grades) e eventuais recusas do paciente.",
      "O tipo de sapato estético que o paciente usou ao dar entrada."
    ],
    correctIndex: 2,
    feedback: "O registro documenta que a instituição avaliou, agiu e orientou. Se o paciente se recusa a seguir medidas seguras, isso também deve constar formalmente no prontuário."
  },
  {
    id: "6-18",
    text: "A responsabilidade de prevenir quedas nos hospitais e clínicas cabe a quem?",
    options: [
      "Exclusivamente aos técnicos de enfermagem e enfermeiros do turno noturno.",
      "Somente à equipe médica responsável pela admissão e cirurgia.",
      "Aos familiares, que são obrigados por lei a vigiar o paciente ininterruptamente.",
      "A toda equipe multiprofissional (médicos, enfermagem, fisio, nutrição, limpeza, segurança) e aos acompanhantes, agindo de forma integrada."
    ],
    correctIndex: 3,
    feedback: "A segurança é cultura institucional. Todos os profissionais que entram no quarto ou interagem com o ambiente do paciente são responsáveis por verificar riscos e minimizar danos."
  },
  {
    id: "6-19",
    text: "Caso um paciente lúcido, classificado com alto risco de queda, solicite insistentemente que a grade da cama seja abaixada, qual é a atitude correta?",
    options: [
      "Atender ao pedido imediatamente sem questionar, pois o paciente tem autonomia absoluta, independente do risco clínico.",
      "Explicar os riscos graves de queda com empatia, buscar um acordo seguro e, se a recusa persistir e ele for plenamente capaz, documentar no prontuário.",
      "Ameaçar o paciente com alta precoce caso ele não obedeça às regras do hospital.",
      "Ignorar o paciente, deixar a grade alta e sair do quarto fingindo não ouvir."
    ],
    correctIndex: 1,
    feedback: "A educação em saúde é o primeiro passo. Se um paciente capaz recusa a intervenção (grades), o profissional deve informar sobre os danos, orientar alternativas e realizar o registro no prontuário."
  },
  {
    id: "6-20",
    text: "Qual o impacto das quedas com danos para a instituição e para o sistema de saúde?",
    options: [
      "Impacto positivo, pois gera mais lucro pelas diárias extras.",
      "Não há impacto institucional, visto que o plano de saúde arca com os danos sozinhos.",
      "Aumento drástico no tempo de internação, elevação dos custos assistenciais, perda de confiança da comunidade e graves perdas na qualidade de vida do paciente.",
      "Redução imediata do tempo que o paciente permanecerá internado, pois ele exigirá alta imediata."
    ],
    correctIndex: 2,
    feedback: "Quedas representam falhas na segurança. Os danos prolongam a recuperação, exigem novas cirurgias/exames, expõem o hospital a litígios e abalam a saúde funcional do paciente."
  }
];