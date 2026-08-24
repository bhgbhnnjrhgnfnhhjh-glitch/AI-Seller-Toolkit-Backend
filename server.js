// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 4
// Gemini AI Backend
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { GoogleGenAI } = require("@google/genai");

const app = express();

// ==========================================================
// BASIC CONFIG
// ==========================================================

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// ==========================================================
// GEMINI CLIENT
// ==========================================================

let ai = null;

if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    });
}

// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json({ limit: "2mb" }));

// ==========================================================
// CATEGORY RULES
// ==========================================================

const categoryRules = {

    "Fashion & Clothing": `
Create product listings for clothing and fashion products.

Focus on:
- Product type
- Fabric only if provided
- Color only if provided
- Size only if provided
- Pattern/design only if provided
- Fit/style only if provided
- Gender/age only if provided

Never invent fabric, size, color, brand, material,
features, certifications or specifications.
`,

    "Beauty": `
Create product listings for beauty and personal-care products.

Focus on:
- Product type
- Quantity only if provided
- Ingredients only if provided
- Skin/hair type only if provided
- Usage only when supported by product information

Never invent ingredients, medical claims,
benefits, certifications or results.
Do not make unsupported health or treatment claims.
`,

    "Electronics": `
Create product listings for electronic products.

Focus on:
- Product type
- Brand only if provided
- Model only if provided
- Storage only if provided
- Battery only if provided
- Connectivity only if provided
- Compatibility only if provided
- Technical specifications only if provided

Never invent RAM, ROM, battery capacity,
processor, camera, warranty, connectivity,
model number or technical specifications.
`,

    "Home & Kitchen": `
Create product listings for home and kitchen products.

Focus on:
- Product type
- Material only if provided
- Size/dimensions only if provided
- Capacity only if provided
- Color only if provided
- Quantity only if provided
- Usage only when supported

Never invent material, dimensions, capacity,
quantity or special features.
`,

    "Jewellery": `
Create product listings for jewellery and accessories.

Focus on:
- Product type
- Material only if provided
- Color only if provided
- Design only if provided
- Size only if provided
- Stone/gemstone only if provided

Never claim gold, silver, diamond,
precious stones or purity unless explicitly provided.
`,

    "Footwear": `
Create product listings for footwear.

Focus on:
- Product type
- Size only if provided
- Color only if provided
- Material only if provided
- Sole type only if provided
- Style only if provided

Never invent material, size, sole type,
comfort claims or specifications.
`,

    "Bags & Accessories": `
Create product listings for bags and fashion accessories.

Focus on:
- Product type
- Material only if provided
- Color only if provided
- Size/capacity only if provided
- Compartments only if provided
- Closure only if provided

Never invent capacity, compartments,
material or features.
`,

    "Toys & Kids": `
Create product listings for toys and children's products.

Focus on:
- Product type
- Age range only if provided
- Material only if provided
- Quantity only if provided
- Size only if provided
- Features only if provided

Never invent age suitability,
safety certifications or educational claims.
`,

    "Sports & Fitness": `
Create product listings for sports and fitness products.

Focus on:
- Product type
- Material only if provided
- Size only if provided
- Weight only if provided
- Usage only if supported
- Included items only if provided

Never invent performance claims,
weight, specifications or included accessories.
`,

    "Grocery & Food": `
Create product listings for grocery and food products.

Focus on:
- Product type
- Quantity only if provided
- Flavor only if provided
- Ingredients only if provided
- Packaging only if provided

Never invent ingredients, nutritional values,
health benefits, expiry dates or certifications.
`,

    "Automotive": `
Create product listings for automotive products.

Focus on:
- Product type
- Vehicle compatibility only if provided
- Material only if provided
- Size only if provided
- Model/part number only if provided

Never invent compatibility, specifications,
part numbers or installation requirements.
`,

    "Books & Stationery": `
Create product listings for books and stationery.

Focus on:
- Product type
- Title only if provided
- Author only if provided
- Pages only if provided
- Quantity only if provided
- Format only if provided

Never invent author, page count,
edition or publication information.
`,

    "Other": `
Create a general product listing.

Use only the information supplied by the seller.
Never invent product specifications,
brand, material, size, color, warranty,
certifications or features.
`
};

// ==========================================================
// HELPERS
// ==========================================================

function cleanText(value) {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
}

function getCategoryRule(category) {

    const normalized = cleanText(category);

    if (!normalized) {
        return null;
    }

    return (
        categoryRules[normalized] ||
        categoryRules["Other"]
    );
}

// ==========================================================
// SYSTEM PROMPT
// ==========================================================

function createSystemPrompt(category) {

    const rule = getCategoryRule(category);

    return `
You are the official AI Product Listing Assistant
for AI Seller Toolkit.

Your job is to create accurate marketplace product listings.

IMPORTANT RULES:

1. NEVER invent product information.

2. Use ONLY information provided by the seller.

3. If a specification is missing, do NOT guess it.

4. Do NOT create fake:
- Brand
- Model number
- Material
- Fabric
- Color
- Size
- Weight
- Dimensions
- Battery
- Storage
- RAM
- Processor
- Warranty
- Certification
- Ingredients
- Quantity
- Compatibility
- Features

5. Do not convert assumptions into facts.

6. Avoid unsupported superlatives such as:
- Best
- No.1
- Premium
- Guaranteed
- 100% original
- Top quality

unless the seller explicitly provides such information
and it is appropriate.

7. Do not make medical or guaranteed-result claims.

8. Keep the listing suitable for online marketplaces.

9. Use clear and simple language.

10. If information is missing, simply leave that information
out of the generated listing.

CATEGORY:

${category}

CATEGORY-SPECIFIC RULES:

${rule}

RETURN ONLY VALID JSON.

Required JSON structure:

{
  "title": "",
  "description": "",
  "highlights": [],
  "keywords": [],
  "hashtags": [],
  "seoTitle": "",
  "seoDescription": ""
}

The JSON must be valid.
Do not add Markdown.
Do not add explanations outside the JSON.
`;
}

// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "AI Seller Toolkit Backend is running",
        version: "4.0",
        model: MODEL,
        geminiConfigured: !!GEMINI_API_KEY
    });
});

// ==========================================================
// API STATUS
// ==========================================================

app.get("/api/status", (req, res) => {

    res.json({
        success: true,
        server: "online",
        version: "4.0",
        geminiConfigured: !!GEMINI_API_KEY,
        model: MODEL
    });
});

// ==========================================================
// CATEGORY API
// ==========================================================

app.get("/api/categories", (req, res) => {

    res.json({
        success: true,
        categories: Object.keys(categoryRules)
    });
});

// ==========================================================
// PRODUCT LISTING API
// ==========================================================

app.post("/api/generate-listing", async (req, res) => {

    try {

        // --------------------------------------------------
        // CHECK API KEY
        // --------------------------------------------------

        if (!ai) {

            return res.status(500).json({
                success: false,
                error: "Gemini API key is not configured on the server."
            });
        }

        // --------------------------------------------------
        // GET INPUT
        // --------------------------------------------------

        const {
            category,
            productName,
            productDetails,
            brand,
            price,
            color,
            size,
            material,
            imageDescription
        } = req.body;

        // --------------------------------------------------
        // CATEGORY VALIDATION
        // --------------------------------------------------

        if (!category || !cleanText(category)) {

            return res.status(400).json({
                success: false,
                error: "Product category is required"
            });
        }

        // --------------------------------------------------
        // PRODUCT NAME VALIDATION
        // --------------------------------------------------

        if (!productName || !cleanText(productName)) {

            return res.status(400).json({
                success: false,
                error: "Product name is required"
            });
        }

        // --------------------------------------------------
        // PRODUCT DATA
        // --------------------------------------------------

        const productData = {

            productName: cleanText(productName),

            productDetails: cleanText(productDetails),

            brand: cleanText(brand),

            price: cleanText(price),

            color: cleanText(color),

            size: cleanText(size),

            material: cleanText(material),

            imageDescription: cleanText(imageDescription)
        };

        // --------------------------------------------------
        // USER PROMPT
        // --------------------------------------------------

        const userPrompt = `
Create a product listing using the following seller-provided
information.

IMPORTANT:
Only use information that is actually present below.
Do not guess missing information.

CATEGORY:
${category}

PRODUCT NAME:
${productData.productName}

PRODUCT DETAILS:
${productData.productDetails || "Not provided"}

BRAND:
${productData.brand || "Not provided"}

PRICE:
${productData.price || "Not provided"}

COLOR:
${productData.color || "Not provided"}

SIZE:
${productData.size || "Not provided"}

MATERIAL:
${productData.material || "Not provided"}

IMAGE DESCRIPTION:
${productData.imageDescription || "Not provided"}

Generate the required JSON listing.
`;

        // --------------------------------------------------
        // GEMINI REQUEST
        // --------------------------------------------------

        const response = await ai.models.generateContent({

            model: MODEL,

            config: {
                systemInstruction: createSystemPrompt(category),

                temperature: 0.2,

                responseMimeType: "application/json"
            },

            contents: userPrompt
        });

        // --------------------------------------------------
        // GET AI TEXT
        // --------------------------------------------------

        let resultText = "";

        if (response && response.text) {
            resultText = response.text;
        } else if (
            response &&
            typeof response.text === "function"
        ) {
            resultText = response.text();
        }

        // --------------------------------------------------
        // CHECK EMPTY RESPONSE
        // --------------------------------------------------

        if (!resultText) {

            return res.status(500).json({
                success: false,
                error: "AI returned an empty response."
            });
        }

        // --------------------------------------------------
        // PARSE JSON
        // --------------------------------------------------

        let listing;

        try {

            listing = JSON.parse(resultText);

        } catch (parseError) {

            // Try to remove accidental Markdown fences
            const cleaned = resultText
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

            try {

                listing = JSON.parse(cleaned);

            } catch (secondError) {

                return res.status(500).json({
                    success: false,
                    error: "AI returned invalid JSON.",
                    raw: resultText
                });
            }
        }

        // --------------------------------------------------
        // NORMALIZE RESULT
        // --------------------------------------------------

        listing.title = cleanText(listing.title);

        listing.description = cleanText(
            listing.description
        );

        listing.seoTitle = cleanText(
            listing.seoTitle
        );

        listing.seoDescription = cleanText(
            listing.seoDescription
        );

        listing.highlights = Array.isArray(
            listing.highlights
        )
            ? listing.highlights
            : [];

        listing.keywords = Array.isArray(
            listing.keywords
        )
            ? listing.keywords
            : [];

        listing.hashtags = Array.isArray(
            listing.hashtags
        )
            ? listing.hashtags
            : [];

        // --------------------------------------------------
        // FINAL RESPONSE
        // --------------------------------------------------

        return res.json({

            success: true,

            category: category,

            productName: productData.productName,

            listing: listing,

            version: "4.0"
        });

    } catch (error) {

        console.error(
            "Generate Listing Error:",
            error
        );

        // --------------------------------------------------
        // FRIENDLY ERROR
        // --------------------------------------------------

        let message =
            "Unable to generate product listing.";

        if (
            error &&
            error.message
        ) {
            message = error.message;
        }

        return res.status(500).json({

            success: false,

            error: message,

            version: "4.0"
        });
    }
});

// ==========================================================
// 404 HANDLER
// ==========================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        error: "API endpoint not found",

        path: req.originalUrl
    });
});

// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use((err, req, res, next) => {

    console.error(
        "Server Error:",
        err
    );

    res.status(500).json({

        success: false,

        error: "Internal server error"
    });
});

// ==========================================================
// START SERVER
// ==========================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        "=============================================="
    );

    console.log(
        "AI SELLER TOOLKIT BACKEND"
    );

    console.log(
        "Version: 4.0"
    );

    console.log(
        `Server running on port ${PORT}`
    );

    console.log(
        `Gemini Model: ${MODEL}`
    );

    console.log(
        `Gemini API: ${GEMINI_API_KEY ? "CONFIGURED" : "NOT CONFIGURED"}`
    );

    console.log(
        "=============================================="
    );
});
