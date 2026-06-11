import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function extractInvoiceData(base64Image: string, mimeType: string): Promise<any> {
  const prompt = `Extract ALL visible invoice data from this image. Look carefully at the text in the image. Return ONLY valid JSON.

Find these fields in the image text:
- Vendor/company name
- Invoice number
- Date
- Total amount

Return format:
{
  "vendor": "company name",
  "invoiceNumber": "INV-001", 
  "date": "2024-01-15",
  "totalAmount": 150.00,
  "currency": "USD"
}

If you cannot read a field, use "N/A". Return ONLY JSON, no other text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      }
    ]
  });

  const text = response.text || '';
  
  // Extract JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  return {
    vendor: 'N/A',
    invoiceNumber: 'N/A',
    date: 'N/A',
    totalAmount: 0,
    currency: 'USD'
  };
}