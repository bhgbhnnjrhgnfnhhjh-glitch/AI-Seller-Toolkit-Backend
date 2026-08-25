// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 6.0
// Category-Aware + Strict Factual AI
// Auto Retry + Fallback Model
// Output Validation + Hashtag Cleaner
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

    // ======================================================
    // FASHION
    // ======================================================

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
- Product features

Never invent:
fabric, color, size, brand, material, gender,
occasion, comfort, quality, certification,
fit, style or features.
`,



    // ======================================================
    // BEAUTY
    // ======================================================

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



    // ======================================================
    // ELECTRONICS
    // ======================================================

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
model number, compatibility
or technical specifications.
`,



    // ======================================================
    // HOME & KITCHEN
    // ======================================================

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
- Brand

Never invent:
capacity, dimensions, material,
leak-proof claims, BPA-free claims,
heat resistance, durability
or other features.
`,



    // ======================================================
    // SHOES
    // ======================================================

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
comfort claims, durability claims,
fit or specifications.
`,



    // ======================================================
    // JEWELLERY
    // ======================================================

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
purity or precious metal
unless seller provided it.
`,



    // ======================================================
    // TOYS
    // ======================================================

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



    // ======================================================
    // BOOKS
    // ======================================================

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
- Features

Never invent:
author, pages, edition, publisher,
language or publication information.
`,



    // ======================================================
    // PET
    // ======================================================

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
- Brand

Never invent:
pet suitability, health benefits,
safety claims or compatibility.
`,



    // ======================================================
    // SPORTS
    // ======================================================

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
- Brand

Never invent:
performance claims, weight,
included accessories or specifications.
`,



    // ======================================================
    // AUTOMOTIVE
    // ======================================================

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
- Brand

Never invent:
vehicle compatibility,
part number, installation requirements
or technical specifications.
`,



    // ======================================================
    // GARDEN
    // ======================================================

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
- Brand

Never invent:
capacity, durability, chemical properties,
plant suitability or performance claims.
`,



    // ======================================================
    // FOOD
    // ======================================================

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
- Features

Never invent:
ingredients, nutrition,
health benefits, expiry date,
certifications or dietary claims.
`,



    // ======================================================
    // GIFTS
    // ======================================================

    "Gifts": `
Create listings for gifts and gift products.

Use only seller-provided:
- Product type
- Material
- Color
- Size
- Design
- Quantity
- Occasion
- Recipient
- Packaging
- Included items
- Features
- Brand

Never invent:
included items, material,
occasion, personalization,
recipient, packaging
or features.
`,



    // ======================================================
    // OTHER
    // ======================================================

    "Other": `
Use only seller-provided information.

Never invent:
brand, material, size, color,
warranty, certification,
quantity, compatibility,
features or specifications.
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

        "fashion and clothing":
            "Fashion",

        "clothing":
            "Fashion",


        "beauty":
            "Beauty",

        "beauty & personal care":
            "Beauty",


        "electronics":
            "Electronics",

        "electronic":
            "Electronics",


        "home & kitchen":
            "Home & Kitchen",

        "home and kitchen":
            "Home & Kitchen",

        "home kitchen":
            "Home & Kitchen",


        "shoes":
            "Shoes",

        "shoe":
            "Shoes",

        "footwear":
            "Shoes",


        "jewellery":
            "Jewellery",

        "jewelry":
            "Jewellery",

        "jewellery & accessories":
            "Jewellery",


        "toys":
            "Toys",

        "toys & kids":
            "Toys",

        "toys and kids":
            "Toys",


        "books":
            "Books",

        "books & stationery":
            "Books",

        "books and stationery":
            "Books",


        "pet":
            "Pet",

        "pets":
            "Pet",

        "pet supplies":
            "Pet",


        "sports":
            "Sports",

        "sports & fitness":
            "Sports",

        "sports and fitness":
            "Sports",


        "automotive":
            "Automotive",

        "auto":
            "Automotive",

        "car accessories":
            "Automotive",


        "garden":
            "Garden",

        "gardening":
            "Garden",


        "food":
            "Food",

        "grocery":
            "Food",

        "grocery & food":
            "Food",

        "grocery and food":
            "Food",


        "gifts":
            "Gifts",

        "gift":
            "Gifts",


        "other":
            "Other"
    };

    return map[text] || "";
}


// ==========================================================
// TEXT CLEANER
// ==========================================================

function cleanText(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .replace(/\r/g, "")
        .trim();
}


// ==========================================================
// ARRAY CLEANER
// ==========================================================

function cleanArray(value) {

    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map(item => cleanText(item))
        .filter(Boolean);
}


// ==========================================================
// CATEGORY RULE
// ==========================================================

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

Your highest priority is factual accuracy.

==================================================
STRICT FACTUAL RULES
==================================================

1. USE ONLY information explicitly provided
by the seller.

2. NEVER invent missing product information.

3. Preserve seller-provided factual information.

4. Do not silently remove seller-provided
category details.

5. If a field is empty or not provided,
DO NOT mention it.

6. Never create fake:
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
- Storage
- RAM
- Processor
- Warranty
- Certification
- Ingredients
- Quantity
- Compatibility
- Features
- Occasion
- Recipient
- Packaging

7. Never convert assumptions into facts.

8. Never use general product knowledge
to fill missing specifications.

9. Never make medical claims.

10. Never promise results.

11. Never claim:
- Best
- No.1
- Premium
- Guaranteed
- 100% original
- Top quality

unless the seller explicitly provided
that exact claim.

12. Price may be mentioned only when
seller provided the price.

13. Quantity must be preserved exactly
as seller provided it.

14. Do not change numbers,
measurements or specifications.

15. Do not create a specification merely
because it is common for that product.

16. Product name itself is seller-provided
information and may be used.

17. Brand is factual only when seller provided it.

18. Category is only for organizing the listing.
Do not invent category-specific specifications.

==================================================
CATEGORY
==================================================

${category}

==================================================
CATEGORY-SPECIFIC RULES
==================================================

${rule}

==================================================
OUTPUT RULES
==================================================

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

IMPORTANT:

- highlights must contain only seller-supported facts.
- keywords must be relevant to the provided product information.
- hashtags must contain only clean English/ASCII hashtag text.
- Do not put foreign/random words into hashtags.
- Every hashtag must start with #.
- Do not use emojis inside hashtags.
- Do not use spaces inside a hashtag.
- Do not invent product specifications in keywords.
- Do not invent product specifications in SEO fields.
- Do not mention empty fields.

Return JSON only.
No Markdown.
No explanation outside JSON.
`;
}


// ==========================================================
// RETRYABLE ERROR CHECK
// ==========================================================

function isRetryableError(error) {

    const status =
        error?.status ||
        error?.code ||
        error?.response?.status;

    const message =
        String(
            error?.message || ""
        ).toLowerCase();

    return (

        Number(status) === 408 ||

        Number(status) === 429 ||

        Number(status) === 500 ||

        Number(status) === 502 ||

        Number(status) === 503 ||

        Number(status) === 504 ||

        message.includes("429") ||

        message.includes("500") ||

        message.includes("502") ||

        message.includes("503") ||

        message.includes("504") ||

        message.includes("unavailable") ||

        message.includes("high demand") ||

        message.includes("temporarily") ||

        message.includes("rate limit") ||

        message.includes("timeout") ||

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
// GEMINI RESPONSE TEXT
// ==========================================================

function getResponseText(response) {

    if (!response) {
        return "";
    }


    if (
        typeof response.text === "string"
    ) {

        return cleanText(
            response.text
        );
    }


    if (
        typeof response.text === "function"
    ) {

        try {

            return cleanText(
                response.text()
            );

        }
        catch {

            return "";
        }
    }


    return "";
}


// ==========================================================
// GENERATE USING ONE MODEL
// ==========================================================

async function generateUsingModel(
    model,
    userPrompt,
    systemPrompt
) {

    const MAX_ATTEMPTS = 4;

    const delays = [
        4000,
        8000,
        16000
    ];

    let lastError = null;


    for (
        let attempt = 1;
        attempt <= MAX_ATTEMPTS;
        attempt++
    ) {

        try {

            console.log(
                `🤖 ${model} attempt ${attempt}/${MAX_ATTEMPTS}`
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

                    contents:
                        userPrompt
                });


            const text =
                getResponseText(
                    response
                );


            if (!text) {

                throw new Error(
                    "AI returned an empty response."
                );
            }


            return response;

        }
        catch (error) {

            lastError = error;


            console.error(
                `❌ ${model} attempt ${attempt} failed:`,
                error?.message || error
            );


            if (
                !isRetryableError(error) ||
                attempt === MAX_ATTEMPTS
            ) {

                throw error;
            }


            const delay =
                delays[attempt - 1];


            console.log(
                `⏳ Retrying ${model} in ${delay / 1000} seconds...`
            );


            await sleep(delay);
        }
    }


    throw lastError;
}


// ==========================================================
// PRIMARY + FALLBACK GENERATION
// ==========================================================

async function generateWithRetry(
    userPrompt,
    systemPrompt
) {

    try {

        console.log(
            `🚀 Primary Gemini model: ${MODEL}`
        );


        return await generateUsingModel(
            MODEL,
            userPrompt,
            systemPrompt
        );

    }
    catch (primaryError) {

        console.error(
            "❌ Primary model failed."
        );


        if (
            !FALLBACK_MODEL ||
            FALLBACK_MODEL === MODEL
        ) {

            throw primaryError;
        }


        console.log(
            `🔄 Switching to fallback model: ${FALLBACK_MODEL}`
        );


        try {

            return await generateUsingModel(
                FALLBACK_MODEL,
                userPrompt,
                systemPrompt
            );

        }
        catch (fallbackError) {

            console.error(
                "❌ Fallback model also failed:",
                fallbackError?.message ||
                fallbackError
            );


            throw fallbackError;
        }
    }
}


// ==========================================================
// JSON EXTRACTION
// ==========================================================

function parseAIJson(text) {

    let cleaned =
        cleanText(text);


    if (!cleaned) {
        throw new Error(
            "AI returned empty JSON."
        );
    }


    // Remove markdown fences
    cleaned =
        cleaned
            .replace(
                /^```json\s*/i,
                ""
            )
            .replace(
                /^```\s*/i,
                ""
            )
            .replace(
                /\s*```$/i,
                ""
            )
            .trim();


    // First attempt
    try {

        return JSON.parse(
            cleaned
        );

    }
    catch {
        // Continue
    }


    // Try extracting first JSON object
    const firstBrace =
        cleaned.indexOf("{");

    const lastBrace =
        cleaned.lastIndexOf("}");


    if (
        firstBrace !== -1 &&
        lastBrace !== -1 &&
        lastBrace > firstBrace
    ) {

        const possibleJson =
            cleaned.slice(
                firstBrace,
                lastBrace + 1
            );


        try {

            return JSON.parse(
                possibleJson
            );

        }
        catch {
            // Continue
        }
    }


    throw new Error(
        "AI returned invalid JSON."
    );
}


// ==========================================================
// SAFE HASHTAG CLEANER
// ==========================================================

function cleanHashtag(value) {

    let text =
        cleanText(value);


    if (!text) {
        return "";
    }


    // Remove leading #
    text =
        text.replace(
            /^#+/,
            ""
        );


    // Remove spaces
    text =
        text.replace(
            /\s+/g,
            ""
        );


    // Keep only ASCII letters and numbers
    text =
        text.replace(
            /[^A-Za-z0-9]/g,
            ""
        );


    if (!text) {
        return "";
    }


    return `#${text}`;
}


// ==========================================================
// NORMALIZE HASHTAGS
// ==========================================================

function normalizeHashtags(
    hashtags,
    listing
) {

    const source =
        Array.isArray(hashtags)
            ? hashtags
            : [];


    const result = [];

    const seen = new Set();


    for (const item of source) {

        const hashtag =
            cleanHashtag(item);


        if (!hashtag) {
            continue;
        }


        const key =
            hashtag.toLowerCase();


        if (seen.has(key)) {
            continue;
        }


        seen.add(key);

        result.push(hashtag);
    }


    // Limit excessive hashtags
    return result.slice(0, 15);
}


// ==========================================================
// KEYWORD CLEANER
// ==========================================================

function cleanKeyword(value) {

    const text =
        cleanText(value);


    if (!text) {
        return "";
    }


    // Remove accidental hashtag
    return text
        .replace(
            /^#+/,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


// ==========================================================
// NORMALIZE KEYWORDS
// ==========================================================

function normalizeKeywords(
    keywords
) {

    const source =
        Array.isArray(keywords)
            ? keywords
            : [];


    const result = [];

    const seen = new Set();


    for (const item of source) {

        const keyword =
            cleanKeyword(item);


        if (!keyword) {
            continue;
        }


        const key =
            keyword.toLowerCase();


        if (seen.has(key)) {
            continue;
        }


        seen.add(key);

        result.push(keyword);
    }


    return result.slice(0, 20);
}


// ==========================================================
// NORMALIZE LISTING
// ==========================================================

function normalizeListing(
    listing
) {

    if (
        !listing ||
        typeof listing !== "object"
    ) {

        throw new Error(
            "AI returned an invalid listing object."
        );
    }


    const normalized = {

        title:
            cleanText(
                listing.title
            ),

        description:
            cleanText(
                listing.description
            ),

        highlights:
            cleanArray(
                listing.highlights
            ),

        keywords:
            normalizeKeywords(
                listing.keywords
            ),

        hashtags:
            normalizeHashtags(
                listing.hashtags,
                listing
            ),

        seoTitle:
            cleanText(
                listing.seoTitle
            ),

        seoDescription:
            cleanText(
                listing.seoDescription
            )
    };


    return normalized;
}


// ==========================================================
// VALIDATE LISTING
// ==========================================================

function validateListing(
    listing
) {

    if (!listing.title) {

        throw new Error(
            "AI listing title is empty."
        );
    }


    if (!listing.description) {

        throw new Error(
            "AI listing description is empty."
        );
    }


    if (!Array.isArray(
        listing.highlights
    )) {

        throw new Error(
            "Invalid highlights."
        );
    }


    if (!Array.isArray(
        listing.keywords
    )) {

        throw new Error(
            "Invalid keywords."
        );
    }


    if (!Array.isArray(
        listing.hashtags
    )) {

        throw new Error(
            "Invalid hashtags."
        );
    }


    if (
        typeof listing.seoTitle !==
        "string"
    ) {

        throw new Error(
            "Invalid SEO title."
        );
    }


    if (
        typeof listing.seoDescription !==
        "string"
    ) {

        throw new Error(
            "Invalid SEO description."
        );
    }


    return true;
}


// ==========================================================
// FORMAT LISTING FOR OLD FRONTEND
// ==========================================================

function formatListing(
    listing
) {

    return `
TITLE

${listing.title}


DESCRIPTION

${listing.description}


HIGHLIGHTS

${listing.highlights
    .map(
        item => `• ${item}`
    )
    .join("\n")}


KEYWORDS

${listing.keywords.join(
    ", "
)}


HASHTAGS

${listing.hashtags.join(
    " "
)}


SEO TITLE

${listing.seoTitle}


SEO DESCRIPTION

${listing.seoDescription}
`.trim();
}


// ==========================================================
// CATEGORY DATA FORMATTER
// ==========================================================

function buildCategoryFieldsText(
    categoryData
) {

    if (
        !categoryData ||
        typeof categoryData !== "object" ||
        Array.isArray(categoryData)
    ) {

        return "";
    }


    const lines = [];


    for (
        const [key, value]
        of Object.entries(categoryData)
    ) {

        const cleaned =
            cleanText(value);


        if (!cleaned) {
            continue;
        }


        lines.push(
            `${key}: ${cleaned}`
        );
    }


    return lines.join("\n");
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

            geminiConfigured:
                !!GEMINI_API_KEY,

            model:
                MODEL,

            fallbackModel:
                FALLBACK_MODEL
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
        // CHECK GEMINI
        // ==================================================

        if (!ai) {

            return res.status(500).json({

                success: false,

                error:
                    "Gemini API key is not configured."
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


        // ==================================================
        // VALIDATE CATEGORY
        // ==================================================

        if (!category) {

            return res.status(400).json({

                success: false,

                error:
                    "Product category is required."
            });
        }


        // ==================================================
        // VALIDATE PRODUCT NAME
        // ==================================================

        if (!productName) {

            return res.status(400).json({

                success: false,

                error:
                    "Product name is required."
            });
        }


        // ==================================================
        // GENERAL FIELDS
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


        const productFeatures =
            cleanText(
                body.productFeatures
            );


        const extraInfo =
            cleanText(
                body.extraInfo
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
            typeof body.categoryData === "object" &&
            !Array.isArray(
                body.categoryData
            )
                ? body.categoryData
                : {};


        const categoryFieldsText =
            buildCategoryFieldsText(
                categoryData
            );


        // ==================================================
        // USER PROMPT
        // ==================================================

        const userPrompt = `
Create a marketplace product listing.

==================================================
IMPORTANT
==================================================

Use ONLY seller-provided information.

Do NOT guess.

Do NOT invent specifications.

Do NOT add unsupported claims.

Do NOT use general knowledge to fill
missing information.

==================================================
CATEGORY
==================================================

${category}

==================================================
PRODUCT NAME
==================================================

${productName}

==================================================
BRAND
==================================================

${brand || "Not provided"}

==================================================
PRICE
==================================================

${price || "Not provided"}

==================================================
GENERAL PRODUCT DETAILS
==================================================

${productDetails || "Not provided"}

==================================================
CATEGORY DETAILS
==================================================

${categoryFieldsText || "Not provided"}

==================================================
PRODUCT FEATURES
==================================================

${productFeatures || "Not provided"}

==================================================
EXTRA PRODUCT INFORMATION
==================================================

${extraInfo || "Not provided"}

==================================================
COLOR
==================================================

${color || "Not provided"}

==================================================
SIZE
==================================================

${size || "Not provided"}

==================================================
MATERIAL
==================================================

${material || "Not provided"}

==================================================
IMAGE DESCRIPTION
==================================================

${imageDescription || "Not provided"}

==================================================
FINAL INSTRUCTIONS
==================================================

Every factual specification that the seller
actually provided should be considered for
inclusion in the listing.

Do NOT invent anything the seller did not provide.

If a field says "Not provided", do not mention it.

Keep quantities, measurements, colors,
materials and prices exactly as provided.

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


        if (!resultText) {

            return res.status(500).json({

                success: false,

                error:
                    "AI returned an empty response."
            });
        }


        // ==================================================
        // PARSE JSON
        // ==================================================

        let listing;


        try {

            listing =
                parseAIJson(
                    resultText
                );

        }
        catch (error) {

            console.error(
                "❌ JSON parsing failed:",
                error?.message || error
            );


            return res.status(500).json({

                success: false,

                error:
                    "AI returned invalid JSON."
            });
        }


        // ==================================================
        // NORMALIZE
        // ==================================================

        try {

            listing =
                normalizeListing(
                    listing
                );

        }
        catch (error) {

            console.error(
                "❌ Listing normalization failed:",
                error?.message || error
            );


            return res.status(500).json({

                success: false,

                error:
                    "AI returned an invalid listing."
            });
        }


        // ==================================================
        // VALIDATE
        // ==================================================

        try {

            validateListing(
                listing
            );

        }
        catch (error) {

            console.error(
                "❌ Listing validation failed:",
                error?.message || error
            );


            return res.status(500).json({

                success: false,

                error:
                    error?.message ||
                    "Generated listing validation failed."
            });
        }


        // ==================================================
        // FORMATTED LISTING
        // ==================================================

        const formattedListing =
            formatListing(
                listing
            );


        // ==================================================
        // FINAL RESPONSE
        // ==================================================

        return res.json({

            success: true,

            version:
                VERSION,

            category:
                category,

            model:
                MODEL,

            listing:
                listing,

            formatted:
                formattedListing,

            data:
                listing
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
                error?.response?.status
            );


        // ==================================================
        // GEMINI RATE LIMIT
        // ==================================================

        if (status === 429) {

            return res.status(429).json({

                success: false,

                error:
                    "AI service rate limit reached. Please try again shortly."
            });
        }


        // ==================================================
        // GEMINI TEMPORARY ERROR
        // ==================================================

        if (
            status === 503 ||
            status === 502 ||
            status === 504
        ) {

            return res.status(503).json({

                success: false,

                error:
                    "AI service is temporarily unavailable. Please try again."
            });
        }


        // ==================================================
        // GENERIC ERROR
        // ==================================================

        return res.status(500).json({

            success: false,

            error:
                "Unable to generate listing. Please try again."
        });
    }
}


// ==========================================================
// PRIMARY GENERATE ENDPOINT
// ==========================================================

app.post(
    "/api/generate-listing",
    handleGenerateListing
);


// ==========================================================
// COMPATIBILITY ENDPOINT
// Some older frontends may use this URL.
// ==========================================================

app.post(
    "/api/generateListing",
    handleGenerateListing
);


// ==========================================================
// OPTIONS
// ==========================================================

app.options(
    "*",
    cors()
);


// ==========================================================
// 404 HANDLER
// ==========================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            error:
                "API endpoint not found.",

            path:
                req.originalUrl
        });
    }
);


// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "❌ Server Error:",
            error
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );
        }


        res.status(500).json({

            success: false,

            error:
                "Internal server error"
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
            "=================================================="
        );

        console.log(
            "🤖 AI SELLER TOOLKIT BACKEND"
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
            "=================================================="
        );
    }
);
