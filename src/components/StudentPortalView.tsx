import React, { useState } from 'react';
import { Kit, Student, UserProfile, KitStatus } from '../types';

interface StudentPortalViewProps {
  activeProfile: UserProfile;
  students: Student[];
  kits: Kit[];
  onRegisterKit?: (newKit: Omit<Kit, 'id'>) => void;
  onSendKitToCME?: (kitId: string) => void;
  onOpenNewWithdrawal?: () => void;
}

// Sugestões de instrumentos odontológicos para cadastro rápido
const COMMON_INSTRUMENTS: string[] = [
  'Espelho Bucal Plano nº 5',
  'Sonda Exploradora nº 23/17',
  'Pinça de Algodão Clínica',
  'Seringa Carpule c/ Refluxo',
  'Esculpidor Hollemback 3S',
  'Espátula de Inserção nº 1',
  'Brunidor Oval nº 29',
  'Cureta Gracey 5/6',
  'Cureta Gracey 11/12',
  'Cureta McCall 13/14',
  'Cabo de Bisturi nº 3',
  'Porta-Agulhas Mayo-Hegar',
  'Fórceps Universal nº 150',
  'Cuba Inox 60ml'
];

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  activeProfile,
  students,
  kits,
  onRegisterKit,
  onSendKitToCME
}) => {
  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedKitForLabel, setSelectedKitForLabel] = useState<Kit | null>(null);
  const [showStudentCardModal, setShowStudentCardModal] = useState(false);

  // Filtro exclusivo por STATUS DA MARMITA (conforme solicitação do usuário)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'CME' | 'IN_USE' | 'EXPIRED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Form para Nova Marmita
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    boxMaterial: string;
    items: string[];
    newItemInput: string;
    sendToCMEImmediately: boolean;
  }>({
    name: '',
    code: '',
    boxMaterial: 'Inox Perfurado 20x10x5',
    items: [],
    newItemInput: '',
    sendToCMEImmediately: true
  });

  // Aluno identificado
  const studentData = students.find(
    (s) => s.grr === activeProfile.studentGrr || s.id === activeProfile.studentId
  ) || students[0];

  const studentGrr = studentData?.grr || activeProfile.studentGrr || '20230192';
  const studentName = studentData?.name || activeProfile.name;

  // Filtrar apenas as marmitas deste estudante
  const studentKits = kits.filter(
    (k) =>
      k.ownerStudentGrr === studentGrr ||
      k.assignedTo === studentGrr ||
      k.name.toLowerCase().includes(studentName.toLowerCase().split(' ')[0])
  );

  // Contadores por status da marmita
  const readyCount = studentKits.filter((k) => k.status === 'Ready').length;
  const inCMECount = studentKits.filter((k) => k.status === 'Decontaminated').length;
  const inUseCount = studentKits.filter((k) => k.status === 'In Use').length;
  const expiredCount = studentKits.filter((k) => k.status === 'Expired' || k.status === 'Expiring').length;

  // Filtragem estrita por status da marmita + busca por código/nome
  const filteredKits = studentKits.filter((kit) => {
    // Filtro por STATUS DA MARMITA
    if (statusFilter === 'READY' && kit.status !== 'Ready') return false;
    if (statusFilter === 'CME' && kit.status !== 'Decontaminated') return false;
    if (statusFilter === 'IN_USE' && kit.status !== 'In Use') return false;
    if (statusFilter === 'EXPIRED' && kit.status !== 'Expired' && kit.status !== 'Expiring') return false;

    // Busca textual simples (código ou nome)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = kit.name.toLowerCase().includes(q);
      const matchCode = kit.code.toLowerCase().includes(q);
      const matchItems = kit.items?.some((i) => i.toLowerCase().includes(q));
      if (!matchName && !matchCode && !matchItems) return false;
    }

    return true;
  });

  // Abrir modal de cadastro com código pré-gerado
  const handleOpenRegisterModal = () => {
    const initials = studentName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 3)
      .join('')
      .toUpperCase();
    const count = studentKits.length + 1;
    const generatedCode = `MAR-${initials}-${count.toString().padStart(2, '0')}`;

    setFormData({
      name: `Marmita de Instrumentais #${count}`,
      code: generatedCode,
      boxMaterial: 'Inox Perfurado 20x10x5',
      items: ['Espelho Bucal Plano nº 5', 'Sonda Exploradora nº 23/17', 'Pinça de Algodão Clínica', 'Esculpidor Hollemback 3S'],
      newItemInput: '',
      sendToCMEImmediately: true
    });
    setIsRegisterModalOpen(true);
  };

  const handleAddItem = (item: string) => {
    if (!item.trim()) return;
    if (!formData.items.includes(item.trim())) {
      setFormData({
        ...formData,
        items: [...formData.items, item.trim()]
      });
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const initialStatus: KitStatus = formData.sendToCMEImmediately ? 'Decontaminated' : 'Ready';

    const newKitData: Omit<Kit, 'id'> = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      category: 'Geral',
      status: initialStatus,
      lastSterilized: initialStatus === 'Ready' ? new Date().toLocaleDateString('pt-BR') : 'Não esterilizado',
      cyclesLogged: initialStatus === 'Ready' ? 1 : 0,
      validityDays: initialStatus === 'Ready' ? 15 : 0,
      ownerStudentGrr: studentGrr,
      ownerStudentName: studentName,
      boxMaterial: formData.boxMaterial,
      items: formData.items.length > 0 ? formData.items : ['Espelho Bucal', 'Sonda Exploradora', 'Pinça Clínica'],
      notes: `Marmita cadastrada pelo acadêmico ${studentName} (${studentGrr}).`,
      autoclaveCycleId: initialStatus === 'Ready' ? `CICLO-${Math.floor(1000 + Math.random() * 9000)}` : 'CICLO-PENDENTE',
      biologicalTestResult: initialStatus === 'Ready' ? 'Negativo (Aprovado)' : 'Pendente'
    };

    if (onRegisterKit) {
      onRegisterKit(newKitData);
    }

    setIsRegisterModalOpen(false);
    setActionFeedback(`Marmita ${formData.code} cadastrada com sucesso! ${formData.sendToCMEImmediately ? 'Entregue a caixa física na CME para autoclave.' : 'Disponível como estéril.'}`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleSendToCMEClick = (kit: Kit) => {
    if (onSendKitToCME) {
      onSendKitToCME(kit.id);
    }
    setActionFeedback(`Marmita ${kit.code} encaminhada para a CME. Leve a caixa física ao guichê.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // Render do status da marmita
  const renderStatusBadge = (status: KitStatus, validityDays: number) => {
    switch (status) {
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-semibold rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Pronta na CME ({validityDays}d)</span>
          </span>
        );
      case 'Decontaminated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-[12px] font-semibold rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>Na CME / Autoclave</span>
          </span>
        );
      case 'In Use':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-[12px] font-semibold rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Em Uso na Clínica</span>
          </span>
        );
      case 'Expiring':
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 text-[12px] font-semibold rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Validade Vencida</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Topo Limpo e Direto */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[24px]">inventory_2</span>
            <h2 className="text-[22px] md:text-[24px] font-bold text-slate-900 tracking-tight">
              Minhas Marmitas
            </h2>
          </div>
          <p className="text-[13px] text-slate-500 mt-1">
            Acadêmico(a): <span className="font-semibold text-slate-800">{studentName}</span> • <span className="font-mono text-blue-600 font-semibold">GRR: {studentGrr}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowStudentCardModal(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Apresentar meu Cartão / QR Code no Balcão"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Meu Cartão QR</span>
          </button>

          <button
            onClick={handleOpenRegisterModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Cadastrar Nova Marmita</span>
          </button>
        </div>
      </div>

      {/* Feedback de Ação */}
      {actionFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-[13px] font-medium shadow-xs">
          <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Filtro por STATUS DA MARMITA (Sem tipos de especialidade) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Todas</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${statusFilter === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
                {studentKits.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('READY')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'READY'
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Prontas na CME (Estéreis)</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${statusFilter === 'READY' ? 'bg-emerald-900 text-emerald-100' : 'bg-emerald-200/80 text-emerald-900'}`}>
                {readyCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('CME')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'CME'
                  ? 'bg-amber-700 text-white font-semibold'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Na CME / Autoclave</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${statusFilter === 'CME' ? 'bg-amber-900 text-amber-100' : 'bg-amber-200/80 text-amber-900'}`}>
                {inCMECount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('IN_USE')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'IN_USE'
                  ? 'bg-blue-700 text-white font-semibold'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Em Uso Clínico</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${statusFilter === 'IN_USE' ? 'bg-blue-900 text-blue-100' : 'bg-blue-200/80 text-blue-900'}`}>
                {inUseCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('EXPIRED')}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'EXPIRED'
                  ? 'bg-rose-700 text-white font-semibold'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Vencidas / Expiradas</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${statusFilter === 'EXPIRED' ? 'bg-rose-900 text-rose-100' : 'bg-rose-200/80 text-rose-900'}`}>
                {expiredCount}
              </span>
            </button>
          </div>

          {/* Campo de Busca Rápido */}
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por código ou nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de Marmitas */}
      {filteredKits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKits.map((kit) => {
            const isReady = kit.status === 'Ready';
            const isDecontaminated = kit.status === 'Decontaminated';
            const isInUse = kit.status === 'In Use';
            const isExpired = kit.status === 'Expired' || kit.status === 'Expiring';

            return (
              <div
                key={kit.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Topo do Card: Código e Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono font-bold text-[13px] bg-slate-900 text-white px-2.5 py-1 rounded-md tracking-wider">
                      {kit.code}
                    </span>
                    {renderStatusBadge(kit.status, kit.validityDays)}
                  </div>

                  {/* Nome da Marmita */}
                  <h3 className="text-[16px] font-bold text-slate-900 mt-1">
                    {kit.name}
                  </h3>
                  <p className="text-[12px] text-slate-500">
                    {kit.boxMaterial || 'Caixa Inox'} • {kit.cyclesLogged} {kit.cyclesLogged === 1 ? 'ciclo realizado' : 'ciclos realizados'}
                  </p>

                  {/* Instrumentos Inclusos */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Instrumentais na caixa ({kit.items?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {kit.items?.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-50 text-slate-700 border border-slate-200/80 rounded-md text-[11.5px]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rodapé e Ações */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedKitForLabel(kit)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[12px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">qr_code</span>
                    <span>Ver Etiqueta</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Botão para entregar na CME caso esteja vencida ou usada */}
                    {(isExpired || (!isReady && !isDecontaminated && !isInUse)) && (
                      <button
                        onClick={() => handleSendToCMEClick(kit)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[12px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>Entregar na CME</span>
                      </button>
                    )}

                    {isReady && (
                      <span className="text-[11.5px] text-emerald-700 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Disponível no Balcão</span>
                      </span>
                    )}

                    {isDecontaminated && (
                      <span className="text-[11.5px] text-amber-800 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
                        <span>Aguardando Autoclave</span>
                      </span>
                    )}

                    {isInUse && (
                      <span className="text-[11.5px] text-blue-700 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                        <span>Em atendimento</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
          <span className="material-symbols-outlined text-[36px] text-slate-400 mb-2">inventory_2</span>
          <h4 className="text-[15px] font-bold text-slate-800">
            Nenhuma marmita encontrada com este status
          </h4>
          <p className="text-[12.5px] text-slate-500 mt-1 max-w-sm mx-auto">
            Você pode alterar o filtro acima ou cadastrar uma nova marmita para autoclave.
          </p>
          <button
            onClick={handleOpenRegisterModal}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Cadastrar Marmita</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Cadastrar Nova Marmita                                             */}
      {/* ========================================================================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">add_box</span>
                <h3 className="text-[16px] font-bold">Cadastrar Nova Marmita</h3>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitRegister} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-[12px] font-semibold text-slate-700 block mb-1">
                  Código da Marmita *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: MAR-MCS-02"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-mono font-bold text-blue-700 uppercase focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-slate-700 block mb-1">
                  Nome da Marmita / Descrição *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Marmita de Dentística - Mariana"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Instrumentais */}
              <div>
                <label className="text-[12px] font-semibold text-slate-700 block mb-1">
                  Instrumentais na Marmita ({formData.items.length})
                </label>

                {/* Sugestões rápidas */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    Sugestões rápidas (clique para adicionar):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_INSTRUMENTS.map((sug, idx) => {
                      const isAdded = formData.items.includes(sug);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddItem(sug)}
                          disabled={isAdded}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                            isAdded
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          {isAdded ? '✓ ' : '+ '}
                          {sug}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input de item customizado */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={formData.newItemInput}
                    onChange={(e) => setFormData({ ...formData, newItemInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem(formData.newItemInput);
                        setFormData({ ...formData, newItemInput: '' });
                      }
                    }}
                    placeholder="Adicionar outro instrumento..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddItem(formData.newItemInput);
                      setFormData({ ...formData, newItemInput: '' });
                    }}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[12px] font-semibold cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Lista selecionada */}
                <div className="flex flex-wrap gap-1 mt-2 max-h-28 overflow-y-auto p-1">
                  {formData.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-md text-[11.5px]"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-blue-500 hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Inicial */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sendToCMEImmediately}
                    onChange={(e) => setFormData({ ...formData, sendToCMEImmediately: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-[12.5px] text-slate-700">
                    Encaminhar imediatamente para a CME (aguardando autoclave)
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold cursor-pointer shadow-xs"
                >
                  Salvar Marmita
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[13px] font-medium cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Etiqueta de Identificação                                          */}
      {/* ========================================================================= */}
      {selectedKitForLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-[15px] font-bold">Etiqueta da Marmita</h3>
              <button
                onClick={() => setSelectedKitForLabel(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 space-y-2.5">
                <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                      CENTRAL DE ESTERILIZAÇÃO - CME
                    </span>
                    <h4 className="text-[15px] font-bold text-slate-900">{selectedKitForLabel.name}</h4>
                  </div>
                  <span className="font-mono font-bold text-[13px] bg-slate-900 text-white px-2 py-0.5 rounded">
                    {selectedKitForLabel.code}
                  </span>
                </div>

                <div className="text-[12px] space-y-1 text-slate-700">
                  <p><span className="text-slate-400">Aluno:</span> <strong>{studentName}</strong></p>
                  <p><span className="text-slate-400">GRR:</span> <strong className="font-mono">{studentGrr}</strong></p>
                  <p><span className="text-slate-400">Itens:</span> {selectedKitForLabel.items?.length || 0} instrumentos catalogados</p>
                </div>

                {/* Código de barras simulado */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="flex justify-center items-center gap-1 h-10">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full ${
                          i % 3 === 0 ? 'w-1 bg-slate-900' : i % 2 === 0 ? 'w-0.5 bg-slate-900' : 'w-1.5 bg-slate-900'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-800 block mt-1">
                    *{selectedKitForLabel.code}*
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActionFeedback(`Etiqueta de ${selectedKitForLabel.code} enviada para a impressora.`);
                    setSelectedKitForLabel(null);
                    setTimeout(() => setActionFeedback(null), 4000);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Imprimir Etiqueta</span>
                </button>
                <button
                  onClick={() => setSelectedKitForLabel(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[12.5px] font-medium cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Cartão QR do Aluno (Para mostrar no balcão)                        */}
      {/* ========================================================================= */}
      {showStudentCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-slate-200 text-center p-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">badge</span>
            </div>
            <h3 className="text-[17px] font-bold text-slate-900">{studentName}</h3>
            <p className="text-[13px] font-mono text-blue-600 font-bold mt-0.5">GRR: {studentGrr}</p>
            <p className="text-[11.5px] text-slate-500 mb-4">Acadêmico(a) de Odontologia</p>

            {/* QR Code Gráfico */}
            <div className="bg-slate-950 p-4 rounded-xl inline-block mx-auto mb-4">
              <div className="w-32 h-32 bg-slate-950 rounded grid grid-cols-6 gap-1 p-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i % 2 === 0 && i % 3 !== 0) || i === 0 || i === 5 || i === 30 || i === 35
                        ? 'bg-white'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-[11.5px] text-slate-500 mb-5 leading-relaxed">
              Apresente este código no balcão do almoxarifado para conferência e liberação rápida das suas marmitas.
            </p>

            <button
              onClick={() => setShowStudentCardModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12.5px] font-semibold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
