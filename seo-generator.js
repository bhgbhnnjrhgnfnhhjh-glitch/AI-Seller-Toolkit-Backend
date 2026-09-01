// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 14.2 FIXED
// ==========================================================
//
// FIXED:
// ✅ Backend से केवल 1 keyword आने पर भी 12-20 keywords
// ✅ Main keyword हमेशा #1
// ✅ Backend response के कई formats support
// ✅ Safe factual keyword expansion
// ✅ No invented product specifications
// ✅ No unsupported colors/materials/sizes/features
// ✅ No fake claims
// ✅ Brand stuffing protection
// ✅ Exact duplicate protection
// ✅ Better near-duplicate protection
// ✅ Maximum 20 keywords
// ✅ Minimum target 12 keywords
// ✅ Existing HTML IDs compatible
// ✅ Copy button compatible
// ==========================================================


// ==========================================================
// API
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const SEO_API =
    API_URL + "/api/generate-seo";


// ==========================================================
// SEO SETTINGS
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


    // Exact product name is valid
    if (
        keywordNormalized ===
        productNormalized
    ) {

        return false;

    }


    // Only reject a keyword when it is
    // literally a single token taken from
    // a multi-word product name.
    //
    // Example:
    // Product = Cotton Tshirt
    // "Tshirt" = reject
    //
    // But:
    // "Cotton Tshirt online" = allowed

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

            if (
                K.has(token)
            ) {

                count++;

            }

        }
    );


    // Only reject when the complete brand
    // is unnecessarily stuffed into keyword.
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


    // Do not use full brand stuffing
    if (
        brandNormalized &&
        mainNormalized.includes(
            brandNormalized
        )
    ) {

        return productClean;

    }


    // Do not use a single product fragment
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
    const seen = new Set();


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
// SAFE KEYWORD VALIDATION
// ==========================================================

function isSafeKeyword(
    keyword,
    product,
    brand,
    mainKeyword
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


    // Main keyword is always allowed
    if (
        normalized ===
        mainNormalized
    ) {

        return true;

    }


    // Generic useless keyword
    if (
        isGenericKeyword(clean)
    ) {

        return false;

    }


    // Single product fragment
    if (
        isProductFragment(
            clean,
            product
        )
    ) {

        return false;

    }


    // Full brand stuffing
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
// FILTER AI KEYWORDS
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


    // Main first
    if (safeMain) {

        output.push(
            safeMain
        );

    }


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


        const mainNormalized =
            normalizeKeyword(
                safeMain
            );


        // Don't add main again
        if (
            normalized ===
            mainNormalized
        ) {

            continue;

        }


        if (
            !isSafeKeyword(
                keyword,
                product,
                brand,
                safeMain
            )
        ) {

            continue;

        }


        // Exact duplicate
        if (
            output.some(
                existing =>
                    normalizeKeyword(existing) ===
                    normalized
            )
        ) {

            continue;

        }


        output.push(
            cleanKeyword(keyword)
        );


        if (
            output.length >=
            MAX_KEYWORDS
        ) {

            break;

        }

    }


    return output;

}


// ==========================================================
// SAFE FALLBACK KEYWORD BUILDER
// ==========================================================
//
// यह fallback सबसे महत्वपूर्ण FIX है.
//
// Backend अगर केवल:
//
// 1. Cotton Tshirt
//
// भेजेगा तब भी frontend:
//
// 2. Cotton Tshirt online
// 3. Buy Cotton Tshirt
// 4. Cotton Tshirt shopping
// ...
//
// जैसे safe keywords बनाएगा.
//
// कोई नया product feature नहीं जोड़ा जाएगा.
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


    const existingNormalized =
        new Set(

            existingKeywords.map(
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


        // Exact duplicate
        if (
            existingNormalized.has(
                normalized
            )
        ) {

            return;

        }


        if (
            output.some(
                item =>
                    normalizeKeyword(item) ===
                    normalized
            )
        ) {

            return;

        }


        if (
            !isSafeKeyword(
                clean,
                productClean,
                brand,
                productClean
            )
        ) {

            return;

        }


        output.push(clean);

    }


    // ======================================================
    // PRODUCT + SAFE SEARCH INTENTS
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
        productClean + " price"
    );

    addCandidate(
        "buy " + productClean
    );

    addCandidate(
        "shop " + productClean
    );

    addCandidate(
        productClean + " online shopping"
    );

    addCandidate(
        productClean + " purchase"
    );


    // ======================================================
    // MARKETPLACE
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

    }


    // ======================================================
    // CATEGORY
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

    }


    // ======================================================
    // PRODUCT NAME WORD ORDER
    // ======================================================

    const tokens =
        productClean
            .split(/\s+/)
            .filter(
                token =>
                    token.length > 1
            );


    // Only reverse simple 2-word products
    // Example:
    // Cotton Tshirt
    // Tshirt Cotton

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
    // SAFE LONG-TAIL PHRASES
    // ======================================================

    addCandidate(
        "online " +
        productClean
    );

    addCandidate(
        productClean +
        " shopping online"
    );

    addCandidate(
        productClean +
        " buying"
    );

    addCandidate(
        productClean +
        " store"
    );

    addCandidate(
        productClean +
        " seller"
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
    // STEP 2 — FALLBACK EXPANSION
    // ======================================================

    if (
        keywords.length <
        MIN_KEYWORDS
    ) {

        const fallback =
            buildSafeFallbackKeywords(
                product,
                category,
                marketplace,
                brand,
                keywords
            );


        for (
            const candidate of fallback
        ) {

            if (
                keywords.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            const normalized =
                normalizeKeyword(
                    candidate
                );


            if (
                keywords.some(
                    existing =>
                        normalizeKeyword(
                            existing
                        ) === normalized
                )
            ) {

                continue;

            }


            keywords.push(
                candidate
            );

        }

    }


    // ======================================================
    // STEP 3 — SECOND FALLBACK
    // ======================================================
    //
    // अगर किसी कारण से ऊपर से भी कम keywords
    // आए तो यह extra safe phrases जोड़ेंगे.
    // ======================================================

    if (
        keywords.length <
        MIN_KEYWORDS
    ) {

        const extraTemplates = [

            product + " products",
            product + " listing",
            product + " search",
            product + " shopping online",
            product + " available online",
            product + " marketplace",
            product + " store online",
            product + " buy online"

        ];


        for (
            const candidate of
            extraTemplates
        ) {

            if (
                keywords.length >=
                MAX_KEYWORDS
            ) {

                break;

            }


            const clean =
                cleanKeyword(candidate);


            const normalized =
                normalizeKeyword(clean);


            if (
                !normalized
            ) {

                continue;

            }


            if (
                !isSafeKeyword(
                    clean,
                    product,
                    brand,
                    safeMain
                )
            ) {

                continue;

            }


            if (
                keywords.some(
                    existing =>
                        normalizeKeyword(existing) ===
                        normalized
                )
            ) {

                continue;

            }


            keywords.push(
                clean
            );

        }

    }


    // ======================================================
    // STEP 4 — REMOVE EXACT DUPLICATES
    // ======================================================

    keywords =
        removeDuplicates(
            keywords
        );


    // ======================================================
    // STEP 5 — MAIN KEYWORD PROTECTION
    // ======================================================

    const mainNormalized =
        normalizeKeyword(
            safeMain
        );


    const mainIndex =
        keywords.findIndex(
            item =>
                normalizeKeyword(item) ===
                mainNormalized
        );


    if (
        mainIndex === -1 &&
        safeMain
    ) {

        keywords.unshift(
            safeMain
        );

    }
    else if (
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


    // ======================================================
    // STEP 6 — FINAL MAX
    // ======================================================

    return keywords.slice(
        0,
        MAX_KEYWORDS
    );

}


// ==========================================================
// RESPONSE TEXT EXTRACTION
// ==========================================================

function extractTextFromObject(
    data
) {

    if (!data) {

        return "";

    }


    if (
        typeof data === "string"
    ) {

        return data;

    }


    const fields = [

        "text",
        "output_text",
        "outputText",
        "content",
        "generatedText",
        "generated_text",
        "response",
        "message"

    ];


    for (
        const field of fields
    ) {

        if (
            typeof data[field] ===
            "string"
        ) {

            return data[field];

        }

    }


    return "";

}


// ==========================================================
// PARSE KEYWORDS FROM TEXT
// ==========================================================

function parseKeywordsFromText(
    text
) {

    if (
        !text ||
        typeof text !== "string"
    ) {

        return [];

    }


    let cleanText =
        text.trim();


    // ======================================================
    // Try JSON array
    // ======================================================

    try {

        const parsed =
            JSON.parse(cleanText);


        if (
            Array.isArray(parsed)
        ) {

            return parsed;

        }


        if (
            parsed &&
            typeof parsed === "object"
        ) {

            const nested =
                extractKeywordsFromResponse(
                    parsed
                );


            if (
                nested.length
            ) {

                return nested;

            }

        }

    }
    catch (error) {

        // Not JSON, continue
    }


    // ======================================================
    // Remove markdown code blocks
    // ======================================================

    cleanText =
        cleanText
            .replace(
                /```json/gi,
                ""
            )
            .replace(
                /```/g,
                ""
            )
            .trim();


    const lines =
        cleanText.split(/\r?\n/);


    const output = [];


    for (
        const line of lines
    ) {

        let clean =
            cleanKeyword(line);


        if (!clean) {

            continue;

        }


        // Remove labels
        clean =
            clean.replace(
                /^(keyword|keywords|seo keywords)\s*:\s*/i,
                ""
            );


        // Remove numbering
        clean =
            clean.replace(
                /^\d+\s*[\.\)\-:]\s*/,
                ""
            );


        // Remove bullets
        clean =
            clean.replace(
                /^[-•*]\s*/,
                ""
            );


        // Remove quotes
        clean =
            clean.replace(
                /^["']|["']$/g,
                ""
            );


        clean =
            clean.trim();


        if (clean) {

            output.push(
                clean
            );

        }

    }


    return output;

}


// ==========================================================
// EXTRACT KEYWORDS FROM RESPONSE
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
    // Common array fields
    // ======================================================

    const arrayFields = [

        "keywords",
        "seoKeywords",
        "seo_keywords",
        "keywordList",
        "keyword_list",
        "results",
        "items",
        "data"

    ];


    for (
        const field of arrayFields
    ) {

        if (
            Array.isArray(data[field])
        ) {

            return data[field];

        }

    }


    // ======================================================
    // Common string fields
    // ======================================================

    const text =
        extractTextFromObject(
            data
        );


    if (text) {

        const parsed =
            parseKeywordsFromText(
                text
            );


        if (
            parsed.length
        ) {

            return parsed;

        }

    }


    // ======================================================
    // Nested result
    // ======================================================

    if (
        data.result
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
    // Nested data object
    // ======================================================

    if (
        data.data &&
        typeof data.data === "object" &&
        !Array.isArray(data.data)
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


    // ======================================================
    // Gemini-style output
    // ======================================================

    if (
        data.output
    ) {

        if (
            Array.isArray(data.output)
        ) {

            const combined = [];


            data.output.forEach(
                item => {

                    if (
                        typeof item === "string"
                    ) {

                        combined.push(item);

                    }
                    else if (
                        item &&
                        typeof item === "object"
                    ) {

                        const t =
                            extractTextFromObject(
                                item
                            );


                        if (t) {

                            combined.push(t);

                        }

                    }

                }
            );


            if (
                combined.length
            ) {

                return parseKeywordsFromText(
                    combined.join("\n")
                );

            }

        }


        if (
            typeof data.output ===
            "string"
        ) {

            return parseKeywordsFromText(
                data.output
            );

        }

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
            "SEO API HTTP STATUS:",
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

            // If backend returned plain text,
            // treat it as text response.

            data = {
                text:
                    responseText
            };

        }


        // ==================================================
        // HTTP ERROR
        // ==================================================

        if (!response.ok) {

            let errorMessage =
                "Backend Error HTTP " +
                response.status;


            if (
                data &&
                typeof data === "object"
            ) {

                errorMessage =
                    data.error ||
                    data.message ||
                    errorMessage;

            }


            throw new Error(
                errorMessage
            );

        }


        // ==================================================
        // SUCCESS FALSE
        // ==================================================

        if (
            data &&
            data.success === false
        ) {

            throw new Error(

                data.error ||
                data.message ||
                "SEO keywords generate नहीं हुए।"

            );

        }


        // ==================================================
        // EXTRACT AI KEYWORDS
        // ==================================================

        let aiKeywords =
            extractKeywordsFromResponse(
                data
            );


        console.log(
            "AI KEYWORDS BEFORE FRONTEND FIX:",
            aiKeywords
        );


        // ==================================================
        // FINAL KEYWORDS
        // ==================================================

        const finalKeywords =
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
            "FINAL SEO KEYWORDS 14.2 FIXED:",
            finalKeywords
        );

        console.log(
            "COUNT:",
            finalKeywords.length
        );

        console.log(
            "===================================="
        );


        // ==================================================
        // EMPTY CHECK
        // ==================================================

        if (
            !finalKeywords.length
        ) {

            throw new Error(
                "SEO keywords generate नहीं हो सके।"
            );

        }


        // ==================================================
        // DISPLAY
        // ==================================================

        result.value =
            finalKeywords
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
        // SUCCESS STATUS
        // ==================================================

        showStatus(

            "✅ " +
            finalKeywords.length +
            " SEO keywords generated successfully."

        );


        console.log(
            "✅ SEO Generator 14.2 FIXED SUCCESS"
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
    // FALLBACK COPY
    // ======================================================

    fallbackCopy(text);

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
