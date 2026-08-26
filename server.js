// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 6.2
// Category-Aware + Strict Factual AI
// Smart Retry + Fallback Model
// 503 High-Demand Protection
// No Invented Facts
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
app.use(express.json({ limit: "1mb" }));

// ==========================================================
// ENVIRONMENT
// ==========================================================

const PORT = process.env.PORT || 10000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const PRIMARY_MODEL =
    process.env.GEMINI_PRIMARY_MODEL || "gemini-3.6-flash";

const FALLBACK_MODEL =
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";

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
// CATEGORY RULES
// ==========================================================

const categoryRules = {

    "Fashion": `
Use only user-provided fashion information.

Possible information:
Fabric / Material
Color
Size
Pattern
Fit
Occasion
Quantity
Brand
Price
Product Features
Extra Product Information

Never invent:
fabric composition
fit
occasion
washing instructions
design details
quality claims
comfort claims
size availability
warranty
country of origin
care instructions
`;

    "Beauty": `
Use only user-provided beauty information.

Possible information:
Form / Texture
Color
Quantity
Variant
Ingredients
Skin Type
Hair Type
Fragrance
Brand
Price
Product Features
Extra Product Information

Never invent:
ingredients
benefits
skin benefits
hair benefits
dermatologist claims
safety claims
expiry
shelf life
fragrance
skin type
hair type
certification
medical claims
`;

    "Electronics": `
Use only user-provided electronics information.

Possible information:
Material
Color
Model
Connectivity
Compatibility
Battery
Power
Capacity
Dimensions
Quantity
Brand
Price
Product Features
Extra Product Information

Never invent:
battery capacity
charging time
playback time
warranty
compatibility
processor
RAM
storage
water resistance
certification
performance
technical specifications
`;

    "Home & Kitchen": `
Use only user-provided home and kitchen information.

Possible information:
Material
Color
Size / Dimensions
Capacity
Quantity
Usage
Brand
Price
Product Features
Extra Product Information

Never invent:
capacity
dimensions
food safety
dishwasher safety
microwave safety
durability
heat resistance
waterproofing
certification
`;

    "Shoes": `
Use only user-provided shoe/product information.

Possible information:
Material
Color
Size
Sole
Closure
Occasion
Quantity
Brand
Price
Product Features
Extra Product Information

Never invent:
shoe size availability
fit
comfort
sole material
waterproofing
durability
occasion
sports suitability
`;

    "Jewellery": `
Use only user-provided jewellery information.

Possible information:
Material
Color
Design
Size
Occasion
Quantity
Brand
Price
Product Features
Extra Product Information

Never invent:
gold purity
silver purity
stone type
gemstone authenticity
plating type
hallmark
weight
precious metal content
`;

    "Toys": `
Use only user-provided toy information.

Possible information:
Material
Color
Size
Pattern
Fit
Occasion
Quantity
Brand
Price
Product Features
Extra Product Information

Never invent:
recommended age
safety certification
educational benefits
battery information
number of pieces
material composition
safety claims
`;

    "Books": `
Use only user-provided book information.

Possible information:
Author
Language
Format
Pages
Publisher
Edition
ISBN
Brand
Price
Product Features
Extra Product Information

Never invent:
publication date
ISBN
author
publisher
page count
edition
plot
reviews
awards
`;

    "Pet": `
Use only user-provided pet product information.

Possible information:
Pet Type
Material
Size
Quantity
Ingredients
Flavour
Brand
Price
Product Features
Extra Product Information

Never invent:
ingredients
flavour
nutrition
age suitability
medical benefits
safety claims
pet breed compatibility
`;

    "Sports": `
Use only user-provided sports information.

Possible information:
Material
Color
Size
Weight
Activity / Sport
Quantity
Brand
Price
Product Features
Extra Product Information

Never invent:
weight
dimensions
sport suitability
performance
durability
professional certification
safety claims
`;

    "Automotive": `
Use only user-provided automotive information.

Possible information:
Material
Color
Size
Pattern
Fit
Occasion
Quantity
Brand
Price
Product Features
Extra Product Information

Never invent:
vehicle compatibility
car model compatibility
waterproofing
durability
heavy-duty claims
exact dimensions
installation method
vehicle model
year compatibility
warranty
`;

    "Garden": `
Use only user-provided garden information.

Possible information:
Material
Color
Size
Capacity
Quantity
Usage
Brand
Price
Product Features
Extra Product Information

Never invent:
plant suitability
weather resistance
chemical composition
durability
waterproofing
capacity
fertilizer properties
`;

    "Food": `
Use only user-provided food information.

Possible information:
Ingredients
Flavour
Quantity
Form
Variant
Brand
Price
Product Features
Extra Product Information

Never invent:
ingredients
nutrition
health benefits
expiry
shelf life
certification
dietary claims
allergen information
`;

    "Gifts": `
Use only user-provided gift information.

Possible information:
Material
Color
Design
Quantity
Occasion
Recipient
Packaging
Brand
Price
Product Features
Extra Product Information

Never invent:
recipient suitability
occasion
packaging details
contents
number of items
material
quality claims
`
};

// ==========================================================
// NORMALIZE CATEGORY
// ==========================================================

function normalizeCategory(value) {

    if (!value) return "";

    let category = String(value)
        .trim()
        .replace(/^[^\w]+/u, "")
        .trim();

    const lower = category.toLowerCase();

    const map = {
        "fashion & clothing": "Fashion",
        "fashion": "Fashion",

        "beauty": "Beauty",

        "electronics": "Electronics",

        "home & kitchen": "Home & Kitchen",
        "home and kitchen": "Home & Kitchen",

        "shoes": "Shoes",

        "jewellery": "Jewellery",
        "jewelry": "Jewellery",

        "toys": "Toys",

        "books": "Books",

        "pet": "Pet",
        "pets": "Pet",

        "sports": "Sports",

        "automotive": "Automotive",

        "garden": "Garden",

        "food": "Food",

        "gifts": "Gifts"
    };

    return map[lower] || category;
}

// ==========================================================
// CLEAN TEXT
// ==========================================================

function cleanText(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/^[\s:：\-–—]+/, "")
        .trim();
}

// ==========================================================
// CLEAN INPUT OBJECT
// ==========================================================

function cleanInput(body) {

    const cleaned = {};

    Object.keys(body || {}).forEach((key) => {

        let value = body[key];

        if (typeof value === "string") {
            value = cleanText(value);
        }

        cleaned[key] = value;
    });

    if (cleaned.category) {
        cleaned.category = normalizeCategory(cleaned.category);
    }

    if (cleaned.productName) {
        cleaned.productName = cleanText(cleaned.productName);
    }

    return cleaned;
}

// ==========================================================
// REMOVE EMPTY VALUES
// ==========================================================

function removeEmptyValues(obj) {

    const result = {};

    Object.entries(obj || {}).forEach(([key, value]) => {

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            result[key] = String(value).trim();
        }

    });

    return result;
}

// ==========================================================
// BUILD USER FACTS
// ==========================================================

function buildFacts(input) {

    const ignoredKeys = new Set([
        "category"
    ]);

    const facts = {};

    Object.entries(input).forEach(([key, value]) => {

        if (ignoredKeys.has(key)) return;

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            facts[key] = String(value).trim();
        }

    });

    return facts;
}

// ==========================================================
// BUILD PROMPT
// ==========================================================

function buildPrompt(input) {

    const category = normalizeCategory(input.category);

    const facts = buildFacts(input);

    const categoryRule =
        categoryRules[category] ||
        `
Use only user-provided information.
Never invent specifications or claims.
`;

    return `
You are the STRICT FACTUAL LISTING GENERATOR for AI Seller Toolkit.

==================================================
ABSOLUTE RULE — NO INVENTED FACTS
==================================================

You MUST NOT create, assume, guess, infer, or add
any product information that the seller did not provide.

Only use facts explicitly present in SELLER DATA.

If information is missing:
- DO NOT guess it.
- DO NOT add it.
- DO NOT create a specification.
- DO NOT create a benefit.
- DO NOT create a compatibility claim.
- DO NOT create a quality claim.

You may write natural sentences using supplied facts,
but you may NOT introduce new factual claims.

==================================================
CATEGORY
==================================================

${category}

==================================================
CATEGORY RULES
==================================================

${categoryRule}

==================================================
SELLER DATA
==================================================

${JSON.stringify(facts, null, 2)}

==================================================
IMPORTANT
==================================================

The following are examples of information that MUST NOT
be invented unless supplied by the seller:

- Waterproof
- Durable
- Premium
- Heavy Duty
- Lightweight
- Comfortable
- Easy to use
- Long lasting
- Perfect fit
- Safe
- Certified
- Warranty
- Guarantee
- Compatible
- Fast charging
- Battery backup
- Health benefits
- Skin benefits
- Medical benefits
- Educational benefits
- Age recommendation
- Country of origin
- Any exact specification not supplied

Do not use generic marketing claims as facts.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not add explanations.

Required JSON structure:

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
Use only supplied facts.

DESCRIPTION:
Write a clear description using only supplied facts.

HIGHLIGHTS:
Every bullet must be directly supported by seller data.

KEYWORDS:
Use product/category keywords based only on supplied information.
Do not create unsupported specifications.

HASHTAGS:
Create hashtags only from supplied product/category information.

SEO TITLE:
Use only supplied facts.

SEO DESCRIPTION:
Use only supplied facts.

If a fact is not supplied, simply leave it out.

==================================================
FINAL SAFETY CHECK
==================================================

Before returning JSON, verify every factual statement
against SELLER DATA.

If a statement cannot be supported directly by SELLER DATA,
remove it.

Return JSON only.
`;
}

// ==========================================================
// PARSE GEMINI JSON
// ==========================================================

function parseGeminiJSON(text) {

    if (!text) {
        throw new Error("Empty Gemini response");
    }

    let cleaned = String(text).trim();

    // Remove markdown code fences if model accidentally returns them
    cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    // Try direct parse
    try {
        return JSON.parse(cleaned);
    } catch (error) {
        // Continue below
    }

    // Try extracting first JSON object
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {

        const jsonPart =
            cleaned.substring(firstBrace, lastBrace + 1);

        try {
            return JSON.parse(jsonPart);
        } catch (error) {
            throw new Error(
                "Gemini returned invalid JSON"
            );
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

    if (!data || typeof data !== "object") {
        throw new Error("Invalid listing response");
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
            Array.isArray(data.highlights)
                ? data.highlights
                    .map(item => String(item).trim())
                    .filter(Boolean)
                : [],

        keywords:
            Array.isArray(data.keywords)
                ? data.keywords
                    .map(item => String(item).trim())
                    .filter(Boolean)
                : [],

        hashtags:
            Array.isArray(data.hashtags)
                ? data.hashtags
                    .map(item => String(item).trim())
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
// VALIDATE LISTING
// ==========================================================

function validateListing(listing) {

    if (!listing.title) {
        throw new Error("AI did not return a title");
    }

    if (!listing.description) {
        throw new Error("AI did not return a description");
    }

    if (!Array.isArray(listing.highlights)) {
        throw new Error("Invalid highlights");
    }

    if (!Array.isArray(listing.keywords)) {
        throw new Error("Invalid keywords");
    }

    if (!Array.isArray(listing.hashtags)) {
        throw new Error("Invalid hashtags");
    }

    return true;
}

// ==========================================================
// GEMINI REQUEST
// ==========================================================

async function generateWithModel(model, prompt) {

    if (!ai) {
        throw new Error("Gemini API key is not configured");
    }

    console.log(`🤖 Gemini model: ${model}`);

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });

    if (!response) {
        throw new Error("No response from Gemini");
    }

    let text = "";

    if (typeof response.text === "string") {
        text = response.text;
    } else if (response.text) {
        text = String(response.text);
    }

    if (!text) {
        throw new Error("Gemini returned empty response");
    }

    return parseGeminiJSON(text);
}

// ==========================================================
// RETRY HELPER
// ==========================================================

function sleep(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });

}

// ==========================================================
// SMART MODEL CALL
// ==========================================================

async function generateListing(prompt) {

    // ======================================================
    // PRIMARY MODEL — ATTEMPT 1
    // ======================================================

    try {

        console.log(
            `🚀 Primary attempt 1/2: ${PRIMARY_MODEL}`
        );

        const result =
            await generateWithModel(
                PRIMARY_MODEL,
                prompt
            );

        return {
            listing: result,
            model: PRIMARY_MODEL
        };

    } catch (error) {

        console.error(
            `❌ Primary attempt 1 failed:`,
            error.message
        );

        // Retry only for temporary availability problems
        if (
            String(error.message).includes("503") ||
            String(error.message).includes("UNAVAILABLE") ||
            String(error.message).toLowerCase().includes("high demand") ||
            String(error.message).toLowerCase().includes("temporarily")
        ) {

            console.log(
                "⏳ Temporary Gemini availability issue."
            );

            await sleep(2500);

            // ==================================================
            // PRIMARY MODEL — ATTEMPT 2
            // ==================================================

            try {

                console.log(
                    `🔁 Primary attempt 2/2: ${PRIMARY_MODEL}`
                );

                const result =
                    await generateWithModel(
                        PRIMARY_MODEL,
                        prompt
                    );

                return {
                    listing: result,
                    model: PRIMARY_MODEL
                };

            } catch (secondError) {

                console.error(
                    `❌ Primary attempt 2 failed:`,
                    secondError.message
                );

            }

        }

    }

    // ======================================================
    // FALLBACK MODEL — ATTEMPT 1
    // ======================================================

    try {

        console.log(
            `🔄 Fallback attempt 1/2: ${FALLBACK_MODEL}`
        );

        const result =
            await generateWithModel(
                FALLBACK_MODEL,
                prompt
            );

        return {
            listing: result,
            model: FALLBACK_MODEL
        };

    } catch (error) {

        console.error(
            `❌ Fallback attempt 1 failed:`,
            error.message
        );

        // ==================================================
        // FALLBACK MODEL — ATTEMPT 2
        // ==================================================

        try {

            console.log(
                `🔁 Fallback attempt 2/2: ${FALLBACK_MODEL}`
            );

            await sleep(1500);

            const result =
                await generateWithModel(
                    FALLBACK_MODEL,
                    prompt
                );

            return {
                listing: result,
                model: FALLBACK_MODEL
            };

        } catch (secondError) {

            console.error(
                `❌ Fallback attempt 2 failed:`,
                secondError.message
            );

            throw new Error(
                "Both Gemini models are currently unavailable. Please try again in a few seconds."
            );
        }
    }
}

// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        server: "online",
        name: "AI Seller Toolkit Backend",
        version: "6.2",
        port: PORT,
        geminiConfigured: Boolean(GEMINI_API_KEY),
        primaryModel: PRIMARY_MODEL,
        fallbackModel: FALLBACK_MODEL,
        strictFactGuard: true,
        noInventedFacts: true
    });

});

// ==========================================================
// STATUS
// ==========================================================

app.get("/api/status", (req, res) => {

    res.json({
        success: true,
        server: "online",
        version: "6.2",
        geminiConfigured: Boolean(GEMINI_API_KEY),
        primaryModel: PRIMARY_MODEL,
        fallbackModel: FALLBACK_MODEL,
        strictFactGuard: true,
        noInventedFacts: true
    });

});

// ==========================================================
// CATEGORIES
// ==========================================================

app.get("/api/categories", (req, res) => {

    res.json({
        success: true,
        categories
    });

});

// ==========================================================
// GENERATE LISTING
// ==========================================================

app.post("/api/generate-listing", async (req, res) => {

    console.log(
        "=================================================="
    );

    console.log(
        "📦 Generate Listing Request"
    );

    try {

        if (!GEMINI_API_KEY) {

            return res.status(500).json({
                success: false,
                error: "Gemini API key is not configured."
            });

        }

        // ==================================================
        // CLEAN INPUT
        // ==================================================

        const input = cleanInput(req.body);

        // ==================================================
        // CATEGORY
        // ==================================================

        const category =
            normalizeCategory(input.category);

        if (!category) {

            return res.status(400).json({
                success: false,
                error: "Product category is required."
            });

        }

        if (!categories.includes(category)) {

            return res.status(400).json({
                success: false,
                error:
                    `Unsupported product category: ${category}`
            });

        }

        // ==================================================
        // PRODUCT NAME
        // ==================================================

        const productName =
            cleanText(
                input.productName ||
                input.product ||
                ""
            );

        if (!productName) {

            return res.status(400).json({
                success: false,
                error: "Product name is required."
            });

        }

        // Normalize productName in input
        input.category = category;
        input.productName = productName;

        // ==================================================
        // LOG
        // ==================================================

        console.log(
            "Generating listing:",
            {
                category: category,
                product: productName
            }
        );

        // ==================================================
        // BUILD PROMPT
        // ==================================================

        const prompt =
            buildPrompt(input);

        // ==================================================
        // GENERATE
        // ==================================================

        const generated =
            await generateListing(prompt);

        // ==================================================
        // NORMALIZE
        // ==================================================

        const listing =
            normalizeListing(
                generated.listing
            );

        // ==================================================
        // VALIDATE
        // ==================================================

        validateListing(listing);

        // ==================================================
        // SUCCESS
        // ==================================================

        console.log(
            `✅ Listing generated successfully using ${generated.model}`
        );

        return res.status(200).json({

            success: true,

            message: "Listing generated successfully.",

            version: "6.2",

            model: generated.model,

            category: category,

            productName: productName,

            strictFactGuard: true,

            noInventedFacts: true,

            listing: listing

        });

    } catch (error) {

        console.error(
            "❌ Listing generation failed:",
            error.message
        );

        // ==================================================
        // IMPORTANT:
        // NEVER RETURN FAKE SUCCESS
        // ==================================================

        return res.status(503).json({

            success: false,

            message:
                "Listing could not be generated right now.",

            error:
                error.message ||
                "Gemini service temporarily unavailable.",

            version: "6.2",

            retryable: true

        });

    }

});

// ==========================================================
// 404
// ==========================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        error: "API endpoint not found.",

        path: req.originalUrl

    });

});

// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use((error, req, res, next) => {

    console.error(
        "❌ Server error:",
        error
    );

    res.status(500).json({

        success: false,

        error:
            "Internal server error."

    });

});

// ==========================================================
// START SERVER
// ==========================================================

app.listen(PORT, () => {

    console.log(
        "=================================================="
    );

    console.log(
        "🤖 AI SELLER TOOLKIT BACKEND"
    );

    console.log(
        "🔐 Version: 6.2"
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
        "🔁 Smart Retry + Fallback: ENABLED"
    );

    console.log(
        "=================================================="
    );

});
