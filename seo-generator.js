// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 14.1
// ==========================================================
//
// Backend:
// AI Seller Toolkit Backend v14.1
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
// FINAL SEO FIXES:
// - Product Name is primary identity
// - Main Keyword fallback
// - Brand/product overlap protection
// - Main keyword sanitization
// - Duplicate protection
// - Near duplicate protection
// - Product fragment protection
// - Generic keyword protection
// - Maximum 20 keywords
// - Main keyword always first
// - No generated data written into input fields
// - Stable frontend handling
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
            "✅ AI Seller Toolkit SEO Generator 14.1 loaded"
        );

    }
);


// ==========================================================
// CLEAN INPUT
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

        .replace(
            /^\s*\d+\s*[\.\)\-:]\s*/,
            ""
        )

        .replace(
            /^\s*[-•*]\s*/,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// ==========================================================
// NORMALIZE
// ==========================================================

function normalizeKeyword(text) {

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
            /\s+/g,
            " "
        )

        .trim();

}


// ==========================================================
// TOKEN SET
// ==========================================================

function tokenSet(text) {

    const normalized =
        normalizeKeyword(text);

    if (!normalized) {

        return new Set();

    }

    return new Set(
        normalized
            .split(" ")
            .filter(
                token =>
                    token.length > 1
            )
    );

}


// ==========================================================
// PRODUCT FRAGMENT
// ==========================================================

function isProductFragment(
    keyword,
    product
) {

    const K =
        tokenSet(keyword);

    const P =
        tokenSet(product);

    if (
        !K.size ||
        !P.size
    ) {

        return false;

    }

    if (
        normalizeKeyword(keyword) ===
        normalizeKeyword(product)
    ) {

        return false;

    }

    // Reject:
    // Cotton Kurti -> Kurti

    if (
        K.size === 1 &&
        P.size > 1
    ) {

        for (
            const token of K
        ) {

            if (
                P.has(token)
            ) {

                return true;

            }

        }

    }

    return false;

}


// ==========================================================
// EFFECTIVE BRAND
// ==========================================================

function getEffectiveBrand(
    brand,
    product
) {

    const b =
        normalizeKeyword(
            brand
        );

    const p =
        normalizeKeyword(
            product
        );

    if (!b) {

        return "";

    }

    if (
        p &&
        b.includes(p)
    ) {

        return b
            .replace(
                p,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }

    return b;

}


// ==========================================================
// BRAND STUFFING
// ==========================================================

function isBrandStuffed(
    keyword,
    brand,
    product
) {

    const effectiveBrand =
        getEffectiveBrand(
            brand,
            product
        );

    if (!effectiveBrand) {

        return false;

    }

    const K =
        tokenSet(keyword);

    const B =
        tokenSet(effectiveBrand);

    if (
        !K.size ||
        !B.size
    ) {

        return false;

    }

    let count = 0;

    B.forEach(
        token => {

            if (
                K.has(token)
            ) {

                count++;

            }

        }
    );

    return (
        count === B.size
    );

}


// ==========================================================
// SIMILARITY
// ==========================================================

function similarity(
    a,
    b
) {

    const A =
        tokenSet(a);

    const B =
        tokenSet(b);

    if (
        !A.size ||
        !B.size
    ) {

        return 0;

    }

    let intersection = 0;

    A.forEach(
        token => {

            if (
                B.has(token)
            ) {

                intersection++;

            }

        }
    );

    const union =
        new Set([
            ...A,
            ...B
        ]).size;

    if (!union) {

        return 0;

    }

    return (
        intersection /
        union
    );

}


// ==========================================================
// SAFE MAIN KEYWORD
// ==========================================================

function sanitizeMainKeyword(
    mainKeyword,
    product,
    brand
) {

    const productClean =
        cleanInput(product);

    if (!productClean) {

        return "";

    }

    const mainClean =
        cleanInput(mainKeyword);

    if (!mainClean) {

        return productClean;

    }

    const mainNormalized =
        normalizeKeyword(
            mainClean
        );

    const productNormalized =
        normalizeKeyword(
            productClean
        );

    // Exact Product Name
    if (
        mainNormalized ===
        productNormalized
    ) {

        return productClean;

    }

    const effectiveBrand =
        getEffectiveBrand(
            brand,
            productClean
        );

    const brandNormalized =
        normalizeKeyword(
            effectiveBrand
        );

    // Example:
    //
    // Product:
    // Cotton Kurti
    //
    // Brand:
    // Test Brand Cotton Kurti
    //
    // Main:
    // Test Brand Kurti
    //
    // Safe result:
    // Cotton Kurti

    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }

    // Reject partial product keyword
    if (
        isProductFragment(
            mainClean,
            productClean
        )
    ) {

        return productClean;

    }

    return mainClean;

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
// REMOVE DUPLICATES
// ==========================================================

function removeDuplicates(
    keywords
) {

    const output = [];

    const seen =
        new Set();

    for (
        const keyword of keywords
    ) {

        const clean =
            cleanKeyword(keyword);

        if (!clean) {

            continue;

        }

        const normalized =
            normalizeKeyword(
                clean
            );

        if (!normalized) {

            continue;

        }

        if (
            seen.has(normalized)
        ) {

            continue;

        }

        seen.add(normalized);

        output.push(clean);

    }

    return output;

}


// ==========================================================
// FILTER FRONTEND KEYWORDS
// ==========================================================

function filterFrontendKeywords(
    keywords,
    product,
    brand,
    mainKeyword
) {

    const output = [];

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword,
            product,
            brand
        );

    const mainNormalized =
        normalizeKeyword(
            safeMain
        );

    const cleaned =
        removeDuplicates(
            Array.isArray(keywords)
                ? keywords
                : []
        );

    for (
        const keyword of cleaned
    ) {

        const normalized =
            normalizeKeyword(
                keyword
            );

        const isMain =
            normalized ===
            mainNormalized;

        // ----------------------------------------------
        // Product fragment
        // ----------------------------------------------

        if (
            !isMain &&
            isProductFragment(
                keyword,
                product
            )
        ) {

            continue;

        }

        // ----------------------------------------------
        // Brand stuffing
        // ----------------------------------------------

        if (
            !isMain &&
            isBrandStuffed(
                keyword,
                brand,
                product
            )
        ) {

            continue;

        }

        // ----------------------------------------------
        // Near duplicate
        // ----------------------------------------------

        const nearDuplicate =
            output.some(
                existing =>
                    similarity(
                        existing,
                        keyword
                    ) >= 0.80
            );

        if (
            nearDuplicate &&
            !isMain
        ) {

            continue;

        }

        output.push(
            keyword
        );

        if (
            output.length >= 20
        ) {

            break;

        }

    }


    // ======================================================
    // MAIN KEYWORD FIRST
    // ======================================================

    const mainIndex =
        output.findIndex(
            item =>
                normalizeKeyword(item) ===
                mainNormalized
        );

    if (
        mainIndex >= 0
    ) {

        const mainItem =
            output.splice(
                mainIndex,
                1
            )[0];

        output.unshift(
            mainItem
        );

    }
    else if (
        safeMain
    ) {

        output.unshift(
            safeMain
        );

    }


    return output.slice(
        0,
        20
    );

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
    // INPUTS
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
    // SAFE MAIN KEYWORD
    // ========================================================

    const finalMainKeyword =
        sanitizeMainKeyword(

            mainKeywordInput ||
            product,

            product,

            brand

        );


    // ========================================================
    // UI START
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
        "SEO REQUEST 14.1"
    );

    console.log(
        requestData
    );

    console.log(
        "===================================="
    );


    // ========================================================
    // API
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


        const responseText =
            await response.text();


        console.log(
            "SEO API RAW RESPONSE:",
            responseText
        );


        // ====================================================
        // PARSE
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
        // SUCCESS
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
        // FRONTEND FINAL FILTER
        // ====================================================

        keywords =
            filterFrontendKeywords(

                keywords,

                product,

                brand,

                finalMainKeyword

            );


        // ====================================================
        // ENSURE MAIN KEYWORD
        // ====================================================

        const safeMain =
            sanitizeMainKeyword(

                finalMainKeyword,

                product,

                brand

            );

        const normalizedMain =
            normalizeKeyword(
                safeMain
            );


        const mainExists =
            keywords.some(
                item =>
                    normalizeKeyword(item) ===
                    normalizedMain
            );


        if (
            !mainExists &&
            safeMain
        ) {

            keywords.unshift(
                safeMain
            );

        }


        // ====================================================
        // REMOVE DUPLICATES AGAIN
        // ====================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ====================================================
        // MAIN FIRST AGAIN
        // ====================================================

        const mainIndex =
            keywords.findIndex(
                item =>
                    normalizeKeyword(item) ===
                    normalizedMain
            );


        if (
            mainIndex > 0
        ) {

            const mainItem =
                keywords.splice(
                    mainIndex,
                    1
                )[0];

            keywords.unshift(
                mainItem
            );

        }


        // ====================================================
        // MAX 20
        // ====================================================

        keywords =
            keywords.slice(
                0,
                20
            );


        // ====================================================
        // EMPTY
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
            "✅ FINAL SEO KEYWORDS 14.1:",
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

function showStatus(message) {

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


    fallbackCopy(text);

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
// PREVENT INPUT ENTER SUBMIT
// ==========================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            event.target &&
            event.target.tagName === "INPUT"
        ) {

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
    "🚀 AI Seller Toolkit SEO Generator 14.1 Ready"
);
