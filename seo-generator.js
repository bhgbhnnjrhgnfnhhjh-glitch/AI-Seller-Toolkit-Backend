// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 17.0
// ==========================================================
//
// PURPOSE:
// Reliable SEO Keyword Generator
//
// Backend:
// AI Seller Toolkit Backend v14.x+
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
// VERSION 17.0
// ----------------------------------------------------------
// ✅ Reliable 20-keyword output
// ✅ Backend + Local fallback
// ✅ Works even if backend returns only 1 keyword
// ✅ Works even if backend fails
// ✅ Main keyword always #1
// ✅ Safe factual keyword generation
// ✅ No invented product specifications
// ✅ No invented colors/materials/designs/sizes
// ✅ Brand stuffing protection
// ✅ Product fragment protection
// ✅ Duplicate protection
// ✅ Near duplicate protection
// ✅ Generic keyword protection
// ✅ Marketplace validation
// ✅ Category-aware safe phrases
// ✅ Maximum 20 keywords
// ✅ Stable JSON/array/text response handling
// ✅ Does not modify input fields
// ==========================================================


// ==========================================================
// API
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const SEO_API =
    API_URL + "/api/generate-seo";


// ==========================================================
// SETTINGS
// ==========================================================

const MAX_KEYWORDS = 20;

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
            "🚀 AI Seller Toolkit SEO Generator 17.0 loaded"
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

        .replace(
            /[\r\n\t]+/g,
            " "
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


    let text =
        String(value)
            .trim();


    // Remove numbering
    text =
        text.replace(
            /^\s*\d+\s*[\.\)\-:]\s*/,
            ""
        );


    // Remove bullets
    text =
        text.replace(
            /^\s*[-•*]\s*/,
            ""
        );


    // Remove quotes around complete keyword
    text =
        text.replace(
            /^["'“”]+|["'“”]+$/g,
            ""
        );


    // Remove accidental trailing punctuation
    text =
        text.replace(
            /[;,]+$/,
            ""
        );


    // Normalize spaces
    text =
        text.replace(
            /\s+/g,
            " "
        )
        .trim();


    return text;

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
            /['’“”"]/g,
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
// SIMILARITY
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
        intersection / union
    );

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


    const B =
        tokenSet(
            effectiveBrand
        );


    const K =
        tokenSet(
            keyword
        );


    if (
        !B.size ||
        !K.size
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
// PRODUCT FRAGMENT CHECK
// ==========================================================
//
// Important:
//
// Product = Cotton Kurti
//
// "Kurti" alone = reject
//
// But:
// "Cotton kurti online" = allowed
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


    // Exact product name
    if (
        keywordNormalized ===
        productNormalized
    ) {

        return false;

    }


    // One-word fragment of multi-word product
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

        "best",
        "new",
        "latest",
        "trending",

        "quality",
        "good quality",

        "cheap",
        "cheap price",

        "shopping",
        "online shopping",

        "online",
        "buy online",
        "shop online",

        "sale",

        "listing",
        "product listing",

        "marketplace"

    ];


    return genericWords.includes(
        normalized
    );

}


// ==========================================================
// INVALID / UNSAFE KEYWORD CHECK
// ==========================================================

function isUnsafeKeyword(
    keyword,
    product,
    brand
) {

    if (!keyword) {

        return true;

    }


    if (
        isGenericKeyword(
            keyword
        )
    ) {

        return true;

    }


    if (
        isProductFragment(
            keyword,
            product
        )
    ) {

        return true;

    }


    if (
        isBrandStuffed(
            keyword,
            brand,
            product
        )
    ) {

        return true;

    }


    return false;

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
        cleanKeyword(
            mainKeyword
        );


    // No main keyword:
    // Product name becomes main keyword
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


    // If main keyword contains complete effective brand,
    // do not allow brand stuffing.
    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }


    // Do not allow single product fragment
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
// VALIDATE MARKETPLACE
// ==========================================================

function getSafeMarketplace(
    marketplace
) {

    const value =
        cleanInput(
            marketplace
        );


    const marketplaces = [

        "Amazon",
        "Meesho",
        "Flipkart",
        "Etsy",
        "Shopify",
        "OLX"

    ];


    const found =
        marketplaces.find(
            item =>
                normalizeKeyword(
                    item
                ) ===
                normalizeKeyword(
                    value
                )
        );


    return found || "";

}


// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(
    category
) {

    const value =
        cleanInput(
            category
        );


    if (!value) {

        return "";

    }


    const normalized =
        normalizeKeyword(
            value
        );


    const map = {

        "fashion":
            "Fashion",

        "beauty":
            "Beauty",

        "electronics":
            "Electronics",

        "home kitchen":
            "Home & Kitchen",

        "shoes":
            "Shoes",

        "jewellery":
            "Jewellery",

        "toys":
            "Toys",

        "books":
            "Books",

        "pet":
            "Pet",

        "sports":
            "Sports",

        "automotive":
            "Automotive",

        "garden":
            "Garden",

        "food":
            "Food",

        "gifts":
            "Gifts"

    };


    return (
        map[normalized] ||
        value
    );

}


// ==========================================================
// ADD SAFE CANDIDATE
// ==========================================================

function addSafeCandidate(
    candidate,
    state
) {

    if (
        !candidate ||
        !state
    ) {

        return false;

    }


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


    // Existing duplicate
    if (
        state.seen.has(
            normalized
        )
    ) {

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
            state.product
        )
    ) {

        return false;

    }


    // Brand stuffing
    if (
        isBrandStuffed(
            clean,
            state.brand,
            state.product
        )
    ) {

        return false;

    }


    // Near duplicate
    const nearDuplicate =
        state.output.some(
            existing =>
                similarity(
                    existing,
                    clean
                ) >= 0.86
        );


    if (
        nearDuplicate
    ) {

        return false;

    }


    state.seen.add(
        normalized
    );


    state.output.push(
        clean
    );


    return true;

}


// ==========================================================
// CATEGORY-SAFE KEYWORD TEMPLATES
// ==========================================================
//
// These phrases do NOT invent product specifications.
//
// ==========================================================

function getCategoryTemplates(
    category
) {

    const normalized =
        normalizeKeyword(
            category
        );


    switch (normalized) {

        case "fashion":

            return [

                "for women",
                "for men",
                "for daily wear",
                "clothing",
                "fashion wear",
                "apparel"

            ];


        case "beauty":

            return [

                "beauty product",
                "personal care",
                "beauty care",
                "skin care",
                "beauty essentials"

            ];


        case "electronics":

            return [

                "electronic product",
                "consumer electronics",
                "electronic device",
                "electronics accessory",
                "electronic accessories"

            ];


        case "home kitchen":

            return [

                "home use",
                "kitchen use",
                "home product",
                "kitchen product",
                "home essentials"

            ];


        case "shoes":

            return [

                "footwear",
                "shoe collection",
                "shoe shopping",
                "footwear collection",
                "shoes online"

            ];


        case "jewellery":

            return [

                "jewellery collection",
                "jewellery design",
                "jewellery shopping",
                "fashion jewellery",
                "jewellery online"

            ];


        case "toys":

            return [

                "toy collection",
                "toy shopping",
                "kids toy",
                "children toy",
                "toys online"

            ];


        case "books":

            return [

                "book collection",
                "book shopping",
                "books online",
                "book store",
                "book catalog"

            ];


        case "pet":

            return [

                "pet product",
                "pet supplies",
                "pet accessories",
                "pet care",
                "pet essentials"

            ];


        case "sports":

            return [

                "sports product",
                "sports equipment",
                "sports gear",
                "sports collection",
                "sports accessories"

            ];


        case "automotive":

            return [

                "car accessory",
                "automotive product",
                "car care",
                "auto accessory",
                "automotive accessories"

            ];


        case "garden":

            return [

                "gardening product",
                "garden supplies",
                "gardening supplies",
                "garden essentials",
                "garden accessory"

            ];


        case "food":

            return [

                "food product",
                "food item",
                "food shopping",
                "food collection",
                "food online"

            ];


        case "gifts":

            return [

                "gift product",
                "gift collection",
                "gift shopping",
                "gift idea",
                "gifts online"

            ];


        default:

            return [

                "product online",
                "product shopping",
                "product collection"

            ];

    }

}


// ==========================================================
// LOCAL SAFE KEYWORD ENGINE
// ==========================================================
//
// This is the IMPORTANT FIX.
//
// Even if backend returns only:
//
// Cotton kurti
//
// this engine creates safe relevant phrases.
//
// ==========================================================

function buildLocalKeywords(
    product,
    category,
    marketplace,
    brand,
    mainKeyword
) {

    const productClean =
        cleanInput(
            product
        );


    if (!productClean) {

        return [];

    }


    const safeMain =
        sanitizeMainKeyword(
            mainKeyword,
            productClean,
            brand
        );


    const state = {

        product:
            productClean,

        category:
            normalizeCategory(
                category
            ),

        marketplace:
            getSafeMarketplace(
                marketplace
            ),

        brand:
            brand || "",

        output: [],

        seen: new Set()

    };


    // ======================================================
    // 1. MAIN KEYWORD
    // ======================================================

    addSafeCandidate(
        safeMain,
        state
    );


    // ======================================================
    // 2. CORE PRODUCT + SEARCH INTENT
    // ======================================================

    const coreTemplates = [

        productClean +
            " online",

        productClean +
            " buy",

        productClean +
            " shop",

        productClean +
            " shopping",

        productClean +
            " collection",

        productClean +
            " design",

        productClean +
            " style",

        productClean +
            " price",

        productClean +
            " catalog",

        productClean +
            " available online",

        "buy " +
            productClean,

        "shop " +
            productClean

    ];


    for (
        const candidate of
        coreTemplates
    ) {

        if (
            state.output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


        addSafeCandidate(
            candidate,
            state
        );

    }


    // ======================================================
    // 3. CATEGORY SAFE PHRASES
    // ======================================================

    const categoryTemplates =
        getCategoryTemplates(
            state.category
        );


    for (
        const phrase of
        categoryTemplates
    ) {

        if (
            state.output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


        addSafeCandidate(

            productClean +
            " " +
            phrase,

            state

        );

    }


    // ======================================================
    // 4. MARKETPLACE
    // ======================================================

    if (
        state.marketplace
    ) {

        addSafeCandidate(

            productClean +
            " on " +
            state.marketplace,

            state

        );


        addSafeCandidate(

            state.marketplace +
            " " +
            productClean,

            state

        );

    }


    // ======================================================
    // 5. CATEGORY PHRASE
    // ======================================================

    if (
        state.category &&
        normalizeKeyword(
            state.category
        ) !==
        normalizeKeyword(
            productClean
        )
    ) {

        addSafeCandidate(

            productClean +
            " " +
            state.category,

            state

        );

    }


    // ======================================================
    // 6. ADDITIONAL SAFE INTENTS
    // ======================================================

    const additionalTemplates = [

        productClean +
            " online shopping",

        productClean +
            " shopping online",

        productClean +
            " collection online",

        productClean +
            " style online",

        productClean +
            " design collection",

        productClean +
            " product",

        productClean +
            " store"

    ];


    for (
        const candidate of
        additionalTemplates
    ) {

        if (
            state.output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


        addSafeCandidate(
            candidate,
            state
        );

    }


    return state.output.slice(
        0,
        MAX_KEYWORDS
    );

}


// ==========================================================
// FILTER BACKEND KEYWORDS
// ==========================================================

function filterBackendKeywords(
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


    const state = {

        product:
            product,

        category:
            category,

        marketplace:
            marketplace,

        brand:
            brand,

        output: [],

        seen: new Set()

    };


    // Main first
    addSafeCandidate(
        safeMain,
        state
    );


    if (
        Array.isArray(
            aiKeywords
        )
    ) {

        for (
            const keyword of
            aiKeywords
        ) {

            if (
                state.output.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            addSafeCandidate(
                keyword,
                state
            );

        }

    }


    return state.output.slice(
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
    // Backend keywords
    // ======================================================

    let keywords =
        filterBackendKeywords(

            aiKeywords,

            product,

            category,

            brand,

            safeMain,

            marketplace

        );


    // ======================================================
    // STEP 2
    // If backend gave too few keywords,
    // use local safe engine.
    // ======================================================

    if (
        keywords.length <
        MAX_KEYWORDS
    ) {

        const localKeywords =
            buildLocalKeywords(

                product,

                category,

                marketplace,

                brand,

                safeMain

            );


        for (
            const candidate of
            localKeywords
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
                        normalizeKeyword(
                            existing
                        ) ===
                        normalizeKeyword(
                            candidate
                        )
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
                        ) >=
                        0.86
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
    // STEP 3
    // HARD GUARANTEE FALLBACK
    // ======================================================

    if (
        keywords.length <
        MIN_KEYWORDS
    ) {

        const emergencyKeywords = [

            product +
                " online",

            product +
                " buy",

            product +
                " shop",

            product +
                " shopping",

            product +
                " collection",

            product +
                " design",

            product +
                " style",

            product +
                " price",

            product +
                " catalog",

            product +
                " store",

            "buy " +
                product,

            "shop " +
                product,

            product +
                " online shopping",

            product +
                " available online",

            product +
                " collection online",

            product +
                " shopping online",

            product +
                " product",

            product +
                " fashion",

            product +
                " apparel"

        ];


        for (
            const candidate of
            emergencyKeywords
        ) {

            if (
                keywords.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            const clean =
                cleanKeyword(
                    candidate
                );


            if (!clean) {

                continue;

            }


            const duplicate =
                keywords.some(
                    existing =>
                        normalizeKeyword(
                            existing
                        ) ===
                        normalizeKeyword(
                            clean
                        )
                );


            if (
                duplicate
            ) {

                continue;

            }


            const unsafe =
                isUnsafeKeyword(
                    clean,
                    product,
                    brand
                );


            if (
                unsafe
            ) {

                continue;

            }


            keywords.push(
                clean
            );

        }

    }


    // ======================================================
    // STEP 4
    // Remove duplicates one final time
    // ======================================================

    const finalOutput = [];

    const finalSeen =
        new Set();


    for (
        const keyword of
        keywords
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
            finalSeen.has(
                normalized
            )
        ) {

            continue;

        }


        finalSeen.add(
            normalized
        );


        finalOutput.push(
            clean
        );


        if (
            finalOutput.length >=
            MAX_KEYWORDS
        ) {

            break;

        }

    }


    // ======================================================
    // STEP 5
    // Main keyword MUST be first
    // ======================================================

    const mainNormalized =
        normalizeKeyword(
            safeMain
        );


    if (
        safeMain
    ) {

        const mainIndex =
            finalOutput.findIndex(
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
                finalOutput.splice(
                    mainIndex,
                    1
                )[0];


            finalOutput.unshift(
                mainItem
            );

        }
        else {

            finalOutput.unshift(
                safeMain
            );

        }

    }


    return finalOutput.slice(
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

    if (
        data === null ||
        data === undefined
    ) {

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
    // String
    // ======================================================

    if (
        typeof data ===
        "string"
    ) {

        const text =
            data.trim();


        if (!text) {

            return [];

        }


        // Try JSON string first
        try {

            const parsed =
                JSON.parse(
                    text
                );


            if (
                parsed !== data
            ) {

                return extractKeywordsFromResponse(
                    parsed
                );

            }

        }
        catch (error) {

            // Normal text response
        }


        return text

            .split(/\r?\n/)

            .map(
                line =>
                    cleanKeyword(
                        line
                    )
            )

            .filter(Boolean);

    }


    // ======================================================
    // Object fields
    // ======================================================

    if (
        typeof data ===
        "object"
    ) {

        const possibleFields = [

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
            const field of
            possibleFields
        ) {

            if (
                data[field] !==
                undefined
            ) {

                const extracted =
                    extractKeywordsFromResponse(
                        data[field]
                    );


                if (
                    extracted.length
                ) {

                    return extracted;

                }

            }

        }


        // Nested result
        if (
            data.result
        ) {

            const extracted =
                extractKeywordsFromResponse(
                    data.result
                );


            if (
                extracted.length
            ) {

                return extracted;

            }

        }


        // Nested data
        if (
            data.data
        ) {

            const extracted =
                extractKeywordsFromResponse(
                    data.data
                );


            if (
                extracted.length
            ) {

                return extracted;

            }

        }

    }


    return [];

}


// ==========================================================
// FETCH BACKEND
// ==========================================================

async function fetchSEOFromBackend(
    requestData
) {

    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            function () {

                controller.abort();

            },
            30000
        );


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
                        ),

                    signal:
                        controller.signal

                }
            );


        const responseText =
            await response.text();


        console.log(
            "SEO API HTTP:",
            response.status
        );


        console.log(
            "SEO API RAW:",
            responseText
        );


        let data = null;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch (error) {

            console.warn(
                "⚠️ Backend response is not JSON."
            );

        }


        if (
            !response.ok
        ) {

            throw new Error(

                data &&
                data.error

                    ? data.error

                    : "HTTP " +
                      response.status

            );

        }


        return data;

    }
    finally {

        clearTimeout(
            timeout
        );

    }

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
            "❌ SEO Generator 17.0: Required HTML element missing."
        );


        if (status) {

            status.innerText =
                "❌ SEO form में required element missing है।";

        }


        return;

    }


    // ======================================================
    // READ INPUTS
    // ======================================================

    const product =
        cleanInput(
            productElement.value
        );


    const category =
        normalizeCategory(
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
        getSafeMarketplace(
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
        "🤖 Relevant SEO keywords तैयार किए जा रहे हैं..."
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
        "SEO GENERATOR 17.0 REQUEST"
    );


    console.log(
        requestData
    );


    console.log(
        "========================================"
    );


    let aiKeywords = [];

    let backendWorked = false;


    // ======================================================
    // TRY BACKEND
    // ======================================================

    try {

        const data =
            await fetchSEOFromBackend(
                requestData
            );


        aiKeywords =
            extractKeywordsFromResponse(
                data
            );


        backendWorked = true;


        console.log(
            "✅ Backend keywords:",
            aiKeywords
        );

    }
    catch (error) {

        console.warn(
            "⚠️ Backend unavailable. Local SEO engine will be used.",
            error
        );

    }


    // ======================================================
    // FINAL KEYWORDS
    // ======================================================

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
        "========================================"
    );


    console.log(
        "FINAL SEO KEYWORDS 17.0"
    );


    console.log(
        keywords
    );


    console.log(
        "========================================"
    );


    // ======================================================
    // EMPTY CHECK
    // ======================================================

    if (
        !keywords.length
    ) {

        result.value =
            "❌ SEO keywords generate नहीं हो सके।";


        showStatus(
            "❌ SEO generation failed."
        );


        return;

    }


    // ======================================================
    // DISPLAY
    // ======================================================

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


    // ======================================================
    // STATUS
    // ======================================================

    if (
        keywords.length >=
        MAX_KEYWORDS
    ) {

        showStatus(

            "✅ " +
            keywords.length +
            " SEO keywords generated successfully."

        );

    }
    else if (
        backendWorked
    ) {

        showStatus(

            "✅ " +
            keywords.length +
            " safe SEO keywords generated."

        );

    }
    else {

        showStatus(

            "✅ " +
            keywords.length +
            " SEO keywords generated using safe local mode."

        );

    }


    console.log(
        "✅ SEO GENERATOR 17.0 COMPLETE"
    );

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
        text.startsWith(
            "❌"
        ) ||
        text.startsWith(
            "⏳"
        )
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
// DEBUG HELPER
// ==========================================================

window.AI_SELLER_SEO_17 = {

    version:
        "17.0",

    maxKeywords:
        MAX_KEYWORDS,

    minKeywords:
        MIN_KEYWORDS,

    normalizeKeyword:
        normalizeKeyword,

    buildLocalKeywords:
        buildLocalKeywords,

    finalizeKeywords:
        finalizeKeywords

};


// ==========================================================
// FINAL
// ==========================================================

console.log(
    "🚀 AI Seller Toolkit SEO Generator — FINAL VERSION 17.0 READY"
);
