let currentAudio: HTMLAudioElement | null = null;
let lastTtsText = '';
let lastTtsTime = 0;
let globalLastPlayTime = 0;
let playToken: any = null;

const WAKEUP_THRESHOLD = 15000; // 15 seconds

const fileExistenceCache: Record<string, boolean> = {};

async function checkUrlExists(url: string): Promise<boolean> {
  if (url in fileExistenceCache) return fileExistenceCache[url];
  try {
    const res = await fetch(url, { method: 'HEAD' });
    fileExistenceCache[url] = res.ok;
    return res.ok;
  } catch {
    fileExistenceCache[url] = false;
    return false;
  }
}

async function getAudioUrl(text: string): Promise<string> {
  let targetGender = text.includes('ครับ') ? 'men' : ((text.includes('ค่ะ') || text.includes('คะ')) ? 'woman' : (Math.random() > 0.5 ? 'men' : 'woman'));
  
  const primaryUrl = `/sound/${text}-${targetGender}.mp3`;
  const secondaryUrl = `/sound/${text}-${targetGender === 'men' ? 'woman' : 'men'}.mp3`;
  
  if (await checkUrlExists(primaryUrl)) return primaryUrl;
  if (await checkUrlExists(secondaryUrl)) return secondaryUrl;
  
  return `/api/tts?text=${encodeURIComponent(text)}`;
}

export const playThaiTTS = (text: string) => {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (text === lastTtsText && now - lastTtsTime < 300) {
    return; // deduplicate rapid identical calls
  }
  lastTtsText = text;
  lastTtsTime = now;

  const currentToken = {};
  playToken = currentToken;

  (async () => {
    try {
      const url = await getAudioUrl(text);
      if (playToken !== currentToken) return;
      
      if (!currentAudio) {
        currentAudio = new Audio(url);
      } else {
        currentAudio.pause();
        currentAudio.src = url;
        currentAudio.load();
      }
      
      const playWithWakeUp = () => {
        if (!currentAudio) return;
        
        const needsWakeUp = now - globalLastPlayTime > WAKEUP_THRESHOLD;
        globalLastPlayTime = now;

        if (needsWakeUp) {
          // Play an invisible "wake up" sound using the same audio URL
          const wakeUpAudio = new Audio(url);
          wakeUpAudio.volume = 0.01; // Barely audible
          wakeUpAudio.play().catch(() => {});
          
          // Wait 500ms for hardware/Bluetooth to wake up, then play real audio
          setTimeout(() => {
            if (playToken !== currentToken) return;
            wakeUpAudio.pause();
            wakeUpAudio.removeAttribute('src');
            wakeUpAudio.load();
            
            if (!currentAudio) return;
            currentAudio.volume = 1;
            currentAudio.play().catch(handleError);
          }, 500);
        } else {
          currentAudio.volume = 1;
          currentAudio.play().catch(handleError);
        }
      };

      const handleError = (e: Error) => {
        if (e.name === 'AbortError') {
          return;
        }
        console.warn("Google TTS API playback failed, falling back to local speech synthesis:", e);
        fallbackTTS(text);
      };

      playWithWakeUp();
    } catch (e) {
      console.warn("Audio playback failed:", e);
      fallbackTTS(text);
    }
  })();
};

export const playThaiTTSAsync = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    
    const now = Date.now();
    if (text === lastTtsText && now - lastTtsTime < 300) {
      resolve(); // ignore rapid identical calls
      return;
    }
    lastTtsText = text;
    lastTtsTime = now;

    const currentToken = {};
    playToken = currentToken;

    (async () => {
      try {
        const url = await getAudioUrl(text);
        if (playToken !== currentToken) {
           resolve();
           return;
        }
        
        if (!currentAudio) {
          currentAudio = new Audio(url);
        } else {
          currentAudio.pause();
          currentAudio.src = url;
          currentAudio.load();
        }
        
        const handleEnded = () => {
          currentAudio?.removeEventListener('ended', handleEnded);
          currentAudio?.removeEventListener('error', handleFallback);
          resolve();
        };
        
        const handleFallback = () => {
          currentAudio?.removeEventListener('ended', handleEnded);
          currentAudio?.removeEventListener('error', handleFallback);
          fallbackTTSAsync(text).then(resolve).catch(() => resolve());
        };
        
        currentAudio.addEventListener('ended', handleEnded);
        currentAudio.addEventListener('error', handleFallback);

        const playWithWakeUp = () => {
          if (!currentAudio) return;
          
          const needsWakeUp = now - globalLastPlayTime > WAKEUP_THRESHOLD;
          globalLastPlayTime = now;

          if (needsWakeUp) {
            const wakeUpAudio = new Audio(url);
            wakeUpAudio.volume = 0.01;
            wakeUpAudio.play().catch(() => {});
            
            setTimeout(() => {
              if (playToken !== currentToken) {
                 resolve();
                 return;
              }
              wakeUpAudio.pause();
              wakeUpAudio.removeAttribute('src');
              wakeUpAudio.load();
              
              if (!currentAudio) return;
              currentAudio.volume = 1;
              currentAudio.play().catch(handleError);
            }, 500);
          } else {
            currentAudio.volume = 1;
            currentAudio.play().catch(handleError);
          }
        };

        const handleError = (e: Error) => {
          if (e.name === 'AbortError') {
            resolve();
            return;
          }
          console.warn("Google TTS API playback failed in async, falling back:", e);
          handleFallback();
        };
        
        playWithWakeUp();
      } catch (e) {
        console.warn("Audio playback failed async:", e);
        fallbackTTSAsync(text).then(resolve).catch(() => resolve());
      }
    })();
  });
};

const fallbackTTSAsync = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = 0.8;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
};

const fallbackTTS = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'th-TH';
  utterance.rate = 0.8;
  window.speechSynthesis.speak(utterance);
};

export const preloadThaiVoices = () => {
  // Local TTS preloading if fallback is needed
  if (typeof window === 'undefined') return;
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  } catch (e) {
    // ignore
  }
};
