// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 14.2
// ==========================================================
//
// Backend:
// AI Seller Toolkit Backend v14.x
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
// VERSION 14.2 FIX
// ----------------------------------------------------------
// ✅ Main Keyword always first
// ✅ Requests up to 20 keywords from backend
// ✅ Minimum keyword target
// ✅ Frontend fallback if backend returns only 1 keyword
// ✅ Safe factual keyword expansion
// ✅ No invented product specifications
// ✅ Brand stuffing protection
// ✅ Product fragment protection
// ✅ Duplicate protection
// ✅ Near duplicate protection
// ✅ Generic useless keyword protection
// ✅ Maximum 20 keywords
// ✅ No generated data written into input fields
// ✅ Stable API response handling
// ✅ JSON / array response protection
// ==========================================================


// ==========================================================
// API
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const SEO_API =
    API_URL + "/api/generate-seo";


// ==========================================================
// SEO SETTINGS
// ==========================================================

const MAX_KEYWORDS = 20;

// Backend से कम से कम इतने keywords माँगे जाएंगे
const MIN_KEYWORDS = 12;


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


    const keywordNormalized =
        normalizeKeyword(
            keyword
        );

    const productNormalized =
        normalizeKeyword(
            product
        );


    // Exact product name is allowed
    if (
        keywordNormalized ===
        productNormalized
    ) {

        return false;

    }


    // Example:
    // Product = Cotton Kurti
    // Keyword = Kurti
    //
    // Reject it.

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


    // Example:
    //
    // Product:
    // Cotton Kurti
    //
    // Brand:
    // Test Brand Cotton Kurti
    //
    // Effective Brand:
    // Test Brand

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


    // Brand + product overlap protection

    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }


    // Product fragment protection

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
            cleanKeyword(
                keyword
            );


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
            clean
        );

    }


    return output;

}


// ==========================================================
// USELESS GENERIC KEYWORD CHECK
// ==========================================================

function isGenericKeyword(
    keyword
) {

    const normalized =
        normalizeKeyword(
            keyword
        );


    if (!normalized) {

        return true;

    }


    const genericWords = [

        "product",

        "products",

        "item",

        "items",

        "best product",

        "best products",

        "online shopping",

        "shopping",

        "online",

        "buy online",

        "shop online",

        "sale",

        "best",

        "new",

        "latest",

        "trending",

        "quality",

        "good quality",

        "cheap",

        "cheap price"

    ];


    return genericWords.includes(
        normalized
    );

}


// ==========================================================
// FILTER KEYWORDS
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
        // Generic keyword
        // ----------------------------------------------

        if (
            !isMain &&
            isGenericKeyword(
                keyword
            )
        ) {

            continue;

        }


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
            output.length >=
            MAX_KEYWORDS
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
                normalizeKeyword(
                    item
                ) ===
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
        MAX_KEYWORDS
    );

}


// ==========================================================
// SAFE LOCAL SEO EXPANSION
// ==========================================================
//
// IMPORTANT:
//
// यह section unsupported product facts नहीं बनाता।
//
// Example:
// Cotton Kurti
//
// Safe:
// cotton kurti online
// cotton kurti design
// cotton kurti collection
// cotton kurti for women
//
// लेकिन:
// cotton kurti floral
// cotton kurti printed
// cotton kurti silk
//
// जैसे unsupported facts नहीं बनाए जाएंगे।
//
// ==========================================================

function buildSafeFallbackKeywords(
    product,
    category,
    marketplace,
    brand,
    existingKeywords
) {

    const productClean =
        cleanInput(
            product
        );


    if (!productClean) {

        return [];

    }


    const output = [];


    const normalizedExisting =
        new Set(
            existingKeywords.map(
                item =>
                    normalizeKeyword(
                        item
                    )
            )
        );


    function addCandidate(
        candidate
    ) {

        const clean =
            cleanKeyword(
                candidate
            );


        if (!clean) {

            return;

        }


        const normalized =
            normalizeKeyword(
                clean
            );


        if (!normalized) {

            return;

        }


        if (
            normalizedExisting.has(
                normalized
            )
        ) {

            return;

        }


        if (
            output.some(
                item =>
                    normalizeKeyword(
                        item
                    ) === normalized
            )
        ) {

            return;

        }


        if (
            isGenericKeyword(
                clean
            )
        ) {

            return;

        }


        if (
            isProductFragment(
                clean,
                productClean
            )
        ) {

            return;

        }


        if (
            isBrandStuffed(
                clean,
                brand,
                productClean
            )
        ) {

            return;

        }


        // Near duplicate check

        const nearDuplicate =
            [
                ...existingKeywords,
                ...output
            ].some(
                existing =>
                    similarity(
                        existing,
                        clean
                    ) >= 0.88
            );


        if (
            nearDuplicate
        ) {

            return;

        }


        output.push(
            clean
        );

    }


    // ======================================================
    // BASE PRODUCT VARIANTS
    // ======================================================

    addCandidate(
        productClean +
        " online"
    );


    addCandidate(
        productClean +
        " shopping"
    );


    addCandidate(
        productClean +
        " collection"
    );


    addCandidate(
        productClean +
        " design"
    );


    addCandidate(
        productClean +
        " styles"
    );


    addCandidate(
        productClean +
        " for daily use"
    );


    // ======================================================
    // MARKETPLACE
    // ======================================================

    const market =
        cleanInput(
            marketplace
        );


    if (market) {

        addCandidate(
            productClean +
            " on " +
            market
        );


        addCandidate(
            market +
            " " +
            productClean
        );

    }


    // ======================================================
    // CATEGORY
    // ======================================================

    const categoryClean =
        cleanInput(
            category
        );


    if (
        categoryClean &&
        normalizeKeyword(
            categoryClean
        ) !==
        normalizeKeyword(
            productClean
        )
    ) {

        addCandidate(
            productClean +
            " " +
            categoryClean
        );

    }


    // ======================================================
    // SAFE GENERAL SHOPPING PHRASES
    // ======================================================

    addCandidate(
        "buy " +
        productClean
    );


    addCandidate(
        "shop " +
        productClean
    );


    addCandidate(
        productClean +
        " price"
    );


    addCandidate(
        productClean +
        " online shopping"
    );


    addCandidate(
        productClean +
        " latest collection"
    );


    // ======================================================
    // PRODUCT TOKEN COMBINATIONS
    // ======================================================

    const tokens =
        productClean
            .split(" ")
            .filter(
                token =>
                    token.length > 1
            );


    if (
        tokens.length >= 2
    ) {

        // Reverse only for simple 2-token product names.
        // Example:
        // Cotton Kurti
        // Kurti Cotton

        if (
            tokens.length === 2
        ) {

            addCandidate(
                tokens[1] +
                " " +
                tokens[0]
            );

        }

    }


    return output;

}


// ==========================================================
// COMBINE + FINAL FILTER
// ==========================================================

function finalizeKeywords(
    aiKeywords,
    product,
    category,
    brand,
    mainKeyword,
    marketplace
) {

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword,
            product,
            brand
        );


    // ----------------------------------------------
    // AI KEYWORDS
    // ----------------------------------------------

    let keywords =
        filterFrontendKeywords(
            aiKeywords,
            product,
            brand,
            safeMain
        );


    // ----------------------------------------------
    // FALLBACK
    // ----------------------------------------------

    if (
        keywords.length <
        MIN_KEYWORDS
    ) {

        const fallbackKeywords =
            buildSafeFallbackKeywords(
                product,
                category,
                marketplace,
                brand,
                keywords
            );


        for (
            const keyword of
            fallbackKeywords
        ) {

            if (
                keywords.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            const nearDuplicate =
                keywords.some(
                    existing =>
                        similarity(
                            existing,
                            keyword
                        ) >= 0.88
                );


            if (
                nearDuplicate
            ) {

                continue;

            }


            keywords.push(
                keyword
            );

        }

    }


    // ----------------------------------------------
    // FINAL CLEAN
    // ----------------------------------------------

    keywords =
        removeDuplicates(
            keywords
        );


    // ----------------------------------------------
    // MAIN KEYWORD PROTECTION
    // ----------------------------------------------

    const normalizedMain =
        normalizeKeyword(
            safeMain
        );


    if (
        safeMain &&
        !keywords.some(
            item =>
                normalizeKeyword(
                    item
                ) ===
                normalizedMain
        )
    ) {

        keywords.unshift(
            safeMain
        );

    }


    // ----------------------------------------------
    // MAIN FIRST
    // ----------------------------------------------

    const mainIndex =
        keywords.findIndex(
            item =>
                normalizeKeyword(
                    item
                ) ===
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


    // ----------------------------------------------
    // FINAL MAXIMUM
    // ----------------------------------------------

    return keywords.slice(
        0,
        MAX_KEYWORDS
    );

}


// ==========================================================
// EXTRACT KEYWORDS FROM RESPONSE
// ==========================================================

function extractKeywordsFromResponse(
    data
) {

    if (!data) {

        return [];

    }


    // ----------------------------------------------
    // Direct arrays
    // ----------------------------------------------

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    // ----------------------------------------------
    // Common backend fields
    // ----------------------------------------------

    const possibleFields = [

        "keywords",

        "seoKeywords",

        "seo_keywords",

        "keywordList",

        "keyword_list",

        "results"

    ];


    for (
        const field of
        possibleFields
    ) {

        if (
            Array.isArray(
                data[field]
            )
        ) {

            return data[field];

        }

    }


    // ----------------------------------------------
    // Nested result
    // ----------------------------------------------

    if (
        data.result &&
        typeof data.result ===
        "object"
    ) {

        return extractKeywordsFromResponse(
            data.result
        );

    }


    // ----------------------------------------------
    // Nested data
    // ----------------------------------------------

    if (
        data.data &&
        typeof data.data ===
        "object"
    ) {

        return extractKeywordsFromResponse(
            data.data
        );

    }


    // ----------------------------------------------
    // String response
    // ----------------------------------------------

    if (
        typeof data ===
        "string"
    ) {

        return data
            .split("\n")
            .map(
                line =>
                    cleanKeyword(
                        line
                    )
            )
            .filter(Boolean);

    }


    return [];

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
        "🤖 AI 20 तक SEO keywords बना रहा है..."
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
            marketplace,

        // IMPORTANT
        // Backend को स्पष्ट target
        keywordCount:
            MAX_KEYWORDS,

        maxKeywords:
            MAX_KEYWORDS,

        minKeywords:
            MIN_KEYWORDS,

        requestedKeywordCount:
            MAX_KEYWORDS

    };


    console.log(
        "===================================="
    );


    console.log(
        "SEO REQUEST 14.2"
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
            data &&
            data.success === false
        ) {

            throw new Error(

                data.error ||
                "SEO keywords generate नहीं हुए।"

            );

        }


        // ====================================================
        // GET AI KEYWORDS
        // ====================================================

        let keywords =
            extractKeywordsFromResponse(
                data
            );


        console.log(
            "AI KEYWORDS BEFORE FILTER:",
            keywords
        );


        // ====================================================
        // FINAL KEYWORDS
        // ====================================================

        keywords =
            finalizeKeywords(

                keywords,

                product,

                category,

                brand,

                finalMainKeyword,

                marketplace

            );


        console.log(
            "FINAL SEO KEYWORDS 14.2:",
            keywords
        );


        // ====================================================
        // EMPTY CHECK
        // ====================================================

        if (
            !keywords.length
        ) {

            throw new Error(
                "SEO keywords generate नहीं हो सके।"
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
        // SUCCESS MESSAGE
        // ====================================================

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


    // ======================================================
    // CLIPBOARD API
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
