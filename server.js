// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 13.1
// ==========================================================
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// CATEGORY-AWARE + STRICT FACTUAL AI
//
// ENDPOINTS
// GET  /
// GET  /api/status
// GET  /api/categories
//
// POST /api/generate-title
// POST /api/generate-description
// POST /api/generate-listing
// POST /api/generate-seo
//
// 14 CATEGORIES
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
//
// VERSION 13.1 SEO FIX
// - Main keyword first
// - No artificial keyword stuffing
// - No unnecessary Online/Store/Collection
// - No unnecessary Brand stuffing
// - No category stuffing
// - No unsupported attributes
// - Duplicate protection
// - Near duplicate protection
// - Seller facts only
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

Use only seller-provided facts such as:
product type, brand, fabric/material, color,
size, pattern, fit, sleeve, neckline,
occasion, quantity and supplied attributes.

Never invent gender, fabric, color, size,
pattern, fit, occasion or features.
`,

    "Beauty": `
Focus on beauty, skincare, haircare and personal-care products.

Use only supplied:
product type, brand, ingredients, quantity,
fragrance, shade, skin/hair information
and other seller-provided facts.

Never invent ingredients, benefits, SPF,
medical claims, certification or suitability.
`,

    "Electronics": `
Focus on electronic and technology products.

Use only supplied:
device type, brand, model, connectivity,
compatibility, battery, capacity, ports,
power, color and specifications.

Never invent technical specifications,
compatibility, battery, warranty or certification.
`,

    "Home & Kitchen": `
Focus on home, kitchen and household products.

Use only supplied:
product type, material, color, size,
capacity, design, usage and quantity.

Never invent dimensions, capacity,
material, safety claims or features.
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

    // Remove category emojis
    value =
        value
            .replace(
                /👗|💄|📱|🏠|👟|💍|🧸|📚|🐶|🏋️|🚗|🌱|🍎|🎁/gu,
                ""
            )
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
// GET TEXT FROM GEMINI INTERACTION
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
            "Gemini ने कोई usable response नहीं दिया।"
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

16. Seller के facts का अर्थ बदलकर
गलत जानकारी मत बनाओ।

17. Marketplace-friendly लेकिन factual
language का उपयोग करो।

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
// SEO TOKENS
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
// SEO FILLER WORDS
// ==========================================================

const SEO_FILLER_WORDS =
    new Set([

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
        "offers",
        "deals",
        "price",
        "cheap",
        "wholesale",
        "original",
        "popular",
        "exclusive",
        "top"

    ]);


// ==========================================================
// FILLER CHECK
// ==========================================================

function isMostlyFillerKeyword(
    keyword,
    productName,
    mainKeyword
) {

    const normalizedKeyword =
        normalizeSEOText(
            keyword
        );

    const productTokens =
        seoTokenSet(
            productName
        );

    const mainTokens =
        seoTokenSet(
            mainKeyword
        );

    const tokens =
        normalizedKeyword
            .split(" ")
            .filter(Boolean);

    if (!tokens.length) {
        return true;
    }

    // Main keyword is always permitted.
    if (
        normalizedKeyword ===
        normalizeSEOText(mainKeyword)
    ) {

        return false;

    }

    let meaningful = 0;

    for (
        const token of tokens
    ) {

        if (
            productTokens.has(token) ||
            mainTokens.has(token) ||
            !SEO_FILLER_WORDS.has(token)
        ) {

            meaningful++;

        }

    }

    /*
      Example:

      Cotton Kurti Online

      Cotton + Kurti = product words
      Online = filler

      Therefore reject it if the only
      additional word is filler.
    */

    const extraWords =
        tokens.filter(
            token =>
                !productTokens.has(token) &&
                !mainTokens.has(token)
        );

    if (
        extraWords.length > 0 &&
        extraWords.every(
            token =>
                SEO_FILLER_WORDS.has(token)
        )
    ) {

        return true;

    }

    if (meaningful === 0) {
        return true;
    }

    return false;

}


// ==========================================================
// SEO FILTER
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
            normalizeSEOText(
                keyword
            );

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

        const isMainKeyword =
            normalized ===
            mainNormalized;


        // Filler protection
        if (
            !isMainKeyword &&
            isMostlyFillerKeyword(
                keyword,
                productName,
                mainKeyword
            )
        ) {

            continue;

        }


        // --------------------------------------------------
        // BRAND STUFFING
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

            // Reject:
            // Test Brand Kurti
            // when product itself is Kurti.
            if (
                withoutBrand ===
                productNormalized
            ) {

                continue;

            }

        }


        // --------------------------------------------------
        // CATEGORY STUFFING
        // --------------------------------------------------

        if (
            categoryNormalized &&
            normalized.includes(
                categoryNormalized
            ) &&
            !isMainKeyword
        ) {

            const withoutCategory =
                normalized
                    .replace(
                        categoryNormalized,
                        ""
                    )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();

            // If category was merely added
            // to the product name, reject.
            if (
                withoutCategory ===
                productNormalized
            ) {

                continue;

            }

        }


        // --------------------------------------------------
        // NEAR DUPLICATE
        // --------------------------------------------------

        let tooSimilar = false;

        for (
            const existing of output
        ) {

            if (
                seoSimilarity(
                    keyword,
                    existing
                ) >= 0.80
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
            keyword =>
                normalizeSEOText(
                    keyword
                ) ===
                mainNormalized
        );


    if (mainIndex > 0) {

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
    // ENSURE MAIN KEYWORD
    // ------------------------------------------------------

    const mainExists =
        output.some(
            keyword =>
                normalizeSEOText(
                    keyword
                ) ===
                mainNormalized
        );


    if (
        mainNormalized &&
        !mainExists
    ) {

        output.unshift(
            cleanSEOKeyword(
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
                "13.1",

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
                "13.1",

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


            const normalizedCategory =
                normalizeCategory(
                    category
                );


            if (!normalizedCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required."

                });

            }


            const cleanProduct =
                cleanString(
                    productName
                );


            if (!cleanProduct) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }


            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";


            const prompt = `

You are a STRICT E-COMMERCE PRODUCT TITLE GENERATOR.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanProduct}

BRAND:
${cleanString(brand) || "Not provided"}

PRODUCT DETAILS:
${cleanString(productDetails) || "Not provided"}

KEYWORDS:
${cleanString(keywords) || "Not provided"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

TITLE RULES:

1. Create ONE marketplace-friendly product title.

2. Use only seller-provided information.

3. Do not invent attributes.

4. Do not repeat words unnecessarily.

5. Do not add fake claims.

6. Do not add "Best", "No.1", "Premium",
"Guaranteed" or similar claims unless supplied.

7. Brand may be included naturally if provided.

8. Use important supplied product attributes
only when they are actually provided.

9. Do not keyword stuff.

10. Return ONLY valid JSON.

OUTPUT:

{
  "title": "product title"
}

No markdown.
No explanation.
`;


            const output =
                await callGemini(
                    prompt
                );


            const parsed =
                safeJsonParse(
                    output
                );


            let title = "";

            if (
                parsed &&
                typeof parsed.title === "string"
            ) {

                title =
                    cleanString(
                        parsed.title
                    );

            }


            if (!title) {

                title =
                    cleanString(
                        output
                    )
                    .replace(
                        /^```.*$/gm,
                        ""
                    )
                    .trim();

            }


            if (!title) {

                throw new Error(
                    "Valid title generate नहीं हुआ।"
                );

            }


            return res.json({

                success: true,

                category:
                    normalizedCategory,

                productName:
                    cleanProduct,

                title:
                    title

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


            const normalizedCategory =
                normalizeCategory(
                    category
                );


            if (!normalizedCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required."

                });

            }


            const cleanProduct =
                cleanString(
                    productName
                );


            if (!cleanProduct) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }


            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";


            const prompt = `

You are a STRICT E-COMMERCE PRODUCT DESCRIPTION GENERATOR.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanProduct}

BRAND:
${cleanString(brand) || "Not provided"}

PRODUCT DETAILS:
${cleanString(productDetails) || "Not provided"}

KEYWORDS:
${cleanString(keywords) || "Not provided"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

DESCRIPTION RULES:

1. Write a clear marketplace-friendly description.

2. Use only supplied facts.

3. Never invent specifications.

4. Never invent benefits.

5. Never invent ingredients.

6. Never invent compatibility.

7. Never invent dimensions.

8. Never invent quantity.

9. Never invent warranty or certification.

10. Do not make medical claims.

11. Do not make exaggerated claims.

12. Do not add unsupported attributes
just to make the description longer.

13. Keywords may be used naturally,
but do not keyword stuff.

14. Return ONLY valid JSON.

OUTPUT:

{
  "description": "product description"
}

No markdown.
No explanation.
`;


            const output =
                await callGemini(
                    prompt
                );


            const parsed =
                safeJsonParse(
                    output
                );


            let description = "";

            if (
                parsed &&
                typeof parsed.description === "string"
            ) {

                description =
                    cleanString(
                        parsed.description
                    );

            }


            if (!description) {

                throw new Error(
                    "Valid description generate नहीं हुआ।"
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
// GENERATE LISTING
// ==========================================================

app.post(
    "/api/generate-listing",
    async (req, res) => {

        try {

            const {
                category,
                productName,
                brand,
                productDetails,
                price,
                color,
                size,
                material,
                imageDescription
            } = req.body || {};


            const normalizedCategory =
                normalizeCategory(
                    category
                );


            if (!normalizedCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required."

                });

            }


            const cleanProduct =
                cleanString(
                    productName
                );


            if (!cleanProduct) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }


            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";


            const prompt = `

You are a STRICT E-COMMERCE COMPLETE LISTING GENERATOR.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanProduct}

BRAND:
${cleanString(brand) || "Not provided"}

PRODUCT DETAILS:
${cleanString(productDetails) || "Not provided"}

PRICE:
${cleanString(price) || "Not provided"}

COLOR:
${cleanString(color) || "Not provided"}

SIZE:
${cleanString(size) || "Not provided"}

MATERIAL:
${cleanString(material) || "Not provided"}

IMAGE DESCRIPTION:
${cleanString(imageDescription) || "Not provided"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

LISTING RULES:

1. Generate a factual marketplace listing.

2. Use ONLY information supplied by seller.

3. Do not invent missing information.

4. Do not assume gender.

5. Do not assume material.

6. Do not assume color.

7. Do not assume size.

8. Do not assume compatibility.

9. Do not assume ingredients.

10. Do not assume quantity.

11. Do not assume features.

12. Do not make medical claims.

13. Do not make fake performance claims.

14. Do not use fake certifications.

15. Do not use "Best", "No.1", "Premium",
"Guaranteed" unless explicitly supplied.

16. Do not create fake SEO keywords.

17. Keep the listing marketplace-friendly.

OUTPUT ONLY VALID JSON:

{
  "title": "",
  "description": "",
  "highlights": [],
  "seoKeywords": []
}

No markdown.
No explanation.
`;


            const output =
                await callGemini(
                    prompt
                );


            const parsed =
                safeJsonParse(
                    output
                );


            if (
                !parsed ||
                typeof parsed !== "object"
            ) {

                throw new Error(
                    "Valid listing response नहीं मिला।"
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


            const highlights =
                Array.isArray(
                    parsed.highlights
                )
                    ? parsed.highlights
                        .map(cleanString)
                        .filter(Boolean)
                        .slice(0, 10)
                    : [];


            const seoKeywords =
                filterSEOKeywords(
                    parsed.seoKeywords,
                    cleanProduct,
                    brand,
                    normalizedCategory,
                    cleanProduct
                );


            return res.json({

                success: true,

                category:
                    normalizedCategory,

                productName:
                    cleanProduct,

                listing: {

                    title:
                        title,

                    description:
                        description,

                    highlights:
                        highlights,

                    seoKeywords:
                        seoKeywords

                },

                // Compatibility fields
                title:
                    title,

                description:
                    description,

                highlights:
                    highlights,

                seoKeywords:
                    seoKeywords

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
// GENERATE SEO
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


            // ------------------------------------------------
            // CATEGORY
            // ------------------------------------------------

            const normalizedCategory =
                normalizeCategory(
                    category
                );


            if (!normalizedCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required."

                });

            }


            // ------------------------------------------------
            // PRODUCT
            // ------------------------------------------------

            const cleanProduct =
                cleanString(
                    productName
                );


            if (!cleanProduct) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }


            // ------------------------------------------------
            // MAIN KEYWORD
            // ------------------------------------------------

            const cleanMainKeyword =
                cleanString(
                    mainKeyword
                );


            if (!cleanMainKeyword) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Main Keyword is required."

                });

            }


            const cleanBrand =
                cleanString(
                    brand
                );

            const cleanDetails =
                cleanString(
                    productDetails
                );

            const cleanMarketplace =
                cleanString(
                    marketplace
                ) ||
                "All Marketplaces";


            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";


            // ------------------------------------------------
            // SEO PROMPT
            // ------------------------------------------------

            const prompt = `

You are a HIGH-QUALITY E-COMMERCE SEO KEYWORD SPECIALIST.

Your job is to create genuinely useful search
keywords for the EXACT product supplied by the seller.

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
SEO RULES
==================================================

1. The MAIN KEYWORD MUST be returned exactly once.

2. The MAIN KEYWORD MUST be the first keyword.

3. Generate approximately 8 to 15 keywords
ONLY when enough genuinely useful keywords exist.

4. If fewer genuinely useful keywords exist,
return fewer.

5. NEVER create fake keywords just to reach 8 or 15.

6. Every keyword must be relevant to THIS exact product.

7. Keywords must sound like phrases a real buyer
could plausibly search.

8. Do NOT blindly combine words.

9. Do NOT simply add:
   online
   store
   collection
   fashion
   wear
   apparel
   shopping
   buy
   shop
   best
   premium
   trendy
   stylish
   latest
   sale
   deals
   wholesale

10. Those words may only appear when they form
a genuinely useful and natural search phrase
for the product.

11. Do NOT create:
   Product + Online
   Product + Store
   Product + Collection
   Product + Fashion
   Product + Wear
   Product + Apparel

just to create more keywords.

12. Do NOT repeat the same keyword.

13. Do NOT create tiny variations of the same keyword.

14. Brand must NOT be added to every keyword.

15. Brand may be used only when it creates
a genuinely useful buyer search phrase.

16. Category name must NOT automatically
become a keyword.

17. Do NOT add unsupported attributes.

18. If seller did not provide:
   color
   size
   material
   fabric
   gender
   pattern
   style
   compatibility
   capacity
   quantity
   ingredients
   model
   age
   features

   then DO NOT create keywords using them.

19. Do NOT invent:
   specifications
   benefits
   certifications
   compatibility
   medical claims
   performance claims
   warranty
   dimensions
   ingredients
   material
   quantity
   availability
   pricing

20. Use natural buyer-search phrases.

21. Prefer meaningful variations such as:
   product type
   supplied material
   supplied color
   supplied model
   supplied use
   supplied feature
   supplied audience
