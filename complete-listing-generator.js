// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE-LISTING-GENERATOR.JS — FINAL VERSION 7.2
// ==========================================================
// Stable Frontend
// Backend 7.1 Compatible
// Strict Fact Guard Compatible
// All Categories Supported
// Generate Button Fixed
// Response Parser Fixed
// Duplicate Event Protection
// Form Submit Protection
// ==========================================================


// ==========================================================
// CONFIG
// ==========================================================

const API_BASE_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const GENERATE_ENDPOINT =
    API_BASE_URL + "/api/generate-listing";

const CATEGORIES_ENDPOINT =
    API_BASE_URL + "/api/categories";

const STATUS_ENDPOINT =
    API_BASE_URL + "/api/status";


// ==========================================================
// GLOBAL STATE
// ==========================================================

let isGenerating = false;
let currentCategory = "";


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
// CATEGORY FIELDS
// ==========================================================

const CATEGORY_FIELDS = {

    "Fashion": [
        ["fabricMaterial", "Fabric / Material"],
        ["color", "Color"],
        ["size", "Size"],
        ["pattern", "Pattern"],
        ["fit", "Fit"],
        ["occasion", "Occasion"],
        ["quantity", "Quantity"]
    ],

    "Beauty": [
        ["formTexture", "Form / Texture"],
        ["color", "Color"],
        ["quantity", "Quantity"],
        ["variant", "Variant"],
        ["ingredients", "Ingredients"],
        ["skinType", "Skin Type"],
        ["hairType", "Hair Type"],
        ["fragrance", "Fragrance"]
    ],

    "Electronics": [
        ["model", "Model"],
        ["color", "Color"],
        ["storage", "Storage"],
        ["ram", "RAM"],
        ["battery", "Battery"],
        ["connectivity", "Connectivity"],
        ["compatibility", "Compatibility"],
        ["warranty", "Warranty"],
        ["quantity", "Quantity"]
    ],

    "Home & Kitchen": [
        ["material", "Material"],
        ["color", "Color"],
        ["sizeDimensions", "Size / Dimensions"],
        ["capacity", "Capacity"],
        ["quantity", "Quantity"],
        ["usage", "Usage"]
    ],

    "Shoes": [
        ["fabricMaterial", "Fabric / Material"],
        ["color", "Color"],
        ["size", "Size"],
        ["pattern", "Pattern"],
        ["fit", "Fit"],
        ["occasion", "Occasion"],
        ["quantity", "Quantity"]
    ],

    "Jewellery": [
        ["material", "Material"],
        ["color", "Color"],
        ["design", "Design"],
        ["size", "Size"],
        ["stone", "Stone"],
        ["occasion", "Occasion"],
        ["quantity", "Quantity"]
    ],

    "Toys": [
        ["material", "Material"],
        ["color", "Color"],
        ["size", "Size"],
        ["ageGroup", "Age Group"],
        ["quantity", "Quantity"],
        ["productType", "Product Type"]
    ],

    "Books": [
        ["author", "Author"],
        ["language", "Language"],
        ["format", "Format"],
        ["pages", "Pages"],
        ["publisher", "Publisher"],
        ["edition", "Edition"],
        ["isbn", "ISBN"]
    ],

    "Pet": [
        ["petType", "Pet Type"],
        ["material", "Material"],
        ["size", "Size"],
        ["quantity", "Quantity"],
        ["ingredients", "Ingredients"],
        ["flavour", "Flavour"]
    ],

    "Sports": [
        ["material", "Material"],
        ["color", "Color"],
        ["size", "Size"],
        ["sportType", "Sport Type"],
        ["quantity", "Quantity"],
        ["usage", "Usage"]
    ],

    "Automotive": [
        ["model", "Model"],
        ["vehicleCompatibility", "Vehicle Compatibility"],
        ["material", "Material"],
        ["color", "Color"],
        ["dimensions", "Dimensions"],
        ["quantity", "Quantity"]
    ],

    "Garden": [
        ["material", "Material"],
        ["color", "Color"],
        ["size", "Size"],
        ["quantity", "Quantity"],
        ["plantCompatibility", "Plant Compatibility"],
        ["usage", "Usage"]
    ],

    "Food": [
        ["ingredients", "Ingredients"],
        ["flavour", "Flavour"],
        ["quantity", "Quantity"],
        ["formTexture", "Form"],
        ["variant", "Variant"],
        ["dietaryInformation", "Dietary Information"]
    ],

    "Gifts": [
        ["material", "Material"],
        ["color", "Color"],
        ["size", "Size"],
        ["occasion", "Occasion"],
        ["quantity", "Quantity"],
        ["giftType", "Gift Type"]
    ]

};


// ==========================================================
// DOM HELPER
// ==========================================================

function $(id) {

    return document.getElementById(id);

}


function firstElement(ids) {

    for (const id of ids) {

        const el = $(id);

        if (el) {
            return el;
        }

    }

    return null;

}


function getValue(ids) {

    const el = firstElement(ids);

    if (!el) {
        return "";
    }

    return String(el.value || "").trim();

}


// ==========================================================
// MESSAGE
// ==========================================================

function getMessageElement() {

    return firstElement([

        "message",
        "statusMessage",
        "formMessage",
        "errorMessage",
        "successMessage"

    ]);

}


function showMessage(text, type = "info") {

    const el = getMessageElement();

    if (!el) {

        if (type === "error") {
            console.error(text);
        } else {
            console.log(text);
        }

        return;

    }

    el.textContent = text;

    el.style.display = "block";

    el.className =
        "message " + type;

}


function clearMessage() {

    const el = getMessageElement();

    if (!el) {
        return;
    }

    el.textContent = "";

    el.style.display = "none";

}


// ==========================================================
// CATEGORY SELECT
// ==========================================================

function getCategoryElement() {

    return firstElement([

        "category",
        "productCategory",
        "categorySelect",
        "product-category",
        "productCategorySelect"

    ]);

}


function normalizeCategory(value) {

    if (!value) {
        return "";
    }

    let text =
        String(value)
            .trim()
            .replace(
                /^[\p{Extended_Pictographic}\p{Emoji_Presentation}\s]+/u,
                ""
            )
            .trim();

    const lower =
        text.toLowerCase();

    const map = {

        "fashion": "Fashion",
        "fashion & clothing": "Fashion",
        "fashion and clothing": "Fashion",
        "clothing": "Fashion",
        "apparel": "Fashion",

        "beauty": "Beauty",
        "personal care": "Beauty",
        "personal-care": "Beauty",

        "electronics": "Electronics",
        "electronic": "Electronics",

        "home": "Home & Kitchen",
        "kitchen": "Home & Kitchen",
        "home kitchen": "Home & Kitchen",
        "home & kitchen": "Home & Kitchen",
        "home and kitchen": "Home & Kitchen",

        "shoe": "Shoes",
        "shoes": "Shoes",
        "footwear": "Shoes",

        "jewellery": "Jewellery",
        "jewelry": "Jewellery",

        "toy": "Toys",
        "toys": "Toys",

        "book": "Books",
        "books": "Books",

        "pet": "Pet",
        "pets": "Pet",

        "sport": "Sports",
        "sports": "Sports",
        "fitness": "Sports",

        "automotive": "Automotive",
        "automobile": "Automotive",

        "garden": "Garden",
        "gardening": "Garden",

        "food": "Food",
        "foods": "Food",
        "grocery": "Food",

        "gift": "Gifts",
        "gifts": "Gifts"

    };

    return map[lower] || text;

}


// ==========================================================
// RENDER CATEGORY FIELDS
// ==========================================================

function getDynamicContainer() {

    return firstElement([

        "categoryFields",
        "dynamicFields",
        "categorySpecificFields",
        "categoryFieldsContainer",
        "dynamic-category-fields",
        "additionalFields"

    ]);

}


function renderCategoryFields(category) {

    const container =
        getDynamicContainer();

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const fields =
        CATEGORY_FIELDS[category] || [];

    if (!fields.length) {
        return;
    }

    const heading =
        document.createElement("h3");

    heading.textContent =
        category + " Product Information";

    container.appendChild(heading);

    const grid =
        document.createElement("div");

    grid.className =
        "category-fields-grid";

    fields.forEach(function(field) {

        const name = field[0];
        const label = field[1];

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "category-field";

        const labelEl =
            document.createElement("label");

        labelEl.textContent =
            label;

        labelEl.htmlFor =
            "field-" + name;

        const input =
            document.createElement("input");

        input.type = "text";

        input.id =
            "field-" + name;

        input.name = name;

        input.placeholder =
            "Enter " + label + " if known";

        wrapper.appendChild(labelEl);

        wrapper.appendChild(input);

        grid.appendChild(wrapper);

    });

    container.appendChild(grid);

}


// ==========================================================
// CATEGORY CHANGE
// ==========================================================

function handleCategoryChange() {

    const select =
        getCategoryElement();

    if (!select) {
        return;
    }

    currentCategory =
        normalizeCategory(select.value);

    renderCategoryFields(
        currentCategory
    );

}


// ==========================================================
// LOAD CATEGORIES
// ==========================================================

async function loadCategories() {

    const select =
        getCategoryElement();

    if (!select) {
        return;
    }

    try {

        const response =
            await fetch(
                CATEGORIES_ENDPOINT,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );

        if (!response.ok) {
            throw new Error(
                "Category server error: " +
                response.status
            );
        }

        const data =
            await response.json();

        if (
            !data ||
            !Array.isArray(data.categories)
        ) {

            throw new Error(
                "Invalid categories response"
            );

        }

        fillCategories(
            select,
            data.categories
        );

    } catch (error) {

        console.warn(
            "Using local categories.",
            error
        );

        fillCategories(
            select,
            CATEGORIES.map(function(name) {

                return {
                    name: name
                };

            })
        );

    }

}


function fillCategories(select, categories) {

    const oldValue =
        normalizeCategory(select.value);

    select.innerHTML = "";

    const placeholder =
        document.createElement("option");

    placeholder.value = "";

    placeholder.textContent =
        "Select Product Category";

    select.appendChild(placeholder);

    categories.forEach(function(item) {

        const name =
            typeof item === "string"
                ? item
                : item.name;

        if (!name) {
            return;
        }

        const option =
            document.createElement("option");

        option.value = name;

        option.textContent = name;

        select.appendChild(option);

    });

    if (oldValue) {

        for (
            const option
            of select.options
        ) {

            if (
                normalizeCategory(
                    option.value
                ) === oldValue
            ) {

                select.value =
                    option.value;

                break;

            }

        }

    }

    handleCategoryChange();

}


// ==========================================================
// COLLECT CATEGORY FIELDS
// ==========================================================

function collectFields(category) {

    const result = {};

    const fields =
        CATEGORY_FIELDS[category] || [];

    fields.forEach(function(field) {

        const name = field[0];

        const input =
            firstElement([
                "field-" + name,
                name
            ]);

        if (!input) {
            return;
        }

        const value =
            String(
                input.value || ""
            ).trim();

        if (value) {
            result[name] = value;
        }

    });

    return result;

}


// ==========================================================
// COLLECT PRODUCT
// ==========================================================

function collectProductData() {

    const categoryElement =
        getCategoryElement();

    const category =
        categoryElement
            ? normalizeCategory(
                categoryElement.value
            )
            : "";

    const product = {

        category: category,

        productName:
            getValue([
                "productName",
                "product_name",
                "name"
            ]),

        brand:
            getValue([
                "brand",
                "brandName",
                "productBrand"
            ]),

        price:
            getValue([
                "price",
                "productPrice",
                "product_price"
            ]),

        productFeatures:
            getValue([
                "productFeatures",
                "features",
                "product_features",
                "featuresText"
            ]),

        extraProductInformation:
            getValue([
                "extraProductInformation",
                "extraInfo",
                "productDetails",
                "productDetailsExtra",
                "additionalInformation",
                "additionalInfo"
            ])

    };

    const categoryFields =
        collectFields(category);

    Object.assign(
        product,
        categoryFields
    );

    return product;

}


// ==========================================================
// VALIDATE
// ==========================================================

function validateProduct(product) {

    if (!product.category) {

        return {
            valid: false,
            message:
                "Please select a product category."
        };

    }

    if (
        !CATEGORIES.includes(
            product.category
        )
    ) {

        return {
            valid: false,
            message:
                "Please select a valid product category."
        };

    }

    if (!product.productName) {

        return {
            valid: false,
            message:
                "Please enter the product name."
        };

    }

    return {
        valid: true
    };

}


// ==========================================================
// BUILD PAYLOAD
// ==========================================================

function buildPayload(product) {

    const payload = {};

    Object.keys(product).forEach(function(key) {

        const value =
            product[key];

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            payload[key] =
                String(value).trim();

        }

    });

    return payload;

}


// ==========================================================
// BUTTON STATE
// ==========================================================

function setButtonState(disabled) {

    const buttons = [

        $("generateListingBtn"),
        $("generateCompleteListing"),
        $("generateBtn"),
        $("generateButton")

    ];

    buttons.forEach(function(button) {

        if (!button) {
            return;
        }

        if (!button.dataset.originalText) {

            button.dataset.originalText =
                button.textContent;

        }

        button.disabled =
            disabled;

        button.textContent =
            disabled
                ? "Generating..."
                : button.dataset.originalText;

    });

}


// ==========================================================
// API REQUEST
// ==========================================================

async function requestListing(payload) {

    console.log(
        "Sending listing request:",
        payload
    );

    const response =
        await fetch(
            GENERATE_ENDPOINT,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"
                },

                body:
                    JSON.stringify(payload)
            }
        );

    const rawText =
        await response.text();

    console.log(
        "Backend response:",
        rawText
    );

    let data;

    try {

        data =
            JSON.parse(rawText);

    } catch (error) {

        throw new Error(
            "Backend returned invalid JSON."
        );

    }

    if (!response.ok) {

        throw new Error(
            data.error ||
            data.message ||
            "Server error " +
            response.status
        );

    }

    if (
        data.success !== true
    ) {

        throw new Error(
            data.error ||
            data.message ||
            "Listing generation failed."
        );

    }

    return data;

}


// ==========================================================
// EXTRACT LISTING
// ==========================================================

function extractListing(data) {

    console.log(
        "Parsing listing:",
        data
    );

    let source =
        data.listing;

    if (
        !source ||
        typeof source !== "object"
    ) {

        source = data;

    }

    return {

        title:
            source.title ||
            source.TITLE ||
            "",

        description:
            source.description ||
            source.DESCRIPTION ||
            "",

        highlights:
            toArray(
                source.highlights ||
                source.HIGHLIGHTS
            ),

        keywords:
            toArray(
                source.keywords ||
                source.KEYWORDS
            ),

        hashtags:
            toArray(
                source.hashtags ||
                source.HASHTAGS
            ),

        seoTitle:
            source.seoTitle ||
            source["SEO TITLE"] ||
            source.seo_title ||
            "",

        seoDescription:
            source.seoDescription ||
            source["SEO DESCRIPTION"] ||
            source.seo_description ||
            ""

    };

}


// ==========================================================
// ARRAY CONVERTER
// ==========================================================

function toArray(value) {

    if (Array.isArray(value)) {

        return value
            .map(function(item) {

                return String(item).trim();

            })
            .filter(Boolean);

    }

    if (typeof value === "string") {

        return value
            .split(/\n|,/)
            .map(function(item) {

                return item
                    .replace(
                        /^[-•*]\s*/,
                        ""
                    )
                    .trim();

            })
            .filter(Boolean);

    }

    return [];

}


// ==========================================================
// FIND OUTPUT
// ==========================================================

function findOutput(ids) {

    return firstElement(ids);

}


// ==========================================================
// SET OUTPUT
// ==========================================================

function setOutput(ids, value) {

    const element =
        findOutput(ids);

    if (!element) {
        return false;
    }

    const text =
        value || "";

    if (
        "value" in element
    ) {

        element.value = text;

    } else {

        element.textContent = text;

    }

    element.style.display =
        "block";

    return true;

}


// ==========================================================
// SET ARRAY OUTPUT
// ==========================================================

function setArrayOutput(ids, values) {

    const element =
        findOutput(ids);

    if (!element) {
        return false;
    }

    const array =
        Array.isArray(values)
            ? values
            : [];

    if (
        element.tagName ===
        "TEXTAREA"
    ) {

        element.value =
            array.join("\n");

    } else {

        element.innerHTML = "";

        array.forEach(function(value) {

            const li =
                document.createElement("li");

            li.textContent =
                value;

            element.appendChild(li);

        });

    }

    element.style.display =
        "block";

    return true;

}


// ==========================================================
// DISPLAY LISTING
// ==========================================================

function displayListing(listing) {

    setOutput(
        [
            "titleResult",
            "generatedTitle",
            "listingTitle",
            "resultTitle"
        ],
        listing.title
    );

    setOutput(
        [
            "descriptionResult",
            "generatedDescription",
            "listingDescription",
            "resultDescription"
        ],
        listing.description
    );

    setArrayOutput(
        [
            "highlightsResult",
            "generatedHighlights",
            "listingHighlights",
            "resultHighlights"
        ],
        listing.highlights
    );

    setArrayOutput(
        [
            "keywordsResult",
            "generatedKeywords",
            "listingKeywords",
            "resultKeywords"
        ],
        listing.keywords
    );

    setArrayOutput(
        [
            "hashtagsResult",
            "generatedHashtags",
            "listingHashtags",
            "resultHashtags"
        ],
        listing.hashtags
    );

    setOutput(
        [
            "seoTitleResult",
            "generatedSeoTitle",
            "seoTitle",
            "resultSeoTitle"
        ],
        listing.seoTitle
    );

    setOutput(
        [
            "seoDescriptionResult",
            "generatedSeoDescription",
            "seoDescription",
            "resultSeoDescription"
        ],
        listing.seoDescription
    );

    const containers = [

        "resultContainer",
        "results",
        "listingResult",
        "generatedListing",
        "outputSection",
        "listingOutput"

    ];

    containers.forEach(function(id) {

        const el = $(id);

        if (el) {

            el.style.display =
                "block";

        }

    });

}


// ==========================================================
// MAIN GENERATE FUNCTION
// ==========================================================

async function generateCompleteListing(event) {

    if (event) {
        event.preventDefault();
    }

    if (isGenerating) {
        return;
    }

    clearMessage();

    const product =
        collectProductData();

    console.log(
        "Collected product:",
        product
    );

    const validation =
        validateProduct(product);

    if (!validation.valid) {

        showMessage(
            validation.message,
            "error"
        );

        return;

    }

    const payload =
        buildPayload(product);

    console.log(
        "Final API payload:",
        payload
    );

    isGenerating = true;

    setButtonState(true);

    showMessage(
        "Generating your product listing...",
        "info"
    );

    try {

        const data =
            await requestListing(
                payload
            );

        console.log(
            "Successful backend data:",
            data
        );

        const listing =
            extractListing(data);

        if (!listing.title) {

            console.error(
                "No title found in response:",
                data
            );

            throw new Error(
                "Backend returned success, but no listing data was found."
            );

        }

        displayListing(
            listing
        );

        try {

            localStorage.setItem(
                "aiSellerToolkitLastListing",
                JSON.stringify({

                    product:
                        payload,

                    listing:
                        listing,

                    source:
                        data.source ||
                        null,

                    model:
                        data.model ||
                        null,

                    version:
                        data.version ||
                        "7.1",

                    generatedAt:
                        new Date()
                            .toISOString()

                })
            );

        } catch (storageError) {

            console.warn(
                "LocalStorage unavailable:",
                storageError
            );

        }

        showMessage(
            "Listing generated successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "LISTING GENERATION ERROR:",
            error
        );

        showMessage(
            error.message ||
            "Unable to generate listing. Please try again.",
            "error"
        );

    } finally {

        isGenerating = false;

        setButtonState(false);

    }

}


// ==========================================================
// COPY LISTING
// ==========================================================

function getText(ids) {

    const el =
        firstElement(ids);

    if (!el) {
        return "";
    }

    if (
        "value" in el
    ) {

        return String(
            el.value || ""
        ).trim();

    }

    return String(
        el.textContent || ""
    ).trim();

}


function getCompleteListingText() {

    const title =
        getText([
            "titleResult",
            "generatedTitle",
            "listingTitle",
            "resultTitle"
        ]);

    const description =
        getText([
            "descriptionResult",
            "generatedDescription",
            "listingDescription",
            "resultDescription"
        ]);

    const highlights =
        getText([
            "highlightsResult",
            "generatedHighlights",
            "listingHighlights",
            "resultHighlights"
        ]);

    const keywords =
        getText([
            "keywordsResult",
            "generatedKeywords",
            "listingKeywords",
            "resultKeywords"
        ]);

    const hashtags =
        getText([
            "hashtagsResult",
            "generatedHashtags",
            "listingHashtags",
            "resultHashtags"
        ]);

    const seoTitle =
        getText([
            "seoTitleResult",
            "generatedSeoTitle",
            "seoTitle",
            "resultSeoTitle"
        ]);

    const seoDescription =
        getText([
            "seoDescriptionResult",
            "generatedSeoDescription",
            "seoDescription",
            "resultSeoDescription"
        ]);

    return [

        title
            ? "TITLE\n" + title
            : "",

        description
            ? "DESCRIPTION\n" + description
            : "",

        highlights
            ? "HIGHLIGHTS\n" + highlights
            : "",

        keywords
            ? "KEYWORDS\n" + keywords
            : "",

        hashtags
            ? "HASHTAGS\n" + hashtags
            : "",

        seoTitle
            ? "SEO TITLE\n" + seoTitle
            : "",

        seoDescription
            ? "SEO DESCRIPTION\n" + seoDescription
            : ""

    ]
        .filter(Boolean)
        .join("\n\n");

}


async function copyCompleteListing(event) {

    if (event) {
        event.preventDefault();
    }

    const text =
        getCompleteListingText();

    if (!text) {

        showMessage(
            "There is no generated listing to copy.",
            "error"
        );

        return;

    }

    try {

        await navigator.clipboard.writeText(
            text
        );

        showMessage(
            "Listing copied successfully.",
            "success"
        );

    } catch (error) {

        const textarea =
            document.createElement("textarea");

        textarea.value = text;

        document.body.appendChild(
            textarea
        );

        textarea.select();

        try {

            document.execCommand("copy");

            showMessage(
                "Listing copied successfully.",
                "success"
            );

        } catch (copyError) {

            showMessage(
                "Unable to copy listing.",
                "error"
            );

        }

        textarea.remove();

    }

}


// ==========================================================
// SERVER STATUS
// ==========================================================

async function checkServerStatus() {

    try {

        const response =
            await fetch(
                STATUS_ENDPOINT,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );

        if (!response.ok) {
            throw new Error(
                "Status HTTP " +
                response.status
            );
        }

        const data =
            await response.json();

        console.log(
            "AI Seller Toolkit Backend:",
            data
        );

        return data;

    } catch (error) {

        console.warn(
            "Backend status check failed:",
            error
        );

        return null;

    }

}


// ==========================================================
// LOAD LAST LISTING
// ==========================================================

function loadLastListing() {

    try {

        const saved =
            localStorage.getItem(
                "aiSellerToolkitLastListing"
            );

        if (!saved) {
            return;
        }

        const data =
            JSON.parse(saved);

        if (
            data &&
            data.listing &&
            data.listing.title
        ) {

            displayListing(
                data.listing
            );

        }

    } catch (error) {

        console.warn(
            "Could not load last listing:",
            error
        );

    }

}


// ==========================================================
// BIND GENERATE BUTTON
// ==========================================================

function bindGenerateButtons() {

    const ids = [

        "generateListingBtn",
        "generateCompleteListing",
        "generateBtn",
        "generateButton"

    ];

    ids.forEach(function(id) {

        const button = $(id);

        if (!button) {
            return;
        }

        if (
            button.dataset.aiSellerBound ===
            "true"
        ) {
            return;
        }

        button.dataset.aiSellerBound =
            "true";

        button.addEventListener(
            "click",
            generateCompleteListing
        );

    });

}


// ==========================================================
// BIND COPY BUTTON
// ==========================================================

function bindCopyButtons() {

    const ids = [

        "copyListingBtn",
        "copyCompleteListing",
        "copyButton",
        "copyListing"

    ];

    ids.forEach(function(id) {

        const button = $(id);

        if (!button) {
            return;
        }

        if (
            button.dataset.aiSellerCopyBound ===
            "true"
        ) {
            return;
        }

        button.dataset.aiSellerCopyBound =
            "true";

        button.addEventListener(
            "click",
            copyCompleteListing
        );

    });

}


// ==========================================================
// FORM SUBMIT FIX
// ==========================================================

function bindFormSubmit() {

    const buttons = [

        "generateListingBtn",
        "generateCompleteListing",
        "generateBtn",
        "generateButton"

    ];

    buttons.forEach(function(id) {

        const button = $(id);

        if (!button) {
            return;
        }

        const form =
            button.closest("form");

        if (!form) {
            return;
        }

        if (
            form.dataset.aiSellerSubmitBound ===
            "true"
        ) {
            return;
        }

        form.dataset.aiSellerSubmitBound =
            "true";

        form.addEventListener(
            "submit",
            function(event) {

                event.preventDefault();

                generateCompleteListing(
                    event
                );

            }
        );

    });

}


// ==========================================================
// INITIALIZE
// ==========================================================

async function initialize() {

    console.log(
        "=================================================="
    );

    console.log(
        "AI SELLER TOOLKIT - COMPLETE LISTING GENERATOR 7.2"
    );

    console.log(
        "Backend:",
        API_BASE_URL
    );

    console.log(
        "=================================================="
    );

    const category =
        getCategoryElement();

    if (category) {

        category.addEventListener(
            "change",
            handleCategoryChange
        );

        if (
            category.options.length <= 1
        ) {

            await loadCategories();

        } else {

            handleCategoryChange();

        }

    }

    bindGenerateButtons();

    bindCopyButtons();

    bindFormSubmit();

    await checkServerStatus();

    loadLastListing();

}


// ==========================================================
// AUTO START
// ==========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );

} else {

    initialize();

}


// ==========================================================
// GLOBAL FUNCTIONS
// ==========================================================

window.generateCompleteListing =
    generateCompleteListing;

window.generateListing =
    generateCompleteListing;

window.copyCompleteListing =
    copyCompleteListing;

window.copyListing =
    copyCompleteListing;

window.handleCategoryChange =
    handleCategoryChange;


// ==========================================================
// END — FINAL VERSION 7.2
// ==========================================================
