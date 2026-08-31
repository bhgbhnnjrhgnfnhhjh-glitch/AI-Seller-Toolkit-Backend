// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR
// FINAL VERSION 13.0
// ==========================================================
// Backend:
// https://ai-seller-toolkit-backend-1.onrender.com
//
// Endpoint:
// POST /api/generate-seo
//
// Features:
// - Main Keyword Optional
// - Product Name fallback
// - Category aware
// - Marketplace aware
// - Duplicate protection
// - Main keyword first
// - Strong error handling
// - Copy support
// ==========================================================


"use strict";


// ==========================================================
// API CONFIG
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const SEO_API_URL =
    API_URL + "/api/generate-seo";


// ==========================================================
// START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "AI Seller Toolkit SEO Generator 13.0 loaded."
        );

        initializeSEOGenerator();

    }
);


// ==========================================================
// INITIALIZE
// ==========================================================

function initializeSEOGenerator() {

    const generateBtn =
        document.getElementById(
            "generateBtn"
        );

    const copyBtn =
        document.getElementById(
            "copyBtn"
        );


    if (!generateBtn) {

        console.error(
            "SEO ERROR: generateBtn not found."
        );

        return;

    }


    if (!copyBtn) {

        console.warn(
            "SEO WARNING: copyBtn not found."
        );

    }


    // ------------------------------------------------------
    // Generate Button
    // ------------------------------------------------------

    generateBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            generateSEO();

        }
    );


    // ------------------------------------------------------
    // Copy Button
    // ------------------------------------------------------

    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                copySEO();

            }
        );

    }


    // ------------------------------------------------------
    // Enter Key Support
    // ------------------------------------------------------

    const keywordInput =
        document.getElementById(
            "keyword"
        );

    if (keywordInput) {

        keywordInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    generateSEO();

                }

            }
        );

    }

}


// ==========================================================
// GET ELEMENT
// ==========================================================

function getElement(id) {

    return document.getElementById(id);

}


// ==========================================================
// GENERATE SEO
// ==========================================================

async function generateSEO() {

    const generateBtn =
        getElement("generateBtn");

    const result =
        getElement("result");

    const status =
        getElement("status");

    const productElement =
        getElement("product");

    const categoryElement =
        getElement("category");

    const brandElement =
        getElement("brand");

    const keywordElement =
        getElement("keyword");

    const marketplaceElement =
        getElement("marketplace");


    // ======================================================
    // ELEMENT CHECK
    // ======================================================

    if (!generateBtn) {

        console.error(
            "generateBtn element missing."
        );

        return;

    }


    if (!result) {

        console.error(
            "result element missing."
        );

        return;

    }


    if (!productElement) {

        showStatus(
            "❌ Product Name field नहीं मिला।"
        );

        return;

    }


    if (!categoryElement) {

        showStatus(
            "❌ Category field नहीं मिला।"
        );

        return;

    }


    if (!keywordElement) {

        showStatus(
            "❌ Main Keyword field नहीं मिला।"
        );

        return;

    }


    if (!marketplaceElement) {

        showStatus(
            "❌ Marketplace field नहीं मिला।"
        );

        return;

    }


    // ======================================================
    // READ INPUTS
    // ======================================================

    const product =
        String(
            productElement.value || ""
        ).trim();


    const category =
        String(
            categoryElement.value || ""
        ).trim();


    const brand =
        brandElement
            ? String(
                brandElement.value || ""
              ).trim()
            : "";


    const mainKeywordInput =
        String(
            keywordElement.value || ""
        ).trim();


    const marketplace =
        String(
            marketplaceElement.value || ""
        ).trim();


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!product) {

        showStatus(
            "❌ Please enter Product Name."
        );

        result.value = "";

        productElement.focus();

        return;

    }


    if (!category) {

        showStatus(
            "❌ Please select Product Category."
        );

        result.value = "";

        categoryElement.focus();

        return;

    }


    // ======================================================
    // IMPORTANT
    // MAIN KEYWORD IS OPTIONAL
    // ======================================================

    const finalMainKeyword =
        mainKeywordInput ||
        product;


    // ======================================================
    // UI LOADING
    // ======================================================

    generateBtn.disabled =
        true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";


    result.value =
        "⏳ SEO Keywords generate हो रहे हैं...\n\nPlease wait...";


    showStatus(
        "🤖 AI SEO keywords बना रहा है..."
    );


    // ======================================================
    // REQUEST DATA
    // ======================================================

    const requestData = {

        category:
            category,

        productName:
            product,

        brand:
            brand,

        productDetails:
            "",

        mainKeyword:
            finalMainKeyword,

        marketplace:
            marketplace

    };


    console.log(
        "SEO Request:",
        requestData
    );


    // ======================================================
    // API REQUEST
    // ======================================================

    try {

        const response =
            await fetch(
                SEO_API_URL,
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
                            requestData
                        )

                }
            );


        console.log(
            "SEO API Status:",
            response.status
        );


        // ==================================================
        // READ RESPONSE
        // ==================================================

        const responseText =
            await response.text();


        console.log(
            "SEO Raw Response:",
            responseText
        );


        let data = null;


        if (responseText) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            }
            catch (jsonError) {

                console.error(
                    "JSON Parse Error:",
                    jsonError
                );

                throw new Error(
                    "Backend ने valid JSON response नहीं दिया।"
                );

            }

        }


        // ==================================================
        // HTTP ERROR
        // ==================================================

        if (!response.ok) {

            let errorMessage =
                "Backend Error: " +
                response.status;


            if (
                data &&
                typeof data.error === "string"
            ) {

                errorMessage =
                    data.error;

            }
            else if (
                data &&
                typeof data.message === "string"
            ) {

                errorMessage =
                    data.message;

            }


            throw new Error(
                errorMessage
            );

        }


        // ==================================================
        // SUCCESS CHECK
        // ==================================================

        if (!data) {

            throw new Error(
                "Backend से कोई response नहीं मिला।"
            );

        }


        if (
            data.success === false
        ) {

            throw new Error(
                data.error ||
                data.message ||
                "SEO generation failed."
            );

        }


        // ==================================================
        // GET KEYWORDS
        // ======================================================

        let keywords = [];


        // Standard backend response
        if (
            Array.isArray(
                data.keywords
            )
        ) {

            keywords =
                data.keywords;

        }


        // Alternative response
        else if (
            Array.isArray(
                data.seoKeywords
            )
        ) {

            keywords =
                data.seoKeywords;

        }


        // Alternative response
        else if (
            Array.isArray(
                data.seo_keywords
            )
        ) {

            keywords =
                data.seo_keywords;

        }


        // Alternative response
        else if (
            Array.isArray(
                data.data
            )
        ) {

            keywords =
                data.data;

        }


        // ==================================================
        // CLEAN KEYWORDS
        // ==================================================

        keywords =
            keywords
                .map(
                    cleanKeyword
                )
                .filter(Boolean);


        // ==================================================
        // REMOVE DUPLICATES
        // ==================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ==================================================
        // MAIN KEYWORD FIRST
        // ==================================================

        keywords =
            prioritizeMainKeyword(
                keywords,
                finalMainKeyword
            );


        // ==================================================
        // ENSURE MAIN KEYWORD
        // ==================================================

        const normalizedMain =
            normalizeKeyword(
                finalMainKeyword
            );


        const mainExists =
            keywords.some(
                function (item) {

                    return (
                        normalizeKeyword(
                            item
                        ) ===
                        normalizedMain
                    );

                }
            );


        if (!mainExists) {

            keywords.unshift(
                finalMainKeyword
            );

        }


        // ==================================================
        // MAX 20 KEYWORDS
        // ==================================================

        keywords =
            keywords.slice(
                0,
                20
            );


        // ==================================================
        // FINAL CHECK
        // ==================================================

        if (
            !keywords.length
        ) {

            throw new Error(
                "AI ने कोई SEO keyword नहीं दिया।"
            );

        }


        // ==================================================
        // DISPLAY
        // ==================================================

        result.value =
            keywords
                .map(
                    function (
                        keyword,
                        index
                    ) {

                        return (
                            (index + 1) +
                            ". " +
                            keyword
                        );

                    }
                )
                .join("\n");


        // ==================================================
        // SUCCESS MESSAGE
        // ==================================================

        showStatus(
            "✅ " +
            keywords.length +
            " SEO keywords generated successfully."
        );


        console.log(
            "SEO Keywords:",
            keywords
        );


    }
    catch (error) {

        console.error(
            "SEO GENERATOR ERROR:",
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
            "❌ SEO generation failed: " +
            (
                error.message ||
                "Unknown error"
            )
        );

    }
    finally {

        generateBtn.disabled =
            false;

        generateBtn.innerText =
            "🤖 Generate SEO Keywords";

    }

}


// ==========================================================
// STATUS
// ==========================================================

function showStatus(message) {

    const status =
        getElement("status");


    if (status) {

        status.innerText =
            message;

    }


    console.log(
        "SEO STATUS:",
        message
    );

}


// ==========================================================
// CLEAN KEYWORD
// ==========================================================

function cleanKeyword(value) {

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

        // Remove bullet
        .replace(
            /^[-•*]\s*/,
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


// ==========================================================
// NORMALIZE KEYWORD
// ==========================================================

function normalizeKeyword(text) {

    if (!text) {

        return "";

    }


    return String(text)
        .toLowerCase()

        // Apostrophe
        .replace(
            /['’]/g,
            ""
        )

        // Hyphen / slash
        .replace(
            /[-_/]/g,
            " "
        )

        // T-shirt normalization
        .replace(
            /\bt[\s-]*shirt\b/g,
            "tshirt"
        )

        .replace(
            /\bt\s+shirt\b/g,
            "tshirt"
        )

        .replace(
            /\btshirt\b/g,
            "tshirt"
        )

        // Remove special characters
        .replace(
            /[^a-z0-9\s]/g,
            ""
        )

        // Extra spaces
        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// ==========================================================
// REMOVE DUPLICATES
// ==========================================================

function removeDuplicates(
    keywords
) {

    const output = [];

    const seen =
        new Set();


    if (
        !Array.isArray(keywords)
    ) {

        return output;

    }


    keywords.forEach(
        function (keyword) {

            const cleaned =
                cleanKeyword(
                    keyword
                );


            if (!cleaned) {

                return;

            }


            const normalized =
                normalizeKeyword(
                    cleaned
                );


            if (!normalized) {

                return;

            }


            if (
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
                cleaned
            );

        }
    );


    return output;

}


// ==========================================================
// PRIORITIZE MAIN KEYWORD
// ==========================================================

function prioritizeMainKeyword(
    keywords,
    mainKeyword
) {

    if (
        !Array.isArray(keywords)
    ) {

        return [];

    }


    const target =
        normalizeKeyword(
            mainKeyword
        );


    if (!target) {

        return keywords;

    }


    const index =
        keywords.findIndex(
            function (item) {

                return (
                    normalizeKeyword(
                        item
                    ) === target
                );

            }
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


// ==========================================================
// COPY SEO
// ==========================================================

async function copySEO() {

    const result =
        getElement("result");


    if (!result) {

        alert(
            "Result box नहीं मिला।"
        );

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


    // ======================================================
    // MODERN CLIPBOARD
    // ======================================================

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


    // ======================================================
    // FALLBACK
    // ======================================================

    fallbackCopy(
        text
    );

}


// ==========================================================
// FALLBACK COPY
// ==========================================================

function fallbackCopy(text) {

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


    textarea.style.opacity =
        "0";


    document.body.appendChild(
        textarea
    );


    textarea.focus();

    textarea.select();


    try {

        const success =
            document.execCommand(
                "copy"
            );


        if (success) {

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
            "Fallback copy error:",
            error
        );


        alert(
            "❌ Copy नहीं हो सका।"
        );

    }


    textarea.remove();

}


// ==========================================================
// DEBUG INFORMATION
// ==========================================================

console.log(
    "================================================"
);

console.log(
    "AI SELLER TOOLKIT"
);

console.log(
    "SEO KEYWORD GENERATOR — FINAL VERSION 13.0"
);

console.log(
    "API:",
    SEO_API_URL
);

console.log(
    "Main Keyword: OPTIONAL"
);

console.log(
    "================================================"
);
