// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 9
// Gemini 3.6 Flash
// Interactions API
// Title Generator
// Complete Listing Generator
// 14 Categories
// Strict Factual AI
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { GoogleGenAI } = require("@google/genai");


// ==========================================================
// EXPRESS APP
// ==========================================================

const app = express();

app.use(cors());

app.use(
    express.json({
        limit: "2mb"
    })
);


// ==========================================================
// SERVER CONFIG
// ==========================================================

const PORT =
    process.env.PORT || 10000;


// ==========================================================
// GEMINI CONFIG
// ==========================================================

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY;

const MODEL =
    process.env.MODEL ||
    "gemini-3.6-flash";


let ai = null;

if (GEMINI_API_KEY) {

    ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY
    });

}


// ==========================================================
// SUPPORTED CATEGORIES
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
Focus on clothing and fashion products.

Possible factual attributes:
fabric, material, color, pattern, size,
fit, sleeve, neckline, occasion,
style, quantity.

Use ONLY information supplied by seller.

Never invent fabric, size, color,
brand, certification or features.
`,

    "Beauty": `
Focus on beauty and personal-care products.

Possible factual attributes:
product type, skin or hair use,
quantity, fragrance, texture,
ingredients only when supplied.

Never invent ingredients,
medical claims, certifications,
results or guarantees.
`,

    "Electronics": `
Focus on electronic products and gadgets.

Possible factual attributes:
device type, model, connectivity,
compatibility, battery information,
ports, capacity, color and features.

Never invent technical specifications,
battery capacity, warranty,
compatibility or certifications.
`,

    "Home & Kitchen": `
Focus on home and kitchen products.

Possible factual attributes:
product type, material, capacity,
size, dimensions, color, usage,
included items.

Never invent dimensions, capacity,
material or accessories.
`,

    "Shoes": `
Focus on footwear.

Possible factual attributes:
shoe type, material, color, size,
sole, closure, occasion and style.

Never invent available sizes,
material or features.
`,

    "Jewellery": `
Focus on jewellery and accessories.

Possible factual attributes:
jewellery type, material, color,
stone only when supplied, design,
occasion and size.

Never claim gold, silver, diamond,
purity, gemstone or certification
unless explicitly supplied.
`,

    "Toys": `
Focus on toys and children's products.

Possible factual attributes:
toy type, age recommendation only
when supplied, material, color,
educational use, size and included items.

Never invent age recommendation,
safety certification or material.
`,

    "Books": `
Focus on books.

Possible factual attributes:
book title, author, language,
genre, edition, format, publisher,
topic only when supplied.

Never invent author, edition,
publisher or publication details.
`,

    "Pet": `
Focus on pet products.

Possible factual attributes:
product type, pet type, size,
material, quantity, flavor only
when supplied.

Never invent ingredients,
medical benefits or suitability claims.
`,

    "Sports": `
Focus on sports and fitness products.

Possible factual attributes:
sport type, product type, material,
size, dimensions, color and intended use.

Never invent performance claims,
weight or dimensions.
`,

    "Automotive": `
Focus on automotive products.

Possible factual attributes:
product type, vehicle compatibility
only when supplied, material, size,
model information and use.

Never invent vehicle compatibility
or technical specifications.
`,

    "Garden": `
Focus on gardening products.

Possible factual attributes:
product type, material, size,
quantity, garden use and color.

Never invent dimensions,
chemical composition or performance claims.
`,

    "Food": `
Focus on food products.

Possible factual attributes:
food type, flavor, quantity,
pack size, ingredients only when supplied,
dietary information only when supplied.

Never invent ingredients,
nutrition facts, expiry information
or health claims.
`,

    "Gifts": `
Focus on gift products.

Possible factual attributes:
gift type, recipient when supplied,
occasion, material, color, design,
included items.

Never invent included items,
personalization or features.
`

};


// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(category) {

    if (!category) {
        return "";
    }

    let value =
        String(category)
            .trim()
            .replace(
                /^[^\p{L}\p{N}&]+/u,
                ""
            )
            .trim();


    const aliases = {

        "Fashion & Clothing":
            "Fashion",

        "Clothing":
            "Fashion",

        "Beauty & Personal Care":
            "Beauty",

        "Home and Kitchen":
            "Home & Kitchen",

        "Home Kitchen":
            "Home & Kitchen",

        "Footwear":
            "Shoes",

        "Jewelry":
            "Jewellery",

        "Jewellery":
            "Jewellery",

        "Pet Supplies":
            "Pet",

        "Sports & Fitness":
            "Sports",

        "Garden & Outdoor":
            "Garden",

        "Automobile":
            "Automotive",

        "Food & Beverages":
            "Food"

    };


    if (aliases[value]) {

        value =
            aliases[value];

    }


    return value;

}


// ==========================================================
// CATEGORY VALIDATION
// ==========================================================

function validateCategory(category) {

    const normalized =
        normalizeCategory(category);


    if (
        !CATEGORIES.includes(normalized)
    ) {

        return null;

    }


    return normalized;

}


// ==========================================================
// STRING LIMITER
// ==========================================================

function safeString(value, maxLength) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)
        .trim()
        .slice(0, maxLength);

}


// ==========================================================
// GEMINI INTERACTIONS API
// ==========================================================

async function generateWithGemini(
    systemInstruction,
    input
) {

    if (!ai) {

        throw new Error(
            "Gemini API key is not configured."
        );

    }


    try {

        const interaction =
            await ai.interactions.create({

                model: MODEL,

                system_instruction:
                    systemInstruction,

                input: input

            });


        if (!interaction) {

            throw new Error(
                "Gemini returned an empty response."
            );

        }


        let outputText =
            interaction.output_text;


        // --------------------------------------------------
        // Compatibility fallback
        // --------------------------------------------------

        if (
            !outputText &&
            Array.isArray(interaction.outputs)
        ) {

            outputText =
                interaction.outputs
                    .map(output => {

                        if (
                            typeof output === "string"
                        ) {

                            return output;

                        }

                        if (
                            output &&
                            typeof output.text === "string"
                        ) {

                            return output.text;

                        }

                        if (
                            output &&
                            output.content &&
                            Array.isArray(
                                output.content
                            )
                        ) {

                            return output.content
                                .map(part =>
                                    part.text || ""
                                )
                                .join("");

                        }

                        return "";

                    })
                    .join("");

        }


        if (
            !outputText ||
            !String(outputText).trim()
        ) {

            throw new Error(
                "Gemini returned no text."
            );

        }


        return String(outputText)
            .trim();


    } catch (error) {

        console.error(
            "GEMINI INTERACTIONS ERROR:",
            error
        );

        throw error;

    }

}


// ==========================================================
// JSON EXTRACTOR
// ==========================================================

function extractJSON(text) {

    if (!text) {

        return null;

    }


    let cleaned =
        String(text)
            .trim();


    // Remove markdown fences

    cleaned =
        cleaned
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();


    // Direct JSON

    try {

        return JSON.parse(cleaned);

    } catch (error) {

        // Continue
    }


    // Find object

    const firstBrace =
        cleaned.indexOf("{");

    const lastBrace =
        cleaned.lastIndexOf("}");


    if (
        firstBrace !== -1 &&
        lastBrace !== -1 &&
        lastBrace > firstBrace
    ) {

        const jsonText =
            cleaned.substring(
                firstBrace,
                lastBrace + 1
            );


        try {

            return JSON.parse(jsonText);

        } catch (error) {

            console.error(
                "JSON PARSE ERROR:",
                error
            );

        }

    }


    return null;

}


// ==========================================================
// CLEAN TITLE
// ==========================================================

function cleanTitle(title) {

    return String(title || "")
        .replace(/^["'`]+|["'`]+$/g, "")
        .replace(
            /^\d+[\.\)\-\s]+/,
            ""
        )
        .trim();

}


// ==========================================================
// TITLE GENERATOR API
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


            // ------------------------------------------------
            // CATEGORY
            // ------------------------------------------------

            const validCategory =
                validateCategory(category);


            if (!validCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required.",

                    categories:
                        CATEGORIES

                });

            }


            // ------------------------------------------------
            // PRODUCT NAME
            // ------------------------------------------------

            const safeProductName =
                safeString(
                    productName,
                    300
                );


            if (!safeProductName) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product name is required."

                });

            }


            // ------------------------------------------------
            // INPUT DATA
            // ------------------------------------------------

            const safeBrand =
                safeString(
                    brand,
                    200
                );

            const safeDetails =
                safeString(
                    productDetails,
                    2000
                );

            const safeKeywords =
                safeString(
                    keywords,
                    500
                );


            // ------------------------------------------------
            // CATEGORY RULE
            // ------------------------------------------------

            const categoryRule =
                categoryRules[
                    validCategory
                ] || "";


            // ------------------------------------------------
            // SYSTEM INSTRUCTION
            // ------------------------------------------------

            const systemInstruction = `

You are the official AI Product Title Generator
for AI Seller Toolkit.

Your job is to create accurate,
marketplace-friendly product titles.

SELECTED CATEGORY:
${validCategory}

CATEGORY RULES:
${categoryRule}


STRICT FACTUAL POLICY:

Use ONLY information provided by the seller.

NEVER invent:

- brand
- material
- color
- size
- dimensions
- weight
- warranty
- certification
- ingredients
- compatibility
- specifications
- medical claims
- performance claims
- included accessories

NEVER use unsupported claims such as:

- Best
- No.1
- Guaranteed
- 100% Original
- Premium
- Luxury
- Official
- Waterproof
- Long Lasting

unless the seller explicitly provides
that information.

Avoid keyword stuffing.

Do not use emojis.

Do not create misleading titles.

Return ONLY valid JSON.

Required JSON:

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


            // ------------------------------------------------
            // INPUT
            // ------------------------------------------------

            const input = `

Create 5 product titles.

CATEGORY:
${validCategory}

PRODUCT NAME:
${safeProductName}

BRAND:
${safeBrand || "Not provided"}

PRODUCT DETAILS:
${safeDetails || "Not provided"}

KEYWORDS:
${safeKeywords || "Not provided"}


TITLE REQUIREMENTS:

1. Keep titles clear.

2. Keep titles concise.

3. Make them suitable for ecommerce
marketplaces.

4. Use relevant supplied keywords naturally.

5. Do not invent information.

6. Do not use emojis.

7. Do not use fake claims.

8. Do not repeat the same title.

Return only the requested JSON.

`;


            // ------------------------------------------------
            // GEMINI
            // ------------------------------------------------

            const aiText =
                await generateWithGemini(
                    systemInstruction,
                    input
                );


            // ------------------------------------------------
            // PARSE JSON
            // ------------------------------------------------

            const parsed =
                extractJSON(aiText);


            if (
                !parsed ||
                !Array.isArray(parsed.titles)
            ) {

                console.error(
                    "INVALID TITLE RESPONSE:",
                    aiText
                );


                return res.status(500).json({

                    success: false,

                    error:
                        "AI returned an invalid title response."

                });

            }


            // ------------------------------------------------
            // CLEAN TITLES
            // ------------------------------------------------

            const titles =
                parsed.titles
                    .map(cleanTitle)
                    .filter(Boolean)
                    .slice(0, 5);


            if (!titles.length) {

                return res.status(500).json({

                    success: false,

                    error:
                        "No valid titles were generated."

                });

            }


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            return res.json({

                success: true,

                category:
                    validCategory,

                productName:
                    safeProductName,

                titles:

                    titles

            });


        } catch (error) {

            console.error(
                "GENERATE TITLE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    getFriendlyGeminiError(
                        error
                    )

            });

        }

    }
);


// ==========================================================
// COMPLETE LISTING GENERATOR API
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


            // ------------------------------------------------
            // CATEGORY
            // ------------------------------------------------

            const validCategory =
                validateCategory(category);


            if (!validCategory) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Valid product category is required.",

                    categories:
                        CATEGORIES

                });

            }


            // ------------------------------------------------
            // PRODUCT
            // ------------------------------------------------

            const safeProductName =
                safeString(
                    productName,
                    300
                );


            if (!safeProductName) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product name is required."

                });

            }


            // ------------------------------------------------
            // DATA
            // ------------------------------------------------

            const safeDetails =
                safeString(
                    productDetails,
                    3000
                );

            const safeBrand =
                safeString(
                    brand,
                    200
                );

            const safePrice =
                safeString(
                    price,
                    100
                );

            const safeColor =
                safeString(
                    color,
                    200
                );

            const safeSize =
                safeString(
                    size,
                    200
                );

            const safeMaterial =
                safeString(
                    material,
                    300
                );

            const safeImageDescription =
                safeString(
                    imageDescription,
                    2000
                );


            const categoryRule =
                categoryRules[
                    validCategory
                ] || "";


            // ------------------------------------------------
            // SYSTEM INSTRUCTION
            // ------------------------------------------------

            const systemInstruction = `

You are the AI Seller Toolkit
Complete Product Listing Generator.

Create accurate ecommerce listings.

CATEGORY:
${validCategory}

CATEGORY RULES:
${categoryRule}


STRICT FACTUAL POLICY:

Use ONLY seller-provided information.

NEVER invent:

- product specifications
- brand
- material
- color
- size
- dimensions
- weight
- warranty
- certification
- ingredients
- compatibility
- medical benefits
- performance claims
- included accessories
- product contents

If information is missing,
DO NOT guess.

Do not create false information.

Do not use unsupported promotional claims.

Do not use emojis.

Return ONLY valid JSON.

Required format:

{
  "title": "",
  "description": "",
  "highlights": [],
  "keywords": []
}

`;


            // ------------------------------------------------
            // INPUT
            // ------------------------------------------------

            const input = `

Generate a complete product listing.

CATEGORY:
${validCategory}

PRODUCT NAME:
${safeProductName}

BRAND:
${safeBrand || "Not provided"}

PRICE:
${safePrice || "Not provided"}

COLOR:
${safeColor || "Not provided"}

SIZE:
${safeSize || "Not provided"}

MATERIAL:
${safeMaterial || "Not provided"}

PRODUCT DETAILS:
${safeDetails || "Not provided"}

IMAGE DESCRIPTION:
${safeImageDescription || "Not provided"}


REQUIREMENTS:

TITLE:
Create one concise marketplace-friendly title.

DESCRIPTION:
Write a clear factual description.

HIGHLIGHTS:
Create factual bullet points only.

KEYWORDS:
Create relevant SEO keywords based only
on supplied product information.

Do not invent missing information.

Return only JSON.

`;


            // ------------------------------------------------
            // GEMINI
            // ------------------------------------------------

            const aiText =
                await generateWithGemini(
                    systemInstruction,
                    input
                );


            // ------------------------------------------------
            // PARSE
            // ------------------------------------------------

            const parsed =
                extractJSON(aiText);


            if (
                !parsed ||
                typeof parsed !== "object"
            ) {

                console.error(
                    "INVALID LISTING RESPONSE:",
                    aiText
                );


                return res.status(500).json({

                    success: false,

                    error:
                        "AI returned an invalid listing response."

                });

            }


            // ------------------------------------------------
            // CLEAN RESULT
            // ------------------------------------------------

            const listing = {

                title:
                    String(
                        parsed.title || ""
                    ).trim(),

                description:
                    String(
                        parsed.description || ""
                    ).trim(),

                highlights:

                    Array.isArray(
                        parsed.highlights
                    )

                        ?

                        parsed.highlights
                            .map(item =>
                                String(item)
                                    .trim()
                            )
                            .filter(Boolean)

                        :

                        [],

                keywords:

                    Array.isArray(
                        parsed.keywords
                    )

                        ?

                        parsed.keywords
                            .map(item =>
                                String(item)
                                    .trim()
                            )
                            .filter(Boolean)

                        :

                        []

            };


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            return res.json({

                success: true,

                category:
                    validCategory,

                listing:
                    listing

            });


        } catch (error) {

            console.error(
                "GENERATE LISTING ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    getFriendlyGeminiError(
                        error
                    )

            });

        }

    }
);


// ==========================================================
// FRIENDLY GEMINI ERROR
// ==========================================================

function getFriendlyGeminiError(error) {

    const message =
        error &&
        error.message
            ? error.message
            : String(error);


    const lower =
        message.toLowerCase();


    if (
        lower.includes(
            "api key"
        ) ||
        lower.includes(
            "unauthenticated"
        ) ||
        lower.includes(
            "401"
        )
    ) {

        return (
            "Gemini API key is missing or invalid."
        );

    }


    if (
        lower.includes(
            "quota"
        ) ||
        lower.includes(
            "429"
        ) ||
        lower.includes(
            "resource exhausted"
        )
    ) {

        return (
            "Gemini API quota or rate limit reached."
        );

    }


    if (
        lower.includes(
            "not found"
        ) ||
        lower.includes(
            "404"
        )
    ) {

        return (
            "Gemini model is unavailable. " +
            "Check the configured model name."
        );

    }


    if (
        lower.includes(
            "permission"
        ) ||
        lower.includes(
            "403"
        )
    ) {

        return (
            "Gemini API permission denied."
        );

    }


    return message ||
        "Gemini request failed.";

}


// ==========================================================
// STATUS API
// ==========================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            server:
                "online",

            version:
                "9.0",

            model:
                MODEL,

            geminiConfigured:
                Boolean(
                    GEMINI_API_KEY
                ),

            api:
                "Interactions API",

            endpoints: [

                "/api/status",

                "/api/categories",

                "/api/generate-title",

                "/api/generate-listing"

            ]

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

            success: true,

            categories:
                CATEGORIES

        });

    }
);


// ==========================================================
// ROOT API
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI Seller Toolkit Backend",

            version:
                "9.0",

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

            message:
                "AI Seller Toolkit Backend is running."

        });

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
                req.originalUrl

        });

    }
);


// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "SERVER ERROR:",
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
            "Version: 9.0"
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
            "API:",
            "Interactions API"
        );

        console.log(
            "Title API:",
            "POST /api/generate-title"
        );

        console.log(
            "Listing API:",
            "POST /api/generate-listing"
        );

        console.log(
            "=================================================="
        );

    }
);
