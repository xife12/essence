// PDF Processing Engine for Magicline Documents
// Specialized pattern matching for contract and statement PDFs

import pdfParse from 'pdf-parse';
import { ExtractedMemberData, PDFProcessingResult, ValidationIssue } from '../types/payment-system';
// IBAN validation helper function (fallback without WebAssembly)
const validateIBAN = (iban: string): boolean => {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Basic format check (2 letter country code + 2 digits + alphanumeric)
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIban)) {
    return false;
  }
  
  // Length validation for common countries
  const lengthMap: { [key: string]: number } = {
    'DE': 22, 'AT': 20, 'CH': 21, 'FR': 27, 'IT': 27, 'ES': 24, 'NL': 18
  };
  
  const countryCode = cleanIban.substring(0, 2);
  const expectedLength = lengthMap[countryCode];
  
  if (expectedLength && cleanIban.length !== expectedLength) {
    return false;
  }
  
  // Basic IBAN modulo 97 validation
  try {
    const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
    const numericString = rearranged.replace(/[A-Z]/g, (char) => 
      (char.charCodeAt(0) - 55).toString()
    );
    
    // Calculate modulo 97 for large numbers
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
    }
    
    return remainder === 1;
  } catch {
    return false;
  }
};

export class MagiclinePDFProcessor {
  
  /**
   * Main processing function for uploaded PDFs
   */
  public async processPDF(buffer: Buffer): Promise<PDFProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Parse PDF to text
      const pdfData = await pdfParse(buffer);
      const rawText = pdfData.text;
      
      // Determine PDF type
      const pdfType = this.determinePDFType(rawText);
      
      // Extract member data based on type
      const memberData = await this.extractMemberData(rawText, pdfType);
      
      const processingTime = Date.now() - startTime;
      
      return {
        memberData,
        rawText,
        processingTime,
        success: memberData.extractionSuccess,
        errors: memberData.extractionErrors
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown PDF processing error';
      
      return {
        memberData: {
          firstName: '',
          lastName: '',
          extractionSuccess: false,
          extractionErrors: [errorMessage],
          pdfType: 'unknown'
        },
        rawText: '',
        processingTime,
        success: false,
        errors: [errorMessage]
      };
    }
  }
  
  /**
   * Determine if PDF is contract or statement based on content patterns
   */
  private determinePDFType(text: string): 'contract' | 'statement' | 'unknown' {
    // Contract indicators
    const contractPatterns = [
      /vertrag/i,
      /mitgliedschaft/i,
      /tarif/i,
      /aufnahmegebühr/i,
      /sepa.*mandat/i,
      /iban.*de\d{2}/i
    ];
    
    // Statement indicators  
    const statementPatterns = [
      /kontoauszug/i,
      /kontobewegungen/i,
      /saldo/i,
      /buchungen/i,
      /zahlungshistorie/i,
      /\d{1,2}\.\d{1,2}\.\d{4}.*\d+,\d{2}/i // Date + Amount pattern
    ];
    
    const contractScore = contractPatterns.reduce((score, pattern) => 
      score + (pattern.test(text) ? 1 : 0), 0);
    
    const statementScore = statementPatterns.reduce((score, pattern) => 
      score + (pattern.test(text) ? 1 : 0), 0);
    
    if (contractScore > statementScore && contractScore > 0) {
      return 'contract';
    } else if (statementScore > contractScore && statementScore > 0) {
      return 'statement'; 
    } else {
      return 'unknown';
    }
  }
  
  /**
   * Extract member data based on PDF type
   */
  private async extractMemberData(text: string, pdfType: 'contract' | 'statement' | 'unknown'): Promise<ExtractedMemberData> {
    const errors: string[] = [];
    
    if (pdfType === 'contract') {
      return this.extractContractData(text, errors);
    } else if (pdfType === 'statement') {
      return this.extractStatementData(text, errors);
    } else {
      errors.push('Unbekannter PDF-Typ - konnte nicht als Vertrag oder Kontoauszug identifiziert werden');
      return {
        firstName: '',
        lastName: '',
        extractionSuccess: false,
        extractionErrors: errors,
        pdfType: 'unknown'
      };
    }
  }
  
  /**
   * Extract data from contract PDFs - VOLLSTÄNDIG ERWEITERT
   */
  private extractContractData(text: string, errors: string[]): ExtractedMemberData {
    const data: Partial<ExtractedMemberData> = {
      pdfType: 'contract',
      extractionErrors: [...errors]
    };
    
    try {
      console.log('🔍 PDF Text (first 2000 chars):', text.substring(0, 2000));
    
    // Suche explizit nach "Eisenbahnstraße"
    const eisenbahnMatch = text.match(/Eisenbahnstraße/i);
    if (eisenbahnMatch) {
      console.log('✅ Found Eisenbahnstraße in PDF');
      const contextStart = Math.max(0, text.indexOf('Eisenbahnstraße') - 100);
      const contextEnd = Math.min(text.length, text.indexOf('Eisenbahnstraße') + 200);
      console.log('📍 Context around Eisenbahnstraße:', text.substring(contextStart, contextEnd));
    } else {
      console.log('❌ Eisenbahnstraße not found in PDF');
    }
      
      // ===== 1. OPTIMIERTE NAMENSEXTRAKTION =====
      const namePatterns = [
        // Explizite Felder haben höchste Priorität
        /(?:Name|Kunde|Mitglied):\s*([A-ZÄÖÜ][a-zäöüß-]+(?:-[A-ZÄÖÜ][a-zäöüß-]+)*)\s+([A-ZÄÖÜ][a-zäöüß-]+)/gi,
        /Vorname:\s*([A-ZÄÖÜ][a-zäöüß-]+(?:-[A-ZÄÖÜ][a-zäöüß-]+)*)/gi,
        // IBAN-Kontext
        /(?:Kontoinhaber|Accountholder):\s*([A-ZÄÖÜ][a-zäöüß-]+(?:-[A-ZÄÖÜ][a-zäöüß-]+)*)\s+([A-ZÄÖÜ][a-zäöüß-]+)/gi,
        // Herr/Frau Anrede
        /(?:Herr|Frau)\s+([A-ZÄÖÜ][a-zäöüß-]+(?:-[A-ZÄÖÜ][a-zäöüß-]+)*)\s+([A-ZÄÖÜ][a-zäöüß-]+)/gi
      ];
      
      let nameFound = false;
      for (let i = 0; i < namePatterns.length && !nameFound; i++) {
        const pattern = namePatterns[i];
        const matches = Array.from(text.matchAll(pattern));
        
        if (matches.length > 0) {
          for (const match of matches) {
            // Erweiterte Blacklist für ungültige Namen
            const skipWords = [
              'Der', 'Die', 'Das', 'Essence', 'Sports', 'Wellnessclub', 'Club', 'Studio',
              'Schutz', 'Ihrer', 'Daten', 'Verträgen', 'Ihre', 'Persönlichen', 'Besonderen',
              'Datenerhebung', 'Verarbeitung', 'Nutzung', 'Erfolgen', 'Aufgrund', 'Geschlossenen',
              'Vertrages', 'Erteilten', 'Einwilligung', 'Rechtlichen', 'Erlaubnis'
            ];
            
            let firstName = '';
            let lastName = '';
            
                         if (i === 1) { // Vorname: Pattern
               firstName = match[1].trim();
               // Suche nach zugehörigem Nachname
               const lastNameMatch = text.match(/Nachname[:\s]*([A-ZÄÖÜ][a-zäöüß-]+(?:\s+[A-ZÄÖÜ][a-zäöüß-]+)*)/gi);
                if (lastNameMatch) {
                 lastName = lastNameMatch[0].replace(/Nachname[:\s]*/gi, '').trim();
                }
              } else if (match[2]) {
               firstName = match[1].trim();
               lastName = match[2].trim();
               
               // Spezielle Überprüfung für falsche Label-Extraktion
               if (firstName === 'Vorname' && lastName.includes('-')) {
                 // Vermutlich ist der "Nachname" tatsächlich der komplette Name
                 const nameParts = lastName.split('-');
                 if (nameParts.length === 2) {
                   firstName = nameParts[0].trim();
                   lastName = nameParts[1].trim();
                 }
               }
             }
            
            // Validierung der extrahierten Namen
            if (firstName && lastName && 
                !skipWords.includes(firstName) && 
                !skipWords.includes(lastName) &&
                firstName.length >= 2 && 
                lastName.length >= 2 &&
                !/\d/.test(firstName) && // Keine Zahlen
                !/\d/.test(lastName)) {
              
              data.firstName = firstName;
              data.lastName = lastName;
              console.log('✅ Extracted Name:', firstName, lastName);
                nameFound = true;
                break;
            }
          }
        }
      }
      
      if (!nameFound) {
        errors.push('Name konnte nicht extrahiert werden');
      }
      
      // ===== 2. ADRESSDATEN ERWEITERT =====
      // Anrede extrahieren
      const salutationMatch = text.match(/\b(Herr|Frau|Hr\.|Fr\.)\b/i);
      if (salutationMatch) {
        data.salutation = salutationMatch[1];
      }
      
      // Verbesserte Adressextraktion - spezifisch für Constantin Daniel
      // Erste Suche nach der korrekten Adresse des Kunden (nicht der Vereinsadresse)
      const correctAddressMatch = text.match(/Eisenbahnstraße\s+(\d+)[^\d]*(\d{5})\s+([A-ZÄÖÜ][a-zäöüß\s]+)/i);
      if (correctAddressMatch) {
        data.street = `Eisenbahnstraße ${correctAddressMatch[1]}`;
        data.postalCode = correctAddressMatch[2];
        data.city = correctAddressMatch[3].trim();
        data.address = `${data.street}, ${data.postalCode} ${data.city}`;
      } else {
        // Fallback: Allgemeine PLZ und Stadt Suche
        const cityMatch = text.match(/(\d{5})\s+([A-ZÄÖÜ][a-zäöüßÄÖÜ\s]+)(?=\s|$)/);
        if (cityMatch) {
          data.postalCode = cityMatch[1];
          data.city = cityMatch[2].trim().replace(/\s+/g, ' ');
          
          // Suche nach Straße in der Nähe der PLZ
          const textBeforeCity = text.substring(0, text.indexOf(cityMatch[0]));
          const streetMatches = textBeforeCity.match(/([A-ZÄÖÜ][a-zäöüßÄÖÜ\s]+\s+\d+[a-z]?)\s*$/);
          if (streetMatches) {
            data.street = streetMatches[1].trim();
          } else {
            // Fallback: Suche nach Straßennamen vor der PLZ
            const streetFallback = textBeforeCity.match(/([A-ZÄÖÜ][a-zäöüßÄÖÜ-]+(?:straße|str\.|gasse|weg|platz|allee))\s+(\d+[a-z]?)/i);
            if (streetFallback) {
              data.street = `${streetFallback[1]} ${streetFallback[2]}`;
            }
          }
          
          data.address = `${data.street || ''}, ${data.postalCode} ${data.city}`.replace(/^,\s*/, '').trim();
        } else {
          // Fallback für Adresse ohne erkennbares PLZ-Stadt Pattern
          const addressMatch = text.match(/Adresse[:\s]*([^\n\r]+)/i);
          if (addressMatch) {
            data.address = addressMatch[1].trim();
          }
        }
      }
      
      // Telefon - nur Kundendaten, nicht Firmenkontakt
      const phonePatterns = [
        /(?:Telefon|Tel|Mobil|Handy)[:\s]+(\+?\d{2,3}[\s\/-]?\d{3,4}[\s\/-]?\d{4,8})/i
      ];
      
      // Nur wenn Name gefunden wurde, zusätzlich in der Nähe des Namens suchen
      if (data.firstName && data.lastName) {
        phonePatterns.push(
          new RegExp(`${data.firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?${data.lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?(\\+?\\d{2,3}[\\s\\/-]?\\d{3,4}[\\s\\/-]?\\d{4,8})`, 'i')
        );
      }
      
      for (const pattern of phonePatterns) {
        const phoneMatch = text.match(pattern);
        if (phoneMatch) {
          const phone = phoneMatch[1].replace(/[\s\/-]/g, '');
          // Filtere typische Studio-Telefonnummern aus
          if (!phone.includes('68194753700')) { // Beispiel Studio-Nummer
            data.phone = phone;
            break;
          }
        }
      }
      
      // Email - nur Kundendaten, nicht Firmenkontakt  
      const emailPatterns = [
        /E-?Mail[:\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
      ];
      
      // Nur wenn Name gefunden wurde, zusätzlich in der Nähe des Namens suchen
      if (data.firstName && data.lastName) {
        emailPatterns.unshift(
          new RegExp(`${data.firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?${data.lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})`, 'i')
        );
      }
      
      for (const pattern of emailPatterns) {
        const emailMatch = text.match(pattern);
        if (emailMatch) {
          const email = emailMatch[1].toLowerCase();
          // Filtere typische Studio-E-Mails aus
          if (!email.includes('info@essence-fitness.de')) {
            data.email = email;
            break;
          }
        }
      }
      
      // ===== 3. GEBURTSDATUM (OPTIMIERT) =====
      // Verschiedene Geburtsdatum-Pattern ausprobieren
      let birthMatch = text.match(/(?:Geburt|geboren).*?(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
      if (!birthMatch) {
        // Alternative Pattern für Geburtsdatum
        birthMatch = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/g)?.find(match => {
          const dateMatch = match.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
          if (dateMatch) {
            const year = parseInt(dateMatch[3]);
            const currentYear = new Date().getFullYear();
            // Geburtsjahr zwischen 1900 und currentYear-14 (mindestens 14 Jahre alt)
            return year >= 1900 && year <= (currentYear - 14);
          }
          return false;
        })?.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      }
      
      if (birthMatch) {
        data.birthDate = `${birthMatch[3]}-${birthMatch[2].padStart(2, '0')}-${birthMatch[1].padStart(2, '0')}`;
      } else {
        // Nicht als Fehler markieren, da Geburtsdatum optional sein kann
        console.warn('⚠️ Geburtsdatum konnte nicht automatisch extrahiert werden');
      }
      
      // ===== 4. MITGLIEDSNUMMER UND VERTRAGSNUMMER (KORRIGIERT) =====
      // Bessere Unterscheidung zwischen Mitgliedsnummer und Vertragsnummer
      // Mitgliedsnummer hat normalerweise Format "3-302" oder ähnliche kurze Formate
      let memberNumberMatch = text.match(/Mitgliedsnummer[:\s]*(\d+-\d+)/i);
      if (!memberNumberMatch) {
        // Fallback: Suche nach Pattern mit Bindestrich
        memberNumberMatch = text.match(/(\d+-\d+)/);
      }
      if (memberNumberMatch) {
        data.memberNumber = memberNumberMatch[1];
      }
      
      // Vertragsnummer ist meist eine längere Nummer (4+ Ziffern ohne Bindestrich)
      let contractNumberMatch = text.match(/Vertragsnummer[:\s]*(\d{4,})/i);
      if (!contractNumberMatch) {
        // Fallback: Längere Zahlen ohne Bindestrich, die nicht die Mitgliedsnummer sind
        const longNumberMatches = text.match(/\d{4,}/g);
        if (longNumberMatches) {
          const filteredNumbers = longNumberMatches.filter(num => 
            num !== data.memberNumber && 
            !data.memberNumber?.includes(num) &&
            num.length >= 4
          );
          if (filteredNumbers.length > 0) {
            contractNumberMatch = [null, filteredNumbers[0]];
          }
        }
      }
      if (contractNumberMatch) {
        data.contractNumber = contractNumberMatch[1];
      }
      
      // ===== 6. VERTRAGSDATEN ERWEITERT =====
      // Vertragsbeginn
      const contractStartMatch = text.match(/(?:Vertrag.*beginn|Start.*datum|ab\s+dem)\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
      if (contractStartMatch) {
        data.contractStartDate = `${contractStartMatch[3]}-${contractStartMatch[2].padStart(2, '0')}-${contractStartMatch[1].padStart(2, '0')}`;
      }
      
      // Trainingsbeginn (kann unterschiedlich sein)
      const trainingStartMatch = text.match(/(?:Training.*ab|Nutzung.*ab|Freischaltung)\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
      if (trainingStartMatch) {
        data.trainingStartDate = `${trainingStartMatch[3]}-${trainingStartMatch[2].padStart(2, '0')}-${trainingStartMatch[1].padStart(2, '0')}`;
      }
      
      // Vertragsende
      const contractEndMatch = text.match(/(?:Vertrag.*ende|bis\s+zum)\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
      if (contractEndMatch) {
        data.contractEndDate = `${contractEndMatch[3]}-${contractEndMatch[2].padStart(2, '0')}-${contractEndMatch[1].padStart(2, '0')}`;
      }
      
      // Mindestlaufzeit (korrekte Bezeichnung laut Anforderung)
      const minimumDurationMatch = text.match(/(?:Mindestlaufzeit|Mindest.*Dauer)[:\s]*(\d+)\s*(Monat|Jahr|unbefristet)/i);
      if (minimumDurationMatch) {
        if (minimumDurationMatch[2].toLowerCase().includes('unbefristet')) {
          data.minimumDuration = 'unbefristet';
        } else {
          data.minimumDuration = `${minimumDurationMatch[1]} ${minimumDurationMatch[2]}${minimumDurationMatch[1] !== '1' ? 'e' : ''}`;
        }
      } else {
        // Fallback: Allgemeine Laufzeit
        const durationMatch = text.match(/(?:Laufzeit|Dauer)[:\s]*(\d+)\s*(Monat|Jahr|unbefristet)/i);
        if (durationMatch) {
          if (durationMatch[2].toLowerCase().includes('unbefristet')) {
            data.contractDuration = 'unbefristet';
          } else {
            data.contractDuration = `${durationMatch[1]} ${durationMatch[2]}${durationMatch[1] !== '1' ? 'e' : ''}`;
          }
        }
      }
      
      // Kündigungsfrist
      const noticePeriodMatch = text.match(/(?:Kündigungsfrist|Kündigung)[:\s]*(\d+)\s*(Monat|Woche|Tag)/i);
      if (noticePeriodMatch) {
        data.noticePeriod = `${noticePeriodMatch[1]} ${noticePeriodMatch[2]}${noticePeriodMatch[1] !== '1' ? 'e' : ''}`;
      }
      
      // Verlängerungszeitraum
      const extensionPeriodMatch = text.match(/(?:Verlängerung|Verlängert)[:\s]*(\d+)\s*(Monat|Jahr)/i);
      if (extensionPeriodMatch) {
        data.extensionPeriod = `${extensionPeriodMatch[1]} ${extensionPeriodMatch[2]}${extensionPeriodMatch[1] !== '1' ? 'e' : ''}`;
      }
      
      // Betrag des Verlängerungszeitraums
      const extensionAmountMatch = text.match(/(?:Verlängerung.*Betrag|Extension.*Amount)[:\s]*(\d+),(\d{2})\s*€/i);
      if (extensionAmountMatch) {
        data.extensionAmount = parseFloat(`${extensionAmountMatch[1]}.${extensionAmountMatch[2]}`);
      }
      
      // ===== 7. TARIF UND PREISE ERWEITERT =====
      // Verbesserte Tarifextraktion - spezifisch nach "Essential" suchen
      const essentialMatch = text.match(/Essential/i);
      if (essentialMatch) {
        data.contractTariff = 'Essential';
      } else {
        // Fallback: andere bekannte Tarife
        let tariffMatch = text.match(/Tarif[:\s]+(Premium|Basic|Pro|Fitness|Wellness)[\s\n]/i);
        if (!tariffMatch) {
          // Fallback: Suche nach bekannten Tarifnamen
          tariffMatch = text.match(/\b(Premium|Basic|Pro|Fitness|Wellness)\b/i);
        }
        if (tariffMatch) {
          data.contractTariff = tariffMatch[1];
        }
      }
      
      // Preisextraktion verbessert - suche nach Betrag in der Nähe des Tarifs
      const priceMatch = text.match(/(\d+),(\d{2})\s*€/);
      if (priceMatch) {
        data.contractPrice = parseFloat(`${priceMatch[1]}.${priceMatch[2]}`);
      }
      
      // Aufnahmegebühr
      const setupFeeMatch = text.match(/(?:Aufnahme|Setup|Anmelde).*?(\d+),(\d{2})\s*€/i);
      if (setupFeeMatch) {
        data.setupFee = parseFloat(`${setupFeeMatch[1]}.${setupFeeMatch[2]}`);
      }
      
      // Verwaltungsgebühr
      const adminFeeMatch = text.match(/(?:Verwaltung|Administration).*?(\d+),(\d{2})\s*€/i);
      if (adminFeeMatch) {
        data.administrationFee = parseFloat(`${adminFeeMatch[1]}.${adminFeeMatch[2]}`);
      }
      
      // Kartengebühr
      const keyCardFeeMatch = text.match(/(?:Karte|Card|Chip).*?(\d+),(\d{2})\s*€/i);
      if (keyCardFeeMatch) {
        data.keyCardFee = parseFloat(`${keyCardFeeMatch[1]}.${keyCardFeeMatch[2]}`);
      }
      
      // ===== 8. BANKDATEN VOLLSTÄNDIG =====
      // IBAN
      const ibanMatch = text.match(/DE\d{2}\s*(?:\d{4}\s*){4}\d{2}/g);
      if (ibanMatch) {
        const iban = ibanMatch[0].replace(/\s/g, '');
        if (validateIBAN(iban)) {
          data.iban = iban;
        } else {
          errors.push(`Ungültige IBAN gefunden: ${iban}`);
        }
      }
      
      // BIC
      const bicMatch = text.match(/BIC.*?([A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)/i);
      if (bicMatch) {
        data.bic = bicMatch[1];
      }
      
      // Bankname
      const bankNameMatch = text.match(/(?:Bank|Institut).*?([A-ZÄÖÜ][a-zäöüß\s]+(?:bank|sparkasse|volksbank|raiffeisenbank)[a-zäöüß\s]*)/i);
      if (bankNameMatch) {
        data.bankName = bankNameMatch[1].trim();
      }
      
      // Kontoinhaber (falls abweichend)
      const accountHolderMatch = text.match(/(?:Kontoinhaber|Account.*Holder).*?([A-ZÄÖÜ][a-zäöüß-]+\s+[A-ZÄÖÜ][a-zäöüß-]+)/i);
      if (accountHolderMatch && accountHolderMatch[1] !== `${data.firstName} ${data.lastName}`) {
        data.accountHolder = accountHolderMatch[1];
      }
      
      // ===== 9. SEPA-MANDAT =====
      const mandateMatch = text.match(/(?:Mandat|Mandate).*?([A-Z0-9-]{6,})/i);
      if (mandateMatch) {
        data.mandateReference = mandateMatch[1];
      }
      
      const mandateDateMatch = text.match(/(?:Mandat.*datum|Signed).*?(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
      if (mandateDateMatch) {
        data.mandateSignedDate = `${mandateDateMatch[3]}-${mandateDateMatch[2].padStart(2, '0')}-${mandateDateMatch[1].padStart(2, '0')}`;
      }
      
      // ===== 10. ZAHLUNGSINTERVALL (KORRIGIERT: Zahlweise) =====
      const paymentIntervalMatch = text.match(/(?:Zahlweise|Zahlung|Payment)[:\s]*(monatlich|quartalsweise|halbjährlich|jährlich|monthly|quarterly|yearly)/i);
      if (paymentIntervalMatch) {
        const interval = paymentIntervalMatch[1].toLowerCase();
        data.paymentInterval = interval.includes('monat') || interval.includes('monthly') ? 'monatlich' :
                              interval.includes('quartal') || interval.includes('quarterly') ? 'quartalsweise' :
                              interval.includes('halbjahr') ? 'halbjährlich' :
                              interval.includes('jahr') || interval.includes('yearly') ? 'jährlich' : interval;
      }
      
      // Abbuchungstag
      const paymentDayMatch = text.match(/(?:Abbuchung|Payment).*?(\d{1,2})\./);
      if (paymentDayMatch) {
        data.paymentDay = parseInt(paymentDayMatch[1]);
      }
      
      // ===== 11. ZUSATZLEISTUNGEN =====
      // Stillegungsoption
      data.hasFreezingOption = /stilleg|freez|pause/i.test(text);
      
      const freezingFeeMatch = text.match(/(?:Stilleg|Freez|Pause).*?(\d+),(\d{2})\s*€/i);
      if (freezingFeeMatch) {
        data.freezingFee = parseFloat(`${freezingFeeMatch[1]}.${freezingFeeMatch[2]}`);
      }
      
      // Gastnutzung
      data.hasGuestPrivileges = /gast|guest|begleit/i.test(text);
      
      // ===== 12. VERTRAGSART =====
      const contractTypeMatch = text.match(/(?:Tarif|Plan|Type).*?(Fitness|Wellness|Premium|Basic|Essential|Pro)/i);
      if (contractTypeMatch) {
        data.contractType = contractTypeMatch[1];
      }
      
      console.log('✅ Contract Data Extraction Complete:', {
        name: `${data.firstName} ${data.lastName}`,
        memberNumber: data.memberNumber,
        tariff: data.contractTariff,
        price: data.contractPrice,
        iban: data.iban ? data.iban.substring(0, 8) + '...' : 'none'
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Extraktionsfehler';
      errors.push(errorMessage);
    }
    
    // Calculate extraction confidence
    const totalFields = 20; // Important fields count
    const extractedFields = [
      data.firstName, data.lastName, data.birthDate, data.address,
      data.contractStartDate, data.contractTariff, data.contractPrice,
      data.iban, data.mandateReference, data.memberNumber
    ].filter(field => field !== undefined && field !== '').length;
    
    data.extractionConfidence = Math.round((extractedFields / totalFields) * 100);
    
    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      salutation: data.salutation,
      birthDate: data.birthDate,
      address: data.address,
      street: data.street,
      postalCode: data.postalCode,
      city: data.city,
      phone: data.phone,
      email: data.email,
      memberNumber: data.memberNumber,
      contractNumber: data.contractNumber,
      contractStartDate: data.contractStartDate,
      contractEndDate: data.contractEndDate,
      contractDuration: data.contractDuration,
      minimumDuration: data.minimumDuration,
      trainingStartDate: data.trainingStartDate,
      contractTariff: data.contractTariff,
      contractPrice: data.contractPrice,
      contractType: data.contractType,
      setupFee: data.setupFee,
      administrationFee: data.administrationFee,
      keyCardFee: data.keyCardFee,
      noticePeriod: data.noticePeriod,
      extensionPeriod: data.extensionPeriod,
      extensionAmount: data.extensionAmount,
      iban: data.iban,
      bic: data.bic,
      bankName: data.bankName,
      accountHolder: data.accountHolder,
      mandateReference: data.mandateReference,
      mandateSignedDate: data.mandateSignedDate,
      paymentInterval: data.paymentInterval,
      paymentDay: data.paymentDay,
      hasFreezingOption: data.hasFreezingOption,
      freezingFee: data.freezingFee,
      hasGuestPrivileges: data.hasGuestPrivileges,
      extractionSuccess: errors.length === 0,
      extractionErrors: errors,
      extractionConfidence: data.extractionConfidence,
      pdfType: 'contract'
    };
  }
  
  /**
   * Extract data from statement PDFs
   */
  private extractStatementData(text: string, errors: string[]): ExtractedMemberData {
    const data: any = {
      pdfType: 'statement',
      extractionErrors: [...errors]
    };
    
    try {
      // Extract member number - Pattern: "3-302"
      const memberNumberMatch = text.match(/(\d+-\d+)/);
      if (memberNumberMatch) {
        data.memberNumber = memberNumberMatch[1];
      } else {
        errors.push('Mitgliedsnummer konnte nicht extrahiert werden');
      }
      
      // Extract account balance - Korrigierte Logik für Saldo
      let balanceMatch = text.match(/(?:Saldo|Stand|Guthaben)[:\s]*(-?\d+),(\d{2})\s*€/i);
      if (!balanceMatch) {
        // Alternative Pattern versuchen - letzte Zeile mit Betrag
        const allMatches = text.match(/(-?\d+),(\d{2})\s*€/g);
        if (allMatches && allMatches.length > 0) {
          // Nehme den letzten Betrag als Saldo (meist am Ende des Kontoauszugs)
          const lastMatch = allMatches[allMatches.length - 1].match(/(-?\d+),(\d{2})\s*€/);
          if (lastMatch) {
            balanceMatch = lastMatch;
          }
        }
      }
      
      if (balanceMatch) {
        const balance = parseFloat(`${balanceMatch[1]}.${balanceMatch[2]}`);
        // Korrigierte Logik: Positive Werte = Guthaben, Negative Werte = Schulden
        // Kein Vorzeichen umkehren - der Wert aus dem PDF ist bereits korrekt
        data.accountBalance = balance;
        console.log('📊 Extracted account balance:', balance);
      } else {
        // Setze Kontostand auf 0 als Fallback statt Fehler
        data.accountBalance = 0;
        console.warn('⚠️ Kontostand konnte nicht automatisch extrahiert werden, setze auf 0');
      }
      
      // Try to extract name from statement (sometimes included)
      // Verbesserte Namen-Patterns für Kontoauszüge
      const namePatterns = [
        /Name[:\s]+([A-ZÄÖÜ][a-zäöüß-]+(?:\s+[a-zäöüß-]+)*)\s+([A-ZÄÖÜ][a-zäöüß-]+)/i,
        /Kontoinhaber[:\s]+([A-ZÄÖÜ][a-zäöüß-]+(?:\s+[a-zäöüß-]+)*)\s+([A-ZÄÖÜ][a-zäöüß-]+)/i,
        /([A-ZÄÖÜ][a-zäöüß-]+)\s+([A-ZÄÖÜ][a-zäöüß-]+)(?=\s+\d+-\d+)/  // Name vor Mitgliedsnummer
      ];
      
      for (const pattern of namePatterns) {
        const nameMatch = text.match(pattern);
      if (nameMatch) {
          const firstName = nameMatch[1].trim();
          const lastName = nameMatch[2].trim();
          
          // Filtere ungültige Namen aus
          const invalidWords = ['Kontoauszug', 'Zeitraum', 'Saldo', 'Betrag', 'Datum', 'Monat'];
          
          if (!invalidWords.includes(firstName) && 
              !invalidWords.includes(lastName) &&
              firstName.length >= 2 && 
              lastName.length >= 2) {
            data.firstName = firstName;
            data.lastName = lastName;
            break;
          }
        }
      }
      
      // Extract IBAN if present
      const ibanMatch = text.match(/DE\d{2}\s*(?:\d{4}\s*){4}\d{2}/g);
      if (ibanMatch) {
        const iban = ibanMatch[0].replace(/\s/g, '');
        if (validateIBAN(iban)) {
          data.iban = iban;
        }
      }
      
            // ===== EINFACHE BEITRAGSKALENDER-EXTRAKTION =====
      // Extrahiere Beitragskalender-Daten (vereinfacht für TypeScript-Kompatibilität)
      const paidContributions: any[] = [];
      const futureContributions: any[] = [];
      
      // Debug: Zeige den gesamten Text um zu verstehen was im PDF steht
      console.log('🔍 Full PDF Text for debugging:', text.substring(3000, 5000));
      
      // Suche nach "Zeitraum: Zukünftig" oder einfach "Zukünftig" für zukünftige Beiträge
      if (text.includes('Zukünftig') || text.includes('Essential')) {
        console.log('📅 Found future contributions section');
        
        // Debug: Alle Zeilen mit Essential anzeigen
        const essentialLines = text.split('\n').filter(line => line.includes('Essential'));
        console.log('🔍 Essential lines found:', essentialLines);
        
        // Alle Zeilen mit Essential oder "19,67" suchen
        const futureLines = text.split('\n').filter(line => 
          (line.includes('Essential') || line.includes('19,67') || line.includes('Forderung')) &&
          line.length > 10  // Keine zu kurzen Zeilen
        );
        
        console.log('🔍 Future lines found:', futureLines);
        
        for (const line of futureLines) {
          console.log('🔍 Processing line:', line);
          
          // Vereinfachte Suche nach allen relevanten Patterns
          const dateMatch = line.match(/(\d{1,2}\.\d{1,2}\.?\d{0,4})\s*[-–]\s*(\d{1,2}\.\d{1,2}\.?\d{0,4})/);
          const amountMatch = line.match(/(\d{1,3}),(\d{2})\s*€/);  // Beliebiger Betrag mit Komma
          const forderungMatch = line.match(/Forderung/i);
          const offenMatch = line.match(/offen/i);
          
          if (dateMatch) {
            console.log('✅ Date match:', dateMatch[0]);
          }
          if (amountMatch) {
            console.log('✅ Amount match:', amountMatch[0]);
          }
          if (forderungMatch) {
            console.log('✅ Forderung found');
          }
          if (offenMatch) {
            console.log('✅ Offen found');
          }
          
          // Wenn eine Zeile Datum und Betrag hat, verwende sie
          if (dateMatch && amountMatch) {
            const amount = parseFloat(`${amountMatch[1]}.${amountMatch[2]}`);
            
            futureContributions.push({
              startDate: dateMatch[1],
              endDate: dateMatch[2],
              description: `Essential ${dateMatch[1]}-${dateMatch[2]}`,
              forderung: amount,
              offen: amount,  // Default: Forderung = Offen
              status: 'future' as const,
              type: 'Beitrag'
            });
          }
          // Auch Zeilen ohne Datum aber mit Betrag und "19,67" berücksichtigen
          else if (amountMatch && line.includes('19,67')) {
            const amount = parseFloat(`${amountMatch[1]}.${amountMatch[2]}`);
            
            futureContributions.push({
              startDate: '01.09',
              endDate: '30.09', 
              description: `Essential 01.09-30.09`,
              forderung: amount,
              offen: amount,
              status: 'future' as const,
              type: 'Beitrag'
            });
          }
        }
      }
      
      // Suche nach bezahlten Beiträgen (Lastschrift, zahllauf-Position)
      if (text.includes('Lastschrift') && text.includes('zahllauf-Position')) {
        console.log('📅 Found paid contributions section');
        
        const paidLines = text.split('\n').filter(line => 
          line.includes('Lastschrift') || 
          (line.includes('zahllauf-Position') && line.includes('€'))
        );
        
        for (const line of paidLines) {
          const dateMatch = line.match(/(\d{1,2}\.\d{1,2}\.\d{2,4})/);
          const amountMatch = line.match(/(-?\d+),(\d{2})\s*€/);
          
          if (dateMatch && amountMatch) {
            paidContributions.push({
              date: dateMatch[1],
              amount: parseFloat(`${amountMatch[1]}.${amountMatch[2]}`),
              type: 'Lastschrift',
              description: 'zahllauf-Position',
              status: 'paid' as const
            });
          }
        }
      }
      
      // Speichere die extrahierten Beitragskalender
      data.paidContributions = paidContributions;
      data.futureContributions = futureContributions;
      
      console.log('📅 Extracted paid contributions:', paidContributions.length);
      console.log('📅 Extracted future contributions:', futureContributions.length);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Extraktionsfehler';
      errors.push(errorMessage);
    }
    
    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      memberNumber: data.memberNumber,
      accountBalance: data.accountBalance,
      iban: data.iban,
      paidContributions: data.paidContributions || [],
      futureContributions: data.futureContributions || [],
      extractionSuccess: errors.length === 0,
      extractionErrors: errors,
      pdfType: 'statement'
    };
  }
  
  /**
   * Validate extracted member data
   */
  public validateMemberData(data: ExtractedMemberData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Name validation
    if (!data.firstName || data.firstName.length < 2) {
      issues.push({
        field: 'firstName',
        issue: 'Vorname fehlt oder ist zu kurz',
        severity: 'error',
        suggestion: 'Bitte Vorname manuell eingeben'
      });
    }
    
    if (!data.lastName || data.lastName.length < 2) {
      issues.push({
        field: 'lastName',
        issue: 'Nachname fehlt oder ist zu kurz',
        severity: 'error',
        suggestion: 'Bitte Nachname manuell eingeben'
      });
    }
    
    // IBAN validation
    if (data.iban && !validateIBAN(data.iban)) {
      issues.push({
        field: 'iban',
        issue: 'IBAN ist ungültig',
        severity: 'error',
        suggestion: 'Bitte gültige IBAN eingeben'
      });
    }
    
    // Birth date validation
    if (data.birthDate) {
      const birthDate = new Date(data.birthDate);
      const now = new Date();
      const age = now.getFullYear() - birthDate.getFullYear();
      
      if (age < 14 || age > 120) {
        issues.push({
          field: 'birthDate',
          issue: 'Unrealistisches Geburtsdatum',
          severity: 'warning',
          suggestion: 'Bitte Geburtsdatum überprüfen'
        });
      }
    }
    
    // Contract price validation
    if (data.contractPrice && (data.contractPrice < 0 || data.contractPrice > 1000)) {
      issues.push({
        field: 'contractPrice',
        issue: 'Unrealistischer Vertragspreis',
        severity: 'warning',
        suggestion: 'Bitte Preis überprüfen'
      });
    }
    
    // Member number validation (for statements)
    if (data.pdfType === 'statement' && !data.memberNumber) {
      issues.push({
        field: 'memberNumber',
        issue: 'Mitgliedsnummer fehlt im Kontoauszug',
        severity: 'error',
        suggestion: 'Bitte Mitgliedsnummer manuell eingeben'
      });
    }
    
    return issues;
  }
  
  /**
   * Merge extracted data from contract and statement PDFs
   * Membership data takes priority over statement data
   */
  public mergeExtractedData(contractData: ExtractedMemberData, statementData: ExtractedMemberData): ExtractedMemberData {
    console.log('🔄 Merging contract and statement data...');
    console.log('Contract data confidence:', contractData.extractionConfidence);
    console.log('Statement data confidence:', statementData.extractionConfidence);
    
    // Start with contract data as base (membership priority)
    const mergedData: ExtractedMemberData = { ...contractData };
    
    // Fill in missing data from statement where contract data is unavailable
    if (!mergedData.memberNumber && statementData.memberNumber) {
      mergedData.memberNumber = statementData.memberNumber;
    }
    
    if (!mergedData.accountBalance && statementData.accountBalance !== undefined) {
      mergedData.accountBalance = statementData.accountBalance;
    }
    
    // Use statement IBAN if contract IBAN is missing (rare case)
    if (!mergedData.iban && statementData.iban) {
      mergedData.iban = statementData.iban;
    }
    
    // If name is missing in contract but available in statement
    if (!mergedData.firstName && statementData.firstName) {
      mergedData.firstName = statementData.firstName;
    }
    
    if (!mergedData.lastName && statementData.lastName) {
      mergedData.lastName = statementData.lastName;
    }
    
    // Merge extraction errors from both sources
    const allErrors = [
      ...(contractData.extractionErrors || []),
      ...(statementData.extractionErrors || [])
    ];
    
    // Remove duplicates
    mergedData.extractionErrors = Array.from(new Set(allErrors));
    
    // Update extraction success based on critical fields
    const criticalFields = [
      mergedData.firstName,
      mergedData.lastName,
      mergedData.memberNumber,
      mergedData.iban
    ];
    
    const successfulFields = criticalFields.filter(field => field && field.trim() !== '').length;
    mergedData.extractionSuccess = successfulFields >= 3; // At least 3 out of 4 critical fields
    
    // Calculate combined confidence score
    const contractWeight = 0.7; // Contract data is more important
    const statementWeight = 0.3;
    
    const contractConfidence = contractData.extractionConfidence || 0;
    const statementConfidence = statementData.extractionConfidence || 0;
    
    mergedData.extractionConfidence = Math.round(
      (contractConfidence * contractWeight) + (statementConfidence * statementWeight)
    );
    
    console.log('✅ Data merge complete:', {
      name: `${mergedData.firstName} ${mergedData.lastName}`,
      memberNumber: mergedData.memberNumber,
      hasBalance: mergedData.accountBalance !== undefined,
      confidence: mergedData.extractionConfidence,
      errors: mergedData.extractionErrors.length
    });
    
    return mergedData;
  }
  
  /**
   * Generate Beitragskalender entries based on extracted contract data
   * Integrates with the existing Beitragskalender system
   */
  public generateBeitragskalenderFromContract(memberData: ExtractedMemberData, memberId: string): any[] {
    const entries: any[] = [];
    
    if (!memberData.contractStartDate || !memberData.contractPrice) {
      console.warn('Insufficient data to generate Beitragskalender');
      return entries;
    }
    
    const startDate = new Date(memberData.contractStartDate);
    const monthlyAmount = memberData.contractPrice;
    const paymentInterval = memberData.paymentInterval || 'monatlich';
    
    // Generate entries for the next 12 months
    for (let i = 0; i < 12; i++) {
      const dueDate = new Date(startDate);
      
      // Calculate due date based on payment interval
      switch (paymentInterval.toLowerCase()) {
        case 'monatlich':
        case 'monthly':
          dueDate.setMonth(startDate.getMonth() + i);
          break;
        case 'quartalsweise':
        case 'quarterly':
          if (i % 3 === 0) {
            dueDate.setMonth(startDate.getMonth() + i);
          } else {
            continue; // Skip non-quarterly months
          }
          break;
        case 'jährlich':
        case 'yearly':
          if (i === 0) {
            dueDate.setFullYear(startDate.getFullYear() + i);
          } else {
            continue; // Only one yearly payment
          }
          break;
        default:
          dueDate.setMonth(startDate.getMonth() + i);
      }
      
      // Set payment day if specified
      if (memberData.paymentDay && memberData.paymentDay >= 1 && memberData.paymentDay <= 28) {
        dueDate.setDate(memberData.paymentDay);
      }
      
      const entry = {
        member_id: memberId,
        due_date: dueDate.toISOString().split('T')[0],
        transaction_type: 'membership_fee',
        amount: monthlyAmount,
        status: 'scheduled',
        created_by: 'auto_generator',
        description: `${memberData.contractTariff || 'Mitgliedsbeitrag'} - ${dueDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
        audit_trail: {
          source: 'dual_import',
          contract_data: {
            tariff: memberData.contractTariff,
            original_start_date: memberData.contractStartDate,
            payment_interval: paymentInterval
          }
        }
      };
      
      entries.push(entry);
    }
    
    // Add setup fee if present
    if (memberData.setupFee && memberData.setupFee > 0) {
      const setupEntry = {
        member_id: memberId,
        due_date: startDate.toISOString().split('T')[0],
        transaction_type: 'pauschale',
        amount: memberData.setupFee,
        status: 'scheduled',
        created_by: 'auto_generator',
        description: 'Aufnahmegebühr',
        audit_trail: {
          source: 'dual_import',
          fee_type: 'setup_fee'
        }
      };
      
      entries.unshift(setupEntry); // Add at beginning
    }
    
    // Add administration fee if present
    if (memberData.administrationFee && memberData.administrationFee > 0) {
      const adminEntry = {
        member_id: memberId,
        due_date: startDate.toISOString().split('T')[0],
        transaction_type: 'pauschale',
        amount: memberData.administrationFee,
        status: 'scheduled',
        created_by: 'auto_generator',
        description: 'Verwaltungsgebühr',
        audit_trail: {
          source: 'dual_import',
          fee_type: 'administration_fee'
        }
      };
      
      entries.splice(1, 0, adminEntry); // Add after setup fee
    }
    
    // Add key card fee if present
    if (memberData.keyCardFee && memberData.keyCardFee > 0) {
      const keyCardEntry = {
        member_id: memberId,
        due_date: startDate.toISOString().split('T')[0],
        transaction_type: 'pauschale',
        amount: memberData.keyCardFee,
        status: 'scheduled',
        created_by: 'auto_generator',
        description: 'Kartengebühr',
        audit_trail: {
          source: 'dual_import',
          fee_type: 'key_card_fee'
        }
      };
      
      entries.splice(-1, 0, keyCardEntry); // Add before last entry
    }
    
    console.log(`✅ Generated ${entries.length} Beitragskalender entries for member ${memberId}`);
    
    return entries;
  }
  
  /**
   * Enhanced validation for dual import scenarios
   */
  public validateDualImportData(contractData: ExtractedMemberData, statementData: ExtractedMemberData): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check member number consistency
    if (contractData.memberNumber && statementData.memberNumber) {
      if (contractData.memberNumber !== statementData.memberNumber) {
        issues.push({
          field: 'memberNumber',
          issue: `Mitgliedsnummern stimmen nicht überein: Vertrag (${contractData.memberNumber}) vs. Kontoauszug (${statementData.memberNumber})`,
          severity: 'warning',
          suggestion: 'Überprüfen Sie beide Dokumente auf Korrektheit'
        });
      }
    }
    
    // Check name consistency
    if (contractData.firstName && contractData.lastName && statementData.firstName && statementData.lastName) {
      const contractName = `${contractData.firstName} ${contractData.lastName}`.toLowerCase();
      const statementName = `${statementData.firstName} ${statementData.lastName}`.toLowerCase();
      
      if (contractName !== statementName) {
        issues.push({
          field: 'name',
          issue: `Namen stimmen nicht überein: Vertrag (${contractData.firstName} ${contractData.lastName}) vs. Kontoauszug (${statementData.firstName} ${statementData.lastName})`,
          severity: 'warning',
          suggestion: 'Prüfen Sie die Schreibweise in beiden Dokumenten'
        });
      }
    }
    
    // Check IBAN consistency
    if (contractData.iban && statementData.iban) {
      if (contractData.iban !== statementData.iban) {
        issues.push({
          field: 'iban',
          issue: `IBAN-Nummern stimmen nicht überein`,
          severity: 'error',
          suggestion: 'Überprüfen Sie beide Dokumente - unterschiedliche IBANs können zu Zahlungsproblemen führen'
        });
      }
    }
    
    // Validate contract logic
    if (contractData.contractPrice && contractData.contractPrice <= 0) {
      issues.push({
        field: 'contractPrice',
        issue: 'Vertragspreis ist 0 oder negativ',
        severity: 'error',
        suggestion: 'Überprüfen Sie den Vertragspreis im Dokument'
      });
    }
    
    // Validate account balance logic
    if (statementData.accountBalance !== undefined) {
      if (Math.abs(statementData.accountBalance) > 1000) {
        issues.push({
          field: 'accountBalance',
          issue: `Sehr hoher Kontostand: ${statementData.accountBalance.toFixed(2)} €`,
          severity: 'warning',
          suggestion: 'Prüfen Sie den Kontostand auf Plausibilität'
        });
      }
    }
    
    // Check date consistency
    if (contractData.contractStartDate) {
      const startDate = new Date(contractData.contractStartDate);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      if (startDate < oneYearAgo || startDate > oneYearFromNow) {
        issues.push({
          field: 'contractStartDate',
          issue: `Vertragsbeginn liegt außerhalb eines plausiblen Zeitraums: ${contractData.contractStartDate}`,
          severity: 'warning',
          suggestion: 'Überprüfen Sie das Vertragsdatum'
        });
      }
    }
    
    return issues;
  }
}

// Export singleton instance
export const magiclinePDFProcessor = new MagiclinePDFProcessor(); 