import { NextResponse } from 'next/server';
import { extractInvoiceData } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    
    // Determine mime type
    const mimeType = file.type || 'image/png';
    
    const extractedData = await extractInvoiceData(base64, mimeType);
    
    return NextResponse.json({
      success: true,
      data: extractedData,
      filename: file.name
    });
    
  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract data' },
      { status: 500 }
    );
  }
}