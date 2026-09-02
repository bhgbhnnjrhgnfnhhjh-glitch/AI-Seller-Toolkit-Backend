// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 19.0
// ==========================================================
//
// PURPOSE:
// Factual + Relevant + Non-Hallucinating SEO Keyword Generator
//
// IMPORTANT:
// This frontend DOES NOT create generic SEO templates.
//
// ❌ No: product + online
// ❌ No: product + buy
// ❌ No: product + shop
// ❌ No: product + shopping
// ❌ No: product + collection
// ❌ No: product + design
// ❌ No: product + fashion
// ❌ No: product + apparel
// ❌ No: product + outfit
// ❌ No: product + price
// ❌ No: product + for women/men
// ❌ No: marketplace stuffing
//
// The frontend sends factual product information to the backend.
// Backend endpoint:
// /api/generate-seo
//
// ==========================================================

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // ======================================================
    // CONFIGURATION
    // ======================================================

    const API_URL =
        "https://ai-seller-toolkit-backend-1.onrender.com";

    const SEO_API =
        API_URL + "/api/generate-seo";

    const VERSION = "19.0";


    // ======================================================
    // HTML ELEMENTS
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

    const resultBox =
        document.getElementById("result");

    const statusBox =
        document.getElementById("status");


    // ======================================================
    // REQUIRED ELEMENT CHECK
    // ======================================================

    if (
        !productInput ||
        !categoryInput ||
        !generateBtn ||
        !resultBox
    ) {

        console.error(
            "SEO Generator " +
            VERSION +
            ": Required HTML elements are missing."
        );

        return;
    }


    // ======================================================
    // TEXT CLEANER
    // ======================================================

    function cleanText(value) {

        return String(value || "")
            .replace(/[\u0000-\u001F\u007F]/g, " ")
            .replace(/\s+/g, " ")
            .replace(/[<>]/g, "")
            .trim();

    }


    // ======================================================
    // CATEGORY NORMALIZER
    // ======================================================

    function normalizeCategory(value) {

        let category =
            cleanText(value);

        category = category
            .replace(/^👗\s*/u, "")
            .replace(/^💄\s*/u, "")
            .replace(/^📱\s*/u, "")
            .replace(/^🏠\s*/u, "")
            .replace(/^👟\s*/u, "")
            .replace(/^💎\s*/u, "")
            .replace(/^🧸\s*/u, "")
            .replace(/^📚\s*/u, "")
            .replace(/^🐶\s*/u, "")
            .replace(/^⚽\s*/u, "")
            .replace(/^🚗\s*/u, "")
            .replace(/^🌱\s*/u, "")
            .replace(/^🍎\s*/u, "")
            .replace(/^🎁\s*/u, "")
            .trim();

        // Backend-compatible category names

        const aliases = {

            "Fashion & Clothing": "Fashion",
            "Fashion": "Fashion",

            "Beauty & Personal Care":
                "Beauty",
            "Beauty":
                "Beauty",

            "Electronics":
                "Electronics",

            "Home":
                "Home & Kitchen",

            "Home & Kitchen":
                "Home & Kitchen",

            "Shoes":
                "Shoes",

            "Jewelry":
                "Jewellery",

            "Jewellery":
                "Jewellery",

            "Toy":
                "Toys",

            "Toys":
                "Toys",

            "Book":
                "Books",

            "Books":
                "Books",

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

        return aliases[category] || category;

    }


    // ======================================================
    // KEYWORD NORMALIZER
    // ======================================================

    function normalizeKeyword(value) {

        let text =
            cleanText(value);

        if (!text) {
            return "";
        }

        // Remove numbering

        text = text.replace(
            /^\s*\d+\s*[\.\)\-:]\s*/u,
            ""
        );

        // Remove bullets

        text = text.replace(
            /^[•●▪◦\-]+\s*/u,
            ""
        );

        // Remove accidental quotes

        text = text
            .replace(/^["'`]+/, "")
            .replace(/["'`]+$/, "")
            .trim();

        return text;

    }


    // ======================================================
    // KEYWORD COMPARISON KEY
    // ======================================================

    function keywordKey(value) {

        return normalizeKeyword(value)
            .toLowerCase()
            .replace(/[‐-‒–—]/g, "-")
            .replace(/\s+/g, " ")
            .trim();

    }


    // ======================================================
    // FORBIDDEN SEO TERMS
    // ======================================================

    function containsForbiddenPattern(value) {

        const keyword =
            keywordKey(value);

        if (!keyword) {
            return true;
        }


        const forbiddenPatterns = [

            // -------------------------------
            // Gender
            // -------------------------------

            "for men",
            "for women",
            "for boys",
            "for girls",

            "men's",
            "mens",
            "women's",
            "womens",

            "boy",
            "boys",
            "girl",
            "girls",


            // -------------------------------
            // Commercial claims
            // -------------------------------

            "best",
            "top",
            "premium",
            "luxury",
            "cheap",
            "cheapest",

            "discount",
            "offer",
            "sale",

            "lowest price",
            "best price",


            // -------------------------------
            // Quality claims
            // -------------------------------

            "high quality",
            "best quality",
            "super quality",
            "premium quality",


            // -------------------------------
            // Unsupported claims
            // -------------------------------

            "original",
            "authentic",
            "genuine",
            "guaranteed",

            "waterproof",
            "water resistant",

            "anti bacterial",
            "antibacterial",

            "organic",
            "handmade",

            "latest",
            "trending",
            "viral",

            "new arrival",
            "new arrivals",


            // -------------------------------
            // Marketplace stuffing
            // -------------------------------

            "on amazon",
            "on meesho",
            "on flipkart",
            "on etsy",
            "on shopify",
            "on olx",

            "amazon",
            "meesho",
            "flipkart",
            "etsy",
            "shopify",
            "olx",

            "marketplace",
            "listing",


            // -------------------------------
            // Price stuffing
            // -------------------------------

            "price",
            "pricing"

        ];


        for (
            const bad of forbiddenPatterns
        ) {

            if (
                keyword.includes(bad)
            ) {

                return true;

            }

        }

        return false;

    }


    // ======================================================
    // SAFE KEYWORD VALIDATION
    // ======================================================

    function isValidKeyword(
        keyword,
        product,
        brand,
        mainKeyword
    ) {

        const value =
            normalizeKeyword(keyword);

        if (!value) {
            return false;
        }


        // Reject forbidden terms

        if (
            containsForbiddenPattern(value)
        ) {

            return false;

        }


        // Reasonable length

        if (
            value.length < 2 ||
            value.length > 150
        ) {

            return false;

        }


        // Reject URLs

        if (
            /^https?:\/\//i.test(value)
        ) {

            return false;

        }


        // Reject HTML

        if (
            /<[^>]*>/u.test(value)
        ) {

            return false;

        }


        // Reject duplicate words

        const words =
            value
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean);

        const uniqueWords =
            new Set(words);

        if (
            words.length > 1 &&
            uniqueWords.size !== words.length
        ) {

            return false;

        }


        return true;

    }


    // ======================================================
    // EXTRACT ARRAY FROM BACKEND RESPONSE
    // ======================================================

    function extractKeywordArray(data) {

        if (!data) {
            return [];
        }


        // Direct array

        if (
            Array.isArray(data)
        ) {

            return data;

        }


        // Common backend fields

        const possibleFields = [

            "keywords",
            "seoKeywords",
            "seo_keywords",
            "keywordList",
            "keyword_list",
            "results",
            "items"

        ];


        for (
            const field of possibleFields
        ) {

            if (
                Array.isArray(data[field])
            ) {

                return data[field];

            }

        }


        // Nested result

        if (
            data.result &&
            typeof data.result === "object"
        ) {

            const nested =
                extractKeywordArray(
                    data.result
                );

            if (
                nested.length > 0
            ) {

                return nested;

            }

        }


        // Nested data

        if (
            data.data &&
            typeof data.data === "object"
        ) {

            const nested =
                extractKeywordArray(
                    data.data
                );

            if (
                nested.length > 0
            ) {

                return nested;

            }

        }


        // Single keyword

        if (
            typeof data.mainKeyword ===
            "string"
        ) {

            return [
                data.mainKeyword
            ];

        }


        // Text response

        if (
            typeof data.text ===
            "string"
        ) {

            return parseTextKeywords(
                data.text
            );

        }


        // Message response

        if (
            typeof data.message ===
            "string"
        ) {

            return parseTextKeywords(
                data.message
            );

        }


        return [];

    }


    // ======================================================
    // PARSE TEXT KEYWORDS
    // ======================================================

    function parseTextKeywords(text) {

        const clean =
            String(text || "")
                .trim();

        if (!clean) {
            return [];
        }


        // Try JSON first

        try {

            const parsed =
                JSON.parse(clean);

            return extractKeywordArray(
                parsed
            );

        } catch (error) {

            // Continue with text parsing

        }


        return clean
            .split(/\r?\n/u)
            .map(function (line) {

                return normalizeKeyword(
                    line
                );

            })
            .filter(Boolean);

    }


    // ======================================================
    // DEDUPLICATE KEYWORDS
    // ======================================================

    function deduplicateKeywords(
        keywords,
        product,
        brand,
        mainKeyword
    ) {

        const result = [];
        const seen = new Set();


        for (
            const raw of keywords
        ) {

            const keyword =
                normalizeKeyword(raw);

            if (!keyword) {
                continue;
            }


            const key =
                keywordKey(keyword);


            if (
                seen.has(key)
            ) {

                continue;

            }


            if (
                !isValidKeyword(
                    keyword,
                    product,
                    brand,
                    mainKeyword
                )
            ) {

                continue;

            }


            seen.add(key);

            result.push(keyword);

        }


        return result;

    }


    // ======================================================
    // REMOVE AI NUMBERING
    // ======================================================

    function cleanAIKeywords(
        keywords
    ) {

        return keywords
            .map(function (keyword) {

                return normalizeKeyword(
                    keyword
                );

            })
            .filter(Boolean);

    }


    // ======================================================
    // DISPLAY KEYWORDS
    // ======================================================

    function displayKeywords(
        keywords
    ) {

        if (
            !Array.isArray(keywords) ||
            keywords.length === 0
        ) {

            resultBox.value = "";

            return;

        }


        resultBox.value =
            keywords
                .map(function (keyword, index) {

                    return (
                        (index + 1) +
                        ". " +
                        keyword
                    );

                })
                .join("\n");

    }


    // ======================================================
    // STATUS
    // ======================================================

    function showStatus(
        message,
        type
    ) {

        if (!statusBox) {
            return;
        }


        statusBox.textContent =
            message;


        statusBox.className =
            "status";


        if (type) {

            statusBox.classList.add(
                type
            );

        }

    }


    // ======================================================
    // BUILD BACKEND REQUEST
    // ======================================================

    function buildRequest() {

        const product =
            cleanText(
                productInput.value
            );

        const category =
            normalizeCategory(
                categoryInput.value
            );

        const brand =
            brandInput
                ? cleanText(
                    brandInput.value
                )
                : "";

        const mainKeyword =
            keywordInput
                ? cleanText(
                    keywordInput.value
                )
                : "";

        const marketplace =
            marketplaceInput
                ? cleanText(
                    marketplaceInput.value
                )
                : "";


        return {

            product,
            category,
            brand,
            mainKeyword,

            // Marketplace is sent only as
            // context. It must NEVER be
            // inserted into keywords.

            marketplace

        };

    }


    // ======================================================
    // VALIDATE INPUT
    // ======================================================

    function validateRequest(
        request
    ) {

        if (
            !request.product
        ) {

            showStatus(
                "❌ Product name is required.",
                "error"
            );

            productInput.focus();

            return false;

        }


        if (
            !request.category
        ) {

            showStatus(
                "❌ Product category is required.",
                "error"
            );

            categoryInput.focus();

            return false;

        }


        return true;

    }


    // ======================================================
    // GENERATE SEO KEYWORDS
    // ======================================================

    async function generateSEOKeywords() {

        const request =
            buildRequest();


        // -------------------------------
        // Validate
        // -------------------------------

        if (
            !validateRequest(request)
        ) {

            return;

        }


        // -------------------------------
        // Clear previous result
        // -------------------------------

        resultBox.value = "";


        // -------------------------------
        // Loading state
        // -------------------------------

        generateBtn.disabled =
            true;

        generateBtn.textContent =
            "⏳ Generating SEO Keywords...";


        showStatus(
            "🤖 Generating factual and relevant SEO keywords...",
            "loading"
        );


        try {

            // ==================================================
            // BACKEND REQUEST
            // ==================================================

            const response =
                await fetch(
                    SEO_API,
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
                                request
                            )

                    }
                );


            // ==================================================
            // READ RESPONSE
            // ==================================================

            const rawText =
                await response.text();


            let data = null;


            try {

                data =
                    rawText
                        ? JSON.parse(
                            rawText
                        )
                        : null;

            } catch (jsonError) {

                console.error(
                    "SEO API returned invalid JSON:",
                    rawText
                );

                throw new Error(
                    "Server returned invalid JSON."
                );

            }


            // ==================================================
            // HTTP ERROR
            // ==================================================

            if (
                !response.ok
            ) {

                const serverMessage =
                    data &&
                    (
                        data.error ||
                        data.message
                    );

                throw new Error(
                    serverMessage ||
                    (
                        "SEO API error: HTTP " +
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
            // EXTRACT KEYWORDS
            // ==================================================

            let keywords =
                extractKeywordArray(
                    data
                );


            // ==================================================
            // CLEAN
            // ==================================================

            keywords =
                cleanAIKeywords(
                    keywords
                );


            // ==================================================
            // DEDUPLICATE + VALIDATE
            // ==================================================

            keywords =
                deduplicateKeywords(
                    keywords,
                    request.product,
                    request.brand,
                    request.mainKeyword
                );


            // ==================================================
            // MAX 20
            // ==================================================

            keywords =
                keywords.slice(
                    0,
                    20
                );


            // ==================================================
            // NO FAKE FALLBACK
            // ==================================================

            // IMPORTANT:
            //
            // We DO NOT generate:
            //
            // product online
            // product buy
            // product shop
            // product shopping
            // product collection
            //
            // just to reach 20.
            //
            // If the seller supplied only one factual
            // product identity, one valid keyword is
            // better than 20 fake/generic keywords.

            if (
                keywords.length === 0
            ) {

                throw new Error(
                    "No factual SEO keywords were returned by the backend."
                );

            }


            // ==================================================
            // DISPLAY
            // ==================================================

            displayKeywords(
                keywords
            );


            // ==================================================
            // SUCCESS
            // ==================================================

            showStatus(
                `✅ ${keywords.length} factual SEO keyword${
                    keywords.length === 1
                        ? ""
                        : "s"
                } generated successfully.`,
                "success"
            );


            console.log(
                "SEO Generator " +
                VERSION +
                ": Backend generation successful.",
                {
                    count:
                        keywords.length,
                    category:
                        request.category
                }
            );


        } catch (error) {

            console.error(
                "SEO Generator Error:",
                error
            );


            resultBox.value = "";


            showStatus(
                "❌ " +
                (
                    error.message ||
                    "Unable to generate SEO keywords."
                ),
                "error"
            );

        } finally {

            // ==================================================
            // RESTORE BUTTON
            // ==================================================

            generateBtn.disabled =
                false;

            generateBtn.textContent =
                "🤖 Generate SEO Keywords";

        }

    }


    // ======================================================
    // COPY KEYWORDS
    // ======================================================

    async function copyKeywords() {

        const text =
            resultBox.value.trim();


        if (!text) {

            showStatus(
                "⚠️ Generate SEO keywords first.",
                "error"
            );

            return;

        }


        // Modern Clipboard API

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            try {

                await navigator.clipboard
                    .writeText(text);

                showStatus(
                    "✅ SEO keywords copied successfully.",
                    "success"
                );

                return;

            } catch (error) {

                console.warn(
                    "Clipboard API failed:",
                    error
                );

            }

        }


        // Fallback

        fallbackCopy(text);

    }


    // ======================================================
    // FALLBACK COPY
    // ======================================================

    function fallbackCopy(text) {

        const temp =
            document.createElement(
                "textarea"
            );


        temp.value =
            text;

        temp.setAttribute(
            "readonly",
            ""
        );

        temp.style.position =
            "fixed";

        temp.style.left =
            "-9999px";

        temp.style.top =
            "0";


        document.body.appendChild(
            temp
        );


        temp.focus();
        temp.select();


        try {

            const success =
                document.execCommand(
                    "copy"
                );


            if (success) {

                showStatus(
                    "✅ SEO keywords copied successfully.",
                    "success"
                );

            } else {

                showStatus(
                    "❌ Copy failed. Please copy manually.",
                    "error"
                );

            }

        } catch (error) {

            console.error(
                "Fallback copy error:",
                error
            );

            showStatus(
                "❌ Copy failed. Please copy manually.",
                "error"
            );

        }


        document.body.removeChild(
            temp
        );

    }


    // ======================================================
    // BUTTON EVENT
    // ======================================================

    generateBtn.addEventListener(
        "click",
        function () {

            generateSEOKeywords();

        }
    );


    // ======================================================
    // COPY EVENT
    // ======================================================

    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            function () {

                copyKeywords();

            }
        );

    }


    // ======================================================
    // ENTER KEY
    // ======================================================

    productInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                generateSEOKeywords();

            }

        }
    );


    // ======================================================
    // INITIAL STATE
    // ======================================================

    resultBox.value = "";


    showStatus(
        "Enter product information and generate factual SEO keywords."
    );


    // ======================================================
    // DEBUG
    // ======================================================

    console.log(
        "=================================================="
    );

    console.log(
        "AI Seller Toolkit"
    );

    console.log(
        "SEO Generator FINAL VERSION " +
        VERSION
    );

    console.log(
        "Backend:",
        SEO_API
    );

    console.log(
        "Generic SEO templates: DISABLED"
    );

    console.log(
        "Fake keyword fallback: DISABLED"
    );

    console.log(
        "Strict factual validation: ENABLED"
    );

    console.log(
        "=================================================="
    );

});
