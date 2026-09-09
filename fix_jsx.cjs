const fs = require('fs');
let content = fs.readFileSync('src/components/ReceptionCounterView.tsx', 'utf-8');

// I will remove everything from:
//       {/* Botões de Ação */}
// down to 
//       )}
//     </div>
//   );
// };

const startStr = "              {/* Botões de Ação */}";
const startIndex = content.indexOf(startStr);
if (startIndex !== -1) {
  const endIndex = content.indexOf("    </div>\n  );\n};", startIndex);
  if (endIndex !== -1) {
    content = content.substring(0, startIndex) + content.substring(endIndex);
  }
}

fs.writeFileSync('src/components/ReceptionCounterView.tsx', content);
