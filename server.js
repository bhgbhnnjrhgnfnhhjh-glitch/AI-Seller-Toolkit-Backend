/* =========================================================
   AI SELLER TOOLKIT
   COMPLETE GEMINI BACKEND
   Existing /generate + Complete Listing API
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

const PORT = process.env.PORT || 3000;

const API_KEY =
    process.env.GEMINI_API_KEY;


if (!API_KEY) {

    console.error(
        "❌ GEMINI_API_KEY is missing!"
    );

}


/* =========================================================
   GEMINI CLIENT
========================================================= */

const ai = new GoogleGenAI({
    apiKey: API_KEY
});


/* =========================================================
   HOME / HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {

    res.json({

        status: "success",

        message:
            "✅ AI Seller Toolkit Gemini Backend is running!",

        endpoints: [

            "POST /generate",

            "POST /api/generate-listing"

        ]

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
                    `🤖 Trying ${model} - Attempt ${attempt}`
                );


                const response =
                    await ai.models.generateContent({

                        model: model,

                        contents: prompt

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

                lastError = error;


                console.error(

                    `❌ ${model} attempt ${attempt} failed:`,

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


                if (!temporaryError) {

                    break;

                }


                if (attempt < 3) {

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


    throw lastError ||

        new Error(
            "Gemini API request failed"
        );

}


/* =========================================================
   OLD /generate ENDPOINT
   Existing tools continue to work
========================================================= */

app.post(
    "/generate",
    async (req, res) => {

        try {

            const prompt =
                req.body.prompt;


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


            console.log(
                "📥 Existing Gemini request received"
            );


            const result =
                await generateWithRetry(
                    prompt
                );


            console.log(
                "✅ Gemini generation successful"
            );


            return res.json({

                result: result

            });


        } catch (error) {

            return handleGeminiError(
                error,
                res
            );

        }

    }
);


/* =========================================================
   CATEGORY RULES
========================================================= */

const CATEGORY_RULES = {

    "Fashion": `
Focus on clothing type, fabric, color,
pattern, size, fit, occasion and care information
only when provided by the seller.
Do not invent fabric, size, quality or features.
`,

    "Beauty": `
Focus on product type, variant, quantity,
ingredients and intended cosmetic use only
when provided.
Do not invent medical claims or guaranteed results.
`,

    "Electronics": `
Focus on device type, brand, model,
compatibility, connectivity, power,
capacity and included items only when provided.
Do not invent specifications.
`,

    "Home & Kitchen": `
Focus on product type, material, dimensions,
capacity, color, usage and design.
Use only information supplied by the seller.
`,

    "Shoes": `
Focus on footwear type, material, size,
color, sole, closure and occasion
only when provided.
`,

    "Jewellery": `
Focus on jewellery type, material,
design, color, size and occasion.
Do not claim precious-metal purity unless provided.
`,

    "Toys": `
Focus on toy type, recommended age,
material, dimensions, color and usage.
Do not invent safety certifications.
`,

    "Books": `
Focus on title, author, language,
format, pages, publisher, edition
and subject when provided.
`,

    "Pet": `
Focus on pet product type, animal type,
size, material, quantity, usage and ingredients
when provided.
Do not make veterinary or medical claims.
`,

    "Sports": `
Focus on sports equipment type,
material, size, activity, usage,
weight and included items when provided.
`,

    "Automotive": `
Focus on vehicle compatibility,
part/accessory type, material,
model, dimensions and usage.
Do not claim compatibility unless provided.
`,

    "Garden": `
Focus on garden product type,
material, size, quantity, usage
and plant compatibility when provided.
`,

    "Food": `
Focus on food type, flavour,
quantity, ingredients, packaging,
dietary information and shelf-life
only when provided.
Do not invent nutritional or health claims.
`,

    "Gifts": `
Focus on gift type, recipient,
occasion, material, design,
color, quantity and packaging
when provided.
`

};


/* =========================================================
   COMPLETE LISTING PROMPT
========================================================= */

function createListingPrompt(product) {

    const category =
        product.category || "Other";


    const categoryRule =
        CATEGORY_RULES[category] ||
        "Use only seller-provided product information.";


    return `

You are the AI Product Listing Generator
for "AI Seller Toolkit".

Your task is to create a professional
e-commerce product listing.

CATEGORY:
${category}

CATEGORY RULES:
${categoryRule}


SELLER PROVIDED INFORMATION:

Product Name:
${product.productName || "Not provided"}

Brand:
${product.brand || "Not provided"}

Price:
${product.price || "Not provided"}

Color:
${product.color || "Not provided"}

Material / Fabric:
${product.material || "Not provided"}

Size / Dimensions:
${product.size || "Not provided"}

Model / SKU:
${product.model || "Not provided"}

Quantity:
${product.quantity || "Not provided"}

Features:
${product.features || "Not provided"}

Additional Information:
${product.description || "Not provided"}


IMPORTANT FACTUAL RULES:

1. NEVER invent product specifications.

2. NEVER invent brand information.

3. NEVER invent material.

4. NEVER invent size or dimensions.

5. NEVER invent certifications.

6. NEVER invent warranty information.

7. NEVER invent health or medical claims.

8. NEVER claim waterproof, original,
   premium, guaranteed, durable,
   FDA approved, BIS certified,
   ISI certified or similar claims
   unless the seller provided them.

9. If information is missing,
   do not make up a value.

10. Write natural marketplace-friendly language.

11. Do not mention that you are an AI.

12. Do not use fake promotional claims.

13. Keep the title clear and useful.

14. Generate category-specific keywords.

15. Return ONLY valid JSON.

USE THIS EXACT JSON FORMAT:

{
  "title": "",
  "description": "",
  "highlights": [],
  "seoKeywords": [],
  "tags": [],
  "specifications": {}
}

TITLE:
Create one professional product title.

DESCRIPTION:
Write a clear e-commerce description
using only supplied information.

HIGHLIGHTS:
Create 4-8 useful bullet points.
Only use factual information.

SEO KEYWORDS:
Create relevant search keywords
based on the product and category.

TAGS:
Create relevant marketplace search tags.

SPECIFICATIONS:
Include only specifications
that were actually provided by the seller.

Do not add empty specifications.

Return JSON only.
`;
}


/* =========================================================
   REMOVE MARKDOWN JSON BLOCK
========================================================= */

function cleanJsonText(text) {

    let cleaned =
        String(text || "").trim();


    if (
        cleaned.startsWith("```json")
    ) {

        cleaned =
            cleaned.substring(7);

    }


    if (
        cleaned.startsWith("```")
    ) {

        cleaned =
            cleaned.substring(3);

    }


    if (
        cleaned.endsWith("```")
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
   VALIDATE LISTING
========================================================= */

function validateListing(listing) {

    if (
        !listing ||
        typeof listing !== "object"
    ) {

        throw new Error(
            "Invalid listing returned by AI"
        );

    }


    return {

        title:
            typeof listing.title === "string"
                ? listing.title
                : "",

        description:
            typeof listing.description === "string"
                ? listing.description
                : "",

        highlights:
            Array.isArray(
                listing.highlights
            )
                ? listing.highlights
                : [],

        seoKeywords:
            Array.isArray(
                listing.seoKeywords
            )
                ? listing.seoKeywords
                : [],

        tags:
            Array.isArray(
                listing.tags
            )
                ? listing.tags
                : [],

        specifications:
            listing.specifications &&
            typeof listing.specifications === "object"
                ? listing.specifications
                : {}

    };

}


/* =========================================================
   NEW COMPLETE LISTING ENDPOINT
========================================================= */

app.post(
    "/api/generate-listing",
    async (req, res) => {

        try {

            if (!API_KEY) {

                return res.status(500).json({

                    success: false,

                    message:
                        "GEMINI_API_KEY is not configured on Render."

                });

            }


            const product =
                req.body?.product;


            if (!product) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product data is required."

                });

            }


            if (
                !product.productName ||
                !String(
                    product.productName
                ).trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product Name is required."

                });

            }


            console.log(
                "📥 Complete Listing request:",
                product.category,
                product.productName
            );


            const prompt =
                createListingPrompt(
                    product
                );


            const aiText =
                await generateWithRetry(
                    prompt
                );


            console.log(
                "🤖 Raw listing response received"
            );


            const cleaned =
                cleanJsonText(
                    aiText
                );


            let listing;


            try {

                listing =
                    JSON.parse(
                        cleaned
                    );

            } catch (jsonError) {

                console.error(
                    "❌ Invalid JSON from Gemini:",
                    cleaned
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "AI returned invalid listing JSON.",

                    raw:
                        cleaned

                });

            }


            listing =
                validateListing(
                    listing
                );


            console.log(
                "✅ Complete Listing generated successfully"
            );


            return res.json({

                success: true,

                listing: listing

            });


        } catch (error) {

            console.error(
                "❌ Complete Listing Error:",
                error
            );


            return handleGeminiError(
                error,
                res
            );

        }

    }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

function handleGeminiError(
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


    console.error(
        "❌ Gemini Error:",
        details
    );


    if (
        status === 429
    ) {

        return res.status(503).json({

            success: false,

            error:
                "Gemini quota/rate limit reached.",

            details:
                "Please check your Gemini API quota."

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

            success: false,

            error:
                "Gemini service is temporarily busy.",

            details:
                "Please try again after a few seconds."

        });

    }


    return res.status(500).json({

        success: false,

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
            `🚀 Server running on port ${PORT}`
        );

    }
);
