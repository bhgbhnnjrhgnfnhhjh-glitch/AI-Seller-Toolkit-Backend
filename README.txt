AI SELLER TOOLKIT — SEO GENERATOR FINAL VERSION 28

Files:
- server.js                 Backend; keeps existing title/description/listing/hashtag APIs and adds robust SEO API.
- seo-generator.html        SEO Generator frontend.
- seo-generator.js          SEO Generator frontend controller.
- package.json               Render/Node dependencies.

Backend:
POST /api/generate-seo
GET  /api/status
GET  /api/categories

Compatibility:
POST /api/generate-keywords -> same SEO handler

Categories:
Fashion, Beauty, Electronics, Home & Kitchen, Shoes, Jewellery, Toys, Books, Pet, Sports, Automotive, Garden, Food, Gifts

Environment variables:
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-3.6-flash
PORT=3000 (Render supplies PORT automatically)

Important:
Do not put GEMINI_API_KEY in the HTML or JavaScript frontend.
