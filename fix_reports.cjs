const fs = require('fs');
let content = fs.readFileSync('src/components/ReportsView.tsx', 'utf-8');

// Remove the button for "Apenas Devoluções"
content = content.replace(/<button[^>]*onClick=\{\(\) => setDailyFilterAction\('Return'\)\}[^>]*>[\s\S]*?<\/button>/, '');

// Change the "Devoluções Realizadas Hoje" card
content = content.replace(/\{transactions\.filter\(\(t\) => t\.action === 'Return'\)\.length\} Devolvidas/, 
  "{transactions.filter((t) => t.action === 'Flagged').length} Bloqueadas");

content = content.replace(/Devoluções Realizadas Hoje/, "Marmitas Sinalizadas / Bloqueadas");
content = content.replace(/Encaminhadas para expurgo e esterilização/, "Com avarias ou vencidas");

fs.writeFileSync('src/components/ReportsView.tsx', content);
