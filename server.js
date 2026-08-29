// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 12
// ==========================================================
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// Existing endpoints preserved:
// GET  /
// GET  /api/status
// GET  /api/categories
// POST /api/generate-title
// POST /api/generate-description
// POST /api/generate-listing
//
// NEW:
// POST /api/generate-keywords
//
// Categories:
// Fashion
// Beauty
// Electronics
// Home & Kitchen
// Shoes
// Jewellery
// Toys
// Books
// Pet
// Sports
// Automotive
// Garden
// Food
// Gifts
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

// ==========================================================
// APP
// ==========================================================

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

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
    process.env.GEMINI_API_KEY;

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";

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

const CATEGORY_RULES = {

    "Fashion": `
Focus on clothing and fashion products.

Use only provided facts such as:
product type, gender, fabric, color, size, pattern,
fit, occasion, design, quantity and other seller-provided details.

Never invent fabric, size, color, fit, certification,
comfort claims or features.
`,

    "Beauty": `
Focus on beauty, skincare, haircare and personal-care products.

Use only seller-provided facts.

Do not invent ingredients, skin benefits, medical benefits,
dermatologist claims, certifications, SPF, quantity,
fragrance or suitability.

Do not make medical claims.
`,

    "Electronics": `
Focus on electronic and technology products.

Use only provided specifications such as:
product type, connectivity, compatibility, battery,
charging, ports, display, controls and other supplied facts.

Never invent technical specifications,
battery capacity, range, warranty, compatibility,
water resistance or certifications.
`,

    "Home & Kitchen": `
Focus on home, kitchen and household products.

Use only supplied information such as:
material, size, capacity, color, design, usage and quantity.

Do not invent dimensions, capacity, material,
dishwasher safety, microwave safety or certifications.
`,

    "Shoes": `
Focus on footwear.

Use only provided facts such as:
shoe type, gender, size, color, material,
design, closure, sole and intended use.

Do not invent material, cushioning, sole technology,
water resistance, comfort claims or size availability.
`,

    "Jewellery": `
Focus on jewellery and fashion accessories.

Use only provided facts such as:
jewellery type, material, design, color,
stone information, plating and occasion.

Never invent gold purity, gemstone authenticity,
metal type, hallmark, certification or weight.
`,

    "Toys": `
Focus on toys and children's products.

Use only provided facts such as:
toy type, material, color, design,
age range if supplied, quantity and features.

Never invent age suitability, safety certification,
educational claims, material or safety features.
`,

    "Books": `
Focus on books.

Use only supplied facts such as:
book title, author, language, genre,
edition, publisher and other provided details.

Never invent author, publisher, edition,
page count, awards, reviews or claims.
`,

    "Pet": `
Focus on pet products.

Use only supplied information such as:
product type, pet type, material, size,
color, quantity and usage.

Do not invent nutritional, medical, safety,
health or veterinary claims.
`,

    "Sports": `
Focus on sports, fitness and exercise products.

Use only provided facts such as:
product type, material, size, sport,
color, quantity and supplied features.

Do not invent performance, medical,
fitness or professional-use claims.
`,

    "Automotive": `
Focus on automotive products and accessories.

Use only seller-provided information such as:
product type, vehicle compatibility if supplied,
material, size, color and usage.

Never invent vehicle compatibility,
technical specifications, durability,
safety or performance claims.
`,

    "Garden": `
Focus on gardening and outdoor products.

Use only supplied facts such as:
tool/product type, material, size,
color, usage and quantity.

Do not invent plant results, durability,
weather resistance or performance claims.
`,

    "Food": `
Focus on food products.

Use only provided facts such as:
product name, ingredients if supplied,
flavor, quantity, packaging and seller-provided details.

Never invent ingredients, nutritional values,
health benefits, shelf life, expiry,
certification or dietary claims.
`,

    "Gifts": `
Focus on gifts and gifting products.

Use only supplied facts such as:
gift type, material, design, personalization,
occasion, color, size and quantity.

Do not invent personalization options,
materials, packaging, certification or features.
`

};

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

    // Remove common emoji prefixes
    value =
        value.replace(
            /^[^\p{L}\p{N}]+/u,
            ""
        )
        .trim();

    const found =
        CATEGORIES.find(
            item =>
                item.toLowerCase() === value
        );

    return found || "";
}

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

    if (typeof value === "string") {
        return value.trim();
    }

    return String(value).trim();
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
            catch {}

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
            catch {}

        }

    }

    return null;
}

// ==========================================================
// GET TEXT FROM INTERACTION
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
        Array.isArray(interaction.steps)
    ) {

        const textParts = [];

        for (
            const step of interaction.steps
        ) {

            if (
                step &&
                step.type === "model_output" &&
                Array.isArray(step.content)
            ) {

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
                apiKey: GEMINI_API_KEY
            });

    }

    const interaction =
        await ai.interactions.create({

            model: MODEL,

            input: prompt

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
            "Gemini ने कोई usable text response नहीं दिया।"
        );

    }

    return text;
}

// ==========================================================
// COMMON FACTUAL RULES
// ==========================================================

const STRICT_RULES = `

STRICT FACTUAL RULES:

1. केवल seller द्वारा दी गई information का उपयोग करो।
2. Missing information को कभी invent मत करो।
3. Fake claims मत बनाओ।
4. Fake benefits मत बनाओ।
5. Fake certification मत बनाओ।
6. Unsupported medical claims मत बनाओ।
7. Unsupported technical specifications मत बनाओ।
8. Unsupported dimensions मत बनाओ।
9. Unsupported compatibility मत बनाओ।
10. Unsupported warranty मत बनाओ।
11. Unsupported material मत बनाओ।
12. Unsupported quantity मत बनाओ।
13. Product को unnecessarily premium, best, No.1 या guaranteed मत बताओ।
14. अगर कोई specification नहीं दी गई है तो उसे छोड़ दो।
15. केवल दिए गए facts को साफ और marketplace-friendly भाषा में लिखो।

`;

// ==========================================================
// SEO FORBIDDEN WORDS
// ==========================================================

const SEO_FORBIDDEN_WORDS = [

    "buy",
    "shop",
    "online",
    "store",
    "sale",
    "offer",
    "deal",
    "best",
    "premium",
    "amazing",
    "excellent",
    "trending",
    "viral",
    "bestseller",
    "guaranteed",
    "guarantee",
    "cheap",
    "discount",
    "free"

];

// ==========================================================
// NORMALIZE SEO KEYWORD
// ==========================================================

function normalizeSEOKeyword(text) {

    if (!text) {
        return "";
    }

    return String(text)
        .toLowerCase()
        .replace(
            /['’]/g,
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
            /\bt[\s-]*shirt\b/g,
            "tshirt"
        )
        .replace(
            /\bt shirt\b/g,
            "tshirt"
        )
        .replace(
            /\btshirt\b/g,
            "tshirt"
        )
        .replace(
            /\bgrams?\b/g,
            "g"
        )
        .replace(
            /\bkilograms?\b/g,
            "kg"
        )
        .replace(
            /\bmilliliters?\b/g,
            "ml"
        )
        .replace(
            /\bliters?\b/g,
            "l"
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}

// ==========================================================
// CLEAN SEO KEYWORD
// ==========================================================

function cleanSEOKeyword(text) {

    if (!text) {
        return "";
    }

    let value =
        String(text)
            .trim()
            .replace(
                /^\d+[\.\)\-:]\s*/,
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

    return value;
}

// ==========================================================
// FILTER SEO KEYWORDS
// ==========================================================

function filterSEOKeywords(
    keywords,
    productName,
    category,
    brand,
    mainKeyword
) {

    const product =
        cleanString(productName);

    const cat =
        cleanString(category);

    const br =
        cleanString(brand);

    const main =
        cleanString(mainKeyword);

    const sourceText =
        [
            product,
            cat,
            br,
            main
        ]
        .filter(Boolean)
        .join(" ");

    const sourceNormalized =
        normalizeSEOKeyword(
            sourceText
        );

    const sourceWords =
        new Set(
            sourceNormalized
                .split(" ")
                .filter(Boolean)
        );

    const brandNormalized =
        normalizeSEOKeyword(br);

    const categoryNormalized =
        normalizeSEOKeyword(cat);

    const finalKeywords = [];

    const seen = new Set();

    for (
        const rawKeyword of keywords
    ) {

        const keyword =
            cleanSEOKeyword(
                rawKeyword
            );

        if (!keyword) {
            continue;
        }

        if (
            keyword.length > 100
        ) {
            continue;
        }

        if (
            keyword.includes("#") ||
            keyword.includes("!") ||
            keyword.includes("?") ||
            keyword.includes(".") ||
            keyword.includes("<") ||
            keyword.includes(">") ||
            keyword.includes("{") ||
            keyword.includes("}")
        ) {
            continue;
        }

        const normalized =
            normalizeSEOKeyword(
                keyword
            );

        if (!normalized) {
            continue;
        }

        if (seen.has(normalized)) {
            continue;
        }

        // Brand alone is not useful SEO keyword
        if (
            brandNormalized &&
            normalized === brandNormalized
        ) {
            continue;
        }

        // Category alone is not useful SEO keyword
        if (
            categoryNormalized &&
            normalized === categoryNormalized
        ) {
            continue;
        }

        const keywordWords =
            normalized
                .split(" ")
                .filter(Boolean);

        // Forbidden commercial/promotional words
        const hasForbidden =
            SEO_FORBIDDEN_WORDS.some(
                word =>
                    keywordWords.includes(word)
            );

        if (hasForbidden) {
            continue;
        }

        // Must have meaningful relation
        // to seller supplied product information.
        let related = false;

        for (
            const word of keywordWords
        ) {

            if (
                sourceWords.has(word)
            ) {

                related = true;
                break;

            }

        }

        if (!related) {
            continue;
        }

        // Avoid random one-word keywords
        if (
            keywordWords.length === 1 &&
            normalizeSEOKeyword(product) !== normalized &&
            normalizeSEOKeyword(main) !== normalized
        ) {
            continue;
        }

        seen.add(normalized);

        finalKeywords.push(
            keyword
        );

        if (
            finalKeywords.length >= 20
        ) {
            break;
        }

    }

    // Always put exact Main Keyword first
    if (main) {

        const mainClean =
            cleanSEOKeyword(
                main
            );

        const mainNormalized =
            normalizeSEOKeyword(
                mainClean
            );

        const existingIndex =
            finalKeywords.findIndex(
                item =>
                    normalizeSEOKeyword(
                        item
                    ) === mainNormalized
            );

        if (existingIndex > 0) {

            const existing =
                finalKeywords.splice(
                    existingIndex,
                    1
                )[0];

            finalKeywords.unshift(
                existing
            );

        }
        else if (
            existingIndex === -1
        ) {

            finalKeywords.unshift(
                mainClean
            );

        }

    }

    return finalKeywords.slice(
        0,
        20
    );
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
                "AI Seller Toolkit Backend",

            version:
                "12.0",

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

            endpoints: [

                "/api/status",
                "/api/categories",
                "/api/generate-title",
                "/api/generate-description",
                "/api/generate-listing",
                "/api/generate-keywords"

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
                "12.0",

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

            endpoints: [

                "/api/status",
                "/api/categories",
                "/api/generate-title",
                "/api/generate-description",
                "/api/generate-listing",
                "/api/generate-keywords"

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
                CATEGORIES

        });

    }
);

// ==========================================================
// GENERATE TITLE
// ==========================================================

app.post(
    "/api/generate-title",
    async (req, res) => {

        try {

            const {
                category,
                productName,
                brand,
                productDetails,
                keywords
            } = req.body || {};

            const normalizedCategory =
                normalizeCategory(
                    category
                );

            if (!normalizedCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required."

                });

            }

            if (!cleanString(productName)) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }

            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";

            const prompt = `

You are an expert marketplace product title generator.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanString(productName)}

BRAND:
${cleanString(brand) || "Not provided"}

PRODUCT DETAILS:
${cleanString(productDetails) || "Not provided"}

IMPORTANT KEYWORDS:
${cleanString(keywords) || "Not provided"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

TASK:

Generate exactly 5 unique product titles.

TITLE RULES:

- Keep titles natural and marketplace-friendly.
- Use the product name accurately.
- Brand may be used only if provided.
- Use keywords only when relevant.
- Do not add unsupported specifications.
- Do not add fake claims.
- Do not add emojis.
- Do not number the titles inside the title text.
- Avoid unnecessary repetition.
- Keep each title reasonably concise.

Return ONLY valid JSON in this exact structure:

{
  "titles": [
    "Title 1",
    "Title 2",
    "Title 3",
    "Title 4",
    "Title 5"
  ]
}

`;

            const output =
                await callGemini(
                    prompt
                );

            const parsed =
                safeJsonParse(
                    output
                );

            let titles = [];

            if (
                parsed &&
                Array.isArray(
                    parsed.titles
                )
            ) {

                titles =
                    parsed.titles
                        .map(cleanString)
                        .filter(Boolean);

            }

            if (
                titles.length === 0
            ) {

                titles =
                    output
                        .split("\n")
                        .map(
                            line =>
                                line
                                    .replace(
                                        /^\s*[\d.)-]+\s*/,
                                        ""
                                    )
                                    .replace(
                                        /^["']|["']$/g,
                                        ""
                                    )
                                    .trim()
                        )
                        .filter(Boolean);

            }

            titles =
                [
                    ...new Set(
                        titles
                    )
                ]
                .slice(0, 5);

            if (!titles.length) {

                throw new Error(
                    "Gemini ने valid titles नहीं दिए।"
                );

            }

            return res.json({

                success: true,

                category:
                    normalizedCategory,

                titles:
                    titles

            });

        }
        catch (error) {

            console.error(
                "GENERATE TITLE ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                error:
                    error.message ||
                    "Title generation failed."

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

        try {

            const {
                category,
                productName,
                brand,
                productDetails,
                keywords
            } = req.body || {};

            const normalizedCategory =
                normalizeCategory(
                    category
                );

            if (!normalizedCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required."

                });

            }

            if (!cleanString(productName)) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }

            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";

            const prompt = `

You are an expert e-commerce product description writer.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanString(productName)}

BRAND:
${cleanString(brand) || "Not provided"}

PRODUCT DETAILS:
${cleanString(productDetails) || "Not provided"}

IMPORTANT KEYWORDS:
${cleanString(keywords) || "Not provided"}

CATEGORY-SPECIFIC RULE:
${categoryRule}

${STRICT_RULES}

TASK:

Write ONE factual, clear and marketplace-ready product description.

DESCRIPTION REQUIREMENTS:

- Use only supplied information.
- Do not invent missing specifications.
- Do not invent features.
- Do not invent benefits.
- Do not invent certifications.
- Do not invent technical specifications.
- Do not make medical claims.
- Do not make guaranteed claims.
- Use important keywords naturally where appropriate.
- Make the description readable.
- Do not mention that you are an AI.
- Do not include JSON.
- Do not use markdown code fences.
- Return ONLY the description text.

`;

            const description =
                (
                    await callGemini(
                        prompt
                    )
                ).trim();

            if (!description) {

                throw new Error(
                    "Gemini ने description नहीं दिया।"
                );

            }

            return res.json({

                success: true,

                category:
                    normalizedCategory,

                description:
                    description

            });

        }
        catch (error) {

            console.error(
                "GENERATE DESCRIPTION ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                error:
                    error.message ||
                    "Description generation failed."

            });

        }

    }
);

// ==========================================================
// GENERATE COMPLETE LISTING
// ==========================================================

app.post(
    "/api/generate-listing",
    async (req, res) => {

        try {

            const {
                category,
                productName,
                productDetails,
                brand,
                price,
                color,
                size,
                material,
                imageDescription
            } = req.body || {};

            const normalizedCategory =
                normalizeCategory(
                    category
                );

            if (!normalizedCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required."

                });

            }

            if (!cleanString(productName)) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }

            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";

            const prompt = `

You are an expert e-commerce product listing generator.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanString(productName)}

BRAND:
${cleanString(brand) || "Not provided"}

PRICE:
${cleanString(price) || "Not provided"}

COLOR:
${cleanString(color) || "Not provided"}

SIZE:
${cleanString(size) || "Not provided"}

MATERIAL:
${cleanString(material) || "Not provided"}

PRODUCT DETAILS:
${cleanString(productDetails) || "Not provided"}

IMAGE DESCRIPTION:
${cleanString(imageDescription) || "Not provided"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

TASK:

Create a complete marketplace-ready listing.

Generate:

1. title
2. description
3. highlights
4. keywords

IMPORTANT:

- Every statement must be supported by seller-provided information.
- Never invent specifications.
- Never invent benefits.
- Never invent certification.
- Never invent technical details.
- Never invent measurements.
- Never invent compatibility.
- Never invent warranty.
- Never invent medical claims.
- If information is missing, leave that information out.
- Do not use emojis in generated content.

Return ONLY valid JSON:

{
  "title": "Product title",
  "description": "Product description",
  "highlights": [
    "Highlight 1",
    "Highlight 2",
    "Highlight 3"
  ],
  "keywords": [
    "keyword 1",
    "keyword 2",
    "keyword 3"
  ]
}

`;

            const output =
                await callGemini(
                    prompt
                );

            const parsed =
                safeJsonParse(
                    output
                );

            if (
                parsed &&
                typeof parsed === "object"
            ) {

                return res.json({

                    success: true,

                    category:
                        normalizedCategory,

                    title:
                        cleanString(
                            parsed.title
                        ),

                    description:
                        cleanString(
                            parsed.description
                        ),

                    highlights:
                        Array.isArray(
                            parsed.highlights
                        )
                            ? parsed.highlights
                                .map(cleanString)
                                .filter(Boolean)
                            : [],

                    keywords:
                        Array.isArray(
                            parsed.keywords
                        )
                            ? parsed.keywords
                                .map(cleanString)
                                .filter(Boolean)
                            : []

                });

            }

            return res.json({

                success: true,

                category:
                    normalizedCategory,

                title:
                    cleanString(
                        productName
                    ),

                description:
                    output,

                highlights:
                    [],

                keywords:
                    []

            });

        }
        catch (error) {

            console.error(
                "GENERATE LISTING ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                error:
                    error.message ||
                    "Complete listing generation failed."

            });

        }

    }
);

// ==========================================================
// NEW — GENERATE SEO KEYWORDS
// ==========================================================

app.post(
    "/api/generate-keywords",
    async (req, res) => {

        try {

            const {
                category,
                productName,
                brand,
                productDetails,
                mainKeyword,
                keyword,
                marketplace
            } = req.body || {};

            const normalizedCategory =
                normalizeCategory(
                    category
                );

            if (!normalizedCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required."

                });

            }

            if (!cleanString(productName)) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }

            const finalMainKeyword =
                cleanString(
                    mainKeyword ||
                    keyword
                );

            if (!finalMainKeyword) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Main Keyword is required."

                });

            }

            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";

            const prompt = `

You are an expert e-commerce SEO keyword generator.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanString(productName)}

BRAND:
${cleanString(brand) || "Not provided"}

PRODUCT DETAILS:
${cleanString(productDetails) || "Not provided"}

MAIN KEYWORD:
${finalMainKeyword}

TARGET MARKETPLACE:
${cleanString(marketplace) || "All Marketplaces"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

SEO KEYWORD RULES:

1. Generate up to 20 useful SEO keywords.
2. Do NOT force 20 keywords.
3. The exact MAIN KEYWORD MUST be included.
4. Put the exact MAIN KEYWORD first.
5. Keywords must be directly relevant to the product.
6. Use only seller-provided facts.
7. Brand + Product is allowed when brand is provided.
8. Category + Product is allowed when natural.
9. Brand + Main Keyword is allowed when natural.
10. Category + Main Keyword is allowed when natural.
11. Product + supplied specification is allowed.
12. Do not invent color.
13. Do not invent material.
14. Do not invent size.
15. Do not invent quantity.
16. Do not invent ingredients.
17. Do not invent features.
18. Do not invent benefits.
19. Do not invent compatibility.
20. Do not invent certification.
21. Do not invent warranty.
22. Do not invent health claims.
23. Do not invent technical specifications.
24. Do not invent another brand.
25. Do not invent another product.
26. Do not create unrelated keywords.
27. Do not create random word combinations.
28. Do not use the brand alone.
29. Do not use the category alone.
30. Do not use promotional/commercial words.

NEVER USE THESE WORDS:

Buy
Shop
Online
Store
Sale
Offer
Deal
Best
Premium
Amazing
Excellent
Trending
Viral
Bestseller
Guaranteed
Guarantee
Cheap
Discount
Free

NORMALIZATION:

Treat these as equivalent for duplicate detection:

T-Shirt
Tshirt
T Shirt

Men's
Mens

Do not change the visible spelling of the seller's product unnecessarily.

OUTPUT:

Return ONLY valid JSON.

Use exactly this structure:

{
  "keywords": [
    "Exact Main Keyword",
    "Keyword 2",
    "Keyword 3"
  ]
}

Do not include explanations.
Do not include numbering.
Do not include markdown.
Do not include code fences.

`;

            const output =
                await callGemini(
                    prompt
                );

            const parsed =
                safeJsonParse(
                    output
                );

            let keywords = [];

            if (
                parsed &&
                Array.isArray(
                    parsed.keywords
                )
            ) {

                keywords =
                    parsed.keywords
                        .map(
                            cleanSEOKeyword
                        )
                        .filter(Boolean);

            }

            // Fallback for plain-text response
            if (
                keywords.length === 0
            ) {

                keywords =
                    output
                        .split(/\r?\n/)
                        .map(
                            cleanSEOKeyword
                        )
                        .filter(Boolean);

            }

            // Always ensure exact main keyword
            keywords.unshift(
                finalMainKeyword
            );

            keywords =
                filterSEOKeywords(
                    keywords,
                    productName,
                    normalizedCategory,
                    brand,
                    finalMainKeyword
                );

            if (
                !keywords.length
            ) {

                keywords = [
                    finalMainKeyword
                ];

            }

            return res.json({

                success: true,

                category:
                    normalizedCategory,

                marketplace:
                    cleanString(
                        marketplace
                    ) ||
                    "All Marketplaces",

                keywords:
                    keywords.slice(
                        0,
                        20
                    )

            });

        }
        catch (error) {

            console.error(
                "GENERATE KEYWORDS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                error:
                    error.message ||
                    "SEO keyword generation failed."

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
                "API endpoint not found.",

            path:
                req.path,

            availableEndpoints: [

                "GET /",
                "GET /api/status",
                "GET /api/categories",
                "POST /api/generate-title",
                "POST /api/generate-description",
                "POST /api/generate-listing",
                "POST /api/generate-keywords"

            ]

        });

    }
);

// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "GLOBAL SERVER ERROR:",
            err
        );

        res.status(500).json({

            success: false,

            error:
                "Internal server error."

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
            "VERSION: 12.0"
        );

        console.log(
            "SERVER: ONLINE"
        );

        console.log(
            "PORT:",
            PORT
        );

        console.log(
            "MODEL:",
            MODEL
        );

        console.log(
            "API: Interactions API"
        );

        console.log(
            "GEMINI:",
            GEMINI_API_KEY
                ? "CONFIGURED"
                : "NOT CONFIGURED"
        );

        console.log(
            "SEO KEYWORD API: ENABLED"
        );

        console.log(
            "=================================================="
        );

    }
);
