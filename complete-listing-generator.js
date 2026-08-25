// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE LISTING GENERATOR
// FINAL VERSION 6
// Category-Aware + Strict Data Collection
// Backend Version 4 Compatible
// ==========================================================


// ==========================================================
// RENDER BACKEND
// ==========================================================

const API_BASE_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com";

const API_URL =
    API_BASE_URL + "/api/generate-listing";


// ==========================================================
// SUPPORTED CATEGORIES
// IMPORTANT:
// UI category और backend category SAME रखी गई है
// ==========================================================

const CATEGORY_MAP = {

    "Fashion":
        "Fashion & Clothing",

    "Fashion & Clothing":
        "Fashion & Clothing",

    "Beauty":
        "Beauty",

    "Electronics":
        "Electronics",

    "Home & Kitchen":
        "Home & Kitchen",

    "Shoes":
        "Shoes",

    "Footwear":
        "Shoes",

    "Jewellery":
        "Jewellery",

    "Jewelry":
        "Jewellery",

    "Toys":
        "Toys",

    "Toys & Kids":
        "Toys",

    "Books":
        "Books",

    "Books & Stationery":
        "Books",

    "Pet":
        "Pet",

    "Sports":
        "Sports",

    "Sports & Fitness":
        "Sports",

    "Automotive":
        "Automotive",

    "Garden":
        "Garden",

    "Food":
        "Food",

    "Grocery & Food":
        "Food",

    "Gifts":
        "Gifts",

    "Other":
        "Other"
};


// ==========================================================
// CATEGORY ICONS
// ==========================================================

const CATEGORY_ICONS = {

    "👗": "Fashion",
    "💄": "Beauty",
    "📱": "Electronics",
    "🏠": "Home & Kitchen",
    "👟": "Shoes",
    "💍": "Jewellery",
    "🧸": "Toys",
    "📚": "Books",
    "🐶": "Pet",
    "🐾": "Pet",
    "🏋️": "Sports",
    "⚽": "Sports",
    "🚗": "Automotive",
    "🌱": "Garden",
    "🍎": "Food",
    "🍔": "Food",
    "🎁": "Gifts"
};


// ==========================================================
// REMOVE CATEGORY ICON
// ==========================================================

function removeCategoryIcon(value) {

    if (!value) {
        return "";
    }

    let text =
        String(value).trim();

    for (
        const icon of Object.keys(CATEGORY_ICONS)
    ) {

        if (
            text.startsWith(icon)
        ) {

            text =
                text
                    .substring(icon.length)
                    .trim();

            break;
        }
    }

    return text;
}


// ==========================================================
// NORMALIZE CATEGORY
// ==========================================================

function normalizeCategory(value) {

    if (!value) {
        return "";
    }

    let category =
        removeCategoryIcon(value);

    category =
        category
            .replace(/\s+/g, " ")
            .trim();


    // Direct match

    if (
        CATEGORY_MAP[category]
    ) {

        return CATEGORY_MAP[
            category
        ];
    }


    // Case-insensitive match

    const found =
        Object.keys(CATEGORY_MAP)
            .find(
                key =>
                    key.toLowerCase() ===
                    category.toLowerCase()
            );


    if (found) {

        return CATEGORY_MAP[
            found
        ];
    }


    return "";
}


// ==========================================================
// FIND CATEGORY SELECT
// ==========================================================

function findCategoryElement() {

    const possibleIds = [

        "category",
        "productCategory",
        "product-category",
        "productCategorySelect",
        "product_category",
        "categorySelect"

    ];


    for (
        const id of possibleIds
    ) {

        const element =
            document.getElementById(id);


        if (element) {
            return element;
        }

    }


    // Fallback

    const selects =
        document.querySelectorAll("select");


    for (
        const select of selects
    ) {

        const text =
            select.innerText || "";


        const hasCategory =
            text.includes("Fashion") ||
            text.includes("Beauty") ||
            text.includes("Electronics") ||
            text.includes("Home & Kitchen") ||
            text.includes("Shoes") ||
            text.includes("Jewellery") ||
            text.includes("Toys") ||
            text.includes("Books") ||
            text.includes("Pet") ||
            text.includes("Sports") ||
            text.includes("Automotive") ||
            text.includes("Garden") ||
            text.includes("Food") ||
            text.includes("Gifts");


        if (hasCategory) {
            return select;
        }

    }


    return null;
}


// ==========================================================
// GET VALUE
// ==========================================================

function getValue(...ids) {

    for (
        const id of ids
    ) {

        const element =
            document.getElementById(id);


        if (!element) {
            continue;
        }


        const value =
            String(
                element.value || ""
            ).trim();


        if (value) {
            return value;
        }

    }


    return "";
}


// ==========================================================
// GET FIELD LABEL
// ==========================================================

function getFieldLabel(element) {

    if (!element) {
        return "";
    }


    // Explicit label

    if (
        element.labels &&
        element.labels.length
    ) {

        const label =
            element.labels[0].innerText || "";

        if (label.trim()) {
            return label.trim();
        }

    }


    // aria-label

    const aria =
        element.getAttribute("aria-label");

    if (aria) {
        return aria.trim();
    }


    // placeholder

    const placeholder =
        element.getAttribute("placeholder");

    if (
        placeholder &&
        !placeholder.includes("Only if known")
    ) {

        return placeholder.trim();
    }


    // name

    const name =
        element.getAttribute("name");

    if (name) {
        return name.trim();
    }


    // id

    const id =
        element.getAttribute("id");

    if (id) {
        return id.trim();
    }


    return "";
}


// ==========================================================
// GET ALL CATEGORY FIELDS
// ==========================================================

function collectCategoryFields() {

    const data = {};


    const containers = [

        document.getElementById(
            "categoryDetails"
        ),

        document.querySelector(
            ".category-details"
        ),

        document.querySelector(
            "#dynamicFields"
        ),

        document.querySelector(
            ".dynamic-fields"
        ),

        document.querySelector(
            "#categoryFields"
        ),

        document.querySelector(
            ".category-fields"
        )

    ].filter(Boolean);


    let elements = [];


    containers.forEach(
        container => {

            elements.push(
                ...container.querySelectorAll(
                    "input, textarea, select"
                )
            );

        }
    );


    // Fallback

    if (!elements.length) {

        elements =
            Array.from(
                document.querySelectorAll(
                    "input[name], textarea[name], select[name]"
                )
            );

    }


    elements.forEach(
        element => {

            const name =
                element.getAttribute("name");

            const id =
                element.getAttribute("id");


            const value =
                String(
                    element.value || ""
                ).trim();


            if (!value) {
                return;
            }


            // Prefer name, then id, then label

            const key =
                name ||
                id ||
                getFieldLabel(element);


            if (!key) {
                return;
            }


            data[key] =
                value;

        }
    );


    return data;
}


// ==========================================================
// GET ALL PRODUCT DATA
// ==========================================================

function collectProductData() {

    const categoryElement =
        findCategoryElement();


    const rawCategory =
        categoryElement
            ? categoryElement.value
            : "";


    const category =
        normalizeCategory(
            rawCategory
        );


    const categoryData =
        collectCategoryFields();


    const product = {

        category:
            category,

        productName:
            getValue(
                "productName",
                "product-name",
                "product_title",
                "productTitle"
            ),

        brand:
            getValue(
                "brand",
                "productBrand"
            ),

        price:
            getValue(
                "price",
                "productPrice"
            ),

        productDetails:
            getValue(
                "productDetails",
                "product-details",
                "description",
                "productDescription"
            ),

        productFeatures:
            getValue(
                "productFeatures",
                "features",
                "product-features"
            ),

        extraInfo:
            getValue(
                "extraInfo",
                "extraProductInfo",
                "additionalInfo"
            ),

        color:
            getValue(
                "color",
                "productColor"
            ),

        size:
            getValue(
                "size",
                "productSize"
            ),

        material:
            getValue(
                "material",
                "productMaterial"
            ),

        imageDescription:
            getValue(
                "imageDescription",
                "image-description"
            ),

        categoryData:
            categoryData

    };


    console.log(
        "📦 FINAL PRODUCT DATA:",
        product
    );


    return product;
}


// ==========================================================
// VALIDATE PRODUCT
// ==========================================================

function validateProduct(product) {

    if (!product.category) {

        return (
            "Product category is required. " +
            "Please select a valid category."
        );

    }


    if (!product.productName) {

        return (
            "Product Name is required."
        );

    }


    return "";
}


// ==========================================================
// SHOW STATUS
// ==========================================================

function showStatus(
    message,
    type = "normal"
) {

    const statusMessage =
        document.getElementById(
            "statusMessage"
        );


    if (!statusMessage) {
        return;
    }


    statusMessage.textContent =
        message;


    if (
        type === "error"
    ) {

        statusMessage.style.color =
            "#dc2626";

    }

    else if (
        type === "success"
    ) {

        statusMessage.style.color =
            "#15803d";

    }

    else {

        statusMessage.style.color =
            "#374151";

    }

}


// ==========================================================
// DISPLAY LISTING
// ==========================================================

function displayListing(listing) {

    const resultCard =
        document.getElementById(
            "resultCard"
        );


    const listingResult =
        document.getElementById(
            "listingResult"
        );


    if (!listingResult) {

        console.error(
            "❌ listingResult element not found"
        );

        return;
    }


    let output = "";


    if (listing.title) {

        output +=
            "TITLE\n\n" +
            listing.title +
            "\n\n";

    }


    if (listing.description) {

        output +=
            "DESCRIPTION\n\n" +
            listing.description +
            "\n\n";

    }


    if (
        Array.isArray(
            listing.highlights
        ) &&
        listing.highlights.length
    ) {

        output +=
            "HIGHLIGHTS\n\n";


        listing.highlights.forEach(
            item => {

                output +=
                    "• " +
                    item +
                    "\n";

            }
        );


        output += "\n";

    }


    if (
        Array.isArray(
            listing.keywords
        ) &&
        listing.keywords.length
    ) {

        output +=
            "KEYWORDS\n\n" +
            listing.keywords.join(", ") +
            "\n\n";

    }


    if (
        Array.isArray(
            listing.hashtags
        ) &&
        listing.hashtags.length
    ) {

        output +=
            "HASHTAGS\n\n" +
            listing.hashtags.join(" ") +
            "\n\n";

    }


    if (listing.seoTitle) {

        output +=
            "SEO TITLE\n\n" +
            listing.seoTitle +
            "\n\n";

    }


    if (listing.seoDescription) {

        output +=
            "SEO DESCRIPTION\n\n" +
            listing.seoDescription +
            "\n\n";

    }


    if (!output) {

        output =
            "Listing generated successfully.";

    }


    listingResult.textContent =
        output;


    if (resultCard) {

        resultCard.style.display =
            "block";


        resultCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// ==========================================================
// GENERATE LISTING
// ==========================================================

async function generateListing() {

    console.log(
        "🚀 Generate Listing clicked"
    );


    const generateButton =
        document.getElementById(
            "generateListingBtn"
        );


    const product =
        collectProductData();


    console.log(
        "📂 Normalized Category:",
        product.category
    );


    // Validation

    const error =
        validateProduct(product);


    if (error) {

        showStatus(
            "❌ " + error,
            "error"
        );

        return;
    }


    if (generateButton) {

        generateButton.disabled =
            true;

        generateButton.textContent =
            "⏳ Generating...";

    }


    showStatus(
        "🤖 AI listing बना रहा है..."
    );


    try {

        // --------------------------------------------------
        // BUILD COMPLETE PRODUCT INFORMATION
        // --------------------------------------------------

        const completeProductDetails = {

            basicInformation: {

                productName:
                    product.productName,

                brand:
                    product.brand,

                price:
                    product.price

            },

            generalInformation: {

                color:
                    product.color,

                size:
                    product.size,

                material:
                    product.material

            },

            categorySpecificInformation:
                product.categoryData,

            productDescription:
                product.productDetails,

            productFeatures:
                product.productFeatures,

            extraInformation:
                product.extraInfo,

            imageDescription:
                product.imageDescription

        };


        // --------------------------------------------------
        // REMOVE EMPTY VALUES
        // --------------------------------------------------

        function removeEmptyValues(obj) {

            if (
                obj === null ||
                obj === undefined
            ) {

                return null;

            }


            if (
                typeof obj !== "object"
            ) {

                return obj;

            }


            if (Array.isArray(obj)) {

                return obj
                    .map(removeEmptyValues)
                    .filter(
                        item =>
                            item !== null &&
                            item !== ""
                    );

            }


            const cleaned = {};


            Object.entries(obj)
                .forEach(
                    ([key, value]) => {

                        const cleanedValue =
                            removeEmptyValues(value);


                        if (
                            cleanedValue === null ||
                            cleanedValue === "" ||
                            (
                                typeof cleanedValue === "object" &&
                                !Array.isArray(cleanedValue) &&
                                Object.keys(cleanedValue).length === 0
                            )
                        ) {

                            return;

                        }


                        if (
                            Array.isArray(cleanedValue) &&
                            cleanedValue.length === 0
                        ) {

                            return;

                        }


                        cleaned[key] =
                            cleanedValue;

                    }
                );


            return cleaned;

        }


        const cleanedProductDetails =
            removeEmptyValues(
                completeProductDetails
            );


        // --------------------------------------------------
        // FINAL REQUEST
        // --------------------------------------------------

        const requestBody = {

            category:
                product.category,

            productName:
                product.productName,

            productDetails:
                JSON.stringify(
                    cleanedProductDetails
                ),

            brand:
                product.brand,

            price:
                product.price,

            color:
                product.color,

            size:
                product.size,

            material:
                product.material,

            imageDescription:
                product.imageDescription

        };


        console.log(
            "📤 FINAL REQUEST TO BACKEND:",
            requestBody
        );


        // --------------------------------------------------
        // API REQUEST
        // --------------------------------------------------

        const response =
            await fetch(
                API_URL,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )

                }
            );


        console.log(
            "📡 Backend Status:",
            response.status
        );


        // --------------------------------------------------
        // READ RESPONSE
        // --------------------------------------------------

        let data;


        try {

            data =
                await response.json();

        }

        catch {

            throw new Error(
                "Backend ने valid JSON response नहीं दिया।"
            );

        }


        console.log(
            "📥 Backend Response:",
            data
        );


        // --------------------------------------------------
        // API ERROR
        // --------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Backend request failed."
            );

        }


        // --------------------------------------------------
        // LISTING CHECK
        // --------------------------------------------------

        if (
            !data.listing
        ) {

            throw new Error(
                "Backend से listing result नहीं मिला।"
            );

        }


        // --------------------------------------------------
        // DISPLAY
        // --------------------------------------------------

        displayListing(
            data.listing
        );


        showStatus(
            "✅ Complete Listing तैयार है!",
            "success"
        );

    }

    catch (error) {

        console.error(
            "❌ Listing Error:",
            error
        );


        let message =
            error.message ||
            "कुछ गलत हो गया।";


        if (
            message.includes(
                "Failed to fetch"
            )
        ) {

            message =
                "Backend से connection नहीं हो रहा। कुछ सेकंड बाद फिर कोशिश करें।";

        }


        showStatus(
            "❌ " + message,
            "error"
        );

    }

    finally {

        if (generateButton) {

            generateButton.disabled =
                false;

            generateButton.textContent =
                "✨ Generate Complete Listing";

        }

    }

}


// ==========================================================
// CONNECT GENERATE BUTTON
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const generateButton =
            document.getElementById(
                "generateListingBtn"
            );


        if (generateButton) {

            generateButton.addEventListener(
                "click",
                generateListing
            );


            console.log(
                "✅ Generate Listing button connected"
            );

        }

        else {

            console.error(
                "❌ Generate Listing button not found"
            );

        }

    }
);


// ==========================================================
// CATEGORY DEBUG
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const categoryElement =
            findCategoryElement();


        if (!categoryElement) {

            console.warn(
                "⚠️ Category select not found"
            );

            return;

        }


        categoryElement.addEventListener(
            "change",
            function () {

                console.log(
                    "📂 Selected Category:",
                    this.value
                );


                console.log(
                    "📂 Backend Category:",
                    normalizeCategory(
                        this.value
                    )
                );

            }
        );

    }
);


// ==========================================================
// BACKEND TEST
// ==========================================================

async function checkBackend() {

    try {

        const response =
            await fetch(
                API_BASE_URL + "/"
            );


        if (!response.ok) {

            throw new Error(
                "Backend status: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "✅ Backend Online:",
            data
        );


        return data;

    }

    catch (error) {

        console.error(
            "❌ Backend Check Failed:",
            error
        );


        return null;

    }

}


// ==========================================================
// AUTO BACKEND CHECK
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkBackend();

    }
);


// ==========================================================
// GLOBAL ACCESS
// Useful for testing from browser console
// ==========================================================

window.AISellerToolkit = {

    generateListing:
        generateListing,

    checkBackend:
        checkBackend,

    collectProductData:
        collectProductData,

    normalizeCategory:
        normalizeCategory,

    collectCategoryFields:
        collectCategoryFields

};


console.log(
    "🤖 AI Seller Toolkit — Complete Listing Generator Version 6 Loaded"
);
