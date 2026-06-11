'use client';
import { useState } from 'react';

export default function InvoiceUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.data);
      }
    } catch {
      setError('Failed to process invoice');
    }
    
    setLoading(false);
  };

  const downloadCSV = async () => {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: result, format: 'csv' })
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice.csv';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📄 AI Invoice Extractor</h1>
        <p className="text-gray-500 mb-6">Upload an invoice — AI extracts all data automatically</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4"
          />
          <p className="text-sm text-gray-400">Supported: PNG, JPG, JPEG. For PDFs, take a screenshot and upload the image.</p>
        </div>
        
        {file && (
          <p className="text-sm text-gray-600 mb-4">📎 {file.name}</p>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
        >
          {loading ? '🔍 Extracting Data...' : 'Extract Invoice Data'}
        </button>
        
        {error && (
          <p className="mt-4 text-red-500 text-center">{error}</p>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">📋 Extracted Data</h2>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📥 Download CSV
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-500">Vendor</p>
              <p className="text-lg font-semibold">{result.vendor || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="text-lg font-semibold">{result.invoiceNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-lg font-semibold">{result.date || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                {result.currency || '$'} {result.totalAmount || '0.00'}
              </p>
            </div>
          </div>
          
          {result.lineItems && result.lineItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">📦 Line Items</h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Qty</th>
                    <th className="text-right p-3">Unit Price</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.lineItems.map((item: any, i: number) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{item.description}</td>
                      <td className="text-right p-3">{item.quantity}</td>
                      <td className="text-right p-3">{item.unitPrice}</td>
                      <td className="text-right p-3 font-semibold">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}