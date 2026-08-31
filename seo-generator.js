// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR
// FINAL VERSION 13.0
// ==========================================================
// Backend Connected
// Main Keyword Optional
// Product Name fallback
// 14 Categories Supported
// Safe + Factual SEO
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
// CATEGORY LIST
// ==========================================================

const SUPPORTED_CATEGORIES = [

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
    // CHECK HTML ELEMENTS
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
    // GET VALUES
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
    // VALIDATION — PRODUCT
    // ========================================================

    if (!product) {

        showStatus(
            "❌ Please enter Product Name."
        );

        productElement.focus();

        return;

    }


    // ========================================================
    // VALIDATION — CATEGORY
    // ========================================================

    if (!category) {

        showStatus(
            "❌ Please select Product Category."
        );

        categoryElement.focus();

        return;

    }


    // ========================================================
    // CATEGORY CHECK
    // ========================================================

    const validCategory =
        SUPPORTED_CATEGORIES.some(
            item =>
                item.toLowerCase() ===
                category.toLowerCase()
        );


    if (!validCategory) {

        showStatus(
            "❌ Please select a valid product category."
        );

        categoryElement.focus();

        return;

    }


    // ========================================================
    // OPTIONAL MAIN KEYWORD
    // ========================================================
    //
    // अगर Main Keyword खाली है,
    // तो Product Name automatically Main Keyword बनेगा।
    //
    // Example:
    //
    // Product Name:
    // Cotton Kurti
    //
    // Main Keyword:
    // खाली
    //
    // Final Main Keyword:
    // Cotton Kurti
    // ========================================================

    const finalMainKeyword =
        mainKeyword || product;


    // ========================================================
    // UI START
    // ========================================================

    generateBtn.disabled = true;

    generateBtn.innerText =
        "⏳ Generating SEO Keywords...";


    showStatus(
        "🤖 AI relevant SEO keywords बना रहा है..."
    );


    result.value =
        "⏳ Please wait...\n\nAI keywords generate कर रहा है।";


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
                                finalMainKeyword,

                            marketplace:
                                marketplace || "All Marketplaces"

                        })

                }
            );


        // ====================================================
        // RESPONSE TEXT
        // ====================================================

        const responseText =
            await response.text();


        // ====================================================
        // EMPTY RESPONSE
        // ====================================================

        if (!responseText) {

            throw new Error(
                "Backend ने कोई response नहीं दिया।"
            );

        }


        // ====================================================
        // PARSE JSON
        // ====================================================

        let data;

        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch {

            console.error(
                "INVALID JSON:",
                responseText
            );

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
        // ====================================================

        let keywords =
            Array.isArray(
                data.keywords
            )
                ? data.keywords
                : [];


        // ====================================================
        // CLEAN
        // ====================================================

        keywords =
            keywords
                .map(cleanKeyword)
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

                    normalizeKeyword(item) ===
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
        // MAX 20 KEYWORDS
        // ====================================================

        keywords =
            keywords.slice(
                0,
                20
            );


        // ====================================================
        // EMPTY RESULT CHECK
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


        // ====================================================
        // ERROR DISPLAY
        // ====================================================

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

        // ====================================================
        // RESET BUTTON
        // ====================================================

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

    if (status) {

        status.innerText =
            message;

    }

}


// ==========================================================
// CLEAN KEYWORD
// ==========================================================

function cleanKeyword(value) {

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

        // T-Shirt variations
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


    keywords.forEach(
        keyword => {

            const normalized =
                normalizeKeyword(
                    keyword
                );


            if (
                !normalized ||
                seen.has(normalized)
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

        const successful =
            document.execCommand(
                "copy"
            );


        if (successful) {

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
            "COPY ERROR:",
            error
        );


        alert(
            "❌ Copy नहीं हो सका।"
        );

    }


    textarea.remove();

}


// ==========================================================
// BACKEND CONNECTION TEST
// ==========================================================
//
// Page खुलने पर backend को check करेगा।
// इससे पता चलेगा कि Render server online है या नहीं.
// ==========================================================

async function checkBackendConnection() {

    try {

        const response =
            await fetch(
                API_URL +
                "/api/status",
                {

                    method: "GET",

                    cache: "no-store"

                }
            );


        if (!response.ok) {

            throw new Error(
                "Backend status: " +
                response.status
            );

        }


        const data =
            await response.json();


        if (
            data &&
            data.success === true
        ) {

            console.log(
                "✅ AI Seller Toolkit Backend Connected",
                data
            );

        }
        else {

            console.warn(
                "⚠️ Backend response invalid",
                data
            );

        }

    }
    catch (error) {

        console.error(
            "❌ Backend connection failed:",
            error
        );

        showStatus(
            "⚠️ Backend से connection नहीं हो पाया।"
        );

    }

}


// ==========================================================
// START BACKEND CHECK
// ==========================================================

checkBackendConnection();


// ==========================================================
// END
// ==========================================================
