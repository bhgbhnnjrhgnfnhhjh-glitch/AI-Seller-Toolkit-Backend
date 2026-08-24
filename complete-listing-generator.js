"use strict";

// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE LISTING GENERATOR
// BACKEND API VERSION
// ==========================================================


// ==========================================================
// BACKEND URL
// ==========================================================
//
// IMPORTANT:
// अगर आपका backend Render पर है,
// तो नीचे अपना Render backend URL डालें.
//
// Example:
// https://your-backend.onrender.com
//
// Local testing:
// http://localhost:5000
// ==========================================================

const BACKEND_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

// ==========================================================
// API ENDPOINT
// ==========================================================

const API_ENDPOINT =
    `${BACKEND_URL}/api/generate-listing`;


// ==========================================================
// CATEGORY RULES
// ==========================================================

const CATEGORY_RULES = {

    "Fashion": `
Focus on clothing type, fabric, color, pattern,
size, fit, occasion and care information only
when provided by the seller.
`,

    "Beauty": `
Focus on product type, variant, quantity,
skin/hair usage, ingredients and benefits only
when provided by the seller.
Do not invent medical claims.
`,

    "Electronics": `
Focus on device type, brand, model,
compatibility, connectivity, power,
capacity and included items only when provided.
`,

    "Home & Kitchen": `
Focus on product type, material, dimensions,
capacity, color, usage and design.
`,

    "Shoes": `
Focus on footwear type, material,
size, color, sole, closure and occasion
only when provided.
`,

    "Jewellery": `
Focus on jewellery type, material,
design, color, size and occasion.
Do not claim precious metal purity unless provided.
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
Do not invent veterinary or medical claims.
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
Focus on plant/garden product type,
material, size, quantity, usage,
plant compatibility and growing information
only when provided.
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
only when provided.
`

};


// ==========================================================
// ELEMENT HELPER
// ==========================================================

function $(id) {

    return document.getElementById(id);
}


// ==========================================================
// SHOW MESSAGE
// ==========================================================

function showMessage(message, type = "success") {

    const box = $("message");

    if (!box) return;

    box.textContent = message;

    box.className = type;

    box.style.display = "block";

    setTimeout(() => {

        box.style.display = "none";

    }, 5000);
}


// ==========================================================
// COLLECT PRODUCT DATA
// ==========================================================

function collectProductData() {

    return {

        category: $("category").value.trim(),

        productName:
            $("productName").value.trim(),

        brand:
            $("brand").value.trim(),

        price:
            $("price").value.trim(),

        color:
            $("color").value.trim(),

        material:
            $("material").value.trim(),

        size:
            $("size").value.trim(),

        model:
            $("model").value.trim(),

        quantity:
            $("quantity").value.trim(),

        features:
            $("features").value.trim(),

        description:
            $("description").value.trim()

    };
}


// ==========================================================
// VALIDATE
// ==========================================================

function validateProduct(data) {

    if (!data.productName) {

        showMessage(
            "❌ कृपया Product Name भरें।",
            "error"
        );

        $("productName").focus();

        return false;
    }

    if (!data.category) {

        showMessage(
            "❌ कृपया Category चुनें।",
            "error"
        );

        return false;
    }

    return true;
}


// ==========================================================
// GENERATE LISTING
// ==========================================================

async function generateListing() {

    const button =
        $("generateListingBtn");

    const loading =
        $("loading");


    const product =
        collectProductData();


    if (!validateProduct(product)) {

        return;
    }


    button.disabled = true;

    loading.style.display = "block";


    try {

        showMessage(
            "🤖 AI से listing तैयार हो रही है...",
            "success"
        );


        const response =
            await fetch(API_ENDPOINT, {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    product,

                    categoryRules:
                        CATEGORY_RULES[
                            product.category
                        ]

                })

            });


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                `HTTP Error ${response.status}`
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Backend listing generation failed."
            );
        }


        displayListing(
            result.listing
        );


        localStorage.setItem(
            "latestCompleteListing",
            JSON.stringify(
                result.listing
            )
        );


        showMessage(
            "✅ Complete Listing तैयार हो गई!",
            "success"
        );


    } catch (error) {

        console.error(
            "Complete Listing Error:",
            error
        );


        showMessage(
            "❌ Backend/API से listing नहीं बन पाई: " +
            error.message,
            "error"
        );


    } finally {

        button.disabled = false;

        loading.style.display = "none";
    }
}


// ==========================================================
// DISPLAY LISTING
// ==========================================================

function displayListing(listing) {

    $("listingResult").style.display =
        "block";


    $("generatedTitle").value =
        listing.title || "";


    $("generatedDescription").value =
        listing.description || "";


    $("generatedHighlights").value =
        formatArray(
            listing.highlights
        );


    $("generatedKeywords").value =
        formatArray(
            listing.seoKeywords
        );


    $("generatedTags").value =
        formatArray(
            listing.tags
        );


    $("generatedSpecifications").value =
        formatSpecifications(
            listing.specifications
        );


    $("listingResult")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// ==========================================================
// ARRAY FORMAT
// ==========================================================

function formatArray(value) {

    if (!Array.isArray(value)) {

        return value || "";
    }

    return value
        .map(item => `• ${item}`)
        .join("\n");
}


// ==========================================================
// SPECIFICATIONS FORMAT
// ==========================================================

function formatSpecifications(value) {

    if (!value) {

        return "";
    }


    if (typeof value === "string") {

        return value;
    }


    return Object.entries(value)
        .map(
            ([key, val]) =>
                `${key}: ${val}`
        )
        .join("\n");
}


// ==========================================================
// COPY COMPLETE LISTING
// ==========================================================

async function copyCompleteListing() {

    const title =
        $("generatedTitle").value;

    const description =
        $("generatedDescription").value;

    const highlights =
        $("generatedHighlights").value;

    const keywords =
        $("generatedKeywords").value;

    const tags =
        $("generatedTags").value;

    const specifications =
        $("generatedSpecifications").value;


    const text =

`AI SELLER TOOLKIT
COMPLETE PRODUCT LISTING

PRODUCT TITLE
${title}

DESCRIPTION
${description}

KEY HIGHLIGHTS
${highlights}

SEO KEYWORDS
${keywords}

SEARCH TAGS
${tags}

SPECIFICATIONS
${specifications}
`;


    try {

        await navigator.clipboard.writeText(
            text
        );

        showMessage(
            "✅ Complete Listing copy हो गई!",
            "success"
        );

    } catch (error) {

        showMessage(
            "❌ Copy नहीं हो सकी।",
            "error"
        );
    }
}


// ==========================================================
// DOWNLOAD
// ==========================================================

function downloadListing() {

    const text =

`AI SELLER TOOLKIT
COMPLETE PRODUCT LISTING

PRODUCT TITLE
${$("generatedTitle").value}

DESCRIPTION
${$("generatedDescription").value}

KEY HIGHLIGHTS
${$("generatedHighlights").value}

SEO KEYWORDS
${$("generatedKeywords").value}

SEARCH TAGS
${$("generatedTags").value}

SPECIFICATIONS
${$("generatedSpecifications").value}
`;


    const blob =
        new Blob(
            [text],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "complete-product-listing.txt";


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);


    showMessage(
        "✅ Listing download हो गई!",
        "success"
    );
}


// ==========================================================
// CLEAR
// ==========================================================

function clearListing() {

    document.querySelectorAll(
        "input, textarea"
    ).forEach(element => {

        element.value = "";

    });


    $("listingResult")
        .style.display = "none";


    localStorage.removeItem(
        "latestCompleteListing"
    );


    showMessage(
        "🧹 Form साफ हो गया।",
        "success"
    );
}


// ==========================================================
// BUTTON EVENTS
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        $("generateListingBtn")
            .addEventListener(
                "click",
                generateListing
            );


        $("copyListingBtn")
            .addEventListener(
                "click",
                copyCompleteListing
            );


        $("downloadListingBtn")
            .addEventListener(
                "click",
                downloadListing
            );


        $("clearListingBtn")
            .addEventListener(
                "click",
                clearListing
            );


        console.log(
            "✅ Complete Listing Generator loaded."
        );

    }
);


// ==========================================================
// GLOBAL
// ==========================================================

window.generateListing =
    generateListing;

window.copyCompleteListing =
    copyCompleteListing;

window.downloadListing =
    downloadListing;

window.clearListing =
    clearListing;
