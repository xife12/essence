'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MessageSquare, Star, Image as ImageIcon, User, Upload, Calendar, Target, Tag, Search, Filter } from 'lucide-react';
import supabase from '../../../lib/supabaseClient';

interface Testimonial {
  id: string;
  name: string;
  firstname?: string;
  lastname?: string;
  gender?: 'Männlich' | 'Weiblich' | 'Divers';
  age?: number;
  location?: string;
  rating: number;
  text_content: string;
  image_id?: string;
  file_asset_id?: string;
  file_asset?: {
    id: string;
    filename: string;
    file_url: string;
  };
  tags: string[];
  training_goals: string[];
  member_since?: string;
  is_active: boolean;
  created_at: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Filter und Suche State
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  
  const [newTestimonial, setNewTestimonial] = useState({
    firstname: '',
    lastname: '',
    gender: '' as 'Männlich' | 'Weiblich' | 'Divers' | '',
    age: '',
    location: '',
    rating: 5,
    text_content: '',
    tags: [] as string[],
    training_goals: [] as string[],
    member_since: '',
    file_asset_id: '',
    is_active: true
  });
  const [newTag, setNewTag] = useState('');
  const [newTrainingGoal, setNewTrainingGoal] = useState('');

  // Formular zurücksetzen Funktion
  const resetForm = () => {
    setNewTestimonial({
      firstname: '',
      lastname: '',
      gender: '',
      age: '',
      location: '',
      rating: 5,
      text_content: '',
      tags: [],
      training_goals: [],
      member_since: '',
      file_asset_id: '',
      is_active: true
    });
    setNewTag('');
    setNewTrainingGoal('');
    setEditingTestimonial(null);
  };

  useEffect(() => {
    // Führe Datenbank-Reparatur durch, dann lade Testimonials
    const initializeData = async () => {
      await fixDatabase();
      await fetchTestimonials();
    };
    initializeData();
  }, []);

  // Filter-Effekt
  useEffect(() => {
    let filtered = testimonials;

    // Text-Suche
    if (searchTerm) {
      filtered = filtered.filter(testimonial => {
        const fullName = `${testimonial.firstname || ''} ${testimonial.lastname || ''}`.toLowerCase();
        const name = testimonial.name?.toLowerCase() || '';
        const content = testimonial.text_content?.toLowerCase() || '';
        const location = testimonial.location?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || 
               name.includes(search) || 
               content.includes(search) || 
               location.includes(search) ||
               testimonial.tags.some(tag => tag.toLowerCase().includes(search)) ||
               testimonial.training_goals.some(goal => goal.toLowerCase().includes(search));
      });
    }

    // Geschlecht-Filter
    if (genderFilter) {
      filtered = filtered.filter(testimonial => testimonial.gender === genderFilter);
    }

    // Rating-Filter
    if (ratingFilter) {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(testimonial => testimonial.rating >= rating);
    }

    // Tag-Filter
    if (tagFilter) {
      filtered = filtered.filter(testimonial => 
        testimonial.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()))
      );
    }

    setFilteredTestimonials(filtered);
  }, [testimonials, searchTerm, genderFilter, ratingFilter, tagFilter]);

  const fetchTestimonials = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Debug: Zeige alle Daten die gesendet werden
      console.log('=== TESTIMONIAL DEBUG START ===');
      console.log('Form data being sent:', {
        firstname: newTestimonial.firstname,
        lastname: newTestimonial.lastname,
        gender: newTestimonial.gender,
        name: `${newTestimonial.firstname} ${newTestimonial.lastname}`.trim(),
        age: newTestimonial.age,
        location: newTestimonial.location,
        rating: newTestimonial.rating,
        text_content: newTestimonial.text_content,
        tags: newTestimonial.tags,
        training_goals: newTestimonial.training_goals,
        member_since: newTestimonial.member_since,
        file_asset_id: newTestimonial.file_asset_id,
        is_active: newTestimonial.is_active
      });

      // Vereinfachte Daten für den Test
      const testimonialData = {
        firstname: newTestimonial.firstname || null,
        lastname: newTestimonial.lastname || null,
        gender: newTestimonial.gender || null,
        name: `${newTestimonial.firstname} ${newTestimonial.lastname}`.trim() || 'Unbekannt',
        age: newTestimonial.age ? parseInt(newTestimonial.age) : null,
        location: newTestimonial.location || null,
        rating: newTestimonial.rating,
        text_content: newTestimonial.text_content,
        tags: newTestimonial.tags,
        training_goals: newTestimonial.training_goals,
        member_since: newTestimonial.member_since || null,
        file_asset_id: newTestimonial.file_asset_id || null,
        is_active: newTestimonial.is_active
      };

      console.log('Processed testimonial data:', testimonialData);

      if (editingTestimonial) {
        console.log('Updating existing testimonial:', editingTestimonial.id);
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', editingTestimonial.id);
        
        if (error) {
          console.error('Update error details:', error);
          throw error;
        }
        console.log('Update successful');
      } else {
        console.log('Creating new testimonial...');
        const { data, error } = await supabase
          .from('testimonials')
          .insert([testimonialData])
          .select();
        
        if (error) {
          console.error('Insert error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        console.log('Insert successful, new testimonial:', data);
      }

      console.log('=== TESTIMONIAL DEBUG END ===');
      setShowCreateModal(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error('=== TESTIMONIAL ERROR ===');
      console.error('Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unbekannter Fehler');
      console.error('=== TESTIMONIAL ERROR END ===');
      
      // Detaillierte Fehlermeldung für den User
      let errorMessage = 'Unbekannter Fehler';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message;
      }
      
      alert(`Fehler beim Speichern des Testimonials:\n\n${errorMessage}\n\nBitte prüfen Sie die Browser-Konsole für Details.`);
    }
  };

  // File Upload Funktion mit Versionierung
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validiere Dateityp
    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine Bilddatei aus.');
      return;
    }

    // Validiere Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Die Datei ist zu groß. Maximale Größe: 5MB');
      return;
    }

    setUploading(true);
    try {
      let fileUrl = '';
      let uploadMethod = '';

      // Versuche zuerst Supabase Storage Upload
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `testimonials_${Date.now()}.${fileExt}`;
        const filePath = `image/portraits/testimonials/${fileName}`;

        console.log('Trying Supabase Storage upload:', fileName);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('file-assets')
          .upload(filePath, file);

        if (uploadError) {
          console.warn('Supabase Storage not available:', uploadError.message);
          throw new Error('Storage nicht verfügbar');
        }

        // Erstelle public URL
        const { data: publicURL } = supabase.storage
          .from('file-assets')
          .getPublicUrl(filePath);

        fileUrl = publicURL.publicUrl;
        uploadMethod = 'supabase_storage';
        console.log('Supabase Storage upload successful');

      } catch (storageError) {
        // Fallback: Base64 Data URL
        console.log('Using Base64 fallback for image upload');
        fileUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        uploadMethod = 'base64_fallback';
        console.log('Base64 upload successful');
      }

      // Prüfe ob wir ein bestehendes Testimonial bearbeiten und es bereits ein Bild hat
      // Berücksichtige sowohl editingTestimonial.file_asset_id als auch newTestimonial.file_asset_id
      const hasExistingFileAssetId = editingTestimonial?.file_asset_id || newTestimonial.file_asset_id;
      const isEditingWithExistingImage = editingTestimonial && hasExistingFileAssetId;
      
      console.log('=== VERSIONIERUNG DEBUG ===');
      console.log('editingTestimonial:', editingTestimonial);
      console.log('editingTestimonial.file_asset_id:', editingTestimonial?.file_asset_id);
      console.log('newTestimonial.file_asset_id:', newTestimonial.file_asset_id);
      console.log('hasExistingFileAssetId:', hasExistingFileAssetId);
      console.log('isEditingWithExistingImage:', isEditingWithExistingImage);
      console.log('Logic check: editingTestimonial =', !!editingTestimonial);
      console.log('Logic check: hasExistingFileAssetId =', !!hasExistingFileAssetId);
      
      if (isEditingWithExistingImage) {
        console.log('🔄 VERSIONIERUNG AKTIVIERT für Testimonial:', editingTestimonial.id);
        console.log('Bestehende file_asset_id:', hasExistingFileAssetId);
        
        // Prüfe zuerst ob die file_versions Tabelle existiert
        const { data: testVersions, error: testError } = await supabase
          .from('file_versions')
          .select('id')
          .limit(1);
          
        if (testError) {
          console.error('❌ file_versions Tabelle nicht verfügbar:', testError);
          console.log('💡 HINWEIS: Führe das SQL-Skript "file_versions_setup_clean.sql" in Supabase aus');
          throw new Error('Versionierung fehlgeschlagen - file_versions Tabelle fehlt');
        }
        
        console.log('✅ file_versions Tabelle verfügbar');
        
        // Verwende die uploadNewVersion API-Funktion
        const { uploadNewVersion } = await import('../../../lib/api/file-asset');
        
        try {
          console.log('📤 Starte Upload der neuen Version...');
          
          const newVersionData = await uploadNewVersion(file, {
            parent_file_id: hasExistingFileAssetId,
            version_description: `Aktualisierte Version für ${editingTestimonial.firstname || editingTestimonial.name} (${uploadMethod})`,
            changelog: `Testimonial-Bild aktualisiert am ${new Date().toLocaleDateString('de-DE')}`
          });
          
          console.log('📥 Upload-Antwort erhalten:', newVersionData);
          
          if (newVersionData.success) {
            console.log('Testimonial-Bild wurde erfolgreich versioniert');
            
            // WICHTIG: Setze JEDE neue Version als aktuelle Version
            // (Die API setzt nur die erste Version automatisch als aktuell)
            if (newVersionData.file_version?.id) {
              console.log('🔄 Setze neue Version als aktuelle Version:', newVersionData.file_version.id);
              const { setCurrentVersion } = await import('../../../lib/api/file-asset');
              
              try {
                await setCurrentVersion(newVersionData.file_version.id);
                console.log('✅ Neue Version erfolgreich als aktuelle Version gesetzt');
                console.log('📸 Das Testimonial-Bild sollte jetzt aktualisiert sein');
                
                // Lade die Testimonials neu, damit das UI das neue Bild zeigt
                console.log('🔄 Lade Testimonials neu...');
                await fetchTestimonials();
                
              } catch (setCurrentError) {
                console.error('⚠️ Fehler beim Setzen der aktuellen Version:', setCurrentError);
                console.log('💡 Versuche Fallback...');
                throw new Error('Setzen der aktuellen Version fehlgeschlagen');
              }
            } else {
              console.error('❌ Keine file_version.id in der Antwort erhalten');
              throw new Error('Unvollständige Versionierungs-Antwort');
            }
          } else {
            throw new Error(`Versionierung fehlgeschlagen: ${newVersionData.error}`);
          }
          
        } catch (versionError) {
          console.error('Fehler bei Versionierung:', versionError);
          // Fallback: Erstelle neues file_asset
          throw new Error('Versionierung fehlgeschlagen - erstelle neues file_asset');
        }
        
      } else {
        console.log('📁 NEUES FILE_ASSET wird erstellt');
        console.log('Grund: editingTestimonial =', !!editingTestimonial, '| file_asset_id =', editingTestimonial?.file_asset_id);
        
        // Erstelle detaillierte Beschreibung aus Formular-Daten
        const createDetailedDescription = () => {
          const details = [];
          
          // Name und Grundinfo
          const fullName = `${newTestimonial.firstname || ''} ${newTestimonial.lastname || ''}`.trim();
          details.push(`Testimonial-Portrait: ${fullName || 'Mitglied'}`);
          
          // Demographische Daten
          if (newTestimonial.age || newTestimonial.gender || newTestimonial.location) {
            const demo = [];
            if (newTestimonial.age) demo.push(`${newTestimonial.age} Jahre`);
            if (newTestimonial.gender) demo.push(newTestimonial.gender);
            if (newTestimonial.location) demo.push(newTestimonial.location);
            details.push(`(${demo.join(', ')})`);
          }
          
          // Bewertung
          details.push(`${newTestimonial.rating}/5 Sterne`);
          
          // Mitglied seit
          if (newTestimonial.member_since) {
            const memberDate = new Date(newTestimonial.member_since);
            details.push(`Mitglied seit ${memberDate.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}`);
          }
          
          // Trainingsziele
          if (newTestimonial.training_goals.length > 0) {
            details.push(`Ziele: ${newTestimonial.training_goals.slice(0, 3).join(', ')}${newTestimonial.training_goals.length > 3 ? '...' : ''}`);
          }
          
          // Tags
          if (newTestimonial.tags.length > 0) {
            details.push(`Tags: ${newTestimonial.tags.slice(0, 3).join(', ')}${newTestimonial.tags.length > 3 ? '...' : ''}`);
          }
          
          // Upload-Info
          details.push(`Upload: ${uploadMethod} am ${new Date().toLocaleDateString('de-DE')}`);
          
          return details.join(' | ');
        };

        const fileAssetData = {
          filename: file.name,
          file_url: fileUrl,
          category: 'image',
          type: 'portrait',
          work_area: 'Verwaltung',
          module_reference: 'landingpage',
          is_print_ready: false,
          tags: ['testimonials', 'portrait', 'mitglieder'],
          description: createDetailedDescription(),
          visibility: 'staff_only',
          is_hidden_from_staff: false,
          allowed_roles: ['admin', 'studioleiter', 'mitarbeiter'],
          created_by: null
        };

        console.log('File asset data:', fileAssetData);

        const { data: fileAsset, error: assetError } = await supabase
          .from('file_asset')
          .insert([fileAssetData])
          .select()
          .single();

        if (assetError) {
          console.error('File Asset Creation Error:', assetError);
          throw new Error(`Datei-Eintrag fehlgeschlagen: ${assetError.message}`);
        }

        console.log('File asset created:', fileAsset);

        setNewTestimonial(prev => ({
          ...prev,
          file_asset_id: fileAsset.id
        }));
      }

      console.log(`Upload erfolgreich abgeschlossen (${uploadMethod}${isEditingWithExistingImage ? ' - versioniert' : ' - neu erstellt'})`);

    } catch (error) {
      console.error('Fehler beim Upload:', error);
      
      // Bei Versionierungsfehlern: Fallback zu neuem file_asset
      if (error instanceof Error && error.message.includes('Versionierung fehlgeschlagen')) {
        console.log('Fallback: Erstelle neues file_asset anstelle der Versionierung...');
        
        try {
          // Erstelle detaillierte Beschreibung aus Formular-Daten
          const createDetailedDescription = () => {
            const details = [];
            
            // Name und Grundinfo
            const fullName = `${newTestimonial.firstname || ''} ${newTestimonial.lastname || ''}`.trim();
            details.push(`Testimonial-Portrait: ${fullName || 'Mitglied'} (Fallback)`);
            
            // Demographische Daten
            if (newTestimonial.age || newTestimonial.gender || newTestimonial.location) {
              const demo = [];
              if (newTestimonial.age) demo.push(`${newTestimonial.age} Jahre`);
              if (newTestimonial.gender) demo.push(newTestimonial.gender);
              if (newTestimonial.location) demo.push(newTestimonial.location);
              details.push(`(${demo.join(', ')})`);
            }
            
            // Bewertung
            details.push(`${newTestimonial.rating}/5 Sterne`);
            
            // Upload-Info
            details.push(`Fallback Upload: Base64 am ${new Date().toLocaleDateString('de-DE')}`);
            
            return details.join(' | ');
          };

          // Erstelle Base64 Data URL für Fallback
          const fallbackFileUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const fileAssetData = {
            filename: file.name,
            file_url: fallbackFileUrl,
            category: 'image',
            type: 'portrait',
            work_area: 'Verwaltung',
            module_reference: 'landingpage',
            is_print_ready: false,
            tags: ['testimonials', 'portrait', 'mitglieder', 'fallback'],
            description: createDetailedDescription(),
            visibility: 'staff_only',
            is_hidden_from_staff: false,
            allowed_roles: ['admin', 'studioleiter', 'mitarbeiter'],
            created_by: null
          };

          console.log('Fallback: Erstelle neues file_asset:', fileAssetData);

          const { data: fileAsset, error: assetError } = await supabase
            .from('file_asset')
            .insert([fileAssetData])
            .select()
            .single();

          if (assetError) {
            throw new Error(`Fallback fehlgeschlagen: ${assetError.message}`);
          }

          console.log('Fallback file_asset erstellt:', fileAsset);

          setNewTestimonial(prev => ({
            ...prev,
            file_asset_id: fileAsset.id
          }));
          
          console.log('Fallback-Upload erfolgreich abgeschlossen');
          return; // Beende die Funktion erfolgreich
          
        } catch (fallbackError) {
          console.error('Auch Fallback fehlgeschlagen:', fallbackError);
          alert(`Upload fehlgeschlagen. Weder Versionierung noch Fallback funktionierte: ${fallbackError instanceof Error ? fallbackError.message : 'Unbekannter Fehler'}`);
          return;
        }
      }
      
      alert(`Fehler beim Datei-Upload: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setUploading(false);
    }
  };

  // Tag hinzufügen
  const addTag = () => {
    if (newTag.trim() && !newTestimonial.tags.includes(newTag.trim())) {
      setNewTestimonial(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Tag entfernen
  const removeTag = (tagToRemove: string) => {
    setNewTestimonial(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Trainingsziel hinzufügen
  const addTrainingGoal = () => {
    if (newTrainingGoal.trim() && !newTestimonial.training_goals.includes(newTrainingGoal.trim())) {
      setNewTestimonial(prev => ({
        ...prev,
        training_goals: [...prev.training_goals, newTrainingGoal.trim()]
      }));
      setNewTrainingGoal('');
    }
  };

  // Trainingsziel entfernen
  const removeTrainingGoal = (goalToRemove: string) => {
    setNewTestimonial(prev => ({
      ...prev,
      training_goals: prev.training_goals.filter(goal => goal !== goalToRemove)
    }));
  };

  // Enter-Handler für Tags
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Enter-Handler für Trainingsziele
  const handleTrainingGoalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTrainingGoal();
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    console.log('=== HANDLE EDIT DEBUG ===');
    console.log('Testimonial wird bearbeitet:', testimonial);
    console.log('testimonial.file_asset_id:', testimonial.file_asset_id);
    console.log('testimonial.file_asset:', testimonial.file_asset);
    
    setEditingTestimonial(testimonial);
    setNewTestimonial({
      firstname: testimonial.firstname || '',
      lastname: testimonial.lastname || '',
      gender: testimonial.gender || '',
      age: testimonial.age?.toString() || '',
      location: testimonial.location || '',
      rating: testimonial.rating,
      text_content: testimonial.text_content,
      tags: testimonial.tags || [],
      training_goals: testimonial.training_goals || [],
      member_since: testimonial.member_since || '',
      file_asset_id: testimonial.file_asset_id || '',
      is_active: testimonial.is_active
    });
    
    console.log('editingTestimonial gesetzt auf:', testimonial);
    console.log('newTestimonial.file_asset_id gesetzt auf:', testimonial.file_asset_id || '');
    console.log('=== HANDLE EDIT DEBUG ENDE ===');
    
    setShowCreateModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Testimonial wirklich löschen?')) return;
    
    try {
      // Testimonial mit file_asset_id laden
      const { data: testimonial, error: fetchError } = await supabase
        .from('testimonials')
        .select('file_asset_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Fehler beim Laden des Testimonials:', fetchError);
        throw fetchError;
      }

      // Zuerst verknüpftes file_asset löschen (falls vorhanden)
      if (testimonial?.file_asset_id) {
        console.log('Lösche verknüpftes file_asset:', testimonial.file_asset_id);
        
        const { error: fileAssetError } = await supabase
          .from('file_asset')
          .delete()
          .eq('id', testimonial.file_asset_id);

        if (fileAssetError) {
          console.error('Fehler beim Löschen des file_asset:', fileAssetError);
          // Trotzdem fortfahren mit Testimonial-Löschung
        } else {
          console.log('File asset erfolgreich gelöscht');
        }
      }

      // Dann das Testimonial löschen
      const { error: testimonialError } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (testimonialError) throw testimonialError;
      
      console.log('Testimonial erfolgreich gelöscht');
      fetchTestimonials();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert(`Fehler beim Löschen des Testimonials: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Fehler beim Ändern des Status:', error);
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

  // Temporäre Funktion zur Datenbank-Reparatur (vereinfacht)
  const fixDatabase = async () => {
    try {
      console.log('Prüfe Datenbank-Struktur...');
      
      // Einfacher Test: Versuche eine Abfrage mit allen neuen Feldern
      const { data: testData, error: testError } = await supabase
        .from('testimonials')
        .select('id, firstname, lastname, gender, name, rating, text_content')
        .limit(1);

      if (testError) {
        console.error('Datenbank-Struktur unvollständig:', testError);
        console.log('HINWEIS: Führe manuell das SQL-Skript "fix_testimonials_database.sql" in Supabase aus');
        
        // Fallback: Versuche nur mit den Grundfeldern zu arbeiten
        console.log('Verwende Fallback-Modus...');
      } else {
        console.log('Datenbank-Struktur ist vollständig:', testData);
      }

    } catch (error) {
      console.error('Fehler bei Datenbank-Prüfung:', error);
      console.log('HINWEIS: Führe manuell das SQL-Skript "fix_testimonials_database.sql" in Supabase aus');
    }
  };

  // Debug-Funktion zur Analyse der Daten
  const debugTestimonials = async () => {
    try {
      console.log('=== TESTIMONIALS DEBUG ===');
      
      // 1. Prüfe Testimonials-Struktur
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from('testimonials')
        .select('*')
        .limit(1);
        
      console.log('Testimonials Struktur:', testimonialsData);
      console.log('Testimonials Error:', testimonialsError);
      
      // 2. Prüfe file_asset Verbindungen
      const { data: fileAssets, error: fileAssetsError } = await supabase
        .from('file_asset')
        .select('*')
        .eq('module_reference', 'landingpage')
        .contains('tags', ['testimonials']);
        
      console.log('File Assets mit testimonials Tag:', fileAssets);
      console.log('File Assets Error:', fileAssetsError);
      
      // 3. Prüfe verknüpfte Daten
      const { data: linkedData, error: linkedError } = await supabase
        .from('testimonials')
        .select(`
          *,
          file_asset:file_asset_id (
            id,
            filename,
            file_url,
            tags,
            module_reference
          )
        `);
        
      console.log('Verknüpfte Testimonials + File Assets:', linkedData);
      console.log('Verknüpfung Error:', linkedError);
      
      console.log('=== DEBUG ENDE ===');
      
    } catch (error) {
      console.error('Debug Fehler:', error);
    }
  };

  // Test-Funktion für Versionierungs-Infrastruktur
  const testVersioningInfrastructure = async () => {
    try {
      console.log('=== VERSIONIERUNGS-INFRASTRUKTUR TEST ===');
      
      // 1. Prüfe ob file_versions Tabelle existiert
      const { data: versionsTest, error: versionsError } = await supabase
        .from('file_versions')
        .select('id')
        .limit(1);
        
      if (versionsError) {
        console.error('❌ file_versions Tabelle NICHT verfügbar:', versionsError);
        console.log('💡 LÖSUNG: Führe das SQL-Skript "file_versions_setup_clean.sql" in Supabase aus');
        alert('Die Versionierungs-Tabelle existiert noch nicht. Führe das SQL-Skript "file_versions_setup_clean.sql" in Supabase aus.');
        return;
      }
      
      console.log('✅ file_versions Tabelle verfügbar');
      
      // 2. Prüfe ob get_next_version_number Funktion existiert
      const { data: functionTest, error: functionError } = await supabase
        .rpc('get_next_version_number', { parent_id: '00000000-0000-0000-0000-000000000000' });
        
      if (functionError) {
        console.error('❌ get_next_version_number Funktion NICHT verfügbar:', functionError);
        console.log('💡 LÖSUNG: Führe das SQL-Skript "file_versions_setup_clean.sql" in Supabase aus');
        alert('Die Versionierungs-Funktion existiert noch nicht. Führe das SQL-Skript "file_versions_setup_clean.sql" in Supabase aus.');
        return;
      }
      
      console.log('✅ get_next_version_number Funktion verfügbar');
      
      // 3. Teste die API-Funktionen
      try {
        const { getFileVersions } = await import('../../../lib/api/file-asset');
        console.log('✅ API-Funktionen erfolgreich importiert');
        
        console.log('🎉 VERSIONIERUNGS-INFRASTRUKTUR VOLLSTÄNDIG VERFÜGBAR!');
        alert('✅ Versionierungs-Infrastruktur ist vollständig verfügbar und funktionsfähig!');
        
      } catch (importError) {
        console.error('❌ Problem beim Import der API-Funktionen:', importError);
        alert('Problem beim Import der Versionierungs-Funktionen.');
      }
      
      console.log('=== VERSIONIERUNGS TEST ENDE ===');
      
    } catch (error) {
      console.error('Allgemeiner Fehler beim Versionierungs-Test:', error);
    }
  };

  // Debug Button (temporär)
  const showDebugInfo = () => {
    debugTestimonials();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Testimonials</h2>
          <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Testimonials</h2>
          <p className="text-gray-600 mt-1">
            {testimonials.length} Kundenbewertung{testimonials.length !== 1 ? 'en' : ''} verfügbar
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Neues Testimonial
          </button>
          
          {/* Temporärer Debug Button */}
          <button
            onClick={showDebugInfo}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🐛 Debug
          </button>
          
          {/* Test-Button für Versionierung */}
          <button
            onClick={testVersioningInfrastructure}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔄 Test Versionierung
          </button>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-2xl font-semibold">{testimonials.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Star size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aktiv</p>
              <p className="text-2xl font-semibold">
                {testimonials.filter(t => t.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ø Bewertung</p>
              <p className="text-2xl font-semibold">
                {testimonials.length > 0 
                  ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter und Suche */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">Filter & Suche</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Suchfeld */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Name, Ort, Tags durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Geschlecht Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Alle Geschlechter</option>
            <option value="Männlich">Männlich</option>
            <option value="Weiblich">Weiblich</option>
            <option value="Divers">Divers</option>
          </select>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Alle Bewertungen</option>
            <option value="5">5 Sterne</option>
            <option value="4">4+ Sterne</option>
            <option value="3">3+ Sterne</option>
            <option value="2">2+ Sterne</option>
            <option value="1">1+ Sterne</option>
          </select>

          {/* Tag Filter */}
          <input
            type="text"
            placeholder="Nach Tags filtern..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter-Anzeige und Reset */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            {filteredTestimonials.length} von {testimonials.length} Testimonials angezeigt
          </div>
          
          {(searchTerm || genderFilter || ratingFilter || tagFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setGenderFilter('');
                setRatingFilter('');
                setTagFilter('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white p-6 rounded-lg border border-gray-200 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {testimonial.file_asset_id && testimonial.file_asset ? (
                  <img
                    src={testimonial.file_asset.file_url}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="p-2 bg-gray-100 rounded-full">
                    <User size={20} className="text-gray-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {testimonial.firstname && testimonial.lastname 
                      ? `${testimonial.firstname} ${testimonial.lastname}`
                      : testimonial.name
                    }
                  </h3>
                  <div className="text-sm text-gray-600">
                    {testimonial.age && `${testimonial.age} Jahre`}
                    {testimonial.age && (testimonial.location || testimonial.gender) && ', '}
                    {testimonial.gender && testimonial.gender}
                    {testimonial.gender && testimonial.location && ', '}
                    {testimonial.location}
                  </div>
                  {testimonial.member_since && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} />
                      Mitglied seit {new Date(testimonial.member_since).toLocaleDateString('de-DE', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                testimonial.is_active 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {testimonial.is_active ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>

            <div className="mb-4">
              {renderStars(testimonial.rating)}
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-3">
              "{testimonial.text_content}"
            </p>

            {testimonial.tags && testimonial.tags.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {testimonial.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                  {testimonial.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{testimonial.tags.length - 3}</span>
                  )}
                </div>
              </div>
            )}

            {testimonial.training_goals && testimonial.training_goals.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                  <Target size={12} />
                  Trainingsziele:
                </p>
                <div className="flex flex-wrap gap-1">
                  {testimonial.training_goals.slice(0, 2).map((goal, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
                      {goal}
                    </span>
                  ))}
                  {testimonial.training_goals.length > 2 && (
                    <span className="text-xs text-gray-500">+{testimonial.training_goals.length - 2}</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => toggleStatus(testimonial.id, testimonial.is_active)}
                className={`text-sm px-3 py-1 rounded ${
                  testimonial.is_active 
                    ? 'text-orange-600 hover:bg-orange-50'
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                {testimonial.is_active ? 'Deaktivieren' : 'Aktivieren'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50"
                  title="Bearbeiten"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && testimonials.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Search size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Testimonials gefunden</h3>
          <p className="text-gray-600 mb-4">
            Keine Testimonials entsprechen den aktuellen Filterkriterien.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setGenderFilter('');
              setRatingFilter('');
              setTagFilter('');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}

      {testimonials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Noch keine Testimonials erstellt
          </h3>
          <p className="text-gray-600 mb-6">
            Sammeln Sie Kundenbewertungen für Ihre Landingpages.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Erstes Testimonial erstellen
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <h3 className="text-lg font-semibold mb-6">
                {editingTestimonial ? 'Testimonial bearbeiten' : 'Neues Testimonial'}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vorname *
                    </label>
                    <input
                      type="text"
                      value={newTestimonial.firstname}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, firstname: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nachname
                    </label>
                    <input
                      type="text"
                      value={newTestimonial.lastname}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, lastname: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geschlecht
                    </label>
                    <select
                      value={newTestimonial.gender}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, gender: e.target.value as 'Männlich' | 'Weiblich' | 'Divers' | '' }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Bitte wählen</option>
                      <option value="Männlich">Männlich</option>
                      <option value="Weiblich">Weiblich</option>
                      <option value="Divers">Divers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alter
                    </label>
                    <input
                      type="number"
                      value={newTestimonial.age}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ort
                    </label>
                    <input
                      type="text"
                      value={newTestimonial.location}
                      onChange={(e) => setNewTestimonial(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bewertung
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewTestimonial(prev => ({ ...prev, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          size={24}
                          className={star <= newTestimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Testimonial-Text *
                  </label>
                  <textarea
                    value={newTestimonial.text_content}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, text_content: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    required
                  />
                </div>

                {/* Bild Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Upload size={16} className="inline mr-1" />
                    Mitgliederbild
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {uploading && (
                    <p className="text-sm text-blue-600 mt-1">Wird hochgeladen...</p>
                  )}
                  {newTestimonial.file_asset_id && (
                    <p className="text-sm text-green-600 mt-1">✓ Bild hochgeladen</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Tag size={16} className="inline mr-1" />
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        placeholder="Tag eingeben und Enter drücken"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Hinzufügen
                      </button>
                    </div>
                    {newTestimonial.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newTestimonial.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Trainingsziele */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Target size={16} className="inline mr-1" />
                    Trainingsziele
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTrainingGoal}
                        onChange={(e) => setNewTrainingGoal(e.target.value)}
                        onKeyPress={handleTrainingGoalKeyPress}
                        placeholder="Trainingsziel eingeben und Enter drücken"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addTrainingGoal}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Hinzufügen
                      </button>
                    </div>
                    {newTestimonial.training_goals.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newTestimonial.training_goals.map((goal, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
                          >
                            {goal}
                            <button
                              type="button"
                              onClick={() => removeTrainingGoal(goal)}
                              className="text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mitglied seit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar size={16} className="inline mr-1" />
                    Mitglied seit
                  </label>
                  <input
                    type="date"
                    value={newTestimonial.member_since}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, member_since: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={newTestimonial.is_active}
                    onChange={(e) => setNewTestimonial(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Testimonial ist aktiv
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTestimonial ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 