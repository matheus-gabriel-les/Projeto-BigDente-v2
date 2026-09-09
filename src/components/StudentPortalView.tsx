import React, { useState } from 'react';
import { Kit, Student, UserProfile, KitStatus, TabType } from '../types';

interface StudentPortalViewProps {
  currentTab?: TabType;
  activeProfile: UserProfile;
  students: Student[];
  kits: Kit[];
  onRegisterKit?: (newKit: Omit<Kit, 'id'>) => void;
  onSendKitToCME?: (kitId: string) => void;
  onUpdateKitStatus?: (kitId: string, newStatus: KitStatus) => void;
  onDeleteKit?: (kitId: string) => void;
  onOpenNewWithdrawal?: () => void;
  onExecuteTransaction?: (params: {
    studentGrr: string;
    kitId: string;
    type: 'Withdrawal' | 'Return';
    withdrawnMarmitas?: number;
    withdrawnPacotes?: number;
  }) => void;
}

// Os status exibidos para alunos/acadêmicos
export type SimplifiedStudentStatus =
  | 'Prontas'
  | 'Esterilizando'
  | 'Aguardando liberação'
  | 'Vencidas'
  | 'Reprovado';

export function normalizeStudentStatus(kit: Kit): SimplifiedStudentStatus {
  const status = kit.status;
  if (status === 'Reprovado') {
    return 'Reprovado';
  }
  if (status === 'Aguardando Liberação' || (status as string) === 'Pending Release') {
    return 'Aguardando liberação';
  }
  if (status === 'Decontaminated' || status === 'Esterilizando') {
    return 'Esterilizando';
  }
  if (status === 'Expired' || status === 'Expiring' || status === 'Vencida') {
    return 'Vencidas';
  }
  // Se for 'Ready', 'Pronta' ou em uso com ciclo válido, é 'Prontas'
  return 'Prontas';
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentTab = 'student_space',
  activeProfile,
  students,
  kits,
  onRegisterKit,
  onSendKitToCME,
  onUpdateKitStatus,
  onDeleteKit,
  onExecuteTransaction,
}) => {
  // Controle de abas principais (Minhas Marmitas / Kits vs Kits Prontos)
  const [activeInternalTab, setActiveInternalTab] = useState<'my_kits' | 'ready_kits'>(
    currentTab === 'student_available' ? 'ready_kits' : 'my_kits'
  );

  React.useEffect(() => {
    if (currentTab === 'student_available') {
      setActiveInternalTab('ready_kits');
    } else if (currentTab === 'student_space') {
      setActiveInternalTab('my_kits');
    }
  }, [currentTab]);

  const isReadyTab = activeInternalTab === 'ready_kits';

  // Modais
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showStudentCardModal, setShowStudentCardModal] = useState(false);
  const [confirmCancelKitId, setConfirmCancelKitId] = useState<string | null>(null);

  // Modal de retirada de itens (marmita individual ou pacote individual)
  const [withdrawingKit, setWithdrawingKit] = useState<Kit | null>(null);
  const [withdrawMarmitas, setWithdrawMarmitas] = useState<number>(1);
  const [withdrawPacotes, setWithdrawPacotes] = useState<number>(0);

  // Modal de devolução de itens usados
  const [returningKit, setReturningKit] = useState<Kit | null>(null);
  const [returnMarmitas, setReturnMarmitas] = useState<number>(1);
  const [returnPacotes, setReturnPacotes] = useState<number>(0);

  // Filtro simplificado com os status permitidos
  const [statusFilter, setStatusFilter] = useState<'ALL' | SimplifiedStudentStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Identificação do acadêmico logado
  const studentData =
    students.find(
      (s) => s.grr === activeProfile.studentGrr || s.id === activeProfile.studentId
    ) || students[0];

  const studentGrr = studentData?.grr || activeProfile.studentGrr || '20230192';
  const studentName = studentData?.name || activeProfile.name;
  const studentNumericPassword = studentData?.numericPassword ?? 142; // Senha numérica de 3 dígitos (0 a 400)
  const formattedStudentPin = String(studentNumericPassword).padStart(3, '0');

  // Formulário de cadastro de KIT (apenas quantidades de Marmitas e Pacotes)
  const [registerForm, setRegisterForm] = useState({
    code: '',
    name: 'Kit Clínico',
    grr: studentGrr,
    studentName: studentName,
    marmitasCount: 1, // X marmitas (itens como bisturis, etc.)
    pacotesCount: 1,  // Y pacotes (itens moles como capas de cirurgia, etc.)
    notes: '',
  });

  // Filtra os kits pertencentes a este acadêmico
  const studentKits = kits.filter(
    (k) =>
      k.ownerStudentGrr === studentGrr ||
      k.assignedTo === studentGrr ||
      (k.ownerStudentName && k.ownerStudentName.toLowerCase() === studentName.toLowerCase()) ||
      k.name.toLowerCase().includes(studentName.toLowerCase().split(' ')[0])
  );

  // Contadores calculados para os status
  const readyKits = studentKits.filter((k) => normalizeStudentStatus(k) === 'Prontas');
  const sterilizingKits = studentKits.filter((k) => normalizeStudentStatus(k) === 'Esterilizando');
  const pendingReleaseKits = studentKits.filter((k) => normalizeStudentStatus(k) === 'Aguardando liberação');
  const expiredKits = studentKits.filter((k) => normalizeStudentStatus(k) === 'Vencidas');
  const reprovedKits = studentKits.filter((k) => normalizeStudentStatus(k) === 'Reprovado');

  // Kits exibidos na aba "Minhas Marmitas / Kits"
  const filteredMyKits = studentKits.filter((kit) => {
    const normStatus = normalizeStudentStatus(kit);
    if (statusFilter !== 'ALL' && normStatus !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = kit.name.toLowerCase().includes(q);
      const matchCode = kit.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  // Kits exibidos na aba "Kits Prontos"
  const displayedReadyKits = readyKits.filter((kit) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = kit.name.toLowerCase().includes(q);
      const matchCode = kit.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  // Abrir modal de cadastro sugerindo código prévio
  const handleOpenRegisterModal = () => {
    const initials = studentName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 3)
      .join('')
      .toUpperCase();
    const nextNum = studentKits.length + 1;
    const suggestedCode = `KIT-${initials}-${nextNum.toString().padStart(2, '0')}`;

    setRegisterForm({
      code: suggestedCode,
      name: `Kit ${suggestedCode}`,
      grr: studentGrr,
      studentName: studentName,
      marmitasCount: 1,
      pacotesCount: 1,
      notes: '',
    });
    setIsRegisterModalOpen(true);
  };

  // Cadastrar e Enviar diretamente para Liberação
  const handleSaveAndSendForRelease = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = studentName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 3)
      .join('')
      .toUpperCase();
    const nextNum = studentKits.length + 1;
    const codeToUse = registerForm.code || `KIT-${initials}-${nextNum.toString().padStart(2, '0')}`;

    const newKitData: Omit<Kit, 'id'> = {
      code: codeToUse,
      name: `Kit ${codeToUse}`,
      status: 'Aguardando Liberação',
      lastSterilized: 'Aguardando conferência',
      cyclesLogged: 0,
      validityDays: 15,
      ownerStudentGrr: studentGrr,
      ownerStudentName: studentName,
      marmitasCount: Math.max(0, registerForm.marmitasCount),
      pacotesCount: Math.max(0, registerForm.pacotesCount),
      notes: `Composição: ${registerForm.marmitasCount} marmita(s) + ${registerForm.pacotesCount} pacote(s). Aguardando liberação no balcão.`,
      biologicalTestResult: 'Pendente',
    };

    if (onRegisterKit) {
      onRegisterKit(newKitData);
    }

    setIsRegisterModalOpen(false);
    setActionFeedback(
      `Kit ${codeToUse} cadastrado e enviado para liberação no balcão de esterilização!`
    );
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // Ação de enviar kit existente para liberação
  const handleSendKitForRelease = (kit: Kit) => {
    if (onUpdateKitStatus) {
      onUpdateKitStatus(kit.id, 'Aguardando Liberação');
    } else if (onSendKitToCME) {
      onSendKitToCME(kit.id);
    }
    setActionFeedback(`Kit ${kit.code} enviado para liberação no setor de esterilização/balcão!`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // Ação de cancelar kit ou cancelar liberação
  const handleConfirmCancelKit = (kitId: string) => {
    if (onDeleteKit) {
      onDeleteKit(kitId);
    } else if (onUpdateKitStatus) {
      onUpdateKitStatus(kitId, 'Vencida');
    }
    setConfirmCancelKitId(null);
    setActionFeedback(`Kit cancelado e removido com sucesso.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  // Retirada Parcial ou Total de Marmitas e Pacotes do Kit
  const handleOpenWithdrawModal = (kit: Kit) => {
    const totalM = kit.marmitasCount ?? 1;
    const totalP = kit.pacotesCount ?? 0;
    const withM = kit.marmitasWithdrawn || 0;
    const withP = kit.pacotesWithdrawn || 0;
    const availM = Math.max(0, totalM - withM);
    const availP = Math.max(0, totalP - withP);

    setWithdrawingKit(kit);
    setWithdrawMarmitas(availM > 0 ? 1 : 0);
    setWithdrawPacotes(availP > 0 && availM === 0 ? 1 : 0);
  };

  const handleConfirmWithdrawal = () => {
    if (!withdrawingKit) return;
    if (onExecuteTransaction) {
      onExecuteTransaction({
        studentGrr,
        kitId: withdrawingKit.code,
        type: 'Withdrawal',
        withdrawnMarmitas: withdrawMarmitas,
        withdrawnPacotes: withdrawPacotes
      });
    }
    const parts = [];
    if (withdrawMarmitas > 0) parts.push(`${withdrawMarmitas} marmita(s)`);
    if (withdrawPacotes > 0) parts.push(`${withdrawPacotes} pacote(s)`);
    setActionFeedback(
      `Retirada realizada: ${parts.join(' e ')} do kit ${withdrawingKit.code} retirados com sucesso!`
    );
    setWithdrawingKit(null);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* CABEÇALHO DO ACADÊMICO                                                    */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                isReadyTab
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {isReadyTab ? 'Prontas para Uso' : 'Portal do Acadêmico'}
            </span>
            <span className="text-[12px] font-medium text-slate-500">
              Aluno: <strong className="text-slate-800">{studentName}</strong> • GRR:{' '}
              <strong className="font-mono text-blue-600">{studentGrr}</strong>
            </span>
          </div>

          <h2 className="text-[22px] md:text-[25px] font-bold text-slate-900 tracking-tight">
            {isReadyTab ? 'Kits Prontos para Retirada' : 'Meus Kits e Marmitas'}
          </h2>

          <p className="text-[13.5px] text-slate-500 mt-0.5 max-w-2xl">
            {isReadyTab
              ? 'Consulte os kits de instrumental já esterilizados e liberados para atendimento clínico.'
              : 'Gerencie seus kits compostos por marmitas (itens rígidos/bisturis) e pacotes (itens moles/capas de cirurgia).'}
          </p>
        </div>

        {/* Ações do Topo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-student-qr-modal"
            onClick={() => setShowStudentCardModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 border border-slate-700"
            title="Apresentar QR Code para Retirada no Balcão"
          >
            <span className="material-symbols-outlined text-[19px] text-emerald-400">qr_code_2</span>
            <span>Apresentar QR Code para Retirada</span>
          </button>

          {!isReadyTab && (
            <button
              id="btn-register-kit-open"
              onClick={handleOpenRegisterModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">add_box</span>
              <span>Cadastrar Novo Kit</span>
            </button>
          )}
        </div>
      </div>

      {/* Switcher de abas principais */}
      <div className="flex gap-2 border-b border-slate-200/90 pb-3">
        <button
          onClick={() => {
            setActiveInternalTab('my_kits');
            setSearchQuery('');
          }}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            !isReadyTab
              ? 'bg-blue-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          <span>Meus Kits</span>
          <span
            className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
              !isReadyTab ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {studentKits.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveInternalTab('ready_kits');
            setSearchQuery('');
          }}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            isReadyTab
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'border border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/60'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>Prontas para Retirada</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              isReadyTab ? 'bg-emerald-950 text-emerald-200' : 'bg-emerald-200 text-emerald-900'
            }`}
          >
            {readyKits.length} Prontas
          </span>
        </button>
      </div>

      {/* Feedback de ação */}
      {actionFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between gap-2 text-[13px] font-medium shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>{actionFeedback}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-[12px] cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 1: MEUS KITS (Filtros estritamente com os 4 status solicitados)       */}
      {/* ========================================================================= */}
      {!isReadyTab && (
        <div className="space-y-6">
          {/* Barra de Filtros: APENAS Prontas, Esterilizando, Aguardando liberação e Vencidas */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {/* Todos */}
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Todos os Kits</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === 'ALL'
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {studentKits.length}
                  </span>
                </button>

                {/* 1. Prontas */}
                <button
                  onClick={() => setStatusFilter('Prontas')}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'Prontas'
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Prontas</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === 'Prontas'
                        ? 'bg-emerald-900 text-emerald-100'
                        : 'bg-emerald-200/80 text-emerald-900'
                    }`}
                  >
                    {readyKits.length}
                  </span>
                </button>

                {/* 2. Esterilizando */}
                <button
                  onClick={() => setStatusFilter('Esterilizando')}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'Esterilizando'
                      ? 'bg-amber-700 text-white font-semibold'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Esterilizando</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === 'Esterilizando'
                        ? 'bg-amber-900 text-amber-100'
                        : 'bg-amber-200/80 text-amber-900'
                    }`}
                  >
                    {sterilizingKits.length}
                  </span>
                </button>

                {/* 3. Aguardando liberação */}
                <button
                  onClick={() => setStatusFilter('Aguardando liberação')}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'Aguardando liberação'
                      ? 'bg-blue-700 text-white font-semibold'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Aguardando liberação</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === 'Aguardando liberação'
                        ? 'bg-blue-900 text-blue-100'
                        : 'bg-blue-200/80 text-blue-900'
                    }`}
                  >
                    {pendingReleaseKits.length}
                  </span>
                </button>

                {/* 4. Vencidas */}
                <button
                  onClick={() => setStatusFilter('Vencidas')}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'Vencidas'
                      ? 'bg-rose-700 text-white font-semibold'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Vencidas</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === 'Vencidas'
                        ? 'bg-rose-900 text-rose-100'
                        : 'bg-rose-200/80 text-rose-900'
                    }`}
                  >
                    {expiredKits.length}
                  </span>
                </button>

                {/* 5. Reprovado */}
                <button
                  onClick={() => setStatusFilter('Reprovado')}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'Reprovado'
                      ? 'bg-red-700 text-white font-semibold'
                      : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200/60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Reprovado</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === 'Reprovado'
                        ? 'bg-red-900 text-red-100'
                        : 'bg-red-200/80 text-red-900'
                    }`}
                  >
                    {reprovedKits.length}
                  </span>
                </button>
              </div>

              {/* Busca por código ou nome do kit */}
              <div className="relative w-full md:w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar kit ou código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lista de Kits */}
          {filteredMyKits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMyKits.map((kit) => {
                const normStatus = normalizeStudentStatus(kit);
                const isReady = normStatus === 'Prontas';
                const isSterilizing = normStatus === 'Esterilizando';
                const isPendingRelease = normStatus === 'Aguardando liberação';
                const isExpired = normStatus === 'Vencidas';
                const isReproved = normStatus === 'Reprovado';

                // Marmitas e pacotes computados
                const marmitasNum = kit.marmitasCount ?? (kit.boxMaterial?.includes('Inox') ? 1 : 1);
                const pacotesNum = kit.pacotesCount ?? 1;

                return (
                  <div
                    key={kit.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Topo do Card com Código e Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[14px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
                              {kit.code}
                            </span>
                            <span className="text-[11.5px] font-medium text-slate-400">
                              GRR: {kit.ownerStudentGrr || studentGrr}
                            </span>
                          </div>
                          <h4 className="text-[16px] font-bold text-slate-900 mt-1.5">{kit.name}</h4>
                          <p className="text-[12px] text-slate-500">
                            Responsável: {kit.ownerStudentName || studentName}
                          </p>
                        </div>

                        {/* Badges dos status */}
                        <div>
                          {isReady && (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11.5px] font-bold rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              <span>Prontas ({kit.validityDays || 15}d)</span>
                            </span>
                          )}
                          {isSterilizing && (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-[11.5px] font-bold rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                              <span>Esterilizando</span>
                            </span>
                          )}
                          {isPendingRelease && (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-[11.5px] font-bold rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              <span>Aguardando liberação</span>
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 text-[11.5px] font-bold rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              <span>Vencidas</span>
                            </span>
                          )}
                          {isReproved && (
                            <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 text-[11.5px] font-bold rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              <span>Reprovado</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Composição do Kit (X Marmitas / Y Pacotes) */}
                      {(() => {
                        const totalM = kit.marmitasCount ?? 1;
                        const totalP = kit.pacotesCount ?? 0;
                        const withM = kit.marmitasWithdrawn || 0;
                        const withP = kit.pacotesWithdrawn || 0;
                        const availM = Math.max(0, totalM - withM);
                        const availP = Math.max(0, totalP - withP);
                        const hasInUse = withM > 0 || withP > 0;

                        return (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Composição do Kit ({totalM + totalP} volumes):
                              </span>
                              {hasInUse && (
                                <span className="text-[10.5px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                                  <span>Em uso clínico</span>
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[12px]">
                              <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 text-[20px]">
                                  lunch_dining
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900 block text-[13px]">
                                    {totalM} Marmita(s)
                                  </span>
                                  <span className="text-[11px] text-slate-600 block leading-tight">
                                    {availM} disponível(is) {withM > 0 && <strong className="text-amber-700 font-semibold">• {withM} em uso</strong>}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-600 text-[20px]">
                                  inventory
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900 block text-[13px]">
                                    {totalP} Pacote(s)
                                  </span>
                                  <span className="text-[11px] text-slate-600 block leading-tight">
                                    {availP} disponível(is) {withP > 0 && <strong className="text-amber-700 font-semibold">• {withP} em uso</strong>}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {hasInUse && (
                              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11.5px] text-amber-900 flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px] text-amber-700">medical_services</span>
                                  <span>Em clínica: <strong>{withM > 0 ? `${withM} marmita(s)` : ''} {withP > 0 ? `${withP} pacote(s)` : ''}</strong></span>
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[11.5px] text-slate-500 pt-1 border-t border-slate-200/60">
                              <span>Última Esterilização: <strong className="text-slate-700">{kit.lastSterilized}</strong></span>
                              <span>Laudo: <strong className="text-emerald-700">{kit.biologicalTestResult || 'Aprovado'}</strong></span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Ações do Kit (Enviar para Liberação & Cancelar) */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      {/* Caso 1: Aguardando liberação */}
                      {isPendingRelease && (
                        <>
                          <div className="flex-1 text-[12px] text-blue-700 font-medium flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-blue-600 animate-pulse">
                              hourglass_top
                            </span>
                            <span>Enviado. Aguardando conferência no balcão de esterilização</span>
                          </div>
                          <button
                            onClick={() => setConfirmCancelKitId(kit.id)}
                            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl text-[12px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Cancelar solicitação deste kit"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                            <span>Cancelar</span>
                          </button>
                        </>
                      )}

                      {/* Caso 2: Prontas */}
                      {isReady && (
                        <div className="w-full space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {(() => {
                              const totalM = kit.marmitasCount ?? 1;
                              const totalP = kit.pacotesCount ?? 0;
                              const withM = kit.marmitasWithdrawn || 0;
                              const withP = kit.pacotesWithdrawn || 0;
                              const availM = Math.max(0, totalM - withM);
                              const availP = Math.max(0, totalP - withP);
                              const canWithdraw = availM > 0 || availP > 0;

                              return canWithdraw ? (
                                <button
                                  onClick={() => handleOpenWithdrawModal(kit)}
                                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                                >
                                  <span className="material-symbols-outlined text-[17px]">output</span>
                                  <span>
                                    {(totalM + totalP) > 1
                                      ? `Retirar Itens do Kit (${availM + availP} disp.)`
                                      : 'Retirar Marmita / Kit'}
                                  </span>
                                </button>
                              ) : (
                                <div className="flex-1 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[12px] font-semibold text-center">
                                  Todos os volumes retirados para clínica
                                </div>
                              );
                            })()}

                            <button
                              onClick={() => setShowStudentCardModal(true)}
                              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[12px] font-semibold flex items-center gap-1 cursor-pointer"
                              title="Apresentar Matrícula no Balcão"
                            >
                              <span className="material-symbols-outlined text-[16px]">badge</span>
                              <span>Apresentar</span>
                            </button>

                            <button
                              onClick={() => setConfirmCancelKitId(kit.id)}
                              className="px-3 py-2 text-slate-400 hover:text-rose-600 rounded-xl text-[12px] font-medium cursor-pointer"
                              title="Cancelar/remover kit"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Caso 3: Esterilizando */}
                      {isSterilizing && (
                        <div className="w-full flex justify-between items-center text-[12px] text-amber-800 bg-amber-50/80 border border-amber-200/70 p-2.5 rounded-xl">
                          <span className="flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-[18px] text-amber-600 animate-spin">
                              autorenew
                            </span>
                            <span>Em ciclo na máquina de esterilização</span>
                          </span>
                          <button
                            onClick={() => setConfirmCancelKitId(kit.id)}
                            className="text-slate-500 hover:text-rose-700 font-medium text-[11.5px] cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}

                      {/* Caso 4: Vencidas */}
                      {isExpired && (
                        <>
                          <button
                            onClick={() => handleSendKitForRelease(kit)}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                          >
                            <span className="material-symbols-outlined text-[17px]">send</span>
                            <span>Enviar para Liberação</span>
                          </button>
                          <button
                            onClick={() => setConfirmCancelKitId(kit.id)}
                            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl text-[12px] font-medium cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </>
                      )}

                      {/* Caso 5: Reprovado */}
                      {isReproved && (
                        <div className="w-full space-y-2.5">
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-900">
                            <div className="flex items-center gap-1.5 font-bold mb-1 text-red-800">
                              <span className="material-symbols-outlined text-red-600 text-[18px]">gpp_bad</span>
                              <span>Solicitação Não Aprovada no Balcão:</span>
                            </div>
                            <p className="text-red-700 leading-relaxed font-medium mb-2">
                              {kit.rejectionReason || kit.notes || 'Embalagem ou integridade dos volumes reprovada pela atendente.'}
                            </p>
                            <div className="bg-red-100/50 p-2 rounded border border-red-200 text-[11px] text-red-800 font-semibold flex items-start gap-1.5">
                              <span className="material-symbols-outlined text-[16px] mt-0.5">warning</span>
                              <span>Este kit foi bloqueado para reenvio. Dirija-a ao balcão para retirar os materiais reprovados, regularize-os e inicie uma nova solicitação.</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setConfirmCancelKitId(kit.id)}
                              className="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl text-[12px] font-bold cursor-pointer transition-colors shadow-xs"
                            >
                              Remover / Cancelar Solicitação
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-[42px] text-slate-400 mb-2">inventory_2</span>
              <h3 className="text-[16px] font-bold text-slate-800">Nenhum kit encontrado neste status</h3>
              <p className="text-[13px] text-slate-500 mt-1 mb-4">
                Cadastre um novo kit especificando o número de marmitas e pacotes.
              </p>
              <button
                onClick={handleOpenRegisterModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add_box</span>
                <span>Cadastrar Novo Kit</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: KITS PRONTOS PARA RETIRADA (Exclusivamente status "Prontas")       */}
      {/* ========================================================================= */}
      {isReadyTab && (
        <div className="space-y-6">
          <div className="p-5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-emerald-950">
                  Kits Esterilizados e Prontos para Retirada
                </h3>
                <p className="text-[13px] text-emerald-900 mt-0.5">
                  Estes kits passaram pelo ciclo completo de esterilização com teste biológico aprovado.
                  Você pode retirar o kit inteiro ou volumes específicos de marmitas e pacotes.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowStudentCardModal(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-xs shrink-0 active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>Apresentar no Balcão</span>
            </button>
          </div>

          {/* Grid de Kits Prontos */}
          {displayedReadyKits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedReadyKits.map((kit) => (
                <div
                  key={kit.id}
                  className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[14px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-lg">
                          {kit.code}
                        </span>
                        <span className="text-[11.5px] font-medium text-slate-500">
                          GRR: {kit.ownerStudentGrr || studentGrr}
                        </span>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Pronta ({kit.validityDays || 15} dias)</span>
                      </span>
                    </div>

                    <h4 className="text-[16px] font-bold text-slate-900 mt-1">{kit.name}</h4>
                    <p className="text-[12.5px] text-slate-500 mb-3">
                      Proprietário: <strong>{kit.ownerStudentName || studentName}</strong>
                    </p>

                    {(() => {
                      const totalM = kit.marmitasCount ?? 1;
                      const totalP = kit.pacotesCount ?? 0;
                      const withM = kit.marmitasWithdrawn || 0;
                      const withP = kit.pacotesWithdrawn || 0;
                      const availM = Math.max(0, totalM - withM);
                      const availP = Math.max(0, totalP - withP);
                      const hasInUse = withM > 0 || withP > 0;
                      const canWithdraw = availM > 0 || availP > 0;

                      return (
                        <>
                          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-[12px] space-y-2 mb-4">
                            <div className="grid grid-cols-2 gap-2 text-emerald-950 font-medium">
                              <div>
                                <span>🍱 {totalM} Marmita(s)</span>
                                <span className="block text-[11px] text-emerald-800">
                                  {availM} disponível(is) {withM > 0 && `(${withM} em uso)`}
                                </span>
                              </div>
                              <div>
                                <span>📦 {totalP} Pacote(s)</span>
                                <span className="block text-[11px] text-emerald-800">
                                  {availP} disponível(is) {withP > 0 && `(${withP} em uso)`}
                                </span>
                              </div>
                            </div>
                            <div className="flex justify-between text-slate-600 text-[11.5px] pt-1.5 border-t border-emerald-200/50">
                              <span>Esterilizado em: <strong className="text-slate-800">{kit.lastSterilized}</strong></span>
                              <span>Teste biológico: <strong className="text-emerald-800">Aprovado</strong></span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                            {canWithdraw ? (
                              <button
                                onClick={() => handleOpenWithdrawModal(kit)}
                                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                              >
                                <span className="material-symbols-outlined text-[17px]">output</span>
                                <span>
                                  {(totalM + totalP) > 1
                                    ? `Retirar Itens (${availM + availP} disp.)`
                                    : 'Retirar Marmita / Kit'}
                                </span>
                              </button>
                            ) : (
                              <div className="flex-1 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[12px] font-semibold text-center">
                                Todos os itens já retirados para clínica
                              </div>
                            )}

                            <button
                              onClick={() => setShowStudentCardModal(true)}
                              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[12px] font-semibold flex items-center gap-1 cursor-pointer"
                              title="Apresentar Matrícula no Balcão"
                            >
                              <span className="material-symbols-outlined text-[16px]">badge</span>
                              <span>Apresentar</span>
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-[42px] text-slate-400 mb-2">verified</span>
              <h3 className="text-[16px] font-bold text-slate-800">Nenhum kit pronto no momento</h3>
              <p className="text-[13px] text-slate-500 mt-1">
                Kits em processo de esterilização aparecerão aqui assim que forem concluídos e aprovados.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CADASTRAR NOVO KIT (COM MARMITAS, PACOTES E ENVIAR PARA LIBERAÇÃO)  */}
      {/* ========================================================================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Header do Modal */}
            <div className="p-4.5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[20px]">add_box</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold">Cadastrar Novo Kit</h3>
                  <p className="text-[11px] text-slate-300">
                    Defina o kit com a quantidade de marmitas e pacotes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveAndSendForRelease} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] text-slate-700 leading-relaxed flex items-center gap-2.5">
                <span className="material-symbols-outlined text-blue-600 text-[22px] shrink-0">info</span>
                <span>
                  Informe apenas as quantidades de volumes (marmitas e pacotes). Não é necessário especificar itens ou controle por especialidade.
                </span>
              </div>

              {/* DADOS DO ACADÊMICO (IMUTÁVEIS) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">lock</span>
                    <span>Dados do Acadêmico (Imutáveis)</span>
                  </span>
                  <span className="text-[10.5px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    Registro Oficial
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px]">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Nome do Acadêmico
                    </label>
                    <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200/80 rounded-lg text-slate-700 font-semibold flex items-center justify-between">
                      <span>{studentName}</span>
                      <span className="material-symbols-outlined text-[15px] text-slate-400">lock</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      GRR (Matrícula)
                    </label>
                    <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200/80 rounded-lg font-mono text-slate-700 font-bold flex items-center justify-between">
                      <span>{studentGrr}</span>
                      <span className="material-symbols-outlined text-[15px] text-slate-400">lock</span>
                    </div>
                  </div>
                </div>

                {/* Senha Numérica do Aluno (3 dígitos de 0 a 400, não pode ser alterada) */}
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[12px]">
                      <span className="material-symbols-outlined text-[17px] text-amber-600">password</span>
                      <span>Senha Numérica do Aluno (0 a 400)</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Início do Curso • Não Editável
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[18px] font-bold text-slate-900 bg-slate-100 border border-slate-300 px-3 py-0.5 rounded-md tracking-wider">
                        {formattedStudentPin}
                      </span>
                      <span className="text-[11.5px] text-slate-500">
                        Senha fixa atrelada ao seu início de curso
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                  </div>
                </div>
              </div>

              {/* IDENTIFICAÇÃO DO KIT (NÃO É UM CAMPO - APENAS EXIBE O CÓDIGO DO KIT) */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-0.5">
                      Código Previsto do Kit:
                    </span>
                    <span className="font-mono text-[16px] font-bold text-blue-800">
                      {registerForm.code || `KIT-${studentGrr}`}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg">
                    Gerado Automaticamente
                  </span>
                </div>
              </div>

              {/* COMPOSIÇÃO DO KIT - APENAS MARMITAS (X) E PACOTES (Y) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[12px] font-bold text-slate-800 block">
                  Composição dos Volumes a Entregar:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Número de Marmitas */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1 text-blue-700">
                      <span className="material-symbols-outlined text-[18px]">lunch_dining</span>
                      <label className="text-[12px] font-bold">Nº de Marmitas</label>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2 leading-tight">
                      Marmitas rígidas (instrumental metálico)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRegisterForm({
                            ...registerForm,
                            marmitasCount: Math.max(0, registerForm.marmitasCount - 1),
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-[16px] cursor-pointer flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={registerForm.marmitasCount}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            marmitasCount: Math.max(0, parseInt(e.target.value) || 0),
                          })
                        }
                        className="w-16 text-center py-1.5 border border-slate-300 rounded-lg font-bold text-[14px] text-slate-900 focus:outline-hidden focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setRegisterForm({
                            ...registerForm,
                            marmitasCount: registerForm.marmitasCount + 1,
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 font-bold text-blue-700 text-[16px] cursor-pointer flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="text-[11.5px] text-slate-500 font-medium">marmita(s)</span>
                    </div>
                  </div>

                  {/* Número de Pacotes */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1 text-purple-700">
                      <span className="material-symbols-outlined text-[18px]">inventory</span>
                      <label className="text-[12px] font-bold">Nº de Pacotes</label>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2 leading-tight">
                      Pacotes moles (capas de cirurgia, aventais e campos)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRegisterForm({
                            ...registerForm,
                            pacotesCount: Math.max(0, registerForm.pacotesCount - 1),
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-[16px] cursor-pointer flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={registerForm.pacotesCount}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            pacotesCount: Math.max(0, parseInt(e.target.value) || 0),
                          })
                        }
                        className="w-16 text-center py-1.5 border border-slate-300 rounded-lg font-bold text-[14px] text-slate-900 focus:outline-hidden focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setRegisterForm({
                            ...registerForm,
                            pacotesCount: registerForm.pacotesCount + 1,
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-purple-100 hover:bg-purple-200 font-bold text-purple-700 text-[16px] cursor-pointer flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="text-[11.5px] text-slate-500 font-medium">pacote(s)</span>
                    </div>
                  </div>
                </div>

                <div className="text-[12px] text-slate-700 font-medium text-center bg-slate-100 py-2 rounded-lg">
                  Total a entregar no balcão:{' '}
                  <strong>{registerForm.marmitasCount} marmita(s)</strong> +{' '}
                  <strong>{registerForm.pacotesCount} pacote(s)</strong>
                </div>
              </div>

              {/* BARRAS DE AÇÃO: ENVIAR PARA LIBERAÇÃO E CANCELAR */}
              <div className="pt-3 border-t border-slate-200 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={registerForm.marmitasCount === 0 && registerForm.pacotesCount === 0}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-[13px] font-bold cursor-pointer shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Enviar para Liberação</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[13px] font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO DO KIT                               */}
      {/* ========================================================================= */}
      {confirmCancelKitId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5 border border-slate-200 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">cancel</span>
            </div>
            <h3 className="text-[16px] font-bold text-slate-900">Deseja cancelar este kit?</h3>
            <p className="text-[12.5px] text-slate-500 mt-1 mb-5">
              O kit será removido do seu painel e a solicitação de liberação será cancelada.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirmCancelKit(confirmCancelKitId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[12.5px] font-bold cursor-pointer"
              >
                Confirmar Cancelamento
              </button>
              <button
                onClick={() => setConfirmCancelKitId(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[12.5px] font-semibold cursor-pointer"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR CODE DO ACADÊMICO PARA RETIRADA NO BALCÃO                       */}
      {/* ========================================================================= */}
      {showStudentCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Cabeçalho */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold">QR Code de Retirada</h3>
                  <p className="text-[11px] text-slate-300">
                    Apresente para a atendente ler pelo celular no balcão
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentCardModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 text-center space-y-4">
              {/* Identificação do Aluno */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900">{studentName}</h4>
                    <span className="text-[12px] font-mono font-bold text-blue-700 block mt-0.5">
                      GRR: {studentGrr}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Senha (0–400)
                    </span>
                    <span className="text-[17px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block mt-0.5">
                      {formattedStudentPin}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code SVG Vetorial Nítido com Padrão Autêntico */}
              <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl inline-block shadow-inner">
                <svg
                  className="w-44 h-44 mx-auto"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Fundo branco */}
                  <rect width="200" height="200" fill="white" />

                  {/* Corner Finder 1: Top-Left */}
                  <rect x="15" y="15" width="48" height="48" rx="6" fill="#0f172a" />
                  <rect x="23" y="23" width="32" height="32" rx="4" fill="white" />
                  <rect x="31" y="31" width="16" height="16" rx="2" fill="#0f172a" />

                  {/* Corner Finder 2: Top-Right */}
                  <rect x="137" y="15" width="48" height="48" rx="6" fill="#0f172a" />
                  <rect x="145" y="23" width="32" height="32" rx="4" fill="white" />
                  <rect x="153" y="31" width="16" height="16" rx="2" fill="#0f172a" />

                  {/* Corner Finder 3: Bottom-Left */}
                  <rect x="15" y="137" width="48" height="48" rx="6" fill="#0f172a" />
                  <rect x="23" y="145" width="32" height="32" rx="4" fill="white" />
                  <rect x="31" y="153" width="16" height="16" rx="2" fill="#0f172a" />

                  {/* Timing Patterns */}
                  <rect x="67" y="35" width="8" height="8" fill="#0f172a" />
                  <rect x="83" y="35" width="8" height="8" fill="#0f172a" />
                  <rect x="99" y="35" width="8" height="8" fill="#0f172a" />
                  <rect x="115" y="35" width="8" height="8" fill="#0f172a" />
                  <rect x="35" y="67" width="8" height="8" fill="#0f172a" />
                  <rect x="35" y="83" width="8" height="8" fill="#0f172a" />
                  <rect x="35" y="99" width="8" height="8" fill="#0f172a" />
                  <rect x="35" y="115" width="8" height="8" fill="#0f172a" />

                  {/* Data Blocks Matrix */}
                  <rect x="71" y="71" width="10" height="10" fill="#0f172a" />
                  <rect x="85" y="71" width="10" height="10" fill="#0f172a" />
                  <rect x="105" y="71" width="10" height="10" fill="#0f172a" />
                  <rect x="125" y="71" width="10" height="10" fill="#0f172a" />
                  <rect x="145" y="71" width="10" height="10" fill="#0f172a" />
                  <rect x="165" y="71" width="10" height="10" fill="#0f172a" />

                  <rect x="71" y="85" width="10" height="10" fill="#0f172a" />
                  <rect x="99" y="85" width="10" height="10" fill="#0f172a" />
                  <rect x="113" y="85" width="10" height="10" fill="#0f172a" />
                  <rect x="139" y="85" width="10" height="10" fill="#0f172a" />
                  <rect x="157" y="85" width="10" height="10" fill="#0f172a" />

                  <rect x="71" y="99" width="10" height="10" fill="#0f172a" />
                  <rect x="85" y="99" width="10" height="10" fill="#0f172a" />
                  <rect x="105" y="99" width="10" height="10" fill="#0f172a" />
                  <rect x="131" y="99" width="10" height="10" fill="#0f172a" />
                  <rect x="165" y="99" width="10" height="10" fill="#0f172a" />

                  <rect x="71" y="113" width="10" height="10" fill="#0f172a" />
                  <rect x="95" y="113" width="10" height="10" fill="#0f172a" />
                  <rect x="115" y="113" width="10" height="10" fill="#0f172a" />
                  <rect x="145" y="113" width="10" height="10" fill="#0f172a" />

                  <rect x="71" y="127" width="10" height="10" fill="#0f172a" />
                  <rect x="85" y="127" width="10" height="10" fill="#0f172a" />
                  <rect x="105" y="127" width="10" height="10" fill="#0f172a" />
                  <rect x="125" y="127" width="10" height="10" fill="#0f172a" />
                  <rect x="155" y="127" width="10" height="10" fill="#0f172a" />

                  <rect x="71" y="145" width="10" height="10" fill="#0f172a" />
                  <rect x="99" y="145" width="10" height="10" fill="#0f172a" />
                  <rect x="125" y="145" width="10" height="10" fill="#0f172a" />
                  <rect x="145" y="145" width="10" height="10" fill="#0f172a" />
                  <rect x="165" y="145" width="10" height="10" fill="#0f172a" />

                  <rect x="85" y="165" width="10" height="10" fill="#0f172a" />
                  <rect x="105" y="165" width="10" height="10" fill="#0f172a" />
                  <rect x="135" y="165" width="10" height="10" fill="#0f172a" />
                  <rect x="155" y="165" width="10" height="10" fill="#0f172a" />
                </svg>
              </div>

              <div className="text-[11.5px] font-mono text-slate-500">
                Payload: LAB-QR:{studentGrr}:{formattedStudentPin}
              </div>

              {/* Resumo de Kits em Aberto para Retirada */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                    <span>Kits Prontos em Aberto:</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {readyKits.length} disponível(is)
                  </span>
                </div>

                {readyKits.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {readyKits.map((k) => {
                      const availM = Math.max(0, (k.marmitasCount ?? 1) - (k.marmitasWithdrawn ?? 0));
                      const availP = Math.max(0, (k.pacotesCount ?? 0) - (k.pacotesWithdrawn ?? 0));
                      return (
                        <div
                          key={k.id}
                          className="bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11.5px]"
                        >
                          <span className="font-mono font-bold text-slate-800">{k.code}</span>
                          <span className="text-slate-600">
                            {availM} marmita(s) + {availP} pacote(s)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11.5px] text-slate-500 italic">
                    Nenhum kit esterilizado em aberto no momento.
                  </p>
                )}
              </div>

              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Ao escanear este código pelo celular no balcão de esterilização, a atendente identificará sua senha numérica ({formattedStudentPin}) e confirmará a quantidade exata de marmitas e pacotes a retirar.
              </p>

              <button
                onClick={() => setShowStudentCardModal(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-semibold cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RETIRADA PARCIAL OU TOTAL DE VOLUMES DO KIT                        */}
      {/* ========================================================================= */}
      {withdrawingKit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4.5 bg-emerald-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[20px]">output</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold">Retirar Itens do Kit</h3>
                  <p className="text-[11px] text-emerald-200">
                    Selecione a quantidade de marmitas e pacotes a retirar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWithdrawingKit(null)}
                className="text-emerald-200 hover:text-white cursor-pointer p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex justify-between items-center text-[12.5px]">
                  <span className="font-mono font-bold text-emerald-900">{withdrawingKit.code}</span>
                  <span className="text-slate-600 font-medium">{withdrawingKit.name}</span>
                </div>
                <p className="text-[11.5px] text-emerald-800 mt-1">
                  Você pode retirar apenas uma marmita ou pacote se não precisar do kit completo agora. O restante permanecerá guardado e esterilizado.
                </p>
              </div>

              {/* Marmitas rígidas */}
              {(() => {
                const totalM = withdrawingKit.marmitasCount ?? 1;
                const withM = withdrawingKit.marmitasWithdrawn || 0;
                const availM = Math.max(0, totalM - withM);

                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-[18px]">lunch_dining</span>
                        <span>Marmitas (Rígidos / Bisturis)</span>
                      </span>
                      <span className="text-[11.5px] font-semibold text-slate-500">
                        {availM} disponível(is) de {totalM}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[12px] text-slate-600">Quantidade a retirar:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setWithdrawMarmitas(Math.max(0, withdrawMarmitas - 1))}
                          disabled={withdrawMarmitas <= 0}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 font-bold text-slate-700 text-[16px] cursor-pointer flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-[15px] text-slate-900">
                          {withdrawMarmitas}
                        </span>
                        <button
                          type="button"
                          onClick={() => setWithdrawMarmitas(Math.min(availM, withdrawMarmitas + 1))}
                          disabled={withdrawMarmitas >= availM}
                          className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 disabled:opacity-40 font-bold text-emerald-800 text-[16px] cursor-pointer flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Pacotes moles */}
              {(() => {
                const totalP = withdrawingKit.pacotesCount ?? 0;
                const withP = withdrawingKit.pacotesWithdrawn || 0;
                const availP = Math.max(0, totalP - withP);

                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-purple-600 text-[18px]">inventory</span>
                        <span>Pacotes (Moles / Capas)</span>
                      </span>
                      <span className="text-[11.5px] font-semibold text-slate-500">
                        {availP} disponível(is) de {totalP}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[12px] text-slate-600">Quantidade a retirar:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setWithdrawPacotes(Math.max(0, withdrawPacotes - 1))}
                          disabled={withdrawPacotes <= 0}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 font-bold text-slate-700 text-[16px] cursor-pointer flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-[15px] text-slate-900">
                          {withdrawPacotes}
                        </span>
                        <button
                          type="button"
                          onClick={() => setWithdrawPacotes(Math.min(availP, withdrawPacotes + 1))}
                          disabled={withdrawPacotes >= availP}
                          className="w-8 h-8 rounded-lg bg-purple-100 hover:bg-purple-200 disabled:opacity-40 font-bold text-purple-800 text-[16px] cursor-pointer flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmWithdrawal}
                  disabled={withdrawMarmitas === 0 && withdrawPacotes === 0}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Confirmar Retirada ({withdrawMarmitas + withdrawPacotes} itens)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawingKit(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[12.5px] font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
