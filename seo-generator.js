// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR
// FINAL VERSION 13.0
// ==========================================================
// Compatible with:
// SERVER.JS — VERSION 13.0
//
// Endpoint:
// POST /api/generate-seo
//
// Features:
// ✅ Product Name required
// ✅ Category required
// ✅ Brand optional
// ✅ Main Keyword optional
// ✅ If Main Keyword is empty → Product Name used
// ✅ Marketplace support
// ✅ 20 keywords maximum
// ✅ Duplicate protection
// ✅ Main keyword first
// ✅ Error handling
// ✅ Timeout protection
// ✅ Copy button
// ==========================================================


// ==========================================================
// API URL
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";


// ==========================================================
// START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initSEOGenerator();

    }
);


// ==========================================================
// INITIALIZE
// ==========================================================

function initSEOGenerator() {

    const generateBtn =
        document.getElementById("generateBtn");

    const copyBtn =
        document.getElementById("copyBtn");


    // ------------------------------------------------------
    // Generate Button
    // ------------------------------------------------------

    if (generateBtn) {

        generateBtn.addEventListener(
            "click",
            generateSEO
        );

    }
    else {

        console.error(
            "SEO Generator: generateBtn not found."
        );

    }


    // ------------------------------------------------------
    // Copy Button
    // ------------------------------------------------------

    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            copySEO
        );

    }
    else {

        console.error(
            "SEO Generator: copyBtn not found."
        );

    }

}


// ==========================================================
// GENERATE SEO
// ==========================================================

async function generateSEO() {

    // ------------------------------------------------------
    // Elements
    // ------------------------------------------------------

    const productElement =
        document.getElementById("product");

    const categoryElement =
        document.getElementById("category");

    const brandElement =
        document.getElementById("brand");

    const keywordElement =
        document.getElementById("keyword");

    const marketplaceElement =
        document.getElementById("marketplace");

    const generateBtn =
        document.getElementById("generateBtn");

    const result =
        document.getElementById("result");

    const status =
        document.getElementById("status");


    // ------------------------------------------------------
    // Check Elements
    // ------------------------------------------------------

    if (
        !productElement ||
        !categoryElement ||
        !brandElement ||
        !keywordElement ||
        !marketplaceElement ||
        !generateBtn ||
        !result ||
        !status
    ) {

        console.error(
            "SEO Generator: Required HTML element missing."
        );

        if (status) {

            status.innerText =
                "❌ SEO Generator में required HTML element नहीं मिला।";

        }

        return;

    }


    // ======================================================
    // GET VALUES
    // ======================================================

    const product =
        productElement.value.trim();

    const category =
        categoryElement.value.trim();

    const brand =
        brandElement.value.trim();

    const mainKeywordInput =
        keywordElement.value.trim();

    const marketplace =
        marketplaceElement.value.trim();


    // ======================================================
    // VALIDATION
    // ======================================================

    // Product Name REQUIRED

    if (!product) {

        showStatus(
            "❌ Please enter Product Name."
        );

        result.value = "";

        productElement.focus();

        return;

    }


    // Category REQUIRED

    if (!category) {

        showStatus(
            "❌ Please select Product Category."
        );

        result.value = "";

        categoryElement.focus();

        return;

    }


    // ======================================================
    // MAIN KEYWORD OPTIONAL
    // ======================================================
    //
    // अगर user Main Keyword खाली छोड़ता है,
    // तो Product Name automatically Main Keyword होगा.
    //
    // Example:
    //
    // Product Name = Cotton Kurti
    // Main Keyword = EMPTY
    //
    // finalMainKeyword = Cotton Kurti
    //
    // ======================================================

    const finalMainKeyword =
        mainKeywordInput || product;


    // ======================================================
    // UI LOADING
    // ======================================================

    generateBtn.disabled = true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";


    result.value =
        "⏳ Please wait...\n\nAI relevant SEO keywords बना रहा है...";


    showStatus(
        "🤖 AI SEO keywords बना रहा है..."
    );


    // ======================================================
    // REQUEST BODY
    // ======================================================

    const requestBody = {

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
            marketplace || "All Marketplaces"

    };


    console.log(
        "SEO API Request:",
        requestBody
    );


    // ======================================================
    // ABORT CONTROLLER
    // ======================================================

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            function () {

                controller.abort();

            },
            60000
        );


    // ======================================================
    // API CALL
    // ======================================================

    try {

        const response =
            await fetch(
                API_URL +
                "/api/generate-seo",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        ),

                    signal:
                        controller.signal

                }
            );


        clearTimeout(timeout);


        // ==================================================
        // READ RESPONSE
        // ==================================================

        const responseText =
            await response.text();


        console.log(
            "SEO API Raw Response:",
            responseText
        );


        // ==================================================
        // PARSE JSON
        // ==================================================

        let data = null;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (jsonError) {

            console.error(
                "Invalid JSON:",
                jsonError
            );

            throw new Error(
                "Backend ने valid JSON response नहीं दिया।"
            );

        }


        console.log(
            "SEO API Response:",
            data
        );


        // ==================================================
        // HTTP ERROR
        // ==================================================

        if (!response.ok) {

            const errorMessage =
                data &&
                data.error
                    ? data.error
                    : "Backend Error: HTTP " +
                      response.status;

            throw new Error(
                errorMessage
            );

        }


        // ==================================================
        // SUCCESS CHECK
        // ==================================================

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


        // ==================================================
        // GET KEYWORDS
        // ==================================================

        let keywords = [];


        if (
            Array.isArray(
                data.keywords
            )
        ) {

            keywords =
                data.keywords;

        }


        // ==================================================
        // BACKEND ALTERNATIVE RESPONSE
        // ==================================================

        // अगर backend किसी कारण से keywords
        // string में भेजता है तो उसे भी handle करें.

        if (
            !keywords.length &&
            typeof data.keywords === "string"
        ) {

            keywords =
                data.keywords
                    .split(/\r?\n/)
                    .map(
                        cleanKeyword
                    )
                    .filter(Boolean);

        }


        // ==================================================
        // CLEAN
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
        // REMOVE DUPLICATES AGAIN
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
                        item,
                        index
                    ) {

                        return (
                            (index + 1) +
                            ". " +
                            item
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
            " relevant SEO keywords generated successfully."
        );


    }
    catch (error) {

        clearTimeout(timeout);


        console.error(
            "SEO Generator Error:",
            error
        );


        // ==================================================
        // TIMEOUT ERROR
        // ==================================================

        if (
            error &&
            error.name ===
            "AbortError"
        ) {

            result.value =
                "❌ Request timeout.\n\n" +
                "Backend को response देने में बहुत समय लगा।\n" +
                "कृपया कुछ सेकंड बाद फिर कोशिश करें।";


            showStatus(
                "❌ Request timeout."
            );

            return;

        }


        // ==================================================
        // NORMAL ERROR
        // ==================================================

        const message =
            error &&
            error.message
                ? error.message
                : "Unknown error";


        result.value =
            "❌ SEO Keywords generate नहीं हो सके.\n\n" +
            "Error: " +
            message;


        showStatus(
            "❌ SEO generation failed."
        );

    }
    finally {

        // ==================================================
        // RESTORE BUTTON
        // ==================================================

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

        // Remove numbering
        .replace(
            /^\s*\d+[\.\)\-:]\s*/,
            ""
        )

        // Remove bullets
        .replace(
            /^[-•*]\s*/,
            ""
        )

        // Remove quotes
        .replace(
            /^["']|["']$/g,
            ""
        )

        // Multiple spaces
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
            /\bt shirt\b/g,
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

        // Multiple spaces
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
        !Array.isArray(
            keywords
        )
    ) {

        return output;

    }


    keywords.forEach(
        function (keyword) {

            const normalized =
                normalizeKeyword(
                    keyword
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
                keyword
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
        !Array.isArray(
            keywords
        )
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
// COPY SEO KEYWORDS
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


    // ------------------------------------------------------
    // Nothing to copy
    // ------------------------------------------------------

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

        const successful =
            document.execCommand(
                "copy"
            );


        if (successful) {

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
