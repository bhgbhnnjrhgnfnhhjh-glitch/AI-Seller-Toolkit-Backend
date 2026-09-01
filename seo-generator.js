// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 14.2 FIXED
// ==========================================================
//
// FIXED:
// ✅ Backend 1 keyword दे तब भी 12-20 keywords बनेंगे
// ✅ Main Keyword हमेशा #1 रहेगा
// ✅ Product Name से safe keyword expansion
// ✅ Backend response array / string / nested JSON support
// ✅ Duplicate protection
// ✅ Near-duplicate protection
// ✅ Product-fragment protection
// ✅ Brand stuffing protection
// ✅ Generic keyword protection
// ✅ Unsupported product facts नहीं बनाए जाएंगे
// ✅ Maximum 20 keywords
// ✅ Minimum 12 keywords target
// ✅ Input fields कभी overwrite नहीं होंगे
// ✅ Amazon / Meesho / Flipkart / Etsy / Shopify support
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

document.addEventListener("DOMContentLoaded", function () {

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

});


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

    A.forEach(function (token) {

        if (B.has(token)) {

            intersection++;

        }

    });

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
// PRODUCT FRAGMENT
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

    const KNorm =
        normalizeKeyword(keyword);

    const PNorm =
        normalizeKeyword(product);

    // Exact product is ALWAYS allowed
    if (
        KNorm === PNorm
    ) {

        return false;

    }

    // Single word from a multi-word product is rejected
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

    B.forEach(function (token) {

        if (K.has(token)) {

            count++;

        }

    });

    return count === B.size;

}


// ==========================================================
// GENERIC KEYWORD CHECK
// ==========================================================

function isGenericKeyword(keyword) {

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
// UNIQUE KEYWORDS
// ==========================================================

function removeDuplicates(keywords) {

    const output = [];
    const seen = new Set();

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

        seen.add(normalized);

        output.push(keyword);

    }

    return output;

}


// ==========================================================
// SAFE KEYWORD CHECK
// ==========================================================

function isSafeKeyword(
    keyword,
    product,
    brand
) {

    const clean =
        cleanKeyword(keyword);

    if (!clean) {

        return false;

    }

    if (
        isGenericKeyword(clean)
    ) {

        return false;

    }

    if (
        isProductFragment(
            clean,
            product
        )
    ) {

        return false;

    }

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
// ADD SAFE KEYWORD
// ==========================================================

function addSafeKeyword(
    output,
    candidate,
    product,
    brand
) {

    const keyword =
        cleanKeyword(candidate);

    if (!keyword) {

        return false;

    }

    const normalized =
        normalizeKeyword(keyword);

    if (!normalized) {

        return false;

    }

    // Duplicate
    if (
        output.some(
            item =>
                normalizeKeyword(item) ===
                normalized
        )
    ) {

        return false;

    }

    // Unsafe
    if (
        !isSafeKeyword(
            keyword,
            product,
            brand
        )
    ) {

        return false;

    }

    // Near duplicate.
    //
    // IMPORTANT:
    // यहाँ threshold 0.95 रखा गया है ताकि
    // "cotton kurti online"
    // और
    // "cotton kurti design"
    // जैसे useful keywords reject न हों।

    const nearDuplicate =
        output.some(
            existing =>
                similarity(
                    existing,
                    keyword
                ) >= 0.95
        );

    if (nearDuplicate) {

        return false;

    }

    output.push(keyword);

    return true;

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

    // If main keyword is only a fragment
    if (
        isProductFragment(
            mainClean,
            productClean
        )
    ) {

        return productClean;

    }

    // Do not allow full brand stuffing
    const effectiveBrand =
        getEffectiveBrand(
            brand,
            productClean
        );

    const brandNormalized =
        normalizeKeyword(
            effectiveBrand
        );

    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }

    return mainClean;

}


// ==========================================================
// BUILD GUARANTEED SAFE KEYWORDS
// ==========================================================
//
// यह सबसे महत्वपूर्ण FIX है.
//
// Backend अगर सिर्फ:
// "Cotton kurti"
//
// भेजेगा तब भी यहाँ से keywords बनेंगे:
//
// Cotton kurti
// cotton kurti online
// cotton kurti shopping
// cotton kurti collection
// cotton kurti design
// cotton kurti styles
// cotton kurti for women
// buy cotton kurti
// shop cotton kurti
// cotton kurti price
// cotton kurti online shopping
// cotton kurti latest collection
//
// कोई fake fabric / color / pattern / size आदि नहीं बनाया जाएगा.
//

function buildGuaranteedKeywords(
    product,
    category,
    marketplace,
    brand,
    mainKeyword,
    existingKeywords
) {

    const output = [];

    const productClean =
        cleanInput(product);

    if (!productClean) {

        return output;

    }

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword,
            productClean,
            brand
        );

    // ======================================================
    // MAIN KEYWORD
    // ======================================================

    if (safeMain) {

        output.push(
            safeMain
        );

    }

    // ======================================================
    // PRODUCT BASE PHRASES
    // ======================================================

    const candidates = [

        productClean + " online",

        productClean + " shopping",

        productClean + " collection",

        productClean + " design",

        productClean + " styles",

        productClean + " for women",

        "buy " + productClean,

        "shop " + productClean,

        productClean + " price",

        productClean + " online shopping",

        productClean + " latest collection",

        productClean + " for daily use",

        productClean + " wear",

        productClean + " clothing",

        productClean + " fashion",

        productClean + " apparel",

        productClean + " store",

        productClean + " available online"

    ];

    for (
        const candidate of candidates
    ) {

        if (
            output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }

        addSafeKeyword(
            output,
            candidate,
            productClean,
            brand
        );

    }

    // ======================================================
    // MARKETPLACE
    // ======================================================

    const market =
        cleanInput(marketplace);

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
            market,

            "buy " +
            productClean +
            " on " +
            market

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

            addSafeKeyword(
                output,
                candidate,
                productClean,
                brand
            );

        }

    }

    // ======================================================
    // CATEGORY
    // ======================================================

    const categoryClean =
        cleanInput(category);

    if (
        categoryClean &&
        normalizeKeyword(
            categoryClean
        ) !==
        normalizeKeyword(
            productClean
        )
    ) {

        addSafeKeyword(
            output,
            productClean +
            " " +
            categoryClean,
            productClean,
            brand
        );

    }

    // ======================================================
    // SIMPLE TOKEN ORDER
    // ======================================================

    const tokens =
        productClean
            .split(" ")
            .filter(
                token =>
                    token.length > 1
            );

    if (
        tokens.length === 2
    ) {

        addSafeKeyword(
            output,
            tokens[1] +
            " " +
            tokens[0],
            productClean,
            brand
        );

    }

    // ======================================================
    // MERGE EXISTING AI KEYWORDS
    // ======================================================

    if (
        Array.isArray(existingKeywords)
    ) {

        for (
            const keyword of
            existingKeywords
        ) {

            if (
                output.length >=
                MAX_KEYWORDS
            ) {

                break;

            }

            const clean =
                cleanKeyword(keyword);

            if (!clean) {

                continue;

            }

            // Main keyword allowed
            if (
                normalizeKeyword(clean) ===
                normalizeKeyword(safeMain)
            ) {

                continue;

            }

            addSafeKeyword(
                output,
                clean,
                productClean,
                brand
            );

        }

    }

    return output.slice(
        0,
        MAX_KEYWORDS
    );

}


// ==========================================================
// EXTRACT BACKEND KEYWORDS
// ==========================================================

function extractKeywordsFromResponse(data) {

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
        data.result
    ) {

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

            return data.result
                .split(/\r?\n/)
                .map(
                    line =>
                        cleanKeyword(line)
                )
                .filter(Boolean);

        }

    }

    // Nested data
    if (
        data.data
    ) {

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

    }

    // Direct string
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

    const productClean =
        cleanInput(product);

    const safeMain =
        sanitizeMainKeyword(
            mainKeyword,
            productClean,
            brand
        );

    // ======================================================
    // AI KEYWORDS CLEAN
    // ======================================================

    let aiClean = [];

    if (
        Array.isArray(aiKeywords)
    ) {

        aiClean =
            aiKeywords
                .map(
                    item =>
                        cleanKeyword(item)
                )
                .filter(Boolean);

    }

    // ======================================================
    // GUARANTEED KEYWORD BUILDER
    // ======================================================
    //
    // यहाँ Backend keywords + local safe keywords
    // दोनों combine होते हैं।
    //
    // Backend चाहे 1 keyword दे,
    // result फिर भी 12+ होगा।
    //

    const finalKeywords =
        buildGuaranteedKeywords(

            productClean,

            category,

            marketplace,

            brand,

            safeMain,

            aiClean

        );

    // ======================================================
    // FINAL MAIN KEYWORD PROTECTION
    // ======================================================

    if (safeMain) {

        const mainNormalized =
            normalizeKeyword(
                safeMain
            );

        const index =
            finalKeywords.findIndex(
                item =>
                    normalizeKeyword(
                        item
                    ) ===
                    mainNormalized
            );

        if (
            index > 0
        ) {

            const main =
                finalKeywords.splice(
                    index,
                    1
                )[0];

            finalKeywords.unshift(
                main
            );

        }
        else if (
            index === -1
        ) {

            finalKeywords.unshift(
                safeMain
            );

        }

    }

    // ======================================================
    // FINAL UNIQUE
    // ======================================================

    return removeDuplicates(
        finalKeywords
    ).slice(
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
    // SAFE MAIN
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
        "🤖 SEO keywords generate हो रहे हैं..."
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
        "SEO GENERATOR 14.2 FIXED REQUEST"
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
        // BACKEND ERROR
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

                marketplace

            );

        console.log(
            "===================================="
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
            "===================================="
        );

        // ==================================================
        // EMPTY
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
        // IMPORTANT FALLBACK
        // ==================================================
        //
        // अगर Backend fail भी हो जाए,
        // तब भी product से local SEO keywords बनेंगे।
        //

        try {

            const fallback =
                buildGuaranteedKeywords(

                    product,

                    category,

                    marketplace,

                    brand,

                    finalMainKeyword,

                    []

                );

            if (
                fallback.length
            ) {

                result.value =
                    fallback
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

                    "⚠️ AI response unavailable. Safe local SEO keywords generated."

                );

                console.warn(
                    "⚠️ Local SEO fallback used:",
                    fallback
                );

            }
            else {

                throw error;

            }

        }
        catch (fallbackError) {

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
    "🚀 AI Seller Toolkit SEO Generator 14.2 FIXED Ready"
);

console.log(
    "✅ Backend 1 keyword दे तब भी local safe expansion active है."
);

console.log(
    "✅ Minimum target:",
    MIN_KEYWORDS
);

console.log(
    "✅ Maximum:",
    MAX_KEYWORDS
);
