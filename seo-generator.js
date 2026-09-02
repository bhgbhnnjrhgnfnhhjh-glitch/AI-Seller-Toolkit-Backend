// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 16.0 FIXED
// ==========================================================
//
// PURPOSE
// ----------------------------------------------------------
// Reliable SEO Keyword Generator
//
// IMPORTANT FIX:
// Backend कभी-कभी केवल 1 keyword लौटाता है:
//
//      Cotton kurti
//
// Version 16.0 में frontend fallback हमेशा काम करेगा।
//
// FEATURES
// ----------------------------------------------------------
// ✅ Main Keyword always first
// ✅ Target up to 20 keywords
// ✅ Backend AI keywords supported
// ✅ Strong frontend fallback
// ✅ Works even when backend returns only 1 keyword
// ✅ Works even when backend response structure changes
// ✅ Duplicate protection
// ✅ Near duplicate protection
// ✅ Product fragment protection
// ✅ Brand stuffing protection
// ✅ Generic keyword protection
// ✅ No invented product specifications
// ✅ No invented color
// ✅ No invented size
// ✅ No invented fabric
// ✅ No invented features
// ✅ No fake availability claims
// ✅ No fake discounts
// ✅ No fake quality claims
// ✅ Marketplace-aware
// ✅ Category-aware
// ✅ Maximum 20 keywords
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

const MIN_KEYWORDS = 20;


// ==========================================================
// PAGE INITIALIZATION
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
            "✅ AI Seller Toolkit SEO Generator 16.0 loaded"
        );

    }
);


// ==========================================================
// CLEAN TEXT
// ==========================================================

function cleanInput(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

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
            /^\s*[-•*]\s*/,
            ""
        )

        .replace(
            /^["'`]+|["'`]+$/g,
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
        normalizeKeyword(
            text
        );


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
// TOKEN SIMILARITY
// ==========================================================

function similarity(a, b) {

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
// PRODUCT FRAGMENT PROTECTION
// ==========================================================
//
// Example:
//
// Product:
// Cotton kurti
//
// Reject:
// kurti
// cotton
//
// Allow:
// cotton kurti online
// cotton kurti design
//
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


    // Single token from multi-token product
    // is considered a fragment.

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
//
// Example:
//
// Product:
// Cotton kurti
//
// Brand:
// Test Brand Cotton kurti
//
// Effective Brand:
// Test Brand
//
// ==========================================================

function getEffectiveBrand(
    brand,
    product
) {

    const B =
        normalizeKeyword(
            brand
        );

    const P =
        normalizeKeyword(
            product
        );


    if (!B) {

        return "";

    }


    if (
        P &&
        B.includes(P)
    ) {

        return B

            .replace(
                P,
                " "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    }


    return B;

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


    let matched = 0;


    B.forEach(
        token => {

            if (
                K.has(token)
            ) {

                matched++;

            }

        }
    );


    return (
        matched === B.size
    );

}


// ==========================================================
// GENERIC KEYWORD FILTER
// ==========================================================

function isGenericKeyword(keyword) {

    const normalized =
        normalizeKeyword(
            keyword
        );


    if (!normalized) {

        return true;

    }


    const genericKeywords = [

        "product",

        "products",

        "item",

        "items",

        "best",

        "new",

        "latest",

        "trending",

        "quality",

        "good quality",

        "premium",

        "cheap",

        "cheap price",

        "sale",

        "shopping",

        "online",

        "online shopping",

        "buy online",

        "shop online"

    ];


    return genericKeywords.includes(
        normalized
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


    // Exact product name

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


    // Do not allow brand + product as main keyword

    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }


    // Do not allow product fragment

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
// UNIQUE KEYWORDS
// ==========================================================

function removeDuplicates(
    keywords
) {

    const output = [];

    const seen =
        new Set();


    for (
        const item of keywords
    ) {

        const clean =
            cleanKeyword(
                item
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
// SAFE CANDIDATE CHECK
// ==========================================================

function isSafeCandidate(
    candidate,
    product,
    brand,
    currentKeywords
) {

    const clean =
        cleanKeyword(
            candidate
        );


    if (!clean) {

        return false;

    }


    const normalized =
        normalizeKeyword(
            clean
        );


    if (!normalized) {

        return false;

    }


    // Generic

    if (
        isGenericKeyword(
            clean
        )
    ) {

        return false;

    }


    // Product fragment

    if (
        isProductFragment(
            clean,
            product
        )
    ) {

        return false;

    }


    // Brand stuffing

    if (
        isBrandStuffed(
            clean,
            brand,
            product
        )
    ) {

        return false;

    }


    // Exact duplicate

    if (
        currentKeywords.some(
            item =>
                normalizeKeyword(
                    item
                ) === normalized
        )
    ) {

        return false;

    }


    // Near duplicate
    //
    // Keep threshold at 0.80 so that
    // very similar phrases are removed.

    if (
        currentKeywords.some(
            item =>
                similarity(
                    item,
                    clean
                ) >= 0.80
        )
    ) {

        return false;

    }


    return true;

}


// ==========================================================
// ADD SAFE KEYWORD
// ==========================================================

function addSafeKeyword(
    list,
    candidate,
    product,
    brand
) {

    const clean =
        cleanKeyword(
            candidate
        );


    if (!clean) {

        return false;

    }


    if (
        !isSafeCandidate(
            clean,
            product,
            brand,
            list
        )
    ) {

        return false;

    }


    list.push(
        clean
    );


    return true;

}


// ==========================================================
// FRONTEND FALLBACK KEYWORDS
// ==========================================================
//
// IMPORTANT:
//
// यह AI facts invent नहीं करता।
//
// यह केवल product name के साथ
// सामान्य search-intent phrases जोड़ता है।
//
// Example:
//
// Cotton kurti
//
// Cotton kurti online
// Cotton kurti shopping
// Cotton kurti collection
//
// कोई नया color / size / fabric / feature
// invent नहीं किया जाता।
//
// ==========================================================

function buildFrontendFallback(
    product,
    category,
    marketplace,
    brand,
    existingKeywords
) {

    const output = [];

    const productClean =
        cleanInput(
            product
        );


    if (!productClean) {

        return output;

    }


    // ======================================================
    // HELPER
    // ======================================================

    function add(
        keyword
    ) {

        if (
            output.length +
            existingKeywords.length
            >= MAX_KEYWORDS
        ) {

            return;

        }


        addSafeKeyword(
            output,
            keyword,
            productClean,
            brand
        );

    }


    // ======================================================
    // CORE SEARCH INTENT
    // ======================================================

    add(
        productClean +
        " online"
    );

    add(
        productClean +
        " buy"
    );

    add(
        productClean +
        " shop"
    );

    add(
        productClean +
        " shopping"
    );

    add(
        productClean +
        " collection"
    );

    add(
        productClean +
        " design"
    );

    add(
        productClean +
        " style"
    );

    add(
        productClean +
        " fashion"
    );

    add(
        productClean +
        " clothing"
    );

    add(
        productClean +
        " apparel"
    );

    add(
        productClean +
        " wear"
    );

    add(
        productClean +
        " store"
    );

    add(
        productClean +
        " catalog"
    );

    add(
        productClean +
        " product"
    );

    add(
        productClean +
        " listing"
    );

    add(
        productClean +
        " marketplace"
    );

    add(
        productClean +
        " price"
    );

    add(
        productClean +
        " online shopping"
    );


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

        add(
            productClean +
            " " +
            categoryClean
        );

    }


    // ======================================================
    // MARKETPLACE
    // ======================================================
    //
    // "on Amazon" is based directly on
    // user's selected marketplace.
    //
    // We do NOT say "available on Amazon".
    //
    // ======================================================

    const marketplaceClean =
        cleanInput(
            marketplace
        );


    if (marketplaceClean) {

        add(
            productClean +
            " on " +
            marketplaceClean
        );

    }


    return output;

}


// ==========================================================
// EMERGENCY FALLBACK
// ==========================================================
//
// अगर similarity filter के कारण 20 पूरे नहीं होते,
// तो यह second-level fallback चलता है।
//
// ==========================================================

function buildEmergencyFallback(
    product,
    marketplace,
    existingKeywords
) {

    const output = [];

    const productClean =
        cleanInput(
            product
        );


    if (!productClean) {

        return output;

    }


    const emergencyPhrases = [

        "for shopping",

        "for buyers",

        "for customers",

        "shopping product",

        "online product",

        "product search",

        "product shopping",

        "online catalog",

        "product catalog",

        "shopping catalog",

        "online listing",

        "product listing",

        "marketplace listing",

        "shopping listing",

        "online marketplace"

    ];


    for (
        const phrase of
        emergencyPhrases
    ) {

        if (
            output.length +
            existingKeywords.length
            >= MAX_KEYWORDS
        ) {

            break;

        }


        const candidate =
            productClean +
            " " +
            phrase;


        if (
            isSafeCandidate(
                candidate,
                productClean,
                "",
                [
                    ...existingKeywords,
                    ...output
                ]
            )
        ) {

            output.push(
                candidate
            );

        }

    }


    // Marketplace emergency keyword

    const marketplaceClean =
        cleanInput(
            marketplace
        );


    if (
        marketplaceClean &&
        output.length +
        existingKeywords.length <
        MAX_KEYWORDS
    ) {

        const candidate =
            marketplaceClean +
            " " +
            productClean;


        if (
            isSafeCandidate(
                candidate,
                productClean,
                "",
                [
                    ...existingKeywords,
                    ...output
                ]
            )
        ) {

            output.push(
                candidate
            );

        }

    }


    return output;

}


// ==========================================================
// FILTER AI KEYWORDS
// ==========================================================

function filterAIKeywords(
    aiKeywords,
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
            Array.isArray(aiKeywords)
                ? aiKeywords
                : []
        );


    for (
        const keyword of cleaned
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


        // Main keyword is always allowed

        const isMain =
            normalized ===
            mainNormalized;


        if (
            !isMain &&
            isGenericKeyword(
                clean
            )
        ) {

            continue;

        }


        if (
            !isMain &&
            isProductFragment(
                clean,
                product
            )
        ) {

            continue;

        }


        if (
            !isMain &&
            isBrandStuffed(
                clean,
                brand,
                product
            )
        ) {

            continue;

        }


        if (
            !isMain &&
            output.some(
                existing =>
                    similarity(
                        existing,
                        clean
                    ) >= 0.80
            )
        ) {

            continue;

        }


        if (
            output.some(
                existing =>
                    normalizeKeyword(
                        existing
                    ) === normalized
            )
        ) {

            continue;

        }


        output.push(
            clean
        );


        if (
            output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }

    }


    // ======================================================
    // MAIN FIRST
    // ======================================================

    if (safeMain) {

        const index =
            output.findIndex(
                item =>
                    normalizeKeyword(
                        item
                    ) ===
                    mainNormalized
            );


        if (index >= 0) {

            const mainItem =
                output.splice(
                    index,
                    1
                )[0];


            output.unshift(
                mainItem
            );

        }
        else {

            output.unshift(
                safeMain
            );

        }

    }


    return output.slice(
        0,
        MAX_KEYWORDS
    );

}


// ==========================================================
// FINALIZE KEYWORDS
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
    // STEP 1
    // AI RESULTS
    // ======================================================

    let finalKeywords =
        filterAIKeywords(
            aiKeywords,
            product,
            brand,
            safeMain
        );


    console.log(
        "STEP 1 AI KEYWORDS:",
        finalKeywords
    );


    // ======================================================
    // STEP 2
    // GUARANTEE MAIN KEYWORD
    // ======================================================

    if (
        safeMain &&
        !finalKeywords.some(
            item =>
                normalizeKeyword(
                    item
                ) ===
                normalizeKeyword(
                    safeMain
                )
        )
    ) {

        finalKeywords.unshift(
            safeMain
        );

    }


    // ======================================================
    // STEP 3
    // FRONTEND FALLBACK
    // ======================================================

    if (
        finalKeywords.length <
        MAX_KEYWORDS
    ) {

        const fallback =
            buildFrontendFallback(
                product,
                category,
                marketplace,
                brand,
                finalKeywords
            );


        for (
            const keyword of fallback
        ) {

            if (
                finalKeywords.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            if (
                isSafeCandidate(
                    keyword,
                    product,
                    brand,
                    finalKeywords
                )
            ) {

                finalKeywords.push(
                    keyword
                );

            }

        }

    }


    console.log(
        "STEP 3 AFTER FRONTEND FALLBACK:",
        finalKeywords
    );


    // ======================================================
    // STEP 4
    // EMERGENCY FALLBACK
    // ======================================================

    if (
        finalKeywords.length <
        MAX_KEYWORDS
    ) {

        const emergency =
            buildEmergencyFallback(
                product,
                marketplace,
                finalKeywords
            );


        for (
            const keyword of emergency
        ) {

            if (
                finalKeywords.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            if (
                !finalKeywords.some(
                    existing =>
                        normalizeKeyword(
                            existing
                        ) ===
                        normalizeKeyword(
                            keyword
                        )
                )
            ) {

                finalKeywords.push(
                    keyword
                );

            }

        }

    }


    // ======================================================
    // STEP 5
    // REMOVE EXACT DUPLICATES
    // ======================================================

    finalKeywords =
        removeDuplicates(
            finalKeywords
        );


    // ======================================================
    // STEP 6
    // MAIN KEYWORD FIRST AGAIN
    // ======================================================

    if (safeMain) {

        const mainNormalized =
            normalizeKeyword(
                safeMain
            );


        const mainIndex =
            finalKeywords.findIndex(
                item =>
                    normalizeKeyword(
                        item
                    ) ===
                    mainNormalized
            );


        if (mainIndex >= 0) {

            const mainItem =
                finalKeywords.splice(
                    mainIndex,
                    1
                )[0];


            finalKeywords.unshift(
                mainItem
            );

        }
        else {

            finalKeywords.unshift(
                safeMain
            );

        }

    }


    // ======================================================
    // STEP 7
    // HARD MAXIMUM
    // ======================================================

    finalKeywords =
        finalKeywords.slice(
            0,
            MAX_KEYWORDS
        );


    console.log(
        "FINAL KEYWORDS:",
        finalKeywords
    );


    return finalKeywords;

}


// ==========================================================
// RESPONSE EXTRACTION
// ==========================================================
//
// Backend अलग-अलग formats में response दे सकता है:
//
// {
//   keywords: []
// }
//
// {
//   seoKeywords: []
// }
//
// {
//   result: {
//      keywords: []
//   }
// }
//
// {
//   data: {
//      keywords: []
//   }
// }
//
// या string.
//
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


    // Direct array

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    // Direct string

    if (
        typeof data ===
        "string"
    ) {

        return parseKeywordString(
            data
        );

    }


    if (
        typeof data !==
        "object"
    ) {

        return [];

    }


    // ======================================================
    // COMMON FIELDS
    // ======================================================

    const fields = [

        "keywords",

        "seoKeywords",

        "seo_keywords",

        "keywordList",

        "keyword_list",

        "results",

        "items",

        "list"

    ];


    for (
        const field of fields
    ) {

        if (
            Array.isArray(
                data[field]
            )
        ) {

            return data[field];

        }


        if (
            typeof data[field] ===
            "string"
        ) {

            return parseKeywordString(
                data[field]
            );

        }

    }


    // ======================================================
    // NESTED OBJECTS
    // ======================================================

    const nestedFields = [

        "result",

        "data",

        "output",

        "response"

    ];


    for (
        const field of nestedFields
    ) {

        if (
            data[field]
        ) {

            const nested =
                extractKeywordsFromResponse(
                    data[field]
                );


            if (
                nested.length
            ) {

                return nested;

            }

        }

    }


    // ======================================================
    // GEMINI TEXT FIELD
    // ======================================================

    if (
        typeof data.text ===
        "string"
    ) {

        return parseKeywordString(
            data.text
        );

    }


    if (
        typeof data.output_text ===
        "string"
    ) {

        return parseKeywordString(
            data.output_text
        );

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
    // TRY JSON
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
                Array.isArray(
                    parsed
                )
            ) {

                return parsed;

            }

        }
        catch (error) {

            console.warn(
                "JSON array parse failed."
            );

        }

    }


    // ======================================================
    // REMOVE MARKDOWN CODE BLOCK
    // ======================================================

    cleanText =
        cleanText

            .replace(
                /^```json/i,
                ""
            )

            .replace(
                /^```/i,
                ""
            )

            .replace(
                /```$/i,
                ""
            )

            .trim();


    // ======================================================
    // LINE PARSE
    // ======================================================

    return cleanText

        .split(/\r?\n/)

        .map(
            line =>
                cleanKeyword(
                    line
                )
        )

        .filter(
            Boolean
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
            "❌ Required SEO HTML element missing."
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
    // UI START
    // ======================================================

    generateBtn.disabled =
        true;


    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";


    result.value =
        "⏳ Please wait...";


    showStatus(
        "🤖 SEO keywords generate हो रहे हैं..."
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
        "========================================"
    );

    console.log(
        "SEO GENERATOR 16.0 REQUEST"
    );

    console.log(
        requestData
    );

    console.log(
        "========================================"
    );


    let aiKeywords = [];


    // ======================================================
    // API CALL
    // ======================================================

    try {

        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                function () {

                    controller.abort();

                },
                30000
            );


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
                        ),

                    signal:
                        controller.signal

                }
            );


        clearTimeout(
            timeout
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
        // PARSE RESPONSE
        // ==================================================

        let data = null;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (parseError) {

            console.warn(
                "Backend response JSON नहीं है."
            );


            // Backend text response
            // को भी keywords की तरह parse करेंगे.

            aiKeywords =
                parseKeywordString(
                    responseText
                );

        }


        // ==================================================
        // HTTP ERROR
        // ==================================================

        if (!response.ok) {

            console.warn(
                "Backend HTTP error:",
                response.status
            );

            // IMPORTANT:
            // Backend error होने पर भी frontend
            // fallback से keywords बनाएगा.

            aiKeywords = [];

        }
        else if (data !== null) {

            // =================================================
            // EXTRACT AI KEYWORDS
            // =================================================

            aiKeywords =
                extractKeywordsFromResponse(
                    data
                );

        }


    }
    catch (error) {

        console.warn(
            "⚠️ Backend unavailable. Frontend fallback चलेगा.",
            error
        );


        aiKeywords = [];

    }


    // ======================================================
    // FINALIZE
    // ======================================================

    const finalKeywords =
        finalizeKeywords(

            aiKeywords,

            product,

            category,

            brand,

            finalMainKeyword,

            marketplace

        );


    // ======================================================
    // EMPTY SAFETY
    // ======================================================

    if (
        !finalKeywords.length
    ) {

        result.value =
            "❌ SEO keywords generate नहीं हो सके।";

        showStatus(
            "❌ SEO generation failed."
        );


        generateBtn.disabled =
            false;


        generateBtn.innerText =
            "🤖 Generate SEO Keywords";


        return;

    }


    // ======================================================
    // DISPLAY
    // ======================================================

    result.value =
        finalKeywords
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


    // ======================================================
    // SUCCESS
    // ======================================================

    showStatus(

        "✅ " +
        finalKeywords.length +
        " SEO keywords generated successfully."

    );


    console.log(
        "========================================"
    );

    console.log(
        "FINAL SEO KEYWORDS 16.0"
    );

    console.log(
        finalKeywords
    );

    console.log(
        "========================================"
    );


    // ======================================================
    // BUTTON RESET
    // ======================================================

    generateBtn.disabled =
        false;


    generateBtn.innerText =
        "🤖 Generate SEO Keywords";

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
// FINAL READY
// ==========================================================

console.log(
    "🚀 AI Seller Toolkit SEO Generator 16.0 FIXED Ready"
);
