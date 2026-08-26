// ==========================================================
// AI SELLER TOOLKIT
// SERVER.JS — VERSION 6.1
// STRICT FACT GUARD
// CATEGORY-AWARE
// NO INVENTED PRODUCT FACTS
// GEMINI PRIMARY + FALLBACK
// SAFE DETERMINISTIC FALLBACK
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { GoogleGenAI } = require("@google/genai");

const app = express();


// ==========================================================
// BASIC CONFIG
// ==========================================================

const PORT = process.env.PORT || 10000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const PRIMARY_MODEL =
    process.env.GEMINI_MODEL || "gemini-3.6-flash";

const FALLBACK_MODEL =
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";


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
// MIDDLEWARE
// ==========================================================

app.use(cors());

app.use(express.json({
    limit: "1mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "1mb"
}));


// ==========================================================
// CATEGORY DEFINITIONS
// ==========================================================

const categoryRules = {

    "Fashion": {
        fields: [
            "fabric",
            "material",
            "color",
            "size",
            "pattern",
            "fit",
            "occasion",
            "quantity"
        ]
    },

    "Beauty": {
        fields: [
            "form",
            "texture",
            "color",
            "quantity",
            "variant",
            "ingredients",
            "skinType",
            "hairType",
            "fragrance"
        ]
    },

    "Electronics": {
        fields: [
            "material",
            "color",
            "connectivity",
            "compatibility",
            "battery",
            "power",
            "warranty",
            "quantity"
        ]
    },

    "Home & Kitchen": {
        fields: [
            "material",
            "color",
            "size",
            "capacity",
            "quantity",
            "usage"
        ]
    },

    "Shoes": {
        fields: [
            "material",
            "color",
            "size",
            "sole",
            "closure",
            "occasion",
            "quantity"
        ]
    },

    "Jewellery": {
        fields: [
            "material",
            "color",
            "size",
            "design",
            "occasion",
            "quantity"
        ]
    },

    "Toys": {
        fields: [
            "material",
            "color",
            "size",
            "pattern",
            "fit",
            "occasion",
            "quantity"
        ]
    },

    "Books": {
        fields: [
            "author",
            "language",
            "format",
            "pages",
            "publisher",
            "edition",
            "isbn"
        ]
    },

    "Pet": {
        fields: [
            "petType",
            "material",
            "color",
            "size",
            "quantity",
            "ingredients",
            "flavour"
        ]
    },

    "Sports": {
        fields: [
            "material",
            "color",
            "size",
            "weight",
            "activity",
            "quantity"
        ]
    },

    "Automotive": {
        fields: [
            "material",
            "color",
            "vehicleType",
            "compatibility",
            "size",
            "quantity"
        ]
    },

    "Garden": {
        fields: [
            "material",
            "color",
            "size",
            "usage",
            "quantity"
        ]
    },

    "Food": {
        fields: [
            "flavour",
            "ingredients",
            "quantity",
            "variant",
            "packSize"
        ]
    },

    "Gifts": {
        fields: [
            "material",
            "color",
            "design",
            "quantity",
            "occasion",
            "recipient",
            "packaging"
        ]
    }

};


// ==========================================================
// CATEGORY ALIASES
// ==========================================================

const categoryAliases = {

    "fashion": "Fashion",
    "fashion & clothing": "Fashion",
    "clothing": "Fashion",

    "beauty": "Beauty",

    "electronics": "Electronics",
    "electronic": "Electronics",

    "home & kitchen": "Home & Kitchen",
    "home and kitchen": "Home & Kitchen",
    "home": "Home & Kitchen",
    "kitchen": "Home & Kitchen",

    "shoes": "Shoes",
    "footwear": "Shoes",

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
    "automobile": "Automotive",
    "car": "Automotive",

    "garden": "Garden",
    "gardening": "Garden",

    "food": "Food",

    "gifts": "Gifts",
    "gift": "Gifts"
};


// ==========================================================
// NORMALIZE CATEGORY
// ==========================================================

function normalizeCategory(category) {

    if (!category) {
        return "";
    }

    let value = String(category)
        .trim()
        .toLowerCase();

    // Remove common emojis
    value = value.replace(
        /[\u{1F300}-\u{1FAFF}]/gu,
        ""
    );

    value = value
        .replace(/\s+/g, " ")
        .trim();

    return categoryAliases[value] || "";
}


// ==========================================================
// SAFE STRING
// ==========================================================

function cleanValue(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .replace(/\s+/g, " ")
        .trim();
}


// ==========================================================
// HTML / CONTROL CHARACTER CLEANING
// ==========================================================

function cleanText(value) {

    return cleanValue(value)
        .replace(/<[^>]*>/g, "")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .trim();
}


// ==========================================================
// PRICE CLEANER
// ==========================================================

function cleanPrice(value) {

    const price = cleanText(value);

    if (!price) {
        return "";
    }

    return price;
}


// ==========================================================
// GET FIRST NON EMPTY VALUE
// ==========================================================

function firstValue(...values) {

    for (const value of values) {

        const cleaned = cleanText(value);

        if (cleaned) {
            return cleaned;
        }
    }

    return "";
}


// ==========================================================
// REQUEST DATA NORMALIZER
// ==========================================================

function normalizeProductData(body) {

    const category = normalizeCategory(
        body.category ||
        body.productCategory ||
        body.categoryName
    );

    const productName = firstValue(
        body.productName,
        body.name,
        body.title
    );

    const data = {

        category,

        productName,

        brand: cleanText(body.brand),

        price: cleanPrice(body.price),

        // General fields
        material: cleanText(body.material),
        fabric: cleanText(body.fabric),
        color: cleanText(body.color),
        size: cleanText(body.size),
        quantity: cleanText(body.quantity),

        // Fashion
        pattern: cleanText(body.pattern),
        fit: cleanText(body.fit),
        occasion: cleanText(body.occasion),

        // Beauty
        form: cleanText(body.form),
        texture: cleanText(body.texture),
        variant: cleanText(body.variant),
        ingredients: cleanText(body.ingredients),
        skinType: cleanText(
            body.skinType ||
            body.skin_type
        ),
        hairType: cleanText(
            body.hairType ||
            body.hair_type
        ),
        fragrance: cleanText(body.fragrance),

        // Electronics
        connectivity: cleanText(body.connectivity),
        compatibility: cleanText(body.compatibility),
        battery: cleanText(body.battery),
        power: cleanText(body.power),
        warranty: cleanText(body.warranty),

        // Home
        capacity: cleanText(body.capacity),
        usage: cleanText(body.usage),

        // Shoes
        sole: cleanText(body.sole),
        closure: cleanText(body.closure),

        // Books
        author: cleanText(body.author),
        language: cleanText(body.language),
        format: cleanText(body.format),
        pages: cleanText(body.pages),
        publisher: cleanText(body.publisher),
        edition: cleanText(body.edition),
        isbn: cleanText(body.isbn),

        // Pet
        petType: cleanText(
            body.petType ||
            body.pet_type
        ),
        flavour: cleanText(
            body.flavour ||
            body.flavor
        ),

        // Sports
        weight: cleanText(body.weight),
        activity: cleanText(
            body.activity ||
            body.sport ||
            body.activitySport
        ),

        // Automotive
        vehicleType: cleanText(
            body.vehicleType ||
            body.vehicle_type
        ),

        // Garden
        // usage already handled

        // Food
        packSize: cleanText(
            body.packSize ||
            body.pack_size
        ),

        // Gifts
        design: cleanText(body.design),
        recipient: cleanText(body.recipient),
        packaging: cleanText(body.packaging),

        // User-provided free text
        productFeatures: cleanText(
            body.productFeatures ||
            body.features
        ),

        extraInformation: cleanText(
            body.extraProductInformation ||
            body.extraInformation ||
            body.description
        )
    };

    return data;
}


// ==========================================================
// VALIDATE REQUIRED INPUT
// ==========================================================

function validateInput(data) {

    const errors = [];

    if (!data.category) {
        errors.push("Product category is required.");
    }

    if (!data.productName) {
        errors.push("Product name is required.");
    }

    return errors;
}


// ==========================================================
// FACT SOURCE COLLECTION
// ==========================================================
//
// IMPORTANT:
// Every factual value used by the safe generator must come
// from this object.
//
// AI is NOT allowed to invent values outside this source.
// ==========================================================

function getKnownFacts(data) {

    const facts = {};

    const fields = [

        "productName",
        "brand",
        "price",

        "material",
        "fabric",
        "color",
        "size",
        "quantity",

        "pattern",
        "fit",
        "occasion",

        "form",
        "texture",
        "variant",
        "ingredients",
        "skinType",
        "hairType",
        "fragrance",

        "connectivity",
        "compatibility",
        "battery",
        "power",
        "warranty",

        "capacity",
        "usage",

        "sole",
        "closure",

        "author",
        "language",
        "format",
        "pages",
        "publisher",
        "edition",
        "isbn",

        "petType",
        "flavour",

        "weight",
        "activity",

        "vehicleType",

        "packSize",

        "design",
        "recipient",
        "packaging",

        "productFeatures",
        "extraInformation"
    ];

    for (const field of fields) {

        if (data[field]) {
            facts[field] = data[field];
        }
    }

    return facts;
}


// ==========================================================
// SAFE FACT VALUE ARRAY
// ==========================================================

function getFactValues(data) {

    const values = [];

    const facts = getKnownFacts(data);

    for (const key of Object.keys(facts)) {

        const value = facts[key];

        if (!value) {
            continue;
        }

        values.push(value);

        // Also split comma-separated user data
        value
            .split(",")
            .map(x => x.trim())
            .filter(Boolean)
            .forEach(x => values.push(x));
    }

    return [...new Set(values)];
}


// ==========================================================
// FACT CHECK HELPER
// ==========================================================
//
// This is intentionally conservative.
//
// If AI contains obvious unsupported product claims,
// validation fails.
// ==========================================================

function containsForbiddenClaim(text) {

    const value = cleanText(text).toLowerCase();

    const forbiddenPatterns = [

        /\bdurable\b/i,
        /\blong[- ]lasting\b/i,
        /\bpremium quality\b/i,
        /\bhigh quality\b/i,
        /\bwaterproof\b/i,
        /\bwater resistant\b/i,
        /\banti bacterial\b/i,
        /\bantibacterial\b/i,
        /\bskin friendly\b/i,
        /\bdermatologically tested\b/i,
        /\bclinically tested\b/i,
        /\bclinically proven\b/i,
        /\bdoctor recommended\b/i,
        /\bdoctor approved\b/i,
        /\bmedical grade\b/i,
        /\b100% safe\b/i,
        /\bsafe for\b/i,
        /\bguaranteed\b/i,
        /\bguarantee\b/i,
        /\bcertified\b/i,
        /\bcertification\b/i,
        /\beco friendly\b/i,
        /\beco-friendly\b/i,
        /\borganic\b/i,
        /\bnatural\b/i,
        /\bnon toxic\b/i,
        /\bnon-toxic\b/i,
        /\bhealth benefit\b/i,
        /\bhealth benefits\b/i,
        /\bfitness benefits\b/i,
        /\bimproves\b/i,
        /\bprevents\b/i,
        /\bcures\b/i,
        /\btreats\b/i,
        /\bprotects\b/i,
        /\bwaterproof\b/i,
        /\bshockproof\b/i,
        /\bfast charging\b/i,
        /\bnoise cancellation\b/i,
        /\bbluetooth 5\b/i,
        /\bwireless charging\b/i
    ];

    return forbiddenPatterns.some(
        pattern => pattern.test(value)
    );
}


// ==========================================================
// UNWANTED AI CONTEXT CHECK
// ==========================================================

function containsUnsupportedContext(text, category) {

    const value = cleanText(text).toLowerCase();

    const patterns = [

        // Sports
        /\bsports and fitness activities\b/i,
        /\bfitness activities\b/i,
        /\bperfect for workouts\b/i,
        /\bideal for workouts\b/i,

        // Fashion
        /\bperfect for every occasion\b/i,
        /\badds elegance\b/i,
        /\bstylish look\b/i,

        // Beauty
        /\bglowing skin\b/i,
        /\byouthful skin\b/i,
        /\bhealthy skin\b/i,

        // Pet
        /\bkeeps your pet safe\b/i,
        /\bcomfortable for your pet\b/i,

        // General
        /\bperfect gift\b/i,
        /\bideal gift\b/i,
        /\bperfect choice\b/i,
        /\bideal choice\b/i
    ];

    return patterns.some(
        pattern => pattern.test(value)
    );
}


// ==========================================================
// BRAND / PUBLISHER GUARD
// ==========================================================

function hasBrandPublisherMixup(text, data) {

    if (
        data.category !== "Books" ||
        !data.brand ||
        !data.publisher
    ) {
        // If publisher is empty, brand must NEVER be
        // described as publisher.
        if (
            data.category === "Books" &&
            data.brand &&
            !data.publisher
        ) {

            const value = cleanText(text)
                .toLowerCase();

            const brand = cleanText(data.brand)
                .toLowerCase();

            if (
                value.includes(
                    `published by ${brand}`
                ) ||
                value.includes(
                    `publisher: ${brand}`
                )
            ) {
                return true;
            }
        }

        return false;
    }

    return false;
}


// ==========================================================
// AI OUTPUT VALIDATOR
// ==========================================================

function validateAIText(text, data) {

    if (!text) {
        return {
            valid: false,
            reason: "AI returned empty output."
        };
    }

    if (text.length > 12000) {
        return {
            valid: false,
            reason: "AI output is too long."
        };
    }

    if (containsForbiddenClaim(text)) {

        return {
            valid: false,
            reason: "Unsupported product claim detected."
        };
    }

    if (
        containsUnsupportedContext(
            text,
            data.category
        )
    ) {

        return {
            valid: false,
            reason: "Unsupported category context detected."
        };
    }

    if (
        hasBrandPublisherMixup(
            text,
            data
        )
    ) {

        return {
            valid: false,
            reason: "Brand/Publisher factual mix-up detected."
        };
    }

    // Reject strange non-English / malformed hashtag
    // contamination such as accidental script words.
    const hashtagMatches =
        text.match(/#[^\s#]+/g) || [];

    for (const hashtag of hashtagMatches) {

        if (
            /[^\x00-\x7F]/.test(hashtag) &&
            !/[\u0900-\u097F]/.test(hashtag)
        ) {
            return {
                valid: false,
                reason: "Malformed hashtag detected."
            };
        }
    }

    return {
        valid: true
    };
}


// ==========================================================
// CATEGORY FIELD HELPERS
// ==========================================================

function addFact(lines, label, value) {

    if (!value) {
        return;
    }

    lines.push(
        `• ${label}: ${value}`
    );
}


// ==========================================================
// SAFE DESCRIPTION FACTS
// ==========================================================

function collectDescriptionFacts(data) {

    const parts = [];

    if (data.brand) {
        parts.push(data.brand);
    }

    if (data.productName) {
        parts.push(data.productName);
    }

    if (data.color) {
        parts.push(`in ${data.color}`);
    }

    if (data.material) {
        parts.push(`made of ${data.material}`);
    }

    if (data.fabric) {
        parts.push(`made of ${data.fabric}`);
    }

    if (data.size) {
        parts.push(`size ${data.size}`);
    }

    if (data.capacity) {
        parts.push(`capacity ${data.capacity}`);
    }

    if (data.quantity) {
        parts.push(`Quantity: ${data.quantity}`);
    }

    if (data.price) {
        parts.push(`Price: ${data.price}`);
    }

    return parts;
}


// ==========================================================
// SAFE TITLE GENERATOR
// ==========================================================
//
// IMPORTANT:
// This does NOT use AI.
// It uses ONLY supplied values.
// ==========================================================

function generateSafeTitle(data) {

    const parts = [];

    if (data.brand) {
        parts.push(data.brand);
    }

    if (data.productName) {
        parts.push(data.productName);
    }

    const details = [];

    if (data.color) {
        details.push(data.color);
    }

    if (data.material) {
        details.push(data.material);
    }

    if (data.fabric) {
        details.push(data.fabric);
    }

    if (data.size) {
        details.push(data.size);
    }

    if (data.capacity) {
        details.push(data.capacity);
    }

    if (data.quantity) {
        details.push(data.quantity);
    }

    if (details.length) {

        return (
            parts.join(" ") +
            " - " +
            details.join(", ")
        );
    }

    return parts.join(" ");
}


// ==========================================================
// SAFE DESCRIPTION GENERATOR
// ==========================================================

function generateSafeDescription(data) {

    const title = generateSafeTitle(data);

    let description = title || data.productName;

    const sentences = [];

    if (title) {
        sentences.push(title + ".");
    }

    // Category-specific factual fields
    switch (data.category) {

        case "Fashion":

            if (data.pattern) {
                sentences.push(
                    `Pattern: ${data.pattern}.`
                );
            }

            if (data.fit) {
                sentences.push(
                    `Fit: ${data.fit}.`
                );
            }

            if (data.occasion) {
                sentences.push(
                    `Occasion: ${data.occasion}.`
                );
            }

            break;


        case "Beauty":

            if (data.form) {
                sentences.push(
                    `Form: ${data.form}.`
                );
            }

            if (data.texture) {
                sentences.push(
                    `Texture: ${data.texture}.`
                );
            }

            if (data.variant) {
                sentences.push(
                    `Variant: ${data.variant}.`
                );
            }

            if (data.ingredients) {
                sentences.push(
                    `Ingredients: ${data.ingredients}.`
                );
            }

            if (data.skinType) {
                sentences.push(
                    `Skin Type: ${data.skinType}.`
                );
            }

            if (data.hairType) {
                sentences.push(
                    `Hair Type: ${data.hairType}.`
                );
            }

            if (data.fragrance) {
                sentences.push(
                    `Fragrance: ${data.fragrance}.`
                );
            }

            break;


        case "Electronics":

            if (data.connectivity) {
                sentences.push(
                    `Connectivity: ${data.connectivity}.`
                );
            }

            if (data.compatibility) {
                sentences.push(
                    `Compatibility: ${data.compatibility}.`
                );
            }

            if (data.battery) {
                sentences.push(
                    `Battery: ${data.battery}.`
                );
            }

            if (data.power) {
                sentences.push(
                    `Power: ${data.power}.`
                );
            }

            if (data.warranty) {
                sentences.push(
                    `Warranty: ${data.warranty}.`
                );
            }

            break;


        case "Home & Kitchen":

            if (data.capacity) {
                sentences.push(
                    `Capacity: ${data.capacity}.`
                );
            }

            if (data.usage) {
                sentences.push(
                    `Usage: ${data.usage}.`
                );
            }

            break;


        case "Shoes":

            if (data.sole) {
                sentences.push(
                    `Sole: ${data.sole}.`
                );
            }

            if (data.closure) {
                sentences.push(
                    `Closure: ${data.closure}.`
                );
            }

            if (data.occasion) {
                sentences.push(
                    `Occasion: ${data.occasion}.`
                );
            }

            break;


        case "Jewellery":

            if (data.design) {
                sentences.push(
                    `Design: ${data.design}.`
                );
            }

            if (data.occasion) {
                sentences.push(
                    `Occasion: ${data.occasion}.`
                );
            }

            break;


        case "Toys":

            if (data.pattern) {
                sentences.push(
                    `Pattern: ${data.pattern}.`
                );
            }

            if (data.occasion) {
                sentences.push(
                    `Occasion: ${data.occasion}.`
                );
            }

            break;


        case "Books":

            if (data.author) {
                sentences.push(
                    `Author: ${data.author}.`
                );
            }

            if (data.language) {
                sentences.push(
                    `Language: ${data.language}.`
                );
            }

            if (data.format) {
                sentences.push(
                    `Format: ${data.format}.`
                );
            }

            if (data.pages) {
                sentences.push(
                    `Pages: ${data.pages}.`
                );
            }

            // Publisher ONLY if publisher was supplied.
            if (data.publisher) {
                sentences.push(
                    `Publisher: ${data.publisher}.`
                );
            }

            if (data.edition) {
                sentences.push(
                    `Edition: ${data.edition}.`
                );
            }

            if (data.isbn) {
                sentences.push(
                    `ISBN: ${data.isbn}.`
                );
            }

            break;


        case "Pet":

            if (data.petType) {
                sentences.push(
                    `Pet Type: ${data.petType}.`
                );
            }

            break;


        case "Sports":

            if (data.weight) {
                sentences.push(
                    `Weight: ${data.weight}.`
                );
            }

            if (data.activity) {
                sentences.push(
                    `Activity/Sport: ${data.activity}.`
                );
            }

            break;


        case "Automotive":

            if (data.vehicleType) {
                sentences.push(
                    `Vehicle Type: ${data.vehicleType}.`
                );
            }

            if (data.compatibility) {
                sentences.push(
                    `Compatibility: ${data.compatibility}.`
                );
            }

            break;


        case "Garden":

            if (data.usage) {
                sentences.push(
                    `Usage: ${data.usage}.`
                );
            }

            break;


        case "Food":

            if (data.flavour) {
                sentences.push(
                    `Flavour: ${data.flavour}.`
                );
            }

            if (data.ingredients) {
                sentences.push(
                    `Ingredients: ${data.ingredients}.`
                );
            }

            if (data.variant) {
                sentences.push(
                    `Variant: ${data.variant}.`
                );
            }

            if (data.packSize) {
                sentences.push(
                    `Pack Size: ${data.packSize}.`
                );
            }

            break;


        case "Gifts":

            if (data.design) {
                sentences.push(
                    `Design: ${data.design}.`
                );
            }

            if (data.occasion) {
                sentences.push(
                    `Occasion: ${data.occasion}.`
                );
            }

            if (data.recipient) {
                sentences.push(
                    `Recipient: ${data.recipient}.`
                );
            }

            if (data.packaging) {
                sentences.push(
                    `Packaging: ${data.packaging}.`
                );
            }

            break;
    }


    if (data.productFeatures) {

        sentences.push(
            `Features: ${data.productFeatures}.`
        );
    }


    if (data.quantity) {

        // Avoid duplicate quantity if already added
        const exists = sentences.some(
            x =>
                x.toLowerCase()
                    .includes(
                        `quantity: ${data.quantity}`.toLowerCase()
                    )
        );

        if (!exists) {
            sentences.push(
                `Quantity: ${data.quantity}.`
            );
        }
    }


    if (data.price) {

        sentences.push(
            `Price: ${data.price}.`
        );
    }


    description = sentences.join(" ");

    return description;
}


// ==========================================================
// SAFE HIGHLIGHTS
// ==========================================================

function generateSafeHighlights(data) {

    const highlights = [];

    addFact(
        highlights,
        "Brand",
        data.brand
    );

    switch (data.category) {

        case "Fashion":

            addFact(
                highlights,
                "Fabric",
                data.fabric
            );

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Size",
                data.size
            );

            addFact(
                highlights,
                "Pattern",
                data.pattern
            );

            addFact(
                highlights,
                "Fit",
                data.fit
            );

            addFact(
                highlights,
                "Occasion",
                data.occasion
            );

            break;


        case "Beauty":

            addFact(
                highlights,
                "Product",
                data.productName
            );

            addFact(
                highlights,
                "Form",
                data.form
            );

            addFact(
                highlights,
                "Texture",
                data.texture
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Quantity",
                data.quantity
            );

            addFact(
                highlights,
                "Variant",
                data.variant
            );

            break;


        case "Electronics":

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Connectivity",
                data.connectivity
            );

            addFact(
                highlights,
                "Compatibility",
                data.compatibility
            );

            addFact(
                highlights,
                "Battery",
                data.battery
            );

            break;


        case "Home & Kitchen":

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Capacity",
                data.capacity
            );

            addFact(
                highlights,
                "Size",
                data.size
            );

            break;


        case "Shoes":

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Size",
                data.size
            );

            addFact(
                highlights,
                "Sole",
                data.sole
            );

            addFact(
                highlights,
                "Closure",
                data.closure
            );

            break;


        case "Jewellery":

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Size",
                data.size
            );

            addFact(
                highlights,
                "Design",
                data.design
            );

            break;


        case "Toys":

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Size",
                data.size
            );

            addFact(
                highlights,
                "Pattern",
                data.pattern
            );

            break;


        case "Books":

            addFact(
                highlights,
                "Author",
                data.author
            );

            addFact(
                highlights,
                "Brand",
                data.brand
            );

            addFact(
                highlights,
                "Language",
                data.language
            );

            addFact(
                highlights,
                "Format",
                data.format
            );

            addFact(
                highlights,
                "Pages",
                data.pages
            );

            addFact(
                highlights,
                "Publisher",
                data.publisher
            );

            addFact(
                highlights,
                "Edition",
                data.edition
            );

            addFact(
                highlights,
                "ISBN",
                data.isbn
            );

            break;


        case "Pet":

            addFact(
                highlights,
                "Pet Type",
                data.petType
            );

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Size",
                data.size
            );

            break;


        case "Sports":

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Size",
                data.size
            );

            addFact(
                highlights,
                "Weight",
                data.weight
            );

            addFact(
                highlights,
                "Activity/Sport",
                data.activity
            );

            break;


        case "Automotive":

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Vehicle Type",
                data.vehicleType
            );

            addFact(
                highlights,
                "Compatibility",
                data.compatibility
            );

            break;


        case "Garden":

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Size",
                data.size
            );

            addFact(
                highlights,
                "Usage",
                data.usage
            );

            break;


        case "Food":

            addFact(
                highlights,
                "Flavour",
                data.flavour
            );

            addFact(
                highlights,
                "Ingredients",
                data.ingredients
            );

            addFact(
                highlights,
                "Variant",
                data.variant
            );

            addFact(
                highlights,
                "Pack Size",
                data.packSize
            );

            break;


        case "Gifts":

            addFact(
                highlights,
                "Material",
                data.material
            );

            addFact(
                highlights,
                "Color",
                data.color
            );

            addFact(
                highlights,
                "Design",
                data.design
            );

            addFact(
                highlights,
                "Occasion",
                data.occasion
            );

            addFact(
                highlights,
                "Recipient",
                data.recipient
            );

            addFact(
                highlights,
                "Packaging",
                data.packaging
            );

            break;
    }


    if (data.productFeatures) {

        addFact(
            highlights,
            "Feature",
            data.productFeatures
        );
    }


    addFact(
        highlights,
        "Quantity",
        data.quantity
    );

    addFact(
        highlights,
        "Price",
        data.price
    );


    // Remove duplicates
    return [
        ...new Set(highlights)
    ];
}


// ==========================================================
// SAFE KEYWORDS
// ==========================================================

function generateSafeKeywords(data) {

    const keywords = [];

    const add = value => {

        if (!value) {
            return;
        }

        value
            .split(",")
            .map(x => x.trim())
            .filter(Boolean)
            .forEach(x => {

                if (
                    !keywords
                        .map(k => k.toLowerCase())
                        .includes(x.toLowerCase())
                ) {
                    keywords.push(x);
                }
            });
    };


    add(data.brand);
    add(data.productName);

    if (data.color) {
        add(`${data.color} ${data.productName}`);
    }

    if (data.material) {
        add(`${data.material} ${data.productName}`);
    }

    if (data.fabric) {
        add(`${data.fabric} ${data.productName}`);
    }

    if (data.size) {
        add(`${data.size} ${data.productName}`);
    }

    if (data.capacity) {
        add(`${data.capacity} ${data.productName}`);
    }

    if (data.category) {
        add(data.category);
    }

    if (data.productFeatures) {
        add(data.productFeatures);
    }


    return keywords
        .slice(0, 10)
        .join(", ");
}


// ==========================================================
// SAFE HASHTAGS
// ==========================================================

function makeHashtag(value) {

    if (!value) {
        return "";
    }

    let text = cleanText(value);

    text = text
        .replace(/[^a-zA-Z0-9\u0900-\u097F]+/g, "")
        .trim();

    if (!text) {
        return "";
    }

    return "#" + text;
}


function generateSafeHashtags(data) {

    const values = [];

    const add = value => {

        if (!value) {
            return;
        }

        const tag = makeHashtag(value);

        if (
            tag &&
            !values
                .map(x => x.toLowerCase())
                .includes(tag.toLowerCase())
        ) {
            values.push(tag);
        }
    };


    add(data.brand);
    add(data.productName);

    if (data.material) {
        add(data.material);
    }

    if (data.color) {
        add(data.color);
    }

    if (data.category) {
        add(data.category);
    }

    return values
        .slice(0, 8)
        .join(" ");
}


// ==========================================================
// SAFE SEO TITLE
// ==========================================================

function generateSafeSeoTitle(data) {

    const title = generateSafeTitle(data);

    if (!title) {
        return data.productName;
    }

    return title;
}


// ==========================================================
// SAFE SEO DESCRIPTION
// ==========================================================

function generateSafeSeoDescription(data) {

    const description =
        generateSafeDescription(data);

    return description;
}


// ==========================================================
// SAFE LISTING GENERATOR
// ==========================================================

function generateSafeListing(data) {

    const title =
        generateSafeTitle(data);

    const description =
        generateSafeDescription(data);

    const highlights =
        generateSafeHighlights(data);

    const keywords =
        generateSafeKeywords(data);

    const hashtags =
        generateSafeHashtags(data);

    const seoTitle =
        generateSafeSeoTitle(data);

    const seoDescription =
        generateSafeSeoDescription(data);


    return {

        title,

        description,

        highlights,

        keywords,

        hashtags,

        seoTitle,

        seoDescription,

        category: data.category,

        factualGuard: true,

        generatedFromUserFactsOnly: true
    };
}


// ==========================================================
// GEMINI PROMPT
// ==========================================================
//
// Gemini is now instructed extremely strictly.
// The final safe generator still exists as a server-side
// protection.
// ==========================================================

function buildGeminiPrompt(data) {

    const facts = getKnownFacts(data);

    return `
You are the factual product listing assistant for AI Seller Toolkit.

STRICT RULE:
You MUST NOT invent, assume, infer, estimate, guess, or add ANY product fact.

Use ONLY facts explicitly present in the USER DATA below.

USER DATA:
${JSON.stringify(facts, null, 2)}

CATEGORY:
${data.category}

ABSOLUTE RULES:

1. Never invent a missing field.
2. Never convert one field into another field.
3. Brand is NOT Publisher unless Publisher is explicitly provided.
4. Product name is NOT a specification.
5. Category is NOT a product feature.
6. Do not add warranty unless provided.
7. Do not add certification unless provided.
8. Do not add durability claims unless provided.
9. Do not add health, medical, safety or performance claims.
10. Do not add use cases merely because of the category.
11. Do not add dimensions, weight, capacity or compatibility unless supplied.
12. Do not add ingredients unless supplied.
13. Do not add flavour unless supplied.
14. Do not add age recommendations unless supplied.
15. Do not add gender unless supplied.
16. Do not add country of origin unless supplied.
17. Do not add material unless supplied.
18. Do not add color unless supplied.
19. Do not add features unless supplied.
20. Do not create facts from common knowledge.
21. If a field is empty, omit it.
22. Do not write "perfect", "ideal", "premium", "durable" or similar unsupported claims.
23. Do not say "for sports and fitness activities" unless that exact fact/use is supplied.
24. Do not output malformed hashtags.
25. Do not output explanations outside the requested listing.

Return JSON only:

{
  "title": "...",
  "description": "...",
  "highlights": ["..."],
  "keywords": ["..."],
  "hashtags": ["..."],
  "seoTitle": "...",
  "seoDescription": "..."
}
`;
}


// ==========================================================
// GEMINI CALL
// ==========================================================

async function callGemini(model, data) {

    if (!ai) {
        throw new Error(
            "Gemini API is not configured."
        );
    }


    const prompt =
        buildGeminiPrompt(data);


    const response =
        await ai.models.generateContent({

            model,

            contents: prompt,

            config: {

                temperature: 0,

                responseMimeType:
                    "application/json",

                maxOutputTokens: 2500
            }
        });


    let text = "";

    if (response) {

        if (
            typeof response.text ===
            "function"
        ) {
            text = response.text();
        }
        else if (
            typeof response.text ===
            "string"
        ) {
            text = response.text;
        }
        else if (
            response.candidates &&
            response.candidates[0] &&
            response.candidates[0].content
        ) {

            const parts =
                response.candidates[0]
                    .content.parts || [];

            text = parts
                .map(p => p.text || "")
                .join("");
        }
    }


    if (!text) {
        throw new Error(
            "Gemini returned empty response."
        );
    }


    // Remove accidental markdown fences
    text = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();


    let parsed;

    try {

        parsed = JSON.parse(text);

    }
    catch (error) {

        throw new Error(
            "Gemini returned invalid JSON."
        );
    }


    return parsed;
}


// ==========================================================
// GEMINI OUTPUT SANITIZER
// ==========================================================

function sanitizeGeminiListing(listing) {

    if (!listing) {
        return null;
    }

    return {

        title:
            cleanText(listing.title),

        description:
            cleanText(listing.description),

        highlights:
            Array.isArray(listing.highlights)
                ? listing.highlights
                    .map(cleanText)
                    .filter(Boolean)
                : [],

        keywords:
            Array.isArray(listing.keywords)
                ? listing.keywords
                    .map(cleanText)
                    .filter(Boolean)
                : [],

        hashtags:
            Array.isArray(listing.hashtags)
                ? listing.hashtags
                    .map(cleanText)
                    .filter(Boolean)
                : [],

        seoTitle:
            cleanText(listing.seoTitle),

        seoDescription:
            cleanText(listing.seoDescription)
    };
}


// ==========================================================
// GEMINI VALIDATION
// ==========================================================

function validateGeminiListing(listing, data) {

    const sections = [

        listing.title,

        listing.description,

        listing.seoTitle,

        listing.seoDescription,

        ...(listing.highlights || []),

        ...(listing.keywords || []),

        ...(listing.hashtags || [])
    ];


    for (const section of sections) {

        const result =
            validateAIText(
                section,
                data
            );

        if (!result.valid) {

            return result;
        }
    }


    // Important Books guard
    if (
        hasBrandPublisherMixup(
            sections.join(" "),
            data
        )
    ) {

        return {
            valid: false,
            reason:
                "Brand used as Publisher."
        };
    }


    return {
        valid: true
    };
}


// ==========================================================
// LISTING OBJECT NORMALIZER
// ==========================================================

function normalizeListingObject(listing) {

    return {

        title:
            cleanText(listing.title),

        description:
            cleanText(listing.description),

        highlights:
            Array.isArray(listing.highlights)
                ? listing.highlights
                : [],

        keywords:
            Array.isArray(listing.keywords)
                ? listing.keywords
                : [],

        hashtags:
            Array.isArray(listing.hashtags)
                ? listing.hashtags
                : [],

        seoTitle:
            cleanText(listing.seoTitle),

        seoDescription:
            cleanText(listing.seoDescription)
    };
}


// ==========================================================
// FORMAT LISTING FOR FRONTEND
// ==========================================================

function formatListingText(listing) {

    const highlights =
        Array.isArray(listing.highlights)
            ? listing.highlights
                .map(item => {

                    const text =
                        cleanText(item);

                    if (
                        text.startsWith("•")
                    ) {
                        return text;
                    }

                    return `• ${text}`;
                })
                .join("\n")
            : "";


    const keywords =
        Array.isArray(listing.keywords)
            ? listing.keywords.join(", ")
            : cleanText(listing.keywords);


    const hashtags =
        Array.isArray(listing.hashtags)
            ? listing.hashtags.join(" ")
            : cleanText(listing.hashtags);


    return `
TITLE

${listing.title}

DESCRIPTION

${listing.description}

HIGHLIGHTS

${highlights}

KEYWORDS

${keywords}

HASHTAGS

${hashtags}

SEO TITLE

${listing.seoTitle}

SEO DESCRIPTION

${listing.seoDescription}
`.trim();
}


// ==========================================================
// MAIN GENERATION ENGINE
// ==========================================================

async function generateListing(data) {

    // ------------------------------------------------------
    // FIRST: SAFE SERVER GENERATED LISTING
    // ------------------------------------------------------

    const safeListing =
        generateSafeListing(data);


    // ------------------------------------------------------
    // If Gemini unavailable, return safe listing
    // ------------------------------------------------------

    if (!ai) {

        return {

            listing:
                formatListingText(
                    safeListing
                ),

            data: safeListing,

            source: "safe-server-generator",

            factualGuard: true,

            generatedFromUserFactsOnly: true
        };
    }


    // ------------------------------------------------------
    // PRIMARY GEMINI
    // ------------------------------------------------------

    try {

        const aiResult =
            await callGemini(
                PRIMARY_MODEL,
                data
            );


        const cleaned =
            sanitizeGeminiListing(
                aiResult
            );


        const validation =
            validateGeminiListing(
                cleaned,
                data
            );


        if (validation.valid) {

            return {

                listing:
                    formatListingText(
                        cleaned
                    ),

                data: cleaned,

                source:
                    `gemini-primary:${PRIMARY_MODEL}`,

                factualGuard: true,

                generatedFromUserFactsOnly: true
            };
        }


        console.warn(
            "Primary Gemini output rejected:",
            validation.reason
        );

    }
    catch (error) {

        console.warn(
            "Primary Gemini failed:",
            error.message
        );
    }


    // ------------------------------------------------------
    // FALLBACK GEMINI
    // ------------------------------------------------------

    try {

        const fallbackResult =
            await callGemini(
                FALLBACK_MODEL,
                data
            );


        const cleaned =
            sanitizeGeminiListing(
                fallbackResult
            );


        const validation =
            validateGeminiListing(
                cleaned,
                data
            );


        if (validation.valid) {

            return {

                listing:
                    formatListingText(
                        cleaned
                    ),

                data: cleaned,

                source:
                    `gemini-fallback:${FALLBACK_MODEL}`,

                factualGuard: true,

                generatedFromUserFactsOnly: true
            };
        }


        console.warn(
            "Fallback Gemini output rejected:",
            validation.reason
        );

    }
    catch (error) {

        console.warn(
            "Fallback Gemini failed:",
            error.message
        );
    }


    // ------------------------------------------------------
    // FINAL SAFE FALLBACK
    // ------------------------------------------------------

    console.log(
        "Using deterministic safe listing."
    );


    return {

        listing:
            formatListingText(
                safeListing
            ),

        data: safeListing,

        source:
            "safe-server-generator",

        factualGuard: true,

        generatedFromUserFactsOnly: true
    };
}


// ==========================================================
// HOME / HEALTH CHECK
// ==========================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        server:
            "AI SELLER TOOLKIT BACKEND",

        version:
            "6.1",

        status:
            "online",

        model:
            PRIMARY_MODEL,

        fallbackModel:
            FALLBACK_MODEL,

        geminiConfigured:
            Boolean(GEMINI_API_KEY),

        strictFactGuard:
            true,

        noInventedFacts:
            true
    });
});


// ==========================================================
// STATUS API
// ==========================================================

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        server:
            "AI SELLER TOOLKIT BACKEND",

        version:
            "6.1",

        status:
            "online",

        model:
            PRIMARY_MODEL,

        fallbackModel:
            FALLBACK_MODEL,

        geminiConfigured:
            Boolean(GEMINI_API_KEY),

        strictFactGuard:
            true,

        noInventedFacts:
            true
    });
});


// ==========================================================
// CATEGORY API
// ==========================================================

app.get("/api/categories", (req, res) => {

    res.json({

        success: true,

        categories:
            Object.keys(categoryRules),

        count:
            Object.keys(categoryRules).length
    });
});


// ==========================================================
// GENERATE LISTING API
// ==========================================================

app.post(
    "/api/generate-listing",
    async (req, res) => {

        try {

            const data =
                normalizeProductData(
                    req.body || {}
                );


            console.log(
                "Generating listing:",
                {
                    category:
                        data.category,

                    product:
                        data.productName
                }
            );


            // ------------------------------------------------
            // Validate
            // ------------------------------------------------

            const errors =
                validateInput(data);


            if (errors.length) {

                return res.status(400).json({

                    success: false,

                    error:
                        errors[0],

                    errors
                });
            }


            // ------------------------------------------------
            // Generate
            // ------------------------------------------------

            const result =
                await generateListing(
                    data
                );


            // ------------------------------------------------
            // Response
            // ------------------------------------------------

            return res.json({

                success: true,

                category:
                    data.category,

                productName:
                    data.productName,

                listing:
                    result.listing,

                data:
                    result.data,

                source:
                    result.source,

                factualGuard:
                    true,

                generatedFromUserFactsOnly:
                    true,

                version:
                    "6.1"
            });

        }
        catch (error) {

            console.error(
                "Generate Listing Error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    "Unable to generate listing.",

                message:
                    error.message || "Unknown error",

                version:
                    "6.1"
            });
        }
    }
);


// ==========================================================
// 404 HANDLER
// ==========================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        error:
            "API endpoint not found",

        path:
            req.originalUrl,

        availableEndpoints: [

            "GET /",

            "GET /api/status",

            "GET /api/categories",

            "POST /api/generate-listing"
        ],

        version:
            "6.1"
    });
});


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
            "Unhandled Server Error:",
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
                "6.1"
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
            "🤖 AI SELLER TOOLKIT BACKEND"
        );

        console.log(
            "🔒 Version: 6.1"
        );

        console.log(
            `🚀 Server running on port ${PORT}`
        );

        console.log(
            `🤖 Gemini Model: ${PRIMARY_MODEL}`
        );

        console.log(
            `🔄 Gemini Fallback Model: ${FALLBACK_MODEL}`
        );

        console.log(
            `🔑 Gemini API: ${
                GEMINI_API_KEY
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            }`
        );

        console.log(
            "🛡️ Strict Fact Guard: ENABLED"
        );

        console.log(
            "🚫 No Invented Facts: ENABLED"
        );

        console.log(
            "=================================================="
        );
    }
);
