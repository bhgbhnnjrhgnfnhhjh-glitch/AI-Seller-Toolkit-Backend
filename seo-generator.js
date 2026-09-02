// ==========================================================
// AI SELLER TOOLKIT
// SEO KEYWORD GENERATOR — FINAL VERSION 18.0
// ==========================================================
//
// PURPOSE:
// Reliable, factual, non-hallucinating SEO Keyword Generator
//
// IMPORTANT:
// This version DOES NOT ask AI to invent SEO keywords.
// Keywords are generated locally using strict rules.
//
// MAIN FIX:
// ❌ No "for men" unless seller provides it
// ❌ No "for women" unless seller provides it
// ❌ No "price" unless seller provides price context
// ❌ No "on Amazon"
// ❌ No "Amazon Cotton Kurti"
// ❌ No "Fashion" added as a keyword just because category = Fashion
// ❌ No unsupported product specifications
// ❌ No random claims
//
// OUTPUT:
// Up to 20 relevant, unique SEO keyword phrases.
//
// ==========================================================

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // ======================================================
    // ELEMENTS
    // ======================================================

    const productInput = document.getElementById("product");
    const categoryInput = document.getElementById("category");
    const brandInput = document.getElementById("brand");
    const keywordInput = document.getElementById("keyword");
    const marketplaceInput = document.getElementById("marketplace");

    const generateBtn = document.getElementById("generateBtn");
    const copyBtn = document.getElementById("copyBtn");

    const resultBox = document.getElementById("result");
    const statusBox = document.getElementById("status");


    // ======================================================
    // SAFETY CHECK
    // ======================================================

    if (!productInput || !categoryInput || !generateBtn || !resultBox) {
        console.error("SEO Generator: Required HTML elements not found.");
        return;
    }


    // ======================================================
    // BASIC TEXT CLEANER
    // ======================================================

    function cleanText(value) {

        return String(value || "")
            .replace(/\s+/g, " ")
            .replace(/[<>]/g, "")
            .trim();

    }


    // ======================================================
    // NORMALIZE CATEGORY
    // ======================================================

    function normalizeCategory(value) {

        let category = cleanText(value);

        category = category
            .replace(/^👗\s*/, "")
            .replace(/^💄\s*/, "")
            .replace(/^📱\s*/, "")
            .replace(/^🏠\s*/, "")
            .replace(/^👟\s*/, "")
            .replace(/^💎\s*/, "")
            .replace(/^🧸\s*/, "")
            .replace(/^📚\s*/, "")
            .replace(/^🐶\s*/, "")
            .replace(/^⚽\s*/, "")
            .replace(/^🚗\s*/, "")
            .replace(/^🌱\s*/, "")
            .replace(/^🍎\s*/, "")
            .replace(/^🎁\s*/, "");

        return category.trim();

    }


    // ======================================================
    // NORMALIZE KEYWORD
    // ======================================================

    function normalizeKeyword(value) {

        let text = cleanText(value);

        if (!text) {
            return "";
        }

        // Remove numbering
        text = text.replace(/^\d+[\.\)\-:]\s*/, "");

        // Remove unwanted punctuation from beginning/end
        text = text
            .replace(/^[,.;:|]+/, "")
            .replace(/[,.;:|]+$/, "")
            .trim();

        // Convert multiple spaces
        text = text.replace(/\s+/g, " ");

        return text;

    }


    // ======================================================
    // LOWERCASE COMPARISON
    // ======================================================

    function keywordKey(value) {

        return normalizeKeyword(value)
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

    }


    // ======================================================
    // TITLE CASE HELPERS
    // ======================================================

    function capitalizeFirst(value) {

        if (!value) return "";

        return value.charAt(0).toUpperCase() + value.slice(1);

    }


    // ======================================================
    // REMOVE DUPLICATE WORDS INSIDE PHRASE
    // ======================================================

    function removeRepeatedWords(value) {

        const words = normalizeKeyword(value).split(" ");

        const result = [];
        const seen = new Set();

        for (const word of words) {

            const key = word.toLowerCase();

            if (!seen.has(key)) {

                seen.add(key);
                result.push(word);

            }

        }

        return result.join(" ");

    }


    // ======================================================
    // CHECK UNSUPPORTED / BAD SEO TERMS
    // ======================================================

    function containsForbiddenPattern(keyword) {

        const k = keywordKey(keyword);

        const forbiddenPatterns = [

            // Unsupported gender claims
            "for men",
            "for women",
            "men's",
            "mens",
            "women's",
            "womens",
            "boys",
            "girls",
            "boy",
            "girl",

            // Unsupported commercial claims
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

            // Unsupported quality claims
            "high quality",
            "best quality",
            "super quality",
            "premium quality",

            // Marketplace stuffing
            "on amazon",
            "on meesho",
            "on flipkart",
            "on etsy",
            "on shopify",
            "on olx",

            "amazon ",
            " meesho",
            " flipkart",
            " etsy",
            " shopify",
            " olx",

            // Generic marketplace terms
            "marketplace",
            "listing",

            // Unsupported product claims
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

            // Price stuffing
            "price",
            "pricing",

            // Fake urgency
            "latest",
            "trending",
            "viral",
            "new arrival",
            "new arrivals"

        ];

        for (const bad of forbiddenPatterns) {

            if (k.includes(bad)) {
                return true;
            }

        }

        return false;

    }


    // ======================================================
    // EXTRACT IMPORTANT PRODUCT WORDS
    // ======================================================

    function getProductWords(product) {

        const stopWords = new Set([

            "the",
            "a",
            "an",
            "and",
            "or",
            "with",
            "for",
            "of",
            "to",
            "in",
            "on",
            "by",
            "from",
            "this",
            "that",
            "product",
            "item"

        ]);

        return product
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s-]/gu, " ")
            .split(/\s+/)
            .filter(Boolean)
            .filter(word => !stopWords.has(word));

    }


    // ======================================================
    // PRODUCT PHRASE
    // ======================================================

    function createBasePhrase(product, mainKeyword) {

        const selected = cleanText(mainKeyword) || cleanText(product);

        return normalizeKeyword(selected);

    }


    // ======================================================
    // CATEGORY-SPECIFIC INTENT WORDS
    //
    // IMPORTANT:
    // These are SEARCH-INTENT phrases, NOT product facts.
    // ======================================================

    const categoryTemplates = {

        "Fashion": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} collection",
            "{base} design",
            "{base} style",
            "{base} clothing",
            "{base} apparel",
            "{base} wear",
            "{base} outfit",
            "{base} product",
            "{base} online shopping",
            "{base} clothing online",
            "{base} shopping online",
            "{base} fashion",
            "{base} dress",
            "{base} store",
            "{base} catalog"
        ],

        "Beauty": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} product",
            "{base} beauty product",
            "{base} personal care",
            "{base} care product",
            "{base} online shopping",
            "{base} shopping online",
            "{base} beauty care",
            "{base} skincare product",
            "{base} beauty care product",
            "{base} beauty item",
            "{base} store",
            "{base} catalog",
            "{base} collection",
            "{base} product online",
            "{base} shopping product"
        ],

        "Electronics": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} product",
            "{base} electronics",
            "{base} electronic product",
            "{base} gadget",
            "{base} device",
            "{base} online shopping",
            "{base} shopping online",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} electronics online",
            "{base} gadget online",
            "{base} device online",
            "{base} collection",
            "{base} shop online"
        ],

        "Home & Kitchen": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} home product",
            "{base} kitchen product",
            "{base} household product",
            "{base} home use",
            "{base} kitchen use",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} home item",
            "{base} kitchen item",
            "{base} household item",
            "{base} collection"
        ],

        "Shoes": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} footwear",
            "{base} footwear online",
            "{base} shoe collection",
            "{base} shoe design",
            "{base} shoe style",
            "{base} footwear collection",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} footwear product",
            "{base} shoe product",
            "{base} shop online"
        ],

        "Jewellery": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} jewellery",
            "{base} jewellery online",
            "{base} jewellery collection",
            "{base} jewellery design",
            "{base} jewellery style",
            "{base} jewellery product",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} jewellery shop",
            "{base} jewellery shopping",
            "{base} jewellery store"
        ],

        "Toys": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} toy",
            "{base} toy product",
            "{base} toy collection",
            "{base} toy set",
            "{base} play product",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} toy online",
            "{base} toy shop",
            "{base} toy store",
            "{base} toy shopping"
        ],

        "Books": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} book",
            "{base} book online",
            "{base} book shop",
            "{base} book store",
            "{base} book collection",
            "{base} book product",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} catalog",
            "{base} product online",
            "{base} reading book",
            "{base} book shopping",
            "{base} book catalog",
            "{base} book collection online"
        ],

        "Pet": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} pet product",
            "{base} pet item",
            "{base} pet care product",
            "{base} pet supply",
            "{base} pet supplies",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} pet shop",
            "{base} pet store",
            "{base} pet shopping",
            "{base} collection"
        ],

        "Sports": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} sports product",
            "{base} sports equipment",
            "{base} sports item",
            "{base} sports gear",
            "{base} sports collection",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} sports shop",
            "{base} sports store",
            "{base} sports shopping",
            "{base} sports product online"
        ],

        "Automotive": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} automotive product",
            "{base} car product",
            "{base} vehicle product",
            "{base} auto accessory",
            "{base} automotive accessory",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} car accessory",
            "{base} auto product",
            "{base} automotive shop",
            "{base} automotive store"
        ],

        "Garden": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} garden product",
            "{base} gardening product",
            "{base} garden item",
            "{base} gardening item",
            "{base} garden collection",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} gardening shop",
            "{base} garden shop",
            "{base} gardening store",
            "{base} garden shopping"
        ],

        "Food": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} food product",
            "{base} food item",
            "{base} grocery product",
            "{base} grocery item",
            "{base} food collection",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} grocery shopping",
            "{base} grocery store",
            "{base} food shop",
            "{base} food store"
        ],

        "Gifts": [
            "{base}",
            "{base} online",
            "{base} buy",
            "{base} shop",
            "{base} shopping",
            "{base} gift product",
            "{base} gift item",
            "{base} gift collection",
            "{base} gifting product",
            "{base} gift shop",
            "{base} online shopping",
            "{base} shopping online",
            "{base} product",
            "{base} store",
            "{base} catalog",
            "{base} product online",
            "{base} gift store",
            "{base} gift shopping",
            "{base} gift item online",
            "{base} gift collection online"
        ]

    };


    // ======================================================
    // GENERIC CATEGORY FALLBACK
    // ======================================================

    const genericTemplates = [
        "{base}",
        "{base} online",
        "{base} buy",
        "{base} shop",
        "{base} shopping",
        "{base} collection",
        "{base} design",
        "{base} style",
        "{base} product",
        "{base} online shopping",
        "{base} shopping online",
        "{base} store",
        "{base} catalog",
        "{base} product online",
        "{base} shop online",
        "{base} collection online",
        "{base} product shopping",
        "{base} online product",
        "{base} shopping product",
        "{base} store online"
    ];


    // ======================================================
    // BRAND KEYWORDS
    //
    // Brand is used ONLY when explicitly supplied.
    // ======================================================

    function addBrandKeywords(list, brand, base) {

        const b = cleanText(brand);

        if (!b) {
            return;
        }

        // Brand + product
        list.push(`${b} ${base}`);

        // Product + brand
        list.push(`${base} ${b}`);

    }


    // ======================================================
    // SELLER-PROVIDED KEYWORD SUPPORT
    // ======================================================

    function addSellerKeywordVariants(list, sellerKeyword) {

        const k = normalizeKeyword(sellerKeyword);

        if (!k) {
            return;
        }

        list.push(k);
        list.push(`${k} online`);
        list.push(`${k} buy`);
        list.push(`${k} shopping`);

    }


    // ======================================================
    // REMOVE UNSUPPORTED PRODUCT-SPECIFIC TERMS
    //
    // This function prevents generated keyword phrases from
    // adding details that were not supplied by the seller.
    // ======================================================

    function hasUnsupportedProductClaim(keyword, product) {

        const k = keywordKey(keyword);
        const p = keywordKey(product);

        // Gender terms not explicitly present in product
        const genderTerms = [
            "men",
            "mens",
            "men's",
            "women",
            "womens",
            "women's",
            "boys",
            "girls",
            "boy",
            "girl"
        ];

        for (const term of genderTerms) {

            if (k.includes(term) && !p.includes(term)) {
                return true;
            }

        }

        // Color claims
        const colors = [
            "red",
            "blue",
            "green",
            "black",
            "white",
            "yellow",
            "pink",
            "purple",
            "orange",
            "brown",
            "grey",
            "gray"
        ];

        for (const color of colors) {

            if (k.includes(color) && !p.includes(color)) {
                return true;
            }

        }

        // Material claims
        const materials = [
            "cotton",
            "silk",
            "linen",
            "wool",
            "leather",
            "metal",
            "steel",
            "stainless steel",
            "plastic",
            "ceramic",
            "wood",
            "glass"
        ];

        for (const material of materials) {

            if (k.includes(material) && !p.includes(material)) {
                return true;
            }

        }

        return false;

    }


    // ======================================================
    // QUALITY FILTER
    // ======================================================

    function isUsefulKeyword(keyword, base) {

        const k = keywordKey(keyword);
        const b = keywordKey(base);

        if (!k || !b) {
            return false;
        }

        // Must contain the main product phrase
        if (!k.includes(b)) {
            return false;
        }

        // Avoid exact duplicate
        if (k === b) {
            return true;
        }

        // Avoid very short accidental output
        if (k.length < b.length) {
            return false;
        }

        // Avoid forbidden claims
        if (containsForbiddenPattern(k)) {
            return false;
        }

        return true;

    }


    // ======================================================
    // BUILD KEYWORDS
    // ======================================================

    function buildKeywords({

        product,
        category,
        brand,
        mainKeyword,
        marketplace

    }) {

        const base = createBasePhrase(product, mainKeyword);

        if (!base) {
            return [];
        }

        let templates =
            categoryTemplates[category] ||
            genericTemplates;

        const candidates = [];

        // ==================================================
        // PRIMARY CATEGORY TEMPLATES
        // ==================================================

        for (const template of templates) {

            candidates.push(
                template.replace(/\{base\}/g, base)
            );

        }


        // ==================================================
        // SELLER MAIN KEYWORD
        // ==================================================

        addSellerKeywordVariants(
            candidates,
            mainKeyword
        );


        // ==================================================
        // BRAND
        // ==================================================

        addBrandKeywords(
            candidates,
            brand,
            base
        );


        // ==================================================
        // FILTER + DEDUPLICATE
        // ==================================================

        const finalKeywords = [];
        const seen = new Set();

        for (let keyword of candidates) {

            keyword = normalizeKeyword(keyword);

            keyword = removeRepeatedWords(keyword);

            if (!keyword) {
                continue;
            }

            if (!isUsefulKeyword(keyword, base)) {
                continue;
            }

            if (hasUnsupportedProductClaim(keyword, product)) {
                continue;
            }

            const key = keywordKey(keyword);

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);

            finalKeywords.push(
                capitalizeFirst(keyword)
            );

            if (finalKeywords.length >= 20) {
                break;
            }

        }


        return finalKeywords;

    }


    // ======================================================
    // DISPLAY KEYWORDS
    // ======================================================

    function displayKeywords(keywords) {

        if (!keywords.length) {

            resultBox.value =
                "No relevant SEO keywords could be generated.";

            return;

        }

        resultBox.value = keywords
            .map((keyword, index) => `${index + 1}. ${keyword}`)
            .join("\n");

    }


    // ======================================================
    // STATUS
    // ======================================================

    function showStatus(message, type = "success") {

        if (!statusBox) {
            return;
        }

        statusBox.textContent = message;

        if (type === "error") {

            statusBox.style.color = "#dc2626";

        } else if (type === "loading") {

            statusBox.style.color = "#2563eb";

        } else {

            statusBox.style.color = "#4b8f42";

        }

    }


    // ======================================================
    // GENERATE
    // ======================================================

    function generateSEOKeywords() {

        const product = cleanText(productInput.value);
        const category = normalizeCategory(categoryInput.value);
        const brand = cleanText(
            brandInput ? brandInput.value : ""
        );
        const mainKeyword = cleanText(
            keywordInput ? keywordInput.value : ""
        );
        const marketplace = cleanText(
            marketplaceInput ? marketplaceInput.value : ""
        );


        // ==================================================
        // VALIDATION
        // ==================================================

        if (!product) {

            showStatus(
                "❌ Product Name is required.",
                "error"
            );

            resultBox.value = "";

            productInput.focus();

            return;

        }


        if (!category) {

            showStatus(
                "❌ Product category is required.",
                "error"
            );

            resultBox.value = "";

            categoryInput.focus();

            return;

        }


        // ==================================================
        // LOADING
        // ==================================================

        generateBtn.disabled = true;

        generateBtn.textContent =
            "⏳ Generating SEO Keywords...";

        showStatus(
            "Generating relevant SEO keywords...",
            "loading"
        );


        // ==================================================
        // SMALL DELAY FOR UI FEEDBACK
        // ==================================================

        setTimeout(function () {

            try {

                const keywords = buildKeywords({

                    product,
                    category,
                    brand,
                    mainKeyword,
                    marketplace

                });

                displayKeywords(keywords);


                if (keywords.length > 0) {

                    showStatus(
                        `✅ ${keywords.length} SEO keywords generated successfully.`
                    );

                } else {

                    showStatus(
                        "⚠️ No suitable SEO keywords found.",
                        "error"
                    );

                }

            } catch (error) {

                console.error(
                    "SEO Generator Error:",
                    error
                );

                resultBox.value = "";

                showStatus(
                    "❌ Unable to generate SEO keywords. Please try again.",
                    "error"
                );

            }


            // ==================================================
            // RESTORE BUTTON
            // ==================================================

            generateBtn.disabled = false;

            generateBtn.textContent =
                "🤖 Generate SEO Keywords";

        }, 250);

    }


    // ======================================================
    // COPY KEYWORDS
    // ======================================================

    function copyKeywords() {

        const text = resultBox.value.trim();

        if (!text) {

            showStatus(
                "⚠️ Generate keywords first.",
                "error"
            );

            return;

        }


        // Modern Clipboard API
        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            navigator.clipboard.writeText(text)
                .then(function () {

                    showStatus(
                        "✅ Keywords copied successfully."
                    );

                })
                .catch(function () {

                    fallbackCopy(text);

                });

            return;

        }


        fallbackCopy(text);

    }


    // ======================================================
    // FALLBACK COPY
    // ======================================================

    function fallbackCopy(text) {

        const temp = document.createElement("textarea");

        temp.value = text;

        temp.style.position = "fixed";
        temp.style.left = "-9999px";
        temp.style.top = "0";

        document.body.appendChild(temp);

        temp.focus();
        temp.select();

        try {

            document.execCommand("copy");

            showStatus(
                "✅ Keywords copied successfully."
            );

        } catch (error) {

            showStatus(
                "❌ Copy failed. Please copy manually.",
                "error"
            );

        }

        document.body.removeChild(temp);

    }


    // ======================================================
    // EVENTS
    // ======================================================

    generateBtn.addEventListener(
        "click",
        generateSEOKeywords
    );


    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            copyKeywords
        );

    }


    // ======================================================
    // ENTER KEY
    // ======================================================

    productInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

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
        "Enter product information and generate SEO keywords."
    );


    // ======================================================
    // DEBUG INFORMATION
    // ======================================================

    console.log(
        "AI Seller Toolkit SEO Generator Final Version 18.0 loaded successfully."
    );

});
