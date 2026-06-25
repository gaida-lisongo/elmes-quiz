"use client";

import React, { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { PlusIcon, PencilIcon, TrashBinIcon } from "@/icons";
import KatexRenderer from "@/components/common/KatexRenderer";
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkDeleteQuestions,
  bulkToggleStatus,
  importQuizCsv,
  exportQuestionsCsv,
} from "@/app/actions/quiz.actions";
import { uploadToCloudinary } from "@/app/actions/cloudinary.actions";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import VisualMathInput from "@/components/moderator/VisualMathInput";
import type { QuizOutput } from "@/app/actions/quiz.actions";

const LEVELS = [
  { value: 0, label: "Débutant" },
  { value: 1, label: "Intermédiaire" },
  { value: 2, label: "Avancé" },
  { value: 3, label: "Expert" },
];

interface QuestionsClientProps {
  categorieId: string;
  designation: string;
  slug: string;
}

/* ================================================================
   QUIZ CARD — Design amélioré
   ================================================================ */
interface QuizCardProps {
  question: QuizOutput;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({
  question, selected, onToggleSelect, onEdit, onDelete, onToggleStatus,
}) => {
  const hasAssets = !!question.assets;

  return (
    <div
      className={`relative group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
        selected
          ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
          : "shadow-sm hover:shadow-xl dark:shadow-gray-900/30"
      } ${hasAssets ? "min-h-[280px]" : "bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 min-h-[240px]"}`}
    >
      {/* Image de fond — ne bloque pas les clics */}
      {hasAssets && (
        <div className="absolute inset-0 pointer-events-none">
          <Image src={question.assets!} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 pointer-events-none" />
        </div>
      )}

      {/* Checkbox en haut à gauche */}
      <div className="absolute top-3 left-3 z-20">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
          className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer pointer-events-auto"
        />
      </div>

      {/* Badges en haut à droite */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm pointer-events-none">
          {question.type}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 pointer-events-auto ${
            question.status
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
              : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}
          type="button"
        >
          {question.status ? "Actif" : "Inactif"}
        </button>
      </div>

      {/* Énoncé centré en gros — compatible mathématiques */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-5 py-10 text-center">
        <div className={`text-lg font-bold leading-relaxed break-words max-w-full ${
          hasAssets ? "text-white drop-shadow-lg" : "text-gray-800 dark:text-white/90"
        }`}>
          <KatexRenderer
            content={question.enonce}
            className="!text-inherit !font-bold !leading-relaxed"
          />
        </div>
      </div>

      {/* Boutons d'action en bas, côte à côte */}
      <div className="relative z-20 flex border-t border-gray-100 dark:border-gray-700/50">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors active:scale-95 pointer-events-auto"
          type="button"
          title="Modifier"
        >
          <PencilIcon className="w-3.5 h-3.5" />
          Modifier
        </button>
        <div className="w-px bg-gray-100 dark:bg-gray-700/50 pointer-events-none" />
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors active:scale-95 pointer-events-auto"
          type="button"
          title="Supprimer"
        >
          <TrashBinIcon className="w-3.5 h-3.5" />
          Supprimer
        </button>
      </div>

      {/* Ligne décorative — ne bloque pas les clics */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r pointer-events-none ${
        question.status
          ? "from-brand-500 via-brand-400 to-brand-500"
          : "from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600"
      }`} />
    </div>
  );
};

/* ── Inline Question Form ── */
function QuestionInlineForm({ isOpen, onClose, onSuccess, categorieId, editData }: {
  isOpen: boolean; onClose: () => void; onSuccess: () => void; categorieId: string; editData?: QuizOutput | null;
}) {
  const [enonce, setEnonce] = useState("");
  const [a1, setA1] = useState(""); const [a2, setA2] = useState("");
  const [a3, setA3] = useState(""); const [a4, setA4] = useState("");
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [type, setType] = useState<"QCM" | "VRAI_FAUX">("QCM");
  const [assets, setAssets] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState<"latex" | "mathlive">("latex"); // Mode de saisie par défaut
  const fileRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (editData) {
        const assertions = editData.assertions ?? [];
        setEnonce(editData.enonce);
        setA1(assertions[0] ?? ""); setA2(assertions[1] ?? "");
        setA3(assertions[2] ?? ""); setA4(assertions[3] ?? "");
        setLevel(editData.level); setType(editData.type);
        setAssets(editData.assets ?? "");
        // Détermine l'index de la bonne réponse parmi les assertions
        const idx = assertions.findIndex((a) => a === editData.reponse);
        setCorrectIndex(idx >= 0 ? idx : null);
      } else {
        setEnonce(""); setA1(""); setA2(""); setA3(""); setA4("");
        setCorrectIndex(null); setLevel(0); setType("QCM"); setAssets("");
      }
      setError("");
    }
  }, [isOpen, editData]);

  // Quand on passe en VRAI_FAUX, on garde seulement A/B et on réinitialise la réponse
  React.useEffect(() => {
    if (type === "VRAI_FAUX") {
      setA3(""); setA4("");
      if (correctIndex === 2 || correctIndex === 3) setCorrectIndex(null);
    }
  }, [type, correctIndex]);

  const assertions = type === "QCM"
    ? [a1.trim(), a2.trim(), a3.trim(), a4.trim()]
    : [a1.trim(), a2.trim()];

  const reponse = correctIndex !== null ? assertions[correctIndex] : "";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadToCloudinary(formData);
      if (result.success) {
        setAssets(result.url);
      } else {
        setError(result.error || "Échec de l'upload");
      }
    } catch (err: any) {
      setError(err.message || "Erreur upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enonce.trim()) { setError("L'énoncé est obligatoire."); return; }
    if (assertions.some((a) => !a)) { setError("Toutes les assertions doivent être remplies."); return; }
    if (!reponse.trim()) { setError("Cochez la réponse correcte."); return; }
    setLoading(true); setError("");
    try {
      const payload = { categorieId, enonce: enonce.trim(), assertions, reponse: reponse.trim(), level, type, assets: assets.trim() || undefined };
      const result = editData ? await updateQuestion(editData._id, payload) : await createQuestion(payload);
      if (!result.success) { setError(result.error || "Erreur."); return; }
      onSuccess(); onClose();
    } catch (err: any) { setError(err.message || "Erreur inattendue."); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const assertionFields = [
    { label: "Assertion A", value: a1, set: setA1 },
    { label: "Assertion B", value: a2, set: setA2 },
    ...(type === "QCM" ? [
      { label: "Assertion C", value: a3, set: setA3 },
      { label: "Assertion D", value: a4, set: setA4 },
    ] : []),
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {editData ? "Modifier la question" : "Nouvelle question"}
        </h2>
        <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">Fermer</button>
      </div>
      {error && <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Type</Label>
            <select value={type} onChange={(e) => setType(e.target.value as "QCM" | "VRAI_FAUX")}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <option value="QCM">QCM</option><option value="VRAI_FAUX">Vrai / Faux</option>
            </select>
          </div>
          <div>
            <Label>Niveau</Label>
            <select value={level} onChange={(e) => setLevel(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Colonne énoncé */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Énoncé</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Mode de saisie :</span>
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setInputMode("latex")}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${inputMode === "latex" ? "bg-brand-500 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                  >
                    LaTeX
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("mathlive")}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${inputMode === "mathlive" ? "bg-brand-500 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
                  >
                    Éditeur visuel
                  </button>
                </div>
              </div>
            </div>
            <VisualMathInput
              label=""
              value={enonce}
              onChange={setEnonce}
              minHeight="120px"
              placeholder={inputMode === "latex" ? "Saisissez du LaTeX pur (ex: $x^2 + 2x + 1 = 0$ ou \\frac{a}{b})" : "Saisissez votre expression mathématique..."}
              mode={inputMode}
            />

            {/* Upload image */}
            <div>
              <Label>Illustration</Label>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-600 transition-colors"
                >
                  {uploading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-brand-500 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {uploading ? "Upload en cours..." : "Choisir une image"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                {assets && (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                    <Image src={assets} alt="illustration" fill className="object-cover" />
                  </div>
                )}
              </div>
              <input type="text" value={assets} onChange={(e) => setAssets(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300" />
            </div>
          </div>

          {/* Colonne assertions */}
          <div className="space-y-3">
            <Label>Assertions — cochez la bonne réponse</Label>
            {assertionFields.map((field, idx) => (
              <div key={field.label} className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${correctIndex === idx ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"}`}>
                <input
                  type="radio"
                  name="correct-answer"
                  checked={correctIndex === idx}
                  onChange={() => setCorrectIndex(idx)}
                  className="mt-2 h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{field.label}</span>
                  <VisualMathInput value={field.value} onChange={field.set} minHeight="48px" mode={inputMode} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            ← Retour à la liste
          </button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? "..." : editData ? "Modifier" : "Créer"}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ── Import CSV Modal ── */
function ImportCsvModal({ isOpen, onClose, onSuccess, categorieId }: {
  isOpen: boolean; onClose: () => void; onSuccess: () => void; categorieId: string;
}) {
  const [csvText, setCsvText] = useState("");
  const [level, setLevel] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; errors?: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { const r = new FileReader(); r.onload = (ev) => setCsvText((ev.target?.result as string) ?? ""); r.readAsText(f); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!csvText.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await importQuizCsv({ categorieId, level, csvContent: csvText });
      setResult(res); if (res.success) setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: any) { setResult({ success: false, errors: [err.message] }); }
    finally { setLoading(false); }
  };

  const downloadTemplate = () => {
    const header = "énoncé,assertion1,assertion2,assertion3,assertion4,réponse,type";
    const example = "Quelle est la capitale de la France?,Paris,Londres,Berlin,Madrid,Paris,QCM";
    const blob = new Blob([header + "\n" + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "template_questions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl" showCloseButton>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="mb-2 text-lg font-semibold">Importer (CSV)</h2>
      <p className="mb-5 text-sm text-gray-500">
        Format : <code>énoncé,a1,a2,a3,a4,réponse,type</code>. Séparez simplement par des virgules.
      </p>
        {result && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${result.success ? "bg-success-50 text-success-600" : "bg-error-50 text-error-600"}`}>
            {result.count && <p>{result.count} question(s) importée(s).</p>}
            {result.errors && <ul className="mt-1 list-disc list-inside">{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Niveau</Label>
            <select value={level} onChange={(e) => setLevel(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Fichier CSV</Label>
            <input type="file" accept=".csv,.txt" onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-600" />
          </div>
          <div>
            <Label>Ou collez le contenu</Label>
            <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={6}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={downloadTemplate}>Télécharger le template</Button>
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading || !csvText.trim()}>{loading ? "..." : "Importer"}</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

/* ================================================================
   MAIN
   ================================================================ */
const QuestionsClient: React.FC<QuestionsClientProps> = ({ categorieId, designation, slug }) => {
  const [activeLevel, setActiveLevel] = useState(0);
  const [questions, setQuestions] = useState<QuizOutput[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuizOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<QuizOutput | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 30;

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const d = await getQuestions(categorieId, activeLevel); setQuestions(d); setSelectedIds(new Set()); setSelectAll(false); setCurrentPage(1); }
    catch {}
    finally { setLoading(false); }
  }, [categorieId, activeLevel]);

  React.useEffect(() => { fetch(); }, [fetch]);

  // Filtre par recherche
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredQuestions(questions);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredQuestions(questions.filter((item) => item.enonce.toLowerCase().includes(q)));
    }
    setCurrentPage(1);
    setSelectedIds(new Set());
    setSelectAll(false);
  }, [questions, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PER_PAGE));
  const paginated = filteredQuestions.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const toggleSelect = (id: string) => {
    setSelectedIds((p) => {
      const n = new Set(p);
      if (n.has(id)) { n.delete(id); return n; }
      n.add(id);
      return n;
    });
    setSelectAll(false);
  };
  const toggleSelectAll = () => {
    if (selectAll) { setSelectedIds(new Set()); setSelectAll(false); }
    else { setSelectedIds(new Set(paginated.map((q) => q._id))); setSelectAll(true); }
  };

  const bulkDel = async () => {
    if (!selectedIds.size || !window.confirm(`Supprimer ${selectedIds.size} question(s) ?`)) return;
    await bulkDeleteQuestions(Array.from(selectedIds)); await fetch();
  };
  const bulkToggle = async (st: boolean) => {
    if (!selectedIds.size) return; await bulkToggleStatus(Array.from(selectedIds), st); await fetch();
  };
  const doExport = async () => {
    if (!selectedIds.size) return;
    const r = await exportQuestionsCsv(Array.from(selectedIds));
    if (r.success && r.csv) {
      const b = new Blob([r.csv], { type: "text/csv" });
      const u = URL.createObjectURL(b); const a = document.createElement("a");
      a.href = u; a.download = `questions_${slug}_n${activeLevel}.csv`; a.click(); URL.revokeObjectURL(u);
    }
  };
  const confirmDel = async () => {
    if (!deleteId) return; setDeleteLoading(true); await deleteQuestion(deleteId); setDeleteId(null); setDeleteLoading(false); await fetch();
  };
  const toggleSt = async (q: QuizOutput) => { await updateQuestion(q._id, { status: !q.status }); await fetch(); };

  return (
    <div className="space-y-6">
      {/* ═══════════════════ BANNIÈRE avec boutons ═══════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(/images/categorie.jpg)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">{designation}</h1>
              <p className="mt-1 text-sm text-gray-200">Gérez les questions de cette catégorie.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!formOpen && (
                <>
                  <button onClick={() => { setEditQuestion(null); setFormOpen(true); }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-3.5 py-2 text-xs font-semibold text-brand-600 shadow-sm hover:bg-white hover:shadow-md active:scale-95 transition-all">
                    <PlusIcon className="w-3.5 h-3.5" /> Nouvelle
                  </button>
                  <button onClick={() => setImportOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 backdrop-blur-sm px-3.5 py-2 text-xs font-semibold text-white shadow-sm border border-white/30 hover:bg-white/30 active:scale-95 transition-all">
                    Importer CSV
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ FORMULAIRE INLINE ═══════════════════ */}
      {formOpen && (
        <QuestionInlineForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditQuestion(null); }}
          onSuccess={fetch}
          categorieId={categorieId}
          editData={editQuestion}
        />
      )}

      {/* ═══════════════════ TABS + RECHERCHE ═══════════════════ */}
      {!formOpen && (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm">
        <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex">
            {LEVELS.map((l) => (
              <button key={l.value} onClick={() => setActiveLevel(l.value)}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  activeLevel === l.value
                    ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}>
                {l.label}
              </button>
            ))}
          </div>
          <div className="px-4 py-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une question..."
              className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
        </div>

        {/* Toolbar actions groupées */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="checkbox"
                checked={selectAll && paginated.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                title="Tout sélectionner sur cette page"
              />
              <span className="text-xs text-gray-400 font-medium">{selectedIds.size} sélectionnée(s)</span>
              <button onClick={doExport} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">Exporter CSV</button>
              <button onClick={() => bulkToggle(true)} className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm hover:bg-emerald-100">Activer</button>
              <button onClick={() => bulkToggle(false)} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 shadow-sm">Désactiver</button>
              <button onClick={bulkDel} className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm">Supprimer</button>
            </div>
          )}
          {selectedIds.size === 0 && (
            <span className="text-xs text-gray-400">Sélectionnez des questions pour les actions groupées</span>
          )}
        </div>

        {/* Grille */}
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-400">
              <span className="w-5 h-5 mr-2 rounded-full border-2 border-gray-300 border-t-brand-500 animate-spin" />
              Chargement...
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-sm text-gray-400">
              <p className="mb-1">{searchQuery ? "Aucune question ne correspond à votre recherche." : "Aucune question pour ce niveau."}</p>
              {!searchQuery && <button onClick={() => { setEditQuestion(null); setFormOpen(true); }} className="text-brand-500 font-medium hover:text-brand-600">+ Créer la première question</button>}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginated.map((q) => (
                  <QuizCard key={q._id} question={q} selected={selectedIds.has(q._id)}
                    onToggleSelect={() => toggleSelect(q._id)} onEdit={() => { setEditQuestion(q); setFormOpen(true); }}
                    onDelete={() => setDeleteId(q._id)} onToggleStatus={() => toggleSt(q)} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    ← Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        page === currentPage
                          ? "bg-brand-500 text-white shadow-sm"
                          : "text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}

      <ImportCsvModal isOpen={importOpen} onClose={() => setImportOpen(false)} onSuccess={fetch} categorieId={categorieId} />
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} className="max-w-sm" showCloseButton>
        <div className="p-6 text-center">
          <TrashBinIcon className="w-10 h-10 mx-auto mb-3 text-error-500" />
          <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
          <p className="text-sm text-gray-500 mb-6">Cette action est irréversible.</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button onClick={confirmDel} disabled={deleteLoading}>{deleteLoading ? "..." : "Supprimer"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionsClient;