// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE LISTING GENERATOR
// Standalone JavaScript
// Category-Aware + Strict Factual
// ==========================================================

"use strict";

// ==========================================================
// CATEGORY RULES
// ==========================================================

const categoryRules = {

    "Fashion & Clothing": {
        focus: "fabric, color, pattern, fit, occasion, comfort",
        fields: ["Brand", "Fabric", "Color", "Size", "Pattern", "Occasion"]
    },

    "Electronics": {
        focus: "product type, model, connectivity, compatibility, power",
        fields: ["Brand", "Model", "Color", "Connectivity", "Compatibility"]
    },

    "Beauty & Personal Care": {
        focus: "product type, quantity, skin/hair use, ingredients if provided",
        fields: ["Brand", "Quantity", "Variant", "Ingredients", "Suitable For"]
    },

    "Home & Kitchen": {
        focus: "material, size, capacity, use, design",
        fields: ["Brand", "Material", "Color", "Size", "Capacity"]
    },

    "Jewellery & Accessories": {
        focus: "material, design, color, style, occasion",
        fields: ["Brand", "Material", "Color", "Design", "Occasion"]
    },

    "Footwear": {
        focus: "type, material, color, size, sole, occasion",
        fields: ["Brand", "Material", "Color", "Size", "Sole"]
    },

    "Grocery": {
        focus: "product type, quantity, variant, ingredients, packaging",
        fields: ["Brand", "Quantity", "Variant", "Ingredients", "Pack Type"]
    },

    "Toys & Baby Products": {
        focus: "age group, material, design, usage, safety information if provided",
        fields: ["Brand", "Material", "Age Group", "Color", "Size"]
    },

    "Sports & Fitness": {
        focus: "product type, material, size, usage, fitness activity",
        fields: ["Brand", "Material", "Size", "Color", "Sport/Activity"]
    },

    "Books & Stationery": {
        focus: "title, author, language, format, pages, usage",
        fields: ["Author", "Language", "Format", "Pages", "Publisher"]
    },

    "Automotive": {
        focus: "vehicle compatibility, material, model, size, usage",
        fields: ["Brand", "Compatibility", "Material", "Model", "Color"]
    },

    "Other": {
        focus: "product type, material, size, color, usage",
        fields: ["Brand", "Material", "Color", "Size", "Usage"]
    }
};


// ==========================================================
// SAFE VALUE FUNCTION
// ==========================================================

function cleanValue(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}


// ==========================================================
// GET ELEMENT
// ==========================================================

function getElement(...ids) {

    for (const id of ids) {

        const element = document.getElementById(id);

        if (element) {
            return element;
        }
    }

    return null;
}


// ==========================================================
// GET INPUT VALUE
// ==========================================================

function getValue(...ids) {

    const element = getElement(...ids);

    if (!element) {
        return "";
    }

    return cleanValue(element.value);
}


// ==========================================================
// CATEGORY
// ==========================================================

function getCategory() {

    return (
        getValue(
            "category",
            "productCategory",
            "listingCategory"
        ) || "Other"
    );
}


// ==========================================================
// PRODUCT DATA
// ==========================================================

function collectProductData() {

    return {

        category: getCategory(),

        name: getValue(
            "productName",
            "product-name",
            "name"
        ),

        brand: getValue(
            "brand",
            "productBrand"
        ),

        price: getValue(
            "price",
            "productPrice"
        ),

        color: getValue(
            "color",
            "productColor"
        ),

        material: getValue(
            "material",
            "productMaterial"
        ),

        size: getValue(
            "size",
            "productSize"
        ),

        quantity: getValue(
            "quantity",
            "productQuantity"
        ),

        model: getValue(
            "model",
            "productModel"
        ),

        fabric: getValue(
            "fabric",
            "productFabric"
        ),

        pattern: getValue(
            "pattern",
            "productPattern"
        ),

        occasion: getValue(
            "occasion",
            "productOccasion"
        ),

        features: getValue(
            "features",
            "productFeatures",
            "keyFeatures"
        ),

        description: getValue(
            "description",
            "productDescription"
        ),

        keywords: getValue(
            "keywords",
            "seoKeywords"
        )
    };
}


// ==========================================================
// CHECK PRODUCT NAME
// ==========================================================

function validateProductData(data) {

    if (!data.name) {

        showMessage(
            "कृपया Product Name भरें।",
            "error"
        );

        return false;
    }

    return true;
}


// ==========================================================
// TITLE GENERATOR
// ==========================================================

function generateTitle(data) {

    const parts = [];

    if (data.brand) {
        parts.push(data.brand);
    }

    parts.push(data.name);

    if (data.material) {
        parts.push(data.material);
    }

    if (data.color) {
        parts.push(data.color);
    }

    if (data.pattern) {
        parts.push(data.pattern);
    }

    if (data.size) {
        parts.push(data.size);
    }

    let title = parts
        .filter(Boolean)
        .join(" ");

    title = title
        .replace(/\s+/g, " ")
        .trim();

    // Marketplace friendly length
    if (title.length > 150) {

        title = title.substring(0, 147).trim() + "...";
    }

    return title;
}


// ==========================================================
// DESCRIPTION GENERATOR
// ==========================================================

function generateDescription(data) {

    const sentences = [];

    sentences.push(
        `${data.name} ${data.category.toLowerCase()} category का product है।`
    );

    if (data.brand) {

        sentences.push(
            `Brand: ${data.brand}.`
        );
    }

    if (data.color) {

        sentences.push(
            `Color: ${data.color}.`
        );
    }

    if (data.material) {

        sentences.push(
            `Material: ${data.material}.`
        );
    }

    if (data.fabric) {

        sentences.push(
            `Fabric: ${data.fabric}.`
        );
    }

    if (data.size) {

        sentences.push(
            `Size: ${data.size}.`
        );
    }

    if (data.quantity) {

        sentences.push(
            `Quantity: ${data.quantity}.`
        );
    }

    if (data.model) {

        sentences.push(
            `Model: ${data.model}.`
        );
    }

    if (data.occasion) {

        sentences.push(
            `Occasion/Use: ${data.occasion}.`
        );
    }

    if (data.description) {

        sentences.push(
            data.description
        );
    }

    return sentences.join(" ");
}


// ==========================================================
// HIGHLIGHTS
// ==========================================================

function generateHighlights(data) {

    const highlights = [];

    if (data.name) {

        highlights.push(
            `Product: ${data.name}`
        );
    }

    if (data.brand) {

        highlights.push(
            `Brand: ${data.brand}`
        );
    }

    if (data.material) {

        highlights.push(
            `Material: ${data.material}`
        );
    }

    if (data.fabric) {

        highlights.push(
            `Fabric: ${data.fabric}`
        );
    }

    if (data.color) {

        highlights.push(
            `Color: ${data.color}`
        );
    }

    if (data.size) {

        highlights.push(
            `Size: ${data.size}`
        );
    }

    if (data.quantity) {

        highlights.push(
            `Quantity: ${data.quantity}`
        );
    }

    if (data.model) {

        highlights.push(
            `Model: ${data.model}`
        );
    }

    if (data.occasion) {

        highlights.push(
            `Occasion/Use: ${data.occasion}`
        );
    }

    // Add user-provided features only
    if (data.features) {

        const featureList = data.features
            .split(/[,\n]+/)
            .map(item => item.trim())
            .filter(Boolean);

        featureList.forEach(feature => {

            highlights.push(feature);
        });
    }

    return [...new Set(highlights)];
}


// ==========================================================
// SEO KEYWORDS
// ==========================================================

function generateKeywords(data) {

    const keywords = [];

    const values = [

        data.name,
        data.brand,
        data.category,
        data.color,
        data.material,
        data.fabric,
        data.pattern,
        data.size,
        data.model,
        data.occasion
    ];

    values.forEach(value => {

        if (!value) {
            return;
        }

        keywords.push(value);
    });


    // User supplied keywords
    if (data.keywords) {

        data.keywords
            .split(/[,\n]+/)
            .map(item => item.trim())
            .filter(Boolean)
            .forEach(keyword => {

                keywords.push(keyword);
            });
    }


    // Remove duplicate keywords
    return [...new Set(
        keywords.map(keyword =>
            keyword.toLowerCase()
        )
    )];
}


// ==========================================================
// TAG GENERATOR
// ==========================================================

function generateTags(data) {

    const tags = [];

    if (data.category) {
        tags.push(data.category);
    }

    if (data.name) {
        tags.push(data.name);
    }

    if (data.color) {
        tags.push(data.color);
    }

    if (data.material) {
        tags.push(data.material);
    }

    if (data.fabric) {
        tags.push(data.fabric);
    }

    if (data.pattern) {
        tags.push(data.pattern);
    }

    if (data.occasion) {
        tags.push(data.occasion);
    }

    return [...new Set(
        tags.filter(Boolean)
    )];
}


// ==========================================================
// SPECIFICATIONS
// ==========================================================

function generateSpecifications(data) {

    const specifications = {};

    const addSpecification = (name, value) => {

        if (value) {

            specifications[name] = value;
        }
    };


    addSpecification(
        "Category",
        data.category
    );

    addSpecification(
        "Product Name",
        data.name
    );

    addSpecification(
        "Brand",
        data.brand
    );

    addSpecification(
        "Model",
        data.model
    );

    addSpecification(
        "Color",
        data.color
    );

    addSpecification(
        "Material",
        data.material
    );

    addSpecification(
        "Fabric",
        data.fabric
    );

    addSpecification(
        "Pattern",
        data.pattern
    );

    addSpecification(
        "Size",
        data.size
    );

    addSpecification(
        "Quantity",
        data.quantity
    );

    addSpecification(
        "Occasion / Use",
        data.occasion
    );

    return specifications;
}


// ==========================================================
// COMPLETE LISTING
// ==========================================================

function generateCompleteListing(data) {

    return {

        product: {
            name: data.name,
            category: data.category,
            brand: data.brand,
            price: data.price
        },

        title: generateTitle(data),

        description: generateDescription(data),

        highlights: generateHighlights(data),

        seoKeywords: generateKeywords(data),

        tags: generateTags(data),

        specifications: generateSpecifications(data),

        generatedAt: new Date().toISOString()
    };
}


// ==========================================================
// DISPLAY LISTING
// ==========================================================

function displayListing(listing) {

    const titleElement = getElement(
        "generatedTitle",
        "titleOutput",
        "resultTitle"
    );

    const descriptionElement = getElement(
        "generatedDescription",
        "descriptionOutput",
        "resultDescription"
    );

    const highlightsElement = getElement(
        "generatedHighlights",
        "highlightsOutput",
        "resultHighlights"
    );

    const keywordsElement = getElement(
        "generatedKeywords",
        "keywordsOutput",
        "seoOutput",
        "resultKeywords"
    );

    const tagsElement = getElement(
        "generatedTags",
        "tagsOutput",
        "resultTags"
    );

    const specificationsElement = getElement(
        "generatedSpecifications",
        "specificationsOutput",
        "resultSpecifications"
    );


    // TITLE
    if (titleElement) {

        titleElement.value !== undefined
            ? titleElement.value = listing.title
            : titleElement.textContent = listing.title;
    }


    // DESCRIPTION
    if (descriptionElement) {

        descriptionElement.value !== undefined
            ? descriptionElement.value = listing.description
            : descriptionElement.textContent = listing.description;
    }


    // HIGHLIGHTS
    if (highlightsElement) {

        const text = listing.highlights
            .map(item => `• ${item}`)
            .join("\n");

        highlightsElement.value !== undefined
            ? highlightsElement.value = text
            : highlightsElement.textContent = text;
    }


    // KEYWORDS
    if (keywordsElement) {

        const text = listing.seoKeywords
            .join(", ");

        keywordsElement.value !== undefined
            ? keywordsElement.value = text
            : keywordsElement.textContent = text;
    }


    // TAGS
    if (tagsElement) {

        const text = listing.tags
            .join(", ");

        tagsElement.value !== undefined
            ? tagsElement.value = text
            : tagsElement.textContent = text;
    }


    // SPECIFICATIONS
    if (specificationsElement) {

        const text = Object.entries(
            listing.specifications
        )
        .map(
            ([key, value]) =>
                `${key}: ${value}`
        )
        .join("\n");

        specificationsElement.value !== undefined
            ? specificationsElement.value = text
            : specificationsElement.textContent = text;
    }


    // Full result container
    const resultContainer = getElement(
        "listingResult",
        "generatedResult",
        "result"
    );

    if (resultContainer) {

        resultContainer.style.display = "block";
    }
}


// ==========================================================
// GENERATE BUTTON
// ==========================================================

function generateListing() {

    try {

        const data = collectProductData();

        if (!validateProductData(data)) {
            return;
        }

        const listing =
            generateCompleteListing(data);

        displayListing(listing);

        // Save latest listing
        localStorage.setItem(
            "latestCompleteListing",
            JSON.stringify(listing)
        );

        showMessage(
            "✅ Complete product listing तैयार हो गई!",
            "success"
        );

    } catch (error) {

        console.error(
            "Listing Generator Error:",
            error
        );

        showMessage(
            "❌ Listing generate नहीं हो सकी।",
            "error"
        );
    }
}


// ==========================================================
// COPY TEXT
// ==========================================================

async function copyText(text) {

    if (!text) {

        showMessage(
            "Copy करने के लिए कोई text नहीं है।",
            "error"
        );

        return;
    }

    try {

        await navigator.clipboard.writeText(text);

        showMessage(
            "✅ Text copy हो गया!",
            "success"
        );

    } catch (error) {

        // Fallback
        const textarea =
            document.createElement("textarea");

        textarea.value = text;

        document.body.appendChild(
            textarea
        );

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

        showMessage(
            "✅ Text copy हो गया!",
            "success"
        );
    }
}


// ==========================================================
// COPY COMPLETE LISTING
// ==========================================================

function copyCompleteListing() {

    const listing =
        localStorage.getItem(
            "latestCompleteListing"
        );

    if (!listing) {

        showMessage(
            "पहले listing generate करें।",
            "error"
        );

        return;
    }

    const data =
        JSON.parse(listing);

    let text = "";

    text += "PRODUCT TITLE\n";
    text += "====================\n";
    text += data.title + "\n\n";

    text += "DESCRIPTION\n";
    text += "====================\n";
    text += data.description + "\n\n";

    text += "HIGHLIGHTS\n";
    text += "====================\n";

    data.highlights.forEach(item => {

        text += "• " + item + "\n";
    });

    text += "\nSEO KEYWORDS\n";
    text += "====================\n";
    text += data.seoKeywords.join(", ");

    text += "\n\nTAGS\n";
    text += "====================\n";
    text += data.tags.join(", ");

    text += "\n\nSPECIFICATIONS\n";
    text += "====================\n";

    Object.entries(
        data.specifications
    ).forEach(([key, value]) => {

        text += `${key}: ${value}\n`;
    });


    copyText(text);
}


// ==========================================================
// DOWNLOAD LISTING
// ==========================================================

function downloadListing() {

    const stored =
        localStorage.getItem(
            "latestCompleteListing"
        );

    if (!stored) {

        showMessage(
            "पहले listing generate करें।",
            "error"
        );

        return;
    }

    const data =
        JSON.parse(stored);

    let text = "";

    text += "AI SELLER TOOLKIT\n";
    text += "COMPLETE PRODUCT LISTING\n";
    text += "==============================\n\n";

    text += "PRODUCT TITLE\n";
    text += data.title + "\n\n";

    text += "DESCRIPTION\n";
    text += data.description + "\n\n";

    text += "HIGHLIGHTS\n";

    data.highlights.forEach(item => {

        text += "• " + item + "\n";
    });

    text += "\nSEO KEYWORDS\n";
    text += data.seoKeywords.join(", ");

    text += "\n\nTAGS\n";
    text += data.tags.join(", ");

    text += "\n\nSPECIFICATIONS\n";

    Object.entries(
        data.specifications
    ).forEach(([key, value]) => {

        text += `${key}: ${value}\n`;
    });


    const blob =
        new Blob(
            [text],
            {
                type: "text/plain;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "complete-product-listing.txt";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showMessage(
        "✅ Listing download हो गई!",
        "success"
    );
}


// ==========================================================
// CLEAR FORM
// ==========================================================

function clearListingForm() {

    const inputs =
        document.querySelectorAll(
            "input, textarea, select"
        );

    inputs.forEach(input => {

        input.value = "";
    });


    const result =
        getElement(
            "listingResult",
            "generatedResult",
            "result"
        );

    if (result) {

        result.style.display = "none";
    }


    localStorage.removeItem(
        "latestCompleteListing"
    );


    showMessage(
        "🧹 Form साफ हो गया।",
        "success"
    );
}


// ==========================================================
// MESSAGE SYSTEM
// ==========================================================

function showMessage(
    message,
    type = "success"
) {

    let box =
        document.getElementById(
            "listingMessage"
        );


    if (!box) {

        box =
            document.createElement("div");

        box.id =
            "listingMessage";

        box.style.position =
            "fixed";

        box.style.top =
            "20px";

        box.style.right =
            "20px";

        box.style.zIndex =
            "99999";

        box.style.padding =
            "12px 18px";

        box.style.borderRadius =
            "8px";

        box.style.fontSize =
            "15px";

        box.style.fontWeight =
            "600";

        box.style.maxWidth =
            "320px";

        box.style.boxShadow =
            "0 4px 15px rgba(0,0,0,0.15)";

        document.body.appendChild(box);
    }


    box.textContent =
        message;


    if (type === "error") {

        box.style.background =
            "#ffe5e5";

        box.style.color =
            "#b00020";

    } else {

        box.style.background =
            "#e5ffe9";

        box.style.color =
            "#087a20";
    }


    clearTimeout(
        window.listingMessageTimer
    );


    window.listingMessageTimer =
        setTimeout(() => {

            box.remove();

        }, 3000);
}


// ==========================================================
// AUTO CONNECT GENERATE BUTTON
// ==========================================================

function setupGeneratorButton() {

    const button =
        getElement(
            "generateListingBtn",
            "generateButton",
            "generateBtn",
            "generate-listing"
        );


    if (button) {

        button.addEventListener(
            "click",
            generateListing
        );
    }
}


// ==========================================================
// AUTO CONNECT COPY BUTTON
// ==========================================================

function setupCopyButton() {

    const button =
        getElement(
            "copyListingBtn",
            "copyCompleteListing",
            "copyBtn"
        );


    if (button) {

        button.addEventListener(
            "click",
            copyCompleteListing
        );
    }
}


// ==========================================================
// AUTO CONNECT DOWNLOAD BUTTON
// ==========================================================

function setupDownloadButton() {

    const button =
        getElement(
            "downloadListingBtn",
            "downloadBtn"
        );


    if (button) {

        button.addEventListener(
            "click",
            downloadListing
        );
    }
}


// ==========================================================
// AUTO CONNECT CLEAR BUTTON
// ==========================================================

function setupClearButton() {

    const button =
        getElement(
            "clearListingBtn",
            "clearBtn"
        );


    if (button) {

        button.addEventListener(
            "click",
            clearListingForm
        );
    }
}


// ==========================================================
// PAGE LOAD
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupGeneratorButton();

        setupCopyButton();

        setupDownloadButton();

        setupClearButton();

        console.log(
            "✅ Complete Listing Generator loaded successfully."
        );
    }
);


// ==========================================================
// GLOBAL FUNCTIONS
// ==========================================================

window.generateListing =
    generateListing;

window.copyCompleteListing =
    copyCompleteListing;

window.downloadListing =
    downloadListing;

window.clearListingForm =
    clearListingForm;

window.generateCompleteListing =
    generateCompleteListing;

window.collectProductData =
    collectProductData;


// ==========================================================
// END
// ==========================================================
