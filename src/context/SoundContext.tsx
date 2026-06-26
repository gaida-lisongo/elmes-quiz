"use client";

import React, { createContext, useContext, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type SoundName = "correct" | "wrong" | "win" | "lose";

interface SoundContextValue {
  playSound: (name: SoundName) => void;
}

const SoundContext = createContext<SoundContextValue>({
  playSound: () => {},
});

// ═══════════════════════════════════════════════════════════════
// Provider — création LAZY des Audio (dans le geste utilisateur)
// ═══════════════════════════════════════════════════════════════

const SOUND_SRC: Record<SoundName, string> = {
  correct: "/sounds/game/correct.wav",
  wrong:   "/sounds/game/wrong.wav",
  win:     "/sounds/game/win.wav",
  lose:    "/sounds/game/lose.wav",
};

/** Nombre de clones par son pour permettre des déclenchements rapides */
const POOL_SIZE = 2;

export function SoundProvider({ children }: { children: React.ReactNode }) {
  // Map<SoundName, HTMLAudioElement[]>
  const cacheRef = useRef<Map<SoundName, HTMLAudioElement[]>>(new Map());

  const playSound = useCallback((name: SoundName) => {
    let pool = cacheRef.current.get(name);

    // Création lazy du pool (1ère fois = dans un clic → autoplay OK)
    if (!pool) {
      pool = [];
      for (let i = 0; i < POOL_SIZE; i++) {
        const a = new Audio(SOUND_SRC[name]);
        a.volume = 0.7;
        pool.push(a);
      }
      cacheRef.current.set(name, pool);
    }

    // Trouve un Audio libre, sinon recycle le premier
    const audio = pool.find((a) => a.paused) ?? pool[0];
    audio.currentTime = 0;
    audio.play().catch((e) => {
      // Log pour debug uniquement — ne pas avaler silencieusement
      console.warn(`[Sound] Impossible de jouer "${name}":`, e.message);
    });
  }, []);

  return (
    <SoundContext.Provider value={{ playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════

export function useSound(): SoundContextValue {
  return useContext(SoundContext);
}
