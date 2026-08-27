// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE-LISTING-GENERATOR.JS — FINAL VERSION 7.2
// ==========================================================
// FINAL FIX
// - Backend 7.1 compatible
// - Gemini response compatibility
// - Multiple response formats supported
// - JSON string response supported
// - Result display fixed
// - No false success message
// - 14 categories supported
// - Dynamic category fields
// - Strict frontend validation
// - Duplicate event protection
// - Copy listing support
// - LocalStorage support
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
// SHOW ELEMENT
// ==========================================================

function showElement(...ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {

            element.style.display =
                "";

        }

    }

}


// ==========================================================
// HIDE ELEMENT
// ==========================================================

function hideElement(...ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {

            element.style.display =
                "none";

        }

    }

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
    type = "error"
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
        String(message);

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

    return (
        aliases[lower] ||
        value
    );

}


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
// FIND CATEGORY SELECT
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
// FIND DYNAMIC FIELD CONTAINER
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

    container.innerHTML =
        "";

    const fields =
        LOCAL_CATEGORY_FIELDS[
            category
        ] || [];

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

    for (
        const [name, label]
        of fields
    ) {

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
            !Array.isArray(
                data.categories
            )
        ) {
            throw new Error(
                "Invalid category response."
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

        populateCategorySelect(
            categoryElement,
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

    const oldValue =
        normalizeCategory(
            select.value
        );

    const placeholder =
        select.querySelector(
            "option[value='']"
        );

    select.innerHTML =
        "";

    if (placeholder) {

        select.appendChild(
            placeholder.cloneNode(true)
        );

    } else {

        const option =
            document.createElement("option");

        option.value =
            "";

        option.textContent =
            "Select Product Category";

        select.appendChild(
            option
        );

    }

    const added =
        new Set();

    for (
        const item
        of categories
    ) {

        if (!item || !item.name) {
            continue;
        }

        const normalized =
            normalizeCategory(
                item.name
            );

        if (
            !SUPPORTED_CATEGORIES.includes(
                normalized
            )
        ) {
            continue;
        }

        if (
            added.has(normalized)
        ) {
            continue;
        }

        added.add(normalized);

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

    // Make sure all 14 categories exist
    for (
        const category
        of SUPPORTED_CATEGORIES
    ) {

        if (
            added.has(category)
        ) {
            continue;
        }

        const option =
            document.createElement("option");

        option.value =
            category;

        option.textContent =
            category;

        select.appendChild(
            option
        );

    }

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

    for (
        const [name]
        of definitions
    ) {

        const input =
            getElement(
                `field-${name}`,
                name
            );

        if (!input) {
            continue;
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

    for (
        const name
        of possibleFields
    ) {

        if (fields[name]) {
            continue;
        }

        const input =
            getElement(name);

        if (!input) {
            continue;
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

    for (
        const field
        of fieldNames
    ) {

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

    return payload;

}


// ==========================================================
// GENERATE BUTTON STATE
// ==========================================================

function setGeneratingState(
    generating
) {

    isGenerating =
        generating;

    const buttons = [

        "generateListingBtn",
        "generateCompleteListing",
        "generateBtn",
        "generateButton"

    ];

    for (
        const id
        of buttons
    ) {

        const button =
            document.getElementById(id);

        if (!button) {
            continue;
        }

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

}


// ==========================================================
// API REQUEST
// ==========================================================

async function generateListingFromServer(
    payload
) {

    console.log(
        "[GENERATE REQUEST]",
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

    if (!rawText) {

        throw new Error(
            `Server returned an empty response (${response.status}).`
        );

    }

    let data;

    try {

        data =
            JSON.parse(
                rawText
            );

    } catch (error) {

        throw new Error(
            `Server returned invalid JSON (${response.status}).`
        );

    }

    if (!response.ok) {

        throw new Error(

            data &&
            (
                data.error ||
                data.message
            )

                ? (
                    data.error ||
                    data.message
                )

                : `Server error: ${response.status}`

        );

    }

    if (
        !data ||
        data.success !== true
    ) {

        throw new Error(

            data &&
            (
                data.error ||
                data.message
            )

                ? (
                    data.error ||
                    data.message
                )

                : "Listing generation failed."

        );

    }

    return data;

}


// ==========================================================
// SAFE JSON PARSER
// ==========================================================

function tryParseJSON(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    if (
        typeof value === "object"
    ) {
        return value;
    }

    if (
        typeof value !== "string"
    ) {
        return null;
    }

    const text =
        value.trim();

    if (!text) {
        return null;
    }

    try {

        return JSON.parse(
            text
        );

    } catch (error) {

        // Try removing markdown JSON fences
        const cleaned =
            text
                .replace(
                    /^```json\s*/i,
                    ""
                )
                .replace(
                    /^```\s*/i,
                    ""
                )
                .replace(
                    /\s*```$/i,
                    ""
                )
                .trim();

        try {

            return JSON.parse(
                cleaned
            );

        } catch (secondError) {

            return null;

        }

    }

}


// ==========================================================
// FIND LISTING OBJECT
// ==========================================================

function findListingObject(data) {

    if (!data) {
        return null;
    }

    // Direct listing object
    if (
        typeof data === "object" &&
        (
            data.title ||
            data.TITLE ||
            data.description ||
            data.DESCRIPTION
        )
    ) {

        return data;

    }

    // Common nested keys
    const possibleKeys = [

        "listing",
        "result",
        "data",
        "output",
        "generatedListing",
        "generated",
        "response"

    ];

    for (
        const key
        of possibleKeys
    ) {

        if (
            data[key] === undefined ||
            data[key] === null
        ) {
            continue;
        }

        const value =
            data[key];

        const parsed =
            tryParseJSON(
                value
            );

        if (
            parsed &&
            typeof parsed === "object"
        ) {

            const found =
                findListingObject(
                    parsed
                );

            if (found) {
                return found;
            }

        }

        if (
            typeof value === "object"
        ) {

            const found =
                findListingObject(
                    value
                );

            if (found) {
                return found;
            }

        }

    }

    return null;

}


// ==========================================================
// EXTRACT TEXT FROM POSSIBLE KEYS
// ==========================================================

function getFirstValue(
    source,
    keys
) {

    if (!source) {
        return "";
    }

    for (
        const key
        of keys
    ) {

        if (
            source[key] === undefined ||
            source[key] === null
        ) {
            continue;
        }

        const value =
            source[key];

        if (
            typeof value === "string" &&
            value.trim()
        ) {

            return value.trim();

        }

        if (
            typeof value === "number"
        ) {

            return String(value);

        }

    }

    return "";

}


// ==========================================================
// EXTRACT LISTING — FINAL FIX
// ==========================================================

function extractListing(data) {

    console.log(
        "[EXTRACT] Full server data:",
        data
    );

    let source =
        findListingObject(
            data
        );

    // If nested object was not found,
    // try direct data
    if (!source) {
        source =
            data;
    }

    // Sometimes server returns a JSON string
    const parsedSource =
        tryParseJSON(
            source
        );

    if (
        parsedSource &&
        typeof parsedSource === "object"
    ) {

        source =
            parsedSource;

    }

    console.log(
        "[EXTRACT] Listing source:",
        source
    );

    const listing = {

        title:
            getFirstValue(
                source,
                [
                    "title",
                    "TITLE",
                    "productTitle",
                    "PRODUCT TITLE",
                    "listingTitle",
                    "listing_title"
                ]
            ),

        description:
            getFirstValue(
                source,
                [
                    "description",
                    "DESCRIPTION",
                    "productDescription",
                    "PRODUCT DESCRIPTION",
                    "listingDescription",
                    "listing_description"
                ]
            ),

        highlights:
            normalizeArray(
                source.highlights ||
                source.HIGHLIGHTS ||
                source.bullets ||
                source.BULLETS ||
                source.keyFeatures ||
                source.key_features
            ),

        keywords:
            normalizeArray(
                source.keywords ||
                source.KEYWORDS ||
                source.seoKeywords ||
                source.seo_keywords
            ),

        hashtags:
            normalizeArray(
                source.hashtags ||
                source.HASHTAGS ||
                source.hashTags ||
                source.hash_tags
            ),

        seoTitle:
            getFirstValue(
                source,
                [
                    "seoTitle",
                    "SEO TITLE",
                    "seo_title",
                    "SEOTitle"
                ]
            ),

        seoDescription:
            getFirstValue(
                source,
                [
                    "seoDescription",
                    "SEO DESCRIPTION",
                    "seo_description",
                    "SEODescription"
                ]
            )

    };

    // ------------------------------------------------------
    // If listing is still empty, try text response
    // ------------------------------------------------------

    if (
        !listing.title &&
        typeof source === "string"
    ) {

        const text =
            source.trim();

        const parsed =
            parsePlainTextListing(
                text
            );

        if (parsed) {

            return parsed;

        }

    }

    console.log(
        "[EXTRACT] Final listing:",
        listing
    );

    return listing;

}


// ==========================================================
// PARSE PLAIN TEXT LISTING
// ==========================================================

function parsePlainTextListing(text) {

    if (!text) {
        return null;
    }

    const result = {

        title: "",
        description: "",
        highlights: [],
        keywords: [],
        hashtags: [],
        seoTitle: "",
        seoDescription: ""

    };

    const lines =
        text
            .split("\n")
            .map(
                line =>
                    line.trim()
            );

    let section =
        "";

    for (
        const line
        of lines
    ) {

        if (!line) {
            continue;
        }

        const upper =
            line
                .toUpperCase()
                .replace(
                    /[:\-]/g,
                    ""
                )
                .trim();

        if (
            upper === "TITLE"
        ) {

            section =
                "title";

            continue;

        }

        if (
            upper === "DESCRIPTION"
        ) {

            section =
                "description";

            continue;

        }

        if (
            upper === "HIGHLIGHTS" ||
            upper === "KEY HIGHLIGHTS"
        ) {

            section =
                "highlights";

            continue;

        }

        if (
            upper === "KEYWORDS" ||
            upper === "SEO KEYWORDS"
        ) {

            section =
                "keywords";

            continue;

        }

        if (
            upper === "HASHTAGS" ||
            upper === "HASH TAGS"
        ) {

            section =
                "hashtags";

            continue;

        }

        if (
            upper === "SEO TITLE"
        ) {

            section =
                "seoTitle";

            continue;

        }

        if (
            upper === "SEO DESCRIPTION"
        ) {

            section =
                "seoDescription";

            continue;

        }

        if (!section) {
            continue;
        }

        if (
            section === "title"
        ) {

            if (!result.title) {
                result.title =
                    line;
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
                line;

        } else if (
            section === "highlights"
        ) {

            result.highlights.push(
                line
                    .replace(
                        /^[-•*]\s*/,
                        ""
                    )
                    .trim()
            );

        } else if (
            section === "keywords"
        ) {

            result.keywords.push(
                line
                    .replace(
                        /^[-•*]\s*/,
                        ""
                    )
                    .trim()
            );

        } else if (
            section === "hashtags"
        ) {

            result.hashtags.push(
                line
                    .replace(
                        /^[-•*]\s*/,
                        ""
                    )
                    .trim()
            );

        } else if (
            section === "seoTitle"
        ) {

            if (!result.seoTitle) {
                result.seoTitle =
                    line;
            }

        } else if (
            section === "seoDescription"
        ) {

            result.seoDescription +=
                (
                    result.seoDescription
                        ? " "
                        : ""
                ) +
                line;

        }

    }

    if (
        result.title ||
        result.description ||
        result.highlights.length ||
        result.keywords.length ||
        result.hashtags.length
    ) {

        return result;

    }

    return null;

}


// ==========================================================
// ARRAY NORMALIZER
// ==========================================================

function normalizeArray(value) {

    if (Array.isArray(value)) {

        return value
            .map(
                item => {

                    if (
                        typeof item === "object"
                    ) {

                        return String(
                            item.text ||
                            item.value ||
                            item.name ||
                            ""
                        ).trim();

                    }

                    return String(
                        item
                    ).trim();

                }
            )
            .filter(Boolean);

    }

    if (
        typeof value === "string"
    ) {

        return value
            .split(
                /\n|,/
            )
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
// SET OUTPUT VALUE
// ==========================================================

function setOutputValue(
    value,
    ids
) {

    for (
        const id
        of ids
    ) {

        const element =
            document.getElementById(id);

        if (!element) {
            continue;
        }

        const finalValue =
            value || "";

        if (
            "value" in element
        ) {

            element.value =
                finalValue;

        } else {

            element.textContent =
                finalValue;

        }

        // Force visibility
        element.style.display =
            "";

        return true;

    }

    return false;

}


// ==========================================================
// SET OUTPUT ARRAY
// ==========================================================

function setOutputArray(
    values,
    ids
) {

    const array =
        Array.isArray(values)
            ? values
            : [];

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
            element.tagName ===
            "TEXTAREA"
        ) {

            element.value =
                array.join("\n");

        } else {

            element.innerHTML =
                "";

            for (
                const value
                of array
            ) {

                const item =
                    document.createElement(
                        "li"
                    );

                item.textContent =
                    value;

                element.appendChild(
                    item
                );

            }

        }

        element.style.display =
            "";

        return true;

    }

    return false;

}


// ==========================================================
// DISPLAY LISTING
// ==========================================================

function displayListing(listing) {

    console.log(
        "[DISPLAY LISTING]",
        listing
    );

    const titleShown =
        setOutputValue(
            listing.title,
            [
                "titleResult",
                "generatedTitle",
                "listingTitle",
                "resultTitle"
            ]
        );

    const descriptionShown =
        setOutputValue(
            listing.description,
            [
                "descriptionResult",
                "generatedDescription",
                "listingDescription",
                "resultDescription"
            ]
        );

    const highlightsShown =
        setOutputArray(
            listing.highlights,
            [
                "highlightsResult",
                "generatedHighlights",
                "listingHighlights",
                "resultHighlights"
            ]
        );

    const keywordsShown =
        setOutputArray(
            listing.keywords,
            [
                "keywordsResult",
                "generatedKeywords",
                "listingKeywords",
                "resultKeywords"
            ]
        );

    const hashtagsShown =
        setOutputArray(
            listing.hashtags,
            [
                "hashtagsResult",
                "generatedHashtags",
                "listingHashtags",
                "resultHashtags"
            ]
        );

    const seoTitleShown =
        setOutputValue(
            listing.seoTitle,
            [
                "seoTitleResult",
                "generatedSeoTitle",
                "seoTitle",
                "resultSeoTitle"
            ]
        );

    const seoDescriptionShown =
        setOutputValue(
            listing.seoDescription,
            [
                "seoDescriptionResult",
                "generatedSeoDescription",
                "seoDescription",
                "resultSeoDescription"
            ]
        );

    const anythingShown =
        titleShown ||
        descriptionShown ||
        highlightsShown ||
        keywordsShown ||
        hashtagsShown ||
        seoTitleShown ||
        seoDescriptionShown;

    if (!anythingShown) {

        throw new Error(
            "Listing was generated by the server, but the result fields were not found on this page. Please check the result element IDs in complete-listing-generator.html."
        );

    }

    showResultContainer();

    return true;

}


// ==========================================================
// SHOW RESULT CONTAINER
// ==========================================================

function showResultContainer() {

    const containers = [

        "resultContainer",
        "results",
        "listingResult",
        "generatedListing",
        "outputSection",
        "listingOutput",
        "resultSection",
        "resultsSection"

    ];

    let shown =
        false;

    for (
        const id
        of containers
    ) {

        const element =
            document.getElementById(id);

        if (!element) {
            continue;
        }

        element.style.display =
            "block";

        element.hidden =
            false;

        shown =
            true;

    }

    // Scroll to result if found
    if (shown) {

        setTimeout(() => {

            const firstResult =
                getElement(
                    "resultContainer",
                    "listingResult",
                    "generatedListing",
                    "outputSection",
                    "listingOutput",
                    "resultSection",
                    "resultsSection",
                    "results"
                );

            if (firstResult) {

                try {

                    firstResult.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                } catch (error) {

                    firstResult.scrollIntoView();

                }

            }

        }, 100);

    }

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
            "value" in element
        ) {

            const value =
                String(
                    element.value || ""
                ).trim();

            if (value) {
                return value;
            }

        } else {

            const value =
                String(
                    element.textContent || ""
                ).trim();

            if (value) {
                return value;
            }

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
            "
