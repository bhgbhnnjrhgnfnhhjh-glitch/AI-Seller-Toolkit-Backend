// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 18.0
// ==========================================================
//
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// CATEGORY-AWARE + STRICT FACTUAL AI
//
// FINAL SEO ENGINE
//
// IMPORTANT:
// - Product Name is always the primary keyword
// - SEO is generated from seller-provided facts only
// - No invented gender
// - No invented occasion
// - No invented material
// - No invented color
// - No invented size
// - No invented features
// - No invented compatibility
// - No invented benefits
// - No generic SEO filler
// - No duplicate keywords
// - No product fragments
// - No keyword stuffing
// - Maximum 20 SEO keywords
// - Safe deterministic fallback
//
// ENDPOINTS:
// GET  /
// GET  /api/status
// GET  /api/categories
// POST /api/generate-title
// POST /api/generate-description
// POST /api/generate-listing
// POST /api/generate-seo
//
// ==========================================================


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();


// ==========================================================
// VERSION
// ==========================================================

const VERSION = "18.0";


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
// JSON
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
    process.env.GEMINI_API_KEY || "";

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
// CATEGORY ALIASES
// ==========================================================

const CATEGORY_ALIASES = {

    "fashion": "Fashion",

    "beauty": "Beauty",

    "electronics": "Electronics",

    "home kitchen": "Home & Kitchen",
    "home and kitchen": "Home & Kitchen",
    "home & kitchen": "Home & Kitchen",

    "shoes": "Shoes",
    "shoe": "Shoes",

    "jewellery": "Jewellery",
    "jewelry": "Jewellery",

    "toys": "Toys",
    "toy": "Toys",

    "books": "Books",
    "book": "Books",

    "pet": "Pet",
    "pets": "Pet",

    "sports": "Sports",
    "sport": "Sports",

    "automotive": "Automotive",
    "auto": "Automotive",

    "garden": "Garden",
    "gardening": "Garden",

    "food": "Food",

    "gifts": "Gifts",
    "gift": "Gifts"

};


// ==========================================================
// CATEGORY RULES
// ==========================================================

const CATEGORY_RULES = {

    "Fashion": `
Focus on clothing and fashion products.

Allowed seller facts:
product type, brand, fabric, material,
color, size, pattern, design, fit,
sleeve, neckline, occasion, quantity.

Never invent gender, fabric, color, size,
pattern, fit, occasion or features.
`,

    "Beauty": `
Focus on beauty, skincare, haircare
and personal-care products.

Allowed seller facts:
product type, brand, ingredients,
quantity, fragrance, shade,
skin type, hair type, variant,
texture and seller-provided features.

Never invent ingredients, benefits,
SPF, medical claims, certification,
suitability or treatment results.
`,

    "Electronics": `
Focus on electronics and technology.

Allowed seller facts:
device type, brand, model,
connectivity, compatibility,
battery, storage, RAM, capacity,
ports, power, color and specifications.

Never invent technical specifications,
compatibility, battery capacity,
warranty or certification.
`,

    "Home & Kitchen": `
Focus on home, kitchen and household products.

Allowed seller facts:
product type, material, color,
size, dimensions, capacity,
design, usage, quantity and features.

Never invent dimensions, capacity,
material, safety claims or features.
`,

    "Shoes": `
Focus on footwear.

Allowed seller facts:
shoe type, brand, size, color,
material, design, closure,
sole and seller-provided intended use.

Never invent gender, size, material,
comfort, cushioning, durability
or water resistance.
`,

    "Jewellery": `
Focus on jewellery and fashion accessories.

Allowed seller facts:
jewellery type, material, design,
color, stone information, plating,
size, occasion, quantity and brand.

Never invent purity, hallmark,
weight, gemstone, precious metal
or certification.
`,

    "Toys": `
Focus on toys and children's products.

Allowed seller facts:
toy type, material, color,
design, age range, quantity and features.

Never invent safety certification,
age suitability or educational claims.
`,

    "Books": `
Focus on books.

Allowed seller facts:
book title, author, language,
genre, edition, publisher,
ISBN and seller-provided details.

Never invent page count, awards,
reviews or publisher information.
`,

    "Pet": `
Focus on pet products.

Allowed seller facts:
product type, pet type, material,
size, color, quantity and usage.

Never invent medical, veterinary
or health claims.
`,

    "Sports": `
Focus on sports and fitness products.

Allowed seller facts:
product type, sport, material,
size, color, quantity and features.

Never invent performance,
medical or fitness results.
`,

    "Automotive": `
Focus on automotive products and accessories.

Allowed seller facts:
product type, vehicle compatibility,
brand, model, material, size,
color and usage.

Never invent compatibility,
performance or installation claims.
`,

    "Garden": `
Focus on gardening and outdoor products.

Allowed seller facts:
product type, material, size,
color, usage and quantity.

Never invent plant results,
growth claims or durability claims.
`,

    "Food": `
Focus on food products.

Allowed seller facts:
product name, ingredients,
flavor, quantity, packaging
and seller-provided details.

Never invent nutrition,
health claims, expiry information
or certification.
`,

    "Gifts": `
Focus on gifts and gifting products.

Allowed seller facts:
gift type, material, design,
personalization, occasion,
color, size and quantity.

Never invent packaging,
personalization options
or occasion.
`

};


// ==========================================================
// STRICT RULES
// ==========================================================

const STRICT_RULES = `

STRICT FACTUAL RULES:

1. Use ONLY information supplied by the seller.
2. Never invent missing information.
3. Never invent product specifications.
4. Never invent benefits.
5. Never invent certifications.
6. Never invent reviews or ratings.
7. Never make unsupported medical claims.
8. Never make unsupported technical claims.
9. Never invent dimensions.
10. Never invent compatibility.
11. Never invent warranty.
12. Never invent material.
13. Never invent quantity.
14. Never invent color, size, gender, model,
   age, pattern, feature or occasion.
15. Never use unsupported claims such as:
   Best, No.1, Premium, Guaranteed, 100%.
16. Missing information must remain missing.
17. Do not change the meaning of seller facts.
18. Keep marketplace-friendly factual language.
19. SEO keywords must also use only seller facts.
20. Do not create imaginary attributes.
21. Do not create generic filler keywords.
22. Do not repeat the same keyword with tiny changes.
23. Do not use product fragments as keywords.
24. Do not add buying intent words unless
   explicitly supplied by the seller.
25. Do not add gender unless explicitly supplied.
26. Do not add occasion unless explicitly supplied.
27. Do not add usage unless explicitly supplied.
28. Do not add marketplace names as product facts.
29. Product Name must remain the primary keyword.
30. Never force 20 keywords by inventing facts.

`;


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

    return String(value)
        .trim()
        .replace(/\s+/g, " ");

}


// ==========================================================
// SAFE TEXT
// ==========================================================

function cleanText(value) {

    return cleanString(value)
        .replace(/[<>]/g, "");

}


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

    value =
        value
            .replace(
                /👗|💄|📱|🏠|👟|💍|🧸|📚|🐶|🏋️|🚗|🌱|🍎|🎁/gu,
                ""
            )
            .trim();

    if (
        CATEGORY_ALIASES[value]
    ) {

        return CATEGORY_ALIASES[value];

    }

    const found =
        CATEGORIES.find(
            item =>
                item.toLowerCase() === value
        );

    return found || "";

}


// ==========================================================
// SAFE JSON PARSER
// ==========================================================

function safeJsonParse(text) {

    if (!text) {
        return null;
    }

    let cleaned =
        String(text)
            .trim();

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
        // continue
    }

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
            // continue
        }

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
        catch (error) {
            // continue
        }

    }

    return null;

}


// ==========================================================
// GEMINI RESPONSE TEXT
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
        Array.isArray(interaction.output)
    ) {

        const textParts = [];

        for (
            const item of interaction.output
        ) {

            if (!item) {
                continue;
            }

            if (
                typeof item.text === "string"
            ) {

                textParts.push(
                    item.text
                );

            }

            if (
                Array.isArray(item.content)
            ) {

                for (
                    const block of item.content
                ) {

                    if (
                        block &&
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

    if (
        Array.isArray(interaction.steps)
    ) {

        const textParts = [];

        for (
            const step of interaction.steps
        ) {

            if (
                !step ||
                !Array.isArray(step.content)
            ) {

                continue;

            }

            for (
                const block of step.content
            ) {

                if (
                    block &&
                    typeof block.text === "string"
                ) {

                    textParts.push(
                        block.text
                    );

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
// GEMINI CALL
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
            "Gemini ने कोई usable response नहीं दिया।"
        );

    }

    return text;

}


// ==========================================================
// SEO NORMALIZATION
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


// ==========================================================
// SEO TOKEN SET
// ==========================================================

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


// ==========================================================
// SEO SIMILARITY
// ==========================================================

function seoSimilarity(a, b) {

    const A =
        seoTokenSet(a);

    const B =
        seoTokenSet(b);

    if (
        !A.size ||
        !B.size
    ) {

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

    return (
        intersection /
        union
    );

}


// ==========================================================
// CLEAN SEO KEYWORD
// ==========================================================

function cleanSEOKeyword(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .trim()
        .replace(
            /^\s*\d+[\.\)\-:]\s*/,
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

}


// ==========================================================
// SEO FILLER WORDS
// ==========================================================

const SEO_FILLER_WORDS =
    new Set([

        "online",
        "collection",
        "store",
        "fashion",
        "apparel",
        "wear",
        "shopping",
        "buy",
        "shop",
        "best",
        "premium",
        "trendy",
        "stylish",
        "latest",
        "new",
        "beautiful",
        "quality",
        "sale",
        "offer",
        "offers",
        "deal",
        "deals",
        "price",
        "cheap",
        "wholesale",
        "original",
        "popular",
        "exclusive",
        "top",
        "catalog",
        "product",
        "products"

    ]);


// ==========================================================
// NON-FACTUAL WORDS
// ==========================================================

const SEO_UNSUPPORTED_WORDS =
    new Set([

        "women",
        "woman",
        "men",
        "man",
        "girls",
        "girl",
        "boys",
        "boy",

        "daily",
        "casual",
        "party",
        "wedding",
        "festive",
        "office",
        "summer",
        "winter",

        "comfortable",
        "comfort",
        "durable",
        "premium",
        "luxury",

        "waterproof",
        "waterproofing",
        "washable",

        "lightweight",
        "heavy",
        "soft",

        "skin",
        "hair",

        "healthy",
        "health",
        "organic",

        "compatible",
        "wireless",
        "bluetooth",

        "fast",
        "powerful",

        "guaranteed",
        "guarantee",
        "number",
        "one"

    ]);


// ==========================================================
// PRODUCT FRAGMENT
// ==========================================================

function isProductFragment(
    keyword,
    productName
) {

    const keywordTokens =
        seoTokenSet(
            keyword
        );

    const productTokens =
        seoTokenSet(
            productName
        );

    if (
        !keywordTokens.size ||
        !productTokens.size
    ) {

        return false;

    }

    if (
        normalizeSEOText(keyword) ===
        normalizeSEOText(productName)
    ) {

        return false;

    }

    if (
        keywordTokens.size === 1 &&
        productTokens.size > 1
    ) {

        for (
            const token of keywordTokens
        ) {

            if (
                productTokens.has(token)
            ) {

                return true;

            }

        }

    }

    return false;

}


// ==========================================================
// EFFECTIVE BRAND
// ==========================================================

function cleanEffectiveBrand(
    brand,
    productName
) {

    const b =
        normalizeSEOText(
            brand
        );

    const p =
        normalizeSEOText(
            productName
        );

    if (!b) {
        return "";
    }

    if (
        p &&
        b.includes(p)
    ) {

        return b
            .replace(
                p,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }

    return b;

}


// ==========================================================
// BRAND STUFFING
// ==========================================================

function isBrandStuffedKeyword(
    keyword,
    brand,
    productName
) {

    const effectiveBrand =
        cleanEffectiveBrand(
            brand,
            productName
        );

    if (!effectiveBrand) {
        return false;
    }

    const brandTokens =
        seoTokenSet(
            effectiveBrand
        );

    const keywordTokens =
        seoTokenSet(
            keyword
        );

    if (
        !brandTokens.size ||
        !keywordTokens.size
    ) {

        return false;

    }

    let count = 0;

    brandTokens.forEach(
        token => {

            if (
                keywordTokens.has(token)
            ) {

                count++;

            }

        }
    );

    return (
        count === brandTokens.size
    );

}


// ==========================================================
// UNSUPPORTED WORD CHECK
// ==========================================================

function containsUnsupportedSEOWord(
    keyword
) {

    const tokens =
        seoTokenSet(
            keyword
        );

    for (
        const token of tokens
    ) {

        if (
            SEO_UNSUPPORTED_WORDS.has(
                token
            )
        ) {

            return true;

        }

    }

    return false;

}


// ==========================================================
// FILLER CHECK
// ==========================================================

function isMostlyFillerKeyword(
    keyword,
    productName,
    mainKeyword
) {

    const normalized =
        normalizeSEOText(
            keyword
        );

    if (!normalized) {
        return true;
    }

    const main =
        normalizeSEOText(
            mainKeyword
        );

    if (
        normalized === main
    ) {

        return false;

    }

    const productTokens =
        seoTokenSet(
            productName
        );

    const tokens =
        normalized
            .split(" ")
            .filter(Boolean);

    if (!tokens.length) {
        return true;
    }

    const meaningful =
        tokens.filter(
            token =>
                !SEO_FILLER_WORDS.has(
                    token
                )
        );

    if (!meaningful.length) {
        return true;
    }

    const extraWords =
        tokens.filter(
            token =>
                !productTokens.has(
                    token
                )
        );

    if (
        extraWords.length > 0 &&
        extraWords.every(
            token =>
                SEO_FILLER_WORDS.has(
                    token
                )
        )
    ) {

        return true;

    }

    return false;

}


// ==========================================================
// MAIN KEYWORD SAFETY
// ==========================================================

function sanitizeMainKeyword(
    mainKeyword,
    productName
) {

    const product =
        cleanSEOKeyword(
            productName
        );

    const supplied =
        cleanSEOKeyword(
            mainKeyword
        );

    if (!product) {
        return "";
    }

    if (!supplied) {
        return product;
    }

    const normalizedSupplied =
        normalizeSEOText(
            supplied
        );

    const normalizedProduct =
        normalizeSEOText(
            product
        );

    if (
        normalizedSupplied ===
        normalizedProduct
    ) {

        return product;

    }

    const productTokens =
        seoTokenSet(
            product
        );

    const suppliedTokens =
        seoTokenSet(
            supplied
        );

    if (
        suppliedTokens.size <
        productTokens.size
    ) {

        return product;

    }

    let containsAllProductTokens =
        true;

    productTokens.forEach(
        token => {

            if (
                !suppliedTokens.has(
                    token
                )
            ) {

                containsAllProductTokens =
                    false;

            }

        }
    );

    if (
        !containsAllProductTokens
    ) {

        return product;

    }

    return supplied;

}


// ==========================================================
// FACT VALUE NORMALIZER
// ==========================================================

function normalizeFactValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    if (
        typeof value === "object"
    ) {

        try {

            return JSON.stringify(
                value
            );

        }
        catch (error) {

            return "";

        }

    }

    return cleanText(value);

}


// ==========================================================
// COLLECT SELLER FACTS
// ==========================================================

function collectSellerFacts(body) {

    const facts = [];

    const addFact =
        (label, value) => {

            const cleaned =
                normalizeFactValue(
                    value
                );

            if (
                !cleaned ||
                cleaned === "Not provided"
            ) {

                return;

            }

            facts.push({
                label,
                value: cleaned
            });

        };


    addFact(
        "Product Name",
        body.productName
    );

    addFact(
        "Brand",
        body.brand
    );

    addFact(
        "Material",
        body.material
    );

    addFact(
        "Fabric",
        body.fabric
    );

    addFact(
        "Color",
        body.color
    );

    addFact(
        "Size",
        body.size
    );

    addFact(
        "Pattern",
        body.pattern
    );

    addFact(
        "Design",
        body.design
    );

    addFact(
        "Fit",
        body.fit
    );

    addFact(
        "Occasion",
        body.occasion
    );

    addFact(
        "Quantity",
        body.quantity
    );

    addFact(
        "Model",
        body.model
    );

    addFact(
        "Connectivity",
        body.connectivity
    );

    addFact(
        "Compatibility",
        body.compatibility
    );

    addFact(
        "Capacity",
        body.capacity
    );

    addFact(
        "Battery",
        body.battery
    );

    addFact(
        "Storage",
        body.storage
    );

    addFact(
        "RAM",
        body.ram
    );

    addFact(
        "Ingredients",
        body.ingredients
    );

    addFact(
        "Fragrance",
        body.fragrance
    );

    addFact(
        "Shade",
        body.shade
    );

    addFact(
        "Skin Type",
        body.skinType
    );

    addFact(
        "Hair Type",
        body.hairType
    );

    addFact(
        "Author",
        body.author
    );

    addFact(
        "Language",
        body.language
    );

    addFact(
        "Genre",
        body.genre
    );

    addFact(
        "Edition",
        body.edition
    );

    addFact(
        "Publisher",
        body.publisher
    );

    addFact(
        "ISBN",
        body.isbn
    );

    addFact(
        "Pet Type",
        body.petType
    );

    addFact(
        "Sport",
        body.sport
    );

    addFact(
        "Vehicle Compatibility",
        body.vehicleCompatibility
    );

    addFact(
        "Sole",
        body.sole
    );

    addFact(
        "Closure",
        body.closure
    );

    addFact(
        "Stone",
        body.stone
    );

    addFact(
        "Plating",
        body.plating
    );

    addFact(
        "Age Range",
        body.ageRange
    );

    addFact(
        "Flavor",
        body.flavor
    );

    addFact(
        "Usage",
        body.usage
    );

    addFact(
        "Features",
        body.features
    );

    addFact(
        "Product Features",
        body.productFeatures
    );

    addFact(
        "Product Details",
        body.productDetails
    );

    addFact(
        "Extra Information",
        body.extraInfo
    );

    addFact(
        "Important Keywords",
        body.keyword
    );

    addFact(
        "Main Keyword",
        body.mainKeyword
    );


    // ======================================================
    // CATEGORY DATA
    // ======================================================

    if (
        body.categoryData &&
        typeof body.categoryData === "object"
    ) {

        Object.entries(
            body.categoryData
        ).forEach(
            ([key, value]) => {

                addFact(
                    key,
                    value
                );

            }
        );

    }


    return facts;

}


// ==========================================================
// FACT TEXT
// ==========================================================

function buildFactsText(facts) {

    if (!facts.length) {

        return "No seller facts provided.";

    }

    return facts
        .map(
            fact =>
                `${fact.label}: ${fact.value}`
        )
        .join("\n");

}


// ==========================================================
// FACT VALUES
// ==========================================================

function getUsefulFactValues(
    body,
    productName
) {

    const values = [];

    const add =
        value => {

            const cleaned =
                cleanSEOKeyword(
                    value
                );

            if (!cleaned) {
                return;
            }

            if (
                normalizeSEOText(cleaned) ===
                normalizeSEOText(productName)
            ) {

                return;

            }

            values.push(cleaned);

        };


    add(body.brand);
    add(body.material);
    add(body.fabric);
    add(body.color);
    add(body.size);
    add(body.pattern);
    add(body.design);
    add(body.fit);
    add(body.occasion);
    add(body.quantity);
    add(body.model);
    add(body.connectivity);
    add(body.compatibility);
    add(body.capacity);
    add(body.battery);
    add(body.storage);
    add(body.ram);
    add(body.ingredients);
    add(body.fragrance);
    add(body.shade);
    add(body.skinType);
    add(body.hairType);
    add(body.author);
    add(body.language);
    add(body.genre);
    add(body.edition);
    add(body.publisher);
    add(body.isbn);
    add(body.petType);
    add(body.sport);
    add(body.vehicleCompatibility);
    add(body.sole);
    add(body.closure);
    add(body.stone);
    add(body.plating);
    add(body.ageRange);
    add(body.flavor);
    add(body.usage);
    add(body.features);
    add(body.productFeatures);

    if (
        body.categoryData &&
        typeof body.categoryData === "object"
    ) {

        Object.values(
            body.categoryData
        ).forEach(
            value =>
                add(value)
        );

    }


    return [
        ...new Map(
            values.map(
                value => [
                    normalizeSEOText(value),
                    value
                ]
            )
        ).values()
    ];

}


// ==========================================================
// SAFE FACTUAL KEYWORD BUILDER
// ==========================================================

function buildFactualSEOKeywords(
    body,
    mainKeyword
) {

    const productName =
        cleanSEOKeyword(
            body.productName
        );

    if (!productName) {
        return [];
    }


    const keywords = [];

    const addKeyword =
        value => {

            const keyword =
                cleanSEOKeyword(
                    value
                );

            if (!keyword) {
                return;
            }

            keywords.push(
                keyword
            );

        };


    // ======================================================
    // PRIMARY
    // ======================================================

    addKeyword(
        mainKeyword ||
        productName
    );


    // ======================================================
    // EXACT PRODUCT NAME
    // ======================================================

    addKeyword(
        productName
    );


    // ======================================================
    // SELLER FACTS
    // ======================================================

    const facts =
        getUsefulFactValues(
            body,
            productName
        );


    // ======================================================
    // FACT + PRODUCT
    // ======================================================

    for (
        const fact of facts
    ) {

        addKeyword(
            `${fact} ${productName}`
        );

        if (
            keywords.length >= 20
        ) {

            break;

        }

    }


    // ======================================================
    // PRODUCT + FACT
    // ======================================================

    if (
        keywords.length < 20
    ) {

        for (
            const fact of facts
        ) {

            addKeyword(
                `${productName} ${fact}`
            );

            if (
                keywords.length >= 20
            ) {

                break;

            }

        }

    }


    // ======================================================
    // FACT + FACT + PRODUCT
    // ======================================================

    if (
        keywords.length < 20
    ) {

        for (
            let i = 0;
            i < facts.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < facts.length;
                j++
            ) {

                addKeyword(
                    `${facts[i]} ${facts[j]} ${productName}`
                );

                if (
                    keywords.length >= 20
                ) {

                    break;

                }

            }

            if (
                keywords.length >= 20
            ) {

                break;

            }

        }

    }


    return keywords;

}


// ==========================================================
// SEO KEYWORD VALIDATION
// ==========================================================

function isValidSEOKeyword(
    keyword,
    body,
    mainKeyword
) {

    const productName =
        cleanSEOKeyword(
            body.productName
        );

    const cleaned =
        cleanSEOKeyword(
            keyword
        );

    if (!cleaned) {
        return false;
    }

    if (
        cleaned.length < 2
    ) {

        return false;

    }

    const normalized =
        normalizeSEOText(
            cleaned
        );

    if (!normalized) {
        return false;
    }


    // ------------------------------------------------------
    // Product fragment
    // ------------------------------------------------------

    if (
        isProductFragment(
            cleaned,
            productName
        )
    ) {

        return false;

    }


    // ------------------------------------------------------
    // Unsupported generic words
    // ------------------------------------------------------

    if (
        containsUnsupportedSEOWord(
            cleaned
        )
    ) {

        return false;

    }


    // ------------------------------------------------------
    // Mostly filler
    // ------------------------------------------------------

    if (
        isMostlyFillerKeyword(
            cleaned,
            productName,
            mainKeyword
        )
    ) {

        return false;

    }


    // ------------------------------------------------------
    // Brand stuffing protection
    //
    // Brand + product is allowed only once as a
    // factual combination.
    // ------------------------------------------------------

    const brand =
        cleanText(
            body.brand
        );

    if (
        brand &&
        isBrandStuffedKeyword(
            cleaned,
            brand,
            productName
        )
    ) {

        const brandNormalized =
            normalizeSEOText(
                brand
            );

        const productNormalized =
            normalizeSEOText(
                productName
            );

        const keywordNormalized =
            normalizeSEOText(
                cleaned
            );

        const expected1 =
            `${brandNormalized} ${productNormalized}`;

        const expected2 =
            `${productNormalized} ${brandNormalized}`;

        if (
            keywordNormalized !== expected1 &&
            keywordNormalized !== expected2
        ) {

            return false;

        }

    }


    // ------------------------------------------------------
    // Must contain product for generated SEO keywords
    // ------------------------------------------------------

    const productTokens =
        seoTokenSet(
            productName
        );

    const keywordTokens =
        seoTokenSet(
            cleaned
        );

    let productTokenCount = 0;

    productTokens.forEach(
        token => {

            if (
                keywordTokens.has(
                    token
                )
            ) {

                productTokenCount++;

            }

        }
    );


    if (
        productTokens.size > 0 &&
        productTokenCount === 0
    ) {

        return false;

    }


    return true;

}


// ==========================================================
// FILTER SEO KEYWORDS
// ==========================================================

function filterSEOKeywords(
    keywords,
    body,
    mainKeyword
) {

    const result = [];

    const seen =
        new Set();


    for (
        const raw of keywords
    ) {

        const keyword =
            cleanSEOKeyword(
                raw
            );

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


        if (
            !isValidSEOKeyword(
                keyword,
                body,
                mainKeyword
            )
        ) {

            continue;

        }


        let tooSimilar = false;

        for (
            const existing of result
        ) {

            if (
                seoSimilarity(
                    keyword,
                    existing
                ) >= 0.95
            ) {

                tooSimilar = true;

                break;

            }

        }


        if (
            tooSimilar
        ) {

            continue;

        }


        seen.add(
            normalized
        );

        result.push(
            keyword
        );


        if (
            result.length >= 20
        ) {

            break;

        }

    }


    return result;

}


// ==========================================================
// PARSE AI SEO RESPONSE
// ==========================================================

function extractAIKeywords(
    parsed
) {

    if (!parsed) {
        return [];
    }


    if (
        Array.isArray(parsed)
    ) {

        return parsed;

    }


    const possibleKeys = [

        "keywords",
        "seoKeywords",
        "seo_keywords",
        "keywordList",
        "keyword_list",
        "results"

    ];


    for (
        const key of possibleKeys
    ) {

        if (
            Array.isArray(
                parsed[key]
            )
        ) {

            return parsed[key];

        }

    }


    if (
        parsed.result &&
        typeof parsed.result === "object"
    ) {

        return extractAIKeywords(
            parsed.result
        );

    }


    if (
        parsed.data &&
        typeof parsed.data === "object"
    ) {

        return extractAIKeywords(
            parsed.data
        );

    }


    return [];

}


// ==========================================================
// GENERATE SEO
// ==========================================================

async function handleGenerateSEO(
    req,
    res
) {

    const body =
        req.body || {};


    const category =
        normalizeCategory(
            body.category
        );


    const productName =
        cleanSEOKeyword(
            body.productName
        );


    if (!category) {

        return res.status(400).json({

            success: false,

            error:
                "Product category is required."

        });

    }


    if (!productName) {

        return res.status(400).json({

            success: false,

            error:
                "Product name is required."

        });

    }


    const mainKeyword =
        sanitizeMainKeyword(
            body.mainKeyword ||
            body.keyword ||
            productName,
            productName
        );


    const facts =
        collectSellerFacts(
            body
        );


    const factsText =
        buildFactsText(
            facts
        );


    let aiKeywords = [];


    // ======================================================
    // GEMINI SEO
    // ======================================================

    if (GEMINI_API_KEY) {

        try {

            const prompt = `

You are the SEO keyword engine for AI Seller Toolkit.

CATEGORY:
${category}

CATEGORY RULES:
${CATEGORY_RULES[category] || ""}

SELLER INFORMATION:
${factsText}

PRIMARY PRODUCT NAME:
${productName}

PRIMARY KEYWORD:
${mainKeyword}

${STRICT_RULES}

TASK:

Generate useful, factual SEO keyword phrases.

VERY IMPORTANT:

- Use ONLY seller-provided information.
- Product name must be the first keyword.
- Do not invent attributes.
- Do not invent gender.
- Do not invent occasion.
- Do not invent usage.
- Do not invent benefits.
- Do not invent technical specifications.
- Do not invent compatibility.
- Do not invent material.
- Do not invent color.
- Do not invent size.
- Do not invent quantity.
- Do not use "online".
- Do not use "buy".
- Do not use "shop".
- Do not use "shopping".
- Do not use "best".
- Do not use "premium".
- Do not use "trendy".
- Do not use "stylish".
- Do not use "latest".
- Do not use "cheap".
- Do not use "price".
- Do not use "collection".
- Do not use "store".
- Do not use "apparel".
- Do not use "wear".
- Do not use generic filler words.
- Do not repeat the same keyword.
- Do not output product fragments.
- Do not force 20 keywords.
- If only 3 factual keywords are possible, return 3.
- If only 1 factual keyword is possible, return 1.

GOOD EXAMPLE:

Seller facts:
Product Name: Cotton Kurti
Material: Cotton
Color: Blue
Pattern: Floral
Size: M

Possible keywords:

Cotton Kurti
Cotton Blue Kurti
Blue Cotton Kurti
Floral Cotton Kurti
Blue Floral Cotton Kurti
Cotton Kurti M
Blue Floral Kurti M

BAD EXAMPLES:

Cotton Kurti online
Cotton Kurti buy
Best Cotton Kurti
Stylish Cotton Kurti
Cotton Kurti for women
Cotton Kurti daily wear

Return ONLY valid JSON:

{
  "mainKeyword": "${mainKeyword}",
  "keywords": [
    "${mainKeyword}"
  ]
}

`;


            const aiText =
                await callGemini(
                    prompt
                );


            const parsed =
                safeJsonParse(
                    aiText
                );


            aiKeywords =
                extractAIKeywords(
                    parsed
                );

        }
        catch (error) {

            console.error(
                "SEO Gemini error:",
                error?.message ||
                error
            );

            aiKeywords = [];

        }

    }


    // ======================================================
    // COMBINE AI + DETERMINISTIC
    // ======================================================

    const deterministic =
        buildFactualSEOKeywords(
            body,
            mainKeyword
        );


    const combined = [

        mainKeyword,

        ...aiKeywords,

        ...deterministic

    ];


    // ======================================================
    // FINAL FILTER
    // ======================================================

    let finalKeywords =
        filterSEOKeywords(
            combined,
            body,
            mainKeyword
        );


    // ======================================================
    // GUARANTEE MAIN KEYWORD FIRST
    // ======================================================

    const normalizedMain =
        normalizeSEOText(
            mainKeyword
        );


    finalKeywords =
        finalKeywords.filter(
            keyword =>
                normalizeSEOText(
                    keyword
                ) !== normalizedMain
        );


    finalKeywords = [

        mainKeyword,

        ...finalKeywords

    ];


    // ======================================================
    // MAX 20
    // ======================================================

    finalKeywords =
        finalKeywords.slice(
            0,
            20
        );


    // ======================================================
    // ABSOLUTE SAFE FALLBACK
    // ======================================================

    if (
        !finalKeywords.length
    ) {

        finalKeywords = [
            productName
        ];

    }


    return res.json({

        success: true,

        version: VERSION,

        category,

        mainKeyword,

        keywords:
            finalKeywords,

        seoKeywords:
            finalKeywords,

        text:
            finalKeywords
                .map(
                    (keyword, index) =>
                        `${index + 1}. ${keyword}`
                )
                .join("\n"),

        count:
            finalKeywords.length

    });

}


// ==========================================================
// GENERATE TITLE
// ==========================================================

async function handleGenerateTitle(
    req,
    res
) {

    try {

        const body =
            req.body || {};


        const category =
            normalizeCategory(
                body.category
            );


        const productName =
            cleanText(
                body.productName
            );


        if (!category) {

            return res.status(400).json({

                success: false,

                error:
                    "Product category is required."

            });

        }


        if (!productName) {

            return res.status(400).json({

                success: false,

                error:
                    "Product name is required."

            });

        }


        const facts =
            collectSellerFacts(
                body
            );


        const prompt = `

You are the Product Title Generator
for AI Seller Toolkit.

CATEGORY:
${category}

PRODUCT NAME:
${productName}

SELLER FACTS:
${buildFactsText(facts)}

CATEGORY RULES:
${CATEGORY_RULES[category] || ""}

${STRICT_RULES}

TASK:

Create one clear marketplace-friendly product title.

Rules:

- Use product name.
- Use only supplied seller facts.
- Brand may be used if supplied.
- Material may be used if supplied.
- Color may be used if supplied.
- Size may be used if supplied.
- Model may be used if supplied.
- Do not invent information.
- Do not add gender.
- Do not add occasion.
- Do not add benefits.
- Do not add unsupported features.
- Do not use Best.
- Do not use No.1.
- Do not use Premium.
- Do not use Guaranteed.
- Do not use fake marketing claims.

Return ONLY JSON:

{
  "title": "Product title"
}

`;


        const aiText =
            await callGemini(
                prompt
            );


        const parsed =
            safeJsonParse(
                aiText
            );


        let title =
            "";


        if (
            parsed &&
            typeof parsed.title === "string"
        ) {

            title =
                cleanText(
                    parsed.title
                );

        }


        if (!title) {

            title =
                productName;

        }


        return res.json({

            success: true,

            version: VERSION,

            category,

            title

        });

    }
    catch (error) {

        console.error(
            "TITLE ERROR:",
            error?.message ||
            error
        );


        return res.status(500).json({

            success: false,

            error:
                error?.message ||
                "Title generation failed."

        });

    }

}


// ==========================================================
// GENERATE DESCRIPTION
// ==========================================================

async function handleGenerateDescription(
    req,
    res
) {

    try {

        const body =
            req.body || {};


        const category =
            normalizeCategory(
                body.category
            );


        const productName =
            cleanText(
                body.productName
            );


        if (!category) {

            return res.status(400).json({

                success: false,

                error:
                    "Product category is required."

            });

        }


        if (!productName) {

            return res.status(400).json({

                success: false,

                error:
                    "Product name is required."

            });

        }


        const facts =
            collectSellerFacts(
                body
            );


        const prompt = `

You are the Product Description Generator
for AI Seller Toolkit.

CATEGORY:
${category}

PRODUCT NAME:
${productName}

SELLER FACTS:
${buildFactsText(facts)}

CATEGORY RULES:
${CATEGORY_RULES[category] || ""}

${STRICT_RULES}

TASK:

Write a clear marketplace product description.

Use only seller-provided facts.

Do not invent:
- benefits
- gender
- occasion
- compatibility
- specifications
- dimensions
- material
- color
- size
- warranty
- certification
- health claims

Do not use:
Best
No.1
Premium
Guaranteed
100%

Return ONLY JSON:

{
  "description": "Product description"
}

`;


        const aiText =
            await callGemini(
                prompt
            );


        const parsed =
            safeJsonParse(
                aiText
            );


        let description =
            "";


        if (
            parsed &&
            typeof parsed.description === "string"
        ) {

            description =
                parsed.description
                    .trim();

        }


        if (!description) {

            description =
                `${productName} is a product in the ${category} category.`;

        }


        return res.json({

            success: true,

            version: VERSION,

            category,

            description

        });

    }
    catch (error) {

        console.error(
            "DESCRIPTION ERROR:",
            error?.message ||
            error
        );


        return res.status(500).json({

            success: false,

            error:
                error?.message ||
                "Description generation failed."

        });

    }

}


// ==========================================================
// LISTING HELPERS
// ==========================================================

function normalizeArray(
    value
) {

    if (
        Array.isArray(value)
    ) {

        return value
            .map(
                item =>
                    cleanText(item)
            )
            .filter(Boolean);

    }

    if (
        typeof value === "string"
    ) {

        return value
            .split(
                /[\n,]+/
            )
            .map(
                item =>
                    cleanText(item)
            )
            .filter(Boolean);

    }

    return [];

}


// ==========================================================
// FORMAT LISTING
// ==========================================================

function formatListing(
    listing
) {

    const highlights =
        normalizeArray(
            listing.highlights
        );


    const keywords =
        normalizeArray(
            listing.keywords
        );


    const hashtags =
        normalizeArray(
            listing.hashtags
        );


    return `

TITLE

${listing.title || ""}


DESCRIPTION

${listing.description || ""}


HIGHLIGHTS

${highlights
    .map(
        item =>
            `• ${item}`
    )
    .join("\n")}


KEYWORDS

${keywords.join(", ")}


HASHTAGS

${hashtags.join(" ")}


SEO TITLE

${listing.seoTitle || ""}


SEO DESCRIPTION

${listing.seoDescription || ""}

`.trim();

}


// ==========================================================
// GENERATE LISTING
// ==========================================================

async function handleGenerateListing(
    req,
    res
) {

    try {

        const body =
            req.body || {};


        const category =
            normalizeCategory(
                body.category
            );


        const productName =
            cleanText(
                body.productName
            );


        if (!category) {

            return res.status(400).json({

                success: false,

                error:
                    "Product category is required."

            });

        }


        if (!productName) {

            return res.status(400).json({

                success: false,

                error:
                    "Product name is required."

            });

        }


        const facts =
            collectSellerFacts(
                body
            );


        const prompt = `

You are the Complete Product Listing Generator
for AI Seller Toolkit.

CATEGORY:
${category}

PRODUCT NAME:
${productName}

SELLER FACTS:
${buildFactsText(facts)}

CATEGORY RULES:
${CATEGORY_RULES[category] || ""}

${STRICT_RULES}

Create a complete marketplace product listing.

Required JSON:

{
  "title": "",
  "description": "",
  "highlights": [],
  "keywords": [],
  "hashtags": [],
  "seoTitle": "",
  "seoDescription": ""
}

IMPORTANT:

Use ONLY seller-provided facts.

Never invent:
- gender
- material
- color
- size
- occasion
- compatibility
- dimensions
- capacity
- specifications
- benefits
- warranty
- certification
- medical claims
- performance claims

Do not use:
Best
No.1
Premium
Guaranteed
100%

Keywords must also remain factual.

Return ONLY JSON.

`;


        const aiText =
            await callGemini(
                prompt
            );


        const parsed =
            safeJsonParse(
                aiText
            );


        const listing =
            parsed &&
            typeof parsed === "object"
                ? parsed
                : {};


        const title =
            cleanText(
                listing.title
            ) ||
            productName;


        const description =
            cleanText(
                listing.description
            ) ||
            `${productName} is a product in the ${category} category.`;


        const highlights =
            normalizeArray(
                listing.highlights
            );


        const rawKeywords =
            normalizeArray(
                listing.keywords
            );


        const seoKeywords =
            filterSEOKeywords(
                [
                    productName,
                    ...rawKeywords,
                    ...buildFactualSEOKeywords(
                        body,
                        productName
                    )
                ],
                body,
                productName
            );


        const finalKeywords =
            seoKeywords.length
                ? seoKeywords
                : [productName];


        const hashtags =
            normalizeArray(
                listing.hashtags
            );


        const seoTitle =
            cleanText(
                listing.seoTitle
            ) ||
            title;


        const seoDescription =
            cleanText(
                listing.seoDescription
            ) ||
            description;


        const finalListing = {

            title,

            description,

            highlights,

            keywords:
                finalKeywords,

            hashtags,

            seoTitle,

            seoDescription

        };


        return res.json({

            success: true,

            version: VERSION,

            category,

            listing:
                finalListing,

            title:
                finalListing.title,

            description:
                finalListing.description,

            highlights:
                finalListing.highlights,

            keywords:
                finalListing.keywords,

            hashtags:
                finalListing.hashtags,

            seoTitle:
                finalListing.seoTitle,

            seoDescription:
                finalListing.seoDescription,

            text:
                formatListing(
                    finalListing
                )

        });

    }
    catch (error) {

        console.error(
            "LISTING ERROR:",
            error?.message ||
            error
        );


        return res.status(500).json({

            success: false,

            error:
                error?.message ||
                "Listing generation failed."

        });

    }

}


// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "AI Seller Toolkit Backend is running",

            version:
                VERSION,

            model:
                MODEL,

            geminiConfigured:
                !!GEMINI_API_KEY,

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
// API STATUS
// ==========================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            server:
                "online",

            version:
                VERSION,

            geminiConfigured:
                !!GEMINI_API_KEY,

            model:
                MODEL,

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
// CATEGORY API
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
// ROUTES
// ==========================================================

app.post(
    "/api/generate-title",
    handleGenerateTitle
);


app.post(
    "/api/generate-description",
    handleGenerateDescription
);


app.post(
    "/api/generate-listing",
    handleGenerateListing
);


app.post(
    "/api/generate-seo",
    handleGenerateSEO
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
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "GLOBAL SERVER ERROR:",
            error?.message ||
            error
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );

        }


        res.status(500).json({

            success: false,

            error:
                error?.message ||
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
            "=========================================================="
        );

        console.log(
            "AI SELLER TOOLKIT BACKEND"
        );

        console.log(
            `Version: ${VERSION}`
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Gemini Model: ${MODEL}`
        );

        console.log(
            `Gemini API: ${
                GEMINI_API_KEY
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            }`
        );

        console.log(
            "Endpoints:"
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
            "=========================================================="
        );

    }
);


// ==========================================================
// END OF SERVER.JS — FINAL VERSION 18.0
// ==========================================================
