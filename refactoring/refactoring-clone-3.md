# Opportunité de refactoring : Fonction dupliquée

Trouvé dans 2 emplacements différents.

## Emplacement 1
**Fichier :** `NicolasParvedyLaPlateforme-thai-learn-officiel-bfe663e/src/app/lesson/[id]/components/LessonClientPage.tsx`
**Lignes :** 380 - 409

```tsx
      generatorPromise.then(generated => {
        if (!generated || generated.length === 0) {
          console.error(`Exercises empty! ID: ${lesson.id}, Level: ${currentLevel}, partIndex: ${partIndex}, totalParts: ${totalParts}`);
          window.location.reload();
          return;
        }
        let finalExercises = generated;
        setInitialExercises(finalExercises);
        setEngineIndex(0);
        setEngineMistakes(0);
        setFailedDueToTime(false);
        const isBilanLesson = lesson.isReview || lesson.id?.startsWith('bilan-') || lesson.id?.includes('-bilan');
        if (isBilanLesson) {
          const time = (currentLevel + 1) * 2 * 60;
          setTimeLeft(time);
          setInitialTime(time);
        } else if (currentLevel === 10) {
          const time = 20 * 60;
          setTimeLeft(time);
          setInitialTime(time);
        } else {
          setTimeLeft(null);
          setInitialTime(null);
        }
        setStartTime(Date.now());
        setExercisesGeneratedFor({ id: lesson.id, level: currentLevel, partIndex, mode: currentMode });
      }).catch(e => {
        console.error("Failed to load exercises (likely cache mismatch):", e);
        window.location.reload();
      });
```

## Emplacement 2
**Fichier :** `NicolasParvedyLaPlateforme-thai-learn-officiel-bfe663e/src/app/lesson/[id]/components/LessonClientPage.tsx`
**Lignes :** 489 - 518

```tsx
    getExercisesServer(lesson.id, currentLevel, language, isPart ? partIndex : null, isPart ? totalParts : null).then(generated => {
      if (!generated || generated.length === 0) {
        console.error(`Exercises empty! ID: ${lesson.id}, Level: ${currentLevel}, partIndex: ${partIndex}, totalParts: ${totalParts}`);
        window.location.reload();
        return;
      }
      let finalExercises = generated;
      setInitialExercises(finalExercises);
      setEngineIndex(0);
      setEngineMistakes(0);
      setFailedDueToTime(false);
      const isBilanLesson = lesson.isReview || lesson.id?.startsWith('bilan-') || lesson.id?.includes('-bilan');
      if (isBilanLesson) {
        const time = (currentLevel + 1) * 2 * 60;
        setTimeLeft(time);
        setInitialTime(time);
      } else if (currentLevel === 10) {
        const time = 20 * 60;
        setTimeLeft(time);
        setInitialTime(time);
      } else {
        setTimeLeft(null);
        setInitialTime(null);
      }
      setStartTime(Date.now());
      setExercisesGeneratedFor({ id: lesson.id, level: currentLevel, partIndex });
    }).catch(e => {
      console.error("Failed to load exercises (likely cache mismatch):", e);
      window.location.reload();
    });
```

