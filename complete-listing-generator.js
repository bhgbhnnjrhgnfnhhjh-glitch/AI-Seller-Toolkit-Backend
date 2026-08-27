// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE-LISTING-GENERATOR.JS — FINAL VERSION 7.2
// ==========================================================
// Stable Frontend
// Backend 7.1 Compatible
// Category Aware
// Strict Fact Guard Compatible
// Result Display Guaranteed
// Auto Result Box
// Duplicate Event Protection
// Form Submit Protection
// No Invented Facts
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
// GLOBAL STATE
// ==========================================================

let categoryData = [];

let currentCategory = "";

let isGenerating = false;


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
// CATEGORY FIELD DEFINITIONS
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
// DOM HELPER
// ==========================================================

function getElement(...ids) {

    for (const id of ids) {

        if (!id) {
            continue;
        }

        const element =
            document.getElementById(id);

        if (element) {
            return element;
        }

    }

    return null;

}


// ==========================================================
// GET VALUE
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
// NORMALIZE CATEGORY
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

        "home & kitchen": "Home & Kitchen",
        "home and kitchen": "Home & Kitchen",
        "home kitchen": "Home & Kitchen",
        "home": "Home & Kitchen",
        "kitchen": "Home & Kitchen",

        "shoes": "Shoes",
        "shoe": "Shoes",
        "footwear": "Shoes",

        "jewellery": "Jewellery",
        "jewelry": "Jewellery",

        "toys": "Toys",
        "toy": "Toys",

        "books": "Books",
        "book": "Books",

        "pet": "Pet",
        "pets": "Pet",

        "sports": "Sports",
        "sport": "Sports",
        "fitness": "Sports",

        "automotive": "Automotive",
        "automobile": "Automotive",
        "car accessories": "Automotive",
        "vehicle accessories": "Automotive",

        "garden": "Garden",
        "gardening": "Garden",

        "food": "Food",
        "foods": "Food",
        "grocery": "Food",

        "gifts": "Gifts",
        "gift": "Gifts"

    };

    return (
        aliases[lower] ||
        value
    );

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
// GET SELECTED CATEGORY
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
        `${category} Product Information`;

    container.appendChild(
        heading
    );

    const grid =
        document.createElement("div");

    grid.className =
        "category-fields-grid";

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
// LOAD CATEGORIES
// ==========================================================

async function loadCategories() {

    const categoryElement =
        getCategoryElement();

    if (!categoryElement) {
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
                `Category API error: ${response.status}`
            );
        }

        const data =
            await response.json();

        if (
            !data ||
            !Array.isArray(data.categories)
        ) {

            throw new Error(
                "Invalid category response"
            );

        }

        categoryData =
            data.categories;

        populateCategorySelect(
            categoryElement,
            categoryData
        );

    } catch (error) {

        console.warn(
            "[CATEGORY LOAD ERROR]",
            error
        );

        const fallback =
            SUPPORTED_CATEGORIES.map(
                name => ({
                    name
                })
            );

        categoryData =
            fallback;

        populateCategorySelect(
            categoryElement,
            fallback
        );

    }

}


// ==========================================================
// POPULATE CATEGORY SELECT
// ==========================================================

function populateCategorySelect(
    select,
    categories
) {

    if (!select) {
        return;
    }

    const oldValue =
        normalizeCategory(
            select.value
        );

    select.innerHTML = "";

    const placeholder =
        document.createElement("option");

    placeholder.value =
        "";

    placeholder.textContent =
        "Select Product Category";

    select.appendChild(
        placeholder
    );

    categories.forEach(
        item => {

            let name = "";

            if (typeof item === "string") {

                name =
                    item;

            } else if (
                item &&
                item.name
            ) {

                name =
                    item.name;

            }

            const normalized =
                normalizeCategory(
                    name
                );

            if (
                !normalized ||
                !SUPPORTED_CATEGORIES.includes(
                    normalized
                )
            ) {

                return;

            }

            const option =
                document.createElement("option");

            option.value =
                normalized;

            option.textContent =
                normalized;

            select.appendChild(
                option
            );

        }
    );

    if (oldValue) {

        const matching =
            Array.from(
                select.options
            ).find(
                option =>
                    normalizeCategory(
                        option.value
                    ) === oldValue
            );

        if (matching) {

            select.value =
                matching.value;

        }

    }

    handleCategoryChange();

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
// COLLECT ALL KNOWN FIELDS
// ==========================================================

function collectKnownFields(category) {

    const fields =
        collectCategoryFields(
            category
        );

    const possibleFields = [

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

    possibleFields.forEach(
        name => {

            if (fields[name]) {
                return;
            }

            const input =
                getElement(name);

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
        collectKnownFields(
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
// VALIDATE PRODUCT
// ==========================================================

function validateProductData(product) {

    if (!product.category) {

        return {

            valid: false,

            message:
                "Please select a product category."

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
// BUILD API PAYLOAD
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
        field => {

            if (
                product[field] !== undefined &&
                product[field] !== null
            ) {

                const value =
                    String(
                        product[field]
                    ).trim();

                if (value) {

                    payload[field] =
                        value;

                }

            }

        }
    );

    return payload;

}


// ==========================================================
// MESSAGE ELEMENT
// ==========================================================

function getMessageElement() {

    return getElement(

        "message",
        "errorMessage",
        "successMessage",
        "statusMessage",
        "formMessage"

    );

}


// ==========================================================
// SHOW MESSAGE
// ==========================================================

function showMessage(
    message,
    type = "info"
) {

    const element =
        getMessageElement();

    if (!element) {

        if (type === "error") {

            console.error(
                "[AI SELLER TOOLKIT]",
                message
            );

        } else {

            console.log(
                "[AI SELLER TOOLKIT]",
                message
            );

        }

        return;

    }

    element.textContent =
        message;

    element.style.display =
        "block";

    element.className =
        `message ${type}`;

}


// ==========================================================
// CLEAR MESSAGE
// ==========================================================

function clearMessage() {

    const element =
        getMessageElement();

    if (!element) {
        return;
    }

    element.textContent =
        "";

    element.style.display =
        "none";

}


// ==========================================================
// GENERATING BUTTON STATE
// ==========================================================

function setGeneratingState(
    generating
) {

    isGenerating =
        generating;

    const buttons = [

        getElement(
            "generateListingBtn"
        ),

        getElement(
            "generateCompleteListing"
        ),

        getElement(
            "generateBtn"
        ),

        getElement(
            "generateButton"
        )

    ].filter(Boolean);

    buttons.forEach(
        button => {

            button.disabled =
                generating;

            if (generating) {

                if (
                    !button.dataset.originalText
                ) {

                    button.dataset.originalText =
                        button.textContent;

                }

                button.textContent =
                    "Generating...";

            } else {

                button.textContent =
                    button.dataset.originalText ||
                    "Generate Complete Listing";

            }

        }
    );

}


// ==========================================================
// API REQUEST
// ==========================================================

async function generateListingFromServer(
    payload
) {

    console.log(
        "[LISTING REQUEST]",
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
                    JSON.stringify(
                        payload
                    )

            }
        );

    let data = null;

    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            `Server returned invalid JSON response (${response.status}).`
        );

    }

    console.log(
        "[LISTING RESPONSE]",
        data
    );

    if (!response.ok) {

        throw new Error(

            data &&
            data.error

                ? data.error

                : `Server error: ${response.status}`

        );

    }

    if (
        !data ||
        data.success !== true
    ) {

        throw new Error(

            data &&
            data.error

                ? data.error

                : "Listing generation failed."

        );

    }

    return data;

}


// ==========================================================
// NORMALIZE ARRAY
// ==========================================================

function normalizeArray(value) {

    if (Array.isArray(value)) {

        return value
            .map(
                item =>
                    String(item)
                        .trim()
            )
            .filter(Boolean);

    }

    if (typeof value === "string") {

        return value
            .split(/\n/)
            .map(
                item =>
                    item
                        .replace(
                            /^[-•*]\s*/,
                            ""
                        )
                        .trim()
            )
            .filter(Boolean);

    }

    return [];

}


// ==========================================================
// EXTRACT LISTING
// ==========================================================

function extractListing(data) {

    console.log(
        "[EXTRACT LISTING INPUT]",
        data
    );

    /*
     * Backend may return:
     *
     * {
     *   success: true,
     *   listing: {...}
     * }
     *
     * OR
     *
     * {
     *   success: true,
     *   title: "...",
     *   description: "..."
     * }
     */

    let source =
        data &&
        data.listing;

    if (
        !source ||
        typeof source !== "object"
    ) {

        source =
            data;

    }

    // Handle nested response if backend uses result
    if (
        source &&
        source.result &&
        typeof source.result === "object"
    ) {

        source =
            source.result;

    }

    const listing = {

        title:
            source.title ||
            source.TITLE ||
            source.productTitle ||
            "",

        description:
            source.description ||
            source.DESCRIPTION ||
            source.productDescription ||
            "",

        highlights:
            normalizeArray(
                source.highlights ||
                source.HIGHLIGHTS ||
                source.bullets
            ),

        keywords:
            normalizeArray(
                source.keywords ||
                source.KEYWORDS ||
                source.seoKeywords
            ),

        hashtags:
            normalizeArray(
                source.hashtags ||
                source.HASHTAGS ||
                source.tags
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

    console.log(
        "[EXTRACTED LISTING]",
        listing
    );

    return listing;

}


// ==========================================================
// CREATE RESULT CONTAINER IF MISSING
// ==========================================================

function ensureResultContainer() {

    const existing =
        getElement(

            "resultContainer",
            "results",
            "listingResult",
            "generatedListing",
            "outputSection",
            "listingOutput"

        );

    if (existing) {

        existing.style.display =
            "block";

        return existing;

    }

    /*
     * If HTML has no result container,
     * create one automatically.
     */

    const container =
        document.createElement("section");

    container.id =
        "aiSellerAutoResult";

    container.className =
        "ai-seller-result-container";

    container.style.display =
        "block";

    container.style.marginTop =
        "25px";

    container.style.padding =
        "20px";

    container.style.borderRadius =
        "12px";

    container.style.border =
        "1px solid #ddd";

    container.style.background =
        "#ffffff";

    const button =
        getElement(

            "generateListingBtn",
            "generateCompleteListing",
            "generateBtn",
            "generateButton"

        );

    if (
        button &&
        button.parentElement
    ) {

        button.parentElement.appendChild(
            container
        );

    } else {

        document.body.appendChild(
            container
        );

    }

    return container;

}


// ==========================================================
// FIND OR CREATE OUTPUT FIELD
// ==========================================================

function findOrCreateOutput(
    id,
    label,
    container
) {

    let element =
        document.getElementById(id);

    if (element) {
        return element;
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "ai-seller-output-field";

    wrapper.style.marginBottom =
        "18px";

    const title =
        document.createElement("h3");

    title.textContent =
        label;

    title.style.marginBottom =
        "8px";

    const textarea =
        document.createElement("textarea");

    textarea.id =
        id;

    textarea.readOnly =
        true;

    textarea.rows =
        label === "DESCRIPTION"
            ? 7
            : 3;

    textarea.style.width =
        "100%";

    textarea.style.boxSizing =
        "border-box";

    textarea.style.padding =
        "12px";

    textarea.style.borderRadius =
        "8px";

    textarea.style.border =
        "1px solid #ccc";

    textarea.style.resize =
        "vertical";

    wrapper.appendChild(
        title
    );

    wrapper.appendChild(
        textarea
    );

    container.appendChild(
        wrapper
    );

    return textarea;

}


// ==========================================================
// FIND OR CREATE ARRAY OUTPUT
// ==========================================================

function findOrCreateArrayOutput(
    id,
    label,
    values,
    container
) {

    let element =
        document.getElementById(id);

    if (!element) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "ai-seller-output-field";

        wrapper.style.marginBottom =
            "18px";

        const title =
            document.createElement("h3");

        title.textContent =
            label;

        title.style.marginBottom =
            "8px";

        element =
            document.createElement("textarea");

        element.id =
            id;

        element.readOnly =
            true;

        element.rows =
            Math.max(
                3,
                Math.min(
                    values.length || 3,
                    8
                )
            );

        element.style.width =
            "100%";

        element.style.boxSizing =
            "border-box";

        element.style.padding =
            "12px";

        element.style.borderRadius =
            "8px";

        element.style.border =
            "1px solid #ccc";

        element.style.resize =
            "vertical";

        wrapper.appendChild(
            title
        );

        wrapper.appendChild(
            element
        );

        container.appendChild(
            wrapper
        );

    }

    if (
        "value" in element
    ) {

        element.value =
            values.join("\n");

    } else {

        element.textContent =
            values.join("\n");

    }

    return element;

}


// ==========================================================
// DISPLAY LISTING
// ==========================================================

function displayListing(
    listing
) {

    console.log(
        "[DISPLAY LISTING]",
        listing
    );

    const container =
        ensureResultContainer();

    if (!container) {

        throw new Error(
            "Unable to create listing result area."
        );

    }

    /*
     * Use existing HTML fields first.
     * If missing, automatically create them.
     */

    setExistingOrCreateText(
        "titleResult",
        "TITLE",
        listing.title,
        container
    );

    setExistingOrCreateText(
        "descriptionResult",
        "DESCRIPTION",
        listing.description,
        container
    );

    setExistingOrCreateArray(
        "highlightsResult",
        "HIGHLIGHTS",
        listing.highlights,
        container
    );

    setExistingOrCreateArray(
        "keywordsResult",
        "KEYWORDS",
        listing.keywords,
        container
    );

    setExistingOrCreateArray(
        "hashtagsResult",
        "HASHTAGS",
        listing.hashtags,
        container
    );

    setExistingOrCreateText(
        "seoTitleResult",
        "SEO TITLE",
        listing.seoTitle,
        container
    );

    setExistingOrCreateText(
        "seoDescriptionResult",
        "SEO DESCRIPTION",
        listing.seoDescription,
        container
    );

    /*
     * Scroll result into view so user can immediately
     * see generated listing.
     */

    setTimeout(
        () => {

            container.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        100
    );

}


// ==========================================================
// SET EXISTING OR CREATE TEXT
// ==========================================================

function setExistingOrCreateText(
    primaryId,
    label,
    value,
    container
) {

    const alternateIds = {

        titleResult: [
            "generatedTitle",
            "listingTitle",
            "resultTitle"
        ],

        descriptionResult: [
            "generatedDescription",
            "listingDescription",
            "resultDescription"
        ],

        seoTitleResult: [
            "generatedSeoTitle",
            "seoTitle",
            "resultSeoTitle"
        ],

        seoDescriptionResult: [
            "generatedSeoDescription",
            "seoDescription",
            "resultSeoDescription"
        ]

    };

    const ids = [
        primaryId,
        ...(alternateIds[primaryId] || [])
    ];

    let element = null;

    for (
        const id
        of ids
    ) {

        element =
            document.getElementById(id);

        if (element) {
            break;
        }

    }

    if (!element) {

        element =
            findOrCreateOutput(
                primaryId,
                label,
                container
            );

    }

    if (
        "value" in element
    ) {

        element.value =
            value || "";

    } else {

        element.textContent =
            value || "";

    }

    element.style.display =
        "block";

}


// ==========================================================
// SET EXISTING OR CREATE ARRAY
// ==========================================================

function setExistingOrCreateArray(
    primaryId,
    label,
    values,
    container
) {

    const alternateIds = {

        highlightsResult: [
            "generatedHighlights",
            "listingHighlights",
            "resultHighlights"
        ],

        keywordsResult: [
            "generatedKeywords",
            "listingKeywords",
            "resultKeywords"
        ],

        hashtagsResult: [
            "generatedHashtags",
            "listingHashtags",
            "resultHashtags"
        ]

    };

    const ids = [
        primaryId,
        ...(alternateIds[primaryId] || [])
    ];

    let element = null;

    for (
        const id
        of ids
    ) {

        element =
            document.getElementById(id);

        if (element) {
            break;
        }

    }

    if (!element) {

        element =
            findOrCreateArrayOutput(
                primaryId,
                label,
                values,
                container
            );

    } else {

        if (
            element.tagName ===
            "TEXTAREA"
        ) {

            element.value =
                values.join("\n");

        } else if (
            element.tagName ===
            "INPUT"
        ) {

            element.value =
                values.join(", ");

        } else {

            element.innerHTML =
                "";

            values.forEach(
                value => {

                    const li =
                        document.createElement("li");

                    li.textContent =
                        value;

                    element.appendChild(
                        li
                    );

                }
            );

        }

    }

    element.style.display =
        "block";

}


// ==========================================================
// GET DISPLAYED VALUE
// ==========================================================

function getDisplayedValue(ids) {

    for (
        const id
        of ids
    ) {

        const element =
            document.getElementById(id);

        if (!element) {
            continue;
        }

        if (
            "value" in element &&
            String(element.value).trim()
        ) {

            return String(
                element.value
            ).trim();

        }

        if (
            element.textContent &&
            element.textContent.trim()
        ) {

            return element.textContent.trim();

        }

    }

    return "";

}


// ==========================================================
// GET COMPLETE LISTING TEXT
// ==========================================================

function getListingText() {

    const title =
        getDisplayedValue([
            "titleResult",
            "generatedTitle",
            "listingTitle",
            "resultTitle"
        ]);

    const description =
        getDisplayedValue([
            "descriptionResult",
            "generatedDescription",
            "listingDescription",
            "resultDescription"
        ]);

    const highlights =
        getDisplayedValue([
            "highlightsResult",
            "generatedHighlights",
            "listingHighlights",
            "resultHighlights"
        ]);

    const keywords =
        getDisplayedValue([
            "keywordsResult",
            "generatedKeywords",
            "listingKeywords",
            "resultKeywords"
        ]);

    const hashtags =
        getDisplayedValue([
            "hashtagsResult",
            "generatedHashtags",
            "listingHashtags",
            "resultHashtags"
        ]);

    const seoTitle =
        getDisplayedValue([
            "seoTitleResult",
            "generatedSeoTitle",
            "seoTitle",
