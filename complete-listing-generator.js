// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE-LISTING-GENERATOR.JS — FINAL VERSION 7.2
// ==========================================================
// Stable Frontend
// Backend 7.x Compatible
// Category Aware
// Strict Response Handling
// No Fake Success
// No Duplicate Click
// Works with onclick HTML
// Handles multiple Gemini response formats
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
let categoryData = [];
let currentCategory = "";


// ==========================================================
// DOM HELPERS
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


function setElementText(
    element,
    value
) {

    if (!element) return;

    const text =
        value == null
            ? ""
            : String(value);

    if ("value" in element) {
        element.value = text;
    } else {
        element.textContent = text;
    }

}


// ==========================================================
// MESSAGE SYSTEM
// ==========================================================

function getMessageElement() {

    return getElement(
        "message",
        "statusMessage",
        "formMessage",
        "errorMessage",
        "successMessage"
    );

}


function showMessage(
    message,
    type = "info"
) {

    const element =
        getMessageElement();

    console.log(
        `[AI SELLER TOOLKIT ${type.toUpperCase()}]`,
        message
    );

    if (!element) {
        return;
    }

    element.textContent =
        String(message);

    element.style.display =
        "block";

    element.className =
        "message " + type;

}


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
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(category) {

    if (!category) {
        return "";
    }

    let value =
        String(category)
            .trim();

    // Remove emoji from beginning
    value =
        value.replace(
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

        "home":
            "Home & Kitchen",

        "kitchen":
            "Home & Kitchen",

        "home kitchen":
            "Home & Kitchen",

        "home & kitchen":
            "Home & Kitchen",

        "home and kitchen":
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

    return (
        aliases[lower] ||
        value
    );

}


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
// CATEGORY SELECT
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
// DYNAMIC CATEGORY CONTAINER
// ==========================================================

function getCategoryContainer() {

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
        getCategoryContainer();

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
                "field-" + name;

            const input =
                document.createElement("input");

            input.type =
                "text";

            input.id =
                "field-" + name;

            input.name =
                name;

            input.placeholder =
                "Enter " +
                label +
                " if known";

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

        const data =
            await response.json();

        if (
            !response.ok ||
            !data ||
            !Array.isArray(
                data.categories
            )
        ) {
            throw new Error(
                "Invalid categories response"
            );
        }

        categoryData =
            data.categories;

        populateCategorySelect(
            select,
            categoryData
        );

    } catch (error) {

        console.warn(
            "[CATEGORY API FALLBACK]",
            error
        );

        populateCategorySelect(
            select,
            SUPPORTED_CATEGORIES.map(
                name => ({
                    name
                })
            )
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

    const previous =
        normalizeCategory(
            select.value
        );

    select.innerHTML = "";

    const placeholder =
        document.createElement("option");

    placeholder.value = "";

    placeholder.textContent =
        "Select Product Category";

    select.appendChild(
        placeholder
    );

    categories.forEach(
        item => {

            const name =
                typeof item === "string"
                    ? item
                    : item &&
                      item.name;

            if (!name) {
                return;
            }

            const normalized =
                normalizeCategory(
                    name
                );

            if (
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

    if (previous) {

        const option =
            Array.from(
                select.options
            ).find(
                item =>
                    normalizeCategory(
                        item.value
                    ) === previous
            );

        if (option) {
            select.value =
                option.value;
        }

    }

    handleCategoryChange();

}


// ==========================================================
// COLLECT CATEGORY FIELDS
// ==========================================================

function collectCategoryFields(
    category
) {

    const result = {};

    const definitions =
        CATEGORY_FIELDS[
            category
        ] || [];

    definitions.forEach(
        ([name]) => {

            const input =
                getElement(
                    "field-" + name,
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
                result[name] =
                    value;
            }

        }
    );

    return result;

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

    const categoryFields =
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

        ...categoryFields

    };

}


// ==========================================================
// VALIDATION
// ==========================================================

function validateProductData(
    product
) {

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
// BUILD PAYLOAD
// ==========================================================

function buildPayload(
    product
) {

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

    const fields = [

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

    fields.forEach(
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
// BUTTON STATE
// ==========================================================

function setGeneratingState(
    state
) {

    isGenerating =
        Boolean(state);

    const ids = [

        "generateListingBtn",
        "generateCompleteListing",
        "generateBtn",
        "generateButton"

    ];

    ids.forEach(
        id => {

            const button =
                document.getElementById(id);

            if (!button) {
                return;
            }

            button.disabled =
                isGenerating;

            if (
                isGenerating
            ) {

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
// SERVER REQUEST
// ==========================================================

async function generateListingFromServer(
    payload
) {

    console.log(
        "[GENERATE REQUEST]",
        payload
    );

    let response;

    try {

        response =
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

    } catch (networkError) {

        throw new Error(
            "Cannot connect to the AI Seller Toolkit server. Please try again."
        );

    }

    const rawText =
        await response.text();

    console.log(
        "[SERVER STATUS]",
        response.status
    );

    console.log(
        "[SERVER RAW RESPONSE]",
        rawText
    );

    let data = null;

    try {

        data =
            JSON.parse(
                rawText
            );

    } catch (parseError) {

        throw new Error(
            "Server returned an invalid response."
        );

    }

    console.log(
        "[SERVER JSON]",
        data
    );

    if (!response.ok) {

        throw new Error(
            data &&
            data.error
                ? data.error
                : "Server error " +
                  response.status
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
// TEXT CLEANER
// ==========================================================

function cleanText(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    if (
        typeof value === "string"
    ) {
        return value.trim();
    }

    return String(value).trim();

}


// ==========================================================
// ARRAY NORMALIZER
// ==========================================================

function normalizeArray(value) {

    if (
        Array.isArray(value)
    ) {

        return value
            .map(
                item =>
                    cleanText(item)
            )
            .filter(Boolean);

    }

    if (
        typeof value === "string"
    ) {

        return value
            .split(/\r?\n|,/)
            .map(
                item =>
                    item
                        .replace(
                            /^\s*[-•*]\s*/,
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

    // ------------------------------------------------------
    // Possible listing locations
    // ------------------------------------------------------

    let source = data;

    if (
        data &&
        data.listing &&
        typeof data.listing === "object"
    ) {

        source =
            data.listing;

    } else if (
        data &&
        data.result &&
        typeof data.result === "object"
    ) {

        source =
            data.result;

    } else if (
        data &&
        data.data &&
        typeof data.data === "object"
    ) {

        source =
            data.data;

    }

    // ------------------------------------------------------
    // Helper for multiple key names
    // ------------------------------------------------------

    function pick(...keys) {

        for (
            const key
            of keys
        ) {

            if (
                source &&
                source[key] !== undefined &&
                source[key] !== null &&
                String(
                    source[key]
                ).trim()
            ) {

                return source[key];

            }

            if (
                data &&
                data[key] !== undefined &&
                data[key] !== null &&
                String(
                    data[key]
                ).trim()
            ) {

                return data[key];

            }

        }

        return "";

    }

    const listing = {

        title:
            cleanText(
                pick(
                    "title",
                    "TITLE",
                    "productTitle",
                    "PRODUCT TITLE"
                )
            ),

        description:
            cleanText(
                pick(
                    "description",
                    "DESCRIPTION",
                    "productDescription",
                    "PRODUCT DESCRIPTION"
                )
            ),

        highlights:
            normalizeArray(
                pick(
                    "highlights",
                    "HIGHLIGHTS",
                    "keyFeatures",
                    "features"
                )
            ),

        keywords:
            normalizeArray(
                pick(
                    "keywords",
                    "KEYWORDS",
                    "seoKeywords",
                    "SEO KEYWORDS"
                )
            ),

        hashtags:
            normalizeArray(
                pick(
                    "hashtags",
                    "HASHTAGS"
                )
            ),

        seoTitle:
            cleanText(
                pick(
                    "seoTitle",
                    "SEO TITLE",
                    "seo_title"
                )
            ),

        seoDescription:
            cleanText(
                pick(
                    "seoDescription",
                    "SEO DESCRIPTION",
                    "seo_description"
                )
            )

    };

    // ------------------------------------------------------
    // If server returns JSON as string
    // ------------------------------------------------------

    if (
        !listing.title &&
        typeof source === "string"
    ) {

        try {

            const parsed =
                JSON.parse(
                    source
                );

            return extractListing(
                {
                    ...data,
                    listing:
                        parsed
                }
            );

        } catch (error) {

            // Not JSON.
            // Try plain text parser below.

        }

    }

    // ------------------------------------------------------
    // Plain text fallback
    // ------------------------------------------------------

    if (
        !listing.title
    ) {

        const possibleText =
            pick(
                "text",
                "output",
                "content",
                "response",
                "generatedText"
            );

        if (
            possibleText &&
            typeof possibleText === "string"
        ) {

            const parsed =
                parseListingText(
                    possibleText
                );

            if (parsed.title) {
                return parsed;
            }

        }

    }

    console.log(
        "[EXTRACTED LISTING]",
        listing
    );

    return listing;

}


// ==========================================================
// PARSE PLAIN TEXT LISTING
// ==========================================================

function parseListingText(
    text
) {

    const result = {

        title: "",
        description: "",
        highlights: [],
        keywords: [],
        hashtags: [],
        seoTitle: "",
        seoDescription: ""

    };

    if (!text) {
        return result;
    }

    const lines =
        String(text)
            .split(/\r?\n/);

    let section = "";

    lines.forEach(
        rawLine => {

            const line =
                rawLine.trim();

            if (!line) {
                return;
            }

            const upper =
                line
                    .replace(
                        /[*#:_-]/g,
                        " "
                    )
                    .trim()
                    .toUpperCase();

            if (
                upper === "TITLE"
            ) {

                section =
                    "title";

                return;

            }

            if (
                upper === "DESCRIPTION"
            ) {

                section =
                    "description";

                return;

            }

            if (
                upper === "HIGHLIGHTS"
            ) {

                section =
                    "highlights";

                return;

            }

            if (
                upper === "KEYWORDS"
            ) {

                section =
                    "keywords";

                return;

            }

            if (
                upper === "HASHTAGS"
            ) {

                section =
                    "hashtags";

                return;

            }

            if (
                upper === "SEO TITLE"
            ) {

                section =
                    "seoTitle";

                return;

            }

            if (
                upper === "SEO DESCRIPTION"
            ) {

                section =
                    "seoDescription";

                return;

            }

            const cleaned =
                line.replace(
                    /^\s*[-•*]\s*/,
                    ""
                );

            if (
                section === "title"
            ) {

                if (!result.title) {
                    result.title =
                        cleaned;
                }

            } else if (
                section === "description"
            ) {

                result.description +=
                    (
                        result.description
                            ? " "
                            : ""
                    ) +
                    cleaned;

            } else if (
                section === "highlights"
            ) {

                result.highlights.push(
                    cleaned
                );

            } else if (
                section === "keywords"
            ) {

                result.keywords.push(
                    cleaned
                );

            } else if (
                section === "hashtags"
            ) {

                result.hashtags.push(
                    cleaned
                );

            } else if (
                section === "seoTitle"
            ) {

                result.seoTitle +=
                    (
                        result.seoTitle
                            ? " "
                            : ""
                    ) +
                    cleaned;

            } else if (
                section === "seoDescription"
            ) {

                result.seoDescription +=
                    (
                        result.seoDescription
                            ? " "
                            : ""
                    ) +
                    cleaned;

            }

        }
    );

    return result;

}


// ==========================================================
// FIND OUTPUT ELEMENT
// ==========================================================

function findOutputElement(
    ids
) {

    for (
        const id
        of ids
    ) {

        const element =
            document.getElementById(id);

        if (element) {
            return element;
        }

    }

    return null;

}


// ==========================================================
// DISPLAY VALUE
// ==========================================================

function displayValue(
    value,
    ids
) {

    const element =
        findOutputElement(
            ids
        );

    if (!element) {
        return false;
    }

    setElementText(
        element,
        value || ""
    );

    element.style.display =
        "block";

    return true;

}


// ==========================================================
// DISPLAY ARRAY
// ==========================================================

function displayArray(
    values,
    ids
) {

    const element =
        findOutputElement(
            ids
        );

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

        element.innerHTML =
            "";

        array.forEach(
            item => {

                const li =
                    document.createElement(
                        "li"
                    );

                li.textContent =
                    item;

                element.appendChild(
                    li
                );

            }
        );

    }

    element.style.display =
        "block";

    return true;

}


// ==========================================================
// DISPLAY COMPLETE LISTING
// ==========================================================

function displayListing(
    listing
) {

    console.log(
        "[DISPLAY LISTING]",
        listing
    );

    displayValue(
        listing.title,
        [
            "titleResult",
            "generatedTitle",
            "listingTitle",
            "resultTitle"
        ]
    );

    displayValue(
        listing.description,
        [
            "descriptionResult",
            "generatedDescription",
            "listingDescription",
            "resultDescription"
        ]
    );

    displayArray(
        listing.highlights,
        [
            "highlightsResult",
            "generatedHighlights",
            "listingHighlights",
            "resultHighlights"
        ]
    );

    displayArray(
        listing.keywords,
        [
            "keywordsResult",
            "generatedKeywords",
            "listingKeywords",
            "resultKeywords"
        ]
    );

    displayArray(
        listing.hashtags,
        [
            "hashtagsResult",
            "generatedHashtags",
            "listingHashtags",
            "resultHashtags"
        ]
    );

    displayValue(
        listing.seoTitle,
        [
            "seoTitleResult",
            "generatedSeoTitle",
            "seoTitle",
            "resultSeoTitle"
        ]
    );

    displayValue(
        listing.seoDescription,
        [
            "seoDescriptionResult",
            "generatedSeoDescription",
            "seoDescription",
            "resultSeoDescription"
        ]
    );

    showResultContainer();

}


// ==========================================================
// SHOW RESULT CONTAINER
// ==========================================================

function showResultContainer() {

    const ids = [

        "resultContainer",
        "results",
        "listingResult",
        "generatedListing",
        "outputSection",
        "listingOutput"

    ];

    ids.forEach(
        id => {

            const element =
                document.getElementById(id);

            if (element) {

                element.style.display =
                    "block";

            }

        }
    );

}


// ==========================================================
// GET DISPLAYED VALUE
// ==========================================================

function getDisplayedValue(
    ids
) {

    const element =
        findOutputElement(
            ids
        );

    if (!element) {
        return "";
    }

    if (
        "value" in element
    ) {

        return String(
            element.value || ""
        ).trim();

    }

    return String(
        element.textContent || ""
    ).trim();

}


// ==========================================================
// GET COMPLETE LISTING TEXT
// ==========================================================

function getListingText() {

    const title =
        getDisplayedValue(
            [
                "titleResult",
                "generatedTitle",
                "listingTitle",
                "resultTitle"
            ]
        );

    const description =
        getDisplayedValue(
            [
                "descriptionResult",
                "generatedDescription",
                "listingDescription",
                "resultDescription"
            ]
        );

    const highlights =
        getDisplayedValue(
            [
                "highlightsResult",
                "generatedHighlights",
                "listingHighlights",
                "resultHighlights"
            ]
        );

    const keywords =
        getDisplayedValue(
            [
                "keywordsResult",
                "generatedKeywords",
                "listingKeywords",
                "resultKeywords"
            ]
        );

    const hashtags =
        getDisplayedValue(
            [
                "hashtagsResult",
                "generatedHashtags",
                "listingHashtags",
                "resultHashtags"
            ]
        );

    const seoTitle =
        getDisplayedValue(
            [
                "seoTitleResult",
                "generatedSeoTitle",
                "seoTitle",
                "resultSeoTitle"
            ]
        );

    const seoDescription =
        getDisplayedValue(
            [
                "seoDescriptionResult",
                "generatedSeoDescription",
                "seoDescription",
                "resultSeoDescription"
            ]
        );

    return [

        title
            ? "TITLE\n" + title
            : "",

        description
            ? "DESCRIPTION\n" +
              description
            : "",

        highlights
            ? "HIGHLIGHTS\n" +
              highlights
            : "",

        keywords
            ? "KEYWORDS\n" +
              keywords
            : "",

        hashtags
            ? "HASHTAGS\n" +
              hashtags
            : "",

        seoTitle
            ? "SEO TITLE\n" +
              seoTitle
            : "",

        seoDescription
            ? "SEO DESCRIPTION\n" +
              seoDescription
            : ""

    ]
        .filter(Boolean)
        .join("\n\n");

}


// ==========================================================
// COPY LISTING
// ==========================================================

async function copyCompleteListing() {

    const text =
        getListingText();

    if (!text) {

        showMessage(
            "There is no generated listing to copy.",
            "error"
        );

        return;
    }

    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                text
            );

        } else {

            throw new Error(
                "Clipboard API unavailable"
            );

        }

        showMessage(
            "Listing copied successfully.",
            "success"
        );

    } catch (error) {

        const textarea =
            document.createElement(
                "textarea"
            );

        textarea.value =
            text;

        textarea.style.position =
            "fixed";

        textarea.style.opacity =
            "0";

        document.body.appendChild(
            textarea
        );

        textarea.focus();

        textarea.select();

        try {

            document.execCommand(
                "copy"
            );

            showMessage(
                "Listing copied successfully.",
                "success"
            );

        } catch (copyError) {

            showMessage(
                "
