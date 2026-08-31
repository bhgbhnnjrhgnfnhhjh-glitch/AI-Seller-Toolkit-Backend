// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR
// FINAL VERSION 13.0
// ==========================================================
// Safe + Stable Frontend
// Main Keyword OPTIONAL
// Product Name becomes Main Keyword automatically
// ==========================================================

"use strict";


// ==========================================================
// API
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";


// ==========================================================
// START
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const generateBtn =
            document.getElementById("generateBtn");

        const copyBtn =
            document.getElementById("copyBtn");

        const result =
            document.getElementById("result");

        const status =
            document.getElementById("status");


        // --------------------------------------------------
        // CHECK HTML ELEMENTS
        // --------------------------------------------------

        if (!generateBtn) {
            console.error(
                "SEO ERROR: generateBtn not found."
            );
            return;
        }

        if (!result) {
            console.error(
                "SEO ERROR: result textarea not found."
            );
            return;
        }


        // --------------------------------------------------
        // GENERATE BUTTON
        // --------------------------------------------------

        generateBtn.addEventListener(
            "click",
            generateSEO
        );


        // --------------------------------------------------
        // COPY BUTTON
        // --------------------------------------------------

        if (copyBtn) {

            copyBtn.addEventListener(
                "click",
                copySEO
            );

        }


        // --------------------------------------------------
        // READY MESSAGE
        // --------------------------------------------------

        console.log(
            "✅ SEO Keyword Generator loaded successfully."
        );


        // ==================================================
        // GENERATE SEO
        // ==================================================

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


            // ------------------------------------------------
            // ELEMENT CHECK
            // ------------------------------------------------

            if (
                !productElement ||
                !categoryElement ||
                !brandElement ||
                !keywordElement ||
                !marketplaceElement
            ) {

                showStatus(
                    "❌ SEO form में कोई required field नहीं मिली।"
                );

                return;
            }


            // ------------------------------------------------
            // VALUES
            // ------------------------------------------------

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


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

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


            // ------------------------------------------------
            // MAIN KEYWORD OPTIONAL
            // ------------------------------------------------
            //
            // अगर Main Keyword खाली है,
            // तो Product Name automatically
            // Main Keyword बन जाएगा।
            // ------------------------------------------------

            const finalMainKeyword =
                mainKeyword || product;


            // ------------------------------------------------
            // BUTTON UI
            // ------------------------------------------------

            generateBtn.disabled = true;

            generateBtn.innerText =
                "⏳ Generating SEO Keywords...";


            showStatus(
                "⏳ AI SEO keywords बना रहा है..."
            );


            result.value =
                "⏳ Please wait...";


            try {

                console.log(
                    "SEO Request:",
                    {
                        category,
                        productName: product,
                        brand,
                        mainKeyword: finalMainKeyword,
                        marketplace
                    }
                );


                // ============================================
                // API REQUEST
                // ============================================

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


                console.log(
                    "SEO API Status:",
                    response.status
                );


                // ============================================
                // READ RESPONSE
                // ============================================

                let data = null;

                const responseText =
                    await response.text();


                console.log(
                    "SEO API Raw Response:",
                    responseText
                );


                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                }
                catch {

                    throw new Error(
                        "Backend ने valid JSON response नहीं दिया।"
                    );

                }


                // ============================================
                // BACKEND ERROR
                // ============================================

                if (!response.ok) {

                    throw new Error(
                        data &&
                        data.error
                            ? data.error
                            : "Backend Error: " +
                              response.status
                    );

                }


                // ============================================
                // SUCCESS CHECK
                // ============================================

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


                // ============================================
                // KEYWORDS
                // ============================================

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
                        finalMainKeyword
                    );


                // Ensure main keyword exists
                const mainExists =
                    keywords.some(
                        function (item) {

                            return (
                                normalizeKeyword(
                                    item
                                ) ===
                                normalizeKeyword(
                                    finalMainKeyword
                                )
                            );

                        }
                    );


                if (!mainExists) {

                    keywords.unshift(
                        finalMainKeyword
                    );

                }


                // Maximum 20
                keywords =
                    keywords.slice(
                        0,
                        20
                    );


                // ============================================
                // NO KEYWORDS
                // ============================================

                if (!keywords.length) {

                    throw new Error(
                        "AI ने कोई keyword नहीं दिया।"
                    );

                }


                // ============================================
                // DISPLAY
                // ============================================

                result.value =
                    keywords
                        .map(
                            function (
                                item,
                                index
                            ) {

                                return (
                                    (index + 1) +
                                    ". " +
                                    item
                                );

                            }
                        )
                        .join("\n");


                showStatus(
                    "✅ " +
                    keywords.length +
                    " relevant SEO keywords generated successfully."
                );


                console.log(
                    "✅ SEO Keywords:",
                    keywords
                );


            }
            catch (error) {

                console.error(
                    "❌ SEO Generator Error:",
                    error
                );


                result.value =
                    "❌ SEO Keywords generate नहीं हो सके.\n\n" +
                    "Error: " +
                    (
                        error.message ||
                        "Unknown error"
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


        // ==================================================
        // STATUS
        // ==================================================

        function showStatus(message) {

            if (status) {

                status.innerText =
                    message;

            }

        }


        // ==================================================
        // CLEAN KEYWORD
        // ==================================================

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


        // ==================================================
        // NORMALIZE KEYWORD
        // ==================================================

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


        // ==================================================
        // REMOVE DUPLICATES
        // ==================================================

        function removeDuplicates(keywords) {

            const output = [];

            const seen =
                new Set();


            keywords.forEach(
                function (keyword) {

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


        // ==================================================
        // MAIN KEYWORD FIRST
        // ==================================================

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
                    function (item) {

                        return (
                            normalizeKeyword(
                                item
                            ) === target
                        );

                    }
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


        // ==================================================
        // COPY SEO
        // ==================================================

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


        // ==================================================
        // FALLBACK COPY
        // ==================================================

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

    }
);
