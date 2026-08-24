// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE LISTING GENERATOR
// CATEGORY-AWARE VERSION 2
// FRONTEND -> RENDER BACKEND -> GEMINI
// ==========================================================


// ==========================================================
// BACKEND URL
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com/generate";


// ==========================================================
// DOM ELEMENTS
// ==========================================================

const generateButton =
    document.getElementById("generateListingBtn");

const categorySelect =
    document.getElementById("category");

const resultCard =
    document.getElementById("resultCard");

const listingResult =
    document.getElementById("listingResult");

const statusMessage =
    document.getElementById("statusMessage");


// ==========================================================
// CHECK HTML ELEMENTS
// ==========================================================

if (!generateButton) {

    console.error(
        "❌ Generate button not found: #generateListingBtn"
    );

}


// ==========================================================
// BASIC VALUE HELPER
// ==========================================================

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();

}


// ==========================================================
// GET VISIBLE CATEGORY FIELDS
// ==========================================================

function getCategoryData() {

    const data = {};

    const visibleSections =
        document.querySelectorAll(
            ".dynamic-field:not(.hidden-field)"
        );


    visibleSections.forEach(section => {

        const fields =
            section.querySelectorAll(
                "input, textarea, select"
            );


        fields.forEach(field => {

            const name =
                field.getAttribute("name");

            if (!name) {
                return;
            }


            const value =
                field.value.trim();


            if (!value) {
                return;
            }


            data[name] = value;

        });

    });


    return data;

}


// ==========================================================
// ESCAPE / CLEAN TEXT
// ==========================================================

function cleanText(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/\s+/g, " ")
        .trim();

}


// ==========================================================
// BUILD PRODUCT DATA
// ==========================================================

function collectProductData() {


    const category =
        cleanText(
            getValue("category")
        );


    const productName =
        cleanText(
            getValue("productName")
        );


    const brand =
        cleanText(
            getValue("brand")
        );


    const price =
        cleanText(
            getValue("price")
        );


    const productFeatures =
        cleanText(
            getValue("productFeatures")
        );


    const extraInfo =
        cleanText(
            getValue("extraInfo")
        );


    const categoryData =
        getCategoryData();


    return {

        category,

        productName,

        brand,

        price,

        categoryData,

        productFeatures,

        extraInfo

    };

}


// ==========================================================
// VALIDATE PRODUCT
// ==========================================================

function validateProduct(product) {


    if (!product.category) {

        return "Please select a product category.";

    }


    if (!product.productName) {

        return "Please enter the Product Name.";

    }


    return null;

}


// ==========================================================
// CREATE AI PROMPT
// ==========================================================

function createPrompt(product) {


    const categoryDataText =
        Object.entries(
            product.categoryData
        )
        .map(
            ([key, value]) =>
                `${key}: ${value}`
        )
        .join("\n");


    const prompt = `

You are the AI Product Listing Generator
for AI Seller Toolkit.

Create a professional marketplace-ready
product listing.

IMPORTANT RULES:

1. Use ONLY information supplied by the seller.
2. DO NOT invent product specifications.
3. DO NOT add unsupported features.
4. DO NOT invent warranty.
5. DO NOT invent battery capacity.
6. DO NOT invent certifications.
7. DO NOT invent ingredients.
8. DO NOT invent dimensions.
9. DO NOT invent material.
10. DO NOT invent benefits.
11. DO NOT invent compatibility.
12. DO NOT invent delivery information.
13. If a field is missing, simply do not include it.
14. Do not write "unknown" unless necessary.
15. Keep the listing factual.
16. Category must affect the listing.
17. Use the exact product information provided.

CATEGORY:

${product.category}


PRODUCT NAME:

${product.productName}


BRAND:

${product.brand || "Not provided"}


PRICE:

${product.price || "Not provided"}


CATEGORY-SPECIFIC INFORMATION:

${categoryDataText || "No additional category information provided."}


PRODUCT FEATURES:

${product.productFeatures || "No additional features provided."}


EXTRA PRODUCT INFORMATION:

${product.extraInfo || "None provided."}


GENERATE THE LISTING IN THIS EXACT STRUCTURE:

AI SELLER TOOLKIT
COMPLETE PRODUCT LISTING
==============================

PRODUCT TITLE

Create a clear marketplace-friendly title
using only supplied information.


DESCRIPTION

Write a factual product description.


KEY HIGHLIGHTS

Use 4-7 bullet points based only on
provided information.


SEO KEYWORDS

Provide 5-8 relevant search keywords.

Do not add unsupported claims.


SEARCH TAGS

Provide 5-8 short relevant tags.


SPECIFICATIONS

Show only specifications that were
actually provided by the seller.

Do NOT create missing specifications.


==============================

Generated by AI Seller Toolkit

`;


    return prompt.trim();

}


// ==========================================================
// SET STATUS
// ==========================================================

function setStatus(
    message,
    type = "normal"
) {


    if (!statusMessage) {
        return;
    }


    statusMessage.textContent =
        message;


    if (type === "error") {

        statusMessage.style.color =
            "#dc2626";

    }
    else if (type === "success") {

        statusMessage.style.color =
            "#15803d";

    }
    else {

        statusMessage.style.color =
            "#374151";

    }

}


// ==========================================================
// GENERATE LISTING
// ==========================================================

async function generateListing() {


    console.log(
        "🚀 Generate Listing button clicked"
    );


    const product =
        collectProductData();


    console.log(
        "📦 Product data:",
        product
    );


    const validationError =
        validateProduct(product);


    if (validationError) {

        setStatus(
            "❌ " + validationError,
            "error"
        );

        return;

    }


    const prompt =
        createPrompt(product);


    console.log(
        "📤 Sending request to backend..."
    );


    // ======================================================
    // BUTTON LOADING
    // ======================================================

    generateButton.disabled = true;

    generateButton.textContent =
        "⏳ Generating...";


    setStatus(
        "🤖 AI listing बना रहा है...",
        "normal"
    );


    if (resultCard) {

        resultCard.style.display =
            "none";

    }


    try {


        // ==================================================
        // REQUEST
        // ==================================================

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        prompt: prompt

                    })

                }
            );


        console.log(
            "📥 Backend status:",
            response.status
        );


        // ==================================================
        // READ RESPONSE
        // ==================================================

        let data = {};

        try {

            data =
                await response.json();

        }
        catch (jsonError) {

            throw new Error(
                "Backend ने valid JSON response नहीं दिया।"
            );

        }


        console.log(
            "📦 Backend response:",
            data
        );


        // ==================================================
        // ERROR RESPONSE
        // ==================================================

        if (!response.ok) {


            const errorMessage =
                data.error ||
                data.details ||
                "Backend request failed.";


            throw new Error(
                errorMessage
            );

        }


        // ==================================================
        // RESULT
        // ==================================================

        const result =
            data.result ||
            data.response ||
            data.text ||
            data.output;


        if (!result) {

            throw new Error(
                "AI से listing response नहीं मिला।"
            );

        }


        // ==================================================
        // SHOW RESULT
        // ==================================================

        if (listingResult) {

            listingResult.textContent =
                result;

        }


        if (resultCard) {

            resultCard.style.display =
                "block";

            resultCard.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


        setStatus(
            "✅ Complete Listing तैयार है!",
            "success"
        );


        console.log(
            "✅ Listing generated successfully"
        );


    }
    catch (error) {


        console.error(
            "❌ Generate Listing Error:",
            error
        );


        let message =
            error.message ||
            "कुछ गलत हो गया।";


        // ==================================================
        // RENDER FREE INSTANCE MESSAGE
        // ==================================================

        if (
            message.includes(
                "Failed to fetch"
            )
        ) {

            message =
                "Backend से connection नहीं हो रहा। Render server को start होने में थोड़ा समय लग सकता है।";

        }


        setStatus(
            "❌ " + message,
            "error"
        );


    }
    finally {


        // ==================================================
        // RESTORE BUTTON
        // ==================================================

        generateButton.disabled =
            false;


        generateButton.textContent =
            "✨ Generate Complete Listing";


    }

}


// ==========================================================
// BUTTON EVENT
// ==========================================================

if (generateButton) {


    generateButton.addEventListener(
        "click",
        generateListing
    );


    console.log(
        "✅ Generate button connected successfully"
    );

}


// ==========================================================
// CATEGORY CHANGE DEBUG
// ==========================================================

if (categorySelect) {

    categorySelect.addEventListener(
        "change",
        () => {

            console.log(
                "📂 Category changed:",
                categorySelect.value
            );

        }
    );

}


// ==========================================================
// BACKEND CONNECTION TEST
// ==========================================================

async function checkBackend() {


    try {


        console.log(
            "🔍 Checking AI Seller Toolkit backend..."
        );


        const response =
            await fetch(
                "https://ai-seller-toolkit-backend-1.onrender.com/",
                {
                    method: "GET"
                }
            );


        if (response.ok) {

            console.log(
                "✅ Backend is online"
            );

        }
        else {

            console.warn(
                "⚠️ Backend returned status:",
                response.status
            );

        }


    }
    catch (error) {


        console.warn(
            "⚠️ Backend check failed:",
            error.message
        );


    }

}


// ==========================================================
// START BACKEND CHECK
// ==========================================================

checkBackend();


// ==========================================================
// DEBUG MESSAGE
// ==========================================================

console.log(
    "🤖 AI Seller Toolkit Complete Listing Generator V2 loaded"
);

console.log(
    "🔗 Backend:",
    API_URL
);
