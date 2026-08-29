// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 12.1
// ==========================================================
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// SAFE UPDATE:
// Existing tools preserved.
// Only SEO endpoint added/fixed.
//
// Endpoints:
// GET  /
// GET  /api/status
// GET  /api/categories
// POST /api/generate-title
// POST /api/generate-description
// POST /api/generate-listing
// POST /api/generate-seo
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

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
Use only seller-provided facts.
Never invent fabric, color, size, gender,
fit, pattern, occasion, material or features.
`,

    "Beauty": `
Focus on beauty, skincare, haircare and personal-care products.
Use only seller-provided facts.
Never invent ingredients, benefits, SPF,
medical claims, certification or suitability.
`,

    "Electronics": `
Focus on electronic and technology products.
Use only seller-provided specifications.
Never invent battery, compatibility, range,
ports, warranty, certification or technical specifications.
`,

    "Home & Kitchen": `
Focus on home, kitchen and household products.
Use only supplied material, size, capacity,
color, design, usage and quantity.
Never invent dimensions, capacity or safety claims.
`,

    "Shoes": `
Focus on footwear.
Use only supplied shoe type, size, color,
material, design, closure, sole and intended use.
Never invent cushioning, comfort or water resistance.
`,

    "Jewellery": `
Focus on jewellery and fashion accessories.
Use only supplied material, design, color,
stone information, plating and occasion.
Never invent purity, hallmark, certification or weight.
`,

    "Toys": `
Focus on toys and children's products.
Use only supplied toy type, material, color,
design, age range, quantity and features.
Never invent safety certification or educational claims.
`,

    "Books": `
Focus on books.
Use only supplied title, author, language,
genre, edition, publisher and details.
Never invent page count, awards or reviews.
`,

    "Pet": `
Focus on pet products.
Use only supplied product type, pet type,
material, size, color, quantity and usage.
Never invent medical or veterinary claims.
`,

    "Sports": `
Focus on sports and fitness products.
Use only supplied product type, material,
size, sport, color, quantity and features.
Never invent performance or medical claims.
`,

    "Automotive": `
Focus on automotive products and accessories.
Use only supplied product type, vehicle compatibility,
material, size, color and usage.
Never invent compatibility or performance.
`,

    "Garden": `
Focus on gardening and outdoor products.
Use only supplied product type, material,
size, color, usage and quantity.
Never invent plant results or durability claims.
`,

    "Food": `
Focus on food products.
Use only supplied product name, ingredients,
flavor, quantity, packaging and seller details.
Never invent nutrition, health, expiry or certification.
`,

    "Gifts": `
Focus on gifts and gifting products.
Use only supplied gift type, material,
design, personalization, occasion, color,
size and quantity.
Never invent packaging or personalization options.
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

        return JSON.parse(
            cleaned
        );

    }
    catch {

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

function getInteractionText(
    interaction
) {

    if (!interaction) {
        return "";
    }

    if (
        typeof interaction.output_text ===
        "string" &&
        interaction.output_text.trim()
    ) {

        return interaction.output_text.trim();

    }

    if (
        Array.isArray(
            interaction.steps
        )
    ) {

        const textParts = [];

        for (
            const step
            of interaction.steps
        ) {

            if (
                step &&
                step.type ===
                    "model_output" &&
                Array.isArray(
                    step.content
                )
            ) {

                for (
                    const block
                    of step.content
                ) {

                    if (
                        block &&
                        block.type === "text" &&
                        typeof block.text ===
                            "string"
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
// STRICT FACTUAL RULES
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
// HEALTH
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI Seller Toolkit Backend",

            version:
                "12.1",

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

            success: true,

            server:
                "AI Seller Toolkit Backend",

            version:
                "12.1",

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

            if (
                !cleanString(
                    productName
                )
            ) {

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

- Keep titles natural.
- Use product name accurately.
- Brand only if supplied.
- Keywords only when relevant.
- Do not invent specifications.
- Do not invent claims.
- Do not use emojis.
- Avoid repetition.

Return ONLY valid JSON:

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

            if (!titles.length) {

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

            if (
                !cleanString(
                    productName
                )
            ) {

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

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

TASK:

Write ONE factual marketplace-ready product description.

Requirements:

- Use only supplied information.
- Do not invent specifications.
- Do not invent benefits.
- Do not invent certifications.
- Do not make medical claims.
- Do not make guaranteed claims.
- Use keywords naturally.
- Do not mention AI.
- Do not return JSON.
- Return only description text.

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

            if (
                !cleanString(
                    productName
                )
            ) {

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

                highlights: [],

                keywords: []

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
// GENERATE SEO KEYWORDS
// ==========================================================
// SAFE NEW ENDPOINT
// Existing tools are untouched.
// ==========================================================

app.post(
    "/api/generate-seo",
    async (req, res) => {

        try {

            const {
                category,
                productName,
                brand,
                productDetails,
                mainKeyword,
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

            if (
                !cleanString(
                    productName
                )
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }

            if (
                !cleanString(
                    mainKeyword
                )
            ) {

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

You are a professional e-commerce SEO keyword generator.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanString(productName)}

BRAND:
${cleanString(brand) || "Not provided"}

MAIN KEYWORD:
${cleanString(mainKeyword)}

PRODUCT DETAILS:
${cleanString(productDetails) || "Not provided"}

TARGET MARKETPLACE:
${cleanString(marketplace) || "All Marketplaces"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

SEO KEYWORD RULES:

1. Generate 15 relevant SEO keyword phrases.
2. Main keyword must be included.
3. Never repeat the brand twice in one keyword.
4. Never repeat the product name unnecessarily.
5. Never create meaningless word combinations.
6. Never add unsupported product features.
7. Never add unsupported gender.
8. Never add unsupported size.
9. Never add unsupported color.
10. Never add unsupported material.
11. Never add unsupported benefits.
12. Never add unsupported use cases.
13. Never add words such as "best", "premium", "guaranteed" or "No.1".
14. Category can be used only when it makes natural sense.
15. Keywords must sound like real search phrases.
16. Do not generate duplicate or near-duplicate phrases.
17. Do not use emojis.
18. Do not number keywords inside the keyword text.
19. Do not use hashtags.
20. Do not invent synonyms that change the product meaning.

IMPORTANT:

BAD EXAMPLES:

"Test Brand Test Brand Cotton Kurti"
"Test Brand Fashion Test Brand Cotton Kurti"
"Test Brand Test Brand Kurti"

These are NOT allowed.

GOOD STYLE:

"Cotton Kurti"
"Test Brand Cotton Kurti"
"Cotton Kurti Test Brand"
"Test Brand Kurti"

Only create phrases supported by the supplied information.

Return ONLY valid JSON:

{
  "keywords": [
    "keyword 1",
    "keyword 2",
    "keyword 3",
    "keyword 4",
    "keyword 5"
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

            let keywords = [];

            if (
                parsed &&
                Array.isArray(
                    parsed.keywords
                )
            ) {

                keywords =
                    parsed.keywords
                        .map(cleanString)
                        .filter(Boolean);

            }

            // --------------------------------------------------
            // CLEAN KEYWORDS
            // --------------------------------------------------

            keywords =
                keywords
                    .map(
                        keyword =>
                            keyword
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
                                .trim()
                    )
                    .filter(Boolean);


            // --------------------------------------------------
            // REMOVE DUPLICATES
            // --------------------------------------------------

            const unique = [];

            const seen =
                new Set();

            for (
                const keyword
                of keywords
            ) {

                const normalized =
                    keyword
                        .toLowerCase()
                        .replace(
                            /['’]/g,
                            ""
                        )
                        .replace(
                            /[^a-z0-9\s]/g,
                            ""
                        )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();

                if (
                    !normalized ||
                    seen.has(normalized)
                ) {

                    continue;

                }

                seen.add(
                    normalized
                );

                unique.push(
                    keyword
                );

            }


            // --------------------------------------------------
            // MAIN KEYWORD FIRST
            // --------------------------------------------------

            const main =
                cleanString(
                    mainKeyword
                );

            const mainNormalized =
                main
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9\s]/g,
                        ""
                    )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();

            const mainIndex =
                unique.findIndex(
                    keyword =>
                        keyword
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9\s]/g,
                                ""
                            )
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim() ===
                        mainNormalized
                );

            if (mainIndex > 0) {

                const item =
                    unique.splice(
                        mainIndex,
                        1
                    )[0];

                unique.unshift(
                    item
                );

            }


            // --------------------------------------------------
            // ENSURE MAIN KEYWORD
            // --------------------------------------------------

            const hasMain =
                unique.some(
                    keyword =>
                        keyword
                            .toLowerCase()
                            .replace(
                                /[^a-z0-9\s]/g,
                                ""
                            )
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim() ===
                        mainNormalized
                );

            if (!hasMain) {

                unique.unshift(
                    main
                );

            }


            // --------------------------------------------------
            // MAX 20
            // --------------------------------------------------

            const finalKeywords =
                unique.slice(
                    0,
                    20
                );


            if (
                !finalKeywords.length
            ) {

                throw new Error(
                    "Gemini ने कोई valid SEO keywords नहीं दिए।"
                );

            }


            return res.json({

                success: true,

                category:
                    normalizedCategory,

                marketplace:
                    cleanString(
                        marketplace
                    ),

                keywords:
                    finalKeywords

            });

        }
        catch (error) {

            console.error(
                "GENERATE SEO ERROR:",
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

                "POST /api/generate-seo"

            ]

        });

    }
);


// ==========================================================
// GLOBAL ERROR
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
            "VERSION: 12.1"
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
            "SEO ENDPOINT: /api/generate-seo"
        );

        console.log(
            "=================================================="
        );

    }
);
