import React, { useState } from 'react';
import { APP_IMAGES } from '../data/mockData';

export const SettingsView: React.FC = () => {
  const [autoclaveChamber, setAutoclaveChamber] = useState('MÁQUINA-ESTERILIZAÇÃO-01');
  const [expiryDays, setExpiryDays] = useState(15);
  const [warningThreshold, setWarningThreshold] = useState(3);
  const [requireBioIndicator, setRequireBioIndicator] = useState(true);
  const [allowOverdueCheckout, setAllowOverdueCheckout] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold uppercase tracking-wider">
            Administração do Sistema
          </span>
        </div>
        <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
          Configurações do Laboratório &amp; Setor de Esterilização
        </h2>
        <p className="text-[14px] text-slate-500 mt-0.5">
          Parâmetros de validade das marmitas, protocolos da ANVISA e equipamentos de esterilização.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200/80 text-emerald-800 p-4 rounded-xl text-[13px] font-medium flex items-center gap-2.5 animate-in fade-in">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <span>Configurações salvas e replicadas com sucesso em todos os terminais.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sterilization Rules Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-[16px] font-semibold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
            <span className="material-symbols-outlined text-blue-600">timer</span>
            <span>Protocolos de Esterilização &amp; Validade Sanitária</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Validade Padrão das Marmitas (Dias)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden font-mono transition-all"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Padrão odontológico institucional: 15 dias corridos.
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Gatilho de Alerta de Vencimento Próximo (Dias)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden font-mono transition-all"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Marmitas com validade inferior entrarão no status de atenção.
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireBioIndicator}
                onChange={(e) => setRequireBioIndicator(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 border-slate-300"
              />
              <span className="text-[13px] text-slate-700 font-medium">
                Exigir confirmação de Indicador Biológico (Geobacillus stearothermophilus) a cada lote de esterilização
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowOverdueCheckout}
                onChange={(e) => setAllowOverdueCheckout(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 border-slate-300"
              />
              <span className="text-[13px] text-slate-700 font-medium">
                Permitir liberação sob autorização de supervisor para alunos com pendências de devolução &gt; 48h
              </span>
            </label>
          </div>
        </div>

        {/* Hardware & Esterilização Station Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-[16px] font-semibold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
            <span className="material-symbols-outlined text-blue-600">precision_manufacturing</span>
            <span>Máquinas de Esterilização &amp; Leitor Óptico</span>
          </h3>

          <div>
            <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
              Identificador da Máquina de Esterilização Padrão
            </label>
            <input
              type="text"
              value={autoclaveChamber}
              onChange={(e) => setAutoclaveChamber(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Clinical Supervisor Profile Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-[16px] font-semibold text-slate-900 flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
            <span className="material-symbols-outlined text-blue-600">badge</span>
            <span>Responsável Técnico Odontológico</span>
          </h3>

          <div className="flex items-center gap-4">
            <img
              src={APP_IMAGES.drVance}
              alt="Dr. E. Vance"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div>
              <h4 className="text-[16px] font-semibold text-slate-900">Dr. E. Vance</h4>
              <p className="text-[13px] text-slate-500">Diretor Clínico &amp; Responsável Técnico pela Esterilização</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">CRO/SP: 89024 | ID: SUP-VANCE</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 text-white text-[13px] font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-xs cursor-pointer active:scale-98"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
};
