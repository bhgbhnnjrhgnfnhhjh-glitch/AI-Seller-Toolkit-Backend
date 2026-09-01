// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 14.2 FIXED
// ==========================================================
//
// BACKEND:
// AI Seller Toolkit Backend v14.x
//
// MODEL:
// gemini-3.6-flash
//
// API:
// Gemini Interactions API
//
// ENDPOINT:
// POST /api/generate-seo
//
// ==========================================================
// VERSION 14.2 FIXED
// ==========================================================
//
// ✅ 1 keyword problem fixed
// ✅ Always minimum 12 keywords
// ✅ Maximum 20 keywords
// ✅ Main Keyword always first
// ✅ Backend may return 1, 5, 10 or 20 keywords
// ✅ Frontend automatically completes missing keywords
// ✅ Backend array/string/JSON response supported
// ✅ Safe factual keyword expansion
// ✅ No invented product specifications
// ✅ No invented color
// ✅ No invented material
// ✅ No invented size
// ✅ No invented gender
// ✅ No invented features
// ✅ Brand stuffing protection
// ✅ Product fragment protection
// ✅ Duplicate protection
// ✅ Near duplicate protection
// ✅ Generic keyword protection
// ✅ Input fields never modified
// ✅ Stable API handling
// ==========================================================


// ==========================================================
// API CONFIGURATION
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const SEO_API =
    API_URL + "/api/generate-seo";


// ==========================================================
// SEO LIMITS
// ==========================================================

const MAX_KEYWORDS = 20;

// अगर AI कम keywords दे तो frontend कम से कम 12 बनाएगा
const MIN_KEYWORDS = 12;


// ==========================================================
// DOM READY
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const generateBtn =
            document.getElementById("generateBtn");

        const copyBtn =
            document.getElementById("copyBtn");


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
            "✅ AI Seller Toolkit SEO Generator 14.2 FIXED loaded"
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
        normalizeKeyword(keyword);

    const productNormalized =
        normalizeKeyword(product);


    // Exact product name is ALWAYS allowed
    if (
        keywordNormalized ===
        productNormalized
    ) {

        return false;

    }


    // Single token from multi-token product
    //
    // Cotton Tshirt
    // Tshirt ❌
    // Cotton ❌

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
        normalizeKeyword(brand);

    const p =
        normalizeKeyword(product);


    if (!b) {

        return "";

    }


    // Example:
    //
    // Brand:
    // Test Brand Cotton Tshirt
    //
    // Product:
    // Cotton Tshirt
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
// TOKEN SIMILARITY
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
        normalizeKeyword(mainClean);

    const productNormalized =
        normalizeKeyword(productClean);


    // Exact product
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


    // Prevent brand-only/main keyword contamination
    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }


    // Prevent product fragment
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


    if (!Array.isArray(keywords)) {

        return output;

    }


    for (
        const item of keywords
    ) {

        const keyword =
            cleanKeyword(item);


        if (!keyword) {

            continue;

        }


        const normalized =
            normalizeKeyword(keyword);


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
// GENERIC KEYWORD CHECK
// ==========================================================

function isGenericKeyword(
    keyword
) {

    const normalized =
        normalizeKeyword(keyword);


    if (!normalized) {

        return true;

    }


    const genericWords = [

        "product",

        "products",

        "item",

        "items",

        "online",

        "shopping",

        "online shopping",

        "buy online",

        "shop online",

        "sale",

        "best",

        "best product",

        "best products",

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


        // Generic
        if (
            !isMain &&
            isGenericKeyword(keyword)
        ) {

            continue;

        }


        // Product fragment
        if (
            !isMain &&
            isProductFragment(
                keyword,
                product
            )
        ) {

            continue;

        }


        // Brand stuffing
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


        // Near duplicate
        const nearDuplicate =
            output.some(
                existing =>
                    similarity(
                        existing,
                        keyword
                    ) >= 0.82
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


    // Main keyword always first

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
        MAX_KEYWORDS
    );

}


// ==========================================================
// SAFE FALLBACK KEYWORD BUILDER
// ==========================================================
//
// यह सबसे महत्वपूर्ण FIX है.
//
// अगर backend सिर्फ:
//
// 1. Cotton Tshirt
//
// देता है तो frontend अपने आप additional
// safe search phrases बनाएगा.
//
// कोई नया product fact नहीं बनाया जाएगा.
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
        cleanInput(product);


    if (!productClean) {

        return [];

    }


    const output = [];


    const existing =
        Array.isArray(existingKeywords)
            ? existingKeywords
            : [];


    const existingNormalized =
        new Set(
            existing.map(
                item =>
                    normalizeKeyword(item)
            )
        );


    function addCandidate(
        candidate
    ) {

        const clean =
            cleanKeyword(candidate);


        if (!clean) {

            return;

        }


        const normalized =
            normalizeKeyword(clean);


        if (!normalized) {

            return;

        }


        // Already exists
        if (
            existingNormalized.has(
                normalized
            )
        ) {

            return;

        }


        // Already in fallback
        if (
            output.some(
                item =>
                    normalizeKeyword(item) ===
                    normalized
            )
        ) {

            return;

        }


        // Generic
        if (
            isGenericKeyword(clean)
        ) {

            return;

        }


        // Product fragment
        if (
            isProductFragment(
                clean,
                productClean
            )
        ) {

            return;

        }


        // Brand stuffing
        if (
            isBrandStuffed(
                clean,
                brand,
                productClean
            )
        ) {

            return;

        }


        // Near duplicate against existing
        const tooSimilar =
            [
                ...existing,
                ...output
            ].some(
                item =>
                    similarity(
                        item,
                        clean
                    ) >= 0.88
            );


        if (
            tooSimilar
        ) {

            return;

        }


        output.push(
            clean
        );

    }


    // ======================================================
    // SAFE PRODUCT SEARCH PHRASES
    // ======================================================

    addCandidate(
        productClean + " online"
    );

    addCandidate(
        productClean + " shopping"
    );

    addCandidate(
        productClean + " collection"
    );

    addCandidate(
        productClean + " design"
    );

    addCandidate(
        productClean + " styles"
    );

    addCandidate(
        "buy " + productClean
    );

    addCandidate(
        "shop " + productClean
    );

    addCandidate(
        productClean + " price"
    );

    addCandidate(
        productClean + " online shopping"
    );

    addCandidate(
        productClean + " shopping online"
    );

    addCandidate(
        "buy " + productClean + " online"
    );

    addCandidate(
        "shop " + productClean + " online"
    );


    // ======================================================
    // MARKETPLACE PHRASES
    // ======================================================

    const market =
        cleanInput(marketplace);


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

        addCandidate(
            "buy " +
            productClean +
            " on " +
            market
        );

        addCandidate(
            productClean +
            " " +
            market +
            " shopping"
        );

    }


    // ======================================================
    // CATEGORY PHRASES
    // ======================================================

    const categoryClean =
        cleanInput(category);


    if (
        categoryClean &&
        normalizeKeyword(categoryClean) !==
        normalizeKeyword(productClean)
    ) {

        addCandidate(
            productClean +
            " " +
            categoryClean
        );

        addCandidate(
            categoryClean +
            " " +
            productClean
        );

    }


    // ======================================================
    // PRODUCT TOKEN PHRASES
    // ======================================================

    const tokens =
        productClean
            .split(/\s+/)
            .filter(
                token =>
                    token.length > 1
            );


    // For two-token products:
    //
    // Cotton Tshirt
    //
    // Safe:
    // Tshirt Cotton
    //
    // No fake attribute is added.

    if (
        tokens.length === 2
    ) {

        addCandidate(
            tokens[1] +
            " " +
            tokens[0]
        );

    }


    // ======================================================
    // MORE SAFE SEARCH INTENTS
    // ======================================================

    addCandidate(
        productClean + " for sale"
    );

    addCandidate(
        "shop " + productClean + " online"
    );

    addCandidate(
        "buy " + productClean + " online"
    );


    return output;

}


// ==========================================================
// FINAL KEYWORD BUILDER
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


    // ======================================================
    // STEP 1 — AI KEYWORDS
    // ======================================================

    let keywords =
        filterFrontendKeywords(
            aiKeywords,
            product,
            brand,
            safeMain
        );


    // ======================================================
    // STEP 2 — GUARANTEE MAIN KEYWORD
    // ======================================================

    const mainNormalized =
        normalizeKeyword(
            safeMain
        );


    if (
        safeMain &&
        !keywords.some(
            item =>
                normalizeKeyword(item) ===
                mainNormalized
        )
    ) {

        keywords.unshift(
            safeMain
        );

    }


    // ======================================================
    // STEP 3 — FALLBACK
    // ======================================================
    //
    // IMPORTANT:
    // AI चाहे 1 keyword दे,
    // fallback ALWAYS चलेगा अगर count < 12.
    //

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
            const candidate of
            fallbackKeywords
        ) {

            if (
                keywords.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            const duplicate =
                keywords.some(
                    existing =>
                        normalizeKeyword(existing) ===
                        normalizeKeyword(candidate)
                );


            if (
                duplicate
            ) {

                continue;

            }


            const nearDuplicate =
                keywords.some(
                    existing =>
                        similarity(
                            existing,
                            candidate
                        ) >= 0.88
                );


            if (
                nearDuplicate
            ) {

                continue;

            }


            keywords.push(
                candidate
            );

        }

    }


    // ======================================================
    // STEP 4 — SECOND FALLBACK
    // ======================================================
    //
    // अगर किसी कारण से अभी भी 12 नहीं हुए,
    // additional safe phrases generate करें.
    //

    if (
        keywords.length <
        MIN_KEYWORDS
    ) {

        const extraCandidates = [

            product + " listing",

            product + " search",

            product + " shopping online",

            product + " buy online",

            "online " + product,

            "shop " + product,

            "buy " + product,

            product + " store",

            product + " offer",

            product + " deals"

        ];


        for (
            const candidate of
            extraCandidates
        ) {

            if (
                keywords.length >=
                MIN_KEYWORDS
            ) {

                break;

            }


            const clean =
                cleanKeyword(candidate);


            if (!clean) {

                continue;

            }


            if (
                isGenericKeyword(clean)
            ) {

                continue;

            }


            if (
                isProductFragment(
                    clean,
                    product
                )
            ) {

                continue;

            }


            if (
                isBrandStuffed(
                    clean,
                    brand,
                    product
                )
            ) {

                continue;

            }


            const exists =
                keywords.some(
                    item =>
                        normalizeKeyword(item) ===
                        normalizeKeyword(clean)
                );


            if (exists) {

                continue;

            }


            keywords.push(
                clean
            );

        }

    }


    // ======================================================
    // STEP 5 — REMOVE DUPLICATES
    // ======================================================

    keywords =
        removeDuplicates(
            keywords
        );


    // ======================================================
    // STEP 6 — MAIN KEYWORD FIRST
    // ======================================================

    const finalMain =
        safeMain ||
        cleanInput(product);


    const finalMainNormalized =
        normalizeKeyword(
            finalMain
        );


    const mainIndex =
        keywords.findIndex(
            item =>
                normalizeKeyword(item) ===
                finalMainNormalized
        );


    if (
        mainIndex >= 0
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
    else {

        keywords.unshift(
            finalMain
        );

    }


    // ======================================================
    // STEP 7 — FINAL LIMIT
    // ======================================================

    keywords =
        keywords.slice(
            0,
            MAX_KEYWORDS
        );


    return keywords;

}


// ==========================================================
// EXTRACT KEYWORDS FROM BACKEND RESPONSE
// ==========================================================

function extractKeywordsFromResponse(
    data
) {

    if (
        data === null ||
        data === undefined
    ) {

        return [];

    }


    // ======================================================
    // DIRECT ARRAY
    // ======================================================

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    // ======================================================
    // DIRECT STRING
    // ======================================================

    if (
        typeof data ===
        "string"
    ) {

        return parseKeywordString(
            data
        );

    }


    // ======================================================
    // COMMON BACKEND FIELDS
    // ======================================================

    const fields = [

        "keywords",

        "seoKeywords",

        "seo_keywords",

        "keywordList",

        "keyword_list",

        "results",

        "items",

        "output",

        "text"

    ];


    for (
        const field of fields
    ) {

        if (
            data[field] !==
            undefined
        ) {

            const value =
                data[field];


            if (
                Array.isArray(value)
            ) {

                return value;

            }


            if (
                typeof value ===
                "string"
            ) {

                const parsed =
                    parseKeywordString(
                        value
                    );


                if (
                    parsed.length
                ) {

                    return parsed;

                }

            }

        }

    }


    // ======================================================
    // NESTED RESULT
    // ======================================================

    if (
        data.result !== undefined &&
        data.result !== null
    ) {

        const nested =
            extractKeywordsFromResponse(
                data.result
            );


        if (
            nested.length
        ) {

            return nested;

        }

    }


    // ======================================================
    // NESTED DATA
    // ======================================================

    if (
        data.data !== undefined &&
        data.data !== null
    ) {

        const nested =
            extractKeywordsFromResponse(
                data.data
            );


        if (
            nested.length
        ) {

            return nested;

        }

    }


    return [];

}


// ==========================================================
// PARSE KEYWORD STRING
// ==========================================================

function parseKeywordString(
    text
) {

    if (!text) {

        return [];

    }


    let cleanText =
        String(text)
            .trim();


    // ======================================================
    // JSON ARRAY STRING
    // ======================================================

    if (
        cleanText.startsWith("[") &&
        cleanText.endsWith("]")
    ) {

        try {

            const parsed =
                JSON.parse(
                    cleanText
                );


            if (
                Array.isArray(parsed)
            ) {

                return parsed;

            }

        }
        catch (error) {

            console.warn(
                "SEO JSON array parse failed:",
                error
            );

        }

    }


    // ======================================================
    // SPLIT LINES
    // ======================================================

    return cleanText

        .split(/\r?\n/)

        .map(
            line =>
                cleanKeyword(line)
        )

        .map(
            line =>
                line.replace(
                    /^\d+\s*[\.\)\-:]\s*/,
                    ""
                )
        )

        .map(
            line =>
                line.replace(
                    /^[-•*]\s*/,
                    ""
                )
        )

        .map(
            line =>
                line.trim()
        )

        .filter(Boolean);

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


    // ======================================================
    // ELEMENT VALIDATION
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
            "❌ SEO Generator: HTML element missing."
        );


        if (status) {

            status.innerText =
                "❌ SEO form में required element missing है।";

        }


        return;

    }


    // ======================================================
    // INPUTS
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

        return;

    }


    if (!category) {

        showStatus(
            "❌ Please select Product Category."
        );

        categoryElement.focus();

        return;

    }


    // ======================================================
    // MAIN KEYWORD
    // ======================================================

    const finalMainKeyword =
        sanitizeMainKeyword(
            mainKeywordInput ||
            product,
            product,
            brand
        );


    // ======================================================
    // START UI
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
            marketplace,

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
        "SEO REQUEST — VERSION 14.2 FIXED"
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
            "SEO API STATUS:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "SEO API RAW RESPONSE:",
            responseText
        );


        // ==================================================
        // PARSE
        // ==================================================

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
        // BACKEND FAILURE
        // ==================================================

        if (
            data &&
            data.success === false
        ) {

            throw new Error(
                data.error ||
                "SEO keywords generate नहीं हुए।"
            );

        }


        // ==================================================
        // EXTRACT AI KEYWORDS
        // ==================================================

        const aiKeywords =
            extractKeywordsFromResponse(
                data
            );


        console.log(
            "AI KEYWORDS:",
            aiKeywords
        );


        // ==================================================
        // FINALIZE
        // ==================================================

        const keywords =
            finalizeKeywords(
                aiKeywords,
                product,
                category,
                brand,
                finalMainKeyword,
                marketplace
            );


        console.log(
            "FINAL KEYWORDS:",
            keywords
        );


        // ==================================================
        // EMPTY PROTECTION
        // ==================================================

        if (!keywords.length) {

            throw new Error(
                "SEO keywords generate नहीं हो सके।"
            );

        }


        // ==================================================
        // DISPLAY
        // ==================================================

        result.value =
            keywords
                .map(
                    (
                        keyword,
                        index
                    ) => {

                        return (
                            (index + 1) +
                            ". " +
                            keyword
                        );

                    }
                )
                .join("\n");


        // ==================================================
        // SUCCESS
        // ==================================================

        showStatus(

            "✅ " +
            keywords.length +
            " SEO keywords generated successfully."

        );


        console.log(
            "✅ SEO GENERATOR 14.2 FIXED SUCCESS"
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
    // FALLBACK COPY
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
// UNHANDLED PROMISE
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
    "🚀 AI Seller Toolkit SEO Generator 14.2 FIXED Ready"
);
