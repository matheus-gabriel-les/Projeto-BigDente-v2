import {
  Student,
  Kit,
  Transaction,
  ActionAlert,
  DocArticle,
  VideoTutorial,
  UserProfile,
  AutoclaveCycleRecord,
  AlmoxarifadoShiftReport
} from '../types';

export const APP_IMAGES = {
  drVance: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-PVPUL_v5f74yBL9WXMX1JHr2F_vaZxnTS8STn-nOuKzzJ6cq7_Ux0cc_DwVs9nATBPiV4uwT0c4bES67iSoPn2PJ9uJ6Ci7mBx2wFBPPfm3hIIyxKYhebyHfw-Q5T7xIpK2MolW90LcQYhwbOv0IWuO77bkoiYga8bT156tizOMqrvWdNOy_QrAutfcGiMoY-FVYT48NvIjlYCqBprlLWJE56NNPwE2k-9zX_Rv10swV2mAqbbt4",
  tech1: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQDcvXcgZGSCAqPJsisfnXY9FKu0P5lDtD3cE1T-q8dVowHe-1Yw38NFlnbWe-ywDqkWmROTzKCozOsm6n2tdtS4xphEHsd-nD0IEOPv1Zg_H29u8NORufQrErCANFXSTSA8u6ZGAmNkjHP2XXgHoF8qUl9rNYGVs14Yd-h4Yqq-tQGIrka-PTNpfyO6VzAQjHx4CkAPUsQuEjok7DqEXvsuSLFk40lF_WQZcEle9W6ngglnO1oCcT",
  tech2: "https://lh3.googleusercontent.com/aida-public/AB6AXuARPApxp1QjQ_bQ-GEHXerFk_dDWjH2yAw2NoT5mdfhMHJ31BpsBI8-BUlszQBA-i5Nf3hSEz5Nt4LT3AHQ6Okr8Xnq1JgO_tt1L-ASqwrp3RDxT8GSUrCeqZjUF5CqTYyj8llUeshWnMkOLLbI0WBGkIgEGoZu--NhQl9x9jOuXwWyN9NFNeeHtGIT5UpFhATbLHS-TW5iV47tOb_MO9iqkRSW_hSziwVvjHlRhUlseV26ZKq9CCYy",
  studentGirl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYG4g-45pmsq22tqfV9Vb3hYmZt82-w1tV8U23pP7x6wQ3_5lq3Vl20l8k3j0a9sF5d9",
  studentBoy: "https://lh3.googleusercontent.com/aida-public/AB6AXuB23v_49z-389f_448s0_39w8fj24908dfjk298_24982fkls023",
  labLogo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZt32dE-yX60bBL6WS66B4Dfrbx8wNSe2ePgvrC5CibTDy1aqVzWWwNTdI94lFj-NdGYZ1fEwhVitq3ILcn-hqhZiK-kbz-IBn8QsyKw561VXFLcKSGGxxhVxBOIajagT3BtMzOZcpMJgSjCfjaotUJg9lq7LXeynW5hzohtzx7RrIrvoHalTIV3yNM7kkQkaU2R3GU3Gd1u0JjdKf0E6Fs5Pfu7RfTTD0EkypvfAurVdO92eArFvu",
  tutorialBatchKit: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKtUrkT99Bn_7GXuP_JgrRwUP-4EMvBXNzc71-QjPS0-3J5nFus4NHoFPCdz5vyV5Ppd-5esRbFSIGdROHhulQ441odSO-cx6CPjK97grCAlBypOdNusvXIDUOskxqFiGzI3Qq74GaE-fI7q1aVu3Ao5wIIeRvi7nMResHvdIa46aTxLelR2bIM0Ipho5E9sMc5RYg6ysBjWudkjFwHIGvkkv1Yxls0XyXKwop56rkBFNQ9QzdMozs",
  tutorialSterilization: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOczadk9zJ_Qm8xQgf97b_f5RgzWc69gCwEUK70kktHbOumVhhxxUg17WHaTOTW71-ZvaTmj5zakt2YE_hNSha96bRiopgYe6W-gpYQDhdN7vLjL6tgYS6MucrpysExKcVrUffO1UGem_ZkYNgvUif563eppg-IEfqbzP0fUxdeAzCe338skrtbnbgX-C7KtXsinB2qd_pzoLQ8h1-Cyfx4Lm0EEDSAvnS4EUU2YSuZgEdxF8S0WqN"
};

export const userProfiles: UserProfile[] = [
  {
    id: 'usr-admin',
    name: 'Dr. E. Vance',
    role: 'admin',
    roleLabel: 'Responsável Técnico / Administrador',
    department: 'Diretoria de Clínicas e Biossegurança',
    email: 'e.vance@odontologia.edu.br',
    avatarUrl: APP_IMAGES.drVance,
    description: 'Gestão e governança: cadastro de acadêmicos, controle patrimonial do acervo de marmitas, relatórios de auditoria sanitária e parametrização do sistema.',
    allowedTabs: ['dashboard', 'students', 'inventory', 'reports', 'settings', 'help'],
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'usr-reception',
    name: 'Juliana Santos',
    role: 'receptionist',
    roleLabel: 'Atendente de Balcão / Almoxarifado',
    department: 'Balcão de Atendimento Clínico',
    email: 'j.santos.balcao@odontologia.edu.br',
    avatarUrl: APP_IMAGES.tech2,
    description: 'Conferência se as novas marmitas solicitadas ou a serem retiradas batem com os dados que o estudante ao chegar no balcão está informando.',
    allowedTabs: ['reception', 'protocol', 'help'],
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'usr-student-mariana',
    name: 'Mariana Costa Silva',
    role: 'student',
    roleLabel: 'Acadêmica de Odontologia',
    department: 'Graduação - 3º Ano Clínico',
    email: 'mariana.silva@aluno.odontologia.edu.br',
    studentGrr: '20230192',
    studentId: 'stu-6',
    avatarUrl: APP_IMAGES.drVance,
    description: 'Visão do aluno: cadastro e gestão das suas próprias marmitas de instrumental, acompanhamento de ciclos de esterilização na CME, emissão de etiquetas com QR Code e cartão digital.',
    allowedTabs: ['student_space', 'student_available', 'help'],
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'usr-student-alina',
    name: 'Alina Rostova',
    role: 'student',
    roleLabel: 'Acadêmica de Odontologia',
    department: 'Graduação - 4º Ano Cirurgia',
    email: 'alina.rostova@aluno.odontologia.edu.br',
    studentGrr: '84920193',
    studentId: 'stu-1',
    avatarUrl: APP_IMAGES.tech2,
    description: 'Visão do aluno: cadastro e gestão das suas próprias marmitas de instrumental, acompanhamento de ciclos de esterilização na CME, emissão de etiquetas com QR Code e cartão digital.',
    allowedTabs: ['student_space', 'student_available', 'help'],
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  }
];

export const initialStudents: Student[] = [
  {
    id: "stu-1",
    name: "Alina Rostova",
    email: "a.rostova@aluno.odontologia.edu.br",
    grr: "84920193",
    code: "ARO",
    status: "Active",
    course: "Odontologia - Cirurgia Clínica 4º Ano",
    avatarInitials: "AR",
    currentPossession: {
      kitId: "KIT-MAR-1024",
      kitName: "Marmita Cirúrgica Set A",
      since: "Hoje, às 08:30",
      items: ["Cabo de Bisturi nº 3", "Pinça Anatômica 1x2", "Tesoura Metzenbaum", "Porta-agulhas Mayo-Hegar"],
      validUntil: "15 dias restantes"
    },
    history: [
      {
        id: "h1",
        equipmentName: "Estação de Microscopia Clínica C",
        timeframe: "Ontem, 14:00 - 17:30",
        note: "Devolvido em perfeitas condições de uso."
      },
      {
        id: "h2",
        equipmentName: "Kit Rotatório Endodôntico",
        timeframe: "12 de Outubro, 09:15 - 11:00",
        note: "Higienizado e encaminhado para re-autoclavação."
      },
      {
        id: "h3",
        equipmentName: "Marmita Periodontia Básica #02",
        timeframe: "08 de Outubro, 10:00 - 12:45",
        note: "Conformidade sanitária verificada pela CME."
      }
    ]
  },
  {
    id: "stu-2",
    name: "Marcus Kline",
    email: "m.kline@aluno.odontologia.edu.br",
    grr: "84920194",
    code: "MKL",
    status: "Active",
    course: "Odontologia - Periodontia 3º Ano",
    avatarInitials: "MK",
    history: [
      {
        id: "h4",
        equipmentName: "Unidade de Ultrassom Periodontal",
        timeframe: "14 de Outubro, 08:00 - 11:30",
        note: "Devolvido desinfectado e testado."
      }
    ]
  },
  {
    id: "stu-3",
    name: "Elena Jenco",
    email: "e.jenco@aluno.odontologia.edu.br",
    grr: "84920112",
    code: "EJE",
    status: "Inactive",
    course: "Odontologia - Especialização Ortodontia",
    avatarInitials: "EJ",
    history: [
      {
        id: "h5",
        equipmentName: "Fotopolimerizador LED Sem Fio",
        timeframe: "28 de Setembro, 13:00 - 16:00",
        note: "Ciclo de recarga de bateria executado."
      }
    ]
  },
  {
    id: "stu-4",
    name: "Tomás Cruz",
    email: "t.cruz@aluno.odontologia.edu.br",
    grr: "84920205",
    code: "TCR",
    status: "Active",
    course: "Odontologia - Dentística Restauradora 4º Ano",
    avatarInitials: "TC",
    currentPossession: {
      kitId: "KIT-MAR-0808",
      kitName: "Marmita de Periodontia Set 08",
      since: "Hoje, às 09:15",
      items: ["Curetas Gracey 1/2 e 7/8", "Sonda Milimetrada Carolina do Norte", "Espelho Bucal Plano"],
      validUntil: "12 dias restantes"
    },
    history: [
      {
        id: "h6",
        equipmentName: "Kit de Resinas e Polimento",
        timeframe: "11 de Outubro, 14:00 - 17:00",
        note: "Devolução limpa e aprovada."
      }
    ]
  },
  {
    id: "stu-5",
    name: "Sarah Wells",
    email: "s.wells@aluno.odontologia.edu.br",
    grr: "84920288",
    code: "SWE",
    status: "Active",
    course: "Odontologia - Patologia Bucal 2º Ano",
    avatarInitials: "SW",
    currentPossession: {
      kitId: "KIT-MIC-002",
      kitName: "Estação de Lente de Alta Imersão B",
      since: "Hoje, às 08:12",
      items: ["Lente de Imersão 100x", "Cabo de Transmissão Digital HD"],
      validUntil: "Hoje (Devolução até 18:00)"
    },
    history: [
      {
        id: "h7",
        equipmentName: "Micropipeta Digital Calibrada 100uL",
        timeframe: "10 de Outubro, 09:00 - 11:30",
        note: "Calibração e assepsia validadas."
      }
    ]
  },
  {
    id: "stu-6",
    name: "Mariana Costa Silva",
    email: "mariana.silva@aluno.odontologia.edu.br",
    grr: "20230192",
    code: "MCS",
    status: "Active",
    course: "Odontologia - Clínica Integrada 3º Ano",
    avatarInitials: "MC",
    history: [
      {
        id: "h8",
        equipmentName: "Porta-Amálgama & Esculpidor Hollemback",
        timeframe: "05 de Outubro, 14:00 - 16:30",
        note: "Limpeza ultrassônica realizada e devolvido."
      }
    ]
  },
  {
    id: "stu-7",
    name: "João Pedro Santos",
    email: "j.santos@aluno.odontologia.edu.br",
    grr: "20210045",
    code: "JPS",
    status: "Active",
    course: "Odontologia - Prótese Dentária 5º Ano",
    avatarInitials: "JS",
    currentPossession: {
      kitId: "K-E101",
      kitName: "Marmita de Endodontia de Precisão",
      since: "Hoje, às 09:42",
      items: ["Localizador Apical Digital", "Sonda DG16", "Espaçador Digital D11T"],
      validUntil: "10 dias restantes"
    },
    history: []
  },
  {
    id: "stu-8",
    name: "Ana Carolina Ribeiro",
    email: "a.carolina@aluno.odontologia.edu.br",
    grr: "20220891",
    code: "ACR",
    status: "Active",
    course: "Odontologia - Odontopediatria 3º Ano",
    avatarInitials: "AC",
    history: [
      {
        id: "h9",
        equipmentName: "Marmita Odontopediatria Restauradora K-C405",
        timeframe: "Hoje, 07:30 - 09:35",
        note: "Devolvida íntegra na CME. Esterilização aprovada."
      }
    ]
  }
];

export const initialKits: Kit[] = [
  {
    id: "KIT-MAR-1024",
    code: "KIT-MAR-1024",
    name: "Marmita Cirúrgica Set A - Alina",
    category: "Cirurgia",
    status: "In Use",
    lastSterilized: "12 de Outubro",
    cyclesLogged: 45,
    validityDays: 12,
    ownerStudentGrr: "84920193",
    ownerStudentName: "Alina Rostova",
    assignedTo: "84920193",
    assignedStudentName: "Alina Rostova (GRR: 84920193)",
    checkoutTime: "08:30",
    colorTag: "Azul",
    boxMaterial: "Inox Perfurado 20x10x5",
    items: ["Cabo de Bisturi nº 3", "Pinça Anatômica 1x2", "Tesoura Metzenbaum", "Porta-agulhas Mayo-Hegar"],
    notes: "Autoclave ciclo #4102. Indicador biológico negativado.",
    autoclaveCycleId: "CICLO-4102",
    biologicalTestResult: "Negativo (Aprovado)"
  },
  {
    id: "MAR-MCS-01",
    code: "MAR-MCS-01",
    name: "Marmita de Dentística Restauradora - Mariana",
    category: "Dentística",
    status: "Ready",
    lastSterilized: "14 de Outubro",
    cyclesLogged: 22,
    validityDays: 15,
    ownerStudentGrr: "20230192",
    ownerStudentName: "Mariana Costa Silva",
    colorTag: "Verde",
    boxMaterial: "Inox Perfurado 20x10x5",
    items: ["Espelho Bucal Plano nº 5", "Sonda Exploradora nº 23/17", "Pinça de Algodão Clínica", "Esculpidor Hollemback 3S", "Espátula de Inserção nº 1", "Brunidor Oval nº 29"],
    notes: "Kit completo cadastrado pela aluna. Gravação MCS em todas as peças.",
    autoclaveCycleId: "CICLO-4106",
    biologicalTestResult: "Negativo (Aprovado)"
  },
  {
    id: "MAR-MCS-02",
    code: "MAR-MCS-02",
    name: "Marmita de Periodontia Clínica - Mariana",
    category: "Periodontia",
    status: "Ready",
    lastSterilized: "11 de Outubro",
    cyclesLogged: 18,
    validityDays: 12,
    ownerStudentGrr: "20230192",
    ownerStudentName: "Mariana Costa Silva",
    colorTag: "Azul",
    boxMaterial: "Inox Perfurado 20x10x5",
    items: ["Sonda Milimetrada Carolina do Norte (PCPUNC 15)", "Sonda OMS", "Curetas Gracey 5/6, 7/8, 11/12, 13/14", "Pedra de Arkansas para Afiação"],
    notes: "Esterilizado e selado com integrador químico Classe 5.",
    autoclaveCycleId: "CICLO-4100",
    biologicalTestResult: "Negativo (Aprovado)"
  },
  {
    id: "MAR-MCS-03",
    code: "MAR-MCS-03",
    name: "Caixa de Isolamento Absoluto & Grampos - Mariana",
    category: "Dentística",
    status: "Decontaminated",
    lastSterilized: "28 de Setembro",
    cyclesLogged: 15,
    validityDays: 0,
    ownerStudentGrr: "20230192",
    ownerStudentName: "Mariana Costa Silva",
    colorTag: "Amarelo",
    boxMaterial: "Caixa Alumínio Anodizado",
    items: ["Arco de Young Plástico", "Alicate Perfurador de Ainsworth", "Alicate Porta-Grampos Palmer", "Estojo com 8 Grampos (200-209, 212, W8A)"],
    notes: "Entregue na CME pela aluna hoje às 07:45. Aguardando entrada na Autoclave Cristófoli 01.",
    autoclaveCycleId: "CICLO-PENDENTE",
    biologicalTestResult: "Pendente"
  },
  {
    id: "KIT-MAR-0891",
    code: "KIT-MAR-0891",
    name: "Marmita Exame Clínico Básico - Mariana",
    category: "Geral",
    status: "Expiring",
    lastSterilized: "01 de Outubro",
    cyclesLogged: 112,
    validityDays: 2,
    ownerStudentGrr: "20230192",
    ownerStudentName: "Mariana Costa Silva",
    colorTag: "Inox",
    boxMaterial: "Inox Perfurado 18x8x4",
    items: ["Espelho Bucal nº 5", "Sonda Exploradora nº 23/17", "Pinça de Algodão", "Sonda Periodontal OMS"],
    notes: "Próximo do limite de 15 dias. Programar para re-autoclavação.",
    autoclaveCycleId: "CICLO-4089",
    biologicalTestResult: "Negativo (Aprovado)"
  },
  {
    id: "KIT-MAR-1102",
    code: "KIT-MAR-1102",
    name: "Marmita de Exodontia & Alavancas - Marcus",
    category: "Cirurgia",
    status: "Expired",
    lastSterilized: "15 de Setembro",
    cyclesLogged: 8,
    validityDays: 0,
    ownerStudentGrr: "84920194",
    ownerStudentName: "Marcus Kline",
    colorTag: "Vermelho",
    boxMaterial: "Inox Perfurado 20x10x5",
    items: ["Fórceps Universal Adulto nº 150", "Fórceps Universal nº 151", "Alavanca Reta nº 301", "Par de Alavancas Cryer"],
    notes: "Validade expirada. Encaminhar para descontaminação e autoclave.",
    autoclaveCycleId: "CICLO-4050",
    biologicalTestResult: "Pendente"
  },
  {
    id: "KIT-MAR-0045",
    code: "KIT-MAR-0045",
    name: "Marmita Cirúrgica de Implantes - Sarah",
    category: "Cirurgia",
    status: "Ready",
    lastSterilized: "08 de Outubro",
    cyclesLogged: 29,
    validityDays: 8,
    ownerStudentGrr: "84920288",
    ownerStudentName: "Sarah Wells",
    colorTag: "Azul",
    boxMaterial: "Inox Perfurado 20x10x5",
    items: ["Catraca Torquimétrica", "Extensor de Brocas", "Pinos Paralelizadores (4x)", "Sonda Milimetrada de Profundidade"],
    notes: "Estéril, lacrado com fita zebrada termossensível intacta.",
    autoclaveCycleId: "CICLO-4098",
    biologicalTestResult: "Negativo (Aprovado)"
  },
  {
    id: "K-P204",
    code: "K-P204",
    name: "Marmita Periodontia Avançada B - Tomás",
    category: "Periodontia",
    status: "Ready",
    lastSterilized: "11 de Outubro",
    cyclesLogged: 64,
    validityDays: 12,
    ownerStudentGrr: "84920205",
    ownerStudentName: "Tomás Cruz",
    colorTag: "Verde",
    boxMaterial: "Inox Perfurado 20x10x5",
    items: ["Curetas Gracey 5/6, 7/8, 11/12, 13/14", "Inserto Ultrassônico Perio", "Cabo de Bisturi Micro"],
    notes: "Esterilizado e selado com integrador químico Classe 5.",
    autoclaveCycleId: "CICLO-4100",
    biologicalTestResult: "Negativo (Aprovado)"
  },
  {
    id: "K-E101",
    code: "K-E101",
    name: "Marmita de Endodontia de Precisão - João Pedro",
    category: "Endodontia",
    status: "In Use",
    lastSterilized: "10 de Outubro",
    cyclesLogged: 38,
    validityDays: 10,
    ownerStudentGrr: "20210045",
    ownerStudentName: "João Pedro Santos",
    assignedTo: "20210045",
    assignedStudentName: "João Pedro Santos",
    checkoutTime: "09:42",
    colorTag: "Vermelho",
    boxMaterial: "Inox Perfurado 20x10x5",
    items: ["Sonda Exploradora DG16", "Pinça de Travamento", "Colher de Dentina 31L", "Espaçador Digital D11T"],
    notes: "Em uso na Clínica de Endodontia - Box 02B.",
    autoclaveCycleId: "CICLO-4099",
    biologicalTestResult: "Negativo (Aprovado)"
  },
  {
    id: "K-C405",
    code: "K-C405",
    name: "Marmita Odontopediatria Restauradora - Ana Carolina",
    category: "Pediatria",
    status: "Ready",
    lastSterilized: "13 de Outubro",
    cyclesLogged: 19,
    validityDays: 14,
    ownerStudentGrr: "20220891",
    ownerStudentName: "Ana Carolina Ribeiro",
    colorTag: "Amarelo",
    boxMaterial: "Inox Perfurado 18x8x4",
    items: ["Grampos Infantis de Isolamento Absoluto", "Alicate Conformador de Coroas", "Porta-Matriz Infantil"],
    notes: "Recém-devolvido, inspecionado e revalidado na CME.",
    autoclaveCycleId: "CICLO-4105",
    biologicalTestResult: "Negativo (Aprovado)"
  },
  {
    id: "KIT-8942-A",
    code: "KIT-8942-A",
    name: "Marmita Prótese Fixa & Preparo - Alina",
    category: "Prótese",
    status: "Expiring",
    lastSterilized: "30 de Setembro",
    cyclesLogged: 88,
    validityDays: 1,
    ownerStudentGrr: "84920193",
    ownerStudentName: "Alina Rostova",
    colorTag: "Inox",
    boxMaterial: "Inox Perfurado 20x10x5",
    items: ["Saca-Coroas Pneumático", "Pinça Miller Articuladora", "Recortadores de Margem Gengival"],
    notes: "Vence amanhã. Agendado para ciclo matutino da autoclave.",
    autoclaveCycleId: "CICLO-4078",
    biologicalTestResult: "Negativo (Aprovado)"
  },
  {
    id: "KIT-7710-B",
    code: "KIT-7710-B",
    name: "Marmita Diagnóstico & Biópsia - Alina",
    category: "Cirurgia",
    status: "Ready",
    lastSterilized: "14 de Outubro",
    cyclesLogged: 14,
    validityDays: 15,
    ownerStudentGrr: "84920193",
    ownerStudentName: "Alina Rostova",
    colorTag: "Azul",
    boxMaterial: "Inox Perfurado 20x10x5",
    items: ["Punch de Biópsia 4mm", "Pinça Adson com Dente", "Caixa de Lâminas nº 15 estéreis"],
    notes: "Ciclo finalizado com teste de esporos 100% esterilizado.",
    autoclaveCycleId: "CICLO-4106",
    biologicalTestResult: "Negativo (Aprovado)"
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: "tx-1",
    timestamp: "09:42:11",
    action: "Withdrawal",
    kitId: "K-E101",
    kitName: "Marmita de Endodontia de Precisão",
    studentName: "João Pedro Santos",
    grrCode: "20210045",
    status: "IN USE",
    operatorName: "Juliana Santos (Balcão)",
    notes: "Liberado com conferência de 4 itens."
  },
  {
    id: "tx-2",
    timestamp: "09:35:04",
    action: "Return",
    kitId: "K-C405",
    kitName: "Marmita Odontopediatria Restauradora",
    studentName: "Ana Carolina Ribeiro",
    grrCode: "20220891",
    status: "STERILE",
    operatorName: "Juliana Santos (Balcão)",
    notes: "Devolvido sem avarias. Encaminhado para autoclave."
  },
  {
    id: "tx-3",
    timestamp: "09:15:00",
    action: "Withdrawal",
    kitId: "KIT-MAR-0808",
    kitName: "Marmita de Periodontia Set 08",
    studentName: "Tomás Cruz",
    grrCode: "84920205",
    status: "IN USE",
    operatorName: "Juliana Santos (Balcão)",
    notes: "Retirada para aula prática de raspagem subgengival."
  },
  {
    id: "tx-4",
    timestamp: "08:30:00",
    action: "Withdrawal",
    kitId: "KIT-MAR-1024",
    kitName: "Marmita Cirúrgica Set A",
    studentName: "Alina Rostova",
    grrCode: "84920193",
    status: "IN USE",
    operatorName: "Carlos Mendes (CME)",
    notes: "Retirada para cirurgia de terceiro molar."
  },
  {
    id: "tx-5",
    timestamp: "08:12:55",
    action: "Withdrawal",
    kitId: "KIT-MIC-002",
    kitName: "Estação de Lente de Alta Imersão B",
    studentName: "Sarah Wells",
    grrCode: "84920288",
    status: "IN USE",
    operatorName: "Juliana Santos (Balcão)",
    notes: "Utilização em lâminas histopatológicas."
  }
];

export const initialAlerts: ActionAlert[] = [
  {
    id: "alt-1",
    kitId: "KIT-MAR-1102",
    daysLeft: 0,
    reason: "Validade de esterilização atingiu 0 dias. Proibido uso clínico.",
    protocolAction: "Encaminhar para Lavagem e Autoclave",
    severity: "error"
  },
  {
    id: "alt-2",
    kitId: "KIT-8942-A",
    daysLeft: 1,
    reason: "Marmita vence em menos de 24 horas. Reprocessar preventivamente.",
    protocolAction: "Re-esterilizar na CME",
    severity: "warning"
  },
  {
    id: "alt-3",
    kitId: "KIT-MAR-0891",
    daysLeft: 2,
    reason: "Marmita com 2 dias de esterilidade restante.",
    protocolAction: "Agendar Ciclo de Autoclave",
    severity: "warning"
  }
];

export const initialAutoclaveCycles: AutoclaveCycleRecord[] = [
  {
    id: "CICLO-4106",
    cycleNumber: 4106,
    chamberId: "AUTOCLAVE-CRISTOFOLI-01",
    operator: "Carlos Mendes",
    startTime: "Hoje, 07:15",
    durationMinutes: 45,
    temperature: 134,
    pressureBar: 2.1,
    kitsCount: 8,
    biologicalIndicator: "Aprovado (Negativo)",
    chemicalIndicatorClass5: true,
    status: "Concluído com Sucesso"
  },
  {
    id: "CICLO-4105",
    cycleNumber: 4105,
    chamberId: "AUTOCLAVE-CRISTOFOLI-02",
    operator: "Carlos Mendes",
    startTime: "Ontem, 16:30",
    durationMinutes: 45,
    temperature: 134,
    pressureBar: 2.1,
    kitsCount: 6,
    biologicalIndicator: "Aprovado (Negativo)",
    chemicalIndicatorClass5: true,
    status: "Concluído com Sucesso"
  },
  {
    id: "CICLO-4104",
    cycleNumber: 4104,
    chamberId: "AUTOCLAVE-CRISTOFOLI-01",
    operator: "Carlos Mendes",
    startTime: "Ontem, 11:00",
    durationMinutes: 45,
    temperature: 134,
    pressureBar: 2.1,
    kitsCount: 10,
    biologicalIndicator: "Aprovado (Negativo)",
    chemicalIndicatorClass5: true,
    status: "Concluído com Sucesso"
  }
];

export const docArticles: DocArticle[] = [
  {
    id: "art-1",
    title: "Validação de Ciclo de Autoclave e Indicadores Biológicos",
    category: "Protocolos CME",
    updatedAt: "Há 2 dias",
    readTime: "3 min de leitura",
    summary: "Procedimento Operacional Padrão (POP) para leitura de ampolas de Geobacillus stearothermophilus e liberação do lote de marmitas.",
    content: [
      "1. Certifique-se de que a ampola do indicador biológico incubou por 24h na incubadora a 56°C sem mudança para cor amarela (resultado negativo/aprovado).",
      "2. Verifique se as fitas zebradas e integradores químicos Classe 5 viraram completamente para a cor preta/escura.",
      "3. Acesse o módulo 'Central de Esterilização' e selecione o código da Marmita.",
      "4. Clique em 'Registrar Autoclavação' para renovar o prazo padrão de 15 dias de validade e gerar o selo digital de rastreabilidade."
    ]
  },
  {
    id: "art-2",
    title: "Leitura de GRR e Liberação Rápida de Instrumental",
    category: "Balcão & Atendimento",
    updatedAt: "Há 1 semana",
    readTime: "4 min de leitura",
    summary: "Protocolo para atendimento de alunos no balcão utilizando o leitor de código de barras ou busca manual por matrícula (GRR).",
    content: [
      "1. No terminal do Balcão, posicione o cursor no campo 'Código do Aluno (GRR)' ou aproxime o leitor do cartão digital do aluno.",
      "2. O sistema fará a validação instantânea de matrícula ativa e conferência de kits já em posse.",
      "3. Em seguida, bipe o código da Marmita esterilizada (ex: KIT-MAR-1024).",
      "4. Clique em 'Confirmar Saída' para registrar a data, hora e responsável pela liberação."
    ]
  },
  {
    id: "art-3",
    title: "Conduta para Devolução de Kits Contaminados e Limpeza",
    category: "Biossegurança",
    updatedAt: "Há 2 semanas",
    readTime: "2 min de leitura",
    summary: "Passo a passo para recepção de materiais pós-clínica, expurgo e lavagem ultrassônica antes do empacotamento em papel grau cirúrgico.",
    content: [
      "1. O aluno deve entregar a marmita fechada no setor de expurgo da CME.",
      "2. A equipe confere a quantidade de peças conforme o checklist da caixa.",
      "3. O material passa por imersão em detergente enzimático e cuba ultrassônica por 15 minutos.",
      "4. Após secagem rigorosa, os instrumentais são acondicionados e encaminhados para a autoclave."
    ]
  },
  {
    id: "art-4",
    title: "Emissão de Relatórios de Conformidade para Vigilância Sanitária",
    category: "Auditoria & Relatórios",
    updatedAt: "Há 1 mês",
    readTime: "5 min de leitura",
    summary: "Como exportar o histórico de ciclos de autoclave, registros de temperatura e rastreabilidade para inspeção da Anvisa e comissão de biossegurança.",
    content: [
      "1. Navegue até a aba 'Relatórios & Auditoria'.",
      "2. Selecione o período desejado (Diário, Semanal ou Mensal).",
      "3. Confira os gráficos de ciclos executados, taxa de conformidade e integridade dos testes biológicos.",
      "4. Clique em 'Exportar Relatório Sanitário' para gerar o arquivo assinado em PDF ou planilha."
    ]
  }
];

export const videoTutorials: VideoTutorial[] = [
  {
    id: "vid-1",
    title: "Procedimento de Empacotamento e Selagem de Marmitas",
    duration: "03:45",
    description: "Demonstração prática da correta disposição dos instrumentais, fita termossensível e selagem em papel grau cirúrgico.",
    thumbnailUrl: APP_IMAGES.tutorialBatchKit,
    category: "Gestão de CME"
  },
  {
    id: "vid-2",
    title: "Operação da Autoclave e Monitoramento de Pressão e Temperatura",
    duration: "05:12",
    description: "Guia completo sobre os parâmetros de 134°C a 2.1 bar, teste de esporos biológicos e contagem regressiva de validade.",
    thumbnailUrl: APP_IMAGES.tutorialSterilization,
    category: "Protocolo de Esterilização"
  }
];

export const initialAlmoxarifadoReports: AlmoxarifadoShiftReport[] = [
  {
    id: 'rep-shift-101',
    date: 'Hoje (Turno Matutino)',
    shift: 'Manhã (07:30 - 12:00)',
    attendantName: 'Juliana Santos',
    damagesReported: [
      {
        id: 'dmg-1',
        kitCode: 'MAR-CIR-02',
        type: 'Trava / Fecho Quebrado',
        studentGrr: '20230192',
        studentName: 'Mariana Costa Silva',
        description: 'Fecho lateral da caixa inox soltou durante transporte na clínica cirúrgica.',
        severity: 'Média'
      },
      {
        id: 'dmg-2',
        kitCode: 'K-E101',
        type: 'Etiqueta Ilegível / Descolada',
        studentGrr: '20224810',
        studentName: 'Lucas Ferreira Lima',
        description: 'Etiqueta térmica descolou parcialmente após lavagem no expurgo; necessita reimpressão.',
        severity: 'Baixa'
      }
    ],
    overdueRetentions: [
      {
        id: 'over-1',
        kitCode: 'MAR-DEN-03',
        studentName: 'Beatriz Nogueira Souza',
        studentGrr: '20219402',
        checkoutTime: '08:15',
        hoursLate: 2.5,
        clinicalArea: 'Dentística Restauradora III'
      }
    ],
    suppliesConsumed: {
      surgicalGradePouches: 38,
      chemicalIndicatorClass5Strips: 38,
      autoclaveTapeMeters: 14,
      biologicalIndicatorAmpoules: 2
    },
    totalWithdrawals: 26,
    totalReturns: 22,
    pendingReturns: 4,
    peakHourInterval: '07:45 - 08:30 (Entrada) / 11:30 - 12:15 (Devolução)',
    notesForAdmin: 'Turno transcorreu normalmente com 26 liberações. Foi solicitado reforço de rolos de fita zebrada ao almoxarifado central.',
    status: 'Enviado para Administração'
  }
];
