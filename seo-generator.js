// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 15.0
// ==========================================================
//
// PURPOSE
// ----------------------------------------------------------
// Reliable SEO keyword generation for AI Seller Toolkit.
//
// Backend:
// AI Seller Toolkit Backend v14.x / v15.x
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
// VERSION 15.0 — FINAL FIX
// ==========================================================
//
// ✅ Main Keyword always first
// ✅ Maximum 20 keywords
// ✅ Requests exactly up to 20 from backend
// ✅ Accepts multiple backend response formats
// ✅ Strong duplicate protection
// ✅ Strong near-duplicate protection
// ✅ Product-fragment protection
// ✅ Brand-stuffing protection
// ✅ Generic keyword protection
// ✅ Safe local expansion
// ✅ No invented product facts
// ✅ No random colors
// ✅ No random sizes
// ✅ No random gender
// ✅ No random pattern
// ✅ No random material
// ✅ No unsupported features
// ✅ No fake claims
// ✅ No repeated "online/shopping" spam
// ✅ Better keyword diversity
// ✅ Stable frontend/backend handling
// ✅ Copy button protected
// ==========================================================


// ==========================================================
// API CONFIG
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const SEO_API =
    API_URL + "/api/generate-seo";


// ==========================================================
// SETTINGS
// ==========================================================

const MAX_KEYWORDS = 20;

// Backend को कम से कम इतने keywords generate करने के लिए कहा जाएगा.
const REQUESTED_KEYWORDS = 20;

// Frontend local fallback तभी इस्तेमाल होगा जब backend
// पर्याप्त usable keywords न दे.
const MIN_USABLE_KEYWORDS = 10;


// ==========================================================
// SAFE SEO MODIFIERS
// ==========================================================
//
// ये modifiers product के बारे में कोई नया factual claim
// नहीं बनाते.
//
// IMPORTANT:
// "men", "women", "kids", "printed", "floral", "silk",
// "leather", "premium", "waterproof", "wireless" आदि
// जानबूझकर नहीं रखे गए क्योंकि ये product details के बिना
// invented facts बन सकते हैं.
// ==========================================================

const SAFE_MODIFIERS = [

    "online",

    "buy",

    "shop",

    "shopping",

    "collection",

    "design",

    "style",

    "styles",

    "fashion",

    "clothing",

    "apparel",

    "wear",

    "store",

    "price",

    "available",

    "catalog",

    "product",

    "marketplace",

    "listing",

    "shopping online"

];


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
            "✅ AI Seller Toolkit SEO Generator 15.0 loaded"
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
// JACCARD SIMILARITY
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


    // Exact product is always allowed.
    if (
        keywordNormalized ===
        productNormalized
    ) {

        return false;

    }


    // One-word subset of a multi-word product
    // is usually an incomplete product keyword.
    //
    // Example:
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


    let brandTokenCount = 0;


    B.forEach(
        token => {

            if (
                K.has(token)
            ) {

                brandTokenCount++;

            }

        }
    );


    // If the complete effective brand is present
    // in a keyword, reject it unless it is the
    // explicitly supplied main keyword.

    return (
        brandTokenCount ===
        B.size
    );

}


// ==========================================================
// GENERIC KEYWORD CHECK
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

        "online",

        "shopping",

        "sale",

        "best",

        "new",

        "latest",

        "trending",

        "quality",

        "good quality",

        "cheap",

        "cheap price",

        "online shopping",

        "buy online",

        "shop online"

    ];


    return genericWords.includes(
        normalized
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

        .replace(
            /^\s*\d+\s*[\.\)\-:]\s*/,
            ""
        )

        .replace(
            /^\s*[-•*]\s*/,
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
// REMOVE EXACT DUPLICATES
// ==========================================================

function removeDuplicates(
    keywords
) {

    const output = [];

    const seen =
        new Set();


    for (
        const item of
        Array.isArray(keywords)
            ? keywords
            : []
    ) {

        const keyword =
            cleanKeyword(
                item
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


    const supplied =
        cleanInput(
            mainKeyword
        );


    // If user did not enter Main Keyword,
    // product name becomes main keyword.

    if (!supplied) {

        return productClean;

    }


    const suppliedNormalized =
        normalizeKeyword(
            supplied
        );


    const productNormalized =
        normalizeKeyword(
            productClean
        );


    // Exact product name = safe.

    if (
        suppliedNormalized ===
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


    // Do not allow main keyword to become
    // a brand + product stuffing phrase.

    if (
        brandNormalized &&
        suppliedNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }


    // Do not allow one-word product fragment.

    if (
        isProductFragment(
            supplied,
            productClean
        )
    ) {

        return productClean;

    }


    return supplied;

}


// ==========================================================
// CHECK WHETHER KEYWORD IS SAFE
// ==========================================================

function isSafeKeyword(
    keyword,
    product,
    brand,
    mainKeyword
) {

    const clean =
        cleanKeyword(
            keyword
        );


    if (!clean) {

        return false;

    }


    const normalized =
        normalizeKeyword(
            clean
        );


    const normalizedMain =
        normalizeKeyword(
            mainKeyword
        );


    // Main keyword gets special protection.

    if (
        normalized ===
        normalizedMain
    ) {

        return true;

    }


    // Generic keyword.

    if (
        isGenericKeyword(
            clean
        )
    ) {

        return false;

    }


    // Product fragment.

    if (
        isProductFragment(
            clean,
            product
        )
    ) {

        return false;

    }


    // Brand stuffing.

    if (
        isBrandStuffed(
            clean,
            brand,
            product
        )
    ) {

        return false;

    }


    return true;

}


// ==========================================================
// ADD UNIQUE KEYWORD
// ==========================================================

function addUniqueKeyword(
    output,
    candidate,
    product,
    brand,
    mainKeyword,
    similarityThreshold
) {

    const clean =
        cleanKeyword(
            candidate
        );


    if (!clean) {

        return false;

    }


    if (
        !isSafeKeyword(
            clean,
            product,
            brand,
            mainKeyword
        )
    ) {

        return false;

    }


    const normalized =
        normalizeKeyword(
            clean
        );


    // Exact duplicate.

    if (
        output.some(
            item =>
                normalizeKeyword(
                    item
                ) === normalized
        )
    ) {

        return false;

    }


    // Near duplicate.

    if (
        output.some(
            item =>
                similarity(
                    item,
                    clean
                ) >=
                similarityThreshold
        )
    ) {

        return false;

    }


    output.push(
        clean
    );


    return true;

}


// ==========================================================
// EXTRACT PRODUCT FACTS
// ==========================================================
//
// This function only extracts words already present
// in the seller's product name.
//
// Example:
//
// "Cotton Tshirt"
//
// Facts:
// cotton
// tshirt
//
// No new fact is invented.
// ==========================================================

function extractProductTokens(
    product
) {

    return cleanInput(
        product
    )
        .split(" ")
        .filter(
            token =>
                token.length > 1
        );

}


// ==========================================================
// CATEGORY SAFE WORDS
// ==========================================================

function getCategoryWords(
    category
) {

    const normalized =
        normalizeKeyword(
            category
        );


    const map = {

        fashion: [
            "clothing",
            "apparel",
            "wear",
            "fashion"
        ],

        beauty: [
            "beauty",
            "personal care"
        ],

        electronics: [
            "electronics",
            "device",
            "gadgets"
        ],

        "home kitchen": [
            "home",
            "kitchen",
            "household"
        ],

        shoes: [
            "footwear",
            "shoes"
        ],

        jewellery: [
            "jewellery",
            "accessories"
        ],

        toys: [
            "toys",
            "kids products"
        ],

        books: [
            "books",
            "reading"
        ],

        pet: [
            "pet products",
            "pet supplies"
        ],

        sports: [
            "sports",
            "fitness"
        ],

        automotive: [
            "automotive",
            "car accessories"
        ],

        garden: [
            "garden",
            "gardening"
        ],

        food: [
            "food",
            "grocery"
        ],

        gifts: [
            "gifts",
            "gift items"
        ]

    };


    return (
        map[normalized] ||
        []
    );

}


// ==========================================================
// BUILD SAFE FALLBACK KEYWORDS
// ==========================================================
//
// IMPORTANT:
//
// This fallback is NOT supposed to invent product facts.
//
// It creates controlled search phrases from:
//
// Product Name
// Category
// Marketplace
// Safe commerce modifiers
//
// ==========================================================

function buildSafeFallbackKeywords(
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


    const existing =
        Array.isArray(
            existingKeywords
        )
            ? existingKeywords
            : [];


    // ======================================================
    // 1. Product + safe modifiers
    // ======================================================

    for (
        const modifier of
        SAFE_MODIFIERS
    ) {

        if (
            output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


        addUniqueKeyword(

            [
                ...existing,
                ...output
            ],

            productClean +
            " " +
            modifier,

            productClean,

            brand,

            productClean,

            0.92

        );

        // addUniqueKeyword above receives a temporary
        // combined array. If accepted, manually push.

        const candidate =
            productClean +
            " " +
            modifier;


        if (
            isSafeKeyword(
                candidate,
                productClean,
                brand,
                productClean
            ) &&
            !existing.some(
                item =>
                    normalizeKeyword(
                        item
                    ) ===
                    normalizeKeyword(
                        candidate
                    )
            ) &&
            !output.some(
                item =>
                    normalizeKeyword(
                        item
                    ) ===
                    normalizeKeyword(
                        candidate
                    )
            ) &&
            !output.some(
                item =>
                    similarity(
                        item,
                        candidate
                    ) >= 0.92
            )
        ) {

            output.push(
                candidate
            );

        }

    }


    // ======================================================
    // 2. Category-safe combinations
    // ======================================================

    const categoryWords =
        getCategoryWords(
            category
        );


    for (
        const categoryWord of
        categoryWords
    ) {

        if (
            output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


        const candidate =
            productClean +
            " " +
            categoryWord;


        if (
            isSafeKeyword(
                candidate,
                productClean,
                brand,
                productClean
            ) &&
            !existing.some(
                item =>
                    normalizeKeyword(
                        item
                    ) ===
                    normalizeKeyword(
                        candidate
                    )
            ) &&
            !output.some(
                item =>
                    similarity(
                        item,
                        candidate
                    ) >= 0.92
            )
        ) {

            output.push(
                candidate
            );

        }

    }


    // ======================================================
    // 3. Marketplace combinations
    // ======================================================

    const market =
        cleanInput(
            marketplace
        );


    if (market) {

        const marketplaceCandidates = [

            productClean +
            " on " +
            market,

            market +
            " " +
            productClean,

            productClean +
            " " +
            market +
            " listing"

        ];


        for (
            const candidate of
            marketplaceCandidates
        ) {

            if (
                output.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            if (
                isSafeKeyword(
                    candidate,
                    productClean,
                    brand,
                    productClean
                ) &&
                !existing.some(
                    item =>
                        normalizeKeyword(
                            item
                        ) ===
                        normalizeKeyword(
                            candidate
                        )
                ) &&
                !output.some(
                    item =>
                        similarity(
                            item,
                            candidate
                        ) >= 0.90
                )
            ) {

                output.push(
                    candidate
                );

            }

        }

    }


    // ======================================================
    // 4. Product token combinations
    // ======================================================

    const tokens =
        extractProductTokens(
            productClean
        );


    if (
        tokens.length >= 2 &&
        tokens.length <= 3
    ) {

        // Reverse order only for 2-token products.

        if (
            tokens.length === 2
        ) {

            const reverse =
                tokens[1] +
                " " +
                tokens[0];


            if (
                normalizeKeyword(
                    reverse
                ) !==
                normalizeKeyword(
                    productClean
                )
            ) {

                if (
                    !existing.some(
                        item =>
                            normalizeKeyword(
                                item
                            ) ===
                            normalizeKeyword(
                                reverse
                            )
                    ) &&
                    !output.some(
                        item =>
                            normalizeKeyword(
                                item
                            ) ===
                            normalizeKeyword(
                                reverse
                            )
                    )
                ) {

                    output.push(
                        reverse
                    );

                }

            }

        }

    }


    return output.slice(
        0,
        MAX_KEYWORDS
    );

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


    const cleaned =
        removeDuplicates(
            Array.isArray(
                aiKeywords
            )
                ? aiKeywords
                : []
        );


    for (
        const keyword of
        cleaned
    ) {

        if (
            output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


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


        const normalizedMain =
            normalizeKeyword(
                mainKeyword
            );


        // Main keyword is always accepted.

        if (
            normalized ===
            normalizedMain
        ) {

            if (
                !output.some(
                    item =>
                        normalizeKeyword(
                            item
                        ) ===
                        normalized
                )
            ) {

                output.push(
                    mainKeyword
                );

            }

            continue;

        }


        // Generic.

        if (
            isGenericKeyword(
                clean
            )
        ) {

            continue;

        }


        // Product fragment.

        if (
            isProductFragment(
                clean,
                product
            )
        ) {

            continue;

        }


        // Brand stuffing.

        if (
            isBrandStuffed(
                clean,
                brand,
                product
            )
        ) {

            continue;

        }


        // Near duplicate.

        if (
            output.some(
                existing =>
                    similarity(
                        existing,
                        clean
                    ) >= 0.82
            )
        ) {

            continue;

        }


        output.push(
            clean
        );

    }


    return output;

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


    const finalOutput = [];


    // ======================================================
    // STEP 1 — MAIN KEYWORD
    // ======================================================

    if (safeMain) {

        finalOutput.push(
            safeMain
        );

    }


    // ======================================================
    // STEP 2 — AI KEYWORDS
    // ======================================================

    const filteredAI =
        filterAIKeywords(
            aiKeywords,
            product,
            brand,
            safeMain
        );


    for (
        const keyword of
        filteredAI
    ) {

        if (
            finalOutput.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


        const normalized =
            normalizeKeyword(
                keyword
            );


        // Main already exists.

        if (
            normalized ===
            normalizeKeyword(
                safeMain
            )
        ) {

            continue;

        }


        if (
            finalOutput.some(
                existing =>
                    similarity(
                        existing,
                        keyword
                    ) >= 0.82
            )
        ) {

            continue;

        }


        finalOutput.push(
            keyword
        );

    }


    // ======================================================
    // STEP 3 — SAFE FALLBACK
    // ======================================================

    if (
        finalOutput.length <
        MIN_USABLE_KEYWORDS
    ) {

        const fallback =
            buildSafeFallbackKeywords(

                product,

                category,

                marketplace,

                brand,

                finalOutput

            );


        for (
            const keyword of
            fallback
        ) {

            if (
                finalOutput.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            if (
                finalOutput.some(
                    existing =>
                        similarity(
                            existing,
                            keyword
                        ) >= 0.90
                )
            ) {

                continue;

            }


            finalOutput.push(
                keyword
            );

        }

    }


    // ======================================================
    // STEP 4 — FINAL EXACT DEDUP
    // ======================================================

    const unique =
        removeDuplicates(
            finalOutput
        );


    // ======================================================
    // STEP 5 — MAIN KEYWORD FIRST
    // ======================================================

    const mainNormalized =
        normalizeKeyword(
            safeMain
        );


    const mainIndex =
        unique.findIndex(
            keyword =>
                normalizeKeyword(
                    keyword
                ) ===
                mainNormalized
        );


    if (
        mainIndex > 0
    ) {

        const mainItem =
            unique.splice(
                mainIndex,
                1
            )[0];


        unique.unshift(
            mainItem
        );

    }
    else if (
        mainIndex === -1 &&
        safeMain
    ) {

        unique.unshift(
            safeMain
        );

    }


    // ======================================================
    // STEP 6 — MAXIMUM 20
    // ======================================================

    return unique.slice(
        0,
        MAX_KEYWORDS
    );

}


// ==========================================================
// EXTRACT KEYWORDS FROM BACKEND
// ==========================================================

function extractKeywordsFromResponse(
    data
) {

    if (!data) {

        return [];

    }


    // ======================================================
    // Direct array
    // ======================================================

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    // ======================================================
    // Standard fields
    // ======================================================

    const fields = [

        "keywords",

        "seoKeywords",

        "seo_keywords",

        "keywordList",

        "keyword_list",

        "results",

        "items"

    ];


    for (
        const field of
        fields
    ) {

        if (
            Array.isArray(
                data[field]
            )
        ) {

            return data[field];

        }

    }


    // ======================================================
    // Nested result
    // ======================================================

    if (
        data.result !== undefined
    ) {

        if (
            Array.isArray(
                data.result
            )
        ) {

            return data.result;

        }


        if (
            typeof data.result ===
            "object"
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


        if (
            typeof data.result ===
            "string"
        ) {

            return parseKeywordText(
                data.result
            );

        }

    }


    // ======================================================
    // Nested data
    // ======================================================

    if (
        data.data !== undefined
    ) {

        if (
            Array.isArray(
                data.data
            )
        ) {

            return data.data;

        }


        if (
            typeof data.data ===
            "object"
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


        if (
            typeof data.data ===
            "string"
        ) {

            return parseKeywordText(
                data.data
            );

        }

    }


    // ======================================================
    // text / output / response
    // ======================================================

    const textFields = [

        "text",

        "output",

        "response",

        "content",

        "generatedText"

    ];


    for (
        const field of
        textFields
    ) {

        if (
            typeof data[field] ===
            "string"
        ) {

            const parsed =
                parseKeywordText(
                    data[field]
                );


            if (
                parsed.length
            ) {

                return parsed;

            }

        }

    }


    return [];

}


// ==========================================================
// PARSE TEXT KEYWORDS
// ==========================================================

function parseKeywordText(
    text
) {

    if (
        !text ||
        typeof text !==
        "string"
    ) {

        return [];

    }


    let cleanedText =
        text.trim();


    // Remove markdown code fences.

    cleanedText =
        cleanedText.replace(
            /^```(?:json|text)?/i,
            ""
        );


    cleanedText =
        cleanedText.replace(
            /```$/i,
            ""
        );


    cleanedText =
        cleanedText.trim();


    // ======================================================
    // JSON ARRAY
    // ======================================================

    if (
        cleanedText.startsWith("[") &&
        cleanedText.endsWith("]")
    ) {

        try {

            const parsed =
                JSON.parse(
                    cleanedText
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
    // JSON OBJECT
    // ======================================================

    if (
        cleanedText.startsWith("{") &&
        cleanedText.endsWith("}")
    ) {

        try {

            const parsed =
                JSON.parse(
                    cleanedText
                );


            const result =
                extractKeywordsFromResponse(
                    parsed
                );


            if (
                result.length
            ) {

                return result;

            }

        }
        catch (error) {

            console.warn(
                "SEO JSON object parse failed:",
                error
            );

        }

    }


    // ======================================================
    // LINE PARSER
    // ======================================================

    return cleanedText

        .split("\n")

        .map(
            line =>
                cleanKeyword(
                    line
                )
        )

        .map(
            line =>
                line
                    .replace(
                        /^\d+\s*[.)\-:]\s*/,
                        ""
                    )
                    .replace(
                        /^[-•*]\s*/,
                        ""
                    )
                    .trim()
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
            "❌ SEO Generator 15.0: Required HTML element missing."
        );


        if (status) {

            status.innerText =
                "❌ SEO form में required HTML element missing है।";

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

            mainKeywordInput,

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
        "🤖 AI 20 relevant SEO keywords बना रहा है..."
    );


    // ======================================================
    // REQUEST
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
            REQUESTED_KEYWORDS,

        maxKeywords:
            MAX_KEYWORDS,

        minKeywords:
            MIN_USABLE_KEYWORDS,

        requestedKeywordCount:
            REQUESTED_KEYWORDS

    };


    console.log(
        "=========================================="
    );

    console.log(
        "SEO GENERATOR — VERSION 15.0"
    );

    console.log(
        "REQUEST:",
        requestData
    );

    console.log(
        "=========================================="
    );


    // ======================================================
    // API CALL
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
        // PARSE RESPONSE
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
        // BACKEND SUCCESS CHECK
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
        // FINAL PROCESSING
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
        // EMPTY CHECK
        // ==================================================

        if (
            !keywords.length
        ) {

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
        // SUCCESS MESSAGE
        // ==================================================

        showStatus(

            "✅ " +
            keywords.length +
            " SEO keywords generated successfully."

        );


        console.log(
            "✅ SEO Generator 15.0 completed successfully."
        );

    }
    catch (error) {

        console.error(
            "❌ SEO GENERATOR 15.0 ERROR:",
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
            event.target.tagName ===
                "INPUT"
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
// FINAL LOG
// ==========================================================

console.log(
    "🚀 AI Seller Toolkit SEO Generator 15.0 READY"
);

console.log(
    "🔒 Strict factual keyword protection enabled"
);

console.log(
    "🛡️ Duplicate + near-duplicate protection enabled"
);

console.log(
    "🎯 Maximum keywords:",
    MAX_KEYWORDS
);
