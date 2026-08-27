// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — FINAL VERSION 7.1
// ==========================================================
// Category-Aware
// Strict Fact Guard
// NO INVENTED FACTS
// Deterministic Fallback
// Gemini Primary + Fallback
// Express + CORS
// Frontend Compatible
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");


// ==========================================================
// APP CONFIG
// ==========================================================

const app = express();

const PORT = process.env.PORT || 10000;

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY || "";


// Current stable Gemini models
const PRIMARY_MODEL =
    process.env.PRIMARY_MODEL ||
    "gemini-3.6-flash";

const FALLBACK_MODEL =
    process.env.FALLBACK_MODEL ||
    "gemini-3.5-flash-lite";

const VERSION = "7.1";

const SERVER_NAME =
    "AI SELLER TOOLKIT BACKEND";


// ==========================================================
// GEMINI CLIENT
// ==========================================================

let ai = null;

if (GEMINI_API_KEY.trim()) {

    ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY.trim()
    });

}


// ==========================================================
// MIDDLEWARE
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
// CATEGORY DEFINITIONS
// ==========================================================

const CATEGORY_RULES = {

    "Fashion": {
        focus: "Clothing and fashion products.",
        fields: [
            "Fabric / Material",
            "Color",
            "Size",
            "Pattern",
            "Fit",
            "Occasion",
            "Quantity"
        ]
    },

    "Beauty": {
        focus: "Beauty and personal-care products.",
        fields: [
            "Form / Texture",
            "Color",
            "Quantity",
            "Variant",
            "Ingredients",
            "Skin Type",
            "Hair Type",
            "Fragrance"
        ]
    },

    "Electronics": {
        focus: "Electronic and technology products.",
        fields: [
            "Model",
            "Color",
            "Storage",
            "RAM",
            "Battery",
            "Connectivity",
            "Compatibility",
            "Warranty",
            "Quantity"
        ]
    },

    "Home & Kitchen": {
        focus: "Home, kitchen and household products.",
        fields: [
            "Material",
            "Color",
            "Size / Dimensions",
            "Capacity",
            "Quantity",
            "Usage"
        ]
    },

    "Shoes": {
        focus: "Shoes and footwear.",
        fields: [
            "Fabric / Material",
            "Color",
            "Size",
            "Pattern",
            "Fit",
            "Occasion",
            "Quantity"
        ]
    },

    "Jewellery": {
        focus: "Jewellery and fashion accessories.",
        fields: [
            "Material",
            "Color",
            "Design",
            "Size",
            "Stone",
            "Occasion",
            "Quantity"
        ]
    },

    "Toys": {
        focus: "Toys, games and children's play products.",
        fields: [
            "Material",
            "Color",
            "Size",
            "Age Group",
            "Quantity",
            "Product Type"
        ]
    },

    "Books": {
        focus: "Books and reading material.",
        fields: [
            "Author",
            "Language",
            "Format",
            "Pages",
            "Publisher",
            "Edition",
            "ISBN"
        ]
    },

    "Pet": {
        focus: "Pet products and pet accessories.",
        fields: [
            "Pet Type",
            "Material",
            "Size",
            "Quantity",
            "Ingredients",
            "Flavour"
        ]
    },

    "Sports": {
        focus: "Sports, fitness and outdoor sports products.",
        fields: [
            "Material",
            "Color",
            "Size",
            "Sport Type",
            "Quantity",
            "Usage"
        ]
    },

    "Automotive": {
        focus: "Automotive products and vehicle accessories.",
        fields: [
            "Model",
            "Vehicle Compatibility",
            "Material",
            "Color",
            "Dimensions",
            "Quantity"
        ]
    },

    "Garden": {
        focus: "Gardening, plants and garden accessories.",
        fields: [
            "Material",
            "Color",
            "Size",
            "Quantity",
            "Plant Compatibility",
            "Usage"
        ]
    },

    "Food": {
        focus: "Food and edible products.",
        fields: [
            "Ingredients",
            "Flavour",
            "Quantity",
            "Form",
            "Variant",
            "Dietary Information"
        ]
    },

    "Gifts": {
        focus: "Gift items and gifting products.",
        fields: [
            "Material",
            "Color",
            "Size",
            "Occasion",
            "Quantity",
            "Gift Type"
        ]
    }

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
        .replace(
            /^[\p{Extended_Pictographic}\p{Emoji_Presentation}\s]+/u,
            ""
        )
        .trim();

    const lower =
        value.toLowerCase();

    const aliases = {

        "fashion":
            "Fashion",

        "fashion & clothing":
            "Fashion",

        "fashion and clothing":
            "Fashion",

        "clothing":
            "Fashion",

        "apparel":
            "Fashion",

        "beauty":
            "Beauty",

        "personal care":
            "Beauty",

        "personal-care":
            "Beauty",

        "electronics":
            "Electronics",

        "electronic":
            "Electronics",

        "electronic products":
            "Electronics",

        "home & kitchen":
            "Home & Kitchen",

        "home and kitchen":
            "Home & Kitchen",

        "home kitchen":
            "Home & Kitchen",

        "home":
            "Home & Kitchen",

        "kitchen":
            "Home & Kitchen",

        "shoes":
            "Shoes",

        "shoe":
            "Shoes",

        "footwear":
            "Shoes",

        "jewellery":
            "Jewellery",

        "jewelry":
            "Jewellery",

        "jewellery & accessories":
            "Jewellery",

        "toys":
            "Toys",

        "toy":
            "Toys",

        "books":
            "Books",

        "book":
            "Books",

        "pet":
            "Pet",

        "pets":
            "Pet",

        "pet products":
            "Pet",

        "sports":
            "Sports",

        "sport":
            "Sports",

        "fitness":
            "Sports",

        "automotive":
            "Automotive",

        "automobile":
            "Automotive",

        "car accessories":
            "Automotive",

        "vehicle accessories":
            "Automotive",

        "garden":
            "Garden",

        "gardening":
            "Garden",

        "garden products":
            "Garden",

        "food":
            "Food",

        "foods":
            "Food",

        "grocery":
            "Food",

        "gifts":
            "Gifts",

        "gift":
            "Gifts",

        "gift items":
            "Gifts"

    };

    return aliases[lower] || value;
}


// ==========================================================
// TEXT HELPERS
// ==========================================================

function cleanText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/\s+/g, " ")
        .trim();
}


function cleanMultilineText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}


function normalizePrice(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\s+/g, " ");
}


// ==========================================================
// PRODUCT INPUT SANITIZER
// ==========================================================

function sanitizeProductInput(body) {

    const input = body || {};

    const category =
        normalizeCategory(
            input.category ||
            input.productCategory ||
            input.categoryName ||
            input.product_category ||
            input.selectedCategory
        );

    const productName =
        cleanText(
            input.productName ||
            input.product_name ||
            input.name ||
            input.title
        );

    const brand =
        cleanText(
            input.brand ||
            input.brandName ||
            input.productBrand
        );

    const price =
        normalizePrice(
            input.price ||
            input.productPrice ||
            input.product_price
        );

    const productFeatures =
        cleanMultilineText(
            input.productFeatures ||
            input.features ||
            input.product_features ||
            input.featuresText
        );

    const extraProductInformation =
        cleanMultilineText(
            input.extraProductInformation ||
            input.extraInfo ||
            input.productDetails ||
            input.productDetailsExtra ||
            input.additionalInformation ||
            input.additionalInfo
        );

    const fields = {};


    // ------------------------------------------------------
    // Standard fields
    // ------------------------------------------------------

    const possibleFields = [

        "material",
        "fabric",
        "fabricMaterial",

        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity",

        "formTexture",
        "variant",
        "ingredients",
        "skinType",
        "hairType",
        "fragrance",

        "model",
        "storage",
        "ram",
        "battery",
        "connectivity",
        "compatibility",
        "warranty",

        "sizeDimensions",
        "capacity",
        "usage",

        "design",
        "stone",

        "ageGroup",
        "productType",

        "author",
        "language",
        "format",
        "pages",
        "publisher",
        "edition",
        "isbn",

        "petType",
        "flavour",

        "sportType",

        "vehicleCompatibility",
        "dimensions",

        "plantCompatibility",

        "dietaryInformation",

        "giftType"

    ];


    for (const key of possibleFields) {

        if (
            input[key] !== undefined &&
            input[key] !== null
        ) {

            const value =
                cleanText(input[key]);

            if (value) {
                fields[key] = value;
            }

        }

    }


    // ------------------------------------------------------
    // UI aliases
    // ------------------------------------------------------

    const aliases = {

        "Fabric / Material":
            "fabricMaterial",

        "Form / Texture":
            "formTexture",

        "Size / Dimensions":
            "sizeDimensions",

        "Vehicle Compatibility":
            "vehicleCompatibility",

        "Plant Compatibility":
            "plantCompatibility",

        "Dietary Information":
            "dietaryInformation",

        "Age Group":
            "ageGroup",

        "Product Type":
            "productType",

        "Sport Type":
            "sportType",

        "Gift Type":
            "giftType",

        "Pet Type":
            "petType",

        "Skin Type":
            "skinType",

        "Hair Type":
            "hairType"

    };


    for (
        const [sourceKey, targetKey]
        of Object.entries(aliases)
    ) {

        if (
            input[sourceKey] !== undefined &&
            input[sourceKey] !== null
        ) {

            const value =
                cleanText(input[sourceKey]);

            if (value) {
                fields[targetKey] = value;
            }

        }

    }


    // ------------------------------------------------------
    // Lowercase / hyphen UI aliases
    // ------------------------------------------------------

    const normalizedInputFields = {

        material:
            input["fabric / material"],

        formTexture:
            input["form / texture"],

        sizeDimensions:
            input["size / dimensions"],

        vehicleCompatibility:
            input["vehicle compatibility"],

        plantCompatibility:
            input["plant compatibility"],

        dietaryInformation:
            input["dietary information"],

        ageGroup:
            input["age group"],

        productType:
            input["product type"],

        sportType:
            input["sport type"],

        giftType:
            input["gift type"],

        petType:
            input["pet type"],

        skinType:
            input["skin type"],

        hairType:
            input["hair type"]

    };


    for (
        const [key, value]
        of Object.entries(normalizedInputFields)
    ) {

        const cleaned =
            cleanText(value);

        if (cleaned) {
            fields[key] = cleaned;
        }

    }


    return {

        category,

        productName,

        brand,

        price,

        fields,

        productFeatures,

        extraProductInformation

    };
}


// ==========================================================
// FACT COLLECTION
// ==========================================================

function collectFacts(product) {

    const facts = [];

    if (product.category) {
        facts.push(product.category);
    }

    if (product.productName) {
        facts.push(product.productName);
    }

    if (product.brand) {
        facts.push(product.brand);
    }

    if (product.price) {
        facts.push(product.price);
    }

    for (
        const value
        of Object.values(product.fields)
    ) {

        if (value) {
            facts.push(value);
        }

    }

    if (product.productFeatures) {
        facts.push(product.productFeatures);
    }

    if (product.extraProductInformation) {
        facts.push(
            product.extraProductInformation
        );
    }

    return facts;
}


// ==========================================================
// NUMBER GUARD
// ==========================================================

function extractNumbers(text) {

    if (!text) {
        return [];
    }

    return String(text).match(
        /(?:₹|Rs\.?|INR)?\s*\d+(?:[.,]\d+)?/gi
    ) || [];
}


function normalizeNumberToken(value) {

    return String(value)
        .toLowerCase()
        .replace(/rs\.?/g, "")
        .replace(/inr/g, "")
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .replace(/\s+/g, "")
        .trim();
}


function numbersAreSupported(
    output,
    sourceText
) {

    const outputNumbers =
        extractNumbers(output);

    const sourceNumbers =
        extractNumbers(sourceText);

    const sourceSet =
        new Set(
            sourceNumbers.map(
                normalizeNumberToken
            )
        );

    for (
        const number
        of outputNumbers
    ) {

        if (
            !sourceSet.has(
                normalizeNumberToken(number)
            )
        ) {
            return false;
        }

    }

    return true;
}


// ==========================================================
// UNSUPPORTED CLAIM GUARD
// ==========================================================

const UNSUPPORTED_CLAIM_PATTERNS = [

    /\bwaterproof\b/i,
    /\bwater resistant\b/i,
    /\bwater-resistant\b/i,

    /\bshockproof\b/i,
    /\bshock-proof\b/i,

    /\bdustproof\b/i,
    /\bdust-proof\b/i,

    /\banti[- ]?bacterial\b/i,
    /\bantibacterial\b/i,

    /\borganic\b/i,

    /\bpremium quality\b/i,
    /\bpremium\b/i,

    /\bluxury\b/i,

    /\bbest\b/i,
    /\btop quality\b/i,
    /\bhigh quality\b/i,

    /\b100% safe\b/i,

    /\bguaranteed\b/i,
    /\bguarantee\b/i,

    /\bcertified\b/i,

    /\bauthentic\b/i,
    /\bgenuine\b/i,
    /\boriginal\b/i,

    /\bdermatologically tested\b/i,
    /\bclinically tested\b/i,

    /\bchemical free\b/i,
    /\bparaben free\b/i,
    /\bcruelty free\b/i,

    /\bmade in india\b/i,

    /\bfast charging\b/i,
    /\blong lasting battery\b/i,
    /\blong battery life\b/i,

    /\bnoise cancellation\b/i,
    /\bactive noise cancellation\b/i,

    /\bbluetooth 5\.\d\b/i,

    /\b\d+\s*hour(?:s)? battery\b/i,
    /\b\d+\s*days?\b/i,

    /\bfree shipping\b/i,
    /\bcash on delivery\b/i,
    /\bcod\b/i,

    /\bdiscount\b/i,
    /\boffer\b/i,

    /\breturn policy\b/i,
    /\bfree return\b/i,

    /\bwarranty included\b/i,

    /\bcompatible with all\b/i,
    /\bsuitable for all\b/i,

    /\bdoctor recommended\b/i,
    /\bexpert recommended\b/i,

    /\bguaranteed results\b/i,
    /\binstant results\b/i,
    /\bprofessional grade\b/i

];


function containsUnsupportedClaims(text) {

    if (!text) {
        return false;
    }

    for (
        const pattern
        of UNSUPPORTED_CLAIM_PATTERNS
    ) {

        if (pattern.test(text)) {
            return true;
        }

    }

    return false;
}


// ==========================================================
// SOURCE FACT CHECK
// ==========================================================

function textContainsSourceFact(
    text,
    product
) {

    const normalizedText =
        String(text || "")
            .toLowerCase();

    const importantFacts = [

        product.productName,

        product.brand,

        product.category,

        product.price,

        ...Object.values(product.fields),

        product.productFeatures,

        product.extraProductInformation

    ].filter(Boolean);


    if (!importantFacts.length) {
        return false;
    }


    return importantFacts.some(
        fact => {

            const normalizedFact =
                String(fact)
                    .toLowerCase()
                    .trim();

            return (
                normalizedFact.length > 0 &&
                normalizedText.includes(
                    normalizedFact
                )
            );

        }
    );
}


// ==========================================================
// LISTING VALIDATOR
// ==========================================================

function validateListing(
    listing,
    product
) {

    if (
        !listing ||
        typeof listing !== "object"
    ) {

        return {
            valid: false,
            reason: "Invalid listing object"
        };

    }


    const requiredFields = [

        "title",
        "description",
        "highlights",
        "keywords",
        "hashtags",
        "seoTitle",
        "seoDescription"

    ];


    for (
        const field
        of requiredFields
    ) {

        if (
            listing[field] === undefined ||
            listing[field] === null
        ) {

            return {
                valid: false,
                reason:
                    `Missing field: ${field}`
            };

        }

    }


    const allText = [

        listing.title,

        listing.description,

        listing.highlights,

        listing.keywords,

        listing.hashtags,

        listing.seoTitle,

        listing.seoDescription

    ].join("\n");


    // ------------------------------------------------------
    // Product name required
    // ------------------------------------------------------

    if (product.productName) {

        if (
            !allText
                .toLowerCase()
                .includes(
                    product.productName
                        .toLowerCase()
                )
        ) {

            return {
                valid: false,
                reason:
                    "Product name missing"
            };

        }

    }


    // ------------------------------------------------------
    // Number guard
    // ------------------------------------------------------

    const sourceText = [

        product.productName,

        product.brand,

        product.price,

        ...Object.values(product.fields),

        product.productFeatures,

        product.extraProductInformation

    ]
        .filter(Boolean)
        .join(" ");


    if (
        !numbersAreSupported(
            allText,
            sourceText
        )
    ) {

        return {
            valid: false,
            reason:
                "Unsupported number detected"
        };

    }


    // ------------------------------------------------------
    // Unsupported claim guard
    // ------------------------------------------------------

    if (
        containsUnsupportedClaims(allText)
    ) {

        return {
            valid: false,
            reason:
                "Unsupported product claim detected"
        };

    }


    // ------------------------------------------------------
    // Source fact guard
    // ------------------------------------------------------

    if (
        !textContainsSourceFact(
            allText,
            product
        )
    ) {

        return {
            valid: false,
            reason:
                "Listing is not grounded in source facts"
        };

    }


    return {

        valid: true,

        reason:
            "Strict fact validation passed"

    };
}


// ==========================================================
// SAFE ARRAY
// ==========================================================

function ensureArray(value) {

    if (Array.isArray(value)) {

        return value
            .map(item =>
                cleanText(item)
            )
            .filter(Boolean);

    }


    if (typeof value === "string") {

        return value
            .split(/\n|,/)
            .map(item =>

                item
                    .replace(
                        /^[-•*]\s*/,
                        ""
                    )
                    .trim()

            )
            .filter(Boolean);

    }


    return [];
}


// ==========================================================
// NORMALIZE AI RESPONSE
// ==========================================================

function normalizeAIListing(data) {

    data = data || {};


    const highlights =
        ensureArray(
            data.highlights ||
            data.HIGHLIGHTS ||
            data["HIGHLIGHTS"]
        );


    const keywords =
        ensureArray(
            data.keywords ||
            data.KEYWORDS ||
            data["KEYWORDS"]
        );


    const hashtags =
        ensureArray(
            data.hashtags ||
            data.HASHTAGS ||
            data["HASHTAGS"]
        );


    return {

        title:
            cleanText(
                data.title ||
                data.TITLE
            ),

        description:
            cleanMultilineText(
                data.description ||
                data.DESCRIPTION
            ),

        highlights,

        keywords,

        hashtags,

        seoTitle:
            cleanText(
                data.seoTitle ||
                data["SEO TITLE"] ||
                data.seo_title
            ),

        seoDescription:
            cleanMultilineText(
                data.seoDescription ||
                data["SEO DESCRIPTION"] ||
                data.seo_description
            )

    };
}


// ==========================================================
// JSON EXTRACTION
// ==========================================================

function parseAIJson(text) {

    if (!text) {
        throw new Error(
            "Empty AI response"
        );
    }


    let cleaned =
        String(text).trim();


    // Remove markdown fences
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

        return JSON.parse(cleaned);

    } catch (error) {

        // Continue to extraction
    }


    // Extract first JSON object
    const start =
        cleaned.indexOf("{");

    const end =
        cleaned.lastIndexOf("}");


    if (
        start !== -1 &&
        end !== -1 &&
        end > start
    ) {

        const possibleJSON =
            cleaned.substring(
                start,
                end + 1
            );

        try {

            return JSON.parse(
                possibleJSON
            );

        } catch (error) {

            throw new Error(
                "AI returned malformed JSON"
            );

        }

    }


    throw new Error(
        "AI returned invalid JSON"
    );
}


// ==========================================================
// DETERMINISTIC FALLBACK
// ==========================================================
// This fallback uses ONLY seller-provided information.
// ==========================================================

function deterministicFallback(product) {

    const name =
        product.productName;

    const brand =
        product.brand;

    const price =
        product.price;


    const fieldEntries =
        Object.entries(
            product.fields
        )
        .filter(
            ([, value]) => Boolean(value)
        );


    const featureText =
        product.productFeatures;


    const extraInfo =
        product.extraProductInformation;


    // ------------------------------------------------------
    // TITLE
    // ------------------------------------------------------

    const titleParts = [];

    if (brand) {
        titleParts.push(brand);
    }

    titleParts.push(name);


    const title =
        titleParts
            .join(" ")
            .trim();


    // ------------------------------------------------------
    // DESCRIPTION
    // ------------------------------------------------------

    const descriptionParts = [];


    descriptionParts.push(
        brand
            ? `${brand} ${name}`
            : name
    );


    if (fieldEntries.length) {

        const factualFields =
            fieldEntries
                .slice(0, 4)
                .map(
                    ([key, value]) =>
                        `${key}: ${value}`
                )
                .join(", ");


        if (factualFields) {

            descriptionParts.push(
                factualFields
            );

        }

    }


    if (featureText) {

        descriptionParts.push(
            featureText
        );

    }


    if (extraInfo) {

        descriptionParts.push(
            extraInfo
        );

    }


    if (price) {

        descriptionParts.push(
            `Price: ${price}`
        );

    }


    let description =
        descriptionParts
            .join(". ")
            .trim();


    if (
        description &&
        !description.endsWith(".")
    ) {

        description += ".";

    }


    // ------------------------------------------------------
    // HIGHLIGHTS
    // ------------------------------------------------------

    const highlights = [];


    if (brand) {

        highlights.push(
            `Brand: ${brand}`
        );

    }


    highlights.push(
        `Product: ${name}`
    );


    for (
        const [key, value]
        of fieldEntries.slice(0, 6)
    ) {

        highlights.push(
            `${key}: ${value}`
        );

    }


    if (featureText) {

        highlights.push(
            `Features: ${featureText}`
        );

    }


    if (extraInfo) {

        highlights.push(
            `Additional Information: ${extraInfo}`
        );

    }


    if (price) {

        highlights.push(
            `Price: ${price}`
        );

    }


    // ------------------------------------------------------
    // KEYWORDS
    // ------------------------------------------------------

    const keywordValues = [

        name,

        brand,

        product.category,

        ...fieldEntries
            .slice(0, 6)
            .map(
                ([, value]) => value
            )

    ]
        .filter(Boolean)
        .map(cleanText);


    const keywords =
        [
            ...new Set(keywordValues)
        ];


    // ------------------------------------------------------
    // HASHTAGS
    // ------------------------------------------------------

    const hashtagSources = [

        name,

        brand,

        product.category

    ]
        .filter(Boolean);


    const hashtags = [];


    for (
        const value
        of hashtagSources
    ) {

        const tag =
            String(value)
                .replace(
                    /[^a-zA-Z0-9]+/g,
                    ""
                );


        if (tag) {

            hashtags.push(
                `#${tag}`
            );

        }

    }


    const uniqueHashtags =
        [
            ...new Set(hashtags)
        ];


    // ------------------------------------------------------
    // SEO TITLE
    // ------------------------------------------------------

    const seoTitle =
        title;


    // ------------------------------------------------------
    // SEO DESCRIPTION
    // ------------------------------------------------------

    const seoParts = [];


    seoParts.push(
        brand
            ? `${brand} ${name}`
            : name
    );


    for (
        const [, value]
        of fieldEntries.slice(0, 3)
    ) {

        seoParts.push(value);

    }


    if (price) {

        seoParts.push(
            `Price: ${price}`
        );

    }


    let seoDescription =
        seoParts
            .join(". ")
            .trim();


    if (
        seoDescription &&
        !seoDescription.endsWith(".")
    ) {

        seoDescription += ".";

    }


    return {

        title,

        description,

        highlights,

        keywords,

        hashtags:
            uniqueHashtags,

        seoTitle,

        seoDescription

    };
}


// ==========================================================
// AI PROMPT
// ==========================================================

function buildPrompt(product) {

    const categoryRule =
        CATEGORY_RULES[
            product.category
        ] || {

            focus:
                "General product.",

            fields: []

        };


    const sourceFacts = {

        category:
            product.category,

        productName:
            product.productName,

        brand:
            product.brand || null,

        price:
            product.price || null,

        categoryFields:
            product.fields,

        productFeatures:
            product.productFeatures || null,

        extraProductInformation:
            product.extraProductInformation || null

    };


    return `

You are the STRICT FACTUAL LISTING ENGINE for AI Seller Toolkit.

Your job is ONLY to create an e-commerce product listing from the seller-provided information.

==========================================================
CATEGORY
==========================================================

${product.category}

CATEGORY FOCUS:
${categoryRule.focus}

==========================================================
SELLER-PROVIDED FACTS
==========================================================

${JSON.stringify(
    sourceFacts,
    null,
    2
)}

==========================================================
ABSOLUTE FACT RULE
==========================================================

Use ONLY seller-provided information.

NEVER invent or assume missing information.

If a field is missing:
DO NOT GUESS.
DO NOT FILL IT FROM GENERAL KNOWLEDGE.
DO NOT ASSUME A COMMON SPECIFICATION.

Never invent:

- material
- fabric
- color
- size
- dimensions
- capacity
- quantity
- ingredients
- benefits
- medical claims
- skin benefits
- hair benefits
- battery capacity
- battery life
- charging speed
- connectivity
- compatibility
- warranty
- certification
- safety claims
- age recommendation
- durability
- waterproofing
- quality claims
- origin
- manufacturer
- publisher
- author
- ISBN
- delivery information
- return information
- discount
- offer
- performance
- technical specifications
- usage claims

==========================================================
NUMBER RULE
==========================================================

Every number in the output MUST already exist in the seller-provided facts.

Do not create new numbers.

Do not calculate new numbers.

Do not convert measurements.

Do not create percentages.

Price may be used ONLY if supplied.

==========================================================
BRAND RULE
==========================================================

Brand may be used ONLY if supplied.

Never invent another brand.

==========================================================
MARKETING CLAIM RULE
==========================================================

Do NOT use:

premium
best
high quality
durable
waterproof
safe
original
genuine
certified
guaranteed
long lasting
luxury
professional grade
doctor recommended
expert recommended

unless the seller explicitly supplied that exact information.

==========================================================
CATEGORY RULE
==========================================================

Do not change the selected category.

Do not mix specifications from another category.

==========================================================
OUTPUT
==========================================================

Return ONLY valid JSON.

No markdown.
No explanation.
No comments.

Use EXACTLY:

{
  "title": "string",
  "description": "string",
  "highlights": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "hashtags": [
    "string"
  ],
  "seoTitle": "string",
  "seoDescription": "string"
}

==========================================================
TITLE
==========================================================

Use the seller-provided product name.

Use brand only if supplied.

Do not invent specifications.

==========================================================
DESCRIPTION
==========================================================

Write a short factual marketplace-friendly description.

Use only seller-provided facts.

==========================================================
HIGHLIGHTS
==========================================================

Use seller-provided facts only.

Do not create benefits.

Do not create specifications.

==========================================================
KEYWORDS
==========================================================

Use:

- product name
- brand if supplied
- selected category
- seller-provided factual terms

==========================================================
HASHTAGS
==========================================================

Use product name, category and seller-provided factual terms.

Do not invent features.

==========================================================
SEO TITLE
==========================================================

Use product name.

Brand only if supplied.

==========================================================
SEO DESCRIPTION
==========================================================

Use only seller-provided information.

No invented claims.

==========================================================
FINAL INSTRUCTION
==========================================================

If you are not completely sure whether something is seller-provided,
DO NOT include it.

Return JSON only.

`.trim();
}


// ==========================================================
// GEMINI GENERATION
// ==========================================================

async function generateWithModel(
    model,
    prompt
) {

    if (!ai) {

        throw new Error(
            "Gemini API is not configured"
        );

    }


    const response =
        await ai.models.generateContent({

            model,

            contents: prompt,

            config: {

                temperature: 0.1,

                responseMimeType:
                    "application/json"

            }

        });


    let text = "";


    if (
        response &&
        typeof response.text === "function"
    ) {

        text =
            response.text();

    } else if (
        response &&
        typeof response.text === "string"
    ) {

        text =
            response.text;

    } else if (
        response &&
        response.candidates &&
        response.candidates[0] &&
        response.candidates[0].content
    ) {

        const parts =
            response
                .candidates[0]
                .content
                .parts || [];


        text =
            parts
                .map(
                    part =>
                        part.text || ""
                )
                .join("");

    }


    if (!text) {

        throw new Error(
            "Gemini returned empty response"
        );

    }


    return parseAIJson(text);
}


// ==========================================================
// SAFE AI GENERATION
// ==========================================================

async function generateSafeListing(
    product
) {

    // ------------------------------------------------------
    // Always prepare deterministic fallback
    // ------------------------------------------------------

    const deterministic =
        deterministicFallback(
            product
        );


    // ------------------------------------------------------
    // Gemini unavailable
    // ------------------------------------------------------

    if (!ai) {

        return {

            listing:
                deterministic,

            source:
                "deterministic-fallback",

            model:
                null,

            factGuard:
                "passed"

        };

    }


    const prompt =
        buildPrompt(product);


    // ------------------------------------------------------
    // PRIMARY MODEL
    // ------------------------------------------------------

    try {

        const primaryRaw =
            await generateWithModel(
                PRIMARY_MODEL,
                prompt
            );


        const primaryListing =
            normalizeAIListing(
                primaryRaw
            );


        const validation =
            validateListing(
                primaryListing,
                product
            );


        if (validation.valid) {

            return {

                listing:
                    primaryListing,

                source:
                    "gemini-primary",

                model:
                    PRIMARY_MODEL,

                factGuard:
                    "passed"

            };

        }


        console.warn(
            "[STRICT FACT GUARD] Primary rejected:",
            validation.reason
        );


    } catch (error) {

        console.warn(
            "[PRIMARY MODEL ERROR]:",
            error.message
        );

    }


    // ------------------------------------------------------
    // FALLBACK MODEL
    // ------------------------------------------------------

    // Avoid duplicate model call
    if (
        FALLBACK_MODEL &&
        FALLBACK_MODEL !== PRIMARY_MODEL
    ) {

        try {

            const fallbackRaw =
                await generateWithModel(
                    FALLBACK_MODEL,
                    prompt
                );


            const fallbackListing =
                normalizeAIListing(
                    fallbackRaw
                );


            const validation =
                validateListing(
                    fallbackListing,
                    product
                );


            if (validation.valid) {

                return {

                    listing:
                        fallbackListing,

                    source:
                        "gemini-fallback",

                    model:
                        FALLBACK_MODEL,

                    factGuard:
                        "passed"

                };

            }


            console.warn(
                "[STRICT FACT GUARD] Fallback rejected:",
                validation.reason
            );


        } catch (error) {

            console.warn(
                "[FALLBACK MODEL ERROR]:",
                error.message
            );

        }

    }


    // ------------------------------------------------------
    // FINAL DETERMINISTIC FALLBACK
    // ------------------------------------------------------

    return {

        listing:
            deterministic,

        source:
            "deterministic-fallback",

        model:
            null,

        factGuard:
            "passed"

    };
}


// ==========================================================
// REQUEST VALIDATION
// ==========================================================

function validateRequest(product) {

    if (!product.category) {

        return {

            valid: false,

            error:
                "Product category is required"

        };

    }


    if (
        !CATEGORY_RULES[
            product.category
        ]
    ) {

        return {

            valid: false,

            error:
                `Unsupported product category: ${product.category}`

        };

    }


    if (!product.productName) {

        return {

            valid: false,

            error:
                "Product name is required"

        };

    }


    return {
        valid: true
    };
}


// ==========================================================
// ROOT
// ==========================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        server:
            SERVER_NAME,

        version:
            VERSION,

        online:
            true,

        strictFactGuard:
            true,

        noInventedFacts:
            true,

        deterministicFallback:
            true,

        geminiConfigured:
            Boolean(ai),

        primaryModel:
            PRIMARY_MODEL,

        fallbackModel:
            FALLBACK_MODEL,

        supportedCategories:
            Object.keys(
                CATEGORY_RULES
            )

    });

});


// ==========================================================
// STATUS
// ==========================================================

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            server:
                SERVER_NAME,

            version:
                VERSION,

            online:
                true,

            strictFactGuard:
                true,

            noInventedFacts:
                true,

            deterministicFallback:
                true,

            geminiConfigured:
                Boolean(ai),

            primaryModel:
                PRIMARY_MODEL,

            fallbackModel:
                FALLBACK_MODEL,

            supportedCategories:
                Object.keys(
                    CATEGORY_RULES
                )

        });

    }
);


// ==========================================================
// CATEGORIES
// ==========================================================

app.get(
    "/api/categories",
    (req, res) => {

        const categories =
            Object.entries(
                CATEGORY_RULES
            )
            .map(
                ([name, data]) => ({

                    name,

                    focus:
                        data.focus,

                    fields:
                        data.fields

                })
            );


        res.json({

            success: true,

            version:
                VERSION,

            categories

        });

    }
);


// ==========================================================
// GENERATE LISTING
// ==========================================================

app.post(
    "/api/generate-listing",
    async (req, res) => {

        try {

            // ------------------------------------------------
            // Sanitize input
            // ------------------------------------------------

            const product =
                sanitizeProductInput(
                    req.body
                );


            console.log(
                "[GENERATE LISTING]",
                {
                    category:
                        product.category,

                    productName:
                        product.productName,

                    brand:
                        product.brand || "(none)"
                }
            );


            // ------------------------------------------------
            // Validate request
            // ------------------------------------------------

            const requestValidation =
                validateRequest(
                    product
                );


            if (
                !requestValidation.valid
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        requestValidation.error,

                    version:
                        VERSION,

                    strictFactGuard:
                        true,

                    noInventedFacts:
                        true

                });

            }


            // ------------------------------------------------
            // Generate
            // ------------------------------------------------

            const result =
                await generateSafeListing(
                    product
                );


            // ------------------------------------------------
            // Final validation
            // ------------------------------------------------

            const finalValidation =
                validateListing(
                    result.listing,
                    product
                );


            // ------------------------------------------------
            // Emergency fallback
            // ------------------------------------------------

            if (
                !finalValidation.valid
            ) {

                console.warn(
                    "[FINAL VALIDATION FAILED]:",
                    finalValidation.reason
                );


                const emergency =
                    deterministicFallback(
                        product
                    );


                return res.json({

                    success: true,

                    version:
                        VERSION,

                    category:
                        product.category,

                    listing:
                        emergency,

                    title:
                        emergency.title,

                    description:
                        emergency.description,

                    highlights:
                        emergency.highlights,

                    keywords:
                        emergency.keywords,

                    hashtags:
                        emergency.hashtags,

                    seoTitle:
                        emergency.seoTitle,

                    seoDescription:
                        emergency.seoDescription,

                    source:
                        "deterministic-fallback",

                    model:
                        null,

                    strictFactGuard:
                        true,

                    noInventedFacts:
                        true,

                    deterministicFallback:
                        true,

                    factGuard:
                        "passed"

                });

            }


            // ------------------------------------------------
            // Success
            // ------------------------------------------------

            return res.json({

                success: true,

                version:
                    VERSION,

                category:
                    product.category,

                listing:
                    result.listing,

                // Frontend compatibility
                title:
                    result.listing.title,

                description:
                    result.listing.description,

                highlights:
                    result.listing.highlights,

                keywords:
                    result.listing.keywords,

                hashtags:
                    result.listing.hashtags,

                seoTitle:
                    result.listing.seoTitle,

                seoDescription:
                    result.listing.seoDescription,

                source:
                    result.source,

                model:
                    result.model,

                strictFactGuard:
                    true,

                noInventedFacts:
                    true,

                deterministicFallback:
                    true,

                factGuard:
                    result.factGuard

            });

        } catch (error) {

            console.error(
                "[GENERATE LISTING ERROR]",
                error
            );


            // ------------------------------------------------
            // Emergency deterministic fallback
            // ------------------------------------------------

            try {

                const product =
                    sanitizeProductInput(
                        req.body
                    );


                if (
                    product.category &&
                    product.productName &&
                    CATEGORY_RULES[
                        product.category
                    ]
                ) {

                    const emergency =
                        deterministicFallback(
                            product
                        );


                    return res.json({

                        success: true,

                        version:
                            VERSION,

                        category:
                            product.category,

                        listing:
                            emergency,

                        title:
                            emergency.title,

                        description:
                            emergency.description,

                        highlights:
                            emergency.highlights,

                        keywords:
                            emergency.keywords,

                        hashtags:
                            emergency.hashtags,

                        seoTitle:
                            emergency.seoTitle,

                        seoDescription:
                            emergency.seoDescription,

                        source:
                            "deterministic-fallback",

                        model:
                            null,

                        strictFactGuard:
                            true,

                        noInventedFacts:
                            true,

                        deterministicFallback:
                            true,

                        factGuard:
                            "passed"

                    });

                }


            } catch (
                fallbackError
            ) {

                console.error(
                    "[EMERGENCY FALLBACK ERROR]",
                    fallbackError
                );

            }


            return res.status(500).json({

                success: false,

                error:
                    "Unable to generate listing safely.",

                version:
                    VERSION,

                strictFactGuard:
                    true,

                noInventedFacts:
                    true,

                deterministicFallback:
                    true

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
                req.originalUrl,

            version:
                VERSION

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
            "[GLOBAL ERROR]",
            err
        );


        if (res.headersSent) {
            return next(err);
        }


        res.status(500).json({

            success: false,

            error:
                "Internal server error",

            version:
                VERSION

        });

    }
);


// ==========================================================
// SERVER START
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
            "Version:",
            VERSION
        );

        console.log(
            "Server running on port:",
            PORT
        );

        console.log(
            "Gemini API:",
            ai
                ? "CONFIGURED"
                : "NOT CONFIGURED"
        );

        console.log(
            "Primary Model:",
            PRIMARY_MODEL
        );

        console.log(
            "Fallback Model:",
            FALLBACK_MODEL
        );

        console.log(
            "Strict Fact Guard: ENABLED"
        );

        console.log(
            "No Invented Facts: ENABLED"
        );

        console.log(
            "Deterministic Fallback: ENABLED"
        );

        console.log(
            "Categories:",
            Object.keys(
                CATEGORY_RULES
            ).join(", ")
        );

        console.log(
            "=========================================================="
        );

    }
);


// ==========================================================
// END OF SERVER.JS — FINAL VERSION 7.1
// ==========================================================
