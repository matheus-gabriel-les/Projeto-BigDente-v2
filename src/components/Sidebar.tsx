import React from 'react';
import { TabType, UserProfile } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenNewWithdrawal?: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeProfile: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewWithdrawal,
  isMobileOpen,
  onCloseMobile,
  activeProfile
}) => {
  // All possible navigation items in PT-BR
  const allNavItems: Array<{ id: TabType; label: string; icon: string; roles: string[] }> = [
    { id: 'dashboard', label: 'Painel Geral', icon: 'dashboard', roles: ['admin'] },
    { id: 'students', label: 'Gestão de Alunos', icon: 'group', roles: ['admin'] },
    { id: 'inventory', label: 'Inventário Geral', icon: 'inventory', roles: ['admin'] },
    { id: 'reports', label: 'Relatórios & Auditoria', icon: 'analytics', roles: ['admin'] },
    { id: 'reception', label: 'Almoxarifado & Balcão', icon: 'verified_user', roles: ['receptionist'] },
    { id: 'protocol', label: 'Terminal Scanner', icon: 'receipt_long', roles: ['receptionist'] },
    { id: 'student_space', label: 'Meus Kits e Marmitas', icon: 'inventory_2', roles: ['student'] },
    { id: 'student_available', label: 'Kits Prontos para Retirada', icon: 'verified', roles: ['student'] },
  ];

  // Filter items according to active profile allowed tabs
  const filteredNavItems = allNavItems.filter((item) =>
    activeProfile?.allowedTabs ? activeProfile.allowedTabs.includes(item.id) : true
  );

  const handleNavClick = (tab: TabType) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#00113a]/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`bg-white text-slate-900 h-screen w-64 fixed left-0 top-0 border-r border-slate-200/90 flex flex-col py-4 px-3 z-50 transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-4 mt-1">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-blue-400 shadow-xs border border-slate-800">
            <span className="material-symbols-outlined text-[22px]">science</span>
          </div>
          <div>
            <h1 className="text-[19px] font-bold text-slate-900 tracking-tight leading-tight">
              LabControl
            </h1>
            <p className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Clínica Odontológica
            </p>
          </div>
        </div>

        {/* User Role Information in Sidebar (Read-only, no redundant switcher) */}
        <div className="mb-4 px-1">
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${activeProfile.badgeColor}`}>
                {activeProfile.roleLabel.split('/')[0]}
              </span>
            </div>
            <div className="text-[13px] font-bold text-slate-900 truncate">
              {activeProfile.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {activeProfile.studentGrr ? `GRR: ${activeProfile.studentGrr}` : activeProfile.department}
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-1">
          {filteredNavItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all text-left cursor-pointer ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/80 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? 'text-blue-600 icon-fill' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Navigation */}
        <div className="flex flex-col gap-1 border-t border-slate-200/80 pt-3 px-1 mt-auto">
          {activeProfile.allowedTabs.includes('settings') && (
            <button
              id="nav-settings"
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all text-left cursor-pointer ${
                currentTab === 'settings'
                  ? 'text-blue-600 bg-blue-50/80 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${currentTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}>settings</span>
              <span>Configurações</span>
            </button>
          )}

          <button
            id="nav-help"
            onClick={() => handleNavClick('help')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all text-left cursor-pointer ${
              currentTab === 'help'
                ? 'text-blue-600 bg-blue-50/80 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                currentTab === 'help' ? 'text-blue-600 icon-fill' : 'text-slate-400'
              }`}
            >
              help
            </span>
            <span>Ajuda &amp; Tutoriais</span>
          </button>
        </div>
      </aside>
    </>
  );
};
