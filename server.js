/* =========================================================
   AI SELLER TOOLKIT
   COMPLETE PRODUCT LISTING BACKEND
   SERVER.JS VERSION 3
   CATEGORY-AWARE + STRICT FACTUAL AI
========================================================= */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));


/* =========================================================
   CONFIG
========================================================= */

const PORT =
    process.env.PORT || 3000;

const API_KEY =
    process.env.GEMINI_API_KEY;


if (!API_KEY) {

    console.error(
        "❌ GEMINI_API_KEY is missing!"
    );

}


const ai =
    new GoogleGenAI({
        apiKey: API_KEY
    });


/* =========================================================
   CATEGORY DEFINITIONS
========================================================= */

const CATEGORIES = {

    "Fashion": {

        emoji: "👗",

        fields: [
            "productType",
            "brand",
            "fabric",
            "material",
            "color",
            "size",
            "pattern",
            "fit",
            "occasion",
            "quantity"
        ],

        forbiddenAssumptions: [
            "gender",
            "age",
            "ethnic",
            "western",
            "designer",
            "premium",
            "party wear"
        ]

    },


    "Beauty": {

        emoji: "💄",

        fields: [
            "productType",
            "brand",
            "variant",
            "form",
            "color",
            "quantity",
            "ingredients",
            "skinType",
            "hairType",
            "fragrance"
        ],

        forbiddenAssumptions: [
            "medical benefit",
            "acne treatment",
            "pimple removal",
            "fairness",
            "skin whitening",
            "dermatologically tested",
            "100% natural",
            "chemical free",
            "guaranteed result"
        ]

    },


    "Electronics": {

        emoji: "📱",

        fields: [
            "productType",
            "brand",
            "model",
            "color",
            "storage",
            "ram",
            "battery",
            "connectivity",
            "compatibility",
            "power",
            "warranty"
        ],

        forbiddenAssumptions: [
            "battery capacity",
            "RAM",
            "storage",
            "processor",
            "warranty",
            "compatibility",
            "waterproof",
            "fast charging"
        ]

    },


    "Home & Kitchen": {

        emoji: "🏠",

        fields: [
            "productType",
            "brand",
            "material",
            "color",
            "dimensions",
            "capacity",
            "quantity",
            "usage"
        ],

        forbiddenAssumptions: [
            "dishwasher safe",
            "microwave safe",
            "durable",
            "premium",
            "non-stick"
        ]

    },


    "Shoes": {

        emoji: "👟",

        fields: [
            "productType",
            "brand",
            "material",
            "color",
            "size",
            "sole",
            "closure",
            "occasion",
            "quantity"
        ],

        forbiddenAssumptions: [
            "men",
            "women",
            "kids",
            "running",
            "sports",
            "comfortable",
            "lightweight"
        ]

    },


    "Jewellery": {

        emoji: "💍",

        fields: [
            "productType",
            "brand",
            "material",
            "color",
            "design",
            "size",
            "stone",
            "occasion",
            "quantity"
        ],

        forbiddenAssumptions: [
            "gold",
            "silver",
            "diamond",
            "platinum",
            "22k",
            "24k",
            "precious",
            "hallmarked"
        ]

    },


    "Toys": {

        emoji: "🧸",

        fields: [
            "productType",
            "brand",
            "material",
            "color",
            "size",
            "ageGroup",
            "quantity",
            "battery"
        ],

        forbiddenAssumptions: [
            "educational",
            "safe",
            "non-toxic",
            "certified",
            "recommended age"
        ]

    },


    "Books": {

        emoji: "📚",

        fields: [
            "title",
            "author",
            "language",
            "format",
            "pages",
            "publisher",
            "edition",
            "isbn"
        ],

        forbiddenAssumptions: [
            "author",
            "publisher",
            "edition",
            "ISBN",
            "page count"
        ]

    },


    "Pet": {

        emoji: "🐶",

        fields: [
            "productType",
            "brand",
            "petType",
            "material",
            "size",
            "quantity",
            "ingredients",
            "flavour"
        ],

        forbiddenAssumptions: [
            "medical",
            "veterinary",
            "disease treatment",
            "health benefit",
            "vet approved"
        ]

    },


    "Sports": {

        emoji: "🏋️",

        fields: [
            "productType",
            "brand",
            "material",
            "color",
            "size",
            "weight",
            "activity",
            "quantity"
        ],

        forbiddenAssumptions: [
            "professional",
            "performance",
            "durable",
            "lightweight",
            "athlete approved"
        ]

    },


    "Automotive": {

        emoji: "🚗",

        fields: [
            "productType",
            "brand",
            "model",
            "vehicleCompatibility",
            "material",
            "color",
            "dimensions",
            "quantity"
        ],

        forbiddenAssumptions: [
            "OEM",
            "original",
            "universal compatibility",
            "vehicle compatibility",
            "certified"
        ]

    },


    "Garden": {

        emoji: "🌱",

        fields: [
            "productType",
            "brand",
            "material",
            "color",
            "size",
            "quantity",
            "plantCompatibility",
            "usage"
        ],

        forbiddenAssumptions: [
            "organic",
            "chemical free",
            "guaranteed growth",
            "pest control",
            "fertilizer"
        ]

    },


    "Food": {

        emoji: "🍎",

        fields: [
            "productType",
            "brand",
            "flavour",
            "quantity",
            "ingredients",
            "packType",
            "dietaryInformation",
            "expiry",
            "shelfLife"
        ],

        forbiddenAssumptions: [
            "healthy",
            "organic",
            "natural",
            "sugar free",
            "preservative free",
            "high protein",
            "low calorie",
            "nutrition"
        ]

    },


    "Gifts": {

        emoji: "🎁",

        fields: [
            "productType",
            "brand",
            "material",
            "color",
            "design",
            "quantity",
            "occasion",
            "recipient",
            "packaging"
        ],

        forbiddenAssumptions: [
            "perfect gift",
            "best gift",
            "premium",
            "romantic",
            "birthday",
            "anniversary"
        ]

    }

};


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {

    res.json({

        status: "success",

        message:
            "✅ AI Seller Toolkit Backend V3 is running!",

        version:
            "3.0",

        mode:
            "Category-Aware Strict Factual",

        endpoints: [
            "POST /generate",
            "POST /api/generate-listing"
        ],

        categories:
            Object.keys(CATEGORIES)

    });

});


/* =========================================================
   GEMINI GENERATION
========================================================= */

async function generateWithRetry(prompt) {

    const models = [

        "gemini-3.5-flash",
        "gemini-3.6-flash"

    ];


    let lastError = null;


    for (const model of models) {

        for (
            let attempt = 1;
            attempt <= 3;
            attempt++
        ) {

            try {

                console.log(
                    `🤖 ${model} - Attempt ${attempt}`
                );


                const response =
                    await ai.models.generateContent({

                        model:
                            model,

                        contents:
                            prompt

                    });


                const text =
                    response.text;


                if (
                    !text ||
                    !text.trim()
                ) {

                    throw new Error(
                        "Gemini returned empty response"
                    );

                }


                return text;

            } catch (error) {

                lastError =
                    error;


                console.error(
                    "❌ Gemini error:",
                    error.message || error
                );


                const status =
                    error?.status ||
                    error?.code ||
                    error?.error?.code;


                const message =
                    error?.message ||
                    error?.error?.message ||
                    "";


                const temporary =

                    status === 429 ||
                    status === 500 ||
                    status === 502 ||
                    status === 503 ||
                    message.includes(
                        "temporarily"
                    ) ||
                    message.includes(
                        "high demand"
                    );


                if (!temporary) {

                    break;

                }


                if (attempt < 3) {

                    const delay =
                        Math.pow(
                            2,
                            attempt
                        ) * 1000;


                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                delay
                            )
                    );

                }

            }

        }

    }


    throw (
        lastError ||
        new Error(
            "Gemini API request failed"
        )
    );

}


/* =========================================================
   OLD /generate ENDPOINT
========================================================= */

app.post(
    "/generate",
    async (req, res) => {

        try {

            if (!API_KEY) {

                return res.status(500).json({

                    error:
                        "GEMINI_API_KEY is missing"

                });

            }


            const prompt =
                req.body?.prompt;


            if (!prompt) {

                return res.status(400).json({

                    error:
                        "Prompt is required"

                });

            }


            const result =
                await generateWithRetry(
                    prompt
                );


            return res.json({

                result:
                    result

            });

        } catch (error) {

            return handleError(
                error,
                res
            );

        }

    }
);


/* =========================================================
   CLEAN PRODUCT INPUT
========================================================= */

function cleanProduct(
    product
) {

    const result = {};


    if (
        !product ||
        typeof product !== "object"
    ) {

        return result;

    }


    Object.entries(
        product
    ).forEach(
        ([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                String(value).trim()
            ) {

                result[key] =
                    String(value).trim();

            }

        }
    );


    return result;

}


/* =========================================================
   CATEGORY FIELD NORMALIZATION
========================================================= */

function normalizeProduct(
    product
) {

    const category =
        product.category;


    const normalized = {

        category:
            category,

        productName:
            product.productName || "",

        price:
            product.price || ""

    };


    /*
    ========================================================
    FASHION
    ========================================================
    */

    if (
        category === "Fashion"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.fabric =
            product.fabric ||
            product.material ||
            "";

        normalized.color =
            product.color || "";

        normalized.size =
            product.size || "";

        normalized.pattern =
            product.pattern || "";

        normalized.fit =
            product.fit || "";

        normalized.occasion =
            product.occasion || "";

        normalized.quantity =
            product.quantity || "";

    }


    /*
    ========================================================
    BEAUTY
    ========================================================
    */

    else if (
        category === "Beauty"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.variant =
            product.variant || "";

        /*
        IMPORTANT:
        material OR form becomes FORM.
        Quantity remains quantity.
        */

        normalized.form =
            product.form ||
            product.material ||
            "";

        normalized.color =
            product.color || "";

        normalized.quantity =
            product.quantity || "";

        normalized.ingredients =
            product.ingredients || "";

        normalized.skinType =
            product.skinType || "";

        normalized.hairType =
            product.hairType || "";

        normalized.fragrance =
            product.fragrance || "";

    }


    /*
    ========================================================
    ELECTRONICS
    ========================================================
    */

    else if (
        category === "Electronics"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.model =
            product.model || "";

        normalized.color =
            product.color || "";

        normalized.storage =
            product.storage || "";

        normalized.ram =
            product.ram || "";

        normalized.battery =
            product.battery || "";

        normalized.connectivity =
            product.connectivity || "";

        normalized.compatibility =
            product.compatibility || "";

        normalized.power =
            product.power || "";

        normalized.warranty =
            product.warranty || "";

    }


    /*
    ========================================================
    HOME & KITCHEN
    ========================================================
    */

    else if (
        category === "Home & Kitchen"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.material =
            product.material || "";

        normalized.color =
            product.color || "";

        normalized.dimensions =
            product.dimensions ||
            product.size ||
            "";

        normalized.capacity =
            product.capacity || "";

        normalized.quantity =
            product.quantity || "";

        normalized.usage =
            product.usage || "";

    }


    /*
    ========================================================
    SHOES
    ========================================================
    */

    else if (
        category === "Shoes"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.material =
            product.material || "";

        normalized.color =
            product.color || "";

        normalized.size =
            product.size || "";

        normalized.sole =
            product.sole || "";

        normalized.closure =
            product.closure || "";

        normalized.occasion =
            product.occasion || "";

        normalized.quantity =
            product.quantity || "";

    }


    /*
    ========================================================
    JEWELLERY
    ========================================================
    */

    else if (
        category === "Jewellery"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.material =
            product.material || "";

        normalized.color =
            product.color || "";

        normalized.design =
            product.design || "";

        normalized.size =
            product.size || "";

        normalized.stone =
            product.stone || "";

        normalized.occasion =
            product.occasion || "";

        normalized.quantity =
            product.quantity || "";

    }


    /*
    ========================================================
    TOYS
    ========================================================
    */

    else if (
        category === "Toys"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.material =
            product.material || "";

        normalized.color =
            product.color || "";

        normalized.size =
            product.size || "";

        normalized.ageGroup =
            product.ageGroup || "";

        normalized.quantity =
            product.quantity || "";

        normalized.battery =
            product.battery || "";

    }


    /*
    ========================================================
    BOOKS
    ========================================================
    */

    else if (
        category === "Books"
    ) {

        normalized.title =
            product.title ||
            product.productName ||
            "";

        normalized.author =
            product.author || "";

        normalized.language =
            product.language || "";

        normalized.format =
            product.format || "";

        normalized.pages =
            product.pages || "";

        normalized.publisher =
            product.publisher || "";

        normalized.edition =
            product.edition || "";

        normalized.isbn =
            product.isbn || "";

    }


    /*
    ========================================================
    PET
    ========================================================
    */

    else if (
        category === "Pet"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.petType =
            product.petType || "";

        normalized.material =
            product.material || "";

        normalized.size =
            product.size || "";

        normalized.quantity =
            product.quantity || "";

        normalized.ingredients =
            product.ingredients || "";

        normalized.flavour =
            product.flavour || "";

    }


    /*
    ========================================================
    SPORTS
    ========================================================
    */

    else if (
        category === "Sports"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.material =
            product.material || "";

        normalized.color =
            product.color || "";

        normalized.size =
            product.size || "";

        normalized.weight =
            product.weight || "";

        normalized.activity =
            product.activity || "";

        normalized.quantity =
            product.quantity || "";

    }


    /*
    ========================================================
    AUTOMOTIVE
    ========================================================
    */

    else if (
        category === "Automotive"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.model =
            product.model || "";

        normalized.vehicleCompatibility =
            product.vehicleCompatibility ||
            product.compatibility ||
            "";

        normalized.material =
            product.material || "";

        normalized.color =
            product.color || "";

        normalized.dimensions =
            product.dimensions ||
            product.size ||
            "";

        normalized.quantity =
            product.quantity || "";

    }


    /*
    ========================================================
    GARDEN
    ========================================================
    */

    else if (
        category === "Garden"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.material =
            product.material || "";

        normalized.color =
            product.color || "";

        normalized.size =
            product.size || "";

        normalized.quantity =
            product.quantity || "";

        normalized.plantCompatibility =
            product.plantCompatibility || "";

        normalized.usage =
            product.usage || "";

    }


    /*
    ========================================================
    FOOD
    ========================================================
    */

    else if (
        category === "Food"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.flavour =
            product.flavour || "";

        normalized.quantity =
            product.quantity || "";

        normalized.ingredients =
            product.ingredients || "";

        normalized.packType =
            product.packType || "";

        normalized.dietaryInformation =
            product.dietaryInformation || "";

        normalized.expiry =
            product.expiry || "";

        normalized.shelfLife =
            product.shelfLife || "";

    }


    /*
    ========================================================
    GIFTS
    ========================================================
    */

    else if (
        category === "Gifts"
    ) {

        normalized.productType =
            product.productType ||
            product.productName ||
            "";

        normalized.brand =
            product.brand || "";

        normalized.material =
            product.material || "";

        normalized.color =
            product.color || "";

        normalized.design =
            product.design || "";

        normalized.quantity =
            product.quantity || "";

        normalized.occasion =
            product.occasion || "";

        normalized.recipient =
            product.recipient || "";

        normalized.packaging =
            product.packaging || "";

    }


    return normalized;

}


/* =========================================================
   BUILD AI PROMPT
========================================================= */

function buildPrompt(
    product
) {

    const category =
        product.category;


    const categoryInfo =
        CATEGORIES[category] ||
        null;


    const rules =
        categoryInfo
            ? categoryInfo.forbiddenAssumptions
                .map(
                    item =>
                        `- ${item}`
                )
                .join("\n")
            : "";


    const allowedFields =
        categoryInfo
            ? categoryInfo.fields
                .join(", ")
            : "";


    return `
You are AI Seller Toolkit's
Category-Aware Product Listing AI.

==================================================
CATEGORY
==================================================

${category}

==================================================
ALLOWED CATEGORY FIELDS
==================================================

${allowedFields}

==================================================
STRICT FACTUAL RULE
==================================================

Use ONLY information provided by the seller.

Never invent a product fact.

Never infer a missing fact from
the category or product name.

Never assume gender.

Never assume age group.

Never assume occasion.

Never assume quality.

Never assume performance.

Never assume compatibility.

Never assume certification.

Never assume health benefits.

Never assume material.

Never assume dimensions.

Never assume quantity.

==================================================
CATEGORY-SPECIFIC FORBIDDEN ASSUMPTIONS
==================================================

${rules}

==================================================
IMPORTANT BEAUTY RULE
==================================================

For Beauty:

- "form" means product form/texture.
- "quantity" means product quantity.
- NEVER convert quantity into model.
- NEVER call 100g, 50ml, 200ml etc. a model.
- NEVER invent medical or cosmetic claims.

==================================================
IMPORTANT PRICE RULE
==================================================

Price is NOT a specification.

Never include price inside:

- specifications
- highlights
- SEO keywords
- tags

unless the seller specifically requests
promotional pricing content.

==================================================
SELLER PRODUCT DATA
==================================================

${JSON.stringify(
    product,
    null,
    2
)}

==================================================
TITLE
==================================================

Create one clear product title.

Use only supplied facts.

==================================================
DESCRIPTION
==================================================

Create a natural marketplace description.

Use only supplied facts.

Do not use unsupported promotional words.

==================================================
HIGHLIGHTS
==================================================

Create 4-8 factual bullet points.

Every point must come from seller data.

==================================================
SEO KEYWORDS
==================================================

Create relevant search keywords.

Keywords may combine existing seller facts.

Do not introduce unsupported attributes.

==================================================
SEARCH TAGS
==================================================

Create short search tags.

Use only supported product facts.

==================================================
SPECIFICATIONS
==================================================

Include ONLY supplied product specifications.

Do not include:

- price
- category
- SEO keywords
- tags
- assumptions
- marketing claims

==================================================
MISSING INFORMATION
==================================================

If a value is missing:

OMIT IT.

Do not write:
"Not provided."

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly:

{
  "title": "",
  "description": "",
  "highlights": [],
  "seoKeywords": [],
  "tags": [],
  "specifications": {}
}

==================================================
FINAL CHECK
==================================================

Before returning:

- Remove invented facts.
- Remove unsupported gender.
- Remove unsupported age.
- Remove unsupported occasion.
- Remove unsupported quality claims.
- Remove unsupported medical claims.
- Remove unsupported technical claims.
- Remove unsupported compatibility.
- Remove price from specifications.
- Make sure quantity stays quantity.
- Make sure Beauty quantity is never called model.

Return JSON only.
`;

}


/* =========================================================
   CLEAN JSON
========================================================= */

function cleanJsonText(
    text
) {

    let cleaned =
        String(
            text || ""
        ).trim();


    if (
        cleaned.startsWith(
            "```json"
        )
    ) {

        cleaned =
            cleaned.substring(
                7
            );

    }


    if (
        cleaned.startsWith(
            "```"
        )
    ) {

        cleaned =
            cleaned.substring(
                3
            );

    }


    if (
        cleaned.endsWith(
            "```"
        )
    ) {

        cleaned =
            cleaned.substring(
                0,
                cleaned.length - 3
            );

    }


    return cleaned.trim();

}


/* =========================================================
   REMOVE FORBIDDEN SPECIFICATIONS
========================================================= */

function cleanSpecifications(
    specs,
    product
) {

    if (
        !specs ||
        typeof specs !== "object"
    ) {

        return {};

    }


    const result = {};


    const forbidden = [

        "price",
        "category",
        "seo",
        "seo keywords",
        "keywords",
        "tags",
        "search tags",
        "marketing"

    ];


    Object.entries(
        specs
    ).forEach(
        ([key, value]) => {

            const cleanKey =
                String(
                    key
                ).trim();


            const lowerKey =
                cleanKey.toLowerCase();


            if (
                forbidden.includes(
                    lowerKey
                )
            ) {

                return;

            }


            if (
                value === undefined ||
                value === null ||
                !String(value).trim()
            ) {

                return;

            }


            const cleanValue =
                String(
                    value
                ).trim();


            /*
            Remove common hallucinated values
            that are clearly not seller data.
            */

            const sellerText =
                JSON.stringify(
                    product
                ).toLowerCase();


            const valueLower =
                cleanValue.toLowerCase();


            /*
            Exact value check.
            */

            if (
                sellerText.includes(
                    valueLower
                )
            ) {

                result[
                    cleanKey
                ] =
                    cleanValue;

            }

        }
    );


    return result;

}


/* =========================================================
   VALIDATE LISTING
========================================================= */

function validateListing(
    listing,
    product
) {

    if (
        !listing ||
        typeof listing !== "object"
    ) {

        throw new Error(
            "Invalid listing response"
        );

    }


    return {

        title:
            typeof listing.title ===
            "string"
                ? listing.title.trim()
                : "",

        description:
            typeof listing.description ===
            "string"
                ? listing.description.trim()
                : "",

        highlights:
            Array.isArray(
                listing.highlights
            )
                ? listing.highlights
                    .filter(Boolean)
                    .map(
                        item =>
                            String(
                                item
                            ).trim()
                    )
                : [],

        seoKeywords:
            Array.isArray(
                listing.seoKeywords
            )
                ? listing.seoKeywords
                    .filter(Boolean)
                    .map(
                        item =>
                            String(
                                item
                            ).trim()
                    )
                : [],

        tags:
            Array.isArray(
                listing.tags
            )
                ? listing.tags
                    .filter(Boolean)
                    .map(
                        item =>
                            String(
                                item
                            ).trim()
                    )
                : [],

        specifications:
            cleanSpecifications(
                listing.specifications,
                product
            )

    };

}


/* =========================================================
   COMPLETE LISTING API
========================================================= */

app.post(
    "/api/generate-listing",
    async (req, res) => {

        try {

            if (!API_KEY) {

                return res.status(500).json({

                    success:
                        false,

                    message:
                        "GEMINI_API_KEY is not configured on Render."

                });

            }


            const input =
                req.body?.product;


            if (
                !input ||
                typeof input !== "object"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Product data is required."

                });

            }


            const cleaned =
                cleanProduct(
                    input
                );


            if (
                !cleaned.productName
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Product Name is required."

                });

            }


            if (
                !cleaned.category
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Category is required."

                });

            }


            if (
                !CATEGORIES[
                    cleaned.category
                ]
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Unsupported category."

                });

            }


            console.log(
                "======================================"
            );


            console.log(
                "📥 Listing V3 request"
            );


            console.log(
                "📂 Category:",
                cleaned.category
            );


            console.log(
                "📦 Product:",
                cleaned.productName
            );


            /*
            Convert common frontend fields
            into category-specific meanings.
            */

            const product =
                normalizeProduct(
                    cleaned
                );


            console.log(
                "🧠 Normalized product:",
                product
            );


            const prompt =
                buildPrompt(
                    product
                );


            const aiResponse =
                await generateWithRetry(
                    prompt
                );


            const jsonText =
                cleanJsonText(
                    aiResponse
                );


            let listing;


            try {

                listing =
                    JSON.parse(
                        jsonText
                    );

            } catch (error) {

                console.error(
                    "❌ Invalid JSON from Gemini:"
                );


                console.error(
                    jsonText
                );


                return res.status(500).json({

                    success:
                        false,

                    message:
                        "AI returned invalid JSON.",

                    raw:
                        jsonText

                });

            }


            listing =
                validateListing(
                    listing,
                    product
                );


            console.log(
                "✅ Listing V3 generated successfully"
            );


            return res.json({

                success:
                    true,

                version:
                    "3.0",

                category:
                    cleaned.category,

                listing:
                    listing

            });

        } catch (error) {

            console.error(
                "❌ Listing V3 Error:",
                error
            );


            return handleError(
                error,
                res
            );

        }

    }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

function handleError(
    error,
    res
) {

    const status =
        error?.status ||
        error?.code ||
        error?.error?.code ||
        500;


    const message =
        error?.message ||
        error?.error?.message ||
        "Unknown error";


    if (
        status === 429
    ) {

        return res.status(503).json({

            success:
                false,

            error:
                "Gemini quota/rate limit reached.",

            details:
                message

        });

    }


    if (
        status === 503 ||
        message.includes(
            "temporarily"
        ) ||
        message.includes(
            "high demand"
        )
    ) {

        return res.status(503).json({

            success:
                false,

            error:
                "Gemini service is temporarily busy.",

            details:
                message

        });

    }


    return res.status(500).json({

        success:
            false,

        error:
            "Gemini API request failed",

        details:
            message

    });

}


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            "======================================"
        );

        console.log(
            "🚀 AI Seller Toolkit Backend V3"
        );

        console.log(
            `🚀 Server running on port ${PORT}`
        );

        console.log(
            "🧠 Category-Aware Mode: ON"
        );

        console.log(
            "🛡️ Strict Factual Mode: ON"
        );

        console.log(
            "======================================"
        );

    }
);
