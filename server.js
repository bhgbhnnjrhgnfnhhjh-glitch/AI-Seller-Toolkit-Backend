// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 13.0
// ==========================================================
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// CATEGORY-AWARE + STRICT FACTUAL AI
//
// Endpoints:
// GET  /
// GET  /api/status
// GET  /api/categories
// POST /api/generate-title
// POST /api/generate-description
// POST /api/generate-listing
// POST /api/generate-seo
//
// Supported Categories:
// Fashion
// Beauty
// Electronics
// Home & Kitchen
// Shoes
// Jewellery
// Toys
// Books
// Pet
// Sports
// Automotive
// Garden
// Food
// Gifts
// ==========================================================


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();


// ==========================================================
// CORS
// ==========================================================

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


app.use(
    express.json({
        limit: "1mb"
    })
);


// ==========================================================
// CONFIG
// ==========================================================

const PORT =
    process.env.PORT || 10000;

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY;

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";

let ai = null;


if (GEMINI_API_KEY) {

    ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    });

}


// ==========================================================
// CATEGORIES
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
// CATEGORY ALIASES
// ==========================================================

const CATEGORY_ALIASES = {

    "fashion": "Fashion",

    "beauty": "Beauty",

    "electronics": "Electronics",

    "home kitchen": "Home & Kitchen",

    "home and kitchen": "Home & Kitchen",

    "home & kitchen": "Home & Kitchen",

    "shoes": "Shoes",

    "shoe": "Shoes",

    "jewellery": "Jewellery",

    "jewelry": "Jewellery",

    "toys": "Toys",

    "toy": "Toys",

    "books": "Books",

    "book": "Books",

    "pet": "Pet",

    "pets": "Pet",

    "sports": "Sports",

    "sport": "Sports",

    "automotive": "Automotive",

    "auto": "Automotive",

    "garden": "Garden",

    "gardening": "Garden",

    "food": "Food",

    "gifts": "Gifts",

    "gift": "Gifts"

};


// ==========================================================
// CATEGORY RULES
// ==========================================================

const CATEGORY_RULES = {

    "Fashion": `
Focus on clothing and fashion products.

Allowed facts:
product type, brand, fabric/material, color,
size, pattern, fit, sleeve, neckline, occasion,
quantity and other seller-provided attributes.

Never invent gender, fabric, color, size,
pattern, fit, occasion or features.
`,

    "Beauty": `
Focus on beauty, skincare, haircare and personal-care products.

Use only seller-provided:
product type, brand, ingredients, quantity,
fragrance, shade, skin/hair information and other supplied facts.

Never invent ingredients, benefits, SPF,
medical claims, certification or suitability.
`,

    "Electronics": `
Focus on electronic and technology products.

Use only supplied:
device type, brand, model, connectivity,
compatibility, battery, capacity, ports,
power, color and other specifications.

Never invent technical specifications,
compatibility, battery, warranty or certification.
`,

    "Home & Kitchen": `
Focus on home, kitchen and household products.

Use only supplied:
product type, material, color, size,
capacity, design, usage and quantity.

Never invent dimensions, capacity, material,
safety claims or features.
`,

    "Shoes": `
Focus on footwear.

Use only supplied:
shoe type, brand, size, color, material,
design, closure, sole and intended use.

Never invent gender, size, material,
comfort, cushioning or water resistance.
`,

    "Jewellery": `
Focus on jewellery and fashion accessories.

Use only supplied:
jewellery type, material, design, color,
stone information, plating, size,
occasion and quantity.

Never invent purity, hallmark,
certification, weight or gemstone information.
`,

    "Toys": `
Focus on toys and children's products.

Use only supplied:
toy type, material, color, design,
age range, quantity and features.

Never invent safety certification,
age suitability or educational claims.
`,

    "Books": `
Focus on books.

Use only supplied:
book title, author, language, genre,
edition, publisher, ISBN and seller details.

Never invent page count, awards,
reviews or publisher information.
`,

    "Pet": `
Focus on pet products.

Use only supplied:
product type, pet type, material,
size, color, quantity and usage.

Never invent medical,
veterinary or health claims.
`,

    "Sports": `
Focus on sports and fitness products.

Use only supplied:
product type, sport, material,
size, color, quantity and features.

Never invent performance,
medical or fitness results.
`,

    "Automotive": `
Focus on automotive products and accessories.

Use only supplied:
product type, vehicle compatibility,
brand, model, material, size,
color and usage.

Never invent compatibility,
performance or installation claims.
`,

    "Garden": `
Focus on gardening and outdoor products.

Use only supplied:
product type, material, size,
color, usage and quantity.

Never invent plant results,
growth claims or durability claims.
`,

    "Food": `
Focus on food products.

Use only supplied:
product name, ingredients, flavor,
quantity, packaging and seller-provided facts.

Never invent nutrition,
health claims, expiry information
or certification.
`,

    "Gifts": `
Focus on gifts and gifting products.

Use only supplied:
gift type, material, design,
personalization, occasion, color,
size and quantity.

Never invent packaging,
personalization options or occasion.
`

};


// ==========================================================
// NORMALIZE CATEGORY
// ==========================================================

function normalizeCategory(category) {

    if (!category) {
        return "";
    }

    let value =
        String(category)
            .trim()
            .toLowerCase();

    // Remove common emojis
    value =
        value
            .replace(/👗|💄|📱|🏠|👟|💍|🧸|📚|🐶|🏋️|🚗|🌱|🍎|🎁/g, "")
            .trim();

    if (CATEGORY_ALIASES[value]) {

        return CATEGORY_ALIASES[value];

    }

    const found =
        CATEGORIES.find(
            item =>
                item.toLowerCase() === value
        );

    return found || "";

}


// ==========================================================
// CLEAN STRING
// ==========================================================

function cleanString(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .trim();

}


// ==========================================================
// SAFE JSON PARSER
// ==========================================================

function safeJsonParse(text) {

    if (!text) {
        return null;
    }

    let cleaned =
        String(text).trim();

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

        return JSON.parse(cleaned);

    }
    catch {}


    const objectStart =
        cleaned.indexOf("{");

    const objectEnd =
        cleaned.lastIndexOf("}");


    if (
        objectStart !== -1 &&
        objectEnd > objectStart
    ) {

        try {

            return JSON.parse(
                cleaned.substring(
                    objectStart,
                    objectEnd + 1
                )
            );

        }
        catch {}

    }


    const arrayStart =
        cleaned.indexOf("[");

    const arrayEnd =
        cleaned.lastIndexOf("]");


    if (
        arrayStart !== -1 &&
        arrayEnd > arrayStart
    ) {

        try {

            return JSON.parse(
                cleaned.substring(
                    arrayStart,
                    arrayEnd + 1
                )
            );

        }
        catch {}

    }


    return null;

}


// ==========================================================
// GET TEXT FROM INTERACTION
// ==========================================================

function getInteractionText(interaction) {

    if (!interaction) {
        return "";
    }


    if (
        typeof interaction.output_text === "string" &&
        interaction.output_text.trim()
    ) {

        return interaction.output_text.trim();

    }


    if (
        Array.isArray(interaction.steps)
    ) {

        const textParts = [];


        for (
            const step of interaction.steps
        ) {

            if (
                step &&
                Array.isArray(step.content)
            ) {

                for (
                    const block of step.content
                ) {

                    if (
                        block &&
                        block.type === "text" &&
                        typeof block.text === "string"
                    ) {

                        textParts.push(
                            block.text
                        );

                    }

                }

            }

        }


        if (textParts.length) {

            return textParts
                .join("\n")
                .trim();

        }

    }


    return "";

}


// ==========================================================
// CALL GEMINI
// ==========================================================

async function callGemini(prompt) {

    if (!GEMINI_API_KEY) {

        throw new Error(
            "GEMINI_API_KEY is not configured on the server."
        );

    }


    if (!ai) {

        ai =
            new GoogleGenAI({
                apiKey:
                    GEMINI_API_KEY
            });

    }


    const interaction =
        await ai.interactions.create({

            model:
                MODEL,

            input:
                prompt

        });


    const text =
        getInteractionText(
            interaction
        );


    if (!text) {

        console.error(
            "EMPTY GEMINI RESPONSE:",
            JSON.stringify(
                interaction,
                null,
                2
            )
        );


        throw new Error(
            "Gemini ने कोई usable text response नहीं दिया।"
        );

    }


    return text;

}


// ==========================================================
// STRICT FACTUAL RULES
// ==========================================================

const STRICT_RULES = `

STRICT FACTUAL RULES:

1. केवल seller द्वारा दी गई information का उपयोग करो।

2. Missing information को कभी invent मत करो।

3. Fake specifications मत बनाओ।

4. Fake benefits मत बनाओ।

5. Fake certification मत बनाओ।

6. Unsupported medical claims मत बनाओ।

7. Unsupported technical specifications मत बनाओ।

8. Unsupported dimensions मत बनाओ।

9. Unsupported compatibility मत बनाओ।

10. Unsupported warranty मत बनाओ।

11. Unsupported material मत बनाओ।

12. Unsupported quantity मत बनाओ।

13. Unsupported color, size, gender, model,
age, pattern या feature मत बनाओ।

14. Product को Best, No.1, Premium,
Guaranteed या 100% जैसा दावा मत दो
जब तक seller ने explicitly नहीं दिया हो।

15. Missing information को छोड़ दो।

16. Seller के facts को बदलकर गलत अर्थ मत बनाओ।

17. Marketplace-friendly लेकिन factual language उपयोग करो।

`;


// ==========================================================
// SEO NORMALIZATION
// ==========================================================

function normalizeSEOText(text) {

    return cleanString(text)
        .toLowerCase()
        .replace(/[’']/g, "")
        .replace(/[-_/]/g, " ")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

}


// ==========================================================
// SEO TOKEN SET
// ==========================================================

function seoTokenSet(text) {

    const normalized =
        normalizeSEOText(text);

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
// SEO SIMILARITY
// ==========================================================

function seoSimilarity(a, b) {

    const A =
        seoTokenSet(a);

    const B =
        seoTokenSet(b);


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


    if (!union) {
        return 0;
    }


    return intersection / union;

}


// ==========================================================
// CLEAN SEO KEYWORD
// ==========================================================

function cleanSEOKeyword(value) {

    if (!value) {
        return "";
    }


    return String(value)
        .trim()
        .replace(
            /^\s*\d+[\.\)\-:]\s*/,
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
// GENERIC SEO FILLER WORDS
// ==========================================================
//
// These words should NOT be used simply
// to create artificial keyword variations.
// ==========================================================

const SEO_FILLER_WORDS = new Set([

    "online",
    "collection",
    "store",
    "fashion",
    "apparel",
    "wear",
    "shopping",
    "buy",
    "shop",
    "best",
    "premium",
    "trendy",
    "stylish",
    "latest",
    "new",
    "beautiful",
    "quality",
    "sale",
    "offer",
    "deals",
    "price",
    "cheap",
    "wholesale"

]);


// ==========================================================
// CHECK IF KEYWORD IS MOSTLY FILLER
// ==========================================================

function isMostlyFillerKeyword(
    keyword,
    productName
) {

    const tokens =
        normalizeSEOText(keyword)
            .split(" ")
            .filter(Boolean);


    const productTokens =
        seoTokenSet(productName);


    if (!tokens.length) {
        return true;
    }


    let usefulCount = 0;


    for (
        const token of tokens
    ) {

        if (
            !SEO_FILLER_WORDS.has(token) ||
            productTokens.has(token)
        ) {

            usefulCount++;

        }

    }


    // A keyword such as:
    // "Cotton Kurti Online"
    // becomes mostly product + filler.
    if (
        usefulCount === 0
    ) {

        return true;

    }


    // If all extra words are generic filler,
    // reject the keyword.
    const nonProductWords =
        tokens.filter(
            token =>
                !productTokens.has(token)
        );


    if (
        nonProductWords.length > 0 &&
        nonProductWords.every(
            token =>
                SEO_FILLER_WORDS.has(token)
        )
    ) {

        return true;

    }


    return false;

}


// ==========================================================
// SAFE SEO FILTER
// ==========================================================

function filterSEOKeywords(
    keywords,
    productName,
    brand,
    category,
    mainKeyword
) {

    const output = [];

    const seen =
        new Set();


    const mainNormalized =
        normalizeSEOText(
            mainKeyword
        );


    const productNormalized =
        normalizeSEOText(
            productName
        );


    const brandNormalized =
        normalizeSEOText(
            brand
        );


    const categoryNormalized =
        normalizeSEOText(
            category
        );


    for (
        const raw of Array.isArray(keywords)
            ? keywords
            : []
    ) {

        const keyword =
            cleanSEOKeyword(raw);


        if (!keyword) {
            continue;
        }


        const normalized =
            normalizeSEOText(keyword);


        if (!normalized) {
            continue;
        }


        // Exact duplicate
        if (
            seen.has(normalized)
        ) {

            continue;

        }


        // Maximum 8 words
        const wordCount =
            normalized
                .split(" ")
                .length;


        if (
            wordCount > 8
        ) {

            continue;

        }


        // Main keyword is always allowed
        const isMainKeyword =
            normalized ===
            mainNormalized;


        // Reject obvious filler keywords
        // unless the seller's main keyword
        // itself contains that word.
        if (
            !isMainKeyword &&
            isMostlyFillerKeyword(
                keyword,
                productName
            )
        ) {

            continue;

        }


        // --------------------------------------------------
        // BRAND STUFFING PROTECTION
        // --------------------------------------------------

        if (
            brandNormalized &&
            normalized.includes(
                brandNormalized
            ) &&
            !isMainKeyword
        ) {

            const withoutBrand =
                normalized
                    .replace(
                        brandNormalized,
                        ""
                    )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();


            // Reject simple:
            // Brand + exact Product
            if (
                withoutBrand ===
                productNormalized
            ) {

                continue;

            }

        }


        // --------------------------------------------------
        // CATEGORY STUFFING PROTECTION
        // --------------------------------------------------

        if (
            categoryNormalized &&
            normalized.includes(
                categoryNormalized
            ) &&
            productNormalized &&
            normalized.includes(
                productNormalized
            ) &&
            !isMainKeyword
        ) {

            const simpleCombination =
                (
                    categoryNormalized +
                    " " +
                    productNormalized
                )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();


            if (
                normalized ===
                simpleCombination
            ) {

                continue;

            }

        }


        // --------------------------------------------------
        // NEAR DUPLICATE PROTECTION
        // --------------------------------------------------

        let tooSimilar = false;


        for (
            const existing of output
        ) {

            if (
                seoSimilarity(
                    keyword,
                    existing
                ) >= 0.82
            ) {

                tooSimilar = true;
                break;

            }

        }


        if (tooSimilar) {

            continue;

        }


        seen.add(
            normalized
        );


        output.push(
            keyword
        );


        if (
            output.length >= 20
        ) {

            break;

        }

    }


    // ------------------------------------------------------
    // MAIN KEYWORD FIRST
    // ------------------------------------------------------

    const mainIndex =
        output.findIndex(
            item =>
                normalizeSEOText(
                    item
                ) ===
                mainNormalized
        );


    if (
        mainIndex > 0
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


    // ------------------------------------------------------
    // MAIN KEYWORD MUST EXIST
    // ------------------------------------------------------

    const mainExists =
        output.some(
            item =>
                normalizeSEOText(
                    item
                ) ===
                mainNormalized
        );


    if (
        !mainExists &&
        mainNormalized
    ) {

        output.unshift(
            cleanMainKeywordSafe(
                mainKeyword
            )
        );

    }


    return output.slice(
        0,
        15
    );

}


// ==========================================================
// SAFE MAIN KEYWORD
// ==========================================================

function cleanMainKeywordSafe(
    keyword
) {

    return cleanSEOKeyword(
        keyword
    );

}


// ==========================================================
// BASIC VALIDATION
// ==========================================================

function validateProductInput(
    category,
    productName
) {

    const normalizedCategory =
        normalizeCategory(
            category
        );


    if (!normalizedCategory) {

        return {
            ok: false,
            error:
                "Valid product category is required."
        };

    }


    if (
        !cleanString(
            productName
        )
    ) {

        return {
            ok: false,
            error:
                "Product Name is required."
        };

    }


    return {
        ok: true,
        category:
            normalizedCategory
    };

}


// ==========================================================
// ROOT
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI Seller Toolkit Backend",

            version:
                "13.0",

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

            categories:
                CATEGORIES.length,

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
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI Seller Toolkit Backend",

            version:
                "13.0",

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

            categories:
                CATEGORIES.length,

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
    (req, res) => {

        res.json({

            success: true,

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
    async (req, res) => {

        try {

            const {

                category,
                productName,
                brand,
                productDetails,
                keywords

            } = req.body || {};


            const validation =
                validateProductInput(
                    category,
                    productName
                );


            if (!validation.ok) {

                return res.status(400).json({

                    success: false,

                    error:
                        validation.error

                });

            }


            const normalizedCategory =
                validation.category;


            const cleanProduct =
                cleanString(
                    productName
                );


            const cleanBrand =
                cleanString(
                    brand
                );


            const cleanDetails =
                cleanString(
                    productDetails
                );


            const cleanKeywords =
                cleanString(
                    keywords
                );


            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";


            const prompt = `

You are an expert e-commerce marketplace TITLE generator.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanProduct}

BRAND:
${cleanBrand || "Not provided"}

PRODUCT DETAILS:
${cleanDetails || "Not provided"}

SELLER KEYWORDS:
${cleanKeywords || "Not provided"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

TITLE REQUIREMENTS:

1. Generate exactly 5 different titles.

2. Every title must describe the SAME product.

3. Use the exact seller facts.

4. Brand may be used when supplied.

5. Do not invent attributes.

6. Do not add unsupported color.

7. Do not add unsupported size.

8. Do not add unsupported gender.

9. Do not add unsupported material.

10. Do not add unsupported features.

11. Do not use fake claims.

12. Do not use "Best", "No.1", "Premium",
"Guaranteed" or similar unsupported claims.

13. Do not use emojis.

14. Titles should be natural marketplace titles.

15. Do not create meaningless keyword stuffing.

16. Do not make all 5 titles nearly identical.

Return ONLY valid JSON:

{
  "titles": [
    "Title 1",
    "Title 2",
    "Title 3",
    "Title 4",
    "Title 5"
  ]
}

`;


            const output =
                await callGemini(
                    prompt
                );


            const parsed =
                safeJsonParse(
                    output
                );


            let titles =
                parsed &&
                Array.isArray(
                    parsed.titles
                )
                    ? parsed.titles
                    : [];


            titles =
                titles
                    .map(cleanString)
                    .filter(Boolean);


            const uniqueTitles = [];

            const titleSeen =
                new Set();


            for (
                const title of titles
            ) {

                const normalized =
                    normalizeSEOText(
                        title
                    );


                if (
                    !normalized ||
                    titleSeen.has(
                        normalized
                    )
                ) {

                    continue;

                }


                titleSeen.add(
                    normalized
                );


                uniqueTitles.push(
                    title
                );


                if (
                    uniqueTitles.length >= 5
                ) {

                    break;

                }

            }


            if (
                !uniqueTitles.length
            ) {

                throw new Error(
                    "Gemini ने valid titles नहीं दिए।"
                );

            }


            return res.json({

                success: true,

                category:
                    normalizedCategory,

                productName:
                    cleanProduct,

                titles:
                    uniqueTitles

            });

        }
        catch (error) {

            console.error(
                "GENERATE TITLE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

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
    async (req, res) => {

        try {

            const {

                category,
                productName,
                brand,
                productDetails,
                keywords

            } = req.body || {};


            const validation =
                validateProductInput(
                    category,
                    productName
                );


            if (!validation.ok) {

                return res.status(400).json({

                    success: false,

                    error:
                        validation.error

                });

            }


            const normalizedCategory =
                validation.category;


            const cleanProduct =
                cleanString(
                    productName
                );


            const cleanBrand =
                cleanString(
                    brand
                );


            const cleanDetails =
                cleanString(
                    productDetails
                );


            const cleanKeywords =
                cleanString(
                    keywords
                );


            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";


            const prompt = `

You are an expert e-commerce product description writer.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanProduct}

BRAND:
${cleanBrand || "Not provided"}

PRODUCT DETAILS:
${cleanDetails || "Not provided"}

KEYWORDS:
${cleanKeywords || "Not provided"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

TASK:

Write ONE clear marketplace-ready product description.

RULES:

- Use only seller-provided facts.
- Do not invent specifications.
- Do not invent benefits.
- Do not invent ingredients.
- Do not invent dimensions.
- Do not invent compatibility.
- Do not invent warranty.
- Do not invent certification.
- Do not make medical claims.
- Do not make guaranteed claims.
- Use keywords naturally.
- Do not keyword stuff.
- Do not mention AI.
- Do not return JSON.
- Return only description text.

`;


            const description =
                (
                    await callGemini(
                        prompt
                    )
                ).trim();


            if (!description) {

                throw new Error(
                    "Gemini ने description नहीं दिया।"
                );

            }


            return res.json({

                success: true,

                category:
                    normalizedCategory,

                productName:
                    cleanProduct,

                description:
                    description

            });

        }
        catch (error) {

            console.error(
                "GENERATE DESCRIPTION ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

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
    async (req, res) => {

        try {

            const body =
                req.body || {};


            const category =
                body.category;


            const productName =
                body.productName;


            const validation =
                validateProductInput(
                    category,
                    productName
                );


            if (!validation.ok) {

                return res.status(400).json({

                    success: false,

                    error:
                        validation.error

                });

            }


            const normalizedCategory =
                validation.category;


            const cleanProduct =
                cleanString(
                    productName
                );


            const cleanBrand =
                cleanString(
                    body.brand
                );


            // Collect ALL supplied product fields
            // without inventing anything.

            const productFacts = {

                productName:
                    cleanProduct,

                brand:
                    cleanBrand,

                price:
                    cleanString(
                        body.price
                    ),

                color:
                    cleanString(
                        body.color
                    ),

                size:
                    cleanString(
                        body.size
                    ),

                material:
                    cleanString(
                        body.material
                    ),

                fabric:
                    cleanString(
                        body.fabric
                    ),

                pattern:
                    cleanString(
                        body.pattern
                    ),

                fit:
                    cleanString(
                        body.fit
                    ),

                occasion:
                    cleanString(
                        body.occasion
                    ),

                quantity:
                    cleanString(
                        body.quantity
                    ),

                productDetails:
                    cleanString(
                        body.productDetails
                    ),

                features:
                    cleanString(
                        body.features
                    ),

                keywords:
                    cleanString(
                        body.keywords
                    ),

                imageDescription:
                    cleanString(
                        body.imageDescription
                    )

            };


            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";


            const prompt = `

You are an expert e-commerce marketplace listing generator.

CATEGORY:
${normalizedCategory}

SELLER PRODUCT DATA:
${JSON.stringify(
    productFacts,
    null,
    2
)}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

IMPORTANT:

The seller data above is the ONLY source of product facts.

Do NOT assume missing information.

Do NOT infer specifications from the product name.

Do NOT invent information from common knowledge.

If a field is empty, ignore it.

TASK:

Create one complete marketplace listing.

Return ONLY valid JSON:

{
  "title": "Accurate product title",
  "description": "Factual product description",
  "highlights": [
    "Highlight 1",
    "Highlight 2",
    "Highlight 3",
    "Highlight 4",
    "Highlight 5"
  ],
  "seoKeywords": [
    "Keyword 1",
    "Keyword 2",
    "Keyword 3"
  ]
}

LISTING RULES:

- Title must be factual.
- Description must be factual.
- Highlights must contain only supplied facts.
- SEO keywords must contain only relevant facts.
- No fake claims.
- No unsupported attributes.
- No medical claims.
- No technical assumptions.
- No fake compatibility.
- No fake warranty.
- No fake certification.
- No keyword stuffing.
- No emojis.
- No "Best", "No.1", "Guaranteed" unless seller supplied it.

`;


            const output =
                await callGemini(
                    prompt
                );


            const parsed =
                safeJsonParse(
                    output
                );


            if (!parsed) {

                throw new Error(
                    "Gemini ने valid listing JSON नहीं दिया।"
                );

            }


            const title =
                cleanString(
                    parsed.title
                );


            const description =
                cleanString(
                    parsed.description
                );


            let highlights =
                Array.isArray(
                    parsed.highlights
                )
                    ? parsed.highlights
                    : [];


            let seoKeywords =
                Array.isArray(
                    parsed.seoKeywords
                )
                    ? parsed.seoKeywords
                    : [];


            highlights =
                highlights
                    .map(cleanString)
                    .filter(Boolean)
                    .slice(0, 8);


            seoKeywords =
                filterSEOKeywords(
                    seoKeywords,
                    cleanProduct,
                    cleanBrand,
                    normalizedCategory,
                    cleanProduct
                );


            if (!title && !description) {

                throw new Error(
                    "Gemini ने usable listing नहीं दी।"
                );

            }


            return res.json({

                success: true,

                category:
                    normalizedCategory,

                productName:
                    cleanProduct,

                title:
                    title,

                description:
                    description,

                highlights:
                    highlights,

                seoKeywords:
                    seoKeywords,

                // Compatibility aliases
                keywords:
                    seoKeywords,

                bulletPoints:
                    highlights

            });

        }
        catch (error) {

            console.error(
                "GENERATE LISTING ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    error.message ||
                    "Listing generation failed."

            });

        }

    }
);


// ==========================================================
// GENERATE SEO KEYWORDS
// ==========================================================

app.post(
    "/api/generate-seo",
    async (req, res) => {

        try {

            const {

                category,
                productName,
                brand,
                productDetails,
                mainKeyword,
                marketplace

            } = req.body || {};


            const validation =
                validateProductInput(
                    category,
                    productName
                );


            if (!validation.ok) {

                return res.status(400).json({

                    success: false,

                    error:
                        validation.error

                });

            }


            const normalizedCategory =
                validation.category;


            const cleanProduct =
                cleanString(
                    productName
                );


            const cleanBrand =
                cleanString(
                    brand
                );


            const cleanDetails =
                cleanString(
                    productDetails
                );


            const cleanMainKeyword =
                cleanString(
                    mainKeyword
                );


            const cleanMarketplace =
                cleanString(
                    marketplace
                ) ||
                "All Marketplaces";


            if (!cleanMainKeyword) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Main Keyword is required."

                });

            }


            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";


            const prompt = `

You are a STRICT and HIGH-QUALITY E-COMMERCE SEO KEYWORD GENERATOR.

Your task is to generate useful search keywords
for the EXACT product supplied by the seller.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanProduct}

MAIN KEYWORD:
${cleanMainKeyword}

BRAND:
${cleanBrand || "Not provided"}

PRODUCT DETAILS:
${cleanDetails || "Not provided"}

TARGET MARKETPLACE:
${cleanMarketplace}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}


==================================================
SEO KEYWORD RULES
==================================================

1. The MAIN KEYWORD must appear exactly once.

2. Generate 8 to 15 keywords ONLY when
   genuinely relevant keywords are possible.

3. If fewer valid keywords are possible,
   return fewer.

4. NEVER create bad keywords just to reach 8.

5. Every keyword must be relevant to THIS exact product.

6. Use only words/facts supported by the seller.

7. You may create natural variations
   using genuine product terms and synonyms.

8. Do not invent attributes.

9. Do not invent gender.

10. Do not invent size.

11. Do not invent color.

12. Do not invent material.

13. Do not invent compatibility.

14. Do not invent capacity.

15. Do not invent quantity.

16. Do not invent ingredients.

17. Do not invent model numbers.

18. Do not invent features.

19. Do not invent benefits.

20. Do not invent certifications.

21. Do not invent medical claims.

22. Do not invent performance claims.

23. Do not repeat the brand in every keyword.

24. Brand should be used only when it makes
    a genuinely useful search phrase.

25. Do not automatically add the category name.

26. Do not automatically add:
    online
    collection
    store
    fashion
    apparel
    wear
    shopping
    buy
    shop
    best
    premium
    trendy
    stylish
    latest
    sale
    offer
    deals

27. These generic words may be used ONLY if
    they are actually part of the seller's
    supplied product name or main keyword.

28. Do not create combinations such as:

    Product + Online
    Product + Collection
    Product + Fashion
    Product + Store
    Product + Apparel
    Product + Wear

    unless the complete phrase is genuinely
    supplied by the seller or is a clearly
    meaningful product search phrase.

29. Do not create meaningless word combinations.

30. Do not repeat the same keyword with
    tiny changes.

31. Do not use numbering.

32. Do not return titles.

33. Do not return descriptions.

34. Do not explain anything.

35. Return ONLY valid JSON.


==================================================
EXAMPLES OF BAD SEO
==================================================

If product is:

Black Cotton T-Shirt

Do NOT generate:

Black Cotton T-Shirt Online
Black Cotton T-Shirt Collection
Black Cotton T-Shirt Fashion
Black Cotton Apparel
Black Cotton Store
Black Cotton Wear

just to increase keyword count.


==================================================
WHAT A GOOD RESULT SHOULD DO
==================================================

Use genuine variations such as:

- exact main keyword
- meaningful product synonym
- exact supplied attribute combinations
- genuine buyer search phrases
- natural product terminology

Only when those phrases are supported
by seller information.


==================================================
FINAL BUYER TEST
==================================================

For every keyword ask:

"Would a real buyer plausibly search
this exact phrase for THIS exact product?"

If NO:
DO NOT include it.

==================================================
OUTPUT
==================================================

Return ONLY:

{
  "keywords": [
    "keyword 1",
    "keyword 2",
    "keyword 3"
  ]
}

No markdown.
No numbering.
No explanation.
No extra text.

`;


            const output =
                await callGemini(
                    prompt
                );


            const parsed =
                safeJsonParse(
                    output
                );


            let keywords =
                parsed &&
                Array.isArray(
                    parsed.keywords
                )
                    ? parsed.keywords
                    : [];


            keywords =
                filterSEOKeywords(
                    keywords,
                    cleanProduct,
                    cleanBrand,
                    normalizedCategory,
                    cleanMainKeyword
                );


            if (!keywords.length) {

                throw new Error(
                    "Gemini ने valid SEO keywords नहीं दिए।"
                );

            }


            return res.json({

                success: true,

                category:
                    normalizedCategory,

                productName:
                    cleanProduct,

                marketplace:
                    cleanMarketplace,

                mainKeyword:
                    cleanMainKeyword,

                keywords:
                    keywords

            });

        }
        catch (error) {

            console.error(
                "GENERATE SEO ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    error.message ||
                    "SEO generation failed."

            });

        }

    }
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
                req.path,

            method:
                req.method

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
            "GLOBAL SERVER ERROR:",
            error
        );


        res.status(500).json({

            success: false,

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
    () => {

        console.log(
            "=================================================="
        );

        console.log(
            "AI SELLER TOOLKIT BACKEND"
        );

        console.log(
            "Version: 13.0"
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
            GEMINI_API_KEY
                ? "CONFIGURED"
                : "NOT CONFIGURED"
        );

        console.log(
            "Categories:",
            CATEGORIES.length
        );

        console.log(
            "=================================================="
        );

    }
);
