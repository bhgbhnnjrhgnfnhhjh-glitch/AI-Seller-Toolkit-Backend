// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 14.2
// ==========================================================
//
// Category-Aware
// Strict Factual AI
// Gemini Interactions API
// SEO Generator Fixed
//
// MODEL:
// gemini-3.6-flash
//
// IMPORTANT:
// Existing endpoints are preserved.
//
// ENDPOINTS:
// GET  /
// GET  /api/status
// GET  /api/categories
//
// POST /api/generate-title
// POST /api/generate-description
// POST /api/generate-listing
// POST /api/generate-seo
//
// ==========================================================


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");


// ==========================================================
// APP
// ==========================================================

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Accept"
        ]
    })
);

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);


// ==========================================================
// CONFIG
// ==========================================================

const PORT =
    process.env.PORT || 10000;

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY || "";

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";

const VERSION =
    "14.2";


// ==========================================================
// GEMINI CLIENT
// ==========================================================

let ai = null;

if (GEMINI_API_KEY) {

    try {

        ai = new GoogleGenAI({
            apiKey: GEMINI_API_KEY,

            httpOptions: {
                apiVersion: "v1"
            }

        });

        console.log(
            "✅ Gemini AI configured"
        );

    }
    catch (error) {

        console.error(
            "❌ Gemini initialization failed:",
            error.message
        );

    }

}
else {

    console.warn(
        "⚠️ GEMINI_API_KEY is missing."
    );

}


// ==========================================================
// CATEGORY LIST
// ==========================================================

const CATEGORIES = [

    "Fashion",
    "Beauty",
    "Electronics",
    "Home & Kitchen",
    "Shoes",
    "Jewellery",
    "Toys",
    "Books",
    "Pet",
    "Sports",
    "Automotive",
    "Garden",
    "Food",
    "Gifts"

];


// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(category) {

    if (!category) {

        return "";

    }

    let value =
        String(category)
            .trim();

    value =
        value
            .replace(
                /^[^\w&]+\s*/u,
                ""
            )
            .trim();

    const lower =
        value.toLowerCase();

    const aliases = {

        "fashion & clothing":
            "Fashion",

        "fashion and clothing":
            "Fashion",

        "clothing":
            "Fashion",

        "apparel":
            "Fashion",

        "beauty & personal care":
            "Beauty",

        "personal care":
            "Beauty",

        "electronics":
            "Electronics",

        "home":
            "Home & Kitchen",

        "home and kitchen":
            "Home & Kitchen",

        "home kitchen":
            "Home & Kitchen",

        "jewelry":
            "Jewellery",

        "jewellery":
            "Jewellery",

        "pets":
            "Pet",

        "pet supplies":
            "Pet",

        "automobile":
            "Automotive",

        "car":
            "Automotive"

    };

    if (
        aliases[lower]
    ) {

        return aliases[lower];

    }

    const exact =
        CATEGORIES.find(
            item =>
                item.toLowerCase() ===
                lower
        );

    return exact || value;

}


// ==========================================================
// CLEAN TEXT
// ==========================================================

function cleanText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(/\s+/g, " ")
        .trim();

}


// ==========================================================
// NORMALIZE KEYWORD
// ==========================================================

function normalizeKeyword(value) {

    return cleanText(value)
        .toLowerCase()
        .replace(
            /['’]/g,
            ""
        )
        .replace(
            /[-_/]/g,
            " "
        )
        .replace(
            /[^a-z0-9\s]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


// ==========================================================
// TOKEN SET
// ==========================================================

function tokenSet(value) {

    const normalized =
        normalizeKeyword(value);

    if (!normalized) {

        return new Set();

    }

    return new Set(
        normalized
            .split(" ")
            .filter(
                token =>
                    token.length > 1
            )
    );

}


// ==========================================================
// SIMILARITY
// ==========================================================

function keywordSimilarity(a, b) {

    const A =
        tokenSet(a);

    const B =
        tokenSet(b);

    if (
        !A.size ||
        !B.size
    ) {

        return 0;

    }

    let intersection = 0;

    A.forEach(
        token => {

            if (B.has(token)) {

                intersection++;

            }

        }
    );

    const union =
        new Set([
            ...A,
            ...B
        ]).size;

    return union
        ? intersection / union
        : 0;

}


// ==========================================================
// PRODUCT FRAGMENT PROTECTION
// ==========================================================

function isProductFragment(
    keyword,
    product
) {

    const K =
        tokenSet(keyword);

    const P =
        tokenSet(product);

    if (
        !K.size ||
        !P.size
    ) {

        return false;

    }

    const keywordNormalized =
        normalizeKeyword(keyword);

    const productNormalized =
        normalizeKeyword(product);

    if (
        keywordNormalized ===
        productNormalized
    ) {

        return false;

    }

    // Example:
    //
    // Product:
    // Cotton Kurti
    //
    // Bad:
    // Kurti
    //
    // Bad:
    // Cotton

    if (
        K.size === 1 &&
        P.size > 1
    ) {

        for (
            const token of K
        ) {

            if (
                P.has(token)
            ) {

                return true;

            }

        }

    }

    return false;

}


// ==========================================================
// BRAND CLEANING
// ==========================================================

function getEffectiveBrand(
    brand,
    product
) {

    const B =
        normalizeKeyword(
            brand
        );

    const P =
        normalizeKeyword(
            product
        );

    if (!B) {

        return "";

    }

    if (
        P &&
        B.includes(P)
    ) {

        return B
            .replace(
                P,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }

    return B;

}


// ==========================================================
// BRAND STUFFING
// ==========================================================

function isBrandStuffed(
    keyword,
    brand,
    product
) {

    const effectiveBrand =
        getEffectiveBrand(
            brand,
            product
        );

    if (!effectiveBrand) {

        return false;

    }

    const K =
        tokenSet(keyword);

    const B =
        tokenSet(effectiveBrand);

    if (
        !K.size ||
        !B.size
    ) {

        return false;

    }

    let count = 0;

    B.forEach(
        token => {

            if (
                K.has(token)
            ) {

                count++;

            }

        }
    );

    return count === B.size;

}


// ==========================================================
// SAFE MAIN KEYWORD
// ==========================================================

function sanitizeMainKeyword(
    mainKeyword,
    product,
    brand
) {

    const productClean =
        cleanText(product);

    if (!productClean) {

        return "";

    }

    const mainClean =
        cleanText(mainKeyword);

    if (!mainClean) {

        return productClean;

    }

    const mainNormalized =
        normalizeKeyword(
            mainClean
        );

    const productNormalized =
        normalizeKeyword(
            productClean
        );

    if (
        mainNormalized ===
        productNormalized
    ) {

        return productClean;

    }

    const effectiveBrand =
        getEffectiveBrand(
            brand,
            productClean
        );

    const brandNormalized =
        normalizeKeyword(
            effectiveBrand
        );

    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }

    if (
        isProductFragment(
            mainClean,
            productClean
        )
    ) {

        return productClean;

    }

    return mainClean;

}


// ==========================================================
// CLEAN KEYWORD
// ==========================================================

function cleanKeyword(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)

        .trim()

        .replace(
            /^\s*\d+\s*[\.\)\-:]\s*/,
            ""
        )

        .replace(
            /^[-•*]\s*/,
            ""
        )

        .replace(
            /^["']|["']$/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// ==========================================================
// REMOVE DUPLICATES
// ==========================================================

function removeDuplicates(
    keywords
) {

    const output = [];

    const seen =
        new Set();

    for (
        const item of keywords
    ) {

        const keyword =
            cleanKeyword(item);

        if (!keyword) {

            continue;

        }

        const normalized =
            normalizeKeyword(keyword);

        if (!normalized) {

            continue;

        }

        if (
            seen.has(normalized)
        ) {

            continue;

        }

        seen.add(normalized);

        output.push(
            keyword
        );

    }

    return output;

}


// ==========================================================
// FILTER SEO KEYWORDS
// ==========================================================

function filterSEOKeywords(
    keywords,
    product,
    brand,
    mainKeyword
) {

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword,
            product,
            brand
        );

    const mainNormalized =
        normalizeKeyword(
            safeMain
        );

    const output = [];

    const cleaned =
        removeDuplicates(
            Array.isArray(keywords)
                ? keywords
                : []
        );

    for (
        const keyword of cleaned
    ) {

        const normalized =
            normalizeKeyword(
                keyword
            );

        const isMain =
            normalized ===
            mainNormalized;


        // Product fragment
        if (
            !isMain &&
            isProductFragment(
                keyword,
                product
            )
        ) {

            continue;

        }


        // Brand stuffing
        if (
            !isMain &&
            isBrandStuffed(
                keyword,
                brand,
                product
            )
        ) {

            continue;

        }


        // Near duplicate
        const nearDuplicate =
            output.some(
                existing =>
                    keywordSimilarity(
                        existing,
                        keyword
                    ) >= 0.85
            );

        if (
            nearDuplicate &&
            !isMain
        ) {

            continue;

        }

        output.push(
            keyword
        );

        if (
            output.length >= 20
        ) {

            break;

        }

    }


    // Main keyword first
    const mainIndex =
        output.findIndex(
            item =>
                normalizeKeyword(item) ===
                mainNormalized
        );

    if (
        mainIndex >= 0
    ) {

        const mainItem =
            output.splice(
                mainIndex,
                1
            )[0];

        output.unshift(
            mainItem
        );

    }
    else if (
        safeMain
    ) {

        output.unshift(
            safeMain
        );

    }

    return output.slice(
        0,
        20
    );

}


// ==========================================================
// SAFE SEO FALLBACK KEYWORD GENERATOR
// ==========================================================
//
// IMPORTANT:
// Gemini कभी केवल 1 keyword दे देता है.
//
// इस function का काम:
// AI के 1 keyword को देखकर
// seller द्वारा दी गई जानकारी से safe variations बनाना.
//
// कोई नया:
// - color
// - size
// - gender
// - feature
// - material
// - quality claim
// - discount
// - warranty
// नहीं बनाया जाएगा.
//
// ==========================================================

function buildSafeSEOKeywords(
    product,
    category,
    brand,
    marketplace,
    mainKeyword
) {

    const productClean =
        cleanText(product);

    const categoryClean =
        normalizeCategory(
            category
        );

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword ||
            productClean,
            productClean,
            brand
        );

    const candidates = [];


    // ======================================================
    // 1. MAIN PRODUCT
    // ======================================================

    if (safeMain) {

        candidates.push(
            safeMain
        );

    }


    // ======================================================
    // 2. PRODUCT NAME VARIATIONS
    // ======================================================

    if (productClean) {

        candidates.push(
            productClean
        );

        candidates.push(
            productClean
                .replace(
                    /-/g,
                    " "
                )
        );

        candidates.push(
            productClean
                .replace(
                    /\s+/g,
                    "-"
                )
        );

        candidates.push(
            productClean +
            " online"
        );

        candidates.push(
            productClean +
            " online shopping"
        );

        candidates.push(
            "buy " +
            productClean +
            " online"
        );

        candidates.push(
            productClean +
            " product"
        );

        candidates.push(
            productClean +
            " shopping"
        );

    }


    // ======================================================
    // 3. CATEGORY + PRODUCT
    // ======================================================

    if (
        categoryClean &&
        productClean
    ) {

        candidates.push(
            categoryClean +
            " " +
            productClean
        );

        candidates.push(
            productClean +
            " " +
            categoryClean
        );

    }


    // ======================================================
    // 4. BRAND ONLY WHEN BRAND IS INDEPENDENT
    // ======================================================

    const effectiveBrand =
        getEffectiveBrand(
            brand,
            productClean
        );

    if (
        effectiveBrand &&
        productClean
    ) {

        candidates.push(
            effectiveBrand +
            " " +
            productClean
        );

        candidates.push(
            productClean +
            " by " +
            effectiveBrand
        );

    }


    // ======================================================
    // 5. MARKETPLACE
    // ======================================================
    //
    // Marketplace keyword is added only as a generic
    // shopping phrase.
    //
    // Example:
    // Amazon + Cotton tshirt
    //
    // No unsupported product information is added.
    //
    // ======================================================

    const marketplaceClean =
        cleanText(
            marketplace
        );

    if (
        marketplaceClean &&
        productClean
    ) {

        candidates.push(
            productClean +
            " on " +
            marketplaceClean
        );

        candidates.push(
            marketplaceClean +
            " " +
            productClean
        );

    }


    // ======================================================
    // FINAL FILTER
    // ======================================================

    return filterSEOKeywords(
        candidates,
        productClean,
        brand,
        safeMain
    );

}


// ==========================================================
// PARSE JSON SAFELY
// ==========================================================

function parseAIJSON(
    text
) {

    if (!text) {

        return null;

    }

    let cleaned =
        String(text).trim();


    // Remove markdown code fences
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


    try {

        return JSON.parse(
            cleaned
        );

    }
    catch (error) {

        // Try extracting first JSON object
        const start =
            cleaned.indexOf("{");

        const end =
            cleaned.lastIndexOf("}");

        if (
            start >= 0 &&
            end > start
        ) {

            try {

                return JSON.parse(
                    cleaned.slice(
                        start,
                        end + 1
                    )
                );

            }
            catch (innerError) {

                return null;

            }

        }

        return null;

    }

}


// ==========================================================
// GET AI TEXT
// ==========================================================

async function runGemini(
    prompt,
    responseSchema = null
) {

    if (!ai) {

        throw new Error(
            "Gemini API is not configured. Please check GEMINI_API_KEY on Render."
        );

    }


    const request = {

        model:
            MODEL,

        input:
            prompt

    };


    if (responseSchema) {

        request.response_format = {

            type:
                "text",

            mime_type:
                "application/json",

            schema:
                responseSchema

        };

    }


    const interaction =
        await ai.interactions.create(
            request
        );


    const text =
        interaction &&
        typeof interaction.output_text ===
        "string"
            ? interaction.output_text
            : "";


    if (!text.trim()) {

        throw new Error(
            "Gemini ने empty response दिया।"
        );

    }

    return text.trim();

}


// ==========================================================
// SEO AI GENERATOR
// ==========================================================

async function generateSEOWithAI(
    data
) {

    const product =
        cleanText(
            data.productName
        );

    const category =
        normalizeCategory(
            data.category
        );

    const brand =
        cleanText(
            data.brand
        );

    const mainKeyword =
        sanitizeMainKeyword(
            data.mainKeyword ||
            product,
            product,
            brand
        );

    const marketplace =
        cleanText(
            data.marketplace
        );


    const prompt = `
You are the SEO keyword engine for AI Seller Toolkit.

TASK:
Generate 12 to 20 relevant SEO search keywords for the seller's product.

STRICT FACTUAL RULES:

1. Product Name is the primary product identity.
2. Main keyword must be the FIRST keyword.
3. Do NOT return only one keyword.
4. Return at least 12 different keywords whenever possible.
5. Maximum 20 keywords.
6. Every keyword must be related to the exact product.
7. Do not invent product facts.
8. Do not invent color.
9. Do not invent size.
10. Do not invent gender.
11. Do not invent material unless it is present in Product Name or seller information.
12. Do not invent features.
13. Do not invent certifications.
14. Do not invent warranty.
15. Do not invent discounts.
16. Do not invent quality claims.
17. Do not use fake specifications.
18. Avoid duplicate keywords.
19. Avoid near-duplicate keywords.
20. Do not use generic unrelated words.
21. Do not make keywords such as "best", "premium", "high quality", "top quality" unless explicitly supplied.
22. Do not stuff the brand.
23. If the brand already contains the product name, do not repeatedly repeat the brand.
24. Do not create keywords consisting only of a product fragment.
25. Natural shopping/search variations are allowed.
26. You may use words such as "online", "shopping", "buy online", and "product" as search-intent modifiers.
27. Do not add unsupported product attributes.
28. Do not include numbering in individual keyword strings.
29. Return JSON only.

SELLER DATA:

Product Name:
${product}

Category:
${category}

Brand:
${brand || "Not provided"}

Main Keyword:
${mainKeyword}

Target Marketplace:
${marketplace || "Not provided"}

Return exactly this JSON structure:

{
  "keywords": [
    "keyword 1",
    "keyword 2",
    "keyword 3"
  ]
}
`;


    const schema = {

        type:
            "object",

        properties: {

            keywords: {

                type:
                    "array",

                items: {

                    type:
                        "string"

                }

            }

        },

        required: [
            "keywords"
        ]

    };


    const text =
        await runGemini(
            prompt,
            schema
        );


    const parsed =
        parseAIJSON(
            text
        );


    if (
        !parsed ||
        !Array.isArray(
            parsed.keywords
        )
    ) {

        return [];

    }


    return parsed.keywords;

}


// ==========================================================
// TITLE GENERATOR
// ==========================================================

async function generateTitle(
    data
) {

    const product =
        cleanText(
            data.productName
        );

    const category =
        normalizeCategory(
            data.category
        );

    const brand =
        cleanText(
            data.brand
        );

    const details =
        cleanText(
            data.productDetails
        );


    const prompt = `
You are a strict factual e-commerce product title generator.

Create ONE clear product title.

Rules:
- Product Name is the primary identity.
- Use only information provided by the seller.
- Do not invent specifications.
- Do not invent color.
- Do not invent size.
- Do not invent material.
- Do not invent gender.
- Do not invent features.
- Do not use fake claims.
- Avoid excessive keyword stuffing.
- Keep the title natural.
- Return JSON only.

Product Name:
${product}

Category:
${category}

Brand:
${brand || "Not provided"}

Product Details:
${details || "Not provided"}

Return:

{
  "title": "..."
}
`;


    const schema = {

        type:
            "object",

        properties: {

            title: {
                type:
                    "string"
            }

        },

        required: [
            "title"
        ]

    };


    const text =
        await runGemini(
            prompt,
            schema
        );


    const parsed =
        parseAIJSON(
            text
        );


    if (
        parsed &&
        typeof parsed.title ===
        "string" &&
        parsed.title.trim()
    ) {

        return parsed.title.trim();

    }


    return product;

}


// ==========================================================
// DESCRIPTION GENERATOR
// ==========================================================

async function generateDescription(
    data
) {

    const product =
        cleanText(
            data.productName
        );

    const category =
        normalizeCategory(
            data.category
        );

    const brand =
        cleanText(
            data.brand
        );

    const details =
        cleanText(
            data.productDetails
        );

    const keywords =
        cleanText(
            data.importantKeywords
        );


    const prompt = `
You are a strict factual e-commerce product description generator.

Create a clear product description using ONLY seller-provided information.

Rules:
- Never invent facts.
- Never invent specifications.
- Never invent material.
- Never invent color.
- Never invent size.
- Never invent gender.
- Never invent features.
- Never invent warranty.
- Never invent certification.
- Never make medical or performance claims.
- Do not add unsupported benefits.
- Use natural language.
- Do not keyword stuff.
- Return JSON only.

Product Name:
${product}

Category:
${category}

Brand:
${brand || "Not provided"}

Product Details:
${details || "Not provided"}

Important Keywords:
${keywords || "Not provided"}

Return:

{
  "description": "..."
}
`;


    const schema = {

        type:
            "object",

        properties: {

            description: {
                type:
                    "string"
            }

        },

        required: [
            "description"
        ]

    };


    const text =
        await runGemini(
            prompt,
            schema
        );


    const parsed =
        parseAIJSON(
            text
        );


    if (
        parsed &&
        typeof parsed.description ===
        "string"
    ) {

        return parsed.description.trim();

    }


    return details ||
        product;

}


// ==========================================================
// COMPLETE LISTING GENERATOR
// ==========================================================

async function generateListing(
    data
) {

    const product =
        cleanText(
            data.productName
        );

    const category =
        normalizeCategory(
            data.category
        );

    const brand =
        cleanText(
            data.brand
        );

    const details =
        cleanText(
            data.productDetails
        );

    const price =
        cleanText(
            data.price
        );

    const color =
        cleanText(
            data.color
        );

    const size =
        cleanText(
            data.size
        );

    const material =
        cleanText(
            data.material
        );

    const imageDescription =
        cleanText(
            data.imageDescription
        );


    const prompt = `
You are AI Seller Toolkit's strict factual e-commerce listing generator.

Generate a complete product listing.

IMPORTANT:
Use ONLY seller-provided facts.

Never invent:
- specifications
- color
- size
- material
- dimensions
- weight
- gender
- features
- warranty
- certification
- ratings
- reviews
- discount
- delivery promises
- performance claims

If information is missing, do not create it.

Product Name:
${product}

Category:
${category}

Brand:
${brand || "Not provided"}

Price:
${price || "Not provided"}

Color:
${color || "Not provided"}

Size:
${size || "Not provided"}

Material:
${material || "Not provided"}

Product Details:
${details || "Not provided"}

Image Description:
${imageDescription || "Not provided"}

Return JSON:

{
  "title": "...",
  "description": "...",
  "highlights": [
    "...",
    "...",
    "..."
  ],
  "seoKeywords": [
    "...",
    "..."
  ]
}
`;


    const schema = {

        type:
            "object",

        properties: {

            title: {
                type:
                    "string"
            },

            description: {
                type:
                    "string"
            },

            highlights: {

                type:
                    "array",

                items: {
                    type:
                        "string"
                }

            },

            seoKeywords: {

                type:
                    "array",

                items: {
                    type:
                        "string"
                }

            }

        },

        required: [
            "title",
            "description",
            "highlights",
            "seoKeywords"
        ]

    };


    const text =
        await runGemini(
            prompt,
            schema
        );


    const parsed =
        parseAIJSON(
            text
        );


    if (!parsed) {

        throw new Error(
            "AI listing response parse नहीं हो सका।"
        );

    }


    return {

        title:
            cleanText(
                parsed.title
            ) ||
            product,

        description:
            cleanText(
                parsed.description
            ) ||
            details ||
            product,

        highlights:
            Array.isArray(
                parsed.highlights
            )
                ? parsed.highlights
                    .map(cleanText)
                    .filter(Boolean)
                    .slice(0, 10)
                : [],

        seoKeywords:
            Array.isArray(
                parsed.seoKeywords
            )
                ? parsed.seoKeywords
                    .map(cleanKeyword)
                    .filter(Boolean)
                    .slice(0, 20)
                : []

    };

}


// ==========================================================
// HEALTH
// ==========================================================

app.get(
    "/",
    function (req, res) {

        res.json({

            success:
                true,

            server:
                "AI Seller Toolkit Backend",

            version:
                VERSION,

            status:
                "online",

            model:
                MODEL,

            api:
                "Gemini Interactions API",

            geminiConfigured:
                Boolean(
                    GEMINI_API_KEY
                ),

            endpoints: [

                "/api/status",
                "/api/categories",
                "/api/generate-title",
                "/api/generate-description",
                "/api/generate-listing",
                "/api/generate-seo"

            ]

        });

    }
);


// ==========================================================
// STATUS
// ==========================================================

app.get(
    "/api/status",
    function (req, res) {

        res.json({

            success:
                true,

            server:
                "AI Seller Toolkit Backend",

            version:
                VERSION,

            status:
                "online",

            model:
                MODEL,

            api:
                "Interactions API",

            geminiConfigured:
                Boolean(
                    GEMINI_API_KEY
                ),

            endpoints: [

                "/api/status",
                "/api/categories",
                "/api/generate-title",
                "/api/generate-description",
                "/api/generate-listing",
                "/api/generate-seo"

            ]

        });

    }
);


// ==========================================================
// CATEGORIES
// ==========================================================

app.get(
    "/api/categories",
    function (req, res) {

        res.json({

            success:
                true,

            categories:
                CATEGORIES

        });

    }
);


// ==========================================================
// GENERATE TITLE
// ==========================================================

app.post(
    "/api/generate-title",
    async function (req, res) {

        try {

            const data =
                req.body || {};

            const product =
                cleanText(
                    data.productName ||
                    data.product ||
                    data.name
                );

            if (!product) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Product Name is required."

                    });

            }


            const title =
                await generateTitle(
                    data
                );


            return res.json({

                success:
                    true,

                title:
                    title

            });

        }
        catch (error) {

            console.error(
                "TITLE ERROR:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        error.message ||
                        "Title generation failed."

                });

        }

    }
);


// ==========================================================
// GENERATE DESCRIPTION
// ==========================================================

app.post(
    "/api/generate-description",
    async function (req, res) {

        try {

            const data =
                req.body || {};

            const product =
                cleanText(
                    data.productName ||
                    data.product ||
                    data.name
                );

            if (!product) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Product Name is required."

                    });

            }


            const description =
                await generateDescription(
                    data
                );


            return res.json({

                success:
                    true,

                description:
                    description

            });

        }
        catch (error) {

            console.error(
                "DESCRIPTION ERROR:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        error.message ||
                        "Description generation failed."

                });

        }

    }
);


// ==========================================================
// GENERATE COMPLETE LISTING
// ==========================================================

app.post(
    "/api/generate-listing",
    async function (req, res) {

        try {

            const data =
                req.body || {};

            const product =
                cleanText(
                    data.productName ||
                    data.product ||
                    data.name
                );

            const category =
                normalizeCategory(
                    data.category
                );


            if (!product) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Product Name is required."

                    });

            }


            if (!category) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Product category is required."

                    });

            }


            const listing =
                await generateListing(
                    data
                );


            return res.json({

                success:
                    true,

                title:
                    listing.title,

                description:
                    listing.description,

                highlights:
                    listing.highlights,

                seoKeywords:
                    listing.seoKeywords,

                listing:
                    listing

            });

        }
        catch (error) {

            console.error(
                "LISTING ERROR:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        error.message ||
                        "Listing generation failed."

                });

        }

    }
);


// ==========================================================
// GENERATE SEO
// ==========================================================

app.post(
    "/api/generate-seo",
    async function (req, res) {

        try {

            const data =
                req.body || {};


            // ==================================================
            // INPUTS
            // ==================================================

            const product =
                cleanText(
                    data.productName ||
                    data.product ||
                    data.name
                );

            const category =
                normalizeCategory(
                    data.category
                );

            const brand =
                cleanText(
                    data.brand
                );

            const marketplace =
                cleanText(
                    data.marketplace
                );


            if (!product) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Product Name is required."

                    });

            }


            if (!category) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Product category is required."

                    });

            }


            // ==================================================
            // MAIN KEYWORD
            // ==================================================

            const mainKeyword =
                sanitizeMainKeyword(

                    data.mainKeyword ||
                    product,

                    product,

                    brand

                );


            console.log(
                "=============================================="
            );

            console.log(
                "SEO GENERATION 14.2"
            );

            console.log(
                "Product:",
                product
            );

            console.log(
                "Category:",
                category
            );

            console.log(
                "Brand:",
                brand
            );

            console.log(
                "Main Keyword:",
                mainKeyword
            );

            console.log(
                "Marketplace:",
                marketplace
            );

            console.log(
                "=============================================="
            );


            // ==================================================
            // AI GENERATION
            // ==================================================

            let aiKeywords = [];

            try {

                aiKeywords =
                    await generateSEOWithAI({

                        productName:
                            product,

                        category:
                            category,

                        brand:
                            brand,

                        mainKeyword:
                            mainKeyword,

                        marketplace:
                            marketplace

                    });

            }
            catch (aiError) {

                console.error(
                    "⚠️ SEO AI ERROR:",
                    aiError.message
                );

                aiKeywords = [];

            }


            // ==================================================
            // FRONTEND/BACKEND SAFE FILTER
            // ==================================================

            let finalKeywords =
                filterSEOKeywords(

                    aiKeywords,

                    product,

                    brand,

                    mainKeyword

                );


            // ==================================================
            // IMPORTANT FIX
            // ==================================================
            //
            // अगर AI ने सिर्फ:
            //
            // Cotton tshirt
            //
            // दिया,
            //
            // तो अब server automatic safe SEO
            // keyword variations बनाएगा.
            //
            // ==================================================

            if (
                finalKeywords.length < 12
            ) {

                const fallbackKeywords =
                    buildSafeSEOKeywords(

                        product,

                        category,

                        brand,

                        marketplace,

                        mainKeyword

                    );


                for (
                    const keyword
                    of fallbackKeywords
                ) {

                    const normalized =
                        normalizeKeyword(
                            keyword
                        );


                    const exists =
                        finalKeywords.some(
                            existing =>
                                normalizeKeyword(
                                    existing
                                ) ===
                                normalized
                        );


                    if (exists) {

                        continue;

                    }


                    const tooSimilar =
                        finalKeywords.some(
                            existing =>
                                keywordSimilarity(
                                    existing,
                                    keyword
                                ) >= 0.85
                        );


                    if (
                        tooSimilar
                    ) {

                        continue;

                    }


                    if (
                        isProductFragment(
                            keyword,
                            product
                        )
                    ) {

                        continue;

                    }


                    if (
                        isBrandStuffed(
                            keyword,
                            brand,
                            product
                        )
                    ) {

                        continue;

                    }


                    finalKeywords.push(
                        keyword
                    );


                    if (
                        finalKeywords.length >=
                        20
                    ) {

                        break;

                    }

                }

            }


            // ==================================================
            // FINAL FILTER AGAIN
            // ==================================================

            finalKeywords =
                filterSEOKeywords(

                    finalKeywords,

                    product,

                    brand,

                    mainKeyword

                );


            // ==================================================
            // SECOND FALLBACK
            // ==================================================
            //
            // बहुत unusual short product के मामले में
            // कम से कम available safe keywords रखें.
            //
            // ==================================================

            if (
                finalKeywords.length < 2
            ) {

                const emergency =
                    [

                        mainKeyword,

                        product +
                        " online",

                        product +
                        " shopping",

                        "buy " +
                        product +
                        " online",

                        product +
                        " product",

                        category +
                        " " +
                        product,

                        product +
                        " " +
                        category

                    ];


                finalKeywords =
                    filterSEOKeywords(

                        emergency,

                        product,

                        brand,

                        mainKeyword

                    );

            }


            // ==================================================
            // FORCE MAIN KEYWORD FIRST
            // ==================================================

            const normalizedMain =
                normalizeKeyword(
                    mainKeyword
                );


            const mainIndex =
                finalKeywords.findIndex(
                    keyword =>
                        normalizeKeyword(
                            keyword
                        ) ===
                        normalizedMain
                );


            if (
                mainIndex > 0
            ) {

                const mainItem =
                    finalKeywords.splice(
                        mainIndex,
                        1
                    )[0];

                finalKeywords.unshift(
                    mainItem
                );

            }
            else if (
                mainIndex === -1 &&
                mainKeyword
            ) {

                finalKeywords.unshift(
                    mainKeyword
                );

            }


            // ==================================================
            // FINAL UNIQUE
            // ==================================================

            finalKeywords =
                removeDuplicates(
                    finalKeywords
                );


            // ==================================================
            // FINAL LIMIT
            // ==================================================

            finalKeywords =
                finalKeywords.slice(
                    0,
                    20
                );


            // ==================================================
            // RESPONSE
            // ==================================================

            console.log(
                "FINAL SEO KEYWORDS:",
                finalKeywords
            );


            return res.json({

                success:
                    true,

                keywords:
                    finalKeywords,

                seoKeywords:
                    finalKeywords,

                mainKeyword:
                    finalKeywords[0] ||
                    mainKeyword,

                count:
                    finalKeywords.length,

                category:
                    category,

                marketplace:
                    marketplace

            });

        }
        catch (error) {

            console.error(
                "❌ SEO GENERATOR ERROR:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        error.message ||
                        "SEO keyword generation failed."

                });

        }

    }
);


// ==========================================================
// 404
// ==========================================================

app.use(
    function (req, res) {

        res
            .status(404)
            .json({

                success:
                    false,

                error:
                    "API endpoint not found.",

                path:
                    req.path,

                availableEndpoints: [

                    "GET /",
                    "GET /api/status",
                    "GET /api/categories",

                    "POST /api/generate-title",
                    "POST /api/generate-description",
                    "POST /api/generate-listing",
                    "POST /api/generate-seo"

                ]

            });

    }
);


// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use(
    function (
        error,
        req,
        res,
        next
    ) {

        console.error(
            "GLOBAL SERVER ERROR:",
            error
        );

        if (
            res.headersSent
        ) {

            return next(
                error
            );

        }

        res
            .status(500)
            .json({

                success:
                    false,

                error:
                    error.message ||
                    "Internal server error."

            });

    }
);


// ==========================================================
// START SERVER
// ==========================================================

app.listen(
    PORT,
    function () {

        console.log(
            "=================================================="
        );

        console.log(
            "🚀 AI SELLER TOOLKIT BACKEND"
        );

        console.log(
            "=================================================="
        );

        console.log(
            "Version:",
            VERSION
        );

        console.log(
            "Server running on port:",
            PORT
        );

        console.log(
            "Gemini Model:",
            MODEL
        );

        console.log(
            "Gemini API:",
            "Interactions API"
        );

        console.log(
            "Gemini Configured:",
            Boolean(
                GEMINI_API_KEY
            )
        );

        console.log(
            "SEO Endpoint:",
            "/api/generate-seo"
        );

        console.log(
            "=================================================="
        );

    }
);


// ==========================================================
// FINAL
// ==========================================================

console.log(
    "✅ AI Seller Toolkit Backend 14.2 loaded"
);
