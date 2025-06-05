'use client';

import React, { useState } from 'react';
import { X, RotateCw, Calendar, Clock, Image, Facebook, Instagram, Linkedin, PenTool } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ContentPost {
  id: string;
  campaign_id: string;
  title: string;
  content: string;
  media_url?: string;
  post_date: string;
  channel: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ContentPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  post: ContentPost | null;
  onSave: (post: ContentPost) => void;
}

export default function ContentPostModal({
  isOpen,
  onClose,
  campaignId,
  post,
  onSave
}: ContentPostModalProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [mediaUrl, setMediaUrl] = useState(post?.media_url || '');
  const [postDate, setPostDate] = useState(post?.post_date ? new Date(post.post_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [postTime, setPostTime] = useState(post?.post_date ? new Date(post.post_date).toISOString().slice(11, 16) : '12:00');
  const [channel, setChannel] = useState(post?.channel || 'facebook');
  const [loading, setLoading] = useState(false);
  
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formattedDate = `${postDate}T${postTime}:00`;
      
      if (post) {
        // Update existing post
        const { data, error } = await supabase
          .from('content_posts')
          .update({
            title,
            content,
            media_url: mediaUrl,
            post_date: formattedDate,
            channel,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id)
          .select()
          .single();
        
        if (error) throw error;
        onSave(data);
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('content_posts')
          .insert([{
            campaign_id: campaignId,
            title,
            content,
            media_url: mediaUrl,
            post_date: formattedDate,
            channel,
            status: 'geplant'
          }])
          .select()
          .single();
        
        if (error) throw error;
        onSave(data);
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Posts:', error);
      alert('Fehler beim Speichern des Posts. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {post ? 'Beitrag bearbeiten' : 'Neuen Beitrag erstellen'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Titel des Beitrags"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beitragstext
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Text des Beitrags..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1">
                  <Image size={16} />
                  <span>Bild-URL</span>
                </div>
              </label>
              <input
                type="text"
                value={mediaUrl || ''}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              {mediaUrl && (
                <div className="mt-2">
                  <img 
                    src={mediaUrl} 
                    alt="Vorschau" 
                    className="h-32 object-contain rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Bild+nicht+verfügbar';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Datum</span>
                  </div>
                </label>
                <input
                  type="date"
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>Uhrzeit</span>
                  </div>
                </label>
                <input
                  type="time"
                  value={postTime}
                  onChange={(e) => setPostTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kanal
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div 
                  className={`flex items-center gap-2 border p-3 rounded-md cursor-pointer ${
                    channel === 'facebook' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setChannel('facebook')}
                >
                  <Facebook className="text-blue-600" />
                  <span>Facebook</span>
                </div>
                
                <div 
                  className={`flex items-center gap-2 border p-3 rounded-md cursor-pointer ${
                    channel === 'instagram' ? 'bg-pink-50 border-pink-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setChannel('instagram')}
                >
                  <Instagram className="text-pink-600" />
                  <span>Instagram</span>
                </div>
                
                <div 
                  className={`flex items-center gap-2 border p-3 rounded-md cursor-pointer ${
                    channel === 'linkedin' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setChannel('linkedin')}
                >
                  <Linkedin className="text-blue-800" />
                  <span>LinkedIn</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Abbrechen
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              disabled={loading || !title || !content || !postDate || !postTime || !channel}
            >
              {loading ? (
                <>
                  <RotateCw size={18} className="animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 