'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Grid, Facebook, Instagram, Linkedin, PenTool } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ContentPostModal from './ContentPostModal';

interface Campaign {
  id: string;
  name: string;
}

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

interface ContentPlannerProps {
  campaign: Campaign;
}

export default function ContentPlanner({ campaign }: ContentPlannerProps) {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPosts();
  }, [campaign.id]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Prüfen ob die Tabelle existiert
      const { data: tableExists } = await supabase
        .from('content_posts')
        .select('id')
        .limit(1);
      
      // Wenn die Tabelle noch nicht existiert, zeigen wir keine Fehler an
      if (!tableExists) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('campaign_id', campaign.id)
        .order('post_date', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Content-Posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setSelectedPost(null);
    setIsModalOpen(true);
  };

  const handleEditPost = (post: ContentPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handlePostSaved = (post: ContentPost) => {
    if (selectedPost) {
      setPosts(posts.map(p => p.id === post.id ? post : p));
    } else {
      setPosts([...posts, post]);
    }
    setIsModalOpen(false);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'facebook':
        return <Facebook size={16} className="text-blue-600" />;
      case 'instagram':
        return <Instagram size={16} className="text-pink-600" />;
      case 'linkedin':
        return <Linkedin size={16} className="text-blue-800" />;
      default:
        return <PenTool size={16} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Contentplanung</h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-md p-1 mr-2">
            <button
              className={`px-3 py-1 rounded-md text-xs ${view === 'list' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setView('list')}
            >
              <Grid size={14} className="mr-1 inline-block" />
              Liste
            </button>
            <button
              className={`px-3 py-1 rounded-md text-xs ${view === 'calendar' ? 'bg-white shadow-sm' : ''}`}
              onClick={() => setView('calendar')}
            >
              <Calendar size={14} className="mr-1 inline-block" />
              Kalender
            </button>
          </div>
          <button 
            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center gap-2"
            onClick={handleCreatePost}
          >
            <Plus size={16} />
            Beitrag erstellen
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Content-Beiträge werden geladen...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-gray-500">Keine Beiträge für diese Kampagne geplant.</p>
          <p className="mt-2 text-sm text-gray-500">Planen Sie Beiträge für Social Media, um Ihre Kampagne zu unterstützen.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm inline-flex items-center gap-2"
            onClick={handleCreatePost}
          >
            <Plus size={16} />
            Ersten Beitrag erstellen
          </button>
        </div>
      ) : view === 'list' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titel
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kanal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleEditPost(post)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{post.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getChannelIcon(post.channel)}
                      <span className="ml-2">{post.channel}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(post.post_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === 'geplant' ? 'bg-yellow-100 text-yellow-800' :
                      post.status === 'veröffentlicht' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPost(post);
                      }}
                    >
                      Bearbeiten
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="mb-4 text-sm text-gray-500">
            Die Kalenderansicht befindet sich in Entwicklung. Bitte verwenden Sie die Listenansicht.
          </div>
          
          {/* Beispiel-Kalendergitter */}
          <div className="grid grid-cols-7 gap-1">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
              <div key={day} className="text-center font-medium text-xs p-2 bg-gray-50">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="border p-1 min-h-[80px] text-xs">
                <div className="font-medium mb-1">{index + 1}</div>
                {/* Beispielhafte Einträge */}
                {index === 10 && (
                  <div className="bg-blue-100 p-1 rounded mb-1 truncate">
                    Facebook Post
                  </div>
                )}
                {index === 15 && (
                  <div className="bg-pink-100 p-1 rounded mb-1 truncate">
                    Instagram Story
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <ContentPostModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          campaignId={campaign.id}
          post={selectedPost}
          onSave={handlePostSaved}
        />
      )}
    </div>
  );
} 