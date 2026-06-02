import { Question } from '../questions-type';

export const META5_QUESTIONS: Question[] = [
  {
    id: "5-1",
    text: "Quais são os '5 Momentos para a Higienização das Mãos' preconizados pela OMS?",
    options: [
      "Antes do contato, antes de procedimento limpo/asséptico, após risco de fluidos, após contato com o paciente e após tocar superfícies próximas.",
      "Ao chegar ao hospital, antes do almoço, após ir ao banheiro, após tossir e ao ir embora para casa.",
      "Antes de calçar luvas estéreis, após preencher prontuários, antes de cirurgias, após reuniões e após visitas.",
      "Sempre que as mãos estiverem visivelmente pretas de poeira ou com odores químicos fortes."
    ],
    correctIndex: 0,
    feedback: "Esses 5 momentos mapeiam as zonas de contato com o paciente e seu entorno para interromper a transmissão cruzada de microrganismos."
  },
  {
    id: "5-2",
    text: "O uso de luvas descartáveis dispensa a necessidade de higienização das mãos?",
    options: [
      "Não. As luvas reduzem o contato, mas não eliminam a obrigação de higienizar as mãos antes de calçar e após retirá-las.",
      "Sim, as luvas criam uma barreira impermeável absoluta que destrói 100% de bactérias e vírus por contato.",
      "Dispensa apenas se as luvas utilizadas forem estéreis cirúrgicas de alta espessura protetora.",
      "Sim, desde que o profissional troque de luvas a cada 4 horas contínuas de trabalho no plantão."
    ],
    correctIndex: 0,
    feedback: "Luvas possuem microporos invisíveis e podem sofrer rasgos microscópicos durante o uso; além disso, a remoção pode contaminar as mãos."
  },
  {
    id: "5-3",
    text: "Quando é obrigatório lavar as mãos com água e sabonete líquido em vez de usar apenas álcool em gel?",
    options: [
      "Sempre que as mãos estiverem visivelmente sujas ou contaminadas com sangue ou outros fluidos corporais.",
      "Apenas nos dias em que o termômetro ambiental registrar temperaturas elevadas acima de 30°C.",
      "Exclusivamente antes de realizar procedimentos cirúrgicos de grande porte em ambiente de UTI.",
      "Quando o estoque de álcool em gel do hospital estiver dentro do prazo de validade vencido."
    ],
    correctIndex: 0,
    feedback: "A sujidade visível exige ação mecânica de lavagem com água e sabão para remoção de detritos e matéria orgânica que o álcool não consegue dissolver."
  },
  {
    id: "5-4",
    text: "Qual a técnica correta de fricção antisséptica das mãos com preparação alcoólica quanto ao tempo de duração?",
    options: [
      "Friccionar todas as superfícies das mãos por cerca de 20 a 30 segundos até que sequem completamente por si mesmas.",
      "Esfregar rapidamente as palmas das mãos por 5 segundos e secar com papel toalha descartável macio.",
      "Manter as mãos imersas em uma bacia com álcool líquido puro durante 5 minutos contínuos sem esfregar.",
      "Friccionar as costas das mãos vigorosamente até provocar vermelhidão na pele por calor."
    ],
    correctIndex: 0,
    feedback: "O tempo de 20 a 30 segundos garante que o antisséptico cubra todas as áreas (palma, dorso, interdígitos, polegar e unhas) e exerça sua ação bactericida."
  },
  {
    id: "5-5",
    text: "Por que o adorno zero (proibição de anéis, alianças, pulseiras e relógios) é obrigatório na Meta 5?",
    options: [
      "Porque os adornos acumulam microrganismos sob suas superfícies e impedem a higienização completa da pele.",
      "Porque os adornos geram reflexos de luz que atrapalham a visão do cirurgião principal na mesa operatória.",
      "Porque existe o risco de os anéis caírem dentro de feridas abertas ou curativos dos pacientes por acidente.",
      "Porque os adornos aumentam o risco de furtos ou perdas materiais dentro do ambiente hospitalar de internação."
    ],
    correctIndex: 0,
    feedback: "Anéis e relógios criam nichos ecológicos artificiais onde bactérias e fungos se proliferam e resistem à lavagem ou aplicação de álcool."
  },
  {
    id: "5-6",
    text: "O que define o Momento 'Após tocar superfícies próximas ao paciente', mesmo sem ter tocado no paciente diretamente?",
    options: [
      "Higienizar as mãos após tocar em objetos como a grade do leito, o criado-mudo, o controle do soro ou o lençol do paciente.",
      "Lavar as mãos apenas ao sair do quarto e tocar na maçaneta externa da porta de saída da ala.",
      "Limpar as mãos com álcool apenas se o paciente estiver tossindo ou espirrando gotículas visíveis no ar.",
      "Realizar a higienização caso o colchão do paciente apresente rasgos ou vazamento de espumas internas."
    ],
    correctIndex: 0,
    feedback: "O entorno do paciente está colonizado pela sua própria microbiota; tocar nessas superfícies e não higienizar as mãos espalha germes para outros locais."
  },
  {
    id: "5-7",
    text: "Qual o impacto direto das Infecções Relacionadas à Assistência à Saúde (IRAS) na evolução do paciente?",
    options: [
      "Aumentam o tempo de internação, geram complicações clínicas graves, elevam custos hospitalares e o risco de morte.",
      "Reduzem a necessidade de uso de antibióticos potentes por induzirem imunidade natural protetora crônica.",
      "Apenas causam desconforto estético na pele sem alterar o tempo total de tratamento ou data de alta.",
      "Aceleram a cicatrização de feridas operatórias devido ao estímulo inflamatório celular local provocado."
    ],
    correctIndex: 0,
    feedback: "As IRAS são eventos adversos graves que comprometem o desfecho clínico do paciente e oneram gravemente os sistemas de saúde."
  },
  {
    id: "5-8",
    text: "O que é uma 'técnica asséptica' conforme citado nas práticas da Meta 5?",
    options: [
      "Um conjunto de manobras e cuidados destinados a manter materiais e áreas livres de contaminação microbiana durante procedimentos.",
      "A lavagem de paredes do quarto com água e sabão comum uma vez a cada turno de internação hospitalar.",
      "O uso de máscaras de tecido estampadas para o atendimento ambulatorial de pacientes saudáveis.",
      "A administração de medicamentos por via oral sem o contato direto dos dedos com o comprimido."
    ],
    correctIndex: 0,
    feedback: "A técnica asséptica (ex: uso de campos estéreis, pinças e luvas estéreis) previne a introdução acidental de patógenos em sítios estéreis do corpo."
  },
  {
    id: "5-9",
    text: "A respeito do comprimento e uso de unhas pelos profissionais de saúde, qual a recomendação de segurança?",
    options: [
      "Manter as unhas naturais curtas, limpas e sem uso de unhas postiças ou gel, pois estas acumulam germes.",
      "Unhas postiças longas são permitidas desde que pintadas com esmalte escuro brilhante de alta qualidade.",
      "Unhas compridas de gel são liberadas caso o profissional use duas camadas de luvas descartáveis comuns.",
      "As unhas podem ser compridas se forem limpas com escovas de cerdas de aço a cada atendimento assistencial."
    ],
    correctIndex: 0,
    feedback: "Unhas postiças e longas quebram barreiras de luvas e servem de reservatório para patógenos multirresistentes de difícil remoção."
  },
  {
    id: "5-10",
    text: "Qual a recomendação de higiene das mãos antes de realizar um procedimento limpo ou asséptico (Momento 2)?",
    options: [
      "Higienizar as mãos imediatamente antes do procedimento para proteger o paciente contra a introdução de germes em seu corpo.",
      "Realizar a lavagem das mãos apenas se o procedimento envolver sangramento abundante de grandes vasos venosos.",
      "Passar álcool em gel nas mãos cerca de 30 minutos antes do procedimento e manter as mãos nos bolsos.",
      "Dispensar a higienização caso o material a ser utilizado já venha embalado de fábrica em caixas plásticas."
    ],
    correctIndex: 0,
    feedback: "A higienização neste momento previne infecções de sítio cirúrgico, infecções de trato urinário e bacteremias por cateter vascular."
  },
  {
    id: "5-11",
    text: "O que se deve fazer imediatamente após o risco de exposição a fluidos corporais (Momento 3), mesmo usando luvas?",
    options: [
      "Retirar as luvas e higienizar as mãos imediatamente para proteger a si mesmo e o ambiente contra contaminações.",
      "Continuar atendendo outros pacientes e higienizar as mãos apenas ao final do turno diário de trabalho.",
      "Limpar o lado externo das luvas com álcool em gel e continuar o procedimento com o mesmo par instalado.",
      "Lavar as luvas com água e sabão sem retirá-las das mãos para economizar insumos plásticos descartáveis."
    ],
    correctIndex: 0,
    feedback: "A higienização imediata pós-exposição a fluidos (sangue, urina, secreções) protege o profissional e quebra o ciclo de transmissão cruzada."
  },
  {
    id: "5-12",
    text: "Por que a secagem das mãos com papel toalha após a lavagem com água e sabão deve ser feita com suavidade?",
    options: [
      "Para evitar lesões e dermatites na pele, que serve como barreira natural intacta contra invasões microbianas.",
      "Para não rasgar o papel toalha e evitar o desperdício de insumos sanitários da unidade hospitalar.",
      "Porque a pele úmida absorve melhor os efeitos do sabonete líquido que permaneceu nos poros cutâneos.",
      "Apenas por motivos estéticos, garantindo a maciez e hidratação visual das mãos dos colaboradores."
    ],
    correctIndex: 0,
    feedback: "A pele lesionada por fricção excessiva ou umidade acumulada predispõe a colonização crônica por patógenos e causa dor ao profissional."
  },
  {
    id: "5-13",
    text: "Qual a orientação sobre o uso de soluções alcoólicas caseiras ou de concentrações inadequadas na assistência à saúde?",
    options: [
      "Estão estritamente proibidas; deve-se usar apenas preparações alcoólicas regulamentadas com concentração adequada (geralmente 70%).",
      "São permitidas desde que apresentem odor agradável de ervas naturais ou perfumes comerciais finos.",
      "Podem ser utilizadas em enfermarias comuns, reservando o álcool 70% padrão apenas para os blocos cirúrgicos graves.",
      "São liberadas caso o hospital passe por desabastecimento temporário de água tratada encanada por mais de uma hora."
    ],
    correctIndex: 0,
    feedback: "A eficácia antimicrobiana depende da concentração correta de álcool e água (álcool 70%) para desnaturar proteínas de patógenos."
  },
  {
    id: "5-14",
    text: "Em relação ao cuidado com cateteres venosos centrais, como a Meta 5 atua de forma preventiva?",
    options: [
      "Exigindo higienização rígida das mãos e uso de barreira estéril máxima durante a inserção e manipulação das conexões.",
      "Determinando a troca diária compulsória de todo o dispositivo vascular, independente de sinais de infecção local.",
      "Substituindo o uso de antissépticos de pele por lavagens simples com água destilada fria de ampolas.",
      "Obrigando o paciente a permanecer com o braço imobilizado por gesso durante toda a permanência do cateter."
    ],
    correctIndex: 0,
    feedback: "A manipulação asséptica de hubs e conexões impede a migração intraluminal de bactérias causadoras de infecções de corrente sanguínea."
  },
  {
    id: "5-15",
    text: "Qual o papel da fricção dos polegares e das polpas digitais na técnica padrão de higienização das mãos?",
    options: [
      "Garantir a limpeza de áreas que frequentemente são esquecidas ou negligenciadas em lavagens rápidas ordinárias.",
      "Ativar a circulação sanguínea periférica dos dedos para melhorar a sensibilidade tátil do profissional de saúde.",
      "Remover calosidades e imperfeições estéticas da pele que possam arranhar os pacientes internados.",
      "Atender às exigências de ergonomia mecânica descritas nos manuais de medicina do trabalho modernos."
    ],
    correctIndex: 0,
    feedback: "Polegares, pontas dos dedos e unhas são as áreas de maior contato e ironicamente as mais negligenciadas em lavagens incompletas."
  },
  {
    id: "5-16",
    text: "Como a higienização das mãos impacta a resistência bacteriana a antibióticos dentro dos hospitais?",
    options: [
      "Reduz a disseminação de cepas bacterianas multirresistentes entre pacientes, diminuindo a necessidade de novos antibióticos.",
      "Torna as bactérias mais sensíveis à ação direta de sabões comuns por destruição de suas paredes celulares secundárias.",
      "Aumenta a mutação genética de vírus benéficos que destroem as bactérias nocivas do ambiente por competição.",
      "Não possui correlação com a resistência bacteriana, atuando apenas na remoção de sujidades visíveis estéticas."
    ],
    correctIndex: 0,
    feedback: "Ao frear a transmissão cruzada de bactérias resistentes (superbactérias), evita-se surtos setoriais que exigiriam antibioticoterapia de reserva de amplo espectro."
  },
  {
    id: "5-17",
    text: "Se um profissional apenas passa o álcool em gel nas palmas das mãos de forma rápida e balança as mãos para secar, o que há de errado?",
    options: [
      "A técnica foi inadequada porque não cobriu todas as superfícies das mãos e o tempo de fricção foi insuficiente para a eficácia.",
      "O erro foi balançar as mãos, pois o vento acelera a evaporação benéfica do produto antisséptico na pele.",
      "Não há erro algum, pois o contato inicial do álcool com a palma destrói imediatamente todos os microrganismos existentes.",
      "O procedimento está correto desde que as mãos estivessem lavadas com sabão em pó previamente no mesmo dia."
    ],
    correctIndex: 0,
    feedback: "A eficácia da fricção alcoólica exige cobertura total de todas as áreas das mãos e fricção ativa até a secagem natural do produto por evaporação."
  },
  {
    id: "5-18",
    text: "Qual a recomendação para a higiene das mãos após o contato com o paciente (Momento 4)?",
    options: [
      "Higienizar as mãos imediatamente ao se afastar do paciente para remover germes adquiridos na pele dele e proteger o ambiente.",
      "A higiene é opcional caso o paciente estivesse usando roupas limpas e lençóis lavados de fábrica.",
      "Deve-se realizar apenas se o paciente tiver tocado nas mãos do profissional de saúde de forma direta e firme.",
      "Apenas se o profissional planejar realizar uma pausa para lanche ou refeição logo na sequência do atendimento."
    ],
    correctIndex: 0,
    feedback: "Este momento protege o profissional de carregar a microbiota do paciente para as áreas comuns do hospital ou para outros indivíduos."
  },
  {
    id: "5-19",
    text: "Como o envolvimento da CCIH (Comissão de Controle de Infecção Hospitalar) apoia o cumprimento da Meta 5?",
    options: [
      "Por meio de auditorias de conformidade, treinamentos contínuos e monitoramento de taxas de infecção para guiar melhorias.",
      "Gerenciando as escalas de plantão de enfermagem e aplicando punições financeiras automáticas por faltas.",
      "Substituindo a equipe assistencial na lavagem diária dos leitos e equipamentos médicos do setor.",
      "Comprando insumos de higiene diretamente de marcas estrangeiras exclusivas sem licitação ou cotação."
    ],
    correctIndex: 0,
    feedback: "A vigilância epidemiológica e o feedback de adesão à higiene das mãos são ferramentas comprovadas de melhoria de processos de segurança."
  },
  {
    id: "5-20",
    text: "O que fazer se um dispensador de álcool em gel estiver vazio ao lado do leito de um paciente que exige cuidados urgentes?",
    options: [
      "Buscar o dispensador mais próximo em funcionamento ou utilizar o frasco de bolso individual antes do contato assistencial.",
      "Realizar o procedimento sem higienizar as mãos, justificando o risco pelo esvaziamento do frasco institucional.",
      "Pedir para o paciente vizinho emprestar seu frasco de álcool gel de uso pessoal trazido de sua residência.",
      "Lavar as mãos apenas com água encanada fria, dispensando o uso de sabão ou qualquer tipo de antisséptico seco."
    ],
    correctIndex: 0,
    feedback: "A falta do insumo no local exato não anula a obrigação; barreiras alternativas portáteis ou pias de lavagem devem ser acessadas imediatamente."
  }
];
