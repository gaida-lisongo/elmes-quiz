'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CompetitionOutput } from '@/app/actions/competition.actions';
import { updateCompetition, deleteCompetition } from '@/app/actions/competition.actions';
import { getAllCategories } from '@/app/actions/categorie.actions';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import MultiSelect from '@/components/form/MultiSelect';

interface EditCompetitionFormProps {
  competition: CompetitionOutput;
}

interface CategoryOption {
  value: string;
  text: string;
  selected: boolean;
}

export default function EditCompetitionForm({ competition }: EditCompetitionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [formData, setFormData] = useState({
    designation: competition.designation,
    description: competition.description || '',
    cagnotte: competition.cagnotte.toString(),
    parties: competition.parties.toString(),
    image: competition.image || '',
    status: competition.status,
    selectedCategories: competition.categories,
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getAllCategories();
        const options: CategoryOption[] = cats.map((cat) => ({
          value: cat._id,
          text: cat.designation,
          selected: competition.categories.includes(cat._id),
        }));
        setCategories(options);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, [competition.categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as 'ACTIVE' | 'INACTIVE' | 'COMPLETED' }));
  };

  const handleCategoriesChange = (selected: string[]) => {
    setFormData((prev) => ({ ...prev, selectedCategories: selected }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    setSuccess(null);

    try {
      const result = await updateCompetition(competition._id, {
        designation: formData.designation,
        description: formData.description,
        cagnotte: Number(formData.cagnotte),
        categories: formData.selectedCategories,
        parties: Number(formData.parties),
        status: formData.status,
        image: formData.image,
      });

      if (result.success) {
        setSuccess('Compétition mise à jour avec succès.');
        router.refresh();
        setTimeout(() => {
          router.push('/agent/competitions');
        }, 1500);
      } else {
        setError(result.error || 'Erreur lors de la mise à jour.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette compétition ? Cette action est irréversible.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await deleteCompetition(competition._id);
      if (result.success) {
        router.push('/agent/competitions');
      } else {
        setError(result.error || 'Erreur lors de la suppression.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        Modifier la compétition
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-error-50 p-4 text-sm text-error-700 dark:bg-error-500/15 dark:text-error-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-success-50 p-4 text-sm text-success-700 dark:bg-success-500/15 dark:text-success-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
            <Label htmlFor="cagnotte">Cagnotte (FC) *</Label>
            <Input
              id="cagnotte"
              name="cagnotte"
              type="number"
              min="0"
              step="100"
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
              placeholder="Nombre total de parties"
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'COMPLETED', label: 'Terminée' },
              ]}
              defaultValue={formData.status}
              onChange={handleSelectChange}
              placeholder="Sélectionner un statut"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description détaillée de la compétition"
            className="h-32 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>

        <div>
          <Label htmlFor="image">URL de l'image (optionnel)</Label>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
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

        <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={loading}
            className="bg-error-50 text-error-700 hover:bg-error-100 dark:bg-error-500/15 dark:text-error-400 dark:hover:bg-error-500/25"
          >
            Supprimer
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/agent/competitions')}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}