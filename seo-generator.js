// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR
// FINAL VERSION 13.0
// ==========================================================
// Safe + Stable Frontend
// Optional Main Keyword
// Product Name fallback
// Gemini Backend API
// ==========================================================


// ==========================================================
// API URL
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";


// ==========================================================
// START AFTER PAGE LOAD
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
        // Generate Button
        // ------------------------------------------------------

        if (generateBtn) {

            generateBtn.addEventListener(
                "click",
                generateSEO
            );

        }
        else {

            console.error(
                "SEO ERROR: generateBtn not found."
            );

        }


        // ------------------------------------------------------
        // Copy Button
        // ------------------------------------------------------

        if (copyBtn) {

            copyBtn.addEventListener(
                "click",
                copySEO
            );

        }

    }
);


// ==========================================================
// GENERATE SEO
// ==========================================================

async function generateSEO() {

    const generateBtn =
        document.getElementById(
            "generateBtn"
        );

    const result =
        document.getElementById(
            "result"
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


    // ========================================================
    // CHECK HTML ELEMENTS
    // ========================================================

    if (
        !generateBtn ||
        !result ||
        !productElement ||
        !categoryElement ||
        !brandElement ||
        !keywordElement ||
        !marketplaceElement
    ) {

        showStatus(
            "❌ SEO form में required element नहीं मिला।"
        );

        console.error(
            "SEO Generator: Required HTML element missing."
        );

        return;

    }


    // ========================================================
    // READ VALUES
    // ========================================================

    const product =
        productElement.value.trim();

    const category =
        categoryElement.value.trim();

    const brand =
        brandElement.value.trim();

    const mainKeyword =
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
    // OPTIONAL MAIN KEYWORD
    // ========================================================
    //
    // अगर Main Keyword खाली है,
    // तो Product Name automatically Main Keyword बनेगा.
    //
    // ========================================================

    const finalMainKeyword =
        mainKeyword || product;


    // ========================================================
    // BUTTON LOADING
    // ========================================================

    generateBtn.disabled =
        true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";


    showStatus(
        "🤖 AI SEO keywords बना रहा है..."
    );


    result.value =
        "⏳ Please wait...\n\nAI relevant SEO keywords generate कर रहा है।";


    try {

        // ====================================================
        // API REQUEST
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
                                finalMainKeyword,

                            marketplace:
                                marketplace

                        })

                }
            );


        // ====================================================
        // READ RESPONSE
        // ====================================================

        const responseText =
            await response.text();


        let data = null;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch {

            console.error(
                "Backend raw response:",
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

                    : "Backend Error: HTTP " +
                      response.status

            );

        }


        // ====================================================
        // API SUCCESS CHECK
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


        // ====================================================
        // GET KEYWORDS
        // ========================================================
        //
        // Backend में keywords या seoKeywords
        // दोनों formats support किए गए हैं.
        //
        // ========================================================

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
        else if (
            Array.isArray(
                data.data
            )
        ) {

            keywords =
                data.data;

        }


        // ====================================================
        // CLEAN KEYWORDS
        // ====================================================

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
                finalMainKeyword
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
                        finalMainKeyword
                    )
            );


        if (!mainExists) {

            keywords.unshift(
                finalMainKeyword
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
        // EMPTY RESULT
        // ====================================================

        if (!keywords.length) {

            throw new Error(
                "AI ने कोई SEO keyword नहीं दिया।"
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
            " relevant SEO keywords generated successfully."

        );


        console.log(
            "SEO Keywords:",
            keywords
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
            (
                error &&
                error.message
                    ? error.message
                    : "Unknown error"
            );


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
            /\bt[\s-]*shirt\b/g,
            "tshirt"
        )

        .replace(
            /\bt[\s]+shirt\b/g,
            "tshirt"
        )

        .replace(
            /\btshirt\b/g,
            "tshirt"
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


        if (
            !normalized
        ) {

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


    if (!target) {

        return keywords;

    }


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

        navigator.clipboard
            .writeText(
                text
            )

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


    document.body.removeChild(
        textarea
    );

}
