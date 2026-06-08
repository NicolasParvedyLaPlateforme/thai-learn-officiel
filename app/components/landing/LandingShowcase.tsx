import { getTranslation, useTranslation } from '../../hooks/useTranslation';
import { useProgressStore } from '../../lib/store';
import { CheckCircle, BookOpen, Volume2, Smartphone, MessageCircle, Check, Type, Search, ChevronLeft, Star, Eye, Trophy, Crown, Mic, Play } from 'lucide-react';

export default function LandingShowcase() {
  const { t } = useTranslation();
  const { language } = useProgressStore();

  return (
    <section className="bg-slate-50 py-24 border-t border-slate-200 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-800">{t('landing.methodTitle')}</h2>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">{t('landing.methodDesc')}</p>
        </div>

        <div className="flex flex-col gap-24">
          
          {/* Showcase 1: Pair Matching */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-500 p-2 rounded-xl">
                  <CheckCircle size={24} />
                </div>
                {t('landing.pairMatchTitle')}
              </h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                {t('landing.pairMatchDesc')}
              </p>
            </div>
            <div className="flex-1 w-full max-w-md bg-white p-6 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform rotate-1 hover:rotate-0 transition-all">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem]">deux mois</div>
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem] text-xl">สอง</div>
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem]">deux</div>
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem] text-xl">หนึ่งปี</div>
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem]">un an</div>
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center min-h-[4.5rem] text-xl">สองเดือน</div>
                <div className="bg-slate-100 p-4 rounded-xl border-2 border-slate-200 text-center font-bold text-slate-400 flex items-center justify-center min-h-[4.5rem] opacity-50">dix</div>
                <div className="bg-indigo-100 p-4 rounded-xl border-2 border-indigo-300 border-b-4 text-center font-bold text-indigo-600 shadow-sm flex items-center justify-center min-h-[4.5rem] text-xl animate-pulse">สิบ</div>
              </div>
            </div>
          </div>

          {/* Showcase 2: Sentence Building */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="bg-fuchsia-100 text-fuchsia-500 p-2 rounded-xl">
                  <BookOpen size={24} />
                </div>
                {t('landing.sentenceTitle')}
              </h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                {t('landing.sentenceDesc')}
              </p>
            </div>
            <div className="flex-1 w-full max-w-lg bg-[#FAFAFA] p-8 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform -rotate-1 hover:rotate-0 transition-all flex flex-col items-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] bg-indigo-50 border-[6px] border-indigo-100 flex items-center justify-center text-4xl sm:text-5xl shadow-sm mb-4">
                🙏
              </div>
              <div className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight text-center relative w-fit mb-6">
                {t('landing.sentenceTrB1')}
                <div className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-slate-300 border-b border-dashed border-slate-400 opacity-50"></div>
                <div className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-transparent border-b border-dashed border-white opacity-50 translate-y-px"></div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-6 w-full max-w-xs cursor-pointer hover:bg-slate-100 transition-colors flex justify-between items-center px-4">
                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  💡 {getTranslation('auto.useful_vocabulary_2', language)}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"></path></svg>
              </div>

              <div className="border-t-2 border-b-2 border-slate-200 py-6 mb-8 min-h-[6rem] flex items-center justify-center gap-2 w-full">
                 <span className="text-slate-400 font-medium text-sm tracking-wide">{t('landing.formHere')}</span>
              </div>

              <div className="flex gap-3 justify-center w-full">
                 <div className="bg-white p-3 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer text-xl min-w-[5rem] font-thai">ขอบคุณ</div>
                 <div className="bg-white p-3 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer text-xl min-w-[5rem] font-thai">ค่ะ</div>
              </div>
            </div>
          </div>

          {/* Showcase 3: Audio comprehension */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="bg-sky-100 text-sky-500 p-2 rounded-xl">
                  <Volume2 size={24} />
                </div>
                {t('landing.audioTitle')}
              </h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                {t('landing.audioDesc')}
              </p>
            </div>
            <div className="flex-1 w-full max-w-md bg-white p-6 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform rotate-1 hover:rotate-0 transition-all flex flex-col items-center">
              <div className="w-24 h-24 bg-sky-500 rounded-3xl mb-8 flex items-center justify-center text-white border-b-[6px] border-sky-700 shadow-lg animate-pulse" style={{ animationDuration: '3s' }}>
                <Volume2 size={48} />
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 hover:-translate-y-1 transition-all cursor-pointer">
                  {t('landing.cat')}
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 hover:-translate-y-1 transition-all cursor-pointer">
                  {t('landing.dog')}
                </div>
                <div className="bg-sky-100 p-4 rounded-xl border-2 border-sky-400 border-b-4 text-center font-bold text-sky-700 scale-105 shadow-sm transition-all cursor-pointer">
                  {t('landing.bird')}
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 hover:-translate-y-1 transition-all cursor-pointer">
                  {t('landing.fish')}
                </div>
              </div>
            </div>
          </div>

          {/* Showcase 4: Writing */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="bg-rose-100 text-rose-500 p-2 rounded-xl">
                  <Smartphone size={24} />
                </div>
                {t('landing.writeTitle')}
              </h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                {t('landing.writeDesc')}
              </p>
            </div>
            <div className="flex-1 w-full max-w-lg bg-white p-8 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform -rotate-1 hover:rotate-0 transition-all flex flex-col">
              <div className="flex items-start gap-4 mb-6">
                 <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl">
                   ✍️
                 </div>
                 <div>
                   <h4 className="text-2xl font-bold text-slate-800">{t('landing.writeWord')}</h4>
                   <p className="text-lg text-slate-600 mt-1">{t('landing.one')}</p>
                   <p className="text-sm font-mono text-slate-500 mt-1">[<span className="bg-amber-100 text-amber-700 px-1 rounded">n</span>ùeng]</p>
                 </div>
              </div>

              <div className="flex gap-2 mb-6">
                <div className="bg-slate-50 px-6 py-4 rounded-2xl border-2 border-slate-200 flex items-center justify-center gap-1">
                  <span className="text-3xl text-orange-500 font-bold">ห</span>
                  <span className="text-3xl text-slate-300 font-bold opacity-50">น เ ่ ง</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 text-orange-800 text-sm flex gap-3 items-start shadow-sm">
                 <span className="text-lg">💡</span> {t('landing.consTip')}
              </div>

              <div className="border-t-2 border-b-2 border-slate-100 py-6 mb-8 flex items-center justify-center">
                 <span className="text-slate-400 font-medium">{t('landing.writeHere')}</span>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                 <div className="bg-white w-12 h-14 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center text-2xl hover:-translate-y-1 transition-transform cursor-pointer">น</div>
                 <div className="bg-white w-12 h-14 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center text-2xl hover:-translate-y-1 transition-transform cursor-pointer">ง</div>
                 <div className="bg-white w-12 h-14 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center text-2xl hover:-translate-y-1 transition-transform cursor-pointer">เ่</div>
                 <div className="bg-slate-100 w-12 h-14 rounded-xl border-2 border-slate-200 text-center font-bold text-slate-400 flex items-center justify-center text-2xl opacity-50">ห</div>
                 <div className="bg-white w-12 h-14 rounded-xl border-2 border-slate-200 border-b-4 text-center font-bold text-slate-700 shadow-sm flex items-center justify-center text-2xl hover:-translate-y-1 transition-transform cursor-pointer">-</div>
                 <div className="bg-slate-100 w-12 h-14 rounded-xl border-2 border-slate-200 text-center text-slate-400 flex items-center justify-center">⌫</div>
              </div>
            </div>
          </div>

          {/* Showcase 5: Discussions */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="bg-amber-100 text-amber-500 p-2 rounded-xl">
                  <MessageCircle size={24} />
                </div>
                {t('landing.discussTitle')}
              </h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                {t('landing.discussDesc')}
              </p>
            </div>
            <div className="flex-1 w-full max-w-md bg-white p-6 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform rotate-1 hover:rotate-0 transition-all flex flex-col">
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex-shrink-0 relative overflow-hidden">
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-400 rounded-t-full"></div>
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-400 rounded-full"></div>
                   </div>
                   <div className="bg-slate-100 p-4 rounded-3xl rounded-tl-sm border-2 border-slate-200">
                      <div className="w-24 h-3 bg-slate-300 rounded mb-2"></div>
                      <div className="w-16 h-3 bg-slate-300 rounded"></div>
                   </div>
                </div>
                
                <div className="flex gap-3 flex-row-reverse">
                   <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 flex-shrink-0 relative overflow-hidden">
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-orange-300 rounded-t-full"></div>
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-300 rounded-full"></div>
                   </div>
                   <div className="bg-orange-50 p-4 rounded-3xl rounded-tr-sm border-2 border-orange-200 shadow-[0_0_0_4px_rgba(251,146,60,0.3)]">
                      <div className="flex gap-1">
                         <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                         <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="mt-8 border-t-2 border-slate-100 pt-4 flex flex-col gap-2">
                 <div className="bg-emerald-50 border-2 border-b-4 border-emerald-400 rounded-xl p-3 text-emerald-900 font-bold flex justify-between items-center shadow-sm relative">
                    <span className="font-thai">{getTranslation('auto.sawatdee_kha', language)}</span>
                    <Check size={18} className="text-emerald-500" />
                 </div>
                 <div className="bg-white border-2 border-b-4 border-slate-200 rounded-xl p-3 text-slate-800 font-bold opacity-50 relative">
                    <span className="font-thai">{getTranslation('auto.khop_khun_kha', language)}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Showcase 6: Alphabet */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="bg-rose-100 text-rose-500 p-2 rounded-xl">
                  <Type size={24} />
                </div>
                {t('landing.alphaTitle')}
              </h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                {t('landing.alphaDesc')}
              </p>
            </div>
            <div className="flex-1 w-full max-w-lg flex items-center justify-center transform -rotate-2 hover:rotate-0 transition-all">
              <div className="w-64 h-64 rounded-3xl border-2 border-teal-200 bg-teal-100 shadow-xl overflow-hidden flex flex-col items-center justify-center p-4 relative font-sans">
                <div className="absolute top-3 left-0 right-0 text-center text-xs font-bold uppercase tracking-wider text-teal-600 opacity-80">
                   Mid Class
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center w-full relative">
                  <span className="text-8xl font-bold text-teal-600 opacity-20 absolute select-none pointer-events-none font-thai">
                    ก
                  </span>
                  <div className="z-10 text-center flex flex-col items-center justify-center h-full pt-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-28 h-28 rounded-full bg-white bg-opacity-60 border-2 border-dashed border-teal-200 flex items-center justify-center relative shadow-inner">
                            <span className="text-6xl absolute z-0 opacity-40 filter drop-shadow-sm mix-blend-multiply">🐔</span>
                            <span className="text-7xl font-medium text-teal-600 z-10 drop-shadow-md font-thai">ก</span>
                        </div>
                        <p className="text-[15px] font-semibold mt-1 text-teal-600 px-2 leading-tight text-center max-w-[90%] font-sans">
                          {getTranslation('auto.chicken', language)}
                        </p>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Showcase 7: Detective Game */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="bg-fuchsia-100 text-fuchsia-500 p-2 rounded-xl">
                  <Search size={24} />
                </div>
                {t('landing.detectiveTitle')}
              </h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                {t('landing.detectiveDesc')}
              </p>
            </div>
            <div className="flex-1 w-full max-w-lg bg-[#0F172A] rounded-[2rem] shadow-xl border-[6px] border-slate-100 transform rotate-2 hover:rotate-0 transition-all flex flex-col overflow-hidden">
              <div className="w-full h-56 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1000')] bg-cover bg-center opacity-90"></div>
                 <div className="absolute top-6 left-12 w-28 h-28 border-[3px] border-[#00D084] bg-[#00D084]/20 rounded-full"></div>
                 <div className="absolute bottom-4 right-4 w-24 h-24 border-[3px] border-[#00D084] bg-[#00D084]/20 rounded-full"></div>
              </div>
              
              <div className="bg-[#F8F6F0] p-4 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <ChevronLeft size={20} className="text-slate-600 cursor-pointer" />
                    <div className="flex flex-col">
                       <div className="flex gap-0.5 text-amber-400 mb-1">
                          <Star size={10} className="fill-amber-400" />
                          <Star size={10} className="fill-amber-400" />
                          <Star size={10} className="fill-amber-400" />
                          <Star size={10} className="fill-amber-400" />
                          <Star size={10} className="fill-amber-400" />
                       </div>
                       <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-slate-300 rounded-full overflow-hidden">
                             <div className="w-1/3 h-full bg-[#00D084] rounded-full"></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">2/6</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#00D084] rounded-full flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
                       <Volume2 size={20} />
                    </div>
                    <div className="flex flex-col items-center">
                       <div className="text-2xl font-bold text-slate-800 font-thai leading-none mb-1">หน้าต่าง</div>
                       <div className="bg-[#EAE4D3] text-slate-700 text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-[#E0D8C3] transition-colors">
                          <Eye size={10} />
                          Voir l'indice
                       </div>
                    </div>
                 </div>
                 
                 <div className="w-10 h-10 bg-[#38BDF8] rounded-full flex items-center justify-center text-white border-2 border-slate-800/10 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                    <Search size={18} />
                 </div>
              </div>
            </div>
          </div>

          {/* Showcase 8: Leaderboard */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="bg-amber-100 text-amber-500 p-2 rounded-xl">
                  <Trophy size={24} />
                </div>
                {t('landing.rankTitle')}
              </h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                {t('landing.rankDesc')}
              </p>
            </div>
            <div className="flex-1 w-full max-w-lg bg-white p-6 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform -rotate-1 hover:rotate-0 transition-all flex flex-col">
               <div className="flex flex-col gap-3">
                  {/* Rank 1 */}
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden shadow-sm">
                     <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber-200/50 to-transparent"></div>
                     <div className="w-8 text-center font-black text-amber-600 text-xl">1</div>
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-amber-300 relative">
                        🐯
                        <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                           <Crown size={12} fill="white" />
                        </div>
                     </div>
                     <div className="flex-1 font-bold text-slate-800">TigreThai</div>
                     <div className="font-black text-amber-500">12,450 XP</div>
                  </div>
                  
                  {/* Rank 2 */}
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
                     <div className="w-8 text-center font-bold text-slate-400 text-lg">2</div>
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-slate-300">
                        🐘
                     </div>
                     <div className="flex-1 font-bold text-slate-700">Elephanthai</div>
                     <div className="font-bold text-slate-500">10,200 XP</div>
                  </div>
                  
                  {/* Rank 3 (User) */}
                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden shadow-sm transform scale-[1.02]">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                     <div className="w-8 text-center font-bold text-indigo-600 text-lg">3</div>
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-indigo-300">
                        👤
                     </div>
                     <div className="flex-1 font-bold text-indigo-900">Vous</div>
                     <div className="font-bold text-indigo-600 flex items-center gap-1">
                        9,850 XP <span className="text-xs bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded font-bold">+50</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Showcase 9: Pronunciation */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3">
                <div className="bg-orange-100 text-orange-500 p-2 rounded-xl">
                  <Mic size={24} />
                </div>
                {t('landing.pronunciationTitle')}
              </h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                {t('landing.pronunciationDesc')}
              </p>
            </div>
            <div className="flex-1 w-full max-w-lg bg-[#FAFAFA] p-8 rounded-[2.5rem] shadow-xl border-[6px] border-slate-100 transform rotate-1 hover:rotate-0 transition-all flex flex-col items-center">
               <div className="w-full flex justify-between text-xs font-bold text-slate-400 mb-2 px-1">
                  <span>0 / 33</span>
                  <span>0%</span>
               </div>
               <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full mb-10">
                  <div className="w-0 h-full bg-blue-500 rounded-full"></div>
               </div>
               <div className="w-full bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-slate-200 p-8 flex flex-col items-center relative mb-12">
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors">
                     <Play size={14} className="ml-0.5" />
                  </div>
                  
                  <div className="text-5xl font-thai text-slate-800 mb-5 mt-2">สบายดี</div>
                  <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded font-mono text-sm mb-4">sà-baai dii</div>
                  <div className="text-slate-600 font-medium">je vais bien</div>
               </div>
               
               <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#F97316] rounded-full flex items-center justify-center text-white border-b-[4px] border-[#C2410C] shadow-md cursor-pointer hover:translate-y-1 hover:border-b-0 transition-all mb-4">
                     <Mic size={28} />
                  </div>
                  <p className="text-center text-[11px] text-slate-400 max-w-[220px] leading-tight">
                     Appuyez sur le micro et lisez le mot thaï à voix haute et clairement.
                  </p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
