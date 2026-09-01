// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 14.0
// ==========================================================
//
// Backend:
// AI Seller Toolkit Backend v14.0
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
// VERSION 14.0 FIXES
// ==========================================================
//
// 1. Product Name cleaning
// 2. Main Keyword cleaning
// 3. Main Keyword optional
// 4. Product Name fallback
// 5. Main Keyword always FIRST
// 6. Numbered-list cleanup
// 7. Bullet cleanup
// 8. Duplicate protection
// 9. Near-duplicate protection
// 10. Maximum 20 keywords
// 11. Empty response protection
// 12. Stable backend response handling
// 13. No generated data written into input fields
// 14. Brand/category stuffing protection
// 15. Filler keyword protection
// 16. Better frontend validation
// 17. Better error handling
// 18. Copy fallback
// 19. Enter-key protection
// 20. Render API compatibility
// ==========================================================


// ==========================================================
// API CONFIG
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const SEO_API =
    API_URL + "/api/generate-seo";


// ==========================================================
// GLOBAL CONFIG
// ==========================================================

const MAX_KEYWORDS = 20;


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


        // ------------------------------------------------------
        // GENERATE BUTTON
        // ------------------------------------------------------

        if (generateBtn) {

            generateBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    generateSEO();

                }
            );

        }


        // ------------------------------------------------------
        // COPY BUTTON
        // ------------------------------------------------------

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
            "=================================================="
        );

        console.log(
            "🚀 AI Seller Toolkit SEO Generator 14.0"
        );

        console.log(
            "Backend:",
            SEO_API
        );

        console.log(
            "=================================================="
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

        // ----------------------------------------------------
        // Remove numbered list prefix
        //
        // 1. Cotton Kurti
        // 2) Cotton Kurti
        // 3- Cotton Kurti
        // 4: Cotton Kurti
        // ----------------------------------------------------

        .replace(
            /^\s*\d+\s*[\.\)\-:]\s*/u,
            ""
        )

        // ----------------------------------------------------
        // Remove bullet
        // ----------------------------------------------------

        .replace(
            /^\s*[-•*]\s*/u,
            ""
        )

        // ----------------------------------------------------
        // Remove surrounding quotes
        // ----------------------------------------------------

        .replace(
            /^["']|["']$/g,
            ""
        )

        // ----------------------------------------------------
        // Remove repeated spaces
        // ----------------------------------------------------

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

        // Apostrophes
        .replace(
            /['’]/g,
            ""
        )

        // Hyphen / slash / underscore
        .replace(
            /[-_/]/g,
            " "
        )

        // Remove punctuation
        .replace(
            /[^a-z0-9\s]/g,
            ""
        )

        // ----------------------------------------------------
        // Common spelling normalization
        // ----------------------------------------------------

        .replace(
            /\bt[\s-]*shirt\b/g,
            "tshirt"
        )

        .replace(
            /\bt shirt\b/g,
            "tshirt"
        )

        .replace(
            /\btshirt\b/g,
            "tshirt"
        )

        // Repeated spaces
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

        // Number prefix
        .replace(
            /^\s*\d+\s*[\.\)\-:]\s*/u,
            ""
        )

        // Bullet
        .replace(
            /^\s*[-•*]\s*/u,
            ""
        )

        // Quotes
        .replace(
            /^["']|["']$/g,
            ""
        )

        // Repeated spaces
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
        const rawKeyword of
        keywords
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
// TOKEN SET
// ==========================================================

function getTokens(
    text
) {

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
                function (token) {

                    return (
                        token.length > 1
                    );

                }
            )
    );

}


// ==========================================================
// KEYWORD SIMILARITY
// ==========================================================

function keywordSimilarity(
    first,
    second
) {

    const A =
        getTokens(
            first
        );

    const B =
        getTokens(
            second
        );


    if (
        !A.size ||
        !B.size
    ) {

        return 0;

    }


    let intersection = 0;


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
// REMOVE NEAR DUPLICATES
// ==========================================================

function removeNearDuplicates(
    keywords,
    mainKeyword
) {

    const output = [];

    const mainNormalized =
        normalizeKeyword(
            mainKeyword
        );


    for (
        const keyword of
        keywords
    ) {

        const normalized =
            normalizeKeyword(
                keyword
            );


        // Main keyword should always survive
        if (
            normalized ===
            mainNormalized
        ) {

            output.push(
                keyword
            );

            continue;

        }


        let duplicate = false;


        for (
            const existing of
            output
        ) {

            const existingNormalized =
                normalizeKeyword(
                    existing
                );


            // Do not compare against main keyword
            // in a way that removes the main keyword.

            if (
                existingNormalized ===
                mainNormalized
            ) {

                continue;

            }


            if (
                keywordSimilarity(
                    existing,
                    keyword
                ) >= 0.80
            ) {

                duplicate = true;

                break;

            }

        }


        if (!duplicate) {

            output.push(
                keyword
            );

        }

    }


    return output;

}


// ==========================================================
// FILLER WORDS
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
// FILLER KEYWORD CHECK
// ==========================================================

function isFillerKeyword(
    keyword,
    productName,
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


    // Main keyword is ALWAYS allowed
    if (
        normalized ===
        normalizedMain
    ) {

        return false;

    }


    const productTokens =
        getTokens(
            productName
        );

    const mainTokens =
        getTokens(
            mainKeyword
        );


    const tokens =
        normalized
            .split(" ")
            .filter(Boolean);


    if (!tokens.length) {

        return true;

    }


    const meaningfulTokens =
        tokens.filter(
            function (token) {

                return (
                    !SEO_FILLER_WORDS.has(
                        token
                    ) ||
                    productTokens.has(
                        token
                    ) ||
                    mainTokens.has(
                        token
                    )
                );

            }
        );


    return (
        meaningfulTokens.length === 0
    );

}


// ==========================================================
// BRAND STUFFING CHECK
// ==========================================================

function hasUnnecessaryBrandStuffing(
    keyword,
    brand,
    productName,
    mainKeyword
) {

    if (!brand) {

        return false;

    }


    const normalizedKeyword =
        normalizeKeyword(
            keyword
        );

    const normalizedBrand =
        normalizeKeyword(
            brand
        );

    const normalizedProduct =
        normalizeKeyword(
            productName
        );

    const normalizedMain =
        normalizeKeyword(
            mainKeyword
        );


    if (
        !normalizedBrand
    ) {

        return false;

    }


    // Main keyword is allowed
    if (
        normalizedKeyword ===
        normalizedMain
    ) {

        return false;

    }


    // If brand itself is the whole keyword
    if (
        normalizedKeyword ===
        normalizedBrand
    ) {

        return true;

    }


    if (
        !normalizedKeyword.includes(
            normalizedBrand
        )
    ) {

        return false;

    }


    const withoutBrand =
        normalizedKeyword
            .replace(
                normalizedBrand,
                ""
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    // Example:
    // Product = Cotton Kurti
    // Brand = Test Brand
    //
    // "Test Brand Cotton Kurti"
    // can be valid as a brand keyword,
    // but we don't allow it as a duplicate
    // of the product unless it is the Main Keyword.

    if (
        withoutBrand ===
        normalizedProduct
    ) {

        return true;

    }


    return false;

}


// ==========================================================
// CATEGORY STUFFING CHECK
// ==========================================================

function hasUnnecessaryCategoryStuffing(
    keyword,
    category,
    productName,
    mainKeyword
) {

    if (!category) {

        return false;

    }


    const normalizedKeyword =
        normalizeKeyword(
            keyword
        );

    const normalizedCategory =
        normalizeKeyword(
            category
        );

    const normalizedProduct =
        normalizeKeyword(
            productName
        );

    const normalizedMain =
        normalizeKeyword(
            mainKeyword
        );


    if (
        !normalizedCategory
    ) {

        return false;

    }


    // Main keyword always allowed
    if (
        normalizedKeyword ===
        normalizedMain
    ) {

        return false;

    }


    if (
        !normalizedKeyword.includes(
            normalizedCategory
        )
    ) {

        return false;

    }


    const withoutCategory =
        normalizedKeyword
            .replace(
                normalizedCategory,
                ""
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (
        withoutCategory ===
        normalizedProduct
    ) {

        return true;

    }


    if (
        normalizedKeyword ===
        normalizedCategory
    ) {

        return true;

    }


    return false;

}


// ==========================================================
// FINAL FRONTEND KEYWORD FILTER
// ==========================================================

function filterFrontendKeywords(
    keywords,
    productName,
    brand,
    category,
    mainKeyword
) {

    let output = [];

    const main =
        cleanKeyword(
            mainKeyword
        );


    const normalizedMain =
        normalizeKeyword(
            main
        );


    // ------------------------------------------------------
    // First clean
    // ------------------------------------------------------

    output =
        keywords

            .map(
                cleanKeyword
            )

            .filter(Boolean);


    // ------------------------------------------------------
    // Remove exact duplicates
    // ------------------------------------------------------

    output =
        removeDuplicates(
            output
        );


    // ------------------------------------------------------
    // Remove unnecessary filler
    // ------------------------------------------------------

    output =
        output.filter(
            function (keyword) {

                return !isFillerKeyword(
                    keyword,
                    productName,
                    main
                );

            }
        );


    // ------------------------------------------------------
    // Brand stuffing protection
    // ------------------------------------------------------

    output =
        output.filter(
            function (keyword) {

                return !hasUnnecessaryBrandStuffing(
                    keyword,
                    brand,
                    productName,
                    main
                );

            }
        );


    // ------------------------------------------------------
    // Category stuffing protection
    // ------------------------------------------------------

    output =
        output.filter(
            function (keyword) {

                return !hasUnnecessaryCategoryStuffing(
                    keyword,
                    category,
                    productName,
                    main
                );

            }
        );


    // ------------------------------------------------------
    // Near duplicate protection
    // ------------------------------------------------------

    output =
        removeNearDuplicates(
            output,
            main
        );


    // ------------------------------------------------------
    // Ensure Main Keyword
    // ------------------------------------------------------

    if (
        normalizedMain
    ) {

        const existingIndex =
            output.findIndex(
                function (keyword) {

                    return (
                        normalizeKeyword(
                            keyword
                        ) ===
                        normalizedMain
                    );

                }
            );


        if (
            existingIndex === -1
        ) {

            output.unshift(
                main
            );

        }
        else if (
            existingIndex > 0
        ) {

            const mainItem =
                output.splice(
                    existingIndex,
                    1
                )[0];


            output.unshift(
                mainItem
            );

        }

    }


    // ------------------------------------------------------
    // Maximum 20
    // ------------------------------------------------------

    return output.slice(
        0,
        MAX_KEYWORDS
    );

}


// ==========================================================
// BUILD LOCAL FALLBACK KEYWORDS
// ==========================================================
//
// IMPORTANT:
// This fallback uses ONLY seller input.
//
// It never invents:
// - color
// - material
// - size
// - benefit
// - feature
// - compatibility
// ==========================================================

function buildFallbackKeywords(
    product,
    brand,
    category,
    mainKeyword
) {

    const candidates = [];


    const cleanProduct =
        cleanInput(
            product
        );

    const cleanBrand =
        cleanInput(
            brand
        );

    const cleanCategory =
        cleanInput(
            category
        );

    const cleanMain =
        cleanInput(
            mainKeyword ||
            cleanProduct
        );


    // ------------------------------------------------------
    // MAIN KEYWORD
    // ------------------------------------------------------

    if (
        cleanMain
    ) {

        candidates.push(
            cleanMain
        );

    }


    // ------------------------------------------------------
    // PRODUCT NAME
    // ------------------------------------------------------

    if (
        cleanProduct
    ) {

        candidates.push(
            cleanProduct
        );

    }


    // ------------------------------------------------------
    // Brand + Product
    //
    // Only if Main Keyword is not already
    // the same combination.
    // ------------------------------------------------------

    if (
        cleanBrand &&
        cleanProduct
    ) {

        const brandProduct =
            `${cleanBrand} ${cleanProduct}`;


        if (
            normalizeKeyword(
                brandProduct
            ) !==
            normalizeKeyword(
                cleanMain
            )
        ) {

            candidates.push(
                brandProduct
            );

        }

    }


    // ------------------------------------------------------
    // Product + Category
    //
    // Category is classification information,
    // so this is NOT automatically added.
    //
    // Therefore intentionally omitted.
    // ------------------------------------------------------


    return filterFrontendKeywords(
        candidates,
        cleanProduct,
        cleanBrand,
        cleanCategory,
        cleanMain
    );

}


// ==========================================================
// SHOW STATUS
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
// SET BUTTON STATE
// ==========================================================

function setGeneratingState(
    button,
    generating
) {

    if (!button) {

        return;

    }


    button.disabled =
        generating;


    if (generating) {

        button.innerText =
            "⏳ Generating SEO Keywords...";

    }
    else {

        button.innerText =
            "🤖 Generate SEO Keywords";

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


    // ========================================================
    // REQUIRED ELEMENT CHECK
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
            "❌ SEO Generator 14.0: Required HTML element missing."
        );


        if (status) {

            status.innerText =
                "❌ SEO form में required HTML element missing है।";

        }


        return;

    }


    // ========================================================
    // READ USER INPUT
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
    //
    // If user does not enter Main Keyword:
    //
    // Product Name becomes Main Keyword.
    //
    // Example:
    //
    // Product:
    // Cotton Kurti
    //
    // Main Keyword:
    // Cotton Kurti
    //
    // ========================================================

    const finalMainKeyword =
        mainKeywordInput ||
        product;


    // ========================================================
    // START UI
    // ========================================================

    setGeneratingState(
        generateBtn,
        true
    );


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
            "",

        mainKeyword:
            finalMainKeyword,

        marketplace:
            marketplace

    };


    console.log(
        "=================================================="
    );

    console.log(
        "SEO GENERATOR 14.0 REQUEST"
    );

    console.log(
        requestData
    );

    console.log(
        "Endpoint:",
        SEO_API
    );

    console.log(
        "=================================================="
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


        // ====================================================
        // READ RAW RESPONSE
        // ====================================================

        const responseText =
            await response.text();


        console.log(
            "SEO API RAW RESPONSE:",
            responseText
        );


        // ====================================================
        // EMPTY RESPONSE
        // ====================================================

        if (
            !responseText ||
            !responseText.trim()
        ) {

            throw new Error(
                "Backend ने empty response दिया।"
            );

        }


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
        catch (jsonError) {

            console.error(
                "JSON PARSE ERROR:",
                jsonError
            );


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

                    : (
                        "Backend Error HTTP " +
                        response.status
                    )

            );

        }


        // ====================================================
        // SUCCESS CHECK
        // ========================================================

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


        // ========================================================
        // GET KEYWORDS FROM BACKEND
        // ========================================================

        let keywords = [];


        // ------------------------------------------------------
        // Preferred:
        // data.keywords
        // ------------------------------------------------------

        if (
            Array.isArray(
                data.keywords
            )
        ) {

            keywords =
                data.keywords;

        }


        // ------------------------------------------------------
        // Alternative:
        // data.seoKeywords
        // ------------------------------------------------------

        else if (
            Array.isArray(
                data.seoKeywords
            )
        ) {

            keywords =
                data.seoKeywords;

        }


        // ------------------------------------------------------
        // Alternative:
        // data.text
        // ------------------------------------------------------

        else if (
            typeof data.text ===
                "string" &&
            data.text.trim()
        ) {

            keywords =
                data.text
                    .split(
                        /[,|\n]+/
                    )
                    .map(
                        cleanKeyword
                    )
                    .filter(Boolean);

        }


        // ========================================================
        // CLEAN KEYWORDS
        // ========================================================

        keywords =
            keywords
                .map(
                    cleanKeyword
                )
                .filter(Boolean);


        // ========================================================
        // FRONTEND FILTER
        // ========================================================

        keywords =
            filterFrontendKeywords(

                keywords,

                product,

                brand,

                category,

                finalMainKeyword

            );


        // ========================================================
        // IF BACKEND RETURNED NOTHING
        // USE SAFE LOCAL FALLBACK
        // ========================================================

        if (
            !keywords.length
        ) {

            console.warn(
                "⚠️ Backend returned no usable keywords. Using safe fallback."
            );


            keywords =
                buildFallbackKeywords(

                    product,

                    brand,

                    category,

                    finalMainKeyword

                );

        }


        // ========================================================
        // FINAL MAIN KEYWORD SAFETY
        // ========================================================

        const normalizedMain =
            normalizeKeyword(
                finalMainKeyword
            );


        const mainExists =
            keywords.some(
                function (keyword) {

                    return (
                        normalizeKeyword(
                            keyword
                        ) ===
                        normalizedMain
                    );

                }
            );


        if (
            !mainExists &&
            normalizedMain
        ) {

            keywords.unshift(
                finalMainKeyword
            );

        }


        // ========================================================
        // MAIN KEYWORD FIRST
        // ========================================================

        const mainIndex =
            keywords.findIndex(
                function (keyword) {

                    return (
                        normalizeKeyword(
                            keyword
                        ) ===
                        normalizedMain
                    );

                }
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


        // ========================================================
        // FINAL DUPLICATE CLEAN
        // ========================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ========================================================
        // FINAL NEAR-DUPLICATE CLEAN
        // ========================================================

        keywords =
            removeNearDuplicates(
                keywords,
                finalMainKeyword
            );


        // ========================================================
        // MAIN KEYWORD AGAIN FIRST
        // ========================================================

        const finalMainIndex =
            keywords.findIndex(
                function (keyword) {

                    return (
                        normalizeKeyword(
                            keyword
                        ) ===
                        normalizedMain
                    );

                }
            );


        if (
            finalMainIndex === -1 &&
            normalizedMain
        ) {

            keywords.unshift(
                finalMainKeyword
            );

        }
        else if (
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


        // ========================================================
        // MAXIMUM 20
        // ========================================================

        keywords =
            keywords.slice(
                0,
                MAX_KEYWORDS
            );


        // ========================================================
        // FINAL EMPTY CHECK
        // ========================================================

        if (
            !keywords.length
        ) {

            throw new Error(
                "SEO keywords generate नहीं हुए।"
            );

        }


        // ========================================================
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
                .join(
                    "\n"
                );


        // ========================================================
        // SUCCESS STATUS
        // ========================================================

        if (
            data.fallback === true
        ) {

            showStatus(

                "⚠️ AI unavailable था। Safe factual keywords generated."

            );

        }
        else {

            showStatus(

                "✅ " +
                keywords.length +
                " SEO keywords generated successfully."

            );

        }


        // ========================================================
        // CONSOLE
        // ========================================================

        console.log(
            "=================================================="
        );

        console.log(
            "✅ FINAL SEO KEYWORDS 14.0"
        );

        console.log(
            keywords
        );

        console.log(
            "Main Keyword:",
            finalMainKeyword
        );

        console.log(
            "Count:",
            keywords.length
        );

        console.log(
            "=================================================="
        );

    }
    catch (error) {

        // ======================================================
        // ERROR
        // ======================================================

        console.error(
            "=================================================="
        );

        console.error(
            "❌ SEO GENERATOR 14.0 ERROR"
        );

        console.error(
            error
        );

        console.error(
            "=================================================="
        );


        // ------------------------------------------------------
        // SAFE FALLBACK
        // ------------------------------------------------------

        let fallbackKeywords =
            buildFallbackKeywords(

                product,

                brand,

                category,

                finalMainKeyword

            );


        // ------------------------------------------------------
        // If fallback still empty,
        // use Product Name only.
        // ------------------------------------------------------

        if (
            !fallbackKeywords.length
        ) {

            fallbackKeywords = [
                finalMainKeyword
            ];

        }


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
                .join(
                    "\n"
                );


        showStatus(
            "⚠️ AI response में समस्या थी। Safe fallback keywords दिखाए गए।"
        );


        console.log(
            "Fallback keywords:",
            fallbackKeywords
        );

    }
    finally {

        // ======================================================
        // RESTORE BUTTON
        // ======================================================

        setGeneratingState(
            generateBtn,
            false
        );

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


    // ========================================================
    // EMPTY CHECK
    // ========================================================

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


    // ========================================================
    // CLIPBOARD API
    // ========================================================

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


    // ========================================================
    // FALLBACK COPY
    // ========================================================

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
// PREVENT ACCIDENTAL FORM SUBMIT
// ==========================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Enter"
        ) {

            return;

        }


        const target =
            event.target;


        if (!target) {

            return;

        }


        // ----------------------------------------------------
        // Prevent Enter on input fields
        // ----------------------------------------------------

        if (
            target.tagName ===
            "INPUT"
        ) {

            event.preventDefault();

        }

    }
);


// ==========================================================
// PREVENT FORM SUBMIT
// ==========================================================

document.addEventListener(
    "submit",
    function (event) {

        const form =
            event.target;


        if (!form) {

            return;

        }


        // If Generate button exists,
        // JavaScript handles generation.
        event.preventDefault();

    }
);


// ==========================================================
// GLOBAL ERROR HANDLER
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
// GLOBAL PROMISE ERROR
// ==========================================================

window.addEventListener(
    "unhandledrejection",
    function (event) {

        console.error(
            "SEO Promise Error:",
            event.reason
        );

    }
);


// ==========================================================
// FINAL READY MESSAGE
// ==========================================================

console.log(
    "=================================================="
);

console.log(
    "🚀 AI SELLER TOOLKIT"
);

console.log(
    "SEO GENERATOR — FINAL VERSION 14.0"
);

console.log(
    "API:",
    SEO_API
);

console.log(
    "MAX KEYWORDS:",
    MAX_KEYWORDS
);

console.log(
    "STATUS: READY"
);

console.log(
    "=================================================="
);
