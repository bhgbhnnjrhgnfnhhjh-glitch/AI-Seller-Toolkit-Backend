// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 12
// ==========================================================
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// EXISTING ENDPOINTS — KEPT SAFE
//
// GET  /
// GET  /api/status
// GET  /api/categories
//
// POST /api/generate-title
// POST /api/generate-description
// POST /api/generate-listing
//
// NEW
// POST /api/generate-seo
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
// JSON BODY
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
Focus on electronic and tech products.

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

    const value =
        String(category)
            .trim()
            .toLowerCase();

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

    if (
        typeof value === "string"
    ) {
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


    // Remove markdown code fences
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


    // Direct JSON
    try {

        return JSON.parse(
            cleaned
        );

    }
    catch (error) {
        // Continue with extraction
    }


    // JSON object extraction
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
            // Continue
        }

    }


    // JSON array extraction
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
            // Continue
        }

    }


    return null;

}


// ==========================================================
// GET TEXT FROM INTERACTION
// ==========================================================

function getInteractionText(
    interaction
) {

    if (!interaction) {
        return "";
    }


    // Official SDK helper
    if (
        typeof interaction.output_text === "string" &&
        interaction.output_text.trim()
    ) {

        return interaction.output_text.trim();

    }


    // Fallback: inspect steps
    if (
        Array.isArray(
            interaction.steps
        )
    ) {

        const textParts = [];


        for (
            const step of interaction.steps
        ) {

            if (
                step &&
                step.type === "model_output" &&
                Array.isArray(
                    step.content
                )
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


        if (
            textParts.length
        ) {

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

async function callGemini(
    prompt
) {

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
    "free",
    "discount"

];


// ==========================================================
// SEO NORMALIZE
// ==========================================================

function normalizeSEOText(
    text
) {

    return cleanString(text)
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
            /\bmens\b/g,
            "men"
        )
        .replace(
            /\bmen s\b/g,
            "men"
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


// ==========================================================
// SEO WORDS
// ==========================================================

function seoWords(
    text
) {

    const normalized =
        normalizeSEOText(
            text
        );

    if (!normalized) {
        return [];
    }

    return normalized
        .split(" ")
        .filter(Boolean);

}


// ==========================================================
// SEO UNIQUE KEYWORDS
// ==========================================================

function uniqueSEOKeywords(
    keywords
) {

    const output = [];
    const seen = new Set();


    for (
        const item of keywords
    ) {

        const keyword =
            cleanString(item);


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


        seen.add(normalized);

        output.push(
            keyword
        );

    }


    return output;

}


// ==========================================================
// SEO VALIDATION
// ==========================================================

function validateSEOKeywords(
    keywords,
    productName,
    brand,
    mainKeyword,
    category
) {

    const sourceText = [
        productName,
        brand,
        mainKeyword,
        category
    ]
        .map(cleanString)
        .join(" ");


    const sourceWords =
        new Set(
            seoWords(
                sourceText
            )
        );


    const productWords =
        seoWords(
            productName
        );


    const mainWords =
        seoWords(
            mainKeyword
        );


    const categoryWords =
        seoWords(
            category
        );


    const brandNormalized =
        normalizeSEOText(
            brand
        );


    const categoryNormalized =
        normalizeSEOText(
            category
        );


    const finalKeywords = [];


    for (
        const rawKeyword of keywords
    ) {

        let keyword =
            cleanString(
                rawKeyword
            );


        if (!keyword) {
            continue;
        }


        // Remove numbering
        keyword =
            keyword.replace(
                /^\s*[\d.)-]+\s*/,
                ""
            ).trim();


        // Remove bullets
        keyword =
            keyword.replace(
                /^[-•*]\s*/,
                ""
            ).trim();


        if (!keyword) {
            continue;
        }


        // Maximum keyword length
        if (
            keyword.length > 100
        ) {
            continue;
        }


        // Do not allow sentence-like output
        if (
            keyword.includes("!") ||
            keyword.includes("?") ||
            keyword.includes("#")
        ) {
            continue;
        }


        const normalized =
            normalizeSEOText(
                keyword
            );


        if (!normalized) {
            continue;
        }


        // Brand alone is not useful
        if (
            brandNormalized &&
            normalized === brandNormalized
        ) {
            continue;
        }


        // Category alone is not useful
        if (
            categoryNormalized &&
            normalized === categoryNormalized
        ) {
            continue;
        }


        // Forbidden words
        const words =
            seoWords(
                keyword
            );


        const hasForbidden =
            SEO_FORBIDDEN_WORDS.some(
                word =>
                    words.includes(word)
            );


        if (
            hasForbidden
        ) {
            continue;
        }


        // Prevent incorrect Men's transformation
        if (
            normalized.includes(
                "man clothing"
            ) ||
            normalized.includes(
                "men clothing"
            ) ||
            normalized.includes(
                "male clothing"
            )
        ) {
            continue;
        }


        // Keyword must be related to product/main keyword
        let related = false;


        for (
            const word of productWords
        ) {

            if (
                words.includes(word)
            ) {

                related = true;
                break;

            }

        }


        if (!related) {

            for (
                const word of mainWords
            ) {

                if (
                    words.includes(word)
                ) {

                    related = true;
                    break;

                }

            }

        }


        if (!related) {
            continue;
        }


        // Unknown-word protection
        let hasUnknown =
            false;


        for (
            const word of words
        ) {

            if (
                sourceWords.has(word)
            ) {
                continue;
            }


            // T-Shirt normalization
            if (
                word === "tshirt"
            ) {
                continue;
            }


            hasUnknown = true;
            break;

        }


        if (hasUnknown) {
            continue;
        }


        finalKeywords.push(
            keyword
        );

    }


    return uniqueSEOKeywords(
        finalKeywords
    );

}


// ==========================================================
// BUILD SAFE SEO KEYWORDS
// ==========================================================

function buildSafeSEOKeywords(
    productName,
    brand,
    mainKeyword,
    category
) {

    const list = [];


    const product =
        cleanString(
            productName
        );

    const brandValue =
        cleanString(
            brand
        );

    const main =
        cleanString(
            mainKeyword
        );

    const categoryValue =
        cleanString(
            category
        );


    // Main keyword
    if (main) {
        list.push(main);
    }


    // Product
    if (product) {
        list.push(product);
    }


    // Brand + Product
    if (
        brandValue &&
        product
    ) {

        list.push(
            brandValue +
            " " +
            product
        );

    }


    // Brand + Main Keyword
    if (
        brandValue &&
        main
    ) {

        list.push(
            brandValue +
            " " +
            main
        );

    }


    // Category + Product
    if (
        categoryValue &&
        product
    ) {

        list.push(
            categoryValue +
            " " +
            product
        );

    }


    // Category + Main Keyword
    if (
        categoryValue &&
        main
    ) {

        list.push(
            categoryValue +
            " " +
            main
        );

    }


    // Brand + Category + Product
    if (
        brandValue &&
        categoryValue &&
        product
    ) {

        list.push(
            brandValue +
            " " +
            categoryValue +
            " " +
            product
        );

    }


    // Brand + Category + Main
    if (
        brandValue &&
        categoryValue &&
        main
    ) {

        list.push(
            brandValue +
            " " +
            categoryValue +
            " " +
            main
        );

    }


    return list;

}


// ==========================================================
// HEALTH / ROOT
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success:
                true,

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

            success:
                true,

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

            success:
                true,

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

                    success:
                        false,

                    error:
                        "Valid product category is required."

                });

            }


            if (
                !cleanString(
                    productName
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

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


            // Plain text fallback
            if (
                titles.length === 0
            ) {

                titles =
                    output
                        .split(/\r?\n/)
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
                .slice(
                    0,
                    5
                );


            if (
                !titles.length
            ) {

                throw new Error(
                    "Gemini ने valid titles नहीं दिए।"
                );

            }


            return res.json({

                success:
                    true,

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

                success:
                    false,

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

                    success:
                        false,

                    error:
                        "Valid product category is required."

                });

            }


            if (
                !cleanString(
                    productName
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

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

                success:
                    true,

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

                success:
                    false,

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

                    success:
                        false,

                    error:
                        "Valid product category is required."

                });

            }


            if (
                !cleanString(
                    productName
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

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

                    success:
                        true,

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
                                .map(
                                    cleanString
                                )
                                .filter(Boolean)
                            : [],

                    keywords:
                        Array.isArray(
                            parsed.keywords
                        )
                            ? parsed.keywords
                                .map(
                                    cleanString
                                )
                                .filter(Boolean)
                            : []

                });

            }


            // ==================================================
            // FALLBACK
            // ==================================================

            return res.json({

                success:
                    true,

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

                success:
                    false,

                error:
                    error.message ||
                    "Complete listing generation failed."

            });

        }

    }
);


// ==========================================================
// GENERATE SEO KEYWORDS
// NEW ENDPOINT
// ==========================================================

app.post(
    "/api/generate-seo",
    async (req, res) => {

        try {

            const {

                category,
                productName,
                brand,
                mainKeyword,
                keywords,
                marketplace

            } = req.body || {};


            // --------------------------------------------------
            // Category
            // --------------------------------------------------

            const normalizedCategory =
                normalizeCategory(
                    category
                );


            if (!normalizedCategory) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "Valid product category is required."

                });

            }


            // --------------------------------------------------
            // Product
            // --------------------------------------------------

            if (
                !cleanString(
                    productName
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "Product Name is required."

                });

            }


            // --------------------------------------------------
            // Main Keyword
            // --------------------------------------------------

            if (
                !cleanString(
                    mainKeyword
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    error:
                        "Main Keyword is required."

                });

            }


            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";


            // --------------------------------------------------
            // SEO PROMPT
            // --------------------------------------------------

            const prompt = `

You are an expert e-commerce SEO keyword generator.

Your job is to generate accurate, relevant and factual
product SEO keywords.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanString(productName)}

BRAND:
${cleanString(brand) || "Not provided"}

MAIN KEYWORD:
${cleanString(mainKeyword)}

ADDITIONAL KEYWORDS:
${cleanString(keywords) || "Not provided"}

TARGET MARKETPLACE:
${cleanString(marketplace) || "All Marketplaces"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

==========================================================
SEO KEYWORD RULES
==========================================================

1. Generate a maximum of 20 keywords.

2. Do NOT force 20 keywords.

3. Generate only useful and relevant keywords.

4. The exact MAIN KEYWORD MUST be included.

5. The MAIN KEYWORD should normally be the first keyword.

6. Use the product name accurately.

7. Brand + Product keywords are allowed only when the brand
   is actually provided.

8. Brand + Main Keyword keywords are allowed only when
   the brand is actually provided.

9. Category + Product keywords are allowed when natural.

10. Category + Main Keyword keywords are allowed when natural.

11. Brand alone is NOT a keyword.

12. Category alone is NOT a keyword.

13. Never invent another brand.

14. Never invent another product.

15. Never invent color.

16. Never invent material.

17. Never invent size.

18. Never invent quantity.

19. Never invent ingredients.

20. Never invent features.

21. Never invent benefits.

22. Never invent technical specifications.

23. Never invent compatibility.

24. Never invent certification.

25. Never invent warranty.

26. Never invent price.

27. Never invent offers.

28. Never invent quality claims.

29. Never create medical claims.

30. Never create health claims.

31. Never create performance claims.

32. Do NOT use these words:

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
Free
Discount

33. Do not create unrelated keywords.

34. Do not create random word combinations.

35. Do not duplicate keywords.

36. Treat these as equivalent:
T-Shirt
Tshirt
T Shirt

37. Preserve natural wording.

38. Do not change:
Men's → Man

39. Do not create:
Man Clothing
Men Clothing
Male Clothing

40. One keyword per array item.

41. Keywords only.

42. No explanations.

43. No numbering inside keyword text.

44. No emojis.

==========================================================
EXAMPLE
==========================================================

For:

Category:
Food

Product:
Roasted Salted Peanuts

Brand:
Test Foods

Main Keyword:
Roasted Salted Peanuts

Possible valid keywords include:

Roasted Salted Peanuts
Test Foods Roasted Salted Peanuts
Roasted Peanuts
Salted Peanuts
Test Foods Salted Peanuts

Do NOT generate:

Test Foods
Food
Buy Roasted Salted Peanuts
Roasted Salted Peanuts Online
Best Roasted Salted Peanuts
Premium Roasted Salted Peanuts

==========================================================

RETURN FORMAT
==========================================================

Return ONLY valid JSON:

{
  "keywords": [
    "Main Keyword",
    "Keyword 2",
    "Keyword 3"
  ]
}

`;


            // --------------------------------------------------
            // CALL GEMINI
            // --------------------------------------------------

            const output =
                await callGemini(
                    prompt
                );


            // --------------------------------------------------
            // PARSE RESPONSE
            // --------------------------------------------------

            const parsed =
                safeJsonParse(
                    output
                );


            let aiKeywords = [];


            if (
                parsed &&
                Array.isArray(
                    parsed.keywords
                )
            ) {

                aiKeywords =
                    parsed.keywords
                        .map(
                            cleanString
                        )
                        .filter(Boolean);

            }


            // --------------------------------------------------
            // Plain-text fallback
            // --------------------------------------------------

            if (
                aiKeywords.length === 0
            ) {

                aiKeywords =
                    output
                        .split(/\r?\n/)
                        .map(
                            line =>
                                line
                                    .replace(
                                        /^\s*[\d.)-]+\s*/,
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
                                    .trim()
                        )
                        .filter(Boolean);

            }


            // --------------------------------------------------
            // Add safe seller-fact keywords
            // --------------------------------------------------

            const safeKeywords =
                buildSafeSEOKeywords(
                    productName,
                    brand,
                    mainKeyword,
                    normalizedCategory
                );


            const combined =
                [
                    ...safeKeywords,
                    ...aiKeywords
                ];


            // --------------------------------------------------
            // Validate
            // --------------------------------------------------

            let finalKeywords =
                validateSEOKeywords(
                    combined,
                    productName,
                    brand,
                    mainKeyword,
                    normalizedCategory
                );


            // --------------------------------------------------
            // EXACT MAIN KEYWORD
            // --------------------------------------------------

            const exactMain =
                cleanString(
                    mainKeyword
                );


            const mainNormalized =
                normalizeSEOText(
                    exactMain
                );


            const mainExists =
                finalKeywords.some(
                    keyword =>
                        normalizeSEOText(
                            keyword
                        ) ===
                        mainNormalized
                );


            if (!mainExists) {

                finalKeywords.unshift(
                    exactMain
                );

            }
            else {

                // Move exact main keyword to first
                finalKeywords =
                    [
                        exactMain,
                        ...finalKeywords.filter(
                            keyword =>
                                normalizeSEOText(
                                    keyword
                                ) !==
                                mainNormalized
                        )
                    ];

            }


            // --------------------------------------------------
            // Remove duplicates again
            // --------------------------------------------------

            finalKeywords =
                uniqueSEOKeywords(
                    finalKeywords
                );


            // --------------------------------------------------
            // Maximum 20
            // --------------------------------------------------

            finalKeywords =
                finalKeywords.slice(
                    0,
                    20
                );


            // --------------------------------------------------
            // Final safety check
            // --------------------------------------------------

            if (
                finalKeywords.length === 0
            ) {

                finalKeywords = [
                    exactMain
                ];

            }


            console.log(
                "SEO KEYWORDS GENERATED:",
                finalKeywords
            );


            // --------------------------------------------------
            // RESPONSE
            // --------------------------------------------------

            return res.json({

                success:
                    true,

                category:
                    normalizedCategory,

                marketplace:
                    cleanString(
                        marketplace
                    ) ||
                    "All Marketplaces",

                keywords:
                    finalKeywords,

                result:
                    finalKeywords.join(
                        "\n"
                    )

            });

        }
        catch (error) {

            console.error(
                "GENERATE SEO ERROR:",
                error
            );


            return res.status(500).json({

                success:
                    false,

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

            success:
                false,

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

                "POST /api/generate-seo"

            ]

        });

    }
);


// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "GLOBAL SERVER ERROR:",
            err
        );


        res.status(500).json({

            success:
                false,

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
            "SEO API: /api/generate-seo"
        );

        console.log(
            "=================================================="
        );

    }
);
