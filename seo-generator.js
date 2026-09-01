// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 14.2
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
// ==========================================================
// FINAL 14.2 FIXES
// ==========================================================
//
// - Product Name हमेशा primary identity
// - Main Keyword हमेशा Product Name से सुरक्षित
// - Brand/Product overlap protection
// - Brand stuffing protection
// - Product fragment protection
// - Duplicate protection
// - Near duplicate protection
// - Generic filler protection
// - Maximum 20 keywords
// - Main keyword हमेशा first
// - Empty AI result पर safe fallback
// - Backend error पर factual fallback
// - Generated keywords input fields में नहीं जाएंगे
// - Stable JSON response handling
// - HTTP error handling
// - Copy button support
// - Mobile-friendly frontend handling
// - Double-click protection
// - Abort/timeout protection
// ==========================================================


// ==========================================================
// API CONFIG
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const SEO_API =
    API_URL + "/api/generate-seo";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let seoGenerating = false;

let seoAbortController = null;


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
                function (event) {

                    event.preventDefault();

                    generateSEO();

                }
            );

        }

        if (copyBtn) {

            copyBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    copySEO();

                }
            );

        }

        console.log(
            "✅ AI Seller Toolkit SEO Generator 14.2 loaded"
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
// NORMALIZE KEYWORD
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
// PRODUCT FRAGMENT CHECK
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

    const normalizedKeyword =
        normalizeKeyword(keyword);

    const normalizedProduct =
        normalizeKeyword(product);

    // Exact Product Name is valid.
    if (
        normalizedKeyword ===
        normalizedProduct
    ) {

        return false;

    }

    // Example:
    //
    // Product = Cotton Kurti
    // Keyword = Kurti
    //
    // Reject.
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
// BRAND STUFFING CHECK
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
        tokenSet(
            effectiveBrand
        );

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
// GENERIC SEO FILLER WORDS
// ==========================================================

const SEO_FILLER_WORDS =
    new Set([

        "online",
        "collection",
        "store",
        "fashion",
        "apparel",
        "wear",
        "shopping",
        "buy",
        "shop",
        "best",
        "premium",
        "trendy",
        "stylish",
        "latest",
        "new",
        "beautiful",
        "quality",
        "sale",
        "offer",
        "offers",
        "deals",
        "price",
        "cheap",
        "wholesale",
        "original",
        "popular",
        "exclusive",
        "top"

    ]);


// ==========================================================
// FILLER CHECK
// ==========================================================

function isGenericFiller(
    keyword,
    product,
    mainKeyword
) {

    const normalized =
        normalizeKeyword(
            keyword
        );

    if (!normalized) {

        return true;

    }

    const normalizedMain =
        normalizeKeyword(
            mainKeyword
        );

    if (
        normalized ===
        normalizedMain
    ) {

        return false;

    }

    const tokens =
        normalized
            .split(" ")
            .filter(Boolean);

    const productTokens =
        tokenSet(product);

    const mainTokens =
        tokenSet(mainKeyword);

    let meaningful = 0;

    for (
        const token of tokens
    ) {

        if (
            productTokens.has(token) ||
            mainTokens.has(token)
        ) {

            meaningful++;

            continue;

        }

        if (
            !SEO_FILLER_WORDS.has(token)
        ) {

            meaningful++;

        }

    }

    return (
        meaningful === 0
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
        cleanInput(
            product
        );

    if (!productClean) {

        return "";

    }

    const mainClean =
        cleanInput(
            mainKeyword
        );

    // No main keyword supplied.
    // Product Name becomes main keyword.
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

    // Exact Product Name.
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

    // Brand stuffing / overlap protection.
    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }

    // Reject partial product keyword.
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

    if (
        !Array.isArray(keywords)
    ) {

        return output;

    }

    for (
        const rawKeyword of keywords
    ) {

        const keyword =
            cleanKeyword(
                rawKeyword
            );

        if (!keyword) {

            continue;

        }

        const normalized =
            normalizeKeyword(
                keyword
            );

        if (!normalized) {

            continue;

        }

        if (
            seen.has(normalized)
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
// FRONTEND KEYWORD FILTER
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
            keywords
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


        // --------------------------------------------------
        // Maximum 8 words
        // --------------------------------------------------

        const wordCount =
            normalized
                .split(" ")
                .filter(Boolean)
                .length;

        if (
            wordCount > 8
        ) {

            continue;

        }


        // --------------------------------------------------
        // Product fragment
        // --------------------------------------------------

        if (
            !isMain &&
            isProductFragment(
                keyword,
                product
            )
        ) {

            continue;

        }


        // --------------------------------------------------
        // Brand stuffing
        // --------------------------------------------------

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


        // --------------------------------------------------
        // Generic filler
        // --------------------------------------------------

        if (
            !isMain &&
            isGenericFiller(
                keyword,
                product,
                safeMain
            )
        ) {

            continue;

        }


        // --------------------------------------------------
        // Near duplicate
        // --------------------------------------------------

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
    // MAIN KEYWORD MUST BE FIRST
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
// LOCAL FACTUAL FALLBACK
// ==========================================================

function buildLocalFallback(
    product,
    brand,
    mainKeyword
) {

    const candidates = [];

    const safeProduct =
        cleanInput(
            product
        );

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword ||
            safeProduct,
            safeProduct,
            brand
        );

    if (safeMain) {

        candidates.push(
            safeMain
        );

    }

    if (
        safeProduct &&
        normalizeKeyword(safeProduct) !==
        normalizeKeyword(safeMain)
    ) {

        candidates.push(
            safeProduct
        );

    }

    return filterFrontendKeywords(
        candidates,
        safeProduct,
        brand,
        safeMain
    );

}


// ==========================================================
// FETCH WITH TIMEOUT
// ==========================================================

async function fetchWithTimeout(
    url,
    options,
    timeout
) {

    seoAbortController =
        new AbortController();

    const timer =
        setTimeout(
            function () {

                seoAbortController.abort();

            },
            timeout
        );

    try {

        const finalOptions = {

            ...options,

            signal:
                seoAbortController.signal

        };

        return await fetch(
            url,
            finalOptions
        );

    }
    finally {

        clearTimeout(
            timer
        );

        seoAbortController =
            null;

    }

}


// ==========================================================
// GENERATE SEO
// ==========================================================

async function generateSEO() {

    // ------------------------------------------------------
    // Prevent double click
    // ------------------------------------------------------

    if (seoGenerating) {

        return;

    }

    seoGenerating =
        true;


    // ======================================================
    // DOM
    // ======================================================

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


    // ======================================================
    // ELEMENT CHECK
    // ======================================================

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
            "❌ SEO Generator 14.2: Required HTML element missing."
        );

        if (status) {

            status.innerText =
                "❌ SEO form में required element missing है।";

        }

        seoGenerating =
            false;

        return;

    }


    // ======================================================
    // INPUT VALUES
    // ======================================================

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


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!product) {

        showStatus(
            "❌ Please enter Product Name."
        );

        productElement.focus();

        seoGenerating =
            false;

        return;

    }


    if (!category) {

        showStatus(
            "❌ Please select Product Category."
        );

        categoryElement.focus();

        seoGenerating =
            false;

        return;

    }


    // ======================================================
    // SAFE MAIN KEYWORD
    // ======================================================

    const finalMainKeyword =
        sanitizeMainKeyword(

            mainKeywordInput ||
            product,

            product,

            brand

        );


    // ======================================================
    // UI LOADING
    // ======================================================

    generateBtn.disabled =
        true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";

    result.value =
        "⏳ Please wait...";

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
        "===================================="
    );

    console.log(
        "SEO REQUEST — FINAL 14.2"
    );

    console.log(
        requestData
    );

    console.log(
        "===================================="
    );


    // ======================================================
    // API REQUEST
    // ======================================================

    try {

        const response =
            await fetchWithTimeout(

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

                },

                45000

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


        // ==================================================
        // JSON PARSE
        // ==================================================

        let data;

        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (parseError) {

            throw new Error(
                "Backend ने valid JSON response नहीं दिया। HTTP " +
                response.status
            );

        }


        // ==================================================
        // HTTP ERROR
        // ==================================================

        if (!response.ok) {

            throw new Error(

                data &&
                data.error
                    ? data.error
                    : "Backend Error HTTP " +
                      response.status

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
        else if (
            Array.isArray(
                data.seoKeywords
            )
        ) {

            keywords =
                data.seoKeywords;

        }


        // ==================================================
        // FRONTEND SAFETY FILTER
        // ==================================================

        keywords =
            filterFrontendKeywords(

                keywords,

                product,

                brand,

                finalMainKeyword

            );


        // ==================================================
        // SAFE MAIN
        // ==================================================

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


        // ==================================================
        // ENSURE MAIN KEYWORD
        // ==================================================

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


        // ==================================================
        // REMOVE DUPLICATES AGAIN
        // ==================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ==================================================
        // MAIN KEYWORD FIRST
        // ==================================================

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


        // ==================================================
        // FINAL MAX 20
        // ==================================================

        keywords =
            keywords.slice(
                0,
                20
            );


        // ==================================================
        // IF EMPTY — LOCAL FACTUAL FALLBACK
        // ==================================================

        if (
            !keywords.length
        ) {

            keywords =
                buildLocalFallback(
                    product,
                    brand,
                    safeMain
                );

        }


        // ==================================================
        // STILL EMPTY
        // ==================================================

        if (
            !keywords.length
        ) {

            throw new Error(
                "SEO keyword generate नहीं हो सका।"
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
            "✅ FINAL SEO KEYWORDS 14.2:",
            keywords
        );

    }
    catch (error) {

        console.error(
            "❌ SEO GENERATOR ERROR:",
            error
        );


        // ==================================================
        // LOCAL FACTUAL FALLBACK
        // ==================================================

        const safeFallback =
            buildLocalFallback(

                product,

                brand,

                finalMainKeyword

            );


        if (
            safeFallback.length
        ) {

            result.value =
                safeFallback
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


            showStatus(
                "⚠️ AI unavailable. Safe factual SEO keyword generated."
            );


            console.log(
                "⚠️ LOCAL SEO FALLBACK:",
                safeFallback
            );

        }
        else {

            result.value =

                "❌ SEO Keywords generate नहीं हो सके.\n\n" +
                "Error: " +
                (
                    error &&
                    error.message
                        ? error.message
                        : "Unknown error"
                );


            showStatus(
                "❌ SEO generation failed."
            );

        }

    }
    finally {

        generateBtn.disabled =
            false;

        generateBtn.innerText =
            "🤖 Generate SEO Keywords";

        seoGenerating =
            false;

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
    // FALLBACK COPY
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

    textarea.setSelectionRange(
        0,
        textarea.value.length
    );


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
// PREVENT ENTER SUBMIT
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
// UNHANDLED PROMISE ERROR
// ==========================================================

window.addEventListener(
    "unhandledrejection",
    function (event) {

        console.error(
            "SEO Unhandled Promise Error:",
            event.reason
        );

    }
);


// ==========================================================
// FINAL
// ==========================================================

console.log(
    "🚀 AI Seller Toolkit SEO Generator 14.2 Ready"
);
