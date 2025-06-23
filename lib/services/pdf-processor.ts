// PDF Processing Engine for Magicline Documents
// Specialized pattern matching for contract and statement PDFs

const pdfParse = require('pdf-parse');
import { ExtractedMemberData, PDFProcessingResult, ValidationIssue } from '../types/payment-system';
import { validate as validateIBAN } from 'iban-validator';

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
   * Extract data from contract PDFs
   */
  private extractContractData(text: string, errors: string[]): ExtractedMemberData {
    const data: Partial<ExtractedMemberData> = {
      pdfType: 'contract',
      extractionErrors: [...errors]
    };
    
    try {
      console.log('🔍 PDF Text (first 1000 chars):', text.substring(0, 1000));
      console.log('🔍 PDF Text contains "Constantin":', text.includes('Constantin'));
      console.log('🔍 PDF Text contains "Avadani":', text.includes('Avadani'));
      
      // Multiple name patterns for different PDF formats
      const namePatterns = [
        // Pattern 1: "Constantin-Daniel Avadani" (space separated)
        /([A-ZÄÖÜ][a-zäöüß-]+(?:-[A-ZÄÖÜ][a-zäöüß-]+)*)\s+([A-ZÄÖÜ][a-zäöüß-]+)/g,
        // Pattern 2: "Name: Constantin-Daniel Avadani"
        /(?:Name|Kunde|Mitglied):\s*([A-ZÄÖÜ][a-zäöüß-]+(?:-[A-ZÄÖÜ][a-zäöüß-]+)*)\s+([A-ZÄÖÜ][a-zäöüß-]+)/gi,
        // Pattern 3: "Vorname: Constantin-Daniel, Nachname: Avadani"
        /Vorname:\s*([A-ZÄÖÜ][a-zäöüß-]+(?:-[A-ZÄÖÜ][a-zäöüß-]+)*)/gi,
        // Pattern 4: Multiple words in a row (for compound names)
        /([A-ZÄÖÜ][a-zäöüß-]+(?:\s+[A-ZÄÖÜ][a-zäöüß-]+){1,3})/g
      ];
      
      let nameFound = false;
      for (let i = 0; i < namePatterns.length && !nameFound; i++) {
        const pattern = namePatterns[i];
        const matches = Array.from(text.matchAll(pattern));
        console.log(`🔍 Pattern ${i + 1} matches:`, matches.map(m => m[0]));
        
        if (matches.length > 0) {
          // Take the first meaningful match
          for (const match of matches) {
            // Skip common words that aren't names
            const skipWords = ['Der', 'Die', 'Das', 'Essence', 'Sports', 'Wellnessclub', 'Club', 'Studio'];
            if (match[1] && !skipWords.includes(match[1])) {
              if (i === 2) {
                // Pattern 3: Only first name
                data.firstName = match[1].trim();
                // Try to find last name separately
                const lastNameMatch = text.match(/Nachname:\s*([A-ZÄÖÜ][a-zäöüß-]+)/gi);
                if (lastNameMatch) {
                  data.lastName = lastNameMatch[0].replace(/Nachname:\s*/gi, '').trim();
                }
              } else if (match[2]) {
                // Patterns 1 & 2: Both names
                data.firstName = match[1].trim();
                data.lastName = match[2].trim();
              } else {
                // Pattern 4: Split compound name
                const nameParts = match[1].trim().split(/\s+/);
                if (nameParts.length >= 2) {
                  data.firstName = nameParts.slice(0, -1).join(' ');
                  data.lastName = nameParts[nameParts.length - 1];
                }
              }
              
              if (data.firstName && data.lastName) {
                console.log('✅ Extracted Name:', data.firstName, data.lastName);
                nameFound = true;
                break;
              }
            }
          }
        }
      }
      
      if (!nameFound) {
        console.log('❌ Name extraction failed with all patterns');
        errors.push('Name konnte nicht extrahiert werden');
        // Use fallback patterns for debugging
        console.log('🔍 All capital words:', text.match(/[A-ZÄÖÜ][a-zäöüß-]+/g));
      }
      
      // Extract birth date - Pattern: "28.04.1987"
      const birthMatch = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (birthMatch) {
        data.birthDate = `${birthMatch[3]}-${birthMatch[2].padStart(2, '0')}-${birthMatch[1].padStart(2, '0')}`;
      } else {
        errors.push('Geburtsdatum konnte nicht extrahiert werden');
      }
      
      // Extract IBAN - Pattern: "DE84 6005 0101 0008 1878 64"
      const ibanMatch = text.match(/DE\d{2}\s*(?:\d{4}\s*){4}\d{2}/g);
      if (ibanMatch) {
        const iban = ibanMatch[0].replace(/\s/g, '');
        if (validateIBAN(iban)) {
          data.iban = iban;
        } else {
          errors.push(`Ungültige IBAN gefunden: ${iban}`);
        }
      } else {
        errors.push('IBAN konnte nicht extrahiert werden');
      }
      
      // Extract contract start date - Pattern: "03.03.2025"
      const contractStartMatch = text.match(/(?:vertrag.*|start.*|beginn.*|ab.*)?(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
      if (contractStartMatch) {
        data.contractStartDate = `${contractStartMatch[3]}-${contractStartMatch[2].padStart(2, '0')}-${contractStartMatch[1].padStart(2, '0')}`;
      } else {
        errors.push('Vertragsbeginn konnte nicht extrahiert werden');
      }
      
      // Extract tariff and price - Pattern: "Essential 59,00 €"
      const tariffMatch = text.match(/([A-Za-zäöüÄÖÜß\s]+)\s+(\d+),(\d{2})\s*€/);
      if (tariffMatch) {
        data.contractTariff = tariffMatch[1].trim();
        data.contractPrice = parseFloat(`${tariffMatch[2]}.${tariffMatch[3]}`);
      } else {
        errors.push('Tarif und Preis konnten nicht extrahiert werden');
      }
      
      // Extract mandate reference
      const mandateMatch = text.match(/mandat.*?([A-Z0-9-]+)/i);
      if (mandateMatch) {
        data.mandateReference = mandateMatch[1];
      } else {
        errors.push('Mandatsreferenz konnte nicht extrahiert werden');
      }
      
      // Extract address (more complex pattern)
      const addressMatch = text.match(/(\d{5}\s+[A-ZÄÖÜ][a-zäöüß\s]+)/);
      if (addressMatch) {
        data.address = addressMatch[1].trim();
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Extraktionsfehler';
      errors.push(errorMessage);
    }
    
    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      birthDate: data.birthDate,
      address: data.address,
      contractStartDate: data.contractStartDate,
      contractTariff: data.contractTariff,
      contractPrice: data.contractPrice,
      iban: data.iban,
      mandateReference: data.mandateReference,
      extractionSuccess: errors.length === 0,
      extractionErrors: errors,
      pdfType: 'contract'
    };
  }
  
  /**
   * Extract data from statement PDFs
   */
  private extractStatementData(text: string, errors: string[]): ExtractedMemberData {
    const data: Partial<ExtractedMemberData> = {
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
      
      // Extract account balance - Pattern: "Saldo: -33,00 €" (negative = overpayment)
      const balanceMatch = text.match(/saldo.*?(-?\d+),(\d{2})\s*€/i);
      if (balanceMatch) {
        const balance = parseFloat(`${balanceMatch[1]}.${balanceMatch[2]}`);
        // Note: Negative balance in statement = overpayment (positive in our system)
        data.accountBalance = -balance;
      } else {
        errors.push('Kontostand konnte nicht extrahiert werden');
      }
      
      // Try to extract name from statement (sometimes included)
      const nameMatch = text.match(/([A-ZÄÖÜ][a-zäöüß-]+(?:\s+[A-ZÄÖÜ][a-zäöüß-]+)*)\s+([A-ZÄÖÜ][a-zäöüß-]+)/);
      if (nameMatch) {
        data.firstName = nameMatch[1].trim();
        data.lastName = nameMatch[2].trim();
      }
      
      // Extract IBAN if present
      const ibanMatch = text.match(/DE\d{2}\s*(?:\d{4}\s*){4}\d{2}/g);
      if (ibanMatch) {
        const iban = ibanMatch[0].replace(/\s/g, '');
        if (validateIBAN(iban)) {
          data.iban = iban;
        }
      }
      
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
   * Merge data from contract and statement PDFs
   */
  public mergeExtractedData(contractData: ExtractedMemberData, statementData: ExtractedMemberData): ExtractedMemberData {
    const merged: ExtractedMemberData = {
      // Prefer contract data for personal information
      firstName: contractData.firstName || statementData.firstName,
      lastName: contractData.lastName || statementData.lastName,
      birthDate: contractData.birthDate || statementData.birthDate,
      address: contractData.address || statementData.address,
      phone: contractData.phone || statementData.phone,
      email: contractData.email || statementData.email,
      
      // Contract-specific data
      contractStartDate: contractData.contractStartDate,
      contractTariff: contractData.contractTariff,
      contractPrice: contractData.contractPrice,
      
      // Statement-specific data
      memberNumber: statementData.memberNumber || contractData.memberNumber,
      accountBalance: statementData.accountBalance,
      
      // Payment information (prefer contract)
      iban: contractData.iban || statementData.iban,
      mandateReference: contractData.mandateReference,
      
      // Merge extraction metadata
      extractionSuccess: contractData.extractionSuccess && statementData.extractionSuccess,
      extractionErrors: [...contractData.extractionErrors, ...statementData.extractionErrors],
      pdfType: 'contract' // Indicate this is merged data
    };
    
    return merged;
  }
}

// Export singleton instance
export const magiclinePDFProcessor = new MagiclinePDFProcessor(); 