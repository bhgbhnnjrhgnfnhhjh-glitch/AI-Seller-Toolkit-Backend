// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE-LISTING-GENERATOR.JS — FINAL VERSION 7.2
// ==========================================================
// Category-Aware
// Server 7.1 Compatible
// Strict Fact Guard Compatible
// No Invented Facts
// Dynamic Category Fields
// Robust API Response Parser
// Multiple Frontend Response Formats Supported
// Automatic Result Display Fallback
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

    const element =
        getElement(...ids);

    if (element) {

        element.style.display =
            "";

    }

}


function hideElement(...ids) {

    const element =
        getElement(...ids);

    if (element) {

        element.style.display =
            "none";

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
// FIND CATEGORY ELEMENT
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

        const newPlaceholder =
            placeholder.cloneNode(
                true
            );

        select.appendChild(
            newPlaceholder
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
            document.createElement("option");

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
// BUTTON STATE
// ==========================================================

function setGeneratingState(generating) {

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
// GENERATE API REQUEST
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


    let data = null;


    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            `Server returned invalid response (${response.status})`
        );

    }


    console.log(
        "[GENERATE RESPONSE]",
        data
    );


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
// FIND POSSIBLE LISTING SOURCE
// ==========================================================

function findListingSource(data) {

    if (!data) {
        return {};
    }


    const candidates = [

        data.listing,

        data.result,

        data.data,

        data.generatedListing,

        data.generated,

        data.output,

        data.response

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            candidate &&
            typeof candidate === "object"
        ) {

            return candidate;

        }

    }


    return data;

}


// ==========================================================
// PARSE TEXT LISTING
// ==========================================================

function parseListingText(text) {

    if (
        typeof text !== "string" ||
        !text.trim()
    ) {

        return {};

    }


    const result = {};


    const cleanText =
        text
            .replace(/\r/g, "")
            .trim();


    const sections = [

        {
            key: "title",
            labels: [
                "TITLE",
                "Title"
            ]
        },

        {
            key: "description",
            labels: [
                "DESCRIPTION",
                "Description"
            ]
        },

        {
            key: "highlights",
            labels: [
                "HIGHLIGHTS",
                "Highlights"
            ]
        },

        {
            key: "keywords",
            labels: [
                "KEYWORDS",
                "Keywords"
            ]
        },

        {
            key: "hashtags",
            labels: [
                "HASHTAGS",
                "Hashtags"
            ]
        },

        {
            key: "seoTitle",
            labels: [
                "SEO TITLE",
                "SEO Title"
            ]
        },

        {
            key: "seoDescription",
            labels: [
                "SEO DESCRIPTION",
                "SEO Description"
            ]
        }

    ];


    for (
        let i = 0;
        i < sections.length;
        i++
    ) {

        const section =
            sections[i];


        const nextLabels =
            sections
                .slice(i + 1)
                .flatMap(
                    item =>
                        item.labels
                );


        const pattern =
            new RegExp(

                `(?:^|\\n)\\s*(?:${section.labels.join("|")})\\s*[:\\-]?\\s*\\n?([\\s\\S]*?)(?=\\n\\s*(?:${nextLabels.join("|")})\\s*[:\\-]?\\s*\\n?|$)`,

                "i"

            );


        const match =
            cleanText.match(
                pattern
            );


        if (
            match &&
            match[1]
        ) {

            result[section.key] =
                match[1].trim();

        }

    }


    return result;

}


// ==========================================================
// EXTRACT LISTING
// ==========================================================

function extractListing(data) {

    const source =
        findListingSource(
            data
        );


    // ------------------------------------------------------
    // If listing itself is plain text
    // ------------------------------------------------------

    if (
        typeof source === "string"
    ) {

        const parsed =
            parseListingText(
                source
            );


        return normalizeListing(
            parsed
        );

    }


    // ------------------------------------------------------
    // Try common nested response formats
    // ------------------------------------------------------

    let workingSource =
        source;


    const nestedCandidates = [

        source.listing,

        source.result,

        source.data,

        source.output,

        source.generatedListing,

        source.content

    ];


    for (
        const candidate
        of nestedCandidates
    ) {

        if (
            candidate &&
            (
                typeof candidate === "object" ||
                typeof candidate === "string"
            )
        ) {

            if (
                typeof candidate === "string"
            ) {

                const parsed =
                    parseListingText(
                        candidate
                    );


                if (
                    Object.keys(
                        parsed
                    ).length
                ) {

                    workingSource =
                        parsed;

                }

            } else {

                workingSource =
                    candidate;

            }

            break;

        }

    }


    // ------------------------------------------------------
    // Direct object extraction
    // ------------------------------------------------------

    let listing = {

        title:
            workingSource.title ||
            workingSource.TITLE ||
            workingSource.productTitle ||
            "",

        description:
            workingSource.description ||
            workingSource.DESCRIPTION ||
            "",

        highlights:
            workingSource.highlights ||
            workingSource.HIGHLIGHTS ||
            workingSource.keyFeatures ||
            [],

        keywords:
            workingSource.keywords ||
            workingSource.KEYWORDS ||
            workingSource.seoKeywords ||
            [],

        hashtags:
            workingSource.hashtags ||
            workingSource.HASHTAGS ||
            [],

        seoTitle:
            workingSource.seoTitle ||
            workingSource["SEO TITLE"] ||
            workingSource.seo_title ||
            "",

        seoDescription:
            workingSource.seoDescription ||
            workingSource["SEO DESCRIPTION"] ||
            workingSource.seo_description ||
            ""

    };


    // ------------------------------------------------------
    // If nothing found, inspect data directly
    // ------------------------------------------------------

    if (
        !listing.title &&
        typeof data === "object"
    ) {

        listing = {

            title:
                data.title ||
                data.TITLE ||
                data.productTitle ||
                "",

            description:
                data.description ||
                data.DESCRIPTION ||
                "",

            highlights:
                data.highlights ||
                data.HIGHLIGHTS ||
                [],

            keywords:
                data.keywords ||
                data.KEYWORDS ||
                [],

            hashtags:
                data.hashtags ||
                data.HASHTAGS ||
                [],

            seoTitle:
                data.seoTitle ||
                data["SEO TITLE"] ||
                data.seo_title ||
                "",

            seoDescription:
                data.seoDescription ||
                data["SEO DESCRIPTION"] ||
                data.seo_description ||
                ""

        };

    }


    // ------------------------------------------------------
    // Parse text fields if API returned text
    // ------------------------------------------------------

    if (
        typeof listing.title === "string" &&
        (
            listing.title.includes("DESCRIPTION") ||
            listing.title.includes("HIGHLIGHTS")
        )
    ) {

        const parsed =
            parseListingText(
                listing.title
            );


        if (parsed.title) {

            listing =
                {
                    ...listing,
                    ...parsed
                };

        }

    }


    return normalizeListing(
        listing
    );

}


// ==========================================================
// NORMALIZE LISTING
// ==========================================================

function normalizeListing(listing) {

    if (!listing) {

        return {

            title: "",
            description: "",
            highlights: [],
            keywords: [],
            hashtags: [],
            seoTitle: "",
            seoDescription: ""

        };

    }


    return {

        title:
            typeof listing.title === "string"
                ? listing.title.trim()
                : "",

        description:
            typeof listing.description === "string"
                ? listing.description.trim()
                : "",

        highlights:
            normalizeArray(
                listing.highlights
            ),

        keywords:
            normalizeArray(
                listing.keywords
            ),

        hashtags:
            normalizeArray(
                listing.hashtags
            ),

        seoTitle:
            typeof listing.seoTitle === "string"
                ? listing.seoTitle.trim()
                : "",

        seoDescription:
            typeof listing.seoDescription === "string"
                ? listing.seoDescription.trim()
                : ""

    };

}


// ==========================================================
// ARRAY NORMALIZER
// ==========================================================

function normalizeArray(value) {

    if (Array.isArray(value)) {

        return value
            .map(
                item =>
                    String(item)
                        .trim()
                        .replace(
                            /^[-•*]\s*/,
                            ""
                        )
            )
            .filter(Boolean);

    }


    if (
        typeof value === "string"
    ) {

        return value
            .split(/\n|,/)
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

function displayListing(listing) {

    console.log(
        "[DISPLAY LISTING]",
        listing
    );


    setOutputValue(
        listing.title,
        [
            "titleResult",
            "generatedTitle",
            "listingTitle",
            "resultTitle",
            "titleOutput",
            "generated-title"
        ]
    );


    setOutputValue(
        listing.description,
        [
            "descriptionResult",
            "generatedDescription",
            "listingDescription",
            "resultDescription",
            "descriptionOutput",
            "generated-description"
        ]
    );


    setOutputArray(
        listing.highlights,
        [
            "highlightsResult",
            "generatedHighlights",
            "listingHighlights",
            "resultHighlights",
            "highlightsOutput",
            "generated-highlights"
        ]
    );


    setOutputArray(
        listing.keywords,
        [
            "keywordsResult",
            "generatedKeywords",
            "listingKeywords",
            "resultKeywords",
            "keywordsOutput",
            "generated-keywords"
        ]
    );


    setOutputArray(
        listing.hashtags,
        [
            "hashtagsResult",
            "generatedHashtags",
            "listingHashtags",
            "resultHashtags",
            "hashtagsOutput",
            "generated-hashtags"
        ]
    );


    setOutputValue(
        listing.seoTitle,
        [
            "seoTitleResult",
            "generatedSeoTitle",
            "seoTitle",
            "resultSeoTitle",
            "seoTitleOutput",
            "generated-seo-title"
        ]
    );


    setOutputValue(
        listing.seoDescription,
        [
            "seoDescriptionResult",
            "generatedSeoDescription",
            "seoDescription",
            "resultSeoDescription",
            "seoDescriptionOutput",
            "generated-seo-description"
        ]
    );


    // ------------------------------------------------------
    // If HTML has no matching result elements,
    // automatically create a result box.
    // ------------------------------------------------------

    const displayed =
        hasAnyListingOutput(
            listing
        );


    if (!displayed) {

        createFallbackResultBox(
            listing
        );

    }


    showResultContainer();

}


// ==========================================================
// CHECK WHETHER OUTPUT WAS DISPLAYED
// ==========================================================

function hasAnyListingOutput(listing) {

    const outputIds = [

        "titleResult",
        "generatedTitle",
        "listingTitle",
        "resultTitle",
        "titleOutput",

        "descriptionResult",
        "generatedDescription",
        "listingDescription",
        "resultDescription",
        "descriptionOutput",

        "highlightsResult",
        "generatedHighlights",
        "listingHighlights",
        "resultHighlights",

        "keywordsResult",
        "generatedKeywords",
        "listingKeywords",
        "resultKeywords",

        "hashtagsResult",
        "generatedHashtags",
        "listingHashtags",
        "resultHashtags",

        "seoTitleResult",
        "generatedSeoTitle",
        "seoTitle",
        "resultSeoTitle",

        "seoDescriptionResult",
        "generatedSeoDescription",
        "seoDescription",
        "resultSeoDescription"

    ];


    for (
        const id
        of outputIds
    ) {

        const element =
            document.getElementById(
                id
            );


        if (!element) {
            continue;
        }


        if (
            "value" in element &&
            String(
                element.value || ""
            ).trim()
        ) {

            return true;

        }


        if (
            element.textContent &&
            element.textContent.trim()
        ) {

            return true;

        }

    }


    return false;

}


// ==========================================================
// SET OUTPUT VALUE
// ==========================================================

function setOutputValue(
    value,
    ids
) {

    if (
        value === undefined ||
        value === null
    ) {

        return;

    }


    const cleanValue =
        String(value).trim();


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
                cleanValue;

        } else {

            element.textContent =
                cleanValue;

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

    const array =
        normalizeArray(
            values
        );


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
            element.tagName ===
            "TEXTAREA"
        ) {

            element.value =
                array.join("\n");

        } else if (
            element.tagName ===
            "INPUT"
        ) {

            element.value =
                array.join(", ");

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
// FALLBACK RESULT BOX
// ==========================================================

function createFallbackResultBox(
    listing
) {

    let container =
        document.getElementById(
            "aiSellerGeneratedResult"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );


        container.id =
            "aiSellerGeneratedResult";


        container.style.marginTop =
            "20px";

        container.style.padding =
            "20px";

        container.style.border =
            "1px solid #ddd";

        container.style.borderRadius =
            "12px";

        container.style.background =
            "#fff";


        const parent =
            document.querySelector(
                "main"
            ) ||
            document.body;


        parent.appendChild(
            container
        );

    }


    container.innerHTML =
        "";


    const heading =
        document.createElement(
            "h2"
        );


    heading.textContent =
        "Generated Product Listing";


    container.appendChild(
        heading
    );


    appendFallbackSection(
        container,
        "TITLE",
        listing.title
    );


    appendFallbackSection(
        container,
        "DESCRIPTION",
        listing.description
    );


    appendFallbackList(
        container,
        "HIGHLIGHTS",
        listing.highlights
    );


    appendFallbackList(
        container,
        "KEYWORDS",
        listing.keywords
    );


    appendFallbackList(
        container,
        "HASHTAGS",
        listing.hashtags
    );


    appendFallbackSection(
        container,
        "SEO TITLE",
        listing.seoTitle
    );


    appendFallbackSection(
        container,
        "SEO DESCRIPTION",
        listing.seoDescription
    );


    container.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ==========================================================
// FALLBACK SECTION
// ==========================================================

function appendFallbackSection(
    container,
    title,
    value
) {

    if (!value) {
        return;
    }


    const heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        title;


    const content =
        document.createElement(
            "p"
        );


    content.textContent =
        value;


    content.style.whiteSpace =
        "pre-wrap";


    container.appendChild(
        heading
    );


    container.appendChild(
        content
    );

}


// ==========================================================
// FALLBACK LIST
// ==========================================================

function appendFallbackList(
    container,
    title,
    values
) {

    const array =
        normalizeArray(
            values
        );


    if (!array.length) {
        return;
    }


    const heading =
        document.createElement(
            "h3"
        );


    heading.textContent =
        title;


    const list =
        document.createElement(
            "ul"
        );


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


        list.appendChild(
            item
        );

    }


    container.appendChild(
        heading
    );


    container.appendChild(
        list
    );

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

        "result",

        "resultsContainer"

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
// GET LISTING TEXT
// ==========================================================

function getListingText() {

    const title =
        getDisplayedValue(
            [
                "titleResult",
                "generatedTitle",
                "listingTitle",
                "resultTitle",
                "titleOutput"
            ]
        );


    const description =
        getDisplayedValue(
            [
                "descriptionResult",
                "generatedDescription",
                "listingDescription",
                "resultDescription",
                "descriptionOutput"
            ]
        );


    const highlights =
        getDisplayedValue(
            [
                "highlightsResult",
                "generatedHighlights",
                "listingHighlights",
                "resultHighlights",
                "highlightsOutput"
            ]
        );


    const keywords =
        getDisplayedValue(
            [
                "keywordsResult",
                "generatedKeywords",
                "listingKeywords",
                "resultKeywords",
                "keywordsOutput"
            ]
        );


    const hashtags =
        getDisplayedValue(
            [
                "hashtagsResult",
                "generatedHashtags",
                "listingHashtags",
                "resultHashtags",
                "hashtagsOutput"
            ]
        );


    const seoTitle =
        getDisplayedValue(
            [
                "seoTitleResult",
                "generatedSeoTitle",
                "seoTitle",
                "resultSeoTitle",
                "seoTitleOutput"
            ]
        );


    const seoDescription =
        getDisplayedValue(
            [
                "seoDescriptionResult",
                "generatedSeoDescription",
                "seoDescription",
                "resultSeoDescription",
                "seoDescriptionOutput"
            ]
        );


    // ------------------------------------------------------
    // Fallback box support
    // ------------------------------------------------------

    const fallback =
        document.getElementById(
            "aiSellerGeneratedResult"
        );


    let fallbackText = "";


    if (
        fallback &&
        fallback.textContent
    ) {

        fallbackText =
            fallback.textContent.trim();

    }


    const result = [

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


    return result ||
        fallbackText;

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

        console.warn(
            "[CLIPBOARD FALLBACK]",
            error
        );


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

        console.warn(
            "[GENERATE]",
            "Already generating."
        );

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
            "
