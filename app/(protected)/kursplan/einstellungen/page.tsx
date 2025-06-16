'use client';

import React, { useState } from 'react';
import { Settings, Clock, Users, Calendar, Bell, Save } from 'lucide-react';
import CourseNavigation from '@/app/components/kursplan/CourseNavigation';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // Allgemeine Einstellungen
    business_hours_start: '06:00',
    business_hours_end: '22:00',
    default_course_duration: 60,
    advance_booking_days: 14,
    cancellation_hours: 2,
    
    // Automatisierung
    auto_waitlist: true,
    auto_confirmation: true,
    reminder_emails: true,
    reminder_hours: 24,
    
    // Kapazitäten
    default_max_participants: 15,
    overbooking_percentage: 10,
    
    // Konfliktmanagement
    prevent_trainer_conflicts: true,
    prevent_room_conflicts: true,
    allow_overlapping_breaks: false
  });

  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      // Hier würde normalerweise die API aufgerufen werden
      console.log('Einstellungen speichern:', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <CourseNavigation />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            Kursplan-Einstellungen
          </h1>
          <p className="text-gray-600">Konfigurieren Sie die globalen Einstellungen für das Kursplan-Modul</p>
        </div>
        
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Save className="h-4 w-4" />
          {saved ? 'Gespeichert!' : 'Einstellungen speichern'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geschäftszeiten */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Geschäftszeiten
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Öffnungszeit
                </label>
                <input
                  type="time"
                  value={settings.business_hours_start}
                  onChange={(e) => updateSetting('business_hours_start', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schließzeit
                </label>
                <input
                  type="time"
                  value={settings.business_hours_end}
                  onChange={(e) => updateSetting('business_hours_end', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard Kursdauer (Minuten)
              </label>
              <select
                value={settings.default_course_duration}
                onChange={(e) => updateSetting('default_course_duration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 Minuten</option>
                <option value={45}>45 Minuten</option>
                <option value={60}>60 Minuten</option>
                <option value={75}>75 Minuten</option>
                <option value={90}>90 Minuten</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buchungseinstellungen */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Buchungseinstellungen
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vorlaufzeit für Buchungen (Tage)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.advance_booking_days}
                onChange={(e) => updateSetting('advance_booking_days', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stornierungsfrist (Stunden)
              </label>
              <input
                type="number"
                min="0"
                max="48"
                value={settings.cancellation_hours}
                onChange={(e) => updateSetting('cancellation_hours', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.auto_waitlist}
                  onChange={(e) => updateSetting('auto_waitlist', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Automatische Warteliste</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.auto_confirmation}
                  onChange={(e) => updateSetting('auto_confirmation', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Automatische Bestätigung</span>
              </label>
            </div>
          </div>
        </div>

        {/* Kapazitätsmanagement */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Kapazitätsmanagement
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard max. Teilnehmer
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.default_max_participants}
                onChange={(e) => updateSetting('default_max_participants', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Überbuchung erlaubt (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={settings.overbooking_percentage}
                onChange={(e) => updateSetting('overbooking_percentage', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Zusätzliche Plätze über die Kapazität hinaus
              </p>
            </div>
          </div>
        </div>

        {/* Benachrichtigungen */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            Benachrichtigungen
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  checked={settings.reminder_emails}
                  onChange={(e) => updateSetting('reminder_emails', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Erinnerungs-E-Mails senden</span>
              </label>
              
              {settings.reminder_emails && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Erinnerung vor Kurs (Stunden)
                  </label>
                  <select
                    value={settings.reminder_hours}
                    onChange={(e) => updateSetting('reminder_hours', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2}>2 Stunden</option>
                    <option value={4}>4 Stunden</option>
                    <option value={24}>24 Stunden</option>
                    <option value={48}>48 Stunden</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Konfliktmanagement */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Konfliktmanagement
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.prevent_trainer_conflicts}
                onChange={(e) => updateSetting('prevent_trainer_conflicts', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Trainer-Konflikte verhindern</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.prevent_room_conflicts}
                onChange={(e) => updateSetting('prevent_room_conflicts', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Raum-Konflikte verhindern</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.allow_overlapping_breaks}
                onChange={(e) => updateSetting('allow_overlapping_breaks', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Überlappende Pausen erlauben</span>
            </label>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Hinweise</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Änderungen werden sofort auf alle neuen Kurse angewendet</li>
          <li>• Bestehende Kurse sind von Änderungen nicht betroffen</li>
          <li>• Konflikterkennung läuft automatisch beim Erstellen und Bearbeiten von Kursen</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsPage;
