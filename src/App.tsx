/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType, Student, Kit, KitStatus, Transaction, ActionAlert, UserProfile, AlmoxarifadoShiftReport } from './types';
import {
  initialStudents,
  initialKits,
  initialTransactions,
  initialAlerts,
  userProfiles,
  initialAlmoxarifadoReports
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudentManagementView } from './components/StudentManagementView';
import { KitInventoryView } from './components/KitInventoryView';
import { WithdrawalProtocolView } from './components/WithdrawalProtocolView';
import { CMEStationView } from './components/CMEStationView';
import { ReceptionCounterView } from './components/ReceptionCounterView';
import { StudentPortalView } from './components/StudentPortalView';
import { ReportsView } from './components/ReportsView';
import { HelpView } from './components/HelpView';
import { SettingsView } from './components/SettingsView';
import { NewWithdrawalModal } from './components/NewWithdrawalModal';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';

export default function App() {
  const [activeProfile, setActiveProfile] = useState<UserProfile>(userProfiles[0]); // Default to Admin
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [kits, setKits] = useState<Kit[]>(initialKits);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [alerts, setAlerts] = useState<ActionAlert[]>(initialAlerts);
  const [almoxarifadoReports, setAlmoxarifadoReports] = useState<AlmoxarifadoShiftReport[]>(initialAlmoxarifadoReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNewWithdrawalOpen, setIsNewWithdrawalOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveAlmoxarifadoReport = (newReport: AlmoxarifadoShiftReport) => {
    setAlmoxarifadoReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
    showToast(`Levantamento do plantão (${newReport.shift}) enviado para a Administração!`);
  };

  // Switch role handler
  const handleSelectProfile = (profile: UserProfile) => {
    setActiveProfile(profile);
    setIsRoleSwitcherOpen(false);

    // Auto navigate to the dedicated, specific view for this role
    if (profile.role === 'student') {
      setCurrentTab('student_space');
    } else if (profile.role === 'receptionist') {
      setCurrentTab('reception');
    } else {
      setCurrentTab('dashboard');
    }

    showToast(`Ambiente carregado para: ${profile.name} (${profile.roleLabel})`);
  };

  // Add new student handler
  const handleAddStudent = (
    newStudentData: Omit<Student, 'id' | 'avatarInitials' | 'history'>
  ) => {
    const initials = newStudentData.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newStudent: Student = {
      ...newStudentData,
      id: `stu-${Date.now()}`,
      avatarInitials: initials,
      history: []
    };

    setStudents([newStudent, ...students]);
    showToast(`Acadêmico cadastrado com sucesso: ${newStudent.name} (GRR: ${newStudent.grr})`);
  };

  // Update student handler
  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(
      students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    showToast(`Perfil acadêmico atualizado: ${updatedStudent.name}`);
  };

  // Register new kit handler
  const handleRegisterKit = (newKitData: Omit<Kit, 'id'>) => {
    const newKit: Kit = {
      ...newKitData,
      id: `kit-${Date.now()}`
    };
    setKits([newKit, ...kits]);
    showToast(`Kit registrado com sucesso: ${newKit.code} (${newKit.name})`);
  };

  // Update kit status handler
  const handleUpdateKitStatus = (kitId: string, newStatus: KitStatus, reason?: string) => {
    setKits(
      kits.map((k) => {
        if (k.id === kitId || k.code === kitId) {
          return {
            ...k,
            status: newStatus,
            rejectionReason:
              newStatus === 'Reprovado'
                ? reason || 'Solicitação recusada pela atendente no balcão de conferência.'
                : undefined,
            notes:
              newStatus === 'Aguardando Liberação'
                ? 'Enviado pelo acadêmico. Aguardando conferência e liberação no balcão.'
                : newStatus === 'Reprovado'
                ? `Reprovado no balcão: ${reason || 'Não conforme para esterilização'}`
                : k.notes
          };
        }
        return k;
      })
    );
    showToast(
      newStatus === 'Reprovado'
        ? `Solicitação do kit reprovada com sucesso.`
        : `Status do kit atualizado para: ${newStatus}`
    );
  };

  // Delete/Cancel kit handler
  const handleDeleteKit = (kitId: string) => {
    setKits(kits.filter((k) => k.id !== kitId && k.code !== kitId));
    showToast(`Kit cancelado/removido do sistema.`);
  };

  // Sterilize kit handler
  const handleSterilizeKit = (kitId: string) => {
    const today = new Date().toLocaleDateString('pt-BR');
    setKits(
      kits.map((k) => {
        if (k.id === kitId || k.code === kitId) {
          return {
            ...k,
            status: 'Ready',
            validityDays: 15,
            cyclesLogged: k.cyclesLogged + 1,
            lastSterilized: today,
            marmitasWithdrawn: 0,
            pacotesWithdrawn: 0
          };
        }
        return k;
      })
    );

    // Remove from alerts if present
    setAlerts(alerts.filter((a) => a.kitId !== kitId && a.id !== kitId));
    showToast(`Esterilização concluída com sucesso! Validade renovada para 15 dias.`);
  };

  // Queue restock handler
  const handleQueueRestock = (kitId: string) => {
    handleSterilizeKit(kitId);
    showToast(`Kit encaminhado para o setor de limpeza e esterilização.`);
  };

  // Send kit to sterilization from student handler
  const handleSendKitToCME = (kitId: string) => {
    setKits(
      kits.map((k) => {
        if (k.id === kitId || k.code === kitId) {
          return {
            ...k,
            status: 'Decontaminated',
            lastSterilized: 'Em esterilização',
            notes: 'Entregue pelo acadêmico. Em processo de esterilização.'
          };
        }
        return k;
      })
    );
    showToast(`Kit entregue com sucesso no setor de esterilização.`);
  };

  // Execute transaction (Withdrawal or Return)
  const handleExecuteTransaction = ({
    studentGrr,
    kitId,
    type,
    withdrawnMarmitas,
    withdrawnPacotes
  }: {
    studentGrr: string;
    kitId: string;
    type: 'Withdrawal' | 'Return';
    withdrawnMarmitas?: number;
    withdrawnPacotes?: number;
  }) => {
    const matchedStudent = students.find(
      (s) => s.grr === studentGrr || s.code === studentGrr
    );
    const matchedKit = kits.find(
      (k) => k.code.toLowerCase() === kitId.toLowerCase() || k.id === kitId
    );

    const currentTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const totalM = matchedKit?.marmitasCount ?? 1;
    const totalP = matchedKit?.pacotesCount ?? 0;
    const currentWithdrawnM = matchedKit?.marmitasWithdrawn || 0;
    const currentWithdrawnP = matchedKit?.pacotesWithdrawn || 0;

    let newWithdrawnM = currentWithdrawnM;
    let newWithdrawnP = currentWithdrawnP;
    let actionNotes = '';

    if (type === 'Withdrawal') {
      const toWithdrawM = withdrawnMarmitas !== undefined ? withdrawnMarmitas : Math.max(0, totalM - currentWithdrawnM);
      const toWithdrawP = withdrawnPacotes !== undefined ? withdrawnPacotes : Math.max(0, totalP - currentWithdrawnP);
      newWithdrawnM = Math.min(totalM, currentWithdrawnM + toWithdrawM);
      newWithdrawnP = Math.min(totalP, currentWithdrawnP + toWithdrawP);
      actionNotes = `Retirada: ${toWithdrawM} marmita(s) e ${toWithdrawP} pacote(s).`;
    } else {
      const toReturnM = withdrawnMarmitas !== undefined ? withdrawnMarmitas : currentWithdrawnM;
      const toReturnP = withdrawnPacotes !== undefined ? withdrawnPacotes : currentWithdrawnP;
      newWithdrawnM = Math.max(0, currentWithdrawnM - toReturnM);
      newWithdrawnP = Math.max(0, currentWithdrawnP - toReturnP);
      actionNotes = `Devolução: ${toReturnM} marmita(s) e ${toReturnP} pacote(s).`;
    }

    const isFullyWithdrawn = (newWithdrawnM >= totalM) && (newWithdrawnP >= totalP);
    const isNoneWithdrawn = (newWithdrawnM === 0) && (newWithdrawnP === 0);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      timestamp: `${currentTime}`,
      action: type,
      kitId: matchedKit ? matchedKit.code : kitId,
      kitName: matchedKit ? matchedKit.name : undefined,
      grrCode: matchedStudent ? matchedStudent.grr : studentGrr,
      studentName: matchedStudent ? matchedStudent.name : undefined,
      status: type === 'Withdrawal' ? (isFullyWithdrawn ? 'IN USE' : 'STERILE') : 'STERILE',
      withdrawnMarmitas: withdrawnMarmitas,
      withdrawnPacotes: withdrawnPacotes,
      notes: actionNotes
    };

    setTransactions([newTx, ...transactions]);

    // Update kit status
    if (matchedKit) {
      setKits(
        kits.map((k) => {
          if (k.id === matchedKit.id) {
            return {
              ...k,
              marmitasWithdrawn: newWithdrawnM,
              pacotesWithdrawn: newWithdrawnP,
              status: isFullyWithdrawn ? 'In Use' : 'Ready',
              assignedTo: isNoneWithdrawn ? undefined : (matchedStudent?.code || 'ACAD'),
              assignedStudentName: isNoneWithdrawn ? undefined : matchedStudent?.name,
              checkoutTime: isNoneWithdrawn ? undefined : (k.checkoutTime || currentTime)
            };
          }
          return k;
        })
      );
    }

    // Update student current possession
    if (matchedStudent) {
      setStudents(
        students.map((s) => {
          if (s.id === matchedStudent.id) {
            if (type === 'Withdrawal') {
              return {
                ...s,
                currentPossession: {
                  kitName: matchedKit?.name || `Marmita ${kitId}`,
                  since: `Hoje às ${currentTime}`,
                  items: matchedKit?.items || ['Instrumentais Cirúrgicos', 'Fita Indicadora Classe 5']
                }
              };
            } else {
              return {
                ...s,
                currentPossession: undefined,
                history: [
                  {
                    id: `h-${Date.now()}`,
                    equipmentName: matchedKit?.name || `Marmita ${kitId}`,
                    timeframe: `Devolvido hoje às ${currentTime}`,
                    note: 'Devolução íntegra. Encaminhado ao expurgo.'
                  },
                  ...s.history
                ]
              };
            }
          }
          return s;
        })
      );
    }

    showToast(
      `Protocolo confirmado: ${type === 'Withdrawal' ? 'Retirada' : 'Devolução'} de ${
        matchedKit?.name || kitId
      } para ${matchedStudent?.name || studentGrr}.`
    );
  };

  // Void transaction
  const handleVoidTransaction = (txId: string) => {
    setTransactions(transactions.filter((t) => t.id !== txId));
    showToast('Registro de transação estornado com sucesso.');
  };

  // Initiate Protocol routing from alerts
  const handleInitiateProtocol = (kitId: string) => {
    setCurrentTab('protocol');
    showToast(`Iniciando protocolo para ${kitId}. Conclua a validação do leitor óptico.`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewWithdrawal={() => setIsNewWithdrawalOpen(true)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        activeProfile={activeProfile}
      />

      {/* Main Layout Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 transition-all">
        {/* Top Sticky Header - Single place to switch users */}
        <Header
          onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          alerts={alerts}
          onOpenAlertProtocol={(alert) => handleInitiateProtocol(alert.kitId)}
          activeProfile={activeProfile}
          onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              kits={kits}
              students={students}
              alerts={alerts}
              onNavigateTab={setCurrentTab}
              onSelectStudent={(_stu) => {
                setCurrentTab('students');
              }}
            />
          )}

          {currentTab === 'students' && (
            <StudentManagementView
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              searchQuery={searchQuery}
              activeProfile={activeProfile}
            />
          )}

          {currentTab === 'inventory' && (
            <KitInventoryView
              kits={kits}
              onRegisterKit={handleRegisterKit}
              onSterilizeKit={handleSterilizeKit}
              onQueueRestock={handleQueueRestock}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'cme_station' && (
            <CMEStationView
              kits={kits}
              onSterilizeKit={handleSterilizeKit}
              onQueueRestock={handleQueueRestock}
              activeProfile={activeProfile}
            />
          )}

          {currentTab === 'reception' && (
            <ReceptionCounterView
              students={students}
              kits={kits}
              transactions={transactions}
              onExecuteTransaction={handleExecuteTransaction}
              onSendKitToCME={handleSendKitToCME}
              onUpdateKitStatus={handleUpdateKitStatus}
              activeProfile={activeProfile}
            />
          )}

          {(currentTab === 'student_space' || currentTab === 'student_available') && (
            <StudentPortalView
              currentTab={currentTab}
              activeProfile={activeProfile}
              students={students}
              kits={kits}
              onRegisterKit={handleRegisterKit}
              onSendKitToCME={handleSendKitToCME}
              onUpdateKitStatus={handleUpdateKitStatus}
              onDeleteKit={handleDeleteKit}
              onOpenNewWithdrawal={() => setIsNewWithdrawalOpen(true)}
              onExecuteTransaction={handleExecuteTransaction}
            />
          )}

          {currentTab === 'protocol' && (
            <WithdrawalProtocolView
              students={students}
              kits={kits}
              transactions={transactions}
              onExecuteTransaction={handleExecuteTransaction}
              onVoidTransaction={handleVoidTransaction}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              kits={kits}
              transactions={transactions}
              students={students}
              almoxarifadoReports={almoxarifadoReports}
            />
          )}

          {currentTab === 'help' && <HelpView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global New Withdrawal Modal */}
      <NewWithdrawalModal
        isOpen={isNewWithdrawalOpen}
        onClose={() => setIsNewWithdrawalOpen(false)}
        students={students}
        kits={kits}
        onSubmitWithdrawal={({ studentGrr, kitId }) => {
          handleExecuteTransaction({
            studentGrr,
            kitId,
            type: 'Withdrawal'
          });
        }}
      />

      {/* Multi-Profile Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        activeProfile={activeProfile}
        currentProfile={activeProfile}
        onSelectProfile={handleSelectProfile}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          id="system-toast"
          className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 duration-200"
        >
          <span className="material-symbols-outlined text-blue-400 text-[20px]">
            notifications_active
          </span>
          <span className="text-[13px] font-medium text-slate-100">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-[14px] cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
