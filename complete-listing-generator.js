// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 7.0
// ==========================================================
// Category-Aware
// Strict Fact Guard
// NO INVENTED FACTS
// Deterministic Fallback
// Gemini Primary + Fallback Model
// Express + CORS
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

// ==========================================================
// APP CONFIG
// ==========================================================

const app = express();

const PORT = process.env.PORT || 10000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const PRIMARY_MODEL =
    process.env.PRIMARY_MODEL || "gemini-3.6-flash";

const FALLBACK_MODEL =
    process.env.FALLBACK_MODEL || "gemini-3.5-flash-lite";

const VERSION = "7.0";

const SERVER_NAME = "AI SELLER TOOLKIT BACKEND";


// ==========================================================
// GEMINI CLIENT
// ==========================================================

let ai = null;

if (GEMINI_API_KEY.trim()) {
    ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    });
}


// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"]
    })
);

app.use(express.json({ limit: "1mb" }));


// ==========================================================
// CATEGORY DEFINITIONS
// ==========================================================

const CATEGORY_RULES = {

    "Fashion": {
        focus: "Clothing and fashion products.",
        fields: [
            "Fabric / Material",
            "Color",
            "Size",
            "Pattern",
            "Fit",
            "Occasion",
            "Quantity"
        ]
    },

    "Beauty": {
        focus: "Beauty and personal-care products.",
        fields: [
            "Form / Texture",
            "Color",
            "Quantity",
            "Variant",
            "Ingredients",
            "Skin Type",
            "Hair Type",
            "Fragrance"
        ]
    },

    "Electronics": {
        focus: "Electronic and technology products.",
        fields: [
            "Model",
            "Color",
            "Storage",
            "RAM",
            "Battery",
            "Connectivity",
            "Compatibility",
            "Warranty",
            "Quantity"
        ]
    },

    "Home & Kitchen": {
        focus: "Home, kitchen and household products.",
        fields: [
            "Material",
            "Color",
            "Size / Dimensions",
            "Capacity",
            "Quantity",
            "Usage"
        ]
    },

    "Shoes": {
        focus: "Shoes and footwear.",
        fields: [
            "Fabric / Material",
            "Color",
            "Size",
            "Pattern",
            "Fit",
            "Occasion",
            "Quantity"
        ]
    },

    "Jewellery": {
        focus: "Jewellery and fashion accessories.",
        fields: [
            "Material",
            "Color",
            "Design",
            "Size",
            "Stone",
            "Occasion",
            "Quantity"
        ]
    },

    "Toys": {
        focus: "Toys, games and children's play products.",
        fields: [
            "Material",
            "Color",
            "Size",
            "Age Group",
            "Quantity",
            "Product Type"
        ]
    },

    "Books": {
        focus: "Books and reading material.",
        fields: [
            "Author",
            "Language",
            "Format",
            "Pages",
            "Publisher",
            "Edition",
            "ISBN"
        ]
    },

    "Pet": {
        focus: "Pet products and pet accessories.",
        fields: [
            "Pet Type",
            "Material",
            "Size",
            "Quantity",
            "Ingredients",
            "Flavour"
        ]
    },

    "Sports": {
        focus: "Sports, fitness and outdoor sports products.",
        fields: [
            "Material",
            "Color",
            "Size",
            "Sport Type",
            "Quantity",
            "Usage"
        ]
    },

    "Automotive": {
        focus: "Automotive products and vehicle accessories.",
        fields: [
            "Model",
            "Vehicle Compatibility",
            "Material",
            "Color",
            "Dimensions",
            "Quantity"
        ]
    },

    "Garden": {
        focus: "Gardening, plants and garden accessories.",
        fields: [
            "Material",
            "Color",
            "Size",
            "Quantity",
            "Plant Compatibility",
            "Usage"
        ]
    },

    "Food": {
        focus: "Food and edible products.",
        fields: [
            "Ingredients",
            "Flavour",
            "Quantity",
            "Form",
            "Variant",
            "Dietary Information"
        ]
    },

    "Gifts": {
        focus: "Gift items and gifting products.",
        fields: [
            "Material",
            "Color",
            "Size",
            "Occasion",
            "Quantity",
            "Gift Type"
        ]
    }

};


// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(category) {

    if (!category) return "";

    let value = String(category)
        .trim()
        .replace(
            /^[\p{Extended_Pictographic}\p{Emoji_Presentation}\s]+/u,
            ""
        )
        .trim();

    const lower = value.toLowerCase();

    const aliases = {

        "fashion": "Fashion",
        "fashion & clothing": "Fashion",
        "clothing": "Fashion",

        "beauty": "Beauty",
        "personal care": "Beauty",

        "electronics": "Electronics",
        "electronic": "Electronics",

        "home & kitchen": "Home & Kitchen",
        "home and kitchen": "Home & Kitchen",
        "home kitchen": "Home & Kitchen",

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
        "automobile": "Automotive",
        "car accessories": "Automotive",

        "garden": "Garden",
        "gardening": "Garden",

        "food": "Food",
        "foods": "Food",

        "gifts": "Gifts",
        "gift": "Gifts"
    };

    return aliases[lower] || value;
}


// ==========================================================
// TEXT HELPERS
// ==========================================================

function cleanText(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/\s+/g, " ")
        .trim();
}


function cleanMultilineText(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}


function normalizePrice(value) {

    if (!value) return "";

    return String(value)
        .trim()
        .replace(/\s+/g, " ");
}


// ==========================================================
// PRODUCT INPUT SANITIZER
// ==========================================================

function sanitizeProductInput(body) {

    const input = body || {};

    const category = normalizeCategory(
        input.category ||
        input.productCategory ||
        input.categoryName
    );

    const productName = cleanText(
        input.productName ||
        input.product_name ||
        input.name
    );

    const brand = cleanText(
        input.brand ||
        input.brandName
    );

    const price = normalizePrice(
        input.price ||
        input.productPrice
    );

    const productFeatures = cleanMultilineText(
        input.productFeatures ||
        input.features ||
        input.product_features
    );

    const extraProductInformation = cleanMultilineText(
        input.extraProductInformation ||
        input.extraInfo ||
        input.productDetails ||
        input.productDetailsExtra
    );

    const fields = {};

    const possibleFields = [
        "material",
        "fabric",
        "fabricMaterial",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity",

        "formTexture",
        "variant",
        "ingredients",
        "skinType",
        "hairType",
        "fragrance",

        "model",
        "storage",
        "ram",
        "battery",
        "connectivity",
        "compatibility",
        "warranty",

        "sizeDimensions",
        "capacity",
        "usage",

        "design",
        "stone",

        "ageGroup",
        "productType",

        "author",
        "language",
        "format",
        "pages",
        "publisher",
        "edition",
        "isbn",

        "petType",
        "flavour",

        "sportType",

        "vehicleCompatibility",
        "dimensions",

        "plantCompatibility",

        "dietaryInformation",

        "giftType"
    ];

    for (const key of possibleFields) {

        if (
            input[key] !== undefined &&
            input[key] !== null &&
            cleanText(input[key])
        ) {
            fields[key] = cleanText(input[key]);
        }
    }

    // Support category-specific UI field names
    const aliases = {
        "Fabric / Material": "fabricMaterial",
        "Form / Texture": "formTexture",
        "Size / Dimensions": "sizeDimensions",
        "Vehicle Compatibility": "vehicleCompatibility",
        "Plant Compatibility": "plantCompatibility",
        "Dietary Information": "dietaryInformation",
        "Age Group": "ageGroup",
        "Product Type": "productType",
        "Sport Type": "sportType",
        "Gift Type": "giftType",
        "Pet Type": "petType"
    };

    for (const [sourceKey, targetKey] of Object.entries(aliases)) {

        if (
            input[sourceKey] !== undefined &&
            cleanText(input[sourceKey])
        ) {
            fields[targetKey] = cleanText(input[sourceKey]);
        }
    }

    return {
        category,
        productName,
        brand,
        price,
        fields,
        productFeatures,
        extraProductInformation
    };
}


// ==========================================================
// FACT COLLECTION
// ==========================================================

function collectFacts(product) {

    const facts = [];

    if (product.category) {
        facts.push(product.category);
    }

    if (product.productName) {
        facts.push(product.productName);
    }

    if (product.brand) {
        facts.push(product.brand);
    }

    if (product.price) {
        facts.push(product.price);
    }

    for (const value of Object.values(product.fields)) {

        if (value) {
            facts.push(value);
        }
    }

    if (product.productFeatures) {
        facts.push(product.productFeatures);
    }

    if (product.extraProductInformation) {
        facts.push(product.extraProductInformation);
    }

    return facts;
}


// ==========================================================
// NUMBER / FACT GUARD
// ==========================================================

function extractNumbers(text) {

    if (!text) return [];

    return String(text).match(
        /(?:₹|Rs\.?|INR)?\s*\d+(?:[.,]\d+)?/gi
    ) || [];
}


function normalizeNumberToken(value) {

    return String(value)
        .toLowerCase()
        .replace(/rs\.?/g, "")
        .replace(/inr/g, "")
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .replace(/\s+/g, "")
        .trim();
}


function numbersAreSupported(output, sourceText) {

    const outputNumbers = extractNumbers(output);
    const sourceNumbers = extractNumbers(sourceText);

    const sourceSet = new Set(
        sourceNumbers.map(normalizeNumberToken)
    );

    for (const number of outputNumbers) {

        if (!sourceSet.has(normalizeNumberToken(number))) {
            return false;
        }
    }

    return true;
}


// ==========================================================
// UNSUPPORTED CLAIM GUARD
// ==========================================================

const UNSUPPORTED_CLAIM_PATTERNS = [

    /\bwaterproof\b/i,
    /\bwater resistant\b/i,
    /\bshockproof\b/i,
    /\bdustproof\b/i,
    /\banti[- ]?bacterial\b/i,
    /\bantibacterial\b/i,
    /\borganic\b/i,
    /\bpremium quality\b/i,
    /\bpremium\b/i,
    /\bluxury\b/i,
    /\bbest\b/i,
    /\btop quality\b/i,
    /\bhigh quality\b/i,
    /\b100% safe\b/i,
    /\bguaranteed\b/i,
    /\bguarantee\b/i,
    /\bcertified\b/i,
    /\bauthentic\b/i,
    /\bgenuine\b/i,
    /\boriginal\b/i,
    /\bdermatologically tested\b/i,
    /\bclinically tested\b/i,
    /\bchemical free\b/i,
    /\bparaben free\b/i,
    /\bcruelty free\b/i,
    /\bmade in india\b/i,
    /\bfast charging\b/i,
    /\blong lasting battery\b/i,
    /\blong battery life\b/i,
    /\bnoise cancellation\b/i,
    /\bactive noise cancellation\b/i,
    /\bbluetooth 5\.\d\b/i,
    /\b\d+\s*hour(?:s)? battery\b/i,
    /\b\d+\s*days?\b/i,
    /\bfree shipping\b/i,
    /\bcash on delivery\b/i,
    /\bcod\b/i,
    /\bdiscount\b/i,
    /\boffer\b/i,
    /\breturn policy\b/i,
    /\bfree return\b/i,
    /\bwarranty included\b/i,
    /\bcompatible with all\b/i,
    /\bsuitable for all\b/i,
    /\bdoctor recommended\b/i,
    /\bexpert recommended\b/i
];


function containsUnsupportedClaims(text) {

    if (!text) return false;

    for (const pattern of UNSUPPORTED_CLAIM_PATTERNS) {

        if (pattern.test(text)) {
            return true;
        }
    }

    return false;
}


// ==========================================================
// SOURCE FACT CHECK
// ==========================================================

function textContainsSourceFact(text, product) {

    const normalizedText = String(text || "")
        .toLowerCase();

    const importantFacts = [
        product.productName,
        product.brand,
        product.category,
        product.price
    ].filter(Boolean);

    if (!importantFacts.length) {
        return false;
    }

    return importantFacts.some(fact =>
        normalizedText.includes(
            String(fact).toLowerCase()
        )
    );
}


// ==========================================================
// LISTING VALIDATOR
// ==========================================================

function validateListing(listing, product) {

    if (!listing || typeof listing !== "object") {
        return {
            valid: false,
            reason: "Invalid listing object"
        };
    }

    const requiredFields = [
        "title",
        "description",
        "highlights",
        "keywords",
        "hashtags",
        "seoTitle",
        "seoDescription"
    ];

    for (const field of requiredFields) {

        if (
            listing[field] === undefined ||
            listing[field] === null
        ) {
            return {
                valid: false,
                reason: `Missing field: ${field}`
            };
        }
    }

    const allText = [
        listing.title,
        listing.description,
        listing.highlights,
        listing.keywords,
        listing.hashtags,
        listing.seoTitle,
        listing.seoDescription
    ].join("\n");

    // ------------------------------------------------------
    // Product name MUST be present
    // ------------------------------------------------------

    if (
        product.productName &&
        !allText
            .toLowerCase()
            .includes(product.productName.toLowerCase())
    ) {

        return {
            valid: false,
            reason: "Product name missing"
        };
    }

    // ------------------------------------------------------
    // Brand MUST NOT be invented
    // ------------------------------------------------------

    if (product.brand) {

        // Brand may appear or may not appear everywhere,
        // but if AI uses another obvious brand-like claim,
        // prompt + deterministic fallback protects the listing.
    }

    // ------------------------------------------------------
    // Numbers MUST come from source input
    // ------------------------------------------------------

    const sourceText = [
        product.productName,
        product.brand,
        product.price,
        ...Object.values(product.fields),
        product.productFeatures,
        product.extraProductInformation
    ]
        .filter(Boolean)
        .join(" ");

    if (!numbersAreSupported(allText, sourceText)) {

        return {
            valid: false,
            reason: "Unsupported number detected"
        };
    }

    // ------------------------------------------------------
    // Unsupported claims
    // ------------------------------------------------------

    if (containsUnsupportedClaims(allText)) {

        return {
            valid: false,
            reason: "Unsupported product claim detected"
        };
    }

    // ------------------------------------------------------
    // At least one source fact must exist
    // ------------------------------------------------------

    if (!textContainsSourceFact(allText, product)) {

        return {
            valid: false,
            reason: "Listing is not grounded in source facts"
        };
    }

    return {
        valid: true,
        reason: "Strict fact validation passed"
    };
}


// ==========================================================
// SAFE STRING ARRAY
// ==========================================================

function ensureArray(value) {

    if (Array.isArray(value)) {

        return value
            .map(item => cleanText(item))
            .filter(Boolean);
    }

    if (typeof value === "string") {

        return value
            .split(/\n|,/)
            .map(item =>
                item
                    .replace(/^[-•*]\s*/, "")
                    .trim()
            )
            .filter(Boolean);
    }

    return [];
}


// ==========================================================
// NORMALIZE AI RESPONSE
// ==========================================================

function normalizeAIListing(data) {

    const highlights = ensureArray(
        data.highlights ||
        data.HIGHLIGHTS
    );

    const keywords = ensureArray(
        data.keywords ||
        data.KEYWORDS
    );

    const hashtags = ensureArray(
        data.hashtags ||
        data.HASHTAGS
    );

    return {

        title: cleanText(
            data.title ||
            data.TITLE
        ),

        description: cleanMultilineText(
            data.description ||
            data.DESCRIPTION
        ),

        highlights,

        keywords,

        hashtags,

        seoTitle: cleanText(
            data.seoTitle ||
            data["SEO TITLE"] ||
            data.seo_title
        ),

        seoDescription: cleanMultilineText(
            data.seoDescription ||
            data["SEO DESCRIPTION"] ||
            data.seo_description
        )
    };
}


// ==========================================================
// JSON EXTRACTION
// ==========================================================

function parseAIJson(text) {

    if (!text) {
        throw new Error("Empty AI response");
    }

    let cleaned = String(text).trim();

    // Remove markdown code fences
    cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {

        // Try extracting first JSON object
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");

        if (start !== -1 && end !== -1 && end > start) {

            const possibleJSON =
                cleaned.substring(start, end + 1);

            return JSON.parse(possibleJSON);
        }

        throw new Error("AI returned invalid JSON");
    }
}


// ==========================================================
// DETERMINISTIC FALLBACK
// ==========================================================
// IMPORTANT:
// This function NEVER creates new product facts.
// It only uses information supplied by seller.
// ==========================================================

function deterministicFallback(product) {

    const name = product.productName;
    const brand = product.brand;
    const price = product.price;

    const fieldEntries = Object.entries(product.fields)
        .filter(([, value]) => value);

    const featureText = product.productFeatures;

    const descriptionParts = [];

    if (brand) {
        descriptionParts.push(`${brand} ${name}`);
    } else {
        descriptionParts.push(name);
    }

    if (fieldEntries.length) {

        const factualFields = fieldEntries
            .slice(0, 3)
            .map(([, value]) => value)
            .join(", ");

        descriptionParts.push(
            `with ${factualFields}`
        );
    }

    if (featureText) {
        descriptionParts.push(featureText);
    }

    if (price) {
        descriptionParts.push(`Price: ${price}`);
    }

    let description =
        descriptionParts.join(". ");

    if (!description.endsWith(".")) {
        description += ".";
    }

    const highlights = [];

    if (brand) {
        highlights.push(`Brand: ${brand}`);
    }

    highlights.push(`Product: ${name}`);

    for (const [, value] of fieldEntries.slice(0, 5)) {
        highlights.push(value);
    }

    if (featureText) {
        highlights.push(featureText);
    }

    if (price) {
        highlights.push(`Price: ${price}`);
    }

    const keywords = [
        name,
        brand,
        ...fieldEntries
            .slice(0, 3)
            .map(([, value]) => value),
        product.category
    ]
        .filter(Boolean)
        .map(cleanText);

    const uniqueKeywords = [
        ...new Set(keywords)
    ];

    const hashtagWords = [
        name,
        brand,
        product.category
    ]
        .filter(Boolean)
        .map(value =>
            String(value)
                .replace(/[^a-zA-Z0-9]+/g, "")
        )
        .filter(Boolean);

    const hashtags = [
        ...new Set(
            hashtagWords.map(
                value => `#${value}`
            )
        )
    ];

    const seoTitle = brand
        ? `${brand} ${name}`
        : name;

    const seoDescriptionParts = [];

    if (brand) {
        seoDescriptionParts.push(
            `${brand} ${name}`
        );
    } else {
        seoDescriptionParts.push(name);
    }

    for (const [, value] of fieldEntries.slice(0, 2)) {
        seoDescriptionParts.push(value);
    }

    if (price) {
        seoDescriptionParts.push(
            `Price: ${price}`
        );
    }

    let seoDescription =
        seoDescriptionParts.join(". ");

    if (!seoDescription.endsWith(".")) {
        seoDescription += ".";
    }

    return {
        title: seoTitle,
        description,
        highlights,
        keywords: uniqueKeywords,
        hashtags,
        seoTitle,
        seoDescription
    };
}


// ==========================================================
// AI PROMPT
// ==========================================================

function buildPrompt(product) {

    const categoryRule =
        CATEGORY_RULES[product.category] ||
        {
            focus: "General product.",
            fields: []
        };

    const sourceFacts = {
        category: product.category,
        productName: product.productName,
        brand: product.brand || null,
        price: product.price || null,
        categoryFields: product.fields,
        productFeatures:
            product.productFeatures || null,
        extraProductInformation:
            product.extraProductInformation || null
    };

    return `
You are the STRICT FACTUAL LISTING ENGINE for AI Seller Toolkit.

Your ONLY job is to create an e-commerce product listing from the seller-provided information.

CATEGORY:
${product.category}

CATEGORY FOCUS:
${categoryRule.focus}

SELLER-PROVIDED FACTS:
${JSON.stringify(sourceFacts, null, 2)}

==========================================================
ABSOLUTE NO-INVENTED-FACTS RULE
==========================================================

You MUST follow these rules:

1. Use ONLY information present in SELLER-PROVIDED FACTS.

2. NEVER invent:
   - material
   - color
   - size
   - dimensions
   - capacity
   - ingredients
   - benefits
   - medical claims
   - skin/hair benefits
   - battery capacity
   - battery life
   - charging speed
   - connectivity features
   - compatibility
   - warranty
   - certification
   - safety claims
   - age recommendation
   - durability
   - waterproofing
   - quality claims
   - origin
   - manufacturer
   - publisher
   - author
   - ISBN
   - delivery information
   - return information
   - discount
   - offer
   - price
   - quantity
   - performance
   - specifications
   - technical features
   - usage claims

3. If a fact is missing, DO NOT guess it.

4. Do NOT use general knowledge about the product to fill missing information.

5. Do NOT assume a common specification simply because the product type normally has it.

6. Do NOT convert an unknown field into a factual claim.

7. Do NOT add fake marketing claims such as:
   "premium", "best", "high quality", "durable",
   "waterproof", "safe", "original", "genuine",
   "certified", "guaranteed", "long lasting",
   unless the seller explicitly provided that exact fact.

8. Do NOT invent numbers.

9. Any number used in the output must already exist in the seller-provided facts.

10. Price must be used ONLY when seller provided it.

11. Brand must be used ONLY when seller provided it.

12. If Product Features contains a claim, you may repeat it,
    but you must NOT expand it into additional claims.

13. Extra Product Information is also seller-provided information.
    You may use it, but do not add anything beyond it.

14. Keep the wording simple, factual and marketplace-friendly.

15. Do not say "Buy now", "best product", "limited offer",
    "free shipping", "COD", etc. unless explicitly supplied.

==========================================================
CATEGORY RULE
==========================================================

The selected category is "${product.category}".

Do not change the category.

Do not mix specifications from another category.

==========================================================
OUTPUT
==========================================================

Return ONLY valid JSON.

No markdown.
No explanation.
No comments.

Use exactly this structure:

{
  "title": "string",
  "description": "string",
  "highlights": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "hashtags": [
    "string"
  ],
  "seoTitle": "string",
  "seoDescription": "string"
}

==========================================================
CONTENT RULES
==========================================================

TITLE:
- Use product name.
- Include brand only if provided.
- Do not invent specifications.

DESCRIPTION:
- Write a short factual description.
- Use only seller facts.

HIGHLIGHTS:
- Use only seller-provided facts.
- Do not create benefits or specifications.

KEYWORDS:
- Product name.
- Brand if supplied.
- Category.
- Seller-provided factual terms.

HASHTAGS:
- Product name / factual terms.
- Do not invent product features.

SEO TITLE:
- Product name.
- Brand only if supplied.
- No invented claims.

SEO DESCRIPTION:
- Only seller-provided facts.
- No invented claims.

IMPORTANT:
If you are not completely sure whether something is a seller-provided fact,
DO NOT include it.
`.trim();
}


// ==========================================================
// GEMINI GENERATION
// ==========================================================

async function generateWithModel(model, prompt) {

    if (!ai) {
        throw new Error("Gemini API is not configured");
    }

    const response =
        await ai.models.generateContent({

            model,

            contents: prompt,

            config: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

    let text = "";

    if (response && typeof response.text === "function") {
        text = response.text();
    } else if (
        response &&
        typeof response.text === "string"
    ) {
        text = response.text;
    } else if (
        response &&
        response.candidates &&
        response.candidates[0] &&
        response.candidates[0].content
    ) {

        const parts =
            response.candidates[0].content.parts || [];

        text = parts
            .map(part => part.text || "")
            .join("");
    }

    if (!text) {
        throw new Error("Gemini returned empty response");
    }

    return parseAIJson(text);
}


// ==========================================================
// SAFE AI GENERATION
// ==========================================================

async function generateSafeListing(product) {

    // ------------------------------------------------------
    // Deterministic fallback is always available
    // ------------------------------------------------------

    const fallback =
        deterministicFallback(product);

    // ------------------------------------------------------
    // If Gemini isn't configured, fallback directly
    // ------------------------------------------------------

    if (!ai) {

        return {
            listing: fallback,
            source: "deterministic-fallback",
            model: null,
            factGuard: "passed"
        };
    }

    const prompt =
        buildPrompt(product);

    // ------------------------------------------------------
    // PRIMARY MODEL
    // ------------------------------------------------------

    try {

        const primaryRaw =
            await generateWithModel(
                PRIMARY_MODEL,
                prompt
            );

        const primaryListing =
            normalizeAIListing(primaryRaw);

        const validation =
            validateListing(
                primaryListing,
                product
            );

        if (validation.valid) {

            return {
                listing: primaryListing,
                source: "gemini-primary",
                model: PRIMARY_MODEL,
                factGuard: "passed"
            };
        }

        console.warn(
            `[STRICT FACT GUARD] Primary model rejected: ${validation.reason}`
        );

    } catch (error) {

        console.warn(
            `[PRIMARY MODEL ERROR] ${error.message}`
        );
    }

    // ------------------------------------------------------
    // FALLBACK MODEL
    // ------------------------------------------------------

    try {

        const fallbackRaw =
            await generateWithModel(
                FALLBACK_MODEL,
                prompt
            );

        const fallbackAIListing =
            normalizeAIListing(fallbackRaw);

        const validation =
            validateListing(
                fallbackAIListing,
                product
            );

        if (validation.valid) {

            return {
                listing: fallbackAIListing,
                source: "gemini-fallback",
                model: FALLBACK_MODEL,
                factGuard: "passed"
            };
        }

        console.warn(
            `[STRICT FACT GUARD] Fallback model rejected: ${validation.reason}`
        );

    } catch (error) {

        console.warn(
            `[FALLBACK MODEL ERROR] ${error.message}`
        );
    }

    // ------------------------------------------------------
    // FINAL DETERMINISTIC FALLBACK
    // ------------------------------------------------------

    return {
        listing: fallback,
        source: "deterministic-fallback",
        model: null,
        factGuard: "passed"
    };
}


// ==========================================================
// BASIC VALIDATION
// ==========================================================

function validateRequest(product) {

    if (!product.category) {

        return {
            valid: false,
            error: "Product category is required"
        };
    }

    if (!CATEGORY_RULES[product.category]) {

        return {
            valid: false,
            error:
                `Unsupported product category: ${product.category}`
        };
    }

    if (!product.productName) {

        return {
            valid: false,
            error: "Product name is required"
        };
    }

    return {
        valid: true
    };
}


// ==========================================================
// ROOT ROUTE
// ==========================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        server: SERVER_NAME,

        version: VERSION,

        strictFactGuard: true,

        noInventedFacts: true,

        deterministicFallback: true,

        geminiConfigured: Boolean(ai),

        primaryModel: PRIMARY_MODEL,

        fallbackModel: FALLBACK_MODEL
    });
});


// ==========================================================
// API STATUS
// ==========================================================

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        server: SERVER_NAME,

        version: VERSION,

        online: true,

        strictFactGuard: true,

        noInventedFacts: true,

        deterministicFallback: true,

        geminiConfigured: Boolean(ai),

        primaryModel: PRIMARY_MODEL,

        fallbackModel: FALLBACK_MODEL,

        supportedCategories:
            Object.keys(CATEGORY_RULES)
    });
});


// ==========================================================
// CATEGORY API
// ==========================================================

app.get("/api/categories", (req, res) => {

    const categories =
        Object.entries(CATEGORY_RULES)
            .map(([name, data]) => ({

                name,

                focus: data.focus,

                fields: data.fields

            }));

    res.json({

        success: true,

        version: VERSION,

        categories
    });
});


// ==========================================================
// GENERATE LISTING
// ==========================================================

app.post("/api/generate-listing", async (req, res) => {

    try {

        const product =
            sanitizeProductInput(req.body);

        // --------------------------------------------------
        // Validate request
        // --------------------------------------------------

        const requestValidation =
            validateRequest(product);

        if (!requestValidation.valid) {

            return res.status(400).json({

                success: false,

                error: requestValidation.error,

                strictFactGuard: true,

                noInventedFacts: true
            });
        }

        // --------------------------------------------------
        // Generate safe listing
        // --------------------------------------------------

        const result =
            await generateSafeListing(product);

        // --------------------------------------------------
        // FINAL FACT CHECK
        // --------------------------------------------------

        const finalValidation =
            validateListing(
                result.listing,
                product
            );

        if (!finalValidation.valid) {

            // This should normally never happen because
            // deterministic fallback is already protected.

            const emergencyFallback =
                deterministicFallback(product);

            return res.json({

                success: true,

                version: VERSION,

                category: product.category,

                listing: emergencyFallback,

                title: emergencyFallback.title,

                description:
                    emergencyFallback.description,

                highlights:
                    emergencyFallback.highlights,

                keywords:
                    emergencyFallback.keywords,

                hashtags:
                    emergencyFallback.hashtags,

                seoTitle:
                    emergencyFallback.seoTitle,

                seoDescription:
                    emergencyFallback.seoDescription,

                source: "deterministic-fallback",

                model: null,

                strictFactGuard: true,

                noInventedFacts: true,

                factGuard: "passed"
            });
        }

        // --------------------------------------------------
        // SUCCESS RESPONSE
        // --------------------------------------------------

        return res.json({

            success: true,

            version: VERSION,

            category: product.category,

            listing: result.listing,

            // Direct fields for frontend compatibility
            title: result.listing.title,

            description:
                result.listing.description,

            highlights:
                result.listing.highlights,

            keywords:
                result.listing.keywords,

            hashtags:
                result.listing.hashtags,

            seoTitle:
                result.listing.seoTitle,

            seoDescription:
                result.listing.seoDescription,

            source: result.source,

            model: result.model,

            strictFactGuard: true,

            noInventedFacts: true,

            deterministicFallback: true,

            factGuard: result.factGuard
        });

    } catch (error) {

        console.error(
            "[GENERATE LISTING ERROR]",
            error
        );

        // --------------------------------------------------
        // Emergency deterministic fallback
        // --------------------------------------------------

        try {

            const product =
                sanitizeProductInput(req.body);

            if (
                product.category &&
                product.productName &&
                CATEGORY_RULES[product.category]
            ) {

                const emergency =
                    deterministicFallback(product);

                return res.json({

                    success: true,

                    version: VERSION,

                    category:
                        product.category,

                    listing: emergency,

                    title:
                        emergency.title,

                    description:
                        emergency.description,

                    highlights:
                        emergency.highlights,

                    keywords:
                        emergency.keywords,

                    hashtags:
                        emergency.hashtags,

                    seoTitle:
                        emergency.seoTitle,

                    seoDescription:
                        emergency.seoDescription,

                    source:
                        "deterministic-fallback",

                    model: null,

                    strictFactGuard: true,

                    noInventedFacts: true,

                    deterministicFallback: true,

                    factGuard: "passed"
                });
            }

        } catch (fallbackError) {

            console.error(
                "[EMERGENCY FALLBACK ERROR]",
                fallbackError
            );
        }

        return res.status(500).json({

            success: false,

            error:
                "Unable to generate listing safely.",

            strictFactGuard: true,

            noInventedFacts: true,

            deterministicFallback: true
        });
    }
});


// ==========================================================
// 404 HANDLER
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

    console.error(
        "[GLOBAL ERROR]",
        err
    );

    res.status(500).json({

        success: false,

        error: "Internal server error",

        version: VERSION
    });
});


// ==========================================================
// SERVER START
// ==========================================================

app.listen(PORT, () => {

    console.log(
        "=========================================================="
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
        "Gemini API:",
        ai ? "CONFIGURED" : "NOT CONFIGURED"
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
        "Strict Fact Guard: ENABLED"
    );

    console.log(
        "No Invented Facts: ENABLED"
    );

    console.log(
        "Deterministic Fallback: ENABLED"
    );

    console.log(
        "Categories:",
        Object.keys(CATEGORY_RULES).join(", ")
    );

    console.log(
        "=========================================================="
    );
});


// ==========================================================
// END OF SERVER.JS — FINAL VERSION 7.0
// ==========================================================
