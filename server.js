// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 13.2
// ==========================================================
//
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// CATEGORY-AWARE + STRICT FACTUAL AI
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
// VERSION 13.2 FIXES
//
// SEO:
// - /api/generate-seo confirmed
// - Main Keyword optional
// - Product Name fallback
// - Main keyword first
// - Maximum 20 keywords
// - Duplicate protection
// - Near duplicate protection
// - Filler keyword protection
// - Brand stuffing protection
// - Category stuffing protection
// - Unsupported claims protection
// - Seller facts only
// - AI failure fallback
// - Stable JSON response
//
// GENERAL:
// - Stable CORS
// - Safe JSON parsing
// - Gemini Interactions API
// - Error handling
// - Health endpoint
// - Category normalization
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

    ai =
        new GoogleGenAI({
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
// CLEAN STRING
// ==========================================================

function cleanString(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value).trim();

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


    // Remove common category emojis
    value =
        value.replace(
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
                item.toLowerCase() === value
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

        return JSON.parse(
            cleaned
        );

    }
    catch (error) {
        // Continue below
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

        return interaction.output_text.trim();

    }


    if (
        Array.isArray(
            interaction.steps
        )
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
// SEO NORMALIZATION
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


    // Main keyword is always allowed
    if (
        normalizedKeyword ===
        normalizeSEOText(
            mainKeyword
        )
    ) {

        return false;

    }


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


    return meaningful === 0;

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


    const sourceKeywords =
        Array.isArray(keywords)
            ? keywords
            : [];


    for (
        const raw of sourceKeywords
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
                .filter(Boolean)
                .length;


        if (
            wordCount > 8
        ) {

            continue;

        }


        const isMainKeyword =
            normalized ===
            mainNormalized;


        // Main keyword must never be removed
        if (!isMainKeyword) {

            // Filler protection
            if (
                isMostlyFillerKeyword(
                    keyword,
                    productName,
                    mainKeyword
                )
            ) {

                continue;

            }


            // ------------------------------------------------
            // BRAND STUFFING
            // ------------------------------------------------

            if (
                brandNormalized &&
                normalized.includes(
                    brandNormalized
                )
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


                if (
                    withoutBrand ===
                    productNormalized
                ) {

                    continue;

                }

            }


            // ------------------------------------------------
            // CATEGORY STUFFING
            // ------------------------------------------------

            if (
                categoryNormalized &&
                normalized.includes(
                    categoryNormalized
                )
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


                if (
                    withoutCategory ===
                    productNormalized
                ) {

                    continue;

                }

            }

        }


        // ----------------------------------------------------
        // NEAR DUPLICATE PROTECTION
        // ----------------------------------------------------

        let nearDuplicate =
            false;


        for (
            const existing of output
        ) {

            const similarity =
                seoSimilarity(
                    keyword,
                    existing
                );


            if (
                similarity >= 0.80
            ) {

                nearDuplicate = true;

                break;

            }

        }


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


    return output;

}


// ==========================================================
// PRIORITIZE MAIN KEYWORD
// ==========================================================

function prioritizeMainKeyword(
    keywords,
    mainKeyword
) {

    const target =
        normalizeSEOText(
            mainKeyword
        );


    const index =
        keywords.findIndex(
            item =>
                normalizeSEOText(
                    item
                ) === target
        );


    if (
        index > 0
    ) {

        const item =
            keywords.splice(
                index,
                1
            )[0];


        keywords.unshift(
            item
        );

    }


    return keywords;

}


// ==========================================================
// SEO FALLBACK
// ==========================================================
//
// IMPORTANT:
// If Gemini temporarily fails, the SEO endpoint still
// returns a valid response based ONLY on seller input.
//
// This prevents the frontend button from appearing
// completely broken.
// ==========================================================

function createSEOFallback(
    productName,
    brand,
    category,
    mainKeyword
) {

    const base =
        cleanSEOKeyword(
            mainKeyword || productName
        );


    const product =
        cleanSEOKeyword(
            productName
        );


    const brandValue =
        cleanSEOKeyword(
            brand
        );


    const keywords = [];


    function add(value) {

        const cleaned =
            cleanSEOKeyword(
                value
            );


        if (!cleaned) {

            return;

        }


        const normalized =
            normalizeSEOText(
                cleaned
            );


        if (!normalized) {

            return;

        }


        if (
            keywords.some(
                item =>
                    normalizeSEOText(
                        item
                    ) === normalized
            )
        ) {

            return;

        }


        if (
            keywords.some(
                item =>
                    seoSimilarity(
                        item,
                        cleaned
                    ) >= 0.80
            )
        ) {

            return;

        }


        keywords.push(
            cleaned
        );

    }


    // Main keyword first
    add(base);


    // Product name
    if (
        normalizeSEOText(product) !==
        normalizeSEOText(base)
    ) {

        add(product);

    }


    // Brand + product only when brand is
    // explicitly supplied by seller.
    if (
        brandValue &&
        product
    ) {

        add(
            brandValue +
            " " +
            product
        );

    }


    // Category is NOT automatically combined
    // with product because that can create
    // unnecessary category stuffing.


    return keywords.slice(
        0,
        20
    );

}


// ==========================================================
// BUILD PRODUCT CONTEXT
// ==========================================================

function buildProductContext(
    body
) {

    const category =
        normalizeCategory(
            body.category
        );


    return {

        category:
            category,

        productName:
            cleanString(
                body.productName
            ),

        brand:
            cleanString(
                body.brand
            ),

        productDetails:
            cleanString(
                body.productDetails
            ),

        mainKeyword:
            cleanString(
                body.mainKeyword
            ),

        marketplace:
            cleanString(
                body.marketplace
            ),

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

        imageDescription:
            cleanString(
                body.imageDescription
            )

    };

}


// ==========================================================
// VALIDATE BASIC PRODUCT
// ==========================================================

function validateProduct(
    data
) {

    if (
        !data.productName
    ) {

        return "Product Name is required.";

    }


    if (
        !data.category
    ) {

        return "Product category is required.";

    }


    return "";

}


// ==========================================================
// GENERATE SEO PROMPT
// ==========================================================

function buildSEOPrompt(
    data
) {

    const categoryRule =
        CATEGORY_RULES[
            data.category
        ] || "";


    const mainKeyword =
        data.mainKeyword ||
        data.productName;


    return `

You are the SEO Keyword Generator for AI Seller Toolkit.

Generate ecommerce SEO keywords for the seller's product.

CATEGORY:
${data.category}

PRODUCT NAME:
${data.productName}

BRAND:
${data.brand || "Not provided"}

MAIN KEYWORD:
${mainKeyword}

PRODUCT DETAILS:
${data.productDetails || "Not provided"}

TARGET MARKETPLACE:
${data.marketplace || "Not specified"}

${categoryRule}

${STRICT_RULES}

SEO RULES:

1. Return ONLY a JSON object.

2. Exact format:

{
  "keywords": [
    "keyword 1",
    "keyword 2"
  ]
}

3. Generate between 8 and 20 useful keywords when possible.

4. The first keyword MUST be the Main Keyword.

5. If Main Keyword was not supplied,
   use Product Name as Main Keyword.

6. Use only facts explicitly supplied by the seller.

7. Do not invent attributes.

8. Do not invent colors.

9. Do not invent sizes.

10. Do not invent materials.

11. Do not invent compatibility.

12. Do not invent benefits.

13. Do not invent certifications.

14. Do not invent gender.

15. Do not invent age.

16. Do not invent model numbers.

17. Do not invent technical specifications.

18. Do not create fake long-tail keywords
    using
