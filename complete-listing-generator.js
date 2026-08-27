// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE-LISTING-GENERATOR.JS — FINAL VERSION 7.2
// ==========================================================
// Category-Aware
// Backend 7.1 Compatible
// Strict Fact Guard Compatible
// Response-Safe
// Multiple Response Format Support
// Dynamic Category Fields
// No Invented Facts
// Duplicate Event Protection
// LocalStorage Support
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


function setValue(value, ...ids) {

    const element =
        getElement(...ids);

    if (!element) {
        return;
    }

    if ("value" in element) {

        element.value =
            value || "";

    } else {

        element.textContent =
            value || "";

    }

}


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
// MESSAGE UI
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
        String(message || "");


    element.style.display =
        "block";


    element.className =
        `message ${type}`;


    if (type === "success") {

        clearTimeout(
            element._successTimer
        );


        element._successTimer =
            setTimeout(() => {

                if (
                    element.textContent ===
                    String(message || "")
                ) {

                    element.style.display =
                        "none";

                }

            }, 5000);

    }

}


function clearMessage() {

    const element =
        getMessageElement();

    if (!element) {
        return;
    }


    clearTimeout(
        element._successTimer
    );


    element.textContent =
        "";

    element.style.display =
        "none";

}


// ==========================================================
// CATEGORY NORMALIZER
// ==========================================================

function normalizeCategory(
    category
) {

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

function renderCategoryFields(
    category
) {

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
        document.createElement(
            "h3"
        );


    heading.textContent =
        `${category} Product Information`;


    container.appendChild(
        heading
    );


    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "category-fields-grid";


    for (
        const [name, label]
        of fields
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "category-field";


        const labelElement =
            document.createElement(
                "label"
            );


        labelElement.textContent =
            label;


        labelElement.htmlFor =
            `field-${name}`;


        const input =
            document.createElement(
                "input"
            );


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


        const localCategories =
            Object.keys(
                LOCAL_CATEGORY_FIELDS
            )
            .map(name => ({
                name,
                fields:
                    LOCAL_CATEGORY_FIELDS[
                        name
                    ].map(
                        ([, label]) =>
                            label
                    )
            }));


        populateCategorySelect(
            categoryElement,
            localCategories
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
            placeholder.cloneNode(
                true
            )
        );

    } else {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "Select Product Category";


        select.appendChild(
            option
        );

    }


    for (
        const item
        of categories
    ) {

        if (
            !item ||
            !item.name
        ) {
            continue;
        }


        const option =
            document.createElement(
                "option"
            );


        option.value =
            item.name;


        option.textContent =
            item.name;


        select.appendChild(
            option
        );

    }


    if (oldValue) {

        const matching =
            Array.from(
                select.options
            )
            .find(
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

function collectCategoryFields(
    category
) {

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

function collectKnownFields(
    category
) {

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

        if (
            fields[name]
        ) {
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
// VALIDATE PRODUCT DATA
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
        !LOCAL_CATEGORY_FIELDS[
            product.category
        ]
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
            product[field] !==
                undefined &&
            product[field] !==
                null &&
            String(
                product[field]
            ).trim()
        ) {

            payload[field] =
                String(
                    product[field]
                ).trim();

        }

    }


    return payload;

}


// ==========================================================
// BUTTON STATE
// ==========================================================

function setGeneratingState(
    generating
) {

    isGenerating =
        generating;


    const buttonIds = [

        "generateListingBtn",

        "generateCompleteListing",

        "generateBtn",

        "generateButton"

    ];


    for (
        const id
        of buttonIds
    ) {

        const button =
            document.getElementById(
                id
            );


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
// SAFE JSON PARSER
// ==========================================================

function tryParseJSON(
    value
) {

    if (
        typeof value !==
        "string"
    ) {

        return value;

    }


    let text =
        value.trim();


    if (!text) {
        return null;
    }


    // Remove markdown code fences
    text =
        text.replace(
            /^```(?:json)?/i,
            ""
        );


    text =
        text.replace(
            /```$/i,
            ""
        );


    text =
        text.trim();


    try {

        return JSON.parse(
            text
        );

    } catch (error) {

        return null;

    }

}


// ==========================================================
// API REQUEST
// ==========================================================

async function generateListingFromServer(
    payload
) {

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


    let data =
        tryParseJSON(
            rawText
        );


    if (
        data === null &&
        rawText.trim()
    ) {

        data = {
            success:
                response.ok,

            raw:
                rawText

        };

    }


    console.log(
        "[GENERATE API RESPONSE]",
        data
    );


    if (!response.ok) {

        let errorMessage =
            "Unable to generate listing.";


        if (
            data &&
            typeof data ===
                "object"
        ) {

            errorMessage =
                data.error ||
                data.message ||
                errorMessage;

        }


        throw new Error(
            errorMessage
        );

    }


    if (
        data &&
        data.success === false
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
// FIND LISTING OBJECT
// ==========================================================

function findListingObject(
    data
) {

    if (!data) {
        return {};
    }


    // Direct listing
    if (
        data.listing &&
        typeof data.listing ===
            "object"
    ) {

        return data.listing;

    }


    // result.listing
    if (
        data.result &&
        typeof data.result ===
            "object"
    ) {

        if (
            data.result.listing &&
            typeof data.result.listing ===
                "object"
        ) {

            return data.result.listing;

        }


        return data.result;

    }


    // output.listing
    if (
        data.output &&
        typeof data.output ===
            "object"
    ) {

        if (
            data.output.listing &&
            typeof data.output.listing ===
                "object"
        ) {

            return data.output.listing;

        }


        return data.output;

    }


    // response.listing
    if (
        data.response &&
        typeof data.response ===
            "object"
    ) {

        if (
            data.response.listing &&
            typeof data.response.listing ===
                "object"
        ) {

            return data.response.listing;

        }


        return data.response;

    }


    // Direct response
    if (
        typeof data ===
            "object"
    ) {

        return data;

    }


    return {};

}


// ==========================================================
// EXTRACT TEXT FROM POSSIBLE GEMINI RESPONSE
// ==========================================================

function extractPossibleText(
    data
) {

    if (!data) {
        return "";
    }


    const candidates = [

        data.text,

        data.outputText,

        data.generatedText,

        data.content,

        data.responseText,

        data.resultText

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            typeof candidate ===
                "string" &&
            candidate.trim()
        ) {

            return candidate.trim();

        }

    }


    return "";

}


// ==========================================================
// PARSE TEXT LISTING
// ==========================================================

function parseTextListing(
    text
) {

    if (
        !text ||
        typeof text !==
            "string"
    ) {

        return {};

    }


    let clean =
        text.trim();


    clean =
        clean.replace(
            /^```(?:json)?/i,
            ""
        );


    clean =
        clean.replace(
            /```$/i,
            ""
        );


    clean =
        clean.trim();


    const parsed =
        tryParseJSON(
            clean
        );


    if (
        parsed &&
        typeof parsed ===
            "object"
    ) {

        return findListingObject(
            parsed
        );

    }


    const result = {};


    const titleMatch =
        clean.match(
            /(?:^|\n)\s*(?:TITLE|Title)\s*[:\-]?\s*(.+)/i
        );


    const descriptionMatch =
        clean.match(
            /(?:^|\n)\s*(?:DESCRIPTION|Description)\s*[:\-]?\s*([\s\S]*?)(?=\n\s*(?:HIGHLIGHTS|Highlights|KEYWORDS|Keywords|HASHTAGS|Hashtags|SEO TITLE|SEO Title|SEO DESCRIPTION|SEO Description)\b|$)/i
        );


    const highlightsMatch =
        clean.match(
            /(?:^|\n)\s*(?:HIGHLIGHTS|Highlights)\s*[:\-]?\s*([\s\S]*?)(?=\n\s*(?:KEYWORDS|Keywords|HASHTAGS|Hashtags|SEO TITLE|SEO Title|SEO DESCRIPTION|SEO Description)\b|$)/i
        );


    const keywordsMatch =
        clean.match(
            /(?:^|\n)\s*(?:KEYWORDS|Keywords)\s*[:\-]?\s*([\s\S]*?)(?=\n\s*(?:HASHTAGS|Hashtags|SEO TITLE|SEO Title|SEO DESCRIPTION|SEO Description)\b|$)/i
        );


    const hashtagsMatch =
        clean.match(
            /(?:^|\n)\s*(?:HASHTAGS|Hashtags)\s*[:\-]?\s*([\s\S]*?)(?=\n\s*(?:SEO TITLE|SEO Title|SEO DESCRIPTION|SEO Description)\b|$)/i
        );


    const seoTitleMatch =
        clean.match(
            /(?:^|\n)\s*(?:SEO TITLE|SEO Title)\s*[:\-]?\s*([\s\S]*?)(?=\n\s*(?:SEO DESCRIPTION|SEO Description)\b|$)/i
        );


    const seoDescriptionMatch =
        clean.match(
            /(?:^|\n)\s*(?:SEO DESCRIPTION|SEO Description)\s*[:\-]?\s*([\s\S]*?)$/i
        );


    if (titleMatch) {

        result.title =
            titleMatch[1].trim();

    }


    if (descriptionMatch) {

        result.description =
            descriptionMatch[1].trim();

    }


    if (highlightsMatch) {

        result.highlights =
            normalizeArray(
                highlightsMatch[1]
            );

    }


    if (keywordsMatch) {

        result.keywords =
            normalizeArray(
                keywordsMatch[1]
            );

    }


    if (hashtagsMatch) {

        result.hashtags =
            normalizeArray(
                hashtagsMatch[1]
            );

    }


    if (seoTitleMatch) {

        result.seoTitle =
            seoTitleMatch[1].trim();

    }


    if (seoDescriptionMatch) {

        result.seoDescription =
            seoDescriptionMatch[1].trim();

    }


    return result;

}


// ==========================================================
// EXTRACT LISTING
// ==========================================================

function extractListing(
    data
) {

    let source =
        findListingObject(
            data
        );


    // If the selected object contains a JSON string
    const possibleStringFields = [

        "listing",

        "result",

        "output",

        "text",

        "content",

        "response"

    ];


    for (
        const field
        of possibleStringFields
    ) {

        if (
            typeof source[field] ===
                "string"
        ) {

            const parsed =
                tryParseJSON(
                    source[field]
                );


            if (
                parsed &&
                typeof parsed ===
                    "object"
            ) {

                source =
                    parsed;

                break;

            }

        }

    }


    let text =
        extractPossibleText(
            data
        );


    if (
        !source.title &&
        text
    ) {

        const parsedText =
            parseTextListing(
                text
            );


        if (
            parsedText &&
            Object.keys(
                parsedText
            ).length
        ) {

            source = {

                ...source,

                ...parsedText

            };

        }

    }


    return {

        title:

            source.title ||

            source.TITLE ||

            source.productTitle ||

            source.product_title ||

            "",


        description:

            source.description ||

            source.DESCRIPTION ||

            source.productDescription ||

            source.product_description ||

            "",


        highlights:

            normalizeArray(

                source.highlights ||

                source.HIGHLIGHTS ||

                source.keyHighlights ||

                source.key_highlights

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

                source.socialHashtags ||

                source.social_hashtags

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
// ARRAY NORMALIZER
// ==========================================================

function normalizeArray(
    value
) {

    if (
        Array.isArray(value)
    ) {

        return value

            .map(
                item =>
                    String(
                        item
                    ).trim()
            )

            .filter(Boolean);

    }


    if (
        typeof value ===
            "string"
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

                        .replace(
                            /^\d+[.)]\s*/,
                            ""
                        )

                        .trim()

            )

            .filter(Boolean);

    }


    return [];

}


// ==========================================================
// DISPLAY LISTING
// ==========================================================

function displayListing(
    listing
) {

    setOutputValue(

        listing.title,

        [

            "titleResult",

            "generatedTitle",

            "listingTitle",

            "resultTitle"

        ]

    );


    setOutputValue(

        listing.description,

        [

            "descriptionResult",

            "generatedDescription",

            "listingDescription",

            "resultDescription"

        ]

    );


    setOutputArray(

        listing.highlights,

        [

            "highlightsResult",

            "generatedHighlights",

            "listingHighlights",

            "resultHighlights"

        ]

    );


    setOutputArray(

        listing.keywords,

        [

            "keywordsResult",

            "generatedKeywords",

            "listingKeywords",

            "resultKeywords"

        ]

    );


    setOutputArray(

        listing.hashtags,

        [

            "hashtagsResult",

            "generatedHashtags",

            "listingHashtags",

            "resultHashtags"

        ]

    );


    setOutputValue(

        listing.seoTitle,

        [

            "seoTitleResult",

            "generatedSeoTitle",

            "seoTitle",

            "resultSeoTitle"

        ]

    );


    setOutputValue(

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
            document.getElementById(
                id
            );


        if (!element) {
            continue;
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


        showElement(id);


        return;

    }

}


// ==========================================================
// SET OUTPUT ARRAY
// ==========================================================

function setOutputArray(
    values,
    ids
) {

    for (
        const id
        of ids
    ) {

        const element =
            document.getElementById(
                id
            );


        if (!element) {
            continue;
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


        showElement(id);


        return;

    }

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

        "listingOutput"

    ];


    for (
        const id
        of containers
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.style.display =
                "block";

        }

    }

}


// ==========================================================
// COPY HELPERS
// ==========================================================

function getDisplayedValue(
    ids
) {

    for (
        const id
        of ids
    ) {

        const element =
            document.getElementById(
                id
            );


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
                    element.textContent ||
                    ""
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
            ? `TITLE\n${title}`
            : "",


        description
            ? `DESCRIPTION\n${description}`
            : "",


        highlights
            ? `HIGHLIGHTS\n${highlights}`
            : "",


        keywords
            ? `KEYWORDS\n${keywords}`
            : "",


        hashtags
            ? `HASHTAGS\n${hashtags}`
            : "",


        seoTitle
            ? `SEO TITLE\n${seoTitle}`
            : "",


        seoDescription
            ? `SEO DESCRIPTION\n${seoDescription}`
            : ""

    ]

        .filter(Boolean)

        .join("\n\n");

}


// ==========================================================
// COPY COMPLETE LISTING
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


        textarea.style.left =
            "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.focus();


        textarea.select();


        try {

            const copied =
                document.execCommand(
                    "copy"
                );


            if (!copied) {
                throw new Error(
                    "Copy command failed"
                );
            }


            showMessage(

                "Listing copied successfully.",

                "success"

            );


        } catch (copyError) {

            console.error(
                "[COPY ERROR]",
                copyError
            );


            showMessage(

                "Unable to copy listing.",

                "error"

            );

        }


        textarea.remove();

    }

}


// ==========================================================
// GENERATE COMPLETE LISTING
// ==========================================================

async function generateCompleteListing() {

    if (isGenerating) {
        return;
    }


    clearMessage();


    const product =
        collectProductData();


    console.log(
        "[PRODUCT DATA]",
        product
    );


    const validation =
        validateProductData(
            product
        );


    if (!validation.valid) {

        showMessage(

            validation.message,

            "error"

        );

        return;

    }


    const payload =
        buildPayload(
            product
        );


    console.log(
        "[API PAYLOAD]",
        payload
    );


    setGeneratingState(
        true
    );


    showMessage(

        "Generating your product listing...",

        "info"

    );


    try {

        const data =
            await generateListingFromServer(
                payload
            );


        console.log(
            "[SERVER DATA]",
            data
        );


        const listing =
            extractListing(
                data
            );


        console.log(
            "[EXTRACTED LISTING]",
            listing
        );


        if (
            !listing.title &&
            !listing.description &&
            !listing.highlights.length &&
            !listing.keywords.length &&
            !listing.hashtags.length
        ) {

            console.error(
                "[EMPTY LISTING RESPONSE]",
                data
            );


            throw new Error(

                "Server response received, but no listing content was found."

            );

        }


        displayListing(
            listing
        );


        const sourceText =
            data &&
            data.source

                ? ` Source: ${data.source}.`

                : "";


        showMessage(

            `Listing generated successfully.${sourceText}`,

            "success"

        );


        // ==================================================
        // SAVE LAST LISTING
        // ==================================================

        try {

            localStorage.setItem(

                "aiSellerToolkitLastListing",

                JSON.stringify({

                    product:
                        payload,

                    listing:
                        listing,

                    source:
                        data &&
                        data.source
                            ? data.source
                            : null,

                    model:
                        data &&
                        data.model
                            ? data.model
                            : null,

                    version:
                        data &&
                        data.version
                            ? data.version
                            : "7.1",

                    generatedAt:
                        new Date()
                            .toISOString()

                })

            );

        } catch (storageError) {

            console.warn(

                "[LOCAL STORAGE ERROR]",

                storageError

            );

        }

    } catch (error) {

        console.error(

            "[GENERATE ERROR]",

            error

        );


        showMessage(

            error &&
            error.message

                ? error.message

                : "Unable to generate listing. Please try again.",

            "error"

        );

    } finally {

        setGeneratingState(
            false
        );

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
            JSON.parse(
                saved
            );


        if (
            !data ||
            !data.listing
        ) {

            return;

        }


        displayListing(
            data.listing
        );


    } catch (error) {

        console.warn(

            "[LOAD LAST LISTING ERROR]",

            error

        );

    }

}


// ==========================================================
// CHECK SERVER STATUS
// ==========================================================

async function checkServerStatus() {

    try {

        const response =
            await fetch(

                STATUS_ENDPOINT,

                {

                    method:
                        "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }

            );


        if (!response.ok) {

            throw new Error(

                `Status HTTP ${response.status}`

            );

        }


        const data =
            await response.json();


        if (
            data &&
            data.success
        ) {

            console.log(

                "[AI SELLER TOOLKIT] Backend online",

                data

            );


            return data;

        }


        throw new Error(

            "Backend status check failed"

        );


    } catch (error) {

        console.warn(

            "[BACKEND STATUS ERROR]",

            error

        );


        return null;

    }

}


// ==========================================================
// EVENT BINDING
// ==========================================================

function bindEvents() {

    const categoryElement =
        getCategoryElement();


    if (categoryElement) {

        if (
            categoryElement.dataset.aiSellerCategoryBound !==
            "true"
        ) {

            categoryElement.dataset.aiSellerCategoryBound =
                "true";


            categoryElement.addEventListener(

                "change",

                handleCategoryChange

            );

        }

    }


    const generateButtons = [

        "generateListingBtn",

        "generateCompleteListing",

        "generateBtn",

        "generateButton"

    ];


    for (
        const id
        of generateButtons
    ) {

        const button =
            document.getElementById(
                id
            );


        if (!button) {
            continue;
        }


        if (
            button.dataset.aiSellerBound ===
            "true"
        ) {

            continue;

        }


        button.dataset.aiSellerBound =
            "true";


        button.addEventListener(

            "click",

            function(event) {

                event.preventDefault();

                event.stopPropagation();

                generateCompleteListing();

            }

        );

    }


    const copyButtons = [

        "copyListingBtn",

        "copyCompleteListing",

        "copyButton",

        "copyListing"

    ];


    for (
        const id
        of copyButtons
    ) {

        const button =
            document.getElementById(
                id
            );


        if (!button) {
            continue;
        }


        if (
            button.dataset.aiSellerCopyBound ===
            "true"
        ) {

            continue;

        }


        button.dataset.aiSellerCopyBound =
            "true";


        button.addEventListener(

            "click",

            function(event) {

                event.preventDefault();

                event.stopPropagation();

                copyCompleteListing();

            }

        );

    }

}


// ==========================================================
// INITIALIZE
// ==========================================================

async function initializeCompleteListingGenerator() {

    console.log(
        "=========================================================="
    );


    console.log(
        "AI SELLER TOOLKIT"
    );


    console.log(
        "Complete Listing Generator 7.2"
    );


    console.log(
        "Backend:",
        API_BASE_URL
    );


    console.log(
        "=========================================================="
    );


    bindEvents();


    const categoryElement =
        getCategoryElement();


    if (
        categoryElement &&
        categoryElement.options.length <= 1
    ) {

        await loadCategories();

    } else {

        handleCategoryChange();

    }


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

        initializeCompleteListingGenerator

    );

} else {

    initializeCompleteListingGenerator();

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
// END
// COMPLETE-LISTING-GENERATOR.JS — FINAL VERSION 7.2
// ==========================================================
