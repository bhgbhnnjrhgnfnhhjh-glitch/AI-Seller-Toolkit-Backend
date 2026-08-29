/* =========================================================
   AI SELLER TOOLKIT
   SEO KEYWORD GENERATOR
   FINAL VERSION 13

   Backend:
   POST /api/generate-seo

   Supports:
   Fashion
   Beauty
   Electronics
   Home & Kitchen
   Shoes
   Jewellery
   Toys
   Books
   Pet
   Sports
   Automotive
   Garden
   Food
   Gifts
========================================================= */


"use strict";


// =========================================================
// API
// =========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com/api/generate-seo";


// =========================================================
// ELEMENTS
// =========================================================

const generateBtn =
    document.getElementById("generateBtn");

const copyBtn =
    document.getElementById("copyBtn");

const result =
    document.getElementById("result");

const status =
    document.getElementById("status");

const productNameInput =
    document.getElementById("productName");

const categoryInput =
    document.getElementById("category");

const brandInput =
    document.getElementById("brand");

const keywordInput =
    document.getElementById("keyword");

const marketplaceInput =
    document.getElementById("marketplace");


// =========================================================
// CATEGORY LIST
// =========================================================

const SEO_CATEGORIES = [

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


// =========================================================
// EVENTS
// =========================================================

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        generateSEO
    );

}


if (copyBtn) {

    copyBtn.addEventListener(
        "click",
        copySEO
    );

}


// =========================================================
// GENERATE SEO
// =========================================================

async function generateSEO() {

    // -------------------------------------------------------
    // CHECK ELEMENTS
    // -------------------------------------------------------

    if (
        !productNameInput ||
        !categoryInput ||
        !brandInput ||
        !keywordInput ||
        !marketplaceInput ||
        !result
    ) {

        console.error(
            "SEO Generator: Required HTML elements are missing."
        );

        showStatus(
            "❌ SEO Generator page में required fields नहीं मिले।"
        );

        return;

    }


    // -------------------------------------------------------
    // GET VALUES
    // -------------------------------------------------------

    const product =
        productNameInput.value.trim();

    const category =
        categoryInput.value.trim();

    const brand =
        brandInput.value.trim();

    const mainKeyword =
        keywordInput.value.trim();

    const marketplace =
        marketplaceInput.value.trim();


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!product) {

        showStatus(
            "❌ Please enter Product Name."
        );

        productNameInput.focus();

        return;

    }


    if (!category) {

        showStatus(
            "❌ Please select Product Category."
        );

        categoryInput.focus();

        return;

    }


    if (
        !SEO_CATEGORIES.includes(
            category
        )
    ) {

        showStatus(
            "❌ Please select a valid product category."
        );

        return;

    }


    if (!mainKeyword) {

        showStatus(
            "❌ Please enter Main Keyword."
        );

        keywordInput.focus();

        return;

    }


    // -------------------------------------------------------
    // UI: LOADING
    // -------------------------------------------------------

    generateBtn.disabled = true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";

    showStatus(
        "⏳ AI SEO keywords बना रहा है..."
    );

    result.value =
        "⏳ Please wait...\n\nGemini AI आपके product के लिए relevant SEO keywords तैयार कर रहा है।";


    try {

        // ===================================================
        // API REQUEST
        // ===================================================

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            category:
                                category,

                            productName:
                                product,

                            brand:
                                brand,

                            productDetails:
                                "",

                            mainKeyword:
                                mainKeyword,

                            marketplace:
                                marketplace

                        })

                }
            );


        // ===================================================
        // RESPONSE
        // ===================================================

        let data;

        try {

            data =
                await response.json();

        }
        catch (jsonError) {

            throw new Error(
                "Backend ने valid JSON response नहीं दिया।"
            );

        }


        // ===================================================
        // HTTP ERROR
        // ===================================================

        if (!response.ok) {

            throw new Error(

                data &&
                data.error

                    ? data.error

                    : (
                        "Backend Error: HTTP " +
                        response.status
                    )

            );

        }


        // ===================================================
        // SUCCESS CHECK
        // ===================================================

        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(

                data &&
                data.error

                    ? data.error

                    : "SEO keywords generate नहीं हुए।"

            );

        }


        // ===================================================
        // GET KEYWORDS
        // ===================================================

        let keywords = [];


        if (
            Array.isArray(
                data.keywords
            )
        ) {

            keywords =
                data.keywords;

        }


        // ===================================================
        // SUPPORT STRING RESPONSE
        // ===================================================

        if (
            !keywords.length &&
            typeof data.keywords === "string"
        ) {

            keywords =
                data.keywords
                    .split(/\n|,/)
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(Boolean);

        }


        // ===================================================
        // CLEAN KEYWORDS
        // ===================================================

        keywords =
            keywords
                .map(
                    cleanKeyword
                )
                .filter(Boolean);


        // ===================================================
        // REMOVE DUPLICATES
        // ===================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ===================================================
        // MAIN KEYWORD FIRST
        // ===================================================

        keywords =
            prioritizeMainKeyword(
                keywords,
                mainKeyword
            );


        // ===================================================
        // ENSURE MAIN KEYWORD
        // ===================================================

        const mainExists =
            keywords.some(

                item =>

                    normalizeKeyword(
                        item
                    ) ===
                    normalizeKeyword(
                        mainKeyword
                    )

            );


        if (!mainExists) {

            keywords.unshift(
                mainKeyword
            );

        }


        // ===================================================
        // MAXIMUM 20 KEYWORDS
        // ===================================================

        keywords =
            keywords
                .slice(
                    0,
                    20
                );


        // ===================================================
        // EMPTY RESULT
        // ===================================================

        if (!keywords.length) {

            throw new Error(
                "AI ने कोई keyword नहीं दिया।"
            );

        }


        // ===================================================
        // DISPLAY RESULT
        // ===================================================

        result.value =
            keywords
                .map(

                    (item, index) =>

                        (
                            index + 1
                        ) +
                        ". " +
                        item

                )
                .join("\n");


        // ===================================================
        // SUCCESS MESSAGE
        // ===================================================

        showStatus(

            "✅ " +
            keywords.length +
            " relevant SEO keywords generated successfully."

        );


    }
    catch (error) {

        // ===================================================
        // ERROR
        // ===================================================

        console.error(
            "SEO Generator Error:",
            error
        );


        result.value =
            "❌ SEO Keywords generate नहीं हो सके.\n\n" +
            "Error: " +
            (
                error.message ||
                "Unknown error"
            );


        showStatus(
            "❌ SEO generation failed. Please try again."
        );

    }
    finally {

        // ===================================================
        // RESTORE BUTTON
        // ===================================================

        generateBtn.disabled =
            false;

        generateBtn.innerText =
            "🤖 Generate SEO Keywords";

    }

}


// =========================================================
// SHOW STATUS
// =========================================================

function showStatus(
    message
) {

    if (status) {

        status.innerText =
            message;

    }

}


// =========================================================
// CLEAN KEYWORD
// =========================================================

function cleanKeyword(
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

        // Remove numbering
        .replace(
            /^\s*\d+[\.\)\-:]\s*/,
            ""
        )

        // Remove bullets
        .replace(
            /^\s*[-•*]\s*/,
            ""
        )

        // Remove quotes
        .replace(
            /^["']|["']$/g,
            ""
        )

        // Remove extra spaces
        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// =========================================================
// NORMALIZE KEYWORD
// =========================================================

function normalizeKeyword(
    text
) {

    if (!text) {

        return "";

    }


    return String(text)

        .toLowerCase()

        .replace(
            /['’]/g,
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

        // T-shirt variations
        .replace(
            /\bt[\s-]*shirt\b/g,
            "tshirt"
        )

        .replace(
            /\bt shirt\b/g,
            "tshirt"
        )

        .replace(
            /\btshirt\b/g,
            "tshirt"
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// =========================================================
// REMOVE DUPLICATES
// =========================================================

function removeDuplicates(
    keywords
) {

    const output = [];

    const seen =
        new Set();


    keywords.forEach(

        keyword => {

            const normalized =
                normalizeKeyword(
                    keyword
                );


            if (
                !normalized ||
                seen.has(
                    normalized
                )
            ) {

                return;

            }


            seen.add(
                normalized
            );


            output.push(
                keyword
            );

        }

    );


    return output;

}


// =========================================================
// PRIORITIZE MAIN KEYWORD
// =========================================================

function prioritizeMainKeyword(
    keywords,
    mainKeyword
) {

    const target =
        normalizeKeyword(
            mainKeyword
        );


    const index =
        keywords.findIndex(

            item =>

                normalizeKeyword(
                    item
                ) === target

        );


    if (index > 0) {

        const item =
            keywords.splice(
                index,
                1
            )[0];


        keywords.unshift(
            item
        );

    }


    return keywords;

}


// =========================================================
// COPY SEO
// =========================================================

async function copySEO() {

    if (!result) {

        return;

    }


    const text =
        result.value.trim();


    if (
        !text ||
        text.startsWith("❌") ||
        text.startsWith("⏳")
    ) {

        alert(
            "पहले SEO Keywords generate करें।"
        );

        return;

    }


    // =====================================================
    // MODERN CLIPBOARD
    // =====================================================

    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        try {

            await navigator.clipboard.writeText(
                text
            );


            alert(
                "✅ SEO Keywords copied successfully!"
            );


            return;

        }
        catch (error) {

            console.warn(
                "Clipboard API failed:",
                error
            );

        }

    }


    // =====================================================
    // FALLBACK
    // =====================================================

    fallbackCopy(
        text
    );

}


// =========================================================
// COPY FALLBACK
// =========================================================

function fallbackCopy(
    text
) {

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";

    textarea.style.top =
        "0";


    document.body.appendChild(
        textarea
    );


    textarea.focus();

    textarea.select();


    try {

        const copied =
            document.execCommand(
                "copy"
            );


        if (copied) {

            alert(
                "✅ SEO Keywords copied successfully!"
            );

        }
        else {

            alert(
                "❌ Copy नहीं हो सका।"
            );

        }

    }
    catch (error) {

        console.error(
            "Copy Error:",
            error
        );


        alert(
            "❌ Copy नहीं हो सका।"
        );

    }


    textarea.remove();

}


// =========================================================
// PAGE READY CHECK
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "======================================"
        );

        console.log(
            "AI Seller Toolkit SEO Generator"
        );

        console.log(
            "FINAL VERSION 13"
        );

        console.log(
            "API:",
            API_URL
        );

        console.log(
            "Generate Button:",
            Boolean(generateBtn)
        );

        console.log(
            "Product Name:",
            Boolean(productNameInput)
        );

        console.log(
            "Category:",
            Boolean(categoryInput)
        );

        console.log(
            "Brand:",
            Boolean(brandInput)
        );

        console.log(
            "Keyword:",
            Boolean(keywordInput)
        );

        console.log(
            "Marketplace:",
            Boolean(marketplaceInput)
        );

        console.log(
            "Result:",
            Boolean(result)
        );

        console.log(
            "======================================"
        );

    }
);
