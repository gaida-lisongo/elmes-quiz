import React from "react";
import katex from "katex";
import { formatMathString } from "@/lib/utils/mathFormatter";

interface MathRendererProps {
  /** Texte brut pouvant contenir des expressions mathématiques entre $ */
  content: string;
  /** Classes CSS additionnelles (optionnel) */
  className?: string;
  /** Nettoie automatiquement la chaîne via formatMathString */
  autoFormat?: boolean;
}

/**
 * Composant utilitaire pour afficher du texte contenant des expressions
 * mathématiques LaTeX (entre `$...$` pour inline ou `$$...$$` pour display).
 *
 * Utilise KaTeX directement pour éviter les problèmes de ReactMarkdown.
 *
 * @example
 * ```tsx
 * <MathRenderer content="Résoudre $x^2 + 4x + 4 = 0$" />
 * <MathRenderer content="$\frac{\pi}{2}$" className="text-lg" />
 * ```
 */
const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = "",
  autoFormat = true,
}) => {
  const processed = autoFormat ? formatMathString(content) : content;

  if (!processed) return null;

  // Fonction de rendu sécurisée avec KaTeX
  const renderWithKatex = (text: string) => {
    // Détecter les blocs $$...$$ (display math) et $...$ (inline math)
    // Utiliser une regex plus robuste qui gère les $ imbriqués
    const displayRegex = /\$\$([\s\S]*?)\$\$/g;
    const inlineRegex = /\$([^$]+)\$/g;

    let result = text;
    
    // Remplacer les display math
    result = result.replace(displayRegex, (match, math) => {
      try {
        return katex.renderToString(math, { displayMode: true, throwOnError: false });
      } catch (error) {
        console.warn("Erreur KaTeX display:", error, math);
        return `<span class="text-red-500">${match}</span>`;
      }
    });

    // Remplacer les inline math
    result = result.replace(inlineRegex, (match, math) => {
      try {
        return katex.renderToString(math, { displayMode: false, throwOnError: false });
      } catch (error) {
        console.warn("Erreur KaTeX inline:", error, math);
        return `<span class="text-red-500">${match}</span>`;
      }
    });

    return result;
  };

  const htmlContent = renderWithKatex(processed);

  return (
    <div 
      className={`prose dark:prose-invert max-w-none whitespace-pre-wrap break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{ maxWidth: "100%" }}
    />
  );
};

export default MathRenderer;