// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 25.0
// Category-Aware + Strict Factual AI
// Gemini Interactions API
// SEO Attribute Engine
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
const VERSION = "25.0";

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

app.use(express.json({ limit: "2mb" }));

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
provided them. Never invent gender, fabric, color, size, pattern,
fit, occasion, comfort, quality, certification or features.
`,

    "Beauty": `
Product type, form/texture, shade/color, quantity, variant,
ingredients, skin type, hair type, fragrance, brand and seller-
provided features may be used. Never invent ingredients, benefits,
medical claims, treatment results, certifications or performance.
`,

    "Electronics": `
Product type, brand, model, color, storage, RAM, battery,
connectivity, compatibility, warranty, quantity and features may
be used only when provided. Never invent technical specifications.
`,

    "Home & Kitchen": `
Product type, material, color, size, dimensions, capacity,
quantity, usage and seller-provided features may be used. Never
invent capacity, dimensions, material, leak-proof, BPA-free,
heat-resistance or similar claims.
`,

    "Shoes": `
Product type, size, color, material, sole type, closure, style,
quantity, brand and seller-provided features may be used. Never
invent size, material, sole type, comfort or durability claims.
`,

    "Jewellery": `
Product type, material, color, design, size, stone/gemstone,
quantity, brand and seller-provided features may be used. Never
claim gold, silver, diamond, gemstone, purity or precious metal
unless explicitly supplied by the seller.
`,

    "Toys": `
Product type, age range, material, size, quantity and features may
be used only when seller provided them. Never invent age suitability,
safety certification, educational claims or safety claims.
`,

    "Books": `
Book title, author, pages, format, edition, quantity, language,
genre, publisher, ISBN and brand may be used only when provided.
Never invent author, pages, edition, publisher, language or ISBN.
`,

    "Pet": `
Product type, pet type, material, size, quantity, color,
compatibility, usage and features may be used only when provided.
Never invent pet suitability, health benefits, safety or
compatibility.
`,

    "Sports": `
Product type, material, size, weight, quantity, usage, included
items and features may be used only when provided. Never invent
performance claims, weight or included accessories.
`,

    "Automotive": `
Product type, vehicle compatibility, material, size, model, part
number, quantity and features may be used only when provided. Never
invent vehicle compatibility, part number, installation requirements
or technical specifications.
`,

    "Garden": `
Product type, material, size, quantity, color, usage, compatibility
and features may be used only when provided. Never invent capacity,
durability, chemical properties, plant suitability or performance.
`,

    "Food": `
Product type, quantity, flavor, ingredients, packaging, variant and
brand may be used only when provided. Never invent ingredients,
nutrition, health benefits, expiry date, certifications or dietary
claims.
`,

    "Gifts": `
Product type, material, color, size, quantity, occasion, included
items and features may be used only when provided. Never invent
included items, material, occasion, personalization or features.
`
};

// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(value) {
    const text = cleanText(value).toLowerCase();

    const map = {
        "fashion": "Fashion",
        "fashion & clothing": "Fashion",
        "clothing": "Fashion",

        "beauty": "Beauty",
        "personal care": "Beauty",

        "electronics": "Electronics",

        "home & kitchen": "Home & Kitchen",
        "home and kitchen": "Home & Kitchen",
        "home kitchen": "Home & Kitchen",

        "shoes": "Shoes",
        "footwear": "Shoes",

        "jewellery": "Jewellery",
        "jewelry": "Jewellery",

        "toys": "Toys",
        "toys & kids": "Toys",
        "toys and kids": "Toys",

        "books": "Books",
        "book": "Books",
        "books & stationery": "Books",

        "pet": "Pet",
        "pets": "Pet",

        "sports": "Sports",
        "sports & fitness": "Sports",
        "fitness": "Sports",

        "automotive": "Automotive",
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
    if (value === undefined || value === null) return "";
    return String(value).trim();
}

function cleanSEOKeyword(value) {
    return cleanText(value)
        .replace(/[\r\n]+/g, " ")
        .replace(/\s+/g, " ")
        .replace(/^[\s,;|]+|[\s,;|]+$/g, "")
        .trim();
}

function uniqueStrings(values) {
    const result = [];
    const seen = new Set();

    for (const value of values || []) {
        const text = cleanText(value);
        if (!text) continue;

        const key = text.toLowerCase().replace(/\s+/g, " ").trim();
        if (seen.has(key)) continue;

        seen.add(key);
        result.push(text);
    }

    return result;
}

function normalizeWords(value) {
    return cleanSEOKeyword(value)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean);
}

function pushKeyword(list, value) {
    const keyword = cleanSEOKeyword(value);
    if (!keyword) return;

    const key = keyword.toLowerCase().replace(/\s+/g, " ").trim();

    if (!list.some(item =>
        item.toLowerCase().replace(/\s+/g, " ").trim() === key
    )) {
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
        if (value) pushKeyword(facts, value);
    }

    if (body.categoryData && typeof body.categoryData === "object") {
        for (const value of Object.values(body.categoryData)) {
            const text = cleanText(value);
            if (text) pushKeyword(facts, text);
        }
    }

    return facts;
}

// ==========================================================
// INLINE SEO ATTRIBUTE ENGINE
// ==========================================================

function findSequence(sourceTokens, targetTokens) {
    if (!sourceTokens.length || !targetTokens.length) return -1;

    for (let i = 0; i <= sourceTokens.length - targetTokens.length; i++) {
        let matched = true;

        for (let j = 0; j < targetTokens.length; j++) {
            if (sourceTokens[i + j] !== targetTokens[j]) {
                matched = false;
                break;
            }
        }

        if (matched) return i;
    }

    return -1;
}

function extractInlineSEOAttributes(mainKeyword, productName, brand) {
    const source = normalizeWords(mainKeyword);
    const product = normalizeWords(productName);

    if (!source.length || !product.length) {
        return { descriptors: [], prefix: [], suffix: [] };
    }

    const start = findSequence(source, product);

    let remaining = [];
    let prefix = [];
    let suffix = [];

    if (start >= 0) {
        prefix = source.slice(0, start);
        suffix = source.slice(start + product.length);
        remaining = [...prefix, ...suffix];
    } else {
        remaining = [...source];

        // Remove exact product-name words once, but never invent anything.
        for (const token of product) {
            const index = remaining.indexOf(token);
            if (index >= 0) remaining.splice(index, 1);
        }
    }

    // Brand is factual, but it should not become an inline attribute
    // when the seller already supplied it separately.
    const brandTokens = normalizeWords(brand);
    for (const token of brandTokens) {
        const index = remaining.indexOf(token);
        if (index >= 0) remaining.splice(index, 1);
    }

    return {
        descriptors: uniqueStrings(remaining),
        prefix,
        suffix
    };
}

function buildInlineSEOKeywords(mainKeyword, productName, brand) {
    const result = [];

    const source = cleanSEOKeyword(mainKeyword);
    const product = cleanSEOKeyword(productName);

    if (!source || !product) return result;

    const sourceTokens = normalizeWords(source);
    const productTokens = normalizeWords(product);

    if (!sourceTokens.length || !productTokens.length) return result;

    // Always start with the clean product phrase. The raw seller sentence
    // is metadata only and must never become an SEO keyword.
    pushKeyword(result, product);

    const inline = extractInlineSEOAttributes(source, product, brand);
    const descriptors = inline.descriptors;

    if (!descriptors.length) return result;

    const productHead = productTokens[productTokens.length - 1];
    const productPrefix = productTokens.slice(0, -1).join(" ");

    const d1 = descriptors[0] || "";
    const d2 = descriptors[1] || "";
    const d3 = descriptors[2] || "";
    const d4 = descriptors[3] || "";

    // Strong single-attribute combinations.
    if (d1) pushKeyword(result, `${d1} ${product}`);
    if (d2) pushKeyword(result, `${d2} ${product}`);

    // Strong pair combinations in source order.
    if (d2 && d3) {
        pushKeyword(result, `${d2} ${d3} ${product}`);
    }

    if (d1 && d2) {
        pushKeyword(result, `${d1} ${d2} ${product}`);
    }

    // Remove duplicate product modifiers from the full descriptor phrase
    // by using the product head. Example: Blue Floral Print Kurti.
    if (descriptors.length >= 2) {
        pushKeyword(result, `${descriptors.join(" ")} ${productHead}`);
    }

    // Example: Cotton Floral Print Kurti.
    if (productPrefix && d2 && d3) {
        pushKeyword(
            result,
            `${productPrefix} ${d2} ${d3} ${productHead}`
        );
    }


    // Example: Floral Print Kurti.
    if (d2 && d3) {
        pushKeyword(
            result,
            `${d2} ${d3} ${productHead}`
        );
    }

    // Extra combinations only when four or more explicit attributes exist.
    if (descriptors.length >= 4) {
        pushKeyword(result, `${d1} ${d2} ${d3} ${product}`);
        pushKeyword(result, `${d1} ${d2} ${d4} ${product}`);
        pushKeyword(result, `${d2} ${d3} ${d4} ${product}`);
        pushKeyword(result, `${d1} ${product} ${d2} ${d3}`);
    }

    return result;
}

// ==========================================================
// FACTUAL SEO BUILDER
// ==========================================================

function buildFactualSEOKeywords(mainKeyword, productName, facts, body = {}) {
    const result = [];
    const product = cleanSEOKeyword(productName);
    const main = cleanSEOKeyword(mainKeyword);
    const brand = cleanSEOKeyword(body.brand);

    // 1. Inline seller-provided attributes first.
    for (const keyword of buildInlineSEOKeywords(main, product, brand)) {
        pushKeyword(result, keyword);
    }

    // 2. Structured facts after inline attributes.
    const usefulFacts = Array.isArray(facts) ? facts : [];
    const nonBrandFacts = usefulFacts.filter(fact => {
        const value = cleanSEOKeyword(fact);
        if (!value) return false;
        if (!brand) return true;
        return value.toLowerCase() !== brand.toLowerCase();
    });

    for (const fact of nonBrandFacts) {
        const cleanFact = cleanSEOKeyword(fact);
        if (!cleanFact) continue;

        pushKeyword(result, `${cleanFact} ${product}`);
        pushKeyword(result, `${product} ${cleanFact}`);
    }

    // 3. Factual fact + fact + product combinations.
    const limit = Math.min(nonBrandFacts.length, 8);

    for (let i = 0; i < limit; i++) {
        for (let j = i + 1; j < limit; j++) {
            const first = cleanSEOKeyword(nonBrandFacts[i]);
            const second = cleanSEOKeyword(nonBrandFacts[j]);

            if (!first || !second) continue;

            pushKeyword(result, `${first} ${second} ${product}`);
        }
    }

    // Brand is supplied separately and is intentionally not converted into
    // SEO combinations. This prevents brand duplication in SEO keywords.
    return result.slice(0, 30);
}

// ==========================================================
// SEO QUALITY FILTER — FAIL-SAFE
// ==========================================================

const SEO_BLOCKED_WORDS = new Set([
    "online", "buy", "shop", "shopping", "best", "premium", "trendy",
    "stylish", "latest", "cheap", "price", "collection", "store",
    "apparel", "wear", "guaranteed", "guarantee", "top", "number one",
    "no 1", "no.1"
]);

const SEO_CONNECTORS = new Set([
    "with", "and", "or", "for", "the", "a", "an", "is", "are",
    "of", "in", "on", "to", "from", "by", "as", "at", "color", "colour"
]);

function containsBlockedSEOWord(keyword) {
    const lower = cleanSEOKeyword(keyword).toLowerCase();
    return [...SEO_BLOCKED_WORDS].some(word =>
        lower === word || lower.includes(` ${word} `) ||
        lower.startsWith(`${word} `) || lower.endsWith(` ${word}`)
    );
}

function keywordContainsProduct(keyword, productName) {
    const k = new Set(normalizeWords(keyword));
    const p = normalizeWords(productName);
    if (!p.length) return false;
    // At least one meaningful product token must be present.
    return p.some(token => token.length >= 3 && k.has(token));
}

function keywordContainsFullBrand(keyword, brand) {
    const b = normalizeWords(brand);
    if (!b.length) return false;
    const k = new Set(normalizeWords(keyword));
    return b.every(token => k.has(token));
}

function hasDuplicateSEOToken(keyword) {
    const tokens = normalizeWords(keyword);
    return new Set(tokens).size !== tokens.length;
}

function hasBrokenMeasurement(keyword) {
    const parts = cleanSEOKeyword(keyword).split(/\s+/).filter(Boolean);
    const units = new Set(["ml", "l", "g", "kg", "mg", "cm", "mm", "m", "inch", "inches", "ft", "feet", "piece", "pieces"]);
    for (let i = 0; i < parts.length; i++) {
        const token = parts[i].toLowerCase();
        if (units.has(token)) {
            const prev = (parts[i - 1] || "").replace(/[,;:.]$/, "");
            if (!/^\d+(?:\.\d+)?$/.test(prev)) return true;
        }
    }
    return false;
}

function removeBrandFromProductName(productName, brand = "") {
    const product = cleanSEOKeyword(productName);
    const b = cleanSEOKeyword(brand);
    if (!product || !b) return product;
    const p = normalizeWords(product);
    const bt = normalizeWords(b);
    if (bt.length <= p.length && bt.every((t,i) => p[i] === t)) return p.slice(bt.length).join(" ");
    if (bt.length <= p.length && bt.every((t,i) => p[p.length-bt.length+i] === t)) return p.slice(0,-bt.length).join(" ");
    return product;
}

function hasAwkwardPostProductModifier(keyword, productName, mainKeyword = "", brand = "") {
    const valueTokens = normalizeWords(keyword);
    const productTokens = normalizeWords(removeBrandFromProductName(productName, brand));
    if (!valueTokens.length || !productTokens.length) return false;

    // Find the product phrase as a contiguous sequence. If a seller-provided
    // descriptor appears AFTER the complete product phrase, reject it.
    // Example rejected: "blue cotton kurti floral print".
    const start = findSequence(valueTokens, productTokens);
    if (start < 0) return false;

    const end = start + productTokens.length;
    const sourceTokens = normalizeWords(mainKeyword);
    const productSet = new Set(productTokens);
    const brandSet = new Set(normalizeWords(brand));
    const sourceNonProduct = sourceTokens.filter(t =>
        !productSet.has(t) && !brandSet.has(t) && !SEO_CONNECTORS.has(t)
    );

    if (!sourceNonProduct.length) return false;
    const after = valueTokens.slice(end);
    return after.some(token => sourceNonProduct.includes(token));
}

function isNaturalSEOKeyword(keyword, productName, brand = "") {
    const value = cleanSEOKeyword(keyword);
    if (!value) return false;
    if (/[.,!?;:|]/.test(value)) return false;
    if (containsBlockedSEOWord(value)) return false;
    if (hasDuplicateSEOToken(value)) return false;
    if (hasBrokenMeasurement(value)) return false;
    if (keywordContainsFullBrand(value, brand)) return false;
    if (hasAwkwardPostProductModifier(value, productName, mainKeyword, brand)) return false;

    const tokens = normalizeWords(value);
    if (tokens.some(token => SEO_CONNECTORS.has(token))) return false;
    if (!keywordContainsProduct(value, productName)) return false;

    return true;
}

function isValidSEOKeyword(keyword, productName, mainKeyword = "", brand = "") {
    return isNaturalSEOKeyword(keyword, productName, brand);
}

function filterSEOKeywords(keywords, productName, mainKeyword = "", brand = "") {
    const result = [];
    for (const keyword of uniqueStrings(keywords)) {
        if (!isValidSEOKeyword(keyword, productName, mainKeyword, brand)) continue;
        const normalized = normalizeWords(keyword).join(" ");
        if (result.some(existing => normalizeWords(existing).join(" ") === normalized)) continue;
        result.push(keyword);
        if (result.length >= 20) break;
    }
    return result;
}

// ==========================================================
// GEMINI PROMPT
// ==========================================================

function createSystemPrompt(category, task = "listing") {
    const rule = categoryRules[category] || "Use only seller-provided information.";

    return `
You are the official AI Product Listing Assistant for AI Seller Toolkit.

TASK: ${task}
CATEGORY: ${category}

STRICT FACTUAL POLICY:

1. Use ONLY information explicitly provided by the seller.
2. Never guess or fill missing specifications from general knowledge.
3. Never invent brand, model, material, fabric, color, size, weight,
   dimensions, battery, storage, RAM, processor, warranty,
   certification, ingredients, quantity, compatibility or features.
4. Never invent benefits, medical claims, performance claims,
   durability claims or safety claims.
5. Never turn an assumption into a fact.
6. If a seller field is missing, omit it.
7. Preserve seller-provided factual details accurately.
8. Do not use marketplace names as product facts.
9. Do not create generic promotional filler.
10. Never add Best, Premium, Guaranteed, No.1, Top Quality or similar
    claims unless the seller explicitly supplied the exact claim.

CATEGORY RULES:
${rule}

Return only the requested JSON object.
No Markdown.
No explanation outside JSON.
`;
}

// ==========================================================
// GEMINI INTERACTIONS API
// ==========================================================

function isRetryableError(error) {
    const status = Number(
        error?.status ||
        error?.code ||
        error?.response?.status ||
        0
    );

    const message = String(error?.message || "").toLowerCase();

    return (
        [429, 500, 502, 503, 504].includes(status) ||
        message.includes("429") ||
        message.includes("503") ||
        message.includes("rate limit") ||
        message.includes("resource exhausted") ||
        message.includes("unavailable") ||
        message.includes("high demand") ||
        message.includes("temporarily")
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGemini(prompt) {
    if (!ai) {
        const error = new Error("Gemini API key is not configured.");
        error.status = 500;
        throw error;
    }

    const delays = [2500, 5000, 9000];
    let lastError = null;

    for (let attempt = 1; attempt <= 4; attempt++) {
        try {
            console.log(`🤖 Gemini Interactions attempt ${attempt}/4`);
            console.log(`🧠 Model: ${MODEL}`);

            const interaction = await ai.interactions.create({
                model: MODEL,
                input: prompt
            });

            const text = cleanText(
                interaction?.output_text ||
                interaction?.outputText ||
                interaction?.text ||
                extractTextFromInteraction(interaction)
            );

            if (!text) {
                throw new Error("Gemini returned an empty response.");
            }

            return text;
        }
        catch (error) {
            lastError = error;

            console.error(
                `❌ Gemini attempt ${attempt} failed:`,
                error?.message || error
            );

            if (!isRetryableError(error) || attempt === 4) {
                throw error;
            }

            await sleep(delays[attempt - 1]);
        }
    }

    throw lastError;
}

function extractTextFromInteraction(interaction) {
    if (!interaction) return "";

    if (typeof interaction.output_text === "string") {
        return interaction.output_text;
    }

    if (typeof interaction.outputText === "string") {
        return interaction.outputText;
    }

    const pieces = [];

    function walk(value, depth = 0) {
        if (depth > 8 || value === null || value === undefined) return;

        if (typeof value === "string") return;

        if (Array.isArray(value)) {
            for (const item of value) walk(item, depth + 1);
            return;
        }

        if (typeof value !== "object") return;

        if (typeof value.text === "string") {
            pieces.push(value.text);
        }

        for (const [key, child] of Object.entries(value)) {
            if (key === "text") continue;
            walk(child, depth + 1);
        }
    }

    walk(interaction);

    return pieces.join("\n").trim();
}

// ==========================================================
// JSON PARSER
// ==========================================================

function parseJSONResponse(text) {
    let cleaned = cleanText(text)
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    }
    catch (_) {
        const first = cleaned.indexOf("{");
        const last = cleaned.lastIndexOf("}");

        if (first >= 0 && last > first) {
            try {
                return JSON.parse(
                    cleaned.slice(first, last + 1)
                );
            }
            catch (_) {}
        }

        throw new Error("AI returned invalid JSON.");
    }
}

// ==========================================================
// COMMON SELLER DATA TEXT
// ==========================================================

function buildSellerData(body, category) {
    const categoryData =
        body.categoryData &&
        typeof body.categoryData === "object"
            ? body.categoryData
            : {};

    const categoryFieldsText = Object.entries(categoryData)
        .filter(([, value]) => cleanText(value))
        .map(([key, value]) => `${key}: ${cleanText(value)}`)
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
${cleanText(body.mainKeyword || body.keyword) || "Not provided"}

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
${cleanText(body.sole || body.soleType) || "Not provided"}

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

async function handleGenerateTitle(req, res) {
    try {
        const body = req.body || {};
        const category = normalizeCategory(body.category);
        const productName = cleanText(body.productName);

        if (!category) {
            return res.status(400).json({
                success: false,
                error: "Product category is required."
            });
        }

        if (!productName) {
            return res.status(400).json({
                success: false,
                error: "Product name is required."
            });
        }

        const prompt = `${createSystemPrompt(category, "title generation")}

Create one marketplace product title.

${buildSellerData(body, category)}

TITLE RULES:
- Use only seller-provided facts.
- Do not invent attributes.
- Keep it concise and product-focused.
- Do not add online, buy, shop, best, premium, trendy or stylish.
- Return JSON only:
{"title":""}
`;

        const text = await callGemini(prompt);
        const result = parseJSONResponse(text);
        const title = cleanText(result.title);

        if (!title) {
            throw new Error("AI returned an empty title.");
        }

        return res.json({
            success: true,
            category,
            productName,
            title,
            result: title,
            data: { title },
            version: VERSION
        });
    }
    catch (error) {
        return sendGenerationError(res, error, "Unable to generate product title.");
    }
}

// ==========================================================
// DESCRIPTION GENERATOR
// ==========================================================

async function handleGenerateDescription(req, res) {
    try {
        const body = req.body || {};
        const category = normalizeCategory(body.category);
        const productName = cleanText(body.productName);

        if (!category) {
            return res.status(400).json({
                success: false,
                error: "Product category is required."
            });
        }

        if (!productName) {
            return res.status(400).json({
                success: false,
                error: "Product name is required."
            });
        }

        const prompt = `${createSystemPrompt(category, "description generation")}

Create one factual marketplace product description.

${buildSellerData(body, category)}

DESCRIPTION RULES:
- Mention only seller-provided facts.
- Do not invent benefits or specifications.
- Do not use promotional claims that were not provided.
- Return JSON only:
{"description":""}
`;

        const text = await callGemini(prompt);
        const result = parseJSONResponse(text);
        const description = cleanText(result.description);

        if (!description) {
            throw new Error("AI returned an empty description.");
        }

        return res.json({
            success: true,
            category,
            productName,
            description,
            result: description,
            data: { description },
            version: VERSION
        });
    }
    catch (error) {
        return sendGenerationError(res, error, "Unable to generate product description.");
    }
}

// ==========================================================
// SEO GENERATOR — MAIN FIX
// ==========================================================

async function handleGenerateSEO(req, res) {
    try {
        const body = req.body || {};
        const category = normalizeCategory(body.category);
        const productName = cleanSEOKeyword(body.productName || body.product);

        if (!category) {
            return res.status(400).json({ success: false, error: "Product category is required." });
        }
        if (!productName) {
            return res.status(400).json({ success: false, error: "Product name is required." });
        }

        // Permanent fix: no undeclared local named mainKeyword is ever used.
        // Accept old and new frontend payloads through one safe variable.
        const seoInput = cleanSEOKeyword(
            body.productDetails || body.mainKeyword || body.keyword || productName
        );

        // V24 compatibility alias: older frontend/backend code may refer to
        // mainKeyword. Keep it explicitly declared so it can NEVER become
        // a ReferenceError. All SEO processing uses seoInput as the source.
        const mainKeyword = seoInput;

        const brand = cleanSEOKeyword(body.brand || "");
        const facts = collectSellerFacts(body);

        const deterministicKeywords = buildFactualSEOKeywords(
            seoInput,
            productName,
            facts,
            body
        );

        const inline = buildInlineSEOKeywords(seoInput, productName, brand);
        const inlineFacts = uniqueStrings(extractInlineSEOAttributes(seoInput, productName, brand).descriptors);

        const prompt = `${createSystemPrompt(category, "strict factual SEO keyword generation")}

Generate relevant SEO keywords for this seller product.

${buildSellerData(body, category)}

PRODUCT NAME:
${productName}

SELLER-PROVIDED PRODUCT DETAILS:
${seoInput || "Not provided"}

EXPLICIT ATTRIBUTES:
${inlineFacts.length ? inlineFacts.join(", ") : "None"}

STRICT SEO RULES:
- Use only seller-provided product facts.
- Never invent specifications or claims.
- Do not use the separately supplied brand in SEO keyword combinations.
- Do not split measurement values into separate words.
- Do not use connector-led phrases such as "with product".
- Do not use generic words such as online, buy, shop, best, premium, trendy, stylish, latest, cheap, price, collection, store, apparel or wear.
- Do not return duplicate or trivial word-order variations.
- Do not return a sentence; return short natural product search phrases.
- If only 1-5 genuinely relevant keywords are possible, return only those.

Return JSON only:
{"keywords":[]}
`;

        let aiKeywords = [];
        try {
            const aiText = await callGemini(prompt);
            const aiResult = parseJSONResponse(aiText);
            if (Array.isArray(aiResult.keywords)) {
                aiKeywords = aiResult.keywords.map(cleanSEOKeyword).filter(Boolean);
            }
        } catch (error) {
            console.error("⚠️ SEO Gemini suggestions failed:", error?.message || error);
        }

        const combined = [
            ...deterministicKeywords,
            ...aiKeywords,
            productName
        ];

        const keywords = filterSEOKeywords(
            combined,
            productName,
            seoInput,
            brand
        ).slice(0, 6);

        return res.json({
            success: true,
            category,
            productName,
            mainKeyword: seoInput,
            keywords,
            seoKeywords: keywords,
            data: { keywords, seoKeywords: keywords },
            text: keywords.join("\n"),
            count: keywords.length,
            version: VERSION
        });
    } catch (error) {
        console.error("❌ SEO endpoint error:", error?.stack || error?.message || error);
        return sendGenerationError(res, error, "Unable to generate SEO keywords.");
    }
}

// ==========================================================
// COMPLETE LISTING GENERATOR
// ==========================================================

async function handleGenerateListing(req, res) {
    try {
        const body = req.body || {};
        const category = normalizeCategory(body.category);
        const productName = cleanText(body.productName);

        if (!category) {
            return res.status(400).json({
                success: false,
                error: "Product category is required."
            });
        }

        if (!productName) {
            return res.status(400).json({
                success: false,
                error: "Product name is required."
            });
        }

        const prompt = `${createSystemPrompt(category, "complete marketplace listing generation")}

Create a complete marketplace product listing.

${buildSellerData(body, category)}

OUTPUT RULES:
- title: one factual title
- description: one factual description
- highlights: 3-8 factual bullet points when enough seller facts exist
- keywords: relevant factual product keywords only
- hashtags: relevant factual hashtags only
- seoTitle: factual SEO title
- seoDescription: factual SEO description

Never invent missing information.
Never use generic SEO filler.
Return JSON only:
{
  "title":"",
  "description":"",
  "highlights":[],
  "keywords":[],
  "hashtags":[],
  "seoTitle":"",
  "seoDescription":""
}
`;

        const text = await callGemini(prompt);
        const listing = parseJSONResponse(text);

        listing.title = cleanText(listing.title);
        listing.description = cleanText(listing.description);
        listing.seoTitle = cleanText(listing.seoTitle);
        listing.seoDescription = cleanText(listing.seoDescription);
        listing.highlights = Array.isArray(listing.highlights)
            ? listing.highlights.map(cleanText).filter(Boolean)
            : [];
        listing.keywords = Array.isArray(listing.keywords)
            ? listing.keywords.map(cleanSEOKeyword).filter(Boolean)
            : [];
        listing.hashtags = Array.isArray(listing.hashtags)
            ? listing.hashtags.map(cleanText).filter(Boolean)
            : [];

        // Ensure complete listing never loses seller-factual SEO combinations.
        const seoFacts = collectSellerFacts(body);
        const seoMainKeyword = cleanSEOKeyword(
            body.mainKeyword ||
            body.keyword ||
            body.productDetails ||
            productName
        );

        const factualKeywords = buildFactualSEOKeywords(
            seoMainKeyword,
            productName,
            seoFacts,
            body
        );

        listing.keywords = uniqueStrings([
            ...factualKeywords,
            ...listing.keywords
        ]).slice(0, 20);

        if (!listing.title) listing.title = productName;
        if (!listing.description) listing.description = productName;
        if (!listing.seoTitle) listing.seoTitle = listing.title;
        if (!listing.seoDescription) listing.seoDescription = listing.description;

        return res.json({
            success: true,
            category,
            productName,
            listing,
            data: listing,
            result: formatListing(listing),
            version: VERSION
        });
    }
    catch (error) {
        return sendGenerationError(res, error, "Unable to generate product listing.");
    }
}

// ==========================================================
// OPTIONAL HASH TAG GENERATOR
// Keeps the backend useful if a frontend calls it.
// ==========================================================

async function handleGenerateHashtags(req, res) {
    try {
        const body = req.body || {};
        const category = normalizeCategory(body.category);
        const productName = cleanText(body.productName);

        if (!category) {
            return res.status(400).json({
                success: false,
                error: "Product category is required."
            });
        }

        if (!productName) {
            return res.status(400).json({
                success: false,
                error: "Product name is required."
            });
        }

        const prompt = `${createSystemPrompt(category, "hashtag generation")}

Create relevant product hashtags.

${buildSellerData(body, category)}

Rules:
- Use only seller-provided product facts.
- Do not invent attributes.
- Do not use promotional claims.
- Return 5-15 relevant hashtags when enough facts exist.
- Return JSON only: {"hashtags":[]}
`;

        const text = await callGemini(prompt);
        const result = parseJSONResponse(text);
        const hashtags = Array.isArray(result.hashtags)
            ? uniqueStrings(result.hashtags).slice(0, 15)
            : [];

        return res.json({
            success: true,
            category,
            productName,
            hashtags,
            data: { hashtags },
            result: hashtags.join(" "),
            version: VERSION
        });
    }
    catch (error) {
        return sendGenerationError(res, error, "Unable to generate hashtags.");
    }
}

// ==========================================================
// FORMAT LISTING FOR OLD FRONTENDS
// ==========================================================

function formatListing(listing) {
    return `
TITLE

${listing.title}


DESCRIPTION

${listing.description}


HIGHLIGHTS

${listing.highlights.map(item => `• ${item}`).join("\n")}


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
// ERROR HANDLER FOR GENERATION ENDPOINTS
// ==========================================================

function sendGenerationError(res, error, fallbackMessage) {
    console.error("❌ Generation Error:", error?.message || error);

    const status = Number(
        error?.status ||
        error?.code ||
        error?.response?.status ||
        0
    );

    const message = String(error?.message || "");
    const lower = message.toLowerCase();

    if (
        status === 429 ||
        lower.includes("429") ||
        lower.includes("rate limit") ||
        lower.includes("resource exhausted")
    ) {
        return res.status(429).json({
            success: false,
            error: "Gemini request limit was reached. Please try again shortly.",
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
            error: "Gemini is temporarily busy. Please try again shortly.",
            retryable: true,
            version: VERSION
        });
    }

    return res.status(500).json({
        success: false,
        error: message || fallbackMessage,
        version: VERSION
    });
}

// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Seller Toolkit Backend is running",
        version: VERSION,
        model: MODEL,
        geminiConfigured: !!GEMINI_API_KEY,
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

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        server: "online",
        version: VERSION,
        model: MODEL,
        geminiConfigured: !!GEMINI_API_KEY
    });
});

// ==========================================================
// CATEGORIES
// ==========================================================

app.get("/api/categories", (req, res) => {
    res.json({
        success: true,
        categories: CATEGORIES
    });
});

// ==========================================================
// POST ENDPOINTS
// ==========================================================

app.post("/api/generate-title", handleGenerateTitle);
app.post("/api/generate-description", handleGenerateDescription);
app.post("/api/generate-seo", handleGenerateSEO);
app.post("/api/generate-listing", handleGenerateListing);
app.post("/api/generate-hashtags", handleGenerateHashtags);

// Existing compatibility endpoint.
app.post("/generate", handleGenerateListing);

// Extra compatibility aliases.
app.post("/api/generate", handleGenerateListing);
app.post("/api/generate-keywords", handleGenerateSEO);

// ==========================================================
// 404
// ==========================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "API endpoint not found",
        path: req.originalUrl,
        version: VERSION
    });
});

// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        error: "Internal server error",
        version: VERSION
    });
});

// ==========================================================
// START SERVER
// ==========================================================

app.listen(PORT, "0.0.0.0", () => {
    console.log("==============================================");
    console.log("AI SELLER TOOLKIT BACKEND");
    console.log(`Version: ${VERSION}`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Gemini Model: ${MODEL}`);
    console.log(`Gemini API: ${GEMINI_API_KEY ? "CONFIGURED" : "NOT CONFIGURED"}`);
    console.log("Categories: 14");
    console.log("SEO Engine: FACTUAL ATTRIBUTE COMBINATION");
    console.log("Gemini API: INTERACTIONS");
    console.log("==============================================");
});
