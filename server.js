// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 6
// Category-Aware + Strict Factual AI
// Smart Retry + Fallback Model
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

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY;

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";

const FALLBACK_MODEL =
    process.env.GEMINI_FALLBACK_MODEL ||
    "gemini-3.5-flash-lite";

const VERSION = "6.0";

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
        methods: [
            "GET",
            "POST",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(
    express.json({
        limit: "2mb"
    })
);

// ==========================================================
// CATEGORY RULES
// ==========================================================

const categoryRules = {

    "Fashion": `
Create listings for clothing and fashion products.

Use only seller-provided:
- Product type
- Fabric/material
- Color
- Size
- Pattern/design
- Fit/style
- Occasion
- Quantity
- Brand

Never invent:
fabric, color, size, brand, material, gender,
occasion, comfort, quality, certification or features.
`,

    "Beauty": `
Create listings for beauty and personal-care products.

Use only seller-provided:
- Product type
- Form/texture
- Color
- Quantity
- Variant
- Ingredients
- Skin type
- Hair type
- Fragrance
- Brand
- Product features

Never invent:
ingredients, benefits, medical claims,
treatment results, certifications,
dermatological claims or performance claims.
`,

    "Electronics": `
Create listings for electronics.

Use only seller-provided:
- Product type
- Brand
- Model
- Color
- Storage
- RAM
- Battery
- Connectivity
- Compatibility
- Warranty
- Quantity
- Features

Never invent:
RAM, storage, battery capacity,
processor, Bluetooth version,
waterproof rating, warranty,
model number or technical specifications.
`,

    "Home & Kitchen": `
Create listings for home and kitchen products.

Use only seller-provided:
- Product type
- Material
- Color
- Size
- Dimensions
- Capacity
- Quantity
- Usage
- Features

Never invent:
capacity, dimensions, material,
leak-proof claims, BPA-free claims,
heat resistance or other features.
`,

    "Shoes": `
Create listings for footwear.

Use only seller-provided:
- Product type
- Size
- Color
- Material
- Sole type
- Style
- Quantity
- Brand
- Features

Never invent:
size, material, sole type,
comfort claims, durability claims
or specifications.
`,

    "Jewellery": `
Create listings for jewellery.

Use only seller-provided:
- Product type
- Material
- Color
- Design
- Size
- Stone/gemstone
- Quantity
- Brand
- Features

Never claim:
gold, silver, diamond, gemstone,
purity or precious metal unless seller provided it.
`,

    "Toys": `
Create listings for toys and kids products.

Use only seller-provided:
- Product type
- Age range
- Material
- Size
- Quantity
- Features
- Brand

Never invent:
age suitability, safety certification,
educational claims or safety claims.
`,

    "Books": `
Create listings for books and stationery.

Use only seller-provided:
- Title
- Author
- Pages
- Format
- Edition
- Quantity
- Language
- Brand

Never invent:
author, pages, edition, publisher,
language or publication information.
`,

    "Pet": `
Create listings for pet products.

Use only seller-provided:
- Product type
- Material
- Size
- Quantity
- Color
- Compatibility
- Usage
- Features

Never invent:
pet suitability, health benefits,
safety claims or compatibility.
`,

    "Sports": `
Create listings for sports and fitness products.

Use only seller-provided:
- Product type
- Material
- Size
- Weight
- Quantity
- Usage
- Included items
- Features

Never invent:
performance claims, weight,
included accessories or specifications.
`,

    "Automotive": `
Create listings for automotive products.

Use only seller-provided:
- Product type
- Vehicle compatibility
- Material
- Size
- Model
- Part number
- Quantity
- Features

Never invent:
vehicle compatibility,
part number, installation requirements
or technical specifications.
`,

    "Garden": `
Create listings for gardening products.

Use only seller-provided:
- Product type
- Material
- Size
- Quantity
- Color
- Usage
- Compatibility
- Features

Never invent:
capacity, durability, chemical properties,
plant suitability or performance claims.
`,

    "Food": `
Create listings for food and grocery products.

Use only seller-provided:
- Product type
- Quantity
- Flavor
- Ingredients
- Packaging
- Variant
- Brand

Never invent:
ingredients, nutrition,
health benefits, expiry date,
certifications or dietary claims.
`,

    "Gifts": `
Create listings for gifts and gift products.

Use only seller-provided:
- Product type
- Material
- Color
- Size
- Quantity
- Occasion
- Included items
- Features

Never invent:
included items, material,
occasion, personalization or features.
`,

    "Other": `
Use only seller-provided information.

Never invent:
brand, material, size, color,
weight, dimensions, warranty,
certification, compatibility,
quantity or features.
`
};

// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(value) {

    const text =
        String(value || "")
            .trim()
            .toLowerCase();

    const map = {

        "fashion":
            "Fashion",

        "fashion & clothing":
            "Fashion",

        "clothing":
            "Fashion",

        "beauty":
            "Beauty",

        "electronics":
            "Electronics",

        "home & kitchen":
            "Home & Kitchen",

        "home and kitchen":
            "Home & Kitchen",

        "shoes":
            "Shoes",

        "footwear":
            "Shoes",

        "jewellery":
            "Jewellery",

        "jewelry":
            "Jewellery",

        "toys":
            "Toys",

        "toys & kids":
            "Toys",

        "books":
            "Books",

        "books & stationery":
            "Books",

        "pet":
            "Pet",

        "pets":
            "Pet",

        "sports":
            "Sports",

        "sports & fitness":
            "Sports",

        "automotive":
            "Automotive",

        "garden":
            "Garden",

        "gardening":
            "Garden",

        "food":
            "Food",

        "grocery & food":
            "Food",

        "gifts":
            "Gifts",

        "other":
            "Other"
    };

    return map[text] || "";
}

// ==========================================================
// HELPERS
// ==========================================================

function cleanText(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value).trim();
}

function getCategoryRule(category) {

    return (
        categoryRules[category] ||
        categoryRules["Other"]
    );
}

// ==========================================================
// SYSTEM PROMPT
// ==========================================================

function createSystemPrompt(category) {

    const rule =
        getCategoryRule(category);

    return `
You are the official AI Product Listing Assistant
for AI Seller Toolkit.

Your most important job is factual accuracy.

STRICT RULES:

1. USE ONLY information provided by the seller.

2. NEVER invent missing information.

3. Every useful seller-provided specification
must be preserved in the listing.

4. Do NOT silently remove seller-provided
category details.

5. If a field is empty or not provided,
do not create a value for it.

6. NEVER create fake:
- Brand
- Model
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

7. NEVER convert assumptions into facts.

8. NEVER make medical claims.

9. NEVER promise results.

10. NEVER add:
"Best"
"No.1"
"Premium"
"Guaranteed"
"100% original"
"Top quality"

unless explicitly provided by seller.

11. Do not use general knowledge
to fill missing product specifications.

12. Price may be used only if seller provided it.

13. Quantity must be used exactly as provided.

14. Preserve seller-provided category details.

15. Do not change seller-provided values.

16. Do not invent a brand when brand is missing.

17. Do not invent material when material is missing.

18. Do not invent color when color is missing.

19. Do not invent size, capacity, weight,
dimensions or technical specifications.

20. Product name itself may contain factual
information supplied by the seller.
Preserve those facts.

CATEGORY:

${category}

CATEGORY-SPECIFIC RULES:

${rule}

OUTPUT REQUIREMENTS:

Return ONLY valid JSON.

Required structure:

{
  "title": "",
  "description": "",
  "highlights": [],
  "keywords": [],
  "hashtags": [],
  "seoTitle": "",
  "seoDescription": ""
}

No Markdown.
No explanation.
No code block.
JSON only.
`;
}

// ==========================================================
// RETRY ERROR CHECK
// ==========================================================

function isRetryableError(error) {

    const status =
        error?.status ||
        error?.code ||
        error?.response?.status;

    const message =
        String(
            error?.message ||
            ""
        ).toLowerCase();

    return (

        Number(status) === 429 ||

        Number(status) === 500 ||

        Number(status) === 502 ||

        Number(status) === 503 ||

        Number(status) === 504 ||

        message.includes("503") ||

        message.includes("429") ||

        message.includes("unavailable") ||

        message.includes("high demand") ||

        message.includes("temporarily") ||

        message.includes("rate limit") ||

        message.includes("overloaded")
    );
}

// ==========================================================
// SLEEP
// ==========================================================

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

// ==========================================================
// GEMINI REQUEST
// ==========================================================

async function callGemini(
    model,
    userPrompt,
    systemPrompt
) {

    console.log(
        `🧠 Gemini model: ${model}`
    );

    const response =
        await ai.models.generateContent({

            model: model,

            config: {

                systemInstruction:
                    systemPrompt,

                responseMimeType:
                    "application/json",

                maxOutputTokens:
                    2000
            },

            contents: userPrompt
        });

    return response;
}

// ==========================================================
// SMART GEMINI RETRY + FALLBACK
// ==========================================================

async function generateWithRetry(
    userPrompt,
    systemPrompt
) {

    let lastError = null;

    const MAX_PRIMARY_ATTEMPTS = 3;

    const delays = [
        3000,
        7000
    ];

    // ======================================================
    // PRIMARY MODEL
    // ======================================================

    for (
        let attempt = 1;
        attempt <= MAX_PRIMARY_ATTEMPTS;
        attempt++
    ) {

        try {

            console.log(
                `🤖 Primary Gemini attempt ${attempt}/${MAX_PRIMARY_ATTEMPTS}`
            );

            const response =
                await callGemini(
                    MODEL,
                    userPrompt,
                    systemPrompt
                );

            console.log(
                "✅ Primary Gemini model succeeded"
            );

            return response;

        }
        catch (error) {

            lastError = error;

            console.error(
                `❌ Primary attempt ${attempt} failed:`,
                error?.message || error
            );

            // Permanent error
            if (
                !isRetryableError(error)
            ) {

                throw error;
            }

            // Last attempt
            if (
                attempt ===
                MAX_PRIMARY_ATTEMPTS
            ) {

                console.log(
                    "⚠️ Primary model unavailable."
                );

                console.log(
                    "🔄 Switching to fallback model..."
                );

                break;
            }

            const baseDelay =
                delays[attempt - 1] ||
                7000;

            const jitter =
                Math.floor(
                    Math.random() * 1500
                );

            const waitTime =
                baseDelay + jitter;

            console.log(
                `⏳ Waiting ${Math.ceil(
                    waitTime / 1000
                )} seconds before retry...`
            );

            await sleep(
                waitTime
            );
        }
    }

    // ======================================================
    // FALLBACK MODEL
    // ======================================================

    try {

        console.log(
            "🔄 Fallback Gemini model starting..."
        );

        console.log(
            `🧠 Fallback model: ${FALLBACK_MODEL}`
        );

        const response =
            await callGemini(
                FALLBACK_MODEL,
                userPrompt,
                systemPrompt
            );

        console.log(
            "✅ Fallback Gemini model succeeded"
        );

        return response;

    }
    catch (fallbackError) {

        console.error(
            "❌ Fallback model failed:",
            fallbackError?.message ||
            fallbackError
        );

        throw (
            fallbackError ||
            lastError
        );
    }
}

// ==========================================================
// GET RESPONSE TEXT
// ==========================================================

function getResponseText(response) {

    let text = "";

    if (
        response &&
        typeof response.text === "string"
    ) {

        text =
            response.text;

    }
    else if (
        response &&
        typeof response.text === "function"
    ) {

        text =
            response.text();
    }

    return cleanText(text);
}

// ==========================================================
// PARSE JSON SAFELY
// ==========================================================

function parseListingJSON(text) {

    if (!text) {

        throw new Error(
            "AI returned an empty response."
        );
    }

    // First attempt
    try {

        return JSON.parse(text);

    }
    catch (error) {

        // Continue below
    }

    // Remove Markdown code fences
    const cleaned =
        text
            .replace(
                /```json/gi,
                ""
            )
            .replace(
                /```/g,
                ""
            )
            .trim();

    try {

        return JSON.parse(cleaned);

    }
    catch (error) {

        throw new Error(
            "AI returned invalid JSON."
        );
    }
}

// ==========================================================
// NORMALIZE LISTING
// ==========================================================

function normalizeListing(listing) {

    if (
        !listing ||
        typeof listing !== "object"
    ) {

        listing = {};
    }

    return {

        title:
            cleanText(
                listing.title
            ),

        description:
            cleanText(
                listing.description
            ),

        highlights:
            Array.isArray(
                listing.highlights
            )
                ? listing.highlights
                    .map(
                        item =>
                            cleanText(item)
                    )
                    .filter(Boolean)
                : [],

        keywords:
            Array.isArray(
                listing.keywords
            )
                ? listing.keywords
                    .map(
                        item =>
                            cleanText(item)
                    )
                    .filter(Boolean)
                : [],

        hashtags:
            Array.isArray(
                listing.hashtags
            )
                ? listing.hashtags
                    .map(
                        item =>
                            cleanText(item)
                    )
                    .filter(Boolean)
                : [],

        seoTitle:
            cleanText(
                listing.seoTitle
            ),

        seoDescription:
            cleanText(
                listing.seoDescription
            )
    };
}

// ==========================================================
// FORMAT LISTING
// ==========================================================

function formatListing(listing) {

    return `
TITLE

${listing.title}


DESCRIPTION

${listing.description}


HIGHLIGHTS

${listing.highlights
    .map(
        item =>
            `• ${item}`
    )
    .join("\n")}


KEYWORDS

${listing.keywords.join(", ")}


HASHTAGS

${listing.hashtags.join(" ")}


SEO TITLE

${listing.seoTitle}


SEO DESCRIPTION

${listing.seoDescription}
`.trim();
}

// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "AI Seller Toolkit Backend is running",

            version:
                VERSION,

            model:
                MODEL,

            fallbackModel:
                FALLBACK_MODEL,

            geminiConfigured:
                !!GEMINI_API_KEY
        });
    }
);

// ==========================================================
// API STATUS
// ==========================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            server:
                "online",

            version:
                VERSION,

            model:
                MODEL,

            fallbackModel:
                FALLBACK_MODEL,

            geminiConfigured:
                !!GEMINI_API_KEY
        });
    }
);

// ==========================================================
// CATEGORY API
// ==========================================================

app.get(
    "/api/categories",
    (req, res) => {

        res.json({

            success: true,

            categories:
                Object.keys(
                    categoryRules
                )
        });
    }
);

// ==========================================================
// GENERATE LISTING
// ==========================================================

async function handleGenerateListing(
    req,
    res
) {

    try {

        // ==================================================
        // API KEY CHECK
        // ==================================================

        if (!ai) {

            return res.status(500).json({

                success: false,

                error:
                    "Gemini API key is not configured.",

                version:
                    VERSION
            });
        }

        // ==================================================
        // REQUEST BODY
        // ==================================================

        const body =
            req.body || {};

        // ==================================================
        // CATEGORY
        // ==================================================

        const category =
            normalizeCategory(
                body.category
            );

        // ==================================================
        // PRODUCT NAME
        // ==================================================

        const productName =
            cleanText(
                body.productName
            );

        if (!category) {

            return res.status(400).json({

                success: false,

                error:
                    "Product category is required.",

                version:
                    VERSION
            });
        }

        if (!productName) {

            return res.status(400).json({

                success: false,

                error:
                    "Product name is required.",

                version:
                    VERSION
            });
        }

        // ==================================================
        // CATEGORY DATA
        // ==================================================

        const categoryData =
            body.categoryData &&
            typeof body.categoryData === "object"
                ? body.categoryData
                : {};

        // ==================================================
        // COMMON SELLER FIELDS
        // ==================================================

        const brand =
            cleanText(
                body.brand
            );

        const price =
            cleanText(
                body.price
            );

        const productDetails =
            cleanText(
                body.productDetails
            );

        const productFeatures =
            cleanText(
                body.productFeatures
            );

        const extraInfo =
            cleanText(
                body.extraInfo
            );

        const color =
            cleanText(
                body.color
            );

        const size =
            cleanText(
                body.size
            );

        const material =
            cleanText(
                body.material
            );

        const imageDescription =
            cleanText(
                body.imageDescription
            );

        // ==================================================
        // CATEGORY FIELDS
        // ==================================================

        const categoryFieldsText =
            Object.entries(
                categoryData
            )
                .filter(
                    ([key, value]) =>
                        cleanText(value)
                )
                .map(
                    ([key, value]) =>
                        `${key}: ${cleanText(value)}`
                )
                .join("\n");

        // ==================================================
        // USER PROMPT
        // ==================================================

        const userPrompt = `
Create a marketplace product listing.

IMPORTANT:
Use ONLY the seller information below.

Do not guess.
Do not invent.
Do not add missing specifications.
Do not add unsupported claims.

CATEGORY:
${category}

PRODUCT NAME:
${productName}

BRAND:
${brand || "Not provided"}

PRICE:
${price || "Not provided"}

GENERAL PRODUCT DETAILS:
${productDetails || "Not provided"}

CATEGORY DETAILS:
${categoryFieldsText || "Not provided"}

PRODUCT FEATURES:
${productFeatures || "Not provided"}

EXTRA PRODUCT INFORMATION:
${extraInfo || "Not provided"}

COLOR:
${color || "Not provided"}

SIZE:
${size || "Not provided"}

MATERIAL:
${material || "Not provided"}

IMAGE DESCRIPTION:
${imageDescription || "Not provided"}

IMPORTANT:

Every factual specification actually provided
by the seller should be preserved.

If a specification is not provided,
DO NOT invent it.

Do not use general product knowledge
to fill missing information.

Do not create a fake brand.

Do not create a fake material.

Do not create a fake color.

Do not create a fake size.

Do not create a fake quantity.

Do not create fake technical specifications.

Generate the required JSON only.
`;

        // ==================================================
        // SYSTEM PROMPT
        // ==================================================

        const systemPrompt =
            createSystemPrompt(
                category
            );

        // ==================================================
        // GEMINI
        // ==================================================

        const response =
            await generateWithRetry(
                userPrompt,
                systemPrompt
            );

        // ==================================================
        // RESPONSE TEXT
        // ==================================================

        const resultText =
            getResponseText(
                response
            );

        // ==================================================
        // PARSE
        // ==================================================

        const rawListing =
            parseListingJSON(
                resultText
            );

        // ==================================================
        // NORMALIZE
        // ==================================================

        const listing =
            normalizeListing(
                rawListing
            );

        // ==================================================
        // FINAL RESPONSE
        // ==================================================

        return res.json({

            success:
                true,

            category:
                category,

            productName:
                productName,

            listing:
                listing,

            result:
                formatListing(
                    listing
                ),

            version:
                VERSION
        });

    }
    catch (error) {

        console.error(
            "❌ Generate Listing Error:",
            error?.message ||
            error
        );

        const status =
            Number(
                error?.status ||
                error?.code ||
                error?.response?.status
            );

        const message =
            String(
                error?.message ||
                ""
            );

        const lowerMessage =
            message.toLowerCase();

        // ==================================================
        // 503
        // ==================================================

        if (
            status === 503 ||
            lowerMessage.includes("503") ||
            lowerMessage.includes("high demand") ||
            lowerMessage.includes("unavailable")
        ) {

            return res.status(503).json({

                success:
                    false,

                error:
                    "Gemini is temporarily busy. Please try again after a short while.",

                retryable:
                    true,

                version:
                    VERSION
            });
        }

        // ==================================================
        // 429
        // ==================================================

        if (
            status === 429 ||
            lowerMessage.includes("rate limit") ||
            lowerMessage.includes("quota")
        ) {

            return res.status(429).json({

                success:
                    false,

                error:
                    "Gemini request limit was reached. Please try again shortly.",

                retryable:
                    true,

                version:
                    VERSION
            });
        }

        // ==================================================
        // 404 MODEL
        // ==================================================

        if (
            status === 404 ||
            lowerMessage.includes("not found") ||
            lowerMessage.includes("not available")
        ) {

            return res.status(503).json({

                success:
                    false,

                error:
                    "The configured Gemini model is not available. Please check GEMINI_MODEL and GEMINI_FALLBACK_MODEL in Render Environment.",

                retryable:
                    false,

                version:
                    VERSION
            });
        }

        // ==================================================
        // GENERAL ERROR
        // ==================================================

        return res.status(500).json({

            success:
                false,

            error:
                message ||
                "Unable to generate product listing.",

            version:
                VERSION
        });
    }
}

// ==========================================================
// API ENDPOINTS
// ==========================================================

// New frontend endpoint
app.post(
    "/api/generate-listing",
    handleGenerateListing
);

// Old frontend compatibility
app.post(
    "/generate",
    handleGenerateListing
);

// ==========================================================
// 404 HANDLER
// ==========================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success:
                false,

            error:
                "API endpoint not found",

            path:
                req.originalUrl,

            version:
                VERSION
        });
    }
);

// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "❌ Server Error:",
            err
        );

        if (
            res.headersSent
        ) {

            return next(err);
        }

        res.status(500).json({

            success:
                false,

            error:
                "Internal server error",

            version:
                VERSION
        });
    }
);

// ==========================================================
// START SERVER
// ==========================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "=============================================="
        );

        console.log(
            "AI SELLER TOOLKIT BACKEND"
        );

        console.log(
            `Version: ${VERSION}`
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Gemini Model: ${MODEL}`
        );

        console.log(
            `Gemini Fallback Model: ${FALLBACK_MODEL}`
        );

        console.log(
            `Gemini API: ${
                GEMINI_API_KEY
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            }`
        );

        console.log(
            "=============================================="
        );
    }
);
