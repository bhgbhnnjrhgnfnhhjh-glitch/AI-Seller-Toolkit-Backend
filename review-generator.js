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


    // Product जरूरी है
    if (product === "") {

        alert("Please enter Product Name.");
        return;

    }


    // Loading message
    result.value =
        "⏳ AI customer review बना रहा है...";


    // Gemini Prompt
    const prompt = `
You are a professional eCommerce customer review writer.

Create ONE natural and realistic customer-style review
using ONLY the information provided below.

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

2. Do NOT invent product specifications.

3. Do NOT invent:
- comfort
- durability
- softness
- quality
- fitting
- size
- weight
- price
- delivery
- packaging
- warranty
- return policy
- performance
- material benefits

unless that information was explicitly provided.

4. Do NOT say the product is "excellent",
"amazing", "premium", "best", "superior"
or "high quality" unless those facts were provided.

5. Do NOT create fake customer experiences.

6. Do NOT claim that the customer used the product
for a specific number of days.

7. Do NOT mention information that was not supplied.

8. Keep the exact product type.

9. Use the exact brand name when provided.

10. The review should sound natural and simple.

11. Match the selected Review Style.

12. Do not mention AI.

13. Do not use emojis.

14. Do not add fake prices or offers.

15. Do not create fake specifications.

16. The rating must be represented exactly as provided.

17. Do not repeat the product name unnecessarily.


REVIEW STYLE
------------

Professional:
Write a clean and professional customer review.

Customer Experience:
Write a natural customer-style review based only
on the supplied information.

Short Review:
Write a short review of approximately 1-2 sentences.

Detailed Review:
Write a somewhat detailed review using only
the supplied information.


IMPORTANT
---------

If very little product information is available,
keep the review short rather than inventing information.

The review can simply describe the supplied product,
brand and rating.

Do NOT create imaginary experiences.


OUTPUT FORMAT
-------------

Rating: ${rating}

[Customer review]


Return ONLY the final review.
`;


    try {

        // Send request to Gemini Backend
        const response =
            await fetch(
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


        // Check server error
        if (!response.ok) {

            throw new Error(
                data.details ||
                data.error ||
                "Server error"
            );

        }


        // Check empty response
        if (
            !data.result ||
            !data.result.trim()
        ) {

            throw new Error(
                "AI returned an empty response."
            );

        }


        // Show result
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
            "पहले review successfully generate करें।"
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
