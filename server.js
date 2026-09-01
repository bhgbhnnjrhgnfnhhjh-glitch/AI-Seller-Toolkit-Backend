// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 14.0
// ==========================================================
//
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// CATEGORY-AWARE + STRICT FACTUAL AI
//
// ==========================================================
// VERSION 14.0 SEO FIX
// ==========================================================
//
// IMPORTANT SEO BEHAVIOUR:
//
// Product Name:
//     Cotton Kurti
//
// Brand:
//     Test Brand
//
// Main Keyword:
//     EMPTY
//
// FINAL SEO:
//
//     1. Cotton Kurti
//
// NOT ALLOWED:
//
//     Test Brand Cotton Kurti
//     Test Brand Kurti
//     Kurti
//     Cotton Kurti Online
//     Best Cotton Kurti
//     Premium Cotton Kurti
//     Cotton Kurti Collection
//
// WHY:
//
// If seller provides no additional factual attributes,
// the system must NOT invent keyword variations.
//
// If seller provides:
//     Material: Cotton
//     Color: Blue
//     Size: M
//
// Then factual keywords can include:
//
//     Cotton Kurti
//     Blue Cotton Kurti
//     M Cotton Kurti
//
// Brand is NOT automatically used in SEO keywords.
//
// Brand can be used ONLY when Main Keyword explicitly
// contains the brand.
//
// Example:
//
// Product Name: Cotton Kurti
// Brand: Test Brand
// Main Keyword: Test Brand Cotton Kurti
//
// Then:
//
//     Test Brand Cotton Kurti
//
// can be the first keyword.
//
// ==========================================================
//
// ENDPOINTS
//
// GET
//   /
//   /api/status
//   /api/categories
//
// POST
//   /api/generate-title
//   /api/generate-description
//   /api/generate-listing
//   /api/generate-seo
//
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


// ==========================================================
// JSON BODY
// ==========================================================

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
    process.env.GEMINI_API_KEY || "";

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

    "fashion":
        "Fashion",

    "beauty":
        "Beauty",

    "electronics":
        "Electronics",

    "home kitchen":
        "Home & Kitchen",

    "home and kitchen":
        "Home & Kitchen",

    "home & kitchen":
        "Home & Kitchen",

    "shoes":
        "Shoes",

    "shoe":
        "Shoes",

    "jewellery":
        "Jewellery",

    "jewelry":
        "Jewellery",

    "toys":
        "Toys",

    "toy":
        "Toys",

    "books":
        "Books",

    "book":
        "Books",

    "pet":
        "Pet",

    "pets":
        "Pet",

    "sports":
        "Sports",

    "sport":
        "Sports",

    "automotive":
        "Automotive",

    "auto":
        "Automotive",

    "garden":
        "Garden",

    "gardening":
        "Garden",

    "food":
        "Food",

    "gifts":
        "Gifts",

    "gift":
        "Gifts"

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
// STRICT FACTUAL RULES
// ==========================================================

const STRICT_RULES = `

STRICT FACTUAL RULES:

1. केवल seller द्वारा दी गई information का उपयोग करो।

2. Missing information को कभी invent मत करो।

3. Fake specifications मत बनाओ।

4. Fake benefits मत बनाओ।

5. Fake certification मत बनाओ।

6. Fake reviews या ratings मत बनाओ।

7. Unsupported medical claims मत बनाओ।

8. Unsupported technical specifications मत बनाओ।

9. Unsupported dimensions मत बनाओ।

10. Unsupported compatibility मत बनाओ।

11. Unsupported warranty मत बनाओ।

12. Unsupported material मत बनाओ।

13. Unsupported quantity मत बनाओ।

14. Unsupported color, size, gender, model,
age, pattern या feature मत बनाओ।

15. Product को Best, No.1, Premium,
Guaranteed या 100% जैसा दावा मत दो
जब तक seller ने explicitly नहीं दिया हो।

16. Missing information को छोड़ दो।

17. Seller के facts का अर्थ बदलकर
गलत जानकारी मत बनाओ।

18. Marketplace-friendly लेकिन factual
language का उपयोग करो।

19. SEO के लिए भी केवल seller facts
का उपयोग करो।

20. Keyword बनाने के लिए काल्पनिक
attributes या benefits मत जोड़ो।

21. Brand को SEO keyword में अपने आप
मत जोड़ो।

22. Category को SEO keyword में अपने आप
मत जोड़ो।

23. Product Name के छोटे generic हिस्से को
SEO keyword मत बनाओ।

24. यदि अतिरिक्त factual attributes उपलब्ध
नहीं हैं तो केवल Product Name/Main Keyword
का उपयोग करो।

`;


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

    value =
        value
            .replace(
                /👗|💄|📱|🏠|👟|💍|🧸|📚|🐶|🏋️|🚗|🌱|🍎|🎁/gu,
                ""
            )
            .trim();

    if (
        CATEGORY_ALIASES[value]
    ) {

        return CATEGORY_ALIASES[value];

    }

    const found =
        CATEGORIES.find(
            item =>
                item.toLowerCase() ===
                value
        );

    return found || "";

}


// ==========================================================
// SAFE JSON PARSER
// ==========================================================

function safeJsonParse(text) {

    if (!text) {

        return null;

    }

    let cleaned =
        String(text)
            .trim();

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

        // Continue

    }

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
        catch (error) {

            // Continue

        }

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
        catch (error) {

            // Continue

        }

    }

    return null;

}


// ==========================================================
// GET TEXT FROM GEMINI INTERACTION
// ==========================================================

function getInteractionText(
    interaction
) {

    if (!interaction) {

        return "";

    }

    if (
        typeof interaction.output_text ===
            "string" &&
        interaction.output_text.trim()
    ) {

        return interaction.output_text
            .trim();

    }

    if (
        Array.isArray(
            interaction.output
        )
    ) {

        const textParts = [];

        for (
            const item of
            interaction.output
        ) {

            if (!item) {

                continue;

            }

            if (
                typeof item.text ===
                    "string"
            ) {

                textParts.push(
                    item.text
                );

            }

            if (
                Array.isArray(
                    item.content
                )
            ) {

                for (
                    const block of
                    item.content
                ) {

                    if (
                        block &&
                        typeof block.text ===
                            "string"
                    ) {

                        textParts.push(
                            block.text
                        );

                    }

                }

            }

        }

        if (
            textParts.length
        ) {

            return textParts
                .join("\n")
                .trim();

        }

    }

    if (
        Array.isArray(
            interaction.steps
        )
    ) {

        const textParts = [];

        for (
            const step of
            interaction.steps
        ) {

            if (
                !step ||
                !Array.isArray(
                    step.content
                )
            ) {

                continue;

            }

            for (
                const block of
                step.content
            ) {

                if (
                    block &&
                    block.type === "text" &&
                    typeof block.text ===
                        "string"
                ) {

                    textParts.push(
                        block.text
                    );

                }

            }

        }

        if (
            textParts.length
        ) {

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

async function callGemini(
    prompt
) {

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
// SEO TEXT NORMALIZATION
// ==========================================================

function normalizeSEOText(
    text
) {

    return cleanString(text)
        .toLowerCase()
        .replace(
            /[’']/g,
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
// SEO TOKEN SET
// ==========================================================

function seoTokenSet(
    text
) {

    const normalized =
        normalizeSEOText(
            text
        );

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

function seoSimilarity(
    a,
    b
) {

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

            if (
                B.has(token)
            ) {

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

function cleanSEOKeyword(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

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
// CHECK IF A TOKEN SET IS SUBSET
// ==========================================================

function isTokenSubset(
    smaller,
    larger
) {

    const smallSet =
        seoTokenSet(
            smaller
        );

    const largeSet =
        seoTokenSet(
            larger
        );

    if (
        !smallSet.size ||
        !largeSet.size
    ) {

        return false;

    }

    for (
        const token of
        smallSet
    ) {

        if (
            !largeSet.has(token)
        ) {

            return false;

        }

    }

    return true;

}


// ==========================================================
// BRAND KEYWORD CHECK
// ==========================================================
//
// IMPORTANT:
//
// If brand = Test Brand
//
// Keyword:
// Test Brand Kurti
//
// Main Keyword:
// Cotton Kurti
//
// => REJECT
//
// Keyword:
// Test Brand Cotton Kurti
//
// Main Keyword:
// Test Brand Cotton Kurti
//
// => ALLOW
//
// ==========================================================

function containsUnauthorizedBrand(
    keyword,
    brand,
    mainKeyword
) {

    const brandNormalized =
        normalizeSEOText(
            brand
        );

    if (!brandNormalized) {

        return false;

    }

    const keywordNormalized =
        normalizeSEOText(
            keyword
        );

    if (!keywordNormalized) {

        return false;

    }

    const mainNormalized =
        normalizeSEOText(
            mainKeyword
        );

    const keywordHasBrand =
        keywordNormalized.includes(
            brandNormalized
        );

    if (!keywordHasBrand) {

        return false;

    }

    // Brand is allowed only when
    // Main Keyword itself contains it.

    const mainHasBrand =
        mainNormalized.includes(
            brandNormalized
        );

    return !mainHasBrand;

}


// ==========================================================
// CATEGORY KEYWORD CHECK
// ==========================================================

function containsUnauthorizedCategory(
    keyword,
    category,
    productName,
    mainKeyword
) {

    const categoryNormalized =
        normalizeSEOText(
            category
        );

    if (!categoryNormalized) {

        return false;

    }

    const keywordNormalized =
        normalizeSEOText(
            keyword
        );

    const mainNormalized =
        normalizeSEOText(
            mainKeyword
        );

    const productNormalized =
        normalizeSEOText(
            productName
        );

    // For multi-word category such as
    // Home & Kitchen, compare normalized form.

    if (
        !keywordNormalized.includes(
            categoryNormalized
        )
    ) {

        return false;

    }

    // Category is allowed if explicitly
    // present in Main Keyword.

    if (
        mainNormalized.includes(
            categoryNormalized
        )
    ) {

        return false;

    }

    // Category is also allowed when it is
    // genuinely part of the Product Name.

    if (
        productNormalized.includes(
            categoryNormalized
        )
    ) {

        return false;

    }

    return true;

}


// ==========================================================
// PRODUCT SUBSET PROTECTION
// ==========================================================
//
// Example:
//
// Product Name:
// Cotton Kurti
//
// Reject:
// Kurti
//
// because "Kurti" is only a smaller subset
// of the seller's complete product name.
//
// This prevents very broad AI keywords.
//
// ==========================================================

function isTooGenericProductSubset(
    keyword,
    productName,
    mainKeyword
) {

    const keywordNormalized =
        normalizeSEOText(
            keyword
        );

    const productNormalized =
        normalizeSEOText(
            productName
        );

    const mainNormalized =
        normalizeSEOText(
            mainKeyword
        );

    if (
        !keywordNormalized ||
        !productNormalized
    ) {

        return false;

    }

    // Main keyword is always allowed.

    if (
        keywordNormalized ===
        mainNormalized
    ) {

        return false;

    }

    // Exact product name is allowed.

    if (
        keywordNormalized ===
        productNormalized
    ) {

        return false;

    }

    const productTokens =
        seoTokenSet(
            productName
        );

    const keywordTokens =
        seoTokenSet(
            keyword
        );

    // Only reject subsets when Product Name
    // has multiple meaningful words.

    if (
        productTokens.size < 2
    ) {

        return false;

    }

    if (
        keywordTokens.size >=
        productTokens.size
    ) {

        return false;

    }

    return isTokenSubset(
        keyword,
        productName
    );

}


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

    if (!normalizedKeyword) {

        return true;

    }

    const normalizedMain =
        normalizeSEOText(
            mainKeyword
        );

    if (
        normalizedKeyword ===
        normalizedMain
    ) {

        return false;

    }

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
                SEO_FILLER_WORDS.has(
                    token
                )
        )
    ) {

        return true;

    }

    let meaningful = 0;

    for (
        const token of
        tokens
    ) {

        if (
            productTokens.has(token) ||
            mainTokens.has(token) ||
            !SEO_FILLER_WORDS.has(token)
        ) {

            meaningful++;

        }

    }

    return meaningful === 0;

}


// ==========================================================
// SEO FILTER — VERSION 14
// ==========================================================
//
// This is the main SEO protection.
//
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

    const safeProductName =
        cleanSEOKeyword(
            productName
        );

    const safeMainKeyword =
        cleanSEOKeyword(
            mainKeyword ||
            productName
        );

    const mainNormalized =
        normalizeSEOText(
            safeMainKeyword
        );

    if (!safeProductName) {

        return [];

    }

    const sourceKeywords =
        Array.isArray(keywords)
            ? keywords
            : [];

    for (
        const raw of
        sourceKeywords
    ) {

        const keyword =
            cleanSEOKeyword(
                raw
            );

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

        // --------------------------------------------------
        // EXACT DUPLICATE
        // --------------------------------------------------

        if (
            seen.has(normalized)
        ) {

            continue;

        }

        // --------------------------------------------------
        // WORD COUNT
        // --------------------------------------------------

        const wordCount =
            normalized
                .split(" ")
                .filter(Boolean)
                .length;

        if (
            wordCount > 8
        ) {

            continue;

        }

        // --------------------------------------------------
        // MAIN KEYWORD
        // --------------------------------------------------

        const isMainKeyword =
            normalized ===
            mainNormalized;

        // --------------------------------------------------
        // EXACT PRODUCT NAME
        // --------------------------------------------------

        const isProductName =
            normalized ===
            normalizeSEOText(
                safeProductName
            );

        // --------------------------------------------------
        // BRAND PROTECTION
        // --------------------------------------------------

        if (
            containsUnauthorizedBrand(
                keyword,
                brand,
                safeMainKeyword
            )
        ) {

            continue;

        }

        // --------------------------------------------------
        // CATEGORY PROTECTION
        // --------------------------------------------------

        if (
            containsUnauthorizedCategory(
                keyword,
                category,
                safeProductName,
                safeMainKeyword
            )
        ) {

            continue;

        }

        // --------------------------------------------------
        // FILLER PROTECTION
        // --------------------------------------------------

        if (
            !isMainKeyword &&
            isMostlyFillerKeyword(
                keyword,
                safeProductName,
                safeMainKeyword
            )
        ) {

            continue;

        }

        // --------------------------------------------------
        // GENERIC PRODUCT SUBSET PROTECTION
        // --------------------------------------------------

        if (
            !isMainKeyword &&
            !isProductName &&
            isTooGenericProductSubset(
                keyword,
                safeProductName,
                safeMainKeyword
            )
        ) {

            continue;

        }

        // --------------------------------------------------
        // NEAR DUPLICATE
        // --------------------------------------------------

        const nearDuplicate =
            output.some(
                existing =>
                    seoSimilarity(
                        existing,
                        keyword
                    ) >= 0.80
            );

        if (
            nearDuplicate &&
            !isMainKeyword
        ) {

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


    // ======================================================
    // MAIN KEYWORD FIRST
    // ======================================================

    if (
        mainNormalized
    ) {

        const mainIndex =
            output.findIndex(
                item =>
                    normalizeSEOText(
                        item
                    ) ===
                    mainNormalized
            );

        if (
            mainIndex === -1
        ) {

            output.unshift(
                safeMainKeyword
            );

        }
        else if (
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

    }


    // ======================================================
    // FINAL SAFETY PASS
    // ======================================================

    const finalOutput = [];

    const finalSeen =
        new Set();

    for (
        const keyword of
        output
    ) {

        const normalized =
            normalizeSEOText(
                keyword
            );

        if (!normalized) {

            continue;

        }

        if (
            finalSeen.has(
                normalized
            )
        ) {

            continue;

        }

        finalSeen.add(
            normalized
        );

        finalOutput.push(
            keyword
        );

    }


    return finalOutput.slice(
        0,
        20
    );

}


// ==========================================================
// BUILD FACTUAL SEO KEYWORDS
// ==========================================================
//
// IMPORTANT:
//
// Fallback does NOT invent keywords.
//
// It creates keywords ONLY from:
//
// Product Name
// Main Keyword
// Material
// Fabric
// Color
// Size
// Pattern
// Model
// Type
// Sport
// Flavor
// Author
// Capacity
// etc.
//
// Brand is intentionally NOT included.
//
// ==========================================================

function buildFallbackKeywords(
    productName,
    brand,
    category,
    mainKeyword,
    details
) {

    const candidates = [];

    const safeProduct =
        cleanSEOKeyword(
            productName
        );

    const safeMain =
        cleanSEOKeyword(
            mainKeyword ||
            safeProduct
        );

    // ------------------------------------------------------
    // MAIN KEYWORD
    // ------------------------------------------------------

    if (safeMain) {

        candidates.push(
            safeMain
        );

    }

    // ------------------------------------------------------
    // PRODUCT NAME
    // ------------------------------------------------------

    if (
        safeProduct &&
        normalizeSEOText(
            safeProduct
        ) !==
        normalizeSEOText(
            safeMain
        )
    ) {

        candidates.push(
            safeProduct
        );

    }

    const attributeFields = [

        "material",
        "fabric",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "model",
        "capacity",
        "type",
        "sport",
        "flavor",
        "author",
        "language",
        "genre",
        "shade",
        "fragrance",
        "design",
        "closure",
        "sole",
        "stone",
        "plating",
        "ageRange",
        "petType",
        "packaging",
        "personalization",
        "sleeve",
        "neckline"

    ];

    // ------------------------------------------------------
    // FACTUAL ATTRIBUTE + PRODUCT
    // ------------------------------------------------------

    for (
        const field of
        attributeFields
    ) {

        const value =
            details &&
            details[field]
                ? cleanString(
                    details[field]
                )
                : "";

        if (!value) {

            continue;

        }

        // Do not create duplicate
        // attribute phrases.

        candidates.push(
            `${value} ${safeProduct}`
        );

    }

    return filterSEOKeywords(

        candidates,

        safeProduct,

        brand,

        category,

        safeMain

    );

}


// ==========================================================
// COLLECT PRODUCT DATA
// ==========================================================

function collectProductData(
    body,
    category
) {

    const b =
        body || {};

    const nestedDetails =
        b.productDetails &&
        typeof b.productDetails ===
            "object"
            ? b.productDetails
            : {};

    const fields = [

        "material",
        "fabric",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity",

        "model",
        "brand",

        "ingredients",
        "fragrance",
        "shade",

        "compatibility",
        "battery",
        "capacity",
        "ports",
        "power",

        "design",
        "usage",

        "closure",
        "sole",

        "stone",
        "plating",

        "ageRange",

        "author",
        "language",
        "genre",
        "edition",
        "publisher",
        "isbn",

        "petType",

        "sport",

        "vehicleCompatibility",

        "flavor",
        "packaging",

        "personalization",

        "sleeve",
        "neckline",

        "type"

    ];

    const data = {};

    for (
        const field of
        fields
    ) {

        let value =
            b[field];

        if (
            value ===
            undefined
        ) {

            value =
                nestedDetails[field];

        }

        if (
            cleanString(value)
        ) {

            data[field] =
                cleanString(value);

        }

    }

    data.category =
        category;

    data.productName =
        cleanString(
            b.productName ||
            b.product ||
            b.name
        );

    data.brand =
        cleanString(
            b.brand ||
            data.brand
        );

    data.price =
        cleanString(
            b.price
        );

    data.mainKeyword =
        cleanString(
            b.mainKeyword
        );

    data.targetMarketplace =
        cleanString(
            b.targetMarketplace ||
            b.marketplace
        );

    data.rawDetails =
        cleanString(
            typeof b.productDetails ===
                "string"
                ? b.productDetails
                : b.details
        );

    return data;

}


// ==========================================================
// PRODUCT FACTS TEXT
// ==========================================================

function productFactsText(
    data
) {

    const ignored =
        new Set([

            "category",
            "productName",
            "brand",
            "mainKeyword",
            "targetMarketplace",
            "rawDetails",
            "price"

        ]);

    const lines = [];

    for (
        const [
            key,
            value
        ] of Object.entries(data)
    ) {

        if (
            ignored.has(key)
        ) {

            continue;

        }

        if (
            cleanString(value)
        ) {

            lines.push(
                `${key}: ${value}`
            );

        }

    }

    if (
        data.rawDetails
    ) {

        lines.push(
            `seller product details: ${data.rawDetails}`
        );

    }

    if (
        !lines.length
    ) {

        return "No additional product facts supplied.";

    }

    return lines.join("\n");

}


// ==========================================================
// VALIDATE PRODUCT + CATEGORY
// ==========================================================

function requireProductAndCategory(
    req,
    res
) {

    const category =
        normalizeCategory(
            req.body &&
            req.body.category
        );

    const productName =
        cleanString(
            req.body &&
            (
                req.body.productName ||
                req.body.product ||
                req.body.name
            )
        );

    if (!category) {

        res.status(400).json({

            success: false,

            error:
                "Product category is required",

            categories:
                CATEGORIES

        });

        return null;

    }

    if (!productName) {

        res.status(400).json({

            success: false,

            error:
                "Product name is required"

        });

        return null;

    }

    return {

        category,
        productName

    };

}


// ==========================================================
// BASE AI PROMPT
// ==========================================================

function basePrompt(
    data,
    task
) {

    return `

You are the AI Seller Toolkit marketplace listing assistant.

TASK:
${task}

CATEGORY:
${data.category}

CATEGORY RULE:
${CATEGORY_RULES[data.category] ||
    "Use only seller-provided facts."}

${STRICT_RULES}

SELLER FACTS:

Product Name:
${data.productName}

Brand:
${data.brand || "Not provided"}

${productFactsText(data)}

Price:
${data.price || "Not provided"}

Target Marketplace:
${data.targetMarketplace || "Not provided"}

Main Keyword:
${data.mainKeyword || "Not provided"}

IMPORTANT:

- Product Name is a seller fact.
- Brand is a seller fact only when supplied.
- Category is classification information,
  not automatically a product attribute.
- Never convert missing information into
  a guessed attribute.
- Never add invented specifications.
- Never add invented benefits.
- Never add fake marketing claims.
- Never add brand to SEO keywords unless
  the seller explicitly used the brand in
  Main Keyword.
- Never make generic subsets of Product Name
  into separate SEO keywords.
- If only Product Name is available,
  returning only Product Name is correct.
`;

}


// ==========================================================
// GENERATE JSON
// ==========================================================

async function generateJSON(
    prompt
) {

    const text =
        await callGemini(
            prompt +
            `

RETURN ONLY VALID JSON.
DO NOT USE MARKDOWN.
DO NOT USE CODE FENCES.
`
        );

    const parsed =
        safeJsonParse(
            text
        );

    if (!parsed) {

        throw new Error(
            "AI response JSON invalid."
        );

    }

    return parsed;

}


// ==========================================================
// FALLBACK TITLE
// ==========================================================

function fallbackTitle(
    data
) {

    const product =
        cleanString(
            data.productName
        );

    const brand =
        cleanString(
            data.brand
        );

    if (
        brand &&
        normalizeSEOText(brand) !==
            normalizeSEOText(product)
    ) {

        return `${brand} ${product}`
            .trim()
            .slice(0, 200);

    }

    return product
        .slice(0, 200);

}


// ==========================================================
// FALLBACK DESCRIPTION
// ==========================================================

function fallbackDescription(
    data
) {

    const facts = [];

    if (
        data.brand
    ) {

        facts.push(
            `Brand: ${data.brand}`
        );

    }

    if (
        data.material ||
        data.fabric
    ) {

        facts.push(
            `Material: ${
                data.material ||
                data.fabric
            }`
        );

    }

    if (
        data.color
    ) {

        facts.push(
            `Color: ${data.color}`
        );

    }

    if (
        data.size
    ) {

        facts.push(
            `Size: ${data.size}`
        );

    }

    if (
        data.quantity
    ) {

        facts.push(
            `Quantity: ${data.quantity}`
        );

    }

    if (
        data.price
    ) {

        facts.push(
            `Price: ₹${data.price}`
        );

    }

    if (
        data.rawDetails
    ) {

        facts.push(
            data.rawDetails
        );

    }

    if (
        facts.length
    ) {

        return (
            `${data.productName} is listed with the seller-provided details below.\n\n` +
            facts.join("\n")
        );

    }

    return (
        `${data.productName} is available with the seller-provided product information.`
    );

}


// ==========================================================
// FALLBACK HIGHLIGHTS
// ==========================================================

function fallbackHighlights(
    data
) {

    const output = [];

    const mappings = [

        [
            "Brand",
            data.brand
        ],

        [
            "Material",
            data.material ||
            data.fabric
        ],

        [
            "Color",
            data.color
        ],

        [
            "Size",
            data.size
        ],

        [
            "Pattern",
            data.pattern
        ],

        [
            "Model",
            data.model
        ],

        [
            "Capacity",
            data.capacity
        ],

        [
            "Quantity",
            data.quantity
        ]

    ];

    for (
        const [
            label,
            value
        ] of mappings
    ) {

        if (value) {

            output.push(
                `${label}: ${value}`
            );

        }

    }

    return output.slice(
        0,
        8
    );

}


// ==========================================================
// GET /
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI Seller Toolkit Backend",

            version:
                "14.0",

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
// GET /api/status
// ==========================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI Seller Toolkit Backend",

            version:
                "14.0",

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
// GET /api/categories
// ==========================================================

app.get(
    "/api/categories",
    (req, res) => {

        res.json({

            success: true,

            categories:
                CATEGORIES,

            count:
                CATEGORIES.length

        });

    }
);


// ==========================================================
// POST /api/generate-title
// ==========================================================

app.post(
    "/api/generate-title",
    async (req, res) => {

        const required =
            requireProductAndCategory(
                req,
                res
            );

        if (!required) {

            return;

        }

        const data =
            collectProductData(
                req.body,
                required.category
            );

        try {

            const result =
                await generateJSON(

                    basePrompt(

                        data,

                        `
Create ONE clear marketplace product title.

Rules:

- Put the main product name first.
- Brand may be used only when supplied.
- Use only seller facts.
- Do not add unsupported adjectives.
- Do not add unsupported specifications.
- Do not add fake benefits.
- Keep title readable.
- Avoid unnecessary keyword stuffing.

Return exactly:

{
  "title": "..."
}
`

                    )

                );

            const title =
                cleanString(
                    result.title
                ) ||
                fallbackTitle(
                    data
                );

            res.json({

                success: true,

                title:
                    title,

                generatedTitle:
                    title

            });

        }
        catch (error) {

            console.error(
                "TITLE ERROR:",
                error.message
            );

            const title =
                fallbackTitle(
                    data
                );

            res.json({

                success: true,

                fallback: true,

                title:
                    title,

                generatedTitle:
                    title,

                warning:
                    "AI unavailable; factual fallback used."

            });

        }

    }
);


// ==========================================================
// POST /api/generate-description
// ==========================================================

app.post(
    "/api/generate-description",
    async (req, res) => {

        const required =
            requireProductAndCategory(
                req,
                res
            );

        if (!required) {

            return;

        }

        const data =
            collectProductData(
                req.body,
                required.category
            );

        try {

            const result =
                await generateJSON(

                    basePrompt(

                        data,

                        `
Create a concise marketplace product description.

Rules:

- Use only seller facts.
- Do not invent benefits.
- Do not invent specifications.
- Do not invent dimensions.
- Do not invent compatibility.
- Do not invent warranty.
- Do not invent certification.
- Do not make medical claims.
- Do not make exaggerated claims.
- Use natural marketplace language.

Return exactly:

{
  "description": "..."
}
`

                    )

                );

            const description =
                cleanString(
                    result.description
                ) ||
                fallbackDescription(
                    data
                );

            res.json({

                success: true,

                description:
                    description,

                generatedDescription:
                    description

            });

        }
        catch (error) {

            console.error(
                "DESCRIPTION ERROR:",
                error.message
            );

            const description =
                fallbackDescription(
                    data
                );

            res.json({

                success: true,

                fallback: true,

                description:
                    description,

                generatedDescription:
                    description,

                warning:
                    "AI unavailable; factual fallback used."

            });

        }

    }
);


// ==========================================================
// POST /api/generate-listing
// ==========================================================

app.post(
    "/api/generate-listing",
    async (req, res) => {

        const required =
            requireProductAndCategory(
                req,
                res
            );

        if (!required) {

            return;

        }

        const data =
            collectProductData(
                req.body,
                required.category
            );

        try {

            const result =
                await generateJSON(

                    basePrompt(

                        data,

                        `
Create a complete marketplace product listing.

Return exactly:

{
  "title": "...",
  "description": "...",
  "highlights": [
    "...",
    "..."
  ],
  "seoKeywords": [
    "...",
    "..."
  ]
}

Rules:

- Every field must be factual.
- Use only seller-provided facts.
- Missing facts must be omitted.
- Do not invent specifications.
- Do not invent benefits.
- Do not invent certifications.
- Do not invent compatibility.
- Do not invent dimensions.
- Do not invent warranty.
- Do not invent medical claims.
- SEO keywords must be relevant.
- Do not use brand unless explicitly
  present in Main Keyword.
- Do not create generic subsets
  of Product Name.
- Do not use filler SEO terms.
`

                    )

                );

            const title =
                cleanString(
                    result.title
                ) ||
                fallbackTitle(
                    data
                );

            const description =
                cleanString(
                    result.description
                ) ||
                fallbackDescription(
                    data
                );

            const highlights =
                Array.isArray(
                    result.highlights
                )

                    ? result.highlights
                        .map(
                            cleanString
                        )
                        .filter(Boolean)
                        .slice(0, 8)

                    : fallbackHighlights(
                        data
                    );

            const mainKeyword =
                cleanSEOKeyword(
                    data.mainKeyword ||
                    data.productName
                );

            const seoKeywords =
                filterSEOKeywords(

                    result.seoKeywords,

                    data.productName,

                    data.brand,

                    data.category,

                    mainKeyword

                );

            const finalKeywords =
                seoKeywords.length

                    ? seoKeywords

                    : buildFallbackKeywords(

                        data.productName,

                        data.brand,

                        data.category,

                        mainKeyword,

                        data

                    );

            res.json({

                success: true,

                title:
                    title,

                description:
                    description,

                highlights:
                    highlights,

                seoKeywords:
                    finalKeywords,

                keywords:
                    finalKeywords,

                generatedTitle:
                    title,

                generatedDescription:
                    description

            });

        }
        catch (error) {

            console.error(
                "LISTING ERROR:",
                error.message
            );

            const title =
                fallbackTitle(
                    data
                );

            const description =
                fallbackDescription(
                    data
                );

            const keywords =
                buildFallbackKeywords(

                    data.productName,

                    data.brand,

                    data.category,

                    data.mainKeyword ||
                        data.productName,

                    data

                );

            res.json({

                success: true,

                fallback: true,

                title:
                    title,

                description:
                    description,

                highlights:
                    fallbackHighlights(
                        data
                    ),

                seoKeywords:
                    keywords,

                keywords:
                    keywords,

                generatedTitle:
                    title,

                generatedDescription:
                    description,

                warning:
                    "AI unavailable; factual fallback used."

            });

        }

    }
);


// ==========================================================
// POST /api/generate-seo
// ==========================================================

app.post(
    "/api/generate-seo",
    async (req, res) => {

        const required =
            requireProductAndCategory(
                req,
                res
            );

        if (!required) {

            return;

        }

        const data =
            collectProductData(
                req.body,
                required.category
            );


        // ==================================================
        // MAIN KEYWORD
        // ==================================================

        const mainKeyword =
            cleanSEOKeyword(
                data.mainKeyword ||
                data.productName
            );


        // ==================================================
        // GENERATE SEO
        // ==================================================

        try {

            const result =
                await generateJSON(

                    basePrompt(

                        data,

                        `
Generate relevant factual SEO keywords.

IMPORTANT:

1. Main Keyword is optional.

2. If seller provides Main Keyword,
   use exactly that Main Keyword first.

3. If Main Keyword is empty,
   use exact Product Name first.

4. Maximum 20 keywords.

5. Do not repeat keywords.

6. Do not create near-duplicate keywords.

7. Do not create generic subsets of Product Name.

8. Do not use unnecessary Online.

9. Do not use unnecessary Store.

10. Do not use unnecessary Collection.

11. Do not use unnecessary Buy.

12. Do not use unnecessary Shop.

13. Do not use unnecessary Best.

14. Do not use unnecessary Premium.

15. DO NOT use Brand unless Brand is
    explicitly included in Main Keyword.

16. DO NOT create brand variations.

17. DO NOT create category stuffing.

18. DO NOT create unsupported attributes.

19. DO NOT invent material.

20. DO NOT invent color.

21. DO NOT invent size.

22. DO NOT invent model.

23. DO NOT invent compatibility.

24. DO NOT invent benefits.

25. If there are no additional factual
    attributes, it is acceptable to return
    only the Main Keyword/Product Name.

EXAMPLE:

Product Name:
Cotton Kurti

Brand:
Test Brand

Main Keyword:
Not provided

CORRECT:

{
  "mainKeyword": "Cotton Kurti",
  "keywords": [
    "Cotton Kurti"
  ]
}

WRONG:

{
  "mainKeyword": "Cotton Kurti",
  "keywords": [
    "Cotton Kurti",
    "Test Brand Cotton Kurti",
    "Test Brand Kurti",
    "Kurti",
    "Cotton Kurti Online",
    "Best Cotton Kurti"
  ]
}

ANOTHER EXAMPLE:

Product Name:
Cotton Kurti

Brand:
Test Brand

Material:
Cotton

Color:
Blue

Size:
M

Main Keyword:
Cotton Kurti

Possible factual keywords:

Cotton Kurti
Blue Cotton Kurti
M Cotton Kurti

Do not invent anything else.

Return exactly:

{
  "mainKeyword": "...",
  "keywords": [
    "...",
    "..."
  ]
}
`

                    )

                );


            // ==================================================
            // AI MAIN KEYWORD
            // ==================================================

            let aiMainKeyword =
                cleanSEOKeyword(
                    result.mainKeyword
                );

            if (!aiMainKeyword) {

                aiMainKeyword =
                    mainKeyword;

            }


            // ==================================================
            // MAIN KEYWORD SAFETY
            // ==================================================

            const safeMainKeyword =
                normalizeSEOText(
                    aiMainKeyword
                ) ===
                normalizeSEOText(
                    mainKeyword
                )

                    ? aiMainKeyword

                    : mainKeyword;


            // ==================================================
            // AI KEYWORDS
            // ==================================================

            const aiKeywords =
                Array.isArray(
                    result.keywords
                )
                    ? result.keywords
                    : [];


            // ==================================================
            // FILTER
            // ==================================================

            const filteredKeywords =
                filterSEOKeywords(

                    aiKeywords,

                    data.productName,

                    data.brand,

                    data.category,

                    safeMainKeyword

                );


            // ==================================================
            // FACTUAL FALLBACK
            // ==================================================

            const finalKeywords =
                filteredKeywords.length
                    ? filteredKeywords
                    : buildFallbackKeywords(

                        data.productName,

                        data.brand,

                        data.category,

                        safeMainKeyword,

                        data

                    );


            // ==================================================
            // FINAL ABSOLUTE SAFETY
            // ==================================================

            const absolutelySafeKeywords =
                filterSEOKeywords(

                    finalKeywords,

                    data.productName,

                    data.brand,

                    data.category,

                    safeMainKeyword

                );


            const outputKeywords =
                absolutelySafeKeywords.length
                    ? absolutelySafeKeywords
                    : [
                        safeMainKeyword
                    ];


            res.json({

                success: true,

                mainKeyword:
                    safeMainKeyword,

                keywords:
                    outputKeywords,

                seoKeywords:
                    outputKeywords,

                text:
                    outputKeywords.join(
                        ", "
                    ),

                count:
                    outputKeywords.length

            });

        }
        catch (error) {

            console.error(
                "SEO ERROR:",
                error.message
            );


            // ==================================================
            // AI FAILURE
            // ==================================================

            const fallbackKeywords =
                buildFallbackKeywords(

                    data.productName,

                    data.brand,

                    data.category,

                    mainKeyword,

                    data

                );


            const finalKeywords =
                fallbackKeywords.length
                    ? fallbackKeywords
                    : [
                        mainKeyword
                    ];


            res.json({

                success: true,

                fallback: true,

                mainKeyword:
                    mainKeyword,

                keywords:
                    finalKeywords,

                seoKeywords:
                    finalKeywords,

                text:
                    finalKeywords.join(
                        ", "
                    ),

                count:
                    finalKeywords.length,

                warning:
                    "AI unavailable; factual fallback used."

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
                "API endpoint not found",

            path:
                req.path

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
            "SERVER ERROR:",
            err
        );

        if (
            res.headersSent
        ) {

            return next(
                err
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
    () => {

        console.log(
            "=========================================================="
        );

        console.log(
            "AI SELLER TOOLKIT BACKEND"
        );

        console.log(
            "Version: 14.0"
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Gemini Model: ${MODEL}`
        );

        console.log(
            "Gemini API: " +
            (
                GEMINI_API_KEY
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            )
        );

        console.log(
            "API: Interactions API"
        );

        console.log(
            "Categories: " +
            CATEGORIES.length
        );

        console.log(
            "SEO Endpoint: /api/generate-seo"
        );

        console.log(
            "SEO Protection: VERSION 14.0"
        );

        console.log(
            "=========================================================="
        );

    }
);
