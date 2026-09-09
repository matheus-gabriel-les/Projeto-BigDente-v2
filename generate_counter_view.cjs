const fs = require('fs');

const content = fs.readFileSync('src/components/ReceptionCounterView.tsx', 'utf-8');

// Find the boundaries
const startStr = "{activeTab === 'counter' && (";
const endStr = "{activeTab === 'shift_report' && (";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries.");
  process.exit(1);
}

// Ensure we get the correct closing tags. The end string is preceded by:
//     </div>
//   )}
// 
//       {/* ========================================================================= */}
//       {/* MODO 2: BOLETIM DE TURNO & LEVANTAMENTO PARA O ADMINISTRADOR              */}
//       {/* ========================================================================= */}
// 
const beforeEndStr = content.substring(0, endIndex);
const lastClosingBraceIndex = beforeEndStr.lastIndexOf("  )}");
if (lastClosingBraceIndex === -1) {
    console.log("Could not find closing brace.");
    process.exit(1);
}

const replacementCode = `
      {activeTab === 'counter' && (
        <div className="space-y-6">
          {/* LEITOR DE QR CODE / FILTRO DE ALUNO */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <label className="text-[13px] font-bold text-slate-800 flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[20px] text-blue-600">qr_code_scanner</span>
              Leitor de QR Code / Filtrar por Aluno
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Posicione o cursor no campo abaixo e bipe o QR Code do aluno, ou digite o GRR manualmente e pressione Enter.
            </p>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">qr_code</span>
              <input
                type="text"
                autoFocus
                placeholder="Ex: ALUNO:20230192 ou 20230192"
                value={qrScanInput}
                onChange={(e) => setQrScanInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleProcessQrScan(qrScanInput);
                    setQrScanInput('');
                  }
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-[14px] font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            {selectedStudentGrr && (
               <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[12px]">
                     {students.find(s => s.grr === selectedStudentGrr)?.name?.charAt(0) || 'A'}
                   </div>
                   <div>
                     <p className="text-[12px] font-bold text-blue-900">
                       Exibindo apenas kits de: {students.find(s => s.grr === selectedStudentGrr)?.name || selectedStudentGrr}
                     </p>
                     <p className="text-[11px] text-blue-700 font-medium">
                       GRR: {selectedStudentGrr} • Senha: {students.find(s => s.grr === selectedStudentGrr)?.numericPassword?.toString().padStart(3, '0') || '---'}
                     </p>
                   </div>
                 </div>
                 <button onClick={() => setSelectedStudentGrr('')} className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 rounded-lg text-[11px] font-bold hover:bg-rose-50 transition-colors cursor-pointer">
                   Limpar Filtro
                 </button>
               </div>
            )}
          </div>

          {/* PAINEL 1: AGUARDANDO LIBERAÇÃO NO BALCÃO */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-[20px] text-amber-400">notifications_active</span>
                <h3 className="text-[15px] font-bold">Solicitações Recebidas (Aguardando Liberação para CME)</h3>
              </div>
              <span className="bg-slate-800 text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {globalPendingReleaseKits.filter(k => !selectedStudentGrr || k.ownerStudentGrr === selectedStudentGrr || k.assignedTo === selectedStudentGrr).length} Pendente(s)
              </span>
            </div>

            {globalPendingReleaseKits.filter(k => !selectedStudentGrr || k.ownerStudentGrr === selectedStudentGrr || k.assignedTo === selectedStudentGrr).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {globalPendingReleaseKits.filter(k => !selectedStudentGrr || k.ownerStudentGrr === selectedStudentGrr || k.assignedTo === selectedStudentGrr).map(kit => {
                  const student = students.find(s => s.grr === kit.ownerStudentGrr || s.grr === kit.assignedTo);
                  const studentName = student?.name || kit.ownerStudentName || 'Aluno Não Encontrado';
                  const studentPin = student?.numericPassword?.toString().padStart(3, '0') || '---';

                  return (
                    <div key={kit.id} className="bg-slate-800 rounded-xl p-3.5 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[12px] font-bold text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">
                          {kit.code}
                        </span>
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          Aguardando
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-400 font-medium">Aluno:</span>
                          <span className="text-white font-bold truncate max-w-[150px]" title={studentName}>{studentName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-400 font-medium">GRR:</span>
                          <span className="text-slate-200 font-mono">{kit.ownerStudentGrr || kit.assignedTo}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-400 font-medium">Senha:</span>
                          <span className="text-amber-400 font-mono font-bold bg-amber-400/10 px-1.5 rounded">{studentPin}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11.5px] text-slate-300 font-medium">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">lunch_dining</span>
                            <span>{kit.marmitasCount || 0} marmita(s)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">inventory</span>
                            <span>{kit.pacotesCount || 0} pacote(s)</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onUpdateKitStatus) {
                                onUpdateKitStatus(kit.id, 'Decontaminated');
                                setVerificationFeedback({
                                  type: 'success',
                                  message: \`Solicitação \${kit.code} aprovada e enviada para esterilização.\`
                                });
                                setTimeout(() => setVerificationFeedback(null), 4000);
                              }
                            }}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">check_circle</span>
                            <span>Aprovar para CME</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReproveModal(kit);
                            }}
                            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">cancel</span>
                            <span>Reprovar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-700 rounded-xl">
                <span className="material-symbols-outlined text-slate-600 text-[24px] mb-1">done_all</span>
                <p className="text-[12px] text-slate-500 font-medium">Nenhuma solicitação aguardando liberação.</p>
              </div>
            )}
          </div>

          {/* PAINEL 2: KITS EM ESTERILIZAÇÃO */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="material-symbols-outlined text-[20px] text-blue-600">cleaning_services</span>
                <h3 className="text-[15px] font-bold">Kits em Processo de Esterilização</h3>
              </div>
              <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {globalSterilizingKits.filter(k => !selectedStudentGrr || k.ownerStudentGrr === selectedStudentGrr || k.assignedTo === selectedStudentGrr).length} Esterilizando
              </span>
            </div>

            {globalSterilizingKits.filter(k => !selectedStudentGrr || k.ownerStudentGrr === selectedStudentGrr || k.assignedTo === selectedStudentGrr).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {globalSterilizingKits.filter(k => !selectedStudentGrr || k.ownerStudentGrr === selectedStudentGrr || k.assignedTo === selectedStudentGrr).map(kit => {
                  const student = students.find(s => s.grr === kit.ownerStudentGrr || s.grr === kit.assignedTo);
                  const studentName = student?.name || kit.ownerStudentName || 'Aluno Não Encontrado';
                  const studentPin = student?.numericPassword?.toString().padStart(3, '0') || '---';

                  return (
                    <div key={kit.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[12px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {kit.code}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>
                          Esterilizando
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">Aluno:</span>
                          <span className="text-slate-800 font-bold truncate max-w-[150px]" title={studentName}>{studentName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">GRR:</span>
                          <span className="text-slate-700 font-mono">{kit.ownerStudentGrr || kit.assignedTo}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">Senha:</span>
                          <span className="text-amber-600 font-mono font-bold bg-amber-50 px-1.5 rounded border border-amber-100">{studentPin}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11.5px] text-slate-500 font-medium">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">lunch_dining</span>
                            <span>{kit.marmitasCount || 0} marmita(s)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">inventory</span>
                            <span>{kit.pacotesCount || 0} pacote(s)</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSterilizeKit) {
                              onSterilizeKit(kit.id);
                              setVerificationFeedback({
                                type: 'success',
                                message: \`Kit \${kit.code} finalizou a esterilização e está pronto para retirada.\`
                              });
                              setTimeout(() => setVerificationFeedback(null), 5000);
                            }
                          }}
                          className="mt-1 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">task_alt</span>
                          <span>Mudar para Pronto</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl bg-white">
                <span className="material-symbols-outlined text-slate-400 text-[24px] mb-1">cleaning_services</span>
                <p className="text-[12px] text-slate-500 font-medium">Nenhum kit em processo de esterilização.</p>
              </div>
            )}
          </div>

          {/* PAINEL 3: PRONTOS PARA RETIRADA */}
          <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">inventory_2</span>
                <h3 className="text-[15px] font-bold">Kits Prontos para Retirada</h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {kits.filter(k => (k.status === 'Ready' || k.status === 'Pronta') && (!selectedStudentGrr || k.ownerStudentGrr === selectedStudentGrr || k.assignedTo === selectedStudentGrr)).length} Pronto(s)
              </span>
            </div>

            {kits.filter(k => (k.status === 'Ready' || k.status === 'Pronta') && (!selectedStudentGrr || k.ownerStudentGrr === selectedStudentGrr || k.assignedTo === selectedStudentGrr)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {kits.filter(k => (k.status === 'Ready' || k.status === 'Pronta') && (!selectedStudentGrr || k.ownerStudentGrr === selectedStudentGrr || k.assignedTo === selectedStudentGrr)).map(kit => {
                  const student = students.find(s => s.grr === kit.ownerStudentGrr || s.grr === kit.assignedTo);
                  const studentName = student?.name || kit.ownerStudentName || 'Aluno Não Encontrado';
                  const studentPin = student?.numericPassword?.toString().padStart(3, '0') || '---';
                  const mAvail = Math.max(0, (kit.marmitasCount ?? 1) - (kit.marmitasWithdrawn ?? 0));
                  const pAvail = Math.max(0, (kit.pacotesCount ?? 0) - (kit.pacotesWithdrawn ?? 0));
                  
                  // Se não tem itens disponíveis, nem mostra
                  if (mAvail === 0 && pAvail === 0) return null;

                  return (
                    <div key={kit.id} className="bg-white rounded-xl p-3.5 border border-emerald-200 shadow-xs hover:border-emerald-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[12px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {kit.code}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Estéril / Pronto
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">Aluno:</span>
                          <span className="text-slate-800 font-bold truncate max-w-[150px]" title={studentName}>{studentName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">GRR:</span>
                          <span className="text-slate-700 font-mono">{kit.ownerStudentGrr || kit.assignedTo}</span>
                        </div>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-slate-500 font-medium">Senha:</span>
                          <span className="text-amber-600 font-mono font-bold bg-amber-50 px-1.5 rounded border border-amber-100">{studentPin}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11.5px] text-slate-600 font-semibold bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-emerald-600">lunch_dining</span>
                            <span>{mAvail} marmita(s) disp.</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-emerald-600">inventory</span>
                            <span>{pAvail} pacote(s) disp.</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Select student globally so transaction works easily
                            if (student) setSelectedStudentGrr(student.grr);
                            setCounterWithdrawingKit(kit);
                            setWithdrawMarmitasQty(mAvail > 0 ? mAvail : 0);
                            setWithdrawPacotesQty(pAvail > 0 ? pAvail : 0);
                          }}
                          className="mt-1 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">input</span>
                          <span>Retirar Itens</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-emerald-200 rounded-xl bg-white">
                <span className="material-symbols-outlined text-slate-400 text-[24px] mb-1">inventory_2</span>
                <p className="text-[12px] text-slate-500 font-medium">Nenhum kit pronto para retirada.</p>
              </div>
            )}
          </div>
        </div>
      )}
`;

const newContent = content.substring(0, startIndex) + replacementCode + content.substring(lastClosingBraceIndex + 4);

fs.writeFileSync('src/components/ReceptionCounterView.tsx', newContent);
console.log('Update complete!');
