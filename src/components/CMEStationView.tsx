import React, { useState } from 'react';
import { Kit, AutoclaveCycleRecord, UserProfile } from '../types';
import { initialAutoclaveCycles } from '../data/mockData';

interface CMEStationViewProps {
  kits: Kit[];
  onSterilizeKit: (kitId: string) => void;
  onQueueRestock: (kitId: string) => void;
  activeProfile: UserProfile;
}

export const CMEStationView: React.FC<CMEStationViewProps> = ({
  kits,
  onSterilizeKit,
  onQueueRestock,
  activeProfile
}) => {
  const [cycles, setCycles] = useState<AutoclaveCycleRecord[]>(initialAutoclaveCycles);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [selectedChamber, setSelectedChamber] = useState('AUTOCLAVE-CRISTOFOLI-01');
  const [selectedKitsToAutoclave, setSelectedKitsToAutoclave] = useState<string[]>([]);
  const [bioResult, setBioResult] = useState<'Aprovado (Negativo)' | 'Em Incubação' | 'Falha'>('Aprovado (Negativo)');
  const [class5Checked, setClass5Checked] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const pendingKits = kits.filter((k) => k.status === 'Expired' || k.status === 'Expiring' || k.status === 'Decontaminated');
  const sterileKits = kits.filter((k) => k.status === 'Ready');

  const handleStartCycle = (e: React.FormEvent) => {
    e.preventDefault();
    const newCycleNumber = cycles.length > 0 ? cycles[0].cycleNumber + 1 : 4107;
    const newCycle: AutoclaveCycleRecord = {
      id: `CICLO-${newCycleNumber}`,
      cycleNumber: newCycleNumber,
      chamberId: selectedChamber,
      operator: activeProfile.name || 'Carlos Mendes',
      startTime: 'Agora (' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ')',
      durationMinutes: 45,
      temperature: 134,
      pressureBar: 2.1,
      kitsCount: selectedKitsToAutoclave.length || 4,
      biologicalIndicator: bioResult,
      chemicalIndicatorClass5: class5Checked,
      status: 'Concluído com Sucesso'
    };

    setCycles([newCycle, ...cycles]);

    // Sterilize selected kits
    if (selectedKitsToAutoclave.length > 0) {
      selectedKitsToAutoclave.forEach((kitId) => {
        onSterilizeKit(kitId);
      });
    } else if (pendingKits.length > 0) {
      pendingKits.slice(0, 3).forEach((k) => onSterilizeKit(k.id));
    }

    setIsNewCycleModalOpen(false);
    setSelectedKitsToAutoclave([]);
    setSuccessToast(`Ciclo #${newCycleNumber} registrado com sucesso! Validade das marmitas renovada para 15 dias.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold uppercase tracking-wider">
              Central de Material e Esterilização (CME)
            </span>
            <span className="text-[12px] text-slate-500 font-medium">
              Operador: {activeProfile.name}
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
            Estação de Esterilização &amp; Monitoramento de Autoclave
          </h2>
          <p className="text-[14px] text-slate-500 mt-0.5">
            Controle de lotes, validação de indicadores biológicos e renovação de validade das marmitas.
          </p>
        </div>

        <button
          onClick={() => setIsNewCycleModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <span className="material-symbols-outlined text-[19px] text-emerald-400">precision_manufacturing</span>
          <span>Novo Ciclo de Autoclave</span>
        </button>
      </div>

      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
          <span className="text-[13.5px] font-medium">{successToast}</span>
        </div>
      )}

      {/* Autoclave Status & Chamber Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-[11.5px] font-semibold uppercase tracking-wider">Autoclave 01 (Cristófoli)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[24px] font-bold text-slate-900">134 °C • 2.1 bar</div>
          <p className="text-[12px] text-emerald-700 font-medium mt-1">
            ✓ Parâmetros térmicos e de pressão nominal atingidos
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-[11.5px] font-semibold uppercase tracking-wider">Indicador Biológico (Esporos)</span>
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
          </div>
          <div className="text-[24px] font-bold text-slate-900">100% Negativo</div>
          <p className="text-[12px] text-slate-500 mt-1">
            G. stearothermophilus validado em 24h
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-[11.5px] font-semibold uppercase tracking-wider">Marmitas Aguardando Ciclo</span>
            <span className="material-symbols-outlined text-amber-500 text-[18px]">hourglass_top</span>
          </div>
          <div className="text-[24px] font-bold text-amber-600">{pendingKits.length} Marmitas</div>
          <p className="text-[12px] text-slate-500 mt-1">
            Vencidas ou em quarentena pós-clínica
          </p>
        </div>
      </div>

      {/* Fila de Marmitas a Esterilizar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-[17px] font-bold text-slate-900">
              Marmitas na Fila de Descontaminação &amp; Re-esterilização
            </h3>
            <p className="text-[12.5px] text-slate-500">
              Kits que necessitam de ciclo de autoclave para renovar os 15 dias de esterilidade.
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-800 text-[12px] font-semibold rounded-full border border-amber-200">
            {pendingKits.length} Pendentes
          </span>
        </div>

        {pendingKits.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-[13.5px]">
            ✓ Todas as marmitas do inventário estão esterilizadas e dentro do prazo de validade!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingKits.map((kit) => (
              <div
                key={kit.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {kit.code}
                    </span>
                    <h4 className="text-[15px] font-bold text-slate-900">{kit.name}</h4>
                    <span
                      className={`text-[10.5px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                        kit.status === 'Expired'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {kit.status === 'Expired' ? 'Vencido (0 dias)' : `${kit.validityDays} dias restantes`}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-slate-500 mt-1">
                    {kit.notes || 'Necessita re-esterilização imediata com indicador biológico.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSterilizeKit(kit.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12.5px] font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[16px]">autorenew</span>
                    <span>Esterilizar (1-Clique)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de Ciclos de Autoclave */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-[17px] font-bold text-slate-900">
              Registro Oficial de Ciclos da Autoclave (RDC 15 / Anvisa)
            </h3>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              Rastreabilidade de lotes, temperatura, pressão e liberação biológica.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lote / Ciclo</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Autoclave</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Data / Hora</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operador</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Marmitas</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Indicador Biológico</th>
                <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="text-[13px] divide-y divide-slate-100">
              {cycles.map((cyc) => (
                <tr key={cyc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-blue-600">
                    {cyc.id}
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 font-medium">
                    {cyc.chamberId}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 font-mono text-[12px]">
                    {cyc.startTime}
                  </td>
                  <td className="py-3.5 px-5 text-slate-800">
                    {cyc.operator}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {cyc.kitsCount} kits
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                      ✓ {cyc.biologicalIndicator}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                      {cyc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Registrar Novo Ciclo */}
      {isNewCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
              <div className="flex items-center gap-2.5 text-slate-900">
                <span className="material-symbols-outlined text-[22px] text-emerald-600">precision_manufacturing</span>
                <h3 className="text-[17px] font-bold">Registrar Novo Lote de Autoclave</h3>
              </div>
              <button
                onClick={() => setIsNewCycleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleStartCycle} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Câmara de Esterilização / Autoclave *
                </label>
                <select
                  value={selectedChamber}
                  onChange={(e) => setSelectedChamber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden cursor-pointer"
                >
                  <option value="AUTOCLAVE-CRISTOFOLI-01">AUTOCLAVE-CRISTOFOLI-01 (Câmara Principal)</option>
                  <option value="AUTOCLAVE-CRISTOFOLI-02">AUTOCLAVE-CRISTOFOLI-02 (Câmara Auxiliar)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Resultado do Indicador Biológico (Esporos) *
                </label>
                <select
                  value={bioResult}
                  onChange={(e) => setBioResult(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden cursor-pointer"
                >
                  <option value="Aprovado (Negativo)">Aprovado (Negativo - 24h sem crescimento)</option>
                  <option value="Em Incubação">Em Incubação (Aguardando leitura)</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={class5Checked}
                    onChange={(e) => setClass5Checked(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-[13px] text-slate-700 font-medium">
                    Integrador Químico Classe 5 conferido e aprovado em todos os pacotes
                  </span>
                </label>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[12px] text-emerald-900 space-y-1">
                <p className="font-semibold">Parâmetros Automáticos:</p>
                <p>Temperatura: 134°C • Pressão: 2.1 bar • Tempo: 45 min • Validade: 15 dias.</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCycleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[17px] text-emerald-400">check_circle</span>
                  <span>Confirmar &amp; Liberar Lote</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
