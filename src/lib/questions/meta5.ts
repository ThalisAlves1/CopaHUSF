import { Question } from '../questions-type';

export const META5_QUESTIONS: Question[] = [
  {
    id: "5-1",
    text: "A Meta 5 Internacional de Segurança do Paciente foca em uma ação específica para reduzir as Infecções Relacionadas à Assistência à Saúde (IRAS). Qual é essa ação?",
    options: [
      "Uso profilático de antibióticos para todos os internados.",
      "Desinfecção diária de todas as superfícies com luz ultravioleta.",
      "Melhoria e adesão rigorosa à higienização das mãos.",
      "Uso obrigatório de aventais estéreis em todos os setores."
    ],
    correctIndex: 2,
    feedback: "A higienização das mãos é mundialmente reconhecida pela OMS como a medida primordial, mais barata e de maior impacto para a redução das IRAS."
  },
  {
    id: "5-2",
    text: "Segundo as diretrizes internacionais, em qual situação o uso de preparação alcoólica a 70% é CONTRAINDICADO, sendo obrigatória a lavagem com água e sabonete?",
    options: [
      "Após aferir a pressão arterial de um paciente sem isolamento.",
      "Quando as mãos estiverem visivelmente sujas ou contaminadas com sangue/fluidos.",
      "Antes de calçar luvas para realizar uma punção venosa.",
      "Durante a transição de um paciente para outro na mesma enfermaria."
    ],
    correctIndex: 1,
    feedback: "A matéria orgânica (sujidade, sangue, fluidos) inativa o álcool e atua como uma barreira física. Nesses casos, a remoção mecânica com água e sabão é obrigatória."
  },
  {
    id: "5-3",
    text: "O Momento 1 preconizado pela OMS é 'Antes de tocar o paciente'. Qual é o principal objetivo desta ação?",
    options: [
      "Proteger o profissional de saúde contra a flora do paciente.",
      "Proteger o ambiente hospitalar da contaminação externa.",
      "Proteger o paciente contra germes patogênicos carreados nas mãos do profissional.",
      "Cumprir uma formalidade administrativa para auditoria."
    ],
    correctIndex: 2,
    feedback: "O Momento 1 visa evitar que microrganismos oriundos do ambiente ou de outros pacientes sejam transferidos para o individuo que vai receber o cuidado."
  },
  {
    id: "5-4",
    text: "Um enfermeiro vai administrar uma medicação no acesso venoso do paciente. Mesmo já tendo higienizado as mãos ao entrar no quarto (Momento 1), por que ele deve higienizá-las novamente (Momento 2)?",
    options: [
      "Porque o acesso venoso é um sítio crítico e a higienização imediata antes do procedimento previne a introdução de germes no corpo do paciente.",
      "Apenas se ele tiver tocado no celular antes de preparar a medicação.",
      "Não é necessário, a higienização ao entrar no quarto é suficiente para todos os procedimentos.",
      "Porque a medicação intravenosa inativa as bactérias da mão."
    ],
    correctIndex: 0,
    feedback: "O Momento 2 (Antes de procedimento limpo/asséptico) é crucial para prevenir a infecção de corrente sanguínea e outros sítios estéreis, exigindo assepsia imediatamente antes da manipulação."
  },
  {
    id: "5-5",
    text: "Após esvaziar uma comadre ou bolsa de colostomia usando luvas, o profissional deve descartá-las e higienizar as mãos (Momento 3). Qual é o foco de proteção deste momento?",
    options: [
      "Proteger unicamente o paciente, pois ele já está vulnerável.",
      "Proteger o profissional e o ambiente de saúde contra patógenos provenientes dos fluidos do próprio paciente.",
      "Esterilizar as mãos para o próximo procedimento cirúrgico.",
      "Evitar odores no ambiente de trabalho."
    ],
    correctIndex: 1,
    feedback: "O Momento 3 (Após risco de exposição a fluidos corporais) foca em proteger o profissional de adoecer e o ambiente ao redor de se contaminar com fluidos altamente colonizados."
  },
  {
    id: "5-6",
    text: "Ao terminar de aferir os sinais vitais (sem contato com fluidos) e se afastar do leito para sair do quarto, o profissional cumpre o Momento 4 (Após tocar o paciente). Qual a razão técnica para isso?",
    options: [
      "Evitar que a flora residente do paciente se dissemine para outros pacientes e superfícies do hospital.",
      "Remover a sujidade visível deixada pela pele do paciente.",
      "Proteger o paciente contra uma infecção secundária.",
      "Garantir a hidratação da pele do profissional."
    ],
    correctIndex: 0,
    feedback: "Após o contato, as mãos do profissional estão colonizadas com a microbiota do paciente (Momento 4). A higienização impede que ele atue como vetor de transmissão pelo hospital."
  },
  {
    id: "5-7",
    text: "Um nutricionista entra no quarto, deixa a dieta na mesa de cabeceira do paciente, ajusta o monitor e sai sem encostar no paciente. Ele deve higienizar as mãos?",
    options: [
      "Não, pois não houve contato direto com a pele do paciente.",
      "Sim, pois o mobiliário faz parte da 'zona do paciente' e possui os mesmos microrganismos que ele (Momento 5).",
      "Apenas se o paciente estiver em isolamento de contato.",
      "Sim, mas apenas com água e sabão, pois álcool não limpa móveis."
    ],
    correctIndex: 1,
    feedback: "Superfícies ao redor do paciente (zona do paciente) são colonizadas por sua microbiota. Tocar nelas (Momento 5) contamina as mãos tanto quanto tocar no próprio paciente."
  },
  {
    id: "5-8",
    text: "No contexto da prevenção de infecções, assinale a afirmação correta sobre o uso de luvas de procedimento:",
    options: [
      "Substituem a higienização das mãos, proporcionando uma barreira 100% segura.",
      "Podem ser lavadas e reutilizadas no cuidado de diferentes pacientes na mesma enfermaria.",
      "O uso de luvas não altera a necessidade de higienizar as mãos antes de calçá-las e imediatamente após removê-las.",
      "Devem ser usadas em tempo integral por todos os profissionais, incluindo recepcionistas."
    ],
    correctIndex: 2,
    feedback: "Luvas possuem microporos e podem contaminar as mãos durante a retirada. Nunca substituem a higienização das mãos, sendo apenas uma barreira adicional."
  },
  {
    id: "5-9",
    text: "Qual a justificativa microbiológica para a proibição do uso de anéis, relógios e alianças (adornos) por profissionais que prestam assistência direta ou circulam em áreas clínicas?",
    options: [
      "Eles podem oxidar com o álcool e causar alergias cutâneas.",
      "Os adornos criam áreas de sombra sob a pele que acumulam microrganismos e impedem o contato adequado dos antissépticos.",
      "Trata-se apenas de uma regra para evitar furtos de objetos de valor.",
      "Para evitar arranhões no mobiliário hospitalar recém-comprado."
    ],
    correctIndex: 1,
    feedback: "A pele sob os adornos permanece densamente colonizada porque a fricção mecânica e o agente químico (álcool/sabão) não conseguem penetrar nesse espaço 'cego'."
  },
  {
    id: "5-10",
    text: "Profissionais de saúde são instruídos a manter unhas curtas e não usar unhas postiças ou alongamentos em gel. Por que essa norma é crítica para a segurança do paciente?",
    options: [
      "Porque unhas longas perfuram sistematicamente as embalagens de soro.",
      "O esmalte em gel interfere na captação do oxímetro do profissional.",
      "O espaço subungueal e as fissuras dos alongamentos abrigam altíssima carga de fungos e bactérias gram-negativas difíceis de remover.",
      "Porque unhas longas dificultam a digitação rápida nos prontuários eletrônicos."
    ],
    correctIndex: 2,
    feedback: "A região embaixo das unhas naturalmente já concentra bactérias. Alongamentos e unhas compridas aumentam essa área e criam microfissuras que protegem os patógenos da higienização."
  },
  {
    id: "5-11",
    text: "Para que a preparação alcoólica a 70% tenha o efeito bactericida desejado, qual é o tempo mínimo de fricção que o profissional deve realizar até a completa secagem das mãos?",
    options: [
      "5 a 10 segundos.",
      "20 a 30 segundos.",
      "40 a 60 segundos.",
      "2 a 3 minutos."
    ],
    correctIndex: 1,
    feedback: "A OMS padroniza que a técnica de fricção alcoólica deve durar de 20 a 30 segundos, cobrindo todas as superfícies das mãos até que fiquem totalmente secas."
  },
  {
    id: "5-12",
    text: "Ao optar pela lavagem das mãos com água e sabonete (simples ou antisséptico), qual é o tempo recomendado para a correta execução de toda a técnica?",
    options: [
      "10 a 15 segundos.",
      "20 a 30 segundos.",
      "40 a 60 segundos.",
      "No mínimo 5 minutos (escovação cirúrgica para enfermarias)."
    ],
    correctIndex: 2,
    feedback: "A lavagem com água e sabão exige mais tempo (40 a 60 segundos) para incluir o ensaboamento, fricção mecânica de todas as áreas, enxágue adequado e secagem com papel toalha."
  },
  {
    id: "5-13",
    text: "No atendimento a um paciente com diarreia por Clostridioides difficile, a preparação alcoólica falha em eliminar o patógeno. O que deve ser feito?",
    options: [
      "Utilizar álcool a 90% em vez de 70%.",
      "Friccionar o álcool a 70% pelo dobro do tempo (60 segundos).",
      "Lavar as mãos rigorosamente com água e sabonete, pois a ação mecânica é necessária para remover os esporos.",
      "Usar três pares de luvas sobrepostos para evitar qualquer contato."
    ],
    correctIndex: 2,
    feedback: "O álcool não tem ação contra esporos bacterianos (como os do C. difficile). Nesses casos, apenas a fricção e o arraste mecânico da água com sabão conseguem removê-los das mãos."
  },
  {
    id: "5-14",
    text: "Um faturista passa o dia no setor administrativo compartilhando teclado, mouse, carimbos e grampeadores. Sobre o risco de transmissão de infecções, é correto afirmar:",
    options: [
      "A higienização das mãos é dispensável, pois germes não sobrevivem em plástico.",
      "Esses objetos atuam como fômites, acumulando bactérias que o funcionário pode levar ao rosto ou a outros setores, exigindo higienização frequente das mãos.",
      "Apenas profissionais da linha de frente (médicos e enfermeiros) carreiam bactérias no hospital.",
      "O ideal é usar luvas cirúrgicas para digitar durante todo o turno."
    ],
    correctIndex: 1,
    feedback: "Fômites são objetos inanimados que transportam patógenos. A equipe administrativa toca neles constantemente, precisando higienizar as mãos para não se contaminar ou espalhar germes."
  },
  {
    id: "5-15",
    text: "Um profissional da limpeza ambiental retira suas luvas de borracha espessa (EPI) após desinfetar um banheiro. Imediatamente após isso, ele deve:",
    options: [
      "Apenas guardar as luvas, pois elas garantiram a proteção de suas mãos.",
      "Calçar um novo par de luvas imediatamente para o próximo setor.",
      "Higienizar as mãos com água e sabão ou álcool, pois a remoção do EPI frequentemente contamina as mãos.",
      "Borrifar desinfetante hospitalar puro diretamente sobre as próprias mãos."
    ],
    correctIndex: 2,
    feedback: "O momento de retirar as luvas (doffing) é crítico e frequentemente gera a transferência de microrganismos da face externa da luva para a pele desnuda, exigindo higienização mandatória."
  },
  {
    id: "5-16",
    text: "No contexto da Meta 5, qual deve ser a abordagem da equipe hospitalar em relação aos familiares e acompanhantes?",
    options: [
      "Proibir que eles toquem nos pacientes, pois não sabem lavar as mãos.",
      "Educar, orientar e encorajar os visitantes a higienizarem as mãos ao entrar e sair do quarto, promovendo um clima de segurança.",
      "Responsabilizá-los criminalmente por qualquer infecção que o paciente adquirir.",
      "Isentá-los de qualquer prática, pois a meta se aplica só a funcionários."
    ],
    correctIndex: 1,
    feedback: "A segurança do paciente é multimodal e envolve educar e empoderar pacientes e visitantes para que atuem como barreiras extras contra infecções cruzadas."
  },
  {
    id: "5-17",
    text: "Um técnico de enfermagem nota que suas mãos estão com dermatite (fissuras e ressecamento) devido à alta frequência de lavagens. Qual é a conduta técnica mais adequada?",
    options: [
      "Parar de lavar as mãos e usar apenas luvas estéreis até a pele sarar.",
      "Utilizar sabão em pó ou detergente, que são mais suaves que o sabonete hospitalar.",
      "Comunicar à medicina do trabalho e utilizar cremes hidratantes compatíveis e recomendados pela instituição para restaurar a barreira da pele.",
      "Aplicar pomadas antibióticas por conta própria para prevenir infecção na fissura."
    ],
    correctIndex: 2,
    feedback: "A pele integra é a primeira barreira de defesa. Dermatites reduzem a adesão à higiene e aumentam a colonização bacteriana. O uso de hidratantes institucionais é fortemente recomendado pela OMS."
  },
  {
    id: "5-18",
    text: "O uso de smartphones pessoais durante o cuidado ao paciente é desencorajado nas instituições. Baseado nos princípios de prevenção de IRAS, qual o motivo disso?",
    options: [
      "O celular emite radiação que acelera a replicação bacteriana no quarto.",
      "O celular atua como um vetor de alta contaminação (fômite); ao tocá-lo após higienizar as mãos, o profissional recontamina as mãos antes de tocar o paciente.",
      "A restrição ocorre unicamente para evitar distrações e erros na medicação.",
      "Porque o flash da câmera inativa os antissépticos aplicados na pele."
    ],
    correctIndex: 1,
    feedback: "Smartphones abrigam uma grande variedade de microrganismos. O manuseio do aparelho quebra a assepsia das mãos recém-higienizadas, facilitando a infecção cruzada."
  },
  {
    id: "5-19",
    text: "Frente a um surto de bactérias multirresistentes (ex: *KPC* ou *Acinetobacter*), qual é a eficácia do uso rotineiro de preparação alcoólica a 70% nas mãos sem sujidade visível?",
    options: [
      "O álcool é ineficaz contra superbactérias; deve-se usar apenas água sanitária diluída.",
      "O álcool a 70% mantém excelente eficácia e atividade bactericida rápida contra esses germes vegetativos, sendo o método de escolha.",
      "É necessário adicionar antibióticos diretamente no frasco de álcool em gel.",
      "Nenhuma; a única solução é o isolamento respiratório do paciente."
    ],
    correctIndex: 1,
    feedback: "Bactérias multirresistentes a antibióticos NÃO são resistentes aos antissépticos alcoólicos. O álcool a 70% destrói a membrana celular desses germes rapidamente, sendo altamente eficaz."
  },
  {
    id: "5-20",
    text: "Para garantir a adesão à higienização das mãos, a OMS não foca apenas em cobranças, mas propõe uma 'Estratégia Multimodal'. Ela é baseada em 5 componentes. Qual alternativa reflete essa abordagem?",
    options: [
      "Punição, multas, demissões, relatórios diários e vigilância armada.",
      "Infraestrutura (pia, álcool), Educação/Treinamento, Avaliação/Feedback, Lembretes no local e Clima de Segurança Institucional.",
      "Bônus salarial mensal, folgas extras, fornecimento de luvas exclusivas, sabonetes coloridos e música ambiente.",
      "Substituir profissionais por robôs, automatizar todas as portas, uso de radiação UV, fechamento de UTIs e rodízio de antibióticos."
    ],
    correctIndex: 1,
    feedback: "A melhoria sustentável só ocorre quando o sistema apoia o trabalhador: dando os insumos corretos (infraestrutura), treinando, acompanhando indicadores de forma construtiva, fixando lembretes e promovendo a cultura de segurança."
  }
];