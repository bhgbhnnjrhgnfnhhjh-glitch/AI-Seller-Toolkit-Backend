async function generatePrompt() {

    const product =
        document.getElementById("product").value.trim();

    const brand =
        document.getElementById("brand").value.trim();

    const color =
        document.getElementById("color").value.trim();

    const material =
        document.getElementById("material").value.trim();

    const background =
        document.getElementById("background").value;

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
        "⏳ AI image prompt बनाया जा रहा है...";


    const prompt = `
You are a professional eCommerce product photography prompt writer.

Create ONE professional AI image-generation prompt for the product below.

PRODUCT INFORMATION
-------------------

Product Name:
${product}

Brand:
${brand || "Not specified"}

Color:
${color || "Not specified"}

Material:
${material || "Not specified"}

Background Style:
${background}

Image Style:
${style}


STRICT RULES
------------

1. Use ONLY the information provided.

2. Do NOT invent product specifications.

3. Do NOT invent product features.

4. Do NOT invent product colors.

5. Do NOT invent material.

6. Do NOT add "Premium", "Luxury", "High Quality",
"Durable", "Soft", "Comfortable" or similar claims
unless the user provided them.

7. Keep the exact product type.

8. Do not change the product into another product.

9. Brand should be included only when provided.

10. Color should be included only when provided.

11. Material should be included only when provided.

12. Create a realistic professional eCommerce product image prompt.

13. Use the selected background style.

14. Use the selected image style.

15. Include suitable studio lighting and realistic shadows.

16. Include centered product composition.

17. Do not add fake specifications.

18. Do not mention AI.

19. Do not use emojis.

20. Do not add explanations before or after the prompt.


MARKETPLACE REQUIREMENTS
------------------------

The image should be suitable for:

Amazon
Flipkart
Meesho
Shopify
Etsy

Keep the product clearly visible.

Avoid unnecessary objects.

Avoid unnecessary text inside the image.

Avoid watermarks.

Avoid logos unless the supplied brand is explicitly provided.


OUTPUT
------

Return ONLY the final image-generation prompt.
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
            cleanPromptOutput(
                data.result
            );


    } catch (error) {

        console.error(
            "Image Prompt AI Error:",
            error
        );


        result.value =
            "❌ AI image prompt नहीं बन सका.\n\n" +
            "Error: " +
            error.message;

    }

}


/* =========================
   CLEAN AI RESPONSE
========================= */

function cleanPromptOutput(text) {

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
   COPY PROMPT
========================= */

function copyPrompt() {

    const result =
        document.getElementById("result");

    const text =
        result.value.trim();


    if (text === "") {

        alert(
            "पहले AI Image Prompt generate करें।"
        );

        return;

    }


    if (
        text.includes(
            "❌ AI image prompt नहीं बन सका"
        )
    ) {

        alert(
            "पहले successfully prompt generate करें।"
        );

        return;

    }


    navigator.clipboard
        .writeText(text)

        .then(function () {

            alert(
                "✅ AI Image Prompt copied successfully!"
            );

        })

        .catch(function () {

            alert(
                "❌ Copy नहीं हो सका।"
            );

        });

}
