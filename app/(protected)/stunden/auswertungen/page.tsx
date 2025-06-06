'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Download, FileText, BarChart, PieChart, Users, Filter } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Dropdown from '../../../components/ui/Dropdown';
import Table from '../../../components/ui/Table';
import StundenCard from '../../../components/stunden/StundenCard';
import dynamic from 'next/dynamic';

// Dynamic import für PDF-Komponente um SSR-Probleme zu vermeiden
const PDFExportLink = dynamic(
  () => import('../../../components/stunden/PDFExport').then(mod => ({ default: mod.PDFExportLink })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse">PDF wird geladen...</div>
  }
);

// Dummy-Daten für die Mitarbeiterübersicht
const MITARBEITER_DATEN = [
  {
    id: '1',
    name: 'Max Mustermann',
    position: 'Trainer',
    monatsstunden: 162.5,
    zielvorgabe: 160,
    ueberstunden: 2.5,
    urlaubsstand: '5/30',
    kranktage: 2,
    fortbildungen: 1
  },
  {
    id: '2',
    name: 'Anna Schmidt',
    position: 'Rezeption',
    monatsstunden: 80,
    zielvorgabe: 80,
    ueberstunden: 0,
    urlaubsstand: '8/25',
    kranktage: 0,
    fortbildungen: 0
  },
  {
    id: '3',
    name: 'Thomas Weber',
    position: 'Trainer',
    monatsstunden: 145,
    zielvorgabe: 160,
    ueberstunden: -15,
    urlaubsstand: '12/30',
    kranktage: 3,
    fortbildungen: 2
  },
  {
    id: '4',
    name: 'Sabine Müller',
    position: 'Studioleitung',
    monatsstunden: 175.5,
    zielvorgabe: 160,
    ueberstunden: 15.5,
    urlaubsstand: '10/30',
    kranktage: 0,
    fortbildungen: 3
  },
  {
    id: '5',
    name: 'Michael Fischer',
    position: 'Trainer (Teilzeit)',
    monatsstunden: 92,
    zielvorgabe: 80,
    ueberstunden: 12,
    urlaubsstand: '4/15',
    kranktage: 1,
    fortbildungen: 0
  }
];

// Dummy-Daten für die detaillierte Stundenübersicht
const STUNDEN_DETAILS = [
  {
    id: '1',
    mitarbeiterId: '1',
    mitarbeiterName: 'Max Mustermann',
    datum: '2023-08-02',
    stunden: 8,
    typ: 'arbeitszeit',
    grund: 'Reguläre Arbeitszeit',
    stundenkonto: 2.5
  },
  {
    id: '2',
    mitarbeiterId: '1',
    mitarbeiterName: 'Max Mustermann',
    datum: '2023-08-03',
    stunden: 8.5,
    typ: 'arbeitszeit',
    grund: 'Zusatzaufgabe',
    stundenkonto: 2.5
  },
  {
    id: '3',
    mitarbeiterId: '1',
    mitarbeiterName: 'Max Mustermann',
    datum: '2023-08-04',
    stunden: 8,
    typ: 'urlaub',
    grund: 'Urlaub',
    stundenkonto: 2.5
  },
  {
    id: '4',
    mitarbeiterId: '2',
    mitarbeiterName: 'Anna Schmidt',
    datum: '2023-08-02',
    stunden: 4,
    typ: 'arbeitszeit',
    grund: 'Reguläre Arbeitszeit',
    stundenkonto: 0
  },
  {
    id: '5',
    mitarbeiterId: '2',
    mitarbeiterName: 'Anna Schmidt',
    datum: '2023-08-03',
    stunden: 4,
    typ: 'arbeitszeit',
    grund: 'Reguläre Arbeitszeit',
    stundenkonto: 0
  },
  {
    id: '6',
    mitarbeiterId: '3',
    mitarbeiterName: 'Thomas Weber',
    datum: '2023-08-01',
    stunden: 8,
    typ: 'krankheit',
    grund: 'Krankheit',
    stundenkonto: -15
  },
  {
    id: '7',
    mitarbeiterId: '3',
    mitarbeiterName: 'Thomas Weber',
    datum: '2023-08-02',
    stunden: 8,
    typ: 'krankheit',
    grund: 'Krankheit',
    stundenkonto: -15
  },
  {
    id: '8',
    mitarbeiterId: '4',
    mitarbeiterName: 'Sabine Müller',
    datum: '2023-08-02',
    stunden: 10,
    typ: 'arbeitszeit',
    grund: 'Projektarbeit',
    stundenkonto: 15.5
  },
  {
    id: '9',
    mitarbeiterId: '4',
    mitarbeiterName: 'Sabine Müller',
    datum: '2023-08-03',
    stunden: 8,
    typ: 'fortbildung',
    grund: 'Fortbildung: Leadership',
    stundenkonto: 15.5
  },
  {
    id: '10',
    mitarbeiterId: '5',
    mitarbeiterName: 'Michael Fischer',
    datum: '2023-08-02',
    stunden: 4,
    typ: 'arbeitszeit',
    grund: 'Reguläre Arbeitszeit',
    stundenkonto: 12
  },
  // Einträge für Juni 2023
  {
    id: '11',
    mitarbeiterId: '1',
    mitarbeiterName: 'Max Mustermann',
    datum: '2023-06-10',
    stunden: 8,
    typ: 'arbeitszeit',
    grund: 'Reguläre Arbeitszeit',
    stundenkonto: 1.5
  },
  {
    id: '12',
    mitarbeiterId: '2',
    mitarbeiterName: 'Anna Schmidt',
    datum: '2023-06-12',
    stunden: 4,
    typ: 'arbeitszeit',
    grund: 'Reguläre Arbeitszeit',
    stundenkonto: 0
  },
  {
    id: '13',
    mitarbeiterId: '3',
    mitarbeiterName: 'Thomas Weber',
    datum: '2023-06-15',
    stunden: 8,
    typ: 'arbeitszeit',
    grund: 'Reguläre Arbeitszeit',
    stundenkonto: -10
  },
  // Einträge für Juli 2023
  {
    id: '14',
    mitarbeiterId: '1',
    mitarbeiterName: 'Max Mustermann',
    datum: '2023-07-05',
    stunden: 8,
    typ: 'arbeitszeit',
    grund: 'Reguläre Arbeitszeit',
    stundenkonto: 2.0
  },
  {
    id: '15',
    mitarbeiterId: '4',
    mitarbeiterName: 'Sabine Müller',
    datum: '2023-07-10',
    stunden: 9,
    typ: 'arbeitszeit',
    grund: 'Projektarbeit',
    stundenkonto: 10.5
  },
];

export default function StundenAuswertungenPage() {
  const [selectedMitarbeiter, setSelectedMitarbeiter] = useState<string>('all');
  const [selectedMonat, setSelectedMonat] = useState<string>('2023-08');
  const [ansicht, setAnsicht] = useState<'uebersicht' | 'details' | 'stundenkonto' | 'urlaub'>('uebersicht');
  const [filteredMitarbeiterDaten, setFilteredMitarbeiterDaten] = useState(MITARBEITER_DATEN);
  const [filteredStundenDetails, setFilteredStundenDetails] = useState(STUNDEN_DETAILS);
  
  // Aktualisiere gefilterte Daten, wenn sich Filter ändern
  useEffect(() => {
    applyFilters();
  }, [selectedMitarbeiter, selectedMonat]);
  
  // Filterfunktion, die alle Daten basierend auf den ausgewählten Filtern aktualisiert
  const applyFilters = () => {
    // Stunden nach Monat und Mitarbeiter filtern
    const filteredStunden = STUNDEN_DETAILS.filter(stunde => {
      // Mitarbeiterfilter
      if (selectedMitarbeiter !== 'all' && stunde.mitarbeiterId !== selectedMitarbeiter) {
        return false;
      }
      
      // Monatsfilter
      if (!stunde.datum.startsWith(selectedMonat)) {
        return false;
      }
      
      return true;
    });
    
    setFilteredStundenDetails(filteredStunden);
    
    // Mitarbeiterdaten filtern und Werte für den ausgewählten Monat neu berechnen
    if (selectedMitarbeiter === 'all') {
      // Erstelle eine Kopie der Mitarbeiterdaten und berechne neue Werte basierend auf gefiltertem Monat
      const updatedMitarbeiterDaten = MITARBEITER_DATEN.map(mitarbeiter => {
        // Finde alle Einträge für diesen Mitarbeiter im ausgewählten Monat
        const mitarbeiterStunden = STUNDEN_DETAILS.filter(
          stunde => stunde.mitarbeiterId === mitarbeiter.id && stunde.datum.startsWith(selectedMonat)
        );
        
        // Wenn keine Daten für diesen Monat vorhanden sind, behalte die Originaldaten bei
        if (mitarbeiterStunden.length === 0) return mitarbeiter;
        
        // Berechne neue Werte basierend auf den gefilterten Daten
        const monatsstunden = mitarbeiterStunden.reduce((sum, stunde) => sum + stunde.stunden, 0);
        const ueberstunden = monatsstunden - mitarbeiter.zielvorgabe;
        const kranktage = mitarbeiterStunden.filter(s => s.typ === 'krankheit').length;
        const fortbildungen = mitarbeiterStunden.filter(s => s.typ === 'fortbildung').length;
        
        return {
          ...mitarbeiter,
          monatsstunden,
          ueberstunden,
          kranktage,
          fortbildungen
        };
      });
      
      setFilteredMitarbeiterDaten(updatedMitarbeiterDaten);
    } else {
      // Nur den ausgewählten Mitarbeiter filtern
      const selectedMitarbeiterData = MITARBEITER_DATEN.find(m => m.id === selectedMitarbeiter);
      
      if (selectedMitarbeiterData) {
        // Finde alle Einträge für diesen Mitarbeiter im ausgewählten Monat
        const mitarbeiterStunden = STUNDEN_DETAILS.filter(
          stunde => stunde.mitarbeiterId === selectedMitarbeiterData.id && stunde.datum.startsWith(selectedMonat)
        );
        
        // Wenn keine Daten für diesen Monat vorhanden sind, behalte die Originaldaten bei
        if (mitarbeiterStunden.length === 0) {
          setFilteredMitarbeiterDaten([selectedMitarbeiterData]);
        } else {
          // Berechne neue Werte basierend auf den gefilterten Daten
          const monatsstunden = mitarbeiterStunden.reduce((sum, stunde) => sum + stunde.stunden, 0);
          const ueberstunden = monatsstunden - selectedMitarbeiterData.zielvorgabe;
          const kranktage = mitarbeiterStunden.filter(s => s.typ === 'krankheit').length;
          const fortbildungen = mitarbeiterStunden.filter(s => s.typ === 'fortbildung').length;
          
          const updatedMitarbeiter = {
            ...selectedMitarbeiterData,
            monatsstunden,
            ueberstunden,
            kranktage,
            fortbildungen
          };
          
          setFilteredMitarbeiterDaten([updatedMitarbeiter]);
        }
      }
    }
  };
  
  // Filter für Mitarbeiter und Monat
  const filteredStunden = filteredStundenDetails;
  
  // Aggregierte Daten für die Übersicht (basierend auf gefilterten Daten)
  const gesamtStundenAlle = filteredMitarbeiterDaten.reduce((sum, ma) => sum + ma.monatsstunden, 0);
  const gesamtSollStundenAlle = filteredMitarbeiterDaten.reduce((sum, ma) => sum + ma.zielvorgabe, 0);
  const gesamtUeberstundenAlle = filteredMitarbeiterDaten.reduce((sum, ma) => sum + ma.ueberstunden, 0);
  const urlaubsTageGenommen = filteredMitarbeiterDaten.reduce((sum, ma) => sum + parseInt(ma.urlaubsstand.split('/')[0]), 0);
  const urlaubsTageGesamt = filteredMitarbeiterDaten.reduce((sum, ma) => sum + parseInt(ma.urlaubsstand.split('/')[1]), 0);
  
  // Statistiken
  const durchschnittUeberstunden = filteredMitarbeiterDaten.length > 0 
    ? (gesamtUeberstundenAlle / filteredMitarbeiterDaten.length).toFixed(1) 
    : "0.0";
  const gesamtKranktage = filteredMitarbeiterDaten.reduce((sum, ma) => sum + ma.kranktage, 0);
  
  // Mitarbeiter-Auswahl für Dropdown
  const mitarbeiterOptions = [
    { label: 'Alle Mitarbeiter', value: 'all' },
    ...MITARBEITER_DATEN.map(ma => ({ label: ma.name, value: ma.id }))
  ];
  
  // Monatsauswahl für Dropdown
  const monatOptions = [
    { label: 'August 2023', value: '2023-08' },
    { label: 'Juli 2023', value: '2023-07' },
    { label: 'Juni 2023', value: '2023-06' }
  ];
  
  // Ansichtsoptionen
  const ansichtOptions = [
    { 
      label: 'Übersicht', 
      value: 'uebersicht',
      icon: <BarChart size={16} />
    },
    { 
      label: 'Stundendetails', 
      value: 'details',
      icon: <Clock size={16} />
    },
    { 
      label: 'Stundenkonto', 
      value: 'stundenkonto',
      icon: <PieChart size={16} />
    },
    { 
      label: 'Urlaubsübersicht', 
      value: 'urlaub',
      icon: <Calendar size={16} />
    }
  ];
  
  // Hilfsfunktion für die Monatsnamen-Formatierung
  const getMonatName = (monat: string): string => {
    const [jahr, monatNr] = monat.split('-');
    const date = new Date(parseInt(jahr), parseInt(monatNr) - 1, 1);
    return date.toLocaleDateString('de-DE', { month: 'long' });
  };
  
  // Hilfsfunktion für Exportieren-Button
  const renderExportButton = (view: 'uebersicht' | 'details' | 'stundenkonto' | 'urlaub') => {
    // Ermittle, welche Daten basierend auf der Ansicht exportiert werden sollen
    const filteredData = selectedMitarbeiter === 'all' 
      ? STUNDEN_DETAILS 
      : STUNDEN_DETAILS.filter(s => s.mitarbeiterId === selectedMitarbeiter);
    
    const filteredMitarbeiter = selectedMitarbeiter === 'all' 
      ? MITARBEITER_DATEN 
      : MITARBEITER_DATEN.filter(m => m.id === selectedMitarbeiter);
    
    const monatName = getMonatName(selectedMonat);
    const jahr = selectedMonat.split('-')[0];
    
    // Name des aktuell exportierenden Mitarbeiters (für dieses Beispiel fest)
    // In einer echten Anwendung könnte hier der Name des eingeloggten Benutzers verwendet werden
    const exportiertVon = "Sabine Müller, Studioleitung";
    
    return (
      <PDFExportLink 
        mitarbeiterDaten={filteredMitarbeiter}
        stundenDetails={filteredData.filter(s => s.datum.startsWith(selectedMonat))}
        monat={monatName}
        jahr={jahr}
        exportiertVon={exportiertVon}
      >
        <Button
          variant="outline"
          size="sm"
          icon={<Download size={16} />}
        >
          Exportieren
        </Button>
      </PDFExportLink>
    );
  };
  
  // Filter für die aktuelle Ansicht anwenden
  const mitarbeiterColumns = [
    {
      header: 'Mitarbeiter',
      accessor: (item: any) => item.name
    },
    {
      header: 'Position',
      accessor: (item: any) => item.position
    },
    {
      header: 'Monatsstunden',
      accessor: (item: any) => item.monatsstunden + ' h'
    },
    {
      header: 'Soll',
      accessor: (item: any) => item.zielvorgabe + ' h'
    },
    {
      header: 'Überstunden',
      accessor: (item: any) => (
        <span className={item.ueberstunden >= 0 ? "text-green-600" : "text-red-600"}>
          {item.ueberstunden > 0 ? '+' : ''}{item.ueberstunden} h
        </span>
      )
    },
    {
      header: 'Urlaubsstand',
      accessor: (item: any) => item.urlaubsstand
    },
    {
      header: 'Kranktage',
      accessor: (item: any) => item.kranktage
    },
    {
      header: 'Fortbildungen',
      accessor: (item: any) => item.fortbildungen
    },
    {
      header: 'Details',
      accessor: (item: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedMitarbeiter(item.id);
            setAnsicht('details');
          }}
        >
          Details
        </Button>
      )
    }
  ];
  
  const stundenDetailsColumns = [
    {
      header: 'Datum',
      accessor: (item: any) => new Date(item.datum).toLocaleDateString('de-DE')
    },
    {
      header: 'Mitarbeiter',
      accessor: (item: any) => item.mitarbeiterName
    },
    {
      header: 'Stunden',
      accessor: (item: any) => item.stunden + ' h'
    },
    {
      header: 'Typ',
      accessor: (item: any) => {
        const typMapping: Record<string, { text: string, color: string }> = {
          arbeitszeit: { text: 'Arbeitszeit', color: 'bg-blue-100 text-blue-800' },
          urlaub: { text: 'Urlaub', color: 'bg-green-100 text-green-800' },
          krankheit: { text: 'Krankheit', color: 'bg-red-100 text-red-800' },
          fortbildung: { text: 'Fortbildung', color: 'bg-purple-100 text-purple-800' }
        };
        
        const typeInfo = typMapping[item.typ] || { text: item.typ, color: 'bg-gray-100 text-gray-800' };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
            {typeInfo.text}
          </span>
        );
      }
    },
    {
      header: 'Grund',
      accessor: (item: any) => item.grund
    },
    {
      header: 'Stundenkonto',
      accessor: (item: any) => (
        <span className={item.stundenkonto >= 0 ? "text-green-600" : "text-red-600"}>
          {item.stundenkonto > 0 ? '+' : ''}{item.stundenkonto} h
        </span>
      )
    }
  ];
  
  // Render-Funktion für die jeweilige Ansicht
  const renderContent = () => {
    switch (ansicht) {
      case 'uebersicht':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StundenCard
                title="Gesamtstunden"
                value={`${gesamtStundenAlle} / ${gesamtSollStundenAlle} h`}
                icon={<Clock size={20} />}
                description={`${Math.round((gesamtStundenAlle / gesamtSollStundenAlle) * 100) || 0}% der Sollzeit`}
                color="blue"
                progress={Math.round((gesamtStundenAlle / gesamtSollStundenAlle) * 100) || 0}
              />
              
              <StundenCard
                title="Überstunden Gesamt"
                value={`${gesamtUeberstundenAlle > 0 ? '+' : ''}${gesamtUeberstundenAlle} h`}
                icon={<Clock size={20} />}
                description={`Ø ${durchschnittUeberstunden} h pro Mitarbeiter`}
                color={gesamtUeberstundenAlle >= 0 ? "green" : "red"}
              />
              
              <StundenCard
                title="Urlaubstage"
                value={`${urlaubsTageGenommen} / ${urlaubsTageGesamt}`}
                icon={<Calendar size={20} />}
                description={`${Math.round((urlaubsTageGenommen / urlaubsTageGesamt) * 100) || 0}% verbraucht`}
                color="orange"
                progress={Math.round((urlaubsTageGenommen / urlaubsTageGesamt) * 100) || 0}
              />
              
              <StundenCard
                title="Kranktage Gesamt"
                value={gesamtKranktage}
                icon={<Calendar size={20} />}
                description="Im aktuellen Monat"
                color="red"
              />
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Mitarbeiterübersicht</h3>
                {renderExportButton('uebersicht')}
              </div>
              <Table
                data={filteredMitarbeiterDaten}
                columns={mitarbeiterColumns}
              />
            </div>
          </>
        );
      
      case 'details':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Stundendetails</h3>
              {renderExportButton('details')}
            </div>
            <Table
              data={filteredStunden}
              columns={stundenDetailsColumns}
              footer={
                <div className="flex justify-between">
                  <span>Gesamtstunden</span>
                  <span className="font-semibold">
                    {filteredStunden.reduce((sum, stunde) => sum + stunde.stunden, 0)} h
                  </span>
                </div>
              }
            />
          </div>
        );
      
      case 'stundenkonto':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Stundenkonto-Übersicht</h3>
              {renderExportButton('stundenkonto')}
            </div>
            
            <div className="mb-8">
              <h4 className="font-medium mb-4">Stundenkonto-Übersicht nach Mitarbeiter</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col space-y-4">
                  {filteredMitarbeiterDaten.map(ma => (
                    <div key={ma.id} className="flex items-center">
                      <div className="w-1/4 font-medium">{ma.name}</div>
                      <div className="w-3/4">
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className={`text-sm font-semibold ${ma.ueberstunden >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {ma.ueberstunden > 0 ? '+' : ''}{ma.ueberstunden} h
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 mt-1">
                            {ma.ueberstunden >= 0 ? (
                              <div 
                                style={{ width: `${Math.min(100, ma.ueberstunden / 20 * 100)}%` }} 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                              ></div>
                            ) : (
                              <div 
                                style={{ width: `${Math.min(100, Math.abs(ma.ueberstunden) / 20 * 100)}%` }} 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                              ></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Aktionen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  className="justify-start"
                  icon={<Clock size={16} />}
                >
                  Überstunden auszahlen
                </Button>
                <Button 
                  variant="outline"
                  className="justify-start"
                  icon={<Calendar size={16} />}
                >
                  In Urlaubstage umwandeln
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'urlaub':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Urlaubsübersicht</h3>
              {renderExportButton('urlaub')}
            </div>
            
            <div className="mb-8">
              <h4 className="font-medium mb-4">Urlaubsübersicht nach Mitarbeiter</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-col space-y-4">
                  {filteredMitarbeiterDaten.map(ma => {
                    const [genommen, gesamt] = ma.urlaubsstand.split('/').map(Number);
                    const prozent = Math.round(genommen / gesamt * 100);
                    
                    return (
                      <div key={ma.id} className="flex items-center">
                        <div className="w-1/4 font-medium">{ma.name}</div>
                        <div className="w-3/4">
                          <div className="relative pt-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-semibold text-gray-700">
                                  {genommen} / {gesamt} Tage
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {prozent}%
                              </div>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 mt-1">
                              <div 
                                style={{ width: `${prozent}%` }} 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Aktionen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  className="justify-start"
                  icon={<Calendar size={16} />}
                >
                  Urlaubsantrag genehmigen
                </Button>
                <Button 
                  variant="outline"
                  className="justify-start"
                  icon={<FileText size={16} />}
                >
                  Urlaubsübersicht drucken
                </Button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div>
      <PageHeader
        title="Stundenauswertungen"
        description="Übersicht und Analyse aller Arbeitszeiten"
      />
      
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ansicht</label>
            <Dropdown
              value={ansicht}
              onChange={value => setAnsicht(value as any)}
              options={ansichtOptions}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter</label>
            <Dropdown
              value={selectedMitarbeiter}
              onChange={setSelectedMitarbeiter}
              options={mitarbeiterOptions}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monat</label>
            <Dropdown
              value={selectedMonat}
              onChange={setSelectedMonat}
              options={monatOptions}
            />
          </div>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
} 