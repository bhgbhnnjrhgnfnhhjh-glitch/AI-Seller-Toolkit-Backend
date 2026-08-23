// ==========================================================
// AI SELLER TOOLKIT
// COMPLETE PRODUCT LISTING GENERATOR
// Category-Aware + Strict Factual AI
// ==========================================================


// ==========================================================
// CATEGORY RULES
// ==========================================================

const categoryRules = {

    "Fashion & Clothing": `
Focus on clothing information such as:
product type, fabric/material, target audience, gender,
color, size, fit, pattern, sleeve type, neck type,
closure, wash care and other clothing specifications.

IMPORTANT:
Use these only when the user provides them.
Never invent size, fit, fabric properties, pattern or wash care.
`,

    "Beauty & Cosmetics": `
Focus on beauty/cosmetic information such as:
product type, ingredients, quantity, skin type, hair type,
shade, fragrance, usage information and packaging information.

IMPORTANT:
Use ingredients, skin claims, hair claims, benefits,
dermatological claims or safety claims ONLY when provided.
Never invent health or cosmetic benefits.
`,

    "Electronics": `
Focus on electronics information such as:
product type, model, brand, color, material,
connectivity, compatibility, power, battery,
capacity, ports, display, operating system and other specifications.

IMPORTANT:
Use technical specifications ONLY when provided.
Never invent model numbers, compatibility, battery capacity,
power, warranty or performance.
`,

    "Home & Kitchen": `
Focus on information such as:
product type, material, color, capacity, dimensions,
quantity, usage, design, included items and specifications.

IMPORTANT:
Use capacity, dimensions, quantity and included items
ONLY when provided.
Never invent measurements or capacity.
`,

    "Shoes & Footwear": `
Focus on information such as:
shoe type, material, target audience, gender, color,
size, sole, closure, pattern and other footwear information.

IMPORTANT:
Never invent shoe size, sole material, fit or comfort claims.
Use them only when provided.
`,

    "Jewellery": `
Focus on information such as:
jewellery type, material, metal, stone, color,
size, design, quantity and other provided details.

IMPORTANT:
Never invent gold/silver purity, gemstone type,
weight, certification or authenticity.
`,

    "Toys & Kids": `
Focus on information such as:
toy type, age range, material, color, dimensions,
quantity, included items and other provided information.

IMPORTANT:
Never invent age suitability, safety certification,
educational benefits or safety claims.
`,

    "Books & Stationery": `
Focus on information such as:
book/stationery type, title, author, publisher,
language, pages, format, subject, quantity and material.

IMPORTANT:
Never invent author, publisher, page count or edition.
`,

    "Pet Products": `
Focus on information such as:
pet product type, animal type, material, size,
color, quantity, usage and provided specifications.

IMPORTANT:
Never invent health benefits, medical claims,
age suitability or safety claims.
`,

    "Sports & Fitness": `
Focus on information such as:
equipment type, sport, material, size, weight,
dimensions, color, target user and included items.

IMPORTANT:
Never invent weight, dimensions, performance,
fitness benefits or safety certifications.
`,

    "Automotive": `
Focus on information such as:
part/accessory type, vehicle compatibility,
model, year, material, dimensions, color,
quantity and other provided specifications.

IMPORTANT:
Never invent vehicle compatibility, model,
part number or installation information.
`,

    "Garden & Outdoor": `
Focus on information such as:
product type, material, dimensions, quantity,
color, usage and other provided specifications.

IMPORTANT:
Never invent durability, weather resistance,
capacity or performance claims.
`,

    "Food & Grocery": `
Focus on information such as:
food/product type, ingredients, quantity,
flavor, variant, packaging, dietary information
and other provided information.

IMPORTANT:
Never invent ingredients, nutrition facts,
health claims, expiry dates or certifications.
`,

    "Gifts & Handmade": `
Focus on information such as:
product type, material, color, design,
occasion, quantity, personalization and other
provided information.

IMPORTANT:
Never invent handmade status, personalization,
material or occasion suitability unless provided.
`,

    "Other": `
Use only the product information provided by the user.
Do not assume specifications based on the product name.
`
};


// ==========================================================
// GET CATEGORY RULE
// ==========================================================

function getCategoryRule(category) {

    return categoryRules[category] ||
        categoryRules["Other"];

}


// ==========================================================
// GENERATE LISTING
// ==========================================================

async function generateListing() {

    const product =
        document.getElementById("product").value.trim();

    const brand =
        document.getElementById("brand").value.trim();

    const category =
        document.getElementById("category").value.trim();

    const material =
        document.getElementById("material").value.trim();

    const audience =
        document.getElementById("audience").value.trim();

    const color =
        document.getElementById("color").value.trim();

    const features =
        document.getElementById("features").value.trim();

    const marketplace =
        document.getElementById("marketplace").value.trim();

    const result =
        document.getElementById("result");

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("generateBtn");


    // ======================================================
    // VALIDATION
    // ======================================================

    if (!product) {

        status.style.color = "#dc2626";

        status.innerText =
            "❌ कृपया Product Name डालें।";

        document.getElementById("product").focus();

        return;
    }


    if (!category) {

        status.style.color = "#dc2626";

        status.innerText =
            "❌ कृपया Product Category चुनें।";

        document.getElementById("category").focus();

        return;
    }


    if (!marketplace) {

        status.style.color = "#dc2626";

        status.innerText =
            "❌ कृपया Marketplace चुनें।";

        document.getElementById("marketplace").focus();

        return;
    }


    // ======================================================
    // CATEGORY INSTRUCTIONS
    // ======================================================

    const categoryInstruction =
        getCategoryRule(category);


    // ======================================================
    // LOADING
    // ======================================================

    button.disabled = true;

    button.innerText =
        "⏳ Generating Listing...";

    status.style.color = "#2563eb";

    status.innerText =
        "⏳ Product category के अनुसार listing तैयार हो रही है...";

    result.value =
        "⏳ Please wait...";


    // ======================================================
    // AI PROMPT
    // ======================================================

    const prompt = `

You are a professional eCommerce product listing generator.

Your job is to create a factual product listing.

The listing must be useful for online sellers.

==================================================
PRODUCT INFORMATION
==================================================

Product Name:
${product}

Brand:
${brand || "Not provided"}

Category:
${category}

Material / Main Specification:
${material || "Not provided"}

Target Audience:
${audience || "Not provided"}

Color:
${color || "Not provided"}

Product Features / Specifications:
${features || "Not provided"}

Target Marketplace:
${marketplace}


==================================================
CATEGORY-SPECIFIC INSTRUCTIONS
==================================================

${categoryInstruction}


==================================================
MOST IMPORTANT FACTUAL RULE
==================================================

USE ONLY INFORMATION PROVIDED BY THE USER.

Never guess.

Never assume.

Never complete missing specifications using common knowledge.

The product name does NOT automatically provide specifications.

For example:

If product name is "Bluetooth Speaker",
do NOT automatically assume:

Bluetooth version
battery capacity
wattage
USB port
water resistance
play time
microphone
range

unless the user provided those details.


==================================================
DO NOT INVENT
==================================================

Never invent:

- size
- weight
- dimensions
- quantity
- capacity
- model number
- SKU
- part number
- ingredients
- certifications
- warranty
- return policy
- price
- discount
- offers
- delivery information
- shipping information
- manufacturer
- country of origin
- compatibility
- battery capacity
- power
- performance
- durability
- comfort
- quality
- safety claims
- health claims
- customer reviews
- ratings
- awards
- guarantees


==================================================
BRAND RULE
==================================================

Brand means ONLY the brand name.

If Brand is:

${brand || "Not provided"}

Do NOT say:

manufactured by
made by
created by
produced by
owned by

unless the user explicitly provided that information.


==================================================
CATEGORY RULE
==================================================

Use the selected category exactly:

${category}

Do not change it.

Do not combine it with the marketplace.

Do not turn the marketplace into a category.

Example:

Category:
Fashion & Clothing

Marketplace:
Amazon

Correct:
Category: Fashion & Clothing

Incorrect:
Amazon Fashion Category


==================================================
MARKETPLACE RULE
==================================================

The marketplace is ONLY the target platform.

Marketplace:

${marketplace}

Do not treat it as:

- brand
- product feature
- material
- category
- specification
- manufacturer
- product attribute

Do not put the marketplace name inside:

- product description
- bullet points
- features
- keywords
- hashtags
- tags

unless necessary to identify the target marketplace.

The marketplace is NOT a product fact.


==================================================
PRODUCT NAME RULE
==================================================

Keep the product name accurate.

Product Name:

${product}

Do not replace one product type with another.

For example:

"T-Shirt" must remain T-Shirt.

Do not change it to Shirt.

"Wireless Earbuds" must remain Wireless Earbuds.

Do not change it to Headphones.


==================================================
MATERIAL RULE
==================================================

Material provided:

${material || "Not provided"}

Use only the provided material.

Do not automatically add:

soft
comfortable
durable
lightweight
breathable
premium
high quality

unless explicitly provided.


==================================================
COLOR RULE
==================================================

Color provided:

${color || "Not provided"}

Use only the exact provided color.

Do not invent shades.


==================================================
FEATURE RULE
==================================================

Features provided by user:

${features || "Not provided"}

Only these features can be used.

If the user provides multiple features,
you may organize them clearly.

Do not create additional features.


==================================================
TARGET AUDIENCE RULE
==================================================

Target Audience:

${audience || "Not provided"}

Use only the provided audience.

Do not create age, gender or demographic information
unless provided.


==================================================
SEO RULES
==================================================

SEO must remain factual.

Do not use unsupported promotional claims such as:

Best
Premium
Amazing
Luxury
Superior
High Quality
Perfect
Guaranteed
No.1
Top
Exclusive
Trending
Viral
Affordable
Durable
Comfortable

unless the user explicitly provided the claim as factual
product information.


==================================================
OUTPUT
==================================================

Generate exactly:

3 SEO PRODUCT TITLES

1 PRODUCT DESCRIPTION

5 BULLET POINTS

5 PRODUCT FEATURES

10 SEO KEYWORDS

5 HASHTAGS

10 PRODUCT TAGS


==================================================
SEO PRODUCT TITLES
==================================================

Create 3 different titles.

Titles may use only provided:

Brand
Product Name
Category
Material
Target Audience
Color
Provided Features

Do NOT add unsupported information.

Do NOT add:

price
discount
offer
warranty
manufacturer
marketplace
performance claims


==================================================
PRODUCT DESCRIPTION
==================================================

Write a clear factual description.

Use only:

Product Name
Brand
Category
Material
Target Audience
Color
Provided Features

Do NOT mention the marketplace.

Do not create benefits that were not provided.


==================================================
BULLET POINTS
==================================================

Create exactly 5 bullet points.

Every bullet must contain factual information
from the user input.

If there are fewer than 5 facts,
create useful combinations of existing facts.

Never invent new facts.


==================================================
PRODUCT FEATURES
==================================================

Create exactly 5 features.

Use only existing information.

If fewer than 5 independent facts exist,
combine existing facts without adding anything new.

Never invent specifications.


==================================================
SEO KEYWORDS
==================================================

Create exactly 10 keywords.

Keywords can combine:

Brand
Product Name
Category
Material
Target Audience
Color
Provided Features

Do not use unsupported claims.

Do not use marketplace names as product facts.


==================================================
HASHTAGS
==================================================

Create exactly 5 hashtags.

Use only information present in the product data.

Do not use unsupported hashtags such as:

#Best
#Premium
#Amazing
#Trending
#Viral
#Deal
#Offer


==================================================
PRODUCT TAGS
==================================================

Create exactly 10 tags.

Use only provided information.

Do not create unsupported specifications.

Do not use marketplace names as product tags.


==================================================
FINAL FORMAT
==================================================

SEO PRODUCT TITLES:

1.
2.
3.


PRODUCT DESCRIPTION:




BULLET POINTS:

1.
2.
3.
4.
5.


PRODUCT FEATURES:

1.
2.
3.
4.
5.


SEO KEYWORDS:

1.
2.
3.
4.
5.
6.
7.
8.
9.
10.


HASHTAGS:

1.
2.
3.
4.
5.


PRODUCT TAGS:

1.
2.
3.
4.
5.
6.
7.
8.
9.
10.


Return ONLY the final listing.

Do not explain the rules.

Do not mention this prompt.

Do not mention AI.
`;


    // ======================================================
    // API REQUEST
    // ======================================================

    try {

        const response = await fetch(
            "https://ai-seller-toolkit-backend-1.onrender.com/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    prompt: prompt
                })
            }
        );


        // ==================================================
        // READ RESPONSE SAFELY
        // ==================================================

        const rawText =
            await response.text();

        let data = {};

        try {

            data =
                JSON.parse(rawText);

        } catch (jsonError) {

            throw new Error(
                "Backend ने valid JSON response नहीं दिया।"
            );

        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Backend API Error"
            );

        }


        // ==================================================
        // GET AI RESPONSE
        // ==================================================

        let answer =
            data.result ||
            data.response ||
            data.text ||
            data.output ||
            data.content ||
            "";


        answer =
            String(answer).trim();


        if (!answer) {

            throw new Error(
                "AI response नहीं मिला।"
            );

        }


        // ==================================================
        // REMOVE MARKDOWN CODE BLOCK
        // ==================================================

        answer =
            answer.replace(
                /^```(?:markdown|text|html)?\s*/i,
                ""
            );

        answer =
            answer.replace(
                /\s*```$/i,
                ""
            );


        // ==================================================
        // REMOVE AI INTRODUCTION
        // ==================================================

        answer =
            answer.replace(
                /^(Here is|Sure|Certainly|Here’s)[\s\S]*?(?=SEO PRODUCT TITLES:)/i,
                ""
            );


        // ==================================================
        // REMOVE UNSUPPORTED BRAND CLAIMS
        // ==================================================

        const forbiddenPatterns = [

            /manufactured by/gi,
            /manufactured in/gi,
            /made by/gi,
            /created by/gi,
            /produced by/gi,
            /best quality/gi,
            /premium quality/gi,
            /high quality/gi,
            /guaranteed/gi,
            /number one/gi,
            /no\.?\s*1/gi
        ];


        for (const pattern of forbiddenPatterns) {

            answer =
                answer.replace(
                    pattern,
                    ""
                );

        }


        // ==================================================
        // REMOVE MARKETPLACE FROM PRODUCT CONTENT
        // ==================================================

        const marketplaces = [
            "Amazon",
            "Flipkart",
            "Meesho",
            "Shopify",
            "Etsy"
        ];


        const lines =
            answer.split(/\r?\n/);


        const cleanedLines =
            lines.filter(line => {

                const lower =
                    line.toLowerCase();


                // Do not remove marketplace from title
                // if it accidentally appears as heading.
                // Remove obvious marketplace-as-product claims.

                for (const platform of marketplaces) {

                    const platformLower =
                        platform.toLowerCase();


                    if (
                        lower.includes(
                            platformLower + " category"
                        ) ||
                        lower.includes(
                            platformLower + " product"
                        ) ||
                        lower.includes(
                            "made for " +
                            platformLower
                        )
                    ) {

                        return false;

                    }

                }

                return true;

            });


        answer =
            cleanedLines.join("\n");


        // ==================================================
        // CLEAN EXTRA BLANK LINES
        // ==================================================

        answer =
            answer.replace(
                /\n{3,}/g,
                "\n\n"
            );


        answer =
            answer.trim();


        // ==================================================
        // FINAL SAFETY CHECK
        // ==================================================

        const unsafePatterns = [

            /manufactured by/i,
            /manufactured in/i,
            /made by/i,
            /created by/i,
            /produced by/i,
            /best quality/i,
            /premium quality/i,
            /guaranteed/i
        ];


        const unsafeFound =
            unsafePatterns.some(
                pattern =>
                    pattern.test(answer)
            );


        if (unsafeFound) {

            throw new Error(
                "Listing में unsupported information मिली। कृपया दोबारा Generate करें।"
            );

        }


        // ==================================================
        // SHOW RESULT
        // ==================================================

        result.value =
            answer;


        status.style.color =
            "#16a34a";

        status.innerText =
            "✅ " +
            category +
            " category की listing तैयार हो गई।";


    } catch (error) {

        console.error(
            "Complete Listing Generator Error:",
            error
        );


        result.value =
            "❌ Product Listing generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;


        status.style.color =
            "#dc2626";

        status.innerText =
            "❌ Listing generate नहीं हो सकी।";


    } finally {

        button.disabled = false;

        button.innerText =
            "🚀 Generate Complete Listing";

    }

}


// ==========================================================
// COPY LISTING
// ==========================================================

async function copyListing() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


    if (!text) {

        alert(
            "पहले Complete Product Listing generate करें।"
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        alert(
            "✅ Complete Product Listing copied!"
        );


    } catch (error) {

        result.focus();

        result.select();

        document.execCommand("copy");


        alert(
            "✅ Complete Product Listing copied!"
        );

    }

}


// ==========================================================
// CATEGORY CHANGE MESSAGE
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const categorySelect =
            document.getElementById("category");

        const categoryHelp =
            document.getElementById("categoryHelp");

        const categoryBadge =
            document.getElementById("categoryBadge");


        if (!categorySelect) {
            return;
        }


        categorySelect.addEventListener(
            "change",
            function () {

                const category =
                    this.value.trim();


                if (!category) {

                    if (categoryBadge) {

                        categoryBadge.style.display =
                            "none";

                    }

                    if (categoryHelp) {

                        categoryHelp.innerText =
                            "Product की सही category चुनें।";

                    }

                    return;

                }


                if (categoryBadge) {

                    categoryBadge.style.display =
                        "inline-block";

                    categoryBadge.innerText =
                        "✅ Selected Category: " +
                        category;

                }


                if (categoryHelp) {

                    categoryHelp.innerText =
                        "AI अब " +
                        category +
                        " के अनुसार listing तैयार करेगा।";

                }

            }
        );

    }
);
