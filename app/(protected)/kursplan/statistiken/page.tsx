'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, TrendingUp, Clock, MapPin, Filter, Download } from 'lucide-react';
import CourseNavigation from '@/app/components/kursplan/CourseNavigation';
import { CoursesAPI } from '@/app/lib/api/courses';
import { CourseRoomsAPI } from '@/app/lib/api/courseRooms';
import { CourseCategoriesAPI } from '@/app/lib/api/courseCategories';

interface CourseStats {
  totalCourses: number;
  totalParticipants: number;
  averageOccupancy: number;
  mostPopularCategory: string;
  mostPopularRoom: string;
  peakHours: string[];
  weeklyTrend: { week: string; participants: number; courses: number }[];
  categoryStats: { name: string; courses: number; participants: number; occupancy: number }[];
  roomStats: { name: string; courses: number; occupancy: number; capacity: number }[];
  hourlyStats: { hour: string; courses: number; participants: number }[];
}

const StatisticsPage = () => {
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
    loadCategories();
  }, [selectedPeriod, selectedCategory]);

  const loadCategories = async () => {
    try {
      const categoriesData = await CourseCategoriesAPI.getAll();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Fehler beim Laden der Kategorien:', err);
    }
  };

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Mock-Daten für Demo-Zwecke
      const mockStats: CourseStats = {
        totalCourses: 45,
        totalParticipants: 567,
        averageOccupancy: 78.3,
        mostPopularCategory: 'HIIT',
        mostPopularRoom: 'Studio 1',
        peakHours: ['18:00', '19:00', '09:00'],
        weeklyTrend: [
          { week: 'KW 48', participants: 520, courses: 42 },
          { week: 'KW 49', participants: 545, courses: 44 },
          { week: 'KW 50', participants: 567, courses: 45 },
          { week: 'KW 51', participants: 589, courses: 47 },
        ],
        categoryStats: [
          { name: 'HIIT', courses: 12, participants: 180, occupancy: 85.2 },
          { name: 'Yoga', courses: 8, participants: 96, occupancy: 72.1 },
          { name: 'Pilates', courses: 6, participants: 84, occupancy: 93.3 },
          { name: 'Spinning', courses: 10, participants: 140, occupancy: 77.8 },
          { name: 'Zumba', courses: 9, participants: 67, occupancy: 62.0 },
        ],
        roomStats: [
          { name: 'Studio 1', courses: 20, occupancy: 82.5, capacity: 20 },
          { name: 'Studio 2', courses: 15, occupancy: 75.0, capacity: 12 },
          { name: 'Spinning-Raum', courses: 10, occupancy: 77.8, capacity: 18 },
        ],
        hourlyStats: [
          { hour: '06:00', courses: 2, participants: 24 },
          { hour: '07:00', courses: 3, participants: 36 },
          { hour: '08:00', courses: 4, participants: 48 },
          { hour: '09:00', courses: 5, participants: 65 },
          { hour: '10:00', courses: 3, participants: 42 },
          { hour: '17:00', courses: 4, participants: 58 },
          { hour: '18:00', courses: 6, participants: 89 },
          { hour: '19:00', courses: 7, participants: 98 },
          { hour: '20:00', courses: 4, participants: 52 },
        ]
      };

      setStats(mockStats);
    } catch (err) {
      setError('Fehler beim Laden der Statistiken');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Export-Funktionalität
    console.log('Daten exportieren...');
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 90) return 'text-red-600 bg-red-100';
    if (occupancy >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CourseNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <CourseNavigation />
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Fehler beim Laden der Statistiken'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CourseNavigation />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Kursplan-Statistiken
          </h1>
          <p className="text-gray-600">Auslastung, Trends und Performance-Analysen</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Zeitraum Filter */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Diese Woche</option>
            <option value="month">Dieser Monat</option>
            <option value="quarter">Dieses Quartal</option>
          </select>

          {/* Kategorie Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Kategorien</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={exportData}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamte Kurse</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">+5 vs. letzter Monat</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teilnehmer Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">+8% vs. letzter Monat</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ø Auslastung</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageOccupancy}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-sm text-orange-600 mt-2">+2.3% vs. letzter Monat</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Kategorie</p>
              <p className="text-xl font-bold text-gray-900">{stats.mostPopularCategory}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mt-2">85% Auslastung</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kategorie-Statistiken */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance nach Kategorie</h3>
          <div className="space-y-4">
            {stats.categoryStats.map(category => (
              <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-600">{category.courses} Kurse • {category.participants} Teilnehmer</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getOccupancyColor(category.occupancy)}`}>
                    {category.occupancy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Raum-Statistiken */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Raum-Auslastung</h3>
          <div className="space-y-4">
            {stats.roomStats.map(room => (
              <div key={room.name} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{room.name}</p>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getOccupancyColor(room.occupancy)}`}>
                    {room.occupancy}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{room.courses} Kurse</span>
                  <span>Max. {room.capacity} Personen</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${room.occupancy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stündliche Auslastung */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Auslastung nach Tageszeit</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4">
          {stats.hourlyStats.map(hour => (
            <div key={hour.hour} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">{hour.hour}</p>
              <p className="text-xs text-gray-600">{hour.courses} Kurse</p>
              <p className="text-sm font-semibold text-blue-600">{hour.participants}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wöchentlicher Trend */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wöchentlicher Trend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.weeklyTrend.map((week, index) => (
            <div key={week.week} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{week.week}</p>
              <p className="text-lg font-bold text-blue-600">{week.participants}</p>
              <p className="text-xs text-gray-600">{week.courses} Kurse</p>
              {index > 0 && (
                <p className="text-xs text-green-600">
                  +{week.participants - stats.weeklyTrend[index - 1].participants} Teilnehmer
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Insights & Empfehlungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              🔥 <strong>Peak-Zeit:</strong> {stats.peakHours.join(', ')} Uhr haben die höchste Auslastung
            </p>
            <p className="text-sm text-blue-800">
              🏆 <strong>Top-Performer:</strong> {stats.mostPopularCategory} hat die beste Auslastung
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              📈 <strong>Trend:</strong> Teilnehmerzahlen steigen kontinuierlich (+8% MTD)
            </p>
            <p className="text-sm text-blue-800">
              💡 <strong>Empfehlung:</strong> Mehr {stats.mostPopularCategory}-Kurse zu Peak-Zeiten anbieten
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage; 