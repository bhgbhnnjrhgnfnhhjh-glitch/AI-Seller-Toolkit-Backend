// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 14.2
// ==========================================================
//
// Backend:
// AI Seller Toolkit Backend v14.1+
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
// FINAL 14.2 SEO FIX
//
// FIXES:
// - Product Name always primary
// - Product + Brand factual combinations allowed
// - Brand/Product overlap handled correctly
// - Seller facts sent to backend
// - Dynamic product fields collected
// - Duplicate protection
// - Near duplicate protection
// - Product fragment protection
// - Unsupported keyword protection
// - Generic filler protection
// - Maximum 20 keywords
// - Main keyword always first
// - Safe local fallback
// - No invented gender
// - No invented occasion
// - No invented features
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
        normalizeKeyword(keyword);

    const productNormalized =
        normalizeKeyword(product);

    // Exact product name is ALWAYS valid.
    if (
        keywordNormalized ===
        productNormalized
    ) {

        return false;

    }

    // Example:
    //
    // Product = Cotton Kurti
    // Kurti = INVALID
    // Cotton = INVALID
    //

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
// Brand:
// Test Brand Cotton Kurti
//
// Product:
// Cotton Kurti
//
// Effective Brand:
// Test Brand
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
// BRAND + PRODUCT CHECK
// ==========================================================

function isSuppliedBrandProductCombination(
    keyword,
    brand,
    product
) {

    const K =
        normalizeKeyword(keyword);

    const P =
        normalizeKeyword(product);

    const B =
        normalizeKeyword(brand);

    if (
        !K ||
        !P ||
        !B
    ) {

        return false;

    }

    // Exact supplied brand
    // plus exact product.
    //
    // Example:
    //
    // Brand:
    // Test Brand Cotton Kurti
    //
    // Product:
    // Cotton Kurti
    //
    // Keyword:
    // Test Brand Cotton Kurti
    //
    // VALID.

    const effectiveBrand =
        getEffectiveBrand(
            brand,
            product
        );

    if (!effectiveBrand) {

        return false;

    }

    const E =
        normalizeKeyword(
            effectiveBrand
        );

    if (!E) {

        return false;

    }

    const expected1 =
        `${E} ${P}`
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    const expected2 =
        `${P} ${E}`
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    return (
        K === expected1 ||
        K === expected2
    );

}


// ==========================================================
// BRAND STUFFING CHECK
// ==========================================================
//
// Important:
// Exact seller-supplied Brand + Product combination
// is allowed.
//
// Unnecessary repeated brand is rejected.
//
// Example:
//
// Test Brand Test Brand Cotton Kurti
// INVALID
//
// Test Brand Cotton Kurti
// VALID
// ==========================================================

function isBrandStuffed(
    keyword,
    brand,
    product
) {

    const normalizedKeyword =
        normalizeKeyword(keyword);

    const effectiveBrand =
        getEffectiveBrand(
            brand,
            product
        );

    if (
        !normalizedKeyword ||
        !effectiveBrand
    ) {

        return false;

    }

    // Exact factual Brand + Product
    // is allowed.
    if (
        isSuppliedBrandProductCombination(
            keyword,
            brand,
            product
        )
    ) {

        return false;

    }

    const K =
        tokenSet(normalizedKeyword);

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

    // Full brand plus extra unnecessary text
    // can be stuffing.
    if (
        count === B.size
    ) {

        // If brand appears more than once,
        // definitely reject.
        const keywordTokens =
            normalizedKeyword.split(" ");

        const brandTokens =
            effectiveBrand.split(" ");

        let repeated = false;

        brandTokens.forEach(
            brandToken => {

                const occurrences =
                    keywordTokens.filter(
                        token =>
                            token === brandToken
                    ).length;

                if (
                    occurrences > 1
                ) {

                    repeated = true;

                }

            }
        );

        if (repeated) {

            return true;

        }

    }

    return false;

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
// GENERIC FILLER WORDS
// ==========================================================

const SEO_FILLER_WORDS =
    new Set([

        "online",
        "collection",
        "store",
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
        "top",
        "amazing",
        "perfect",
        "awesome"

    ]);


// ==========================================================
// GENERIC KEYWORD CHECK
// ==========================================================

function isGenericKeyword(
    keyword,
    product
) {

    const normalized =
        normalizeKeyword(keyword);

    if (!normalized) {

        return true;

    }

    const tokens =
        normalized.split(" ");

    const productTokens =
        tokenSet(product);

    if (!tokens.length) {

        return true;

    }

    let useful = 0;

    for (
        const token of tokens
    ) {

        if (
            productTokens.has(token)
        ) {

            useful++;

            continue;

        }

        if (
            !SEO_FILLER_WORDS.has(token)
        ) {

            useful++;

        }

    }

    return useful === 0;

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

    // Product name is safest.
    if (
        mainNormalized ===
        productNormalized
    ) {

        return productClean;

    }

    // Reject one-word product fragment.
    if (
        isProductFragment(
            mainClean,
            productClean
        )
    ) {

        return productClean;

    }

    // If main keyword is an unnecessary
    // brand + partial product combination,
    // use Product Name.
    if (
        isBrandStuffed(
            mainClean,
            brand,
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
            normalizeKeyword(clean);

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
            normalizeKeyword(keyword);

        if (!normalized) {

            continue;

        }

        const isMain =
            normalized ===
            mainNormalized;

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
            isGenericKeyword(
                keyword,
                product
            )
        ) {

            continue;

        }

        // --------------------------------------------------
        // Near duplicate
        // --------------------------------------------------

        const nearDuplicate =
            output.some(
                existing => {

                    const existingNormalized =
                        normalizeKeyword(
                            existing
                        );

                    // Exact
                    if (
                        existingNormalized ===
                        normalized
                    ) {

                        return true;

                    }

                    // Same token set
                    const A =
                        tokenSet(existing);

                    const B =
                        tokenSet(keyword);

                    if (
                        A.size === B.size
                    ) {

                        let same = true;

                        A.forEach(
                            token => {

                                if (
                                    !B.has(token)
                                ) {

                                    same = false;

                                }

                            }
                        );

                        if (same) {

                            return true;

                        }

                    }

                    return (
                        similarity(
                            existing,
                            keyword
                        ) >= 0.90
                    );

                }
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
// COLLECT SELLER FACTS FROM HTML
// ==========================================================
//
// This is important in Version 14.2.
//
// SEO page अब सिर्फ Product + Brand नहीं,
// बल्कि उपलब्ध seller input fields भी backend को भेजेगा.
// ==========================================================

function collectSellerFacts() {

    const data = {};

    const possibleFields = [

        "material",
        "fabric",
        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity",

        "model",

        "ingredients",
        "fragrance",
        "shade",

        "compatibility",
        "battery",
        "capacity",
        "ports",
        "power",

        "design",
        "usage",

        "closure",
        "sole",

        "stone",
        "plating",

        "ageRange",

        "author",
        "language",
        "genre",
        "edition",
        "publisher",
        "isbn",

        "petType",

        "sport",

        "vehicleCompatibility",

        "flavor",
        "packaging",

        "personalization",

        "sleeve",
        "neckline",

        "type"

    ];

    possibleFields.forEach(
        function (field) {

            const element =
                document.getElementById(field);

            if (!element) {

                return;

            }

            const value =
                cleanInput(
                    element.value
                );

            if (value) {

                data[field] =
                    value;

            }

        }
    );

    return data;

}


// ==========================================================
// SAFE LOCAL FALLBACK KEYWORDS
// ==========================================================
//
// AI कम keywords दे तो हम केवल seller facts
// से factual combinations बनाएंगे.
//
// कोई नया attribute invent नहीं होगा.
// ==========================================================

function buildLocalFallbackKeywords(
    product,
    brand,
    mainKeyword,
    sellerFacts
) {

    const candidates = [];

    const safeProduct =
        cleanInput(product);

    const safeBrand =
        cleanInput(brand);

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword ||
            safeProduct,
            safeProduct,
            safeBrand
        );

    // ------------------------------------------------------
    // 1. Main keyword
    // ------------------------------------------------------

    if (safeMain) {

        candidates.push(
            safeMain
        );

    }

    // ------------------------------------------------------
    // 2. Product Name
    // ------------------------------------------------------

    if (safeProduct) {

        candidates.push(
            safeProduct
        );

    }

    // ------------------------------------------------------
    // 3. Brand + Product
    // ------------------------------------------------------

    const effectiveBrand =
        getEffectiveBrand(
            safeBrand,
            safeProduct
        );

    if (
        effectiveBrand &&
        safeProduct
    ) {

        candidates.push(
            `${effectiveBrand} ${safeProduct}`
        );

        candidates.push(
            `${safeProduct} ${effectiveBrand}`
        );

    }

    // ------------------------------------------------------
    // 4. Seller supplied attributes
    // ------------------------------------------------------

    const attributeFields = [

        "material",
        "fabric",
        "color",
        "size",
        "pattern",
        "fit",
        "model",
        "capacity",
        "design",
        "closure",
        "sole",
        "stone",
        "plating",
        "ageRange",
        "author",
        "language",
        "genre",
        "edition",
        "publisher",
        "petType",
        "sport",
        "vehicleCompatibility",
        "flavor",
        "packaging",
        "sleeve",
        "neckline",
        "type"

    ];

    attributeFields.forEach(
        function (field) {

            const value =
                sellerFacts &&
                sellerFacts[field]
                    ? cleanInput(
                        sellerFacts[field]
                    )
                    : "";

            if (!value) {

                return;

            }

            candidates.push(
                `${value} ${safeProduct}`
            );

        }
    );

    // ------------------------------------------------------
    // 5. Final filter
    // ------------------------------------------------------

    return filterFrontendKeywords(
        candidates,
        safeProduct,
        safeBrand,
        safeMain
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
            "❌ SEO Generator 14.2: Required HTML element missing."
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
    // MAIN KEYWORD
    // ========================================================

    const finalMainKeyword =
        sanitizeMainKeyword(

            mainKeywordInput ||
            product,

            product,

            brand

        );


    // ========================================================
    // COLLECT SELLER FACTS
    // ========================================================

    const sellerFacts =
        collectSellerFacts();


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
    // REQUEST DATA
    // ========================================================

    const requestData = {

        category:
            category,

        productName:
            product,

        brand:
            brand,

        productDetails:
            sellerFacts,

        mainKeyword:
            finalMainKeyword,

        marketplace:
            marketplace

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
        // FRONTEND FILTER
        // ====================================================

        keywords =
            filterFrontendKeywords(

                keywords,

                product,

                brand,

                finalMainKeyword

            );


        // ====================================================
        // LOCAL FACTUAL FALLBACK
        // ====================================================
        //
        // अगर AI सिर्फ Product Name लौटाता है,
        // तो seller facts से safe keywords बनाए जाएंगे.
        // ====================================================

        if (
            keywords.length <= 1
        ) {

            const localKeywords =
                buildLocalFallbackKeywords(

                    product,

                    brand,

                    finalMainKeyword,

                    sellerFacts

                );


            if (
                localKeywords.length >
                keywords.length
            ) {

                keywords =
                    localKeywords;

            }

        }


        // ====================================================
        // MAIN KEYWORD SAFETY
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
        // REMOVE DUPLICATES
        // ====================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ====================================================
        // MAIN FIRST
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
        // FINAL FILTER AGAIN
        // ====================================================

        keywords =
            filterFrontendKeywords(

                keywords,

                product,

                brand,

                safeMain

            );


        // ====================================================
        // FINAL MAIN FIRST
        // ====================================================

        const finalMainNormalized =
            normalizeKeyword(
                safeMain
            );

        const finalMainIndex =
            keywords.findIndex(
                item =>
                    normalizeKeyword(item) ===
                    finalMainNormalized
            );


        if (
            finalMainIndex > 0
        ) {

            const mainItem =
                keywords.splice(
                    finalMainIndex,
                    1
                )[0];

            keywords.unshift(
                mainItem
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
        // FINAL FALLBACK
        // ====================================================

        if (
            !keywords.length
        ) {

            keywords =
                buildLocalFallbackKeywords(

                    product,

                    brand,

                    safeMain,

                    sellerFacts

                );

        }


        // ====================================================
        // EMPTY CHECK
        // ====================================================

        if (
            !keywords.length
        ) {

            throw new Error(
                "कोई factual SEO keyword नहीं मिला।"
            );

        }


        // ====================================================
        // DISPLAY
        // ========================================================

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
            "✅ FINAL SEO KEYWORDS 14.2:",
            keywords
        );

    }
    catch (error) {

        console.error(
            "❌ SEO GENERATOR 14.2 ERROR:",
            error
        );


        // ====================================================
        // OFFLINE / API ERROR FALLBACK
        // ====================================================

        const fallbackKeywords =
            buildLocalFallbackKeywords(

                product,

                brand,

                finalMainKeyword,

                sellerFacts

            );


        if (
            fallbackKeywords.length
        ) {

            result.value =
                fallbackKeywords
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

                "⚠️ AI unavailable. Seller facts से safe SEO keywords बनाए गए."

            );

            console.log(
                "⚠️ LOCAL SEO FALLBACK:",
                fallbackKeywords
            );

        }
        else {

            result.value =

                "❌ SEO Keywords generate नहीं हो सके.\n\n" +
                "Error: " +
                error.message;


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
