import React, { useState } from 'react';
import { Student, UserProfile } from '../types';

interface StudentManagementViewProps {
  students: Student[];
  onAddStudent: (newStudent: Omit<Student, 'id' | 'avatarInitials' | 'history'>) => void;
  onUpdateStudent: (student: Student) => void;
  searchQuery: string;
  activeProfile?: UserProfile;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  searchQuery,
  activeProfile
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'stu-1'
  );
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grr: '',
    code: '',
    course: 'Odontologia - 3º Ano Clínico',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grr.includes(searchQuery) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'ACTIVE'
        ? s.status === 'Active'
        : s.status === 'Inactive';

    return matchesSearch && matchesStatus;
  });

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.grr || !formData.code) return;

    onAddStudent({
      name: formData.name,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@aluno.odontologia.edu.br`,
      grr: formData.grr,
      code: formData.code.toUpperCase(),
      course: formData.course,
      status: formData.status
    });

    setFormData({
      name: '',
      email: '',
      grr: '',
      code: '',
      course: 'Odontologia - 3º Ano Clínico',
      status: 'Active'
    });
    setShowAddModal(false);
  };

  const getInitialColor = (initials: string) => {
    const colors = [
      'bg-blue-100 text-blue-900',
      'bg-teal-100 text-teal-900',
      'bg-slate-100 text-slate-800',
      'bg-indigo-100 text-indigo-900',
      'bg-purple-100 text-purple-900'
    ];
    const hash = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
    return colors[hash % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold uppercase tracking-wider">
              Secretaria &amp; Cadastro Clínico
            </span>
          </div>
          <h2 className="text-[26px] md:text-[30px] font-bold text-slate-900 tracking-tight">
            Gestão &amp; Diretório de Acadêmicos
          </h2>
          <p className="text-[14px] text-slate-500 mt-0.5">
            Cadastro de alunos, matrículas (GRR), permissões e controle de posse de marmitas.
          </p>
        </div>
        {(!activeProfile || activeProfile.role === 'admin') && (
          <button
            id="btn-add-new-student"
            onClick={() => setShowAddModal(true)}
            className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xs cursor-pointer active:scale-98 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px] text-blue-400">person_add</span>
            <span>Cadastrar Novo Aluno</span>
          </button>
        )}
      </div>

      {/* Bento Grid Layout (Data Table + Profile Details) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left/Main: Data Table Card (Spans 8 cols) */}
        <div className="xl:col-span-8 bg-white border border-slate-200/80 rounded-2xl flex flex-col overflow-hidden shadow-xs">
          {/* Table Header & Controls */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-slate-600 font-semibold tracking-wider uppercase">
                {students.filter((s) => s.status === 'Active').length} ALUNOS COM MATRÍCULA ATIVA
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-slate-500">Filtrar:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="text-[12px] font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-hidden cursor-pointer hover:border-slate-300"
              >
                <option value="ALL">Todos os Status</option>
                <option value="ACTIVE">Apenas Ativos</option>
                <option value="INACTIVE">Inativos / Trancados</option>
              </select>
            </div>
          </div>

          {/* Table Container (Scrollable) */}
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                <tr>
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Nome do Aluno
                  </th>
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    GRR (Matrícula)
                  </th>
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Posse Atual
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-700 divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const isSelected = selectedStudent?.id === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`transition-colors cursor-pointer border-l-4 ${
                        isSelected
                          ? 'bg-blue-50/60 border-l-blue-600 font-medium'
                          : 'hover:bg-slate-50/80 border-l-transparent'
                      }`}
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold ${getInitialColor(
                              s.avatarInitials
                            )}`}
                          >
                            {s.avatarInitials}
                          </div>
                          <span className="font-medium text-slate-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-500 text-[12px]">
                        {s.grr}
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-700 text-[12px] font-semibold">
                        {s.code}
                      </td>
                      <td className="py-3 px-5">
                        {s.status === 'Active' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200/60">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        {s.currentPossession ? (
                          <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                            <span className="material-symbols-outlined text-[16px]">medical_services</span>
                            <span className="font-mono text-[12px]">
                              {s.currentPossession.kitName.split(' ')[0]} {s.currentPossession.kitName.split(' ')[1] || ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Nenhuma</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Profile Details View (Spans 4 cols) */}
        {selectedStudent && (
          <div className="xl:col-span-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col overflow-hidden shadow-xs">
            {/* Profile Header */}
            <div className="relative p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-[20px] font-bold border border-blue-100 shadow-xs">
                  {selectedStudent.avatarInitials}
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-slate-500 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
                  title="Editar Dados"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>

              <div className="relative z-10">
                <h3 className="text-[18px] font-bold text-slate-900">
                  {selectedStudent.name}
                </h3>
                <p className="text-[13px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">mail</span>
                  <span>{selectedStudent.email}</span>
                </p>
                <p className="text-[12px] text-slate-500 mt-1">
                  {selectedStudent.course}
                </p>
              </div>

              {/* GRR & Code Monospace Grid */}
              <div className="flex gap-3 mt-4 relative z-10">
                <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    GRR (Matrícula)
                  </span>
                  <span className="block font-mono text-[13px] font-bold text-slate-900 mt-0.5">
                    {selectedStudent.grr}
                  </span>
                </div>
                <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Código Breve
                  </span>
                  <span className="block font-mono text-[13px] font-bold text-slate-900 mt-0.5">
                    {selectedStudent.code}
                  </span>
                </div>
              </div>
            </div>

            {/* Equipment History (Scrollable) */}
            <div className="flex-1 overflow-auto p-5 bg-white">
              <h4 className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-4">
                Histórico &amp; Posse de Materiais
              </h4>

              <div className="relative border-l-2 border-slate-200 ml-2 space-y-4 pb-4">
                {/* Current Possession (if any) */}
                {selectedStudent.currentPossession ? (
                  <div className="relative pl-5">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="bg-blue-50/40 border border-blue-100 p-3.5 rounded-xl shadow-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            Marmita em Posse Atual
                          </span>
                          <h5 className="text-[13px] font-semibold text-slate-900 mt-0.5">
                            {selectedStudent.currentPossession.kitName}
                          </h5>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {selectedStudent.currentPossession.since}
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {selectedStudent.currentPossession.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-full bg-blue-100/70 text-blue-800 font-medium text-[10px]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative pl-5 text-[12px] text-slate-400 italic">
                    Nenhuma marmita em posse no momento.
                  </div>
                )}

                {/* History list */}
                {selectedStudent.history.map((hist) => (
                  <div key={hist.id} className="relative pl-5">
                    <div className="absolute -left-[4px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 ring-3 ring-white" />
                    <div className="border border-slate-200/80 p-3 rounded-xl bg-slate-50/30 hover:bg-white transition-colors">
                      <h5 className="text-[13px] font-medium text-slate-900">
                        {hist.equipmentName}
                      </h5>
                      {hist.note && (
                        <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">✓ {hist.note}</p>
                      )}
                      <p className="font-mono text-[10px] text-slate-400 mt-1.5">
                        {hist.timeframe}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Register New Student */}
      {showAddModal && (
        <div
          id="add-student-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-[17px] font-semibold text-slate-900">Cadastrar Novo Aluno</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRegisterStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] text-slate-700 font-semibold mb-1">
                  Nome Completo do Aluno *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Mariana Costa Silva"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] text-slate-700 font-semibold mb-1">
                  E-mail Institucional
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="m.costa@aluno.odontologia.edu.br"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[12px] text-slate-700 font-semibold mb-1">
                    GRR (Matrícula - 8 Dígitos) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={formData.grr}
                    onChange={(e) =>
                      setFormData({ ...formData, grr: e.target.value.replace(/\D/g, '') })
                    }
                    placeholder="20230192"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-[13px] text-slate-900 tracking-widest focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                </div>

                <div className="w-32">
                  <label className="block text-[12px] text-slate-700 font-semibold mb-1">
                    Código (3 Letras) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
                      })
                    }
                    placeholder="MCS"
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-[13px] text-slate-900 text-center uppercase tracking-widest focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-slate-700 font-semibold mb-1">
                  Curso / Período Clínico
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="ex: Odontologia - Clínica Integrada 3º Ano"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                >
                  Salvar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
