// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 14.0
// ==========================================================
//
// Gemini Interactions API
// @google/genai >= 2.0.0
//
// CATEGORY-AWARE + STRICT FACTUAL AI
//
// SEO ENGINE:
// - Main Keyword first
// - Product Name fallback
// - Up to 20 keywords
// - Valid fact combinations
// - Brand + Product allowed
// - Duplicate protection
// - Near duplicate protection
// - Filler protection
// - Unsupported attribute protection
// - No invented gender
// - No invented material
// - No invented color
// - No invented size
// - No invented benefits
// - No invented specifications
// - AI failure fallback
//
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

Use only seller-provided facts such as:
product type, brand, fabric/material, color,
size, pattern, fit, sleeve, neckline,
occasion, quantity and supplied attributes.

Never invent gender, fabric, color, size,
pattern, fit, occasion or features.
`,

    "Beauty": `
Focus on beauty, skincare, haircare and personal-care products.

Use only supplied:
product type, brand, ingredients, quantity,
fragrance, shade, skin/hair information
and other seller-provided facts.

Never invent ingredients, benefits, SPF,
medical claims, certification or suitability.
`,

    "Electronics": `
Focus on electronic and technology products.

Use only supplied:
device type, brand, model, connectivity,
compatibility, battery, capacity, ports,
power, color and specifications.

Never invent technical specifications,
compatibility, battery, warranty or certification.
`,

    "Home & Kitchen": `
Focus on home, kitchen and household products.

Use only supplied:
product type, material, color, size,
capacity, design, usage and quantity.

Never invent dimensions, capacity,
material, safety claims or features.
`,

    "Shoes": `
Focus on footwear.

Use only supplied:
shoe type, brand, size, color, material,
design, closure, sole and intended use.

Never invent gender, size, material,
comfort, cushioning or water resistance.
`,

    "Jewellery": `
Focus on jewellery and fashion accessories.

Use only supplied:
jewellery type, material, design, color,
stone information, plating, size,
occasion and quantity.

Never invent purity, hallmark,
certification, weight or gemstone information.
`,

    "Toys": `
Focus on toys and children's products.

Use only supplied:
toy type, material, color, design,
age range, quantity and features.

Never invent safety certification,
age suitability or educational claims.
`,

    "Books": `
Focus on books.

Use only supplied:
book title, author, language, genre,
edition, publisher, ISBN and seller details.

Never invent page count, awards,
reviews or publisher information.
`,

    "Pet": `
Focus on pet products.

Use only supplied:
product type, pet type, material,
size, color, quantity and usage.

Never invent medical,
veterinary or health claims.
`,

    "Sports": `
Focus on sports and fitness products.

Use only supplied:
product type, sport, material,
size, color, quantity and features.

Never invent performance,
medical or fitness results.
`,

    "Automotive": `
Focus on automotive products and accessories.

Use only supplied:
product type, vehicle compatibility,
brand, model, material, size,
color and usage.

Never invent compatibility,
performance or installation claims.
`,

    "Garden": `
Focus on gardening and outdoor products.

Use only supplied:
product type, material, size,
color, usage and quantity.

Never invent plant results,
growth claims or durability claims.
`,

    "Food": `
Focus on food products.

Use only supplied:
product name, ingredients, flavor,
quantity, packaging and seller-provided facts.

Never invent nutrition,
health claims, expiry information
or certification.
`,

    "Gifts": `
Focus on gifts and gifting products.

Use only supplied:
gift type, material, design,
personalization, occasion, color,
size and quantity.

Never invent packaging,
personalization options or occasion.
`

};


// ==========================================================
// STRICT RULES
// ==========================================================

const STRICT_RULES = `

STRICT FACTUAL RULES:

1. केवल seller द्वारा दी गई information का उपयोग करो।

2. Missing information को कभी invent मत करो।

3. Fake specifications मत बनाओ।

4. Fake benefits मत बनाओ।

5. Fake certification मत बनाओ।

6. Fake reviews या ratings मत बनाओ।

7. Unsupported medical claims मत बनाओ।

8. Unsupported technical specifications मत बनाओ।

9. Unsupported dimensions मत बनाओ।

10. Unsupported compatibility मत बनाओ।

11. Unsupported warranty मत बनाओ।

12. Unsupported material मत बनाओ।

13. Unsupported quantity मत बनाओ।

14. Unsupported color, size, gender, model,
age, pattern या feature मत बनाओ।

15. Best, No.1, Premium, Guaranteed,
100%, Original, Trending जैसे claims
तभी इस्तेमाल करो जब seller ने explicitly दिया हो।

16. Missing information को छोड़ दो।

17. Seller facts का meaning मत बदलो।

18. SEO keyword बनाने के लिए नया
product attribute मत जोड़ो।

19. केवल seller facts को combine,
reorder या natural language variation
के रूप में इस्तेमाल किया जा सकता है।

20. Keyword में केवल इसलिए "online",
"buy", "shop", "best", "premium",
"collection" आदि मत जोड़ो क्योंकि
वे SEO words हैं।

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
        .trim();

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

        return JSON.parse(
            cleaned
        );

    }
    catch (error) {

        // Continue

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

            // Continue

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

            // Continue

        }

    }

    return null;
}


// ==========================================================
// GET GEMINI TEXT
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

        return interaction.output_text
            .trim();

    }

    if (
        Array.isArray(
            interaction.output
        )
    ) {

        const textParts = [];

        for (
            const item of
            interaction.output
        ) {

            if (!item) {
                continue;
            }

            if (
                typeof item.text ===
                    "string"
            ) {

                textParts.push(
                    item.text
                );

            }

            if (
                Array.isArray(
                    item.content
                )
            ) {

                for (
                    const block of
                    item.content
                ) {

                    if (
                        block &&
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

    if (
        Array.isArray(
            interaction.steps
        )
    ) {

        const textParts = [];

        for (
            const step of
            interaction.steps
        ) {

            if (
                !step ||
                !Array.isArray(
                    step.content
                )
            ) {

                continue;

            }

            for (
                const block of
                step.content
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
// GEMINI CALL
// ==========================================================

async function callGemini(
    prompt
) {

    if (!GEMINI_API_KEY) {

        throw new Error(
            "GEMINI_API_KEY is not configured."
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
            "Gemini returned empty response."
        );

    }

    return text;
}


// ==========================================================
// SEO NORMALIZATION
// ==========================================================

function normalizeSEOText(
    text
) {

    return cleanString(text)
        .toLowerCase()
        .replace(
            /[’']/g,
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
            /\s+/g,
            " "
        )
        .trim();

}


// ==========================================================
// TOKEN SET
// ==========================================================

function seoTokenSet(
    text
) {

    const normalized =
        normalizeSEOText(
            text
        );

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
// SIMILARITY
// ==========================================================

function seoSimilarity(
    a,
    b
) {

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

            if (
                B.has(token)
            ) {
                intersection++;
            }

        }
    );

    const union =
        new Set([
            ...A,
            ...B
        ]).size;

    return union
        ? intersection / union
        : 0;
}


// ==========================================================
// CLEAN KEYWORD
// ==========================================================

function cleanSEOKeyword(
    value
) {

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
        "deals",
        "price",
        "cheap",
        "wholesale",
        "original",
        "popular",
        "exclusive",
        "top",
        "free",
        "discount"

    ]);


// ==========================================================
// CHECK FILLER
// ==========================================================

function isFillerOnly(
    keyword,
    productName,
    mainKeyword,
    brand
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

    const mainTokens =
        seoTokenSet(
            mainKeyword
        );

    const brandTokens =
        seoTokenSet(
            brand
        );

    const tokens =
        normalized
            .split(" ")
            .filter(Boolean);

    let meaningful = 0;

    for (
        const token of
        tokens
    ) {

        if (
            productTokens.has(token) ||
            mainTokens.has(token) ||
            brandTokens.has(token)
        ) {

            meaningful++;

            continue;

        }

        if (
            !SEO_FILLER_WORDS.has(
                token
            )
        ) {

            meaningful++;

        }

    }

    return meaningful === 0;
}


// ==========================================================
// VALID FACT WORD CHECK
// ==========================================================

function keywordUsesOnlyKnownWords(
    keyword,
    data
) {

    const keywordTokens =
        seoTokenSet(
            keyword
        );

    if (!keywordTokens.size) {
        return false;
    }

    const allowedText = [

        data.productName,
        data.brand,
        data.mainKeyword,
        data.material,
        data.fabric,
        data.color,
        data.size,
        data.pattern,
        data.fit,
        data.occasion,
        data.quantity,
        data.model,
        data.ingredients,
        data.fragrance,
        data.shade,
        data.compatibility,
        data.battery,
        data.capacity,
        data.ports,
        data.power,
        data.design,
        data.usage,
        data.closure,
        data.sole,
        data.stone,
        data.plating,
        data.ageRange,
        data.author,
        data.language,
        data.genre,
        data.edition,
        data.publisher,
        data.isbn,
        data.petType,
        data.sport,
        data.vehicleCompatibility,
        data.flavor,
        data.packaging,
        data.personalization,
        data.sleeve,
        data.neckline,
        data.type

    ]
        .filter(Boolean)
        .join(" ");

    const allowedTokens =
        seoTokenSet(
            allowedText
        );

    for (
        const token of
        keywordTokens
    ) {

        if (
            SEO_FILLER_WORDS.has(
                token
            )
        ) {

            continue;

        }

        if (
            !allowedTokens.has(
                token
            )
        ) {

            return false;

        }

    }

    return true;
}


// ==========================================================
// SEO FILTER
// ==========================================================

function filterSEOKeywords(
    keywords,
    data,
    mainKeyword
) {

    const output = [];
    const seen = new Set();

    const source =
        Array.isArray(keywords)
            ? keywords
            : [];

    for (
        const raw of
        source
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
            seen.has(
                normalized
            )
        ) {
            continue;
        }

        const wordCount =
            normalized
                .split(" ")
                .filter(Boolean)
                .length;

        if (
            wordCount > 8
        ) {
            continue;
        }

        const isMain =
            normalized ===
            normalizeSEOText(
                mainKeyword
            );

        // --------------------------------------------------
        // FILLER
        // --------------------------------------------------

        if (
            !isMain &&
            isFillerOnly(
                keyword,
                data.productName,
                mainKeyword,
                data.brand
            )
        ) {
            continue;
        }

        // --------------------------------------------------
        // UNKNOWN WORDS
        // --------------------------------------------------

        if (
            !keywordUsesOnlyKnownWords(
                keyword,
                data
            )
        ) {
            continue;
        }

        // --------------------------------------------------
        // BRAND CHECK
        //
        // Brand + Product is VALID.
        //
        // Example:
        // Test Brand Cotton Kurti
        //
        // This is NOT rejected.
        // --------------------------------------------------

        const brandNormalized =
            normalizeSEOText(
                data.brand
            );

        if (
            brandNormalized &&
            normalized ===
                brandNormalized
        ) {
            continue;
        }

        // --------------------------------------------------
        // CATEGORY WORD
        // --------------------------------------------------

        // Category is NOT automatically added.
        // Therefore we do not create:
        //
        // Cotton Kurti Fashion
        //
        // unless "fashion" was actually supplied
        // by the seller.

        // --------------------------------------------------
        // NEAR DUPLICATE
        // --------------------------------------------------

        const nearDuplicate =
            output.some(
                existing =>
                    seoSimilarity(
                        existing,
                        keyword
                    ) >= 0.90
            );

        if (
            nearDuplicate &&
            !isMain
        ) {
            continue;
        }

        seen.add(
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

    // ------------------------------------------------------
    // MAIN KEYWORD FIRST
    // ------------------------------------------------------

    const mainClean =
        cleanSEOKeyword(
            mainKeyword
        );

    const mainNormalized =
        normalizeSEOText(
            mainClean
        );

    if (
        mainNormalized
    ) {

        const existingIndex =
            output.findIndex(
                item =>
                    normalizeSEOText(
                        item
                    ) ===
                    mainNormalized
            );

        if (
            existingIndex === -1
        ) {

            output.unshift(
                mainClean
            );

        }
        else if (
            existingIndex > 0
        ) {

            const mainItem =
                output.splice(
                    existingIndex,
                    1
                )[0];

            output.unshift(
                mainItem
            );

        }

    }

    return output.slice(
        0,
        20
    );
}


// ==========================================================
// ADD KEYWORD SAFELY
// ==========================================================

function addKeywordCandidate(
    list,
    candidate,
    data
) {

    const keyword =
        cleanSEOKeyword(
            candidate
        );

    if (!keyword) {
        return;
    }

    const normalized =
        normalizeSEOText(
            keyword
        );

    if (!normalized) {
        return;
    }

    if (
        list.some(
            item =>
                normalizeSEOText(
                    item
                ) === normalized
        )
    ) {
        return;
    }

    if (
        list.some(
            item =>
                seoSimilarity(
                    item,
                    keyword
                ) >= 0.95
        )
    ) {
        return;
    }

    if (
        !keywordUsesOnlyKnownWords(
            keyword,
            data
        )
    ) {
        return;
    }

    list.push(
        keyword
    );
}


// ==========================================================
// DETERMINISTIC FACTUAL KEYWORDS
// ==========================================================

function buildFactualKeywordCandidates(
    data,
    mainKeyword
) {

    const candidates = [];

    const product =
        cleanSEOKeyword(
            data.productName
        );

    const brand =
        cleanSEOKeyword(
            data.brand
        );

    const main =
        cleanSEOKeyword(
            mainKeyword
        );

    // ------------------------------------------------------
    // 1. MAIN KEYWORD
    // ------------------------------------------------------

    addKeywordCandidate(
        candidates,
        main,
        data
    );

    // ------------------------------------------------------
    // 2. PRODUCT NAME
    // ------------------------------------------------------

    addKeywordCandidate(
        candidates,
        product,
        data
    );

    // ------------------------------------------------------
    // 3. BRAND + PRODUCT
    // ------------------------------------------------------

    if (
        brand &&
        product
    ) {

        addKeywordCandidate(
            candidates,
            `${brand} ${product}`,
            data
        );

        addKeywordCandidate(
            candidates,
            `${product} ${brand}`,
            data
        );

    }

    // ------------------------------------------------------
    // 4. BRAND + MAIN KEYWORD
    // ------------------------------------------------------

    if (
        brand &&
        main
    ) {

        addKeywordCandidate(
            candidates,
            `${brand} ${main}`,
            data
        );

    }

    // ------------------------------------------------------
    // 5. PRODUCT TOKEN COMBINATIONS
    // ------------------------------------------------------

    const productWords =
        cleanSEOKeyword(
            product
        )
            .split(/\s+/)
            .filter(Boolean);

    if (
        productWords.length >= 2
    ) {

        // Reverse only for natural two-word
        // product combinations.

        const reversed =
            [...productWords]
                .reverse()
                .join(" ");

        addKeywordCandidate(
            candidates,
            reversed,
            data
        );

    }

    // ------------------------------------------------------
    // 6. KNOWN PRODUCT FACTS
    // ------------------------------------------------------

    const factFields = [

        "material",
        "fabric",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity",
        "model",
        "ingredients",
        "fragrance",
        "shade",
        "compatibility",
        "battery",
        "capacity",
        "ports",
        "power",
        "design",
        "usage",
        "closure",
        "sole",
        "stone",
        "plating",
        "ageRange",
        "author",
        "language",
        "genre",
        "edition",
        "publisher",
        "isbn",
        "petType",
        "sport",
        "vehicleCompatibility",
        "flavor",
        "packaging",
        "personalization",
        "sleeve",
        "neckline",
        "type"

    ];

    for (
        const field of
        factFields
    ) {

        const value =
            cleanSEOKeyword(
                data[field]
            );

        if (!value) {
            continue;
        }

        addKeywordCandidate(
            candidates,
            `${value} ${product}`,
            data
        );

        if (brand) {

            addKeywordCandidate(
                candidates,
                `${brand} ${value} ${product}`,
                data
            );

        }

    }

    return candidates;
}


// ==========================================================
// FINAL FALLBACK KEYWORDS
// ==========================================================

function buildFallbackKeywords(
    data,
    mainKeyword
) {

    const candidates =
        buildFactualKeywordCandidates(
            data,
            mainKeyword
        );

    return filterSEOKeywords(
        candidates,
        data,
        mainKeyword
    );
}


// ==========================================================
// COLLECT PRODUCT DATA
// ==========================================================

function collectProductData(
    body,
    category
) {

    const b =
        body || {};

    const nestedDetails =
        b.productDetails &&
        typeof b.productDetails ===
            "object"
            ? b.productDetails
            : {};

    const fields = [

        "material",
        "fabric",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity",

        "model",

        "ingredients",
        "fragrance",
        "shade",

        "compatibility",
        "battery",
        "capacity",
        "ports",
        "power",

        "design",
        "usage",

        "closure",
        "sole",

        "stone",
        "plating",

        "ageRange",

        "author",
        "language",
        "genre",
        "edition",
        "publisher",
        "isbn",

        "petType",

        "sport",

        "vehicleCompatibility",

        "flavor",
        "packaging",

        "personalization",

        "sleeve",
        "neckline",

        "type"

    ];

    const data = {};

    for (
        const field of
        fields
    ) {

        let value =
            b[field];

        if (
            value === undefined
        ) {

            value =
                nestedDetails[field];

        }

        if (
            cleanString(value)
        ) {

            data[field] =
                cleanString(value);

        }

    }

    data.category =
        category;

    data.productName =
        cleanString(
            b.productName ||
            b.product ||
            b.name
        );

    data.brand =
        cleanString(
            b.brand ||
            data.brand
        );

    data.price =
        cleanString(
            b.price
        );

    data.mainKeyword =
        cleanString(
            b.mainKeyword ||
            b.keyword
        );

    data.targetMarketplace =
        cleanString(
            b.targetMarketplace ||
            b.marketplace
        );

    data.rawDetails =
        cleanString(
            typeof b.productDetails ===
                "string"
                ? b.productDetails
                : b.details
        );

    return data;
}


// ==========================================================
// PRODUCT FACTS
// ==========================================================

function productFactsText(
    data
) {

    const ignored =
        new Set([

            "category",
            "productName",
            "brand",
            "mainKeyword",
            "targetMarketplace",
            "rawDetails",
            "price"

        ]);

    const lines = [];

    for (
        const [
            key,
            value
        ] of Object.entries(data)
    ) {

        if (
            ignored.has(key)
        ) {
            continue;
        }

        if (
            cleanString(value)
        ) {

            lines.push(
                `${key}: ${value}`
            );

        }

    }

    if (
        data.rawDetails
    ) {

        lines.push(
            `seller product details: ${data.rawDetails}`
        );

    }

    return lines.length
        ? lines.join("\n")
        : "No additional product facts supplied.";
}


// ==========================================================
// VALIDATE
// ==========================================================

function requireProductAndCategory(
    req,
    res
) {

    const category =
        normalizeCategory(
            req.body &&
            req.body.category
        );

    const productName =
        cleanString(
            req.body &&
            (
                req.body.productName ||
                req.body.product ||
                req.body.name
            )
        );

    if (!category) {

        res.status(400).json({

            success: false,

            error:
                "Product category is required",

            categories:
                CATEGORIES

        });

        return null;
    }

    if (!productName) {

        res.status(400).json({

            success: false,

            error:
                "Product name is required"

        });

        return null;
    }

    return {
        category,
        productName
    };
}


// ==========================================================
// BASE PROMPT
// ==========================================================

function basePrompt(
    data,
    task
) {

    return `

You are the AI Seller Toolkit marketplace listing assistant.

TASK:
${task}

CATEGORY:
${data.category}

CATEGORY RULE:
${CATEGORY_RULES[data.category] ||
    "Use only seller-provided facts."}

${STRICT_RULES}

SELLER FACTS:

Product Name:
${data.productName}

Brand:
${data.brand || "Not provided"}

${productFactsText(data)}

Price:
${data.price || "Not provided"}

Target Marketplace:
${data.targetMarketplace || "Not provided"}

IMPORTANT:

- Product Name is a seller fact.
- Brand is a seller fact only when supplied.
- Category is classification information.
- Do not automatically turn category into
  a product attribute.
- Missing information must remain missing.
- Never invent product facts.

`;
}


// ==========================================================
// GENERATE JSON
// ==========================================================

async function generateJSON(
    prompt
) {

    const text =
        await callGemini(
            prompt +
            `

RETURN ONLY VALID JSON.
DO NOT USE MARKDOWN.
DO NOT USE CODE FENCES.
`
        );

    const parsed =
        safeJsonParse(
            text
        );

    if (!parsed) {

        throw new Error(
            "AI response JSON invalid."
        );

    }

    return parsed;
}


// ==========================================================
// FALLBACK TITLE
// ==========================================================

function fallbackTitle(
    data
) {

    const product =
        cleanString(
            data.productName
        );

    const brand =
        cleanString(
            data.brand
        );

    if (
        brand &&
        normalizeSEOText(
            brand
        ) !==
        normalizeSEOText(
            product
        )
    ) {

        return `${brand} ${product}`
            .trim()
            .slice(0, 200);

    }

    return product
        .slice(0, 200);
}


// ==========================================================
// FALLBACK DESCRIPTION
// ==========================================================

function fallbackDescription(
    data
) {

    const facts = [];

    if (data.brand) {

        facts.push(
            `Brand: ${data.brand}`
        );

    }

    if (
        data.material ||
        data.fabric
    ) {

        facts.push(
            `Material: ${
                data.material ||
                data.fabric
            }`
        );

    }

    if (data.color) {

        facts.push(
            `Color: ${data.color}`
        );

    }

    if (data.size) {

        facts.push(
            `Size: ${data.size}`
        );

    }

    if (data.quantity) {

        facts.push(
            `Quantity: ${data.quantity}`
        );

    }

    if (data.price) {

        facts.push(
            `Price: ₹${data.price}`
        );

    }

    if (data.rawDetails) {

        facts.push(
            data.rawDetails
        );

    }

    if (facts.length) {

        return (
            `${data.productName} is listed with the seller-provided details below.\n\n` +
            facts.join("\n")
        );

    }

    return (
        `${data.productName} is available with the seller-provided product information.`
    );
}


// ==========================================================
// FALLBACK HIGHLIGHTS
// ==========================================================

function fallbackHighlights(
    data
) {

    const output = [];

    const mappings = [

        [
            "Brand",
            data.brand
        ],

        [
            "Material",
            data.material ||
            data.fabric
        ],

        [
            "Color",
            data.color
        ],

        [
            "Size",
            data.size
        ],

        [
            "Pattern",
            data.pattern
        ],

        [
            "Model",
            data.model
        ],

        [
            "Capacity",
            data.capacity
        ],

        [
            "Quantity",
            data.quantity
        ]

    ];

    for (
        const [
            label,
            value
        ] of mappings
    ) {

        if (value) {

            output.push(
                `${label}: ${value}`
            );

        }

    }

    return output.slice(
        0,
        8
    );
}


// ==========================================================
// GET /
// ==========================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI Seller Toolkit Backend",

            version:
                "14.0",

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

            categories:
                CATEGORIES.length,

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
// GET /api/status
// ==========================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            server:
                "AI Seller Toolkit Backend",

            version:
                "14.0",

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

            categories:
                CATEGORIES.length,

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
// GET /api/categories
// ==========================================================

app.get(
    "/api/categories",
    (req, res) => {

        res.json({

            success: true,

            categories:
                CATEGORIES,

            count:
                CATEGORIES.length

        });

    }
);


// ==========================================================
// POST /api/generate-title
// ==========================================================

app.post(
    "/api/generate-title",
    async (req, res) => {

        const required =
            requireProductAndCategory(
                req,
                res
            );

        if (!required) {
            return;
        }

        const data =
            collectProductData(
                req.body,
                required.category
            );

        try {

            const result =
                await generateJSON(

                    basePrompt(
                        data,

                        `
Create ONE clear marketplace product title.

Rules:

- Main product name first.
- Brand may be used only when supplied.
- Use seller facts only.
- No unsupported adjectives.
- No unsupported specifications.
- No fake benefits.
- No keyword stuffing.

Return exactly:

{
  "title": "..."
}
`
                    )
                );

            const title =
                cleanString(
                    result.title
                ) ||
                fallbackTitle(
                    data
                );

            res.json({

                success: true,

                title:
                    title,

                generatedTitle:
                    title

            });

        }
        catch (error) {

            console.error(
                "TITLE ERROR:",
                error.message
            );

            const title =
                fallbackTitle(
                    data
                );

            res.json({

                success: true,

                fallback: true,

                title:
                    title,

                generatedTitle:
                    title,

                warning:
                    "AI unavailable; factual fallback used."

            });

        }

    }
);


// ==========================================================
// POST /api/generate-description
// ==========================================================

app.post(
    "/api/generate-description",
    async (req, res) => {

        const required =
            requireProductAndCategory(
                req,
                res
            );

        if (!required) {
            return;
        }

        const data =
            collectProductData(
                req.body,
                required.category
            );

        try {

            const result =
                await generateJSON(

                    basePrompt(
                        data,

                        `
Create a concise marketplace product description.

Use only seller facts.

Do not invent:

- benefits
- dimensions
- compatibility
- warranty
- certification
- ingredients
- technical specifications
- medical claims
- unsupported adjectives

Return exactly:

{
  "description": "..."
}
`
                    )
                );

            const description =
                cleanString(
                    result.description
                ) ||
                fallbackDescription(
                    data
                );

            res.json({

                success: true,

                description:
                    description,

                generatedDescription:
                    description

            });

        }
        catch (error) {

            console.error(
                "DESCRIPTION ERROR:",
                error.message
            );

            const description =
                fallbackDescription(
                    data
                );

            res.json({

                success: true,

                fallback: true,

                description:
                    description,

                generatedDescription:
                    description,

                warning:
                    "AI unavailable; factual fallback used."

            });

        }

    }
);


// ==========================================================
// POST /api/generate-listing
// ==========================================================

app.post(
    "/api/generate-listing",
    async (req, res) => {

        const required =
            requireProductAndCategory(
                req,
                res
            );

        if (!required) {
            return;
        }

        const data =
            collectProductData(
                req.body,
                required.category
            );

        try {

            const result =
                await generateJSON(

                    basePrompt(
                        data,

                        `
Create a complete marketplace product listing.

Return exactly:

{
  "title": "...",
  "description": "...",
  "highlights": [],
  "seoKeywords": []
}

Every field must be factual.

SEO keywords:

- relevant
- factual
- no duplicates
- no invented attributes
- no unsupported claims
- no unnecessary filler
`
                    )
                );

            const title =
                cleanString(
                    result.title
                ) ||
                fallbackTitle(
                    data
                );

            const description =
                cleanString(
                    result.description
                ) ||
                fallbackDescription(
                    data
                );

            const highlights =
                Array.isArray(
                    result.highlights
                )
                    ? result.highlights
                        .map(
                            cleanString
                        )
                        .filter(Boolean)
                        .slice(0, 8)
                    : fallbackHighlights(
                        data
                    );

            const mainKeyword =
                cleanSEOKeyword(
                    data.mainKeyword ||
                    data.productName
                );

            const aiKeywords =
                filterSEOKeywords(
                    result.seoKeywords,
                    data,
                    mainKeyword
                );

            const finalKeywords =
                aiKeywords.length >= 2
                    ? aiKeywords
                    : buildFallbackKeywords(
                        data,
                        mainKeyword
                    );

            res.json({

                success: true,

                title,

                description,

                highlights,

                seoKeywords:
                    finalKeywords,

                keywords:
                    finalKeywords,

                generatedTitle:
                    title,

                generatedDescription:
                    description

            });

        }
        catch (error) {

            console.error(
                "LISTING ERROR:",
                error.message
            );

            const title =
                fallbackTitle(
                    data
                );

            const description =
                fallbackDescription(
                    data
                );

            const mainKeyword =
                cleanSEOKeyword(
                    data.mainKeyword ||
                    data.productName
                );

            const keywords =
                buildFallbackKeywords(
                    data,
                    mainKeyword
                );

            res.json({

                success: true,

                fallback: true,

                title,

                description,

                highlights:
                    fallbackHighlights(
                        data
                    ),

                seoKeywords:
                    keywords,

                keywords,

                generatedTitle:
                    title,

                generatedDescription:
                    description,

                warning:
                    "AI unavailable; factual fallback used."

            });

        }

    }
);


// ==========================================================
// POST /api/generate-seo
// ==========================================================

app.post(
    "/api/generate-seo",
    async (req, res) => {

        const required =
            requireProductAndCategory(
                req,
                res
            );

        if (!required) {
            return;
        }

        const data =
            collectProductData(
                req.body,
                required.category
            );

        // --------------------------------------------------
        // MAIN KEYWORD
        // --------------------------------------------------

        const mainKeyword =
            cleanSEOKeyword(
                data.mainKeyword ||
                data.productName
            );

        // --------------------------------------------------
        // AI GENERATION
        // --------------------------------------------------

        try {

            const result =
                await generateJSON(

                    basePrompt(
                        data,

                        `
Generate SEO keywords for the seller's product.

IMPORTANT:

1. Main Keyword is optional.
2. If Main Keyword is supplied,
   use the exact supplied Main Keyword.
3. If Main Keyword is missing,
   use the exact Product Name.
4. Main Keyword MUST be first.
5. Maximum 20 keywords.
6. Use only seller-provided facts.
7. Product Name itself is always valid.
8. Brand + Product is allowed when brand exists.
9. Brand alone is not useful.
10. Do not invent gender.
11. Do not invent material.
12. Do not invent color.
13. Do not invent size.
14. Do not invent model.
15. Do not invent compatibility.
16. Do not invent benefits.
17. Do not invent technical specifications.
18. Do not add "online" unnecessarily.
19. Do not add "buy" unnecessarily.
20. Do not add "shop" unnecessarily.
21. Do not add "best".
22. Do not add "premium".
23. Do not add "collection".
24. Do not add "trendy".
25. Do not add unsupported category words.
26. Do not repeat keywords.
27. Do not create meaningless variations.
28. Natural combinations of known seller facts
    are allowed.

Examples:

If seller facts are:

Product Name:
Cotton Kurti

Brand:
Test Brand

Valid examples can include:

Cotton Kurti
Test Brand Cotton Kurti
Test Brand Kurti
Cotton Kurti Test Brand

Invalid examples:

Cotton Kurti for Women
Cotton Kurti for Girls
Premium Cotton Kurti
Best Cotton Kurti
Cotton Kurti Online
Stylish Cotton Kurti

because those add unsupported information.

Return exactly:

{
  "mainKeyword": "...",
  "keywords": [
    "...",
    "...",
    "..."
  ]
}
`
                    )
                );

            let aiMainKeyword =
                cleanSEOKeyword(
                    result.mainKeyword
                );

            // --------------------------------------------------
            // MAIN KEYWORD SAFETY
            // --------------------------------------------------

            if (
                normalizeSEOText(
                    aiMainKeyword
                ) !==
                normalizeSEOText(
                    mainKeyword
                )
            ) {

                aiMainKeyword =
                    mainKeyword;

            }

            // --------------------------------------------------
            // FILTER AI KEYWORDS
            // --------------------------------------------------

            let finalKeywords =
                filterSEOKeywords(
                    result.keywords,
                    data,
                    aiMainKeyword
                );

            // --------------------------------------------------
            // ALWAYS USE FACTUAL FALLBACK EXPANSION
            // --------------------------------------------------

            const factualCandidates =
                buildFactualKeywordCandidates(
                    data,
                    aiMainKeyword
                );

            // Add valid deterministic
            // keywords after AI keywords.

            for (
                const candidate of
                factualCandidates
            ) {

                if (
                    finalKeywords.length >= 20
                ) {
                    break;
                }

                if (
                    finalKeywords.some(
                        existing =>
                            normalizeSEOText(
                                existing
                            ) ===
                            normalizeSEOText(
                                candidate
                            )
                    )
                ) {
                    continue;
                }

                finalKeywords.push(
                    candidate
                );

            }

            // --------------------------------------------------
            // FINAL FILTER
            // --------------------------------------------------

            finalKeywords =
                filterSEOKeywords(
                    finalKeywords,
                    data,
                    aiMainKeyword
                );

            // --------------------------------------------------
            // GUARANTEE MAIN KEYWORD
            // --------------------------------------------------

            if (
                !finalKeywords.length ||
                normalizeSEOText(
                    finalKeywords[0]
                ) !==
                normalizeSEOText(
                    aiMainKeyword
                )
            ) {

                finalKeywords =
                    [
                        aiMainKeyword,
                        ...finalKeywords
                    ];

            }

            finalKeywords =
                finalKeywords.slice(
                    0,
                    20
                );

            res.json({

                success: true,

                mainKeyword:
                    aiMainKeyword,

                keywords:
                    finalKeywords,

                seoKeywords:
                    finalKeywords,

                text:
                    finalKeywords.join(
                        ", "
                    ),

                count:
                    finalKeywords.length

            });

        }
        catch (error) {

            console.error(
                "SEO ERROR:",
                error.message
            );

            // --------------------------------------------------
            // DETERMINISTIC FALLBACK
            // --------------------------------------------------

            const finalKeywords =
                buildFallbackKeywords(
                    data,
                    mainKeyword
                );

            res.json({

                success: true,

                fallback: true,

                mainKeyword:
                    mainKeyword,

                keywords:
                    finalKeywords,

                seoKeywords:
                    finalKeywords,

                text:
                    finalKeywords.join(
                        ", "
                    ),

                count:
                    finalKeywords.length,

                warning:
                    "AI unavailable; factual SEO keywords generated."

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
                "API endpoint not found",

            path:
                req.path

        });

    }
);


// ==========================================================
// GLOBAL ERROR
// ==========================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "SERVER ERROR:",
            err
        );

        if (
            res.headersSent
        ) {

            return next(
                err
            );

        }

        res.status(500).json({

            success: false,

            error:
                "Internal server error"

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
            "Version: 14.0"
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Gemini Model: ${MODEL}`
        );

        console.log(
            "Gemini API: " +
            (
                GEMINI_API_KEY
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            )
        );

        console.log(
            "API: Interactions API"
        );

        console.log(
            "Categories: " +
            CATEGORIES.length
        );

        console.log(
            "SEO Endpoint: /api/generate-seo"
        );

        console.log(
            "=========================================================="
        );

    }
);
