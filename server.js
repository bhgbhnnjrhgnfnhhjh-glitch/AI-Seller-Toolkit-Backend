// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 7.0
// ==========================================================
// Category-Aware
// Strict Factual AI
// NO INVENTED FACTS
// Smart Retry
// Gemini Fallback
// Deterministic Fact-Only Fallback
// Render Ready
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

// ==========================================================
// APP
// ==========================================================

const app = express();

app.use(cors());

app.use(
    express.json({
        limit: "1mb"
    })
);

// ==========================================================
// ENVIRONMENT
// ==========================================================

const PORT = Number(process.env.PORT) || 10000;

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY || "";

const PRIMARY_MODEL =
    process.env.GEMINI_PRIMARY_MODEL ||
    "gemini-3.6-flash";

const FALLBACK_MODEL =
    process.env.GEMINI_FALLBACK_MODEL ||
    "gemini-3.5-flash-lite";

// ==========================================================
// GEMINI CLIENT
// ==========================================================

let ai = null;

if (GEMINI_API_KEY) {

    ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    });

}

// ==========================================================
// CATEGORIES
// ==========================================================

const categories = [

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
// COMMON FIELDS
// ==========================================================

const commonFields = [

    "productName",
    "brand",
    "price",
    "productFeatures",
    "extraProductInformation"

];

// ==========================================================
// CATEGORY-SPECIFIC FIELDS
// ==========================================================

const categoryFields = {

    "Fashion": [

        "material",
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

        "material",
        "color",
        "model",
        "connectivity",
        "compatibility",
        "battery",
        "power",
        "capacity",
        "dimensions",
        "quantity"

    ],

    "Home & Kitchen": [

        "material",
        "color",
        "size",
        "dimensions",
        "capacity",
        "quantity",
        "usage"

    ],

    "Shoes": [

        "material",
        "color",
        "size",
        "sole",
        "closure",
        "occasion",
        "quantity"

    ],

    "Jewellery": [

        "material",
        "color",
        "design",
        "size",
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

        "material",
        "color",
        "size",
        "weight",
        "activitySport",
        "quantity"

    ],

    "Automotive": [

        "material",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity"

    ],

    "Garden": [

        "material",
        "color",
        "size",
        "capacity",
        "quantity",
        "usage"

    ],

    "Food": [

        "ingredients",
        "flavour",
        "quantity",
        "form",
        "variant"

    ],

    "Gifts": [

        "material",
        "color",
        "design",
        "quantity",
        "occasion",
        "recipient",
        "packaging"

    ]

};

// ==========================================================
// STRICT CATEGORY RULES
// ==========================================================

const categoryRules = {

    "Fashion": `
Use only seller-provided information.

Never invent:
fabric composition,
fit,
occasion,
washing instructions,
design details,
quality claims,
comfort claims,
size availability,
warranty,
country of origin,
care instructions.
`,

    "Beauty": `
Use only seller-provided information.

Never invent:
ingredients,
benefits,
skin benefits,
hair benefits,
dermatologist claims,
safety claims,
expiry,
shelf life,
fragrance,
skin type,
hair type,
certification,
medical claims.
`,

    "Electronics": `
Use only seller-provided information.

Never invent:
battery capacity,
charging time,
playback time,
warranty,
compatibility,
processor,
RAM,
storage,
water resistance,
certification,
performance,
technical specifications.
`,

    "Home & Kitchen": `
Use only seller-provided information.

Never invent:
capacity,
dimensions,
food safety,
dishwasher safety,
microwave safety,
durability,
heat resistance,
waterproofing,
certification.
`,

    "Shoes": `
Use only seller-provided information.

Never invent:
shoe size availability,
fit,
comfort,
sole material,
waterproofing,
durability,
occasion,
sports suitability.
`,

    "Jewellery": `
Use only seller-provided information.

Never invent:
gold purity,
silver purity,
stone type,
gemstone authenticity,
plating type,
hallmark,
weight,
precious metal content.
`,

    "Toys": `
Use only seller-provided information.

Never invent:
recommended age,
safety certification,
educational benefits,
battery information,
number of pieces,
material composition,
safety claims.
`,

    "Books": `
Use only seller-provided information.

Never invent:
publication date,
ISBN,
author,
publisher,
page count,
edition,
plot,
reviews,
awards.
`,

    "Pet": `
Use only seller-provided information.

Never invent:
ingredients,
flavour,
nutrition,
age suitability,
medical benefits,
safety claims,
pet breed compatibility.
`,

    "Sports": `
Use only seller-provided information.

Never invent:
weight,
dimensions,
sport suitability,
performance,
durability,
professional certification,
safety claims.
`,

    "Automotive": `
Use only seller-provided information.

Never invent:
vehicle compatibility,
car model compatibility,
waterproofing,
durability,
heavy-duty claims,
exact dimensions,
installation method,
vehicle model,
year compatibility,
warranty.
`,

    "Garden": `
Use only seller-provided information.

Never invent:
plant suitability,
weather resistance,
chemical composition,
durability,
waterproofing,
capacity,
fertilizer properties.
`,

    "Food": `
Use only seller-provided information.

Never invent:
ingredients,
nutrition,
health benefits,
expiry,
shelf life,
certification,
dietary claims,
allergen information.
`,

    "Gifts": `
Use only seller-provided information.

Never invent:
recipient suitability,
occasion,
packaging details,
contents,
number of items,
material,
quality claims.
`

};

// ==========================================================
// FORBIDDEN MARKETING / UNSUPPORTED CLAIMS
// ==========================================================

const forbiddenClaims = [

    "waterproof",
    "durable",
    "premium",
    "heavy duty",
    "heavy-duty",
    "lightweight",
    "comfortable",
    "easy to use",
    "long lasting",
    "long-lasting",
    "perfect fit",
    "safe",
    "certified",
    "warranty",
    "guarantee",
    "compatible",
    "fast charging",
    "battery backup",
    "health benefit",
    "health benefits",
    "skin benefit",
    "skin benefits",
    "medical benefit",
    "medical benefits",
    "educational benefit",
    "educational benefits",
    "dermatologist",
    "clinically proven",
    "100%",
    "best",
    "top quality",
    "chemical free",
    "organic",
    "natural",
    "eco-friendly",
    "eco friendly"

];

// ==========================================================
// NORMALIZE CATEGORY
// ==========================================================

function normalizeCategory(value) {

    if (!value) {
        return "";
    }

    const raw = String(value)
        .trim()
        .replace(/^[^\p{L}\p{N}]+/u, "")
        .trim();

    const lower = raw.toLowerCase();

    const map = {

        "fashion & clothing":
            "Fashion",

        "fashion":
            "Fashion",

        "beauty":
            "Beauty",

        "electronics":
            "Electronics",

        "home & kitchen":
            "Home & Kitchen",

        "home and kitchen":
            "Home & Kitchen",

        "shoes":
            "Shoes",

        "jewellery":
            "Jewellery",

        "jewelry":
            "Jewellery",

        "toys":
            "Toys",

        "books":
            "Books",

        "pet":
            "Pet",

        "pets":
            "Pet",

        "sports":
            "Sports",

        "automotive":
            "Automotive",

        "garden":
            "Garden",

        "food":
            "Food",

        "gifts":
            "Gifts"

    };

    return map[lower] || raw;

}

// ==========================================================
// CLEAN TEXT
// ==========================================================

function cleanText(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }

    return String(value)
        .replace(/^[\s:：\-–—]+/, "")
        .trim();

}

// ==========================================================
// CLEAN INPUT
// ==========================================================

function cleanInput(body) {

    const input = {};

    Object.entries(body || {}).forEach(
        ([key, value]) => {

            if (typeof value === "string") {

                input[key] =
                    cleanText(value);

            } else if (
                value !== undefined &&
                value !== null
            ) {

                input[key] = value;

            }

        }
    );

    if (input.category) {

        input.category =
            normalizeCategory(
                input.category
            );

    }

    if (input.productName) {

        input.productName =
            cleanText(
                input.productName
            );

    }

    return input;

}

// ==========================================================
// ALLOWED FIELDS
// ==========================================================

function getAllowedFields(category) {

    return new Set([

        "category",

        ...commonFields,

        ...(categoryFields[category] || [])

    ]);

}

// ==========================================================
// BUILD FACTS
// ==========================================================

function buildFacts(input) {

    const category =
        normalizeCategory(
            input.category
        );

    const allowed =
        getAllowedFields(category);

    const facts = {};

    allowed.forEach(
        (key) => {

            if (key === "category") {
                return;
            }

            const value =
                input[key];

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {

                facts[key] =
                    String(value).trim();

            }

        }
    );

    return facts;

}

// ==========================================================
// DISPLAY LABEL
// ==========================================================

function displayLabel(key) {

    const labels = {

        productName:
            "Product",

        brand:
            "Brand",

        price:
            "Price",

        material:
            "Material",

        color:
            "Color",

        size:
            "Size",

        pattern:
            "Pattern",

        fit:
            "Fit",

        occasion:
            "Occasion",

        quantity:
            "Quantity",

        formTexture:
            "Form / Texture",

        variant:
            "Variant",

        ingredients:
            "Ingredients",

        skinType:
            "Skin Type",

        hairType:
            "Hair Type",

        fragrance:
            "Fragrance",

        model:
            "Model",

        connectivity:
            "Connectivity",

        compatibility:
            "Compatibility",

        battery:
            "Battery",

        power:
            "Power",

        capacity:
            "Capacity",

        dimensions:
            "Dimensions",

        usage:
            "Usage",

        sole:
            "Sole",

        closure:
            "Closure",

        design:
            "Design",

        author:
            "Author",

        language:
            "Language",

        format:
            "Format",

        pages:
            "Pages",

        publisher:
            "Publisher",

        edition:
            "Edition",

        isbn:
            "ISBN",

        petType:
            "Pet Type",

        flavour:
            "Flavour",

        weight:
            "Weight",

        activitySport:
            "Activity / Sport",

        recipient:
            "Recipient",

        packaging:
            "Packaging",

        productFeatures:
            "Features",

        extraProductInformation:
            "Extra Information"

    };

    return labels[key] || key;

}

// ==========================================================
// BUILD AI PROMPT
// ==========================================================

function buildPrompt(input) {

    const category =
        normalizeCategory(
            input.category
        );

    const facts =
        buildFacts(input);

    const categoryRule =
        categoryRules[category] ||
        `
Use only seller-provided information.
Never invent specifications or claims.
`;

    return `

You are the STRICT FACTUAL PRODUCT LISTING GENERATOR
for AI Seller Toolkit.

==================================================
ABSOLUTE RULE
==================================================

The SELLER DATA below is the ONLY source of product facts.

You MUST NOT:

- invent
- guess
- assume
- infer
- complete missing information
- add marketing claims
- add specifications
- add benefits
- add compatibility claims
- add quality claims
- add safety claims

If information is missing:

DO NOT ADD IT.

==================================================
CATEGORY
==================================================

${category}

==================================================
CATEGORY SAFETY RULES
==================================================

${categoryRule}

==================================================
SELLER DATA
==================================================

${JSON.stringify(
    facts,
    null,
    2
)}

==================================================
STRICT EXAMPLES
==================================================

Do NOT add:

Waterproof
Durable
Premium
Heavy Duty
Lightweight
Comfortable
Easy to use
Long lasting
Perfect fit
Safe
Certified
Warranty
Guarantee
Compatible
Fast charging
Battery backup
Health benefits
Skin benefits
Medical benefits
Educational benefits
Age recommendation
Country of origin
Any specification not supplied

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

No markdown.

No code fences.

No explanation.

Use exactly:

{
    "title": "",
    "description": "",
    "highlights": [],
    "keywords": [],
    "hashtags": [],
    "seoTitle": "",
    "seoDescription": ""
}

==================================================
FIELD RULES
==================================================

TITLE:

Use only seller facts.

DESCRIPTION:

Use only seller facts.

HIGHLIGHTS:

Every item must be directly supported by seller data.

KEYWORDS:

Use only product/category information actually supplied.

HASHTAGS:

Create hashtags only from supplied product/category information.

SEO TITLE:

Use only supplied facts.

SEO DESCRIPTION:

Use only supplied facts.

==================================================
FINAL CHECK
==================================================

Before returning JSON:

Check every factual statement against SELLER DATA.

If a statement cannot be directly supported,
REMOVE IT.

Return JSON only.

`;

}

// ==========================================================
// PARSE GEMINI JSON
// ==========================================================

function parseGeminiJSON(text) {

    if (!text) {

        throw new Error(
            "Empty Gemini response"
        );

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

    } catch (_) {

        // Continue

    }

    const firstBrace =
        cleaned.indexOf("{");

    const lastBrace =
        cleaned.lastIndexOf("}");

    if (
        firstBrace !== -1 &&
        lastBrace !== -1 &&
        lastBrace > firstBrace
    ) {

        const jsonPart =
            cleaned.substring(
                firstBrace,
                lastBrace + 1
            );

        try {

            return JSON.parse(
                jsonPart
            );

        } catch (_) {

            // Continue

        }

    }

    throw new Error(
        "Gemini returned invalid JSON"
    );

}

// ==========================================================
// NORMALIZE LISTING
// ==========================================================

function normalizeListing(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        throw new Error(
            "Invalid listing response"
        );

    }

    return {

        title:
            typeof data.title === "string"
                ? data.title.trim()
                : "",

        description:
            typeof data.description === "string"
                ? data.description.trim()
                : "",

        highlights:
            Array.isArray(
                data.highlights
            )
                ? data.highlights
                    .map(
                        item =>
                            String(item).trim()
                    )
                    .filter(Boolean)
                : [],

        keywords:
            Array.isArray(
                data.keywords
            )
                ? data.keywords
                    .map(
                        item =>
                            String(item).trim()
                    )
                    .filter(Boolean)
                : [],

        hashtags:
            Array.isArray(
                data.hashtags
            )
                ? data.hashtags
                    .map(
                        item =>
                            String(item).trim()
                    )
                    .filter(Boolean)
                : [],

        seoTitle:
            typeof data.seoTitle === "string"
                ? data.seoTitle.trim()
                : "",

        seoDescription:
            typeof data.seoDescription === "string"
                ? data.seoDescription.trim()
                : ""

    };

}

// ==========================================================
// NORMALIZE FOR COMPARISON
// ==========================================================

function normalizeForCompare(value) {

    return String(value || "")
        .toLowerCase()
        .replace(
            /[^\p{L}\p{N}₹%.]+/gu,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}

// ==========================================================
// FORBIDDEN CLAIM CHECK
// ==========================================================

function containsForbiddenClaim(text) {

    const normalized =
        String(text || "")
            .toLowerCase();

    return (
        forbiddenClaims.find(
            claim =>
                normalized.includes(
                    claim
                )
        ) || ""
    );

}

// ==========================================================
// NUMBER CHECK
// ==========================================================

function hasUnsupportedNumbers(
    text,
    facts
) {

    const source =
        Object.values(facts)
            .join(" ");

    const numbers =
        String(text || "")
            .match(
                /\d+(?:\.\d+)?/g
            ) || [];

    return (
        numbers.find(
            number =>
                !source.includes(
                    number
                )
        ) || ""
    );

}

// ==========================================================
// AI OUTPUT FACT CHECK
// ==========================================================

function outputUsesUnsupportedFacts(
    listing,
    facts,
    category
) {

    const combined = [

        listing.title,

        listing.description,

        ...listing.highlights,

        ...listing.keywords,

        listing.seoTitle,

        listing.seoDescription

    ].join(" ");

    // ------------------------------------------
    // Forbidden claims
    // ------------------------------------------

    const forbidden =
        containsForbiddenClaim(
            combined
        );

    if (forbidden) {

        return (
            "Unsupported marketing claim: " +
            forbidden
        );

    }

    // ------------------------------------------
    // Unsupported numbers
    // ------------------------------------------

    const unsupportedNumber =
        hasUnsupportedNumbers(
            combined,
            facts
        );

    if (unsupportedNumber) {

        return (
            "Unsupported number: " +
            unsupportedNumber
        );

    }

    // ------------------------------------------
    // Product name must remain
    // ------------------------------------------

    const productName =
        normalizeForCompare(
            facts.productName
        );

    if (
        productName &&
        !normalizeForCompare(
            listing.title
        ).includes(
            productName
        )
    ) {

        return (
            "Title does not contain " +
            "the supplied product name"
        );

    }

    // ------------------------------------------
    // Category must be present in keywords
    // ------------------------------------------

    const categoryText =
        normalizeForCompare(
            category
        );

    const keywordsText =
        normalizeForCompare(
            listing.keywords.join(" ")
        );

    if (
        categoryText &&
        !keywordsText.includes(
            categoryText
        )
    ) {

        return (
            "Keywords do not contain " +
            "the supplied category"
        );

    }

    // ------------------------------------------
    // Basic unsupported wording protection
    // ------------------------------------------

    const normalizedFacts =
        Object.values(facts)
            .map(
                normalizeForCompare
            )
            .filter(Boolean);

    const factualTokens =
        new Set(
            normalizedFacts
                .flatMap(
                    value =>
                        value
                            .split(" ")
                            .filter(
                                token =>
                                    token.length >= 4
                            )
                )
        );

    const allowedWords = new Set([

        "product",
        "price",
        "available",
        "includes",
        "contains",
        "made",
        "from",
        "with",
        "for",
        "the",
        "and",
        "in",
        "of",
        "this",
        "is",
        "are",
        "set",
        "piece",
        "pieces",
        "buy",
        "shop",
        "brand",
        "features",
        "quantity",
        "color",
        "size",
        "material",
        "language",
        "format",
        "pages",
        "edition",
        "author",
        "publisher",
        "model",
        "design",
        "occasion",
        "pet",
        "type",
        "activity",
        "sport",
        "weight",
        "capacity",
        "dimensions",
        "form",
        "texture",
        "variant",
        "ingredients",
        "flavour",
        "fragrance",
        "pattern",
        "fit",
        "sole",
        "closure",
        "connectivity",
        "battery",
        "power",
        "compatibility",
        "usage",
        "recipient",
        "packaging",
        "information",
        "english",
        "one",
        "only"

    ]);

    const textTokens =
        normalizeForCompare(
            combined
        )
            .split(" ")
            .filter(
                token =>
                    token.length >= 4
            );

    const unsupportedWords =
        textTokens.filter(
            token =>
                !factualTokens.has(
                    token
                ) &&
                !allowedWords.has(
                    token
                )
        );

    if (
        unsupportedWords.length > 8
    ) {

        return (
            "Possible unsupported wording: " +
            unsupportedWords
                .slice(0, 5)
                .join(", ")
        );

    }

    return "";

}

// ==========================================================
// VALIDATE LISTING
// ==========================================================

function validateListing(
    listing,
    facts,
    category
) {

    if (!listing.title) {

        throw new Error(
            "AI did not return a title"
        );

    }

    if (!listing.description) {

        throw new Error(
            "AI did not return a description"
        );

    }

    if (
        !Array.isArray(
            listing.highlights
        )
    ) {

        throw new Error(
            "Invalid highlights"
        );

    }

    if (
        !Array.isArray(
            listing.keywords
        )
    ) {

        throw new Error(
            "Invalid keywords"
        );

    }

    if (
        !Array.isArray(
            listing.hashtags
        )
    ) {

        throw new Error(
            "Invalid hashtags"
        );

    }

    const issue =
        outputUsesUnsupportedFacts(
            listing,
            facts,
            category
        );

    if (issue) {

        throw new Error(
            "Strict Fact Guard rejected AI output: " +
            issue
        );

    }

    return true;

}

// ==========================================================
// GEMINI REQUEST
// ==========================================================

async function generateWithModel(
    model,
    prompt
) {

    if (!ai) {

        throw new Error(
            "Gemini API key is not configured"
        );

    }

    console.log(
        `🤖 Gemini model: ${model}`
    );

    const response =
        await ai.models.generateContent({

            model: model,

            contents: prompt

        });

    if (!response) {

        throw new Error(
            "No response from Gemini"
        );

    }

    let text = "";

    if (
        typeof response.text === "string"
    ) {

        text =
            response.text;

    } else if (
        response.text
    ) {

        text =
            String(
                response.text
            );

    }

    if (!text) {

        throw new Error(
            "Gemini returned empty response"
        );

    }

    return parseGeminiJSON(
        text
    );

}

// ==========================================================
// SLEEP
// ==========================================================

function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}

// ==========================================================
// TEMPORARY ERROR CHECK
// ==========================================================

function isTemporaryError(
    error
) {

    const message =
        String(
            error?.message ||
            error
        ).toLowerCase();

    return (

        message.includes("503") ||

        message.includes(
            "unavailable"
        ) ||

        message.includes(
            "high demand"
        ) ||

        message.includes(
            "temporarily"
        ) ||

        message.includes("429") ||

        message.includes(
            "rate limit"
        )

    );

}

// ==========================================================
// VALUE HELPER
// ==========================================================

function value(
    facts,
    key
) {

    return facts[key]
        ? String(
            facts[key]
        ).trim()
        : "";

}

// ==========================================================
// JOIN PARTS
// ==========================================================

function joinParts(parts) {

    return parts
        .filter(Boolean)
        .join(" ");

}

// ==========================================================
// DETERMINISTIC FACT-ONLY LISTING
// ==========================================================

function buildDeterministicListing(
    input
) {

    const category =
        normalizeCategory(
            input.category
        );

    const facts =
        buildFacts(input);

    const name =
        value(
            facts,
            "productName"
        );

    const brand =
        value(
            facts,
            "brand"
        );

    const price =
        value(
            facts,
            "price"
        );

    // ------------------------------------------
    // TITLE
    // ------------------------------------------

    const titleParts = [

        brand,
        name

    ];

    const fields =
        categoryFields[category] ||
        [];

    fields.forEach(
        key => {

            if (
                titleParts
                    .join(" ")
                    .length >= 70
            ) {

                return;

            }

            if (

                [
                    "quantity",
                    "color",
                    "material",
                    "size",
                    "model",
                    "design",
                    "variant",
                    "format",
                    "edition"

                ].includes(key) &&

                value(
                    facts,
                    key
                )

            ) {

                titleParts.push(
                    value(
                        facts,
                        key
                    )
                );

            }

        }
    );

    const title =
        titleParts
            .filter(Boolean)
            .join(" - ");

    // ------------------------------------------
    // DESCRIPTION
    // ------------------------------------------

    const sentences = [];

    const intro =
        joinParts([

            brand,
            name

        ]);

    if (intro) {

        sentences.push(
            `${intro}.`
        );

    }

    fields.forEach(
        key => {

            const fieldValue =
                value(
                    facts,
                    key
                );

            if (fieldValue) {

                sentences.push(

                    `${displayLabel(
                        key
                    )}: ${fieldValue}.`

                );

            }

        }
    );

    if (price) {

        sentences.push(
            `Price: ${price}.`
        );

    }

    if (
        facts.productFeatures
    ) {

        sentences.push(

            `Features: ${
                facts.productFeatures
            }.`

        );

    }

    if (
        facts.extraProductInformation
    ) {

        sentences.push(

            `Additional information: ${
                facts.extraProductInformation
            }.`

        );

    }

    const description =
        sentences.join(" ");

    // ------------------------------------------
    // HIGHLIGHTS
    // ------------------------------------------

    const highlights = [];

    if (brand) {

        highlights.push(
            `Brand: ${brand}`
        );

    }

    fields.forEach(
        key => {

            const fieldValue =
                value(
                    facts,
                    key
                );

            if (fieldValue) {

                highlights.push(

                    `${displayLabel(
                        key
                    )}: ${fieldValue}`

                );

            }

        }
    );

    if (
        facts.productFeatures
    ) {

        highlights.push(

            `Features: ${
                facts.productFeatures
            }`

        );

    }

    if (price) {

        highlights.push(
            `Price: ${price}`
        );

    }

    // ------------------------------------------
    // KEYWORDS
    // ------------------------------------------

    const keywordValues = [

        name,
        brand,
        category

    ];

    fields.forEach(
        key => {

            const fieldValue =
                value(
                    facts,
                    key
                );

            if (fieldValue) {

                keywordValues.push(
                    fieldValue
                );

            }

        }
    );

    const keywords = [

        ...new Set(
            keywordValues
                .filter(Boolean)
        )

    ];

    // ------------------------------------------
    // HASHTAGS
    // ------------------------------------------

    const hashtags = [

        ...new Set(

            keywords

                .map(
                    item =>
                        String(item)
                            .replace(
                                /[^\p{L}\p{N}]+/gu,
                                ""
                            )
                            .trim()
                )

                .filter(
                    item =>
                        item.length >= 2
                )

                .slice(0, 8)

                .map(
                    item =>
                        `#${item}`
                )

        )

    ];

    // ------------------------------------------
    // SEO
    // ------------------------------------------

    const seoTitle =
        title;

    const seoDescription =
        description;

    return {

        title:
            title ||
            category,

        description,

        highlights,

        keywords,

        hashtags,

        seoTitle,

        seoDescription

    };

}

// ==========================================================
// SMART AI GENERATION
// ==========================================================

async function generateListing(
    prompt,
    input
) {

    const category =
        normalizeCategory(
            input.category
        );

    const facts =
        buildFacts(input);

    const models = [

        PRIMARY_MODEL,

        FALLBACK_MODEL

    ].filter(

        (
            model,
            index,
            array
        ) =>

            model &&
            array.indexOf(
                model
            ) === index

    );

    let lastError =
        null;

    // ======================================================
    // TRY GEMINI MODELS
    // ======================================================

    for (
        const model of models
    ) {

        for (
            let attempt = 1;
            attempt <= 2;
            attempt++
        ) {

            try {

                console.log(
                    `🚀 ${model} attempt ${attempt}/2`
                );

                const raw =
                    await generateWithModel(
                        model,
                        prompt
                    );

                const listing =
                    normalizeListing(
                        raw
                    );

                validateListing(
                    listing,
                    facts,
                    category
                );

                console.log(
                    `✅ ${model} returned a fact-checked listing`
                );

                return {

                    listing,

                    model

                };

            } catch (error) {

                lastError =
                    error;

                console.error(

                    `❌ ${model} attempt ${attempt} failed:`,

                    error.message

                );

                // ------------------------------------------
                // Retry temporary Gemini problems
                // ------------------------------------------

                if (
                    attempt === 1 &&
                    isTemporaryError(
                        error
                    )
                ) {

                    console.log(
                        "⏳ Temporary Gemini issue. Retrying..."
                    );

                    await sleep(
                        2500
                    );

                }

                // ------------------------------------------
                // Do not retry rejected factual output
                // ------------------------------------------

                else if (

                    attempt === 1 &&

                    String(
                        error.message
                    )
                        .toLowerCase()
                        .includes(
                            "strict fact guard"
                        )

                ) {

                    console.log(
                        "🛑 AI output rejected by Strict Fact Guard."
                    );

                    break;

                }

                // ------------------------------------------
                // Other errors
                // ------------------------------------------

                else if (
                    attempt === 1 &&
                    !isTemporaryError(
                        error
                    )
                ) {

                    break;

                }

            }

        }

    }

    // ======================================================
    // DETERMINISTIC FALLBACK
    // ======================================================

    console.warn(
        "⚠️ Gemini unavailable or rejected."
    );

    console.warn(
        "🛡️ Using deterministic fact-only generator."
    );

    return {

        listing:
            buildDeterministicListing(
                input
            ),

        model:
            "fact-only-generator",

        fallbackReason:
            lastError?.message ||
            "Gemini unavailable"

    };

}

// ==========================================================
// ROOT
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI SELLER TOOLKIT BACKEND",

            version:
                "7.0",

            strictFactGuard:
                true,

            noInventedFacts:
                true,

            deterministicFallback:
                true,

            geminiConfigured:
                Boolean(
                    GEMINI_API_KEY
                ),

            primaryModel:
                PRIMARY_MODEL,

            fallbackModel:
                FALLBACK_MODEL

        });

    }
);

// ==========================================================
// STATUS API
// ==========================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            online:
                true,

            version:
                "7.0",

            geminiConfigured:
                Boolean(
                    GEMINI_API_KEY
                ),

            primaryModel:
                PRIMARY_MODEL,

            fallbackModel:
                FALLBACK_MODEL,

            strictFactGuard:
                true,

            noInventedFacts:
                true,

            deterministicFallback:
                true

        });

    }
);

// ==========================================================
// CATEGORIES API
// ==========================================================

app.get(
    "/api/categories",
    (req, res) => {

        res.json({

            success:
                true,

            categories

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

            // ------------------------------------------
            // CLEAN INPUT
            // ------------------------------------------

            const input =
                cleanInput(
                    req.body || {}
                );

            // ------------------------------------------
            // CATEGORY
            // ------------------------------------------

            const category =
                normalizeCategory(
                    input.category
                );

            if (!category) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Product category is required"

                    });

            }

            // ------------------------------------------
            // VALID CATEGORY
            // ------------------------------------------

            if (
                !categories.includes(
                    category
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            `Unsupported product category: ${category}`

                    });

            }

            // ------------------------------------------
            // PRODUCT NAME
            // ------------------------------------------

            const productName =
                cleanText(
                    input.productName
                );

            if (!productName) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Product name is required"

                    });

            }

            input.category =
                category;

            input.productName =
                productName;

            // ------------------------------------------
            // SELLER FACTS
            // ------------------------------------------

            const facts =
                buildFacts(
                    input
                );

            // ------------------------------------------
            // PROMPT
            // ------------------------------------------

            const prompt =
                buildPrompt(
                    input
                );

            console.log(
                "============================================"
            );

            console.log(
                "🧾 GENERATING LISTING"
            );

            console.log(
                "Category:",
                category
            );

            console.log(
                "Product:",
                productName
            );

            console.log(
                "Seller Facts:",
                facts
            );

            console.log(
                "============================================"
            );

            // ------------------------------------------
            // GENERATE
            // ------------------------------------------

            const result =
                await generateListing(
                    prompt,
                    input
                );

            const finalListing =
                normalizeListing(
                    result.listing
                );

            // ------------------------------------------
            // FINAL VALIDATION
            // ------------------------------------------

            validateListing(
                finalListing,
                facts,
                category
            );

            // ------------------------------------------
            // RESPONSE
            // ------------------------------------------

            return res.json({

                success:
                    true,

                category:

                    category,

                model:

                    result.model,

                strictFactGuard:

                    true,

                noInventedFacts:

                    true,

                fallbackUsed:

                    result.model ===
                    "fact-only-generator",

                listing:

                    finalListing

            });

        } catch (error) {

            console.error(
                "❌ /api/generate-listing error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        error.message ||
                        "Unable to generate listing"

                });

        }

    }
);

// ==========================================================
// 404 HANDLER
// ==========================================================

app.use(
    (req, res) => {

        res
            .status(404)
            .json({

                success:
                    false,

                error:
                    "API endpoint not found"

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
            "============================================"
        );

        console.log(
            "🤖 AI SELLER TOOLKIT BACKEND"
        );

        console.log(
            "📌 Version: 7.0"
        );

        console.log(
            `🚀 Server running on port ${PORT}`
        );

        console.log(
            `🤖 Gemini Primary Model: ${PRIMARY_MODEL}`
        );

        console.log(
            `🔄 Gemini Fallback Model: ${FALLBACK_MODEL}`
        );

        console.log(

            `🔑 Gemini API: ${
                GEMINI_API_KEY
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            }`

        );

        console.log(
            "🛡️ Strict Fact Guard: ENABLED"
        );

        console.log(
            "🚫 No Invented Facts: ENABLED"
        );

        console.log(
            "🧩 Deterministic Fact-Only Fallback: ENABLED"
        );

        console.log(
            "============================================"
        );

    }
);
