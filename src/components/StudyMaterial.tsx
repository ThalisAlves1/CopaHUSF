import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, BookOpen, Clock, Award, CheckCircle2, AlertCircle, 
  HelpCircle, Sparkles, ChevronRight, FileText, Info, GraduationCap,
  Heart, Copy, UserCheck, MessageSquare, Pill, Stethoscope, Droplets, ShieldAlert
} from 'lucide-react';

interface StudyMaterialProps {
  onClose: () => void;
  initialMetaId?: number | null;
}

const METAS_CONTENT = [
  {
    id: 1,
    title: "Meta 1 - Identificar corretamente o paciente",
    shortTitle: "Meta 1",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    borderColor: "border-blue-100",
    bgTint: "bg-blue-50/40",
    icon: <UserCheck className="w-5 h-5 md:w-6 h-6" />,
    objective: "Garantir que todo cuidado seja realizado no paciente certo, evitando trocas, procedimentos indevidos e erros de assistência.",
    meaning: "A identificação correta é a base da segurança. Antes de qualquer procedimento, medicamento, exame, coleta, transferência ou atendimento, o profissional precisa confirmar quem é o paciente. Essa confirmação não deve depender apenas do número do leito ou da aparência da pessoa.",
    practices: [
      "Utilizar os três indicadores institucionais: nome completo, nome da mãe e data de nascimento.",
      "Conferir a pulseira de identificação quando houver.",
      "Perguntar o nome completo de forma ativa, evitando perguntas que induzam resposta, como: 'Você é Maria?'.",
      "Nunca usar apenas quarto, leito ou diagnóstico como identificação.",
      "Confirmar identidade antes de medicamentos, exames, procedimentos, dietas, transfusões e transporte."
    ],
    example: "Antes de administrar um antibiótico, o profissional confere nome completo, nome da mãe e data de nascimento no prontuário e na pulseira do paciente.",
    attention: "Paciente inconsciente, criança, idoso, paciente confuso ou sem acompanhante exige cuidado redobrado na confirmação da identidade."
  },
  {
    id: 2,
    title: "Meta 2 - Melhorar a comunicação efetiva",
    shortTitle: "Meta 2",
    color: "bg-indigo-500",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-100",
    bgTint: "bg-indigo-50/40",
    icon: <MessageSquare className="w-5 h-5 md:w-6 h-6" />,
    objective: "Garantir que informações importantes sejam transmitidas de forma clara, completa, registrada e compreendida pela equipe.",
    meaning: "Muitos eventos adversos acontecem por falhas na comunicação. Uma informação passada de forma incompleta, sem registro ou sem confirmação pode gerar atrasos, medicação errada, exames duplicados e condutas inadequadas.",
    practices: [
      "Registrar informações relevantes de forma legível e completa.",
      "Repetir e confirmar ordens verbais ou telefônicas, quando forem permitidas pelo serviço.",
      "Comunicar resultados críticos imediatamente ao profissional responsável.",
      "Usar métodos padronizados de passagem de plantão, como situação, histórico, avaliação e recomendação.",
      "Evitar abreviações perigosas, mensagens vagas ou registros incompletos."
    ],
    example: "Ao receber um resultado crítico de laboratório, a equipe comunica imediatamente o profissional responsável e registra horário, resultado e conduta.",
    attention: "Comunicação efetiva não é falar muito. É transmitir a informação certa, para a pessoa certa, no momento certo e com registro adequado."
  },
  {
    id: 3,
    title: "Meta 3 - Melhorar a segurança dos medicamentos de alta vigilância",
    shortTitle: "Meta 3",
    color: "bg-rose-500",
    textColor: "text-rose-600",
    borderColor: "border-rose-100",
    bgTint: "bg-rose-50/40",
    icon: <Pill className="w-5 h-5 md:w-6 h-6" />,
    objective: "Reduzir o risco de erro com medicamentos que podem causar danos graves quando usados de forma incorreta.",
    meaning: "Medicamentos de alta vigilância são aqueles que exigem atenção especial porque, em caso de erro, podem gerar consequências graves. A segurança envolve prescrição, dispensação, armazenamento, preparo, identificação, administração e monitoramento.",
    practices: [
      "Identificar medicamentos de alta vigilância conforme padronização institucional.",
      "Separar e armazenar adequadamente medicamentos com nomes ou embalagens parecidas.",
      "Conferir prescrição, dose, via, horário, diluição e paciente antes da administração.",
      "Realizar dupla checagem independente quando o protocolo institucional exigir.",
      "Monitorar efeitos esperados, sinais de toxicidade e reações adversas."
    ],
    example: "Antes de administrar insulina, a equipe confere prescrição, dose, tipo de insulina, paciente e horário, seguindo a rotina de dupla checagem quando indicada.",
    attention: "Atenção especial para medicamentos com nomes parecidos, concentrações diferentes, eletrólitos concentrados, anticoagulantes, insulinas, sedativos e opioides."
  },
  {
    id: 4,
    title: "Meta 4 - Assegurar cirurgia em local, procedimento e paciente corretos",
    shortTitle: "Meta 4",
    color: "bg-amber-500",
    textColor: "text-amber-600",
    borderColor: "border-amber-100",
    bgTint: "bg-amber-50/40",
    icon: <Stethoscope className="w-5 h-5 md:w-6 h-6" />,
    objective: "Prevenir erros relacionados a cirurgias ou procedimentos realizados no paciente errado, local errado ou procedimento errado.",
    meaning: "Esta meta se aplica a cirurgias e também a procedimentos invasivos. A equipe deve confirmar dados, procedimento, lateralidade, exames, materiais, consentimento e riscos antes do início do ato cirúrgico ou procedimento.",
    practices: [
      "Realizar verificação pré-procedimento.",
      "Confirmar identidade do paciente, procedimento proposto e local anatômico.",
      "Marcar o local cirúrgico quando aplicável, especialmente em procedimentos com lateralidade.",
      "Realizar a pausa cirúrgica, também chamada de time out, antes da incisão ou início do procedimento.",
      "Confirmar disponibilidade de exames, equipamentos, materiais e equipe necessária."
    ],
    example: "Antes de uma cirurgia no joelho direito, a equipe confirma paciente, procedimento, lateralidade, exames e realiza a pausa cirúrgica com todos presentes.",
    attention: "A pausa cirúrgica deve acontecer antes do procedimento começar e precisa envolver a equipe. Não deve ser tratada como mera formalidade."
  },
  {
    id: 5,
    title: "Meta 5 - Reduzir o risco de infecções associadas ao cuidado",
    shortTitle: "Meta 5",
    color: "bg-cyan-500",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-100",
    bgTint: "bg-cyan-50/40",
    icon: <Droplets className="w-5 h-5 md:w-6 h-6" />,
    objective: "Diminuir a transmissão de microrganismos e prevenir infecções relacionadas à assistência à saúde.",
    meaning: "Infecções associadas ao cuidado podem aumentar tempo de internação, complicações, custos e risco de morte. A higienização das mãos é uma das medidas mais simples, eficazes e importantes para prevenir infecções.",
    practices: [
      "Higienizar as mãos antes de tocar o paciente.",
      "Higienizar as mãos antes de realizar procedimento limpo ou asséptico.",
      "Higienizar as mãos após risco de exposição a fluidos corporais.",
      "Higienizar as mãos após tocar o paciente.",
      "Higienizar as mãos após tocar superfícies próximas ao paciente.",
      "Usar equipamentos de proteção individual conforme risco e protocolo.",
      "Manter cuidado com dispositivos invasivos, curativos, sondas, cateteres e ambiente."
    ],
    example: "Após ajustar a grade do leito e antes de manipular o acesso venoso, o profissional higieniza as mãos conforme técnica adequada.",
    attention: "Luvas não substituem higienização das mãos. As mãos devem ser higienizadas antes de calçar e após retirar as luvas, conforme protocolo."
  },
  {
    id: 6,
    title: "Meta 6 - Reduzir o risco de danos por quedas",
    shortTitle: "Meta 6",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    borderColor: "border-orange-100",
    bgTint: "bg-orange-50/40",
    icon: <ShieldAlert className="w-5 h-5 md:w-6 h-6" />,
    objective: "Prevenir quedas e reduzir lesões em pacientes durante atendimento, internação, exames, banho, transporte ou deslocamento.",
    meaning: "A queda pode acontecer por fraqueza, tontura, uso de medicamentos, idade avançada, confusão mental, dor, ambiente inadequado ou falta de orientação. Prevenir quedas exige avaliação, sinalização, supervisão e organização do ambiente.",
    practices: [
      "Avaliar o risco de queda na admissão e sempre que houver mudança clínica.",
      "Sinalizar pacientes classificados como risco de queda conforme protocolo da instituição.",
      "Manter cama baixa, rodas travadas, campainha próxima e ambiente sem obstáculos.",
      "Orientar paciente e acompanhante sobre pedir ajuda antes de levantar.",
      "Acompanhar deslocamentos de pacientes com risco aumentado.",
      "Garantir iluminação adequada, calçados seguros e dispositivos de apoio quando necessários."
    ],
    example: "Um paciente idoso que usa sedativo é identificado como risco de queda, recebe orientação, fica com campainha ao alcance e é acompanhado ao banheiro.",
    attention: "A prevenção de quedas deve ser contínua. O risco pode mudar após medicação, cirurgia, febre, dor, tontura, alteração mental ou mudança de setor."
  }
];

const CHECKLIST_ITEMS = [
  { id: 1, text: "O paciente foi identificado com os três indicadores?", response: "Sim: nome completo, nome da mãe e data de nascimento." },
  { id: 2, text: "A informação foi comunicada e registrada claramente?", response: "Sim: mensagem completa, confirmada e documentada." },
  { id: 3, text: "O medicamento exige atenção especial?", response: "Sim: conferir prescrição, dose, via, horário, paciente e dupla checagem quando indicada." },
  { id: 4, text: "O procedimento, paciente e local foram confirmados?", response: "Sim: verificação prévia, marcação quando aplicável e pausa cirúrgica." },
  { id: 5, text: "As mãos foram higienizadas no momento correto?", response: "Sim: antes e após contato, antes de procedimento asséptico e após risco de fluidos." },
  { id: 6, text: "O risco de queda foi avaliado e prevenido?", response: "Sim: sinalização, orientação, ambiente seguro e supervisão quando necessário." }
];


export function StudyMaterial({ onClose, initialMetaId }: StudyMaterialProps) {
  const [activeTab, setActiveTabTab] = useState<'apresentacao' | 'resumo' | 'detalhes' | 'checklist' | 'referencias'>(
    initialMetaId ? 'detalhes' : 'apresentacao'
  );
  const [selectedMetaId, setSelectedMetaId] = useState<number>(initialMetaId || 1);
  const [openCard, setOpenCard] = useState<number | null>(null);

  const selectedMeta = METAS_CONTENT.find(m => m.id === selectedMetaId) || METAS_CONTENT[0];

  const tabs = [
    { id: 'apresentacao', label: 'Apresentação', icon: <Heart className="w-4 h-4" /> },
    { id: 'resumo', label: 'Quadro-Resumo', icon: <FileText className="w-4 h-4" /> },
    { id: 'detalhes', label: 'Estudo das Metas', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'checklist', label: 'Checklist Rápido', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'referencias', label: 'Referências', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-xl overflow-hidden min-h-[550px]" id="study-material-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-5 md:p-6 flex items-center justify-between border-b border-brand-500/30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-brand-500/20 active:bg-brand-500/40 rounded-lg transition-colors text-white mr-1"
            title="Voltar para Desafios"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 text-brand-100 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">PDF Oficial</span>
              <span className="text-xs text-brand-200">Apostila Completa</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-[Space_Grotesk]">Apostila: 6 Metas de Segurança do Paciente</h1>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="hidden md:flex bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all items-center gap-1 border border-white/10"
        >
          Sair do Material
        </button>
      </div>

      {/* Tabs bar */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto scrollbar-none flex gap-1 px-4 py-2 sticky top-0 z-20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabTab(tab.id as any)}
            className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100 scale-[1.02]' 
                : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* APRESENTAÇÃO */}
          {activeTab === 'apresentacao' && (
            <motion.div
              key="apresentacao"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Cover card */}
              <div className="bg-gradient-to-br from-brand-600 to-indigo-700 text-white rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-brand-500/20 blur-2xl opacity-40 pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="inline-flex bg-brand-500/30 backdrop-blur-sm border border-brand-400/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-100">
                    Apostila Resumida para Treinamento
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight font-[Space_Grotesk] leading-tight">
                    6 Metas Internacionais de Segurança do Paciente
                  </h2>
                  <p className="text-brand-100 text-base md:text-lg leading-relaxed">
                    Material completo de estudo, revisão e fixação de conteúdo para a Copa de Segurança do Paciente.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs text-brand-200">
                    <span className="bg-white/10 px-3 py-1 rounded-full uppercase">Identificação</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full uppercase">Comunicação</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full uppercase">Medicamentos</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full uppercase">Cirurgia</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full uppercase">Higiene</span>
                    <span className="bg-white/10 px-3 py-1 rounded-full uppercase">Quedas</span>
                  </div>
                </div>
              </div>

              {/* Presentation Body */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 font-[Space_Grotesk]">Apresentação de Temáticas</h3>
                    <p className="text-slate-600 leading-relaxed text-base">
                      As Metas Internacionais de Segurança do Paciente são orientações globais usadas para reduzir riscos, prevenir eventos adversos graves e fortalecer uma assistência de saúde mais segura. Elas amparam a equipe de saúde a sedimentar rotinas padronizadas, minimizar falhas humanas involuntárias e blindar o paciente nos diversos âmbitos do atendimento.
                    </p>
                  </div>

                  {/* Highlight Quote */}
                  <div className="bg-brand-50 border-l-4 border-brand-600 rounded-r-xl p-5">
                    <div className="flex gap-3">
                      <Info className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm md:text-base uppercase tracking-wider mb-1">Ideia Central</h4>
                        <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                          A segurança do paciente não depende apenas de um profissional isolado. Ela exige comunicação clara, confirmação de informações, cumprimento rigoroso de protocolos e responsabilidade compartilhada entre todos os profissionais de saúde.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Study strategy */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 font-[Space_Grotesk] flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-brand-600" />
                      Como Estudar Este Material?
                    </h3>
                    <ol className="space-y-4 text-sm text-slate-600">
                      <li className="flex gap-3 items-start">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs shrink-0">1</span>
                        <span>Leia o <strong>Quadro-Resumo</strong> para entender as seis metas de forma pragmática e geral.</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs shrink-0">2</span>
                        <span>Navegue pelo menu <strong>Estudo das Metas</strong> para aprofundar nas práticas, exemplos e alertas de cada uma.</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs shrink-0">3</span>
                        <span>Use o <strong>Checklist Rápido</strong> para memorizar quais perguntas e respostas guiam sua rotina diária.</span>
                      </li>
                    </ol>
                  </div>

                  <button
                    onClick={() => setActiveTabTab('resumo')}
                    className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                  >
                    Começar Leitura <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* QUADRO RESUMO */}
          {activeTab === 'resumo' && (
            <motion.div
              key="resumo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
                <h3 className="text-2xl font-black text-slate-800 mb-2 font-[Space_Grotesk]">Quadro-Resumo das Metas</h3>
                <p className="text-slate-500 text-sm mb-6">Visão panorâmica consolidada das práticas essenciais do protocolo internacional.</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {METAS_CONTENT.map((meta) => (
                    <div 
                      key={meta.id}
                      className="bg-white rounded-xl border border-slate-150 hover:border-slate-350 transition-all shadow-sm flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Meta header color bar */}
                      <div className="p-4 flex items-start gap-3">
                        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white ${meta.color} shadow-sm group-hover:scale-105 transition-transform`}>
                          {meta.icon}
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block uppercase">{meta.shortTitle}</span>
                          <h4 className="font-bold text-slate-800 text-base leading-snug group-hover:text-brand-600 transition-colors">{meta.title.replace(/Meta \d+ - /, "")}</h4>
                        </div>
                      </div>

                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 italic">
                          "{meta.objective}"
                        </p>
                        <div className="border-t border-slate-100 pt-3">
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Prática Essencial:</span>
                          <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                            {meta.practices[0]} {meta.practices[1] || ""}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 border-t border-slate-100 p-2 text-center">
                        <button
                          onClick={() => {
                            setSelectedMetaId(meta.id);
                            setActiveTabTab('detalhes');
                          }}
                          className="w-full py-1 text-[11px] hover:text-brand-600 text-slate-500 font-bold transition-colors inline-flex justify-center items-center gap-1"
                        >
                          Ver Estudo Completo <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-8">
                  <p className="text-slate-600 text-xs md:text-sm text-center leading-relaxed">
                    💡 <strong>Lembre-se:</strong> Todas as metas se conectam. Um erro de identificação primária (Meta 1) contamina a rota assistencial inteira, podendo arruinar a administração de medicamentos (Meta 3), faturar cirurgia inadequada (Meta 4), ou atrapalhar auditorias clínicas.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ESTUDO DAS METAS */}
          {activeTab === 'detalhes' && (
            <motion.div
              key="detalhes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Meta selectors row */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {METAS_CONTENT.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMetaId(m.id)}
                    className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all border flex items-center gap-2 ${
                      selectedMetaId === m.id
                        ? `${m.color} text-white border-transparent shadow-md scale-[1.03]`
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className={selectedMetaId === m.id ? 'text-white' : m.textColor}>
                      {m.icon}
                    </span>
                    {m.shortTitle}
                  </button>
                ))}
              </div>

              {/* Meta Study Sheets */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Visual Header */}
                <div className={`${selectedMeta.color} text-white p-6 md:p-8 flex items-start gap-4 md:gap-5 relative`}>
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 rounded-full bg-white/10 blur-2xl opacity-50 pointer-events-none" />
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm self-start">
                    {React.cloneElement(selectedMeta.icon, { className: "w-8 h-8 md:w-10 md:h-10 text-white" })}
                  </div>
                  <div className="space-y-2">
                    <span className="bg-white/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded backdrop-blur-sm">Aprofundamento</span>
                    <h3 className="text-xl md:text-3xl font-black font-[Space_Grotesk] tracking-tight">{selectedMeta.title}</h3>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* Objective */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <span className="text-[10px] font-black text-slate-400 tracking-wider block uppercase mb-1">Objetivo Geral</span>
                    <p className="text-slate-700 text-sm md:text-base font-semibold leading-relaxed">
                      "{selectedMeta.objective}"
                    </p>
                  </div>

                  {/* Section: Meaning */}
                  <div>
                    <h4 className="text-base font-black text-slate-800 mb-2 border-b border-slate-100 pb-2 uppercase tracking-wide">O que essa meta significa?</h4>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      {selectedMeta.meaning}
                    </p>
                  </div>

                  {/* Section: Guidelines */}
                  <div>
                    <h4 className="text-base font-black text-slate-800 mb-3 border-b border-slate-100 pb-2 uppercase tracking-wide">Na Prática, a Equipe Deve:</h4>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {selectedMeta.practices.map((practice, idx) => (
                        <li key={idx} className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 flex gap-2.5 items-start text-xs md:text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Examples & Warning side by side */}
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    {/* Exemplo Prático */}
                    <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 rounded-full bg-emerald-100/20 blur-xl opacity-80" />
                      <div className="flex gap-3 relative z-10">
                        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest mb-1">Exemplo Prático</h5>
                          <p className="text-slate-700 text-xs md:text-sm leading-relaxed font-medium">
                            {selectedMeta.example}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Alerta de Cuidado */}
                    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 rounded-full bg-amber-100/20 blur-xl opacity-80" />
                      <div className="flex gap-3 relative z-10">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest mb-1">Atenção Especial</h5>
                          <p className="text-slate-700 text-xs md:text-sm leading-relaxed font-medium">
                            {selectedMeta.attention}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CHECKLIST RÁPIDO */}
          {activeTab === 'checklist' && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2 font-[Space_Grotesk]">Checklist Rápido para Revisão</h3>
                  <p className="text-slate-500 text-sm">Use este checklist para revisar os pontos cruciais de barreira clínica antes de exames e plantões assistenciais.</p>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-150">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 bg-slate-50 p-4 text-xs font-black text-slate-500 uppercase tracking-widest leading-none">
                    <div className="col-span-2 md:col-span-1">Meta</div>
                    <div className="col-span-10 md:col-span-6">Pergunta de Conferência</div>
                    <div className="hidden md:block md:col-span-5 pl-4">Resposta Esperada</div>
                  </div>

                  {/* Rows */}
                  {CHECKLIST_ITEMS.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 p-4 items-center gap-2 hover:bg-slate-50/30 transition-colors">
                      <div className="col-span-2 md:col-span-1">
                        <span className="flex items-center justify-center w-7 h-7 bg-brand-100 text-brand-700 rounded-lg text-xs font-black">
                          {item.id}
                        </span>
                      </div>
                      <div className="col-span-10 md:col-span-6 pr-2">
                        <span className="text-slate-800 font-bold text-sm md:text-base">{item.text}</span>
                        {/* Mobile view of response since it's hidden there */}
                        <div className="block md:hidden bg-slate-50 rounded-lg p-3 border border-slate-100 mt-2 text-xs text-slate-600 leading-normal">
                          <strong className="text-slate-500 block text-[9px] uppercase tracking-wider mb-0.5">Resposta Esperada</strong>
                          {item.response}
                        </div>
                      </div>
                      <div className="hidden md:block col-span-5 text-sm text-slate-600 font-medium pl-4 border-l border-slate-100">
                        {item.response}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Safety Message */}
                <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-100 rounded-2xl p-5 md:p-6 text-center space-y-2">
                  <span className="bg-red-600/10 text-red-700 text-[10px] font-extrabold px-2.5 py-1 rounded inline-block uppercase tracking-wider">Compromisso com o Paciente</span>
                  <p className="text-slate-800 text-sm md:text-base font-bold leading-relaxed max-w-2xl mx-auto">
                    "A rotina segura deve ser operada sempre, mesmo sob pressões ou escassez de tempo no setor de trabalho. A pressa amplia o risco de erro; os protocolos estruturados funcionam como barreiras insustentáveis de segurança."
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* REFERENCIAS */}
          {activeTab === 'referencias' && (
            <motion.div
              key="referencias"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2 font-[Space_Grotesk]">Referências bibliográficas</h3>
                  <p className="text-slate-500 text-sm">Base teórica nacional e internacional para consulta e validação legal dos materiais desenvolvidos.</p>
                </div>

                <div className="space-y-5">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl divide-y divide-slate-200/80 space-y-4">
                    <div className="pb-4">
                      <span className="text-[9px] font-black uppercase text-brand-600 block mb-1.5 tracking-wider">Ministério da Saúde</span>
                      <p className="text-slate-700 text-xs md:text-sm leading-relaxed font-semibold font-mono">
                        BRASIL. Ministério da Saúde. Programa Nacional de Segurança do Paciente. Portaria MS nº 529, de 1º de abril de 2013.
                      </p>
                    </div>

                    <div className="py-4">
                      <span className="text-[9px] font-black uppercase text-brand-600 block mb-1.5 tracking-wider">Anvisa</span>
                      <p className="text-slate-700 text-xs md:text-sm leading-relaxed font-semibold font-mono">
                        AGÊNCIA NACIONAL DE VIGILÂNCIA SANITÁRIA. Resolução RDC nº 36, de 25 de julho de 2013. Institui ações para a segurança do paciente em serviços de saúde.
                      </p>
                    </div>

                    <div className="py-4">
                      <span className="text-[9px] font-black uppercase text-brand-600 block mb-1.5 tracking-wider">Protocolos Básicos</span>
                      <p className="text-slate-700 text-xs md:text-sm leading-relaxed font-semibold font-mono">
                        ANVISA. Protocolos Básicos de Segurança do Paciente: identificação do paciente, comunicação, medicamentos, cirurgia segura, higienização das mãos e prevenção de quedas.
                      </p>
                    </div>

                    <div className="pt-4">
                      <span className="text-[9px] font-black uppercase text-brand-600 block mb-1.5 tracking-wider">Joint Commission International</span>
                      <p className="text-slate-700 text-xs md:text-sm leading-relaxed font-semibold font-mono">
                        JOINT COMMISSION INTERNATIONAL. International Patient Safety Goals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
