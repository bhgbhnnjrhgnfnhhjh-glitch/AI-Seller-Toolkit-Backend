// ==========================================================
// AI SELLER TOOLKIT
// SEO GENERATOR — FINAL VERSION 20.0
// ==========================================================
// Fix:
// ✅ Correct Product Name ID: product
// ✅ Correct Category ID: category
// ✅ Correct Brand ID: brand
// ✅ Correct Main Keyword ID: keyword
// ✅ Correct Marketplace ID: marketplace
// ✅ Backend API connection
// ✅ No generic keyword templates
// ✅ No fake specifications
// ✅ No invented audience/use-case
// ✅ Duplicate removal
// ✅ Safe response parsing
// ==========================================================

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // ======================================================
    // ELEMENTS
    // ======================================================

    const productInput =
        document.getElementById("product");

    const categoryInput =
        document.getElementById("category");

    const brandInput =
        document.getElementById("brand");

    const keywordInput =
        document.getElementById("keyword");

    const marketplaceInput =
        document.getElementById("marketplace");

    const generateBtn =
        document.getElementById("generateBtn");

    const copyBtn =
        document.getElementById("copyBtn");

    const statusBox =
        document.getElementById("status");

    const resultBox =
        document.getElementById("result");


    // ======================================================
    // BACKEND
    // ======================================================

    const API_BASE =
        "https://ai-seller-toolkit-backend-1.onrender.com";


    const SEO_ENDPOINT =
        API_BASE + "/api/generate-seo";


    // ======================================================
    // BASIC SAFETY CHECK
    // ======================================================

    if (!productInput) {

        console.error(
            "SEO ERROR: #product element not found."
        );

    }

    if (!categoryInput) {

        console.error(
            "SEO ERROR: #category element not found."
        );

    }

    if (!generateBtn) {

        console.error(
            "SEO ERROR: #generateBtn element not found."
        );

    }


    // ======================================================
    // STATUS
    // ======================================================

    function showStatus(message, type) {

        if (!statusBox) return;

        statusBox.textContent =
            message || "";

        if (type === "error") {

            statusBox.style.color =
                "#d93025";

        } else if (type === "success") {

            statusBox.style.color =
                "#16823b";

        } else {

            statusBox.style.color =
                "#345c91";

        }

    }


    // ======================================================
    // GET VALUE SAFELY
    // ======================================================

    function getValue(element) {

        if (!element) return "";

        return String(
            element.value || ""
        ).trim();

    }


    // ======================================================
    // NORMALIZE CATEGORY
    // ======================================================

    function normalizeCategory(category) {

        let value =
            String(category || "").trim();

        // Remove emoji from select text if ever included
        value = value
            .replace(
                /^[^\p{L}\p{N}&]+/u,
                ""
            )
            .trim();

        const aliases = {

            "Fashion & Clothing":
                "Fashion",

            "Fashion":
                "Fashion",

            "Beauty & Personal Care":
                "Beauty",

            "Beauty":
                "Beauty",

            "Electronics":
                "Electronics",

            "Home and Kitchen":
                "Home & Kitchen",

            "Home & Kitchen":
                "Home & Kitchen",

            "Shoes & Footwear":
                "Shoes",

            "Shoes":
                "Shoes",

            "Jewelry":
                "Jewellery",

            "Jewellery":
                "Jewellery",

            "Toys":
                "Toys",

            "Books":
                "Books",

            "Pet Supplies":
                "Pet",

            "Pet":
                "Pet",

            "Sports":
                "Sports",

            "Automotive":
                "Automotive",

            "Garden":
                "Garden",

            "Food":
                "Food",

            "Gifts":
                "Gifts"

        };

        return (
            aliases[value] || value
        );

    }


    // ======================================================
    // CLEAN TEXT
    // ======================================================

    function cleanText(value) {

        return String(value || "")
            .replace(/\s+/g, " ")
            .trim();

    }


    // ======================================================
    // NORMALIZE KEYWORD
    // ======================================================

    function normalizeKeyword(value) {

        let keyword =
            cleanText(value);

        // Remove numbering
        keyword =
            keyword.replace(
                /^\s*(?:[-•*]|\d+[\.\)])\s*/,
                ""
            );

        // Remove wrapping quotes
        keyword =
            keyword.replace(
                /^["'“”‘’]+|["'“”‘’]+$/g,
                ""
            );

        return keyword.trim();

    }


    // ======================================================
    // FORBIDDEN GENERIC / UNSUPPORTED PATTERNS
    // ======================================================

    const forbiddenPatterns = [

        /\bonline\b/i,

        /\bbuy\b/i,

        /\bshop\b/i,

        /\bshopping\b/i,

        /\bstore\b/i,

        /\bcatalog\b/i,

        /\bcollection\b/i,

        /\bapparel\b/i,

        /\bfashion wear\b/i,

        /\bwomen\b/i,

        /\bwoman\b/i,

        /\bmen\b/i,

        /\bman\b/i,

        /\bgirls\b/i,

        /\bboys\b/i,

        /\bdaily wear\b/i,

        /\bparty wear\b/i,

        /\bpremium\b/i,

        /\bbest\b/i,

        /\bcheap\b/i,

        /\bhigh quality\b/i,

        /\baffordable\b/i,

        /\bamazon\b/i,

        /\bmeesho\b/i,

        /\bflipkart\b/i,

        /\bet[s]?y\b/i,

        /\bshopify\b/i,

        /\bolx\b/i,

        /\bfree shipping\b/i,

        /\bfast delivery\b/i,

        /\bdiscount\b/i,

        /\boffer\b/i,

        /\bguaranteed\b/i

    ];


    // ======================================================
    // CHECK UNSUPPORTED KEYWORD
    // ======================================================

    function containsForbiddenPattern(keyword) {

        return forbiddenPatterns.some(
            function (pattern) {

                return pattern.test(
                    keyword
                );

            }
        );

    }


    // ======================================================
    // EXTRACT KEYWORDS FROM RESPONSE
    // ======================================================

    function extractKeywords(data) {

        let keywords = [];


        // ----------------------------------------------
        // Direct arrays
        // ----------------------------------------------

        if (
            data &&
            Array.isArray(data.keywords)
        ) {

            keywords =
                data.keywords;

        }

        else if (
            data &&
            Array.isArray(data.seoKeywords)
        ) {

            keywords =
                data.seoKeywords;

        }

        else if (
            data &&
            Array.isArray(data.seo_keywords)
        ) {

            keywords =
                data.seo_keywords;

        }

        else if (
            data &&
            Array.isArray(data.results)
        ) {

            keywords =
                data.results;

        }


        // ----------------------------------------------
        // String response
        // ----------------------------------------------

        else if (
            data &&
            typeof data.text === "string"
        ) {

            keywords =
                data.text.split(/\r?\n/);

        }

        else if (
            data &&
            typeof data.result === "string"
        ) {

            keywords =
                data.result.split(/\r?\n/);

        }

        else if (
            typeof data === "string"
        ) {

            keywords =
                data.split(/\r?\n/);

        }


        return keywords;

    }


    // ======================================================
    // CLEAN AND VALIDATE KEYWORDS
    // ======================================================

    function cleanKeywords(
        rawKeywords,
        product,
        brand
    ) {

        const finalKeywords = [];

        const seen = new Set();


        const productLower =
            product.toLowerCase();

        const brandLower =
            brand.toLowerCase();


        for (
            const raw of rawKeywords
        ) {

            let keyword =
                normalizeKeyword(raw);


            if (!keyword) {
                continue;
            }


            // Remove excessive whitespace
            keyword =
                keyword.replace(
                    /\s+/g,
                    " "
                ).trim();


            // Maximum reasonable length
            if (
                keyword.length > 120
            ) {
                continue;
            }


            // Remove generic/filler keywords
            if (
                containsForbiddenPattern(
                    keyword
                )
            ) {
                continue;
            }


            const lower =
                keyword.toLowerCase();


            // Duplicate
            if (
                seen.has(lower)
            ) {
                continue;
            }


            // ------------------------------------------
            // Keyword should relate to product
            // ------------------------------------------

            const productWords =
                productLower
                    .split(/\s+/)
                    .filter(
                        word =>
                            word.length >= 3
                    );


            const hasProductRelation =
                productWords.length === 0
                    ? true
                    : productWords.some(
                        word =>
                            lower.includes(
                                word
                            )
                    );


            // If brand is present, brand keyword
            // is allowed only when it actually appears.
            const hasBrandRelation =
                brandLower &&
                lower.includes(
                    brandLower
                );


            if (
                !hasProductRelation &&
                !hasBrandRelation
            ) {

                continue;

            }


            seen.add(lower);

            finalKeywords.push(
                keyword
            );


            // Maximum 20
            if (
                finalKeywords.length >= 20
            ) {

                break;

            }

        }


        return finalKeywords;

    }


    // ======================================================
    // SAFE JSON RESPONSE
    // ======================================================

    async function readResponse(response) {

        const text =
            await response.text();


        if (!text) {

            return {};

        }


        try {

            return JSON.parse(text);

        }

        catch (error) {

            return {
                text: text
            };

        }

    }


    // ======================================================
    // GENERATE SEO
    // ======================================================

    async function generateSEO() {

        // --------------------------------------------------
        // IMPORTANT:
        // Read EXACT IDs from current HTML
        // --------------------------------------------------

        const product =
            getValue(productInput);

        const category =
            normalizeCategory(
                getValue(categoryInput)
            );

        const brand =
            getValue(brandInput);

        const mainKeyword =
            getValue(keywordInput);

        const marketplace =
            getValue(marketplaceInput);


        // DEBUG
        console.log(
            "SEO INPUT:",
            {
                product,
                category,
                brand,
                mainKeyword,
                marketplace
            }
        );


        // ==================================================
        // PRODUCT VALIDATION
        // ==================================================

        if (!product) {

            showStatus(
                "❌ Product name is required.",
                "error"
            );

            if (productInput) {

                productInput.focus();

            }

            return;

        }


        // ==================================================
        // CATEGORY VALIDATION
        // ==================================================

        if (!category) {

            showStatus(
                "❌ Product category is required.",
                "error"
            );

            if (categoryInput) {

                categoryInput.focus();

            }

            return;

        }


        // ==================================================
        // BUTTON STATE
        // ==================================================

        if (generateBtn) {

            generateBtn.disabled = true;

            generateBtn.textContent =
                "⏳ Generating SEO Keywords...";

        }


        if (resultBox) {

            resultBox.value = "";

        }


        showStatus(
            "⏳ Generating relevant SEO keywords...",
            "loading"
        );


        try {

            // ==============================================
            // API REQUEST
            // ==============================================

            const response =
                await fetch(
                    SEO_ENDPOINT,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body: JSON.stringify({

                            product:
                                product,

                            category:
                                category,

                            brand:
                                brand,

                            mainKeyword:
                                mainKeyword,

                            marketplace:
                                marketplace

                        })

                    }
                );


            const data =
                await readResponse(
                    response
                );


            console.log(
                "SEO API RESPONSE:",
                data
            );


            // ==============================================
            // HTTP ERROR
            // ==============================================

            if (!response.ok) {

                const errorMessage =
                    data &&
                    (
                        data.error ||
                        data.message
                    );

                throw new Error(
                    errorMessage ||
                    "SEO API request failed."
                );

            }


            // ==============================================
            // API SUCCESS CHECK
            // ==============================================

            if (
                data &&
                data.success === false
            ) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "SEO generation failed."
                );

            }


            // ==============================================
            // EXTRACT
            // ==============================================

            const rawKeywords =
                extractKeywords(data);


            // ==============================================
            // CLEAN
            // ==============================================

            const keywords =
                cleanKeywords(
                    rawKeywords,
                    product,
                    brand
                );


            // ==============================================
            // NO VALID RESULT
            // ==============================================

            if (
                keywords.length === 0
            ) {

                throw new Error(
                    "No valid factual SEO keywords were returned. Please provide more product details."
                );

            }


            // ==============================================
            // DISPLAY
            // ==============================================

            if (resultBox) {

                resultBox.value =
                    keywords
                        .map(
                            (
                                keyword,
                                index
                            ) =>
                                `${index + 1}. ${keyword}`
                        )
                        .join("\n");

            }


            showStatus(
                `✅ ${keywords.length} relevant SEO keyword${keywords.length === 1 ? "" : "s"} generated.`,
                "success"
            );


        }

        catch (error) {

            console.error(
                "SEO GENERATOR ERROR:",
                error
            );


            if (resultBox) {

                resultBox.value = "";

            }


            showStatus(
                "❌ " +
                (
                    error.message ||
                    "SEO generation failed."
                ),
                "error"
            );

        }

        finally {

            if (generateBtn) {

                generateBtn.disabled =
                    false;

                generateBtn.textContent =
                    "🤖 Generate SEO Keywords";

            }

        }

    }


    // ======================================================
    // GENERATE BUTTON
    // ======================================================

    if (generateBtn) {

        generateBtn.addEventListener(
            "click",
            generateSEO
        );

    }


    // ======================================================
    // ENTER KEY SUPPORT
    // ======================================================

    [
        productInput,
        categoryInput,
        brandInput,
        keywordInput,
        marketplaceInput

    ].forEach(
        function (element) {

            if (!element) return;

            element.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        generateSEO();

                    }

                }
            );

        }
    );


    // ======================================================
    // COPY KEYWORDS
    // ======================================================

    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            async function () {

                const text =
                    resultBox
                        ? resultBox.value.trim()
                        : "";


                if (!text) {

                    showStatus(
                        "❌ पहले SEO keywords generate करें.",
                        "error"
                    );

                    return;

                }


                try {

                    await navigator.clipboard.writeText(
                        text
                    );


                    showStatus(
                        "✅ Keywords copied successfully.",
                        "success"
                    );

                }

                catch (error) {

                    // --------------------------------------
                    // Fallback for older Android browsers
                    // --------------------------------------

                    if (resultBox) {

                        resultBox.removeAttribute(
                            "readonly"
                        );

                        resultBox.select();

                        document.execCommand(
                            "copy"
                        );

                        resultBox.setAttribute(
                            "readonly",
                            "readonly"
                        );

                        showStatus(
                            "✅ Keywords copied successfully.",
                            "success"
                        );

                    }

                }

            }
        );

    }


    // ======================================================
    // INITIAL STATUS
    // ======================================================

    console.log(
        "AI Seller Toolkit SEO Generator 20.0 loaded."
    );

});
