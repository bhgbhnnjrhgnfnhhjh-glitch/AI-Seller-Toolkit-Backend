// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 15.0
// ==========================================================
//
// PURPOSE
// ----------------------------------------------------------
// High-quality SEO keyword generation
// Strict factual protection
// Anti-repetition system
// Backend + safe local fallback
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
// VERSION 15.0 FIXES
// ----------------------------------------------------------
// ✅ Main keyword first
// ✅ Maximum 20 keywords
// ✅ Target 20 keywords when safely possible
// ✅ Strong duplicate protection
// ✅ Strong near-duplicate protection
// ✅ Repetition control
// ✅ Removes weak filler keywords
// ✅ Removes "listing", "marketplace", "product" filler
// ✅ Removes unsupported attributes
// ✅ Does NOT invent color
// ✅ Does NOT invent size
// ✅ Does NOT invent gender
// ✅ Does NOT invent pattern
// ✅ Does NOT invent material
// ✅ Does NOT invent occasion
// ✅ Does NOT invent product specifications
// ✅ Brand stuffing protection
// ✅ Product fragment protection
// ✅ Search-intent diversity
// ✅ Backend response protection
// ✅ JSON response protection
// ✅ Safe local fallback
// ✅ Existing HTML compatible
// ✅ Copy button compatible
// ✅ Mobile compatible
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

// AI से 20 keywords मांगेंगे
const REQUESTED_KEYWORDS = 20;

// बहुत कम results आने पर local safe fallback
const MIN_ACCEPTABLE_KEYWORDS = 8;


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
            /[-_/|]/g,
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
// TOKEN ARRAY
// ==========================================================

function tokenArray(text) {

    const normalized =
        normalizeKeyword(text);


    if (!normalized) {

        return [];

    }


    return normalized
        .split(" ")
        .filter(
            token =>
                token.length > 1
        );

}


// ==========================================================
// JACCARD SIMILARITY
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

            if (B.has(token)) {

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


    return intersection / union;

}


// ==========================================================
// WORD OVERLAP
// ==========================================================

function wordOverlap(a, b) {

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


    let common = 0;


    A.forEach(
        token => {

            if (B.has(token)) {

                common++;

            }

        }
    );


    return (
        common /
        Math.min(
            A.size,
            B.size
        )
    );

}


// ==========================================================
// PRODUCT FRAGMENT PROTECTION
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


    const KText =
        normalizeKeyword(keyword);

    const PText =
        normalizeKeyword(product);


    // Exact product is allowed
    if (
        KText === PText
    ) {

        return false;

    }


    // Single word taken directly from
    // a multi-word product is not useful
    if (
        K.size === 1 &&
        P.size > 1
    ) {

        for (
            const token of K
        ) {

            if (P.has(token)) {

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

            if (K.has(token)) {

                count++;

            }

        }
    );


    return (
        count === B.size
    );

}


// ==========================================================
// GENERIC / FILLER KEYWORDS
// ==========================================================

function isWeakKeyword(keyword) {

    const normalized =
        normalizeKeyword(keyword);


    if (!normalized) {

        return true;

    }


    const weakKeywords = [

        "product",

        "products",

        "item",

        "items",

        "product listing",

        "product listings",

        "online",

        "shopping",

        "online shopping",

        "marketplace",

        "marketplaces",

        "listing",

        "listings",

        "catalog",

        "catalogue",

        "product catalog",

        "product catalogue",

        "best",

        "best product",

        "best products",

        "latest",

        "new",

        "trending",

        "popular",

        "quality",

        "good quality",

        "cheap",

        "cheap price",

        "sale",

        "discount",

        "deal",

        "deals",

        "available",

        "available online",

        "store",

        "shop",

        "buy",

        "fashion",

        "clothing",

        "apparel",

        "wear"

    ];


    return weakKeywords.includes(
        normalized
    );

}


// ==========================================================
// UNSUPPORTED ATTRIBUTE WORDS
// ==========================================================
//
// These words are rejected when seller did not provide
// the corresponding information.
//
// ==========================================================

function hasUnsupportedAttribute(
    keyword,
    productDetails
) {

    const k =
        normalizeKeyword(keyword);

    const details =
        normalizeKeyword(productDetails);


    // If seller provided details, we can be less strict.
    if (details) {

        return false;

    }


    const unsupportedPatterns = [

        // colors
        "red",
        "blue",
        "green",
        "black",
        "white",
        "yellow",
        "pink",
        "purple",
        "orange",
        "brown",
        "maroon",

        // sizes
        "small",
        "medium",
        "large",
        "xl",
        "xxl",
        "xxxl",

        // patterns
        "printed",
        "print",
        "floral",
        "striped",
        "striped",
        "checked",
        "checkered",
        "embroidered",
        "embroidery",

        // materials
        "silk",
        "linen",
        "wool",
        "leather",
        "denim",
        "polyester",

        // claims
        "premium",
        "luxury",
        "comfortable",
        "soft",
        "durable",
        "breathable",
        "waterproof",
        "water resistant",

        // occasions
        "party wear",
        "wedding wear",
        "festive wear",
        "office wear",

        // gender
        "men",
        "mens",
        "women",
        "womens",
        "boys",
        "girls",
        "kids"

    ];


    for (
        const phrase of
        unsupportedPatterns
    ) {

        if (
            k.includes(phrase)
        ) {

            return true;

        }

    }


    return false;

}


// ==========================================================
// NORMALIZE CATEGORY
// ==========================================================

function normalizeCategory(
    category
) {

    const c =
        normalizeKeyword(category);


    if (
        c.includes("fashion") ||
        c.includes("clothing")
    ) {

        return "fashion";

    }


    if (
        c.includes("beauty") ||
        c.includes("personal care")
    ) {

        return "beauty";

    }


    if (
        c.includes("electronics")
    ) {

        return "electronics";

    }


    if (
        c.includes("home") ||
        c.includes("kitchen")
    ) {

        return "home";

    }


    if (
        c.includes("shoe")
    ) {

        return "shoes";

    }


    if (
        c.includes("jewellery") ||
        c.includes("jewelry")
    ) {

        return "jewellery";

    }


    if (
        c.includes("toy")
    ) {

        return "toys";

    }


    if (
        c.includes("book")
    ) {

        return "books";

    }


    if (
        c.includes("pet")
    ) {

        return "pet";

    }


    if (
        c.includes("sport")
    ) {

        return "sports";

    }


    if (
        c.includes("automotive") ||
        c.includes("car")
    ) {

        return "automotive";

    }


    if (
        c.includes("garden")
    ) {

        return "garden";

    }


    if (
        c.includes("food")
    ) {

        return "food";

    }


    if (
        c.includes("gift")
    ) {

        return "gifts";

    }


    return "general";

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


    const input =
        cleanInput(mainKeyword);


    if (!input) {

        return productClean;

    }


    const main =
        normalizeKeyword(input);

    const productNormalized =
        normalizeKeyword(productClean);


    // Exact product
    if (
        main ===
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


    // Don't allow brand-only / brand-heavy main keyword
    if (
        brandNormalized &&
        main.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }


    // Don't allow a single product fragment
    if (
        isProductFragment(
            input,
            productClean
        )
    ) {

        return productClean;

    }


    return input;

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
// VALID KEYWORD
// ==========================================================

function isValidKeyword(
    keyword,
    product,
    brand,
    mainKeyword,
    productDetails
) {

    const clean =
        cleanKeyword(keyword);


    if (!clean) {

        return false;

    }


    const normalized =
        normalizeKeyword(clean);


    if (!normalized) {

        return false;

    }


    const mainNormalized =
        normalizeKeyword(
            mainKeyword
        );


    // Main keyword always allowed
    if (
        normalized ===
        mainNormalized
    ) {

        return true;

    }


    // Weak filler
    if (
        isWeakKeyword(clean)
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


    // Unsupported facts
    if (
        hasUnsupportedAttribute(
            clean,
            productDetails
        )
    ) {

        return false;

    }


    // Very short keyword
    const tokens =
        tokenArray(clean);


    if (
        tokens.length < 2
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
    productDetails,
    similarityThreshold = 0.72
) {

    const clean =
        cleanKeyword(candidate);


    if (!clean) {

        return false;

    }


    if (
        !isValidKeyword(
            clean,
            product,
            brand,
            mainKeyword,
            productDetails
        )
    ) {

        return false;

    }


    const normalized =
        normalizeKeyword(clean);


    // Exact duplicate
    if (
        output.some(
            item =>
                normalizeKeyword(item) ===
                normalized
        )
    ) {

        return false;

    }


    // Strong near duplicate check
    for (
        const existing of output
    ) {

        const sim =
            similarity(
                existing,
                clean
            );


        const overlap =
            wordOverlap(
                existing,
                clean
            );


        if (
            sim >= similarityThreshold ||
            overlap >= 0.90
        ) {

            return false;

        }

    }


    output.push(clean);

    return true;

}


// ==========================================================
// FILTER BACKEND KEYWORDS
// ==========================================================

function filterBackendKeywords(
    keywords,
    product,
    brand,
    mainKeyword,
    productDetails
) {

    const output = [];


    if (
        !Array.isArray(keywords)
    ) {

        return output;

    }


    for (
        const item of keywords
    ) {

        if (
            output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


        addUniqueKeyword(

            output,

            item,

            product,

            brand,

            mainKeyword,

            productDetails,

            0.72

        );

    }


    return output;

}


// ==========================================================
// CATEGORY-SAFE INTENT PHRASES
// ==========================================================
//
// These phrases describe search intent.
// They do NOT claim product specifications.
//
// ==========================================================

const SAFE_INTENTS = [

    "online",
    "buy online",
    "shop online",
    "online shopping",
    "price",
    "collection",
    "design",
    "style",
    "styles",
    "shopping",
    "buy",
    "shop",
    "store",
    "for sale",
    "purchase",
    "available online",
    "online store",
    "product search",
    "shopping online"

];


// ==========================================================
// BUILD SAFE LOCAL KEYWORDS
// ==========================================================

function buildSafeFallbackKeywords(
    product,
    category,
    marketplace,
    brand,
    productDetails
) {

    const output = [];


    const productClean =
        cleanInput(product);


    if (!productClean) {

        return output;

    }


    const normalizedProduct =
        normalizeKeyword(
            productClean
        );


    // ------------------------------------------------------
    // PRODUCT BASE
    // ------------------------------------------------------

    addUniqueKeyword(

        output,

        productClean,

        productClean,

        brand,

        productClean,

        productDetails,

        0.99

    );


    // ------------------------------------------------------
    // PRIMARY SEARCH INTENTS
    // ------------------------------------------------------

    const primaryIntents = [

        "online",
        "buy online",
        "shop online",
        "online shopping",
        "price",
        "collection",
        "design",
        "style",
        "shopping",
        "purchase"

    ];


    for (
        const intent of
        primaryIntents
    ) {

        if (
            output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


        addUniqueKeyword(

            output,

            productClean +
            " " +
            intent,

            productClean,

            brand,

            productClean,

            productDetails,

            0.82

        );

    }


    // ------------------------------------------------------
    // REVERSE SEARCH PHRASES
    // ------------------------------------------------------

    addUniqueKeyword(

        output,

        "buy " +
        productClean +
        " online",

        productClean,
        brand,
        productClean,
        productDetails,
        0.82

    );


    addUniqueKeyword(

        output,

        "shop " +
        productClean +
        " online",

        productClean,
        brand,
        productClean,
        productDetails,
        0.82

    );


    addUniqueKeyword(

        output,

        "online " +
        productClean +
        " shopping",

        productClean,
        brand,
        productClean,
        productDetails,
        0.82

    );


    // ------------------------------------------------------
    // MARKETPLACE
    // ------------------------------------------------------

    const market =
        cleanInput(marketplace);


    if (market) {

        addUniqueKeyword(

            output,

            productClean +
            " on " +
            market,

            productClean,
            brand,
            productClean,
            productDetails,
            0.82

        );


        addUniqueKeyword(

            output,

            market +
            " " +
            productClean,

            productClean,
            brand,
            productClean,
            productDetails,
            0.82

        );

    }


    // ------------------------------------------------------
    // CATEGORY
    // ------------------------------------------------------

    const categoryClean =
        cleanInput(category);


    const normalizedCategory =
        normalizeKeyword(
            categoryClean
        );


    if (
        categoryClean &&
        normalizedCategory &&
        normalizedCategory !==
        normalizedProduct
    ) {

        addUniqueKeyword(

            output,

            productClean +
            " " +
            categoryClean,

            productClean,
            brand,
            productClean,
            productDetails,
            0.82

        );

    }


    // ------------------------------------------------------
    // PRODUCT TOKEN COMBINATIONS
    // ------------------------------------------------------

    const tokens =
        tokenArray(productClean);


    // Example:
    // Cotton Kurti
    //
    // cotton kurti
    // kurti cotton
    //
    // Reverse phrase is allowed only for
    // 2-word product names.

    if (
        tokens.length === 2
    ) {

        addUniqueKeyword(

            output,

            tokens[1] +
            " " +
            tokens[0],

            productClean,
            brand,
            productClean,
            productDetails,
            0.88

        );

    }


    // ------------------------------------------------------
    // SAFE LONG-TAIL INTENTS
    // ------------------------------------------------------

    const longTail = [

        productClean +
        " for sale",

        productClean +
        " online store",

        productClean +
        " shopping online",

        productClean +
        " purchase online",

        productClean +
        " buying online"

    ];


    for (
        const candidate of
        longTail
    ) {

        if (
            output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


        addUniqueKeyword(

            output,

            candidate,

            productClean,
            brand,
            productClean,
            productDetails,
            0.82

        );

    }


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
    marketplace,
    productDetails
) {

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword,
            product,
            brand
        );


    // ------------------------------------------------------
    // STEP 1
    // Backend keywords
    // ------------------------------------------------------

    let output =
        filterBackendKeywords(

            aiKeywords,

            product,

            brand,

            safeMain,

            productDetails

        );


    // ------------------------------------------------------
    // STEP 2
    // Always ensure main keyword
    // ------------------------------------------------------

    const mainNormalized =
        normalizeKeyword(
            safeMain
        );


    if (
        safeMain &&
        !output.some(
            item =>
                normalizeKeyword(item) ===
                mainNormalized
        )
    ) {

        output.unshift(
            safeMain
        );

    }


    // ------------------------------------------------------
    // STEP 3
    // Safe local fallback
    // ------------------------------------------------------

    if (
        output.length <
        MIN_ACCEPTABLE_KEYWORDS
    ) {

        const fallback =
            buildSafeFallbackKeywords(

                product,

                category,

                marketplace,

                brand,

                productDetails

            );


        for (
            const keyword of fallback
        ) {

            if (
                output.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            addUniqueKeyword(

                output,

                keyword,

                product,

                brand,

                safeMain,

                productDetails,

                0.82

            );

        }

    }


    // ------------------------------------------------------
    // STEP 4
    // Rebuild with strict uniqueness
    // ------------------------------------------------------

    const finalOutput = [];


    // Main keyword first
    if (safeMain) {

        finalOutput.push(
            safeMain
        );

    }


    for (
        const keyword of output
    ) {

        if (
            finalOutput.length >=
            MAX_KEYWORDS
        ) {

            break;

        }


        if (
            normalizeKeyword(keyword) ===
            mainNormalized
        ) {

            continue;

        }


        addUniqueKeyword(

            finalOutput,

            keyword,

            product,

            brand,

            safeMain,

            productDetails,

            0.72

        );

    }


    // ------------------------------------------------------
    // STEP 5
    // If still fewer than 20, add safe fallback
    // ------------------------------------------------------

    if (
        finalOutput.length <
        MAX_KEYWORDS
    ) {

        const fallback =
            buildSafeFallbackKeywords(

                product,

                category,

                marketplace,

                brand,

                productDetails

            );


        for (
            const keyword of fallback
        ) {

            if (
                finalOutput.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            addUniqueKeyword(

                finalOutput,

                keyword,

                product,

                brand,

                safeMain,

                productDetails,

                0.72

            );

        }

    }


    // ------------------------------------------------------
    // STEP 6
    // Final maximum
    // ------------------------------------------------------

    return finalOutput.slice(
        0,
        MAX_KEYWORDS
    );

}


// ==========================================================
// EXTRACT RESPONSE
// ==========================================================

function extractKeywordsFromResponse(
    data
) {

    if (!data) {

        return [];

    }


    // Direct array
    if (
        Array.isArray(data)
    ) {

        return data;

    }


    // Common fields
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
        const field of fields
    ) {

        if (
            Array.isArray(
                data[field]
            )
        ) {

            return data[field];

        }

    }


    // Nested result
    if (
        data.result &&
        typeof data.result ===
        "object"
    ) {

        return extractKeywordsFromResponse(
            data.result
        );

    }


    // Nested data
    if (
        data.data &&
        typeof data.data ===
        "object"
    ) {

        return extractKeywordsFromResponse(
            data.data
        );

    }


    // Text
    if (
        typeof data ===
        "string"
    ) {

        return data

            .split(/\r?\n/)

            .map(
                line =>
                    cleanKeyword(line)
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
            "❌ SEO 15.0: Required HTML element missing."
        );


        if (status) {

            status.innerText =
                "❌ SEO form में required HTML element missing है।";

        }


        return;

    }


    // ======================================================
    // READ INPUT
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


    // Optional details
    const productDetailsElement =
        document.getElementById(
            "productDetails"
        );


    const productDetails =
        productDetailsElement
            ? cleanInput(
                productDetailsElement.value
            )
            : "";


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
    // UI
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
            productDetails,

        mainKeyword:
            finalMainKeyword,

        marketplace:
            marketplace,

        keywordCount:
            REQUESTED_KEYWORDS,

        maxKeywords:
            MAX_KEYWORDS,

        minKeywords:
            MIN_ACCEPTABLE_KEYWORDS,

        requestedKeywordCount:
            REQUESTED_KEYWORDS,

        // Explicit instructions for compatible backends
        seoInstructions: [

            "Generate up to 20 genuinely useful SEO search phrases.",

            "Do not repeat the same phrase with meaningless suffixes.",

            "Do not invent product specifications.",

            "Use only seller-provided facts.",

            "Do not invent color, size, material, pattern, gender, occasion or features.",

            "Avoid generic filler words.",

            "Avoid excessive brand usage.",

            "Keep the main keyword first.",

            "Prefer natural search intent and useful long-tail phrases.",

            "Do not generate duplicate or near-duplicate keywords."

        ]

    };


    console.log(
        "========================================"
    );


    console.log(
        "SEO GENERATOR — VERSION 15.0"
    );


    console.log(
        "REQUEST:",
        requestData
    );


    console.log(
        "========================================"
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
            "SEO HTTP STATUS:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "SEO RAW RESPONSE:",
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
        // FINAL KEYWORDS
        // ==================================================

        const keywords =
            finalizeKeywords(

                aiKeywords,

                product,

                category,

                brand,

                finalMainKeyword,

                marketplace,

                productDetails

            );


        console.log(
            "FINAL SEO 15.0:",
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
        // STATUS
        // ==================================================

        showStatus(

            "✅ " +
            keywords.length +
            " SEO keywords generated successfully."

        );


        console.log(
            "✅ SEO GENERATOR 15.0 COMPLETE"
        );

    }
    catch (error) {

        console.error(
            "❌ SEO 15.0 ERROR:",
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
    // FALLBACK COPY
    // ======================================================

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
    "🚀 AI Seller Toolkit SEO Generator 15.0 Ready"
);
