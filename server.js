// ==========================================================
// AI SELLER TOOLKIT
// GEMINI BACKEND
// SERVER.JS VERSION 3
// STRICT FACTUAL + CATEGORY-AWARE
// ==========================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();


// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(cors());

app.use(express.json({
    limit: "1mb"
}));


// ==========================================================
// CONFIG
// ==========================================================

const PORT =
    process.env.PORT || 3000;

const API_KEY =
    process.env.GEMINI_API_KEY;

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash";


// ==========================================================
// API KEY CHECK
// ==========================================================

if (!API_KEY) {

    console.error(
        "❌ GEMINI_API_KEY is missing!"
    );

}


// ==========================================================
// GEMINI CLIENT
// ==========================================================

const ai = new GoogleGenAI({
    apiKey: API_KEY
});


// ==========================================================
// HOME / HEALTH CHECK
// ==========================================================

app.get("/", (req, res) => {

    res.json({

        status: "success",

        message:
            "✅ AI Seller Toolkit Gemini Backend V3 is running!",

        version:
            "3.0",

        mode:
            "Strict Factual + Category-Aware",

        model:
            MODEL

    });

});


// ==========================================================
// CATEGORY RULES
// ==========================================================

const categoryRules = {

    "Fashion": [
        "fabric",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity"
    ],

    "Beauty": [
        "form",
        "color",
        "quantity",
        "variant",
        "ingredients",
        "skinType",
        "hairType",
        "fragrance"
    ],

    "Electronics": [
        "model",
        "color",
        "storage",
        "ram",
        "battery",
        "connectivity",
        "compatibility",
        "warranty",
        "quantity"
    ],

    "Home & Kitchen": [
        "material",
        "color",
        "dimensions",
        "capacity",
        "quantity",
        "usage"
    ],

    "Shoes": [
        "material",
        "color",
        "size",
        "sole",
        "closure",
        "occasion",
        "quantity"
    ],

    "Jewellery": [
        "material",
        "color",
        "design",
        "size",
        "stone",
        "occasion",
        "quantity"
    ],

    "Toys": [
        "material",
        "color",
        "size",
        "ageGroup",
        "battery",
        "quantity"
    ],

    "Books": [
        "author",
        "language",
        "format",
        "pages",
        "publisher",
        "edition",
        "isbn"
    ],

    "Pet": [
        "petType",
        "material",
        "size",
        "quantity",
        "ingredients",
        "flavour"
    ],

    "Sports": [
        "material",
        "color",
        "size",
        "weight",
        "activity",
        "quantity"
    ],

    "Automotive": [
        "model",
        "vehicleCompatibility",
        "material",
        "color",
        "dimensions",
        "quantity"
    ],

    "Garden": [
        "material",
        "color",
        "size",
        "quantity",
        "plantCompatibility",
        "usage"
    ],

    "Food": [
        "flavour",
        "quantity",
        "ingredients",
        "packType",
        "dietaryInformation",
        "expiry",
        "shelfLife"
    ],

    "Gifts": [
        "material",
        "color",
        "design",
        "quantity",
        "occasion",
        "recipient",
        "packaging"
    ]

};


// ==========================================================
// DISPLAY FIELD NAMES
// ==========================================================

const fieldLabels = {

    productName:
        "Product Name",

    brand:
        "Brand",

    price:
        "Price",

    fabric:
        "Fabric / Material",

    material:
        "Material",

    color:
        "Color",

    size:
        "Size",

    dimensions:
        "Dimensions",

    capacity:
        "Capacity",

    quantity:
        "Quantity",

    pattern:
        "Pattern",

    fit:
        "Fit",

    occasion:
        "Occasion",

    form:
        "Form / Texture",

    variant:
        "Variant",

    ingredients:
        "Ingredients",

    skinType:
        "Skin Type",

    hairType:
        "Hair Type",

    fragrance:
        "Fragrance",

    model:
        "Model",

    storage:
        "Storage",

    ram:
        "RAM",

    battery:
        "Battery",

    connectivity:
        "Connectivity",

    compatibility:
        "Compatibility",

    warranty:
        "Warranty",

    sole:
        "Sole",

    closure:
        "Closure",

    design:
        "Design",

    stone:
        "Stone",

    ageGroup:
        "Age Group",

    author:
        "Author",

    language:
        "Language",

    format:
        "Format",

    pages:
        "Pages",

    publisher:
        "Publisher",

    edition:
        "Edition",

    isbn:
        "ISBN",

    petType:
        "Pet Type",

    flavour:
        "Flavour",

    weight:
        "Weight",

    activity:
        "Activity / Sport",

    vehicleCompatibility:
        "Vehicle Compatibility",

    usage:
        "Usage",

    plantCompatibility:
        "Plant Compatibility",

    packType:
        "Pack Type",

    dietaryInformation:
        "Dietary Information",

    expiry:
        "Expiry",

    shelfLife:
        "Shelf Life",

    recipient:
        "Recipient",

    packaging:
        "Packaging"

};


// ==========================================================
// CLEAN VALUE
// ==========================================================

function cleanValue(value) {

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


// ==========================================================
// CLEAN PRODUCT DATA
// ==========================================================

function cleanProductData(product) {

    if (
        !product ||
        typeof product !== "object"
    ) {

        return null;

    }


    const cleaned = {

        category:
            cleanValue(product.category),

        productName:
            cleanValue(product.productName),

        brand:
            cleanValue(product.brand),

        price:
            cleanValue(product.price),

        productFeatures:
            cleanValue(product.productFeatures),

        extraInfo:
            cleanValue(product.extraInfo),

        categoryData: {}

    };


    if (
        product.categoryData &&
        typeof product.categoryData === "object"
    ) {


        Object.entries(
            product.categoryData
        ).forEach(
            ([key, value]) => {

                const cleanedValue =
                    cleanValue(value);

                if (cleanedValue) {

                    cleaned.categoryData[key] =
                        cleanedValue;

                }

            }
        );

    }


    return cleaned;

}


// ==========================================================
// VALIDATE CATEGORY
// ==========================================================

function validateCategory(category) {

    return Object.prototype.hasOwnProperty.call(
        categoryRules,
        category
    );

}


// ==========================================================
// BUILD VERIFIED SPECIFICATIONS
// IMPORTANT:
// AI DOES NOT GENERATE THESE.
// SERVER CREATES THEM FROM USER INPUT.
// ==========================================================

function buildSpecifications(product) {

    const specifications = [];

    const category =
        product.category;


    // ------------------------------------------------------
    // BASIC INFORMATION
    // ------------------------------------------------------

    if (product.productName) {

        specifications.push({

            label:
                "Product Name",

            value:
                product.productName

        });

    }


    if (product.brand) {

        specifications.push({

            label:
                "Brand",

            value:
                product.brand

        });

    }


    // ------------------------------------------------------
    // CATEGORY FIELDS
    // ------------------------------------------------------

    const allowedFields =
        categoryRules[category] || [];


    allowedFields.forEach(
        field => {

            const value =
                product.categoryData[field];

            if (!value) {
                return;
            }


            specifications.push({

                label:
                    fieldLabels[field] ||
                    field,

                value:
                    value

            });

        }
    );


    // ------------------------------------------------------
    // PRICE
    // ------------------------------------------------------

    if (product.price) {

        specifications.push({

            label:
                "Price",

            value:
                product.price

        });

    }


    return specifications;

}


// ==========================================================
// SPECIFICATIONS TEXT FOR AI
// ==========================================================

function specificationsForAI(
    specifications
) {

    if (!specifications.length) {

        return "No specifications provided.";

    }


    return specifications
        .map(
            item =>
                `${item.label}: ${item.value}`
        )
        .join("\n");

}


// ==========================================================
// CREATE STRICT AI PROMPT
// ==========================================================

function createPrompt(
    product,
    specifications
) {


    const category =
        product.category;


    const specificationText =
        specificationsForAI(
            specifications
        );


    return `

You are the professional product listing AI
for "AI Seller Toolkit".

Your task is to create a marketplace-ready
product listing.

CATEGORY:
${category}


PRODUCT INFORMATION PROVIDED BY SELLER:

Product Name:
${product.productName || "Not provided"}

Brand:
${product.brand || "Not provided"}

Price:
${product.price || "Not provided"}


VERIFIED CATEGORY SPECIFICATIONS:

${specificationText}


SELLER PROVIDED PRODUCT FEATURES:

${product.productFeatures || "None provided."}


SELLER PROVIDED EXTRA INFORMATION:

${product.extraInfo || "None provided."}


==================================================
STRICT FACTUAL RULES
==================================================

RULE 1:
Use ONLY information supplied above.

RULE 2:
Never invent a specification.

RULE 3:
Never assume a product feature.

RULE 4:
Never create benefits that the seller did not provide.

RULE 5:
Never claim "premium".

RULE 6:
Never claim "best".

RULE 7:
Never claim "high quality".

RULE 8:
Never claim "durable".

RULE 9:
Never claim "leak proof".

RULE 10:
Never claim "waterproof".

RULE 11:
Never claim "BPA free".

RULE 12:
Never claim "food grade".

RULE 13:
Never claim "authentic".

RULE 14:
Never claim "original".

RULE 15:
Never claim "certified".

RULE 16:
Never create warranty information.

RULE 17:
Never create compatibility information.

RULE 18:
Never create battery information.

RULE 19:
Never create dimensions.

RULE 20:
Never create ingredients.

RULE 21:
Never create health or beauty benefits.

RULE 22:
Never create delivery promises.

RULE 23:
Never create discounts.

RULE 24:
Never create ratings or reviews.

RULE 25:
Never add information just because it is
common for this category.

RULE 26:
If information is missing, leave it out.

RULE 27:
Do not use words such as:
"premium",
"best",
"perfect",
"excellent",
"durable",
"authentic",
"original",
"sleek",
"generous",
"advanced",
unless the seller explicitly provided them.

RULE 28:
Do not add "designed for your Home & Kitchen needs"
or similar generic claims.

RULE 29:
SEO keywords must be based ONLY on
the actual supplied product information.

RULE 30:
Search tags must be based ONLY on
the actual supplied product information.

RULE 31:
The product title must contain ONLY
real supplied information.

RULE 32:
Do not put a specification in the title
unless that specification was provided.

RULE 33:
Do not mention "Model" unless a model
was provided.

RULE 34:
Do not mention "Capacity" unless capacity
was provided.

RULE 35:
Do not mention "Material" unless material
was provided.

RULE 36:
Do not mention "Color" unless color
was provided.

RULE 37:
Do not mention "Quantity" unless quantity
was provided.


==================================================
DESCRIPTION RULE
==================================================

Write a short factual description.

Use simple marketplace language.

Do not use marketing claims.

Do not exaggerate.

Do not add information.


==================================================
OUTPUT FORMAT
==================================================

Return ONLY the following sections:

PRODUCT TITLE

[title]


DESCRIPTION

[description]


KEY HIGHLIGHTS

• [fact]
• [fact]
• [fact]
• [fact]


SEO KEYWORDS

• [keyword]
• [keyword]
• [keyword]
• [keyword]
• [keyword]


SEARCH TAGS

• [tag]
• [tag]
• [tag]
• [tag]
• [tag]


IMPORTANT:

Do NOT generate the SPECIFICATIONS section.

The backend will add verified specifications
automatically.

Do not add any text before PRODUCT TITLE.

Do not add any text after SEARCH TAGS.

`;

}


// ==========================================================
// GEMINI GENERATION
// ==========================================================

async function generateWithRetry(
    prompt
) {


    let lastError = null;


    const models = [

        MODEL,

        "gemini-2.5-flash"

    ];


    const uniqueModels =
        [...new Set(models)];


    for (
        const model of uniqueModels
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


                return text.trim();

            }
            catch (error) {


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

                    message
                        .toLowerCase()
                        .includes(
                            "high demand"
                        ) ||

                    message
                        .toLowerCase()
                        .includes(
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


// ==========================================================
// GENERATE ENDPOINT
// ==========================================================

app.post(
    "/generate",
    async (req, res) => {


        try {


            // ------------------------------------------------
            // API KEY CHECK
            // ------------------------------------------------

            if (!API_KEY) {

                return res.status(500).json({

                    error:
                        "GEMINI_API_KEY is not configured on Render"

                });

            }


            // ------------------------------------------------
            // GET REQUEST DATA
            // ------------------------------------------------

            const product =
                cleanProductData(
                    req.body
                );


            if (!product) {

                return res.status(400).json({

                    error:
                        "Product data is required."

                });

            }


            // ------------------------------------------------
            // VALIDATE
            // ------------------------------------------------

            if (
                !product.category
            ) {

                return res.status(400).json({

                    error:
                        "Product category is required."

                });

            }


            if (
                !validateCategory(
                    product.category
                )
            ) {

                return res.status(400).json({

                    error:
                        "Unsupported product category."

                });

            }


            if (
                !product.productName
            ) {

                return res.status(400).json({

                    error:
                        "Product name is required."

                });

            }


            console.log(
                "📥 Product request received"
            );


            console.log(
                "📂 Category:",
                product.category
            );


            console.log(
                "🛍️ Product:",
                product.productName
            );


            // ------------------------------------------------
            // BUILD VERIFIED SPECS
            // ------------------------------------------------

            const specifications =
                buildSpecifications(
                    product
                );


            console.log(
                "🔐 Verified specifications:",
                specifications
            );


            // ------------------------------------------------
            // CREATE PROMPT
            // ------------------------------------------------

            const prompt =
                createPrompt(
                    product,
                    specifications
                );


            // ------------------------------------------------
            // GEMINI
            // ------------------------------------------------

            const aiResult =
                await generateWithRetry(
                    prompt
                );


            // ------------------------------------------------
            // ADD SERVER-VERIFIED SPECS
            // ------------------------------------------------

            let finalResult =
                aiResult;


            finalResult +=
                "\n\nSPECIFICATIONS\n\n";


            specifications.forEach(
                item => {

                    finalResult +=
                        `• ${item.label}: ${item.value}\n`;

                }
            );


            finalResult +=
                "\n==============================\n";

            finalResult +=
                "Generated by AI Seller Toolkit";


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            console.log(
                "✅ Listing generated successfully"
            );


            return res.json({

                success:
                    true,

                version:
                    "3.0",

                category:
                    product.category,

                result:
                    finalResult

            });

        }
        catch (error) {


            console.error(
                "❌ Final Gemini Error:",
                error
            );


            const status =
                error?.status ||
                error?.code ||
                error?.error?.code ||
                500;


            const details =
                error?.message ||
                error?.error?.message ||
                "Unknown Gemini API error";


            // ------------------------------------------------
            // RATE LIMIT
            // ------------------------------------------------

            if (
                status === 429
            ) {

                return res.status(503).json({

                    error:
                        "Gemini API limit reached. Please try again later."

                });

            }


            // ------------------------------------------------
            // TEMPORARY SERVER ERROR
            // ------------------------------------------------

            if (
                status === 500 ||
                status === 502 ||
                status === 503
            ) {

                return res.status(503).json({

                    error:
                        "Gemini service is temporarily unavailable. Please try again."

                });

            }


            // ------------------------------------------------
            // GENERAL ERROR
            // ------------------------------------------------

            return res.status(500).json({

                error:
                    "Gemini API request failed",

                details:
                    details

            });

        }

    }
);


// ==========================================================
// 404 HANDLER
// ==========================================================

app.use(
    (req, res) => {

        res.status(404).json({

            error:
                "Endpoint not found."

        });

    }
);


// ==========================================================
// GLOBAL ERROR HANDLER
// ==========================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "❌ Server error:",
            error
        );


        res.status(500).json({

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
            "=========================================="
        );

        console.log(
            "🤖 AI SELLER TOOLKIT BACKEND"
        );

        console.log(
            "🚀 Server running on port:",
            PORT
        );

        console.log(
            "📦 Version: 3.0"
        );

        console.log(
            "🔐 Mode: Strict Factual"
        );

        console.log(
            "📂 Mode: Category-Aware"
        );

        console.log(
            "🤖 Model:",
            MODEL
        );

        console.log(
            "=========================================="
        );

    }
);
