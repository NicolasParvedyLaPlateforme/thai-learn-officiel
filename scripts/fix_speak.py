import sys

with open('c:/xampp/htdocs/thai-learn-officiel/app/components/speak/SpeakDesktopTimeline.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

keep_lines = lines[:204]

keep_lines.append("              )}\n")
keep_lines.append("            </motion.div>\n")
keep_lines.append("          )\n")
keep_lines.append("        })}\n\n")

next_unit_code = r"""        {nextUnit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative flex items-center w-full z-10 gap-6 md:gap-8 min-h-[8.5rem] py-3 cursor-pointer group mt-4 mb-16"
            onClick={() => handleUnitSelect(activeUnitIndex + 1)}
          >
            <div className="relative shrink-0 py-6 z-10">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-white border-[4px] border-[#FAFAFA] flex items-center justify-center shadow-sm group-hover:scale-105 group-active:scale-95 transition-all ${nextUnit.colorClass || 'bg-rose-500'} text-white`}>
                <BookOpen size={32} className="fill-current" />
              </div>
            </div>

            <div className="flex-1 rounded-[1.5rem] border-2 border-slate-100 border-b-[4px] p-5 md:p-6 bg-white flex flex-col justify-center shadow-sm group-hover:border-slate-200 group-hover:-translate-y-1 group-active:border-b-2 group-active:translate-y-0 transition-all">
              <span className={`text-xs font-black uppercase tracking-wider mb-1 ${nextUnit.textClass || 'text-slate-500'}`}>
                {getTranslation('auto.next_unit', language)}
              </span>
              <h3 className="text-xl font-extrabold text-slate-700 leading-tight">
                {getLocalizedField(nextUnit, 'title', language)}
              </h3>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
"""

with open('c:/xampp/htdocs/thai-learn-officiel/app/components/speak/SpeakDesktopTimeline.tsx', 'w', encoding='utf-8') as f:
    f.writelines(keep_lines)
    f.write(next_unit_code)
