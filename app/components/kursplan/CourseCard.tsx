'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Users, MapPin, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { CourseOverview } from '../../lib/api/courses';

interface CourseCardProps {
  course: CourseOverview;
  schedule?: {
    start_time: string;
    end_time: string;
    day_of_week?: number;
    special_date?: string;
  };
  compact?: boolean;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  className?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  schedule,
  compact = false,
  showActions = false,
  onEdit,
  onDelete,
  onToggleVisibility,
  className = ''
}) => {
  const occupancyPercentage = Math.round(
    (course.current_participants / course.max_participants) * 100
  );

  const getOccupancyColor = () => {
    if (occupancyPercentage >= 90) return 'bg-red-500';
    if (occupancyPercentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getOccupancyTextColor = () => {
    if (occupancyPercentage >= 90) return 'text-red-700';
    if (occupancyPercentage >= 70) return 'text-yellow-700';
    return 'text-green-700';
  };

  if (compact) {
    return (
      <Link
        href={`/kursplan/${course.id}`}
        className={`block p-2 rounded text-xs hover:shadow-md transition-shadow cursor-pointer border-l-4 ${className}`}
        style={{
          backgroundColor: course.category_color + '20',
          borderLeftColor: course.category_color,
        }}
      >
        <div className="font-medium text-gray-900 truncate">{course.name}</div>
        {schedule && (
          <div className="text-gray-600">
            {schedule.start_time} - {schedule.end_time}
          </div>
        )}
        <div className="text-gray-500 truncate">{course.room_name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-500">
            {course.current_participants}/{course.max_participants}
          </span>
          <div className={`w-2 h-2 rounded-full ${getOccupancyColor()}`} />
        </div>
      </Link>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: course.category_color }}
            />
            <h3 className="font-semibold text-gray-900">{course.name}</h3>
            {!course.is_public && (
              <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                Privat
              </div>
            )}
            {course.is_special && (
              <div className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">
                Spezial
              </div>
            )}
          </div>
          
          {course.category_name && (
            <div className="text-sm text-gray-600 mb-2">
              {course.category_icon} {course.category_name}
            </div>
          )}

          {course.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {course.description}
            </p>
          )}
        </div>

        {showActions && (
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={() => onToggleVisibility?.(course.id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={course.is_public ? 'Ausblenden' : 'Einblenden'}
            >
              {course.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={() => onEdit?.(course.id)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Bearbeiten"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete?.(course.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Löschen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Schedule Info */}
      {schedule && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
          <Clock className="h-4 w-4" />
          <span>{schedule.start_time} - {schedule.end_time}</span>
          {schedule.special_date && (
            <span className="text-orange-600">
              ({new Date(schedule.special_date).toLocaleDateString('de-DE')})
            </span>
          )}
        </div>
      )}

      {/* Location & Trainer */}
      <div className="space-y-2 mb-3">
        {course.room_name && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{course.room_name}</span>
            {course.room_location && (
              <span className="text-gray-400">({course.room_location})</span>
            )}
          </div>
        )}

        {course.trainer_name && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Trainer: {course.trainer_name}</span>
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {course.current_participants} / {course.max_participants} Teilnehmer
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getOccupancyTextColor()}`}>
            {occupancyPercentage}%
          </span>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: course.category_color }} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getOccupancyColor()}`}
            style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      {!compact && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link
            href={`/kursplan/${course.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            Details anzeigen →
          </Link>
        </div>
      )}
    </div>
  );
};

export default CourseCard; 