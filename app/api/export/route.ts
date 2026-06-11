import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { data, format } = await request.json();
    
    if (format === 'csv') {
      const csv = convertToCSV(data);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=invoice.csv'
        }
      });
    }
    
    if (format === 'json') {
      return NextResponse.json(data);
    }
    
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function convertToCSV(data: any): string {
  const rows = [
    ['Field', 'Value'],
    ['Vendor', data.vendor],
    ['Invoice Number', data.invoiceNumber],
    ['Date', data.date],
    ['Due Date', data.dueDate],
    ['Total Amount', data.totalAmount],
    ['Currency', data.currency],
    ['Tax', data.tax],
    ['Subtotal', data.subtotal],
    ['Notes', data.notes],
    [''],
    ['Line Items'],
    ['Description', 'Quantity', 'Unit Price', 'Total']
  ];
  
  if (data.lineItems) {
    data.lineItems.forEach((item: any) => {
      rows.push([item.description, item.quantity, item.unitPrice, item.total]);
    });
  }
  
  return rows.map(row => row.join(',')).join('\n');
}