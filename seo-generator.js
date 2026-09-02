// ==========================================================
// AI SELLER TOOLKIT
// SEO GENERATOR — FINAL VERSION 21.0
// ==========================================================
//
// FIXES:
// ✅ Fixed JavaScript syntax error
// ✅ Correct Product ID: product
// ✅ Correct Category ID: category
// ✅ Correct Brand ID: brand
// ✅ Correct Main Keyword ID: keyword
// ✅ Correct Marketplace ID: marketplace
// ✅ Correct Generate Button ID: generateBtn
// ✅ Correct Result ID: result
// ✅ Correct Status ID: status
// ✅ Backend API connection
// ✅ No generic keyword templates
// ✅ No fake specifications
// ✅ No invented audience
// ✅ No invented use-case
// ✅ No marketplace stuffing
// ✅ Duplicate removal
// ✅ Safe API response parsing
// ✅ Safe JSON extraction
// ✅ Supports multiple backend response formats
// ✅ Maximum 20 keywords
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
    // INITIAL CHECK
    // ======================================================

    console.log(
        "AI Seller Toolkit SEO Generator 21.0 loaded."
    );

    console.log(
        "SEO elements:",
        {
            product: !!productInput,
            category: !!categoryInput,
            brand: !!brandInput,
            keyword: !!keywordInput,
            marketplace: !!marketplaceInput,
            generateBtn: !!generateBtn,
            copyBtn: !!copyBtn,
            status: !!statusBox,
            result: !!resultBox
        }
    );


    // ======================================================
    // ELEMENT ERROR CHECK
    // ======================================================

    if (!productInput) {
        console.error(
            "SEO ERROR: #product not found."
        );
    }

    if (!categoryInput) {
        console.error(
            "SEO ERROR: #category not found."
        );
    }

    if (!generateBtn) {
        console.error(
            "SEO ERROR: #generateBtn not found."
        );
    }

    if (!resultBox) {
        console.error(
            "SEO ERROR: #result not found."
        );
    }


    // ======================================================
    // STATUS
    // ======================================================

    function showStatus(message, type) {

        if (!statusBox) {
            return;
        }

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
    // SAFE VALUE
    // ======================================================

    function getValue(element) {

        if (!element) {
            return "";
        }

        return String(
            element.value || ""
        ).trim();

    }


    // ======================================================
    // CATEGORY NORMALIZER
    // ======================================================

    function normalizeCategory(value) {

        let category =
            String(value || "").trim();

        // Remove leading emoji/symbols.
        category =
            category.replace(
                /^[^\p{L}\p{N}&]+/u,
                ""
            ).trim();

        const aliases = {

            "Fashion":
                "Fashion",

            "Fashion & Clothing":
                "Fashion",

            "Beauty":
                "Beauty",

            "Beauty & Personal Care":
                "Beauty",

            "Electronics":
                "Electronics",

            "Home & Kitchen":
                "Home & Kitchen",

            "Home and Kitchen":
                "Home & Kitchen",

            "Shoes":
                "Shoes",

            "Shoes & Footwear":
                "Shoes",

            "Jewellery":
                "Jewellery",

            "Jewelry":
                "Jewellery",

            "Toys":
                "Toys",

            "Books":
                "Books",

            "Pet":
                "Pet",

            "Pet Supplies":
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
            aliases[category] ||
            category
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

        if (!keyword) {
            return "";
        }

        // Remove numbering.
        keyword =
            keyword.replace(
                /^\s*(?:[-•*]|\d+[\.\)])\s*/,
                ""
            );

        // Remove common bullets.
        keyword =
            keyword.replace(
                /^[•●▪◦►→]+\s*/,
                ""
            );

        // Remove surrounding quotes.
        keyword =
            keyword.replace(
                /^["'“”‘’]+|["'“”‘’]+$/g,
                ""
            );

        return keyword.trim();

    }


    // ======================================================
    // FORBIDDEN GENERIC / UNSUPPORTED TERMS
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
        /\betsy\b/i,
        /\bshopify\b/i,
        /\bolx\b/i,

        /\bfree shipping\b/i,
        /\bfast delivery\b/i,

        /\bdiscount\b/i,
        /\boffer\b/i,
        /\bguaranteed\b/i

    ];


    // ======================================================
    // FORBIDDEN CHECK
    // ======================================================

    function containsForbiddenPattern(
        keyword
    ) {

        return forbiddenPatterns.some(
            function (pattern) {

                return pattern.test(
                    keyword
                );

            }
        );

    }


    // ======================================================
    // EXTRACT KEYWORDS
    // ======================================================

    function extractKeywords(data) {

        let keywords = [];


        // --------------------------------------------------
        // Direct arrays
        // --------------------------------------------------

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

        else if (
            data &&
            Array.isArray(data.data)
        ) {

            keywords =
                data.data;

        }


        // --------------------------------------------------
        // Object containing keywords
        // --------------------------------------------------

        else if (
            data &&
            data.data &&
            Array.isArray(data.data.keywords)
        ) {

            keywords =
                data.data.keywords;

        }

        else if (
            data &&
            data.result &&
            Array.isArray(data.result.keywords)
        ) {

            keywords =
                data.result.keywords;

        }


        // --------------------------------------------------
        // String response
        // --------------------------------------------------

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
            data &&
            typeof data.output === "string"
        ) {

            keywords =
                data.output.split(/\r?\n/);

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
    // CLEAN KEYWORDS
    // ======================================================

    function cleanKeywords(
        rawKeywords,
        product,
        brand,
        mainKeyword
    ) {

        const finalKeywords = [];

        const seen = new Set();


        const productLower =
            cleanText(product).toLowerCase();

        const brandLower =
            cleanText(brand).toLowerCase();

        const mainKeywordLower =
            cleanText(mainKeyword).toLowerCase();


        const productWords =
            productLower
                .split(/\s+/)
                .filter(
                    function (word) {

                        return (
                            word.length >= 3
                        );

                    }
                );


        for (
            const raw of rawKeywords
        ) {

            let keyword =
                normalizeKeyword(raw);


            if (!keyword) {
                continue;
            }


            // ------------------------------------------------
            // Length protection
            // ------------------------------------------------

            if (
                keyword.length > 120
            ) {

                continue;

            }


            // ------------------------------------------------
            // Remove generic/filler terms
            // ------------------------------------------------

            if (
                containsForbiddenPattern(
                    keyword
                )
            ) {

                continue;

            }


            const lower =
                keyword.toLowerCase();


            // ------------------------------------------------
            // Duplicate
            // ------------------------------------------------

            if (
                seen.has(lower)
            ) {

                continue;

            }


            // ------------------------------------------------
            // Product relation
            //
            // A keyword should normally contain at least
            // one meaningful product word.
            // ------------------------------------------------

            let hasProductRelation =
                false;


            if (
                productWords.length === 0
            ) {

                hasProductRelation = true;

            } else {

                hasProductRelation =
                    productWords.some(
                        function (word) {

                            return lower.includes(
                                word
                            );

                        }
                    );

            }


            // ------------------------------------------------
            // Brand relation
            // ------------------------------------------------

            const hasBrandRelation =
                brandLower &&
                lower.includes(
                    brandLower
                );


            // ------------------------------------------------
            // Main keyword relation
            // ------------------------------------------------

            const hasMainKeywordRelation =
                mainKeywordLower &&
                lower.includes(
                    mainKeywordLower
                );


            if (
                !hasProductRelation &&
                !hasBrandRelation &&
                !hasMainKeywordRelation
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
    // SAFE RESPONSE READER
    // ======================================================

    async function readResponse(
        response
    ) {

        const text =
            await response.text();


        if (!text) {

            return {};

        }


        try {

            return JSON.parse(text);

        }

        catch (error) {

            console.warn(
                "SEO API returned non-JSON response."
            );

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
        // Read exact HTML IDs
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


        // --------------------------------------------------
        // Debug
        // --------------------------------------------------

        console.log(
            "SEO INPUT:",
            {
                product: product,
                category: category,
                brand: brand,
                mainKeyword: mainKeyword,
                marketplace: marketplace
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

            // ==================================================
            // API REQUEST
            // ==================================================

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


            // ==================================================
            // READ RESPONSE
            // ==================================================

            const data =
                await readResponse(
                    response
                );


            console.log(
                "SEO API RESPONSE:",
                data
            );


            // ==================================================
            // HTTP ERROR
            // ==================================================

            if (!response.ok) {

                const errorMessage =
                    data &&
                    (
                        data.error ||
                        data.message
                    );


                throw new Error(
                    errorMessage ||
                    (
                        "SEO API request failed. HTTP " +
                        response.status
                    )
                );

            }


            // ==================================================
            // BACKEND SUCCESS CHECK
            // ==================================================

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


            // ==================================================
            // EXTRACT RAW KEYWORDS
            // ==================================================

            const rawKeywords =
                extractKeywords(
                    data
                );


            console.log(
                "RAW SEO KEYWORDS:",
                rawKeywords
            );


            // ==================================================
            // CLEAN KEYWORDS
            // ==================================================

            const keywords =
                cleanKeywords(
                    rawKeywords,
                    product,
                    brand,
                    mainKeyword
                );


            console.log(
                "FINAL SEO KEYWORDS:",
                keywords
            );


            // ==================================================
            // NO VALID RESULT
            // ==================================================

            if (
                keywords.length === 0
            ) {

                throw new Error(
                    "No valid factual SEO keywords were returned. Please provide more product details."
                );

            }


            // ==================================================
            // DISPLAY
            // ==================================================

            if (resultBox) {

                resultBox.value =
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

            }


            // ==================================================
            // SUCCESS
            // ==================================================

            showStatus(
                "✅ " +
                keywords.length +
                " relevant SEO keyword" +
                (
                    keywords.length === 1
                        ? ""
                        : "s"
                ) +
                " generated.",
                "success"
            );

        }

        catch (error) {

            // ==================================================
            // ERROR
            // ==================================================

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
                    error &&
                    error.message
                        ? error.message
                        : "SEO generation failed."
                ),
                "error"
            );

        }

        finally {

            // ==================================================
            // RESTORE BUTTON
            // ==================================================

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
            function () {

                generateSEO();

            }
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

            if (!element) {
                return;
            }

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

                if (!resultBox) {

                    showStatus(
                        "❌ Result box not found.",
                        "error"
                    );

                    return;

                }


                const text =
                    resultBox.value.trim();


                if (!text) {

                    showStatus(
                        "❌ Generate keywords first.",
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

                    // ------------------------------------------
                    // Fallback for older mobile browsers
                    // ------------------------------------------

                    try {

                        resultBox.focus();

                        resultBox.select();

                        document.execCommand(
                            "copy"
                        );


                        showStatus(
                            "✅ Keywords copied successfully.",
                            "success"
                        );

                    }

                    catch (copyError) {

                        console.error(
                            "COPY ERROR:",
                            copyError
                        );

                        showStatus(
                            "❌ Unable to copy keywords.",
                            "error"
                        );

                    }

                }

            }
        );

    }


    // ======================================================
    // INITIAL STATUS
    // ======================================================

    showStatus(
        "",
        "loading"
    );


    // ======================================================
    // FINAL READY MESSAGE
    // ======================================================

    console.log(
        "AI Seller Toolkit SEO Generator 21.0 ready."
    );

});
