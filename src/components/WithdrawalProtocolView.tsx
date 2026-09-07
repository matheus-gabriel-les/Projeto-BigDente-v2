import React, { useState } from 'react';
import { Student, Kit, Transaction } from '../types';

interface WithdrawalProtocolViewProps {
  students: Student[];
  kits: Kit[];
  transactions: Transaction[];
  onExecuteTransaction: (tx: {
    studentGrr: string;
    kitId: string;
    type: 'Withdrawal' | 'Return';
  }) => void;
  onVoidTransaction?: (txId: string) => void;
}

export const WithdrawalProtocolView: React.FC<WithdrawalProtocolViewProps> = ({
  students,
  kits,
  transactions,
  onExecuteTransaction,
  onVoidTransaction
}) => {
  const [protocolType, setProtocolType] = useState<'Withdrawal' | 'Return'>('Withdrawal');
  const [grrInput, setGrrInput] = useState<string>('20230192');
  const [kitInput, setKitInput] = useState<string>('K-P204');
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [activeMenuTxId, setActiveMenuTxId] = useState<string | null>(null);

  // Quick lookup
  const matchedStudent =
    students.find(
      (s) =>
        s.grr.includes(grrInput) ||
        s.code.toLowerCase() === grrInput.toLowerCase() ||
        s.name.toLowerCase().includes(grrInput.toLowerCase())
    ) || students[0];

  const matchedKit =
    kits.find(
      (k) =>
        k.code.toLowerCase().includes(kitInput.toLowerCase()) ||
        k.id.toLowerCase().includes(kitInput.toLowerCase()) ||
        k.name.toLowerCase().includes(kitInput.toLowerCase())
    ) || kits[4]; // Default to Periodontics Kit B (K-P204)

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grrInput || !kitInput) return;
    setIsVerified(true);
  };

  const handleConfirmAction = () => {
    if (!matchedStudent || !matchedKit) return;

    onExecuteTransaction({
      studentGrr: matchedStudent.grr,
      kitId: matchedKit.code,
      type: protocolType
    });

    setIsVerified(false);
  };

  const handleQuickFill = (grr: string, kitId: string, type: 'Withdrawal' | 'Return') => {
    setGrrInput(grr);
    setKitInput(kitId);
    setProtocolType(type);
    setIsVerified(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Mode Switcher */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold uppercase tracking-wider">
              Terminal Operacional
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight leading-tight">
            Protocolo de Retirada &amp; Devolução
          </h2>
          <p className="text-[14px] text-slate-500 mt-0.5">
            Leitura óptica por código de barras e verificação biométrica de alunos.
          </p>
        </div>

        {/* Toggle Switcher */}
        <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200/80">
          <button
            id="mode-withdrawal-btn"
            onClick={() => {
              setProtocolType('Withdrawal');
              setIsVerified(true);
            }}
            className={`px-5 py-2 rounded-full font-medium text-[13px] flex items-center gap-1.5 transition-all cursor-pointer ${
              protocolType === 'Withdrawal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-blue-600">output</span>
            <span>Retirada (Saída)</span>
          </button>

          <button
            id="mode-return-btn"
            onClick={() => {
              setProtocolType('Return');
              setIsVerified(true);
            }}
            className={`px-5 py-2 rounded-full font-medium text-[13px] flex items-center gap-1.5 transition-all cursor-pointer ${
              protocolType === 'Return'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">input</span>
            <span>Devolução (Entrada)</span>
          </button>
        </div>
      </div>

      {/* Content Area Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner Input & Verification (Spans 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick Scanner Input */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 text-slate-900">
              <span className="material-symbols-outlined text-[24px] text-blue-600">barcode_scanner</span>
              <h3 className="text-[18px] font-semibold">Leitor de Código de Barras</h3>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Matrícula do Aluno (GRR ou Código)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={grrInput}
                    onChange={(e) => {
                      setGrrInput(e.target.value);
                      setIsVerified(true);
                    }}
                    placeholder="ex: 20230192 ou MCS"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-[13px] text-slate-900 uppercase focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden tracking-wider transition-all"
                  />
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    badge
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Código da Marmita / Kit
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={kitInput}
                    onChange={(e) => {
                      setKitInput(e.target.value);
                      setIsVerified(true);
                    }}
                    placeholder="ex: K-P204 ou KIT-MAR-1024"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-[13px] text-slate-900 uppercase focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden tracking-wider transition-all"
                  />
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    science
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons for rapid testing */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                  Atalhos de Simulação Rápida:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('20230192', 'K-P204', 'Withdrawal')}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 font-mono border border-slate-200 transition-colors"
                  >
                    Mariana (Retirada K-P204)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('84920193', 'KIT-MAR-1024', 'Withdrawal')}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 font-mono border border-slate-200 transition-colors"
                  >
                    Alina (Retirada KIT-1024)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('20220891', 'K-C405', 'Return')}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 font-mono border border-slate-200 transition-colors"
                  >
                    Ana (Devolução K-C405)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white text-[13px] font-medium py-3 rounded-xl mt-2 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-99"
              >
                <span>Validar Dados</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </div>

          {/* Verification Card (Active / Ready to Confirm) */}
          {isVerified && matchedStudent && matchedKit && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-semibold text-slate-900">Verificação de Conformidade</h3>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Apto p/ Confirmação
                </span>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 mb-4 space-y-3">
                {/* Student Row */}
                <div className="flex items-start gap-3.5 border-b border-slate-200/70 pb-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center shrink-0 font-bold">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-[14px]">
                      {matchedStudent.name}
                    </p>
                    <p className="font-mono text-[12px] text-slate-500">
                      GRR: {matchedStudent.grr} ({matchedStudent.code})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {matchedStudent.course}
                    </p>
                  </div>
                </div>

                {/* Kit Row */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 bg-slate-200/80 rounded-xl flex items-center justify-center text-slate-700 shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-blue-600">medical_services</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-[14px]">
                      {matchedKit.name}
                    </p>
                    <p className="font-mono text-[12px] text-slate-500">
                      ID: {matchedKit.code}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] text-emerald-700 font-medium">
                        Esterilizado - Validade de {matchedKit.validityDays} dias
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsVerified(false)}
                  className="flex-1 bg-slate-100 text-slate-700 text-[13px] font-medium py-2.5 rounded-xl hover:bg-slate-200/80 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className="flex-1 bg-slate-900 text-white text-[13px] font-medium py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
                  <span>Confirmar {protocolType === 'Withdrawal' ? 'Retirada' : 'Devolução'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Transactions List (Spans 7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white border border-slate-200/80 rounded-2xl flex flex-col h-full overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-[17px] font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">history</span>
                <span>Registro de Transações do Dia</span>
              </h3>
              <div className="flex items-center gap-1 text-slate-500">
                <span className="font-mono text-[12px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                  {transactions.length} Registros
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-xs border-b border-slate-200/70 z-10">
                  <tr>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Horário
                    </th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Aluno / GRR
                    </th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Código do Kit
                    </th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px] text-slate-700">
                  {transactions.map((tx) => {
                    const isWithdrawal = tx.action === 'Withdrawal';
                    const isReturn = tx.action === 'Return';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3.5 px-5 font-mono text-[12px] text-slate-500">
                          {tx.timestamp}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-900">
                            {tx.studentName || 'Acadêmico'}
                          </div>
                          <div className="font-mono text-slate-400 text-[11px]">
                            {tx.grrCode}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 font-mono font-semibold text-slate-900">
                          {tx.kitId}
                        </td>
                        <td className="py-3.5 px-5">
                          {isWithdrawal && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200/60">
                              <span className="material-symbols-outlined text-[12px]">output</span>
                              <span>Retirada</span>
                            </span>
                          )}
                          {isReturn && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200/60">
                              <span className="material-symbols-outlined text-[12px]">input</span>
                              <span>Devolução</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right relative">
                          <button
                            onClick={() =>
                              setActiveMenuTxId(activeMenuTxId === tx.id ? null : tx.id)
                            }
                            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              more_vert
                            </span>
                          </button>

                          {activeMenuTxId === tx.id && (
                            <div className="absolute right-5 top-11 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 w-44 z-20 text-left animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={() => {
                                  if (onVoidTransaction) onVoidTransaction(tx.id);
                                  setActiveMenuTxId(null);
                                }}
                                className="w-full px-3.5 py-2 text-[12px] text-rose-600 font-medium hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  cancel
                                </span>
                                <span>Estornar Entrada</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
