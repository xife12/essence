import { NextRequest, NextResponse } from 'next/server';
import { MagiclinePDFProcessor } from '@/lib/services/pdf-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process PDF server-side
    const pdfProcessor = new MagiclinePDFProcessor();
    const result = await pdfProcessor.processPDF(buffer);

    if (!result.success || !result.memberData) {
      return NextResponse.json({
        success: false,
        error: result.errors.join(', ') || 'PDF-Extraktion fehlgeschlagen'
      });
    }

    // Validate data (weniger strikt für Kontoauszüge)
    const validationIssues = pdfProcessor.validateMemberData(result.memberData);
    
    // Für Kontoauszüge sind Namen optional, für Verträge erforderlich
    const criticalErrors = validationIssues.filter(issue => {
      if (result.memberData.pdfType === 'statement') {
        // Bei Kontoauszügen sind nur Mitgliedsnummer und IBAN kritisch
        return issue.severity === 'error' && 
               (issue.field === 'memberNumber' || issue.field === 'iban');
      } else {
        // Bei Verträgen sind Namen erforderlich
        return issue.severity === 'error';
      }
    });

    if (criticalErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: criticalErrors.map(e => e.issue).join(', ')
      });
    }

    return NextResponse.json({
      success: true,
      data: result.memberData,
      warnings: validationIssues.filter(issue => issue.severity === 'warning')
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Processing failed' 
      },
      { status: 500 }
    );
  }
} 