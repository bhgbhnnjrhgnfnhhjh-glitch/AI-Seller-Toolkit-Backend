// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 14.2 FIXED
// ==========================================================
//
// FINAL FIX:
// ----------------------------------------------------------
// ✅ Fix: only 1 keyword problem
// ✅ Supports backend arrays
// ✅ Supports backend text/output/content/result formats
// ✅ Supports JSON-string responses
// ✅ Supports numbered text responses
// ✅ Main keyword always #1
// ✅ Minimum 12 keywords
// ✅ Maximum 20 keywords
// ✅ Safe local fallback
// ✅ No invented product specifications
// ✅ No fake colors
// ✅ No fake material
// ✅ No fake size
// ✅ No fake features
// ✅ No unsupported claims
// ✅ Duplicate protection
// ✅ Near-duplicate protection
// ✅ Product-fragment protection
// ✅ Brand stuffing protection
// ✅ Generic keyword protection
// ✅ Marketplace-aware keywords
// ✅ Category-aware keywords
// ✅ Copy button protection
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

// Minimum desired keywords
const MIN_KEYWORDS = 12;


// ==========================================================
// PAGE READY
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

        .replace(
            /^\uFEFF/,
            ""
        )

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


    // Remove markdown bullets
    text =
        text.replace(
            /^\s*[-•*]\s*/,
            ""
        );


    // Remove numbering
    text =
        text.replace(
            /^\s*\d+\s*[\.\)\-:]\s*/,
            ""
        );


    // Remove quotes
    text =
        text.replace(
            /^["'“”‘’]+|["'“”‘’]+$/g,
            ""
        );


    // Remove markdown bold
    text =
        text.replace(
            /\*\*/g,
            ""
        );


    // Remove extra spaces
    text =
        text.replace(
            /\s+/g,
            " "
        );


    return text.trim();

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
// PRODUCT FRAGMENT PROTECTION
// ==========================================================
//
// Product:
// Cotton Tshirt
//
// ❌ Tshirt
// ❌ Cotton
//
// Product itself:
// ✅ Cotton Tshirt
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


    // Exact product is always allowed
    if (
        keywordNormalized ===
        productNormalized
    ) {

        return false;

    }


    // Single-word part of multi-word product
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
    // Cotton Tshirt
    //
    // Brand:
    // Test Brand Cotton Tshirt
    //
    // Effective brand:
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
// BRAND STUFFING PROTECTION
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


    let matched =
        0;


    B.forEach(
        function (token) {

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


    let intersection =
        0;


    A.forEach(
        function (token) {

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


    // Do not use brand as main keyword
    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }


    // Do not use product fragment
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
// GENERIC KEYWORD PROTECTION
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

        "online shopping",

        "buy",

        "shop",

        "sale",

        "best",

        "new",

        "latest",

        "trending",

        "quality",

        "good quality",

        "cheap",

        "cheap price",

        "best product",

        "best products",

        "buy online",

        "shop online"

    ];


    return genericWords.includes(
        normalized
    );

}


// ==========================================================
// UNIQUE KEYWORD ADDER
// ==========================================================

function addUniqueKeyword(
    output,
    keyword,
    product,
    brand,
    allowMain
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


    if (!normalized) {

        return false;

    }


    // Exact duplicate
    if (
        output.some(
            function (item) {

                return (
                    normalizeKeyword(
                        item
                    ) === normalized
                );

            }
        )
    ) {

        return false;

    }


    // Generic keyword
    if (
        !allowMain &&
        isGenericKeyword(
            clean
        )
    ) {

        return false;

    }


    // Product fragment
    if (
        !allowMain &&
        isProductFragment(
            clean,
            product
        )
    ) {

        return false;

    }


    // Brand stuffing
    if (
        !allowMain &&
        isBrandStuffed(
            clean,
            brand,
            product
        )
    ) {

        return false;

    }


    // Near duplicate
    if (
        !allowMain &&
        output.some(
            function (existing) {

                return (
                    similarity(
                        existing,
                        clean
                    ) >= 0.90
                );

            }
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
// EXTRACT KEYWORDS FROM ANY BACKEND RESPONSE
// ==========================================================
//
// यह सबसे important FIX है.
//
// Backend अगर:
//
// keywords: []
// seoKeywords: []
// output: "..."
// text: "..."
// content: "..."
// result: {}
// data: {}
//
// इनमें से कुछ भी भेजे,
// frontend उसे पढ़ने की कोशिश करेगा.
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


    // ======================================================
    // DIRECT ARRAY
    // ======================================================

    if (
        Array.isArray(data)
    ) {

        return data

            .flat(
                10
            )

            .map(
                item =>
                    cleanKeyword(
                        item
                    )
            )

            .filter(Boolean);

    }


    // ======================================================
    // STRING
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


        // Try JSON first
        try {

            const parsed =
                JSON.parse(
                    text
                );


            if (
                parsed !== data
            ) {

                const extracted =
                    extractKeywordsFromResponse(
                        parsed
                    );


                if (
                    extracted.length
                ) {

                    return extracted;

                }

            }

        }
        catch (error) {

            // Normal text response
        }


        // Convert text lines
        return text

            .split(/\r?\n/)

            .map(
                line =>
                    cleanKeyword(
                        line
                    )
            )

            .filter(
                line => {

                    if (!line) {

                        return false;

                    }


                    const n =
                        normalizeKeyword(
                            line
                        );


                    // Remove common headings
                    if (
                        n ===
                        "seo keywords"
                    ) {

                        return false;

                    }


                    if (
                        n ===
                        "generated seo keywords"
                    ) {

                        return false;

                    }


                    if (
                        n ===
                        "keywords"
                    ) {

                        return false;

                    }


                    return true;

                }
            );

    }


    // ======================================================
    // OBJECT
    // ======================================================

    if (
        typeof data ===
        "object"
    ) {

        const fields = [

            "keywords",

            "seoKeywords",

            "seo_keywords",

            "keywordList",

            "keyword_list",

            "results",

            "output",

            "text",

            "content",

            "response",

            "answer",

            "generatedKeywords",

            "generated_keywords"

        ];


        for (
            const field of fields
        ) {

            if (
                data[field] !==
                undefined &&
                data[field] !==
                null
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
// FILTER AI KEYWORDS
// ==========================================================

function filterAIKeywords(
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


    if (safeMain) {

        addUniqueKeyword(
            output,
            safeMain,
            product,
            brand,
            true
        );

    }


    if (
        !Array.isArray(
            keywords
        )
    ) {

        return output;

    }


    for (
        const keyword of keywords
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


        // Main keyword
        if (
            normalized ===
            mainNormalized
        ) {

            continue;

        }


        addUniqueKeyword(
            output,
            clean,
            product,
            brand,
            false
        );

    }


    return output;

}


// ==========================================================
// SAFE FALLBACK KEYWORDS
// ==========================================================
//
// IMPORTANT:
//
// यह unsupported product facts नहीं बनाता.
//
// Product:
// Cotton Tshirt
//
// Safe:
//
// Cotton Tshirt online
// Cotton Tshirt shopping
// Cotton Tshirt collection
// Cotton Tshirt design
// Cotton Tshirt styles
// Buy Cotton Tshirt
// Shop Cotton Tshirt
//
// कोई color / size / pattern / feature invent नहीं होगा.
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


    function add(
        candidate
    ) {

        if (
            output.length >=
            MAX_KEYWORDS
        ) {

            return;

        }


        addUniqueKeyword(
            output,
            candidate,
            productClean,
            brand,
            false
        );

    }


    // ======================================================
    // PRODUCT + SAFE SEARCH INTENT
    // ======================================================

    add(
        productClean +
        " online"
    );


    add(
        productClean +
        " shopping"
    );


    add(
        productClean +
        " online shopping"
    );


    add(
        "buy " +
        productClean
    );


    add(
        "shop " +
        productClean
    );


    add(
        "buy " +
        productClean +
        " online"
    );


    add(
        "shop " +
        productClean +
        " online"
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
        " designs"
    );


    add(
        productClean +
        " style"
    );


    add(
        productClean +
        " styles"
    );


    add(
        productClean +
        " latest collection"
    );


    add(
        productClean +
        " price"
    );


    // ======================================================
    // MARKETPLACE
    // ======================================================

    const market =
        cleanInput(
            marketplace
        );


    if (market) {

        add(
            productClean +
            " on " +
            market
        );


        add(
            market +
            " " +
            productClean
        );


        add(
            productClean +
            " " +
            market
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

        add(
            productClean +
            " " +
            categoryClean
        );


        add(
            categoryClean +
            " " +
            productClean
        );

    }


    // ======================================================
    // SAFE SEARCH PHRASES
    // ======================================================

    add(
        productClean +
        " for shopping"
    );


    add(
        productClean +
        " online store"
    );


    add(
        productClean +
        " shopping online"
    );


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


    // ======================================================
    // STEP 1
    // AI KEYWORDS
    // ======================================================

    let finalKeywords =
        filterAIKeywords(
            aiKeywords,
            product,
            brand,
            safeMain
        );


    console.log(
        "AI FILTERED KEYWORDS:",
        finalKeywords
    );


    // ======================================================
    // STEP 2
    // FALLBACK
    // ======================================================

    if (
        finalKeywords.length <
        MIN_KEYWORDS
    ) {

        const fallback =
            buildSafeFallbackKeywords(
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


            addUniqueKeyword(
                finalKeywords,
                keyword,
                product,
                brand,
                false
            );

        }

    }


    // ======================================================
    // STEP 3
    // HARD GUARANTEE
    // ======================================================
    //
    // अगर ऊपर के सारे filters के बाद भी
    // 12 से कम हैं, तो product-based safe phrases
    // से list पूरी की जाएगी.
    //
    // ======================================================

    const emergencyPhrases = [

        "online " +
        product,

        product +
        " online store",

        product +
        " shopping store",

        product +
        " shopping online",

        "buy " +
        product,

        "shop " +
        product,

        product +
        " collection",

        product +
        " design",

        product +
        " designs",

        product +
        " style",

        product +
        " styles",

        product +
        " price",

        product +
        " online shopping",

        "buy " +
        product +
        " online",

        "shop " +
        product +
        " online",

        product +
        " latest collection",

        product +
        " store",

        product +
        " shopping",

        product +
        " marketplace"

    ];


    for (
        const phrase of emergencyPhrases
    ) {

        if (
            finalKeywords.length >=
            MIN_KEYWORDS
        ) {

            break;

        }


        addUniqueKeyword(
            finalKeywords,
            phrase,
            product,
            brand,
            false
        );

    }


    // ======================================================
    // STEP 4
    // MAIN KEYWORD AGAIN
    // ======================================================

    const mainNormalized =
        normalizeKeyword(
            safeMain
        );


    // Remove main if already present
    finalKeywords =
        finalKeywords.filter(
            function (keyword) {

                return (
                    normalizeKeyword(
                        keyword
                    ) !==
                    mainNormalized
                );

            }
        );


    // Main ALWAYS first
    if (safeMain) {

        finalKeywords.unshift(
            safeMain
        );

    }


    // ======================================================
    // STEP 5
    // REMOVE DUPLICATES ONE FINAL TIME
    // ======================================================

    const uniqueFinal = [];


    const seen =
        new Set();


    for (
        const keyword of finalKeywords
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


        uniqueFinal.push(
            clean
        );

    }


    // ======================================================
    // STEP 6
    // MAIN FIRST
    // ======================================================

    const mainIndex =
        uniqueFinal.findIndex(
            function (keyword) {

                return (
                    normalizeKeyword(
                        keyword
                    ) ===
                    mainNormalized
                );

            }
        );


    if (
        mainIndex > 0
    ) {

        const mainItem =
            uniqueFinal.splice(
                mainIndex,
                1
            )[0];


        uniqueFinal.unshift(
            mainItem
        );

    }


    // ======================================================
    // STEP 7
    // MAX 20
    // ======================================================

    return uniqueFinal.slice(
        0,
        MAX_KEYWORDS
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
    // HTML ELEMENT CHECK
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
            "❌ SEO Generator: Required HTML element missing."
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
            MAX_KEYWORDS,

        requestedKeywords:
            MAX_KEYWORDS

    };


    console.log(
        "======================================"
    );


    console.log(
        "SEO GENERATOR 14.2 FIXED REQUEST"
    );


    console.log(
        requestData
    );


    console.log(
        "======================================"
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
            "SEO RAW RESPONSE:",
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

            // Backend may return plain text
            data =
                responseText;

        }


        // ==================================================
        // HTTP ERROR
        // ==================================================

        if (!response.ok) {

            throw new Error(

                data &&
                typeof data === "object" &&
                data.error

                    ? data.error

                    : "Backend Error HTTP " +
                      response.status

            );

        }


        // ==================================================
        // BACKEND SUCCESS FALSE
        // ==================================================

        if (
            data &&
            typeof data === "object" &&
            data.success === false
        ) {

            throw new Error(

                data.error ||
                "SEO keywords generate नहीं हुए।"

            );

        }


        // ==================================================
        // EXTRACT
        // ==================================================

        const aiKeywords =
            extractKeywordsFromResponse(
                data
            );


        console.log(
            "EXTRACTED AI KEYWORDS:",
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
            "======================================"
        );


        console.log(
            "FINAL SEO KEYWORDS:",
            keywords
        );


        console.log(
            "FINAL COUNT:",
            keywords.length
        );


        console.log(
            "======================================"
        );


        // ==================================================
        // EMPTY PROTECTION
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
        // SUCCESS
        // ==================================================

        showStatus(

            "✅ " +
            keywords.length +
            " SEO keywords generated successfully."

        );


    }
    catch (error) {

        console.error(
            "❌ SEO GENERATOR ERROR:",
            error
        );


        // ==================================================
        // EVEN IF API FAILS
        // SAFE LOCAL FALLBACK
        // ==================================================

        try {

            const emergency =
                finalizeKeywords(

                    [],

                    product,

                    category,

                    brand,

                    finalMainKeyword,

                    marketplace

                );


            if (
                emergency.length
            ) {

                result.value =
                    emergency
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

                    "⚠️ AI response नहीं मिला, safe SEO keywords तैयार किए गए।"

                );


                console.log(
                    "⚠️ LOCAL FALLBACK KEYWORDS:",
                    emergency
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
        catch (fallbackError) {

            console.error(
                "❌ FALLBACK ERROR:",
                fallbackError
            );


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
    "🚀 AI Seller Toolkit SEO Generator 14.2 FIXED Ready"
);
