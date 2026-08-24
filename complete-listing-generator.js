"use strict";

/*
==========================================================
 AI SELLER TOOLKIT
 COMPLETE LISTING GENERATOR
 VERSION 2

 Backend:
 https://ai-seller-toolkit-backend-1.onrender.com

 Features:
 - 14 Categories
 - Strict Factual Listing
 - Backend AI Generation
 - Category-specific fields
 - Title
 - Description
 - Highlights
 - SEO Keywords
 - Search Tags
 - Specifications
 - Copy
 - Download
 - LocalStorage
==========================================================
*/


/* =========================================================
   1. BACKEND CONFIG
========================================================= */

const BACKEND_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const API_ENDPOINT =
    `${BACKEND_URL}/api/generate-listing`;


/* =========================================================
   2. CATEGORY CONFIGURATION
========================================================= */

const CATEGORY_CONFIG = {

    "Fashion": {

        emoji: "👗",

        fields: [
            "Product Type",
            "Fabric / Material",
            "Color",
            "Size",
            "Pattern",
            "Fit",
            "Occasion"
        ],

        rules: `
Do not assume gender, age group, fit,
fabric type, pattern or occasion unless
the seller explicitly provides it.
`
    },


    "Beauty": {

        emoji: "💄",

        fields: [
            "Product Type",
            "Brand",
            "Variant",
            "Quantity",
            "Ingredients",
            "Skin / Hair Type",
            "Fragrance"
        ],

        rules: `
Do not make medical, therapeutic,
dermatological or guaranteed-result claims.
Do not invent ingredients.
`
    },


    "Electronics": {

        emoji: "📱",

        fields: [
            "Product Type",
            "Brand",
            "Model",
            "Color",
            "Storage / Capacity",
            "Connectivity",
            "Compatibility",
            "Power"
        ],

        rules: `
Do not invent specifications,
battery capacity, warranty,
connectivity or compatibility.
`
    },


    "Home & Kitchen": {

        emoji: "🏠",

        fields: [
            "Product Type",
            "Material",
            "Color",
            "Size / Dimensions",
            "Capacity",
            "Quantity",
            "Usage"
        ],

        rules: `
Do not invent dimensions, capacity,
material or product usage.
`
    },


    "Shoes": {

        emoji: "👟",

        fields: [
            "Product Type",
            "Brand",
            "Material",
            "Color",
            "Size",
            "Sole",
            "Closure",
            "Occasion"
        ],

        rules: `
Do not assume men's, women's or kids'
unless explicitly provided.
Do not invent sole or material.
`
    },


    "Jewellery": {

        emoji: "💍",

        fields: [
            "Product Type",
            "Material",
            "Color",
            "Design",
            "Size",
            "Occasion",
            "Stone / Gem"
        ],

        rules: `
Do not claim gold, silver,
diamond, purity or precious-metal
content unless explicitly provided.
`
    },


    "Toys": {

        emoji: "🧸",

        fields: [
            "Product Type",
            "Brand",
            "Material",
            "Color",
            "Size",
            "Age Group",
            "Quantity"
        ],

        rules: `
Do not invent recommended age,
safety certification or educational claims.
`
    },


    "Books": {

        emoji: "📚",

        fields: [
            "Title",
            "Author",
            "Language",
            "Format",
            "Pages",
            "Publisher",
            "Edition",
            "ISBN"
        ],

        rules: `
Do not invent author, publisher,
ISBN, edition or page count.
`
    },


    "Pet": {

        emoji: "🐶",

        fields: [
            "Product Type",
            "Pet Type",
            "Brand",
            "Material",
            "Size",
            "Quantity",
            "Ingredients"
        ],

        rules: `
Do not make veterinary,
medical or health claims.
Do not invent ingredients.
`
    },


    "Sports": {

        emoji: "🏋️",

        fields: [
            "Product Type",
            "Brand",
            "Material",
            "Color",
            "Size",
            "Weight",
            "Sport / Activity"
        ],

        rules: `
Do not invent weight, dimensions,
material or performance claims.
`
    },


    "Automotive": {

        emoji: "🚗",

        fields: [
            "Product Type",
            "Brand",
            "Model",
            "Vehicle Compatibility",
            "Material",
            "Color",
            "Size",
            "Quantity"
        ],

        rules: `
Do not claim vehicle compatibility
unless explicitly provided.
Do not invent OEM or certification claims.
`
    },


    "Garden": {

        emoji: "🌱",

        fields: [
            "Product Type",
            "Brand",
            "Material",
            "Size",
            "Quantity",
            "Plant Compatibility",
            "Usage"
        ],

        rules: `
Do not invent plant compatibility,
chemical composition or guaranteed
growth claims.
`
    },


    "Food": {

        emoji: "🍎",

        fields: [
            "Product Type",
            "Brand",
            "Flavour",
            "Quantity",
            "Ingredients",
            "Pack Type",
            "Dietary Information",
            "Expiry / Shelf Life"
        ],

        rules: `
Do not invent ingredients,
nutrition information, expiry,
dietary claims or health benefits.
`
    },


    "Gifts": {

        emoji: "🎁",

        fields: [
            "Product Type",
            "Material",
            "Color",
            "Design",
            "Quantity",
            "Occasion",
            "Recipient",
            "Packaging"
        ],

        rules: `
Do not assume recipient, occasion,
material or packaging unless provided.
`
    }

};


/* =========================================================
   3. SAFE ELEMENT FUNCTION
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   4. SAFE VALUE FUNCTION
========================================================= */

function getValue(id) {

    const element =
        getElement(id);

    if (!element) {

        return "";

    }

    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   5. MESSAGE
========================================================= */

function showMessage(
    message,
    type = "success"
) {

    let box =
        getElement("message");


    if (!box) {

        box =
            document.createElement("div");

        box.id =
            "message";

        box.style.position =
            "fixed";

        box.style.top =
            "20px";

        box.style.right =
            "20px";

        box.style.zIndex =
            "999999";

        box.style.maxWidth =
            "350px";

        box.style.padding =
            "14px 18px";

        box.style.borderRadius =
            "10px";

        box.style.fontWeight =
            "600";

        box.style.boxShadow =
            "0 5px 20px rgba(0,0,0,0.15)";

        document.body.appendChild(
            box
        );

    }


    box.textContent =
        message;


    if (type === "error") {

        box.style.background =
            "#fee2e2";

        box.style.color =
            "#991b1b";

    } else {

        box.style.background =
            "#dcfce7";

        box.style.color =
            "#166534";

    }


    box.style.display =
        "block";


    clearTimeout(
        window.listingMessageTimer
    );


    window.listingMessageTimer =
        setTimeout(
            () => {

                box.style.display =
                    "none";

            },
            5000
        );

}


/* =========================================================
   6. COLLECT COMMON PRODUCT DATA
========================================================= */

function collectProductData() {

    return {

        category:
            getValue("category"),

        productName:
            getValue("productName"),

        brand:
            getValue("brand"),

        price:
            getValue("price"),

        color:
            getValue("color"),

        material:
            getValue("material"),

        size:
            getValue("size"),

        model:
            getValue("model"),

        quantity:
            getValue("quantity"),

        features:
            getValue("features"),

        description:
            getValue("description")

    };

}


/* =========================================================
   7. OPTIONAL CATEGORY-SPECIFIC FIELDS
========================================================= */

function collectExtraFields() {

    const extra = {};


    const possibleFields = [

        "productType",
        "fabric",
        "pattern",
        "fit",
        "occasion",
        "variant",
        "ingredients",
        "skinType",
        "hairType",
        "fragrance",
        "storage",
        "capacity",
        "connectivity",
        "compatibility",
        "power",
        "sole",
        "closure",
        "design",
        "stone",
        "ageGroup",
        "author",
        "language",
        "format",
        "pages",
        "publisher",
        "edition",
        "isbn",
        "petType",
        "weight",
        "activity",
        "vehicleCompatibility",
        "plantCompatibility",
        "flavour",
        "packType",
        "dietaryInformation",
        "expiry",
        "recipient",
        "packaging"

    ];


    possibleFields.forEach(
        field => {

            const value =
                getValue(field);

            if (value) {

                extra[field] =
                    value;

            }

        }
    );


    return extra;

}


/* =========================================================
   8. COMPLETE PRODUCT DATA
========================================================= */

function collectCompleteProductData() {

    return {

        ...collectProductData(),

        extra:
            collectExtraFields()

    };

}


/* =========================================================
   9. VALIDATION
========================================================= */

function validateProduct(product) {

    if (!product.productName) {

        showMessage(
            "❌ Product Name भरना जरूरी है।",
            "error"
        );

        const input =
            getElement("productName");

        if (input) {

            input.focus();

        }

        return false;

    }


    if (!product.category) {

        showMessage(
            "❌ Category चुनें।",
            "error"
        );

        return false;

    }


    return true;

}


/* =========================================================
   10. BUILD STRICT CATEGORY RULE
========================================================= */

function buildCategoryInstruction(
    category
) {

    const config =
        CATEGORY_CONFIG[category];


    if (!config) {

        return `
Use only seller-provided information.
Do not invent specifications.
`;

    }


    return `

CATEGORY:
${config.emoji} ${category}

CATEGORY FIELDS:
${config.fields.join(", ")}

CATEGORY SAFETY RULES:
${config.rules}

IMPORTANT:
Category knowledge may help organize
the listing, but it MUST NOT be used
to invent missing product facts.

`;

}


/* =========================================================
   11. GENERATE LISTING
========================================================= */

async function generateListing() {

    const button =
        getElement(
            "generateListingBtn"
        );

    const loading =
        getElement("loading");


    const product =
        collectCompleteProductData();


    if (
        !validateProduct(
            product
        )
    ) {

        return;

    }


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "🤖 Generating...";

    }


    if (loading) {

        loading.style.display =
            "block";

    }


    try {

        showMessage(
            "🤖 AI listing तैयार कर रहा है...",
            "success"
        );


        const response =
            await fetch(
                API_ENDPOINT,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            product:

                                product,

                            categoryRules:

                                buildCategoryInstruction(
                                    product.category
                                )

                        })

                }
            );


        const rawText =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(
                    rawText
                );

        } catch (error) {

            throw new Error(
                `Backend ने valid JSON नहीं दिया. HTTP ${response.status}`
            );

        }


        if (!response.ok) {

            throw new Error(

                result.message ||
                result.error ||
                result.details ||
                `HTTP Error ${response.status}`

            );

        }


        if (!result.success) {

            throw new Error(

                result.message ||
                result.error ||
                "Listing generation failed."

            );

        }


        if (!result.listing) {

            throw new Error(
                "Backend response में listing नहीं मिली।"
            );

        }


        displayListing(
            result.listing
        );


        localStorage.setItem(

            "latestCompleteListingV2",

            JSON.stringify(
                result.listing
            )

        );


        showMessage(
            "✅ Complete Listing तैयार है!",
            "success"
        );


    } catch (error) {

        console.error(
            "Complete Listing V2 Error:",
            error
        );


        showMessage(

            "❌ Listing generate नहीं हुई: " +
            error.message,

            "error"

        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "✨ Generate Complete Listing";

        }


        if (loading) {

            loading.style.display =
                "none";

        }

    }

}


/* =========================================================
   12. DISPLAY RESULT
========================================================= */

function displayListing(
    listing
) {

    const resultBox =
        getElement(
            "listingResult"
        );


    if (resultBox) {

        resultBox.style.display =
            "block";

    }


    setOutput(
        "generatedTitle",
        listing.title
    );


    setOutput(
        "generatedDescription",
        listing.description
    );


    setOutput(
        "generatedHighlights",
        formatArray(
            listing.highlights
        )
    );


    setOutput(
        "generatedKeywords",
        formatArray(
            listing.seoKeywords
        )
    );


    setOutput(
        "generatedTags",
        formatArray(
            listing.tags
        )
    );


    setOutput(
        "generatedSpecifications",
        formatSpecifications(
            listing.specifications
        )
    );


    if (resultBox) {

        setTimeout(
            () => {

                resultBox.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            100
        );

    }

}


/* =========================================================
   13. OUTPUT HELPER
========================================================= */

function setOutput(
    id,
    value
) {

    const element =
        getElement(id);


    if (!element) {

        return;

    }


    element.value =
        value || "";

}


/* =========================================================
   14. FORMAT ARRAY
========================================================= */

function formatArray(
    value
) {

    if (!Array.isArray(value)) {

        return value || "";

    }


    return value

        .filter(
            item =>
                item !== null &&
                item !== undefined &&
                String(item).trim()
        )

        .map(
            item =>
                `• ${item}`
        )

        .join("\n");

}


/* =========================================================
   15. FORMAT SPECIFICATIONS
========================================================= */

function formatSpecifications(
    specifications
) {

    if (!specifications) {

        return "";

    }


    if (
        typeof specifications ===
        "string"
    ) {

        return specifications;

    }


    return Object.entries(
        specifications
    )

    .filter(
        ([key, value]) =>
            key &&
            value !== null &&
            value !== undefined &&
            String(value).trim()
    )

    .map(
        ([key, value]) =>
            `${key}: ${value}`
    )

    .join("\n");

}


/* =========================================================
   16. COPY COMPLETE LISTING
========================================================= */

async function copyCompleteListing() {

    const title =
        getValue(
            "generatedTitle"
        );


    const description =
        getValue(
            "generatedDescription"
        );


    const highlights =
        getValue(
            "generatedHighlights"
        );


    const keywords =
        getValue(
            "generatedKeywords"
        );


    const tags =
        getValue(
            "generatedTags"
        );


    const specifications =
        getValue(
            "generatedSpecifications"
        );


    const text = `

AI SELLER TOOLKIT
COMPLETE PRODUCT LISTING
==============================

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

==============================
Generated by AI Seller Toolkit
`;


    try {

        await navigator.clipboard.writeText(
            text.trim()
        );


        showMessage(
            "✅ Complete Listing copy हो गई!",
            "success"
        );


    } catch (error) {

        fallbackCopy(
            text.trim()
        );

    }

}


/* =========================================================
   17. FALLBACK COPY
========================================================= */

function fallbackCopy(
    text
) {

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    document.body.appendChild(
        textarea
    );


    textarea.select();


    try {

        document.execCommand(
            "copy"
        );


        showMessage(
            "✅ Listing copy हो गई!",
            "success"
        );


    } catch (error) {

        showMessage(
            "❌ Copy नहीं हो सकी।",
            "error"
        );

    }


    textarea.remove();

}


/* =========================================================
   18. DOWNLOAD
========================================================= */

function downloadListing() {

    const title =
        getValue(
            "generatedTitle"
        );


    if (!title) {

        showMessage(
            "❌ पहले listing generate करें।",
            "error"
        );

        return;

    }


    const text = `

AI SELLER TOOLKIT
COMPLETE PRODUCT LISTING
==============================

PRODUCT TITLE
${title}

DESCRIPTION
${getValue(
    "generatedDescription"
)}

KEY HIGHLIGHTS
${getValue(
    "generatedHighlights"
)}

SEO KEYWORDS
${getValue(
    "generatedKeywords"
)}

SEARCH TAGS
${getValue(
    "generatedTags"
)}

SPECIFICATIONS
${getValue(
    "generatedSpecifications"
)}

==============================
Generated by AI Seller Toolkit
`;


    const blob =
        new Blob(
            [text.trim()],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "AI-Seller-Toolkit-Listing.txt";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showMessage(
        "✅ Listing download हो गई!",
        "success"
    );

}


/* =========================================================
   19. CLEAR FORM
========================================================= */

function clearListing() {

    const fields =
        document.querySelectorAll(
            "input, textarea"
        );


    fields.forEach(
        field => {

            field.value =
                "";

        }
    );


    const resultBox =
        getElement(
            "listingResult"
        );


    if (resultBox) {

        resultBox.style.display =
            "none";

    }


    localStorage.removeItem(
        "latestCompleteListingV2"
    );


    showMessage(
        "🧹 Form साफ हो गया।",
        "success"
    );

}


/* =========================================================
   20. CATEGORY CHANGE
========================================================= */

function handleCategoryChange() {

    const category =
        getValue(
            "category"
        );


    const config =
        CATEGORY_CONFIG[
            category
        ];


    if (!config) {

        return;

    }


    console.log(
        `📂 Selected category: ${config.emoji} ${category}`
    );


    console.log(
        "Category fields:",
        config.fields
    );

}


/* =========================================================
   21. LOAD SAVED LISTING
========================================================= */

function loadSavedListing() {

    const saved =
        localStorage.getItem(
            "latestCompleteListingV2"
        );


    if (!saved) {

        return;

    }


    try {

        const listing =
            JSON.parse(
                saved
            );


        if (
            listing &&
            listing.title
        ) {

            displayListing(
                listing
            );

        }

    } catch (error) {

        console.error(
            "Saved listing error:",
            error
        );

    }

}


/* =========================================================
   22. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const generateButton =
            getElement(
                "generateListingBtn"
            );


        if (generateButton) {

            generateButton.addEventListener(
                "click",
                generateListing
            );

        } else {

            console.error(
                "❌ Generate Listing button not found."
            );

        }


        const copyButton =
            getElement(
                "copyListingBtn"
            );


        if (copyButton) {

            copyButton.addEventListener(
                "click",
                copyCompleteListing
            );

        }


        const downloadButton =
            getElement(
                "downloadListingBtn"
            );


        if (downloadButton) {

            downloadButton.addEventListener(
                "click",
                downloadListing
            );

        }


        const clearButton =
            getElement(
                "clearListingBtn"
            );


        if (clearButton) {

            clearButton.addEventListener(
                "click",
                clearListing
            );

        }


        const category =
            getElement(
                "category"
            );


        if (category) {

            category.addEventListener(
                "change",
                handleCategoryChange
            );

        }


        loadSavedListing();


        console.log(
            "===================================="
        );

        console.log(
            "✅ AI Seller Toolkit"
        );

        console.log(
            "✅ Complete Listing Generator V2"
        );

        console.log(
            "✅ Backend API connected"
        );

        console.log(
            "===================================="

        );

    }
);


/* =========================================================
   23. GLOBAL FUNCTIONS
========================================================= */

window.generateListing =
    generateListing;

window.copyCompleteListing =
    copyCompleteListing;

window.downloadListing =
    downloadListing;

window.clearListing =
    clearListing;

window.collectCompleteProductData =
    collectCompleteProductData;


/* =========================================================
   END OF VERSION 2
========================================================= */
