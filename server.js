/* =========================================================
   AI SELLER TOOLKIT
   GEMINI BACKEND
   SERVER.JS VERSION 2
   ULTRA STRICT FACTUAL LISTING
========================================================= */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));


/* =========================================================
   SERVER CONFIG
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
   CATEGORY RULES
========================================================= */

const CATEGORY_RULES = {

    "Fashion": `
Focus only on seller-provided:
product type, fabric, material, color,
size, pattern, fit and occasion.

NEVER assume:
women, men, kids, ethnic, western,
premium, designer or branded style
unless explicitly provided.
`,

    "Beauty": `
Focus only on seller-provided:
product type, brand, variant,
quantity, ingredients, skin/hair type
and fragrance.

NEVER invent:
ingredients, medical benefits,
dermatological claims, guaranteed results
or suitability.
`,

    "Electronics": `
Focus only on seller-provided:
product type, brand, model, color,
storage, connectivity, compatibility,
power and other specifications.

NEVER invent:
battery capacity, processor,
RAM, storage, warranty, compatibility
or technical specifications.
`,

    "Home & Kitchen": `
Focus only on seller-provided:
product type, material, color,
dimensions, capacity, quantity
and usage.

NEVER invent dimensions,
capacity or material.
`,

    "Shoes": `
Focus only on seller-provided:
product type, brand, material,
color, size, sole and closure.

NEVER assume:
men, women, kids, running,
casual or sports use unless provided.
`,

    "Jewellery": `
Focus only on seller-provided:
product type, material, color,
design, size and stone/gem details.

NEVER claim:
gold, silver, diamond, platinum,
purity or precious metal content
unless explicitly provided.
`,

    "Toys": `
Focus only on seller-provided:
toy type, brand, material, color,
size, age group and quantity.

NEVER invent:
recommended age, safety certification,
educational benefits or certifications.
`,

    "Books": `
Focus only on seller-provided:
title, author, language, format,
pages, publisher, edition and ISBN.

NEVER invent missing book details.
`,

    "Pet": `
Focus only on seller-provided:
product type, pet type, brand,
material, size, quantity and ingredients.

NEVER make veterinary, medical
or health claims.
`,

    "Sports": `
Focus only on seller-provided:
product type, brand, material,
color, size, weight and sport/activity.

NEVER invent performance claims,
weight, material or dimensions.
`,

    "Automotive": `
Focus only on seller-provided:
product type, brand, model,
vehicle compatibility, material,
color, size and quantity.

NEVER invent vehicle compatibility,
OEM claims or certifications.
`,

    "Garden": `
Focus only on seller-provided:
product type, brand, material,
size, quantity, plant compatibility
and usage.

NEVER invent plant compatibility,
chemical composition or growth guarantees.
`,

    "Food": `
Focus only on seller-provided:
product type, brand, flavour,
quantity, ingredients, pack type,
dietary information and expiry/shelf life.

NEVER invent:
ingredients, nutrition information,
health benefits, expiry or dietary claims.
`,

    "Gifts": `
Focus only on seller-provided:
product type, material, color,
design, quantity, occasion,
recipient and packaging.

NEVER assume recipient, occasion
or packaging.
`

};


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {

    res.json({

        status: "success",

        message:
            "✅ AI Seller Toolkit Gemini Backend Version 2 is running!",

        version:
            "2.0",

        endpoints: [

            "POST /generate",

            "POST /api/generate-listing"

        ],

        categories:
            Object.keys(
                CATEGORY_RULES
            )

    });

});


/* =========================================================
   GEMINI GENERATION WITH RETRY
========================================================= */

async function generateWithRetry(
    prompt
) {

    const models = [

        "gemini-3.5-flash",
        "gemini-3.6-flash"

    ];


    let lastError = null;


    for (
        const model of models
    ) {

        for (
            let attempt = 1;
            attempt <= 3;
            attempt++
        ) {

            try {

                console.log(
                    `🤖 Trying ${model} - Attempt ${attempt}`
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
                        "Gemini returned an empty response"
                    );

                }


                console.log(
                    `✅ Gemini response received from ${model}`
                );


                return text;


            } catch (error) {

                lastError =
                    error;


                console.error(

                    `❌ ${model} attempt ${attempt} failed:`,

                    error.message ||
                    error

                );


                const status =
                    error?.status ||
                    error?.code ||
                    error?.error?.code;


                const message =
                    error?.message ||
                    error?.error?.message ||
                    "";


                const temporaryError =

                    status === 429 ||

                    status === 500 ||

                    status === 502 ||

                    status === 503 ||

                    message.includes(
                        "high demand"
                    ) ||

                    message.includes(
                        "temporarily"
                    );


                if (
                    !temporaryError
                ) {

                    break;

                }


                if (
                    attempt < 3
                ) {

                    const delay =
                        Math.pow(
                            2,
                            attempt
                        ) * 1000;


                    console.log(
                        `⏳ Retrying after ${delay}ms...`
                    );


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


        console.log(
            `⚠️ Switching model after failures: ${model}`
        );

    }


    throw (
        lastError ||
        new Error(
            "Gemini API request failed"
        )
    );

}


/* =========================================================
   OLD GENERATE ENDPOINT
   Keeps existing tools working
========================================================= */

app.post(
    "/generate",
    async (req, res) => {

        try {

            const prompt =
                req.body?.prompt;


            if (!prompt) {

                return res.status(400).json({

                    error:
                        "Prompt is required"

                });

            }


            if (!API_KEY) {

                return res.status(500).json({

                    error:
                        "GEMINI_API_KEY is not configured on Render"

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

            return sendGeminiError(
                error,
                res
            );

        }

    }
);


/* =========================================================
   PRODUCT DATA CLEANER
========================================================= */

function cleanProductData(
    product
) {

    const cleaned = {};


    const allowedFields = [

        "category",
        "productName",
        "brand",
        "price",
        "color",
        "material",
        "size",
        "model",
        "quantity",
        "features",
        "description"

    ];


    allowedFields.forEach(
        field => {

            const value =
                product[field];


            if (
                value !== undefined &&
                value !== null &&
                String(value).trim()
            ) {

                cleaned[field] =
                    String(value).trim();

            }

        }
    );


    /*
       Keep extra fields if supplied.
       But never convert them into facts
       unless seller actually entered them.
    */

    if (
        product.extra &&
        typeof product.extra ===
        "object"
    ) {

        cleaned.extra = {};


        Object.entries(
            product.extra
        ).forEach(
            ([key, value]) => {

                if (
                    value !== undefined &&
                    value !== null &&
                    String(value).trim()
                ) {

                    cleaned.extra[key] =
                        String(value).trim();

                }

            }
        );

    }


    return cleaned;

}


/* =========================================================
   BUILD STRICT PROMPT
========================================================= */

function buildListingPrompt(
    product
) {

    const category =
        product.category ||
        "Other";


    const categoryRules =
        CATEGORY_RULES[category] ||
        `
Use ONLY seller-provided information.
Do not invent any product facts.
`;


    return `
You are the official AI Product Listing
Generator for AI Seller Toolkit.

You create professional marketplace
product listings.

==================================================
ABSOLUTE FACTUAL RULE
==================================================

THIS IS THE MOST IMPORTANT RULE.

You MUST use ONLY information explicitly
provided by the seller.

You MUST NOT invent, assume, infer,
guess or add product facts.

CATEGORY KNOWLEDGE MUST NOT BE USED
TO CREATE MISSING FACTS.

For example:

Seller says:
"Blue Cotton Kurti"

DO NOT assume:

- Women's Fashion
- Women
- Men
- Ethnic Wear
- Traditional Wear
- Casual Wear
- Premium
- Designer
- Party Wear

unless the seller explicitly provides
that information.

==================================================
CATEGORY
==================================================

${category}

CATEGORY-SPECIFIC RULES:

${categoryRules}

==================================================
SELLER DATA
==================================================

${JSON.stringify(
    product,
    null,
    2
)}

==================================================
TITLE RULES
==================================================

Create ONE professional product title.

Use only seller-provided facts.

You may combine existing facts
naturally.

Do not add:

- Gender
- Age
- Occasion
- Style
- Quality
- Performance
- Certification
- Compatibility

unless supplied.

==================================================
DESCRIPTION RULES
==================================================

Write a clear marketplace description.

Only describe facts contained
in the seller data.

Do not use generic claims such as:

- Premium
- High quality
- Best
- Stylish
- Durable
- Comfortable
- Perfect
- Guaranteed
- Attractive

unless the seller explicitly provided
those claims.

==================================================
HIGHLIGHTS
==================================================

Create 4 to 8 factual bullet points.

Every bullet MUST be supported
by seller data.

Do not create new information.

==================================================
SEO KEYWORDS
==================================================

Create relevant search keywords.

Keywords may combine seller-provided
words naturally.

DO NOT introduce new factual attributes.

For example:

Allowed:
"blue cotton kurti"

Not allowed if gender was not supplied:
"women blue cotton kurti"

Not allowed:
"premium cotton kurti"

Not allowed:
"ethnic cotton kurti"

==================================================
SEARCH TAGS
==================================================

Create short relevant tags.

Only use seller-provided
product facts.

Do NOT add:

Women's Fashion
Men's Fashion
Kids
Ethnic
Premium
Designer
Sports
Casual

unless explicitly supplied.

==================================================
SPECIFICATIONS
==================================================

VERY IMPORTANT:

Specifications must contain ONLY
actual seller-provided specifications.

DO NOT include:

Price
SEO keywords
Search tags
Marketing claims
Category assumptions

For example, if seller gives:

Brand: Test Brand
Color: Blue
Material: Cotton
Size: M
Quantity: 1 Piece
Price: ₹599

Specifications MUST be:

Brand: Test Brand
Color: Blue
Material: Cotton
Size: M
Quantity: 1 Piece

Price MUST NOT appear
inside specifications.

==================================================
MISSING INFORMATION
==================================================

If information is missing:

DO NOT invent it.

Simply omit it.

Do NOT write:

"Not provided"

inside the final listing.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

No markdown.

No code block.

No explanation.

Use exactly this structure:

{
  "title": "",
  "description": "",
  "highlights": [],
  "seoKeywords": [],
  "tags": [],
  "specifications": {}
}

==================================================
FINAL SELF-CHECK
==================================================

Before returning JSON, check:

1. Did I invent any fact?
2. Did I assume gender?
3. Did I assume age?
4. Did I assume occasion?
5. Did I assume product style?
6. Did I add premium/quality claims?
7. Did I add compatibility?
8. Did I add specifications not supplied?
9. Did I put price inside specifications?
10. Did I add SEO words that imply
    an unsupported fact?

If YES to any question,
remove that information.

Return JSON only.
`;

}


/* =========================================================
   CLEAN AI JSON
========================================================= */

function cleanJson(
    text
) {

    let value =
        String(
            text || ""
        ).trim();


    if (
        value.startsWith(
            "```json"
        )
    ) {

        value =
            value.substring(
                7
            );

    }


    if (
        value.startsWith(
            "```"
        )
    ) {

        value =
            value.substring(
                3
            );

    }


    if (
        value.endsWith(
            "```"
        )
    ) {

        value =
            value.substring(
                0,
                value.length - 3
            );

    }


    return value.trim();

}


/* =========================================================
   STRICT SPECIFICATION FILTER
========================================================= */

function cleanSpecifications(
    specifications,
    product
) {

    if (
        !specifications ||
        typeof specifications !==
        "object"
    ) {

        return {};

    }


    const result = {};


    /*
       These fields are never allowed
       inside specifications.
    */

    const forbiddenKeys = [

        "price",
        "seo",
        "seoKeywords",
        "keywords",
        "tags",
        "searchTags",
        "marketing",
        "claims",
        "category"

    ];


    const sellerValues = {};


    Object.entries(
        product
    ).forEach(
        ([key, value]) => {

            if (
                key !== "price" &&
                key !== "category" &&
                key !== "extra" &&
                value !== undefined &&
                value !== null &&
                String(value).trim()
            ) {

                sellerValues[
                    String(value)
                        .trim()
                        .toLowerCase()
                ] = true;

            }

        }
    );


    if (
        product.extra &&
        typeof product.extra ===
        "object"
    ) {

        Object.values(
            product.extra
        ).forEach(
            value => {

                if (
                    value !== undefined &&
                    value !== null &&
                    String(value).trim()
                ) {

                    sellerValues[
                        String(value)
                            .trim()
                            .toLowerCase()
                    ] = true;

                }

            }
        );

    }


    Object.entries(
        specifications
    ).forEach(
        ([key, value]) => {

            const keyLower =
                String(
                    key
                ).trim().toLowerCase();


            const valueText =
                String(
                    value
                ).trim();


            if (
                !keyLower ||
                !valueText
            ) {

                return;

            }


            if (
                forbiddenKeys.includes(
                    keyLower
                )
            ) {

                return;

            }


            /*
               Only allow values that
               match seller-provided data.
            */

            const lowerValue =
                valueText.toLowerCase();


            let supported =
                false;


            Object.keys(
                sellerValues
            ).forEach(
                sellerValue => {

                    if (
                        sellerValue ===
                        lowerValue
                    ) {

                        supported =
                            true;

                    }

                }
            );


            /*
               Also allow specification values
               that are clearly composed from
               seller-provided words.
            */

            if (!supported) {

                const words =
                    lowerValue
                        .split(
                            /\s+/
                        )
                        .filter(Boolean);


                const sellerText =
                    Object.keys(
                        sellerValues
                    ).join(" ");


                if (
                    words.length > 0 &&
                    words.every(
                        word =>
                            sellerText.includes(
                                word
                            )
                    )
                ) {

                    supported =
                        true;

                }

            }


            if (supported) {

                result[key] =
                    valueText;

            }

        }
    );


    return result;

}


/* =========================================================
   VALIDATE FINAL LISTING
========================================================= */

function validateListing(
    listing,
    product
) {

    if (
        !listing ||
        typeof listing !==
        "object"
    ) {

        throw new Error(
            "Invalid AI listing"
        );

    }


    const clean = {

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
                            String(item).trim()
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
                            String(item).trim()
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
                            String(item).trim()
                    )
                : [],

        specifications:
            cleanSpecifications(
                listing.specifications,
                product
            )

    };


    /*
       Never allow price in specifications.
    */

    delete clean.specifications.price;


    return clean;

}


/* =========================================================
   NEW COMPLETE LISTING API
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


            const originalProduct =
                req.body?.product;


            if (
                !originalProduct ||
                typeof originalProduct !==
                "object"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Product data is required."

                });

            }


            const product =
                cleanProductData(
                    originalProduct
                );


            if (
                !product.productName
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Product Name is required."

                });

            }


            if (
                !product.category
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Category is required."

                });

            }


            console.log(
                "======================================"
            );


            console.log(
                "📥 Complete Listing V2 request"
            );


            console.log(
                "Category:",
                product.category
            );


            console.log(
                "Product:",
                product.productName
            );


            const prompt =
                buildListingPrompt(
                    product
                );


            const aiText =
                await generateWithRetry(
                    prompt
                );


            const cleaned =
                cleanJson(
                    aiText
                );


            let listing;


            try {

                listing =
                    JSON.parse(
                        cleaned
                    );

            } catch (error) {

                console.error(
                    "❌ Gemini returned invalid JSON"
                );


                console.error(
                    cleaned
                );


                return res.status(500).json({

                    success:
                        false,

                    message:
                        "AI returned invalid JSON.",

                    raw:
                        cleaned

                });

            }


            listing =
                validateListing(
                    listing,
                    product
                );


            console.log(
                "✅ Strict listing generated"
            );


            console.log(
                "======================================"
            );


            return res.json({

                success:
                    true,

                version:
                    "2.0",

                category:
                    product.category,

                listing:
                    listing

            });


        } catch (error) {

            console.error(
                "❌ Complete Listing V2 Error:",
                error
            );


            return sendGeminiError(
                error,
                res
            );

        }

    }
);


/* =========================================================
   ERROR RESPONSE
========================================================= */

function sendGeminiError(
    error,
    res
) {

    const status =
        error?.status ||
        error?.code ||
        error?.error?.code ||
        500;


    const details =
        error?.message ||
        error?.error?.message ||
        "Unknown Gemini API error";


    if (
        status === 429
    ) {

        return res.status(503).json({

            success:
                false,

            error:
                "Gemini quota/rate limit reached.",

            details:
                details

        });

    }


    if (
        status === 503 ||
        details.includes(
            "high demand"
        ) ||
        details.includes(
            "temporarily"
        )
    ) {

        return res.status(503).json({

            success:
                false,

            error:
                "Gemini service is temporarily busy.",

            details:
                details

        });

    }


    return res.status(500).json({

        success:
            false,

        error:
            "Gemini API request failed",

        details:
            details

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
            "🚀 AI Seller Toolkit Backend V2"
        );

        console.log(
            `🚀 Server running on port ${PORT}`
        );

        console.log(
            "🛡️ Ultra Strict Factual Mode: ON"
        );

        console.log(
            "======================================"
        );

    }
);
