export type UserRole = 'admin' | 'receptionist' | 'student';

export type TabType =
  | 'dashboard'
  | 'cme_station'
  | 'reception'
  | 'students'
  | 'inventory'
  | 'protocol'
  | 'student_space'
  | 'student_available'
  | 'reports'
  | 'help'
  | 'settings';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  email: string;
  avatarUrl: string;
  studentGrr?: string;
  studentId?: string;
  description: string;
  allowedTabs: TabType[];
  badgeColor: string;
}

export type KitStatus = 'Ready' | 'In Use' | 'Expiring' | 'Expired' | 'Decontaminated';

export interface Kit {
  id: string;
  code: string;
  name: string;
  status: KitStatus;
  lastSterilized: string;
  cyclesLogged: number;
  validityDays: number;
  assignedTo?: string; // GRR ou Código do Aluno
  assignedStudentName?: string;
  ownerStudentGrr?: string; // GRR do aluno proprietário da marmita
  ownerStudentName?: string; // Nome do aluno proprietário
  registeredDate?: string;
  colorTag?: string; // Ex: 'Azul', 'Verde', 'Amarelo', 'Vermelho', 'Inox'
  boxMaterial?: string; // Ex: 'Inox Perfurado', 'Caixa Alumínio Anodizado', 'Grau Cirúrgico'
  checkoutTime?: string;
  items?: string[];
  notes?: string;
  category?: 'Cirurgia' | 'Periodontia' | 'Endodontia' | 'Dentística' | 'Prótese' | 'Pediatria' | 'Geral';
  autoclaveCycleId?: string;
  biologicalTestResult?: 'Negativo (Aprovado)' | 'Pendente' | 'Positivo (Falha)';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grr: string; // Matrícula de 8 dígitos
  code: string; // Código de 3 letras
  status: 'Active' | 'Inactive';
  course: string;
  avatarInitials: string;
  currentPossession?: {
    kitId: string;
    kitName: string;
    since: string;
    items: string[];
    validUntil?: string;
  };
  history: Array<{
    id: string;
    equipmentName: string;
    timeframe: string;
    note?: string;
  }>;
}

export interface Transaction {
  id: string;
  timestamp: string;
  action: 'Withdrawal' | 'Return' | 'Flagged';
  kitId: string;
  kitName?: string;
  studentName?: string;
  grrCode: string;
  status: 'IN USE' | 'STERILE' | 'EXPIRED' | 'FLAGGED';
  operatorName?: string;
  notes?: string;
}

export interface ActionAlert {
  id: string;
  kitId: string;
  daysLeft: number;
  reason: string;
  protocolAction: string;
  severity: 'error' | 'warning';
}

export interface DocArticle {
  id: string;
  title: string;
  category: string;
  updatedAt: string;
  readTime: string;
  summary: string;
  content: string[];
}

export interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  description: string;
  thumbnailUrl: string;
  category: string;
}

export interface KitDamageReport {
  id: string;
  kitCode: string;
  type: 'Trava / Fecho Quebrado' | 'Caixa Amassada' | 'Perfuração de Grau Cirúrgico' | 'Etiqueta Ilegível / Descolada';
  studentGrr: string;
  studentName: string;
  description: string;
  severity: 'Alta' | 'Média' | 'Baixa';
}

export interface AlmoxarifadoShiftReport {
  id: string;
  date: string;
  shift: 'Manhã (07:30 - 12:00)' | 'Tarde (13:30 - 18:00)' | 'Noite (18:30 - 22:00)';
  attendantName: string;
  damagesReported: KitDamageReport[];
  overdueRetentions: Array<{
    id: string;
    kitCode: string;
    studentName: string;
    studentGrr: string;
    checkoutTime: string;
    hoursLate: number;
    clinicalArea: string;
  }>;
  suppliesConsumed: {
    surgicalGradePouches: number; // Envelopes de grau cirúrgico
    chemicalIndicatorClass5Strips: number; // Tiras de integrador classe 5
    autoclaveTapeMeters: number; // Metros de fita zebrada
    biologicalIndicatorAmpoules: number; // Ampolas de esporos
  };
  totalWithdrawals: number;
  totalReturns: number;
  pendingReturns: number;
  peakHourInterval: string;
  notesForAdmin: string;
  status: 'Enviado para Administração' | 'Revisado pela Coordenação';
}

export interface AutoclaveCycleRecord {
  id: string;
  cycleNumber: number;
  chamberId: string;
  operator: string;
  startTime: string;
  durationMinutes: number;
  temperature: number; // 134 °C
  pressureBar: number; // 2.1 bar
  kitsCount: number;
  biologicalIndicator: 'Aprovado (Negativo)' | 'Em Incubação' | 'Falha';
  chemicalIndicatorClass5: boolean;
  status: 'Concluído com Sucesso' | 'Em Andamento' | 'Interrompido';
}
