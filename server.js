// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 14.2
// ==========================================================
//
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// CATEGORY-AWARE + STRICT FACTUAL AI
//
// FINAL 14.2 SEO STABILITY
//
// IMPORTANT SEO FIX:
// - SEO no longer depends only on Gemini keyword count
// - Deterministic factual keyword builder added
// - Product Name always primary keyword
// - Seller facts can create factual keyword combinations
// - No invented gender / occasion / features / benefits
// - No brand stuffing
// - No product fragments
// - No duplicate keywords
// - No near duplicates
// - No generic filler keywords
// - Maximum 20 keywords
// - Main keyword always first
//
// OTHER ENDPOINTS:
// /api/generate-title
// /api/generate-description
// /api/generate-listing
// /api/generate-seo
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
// STRICT RULES
// ==========================================================

const STRICT_RULES = `

STRICT FACTUAL RULES:

1. केवल seller द्वारा दी गई information का उपयोग करो।
2. Missing information कभी invent मत करो।
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
   100% जैसे claims मत जोड़ो।
16. Missing information को छोड़ दो।
17. Seller facts का अर्थ बदलकर गलत जानकारी मत बनाओ।
18. Marketplace-friendly factual language रखो।
19. SEO में भी केवल seller facts का उपयोग करो।
20. Keyword बनाने के लिए imaginary attributes मत जोड़ो।

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

        return JSON.parse(cleaned);

    }
    catch (error) {
        // continue
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
            // continue
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
            // continue
        }

    }

    return null;

}


// ==========================================================
// GEMINI RESPONSE TEXT
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
        Array.isArray(interaction.output)
    ) {

        const textParts = [];

        for (
            const item of interaction.output
        ) {

            if (!item) {
                continue;
            }

            if (
                typeof item.text === "string"
            ) {

                textParts.push(
                    item.text
                );

            }

            if (
                Array.isArray(item.content)
            ) {

                for (
                    const block of item.content
                ) {

                    if (
                        block &&
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

    if (
        Array.isArray(interaction.steps)
    ) {

        const textParts = [];

        for (
            const step of interaction.steps
        ) {

            if (
                !step ||
                !Array.isArray(step.content)
            ) {

                continue;

            }

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
// SEO NORMALIZATION
// ==========================================================

function normalizeSEOText(text) {

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

    return (
        intersection /
        union
    );

}


// ==========================================================
// CLEAN SEO KEYWORD
// ==========================================================

function cleanSEOKeyword(value) {

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
// GENERIC FILLER
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
// PRODUCT FRAGMENT CHECK
// ==========================================================

function isProductFragment(
    keyword,
    productName
) {

    const keywordTokens =
        seoTokenSet(
            keyword
        );

    const productTokens =
        seoTokenSet(
            productName
        );

    if (
        !keywordTokens.size ||
        !productTokens.size
    ) {

        return false;

    }

    if (
        normalizeSEOText(keyword) ===
        normalizeSEOText(productName)
    ) {

        return false;

    }

    if (
        keywordTokens.size === 1 &&
        productTokens.size > 1
    ) {

        for (
            const token of keywordTokens
        ) {

            if (
                productTokens.has(token)
            ) {

                return true;

            }

        }

    }

    return false;

}


// ==========================================================
// EFFECTIVE BRAND
// ==========================================================

function cleanEffectiveBrand(
    brand,
    productName
) {

    const b =
        normalizeSEOText(
            brand
        );

    const p =
        normalizeSEOText(
            productName
        );

    if (!b) {
        return "";
    }

    if (
        p &&
        b.includes(p)
    ) {

        return b
            .replace(
                p,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }

    return b;

}


// ==========================================================
// BRAND STUFFING
// ==========================================================

function isBrandStuffedKeyword(
    keyword,
    brand,
    productName
) {

    const effectiveBrand =
        cleanEffectiveBrand(
            brand,
            productName
        );

    if (!effectiveBrand) {
        return false;
    }

    const B =
        seoTokenSet(
            effectiveBrand
        );

    const K =
        seoTokenSet(
            keyword
        );

    if (
        !B.size ||
        !K.size
    ) {

        return false;

    }

    let count = 0;

    B.forEach(
        token => {

            if (K.has(token)) {
                count++;
            }

        }
    );

    return (
        count === B.size
    );

}


// ==========================================================
// MOSTLY FILLER
// ==========================================================

function isMostlyFillerKeyword(
    keyword,
    productName,
    mainKeyword
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

    if (
        normalized === main
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
        normalized
            .split(" ")
            .filter(Boolean);

    if (!tokens.length) {
        return true;
    }

    const meaningful =
        tokens.filter(
            token =>
                !SEO_FILLER_WORDS.has(token)
        );

    if (!meaningful.length) {
        return true;
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

    return false;

}


// ==========================================================
// MAIN KEYWORD SAFETY
// ==========================================================

function sanitizeMainKeyword(
    mainKeyword,
    productName,
    brand
) {

    const product =
        cleanSEOKeyword(
            productName
        );

    if (!product) {
        return "";
    }

    const main =
        cleanSEOKeyword(
            mainKeyword
        );

    if (!main) {
        return product;
    }

    const mainNormalized =
        normalizeSEOText(
            main
        );

    const productNormalized =
        normalizeSEOText(
            product
        );

    if (
        mainNormalized ===
        productNormalized
    ) {

        return product;

    }

    if (
        isProductFragment(
            main,
            product
        )
    ) {

        return product;

    }

    const effectiveBrand =
        cleanEffectiveBrand(
            brand,
            product
        );

    const brandNormalized =
        normalizeSEOText(
            effectiveBrand
        );

    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return product;

    }

    return main;

}


// ==========================================================
// FILTER SEO KEYWORDS
// ==========================================================

function filterSEOKeywords(
    keywords,
    productName,
    brand,
    category,
    mainKeyword
) {

    const output = [];
    const seen = new Set();

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword,
            productName,
            brand
        );

    const mainNormalized =
        normalizeSEOText(
            safeMain
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

        if (
            seen.has(normalized)
        ) {
            continue;
        }

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

        const isMain =
            normalized ===
            mainNormalized;

        if (
            !isMain &&
            isProductFragment(
                keyword,
                productName
            )
        ) {

            continue;

        }

        if (
            !isMain &&
            isBrandStuffedKeyword(
                keyword,
                brand,
                productName
            )
        ) {

            continue;

        }

        if (
            !isMain &&
            isMostlyFillerKeyword(
                keyword,
                productName,
                safeMain
            )
        ) {

            continue;

        }

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
            !isMain
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


    // Main keyword always first.

    const finalMain =
        safeMain ||
        cleanSEOKeyword(
            productName
        );

    const finalMainNormalized =
        normalizeSEOText(
            finalMain
        );

    const existingIndex =
        output.findIndex(
            item =>
                normalizeSEOText(item) ===
                finalMainNormalized
        );

    if (
        existingIndex >= 0
    ) {

        const item =
            output.splice(
                existingIndex,
                1
            )[0];

        output.unshift(
            item
        );

    }
    else if (
        finalMain
    ) {

        output.unshift(
            finalMain
        );

    }

    return output.slice(
        0,
        20
    );

}


// ==========================================================
// FACTUAL SEO KEYWORD BUILDER — VERSION 14.2
// ==========================================================
//
// THIS IS THE MAIN FIX.
//
// Gemini may return only one keyword.
// Therefore backend creates additional keywords
// ONLY from facts explicitly supplied by seller.
//
// Example:
//
// Product:
// Cotton Kurti
//
// Material:
// Cotton
//
// Color:
// Blue
//
// Size:
// M
//
// Possible factual keywords:
//
// Cotton Kurti
// Cotton Cotton Kurti      -> blocked
// Blue Cotton Kurti
// M Cotton Kurti
//
// No invented:
// Women Cotton Kurti
// Party Wear Cotton Kurti
// Stylish Cotton Kurti
//
// ==========================================================

function buildFactualSEOKeywords(
    data,
    mainKeyword
) {

    const product =
        cleanSEOKeyword(
            data.productName
        );

    if (!product) {
        return [];
    }

    const candidates = [];

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword ||
            product,
            product,
            data.brand
        );

    // ------------------------------------------------------
    // PRIMARY
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
        normalizeSEOText(safeMain) !==
        normalizeSEOText(product)
    ) {

        candidates.push(
            product
        );

    }

    // ------------------------------------------------------
    // FACTUAL FIELD ORDER
    // ------------------------------------------------------

    const fields = [

        "material",
        "fabric",

        "color",

        "size",

        "pattern",

        "fit",

        "sleeve",

        "neckline",

        "model",

        "type",

        "capacity",

        "power",

        "ports",

        "compatibility",

        "ingredients",

        "fragrance",

        "shade",

        "design",

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

        "usage",

        "quantity"

    ];


    // ------------------------------------------------------
    // ONE FACT + PRODUCT
    // ------------------------------------------------------

    const factualValues = [];

    for (
        const field of fields
    ) {

        const value =
            cleanSEOKeyword(
                data[field]
            );

        if (!value) {
            continue;
        }

        factualValues.push({
            field,
            value
        });

        candidates.push(
            `${value} ${product}`
        );

    }


    // ------------------------------------------------------
    // TWO FACTS + PRODUCT
    // ------------------------------------------------------

    for (
        let i = 0;
        i < factualValues.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < factualValues.length;
            j++
        ) {

            const first =
                factualValues[i].value;

            const second =
                factualValues[j].value;

            if (
                normalizeSEOText(first) ===
                normalizeSEOText(second)
            ) {

                continue;

            }

            candidates.push(
                `${first} ${second} ${product}`
            );

            if (
                candidates.length >= 40
            ) {

                break;

            }

        }

        if (
            candidates.length >= 40
        ) {

            break;

        }

    }


    // ------------------------------------------------------
    // BRAND + PRODUCT
    // ------------------------------------------------------
    //
    // Brand is NOT automatically added.
    // Only use it when it is a clean separate brand
    // and does not contain the product name.
    //
    // This prevents:
    //
    // Test Brand Cotton Kurti
    //
    // from becoming:
    //
    // Test Brand Cotton Kurti Cotton Kurti
    //
    // ------------------------------------------------------

    const brand =
        cleanSEOKeyword(
            data.brand
        );

    const effectiveBrand =
        cleanEffectiveBrand(
            brand,
            product
        );

    if (
        effectiveBrand &&
        normalizeSEOText(effectiveBrand) !==
        normalizeSEOText(product)
    ) {

        // Do NOT automatically add brand keyword.
        // Brand-containing keywords are intentionally
        // avoided for SEO stability.

    }


    // ------------------------------------------------------
    // FINAL FILTER
    // ------------------------------------------------------

    return filterSEOKeywords(

        candidates,

        product,

        brand,

        data.category,

        safeMain

    );

}


// ==========================================================
// FALLBACK SEO KEYWORDS
// ==========================================================

function buildFallbackKeywords(
    productName,
    brand,
    category,
    mainKeyword,
    data
) {

    const safeData =
        data || {

            productName,
            brand,
            category

        };

    return buildFactualSEOKeywords(

        safeData,

        mainKeyword ||
        productName

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
        typeof b.productDetails === "object"
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
        const field of fields
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
            typeof b.productDetails === "string"
                ? b.productDetails
                : b.details
        );

    return data;

}


// ==========================================================
// PRODUCT FACTS TEXT
// ==========================================================

function productFactsText(data) {

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

    if (!lines.length) {

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
- Brand is a seller fact only when supplied.
- Category is classification information.
- Never turn category into a product attribute.
- Never invent missing information.
- Never create unsupported gender.
- Never create unsupported occasion.
- Never create unsupported quality claims.
- Never create unsupported features.

`;

}


// ==========================================================
// GENERATE JSON
// ==========================================================

async function generateJSON(prompt) {

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

function fallbackTitle(data) {

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

function fallbackDescription(data) {

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

function fallbackHighlights(data) {

    const output = [];

    const mappings = [

        ["Brand", data.brand],

        [
            "Material",
            data.material ||
            data.fabric
        ],

        ["Color", data.color],

        ["Size", data.size],

        ["Pattern", data.pattern],

        ["Model", data.model],

        ["Capacity", data.capacity],

        ["Quantity", data.quantity]

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
                "14.2",

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

            seoVersion:
                "14.2",

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
                "14.2",

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

            seoVersion:
                "14.2",

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
                CATEGORIES,

            count:
                CATEGORIES.length

        });

    }
);


// ==========================================================
// GENERATE TITLE
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
- Avoid keyword stuffing.

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
                fallbackTitle(data);

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
                fallbackTitle(data);

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
// GENERATE DESCRIPTION
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
                fallbackDescription(data);

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
                fallbackDescription(data);

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
// GENERATE LISTING
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
- Use only seller facts.
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
- Avoid keyword stuffing.
`

                    )

                );

            const title =
                cleanString(
                    result.title
                ) ||
                fallbackTitle(data);

            const description =
                cleanString(
                    result.description
                ) ||
                fallbackDescription(data);

            const highlights =
                Array.isArray(
                    result.highlights
                )
                    ? result.highlights
                        .map(cleanString)
                        .filter(Boolean)
                        .slice(0, 8)
                    : fallbackHighlights(data);


            // ==================================================
            // SEO 14.2
            // ==================================================

            const mainKeyword =
                sanitizeMainKeyword(

                    data.mainKeyword ||
                    data.productName,

                    data.productName,

                    data.brand

                );


            let keywords =
                filterSEOKeywords(

                    result.seoKeywords,

                    data.productName,

                    data.brand,

                    data.category,

                    mainKeyword

                );


            // If AI gives only one keyword,
            // supplement from factual seller data.

            if (
                keywords.length <= 1
            ) {

                const factualKeywords =
                    buildFactualSEOKeywords(
                        data,
                        mainKeyword
                    );

                keywords =
                    filterSEOKeywords(

                        [
                            ...keywords,
                            ...factualKeywords
                        ],

                        data.productName,

                        data.brand,

                        data.category,

                        mainKeyword

                    );

            }


            // Final deterministic fallback.

            if (
                !keywords.length
            ) {

                keywords =
                    buildFallbackKeywords(

                        data.productName,

                        data.brand,

                        data.category,

                        mainKeyword,

                        data

                    );

            }


            res.json({

                success: true,

                title:
                    title,

                description:
                    description,

                highlights:
                    highlights,

                seoKeywords:
                    keywords,

                keywords:
                    keywords,

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
                fallbackTitle(data);

            const description =
                fallbackDescription(data);

            const mainKeyword =
                sanitizeMainKeyword(

                    data.mainKeyword ||
                    data.productName,

                    data.productName,

                    data.brand

                );

            const keywords =
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

                title:
                    title,

                description:
                    description,

                highlights:
                    fallbackHighlights(data),

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
// GENERATE SEO — FINAL VERSION 14.2
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


        // ====================================================
        // SAFE MAIN KEYWORD
        // ====================================================

        const mainKeyword =
            sanitizeMainKeyword(

                data.mainKeyword ||
                data.productName,

                data.productName,

                data.brand

            );


        try {

            const result =
                await generateJSON(

                    basePrompt(

                        data,

                        `
Generate SEO keywords for this product.

IMPORTANT:

The keyword list must contain multiple useful
keywords ONLY when multiple factual variations
are possible from seller-provided information.

Product Name is the primary identity.

Rules:

1. Main keyword must be Product Name unless
   seller supplied a valid different main keyword.
2. Never invent gender.
3. Never invent occasion.
4. Never invent material.
5. Never invent color.
6. Never invent size.
7. Never invent pattern.
8. Never invent features.
9. Never invent compatibility.
10. Never invent benefits.
11. Never use generic filler.
12. Never use online unless supplied.
13. Never use buy unless supplied.
14. Never use shop unless supplied.
15. Never use best unless supplied.
16. Never use premium unless supplied.
17. Never create one-word product fragments.
18. Never repeat keywords.
19. Never create near duplicates.
20. Maximum 20 keywords.
21. Main keyword must be first.
22. If only one factual keyword is possible,
    one keyword is acceptable.
23. Do not create fake variations merely to
    increase keyword count.

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


            // =================================================
            // AI MAIN KEYWORD
            // =================================================

            const aiMainKeyword =
                cleanSEOKeyword(
                    result.mainKeyword
                );


            const safeAIKeyword =
                sanitizeMainKeyword(

                    aiMainKeyword ||
                    mainKeyword,

                    data.productName,

                    data.brand

                );


            // =================================================
            // AI KEYWORDS
            // =================================================

            let filteredKeywords =
                filterSEOKeywords(

                    result.keywords,

                    data.productName,

                    data.brand,

                    data.category,

                    safeAIKeyword

                );


            // =================================================
            // IMPORTANT 14.2 FIX
            //
            // If Gemini returns only one keyword,
            // generate additional keywords locally
            // from factual seller information.
            // =================================================

            if (
                filteredKeywords.length <= 1
            ) {

                const factualKeywords =
                    buildFactualSEOKeywords(

                        data,

                        safeAIKeyword

                    );

                filteredKeywords =
                    filterSEOKeywords(

                        [
                            ...filteredKeywords,
                            ...factualKeywords
                        ],

                        data.productName,

                        data.brand,

                        data.category,

                        safeAIKeyword

                    );

            }


            // =================================================
            // FINAL FALLBACK
            // =================================================

            if (
                !filteredKeywords.length
            ) {

                filteredKeywords =
                    buildFallbackKeywords(

                        data.productName,

                        data.brand,

                        data.category,

                        safeAIKeyword,

                        data

                    );

            }


            // =================================================
            // FINAL MAIN
            // =================================================

            const finalMain =
                sanitizeMainKeyword(

                    safeAIKeyword,

                    data.productName,

                    data.brand

                );


            // =================================================
            // FINAL KEYWORD SAFETY
            // =================================================

            let finalKeywords =
                filterSEOKeywords(

                    filteredKeywords,

                    data.productName,

                    data.brand,

                    data.category,

                    finalMain

                );


            // =================================================
            // FACTUAL SUPPLEMENT AGAIN
            // =================================================

            if (
                finalKeywords.length <= 1
            ) {

                const factual =
                    buildFactualSEOKeywords(

                        data,

                        finalMain

                    );

                finalKeywords =
                    filterSEOKeywords(

                        [
                            ...finalKeywords,
                            ...factual
                        ],

                        data.productName,

                        data.brand,

                        data.category,

                        finalMain

                    );

            }


            // =================================================
            // MAXIMUM 20
            // =================================================

            finalKeywords =
                finalKeywords.slice(
                    0,
                    20
                );


            // =================================================
            // RESPONSE
            // =================================================

            res.json({

                success: true,

                version:
                    "14.2",

                mainKeyword:
                    finalMain,

                keywords:
                    finalKeywords,

                seoKeywords:
                    finalKeywords,

                text:
                    finalKeywords.join(", "),

                count:
                    finalKeywords.length

            });

        }
        catch (error) {

            console.error(
                "SEO ERROR:",
                error.message
            );


            // =================================================
            // NO AI DEPENDENCY IN ERROR
            // =================================================

            const finalMain =
                sanitizeMainKeyword(

                    mainKeyword,

                    data.productName,

                    data.brand

                );


            const finalKeywords =
                buildFallbackKeywords(

                    data.productName,

                    data.brand,

                    data.category,

                    finalMain,

                    data

                );


            res.json({

                success: true,

                fallback: true,

                version:
                    "14.2",

                mainKeyword:
                    finalMain,

                keywords:
                    finalKeywords,

                seoKeywords:
                    finalKeywords,

                text:
                    finalKeywords.join(", "),

                count:
                    finalKeywords.length,

                warning:
                    "AI unavailable; factual SEO fallback used."

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

            return next(err);

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
            "Version: 14.2"
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
            "SEO: FINAL 14.2"
        );

        console.log(
            "SEO: Deterministic factual keyword builder ENABLED"
        );

        console.log(
            "SEO Endpoint: /api/generate-seo"
        );

        console.log(
            "=========================================================="
        );

    }
);
