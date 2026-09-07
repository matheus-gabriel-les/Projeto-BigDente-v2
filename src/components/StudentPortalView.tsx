import React, { useState } from 'react';
import { Kit, Student, UserProfile, KitStatus, TabType } from '../types';

interface StudentPortalViewProps {
  currentTab?: TabType;
  activeProfile: UserProfile;
  students: Student[];
  kits: Kit[];
  onRegisterKit?: (newKit: Omit<Kit, 'id'>) => void;
  onSendKitToCME?: (kitId: string) => void;
  onOpenNewWithdrawal?: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentTab = 'student_space',
  activeProfile,
  students,
  kits,
  onRegisterKit,
  onSendKitToCME,
}) => {
  // Controle de Abas se o usuário quiser alternar internamente
  const [activeInternalTab, setActiveInternalTab] = useState<'my_kits' | 'ready_kits'>(
    currentTab === 'student_available' ? 'ready_kits' : 'my_kits'
  );

  // Sincronizar caso o currentTab mude externamente via Sidebar
  React.useEffect(() => {
    if (currentTab === 'student_available') {
      setActiveInternalTab('ready_kits');
    } else if (currentTab === 'student_space') {
      setActiveInternalTab('my_kits');
    }
  }, [currentTab]);

  const isReadyTab = activeInternalTab === 'ready_kits';

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedKitForLabel, setSelectedKitForLabel] = useState<Kit | null>(null);
  const [showStudentCardModal, setShowStudentCardModal] = useState(false);

  // Filtro na aba "Minhas Marmitas"
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'CME' | 'IN_USE' | 'EXPIRED'>('ALL');
  
  // Filtro na aba "Marmitas Prontas"
  const [readyKitsScope, setReadyKitsScope] = useState<'MY_READY' | 'ALL_READY'>('MY_READY');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Aluno identificado pelo perfil
  const studentData =
    students.find(
      (s) => s.grr === activeProfile.studentGrr || s.id === activeProfile.studentId
    ) || students[0];

  const studentGrr = studentData?.grr || activeProfile.studentGrr || '20230192';
  const studentName = studentData?.name || activeProfile.name;

  // Form simplificado: APENAS CÓDIGO DA MARMITA, GRR E NOME
  const [registerForm, setRegisterForm] = useState({
    code: '',
    grr: studentGrr,
    name: studentName,
  });

  // Todas as marmitas pertencentes a este acadêmico
  const studentKits = kits.filter(
    (k) =>
      k.ownerStudentGrr === studentGrr ||
      k.assignedTo === studentGrr ||
      (k.ownerStudentName && k.ownerStudentName.toLowerCase() === studentName.toLowerCase()) ||
      k.name.toLowerCase().includes(studentName.toLowerCase().split(' ')[0])
  );

  // Marmitas do próprio estudante que estão PRONTAS (Estéreis na CME)
  const myReadyKits = studentKits.filter((k) => k.status === 'Ready');

  // Todas as marmitas do acervo geral que estão PRONTAS
  const allGeneralReadyKits = kits.filter((k) => k.status === 'Ready');

  // Contadores para o acervo pessoal
  const readyCount = myReadyKits.length;
  const inCMECount = studentKits.filter((k) => k.status === 'Decontaminated').length;
  const inUseCount = studentKits.filter((k) => k.status === 'In Use').length;
  const expiredCount = studentKits.filter(
    (k) => k.status === 'Expired' || k.status === 'Expiring'
  ).length;

  // Lista filtrada para "Minhas Marmitas"
  const filteredMyKits = studentKits.filter((kit) => {
    if (statusFilter === 'READY' && kit.status !== 'Ready') return false;
    if (statusFilter === 'CME' && kit.status !== 'Decontaminated') return false;
    if (statusFilter === 'IN_USE' && kit.status !== 'In Use') return false;
    if (statusFilter === 'EXPIRED' && kit.status !== 'Expired' && kit.status !== 'Expiring') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = kit.name.toLowerCase().includes(q);
      const matchCode = kit.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  // Lista filtrada para "Marmitas Prontas na CME"
  const displayedReadyKits = (readyKitsScope === 'MY_READY' ? myReadyKits : allGeneralReadyKits).filter((kit) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = kit.name.toLowerCase().includes(q);
      const matchCode = kit.code.toLowerCase().includes(q);
      const matchOwner = (kit.ownerStudentName || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchOwner) return false;
    }
    return true;
  });

  // Abrir modal de cadastro simplificado com sugestão de código
  const handleOpenRegisterModal = () => {
    const initials = studentName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 3)
      .join('')
      .toUpperCase();
    const nextNum = studentKits.length + 1;
    const suggestedCode = `MAR-${initials}-${nextNum.toString().padStart(2, '0')}`;

    setRegisterForm({
      code: suggestedCode,
      grr: studentGrr,
      name: studentName,
    });
    setIsRegisterModalOpen(true);
  };

  // Salvar cadastro simplificado (apenas código, grr e nome)
  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.code.trim() || !registerForm.grr.trim() || !registerForm.name.trim()) return;

    const formattedCode = registerForm.code.trim().toUpperCase();
    const formattedGrr = registerForm.grr.trim();
    const formattedName = registerForm.name.trim();

    const newKitData: Omit<Kit, 'id'> = {
      code: formattedCode,
      name: `Marmita ${formattedCode} - ${formattedName}`,
      category: 'Geral',
      status: 'Ready',
      lastSterilized: new Date().toLocaleDateString('pt-BR'),
      cyclesLogged: 1,
      validityDays: 15,
      ownerStudentGrr: formattedGrr,
      ownerStudentName: formattedName,
      boxMaterial: 'Caixa Inox Padrão',
      notes: `Marmita cadastrada por ${formattedName} (GRR: ${formattedGrr})`,
      autoclaveCycleId: `CICLO-${Math.floor(1000 + Math.random() * 9000)}`,
      biologicalTestResult: 'Negativo (Aprovado)',
    };

    if (onRegisterKit) {
      onRegisterKit(newKitData);
    }

    setIsRegisterModalOpen(false);
    setActionFeedback(
      `Marmita ${formattedCode} cadastrada com sucesso para o aluno ${formattedName} (GRR: ${formattedGrr})!`
    );
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleSendToCMEClick = (kit: Kit) => {
    if (onSendKitToCME) {
      onSendKitToCME(kit.id);
    }
    setActionFeedback(`Marmita ${kit.code} encaminhada para a CME. Leve a caixa ao guichê para autoclave.`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* TOPO COM ABAS DE NAVEGAÇÃO DO ALUNO (Minhas Marmitas vs Marmitas Prontas) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                isReadyTab
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {isReadyTab ? 'Prontas para Retirada no Balcão' : 'Acervo Pessoal do Acadêmico'}
            </span>
            <span className="text-[12px] font-medium text-slate-500">
              Aluno: <strong className="text-slate-800">{studentName}</strong> • GRR:{' '}
              <strong className="font-mono text-blue-600">{studentGrr}</strong>
            </span>
          </div>

          <h2 className="text-[22px] md:text-[25px] font-bold text-slate-900 tracking-tight">
            {isReadyTab ? 'Marmitas Prontas na CME' : 'Minhas Marmitas'}
          </h2>

          <p className="text-[13.5px] text-slate-500 mt-0.5 max-w-2xl">
            {isReadyTab
              ? 'Consulte as marmitas esterilizadas e aprovadas no teste biológico prontas para serem retiradas no balcão de atendimento.'
              : 'Gerencie todo o seu acervo de marmitas: caixas em uso clínico, em esterilização na CME, prontas e histórico.'}
          </p>
        </div>

        {/* Ações do Topo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-student-qr-modal"
            onClick={() => setShowStudentCardModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
            title="Apresentar meu QR Code / Matrícula no Balcão"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-300">qr_code_2</span>
            <span>Apresentar no Balcão</span>
          </button>

          {!isReadyTab && (
            <button
              id="btn-register-kit-simplified"
              onClick={handleOpenRegisterModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Cadastrar Nova Marmita</span>
            </button>
          )}
        </div>
      </div>

      {/* Switcher interno de abas caso o usuário queira alternar visualmente */}
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
          <span>Minhas Marmitas</span>
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
          <span>Marmitas Prontas na CME</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              isReadyTab ? 'bg-emerald-950 text-emerald-200' : 'bg-emerald-200 text-emerald-900'
            }`}
          >
            {myReadyKits.length} Prontas
          </span>
        </button>
      </div>

      {/* Feedback de Ação */}
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
      {/* ABA 1: MINHAS MARMITAS (Acervo Completo do Acadêmico)                    */}
      {/* ========================================================================= */}
      {!isReadyTab && (
        <div className="space-y-6">
          {/* Barra de Filtros de Status */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

                <button
                  onClick={() => setStatusFilter('READY')}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'READY'
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Prontas na CME</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === 'READY'
                        ? 'bg-emerald-900 text-emerald-100'
                        : 'bg-emerald-200/80 text-emerald-900'
                    }`}
                  >
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
                  <span>Na Autoclave / CME</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === 'CME'
                        ? 'bg-amber-900 text-amber-100'
                        : 'bg-amber-200/80 text-amber-900'
                    }`}
                  >
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
                  <span>Em Uso na Clínica</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === 'IN_USE'
                        ? 'bg-blue-900 text-blue-100'
                        : 'bg-blue-200/80 text-blue-900'
                    }`}
                  >
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
                  <span>Vencidas</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === 'EXPIRED'
                        ? 'bg-rose-900 text-rose-100'
                        : 'bg-rose-200/80 text-rose-900'
                    }`}
                  >
                    {expiredCount}
                  </span>
                </button>
              </div>

              {/* Busca por código ou identificação */}
              <div className="relative w-full md:w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar por código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Grid de Marmitas do Acadêmico */}
          {filteredMyKits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMyKits.map((kit) => {
                const isReady = kit.status === 'Ready';
                const isInCME = kit.status === 'Decontaminated';
                const isInUse = kit.status === 'In Use';
                const isExpired = kit.status === 'Expired' || kit.status === 'Expiring';

                return (
                  <div
                    key={kit.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
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

                        <div>
                          {isReady && (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11.5px] font-bold rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              <span>Pronta ({kit.validityDays}d)</span>
                            </span>
                          )}
                          {isInCME && (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-[11.5px] font-bold rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                              <span>Na CME</span>
                            </span>
                          )}
                          {isInUse && (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-[11.5px] font-bold rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              <span>Em Uso</span>
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 text-[11.5px] font-bold rounded-full inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              <span>Vencida</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Informações de Esterilização */}
                      <div className="bg-slate-50 rounded-xl p-3 text-[12px] space-y-1 text-slate-600 mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Última Esterilização:</span>
                          <span className="font-medium text-slate-800">{kit.lastSterilized}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ciclos de Autoclave:</span>
                          <span className="font-medium text-slate-800">{kit.cyclesLogged} ciclos</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Laudo Biológico:</span>
                          <span className="font-semibold text-emerald-700">
                            {kit.biologicalTestResult || 'Aprovado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ações da Marmita */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedKitForLabel(kit)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[12px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        title="Ver Etiqueta com Código e GRR"
                      >
                        <span className="material-symbols-outlined text-[16px]">qr_code</span>
                        <span>Etiqueta</span>
                      </button>

                      {isReady && (
                        <button
                          onClick={() => setShowStudentCardModal(true)}
                          className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                          <span>Retirar no Balcão</span>
                        </button>
                      )}

                      {(isExpired || isInUse) && (
                        <button
                          onClick={() => handleSendToCMEClick(kit)}
                          className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">clean_hands</span>
                          <span>Enviar à CME (Autoclave)</span>
                        </button>
                      )}

                      {isInCME && (
                        <span className="text-[12px] text-amber-700 font-medium italic flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                          <span>Aguardando processamento na CME</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-[42px] text-slate-400 mb-2">inventory_2</span>
              <h3 className="text-[16px] font-bold text-slate-800">Nenhuma marmita encontrada</h3>
              <p className="text-[13px] text-slate-500 mt-1 mb-4">
                Você pode cadastrar sua marmita inserindo apenas o código, seu GRR e seu nome.
              </p>
              <button
                onClick={handleOpenRegisterModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Cadastrar Minha Primeira Marmita</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: MARMITAS PRONTAS NA CME (Liberadas para Retirada Imediata)        */}
      {/* ========================================================================= */}
      {isReadyTab && (
        <div className="space-y-6">
          {/* Card de Destaque para Retirada */}
          <div className="p-5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-emerald-950">
                  Marmitas Esterilizadas Disponíveis no Balcão
                </h3>
                <p className="text-[13px] text-emerald-900 mt-0.5">
                  Todas as marmitas listadas abaixo já cumpriram o ciclo de autoclave a 134°C, foram aprovadas
                  no teste biológico e estão seladas no balcão da CME prontas para entrega.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowStudentCardModal(true)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-xs shrink-0 active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span>Abrir Credencial de Retirada</span>
            </button>
          </div>

          {/* Filtros da Aba de Prontas */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-bold text-slate-500 uppercase">Visualizar:</span>
              <button
                onClick={() => setReadyKitsScope('MY_READY')}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold cursor-pointer transition-colors ${
                  readyKitsScope === 'MY_READY'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Minhas Marmitas Prontas ({myReadyKits.length})
              </button>
              <button
                onClick={() => setReadyKitsScope('ALL_READY')}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-bold cursor-pointer transition-colors ${
                  readyKitsScope === 'ALL_READY'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todas as Marmitas Prontas no Balcão ({allGeneralReadyKits.length})
              </button>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar marmita pronta..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] text-slate-800 focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Grid de Marmitas Prontas */}
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
                        <span>Estéril ({kit.validityDays} dias)</span>
                      </span>
                    </div>

                    <h4 className="text-[16px] font-bold text-slate-900 mt-1">{kit.name}</h4>
                    <p className="text-[12.5px] text-slate-500 mb-3">
                      Proprietário: <strong>{kit.ownerStudentName || studentName}</strong>
                    </p>

                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-[12px] space-y-1 text-slate-700 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Esterilizado em:</span>
                        <span className="font-semibold text-slate-900">{kit.lastSterilized}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ciclo ANVISA:</span>
                        <span className="font-mono font-medium text-slate-800">
                          {kit.autoclaveCycleId || 'CICLO-1034'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Teste Biológico (Esporos):</span>
                        <span className="font-bold text-emerald-800">Aprovado (Negativo)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedKitForLabel(kit)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[12px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">qr_code</span>
                      <span>Etiqueta</span>
                    </button>

                    <button
                      onClick={() => setShowStudentCardModal(true)}
                      className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                    >
                      <span className="material-symbols-outlined text-[16px]">fact_check</span>
                      <span>Retirar no Guichê com QR</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <span className="material-symbols-outlined text-[42px] text-slate-400 mb-2">verified</span>
              <h3 className="text-[16px] font-bold text-slate-800">Nenhuma marmita pronta no momento</h3>
              <p className="text-[13px] text-slate-500 mt-1">
                Suas marmitas que estiverem em autoclave na CME aparecerão aqui assim que o ciclo for concluído.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL SIMPLIFICADO: CADASTRAR NOVA MARMITA (Apenas Código, GRR e Nome)    */}
      {/* ========================================================================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
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

            <form onSubmit={handleSubmitRegister} className="p-5 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[12px] text-blue-900">
                Para cadastrar uma nova marmita no acervo, informe apenas a identificação da caixa (código, seu GRR e seu nome). Não é necessário cadastrar os instrumentos individuais.
              </div>

              {/* 1. Código da Marmita */}
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">
                  Código da Marmita *
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.code}
                  onChange={(e) => setRegisterForm({ ...registerForm, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: MAR-2026-01"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-[13px] font-mono font-bold text-blue-700 uppercase focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Identificador gravado ou etiquetado na marmita.
                </span>
              </div>

              {/* 2. GRR do Aluno */}
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">
                  GRR (Matrícula do Aluno) *
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.grr}
                  onChange={(e) => setRegisterForm({ ...registerForm, grr: e.target.value })}
                  placeholder="Ex: 20230192"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-[13px] font-mono font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* 3. Nome do Aluno */}
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">
                  Nome do Aluno *
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="Ex: Mariana Castro Silva"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-[13px] font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold cursor-pointer shadow-xs active:scale-98 transition-all"
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
      {/* MODAL: Etiqueta de Identificação da Marmita                                */}
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
                  <p>
                    <span className="text-slate-400">Aluno:</span>{' '}
                    <strong>{selectedKitForLabel.ownerStudentName || studentName}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400">GRR:</span>{' '}
                    <strong className="font-mono">{selectedKitForLabel.ownerStudentGrr || studentGrr}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Status:</span>{' '}
                    <strong className="text-emerald-700">
                      {selectedKitForLabel.status === 'Ready' ? 'Pronta / Estéril' : selectedKitForLabel.status}
                    </strong>
                  </p>
                </div>

                {/* Código de barras gráfico */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="flex justify-center items-center gap-1 h-10">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full ${
                          i % 3 === 0
                            ? 'w-1 bg-slate-900'
                            : i % 2 === 0
                            ? 'w-0.5 bg-slate-900'
                            : 'w-1.5 bg-slate-900'
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
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-slate-200 text-center p-6 animate-in zoom-in-95 duration-150">
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
