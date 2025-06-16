'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Users, Activity, Check, X } from 'lucide-react';
import CourseNavigation from '@/app/components/kursplan/CourseNavigation';
import { CourseRoomsAPI, CourseRoom } from '@/app/lib/api/courseRooms';

const RoomsManagementPage = () => {
  const [rooms, setRooms] = useState<CourseRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<CourseRoom | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    max_capacity: 10,
    description: '',
    equipment: [] as string[],
    is_active: true
  });

  // State für Equipment-Management
  const [newEquipment, setNewEquipment] = useState('');
  const [availableEquipment] = useState([
    'Matten', 'Hanteln', 'Widerstandsbänder', 'Kettlebells', 'Spinning-Bikes',
    'Stepper', 'Bosu-Bälle', 'TRX-Bänder', 'Gymnastikbälle', 'Spiegelwand',
    'Sound-System', 'Klimaanlage', 'Umkleiden', 'Dusche'
  ]);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await CourseRoomsAPI.getAll();
      setRooms(roomsData);
    } catch (err) {
      setError('Fehler beim Laden der Räume');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (room?: CourseRoom) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        location: room.location || '',
        max_capacity: room.max_capacity,
        description: room.description || '',
        equipment: room.equipment || [],
        is_active: room.is_active
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        location: '',
        max_capacity: 10,
        description: '',
        equipment: [],
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setNewEquipment('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRoom) {
        await CourseRoomsAPI.update(editingRoom.id, formData);
      } else {
        await CourseRoomsAPI.create(formData);
      }
      
      await loadRooms();
      closeModal();
    } catch (err) {
      setError(`Fehler beim ${editingRoom ? 'Aktualisieren' : 'Erstellen'} des Raums`);
      console.error(err);
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Raum löschen möchten?')) {
      return;
    }

    try {
      await CourseRoomsAPI.delete(roomId);
      await loadRooms();
    } catch (err) {
      setError('Fehler beim Löschen des Raums');
      console.error(err);
    }
  };

  const addEquipment = (equipment: string) => {
    if (equipment && !formData.equipment.includes(equipment)) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, equipment]
      }));
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(e => e !== equipment)
    }));
  };

  const addCustomEquipment = () => {
    if (newEquipment.trim()) {
      addEquipment(newEquipment.trim());
      setNewEquipment('');
    }
  };

  return (
    <div className="space-y-6">
      <CourseNavigation />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            Raum-Verwaltung
          </h1>
          <p className="text-gray-600">Verwalten Sie Ihre Kursräume und deren Ausstattung</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Neuer Raum
        </button>
      </div>

      {/* Error State */}
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Rooms Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Room Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  {room.location && (
                    <p className="text-sm text-gray-600">{room.location}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(room)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Room Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kapazität</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{room.max_capacity} Personen</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {room.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>

                {/* Equipment */}
                {room.equipment && room.equipment.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Ausstattung</span>
                    <div className="flex flex-wrap gap-1">
                      {room.equipment.slice(0, 3).map(equipment => (
                        <span
                          key={equipment}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {equipment}
                        </span>
                      ))}
                      {room.equipment.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{room.equipment.length - 3} weitere
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {room.description && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Beschreibung</span>
                    <p className="text-sm text-gray-800 line-clamp-2">{room.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal für Raum erstellen/bearbeiten */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingRoom ? 'Raum bearbeiten' : 'Neuer Raum'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Grunddaten */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Raumname *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Standort
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="z.B. 1. OG, Bereich A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximale Kapazität *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.max_capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_capacity: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Raum ist aktiv</span>
                    </label>
                  </div>
                </div>

                {/* Beschreibung */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Beschreibung des Raums und seiner Besonderheiten..."
                  />
                </div>

                {/* Ausstattung */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ausstattung
                  </label>

                  {/* Ausgewählte Ausstattung */}
                  {formData.equipment.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {formData.equipment.map(equipment => (
                          <span
                            key={equipment}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {equipment}
                            <button
                              type="button"
                              onClick={() => removeEquipment(equipment)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verfügbare Ausstattung */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {availableEquipment
                      .filter(equipment => !formData.equipment.includes(equipment))
                      .map(equipment => (
                        <button
                          key={equipment}
                          type="button"
                          onClick={() => addEquipment(equipment)}
                          className="text-left px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          + {equipment}
                        </button>
                      ))
                    }
                  </div>

                  {/* Eigene Ausstattung hinzufügen */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newEquipment}
                      onChange={(e) => setNewEquipment(e.target.value)}
                      placeholder="Eigene Ausstattung hinzufügen..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomEquipment())}
                    />
                    <button
                      type="button"
                      onClick={addCustomEquipment}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {editingRoom ? 'Aktualisieren' : 'Erstellen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsManagementPage; 