import React from "react";
import katex from "katex";
// CSS importé globalement dans globals.css
import { formatMathString } from "@/lib/utils/mathFormatter";

interface KatexRendererProps {
  /** Texte brut pouvant contenir des expressions mathématiques LaTeX */
  content: string;
  /** Classes CSS additionnelles (optionnel) */
  className?: string;
  /** Nettoie automatiquement la chaîne via formatMathString */
  autoFormat?: boolean;
}

/**
 * Rendu direct avec KaTeX (sans ReactMarkdown).
 * Évite les problèmes de balises HTML générées par rehype-katex.
 */
const KatexRenderer: React.FC<KatexRendererProps> = ({
  content,
  className = "",
  autoFormat = true,
}) => {
  const processed = autoFormat ? formatMathString(content) : content;

  if (!processed) return null;

  // Fonction de rendu sécurisée
  const renderWithKatex = (text: string) => {
    // Regex pour détecter les blocs mathématiques
    // $$...$$ pour display math et $...$ pour inline math
    // Utilisation de [\s\S] pour capturer tous les caractères y compris \n
    // et lazy matching (non-greedy) avec *?
    const displayRegex = /\$\$([\s\S]*?)\$\$/g;
    const inlineRegex = /\$([\s\S]*?)\$/g;

    let result = text;
    
    // Remplacer les display math d'abord (pour éviter conflit avec inline)
    result = result.replace(displayRegex, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { 
          displayMode: true,
          throwOnError: false 
        });
      } catch (error) {
        console.warn("Erreur KaTeX display:", error, math);
        return `<span style="color:red">${match}</span>`;
      }
    });

    // Remplacer les inline math
    result = result.replace(inlineRegex, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { 
          displayMode: false,
          throwOnError: false 
        });
      } catch (error) {
        console.warn("Erreur KaTeX inline:", error, math);
        return `<span style="color:red">${match}</span>`;
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

export default KatexRenderer;