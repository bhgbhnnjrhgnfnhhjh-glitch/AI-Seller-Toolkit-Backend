// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 7
// Category-Aware + Strict Factual AI
// Structured JSON + Smart Retry + Fallback
// Seller Facts Preservation
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
    process.env.GEMINI_API_KEY || "";

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";

const FALLBACK_MODEL =
    process.env.GEMINI_FALLBACK_MODEL ||
    "gemini-2.5-flash-lite";

const VERSION = "7.0";

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
Product type, fabric/material, color, size,
pattern/design, fit/style, occasion,
quantity, brand and features.

Never invent fabric, color, size, brand,
material, gender, occasion, comfort,
quality, certification or features.
`,

    "Beauty": `
Create listings for beauty and personal-care products.

Use only seller-provided:
Product type, form/texture, color, quantity,
variant, ingredients, skin type, hair type,
fragrance, brand and product features.

Never invent ingredients, benefits,
medical claims, treatment results,
certifications, dermatological claims
or performance claims.
`,

    "Electronics": `
Create listings for electronics.

Use only seller-provided:
Product type, brand, model, color,
storage, RAM, battery, connectivity,
compatibility, warranty, quantity
and features.

Never invent RAM, storage, battery capacity,
processor, Bluetooth version, waterproof rating,
warranty, model number or technical specifications.
`,

    "Home & Kitchen": `
Create listings for home and kitchen products.

Use only seller-provided:
Product type, material, color, size,
dimensions, capacity, quantity, usage
and features.

Never invent capacity, dimensions, material,
leak-proof claims, BPA-free claims,
heat resistance or other features.
`,

    "Shoes": `
Create listings for footwear.

Use only seller-provided:
Product type, size, color, material,
sole type, style, quantity, brand and features.

Never invent size, material, sole type,
comfort claims, durability claims
or specifications.
`,

    "Jewellery": `
Create listings for jewellery.

Use only seller-provided:
Product type, material, color, design,
size, stone/gemstone, quantity, brand
and features.

Never claim gold, silver, diamond,
gemstone, purity or precious metal
unless explicitly provided.
`,

    "Toys": `
Create listings for toys and kids products.

Use only seller-provided:
Product type, age range, material,
size, quantity, features and brand.

Never invent age suitability,
safety certification, educational claims
or safety claims.
`,

    "Books": `
Create listings for books and stationery.

Use only seller-provided:
Title, author, pages, format, edition,
quantity, language, publisher and brand.

Never invent author, pages, edition,
publisher, language or publication information.
`,

    "Pet": `
Create listings for pet products.

Use only seller-provided:
Product type, material, size, quantity,
color, compatibility, usage and features.

Never invent pet suitability,
health benefits, safety claims
or compatibility.
`,

    "Sports": `
Create listings for sports and fitness products.

Use only seller-provided:
Product type, material, size, weight,
quantity, usage, included items
and features.

Never invent performance claims,
weight, included accessories
or specifications.
`,

    "Automotive": `
Create listings for automotive products.

Use only seller-provided:
Product type, vehicle compatibility,
material, size, color, model,
part number, quantity and features.

Never invent vehicle compatibility,
part number, installation requirements
or technical specifications.
`,

    "Garden": `
Create listings for gardening products.

Use only seller-provided:
Product type, material, size, quantity,
color, usage, compatibility and features.

Never invent capacity, durability,
chemical properties, plant suitability
or performance claims.
`,

    "Food": `
Create listings for food and grocery products.

Use only seller-provided:
Product type, quantity, flavor,
ingredients, packaging, variant,
brand, shelf life and features.

Never invent ingredients, nutrition,
health benefits, expiry date,
certifications or dietary claims.
`,

    "Gifts": `
Create listings for gifts and gift products.

Use only seller-provided:
Product type, material, color, size,
quantity, occasion, included items,
personalization details and features.

Never invent included items, material,
occasion, personalization or features.
`,

    "Other": `
Use only seller-provided information.

Never invent brand, material, size, color,
weight, dimensions, warranty, certification,
compatibility, quantity or features.
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

    return `
You are the official AI Product Listing Assistant
for AI Seller Toolkit.

Your highest priority is FACTUAL ACCURACY.

CATEGORY:
${category}

CATEGORY RULES:
${getCategoryRule(category)}

==================================================
ABSOLUTE FACTUAL RULES
==================================================

1. Use ONLY information supplied by the seller.

2. Never guess missing information.

3. Never use general product knowledge
to fill missing specifications.

4. Every factual specification supplied
by the seller must be preserved.

5. Do not change seller-provided values.

6. Do not create a specification that
the seller did not provide.

7. Do not create fake:
- Brand
- Model
- Material
- Fabric
- Color
- Size
- Weight
- Dimensions
- Capacity
- Battery
- RAM
- Storage
- Processor
- Warranty
- Certification
- Ingredients
- Quantity
- Compatibility
- Features
- Age range
- Shelf life
- Included items

8. Never make medical claims.

9. Never promise results.

10. Never add unsupported marketing claims.

Do NOT add:
Best
No.1
Premium
Guaranteed
Top Quality
100% Original

unless the seller explicitly supplied that wording.

11. Do not assume a product is:
- waterproof
- durable
- lightweight
- comfortable
- safe
- premium
- eco-friendly
- BPA-free
- non-toxic
- certified
- original

unless seller provided it.

12. Product name may contain seller-provided
facts. Preserve those facts.

13. Price may only be used if supplied.

14. Quantity must remain exactly as supplied.

15. If a field is missing, leave it out.
Do NOT replace it with an invented value.

16. Keywords and SEO text must also remain factual.

17. Hashtags must be based only on seller-provided
product information.

==================================================
OUTPUT
==================================================

Return ONLY JSON.

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
// RETRYABLE ERROR
// ==========================================================

function isRetryableError(error) {

    const status =
        Number(
            error?.status ||
            error?.code ||
            error?.response?.status ||
            0
        );

    const message =
        String(
            error?.message || ""
        ).toLowerCase();

    return (

        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||

        message.includes("429") ||
        message.includes("500") ||
        message.includes("502") ||
        message.includes("503") ||
        message.includes("504") ||

        message.includes("unavailable") ||
        message.includes("overloaded") ||
        message.includes("high demand") ||
        message.includes("temporarily") ||
        message.includes("rate limit") ||
        message.includes("quota")
    );
}

// ==========================================================
// SLEEP
// ==========================================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(resolve, ms)
    );
}

// ==========================================================
// RESPONSE SCHEMA
// ==========================================================

const listingSchema = {

    type: "object",

    properties: {

        title: {
            type: "string"
        },

        description: {
            type: "string"
        },

        highlights: {
            type: "array",
            items: {
                type: "string"
            }
        },

        keywords: {
            type: "array",
            items: {
                type: "string"
            }
        },

        hashtags: {
            type: "array",
            items: {
                type: "string"
            }
        },

        seoTitle: {
            type: "string"
        },

        seoDescription: {
            type: "string"
        }
    },

    required: [
        "title",
        "description",
        "highlights",
        "keywords",
        "hashtags",
        "seoTitle",
        "seoDescription"
    ]
};

// ==========================================================
// GEMINI REQUEST
// ==========================================================

async function callGemini(
    model,
    userPrompt,
    systemPrompt
) {

    if (!ai) {

        throw new Error(
            "Gemini API key is not configured."
        );
    }

    console.log(
        `🧠 Gemini model: ${model}`
    );

    const response =
        await ai.models.generateContent({

            model,

            contents:
                userPrompt,

            config: {

                systemInstruction:
                    systemPrompt,

                responseMimeType:
                    "application/json",

                responseSchema:
                    listingSchema,

                temperature:
                    0.2,

                maxOutputTokens:
                    2500
            }
        });

    return response;
}

// ==========================================================
// SMART RETRY
// ==========================================================

async function generateWithRetry(
    userPrompt,
    systemPrompt
) {

    let lastError = null;

    const delays = [
        2500,
        5000
    ];

    for (
        let attempt = 1;
        attempt <= 3;
        attempt++
    ) {

        try {

            console.log(
                `🤖 Primary attempt ${attempt}/3`
            );

            return await callGemini(
                MODEL,
                userPrompt,
                systemPrompt
            );

        }
        catch (error) {

            lastError =
                error;

            console.error(
                `❌ Primary attempt ${attempt}:`,
                error?.message || error
            );

            if (
                !isRetryableError(error)
            ) {

                throw error;
            }

            if (
                attempt < 3
            ) {

                await sleep(
                    delays[attempt - 1]
                );
            }
        }
    }

    // ======================================================
    // FALLBACK
    // ======================================================

    try {

        console.log(
            `🔄 Using fallback model: ${FALLBACK_MODEL}`
        );

        return await callGemini(
            FALLBACK_MODEL,
            userPrompt,
            systemPrompt
        );

    }
    catch (fallbackError) {

        console.error(
            "❌ Fallback failed:",
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

    if (!response) {
        return "";
    }

    if (
        typeof response.text === "string"
    ) {

        return response.text.trim();

    }

    if (
        typeof response.text === "function"
    ) {

        return String(
            response.text()
        ).trim();

    }

    return "";
}

// ==========================================================
// PARSE JSON
// ==========================================================

function parseListingJSON(text) {

    if (!text) {

        throw new Error(
            "AI returned an empty response."
        );
    }

    try {

        return JSON.parse(text);

    }
    catch {

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

            return JSON.parse(
                cleaned
            );

        }
        catch {

            throw new Error(
                "AI returned invalid JSON."
            );
        }
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
                    .map(cleanText)
                    .filter(Boolean)
                : [],

        keywords:
            Array.isArray(
                listing.keywords
            )
                ? listing.keywords
                    .map(cleanText)
                    .filter(Boolean)
                : [],

        hashtags:
            Array.isArray(
                listing.hashtags
            )
                ? listing.hashtags
                    .map(cleanText)
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
// SELLER FACT PRESERVATION
// ==========================================================

function preserveSellerFacts(
    listing,
    sellerFacts
) {

    const searchableText =
        [
            listing.title,
            listing.description,
            ...listing.highlights,
            ...listing.keywords,
            ...listing.hashtags,
            listing.seoTitle,
            listing.seoDescription
        ]
            .join(" ")
            .toLowerCase();

    const facts =
        sellerFacts
            .map(cleanText)
            .filter(Boolean);

    for (
        const fact of facts
    ) {

        const lowerFact =
            fact.toLowerCase();

        if (
            !searchableText.includes(
                lowerFact
            )
        ) {

            listing.highlights.push(
                fact
            );

            listing.keywords.push(
                fact
            );
        }
    }

    return listing;
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
// HEALTH
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success:
                true,

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
// STATUS
// ==========================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success:
                true,

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
// CATEGORIES
// ==========================================================

app.get(
    "/api/categories",
    (req, res) => {

        res.json({

            success:
                true,

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
        // API CHECK
        // ==================================================

        if (!ai) {

            return res.status(500).json({

                success:
                    false,

                error:
                    "Gemini API key is not configured.",

                version:
                    VERSION
            });
        }

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

                success:
                    false,

                error:
                    "Product category is required.",

                version:
                    VERSION
            });
        }

        if (!productName) {

            return res.status(400).json({

                success:
                    false,

                error:
                    "Product name is required.",

                version:
                    VERSION
            });
        }

        // ==================================================
        // COMMON FIELDS
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
        // CATEGORY DATA
        // ==================================================

        const categoryData =
            body.categoryData &&
            typeof body.categoryData === "object"
                ? body.categoryData
                : {};

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
        // SELLER FACTS
        // ==================================================

        const sellerFacts = [];

        [
            productName,
            brand,
            price,
            color,
            size,
            material,
            productDetails,
            productFeatures,
            extraInfo,
            imageDescription
        ]
            .forEach(
                value => {

                    if (value) {

                        sellerFacts.push(
                            value
                        );
                    }
                }
            );

        Object.entries(
            categoryData
        )
            .forEach(
                ([key, value]) => {

                    const cleanValue =
                        cleanText(value);

                    if (
                        cleanValue
                    ) {

                        sellerFacts.push(
                            cleanValue
                        );
                    }
                }
            );

        // ==================================================
        // USER PROMPT
        // ==================================================

        const userPrompt = `
Create a marketplace product listing.

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

==================================================
FINAL INSTRUCTIONS
==================================================

Use ONLY the information above.

Preserve every factual specification
provided by the seller.

Do not invent missing information.

Do not add unsupported features.

Do not make assumptions.

Do not create fake specifications.

Do not create fake marketing claims.

The title, description, highlights,
keywords, hashtags and SEO fields
must all remain factually supported
by the seller information.

Return JSON only.
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
        // TEXT
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

        let listing =
            normalizeListing(
                rawListing
            );

        // ==================================================
        // PRESERVE SELLER FACTS
        // ==================================================

        listing =
            preserveSellerFacts(
                listing,
                sellerFacts
            );

        // ==================================================
        // RESPONSE
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
                error?.response?.status ||
                0
            );

        const message =
            String(
                error?.message ||
                ""
            );

        const lowerMessage =
            message.toLowerCase();

        // ==================================================
        // 429
        // ==================================================

        if (
            status === 429 ||
            lowerMessage.includes("quota") ||
            lowerMessage.includes("rate limit")
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
        // 503
        // ==================================================

        if (
            status === 503 ||
            lowerMessage.includes("503") ||
            lowerMessage.includes("unavailable") ||
            lowerMessage.includes("overloaded")
        ) {

            return res.status(503).json({

                success:
                    false,

                error:
                    "Gemini is temporarily busy. Please try again shortly.",

                retryable:
                    true,

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
                "Unable to generate listing.",

            retryable:
                false,

            version:
                VERSION
        });
    }
}

// ==========================================================
// ROUTE
// ==========================================================

app.post(
    "/api/generate-listing",
    handleGenerateListing
);

// ==========================================================
// 404
// ==========================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success:
                false,

            error:
                "API endpoint not found.",

            path:
                req.originalUrl,

            version:
                VERSION
        });
    }
);

// ==========================================================
// GLOBAL ERROR
// ==========================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "❌ Server Error:",
            error
        );

        res.status(500).json({

            success:
                false,

            error:
                "Internal server error.",

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
    () => {

        console.log(
            "=================================================="
        );

        console.log(
            "🚀 AI SELLER TOOLKIT BACKEND"
        );

        console.log(
            `📦 Version: ${VERSION}`
        );

        console.log(
            `🌐 Port: ${PORT}`
        );

        console.log(
            `🧠 Primary Model: ${MODEL}`
        );

        console.log(
            `🔄 Fallback Model: ${FALLBACK_MODEL}`
        );

        console.log(
            `🔑 Gemini API: ${
                GEMINI_API_KEY
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            }`
        );

        console.log(
            "=================================================="
        );
    }
);
