import React, { useState } from 'react';
import { Kit, Student, Transaction, UserProfile } from '../types';

interface ReceptionCounterViewProps {
  students: Student[];
  kits: Kit[];
  transactions: Transaction[];
  onExecuteTransaction: (params: { studentGrr: string; kitId: string; type: 'Withdrawal' | 'Return' }) => void;
  onSendKitToCME?: (kitId: string) => void;
  activeProfile: UserProfile;
}

export const ReceptionCounterView: React.FC<ReceptionCounterViewProps> = ({
  students,
  kits,
  transactions,
  onExecuteTransaction,
  onSendKitToCME,
  activeProfile
}) => {
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
            Conferência imediata de dados do acadêmico e das marmitas para liberação, retirada ou devolução.
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

      {/* Feedback Toast */}
      {verificationFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-2.5 text-[13px] font-medium shadow-xs">
          <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
          <span>{verificationFeedback.message}</span>
        </div>
      )}

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
                        {kit.boxMaterial || 'Caixa Inox'} • <strong>Conferência de itens:</strong> {kit.items?.join(', ')}
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
                        {kit.boxMaterial || 'Caixa Inox'} • {kit.items?.length || 0} instrumentos
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
  );
};
