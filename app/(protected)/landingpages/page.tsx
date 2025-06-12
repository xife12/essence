'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Globe, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import supabase from '../../lib/supabaseClient';

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  headline?: string;
  description?: string;
  is_active: boolean;
  form_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export default function LandingPagesOverview() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadLandingPages();
  }, []);

  const loadLandingPages = async () => {
    try {
      const { data, error } = await supabase
        .from('landingpage')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLandingPages(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Landingpages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Lösche alle Blöcke der Landingpage
      await supabase
        .from('landingpage_block')
        .delete()
        .eq('landingpage_id', id);

      // Lösche die Landingpage
      const { error } = await supabase
        .from('landingpage')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Aktualisiere die Liste
      await loadLandingPages();
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Fehler beim Löschen der Landingpage:', error);
      alert('Fehler beim Löschen der Landingpage');
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('landingpage')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      await loadLandingPages();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Landingpages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Meine Landingpages</h2>
          <p className="text-gray-600">Verwalten Sie Ihre Marketing-Landingpages</p>
        </div>
        <button
          onClick={() => router.push('/landingpages/neu')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Neue Landingpage
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{landingPages.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Globe className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktiv</p>
              <p className="text-2xl font-bold text-green-600">
                {landingPages.filter(page => page.is_active).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mit Formular</p>
              <p className="text-2xl font-bold text-purple-600">
                {landingPages.filter(page => page.form_enabled).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Landingpages Liste */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Alle Landingpages</h3>
        </div>

        {landingPages.length === 0 ? (
          <div className="p-12 text-center">
            <Globe size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Noch keine Landingpages
            </h3>
            <p className="text-gray-600 mb-6">
              Erstellen Sie Ihre erste Landingpage, um mit der Lead-Generierung zu beginnen.
            </p>
            <button
              onClick={() => router.push('/landingpages/neu')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Erste Landingpage erstellen
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Landingpage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formular
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {landingPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {page.title}
                        </div>
                        {page.headline && (
                          <div className="text-sm text-gray-500">
                            {page.headline}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        /{page.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(page.id, page.is_active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          page.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {page.is_active ? 'Live' : 'Entwurf'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        page.form_enabled
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {page.form_enabled ? 'Aktiviert' : 'Deaktiviert'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(page.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {page.is_active && (
                          <button
                            onClick={() => window.open(`/${page.slug}`, '_blank')}
                            className="text-gray-400 hover:text-blue-600 p-1 rounded"
                            title="Vorschau anzeigen"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <Link
                          href={`/landingpages/${page.id}/builder`}
                          className="text-gray-400 hover:text-blue-600 p-1 rounded"
                          title="Bearbeiten"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(page.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded"
                          title="Löschen"
                        >
                          <Trash2 size={16} />
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Landingpage löschen
            </h3>
            <p className="text-gray-600 mb-6">
              Sind Sie sicher, dass Sie diese Landingpage löschen möchten? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={() => showDeleteModal && handleDelete(showDeleteModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 