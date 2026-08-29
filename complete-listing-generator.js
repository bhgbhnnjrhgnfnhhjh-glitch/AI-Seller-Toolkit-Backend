// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE LISTING GENERATOR
// complete-listing-generator.js
// FINAL VERSION 8.0
// ==========================================================
//
// Features:
// ✅ 14 Product Categories
// ✅ Category Normalization
// ✅ Category-specific fields
// ✅ Strict validation
// ✅ Backend API integration
// ✅ Loading state
// ✅ Error handling
// ✅ Safe JSON parsing
// ✅ Generated listing rendering
// ✅ Copy Listing
// ✅ Clear Result
// ==========================================================


// ==========================================================
// CONFIGURATION
// ==========================================================

const API_BASE_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const GENERATE_LISTING_ENDPOINT =
    `${API_BASE_URL}/api/generate-listing`;


// ==========================================================
// CATEGORY LIST
// ==========================================================

const CATEGORIES = [
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
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(category) {

    if (!category) {
        return "";
    }

    let value = String(category)
        .trim()
        .replace(/^[^\w&]+/u, "")
        .replace(/^\s+|\s+$/g, "");

    const lower = value.toLowerCase();

    const aliases = {

        "fashion": "Fashion",
        "fashion & clothing": "Fashion",
        "clothing": "Fashion",
        "apparel": "Fashion",

        "beauty": "Beauty",
        "beauty & personal care": "Beauty",
        "personal care": "Beauty",

        "electronics": "Electronics",
        "electronic": "Electronics",

        "home": "Home & Kitchen",
        "home & kitchen": "Home & Kitchen",
        "home and kitchen": "Home & Kitchen",
        "kitchen": "Home & Kitchen",

        "shoes": "Shoes",
        "footwear": "Shoes",

        "jewellery": "Jewellery",
        "jewelry": "Jewellery",

        "toys": "Toys",
        "toy": "Toys",

        "books": "Books",
        "book": "Books",

        "pet": "Pet",
        "pet supplies": "Pet",

        "sports": "Sports",
        "sports & fitness": "Sports",
        "fitness": "Sports",

        "automotive": "Automotive",
        "automobile": "Automotive",
        "car": "Automotive",
        "bike": "Automotive",

        "garden": "Garden",
        "gardening": "Garden",

        "food": "Food",
        "grocery": "Food",

        "gifts": "Gifts",
        "gift": "Gifts"
    };

    return aliases[lower] || value;
}


// ==========================================================
// DOM HELPERS
// ==========================================================

function getElement(...ids) {

    for (const id of ids) {

        const element = document.getElementById(id);

        if (element) {
            return element;
        }
    }

    return null;
}


function setText(element, text) {

    if (!element) {
        return;
    }

    element.textContent = text;
}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================================
// FIELD FINDER
// ==========================================================

function findField(names) {

    for (const name of names) {

        const element =
            document.getElementById(name) ||
            document.querySelector(`[name="${name}"]`);

        if (element) {
            return element;
        }
    }

    return null;
}


function getFieldValue(names) {

    const field = findField(names);

    if (!field) {
        return "";
    }

    return String(field.value || "").trim();
}


// ==========================================================
// COLLECT FORM DATA
// ==========================================================

function collectProductData() {

    const categoryElement =
        getElement(
            "productCategory",
            "category",
            "listingCategory"
        );

    const category = normalizeCategory(
        categoryElement ? categoryElement.value : ""
    );

    const productName = getFieldValue([
        "productName",
        "listingProductName",
        "product-name"
    ]);

    const productDetails = getFieldValue([
        "productDetails",
        "details",
        "description",
        "productDescription"
    ]);

    const brand = getFieldValue([
        "brand",
        "productBrand"
    ]);

    const price = getFieldValue([
        "price",
        "productPrice"
    ]);

    const color = getFieldValue([
        "color",
        "productColor"
    ]);

    const size = getFieldValue([
        "size",
        "productSize"
    ]);

    const material = getFieldValue([
        "material",
        "fabric",
        "productMaterial"
    ]);

    const pattern = getFieldValue([
        "pattern",
        "productPattern"
    ]);

    const fit = getFieldValue([
        "fit",
        "productFit"
    ]);

    const occasion = getFieldValue([
        "occasion",
        "productOccasion"
    ]);

    const quantity = getFieldValue([
        "quantity",
        "productQuantity"
    ]);

    const importantKeywords = getFieldValue([
        "importantKeywords",
        "keywords",
        "seoKeywords"
    ]);

    const imageDescription = getFieldValue([
        "imageDescription",
        "imageDetails"
    ]);


    return {

        category,

        productName,

        productDetails,

        brand,

        price,

        color,

        size,

        material,

        pattern,

        fit,

        occasion,

        quantity,

        importantKeywords,

        imageDescription
    };
}


// ==========================================================
// VALIDATION
// ==========================================================

function validateProductData(data) {

    if (!data.category) {

        return {
            valid: false,
            message: "❌ Product category is required."
        };
    }

    if (!CATEGORIES.includes(data.category)) {

        return {
            valid: false,
            message:
                "❌ Please select a valid product category."
        };
    }

    if (!data.productName) {

        return {
            valid: false,
            message:
                "❌ Product name is required."
        };
    }

    if (data.productName.length < 2) {

        return {
            valid: false,
            message:
                "❌ Please enter a valid product name."
        };
    }

    if (data.productName.length > 200) {

        return {
            valid: false,
            message:
                "❌ Product name is too long."
        };
    }

    return {
        valid: true,
        message: ""
    };
}


// ==========================================================
// STATUS UI
// ==========================================================

function getStatusElement() {

    return getElement(
        "listingStatus",
        "statusMessage",
        "generateStatus",
        "status"
    );
}


function showStatus(message, type = "info") {

    const status = getStatusElement();

    if (!status) {
        return;
    }

    status.textContent = message;

    status.className =
        `listing-status ${type}`;

    status.style.display = "block";
}


function hideStatus() {

    const status = getStatusElement();

    if (!status) {
        return;
    }

    status.style.display = "none";
}


// ==========================================================
// BUTTON STATE
// ==========================================================

function getGenerateButton() {

    return getElement(
        "generateListingBtn",
        "generateCompleteListingBtn",
        "generateListing",
        "generateButton"
    );
}


function setLoading(isLoading) {

    const button = getGenerateButton();

    if (!button) {
        return;
    }

    if (isLoading) {

        button.disabled = true;

        if (!button.dataset.originalText) {
            button.dataset.originalText =
                button.textContent.trim();
        }

        button.textContent =
            "⏳ Generating Listing...";

    } else {

        button.disabled = false;

        button.textContent =
            button.dataset.originalText ||
            "✨ Generate Complete Listing";
    }
}


// ==========================================================
// RESULT ELEMENT
// ==========================================================

function getResultContainer() {

    return getElement(
        "listingResult",
        "generatedListing",
        "result",
        "output"
    );
}


function clearResult() {

    const result = getResultContainer();

    if (!result) {
        return;
    }

    result.innerHTML = "";

    result.style.display = "none";
}


// ==========================================================
// NORMALIZE API RESPONSE
// ==========================================================

function extractListing(response) {

    if (!response) {
        return null;
    }

    // Direct listing object
    if (
        response.title ||
        response.description ||
        response.highlights
    ) {
        return response;
    }

    // Common backend wrappers
    if (response.listing) {
        return response.listing;
    }

    if (response.data && response.data.listing) {
        return response.data.listing;
    }

    if (response.result && response.result.listing) {
        return response.result.listing;
    }

    if (response.data && typeof response.data === "object") {
        return response.data;
    }

    if (response.result && typeof response.result === "object") {
        return response.result;
    }

    return null;
}


// ==========================================================
// ARRAY / TEXT FORMATTER
// ==========================================================

function formatList(value) {

    if (!value) {
        return "";
    }

    if (Array.isArray(value)) {

        return value
            .map(item => String(item).trim())
            .filter(Boolean)
            .map(item => `<li>${escapeHTML(item)}</li>`)
            .join("");
    }

    const text = String(value).trim();

    if (!text) {
        return "";
    }

    const lines = text
        .split(/\r?\n/)
        .map(line =>
            line
                .replace(/^[•\-*]\s*/, "")
                .replace(/^\d+[.)]\s*/, "")
                .trim()
        )
        .filter(Boolean);

    if (lines.length <= 1) {

        return `<li>${escapeHTML(text)}</li>`;
    }

    return lines
        .map(line => `<li>${escapeHTML(line)}</li>`)
        .join("");
}


// ==========================================================
// RENDER LISTING
// ==========================================================

function renderListing(listing) {

    const result = getResultContainer();

    if (!result) {

        console.error(
            "Listing result container not found."
        );

        return;
    }

    const title =
        listing.title ||
        listing.productTitle ||
        "";

    const description =
        listing.description ||
        listing.productDescription ||
        "";

    const highlights =
        listing.highlights ||
        listing.keyFeatures ||
        listing.features ||
        [];

    const keywords =
        listing.keywords ||
        listing.seoKeywords ||
        [];

    const tags =
        listing.tags ||
        listing.hashtags ||
        [];

    const specifications =
        listing.specifications ||
        listing.specs ||
        "";


    let html = `

        <div class="generated-listing-card">

            <div class="listing-card-header">

                <h2>✅ Generated Product Listing</h2>

            </div>


            ${
                title
                ? `
                <section class="listing-section">

                    <h3>📝 TITLE</h3>

                    <div class="listing-content">
                        ${escapeHTML(title)}
                    </div>

                </section>
                `
                : ""
            }


            ${
                description
                ? `
                <section class="listing-section">

                    <h3>📄 DESCRIPTION</h3>

                    <div class="listing-content description-content">
                        ${escapeHTML(description)}
                    </div>

                </section>
                `
                : ""
            }


            ${
                highlights
                ? `
                <section class="listing-section">

                    <h3>⭐ HIGHLIGHTS</h3>

                    <ul class="listing-list">
                        ${formatList(highlights)}
                    </ul>

                </section>
                `
                : ""
            }


            ${
                specifications
                ? `
                <section class="listing-section">

                    <h3>📌 SPECIFICATIONS</h3>

                    <div class="listing-content">
                        ${escapeHTML(
                            typeof specifications === "object"
                                ? JSON.stringify(
                                    specifications,
                                    null,
                                    2
                                )
                                : specifications
                        )}
                    </div>

                </section>
                `
                : ""
            }


            ${
                keywords
                ? `
                <section class="listing-section">

                    <h3>🔎 SEO KEYWORDS</h3>

                    <div class="listing-tags">

                        ${
                            Array.isArray(keywords)
                                ? keywords
                                    .map(k =>
                                        `<span>${escapeHTML(k)}</span>`
                                    )
                                    .join("")
                                : escapeHTML(keywords)
                        }

                    </div>

                </section>
                `
                : ""
            }


            ${
                tags
                ? `
                <section class="listing-section">

                    <h3>🏷️ TAGS / HASHTAGS</h3>

                    <div class="listing-tags">

                        ${
                            Array.isArray(tags)
                                ? tags
                                    .map(tag =>
                                        `<span>${escapeHTML(tag)}</span>`
                                    )
                                    .join("")
                                : escapeHTML(tags)
                        }

                    </div>

                </section>
                `
                : ""
            }


            <div class="listing-actions">

                <button
                    type="button"
                    id="copyGeneratedListingBtn"
                    class="copy-listing-btn"
                >
                    📋 Copy Listing
                </button>

            </div>

        </div>
    `;


    result.innerHTML = html;

    result.style.display = "block";


    const copyButton =
        document.getElementById(
            "copyGeneratedListingBtn"
        );

    if (copyButton) {

        copyButton.addEventListener(
            "click",
            copyGeneratedListing
        );
    }


    result.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ==========================================================
// BUILD COPY TEXT
// ==========================================================

function buildCopyText(listing) {

    let text = "";

    if (listing.title) {

        text +=
            "TITLE\n\n" +
            listing.title +
            "\n\n";
    }

    if (listing.description) {

        text +=
            "DESCRIPTION\n\n" +
            listing.description +
            "\n\n";
    }

    if (listing.highlights) {

        text +=
            "HIGHLIGHTS\n\n";

        if (Array.isArray(listing.highlights)) {

            text +=
                listing.highlights
                    .map(item => `• ${item}`)
                    .join("\n");

        } else {

            text += listing.highlights;
        }

        text += "\n\n";
    }

    if (listing.specifications) {

        text +=
            "SPECIFICATIONS\n\n";

        if (
            typeof listing.specifications ===
            "object"
        ) {

            text += JSON.stringify(
                listing.specifications,
                null,
                2
            );

        } else {

            text += listing.specifications;
        }

        text += "\n\n";
    }

    if (listing.keywords) {

        text +=
            "SEO KEYWORDS\n\n";

        if (Array.isArray(listing.keywords)) {

            text +=
                listing.keywords.join(", ");

        } else {

            text += listing.keywords;
        }

        text += "\n\n";
    }

    if (listing.tags) {

        text +=
            "TAGS / HASHTAGS\n\n";

        if (Array.isArray(listing.tags)) {

            text +=
                listing.tags.join(" ");

        } else {

            text += listing.tags;
        }
    }

    return text.trim();
}


// ==========================================================
// COPY GENERATED LISTING
// ==========================================================

async function copyGeneratedListing() {

    if (!window.__lastGeneratedListing) {

        showStatus(
            "❌ No generated listing available to copy.",
            "error"
        );

        return;
    }

    const text =
        buildCopyText(
            window.__lastGeneratedListing
        );

    try {

        await navigator.clipboard.writeText(text);

        showStatus(
            "✅ Listing copied successfully!",
            "success"
        );

    } catch (error) {

        // Fallback copy method

        const textarea =
            document.createElement("textarea");

        textarea.value = text;

        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        try {

            document.execCommand("copy");

            showStatus(
                "✅ Listing copied successfully!",
                "success"
            );

        } catch (copyError) {

            showStatus(
                "❌ Could not copy listing. Please copy it manually.",
                "error"
            );

        }

        textarea.remove();
    }
}


// ==========================================================
// API ERROR MESSAGE
// ==========================================================

function getApiErrorMessage(response, data) {

    if (data) {

        if (typeof data.message === "string") {
            return data.message;
        }

        if (typeof data.error === "string") {
            return data.error;
        }

        if (
            data.error &&
            typeof data.error.message === "string"
        ) {
            return data.error.message;
        }
    }


    if (response.status === 400) {
        return "❌ Invalid product information.";
    }

    if (response.status === 401) {
        return "❌ API authentication failed.";
    }

    if (response.status === 403) {
        return "❌ API access is not allowed.";
    }

    if (response.status === 404) {
        return "❌ Listing API endpoint was not found.";
    }

    if (response.status === 429) {
        return "⚠️ AI service is temporarily busy. Please try again.";
    }

    if (response.status === 500) {
        return "❌ Server error. Please try again.";
    }

    if (response.status === 503) {
        return "⚠️ AI service is temporarily unavailable. Please try again in a moment.";
    }

    return `❌ Request failed (${response.status}).`;
}


// ==========================================================
// GENERATE LISTING
// ==========================================================

async function generateCompleteListing() {

    clearResult();

    hideStatus();

    const data =
        collectProductData();


    // ------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------

    const validation =
        validateProductData(data);

    if (!validation.valid) {

        showStatus(
            validation.message,
            "error"
        );

        return;
    }


    // ------------------------------------------------------
    // LOADING
    // ------------------------------------------------------

    setLoading(true);

    showStatus(
        "⏳ AI is generating your complete product listing...",
        "loading"
    );


    try {

        // --------------------------------------------------
        // REQUEST
        // --------------------------------------------------

        const response =
            await fetch(
                GENERATE_LISTING_ENDPOINT,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );


        // --------------------------------------------------
        // READ RESPONSE SAFELY
        // --------------------------------------------------

        const rawText =
            await response.text();

        let responseData = null;

        if (rawText) {

            try {

                responseData =
                    JSON.parse(rawText);

            } catch (jsonError) {

                console.error(
                    "Invalid JSON response:",
                    rawText
                );

                throw new Error(
                    "Server returned an invalid response."
                );
            }
        }


        // --------------------------------------------------
        // HTTP ERROR
        // --------------------------------------------------

        if (!response.ok) {

            throw new Error(
                getApiErrorMessage(
                    response,
                    responseData
                )
            );
        }


        // --------------------------------------------------
        // SUCCESS CHECK
        // --------------------------------------------------

        if (
            responseData &&
            responseData.success === false
        ) {

            throw new Error(
                responseData.message ||
                responseData.error ||
                "Listing generation failed."
            );
        }


        // --------------------------------------------------
        // EXTRACT LISTING
        // --------------------------------------------------

        const listing =
            extractListing(responseData);


        if (!listing) {

            console.error(
                "Unexpected API response:",
                responseData
            );

            throw new Error(
                "AI returned no listing result."
            );
        }


        // --------------------------------------------------
        // SAVE LAST RESULT
        // --------------------------------------------------

        window.__lastGeneratedListing =
            listing;


        // --------------------------------------------------
        // RENDER
        // --------------------------------------------------

        renderListing(listing);


        // --------------------------------------------------
        // SUCCESS
        // --------------------------------------------------

        showStatus(
            "✅ Listing generated successfully!",
            "success"
        );


    } catch (error) {

        console.error(
            "Generate Listing Error:",
            error
        );


        let message =
            error && error.message
                ? error.message
                : "Something went wrong.";


        if (
            error.name ===
            "TypeError"
        ) {

            message =
                "❌ Cannot connect to AI backend. Please check the API server.";
        }


        showStatus(
            message,
            "error"
        );


    } finally {

        setLoading(false);
    }
}


// ==========================================================
// EVENT SETUP
// ==========================================================

function setupGenerateButton() {

    const button =
        getGenerateButton();

    if (!button) {

        console.warn(
            "Generate Listing button not found."
        );

        return;
    }


    // Prevent duplicate event listeners

    if (
        button.dataset
            .listingGeneratorReady === "true"
    ) {
        return;
    }


    button.dataset
        .listingGeneratorReady = "true";


    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            generateCompleteListing();

        }
    );
}


// ==========================================================
// ENTER KEY SUPPORT
// ==========================================================

function setupKeyboardSupport() {

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.ctrlKey &&
                event.key === "Enter"
            ) {

                event.preventDefault();

                generateCompleteListing();
            }
        }
    );
}


// ==========================================================
// CATEGORY AUTO-DETECTION
// ==========================================================

function setupCategoryNormalization() {

    const categoryElement =
        getElement(
            "productCategory",
            "category",
            "listingCategory"
        );

    if (!categoryElement) {
        return;
    }


    categoryElement.addEventListener(
        "change",
        function() {

            const normalized =
                normalizeCategory(
                    categoryElement.value
                );

            if (
                normalized &&
                CATEGORIES.includes(normalized)
            ) {

                categoryElement.value =
                    normalized;
            }
        }
    );
}


// ==========================================================
// API HEALTH CHECK
// ==========================================================

async function checkBackendStatus() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/status`,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            console.warn(
                "Backend status check failed:",
                response.status
            );

            return false;
        }


        const data =
            await response.json();

        console.log(
            "AI Seller Toolkit Backend:",
            data
        );

        return true;

    } catch (error) {

        console.warn(
            "Backend unavailable:",
            error.message
        );

        return false;
    }
}


// ==========================================================
// INITIALIZATION
// ==========================================================

function initializeCompleteListingGenerator() {

    console.log(
        "=================================================="
    );

    console.log(
        "AI SELLER TOOLKIT"
    );

    console.log(
        "Complete Listing Generator — Version 8.0"
    );

    console.log(
        "Backend:",
        API_BASE_URL
    );

    console.log(
        "=================================================="
    );


    setupGenerateButton();

    setupKeyboardSupport();

    setupCategoryNormalization();


    // Backend check is informational only.
    // It does NOT block the Generate button.

    checkBackendStatus();
}


// ==========================================================
// DOM READY
// ==========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCompleteListingGenerator
    );

} else {

    initializeCompleteListingGenerator();
}


// ==========================================================
// GLOBAL FUNCTIONS
// ==========================================================
//
// These are exposed globally so HTML onclick handlers
// can also use them if required.
//

window.generateCompleteListing =
    generateCompleteListing;

window.copyGeneratedListing =
    copyGeneratedListing;

window.clearListingResult =
    clearResult;

window.checkBackendStatus =
    checkBackendStatus;


// ==========================================================
// END OF VERSION 8.0
// ==========================================================
