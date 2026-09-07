import React, { useState } from 'react';
import { Kit } from '../types';

interface KitInventoryViewProps {
  kits: Kit[];
  onRegisterKit: (newKit: Omit<Kit, 'id'>) => void;
  onSterilizeKit: (kitId: string) => void;
  onQueueRestock: (kitId: string) => void;
  searchQuery: string;
}

export const KitInventoryView: React.FC<KitInventoryViewProps> = ({
  kits,
  onRegisterKit,
  onSterilizeKit,
  onQueueRestock,
  searchQuery
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'IN_USE' | 'EXPIRING' | 'EXPIRED'>('ALL');
  const [selectedKitForDetails, setSelectedKitForDetails] = useState<Kit | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Form for new kit
  const [newKitData, setNewKitData] = useState({
    code: '',
    name: '',
    status: 'Ready' as Kit['status'],
    validityDays: 15,
    itemsText: 'Cabo de Bisturi nº 3, Espelho Clínico nº 5, Sonda Exploradora nº 5, Pinça Clínica',
    notes: 'Esterilizado em Autoclave Câmara A (134°C - 4min)'
  });

  const readyCount = kits.filter((k) => k.status === 'Ready').length;
  const inUseCount = kits.filter((k) => k.status === 'In Use').length;
  const expiringCount = kits.filter((k) => k.status === 'Expiring').length;
  const expiredCount = kits.filter((k) => k.status === 'Expired').length;
  const totalCount = kits.length;

  const filteredKits = kits.filter((kit) => {
    const matchesSearch =
      kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kit.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (kit.assignedStudentName && kit.assignedStudentName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'READY'
        ? kit.status === 'Ready'
        : statusFilter === 'IN_USE'
        ? kit.status === 'In Use'
        : statusFilter === 'EXPIRING'
        ? kit.status === 'Expiring'
        : kit.status === 'Expired';

    return matchesSearch && matchesStatus;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKitData.code || !newKitData.name) return;

    onRegisterKit({
      code: newKitData.code.toUpperCase(),
      name: newKitData.name,
      status: newKitData.status,
      lastSterilized: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      cyclesLogged: 1,
      validityDays: newKitData.validityDays,
      items: newKitData.itemsText.split(',').map((item) => item.trim()),
      notes: newKitData.notes
    });

    setNewKitData({
      code: '',
      name: '',
      status: 'Ready',
      validityDays: 15,
      itemsText: 'Cabo de Bisturi nº 3, Espelho Clínico nº 5, Sonda Exploradora nº 5, Pinça Clínica',
      notes: 'Esterilizado em Autoclave Câmara A (134°C - 4min)'
    });
    setShowRegisterModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold uppercase tracking-wider">
              Arsenal &amp; Almoxarifado Clínico
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
            Inventário de Marmitas &amp; Esterilização
          </h2>
          <p className="text-[14px] text-slate-500 mt-0.5">
            Gestão de bandejas cirúrgicas, ciclos de autoclavagem e rastreamento de lotes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="btn-register-new-kit"
            onClick={() => setShowRegisterModal(true)}
            className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-400">add_box</span>
            <span>Cadastrar Nova Marmita</span>
          </button>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todas as Marmitas ({totalCount})
          </button>

          <button
            onClick={() => setStatusFilter('READY')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              statusFilter === 'READY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Prontas / Estéreis ({readyCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('IN_USE')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              statusFilter === 'IN_USE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-300" />
            <span>Em Uso Clínico ({inUseCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('EXPIRING')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              statusFilter === 'EXPIRING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300" />
            <span>A Vencer (&lt;3 dias) ({expiringCount})</span>
          </button>

          {expiredCount > 0 && (
            <button
              onClick={() => setStatusFilter('EXPIRED')}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                statusFilter === 'EXPIRED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'border border-rose-200 text-rose-600 hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Vencidas ({expiredCount})</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setShowBulkModal(true)}
          className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-1.5 rounded-xl text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-600">bolt</span>
          <span>Ações em Lote</span>
        </button>
      </div>

      {/* Grid of Kit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredKits.map((kit) => {
          const isReady = kit.status === 'Ready';
          const isExpiring = kit.status === 'Expiring';
          const isExpired = kit.status === 'Expired';
          const isInUse = kit.status === 'In Use';

          const barColor = isReady
            ? 'bg-emerald-500'
            : isExpiring
            ? 'bg-amber-500'
            : isExpired
            ? 'bg-rose-500'
            : 'bg-blue-600';

          return (
            <div
              key={kit.id}
              className={`bg-white border rounded-2xl overflow-hidden flex flex-col relative shadow-xs hover:shadow-md transition-all ${
                isExpired ? 'border-rose-300/80 bg-rose-50/20' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Top status bar accent */}
              <div className={`h-1.5 w-full ${barColor} absolute top-0 left-0`} />

              {/* Card Header */}
              <div className="p-5 pt-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <div
                    className={`font-mono text-[11px] font-semibold ${
                      isExpired ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {kit.code}
                  </div>
                  <h3 className="text-[16px] font-semibold text-slate-900 mt-0.5 leading-snug">
                    {kit.name}
                  </h3>
                </div>

                {/* Badge */}
                {isReady && (
                  <div className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 border border-emerald-200/60">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Pronta</span>
                  </div>
                )}
                {isExpiring && (
                  <div className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 border border-amber-200/60">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    <span>A Vencer</span>
                  </div>
                )}
                {isExpired && (
                  <div className="bg-rose-50 text-rose-700 border border-rose-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>Vencida</span>
                  </div>
                )}
                {isInUse && (
                  <div className="bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">person_play</span>
                    <span>Em Uso</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col gap-2.5">
                {isInUse ? (
                  <>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-400 font-medium">Com Aluno:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {kit.assignedStudentName || kit.assignedTo || 'STU-8821'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-400 font-medium">Horário Retirada:</span>
                      <span className="font-medium text-slate-700">
                        {kit.checkoutTime || 'Hoje às 08:30'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-400 font-medium">Última Autoclave:</span>
                      <span className="font-medium text-slate-700">
                        {kit.lastSterilized}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-slate-400 font-medium">Ciclos Totais:</span>
                      <span className="font-semibold text-slate-900">
                        {kit.cyclesLogged} ciclos
                      </span>
                    </div>
                  </>
                )}

                {/* Card Footer / Action */}
                <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {isExpired ? 'Necessita Ação' : isInUse ? 'Validade Restante' : 'Validade'}
                    </div>

                    {isExpired ? (
                      <div className="text-[13px] font-bold text-rose-600 mt-0.5">
                        Reprocessar
                      </div>
                    ) : (
                      <div
                        className={`text-[22px] font-bold leading-none mt-0.5 ${
                          isExpiring ? 'text-amber-600' : 'text-slate-900'
                        }`}
                      >
                        {kit.validityDays < 10 ? `0${kit.validityDays}` : kit.validityDays}{' '}
                        <span className="text-[12px] font-normal text-slate-400">Dias</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {isReady && (
                    <button
                      onClick={() => setSelectedKitForDetails(kit)}
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Ver Detalhes do Kit"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  )}

                  {isExpiring && (
                    <button
                      onClick={() => onSterilizeKit(kit.id)}
                      className="bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-[12px] font-medium hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                    >
                      Esterilizar
                    </button>
                  )}

                  {isExpired && (
                    <button
                      onClick={() => onQueueRestock(kit.id)}
                      className="bg-rose-600 text-white px-3.5 py-1.5 rounded-xl text-[12px] font-medium hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">sync</span>
                      <span>Autoclave</span>
                    </button>
                  )}

                  {isInUse && (
                    <button
                      onClick={() => setSelectedKitForDetails(kit)}
                      className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                      title="Ver Protocolo"
                    >
                      <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: View Details */}
      {selectedKitForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <span className="font-mono text-[11px] font-semibold text-slate-400">
                  {selectedKitForDetails.code}
                </span>
                <h3 className="text-[17px] font-semibold text-slate-900">
                  {selectedKitForDetails.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedKitForDetails(null)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Status Clínico</span>
                  <p className="text-[13px] font-semibold text-slate-900 mt-0.5">
                    {selectedKitForDetails.status === 'Ready' ? 'Pronta / Estéril' : selectedKitForDetails.status === 'In Use' ? 'Em Uso' : 'A Reprocessar'}
                  </p>
                </div>
                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Validade Restante
                  </span>
                  <p className="text-[13px] font-semibold text-slate-900 mt-0.5">
                    {selectedKitForDetails.validityDays} Dias
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Instrumentais Inclusos ({selectedKitForDetails.items?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {selectedKitForDetails.items?.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {selectedKitForDetails.notes && (
                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Notas de Esterilização &amp; Indicador Biológico
                  </span>
                  <p className="text-[12px] text-slate-600 mt-1">
                    {selectedKitForDetails.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
              <button
                onClick={() => {
                  onSterilizeKit(selectedKitForDetails.id);
                  setSelectedKitForDetails(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-[12px] font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Renovar Ciclo de Autoclave (15 Dias)
              </button>
              <button
                onClick={() => setSelectedKitForDetails(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[12px] font-medium hover:bg-slate-100 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Register New Kit */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-[17px] font-semibold text-slate-900">Cadastrar Nova Marmita / Kit</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Código da Marmita (ID) *
                </label>
                <input
                  type="text"
                  required
                  value={newKitData.code}
                  onChange={(e) => setNewKitData({ ...newKitData, code: e.target.value })}
                  placeholder="ex: KIT-PERIO-01"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-[13px] text-slate-900 uppercase focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Nome da Bandeja / Kit *
                </label>
                <input
                  type="text"
                  required
                  value={newKitData.name}
                  onChange={(e) => setNewKitData({ ...newKitData, name: e.target.value })}
                  placeholder="ex: Kit Raspagem Periodontal Gracey"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Instrumentais Inclusos (separados por vírgula)
                </label>
                <textarea
                  rows={3}
                  value={newKitData.itemsText}
                  onChange={(e) => setNewKitData({ ...newKitData, itemsText: e.target.value })}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 shadow-xs cursor-pointer"
                >
                  Salvar e Gerar Código de Barras
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk Actions */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 border border-slate-200">
            <h3 className="text-[17px] font-semibold text-slate-900 mb-2">Ações de Esterilização em Lote</h3>
            <p className="text-[13px] text-slate-500 mb-4">
              Disparar ciclos de autoclave para múltiplos kits simultaneamente.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  kits.forEach((k) => {
                    if (k.status === 'Expiring' || k.status === 'Expired') {
                      onSterilizeKit(k.id);
                    }
                  });
                  setShowBulkModal(false);
                }}
                className="w-full py-2.5 px-3.5 bg-blue-600 text-white rounded-xl text-[12px] font-medium text-left hover:bg-blue-700 transition-colors"
              >
                Esterilizar Todos os Kits Vencidos / A Vencer
              </button>
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-full py-2.5 px-3.5 border border-slate-200 text-slate-600 rounded-xl text-[12px] font-medium text-center hover:bg-slate-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
