// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 10.0
// ==========================================================
// Features:
// ✅ Gemini 3.6 Flash
// ✅ Google Interactions API
// ✅ Product Title Generator
// ✅ Product Description Generator
// ✅ Complete Listing Generator
// ✅ 14 Categories
// ✅ Category-aware prompts
// ✅ Strict factual output
// ✅ No invented specifications
// ✅ Existing Title Generator preserved
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

// ==========================================================
// APP CONFIG
// ==========================================================

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.6-flash";

const VERSION = "10.0";

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
// SUPPORTED CATEGORIES
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
Focus on clothing and fashion products.

Examples:
Kurti, Saree, Shirt, T-Shirt, Jeans, Dress, Suit, Top, Jacket,
Ethnic Wear, Western Wear, Kids Clothing.

Use only facts provided by the seller.

Possible factual attributes:
fabric, material, color, size, pattern, fit, sleeve type,
neck type, occasion, gender, quantity.

Do NOT invent fabric, size, color, GSM, care instructions,
country of origin, warranty or certifications.
`,

    "Beauty": `
Focus on beauty and personal-care products.

Examples:
Face Gel, Face Wash, Moisturizer, Shampoo, Conditioner,
Serum, Cream, Soap, Lip Balm.

Use only seller-provided facts.

Do NOT invent:
ingredients, SPF, dermatologically tested claims,
medical claims, skin type, fragrance, quantity,
expiry information or certifications.
`,

    "Electronics": `
Focus on electronic products.

Examples:
Earbuds, Headphones, Speakers, Chargers, Cables,
Smart Watches, Power Banks, Keyboards, Mice.

Only mention specifications explicitly provided by seller.

Do NOT invent:
Bluetooth version, battery capacity, range,
charging time, warranty, compatibility, IP rating,
processor, storage, voltage or technical specifications.
`,

    "Home & Kitchen": `
Focus on household and kitchen products.

Examples:
Water Bottle, Lunch Box, Cookware, Storage Box,
Kitchen Tools, Cleaning Products, Home Decor.

Use only provided facts.

Do NOT invent capacity, dimensions, material,
temperature resistance, dishwasher safety or durability
unless explicitly supplied.
`,

    "Shoes": `
Focus on footwear.

Examples:
Sneakers, Casual Shoes, Sports Shoes, Sandals,
Slippers, Formal Shoes, Boots.

Use only seller-provided information.

Do NOT invent size range, sole material, cushioning,
water resistance, weight, closure type or gender
unless provided.
`,

    "Jewellery": `
Focus on jewellery and fashion accessories.

Examples:
Necklace, Earrings, Bracelet, Ring, Pendant,
Bangles and Jewellery Sets.

Do NOT claim gold, silver, diamond, gemstone,
hallmark, purity or plating unless explicitly provided.
`,

    "Toys": `
Focus on toys and children's play products.

Examples:
Building Blocks, Dolls, Cars, Puzzles, Educational Toys,
Board Games.

Do NOT invent recommended age, safety certifications,
material, number of pieces or educational benefits
unless provided.
`,

    "Books": `
Focus on books.

Use only provided title, author, publisher,
edition, language, genre and other seller facts.

Do NOT invent author, publication year, edition,
page count, ISBN or publisher.
`,

    "Pet": `
Focus on pet products.

Examples:
Pet Bowls, Toys, Beds, Collars, Leashes,
Grooming Products and Pet Accessories.

Do NOT invent pet size compatibility, material,
health benefits, food ingredients or safety claims
unless provided.
`,

    "Sports": `
Focus on sports and fitness products.

Examples:
Yoga Mats, Dumbbells, Resistance Bands,
Sports Accessories, Fitness Equipment.

Do NOT invent weight, dimensions, resistance level,
material, suitability or performance claims
unless provided.
`,

    "Automotive": `
Focus on automotive products and accessories.

Examples:
Car Cleaning Cloths, Car Accessories,
Bike Accessories, Interior Accessories.

Do NOT invent vehicle compatibility, universal fit,
material, durability, safety or performance claims
unless provided.
`,

    "Garden": `
Focus on gardening products.

Examples:
Hand Trowels, Planters, Pots, Garden Tools,
Seeds and Gardening Accessories.

Do NOT invent plant suitability, dimensions,
material, durability or quantity unless provided.
`,

    "Food": `
Focus on food products.

Examples:
Pickles, Snacks, Spices, Dry Fruits,
Packaged Foods and Beverages.

Use only provided food information.

Do NOT invent ingredients, nutritional values,
shelf life, expiry, health benefits, dietary claims,
certifications or net quantity.
`,

    "Gifts": `
Focus on gift products.

Examples:
Gift Boxes, Personalized Gifts, Greeting Items,
Gift Sets and Occasion Gifts.

Do NOT invent personalization options,
included items, occasion suitability,
material or packaging details unless provided.
`
};

// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(category) {

    if (!category) {
        return "";
    }

    let value = String(category)
        .trim()
        .replace(/^.*?Fashion/i, "Fashion");

    const lower = String(category).toLowerCase().trim();

    const map = {
        "fashion": "Fashion",
        "beauty": "Beauty",
        "electronics": "Electronics",
        "home": "Home & Kitchen",
        "home & kitchen": "Home & Kitchen",
        "home and kitchen": "Home & Kitchen",
        "shoes": "Shoes",
        "jewellery": "Jewellery",
        "jewelry": "Jewellery",
        "toys": "Toys",
        "book": "Books",
        "books": "Books",
        "pet": "Pet",
        "sports": "Sports",
        "automotive": "Automotive",
        "garden": "Garden",
        "food": "Food",
        "foods": "Food",
        "gifts": "Gifts",
        "gift": "Gifts"
    };

    return map[lower] || value;
}

// ==========================================================
// SAFE STRING
// ==========================================================

function safeString(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
}

// ==========================================================
// GET AI TEXT
// ==========================================================

function getInteractionText(interaction) {

    if (!interaction) {
        return "";
    }

    // Preferred current SDK property
    if (
        typeof interaction.output_text === "string" &&
        interaction.output_text.trim()
    ) {
        return interaction.output_text.trim();
    }

    // Fallback: inspect steps
    if (Array.isArray(interaction.steps)) {

        for (let i = interaction.steps.length - 1; i >= 0; i--) {

            const step = interaction.steps[i];

            if (
                step &&
                step.type === "model_output" &&
                Array.isArray(step.content)
            ) {

                for (let j = step.content.length - 1; j >= 0; j--) {

                    const block = step.content[j];

                    if (
                        block &&
                        block.type === "text" &&
                        typeof block.text === "string"
                    ) {
                        return block.text.trim();
                    }
                }
            }
        }
    }

    return "";
}

// ==========================================================
// CLEAN JSON TEXT
// ==========================================================

function cleanJsonText(text) {

    if (!text) {
        return "";
    }

    let value = String(text).trim();

    value = value
        .replace(/^```json/i, "")
        .replace(/^```/i, "")
        .replace(/```$/i, "")
        .trim();

    return value;
}

// ==========================================================
// CALL GEMINI INTERACTIONS API
// ==========================================================

async function generateAI(prompt) {

    if (!ai) {
        throw new Error("Gemini API key is not configured.");
    }

    const interaction = await ai.interactions.create({
        model: MODEL,
        input: prompt,
        generation_config: {
            thinking_level: "low"
        }
    });

    const text = getInteractionText(interaction);

    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }

    return text;
}

// ==========================================================
// COMMON FACTUAL RULES
// ==========================================================

const factualRules = `
IMPORTANT SELLER DATA RULES:

1. Use ONLY information supplied by the seller.
2. Never invent product specifications.
3. Never invent measurements.
4. Never invent material.
5. Never invent color.
6. Never invent size.
7. Never invent ingredients.
8. Never invent warranty.
9. Never invent certifications.
10. Never invent health or medical claims.
11. Never invent compatibility.
12. Never invent performance claims.
13. Never add fake discounts.
14. Never add fake prices.
15. Never add fake brand information.
16. Do not repeat the same wording unnecessarily.
17. Keep the language natural and marketplace-friendly.
18. Do not use emojis unless specifically requested.
19. Do not add unsupported claims just to make the listing attractive.
20. If information is missing, simply do not mention it.
`;

// ==========================================================
// HOME / STATUS
// ==========================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        server: "AI Seller Toolkit Backend",
        version: VERSION,
        status: "online",
        model: MODEL,
        api: "Interactions API",
        geminiConfigured: !!GEMINI_API_KEY,
        message: "AI Seller Toolkit Backend is running."
    });

});

// ==========================================================
// STATUS
// ==========================================================

app.get("/api/status", (req, res) => {

    res.json({
        success: true,
        server: "AI Seller Toolkit Backend",
        version: VERSION,
        status: "online",
        model: MODEL,
        api: "Interactions API",
        geminiConfigured: !!GEMINI_API_KEY,
        endpoints: [
            "/api/status",
            "/api/categories",
            "/api/generate-title",
            "/api/generate-description",
            "/api/generate-listing"
        ]
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
// GENERATE TITLES
// ==========================================================

app.post("/api/generate-title", async (req, res) => {

    try {

        const {
            category,
            productName,
            brand,
            productDetails,
            keywords,
            importantKeywords
        } = req.body;

        const normalizedCategory = normalizeCategory(category);

        if (!normalizedCategory) {
            return res.status(400).json({
                success: false,
                error: "Product category is required."
            });
        }

        if (!productName || !safeString(productName)) {
            return res.status(400).json({
                success: false,
                error: "Product name is required."
            });
        }

        if (!categories.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                error: "Invalid product category."
            });
        }

        const keywordValue =
            safeString(importantKeywords) ||
            safeString(keywords);

        const prompt = `
You are an expert ecommerce product title writer.

CATEGORY:
${normalizedCategory}

CATEGORY RULES:
${categoryRules[normalizedCategory]}

PRODUCT NAME:
${safeString(productName)}

BRAND:
${safeString(brand)}

PRODUCT DETAILS:
${safeString(productDetails)}

IMPORTANT KEYWORDS:
${keywordValue}

${factualRules}

TASK:

Generate exactly 5 unique SEO-friendly ecommerce product titles.

Title requirements:
- Clear and natural.
- Marketplace friendly.
- Include the main product name.
- Use brand only when supplied.
- Use keywords naturally.
- Avoid keyword stuffing.
- Do not make unsupported claims.
- Do not invent specifications.
- Keep each title reasonably concise.
- Each title must be different.

Return ONLY valid JSON in this exact format:

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

        const aiText = await generateAI(prompt);

        let parsed;

        try {
            parsed = JSON.parse(cleanJsonText(aiText));
        } catch (error) {

            return res.status(500).json({
                success: false,
                error: "AI returned invalid title data.",
                raw: aiText
            });

        }

        if (
            !parsed ||
            !Array.isArray(parsed.titles)
        ) {

            return res.status(500).json({
                success: false,
                error: "Invalid title response from AI."
            });

        }

        const titles = parsed.titles
            .map(t => safeString(t))
            .filter(Boolean)
            .slice(0, 5);

        return res.json({
            success: true,
            category: normalizedCategory,
            titles
        });

    } catch (error) {

        console.error("GENERATE TITLE ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to generate titles."
        });

    }

});

// ==========================================================
// GENERATE DESCRIPTION
// ==========================================================

app.post("/api/generate-description", async (req, res) => {

    try {

        const {
            category,
            productName,
            brand,
            productDetails,
            keywords,
            importantKeywords,
            price,
            color,
            size,
            material,
            features
        } = req.body;

        const normalizedCategory = normalizeCategory(category);

        if (!normalizedCategory) {
            return res.status(400).json({
                success: false,
                error: "Product category is required."
            });
        }

        if (!categories.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                error: "Invalid product category."
            });
        }

        if (!productName || !safeString(productName)) {
            return res.status(400).json({
                success: false,
                error: "Product name is required."
            });
        }

        const keywordValue =
            safeString(importantKeywords) ||
            safeString(keywords);

        const prompt = `
You are an expert ecommerce product description writer.

CATEGORY:
${normalizedCategory}

CATEGORY-SPECIFIC RULES:
${categoryRules[normalizedCategory]}

PRODUCT NAME:
${safeString(productName)}

BRAND:
${safeString(brand)}

PRODUCT DETAILS:
${safeString(productDetails)}

PRICE:
${safeString(price)}

COLOR:
${safeString(color)}

SIZE:
${safeString(size)}

MATERIAL:
${safeString(material)}

FEATURES:
${safeString(features)}

IMPORTANT KEYWORDS:
${keywordValue}

${factualRules}

TASK:

Create a professional ecommerce product description.

Create:

1. Short description
2. Detailed description
3. Key highlights
4. Product information

IMPORTANT:

- Do not invent missing information.
- Do not make medical claims.
- Do not make certification claims.
- Do not create fake specifications.
- Do not create fake benefits.
- Only use information supplied by the seller.
- Use natural SEO keywords.
- Avoid keyword stuffing.
- Make the description easy to read.
- Keep the description suitable for online marketplaces.

Return ONLY valid JSON in this exact format:

{
  "shortDescription": "Short factual description",
  "description": "Detailed factual product description",
  "highlights": [
    "Highlight 1",
    "Highlight 2",
    "Highlight 3",
    "Highlight 4",
    "Highlight 5"
  ],
  "productInformation": [
    {
      "label": "Brand",
      "value": "..."
    },
    {
      "label": "Product",
      "value": "..."
    }
  ]
}
`;

        const aiText = await generateAI(prompt);

        let parsed;

        try {
            parsed = JSON.parse(cleanJsonText(aiText));
        } catch (error) {

            return res.status(500).json({
                success: false,
                error: "AI returned invalid description data.",
                raw: aiText
            });

        }

        return res.json({
            success: true,
            category: normalizedCategory,
            description: parsed
        });

    } catch (error) {

        console.error("GENERATE DESCRIPTION ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to generate description."
        });

    }

});

// ==========================================================
// GENERATE COMPLETE LISTING
// ==========================================================

app.post("/api/generate-listing", async (req, res) => {

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
            imageDescription,
            keywords,
            importantKeywords,
            features
        } = req.body;

        const normalizedCategory = normalizeCategory(category);

        if (!normalizedCategory) {
            return res.status(400).json({
                success: false,
                error: "Product category is required."
            });
        }

        if (!categories.includes(normalizedCategory)) {
            return res.status(400).json({
                success: false,
                error: "Invalid product category."
            });
        }

        if (!productName || !safeString(productName)) {
            return res.status(400).json({
                success: false,
                error: "Product name is required."
            });
        }

        const keywordValue =
            safeString(importantKeywords) ||
            safeString(keywords);

        const prompt = `
You are an expert ecommerce product listing generator.

CATEGORY:
${normalizedCategory}

CATEGORY RULES:
${categoryRules[normalizedCategory]}

PRODUCT NAME:
${safeString(productName)}

BRAND:
${safeString(brand)}

PRODUCT DETAILS:
${safeString(productDetails)}

PRICE:
${safeString(price)}

COLOR:
${safeString(color)}

SIZE:
${safeString(size)}

MATERIAL:
${safeString(material)}

FEATURES:
${safeString(features)}

IMAGE DESCRIPTION:
${safeString(imageDescription)}

KEYWORDS:
${keywordValue}

${factualRules}

TASK:

Create a complete ecommerce product listing.

Generate:

1. SEO-friendly title
2. Short description
3. Detailed description
4. 5 key highlights
5. 5 SEO keywords
6. Product information

The output must be based ONLY on seller-provided information.

Do not invent missing facts.

Return ONLY valid JSON:

{
  "title": "Product title",
  "shortDescription": "Short description",
  "description": "Detailed description",
  "highlights": [
    "Highlight 1",
    "Highlight 2",
    "Highlight 3",
    "Highlight 4",
    "Highlight 5"
  ],
  "seoKeywords": [
    "keyword 1",
    "keyword 2",
    "keyword 3",
    "keyword 4",
    "keyword 5"
  ],
  "productInformation": [
    {
      "label": "Brand",
      "value": "..."
    },
    {
      "label": "Product",
      "value": "..."
    }
  ]
}
`;

        const aiText = await generateAI(prompt);

        let parsed;

        try {
            parsed = JSON.parse(cleanJsonText(aiText));
        } catch (error) {

            return res.status(500).json({
                success: false,
                error: "AI returned invalid listing data.",
                raw: aiText
            });

        }

        return res.json({
            success: true,
            category: normalizedCategory,
            listing: parsed
        });

    } catch (error) {

        console.error("GENERATE LISTING ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Failed to generate listing."
        });

    }

});

// ==========================================================
// 404 HANDLER
// ==========================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        error: "API endpoint not found.",
        path: req.path,
        availableEndpoints: [
            "/api/status",
            "/api/categories",
            "/api/generate-title",
            "/api/generate-description",
            "/api/generate-listing"
        ]
    });

});

// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use((err, req, res, next) => {

    console.error("SERVER ERROR:", err);

    res.status(500).json({
        success: false,
        error: err.message || "Internal server error."
    });

});

// ==========================================================
// START SERVER
// ==========================================================

app.listen(PORT, () => {

    console.log("==================================================");
    console.log("AI SELLER TOOLKIT BACKEND");
    console.log("Version:", VERSION);
    console.log("Server running on port:", PORT);
    console.log("Gemini Model:", MODEL);
    console.log("Interactions API: ENABLED");
    console.log(
        "Gemini API:",
        GEMINI_API_KEY ? "CONFIGURED" : "NOT CONFIGURED"
    );
    console.log("==================================================");

});
