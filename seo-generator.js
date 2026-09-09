/* ==========================================================
   AI SELLER TOOLKIT
   SEO-GENERATOR.JS — FINAL VERSION 27
   Stable Frontend / Gemini Backend V25 Compatible
   ========================================================== */

"use strict";

(function () {
    const BACKEND_URL = "https://ai-seller-toolkit-backend-1.onrender.com";
    const SEO_ENDPOINT = BACKEND_URL + "/api/generate-seo";
    const STATUS_ENDPOINT = BACKEND_URL + "/api/status";

    const $ = (id) => document.getElementById(id);

    const productInput = $("product");
    const categoryInput = $("category");
    const brandInput = $("brand");
    const detailsInput = $("details");
    const marketplaceInput = $("marketplace");

    const generateBtn = $("generateBtn");
    const testBtn = $("testBtn");
    const statusBox = $("status");
    const resultBox = $("resultBox");
    const keywordList = $("keywordList");
    const copyBtn = $("copyBtn");

    function clean(value) {
        if (value === null || value === undefined) return "";
        return String(value).replace(/\s+/g, " ").trim();
    }

    function showStatus(message, type) {
        statusBox.textContent = message;
        statusBox.className = "status " + (type || "info");
    }

    function clearStatus() {
        statusBox.textContent = "";
        statusBox.className = "status";
    }

    function uniqueKeywords(list) {
        const seen = new Set();
        const output = [];

        list.forEach(function (item) {
            const value = clean(item);
            if (!value) return;

            const key = value.toLowerCase();
            if (seen.has(key)) return;

            seen.add(key);
            output.push(value);
        });

        return output;
    }

    /*
     * Backend V25 can return keywords in:
     * keywords, seoKeywords, data.keywords, data.seoKeywords, text, result
     */
    function extractKeywords(data) {
        const collected = [];

        function add(value) {
            if (value === null || value === undefined) return;

            if (Array.isArray(value)) {
                value.forEach(add);
                return;
            }

            if (typeof value === "string" || typeof value === "number") {
                String(value)
                    .split(/\r?\n|[,|]+/)
                    .map(function (item) {
                        return item
                            .replace(/^[\s•*\-–—\d.)]+/, "")
                            .trim();
                    })
                    .filter(Boolean)
                    .forEach(function (item) {
                        collected.push(item);
                    });
                return;
            }

            if (typeof value === "object") {
                [
                    "keywords",
                    "seoKeywords",
                    "text",
                    "result",
                    "results",
                    "data",
                    "output"
                ].forEach(function (key) {
                    if (Object.prototype.hasOwnProperty.call(value, key)) {
                        add(value[key]);
                    }
                });
            }
        }

        add(data);
        return uniqueKeywords(collected);
    }

    async function readJSON(response) {
        const raw = await response.text();

        if (!raw) {
            return {};
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            return {
                success: false,
                error: raw
            };
        }
    }

    function getServerError(data, response) {
        if (data && typeof data === "object") {
            return clean(
                data.error ||
                data.message ||
                data.details ||
                data.reason ||
                data.text
            );
        }

        return "Backend request failed (HTTP " + response.status + ").";
    }

    function renderKeywords(list) {
        keywordList.innerHTML = "";

        if (!list.length) {
            const empty = document.createElement("div");
            empty.className = "kw";
            empty.textContent = "No SEO keywords were returned by the backend.";
            keywordList.appendChild(empty);
            return;
        }

        list.forEach(function (keyword) {
            const item = document.createElement("div");
            item.className = "kw";
            item.textContent = keyword;
            keywordList.appendChild(item);
        });
    }

    async function generateSEO() {
        clearStatus();
        resultBox.style.display = "none";

        const product = clean(productInput.value);
        const category = clean(categoryInput.value);
        const brand = clean(brandInput.value);
        const details = clean(detailsInput.value);
        const marketplace = clean(marketplaceInput.value);

        if (!product) {
            showStatus("❌ Product Name is required.", "error");
            productInput.focus();
            return;
        }

        if (!category) {
            showStatus("❌ Product Category is required.", "error");
            categoryInput.focus();
            return;
        }

        /*
         * IMPORTANT:
         * There is NO standalone variable named "mainKeyword".
         * The backend property is created safely from a local value.
         */
        const primarySellerKeyword = clean(
            product + (details ? " " + details : "")
        );

        const requestBody = {
            productName: product,
            product: product,
            category: category,
            brand: brand,
            mainKeyword: primarySellerKeyword,
            keyword: primarySellerKeyword,
            productDetails: details,
            marketplace: marketplace
        };

        generateBtn.disabled = true;
        testBtn.disabled = true;
        generateBtn.textContent = "⏳ Generating...";
        showStatus("⏳ Connecting to AI Seller Toolkit backend...", "info");

        try {
            const response = await fetch(SEO_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(requestBody),
                cache: "no-store"
            });

            const data = await readJSON(response);

            if (!response.ok || data.success === false) {
                throw new Error(getServerError(data, response));
            }

            const keywords = extractKeywords(data);

            if (!keywords.length) {
                throw new Error(
                    "Backend responded successfully, but no SEO keywords were returned."
                );
            }

            renderKeywords(keywords);
            resultBox.style.display = "block";

            showStatus(
                "✅ SEO keywords generated successfully.",
                "success"
            );

            resultBox.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } catch (error) {
            console.error("SEO Generator V27 Error:", error);

            const message = clean(error && error.message);

            /*
             * Do NOT hide the real error.
             * This makes future debugging possible.
             */
            showStatus(
                "❌ SEO generation failed: " +
                (message || "Unknown error. Please try again."),
                "error"
            );

        } finally {
            generateBtn.disabled = false;
            testBtn.disabled = false;
            generateBtn.textContent = "✨ Generate SEO Keywords";
        }
    }

    async function testConnection() {
        generateBtn.disabled = true;
        testBtn.disabled = true;
        testBtn.textContent = "⏳ Testing...";

        showStatus("⏳ Testing backend connection...", "info");

        try {
            const response = await fetch(STATUS_ENDPOINT, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });

            const data = await readJSON(response);

            if (!response.ok || data.success === false) {
                throw new Error(getServerError(data, response));
            }

            showStatus(
                "✅ Backend is online. Version " +
                clean(data.version || "unknown") +
                " | Gemini: " +
                (data.geminiConfigured ? "Configured" : "Not configured"),
                "success"
            );

        } catch (error) {
            console.error("Connection Test V27 Error:", error);

            showStatus(
                "❌ Backend connection failed: " +
                (clean(error && error.message) || "Unknown error."),
                "error"
            );

        } finally {
            generateBtn.disabled = false;
            testBtn.disabled = false;
            testBtn.textContent = "🔌 Test Connection";
        }
    }

    async function copyAll() {
        const items = Array.from(
            keywordList.querySelectorAll(".kw")
        )
        .map(function (item) {
            return clean(item.textContent);
        })
        .filter(Boolean);

        if (!items.length) {
            showStatus("❌ No keywords to copy.", "error");
            return;
        }

        const text = items.join("\n");

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                throw new Error("Clipboard API unavailable");
            }

            showStatus("✅ Keywords copied successfully.", "success");

        } catch (error) {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";

            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            try {
                document.execCommand("copy");
                showStatus("✅ Keywords copied successfully.", "success");
            } catch (copyError) {
                showStatus(
                    "❌ Copy failed. Please select and copy the keywords manually.",
                    "error"
                );
            }

            textarea.remove();
        }
    }

    generateBtn.addEventListener("click", generateSEO);
    testBtn.addEventListener("click", testConnection);
    copyBtn.addEventListener("click", copyAll);

    productInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            generateSEO();
        }
    });

    console.log(
        "AI Seller Toolkit SEO Generator FINAL VERSION 27 loaded"
    );
})();
