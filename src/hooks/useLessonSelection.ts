import { useState, useRef, useCallback } from 'react';

export function useLessonSelection() {
  const [selectedLesson, _setSelectedLesson] = useState<{ lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string, initialScrollLevel?: number } | null>(null);
  const scrollPositionRef = useRef<number>(0);

  const setSelectedLesson = useCallback((lessonData: any) => {
    if (lessonData !== null && selectedLesson === null) {
      scrollPositionRef.current = window.scrollY;
      _setSelectedLesson(lessonData);
      window.history.replaceState(null, '', `#lesson-${lessonData.lesson.id}`);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
    } else if (lessonData === null && selectedLesson !== null) {
      _setSelectedLesson(null);
      window.history.replaceState(null, '', window.location.pathname);
      setTimeout(() => window.scrollTo({ top: scrollPositionRef.current, behavior: 'auto' }), 0);
    } else {
      _setSelectedLesson(lessonData);
      if (lessonData) {
        window.history.replaceState(null, '', `#lesson-${lessonData.lesson.id}`);
      }
    }
  }, [selectedLesson]);

  return { selectedLesson, setSelectedLesson };
}
