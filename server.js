// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 8
// Gemini Backend
// Title Generator + Complete Listing Generator
// Category Aware
// Strict Factual AI
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

app.use(express.json({
    limit: "2mb"
}));


// ==========================================================
// CONFIG
// ==========================================================

const PORT =
    process.env.PORT || 10000;

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY;

const MODEL =
    process.env.MODEL ||
    "gemini-2.5-flash";


// ==========================================================
// GEMINI
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

const categoryRules = {

    "Fashion": `
Focus on clothing and fashion products.

Use only facts supplied by the seller.

Useful attributes may include:
fabric, color, pattern, size, fit,
sleeve, neckline, occasion, gender,
style and quantity.

Do not invent fabric, size, color,
brand, certification or features.
`,

    "Beauty": `
Focus on beauty and personal-care products.

Useful attributes may include:
product type, skin/hair use,
quantity, fragrance, texture,
key ingredients only if supplied,
and usage information only if supplied.

Never invent medical claims,
ingredients, certification or results.
`,

    "Electronics": `
Focus on electronics and gadgets.

Useful attributes may include:
device type, model, compatibility,
connectivity, battery information,
ports, capacity, color and features.

Never invent specifications,
battery capacity, warranty,
compatibility or certifications.
`,

    "Home & Kitchen": `
Focus on home and kitchen products.

Useful attributes may include:
product type, material, capacity,
size, dimensions, color,
usage and included items.

Never invent dimensions,
material or included accessories.
`,

    "Shoes": `
Focus on footwear.

Useful attributes may include:
shoe type, material, color,
size, sole, closure, occasion
and style.

Never invent size availability,
material or features.
`,

    "Jewellery": `
Focus on jewellery and accessories.

Useful attributes may include:
jewellery type, material,
color, stone if supplied,
design, occasion and size.

Do not claim precious metals,
gemstones, purity or certification
unless supplied.
`,

    "Toys": `
Focus on toys and children's products.

Useful attributes may include:
toy type, recommended age only if supplied,
material, color, educational use,
size and included items.

Never invent age recommendation,
safety certification or material.
`,

    "Books": `
Focus on books.

Useful attributes may include:
title, author, language, genre,
edition, format, publisher and topic
only when supplied.

Never invent author, edition,
publisher or publication details.
`,

    "Pet": `
Focus on pet products.

Useful attributes may include:
product type, pet type, size,
material, flavor only if supplied,
quantity and usage.

Never invent ingredients,
medical benefits or suitability claims.
`,

    "Sports": `
Focus on sports and fitness products.

Useful attributes may include:
sport type, product type,
material, size, dimensions,
color and intended use.

Never invent performance claims,
weight or dimensions.
`,

    "Automotive": `
Focus on automotive products.

Useful attributes may include:
product type, vehicle compatibility
only if supplied, material, size,
model information and use.

Never invent vehicle compatibility
or specifications.
`,

    "Garden": `
Focus on gardening products.

Useful attributes may include:
product type, material, size,
quantity, plant/garden use and color.

Never invent dimensions,
chemical composition or performance claims.
`,

    "Food": `
Focus on food products.

Useful attributes may include:
food type, flavor, quantity,
pack size, ingredients only if supplied,
and dietary information only if supplied.

Never invent ingredients,
nutrition facts, expiry information
or health claims.
`,

    "Gifts": `
Focus on gift products.

Useful attributes may include:
gift type, recipient if supplied,
occasion, material, color,
design and included items.

Never invent included items
or personalization options.
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

        "Fashion & Clothing": "Fashion",
        "Clothing": "Fashion",
        "Beauty & Personal Care": "Beauty",
        "Home and Kitchen": "Home & Kitchen",
        "Home Kitchen": "Home & Kitchen",
        "Footwear": "Shoes",
        "Jewelry": "Jewellery",
        "Pet Supplies": "Pet",
        "Sports & Fitness": "Sports",
        "Garden & Outdoor": "Garden",
        "Automobile": "Automotive",
        "Food & Beverages": "Food"

    };


    if (aliases[value]) {
        value = aliases[value];
    }


    return value;

}


// ==========================================================
// VALIDATE CATEGORY
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
// GEMINI CALL
// ==========================================================

async function generateWithGemini(prompt) {

    if (!ai) {

        throw new Error(
            "Gemini API key is not configured."
        );

    }


    const response =
        await ai.models.generateContent({

            model: MODEL,

            contents: prompt

        });


    if (!response) {

        throw new Error(
            "Gemini returned an empty response."
        );

    }


    let text = "";

    if (
        typeof response.text === "string"
    ) {

        text = response.text;

    } else if (
        response.text &&
        typeof response.text === "function"
    ) {

        text = response.text();

    }


    if (
        !text &&
        response.candidates &&
        response.candidates[0]
    ) {

        const candidate =
            response.candidates[0];

        if (
            candidate.content &&
            candidate.content.parts
        ) {

            text =
                candidate.content.parts
                    .map(part => part.text || "")
                    .join("");

        }

    }


    if (!text) {

        throw new Error(
            "Gemini returned no text."
        );

    }


    return text.trim();

}


// ==========================================================
// JSON CLEANER
// ==========================================================

function extractJSON(text) {

    if (!text) {
        return null;
    }


    let cleaned =
        String(text)
            .trim();


    cleaned =
        cleaned
            .replace(/^```json/i, "")
            .replace(/^```/i, "")
            .replace(/```$/i, "")
            .trim();


    try {

        return JSON.parse(cleaned);

    } catch (error) {

        // Continue below

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

        const jsonText =
            cleaned.substring(
                firstBrace,
                lastBrace + 1
            );

        try {

            return JSON.parse(jsonText);

        } catch (error) {

            return null;

        }

    }


    return null;

}


// ==========================================================
// TITLE GENERATOR
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


            // ----------------------------------------------
            // CATEGORY
            // ----------------------------------------------

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


            // ----------------------------------------------
            // PRODUCT NAME
            // ----------------------------------------------

            if (
                !productName ||
                !String(productName).trim()
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product name is required."

                });

            }


            // ----------------------------------------------
            // SAFE VALUES
            // ----------------------------------------------

            const safeProductName =
                String(productName)
                    .trim()
                    .slice(0, 300);

            const safeBrand =
                String(brand || "")
                    .trim()
                    .slice(0, 200);

            const safeDetails =
                String(productDetails || "")
                    .trim()
                    .slice(0, 2000);

            const safeKeywords =
                String(keywords || "")
                    .trim()
                    .slice(0, 500);


            // ----------------------------------------------
            // CATEGORY RULE
            // ----------------------------------------------

            const rule =
                categoryRules[validCategory] ||
                "";


            // ----------------------------------------------
            // PROMPT
            // ----------------------------------------------

            const prompt = `

You are the Product Title Generator
for an online seller toolkit.

CATEGORY:
${validCategory}

CATEGORY RULES:
${rule}

PRODUCT NAME:
${safeProductName}

BRAND:
${safeBrand || "Not provided"}

PRODUCT DETAILS:
${safeDetails || "Not provided"}

KEYWORDS:
${safeKeywords || "Not provided"}


TASK:

Generate 5 strong product titles.

The titles should be:

- Clear
- Natural
- Marketplace friendly
- SEO friendly
- Easy to understand
- Relevant to the selected category
- Based ONLY on information supplied by the seller


STRICT FACTUAL RULES:

1. Do NOT invent product specifications.

2. Do NOT invent brand names.

3. Do NOT invent colors.

4. Do NOT invent materials.

5. Do NOT invent sizes.

6. Do NOT invent certifications.

7. Do NOT invent warranty.

8. Do NOT invent medical claims.

9. Do NOT invent compatibility.

10. Do NOT add unsupported features.

11. Do NOT use fake promotional claims.

12. Do NOT use misleading superlatives such as:
"Best", "No.1", "Guaranteed",
"100% Original", "Premium" unless
the seller explicitly supplied such information.

13. Keep titles concise.

14. Avoid keyword stuffing.

15. Do not add emojis.

Return ONLY valid JSON.

Required format:

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


            // ----------------------------------------------
            // GEMINI
            // ----------------------------------------------

            const aiText =
                await generateWithGemini(prompt);


            // ----------------------------------------------
            // PARSE
            // ----------------------------------------------

            const parsed =
                extractJSON(aiText);


            if (
                !parsed ||
                !Array.isArray(parsed.titles)
            ) {

                return res.status(500).json({

                    success: false,

                    error:
                        "AI returned an invalid title response."

                });

            }


            // ----------------------------------------------
            // CLEAN TITLES
            // ----------------------------------------------

            const titles =
                parsed.titles
                    .map(title =>
                        String(title || "")
                            .replace(
                                /^["'`]+|["'`]+$/g,
                                ""
                            )
                            .replace(
                                /^\d+[\.\)\-\s]+/,
                                ""
                            )
                            .trim()
                    )
                    .filter(Boolean)
                    .slice(0, 5);


            if (!titles.length) {

                return res.status(500).json({

                    success: false,

                    error:
                        "No valid titles were generated."

                });

            }


            // ----------------------------------------------
            // SUCCESS
            // ----------------------------------------------

            return res.json({

                success: true,

                category:
                    validCategory,

                productName:
                    safeProductName,

                titles

            });


        } catch (error) {

            console.error(
                "GENERATE TITLE ERROR:",
                error
            );


            let message =
                error.message ||
                "Title generation failed.";


            // Friendly API key error

            if (
                message
                    .toLowerCase()
                    .includes("api key")
            ) {

                message =
                    "Gemini API key is missing or invalid.";

            }


            return res.status(500).json({

                success: false,

                error: message

            });

        }

    }
);


// ==========================================================
// COMPLETE LISTING GENERATOR
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


            // ----------------------------------------------
            // CATEGORY
            // ----------------------------------------------

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


            // ----------------------------------------------
            // PRODUCT
            // ----------------------------------------------

            if (
                !productName ||
                !String(productName).trim()
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Product name is required."

                });

            }


            const rule =
                categoryRules[validCategory] ||
                "";


            const prompt = `

You are an expert ecommerce product listing
assistant.

CATEGORY:
${validCategory}

CATEGORY RULES:
${rule}

PRODUCT NAME:
${String(productName).trim()}

BRAND:
${String(brand || "").trim()}

PRODUCT DETAILS:
${String(productDetails || "").trim()}

PRICE:
${String(price || "").trim()}

COLOR:
${String(color || "").trim()}

SIZE:
${String(size || "").trim()}

MATERIAL:
${String(material || "").trim()}

IMAGE DESCRIPTION:
${String(imageDescription || "").trim()}


STRICT FACTUAL POLICY:

Use ONLY information supplied above.

Never invent:

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
- specifications


If information is not provided,
do not make up a value.

Create a marketplace-ready listing.

Return ONLY valid JSON.

Format:

{
  "title": "",
  "description": "",
  "highlights": [],
  "keywords": []
}

Title should be concise and SEO friendly.

Description should clearly explain
the product using only supplied facts.

Highlights should contain factual points only.

Keywords should be relevant and should not
contain unsupported claims.

Do not use emojis in the generated listing.

`;


            const aiText =
                await generateWithGemini(prompt);


            const parsed =
                extractJSON(aiText);


            if (
                !parsed ||
                typeof parsed !== "object"
            ) {

                return res.status(500).json({

                    success: false,

                    error:
                        "AI returned an invalid listing response."

                });

            }


            return res.json({

                success: true,

                category:
                    validCategory,

                listing: {

                    title:
                        String(parsed.title || "").trim(),

                    description:
                        String(
                            parsed.description || ""
                        ).trim(),

                    highlights:
                        Array.isArray(parsed.highlights)
                            ? parsed.highlights
                                .map(x =>
                                    String(x).trim()
                                )
                                .filter(Boolean)
                            : [],

                    keywords:
                        Array.isArray(parsed.keywords)
                            ? parsed.keywords
                                .map(x =>
                                    String(x).trim()
                                )
                                .filter(Boolean)
                            : []

                }

            });


        } catch (error) {

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
// STATUS
// ==========================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            server:
                "online",

            version:
                "8.0",

            model:
                MODEL,

            geminiConfigured:
                Boolean(GEMINI_API_KEY),

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
                "8.0",

            status:
                "online",

            model:
                MODEL,

            geminiConfigured:
                Boolean(GEMINI_API_KEY),

            message:
                "AI Seller Toolkit Backend is running."

        });

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
                req.originalUrl

        });

    }
);


// ==========================================================
// ERROR HANDLER
// ==========================================================

app.use(
    (error, req, res, next) => {

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
            "Version: 8.0"
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
            "Title API:"
        );

        console.log(
            "POST /api/generate-title"
        );

        console.log(
            "Listing API:"
        );

        console.log(
            "POST /api/generate-listing"
        );

        console.log(
            "=================================================="
        );

    }
);
