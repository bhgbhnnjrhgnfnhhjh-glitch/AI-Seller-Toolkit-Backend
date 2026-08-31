

// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR
// FINAL VERSION 13.0
// ==========================================================
// Backend:
// https://ai-seller-toolkit-backend-1.onrender.com
//
// Endpoint:
// POST /api/generate-seo
//
// Features:
// ✅ Main Keyword Optional
// ✅ Product Name fallback
// ✅ Category aware
// ✅ Brand support
// ✅ Marketplace support
// ✅ Duplicate removal
// ✅ Main keyword first
// ✅ Maximum 20 keywords
// ✅ Safe error handling
// ==========================================================


// ==========================================================
// API URL
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
// PAGE LOAD CHECK
// ==========================================================

console.log(
    "AI SEO Keyword Generator loaded."
);

console.log(
    "API:",
    API_URL
);


// ==========================================================
// EVENTS
// ==========================================================

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        generateSEO
    );

} else {

    console.error(
        "Generate button #generateBtn not found."
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

    // ------------------------------------------------------
    // GET FORM ELEMENTS
    // ------------------------------------------------------

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


    // ------------------------------------------------------
    // ELEMENT CHECK
    // ------------------------------------------------------

    if (!productElement) {

        showStatus(
            "❌ Product Name field नहीं मिला। HTML में id=\"product\" होना चाहिए।"
        );

        console.error(
            "Missing element: #product"
        );

        return;

    }


    if (!categoryElement) {

        showStatus(
            "❌ Category field नहीं मिला।"
        );

        console.error(
            "Missing element: #category"
        );

        return;

    }


    if (!keywordElement) {

        showStatus(
            "❌ Main Keyword field नहीं मिला।"
        );

        console.error(
            "Missing element: #keyword"
        );

        return;

    }


    if (!marketplaceElement) {

        showStatus(
            "❌ Marketplace field नहीं मिला।"
        );

        console.error(
            "Missing element: #marketplace"
        );

        return;

    }


    // ------------------------------------------------------
    // GET VALUES
    // ------------------------------------------------------

    const product =
        productElement.value.trim();

    const category =
        categoryElement.value.trim();

    const brand =
        brandElement
            ? brandElement.value.trim()
            : "";

    const mainKeyword =
        keywordElement.value.trim();

    const marketplace =
        marketplaceElement.value.trim();


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
            "❌ Please select Product Category."
        );

        categoryElement.focus();

        return;

    }


    // ------------------------------------------------------
    // MAIN KEYWORD OPTIONAL
    // ------------------------------------------------------
    //
    // अगर Main Keyword खाली है,
    // तो Product Name को Main Keyword बनाया जाएगा.
    // ------------------------------------------------------

    const finalMainKeyword =
        mainKeyword || product;


    // ------------------------------------------------------
    // BUTTON UI
    // ------------------------------------------------------

    if (generateBtn) {

        generateBtn.disabled = true;

        generateBtn.innerText =
            "⏳ Generating SEO Keywords...";

    }


    if (result) {

        result.value =
            "⏳ AI SEO keywords बना रहा है...\n\nPlease wait...";

    }


    showStatus(
        "⏳ AI SEO keywords बना रहा है..."
    );


    // ======================================================
    // API REQUEST
    // ======================================================

    try {

        console.log(
            "Sending SEO request..."
        );


        const requestBody = {

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
            "SEO Request:",
            requestBody
        );


        const response =
            await fetch(
                API_URL +
                "/api/generate-seo",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )

                }
            );


        // ==================================================
        // READ RESPONSE
        // ==================================================

        let data = null;

        const responseText =
            await response.text();


        console.log(
            "Backend status:",
            response.status
        );


        console.log(
            "Backend response:",
            responseText
        );


        // --------------------------------------------------
        // JSON PARSE
        // --------------------------------------------------

        if (responseText) {

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            }
            catch (parseError) {

                console.error(
                    "JSON Parse Error:",
                    parseError
                );

                throw new Error(
                    "Backend ने valid JSON response नहीं दिया।"
                );

            }

        }


        // ==================================================
        // HTTP ERROR
        // ==================================================

        if (!response.ok) {

            let errorMessage =
                "Backend Error: " +
                response.status;


            if (
                data &&
                data.error
            ) {

                errorMessage =
                    data.error;

            }


            throw new Error(
                errorMessage
            );

        }


        // ==================================================
        // SUCCESS CHECK
        // ==================================================

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

        let keywords = [];


        if (
            Array.isArray(
                data.keywords
            )
        ) {

            keywords =
                data.keywords;

        }


        // --------------------------------------------------
        // CLEAN KEYWORDS
        // --------------------------------------------------

        keywords =
            keywords
                .map(
                    cleanKeyword
                )
                .filter(Boolean);


        // --------------------------------------------------
        // REMOVE DUPLICATES
        // --------------------------------------------------

        keywords =
            removeDuplicates(
                keywords
            );


        // --------------------------------------------------
        // MAIN KEYWORD FIRST
        // --------------------------------------------------

        keywords =
            prioritizeMainKeyword(
                keywords,
                finalMainKeyword
            );


        // --------------------------------------------------
        // ENSURE MAIN KEYWORD
        // --------------------------------------------------

        const mainExists =
            keywords.some(
                keyword =>

                    normalizeKeyword(
                        keyword
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


        // --------------------------------------------------
        // MAXIMUM 20
        // --------------------------------------------------

        keywords =
            keywords.slice(
                0,
                20
            );


        // ==================================================
        // NO KEYWORDS
        // ==================================================

        if (!keywords.length) {

            throw new Error(
                "AI ने कोई SEO keyword नहीं दिया।"
            );

        }


        // ==================================================
        // DISPLAY
        // ==================================================

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


        // ==================================================
        // SUCCESS MESSAGE
        // ==================================================

        showStatus(

            "✅ " +
            keywords.length +
            " relevant SEO keywords generated successfully."

        );


        console.log(
            "SEO keywords generated:",
            keywords
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

                (
                    error &&
                    error.message

                        ? error.message

                        : "Unknown error"
                );

        }


        showStatus(
            "❌ SEO generation failed."
        );

    }
    finally {

        // --------------------------------------------------
        // RESTORE BUTTON
        // --------------------------------------------------

        if (generateBtn) {

            generateBtn.disabled =
                false;

            generateBtn.innerText =
                "🤖 Generate SEO Keywords";

        }

    }

}


// ==========================================================
// STATUS
// ==========================================================

function showStatus(message) {

    if (status) {

        status.innerText =
            message;

    }

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

function normalizeKeyword(text) {

    if (!text) {

        return "";

    }


    return String(text)

        .toLowerCase()

        .replace(
            /[’']/g,
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

function removeDuplicates(keywords) {

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
            "❌ Result field नहीं मिला।"
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


    // ------------------------------------------------------
    // MODERN CLIPBOARD
    // ------------------------------------------------------

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


        return;

    }


    // ------------------------------------------------------
    // FALLBACK
    // ------------------------------------------------------

    fallbackCopy(
        text
    );

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
// END
// ==========================================================
