'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, User } from 'lucide-react';
import supabase from '../../../lib/supabaseClient';

interface Testimonial {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  location?: string;
  rating: number;
  text_content: string;
  file_asset?: {
    id: string;
    filename: string;
    file_url: string;
  };
}

interface TestimonialBlockProps {
  content: {
    testimonial_id: string;
    layout: 'card' | 'inline' | 'quote';
    showImage?: boolean;
    showRating?: boolean;
    showLocation?: boolean;
  };
  onUpdate: (newContent: any) => void;
  isSelected?: boolean;
  template?: any;
}

export default function TestimonialBlock({ content, isSelected }: TestimonialBlockProps) {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (content.testimonial_id) {
      loadSelectedTestimonial();
    }
  }, [content.testimonial_id]);

  const loadSelectedTestimonial = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          *,
          file_asset:file_asset_id (
            id,
            filename,
            file_url
          )
        `)
        .eq('id', content.testimonial_id)
        .single();

      if (error) throw error;
      setSelectedTestimonial(data);
    } catch (error) {
      console.error('Fehler beim Laden des Testimonials:', error);
      setSelectedTestimonial(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const renderTestimonial = () => {
    if (!selectedTestimonial) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <MessageSquare size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600 mb-2">Testimonial - Konfigurieren Sie das Testimonial in den Einstellungen</p>
        </div>
      );
    }

    const customerName = selectedTestimonial.firstname && selectedTestimonial.lastname 
      ? `${selectedTestimonial.firstname} ${selectedTestimonial.lastname}`
      : selectedTestimonial.name;

    if (content.layout === 'quote') {
      return (
        <div className="bg-gray-50 p-8 rounded-lg">
          <blockquote className="text-lg italic text-gray-700 mb-4">
            "{selectedTestimonial.text_content}"
          </blockquote>
          <div className="flex items-center gap-3">
            {content.showImage && selectedTestimonial.file_asset && (
              <img
                src={selectedTestimonial.file_asset.file_url}
                alt={customerName}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">{customerName}</p>
              {content.showLocation && selectedTestimonial.location && (
                <p className="text-sm text-gray-600">{selectedTestimonial.location}</p>
              )}
              {content.showRating && (
                <div className="mt-1">
                  {renderStars(selectedTestimonial.rating)}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (content.layout === 'inline') {
      return (
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-lg">
          {content.showImage && selectedTestimonial.file_asset && (
            <img
              src={selectedTestimonial.file_asset.file_url}
              alt={customerName}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <p className="text-gray-700 mb-2">"{selectedTestimonial.text_content}"</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{customerName}</p>
                {content.showLocation && selectedTestimonial.location && (
                  <p className="text-sm text-gray-600">{selectedTestimonial.location}</p>
                )}
              </div>
              {content.showRating && (
                <div>{renderStars(selectedTestimonial.rating)}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default: card layout
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          {content.showImage && selectedTestimonial.file_asset ? (
            <img
              src={selectedTestimonial.file_asset.file_url}
              alt={customerName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{customerName}</h4>
            {content.showLocation && selectedTestimonial.location && (
              <p className="text-sm text-gray-600">{selectedTestimonial.location}</p>
            )}
            {content.showRating && (
              <div className="mt-1">{renderStars(selectedTestimonial.rating)}</div>
            )}
          </div>
        </div>
        <p className="text-gray-700 italic">"{selectedTestimonial.text_content}"</p>
      </div>
    );
  };

  return (
    <div className="p-4 relative">
      {/* Block Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <MessageSquare size={12} />
          Testimonial
        </div>
      )}

      {/* Content */}
      {renderTestimonial()}
    </div>
  );
} 