import { useState, useRef, useCallback } from 'react';

export function useLessonSelection() {
  const [selectedLesson, _setSelectedLesson] = useState<{ lesson: any, isCompleted: boolean, unitColor: string, unitBorder: string, unitText: string, unitHover: string, initialScrollLevel?: number } | null>(null);
  const scrollPositionRef = useRef<number>(0);

  const setSelectedLesson = useCallback((lessonData: any) => {
    try {
      if (lessonData !== null && selectedLesson === null) {
        scrollPositionRef.current = typeof window !== 'undefined' ? window.scrollY : 0;
        _setSelectedLesson(lessonData);
        try {
          window.history.replaceState(null, '', `#lesson-${lessonData.lesson.id}`);
        } catch (e) {
          console.warn('history.replaceState failed:', e);
        }
      } else if (lessonData === null && selectedLesson !== null) {
        _setSelectedLesson(null);
        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch (e) {
          console.warn('history.replaceState failed:', e);
        }
      } else {
        _setSelectedLesson(lessonData);
        if (lessonData) {
          try {
            window.history.replaceState(null, '', `#lesson-${lessonData.lesson.id}`);
          } catch (e) {
            console.warn('history.replaceState failed:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error inside setSelectedLesson callback:', err);
    }
  }, [selectedLesson]);

  return { selectedLesson, setSelectedLesson };
}
