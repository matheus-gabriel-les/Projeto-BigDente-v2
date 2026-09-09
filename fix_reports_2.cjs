const fs = require('fs');
let content = fs.readFileSync('src/components/ReportsView.tsx', 'utf-8');

// The line is: {t.studentName || 'Acadêmico'} <span className="text-slate-400 font-mono">({t.grrCode})</span>
// I will replace it with:
const oldLine = "{t.studentName || 'Acadêmico'} <span className=\"text-slate-400 font-mono\">({t.grrCode})</span>";
const newLine = `{t.studentName || 'Acadêmico'} <span className="text-slate-400 font-mono">({t.grrCode})</span>
                         {t.studentPin && <span className="ml-2 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-mono text-[10px]">Senha: {t.studentPin}</span>}`;
                         
content = content.replace(oldLine, newLine);

// Update notes to include attendant info
const oldNotesLine = "{t.notes || 'Identificação e lacre conferidos'}";
const newNotesLine = `<div className="flex flex-col gap-1">
                          <span>{t.notes || 'Identificação e lacre conferidos'}</span>
                          <span className="text-[10px] text-slate-400">Atendente: {t.operatorName || 'Almoxarifado'} {t.operatorId ? \`(\${t.operatorId})\` : ''}</span>
                        </div>`;

content = content.replace(oldNotesLine, newNotesLine);

fs.writeFileSync('src/components/ReportsView.tsx', content);
