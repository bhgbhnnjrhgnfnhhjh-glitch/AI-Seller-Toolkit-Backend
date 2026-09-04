// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 13.0
// Category-Aware + Strict Factual AI
// Gemini Interactions API
// Advanced SEO Attribute Engine
// Backward-Compatible Endpoints
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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const VERSION = "13.0";

let ai = null;

if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    });
}

// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({
    limit: "2mb"
}));

// ==========================================================
// 14 REQUIRED CATEGORIES
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
// CATEGORY RULES
// ==========================================================

const categoryRules = {

    "Fashion": `
Product type, fabric/material, color, size, pattern/design,
fit, occasion, quantity and brand may be used only when seller
provided them.

Never invent gender, fabric, color, size, pattern, fit,
occasion, comfort, quality, certification or features.
`,

    "Beauty": `
Product type, form/texture, shade/color, quantity, variant,
ingredients, skin type, hair type, fragrance, brand and
seller-provided features may be used.

Never invent ingredients, benefits, medical claims,
treatment results, certifications or performance.
`,

    "Electronics": `
Product type, brand, model, color, storage, RAM, battery,
connectivity, compatibility, warranty, quantity and features
may be used only when provided.

Never invent technical specifications.
`,

    "Home & Kitchen": `
Product type, material, color, size, dimensions, capacity,
quantity, usage and seller-provided features may be used.

Never invent capacity, dimensions, material, leak-proof,
BPA-free, heat-resistance or similar claims.
`,

    "Shoes": `
Product type, size, color, material, sole type, closure,
style, quantity, brand and seller-provided features may be used.

Never invent size, material, sole type, comfort or durability.
`,

    "Jewellery": `
Product type, material, color, design, size, stone/gemstone,
quantity, brand and seller-provided features may be used.

Never claim gold, silver, diamond, gemstone, purity or precious
metal unless explicitly supplied by the seller.
`,

    "Toys": `
Product type, age range, material, size, quantity and features
may be used only when seller provided them.

Never invent age suitability, safety certification,
educational claims or safety claims.
`,

    "Books": `
Book title, author, pages, format, edition, quantity, language,
genre, publisher, ISBN and brand may be used only when provided.

Never invent author, pages, edition, publisher, language or ISBN.
`,

    "Pet": `
Product type, pet type, material, size, quantity, color,
compatibility, usage and features may be used only when provided.

Never invent pet suitability, health benefits, safety
or compatibility.
`,

    "Sports": `
Product type, material, size, weight, quantity, usage,
included items and features may be used only when provided.

Never invent performance claims, weight or included accessories.
`,

    "Automotive": `
Product type, vehicle compatibility, material, size, model,
part number, quantity and features may be used only when provided.

Never invent vehicle compatibility, part number, installation
requirements or technical specifications.
`,

    "Garden": `
Product type, material, size, quantity, color, usage,
compatibility and features may be used only when provided.

Never invent capacity, durability, chemical properties,
plant suitability or performance.
`,

    "Food": `
Product type, quantity, flavor, ingredients, packaging,
variant and brand may be used only when provided.

Never invent ingredients, nutrition, health benefits,
expiry date, certifications or dietary claims.
`,

    "Gifts": `
Product type, material, color, size, quantity, occasion,
included items and features may be used only when provided.

Never invent included items, material, occasion,
personalization or features.
`
};

// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(value) {

    const text = cleanText(value)
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const map = {

        "fashion": "Fashion",
        "fashion & clothing": "Fashion",
        "fashion and clothing": "Fashion",
        "clothing": "Fashion",

        "beauty": "Beauty",
        "personal care": "Beauty",

        "electronics": "Electronics",
        "electronic": "Electronics",

        "home & kitchen": "Home & Kitchen",
        "home and kitchen": "Home & Kitchen",
        "home kitchen": "Home & Kitchen",

        "shoes": "Shoes",
        "shoe": "Shoes",
        "footwear": "Shoes",

        "jewellery": "Jewellery",
        "jewelry": "Jewellery",

        "toys": "Toys",
        "toy": "Toys",
        "toys & kids": "Toys",
        "toys and kids": "Toys",

        "books": "Books",
        "book": "Books",
        "books & stationery": "Books",

        "pet": "Pet",
        "pets": "Pet",
        "pet supplies": "Pet",

        "sports": "Sports",
        "sport": "Sports",
        "sports & fitness": "Sports",
        "fitness": "Sports",

        "automotive": "Automotive",
        "automotive & accessories": "Automotive",
        "auto": "Automotive",
        "car": "Automotive",

        "garden": "Garden",
        "gardening": "Garden",

        "food": "Food",
        "foods": "Food",
        "grocery": "Food",
        "grocery & food": "Food",

        "gifts": "Gifts",
        "gift": "Gifts"
    };

    return map[text] || "";
}

// ==========================================================
// BASIC HELPERS
// ==========================================================

function cleanText(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .replace(/\u0000/g, "")
        .trim();
}

// ==========================================================
// SEO CLEANER
// ==========================================================

function cleanSEOKeyword(value) {

    return cleanText(value)
        .replace(/[\r\n]+/g, " ")
        .replace(/\s+/g, " ")
        .replace(/^[\s,;|]+|[\s,;|]+$/g, "")
        .trim();
}

// ==========================================================
// UNIQUE STRINGS
// ==========================================================

function uniqueStrings(values) {

    const result = [];
    const seen = new Set();

    for (const value of values || []) {

        const text = cleanText(value);

        if (!text) continue;

        const key = text
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

        if (seen.has(key)) continue;

        seen.add(key);
        result.push(text);
    }

    return result;
}

// ==========================================================
// SMART SEO TOKENIZER
//
// Important:
// 300 ml  -> one token
// 200 g   -> one token
// 8 inch  -> one token
// 50 pieces -> one token
// 750 ml -> one token
// ==========================================================

function seoTokens(value) {

    const text = cleanSEOKeyword(value)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!text) return [];

    const raw = text.split(" ");
    const tokens = [];

    for (let i = 0; i < raw.length; i++) {

        const current = raw[i];
        const next = raw[i + 1] || "";

        if (
            /^\d+(?:\.\d+)?$/.test(current) &&
            /^(?:ml|l|g|kg|mg|mm|cm|m|inch|in|ft|feet|piece|pieces|pc|pcs|pack|packs|set|sets)$/i.test(next)
        ) {

            tokens.push(
                `${current} ${next}`
            );

            i++;
            continue;
        }

        tokens.push(current);
    }

    return tokens;
}

// ==========================================================
// NORMALIZE WORDS
// ==========================================================

function normalizeWords(value) {
    return seoTokens(value);
}

// ==========================================================
// PUSH KEYWORD
// ==========================================================

function pushKeyword(list, value) {

    const keyword = cleanSEOKeyword(value);

    if (!keyword) return;

    const key = keyword
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    if (
        !list.some(item =>
            item
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim() === key
        )
    ) {
        list.push(keyword);
    }
}

// ==========================================================
// SELLER FACT COLLECTION
// ==========================================================

function collectSellerFacts(body) {

    const facts = [];

    const fields = [

        "brand",
        "material",
        "fabric",
        "color",
        "size",
        "pattern",
        "design",
        "fit",
        "occasion",
        "quantity",

        "model",
        "connectivity",
        "compatibility",
        "capacity",
        "battery",
        "storage",
        "ram",
        "processor",

        "ingredients",
        "fragrance",
        "shade",
        "skinType",
        "hairType",

        "author",
        "language",
        "genre",
        "edition",
        "publisher",
        "isbn",

        "petType",
        "sport",

        "vehicleCompatibility",
        "sole",
        "soleType",
        "closure",
        "stone",
        "plating",

        "ageRange",

        "flavor",
        "usage",
        "weight",
        "dimensions",
        "packaging",
        "variant",
        "format",
        "pages",
        "includedItems",
        "warranty",

        "features",
        "productFeatures",
        "productDetails",
        "extraInfo"
    ];

    for (const field of fields) {

        const value = cleanText(body[field]);

        if (value) {
            pushKeyword(facts, value);
        }
    }

    if (
        body.categoryData &&
        typeof body.categoryData === "object"
    ) {

        for (const value of Object.values(body.categoryData)) {

            const text = cleanText(value);

            if (text) {
                pushKeyword(facts, text);
            }
        }
    }

    return facts;
}

// ==========================================================
// FIND TOKEN SEQUENCE
// ==========================================================

function findSequence(
    sourceTokens,
    targetTokens
) {

    if (
        !sourceTokens.length ||
        !targetTokens.length
    ) {
        return -1;
    }

    for (
        let i = 0;
        i <= sourceTokens.length - targetTokens.length;
        i++
    ) {

        let matched = true;

        for (
            let j = 0;
            j < targetTokens.length;
            j++
        ) {

            if (
                sourceTokens[i + j] !==
                targetTokens[j]
            ) {

                matched = false;
                break;
            }
        }

        if (matched) return i;
    }

    return -1;
}

// ==========================================================
// EXTRACT INLINE SELLER ATTRIBUTES
// ==========================================================

function extractInlineSEOAttributes(
    mainKeyword,
    productName,
    brand
) {

    const source = normalizeWords(mainKeyword);
    const product = normalizeWords(productName);

    if (
        !source.length ||
        !product.length
    ) {

        return {
            descriptors: [],
            prefix: [],
            suffix: []
        };
    }

    const start = findSequence(
        source,
        product
    );

    let prefix = [];
    let suffix = [];
    let remaining = [];

    if (start >= 0) {

        prefix = source.slice(
            0,
            start
        );

        suffix = source.slice(
            start + product.length
        );

        remaining = [
            ...prefix,
            ...suffix
        ];

    } else {

        remaining = [...source];

        for (const token of product) {

            const index =
                remaining.indexOf(token);

            if (index >= 0) {
                remaining.splice(index, 1);
            }
        }
    }

    const brandTokens =
        normalizeWords(brand);

    for (const token of brandTokens) {

        const index =
            remaining.indexOf(token);

        if (index >= 0) {
            remaining.splice(index, 1);
        }
    }

    return {

        descriptors:
            uniqueStrings(remaining),

        prefix,

        suffix
    };
}

// ==========================================================
// MEASUREMENT DETECTOR
// ==========================================================

function isMeasurementToken(token) {

    return /^\d+(?:\.\d+)?\s+(?:ml|l|g|kg|mg|mm|cm|m|inch|in|ft|feet|piece|pieces|pc|pcs|pack|packs|set|sets)$/i
        .test(cleanSEOKeyword(token));
}

// ==========================================================
// INLINE SEO KEYWORDS
//
// Natural combinations only.
// No random word order.
// ==========================================================

function buildInlineSEOKeywords(
    mainKeyword,
    productName,
    brand
) {

    const result = [];

    const source =
        cleanSEOKeyword(mainKeyword);

    const product =
        cleanSEOKeyword(productName);

    if (!source || !product) {
        return result;
    }

    const sourceTokens =
        normalizeWords(source);

    const productTokens =
        normalizeWords(product);

    if (
        !sourceTokens.length ||
        !productTokens.length
    ) {
        return result;
    }

    // Seller's exact main keyword.
    pushKeyword(
        result,
        source
    );

    // Base product.
    pushKeyword(
        result,
        product
    );

    const inline =
        extractInlineSEOAttributes(
            source,
            product,
            brand
        );

    const descriptors =
        inline.descriptors || [];

    if (!descriptors.length) {
        return result;
    }

    const productHead =
        productTokens[
            productTokens.length - 1
        ];

    const productPrefix =
        productTokens
            .slice(0, -1)
            .join(" ");

    // Separate measurements from normal descriptors.

    const normalDescriptors =
        descriptors.filter(
            item => !isMeasurementToken(item)
        );

    const measurements =
        descriptors.filter(
            item => isMeasurementToken(item)
        );

    // ======================================================
    // MEASUREMENTS
    //
    // Product + measurement
    // ======================================================

    for (const measurement of measurements) {

        pushKeyword(
            result,
            `${product} ${measurement}`
        );
    }

    // ======================================================
    // SINGLE NATURAL DESCRIPTORS
    // ======================================================

    for (
        const descriptor
        of normalDescriptors.slice(0, 4)
    ) {

        pushKeyword(
            result,
            `${descriptor} ${product}`
        );
    }

    // ======================================================
    // TWO DESCRIPTOR COMBINATIONS
    // Preserve seller order.
    // ======================================================

    for (
        let i = 0;
        i < normalDescriptors.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < normalDescriptors.length;
            j++
        ) {

            const first =
                normalDescriptors[i];

            const second =
                normalDescriptors[j];

            pushKeyword(
                result,
                `${first} ${second} ${product}`
            );
        }
    }

    // ======================================================
    // FULL DESCRIPTOR + PRODUCT HEAD
    //
    // Example:
    // Blue Floral Print Kurti
    // ======================================================

    if (
        normalDescriptors.length >= 2
    ) {

        pushKeyword(
            result,
            `${normalDescriptors.join(" ")} ${productHead}`
        );
    }

    // ======================================================
    // PRODUCT PREFIX + DESCRIPTORS + PRODUCT HEAD
    //
    // Example:
    // Cotton Floral Print Kurti
    // ======================================================

    if (
        productPrefix &&
        normalDescriptors.length >= 2
    ) {

        pushKeyword(
            result,
            `${productPrefix} ${normalDescriptors.join(" ")} ${productHead}`
        );
    }

    // ======================================================
    // DESCRIPTOR PAIRS + PRODUCT HEAD
    //
    // Example:
    // Floral Print Kurti
    // ======================================================

    if (
        normalDescriptors.length >= 2
    ) {

        for (
            let i = 0;
            i < normalDescriptors.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < normalDescriptors.length;
                j++
            ) {

                pushKeyword(
                    result,
                    `${normalDescriptors[i]} ${normalDescriptors[j]} ${productHead}`
                );
            }
        }
    }

    // ======================================================
    // PRODUCT + MEASUREMENT + DESCRIPTOR
    //
    // Only when measurement exists.
    // ======================================================

    if (
        measurements.length &&
        normalDescriptors.length
    ) {

        for (
            const measurement
            of measurements
        ) {

            pushKeyword(
                result,
                `${product} ${measurement}`
            );
        }
    }

    return uniqueStrings(result);
}

// ==========================================================
// FACTUAL SEO BUILDER
// ==========================================================

function buildFactualSEOKeywords(
    mainKeyword,
    productName,
    facts,
    body = {}
) {

    const result = [];

    const product =
        cleanSEOKeyword(productName);

    const main =
        cleanSEOKeyword(mainKeyword);

    const brand =
        cleanSEOKeyword(body.brand);

    // ======================================================
    // 1. INLINE SELLER ATTRIBUTES
    // ======================================================

    for (
        const keyword
        of buildInlineSEOKeywords(
            main,
            product,
            brand
        )
    ) {

        pushKeyword(
            result,
            keyword
        );
    }

    // ======================================================
    // 2. STRUCTURED FACTS
    // ======================================================

    const usefulFacts =
        Array.isArray(facts)
            ? facts
            : [];

    const nonBrandFacts =
        usefulFacts.filter(fact => {

            const value =
                cleanSEOKeyword(fact);

            if (!value) return false;

            if (!brand) return true;

            return (
                value.toLowerCase() !==
                brand.toLowerCase()
            );
        });

    // Avoid using long sentences as keyword fragments.

    for (
        const fact
        of nonBrandFacts
    ) {

        const cleanFact =
            cleanSEOKeyword(fact);

        if (!cleanFact) continue;

        const factTokens =
            normalizeWords(cleanFact);

        if (!factTokens.length) continue;

        // Skip extremely long text fields.
        if (
            factTokens.length > 6 &&
            !factTokens.some(isMeasurementToken)
        ) {
            continue;
        }

        const measurementOnly =
            factTokens.length === 1 &&
            isMeasurementToken(
                factTokens[0]
            );

        if (measurementOnly) {

            pushKeyword(
                result,
                `${product} ${cleanFact}`
            );

            continue;
        }

        // Natural fact + product.
        pushKeyword(
            result,
            `${cleanFact} ${product}`
        );

        // If fact itself contains measurement,
        // product + fact is also useful.
        if (
            factTokens.some(
                isMeasurementToken
            )
        ) {

            pushKeyword(
                result,
                `${product} ${cleanFact}`
            );
        }
    }

    // ======================================================
    // 3. BRAND
    //
    // Only:
    // Brand + Product
    //
    // Never:
    // Product + Brand
    // ======================================================

    if (brand) {

        pushKeyword(
            result,
            `${brand} ${product}`
        );
    }

    return uniqueStrings(result)
        .slice(0, 40);
}

// ==========================================================
// SEO BLOCKED WORDS
// ==========================================================

const SEO_BLOCKED_WORDS = new Set([

    "online",
    "buy",
    "shop",
    "shopping",

    "best",
    "premium",
    "trendy",
    "stylish",
    "latest",
    "cheap",

    "price",
    "collection",
    "store",

    "apparel",
    "wear",

    "guaranteed",
    "guarantee",

    "original",
    "top",

    "number one",
    "no 1",
    "no.1"
]);

// ==========================================================
// BLOCKED SEO WORD CHECK
// ==========================================================

function containsBlockedSEOWord(
    keyword
) {

    const lower =
        cleanSEOKeyword(keyword)
            .toLowerCase();

    for (
        const blocked
        of SEO_BLOCKED_WORDS
    ) {

        if (
            lower === blocked ||
            lower.includes(` ${blocked} `) ||
            lower.startsWith(`${blocked} `) ||
            lower.endsWith(` ${blocked}`)
        ) {

            return true;
        }
    }

    return false;
}

// ==========================================================
// PRODUCT RELEVANCE
// ==========================================================

function keywordContainsProduct(
    keyword,
    productName
) {

    const keywordTokens =
        new Set(
            normalizeWords(keyword)
        );

    const productTokens =
        normalizeWords(productName);

    if (!productTokens.length) {
        return false;
    }

    // At least one meaningful product token.
    return productTokens.some(
        token => keywordTokens.has(token)
    );
}

// ==========================================================
// MEASUREMENT VALIDATION
//
// Reject:
// 300 Cotton Kurti
// ml Cotton Kurti
// 200 Peanuts
// g Peanuts
//
// Accept:
// 300 ml Cotton Kurti
// Cotton Kurti 300 ml
// 200 g Peanuts
// ==========================================================

function hasBrokenMeasurement(
    keyword
) {

    const clean =
        cleanSEOKeyword(keyword);

    const raw =
        clean
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

    for (
        let i = 0;
        i < raw.length;
        i++
    ) {

        const token = raw[i];

        if (
            /^\d+(?:\.\d+)?$/.test(token)
        ) {

            const next =
                raw[i + 1] || "";

            if (
                !/^(?:ml|l|g|kg|mg|mm|cm|m|inch|in|ft|feet|piece|pieces|pc|pcs|pack|packs|set|sets)$/i
                    .test(next)
            ) {

                return true;
            }
        }

        if (
            /^(?:ml|l|g|kg|mg|mm|cm|m|inch|in|ft|feet|piece|pieces|pc|pcs|pack|packs|set|sets)$/i
                .test(token)
        ) {

            const previous =
                raw[i - 1] || "";

            if (
                !/^\d+(?:\.\d+)?$/.test(previous)
            ) {

                return true;
            }
        }
    }

    return false;
}

// ==========================================================
// UNNATURAL BRAND PLACEMENT
// ==========================================================

function hasUnnaturalBrandPlacement(
    keyword,
    brand
) {

    const cleanKeyword =
        cleanSEOKeyword(keyword);

    const cleanBrand =
        cleanSEOKeyword(brand);

    if (
        !cleanKeyword ||
        !cleanBrand
    ) {
        return false;
    }

    const lowerKeyword =
        cleanKeyword.toLowerCase();

    const lowerBrand =
        cleanBrand.toLowerCase();

    // Brand at end = unnatural for our SEO engine.
    if (
        lowerKeyword.endsWith(
            ` ${lowerBrand}`
        )
    ) {

        return true;
    }

    return false;
}

// ==========================================================
// BAD CHARACTER TYPO DETECTOR
//
// Protects against common AI corruption such as:
// pIastic
// pIant
// ==========================================================

function hasBadCharacterTypo(
    keyword
) {

    const value =
        cleanSEOKeyword(keyword);

    if (!value) return false;

    return (
        /\bpIastic\b/.test(value) ||
        /\bpIant\b/.test(value)
    );
}

// ==========================================================
// UNSAFE / WEAK LEADING WORDS
// ==========================================================

const SEO_WEAK_LEADING_WORDS = new Set([

    "with",
    "and",
    "for",
    "of",

    "print",
    "design",
    "style",

    "charging",
    "case",

    "pieces",
    "piece",

    "ml",
    "l",
    "g",
    "kg",
    "mg",

    "mm",
    "cm",

    "inch",
    "in",
    "ft",

    "pack",
    "packs",
    "set",
    "sets"
]);

// ==========================================================
// SELLER WORD SUPPORT
//
// AI is not allowed to introduce unrelated words.
// ==========================================================

function buildSupportedSEOTokens(
    mainKeyword,
    productName,
    brand,
    facts
) {

    const supported = new Set();

    const sources = [

        mainKeyword,
        productName,
        brand,

        ...(Array.isArray(facts)
            ? facts
            : [])
    ];

    for (
        const source
        of sources
    ) {

        for (
            const token
            of normalizeWords(source)
        ) {

            supported.add(
                token.toLowerCase()
            );
        }
    }

    return supported;
}

// ==========================================================
// AI KEYWORD SELLER FACT CHECK
// ==========================================================

function usesOnlySellerWords(
    keyword,
    supportedTokens
) {

    const tokens =
        normalizeWords(keyword);

    if (!tokens.length) {
        return false;
    }

    for (
        const token
        of tokens
    ) {

        const lower =
            token.toLowerCase();

        if (
            supportedTokens.has(lower)
        ) {
            continue;
        }

        return false;
    }

    return true;
}

// ==========================================================
// SEO KEYWORD VALIDATION
// ==========================================================

function isValidSEOKeyword(
    keyword,
    productName,
    mainKeyword = "",
    brand = "",
    facts = []
) {

    const value =
        cleanSEOKeyword(keyword);

    if (!value) return false;

    if (value.length < 2) {
        return false;
    }

    if (value.length > 120) {
        return false;
    }

    if (
        containsBlockedSEOWord(value)
    ) {
        return false;
    }

    if (
        hasBrokenMeasurement(value)
    ) {
        return false;
    }

    if (
        hasUnnaturalBrandPlacement(
            value,
            brand
        )
    ) {
        return false;
    }

    if (
        hasBadCharacterTypo(value)
    ) {
        return false;
    }

    if (
        !keywordContainsProduct(
            value,
            productName
        )
    ) {
        return false;
    }

    // ======================================================
    // Seller word protection
    // ======================================================

    const supportedTokens =
        buildSupportedSEOTokens(
            mainKeyword,
            productName,
            brand,
            facts
        );

    if (
        !usesOnlySellerWords(
            value,
            supportedTokens
        )
    ) {
        return false;
    }

    // ======================================================
    // Reject weak standalone modifier beginnings.
    // ======================================================

    const tokens =
        normalizeWords(value);

    if (
        tokens.length > 1
    ) {

        const first =
            tokens[0].toLowerCase();

        if (
            SEO_WEAK_LEADING_WORDS.has(first)
        ) {

            return false;
        }
    }

    return true;
}

// ==========================================================
// SEO FILTER
// ==========================================================

function filterSEOKeywords(
    keywords,
    productName,
    mainKeyword = "",
    brand = "",
    facts = []
) {

    const result = [];

    for (
        const keyword
        of uniqueStrings(keywords)
    ) {

        if (
            !isValidSEOKeyword(
                keyword,
                productName,
                mainKeyword,
                brand,
                facts
            )
        ) {

            continue;
        }

        const normalized =
            normalizeWords(keyword)
                .join(" ");

        if (
            result.some(existing => {

                const existingNormalized =
                    normalizeWords(existing)
                        .join(" ");

                return (
                    existingNormalized ===
                    normalized
                );
            })
        ) {

            continue;
        }

        result.push(keyword);

        if (
            result.length >= 20
        ) {
            break;
        }
    }

    return result;
}

// ==========================================================
// GEMINI SYSTEM PROMPT
// ==========================================================

function createSystemPrompt(
    category,
    task = "listing"
) {

    const rule =
        categoryRules[category] ||
        "Use only seller-provided information.";

    return `
You are the official AI Product Listing Assistant
for AI Seller Toolkit.

TASK:
${task}

CATEGORY:
${category}

STRICT FACTUAL POLICY:

1. Use ONLY information explicitly provided by the seller.

2. Never guess or fill missing specifications from
general knowledge.

3. Never invent brand, model, material, fabric, color,
size, weight, dimensions, battery, storage, RAM,
processor, warranty, certification, ingredients,
quantity, compatibility or features.

4. Never invent benefits, medical claims,
performance claims, durability claims or safety claims.

5. Never turn an assumption into a fact.

6. If a seller field is missing, omit it.

7. Preserve seller-provided factual details accurately.

8. Do not use marketplace names as product facts.

9. Do not create generic promotional filler.

10. Never add Best, Premium, Guaranteed, No.1,
Top Quality or similar claims unless explicitly
provided by the seller.

CATEGORY RULES:

${rule}

Return only the requested JSON object.
No Markdown.
No explanation outside JSON.
`;
}

// ==========================================================
// GEMINI RETRY CHECK
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
        [429, 500, 502, 503, 504]
            .includes(status) ||

        message.includes("429") ||
        message.includes("503") ||
        message.includes("rate limit") ||
        message.includes("resource exhausted") ||
        message.includes("unavailable") ||
        message.includes("high demand") ||
        message.includes("temporarily")
    );
}

// ==========================================================
// SLEEP
// ==========================================================

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(
            resolve,
            ms
        )
    );
}

// ==========================================================
// GEMINI INTERACTIONS API
// ==========================================================

async function callGemini(prompt) {

    if (!ai) {

        const error =
            new Error(
                "Gemini API key is not configured."
            );

        error.status = 500;

        throw error;
    }

    const delays = [
        2500,
        5000,
        9000
    ];

    let lastError = null;

    for (
        let attempt = 1;
        attempt <= 4;
        attempt++
    ) {

        try {

            console.log(
                `🤖 Gemini Interactions attempt ${attempt}/4`
            );

            console.log(
                `🧠 Model: ${MODEL}`
            );

            const interaction =
                await ai.interactions.create({

                    model: MODEL,

                    input: prompt
                });

            const text =
                cleanText(
                    interaction?.output_text ||
                    interaction?.outputText ||
                    interaction?.text ||
                    extractTextFromInteraction(
                        interaction
                    )
                );

            if (!text) {

                throw new Error(
                    "Gemini returned an empty response."
                );
            }

            return text;

        }
        catch (error) {

            lastError = error;

            console.error(
                `❌ Gemini attempt ${attempt} failed:`,
                error?.message || error
            );

            if (
                !isRetryableError(error) ||
                attempt === 4
            ) {

                throw error;
            }

            await sleep(
                delays[attempt - 1]
            );
        }
    }

    throw lastError;
}

// ==========================================================
// EXTRACT TEXT FROM INTERACTION
// ==========================================================

function extractTextFromInteraction(
    interaction
) {

    if (!interaction) {
        return "";
    }

    if (
        typeof interaction.output_text ===
        "string"
    ) {

        return interaction.output_text;
    }

    if (
        typeof interaction.outputText ===
        "string"
    ) {

        return interaction.outputText;
    }

    const pieces = [];

    function walk(
        value,
        depth = 0
    ) {

        if (
            depth > 10 ||
            value === null ||
            value === undefined
        ) {

            return;
        }

        if (
            typeof value === "string"
        ) {

            return;
        }

        if (
            Array.isArray(value)
        ) {

            for (
                const item
                of value
            ) {

                walk(
                    item,
                    depth + 1
                );
            }

            return;
        }

        if (
            typeof value !== "object"
        ) {

            return;
        }

        if (
            typeof value.text ===
            "string"
        ) {

            pieces.push(
                value.text
            );
        }

        for (
            const [key, child]
            of Object.entries(value)
        ) {

            if (
                key === "text"
            ) {

                continue;
            }

            walk(
                child,
                depth + 1
            );
        }
    }

    walk(interaction);

    return pieces
        .join("\n")
        .trim();
}

// ==========================================================
// JSON PARSER
// ==========================================================

function parseJSONResponse(text) {

    let cleaned =
        cleanText(text)
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
    catch (_) {

        const first =
            cleaned.indexOf("{");

        const last =
            cleaned.lastIndexOf("}");

        if (
            first >= 0 &&
            last > first
        ) {

            try {

                return JSON.parse(
                    cleaned.slice(
                        first,
                        last + 1
                    )
                );

            }
            catch (_) {}
        }

        throw new Error(
            "AI returned invalid JSON."
        );
    }
}

// ==========================================================
// COMMON SELLER DATA
// ==========================================================

function buildSellerData(
    body,
    category
) {

    const categoryData =
        body.categoryData &&
        typeof body.categoryData ===
        "object"
            ? body.categoryData
            : {};

    const categoryFieldsText =
        Object.entries(
            categoryData
        )
        .filter(
            ([, value]) =>
                cleanText(value)
        )
        .map(
            ([key, value]) =>
                `${key}: ${cleanText(value)}`
        )
        .join("\n");

    return `
CATEGORY:
${category}

PRODUCT NAME:
${cleanText(body.productName)}

BRAND:
${cleanText(body.brand) || "Not provided"}

PRICE:
${cleanText(body.price) || "Not provided"}

MAIN KEYWORD:
${cleanText(
    body.mainKeyword ||
    body.keyword
) || "Not provided"}

PRODUCT DETAILS:
${cleanText(body.productDetails) || "Not provided"}

PRODUCT FEATURES:
${cleanText(body.productFeatures) || "Not provided"}

EXTRA INFORMATION:
${cleanText(body.extraInfo) || "Not provided"}

COLOR:
${cleanText(body.color) || "Not provided"}

SIZE:
${cleanText(body.size) || "Not provided"}

MATERIAL:
${cleanText(body.material) || "Not provided"}

FABRIC:
${cleanText(body.fabric) || "Not provided"}

PATTERN:
${cleanText(body.pattern) || "Not provided"}

DESIGN:
${cleanText(body.design) || "Not provided"}

FIT:
${cleanText(body.fit) || "Not provided"}

OCCASION:
${cleanText(body.occasion) || "Not provided"}

QUANTITY:
${cleanText(body.quantity) || "Not provided"}

MODEL:
${cleanText(body.model) || "Not provided"}

CONNECTIVITY:
${cleanText(body.connectivity) || "Not provided"}

COMPATIBILITY:
${cleanText(body.compatibility) || "Not provided"}

CAPACITY:
${cleanText(body.capacity) || "Not provided"}

BATTERY:
${cleanText(body.battery) || "Not provided"}

STORAGE:
${cleanText(body.storage) || "Not provided"}

RAM:
${cleanText(body.ram) || "Not provided"}

PROCESSOR:
${cleanText(body.processor) || "Not provided"}

INGREDIENTS:
${cleanText(body.ingredients) || "Not provided"}

FRAGRANCE:
${cleanText(body.fragrance) || "Not provided"}

SHADE:
${cleanText(body.shade) || "Not provided"}

SKIN TYPE:
${cleanText(body.skinType) || "Not provided"}

HAIR TYPE:
${cleanText(body.hairType) || "Not provided"}

AUTHOR:
${cleanText(body.author) || "Not provided"}

LANGUAGE:
${cleanText(body.language) || "Not provided"}

GENRE:
${cleanText(body.genre) || "Not provided"}

EDITION:
${cleanText(body.edition) || "Not provided"}

PUBLISHER:
${cleanText(body.publisher) || "Not provided"}

ISBN:
${cleanText(body.isbn) || "Not provided"}

PET TYPE:
${cleanText(body.petType) || "Not provided"}

SPORT:
${cleanText(body.sport) || "Not provided"}

VEHICLE COMPATIBILITY:
${cleanText(body.vehicleCompatibility) || "Not provided"}

SOLE:
${cleanText(
    body.sole ||
    body.soleType
) || "Not provided"}

CLOSURE:
${cleanText(body.closure) || "Not provided"}

STONE:
${cleanText(body.stone) || "Not provided"}

PLATING:
${cleanText(body.plating) || "Not provided"}

AGE RANGE:
${cleanText(body.ageRange) || "Not provided"}

FLAVOR:
${cleanText(body.flavor) || "Not provided"}

USAGE:
${cleanText(body.usage) || "Not provided"}

WEIGHT:
${cleanText(body.weight) || "Not provided"}

DIMENSIONS:
${cleanText(body.dimensions) || "Not provided"}

PACKAGING:
${cleanText(body.packaging) || "Not provided"}

VARIANT:
${cleanText(body.variant) || "Not provided"}

FORMAT:
${cleanText(body.format) || "Not provided"}

PAGES:
${cleanText(body.pages) || "Not provided"}

INCLUDED ITEMS:
${cleanText(body.includedItems) || "Not provided"}

WARRANTY:
${cleanText(body.warranty) || "Not provided"}

CATEGORY DATA:
${categoryFieldsText || "Not provided"}
`;
}

// ==========================================================
// TITLE GENERATOR
// ==========================================================

async function handleGenerateTitle(
    req,
    res
) {

    try {

        const body =
            req.body || {};

        const category =
            normalizeCategory(
                body.category
            );

        const productName =
            cleanText(
                body.productName
            );

        if (!category) {

            return res.status(400).json({

                success: false,

                error:
                    "Product category is required."
            });
        }

        if (!productName) {

            return res.status(400).json({

                success: false,

                error:
                    "Product name is required."
            });
        }

        const prompt = `
${createSystemPrompt(
    category,
    "title generation"
)}

Create one marketplace product title.

${buildSellerData(
    body,
    category
)}

TITLE RULES:

- Use only seller-provided facts.
- Do not invent attributes.
- Keep it concise and product-focused.
- Do not add online, buy, shop, best,
  premium, trendy or stylish.
- Preserve exact factual measurements.
- Return JSON only:

{"title":""}
`;

        const text =
            await callGemini(
                prompt
            );

        const result =
            parseJSONResponse(
                text
            );

        const title =
            cleanText(
                result.title
            );

        if (!title) {

            throw new Error(
                "AI returned an empty title."
            );
        }

        return res.json({

            success: true,

            category,

            productName,

            title,

            result: title,

            data: {
                title
            },

            version: VERSION
        });

    }
    catch (error) {

        return sendGenerationError(
            res,
            error,
            "Unable to generate product title."
        );
    }
}

// ==========================================================
// DESCRIPTION GENERATOR
// ==========================================================

async function handleGenerateDescription(
    req,
    res
) {

    try {

        const body =
            req.body || {};

        const category =
            normalizeCategory(
                body.category
            );

        const productName =
            cleanText(
                body.productName
            );

        if (!category) {

            return res.status(400).json({

                success: false,

                error:
                    "Product category is required."
            });
        }

        if (!productName) {

            return res.status(400).json({

                success: false,

                error:
                    "Product name is required."
            });
        }

        const prompt = `
${createSystemPrompt(
    category,
    "description generation"
)}

Create one factual marketplace product description.

${buildSellerData(
    body,
    category
)}

DESCRIPTION RULES:

- Mention only seller-provided facts.
- Do not invent benefits.
- Do not invent specifications.
- Do not invent usage.
- Do not invent compatibility.
- Do not use unsupported promotional claims.
- Preserve measurements exactly.
- Return JSON only:

{"description":""}
`;

        const text =
            await callGemini(
                prompt
            );

        const result =
            parseJSONResponse(
                text
            );

        const description =
            cleanText(
                result.description
            );

        if (!description) {

            throw new Error(
                "AI returned an empty description."
            );
        }

        return res.json({

            success: true,

            category,

            productName,

            description,

            result: description,

            data: {
                description
            },

            version: VERSION
        });

    }
    catch (error) {

        return sendGenerationError(
            res,
            error,
            "Unable to generate product description."
        );
    }
}

// ==========================================================
// SEO GENERATOR — FINAL VERSION 13
// ==========================================================

async function handleGenerateSEO(
    req,
    res
) {

    try {

        const body =
            req.body || {};

        const category =
            normalizeCategory(
                body.category
            );

        const productName =
            cleanSEOKeyword(
                body.productName
            );

        if (!category) {

            return res.status(400).json({

                success: false,

                error:
                    "Product category is required."
            });
        }

        if (!productName) {

            return res.status(400).json({

                success: false,

                error:
                    "Product name is required."
            });
        }

        const mainKeyword =
            cleanSEOKeyword(

                body.mainKeyword ||

                body.keyword ||

                body.productDetails ||

                productName
            );

        const facts =
            collectSellerFacts(
                body
            );

        // ==================================================
        // DETERMINISTIC SEO
        // ==================================================

        const deterministicKeywords =
            buildFactualSEOKeywords(

                mainKeyword,

                productName,

                facts,

                body
            );

        const inline =
            extractInlineSEOAttributes(

                mainKeyword,

                productName,

                body.brand
            );

        const inlineFacts =
            uniqueStrings(
                inline.descriptors
            );

        // ==================================================
        // GEMINI SEO PROMPT
        // ==================================================

        const prompt = `
${createSystemPrompt(
    category,
    "strict factual SEO keyword generation"
)}

Generate SEO keywords for this seller product.

${buildSellerData(
    body,
    category
)}

PRODUCT NAME:
${productName}

PRIMARY SELLER KEYWORD:
${mainKeyword}

EXPLICIT INLINE ATTRIBUTES DETECTED:
${
    inlineFacts.length
        ? inlineFacts.join(", ")
        : "None"
}

SEO RULES:

1. Use ONLY seller-provided words and facts.

2. Never invent an attribute.

3. The primary seller keyword is the first
   and most important keyword.

4. Preserve measurements as complete phrases.

   GOOD:
   - 300 ml
   - 200 g
   - 8 inch
   - 50 pieces
   - 750 ml

   BAD:
   - 300
   - ml
   - 200
   - g
   - 8
   - inch
   - 50
   - pieces

5. Do not split a number from its unit.

6. Create natural keyword combinations.

7. Do NOT create random word-order combinations.

8. Do NOT create keywords such as:

   - print Cotton Kurti
   - charging Wireless Bluetooth Earbuds
   - case Wireless Bluetooth Earbuds
   - Cotton Kurti Test Brand
   - 300 Ceramic Coffee Mug
   - ml Ceramic Coffee Mug
   - 200 Roasted Salted Peanuts
   - g Roasted Salted Peanuts

9. Brand placement must be natural.

   GOOD:
   Test Brand Cotton Kurti

   BAD:
   Cotton Kurti Test Brand

10. Do not add category assumptions.

   For example, if category is Pet,
   do not automatically add "pet" unless
   the seller supplied that word/fact.

11. Do not change singular/plural facts.

   If seller says "pieces",
   do not invent "piece".

12. Do not introduce words that are absent
   from the seller's supplied information.

13. Do not use:

   online
   buy
   shop
   shopping
   best
   premium
   trendy
   stylish
   latest
   cheap
   price
   collection
   store
   apparel
   wear
   guaranteed
   original
   top

14. Do not create generic filler.

15. Do not create 20 keywords just to reach 20.

16. If only 3 useful factual keywords exist,
   return only 3.

17. Prefer natural marketplace keyword structure:

   ATTRIBUTE + PRODUCT

   ATTRIBUTE + ATTRIBUTE + PRODUCT

   PRODUCT + MEASUREMENT

   BRAND + PRODUCT

18. Never use unsupported benefits,
   compatibility, occasion, gender,
   quality, performance or certification.

19. Do not use strange spelling or character
   corruption such as pIastic or pIant.

20. Product relevance is mandatory.

21. Do not merely rearrange the same words
   into unnatural phrases.

22. Return only useful factual SEO keywords.

GOOD EXAMPLE:

Product Name:
Cotton Kurti

Primary Seller Keyword:
Blue floral print cotton kurti

Good keywords:

Blue floral print cotton kurti
Cotton Kurti
Blue Cotton Kurti
Floral Cotton Kurti
Floral Print Cotton Kurti
Blue Floral Cotton Kurti
Blue Floral Print Kurti
Cotton Floral Print Kurti
Floral Print Kurti

BAD:

Print Cotton Kurti
Blue Print Cotton Kurti
Blue Cotton Kurti Floral Print
Cotton Kurti Test Brand
Cotton Kurti Online
Buy Cotton Kurti
Best Cotton Kurti
Premium Cotton Kurti

Return JSON only:

{
  "keywords": []
}
`;

        // ==================================================
        // AI KEYWORDS
        // ==================================================

        let aiKeywords = [];

        try {

            const aiText =
                await callGemini(
                    prompt
                );

            const aiResult =
                parseJSONResponse(
                    aiText
                );

            if (
                Array.isArray(
                    aiResult.keywords
                )
            ) {

                aiKeywords =
                    aiResult.keywords
                        .map(
                            cleanSEOKeyword
                        )
                        .filter(Boolean);
            }

        }
        catch (error) {

            console.error(
                "⚠️ SEO Gemini suggestions failed:",
                error?.message || error
            );
        }

        // ==================================================
        // COMBINE
        //
        // Deterministic factual keywords
        // always come before AI suggestions.
        // ==================================================

        const combined = [

            mainKeyword,

            ...deterministicKeywords,

            ...aiKeywords
        ];

        // ==================================================
        // FILTER
        // ==================================================

        let keywords =
            filterSEOKeywords(

                combined,

                productName,

                mainKeyword,

                body.brand,

                facts
            );

        // ==================================================
        // ALWAYS KEEP MAIN KEYWORD FIRST
        //
        // Seller's exact keyword is trusted as input.
        // ==================================================

        keywords =
            keywords.filter(
                keyword =>
                    keyword.toLowerCase() !==
                    mainKeyword.toLowerCase()
            );

        keywords.unshift(
            mainKeyword
        );

        keywords =
            uniqueStrings(
                keywords
            )
            .slice(0, 20);

        // ==================================================
        // FALLBACK
        // ==================================================

        if (!keywords.length) {

            keywords = [
                productName
            ];
        }

        return res.json({

            success: true,

            category,

            productName,

            mainKeyword,

            keywords,

            seoKeywords:
                keywords,

            data: {

                keywords,

                seoKeywords:
                    keywords
            },

            text:
                keywords.join("\n"),

            count:
                keywords.length,

            version:
                VERSION
        });

    }
    catch (error) {

        return sendGenerationError(
            res,
            error,
            "Unable to generate SEO keywords."
        );
    }
}

// ==========================================================
// COMPLETE LISTING GENERATOR
// ==========================================================

async function handleGenerateListing(
    req,
    res
) {

    try {

        const body =
            req.body || {};

        const category =
            normalizeCategory(
                body.category
            );

        const productName =
            cleanText(
                body.productName
            );

        if (!category) {

            return res.status(400).json({

                success: false,

                error:
                    "Product category is required."
            });
        }

        if (!productName) {

            return res.status(400).json({

                success: false,

                error:
                    "Product name is required."
            });
        }

        const prompt = `
${createSystemPrompt(
    category,
    "complete marketplace listing generation"
)}

Create a complete marketplace product listing.

${buildSellerData(
    body,
    category
)}

OUTPUT RULES:

- title: one factual title
- description: one factual description
- highlights: 3-8 factual bullet points
- keywords: relevant factual product keywords
- hashtags: relevant factual hashtags
- seoTitle: factual SEO title
- seoDescription: factual SEO description

IMPORTANT:

Never invent missing information.

Never invent material,
color, size, compatibility,
benefits, performance,
warranty, certification,
quantity or specifications.

Never use generic SEO filler.

Return JSON only:

{
  "title": "",
  "description": "",
  "highlights": [],
  "keywords": [],
  "hashtags": [],
  "seoTitle": "",
  "seoDescription": ""
}
`;

        const text =
            await callGemini(
                prompt
            );

        const listing =
            parseJSONResponse(
                text
            );

        listing.title =
            cleanText(
                listing.title
            );

        listing.description =
            cleanText(
                listing.description
            );

        listing.seoTitle =
            cleanText(
                listing.seoTitle
            );

        listing.seoDescription =
            cleanText(
                listing.seoDescription
            );

        listing.highlights =
            Array.isArray(
                listing.highlights
            )
                ? listing.highlights
                    .map(cleanText)
                    .filter(Boolean)
                : [];

        listing.keywords =
            Array.isArray(
                listing.keywords
            )
                ? listing.keywords
                    .map(cleanSEOKeyword)
                    .filter(Boolean)
                : [];

        listing.hashtags =
            Array.isArray(
                listing.hashtags
            )
                ? listing.hashtags
                    .map(cleanText)
                    .filter(Boolean)
                : [];

        // ==================================================
        // ADD FACTUAL SEO KEYWORDS
        // ==================================================

        const seoFacts =
            collectSellerFacts(
                body
            );

        const seoMainKeyword =
            cleanSEOKeyword(

                body.mainKeyword ||

                body.keyword ||

                body.productDetails ||

                productName
            );

        const factualKeywords =
            buildFactualSEOKeywords(

                seoMainKeyword,

                productName,

                seoFacts,

                body
            );

        const filteredFactualKeywords =
            filterSEOKeywords(

                factualKeywords,

                productName,

                seoMainKeyword,

                body.brand,

                seoFacts
            );

        listing.keywords =
            uniqueStrings([

                ...filteredFactualKeywords,

                ...listing.keywords

            ]).slice(0, 20);

        // ==================================================
        // FALLBACKS
        // ==================================================

        if (!listing.title) {

            listing.title =
                productName;
        }

        if (!listing.description) {

            listing.description =
                productName;
        }

        if (!listing.seoTitle) {

            listing.seoTitle =
                listing.title;
        }

        if (!listing.seoDescription) {

            listing.seoDescription =
                listing.description;
        }

        return res.json({

            success: true,

            category,

            productName,

            listing,

            data:
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

        return sendGenerationError(
            res,
            error,
            "Unable to generate product listing."
        );
    }
}

// ==========================================================
// HASHTAG GENERATOR
// ==========================================================

async function handleGenerateHashtags(
    req,
    res
) {

    try {

        const body =
            req.body || {};

        const category =
            normalizeCategory(
                body.category
            );

        const productName =
            cleanText(
                body.productName
            );

        if (!category) {

            return res.status(400).json({

                success: false,

                error:
                    "Product category is required."
            });
        }

        if (!productName) {

            return res.status(400).json({

                success: false,

                error:
                    "Product name is required."
            });
        }

        const prompt = `
${createSystemPrompt(
    category,
    "hashtag generation"
)}

Create relevant product hashtags.

${buildSellerData(
    body,
    category
)}

RULES:

- Use only seller-provided facts.
- Do not invent attributes.
- Do not invent benefits.
- Do not use unsupported promotional claims.
- Do not add category assumptions.
- Return 5-15 hashtags only when enough factual
  information exists.

Return JSON only:

{
  "hashtags": []
}
`;

        const text =
            await callGemini(
                prompt
            );

        const result =
            parseJSONResponse(
                text
            );

        const hashtags =
            Array.isArray(
                result.hashtags
            )
                ? uniqueStrings(
                    result.hashtags
                ).slice(0, 15)
                : [];

        return res.json({

            success: true,

            category,

            productName,

            hashtags,

            data: {
                hashtags
            },

            result:
                hashtags.join(" "),

            version:
                VERSION
        });

    }
    catch (error) {

        return sendGenerationError(
            res,
            error,
            "Unable to generate hashtags."
        );
    }
}

// ==========================================================
// FORMAT LISTING
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

${
    listing.highlights
        .map(
            item => `• ${item}`
        )
        .join("\n")
}


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
// ERROR HANDLER
// ==========================================================

function sendGenerationError(
    res,
    error,
    fallbackMessage
) {

    console.error(
        "❌ Generation Error:",
        error?.message || error
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
            error?.message || ""
        );

    const lower =
        message.toLowerCase();

    // ======================================================
    // 429
    // ======================================================

    if (
        status === 429 ||
        lower.includes("429") ||
        lower.includes("rate limit") ||
        lower.includes("resource exhausted")
    ) {

        return res.status(429).json({

            success: false,

            error:
                "Gemini request limit was reached. Please try again shortly.",

            retryable:
                true,

            version:
                VERSION
        });
    }

    // ======================================================
    // 503
    // ======================================================

    if (
        status === 503 ||
        lower.includes("503") ||
        lower.includes("high demand") ||
        lower.includes("temporarily unavailable")
    ) {

        return res.status(503).json({

            success: false,

            error:
                "Gemini is temporarily busy. Please try again shortly.",

            retryable:
                true,

            version:
                VERSION
        });
    }

    // ======================================================
    // GENERAL ERROR
    // ======================================================

    return res.status(500).json({

        success: false,

        error:
            message ||
            fallbackMessage,

        version:
            VERSION
    });
}

// ==========================================================
// ROOT HEALTH CHECK
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

            geminiConfigured:
                !!GEMINI_API_KEY,

            api: [

                "/api/status",

                "/api/categories",

                "/api/generate-title",

                "/api/generate-description",

                "/api/generate-seo",

                "/api/generate-listing",

                "/api/generate-hashtags"
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

            success:
                true,

            server:
                "online",

            version:
                VERSION,

            model:
                MODEL,

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
                CATEGORIES
        });
    }
);

// ==========================================================
// POST ENDPOINTS
// ==========================================================

app.post(
    "/api/generate-title",
    handleGenerateTitle
);

app.post(
    "/api/generate-description",
    handleGenerateDescription
);

app.post(
    "/api/generate-seo",
    handleGenerateSEO
);

app.post(
    "/api/generate-listing",
    handleGenerateListing
);

app.post(
    "/api/generate-hashtags",
    handleGenerateHashtags
);

// ==========================================================
// BACKWARD COMPATIBILITY
// ==========================================================

app.post(
    "/generate",
    handleGenerateListing
);

app.post(
    "/api/generate",
    handleGenerateListing
);

app.post(
    "/api/generate-keywords",
    handleGenerateSEO
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
                "API endpoint not found",

            path:
                req.originalUrl,

            version:
                VERSION
        });
    }
);

// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Server Error:",
            err
        );

        res.status(500).json({

            success:
                false,

            error:
                "Internal server error",

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
    "0.0.0.0",
    () => {

        console.log(
            "=============================================="
        );

        console.log(
            "AI SELLER TOOLKIT BACKEND"
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
            `Gemini API: ${
                GEMINI_API_KEY
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            }`
        );

        console.log(
            "Categories: 14"
        );

        console.log(
            "SEO Engine: ADVANCED FACTUAL ATTRIBUTE ENGINE"
        );

        console.log(
            "Measurement Protection: ENABLED"
        );

        console.log(
            "AI Seller Word Protection: ENABLED"
        );

        console.log(
            "Gemini API: INTERACTIONS"
        );

        console.log(
            "=============================================="
        );
    }
);
