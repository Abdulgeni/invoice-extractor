# AI Invoice & Document Data Extractor

Upload any invoice or receipt — AI extracts vendor, invoice number, date, total amount, and line items automatically. Export to CSV for accounting integration.

## Live Demo

https://invoice-extractor-coral-nu.vercel.app

## Features

- Upload PNG, JPG, or JPEG invoices
- AI extracts Vendor, Invoice Number, Date, Total Amount
- Line item extraction with quantities and prices
- Download extracted data as CSV
- Clean, professional UI
- Real AI — no templates or keyword matching

## Tech Stack

Next.js 16 | TypeScript | Tailwind CSS | Gemini 2.5 Flash Vision | @google/genai | Vercel

## Quick Start

git clone https://github.com/Abdulgeni/invoice-extractor.git
cd invoice-extractor
npm install
npm run dev

## Environment Variables

Create .env.local and add:

GEMINI_API_KEY=your_gemini_api_key_here

Get a free key at aistudio.google.com/apikey

## Project Structure

invoice-extractor/
  app/
    api/
      extract/route.ts    Upload + AI extraction
      export/route.ts     CSV export
    layout.tsx
    page.tsx
  components/
    InvoiceUploader.tsx   Upload UI + results
  lib/
    gemini.ts            Gemini Vision API
  package.json

## Example Output

Vendor: East Repair Inc.
Invoice Number: US-001
Date: 2019-11-02
Total Amount: $154.06

## How It Works

1. User uploads invoice image (PNG/JPG)
2. Image is sent to Gemini Vision API
3. AI analyzes the image and extracts text
4. Structured JSON is returned
5. Data is displayed in a clean table
6. User can download as CSV

## Author

Abdulgeni — github.com/Abdulgeni

Built with Next.js, TypeScript, and Google Gemini AI.
