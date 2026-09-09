import React, { useState } from 'react';
import { Student, Kit } from '../types';

interface NewWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  kits: Kit[];
  onSubmitWithdrawal: (data: {
    studentGrr: string;
    kitId: string;
    withdrawnMarmitas?: number;
    withdrawnPacotes?: number;
  }) => void;
}

export const NewWithdrawalModal: React.FC<NewWithdrawalModalProps> = ({
  isOpen,
  onClose,
  students,
  kits,
  onSubmitWithdrawal
}) => {
  const [selectedGrr, setSelectedGrr] = useState<string>(students[0]?.grr || '');
  const [selectedKitCode, setSelectedKitCode] = useState<string>(
    kits.find((k) => k.status === 'Ready')?.code || kits[0]?.code || ''
  );

  const selectedStudent = students.find((s) => s.grr === selectedGrr);
  const selectedKit = kits.find((k) => k.code === selectedKitCode);

  const availM = Math.max(0, (selectedKit?.marmitasCount ?? 1) - (selectedKit?.marmitasWithdrawn ?? 0));
  const availP = Math.max(0, (selectedKit?.pacotesCount ?? 0) - (selectedKit?.pacotesWithdrawn ?? 0));

  const [withdrawMarmitas, setWithdrawMarmitas] = useState<number>(availM > 0 ? 1 : 0);
  const [withdrawPacotes, setWithdrawPacotes] = useState<number>(availP > 0 ? 1 : 0);

  // Sync with selected kit
  React.useEffect(() => {
    if (selectedKit) {
      const m = Math.max(0, (selectedKit.marmitasCount ?? 1) - (selectedKit.marmitasWithdrawn ?? 0));
      const p = Math.max(0, (selectedKit.pacotesCount ?? 0) - (selectedKit.pacotesWithdrawn ?? 0));
      setWithdrawMarmitas(m > 0 ? 1 : 0);
      setWithdrawPacotes(p > 0 ? 1 : 0);
    }
  }, [selectedKitCode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrr || !selectedKitCode) return;
    onSubmitWithdrawal({
      studentGrr: selectedGrr,
      kitId: selectedKitCode,
      withdrawnMarmitas: withdrawMarmitas,
      withdrawnPacotes: withdrawPacotes
    });
    onClose();
  };

  const hasMultipleVolumes = (availM + availP) > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5 text-slate-900">
            <span className="material-symbols-outlined text-[22px] text-blue-600">output</span>
            <h3 className="text-[17px] font-semibold">Nova Retirada de Kit / Marmita</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
              Selecione o Acadêmico (GRR / Código) *
            </label>
            <select
              value={selectedGrr}
              onChange={(e) => setSelectedGrr(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden cursor-pointer transition-all"
            >
              {students.map((s) => (
                <option key={s.id} value={s.grr}>
                  {s.name} — GRR: {s.grr} ({s.code}) - {s.status === 'Active' ? 'Ativo' : 'Inativo'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
              Selecione o Kit / Marmitas Prontas *
            </label>
            <select
              value={selectedKitCode}
              onChange={(e) => setSelectedKitCode(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden cursor-pointer transition-all"
            >
              {kits.map((k) => {
                const isAvailable = k.status === 'Ready' || k.status === 'Expiring';
                return (
                  <option
                    key={k.id}
                    value={k.code}
                    disabled={!isAvailable}
                  >
                    {k.code} - {k.name} ({k.status === 'Ready' ? 'Pronta' : k.status === 'In Use' ? 'Em Uso' : 'Necessita Esterilização'} • {k.validityDays}d validade)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Controle de retirada parcial por volume se o kit tiver múltiplos volumes */}
          {selectedKit && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px] text-blue-600">tune</span>
                  <span>Volumes a Retirar deste Kit ({selectedKit.code})</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Saldo: {availM} marmita(s) / {availP} pacote(s) disponíveis
                </span>
              </div>

              {hasMultipleVolumes && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {availM > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawMarmitas(1);
                        setWithdrawPacotes(0);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-[11.5px] font-medium hover:bg-slate-100 cursor-pointer"
                    >
                      🍱 Retirar apenas 1 Marmita
                    </button>
                  )}
                  {availP > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawMarmitas(0);
                        setWithdrawPacotes(1);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-[11.5px] font-medium hover:bg-slate-100 cursor-pointer"
                    >
                      📦 Retirar apenas 1 Pacote
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawMarmitas(availM);
                      setWithdrawPacotes(availP);
                    }}
                    className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-[11.5px] font-semibold hover:bg-blue-100 cursor-pointer"
                  >
                    ⚡ Retirar Kit Completo ({availM + availP} itens)
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Marmitas */}
                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    🍱 Marmitas (Rígidas / Bisturis)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={withdrawMarmitas <= 0}
                      onClick={() => setWithdrawMarmitas(Math.max(0, withdrawMarmitas - 1))}
                      className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[14px] disabled:opacity-40 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-[14px] text-slate-900">
                      {withdrawMarmitas} <span className="text-[11px] text-slate-500 font-normal">/ {availM}</span>
                    </span>
                    <button
                      type="button"
                      disabled={withdrawMarmitas >= availM}
                      onClick={() => setWithdrawMarmitas(Math.min(availM, withdrawMarmitas + 1))}
                      className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[14px] disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Pacotes */}
                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    📦 Pacotes (Moles / Capas)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={withdrawPacotes <= 0}
                      onClick={() => setWithdrawPacotes(Math.max(0, withdrawPacotes - 1))}
                      className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[14px] disabled:opacity-40 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-[14px] text-slate-900">
                      {withdrawPacotes} <span className="text-[11px] text-slate-500 font-normal">/ {availP}</span>
                    </span>
                    <button
                      type="button"
                      disabled={withdrawPacotes >= availP}
                      onClick={() => setWithdrawPacotes(Math.min(availP, withdrawPacotes + 1))}
                      className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[14px] disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Preview */}
          {selectedStudent && selectedKit && (
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 text-[12px] space-y-1.5">
              <div className="font-semibold text-slate-900">Resumo da Retirada:</div>
              <p className="text-slate-600">
                Liberando <strong className="text-slate-900">{withdrawMarmitas} marmita(s)</strong> e <strong className="text-slate-900">{withdrawPacotes} pacote(s)</strong> do kit <span className="font-semibold text-slate-900">{selectedKit.name}</span> ({selectedKit.code}) para{' '}
                <span className="font-semibold text-slate-900">{selectedStudent.name}</span> (GRR {selectedStudent.grr}).
              </p>
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium pt-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Esterilização em conformidade ({selectedKit.validityDays} dias de validade)</span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={withdrawMarmitas === 0 && withdrawPacotes === 0}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-[13px] font-medium shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
              <span>Confirmar &amp; Liberar ({withdrawMarmitas + withdrawPacotes} itens)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
