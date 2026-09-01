// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 13.2
// ==========================================================
//
// Backend:
// AI Seller Toolkit Backend v13.2
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
// FEATURES
// ==========================================================
//
// ✅ Main Keyword optional
// ✅ Empty Main Keyword → Product Name used
// ✅ Main Keyword always first
// ✅ Maximum 20 keywords
// ✅ Duplicate protection
// ✅ Near duplicate protection
// ✅ Brand stuffing protection
// ✅ Generic keyword protection
// ✅ Filler keyword protection
// ✅ Unsupported claim protection
// ✅ Seller facts only
// ✅ AI failure protection
// ✅ Stable JSON handling
// ✅ Mobile friendly
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
            "✅ SEO Keyword Generator 13.2 loaded"
        );

    }
);


// ==========================================================
// GENERATE SEO
// ==========================================================

async function generateSEO() {

    const generateBtn =
        document.getElementById("generateBtn");

    const productElement =
        document.getElementById("product");

    const categoryElement =
        document.getElementById("category");

    const brandElement =
        document.getElementById("brand");

    const keywordElement =
        document.getElementById("keyword");

    const marketplaceElement =
        document.getElementById("marketplace");

    const result =
        document.getElementById("result");

    const status =
        document.getElementById("status");


    // ========================================================
    // HTML CHECK
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
                "❌ SEO form में कोई required element missing है।";

        }

        return;

    }


    // ========================================================
    // VALUES
    // ========================================================

    const product =
        productElement.value.trim();

    const category =
        categoryElement.value.trim();

    const brand =
        brandElement.value.trim();

    const enteredKeyword =
        keywordElement.value.trim();

    const marketplace =
        marketplaceElement.value.trim();


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
        enteredKeyword || product;


    // ========================================================
    // UI START
    // ========================================================

    generateBtn.disabled = true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";

    result.value =
        "⏳ Please wait...";

    showStatus(
        "🤖 AI relevant SEO keywords बना रहा है..."
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
            marketplace

    };


    console.log(
        "📤 SEO Request:",
        requestData
    );


    // ========================================================
    // API CALL
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
            "📡 SEO API Status:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "📥 SEO API Response:",
            responseText
        );


        // ====================================================
        // JSON PARSE
        // ====================================================

        let data = null;


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
        // BACKEND ERROR
        // ====================================================

        if (!response.ok) {

            throw new Error(

                data &&
                data.error

                    ? data.error

                    : "Backend Error: HTTP " +
                      response.status

            );

        }


        // ====================================================
        // SUCCESS
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
        // GET AI KEYWORDS
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


        // ====================================================
        // CLEAN
        // ====================================================

        keywords =
            keywords
                .map(
                    cleanKeyword
                )
                .filter(Boolean);


        // ====================================================
        // CLIENT-SIDE QUALITY FILTER
        // ====================================================

        keywords =
            filterClientSEOKeywords(
                keywords,
                product,
                brand,
                category,
                finalMainKeyword
            );


        // ====================================================
        // MAIN KEYWORD FIRST
        // ====================================================

        keywords =
            prioritizeMainKeyword(
                keywords,
                finalMainKeyword
            );


        // ====================================================
        // ENSURE MAIN KEYWORD
        // ====================================================

        const mainExists =
            keywords.some(

                function (item) {

                    return (
                        normalizeKeyword(item) ===
                        normalizeKeyword(
                            finalMainKeyword
                        )
                    );

                }

            );


        if (!mainExists) {

            keywords.unshift(
                cleanKeyword(
                    finalMainKeyword
                )
            );

        }


        // ====================================================
        // FINAL DEDUPLICATION
        // ====================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ====================================================
        // MAX 20
        // ====================================================

        keywords =
            keywords.slice(
                0,
                20
            );


        // ====================================================
        // EMPTY RESULT
        // ========================================================

        if (!keywords.length) {

            throw new Error(
                "AI ने कोई valid SEO keyword नहीं दिया।"
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
        // SUCCESS
        // ====================================================

        showStatus(

            "✅ " +
            keywords.length +
            " SEO keywords generated successfully."

        );


        console.log(
            "✅ Final SEO Keywords:",
            keywords
        );


    }
    catch (error) {

        console.error(
            "❌ SEO Generator Error:",
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
// CLIENT SEO FILTER
// ==========================================================

function filterClientSEOKeywords(
    keywords,
    productName,
    brand,
    category,
    mainKeyword
) {

    const output = [];

    const seen =
        new Set();


    const productNormalized =
        normalizeKeyword(
            productName
        );

    const brandNormalized =
        normalizeKeyword(
            brand
        );

    const categoryNormalized =
        normalizeKeyword(
            category
        );

    const mainNormalized =
        normalizeKeyword(
            mainKeyword
        );


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


        // ====================================================
        // DUPLICATE
        // ====================================================

        if (
            seen.has(
                normalized
            )
        ) {

            continue;

        }


        // ====================================================
        // MAIN KEYWORD
        // ====================================================

        if (
            normalized ===
            mainNormalized
        ) {

            seen.add(
                normalized
            );

            output.push(
                keyword
            );

            continue;

        }


        // ====================================================
        // TOO LONG
        // ====================================================

        const words =
            normalized
                .split(" ")
                .filter(Boolean);


        if (
            words.length > 8
        ) {

            continue;

        }


        // ====================================================
        // GENERIC SINGLE WORD PROTECTION
        // ====================================================

        if (
            words.length === 1
        ) {

            const generic =
                new Set([

                    "kurti",
                    "dress",
                    "shirt",
                    "tshirt",
                    "top",
                    "jeans",
                    "saree",
                    "clothing",
                    "fashion",
                    "shoes",
                    "shoe",
                    "jewellery",
                    "jewelry",
                    "mobile",
                    "phone",
                    "laptop",
                    "earbuds",
                    "watch",
                    "bottle",
                    "bag",
                    "toy",
                    "book",
                    "food",
                    "gift",
                    "beauty",
                    "cream",
                    "shampoo",
                    "soap"

                ]);


            if (
                generic.has(
                    normalized
                )
            ) {

                continue;

            }

        }


        // ====================================================
        // BRAND STUFFING PROTECTION
        // ====================================================

        if (
            brandNormalized &&
            normalized.includes(
                brandNormalized
            )
        ) {

            // Allow brand only when
            // the keyword is exactly the brand
            // or the main keyword itself.

            if (
                normalized !==
                brandNormalized
            ) {

                continue;

            }

        }


        // ====================================================
        // CATEGORY STUFFING
        // ====================================================

        if (
            categoryNormalized &&
            normalized ===
            categoryNormalized
        ) {

            continue;

        }


        // ====================================================
        // FILLER WORDS
        // ====================================================

        if (
            containsOnlyFillerWords(
                normalized
            )
        ) {

            continue;

        }


        // ====================================================
        // UNSUPPORTED CLAIM WORDS
        // ====================================================

        if (
            containsUnsupportedClaims(
                normalized
            )
        ) {

            continue;

        }


        // ====================================================
        // NEAR DUPLICATE
        // ====================================================

        let nearDuplicate =
            false;


        for (
            const existing of output
        ) {

            const similarity =
                keywordSimilarity(
                    keyword,
                    existing
                );


            if (
                similarity >= 0.80
            ) {

                nearDuplicate =
                    true;

                break;

            }

        }


        if (
            nearDuplicate
        ) {

            continue;

        }


        // ====================================================
        // PRODUCT RELEVANCE
        // ====================================================

        const productTokens =
            tokenSet(
                productNormalized
            );

        const keywordTokens =
            tokenSet(
                normalized
            );


        let productOverlap =
            0;


        keywordTokens.forEach(

            function (token) {

                if (
                    productTokens.has(
                        token
                    )
                ) {

                    productOverlap++;

                }

            }

        );


        // A keyword should normally
        // have some relation to product.
        //
        // If completely unrelated,
        // reject it.

        if (
            productTokens.size > 0 &&
            productOverlap === 0 &&
            keywordTokens.size <= 2
        ) {

            continue;

        }


        // ====================================================
        // ACCEPT
        // ====================================================

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
// UNSUPPORTED CLAIMS
// ==========================================================

function containsUnsupportedClaims(
    keyword
) {

    const claims = [

        "best",
        "number one",
        "no 1",
        "no1",
        "guaranteed",
        "100 percent",
        "100%",
        "premium",
        "original",
        "genuine",
        "luxury",
        "exclusive",
        "top quality",
        "high quality",
        "waterproof",
        "water resistant",
        "long lasting",
        "durable",
        "safe",
        "chemical free",
        "organic",
        "natural",
        "certified",
        "approved",
        "doctor recommended",
        "fast charging",
        "high performance"

    ];


    for (
        const claim of claims
    ) {

        if (
            keyword.includes(
                claim
            )
        ) {

            return true;

        }

    }


    return false;

}


// ==========================================================
// FILLER WORDS
// ==========================================================

const SEO_FILLER_WORDS =
    new Set([

        "online",
        "collection",
        "store",
        "shopping",
        "shop",
        "buy",
        "fashion",
        "apparel",
        "wear",
        "latest",
        "new",
        "best",
        "premium",
        "trendy",
        "stylish",
        "beautiful",
        "quality",
        "sale",
        "offer",
        "offers",
        "deal",
        "deals",
        "cheap",
        "price",
        "wholesale",
        "exclusive",
        "popular",
        "top"

    ]);


// ==========================================================
// FILLER CHECK
// ==========================================================

function containsOnlyFillerWords(
    keyword
) {

    const words =
        normalizeKeyword(
            keyword
        )
        .split(" ")
        .filter(Boolean);


    if (!words.length) {

        return true;

    }


    let meaningful =
        0;


    for (
        const word of words
    ) {

        if (
            !SEO_FILLER_WORDS.has(
                word
            )
        ) {

            meaningful++;

        }

    }


    return meaningful === 0;

}


// ==========================================================
// CLEAN KEYWORD
// ==========================================================

function cleanKeyword(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .trim()

        .replace(
            /^\s*\d+[\.\)\-:]\s*/,
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
// NORMALIZE KEYWORD
// ==========================================================

function normalizeKeyword(
    text
) {

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

        // T-shirt variations
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

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// ==========================================================
// TOKEN SET
// ==========================================================

function tokenSet(
    text
) {

    if (!text) {

        return new Set();

    }


    return new Set(

        text
            .split(" ")
            .filter(
                token =>
                    token.length > 1
            )

    );

}


// ==========================================================
// KEYWORD SIMILARITY
// ==========================================================

function keywordSimilarity(
    a,
    b
) {

    const A =
        tokenSet(
            normalizeKeyword(a)
        );

    const B =
        tokenSet(
            normalizeKeyword(b)
        );


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
// PRIORITIZE MAIN KEYWORD
// ==========================================================

function prioritizeMainKeyword(
    keywords,
    mainKeyword
) {

    const target =
        normalizeKeyword(
            mainKeyword
        );


    const index =
        keywords.findIndex(

            function (item) {

                return (
                    normalizeKeyword(
                        item
                    ) === target
                );

            }

        );


    if (
        index > 0
    ) {

        const item =
            keywords.splice(
                index,
                1
            )[0];


        keywords.unshift(
            item
        );

    }


    return keywords;

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


    // ========================================================
    // MODERN CLIPBOARD
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
    // FALLBACK
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
            "❌ Copy Error:",
            error
        );


        alert(
            "❌ Copy नहीं हो सका।"
        );

    }


    textarea.remove();

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
// GLOBAL ERROR
// ==========================================================

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "❌ SEO Page Error:",
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
            "❌ SEO Promise Error:",
            event.reason
        );

    }
);


// ==========================================================
// FINAL
// ==========================================================

console.log(
    "🚀 AI Seller Toolkit SEO Generator 13.2 Ready"
);
