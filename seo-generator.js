// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR
// FINAL VERSION 13.1
// BACKEND CONNECTED + AUTO MAIN KEYWORD
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


    if (!productElement || !categoryElement) {

        showStatus(
            "❌ SEO form elements नहीं मिले।"
        );

        return;
    }


    const product =
        productElement.value.trim();

    const category =
        categoryElement.value.trim();

    const brand =
        brandElement
            ? brandElement.value.trim()
            : "";

    let mainKeyword =
        keywordElement
            ? keywordElement.value.trim()
            : "";

    const marketplace =
        marketplaceElement
            ? marketplaceElement.value.trim()
            : "General Marketplace";


    // ========================================================
    // PRODUCT VALIDATION
    // ========================================================

    if (!product) {

        showStatus(
            "❌ Please enter Product Name."
        );

        productElement.focus();

        return;
    }


    // ========================================================
    // CATEGORY VALIDATION
    // ========================================================

    if (!category) {

        showStatus(
            "❌ Please select Product Category."
        );

        categoryElement.focus();

        return;
    }


    // ========================================================
    // AUTO MAIN KEYWORD
    // ========================================================
    // अगर Main Keyword खाली है,
    // तो Product Name automatically use होगा.
    // ========================================================

    if (!mainKeyword) {

        mainKeyword =
            product;

        if (keywordElement) {

            keywordElement.value =
                mainKeyword;

        }
    }


    // ========================================================
    // UI
    // ========================================================

    if (generateBtn) {

        generateBtn.disabled =
            true;

        generateBtn.innerText =
            "⏳ Generating SEO Keywords...";
    }


    showStatus(
        "🤖 AI SEO keywords बना रहा है..."
    );


    if (result) {

        result.value =
            "⏳ Please wait...\n\nAI relevant keywords तैयार कर रहा है...";
    }


    try {

        // ====================================================
        // BACKEND REQUEST
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
                                cleanCategory(
                                    category
                                ),

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
        // RESPONSE
        // ====================================================

        let data = null;

        const responseText =
            await response.text();


        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch {

            throw new Error(
                "Backend ने valid JSON response नहीं दिया."
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


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data &&
                data.error
                    ? data.error
                    : "SEO keywords generate नहीं हुए."
            );
        }


        // ====================================================
        // GET KEYWORDS
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
        else if (
            Array.isArray(
                data.seoKeywords
            )
        ) {

            keywords =
                data.seoKeywords;

        }
        else if (
            typeof data.keywords ===
            "string"
        ) {

            keywords =
                data.keywords
                    .split(/\r?\n/);

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
        // REMOVE DUPLICATES
        // ====================================================

        keywords =
            removeDuplicates(
                keywords
            );


        // ====================================================
        // REMOVE BAD / EMPTY KEYWORDS
        // ====================================================

        keywords =
            keywords.filter(
                keyword => {

                    const normalized =
                        normalizeKeyword(
                            keyword
                        );

                    if (!normalized) {
                        return false;
                    }

                    // Maximum 8 words
                    if (
                        normalized
                            .split(" ")
                            .length > 8
                    ) {

                        return false;
                    }

                    return true;

                }
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
                keyword =>
                    normalizeKeyword(
                        keyword
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
        // REMOVE DUPLICATES AGAIN
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
        // ====================================================

        if (!keywords.length) {

            throw new Error(
                "AI ने कोई SEO keyword नहीं दिया."
            );
        }


        // ====================================================
        // DISPLAY
        // ====================================================

        if (result) {

            result.value =
                keywords
                    .map(
                        (keyword, index) =>
                            (index + 1) +
                            ". " +
                            keyword
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
            "SEO GENERATOR ERROR:",
            error
        );


        if (result) {

            result.value =
                "❌ SEO Keywords generate नहीं हो सके.\n\n" +
                "Error: " +
                error.message;
        }


        showStatus(
            "❌ SEO generation failed: " +
            error.message
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
// CATEGORY CLEANER
// ==========================================================

function cleanCategory(
    category
) {

    if (!category) {
        return "";
    }


    return String(category)
        .trim()
        .replace(
            /👗|💄|📱|🏠|👟|💍|🧸|📚|🐶|🏋️|🚗|🌱|🍎|🎁/g,
            ""
        )
        .trim();

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
// COPY SEO
// ==========================================================

function copySEO() {

    if (!result) {

        alert(
            "Result box नहीं मिला."
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
            "पहले SEO Keywords generate करें."
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
            "❌ Copy नहीं हो सका."
        );

    }


    textarea.remove();

}
