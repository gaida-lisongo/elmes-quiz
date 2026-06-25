"use client";

import React, { useRef, useEffect, useState } from "react";
import MathRenderer from "@/components/common/MathRenderer";

interface VisualMathInputProps {
  /** Texte LaTeX contrôlé */
  value: string;
  /** Callback appelé avec la nouvelle valeur LaTeX */
  onChange: (val: string) => void;
  /** Label affiché au-dessus du champ */
  label?: string;
  /** Placeholder affiché quand le champ est vide */
  placeholder?: string;
  /** Classes additionnelles */
  className?: string;
  /** Hauteur minimale du champ */
  minHeight?: string;
  /** Mode d'édition : 'mathlive' (éditeur visuel) ou 'latex' (textarea LaTeX pur) */
  mode?: "mathlive" | "latex";
}

/**
 * Convertit le LaTeX standard en format compatible MathLive
 * MathLive ne comprend pas certaines commandes comme \!, \mathrm, etc.
 */
function sanitizeForMathLive(latex: string): string {
  if (!latex) return "";
  
  return latex
    // Esp fines \! et \, → espaces simples
    .replace(/\\!/g, " ")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\:/g, " ")
    .replace(/\\>/g, " ")
    // \mathrm{texte} → \text{texte}
    .replace(/\\mathrm\{/g, "\\text{")
    // \displaystyle → rien (défaut dans MathLive)
    .replace(/\\displaystyle/g, "")
    // \limits → rien (géré automatiquement)
    .replace(/\\limits/g, "")
    // Réduire les espaces multiples
    .replace(/\s+/g, " ");
}

/**
 * Convertit le format MathLive en LaTeX standard
 * (MathLive génère déjà du LaTeX standard pour la plupart)
 */
function normalizeFromMathLive(latex: string): string {
  if (!latex) return "";
  return latex.trim();
}

/**
 * Éditeur mathématique avec deux modes :
 * - 'mathlive' : éditeur visuel WYSIWYG basé sur MathLive
 * - 'latex' : textarea LaTeX pur avec aperçu instantané
 *
 * Génère du LaTeX compatible avec notre composant MathRenderer (KaTeX).
 */
const VisualMathInput: React.FC<VisualMathInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "Saisissez votre expression mathématique...",
  className = "",
  minHeight = "56px",
  mode = "mathlive",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mathfieldRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Import dynamique de MathfieldElement seulement si mode mathlive
    const init = async () => {
      if (mode !== "mathlive") return;
      try {
        const { MathfieldElement } = await import("mathlive");
        if (!mounted) return;

        // Définir les options par défaut globalement une fois
        MathfieldElement.virtualKeyboardMode = "onfocus";
        MathfieldElement.virtualKeyboards = "numeric roman greek";
        MathfieldElement.locale = "fr";

        setReady(true);
      } catch (err) {
        console.error("[VisualMathInput] Erreur chargement MathLive:", err);
      }
    };

    init();
    return () => { mounted = false; };
  }, [mode]);

  // Attacher le MathfieldElement au conteneur après le render
  useEffect(() => {
    if (mode !== "mathlive" || !ready || !containerRef.current || !isClient) return;

    const container = containerRef.current;
    // Nettoyer l'ancien élément s'il existe
    container.innerHTML = "";

    const initMathfield = async () => {
      const { MathfieldElement } = await import("mathlive");

      const mf = new MathfieldElement();
      // Nettoyer le LaTeX pour MathLive
      mf.value = sanitizeForMathLive(value || "");
      mf.placeholder = placeholder;
      mf.classList.add(
        "w-full",
        "min-h-[56px]",
        "px-4",
        "py-2.5",
        "rounded-lg",
        "border",
        "border-gray-300",
        "bg-white",
        "text-sm",
        "text-gray-700",
        "focus:border-primary-500",
        "focus:outline-none",
        "dark:border-gray-700",
        "dark:bg-gray-800",
        "dark:text-gray-300",
        "dark:focus:border-primary-500",
        "transition-colors"
      );

      // Options du mathfield
      mf.mathfieldOptions = {
        virtualKeyboardMode: "onfocus",
        virtualKeyboards: "numeric roman greek",
        locale: "fr",
      };

      // Écouter les changements
      mf.addEventListener("input", () => {
        onChange(mf.value);
      });

      // Écouter le blur aussi (pour être sûr de capturer)
      mf.addEventListener("blur", () => {
        onChange(mf.value);
      });

      container.appendChild(mf);
      mathfieldRef.current = mf;
    };

    initMathfield();

    return () => {
      if (mathfieldRef.current && container.contains(mathfieldRef.current)) {
        container.removeChild(mathfieldRef.current);
      }
      mathfieldRef.current = null;
    };
  }, [ready, placeholder, isClient, mode, onChange]);

  // Mettre à jour la valeur si la prop change (édition)
  useEffect(() => {
    if (mode !== "mathlive" || !mathfieldRef.current || !isClient) return;
    const sanitizedValue = sanitizeForMathLive(value || "");
    if (mathfieldRef.current.value !== sanitizedValue) {
      mathfieldRef.current.value = sanitizedValue;
    }
  }, [value, isClient, mode]);

  // Si on n'est pas encore sur le client, on affiche un textarea temporaire
  if (!isClient) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${minHeight} px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-primary-500 transition-colors ${className}`}
        />
      </div>
    );
  }

  // Mode LaTeX pur : textarea avec aperçu
  if (mode === "latex") {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Saisissez du LaTeX pur (ex: $x^2 + 2x + 1 = 0$ ou \\frac&#123;a&#125;&#123;b&#125;)
          </span>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
          >
            {showPreview ? "Masquer l'aperçu" : "Aperçu"}
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${minHeight} px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-primary-500 transition-colors font-mono`}
        />
        {showPreview && value.trim() && (
          <div className="mt-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Aperçu :</div>
            <div className="min-h-[60px] p-3 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-700">
              <MathRenderer content={value} autoFormat={true} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mode MathLive
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div
        ref={containerRef}
        className="w-full"
        style={{ minHeight }}
      />
      {!ready && (
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span className="inline-block w-3 h-3 rounded-full border-2 border-gray-300 border-t-brand-500 animate-spin" />
          Chargement de l&apos;éditeur mathématique...
        </div>
      )}
    </div>
  );
};

export default VisualMathInput;