// ==========================================================
// AI SELLER TOOLKIT
// SEO GENERATOR — FINAL VERSION 21.0
// ==========================================================
// Backend Connected
// Strict Factual SEO
// No Generic Filler Keywords
// No Local Fake Fallback
// Robust DOM Validation
// ==========================================================


"use strict";


// ==========================================================
// VERSION
// ==========================================================

const SEO_GENERATOR_VERSION = "21.0";


// ==========================================================
// BACKEND
// ==========================================================

const BACKEND_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const SEO_ENDPOINT =
    BACKEND_URL + "/api/generate-seo";


// ==========================================================
// DOM READY
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log(
        "AI Seller Toolkit SEO Generator " +
        SEO_GENERATOR_VERSION +
        " loaded successfully."
    );


    // ------------------------------------------------------
    // FORM
    // ------------------------------------------------------

    const seoForm =
        document.getElementById("seoForm");


    const generateBtn =
        document.getElementById("generateBtn");


    const copyBtn =
        document.getElementById("copyBtn");


    if (!seoForm) {

        console.error(
            "SEO Generator Error: #seoForm not found."
        );

        return;
    }


    if (!generateBtn) {

        console.error(
            "SEO Generator Error: #generateBtn not found."
        );

        return;
    }


    // ======================================================
    // GENERATE FORM
    // ======================================================

    seoForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await generateSEO();
        }
    );


    // ======================================================
    // COPY BUTTON
    // ======================================================

    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            copySEOKeywords
        );
    }

});


// ==========================================================
// GET DOM VALUE
// ==========================================================

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return String(
        element.value || ""
    ).trim();
}


// ==========================================================
// STATUS
// ==========================================================

function showStatus(message, type) {

    const status =
        document.getElementById("status");

    if (!status) {
        return;
    }


    status.textContent =
        message || "";


    status.className =
        "status show " +
        (type || "info");
}


// ==========================================================
// CLEAR STATUS
// ==========================================================

function clearStatus() {

    const status =
        document.getElementById("status");

    if (!status) {
        return;
    }

    status.textContent = "";

    status.className =
        "status";
}


// ==========================================================
// SET LOADING
// ==========================================================

function setLoading(isLoading) {

    const button =
        document.getElementById("generateBtn");

    if (!button) {
        return;
    }


    button.disabled =
        Boolean(isLoading);


    if (isLoading) {

        button.dataset.originalText =
            button.textContent;

        button.textContent =
            "⏳ Generating SEO Keywords...";

    } else {

        button.textContent =
            button.dataset.originalText ||
            "✨ Generate SEO Keywords";
    }
}


// ==========================================================
// NORMALIZE CATEGORY
// ==========================================================

function normalizeCategory(category) {

    const value =
        String(category || "")
            .trim()
            .replace(
                /^[^\p{L}\p{N}]+/u,
                ""
            );


    const aliases = {

        "Fashion & Clothing":
            "Fashion",

        "Fashion":
            "Fashion",

        "Beauty":
            "Beauty",

        "Electronics":
            "Electronics",

        "Home & Kitchen":
            "Home & Kitchen",

        "Shoes":
            "Shoes",

        "Jewellery":
            "Jewellery",

        "Toys":
            "Toys",

        "Books":
            "Books",

        "Pet":
            "Pet",

        "Sports":
            "Sports",

        "Automotive":
            "Automotive",

        "Garden":
            "Garden",

        "Food":
            "Food",

        "Gifts":
            "Gifts"
    };


    return (
        aliases[value] ||
        value
    );
}


// ==========================================================
// SUPPORTED CATEGORIES
// ==========================================================

const SUPPORTED_CATEGORIES = [

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


// ==========================================================
// VALIDATE CATEGORY
// ==========================================================

function isSupportedCategory(category) {

    return SUPPORTED_CATEGORIES.includes(
        category
    );
}


// ==========================================================
// CLEAN KEYWORD
// ==========================================================

function cleanKeyword(keyword) {

    if (
        keyword === null ||
        keyword === undefined
    ) {
        return "";
    }


    let value =
        String(keyword)
            .trim();


    // Remove list numbering
    value =
        value.replace(
            /^\s*(?:[-•*]|\d+[.)])\s*/,
            ""
        );


    // Remove wrapping quotes
    value =
        value.replace(
            /^["'“”‘’]+|["'“”‘’]+$/g,
            ""
        );


    // Remove extra spaces
    value =
        value.replace(
            /\s+/g,
            " "
        );


    return value.trim();
}


// ==========================================================
// KEYWORD ARRAY EXTRACTION
// ==========================================================

function extractKeywords(data) {

    if (!data) {
        return [];
    }


    // ------------------------------------------------------
    // Direct arrays
    // ------------------------------------------------------

    if (Array.isArray(data)) {

        return data
            .map(cleanKeyword)
            .filter(Boolean);
    }


    // ------------------------------------------------------
    // Object arrays
    // ------------------------------------------------------

    const possibleArrayFields = [

        "keywords",
        "seoKeywords",
        "seo_keywords",
        "results",
        "items",
        "data"

    ];


    for (
        const field of possibleArrayFields
    ) {

        if (
            data &&
            Array.isArray(data[field])
        ) {

            return data[field]
                .map(function (item) {

                    if (
                        typeof item ===
                        "string"
                    ) {

                        return cleanKeyword(
                            item
                        );
                    }


                    if (
                        item &&
                        typeof item ===
                        "object"
                    ) {

                        return cleanKeyword(

                            item.keyword ||
                            item.text ||
                            item.value ||
                            ""
                        );
                    }


                    return "";
                })
                .filter(Boolean);
        }
    }


    // ------------------------------------------------------
    // Text fields
    // ------------------------------------------------------

    const possibleTextFields = [

        "text",
        "result",
        "output",
        "content",
        "message"

    ];


    for (
        const field of possibleTextFields
    ) {

        if (
            data &&
            typeof data[field] ===
            "string"
        ) {

            return parseKeywordText(
                data[field]
            );
        }
    }


    return [];
}


// ==========================================================
// PARSE KEYWORD TEXT
// ==========================================================

function parseKeywordText(text) {

    if (!text) {
        return [];
    }


    let value =
        String(text)
            .trim();


    // ------------------------------------------------------
    // Try JSON first
    // ------------------------------------------------------

    try {

        const parsed =
            JSON.parse(value);

        const extracted =
            extractKeywords(parsed);

        if (extracted.length) {
            return extracted;
        }

    } catch (error) {

        // Normal text; continue below.
    }


    // ------------------------------------------------------
    // Split lines
    // ------------------------------------------------------

    const lines =
        value
            .split(/\r?\n/)
            .map(cleanKeyword)
            .filter(Boolean);


    // ------------------------------------------------------
    // If numbered list exists
    // ------------------------------------------------------

    const numbered =
        lines.filter(function (line) {

            return /^\d+[.)]\s*/.test(
                line
            );
        });


    if (numbered.length) {

        return numbered
            .map(cleanKeyword)
            .filter(Boolean);
    }


    // ------------------------------------------------------
    // Comma / semicolon separated
    // ------------------------------------------------------

    if (
        lines.length === 1 &&
        /[,;|]/.test(lines[0])
    ) {

        return lines[0]
            .split(/[,;|]/)
            .map(cleanKeyword)
            .filter(Boolean);
    }


    return lines;
}


// ==========================================================
// REMOVE DUPLICATES
// ==========================================================

function removeDuplicates(keywords) {

    const seen =
        new Set();

    const result = [];


    for (
        const keyword of keywords
    ) {

        const cleaned =
            cleanKeyword(keyword);


        if (!cleaned) {
            continue;
        }


        const key =
            cleaned.toLowerCase();


        if (
            seen.has(key)
        ) {
            continue;
        }


        seen.add(key);

        result.push(cleaned);
    }


    return result;
}


// ==========================================================
// REMOVE GENERIC FILLER
// ==========================================================
//
// IMPORTANT:
// We do NOT reject words like "fashion" generally.
// We only reject obvious filler phrases that were
// previously causing bad SEO output.
// ==========================================================

function isGenericFiller(keyword) {

    const value =
        keyword
            .toLowerCase()
            .trim();


    const forbiddenPatterns = [

        /\bproduct\s+online\b/i,
        /\bonline\s+shopping\b/i,
        /\bonline\s+buy\b/i,
        /\bbuy\s+online\b/i,
        /\bshop\s+online\b/i,
        /\bonline\s+shop\b/i,
        /\bshopping\s+online\b/i,
        /\bproduct\s+shop\b/i,
        /\bproduct\s+shopping\b/i,
        /\bbest\s+product\b/i,
        /\bbest\s+quality\b/i,
        /\bhigh\s+quality\b/i,
        /\btop\s+quality\b/i,
        /\baffordable\s+product\b/i,
        /\btrending\s+product\b/i,
        /\bpopular\s+product\b/i,
        /\bmust\s+have\b/i

    ];


    return forbiddenPatterns.some(
        function (pattern) {

            return pattern.test(
                value
            );
        }
    );
}


// ==========================================================
// FILTER KEYWORDS
// ==========================================================

function filterKeywords(keywords) {

    return keywords
        .map(cleanKeyword)
        .filter(Boolean)
        .filter(function (keyword) {

            return !isGenericFiller(
                keyword
            );
        });
}


// ==========================================================
// DISPLAY KEYWORDS
// ==========================================================

function displayKeywords(keywords) {

    const result =
        document.getElementById("result");


    if (!result) {
        return;
    }


    if (!keywords.length) {

        result.value =
            "No factual SEO keywords were returned.";

        return;
    }


    result.value =
        keywords
            .slice(0, 20)
            .map(function (keyword, index) {

                return (
                    (index + 1) +
                    ". " +
                    keyword
                );

            })
            .join("\n");
}


// ==========================================================
// GENERATE SEO
// ==========================================================

async function generateSEO() {

    clearStatus();


    // ------------------------------------------------------
    // IMPORTANT:
    // Re-read values DIRECTLY from DOM on every click.
    // This prevents old/stale values from causing:
    // "Product name is required."
    // ------------------------------------------------------

    const product =
        getValue("product");


    const category =
        normalizeCategory(
            getValue("category")
        );


    const brand =
        getValue("brand");


    const mainKeyword =
        getValue("keyword");


    const marketplace =
        getValue("marketplace");


    console.log(
        "SEO Generator input:",
        {
            product,
            category,
            brand,
            mainKeyword,
            marketplace
        }
    );


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!product) {

        showStatus(
            "❌ Product Name is required.",
            "error"
        );

        const productInput =
            document.getElementById(
                "product"
            );

        if (productInput) {
            productInput.focus();
        }

        return;
    }


    if (!category) {

        showStatus(
            "❌ Product Category is required.",
            "error"
        );

        const categoryInput =
            document.getElementById(
                "category"
            );

        if (categoryInput) {
            categoryInput.focus();
        }

        return;
    }


    if (
        !isSupportedCategory(
            category
        )
    ) {

        showStatus(
            "❌ Unsupported product category.",
            "error"
        );

        return;
    }


    // ======================================================
    // CLEAR OLD RESULT
    // ======================================================

    const result =
        document.getElementById(
            "result"
        );


    if (result) {
        result.value = "";
    }


    // ======================================================
    // LOADING
    // ======================================================

    setLoading(true);


    showStatus(
        "⏳ Generating factual SEO keywords...",
        "info"
    );


    // ======================================================
    // REQUEST BODY
    // ======================================================

    const requestBody = {

        product:
            product,

        category:
            category,

        brand:
            brand,

        mainKeyword:
            mainKeyword,

        marketplace:
            marketplace

    };


    console.log(
        "Sending SEO request:",
        requestBody
    );


    // ======================================================
    // API REQUEST
    // ======================================================

    try {

        const response =
            await fetch(
                SEO_ENDPOINT,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );


        // ==================================================
        // READ RESPONSE
        // ==================================================

        const rawText =
            await response.text();


        console.log(
            "SEO API raw response:",
            rawText
        );


        let data = null;


        if (rawText) {

            try {

                data =
                    JSON.parse(
                        rawText
                    );

            } catch (parseError) {

                console.error(
                    "SEO API JSON parse error:",
                    parseError
                );

                throw new Error(
                    "Backend returned an invalid response."
                );
            }
        }


        // ==================================================
        // HTTP ERROR
        // ==================================================

        if (!response.ok) {

            let errorMessage =
                "SEO generation failed.";


            if (
                data &&
                typeof data ===
                "object"
            ) {

                errorMessage =
                    data.error ||
                    data.message ||
                    errorMessage;
            }


            throw new Error(
                errorMessage
            );
        }


        // ==================================================
        // SUCCESS FLAG ERROR
        // ==================================================

        if (
            data &&
            data.success === false
        ) {

            throw new Error(

                data.error ||
                data.message ||
                "SEO generation failed."
            );
        }


        // ==================================================
        // EXTRACT KEYWORDS
        // ==================================================

        let keywords =
            extractKeywords(
                data
            );


        // ==================================================
        // FILTER
        // ==================================================

        keywords =
            filterKeywords(
                keywords
            );


        // ==================================================
        // REMOVE DUPLICATES
        // ==================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ==================================================
        // MAX 20
        // ==================================================

        keywords =
            keywords.slice(
                0,
                20
            );


        // ==================================================
        // NO RESULT
        // ==================================================

        if (!keywords.length) {

            if (result) {

                result.value =
                    "";
            }


            showStatus(
                "⚠️ No factual SEO keywords were returned. Add more real product details and try again.",
                "error"
            );

            return;
        }


        // ==================================================
        // DISPLAY
        // ==================================================

        displayKeywords(
            keywords
        );


        // ==================================================
        // SUCCESS
        // ==================================================

        showStatus(

            "✅ SEO keywords generated successfully (" +
            keywords.length +
            ").",

            "success"
        );


    } catch (error) {

        console.error(
            "SEO Generator Error:",
            error
        );


        // --------------------------------------------------
        // IMPORTANT:
        // Correct syntax. Previous version had broken
        // showStatus(...) syntax here.
        // --------------------------------------------------

        showStatus(

            "❌ " +
            (
                error.message ||
                "SEO generation failed."
            ),

            "error"
        );


    } finally {

        setLoading(false);
    }
}


// ==========================================================
// COPY SEO KEYWORDS
// ==========================================================

async function copySEOKeywords() {

    const result =
        document.getElementById(
            "result"
        );


    const copyBtn =
        document.getElementById(
            "copyBtn"
        );


    if (!result) {
        return;
    }


    const text =
        String(
            result.value || ""
        ).trim();


    if (!text) {

        showStatus(
            "⚠️ There are no SEO keywords to copy.",
            "error"
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        if (copyBtn) {

            const originalText =
                copyBtn.textContent;


            copyBtn.textContent =
                "✅ Copied!";


            setTimeout(
                function () {

                    copyBtn.textContent =
                        originalText;

                },
                1500
            );
        }


        showStatus(
            "✅ SEO keywords copied successfully.",
            "success"
        );


    } catch (error) {

        // --------------------------------------------------
        // Fallback for browsers where clipboard API fails.
        // --------------------------------------------------

        try {

            result.removeAttribute(
                "readonly"
            );

            result.select();

            result.setSelectionRange(
                0,
                result.value.length
            );

            const copied =
                document.execCommand(
                    "copy"
                );


            result.setAttribute(
                "readonly",
                ""
            );


            if (copied) {

                showStatus(
                    "✅ SEO keywords copied successfully.",
                    "success"
                );

            } else {

                showStatus(
                    "⚠️ Copy failed. Please select and copy manually.",
                    "error"
                );
            }


        } catch (fallbackError) {

            console.error(
                "Copy error:",
                fallbackError
            );


            showStatus(
                "⚠️ Copy failed. Please copy the keywords manually.",
                "error"
            );
        }
    }
}


// ==========================================================
// END OF SEO GENERATOR 21.0
// ==========================================================
