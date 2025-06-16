'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Palette, Grid3X3, BarChart3 } from 'lucide-react';
import CourseCategoriesAPI, { CourseCategory, CreateCourseCategoryData } from '../../../lib/api/courseCategories';
import CourseNavigation from '../../../components/kursplan/CourseNavigation';
import Link from 'next/link';

const CourseCategoriesPage = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    visible: number;
    hidden: number;
    mostUsed: { name: string; count: number }[];
  } | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateCourseCategoryData>({
    name: '',
    description: '',
    icon: '📚',
    color: '#3B82F6',
    sort_order: 0,
    is_visible: true
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Predefined colors
  const predefinedColors = [
    '#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#EC4899',
    '#6B7280', '#14B8A6', '#F97316', '#84CC16', '#06B6D4', '#8B4513'
  ];

  // Common icons
  const commonIcons = [
    '📚', '🧘', '💪', '🤸', '🚴', '💃', '🏋️', '🏃', '🤾', '🏐',
    '⚽', '🏀', '🎾', '🏓', '🏸', '🥊', '🤺', '🏊', '🧗', '🪃'
  ];

  // Load data
  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await CourseCategoriesAPI.getAll(true); // Include invisible
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Kategorien');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await CourseCategoriesAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Fehler beim Laden der Statistiken:', err);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name ist erforderlich';
    }

    if (!formData.icon.trim()) {
      errors.icon = 'Icon ist erforderlich';
    }

    if (!formData.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.color = 'Ungültiges Farbformat';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingCategory) {
        await CourseCategoriesAPI.update(editingCategory.id, formData);
      } else {
        await CourseCategoriesAPI.create(formData);
      }

      // Reset form and reload data
      setFormData({
        name: '',
        description: '',
        icon: '📚',
        color: '#3B82F6',
        sort_order: 0,
        is_visible: true
      });
      setEditingCategory(null);
      setShowModal(false);
      setValidationErrors({});
      await loadCategories();
      await loadStats();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern der Kategorie');
    }
  };

  // Edit category
  const handleEdit = (category: CourseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
      sort_order: category.sort_order,
      is_visible: category.is_visible
    });
    setShowModal(true);
    setValidationErrors({});
  };

  // Delete category
  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Kategorie löschen möchten?')) {
      return;
    }

    try {
      await CourseCategoriesAPI.delete(id);
      await loadCategories();
      await loadStats();
    } catch (err: any) {
      alert(err.message || 'Fehler beim Löschen der Kategorie');
    }
  };

  // Toggle visibility
  const handleToggleVisibility = async (id: string) => {
    try {
      await CourseCategoriesAPI.toggleVisibility(id);
      await loadCategories();
      await loadStats();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Ändern der Sichtbarkeit');
    }
  };

  // Open new category modal
  const openNewModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '📚',
      color: '#3B82F6',
      sort_order: 0,
      is_visible: true
    });
    setValidationErrors({});
    setShowModal(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/kursplan"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kurskategorien</h1>
            <p className="text-gray-600">Verwalten Sie die Kategorien für Ihre Kurse</p>
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Neue Kategorie</span>
        </button>
      </div>

      {/* Navigation */}
      <CourseNavigation />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Schließen
          </button>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Grid3X3 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Eye className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Sichtbar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.visible}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <EyeOff className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Versteckt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hidden}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Meist genutzt</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.mostUsed[0]?.name || 'Keine Daten'}
                </p>
                {stats.mostUsed[0] && (
                  <p className="text-xs text-gray-500">{stats.mostUsed[0].count} Kurse</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Kategorien vorhanden</h3>
            <p className="text-gray-600 mb-4">Erstellen Sie Ihre erste Kurskategorie</p>
            <button
              onClick={openNewModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Erste Kategorie erstellen
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Kategorie</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Beschreibung</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Farbe</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Reihenfolge</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(category.created_at).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-600">{category.color}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{category.sort_order}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        category.is_visible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.is_visible ? 'Sichtbar' : 'Versteckt'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleVisibility(category.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title={category.is_visible ? 'Ausblenden' : 'Einblenden'}
                        >
                          {category.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="z.B. Yoga"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Beschreibung der Kategorie..."
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon *
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.icon ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="📚"
                  />
                  <span className="text-2xl">{formData.icon}</span>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {commonIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className="p-2 text-xl hover:bg-gray-100 rounded transition-colors"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                {validationErrors.icon && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.icon}</p>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farbe *
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.color ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="#3B82F6"
                  />
                  <div
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {validationErrors.color && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.color}</p>
                )}
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reihenfolge
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_visible: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Sichtbar</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCategoriesPage; 