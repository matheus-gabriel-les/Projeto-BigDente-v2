import React, { useState } from 'react';
import { docArticles, videoTutorials } from '../data/mockData';
import { DocArticle, VideoTutorial } from '../types';

export const HelpView: React.FC = () => {
  const [helpSearch, setHelpSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<DocArticle | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredArticles = docArticles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(helpSearch.toLowerCase()) ||
      art.summary.toLowerCase().includes(helpSearch.toLowerCase()) ||
      art.category.toLowerCase().includes(helpSearch.toLowerCase());
    const matchesCategory = activeCategory ? art.category === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Search Section */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_20%_150%,#3b82f6_0%,transparent_50%)]" />
        <div className="relative z-10 w-full max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold uppercase tracking-wider mb-3 inline-block">
            Central de Suporte &amp; Procedimentos Operacionais Padrão (POP)
          </span>
          <h2 className="text-[30px] md:text-[36px] font-bold text-white mb-2 tracking-tight">
            Como podemos te orientar?
          </h2>
          <p className="text-[15px] text-slate-300 mb-6">
            Consulte manuais de esterilização, regras de retirada de marmitas e normas de biossegurança.
          </p>

          <div className="relative w-full shadow-lg">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[22px]">
              search
            </span>
            <input
              type="text"
              value={helpSearch}
              onChange={(e) => setHelpSearch(e.target.value)}
              placeholder="ex: 'Protocolo de esterilização', 'Registro de GRR', 'Descontaminação'..."
              className="w-full bg-white text-slate-900 border-0 rounded-2xl py-4 pl-12 pr-4 text-[15px] focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 shadow-xs transition-all"
            />
          </div>
        </div>
      </section>

      {/* Category Bento Grid */}
      <section>
        <div className="flex justify-between items-center mb-4 border-b border-slate-200/80 pb-2">
          <h3 className="text-[18px] font-semibold text-slate-900">Categorias de POPs e Tutoriais</h3>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="text-[12px] font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Limpar Filtro
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category 1 */}
          <div
            onClick={() =>
              setActiveCategory(activeCategory === 'Getting Started' ? null : 'Getting Started')
            }
            className={`bg-white border rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer ${
              activeCategory === 'Getting Started'
                ? 'border-blue-500 bg-blue-50/30'
                : 'border-slate-200/80'
            }`}
          >
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-3 text-blue-600">
              <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
            </div>
            <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Primeiros Passos
            </h4>
            <p className="text-[13px] text-slate-500 leading-snug">
              Configuração inicial do leitor de código de barras e login com perfil acadêmico ou técnico.
            </p>
          </div>

          {/* Category 2 */}
          <div
            onClick={() =>
              setActiveCategory(activeCategory === 'Common Issues' ? null : 'Common Issues')
            }
            className={`bg-white border rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer ${
              activeCategory === 'Common Issues'
                ? 'border-blue-500 bg-blue-50/30'
                : 'border-slate-200/80'
            }`}
          >
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-3 text-blue-600">
              <span className="material-symbols-outlined text-[24px]">build</span>
            </div>
            <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Solução de Dúvidas
            </h4>
            <p className="text-[13px] text-slate-500 leading-snug">
              Tratamento de marmitas com prazo vencido, falha de selagem ou divergência de instrumentais.
            </p>
          </div>

          {/* Category 3 */}
          <div
            onClick={() =>
              setActiveCategory(activeCategory === 'Video Tutorials' ? null : 'Video Tutorials')
            }
            className={`bg-white border rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer ${
              activeCategory === 'Video Tutorials'
                ? 'border-blue-500 bg-blue-50/30'
                : 'border-slate-200/80'
            }`}
          >
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-3 text-blue-600">
              <span className="material-symbols-outlined text-[24px]">video_library</span>
            </div>
            <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Vídeo Aulas
            </h4>
            <p className="text-[13px] text-slate-500 leading-snug">
              Demonstrações práticas gravadas em clínica sobre montagem e esterilização de bandejas.
            </p>
          </div>

          {/* Category 4 */}
          <div
            onClick={() =>
              setActiveCategory(activeCategory === 'Reports' ? null : 'Reports')
            }
            className={`bg-white border rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer ${
              activeCategory === 'Reports'
                ? 'border-blue-500 bg-blue-50/30'
                : 'border-slate-200/80'
            }`}
          >
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-3 text-blue-600">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <h4 className="text-[13px] font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Normas ANVISA
            </h4>
            <p className="text-[13px] text-slate-500 leading-snug">
              RDC 15 e conformidade com testes de fita indicadora Classe 5 e biológico semanal.
            </p>
          </div>
        </div>
      </section>

      {/* Asymmetric Content Area: Popular Articles & Video Tutorials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular Articles (Left Column - 1/3) */}
        <section className="lg:col-span-1">
          <h3 className="text-[18px] font-semibold text-slate-900 mb-4 border-b border-slate-200/80 pb-2">
            Manuais Mais Acessados
          </h3>
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <ul className="divide-y divide-slate-100">
              {filteredArticles.map((art) => (
                <li key={art.id}>
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="w-full text-left p-4 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 mt-0.5 text-[18px] transition-colors">
                        description
                      </span>
                      <div>
                        <h4 className="text-[14px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {art.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Atualizado em {art.updatedAt} • {art.readTime}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Video Tutorials Grid (Right Column - 2/3) */}
        <section className="lg:col-span-2">
          <h3 className="text-[18px] font-semibold text-slate-900 mb-4 border-b border-slate-200/80 pb-2">
            Vídeos de Treinamento Clínico
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {videoTutorials.map((vid) => (
              <div
                key={vid.id}
                onClick={() => setSelectedVideo(vid)}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden group cursor-pointer hover:border-slate-300 hover:shadow-md transition-all"
              >
                {/* Thumbnail Container with direct image link */}
                <div className="relative h-44 bg-slate-100 w-full overflow-hidden">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/15 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[48px] opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-md">
                      play_circle
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 text-white font-mono text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                    {vid.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                    {vid.category}
                  </span>
                  <h4 className="text-[15px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mt-2">
                    {vid.title}
                  </h4>
                  <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                    {vid.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                  {selectedArticle.category}
                </span>
                <h3 className="text-[17px] font-semibold text-slate-900 mt-1.5">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <p className="text-[13px] font-medium text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                {selectedArticle.summary}
              </p>

              <div className="space-y-2 pt-2">
                <h4 className="text-[12px] font-semibold text-slate-700 uppercase tracking-wider">
                  Etapas do Procedimento
                </h4>
                {selectedArticle.content.map((step, idx) => (
                  <p key={idx} className="text-[13px] text-slate-600 leading-relaxed">
                    {step}
                  </p>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                Revisado em {selectedArticle.updatedAt}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[12px] font-medium hover:bg-slate-800 cursor-pointer"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Simulation Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-[16px] font-semibold">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={selectedVideo.thumbnailUrl}
                alt={selectedVideo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-3 animate-pulse cursor-pointer shadow-lg">
                  <span className="material-symbols-outlined text-[32px] text-white">
                    play_arrow
                  </span>
                </div>
                <h4 className="text-[18px] font-bold drop-shadow-md">
                  Reprodução de Vídeo Instrucional
                </h4>
                <p className="text-[12px] text-blue-200 max-w-md mt-1 drop-shadow-sm">
                  Treinamento Clínico • Duração: {selectedVideo.duration}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-between items-center">
              <p className="text-[12px] text-slate-600">{selectedVideo.description}</p>
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[12px] font-medium hover:bg-slate-800 shrink-0 ml-4 cursor-pointer"
              >
                Fechar Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
