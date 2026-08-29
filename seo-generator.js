// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR
// FINAL VERSION 12.1
// SAFE FRONTEND
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";


// ==========================================================
// ELEMENTS
// ==========================================================

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


    const product =
        productElement.value.trim();

    const category =
        categoryElement.value.trim();

    const brand =
        brandElement.value.trim();

    const mainKeyword =
        keywordElement.value.trim();

    const marketplace =
        marketplaceElement.value;


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

    if (!mainKeyword) {

        showStatus(
            "❌ Please enter Main Keyword."
        );

        keywordElement.focus();

        return;

    }


    // ========================================================
    // UI
    // ========================================================

    generateBtn.disabled = true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";

    showStatus(
        "AI SEO keywords बना रहा है..."
    );

    result.value =
        "⏳ Please wait...";


    try {

        // ====================================================
        // CORRECT API
        // ====================================================

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
        // JSON RESPONSE
        // ====================================================

        let data;

        try {

            data =
                await response.json();

        }
        catch {

            throw new Error(
                "Backend ने valid JSON response नहीं दिया।"
            );

        }


        // ====================================================
        // API ERROR
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
        // KEYWORDS
        // ====================================================

        let keywords =
            Array.isArray(
                data.keywords
            )
                ? data.keywords
                : [];


        keywords =
            keywords
                .map(
                    cleanKeyword
                )
                .filter(Boolean);


        // ====================================================
        // REMOVE DUPLICATES
        // ====================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ====================================================
        // MAIN KEYWORD FIRST
        // ====================================================

        keywords =
            prioritizeMainKeyword(
                keywords,
                mainKeyword
            );


        // ====================================================
        // ENSURE MAIN KEYWORD
        // ====================================================

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


        // ====================================================
        // MAXIMUM 20
        // ====================================================

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


        // ====================================================
        // DISPLAY
        // ====================================================

        result.value =
            keywords
                .map(
                    (item, index) =>
                        (index + 1) +
                        ". " +
                        item
                )
                .join("\n");


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
// REMOVE DUPLICATES
// ==========================================================

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


// ==========================================================
// COPY SEO
// ==========================================================

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
