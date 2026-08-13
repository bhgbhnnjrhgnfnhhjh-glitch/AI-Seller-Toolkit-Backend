/* =========================================
   AI PRODUCT REVIEW GENERATOR
   ========================================= */

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


    /* =========================
       VALIDATION
    ========================= */

    if (product === "") {

        alert("Please enter Product Name.");
        return;

    }


    result.value =
        "⏳ AI review बना रहा है...";


    /* =========================
       CLEAN RATING
    ========================= */

    let cleanRating = "5/5";

    if (rating.includes("4/5")) {
        cleanRating = "4/5";
    }

    if (rating.includes("3/5")) {
        cleanRating = "3/5";
    }


    /* =========================
       AI PROMPT
    ========================= */

    const prompt = `
You are a professional eCommerce review writer.

Create ONE short, natural and factual product review.

PRODUCT INFORMATION
-------------------

Product Name:
${product}

Brand:
${brand || "Not specified"}

Rating:
${cleanRating}

Review Style:
${style}


STRICT FACTUAL RULES
--------------------

1. Use ONLY the information provided above.

2. Do NOT invent any information.

3. Do NOT invent:
- quality
- comfort
- durability
- softness
- performance
- fit
- design
- appearance
- price
- value for money
- delivery
- packaging
- customer experience
- usage duration
- warranty
- return policy
- product features

unless that information was explicitly provided.

4. Do NOT say:
"I purchased this product"
unless purchase information was provided.

5. Do NOT say:
"I have been using this product"
unless usage information was provided.

6. Do NOT say:
"I am satisfied"
unless satisfaction information was provided.

7. Do NOT say:
"I recommend this product"
unless recommendation information was provided.

8. Do NOT use fake customer experience.

9. Keep the EXACT product name:
${product}

10. Keep the EXACT brand name:
${brand || "Not specified"}

11. Do NOT change the product type.

12. Do NOT add another brand.

13. Do NOT add product specifications.

14. Do NOT add claims such as:
- excellent quality
- premium quality
- comfortable
- durable
- stylish
- best product
- worth the money
- great value
- highly recommended

unless explicitly provided.

15. Do NOT mention AI.

16. Do NOT use emojis.

17. Keep the review short.

18. Do not repeat the same information.

19. The rating must remain exactly:
${cleanRating}

20. If there is not enough information for a genuine customer
experience review, create a SHORT FACTUAL review using only
the supplied information.

IMPORTANT:

The review must NOT pretend that a real customer used or
purchased the product.

OUTPUT FORMAT
-------------

Rating: ${cleanRating}

Review: [short factual review]

Return ONLY the Rating and Review.
Do not add explanations.
`;


    /* =========================
       API REQUEST
    ========================= */

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


        /* =========================
           READ RESPONSE SAFELY
        ========================= */

        let data;

        try {

            data = await response.json();

        } catch (jsonError) {

            throw new Error(
                "Backend ने valid response नहीं दिया।"
            );

        }


        /* =========================
           API ERROR
        ========================= */

        if (!response.ok) {

            throw new Error(
                data.details ||
                data.error ||
                "Server error: " + response.status
            );

        }


        /* =========================
           CHECK AI RESULT
        ========================= */

        if (
            !data.result ||
            typeof data.result !== "string" ||
            data.result.trim() === ""
        ) {

            throw new Error(
                "AI ने empty review दिया।"
            );

        }


        /* =========================
           CLEAN RESULT
        ========================= */

        let review =
            cleanReviewOutput(data.result);


        if (review === "") {

            throw new Error(
                "AI review खाली है।"
            );

        }


        /* =========================
           FRONTEND SAFETY FILTER
        ========================= */

        review =
            filterFakeClaims(
                review,
                product,
                brand,
                cleanRating
            );


        /* =========================
           SHOW RESULT
        ========================= */

        result.value =
            review;


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


/* =========================================
   CLEAN AI RESPONSE
   ========================================= */

function cleanReviewOutput(text) {

    let cleaned =
        text.trim();


    /* Remove markdown code fences */

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


    /* Remove unnecessary headings */

    cleaned =
        cleaned.replace(
            /^#+\s*Product Review\s*:?\s*/i,
            ""
        );


    cleaned =
        cleaned.replace(
            /^#+\s*Review\s*:?\s*/i,
            ""
        );


    return cleaned.trim();

}


/* =========================================
   FRONTEND FAKE CLAIM FILTER
   ========================================= */

function filterFakeClaims(
    text,
    product,
    brand,
    rating
) {

    let cleaned =
        text.trim();


    /*
     * Remove common fake claims.
     * We do not replace them with new claims.
     */

    const forbiddenPatterns = [

        /\bexcellent quality\b/gi,

        /\bpremium quality\b/gi,

        /\bhigh quality\b/gi,

        /\bcomfortable\b/gi,

        /\bcomfort\b/gi,

        /\bdurable\b/gi,

        /\bdurability\b/gi,

        /\bstylish design\b/gi,

        /\bworth the price\b/gi,

        /\bvalue for money\b/gi,

        /\bgreat value\b/gi,

        /\bhighly recommended\b/gi,

        /\bhighly recommend\b/gi,

        /\bI recommend\b/gi,

        /\bI purchased\b/gi,

        /\bI bought\b/gi,

        /\bI have been using\b/gi,

        /\bI have used\b/gi,

        /\bmy experience\b/gi,

        /\bI am satisfied\b/gi,

        /\bI'm satisfied\b/gi,

        /\bexceeded my expectations\b/gi,

        /\bperfect product\b/gi,

        /\bbest product\b/gi

    ];


    forbiddenPatterns.forEach(
        function(pattern) {

            cleaned =
                cleaned.replace(
                    pattern,
                    ""
                );

        }
    );


    /*
     * Remove extra blank spaces.
     */

    cleaned =
        cleaned.replace(
            /[ \t]{2,}/g,
            " "
        );


    cleaned =
        cleaned.replace(
            /\n{3,}/g,
            "\n\n"
        );


    /*
     * Make sure rating exists.
     */

    if (
        !cleaned
            .toLowerCase()
            .includes("rating:")
    ) {

        cleaned =
            "Rating: " +
            rating +
            "\n\n" +
            cleaned;

    }


    /*
     * Make sure product name is present.
     */

    if (
        !cleaned
            .toLowerCase()
            .includes(
                product.toLowerCase()
            )
    ) {

        cleaned =
            "Rating: " +
            rating +
            "\n\n" +
            "Review: " +
            product +
            ".\n\n" +
            cleaned
                .replace(
                    /^Rating:.*$/im,
                    ""
                )
                .trim();

    }


    return cleaned.trim();

}


/* =========================================
   COPY REVIEW
   ========================================= */

function copyReview() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


    if (text === "") {

        alert(
            "पहले Review generate करें।"
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


    /* Clipboard API */

    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        navigator.clipboard
            .writeText(text)

            .then(function() {

                alert(
                    "✅ Review copied successfully!"
                );

            })

            .catch(function() {

                fallbackCopy(text);

            });

    } else {

        fallbackCopy(text);

    }

}


/* =========================================
   COPY FALLBACK
   ========================================= */

function fallbackCopy(text) {

    const textarea =
        document.createElement("textarea");


    textarea.value =
        text;


    textarea.style.position =
        "fixed";


    textarea.style.left =
        "-9999px";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    try {

        document.execCommand(
            "copy"
        );

        alert(
            "✅ Review copied successfully!"
        );

    } catch (error) {

        alert(
            "❌ Copy नहीं हो सका।"
        );

    }


    document.body.removeChild(
        textarea
    );

}
