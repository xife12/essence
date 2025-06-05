'use client';

import React, { useState } from 'react';
import { X, Upload, RotateCw, Target, DollarSign, Calendar, Lightbulb } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AdCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onAdCreated: (ad: any) => void;
}

interface AdData {
  title: string;
  description: string;
  target_audience: string;
  budget: number;
  duration: number;
  image_url: string;
}

export default function AdCreationModal({ isOpen, onClose, campaignId, onAdCreated }: AdCreationModalProps) {
  const [step, setStep] = useState<'details' | 'creative' | 'budget'>('details');
  const [adData, setAdData] = useState<AdData>({
    title: '',
    description: '',
    target_audience: '',
    budget: 0,
    duration: 7,
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  const supabase = createClientComponentClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'duration' ? parseFloat(value) : value
    }));
  };

  const generateAISuggestions = async () => {
    if (!adData.target_audience) {
      alert('Bitte geben Sie eine Zielgruppe ein, um KI-Vorschläge zu generieren.');
      return;
    }

    setGeneratingSuggestions(true);
    
    // In einer echten Anwendung würde hier ein API-Aufruf an einen KI-Service erfolgen
    // Für dieses Beispiel generieren wir einfach einige Beispiel-Vorschläge
    
    setTimeout(() => {
      const sampleSuggestions = [
        `Jetzt neu bei uns: Fitness für ${adData.target_audience}! Buche jetzt und erhalte 2 Wochen gratis.`,
        `Speziell für ${adData.target_audience}: Unser Trainingsangebot passt sich genau an deine Bedürfnisse an!`,
        `${adData.target_audience} aufgepasst! Unser exklusives Angebot: Jetzt Mitglied werden und 50% auf die erste Monatsgebühr sparen.`,
        `Kraft, Ausdauer, Gesundheit - Alles was ${adData.target_audience} braucht in einem Trainingsplan.`
      ];
      
      setAiSuggestions(sampleSuggestions);
      setGeneratingSuggestions(false);
    }, 1500);
  };

  const useSuggestion = (suggestion: string) => {
    setAdData(prev => ({
      ...prev,
      description: suggestion
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // Prüfen, ob der Storage-Bucket existiert
      const { data: buckets } = await supabase.storage.listBuckets();
      const campaignBucket = buckets?.find(bucket => bucket.name === 'campaign_assets');
      
      if (!campaignBucket) {
        // In einem echten Projekt würden wir hier den Bucket erstellen
        console.error('Bucket nicht gefunden');
        setLoading(false);
        return;
      }

      // Datei hochladen
      const { data, error } = await supabase.storage
        .from('campaign_assets')
        .upload(`ads/${campaignId}/${file.name}`, file);

      if (error) throw error;

      // Öffentliche URL generieren
      const { data: urlData } = supabase.storage
        .from('campaign_assets')
        .getPublicUrl(`ads/${campaignId}/${file.name}`);

      setAdData(prev => ({
        ...prev,
        image_url: urlData.publicUrl
      }));
    } catch (error) {
      console.error('Fehler beim Upload:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 'details') setStep('creative');
    else if (step === 'creative') setStep('budget');
  };

  const prevStep = () => {
    if (step === 'creative') setStep('details');
    else if (step === 'budget') setStep('creative');
  };

  const saveAd = async () => {
    try {
      setLoading(true);
      
      // Prüfen, ob die Tabelle existiert
      const { count, error: countError } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        // Tabelle existiert möglicherweise nicht, wir würden sie erstellen
        console.log('Tabelle möglicherweise nicht vorhanden');
      }

      // Anzeige speichern
      const { data, error } = await supabase
        .from('ads')
        .insert([
          {
            campaign_id: campaignId,
            title: adData.title,
            description: adData.description,
            target_audience: adData.target_audience,
            budget: adData.budget,
            duration: adData.duration,
            image_url: adData.image_url,
            status: 'draft'
          }
        ])
        .select();

      if (error) throw error;
      
      onAdCreated(data[0]);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Anzeige. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {step === 'details' && 'Anzeige erstellen - Grunddaten'}
            {step === 'creative' && 'Anzeige erstellen - Kreativ-Inhalte'}
            {step === 'budget' && 'Anzeige erstellen - Budget & Laufzeit'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel der Anzeige
                </label>
                <input
                  type="text"
                  name="title"
                  value={adData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 'Sommer-Fitness-Angebot'"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Target size={16} />
                    <span>Zielgruppe</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="target_audience"
                  value={adData.target_audience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 'Frauen 30-45 in Hamburg'"
                />
              </div>
            </div>
          )}

          {step === 'creative' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Anzeigetext
                  </label>
                  <button
                    onClick={generateAISuggestions}
                    className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    disabled={generatingSuggestions}
                  >
                    {generatingSuggestions ? (
                      <>
                        <RotateCw size={14} className="animate-spin" />
                        Generiere Vorschläge...
                      </>
                    ) : (
                      <>
                        <Lightbulb size={14} />
                        KI-Vorschläge generieren
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  name="description"
                  value={adData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Beschreiben Sie Ihr Angebot..."
                />
              </div>

              {aiSuggestions.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Lightbulb size={16} className="text-yellow-500" />
                    KI-Vorschläge
                  </h4>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded-md border border-blue-100">
                        <p className="text-sm text-gray-800">{suggestion}</p>
                        <button
                          onClick={() => useSuggestion(suggestion)}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Diesen Vorschlag verwenden
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bild hochladen
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  {adData.image_url ? (
                    <div className="space-y-2">
                      <img 
                        src={adData.image_url} 
                        alt="Vorschau" 
                        className="mx-auto h-32 object-contain"
                      />
                      <p className="text-sm text-green-600">Bild erfolgreich hochgeladen</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                        >
                          <span>Bild hochladen</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={loading}
                          />
                        </label>
                        <p className="pl-1">oder per Drag & Drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG bis zu 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'budget' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    <span>Budget pro Tag (€)</span>
                  </div>
                </label>
                <input
                  type="number"
                  name="budget"
                  value={adData.budget}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Laufzeit (Tage)</span>
                  </div>
                </label>
                <select
                  name="duration"
                  value={adData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1 Tag</option>
                  <option value="3">3 Tage</option>
                  <option value="7">1 Woche</option>
                  <option value="14">2 Wochen</option>
                  <option value="30">30 Tage</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                <h4 className="font-medium text-blue-800 mb-2">Zusammenfassung</h4>
                <ul className="space-y-1 text-sm">
                  <li><span className="text-gray-600">Titel:</span> {adData.title}</li>
                  <li><span className="text-gray-600">Zielgruppe:</span> {adData.target_audience}</li>
                  <li><span className="text-gray-600">Budget:</span> {adData.budget}€ pro Tag</li>
                  <li><span className="text-gray-600">Gesamtbudget:</span> {adData.budget * adData.duration}€</li>
                  <li><span className="text-gray-600">Laufzeit:</span> {adData.duration} Tage</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between">
          {step !== 'details' ? (
            <button
              onClick={prevStep}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
            >
              Zurück
            </button>
          ) : (
            <div></div>
          )}
          
          {step !== 'budget' ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              disabled={
                (step === 'details' && (!adData.title || !adData.target_audience)) ||
                (step === 'creative' && (!adData.description))
              }
            >
              Weiter
            </button>
          ) : (
            <button
              onClick={saveAd}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              disabled={loading || !adData.budget}
            >
              {loading ? (
                <>
                  <RotateCw size={18} className="animate-spin" />
                  Speichern...
                </>
              ) : (
                'Anzeige erstellen'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 