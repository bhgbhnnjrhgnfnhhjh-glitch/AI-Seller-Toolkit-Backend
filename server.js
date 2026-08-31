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
// - No incomplete functions
// - No incomplete braces
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
            apiKey:
                GEMINI_API_KEY
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


    // Remove common category emojis

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


    // Direct output_text

    if (
        typeof interaction.output_text ===
            "string" &&
        interaction.output_text.trim()
    ) {

        return interaction.output_text
            .trim();

    }


    // Interaction output array

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


    // Older / alternate interaction steps

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


    if (!normalizedKeyword) {

        return true;

    }


    const normalizedMain =
        normalizeSEOText(
            mainKeyword
        );


    // Main keyword is always allowed

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


    // Example:
    // Cotton Kurti Online
    //
    // Cotton + Kurti = valid product words
    // Online = filler
    //
    // Reject.

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


    const brandNormalized =
        normalizeSEOText(
            brand
        );


    const categoryNormalized =
        normalizeSEOText(
            category
        );


    const productNormalized =
        normalizeSEOText(
            productName
        );


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


            // Example:
            // Test Brand Kurti
            //
            // If Product Name = Kurti
            // reject unnecessary brand stuffing.

            if (
                !withoutBrand ||
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


            // Reject category-only stuffing

            if (
                !withoutCategory ||
                withoutCategory ===
                    productNormalized
            ) {

                continue;

            }

        }


        // --------------------------------------------------
        // NEAR DUPLICATE PROTECTION
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


    // ------------------------------------------------------
    // MAIN KEYWORD FIRST
    // ------------------------------------------------------

    if (
        mainNormalized
    ) {

        const mainExists =
            output.some(
                item =>
                    normalizeSEOText(
                        item
                    ) ===
                    mainNormalized
            );


        if (!mainExists) {

            output.unshift(
                cleanSEOKeyword(
                    mainKeyword
                )
            );

        }
        else {

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

        }

    }


    return output.slice(
        0,
        20
    );

}


// ==========================================================
// FALLBACK KEYWORDS
// ==========================================================

function buildFallbackKeywords(
    productName,
    brand,
    category,
    mainKeyword,
    details
) {

    const candidates = [];


    if (
        mainKeyword
    ) {

        candidates.push(
            mainKeyword
        );

    }


    if (
        productName
    ) {

        candidates.push(
            productName
        );

    }


    if (
        details.material
    ) {

        candidates.push(
            `${details.material} ${productName}`
        );

    }


    if (
        details.fabric
    ) {

        candidates.push(
            `${details.fabric} ${productName}`
        );

    }


    if (
        details.color
    ) {

        candidates.push(
            `${details.color} ${productName}`
        );

    }


    if (
        details.size
    ) {

        candidates.push(
            `${details.size} ${productName}`
        );

    }


    if (
        details.pattern
    ) {

        candidates.push(
            `${details.pattern} ${productName}`
        );

    }


    if (
        details.model
    ) {

        candidates.push(
            `${details.model} ${productName}`
        );

    }


    if (
        details.type
    ) {

        candidates.push(
            `${details.type} ${productName}`
        );

    }


    if (
        details.sport
    ) {

        candidates.push(
            `${details.sport} ${productName}`
        );

    }


    if (
        details.flavor
    ) {

        candidates.push(
            `${details.flavor} ${productName}`
        );

    }


    if (
        details.author
    ) {

        candidates.push(
            `${details.author} ${productName}`
        );

    }


    return filterSEOKeywords(
        candidates,
        productName,
        brand,
        category,
        mainKeyword || productName
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
                "13.2",

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
                "13.2",

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
- Avoid duplicate keywords.
- Avoid artificial keyword stuffing.
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
                cleanString(
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


        // --------------------------------------------------
        // MAIN KEYWORD
        // --------------------------------------------------

        const mainKeyword =
            cleanSEOKeyword(
                data.mainKeyword ||
                data.productName
            );


        try {

            const result =
                await generateJSON(

                    basePrompt(

                        data,

                        `
Generate up to 20 relevant SEO keywords.

IMPORTANT:

1. Main Keyword is optional.
2. If seller provides Main Keyword,
   use it.
3. If Main Keyword is missing,
   use the exact Product Name.
4. Main Keyword MUST be the first keyword.
5. Maximum 20 keywords.
6. Do not repeat keywords.
7. Do not create near-duplicate keywords.
8. Do not use unnecessary "Online".
9. Do not use unnecessary "Store".
10. Do not use unnecessary "Collection".
11. Do not use unnecessary "Buy".
12. Do not use unnecessary "Shop".
13. Do not use unnecessary "Best".
14. Do not use unnecessary "Premium".
15. Do not stuff the brand.
16. Do not stuff the category.
17. Do not invent product attributes.
18. Do not invent material.
19. Do not invent color.
20. Do not invent size.
21. Do not invent model.
22. Do not invent compatibility.
23. Do not invent benefits.
24. Use only seller facts.

Return exactly:

{
  "mainKeyword": "...",
  "keywords": [
    "...",
    "...",
    "..."
  ]
}
`

                    )

                );


            let aiMainKeyword =
                cleanSEOKeyword(
                    result.mainKeyword
                );


            if (!aiMainKeyword) {

                aiMainKeyword =
                    mainKeyword;

            }


            // --------------------------------------------------
            // MAIN KEYWORD SAFETY
            // --------------------------------------------------

            const safeMainKeyword =
                normalizeSEOText(
                    aiMainKeyword
                ) ===
                normalizeSEOText(
                    mainKeyword
                )

                    ? aiMainKeyword

                    : mainKeyword;


            // --------------------------------------------------
            // FILTER AI KEYWORDS
            // --------------------------------------------------

            const filteredKeywords =
                filterSEOKeywords(

                    result.keywords,

                    data.productName,

                    data.brand,

                    data.category,

                    safeMainKeyword

                );


            // --------------------------------------------------
            // FALLBACK
            // --------------------------------------------------

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


            res.json({

                success: true,

                mainKeyword:
                    safeMainKeyword,

                keywords:
                    finalKeywords,

                seoKeywords:
                    finalKeywords,

                text:
                    finalKeywords.join(
                        ", "
                    ),

                count:
                    finalKeywords.length

            });

        }
        catch (error) {

            console.error(
                "SEO ERROR:",
                error.message
            );


            // --------------------------------------------------
            // AI FAILURE FALLBACK
            // --------------------------------------------------

            const finalKeywords =
                buildFallbackKeywords(

                    data.productName,

                    data.brand,

                    data.category,

                    mainKeyword,

                    data

                );


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
            "Version: 13.2"
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
            "=========================================================="
        );

    }
);
