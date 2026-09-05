# AI Seller Toolkit Backend — FINAL VERSION 25.0

Node.js + Express + Google Gemini backend for AI Seller Toolkit.

## Supported categories
- Fashion
- Beauty
- Electronics
- Home & Kitchen
- Shoes
- Jewellery
- Toys
- Books
- Pet
- Sports
- Automotive
- Garden
- Food
- Gifts

## Main API endpoints
- GET /api/status
- GET /api/categories
- POST /api/generate-title
- POST /api/generate-description
- POST /api/generate-seo
- POST /api/generate-listing
- POST /api/generate-hashtags

Backward-compatible aliases:
- POST /api/generate
- POST /api/generate-keywords

## Setup
1. Upload these files to Render.
2. Set GEMINI_API_KEY in Render Environment Variables.
3. Optional: set GEMINI_MODEL (default: gemini-3.6-flash).
4. Build command: npm install
5. Start command: npm start

## Important
The backend never needs a frontend JavaScript variable named `mainKeyword`.
The SEO endpoint accepts `mainKeyword` as a JSON field for backward compatibility.

The calculator tools (profit, GST, shipping, discount, QR/barcode, etc.) can remain frontend-only and do not need Gemini API calls.
