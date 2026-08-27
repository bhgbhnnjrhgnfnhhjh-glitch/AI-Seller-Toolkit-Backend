// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE-LISTING-GENERATOR.JS — FINAL VERSION 7.1
// ==========================================================
// Category-Aware
// Server 7.1 Compatible
// Strict Fact Guard Compatible
// Dynamic Category Fields
// No Invented Facts
// API Error Handling
// Frontend Response Compatibility
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

    element.value =
        value || "";
}


function showElement(...ids) {

    const element =
        getElement(...ids);

    if (element) {
        element.style.display = "";
    }

}


function hideElement(...ids) {

    const element =
        getElement(...ids);

    if (element) {
        element.style.display = "none";
    }

}


// ==========================================================
// MESSAGE UI
// ==========================================================

function getMessageElement() {

    return (
        getElement(
            "message",
            "errorMessage",
            "successMessage",
            "statusMessage",
            "formMessage"
        )
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
            console.error(message);
        } else {
            console.log(message);
        }

        return;
    }


    element.textContent =
        message;


    element.style.display =
        "block";


    element.className =
        `message ${type}`;


    if (type === "success") {

        setTimeout(() => {

            if (
                element.textContent ===
                message
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
// CREATE CATEGORY FIELD CONTAINER
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
// DYNAMIC FIELD GENERATOR
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
// LOAD CATEGORIES FROM SERVER
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

        // Local categories remain available.
        populateCategorySelect(
            categoryElement,
            Object.keys(
                LOCAL_CATEGORY_FIELDS
            )
            .map(name => ({
                name,
                fields:
                    LOCAL_CATEGORY_FIELDS[
                        name
                    ]
                    .map(
                        ([, label]) =>
                            label
                    )
            }))
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


    // Keep first placeholder
    const placeholder =
        select.querySelector(
            "option[value='']"
        );


    select.innerHTML =
        "";


    if (placeholder) {

        const newPlaceholder =
            placeholder.cloneNode(
                true
            );

        select.appendChild(
            newPlaceholder
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

        if (!item || !item.name) {
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
// COLLECT ALL POSSIBLE EXISTING FORM FIELDS
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
// VALIDATE FRONTEND INPUT
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


    if (!LOCAL_CATEGORY_FIELDS[
        product.category
    ]) {

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
            product[field] !== undefined &&
            product[field] !== null &&
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
// SET GENERATE BUTTON STATE
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


    for (
        const button
        of buttons
    ) {

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
            `Server returned invalid response (${response.status})`
        );

    }


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
// EXTRACT LISTING
// ==========================================================

function extractListing(
    data
) {

    const source =
        data.listing &&
        typeof data.listing === "object"

            ? data.listing

            : data;


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
            normalizeArray(
                source.highlights ||
                source.HIGHLIGHTS
            ),

        keywords:
            normalizeArray(
                source.keywords ||
                source.KEYWORDS
            ),

        hashtags:
            normalizeArray(
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
// ARRAY NORMALIZER
// ==========================================================

function normalizeArray(
    value
) {

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
// GET DISPLAYED VALUE
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

            if (
                element.value.trim()
            ) {

                return element.value.trim();

            }

        } else {

            if (
                element.textContent.trim()
            ) {

                return element.textContent.trim();

            }

        }

    }


    return "";

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

        await navigator.clipboard.writeText(
            text
        );


        showMessage(
            "Listing copied successfully.",
            "success"
        );


    } catch (error) {

        // Older browser fallback
        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        document.body.appendChild(
            textarea
        );


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


        const listing =
            extractListing(
                data
            );


        if (!listing.title) {

            throw new Error(
                "Server returned an empty listing."
            );

        }


        displayListing(
            listing
        );


        const sourceText =
            data.source
                ? ` Source: ${data.source}.`
                : "";


        showMessage(
            `Listing generated successfully.${sourceText}`,
            "success"
        );


        // Save last generated listing
        try {

            localStorage.setItem(

                "aiSellerToolkitLastListing",

                JSON.stringify({

                    product: payload,

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
// TEST SERVER
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


        const data =
            await response.json();


        if (
            data &&
            data.success
        ) {

            console.log(
                "[AI SELLER TOOLKIT]",
                "Backend online",
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

        categoryElement.addEventListener(
            "change",
            handleCategoryChange
        );

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


        // Avoid duplicate listeners
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
        "Complete Listing Generator 7.1"
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
// These allow HTML onclick="..." to continue working.

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
// END OF COMPLETE-LISTING-GENERATOR.JS — FINAL VERSION 7.1
// ==========================================================
