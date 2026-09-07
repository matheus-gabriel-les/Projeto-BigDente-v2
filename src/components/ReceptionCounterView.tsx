import React, { useState } from 'react';
import { Kit, Student, Transaction, UserProfile, AlmoxarifadoShiftReport, KitDamageReport } from '../types';

interface ReceptionCounterViewProps {
  students: Student[];
  kits: Kit[];
  transactions: Transaction[];
  onExecuteTransaction: (params: { studentGrr: string; kitId: string; type: 'Withdrawal' | 'Return' }) => void;
  onSendKitToCME?: (kitId: string) => void;
  activeProfile: UserProfile;
  almoxarifadoReports?: AlmoxarifadoShiftReport[];
  onSaveAlmoxarifadoReport?: (report: AlmoxarifadoShiftReport) => void;
}

export const ReceptionCounterView: React.FC<ReceptionCounterViewProps> = ({
  students,
  kits,
  transactions,
  onExecuteTransaction,
  onSendKitToCME,
  activeProfile,
  almoxarifadoReports = [],
  onSaveAlmoxarifadoReport
}) => {
  // Aba ativa dentro da visão do Almoxarifado: Atendimento no Balcão ou Levantamento para Administração
  const [activeTab, setActiveTab] = useState<'counter' | 'shift_report'>('counter');

  // Aluno atualmente no balcão
  const [searchStudentInput, setSearchStudentInput] = useState('');
  const [selectedStudentGrr, setSelectedStudentGrr] = useState<string>(students[0]?.grr || '');

  // Busca rápida direta por código da caixa/marmita
  const [directKitSearch, setDirectKitSearch] = useState('');

  // Feedback de conferência
  const [verificationFeedback, setVerificationFeedback] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  // Estados para o Formulário de Levantamento do Turno (Fornecer dados ao Administrador)
  const [selectedShift, setSelectedShift] = useState<'Manhã (07:30 - 12:00)' | 'Tarde (13:30 - 18:00)' | 'Noite (18:30 - 22:00)'>('Manhã (07:30 - 12:00)');
  const [suppliesInput, setSuppliesInput] = useState({
    pouches: 38,
    class5Strips: 38,
    tapeMeters: 14,
    biologicalAmpoules: 2
  });
  const [adminNotesInput, setAdminNotesInput] = useState(
    'Turno com alta demanda na clínica de Dentística. Todas as marmitas conferidas sem incidentes graves.'
  );

  // Formulário para registrar avaria em marmita
  const [isAddingDamage, setIsAddingDamage] = useState(false);
  const [damageForm, setDamageForm] = useState<{
    kitCode: string;
    type: string;
    studentGrr: string;
    studentName: string;
    description: string;
    severity: 'Baixa' | 'Média' | 'Crítica (Bloquear Marmita)';
  }>({
    kitCode: '',
    type: 'Trava / Fecho Quebrado',
    studentGrr: '',
    studentName: '',
    description: '',
    severity: 'Média'
  });

  // Lista local de danos registrados neste turno
  const [localDamages, setLocalDamages] = useState<KitDamageReport[]>([
    {
      id: 'dmg-1',
      kitCode: 'MAR-CIR-02',
      type: 'Trava / Fecho Quebrado',
      studentGrr: '20230192',
      studentName: 'Mariana Costa Silva',
      description: 'Fecho lateral da caixa inox soltou durante transporte na clínica cirúrgica.',
      severity: 'Média'
    },
    {
      id: 'dmg-2',
      kitCode: 'K-E101',
      type: 'Etiqueta Ilegível / Descolada',
      studentGrr: '20224810',
      studentName: 'Lucas Ferreira Lima',
      description: 'Etiqueta térmica descolou parcialmente após lavagem no expurgo; necessita reimpressão.',
      severity: 'Baixa'
    }
  ]);

  // Cálculos do turno a partir das transações
  const totalWithdrawalsTurno = transactions.filter((t) => t.action === 'Withdrawal').length;
  const totalReturnsTurno = transactions.filter((t) => t.action === 'Return').length;
  const pendingReturnsTurno = Math.max(0, totalWithdrawalsTurno - totalReturnsTurno);

  // Marmitas com retenção em uso (overdue)
  const inUseKitsOverdue = kits.filter((k) => k.status === 'In Use');

  const handleAddDamageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageForm.kitCode.trim()) return;

    const newDamage: KitDamageReport = {
      id: `dmg-${Date.now()}`,
      kitCode: damageForm.kitCode.toUpperCase(),
      type: damageForm.type,
      studentGrr: damageForm.studentGrr || 'Não identificado',
      studentName: damageForm.studentName || 'Acadêmico não identificado',
      description: damageForm.description || 'Avaria detectada durante devolução no balcão.',
      severity: damageForm.severity
    };

    setLocalDamages([newDamage, ...localDamages]);
    setDamageForm({
      kitCode: '',
      type: 'Trava / Fecho Quebrado',
      studentGrr: '',
      studentName: '',
      description: '',
      severity: 'Média'
    });
    setIsAddingDamage(false);

    setVerificationFeedback({
      type: 'success',
      message: `Avaria na marmita ${newDamage.kitCode} registrada com sucesso para o levantamento administrativo!`
    });
    setTimeout(() => setVerificationFeedback(null), 4000);
  };

  const handleSendShiftReportToAdmin = () => {
    const newReport: AlmoxarifadoShiftReport = {
      id: `rep-shift-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      shift: selectedShift,
      attendantName: activeProfile.name,
      damagesReported: localDamages,
      overdueRetentions: inUseKitsOverdue.map((k, idx) => ({
        id: `over-${idx + 1}`,
        kitCode: k.code,
        studentName: k.assignedStudentName || k.ownerStudentName || 'Acadêmico em atendimento',
        studentGrr: k.assignedTo || k.ownerStudentGrr || '20230192',
        checkoutTime: '08:15',
        hoursLate: 2.5,
        clinicalArea: k.category || 'Clínica Geral'
      })),
      suppliesConsumed: {
        surgicalGradePouches: suppliesInput.pouches,
        chemicalIndicatorClass5Strips: suppliesInput.class5Strips,
        autoclaveTapeMeters: suppliesInput.tapeMeters,
        biologicalIndicatorAmpoules: suppliesInput.biologicalAmpoules
      },
      totalWithdrawals: totalWithdrawalsTurno,
      totalReturns: totalReturnsTurno,
      pendingReturns: pendingReturnsTurno,
      peakHourInterval: '07:45 - 08:30 (Entrada) / 11:30 - 12:15 (Devolução)',
      notesForAdmin: adminNotesInput,
      status: 'Enviado para Administração'
    };

    if (onSaveAlmoxarifadoReport) {
      onSaveAlmoxarifadoReport(newReport);
    }

    setVerificationFeedback({
      type: 'success',
      message: `Levantamento do turno (${selectedShift}) enviado com sucesso para a Administração e Coordenação!`
    });
    setTimeout(() => setVerificationFeedback(null), 5000);
  };

  // Aluno identificado
  const currentStudent = students.find(
    (s) =>
      s.grr.toLowerCase() === selectedStudentGrr.toLowerCase() ||
      s.code.toLowerCase() === selectedStudentGrr.toLowerCase()
  ) || students.find(
    (s) =>
      s.name.toLowerCase().includes(searchStudentInput.toLowerCase()) ||
      s.grr.includes(searchStudentInput)
  );

  // Se buscou direto pelo código da marmita
  const matchedDirectKit = directKitSearch.trim()
    ? kits.find(
        (k) =>
          k.code.toLowerCase() === directKitSearch.trim().toLowerCase() ||
          k.id.toLowerCase() === directKitSearch.trim().toLowerCase()
      )
    : null;

  // Marmitas do aluno no balcão
  const studentGrr = currentStudent?.grr || selectedStudentGrr;
  const studentKits = kits.filter(
    (k) =>
      k.ownerStudentGrr === studentGrr ||
      k.assignedTo === studentGrr ||
      (currentStudent && k.name.toLowerCase().includes(currentStudent.name.toLowerCase().split(' ')[0]))
  );

  // Separar as marmitas por situação de atendimento
  // 1. Marmitas prontas para serem retiradas pelo aluno (Estéreis)
  const readyToWithdrawKits = studentKits.filter((k) => k.status === 'Ready');

  // 2. Marmitas atualmente em uso com o aluno (a serem devolvidas)
  const currentlyInUseKits = studentKits.filter((k) => k.status === 'In Use');

  // 3. Novas marmitas entregues pelo aluno para esterilização na CME
  const pendingCMEKits = studentKits.filter((k) => k.status === 'Decontaminated');

  // Ação 1: Conferir e Liberar Retirada de Marmita Estéril
  const handleConfirmWithdrawal = (kit: Kit) => {
    if (!currentStudent) return;
    onExecuteTransaction({
      studentGrr: currentStudent.grr,
      kitId: kit.code,
      type: 'Withdrawal'
    });

    setVerificationFeedback({
      type: 'success',
      message: `Marmita ${kit.code} conferida com sucesso e liberada para o acadêmico ${currentStudent.name} (${currentStudent.grr}).`
    });
    setDirectKitSearch('');
    setTimeout(() => setVerificationFeedback(null), 5000);
  };

  // Ação 2: Conferir e Receber Devolução de Marmita Usada
  const handleConfirmReturn = (kit: Kit) => {
    if (!currentStudent) return;
    onExecuteTransaction({
      studentGrr: currentStudent.grr,
      kitId: kit.code,
      type: 'Return'
    });

    setVerificationFeedback({
      type: 'success',
      message: `Devolução da marmita ${kit.code} conferida e registrada. Encaminhada ao expurgo da CME.`
    });
    setDirectKitSearch('');
    setTimeout(() => setVerificationFeedback(null), 5000);
  };

  // Ação 3: Conferir Nova Marmita Entregue pelo Aluno para Autoclave
  const handleConfirmNewKitForCME = (kit: Kit) => {
    if (onSendKitToCME) {
      onSendKitToCME(kit.id);
    }
    setVerificationFeedback({
      type: 'success',
      message: `Marmita ${kit.code} conferida e recebida no balcão. Encaminhada para ciclo de autoclave na CME.`
    });
    setDirectKitSearch('');
    setTimeout(() => setVerificationFeedback(null), 5000);
  };

  // Selecionar aluno a partir de marmita bipada
  const handleSelectStudentFromDirectKit = (kit: Kit) => {
    if (kit.ownerStudentGrr) {
      setSelectedStudentGrr(kit.ownerStudentGrr);
    } else {
      const foundStudent = students.find((s) => s.code === kit.assignedTo || s.name === kit.assignedStudentName);
      if (foundStudent) setSelectedStudentGrr(foundStudent.grr);
    }
  };

  // Últimas conferências registradas
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Topo Limpo do Almoxarifado */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-amber-600 text-[24px]">verified_user</span>
            <h2 className="text-[22px] md:text-[24px] font-bold text-slate-900 tracking-tight">
              Almoxarifado &amp; Balcão de Atendimento
            </h2>
          </div>
          <p className="text-[13px] text-slate-500">
            Conferência de liberação, devolução e fornecimento de dados para o levantamento da Administração.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Atendente em Serviço
          </span>
          <span className="text-[13.5px] font-bold text-slate-800">
            {activeProfile.name}
          </span>
        </div>
      </div>

      {/* Seletor de Modo Operacional do Almoxarifado */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/90 pb-3">
        <button
          id="btn-tab-counter"
          onClick={() => setActiveTab('counter')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'counter'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
          <span>Terminal de Atendimento &amp; Balcão</span>
        </button>

        <button
          id="btn-tab-shift-report"
          onClick={() => setActiveTab('shift_report')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'shift_report'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
          <span>Boletim de Turno &amp; Levantamento p/ Administração</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'shift_report' ? 'bg-amber-900 text-amber-100' : 'bg-amber-100 text-amber-900'
          }`}>
            {almoxarifadoReports.length} Relatórios
          </span>
        </button>
      </div>

      {/* Feedback Toast */}
      {verificationFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-2.5 text-[13px] font-medium shadow-xs">
          <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
          <span>{verificationFeedback.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODO 1: TERMINAL DO BALCÃO (ATENDIMENTO DIRETO)                           */}
      {/* ========================================================================= */}
      {activeTab === 'counter' && (
        <div className="space-y-6">
          {/* ETAPA 1: Identificação do Estudante no Balcão */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full">
            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              1. Identificar Aluno(a) no Balcão (Digite GRR ou Nome)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[19px]">
                badge
              </span>
              <input
                type="text"
                value={searchStudentInput}
                onChange={(e) => setSearchStudentInput(e.target.value)}
                placeholder="Ex: 20230192 ou Mariana Costa..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="w-full md:w-72">
            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Ou bipe o código da marmita
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[19px]">
                qr_code_scanner
              </span>
              <input
                type="text"
                value={directKitSearch}
                onChange={(e) => setDirectKitSearch(e.target.value)}
                placeholder="Ex: MAR-MCS-01 ou K-E101"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Chips de Alunos Rápidos */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11.5px] text-slate-500 font-medium mr-1">Alunos frequentes:</span>
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedStudentGrr(s.grr);
                setSearchStudentInput('');
              }}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                currentStudent?.id === s.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.name.split(' ')[0]} ({s.grr})
            </button>
          ))}
        </div>
      </div>

      {/* Se o atendente bipou diretamente uma marmita */}
      {matchedDirectKit && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[13px] bg-amber-900 text-white px-2 py-0.5 rounded">
                {matchedDirectKit.code}
              </span>
              <h4 className="text-[14px] font-bold text-amber-950">
                {matchedDirectKit.name}
              </h4>
              <span className="text-[11.5px] text-amber-800">
                ({matchedDirectKit.status === 'Ready' ? 'Estéril / Pronta' : matchedDirectKit.status === 'In Use' ? 'Em Uso' : 'Na CME'})
              </span>
            </div>
            <p className="text-[12px] text-amber-800 mt-1">
              Pertence ao acadêmico: <strong>{matchedDirectKit.ownerStudentName || matchedDirectKit.assignedStudentName || 'Aluno'}</strong> (GRR: {matchedDirectKit.ownerStudentGrr || matchedDirectKit.assignedTo})
            </p>
          </div>

          <button
            onClick={() => handleSelectStudentFromDirectKit(matchedDirectKit)}
            className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-[12px] font-semibold cursor-pointer shrink-0"
          >
            Abrir Ficha do Aluno
          </button>
        </div>
      )}

      {/* ETAPA 2: Painel de Conferência das Marmitas do Aluno */}
      {currentStudent ? (
        <div className="space-y-6">
          {/* Card de Identificação do Aluno */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-mono text-blue-300 uppercase tracking-wider font-semibold block">
                Acadêmico(a) em Atendimento no Balcão
              </span>
              <h3 className="text-[18px] font-bold text-white mt-0.5">
                {currentStudent.name}
              </h3>
              <p className="text-[12.5px] text-slate-300">
                Matrícula / GRR: <span className="font-mono text-blue-300 font-bold">{currentStudent.grr}</span> • {currentStudent.course}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11.5px] font-semibold">
                Matrícula Regular
              </span>
            </div>
          </div>

          {/* 1. SEÇÃO: Marmitas Prontas para Retirada (Estéreis) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-[16px] font-bold text-slate-900">
                  Marmitas Solicitadas / Prontas para Retirada ({readyToWithdrawKits.length})
                </h3>
              </div>
              <span className="text-[11.5px] text-slate-500">
                O aluno veio retirar para entrar na clínica
              </span>
            </div>

            {readyToWithdrawKits.length > 0 ? (
              <div className="space-y-3">
                {readyToWithdrawKits.map((kit) => (
                  <div
                    key={kit.id}
                    className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[13px] bg-slate-900 text-white px-2.5 py-0.5 rounded">
                          {kit.code}
                        </span>
                        <h4 className="text-[15px] font-bold text-slate-900">{kit.name}</h4>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                          Estéril ({kit.validityDays} dias)
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-600">
                        {kit.boxMaterial || 'Caixa Inox'} • Categoria: <strong>{kit.category || 'Geral'}</strong> • {kit.notes || 'Identificação por código e lacre'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleConfirmWithdrawal(kit)}
                        className="w-full md:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                        <span>Conferir e Liberar Retirada</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12.5px] text-slate-500 py-2 italic">
                Nenhuma marmita estéril aguardando retirada para este aluno no momento.
              </p>
            )}
          </div>

          {/* 2. SEÇÃO: Marmitas em Uso pelo Aluno (Devolução) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-[16px] font-bold text-slate-900">
                  Marmitas em Posse / A Devolver ({currentlyInUseKits.length})
                </h3>
              </div>
              <span className="text-[11.5px] text-slate-500">
                O aluno terminou o atendimento e veio devolver
              </span>
            </div>

            {currentlyInUseKits.length > 0 ? (
              <div className="space-y-3">
                {currentlyInUseKits.map((kit) => (
                  <div
                    key={kit.id}
                    className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[13px] bg-slate-900 text-white px-2.5 py-0.5 rounded">
                          {kit.code}
                        </span>
                        <h4 className="text-[15px] font-bold text-slate-900">{kit.name}</h4>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full">
                          Em Uso Clínico
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-600">
                        {kit.boxMaterial || 'Caixa Inox'} • Retirada: {kit.checkoutTime || 'Hoje'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleConfirmReturn(kit)}
                        className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[13px] font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">input</span>
                        <span>Conferir e Receber Devolução</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12.5px] text-slate-500 py-2 italic">
                O acadêmico não possui nenhuma marmita em aberto para devolução.
              </p>
            )}
          </div>

          {/* 3. SEÇÃO: Novas Marmitas Entregues para Esterilização (CME) */}
          {pendingCMEKits.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="text-[16px] font-bold text-slate-900">
                    Novas Marmitas Entregues para a CME ({pendingCMEKits.length})
                  </h3>
                </div>
                <span className="text-[11.5px] text-slate-500">
                  Cadastradas pelo aluno aguardando autoclave
                </span>
              </div>

              <div className="space-y-3">
                {pendingCMEKits.map((kit) => (
                  <div
                    key={kit.id}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[13px] bg-slate-900 text-white px-2.5 py-0.5 rounded">
                          {kit.code}
                        </span>
                        <h4 className="text-[15px] font-bold text-slate-900">{kit.name}</h4>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                          Na Fila da CME
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-600">
                        {kit.boxMaterial || 'Caixa Inox'} • Categoria: <strong>{kit.category || 'Geral'}</strong> • {kit.notes || 'Identificação por código e lacre'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => handleConfirmNewKitForCME(kit)}
                        className="w-full md:w-auto px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-[13px] font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Confirmar Recebimento p/ CME</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
          <span className="material-symbols-outlined text-[36px] text-slate-400 mb-2">person_search</span>
          <h4 className="text-[15px] font-bold text-slate-800">
            Nenhum acadêmico selecionado
          </h4>
          <p className="text-[12.5px] text-slate-500 mt-1">
            Digite o GRR ou clique em um dos alunos acima para iniciar a conferência das marmitas.
          </p>
        </div>
      )}

      {/* Histórico Simplificado das Conferências do Turno */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
          <h3 className="text-[15px] font-bold text-slate-900">
            Últimas Conferências Realizadas Hoje
          </h3>
          <span className="text-[11.5px] text-slate-500">
            {transactions.length} registros no plantão
          </span>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 text-[12.5px]">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      tx.action === 'Withdrawal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {tx.action === 'Withdrawal' ? 'Retirada Liberada' : 'Devolução Recebida'}
                  </span>
                  <span className="font-mono font-bold text-slate-800">{tx.kitId}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-700">{tx.studentName || tx.grrCode}</span>
                </div>
                <span className="font-mono text-slate-400 text-[11.5px]">{tx.timestamp}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-slate-400 italic py-2">
            Nenhuma movimentação realizada ainda neste turno.
          </p>
        )}
      </div>
    </div>
  )}

      {/* ========================================================================= */}
      {/* MODO 2: BOLETIM DE TURNO & LEVANTAMENTO PARA O ADMINISTRADOR              */}
      {/* ========================================================================= */}
      {activeTab === 'shift_report' && (
        <div className="space-y-6">
          {/* Banner Explicativo dos Dados Solicitados pelo Administrador */}
          <div className="p-5 bg-amber-50 border border-amber-200/90 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
                  Prestação de Contas do Almoxarifado
                </span>
                <span className="text-[12px] text-amber-800 font-medium">
                  Canal Direto com a Administração e Coordenação
                </span>
              </div>
              <h3 className="text-[18px] font-bold text-amber-950">
                Levantamento Operacional do Plantão (Almoxarifado → Administrador)
              </h3>
              <p className="text-[13px] text-amber-900 mt-1 max-w-3xl">
                Aqui o atendente do almoxarifado consolida e submete ao Administrador os dados operacionais do turno:
                <strong> avarias físicas detectadas em marmitas/caixas</strong>, <strong>marmitas em atraso de devolução</strong>,
                <strong> consumo de insumos de esterilização da CME</strong> e <strong>balanço de giros do balcão</strong>.
              </p>
            </div>

            <button
              id="btn-submit-shift-report"
              onClick={handleSendShiftReportToAdmin}
              className="px-5 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-xs shrink-0 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Submeter Levantamento p/ Admin</span>
            </button>
          </div>

          {/* Configuração do Turno */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Turno de Referência *
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              >
                <option value="Manhã (07:30 - 12:00)">Manhã (07:30 - 12:00)</option>
                <option value="Tarde (13:30 - 18:00)">Tarde (13:30 - 18:00)</option>
                <option value="Noite (18:30 - 22:00)">Noite (18:30 - 22:00)</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Responsável pelo Fechamento
              </label>
              <input
                type="text"
                disabled
                value={activeProfile.name}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[13px] text-slate-600 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Horário de Pico Identificado
              </label>
              <input
                type="text"
                value="07:45 - 08:30 (Saídas) / 11:30 - 12:15 (Devoluções)"
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[12.5px] font-mono text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Cards de Métricas Consolidadas do Turno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Retiradas no Turno
              </span>
              <div className="text-[28px] font-bold text-emerald-600 mt-1">
                {totalWithdrawalsTurno} Marmitas
              </div>
              <p className="text-[12px] text-slate-500 mt-1">Liberadas no balcão</p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Devoluções Recebidas
              </span>
              <div className="text-[28px] font-bold text-blue-600 mt-1">
                {totalReturnsTurno} Caixas
              </div>
              <p className="text-[12px] text-slate-500 mt-1">Encaminhadas ao expurgo</p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Marmitas em Posse (Abertas)
              </span>
              <div className="text-[28px] font-bold text-amber-600 mt-1">
                {pendingReturnsTurno} Pendentes
              </div>
              <p className="text-[12px] text-amber-700 mt-1">Ainda na clínica odontológica</p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Avarias Registradas
              </span>
              <div className="text-[28px] font-bold text-rose-600 mt-1">
                {localDamages.length} Ocorrências
              </div>
              <p className="text-[12px] text-rose-700 mt-1">Necessitam reparo/revisão</p>
            </div>
          </div>

          {/* DADO ESSENCIAL 1: Registro e Triagem de Avarias nas Marmitas */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-500 text-[20px]">handyman</span>
                  <h3 className="text-[16px] font-bold text-slate-900">
                    1. Relatório de Avarias e Danos Físicos nas Marmitas ({localDamages.length})
                  </h3>
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Identificação de travas quebradas, caixas amassadas, etiquetas soltas ou barreiras rompidas.
                </p>
              </div>

              <button
                onClick={() => setIsAddingDamage(!isAddingDamage)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-[12px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>{isAddingDamage ? 'Fechar Formulário' : 'Registrar Nova Avaria'}</span>
              </button>
            </div>

            {/* Formulário de Registro de Avaria */}
            {isAddingDamage && (
              <form onSubmit={handleAddDamageSubmit} className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3">
                <h4 className="text-[13px] font-bold text-rose-900">
                  Nova Ocorrência de Dano / Não-Conformidade na Marmita:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11.5px] font-semibold text-slate-700 block mb-1">
                      Código da Marmita *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: MAR-CIR-02"
                      value={damageForm.kitCode}
                      onChange={(e) => setDamageForm({ ...damageForm, kitCode: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] font-mono font-bold uppercase text-slate-900 focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-semibold text-slate-700 block mb-1">
                      Tipo de Avaria *
                    </label>
                    <select
                      value={damageForm.type}
                      onChange={(e) => setDamageForm({ ...damageForm, type: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-800 focus:outline-hidden focus:border-rose-500"
                    >
                      <option value="Trava / Fecho Quebrado">Trava / Fecho Quebrado</option>
                      <option value="Tampa Amassada / Perda de Vedação">Tampa Amassada / Perda de Vedação</option>
                      <option value="Perfuração em Grau Cirúrgico">Perfuração em Grau Cirúrgico</option>
                      <option value="Etiqueta Ilegível / Descolada">Etiqueta Ilegível / Descolada</option>
                      <option value="Gravação a Laser Apagada">Gravação a Laser Apagada</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11.5px] font-semibold text-slate-700 block mb-1">
                      Gravidade *
                    </label>
                    <select
                      value={damageForm.severity}
                      onChange={(e) => setDamageForm({ ...damageForm, severity: e.target.value as any })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-800 focus:outline-hidden focus:border-rose-500"
                    >
                      <option value="Baixa">Baixa (Pode continuar usando)</option>
                      <option value="Média">Média (Atenção no próximo ciclo)</option>
                      <option value="Crítica (Bloquear Marmita)">Crítica (Bloquear Marmita p/ Manutenção)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11.5px] font-semibold text-slate-700 block mb-1">
                      Acadêmico Responsável (GRR ou Nome)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 20230192 ou Mariana Costa"
                      value={damageForm.studentName}
                      onChange={(e) => setDamageForm({ ...damageForm, studentName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-800 focus:outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11.5px] font-semibold text-slate-700 block mb-1">
                      Descrição da Ocorrência
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Presilha lateral soltou; marmita precisa de ajuste antes da autoclave."
                      value={damageForm.description}
                      onChange={(e) => setDamageForm({ ...damageForm, description: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-800 focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[12px] font-bold cursor-pointer"
                  >
                    Salvar Registro de Avaria
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingDamage(false)}
                    className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-[12px] font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Tabela de Avarias */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Marmita</th>
                    <th className="py-2.5 px-4">Tipo de Avaria</th>
                    <th className="py-2.5 px-4">Aluno / Matrícula</th>
                    <th className="py-2.5 px-4">Descrição do Dano</th>
                    <th className="py-2.5 px-4">Severidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12.5px]">
                  {localDamages.map((dmg) => (
                    <tr key={dmg.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{dmg.kitCode}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{dmg.type}</td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {dmg.studentName} <span className="text-slate-400">({dmg.studentGrr})</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{dmg.description}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          dmg.severity.includes('Crítica')
                            ? 'bg-rose-100 text-rose-800'
                            : dmg.severity === 'Média'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {dmg.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DADO ESSENCIAL 2: Retenções Excessivas / Marmitas em Atraso */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">timer</span>
                <h3 className="text-[16px] font-bold text-slate-900">
                  2. Acompanhamento de Retenção Excessiva (Em Uso sem Devolução)
                </h3>
              </div>
              <span className="text-[11.5px] text-slate-500">
                Marmitas com saída matinal não devolvidas antes do fim do expediente
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inUseKitsOverdue.map((k) => (
                <div key={k.id} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[13px] bg-slate-900 text-white px-2 py-0.5 rounded">
                        {k.code}
                      </span>
                      <span className="text-[13px] font-bold text-slate-900">{k.name}</span>
                    </div>
                    <p className="text-[12px] text-slate-600 mt-1">
                      Aluno: <strong>{k.assignedStudentName || k.ownerStudentName}</strong> ({k.assignedTo || k.ownerStudentGrr})
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Clínica: {k.category || 'Odontologia Geral'} • Tempo decorrido: ~3.5 horas
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-200 text-amber-900 text-[11px] font-bold shrink-0">
                    Aguardando Retorno
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DADO ESSENCIAL 3: Controle de Consumo de Insumos da CME e Balcão */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 text-[20px]">science</span>
                <h3 className="text-[16px] font-bold text-slate-900">
                  3. Consumo de Insumos Críticos no Turno (CME &amp; Esterilização)
                </h3>
              </div>
              <span className="text-[11.5px] text-slate-500">
                Controle de estoque para pedido de reposição ao Almoxarifado Central
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-[11.5px] font-bold text-slate-600 uppercase block mb-1">
                  Envelopes Grau Cirúrgico
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={suppliesInput.pouches}
                    onChange={(e) => setSuppliesInput({ ...suppliesInput, pouches: Number(e.target.value) })}
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[15px] font-bold text-slate-900 text-center"
                  />
                  <span className="text-[12px] text-slate-500 font-medium">unidades seladas</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-[11.5px] font-bold text-slate-600 uppercase block mb-1">
                  Integrador Químico Classe 5
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={suppliesInput.class5Strips}
                    onChange={(e) => setSuppliesInput({ ...suppliesInput, class5Strips: Number(e.target.value) })}
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[15px] font-bold text-slate-900 text-center"
                  />
                  <span className="text-[12px] text-slate-500 font-medium">tiras viradas</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-[11.5px] font-bold text-slate-600 uppercase block mb-1">
                  Fita Zebrada Autoclave
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={suppliesInput.tapeMeters}
                    onChange={(e) => setSuppliesInput({ ...suppliesInput, tapeMeters: Number(e.target.value) })}
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[15px] font-bold text-slate-900 text-center"
                  />
                  <span className="text-[12px] text-slate-500 font-medium">metros gastos</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-[11.5px] font-bold text-slate-600 uppercase block mb-1">
                  Indicador Biológico (Ampolas)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={suppliesInput.biologicalAmpoules}
                    onChange={(e) => setSuppliesInput({ ...suppliesInput, biologicalAmpoules: Number(e.target.value) })}
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[15px] font-bold text-slate-900 text-center"
                  />
                  <span className="text-[12px] text-slate-500 font-medium">testes de esporos</span>
                </div>
              </div>
            </div>
          </div>

          {/* DADO ESSENCIAL 4: Observações e Demandas para a Administração */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider block">
              4. Parecer e Comunicações do Atendente para o Administrador / Coordenação
            </label>
            <textarea
              rows={3}
              value={adminNotesInput}
              onChange={(e) => setAdminNotesInput(e.target.value)}
              placeholder="Digite ocorrências, solicitações de compras, advertências sobre comportamento no balcão ou intercorrências operacionais..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-hidden"
            />
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSendShiftReportToAdmin}
                className="px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-[13px] font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">send</span>
                <span>Finalizar e Submeter Levantamento para a Administração</span>
              </button>
            </div>
          </div>

          {/* Histórico dos Levantamentos Anteriores Enviados */}
          {almoxarifadoReports.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-[14px] font-bold text-slate-900">
                Histórico de Levantamentos do Almoxarifado Recebidos pela Administração
              </h4>
              <div className="divide-y divide-slate-100">
                {almoxarifadoReports.map((rep) => (
                  <div key={rep.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{rep.shift}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{rep.date}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          {rep.status}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        Atendente: <strong>{rep.attendantName}</strong> | {rep.totalWithdrawals} retiradas, {rep.totalReturns} devoluções, {rep.damagesReported.length} avarias reportadas.
                      </p>
                    </div>

                    <span className="text-slate-400 font-mono text-[11px]">ID: {rep.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
