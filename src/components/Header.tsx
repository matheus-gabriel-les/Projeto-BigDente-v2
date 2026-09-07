import React, { useState } from 'react';
import { ActionAlert, UserProfile } from '../types';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  alerts: ActionAlert[];
  onOpenAlertProtocol: (alert: ActionAlert) => void;
  onOpenRoleSwitcher: () => void;
  activeProfile: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  searchQuery,
  onSearchChange,
  alerts,
  onOpenAlertProtocol,
  onOpenRoleSwitcher,
  activeProfile
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      id="app-topbar"
      className="bg-white text-slate-900 border-b border-slate-200/80 flex justify-between items-center w-full px-4 md:px-8 h-16 sticky top-0 z-30 flex-shrink-0"
    >
      {/* Left: Search Bar & Mobile Hamburger */}
      <div className="flex items-center flex-1 max-w-md gap-3">
        <button
          id="mobile-menu-toggle"
          aria-label="Abrir menu"
          onClick={onToggleMobileMenu}
          className="md:hidden text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[19px]">
            search
          </span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar GRR, aluno, marmita ou código..."
            className="w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-900 text-[13.5px] transition-all placeholder:text-slate-400 outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-[13px] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Notifications & Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 relative">
        {/* Notifications Button */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            aria-label="Notificações"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors relative cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <span className="text-[12px] font-semibold text-slate-800 uppercase tracking-wider">
                  Alertas Sanitários ({alerts.length})
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-700 text-[12px] font-medium cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-[13px] text-slate-500">
                    Nenhum alerta pendente. Todas as marmitas estão esterilizadas.
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3.5 hover:bg-slate-50 transition-colors border-l-4 border-l-rose-500 flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[12px] font-bold text-slate-900">
                          {alert.kitId}
                        </span>
                        <span className="bg-rose-50 text-rose-700 border border-rose-200/60 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase">
                          {alert.daysLeft === 0 ? 'Vencido Hoje' : `${alert.daysLeft} Dias Restantes`}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-snug">
                        {alert.reason}
                      </p>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          onOpenAlertProtocol(alert);
                        }}
                        className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 hover:underline self-start mt-1 cursor-pointer flex items-center gap-1"
                      >
                        <span>{alert.protocolAction}</span>
                        <span>→</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Account / Profile Switcher Pill */}
        <button
          id="user-profile-button"
          onClick={onOpenRoleSwitcher}
          className="flex items-center gap-2.5 hover:bg-slate-100 p-1.5 sm:pr-3 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          title="Clique para alternar o perfil de acesso"
        >
          <img
            src={activeProfile.avatarUrl}
            alt={activeProfile.name}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
          />
          <div className="hidden md:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-slate-900 leading-tight">
                {activeProfile.name}
              </span>
              <span className="material-symbols-outlined text-[15px] text-slate-400">expand_more</span>
            </div>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              {activeProfile.roleLabel.split('/')[0]}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
