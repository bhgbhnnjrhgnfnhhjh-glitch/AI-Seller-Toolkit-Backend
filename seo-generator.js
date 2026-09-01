// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 13.2
// ==========================================================
//
// Backend:
// AI Seller Toolkit Backend v13.2
//
// Model:
// gemini-3.6-flash
//
// API:
// Gemini Interactions API
//
// Endpoint:
// POST /api/generate-seo
//
// FEATURES
// - Main Keyword optional
// - Product Name fallback
// - Number/list prefix cleaning
// - Duplicate protection
// - Maximum 20 keywords
// - Stable JSON handling
// - Safe frontend validation
// - No generated data written into input fields
// ==========================================================


// ==========================================================
// API
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const SEO_API =
    API_URL + "/api/generate-seo";


// ==========================================================
// DOM READY
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const generateBtn =
            document.getElementById(
                "generateBtn"
            );

        const copyBtn =
            document.getElementById(
                "copyBtn"
            );

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

        console.log(
            "✅ AI Seller Toolkit SEO Generator 13.2 loaded"
        );

    }
);


// ==========================================================
// CLEAN USER INPUT
// ==========================================================

function cleanInput(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)

        .trim()

        // Remove numbered-list prefix
        // Example:
        // 1. Cotton Kurti
        // 2) Cotton Kurti
        // 3- Cotton Kurti
        .replace(
            /^\s*\d+\s*[\.\)\-:]\s*/,
            ""
        )

        // Remove bullet
        .replace(
            /^\s*[-•*]\s*/,
            ""
        )

        // Remove accidental repeated spaces
        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// ==========================================================
// GENERATE SEO
// ==========================================================

async function generateSEO() {

    const generateBtn =
        document.getElementById(
            "generateBtn"
        );

    const productElement =
        document.getElementById(
            "product"
        );

    const categoryElement =
        document.getElementById(
            "category"
        );

    const brandElement =
        document.getElementById(
            "brand"
        );

    const keywordElement =
        document.getElementById(
            "keyword"
        );

    const marketplaceElement =
        document.getElementById(
            "marketplace"
        );

    const result =
        document.getElementById(
            "result"
        );

    const status =
        document.getElementById(
            "status"
        );


    // ========================================================
    // ELEMENT CHECK
    // ========================================================

    if (
        !generateBtn ||
        !productElement ||
        !categoryElement ||
        !brandElement ||
        !keywordElement ||
        !marketplaceElement ||
        !result ||
        !status
    ) {

        console.error(
            "❌ SEO Generator: Required HTML element missing."
        );

        if (status) {

            status.innerText =
                "❌ SEO form में required element missing है।";

        }

        return;

    }


    // ========================================================
    // GET CLEAN VALUES
    // ========================================================

    const product =
        cleanInput(
            productElement.value
        );

    const category =
        cleanInput(
            categoryElement.value
        );

    const brand =
        cleanInput(
            brandElement.value
        );

    const mainKeywordInput =
        cleanInput(
            keywordElement.value
        );

    const marketplace =
        cleanInput(
            marketplaceElement.value
        );


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!product) {

        showStatus(
            "❌ Please enter Product Name."
        );

        productElement.focus();

        return;

    }


    if (!category) {

        showStatus(
            "❌ Please select Product Category."
        );

        categoryElement.focus();

        return;

    }


    // ========================================================
    // MAIN KEYWORD
    // ========================================================
    //
    // Optional:
    //
    // Empty →
    // Product Name becomes Main Keyword
    //
    // ========================================================

    const finalMainKeyword =
        mainKeywordInput ||
        product;


    // ========================================================
    // START UI
    // ========================================================

    generateBtn.disabled =
        true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";

    result.value =
        "⏳ Please wait...";

    showStatus(
        "🤖 AI SEO keywords बना रहा है..."
    );


    // ========================================================
    // REQUEST
    // ========================================================

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
        "===================================="
    );

    console.log(
        "SEO REQUEST"
    );

    console.log(
        requestData
    );

    console.log(
        "===================================="
    );


    // ========================================================
    // API REQUEST
    // ========================================================

    try {

        const response =
            await fetch(
                SEO_API,
                {

                    method:
                        "POST",

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
            "SEO API HTTP STATUS:",
            response.status
        );


        // ====================================================
        // READ RESPONSE
        // ====================================================

        const responseText =
            await response.text();


        console.log(
            "SEO API RAW RESPONSE:",
            responseText
        );


        // ====================================================
        // PARSE JSON
        // ====================================================

        let data;

        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (error) {

            throw new Error(
                "Backend ने valid JSON response नहीं दिया। HTTP " +
                response.status
            );

        }


        // ====================================================
        // HTTP ERROR
        // ====================================================

        if (!response.ok) {

            throw new Error(

                data &&
                data.error

                    ? data.error

                    : "Backend Error HTTP " +
                      response.status

            );

        }


        // ====================================================
        // SUCCESS CHECK
        // ====================================================

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


        // ====================================================
        // GET KEYWORDS
        // ====================================================

        let keywords = [];


        if (
            Array.isArray(
                data.keywords
            )
        ) {

            keywords =
                data.keywords;

        }
        else if (
            Array.isArray(
                data.seoKeywords
            )
        ) {

            keywords =
                data.seoKeywords;

        }


        // ====================================================
        // CLEAN KEYWORDS
        // ====================================================

        keywords =
            keywords

                .map(
                    cleanKeyword
                )

                .filter(Boolean);


        // ====================================================
        // REMOVE DUPLICATES
        // ====================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ====================================================
        // MAIN KEYWORD FIRST
        // ========================================================

        keywords =
            prioritizeMainKeyword(
                keywords,
                finalMainKeyword
            );


        // ====================================================
        // ENSURE MAIN KEYWORD
        // ====================================================

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


        // ====================================================
        // MAXIMUM 20
        // ====================================================

        keywords =
            keywords.slice(
                0,
                20
            );


        // ====================================================
        // FINAL EMPTY CHECK
        // ====================================================

        if (
            !keywords.length
        ) {

            throw new Error(
                "AI ने कोई SEO keyword नहीं दिया।"
            );

        }


        // ====================================================
        // DISPLAY
        // ====================================================

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


        // ====================================================
        // SUCCESS
        // ====================================================

        showStatus(

            "✅ " +
            keywords.length +
            " SEO keywords generated successfully."

        );


        console.log(
            "✅ FINAL SEO KEYWORDS:",
            keywords
        );


    }
    catch (error) {

        console.error(
            "❌ SEO GENERATOR ERROR:",
            error
        );


        result.value =

            "❌ SEO Keywords generate नहीं हो सके.\n\n" +
            "Error: " +
            error.message;


        showStatus(
            "❌ SEO generation failed."
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

function showStatus(
    message
) {

    const status =
        document.getElementById(
            "status"
        );

    if (status) {

        status.innerText =
            message;

    }

}


// ==========================================================
// CLEAN KEYWORD
// ==========================================================

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

        .replace(
            /^\s*\d+\s*[\.\)\-:]\s*/,
            ""
        )

        .replace(
            /^[-•*]\s*/,
            ""
        )

        .replace(
            /^["']|["']$/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// ==========================================================
// NORMALIZE KEYWORD
// ==========================================================

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


// ==========================================================
// REMOVE DUPLICATES
// ==========================================================

function removeDuplicates(
    keywords
) {

    const output = [];

    const seen =
        new Set();


    for (
        const keyword of
        keywords
    ) {

        const normalized =
            normalizeKeyword(
                keyword
            );


        if (!normalized) {

            continue;

        }


        if (
            seen.has(
                normalized
            )
        ) {

            continue;

        }


        seen.add(
            normalized
        );


        output.push(
            keyword
        );

    }


    return output;

}


// ==========================================================
// PRIORITIZE MAIN KEYWORD
// ==========================================================

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
            function (item) {

                return (
                    normalizeKeyword(
                        item
                    ) ===
                    target
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
        document.getElementById(
            "result"
        );


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


    // ========================================================
    // CLIPBOARD API
    // ========================================================

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


    // ========================================================
    // FALLBACK
    // ========================================================

    fallbackCopy(
        text
    );

}


// ==========================================================
// FALLBACK COPY
// ==========================================================

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
            "Copy Error:",
            error
        );

        alert(
            "❌ Copy नहीं हो सका।"
        );

    }


    textarea.remove();

}


// ==========================================================
// PREVENT ACCIDENTAL FORM SUBMIT
// ==========================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            event.target &&
            event.target.tagName === "INPUT"
        ) {

            // Product/Brand input में Enter दबाने पर
            // page submit नहीं होगा।
            event.preventDefault();

        }

    }
);


// ==========================================================
// GLOBAL ERROR
// ==========================================================

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "SEO Page Error:",
            event.error ||
            event.message
        );

    }
);


// ==========================================================
// FINAL
// ==========================================================

console.log(
    "🚀 AI Seller Toolkit SEO Generator 13.2 Ready"
);
