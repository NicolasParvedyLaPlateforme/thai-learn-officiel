import { getTranslation } from "@/hooks/useTranslation";

interface LessonSelectorProps {
  language: string;
  selectedLessonId: string | 'all';
  onLessonChange: (lessonId: string) => void;
  lessonsList: any[];
  completedLessons: string[];
}

export function LessonSelector({
  language,
  selectedLessonId,
  onLessonChange,
  lessonsList,
  completedLessons
}: LessonSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
        {getTranslation('auto.lesson_to_practice', language)}
      </h3>
      <select
        value={selectedLessonId}
        onChange={(e) => onLessonChange(e.target.value)}
        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
      >
        <option value="all">{getTranslation('auto.all_seen_lessons', language)}</option>
        {lessonsList.filter(l => completedLessons.includes(l.id)).map(lesson => (
          <option key={lesson.id} value={lesson.id}>
            {language === 'en' && lesson.titleEn ? lesson.titleEn : lesson.title}
          </option>
        ))}
      </select>
      {completedLessons.length === 0 && (
        <p className="text-amber-600 text-sm italic">{getTranslation('auto.you_need_to_complete_some_less', language)}</p>
      )}
    </div>
  );
}
