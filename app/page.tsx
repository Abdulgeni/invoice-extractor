import React from 'react';
import InvoiceUploader from '../components/InvoiceUploader';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 py-12 md:py-20">
      <InvoiceUploader />
    </main>
  );
}