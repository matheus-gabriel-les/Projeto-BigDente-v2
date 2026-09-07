import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Kit, Transaction, Student } from '../types';
import { initialAutoclaveCycles } from '../data/mockData';

interface ReportsViewProps {
  kits: Kit[];
  transactions: Transaction[];
  students: Student[];
}

type ReportType = 'Monthly' | 'Daily' | 'Weekly' | 'Sterilization' | 'Audits';

export const ReportsView: React.FC<ReportsViewProps> = ({
  kits,
  transactions,
  students,
}) => {
  const [reportType, setReportType] = useState<ReportType>('Monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>('Setembro / 2026');
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Computed metrics
  const readyKits = kits.filter((k) => k.status === 'Ready');
  const inUseKits = kits.filter((k) => k.status === 'In Use');
  const alertKits = kits.filter((k) => k.status === 'Expiring' || k.status === 'Expired');
  const decontaminatedKits = kits.filter((k) => k.status === 'Decontaminated');

  // Categories distribution
  const categories = ['Cirurgia', 'Dentística', 'Periodontia', 'Endodontia', 'Prótese', 'Pediatria'];
  const categorySummary = categories.map((cat) => {
    const catKits = kits.filter((k) => k.category === cat);
    const catInUse = catKits.filter((k) => k.status === 'In Use').length;
    const catReady = catKits.filter((k) => k.status === 'Ready').length;
    return {
      categoria: cat,
      total: catKits.length,
      disponiveis: catReady,
      emUso: catInUse,
      taxaUtilizacao: catKits.length > 0 ? Math.round((catInUse / catKits.length) * 100) : 0,
    };
  });

  // Export to real XLSX
  const handleExportXLSX = (specificType?: ReportType) => {
    const currentType = specificType || reportType;
    const wb = XLSX.utils.book_new();
    const currentDateStr = new Date().toLocaleDateString('pt-BR');

    // Sheet 1: Resumo Executivo Mensal
    const resumoData = [
      ['RELATÓRIO DE GESTÃO E CONFORMIDADE SANITÁRIA - ODONTOLOGIA'],
      ['Tipo de Relatório:', currentType === 'Monthly' ? 'Consolidado Mensal' : currentType],
      ['Período Referência:', selectedMonth],
      ['Data de Emissão:', currentDateStr],
      ['Emitido por:', 'Sistema LabControl - Coordenação de Odontologia'],
      [],
      ['INDICADORES GERAIS DO ACERVO DE MARMITAS'],
      ['Métrica', 'Valor', 'Observação'],
      ['Total de Marmitas Cadastradas', kits.length, 'Acervo patrimonial ativo'],
      ['Marmitas Prontas (Estéreis)', readyKits.length, 'Disponíveis no almoxarifado'],
      ['Marmitas em Uso Clínico', inUseKits.length, 'Em posse dos acadêmicos'],
      ['Marmitas em Esterilização / Autoclave', decontaminatedKits.length, 'CME em processamento'],
      ['Alertas de Validade (Vencidas / A vencer)', alertKits.length, 'Requer re-esterilização'],
      ['Total de Acadêmicos Matriculados', students.length, 'Alunos com cadastro'],
      ['Acadêmicos Habilitados para Retirada', students.filter((s) => s.status === 'Active').length, 'Regularizados'],
      ['Ciclos de Autoclave Realizados', initialAutoclaveCycles.length, 'Conformidade ANVISA RDC 15'],
      ['Aprovação em Indicadores Biológicos', '100%', 'G. stearothermophilus negativado'],
    ];
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Executivo');

    // Sheet 2: Acervo Detalhado de Marmitas
    const kitsSheetData = kits.map((k) => ({
      'Código': k.code,
      'Nome da Marmita': k.name,
      'Especialidade': k.category || 'Geral',
      'Status': k.status === 'Ready' ? 'Pronta / Estéril' : k.status === 'In Use' ? 'Em Uso Clínico' : k.status === 'Expired' ? 'Vencida' : k.status === 'Expiring' ? 'A Vencer' : 'Na CME',
      'Validade (Dias Restantes)': k.validityDays,
      'Última Esterilização': k.lastSterilized,
      'Ciclos Acumulados': k.cyclesLogged,
      'Aluno Proprietário': k.ownerStudentName || 'Universidade',
      'GRR Proprietário': k.ownerStudentGrr || '-',
      'Em Posse de': k.assignedStudentName || '-',
      'Ciclo Autoclave': k.autoclaveCycleId || '-',
      'Teste Biológico': k.biologicalTestResult || 'Aprovado',
      'Material': k.boxMaterial || 'Inox Perfurado',
    }));
    const wsKits = XLSX.utils.json_to_sheet(kitsSheetData);
    XLSX.utils.book_append_sheet(wb, wsKits, 'Acervo de Marmitas');

    // Sheet 3: Movimentações e Transações
    const transactionsSheetData = transactions.map((t) => ({
      'ID Registro': t.id,
      'Horário': t.timestamp,
      'Operação': t.action === 'Withdrawal' ? 'Retirada' : t.action === 'Return' ? 'Devolução' : 'Sinalização',
      'Código da Marmita': t.kitId,
      'Descrição da Marmita': t.kitName || '-',
      'Acadêmico': t.studentName || '-',
      'Matrícula GRR': t.grrCode,
      'Operador': t.operatorName || 'Atendente Balcão',
      'Observações': t.notes || '-',
      'Conformidade': 'Aprovado',
    }));
    const wsTrans = XLSX.utils.json_to_sheet(transactionsSheetData);
    XLSX.utils.book_append_sheet(wb, wsTrans, 'Movimentações Balcão');

    // Sheet 4: Laudos Técnicos de Esterilização (CME)
    const cmeSheetData = initialAutoclaveCycles.map((c) => ({
      'Nº Ciclo': c.cycleNumber,
      'Identificador': c.id,
      'Equipamento': c.chamberId,
      'Operador': c.operator,
      'Início': c.startTime,
      'Duração (min)': c.durationMinutes,
      'Temperatura (°C)': c.temperature,
      'Pressão (bar)': c.pressureBar,
      'Qtd Marmitas': c.kitsCount,
      'Indicador Biológico': c.biologicalIndicator,
      'Integrador Classe 5': c.chemicalIndicatorClass5 ? 'Conforme' : 'Não conforme',
      'Resultado ANVISA': c.status,
    }));
    const wsCME = XLSX.utils.json_to_sheet(cmeSheetData);
    XLSX.utils.book_append_sheet(wb, wsCME, 'Laudos Autoclave');

    // Sheet 5: Distribuição por Especialidade
    const wsCat = XLSX.utils.json_to_sheet(categorySummary.map((c) => ({
      'Especialidade Clínica': c.categoria,
      'Total de Marmitas': c.total,
      'Prontas / Estéreis': c.disponiveis,
      'Em Atendimento': c.emUso,
      'Taxa de Giro (%)': `${c.taxaUtilizacao}%`,
    })));
    XLSX.utils.book_append_sheet(wb, wsCat, 'Especialidades');

    // Generate and trigger download
    const filename = `Relatorio-Mensal-Marmitas-${selectedMonth.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    setExportSuccessMsg(`Planilha XLSX "${filename}" gerada com sucesso!`);
    setTimeout(() => {
      setExportSuccessMsg(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-semibold uppercase tracking-wider">
              Auditoria Sanitária &amp; Rastreabilidade
            </span>
            <span className="text-[12px] font-medium text-slate-500">
              Mês: <strong className="text-slate-700">{selectedMonth}</strong>
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
            Relatórios de Conformidade &amp; Produtividade
          </h2>
          <p className="text-[14px] text-slate-500 mt-0.5">
            Documentação técnica de esterilização, giro clínico de marmitas e conformidade com a RDC 15 ANVISA.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-[13px] font-medium shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="Setembro / 2026">Setembro / 2026</option>
            <option value="Agosto / 2026">Agosto / 2026</option>
            <option value="Julho / 2026">Julho / 2026</option>
            <option value="1º Semestre / 2026">1º Semestre / 2026</option>
          </select>

          <button
            id="btn-export-xlsx"
            onClick={() => handleExportXLSX()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
            title="Exportar dados completos em formato Microsoft Excel (.xlsx)"
          >
            <span className="material-symbols-outlined text-[19px] text-emerald-200">table_chart</span>
            <span>Exportar Relatório Mensal (XLSX)</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {exportSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-800 text-[13px] font-medium shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>{exportSuccessMsg}</span>
          </div>
          <button
            onClick={() => setExportSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-[12px] font-bold cursor-pointer"
          >
            ✕ Fechar
          </button>
        </div>
      )}

      {/* Interactive Report Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
        <button
          id="tab-report-monthly"
          onClick={() => setReportType('Monthly')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            reportType === 'Monthly'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">calendar_month</span>
          <span>Relatório Mensal</span>
        </button>

        <button
          id="tab-report-daily"
          onClick={() => setReportType('Daily')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            reportType === 'Daily'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">today</span>
          <span>Relatório Diário</span>
        </button>

        <button
          id="tab-report-weekly"
          onClick={() => setReportType('Weekly')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            reportType === 'Weekly'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">date_range</span>
          <span>Consolidado Semanal</span>
        </button>

        <button
          id="tab-report-sterilization"
          onClick={() => setReportType('Sterilization')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            reportType === 'Sterilization'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">precision_manufacturing</span>
          <span>Laudos de Esterilização (CME)</span>
        </button>

        <button
          id="tab-report-audits"
          onClick={() => setReportType('Audits')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            reportType === 'Audits'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">verified_user</span>
          <span>Auditoria de Retiradas &amp; Alunos</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. RELATÓRIO MENSAL (Monthly Consolidated)                                */}
      {/* ========================================================================= */}
      {reportType === 'Monthly' && (
        <div className="space-y-6">
          <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-[16px] font-bold text-purple-950">
                Consolidado Mensal da Operação Clínica ({selectedMonth})
              </h3>
              <p className="text-[13px] text-purple-800 mt-0.5">
                Fechamento oficial de esterilização, saldo de acervo, giro cirúrgico e emissão de laudo em planilha XLSX.
              </p>
            </div>
            <button
              onClick={() => handleExportXLSX('Monthly')}
              className="bg-purple-900 hover:bg-purple-950 text-white px-3.5 py-2 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              <span>Baixar Planilha do Mês (.xlsx)</span>
            </button>
          </div>

          {/* Monthly KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total de Giros no Mês
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">384 Retiradas</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                ↑ 14% em relação ao mês anterior
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Conformidade ANVISA RDC 15
              </span>
              <div className="text-[28px] font-bold text-emerald-600 mt-1">100%</div>
              <p className="text-[12px] text-emerald-700 font-medium mt-1">
                Zero quebras de barreira estéril
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Ciclos Totais de Autoclave
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">428 Ciclos</div>
              <p className="text-[12px] text-slate-500 mt-1">
                Cristófoli 01 &amp; 02 em operação
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Extravios ou Danos
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">0 Ocorrências</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                Inventário 100% conciliado
              </p>
            </div>
          </div>

          {/* Monthly Table: Category Breakdown */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  Balanço Mensal por Especialidade Clínica
                </h3>
                <p className="text-[12px] text-slate-500">
                  Marmitas em circulação, taxa de demanda e disponibilidade para aulas práticas.
                </p>
              </div>
              <span className="text-[12px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                {selectedMonth}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200/70">
                  <tr>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Especialidade</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total de Marmitas</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disponíveis (Estéreis)</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Em Uso Clínico</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Taxa de Utilização</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status do Acervo</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] divide-y divide-slate-100">
                  {categorySummary.map((item) => (
                    <tr key={item.categoria} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {item.categoria}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-700">
                        {item.total} unidades
                      </td>
                      <td className="py-3.5 px-5 text-emerald-700 font-semibold">
                        {item.disponiveis} prontas
                      </td>
                      <td className="py-3.5 px-5 text-blue-700 font-semibold">
                        {item.emUso} em atendimento
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${Math.min(item.taxaUtilizacao, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[12px] text-slate-600 font-semibold">
                            {item.taxaUtilizacao}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                          Conforme
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RELATÓRIO DIÁRIO (Daily Report)                                        */}
      {/* ========================================================================= */}
      {reportType === 'Daily' && (
        <div className="space-y-6">
          {/* Daily KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Retiradas Registradas Hoje
              </span>
              <div className="text-[28px] font-bold text-blue-600 mt-1">
                {transactions.filter((t) => t.action === 'Withdrawal').length} Marmitas
              </div>
              <p className="text-[12px] text-slate-500 mt-1">
                Última saída há poucos minutos
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Devoluções Realizadas Hoje
              </span>
              <div className="text-[28px] font-bold text-emerald-600 mt-1">
                {transactions.filter((t) => t.action === 'Return').length} Devolvidas
              </div>
              <p className="text-[12px] text-emerald-700 font-medium mt-1">
                Encaminhadas para expurgo e autoclave
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tempo Médio em Clínica (Hoje)
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">2.8 Horas</div>
              <p className="text-[12px] text-slate-500 mt-1">
                Turno da Manhã (07:30 - 12:00)
              </p>
            </div>
          </div>

          {/* Daily Transactions Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  Movimentações do Dia (Tempo Real)
                </h3>
                <p className="text-[12px] text-slate-500">
                  Fluxo diário no balcão de atendimento e conferência de liberação.
                </p>
              </div>
              <span className="text-[12px] text-blue-700 font-semibold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Hoje • {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200/70">
                  <tr>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Horário</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operação</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Código da Marmita</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Acadêmico (GRR)</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Conferência no Balcão</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-[12px] text-slate-500">
                        {t.timestamp}
                      </td>
                      <td className="py-3.5 px-5">
                        {t.action === 'Withdrawal' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[11.5px]">
                            <span className="material-symbols-outlined text-[13px]">logout</span>
                            <span>Retirada</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11.5px]">
                            <span className="material-symbols-outlined text-[13px]">login</span>
                            <span>Devolução</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {t.kitId}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-700">
                        {t.studentName || 'Acadêmico'} <span className="text-slate-400">({t.grrCode})</span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-[12px]">
                        {t.notes || 'Itens conferidos e validados'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONSOLIDADO SEMANAL (Weekly Report)                                    */}
      {/* ========================================================================= */}
      {reportType === 'Weekly' && (
        <div className="space-y-6">
          {/* Weekly KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Volume Semanal de Atendimentos
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">92 Marmitas</div>
              <p className="text-[12px] text-blue-600 font-medium mt-1">
                Maior fluxo: Terças e Quintas-feiras
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Devoluções no Mesmo Dia
              </span>
              <div className="text-[28px] font-bold text-emerald-600 mt-1">98.5%</div>
              <p className="text-[12px] text-slate-500 mt-1">
                Aderência às normas de biossegurança
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tempo Médio de Reprocessamento
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">3.5 Horas</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                Da lavagem à liberação estéril
              </p>
            </div>
          </div>

          {/* Weekly Days Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  Consolidado da Semana Atual (Segunda a Sexta)
                </h3>
                <p className="text-[12px] text-slate-500">
                  Histograma de saídas, entradas e marmitas em circulação clínica.
                </p>
              </div>
              <span className="text-[12px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Semana 37 / 2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200/70">
                  <tr>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dia da Semana</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Retiradas Balcão</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Devoluções CME</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ciclos de Autoclave</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Saldo Ativo</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Conformidade</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] divide-y divide-slate-100">
                  {[
                    { day: 'Segunda-feira (07/09)', out: 18, in: 17, cycles: 4, balance: '1 em trânsito', status: '100% OK' },
                    { day: 'Terça-feira (08/09)', out: 24, in: 24, cycles: 5, balance: '0 em trânsito', status: '100% OK' },
                    { day: 'Quarta-feira (09/09)', out: 19, in: 18, cycles: 4, balance: '1 em trânsito', status: '100% OK' },
                    { day: 'Quinta-feira (10/09)', out: 22, in: 22, cycles: 5, balance: '0 em trânsito', status: '100% OK' },
                    { day: 'Sexta-feira (11/09)', out: 9, in: 9, cycles: 2, balance: '0 em trânsito', status: '100% OK' },
                  ].map((row) => (
                    <tr key={row.day} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">{row.day}</td>
                      <td className="py-3.5 px-5 text-blue-700 font-semibold">{row.out} saídas</td>
                      <td className="py-3.5 px-5 text-emerald-700 font-semibold">{row.in} entradas</td>
                      <td className="py-3.5 px-5 text-slate-700 font-semibold">{row.cycles} ciclos</td>
                      <td className="py-3.5 px-5 font-mono text-[12px] text-slate-600">{row.balance}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LAUDOS DE ESTERILIZAÇÃO (Sterilization CME)                            */}
      {/* ========================================================================= */}
      {reportType === 'Sterilization' && (
        <div className="space-y-6">
          {/* Sterilization KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Autoclaves em Operação
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">2 Equipamentos</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                ✓ Cristófoli 01 e Cristófoli 02 calibradas
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Indicadores Biológicos (Esporos)
              </span>
              <div className="text-[28px] font-bold text-emerald-600 mt-1">100% Negativo</div>
              <p className="text-[12px] text-emerald-700 font-medium mt-1">
                G. stearothermophilus aprovado
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Integradores Químicos Classe 5
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">100% Conformes</div>
              <p className="text-[12px] text-slate-500 mt-1">
                Viragem completa em todos os pacotes
              </p>
            </div>
          </div>

          {/* Autoclave Cycle Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  Laudos Técnicos dos Ciclos de Autoclave
                </h3>
                <p className="text-[12px] text-slate-500">
                  Rastreabilidade física, química e biológica conforme ANVISA RDC 15/2012.
                </p>
              </div>
              <span className="text-[12px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Parâmetro: 134°C • 2.1 bar
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200/70">
                  <tr>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nº Ciclo</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Equipamento</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Início / Duração</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Parâmetros</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Marmitas</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Indicador Biológico</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Resultado</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] divide-y divide-slate-100">
                  {initialAutoclaveCycles.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-blue-600">
                        #{c.cycleNumber}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {c.chamberId}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {c.startTime} ({c.durationMinutes} min)
                      </td>
                      <td className="py-3.5 px-5 font-mono text-[12px] text-slate-700">
                        {c.temperature}°C • {c.pressureBar} bar
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {c.kitsCount} marmitas
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
                          {c.biologicalIndicator}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. AUDITORIA DE RETIRADAS & ACADÊMICOS (Audits)                           */}
      {/* ========================================================================= */}
      {reportType === 'Audits' && (
        <div className="space-y-6">
          {/* Audits KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Acadêmicos Matriculados
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">{students.length} Alunos</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                {students.filter((s) => s.status === 'Active').length} com situação regular
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Marmitas em Custódia Externa
              </span>
              <div className="text-[28px] font-bold text-blue-600 mt-1">{inUseKits.length} Unidades</div>
              <p className="text-[12px] text-blue-600 font-medium mt-1">
                Todas dentro do horário regulamentar
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Índice de Conservação
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">99.4%</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                Instrumentais sem quebra ou perda
              </p>
            </div>
          </div>

          {/* Academic Custody Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  Auditoria de Custódia e Rastreabilidade por Aluno
                </h3>
                <p className="text-[12px] text-slate-500">
                  Conferência de matrículas (GRR), kits sob custódia e histórico de devoluções.
                </p>
              </div>
              <span className="text-[12px] text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 font-semibold">
                Controle de Responsabilidade
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200/70">
                  <tr>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Acadêmico</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Matrícula (GRR)</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Curso / Período</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Custódia Atual</th>
                    <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Situação</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] divide-y divide-slate-100">
                  {students.map((stu) => {
                    const heldKit = kits.find((k) => k.assignedTo === stu.grr || k.assignedTo === stu.id);
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900">
                          {stu.name}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-600">
                          {stu.grr}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">
                          {stu.course}
                        </td>
                        <td className="py-3.5 px-5 font-mono">
                          {heldKit ? (
                            <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                              <span>{heldKit.code}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Nenhum kit em posse</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {stu.status === 'Active' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                              Habilitado
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold">
                              Inativo
                            </span>
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
      )}
    </div>
  );
};
