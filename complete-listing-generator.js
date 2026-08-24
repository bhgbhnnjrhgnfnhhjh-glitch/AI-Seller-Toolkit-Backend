// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE LISTING GENERATOR
// FINAL CATEGORY-AWARE VERSION
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com/generate";


// ==========================================================
// SUPPORTED CATEGORIES
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

function normalizeCategory(value) {

    if (!value) {
        return "";
    }

    let category =
        String(value)
            .trim()
            .replace(/^🏠\s*/, "")
            .replace(/^👗\s*/, "")
            .replace(/^💄\s*/, "")
            .replace(/^📱\s*/, "")
            .replace(/^👟\s*/, "")
            .replace(/^💍\s*/, "")
            .replace(/^🧸\s*/, "")
            .replace(/^📚\s*/, "")
            .replace(/^🐶\s*/, "")
            .replace(/^🏋️\s*/, "")
            .replace(/^🚗\s*/, "")
            .replace(/^🌱\s*/, "")
            .replace(/^🍎\s*/, "")
            .replace(/^🎁\s*/, "")
            .trim();

    // Exact match
    if (CATEGORIES.includes(category)) {
        return category;
    }

    // Case-insensitive match
    const found =
        CATEGORIES.find(
            item =>
                item.toLowerCase() ===
                category.toLowerCase()
        );

    return found || "";
}


// ==========================================================
// FIND CATEGORY SELECT
// ==========================================================

function findCategoryElement() {

    const possibleIds = [
        "category",
        "productCategory",
        "product-category",
        "productCategorySelect"
    ];

    for (const id of possibleIds) {

        const element =
            document.getElementById(id);

        if (element) {
            return element;
        }
    }

    // Fallback: find select containing category options

    const selects =
        document.querySelectorAll("select");

    for (const select of selects) {

        const text =
            select.innerText ||
            "";

        if (
            text.includes("Fashion") ||
            text.includes("Home & Kitchen") ||
            text.includes("Electronics")
        ) {

            return select;
        }
    }

    return null;
}


// ==========================================================
// GET VALUE
// ==========================================================

function getValue(...ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {

            return String(
                element.value || ""
            ).trim();

        }
    }

    return "";
}


// ==========================================================
// CATEGORY ELEMENT
// ==========================================================

const categoryElement =
    findCategoryElement();


// ==========================================================
// GENERATE BUTTON
// ==========================================================

const generateButton =
    document.getElementById(
        "generateListingBtn"
    );


// ==========================================================
// RESULT ELEMENTS
// ==========================================================

const resultCard =
    document.getElementById(
        "resultCard"
    );

const listingResult =
    document.getElementById(
        "listingResult"
    );

const statusMessage =
    document.getElementById(
        "statusMessage"
    );


// ==========================================================
// STATUS
// ==========================================================

function showStatus(
    message,
    type = "normal"
) {

    if (!statusMessage) {
        return;
    }

    statusMessage.textContent =
        message;

    statusMessage.style.color =
        type === "error"
            ? "#dc2626"
            : type === "success"
                ? "#15803d"
                : "#374151";
}


// ==========================================================
// COLLECT CATEGORY FIELDS
// ==========================================================

function collectCategoryFields() {

    const data = {};

    // Collect all inputs/textareas/selects
    // inside the category details area.

    const containers = [
        document.getElementById("categoryDetails"),
        document.querySelector(".category-details"),
        document.querySelector("#dynamicFields"),
        document.querySelector(".dynamic-fields")
    ].filter(Boolean);


    let elements = [];

    containers.forEach(container => {

        elements.push(
            ...container.querySelectorAll(
                "input, textarea, select"
            )
        );

    });


    // Fallback:
    // collect fields with name attributes

    if (!elements.length) {

        elements =
            Array.from(
                document.querySelectorAll(
                    "input[name], textarea[name], select[name]"
                )
            );

    }


    elements.forEach(element => {

        const name =
            element.getAttribute("name");

        if (!name) {
            return;
        }

        const value =
            String(
                element.value || ""
            ).trim();

        if (!value) {
            return;
        }

        data[name] = value;

    });


    return data;
}


// ==========================================================
// COLLECT PRODUCT DATA
// ==========================================================

function collectProductData() {

    const rawCategory =
        categoryElement
            ? categoryElement.value
            : "";

    const category =
        normalizeCategory(
            rawCategory
        );


    const product = {

        category,

        productName:
            getValue(
                "productName",
                "product-name"
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

        productFeatures:
            getValue(
                "productFeatures",
                "features"
            ),

        extraInfo:
            getValue(
                "extraInfo",
                "extraProductInfo"
            ),

        categoryData:
            collectCategoryFields()

    };


    console.log(
        "📦 FINAL PRODUCT DATA:",
        product
    );


    return product;
}


// ==========================================================
// VALIDATE
// ==========================================================

function validateProduct(product) {

    if (!product.category) {

        return (
            "Product category is required. " +
            "Please select a valid category."
        );

    }


    if (
        !CATEGORIES.includes(
            product.category
        )
    ) {

        return (
            "Invalid product category."
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
// GENERATE
// ==========================================================

async function generateListing() {

    console.log(
        "🚀 Generate Listing clicked"
    );


    const product =
        collectProductData();


    console.log(
        "📂 Category:",
        product.category
    );


    const error =
        validateProduct(product);


    if (error) {

        showStatus(
            "❌ " + error,
            "error"
        );

        return;
    }


    generateButton.disabled =
        true;

    generateButton.textContent =
        "⏳ Generating...";


    showStatus(
        "🤖 AI listing बना रहा है..."
    );


    try {

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
                        JSON.stringify(product)

                }
            );


        console.log(
            "📡 Backend status:",
            response.status
        );


        let data;

        try {

            data =
                await response.json();

        }
        catch {

            throw new Error(
                "Backend ने valid response नहीं दिया।"
            );

        }


        console.log(
            "📥 Backend response:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.details ||
                "Backend request failed."
            );

        }


        if (!data.result) {

            throw new Error(
                "Listing result नहीं मिला।"
            );

        }


        if (listingResult) {

            listingResult.textContent =
                data.result;

        }


        if (resultCard) {

            resultCard.style.display =
                "block";

            resultCard.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


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
                "Backend से connection नहीं हो रहा। Render server को start होने में थोड़ा समय लग सकता है।";

        }


        showStatus(
            "❌ " + message,
            "error"
        );

    }
    finally {

        generateButton.disabled =
            false;

        generateButton.textContent =
            "✨ Generate Complete Listing";

    }
}


// ==========================================================
// BUTTON CONNECTION
// ==========================================================

if (generateButton) {

    generateButton.addEventListener(
        "click",
        generateListing
    );

    console.log(
        "✅ Generate button connected"
    );

}
else {

    console.error(
        "❌ Generate button not found"
    );

}


// ==========================================================
// CATEGORY DEBUG
// ==========================================================

if (categoryElement) {

    categoryElement.addEventListener(
        "change",
        function () {

            console.log(
                "📂 Selected raw category:",
                this.value
            );

            console.log(
                "📂 Normalized category:",
                normalizeCategory(
                    this.value
                )
            );

        }
    );

}


// ==========================================================
// BACKEND TEST
// ==========================================================

async function checkBackend() {

    try {

        const response =
            await fetch(
                "https://ai-seller-toolkit-backend-1.onrender.com/"
            );

        const data =
            await response.json();

        console.log(
            "✅ Backend online:",
            data
        );

    }
    catch (error) {

        console.warn(
            "⚠️ Backend check:",
            error.message
        );

    }
}


checkBackend();


console.log(
    "🤖 AI Seller Toolkit Final Category-Aware JS loaded"
);
