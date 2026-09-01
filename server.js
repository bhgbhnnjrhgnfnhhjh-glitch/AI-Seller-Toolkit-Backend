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
// FINAL SEO FIX
//
// IMPORTANT SEO CHANGES IN VERSION 14.0:
//
// 1. Product Name is always the first keyword.
// 2. Main Keyword is always the first keyword when supplied.
// 3. Valid Brand + Product keywords are ALLOWED.
// 4. Brand stuffing is allowed only when it forms a
//    meaningful product keyword.
// 5. Near-duplicate filter is much less aggressive.
// 6. Exact duplicates are removed.
// 7. Unsupported attributes are removed.
// 8. Filler-only keywords are removed.
// 9. Category-only stuffing is removed.
// 10. Maximum 20 keywords.
// 11. Stable fallback keywords.
// 12. SEO never invents gender, material, color, size,
//     model, compatibility, benefits or specifications.
// 13. Seller facts only.
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
// JSON
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

15. Best, No.1, Premium, Guaranteed,
100% जैसे claims मत जोड़ो जब तक seller
ने explicitly न दिया हो।

16. Missing information को छोड़ दो।

17. Seller facts का meaning बदलकर
गलत information मत बनाओ।

18. SEO में भी केवल seller facts का उपयोग करो।

19. Product Name को हमेशा factual source मानो।

20. Seller-provided Brand को product keyword
के साथ इस्तेमाल किया जा सकता है।

21. Brand + Product को automatically
brand stuffing मत समझो।

22. Product Name के meaningful variations
को automatically duplicate मत समझो।

23. SEO keyword में नया factual attribute
मत जोड़ो।

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
// GET GEMINI TEXT
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
// TOKEN OVERLAP
// ==========================================================

function tokenOverlap(
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


    let count = 0;


    for (
        const token of A
    ) {

        if (
            B.has(token)
        ) {

            count++;

        }

    }


    return count /
        Math.max(
            A.size,
            B.size
        );

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
// FILLER WORDS
// ==========================================================

const SEO_FILLER_WORDS =
    new Set([

        "online",
        "collection",
        "store",
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
// UNSUPPORTED MARKETING WORDS
// ==========================================================

const UNSUPPORTED_MARKETING_WORDS =
    new Set([

        "best",
        "premium",
        "guaranteed",
        "guarantee",
        "no1",
        "number1",
        "top",
        "amazing",
        "excellent",
        "super",
        "luxury",
        "highquality",
        "quality",
        "stylish",
        "trendy",
        "beautiful",
        "perfect",
        "original",
        "exclusive"

    ]);


// ==========================================================
// CHECK UNSUPPORTED MARKETING WORDS
// ==========================================================

function containsUnsupportedMarketingWord(
    keyword
) {

    const tokens =
        normalizeSEOText(
            keyword
        )
            .split(" ")
            .filter(Boolean);


    return tokens.some(
        token =>
            UNSUPPORTED_MARKETING_WORDS.has(
                token
            )
    );

}


// ==========================================================
// CHECK FILLER-ONLY KEYWORD
// ==========================================================

function isFillerOnlyKeyword(
    keyword,
    productName,
    mainKeyword,
    brand
) {

    const normalized =
        normalizeSEOText(
            keyword
        );


    if (!normalized) {

        return true;

    }


    const main =
        normalizeSEOText(
            mainKeyword
        );


    const product =
        normalizeSEOText(
            productName
        );


    const brandText =
        normalizeSEOText(
            brand
        );


    // Main keyword is always allowed.

    if (
        normalized === main
    ) {

        return false;

    }


    // Product name is always allowed.

    if (
        normalized === product
    ) {

        return false;

    }


    // Brand + product is allowed.

    if (
        brandText &&
        normalized.includes(
            brandText
        ) &&
        normalized.includes(
            product
        )
    ) {

        return false;

    }


    const tokens =
        normalized
            .split(" ")
            .filter(Boolean);


    if (!tokens.length) {

        return true;

    }


    const meaningful =
        tokens.filter(
            token =>
                !SEO_FILLER_WORDS.has(
                    token
                )
        );


    return meaningful.length === 0;

}


// ==========================================================
// VALID SELLER FACTS
// ==========================================================

function getSellerFactTerms(
    data
) {

    const values = [

        data.productName,
        data.brand,

        data.material,
        data.fabric,
        data.color,
        data.size,
        data.pattern,
        data.fit,
        data.occasion,
        data.quantity,

        data.model,

        data.ingredients,
        data.fragrance,
        data.shade,

        data.compatibility,
        data.battery,
        data.capacity,
        data.ports,
        data.power,

        data.design,
        data.usage,

        data.closure,
        data.sole,

        data.stone,
        data.plating,

        data.ageRange,

        data.author,
        data.language,
        data.genre,
        data.edition,
        data.publisher,
        data.isbn,

        data.petType,

        data.sport,

        data.vehicleCompatibility,

        data.flavor,
        data.packaging,

        data.personalization,

        data.sleeve,
        data.neckline,

        data.type

    ];


    return values
        .map(cleanString)
        .filter(Boolean);

}


// ==========================================================
// KEYWORD FACTUAL CHECK
// ==========================================================
//
// This is the main Version 14.0 SEO fix.
//
// A keyword is accepted when:
//
// A) It is exactly a seller fact, OR
// B) It contains words from seller facts, OR
// C) It is a combination of supplied seller facts.
//
// We do NOT require every keyword to be completely
// different from the product name.
//
// ==========================================================

function isFactuallyGroundedKeyword(
    keyword,
    data
) {

    const normalizedKeyword =
        normalizeSEOText(
            keyword
        );


    if (!normalizedKeyword) {

        return false;

    }


    const product =
        normalizeSEOText(
            data.productName
        );


    const brand =
        normalizeSEOText(
            data.brand
        );


    const main =
        normalizeSEOText(
            data.mainKeyword ||
            data.productName
        );


    // Main keyword

    if (
        normalizedKeyword === main
    ) {

        return true;

    }


    // Product name

    if (
        normalizedKeyword === product
    ) {

        return true;

    }


    // Brand + Product

    if (
        brand &&
        normalizedKeyword.includes(brand) &&
        normalizedKeyword.includes(product)
    ) {

        return true;

    }


    const keywordTokens =
        seoTokenSet(
            normalizedKeyword
        );


    if (!keywordTokens.size) {

        return false;

    }


    const sellerFacts =
        getSellerFactTerms(
            data
        );


    const factTokens =
        new Set();


    for (
        const fact of
        sellerFacts
    ) {

        const tokens =
            seoTokenSet(
                fact
            );

        for (
            const token of
            tokens
        ) {

            factTokens.add(
                token
            );

        }

    }


    if (!factTokens.size) {

        return false;

    }


    let groundedCount = 0;


    for (
        const token of
        keywordTokens
    ) {

        if (
            factTokens.has(token)
        ) {

            groundedCount++;

        }

    }


    // Every meaningful token should come from
    // seller-provided facts.

    return (
        groundedCount ===
        keywordTokens.size
    );

}


// ==========================================================
// SEO FILTER — VERSION 14.0
// ==========================================================

function filterSEOKeywords(
    keywords,
    data,
    mainKeyword
) {

    const output = [];

    const seen =
        new Set();


    const source =
        Array.isArray(keywords)
            ? keywords
            : [];


    // ------------------------------------------------------
    // Helper
    // ------------------------------------------------------

    function addKeyword(
        raw,
        force = false
    ) {

        const keyword =
            cleanSEOKeyword(
                raw
            );


        if (!keyword) {

            return;

        }


        const normalized =
            normalizeSEOText(
                keyword
            );


        if (!normalized) {

            return;

        }


        // Exact duplicate only.

        if (
            seen.has(normalized)
        ) {

            return;

        }


        const wordCount =
            normalized
                .split(" ")
                .filter(Boolean)
                .length;


        if (
            wordCount > 8
        ) {

            return;

        }


        // Unsupported marketing claims.

        if (
            !force &&
            containsUnsupportedMarketingWord(
                keyword
            )
        ) {

            return;

        }


        // Filler-only.

        if (
            !force &&
            isFillerOnlyKeyword(
                keyword,
                data.productName,
                mainKeyword,
                data.brand
            )
        ) {

            return;

        }


        // Must be based on seller facts.

        if (
            !force &&
            !isFactuallyGroundedKeyword(
                keyword,
                data
            )
        ) {

            return;

        }


        // --------------------------------------------------
        // IMPORTANT:
        //
        // Do NOT reject valid keywords simply because
        // they have high similarity with Product Name.
        //
        // Example:
        //
        // Cotton Kurti
        // Test Brand Cotton Kurti
        // Test Brand Kurti
        //
        // These can all be valid seller-fact keywords.
        // --------------------------------------------------


        seen.add(
            normalized
        );


        output.push(
            keyword
        );

    }


    // ------------------------------------------------------
    // MAIN KEYWORD FIRST
    // ------------------------------------------------------

    addKeyword(
        mainKeyword,
        true
    );


    // ------------------------------------------------------
    // PRODUCT NAME SECOND IF DIFFERENT
    // ------------------------------------------------------

    if (
        normalizeSEOText(
            data.productName
        ) !==
        normalizeSEOText(
            mainKeyword
        )
    ) {

        addKeyword(
            data.productName,
            true
        );

    }


    // ------------------------------------------------------
    // AI KEYWORDS
    // ------------------------------------------------------

    for (
        const keyword of
        source
    ) {

        if (
            output.length >= 20
        ) {

            break;

        }


        addKeyword(
            keyword
        );

    }


    return output.slice(
        0,
        20
    );

}


// ==========================================================
// FALLBACK SEO KEYWORDS — VERSION 14.0
// ==========================================================
//
// This fallback does NOT invent attributes.
//
// It creates only combinations from supplied facts.
//
// ==========================================================

function buildFallbackKeywords(
    data,
    mainKeyword
) {

    const candidates = [];


    const product =
        cleanString(
            data.productName
        );


    const brand =
        cleanString(
            data.brand
        );


    const main =
        cleanString(
            mainKeyword ||
            product
        );


    // ------------------------------------------------------
    // 1. Main keyword
    // ------------------------------------------------------

    if (main) {

        candidates.push(
            main
        );

    }


    // ------------------------------------------------------
    // 2. Exact Product Name
    // ------------------------------------------------------

    if (
        product &&
        normalizeSEOText(product) !==
            normalizeSEOText(main)
    ) {

        candidates.push(
            product
        );

    }


    // ------------------------------------------------------
    // 3. Brand + Product
    // ------------------------------------------------------

    if (
        brand &&
        product
    ) {

        candidates.push(
            `${brand} ${product}`
        );

    }


    // ------------------------------------------------------
    // 4. Brand + Main Keyword
    // ------------------------------------------------------

    if (
        brand &&
        main &&
        normalizeSEOText(main) !==
            normalizeSEOText(product)
    ) {

        candidates.push(
            `${brand} ${main}`
        );

    }


    // ------------------------------------------------------
    // 5. Seller fact combinations
    // ------------------------------------------------------

    const factMappings = [

        data.material,
        data.fabric,
        data.color,
        data.size,
        data.pattern,
        data.fit,
        data.occasion,
        data.model,
        data.capacity,
        data.sport,
        data.flavor,
        data.author,
        data.language,
        data.genre,
        data.petType,
        data.type

    ];


    for (
        const fact of
        factMappings
    ) {

        const cleanFact =
            cleanString(
                fact
            );


        if (
            !cleanFact ||
            !product
        ) {

            continue;

        }


        candidates.push(
            `${cleanFact} ${product}`
        );

    }


    // ------------------------------------------------------
    // Filter
    // ------------------------------------------------------

    return filterSEOKeywords(
        candidates,
        data,
        main
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
            value === undefined
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
// VALIDATE
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
// BASE PROMPT
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

- Product Name is always a seller fact.
- Brand is a seller fact when supplied.
- Category is classification information.
- Do not automatically turn category into
  a product attribute.
- Missing information must remain missing.
- Never invent facts.
- Never add unsupported marketing claims.

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


    if (data.brand) {

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


    if (data.color) {

        facts.push(
            `Color: ${data.color}`
        );

    }


    if (data.size) {

        facts.push(
            `Size: ${data.size}`
        );

    }


    if (data.quantity) {

        facts.push(
            `Quantity: ${data.quantity}`
        );

    }


    if (data.price) {

        facts.push(
            `Price: ₹${data.price}`
        );

    }


    if (data.rawDetails) {

        facts.push(
            data.rawDetails
        );

    }


    if (facts.length) {

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
- Do not exaggerate.

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
- Do not repeat exact keywords.
- Brand + Product is allowed when brand is supplied.
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

                    data,

                    mainKeyword

                );


            const finalKeywords =
                seoKeywords.length
                    ? seoKeywords
                    : buildFallbackKeywords(
                        data,
                        mainKeyword
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


            const mainKeyword =
                cleanSEOKeyword(
                    data.mainKeyword ||
                    data.productName
                );


            const keywords =
                buildFallbackKeywords(
                    data,
                    mainKeyword
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


        try {

            const result =
                await generateJSON(

                    basePrompt(

                        data,

                        `
Generate up to 20 factual SEO keywords.

MAIN KEYWORD RULE:

- If Main Keyword is supplied by seller,
  use it as the first keyword.
- If Main Keyword is empty,
  use the exact Product Name.
- Main Keyword must be first.

IMPORTANT SEO RULES:

1. Use only seller facts.
2. Product Name is always valid.
3. Seller-provided Brand is valid.
4. Brand + Product Name is allowed.
5. Brand + meaningful product phrase is allowed.
6. Do not invent gender.
7. Do not invent material.
8. Do not invent color.
9. Do not invent size.
10. Do not invent model.
11. Do not invent compatibility.
12. Do not invent benefits.
13. Do not invent specifications.
14. Do not use unsupported marketing claims.
15. Do not add unnecessary online/store/shop/buy words.
16. Do not repeat exact keywords.
17. Do not force 20 keywords if there are not
    enough factual keywords.
18. Prefer useful factual keyword variations.
19. A keyword can contain words from the
    Product Name and Brand.
20. Do not remove a valid Brand + Product
    keyword merely because it resembles the
    Product Name.

For example, if:

Product Name:
Cotton Kurti

Brand:
Test Brand

Valid examples include:

Cotton Kurti
Test Brand Cotton Kurti
Test Brand Kurti

Do NOT invent:

Women Cotton Kurti
Cotton Kurti for Women
Designer Cotton Kurti
Premium Cotton Kurti
Cotton Kurti Online

unless those facts were explicitly supplied.

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
            // FILTER
            // ==================================================

            const filteredKeywords =
                filterSEOKeywords(

                    result.keywords,

                    data,

                    safeMainKeyword

                );


            // ==================================================
            // FALLBACK
            // ==================================================

            let finalKeywords =
                filteredKeywords;


            if (
                !finalKeywords.length
            ) {

                finalKeywords =
                    buildFallbackKeywords(
                        data,
                        safeMainKeyword
                    );

            }


            // ==================================================
            // GUARANTEE MAIN KEYWORD
            // ==================================================

            if (
                !finalKeywords.length
            ) {

                finalKeywords = [
                    safeMainKeyword
                ];

            }


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


            // ==================================================
            // AI FAILURE FALLBACK
            // ==================================================

            let finalKeywords =
                buildFallbackKeywords(
                    data,
                    mainKeyword
                );


            if (
                !finalKeywords.length
            ) {

                finalKeywords = [
                    mainKeyword
                ];

            }


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
// 404
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
// GLOBAL ERROR
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
            "SEO Filter: VERSION 14.0"
        );

        console.log(
            "Brand + Product: ALLOWED"
        );

        console.log(
            "Near Duplicate Blocking: RELAXED"
        );

        console.log(
            "=========================================================="
        );

    }
);
