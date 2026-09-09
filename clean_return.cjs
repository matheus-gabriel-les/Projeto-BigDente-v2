const fs = require('fs');
let content = fs.readFileSync('src/components/ReceptionCounterView.tsx', 'utf-8');

// I will just remove the useState declarations for counterReturningKit as they are no longer used
content = content.replace(/const \[counterReturningKit.*?;\n/g, '');
content = content.replace(/const \[returnMarmitasQty.*?;\n/g, '');
content = content.replace(/const \[returnPacotesQty.*?;\n/g, '');

// Also remove any remaining JSX that references counterReturningKit
const startStr = "              {/* Seletor de Pacotes a Devolver */}";
const startIndex = content.indexOf(startStr);
if (startIndex !== -1) {
  // It seems part of the modal was left behind. Let's find the closing brace that was missed
  const endStr = "      )}";
  const endIndex = content.indexOf(endStr, startIndex);
  if (endIndex !== -1) {
    content = content.substring(0, startIndex) + content.substring(endIndex + endStr.length);
  }
}

// Remove handleConfirmCounterReturn 
content = content.replace(/const handleConfirmCounterReturn = \(\) => \{[\s\S]*?\};\n/g, '');

fs.writeFileSync('src/components/ReceptionCounterView.tsx', content);
