// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 12.3
// ==========================================================
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// SAFE + STABLE VERSION
//
// Existing tools preserved:
// GET  /
// GET  /api/status
// GET  /api/categories
// POST /api/generate-title
// POST /api/generate-description
// POST /api/generate-listing
// POST /api/generate-seo
//
// SEO improvements:
// - No repeated brand stuffing
// - No repeated category stuffing
// - No fake attributes
// - No duplicate / near-duplicate keywords
// - Main keyword first
// - Useful keyword variations only
// - Seller facts only
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
    catch {}

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
// SEO HELPERS
// ==========================================================

function normalizeSEOText(text) {

    return cleanString(text)
        .toLowerCase()
        .replace(/[’']/g, "")
        .replace(/[-_/]/g, " ")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

}


function seoTokenSet(text) {

    const normalized =
        normalizeSEOText(text);

    if (!normalized) {
        return new Set();
    }

    return new Set(
        normalized
            .split(" ")
            .filter(
                token =>
                    token.length > 1
            )
    );

}


function seoSimilarity(a, b) {

    const A =
        seoTokenSet(a);

    const B =
        seoTokenSet(b);

    if (!A.size || !B.size) {
        return 0;
    }

    let intersection = 0;

    A.forEach(
        token => {

            if (B.has(token)) {
                intersection++;
            }

        }
    );

    const union =
        new Set([
            ...A,
            ...B
        ]).size;

    if (!union) {
        return 0;
    }

    return intersection / union;

}


function cleanSEOKeyword(value) {

    if (!value) {
        return "";
    }

    let keyword =
        String(value)
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

    return keyword;

}


// ==========================================================
// SAFE SEO KEYWORD FILTER
// ==========================================================

function filterSEOKeywords(
    keywords,
    productName,
    brand,
    category,
    mainKeyword
) {

    const inputKeywords =
        Array.isArray(keywords)
            ? keywords
            : [];

    const output = [];

    const normalizedSeen =
        new Set();

    const mainNormalized =
        normalizeSEOText(
            mainKeyword
        );

    const productNormalized =
        normalizeSEOText(
            productName
        );

    const brandNormalized =
        normalizeSEOText(
            brand
        );

    const categoryNormalized =
        normalizeSEOText(
            category
        );

    for (
        const raw of inputKeywords
    ) {

        const keyword =
            cleanSEOKeyword(raw);

        if (!keyword) {
            continue;
        }

        const normalized =
            normalizeSEOText(keyword);

        if (!normalized) {
            continue;
        }

        // Exact duplicate
        if (
            normalizedSeen.has(
                normalized
            )
        ) {
            continue;
        }

        // Do not allow extremely long keyword stuffing.
        const wordCount =
            normalized.split(" ").length;

        if (wordCount > 8) {
            continue;
        }

        // Prevent obvious repeated-brand stuffing.
        if (brandNormalized) {

            const brandWords =
                brandNormalized.split(" ");

            let brandCount = 0;

            for (
                const word of brandWords
            ) {

                if (
                    word.length > 1 &&
                    normalized.includes(word)
                ) {

                    brandCount++;
                }

            }

            if (
                brandWords.length > 0 &&
                brandCount === brandWords.length
            ) {

                const withoutBrand =
                    normalized
                        .replace(
                            brandNormalized,
                            ""
                        )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();

                // Only allow brand if keyword
                // is genuinely useful and not
                // just "Brand + Product".
                if (
                    withoutBrand ===
                    productNormalized
                ) {

                    if (
                        normalized !==
                        mainNormalized
                    ) {

                        continue;
                    }

                }

            }

        }

        // Prevent obvious repeated category stuffing.
        if (
            categoryNormalized &&
            normalized.includes(
                categoryNormalized
            ) &&
            productNormalized &&
            normalized.includes(
                productNormalized
            )
        ) {

            const categoryPlusProduct =
                (
                    categoryNormalized +
                    " " +
                    productNormalized
                ).replace(
                    /\s+/g,
                    " "
                );

            if (
                normalized ===
                categoryPlusProduct
            ) {

                if (
                    normalized !==
                    mainNormalized
                ) {

                    continue;
                }

            }

        }

        // Near duplicate protection.
        let tooSimilar = false;

        for (
            const existing of output
        ) {

            if (
                seoSimilarity(
                    keyword,
                    existing
                ) >= 0.80
            ) {

                tooSimilar = true;
                break;

            }

        }

        if (tooSimilar) {
            continue;
        }

        normalizedSeen.add(
            normalized
        );

        output.push(
            keyword
        );

        if (
            output.length >= 20
        ) {
            break;
        }

    }

    return output;

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
                "12.3",

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
                "12.3",

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
                !cleanString(productName)
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
- Do not repeat the brand unnecessarily.

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
                !cleanString(productName)
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
                brand,
                productDetails,
                price,
                color,
                size,
                material,
                imageDescription,
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
                !cleanString(productName)
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

You are an expert e-commerce marketplace listing generator.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanString(productName)}

BRAND:
${cleanString(brand) || "Not provided"}

PRODUCT DETAILS:
${cleanString(productDetails) || "Not provided"}

PRICE:
${cleanString(price) || "Not provided"}

COLOR:
${cleanString(color) || "Not provided"}

SIZE:
${cleanString(size) || "Not provided"}

MATERIAL:
${cleanString(material) || "Not provided"}

IMAGE DESCRIPTION:
${cleanString(imageDescription) || "Not provided"}

KEYWORDS:
${cleanString(keywords) || "Not provided"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

TASK:

Create one complete factual marketplace listing.

Return ONLY valid JSON:

{
  "title": "",
  "description": "",
  "highlights": [],
  "seoKeywords": []
}

RULES:

- Use only seller-provided information.
- Never invent missing specifications.
- Never invent benefits.
- Never invent certifications.
- Never invent compatibility.
- Never invent warranty.
- Never invent dimensions.
- Never invent quantity.
- No fake claims.
- No emojis in title.
- Keep output marketplace-friendly.
- SEO keywords must be relevant and factual.

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
                !parsed ||
                typeof parsed !== "object"
            ) {

                throw new Error(
                    "Gemini ने valid listing JSON नहीं दिया।"
                );

            }

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

                seoKeywords:
                    Array.isArray(
                        parsed.seoKeywords
                    )
                        ? parsed.seoKeywords
                            .map(cleanString)
                            .filter(Boolean)
                        : []

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
                    "Listing generation failed."

            });

        }

    }
);


// ==========================================================
// GENERATE SEO KEYWORDS
// FINAL SEO FIX
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

            const cleanProduct =
                cleanString(
                    productName
                );

            const cleanBrand =
                cleanString(
                    brand
                );

            const cleanMainKeyword =
                cleanString(
                    mainKeyword
                );

            const cleanDetails =
                cleanString(
                    productDetails
                );

            const cleanMarketplace =
                cleanString(
                    marketplace
                );


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!normalizedCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required."

                });

            }

            if (!cleanProduct) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }

            if (!cleanMainKeyword) {

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


            // ------------------------------------------------
            // IMPORTANT SEO PROMPT
            // ------------------------------------------------

            const prompt = `

You are a professional e-commerce SEO keyword specialist.

Your job is to create genuinely useful search keywords
for the seller's product.

CATEGORY:
${normalizedCategory}

PRODUCT NAME:
${cleanProduct}

BRAND:
${cleanBrand || "Not provided"}

MAIN KEYWORD:
${cleanMainKeyword}

PRODUCT DETAILS:
${cleanDetails || "Not provided"}

MARKETPLACE:
${cleanMarketplace || "All Marketplaces"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

==========================================================
VERY IMPORTANT SEO RULES
==========================================================

1. The MAIN KEYWORD must be keyword #1.

2. Do NOT simply add the brand to every keyword.

3. Do NOT simply add the category to every keyword.

4. Do NOT repeat the same words with tiny changes.

5. Do NOT create keyword stuffing such as:

   "Test Brand Cotton Kurti"
   "Test Brand Fashion Cotton Kurti"
   "Fashion Test Brand Cotton Kurti"
   "Test Brand Kurti"

   when these are merely repetitive variations.

6. Keywords must represent different useful search intents.

7. Use natural keyword phrases.

8. Use words from the product information when relevant.

9. You MAY use:
   - product type variations
   - natural shopping phrases
   - relevant category phrases
   - relevant marketplace search phrases
   - singular/plural where useful
   - natural word order variations

10. You MUST NOT invent:
   - color
   - fabric
   - size
   - gender
   - pattern
   - style
   - occasion
   - material
   - features
   - benefits
   - quality claims
   - compatibility
   - certification
   - warranty
   - price
   - quantity

11. Avoid generic unrelated keywords.

12. Do not use "best", "premium", "cheap",
    "high quality", "top", "No.1", "guaranteed"
    unless the seller explicitly supplied such wording.

13. Brand should normally appear only once or twice,
    and only when it creates a genuinely useful branded search phrase.

14. Category should not be forced into every keyword.

15. Every keyword must be meaningfully different.

16. Do not create keywords longer than 8 words.

17. Generate up to 20 keywords.

18. Return ONLY valid JSON.

==========================================================

EXAMPLE OF BAD OUTPUT:

[
 "Cotton Kurti",
 "Test Brand Cotton Kurti",
 "Test Brand Fashion Cotton Kurti",
 "Fashion Test Brand Cotton Kurti",
 "Test Brand Kurti"
]

These are mostly repetitive.

==========================================================

EXAMPLE OF BETTER STRUCTURE:

[
 "Cotton Kurti",
 "Cotton Kurti Online",
 "Cotton Kurti Collection",
 "Cotton Kurti Clothing",
 "Cotton Kurti Fashion",
 "Kurti",
 "Cotton Clothing"
]

Only use a keyword if it is factually supported
and genuinely relevant to the supplied product.

==========================================================

Return exactly:

{
  "keywords": [
    "Main Keyword",
    "Keyword 2",
    "Keyword 3",
    "Keyword 4",
    "Keyword 5",
    "Keyword 6",
    "Keyword 7",
    "Keyword 8",
    "Keyword 9",
    "Keyword 10"
  ]
}

`;


            // ------------------------------------------------
            // GEMINI
            // ------------------------------------------------

            const output =
                await callGemini(
                    prompt
                );


            // ------------------------------------------------
            // PARSE
            // ------------------------------------------------

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
                    parsed.keywords;

            }


            // ------------------------------------------------
            // FALLBACK PARSER
            // ------------------------------------------------

            if (!keywords.length) {

                keywords =
                    output
                        .split("\n")
                        .map(
                            line =>
                                cleanSEOKeyword(
                                    line
                                )
                        )
                        .filter(Boolean);

            }


            // ------------------------------------------------
            // CLEAN + FILTER
            // ------------------------------------------------

            keywords =
                filterSEOKeywords(
                    keywords,
                    cleanProduct,
                    cleanBrand,
                    normalizedCategory,
                    cleanMainKeyword
                );


            // ------------------------------------------------
            // MAIN KEYWORD MUST BE FIRST
            // ------------------------------------------------

            const mainNormalized =
                normalizeSEOText(
                    cleanMainKeyword
                );

            const existingMainIndex =
                keywords.findIndex(
                    item =>
                        normalizeSEOText(
                            item
                        ) ===
                        mainNormalized
                );


            if (
                existingMainIndex !== -1
            ) {

                const mainItem =
                    keywords.splice(
                        existingMainIndex,
                        1
                    )[0];

                keywords.unshift(
                    mainItem
                );

            }
            else {

                keywords.unshift(
                    cleanMainKeyword
                );

            }


            // ------------------------------------------------
            // FINAL FILTER
            // ------------------------------------------------

            keywords =
                filterSEOKeywords(
                    keywords,
                    cleanProduct,
                    cleanBrand,
                    normalizedCategory,
                    cleanMainKeyword
                );


            // ------------------------------------------------
            // ENSURE MAIN KEYWORD
            // ------------------------------------------------

            const finalMainExists =
                keywords.some(
                    item =>
                        normalizeSEOText(
                            item
                        ) ===
                        mainNormalized
                );


            if (!finalMainExists) {

                keywords.unshift(
                    cleanMainKeyword
                );

            }


            // ------------------------------------------------
            // LIMIT
            // ------------------------------------------------

            keywords =
                keywords.slice(
                    0,
                    20
                );


            if (!keywords.length) {

                throw new Error(
                    "AI ने कोई valid SEO keyword नहीं दिया।"
                );

            }


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            return res.json({

                success: true,

                category:
                    normalizedCategory,

                productName:
                    cleanProduct,

                marketplace:
                    cleanMarketplace ||
                    "All Marketplaces",

                keywords:
                    keywords

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
// 404 HANDLER
// ==========================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            error:
                "API endpoint not found.",

            path:
                req.path

        });

    }
);


// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "GLOBAL SERVER ERROR:",
            error
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
            "Version: 12.3"
        );

        console.log(
            "Server running on port:",
            PORT
        );

        console.log(
            "Gemini Model:",
            MODEL
        );

        console.log(
            "Gemini API:",
            GEMINI_API_KEY
                ? "CONFIGURED"
                : "NOT CONFIGURED"
        );

        console.log(
            "API: Interactions API"
        );

        console.log(
            "SEO endpoint: /api/generate-seo"
        );

        console.log(
            "=================================================="
        );

    }
);
