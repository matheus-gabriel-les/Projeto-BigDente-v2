import React, { useState } from 'react';
import { Student, Kit } from '../types';

interface NewWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  kits: Kit[];
  onSubmitWithdrawal: (data: { studentGrr: string; kitId: string }) => void;
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

  if (!isOpen) return null;

  const selectedStudent = students.find((s) => s.grr === selectedGrr);
  const selectedKit = kits.find((k) => k.code === selectedKitCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrr || !selectedKitCode) return;
    onSubmitWithdrawal({ studentGrr: selectedGrr, kitId: selectedKitCode });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5 text-slate-900">
            <span className="material-symbols-outlined text-[22px] text-blue-600">output</span>
            <h3 className="text-[17px] font-semibold">Nova Retirada de Marmita / Kit</h3>
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
              Selecione a Marmita / Bandeja Estéril *
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
                    {k.code} - {k.name} ({k.status === 'Ready' ? 'Pronta' : k.status === 'In Use' ? 'Em Uso' : 'Necessita Autoclave'} • {k.validityDays}d validade)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quick Preview */}
          {selectedStudent && selectedKit && (
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 text-[12px] space-y-1.5">
              <div className="font-semibold text-slate-900">Resumo da Retirada:</div>
              <p className="text-slate-600">
                Vinculando <span className="font-semibold text-slate-900">{selectedKit.name}</span> ({selectedKit.code}) ao acadêmico{' '}
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
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
              <span>Confirmar &amp; Liberar Marmita</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
