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
You are a professional eCommerce review writing assistant.

Create ONE natural-sounding customer review based ONLY on the information provided.

PRODUCT INFORMATION
-------------------

Product Name:
${product}

Brand:
${brand || "Not specified"}

Rating:
${rating}

Review Style:
${style}


STRICT RULES
------------

1. Use ONLY the information provided.

2. Do NOT invent product features.

3. Do NOT invent material.

4. Do NOT invent color.

5. Do NOT invent size.

6. Do NOT invent comfort.

7. Do NOT invent durability.

8. Do NOT invent delivery experience.

9. Do NOT invent price or value for money.

10. Do NOT claim the customer actually used the product unless
the user provided that information.

11. Do NOT create fake specifications.

12. Do NOT create fake personal experiences.

13. Keep the exact product name.

14. Mention the brand only when it is provided.

15. The review should match the selected rating.

16. Do not use exaggerated claims.

17. Do not mention AI.

18. Do not use emojis.

19. Keep the review natural and concise.

20. Do not invent information just to make the review longer.


RATING GUIDELINES
-----------------

5 stars:
Do NOT say "excellent", "best", "amazing", "high quality",
"worth the price", "highly recommended" or similar claims
unless the user explicitly provides those facts.

If only Product Name, Brand and Rating are provided,
write a simple factual review that mentions only those details.

4 stars:
Do not invent positive product qualities.

3 stars:
Use neutral factual wording.

2 stars:
Do not invent negative experiences or problems.

1 star:
Do not invent negative experiences or problems.

STYLE GUIDELINES
----------------

Professional:
Write a clean and professional review.

Customer Experience:
Write a natural customer-style review, but do not invent personal experiences.

Short Review:
Keep the review very short and concise.


IMPORTANT
---------

This tool must NOT create fake customer experiences.

If there is not enough information for a detailed review,
write a short factual review using only the available information.


OUTPUT FORMAT
-------------

Return ONLY the review.

Do not add:
- Heading
- Explanation
- Notes
- Numbering
- Quotation marks
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


        result.value =
            cleanReviewOutput(
                data.result
            );


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


/* =========================
   CLEAN AI RESPONSE
========================= */

function cleanReviewOutput(text) {

    let cleaned =
        text.trim();


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


    return cleaned.trim();

}


/* =========================
   COPY REVIEW
========================= */

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

        .then(function () {

            alert(
                "✅ Review copied successfully!"
            );

        })

        .catch(function () {

            alert(
                "❌ Copy नहीं हो सका।"
            );

        });

}
