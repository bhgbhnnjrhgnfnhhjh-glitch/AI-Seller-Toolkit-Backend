// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 7.0
// ==========================================================
// Category-Aware
// Strict Fact Guard
// No Invented Facts
// No Omitted Supplied Facts
// Deterministic Final Listing
// Gemini Primary + Fallback
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { GoogleGenAI } = require("@google/genai");

const app = express();


// ==========================================================
// CONFIG
// ==========================================================

const PORT = process.env.PORT || 10000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const PRIMARY_MODEL =
    process.env.PRIMARY_MODEL || "gemini-3.6-flash";

const FALLBACK_MODEL =
    process.env.FALLBACK_MODEL || "gemini-3.5-flash-lite";

const VERSION = "7.0";


// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(cors());

app.use(express.json({
    limit: "1mb"
}));


// ==========================================================
// GEMINI CLIENT
// ==========================================================

let ai = null;

if (GEMINI_API_KEY) {
    try {
        ai = new GoogleGenAI({
            apiKey: GEMINI_API_KEY
        });
    } catch (error) {
        console.error("Gemini client initialization failed:", error.message);
        ai = null;
    }
}


// ==========================================================
// CATEGORY DEFINITIONS
// ==========================================================

const CATEGORY_RULES = {

    "Fashion": [
        "fabricMaterial",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity"
    ],

    "Beauty": [
        "formTexture",
        "color",
        "quantity",
        "variant",
        "ingredients",
        "skinType",
        "hairType",
        "fragrance"
    ],

    "Electronics": [
        "model",
        "color",
        "storage",
        "ram",
        "battery",
        "connectivity",
        "compatibility",
        "warranty",
        "quantity"
    ],

    "Home & Kitchen": [
        "material",
        "color",
        "sizeDimensions",
        "capacity",
        "quantity",
        "usage"
    ],

    "Shoes": [
        "fabricMaterial",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity"
    ],

    "Jewellery": [
        "material",
        "color",
        "design",
        "size",
        "stone",
        "occasion",
        "quantity"
    ],

    "Toys": [
        "material",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity"
    ],

    "Books": [
        "author",
        "language",
        "format",
        "pages",
        "publisher",
        "edition",
        "isbn"
    ],

    "Pet": [
        "petType",
        "material",
        "size",
        "quantity",
        "ingredients",
        "flavour"
    ],

    "Sports": [
        "sport",
        "material",
        "size",
        "color",
        "quantity",
        "usage"
    ],

    "Automotive": [
        "model",
        "vehicleCompatibility",
        "material",
        "color",
        "dimensions",
        "quantity"
    ],

    "Garden": [
        "material",
        "color",
        "size",
        "quantity",
        "plantCompatibility",
        "usage"
    ],

    "Food": [
        "ingredients",
        "flavour",
        "quantity",
        "material",
        "color",
        "size",
        "expiry"
    ],

    "Gifts": [
        "material",
        "color",
        "size",
        "occasion",
        "quantity",
        "personalization"
    ]
};


// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(value) {

    if (!value) {
        return "";
    }

    let category = String(value)
        .trim()
        .replace(
            /^[^\p{L}\p{N}&]+/u,
            ""
        )
        .trim();

    const aliases = {

        "fashion & clothing": "Fashion",
        "fashion": "Fashion",
        "clothing": "Fashion",

        "beauty": "Beauty",
        "cosmetics": "Beauty",

        "electronics": "Electronics",
        "electronic": "Electronics",

        "home kitchen": "Home & Kitchen",
        "home & kitchen": "Home & Kitchen",
        "home and kitchen": "Home & Kitchen",

        "shoes": "Shoes",
        "footwear": "Shoes",

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

    const key = category.toLowerCase();

    return aliases[key] || category;
}


// ==========================================================
// BASIC HELPERS
// ==========================================================

function clean(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/\s+/g, " ")
        .trim();
}


function isMeaningful(value) {

    const text = clean(value);

    if (!text) {
        return false;
    }

    const ignored = [
        "only if known",
        "optional",
        "n/a",
        "na",
        "none",
        "not applicable",
        "no additional information",
        "no information",
        "unknown"
    ];

    return !ignored.includes(text.toLowerCase());
}


function safePrice(value) {

    const text = clean(value);

    if (!text) {
        return "";
    }

    return text;
}


function escapeRegExp(value) {

    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}


// ==========================================================
// FACT VALUE NORMALIZATION
// ==========================================================

function normalizeFactValue(value) {

    return clean(value)
        .replace(/\s+/g, " ")
        .trim();
}


// ==========================================================
// COLLECT INPUT FACTS
// ==========================================================

function collectFacts(body) {

    const facts = [];

    const category = normalizeCategory(body.category);

    const categoryDetails =
        body.categoryDetails &&
        typeof body.categoryDetails === "object"
            ? body.categoryDetails
            : {};

    const productDetails =
        body.productDetails &&
        typeof body.productDetails === "object"
            ? body.productDetails
            : {};

    const combined = {
        ...productDetails,
        ...categoryDetails,
        ...body
    };


    // ------------------------------------------------------
    // Core facts
    // ------------------------------------------------------

    const coreFields = {

        "Product Name": [
            body.productName,
            body.product,
            combined.productName
        ],

        "Brand": [
            body.brand,
            combined.brand
        ],

        "Price": [
            body.price,
            combined.price
        ]
    };


    Object.entries(coreFields).forEach(
        ([label, values]) => {

            for (const value of values) {

                if (isMeaningful(value)) {

                    facts.push({
                        key: label,
                        value: normalizeFactValue(value)
                    });

                    break;
                }
            }
        }
    );


    // ------------------------------------------------------
    // Category fields
    // ------------------------------------------------------

    const allowedFields =
        CATEGORY_RULES[category] || [];


    const labelMap = {

        fabricMaterial: "Fabric / Material",
        formTexture: "Form / Texture",
        color: "Color",
        size: "Size",
        pattern: "Pattern",
        fit: "Fit",
        occasion: "Occasion",
        quantity: "Quantity",

        variant: "Variant",
        ingredients: "Ingredients",
        skinType: "Skin Type",
        hairType: "Hair Type",
        fragrance: "Fragrance",

        model: "Model",
        storage: "Storage",
        ram: "RAM",
        battery: "Battery",
        connectivity: "Connectivity",
        compatibility: "Compatibility",
        warranty: "Warranty",

        sizeDimensions: "Size / Dimensions",
        capacity: "Capacity",
        usage: "Usage",

        design: "Design",
        stone: "Stone",

        author: "Author",
        language: "Language",
        format: "Format",
        pages: "Pages",
        publisher: "Publisher",
        edition: "Edition",
        isbn: "ISBN",

        petType: "Pet Type",
        flavour: "Flavour",

        sport: "Sport",
        vehicleCompatibility: "Vehicle Compatibility",
        dimensions: "Dimensions",

        plantCompatibility: "Plant Compatibility",

        expiry: "Expiry",

        personalization: "Personalization"
    };


    allowedFields.forEach(
        (field) => {

            const candidates = [
                categoryDetails[field],
                productDetails[field],
                body[field],
                combined[field]
            ];

            for (const value of candidates) {

                if (isMeaningful(value)) {

                    facts.push({
                        key:
                            labelMap[field] || field,
                        value:
                            normalizeFactValue(value)
                    });

                    break;
                }
            }
        }
    );


    // ------------------------------------------------------
    // Product Features
    // ------------------------------------------------------

    const features = [
        body.productFeatures,
        body.features,
        combined.productFeatures,
        categoryDetails.productFeatures
    ];

    for (const value of features) {

        if (isMeaningful(value)) {

            facts.push({
                key: "Product Features",
                value: normalizeFactValue(value)
            });

            break;
        }
    }


    // ------------------------------------------------------
    // Extra information
    // ------------------------------------------------------

    const extra = [
        body.extraProductInformation,
        body.extraInformation,
        combined.extraProductInformation
    ];

    for (const value of extra) {

        if (isMeaningful(value)) {

            facts.push({
                key: "Extra Product Information",
                value: normalizeFactValue(value)
            });

            break;
        }
    }


    // ------------------------------------------------------
    // Remove duplicates
    // ------------------------------------------------------

    const unique = [];

    const seen = new Set();

    facts.forEach(
        (fact) => {

            const id =
                `${fact.key}|${fact.value}`
                    .toLowerCase();

            if (!seen.has(id)) {

                seen.add(id);

                unique.push(fact);
            }
        }
    );


    return unique;
}


// ==========================================================
// FACT MAP
// ==========================================================

function factsToObject(facts) {

    const result = {};

    facts.forEach(
        (fact) => {

            if (!result[fact.key]) {
                result[fact.key] = [];
            }

            result[fact.key].push(fact.value);
        }
    );

    return result;
}


// ==========================================================
// GEMINI PROMPT
// ==========================================================

function buildGeminiPrompt(
    category,
    facts
) {

    const factLines =
        facts
            .map(
                (fact) =>
                    `- ${fact.key}: ${fact.value}`
            )
            .join("\n");


    return `
You are the factual listing assistant for AI Seller Toolkit.

CATEGORY:
${category}

SELLER-SUPPLIED FACTS:
${factLines}

STRICT RULES:

1. Use ONLY the seller-supplied facts above.
2. NEVER invent any product specification.
3. NEVER assume quality, performance, safety, certification,
   compatibility, warranty, waterproofing, durability,
   authenticity, originality, bestseller status, awards,
   health benefits, ingredients, dimensions, material,
   technology, delivery, shipping, discount or availability.
4. NEVER add a fact merely because it is common for this category.
5. NEVER remove or change a seller-supplied value.
6. Every meaningful seller-supplied fact must remain available
   in the final listing.
7. Do not convert an unknown field into a known fact.
8. Do not treat the category name itself as a product feature.
9. Do not create claims such as "premium", "best", "high quality",
   "comfortable", "durable", "leak-proof", "skin-friendly",
   "eco-friendly", "original", "official", "certified",
   unless the seller explicitly supplied that exact fact.
10. If a fact is uncertain, leave it as supplied.
11. Do not write fictional marketing claims.
12. Keep the output concise and marketplace-friendly.

Return JSON only.

Required JSON structure:

{
  "title": "string",
  "description": "string",
  "highlights": ["string"],
  "keywords": ["string"],
  "hashtags": ["string"],
  "seoTitle": "string",
  "seoDescription": "string"
}
`;
}


// ==========================================================
// GEMINI CALL
// ==========================================================

async function callGemini(
    model,
    category,
    facts
) {

    if (!ai) {
        throw new Error("Gemini API is not configured");
    }


    const prompt =
        buildGeminiPrompt(
            category,
            facts
        );


    const response =
        await ai.models.generateContent({

            model,

            contents: prompt,

            config: {

                temperature: 0,

                maxOutputTokens: 1200,

                responseMimeType:
                    "application/json",

                responseSchema: {

                    type: "object",

                    properties: {

                        title: {
                            type: "string"
                        },

                        description: {
                            type: "string"
                        },

                        highlights: {
                            type: "array",
                            items: {
                                type: "string"
                            }
                        },

                        keywords: {
                            type: "array",
                            items: {
                                type: "string"
                            }
                        },

                        hashtags: {
                            type: "array",
                            items: {
                                type: "string"
                            }
                        },

                        seoTitle: {
                            type: "string"
                        },

                        seoDescription: {
                            type: "string"
                        }
                    },

                    required: [
                        "title",
                        "description",
                        "highlights",
                        "keywords",
                        "hashtags",
                        "seoTitle",
                        "seoDescription"
                    ]
                }
            }
        });


    const text =
        response &&
        typeof response.text === "string"
            ? response.text.trim()
            : "";


    if (!text) {
        throw new Error(
            "Gemini returned an empty response"
        );
    }


    let parsed;

    try {

        parsed = JSON.parse(text);

    } catch (error) {

        throw new Error(
            "Gemini returned invalid JSON"
        );
    }


    return parsed;
}


// ==========================================================
// FACT PRESERVATION CHECK
// ==========================================================

function containsFact(text, factValue) {

    const source =
        clean(text).toLowerCase();

    const fact =
        clean(factValue).toLowerCase();

    if (!source || !fact) {
        return false;
    }


    // Exact phrase check
    if (source.includes(fact)) {
        return true;
    }


    // Numeric values: exact normalized number
    const compactSource =
        source.replace(/[,\s]/g, "");

    const compactFact =
        fact.replace(/[,\s]/g, "");

    if (
        compactFact.length >= 3 &&
        compactSource.includes(compactFact)
    ) {
        return true;
    }


    return false;
}


// ==========================================================
// GET ALL OUTPUT TEXT
// ==========================================================

function outputToText(output) {

    const parts = [];

    if (output.title) {
        parts.push(output.title);
    }

    if (output.description) {
        parts.push(output.description);
    }

    if (Array.isArray(output.highlights)) {
        parts.push(...output.highlights);
    }

    if (Array.isArray(output.keywords)) {
        parts.push(...output.keywords);
    }

    if (Array.isArray(output.hashtags)) {
        parts.push(...output.hashtags);
    }

    if (output.seoTitle) {
        parts.push(output.seoTitle);
    }

    if (output.seoDescription) {
        parts.push(output.seoDescription);
    }

    return parts.join(" ");
}


// ==========================================================
// REQUIRED FACT CHECK
// ==========================================================

function checkSuppliedFacts(
    output,
    facts
) {

    const text =
        outputToText(output);

    const missing = [];


    facts.forEach(
        (fact) => {

            // Extra free text may contain instructions rather
            // than factual product information.
            if (
                fact.key ===
                "Extra Product Information"
            ) {
                return;
            }


            if (
                fact.key ===
                "Product Features"
            ) {

                if (
                    !containsFact(
                        text,
                        fact.value
                    )
                ) {

                    missing.push({
                        key: fact.key,
                        value: fact.value
                    });
                }

                return;
            }


            if (
                !containsFact(
                    text,
                    fact.value
                )
            ) {

                missing.push({
                    key: fact.key,
                    value: fact.value
                });
            }
        }
    );


    return {
        valid: missing.length === 0,
        missing
    };
}


// ==========================================================
// HIGH-RISK INVENTED CLAIM DETECTOR
// ==========================================================

const RISKY_CLAIMS = [

    "bestseller",
    "best seller",
    "award winning",
    "award-winning",
    "certified",
    "waterproof",
    "water proof",
    "leak proof",
    "leak-proof",
    "premium quality",
    "high quality",
    "best quality",
    "top quality",
    "durable",
    "long lasting",
    "long-lasting",
    "skin friendly",
    "skin-friendly",
    "eco friendly",
    "eco-friendly",
    "chemical free",
    "chemical-free",
    "100% original",
    "original product",
    "authentic",
    "official product",
    "free shipping",
    "fast delivery",
    "cash on delivery",
    "discount",
    "guaranteed",
    "guarantee",
    "number one",
    "#1"
];


function checkRiskyClaims(
    output,
    facts
) {

    const text =
        outputToText(output)
            .toLowerCase();


    const suppliedText =
        facts
            .map(
                (fact) =>
                    fact.value.toLowerCase()
            )
            .join(" ");


    const unsupported = [];


    RISKY_CLAIMS.forEach(
        (claim) => {

            if (
                text.includes(claim) &&
                !suppliedText.includes(claim)
            ) {

                unsupported.push(claim);
            }
        }
    );


    return {
        valid: unsupported.length === 0,
        unsupported
    };
}


// ==========================================================
// NORMALIZE AI OUTPUT
// ==========================================================

function normalizeOutput(output) {

    const result = {

        title:
            clean(output.title),

        description:
            clean(output.description),

        highlights:
            Array.isArray(output.highlights)
                ? output.highlights
                    .map(clean)
                    .filter(Boolean)
                : [],

        keywords:
            Array.isArray(output.keywords)
                ? output.keywords
                    .map(clean)
                    .filter(Boolean)
                : [],

        hashtags:
            Array.isArray(output.hashtags)
                ? output.hashtags
                    .map(clean)
                    .filter(Boolean)
                : [],

        seoTitle:
            clean(output.seoTitle),

        seoDescription:
            clean(output.seoDescription)
    };


    return result;
}


// ==========================================================
// DETERMINISTIC FACTUAL LISTING
// ==========================================================

function buildDeterministicListing(
    category,
    facts
) {

    const map = factsToObject(facts);


    const product =
        map["Product Name"]?.[0] ||
        "Product";


    const brand =
        map["Brand"]?.[0] || "";


    const price =
        map["Price"]?.[0] || "";


    const titleParts = [];

    if (brand) {
        titleParts.push(brand);
    }

    titleParts.push(product);


    // ------------------------------------------------------
    // Useful category-specific title facts
    // ------------------------------------------------------

    const titleFacts = [
        "Author",
        "Material",
        "Color",
        "Format",
        "Design"
    ];


    for (const key of titleFacts) {

        const value =
            map[key]?.[0];

        if (
            value &&
            titleParts.length < 4
        ) {

            titleParts.push(value);
        }
    }


    const title =
        titleParts.join(" ");


    // ------------------------------------------------------
    // Description
    // ------------------------------------------------------

    const descriptionParts = [];


    if (brand) {
        descriptionParts.push(
            `${product} by ${brand}.`
        );
    } else {
        descriptionParts.push(
            `${product}.`
        );
    }


    const importantFacts =
        facts.filter(
            (fact) =>
                ![
                    "Product Name",
                    "Brand",
                    "Price",
                    "Extra Product Information"
                ].includes(fact.key)
        );


    importantFacts.forEach(
        (fact) => {

            descriptionParts.push(
                `${fact.key}: ${fact.value}.`
            );
        }
    );


    if (price) {
        descriptionParts.push(
            `Price: ${price}.`
        );
    }


    const description =
        descriptionParts.join(" ");


    // ------------------------------------------------------
    // Highlights
    // ------------------------------------------------------

    const highlights = [];


    if (brand) {
        highlights.push(
            `Brand: ${brand}`
        );
    }


    facts.forEach(
        (fact) => {

            if (
                [
                    "Product Name",
                    "Brand",
                    "Price",
                    "Extra Product Information"
                ].includes(fact.key)
            ) {
                return;
            }


            highlights.push(
                `${fact.key}: ${fact.value}`
            );
        }
    );


    if (price) {
        highlights.push(
            `Price: ${price}`
        );
    }


    // ------------------------------------------------------
    // Keywords
    // ------------------------------------------------------

    const keywords = [];


    keywords.push(product);


    if (brand) {
        keywords.push(brand);
    }


    facts.forEach(
        (fact) => {

            if (
                [
                    "Product Name",
                    "Brand",
                    "Price",
                    "Extra Product Information"
                ].includes(fact.key)
            ) {
                return;
            }


            if (
                !keywords.includes(
                    fact.value
                )
            ) {

                keywords.push(
                    fact.value
                );
            }
        }
    );


    if (
        category &&
        !keywords.includes(category)
    ) {

        keywords.push(category);
    }


    // ------------------------------------------------------
    // Hashtags
    // ------------------------------------------------------

    const hashtags =
        keywords
            .slice(0, 6)
            .map(
                (value) => {

                    const cleaned =
                        String(value)
                            .replace(
                                /[^a-zA-Z0-9]+/g,
                                ""
                            );

                    return cleaned
                        ? `#${cleaned}`
                        : "";
                }
            )
            .filter(Boolean);


    // ------------------------------------------------------
    // SEO
    // ------------------------------------------------------

    const seoTitle =
        title;


    const seoDescription =
        description;


    return {

        title,

        description,

        highlights,

        keywords,

        hashtags,

        seoTitle,

        seoDescription
    };
}


// ==========================================================
// REPAIR MISSING FACTS
// ==========================================================

function repairWithFacts(
    output,
    category,
    facts
) {

    const base =
        buildDeterministicListing(
            category,
            facts
        );


    const current =
        normalizeOutput(output);


    const currentCheck =
        checkSuppliedFacts(
            current,
            facts
        );


    const risky =
        checkRiskyClaims(
            current,
            facts
        );


    // ------------------------------------------------------
    // If AI output is not strictly safe,
    // use deterministic factual listing.
    // ------------------------------------------------------

    if (
        !currentCheck.valid ||
        !risky.valid
    ) {

        return {
            listing: base,
            mode: "deterministic-repair",
            reason: {
                missingFacts:
                    currentCheck.missing,

                unsupportedClaims:
                    risky.unsupported
            }
        };
    }


    return {
        listing: current,
        mode: "gemini-validated",
        reason: {
            missingFacts: [],
            unsupportedClaims: []
        }
    };
}


// ==========================================================
// FINAL FACT GUARD
// ==========================================================

function finalFactGuard(
    listing,
    category,
    facts
) {

    const normalized =
        normalizeOutput(listing);


    const factCheck =
        checkSuppliedFacts(
            normalized,
            facts
        );


    const riskyCheck =
        checkRiskyClaims(
            normalized,
            facts
        );


    if (
        !factCheck.valid ||
        !riskyCheck.valid
    ) {

        return {
            passed: false,

            listing:
                buildDeterministicListing(
                    category,
                    facts
                ),

            corrected: true,

            missingFacts:
                factCheck.missing,

            unsupportedClaims:
                riskyCheck.unsupported
        };
    }


    return {
        passed: true,

        listing: normalized,

        corrected: false,

        missingFacts: [],

        unsupportedClaims: []
    };
}


// ==========================================================
// GENERATE LISTING
// ==========================================================

async function generateListing(
    category,
    facts
) {

    // ------------------------------------------------------
    // 1. Always have deterministic safe version
    // ------------------------------------------------------

    const deterministic =
        buildDeterministicListing(
            category,
            facts
        );


    // ------------------------------------------------------
    // 2. No Gemini -> deterministic
    // ------------------------------------------------------

    if (!ai) {

        return {
            listing: deterministic,
            mode: "deterministic-fallback",
            model: null
        };
    }


    // ------------------------------------------------------
    // 3. Try primary Gemini
    // ------------------------------------------------------

    try {

        const primary =
            await callGemini(
                PRIMARY_MODEL,
                category,
                facts
            );


        const repaired =
            repairWithFacts(
                primary,
                category,
                facts
            );


        const finalResult =
            finalFactGuard(
                repaired.listing,
                category,
                facts
            );


        if (finalResult.passed) {

            return {
                listing:
                    finalResult.listing,

                mode:
                    repaired.mode,

                model:
                    PRIMARY_MODEL
            };
        }


    } catch (error) {

        console.error(
            "Primary Gemini error:",
            error.message
        );
    }


    // ------------------------------------------------------
    // 4. Try fallback Gemini
    // ------------------------------------------------------

    try {

        const fallback =
            await callGemini(
                FALLBACK_MODEL,
                category,
                facts
            );


        const repaired =
            repairWithFacts(
                fallback,
                category,
                facts
            );


        const finalResult =
            finalFactGuard(
                repaired.listing,
                category,
                facts
            );


        if (finalResult.passed) {

            return {
                listing:
                    finalResult.listing,

                mode:
                    repaired.mode,

                model:
                    FALLBACK_MODEL
            };
        }


    } catch (error) {

        console.error(
            "Fallback Gemini error:",
            error.message
        );
    }


    // ------------------------------------------------------
    // 5. Absolute deterministic fallback
    // ------------------------------------------------------

    return {
        listing: deterministic,
        mode: "deterministic-fallback",
        model: null
    };
}


// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI SELLER TOOLKIT BACKEND",

            version:
                VERSION,

            strictFactGuard:
                true,

            noInventedFacts:
                true,

            noOmittedSuppliedFacts:
                true,

            deterministicFallback:
                true,

            geminiConfigured:
                Boolean(GEMINI_API_KEY),

            primaryModel:
                PRIMARY_MODEL,

            fallbackModel:
                FALLBACK_MODEL
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
                "AI SELLER TOOLKIT BACKEND",

            version:
                VERSION,

            status:
                "online",

            strictFactGuard:
                true,

            noInventedFacts:
                true,

            noOmittedSuppliedFacts:
                true,

            deterministicFallback:
                true,

            geminiConfigured:
                Boolean(GEMINI_API_KEY),

            primaryModel:
                PRIMARY_MODEL,

            fallbackModel:
                FALLBACK_MODEL
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
                Object.keys(
                    CATEGORY_RULES
                )
        });
    }
);


// ==========================================================
// GENERATE LISTING API
// ==========================================================

app.post(
    "/api/generate-listing",
    async (req, res) => {

        try {

            const body =
                req.body || {};


            // ------------------------------------------------
            // Category
            // ------------------------------------------------

            const category =
                normalizeCategory(
                    body.category
                );


            if (!category) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product category is required"
                });
            }


            if (
                !CATEGORY_RULES[category]
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        `Unsupported product category: ${category}`,

                    supportedCategories:
                        Object.keys(
                            CATEGORY_RULES
                        )
                });
            }


            // ------------------------------------------------
            // Product name
            // ------------------------------------------------

            const productName =
                clean(
                    body.productName ||
                    body.product ||
                    (
                        body.productDetails &&
                        body.productDetails.productName
                    )
                );


            if (!productName) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product name is required"
                });
            }


            // ------------------------------------------------
            // Facts
            // ------------------------------------------------

            const facts =
                collectFacts({
                    ...body,
                    category,
                    productName
                });


            // ------------------------------------------------
            // Generate
            // ------------------------------------------------

            const result =
                await generateListing(
                    category,
                    facts
                );


            // ------------------------------------------------
            // Final safety check
            // ------------------------------------------------

            const finalGuard =
                finalFactGuard(
                    result.listing,
                    category,
                    facts
                );


            // ------------------------------------------------
            // Response
            // ------------------------------------------------

            return res.json({

                success: true,

                category,

                productName,

                strictFactGuard:
                    true,

                noInventedFacts:
                    true,

                noOmittedSuppliedFacts:
                    true,

                factGuardPassed:
                    finalGuard.passed,

                corrected:
                    finalGuard.corrected,

                generationMode:
                    result.mode,

                model:
                    result.model,

                listing:
                    finalGuard.listing,

                // Helpful for debugging/testing.
                suppliedFacts:
                    facts,

                guardReport: {

                    missingFacts:
                        finalGuard.missingFacts,

                    unsupportedClaims:
                        finalGuard.unsupportedClaims
                }
            });

        } catch (error) {

            console.error(
                "Generate listing error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    "Unable to generate listing",

                message:
                    error.message
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
                req.originalUrl
        });
    }
);


// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Unhandled server error:",
            error
        );


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
            "=================================================="
        );

        console.log(
            "AI SELLER TOOLKIT BACKEND"
        );

        console.log(
            "Version:",
            VERSION
        );

        console.log(
            "Server running on port:",
            PORT
        );

        console.log(
            "Strict Fact Guard: ENABLED"
        );

        console.log(
            "No Invented Facts: ENABLED"
        );

        console.log(
            "No Omitted Supplied Facts: ENABLED"
        );

        console.log(
            "Deterministic Fallback: ENABLED"
        );

        console.log(
            "Gemini API:",
            GEMINI_API_KEY
                ? "CONFIGURED"
                : "NOT CONFIGURED"
        );

        console.log(
            "Primary Model:",
            PRIMARY_MODEL
        );

        console.log(
            "Fallback Model:",
            FALLBACK_MODEL
        );

        console.log(
            "=================================================="
        );
    }
);
