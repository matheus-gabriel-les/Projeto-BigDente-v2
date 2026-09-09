const fs = require('fs');
let content = fs.readFileSync('src/components/ReceptionCounterView.tsx', 'utf-8');

// I need to remove the whole Return Modal block which seems to be around lines 1550 - 1630.
const startStr = "{/* Modal de Retirada Parcial/Total (Balcão) */}"; // wait this is withdrawal

// Let's find the exact return modal string
