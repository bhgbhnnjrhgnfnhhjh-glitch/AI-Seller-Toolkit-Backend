async function generateReview() {

    const product =
        document.getElementById("product").value.trim();

    const brand =
        document.getElementById("brand").value.trim();

    const rating =
        document.getElementById("rating").value;

    const style =
        document.getElementById("style").value;

    const result =
        document.getElementById("result");


    if (product === "") {

        alert("Please enter Product Name.");

        return;
    }


    result.value =
        "⏳ AI review बनाया जा रहा है...";


    const prompt = `
You are a factual eCommerce review formatter.

Your job is NOT to invent a customer experience.

Create a very short review using ONLY the information explicitly supplied below.

PRODUCT NAME:
${product}

BRAND:
${brand || "Not specified"}

RATING:
${rating}

STYLE:
${style}


ABSOLUTE RULES
==============

1. NEVER invent facts.

2. NEVER invent a customer experience.

3. NEVER say that the customer purchased, used, tested,
received or tried the product.

4. NEVER describe product quality unless quality information
was explicitly provided.

5. NEVER use these words or phrases:

excellent
amazing
best
great
premium
high quality
superb
outstanding
durable
comfortable
stylish
beautiful
worth the price
value for money
highly recommended
recommended
perfect
impressive
satisfied
very satisfied
exceeded expectations

6. NEVER invent material, color, size, features, specifications,
price, delivery, packaging, warranty or benefits.

7. NEVER change the product type.

8. Keep the exact Product Name as supplied.

9. Mention the Brand only if supplied.

10. The rating is ONLY a rating selected by the user.
Do NOT use the rating as proof of product quality.

11. Do NOT say:
"deserves a five-star rating"
"merits a five-star rating"
"five-star product"
"excellent product"

12. Do NOT turn the rating into a quality claim.

13. Do not mention AI.

14. Do not use emojis.

15. Do not add explanations.

16. Keep the review extremely short.

17. If there is not enough information for a normal review,
simply state the available product information.


STYLE RULES
===========

Professional:
Use formal factual wording.

Customer Experience:
DO NOT invent a customer experience.
Use factual product wording instead.

Short Review:
Use one short factual sentence.


OUTPUT
======

Return ONLY the review text.

Do not return a heading.
Do not return quotation marks.
Do not return explanations.
`;


    try {

        const response =
            await fetch(
                "https://ai-seller-toolkit-backend-1.onrender.com/generate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
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
                data.details ||
                data.error ||
                "Server error"
            );

        }


        if (
            !data.result ||
            !data.result.trim()
        ) {

            throw new Error(
                "AI returned an empty response."
            );

        }


        let review =
            cleanReviewOutput(data.result);


        /*
        ========================================
        EXTRA SAFETY CHECK
        ========================================

        Remove common unsupported marketing claims
        if Gemini adds them despite the prompt.
        */

        review =
            removeUnsafeClaims(review);


        result.value = review;
// Remove rating information from final review
review = review
    .replace(/\bhas a rating of\s*\d+\s*\/\s*5\b/gi, "")
    .replace(/\bwith a rating of\s*\d+\s*\/\s*5\b/gi, "")
    .replace(/\breceives a\s*(?:five|5)[ -]?star rating\b/gi, "")
    .replace(/\b(?:five|5)[ -]?star rating\b/gi, "")
    .replace(/\brated\s*\d+\s*\/\s*5\b/gi, "")
    .replace(/\brating\s*(?:is|of)\s*\d+\s*\/\s*5\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();


// If nothing useful remains, use factual product information
if (review === "" || review.length < 5) {

    review =
        product +
        (brand ? " by " + brand : "") +
        ".";

}


result.value = review;
    } catch (error) {

        console.error(
            "Review AI Error:",
            error
        );


        result.value =
            "❌ Review generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =================================
   CLEAN GEMINI RESPONSE
================================= */

function cleanReviewOutput(text) {

    let cleaned =
        text.trim();


    // Remove markdown code fences

    cleaned =
        cleaned.replace(
            /^```[a-zA-Z]*\s*/i,
            ""
        );


    cleaned =
        cleaned.replace(
            /\s*```$/i,
            ""
        );


    // Remove accidental quotation marks

    cleaned =
        cleaned.replace(/^["']|["']$/g, "");


    return cleaned.trim();

}


/* =================================
   REMOVE UNSAFE CLAIMS
================================= */

function removeUnsafeClaims(text) {

    let cleaned =
        text.trim();


    const unsafePatterns = [

        /\bexcellent\b/gi,

        /\bamazing\b/gi,

        /\bbest\b/gi,

        /\bgreat\b/gi,

        /\bpremium\b/gi,

        /\bhigh[\s-]?quality\b/gi,

        /\bsuperb\b/gi,

        /\boutstanding\b/gi,

        /\bdurable\b/gi,

        /\bcomfortable\b/gi,

        /\bstylish\b/gi,

        /\bbeautiful\b/gi,

        /\bworth the price\b/gi,

        /\bvalue for money\b/gi,

        /\bhighly recommended\b/gi,

        /\brecommended\b/gi,

        /\bperfect\b/gi,

        /\bimpressive\b/gi,

        /\bsatisfied\b/gi,

        /\bvery satisfied\b/gi,

        /\bexceeded expectations\b/gi,

        /\bmerits a five-star rating\b/gi,

        /\bdeserves a five-star rating\b/gi,

        /\bfive-star product\b/gi

    ];


    unsafePatterns.forEach(function(pattern) {

        cleaned =
            cleaned.replace(pattern, "");

    });


    // Remove excessive spaces

    cleaned =
        cleaned.replace(/\s{2,}/g, " ");


    // Clean awkward spaces before punctuation

    cleaned =
        cleaned.replace(/\s+([,.!?])/g, "$1");


    return cleaned.trim();

}


/* =================================
   COPY REVIEW
================================= */

function copyReview() {

    const result =
        document.getElementById("result");


    const text =
        result.value.trim();


    if (text === "") {

        alert(
            "पहले review generate करें।"
        );

        return;
    }


    if (
        text.includes(
            "❌ Review generate नहीं हो सकी"
        )
    ) {

        alert(
            "पहले Review successfully generate करें।"
        );

        return;
    }


    navigator.clipboard
        .writeText(text)

        .then(function() {

            alert(
                "✅ Review copied successfully!"
            );

        })

        .catch(function() {

            alert(
                "❌ Copy नहीं हो सका।"
            );

        });

    }
