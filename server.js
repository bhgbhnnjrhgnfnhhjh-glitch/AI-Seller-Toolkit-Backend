// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 12.0
// Category-Aware + Strict Factual AI
// Gemini Interactions API
// Improved SEO Attribute Engine
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

// ==========================================================
// CONFIG
// ==========================================================

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const VERSION = "12.0";

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
// 14 CATEGORIES
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

function normalizeCategory(value) {

    const text = cleanText(value)
        .toLowerCase()
        .replace(/[👗💄📱🏠👟💎🧸📚🐾⚽🚗🌱🍔🎁]/g, "")
        .trim();

    const map = {

        "fashion": "Fashion",
        "fashion & clothing": "Fashion",
        "fashion and clothing": "Fashion",
        "clothing": "Fashion",

        "beauty": "Beauty",
        "personal care": "Beauty",

        "electronics": "Electronics",

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

        "books": "Books",
        "book": "Books",
        "books & stationery": "Books",

        "pet": "Pet",
        "pets": "Pet",

        "sports": "Sports",
        "sports & fitness": "Sports",
        "fitness": "Sports",

        "automotive": "Automotive",
        "automobile": "Automotive",
        "auto": "Automotive",

        "garden": "Garden",
        "gardening": "Garden",

        "food": "Food",
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

    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
}

function cleanKeyword(value) {

    return cleanText(value)
        .replace(/[\r\n]+/g, " ")
        .replace(/\s+/g, " ")
        .replace(/^[,;| ]+|[,;| ]+$/g, "")
        .trim();
}

function unique(values) {

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

function words(value) {

    return cleanKeyword(value)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean);
}

function addKeyword(list, value) {

    const keyword = cleanKeyword(value);

    if (!keyword) return;

    const exists = list.some(
        item =>
            item.toLowerCase().replace(/\s+/g, " ").trim() ===
            keyword.toLowerCase().replace(/\s+/g, " ").trim()
    );

    if (!exists) {
        list.push(keyword);
    }
}

// ==========================================================
// CATEGORY RULES
// ==========================================================

const CATEGORY_RULES = {

    "Fashion":
        "Use only seller-provided product type, fabric, material, color, size, pattern, design, fit, occasion and quantity.",

    "Beauty":
        "Use only seller-provided product type, shade, ingredients, quantity, fragrance, skin type, hair type and features. Never invent benefits or medical claims.",

    "Electronics":
        "Use only seller-provided model, brand, storage, RAM, battery, connectivity, compatibility and technical specifications.",

    "Home & Kitchen":
        "Use only seller-provided material, color, dimensions, size, capacity, quantity and features.",

    "Shoes":
        "Use only seller-provided size, color, material, sole, closure, design, style and quantity.",

    "Jewellery":
        "Use only seller-provided material, color, design, size, stone, plating and quantity. Never invent precious metals or stones.",

    "Toys":
        "Use only seller-provided toy type, material, age range, size, quantity and features.",

    "Books":
        "Use only seller-provided title, author, language, pages, edition, publisher, ISBN, format and genre.",

    "Pet":
        "Use only seller-provided pet type, material, size, color, quantity, usage and compatibility.",

    "Sports":
        "Use only seller-provided sport, product type, material, size, weight, quantity and included items.",

    "Automotive":
        "Use only seller-provided vehicle compatibility, model, material, size, part number and quantity.",

    "Garden":
        "Use only seller-provided material, size, color, quantity, usage and compatibility.",

    "Food":
        "Use only seller-provided ingredients, flavor, quantity, packaging, variant and product type. Never invent nutrition or health claims.",

    "Gifts":
        "Use only seller-provided material, color, size, quantity, occasion and included items."
};

// ==========================================================
// SELLER FACTS
// ==========================================================

function collectFacts(body) {

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

        const value = cleanKeyword(body[field]);

        if (value) {
            addKeyword(facts, value);
        }
    }

    if (
        body.categoryData &&
        typeof body.categoryData === "object"
    ) {

        for (const value of Object.values(body.categoryData)) {

            const text = cleanKeyword(value);

            if (text) {
                addKeyword(facts, text);
            }
        }
    }

    return facts;
}

// ==========================================================
// FIND PRODUCT INSIDE MAIN KEYWORD
// ==========================================================

function findSequence(source, target) {

    if (!source.length || !target.length) {
        return -1;
    }

    for (
        let i = 0;
        i <= source.length - target.length;
        i++
    ) {

        let match = true;

        for (let j = 0; j < target.length; j++) {

            if (source[i + j] !== target[j]) {
                match = false;
                break;
            }
        }

        if (match) {
            return i;
        }
    }

    return -1;
}

// ==========================================================
// EXTRACT INLINE ATTRIBUTES
// ==========================================================

function extractAttributes(mainKeyword, productName, brand) {

    const source = words(mainKeyword);
    const product = words(productName);

    if (!source.length || !product.length) {
        return [];
    }

    const start = findSequence(source, product);

    let remaining = [];

    if (start >= 0) {

        remaining = [
            ...source.slice(0, start),
            ...source.slice(start + product.length)
        ];

    } else {

        remaining = [...source];

        for (const token of product) {

            const index = remaining.indexOf(token);

            if (index >= 0) {
                remaining.splice(index, 1);
            }
        }
    }

    const brandWords = words(brand);

    for (const token of brandWords) {

        const index = remaining.indexOf(token);

        if (index >= 0) {
            remaining.splice(index, 1);
        }
    }

    return unique(remaining);
}

// ==========================================================
// SEO ATTRIBUTE ENGINE
// ==========================================================

function buildAttributeKeywords(
    mainKeyword,
    productName,
    brand
) {

    const result = [];

    const main = cleanKeyword(mainKeyword);
    const product = cleanKeyword(productName);

    if (!main || !product) {
        return result;
    }

    const attributes = extractAttributes(
        main,
        product,
        brand
    );

    const productWords = words(product);

    const productHead =
        productWords[productWords.length - 1];

    addKeyword(result, main);
    addKeyword(result, product);

    if (!attributes.length) {
        return result;
    }

    const a1 = attributes[0] || "";
    const a2 = attributes[1] || "";
    const a3 = attributes[2] || "";
    const a4 = attributes[3] || "";

    // Single attribute + product

    if (a1) {
        addKeyword(
            result,
            `${a1} ${product}`
        );
    }

    if (a2) {
        addKeyword(
            result,
            `${a2} ${product}`
        );
    }

    if (a3) {
        addKeyword(
            result,
            `${a3} ${product}`
        );
    }

    // Attribute combinations

    if (a1 && a2) {
        addKeyword(
            result,
            `${a1} ${a2} ${product}`
        );
    }

    if (a2 && a3) {
        addKeyword(
            result,
            `${a2} ${a3} ${product}`
        );
    }

    if (a1 && a3) {
        addKeyword(
            result,
            `${a1} ${a3} ${product}`
        );
    }

    // Full attribute combination

    if (attributes.length >= 2) {

        addKeyword(
            result,
            `${attributes.join(" ")} ${productHead}`
        );
    }

    // Product prefix + attributes

    if (
        productWords.length > 1 &&
        a2 &&
        a3
    ) {

        const prefix =
            productWords.slice(0, -1).join(" ");

        addKeyword(
            result,
            `${prefix} ${a2} ${a3} ${productHead}`
        );
    }

    // Attribute + product + attribute

    if (a1 && a2 && a3) {

        addKeyword(
            result,
            `${a1} ${product} ${a2} ${a3}`
        );
    }

    // Two attributes + product head

    if (a2 && a3) {

        addKeyword(
            result,
            `${a2} ${a3} ${productHead}`
        );
    }

    // Four attribute combinations

    if (attributes.length >= 4) {

        addKeyword(
            result,
            `${a1} ${a2} ${a3} ${product}`
        );

        addKeyword(
            result,
            `${a1} ${a2} ${a4} ${product}`
        );

        addKeyword(
            result,
            `${a2} ${a3} ${a4} ${product}`
        );
    }

    return result;
}

// ==========================================================
// FACTUAL SEO BUILDER
// ==========================================================

function buildFactualSEO(
    mainKeyword,
    productName,
    body
) {

    const result = [];

    const brand = cleanKeyword(body.brand);

    // Main inline attributes first

    for (
        const keyword of buildAttributeKeywords(
            mainKeyword,
            productName,
            brand
        )
    ) {

        addKeyword(result, keyword);
    }

    // Structured seller facts

    const facts = collectFacts(body);

    for (const fact of facts) {

        const value = cleanKeyword(fact);

        if (!value) continue;

        // Don't duplicate brand as normal attribute

        if (
            brand &&
            value.toLowerCase() === brand.toLowerCase()
        ) {
            continue;
        }

        addKeyword(
            result,
            `${value} ${productName}`
        );

        addKeyword(
            result,
            `${productName} ${value}`
        );
    }

    // Fact + fact + product

    const useful = facts
        .filter(fact => {
            if (!brand) return true;

            return (
                fact.toLowerCase() !==
                brand.toLowerCase()
            );
        })
        .slice(0, 8);

    for (let i = 0; i < useful.length; i++) {

        for (
            let j = i + 1;
            j < useful.length;
            j++
        ) {

            addKeyword(
                result,
                `${useful[i]} ${useful[j]} ${productName}`
            );
        }
    }

    // Brand at the end

    if (brand) {

        addKeyword(
            result,
            `${brand} ${productName}`
        );

        addKeyword(
            result,
            `${productName} ${brand}`
        );
    }

    return result;
}

// ==========================================================
// BLOCKED SEO WORDS
// ==========================================================

const BLOCKED_SEO_WORDS = [
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
];

function hasBlockedWord(keyword) {

    const lower = keyword.toLowerCase();

    return BLOCKED_SEO_WORDS.some(word => {

        return (
            lower === word ||
            lower.includes(` ${word} `) ||
            lower.startsWith(`${word} `) ||
            lower.endsWith(` ${word}`)
        );
    });
}

// ==========================================================
// SEO VALIDATION
// ==========================================================

function isValidKeyword(
    keyword,
    productName
) {

    const value = cleanKeyword(keyword);

    if (!value) return false;

    if (value.length < 2) return false;

    if (value.length > 120) return false;

    if (hasBlockedWord(value)) {
        return false;
    }

    const keywordWords =
        new Set(words(value));

    const productWords =
        words(productName);

    if (!productWords.length) {
        return false;
    }

    // At least one product word must remain

    const relevant =
        productWords.some(
            word => keywordWords.has(word)
        );

    return relevant;
}

function filterSEOKeywords(
    keywords,
    productName
) {

    const result = [];

    for (const keyword of unique(keywords)) {

        if (
            !isValidKeyword(
                keyword,
                productName
            )
        ) {
            continue;
        }

        addKeyword(result, keyword);

        if (result.length >= 20) {
            break;
        }
    }

    return result;
}

// ==========================================================
// SYSTEM PROMPT
// ==========================================================

function systemPrompt(
    category,
    task
) {

    return `
You are the official AI Product Listing Assistant
for AI Seller Toolkit.

TASK:
${task}

CATEGORY:
${category}

STRICT FACTUAL POLICY:

1. Use ONLY information explicitly provided by the seller.
2. Never guess missing product information.
3. Never invent material, color, size, fabric, model,
   compatibility, warranty, ingredients, quantity,
   specifications or features.
4. Never invent benefits or performance claims.
5. Never invent certifications.
6. Never invent medical or health claims.
7. If information is missing, omit it.
8. Preserve seller facts accurately.
9. Never use generic promotional filler.
10. Never create unsupported claims.

CATEGORY RULE:
${CATEGORY_RULES[category] || "Use only seller-provided facts."}

Return only the requested JSON.
No Markdown.
No explanation outside JSON.
`;
}

// ==========================================================
// SELLER DATA FOR GEMINI
// ==========================================================

function sellerData(body, category) {

    const data = {
        category,
        productName: cleanText(body.productName),
        brand: cleanText(body.brand),
        price: cleanText(body.price),
        mainKeyword: cleanText(
            body.mainKeyword ||
            body.keyword
        ),
        productDetails: cleanText(
            body.productDetails
        ),
        productFeatures: cleanText(
            body.productFeatures
        ),
        extraInfo: cleanText(
            body.extraInfo
        ),
        categoryData:
            body.categoryData || {}
    };

    return JSON.stringify(
        data,
        null,
        2
    );
}

// ==========================================================
// GEMINI RETRY
// ==========================================================

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

function retryable(error) {

    const status = Number(
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
        message.includes("temporarily")
    );
}

// ==========================================================
// EXTRACT GEMINI TEXT
// ==========================================================

function extractInteractionText(
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

    if (
        typeof interaction.text ===
        "string"
    ) {
        return interaction.text;
    }

    const pieces = [];

    function walk(value, depth = 0) {

        if (
            depth > 10 ||
            value === null ||
            value === undefined
        ) {
            return;
        }

        if (typeof value === "string") {
            return;
        }

        if (Array.isArray(value)) {

            for (const item of value) {
                walk(item, depth + 1);
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
            pieces.push(value.text);
        }

        for (
            const [key, child]
            of Object.entries(value)
        ) {

            if (key === "text") {
                continue;
            }

            walk(child, depth + 1);
        }
    }

    walk(interaction);

    return pieces.join("\n").trim();
}

// ==========================================================
// GEMINI CALL
// ==========================================================

async function callGemini(prompt) {

    if (!ai) {

        const error = new Error(
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
                `Gemini attempt ${attempt}/4`
            );

            console.log(
                `Model: ${MODEL}`
            );

            const interaction =
                await ai.interactions.create({
                    model: MODEL,
                    input: prompt
                });

            const text =
                extractInteractionText(
                    interaction
                );

            if (!text) {

                throw new Error(
                    "Gemini returned an empty response."
                );
            }

            return text;

        } catch (error) {

            lastError = error;

            console.error(
                "Gemini error:",
                error?.message || error
            );

            if (
                !retryable(error) ||
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
// JSON PARSER
// ==========================================================

function parseJSON(text) {

    let value =
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
        return JSON.parse(value);
    } catch (_) {

        const first =
            value.indexOf("{");

        const last =
            value.lastIndexOf("}");

        if (
            first >= 0 &&
            last > first
        ) {

            return JSON.parse(
                value.slice(
                    first,
                    last + 1
                )
            );
        }

        throw new Error(
            "AI returned invalid JSON."
        );
    }
}

// ==========================================================
// ERROR RESPONSE
// ==========================================================

function generationError(
    res,
    error,
    fallback
) {

    console.error(
        "Generation Error:",
        error?.message || error
    );

    const status = Number(
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

    if (
        status === 429 ||
        lower.includes("429") ||
        lower.includes("rate limit") ||
        lower.includes("resource exhausted")
    ) {

        return res.status(429).json({
            success: false,
            error:
                "Gemini request limit reached. Please try again shortly.",
            retryable: true,
            version: VERSION
        });
    }

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
            retryable: true,
            version: VERSION
        });
    }

    return res.status(500).json({
        success: false,
        error: message || fallback,
        version: VERSION
    });
}

// ==========================================================
// TITLE GENERATOR
// ==========================================================

async function generateTitle(req, res) {

    try {

        const body = req.body || {};

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
${systemPrompt(
    category,
    "Product title generation"
)}

SELLER DATA:
${sellerData(body, category)}

TITLE RULES:

- Create one factual product title.
- Use seller-provided facts only.
- Keep it clear and product-focused.
- Do not invent specifications.
- Do not use online, buy, shop, best, premium,
  trendy or stylish.

Return:

{
  "title": ""
}
`;

        const text =
            await callGemini(prompt);

        const result =
            parseJSON(text);

        const title =
            cleanText(result.title);

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

    } catch (error) {

        return generationError(
            res,
            error,
            "Unable to generate product title."
        );
    }
}

// ==========================================================
// DESCRIPTION GENERATOR
// ==========================================================

async function generateDescription(
    req,
    res
) {

    try {

        const body = req.body || {};

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
${systemPrompt(
    category,
    "Factual product description generation"
)}

SELLER DATA:
${sellerData(body, category)}

DESCRIPTION RULES:

- Mention only seller-provided facts.
- Do not invent benefits.
- Do not invent specifications.
- Do not make unsupported claims.
- Write a clear marketplace description.

Return:

{
  "description": ""
}
`;

        const text =
            await callGemini(prompt);

        const result =
            parseJSON(text);

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

    } catch (error) {

        return generationError(
            res,
            error,
            "Unable to generate product description."
        );
    }
}

// ==========================================================
// SEO GENERATOR
// ==========================================================

async function generateSEO(req, res) {

    try {

        const body = req.body || {};

        const category =
            normalizeCategory(
                body.category
            );

        const productName =
            cleanKeyword(
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
            cleanKeyword(
                body.mainKeyword ||
                body.keyword ||
                body.productDetails ||
                productName
            );

        // ==============================================
        // IMPORTANT:
        // Build factual keywords BEFORE Gemini output.
        // ==============================================

        const factualKeywords =
            buildFactualSEO(
                mainKeyword,
                productName,
                body
            );

        const detectedAttributes =
            extractAttributes(
                mainKeyword,
                productName,
                body.brand
            );

        const prompt = `
${systemPrompt(
    category,
    "Strict factual SEO keyword generation"
)}

SELLER DATA:
${sellerData(body, category)}

PRODUCT NAME:
${productName}

PRIMARY SELLER KEYWORD:
${mainKeyword}

EXPLICIT ATTRIBUTES FOUND INSIDE PRIMARY KEYWORD:
${detectedAttributes.length
    ? detectedAttributes.join(", ")
    : "None"
}

SEO RULES:

1. Use only seller-provided facts.
2. Never invent missing product information.
3. Use the primary seller keyword first.
4. If the primary keyword contains multiple factual
   attributes, create natural combinations using those
   exact attributes.
5. Do not create filler only to reach 20 keywords.
6. Do not use:
   online, buy, shop, shopping, best, premium,
   trendy, stylish, latest, cheap, price, collection,
   store, apparel, wear.
7. Do not invent gender.
8. Do not invent occasion.
9. Do not invent material.
10. Do not invent color.
11. Do not invent size.
12. Do not invent compatibility.
13. Do not invent benefits.
14. Do not repeat the same keyword unnecessarily.
15. Every keyword must remain directly relevant to
    the seller's product.

EXAMPLE:

Product Name:
Cotton Kurti

Primary Seller Keyword:
Blue floral print cotton kurti

Useful factual keywords can include:

Blue Cotton Kurti
Floral Cotton Kurti
Floral Print Cotton Kurti
Blue Floral Cotton Kurti
Blue Floral Print Kurti
Cotton Floral Print Kurti
Floral Print Kurti

Never create:

Cotton Kurti Online
Buy Cotton Kurti
Best Cotton Kurti
Premium Cotton Kurti
Cotton Kurti Collection

Return:

{
  "keywords": []
}
`;

        // Gemini suggestions are optional.
        // If Gemini fails, factual keywords still work.

        let aiKeywords = [];

        try {

            const text =
                await callGemini(prompt);

            const result =
                parseJSON(text);

            if (
                Array.isArray(
                    result.keywords
                )
            ) {

                aiKeywords =
                    result.keywords
                        .map(cleanKeyword)
                        .filter(Boolean);
            }

        } catch (error) {

            console.error(
                "SEO Gemini suggestions failed:",
                error?.message || error
            );
        }

        // Factual keywords MUST come first.

        let keywords =
            filterSEOKeywords(
                [
                    mainKeyword,
                    ...factualKeywords,
                    ...aiKeywords
                ],
                productName
            );

        // Main keyword must remain first.

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
            unique(keywords)
                .slice(0, 20);

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

    } catch (error) {

        return generationError(
            res,
            error,
            "Unable to generate SEO keywords."
        );
    }
}

// ==========================================================
// COMPLETE LISTING GENERATOR
// ==========================================================

async function generateListing(
    req,
    res
) {

    try {

        const body = req.body || {};

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

        const mainKeyword =
            cleanKeyword(
                body.mainKeyword ||
                body.keyword ||
                body.productDetails ||
                productName
            );

        const prompt = `
${systemPrompt(
    category,
    "Complete marketplace product listing generation"
)}

SELLER DATA:
${sellerData(body, category)}

Create a complete factual marketplace listing.

RULES:

- Use seller facts only.
- Never invent missing information.
- Never invent benefits.
- Never invent specifications.
- Never create unsupported claims.
- Keywords must be factual and product relevant.

Return JSON:

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
            await callGemini(prompt);

        const listing =
            parseJSON(text);

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
                    .map(cleanKeyword)
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

        // Add factual SEO combinations.

        const factualKeywords =
            buildFactualSEO(
                mainKeyword,
                productName,
                body
            );

        listing.keywords =
            unique([
                ...factualKeywords,
                ...listing.keywords
            ]).slice(0, 20);

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

    } catch (error) {

        return generationError(
            res,
            error,
            "Unable to generate product listing."
        );
    }
}

// ==========================================================
// HASHTAG GENERATOR
// ==========================================================

async function generateHashtags(
    req,
    res
) {

    try {

        const body = req.body || {};

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
${systemPrompt(
    category,
    "Product hashtag generation"
)}

SELLER DATA:
${sellerData(body, category)}

Create relevant factual hashtags.

Do not invent product attributes.
Do not create unsupported claims.
Return 5-15 useful hashtags.

Return:

{
  "hashtags": []
}
`;

        const text =
            await callGemini(prompt);

        const result =
            parseJSON(text);

        const hashtags =
            Array.isArray(
                result.hashtags
            )
                ? unique(
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

    } catch (error) {

        return generationError(
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

${listing.highlights
    .map(
        item => `• ${item}`
    )
    .join("\n")}


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
// ROOT
// ==========================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

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
});

// ==========================================================
// STATUS
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
                MODEL
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

            version:
                VERSION
        });
    }
);

// ==========================================================
// API ROUTES
// ==========================================================

app.post(
    "/api/generate-title",
    generateTitle
);

app.post(
    "/api/generate-description",
    generateDescription
);

app.post(
    "/api/generate-seo",
    generateSEO
);

app.post(
    "/api/generate-listing",
    generateListing
);

app.post(
    "/api/generate-hashtags",
    generateHashtags
);

// ==========================================================
// BACKWARD COMPATIBILITY
// ==========================================================

app.post(
    "/generate",
    generateListing
);

app.post(
    "/api/generate",
    generateListing
);

app.post(
    "/api/generate-keywords",
    generateSEO
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
                req.originalUrl,

            version:
                VERSION
        });
    }
);

// ==========================================================
// GLOBAL ERROR
// ==========================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Server Error:",
            err
        );

        res.status(500).json({

            success: false,

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
            "SEO Engine: FACTUAL ATTRIBUTE COMBINATION"
        );

        console.log(
            "Gemini API: INTERACTIONS"
        );

        console.log(
            "=============================================="
        );
    }
);
