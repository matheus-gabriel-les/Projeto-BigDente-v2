import React from 'react';
import { Kit, Student, ActionAlert, TabType } from '../types';

interface DashboardViewProps {
  kits: Kit[];
  students: Student[];
  alerts: ActionAlert[];
  onNavigateTab: (tab: TabType) => void;
  onSelectStudent?: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kits,
  students,
  alerts,
  onNavigateTab,
}) => {
  // Real stats calculations
  const readyKitsCount = kits.filter((k) => k.status === 'Ready').length;
  const inUseKits = kits.filter((k) => k.status === 'In Use');
  const inUseKitsCount = inUseKits.length;
  const cmeKitsCount = kits.filter((k) => k.status === 'Decontaminated').length;
  const alertKitsCount = kits.filter((k) => k.status === 'Expiring' || k.status === 'Expired').length;
  const activeStudents = students.filter((s) => s.status === 'Active');
  const activeStudentsCount = activeStudents.length;

  // Group kits by clinical category for administrative asset overview
  const categories = ['Cirurgia', 'Dentística', 'Periodontia', 'Endodontia', 'Prótese'];
  const categoryStats = categories.map((cat) => {
    const total = kits.filter((k) => k.category === cat).length;
    const ready = kits.filter((k) => k.category === cat && k.status === 'Ready').length;
    const inUse = kits.filter((k) => k.category === cat && k.status === 'In Use').length;
    return { name: cat, total, ready, inUse };
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-semibold uppercase tracking-wider">
              Coordenação &amp; Administração
            </span>
          </div>
          <h2 className="text-[24px] md:text-[28px] font-bold text-slate-900 tracking-tight">
            Painel Geral do Administrador
          </h2>
          <p className="text-[14px] text-slate-500 mt-0.5">
            Governança institucional do acervo de marmitas, gestão de acadêmicos e auditoria de conformidade sanitária.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="admin-btn-students"
            onClick={() => onNavigateTab('students')}
            className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-400">group</span>
            <span>Gestão de Alunos</span>
          </button>
          <button
            id="admin-btn-inventory"
            onClick={() => onNavigateTab('inventory')}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">inventory</span>
            <span>Inventário Geral</span>
          </button>
          <button
            id="admin-btn-reports"
            onClick={() => onNavigateTab('reports')}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-[13px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">analytics</span>
            <span>Auditoria Sanitária</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Administrative KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Acadêmicos Ativos */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-semibold text-slate-600">Acadêmicos Matriculados</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[19px]">school</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[30px] font-bold text-slate-900 tracking-tight">{activeStudentsCount}</span>
            <span className="text-[12px] text-purple-700 font-medium">aptos às clínicas</span>
          </div>
        </div>

        {/* Marmitas Prontas / Estéreis */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-semibold text-slate-600">Marmitas Estéreis Prontas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[19px]">verified</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[30px] font-bold text-emerald-600 tracking-tight">{readyKitsCount}</span>
            <span className="text-[12px] text-emerald-600 font-medium">prontas no acervo</span>
          </div>
        </div>

        {/* Em Uso Clínico */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-semibold text-slate-600">Em Uso nas Clínicas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[19px]">medical_services</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[30px] font-bold text-blue-600 tracking-tight">{inUseKitsCount}</span>
            <span className="text-[12px] text-blue-600 font-medium">em custódia de alunos</span>
          </div>
        </div>

        {/* Alertas Sanitários */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-semibold text-slate-600">Alertas de Validade</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[19px]">warning</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[30px] font-bold text-rose-600 tracking-tight">{alertKitsCount}</span>
            <span className="text-[12px] text-rose-600 font-medium">expiradas ou a vencer</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Administrative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Governance Status & Sanitary Alerts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Institutional Governance Box */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-600 text-[19px]">tune</span>
                <span>Controle de Biossegurança</span>
              </h3>
              <button
                onClick={() => onNavigateTab('settings')}
                className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Parâmetros →
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">inventory_2</span>
                  <span className="text-[13px] font-medium text-slate-700">Acervo Total de Marmitas</span>
                </div>
                <span className="text-[14px] font-bold text-slate-900">{kits.length} unidades</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                  <span className="text-[13px] font-medium text-slate-700">Máquinas de Esterilização</span>
                </div>
                <span className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  100% Em Dia
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-[20px]">schedule</span>
                  <span className="text-[13px] font-medium text-slate-700">Marmitas em Esterilização</span>
                </div>
                <span className="text-[14px] font-bold text-amber-700">{cmeKitsCount} em ciclo</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-slate-500 text-[20px]">verified_user</span>
                  <span className="text-[13px] font-medium text-slate-700">Prazo de Esterilização</span>
                </div>
                <span className="text-[13px] font-semibold text-slate-800">15 Dias (Grau Cirúrgico)</span>
              </div>
            </div>
          </div>

          {/* Sanitary Alerts List for Administrator */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500 text-[18px]">error</span>
                <span>Alertas Sanitários ({alerts.length})</span>
              </h3>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Ver Inventário →
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-[13px] text-emerald-800 font-medium">
                  Nenhuma marmita vencida no momento. Todos os prazos estéreis estão válidos.
                </span>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1 border-l-4 border-l-rose-500"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[12px] font-bold text-slate-900">
                        {alert.kitId}
                      </span>
                      <span className="bg-rose-50 text-rose-700 border border-rose-200/60 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                        {alert.daysLeft === 0 ? 'Prazo Vencido' : `${alert.daysLeft} Dias Restantes`}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-600 leading-snug">
                      {alert.reason}
                    </p>
                    <button
                      onClick={() => onNavigateTab('inventory')}
                      className="text-[11.5px] font-semibold text-blue-600 hover:underline self-start mt-0.5 cursor-pointer"
                    >
                      Localizar no Inventário Geral →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Academic Custody & Specialty Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Specialty Distribution */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">
                  Distribuição do Acervo por Especialidade Clínica
                </h3>
                <p className="text-[12px] text-slate-500">
                  Controle patrimonial e disponibilidade dos instrumentais odontológicos.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Filtrar Acervo →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categoryStats.map((item) => (
                <div
                  key={item.name}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                >
                  <span className="text-[12.5px] font-bold text-slate-800">{item.name}</span>
                  <div className="mt-2 flex items-baseline justify-between text-[11.5px]">
                    <span className="text-slate-500">Total: <strong className="text-slate-800">{item.total}</strong></span>
                    <span className="text-emerald-700 font-semibold">{item.ready} prontas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Custody Overview: Students currently holding kits */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">
                  Custódia Clínica: Marmitas em Posse dos Alunos
                </h3>
                <p className="text-[12px] text-slate-500">
                  Acompanhamento administrativo de acadêmicos com instrumentais em atendimento.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('students')}
                className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Gerenciar Alunos →
              </button>
            </div>

            <div className="overflow-x-auto flex-1">
              {inUseKits.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-[13px]">
                  Nenhuma marmita em posse externa no momento. Todo o acervo está no almoxarifado ou no setor de esterilização.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4 text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider">
                        Marmita
                      </th>
                      <th className="py-2.5 px-4 text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider">
                        Especialidade
                      </th>
                      <th className="py-2.5 px-4 text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider">
                        Acadêmico Responsável
                      </th>
                      <th className="py-2.5 px-4 text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider">
                        Retirada Em
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[12.5px] text-slate-700 divide-y divide-slate-100">
                    {inUseKits.slice(0, 6).map((kit) => (
                      <tr key={kit.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                          {kit.code}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                            {kit.category || 'Geral'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">
                          {kit.assignedStudentName || (kit.assignedTo ? `GRR ${kit.assignedTo}` : 'Acadêmico')}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 text-[11.5px]">
                          {kit.checkoutTime || 'Hoje'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
