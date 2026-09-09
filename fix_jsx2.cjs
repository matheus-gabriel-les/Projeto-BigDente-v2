const fs = require('fs');
let content = fs.readFileSync('src/components/ReceptionCounterView.tsx', 'utf-8');

// The closing tags are messed up for the Withdrawal Modal.
// The file is currently:
// 1460:                         className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
// 1461:                       >
// 1462:                         +
// 1463:                       </button>
// 1464:                     </div>
// 1465:                   </div>
// 1466:                 </div>
// 1467:               )}
// 1468: 
// 1469:     </div>
// 1470:   );
// 1471: };

// We need to restore the action buttons for withdrawal and properly close the modal, then close the main div.
// It seems the script I ran earlier deleted too much. I will append the missing part.

const toAppend = `
              {/* Botões de Ação */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCounterWithdrawingKit(null)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[12.5px] font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={withdrawMarmitasQty <= 0 && withdrawPacotesQty <= 0}
                  onClick={handleConfirmCounterWithdrawal}
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-[12.5px] font-bold shadow-xs cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  Confirmar Retirada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace("    </div>\n  );\n};\n", toAppend + "    </div>\n  );\n};\n");

fs.writeFileSync('src/components/ReceptionCounterView.tsx', content);
