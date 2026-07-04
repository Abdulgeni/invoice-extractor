'use client';
import { useState, useRef } from 'react';

interface LineItem {
  description: string;
  quantity: number | string;
  unitPrice: number | string;
  total: number | string;
}

interface ExtractionResult {
  vendor?: string;
  invoiceNumber?: string;
  date?: string;
  currency?: string;
  totalAmount?: string | number;
  lineItems?: LineItem[];
}

export default function InvoiceUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
      setError('Failed to process and analyze the invoice document.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    if (!result) return;
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: result, format: 'csv' })
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${result.invoiceNumber || 'export'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to generate export file.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-8 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Upload Console Card */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-900 p-6 md:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">AI Invoice Extractor</h1>
        </div>
        <p className="text-sm text-slate-400 mb-6">Upload invoices for automatic data extraction and line-item processing.</p>
        
        {/* Drag and Drop Zone Container */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-indigo-500 bg-indigo-500/5' 
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />
          
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-200">Drag and drop your invoice here, or click to browse</p>
          <p className="text-xs text-slate-500 mt-2">Supported: PNG, JPG, JPEG, and PDF</p>
        </div>
        
        {/* Active File Card */}
        {file && (
          <div className="mt-4 p-3 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-xs text-slate-300 font-mono truncate">{file.name}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-6 w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 disabled:shadow-none"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Extracting Data...</span>
            </>
          ) : (
            <span>Extract Invoice Data</span>
          )}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-xs text-red-400 flex gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Extracted Metadata Dashboard */}
      {result && (
        <div className="bg-slate-900/40 rounded-2xl border border-slate-900 p-6 md:p-8 backdrop-blur-sm animate-fadeIn flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Extracted Datasets</h2>
              <p className="text-xs text-slate-400 mt-1">Review verified variables processed by parser</p>
            </div>
            <button
              onClick={downloadCSV}
              className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Download CSV</span>
            </button>
          </div>
          
          {/* Main Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/60">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vendor</p>
              <p className="text-base font-semibold text-slate-200 mt-1 truncate">{result.vendor || 'N/A'}</p>
            </div>
            <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/60">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice Number</p>
              <p className="text-base font-mono font-semibold text-slate-200 mt-1 truncate">{result.invoiceNumber || 'N/A'}</p>
            </div>
            <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/60">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Issue Date</p>
              <p className="text-base font-semibold text-slate-200 mt-1">{result.date || 'N/A'}</p>
            </div>
            <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/60">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Charge</p>
              <p className="text-xl font-bold text-indigo-400 mt-1">
                {result.currency || '$'}{result.totalAmount || '0.00'}
              </p>
            </div>
          </div>
          
          {/* Line Items Tabular Grid */}
          {result.lineItems && result.lineItems.length > 0 && (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
              <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Transaction Line Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-950/40 border-b border-slate-800">
                    <tr>
                      <th scope="col" className="p-4 font-semibold">Description</th>
                      <th scope="col" className="p-4 text-right font-semibold">Quantity</th>
                      <th scope="col" className="p-4 text-right font-semibold">Unit Price</th>
                      <th scope="col" className="p-4 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.lineItems.map((item, i) => (
                      <tr key={i} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-900/20 transition-colors">
                        <td className="p-4 font-light text-slate-200 max-w-xs truncate">{item.description}</td>
                        <td className="p-4 text-right font-mono text-slate-400">{item.quantity}</td>
                        <td className="p-4 text-right font-mono text-slate-400">{item.unitPrice}</td>
                        <td className="p-4 text-right font-mono font-medium text-slate-200">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}