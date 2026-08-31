// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR
// FINAL VERSION 13.0
// ==========================================================
// SAFE + STABLE FRONTEND
// - Main Keyword optional
// - Product Name automatically becomes Main Keyword
// - Category aware
// - Backend error handling
// - Duplicate removal
// - Main keyword first
// - Maximum 20 keywords
// ==========================================================


const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";


// ==========================================================
// ELEMENTS
// ==========================================================

const generateBtn =
    document.getElementById("generateBtn");

const copyBtn =
    document.getElementById("copyBtn");

const result =
    document.getElementById("result");

const status =
    document.getElementById("status");


// ==========================================================
// EVENTS
// ==========================================================

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


// ==========================================================
// GENERATE SEO
// ==========================================================

async function generateSEO() {

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


    // ========================================================
    // ELEMENT CHECK
    // ========================================================

    if (
        !productElement ||
        !categoryElement ||
        !brandElement ||
        !keywordElement ||
        !marketplaceElement
    ) {

        showStatus(
            "❌ SEO form में required field नहीं मिली।"
        );

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

    let mainKeyword =
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
    // IMPORTANT FIX
    // ========================================================
    // Main Keyword खाली होने पर Product Name
    // automatically Main Keyword बनेगा.
    // ========================================================

    if (!mainKeyword) {

        mainKeyword =
            product;

        keywordElement.value =
            mainKeyword;

    }


    // ========================================================
    // BUTTON UI
    // ========================================================

    generateBtn.disabled =
        true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";


    showStatus(
        "🤖 AI SEO keywords बना रहा है..."
    );


    result.value =
        "⏳ Please wait...\n\nAI product information analyze कर रहा है...";


    // ========================================================
    // API REQUEST
    // ========================================================

    try {

        const response =
            await fetch(
                API_URL +
                "/api/generate-seo",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            category:
                                category,

                            productName:
                                product,

                            brand:
                                brand,

                            productDetails:
                                "",

                            mainKeyword:
                                mainKeyword,

                            marketplace:
                                marketplace

                        })

                }
            );


        // ====================================================
        // RESPONSE TEXT
        // ====================================================

        const responseText =
            await response.text();


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
        catch {

            console.error(
                "INVALID JSON RESPONSE:",
                responseText
            );

            throw new Error(
                "Backend ने valid JSON response नहीं दिया।"
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
                    : "Backend Error: " +
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
        // ========================================================

        let keywords =
            Array.isArray(
                data.keywords
            )
                ? data.keywords
                : [];


        // ====================================================
        // CLEAN
        // ========================================================

        keywords =
            keywords
                .map(
                    cleanKeyword
                )
                .filter(Boolean);


        // ====================================================
        // REMOVE DUPLICATES
        // ========================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ====================================================
        // REMOVE BAD / USELESS KEYWORDS
        // ========================================================

        keywords =
            filterBadKeywords(
                keywords,
                product,
                brand,
                category
            );


        // ====================================================
        // MAIN KEYWORD FIRST
        // ========================================================

        keywords =
            prioritizeMainKeyword(
                keywords,
                mainKeyword
            );


        // ====================================================
        // ALWAYS KEEP MAIN KEYWORD
        // ========================================================

        const mainNormalized =
            normalizeKeyword(
                mainKeyword
            );


        const mainExists =
            keywords.some(
                item =>
                    normalizeKeyword(
                        item
                    ) ===
                    mainNormalized
            );


        if (!mainExists) {

            keywords.unshift(
                mainKeyword
            );

        }


        // ====================================================
        // MAXIMUM 20
        // ========================================================

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
                "AI ने कोई usable SEO keyword नहीं दिया।"
            );

        }


        // ====================================================
        // DISPLAY
        // ========================================================

        result.value =
            keywords
                .map(
                    (item, index) =>
                        (index + 1) +
                        ". " +
                        item
                )
                .join("\n");


        // ====================================================
        // SUCCESS MESSAGE
        // ========================================================

        showStatus(
            "✅ " +
            keywords.length +
            " relevant SEO keywords generated successfully."
        );


    }
    catch (error) {

        console.error(
            "SEO GENERATOR ERROR:",
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

    if (status) {

        status.innerText =
            message;

    }

}


// ==========================================================
// CLEAN KEYWORD
// ==========================================================

function cleanKeyword(
    value
) {

    if (!value) {
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
// REMOVE EXACT DUPLICATES
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


        if (
            !normalized ||
            seen.has(normalized)
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
// BAD KEYWORD FILTER
// ==========================================================

function filterBadKeywords(
    keywords,
    product,
    brand,
    category
) {

    const output = [];

    const productNormalized =
        normalizeKeyword(
            product
        );

    const brandNormalized =
        normalizeKeyword(
            brand
        );

    const categoryNormalized =
        normalizeKeyword(
            category
        );


    const fillerWords =
        new Set([

            "online",
            "shopping",
            "shop",
            "buy",
            "sale",
            "offer",
            "deal",
            "deals",
            "best",
            "premium",
            "quality",
            "latest",
            "new",
            "trendy",
            "stylish",
            "collection",
            "store",
            "cheap",
            "wholesale",
            "fashion",
            "apparel",
            "wear"

        ]);


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


        // ----------------------------------------------------
        // Maximum 8 words
        // ----------------------------------------------------

        if (
            normalized.split(" ").length > 8
        ) {

            continue;

        }


        // ----------------------------------------------------
        // Reject only-filler keyword
        // ----------------------------------------------------

        const tokens =
            normalized.split(" ");


        const usefulTokens =
            tokens.filter(
                token =>
                    !fillerWords.has(token)
            );


        if (
            usefulTokens.length === 0
        ) {

            continue;

        }


        // ----------------------------------------------------
        // Reject obvious Brand + exact Product duplicate
        // ----------------------------------------------------

        if (
            brandNormalized &&
            normalized.includes(
                brandNormalized
            )
        ) {

            const withoutBrand =
                normalized
                    .replace(
                        brandNormalized,
                        ""
                    )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();


            if (
                withoutBrand ===
                productNormalized
            ) {

                continue;

            }

        }


        // ----------------------------------------------------
        // Reject exact Category + Product stuffing
        // ----------------------------------------------------

        if (
            categoryNormalized &&
            productNormalized
        ) {

            const simpleCombination =
                (
                    categoryNormalized +
                    " " +
                    productNormalized
                )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();


            if (
                normalized ===
                simpleCombination
            ) {

                continue;

            }

        }


        output.push(
            keyword
        );

    }


    return output;

}


// ==========================================================
// MAIN KEYWORD FIRST
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
            item =>
                normalizeKeyword(
                    item
                ) ===
                target
        );


    if (index > 0) {

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

function copySEO() {

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

        navigator.clipboard
            .writeText(text)
            .then(
                function () {

                    alert(
                        "✅ SEO Keywords copied successfully!"
                    );

                }
            )
            .catch(
                function () {

                    fallbackCopy(
                        text
                    );

                }
            );

    }
    else {

        fallbackCopy(
            text
        );

    }

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


    document.body.appendChild(
        textarea
    );


    textarea.select();


    try {

        document.execCommand(
            "copy"
        );


        alert(
            "✅ SEO Keywords copied successfully!"
        );

    }
    catch {

        alert(
            "❌ Copy नहीं हो सका।"
        );

    }


    textarea.remove();

}
