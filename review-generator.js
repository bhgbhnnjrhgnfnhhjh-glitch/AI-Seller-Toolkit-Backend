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
You are a factual eCommerce content writer.

Create a very short product review sentence.

PRODUCT:
${product}

BRAND:
${brand || "Not specified"}

STYLE:
${style}


IMPORTANT:

The rating is provided only for internal context.

DO NOT mention the rating in the output.

DO NOT write:
- 5 star
- five star
- five out of five
- 5/5
- rating
- rated
- receives a rating
- deserves a rating
- merits a rating

Do not mention any rating number or rating phrase.

Do not invent customer experience.

Do not say the customer purchased, used, tested,
received or tried the product.

Do not invent product quality.

Do not invent:
- comfort
- durability
- material
- color
- size
- price
- value for money
- features
- benefits
- delivery
- warranty
- recommendation

Do not use:
excellent
amazing
best
great
premium
high quality
superb
outstanding
perfect
impressive
stylish
comfortable
durable
recommended

Use ONLY the Product Name and Brand supplied above.

Keep the exact product type.

Return ONLY ONE short factual sentence.

Example:

Black Cotton T-Shirt by Fashion Hud.

Do not add anything else.
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


        /*
        =====================================
        IMPORTANT:
        We don't trust the AI output blindly.
        =====================================
        */

        let review =
            data.result.trim();


        /*
        Remove markdown
        */

        review =
            review.replace(
                /^```[a-zA-Z]*\s*/i,
                ""
            );

        review =
            review.replace(
                /\s*```$/i,
                ""
            );


        /*
        =====================================
        If AI mentions rating, discard its
        generated sentence completely.
        =====================================
        */

        const ratingWords = [

            "rating",
            "rated",
            "five star",
            "five-star",
            "five out of five",
            "5 star",
            "5-star",
            "5/5",
            "four star",
            "four-star",
            "4 star",
            "4-star",
            "three star",
            "three-star",
            "3 star",
            "3-star",
            "two star",
            "two-star",
            "2 star",
            "2-star",
            "one star",
            "one-star",
            "1 star",
            "1-star"

        ];


        const lowerReview =
            review.toLowerCase();


        const containsRating =
            ratingWords.some(
                function(word) {

                    return lowerReview.includes(word);

                }
            );


        /*
        =====================================
        If rating detected, use our own
        factual sentence.
        =====================================
        */

        if (containsRating) {

            review =
                product +
                (
                    brand
                        ? " by " + brand
                        : ""
                ) +
                ".";

        }


        /*
        =====================================
        Remove common unsupported claims
        =====================================
        */

        const unsafeWords = [

            "excellent",
            "amazing",
            "best",
            "great",
            "premium",
            "high quality",
            "high-quality",
            "superb",
            "outstanding",
            "perfect",
            "impressive",
            "stylish",
            "comfortable",
            "durable",
            "recommended",
            "worth the price",
            "value for money"

        ];


        const hasUnsafeClaim =
            unsafeWords.some(
                function(word) {

                    return review
                        .toLowerCase()
                        .includes(word);

                }
            );


        /*
        If AI generated an unsupported claim,
        use the safe factual sentence.
        */

        if (hasUnsafeClaim) {

            review =
                product +
                (
                    brand
                        ? " by " + brand
                        : ""
                ) +
                ".";

        }


        /*
        Final clean-up
        */

        review =
            review
                .replace(/\s{2,}/g, " ")
                .trim();


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
