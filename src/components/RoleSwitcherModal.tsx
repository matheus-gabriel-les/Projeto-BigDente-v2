import React from 'react';
import { UserProfile } from '../types';
import { userProfiles } from '../data/mockData';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile?: UserProfile;
  currentProfile?: UserProfile;
  onSelectProfile: (profile: UserProfile) => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  currentProfile,
  onSelectProfile
}) => {
  if (!isOpen) return null;

  const current = activeProfile || currentProfile || userProfiles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[22px]">switch_account</span>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-slate-900">
                Alternar Perfil de Acesso &amp; Permissões
              </h3>
              <p className="text-[12px] text-slate-500">
                Selecione o perfil do usuário para experimentar a interface personalizada de cada função.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Profile List */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {userProfiles.map((profile) => {
            const isSelected = profile.id === current.id;
            return (
              <div
                key={profile.id}
                onClick={() => {
                  onSelectProfile(profile);
                  onClose();
                }}
                className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-100 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    {isSelected && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[11px] shadow-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-[15px] font-bold text-slate-900">{profile.name}</h4>
                      <span
                        className={`text-[10.5px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${profile.badgeColor}`}
                      >
                        {profile.roleLabel}
                      </span>
                    </div>
                    <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                      {profile.department} {profile.studentGrr && `• GRR: ${profile.studentGrr}`}
                    </p>
                    <p className="text-[12px] text-slate-600 mt-1 leading-relaxed max-w-md">
                      {profile.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <button
                    className={`px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? 'Perfil Ativo' : 'Entrar como'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-blue-600">verified_user</span>
            <span>Controle de Acesso Baseado em Funções (RBAC Clínico)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
