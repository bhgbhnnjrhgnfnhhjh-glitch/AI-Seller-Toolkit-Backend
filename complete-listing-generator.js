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
        document.getElementById("marketplace").value;

    const result =
        document.getElementById("result");

    const status =
        document.getElementById("status");

    const button =
        document.getElementById("generateBtn");


    // =====================================
    // VALIDATION
    // =====================================

    if (product === "") {

        alert("Please enter Product Name.");

        return;

    }


    // =====================================
    // LOADING
    // =====================================

    button.disabled = true;

    button.innerText =
        "⏳ Generating Listing...";

    status.innerText =
        "⏳ AI complete product listing बना रहा है...";

    result.value =
        "⏳ Please wait...";


    // =====================================
    // STRICT PROMPT
    // =====================================

    const prompt = `

You are a professional eCommerce product listing generator.

Create a factual product listing using ONLY the information provided.

PRODUCT INFORMATION:

Product Name:
${product}

Brand:
${brand || "Not provided"}

Category:
${category || "Not provided"}

Material:
${material || "Not provided"}

Target Audience:
${audience || "Not provided"}

Color:
${color || "Not provided"}

Extra Features:
${features || "Not provided"}

Marketplace:
${marketplace}


==================================================
STRICT FACTUAL RULES
==================================================

1. Use ONLY the information provided above.

2. Never invent information.

3. Never guess missing information.

4. Never add specifications that were not provided.

5. Never invent size.

6. Never invent weight.

7. Never invent dimensions.

8. Never invent price.

9. Never invent discount.

10. Never invent offers.

11. Never invent delivery information.

12. Never invent shipping information.

13. Never invent warranty information.

14. Never invent return information.

15. Never invent payment information.

16. Never invent manufacturer information.

17. Never invent country of origin.

18. Never invent product quality.

19. Never invent durability.

20. Never invent comfort.

21. Never invent performance.

22. Never invent customer experience.

23. Never invent reviews.

24. Never invent certifications.

25. Never invent safety claims.

26. Never invent health claims.

27. Never invent sustainability claims.

28. Never invent fabric properties beyond the provided material.

29. Never invent product features.

30. Never add a feature simply because it is common for this product type.


==================================================
BRAND RULE
==================================================

The Brand field means ONLY the brand name.

Never describe the brand as:

- manufacturer
- maker
- creator
- producer
- seller
- owner

unless that exact information was explicitly provided.

For example:

Brand: Fashion Hud

Correct:
"Brand: Fashion Hud"

Incorrect:
"Made by Fashion Hud"

Incorrect:
"Manufactured by Fashion Hud"

Incorrect:
"Created by Fashion Hud"


==================================================
MARKETPLACE RULE
==================================================

The Marketplace field is ONLY the target marketplace.

Marketplace:
${marketplace}

Do NOT treat the marketplace as:

- product category
- product feature
- brand
- manufacturer
- seller
- product specification
- department
- product attribute

For example:

Marketplace: Amazon

Correct:
The listing is prepared for Amazon.

Incorrect:
"Amazon Men's Category"

Incorrect:
"Listed under Amazon Men's Category"

Incorrect:
"Amazon Men's Clothing"

Do NOT put the marketplace name inside
the product description, bullet points,
features, keywords, hashtags or product tags
unless it is absolutely necessary to identify
the target marketplace.

The marketplace must NOT become a product fact.


==================================================
CATEGORY RULE
==================================================

Use the Category field exactly as provided.

Category:
${category || "Not provided"}

Do not change:

"Men's Clothing"

into:

"Men's Category"

Do not invent a different category.

Do not combine Category with Marketplace.


==================================================
PRODUCT NAME RULE
==================================================

Keep the exact Product Name:

${product}

Do not change the product type.

Do not replace "T-Shirt" with "Shirt".

Do not invent additional product types.


==================================================
MATERIAL RULE
==================================================

Use the exact material provided:

${material || "Not provided"}

Do not add properties such as:

- soft
- breathable
- lightweight
- durable
- comfortable

unless explicitly provided.


==================================================
COLOR RULE
==================================================

Use only the provided color:

${color || "Not provided"}

Do not invent shades or color descriptions.


==================================================
FEATURE RULE
==================================================

Extra Features provided by the user:

${features || "Not provided"}

Only these features may be used.

Do not add any other features.


==================================================
SEO RULES
==================================================

SEO content must remain factual.

Do not use unsupported promotional words such as:

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


==================================================
OUTPUT REQUIREMENTS
==================================================

Create exactly:

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

Create 3 titles.

Titles may combine:

Brand
Product Name
Material
Color
Target Audience

ONLY if those values were provided.

Do not add:

Marketplace
Manufacturer
Price
Offer
Quality claim


==================================================
PRODUCT DESCRIPTION
==================================================

Write a short factual description.

Use only:

Product Name
Brand
Category
Material
Target Audience
Color
Extra Features

Do NOT mention the Marketplace.

Do NOT say:

"manufactured by"
"created by"
"made by"

unless explicitly provided.


==================================================
BULLET POINTS
==================================================

Create 5 factual bullet points.

Use only provided information.

Do not create new specifications.


==================================================
PRODUCT FEATURES
==================================================

Create 5 factual features.

If fewer than 5 unique facts are available,
repeat-free factual combinations are allowed.

Do not invent facts.

Do not mention the Marketplace.


==================================================
SEO KEYWORDS
==================================================

Create 10 relevant keywords.

Keywords may combine provided:

Brand
Product Name
Category
Material
Color
Target Audience

Do not use Marketplace as a product keyword.

Do not invent words that create new product claims.


==================================================
HASHTAGS
==================================================

Create 5 relevant hashtags.

Use only provided product information.

Do not use:

#Best
#Amazing
#Premium
#Trending
#Viral
#Deal
#Offer


==================================================
PRODUCT TAGS
==================================================

Create 10 relevant product tags.

Use only provided information.

Do not add marketplace-based tags.

Do not add unsupported specifications.


==================================================
FINAL OUTPUT FORMAT
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


Return ONLY the product listing.

Do not explain anything.

Do not mention these instructions.

Do not mention AI.

`;


    // =====================================
    // API REQUEST
    // =====================================

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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Backend API Error"
            );

        }


        let answer =
            data.result ||
            data.response ||
            data.text ||
            data.output ||
            "";


        answer =
            String(answer).trim();


        if (!answer) {

            throw new Error(
                "AI response नहीं मिला।"
            );

        }


        // =====================================
        // REMOVE CODE BLOCK
        // =====================================

        answer =
            answer.replace(
                /^```(?:markdown|text)?\s*/i,
                ""
            );

        answer =
            answer.replace(
                /\s*```$/i,
                ""
            );


        // =====================================
        // REMOVE OBVIOUS UNSUPPORTED PHRASES
        // =====================================

        const forbiddenLines = [

            /manufactured by/i,
            /manufactured in/i,
            /created by/i,
            /made by/i,
            /produced by/i,
            /amazon men's category/i,
            /amazon category/i,
            /flipkart category/i,
            /meesho category/i,
            /shopify category/i,
            /etsy category/i

        ];


        const lines =
            answer.split(/\r?\n/);


        const cleanedLines =
            lines.filter(line => {

                return !forbiddenLines.some(
                    pattern =>
                        pattern.test(line)
                );

            });


        answer =
            cleanedLines.join("\n");


        // =====================================
        // REMOVE EXTRA BLANK LINES
        // =====================================

        answer =
            answer.replace(
                /\n{3,}/g,
                "\n\n"
            );


        answer =
            answer.trim();


        // =====================================
        // FINAL CHECK
        // =====================================

        const unsafePatterns = [

            /manufactured by/i,
            /created by/i,
            /made by fashion hud/i,
            /amazon men's category/i,
            /amazon category/i,
            /flipkart category/i,
            /meesho category/i,
            /shopify category/i,
            /etsy category/i

        ];


        const unsafeFound =
            unsafePatterns.some(
                pattern =>
                    pattern.test(answer)
            );


        if (unsafeFound) {

            throw new Error(
                "AI ने unsupported information बनाई है। कृपया फिर से Generate करें।"
            );

        }


        // =====================================
        // SHOW RESULT
        // =====================================

        result.value =
            answer;


        status.innerText =
            "✅ Complete Product Listing successfully generated.";


    } catch (error) {

        console.error(
            "Complete Listing Generator Error:",
            error
        );


        result.value =
            "❌ Product Listing generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;


        status.innerText =
            "❌ Backend API Error";


    } finally {

        button.disabled = false;

        button.innerText =
            "🚀 Generate Complete Listing";

    }

}


// ==========================================
// COPY LISTING
// ==========================================

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

        result.select();

        document.execCommand("copy");

        alert(
            "✅ Complete Product Listing copied!"
        );

    }

}
