import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';

// Definiere Typen
interface MitarbeiterDaten {
  id: string;
  name: string;
  position: string;
  monatsstunden: number;
  zielvorgabe: number;
  ueberstunden: number;
  urlaubsstand: string;
  kranktage: number;
  fortbildungen: number;
}

interface StundenDetails {
  id: string;
  mitarbeiterId: string;
  mitarbeiterName: string;
  datum: string;
  stunden: number;
  typ: string;
  grund?: string;
  stundenkonto: number;
}

// Definiere Styles für das PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  firmHeader: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  header: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  exportInfo: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'center',
    color: '#6B7280',
  },
  mitarbeiterBox: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 5,
  },
  mitarbeiterHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 5,
    backgroundColor: '#F3F4F6',
  },
  mitarbeiterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 10,
    marginBottom: 5,
    flexBasis: '30%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    padding: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    padding: 5,
    fontSize: 10,
  },
  col1: { width: '25%' },
  col2: { width: '15%' },
  col3: { width: '15%' },
  col4: { width: '30%' },
  col5: { width: '15%' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  positive: {
    color: '#059669',
  },
  negative: {
    color: '#DC2626',
  },
});

// Formatiere Datum
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE');
};

// Übersetze Typen
const translateType = (type: string) => {
  switch(type) {
    case 'arbeitszeit': return 'Arbeitszeit';
    case 'urlaub': return 'Urlaub';
    case 'krankheit': return 'Krankheit';
    case 'fortbildung': return 'Fortbildung';
    case 'abwesenheit': return 'Abwesenheit';
    default: return type;
  }
};

// PDF Dokument Komponente
const StundenPDF = ({ 
  mitarbeiterDaten, 
  stundenDetails,
  monat,
  jahr,
  exportiertVon
}: { 
  mitarbeiterDaten: MitarbeiterDaten[],
  stundenDetails: StundenDetails[],
  monat: string,
  jahr: string,
  exportiertVon: string
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.firmHeader}>Essence Sports- und Wellnessclub</Text>
      <Text style={styles.header}>Stundenauswertung</Text>
      <Text style={{ fontSize: 12, marginBottom: 8, textAlign: 'center' }}>
        {monat} {jahr}
      </Text>
      <Text style={styles.exportInfo}>
        Exportiert von: {exportiertVon} | Datum: {new Date().toLocaleDateString('de-DE')}
      </Text>
      
      <Text style={styles.subheader}>Zusammenfassung</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.col1}>Mitarbeiter</Text>
        <Text style={styles.col2}>Stunden</Text>
        <Text style={styles.col3}>Soll</Text>
        <Text style={styles.col4}>Überstunden</Text>
        <Text style={styles.col5}>Urlaubsstand</Text>
      </View>
      
      {mitarbeiterDaten.map((ma) => (
        <View key={ma.id} style={styles.tableRow}>
          <Text style={styles.col1}>{ma.name}</Text>
          <Text style={styles.col2}>{ma.monatsstunden} h</Text>
          <Text style={styles.col3}>{ma.zielvorgabe} h</Text>
          <Text style={[
            styles.col4, 
            ma.ueberstunden >= 0 ? styles.positive : styles.negative
          ]}>
            {ma.ueberstunden > 0 ? '+' : ''}{ma.ueberstunden} h
          </Text>
          <Text style={styles.col5}>{ma.urlaubsstand}</Text>
        </View>
      ))}
      
      {mitarbeiterDaten.map((mitarbeiter) => {
        // Filtere Stunden für diesen Mitarbeiter
        const mitarbeiterStunden = stundenDetails.filter(
          (stunde) => stunde.mitarbeiterId === mitarbeiter.id
        );
        
        // Sortiere nach Datum
        mitarbeiterStunden.sort((a, b) => 
          new Date(a.datum).getTime() - new Date(b.datum).getTime()
        );
        
        return (
          <View key={mitarbeiter.id} style={styles.mitarbeiterBox}>
            <Text style={styles.mitarbeiterHeader}>{mitarbeiter.name} - {mitarbeiter.position}</Text>
            
            <View style={styles.mitarbeiterInfo}>
              <Text style={styles.infoItem}>Stunden: {mitarbeiter.monatsstunden} / {mitarbeiter.zielvorgabe} h</Text>
              <Text style={styles.infoItem}>Überstunden: {mitarbeiter.ueberstunden > 0 ? '+' : ''}{mitarbeiter.ueberstunden} h</Text>
              <Text style={styles.infoItem}>Urlaubsstand: {mitarbeiter.urlaubsstand}</Text>
            </View>
            
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Datum</Text>
              <Text style={styles.col2}>Stunden</Text>
              <Text style={styles.col3}>Typ</Text>
              <Text style={styles.col4}>Grund</Text>
              <Text style={styles.col5}>Stundenkonto</Text>
            </View>
            
            {mitarbeiterStunden.length > 0 ? (
              mitarbeiterStunden.map((stunde) => (
                <View key={stunde.id} style={styles.tableRow}>
                  <Text style={styles.col1}>{formatDate(stunde.datum)}</Text>
                  <Text style={styles.col2}>{stunde.stunden} h</Text>
                  <Text style={styles.col3}>{translateType(stunde.typ)}</Text>
                  <Text style={styles.col4}>{stunde.grund || '-'}</Text>
                  <Text style={[
                    styles.col5,
                    stunde.stundenkonto >= 0 ? styles.positive : styles.negative
                  ]}>
                    {stunde.stundenkonto > 0 ? '+' : ''}{stunde.stundenkonto} h
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={{ width: '100%', textAlign: 'center', fontStyle: 'italic' }}>
                  Keine Einträge für diesen Zeitraum
                </Text>
              </View>
            )}
          </View>
        );
      })}
      
      <Text style={styles.footer}>
        Essence Sports- und Wellnessclub | Erstellt am {new Date().toLocaleDateString('de-DE')} um {new Date().toLocaleTimeString('de-DE')}
      </Text>
    </Page>
  </Document>
);

// Exportfunktion mit Download-Link
export const PDFExportLink = ({
  mitarbeiterDaten,
  stundenDetails,
  monat,
  jahr,
  exportiertVon = "Administrator",
  children
}: {
  mitarbeiterDaten: MitarbeiterDaten[],
  stundenDetails: StundenDetails[],
  monat: string,
  jahr: string,
  exportiertVon?: string,
  children: React.ReactNode
}) => (
  <PDFDownloadLink
    document={
      <StundenPDF 
        mitarbeiterDaten={mitarbeiterDaten} 
        stundenDetails={stundenDetails}
        monat={monat}
        jahr={jahr}
        exportiertVon={exportiertVon}
      />
    }
    fileName={`Stundenauswertung_${monat}_${jahr}.pdf`}
    style={{
      textDecoration: 'none',
      color: 'inherit'
    }}
  >
    {({ loading }) => (loading ? 'Wird generiert...' : children)}
  </PDFDownloadLink>
); 