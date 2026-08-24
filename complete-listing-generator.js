// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE LISTING GENERATOR
// FINAL VERSION 5
// Backend Version 4 Compatible
// ==========================================================


// ==========================================================
// RENDER BACKEND
// ==========================================================

const API_URL =
    "https://ai-seller-toolkit-backend-1.onrender.com/api/generate-listing";


// ==========================================================
// SUPPORTED CATEGORIES
// ==========================================================

const CATEGORY_MAP = {

    "Fashion": "Fashion & Clothing",
    "Fashion & Clothing": "Fashion & Clothing",

    "Beauty": "Beauty",

    "Electronics": "Electronics",

    "Home & Kitchen": "Home & Kitchen",

    "Shoes": "Footwear",
    "Footwear": "Footwear",

    "Jewellery": "Jewellery",
    "Jewelry": "Jewellery",

    "Toys": "Toys & Kids",
    "Toys & Kids": "Toys & Kids",

    "Books": "Books & Stationery",
    "Books & Stationery": "Books & Stationery",

    "Pet": "Other",

    "Sports": "Sports & Fitness",
    "Sports & Fitness": "Sports & Fitness",

    "Automotive": "Automotive",

    "Garden": "Other",

    "Food": "Grocery & Food",
    "Grocery & Food": "Grocery & Food",

    "Gifts": "Other",

    "Other": "Other"
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
    "🏋️": "Sports",
    "🚗": "Automotive",
    "🌱": "Garden",
    "🍎": "Food",
    "🎁": "Gifts"
};


// ==========================================================
// REMOVE EMOJI
// ==========================================================

function removeCategoryIcon(value) {

    if (!value) {
        return "";
    }

    let text =
        String(value).trim();

    for (const icon of Object.keys(CATEGORY_ICONS)) {

        if (text.startsWith(icon)) {

            text =
                text.substring(
                    icon.length
                ).trim();

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


    // Direct mapping

    if (
        CATEGORY_MAP[category]
    ) {

        return CATEGORY_MAP[
            category
        ];
    }


    // Case-insensitive search

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


    // ------------------------------------------------------
    // FALLBACK
    // ------------------------------------------------------

    const selects =
        document.querySelectorAll(
            "select"
        );


    for (
        const select of selects
    ) {

        const text =
            select.innerText || "";


        if (

            text.includes(
                "Fashion"
            )

            ||

            text.includes(
                "Beauty"
            )

            ||

            text.includes(
                "Electronics"
            )

            ||

            text.includes(
                "Home & Kitchen"
            )

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

    for (
        const id of ids
    ) {

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
// GET ALL INPUT DATA
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


    // ------------------------------------------------------
    // FALLBACK
    // ------------------------------------------------------

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
                element.getAttribute(
                    "name"
                );


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


            data[name] =
                value;

        }
    );


    return data;
}


// ==========================================================
// COLLECT PRODUCT DATA
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

            collectCategoryFields()

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


    if (
        !product.productName
    ) {

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

function displayListing(
    listing
) {

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


    // ------------------------------------------------------
    // CREATE READABLE RESULT
    // ------------------------------------------------------

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
        )

        &&

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
        )

        &&

        listing.keywords.length
    ) {

        output +=
            "KEYWORDS\n\n" +

            listing.keywords.join(
                ", "
            ) +

            "\n\n";

    }


    if (
        Array.isArray(
            listing.hashtags
        )

        &&

        listing.hashtags.length
    ) {

        output +=
            "HASHTAGS\n\n" +

            listing.hashtags.join(
                " "
            ) +

            "\n\n";

    }


    if (listing.seoTitle) {

        output +=
            "SEO TITLE\n\n" +

            listing.seoTitle +

            "\n\n";

    }


    if (
        listing.seoDescription
    ) {

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


    // ------------------------------------------------------
    // VALIDATE
    // ------------------------------------------------------

    const error =
        validateProduct(
            product
        );


    if (error) {

        showStatus(
            "❌ " + error,
            "error"
        );

        return;

    }


    // ------------------------------------------------------
    // BUTTON
    // ------------------------------------------------------

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
        // SEND TO VERSION 4 BACKEND
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
                        JSON.stringify({

                            category:
                                product.category,

                            productName:
                                product.productName,

                            productDetails:
                                [
                                    product.productDetails,

                                    product.productFeatures,

                                    product.extraInfo,

                                    JSON.stringify(
                                        product.categoryData
                                    )

                                ]
                                    .filter(Boolean)
                                    .join("\n\n"),

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

                        })

                }

            );


        console.log(
            "📡 Backend Status:",
            response.status
        );


        // --------------------------------------------------
        // RESPONSE
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
        // ERROR
        // --------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Backend request failed."
            );

        }


        // --------------------------------------------------
        // CHECK LISTING
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


        // --------------------------------------------------
        // SUCCESS
        // --------------------------------------------------

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
// BUTTON CONNECTION
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
                "https://ai-seller-toolkit-backend-1.onrender.com/"
            );


        if (!response.ok) {

            throw new Error(
                "Backend unavailable"
            );

        }


        const data =
            await response.json();


        console.log(
            "✅ AI Seller Toolkit Backend Online:",
            data
        );


    }

    catch (error) {

        console.warn(
            "⚠️ Backend Check:",
            error.message
        );

    }

}


// ==========================================================
// START BACKEND CHECK
// ==========================================================

checkBackend();


// ==========================================================
// FINAL LOG
// ==========================================================

console.log(
    "🤖 AI Seller Toolkit Complete Listing Generator — Final Version 5 Loaded"
);
