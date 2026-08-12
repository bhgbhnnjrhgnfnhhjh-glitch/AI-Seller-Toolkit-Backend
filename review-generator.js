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
        "⏳ AI review बना रहा है...";


    // Rating को साफ करें
    let cleanRating = "5/5";

    if (rating.includes("4/5")) {
        cleanRating = "4/5";
    }

    if (rating.includes("3/5")) {
        cleanRating = "3/5";
    }


    const prompt = `
You are a professional eCommerce product review writer.

Create ONE natural customer-style product review.

Product Name:
${product}

Brand:
${brand || "Not specified"}

Rating:
${cleanRating}

Review Style:
${style}


IMPORTANT RULES:

- Use ONLY the information provided.
- Do not invent product specifications.
- Do not invent comfort, durability, quality or performance.
- Do not invent price or delivery information.
- Do not invent customer experience.
- Do not claim the customer used the product for a certain time.
- Do not add information that was not provided.
- Keep the exact product name.
- Keep the exact brand name.
- Do not mention AI.
- Do not use emojis.
- Keep the review natural and easy to understand.
- Do not repeat the product name unnecessarily.
- Do not use fake claims.

If there is not enough information for a detailed review,
write a short factual review instead.

OUTPUT:

Rating: ${cleanRating}

[Review text]

Return ONLY the rating and review.
`;


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


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.details ||
                data.error ||
                "Backend server error"
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
            data.result.trim();


    } catch (error) {

        console.error(
            "Review Generator Error:",
            error
        );


        result.value =
            "❌ Review generate नहीं हो सकी.\n\n" +
            "Error: " +
            error.message +
            "\n\n" +
            "कृपया Backend URL और Internet connection check करें।";

    }

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
