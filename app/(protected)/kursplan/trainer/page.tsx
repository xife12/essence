'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Users, Star, Check, X } from 'lucide-react';
import CourseNavigation from '@/app/components/kursplan/CourseNavigation';
import { StaffAPI, Staff } from '@/app/lib/api/staff';

const TrainerManagementPage = () => {
  const [trainers, setTrainers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const staffData = await StaffAPI.getAll();
      setTrainers(staffData);
    } catch (err) {
      setError('Fehler beim Laden der Trainer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <CourseNavigation />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Trainer-Verwaltung
          </h1>
          <p className="text-gray-600">Verwalten Sie Ihr Trainer-Team</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Neuer Trainer
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Trainers Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map(trainer => (
            <div key={trainer.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {trainer.first_name?.[0] || trainer.name[0]}
                      {trainer.last_name?.[0] || trainer.name[1]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{trainer.name}</h3>
                    <p className="text-sm text-gray-600">{trainer.email}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rolle</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{trainer.rolle}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Aktiv
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Trainer-Verwaltung</h4>
        <p className="text-sm text-blue-800">
          Die vollständige Trainer-Verwaltung nutzt die Mitarbeiter-Daten aus dem Staff-System. 
          Trainer können Spezialisierungen, Zertifikate und Verfügbarkeiten zugeordnet werden.
        </p>
      </div>
    </div>
  );
};

export default TrainerManagementPage; 