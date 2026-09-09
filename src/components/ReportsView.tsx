import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Kit, Transaction, Student, AlmoxarifadoShiftReport } from '../types';
import { initialAutoclaveCycles } from '../data/mockData';

interface ReportsViewProps {
  kits: Kit[];
  transactions: Transaction[];
  students: Student[];
  almoxarifadoReports?: AlmoxarifadoShiftReport[];
}

export type ReportType =
  | 'Monthly'
  | 'Daily'
  | 'Weekly'
  | 'Sterilization'
  | 'Audits'
  | 'Almoxarifado';

export const ReportsView: React.FC<ReportsViewProps> = ({
  kits,
  transactions,
  students,
  almoxarifadoReports = [],
}) => {
  // Aba ativa selecionada
  const [reportType, setReportType] = useState<ReportType>('Monthly');

  // Filtros específicos por tipo de relatório
  const [selectedMonth, setSelectedMonth] = useState<string>('Setembro / 2026');
  const [dailyFilterAction, setDailyFilterAction] = useState<'all' | 'Withdrawal' | 'Return'>('all');
  const [dailySearchInput, setDailySearchInput] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<string>('Semana Atual (07/09 a 11/09/2026)');
  const [sterilChamberFilter, setSterilChamberFilter] = useState<'all' | 'Cristófoli 01' | 'Cristófoli 02'>('all');
  const [auditFilterStatus, setAuditFilterStatus] = useState<'all' | 'in_possession' | 'available'>('all');
  const [auditSearchInput, setAuditSearchInput] = useState<string>('');
  const [almoxarifadoShiftFilter, setAlmoxarifadoShiftFilter] = useState<string>('all');

  // Feedback de exportação XLSX
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Métricas Computadas Globais
  const readyKits = kits.filter((k) => k.status === 'Ready');
  const inUseKits = kits.filter((k) => k.status === 'In Use');
  const alertKits = kits.filter((k) => k.status === 'Expiring' || k.status === 'Expired');
  const decontaminatedKits = kits.filter((k) => k.status === 'Decontaminated');

  // Distribuição por Especialidade
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

  // Filtragem Reativa do Relatório Diário
  const filteredDailyTransactions = transactions.filter((tx) => {
    if (dailyFilterAction !== 'all' && tx.action !== dailyFilterAction) {
      return false;
    }
    if (dailySearchInput.trim()) {
      const q = dailySearchInput.toLowerCase();
      const matchGrr = tx.grrCode?.toLowerCase().includes(q);
      const matchName = tx.studentName?.toLowerCase().includes(q);
      const matchKit = tx.kitId?.toLowerCase().includes(q);
      if (!matchGrr && !matchName && !matchKit) return false;
    }
    return true;
  });

  // Filtragem Reativa de Laudos de Esterilização
  const filteredAutoclaveCycles = initialAutoclaveCycles.filter((c) => {
    if (sterilChamberFilter !== 'all' && c.chamberId !== sterilChamberFilter) {
      return false;
    }
    return true;
  });

  // Filtragem Reativa da Auditoria de Alunos
  const filteredStudents = students.filter((s) => {
    const hasKit = kits.some((k) => k.assignedTo === s.grr || k.assignedTo === s.id);
    if (auditFilterStatus === 'in_possession' && !hasKit) return false;
    if (auditFilterStatus === 'available' && hasKit) return false;

    if (auditSearchInput.trim()) {
      const q = auditSearchInput.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchGrr = s.grr.toLowerCase().includes(q);
      if (!matchName && !matchGrr) return false;
    }
    return true;
  });

  // Filtragem Reativa do Levantamento do Almoxarifado
  const filteredAlmoxarifadoReports = almoxarifadoReports.filter((rep) => {
    if (almoxarifadoShiftFilter !== 'all' && !rep.shift.includes(almoxarifadoShiftFilter)) {
      return false;
    }
    return true;
  });

  // =========================================================================
  // EXPORTADOR REAL DE EXCEL (.XLSX)
  // =========================================================================
  const handleExportXLSX = (specificType?: ReportType) => {
    const currentType = specificType || reportType;
    const wb = XLSX.utils.book_new();
    const currentDateStr = new Date().toLocaleDateString('pt-BR');

    // Sheet 1: Resumo Executivo
    const resumoData = [
      ['RELATÓRIO DE GESTÃO E CONFORMIDADE SANITÁRIA - ODONTOLOGIA'],
      ['Tipo de Relatório:', currentType === 'Monthly' ? 'Consolidado Mensal' : currentType === 'Daily' ? 'Diário Balcão' : currentType === 'Weekly' ? 'Semanal' : currentType === 'Sterilization' ? 'Laudos de Esterilização' : currentType === 'Almoxarifado' ? 'Levantamento Almoxarifado' : 'Auditoria'],
      ['Período Referência:', currentType === 'Monthly' ? selectedMonth : currentDateStr],
      ['Data de Emissão:', currentDateStr],
      ['Emitido por:', 'Sistema LabControl - Coordenação e Gestão de Odontologia'],
      [],
      ['INDICADORES GERAIS DO ACERVO DE MARMITAS'],
      ['Métrica', 'Valor', 'Observação'],
      ['Total de Marmitas Cadastradas', kits.length, 'Acervo patrimonial ativo'],
      ['Marmitas Prontas (Estéreis)', readyKits.length, 'Disponíveis no balcão'],
      ['Marmitas em Uso Clínico', inUseKits.length, 'Em posse dos acadêmicos'],
      ['Marmitas em Esterilização', decontaminatedKits.length, 'Setor de esterilização em processamento'],
      ['Alertas de Validade (Vencidas / A vencer)', alertKits.length, 'Requer re-esterilização'],
      ['Total de Acadêmicos Matriculados', students.length, 'Alunos no sistema'],
      ['Acadêmicos Habilitados para Retirada', students.filter((s) => s.status === 'Active').length, 'Regularizados'],
      ['Ciclos de Esterilização Registrados', initialAutoclaveCycles.length, 'Conformidade ANVISA RDC 15'],
      ['Aprovação em Indicadores Biológicos', '100%', 'G. stearothermophilus negativado'],
      ['Boletins do Almoxarifado Registrados', almoxarifadoReports.length, 'Levantamentos operacionais enviados'],
    ];
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Executivo');

    // Sheet 2: Acervo Detalhado de Marmitas
    const kitsSheetData = kits.map((k) => ({
      'Código da Marmita': k.code,
      'Identificação': k.name,
      'Especialidade': k.category || 'Geral',
      'Status': k.status === 'Ready' ? 'Pronta / Estéril' : k.status === 'In Use' ? 'Em Uso Clínico' : k.status === 'Expired' ? 'Vencida' : k.status === 'Expiring' ? 'A Vencer' : 'Em Esterilização',
      'Validade (Dias Restantes)': k.validityDays,
      'Última Esterilização': k.lastSterilized,
      'Ciclos Acumulados': k.cyclesLogged,
      'Aluno Proprietário': k.ownerStudentName || 'Universidade',
      'GRR Proprietário': k.ownerStudentGrr || '-',
      'Em Posse de': k.assignedStudentName || '-',
      'Ciclo Esterilização': k.autoclaveCycleId || '-',
      'Teste Biológico': k.biologicalTestResult || 'Aprovado',
      'Tipo de Recipiente': k.boxMaterial || 'Caixa Inox Perfurada',
    }));
    const wsKits = XLSX.utils.json_to_sheet(kitsSheetData);
    XLSX.utils.book_append_sheet(wb, wsKits, 'Acervo de Marmitas');

    // Sheet 3: Movimentações do Balcão
    const transactionsSheetData = transactions.map((t) => ({
      'ID Registro': t.id,
      'Horário': t.timestamp,
      'Operação': t.action === 'Withdrawal' ? 'Retirada Liberada' : t.action === 'Return' ? 'Devolução Recebida' : 'Sinalização',
      'Código da Marmita': t.kitId,
      'Identificação da Marmita': t.kitName || '-',
      'Acadêmico': t.studentName || '-',
      'Matrícula (GRR)': t.grrCode,
      'Atendente Balcão': t.operatorName || 'Atendente Almoxarifado',
      'Observação / Conferência': t.notes || 'Identificação e lacre conferidos',
    }));
    const wsTrans = XLSX.utils.json_to_sheet(transactionsSheetData);
    XLSX.utils.book_append_sheet(wb, wsTrans, 'Movimentacoes Balcao');

    // Sheet 4: Laudos Técnicos de Esterilização
    const cmeSheetData = initialAutoclaveCycles.map((c) => ({
      'Nº Ciclo': c.cycleNumber,
      'Equipamento': c.chamberId,
      'Operador Responsável': c.operator,
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
    XLSX.utils.book_append_sheet(wb, wsCME, 'Laudos Esterilizacao');

    // Sheet 5: Levantamentos Enviados pelo Almoxarifado
    if (almoxarifadoReports.length > 0) {
      const almoxSheetData = almoxarifadoReports.map((rep) => ({
        'ID Boletim': rep.id,
        'Data': rep.date,
        'Turno': rep.shift,
        'Atendente': rep.attendantName,
        'Retiradas': rep.totalWithdrawals,
        'Devoluções': rep.totalReturns,
        'Marmitas com Atraso': rep.overdueRetentions?.length || 0,
        'Avarias Reportadas': rep.damagesReported?.length || 0,
        'Grau Cirúrgico Gasto': rep.suppliesConsumed?.surgicalGradePouches || 0,
        'Integradores Classe 5': rep.suppliesConsumed?.chemicalIndicatorClass5Strips || 0,
        'Fita Zebrada (m)': rep.suppliesConsumed?.autoclaveTapeMeters || 0,
        'Ampolas Biológicas': rep.suppliesConsumed?.biologicalIndicatorAmpoules || 0,
        'Parecer p/ Admin': rep.notesForAdmin || 'Sem intercorrências',
      }));
      const wsAlmox = XLSX.utils.json_to_sheet(almoxSheetData);
      XLSX.utils.book_append_sheet(wb, wsAlmox, 'Boletins Almoxarifado');
    }

    // Sheet 6: Especialidades e Giro
    const wsCat = XLSX.utils.json_to_sheet(
      categorySummary.map((c) => ({
        'Especialidade Clínica': c.categoria,
        'Total de Marmitas': c.total,
        'Prontas / Estéreis': c.disponiveis,
        'Em Atendimento': c.emUso,
        'Taxa de Giro (%)': `${c.taxaUtilizacao}%`,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsCat, 'Especialidades');

    // Nome descritivo do arquivo XLSX
    const prefix =
      currentType === 'Monthly'
        ? `Relatorio-Mensal-Marmitas-${selectedMonth.replace(/[^a-zA-Z0-9]/g, '-')}`
        : currentType === 'Daily'
        ? `Relatorio-Diario-Balcao`
        : currentType === 'Weekly'
        ? `Relatorio-Semanal-Operacao`
        : currentType === 'Sterilization'
        ? `Laudos-Esterilizacao`
        : currentType === 'Almoxarifado'
        ? `Levantamento-Almoxarifado-Plantao`
        : `Auditoria-Acervo-Custodia`;

    const filename = `${prefix}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    setExportSuccessMsg(`Planilha Microsoft Excel (.xlsx) baixada com sucesso: "${filename}"`);
    setTimeout(() => {
      setExportSuccessMsg(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* CABEÇALHO DINÂMICO & SELETORES DO RELATÓRIO ATIVO                        */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              reportType === 'Monthly'
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : reportType === 'Daily'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : reportType === 'Weekly'
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                : reportType === 'Sterilization'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : reportType === 'Almoxarifado'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              {reportType === 'Monthly' && 'Consolidado Mensal Oficial'}
              {reportType === 'Daily' && 'Balanço Diário em Tempo Real'}
              {reportType === 'Weekly' && 'Consolidado Semanal de Clínicas'}
              {reportType === 'Sterilization' && 'Laudos Técnicos (RDC 15 ANVISA)'}
              {reportType === 'Almoxarifado' && 'Levantamento Operacional do Almoxarifado'}
              {reportType === 'Audits' && 'Auditoria de Custódia & Responsabilidade'}
            </span>
            <span className="text-[12px] font-medium text-slate-500">
              {reportType === 'Monthly' && `Mês Referência: ${selectedMonth}`}
              {reportType === 'Daily' && `Data: ${new Date().toLocaleDateString('pt-BR')}`}
              {reportType === 'Weekly' && selectedWeek}
              {reportType === 'Sterilization' && 'Máquinas de Esterilização 01 & 02'}
              {reportType === 'Almoxarifado' && `${almoxarifadoReports.length} boletins registrados`}
              {reportType === 'Audits' && `${students.length} acadêmicos monitorados`}
            </span>
          </div>

          <h2 className="text-[22px] md:text-[26px] font-bold text-slate-900 tracking-tight">
            {reportType === 'Monthly' && 'Relatório Mensal de Gestão & Conformidade'}
            {reportType === 'Daily' && 'Relatório Diário do Terminal de Atendimento'}
            {reportType === 'Weekly' && 'Relatório Semanal de Giro & Produtividade'}
            {reportType === 'Sterilization' && 'Laudos Técnicos do Setor de Esterilização'}
            {reportType === 'Almoxarifado' && 'Levantamento e Boletins do Almoxarifado'}
            {reportType === 'Audits' && 'Auditoria de Custódia e Alunos em Clínica'}
          </h2>

          <p className="text-[13.5px] text-slate-500 mt-0.5 max-w-2xl">
            {reportType === 'Monthly' && 'Consolidação mensal com gráficos de giro, taxas de esterilização e exportação direta em planilha XLSX.'}
            {reportType === 'Daily' && 'Movimentações registradas no balcão hoje: saídas liberadas, devoluções recebidas e conformidade.'}
            {reportType === 'Weekly' && 'Distribuição semanal por turnos, taxa de retorno no mesmo dia e balanço cirúrgico.'}
            {reportType === 'Sterilization' && 'Rastreabilidade de ciclos de esterilização, testes com esporos biológicos e indicadores químicos.'}
            {reportType === 'Almoxarifado' && 'Dados fornecidos pelo atendente: avarias de caixas, retenções em atraso e consumo de insumos.'}
            {reportType === 'Audits' && 'Controle acadêmico por matrícula (GRR), localização das marmitas e situação regular.'}
          </p>
        </div>

        {/* Controles Dinâmicos do Topo + Botão XLSX */}
        <div className="flex items-center gap-2 flex-wrap">
          {reportType === 'Monthly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2 rounded-xl text-[13px] font-semibold cursor-pointer focus:bg-white focus:border-purple-500 focus:outline-hidden"
            >
              <option value="Setembro / 2026">Setembro / 2026</option>
              <option value="Agosto / 2026">Agosto / 2026</option>
              <option value="Julho / 2026">Julho / 2026</option>
              <option value="1º Semestre / 2026">1º Semestre / 2026</option>
            </select>
          )}

          {reportType === 'Weekly' && (
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2 rounded-xl text-[13px] font-semibold cursor-pointer focus:bg-white focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="Semana Atual (07/09 a 11/09/2026)">Semana Atual (07/09 a 11/09)</option>
              <option value="Semana 36 (31/08 a 04/09/2026)">Semana 36 (31/08 a 04/09)</option>
              <option value="Semana 35 (24/08 a 28/08/2026)">Semana 35 (24/08 a 28/08)</option>
            </select>
          )}

          {reportType === 'Sterilization' && (
            <select
              value={sterilChamberFilter}
              onChange={(e) => setSterilChamberFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2 rounded-xl text-[13px] font-semibold cursor-pointer focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="all">Todas as Máquinas de Esterilização</option>
              <option value="Cristófoli 01">Máquina 01 (Cristófoli A)</option>
              <option value="Cristófoli 02">Máquina 02 (Cristófoli B)</option>
            </select>
          )}

          {reportType === 'Almoxarifado' && (
            <select
              value={almoxarifadoShiftFilter}
              onChange={(e) => setAlmoxarifadoShiftFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2 rounded-xl text-[13px] font-semibold cursor-pointer focus:bg-white focus:border-amber-500 focus:outline-hidden"
            >
              <option value="all">Todos os Turnos</option>
              <option value="Manhã">Turno Manhã</option>
              <option value="Tarde">Turno Tarde</option>
              <option value="Noite">Turno Noite</option>
            </select>
          )}

          <button
            id="btn-export-xlsx"
            onClick={() => handleExportXLSX()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
            title="Exportar dados oficiais no formato Microsoft Excel (.xlsx)"
          >
            <span className="material-symbols-outlined text-[19px] text-emerald-200">table_chart</span>
            <span>Exportar Relatório em XLSX</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo de Download Sucesso */}
      {exportSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-[13px] font-medium shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
            <span>{exportSuccessMsg}</span>
          </div>
          <button
            onClick={() => setExportSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-[12px] px-2 py-1 rounded cursor-pointer"
          >
            ✕ Fechar
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SELETOR INTERATIVO DE TIPOS DE RELATÓRIO (ABAS CLARAS E DIFERENCIADAS)   */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/90 pb-3">
        <button
          id="tab-report-monthly"
          onClick={() => setReportType('Monthly')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            reportType === 'Monthly'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          <span>1. Relatório Mensal</span>
        </button>

        <button
          id="tab-report-daily"
          onClick={() => setReportType('Daily')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            reportType === 'Daily'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">today</span>
          <span>2. Relatório Diário</span>
          <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
            reportType === 'Daily' ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'
          }`}>
            {transactions.length}
          </span>
        </button>

        <button
          id="tab-report-weekly"
          onClick={() => setReportType('Weekly')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            reportType === 'Weekly'
              ? 'bg-indigo-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">date_range</span>
          <span>3. Consolidado Semanal</span>
        </button>

        <button
          id="tab-report-sterilization"
          onClick={() => setReportType('Sterilization')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            reportType === 'Sterilization'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
          <span>4. Laudos de Esterilização</span>
        </button>

        <button
          id="tab-report-audits"
          onClick={() => setReportType('Audits')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            reportType === 'Audits'
              ? 'bg-rose-900 text-white shadow-xs'
              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>5. Auditoria de Acadêmicos</span>
          <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
            reportType === 'Audits' ? 'bg-rose-800 text-rose-100' : 'bg-rose-100 text-rose-800'
          }`}>
            {inUseKits.length} em posse
          </span>
        </button>

        <button
          id="tab-report-almoxarifado"
          onClick={() => setReportType('Almoxarifado')}
          className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            reportType === 'Almoxarifado'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'border border-amber-300 text-amber-900 bg-amber-50/50 hover:bg-amber-100/60'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
          <span>6. Levantamento do Almoxarifado</span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
            reportType === 'Almoxarifado' ? 'bg-amber-950 text-amber-200' : 'bg-amber-200 text-amber-900'
          }`}>
            {almoxarifadoReports.length} Boletins
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. RELATÓRIO MENSAL (Monthly Consolidated)                                */}
      {/* ========================================================================= */}
      {reportType === 'Monthly' && (
        <div className="space-y-6">
          <div className="p-5 bg-purple-50 border border-purple-200/90 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-[17px] font-bold text-purple-950">
                Consolidado Oficial da Gestão Mensal ({selectedMonth})
              </h3>
              <p className="text-[13px] text-purple-900 mt-0.5">
                Balanço de esterilização, giro do acervo de marmitas e emissão direta da planilha XLSX para a Coordenação.
              </p>
            </div>
            <button
              onClick={() => handleExportXLSX('Monthly')}
              className="bg-purple-900 hover:bg-purple-950 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Baixar Planilha Mensal (.xlsx)</span>
            </button>
          </div>

          {/* Monthly KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total de Giros no Mês
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">384 Retiradas</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                ↑ 14% em relação ao mês anterior
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Conformidade ANVISA RDC 15
              </span>
              <div className="text-[28px] font-bold text-emerald-600 mt-1">100%</div>
              <p className="text-[12px] text-emerald-700 font-medium mt-1">
                Zero quebras de barreira estéril
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Ciclos Totais de Esterilização
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">428 Ciclos</div>
              <p className="text-[12px] text-slate-500 mt-1">
                Máquinas 01 &amp; 02 em operação
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Extravios ou Danos
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">0 Ocorrências</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                Inventário 100% conciliado
              </p>
            </div>
          </div>

          {/* Tabela de Especialidades */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
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
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-5">Especialidade</th>
                    <th className="py-3 px-5">Total de Marmitas</th>
                    <th className="py-3 px-5">Disponíveis (Estéreis)</th>
                    <th className="py-3 px-5">Em Uso Clínico</th>
                    <th className="py-3 px-5">Taxa de Utilização</th>
                    <th className="py-3 px-5">Status do Acervo</th>
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
          {/* Barra de Filtros Reativos do Dia */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-bold text-slate-500 uppercase">Filtrar Operação:</span>
              <button
                onClick={() => setDailyFilterAction('all')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                  dailyFilterAction === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todas ({transactions.length})
              </button>
              <button
                onClick={() => setDailyFilterAction('Withdrawal')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                  dailyFilterAction === 'Withdrawal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Apenas Retiradas ({transactions.filter((t) => t.action === 'Withdrawal').length})
              </button>
              <button
                onClick={() => setDailyFilterAction('Return')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                  dailyFilterAction === 'Return'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Apenas Devoluções ({transactions.filter((t) => t.action === 'Return').length})
              </button>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={dailySearchInput}
                onChange={(e) => setDailySearchInput(e.target.value)}
                placeholder="Buscar por GRR, Nome ou Marmita..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12.5px] text-slate-800 focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Daily KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Retiradas Registradas Hoje
              </span>
              <div className="text-[28px] font-bold text-blue-600 mt-1">
                {transactions.filter((t) => t.action === 'Withdrawal').length} Marmitas
              </div>
              <p className="text-[12px] text-slate-500 mt-1">
                Liberadas com identificação de acadêmico
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Devoluções Realizadas Hoje
              </span>
              <div className="text-[28px] font-bold text-emerald-600 mt-1">
                {transactions.filter((t) => t.action === 'Return').length} Devolvidas
              </div>
              <p className="text-[12px] text-emerald-700 font-medium mt-1">
                Encaminhadas para expurgo e esterilização
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tempo Médio em Clínica (Hoje)
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">2.8 Horas</div>
              <p className="text-[12px] text-slate-500 mt-1">
                Turno da Manhã e Tarde
              </p>
            </div>
          </div>

          {/* Tabela Diária de Movimentações */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  Movimentações do Dia ({filteredDailyTransactions.length} exibidas)
                </h3>
                <p className="text-[12px] text-slate-500">
                  Fluxo diário no balcão de atendimento e conferência de liberação.
                </p>
              </div>
              <span className="text-[12px] text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Hoje • {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-5">Horário</th>
                    <th className="py-3 px-5">Operação</th>
                    <th className="py-3 px-5">Código da Marmita</th>
                    <th className="py-3 px-5">Acadêmico (GRR)</th>
                    <th className="py-3 px-5">Conferência no Balcão</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] divide-y divide-slate-100">
                  {filteredDailyTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-[12px] text-slate-500">
                        {t.timestamp}
                      </td>
                      <td className="py-3.5 px-5">
                        {t.action === 'Withdrawal' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md text-[11.5px] border border-blue-200">
                            <span className="material-symbols-outlined text-[14px]">logout</span>
                            <span>Retirada</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md text-[11.5px] border border-emerald-200">
                            <span className="material-symbols-outlined text-[14px]">login</span>
                            <span>Devolução</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {t.kitId}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-700">
                        {t.studentName || 'Acadêmico'} <span className="text-slate-400 font-mono">({t.grrCode})</span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-[12px]">
                        {t.notes || 'Identificação e lacre conferidos'}
                      </td>
                    </tr>
                  ))}
                  {filteredDailyTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        Nenhuma movimentação encontrada com o filtro selecionado.
                      </td>
                    </tr>
                  )}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Volume Semanal de Atendimentos
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">92 Marmitas</div>
              <p className="text-[12px] text-blue-600 font-medium mt-1">
                Maior fluxo: Terças e Quintas-feiras
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Devoluções no Mesmo Dia
              </span>
              <div className="text-[28px] font-bold text-emerald-600 mt-1">98.5%</div>
              <p className="text-[12px] text-slate-500 mt-1">
                Aderência às normas de biossegurança
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tempo Médio de Reprocessamento
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">3.5 Horas</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                Da lavagem à liberação estéril
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  Consolidado da Semana (Segunda a Sexta-feira)
                </h3>
                <p className="text-[12px] text-slate-500">
                  Histograma de saídas, entradas e marmitas em circulação clínica.
                </p>
              </div>
              <span className="text-[12px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                {selectedWeek}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-5">Dia da Semana</th>
                    <th className="py-3 px-5">Retiradas Balcão</th>
                    <th className="py-3 px-5">Devoluções p/ Esterilização</th>
                    <th className="py-3 px-5">Ciclos de Esterilização</th>
                    <th className="py-3 px-5">Saldo Ativo</th>
                    <th className="py-3 px-5">Conformidade</th>
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
      {/* 4. LAUDOS DE ESTERILIZAÇÃO                                                */}
      {/* ========================================================================= */}
      {reportType === 'Sterilization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Máquinas de Esterilização em Operação
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">2 Equipamentos</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                ✓ Máquinas 01 e 02 calibradas
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Indicadores Biológicos (Esporos)
              </span>
              <div className="text-[28px] font-bold text-emerald-600 mt-1">100% Negativo</div>
              <p className="text-[12px] text-emerald-700 font-medium mt-1">
                G. stearothermophilus aprovado
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Integradores Químicos Classe 5
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">100% Conformes</div>
              <p className="text-[12px] text-slate-500 mt-1">
                Viragem completa em todos os pacotes
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  Laudos Técnicos dos Ciclos de Esterilização ({filteredAutoclaveCycles.length} ciclos)
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
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-5">Nº Ciclo</th>
                    <th className="py-3 px-5">Equipamento</th>
                    <th className="py-3 px-5">Início / Duração</th>
                    <th className="py-3 px-5">Parâmetros</th>
                    <th className="py-3 px-5">Marmitas</th>
                    <th className="py-3 px-5">Indicador Biológico</th>
                    <th className="py-3 px-5">Resultado</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] divide-y divide-slate-100">
                  {filteredAutoclaveCycles.map((c) => (
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
          {/* Barra de Filtros Reativos da Auditoria */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-bold text-slate-500 uppercase">Filtrar Custódia:</span>
              <button
                onClick={() => setAuditFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                  auditFilterStatus === 'all'
                    ? 'bg-rose-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todos os Alunos ({students.length})
              </button>
              <button
                onClick={() => setAuditFilterStatus('in_possession')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                  auditFilterStatus === 'in_possession'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Com Marmita em Posse ({inUseKits.length})
              </button>
              <button
                onClick={() => setAuditFilterStatus('available')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors ${
                  auditFilterStatus === 'available'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Sem Marmita em Aberto
              </button>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={auditSearchInput}
                onChange={(e) => setAuditSearchInput(e.target.value)}
                placeholder="Buscar por Aluno ou GRR..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12.5px] text-slate-800 focus:bg-white focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Acadêmicos Matriculados
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">{students.length} Alunos</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                {students.filter((s) => s.status === 'Active').length} com situação regular
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Marmitas em Custódia Externa
              </span>
              <div className="text-[28px] font-bold text-blue-600 mt-1">{inUseKits.length} Unidades</div>
              <p className="text-[12px] text-blue-600 font-medium mt-1">
                Todas rastreadas por matrícula
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Índice de Conformidade
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">100%</div>
              <p className="text-[12px] text-emerald-600 font-medium mt-1">
                Registro de saídas e devoluções ativo
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">
                  Auditoria de Custódia e Rastreabilidade por Aluno ({filteredStudents.length} listados)
                </h3>
                <p className="text-[12px] text-slate-500">
                  Conferência de matrículas (GRR), marmitas em posse e status do acadêmico.
                </p>
              </div>
              <span className="text-[12px] text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 font-semibold">
                Controle Patrimonial
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-5">Acadêmico</th>
                    <th className="py-3 px-5">Matrícula (GRR)</th>
                    <th className="py-3 px-5">Curso / Período</th>
                    <th className="py-3 px-5">Custódia Atual</th>
                    <th className="py-3 px-5">Situação</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] divide-y divide-slate-100">
                  {filteredStudents.map((stu) => {
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
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        Nenhum aluno encontrado para os critérios de busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. LEVANTAMENTO DO ALMOXARIFADO (Almoxarifado Reports)                     */}
      {/* ========================================================================= */}
      {reportType === 'Almoxarifado' && (
        <div className="space-y-6">
          <div className="p-5 bg-amber-50 border border-amber-200/90 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold uppercase">
                  Canal Balcão → Administração
                </span>
              </div>
              <h3 className="text-[17px] font-bold text-amber-950">
                Levantamento e Boletins Operacionais do Almoxarifado
              </h3>
              <p className="text-[13px] text-amber-900 mt-0.5">
                Consolidação dos dados que o usuário do almoxarifado fornece ao administrador: avarias identificadas nas marmitas, retenções em atraso, consumo de insumos na esterilização e parecer de turno.
              </p>
            </div>

            <button
              onClick={() => handleExportXLSX('Almoxarifado')}
              className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Exportar Boletins (.xlsx)</span>
            </button>
          </div>

          {/* KPIs do Almoxarifado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Boletins Registrados
              </span>
              <div className="text-[28px] font-bold text-slate-900 mt-1">
                {almoxarifadoReports.length} Fechamentos
              </div>
              <p className="text-[12px] text-slate-500 mt-1">Turnos auditados</p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Avarias Totais Reportadas
              </span>
              <div className="text-[28px] font-bold text-rose-600 mt-1">
                {almoxarifadoReports.reduce((acc, r) => acc + (r.damagesReported?.length || 0), 0)} Itens
              </div>
              <p className="text-[12px] text-rose-700 mt-1">Travas, amassados e lacres</p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Marmitas com Atraso
              </span>
              <div className="text-[28px] font-bold text-amber-600 mt-1">
                {almoxarifadoReports.reduce((acc, r) => acc + (r.overdueRetentions?.length || 0), 0)} Casos
              </div>
              <p className="text-[12px] text-amber-700 mt-1">Cobrança automática ativa</p>
            </div>

            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Insumos Gastos no Mês
              </span>
              <div className="text-[28px] font-bold text-purple-600 mt-1">
                {almoxarifadoReports.reduce((acc, r) => acc + (r.suppliesConsumed?.surgicalGradePouches || 0), 0)} Envelopes
              </div>
              <p className="text-[12px] text-slate-500 mt-1">Grau cirúrgico e integradores</p>
            </div>
          </div>

          {/* Lista Detalhada dos Boletins do Almoxarifado */}
          <div className="space-y-4">
            {filteredAlmoxarifadoReports.map((rep) => (
              <div key={rep.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[12px]">
                      {rep.shift}
                    </span>
                    <h4 className="text-[15px] font-bold text-slate-900">
                      Boletim de {rep.date}
                    </h4>
                    <span className="text-slate-400">•</span>
                    <span className="text-[12.5px] text-slate-600">
                      Atendente: <strong>{rep.attendantName}</strong>
                    </span>
                  </div>

                  <span className="font-mono text-[11.5px] text-slate-400">ID: {rep.id}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12.5px]">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block text-[11px]">Retiradas</span>
                    <span className="text-[16px] font-bold text-slate-900">{rep.totalWithdrawals}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block text-[11px]">Devoluções</span>
                    <span className="text-[16px] font-bold text-slate-900">{rep.totalReturns}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block text-[11px]">Avarias em Marmitas</span>
                    <span className="text-[16px] font-bold text-rose-600">{rep.damagesReported.length}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block text-[11px]">Insumos Consumidos</span>
                    <span className="text-[16px] font-bold text-purple-600">
                      {rep.suppliesConsumed?.surgicalGradePouches || 0} env. / {rep.suppliesConsumed?.chemicalIndicatorClass5Strips || 0} fitas
                    </span>
                  </div>
                </div>

                {/* Detalhe de Avarias */}
                {rep.damagesReported.length > 0 && (
                  <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                    <span className="text-[11.5px] font-bold text-rose-900 uppercase block">
                      Avarias Físicas Reportadas ao Administrador:
                    </span>
                    <div className="space-y-1 text-[12.5px]">
                      {rep.damagesReported.map((dmg) => (
                        <div key={dmg.id} className="flex items-center justify-between gap-3 text-slate-800">
                          <div>
                            <span className="font-mono font-bold text-slate-900">{dmg.kitCode}</span>
                            <span className="text-slate-400"> - </span>
                            <span className="font-semibold text-rose-900">{dmg.type}</span>: {dmg.description} (Aluno: {dmg.studentName})
                          </div>
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10.5px]">
                            {dmg.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parecer para o Admin */}
                {rep.notesForAdmin && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px]">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-0.5">
                      Parecer do Atendente para a Administração:
                    </span>
                    <p className="text-slate-700 italic">"{rep.notesForAdmin}"</p>
                  </div>
                )}
              </div>
            ))}

            {filteredAlmoxarifadoReports.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
                <span className="material-symbols-outlined text-[36px] text-slate-400 mb-2">inbox</span>
                <h4 className="text-[15px] font-bold text-slate-800">
                  Nenhum boletim encontrado
                </h4>
                <p className="text-[12.5px] text-slate-500 mt-1">
                  O atendente do almoxarifado pode submeter novos boletins diretamente na aba "Almoxarifado".
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
