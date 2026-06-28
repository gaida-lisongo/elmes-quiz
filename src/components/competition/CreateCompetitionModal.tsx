'use client';

import React, { useState } from 'react';
import { createCompetition } from '@/app/actions/competition.actions';
import { getAllCategories } from '@/app/actions/categorie.actions';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import MultiSelect from '@/components/form/MultiSelect';
import { uploadToCloudinary } from '@/app/actions/cloudinary.actions';
import { useRouter } from 'next/navigation';

interface CreateCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryOption {
  value: string;
  text: string;
  selected: boolean;
}

export default function CreateCompetitionModal({ isOpen, onClose }: CreateCompetitionModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    designation: '',
    description: '',
    cagnotte: '',
    parties: '',
    image: '',
    selectedCategories: [] as string[],
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Load categories on mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getAllCategories();
        const options: CategoryOption[] = cats.map((cat) => ({
          value: cat._id,
          text: cat.designation,
          selected: false,
        }));
        setCategories(options);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoriesChange = (selected: string[]) => {
    setFormData((prev) => ({ ...prev, selectedCategories: selected }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5 Mo
    if (file.size > maxSize) {
      setImageError("L'image est trop volumineuse (max 5 Mo).");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Format non supporté. Utilisez JPG, PNG, WebP ou GIF.");
      return;
    }

    setImageError(null);
    setImageUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const result = await uploadToCloudinary(uploadFormData);
      if (result.success && result.url) {
        setFormData((prev) => ({ ...prev, image: result.url as string }));
      } else {
        setImageError(result.error || "Échec de l'upload.");
      }
    } catch {
      setImageError("Erreur réseau lors de l'upload.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImageError(null);
  };

  const nextStep = () => {
    if (step === 1 && !formData.designation.trim()) {
      setError('La désignation est obligatoire.');
      return;
    }
    if (step === 2 && (!formData.cagnotte || Number(formData.cagnotte) <= 0)) {
      setError('La cagnotte doit être un nombre positif.');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.designation.trim()) {
      setError('La désignation est obligatoire.');
      return;
    }
    if (!formData.cagnotte || Number(formData.cagnotte) <= 0) {
      setError('La cagnotte doit être un nombre positif.');
      return;
    }
    if (!formData.parties || Number(formData.parties) <= 0) {
      setError('Le nombre de parties doit être supérieur à 0.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createCompetition({
        designation: formData.designation,
        description: formData.description,
        cagnotte: Number(formData.cagnotte),
        categories: formData.selectedCategories,
        parties: Number(formData.parties),
        image: formData.image,
      });

      if (result.success) {
        router.refresh();
        onClose();
        setFormData({
          designation: '',
          description: '',
          cagnotte: '',
          parties: '',
          image: '',
          selectedCategories: [],
        });
        setStep(1);
      } else {
        setError(result.error || 'Erreur lors de la création.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {/* En-tête */}
        <div className="border-b border-gray-200 p-6 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Créer une compétition
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Indicateur d'étapes */}
          <div className="mt-4 flex items-center justify-center">
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${i === step
                      ? 'bg-brand-500 text-white'
                      : i < step
                        ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/30 dark:text-brand-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className={`h-1 w-12 ${i < step ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Étape {step} sur 3 : {step === 1 ? 'Informations de base' : step === 2 ? 'Configuration' : 'Finalisation'}
          </p>
        </div>

        {/* Contenu du formulaire */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-error-50 p-4 text-sm text-error-700 dark:bg-error-500/15 dark:text-error-400">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="designation">Désignation *</Label>
                <Input
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="Nom de la compétition"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description détaillée de la compétition"
                  className="h-24 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
              <div>
                <Label htmlFor="image">Image de la compétition</Label>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <FileInput onChange={handleImageUpload} />
                    {imageUploading && (
                      <p className="mt-1 text-xs text-gray-500">Upload en cours...</p>
                    )}
                    {imageError && (
                      <p className="mt-1 text-xs text-error-500">{imageError}</p>
                    )}
                  </div>
                  {formData.image && (
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.image}
                        alt="Aperçu"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900"
                      >
                        <svg
                          className="h-2.5 w-2.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cagnotte">Cagnotte (FC) *</Label>
                <Input
                  id="cagnotte"
                  name="cagnotte"
                  type="number"
                  min="0"
                  value={formData.cagnotte}
                  onChange={handleInputChange}
                  placeholder="Montant de la cagnotte"
                  required
                />
              </div>
              <div>
                <Label htmlFor="parties">Nombre de parties *</Label>
                <Input
                  id="parties"
                  name="parties"
                  type="number"
                  min="1"
                  value={formData.parties}
                  onChange={handleInputChange}
                  placeholder="Nombre total de parties disponibles"
                  required
                />
              </div>
              <div>
                <Label>Catégories</Label>
                <MultiSelect
                  label="Sélectionner les catégories"
                  options={categories}
                  defaultSelected={formData.selectedCategories}
                  onChange={handleCategoriesChange}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Récapitulatif
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">Désignation :</span> {formData.designation}
                  </p>
                  {formData.description && (
                    <p>
                      <span className="font-medium">Description :</span> {formData.description}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Cagnotte :</span> {formData.cagnotte} FC
                  </p>
                  <p>
                    <span className="font-medium">Parties :</span> {formData.parties}
                  </p>
                  <p>
                    <span className="font-medium">Catégories sélectionnées :</span>{' '}
                    {formData.selectedCategories.length}
                  </p>
                  {formData.image && (
                    <p>
                      <span className="font-medium">Image :</span> {formData.image}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vérifiez les informations avant de créer la compétition.
              </p>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-800">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Précédent
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            {step < 3 ? (
              <Button onClick={nextStep}>Suivant</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Création...' : 'Créer la compétition'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}