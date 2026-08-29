/* =========================================================
   AI SELLER TOOLKIT
   SEO KEYWORD GENERATOR
   FINAL VERSION 12

   Backend:
   /api/generate-keywords

   Supports:
   Fashion
   Beauty
   Electronics
   Home & Kitchen
   Shoes
   Jewellery
   Toys
   Books
   Pet
   Sports
   Automotive
   Garden
   Food
   Gifts
========================================================= */

const API_URL =
 "https://ai-seller-toolkit-backend-1.onrender.com/api/generate-seo"

const generateBtn =
    document.getElementById(
        "generateBtn"
    );

const copyBtn =
    document.getElementById(
        "copyBtn"
    );

const result =
    document.getElementById(
        "result"
    );

const status =
    document.getElementById(
        "status"
    );


// =========================================================
// CATEGORY LIST
// =========================================================

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


// =========================================================
// EVENTS
// =========================================================

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


// =========================================================
// GENERATE SEO
// =========================================================

async function generateSEO() {

    const product =
        document
            .getElementById(
                "product"
            )
            .value
            .trim();

    const category =
        document
            .getElementById(
                "category"
            )
            .value
            .trim();

    const brand =
        document
            .getElementById(
                "brand"
            )
            .value
            .trim();

    const mainKeyword =
        document
            .getElementById(
                "keyword"
            )
            .value
            .trim();

    const marketplace =
        document
            .getElementById(
                "marketplace"
            )
            .value;

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!product) {

        showStatus(
            "❌ Please enter Product Name."
        );

        return;

    }

    if (!category) {

        showStatus(
            "❌ Please select Product Category."
        );

        return;

    }

    if (!mainKeyword) {

        showStatus(
            "❌ Please enter Main Keyword."
        );

        return;

    }

    // -------------------------------------------------------
    // UI
    // -------------------------------------------------------

    generateBtn.disabled = true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";

    showStatus(
        "AI SEO keywords बना रहा है..."
    );

    result.value =
        "⏳ Please wait...";


    try {

        // ---------------------------------------------------
        // API REQUEST
        // ---------------------------------------------------

        const response =
            await fetch(
                API_URL +
                "/api/generate-keywords",
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


        // ---------------------------------------------------
        // READ RESPONSE
        // ---------------------------------------------------

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


        // ---------------------------------------------------
        // API ERROR
        // ---------------------------------------------------

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


        // ---------------------------------------------------
        // KEYWORDS
        // ---------------------------------------------------

        let keywords =
            Array.isArray(
                data.keywords
            )
                ? data.keywords
                : [];


        // Clean
        keywords =
            keywords
                .map(
                    cleanKeyword
                )
                .filter(Boolean);


        // Remove duplicates
        keywords =
            removeDuplicates(
                keywords
            );


        // Main keyword first
        keywords =
            prioritizeMainKeyword(
                keywords,
                mainKeyword
            );


        // Make sure exact main keyword exists
        const mainExists =
            keywords.some(
                item =>
                    normalizeKeyword(
                        item
                    ) ===
                    normalizeKeyword(
                        mainKeyword
                    )
            );


        if (!mainExists) {

            keywords.unshift(
                mainKeyword
            );

        }


        // Maximum 20
        keywords =
            keywords.slice(
                0,
                20
            );


        if (!keywords.length) {

            throw new Error(
                "AI ने कोई keyword नहीं दिया।"
            );

        }


        // ---------------------------------------------------
        // DISPLAY
        // ---------------------------------------------------

        result.value =
            keywords
                .map(
                    (item, index) =>
                        (
                            index + 1
                        ) +
                        ". " +
                        item
                )
                .join("\n");


        showStatus(
            "✅ " +
            keywords.length +
            " relevant SEO keywords generated."
        );


    }
    catch (error) {

        console.error(
            "SEO Generator Error:",
            error
        );

        result.value =
            "❌ SEO Keywords generate नहीं हो सके.\n\n" +
            "Error: " +
            error.message;


        showStatus(
            "❌ Please try again."
        );

    }
    finally {

        generateBtn.disabled =
            false;

        generateBtn.innerText =
            "🤖 Generate SEO Keywords";

    }

}


// =========================================================
// SHOW STATUS
// =========================================================

function showStatus(message) {

    if (status) {

        status.innerText =
            message;

    }

}


// =========================================================
// CLEAN KEYWORD
// =========================================================

function cleanKeyword(
    value
) {

    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .replace(
            /^\d+[\.\)\-:]\s*/,
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


// =========================================================
// NORMALIZE KEYWORD
// =========================================================

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


// =========================================================
// REMOVE DUPLICATES
// =========================================================

function removeDuplicates(
    keywords
) {

    const output = [];

    const seen =
        new Set();

    keywords.forEach(
        keyword => {

            const normalized =
                normalizeKeyword(
                    keyword
                );

            if (
                !normalized ||
                seen.has(
                    normalized
                )
            ) {

                return;

            }

            seen.add(
                normalized
            );

            output.push(
                keyword
            );

        }
    );

    return output;

}


// =========================================================
// PRIORITIZE MAIN KEYWORD
// =========================================================

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


// =========================================================
// COPY SEO
// =========================================================

function copySEO() {

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
            .writeText(
                text
            )
            .then(
                function() {

                    alert(
                        "✅ SEO Keywords copied successfully!"
                    );

                }
            )
            .catch(
                function() {

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


// =========================================================
// COPY FALLBACK
// =========================================================

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
    catch (error) {

        alert(
            "❌ Copy नहीं हो सका।"
        );

    }

    textarea.remove();

}
