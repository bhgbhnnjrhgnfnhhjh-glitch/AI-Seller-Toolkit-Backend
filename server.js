// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 12.2
// ==========================================================
//
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// SAFE + STABLE VERSION
//
// Existing tools preserved:
// 1. Generate Title
// 2. Generate Description
// 3. Generate Complete Listing
//
// New/FIXED:
// 4. Generate SEO Keywords
//
// Endpoints:
// GET  /
// GET  /api/status
// GET  /api/categories
// POST /api/generate-title
// POST /api/generate-description
// POST /api/generate-listing
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
        methods: [
            "GET",
            "POST",
            "OPTIONS"
        ],
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

    ai =
        new GoogleGenAI({
            apiKey:
                GEMINI_API_KEY
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

Use only seller-provided facts such as:
product type, gender, fabric, color, size,
pattern, fit, occasion, design, quantity
and other seller-provided details.

Never invent:
fabric, material, color, size, gender,
fit, pattern, occasion, certification,
comfort claims or features.
`,

    "Beauty": `
Focus on beauty, skincare, haircare
and personal-care products.

Use only seller-provided facts.

Never invent:
ingredients, skin benefits, hair benefits,
medical benefits, dermatologist claims,
SPF, certification, fragrance,
quantity or suitability.

Do not make medical claims.
`,

    "Electronics": `
Focus on electronic and technology products.

Use only seller-provided specifications such as:
product type, connectivity, compatibility,
battery, charging, ports, display,
controls and other supplied facts.

Never invent:
battery capacity, range, warranty,
compatibility, water resistance,
certifications or technical specifications.
`,

    "Home & Kitchen": `
Focus on home, kitchen and household products.

Use only supplied information such as:
material, size, capacity, color,
design, usage and quantity.

Never invent:
dimensions, capacity, material,
dishwasher safety, microwave safety,
certifications or other specifications.
`,

    "Shoes": `
Focus on footwear.

Use only supplied facts such as:
shoe type, gender, size, color,
material, design, closure, sole
and intended use.

Never invent:
material, cushioning, sole technology,
water resistance, comfort claims
or size availability.
`,

    "Jewellery": `
Focus on jewellery and fashion accessories.

Use only supplied facts such as:
jewellery type, material, design,
color, stone information, plating
and occasion.

Never invent:
gold purity, gemstone authenticity,
metal type, hallmark, certification
or weight.
`,

    "Toys": `
Focus on toys and children's products.

Use only supplied facts such as:
toy type, material, color, design,
age range if supplied, quantity
and features.

Never invent:
age suitability, safety certification,
educational claims, material
or safety features.
`,

    "Books": `
Focus on books.

Use only supplied facts such as:
book title, author, language, genre,
edition, publisher and other
provided details.

Never invent:
author, publisher, edition,
page count, awards, reviews
or other claims.
`,

    "Pet": `
Focus on pet products.

Use only supplied information such as:
product type, pet type, material,
size, color, quantity and usage.

Never invent:
nutritional, medical, health,
safety or veterinary claims.
`,

    "Sports": `
Focus on sports, fitness and exercise products.

Use only supplied facts such as:
product type, material, size, sport,
color, quantity and supplied features.

Never invent:
performance, medical, fitness
or professional-use claims.
`,

    "Automotive": `
Focus on automotive products and accessories.

Use only seller-provided information such as:
product type, vehicle compatibility
if supplied, material, size, color
and usage.

Never invent:
vehicle compatibility, technical
specifications, durability, safety
or performance claims.
`,

    "Garden": `
Focus on gardening and outdoor products.

Use only supplied facts such as:
tool/product type, material, size,
color, usage and quantity.

Never invent:
plant results, durability,
weather resistance or performance claims.
`,

    "Food": `
Focus on food products.

Use only provided facts such as:
product name, ingredients if supplied,
flavor, quantity, packaging
and seller-provided details.

Never invent:
ingredients, nutritional values,
health benefits, shelf life, expiry,
certification or dietary claims.
`,

    "Gifts": `
Focus on gifts and gifting products.

Use only supplied facts such as:
gift type, material, design,
personalization, occasion, color,
size and quantity.

Never invent:
personalization options, materials,
packaging, certification or features.
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
                item
                    .toLowerCase() ===
                value
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
        typeof value ===
        "string"
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
    catch {}



    // JSON object
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


    // JSON array
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

function getInteractionText(
    interaction
) {

    if (!interaction) {
        return "";
    }


    // ------------------------------------------------------
    // Official output_text
    // ------------------------------------------------------

    if (
        typeof interaction.output_text ===
            "string" &&
        interaction.output_text.trim()
    ) {

        return interaction
            .output_text
            .trim();

    }


    // ------------------------------------------------------
    // Fallback: steps
    // ------------------------------------------------------

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
                        block.type ===
                            "text" &&
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
16. Product के बारे में अनुमान मत लगाओ।
17. केवल नाम देखकर अतिरिक्त features मत जोड़ो।
18. Category देखकर missing specifications मत बनाओ।

`;


// ==========================================================
// HEALTH / ROOT
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI Seller Toolkit Backend",

            version:
                "12.2",

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
                "12.2",

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


            if (
                !normalizedCategory
            ) {

                return res.status(
                    400
                ).json({

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

                return res.status(
                    400
                ).json({

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
- Do not unnecessarily repeat words.
- Do not invent color, size, material or features.
- Do not use "Best", "No.1", "Premium", "Guaranteed"
  unless explicitly supplied by seller.
- Keep each title reasonably concise.

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
                        .map(
                            cleanString
                        )
                        .filter(Boolean);

            }


            // Fallback
            if (
                !titles.length
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


            return res.status(
                500
            ).json({

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


            if (
                !normalizedCategory
            ) {

                return res.status(
                    400
                ).json({

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

                return res.status(
                    400
                ).json({

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

Write ONE factual, clear and marketplace-ready
product description.

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
- Do not mention AI.
- Do not include JSON.
- Do not use markdown code fences.
- Return ONLY description text.

`;


            const description =
                (
                    await callGemini(
                        prompt
                    )
                ).trim();


            if (
                !description
            ) {

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


            return res.status(
                500
            ).json({

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


            if (
                !normalizedCategory
            ) {

                return res.status(
                    400
                ).json({

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

                return res.status(
                    400
                ).json({

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
- If information is missing, leave it out.
- Do not use emojis.
- Do not use fake marketing claims.
- Do not call the product premium unless supplied.
- Do not call the product best or No.1 unless supplied.

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
                typeof parsed ===
                    "object"
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
                            ? parsed
                                .highlights
                                .map(
                                    cleanString
                                )
                                .filter(
                                    Boolean
                                )
                            : [],

                    keywords:
                        Array.isArray(
                            parsed.keywords
                        )
                            ? parsed
                                .keywords
                                .map(
                                    cleanString
                                )
                                .filter(
                                    Boolean
                                )
                            : []

                });

            }


            // ==================================================
            // FALLBACK
            // ==================================================

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


            return res.status(
                500
            ).json({

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
//
// IMPORTANT:
// This endpoint is intentionally separate from
// title / description / listing.
//
// This prevents changes to SEO logic from breaking
// existing tools.
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


            // ==================================================
            // NORMALIZE
            // ==================================================

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

            const cleanDetails =
                cleanString(
                    productDetails
                );

            const cleanMainKeyword =
                cleanString(
                    mainKeyword
                );

            const cleanMarketplace =
                cleanString(
                    marketplace
                );


            // ==================================================
            // VALIDATION
            // ==================================================

            if (
                !normalizedCategory
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    error:
                        "Valid product category is required."

                });

            }


            if (
                !cleanProduct
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    error:
                        "Product Name is required."

                });

            }


            if (
                !cleanMainKeyword
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    error:
                        "Main Keyword is required."

                });

            }


            const categoryRule =
                CATEGORY_RULES[
                    normalizedCategory
                ] || "";


            // ==================================================
            // SEO PROMPT
            // ==================================================

            const seoPrompt = `

You are an expert e-commerce SEO keyword generator.

Your job is to generate useful, relevant,
search-friendly product keywords.

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

TARGET MARKETPLACE:
${cleanMarketplace || "Not provided"}

CATEGORY RULE:
${categoryRule}

${STRICT_RULES}

==========================================================
VERY IMPORTANT SEO RULES
==========================================================

1. Generate keywords ONLY from the information
   actually supplied by the seller.

2. Do NOT invent:
   - material
   - fabric
   - color
   - size
   - gender
   - pattern
   - use case
   - compatibility
   - technical specifications
   - benefits
   - certifications
   - medical claims
   - features

3. The MAIN KEYWORD must be included.

4. The MAIN KEYWORD should appear as the
   first keyword in the final array.

5. Do NOT repeatedly combine the same words.

6. Do NOT create useless combinations such as:

   "Test Brand Fashion Cotton Kurti"
   "Fashion Test Brand Cotton Kurti"
   "Test Brand Fashion Test Brand Cotton Kurti"
   "Test Brand Fashion Cotton Kurti"

   unless such a phrase is genuinely provided
   by the seller as a real product/search phrase.

7. Brand can be used only when provided.

8. Category can be used only when it creates a
   genuinely useful search phrase.

9. Do NOT put the category before every keyword.

10. Do NOT put the brand before every keyword.

11. Avoid keyword stuffing.

12. Avoid repeating the same words with only
    their order changed.

13. Every keyword must have a meaningful
    relationship to the product.

14. Do NOT generate random long-tail keywords.

15. Do NOT use fake intent phrases.

16. Do NOT use:
    best
    top
    premium
    cheapest
    No.1
    guaranteed
    original
    authentic
    waterproof
    durable
    comfortable

    unless these exact facts are supplied
    by the seller.

17. Do not create keywords from assumptions.

18. Do not use unsupported audience terms.

19. Do not use unsupported occasions.

20. Do not use unsupported product benefits.

21. Prefer natural search phrases.

22. Avoid near-duplicate keywords.

23. Do not simply rearrange:
    Brand + Category + Product
    Product + Brand + Category
    Category + Brand + Product

24. At least several keywords should be
    variations of the main keyword that remain
    factually supported.

25. If there is not enough information to create
    20 unique useful keywords, return fewer keywords.
    Never invent information just to reach 20.

==========================================================
KEYWORD QUALITY
==========================================================

Good example:

Input:
Product Name = Cotton Kurti
Main Keyword = Cotton Kurti
Brand = Test Brand
Category = Fashion

Possible useful keywords:

Cotton Kurti
Cotton Kurti for Women
Women's Cotton Kurti

BUT:
"for Women" is allowed ONLY if women/gender
information is actually supplied.

Therefore, if gender is NOT supplied,
do NOT generate "Cotton Kurti for Women".

Instead prefer factual variations such as:

Cotton Kurti
Cotton Kurti Dress
Cotton Kurti Clothing

ONLY if these descriptions are supported by
the seller-provided product information.

==========================================================
FINAL QUALITY CHECK
==========================================================

Before returning the answer:

- Remove duplicates.
- Remove near-duplicates.
- Remove keyword stuffing.
- Remove unsupported claims.
- Remove unsupported attributes.
- Remove unnecessary brand repetition.
- Remove unnecessary category repetition.
- Keep the main keyword first.
- Make every keyword useful.
- Use only seller-provided facts.

==========================================================
OUTPUT
==========================================================

Return ONLY valid JSON.

Exact format:

{
  "keywords": [
    "Main Keyword",
    "Keyword 2",
    "Keyword 3",
    "Keyword 4",
    "Keyword 5"
  ]
}

No markdown.
No explanation.
No code fences.
No numbering.
No extra text.

`;


            // ==================================================
            // CALL GEMINI
            // ==================================================

            const output =
                await callGemini(
                    seoPrompt
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
                            cleanString
                        )
                        .filter(Boolean);

            }


            // ==================================================
            // FALLBACK
            // ==================================================

            if (
                !keywords.length
            ) {

                keywords =
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


            // ==================================================
            // CLEAN KEYWORDS
            // ==================================================

            keywords =
                keywords
                    .map(
                        keyword =>
                            String(
                                keyword
                            )
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
                                .replace(
                                    /\s+/g,
                                    " "
                                )
                                .trim()
                    )
                    .filter(Boolean);


            // ==================================================
            // NORMALIZE FOR DUPLICATE CHECK
            // ==================================================

            function normalizeSEOKeyword(
                text
            ) {

                return String(
                    text || ""
                )
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
                        /\s+/g,
                        " "
                    )
                    .trim();

            }


            // ==================================================
            // REMOVE DUPLICATES
            // ==================================================

            const uniqueKeywords = [];

            const seen =
                new Set();


            for (
                const keyword
                of keywords
            ) {

                const normalized =
                    normalizeSEOKeyword(
                        keyword
                    );


                if (
                    !normalized
                ) {

                    continue;

                }


                if (
                    seen.has(
                        normalized
                    )
                ) {

                    continue;

                }


                seen.add(
                    normalized
                );

                uniqueKeywords.push(
                    keyword
                );

            }


            keywords =
                uniqueKeywords;


            // ==================================================
            // MAIN KEYWORD
            // ==================================================

            const normalizedMain =
                normalizeSEOKeyword(
                    cleanMainKeyword
                );


            // Find exact main keyword
            let mainIndex =
                keywords.findIndex(
                    keyword =>
                        normalizeSEOKeyword(
                            keyword
                        ) ===
                        normalizedMain
                );


            if (
                mainIndex > 0
            ) {

                const mainItem =
                    keywords.splice(
                        mainIndex,
                        1
                    )[0];


                keywords.unshift(
                    mainItem
                );

            }


            // If missing, add it
            mainIndex =
                keywords.findIndex(
                    keyword =>
                        normalizeSEOKeyword(
                            keyword
                        ) ===
                        normalizedMain
                );


            if (
                mainIndex === -1
            ) {

                keywords.unshift(
                    cleanMainKeyword
                );

            }


            // ==================================================
            // FINAL UNIQUE PASS
            // ==================================================

            const finalKeywords = [];

            const finalSeen =
                new Set();


            for (
                const keyword
                of keywords
            ) {

                const normalized =
                    normalizeSEOKeyword(
                        keyword
                    );


                if (
                    !normalized ||
                    finalSeen.has(
                        normalized
                    )
                ) {

                    continue;

                }


                finalSeen.add(
                    normalized
                );


                finalKeywords.push(
                    keyword
                );

            }


            // ==================================================
            // MAX 20
            // ==================================================

            const limitedKeywords =
                finalKeywords.slice(
                    0,
                    20
                );


            if (
                !limitedKeywords.length
            ) {

                throw new Error(
                    "AI ने कोई valid SEO keyword नहीं दिया।"
                );

            }


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.json({

                success: true,

                category:
                    normalizedCategory,

                productName:
                    cleanProduct,

                marketplace:
                    cleanMarketplace,

                keywords:
                    limitedKeywords

            });

        }
        catch (error) {

            console.error(
                "GENERATE SEO ERROR:",
                error
            );


            return res.status(
                500
            ).json({

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

        res.status(
            404
        ).json({

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


        if (
            res.headersSent
        ) {

            return next(
                err
            );

        }


        res.status(
            500
        ).json({

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
            "VERSION: 12.2"
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
            "ENDPOINTS:"
        );

        console.log(
            "GET  /"
        );

        console.log(
            "GET  /api/status"
        );

        console.log(
            "GET  /api/categories"
        );

        console.log(
            "POST /api/generate-title"
        );

        console.log(
            "POST /api/generate-description"
        );

        console.log(
            "POST /api/generate-listing"
        );

        console.log(
            "POST /api/generate-seo"
        );

        console.log(
            "=================================================="
        );

    }
);
