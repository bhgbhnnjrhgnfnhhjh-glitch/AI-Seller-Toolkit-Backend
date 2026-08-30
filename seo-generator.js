// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 14.0
// ==========================================================
// Backend: Gemini Interactions API
//
// SAFE FRONTEND
// 14 Categories
// Strict factual SEO
// Duplicate protection
// Filler keyword protection
// Main keyword first
//
// IMPORTANT:
// This file ONLY controls SEO Generator.
// Other tools are NOT modified.
// ==========================================================


const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";


// ==========================================================
// SUPPORTED CATEGORIES
// ==========================================================

const SEO_CATEGORIES = [
    "Fashion",
    "Beauty",
    "Electronics",
    "Home & Kitchen",
    "Shoes",
    "Jewellery",
    "Toys",
    "Books",
    "Pet",
    "Sports",
    "Automotive",
    "Garden",
    "Food",
    "Gifts"
];


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
// CATEGORY ELEMENT
// ==========================================================

const categoryElement =
    document.getElementById("category");


// ==========================================================
// MAKE SURE CATEGORY SELECT HAS ALL 14 CATEGORIES
// ==========================================================
//
// This does NOT recreate the whole page.
// It only fills the existing category select
// if it exists.
// ==========================================================

function ensureCategories() {

    if (!categoryElement) {
        return;
    }

    const currentValue =
        categoryElement.value;

    const existingValues =
        Array.from(
            categoryElement.options || []
        ).map(
            option =>
                String(option.value)
                    .trim()
                    .toLowerCase()
        );


    // If all categories already exist,
    // do not touch the existing UI.
    const allExist =
        SEO_CATEGORIES.every(
            category =>
                existingValues.includes(
                    category.toLowerCase()
                )
        );


    if (allExist) {

        return;

    }


    categoryElement.innerHTML = "";


    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        "Select Product Category";

    categoryElement.appendChild(
        defaultOption
    );


    SEO_CATEGORIES.forEach(
        category => {

            const option =
                document.createElement("option");

            option.value =
                category;

            option.textContent =
                category;

            categoryElement.appendChild(
                option
            );

        }
    );


    if (
        SEO_CATEGORIES.some(
            category =>
                category.toLowerCase() ===
                String(currentValue)
                    .trim()
                    .toLowerCase()
        )
    ) {

        categoryElement.value =
            currentValue;

    }

}


// ==========================================================
// RUN CATEGORY SETUP
// ==========================================================

ensureCategories();


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
// NORMALIZE CATEGORY
// ==========================================================

function normalizeCategory(
    category
) {

    if (!category) {
        return "";
    }

    let value =
        String(category)
            .trim()
            .toLowerCase();


    // Remove category emojis
    value =
        value.replace(
            /👗|💄|📱|🏠|👟|💍|🧸|📚|🐶|🏋️|🚗|🌱|🍎|🎁/g,
            ""
        )
        .trim();


    const aliases = {

        "fashion":
            "Fashion",

        "beauty":
            "Beauty",

        "electronics":
            "Electronics",

        "home kitchen":
            "Home & Kitchen",

        "home and kitchen":
            "Home & Kitchen",

        "home & kitchen":
            "Home & Kitchen",

        "shoes":
            "Shoes",

        "shoe":
            "Shoes",

        "jewellery":
            "Jewellery",

        "jewelry":
            "Jewellery",

        "toys":
            "Toys",

        "toy":
            "Toys",

        "books":
            "Books",

        "book":
            "Books",

        "pet":
            "Pet",

        "pets":
            "Pet",

        "sports":
            "Sports",

        "sport":
            "Sports",

        "automotive":
            "Automotive",

        "auto":
            "Automotive",

        "garden":
            "Garden",

        "gardening":
            "Garden",

        "food":
            "Food",

        "gifts":
            "Gifts",

        "gift":
            "Gifts"

    };


    return aliases[value] || "";

}


// ==========================================================
// GENERATE SEO
// ==========================================================

async function generateSEO() {

    const productElement =
        document.getElementById("product");

    const brandElement =
        document.getElementById("brand");

    const keywordElement =
        document.getElementById("keyword");

    const marketplaceElement =
        document.getElementById("marketplace");

    const detailsElement =
        document.getElementById("productDetails");


    // ------------------------------------------------------
    // ELEMENT CHECK
    // ------------------------------------------------------

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


    // ------------------------------------------------------
    // VALUES
    // ------------------------------------------------------

    const product =
        cleanText(
            productElement.value
        );

    const category =
        normalizeCategory(
            categoryElement.value
        );

    const brand =
        cleanText(
            brandElement.value
        );

    const mainKeyword =
        cleanText(
            keywordElement.value
        );

    const marketplace =
        cleanText(
            marketplaceElement.value
        ) ||
        "All Marketplaces";

    const productDetails =
        detailsElement
            ? cleanText(
                detailsElement.value
            )
            : "";


    // ------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------

    if (!product) {

        showStatus(
            "❌ Please enter Product Name."
        );

        productElement.focus();

        return;

    }


    if (!category) {

        showStatus(
            "❌ Please select a valid Product Category."
        );

        categoryElement.focus();

        return;

    }


    if (!mainKeyword) {

        showStatus(
            "❌ Please enter Main Keyword."
        );

        keywordElement.focus();

        return;

    }


    // ------------------------------------------------------
    // CATEGORY CHECK
    // ------------------------------------------------------

    if (
        !SEO_CATEGORIES.includes(
            category
        )
    ) {

        showStatus(
            "❌ Unsupported product category."
        );

        return;

    }


    // ------------------------------------------------------
    // UI STATE
    // ------------------------------------------------------

    if (generateBtn) {

        generateBtn.disabled =
            true;

        generateBtn.innerText =
            "⏳ Generating SEO Keywords...";

    }


    showStatus(
        "🤖 AI exact product के लिए relevant SEO keywords बना रहा है..."
    );


    if (result) {

        result.value =
            "⏳ Please wait...";

    }


    try {

        // ==================================================
        // REQUEST
        // ==================================================

        const response =
            await fetch(
                API_URL +
                "/api/generate-seo",
                {

                    method:
                        "POST",

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
                                productDetails,

                            mainKeyword:
                                mainKeyword,

                            marketplace:
                                marketplace

                        })

                }
            );


        // ==================================================
        // RESPONSE JSON
        // ==================================================

        let data = null;


        try {

            data =
                await response.json();

        }
        catch {

            throw new Error(
                "Backend ने valid JSON response नहीं दिया।"
            );

        }


        // ==================================================
        // API ERROR
        // ==================================================

        if (!response.ok) {

            throw new Error(

                data &&
                data.error

                    ? data.error

                    : "Backend Error: " +
                      response.status

            );

        }


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


        // ==================================================
        // KEYWORDS
        // ==================================================

        let keywords =
            Array.isArray(
                data.keywords
            )
                ? data.keywords
                : [];


        // ==================================================
        // CLEAN
        // ==================================================

        keywords =
            keywords
                .map(
                    cleanKeyword
                )
                .filter(Boolean);


        // ==================================================
        // REMOVE DUPLICATES
        // ==================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ==================================================
        // REMOVE BAD FILLER KEYWORDS
        // ==================================================

        keywords =
            removeFillerKeywords(
                keywords,
                product,
                mainKeyword
            );


        // ==================================================
        // REMOVE VERY SIMILAR KEYWORDS
        // ==================================================

        keywords =
            removeNearDuplicates(
                keywords
            );


        // ==================================================
        // MAIN KEYWORD FIRST
        // ==================================================

        keywords =
            prioritizeMainKeyword(
                keywords,
                mainKeyword
            );


        // ==================================================
        // ENSURE MAIN KEYWORD
        // ==================================================

        const mainExists =
            keywords.some(
                item =>
                    normalizeKeyword(item) ===
                    normalizeKeyword(mainKeyword)
            );


        if (!mainExists) {

            keywords.unshift(
                mainKeyword
            );

        }


        // ==================================================
        // MAXIMUM 15
        // ==================================================

        keywords =
            keywords.slice(
                0,
                15
            );


        // ==================================================
        // FINAL CHECK
        // ==================================================

        if (!keywords.length) {

            throw new Error(
                "AI ने कोई relevant SEO keyword नहीं दिया।"
            );

        }


        // ==================================================
        // DISPLAY
        // ==================================================

        if (result) {

            result.value =
                keywords
                    .map(
                        (item, index) =>
                            (index + 1) +
                            ". " +
                            item
                    )
                    .join("\n");

        }


        showStatus(
            "✅ " +
            keywords.length +
            " relevant SEO keywords generated successfully."
        );


    }
    catch (error) {

        console.error(
            "SEO Generator Error:",
            error
        );


        if (result) {

            result.value =
                "❌ SEO Keywords generate नहीं हो सके.\n\n" +
                "Error: " +
                error.message;

        }


        showStatus(
            "❌ SEO generation failed."
        );

    }
    finally {

        if (generateBtn) {

            generateBtn.disabled =
                false;

            generateBtn.innerText =
                "🤖 Generate SEO Keywords";

        }

    }

}


// ==========================================================
// CLEAN TEXT
// ==========================================================

function cleanText(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /\s+/g,
            " "
        )
        .trim();

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
            /&/g,
            " and "
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
// SEO FILLER WORDS
// ==========================================================
//
// These words should NOT be added only to make
// artificial keyword variations.
// ==========================================================

const FILLER_WORDS =
    new Set([

        "online",
        "collection",
        "store",
        "fashion",
        "apparel",
        "wear",
        "shopping",
        "shop",
        "buy",
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
        "wholesale"

    ]);


// ==========================================================
// REMOVE FILLER KEYWORDS
// ==========================================================

function removeFillerKeywords(
    keywords,
    productName,
    mainKeyword
) {

    const productTokens =
        new Set(
            normalizeKeyword(
                productName
            )
            .split(" ")
            .filter(Boolean)
        );


    const mainNormalized =
        normalizeKeyword(
            mainKeyword
        );


    return keywords.filter(
        keyword => {

            const normalized =
                normalizeKeyword(
                    keyword
                );


            // Main keyword is always allowed
            if (
                normalized ===
                mainNormalized
            ) {

                return true;

            }


            const tokens =
                normalized
                    .split(" ")
                    .filter(Boolean);


            if (!tokens.length) {
                return false;
            }


            // Find words not already part
            // of the product name.
            const extraWords =
                tokens.filter(
                    token =>
                        !productTokens.has(
                            token
                        )
                );


            // If every extra word is filler,
            // reject it.
            if (
                extraWords.length > 0 &&
                extraWords.every(
                    word =>
                        FILLER_WORDS.has(
                            word
                        )
                )
            ) {

                return false;

            }


            return true;

        }
    );

}


// ==========================================================
// TOKEN SET
// ==========================================================

function tokenSet(
    text
) {

    return new Set(
        normalizeKeyword(text)
            .split(" ")
            .filter(Boolean)
    );

}


// ==========================================================
// SIMILARITY
// ==========================================================

function keywordSimilarity(
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
// REMOVE NEAR DUPLICATES
// ==========================================================

function removeNearDuplicates(
    keywords
) {

    const output = [];


    for (
        const keyword of keywords
    ) {

        let duplicate = false;


        for (
            const existing of output
        ) {

            if (
                keywordSimilarity(
                    keyword,
                    existing
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
            keyword =>
                normalizeKeyword(
                    keyword
                ) === target
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
// COPY SEO
// ==========================================================

function copySEO() {

    if (!result) {

        alert(
            "SEO result box नहीं मिला।"
        );

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
                () => {

                    alert(
                        "✅ SEO Keywords copied successfully!"
                    );

                }
            )
            .catch(
                () => {

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


// ==========================================================
// OPTIONAL DEBUG
// ==========================================================

console.log(
    "AI Seller Toolkit SEO Generator loaded.",
    "API:",
    API_URL,
    "Categories:",
    SEO_CATEGORIES.length
);
