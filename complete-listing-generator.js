// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE-LISTING-GENERATOR.JS — FINAL VERSION 11.0
// ==========================================================
// Backend Version 11 Compatible
// Gemini Interactions API Compatible
// Category Aware
// 14 Categories
// Strict Factual Data Handling
// Dynamic Category Fields
// Safe JSON Response Handling
// Result Display Guaranteed
// Button + Form Submit Protection
// Duplicate Event Protection
// Mobile Friendly
// ==========================================================


// ==========================================================
// CONFIG
// ==========================================================

const API_BASE_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const GENERATE_ENDPOINT =
    `${API_BASE_URL}/api/generate-listing`;

const CATEGORIES_ENDPOINT =
    `${API_BASE_URL}/api/categories`;

const STATUS_ENDPOINT =
    `${API_BASE_URL}/api/status`;


// ==========================================================
// SUPPORTED CATEGORIES
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
// CATEGORY FIELDS
// ==========================================================

const LOCAL_CATEGORY_FIELDS = {

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
// STATE
// ==========================================================

let currentCategory = "";

let isGenerating = false;

let initialized = false;


// ==========================================================
// DOM HELPER
// ==========================================================

function getElement(...ids) {

    for (const id of ids) {

        if (!id) continue;

        const element =
            document.getElementById(id);

        if (element) {
            return element;
        }

    }

    return null;

}


// ==========================================================
// VALUE HELPER
// ==========================================================

function getValue(...ids) {

    const element =
        getElement(...ids);

    if (!element) {
        return "";
    }

    return String(
        element.value || ""
    ).trim();

}


// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(category) {

    if (!category) {
        return "";
    }

    let value =
        String(category)
            .trim()
            .replace(
                /^[\p{Extended_Pictographic}\p{Emoji_Presentation}\s]+/u,
                ""
            )
            .trim();

    const lower =
        value.toLowerCase();

    const aliases = {

        "fashion":
            "Fashion",

        "fashion & clothing":
            "Fashion",

        "fashion and clothing":
            "Fashion",

        "clothing":
            "Fashion",

        "apparel":
            "Fashion",

        "beauty":
            "Beauty",

        "personal care":
            "Beauty",

        "personal-care":
            "Beauty",

        "electronics":
            "Electronics",

        "electronic":
            "Electronics",

        "home & kitchen":
            "Home & Kitchen",

        "home and kitchen":
            "Home & Kitchen",

        "home kitchen":
            "Home & Kitchen",

        "home":
            "Home & Kitchen",

        "kitchen":
            "Home & Kitchen",

        "shoes":
            "Shoes",

        "shoe":
            "Shoes",

        "footwear":
            "Shoes",

        "jewellery":
            "Jewellery",

        "jewelry":
            "Jewellery",

        "toys":
            "Toys",

        "toy":
            "Toys",

        "books":
            "Books",

        "book":
            "Books",

        "pet":
            "Pet",

        "pets":
            "Pet",

        "sports":
            "Sports",

        "sport":
            "Sports",

        "fitness":
            "Sports",

        "automotive":
            "Automotive",

        "automobile":
            "Automotive",

        "car accessories":
            "Automotive",

        "vehicle accessories":
            "Automotive",

        "garden":
            "Garden",

        "gardening":
            "Garden",

        "food":
            "Food",

        "foods":
            "Food",

        "grocery":
            "Food",

        "gifts":
            "Gifts",

        "gift":
            "Gifts"

    };

    return aliases[lower] || value;

}


// ==========================================================
// CATEGORY ELEMENT
// ==========================================================

function getCategoryElement() {

    return getElement(

        "category",
        "productCategory",
        "categorySelect",
        "product-category",
        "productCategorySelect"

    );

}


// ==========================================================
// GET CATEGORY
// ==========================================================

function getSelectedCategory() {

    const element =
        getCategoryElement();

    if (!element) {
        return "";
    }

    return normalizeCategory(
        element.value
    );

}


// ==========================================================
// DYNAMIC FIELD CONTAINER
// ==========================================================

function findDynamicFieldContainer() {

    return getElement(

        "categoryFields",
        "dynamicFields",
        "categorySpecificFields",
        "categoryFieldsContainer",
        "dynamic-category-fields",
        "additionalFields"

    );

}


// ==========================================================
// RENDER CATEGORY FIELDS
// ==========================================================

function renderCategoryFields(category) {

    const container =
        findDynamicFieldContainer();

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const fields =
        LOCAL_CATEGORY_FIELDS[category] || [];

    if (!fields.length) {
        return;
    }

    const heading =
        document.createElement("h3");

    heading.textContent =
        "📋 Category Details";

    heading.style.marginBottom =
        "12px";

    container.appendChild(
        heading
    );

    const grid =
        document.createElement("div");

    grid.className =
        "category-fields-grid";

    grid.style.display =
        "grid";

    grid.style.gridTemplateColumns =
        "repeat(2, minmax(0, 1fr))";

    grid.style.gap =
        "12px";

    fields.forEach(
        ([name, label]) => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "category-field";

            const labelElement =
                document.createElement("label");

            labelElement.textContent =
                label;

            labelElement.htmlFor =
                `field-${name}`;

            const input =
                document.createElement("input");

            input.type =
                "text";

            input.id =
                `field-${name}`;

            input.name =
                name;

            input.placeholder =
                `Enter ${label} if known`;

            input.autocomplete =
                "off";

            input.style.width =
                "100%";

            input.style.padding =
                "12px";

            input.style.borderRadius =
                "8px";

            input.style.border =
                "1px solid #ddd";

            wrapper.appendChild(
                labelElement
            );

            wrapper.appendChild(
                input
            );

            grid.appendChild(
                wrapper
            );

        }
    );

    container.appendChild(
        grid
    );

}


// ==========================================================
// CATEGORY CHANGE
// ==========================================================

function handleCategoryChange() {

    const category =
        getSelectedCategory();

    currentCategory =
        category;

    renderCategoryFields(
        category
    );

}


// ==========================================================
// COLLECT CATEGORY FIELDS
// ==========================================================

function collectCategoryFields(category) {

    const fields = {};

    const definitions =
        LOCAL_CATEGORY_FIELDS[
            category
        ] || [];

    definitions.forEach(
        ([name]) => {

            const input =
                getElement(
                    `field-${name}`,
                    name
                );

            if (!input) {
                return;
            }

            const value =
                String(
                    input.value || ""
                ).trim();

            if (value) {

                fields[name] =
                    value;

            }

        }
    );

    return fields;

}


// ==========================================================
// COLLECT PRODUCT DATA
// ==========================================================

function collectProductData() {

    const category =
        getSelectedCategory();

    const productName =
        getValue(
            "productName",
            "product_name",
            "name"
        );

    const brand =
        getValue(
            "brand",
            "brandName",
            "productBrand"
        );

    const price =
        getValue(
            "price",
            "productPrice",
            "product_price"
        );

    const productFeatures =
        getValue(
            "productFeatures",
            "features",
            "product_features",
            "featuresText"
        );

    const extraProductInformation =
        getValue(
            "extraProductInformation",
            "extraInfo",
            "productDetails",
            "productDetailsExtra",
            "additionalInformation",
            "additionalInfo"
        );

    const fields =
        collectCategoryFields(
            category
        );

    return {

        category,

        productName,

        brand,

        price,

        productFeatures,

        extraProductInformation,

        ...fields

    };

}


// ==========================================================
// VALIDATION
// ==========================================================

function validateProductData(product) {

    if (!product.category) {

        return {

            valid: false,

            message:
                "❌ Please select a product category."

        };

    }

    if (
        !SUPPORTED_CATEGORIES.includes(
            product.category
        )
    ) {

        return {

            valid: false,

            message:
                "❌ Please select a valid product category."

        };

    }

    if (!product.productName) {

        return {

            valid: false,

            message:
                "❌ Please enter the product name."

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

    const payload = {

        category:
            product.category,

        productName:
            product.productName,

        brand:
            product.brand,

        price:
            product.price,

        productFeatures:
            product.productFeatures,

        extraProductInformation:
            product.extraProductInformation

    };

    const fieldNames = [

        "material",
        "fabric",
        "fabricMaterial",

        "color",
        "size",
        "pattern",
        "fit",
        "occasion",
        "quantity",

        "formTexture",
        "variant",
        "ingredients",
        "skinType",
        "hairType",
        "fragrance",

        "model",
        "storage",
        "ram",
        "battery",
        "connectivity",
        "compatibility",
        "warranty",

        "sizeDimensions",
        "capacity",
        "usage",

        "design",
        "stone",

        "ageGroup",
        "productType",

        "author",
        "language",
        "format",
        "pages",
        "publisher",
        "edition",
        "isbn",

        "petType",
        "flavour",

        "sportType",

        "vehicleCompatibility",
        "dimensions",

        "plantCompatibility",

        "dietaryInformation",

        "giftType"

    ];

    fieldNames.forEach(
        name => {

            if (
                product[name] !== undefined &&
                product[name] !== ""
            ) {

                payload[name] =
                    product[name];

            }

        }
    );

    return payload;

}


// ==========================================================
// STATUS MESSAGE
// ==========================================================

function showStatus(message, type = "success") {

    let status =
        getElement(
            "completeListingStatus",
            "status",
            "listingStatus"
        );

    if (!status) {

        status =
            document.createElement("div");

        status.id =
            "completeListingStatus";

        const formCard =
            document.querySelector(
                ".card"
            );

        if (formCard) {

            formCard.appendChild(
                status
            );

        } else {

            document.body.appendChild(
                status
            );

        }

    }

    status.textContent =
        message;

    status.style.display =
        "block";

    status.style.marginTop =
        "14px";

    status.style.padding =
        "12px";

    status.style.borderRadius =
        "10px";

    status.style.lineHeight =
        "1.5";

    if (type === "error") {

        status.style.background =
            "#fff0f0";

        status.style.color =
            "#c62828";

    } else {

        status.style.background =
            "#e9f9ee";

        status.style.color =
            "#16833b";

    }

}


// ==========================================================
// HIDE STATUS
// ==========================================================

function hideStatus() {

    const status =
        getElement(
            "completeListingStatus",
            "status",
            "listingStatus"
        );

    if (!status) {
        return;
    }

    status.style.display =
        "none";

}


// ==========================================================
// SAFE STRING
// ==========================================================

function safeString(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    if (typeof value === "string") {

        return value.trim();

    }

    if (
        typeof value === "number" ||
        typeof value === "boolean"
    ) {

        return String(value);

    }

    return "";

}


// ==========================================================
// FIND TEXT INSIDE RESPONSE
// ==========================================================

function findTextValue(data, keys = []) {

    if (!data) {
        return "";
    }

    if (typeof data === "string") {
        return data.trim();
    }

    if (Array.isArray(data)) {

        for (const item of data) {

            const found =
                findTextValue(
                    item,
                    keys
                );

            if (found) {
                return found;
            }

        }

        return "";

    }

    if (typeof data !== "object") {
        return "";
    }

    for (const key of keys) {

        if (
            Object.prototype.hasOwnProperty.call(
                data,
                key
            )
        ) {

            const value =
                safeString(
                    data[key]
                );

            if (value) {
                return value;
            }

        }

    }

    const nestedKeys = [

        "listing",
        "result",
        "data",
        "output",
        "response",
        "content"

    ];

    for (const key of nestedKeys) {

        if (data[key]) {

            const found =
                findTextValue(
                    data[key],
                    keys
                );

            if (found) {
                return found;
            }

        }

    }

    return "";

}


// ==========================================================
// EXTRACT LISTING
// ==========================================================

function extractListing(data) {

    let listing = {

        title: "",

        description: "",

        highlights: [],

        keywords: []

    };


    // ------------------------------
    // TITLE
    // ------------------------------

    listing.title =
        findTextValue(
            data,
            [
                "title",
                "productTitle",
                "listingTitle"
            ]
        );


    // ------------------------------
    // DESCRIPTION
    // ------------------------------

    listing.description =
        findTextValue(
            data,
            [
                "description",
                "productDescription",
                "product_description"
            ]
        );


    // ------------------------------
    // HIGHLIGHTS
    // ------------------------------

    let highlights =
        findArrayValue(
            data,
            [
                "highlights",
                "keyFeatures",
                "features",
                "bulletPoints",
                "bullets"
            ]
        );

    listing.highlights =
        highlights;


    // ------------------------------
    // KEYWORDS
    // ------------------------------

    let keywords =
        findArrayValue(
            data,
            [
                "keywords",
                "seoKeywords",
                "searchKeywords"
            ]
        );

    listing.keywords =
        keywords;


    // ------------------------------
    // STRING RESULT
    // ------------------------------

    if (
        !listing.title &&
        !listing.description &&
        !listing.highlights.length &&
        !listing.keywords.length
    ) {

        const possibleText =
            findTextValue(
                data,
                [
                    "text",
                    "output_text",
                    "generatedText"
                ]
            );

        if (possibleText) {

            listing.description =
                possibleText;

        }

    }


    return listing;

}


// ==========================================================
// FIND ARRAY
// ==========================================================

function findArrayValue(data, keys = []) {

    if (!data) {
        return [];
    }

    if (typeof data !== "object") {
        return [];
    }

    if (Array.isArray(data)) {

        return data
            .map(
                item =>
                    safeString(item)
            )
            .filter(Boolean);

    }

    for (const key of keys) {

        if (
            Object.prototype.hasOwnProperty.call(
                data,
                key
            )
        ) {

            const value =
                data[key];

            if (Array.isArray(value)) {

                return value
                    .map(
                        item => {

                            if (
                                typeof item ===
                                "string"
                            ) {

                                return item.trim();

                            }

                            if (
                                item &&
                                typeof item ===
                                "object"
                            ) {

                                return (
                                    item.text ||
                                    item.value ||
                                    item.name ||
                                    ""
                                )
                                    .toString()
                                    .trim();

                            }

                            return "";

                        }
                    )
                    .filter(Boolean);

            }

            if (typeof value === "string") {

                return value
                    .split(/\n|•|;/)
                    .map(
                        item =>
                            item
                                .replace(
                                    /^\s*[-*•\d.)]+\s*/,
                                    ""
                                )
                                .trim()
                    )
                    .filter(Boolean);

            }

        }

    }

    const nestedKeys = [

        "listing",
        "result",
        "data",
        "output",
        "response"

    ];

    for (const key of nestedKeys) {

        if (data[key]) {

            const found =
                findArrayValue(
                    data[key],
                    keys
                );

            if (found.length) {
                return found;
            }

        }

    }

    return [];

}


// ==========================================================
// CREATE RESULT BOX
// ==========================================================

function createResultBox() {

    let box =
        document.getElementById(
            "completeListingResult"
        );

    if (box) {
        return box;
    }

    box =
        document.createElement("div");

    box.id =
        "completeListingResult";

    box.className =
        "card";

    box.style.marginTop =
        "20px";

    box.innerHTML = `

        <h2 style="margin-top:0;">
            📝 Generated Complete Listing
        </h2>

        <div id="listingTitleSection">

            <h3>🏷️ Product Title</h3>

            <div
                id="generatedTitle"
                style="
                    background:#f8f8ff;
                    border:1px solid #e2e2ff;
                    padding:15px;
                    border-radius:10px;
                    line-height:1.6;
                    white-space:pre-wrap;
                    overflow-wrap:anywhere;
                "
            ></div>

            <button
                type="button"
                id="copyListingTitle"
                style="
                    width:100%;
                    margin-top:10px;
                    padding:12px;
                    border:0;
                    border-radius:9px;
                    background:#222;
                    color:white;
                "
            >
                📋 Copy Title
            </button>

        </div>


        <div
            id="listingDescriptionSection"
            style="margin-top:20px;"
        >

            <h3>📝 Product Description</h3>

            <div
                id="generatedDescription"
                style="
                    background:#f8f8ff;
                    border:1px solid #e2e2ff;
                    padding:15px;
                    border-radius:10px;
                    line-height:1.7;
                    white-space:pre-wrap;
                    overflow-wrap:anywhere;
                "
            ></div>

            <button
                type="button"
                id="copyListingDescription"
                style="
                    width:100%;
                    margin-top:10px;
                    padding:12px;
                    border:0;
                    border-radius:9px;
                    background:#222;
                    color:white;
                "
            >
                📋 Copy Description
            </button>

        </div>


        <div
            id="listingHighlightsSection"
            style="margin-top:20px;"
        >

            <h3>⭐ Highlights</h3>

            <div
                id="generatedHighlights"
                style="
                    background:#f8f8ff;
                    border:1px solid #e2e2ff;
                    padding:15px;
                    border-radius:10px;
                    line-height:1.7;
                "
            ></div>

        </div>


        <div
            id="listingKeywordsSection"
            style="margin-top:20px;"
        >

            <h3>🔎 SEO Keywords</h3>

            <div
                id="generatedKeywords"
                style="
                    background:#f8f8ff;
                    border:1px solid #e2e2ff;
                    padding:15px;
                    border-radius:10px;
                    line-height:1.7;
                "
            ></div>

        </div>


        <button
            type="button"
            id="copyCompleteListing"
            style="
                width:100%;
                margin-top:20px;
                padding:14px;
                border:0;
                border-radius:10px;
                background:#222;
                color:white;
                font-weight:bold;
            "
        >
            📋 Copy Complete Listing
        </button>

    `;


    const container =
        document.querySelector(
            ".container"
        );

    if (container) {

        container.appendChild(
            box
        );

    } else {

        document.body.appendChild(
            box
        );

    }


    setupCopyButtons();

    return box;

}


// ==========================================================
// DISPLAY LISTING
// ==========================================================

function displayListing(listing) {

    const box =
        createResultBox();

    const title =
        document.getElementById(
            "generatedTitle"
        );

    const description =
        document.getElementById(
            "generatedDescription"
        );

    const highlights =
        document.getElementById(
            "generatedHighlights"
        );

    const keywords =
        document.getElementById(
            "generatedKeywords"
        );


    title.textContent =
        listing.title ||
        "No title returned";


    description.textContent =
        listing.description ||
        "No description returned";


    highlights.innerHTML = "";

    if (
        listing.highlights &&
        listing.highlights.length
    ) {

        listing.highlights.forEach(
            item => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.textContent =
                    "• " + item;

                highlights.appendChild(
                    div
                );

            }
        );

    } else {

        highlights.textContent =
            "No highlights returned.";

    }


    keywords.textContent =
        listing.keywords &&
        listing.keywords.length
            ? listing.keywords.join(
                ", "
            )
            : "No keywords returned.";


    box.style.display =
        "block";


    box.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================================
// COPY BUTTONS
// ==========================================================

function setupCopyButtons() {

    const titleButton =
        document.getElementById(
            "copyListingTitle"
        );

    const descriptionButton =
        document.getElementById(
            "copyListingDescription"
        );

    const completeButton =
        document.getElementById(
            "copyCompleteListing"
        );


    if (
        titleButton &&
        !titleButton.dataset.bound
    ) {

        titleButton.dataset.bound =
            "true";

        titleButton.addEventListener(
            "click",
            async () => {

                const text =
                    getElement(
                        "generatedTitle"
                    )
                        ?.textContent
                        .trim();

                if (!text) return;

                await copyText(
                    text,
                    titleButton,
                    "✅ Title Copied!"
                );

            }
        );

    }


    if (
        descriptionButton &&
        !descriptionButton.dataset.bound
    ) {

        descriptionButton.dataset.bound =
            "true";

        descriptionButton.addEventListener(
            "click",
            async () => {

                const text =
                    getElement(
                        "generatedDescription"
                    )
                        ?.textContent
                        .trim();

                if (!text) return;

                await copyText(
                    text,
                    descriptionButton,
                    "✅ Description Copied!"
                );

            }
        );

    }


    if (
        completeButton &&
        !completeButton.dataset.bound
    ) {

        completeButton.dataset.bound =
            "true";

        completeButton.addEventListener(
            "click",
            async () => {

                const title =
                    getValueFromElement(
                        "generatedTitle"
                    );

                const description =
                    getValueFromElement(
                        "generatedDescription"
                    );

                const highlights =
                    getValueFromElement(
                        "generatedHighlights"
                    );

                const keywords =
                    getValueFromElement(
                        "generatedKeywords"
                    );


                const completeText = [

                    "PRODUCT TITLE",
                    title,

                    "",

                    "PRODUCT DESCRIPTION",
                    description,

                    "",

                    "HIGHLIGHTS",
                    highlights,

                    "",

                    "SEO KEYWORDS",
                    keywords

                ]
                    .join("\n")
                    .trim();


                await copyText(
                    completeText,
                    completeButton,
                    "✅ Complete Listing Copied!"
                );

            }
        );

    }

}


// ==========================================================
// GET ELEMENT TEXT
// ==========================================================

function getValueFromElement(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.textContent.trim();

}


// ==========================================================
// COPY TEXT
// ==========================================================

async function copyText(
    text,
    button,
    successText
) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        const oldText =
            button.textContent;

        button.textContent =
            successText;

        setTimeout(
            () => {

                button.textContent =
                    oldText;

            },
            1500
        );

    }
    catch (error) {

        console.error(
            "COPY ERROR:",
            error
        );

        showStatus(
            "❌ Copy नहीं हो पाया।",
            "error"
        );

    }

}


// ==========================================================
// GENERATE LISTING
// ==========================================================

async function generateCompleteListing() {

    if (isGenerating) {
        return;
    }

    hideStatus();


    const product =
        collectProductData();


    const validation =
        validateProductData(
            product
        );


    if (!validation.valid) {

        showStatus(
            validation.message,
            "error"
        );

        return;

    }


    const payload =
        buildPayload(
            product
        );


    const generateButton =
        getElement(
            "generateBtn",
            "generateListingBtn",
            "generateCompleteListingBtn",
            "generateButton"
        );


    isGenerating =
        true;


    if (generateButton) {

        generateButton.disabled =
            true;

        generateButton.dataset.originalText =
            generateButton.textContent;

        generateButton.textContent =
            "⏳ Generating Complete Listing...";

    }


    const oldResult =
        document.getElementById(
            "completeListingResult"
        );

    if (oldResult) {

        oldResult.style.display =
            "none";

    }


    showStatus(
        "⏳ AI listing तैयार कर रहा है...",
        "success"
    );


    try {

        console.log(
            "COMPLETE LISTING REQUEST:",
            payload
        );


        const response =
            await fetch(
                GENERATE_ENDPOINT,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        const rawText =
            await response.text();


        console.log(
            "COMPLETE LISTING RAW RESPONSE:",
            rawText
        );


        let data;


        try {

            data =
                JSON.parse(
                    rawText
                );

        }
        catch {

            throw new Error(
                "Backend ने valid JSON response नहीं दिया।"
            );

        }


        if (!response.ok) {

            const backendError =
                findTextValue(
                    data,
                    [
                        "error",
                        "message",
                        "details"
                    ]
                );


            throw new Error(

                backendError ||
                `Server Error: ${response.status}`

            );

        }


        if (
            data &&
            data.success === false
        ) {

            throw new Error(

                findTextValue(
                    data,
                    [
                        "error",
                        "message"
                    ]
                ) ||
                "Listing generation failed."

            );

        }


        const listing =
            extractListing(
                data
            );


        console.log(
            "EXTRACTED LISTING:",
            listing
        );


        if (
            !listing.title &&
            !listing.description &&
            !listing.highlights.length &&
            !listing.keywords.length
        ) {

            throw new Error(
                "Backend से listing content नहीं मिला। Browser Console में response check करें।"
            );

        }


        displayListing(
            listing
        );


        showStatus(
            "✅ Complete Product Listing successfully generated!",
            "success"
        );


    }
    catch (error) {

        console.error(
            "COMPLETE LISTING GENERATOR ERROR:",
            error
        );


        showStatus(
            "❌ " +
            (
                error.message ||
                "Complete listing generate नहीं हो पाई।"
            ),
            "error"
        );

    }
    finally {

        isGenerating =
            false;


        if (generateButton) {

            generateButton.disabled =
                false;

            generateButton.textContent =
                generateButton.dataset.originalText ||
                "✨ Generate Complete Listing";

        }

    }

}


// ==========================================================
// FIND GENERATE BUTTON
// ==========================================================

function findGenerateButton() {

    return getElement(

        "generateBtn",

        "generateListingBtn",

        "generateCompleteListingBtn",

        "generateButton",

        "generate-listing-btn"

    ) || document.querySelector(

        'button[type="submit"]'

    );

}


// ==========================================================
// INITIALIZE
// ==========================================================

function initializeCompleteListingGenerator() {

    if (initialized) {
        return;
    }

    initialized =
        true;


    const categoryElement =
        getCategoryElement();


    if (categoryElement) {

        categoryElement.addEventListener(
            "change",
            handleCategoryChange
        );

    }


    const generateButton =
        findGenerateButton();


    if (!generateButton) {

        console.error(
            "❌ Generate Complete Listing button नहीं मिला।"
        );

        return;

    }


    // Prevent duplicate event binding

    if (
        generateButton.dataset.completeListingBound ===
        "true"
    ) {

        return;

    }


    generateButton.dataset.completeListingBound =
        "true";


    generateButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            generateCompleteListing();

        }
    );


    // If button is inside a form

    const form =
        generateButton.closest(
            "form"
        );


    if (
        form &&
        form.dataset.completeListingFormBound !==
        "true"
    ) {

        form.dataset.completeListingFormBound =
            "true";


        form.addEventListener(
            "submit",
            function(event) {

                event.preventDefault();

                generateCompleteListing();

            }
        );

    }


    // Initial category

    currentCategory =
        getSelectedCategory();


    if (currentCategory) {

        renderCategoryFields(
            currentCategory
        );

    }


    console.log(
        "✅ Complete Listing Generator initialized successfully."
    );

    console.log(
        "API:",
        GENERATE_ENDPOINT
    );

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
// GLOBAL FALLBACK
// ==========================================================

window.generateCompleteListing =
    generateCompleteListing;


// ==========================================================
// DEBUG INFORMATION
// ==========================================================

console.log(
    "================================================"
);

console.log(
    "AI SELLER TOOLKIT - COMPLETE LISTING GENERATOR"
);

console.log(
    "Version: 11.0"
);

console.log(
    "Backend:",
    API_BASE_URL
);

console.log(
    "Endpoint:",
    GENERATE_ENDPOINT
);

console.log(
    "Categories:",
    SUPPORTED_CATEGORIES.length
);

console.log(
    "================================================"
);
