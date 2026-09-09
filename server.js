// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 32.0
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
const VERSION = "32.0";

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

function seoTokens(value) {
    return normalizeWords(value)
        .map(token => token.toLowerCase())
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

function groupSEOAttributeTokens(tokens) {
    const units = new Set([
        "ml", "l", "g", "kg", "mg", "cm", "mm", "m",
        "inch", "inches", "in", "piece", "pieces", "pcs",
        "pack", "packs", "set", "sets"
    ]);

    const result = [];

    for (let i = 0; i < tokens.length; i++) {
        const current = tokens[i];
        const next = (tokens[i + 1] || "").toLowerCase();

        // Keep measurements together: "8 inch" is ONE attribute.
        if (/^\d+(?:\.\d+)?$/.test(current) && units.has(next)) {
            result.push(`${current} ${next}`);
            i++;
            continue;
        }

        result.push(current);
    }

    return result;
}

function removeTokenSequence(tokens, targetTokens) {
    const copy = [...tokens];
    if (!targetTokens.length) return copy;

    for (let i = 0; i <= copy.length - targetTokens.length; i++) {
        let matched = true;
        for (let j = 0; j < targetTokens.length; j++) {
            if (copy[i + j] !== targetTokens[j]) {
                matched = false;
                break;
            }
        }
        if (matched) {
            copy.splice(i, targetTokens.length);
            return copy;
        }
    }

    // Fallback: remove matching words once, preserving seller order.
    for (const token of targetTokens) {
        const index = copy.indexOf(token);
        if (index >= 0) copy.splice(index, 1);
    }
    return copy;
}

function extractInlineSEOAttributes(mainKeyword, productName, brand) {
    const sourceTokens = normalizeWords(mainKeyword);
    const productTokens = normalizeWords(productName);

    if (!sourceTokens.length || !productTokens.length) {
        return { descriptors: [], prefix: [], suffix: [] };
    }

    const start = findSequence(sourceTokens, productTokens);

    let prefix = [];
    let suffix = [];
    let remaining = [];

    if (start >= 0) {
        prefix = sourceTokens.slice(0, start);
        suffix = sourceTokens.slice(start + productTokens.length);
        remaining = [...prefix, ...suffix];
    } else {
        remaining = removeTokenSequence(sourceTokens, productTokens);
    }

    // Brand is factual but should not become an inline attribute when it is
    // already supplied separately.
    remaining = removeTokenSequence(remaining, normalizeWords(brand));

    return {
        descriptors: groupSEOAttributeTokens(remaining),
        prefix: groupSEOAttributeTokens(prefix),
        suffix: groupSEOAttributeTokens(suffix)
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

    pushKeyword(result, source);
    pushKeyword(result, product);

    const inline = extractInlineSEOAttributes(source, product, brand);
    const descriptors = inline.descriptors.filter(Boolean);
    if (!descriptors.length) return result;

    // One explicit attribute + product.
    for (const descriptor of descriptors) {
        pushKeyword(result, `${descriptor} ${product}`);
    }

    // Adjacent seller-order attribute combinations.
    for (let i = 0; i < descriptors.length - 1; i++) {
        pushKeyword(result, `${descriptors[i]} ${descriptors[i + 1]} ${product}`);
    }

    // 3+ attributes: useful natural combinations, without random word shuffling.
    if (descriptors.length >= 3) {
        pushKeyword(result, `${descriptors.slice(0, 2).join(" ")} ${product}`);
        pushKeyword(result, `${descriptors.slice(1, 3).join(" ")} ${product}`);
        pushKeyword(result, `${descriptors.slice(0, 3).join(" ")} ${product}`);
    }

    // Product-head variants are allowed only when they remain natural.
    const productHead = productTokens[productTokens.length - 1];
    if (descriptors.length >= 2) {
        pushKeyword(result, `${descriptors[0]} ${descriptors[1]} ${productHead}`);
    }
    if (descriptors.length >= 3) {
        pushKeyword(result, `${descriptors[1]} ${descriptors[2]} ${productHead}`);
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

    // 4. Brand last, so attribute keywords are not pushed down.
    if (brand) {
        pushKeyword(result, `${brand} ${product}`);
    }

    return result.slice(0, 30);
}

// ==========================================================
// SEO QUALITY FILTER
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

function containsBlockedSEOWord(keyword) {
    const lower = keyword.toLowerCase();

    for (const blocked of SEO_BLOCKED_WORDS) {
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

function keywordContainsProduct(keyword, productName) {
    const keywordTokens = seoTokens(keyword);
    const productTokens = seoTokens(productName);

    if (!productTokens.length) return false;

    // Keep meaningful product connection. For multi-word product names,
    // require at least two product words unless the product itself is one word.
    const matches = productTokens.filter(token => keywordTokens.includes(token));
    if (productTokens.length === 1) return matches.length === 1;
    return matches.length >= Math.min(2, productTokens.length);
}

function hasBrokenMeasurement(keyword) {
    const parts = cleanSEOKeyword(keyword)
        .split(/\s+/)
        .filter(Boolean);

    const units = new Set([
        "ml", "l", "g", "kg", "mg", "cm", "mm", "m",
        "inch", "inches", "in", "piece", "pieces", "pcs",
        "pack", "packs", "set", "sets"
    ]);

    for (let i = 0; i < parts.length; i++) {
        const token = parts[i].toLowerCase().replace(/[,.;]$/, "");

        // A unit is valid only when immediately preceded by a number.
        if (units.has(token)) {
            const previous = (parts[i - 1] || "").replace(/[,.;]$/, "");
            if (!/^\d+(?:\.\d+)?$/.test(previous)) return true;
        }

        // A bare number must be followed by a measurement unit.
        if (/^\d+(?:\.\d+)?$/.test(token)) {
            const next = (parts[i + 1] || "").toLowerCase().replace(/[,.;]$/, "");
            if (!units.has(next)) return true;
        }
    }

    return false;
}

function hasUnsupportedSEOWord(keyword, mainKeyword, productName, brand, body = {}) {
    const allowed = new Set();

    const add = value => {
        for (const token of seoTokens(value)) allowed.add(token);
    };

    add(mainKeyword);
    add(productName);
    add(brand);

    const facts = collectSellerFacts(body);
    for (const fact of facts) add(fact);

    // Every SEO word must originate from seller-provided text.
    // This blocks AI additions such as "garden" when the seller never
    // supplied that word, while still allowing exact factual combinations.
    for (const token of seoTokens(keyword)) {
        if (!allowed.has(token)) return true;
    }

    return false;
}

function hasUnnaturalBrandPlacement(keyword, brand, productName) {
    const value = cleanSEOKeyword(keyword).toLowerCase();
    const b = cleanSEOKeyword(brand).toLowerCase();
    const p = cleanSEOKeyword(productName).toLowerCase();

    if (!b || !value) return false;

    // Brand must appear before the product, never as a suffix.
    if (value.endsWith(` ${b}`)) return true;
    if (value.includes(` ${b} `)) {
        const brandIndex = value.indexOf(b);
        const productIndex = value.indexOf(p);
        if (productIndex >= 0 && brandIndex > productIndex) return true;
    }

    return false;
}

function hasBadCharacterTypo(keyword) {
    // Catch common look-alike OCR/AI substitutions such as pIastic/pIant.
    return /pIastic|pIant|cIoth|cIothing|gIass/i.test(keyword);
}

function extractNaturalSEOSource(mainKeyword, productName, brand) {
    const source = cleanSEOKeyword(mainKeyword);
    const product = cleanSEOKeyword(productName);
    const inline = extractInlineSEOAttributes(source, product, brand);

    return {
        sourceTokens: seoTokens(source),
        productTokens: seoTokens(product),
        descriptors: uniqueStrings(inline.descriptors.map(cleanSEOKeyword).filter(Boolean)),
        prefix: cleanSEOKeyword(inline.prefix),
        suffix: cleanSEOKeyword(inline.suffix)
    };
}

function hasBadDescriptorOrder(keyword, mainKeyword, productName, brand) {
    const source = extractNaturalSEOSource(mainKeyword, productName, brand);
    const keywordTokens = seoTokens(keyword);
    const descriptors = source.descriptors.map(d => seoTokens(d).join(" ")).filter(Boolean);

    if (descriptors.length < 2) return false;

    // Work with descriptor phrases rather than individual words.
    const present = [];
    for (let i = 0; i < descriptors.length; i++) {
        const phraseTokens = descriptors[i].split(" ");
        const positions = [];
        for (const token of phraseTokens) {
            const pos = keywordTokens.indexOf(token);
            if (pos >= 0) positions.push(pos);
        }
        if (positions.length === phraseTokens.length) {
            present.push({ index: i, pos: Math.min(...positions), end: Math.max(...positions) });
        }
    }

    if (present.length < 2) return false;

    // Reject non-adjacent descriptor combinations when an omitted descriptor
    // sits between them in the seller's original phrase.
    for (let i = 0; i < present.length; i++) {
        for (let j = i + 1; j < present.length; j++) {
            const a = present[i];
            const b = present[j];
            if (b.index > a.index + 1) {
                const skipped = descriptors.slice(a.index + 1, b.index);
                const skippedIsPresent = skipped.some(phrase => {
                    const pt = phrase.split(" ");
                    return pt.every(t => keywordTokens.includes(t));
                });
                if (!skippedIsPresent) return true;
            }
        }
    }

    return false;
}

function hasAwkwardProductPrefix(keyword, mainKeyword, productName, brand) {
    const source = extractNaturalSEOSource(mainKeyword, productName, brand);
    const keywordTokens = seoTokens(keyword);
    const productTokens = source.productTokens;
    const descriptors = source.descriptors;

    if (productTokens.length < 2 || descriptors.length < 3) return false;

    // Avoid constructions such as "cotton blue floral print kurti" when
    // "cotton" is already part of the product name. They are merely a
    // rearrangement of the seller phrase, not a natural keyword variant.
    const prefixTokens = productTokens.slice(0, -1);
    const descriptorTokens = descriptors.flatMap(d => seoTokens(d));
    const productHead = productTokens[productTokens.length - 1];

    const exactPattern = [...prefixTokens, ...descriptorTokens, productHead];
    return keywordTokens.join(" ") === exactPattern.join(" ");
}

function isNaturalSEOKeyword(keyword, productName, mainKeyword = "", brand = "", body = {}) {
    const value = cleanSEOKeyword(keyword);
    if (!value) return false;

    if (hasBrokenMeasurement(value)) return false;
    if (hasBadCharacterTypo(value)) return false;
    if (hasUnsupportedSEOWord(value, mainKeyword, productName, brand, body)) return false;
    if (hasUnnaturalBrandPlacement(value, brand, productName)) return false;
    if (hasBadDescriptorOrder(value, mainKeyword, productName, brand)) return false;
    if (hasAwkwardProductPrefix(value, mainKeyword, productName, brand)) return false;

    return true;
}

function isValidSEOKeyword(keyword, productName, mainKeyword = "", brand = "", body = {}) {
    const value = cleanSEOKeyword(keyword);

    if (!value) return false;
    if (value.length < 2) return false;
    if (value.length > 120) return false;
    if (containsBlockedSEOWord(value)) return false;

    // SEO keywords must remain connected to the seller's product.
    if (!keywordContainsProduct(value, productName)) return false;

    if (!isNaturalSEOKeyword(value, productName, mainKeyword, brand, body)) return false;

    return true;
}

function filterSEOKeywords(keywords, productName, mainKeyword = "", brand = "", body = {}) {
    const result = [];

    for (const keyword of uniqueStrings(keywords)) {
        if (!isValidSEOKeyword(keyword, productName, mainKeyword, brand, body)) continue;

        // Avoid almost-identical keywords.
        const normalized = seoTokens(keyword).join(" ");

        if (result.some(existing => {
            const a = seoTokens(existing).join(" ");
            return a === normalized;
        })) {
            continue;
        }

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
// SEO KEYWORD ENGINE — FINAL VERSION 31.0
// Deterministic, seller-fact-only, natural phrase generation.
// IMPORTANT: Never treats the frontend's combined mainKeyword/keyword
// field as the primary phrase. Product name is always canonical.
// ==========================================================

function normalizeSEOKey(value) {
    return cleanSEOKeyword(String(value || ""))
        .replace(/\s+/g, " ")
        .trim();
}

function seoWordList(value) {
    return normalizeSEOKey(value)
        .toLowerCase()
        .replace(/[^a-z0-9.\-\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}

function containsWholePhrase(text, phrase) {
    const a = ` ${normalizeSEOKey(text).toLowerCase()} `;
    const b = ` ${normalizeSEOKey(phrase).toLowerCase()} `;
    return !!phrase && a.includes(b);
}

function phraseTokens(phrase) {
    return seoWordList(phrase).filter(w => !/^\d+(?:\.\d+)?$/.test(w));
}

function buildNaturalSEOKeywords(body, productName) {
    const product = normalizeSEOKey(productName);
    const brand = normalizeSEOKey(body.brand);
    const result = [];
    const add = value => {
        const v = normalizeSEOKey(value);
        if (!v || v.length < 2) return;
        if (v.split(/\s+/).length < 2) return;
        if (containsBlockedSEOWord(v)) return;
        if (!result.some(x => x.toLowerCase() === v.toLowerCase())) result.push(v);
    };

    // The complete seller product name is ALWAYS the first keyword.
    add(product);

    // Parse only seller-supplied attributes that are not already in the product name.
    const rawFacts = [
        ...(normalizeSEOKey(body.productDetails).split(/[,;|\n]+/)),
        body.color, body.material, body.fabric, body.size, body.pattern,
        body.design, body.fit, body.occasion, body.quantity, body.capacity,
        body.weight, body.dimensions
    ].map(normalizeSEOKey).filter(Boolean);

    const productWords = seoWordList(product);
    const facts = [];
    for (const f of rawFacts) {
        const fw = seoWordList(f);
        if (!fw.length) continue;
        // Ignore facts that are already fully contained in the product phrase.
        const already = fw.every(w => productWords.includes(w));
        if (already) continue;
        if (!facts.some(x => x.toLowerCase() === f.toLowerCase())) facts.push(f);
    }

    const colors = new Set(['black','white','red','blue','green','yellow','pink','purple','orange','brown','grey','gray','gold','silver','beige','maroon','navy','cream','transparent','multicolor','multicolour']);
    const materialWords = new Set(['plastic','cotton','silk','wool','linen','metal','steel','stainless','wood','wooden','glass','ceramic','leather','rubber','nylon','polyester','acrylic','paper','foam']);
    const classify = f => {
        const w = seoWordList(f);
        const low = normalizeSEOKey(f).toLowerCase();
        if (colors.has(low)) return 'color';
        if (w.some(x => materialWords.has(x))) return 'material';
        if (w.some(x => /^\d+(?:\.\d+)?$/.test(x)) || /\b(?:inch|inches|cm|mm|ml|g|kg|litre|liter|l)\b/i.test(low)) return 'size';
        return 'other';
    };

    // Product noun = final meaningful 2-word phrase. For the test product this is Plant Pot.
    const stop = new Set(['new','pack','set','size','color','colour','with','for','of','and','the','a','an']);
    const meaningful = productWords.filter(w => !/^\d+(?:\.\d+)?$/.test(w) && !stop.has(w));
    const nounPhrase = meaningful.slice(-2).join(' ') || meaningful.join(' ');
    const nounTokens = seoWordList(nounPhrase);
    const nounStart = findSequence(productWords, nounTokens);
    const beforeNoun = nounStart >= 0 ? productWords.slice(0, nounStart) : [];
    const noun = nounStart >= 0 ? productWords.slice(nounStart) : nounTokens;

    const colorFacts = facts.filter(f => classify(f) === 'color');
    const materialFacts = facts.filter(f => classify(f) === 'material');
    const otherFacts = facts.filter(f => classify(f) === 'other' || classify(f) === 'size');

    for (const f of colorFacts.slice(0,2)) {
        // Insert color before material/noun; never append it after the product.
        const fw = seoWordList(f);
        const materialIndex = beforeNoun.findIndex(w => materialWords.has(w));
        if (materialIndex >= 0) {
            const b = [...beforeNoun]; b.splice(materialIndex, 0, ...fw);
            add([...b, ...noun].join(' '));
        } else {
            add([...beforeNoun, ...fw, ...noun].join(' '));
        }
        add(`${f} ${nounPhrase}`);
    }

    for (const f of materialFacts.slice(0,2)) {
        const fw = seoWordList(f);
        add([...beforeNoun, ...fw, ...noun].join(' '));
        add(`${f} ${nounPhrase}`);
    }

    // Size/other attributes are inserted before the material or noun, preserving the product order.
    for (const f of otherFacts.slice(0,3)) {
        const fw = seoWordList(f);
        const b = [...beforeNoun];
        let idx = b.findIndex(w => materialWords.has(w));
        if (idx < 0) idx = b.length;
        b.splice(idx, 0, ...fw);
        add([...b, ...noun].join(' '));
        if (classify(f) === 'size') add(`${f} ${nounPhrase}`);
    }

    // Useful combined color + material form.
    if (colorFacts.length && materialFacts.length) {
        add(`${colorFacts[0]} ${materialFacts[0]} ${nounPhrase}`);
    }

    if (brand && !containsWholePhrase(product, brand)) add(`${brand} ${product}`);

    return result.slice(0, 12);
}

// Backward-compatible names used elsewhere in this server.
function buildGuaranteedSEOKeywords(body, productName) {
    return buildNaturalSEOKeywords(body, productName);
}

function buildFactualSEOKeywords(mainKeyword, productName, facts, body = {}) {
    // SEO endpoint deliberately uses productName as the canonical primary
    // phrase. This prevents frontend details from becoming broken keywords.
    return buildNaturalSEOKeywords(body, productName);
}

async function handleGenerateSEO(req, res) {
    try {
        const body = req.body || {};
        const category = normalizeCategory(body.category);
        const productName = normalizeSEOKey(body.productName);

        if (!category) {
            return res.status(400).json({ success: false, error: "Product category is required." });
        }
        if (!productName) {
            return res.status(400).json({ success: false, error: "Product name is required." });
        }

        // CRITICAL FIX:
        // Never use body.mainKeyword/body.keyword as the primary phrase.
        // V30 sends productDetails together with those fields, which caused
        // phrases such as "inch plastic plant pot" to be treated as keywords.
        const mainKeyword = productName;
        const keywords = buildNaturalSEOKeywords(body, productName);

        return res.json({
            success: true,
            category,
            productName,
            mainKeyword,
            keywords,
            seoKeywords: keywords,
            data: { keywords, seoKeywords: keywords },
            text: keywords.join("\n"),
            count: keywords.length,
            version: VERSION
        });
    } catch (error) {
        console.error("SEO generation error:", error?.message || error);
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

        listing.keywords = filterSEOKeywords(
            uniqueStrings([
                ...factualKeywords,
                ...listing.keywords
            ]),
            productName,
            seoMainKeyword,
            body.brand,
            body
        ).slice(0, 20);

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
    console.log("SEO Engine: FACTUAL ATTRIBUTE + MEASUREMENT + SELLER-WORD FILTER");
    console.log("Gemini API: INTERACTIONS");
    console.log("==============================================");
});
